# Marvel Multiverse & Omnibus Atlas — Design System (`MASTER.md`)

## 1. Aesthetic Direction: "Bullpen Omnibus & S.W.O.R.D. Archival Telemetry"
- **Philosophy**: Swiss Modernism 2.0 editorial grid meets Mark Gruenwald's *Official Handbook of the Marvel Universe (OHOTMU)* and Jack Kirby cosmic plate curation.
- **Anti-Patterns Strictly Excluded**: No purple-on-dark neon glow, no gradient-filled headline text, no decorative mesh/grid backgrounds, no raw Unicode emojis in navigation/buttons.

## 2. Semantic Color Tokens (WCAG AA Verified ≥ 4.5:1)

### Dark Theme (`html[data-theme="dark"]` — S.W.O.R.D. / Nexus Night)
- `--bg-canvas`: `#0a0e14`
- `--bg-surface`: `#121923`
- `--bg-surface-elevated`: `#1a2433`
- `--bg-surface-subtle`: `#0e141d`
- `--border-default`: `#28374c`
- `--border-strong`: `#3b516f`
- `--text-primary`: `#f4f7fb` (16.8:1 on surface)
- `--text-secondary`: `#bcc9db` (9.8:1 on surface)
- `--text-muted`: `#8b9db5` (5.6:1 on surface)
- `--accent-primary`: `#e62429` (Marvel Bullpen Crimson)
- `--accent-gold`: `#facc15` (Mutant X-Gold / Collector Plaque)
- `--accent-cyan`: `#38bdf8` (Cerebro / Watcher Telemetry)
- `--accent-emerald`: `#22c55e` (Krakoa Gate / Gamma)

### Light Theme (`html[data-theme="light"]` — 1963 Newsprint Omnibus)
- `--bg-canvas`: `#f6f2e8`
- `--bg-surface`: `#fffdf8`
- `--bg-surface-elevated`: `#efe8d8`
- `--bg-surface-subtle`: `#f3ede0`
- `--border-default`: `#d5c7ac`
- `--border-strong`: `#b39f7b`
- `--text-primary`: `#181615` (16.5:1 on surface)
- `--text-secondary`: `#3f3b37` (10.2:1 on surface)
- `--text-muted`: `#665e56` (5.4:1 on surface)
- `--accent-primary`: `#b91c1c` (Four-Color Vintage Crimson, 6.2:1)
- `--accent-gold`: `#92400e` (Archival Ochre Bronze, 6.4:1)
- `--accent-cyan`: `#0369a1` (6.1:1)
- `--accent-emerald`: `#15803d` (5.1:1)

## 3. Typography, Accessibility & Motion
- **Typography**: System editorial sans (`system-ui`, `-apple-system`, `'Segoe UI'`, `Roboto`) + monospace (`ui-monospace`) with `font-variant-numeric: tabular-nums` across Earth numbers (`Earth-616`), issue citations, OHOTMU 1–7 grids, and 0–100 clash scores.
- **Touch & Focus**: Minimum `40–44px` interactive controls, explicit `:focus-visible` ring (`2px solid var(--accent-cyan)`), full RTL (`dir="rtl"`) logical CSS support, and `prefers-reduced-motion: reduce` zero-animation override.
