"""Automated Python Verification Suite for Marvel Multiverse & Omnibus Atlas."""

import json
import os
from pathlib import Path
import re
import subprocess
import time
import unittest
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"


class MarvelAtlasVerificationTest(unittest.TestCase):

  def test_zero_xss_and_zero_inline_styles(self):
    forbidden_sink = re.compile(r"\.(innerHTML|outerHTML|insertAdjacentHTML)\s*=|document\.write\s*\(")
    inline_style = re.compile(r"\sstyle\s*=\s*[\"']")
    for rel in ("index.html", "js/app.js", "js/ui/dom.js", "js/ui/map.js", "js/data/artwork.js"):
      content = (PUBLIC / rel).read_text(encoding="utf-8")
      self.assertIsNone(forbidden_sink.search(content), f"Forbidden XSS sink in {rel}")
      self.assertIsNone(inline_style.search(content), f"Forbidden inline style in {rel}")

  def test_dataset_scale_and_11_languages(self):
    chars_js = (PUBLIC / "js/data/characters.js").read_text(encoding="utf-8")
    i18n_js = (PUBLIC / "js/i18n.js").read_text(encoding="utf-8")
    self.assertGreaterEqual(chars_js.count("civilian:"), 76)
    self.assertGreaterEqual(chars_js.count("{ id: '"), 216)
    for lang in ("en", "es", "zh", "yue", "ja", "ko", "pt", "fr", "it", "de", "ar"):
      self.assertIn(f"'{lang}'", i18n_js)

  def test_real_archived_collector_artwork_integrity(self):
    manifest_path = PUBLIC / "js/data/art_manifest.js"
    self.assertTrue(manifest_path.exists(), "art_manifest.js missing")
    raw = manifest_path.read_text(encoding="utf-8")
    m = json.loads(raw[raw.index("{", raw.index("MANIFEST =")):raw.rindex("};") + 1])

    chars_src = (PUBLIC / "js/data/characters.js").read_text(encoding="utf-8")
    char_ids = [b.split("'", 1)[0] for b in re.split(r"\n    \{\n      id: '", chars_src)[1:]]
    self.assertEqual(len(char_ids), 76)
    self.assertGreaterEqual(len(m["variants"]), 100)

    for cid in char_ids:
      self.assertIn(cid, m["characters"], f"Missing archived portrait for character '{cid}'")

    for bucket in ("characters", "variants"):
      for key, meta in m[bucket].items():
        rel_path = meta["localPath"]
        self.assertTrue(rel_path.startswith("./assets/art/"), f"Non-relative art path for {key}: {rel_path}")
        disk_file = PUBLIC / rel_path.lstrip("./")
        self.assertTrue(disk_file.exists(), f"Art file missing on disk: {disk_file}")
        header = disk_file.read_bytes()[:12]
        is_valid_raster = (
            header[:3] == b"\xff\xd8\xff"
            or header[:8] == b"\x89PNG\r\n\x1a\n"
            or (header[:4] == b"RIFF" and header[8:12] == b"WEBP")
        )
        self.assertTrue(is_valid_raster, f"Invalid image header for {disk_file}")

  def test_hardened_http_headers_and_traversal_defense(self):
    env = os.environ.copy()
    env["PORT"] = "4199"
    env["HOST"] = "127.0.0.1"
    for k in ("http_proxy", "https_proxy", "HTTP_PROXY", "HTTPS_PROXY"):
      env.pop(k, None)
    proc = subprocess.Popen(
        ["python3", str(ROOT / "server.py")],
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    try:
      time.sleep(0.6)
      with opener.open("http://127.0.0.1:4199/") as resp:
        self.assertEqual(resp.status, 200)
        self.assertIn("default-src 'self'", resp.headers.get("Content-Security-Policy", ""))
        self.assertEqual(resp.headers.get("X-Frame-Options"), "DENY")
        self.assertEqual(resp.headers.get("X-Content-Type-Options"), "nosniff")

      with opener.open("http://127.0.0.1:4199/assets/art/wolverine.webp") as img_resp:
        self.assertEqual(img_resp.status, 200)
        self.assertEqual(img_resp.headers.get("Content-Type"), "image/webp")

      post_req = urllib.request.Request("http://127.0.0.1:4199/", method="POST")
      with self.assertRaises(urllib.error.HTTPError) as ctx:
        opener.open(post_req)
      self.assertEqual(ctx.exception.code, 405)

      with self.assertRaises(urllib.error.HTTPError) as trav_ctx:
        opener.open("http://127.0.0.1:4199/../package.json")
      self.assertIn(trav_ctx.exception.code, (403, 404))
    finally:
      proc.terminate()
      proc.wait(timeout=5)


if __name__ == "__main__":
  unittest.main()
