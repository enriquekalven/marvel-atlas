/**
 * Marvel Multiverse & Omnibus Atlas — Hardened Local Static & Google Cloud Chirp 3 HD BFF Server
 *
 * Security controls implemented:
 * - Binds to 127.0.0.1 by default (configurable via HOST env for Cloudtop local proxy preview)
 * - HTTP method allow-list (GET and HEAD only; rejects POST/PUT/DELETE/TRACE with 405)
 * - Per-IP sliding-window rate limiting on all endpoints (429 Too Many Requests)
 * - Strict Content-Security-Policy (no unsafe-inline or unsafe-eval), X-Frame-Options: DENY,
 *   X-Content-Type-Options: nosniff, Permissions-Policy disabling unused browser APIs
 * - Path traversal protection enforcing fs.realpathSync containment inside REAL_PUBLIC_DIR + path.sep
 *   and strict file-extension allow-list
 * - Hardened Google Cloud Chirp 3 HD BFF (/api/tts & /api/tts/status): strict allow-lists on all 11
 *   Atlas of Wonder languages and Chirp3-HD personas, pinned HTTPS origin (texttospeech.googleapis.com),
 *   token resolved from env/ADC (never hardcoded), and SHA-256 disk/LRU cache outside web root
 * - Generic client error responses without stack trace leakage
 */

'use strict';

const http = require('node:http');
const https = require('node:https');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');

const ALLOWED_HOSTS = new Set(['127.0.0.1', '0.0.0.0', '::']);
const HOST = ALLOWED_HOSTS.has(process.env.HOST) ? process.env.HOST : '127.0.0.1';
const DEFAULT_PORT = Number(process.env.PORT) || 4190;
const PUBLIC_DIR = path.resolve(__dirname, 'public');
const TTS_CACHE_DIR = path.resolve(__dirname, '.tts_cache');

fs.mkdirSync(TTS_CACHE_DIR, { recursive: true });

function getRealPublicDir() {
  return fs.realpathSync(PUBLIC_DIR);
}

const MIME_BY_EXT = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.mp3', 'audio/mpeg'],
  ['.ico', 'image/x-icon'],
  ['.json', 'application/json; charset=utf-8']
]);

function resolveAccurateMimeType(fallbackMime, content) {
  if (
    !Buffer.isBuffer(content) ||
    content.length < 12 ||
    (!fallbackMime.startsWith('image/png') &&
      !fallbackMime.startsWith('image/jpeg') &&
      !fallbackMime.startsWith('image/webp'))
  ) {
    return fallbackMime;
  }
  if (
    content[0] === 0x89 &&
    content[1] === 0x50 &&
    content[2] === 0x4e &&
    content[3] === 0x47
  ) {
    return 'image/png';
  }
  if (content[0] === 0xff && content[1] === 0xd8 && content[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    content[0] === 0x52 &&
    content[1] === 0x49 &&
    content[2] === 0x46 &&
    content[3] === 0x46 &&
    content[8] === 0x57 &&
    content[9] === 0x45 &&
    content[10] === 0x42 &&
    content[11] === 0x50
  ) {
    return 'image/webp';
  }
  return fallbackMime;
}

const CHIRP_LOCALE_BY_LANG = Object.freeze({
  en: 'en-US',
  es: 'es-ES',
  zh: 'cmn-CN',
  yue: 'yue-HK',
  ja: 'ja-JP',
  ko: 'ko-KR',
  pt: 'pt-BR',
  fr: 'fr-FR',
  it: 'it-IT',
  de: 'de-DE',
  ar: 'ar-XA'
});

const ALLOWED_CHIRP_PERSONAS = Object.freeze([
  'Aoede',
  'Puck',
  'Fenrir',
  'Kore',
  'Leda',
  'Charon',
  'Orus',
  'Zephyr'
]);
const ALLOWED_PERSONA_SET = new Set(ALLOWED_CHIRP_PERSONAS);

const ttsMemoryCache = new Map();
const TTS_MEMORY_MAX = 256;
let cachedGcpCreds = { token: '', project: '', expiresAt: 0 };

function buildMetricsEnv() {
  const existing = process.env.CLOUDSDK_METRICS_ENVIRONMENT || '';
  const metricsEnv = existing.includes('datacloud.antigravity')
    ? existing
    : `${existing ? `${existing} ` : ''}datacloud.antigravity`;
  return { ...process.env, CLOUDSDK_METRICS_ENVIRONMENT: metricsEnv };
}

function getGcpCredentials() {
  const envToken = (process.env.GOOGLE_OAUTH_ACCESS_TOKEN || '').trim();
  const envProject = (
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCLOUD_PROJECT ||
    process.env.GCP_QUOTA_PROJECT ||
    ''
  ).trim();

  if (envToken && envProject) {
    return { token: envToken, project: envProject };
  }

  const now = Date.now();
  if (cachedGcpCreds.token && cachedGcpCreds.project && now < cachedGcpCreds.expiresAt) {
    return { token: cachedGcpCreds.token, project: cachedGcpCreds.project };
  }

  const env = buildMetricsEnv();
  try {
    const token =
      envToken ||
      execFileSync('gcloud', ['auth', 'print-access-token'], {
        encoding: 'utf8',
        timeout: 5000,
        env,
        stdio: ['ignore', 'pipe', 'ignore']
      }).trim();

    const project =
      envProject ||
      execFileSync('gcloud', ['config', 'get-value', 'project'], {
        encoding: 'utf8',
        timeout: 5000,
        env,
        stdio: ['ignore', 'pipe', 'ignore']
      }).trim() ||
      'project-maui';

    if (token && project && project !== '(unset)') {
      cachedGcpCreds = {
        token,
        project,
        expiresAt: now + 45 * 60 * 1000
      };
      return { token, project };
    }
  } catch (_err) {
    // Gracefully report unavailable when gcloud ADC is not present
  }
  return { token: '', project: '' };
}

function invalidateGcpCredentials() {
  cachedGcpCreds = { token: '', project: '', expiresAt: 0 };
}

function normalizeChirpText(rawText, lang) {
  let clean = String(rawText || '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}•·→←⚡🌀🔥🌊⛰️🍃🌕🛡️⚔️🏆💎🌌]/gu, ' ')
    .replace(/\s*[;؛]\s*/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();

  if (lang === 'zh' || lang === 'yue' || lang === 'ja') {
    clean = clean.replace(/([\u3040-\u30ff\u3400-\u9fff])\s+([\u3040-\u30ff\u3400-\u9fff])/g, '$1$2');
  }
  return clean.slice(0, 1200);
}

function callGoogleChirpOnce(text, locale, voiceName, speakingRate, token, project) {
  const bodyJson = JSON.stringify({
    input: { text },
    voice: { languageCode: locale, name: voiceName },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate
    }
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'texttospeech.googleapis.com',
        path: '/v1/text:synthesize',
        method: 'POST',
        timeout: 12000,
        headers: {
          Authorization: `Bearer ${token}`,
          'x-goog-user-project': project,
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Length': Buffer.byteLength(bodyJson, 'utf8')
        }
      },
      (upRes) => {
        const chunks = [];
        upRes.on('data', (c) => chunks.push(c));
        upRes.on('end', () => {
          const rawBody = Buffer.concat(chunks).toString('utf8');
          if (upRes.statusCode === 401) {
            invalidateGcpCredentials();
          }
          if (upRes.statusCode !== 200) {
            return reject(new Error(`TTS_HTTP_${upRes.statusCode}:${rawBody.slice(0, 200)}`));
          }
          try {
            const parsed = JSON.parse(rawBody);
            if (!parsed || typeof parsed.audioContent !== 'string') {
              return reject(new Error('TTS_EMPTY_AUDIO'));
            }
            const mp3Buf = Buffer.from(parsed.audioContent, 'base64');
            if (mp3Buf.length < 128) {
              return reject(new Error('TTS_SHORT_AUDIO'));
            }
            resolve(mp3Buf);
          } catch (err) {
            reject(err);
          }
        });
      }
    );

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('TTS_TIMEOUT'));
    });
    req.write(bodyJson);
    req.end();
  });
}

async function synthesizeWithSplitFallback(text, lang, locale, voiceName, rate, token, project) {
  try {
    return await callGoogleChirpOnce(text, locale, voiceName, rate, token, project);
  } catch (err) {
    const msg = String(err && err.message ? err.message : '');
    if (msg.includes('sentences that are too long') && text.length > 36) {
      const isCjk = lang === 'zh' || lang === 'yue' || lang === 'ja';
      const parts = text
        .split(/(?<=[.!?。！？؟])\s+/)
        .map((s) => s.trim())
        .filter(Boolean);
      let left = '';
      let right = '';
      if (parts.length > 1) {
        const mid = Math.floor(parts.length / 2);
        left = parts.slice(0, mid).join(' ');
        right = parts.slice(mid).join(' ');
      } else {
        const midChar = Math.floor(text.length / 2);
        const sep = isCjk ? '。' : '.';
        left = text.slice(0, midChar).trim() + sep;
        right = text.slice(midChar).trim();
      }
      const b1 = await synthesizeWithSplitFallback(left, lang, locale, voiceName, rate, token, project);
      const b2 = await synthesizeWithSplitFallback(right, lang, locale, voiceName, rate, token, project);
      return Buffer.concat([b1, b2]);
    }
    throw err;
  }
}

async function synthesizeChirpMp3(text, lang, locale, persona, speakingRate) {
  const voiceName = `${locale}-Chirp3-HD-${persona}`;
  const cacheHash = crypto
    .createHash('sha256')
    .update(`marvel_chirp_v1|${voiceName}|${speakingRate.toFixed(2)}|${text}`)
    .digest('hex');

  if (ttsMemoryCache.has(cacheHash)) {
    const hit = ttsMemoryCache.get(cacheHash);
    ttsMemoryCache.delete(cacheHash);
    ttsMemoryCache.set(cacheHash, hit);
    return { buffer: hit, voiceName, cacheHit: true };
  }

  const diskPath = path.join(TTS_CACHE_DIR, `${cacheHash}.mp3`);
  try {
    if (fs.existsSync(diskPath)) {
      const stat = fs.statSync(diskPath);
      if (stat.isFile() && stat.size >= 128) {
        const diskBuf = fs.readFileSync(diskPath);
        ttsMemoryCache.set(cacheHash, diskBuf);
        return { buffer: diskBuf, voiceName, cacheHit: true };
      }
    }
  } catch (_e) {
    // Ignore disk cache read errors
  }

  const { token, project } = getGcpCredentials();
  if (!token || !project) {
    return null;
  }

  const mp3Buf = await synthesizeWithSplitFallback(
    text,
    lang,
    locale,
    voiceName,
    speakingRate,
    token,
    project
  );

  if (ttsMemoryCache.size >= TTS_MEMORY_MAX) {
    const oldest = ttsMemoryCache.keys().next().value;
    ttsMemoryCache.delete(oldest);
  }
  ttsMemoryCache.set(cacheHash, mp3Buf);

  try {
    fs.writeFileSync(diskPath, mp3Buf);
  } catch (_e) {
    // Ignore disk cache write errors
  }

  return { buffer: mp3Buf, voiceName, cacheHit: false };
}

const RATE_WINDOW_MS = 10000;
const RATE_MAX_REQUESTS = 500;
const rateBuckets = new Map();

function checkRateLimit(remoteAddress) {
  const key = remoteAddress || '127.0.0.1';
  const now = Date.now();
  let bucket = rateBuckets.get(key);
  if (!bucket || now - bucket.windowStart > RATE_WINDOW_MS) {
    bucket = { windowStart: now, count: 0 };
    rateBuckets.set(key, bucket);
  }
  bucket.count += 1;
  return bucket.count <= RATE_MAX_REQUESTS;
}

const etagCache = new Map();

function setSecurityHeaders(res, cacheMode) {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; media-src 'self' data: blob:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'none';"
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.setHeader(
    'Cache-Control',
    cacheMode === 'immutable-asset'
      ? 'public, max-age=3600, stale-while-revalidate=86400'
      : 'no-store'
  );
}

function resolveSafePublicFile(rawPathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(rawPathname);
  } catch (_err) {
    return { error: 400 };
  }

  if (decoded.includes('\0')) {
    return { error: 400 };
  }

  const cleanParts = decoded.split('/').filter(Boolean);
  if (cleanParts.some((seg) => seg.startsWith('.'))) {
    return { error: 403 };
  }

  const realPublicDir = getRealPublicDir();
  const relativeReq = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
  const candidatePath = path.resolve(realPublicDir, relativeReq);

  if (!candidatePath.startsWith(realPublicDir + path.sep)) {
    return { error: 403 };
  }

  const ext = path.extname(candidatePath).toLowerCase();
  const mimeType = MIME_BY_EXT.get(ext);
  if (!mimeType) {
    return { error: 404 };
  }

  let realTarget;
  try {
    realTarget = fs.realpathSync(candidatePath);
  } catch (_err) {
    return { error: 404 };
  }

  if (!realTarget.startsWith(realPublicDir + path.sep)) {
    return { error: 403 };
  }

  let stat;
  try {
    stat = fs.statSync(realTarget);
  } catch (_err) {
    return { error: 404 };
  }

  if (!stat.isFile()) {
    return { error: 404 };
  }

  return {
    filePath: realTarget,
    mimeType,
    mtimeMs: stat.mtimeMs,
    size: stat.size,
    isStaticAsset:
      ext === '.svg' ||
      ext === '.png' ||
      ext === '.jpg' ||
      ext === '.jpeg' ||
      ext === '.webp' ||
      ext === '.ico'
  };
}

function computeETag(filePath, mtimeMs, size, buffer) {
  const cached = etagCache.get(filePath);
  if (cached && cached.mtimeMs === mtimeMs && cached.size === size) {
    return cached.etag;
  }
  const digest = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 24);
  const etag = `"${digest}"`;
  etagCache.set(filePath, { mtimeMs, size, etag });
  return etag;
}

function createAtlasServer(options) {
  const opts = options || {};
  const disableRemoteFetch = Boolean(opts.disableRemoteFetch);

  return http.createServer((req, res) => {
    if (!checkRateLimit(req.socket && req.socket.remoteAddress)) {
      setSecurityHeaders(res, 'no-store');
      res.writeHead(429, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Too Many Requests');
      return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      setSecurityHeaders(res, 'no-store');
      res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8', Allow: 'GET, HEAD' });
      res.end('Method Not Allowed');
      return;
    }

    let pathname = '/';
    let parsedUrl = null;
    try {
      parsedUrl = new URL(req.url || '/', `http://127.0.0.1:${DEFAULT_PORT}`);
      pathname = parsedUrl.pathname;
    } catch (_err) {
      setSecurityHeaders(res, 'no-store');
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Bad Request');
      return;
    }

    if (pathname === '/api/tts/status') {
      const creds = disableRemoteFetch ? { token: '', project: '' } : getGcpCredentials();
      const payload = Buffer.from(
        JSON.stringify({
          available: Boolean(creds.token && creds.project),
          engine: 'Google Cloud TTS Chirp3-HD',
          languages: Object.keys(CHIRP_LOCALE_BY_LANG),
          locales: Object.values(CHIRP_LOCALE_BY_LANG),
          personas: ALLOWED_CHIRP_PERSONAS
        }),
        'utf8'
      );
      setSecurityHeaders(res, 'no-store');
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': payload.length
      });
      if (req.method === 'HEAD') {
        res.end();
        return;
      }
      res.end(payload);
      return;
    }

    if (pathname === '/api/tts') {
      const rawLang = (parsedUrl.searchParams.get('lang') || 'en').trim().toLowerCase();
      const locale = CHIRP_LOCALE_BY_LANG[rawLang];
      const rawPersona = (parsedUrl.searchParams.get('persona') || 'Orus').trim();
      const persona = ALLOWED_PERSONA_SET.has(rawPersona) ? rawPersona : 'Orus';
      const rawRate = Number(parsedUrl.searchParams.get('rate') || 1.0);
      const rate = Number.isFinite(rawRate) ? Math.max(0.75, Math.min(1.3, rawRate)) : 1.0;
      const text = normalizeChirpText(parsedUrl.searchParams.get('text') || '', rawLang);

      if (!locale || !text) {
        setSecurityHeaders(res, 'no-store');
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Invalid TTS Parameters');
        return;
      }

      if (disableRemoteFetch) {
        setSecurityHeaders(res, 'no-store');
        res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Chirp3-HD Remote Synthesis Disabled');
        return;
      }

      synthesizeChirpMp3(text, rawLang, locale, persona, rate)
        .then((result) => {
          if (!result || !result.buffer) {
            setSecurityHeaders(res, 'no-store');
            res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Chirp3-HD Unavailable');
            return;
          }
          setSecurityHeaders(res, 'immutable-asset');
          res.setHeader('X-TTS-Engine', 'Chirp3-HD');
          res.setHeader('X-TTS-Voice', result.voiceName);
          res.setHeader('X-TTS-Cache', result.cacheHit ? 'HIT' : 'MISS');
          res.writeHead(200, {
            'Content-Type': 'audio/mpeg',
            'Content-Length': result.buffer.length
          });
          if (req.method === 'HEAD') {
            res.end();
            return;
          }
          res.end(result.buffer);
        })
        .catch(() => {
          if (!res.headersSent) {
            setSecurityHeaders(res, 'no-store');
            res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Chirp3-HD Synthesis Error');
          }
        });
      return;
    }

    const resolved = resolveSafePublicFile(pathname);
    if (resolved.error) {
      setSecurityHeaders(res, 'no-store');
      const status = resolved.error;
      const msg = status === 400 ? 'Bad Request' : status === 403 ? 'Forbidden' : 'Not Found';
      res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(msg);
      return;
    }

    setSecurityHeaders(res, resolved.isStaticAsset ? 'immutable-asset' : 'no-store');

    fs.readFile(resolved.filePath, (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Internal Server Error');
        return;
      }

      const etag = computeETag(resolved.filePath, resolved.mtimeMs, resolved.size, content);
      res.setHeader('ETag', etag);

      if (req.headers['if-none-match'] === etag) {
        res.writeHead(304);
        res.end();
        return;
      }

      const finalMimeType = resolveAccurateMimeType(resolved.mimeType, content);
      res.writeHead(200, {
        'Content-Type': finalMimeType,
        'Content-Length': content.length
      });

      if (req.method === 'HEAD') {
        res.end();
        return;
      }

      res.end(content);
    });
  });
}

if (require.main === module) {
  const server = createAtlasServer();
  server.listen(DEFAULT_PORT, HOST, () => {
    process.stdout.write(
      `Marvel Multiverse & Omnibus Atlas + Chirp3-HD listening on http://${HOST}:${DEFAULT_PORT}\n`
    );
  });
}

module.exports = {
  createAtlasServer,
  CHIRP_LOCALE_BY_LANG,
  ALLOWED_CHIRP_PERSONAS,
  normalizeChirpText,
  HOST,
  DEFAULT_PORT,
  PUBLIC_DIR
};
