/**
 * Marvel Multiverse & Omnibus Atlas — Archival Comic Cover & Variant Edition Registry
 *
 * Generates museum-grade Omnibus provenance entries (MVO-001+) for every character and every
 * Multiverse variant, pairing creator credits, key-issue citations, and publication mediums
 * with bespoke vector Four-Color / Kirby-Krackle Cover Plates rendered by dom.js.
 */

(function initMarvelArtwork(root) {
  'use strict';

  const charsModule =
    typeof module !== 'undefined' && module.exports
      ? require('./characters.js')
      : root.MARVEL_CHARACTERS_DATA;

  const MEDIUM_BY_ERA = {
    silver: 'silver-age-key',
    bronze: 'bronze-foil-edition',
    modern: 'modern-omnibus',
    multiverse: 'multiverse-variant'
  };

  const MEDIUM_LABELS = {
    'silver-age-key': 'Silver Age Four-Color Key',
    'bronze-foil-edition': 'Bronze / 90s Collector Foil',
    'modern-omnibus': 'Modern Omnibus Edition',
    'multiverse-variant': 'Multiverse Incursion Variant'
  };

  const CATALOG_BY_CHAR = {};

  (charsModule ? charsModule.CHARACTERS : []).forEach((ch, idx) => {
    const catalogueNo = `MVO-${String(idx + 1).padStart(3, '0')}`;
    const plates = (ch.variants || []).map((v, vIdx) => ({
      plateId: `${ch.id}--${v.id}`,
      characterId: ch.id,
      variantId: v.id,
      era: v.era || ch.eraIntroduced,
      medium: vIdx === 0 ? MEDIUM_BY_ERA[ch.eraIntroduced] || 'modern-omnibus' : MEDIUM_BY_ERA[v.era] || 'multiverse-variant',
      mediumLabel:
        MEDIUM_LABELS[
          vIdx === 0 ? MEDIUM_BY_ERA[ch.eraIntroduced] || 'modern-omnibus' : MEDIUM_BY_ERA[v.era] || 'multiverse-variant'
        ],
      label: v.name,
      earth: v.earth,
      issueCitation: ch.firstAppearance,
      creators: ch.creators,
      accent: v.coverAccent || (ch.coverTheme && ch.coverTheme.accent) || '#e62429',
      curatorNote: v.note
    }));

    CATALOG_BY_CHAR[ch.id] = {
      catalogueNo,
      rarityClass: ch.powerScore >= 96 || ch.omegaMutant ? 'omnibus-mythic' : 'key-issue',
      creators: ch.creators,
      firstAppearance: ch.firstAppearance,
      plates
    };
  });

  function getArtworkForCharacter(charId) {
    return CATALOG_BY_CHAR[charId] || null;
  }

  function getPlateForVariant(charId, variantId) {
    const entry = CATALOG_BY_CHAR[charId];
    if (!entry || !entry.plates.length) return null;
    return entry.plates.find((p) => p.variantId === variantId) || entry.plates[0];
  }

  function getAllVaultPlates(activeEra, mediumFilter) {
    const ERA_ORDER = { silver: 1, bronze: 2, modern: 3, multiverse: 4 };
    const maxOrder = ERA_ORDER[activeEra] || 4;
    const out = [];
    for (const entry of Object.values(CATALOG_BY_CHAR)) {
      for (const plate of entry.plates) {
        if ((ERA_ORDER[plate.era] || 1) > maxOrder) continue;
        if (mediumFilter && mediumFilter !== 'all' && plate.medium !== mediumFilter) continue;
        out.push({
          ...plate,
          catalogueNo: entry.catalogueNo,
          rarityClass: entry.rarityClass
        });
      }
    }
    return out;
  }

  const exported = {
    MEDIUM_LABELS,
    CATALOG_BY_CHAR,
    getArtworkForCharacter,
    getPlateForVariant,
    getAllVaultPlates
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exported;
  }
  root.MARVEL_ARTWORK = exported;
})(typeof window !== 'undefined' ? window : globalThis);
