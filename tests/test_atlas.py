"""Automated Python + Headless Chromium Verification Suite for Marvel Multiverse Atlas."""

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
    for rel in ("index.html", "js/app.js", "js/ui/dom.js", "js/ui/map.js"):
      content = (PUBLIC / rel).read_text(encoding="utf-8")
      self.assertIsNone(forbidden_sink.search(content), f"Forbidden XSS sink in {rel}")
      self.assertIsNone(inline_style.search(content), f"Forbidden inline style in {rel}")

  def test_dataset_scale_and_11_languages(self):
    chars_js = (PUBLIC / "js/data/characters.js").read_text(encoding="utf-8")
    i18n_js = (PUBLIC / "js/i18n.js").read_text(encoding="utf-8")
    self.assertGreaterEqual(chars_js.count("civilian:"), 64)
    self.assertGreaterEqual(chars_js.count("{ id: '"), 191)
    for lang in ("en", "es", "zh", "yue", "ja", "ko", "pt", "fr", "it", "de", "ar"):
      self.assertIn(f"'{lang}'", i18n_js)

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
