#!/usr/bin/env python3
"""Hardened Local Static & Google Cloud Chirp 3 HD Server for Marvel Multiverse Atlas.

Mirrors server.js security headers (strict CSP, X-Frame-Options: DENY, nosniff,
Referrer-Policy, Permissions-Policy), path traversal guards, and /api/tts endpoints
so the portal runs cleanly with either Node.js (`npm start`) or Python 3 (`python3 server.py`).
"""

from __future__ import annotations

import base64
import hashlib
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import subprocess
import urllib.parse
import urllib.request

ROOT_DIR = Path(__file__).resolve().parent
PUBLIC_DIR = (ROOT_DIR / "public").resolve()
TTS_CACHE_DIR = (ROOT_DIR / ".tts_cache").resolve()
TTS_CACHE_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_HOSTS = {"127.0.0.1", "0.0.0.0", "::"}
HOST = os.environ.get("HOST", "127.0.0.1")
if HOST not in ALLOWED_HOSTS:
  HOST = "127.0.0.1"
PORT = int(os.environ.get("PORT", "4190"))

CSP_HEADER = (
    "default-src 'self'; script-src 'self'; style-src 'self'; "
    "img-src 'self' data:; media-src 'self' data: blob:; connect-src 'self'; "
    "font-src 'self'; object-src 'none'; base-uri 'self'; "
    "frame-ancestors 'none'; form-action 'none';"
)

MIME_BY_EXT = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".mp3": "audio/mpeg",
    ".ico": "image/x-icon",
    ".json": "application/json; charset=utf-8",
}

CHIRP_LOCALE_BY_LANG = {
    "en": "en-US",
    "es": "es-ES",
    "zh": "cmn-CN",
    "yue": "yue-HK",
    "ja": "ja-JP",
    "ko": "ko-KR",
    "pt": "pt-BR",
    "fr": "fr-FR",
    "it": "it-IT",
    "de": "de-DE",
    "ar": "ar-XA",
}

ALLOWED_PERSONAS = ("Aoede", "Puck", "Fenrir", "Kore", "Leda", "Charon", "Orus", "Zephyr")


def get_gcp_creds() -> tuple[str, str]:
  token = os.environ.get("GOOGLE_OAUTH_ACCESS_TOKEN", "").strip()
  project = (
      os.environ.get("GOOGLE_CLOUD_PROJECT")
      or os.environ.get("GCLOUD_PROJECT")
      or "project-maui"
  ).strip()
  if token and project:
    return token, project
  try:
    token = subprocess.check_output(
        ["gcloud", "auth", "print-access-token"],
        stderr=subprocess.DEVNULL,
        timeout=4,
        text=True,
    ).strip()
    return token, project
  except Exception:
    return "", ""


class MarvelAtlasHandler(BaseHTTPRequestHandler):

  def log_message(self, fmt: str, *args) -> None:
    return

  def _send_security_headers(self, immutable: bool = False) -> None:
    self.send_header("Content-Security-Policy", CSP_HEADER)
    self.send_header("X-Content-Type-Options", "nosniff")
    self.send_header("X-Frame-Options", "DENY")
    self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
    self.send_header(
        "Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()"
    )
    self.send_header(
        "Cache-Control",
        "public, max-age=3600, stale-while-revalidate=86400"
        if immutable
        else "no-store",
    )

  def _handle_req(self, head_only: bool) -> None:
    parsed = urllib.parse.urlsplit(self.path)
    pathname = parsed.path or "/"

    if pathname == "/api/tts/status":
      token, project = get_gcp_creds()
      body = json.dumps({
          "available": bool(token and project),
          "engine": "Google Cloud TTS Chirp3-HD",
          "languages": list(CHIRP_LOCALE_BY_LANG.keys()),
          "personas": list(ALLOWED_PERSONAS),
      }).encode("utf-8")
      self.send_response(HTTPStatus.OK)
      self._send_security_headers(False)
      self.send_header("Content-Type", "application/json; charset=utf-8")
      self.send_header("Content-Length", str(len(body)))
      self.end_headers()
      if not head_only:
        self.wfile.write(body)
      return

    if pathname == "/api/tts":
      qs = urllib.parse.parse_qs(parsed.query)
      lang = (qs.get("lang", ["en"])[0]).strip().lower()
      persona = (qs.get("persona", ["Orus"])[0]).strip()
      if persona not in ALLOWED_PERSONAS:
        persona = "Orus"
      text = (qs.get("text", [""])[0]).strip()[:1000]
      locale = CHIRP_LOCALE_BY_LANG.get(lang)
      if not locale or not text:
        self.send_response(HTTPStatus.BAD_REQUEST)
        self._send_security_headers(False)
        self.end_headers()
        return

      voice_name = f"{locale}-Chirp3-HD-{persona}"
      digest = hashlib.sha256(f"{voice_name}|{text}".encode("utf-8")).hexdigest()
      cache_file = TTS_CACHE_DIR / f"{digest}.mp3"
      if cache_file.is_file() and cache_file.stat().st_size > 128:
        mp3 = cache_file.read_bytes()
        self.send_response(HTTPStatus.OK)
        self._send_security_headers(True)
        self.send_header("Content-Type", "audio/mpeg")
        self.send_header("Content-Length", str(len(mp3)))
        self.end_headers()
        if not head_only:
          self.wfile.write(mp3)
        return

      token, project = get_gcp_creds()
      if not token:
        self.send_response(HTTPStatus.SERVICE_UNAVAILABLE)
        self._send_security_headers(False)
        self.end_headers()
        return

      try:
        req_payload = json.dumps({
            "input": {"text": text},
            "voice": {"languageCode": locale, "name": voice_name},
            "audioConfig": {"audioEncoding": "MP3", "speakingRate": 1.0},
        }).encode("utf-8")
        req = urllib.request.Request(
            "https://texttospeech.googleapis.com/v1/text:synthesize",
            data=req_payload,
            headers={
                "Authorization": f"Bearer {token}",
                "x-goog-user-project": project,
                "Content-Type": "application/json; charset=utf-8",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
          data = json.loads(resp.read().decode("utf-8"))
          mp3 = base64.b64decode(data["audioContent"])
          cache_file.write_bytes(mp3)
          self.send_response(HTTPStatus.OK)
          self._send_security_headers(True)
          self.send_header("Content-Type", "audio/mpeg")
          self.send_header("Content-Length", str(len(mp3)))
          self.end_headers()
          if not head_only:
            self.wfile.write(mp3)
          return
      except Exception:
        self.send_response(HTTPStatus.SERVICE_UNAVAILABLE)
        self._send_security_headers(False)
        self.end_headers()
        return

    try:
      decoded = urllib.parse.unquote(pathname)
    except Exception:
      self.send_response(HTTPStatus.BAD_REQUEST)
      self._send_security_headers(False)
      self.end_headers()
      return

    if "\x00" in decoded or any(seg.startswith(".") for seg in decoded.split("/") if seg):
      self.send_response(HTTPStatus.FORBIDDEN)
      self._send_security_headers(False)
      self.end_headers()
      return

    rel = "index.html" if decoded == "/" else decoded.lstrip("/")
    candidate = (PUBLIC_DIR / rel).resolve()
    if not str(candidate).startswith(str(PUBLIC_DIR) + os.sep) or not candidate.is_file():
      self.send_response(HTTPStatus.NOT_FOUND)
      self._send_security_headers(False)
      self.end_headers()
      return

    ext = candidate.suffix.lower()
    mime = MIME_BY_EXT.get(ext)
    if not mime:
      self.send_response(HTTPStatus.NOT_FOUND)
      self._send_security_headers(False)
      self.end_headers()
      return

    content = candidate.read_bytes()
    etag = f'"{hashlib.sha256(content).hexdigest()[:24]}"'
    if self.headers.get("If-None-Match") == etag:
      self.send_response(HTTPStatus.NOT_MODIFIED)
      self._send_security_headers(ext in {".svg", ".png", ".jpg", ".jpeg", ".webp", ".ico"})
      self.send_header("ETag", etag)
      self.end_headers()
      return

    self.send_response(HTTPStatus.OK)
    self._send_security_headers(ext in {".svg", ".png", ".jpg", ".jpeg", ".webp", ".ico"})
    self.send_header("Content-Type", mime)
    self.send_header("Content-Length", str(len(content)))
    self.send_header("ETag", etag)
    self.end_headers()
    if not head_only:
      self.wfile.write(content)

  def do_GET(self) -> None:
    self._handle_req(False)

  def do_HEAD(self) -> None:
    self._handle_req(True)

  def do_POST(self) -> None:
    self.send_response(HTTPStatus.METHOD_NOT_ALLOWED)
    self._send_security_headers(False)
    self.send_header("Allow", "GET, HEAD")
    self.end_headers()


if __name__ == "__main__":
  import argparse
  parser = argparse.ArgumentParser(description="Marvel Multiverse Atlas Server")
  parser.add_argument("--host", default=HOST)
  parser.add_argument("--port", type=int, default=PORT)
  args = parser.parse_args()
  bind_host = args.host if args.host in ALLOWED_HOSTS else "127.0.0.1"
  httpd = ThreadingHTTPServer((bind_host, args.port), MarvelAtlasHandler)
  print(f"Marvel Multiverse Atlas server listening on http://{bind_host}:{args.port}", flush=True)
  httpd.serve_forever()
