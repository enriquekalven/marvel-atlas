/**
 * Marvel Multiverse & Omnibus Atlas — Main Interactive Portal Controller
 *
 * Features:
 * - Zero unsafe DOM string sinks & zero inline style attributes (strict CSP)
 * - 11-language localization (en, es, zh, yue, ja, ko, pt, fr, it, de, ar + RTL)
 * - Live Multiverse Variant Switcher across all 56+ Legends & 190+ Variants
 * - Official Marvel Handbook (OHOTMU) 1–7 Power Grids & Variant-vs-Variant 1v1 Battleworld Arena
 * - House of X #1 Omega-Level Mutant Registry, Interactive SVG Multiverse Map, Infinity Forge & Cover Vault
 * - 1-Click Shareable Deep Links (?char=...&variant=...&fa=...&fb=...)
 */

(function initMarvelAtlasApp(root) {
  'use strict';

  const { MARVEL_DATA, MARVEL_HELPERS } = root.MARVEL_ATLAS;
  const ARTWORK = root.MARVEL_ARTWORK;
  const I18N = root.MARVEL_I18N;
  const AUDIO = root.MARVEL_AUDIO;
  const {
    clearEl,
    el,
    createUiIconSvg,
    createComicCoverSvg,
    createCollectorArtFrame,
    createPowerBarSvg,
    createOhotmuRadarSvg,
    createGridComparisonBars
  } = root.MARVEL_DOM;
  const { renderMultiverseMap } = root.MARVEL_MAP_UI;

  const THEME_STORAGE_KEY = 'marvel-atlas-theme';

  function detectInitialLanguage() {
    let stored = null;
    try {
      if (typeof localStorage !== 'undefined') {
        stored = localStorage.getItem(I18N.STORAGE_KEY);
      }
    } catch (_e) {}
    const search = typeof location !== 'undefined' ? location.search : '';
    const navLangs =
      typeof navigator !== 'undefined' && Array.isArray(navigator.languages)
        ? navigator.languages
        : typeof navigator !== 'undefined' && navigator.language
          ? [navigator.language]
          : [];
    return I18N.resolveLanguage({ search, stored, navigatorLanguages: navLangs });
  }

  const urlInit =
    typeof location !== 'undefined' && typeof I18N.parseAtlasUrlState === 'function'
      ? I18N.parseAtlasUrlState(location.search)
      : {};

  function detectInitialTheme() {
    if (urlInit.theme === 'light' || urlInit.theme === 'dark') return urlInit.theme;
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(THEME_STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') return saved;
      }
    } catch (_e) {}
    return 'dark';
  }

  const initialVariantMap = {};
  if (urlInit.selectedCharacterId && urlInit.selectedVariantId) {
    initialVariantMap[urlInit.selectedCharacterId] = urlInit.selectedVariantId;
  }

  const state = {
    lang: urlInit.lang || detectInitialLanguage(),
    audience: urlInit.audience || 'adult', // Default to Omnibus Lore for aficionados
    theme: detectInitialTheme(),
    era: urlInit.era || 'multiverse',
    activeTab: urlInit.activeTab || 'characters',
    searchQuery: '',
    filterTeam: 'all',
    filterOrigin: 'all',
    filterEarth: 'all',
    sortBy: 'power-desc',
    selectedCharacterId: urlInit.selectedCharacterId || 'wolverine',
    selectedVariantByChar: initialVariantMap,
    selectedRealityId: urlInit.selectedRealityId || 'earth-616',
    mapZoomed: false,
    clashFighterA: (urlInit.fighterA && urlInit.fighterA.charId) || 'thor',
    clashVariantA: (urlInit.fighterA && urlInit.fighterA.variantId) || 'rune-king-thor',
    clashFighterB: (urlInit.fighterB && urlInit.fighterB.charId) || 'doctor-doom',
    clashVariantB: (urlInit.fighterB && urlInit.fighterB.variantId) || 'god-emperor-doom',
    clashTargetSlot: 'A',
    selectedStones: ['Power', 'Space', 'Time', 'Reality', 'Soul', 'Mind'],
    vaultMediumFilter: 'all',
    quizIndex: 0,
    quizSelectedOption: null,
    quizScore: 0,
    audioState: 'idle',
    mobileDossierOpen: false,
    lastLightboxTrigger: null
  };

  function tr(key) {
    return I18N.t(state.lang, key);
  }

  function findCharacter(id) {
    return MARVEL_DATA.characters.find((c) => c.id === id) || MARVEL_DATA.characters[0];
  }

  function getResolvedSelected(charObj) {
    const ch = charObj || findCharacter(state.selectedCharacterId);
    const chosenVar = state.selectedVariantByChar[ch.id] || '';
    return MARVEL_HELPERS.resolveCharacterVariant(ch, chosenVar, state.era);
  }

  function syncUrlBar() {
    if (typeof history === 'undefined' || typeof history.replaceState !== 'function') return;
    try {
      const qs = I18N.buildAtlasShareQuery(state);
      const nextUrl = `${location.pathname}${qs}`;
      history.replaceState(null, '', nextUrl);
    } catch (_e) {}
  }

  function applyDocumentRootAttrs() {
    const html = document.documentElement;
    html.lang = state.lang;
    html.dir = I18N.getLanguageDir(state.lang);
    html.setAttribute('data-theme', state.theme);
    html.setAttribute('data-audience', state.audience);
    const metaTheme = document.getElementById('meta-theme-color');
    if (metaTheme) {
      metaTheme.setAttribute('content', state.theme === 'light' ? '#f6f2e8' : '#0a0e14');
    }
  }

  function getAllDistinctEarths(visibleChars) {
    const set = new Set();
    visibleChars.forEach((ch) => {
      MARVEL_HELPERS.getUnlockedVariants(ch, state.era).forEach((v) => {
        if (v.earth) set.add(v.earth);
      });
    });
    return Array.from(set).sort();
  }

  function syncHeaderChrome() {
    document.getElementById('brand-title').textContent = tr('brandTitle');
    document.getElementById('brand-subtitle').textContent = tr('brandSubtitle');
    document.getElementById('lang-label').textContent = tr('langLabel');
    document.getElementById('era-label').textContent = tr('eraLabel');

    const langSelect = document.getElementById('lang-select');
    if (langSelect && langSelect.value !== state.lang) langSelect.value = state.lang;

    const eraSelect = document.getElementById('era-select');
    if (eraSelect && eraSelect.value !== state.era) eraSelect.value = state.era;

    const btnAdult = document.getElementById('btn-mode-adult');
    const btnKid = document.getElementById('btn-mode-kid');
    btnAdult.textContent = tr('modeAdult');
    btnKid.textContent = tr('modeKid');
    btnAdult.classList.toggle('active', state.audience === 'adult');
    btnAdult.setAttribute('aria-pressed', String(state.audience === 'adult'));
    btnKid.classList.toggle('active', state.audience === 'kid');
    btnKid.setAttribute('aria-pressed', String(state.audience === 'kid'));

    const btnDark = document.getElementById('btn-theme-dark');
    const btnLight = document.getElementById('btn-theme-light');
    btnDark.textContent = tr('themeDark');
    btnLight.textContent = tr('themeLight');
    btnDark.classList.toggle('active', state.theme === 'dark');
    btnDark.setAttribute('aria-pressed', String(state.theme === 'dark'));
    btnLight.classList.toggle('active', state.theme === 'light');
    btnLight.setAttribute('aria-pressed', String(state.theme === 'light'));

    updateReadAloudButton();

    const btnShare = document.getElementById('btn-share-link');
    clearEl(btnShare);
    btnShare.appendChild(createUiIconSvg('share', 15));
    btnShare.appendChild(document.createTextNode(tr('shareLink')));

    const tabDefs = [
      ['tab-characters', 'characters', 'users', 'tabCharacters'],
      ['tab-arena', 'arena', 'swords', 'tabArena'],
      ['tab-xmen', 'xmen', 'xlogo', 'tabXmen'],
      ['tab-multiverse', 'multiverse', 'globe', 'tabMultiverse'],
      ['tab-factions', 'factions', 'shield', 'tabFactions'],
      ['tab-forge', 'forge', 'sparkles', 'tabForge'],
      ['tab-vault', 'vault', 'archive', 'tabVault']
    ];

    tabDefs.forEach(([domId, tabKey, icon, labelKey]) => {
      const btn = document.getElementById(domId);
      if (!btn) return;
      const isAct = state.activeTab === tabKey;
      btn.classList.toggle('active', isAct);
      btn.setAttribute('aria-selected', String(isAct));
      btn.setAttribute('tabindex', isAct ? '0' : '-1');
      clearEl(btn);
      btn.appendChild(createUiIconSvg(icon, 16));
      btn.appendChild(document.createTextNode(tr(labelKey)));
    });

    const host = document.getElementById('tab-panel-host');
    if (host) host.setAttribute('aria-labelledby', `tab-${state.activeTab}`);
  }

  function updateReadAloudButton() {
    const btn = document.getElementById('btn-read-aloud');
    if (!btn) return;
    clearEl(btn);
    const active = state.audioState !== 'idle';
    btn.classList.toggle('speaking', active);
    btn.setAttribute('aria-pressed', String(active));
    if (state.audioState === 'synthesizing') {
      btn.appendChild(createUiIconSvg('volume', 15));
      btn.appendChild(document.createTextNode(tr('synthesizing')));
    } else if (state.audioState === 'playing') {
      btn.appendChild(createUiIconSvg('stop', 15));
      btn.appendChild(document.createTextNode(tr('stopAudio')));
    } else {
      btn.appendChild(createUiIconSvg('volume', 15));
      btn.appendChild(document.createTextNode(tr('readAloud')));
    }
  }

  function renderKpiStrip() {
    const strip = document.getElementById('kpi-strip');
    clearEl(strip);
    const visChars = MARVEL_HELPERS.getVisibleCharacters(state.era);
    const visVariants = visChars.reduce(
      (sum, c) => sum + MARVEL_HELPERS.getUnlockedVariants(c, state.era).length,
      0
    );
    const visRealities = MARVEL_HELPERS.getVisibleRealities(state.era);

    const kpis = [
      {
        label: tr('kpiIcons'),
        value: String(visChars.length),
        sub: 'X-Men • Avengers • Spider-Verse • FF • Cabal'
      },
      {
        label: tr('kpiVariants'),
        value: String(visVariants),
        sub: 'Live Earth-616 / 1610 / 295 / 928 / 65 / 6160 / Battleworld'
      },
      {
        label: tr('kpiEarths'),
        value: String(visRealities.length),
        sub: 'Interactive Sacred Timeline & Incursion Nodes'
      },
      {
        label: tr('kpiOmegas'),
        value: String(MARVEL_DATA.omegaMutants.length),
        sub: 'Official Hickman House of X #1 Registry'
      }
    ];

    kpis.forEach((k) => {
      strip.appendChild(
        el('div', { className: 'kpi-card' }, [
          el('span', { className: 'kpi-label', text: k.label }),
          el('span', { className: 'kpi-value tabular-nums', text: k.value }),
          el('span', { className: 'kpi-sub', text: k.sub })
        ])
      );
    });
  }

  function filterAndSortCharacters() {
    const vis = MARVEL_HELPERS.getVisibleCharacters(state.era);
    const q = state.searchQuery.trim().toLowerCase();

    const filtered = vis.filter((ch) => {
      if (state.filterTeam !== 'all') {
        const matchesTeam =
          ch.team === state.filterTeam ||
          (Array.isArray(ch.factions) && ch.factions.includes(state.filterTeam));
        if (!matchesTeam) return false;
      }
      if (state.filterOrigin !== 'all' && ch.origin !== state.filterOrigin) {
        return false;
      }
      const unlockedVars = MARVEL_HELPERS.getUnlockedVariants(ch, state.era);
      if (state.filterEarth !== 'all') {
        const hasEarth = unlockedVars.some((v) => v.earth === state.filterEarth);
        if (!hasEarth) return false;
      }
      if (q) {
        const haystack = [
          ch.name,
          ch.civilian,
          ch.title,
          ch.origin,
          ch.firstAppearance,
          ch.creators,
          ...(ch.abilities || []),
          ...unlockedVars.map((v) => `${v.name} ${v.earth} ${v.signature} ${v.note}`)
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    filtered.sort((a, b) => {
      const ra = getResolvedSelected(a);
      const rb = getResolvedSelected(b);
      if (state.sortBy === 'grid-desc') {
        return rb.gridTotal - ra.gridTotal || rb.powerScore - ra.powerScore;
      }
      if (state.sortBy === 'variants-desc') {
        return rb.availableVariants.length - ra.availableVariants.length || rb.powerScore - ra.powerScore;
      }
      if (state.sortBy === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      return rb.powerScore - ra.powerScore || rb.gridTotal - ra.gridTotal;
    });

    return filtered;
  }

  function createCharacterCard(ch) {
    const resolved = getResolvedSelected(ch);
    const isSelected = state.selectedCharacterId === ch.id;

    const card = el('article', {
      className: `char-card${isSelected ? ' selected' : ''}`,
      attrs: { tabindex: '0', 'aria-label': `${ch.name} — ${resolved.variantName}` },
      on: {
        click: () => selectCharacter(ch.id, null, true),
        keydown: (evt) => {
          if (evt.target === card && (evt.key === 'Enter' || evt.key === ' ')) {
            evt.preventDefault();
            selectCharacter(ch.id, null, true);
          }
        }
      }
    });

    const artEntry = ARTWORK.getArtworkForCharacter(ch.id);
    const plate = ARTWORK.getPlateForVariant(ch.id, resolved.variantId);
    const artStage = el('div', { className: 'char-card-art-stage' }, [
      createCollectorArtFrame(resolved, plate, {
        variant: 'card',
        rarityClass: artEntry ? artEntry.rarityClass : 'key-issue',
        showTopChips: true,
        earthChip: resolved.earth,
        badgeChip: ch.omegaMutant ? 'OMEGA' : plate && plate.isDistinctVariantArt ? 'VARIANT' : resolved.tier.badge,
        badgeHighlight: Boolean(ch.omegaMutant || (plate && plate.isDistinctVariantArt))
      })
    ]);

    const badges = el('div', { className: 'char-meta-badges' }, [
      el('span', { className: 'earth-badge tabular-nums', text: resolved.earth }),
      ch.omegaMutant ? el('span', { className: 'omega-badge', text: 'OMEGA' }) : null,
      el('span', { className: 'team-badge', text: ch.origin })
    ]);

    const identity = el('div', { className: 'char-card-identity' }, [
      badges,
      el('h3', { className: 'char-name', text: ch.name }),
      el('p', { className: 'char-alias', text: ch.civilian }),
      el('p', { className: 'char-debut', text: ch.firstAppearance })
    ]);

    const variantPills = el('div', { className: 'variant-pills-row' });
    resolved.availableVariants.forEach((v) => {
      const isVarAct = v.id === resolved.variantId;
      variantPills.appendChild(
        el('button', {
          type: 'button',
          className: `variant-pill-btn${isVarAct ? ' active' : ''}`,
          text: v.name.split('(')[0].trim(),
          title: `${v.name} · ${v.earth}`,
          attrs: { 'aria-pressed': String(isVarAct) },
          on: {
            click: (evt) => {
              evt.stopPropagation();
              selectCharacter(ch.id, v.id, false);
            }
          }
        })
      );
    });

    const footer = el('div', { className: 'char-power-footer' }, [
      el('div', { className: 'power-score-row' }, [
        el('span', { text: `${resolved.tier.badge} · OHOTMU ${resolved.gridTotal}/42` }),
        el('span', { className: 'power-score-num tabular-nums', text: `PWR ${resolved.powerScore}` })
      ]),
      createPowerBarSvg(resolved.powerScore)
    ]);

    card.appendChild(artStage);
    card.appendChild(identity);
    card.appendChild(
      el('div', {}, [
        el('div', { className: 'variant-strip-label', text: `${tr('variantsLabel')} (${resolved.availableVariants.length})` }),
        variantPills
      ])
    );
    card.appendChild(footer);
    return card;
  }

  function updateRosterGridInPlace() {
    const gridHost = document.getElementById('character-results-grid');
    const countNode = document.getElementById('character-results-counter');
    if (!gridHost || !countNode) return;

    const list = filterAndSortCharacters();
    const totalVars = list.reduce(
      (s, c) => s + MARVEL_HELPERS.getUnlockedVariants(c, state.era).length,
      0
    );
    countNode.textContent = `Showing ${list.length} icons · ${totalVars} playable variants`;

    clearEl(gridHost);
    if (list.length === 0) {
      gridHost.appendChild(
        el('div', { className: 'section-card' }, [
          el('h3', { className: 'section-title', text: 'No matching heroes or variants in this Saga Shield' }),
          el('p', {
            className: 'section-desc',
            text: 'Try clearing your search query or switching the Saga Spoiler Shield to "Multiverse & Krakoa (All)".'
          }),
          el('button', {
            type: 'button',
            className: 'btn-secondary-cta',
            text: 'Reset Roster Filters',
            on: {
              click: () => {
                state.searchQuery = '';
                state.filterTeam = 'all';
                state.filterOrigin = 'all';
                state.filterEarth = 'all';
                renderActiveTab();
              }
            }
          })
        ])
      );
      return;
    }

    list.forEach((ch) => {
      gridHost.appendChild(createCharacterCard(ch));
    });
  }

  function renderCharactersTab(host) {
    const visChars = MARVEL_HELPERS.getVisibleCharacters(state.era);
    const earths = getAllDistinctEarths(visChars);

    const searchInput = el('input', {
      type: 'search',
      id: 'character-search-input',
      className: 'search-input',
      value: state.searchQuery,
      placeholder: tr('searchPlaceholder'),
      attrs: { 'aria-label': tr('searchPlaceholder') },
      on: {
        input: (e) => {
          state.searchQuery = e.target.value || '';
          updateRosterGridInPlace();
        }
      }
    });

    const originSelect = el(
      'select',
      {
        id: 'filter-origin-select',
        className: 'filter-select',
        attrs: { 'aria-label': 'Filter by Power Origin' },
        on: {
          change: (e) => {
            state.filterOrigin = e.target.value;
            updateRosterGridInPlace();
          }
        }
      },
      [
        el('option', { value: 'all', text: tr('originAll') }),
        ...MARVEL_DATA.origins.map((o) =>
          el('option', {
            value: o.id,
            text: `${o.id} (${o.code})`,
            attrs: state.filterOrigin === o.id ? { selected: 'selected' } : {}
          })
        )
      ]
    );

    const earthSelect = el(
      'select',
      {
        id: 'filter-earth-select',
        className: 'filter-select',
        attrs: { 'aria-label': 'Filter by Multiverse Earth' },
        on: {
          change: (e) => {
            state.filterEarth = e.target.value;
            updateRosterGridInPlace();
          }
        }
      },
      [
        el('option', { value: 'all', text: tr('earthAll') }),
        ...earths.map((earthCode) =>
          el('option', {
            value: earthCode,
            text: earthCode,
            attrs: state.filterEarth === earthCode ? { selected: 'selected' } : {}
          })
        )
      ]
    );

    const sortSelect = el(
      'select',
      {
        id: 'sort-characters-select',
        className: 'filter-select',
        attrs: { 'aria-label': 'Sort Characters' },
        on: {
          change: (e) => {
            state.sortBy = e.target.value;
            updateRosterGridInPlace();
          }
        }
      },
      [
        el('option', { value: 'power-desc', text: tr('sortPower'), attrs: state.sortBy === 'power-desc' ? { selected: 'selected' } : {} }),
        el('option', { value: 'grid-desc', text: tr('sortGrid'), attrs: state.sortBy === 'grid-desc' ? { selected: 'selected' } : {} }),
        el('option', { value: 'variants-desc', text: tr('sortVariants'), attrs: state.sortBy === 'variants-desc' ? { selected: 'selected' } : {} }),
        el('option', { value: 'name-asc', text: tr('sortName'), attrs: state.sortBy === 'name-asc' ? { selected: 'selected' } : {} })
      ]
    );

    const teamButtons = [
      ['all', tr('teamAll')],
      ['xmen', tr('teamXmen')],
      ['avengers', tr('teamAvengers')],
      ['spider-street', tr('teamSpider')],
      ['ff-cosmic', tr('teamFF')],
      ['cabal', tr('teamCabal')]
    ].map(([teamId, label]) =>
      el('button', {
        type: 'button',
        className: `chip-filter-btn${state.filterTeam === teamId ? ' active' : ''}`,
        text: label,
        attrs: { 'aria-pressed': String(state.filterTeam === teamId) },
        on: {
          click: () => {
            state.filterTeam = teamId;
            renderActiveTab();
          }
        }
      })
    );

    const toolbar = el('section', { className: 'filter-toolbar', attrs: { 'aria-label': 'Character & Variant Filters' } }, [
      el('div', { className: 'filter-row-top' }, [
        el('div', { className: 'search-input-wrap' }, [searchInput]),
        originSelect,
        earthSelect,
        sortSelect
      ]),
      el('div', { className: 'filter-meta-row' }, [
        el('div', { className: 'Quick-team-pills' }, teamButtons),
        el('span', {
          id: 'character-results-counter',
          className: 'results-counter',
          attrs: { role: 'status', 'aria-live': 'polite' }
        })
      ])
    ]);

    const grid = el('div', { id: 'character-results-grid', className: 'character-grid' });
    host.appendChild(toolbar);
    host.appendChild(grid);
    updateRosterGridInPlace();
  }

  function renderBattleworldArenaTab(host) {
    const visChars = MARVEL_HELPERS.getVisibleCharacters(state.era);
    const charA = visChars.find((c) => c.id === state.clashFighterA) || visChars[0];
    const charB = visChars.find((c) => c.id === state.clashFighterB) || visChars[1] || visChars[0];
    const clash = MARVEL_HELPERS.simulateClash(
      charA,
      state.clashVariantA,
      charB,
      state.clashVariantB,
      state.era
    );

    function buildFighterPicker(slotLabel, currentChar, currentVariantId, onCharChange, onVarChange) {
      const vars = MARVEL_HELPERS.getUnlockedVariants(currentChar, state.era);
      const resolved = MARVEL_HELPERS.resolveCharacterVariant(currentChar, currentVariantId, state.era);
      const fighterArtEntry = ARTWORK.getArtworkForCharacter(currentChar.id);
      const fighterPlate = ARTWORK.getPlateForVariant(currentChar.id, resolved.variantId);
      return el('div', { className: 'fighter-picker-box' }, [
        el('span', { className: 'kpi-label', text: slotLabel }),
        createCollectorArtFrame(resolved, fighterPlate, {
          variant: 'arena',
          rarityClass: fighterArtEntry ? fighterArtEntry.rarityClass : 'key-issue',
          showTopChips: true,
          earthChip: resolved.earth,
          badgeChip: `PWR ${resolved.powerScore}`,
          badgeHighlight: resolved.powerScore >= 96,
          captionText: `${currentChar.name} — ${resolved.variantName}`
        }),
        el(
          'select',
          {
            className: 'filter-select',
            attrs: { 'aria-label': `${slotLabel} Character` },
            on: { change: (e) => onCharChange(e.target.value) }
          },
          visChars.map((c) =>
            el('option', {
              value: c.id,
              text: `${c.name} (${c.origin})`,
              attrs: c.id === currentChar.id ? { selected: 'selected' } : {}
            })
          )
        ),
        el(
          'select',
          {
            className: 'filter-select',
            attrs: { 'aria-label': `${slotLabel} Multiverse Variant` },
            on: { change: (e) => onVarChange(e.target.value) }
          },
          vars.map((v) =>
            el('option', {
              value: v.id,
              text: `${v.name} · ${v.earth} (PWR ${v.powerScore})`,
              attrs: v.id === resolved.variantId ? { selected: 'selected' } : {}
            })
          )
        ),
        el('div', { className: 'power-score-row' }, [
          el('span', { className: 'earth-badge', text: resolved.earth }),
          el('span', { className: 'power-score-num tabular-nums', text: `Grid ${resolved.gridTotal}/42 · PWR ${resolved.powerScore}` })
        ])
      ]);
    }

    const swapBtn = el('button', {
      type: 'button',
      id: 'btn-swap-fighters',
      className: 'btn-secondary-cta',
      on: {
        click: () => {
          const tmpC = state.clashFighterA;
          const tmpV = state.clashVariantA;
          state.clashFighterA = state.clashFighterB;
          state.clashVariantA = state.clashVariantB;
          state.clashFighterB = tmpC;
          state.clashVariantB = tmpV;
          syncUrlBar();
          renderActiveTab();
        }
      }
    }, [createUiIconSvg('swap', 15), tr('swapFighters')]);

    const randomBtn = el('button', {
      type: 'button',
      id: 'btn-random-clash',
      className: 'btn-primary-cta',
      on: {
        click: () => {
          if (visChars.length < 2) return;
          const idxA = Math.floor(Math.random() * visChars.length);
          let idxB = Math.floor(Math.random() * visChars.length);
          if (idxB === idxA) idxB = (idxA + 1) % visChars.length;
          const ca = visChars[idxA];
          const cb = visChars[idxB];
          const vaList = MARVEL_HELPERS.getUnlockedVariants(ca, state.era);
          const vbList = MARVEL_HELPERS.getUnlockedVariants(cb, state.era);
          state.clashFighterA = ca.id;
          state.clashVariantA = vaList[Math.floor(Math.random() * vaList.length)].id;
          state.clashFighterB = cb.id;
          state.clashVariantB = vbList[Math.floor(Math.random() * vbList.length)].id;
          syncUrlBar();
          renderActiveTab();
        }
      }
    }, [createUiIconSvg('shuffle', 15), tr('randomIncursion')]);

    let verdictTitle = ` Cosmic Stalemate (${clash.finalScoreA} vs ${clash.finalScoreB})`;
    if (clash.winnerState) {
      const winLabel = `${clash.winnerState.character.name} [${clash.winnerState.variantName}]`;
      verdictTitle =
        clash.verdictType === 'decisive'
          ? `Decisive Battleworld Victory: ${winLabel} (${clash.finalScoreA} vs ${clash.finalScoreB})`
          : `Razor-Close Incursion Edge: ${winLabel} (${clash.finalScoreA} vs ${clash.finalScoreB})`;
    }

    const axisLabels = [
      tr('gridIntelligence'),
      tr('gridStrength'),
      tr('gridSpeed'),
      tr('gridDurability'),
      tr('gridEnergy'),
      tr('gridFighting')
    ];

    const shell = el('div', { className: 'arena-shell' }, [
      el('section', { className: 'arena-controls-card' }, [
        el('div', { className: 'section-header-flex' }, [
          el('div', {}, [
            el('h2', { className: 'section-title', text: '1v1 Battleworld Variant Simulator & Official OHOTMU 1–7 Grid' }),
            el('p', {
              className: 'section-desc',
              text: 'Pit any Marvel legend AND specific Multiverse Variant head-to-head using Official Handbook 1–7 Power Grids and Origin Tactical Counters.'
            })
          ])
        ]),
        el('div', { className: 'arena-matchup-grid' }, [
          buildFighterPicker(
            'Challenger A (Crimson Solid ●)',
            charA,
            state.clashVariantA,
            (nextId) => {
              state.clashFighterA = nextId;
              const nextVars = MARVEL_HELPERS.getUnlockedVariants(findCharacter(nextId), state.era);
              state.clashVariantA = nextVars[0] ? nextVars[0].id : '';
              syncUrlBar();
              renderActiveTab();
            },
            (nextVar) => {
              state.clashVariantA = nextVar;
              syncUrlBar();
              renderActiveTab();
            }
          ),
          el('div', { className: 'arena-mid-actions' }, [swapBtn, randomBtn]),
          buildFighterPicker(
            'Challenger B (Cyan Dashed ◆)',
            charB,
            state.clashVariantB,
            (nextId) => {
              state.clashFighterB = nextId;
              const nextVars = MARVEL_HELPERS.getUnlockedVariants(findCharacter(nextId), state.era);
              state.clashVariantB = nextVars[0] ? nextVars[0].id : '';
              syncUrlBar();
              renderActiveTab();
            },
            (nextVar) => {
              state.clashVariantB = nextVar;
              syncUrlBar();
              renderActiveTab();
            }
          )
        ]),
        el('div', { className: 'verdict-banner', attrs: { role: 'status', 'aria-live': 'polite' } }, [
          el('h3', { className: 'verdict-headline tabular-nums', text: verdictTitle }),
          el('p', { className: 'verdict-sub', text: clash.originNote }),
          el('p', {
            className: 'verdict-sub',
            text: `${clash.stateA.variantName}: ${clash.stateA.signature}  •  vs  •  ${clash.stateB.variantName}: ${clash.stateB.signature}`
          })
        ]),
        el('div', { className: 'arena-analysis-grid' }, [
          el('div', { className: 'radar-wrap' }, [
            createOhotmuRadarSvg(clash.stateA, clash.stateB, ['INT', 'STR', 'SPD', 'DUR', 'NRG', 'FGT'])
          ]),
          el('div', { className: 'info-tile' }, [
            el('h3', { className: 'info-tile-title', text: 'Head-to-Head Official Marvel 1–7 Power Grid' }),
            createGridComparisonBars(clash.stateA, clash.stateB, axisLabels)
          ])
        ])
      ])
    ]);

    host.appendChild(shell);
  }

  function renderXmenOmegaTab(host) {
    const omegaGrid = el('div', { className: 'omega-table-grid' });
    MARVEL_DATA.omegaMutants.forEach((om) => {
      const tile = el('article', { className: 'info-tile' }, [
        el('div', { className: 'char-meta-badges' }, [
          el('span', { className: 'omega-badge', text: 'OMEGA LEVEL' }),
          el('span', { className: 'team-badge', text: om.allegiance })
        ]),
        el('h3', { className: 'info-tile-title', text: `${om.name} (${om.alias})` }),
        el('p', { className: 'char-alias', text: `Domain: ${om.domain}` }),
        el('p', { className: 'section-desc', text: om.note }),
        om.linkedCharId
          ? el('button', {
              type: 'button',
              className: 'btn-secondary-cta',
              text: `Inspect ${om.alias} Variants`,
              on: {
                click: () => selectCharacter(om.linkedCharId, null, true)
              }
            })
          : null
      ]);
      omegaGrid.appendChild(tile);
    });

    const xmenChars = MARVEL_HELPERS.getVisibleCharacters(state.era).filter(
      (c) => c.team === 'xmen' || (c.factions && c.factions.includes('xmen'))
    );
    const rosterGrid = el('div', { className: 'character-grid' });
    xmenChars.forEach((ch) => rosterGrid.appendChild(createCharacterCard(ch)));

    host.appendChild(
      el('section', { className: 'section-card' }, [
        el('h2', { className: 'section-title', text: 'House of X #1 — Official Omega-Level Mutant Registry' }),
        el('p', {
          className: 'section-desc',
          text: 'Canonical Jonathan Hickman data-page classification: mutants whose dominant X-Gene gift registers an undefinable upper limit that cannot be surpassed by any measurable construct.'
        }),
        omegaGrid
      ])
    );

    host.appendChild(
      el('section', { className: 'section-card' }, [
        el('h2', {
          className: 'section-title',
          text: `Mutantkind, Uncanny X-Men & Quiet Council Roster (${xmenChars.length} Legends)`
        }),
        rosterGrid
      ])
    );
  }

  function renderMultiverseMapTab(host) {
    const realities = MARVEL_HELPERS.getVisibleRealities(state.era);
    const activeReality =
      realities.find((r) => r.id === state.selectedRealityId) || realities[0];

    const mapStage = el('div', { className: 'nexus-map-stage' });
    renderMultiverseMap(mapStage, realities, activeReality.id, state.mapZoomed, (nextId) => {
      state.selectedRealityId = nextId;
      syncUrlBar();
      renderActiveTab();
    });

    const zoomBtn = el('button', {
      type: 'button',
      className: 'btn-secondary-cta',
      text: state.mapZoomed ? 'Reset Full Omniverse View' : 'Zoom Prime Incursion Core',
      on: {
        click: () => {
          state.mapZoomed = !state.mapZoomed;
          renderActiveTab();
        }
      }
    });

    const visChars = MARVEL_HELPERS.getVisibleCharacters(state.era);
    const matchingVariants = [];
    visChars.forEach((ch) => {
      MARVEL_HELPERS.getUnlockedVariants(ch, state.era).forEach((v) => {
        const normCode = activeReality.code.toLowerCase();
        if (
          v.earth.toLowerCase() === normCode ||
          (activeReality.id === 'battleworld' && v.earth.includes('Battleworld'))
        ) {
          matchingVariants.push({ ch, v });
        }
      });
    });

    const variantChips = el('div', { className: 'variant-pills-row' });
    matchingVariants.slice(0, 28).forEach(({ ch, v }) => {
      variantChips.appendChild(
        el('button', {
          type: 'button',
          className: 'variant-pill-btn',
          text: `${ch.name}: ${v.name.split('(')[0].trim()}`,
          on: {
            click: () => selectCharacter(ch.id, v.id, true)
          }
        })
      );
    });

    host.appendChild(
      el('section', { className: 'section-card' }, [
        el('div', { className: 'section-header-flex' }, [
          el('div', {}, [
            el('h2', { className: 'section-title', text: 'Interactive Marvel Multiverse, Sacred Timeline & Incursion Map' }),
            el('p', {
              className: 'section-desc',
              text: 'Click or press Enter on any Reality Node to inspect its canonical divergence point, Incursion status, key comic issue, and playable Variants.'
            })
          ]),
          zoomBtn
        ]),
        mapStage,
        el('div', { className: 'earth-detail-panel' }, [
          el('div', { className: 'char-meta-badges' }, [
            el('span', { className: 'earth-badge', text: activeReality.code }),
            el('span', { className: 'omega-badge', text: activeReality.incursionStatus }),
            el('span', { className: 'team-badge', text: activeReality.sector })
          ]),
          el('h3', { className: 'section-title', text: `${activeReality.code} — ${activeReality.name}` }),
          el('p', { className: 'char-debut', text: `Key Comic Citation: ${activeReality.keyIssue}  •  Sovereign Force: ${activeReality.rulingForce}` }),
          el('p', {
            className: 'dossier-bio',
            text: state.audience === 'kid' ? activeReality.kidSummary : activeReality.adultSummary
          }),
          el('div', {
            className: 'dossier-section-title',
            text: `Playable Variants Anchored to ${activeReality.code} (${matchingVariants.length})`
          }),
          variantChips
        ])
      ])
    );
  }

  function renderFactionsTab(host) {
    const factions = MARVEL_HELPERS.getVisibleFactions(state.era);
    const visChars = MARVEL_HELPERS.getVisibleCharacters(state.era);
    const grid = el('div', { className: 'factions-grid' });

    factions.forEach((fac) => {
      const members = visChars.filter(
        (c) => c.team === fac.id || (Array.isArray(c.factions) && c.factions.includes(fac.id))
      );
      const memberRow = el('div', { className: 'variant-pills-row' });
      members.forEach((m) => {
        memberRow.appendChild(
          el('button', {
            type: 'button',
            className: 'variant-pill-btn',
            text: m.name,
            on: { click: () => selectCharacter(m.id, null, true) }
          })
        );
      });

      grid.appendChild(
        el('article', { className: 'section-card' }, [
          el('span', { className: 'earth-badge', text: fac.debut }),
          el('h3', { className: 'section-title', text: fac.name }),
          el('p', { className: 'char-alias', text: `HQ: ${fac.hq}` }),
          el('blockquote', { className: 'dossier-quote', text: fac.motto }),
          el('p', {
            className: 'dossier-bio',
            text: state.audience === 'kid' ? fac.kidSummary : fac.adultSummary
          }),
          el('div', { className: 'dossier-section-title', text: `Active Roster (${members.length})` }),
          memberRow
        ])
      );
    });

    host.appendChild(grid);
  }

  function renderInfinityForgeAndQuizTab(host) {
    const stonesRow = el('div', { className: 'stones-row' });
    MARVEL_DATA.infinityStones.forEach((stone) => {
      const isSelected = state.selectedStones.includes(stone.id);
      stonesRow.appendChild(
        el('button', {
          type: 'button',
          className: `stone-toggle-btn${isSelected ? ' active' : ''}`,
          text: `${stone.name} (${stone.id})`,
          attrs: { 'aria-pressed': String(isSelected) },
          on: {
            click: () => {
              if (isSelected) {
                state.selectedStones = state.selectedStones.filter((s) => s !== stone.id);
              } else {
                state.selectedStones = [...state.selectedStones, stone.id];
              }
              renderActiveTab();
            }
          }
        })
      );
    });

    const activeSet = new Set(state.selectedStones);
    const unlockedFusions = MARVEL_DATA.cosmicFusions.filter((f) =>
      f.stones.every((s) => activeSet.has(s))
    );

    const fusionCards = el('div', { className: 'omega-table-grid' });
    if (unlockedFusions.length === 0) {
      fusionCards.appendChild(
        el('div', { className: 'info-tile' }, [
          el('h4', { className: 'info-tile-title', text: 'Select at least 2 Infinity Gems to forge a Cosmic Synergy' }),
          el('p', { className: 'section-desc', text: 'Try combining Space + Time, Power + Reality, Soul + Mind, or all 6 Gems for the Complete Infinity Gauntlet!' })
        ])
      );
    } else {
      unlockedFusions.forEach((fus) => {
        fusionCards.appendChild(
          el('article', { className: 'info-tile' }, [
            el('div', { className: 'char-meta-badges' }, [
              el('span', { className: 'omega-badge', text: fus.tier }),
              el('span', { className: 'earth-badge', text: fus.stones.join(' + ') })
            ]),
            el('h4', { className: 'info-tile-title', text: fus.name }),
            el('p', { className: 'char-debut', text: `Canonical Wielders: ${fus.wielders}` }),
            el('p', {
              className: 'section-desc',
              text: state.audience === 'kid' ? fus.kidNote : fus.adultNote
            })
          ])
        );
      });
    }

    // Uatu's Bullpen No-Prize Quiz
    const questions = MARVEL_HELPERS.getVisibleQuiz(state.era, state.audience);
    const qIdx = questions.length ? state.quizIndex % questions.length : 0;
    const currentQ = questions[qIdx];

    const quizCard = el('section', { className: 'section-card' }, [
      el('div', { className: 'section-header-flex' }, [
        el('div', {}, [
          el('h2', { className: 'section-title', text: 'Uatu the Watcher’s Marvel Bullpen "No-Prize" Trial' }),
          el('p', {
            className: 'section-desc',
            text: 'True Believers since the 1960s earned Stan Lee’s legendary Marvel Bullpen "No-Prize" by proving encyclopedic continuity mastery!'
          })
        ]),
        el('span', {
          className: 'omega-badge tabular-nums',
          text: `Score: ${state.quizScore}/${questions.length} ${state.quizScore >= 4 ? '· OFFICIAL NO-PRIZE WINNER!' : ''}`
        })
      ])
    ]);

    if (currentQ) {
      quizCard.appendChild(
        el('h3', {
          className: 'info-tile-title',
          text: `Q${qIdx + 1}/${questions.length}: ${currentQ.question}`
        })
      );

      const optsWrap = el('div', { className: 'stat-compare-list' });
      currentQ.options.forEach((optText, optI) => {
        let cls = 'quiz-option-btn';
        if (state.quizSelectedOption !== null) {
          if (optI === currentQ.answerIndex) cls += ' correct';
          else if (optI === state.quizSelectedOption) cls += ' wrong';
        }
        optsWrap.appendChild(
          el('button', {
            type: 'button',
            className: cls,
            text: optText,
            on: {
              click: () => {
                if (state.quizSelectedOption !== null) return;
                state.quizSelectedOption = optI;
                if (optI === currentQ.answerIndex) state.quizScore += 1;
                renderActiveTab();
              }
            }
          })
        );
      });
      quizCard.appendChild(optsWrap);

      if (state.quizSelectedOption !== null) {
        quizCard.appendChild(
          el('div', { className: 'verdict-banner' }, [
            el('p', { className: 'verdict-sub', text: currentQ.explanation }),
            el('button', {
              type: 'button',
              className: 'btn-primary-cta',
              text: 'Next Watcher Question →',
              on: {
                click: () => {
                  state.quizIndex = (qIdx + 1) % questions.length;
                  state.quizSelectedOption = null;
                  renderActiveTab();
                }
              }
            })
          ])
        );
      }
    }

    host.appendChild(
      el('section', { className: 'section-card' }, [
        el('h2', { className: 'section-title', text: 'Interactive Infinity Gauntlet & Native-Universe Synergy Forge' }),
        el('p', {
          className: 'section-desc',
          text: 'Toggle any combination of the six Infinity Gems below to inspect their cosmic resonance and Hickman’s New Avengers Incursion constraint.'
        }),
        stonesRow,
        fusionCards
      ])
    );
    host.appendChild(quizCard);
  }

  function renderCoverVaultTab(host) {
    const plates = ARTWORK.getAllVaultPlates(state.era, state.vaultMediumFilter);
    const filterPills = [
      ['all', 'All Editions'],
      ['silver-age-key', 'Silver Age Four-Color'],
      ['bronze-foil-edition', 'Bronze / 90s Foil'],
      ['modern-omnibus', 'Modern Omnibus'],
      ['multiverse-variant', 'Multiverse Variants']
    ].map(([medKey, label]) =>
      el('button', {
        type: 'button',
        className: `chip-filter-btn${state.vaultMediumFilter === medKey ? ' active' : ''}`,
        text: label,
        on: {
          click: () => {
            state.vaultMediumFilter = medKey;
            renderActiveTab();
          }
        }
      })
    );

    const vaultGrid = el('div', { className: 'vault-grid' });
    plates.forEach((plate) => {
      const ch = findCharacter(plate.characterId);
      const resolved = MARVEL_HELPERS.resolveCharacterVariant(ch, plate.variantId, state.era);

      const openBtn = el(
        'button',
        {
          type: 'button',
          className: 'vitrine-cover-btn is-vault',
          attrs: { 'aria-label': `Inspect ${ch.name} — ${plate.label} cover plate` },
          on: {
            click: (evt) => openLightbox(resolved, plate, evt.currentTarget)
          }
        },
        [
          createCollectorArtFrame(resolved, plate, {
            variant: 'vault',
            rarityClass: plate.rarityClass
          }),
          el('span', { className: 'vitrine-zoom-hint', text: tr('zoomCover') })
        ]
      );

      vaultGrid.appendChild(
        el('article', { className: 'info-tile' }, [
          el('div', { className: 'char-card-top' }, [
            openBtn,
            el('div', { className: 'collector-plaque' }, [
              el('span', { className: 'collector-plaque-heading', text: `${plate.catalogueNo} · ${plate.mediumLabel}` }),
              el('h3', { className: 'collector-plaque-title', text: `${ch.name}: ${plate.label}` }),
              el('p', { className: 'collector-plaque-meta', text: `${plate.earth} • ${plate.issueCitation}` }),
              el('p', { className: 'collector-plaque-meta', text: plate.creators }),
              el('button', {
                type: 'button',
                className: 'btn-secondary-cta',
                text: 'Open Dossier',
                on: {
                  click: () => selectCharacter(ch.id, plate.variantId, true)
                }
              })
            ])
          ])
        ])
      );
    });

    host.appendChild(
      el('section', { className: 'section-card' }, [
        el('div', { className: 'section-header-flex' }, [
          el('div', {}, [
            el('h2', { className: 'section-title', text: `Bullpen Omnibus & Variant Cover Vault (${plates.length} Plates)` }),
            el('p', {
              className: 'section-desc',
              text: 'Click any cover plate to open the full-resolution Collector Loupe with creator provenance and Multiverse notes.'
            })
          ])
        ]),
        el('div', { className: 'Quick-team-pills' }, filterPills),
        vaultGrid
      ])
    );
  }

  function renderDossierInspector() {
    const inspector = document.getElementById('detail-inspector');
    clearEl(inspector);

    const ch = findCharacter(state.selectedCharacterId);
    const resolved = getResolvedSelected(ch);
    const artEntry = ARTWORK.getArtworkForCharacter(ch.id);
    const plate = ARTWORK.getPlateForVariant(ch.id, resolved.variantId);

    inspector.classList.toggle('mobile-open', state.mobileDossierOpen);
    const scrim = document.getElementById('inspector-scrim');
    if (scrim) {
      scrim.hidden = !state.mobileDossierOpen;
      scrim.classList.toggle('visible', state.mobileDossierOpen);
    }

    const headerRow = el('div', { className: 'dossier-header-row' }, [
      el('div', {}, [
        el('div', { className: 'char-meta-badges' }, [
          el('span', { className: 'earth-badge', text: resolved.earth }),
          el('span', { className: 'omega-badge', text: resolved.tier.badge }),
          ch.omegaMutant ? el('span', { className: 'omega-badge', text: 'OMEGA X-GENE' }) : null
        ]),
        el('h2', { className: 'section-title', text: ch.name }),
        el('p', { className: 'char-alias', text: `${ch.civilian} • ${ch.title}` })
      ]),
      el(
        'button',
        {
          type: 'button',
          className: 'dossier-close-mobile',
          attrs: { 'aria-label': 'Close Dossier' },
          on: {
            click: () => {
              state.mobileDossierOpen = false;
              renderDossierInspector();
            }
          }
        },
        [createUiIconSvg('close', 18)]
      )
    ]);

    const coverBtn = el(
      'button',
      {
        type: 'button',
        className: 'vitrine-cover-btn',
        attrs: { 'aria-label': `Zoom ${ch.name} — ${resolved.variantName} cover plate` },
        on: {
          click: (evt) => openLightbox(resolved, plate, evt.currentTarget)
        }
      },
      [
        createCollectorArtFrame(resolved, plate, {
          variant: 'inspector',
          rarityClass: artEntry ? artEntry.rarityClass : 'key-issue'
        }),
        el('span', { className: 'vitrine-zoom-hint', text: tr('zoomCover') })
      ]
    );

    const vitrine = el('div', { className: 'dossier-vitrine' }, [
      coverBtn,
      el('div', { className: 'collector-plaque' }, [
        el('span', {
          className: 'collector-plaque-heading',
          text: `${artEntry ? artEntry.catalogueNo : 'MVO-001'} · ${plate ? plate.mediumLabel : 'Omnibus Plate'}`
        }),
        el('h3', { className: 'collector-plaque-title', text: resolved.variantName }),
        el('p', { className: 'collector-plaque-meta', text: `${tr('firstAppearance')}: ${ch.firstAppearance}` }),
        el('p', { className: 'collector-plaque-meta', text: `${tr('creatorsLabel')}: ${ch.creators}` }),
        el('p', { className: 'power-score-num tabular-nums', text: `PWR ${resolved.powerScore} · Grid ${resolved.gridTotal}/42` })
      ])
    ]);

    // Variant Selector Pills inside Dossier
    const varPills = el('div', { className: 'variant-pills-row' });
    resolved.availableVariants.forEach((v) => {
      const isAct = v.id === resolved.variantId;
      varPills.appendChild(
        el('button', {
          type: 'button',
          className: `variant-pill-btn${isAct ? ' active' : ''}`,
          text: v.name.includes(v.earth) ? v.name : `${v.name} (${v.earth})`,
          attrs: { 'aria-pressed': String(isAct) },
          on: {
            click: () => selectCharacter(ch.id, v.id, state.mobileDossierOpen)
          }
        })
      );
    });

    const ctaRow = el('div', { className: 'dossier-cta-row' }, [
      el(
        'button',
        {
          type: 'button',
          className: 'btn-primary-cta',
          on: {
            click: () => {
              if (state.clashTargetSlot === 'A') {
                state.clashFighterA = ch.id;
                state.clashVariantA = resolved.variantId;
                state.clashTargetSlot = 'B';
              } else {
                state.clashFighterB = ch.id;
                state.clashVariantB = resolved.variantId;
                state.clashTargetSlot = 'A';
              }
              state.mobileDossierOpen = false;
              state.activeTab = 'arena';
              syncHeaderChrome();
              syncUrlBar();
              renderActiveTab();
              renderDossierInspector();
            }
          }
        },
        [createUiIconSvg('swords', 15), tr('sendToArena')]
      ),
      el(
        'button',
        {
          type: 'button',
          className: 'btn-secondary-cta',
          on: { click: () => triggerNarration(resolved) }
        },
        [createUiIconSvg(state.audioState === 'idle' ? 'volume' : 'stop', 15), state.audioState === 'idle' ? tr('readAloud') : tr('stopAudio')]
      )
    ]);

    const ohotmuGrid = el('div', { className: 'ohotmu-grid-list' }, [
      el('div', { className: 'ohotmu-stat-item' }, [el('span', { text: tr('gridIntelligence') }), el('span', { className: 'ohotmu-stat-val tabular-nums', text: `${resolved.grid.intelligence}/7` })]),
      el('div', { className: 'ohotmu-stat-item' }, [el('span', { text: tr('gridStrength') }), el('span', { className: 'ohotmu-stat-val tabular-nums', text: `${resolved.grid.strength}/7` })]),
      el('div', { className: 'ohotmu-stat-item' }, [el('span', { text: tr('gridSpeed') }), el('span', { className: 'ohotmu-stat-val tabular-nums', text: `${resolved.grid.speed}/7` })]),
      el('div', { className: 'ohotmu-stat-item' }, [el('span', { text: tr('gridDurability') }), el('span', { className: 'ohotmu-stat-val tabular-nums', text: `${resolved.grid.durability}/7` })]),
      el('div', { className: 'ohotmu-stat-item' }, [el('span', { text: tr('gridEnergy') }), el('span', { className: 'ohotmu-stat-val tabular-nums', text: `${resolved.grid.energy}/7` })]),
      el('div', { className: 'ohotmu-stat-item' }, [el('span', { text: tr('gridFighting') }), el('span', { className: 'ohotmu-stat-val tabular-nums', text: `${resolved.grid.fighting}/7` })])
    ]);

    const abilityTags = el('div', { className: 'ability-tags' }, [
      el('span', { className: 'ability-tag', text: `Variant Gear: ${resolved.signature}` }),
      ...(ch.abilities || []).map((ab) => el('span', { className: 'ability-tag', text: ab }))
    ]);

    inspector.appendChild(headerRow);
    inspector.appendChild(vitrine);
    inspector.appendChild(
      el('div', {}, [
        el('div', { className: 'dossier-section-title', text: `${tr('variantsLabel')} (${resolved.availableVariants.length})` }),
        varPills
      ])
    );
    inspector.appendChild(ctaRow);
    inspector.appendChild(el('blockquote', { className: 'dossier-quote', text: `“${ch.quote}”` }));
    inspector.appendChild(
      el('div', {}, [
        el('div', { className: 'dossier-section-title', text: 'Active Variant Continuity Note' }),
        el('p', { className: 'dossier-bio', text: resolved.note })
      ])
    );
    inspector.appendChild(
      el('div', {}, [
        el('div', {
          className: 'dossier-section-title',
          text: state.audience === 'kid' ? 'Young Hero Summary' : 'Official Handbook (OHOTMU) Lore'
        }),
        el('p', {
          className: 'dossier-bio',
          text: state.audience === 'kid' ? ch.kidBio : ch.adultBio
        })
      ])
    );
    inspector.appendChild(
      el('div', {}, [
        el('div', { className: 'dossier-section-title', text: 'Official Marvel 1–7 Power Grid' }),
        el('div', { className: 'radar-wrap' }, [
          createOhotmuRadarSvg(resolved, null, ['INT', 'STR', 'SPD', 'DUR', 'NRG', 'FGT'])
        ]),
        ohotmuGrid
      ])
    );
    inspector.appendChild(
      el('div', {}, [
        el('div', { className: 'dossier-section-title', text: 'Signature Powers & Arsenal' }),
        abilityTags
      ])
    );

    // Mobile Bottom Quick Bar
    const mobileBar = document.getElementById('mobile-dossier-bar');
    if (mobileBar) {
      clearEl(mobileBar);
      mobileBar.appendChild(
        el('div', {}, [
          el('strong', { text: `${ch.name} · ${resolved.earth}` }),
          el('div', { className: 'kpi-sub', text: resolved.variantName })
        ])
      );
      mobileBar.appendChild(
        el('button', {
          type: 'button',
          className: 'btn-primary-cta',
          text: 'Inspect Variant',
          on: {
            click: () => {
              state.mobileDossierOpen = true;
              renderDossierInspector();
            }
          }
        })
      );
    }
  }

  function openLightbox(resolved, plate, triggerNode) {
    state.lastLightboxTrigger = triggerNode || document.activeElement;
    const modal = document.getElementById('collector-lightbox');
    clearEl(modal);
    modal.hidden = false;

    const closeBtn = el(
      'button',
      {
        type: 'button',
        id: 'btn-close-lightbox',
        className: 'btn-primary-cta',
        on: { click: closeLightbox }
      },
      [createUiIconSvg('close', 16), 'Close Collector Loupe (Esc)']
    );

    const dialogCard = el('div', { className: 'lightbox-dialog-card' }, [
      el('div', { className: 'lightbox-cover-stage' }, [
        createCollectorArtFrame(resolved, plate, {
          variant: 'lightbox',
          rarityClass: plate ? plate.rarityClass : 'omnibus-mythic'
        })
      ]),
      el('div', { className: 'collector-plaque' }, [
        el('span', {
          className: 'collector-plaque-heading',
          text: plate ? `${plate.catalogueNo} · ${plate.mediumLabel}` : 'MARVEL OMNIBUS ARCHIVE'
        }),
        el('h2', { className: 'section-title', text: `${resolved.character.name} — ${resolved.variantName}` }),
        el('p', { className: 'char-debut', text: `${resolved.earth}  •  ${resolved.character.firstAppearance}` }),
        el('p', { className: 'collector-plaque-meta', text: `Creators: ${resolved.character.creators}` }),
        el('blockquote', { className: 'dossier-quote', text: `“${resolved.character.quote}”` }),
        el('p', { className: 'dossier-bio', text: resolved.note }),
        closeBtn
      ])
    ]);

    modal.addEventListener(
      'click',
      (evt) => {
        if (evt.target === modal) closeLightbox();
      },
      { once: true }
    );

    modal.appendChild(dialogCard);
    closeBtn.focus();
  }

  function closeLightbox() {
    const modal = document.getElementById('collector-lightbox');
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    clearEl(modal);
    if (state.lastLightboxTrigger && typeof state.lastLightboxTrigger.focus === 'function') {
      state.lastLightboxTrigger.focus();
    }
  }

  function selectCharacter(charId, variantId, openMobileIfNarrow) {
    state.selectedCharacterId = charId;
    if (variantId) {
      state.selectedVariantByChar[charId] = variantId;
    }
    if (openMobileIfNarrow && typeof window !== 'undefined' && window.innerWidth <= 1120) {
      state.mobileDossierOpen = true;
    }
    syncUrlBar();
    if (state.activeTab === 'characters') {
      updateRosterGridInPlace();
    } else if (state.activeTab === 'xmen') {
      renderActiveTab();
    }
    renderDossierInspector();
  }

  function triggerNarration(resolvedArg) {
    if (state.audioState !== 'idle') {
      AUDIO.stopSpeaking();
      state.audioState = 'idle';
      updateReadAloudButton();
      renderDossierInspector();
      return;
    }
    const resolved = resolvedArg || getResolvedSelected();
    const ch = resolved.character;
    const bio = state.audience === 'kid' ? ch.kidBio : ch.adultBio;
    const narrationText = `${ch.name}. ${resolved.variantName}, ${resolved.earth}. ${resolved.note} ${bio}`;
    AUDIO.speakText(narrationText, state.lang, ch, (nextAudioState) => {
      state.audioState = nextAudioState;
      updateReadAloudButton();
      renderDossierInspector();
    });
  }

  function renderActiveTab() {
    const host = document.getElementById('tab-panel-host');
    clearEl(host);
    if (state.activeTab === 'arena') {
      renderBattleworldArenaTab(host);
    } else if (state.activeTab === 'xmen') {
      renderXmenOmegaTab(host);
    } else if (state.activeTab === 'multiverse') {
      renderMultiverseMapTab(host);
    } else if (state.activeTab === 'factions') {
      renderFactionsTab(host);
    } else if (state.activeTab === 'forge') {
      renderInfinityForgeAndQuizTab(host);
    } else if (state.activeTab === 'vault') {
      renderCoverVaultTab(host);
    } else {
      renderCharactersTab(host);
    }
  }

  function bindGlobalEvents() {
    document.getElementById('lang-select').addEventListener('change', (e) => {
      state.lang = e.target.value;
      try {
        localStorage.setItem(I18N.STORAGE_KEY, state.lang);
      } catch (_err) {}
      applyDocumentRootAttrs();
      syncHeaderChrome();
      renderKpiStrip();
      renderActiveTab();
      renderDossierInspector();
      syncUrlBar();
    });

    document.getElementById('btn-mode-adult').addEventListener('click', () => {
      state.audience = 'adult';
      applyDocumentRootAttrs();
      syncHeaderChrome();
      renderActiveTab();
      renderDossierInspector();
      syncUrlBar();
    });

    document.getElementById('btn-mode-kid').addEventListener('click', () => {
      state.audience = 'kid';
      applyDocumentRootAttrs();
      syncHeaderChrome();
      renderActiveTab();
      renderDossierInspector();
      syncUrlBar();
    });

    document.getElementById('era-select').addEventListener('change', (e) => {
      state.era = e.target.value;
      renderKpiStrip();
      renderActiveTab();
      renderDossierInspector();
      syncUrlBar();
    });

    document.getElementById('chirp-persona-select').addEventListener('change', (e) => {
      AUDIO.setPersona(e.target.value);
    });

    document.getElementById('btn-read-aloud').addEventListener('click', () => {
      triggerNarration();
    });

    document.getElementById('btn-share-link').addEventListener('click', async () => {
      syncUrlBar();
      const shareUrl = window.location.href;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(shareUrl);
        }
      } catch (_e) {}
      const toast = document.getElementById('share-toast');
      if (toast) {
        toast.textContent = tr('linkCopied');
        toast.hidden = false;
        setTimeout(() => {
          toast.hidden = true;
        }, 2400);
      }
    });

    document.getElementById('btn-theme-dark').addEventListener('click', () => {
      state.theme = 'dark';
      try {
        localStorage.setItem(THEME_STORAGE_KEY, 'dark');
      } catch (_e) {}
      applyDocumentRootAttrs();
      syncHeaderChrome();
    });

    document.getElementById('btn-theme-light').addEventListener('click', () => {
      state.theme = 'light';
      try {
        localStorage.setItem(THEME_STORAGE_KEY, 'light');
      } catch (_e) {}
      applyDocumentRootAttrs();
      syncHeaderChrome();
    });

    const tabButtons = Array.from(document.querySelectorAll('.tab-btn'));
    tabButtons.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        state.activeTab = btn.dataset.tab;
        syncHeaderChrome();
        syncUrlBar();
        renderActiveTab();
      });

      btn.addEventListener('keydown', (evt) => {
        const isRtl = I18N.getLanguageDir(state.lang) === 'rtl';
        let nextIdx = -1;
        if (evt.key === 'ArrowRight') nextIdx = isRtl ? idx - 1 : idx + 1;
        else if (evt.key === 'ArrowLeft') nextIdx = isRtl ? idx + 1 : idx - 1;
        else if (evt.key === 'Home') nextIdx = 0;
        else if (evt.key === 'End') nextIdx = tabButtons.length - 1;

        if (nextIdx !== -1) {
          evt.preventDefault();
          const wrapped = (nextIdx + tabButtons.length) % tabButtons.length;
          tabButtons[wrapped].focus();
          tabButtons[wrapped].click();
        }
      });
    });

    const scrim = document.getElementById('inspector-scrim');
    if (scrim) {
      scrim.addEventListener('click', () => {
        state.mobileDossierOpen = false;
        renderDossierInspector();
      });
    }

    document.addEventListener('keydown', (evt) => {
      if (evt.key === 'Escape') {
        const modal = document.getElementById('collector-lightbox');
        if (modal && !modal.hidden) {
          closeLightbox();
        } else if (state.mobileDossierOpen) {
          state.mobileDossierOpen = false;
          renderDossierInspector();
        }
      }
    });
  }

  function init() {
    applyDocumentRootAttrs();
    syncHeaderChrome();
    renderKpiStrip();
    renderActiveTab();
    renderDossierInspector();
    bindGlobalEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : globalThis);
