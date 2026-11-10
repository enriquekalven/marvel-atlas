/**
 * Marvel Multiverse & Omnibus Atlas — Google Cloud Chirp 3: HD Audio Player & Web Speech Fallback
 */

(function initMarvelAudio(root) {
  'use strict';

  const CHIRP_PERSONAS = Object.freeze([
    'Aoede',
    'Puck',
    'Fenrir',
    'Kore',
    'Leda',
    'Charon',
    'Orus',
    'Zephyr'
  ]);

  const BCP47_BY_LANG = Object.freeze({
    en: 'en-US',
    es: 'es-ES',
    zh: 'zh-CN',
    yue: 'zh-HK',
    ja: 'ja-JP',
    ko: 'ko-KR',
    pt: 'pt-BR',
    fr: 'fr-FR',
    it: 'it-IT',
    de: 'de-DE',
    ar: 'ar-SA'
  });

  const CHARACTER_VOICE_MAP = Object.freeze({
    'wolverine': 'Fenrir',
    'thor': 'Fenrir',
    'hulk': 'Fenrir',
    'doctor-doom': 'Fenrir',
    'thanos': 'Fenrir',
    'galactus': 'Fenrir',
    'apocalypse': 'Fenrir',
    'juggernaut': 'Fenrir',
    'venom-knull': 'Fenrir',
    'the-thing': 'Fenrir',
    'colossus': 'Fenrir',
    'sentry': 'Fenrir',
    'magneto': 'Charon',
    'doctor-strange': 'Charon',
    'cyclops': 'Charon',
    'silver-surfer': 'Charon',
    'moon-knight': 'Charon',
    'ghost-rider': 'Charon',
    'black-bolt': 'Charon',
    'namor': 'Charon',
    'mister-sinister': 'Charon',
    'ultron': 'Charon',
    'iron-man': 'Orus',
    'captain-america': 'Orus',
    'mister-fantastic': 'Orus',
    'professor-x': 'Orus',
    'black-panther': 'Orus',
    'kang': 'Orus',
    'cable': 'Orus',
    'beast': 'Orus',
    'daredevil': 'Orus',
    'blade': 'Orus',
    'shang-chi': 'Orus',
    'spider-man-2099': 'Orus',
    'hawkeye': 'Orus',
    'ant-man-wasp': 'Orus',
    'spider-man': 'Puck',
    'miles-morales': 'Puck',
    'deadpool': 'Puck',
    'gambit': 'Puck',
    'human-torch': 'Puck',
    'nightcrawler': 'Puck',
    'star-lord': 'Puck',
    'iceman': 'Puck',
    'jean-grey': 'Aoede',
    'rogue': 'Aoede',
    'scarlet-witch': 'Aoede',
    'psylocke': 'Aoede',
    'laura-kinney': 'Aoede',
    'black-widow': 'Aoede',
    'storm': 'Kore',
    'emma-frost': 'Kore',
    'captain-marvel': 'Kore',
    'mystique': 'Kore',
    'magik': 'Kore',
    'spider-gwen': 'Leda',
    'kitty-pryde': 'Leda',
    'invisible-woman': 'Leda',
    'ms-marvel': 'Leda',
    'uatu-watcher': 'Zephyr',
    'adam-warlock': 'Zephyr',
    'vision': 'Zephyr',
    'franklin-richards': 'Zephyr',
    'loki': 'Zephyr',
    'beta-ray-bill': 'Fenrir',
    'blue-marvel': 'Orus',
    'nova': 'Puck',
    'she-hulk': 'Kore',
    'bishop': 'Orus',
    'archangel': 'Charon',
    'doctor-octopus': 'Orus',
    'green-goblin': 'Charon',
    'punisher': 'Fenrir',
    'america-chavez': 'Aoede',
    'molecule-man': 'Zephyr',
    'mephisto': 'Charon'
  });

  let selectedPersonaMode = 'auto';
  let speechToken = 0;
  let activeAudioEl = null;
  let activeBlobUrl = null;
  let activeAbortCtrl = null;
  let activeStateCallback = null;

  function getCharacterVoicePersona(character) {
    if (!character || !character.id) return 'Orus';
    if (CHARACTER_VOICE_MAP[character.id]) return CHARACTER_VOICE_MAP[character.id];
    if (character.alignment === 'villain') return 'Fenrir';
    return 'Orus';
  }

  function resolveEffectivePersona(character) {
    if (selectedPersonaMode !== 'auto' && CHIRP_PERSONAS.includes(selectedPersonaMode)) {
      return selectedPersonaMode;
    }
    return getCharacterVoicePersona(character);
  }

  function setPersona(mode) {
    if (mode === 'auto' || CHIRP_PERSONAS.includes(mode)) {
      selectedPersonaMode = mode;
    }
  }

  function stopSpeaking() {
    speechToken += 1;
    if (activeAbortCtrl) {
      try {
        activeAbortCtrl.abort();
      } catch (_e) {}
      activeAbortCtrl = null;
    }
    if (activeAudioEl) {
      try {
        activeAudioEl.pause();
        activeAudioEl.removeAttribute('src');
      } catch (_e) {}
      activeAudioEl = null;
    }
    if (activeBlobUrl && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
      try {
        URL.revokeObjectURL(activeBlobUrl);
      } catch (_e) {}
      activeBlobUrl = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (_e) {}
    }
    if (typeof activeStateCallback === 'function') {
      const cb = activeStateCallback;
      activeStateCallback = null;
      cb('idle');
    }
  }

  function speakViaBrowserFallback(text, lang, myToken, onState) {
    if (typeof window === 'undefined' || !window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') {
      onState('idle');
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = BCP47_BY_LANG[lang] || 'en-US';
      utter.rate = 1.0;
      utter.onstart = () => {
        if (myToken === speechToken) onState('playing', 'browser');
      };
      utter.onend = () => {
        if (myToken === speechToken) onState('idle', 'browser');
      };
      utter.onerror = () => {
        if (myToken === speechToken) onState('idle', 'browser');
      };
      onState('playing', 'browser');
      window.speechSynthesis.speak(utter);
    } catch (_e) {
      onState('idle');
    }
  }

  async function speakText(rawText, lang, character, onStateChange) {
    stopSpeaking();
    const myToken = ++speechToken;
    const onState = typeof onStateChange === 'function' ? onStateChange : function noop() {};
    activeStateCallback = onState;

    const clean = String(rawText || '').replace(/\s+/g, ' ').trim().slice(0, 1100);
    if (!clean) {
      onState('idle');
      return;
    }

    const persona = resolveEffectivePersona(character);
    onState('synthesizing', 'chirp-hd');

    if (typeof fetch === 'function' && typeof Audio !== 'undefined') {
      const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      activeAbortCtrl = ctrl;
      try {
        const qs = new URLSearchParams({
          lang: lang || 'en',
          persona,
          rate: '1.0',
          text: clean
        });
        const res = await fetch(`./api/tts?${qs.toString()}`, ctrl ? { signal: ctrl.signal } : undefined);
        if (myToken !== speechToken) return;
        if (res.ok && (res.headers.get('content-type') || '').includes('audio')) {
          const blob = await res.blob();
          if (myToken !== speechToken) return;
          const url = URL.createObjectURL(blob);
          activeBlobUrl = url;
          const audio = new Audio(url);
          activeAudioEl = audio;
          audio.onended = () => {
            if (myToken === speechToken) stopSpeaking();
          };
          audio.onerror = () => {
            if (myToken === speechToken) speakViaBrowserFallback(clean, lang, myToken, onState);
          };
          onState('playing', 'chirp-hd');
          await audio.play();
          return;
        }
      } catch (_err) {
        if (myToken !== speechToken) return;
      }
    }

    if (myToken === speechToken) {
      speakViaBrowserFallback(clean, lang, myToken, onState);
    }
  }

  const exported = {
    CHIRP_PERSONAS,
    CHARACTER_VOICE_MAP,
    getCharacterVoicePersona,
    resolveEffectivePersona,
    setPersona,
    speakText,
    stopSpeaking
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exported;
  }
  root.MARVEL_AUDIO = exported;
})(typeof window !== 'undefined' ? window : globalThis);
