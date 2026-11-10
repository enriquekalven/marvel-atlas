# 🌌 Marvel Multiverse & Omnibus Atlas

An interactive, aficionado-grade & family-friendly Marvel Universe portal built in the *Atlas of Wonder* & *Shinobi Atlas* lineage — spanning **X-Men**, **Avengers**, **Spider-Verse & Midnight Sons**, **Fantastic Four & Cosmic Entities**, and **Omega Multiverse Conquerors** across **11 global languages** with **Google Cloud Chirp 3: HD** narration.

## ✨ Key Features

- **🦸‍♂️ 76 Canonical Legends & 215+ Live Playable Multiverse Variants**:
  - Switch any character live between canonical Multiverse incarnations (*Earth-616 Prime*, *Earth-1610 Ultimate*, *Earth-6160 Maker's New Ultimate*, *Earth-295 Age of Apocalypse*, *Earth-811 Days of Future Past*, *Earth-928 Marvel 2099*, *Earth-65 Ghost-Spider*, *Earth-838 Illuminati*, *Earth-58163 House of M*, *Earth-807128 Wastelands*, and *Battleworld / White Hot Room*)!
  - Every variant dynamically updates its **Earth Designation**, **Bespoke Kirby-Krackle Comic Cover SVG Plate**, **Official Marvel Handbook (OHOTMU) 1–7 Power Grid** (*Intelligence, Strength, Speed, Durability, Energy Projection, Fighting Skills*), **Signature Arsenal**, and **Continuity Note**.
- **⚔️ 1v1 Battleworld Variant Arena**:
  - Pit *any* character + *specific Multiverse Variant* against *any* rival Variant (e.g., *Rune King Thor* vs *God Emperor Doom*, *White Phoenix Jean Grey* vs *House of M Scarlet Witch*, or *Cosmic Spider-Man* vs *World Breaker Hulk*) with overlaid dual-encoded OHOTMU radars and Power-Origin tactical counters.
- **🧬 Official *House of X #1* Omega-Level Mutant Registry & X-Men Hub**:
  - Complete Jonathan Hickman data-page classification of all 14 canonical Earth-616 Omega Mutants alongside the full Uncanny X-Men & Krakoan Quiet Council roster.
- **🗺️ Interactive SVG Multiverse, Sacred Timeline & Incursion Map**:
  - Clickable 12-node Omniverse topology tracing divergence points, key comic citations, Incursion tethers, and native Variants.
- **💎 Six-Gem Infinity Forge & Uatu's Marvel Bullpen "No-Prize" Quiz**:
  - Combine any subset of the 6 Infinity Gems to unlock cosmic synergies (and inspect Hickman's *New Avengers* Native-Reality Gauntlet law), then earn Stan Lee's classic **Bullpen No-Prize**!
- **🌐 11 Languages (`aow-lang` Parity + RTL Arabic) & 1-Click Shareable Deep Links**:
  - Share exact variants or 1v1 Battleworld matchups with fellow fans via `?char=wolverine&variant=old-man-logan` or `?tab=arena&fa=thor:rune-king-thor&fb=doctor-doom:god-emperor-doom`.

## 🚀 Quick Start

```bash
# Option A (Node.js >= 18):
npm start
npm test

# Option B (Python 3 — zero dependencies):
python3 server.py
```

Opens locally at `http://127.0.0.1:4190`.

## ☁️ Deploy (Firebase Hosting)

Configured in [`firebase.json`](firebase.json) & [`.firebaserc`](.firebaserc) (`project-maui`, site `marvel-atlas`) with matching strict CSP and security headers:

```bash
firebase hosting:sites:create marvel-atlas --project project-maui   # first time only
firebase deploy --only hosting:marvel-atlas --project project-maui
```
