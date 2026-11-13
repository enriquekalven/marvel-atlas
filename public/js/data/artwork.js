/**
 * Marvel Multiverse & Omnibus Atlas — Archival Comic Cover & Variant Edition Registry
 *
 * Generates museum-grade Omnibus provenance entries (MVO-001+) for every character and every
 * Multiverse variant, pairing creator credits, key-issue citations, and publication mediums
 * with self-hosted local comic art plates (./assets/art/) and bespoke SVG fallback plates.
 */

(function initMarvelArtwork(root) {
  'use strict';

  const charsModule =
    typeof module !== 'undefined' && module.exports
      ? require('./characters.js')
      : root.MARVEL_CHARACTERS_DATA;

  const artManifest =
    typeof module !== 'undefined' && module.exports
      ? require('./art_manifest.js')
      : root.MARVEL_ART_MANIFEST;

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

  const charArtMap = (artManifest && artManifest.characters) || {};
  const variantArtMap = (artManifest && artManifest.variants) || {};

  (charsModule ? charsModule.CHARACTERS : []).forEach((ch, idx) => {
    const catalogueNo = `MVO-${String(idx + 1).padStart(3, '0')}`;
    const baseArt = charArtMap[ch.id] || null;
    const plates = (ch.variants || []).map((v, vIdx) => {
      const plateId = `${ch.id}--${v.id}`;
      const distinctArt = variantArtMap[plateId] || null;
      const chosenArt = distinctArt || baseArt;
      const medium =
        vIdx === 0
          ? MEDIUM_BY_ERA[ch.eraIntroduced] || 'modern-omnibus'
          : MEDIUM_BY_ERA[v.era] || 'multiverse-variant';
      return {
        plateId,
        characterId: ch.id,
        variantId: v.id,
        era: v.era || ch.eraIntroduced,
        medium,
        mediumLabel: MEDIUM_LABELS[medium],
        label: v.name,
        earth: v.earth,
        issueCitation: ch.firstAppearance,
        creators: ch.creators,
        accent: v.coverAccent || (ch.coverTheme && ch.coverTheme.accent) || '#e62429',
        curatorNote: v.note,
        localPath: chosenArt ? chosenArt.localPath : null,
        focalPoint: chosenArt ? chosenArt.focalPoint || 'center 15%' : 'center 15%',
        width: chosenArt ? chosenArt.width || 340 : 340,
        height: chosenArt ? chosenArt.height || 520 : 520,
        sourceTitle: chosenArt ? chosenArt.sourceTitle || ch.name : ch.name,
        isDistinctVariantArt: Boolean(distinctArt)
      };
    });

    CATALOG_BY_CHAR[ch.id] = {
      catalogueNo,
      rarityClass: ch.powerScore >= 96 || ch.omegaMutant ? 'omnibus-mythic' : 'key-issue',
      creators: ch.creators,
      firstAppearance: ch.firstAppearance,
      primaryArt: baseArt,
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

  function getArtCoverageStats() {
    const charKeys = Object.keys(charArtMap);
    const variantKeys = Object.keys(variantArtMap);
    return {
      archivedCharacters: charKeys.length,
      archivedDistinctVariants: variantKeys.length,
      totalArchivedFiles: charKeys.length + variantKeys.length
    };
  }

  const exported = {
    MEDIUM_LABELS,
    CATALOG_BY_CHAR,
    getArtworkForCharacter,
    getPlateForVariant,
    getAllVaultPlates,
    getArtCoverageStats
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exported;
  }
  root.MARVEL_ARTWORK = exported;
})(typeof window !== 'undefined' ? window : globalThis);
