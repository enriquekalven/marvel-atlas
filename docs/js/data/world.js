/**
 * Canonical Marvel Multiverse Realities, Publication Eras, Power Origins,
 * Teams & Cabals, House of X #1 Omega-Level Mutant Registry, Infinity Forge & Bullpen Quiz.
 * Compatible with both browser (window.MARVEL_WORLD_DATA) and Node test runner (module.exports).
 */

(function initMarvelWorldData(root) {
  'use strict';

  const ERAS = [
    {
      id: 'silver',
      order: 1,
      label: 'Golden & Silver Age (1939–1979)',
      shortLabel: 'Silver Age',
      description: 'Marvel Comics #1, Fantastic Four #1, Uncanny X-Men #1, Avengers #1, Galactus Trilogy & Giant-Size X-Men #1.'
    },
    {
      id: 'bronze',
      order: 2,
      label: 'Claremont, Secret Wars & Infinity (1980–1999)',
      shortLabel: 'Bronze / 90s',
      description: 'Dark Phoenix Saga, Days of Future Past, Secret Wars (1984), Infinity Gauntlet, X-Men #1 (1991), Marvel 2099 & Age of Apocalypse.'
    },
    {
      id: 'modern',
      order: 3,
      label: 'Ultimate, House of M & Incursions (2000–2014)',
      shortLabel: 'Modern Era',
      description: 'Ultimate Universe (Earth-1610), New X-Men, Avengers Disassembled, House of M, Annihilation, Civil War & Time Runs Out.'
    },
    {
      id: 'multiverse',
      order: 4,
      label: 'Secret Wars, Krakoa & Multiverse Saga (2015–Present)',
      shortLabel: 'Multiverse / All',
      description: 'Battleworld (2015), House of X / Powers of X, Immortal Hulk, King in Black, Spider-Verse, Sacred Timeline & Earth-6160.'
    }
  ];

  const ORIGINS = [
    {
      id: 'Mutant',
      code: 'X-GENE',
      name: 'Mutant (Homo superior)',
      beats: 'Tech',
      losesTo: 'Divine',
      color: '#facc15',
      signature: 'Uncanny X-Men, Quiet Council of Krakoa & Great Ring of Arakko',
      kidSummary: 'Born with the extraordinary X-Gene! Mutants wield telepathy, weather control, magnetism, and optic blasts to protect a world that fears them.',
      adultSummary: 'Celestial-seeded genetic divergence activating at puberty (or birth in Namor/Nightcrawler). Culminated in Krakoan Resurrection Protocols (The Five) and Omega-level planetary/universal thresholds with no definable upper limit.'
    },
    {
      id: 'Tech',
      code: 'SCI-TECH',
      name: 'Apex Tech & Super-Science',
      beats: 'Bio',
      losesTo: 'Mutant',
      color: '#38bdf8',
      signature: 'Tony Stark, Reed Richards, Shuri, Kang & Ultron',
      kidSummary: 'Genius inventors building repulsor suits, Vibranium gadgets, Pym Particles, and time-traveling machines!',
      adultSummary: 'Encompasses Bleeding Edge/Mysterium armors, Wakandan Vibranium-weave, Pym Particle subatomic shunting, Alchemax 2099 genetics, and Nathaniel Richards chronal engineering.'
    },
    {
      id: 'Bio',
      code: 'MUTATE',
      name: 'Gamma, Spider-Totem & Bio-Mutate',
      beats: 'Mystic',
      losesTo: 'Tech',
      color: '#22c55e',
      signature: 'Spider-Verse Totems, Hulk (Green Door), Captain America & Symbiotes',
      kidSummary: 'Heroes transformed by radioactive spiders, Super-Soldier Serum, or Gamma energy into unstoppable powerhouses!',
      adultSummary: 'External mutagenic catalysts: Web of Life and Destiny Spider-Totems, Super-Soldier Vita-Rays, One-Below-All Gamma metaphysics, and Klyntar Living Abyss symbiotes.'
    },
    {
      id: 'Mystic',
      code: 'ARCANE',
      name: 'Mystic Arts & Chaos Magic',
      beats: 'Cosmic',
      losesTo: 'Bio',
      color: '#e62429',
      signature: 'Sorcerers Supreme, Scarlet Witch, Ghost Rider, Magik & Doom',
      kidSummary: 'Spellcasters and dimensional guardians who bend reality, open glowing portals, and summon ancient shields!',
      adultSummary: 'Invokes Vishanti principalities, Chthonian Chaos Magic (Nexus Beings), Limbo Stepping Discs, Khonshu lunar avatars, and Zarathos Penance Stare metaphysics.'
    },
    {
      id: 'Cosmic',
      code: 'COSMOS',
      name: 'Power Cosmic & Multiversal Force',
      beats: 'Divine',
      losesTo: 'Mystic',
      color: '#f59e0b',
      signature: 'Galactus, Silver Surfer, Phoenix Force, Captain Marvel & Watchers',
      kidSummary: 'Star-spanning heroes powered by supernovas, the Phoenix Force, and the boundless energy of space!',
      adultSummary: 'Draws upon the Astral Plane, White Hot Room (Phoenix Force), Galactus’s Power Cosmic, Quantum Bands, Enigma Force (Captain Universe), and Beyonders’ Ivory-King energy.'
    },
    {
      id: 'Divine',
      code: 'MYTHIC',
      name: 'Asgardian & Elder Pantheon',
      beats: 'Mutant',
      losesTo: 'Cosmic',
      color: '#60a5fa',
      signature: 'Thor Odinson, Loki (God of Stories), Bast & Hercules',
      kidSummary: 'Immortal gods of thunder, mischief, and Wakandan panthers wielding enchanted Uru hammers across Nine Realms!',
      adultSummary: 'Descended from Gaea/Elder Gods and Skyfather pantheons; channels the Odinforce/Thorforce, Yggdrasil World-Tree narrative threads, and tempest-forged Uru.'
    }
  ];

  const REALITIES = [
    {
      id: 'earth-616',
      code: 'Earth-616',
      name: 'Prime Marvel Continuity',
      eraIntroduced: 'silver',
      sector: 'Central Prime Core',
      x: 450,
      y: 235,
      radius: 26,
      incursionStatus: 'Anchored · Eighth Cosmos Prime',
      keyIssue: 'Fantastic Four #1 (Nov 1961) · Named by Alan Moore & Alan Davis ( Captain Britain )',
      rulingForce: 'Avengers, Uncanny X-Men, Fantastic Four & Illuminati',
      color: '#e62429',
      tethers: ['earth-1610', 'earth-6160', 'earth-199999', 'earth-295', 'earth-811', 'earth-928', 'earth-58163', 'battleworld'],
      kidSummary: 'The main Marvel Comics universe where Peter Parker, the Avengers, the X-Men, and the Fantastic Four began their legendary adventures!',
      adultSummary: 'Baseline reference reality of the Marvel Omniverse (coined in The Daredevils #7, 1983). Survived the 2015 Final Incursion with Earth-1610 via Reed Richards, Molecule Man, and Franklin Richards restoring the Eighth Cosmos.'
    },
    {
      id: 'earth-1610',
      code: 'Earth-1610',
      name: 'Ultimate Universe (Original)',
      eraIntroduced: 'modern',
      sector: 'Incursion Twin Ring',
      x: 315,
      y: 145,
      radius: 20,
      incursionStatus: 'Collided in Final Incursion · Reborn Fragment',
      keyIssue: 'Ultimate Spider-Man #1 (Oct 2000) · Secret Wars #1 (2015)',
      rulingForce: 'The Ultimates, Miles Morales & The Maker (Children of Tomorrow)',
      color: '#38bdf8',
      tethers: ['earth-616', 'earth-6160', 'battleworld'],
      kidSummary: 'A modernized universe where a young Peter Parker inspired Miles Morales to take up the Spider-Man mantle!',
      adultSummary: 'Brian Michael Bendis, Mark Millar & Bryan Hitch’s 21st-century reinvention: militarized S.H.I.E.L.D. Ultimates, synthetic mutant origin, Peter Parker’s sacrifice, Miles Morales’s debut, and Reed Richards’ descent into the multiversal villain The Maker.'
    },
    {
      id: 'earth-6160',
      code: 'Earth-6160',
      name: 'New Ultimate Universe (Maker’s Design)',
      eraIntroduced: 'multiverse',
      sector: 'Chronal Intervention Rim',
      x: 205,
      y: 105,
      radius: 19,
      incursionStatus: 'Active · Vault Seal Countdown',
      keyIssue: 'Ultimate Invasion #1 (2023) · Ultimate Spider-Man #1 (2024)',
      rulingForce: 'Maker’s Council vs. Iron Lad’s Ultimates & Adult Spider-Man',
      color: '#06b6d4',
      tethers: ['earth-1610', 'earth-616'],
      kidSummary: 'A brand-new universe where young Tony Stark (Iron Lad) sends origin gifts back to heroes like an adult family-man Peter Parker!',
      adultSummary: 'Jonathan Hickman’s 2023–2024 masterwork: The Maker systematically prevented the Heroic Age using Immortus Engine list-interception until Howard Stark trapped him in the City and Adolescent Tony Stark launched Origin Boxes to restore Earth’s champions.'
    },
    {
      id: 'earth-199999',
      code: 'Earth-199999',
      name: 'Sacred Timeline (MCU)',
      eraIntroduced: 'modern',
      sector: 'Yggdrasil Temporal Loom',
      x: 595,
      y: 140,
      radius: 21,
      incursionStatus: 'Guarded by Loki’s World Tree',
      keyIssue: 'Iron Man (2008) · Official Handbook Vol. 5 (Earth-199999)',
      rulingForce: 'Avengers, Wakanda, Masters of the Mystic Arts & TVA',
      color: '#f59e0b',
      tethers: ['earth-616', 'earth-838', 'battleworld'],
      kidSummary: 'The famous cinematic Marvel universe of the Infinity Saga, Wakanda Forever, Loki’s Time Tree, and the Multiverse Saga!',
      adultSummary: 'Live-action Sacred Timeline isolated by He Who Remains to prevent a Multiversal Kang War, later woven into a living Yggdrasil multiversal tree by Loki Laufeyson at the End of Time.'
    },
    {
      id: 'earth-295',
      code: 'Earth-295',
      name: 'Age of Apocalypse',
      eraIntroduced: 'bronze',
      sector: 'Mutant Divergence Quadrant',
      x: 255,
      y: 265,
      radius: 20,
      incursionStatus: 'Crystallized M’Kraan Branch',
      keyIssue: 'X-Men: Alpha #1 (Feb 1995)',
      rulingForce: 'En Sabah Nur’s Horsemen vs. Magneto’s Astonishing X-Men',
      color: '#ef4444',
      tethers: ['earth-616', 'earth-811'],
      kidSummary: 'When Professor X vanished from history, Magneto stepped up to build the X-Men and resist the tyrant Apocalypse!',
      adultSummary: 'Spawned when Legion traveled back to kill Magneto and inadvertently slew Charles Xavier instead. En Sabah Nur attacked decades early, forging a scorched America opposed by Magneto, Rogue, Weapon X, Blink, and Nate Grey (X-Man).'
    },
    {
      id: 'earth-811',
      code: 'Earth-811',
      name: 'Days of Future Past',
      eraIntroduced: 'bronze',
      sector: 'Mutant Divergence Quadrant',
      x: 295,
      y: 375,
      radius: 18,
      incursionStatus: 'Sentinel Quarantine Timeline',
      keyIssue: 'Uncanny X-Men #141–142 (Jan–Feb 1981)',
      rulingForce: 'Omega Sentinels & Nimrod vs. Surviving X-Resistance',
      color: '#fb923c',
      tethers: ['earth-616', 'earth-295'],
      kidSummary: 'A dark future ruled by giant Sentinel robots—until Kitty Pryde sent her mind back in time to warn the X-Men!',
      adultSummary: 'Chris Claremont & John Byrne’s seminal dystopia (2013 AD) where Mystique’s Brotherhood assassinated Senator Robert Kelly, leading Sentinels to exterminate or collar nearly every superhuman in North America and birthing Rachel Summers.'
    },
    {
      id: 'earth-928',
      code: 'Earth-928',
      name: 'Marvel 2099 (Nueva York)',
      eraIntroduced: 'bronze',
      sector: 'Chronal Future Horizon',
      x: 645,
      y: 255,
      radius: 19,
      incursionStatus: 'Spider-Society Citadel Hub',
      keyIssue: 'Spider-Man 2099 #1 (Nov 1992) · Peter David & Rick Leonardi',
      rulingForce: 'Alchemax Megacorp vs. Miguel O’Hara & Doom 2099',
      color: '#3b82f6',
      tethers: ['earth-616', 'earth-65'],
      kidSummary: 'A neon cyberpunk future in the year 2099 protected by futuristic geneticist Miguel O’Hara—Spider-Man 2099!',
      adultSummary: 'Post-Heroic-Age cyberpunk megacity ruled by Tyler Stone’s Alchemax; geneticist Miguel O’Hara had 50% spider DNA spliced into his genome while Victor Von Doom time-shifted forward to conquer corporate America.'
    },
    {
      id: 'earth-65',
      code: 'Earth-65',
      name: 'Spider-Gwen / Ghost-Spider Earth',
      eraIntroduced: 'modern',
      sector: 'Web of Life & Destiny',
      x: 735,
      y: 345,
      radius: 18,
      incursionStatus: 'Web-Tethered · Active',
      keyIssue: 'Edge of Spider-Verse #2 (Sept 2014) · Latour & Rodriguez',
      rulingForce: 'Ghost-Spider, The Mary Janes & Kingpin Matt Murdock',
      color: '#ec4899',
      tethers: ['earth-928', 'earth-616'],
      kidSummary: 'On Earth-65, drummer Gwen Stacy was bitten by the radioactive spider and swings across New York as Ghost-Spider!',
      adultSummary: 'Vibrant neon-watercolor divergence where Gwen Stacy became Spider-Woman, unpowered Peter Parker tragically perished as the Lizard, Samantha Wilson served as WW2 Captain America, and Matt Murdock became Daredevil-Kingpin.'
    },
    {
      id: 'earth-838',
      code: 'Earth-838',
      name: 'Illuminati Sovereign Earth',
      eraIntroduced: 'multiverse',
      sector: 'Utopian Watch Ring',
      x: 710,
      y: 120,
      radius: 17,
      incursionStatus: 'Compromised · Post-Darkhold',
      keyIssue: 'Multiverse of Madness · Illuminati Tribunal Dossier',
      rulingForce: 'Professor X, Captain Carter, Maria Rambeau, Reed Richards & Blackagar Boltagon',
      color: '#22c55e',
      tethers: ['earth-199999', 'earth-616'],
      kidSummary: 'A sleek universe where Ultron bots keep peace and the Illuminati council guards the Multiverse from threats!',
      adultSummary: 'Alternate reality where Tony Stark’s Ultron sentry program succeeded peacefully, Strange was executed via Black Bolt after triggering an Incursion with the Darkhold, and Baxter Foundation science mapped multiversal designations.'
    },
    {
      id: 'earth-58163',
      code: 'Earth-58163',
      name: 'House of M (Magnus Dynasty)',
      eraIntroduced: 'modern',
      sector: 'Chaos-Warped Pocket',
      x: 390,
      y: 390,
      radius: 18,
      incursionStatus: 'Collapsed via Decimation ("No More Mutants")',
      keyIssue: 'House of M #1–8 (2005) · Bendis & Olivier Coipel',
      rulingForce: 'House of Magnus (Genosha) & S.H.I.E.L.D. Red Guard',
      color: '#dc2626',
      tethers: ['earth-616'],
      kidSummary: 'A world reshaped by Scarlet Witch where Mutants were celebrated royalty—until Wolverine remembered the truth!',
      adultSummary: 'Constructed by Wanda Maximoff’s Chaos Magic at Pietro’s urging so Homo superior ruled openly under King Magnus while humans were a fading minority; shattered by Layla Miller restoring heroes’ memories, culminating in M-Day.'
    },
    {
      id: 'earth-807128',
      code: 'Earth-807128',
      name: 'The Wastelands (Old Man Logan)',
      eraIntroduced: 'modern',
      sector: 'Post-Heroic Badlands',
      x: 165,
      y: 340,
      radius: 17,
      incursionStatus: 'Isolated Badlands Branch',
      keyIssue: 'Wolverine Vol. 3 #66 (June 2008) · Millar & McNiven',
      rulingForce: 'President Red Skull, Hulk Gang, Doom’s Lair & Kingpin',
      color: '#ca8a04',
      tethers: ['earth-295', 'battleworld'],
      kidSummary: 'A rugged desert future where an older Logan crosses America with blind Hawkeye in the classic Spider-Mobile!',
      adultSummary: 'Fifty years after supervillains united under Red Skull and Mysterio’s illusion broke Wolverine’s spirit, pacifist farmer Logan trekked across Hulkland with Clint Barton before Secret Wars displaced him onto Earth-616.'
    },
    {
      id: 'battleworld',
      code: 'Battleworld / WHR',
      name: 'Battleworld & White Hot Room',
      eraIntroduced: 'multiverse',
      sector: 'Beyond-Space Apex',
      x: 525,
      y: 375,
      radius: 23,
      incursionStatus: 'Omniversal Forge & Incursion Lifeboat',
      keyIssue: 'Secret Wars #1–9 (2015) · Hickman & Esad Ribić',
      rulingForce: 'God Emperor Doom, Sheriff Strange, Thor Corps & Phoenix Crown',
      color: '#eab308',
      tethers: ['earth-616', 'earth-1610', 'earth-199999', 'earth-807128'],
      kidSummary: 'A giant patchwork planet stitched together from dozens of Marvel realities—guarded by an army of Thors!',
      adultSummary: 'Constructed outside normal spacetime after the death of the Seventh Cosmos when Doom, Strange, and Owen Reece stole the Ivory Kings’ (Beyonders’) power, welding 41 surviving multiverse domains around Doomstadt alongside the Phoenix’s White Hot Room.'
    }
  ];

  const FACTIONS = [
    {
      id: 'xmen',
      name: 'Uncanny X-Men & Quiet Council of Krakoa',
      eraIntroduced: 'silver',
      debut: 'The X-Men #1 (Sept 1963) · House of X #1 (July 2019)',
      hq: 'Xavier’s School (Westchester) • Island Nation of Krakoa • Planet Arakko (Mars)',
      motto: 'Protecting a world that hates and fears them — While You Slept, the World Changed.',
      color: '#facc15',
      kidSummary: 'Professor X’s extraordinary school and island home where Mutants train together as family to safeguard humanity and mutantkind alike!',
      adultSummary: 'Evolved from Xavier’s integrationist teen strike-force through Claremont’s multi-ethnic Giant-Size renaissance into Hickman’s sovereign biotech nation of Krakoa—complete with Resurrection Protocols, Krakoan medicines, and terraforming Mars into Arakko.'
    },
    {
      id: 'avengers',
      name: 'The Avengers (Earth’s Mightiest Heroes)',
      eraIntroduced: 'silver',
      debut: 'The Avengers #1 (Sept 1963) · Lee & Kirby',
      hq: 'Avengers Mansion • Stark/Avengers Tower • Avengers Mountain (Celestial Progenitor)',
      motto: 'Avengers Assemble! — To fight the foes no single superhero could withstand.',
      color: '#e62429',
      kidSummary: 'Iron Man, Captain America, Thor, Hulk, Black Panther, Captain Marvel, and Scarlet Witch teaming up whenever Earth faces cosmic danger!',
      adultSummary: 'Founded in response to Loki’s manipulation of the Hulk; expanded from a five-member charter into Hickman’s planetary Avengers Machine, Cosmic/Multiversal rosters, and the West Coast & Young Avengers legacies.'
    },
    {
      id: 'ff-cosmic',
      name: 'Fantastic Four, Future Foundation & Cosmic Heralds',
      eraIntroduced: 'silver',
      debut: 'The Fantastic Four #1 (Nov 1961) · Lee & Kirby',
      hq: 'Baxter Building (42nd & Madison) • Four Freedom’s Plaza • Negative Zone Portal',
      motto: 'Marvel’s First Family — Explorers of the Unknown, the Negative Zone, and the Eighth Cosmos.',
      color: '#38bdf8',
      kidSummary: 'Marvel’s First Family of astronaut explorers—Reed, Sue, Johnny, Ben, and Franklin—discovering new dimensions alongside Silver Surfer!',
      adultSummary: 'Imaginauts rather than mere crimefighters: discovered the Negative Zone, Attilan’s Inhumans, Wakanda, Galactus, and the Bridge to the Council of Reeds, ultimately rebuilding the entire Marvel Multiverse after Secret Wars.'
    },
    {
      id: 'spider-street',
      name: 'Spider-Society, Defenders & Midnight Sons',
      eraIntroduced: 'silver',
      debut: 'Amazing Fantasy #15 (Aug 1962) · Amazing Spider-Man: Spider-Verse (2014)',
      hq: 'Queens / Hell’s Kitchen • Sanctum Sanctorum (177A Bleecker St) • Nueva York Spider-HQ',
      motto: 'With great power there must also come great responsibility.',
      color: '#ef4444',
      kidSummary: 'Web-slinging Spider-Heroes across dimensions teamed up with street protectors like Daredevil and supernatural guardians like Ghost Rider!',
      adultSummary: 'Spans the multiversal Web of Life and Destiny (Peter, Miles, Gwen, Miguel O’Hara), urban vigilantes of Hell’s Kitchen, and occult Midnight Sons holding back Chthon, Mephisto, Zarathos, and vampire cabals.'
    },
    {
      id: 'illuminati',
      name: 'The Illuminati (Incursion Conclave)',
      eraIntroduced: 'modern',
      debut: 'New Avengers: Illuminati #1 (May 2006) · Bendis, Hickman',
      hq: 'Necropolis, Wakanda (Hidden Sub-Vault)',
      motto: 'Bearing the unbearable moral calculus of surviving Multiversal Incursions.',
      color: '#f59e0b',
      kidSummary: 'A secret council of Marvel’s smartest leaders—Iron Man, Reed Richards, Doctor Strange, Professor X, Black Panther, and Namor—guarding the Infinity Stones!',
      adultSummary: 'Clandestine summit formed after the Kree-Skrull War uniting each superhuman pillar’s sovereign mind (Stark, Richards, Strange, Xavier/Beast, T’Challa, Black Bolt, Namor). Constructed antimatter world-breakers during Hickman’s New Avengers Incursion crisis.'
    },
    {
      id: 'cabal',
      name: 'Omega Conquerors, Cabal & Brotherhood',
      eraIntroduced: 'silver',
      debut: 'Fantastic Four #5 (July 1962) · Infinity Gauntlet #1 (1991)',
      hq: 'Castle Doomstadt (Latveria) • Sanctuary II • Asteroid M • Citadel at End of Time',
      motto: 'Order through sovereign will — across time, space, and dying universes.',
      color: '#eab308',
      kidSummary: 'The mightiest supervillains across time and space—Doctor Doom, Thanos, Kang, Apocalypse, Galactus, Ultron, and Knull!',
      adultSummary: 'Architects of Marvel’s greatest macro-events: Victor Von Doom’s Latverian absolutism, Thanos’s nihilistic Infinity crusade, Kang’s chronal empire, En Sabah Nur’s Darwinian crucible, Sinister’s Dominion, and Knull’s symbiote abyss.'
    }
  ];

  /**
   * Canonical Jonathan Hickman House of X #1 (2019) Omega-Level Mutant Registry + Arakko Expansion
   * Definition: "A mutant whose dominant power is deemed to register — or reach — an undefinable upper limit."
   */
  const OMEGA_MUTANTS = [
    { id: 'jean-grey', name: 'Jean Grey (Marvel Girl)', alias: 'Phoenix Host', domain: 'Telepathy (Omega) • Telekinesis', allegiance: 'X-Men', linkedCharId: 'jean-grey', note: 'Purest astral telepath on Earth-616; bonded with the cosmic Phoenix Force inside the White Hot Room.' },
    { id: 'magneto', name: 'Max Eisenhardt', alias: 'Magneto', domain: 'Magnetism / Electromagnetism', allegiance: 'Krakoa / X-Men', linkedCharId: 'magneto', note: 'Commands planetary magnetospheres, iron bloodstreams, and kept his heart beating purely via magnetism on Arakko after Uranos tore it out.' },
    { id: 'storm', name: 'Ororo Munroe', alias: 'Storm • Regent of Sol', domain: 'Weather / Atmokinesis', allegiance: 'X-Men / Arakko', linkedCharId: 'storm', note: 'Terraformer of Mars’s atmosphere; manipulates cosmic solar winds, jovian pressure systems, and atmospheric bio-electricity.' },
    { id: 'franklin-richards', name: 'Franklin Richards', alias: 'Powerhouse', domain: 'Universal Reality Manipulation', allegiance: 'Fantastic Four', linkedCharId: 'franklin-richards', note: 'Constructed baby pocket universes beneath his bedsheets and restored the Eighth Cosmos alongside Reed and Molecule Man.' },
    { id: 'iceman', name: 'Robert "Bobby" Drake', alias: 'Iceman', domain: 'Thermokinesis (Negative Thermal)', allegiance: 'X-Men', linkedCharId: 'iceman', note: 'Halts molecular motion down to absolute zero, freezes spacetime localized moisture, and reconstitutes consciousness from ambient vapor.' },
    { id: 'vulcan', name: 'Gabriel Summers', alias: 'Vulcan', domain: 'Energy Manipulation', allegiance: 'Shi’ar / Krakoa', linkedCharId: null, note: 'Third Summers brother capable of siphoning optic, stellar, magic-adjacent, and ambient electromagnetic spectra.' },
    { id: 'legion', name: 'David Haller', alias: 'Legion', domain: 'Power Manifestation', allegiance: 'Krakoa (Altar)', linkedCharId: null, note: 'Xavier’s son whose dissociative personas each manifest an independent Omega-tier reality, time, or psionic mutation.' },
    { id: 'proteus', name: 'Kevin MacTaggert', alias: 'Proteus', domain: 'Psionic Reality Warping', allegiance: 'The Five (Krakoa)', linkedCharId: null, note: 'Member of Krakoa’s Resurrection Five who makes cellular Viability real by warping local physical laws.' },
    { id: 'hope-summers', name: 'Hope Summers', alias: 'Mutant Messiah', domain: 'Power Manipulation & Synergy', allegiance: 'Quiet Council / The Five', linkedCharId: null, note: 'Synchronizes and amplifies all mutant X-Genes in proximity to flawless peak harmony; Messiah of the White Hot Room.' },
    { id: 'elixir', name: 'Joshua Foley', alias: 'Elixir', domain: 'Biokinesis', allegiance: 'The Five (Krakoa)', linkedCharId: null, note: 'Controls cellular biology down to genetic code—capable of instant resurrection or lethal biological shutdown.' },
    { id: 'quentin-quire', name: 'Quentin Quire', alias: 'Kid Omega', domain: 'Telepathy (Psionic Shotgun)', allegiance: 'X-Force', linkedCharId: null, note: 'Processes ten million brilliant thoughts per second and manifests psychic constructs.' },
    { id: 'exodus', name: 'Bennet du Paris', alias: 'Exodus', domain: 'Telekinesis', allegiance: 'Quiet Council', linkedCharId: null, note: '12th-century crusader unlocked by Apocalypse whose telekinetic output scales proportionally with collective mutant faith.' },
    { id: 'monarch', name: 'Jamie Braddock', alias: 'Monarch', domain: 'Quantum Reality Strings', allegiance: 'Otherworld', linkedCharId: null, note: 'Pulls invisible quantum strings of local spacetime to rewrite matter and causality.' },
    { id: 'mister-m', name: 'Absolon Mercator', alias: 'Mister M', domain: 'Subatomic Matter Manipulation', allegiance: 'Otherworld / District X', linkedCharId: null, note: 'Effortlessly rearranges protons, electrons, and nuclear forces at will.' }
  ];

  const INFINITY_STONES = [
    { id: 'Power', name: 'Power Gem', comicColor: '#e62429', mcuColor: '#a855f7', domain: 'All physical force, stamina & energy amplification across the universe', champion: 'Drax / Champion of the Universe / Thanos' },
    { id: 'Space', name: 'Space Gem', comicColor: '#a855f7', mcuColor: '#38bdf8', domain: 'Omnipresence, instant teleportation & spatial folding anywhere in reality', champion: 'Runner / Black Widow / Loki' },
    { id: 'Time', name: 'Time Gem', comicColor: '#f97316', mcuColor: '#22c55e', domain: 'Total mastery of past, present, future loops & causal timelines', champion: 'Gardener / Doctor Strange / Kang' },
    { id: 'Reality', name: 'Reality Gem', comicColor: '#facc15', mcuColor: '#ef4444', domain: 'Rewrites scientific laws, matter & probability at conceptual scale', champion: 'Collector / Thanos / Captain Carter' },
    { id: 'Soul', name: 'Soul Gem', comicColor: '#22c55e', mcuColor: '#f59e0b', domain: 'Commands living & departed souls and houses the pocket Soul World', champion: 'Adam Warlock / Gamora' },
    { id: 'Mind', name: 'Mind Gem', comicColor: '#38bdf8', mcuColor: '#eab308', domain: 'Universal subconscious telepathy & infinite cognitive processing', champion: 'Moondragon / Vision / Professor X' }
  ];

  const COSMIC_FUSIONS = [
    {
      id: 'full-gauntlet',
      stones: ['Power', 'Space', 'Time', 'Reality', 'Soul', 'Mind'],
      name: 'Complete Infinity Gauntlet (Earth-616 Omnipotence)',
      tier: 'Universal Abstract Override',
      wielders: 'Thanos (Infinity Gauntlet #1, 1991), Nebula, Adam Warlock, Black Panther (Secret Wars #7), Reed Richards, Iron Man',
      kidNote: 'All six Infinity Stones united! Grants complete mastery over one entire universe—though each Gauntlet only works inside its home Earth!',
      adultNote: 'Grants absolute sovereignty over its native universe—eclipsing Eternity, Infinity, Lord Chaos & Master Order—subject only to the Living Tribunal and Hickman’s Incursion rule that an Infinity Gauntlet cannot function outside its native reality.'
    },
    {
      id: 'time-space-bridge',
      stones: ['Space', 'Time'],
      name: 'Spacetime Continuum Warp (Chronal Teleportation)',
      tier: 'Multiversal Traversal',
      wielders: 'Kang the Conqueror, Loki, Doctor Strange, Reed Richards',
      kidNote: 'Freezes time and opens portals to step anywhere in history in the blink of an eye!',
      adultNote: 'Locks the four-dimensional Minkowski manifold, enabling instantaneous displacement to any spatial coordinate at any historical epoch.'
    },
    {
      id: 'reality-power-engine',
      stones: ['Power', 'Reality'],
      name: 'Cosmos Rewrite Engine (Permanent Matter Conversion)',
      tier: 'Cosmic Architect',
      wielders: 'Thanos, Scarlet Witch (Chaos Parallel), Franklin Richards',
      kidNote: 'Supercharges Reality beams so illusions become real planets, stars, and unbreakable shields!',
      adultNote: 'Power Gem supplies infinite energetic fuel to anchor Reality Gem alterations permanently without snapping back once concentration ceases.'
    },
    {
      id: 'mind-soul-nexus',
      stones: ['Soul', 'Mind'],
      name: 'Universal Astral & Soul-World Omniscience',
      tier: 'Omnipathic Singularity',
      wielders: 'Adam Warlock, Professor X (Illuminati), Vision',
      kidNote: 'Connects every heart and mind across the galaxies in peaceful harmony!',
      adultNote: 'Links every sentient psyche on the Astral Plane directly with their metaphysical essence, rivaling Cerebro + Phoenix Force.'
    },
    {
      id: 'time-mind-foresight',
      stones: ['Time', 'Mind'],
      name: '14,000,605-Timeline Precognitive Matrix',
      tier: 'Deterministic Omniscience',
      wielders: 'Doctor Strange, Immortus, Madame Web',
      kidNote: 'Lets you preview millions of possible futures at super-speed to find the one winning strategy!',
      adultNote: 'Simulates every branching probability tree simultaneously while retaining lucid strategic memory across loops.'
    },
    {
      id: 'power-space-nova',
      stones: ['Power', 'Space'],
      name: 'Moon-Thrower Gravitational Singularity',
      tier: 'Stellar Siegemaster',
      wielders: 'Thanos on Titan, Silver Surfer, Carol Danvers (Binary)',
      kidNote: 'Crushes moons and teleports meteor showers straight across star systems!',
      adultNote: 'Compresses stellar mass through spatial wormholes with unlimited kinetic amplification.'
    }
  ];

  const QUIZ_QUESTIONS = [
    {
      id: 'q1',
      era: 'silver',
      difficulty: 'kid',
      question: 'Which comic issue introduced Spider-Man (Peter Parker) in August 1962?',
      options: ['Amazing Fantasy #15', 'Detective Comics #27', 'Tales of Suspense #39', 'Uncanny X-Men #1'],
      answerIndex: 0,
      explanation: 'Stan Lee and Steve Ditko debuted Peter Parker in Amazing Fantasy #15 (Aug 1962), coining the timeless lesson of power and responsibility!'
    },
    {
      id: 'q2',
      era: 'silver',
      difficulty: 'adult',
      question: 'Why does An Infinity Gauntlet from Earth-616 fail when Captain America uses it to push away an incursion Earth in Hickman’s New Avengers #3?',
      options: [
        'Infinity Gems only function within the specific native universe where they were forged',
        'Thanos placed a biometric curse on the Gems',
        'Vibranium absorbs Infinity radiation',
        'Uatu the Watcher deactivated the Time Gem'
      ],
      answerIndex: 0,
      explanation: 'Established in JLA/Avengers, Fantastic Four #571 (Council of Reeds), and New Avengers #3: Infinity Gems are bound strictly to their native reality.'
    },
    {
      id: 'q3',
      era: 'bronze',
      difficulty: 'kid',
      question: 'What virtually indestructible metal coats Wolverine’s claws and skeleton?',
      options: ['Adamantium', 'Kryptonite', 'Beskar', 'Carbonadium'],
      answerIndex: 0,
      explanation: 'Weapon X bonded True Adamantium to Logan’s skeleton—which only his mutant healing factor allowed him to survive!'
    },
    {
      id: 'q4',
      era: 'multiverse',
      difficulty: 'adult',
      question: 'In Jonathan Hickman’s Secret Wars (2015), whose stolen cosmic power enabled Victor Von Doom to construct Battleworld as God Emperor Doom?',
      options: [
        'The Beyonders (Ivory Kings), channeled through Owen Reece (Molecule Man)',
        'Dormammu and the Dark Dimension',
        'Knull and All-Black the Necrosword',
        'Kang’s Time Variance Authority Loom'
      ],
      answerIndex: 0,
      explanation: 'Doom, Doctor Strange, and Molecule Man detonated a multiversal bomb of Owen Reece variants to usurp the Ivory Kings’ (Beyonders’) omnipotence.'
    },
    {
      id: 'q5',
      era: 'multiverse',
      difficulty: 'adult',
      question: 'Which sinister alternate-universe Reed Richards survived Earth-1610 and engineered the new Ultimate Universe (Earth-6160)?',
      options: ['The Maker', 'Kang Prime', 'Maestro', 'Onslaught'],
      answerIndex: 0,
      explanation: 'Ultimate Reed Richards (Earth-1610) evolved into The Maker and used chronal intervention in Ultimate Invasion (2023) to sculpt Earth-6160.'
    },
    {
      id: 'q6',
      era: 'bronze',
      difficulty: 'kid',
      question: 'In Earth-65, who was bitten by the radioactive spider to become Ghost-Spider?',
      options: ['Gwen Stacy', 'Mary Jane Watson', 'Mayday Parker', 'Kamala Khan'],
      answerIndex: 0,
      explanation: 'On Earth-65, drummer Gwen Stacy of The Mary Janes became Spider-Woman—better known across the Multiverse as Ghost-Spider!'
    },
    {
      id: 'q7',
      era: 'multiverse',
      difficulty: 'adult',
      question: 'During the Krakoan era (Planet-Size X-Men #1), which Omega-level mutant terraformed Mars into Planet Arakko and became Regent of Sol?',
      options: ['Storm (Ororo Munroe)', 'Emma Frost', 'Kitty Pryde', 'Psylocke'],
      answerIndex: 0,
      explanation: 'Together with Magneto, Iceman, and Arakkii Omegas, Storm birthed a breathable Martian atmosphere and claimed the Seat of All-Around-Us as Regent of Sol.'
    },
    {
      id: 'q8',
      era: 'silver',
      difficulty: 'adult',
      question: 'Who originally coined the designation "Earth-616" for the mainstream Marvel Comics continuity?',
      options: [
        'Alan Moore & Alan Davis in Marvel UK’s Captain Britain stories (1983)',
        'Jim Starlin in Infinity Gauntlet #1 (1991)',
        'Brian Michael Bendis in House of M #1 (2005)',
        'Kevin Feige in Iron Man (2008)'
      ],
      answerIndex: 0,
      explanation: 'First printed in Marvel UK’s The Daredevils #7 (July 1983) during Saturnyne and the Captain Britain Corps’ multiversal trials!'
    }
  ];

  const payload = {
    ERAS,
    ORIGINS,
    REALITIES,
    FACTIONS,
    OMEGA_MUTANTS,
    INFINITY_STONES,
    COSMIC_FUSIONS,
    QUIZ_QUESTIONS
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = payload;
  }
  root.MARVEL_WORLD_DATA = payload;
})(typeof window !== 'undefined' ? window : globalThis);
