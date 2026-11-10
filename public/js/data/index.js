/**
 * Unified Marvel Multiverse & Omnibus Data Aggregator, Variant State Resolver,
 * Publication Saga Spoiler Shield & Variant-vs-Variant 1v1 Battleworld Engine.
 */

(function initMarvelAtlasIndex(root) {
  'use strict';

  const world =
    typeof module !== 'undefined' && module.exports
      ? require('./world.js')
      : root.MARVEL_WORLD_DATA;

  const chars =
    typeof module !== 'undefined' && module.exports
      ? require('./characters.js')
      : root.MARVEL_CHARACTERS_DATA;

  const ERA_ORDER = {
    silver: 1,
    bronze: 2,
    modern: 3,
    multiverse: 4
  };

  const ORIGIN_BEATS = {
    Mutant: 'Tech',
    Tech: 'Bio',
    Bio: 'Mystic',
    Mystic: 'Cosmic',
    Cosmic: 'Divine',
    Divine: 'Mutant'
  };

  const GRID_KEYS = ['intelligence', 'strength', 'speed', 'durability', 'energy', 'fighting'];

  function isUnlockedInEra(itemEra, activeEra) {
    const reqOrder = ERA_ORDER[itemEra] || 1;
    const curOrder = ERA_ORDER[activeEra] || 4;
    return reqOrder <= curOrder;
  }

  function getTierForScore(score) {
    for (const tier of chars.POWER_TIERS_META) {
      if (score >= tier.minScore) {
        return tier;
      }
    }
    return chars.POWER_TIERS_META[chars.POWER_TIERS_META.length - 1];
  }

  function getUnlockedVariants(character, activeEra) {
    if (!character || !Array.isArray(character.variants) || character.variants.length === 0) {
      return [];
    }
    const unlocked = character.variants.filter((v) => isUnlockedInEra(v.era, activeEra));
    return unlocked.length > 0 ? unlocked : [character.variants[0]];
  }

  function resolveCharacterVariant(character, variantId, activeEra) {
    if (!character) return null;
    const available = getUnlockedVariants(character, activeEra);
    let chosen = null;
    if (variantId) {
      chosen = available.find((v) => v.id === variantId) || null;
    }
    if (!chosen) {
      chosen = available[0] || null;
    }

    const eraKey = ERA_ORDER[activeEra] ? activeEra : 'multiverse';
    const baseEraScore =
      character.eraPower && typeof character.eraPower[eraKey] === 'number'
        ? character.eraPower[eraKey]
        : character.powerScore;

    const effectiveScore =
      chosen && typeof chosen.powerScore === 'number'
        ? chosen.versionOverride || (!variantId && activeEra !== 'multiverse' && chosen === available[0]
            ? Math.min(chosen.powerScore, Math.max(baseEraScore, chosen.powerScore - 4))
            : chosen.powerScore)
        : baseEraScore;

    const effectiveGrid = chosen && chosen.grid ? chosen.grid : character.grid;
    const gridTotal = GRID_KEYS.reduce((sum, key) => sum + (Number(effectiveGrid[key]) || 1), 0);

    return {
      character,
      variant: chosen,
      availableVariants: available,
      variantId: chosen ? chosen.id : 'default',
      variantName: chosen ? chosen.name : character.name,
      earth: chosen && chosen.earth ? chosen.earth : 'Earth-616',
      powerScore: effectiveScore,
      grid: effectiveGrid,
      gridTotal,
      signature: chosen && chosen.signature ? chosen.signature : character.abilities[0] || '',
      note: chosen && chosen.note ? chosen.note : character.adultBio,
      coverAccent:
        (chosen && chosen.coverAccent) ||
        (character.coverTheme && character.coverTheme.accent) ||
        '#e62429',
      tier: getTierForScore(effectiveScore)
    };
  }

  function getVisibleCharacters(activeEra) {
    return chars.CHARACTERS.filter((c) => isUnlockedInEra(c.eraIntroduced, activeEra));
  }

  function getVisibleRealities(activeEra) {
    return world.REALITIES.filter((r) => isUnlockedInEra(r.eraIntroduced, activeEra));
  }

  function getVisibleFactions(activeEra) {
    return world.FACTIONS.filter((f) => isUnlockedInEra(f.eraIntroduced, activeEra));
  }

  function getVisibleQuiz(activeEra, audienceMode) {
    return world.QUIZ_QUESTIONS.filter((q) => {
      if (!isUnlockedInEra(q.era, activeEra)) return false;
      if (audienceMode === 'kid') return q.difficulty === 'kid' || activeEra === 'multiverse';
      return true;
    });
  }

  function evaluateOriginAdvantage(originA, originB) {
    if (!originA || !originB || originA === originB) return 0;
    if (ORIGIN_BEATS[originA] === originB) return 1;
    if (ORIGIN_BEATS[originB] === originA) return -1;
    return 0;
  }

  function simulateClash(charA, variantIdA, charB, variantIdB, activeEra) {
    if (!charA || !charB) return null;
    const stateA = resolveCharacterVariant(charA, variantIdA, activeEra);
    const stateB = resolveCharacterVariant(charB, variantIdB, activeEra);

    const normGridA = (stateA.gridTotal / 42) * 100;
    const normGridB = (stateB.gridTotal / 42) * 100;

    const originAdv = evaluateOriginAdvantage(charA.origin, charB.origin);
    const originBonusA = originAdv === 1 ? 2.4 : 0;
    const originBonusB = originAdv === -1 ? 2.4 : 0;

    const finalScoreA = Number((stateA.powerScore * 0.72 + normGridA * 0.28 + originBonusA).toFixed(1));
    const finalScoreB = Number((stateB.powerScore * 0.72 + normGridB * 0.28 + originBonusB).toFixed(1));

    const diff = Math.abs(finalScoreA - finalScoreB);
    let winnerState = null;
    let verdictType = 'draw';
    if (diff >= 0.4) {
      winnerState = finalScoreA > finalScoreB ? stateA : stateB;
      verdictType = diff >= 6.5 ? 'decisive' : 'close';
    }

    let originNote =
      'Neutral Power-Origin interaction — pure OHOTMU combat scaling, battlefield intellect, and multiversal feats decide Battleworld supremacy.';
    if (originAdv === 1) {
      originNote = `${charA.name}'s ${charA.origin} classification holds a canonical tactical counter over ${charB.name}'s ${charB.origin} toolkit (+2.4 Battleworld Edge).`;
    } else if (originAdv === -1) {
      originNote = `${charB.name}'s ${charB.origin} classification holds a canonical tactical counter over ${charA.name}'s ${charA.origin} toolkit (+2.4 Battleworld Edge).`;
    }

    return {
      stateA,
      stateB,
      charA,
      charB,
      finalScoreA,
      finalScoreB,
      originAdv,
      originNote,
      winnerState,
      verdictType
    };
  }

  const totalVariantsCount = chars.CHARACTERS.reduce(
    (sum, c) => sum + (Array.isArray(c.variants) ? c.variants.length : 0),
    0
  );

  const MARVEL_DATA = {
    eras: world.ERAS,
    origins: world.ORIGINS,
    realities: world.REALITIES,
    factions: world.FACTIONS,
    omegaMutants: world.OMEGA_MUTANTS,
    infinityStones: world.INFINITY_STONES,
    cosmicFusions: world.COSMIC_FUSIONS,
    quizQuestions: world.QUIZ_QUESTIONS,
    characters: chars.CHARACTERS,
    powerTiersMeta: chars.POWER_TIERS_META,
    totalVariantsCount
  };

  const MARVEL_HELPERS = {
    ERA_ORDER,
    GRID_KEYS,
    isUnlockedInEra,
    getTierForScore,
    getUnlockedVariants,
    resolveCharacterVariant,
    getVisibleCharacters,
    getVisibleRealities,
    getVisibleFactions,
    getVisibleQuiz,
    evaluateOriginAdvantage,
    simulateClash
  };

  const exported = { MARVEL_DATA, MARVEL_HELPERS };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exported;
  }
  root.MARVEL_ATLAS = exported;
})(typeof window !== 'undefined' ? window : globalThis);
