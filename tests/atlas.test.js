/**
 * Automated Verification & Security Suite for Marvel Multiverse & Omnibus Atlas
 * Run via: npm test (uses Node built-in node:test & node:assert/strict)
 */

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

const { MARVEL_DATA, MARVEL_HELPERS } = require('../public/js/data/index.js');
const MARVEL_ARTWORK = require('../public/js/data/artwork.js');
const MARVEL_I18N = require('../public/js/i18n.js');
const MARVEL_AUDIO = require('../public/js/audio.js');
const { createAtlasServer, CHIRP_LOCALE_BY_LANG, ALLOWED_CHIRP_PERSONAS } = require('../server.js');

const EXPECTED_LANGUAGES = ['en', 'es', 'zh', 'yue', 'ja', 'ko', 'pt', 'fr', 'it', 'de', 'ar'];

function requestLocal(port, method, reqPath) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname: '127.0.0.1', port, method, path: reqPath },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () =>
          resolve({ statusCode: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) })
        );
      }
    );
    req.on('error', reject);
    req.end();
  });
}

test('Marvel Omnibus dataset completeness: 56+ icons, 180+ multiverse variants, 12 realities, 14 Omegas, 6 Gems', () => {
  assert.ok(MARVEL_DATA.characters.length >= 56, `Expected >=56 icons, got ${MARVEL_DATA.characters.length}`);
  assert.ok(MARVEL_DATA.totalVariantsCount >= 180, `Expected >=180 variants, got ${MARVEL_DATA.totalVariantsCount}`);
  assert.equal(MARVEL_DATA.realities.length, 12);
  assert.equal(MARVEL_DATA.factions.length, 6);
  assert.equal(MARVEL_DATA.origins.length, 6);
  assert.equal(MARVEL_DATA.omegaMutants.length, 14);
  assert.equal(MARVEL_DATA.infinityStones.length, 6);

  const originIds = new Set(MARVEL_DATA.origins.map((o) => o.id));
  const charIds = new Set();

  for (const ch of MARVEL_DATA.characters) {
    assert.ok(!charIds.has(ch.id), `Duplicate character id ${ch.id}`);
    charIds.add(ch.id);
    assert.ok(originIds.has(ch.origin), `Invalid origin ${ch.origin} on ${ch.id}`);
    assert.ok(ch.firstAppearance && ch.firstAppearance.length > 5);
    assert.ok(ch.creators && ch.creators.length > 4);
    assert.ok(ch.kidBio.length > 30 && ch.adultBio.length > 40);
    assert.ok(Array.isArray(ch.variants) && ch.variants.length >= 2, `Expected >=2 variants on ${ch.id}`);

    const varIds = new Set();
    for (const v of ch.variants) {
      assert.ok(!varIds.has(v.id), `Duplicate variant ${v.id} on ${ch.id}`);
      varIds.add(v.id);
      assert.ok(v.earth && v.name && v.note);
      for (const k of ['intelligence', 'strength', 'speed', 'durability', 'energy', 'fighting']) {
        assert.ok(v.grid[k] >= 1 && v.grid[k] <= 7, `Invalid OHOTMU stat ${k} on ${ch.id}:${v.id}`);
      }
    }
  }
});

test('Variant resolver & 1v1 Battleworld clash math accurately differentiate Multiverse forms', () => {
  const doom = MARVEL_DATA.characters.find((c) => c.id === 'doctor-doom');
  const thor = MARVEL_DATA.characters.find((c) => c.id === 'thor');
  const wolverine = MARVEL_DATA.characters.find((c) => c.id === 'wolverine');

  const baseDoom = MARVEL_HELPERS.resolveCharacterVariant(doom, 'latverian-sovereign-616', 'multiverse');
  const godDoom = MARVEL_HELPERS.resolveCharacterVariant(doom, 'god-emperor-doom', 'multiverse');
  assert.ok(godDoom.powerScore > baseDoom.powerScore, 'God Emperor Doom must outscale baseline Doom');

  const clash = MARVEL_HELPERS.simulateClash(
    thor,
    'rune-king-thor',
    wolverine,
    'earth-616-prime',
    'multiverse'
  );
  assert.equal(clash.winnerState.character.id, 'thor');
  assert.equal(clash.verdictType, 'decisive');
});

test('11-language parity, RTL Arabic, Chirp 3 HD persona coverage & URL deep-link round-trip', () => {
  assert.deepEqual(Array.from(MARVEL_I18N.LANGUAGE_CODES), EXPECTED_LANGUAGES);
  assert.equal(MARVEL_I18N.getLanguageDir('ar'), 'rtl');
  assert.equal(MARVEL_I18N.getLanguageDir('en'), 'ltr');
  assert.equal(
    MARVEL_I18N.resolveLanguage({ search: '?lang=zh-HK', stored: 'en', navigatorLanguages: [] }),
    'yue'
  );

  for (const ch of MARVEL_DATA.characters) {
    const persona = MARVEL_AUDIO.getCharacterVoicePersona(ch);
    assert.ok(ALLOWED_CHIRP_PERSONAS.includes(persona));
  }

  const parsed = MARVEL_I18N.parseAtlasUrlState(
    '?lang=es&mode=adult&tab=arena&char=wolverine&variant=old-man-logan&fa=thor:rune-king-thor&fb=doctor-doom:god-emperor-doom'
  );
  assert.equal(parsed.lang, 'es');
  assert.equal(parsed.activeTab, 'arena');
  assert.equal(parsed.selectedCharacterId, 'wolverine');
  assert.equal(parsed.selectedVariantId, 'old-man-logan');
  assert.equal(parsed.fighterA.variantId, 'rune-king-thor');
  assert.equal(parsed.fighterB.variantId, 'god-emperor-doom');
});

test('Zero XSS sinks and zero inline style attributes across public HTML & JS', () => {
  const filesToScan = [
    path.join(PUBLIC_DIR, 'index.html'),
    path.join(PUBLIC_DIR, 'js', 'app.js'),
    path.join(PUBLIC_DIR, 'js', 'ui', 'dom.js'),
    path.join(PUBLIC_DIR, 'js', 'ui', 'map.js')
  ];
  const forbiddenSink = /\.(innerHTML|outerHTML|insertAdjacentHTML)\s*=|document\.write\s*\(/;
  for (const fp of filesToScan) {
    const content = fs.readFileSync(fp, 'utf8');
    assert.equal(forbiddenSink.test(content), false, `Forbidden DOM sink in ${fp}`);
    assert.equal(/\sstyle\s*=\s*["']/.test(content), false, `Forbidden inline style in ${fp}`);
  }
});

test('Hardened HTTP server enforces CSP, blocks path traversal & disallowed methods', async () => {
  const srv = createAtlasServer({ disableRemoteFetch: true });
  await new Promise((res) => srv.listen(0, '127.0.0.1', res));
  const port = srv.address().port;
  try {
    const indexRes = await requestLocal(port, 'GET', '/');
    assert.equal(indexRes.statusCode, 200);
    assert.ok((indexRes.headers['content-security-policy'] || '').includes("default-src 'self'"));
    assert.equal(indexRes.headers['x-frame-options'], 'DENY');

    const postRes = await requestLocal(port, 'POST', '/');
    assert.equal(postRes.statusCode, 405);

    const traversalRes = await requestLocal(port, 'GET', '/../package.json');
    assert.ok(traversalRes.statusCode === 403 || traversalRes.statusCode === 404);

    const ttsStatus = await requestLocal(port, 'GET', '/api/tts/status');
    assert.equal(ttsStatus.statusCode, 200);
    const json = JSON.parse(ttsStatus.body.toString('utf8'));
    assert.equal(Object.keys(CHIRP_LOCALE_BY_LANG).length, 11);
    assert.equal(json.personas.length, 8);
  } finally {
    await new Promise((res) => srv.close(res));
  }
});
