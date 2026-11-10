/**
 * Marvel Multiverse & Omnibus Atlas — 11-Language Localization & Deep-Link State Engine
 * Exact 11-language parity with Atlas of Wonder & Shinobi Atlas:
 *   en, es, zh, yue, ja, ko, pt, fr, it, de, ar (with RTL dir="rtl")
 */

(function initMarvelI18n(root) {
  'use strict';

  const LANGUAGE_CODES = Object.freeze([
    'en',
    'es',
    'zh',
    'yue',
    'ja',
    'ko',
    'pt',
    'fr',
    'it',
    'de',
    'ar'
  ]);

  const RTL_LANGUAGES = Object.freeze(['ar']);
  const STORAGE_KEY = 'aow-lang';

  const ALLOWED_TABS = new Set([
    'characters',
    'arena',
    'xmen',
    'multiverse',
    'factions',
    'forge',
    'vault'
  ]);
  const ALLOWED_ERAS = new Set(['silver', 'bronze', 'modern', 'multiverse']);
  const ALLOWED_AUDIENCE = new Set(['kid', 'adult']);
  const ALLOWED_THEMES = new Set(['dark', 'light']);

  function normalizeLangTag(raw) {
    if (!raw || typeof raw !== 'string') return '';
    const lower = raw.trim().toLowerCase().replace(/_/g, '-');
    if (!lower) return '';
    if (lower === 'yue' || lower.startsWith('yue-') || lower === 'zh-hk' || lower === 'zh-mo') {
      return 'yue';
    }
    if (lower === 'zh' || lower.startsWith('zh-') || lower === 'cmn' || lower.startsWith('cmn-')) {
      return 'zh';
    }
    const base = lower.split('-')[0];
    return LANGUAGE_CODES.includes(base) ? base : '';
  }

  function resolveLanguage(ctx) {
    const options = ctx || {};
    if (options.search) {
      try {
        const sp = new URLSearchParams(options.search);
        const fromQuery = normalizeLangTag(sp.get('lang') || '');
        if (fromQuery) return fromQuery;
      } catch (_e) {
        // Ignore malformed query
      }
    }
    if (options.stored) {
      const fromStored = normalizeLangTag(options.stored);
      if (fromStored) return fromStored;
    }
    if (Array.isArray(options.navigatorLanguages)) {
      for (const nav of options.navigatorLanguages) {
        const matched = normalizeLangTag(nav);
        if (matched) return matched;
      }
    }
    return 'en';
  }

  function getLanguageDir(lang) {
    return RTL_LANGUAGES.includes(lang) ? 'rtl' : 'ltr';
  }

  const UI_STRINGS = {
    en: {
      brandTitle: 'MARVEL MULTIVERSE ATLAS',
      brandSubtitle: 'X-Men • Avengers • Spider-Verse • Fantastic Four • 215+ Multiverse Variants & OHOTMU Power Grid',
      langLabel: 'Lang:',
      eraLabel: 'Saga Shield:',
      modeKid: 'Young Hero',
      modeAdult: 'Omnibus Lore',
      readAloud: 'Narrate',
      stopAudio: 'Stop Audio',
      synthesizing: 'Synthesizing…',
      shareLink: 'Share Link',
      linkCopied: 'Multiverse Link Copied!',
      themeDark: 'Night',
      themeLight: 'Newsprint',
      tabCharacters: 'Roster & Variants',
      tabArena: '1v1 Battleworld',
      tabXmen: 'X-Men & Omega',
      tabMultiverse: 'Multiverse Map',
      tabFactions: 'Teams & Cabals',
      tabForge: 'Infinity Forge & Quiz',
      tabVault: 'Cover Vault',
      kpiIcons: 'Canonical Icons',
      kpiVariants: 'Playable Variants',
      kpiEarths: 'Mapped Realities',
      kpiOmegas: 'Omega Mutants',
      searchPlaceholder: 'Search hero, alias, Earth-616 / 1610 / 295, creator, or variant…',
      teamAll: 'All Teams',
      teamXmen: 'X-Men & Mutants',
      teamAvengers: 'Avengers',
      teamSpider: 'Spider-Verse & Midnight',
      teamFF: 'Fantastic Four & Cosmic',
      teamCabal: 'Omega Villains & Cabal',
      originAll: 'All Origins',
      earthAll: 'All Realities',
      sortPower: 'Sort: Power Score',
      sortGrid: 'Sort: OHOTMU Grid (42)',
      sortVariants: 'Sort: Most Variants',
      sortName: 'Sort: Name (A–Z)',
      variantsLabel: 'Multiverse Variants',
      sendToArena: 'Send Variant to 1v1 Arena',
      swapFighters: 'Swap Combatants',
      randomIncursion: 'Random Multiverse Clash',
      gridIntelligence: 'Intelligence',
      gridStrength: 'Strength',
      gridSpeed: 'Speed',
      gridDurability: 'Durability',
      gridEnergy: 'Energy Proj.',
      gridFighting: 'Fighting Skills',
      firstAppearance: 'First Appearance',
      creatorsLabel: 'Creators',
      zoomCover: 'Loupe'
    },
    es: {
      brandTitle: 'ATLAS DEL MULTIVERSO MARVEL',
      brandSubtitle: 'X-Men • Vengadores • Spider-Verse • 4 Fantásticos • +190 Variantes y Escala Oficial OHOTMU',
      langLabel: 'Idioma:',
      eraLabel: 'Saga:',
      modeKid: 'Joven Héroe',
      modeAdult: 'Lore Ómnibus',
      readAloud: 'Narrar',
      stopAudio: 'Detener',
      synthesizing: 'Sintetizando…',
      shareLink: 'Compartir',
      linkCopied: '¡Enlace copiado!',
      themeDark: 'Noche',
      themeLight: 'Cómic Clásico',
      tabCharacters: 'Héroes y Variantes',
      tabArena: '1v1 Battleworld',
      tabXmen: 'X-Men y Omega',
      tabMultiverse: 'Mapa Multiversal',
      tabFactions: 'Equipos y Cábalas',
      tabForge: 'Forja del Infinito y Quiz',
      tabVault: 'Bóveda de Portadas',
      kpiIcons: 'Íconos Canónicos',
      kpiVariants: 'Variantes Jugables',
      kpiEarths: 'Tierras Mapeadas',
      kpiOmegas: 'Mutantes Omega',
      searchPlaceholder: 'Buscar héroe, Tierra-616 / 1610 / 295, creador o variante…',
      teamAll: 'Todos',
      teamXmen: 'X-Men y Mutantes',
      teamAvengers: 'Vengadores',
      teamSpider: 'Spider-Verse y Medianoche',
      teamFF: '4 Fantásticos y Cósmicos',
      teamCabal: 'Villanos Omega',
      originAll: 'Todos los Orígenes',
      earthAll: 'Todas las Realidades',
      sortPower: 'Orden: Poder',
      sortGrid: 'Orden: Escala OHOTMU (42)',
      sortVariants: 'Orden: Más Variantes',
      sortName: 'Orden: Nombre (A–Z)',
      variantsLabel: 'Variantes del Multiverso',
      sendToArena: 'Enviar Variante a Arena 1v1',
      swapFighters: 'Intercambiar',
      randomIncursion: 'Choque Aleatorio',
      gridIntelligence: 'Inteligencia',
      gridStrength: 'Fuerza',
      gridSpeed: 'Velocidad',
      gridDurability: 'Durabilidad',
      gridEnergy: 'Proy. Energía',
      gridFighting: 'Combate',
      firstAppearance: 'Primera Aparición',
      creatorsLabel: 'Creadores',
      zoomCover: 'Lupa'
    },
    zh: {
      brandTitle: '漫威多元宇宙全书图鉴',
      brandSubtitle: 'X战警 • 复仇者联盟 • 蜘蛛宇宙 • 神奇四侠 • 215+多元变体与官方能力网格',
      langLabel: '语言:',
      eraLabel: '时代护盾:',
      modeKid: '少年英雄',
      modeAdult: '典藏设定',
      readAloud: '语音朗读',
      stopAudio: '停止播放',
      synthesizing: '合成中…',
      shareLink: '分享链接',
      linkCopied: '已复制多元宇宙链接！',
      themeDark: '暗夜',
      themeLight: '漫刊纸本',
      tabCharacters: '角色与多元变体',
      tabArena: '1v1 斗界竞技场',
      tabXmen: 'X战警与欧米茄级',
      tabMultiverse: '多元宇宙星图',
      tabFactions: '战队与秘密结社',
      tabForge: '无限熔炉与问答',
      tabVault: '典藏封面库',
      kpiIcons: '经典传奇角色',
      kpiVariants: '可切换多元变体',
      kpiEarths: '平行地球节点',
      kpiOmegas: '欧米茄级变种人',
      searchPlaceholder: '搜索英雄、616/1610/295宇宙、创作者或变体…',
      teamAll: '全部阵营',
      teamXmen: 'X战警与变种人',
      teamAvengers: '复仇者联盟',
      teamSpider: '蜘蛛宇宙与午夜之子',
      teamFF: '神奇四侠与宇宙神明',
      teamCabal: '欧米茄霸主与反派',
      originAll: '全部起源',
      earthAll: '全部平行宇宙',
      sortPower: '排序：战力评分',
      sortGrid: '排序：官方能力总和',
      sortVariants: '排序：变体数量',
      sortName: '排序：名称 (A–Z)',
      variantsLabel: '多元宇宙变体切换',
      sendToArena: '派此变体进入 1v1 斗界',
      swapFighters: '交换双方',
      randomIncursion: '随机多元对决',
      gridIntelligence: '智力',
      gridStrength: '力量',
      gridSpeed: '速度',
      gridDurability: '耐力',
      gridEnergy: '能量发射',
      gridFighting: '战斗技巧',
      firstAppearance: '首次登场',
      creatorsLabel: '创作者',
      zoomCover: '放大'
    },
    yue: {
      brandTitle: '漫威多元宇宙典藏圖鑑',
      brandSubtitle: 'X戰警 • 復仇者聯盟 • 蜘蛛宇宙 • 神奇四俠 • 215+多元變體與官方戰力網格',
      langLabel: '語言:',
      eraLabel: '時代護盾:',
      modeKid: '少年英雄',
      modeAdult: '資深設定',
      readAloud: '語音導賞',
      stopAudio: '停止播放',
      synthesizing: '合成緊…',
      shareLink: '分享連結',
      linkCopied: '已複製連結！',
      themeDark: '星際暗夜',
      themeLight: '復古漫紙',
      tabCharacters: '角色與變體',
      tabArena: '1v1 鬥界對決',
      tabXmen: 'X戰警與Omega',
      tabMultiverse: '多元宇宙地圖',
      tabFactions: '戰隊與結社',
      tabForge: '無限寶石與問答',
      tabVault: '封面典藏館',
      kpiIcons: '經典角色',
      kpiVariants: '多元宇宙變體',
      kpiEarths: '平行地球',
      kpiOmegas: 'Omega變種人',
      searchPlaceholder: '搜尋英雄、Earth-616 / 1610 / 295、創作者或變體…',
      teamAll: '全部陣營',
      teamXmen: 'X戰警與變種人',
      teamAvengers: '復仇者聯盟',
      teamSpider: '蜘蛛宇宙與街頭',
      teamFF: '神奇四俠與宇宙',
      teamCabal: '終極反派結社',
      originAll: '全部起源',
      earthAll: '全部宇宙',
      sortPower: '排序：戰力評分',
      sortGrid: '排序：OHOTMU總分',
      sortVariants: '排序：最多變體',
      sortName: '排序：名稱 (A–Z)',
      variantsLabel: '多元宇宙變體',
      sendToArena: '送此變體入 1v1 鬥界',
      swapFighters: '對調角色',
      randomIncursion: '隨機多元碰撞',
      gridIntelligence: '智力',
      gridStrength: '力量',
      gridSpeed: '速度',
      gridDurability: '防禦耐力',
      gridEnergy: '能量投射',
      gridFighting: '格鬥技巧',
      firstAppearance: '首次登場',
      creatorsLabel: '創作者',
      zoomCover: '放大'
    },
    ja: {
      brandTitle: 'マーベル・マルチバース大図鑑',
      brandSubtitle: 'X-MEN • アベンジャーズ • スパイダーバース • 190種以上の変異体＆公式パワーグリッド',
      langLabel: '言語:',
      eraLabel: '時代設定:',
      modeKid: 'キッズ解説',
      modeAdult: 'オムニバス詳説',
      readAloud: '音声ガイド',
      stopAudio: '停止',
      synthesizing: '音声生成中…',
      shareLink: '共有リンク',
      linkCopied: 'リンクをコピーしました！',
      themeDark: 'ダーク',
      themeLight: 'コミック紙',
      tabCharacters: 'ヒーロー＆変異体',
      tabArena: '1v1 バトルワールド',
      tabXmen: 'X-MEN＆オメガ級',
      tabMultiverse: 'マルチバース地図',
      tabFactions: 'チーム＆結社',
      tabForge: 'インフィニティ＆クイズ',
      tabVault: 'カバー保管庫',
      kpiIcons: '収録レジェンド',
      kpiVariants: 'マルチバース変異体',
      kpiEarths: '並行アース数',
      kpiOmegas: 'オメガ級ミュータント',
      searchPlaceholder: '名前、アース616/1610/295、作者、変異体で検索…',
      teamAll: '全チーム',
      teamXmen: 'X-MEN＆ミュータント',
      teamAvengers: 'アベンジャーズ',
      teamSpider: 'スパイダーバース',
      teamFF: 'ファンタスティック・フォー＆宇宙',
      teamCabal: 'オメガ・ヴィラン',
      originAll: '全オリジン',
      earthAll: '全リアリティ',
      sortPower: '並び順: パワー値',
      sortGrid: '並び順: 公式グリッド計',
      sortVariants: '並び順: 変異体数',
      sortName: '並び順: 名前順',
      variantsLabel: 'マルチバース変異体切替',
      sendToArena: 'この変異体で1v1対戦へ',
      swapFighters: '入れ替え',
      randomIncursion: 'ランダム対決',
      gridIntelligence: '知能',
      gridStrength: '腕力',
      gridSpeed: '速度',
      gridDurability: '耐久性',
      gridEnergy: 'エネルギー放出',
      gridFighting: '戦闘技術',
      firstAppearance: '初登場コミック',
      creatorsLabel: 'クリエイター',
      zoomCover: '拡大'
    },
    ko: {
      brandTitle: '마블 멀티버스 옴니버스 아틀라스',
      brandSubtitle: '엑스맨 • 어벤져스 • 스파이더버스 • 판타스틱 4 • 215+ 멀티버스 변종 및 공식 파워 그리드',
      langLabel: '언어:',
      eraLabel: '사가 필터:',
      modeKid: '영 히어로',
      modeAdult: '옴니버스 로어',
      readAloud: '음성 낭독',
      stopAudio: '정지',
      synthesizing: '합성 중…',
      shareLink: '링크 공유',
      linkCopied: '멀티버스 링크 복사됨!',
      themeDark: '다크',
      themeLight: '코믹 북',
      tabCharacters: '로스터 및 변종',
      tabArena: '1v1 배틀월드',
      tabXmen: '엑스맨 및 오메가',
      tabMultiverse: '멀티버스 맵',
      tabFactions: '팀 및 결사대',
      tabForge: '인피니티 포지 & 퀴즈',
      tabVault: '커버 아트 볼트',
      kpiIcons: '정사 캐릭터',
      kpiVariants: '플레이 가능 변종',
      kpiEarths: '멀티버스 지구',
      kpiOmegas: '오메가 뮤턴트',
      searchPlaceholder: '영웅, 지구-616/1610/295, 작가 또는 변종 검색…',
      teamAll: '전체 팀',
      teamXmen: '엑스맨 & 뮤턴트',
      teamAvengers: '어벤져스',
      teamSpider: '스파이더버스 & 미드나잇',
      teamFF: '판타스틱 4 & 코스믹',
      teamCabal: '오메가 빌런',
      originAll: '전체 기원',
      earthAll: '전체 현실',
      sortPower: '정렬: 파워 점수',
      sortGrid: '정렬: 공식 그리드 합계',
      sortVariants: '정렬: 변종 수',
      sortName: '정렬: 이름순',
      variantsLabel: '멀티버스 변종 선택',
      sendToArena: '이 변종을 1v1 아레나로 전송',
      swapFighters: '파이터 교체',
      randomIncursion: '랜덤 인커전 매치',
      gridIntelligence: '지능',
      gridStrength: '근력',
      gridSpeed: '속도',
      gridDurability: '내구력',
      gridEnergy: '에너지 투사',
      gridFighting: '전투 기술',
      firstAppearance: '첫 등장 이슈',
      creatorsLabel: '창작자',
      zoomCover: '확대'
    },
    pt: {
      brandTitle: 'ATLAS DO MULTIVERSO MARVEL',
      brandSubtitle: 'X-Men • Vingadores • Aranhaverso • Quarteto Fantástico • +190 Variantes e Grade Oficial',
      langLabel: 'Idioma:',
      eraLabel: 'Saga:',
      modeKid: 'Jovem Herói',
      modeAdult: 'Lore Ônibus',
      readAloud: 'Narrar',
      stopAudio: 'Parar',
      synthesizing: 'Sintetizando…',
      shareLink: 'Compartilhar',
      linkCopied: 'Link copiado!',
      themeDark: 'Noite',
      themeLight: 'HQ Clássica',
      tabCharacters: 'Elenco e Variantes',
      tabArena: '1v1 Mundo Bélico',
      tabXmen: 'X-Men e Ômega',
      tabMultiverse: 'Mapa do Multiverso',
      tabFactions: 'Equipes e Cabalas',
      tabForge: 'Manopla e Quiz',
      tabVault: 'Cofre de Capas',
      kpiIcons: 'Ícones Canônicos',
      kpiVariants: 'Variantes Jogáveis',
      kpiEarths: 'Terras Mapeadas',
      kpiOmegas: 'Mutantes Ômega',
      searchPlaceholder: 'Buscar herói, Terra-616 / 1610 / 295, criador ou variante…',
      teamAll: 'Todas Equipes',
      teamXmen: 'X-Men e Mutantes',
      teamAvengers: 'Vingadores',
      teamSpider: 'Aranhaverso e Urbano',
      teamFF: 'Quarteto e Cósmicos',
      teamCabal: 'Vilões Ômega',
      originAll: 'Todas Origens',
      earthAll: 'Todas Realidades',
      sortPower: 'Ordem: Poder',
      sortGrid: 'Ordem: Grade OHOTMU',
      sortVariants: 'Ordem: Mais Variantes',
      sortName: 'Ordem: Nome (A–Z)',
      variantsLabel: 'Variantes do Multiverso',
      sendToArena: 'Enviar Variante à Arena 1v1',
      swapFighters: 'Trocar Lutadores',
      randomIncursion: 'Incursão Aleatória',
      gridIntelligence: 'Inteligência',
      gridStrength: 'Força',
      gridSpeed: 'Velocidade',
      gridDurability: 'Durabilidade',
      gridEnergy: 'Proj. Energia',
      gridFighting: 'Combate',
      firstAppearance: 'Primeira Aparição',
      creatorsLabel: 'Criadores',
      zoomCover: 'Lupa'
    },
    fr: {
      brandTitle: 'ATLAS DU MULTIVERS MARVEL',
      brandSubtitle: 'X-Men • Avengers • Spider-Verse • 4 Fantastiques • +190 Variants & Grille Officielle',
      langLabel: 'Langue:',
      eraLabel: 'Saga:',
      modeKid: 'Jeune Héros',
      modeAdult: 'Lore Omnibus',
      readAloud: 'Écouter',
      stopAudio: 'Arrêter',
      synthesizing: 'Synthèse…',
      shareLink: 'Partager',
      linkCopied: 'Lien copié !',
      themeDark: 'Nuit',
      themeLight: 'Édition Papier',
      tabCharacters: 'Héros & Variants',
      tabArena: '1v1 Battleworld',
      tabXmen: 'X-Men & Oméga',
      tabMultiverse: 'Carte du Multivers',
      tabFactions: 'Équipes & Cabales',
      tabForge: 'Forge de l’Infini & Quiz',
      tabVault: 'Galerie Couvertures',
      kpiIcons: 'Icônes Canoniques',
      kpiVariants: 'Variants Jouables',
      kpiEarths: 'Terres Cartographiées',
      kpiOmegas: 'Mutants Oméga',
      searchPlaceholder: 'Rechercher héros, Terre-616 / 1610 / 295, créateur ou variant…',
      teamAll: 'Toutes Équipes',
      teamXmen: 'X-Men & Mutants',
      teamAvengers: 'Avengers',
      teamSpider: 'Spider-Verse & Minuit',
      teamFF: '4 Fantastiques & Cosmique',
      teamCabal: 'Conquérants Oméga',
      originAll: 'Toutes Origines',
      earthAll: 'Toutes Réalités',
      sortPower: 'Tri : Puissance',
      sortGrid: 'Tri : Grille OHOTMU',
      sortVariants: 'Tri : Plus de Variants',
      sortName: 'Tri : Nom (A–Z)',
      variantsLabel: 'Variants du Multivers',
      sendToArena: 'Envoyer ce Variant en Arène 1v1',
      swapFighters: 'Inverser',
      randomIncursion: 'Incursion Aléatoire',
      gridIntelligence: 'Intelligence',
      gridStrength: 'Force',
      gridSpeed: 'Vitesse',
      gridDurability: 'Durabilité',
      gridEnergy: 'Énergie',
      gridFighting: 'Combat',
      firstAppearance: 'Première Apparition',
      creatorsLabel: 'Créateurs',
      zoomCover: 'Loupe'
    },
    it: {
      brandTitle: 'ATLANTE DEL MULTIVERSO MARVEL',
      brandSubtitle: 'X-Men • Avengers • Spider-Verse • Fantastici 4 • +190 Varianti e Griglia Ufficiale',
      langLabel: 'Lingua:',
      eraLabel: 'Saga:',
      modeKid: 'Giovane Eroe',
      modeAdult: 'Lore Omnibus',
      readAloud: 'Ascolta',
      stopAudio: 'Ferma',
      synthesizing: 'Sintesi…',
      shareLink: 'Condividi',
      linkCopied: 'Link copiato!',
      themeDark: 'Notte',
      themeLight: 'Carta Fumetto',
      tabCharacters: 'Eroi e Varianti',
      tabArena: '1v1 Battleworld',
      tabXmen: 'X-Men e Omega',
      tabMultiverse: 'Mappa Multiverso',
      tabFactions: 'Squadre e Cabale',
      tabForge: 'Forgia dell’Infinito & Quiz',
      tabVault: 'Archivio Copertine',
      kpiIcons: 'Icone Canoniche',
      kpiVariants: 'Varianti Giocabili',
      kpiEarths: 'Terre Mappate',
      kpiOmegas: 'Mutanti Omega',
      searchPlaceholder: 'Cerca eroe, Terra-616 / 1610 / 295, autore o variante…',
      teamAll: 'Tutte le Squadre',
      teamXmen: 'X-Men e Mutanti',
      teamAvengers: 'Avengers',
      teamSpider: 'Spider-Verse e Midnight',
      teamFF: 'Fantastici 4 e Cosmici',
      teamCabal: 'Villain Omega',
      originAll: 'Tutte le Origini',
      earthAll: 'Tutte le Realtà',
      sortPower: 'Ordina: Potenza',
      sortGrid: 'Ordina: Griglia OHOTMU',
      sortVariants: 'Ordina: Più Varianti',
      sortName: 'Ordina: Nome (A–Z)',
      variantsLabel: 'Varianti del Multiverso',
      sendToArena: 'Invia Variante all’Arena 1v1',
      swapFighters: 'Scambia',
      randomIncursion: 'Incursione Casuale',
      gridIntelligence: 'Intelligenza',
      gridStrength: 'Forza',
      gridSpeed: 'Velocità',
      gridDurability: 'Resistenza',
      gridEnergy: 'Proiez. Energia',
      gridFighting: 'Combattimento',
      firstAppearance: 'Prima Apparizione',
      creatorsLabel: 'Creatori',
      zoomCover: 'Lente'
    },
    de: {
      brandTitle: 'MARVEL MULTIVERSUM ATLAS',
      brandSubtitle: 'X-Men • Avengers • Spider-Verse • Fantastic Four • 215+ Varianten & Offizielles Power-Grid',
      langLabel: 'Sprache:',
      eraLabel: 'Ära-Filter:',
      modeKid: 'Junger Held',
      modeAdult: 'Omnibus-Lore',
      readAloud: 'Vorlesen',
      stopAudio: 'Stopp',
      synthesizing: 'Synthese…',
      shareLink: 'Link teilen',
      linkCopied: 'Link kopiert!',
      themeDark: 'Nacht',
      themeLight: 'Comic-Druck',
      tabCharacters: 'Helden & Varianten',
      tabArena: '1v1 Battleworld',
      tabXmen: 'X-Men & Omega',
      tabMultiverse: 'Multiversum-Karte',
      tabFactions: 'Teams & Kabalen',
      tabForge: 'Infinity-Schmiede & Quiz',
      tabVault: 'Cover-Archiv',
      kpiIcons: 'Kanonische Ikonen',
      kpiVariants: 'Spielbare Varianten',
      kpiEarths: 'Erfasste Erden',
      kpiOmegas: 'Omega-Mutanten',
      searchPlaceholder: 'Held, Erde-616 / 1610 / 295, Schöpfer oder Variante suchen…',
      teamAll: 'Alle Teams',
      teamXmen: 'X-Men & Mutanten',
      teamAvengers: 'Avengers',
      teamSpider: 'Spider-Verse & Midnight',
      teamFF: 'Fantastic Four & Kosmos',
      teamCabal: 'Omega-Schurken',
      originAll: 'Alle Ursprünge',
      earthAll: 'Alle Realitäten',
      sortPower: 'Sort.: Kampfkraft',
      sortGrid: 'Sort.: OHOTMU-Grid',
      sortVariants: 'Sort.: Meiste Varianten',
      sortName: 'Sort.: Name (A–Z)',
      variantsLabel: 'Multiversum-Varianten',
      sendToArena: 'Variante in 1v1-Arena senden',
      swapFighters: 'Tauschen',
      randomIncursion: 'Zufalls-Inkursion',
      gridIntelligence: 'Intelligenz',
      gridStrength: 'Stärke',
      gridSpeed: 'Tempo',
      gridDurability: 'Widerstand',
      gridEnergy: 'Energieproj.',
      gridFighting: 'Kampfkunst',
      firstAppearance: 'Erstauftritt',
      creatorsLabel: 'Schöpfer',
      zoomCover: 'Lupe'
    },
    ar: {
      brandTitle: 'أطلس أكوان مارفل المتعددة',
      brandSubtitle: 'إكس-مين • المنتقمون • سبايدر-فيرس • فانتاستيك فور • +190 نسخة متعددة الأكوان',
      langLabel: 'اللغة:',
      eraLabel: 'حقبة القصة:',
      modeKid: 'البطل الشاب',
      modeAdult: 'موسوعة الخبراء',
      readAloud: 'استماع صوتي',
      stopAudio: 'إيقاف',
      synthesizing: 'جاري التوليد…',
      shareLink: 'مشاركة الرابط',
      linkCopied: 'تم نسخ الرابط!',
      themeDark: 'ليلي',
      themeLight: 'ورق كلاسيكي',
      tabCharacters: 'الأبطال والنسخ',
      tabArena: 'حلبة باتل وورلد 1 ضد 1',
      tabXmen: 'إكس-مين ومستوى أوميغا',
      tabMultiverse: 'خريطة الأكوان المتعددة',
      tabFactions: 'الفرق والتحالفات',
      tabForge: 'أحجار اللانهاية والاختبار',
      tabVault: 'خزنة الأغلفة',
      kpiIcons: 'أساطير مارفل',
      kpiVariants: 'نسخ الأكوان المتعددة',
      kpiEarths: 'الأكوان المرسومة',
      kpiOmegas: 'متحولو أوميغا',
      searchPlaceholder: 'ابحث عن بطل أو الأرض-616 / 1610 / 295 أو المؤلف…',
      teamAll: 'كل الفرق',
      teamXmen: 'إكس-مين والمتحولون',
      teamAvengers: 'المنتقمون',
      teamSpider: 'سبايدر-فيرس',
      teamFF: 'فانتاستيك فور والكون',
      teamCabal: 'أشرار أوميغا',
      originAll: 'كل الأصول',
      earthAll: 'كل الأكوان',
      sortPower: 'ترتيب: القوة',
      sortGrid: 'ترتيب: شبكة مارفل الرسمية',
      sortVariants: 'ترتيب: الأكثر نسخاً',
      sortName: 'ترتيب: الاسم',
      variantsLabel: 'نسخ الأكوان المتعددة',
      sendToArena: 'إرسال النسخة لحلبة 1 ضد 1',
      swapFighters: 'تبديل المقاتلين',
      randomIncursion: 'مواجهة عشوائية',
      gridIntelligence: 'الذكاء',
      gridStrength: 'القوة البدنية',
      gridSpeed: 'السرعة',
      gridDurability: 'المتانة',
      gridEnergy: 'إسقاط الطاقة',
      gridFighting: 'مهارة القتال',
      firstAppearance: 'أول ظهور',
      creatorsLabel: 'المبتكرون',
      zoomCover: 'تكبير'
    }
  };

  function t(lang, key) {
    const table = UI_STRINGS[lang] || UI_STRINGS.en;
    return table[key] !== undefined ? table[key] : UI_STRINGS.en[key] || key;
  }

  function sanitizeSlug(val) {
    if (!val || typeof val !== 'string') return '';
    const cleaned = val.trim().toLowerCase();
    return /^[a-z0-9-]{1,48}$/.test(cleaned) ? cleaned : '';
  }

  function parseFighterToken(raw) {
    if (!raw || typeof raw !== 'string') return null;
    const parts = raw.split(':');
    const charId = sanitizeSlug(parts[0]);
    const variantId = parts[1] ? sanitizeSlug(parts[1]) : '';
    if (!charId) return null;
    return { charId, variantId };
  }

  function parseAtlasUrlState(search) {
    const out = {};
    if (!search) return out;
    try {
      const sp = new URLSearchParams(search);
      const lang = normalizeLangTag(sp.get('lang') || '');
      if (lang) out.lang = lang;

      const mode = (sp.get('mode') || '').trim().toLowerCase();
      if (ALLOWED_AUDIENCE.has(mode)) out.audience = mode;

      const theme = (sp.get('theme') || '').trim().toLowerCase();
      if (ALLOWED_THEMES.has(theme)) out.theme = theme;

      const era = (sp.get('era') || '').trim().toLowerCase();
      if (ALLOWED_ERAS.has(era)) out.era = era;

      const tab = (sp.get('tab') || '').trim().toLowerCase();
      if (ALLOWED_TABS.has(tab)) out.activeTab = tab;

      const charId = sanitizeSlug(sp.get('char') || '');
      if (charId) out.selectedCharacterId = charId;

      const variantId = sanitizeSlug(sp.get('variant') || '');
      if (variantId) out.selectedVariantId = variantId;

      const earthId = sanitizeSlug(sp.get('earth') || '');
      if (earthId) out.selectedRealityId = earthId;

      const fa = parseFighterToken(sp.get('fa') || '');
      if (fa) out.fighterA = fa;

      const fb = parseFighterToken(sp.get('fb') || '');
      if (fb) out.fighterB = fb;
    } catch (_e) {
      // Ignore malformed query parameters
    }
    return out;
  }

  function buildAtlasShareQuery(state) {
    const sp = new URLSearchParams();
    if (state.lang && state.lang !== 'en') sp.set('lang', state.lang);
    if (state.audience) sp.set('mode', state.audience);
    if (state.era && state.era !== 'multiverse') sp.set('era', state.era);
    if (state.activeTab && state.activeTab !== 'characters') sp.set('tab', state.activeTab);
    if (state.selectedCharacterId) {
      sp.set('char', state.selectedCharacterId);
      const activeVar = state.selectedVariantByChar && state.selectedVariantByChar[state.selectedCharacterId];
      if (activeVar) sp.set('variant', activeVar);
    }
    if (state.activeTab === 'arena' && state.clashFighterA && state.clashFighterB) {
      const va = state.clashVariantA ? `:${state.clashVariantA}` : '';
      const vb = state.clashVariantB ? `:${state.clashVariantB}` : '';
      sp.set('fa', `${state.clashFighterA}${va}`);
      sp.set('fb', `${state.clashFighterB}${vb}`);
    }
    if (state.activeTab === 'multiverse' && state.selectedRealityId) {
      sp.set('earth', state.selectedRealityId);
    }
    const qs = sp.toString();
    return qs ? `?${qs}` : '';
  }

  const exported = {
    LANGUAGE_CODES,
    RTL_LANGUAGES,
    STORAGE_KEY,
    UI_STRINGS,
    resolveLanguage,
    getLanguageDir,
    t,
    parseAtlasUrlState,
    buildAtlasShareQuery
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exported;
  }
  root.MARVEL_I18N = exported;
})(typeof window !== 'undefined' ? window : globalThis);
