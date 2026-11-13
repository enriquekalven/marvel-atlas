/**
 * Safe Zero-XSS DOM, Bespoke Comic Cover SVG Plate Engine & OHOTMU 1–7 Power Grid Builders
 *
 * Security & CSP compliance:
 * - Zero innerHTML, outerHTML, insertAdjacentHTML, or document.write
 * - Zero inline style attributes (strict style-src 'self')
 * - All SVG geometry constructed via document.createElementNS('http://www.w3.org/2000/svg', ...)
 */

(function initMarvelSafeDom(root) {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';

  function clearEl(element) {
    if (element && typeof element.replaceChildren === 'function') {
      element.replaceChildren();
    }
  }

  function el(tag, options, children) {
    const node = document.createElement(tag);
    if (options) {
      if (options.className) node.className = options.className;
      if (options.id) node.id = options.id;
      if (options.text !== undefined && options.text !== null) {
        node.textContent = String(options.text);
      }
      if (options.type) node.type = options.type;
      if (options.value !== undefined) node.value = String(options.value);
      if (options.placeholder) node.placeholder = options.placeholder;
      if (options.title) node.title = options.title;
      if (options.attrs) {
        for (const [k, v] of Object.entries(options.attrs)) {
          if (v !== undefined && v !== null && v !== false) {
            node.setAttribute(k, String(v));
          }
        }
      }
      if (options.dataset) {
        for (const [k, v] of Object.entries(options.dataset)) {
          if (v !== undefined && v !== null) {
            node.dataset[k] = String(v);
          }
        }
      }
      if (options.on) {
        for (const [evt, handler] of Object.entries(options.on)) {
          if (typeof handler === 'function') {
            node.addEventListener(evt, handler);
          }
        }
      }
    }

    if (Array.isArray(children)) {
      for (const child of children) {
        if (child === null || child === undefined || child === false) continue;
        if (typeof child === 'string' || typeof child === 'number') {
          node.appendChild(document.createTextNode(String(child)));
        } else {
          node.appendChild(child);
        }
      }
    }
    return node;
  }

  function svgEl(tag, attrs, children) {
    const node = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v !== undefined && v !== null) {
          node.setAttribute(k, String(v));
        }
      }
    }
    if (Array.isArray(children)) {
      for (const child of children) {
        if (child) node.appendChild(child);
      }
    }
    return node;
  }

  function createUiIconSvg(iconName, size) {
    const dim = size || 16;
    const pathsByIcon = {
      users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.87',
      swords: 'M14.5 17.5 3 6V3h3l11.5 11.5 M13 19l6-6 M16 16l4 4 M19 21l2-2 M9.5 6.5 21 18v3h-3L6.5 9.5',
      xlogo: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M7.5 7.5l9 9 M16.5 7.5l-9 9',
      globe: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
      shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
      sparkles: 'M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2L12 3z',
      archive: 'M4 4h16v4H4z M6 8v12h12V8 M10 12h4',
      volume: 'M11 5L6 9H2v6h4l5 4V5z M15.5 8.5a5 5 0 0 1 0 7 M19 5a10 10 0 0 1 0 14',
      stop: 'M6 6h12v12H6z',
      share: 'M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7 M16 6l-4-4-4 4 M12 2v13',
      swap: 'M7 16V4m0 0L3 8m4-4l4 4 M17 8v12m0 0l4-4m-4 4l-4-4',
      shuffle: 'M16 3h5v5 M4 20L21 3 M21 16v5h-5 M15 15l6 6 M4 4l5 5',
      zoom: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.35-4.35 M11 8v6 M8 11h6',
      close: 'M18 6L6 18 M6 6l12 12'
    };
    const d = pathsByIcon[iconName] || pathsByIcon.sparkles;
    return svgEl(
      'svg',
      {
        viewBox: '0 0 24 24',
        width: dim,
        height: dim,
        class: 'ui-icon-svg',
        'aria-hidden': 'true'
      },
      [
        svgEl('path', {
          d,
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round'
        })
      ]
    );
  }

  function renderEmblemMotif(emblem, primary, accent) {
    const g = svgEl('g', { transform: 'translate(120, 172)' });
    switch (emblem) {
      case 'claws':
        g.appendChild(
          svgEl('path', {
            d: 'M-42 42 L18 -46 M-12 48 L36 -38 M18 52 L52 -24',
            stroke: accent,
            'stroke-width': '8',
            'stroke-linecap': 'round'
          })
        );
        g.appendChild(
          svgEl('path', {
            d: 'M-42 42 L18 -46 M-12 48 L36 -38 M18 52 L52 -24',
            stroke: '#ffffff',
            'stroke-width': '2.5',
            'stroke-linecap': 'round'
          })
        );
        break;
      case 'phoenix':
        g.appendChild(
          svgEl('path', {
            d: 'M0 -48 C18 -20 56 -36 62 -6 C38 4 24 18 0 46 C-24 18 -38 4 -62 -6 C-56 -36 -18 -20 0 -48 Z',
            fill: accent,
            stroke: primary,
            'stroke-width': '3'
          })
        );
        break;
      case 'visor':
        g.appendChild(
          svgEl('rect', {
            x: -56,
            y: -14,
            width: 112,
            height: 28,
            rx: 12,
            fill: '#1e293b',
            stroke: primary,
            'stroke-width': '4'
          })
        );
        g.appendChild(
          svgEl('rect', { x: -46, y: -6, width: 92, height: 12, rx: 6, fill: accent })
        );
        break;
      case 'spider':
        g.appendChild(svgEl('ellipse', { cx: 0, cy: -10, rx: 14, ry: 18, fill: accent }));
        g.appendChild(svgEl('ellipse', { cx: 0, cy: 18, rx: 19, ry: 24, fill: accent }));
        g.appendChild(
          svgEl('path', {
            d: 'M-12 -14 L-44 -42 M-14 -4 L-52 -12 M-14 8 L-48 24 M-12 20 L-38 48 M12 -14 L44 -42 M14 -4 L52 -12 M14 8 L48 24 M12 20 L38 48',
            stroke: accent,
            'stroke-width': '5',
            'stroke-linecap': 'round',
            fill: 'none'
          })
        );
        break;
      case 'star':
        g.appendChild(svgEl('circle', { cx: 0, cy: 0, r: 52, fill: '#e62429' }));
        g.appendChild(svgEl('circle', { cx: 0, cy: 0, r: 40, fill: '#ffffff' }));
        g.appendChild(svgEl('circle', { cx: 0, cy: 0, r: 28, fill: '#1d4ed8' }));
        g.appendChild(
          svgEl('polygon', {
            points: '0,-24 6,-7 24,-7 10,4 15,21 0,11 -15,21 -10,4 -24,-7 -6,-7',
            fill: '#ffffff'
          })
        );
        break;
      case 'hammer':
        g.appendChild(
          svgEl('rect', {
            x: -38,
            y: -38,
            width: 76,
            height: 44,
            rx: 6,
            fill: '#cbd5e1',
            stroke: accent,
            'stroke-width': '3.5'
          })
        );
        g.appendChild(svgEl('rect', { x: -7, y: 6, width: 14, height: 50, rx: 3, fill: '#92400e' }));
        break;
      case 'reactor':
        g.appendChild(
          svgEl('circle', {
            cx: 0,
            cy: 0,
            r: 46,
            fill: 'none',
            stroke: accent,
            'stroke-width': '6'
          })
        );
        g.appendChild(
          svgEl('polygon', {
            points: '-32,-18 32,-18 0,38',
            fill: '#38bdf8',
            stroke: '#ffffff',
            'stroke-width': '3'
          })
        );
        break;
      case 'four':
        g.appendChild(
          svgEl('circle', {
            cx: 0,
            cy: 0,
            r: 48,
            fill: '#f8fafc',
            stroke: primary,
            'stroke-width': '6'
          })
        );
        g.appendChild(
          svgEl('path', {
            d: 'M8 30 V-28 L-26 12 H22',
            fill: 'none',
            stroke: '#0284c7',
            'stroke-width': '11',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round'
          })
        );
        break;
      case 'helmet':
      case 'galactus':
        g.appendChild(
          svgEl('path', {
            d: 'M-38 42 V-12 C-38 -38 38 -38 38 -12 V42 L18 42 L18 2 L0 -12 L-18 2 L-18 42 Z',
            fill: primary,
            stroke: accent,
            'stroke-width': '4'
          })
        );
        break;
      case 'panther':
        g.appendChild(
          svgEl('polygon', {
            points: '-36,-38 -18,-14 18,-14 36,-38 44,8 0,46 -44,8',
            fill: '#0f172a',
            stroke: accent,
            'stroke-width': '4'
          })
        );
        g.appendChild(
          svgEl('path', {
            d: 'M-24 2 L-8 8 M24 2 L8 8',
            stroke: '#ffffff',
            'stroke-width': '4',
            'stroke-linecap': 'round'
          })
        );
        break;
      case 'gauntlet':
        g.appendChild(
          svgEl('rect', {
            x: -30,
            y: -30,
            width: 60,
            height: 70,
            rx: 12,
            fill: '#eab308',
            stroke: '#fef08a',
            'stroke-width': '3'
          })
        );
        [
          [-18, -14, '#a855f7'],
          [-6, -18, '#38bdf8'],
          [6, -18, '#ef4444'],
          [18, -14, '#f97316'],
          [0, 6, '#eab308'],
          [-24, 6, '#22c55e']
        ].forEach(([cx, cy, c]) => {
          g.appendChild(svgEl('circle', { cx, cy, r: 5.5, fill: c, stroke: '#111827', 'stroke-width': '1.5' }));
        });
        break;
      case 'eye':
        g.appendChild(
          svgEl('path', {
            d: 'M-50 0 Q0 -42 50 0 Q0 42 -50 0 Z',
            fill: 'none',
            stroke: accent,
            'stroke-width': '5'
          })
        );
        g.appendChild(svgEl('circle', { cx: 0, cy: 0, r: 16, fill: primary, stroke: '#ffffff', 'stroke-width': '3' }));
        break;
      case 'lightning':
        g.appendChild(
          svgEl('polygon', {
            points: '10,-52 -28,4 -2,4 -16,52 30,-8 4,-8',
            fill: accent,
            stroke: '#ffffff',
            'stroke-width': '2.5',
            'stroke-linejoin': 'round'
          })
        );
        break;
      case 'flame':
        g.appendChild(
          svgEl('path', {
            d: 'M0 -50 C24 -22 40 4 28 32 C18 50 -18 50 -28 32 C-40 4 -18 -18 0 -50 Z',
            fill: accent,
            stroke: primary,
            'stroke-width': '3.5'
          })
        );
        break;
      case 'blade':
        g.appendChild(
          svgEl('polygon', {
            points: '0,-54 9,-12 9,26 -9,26 -9,-12',
            fill: accent,
            stroke: '#ffffff',
            'stroke-width': '2'
          })
        );
        g.appendChild(svgEl('rect', { x: -22, y: 24, width: 44, height: 8, rx: 3, fill: primary }));
        g.appendChild(svgEl('rect', { x: -5, y: 32, width: 10, height: 18, rx: 2, fill: '#cbd5e1' }));
        break;
      case 'crown':
        g.appendChild(
          svgEl('polygon', {
            points: '-40,26 -46,-18 -18,4 0,-36 18,4 46,-18 40,26',
            fill: accent,
            stroke: primary,
            'stroke-width': '3'
          })
        );
        break;
      case 'gamma':
        g.appendChild(svgEl('circle', { cx: 0, cy: 0, r: 44, fill: 'none', stroke: accent, 'stroke-width': '6' }));
        g.appendChild(svgEl('circle', { cx: 0, cy: 0, r: 12, fill: primary }));
        g.appendChild(svgEl('path', { d: 'M-34 -18 L-10 -6 M34 -18 L10 -6 M0 38 V12', stroke: primary, 'stroke-width': '12', 'stroke-linecap': 'round' }));
        break;
      case 'rings':
        [[-22, -16], [22, -16], [-30, 12], [30, 12], [0, 28]].forEach(([rx, ry]) => {
          g.appendChild(svgEl('circle', { cx: rx, cy: ry, r: 12, fill: 'none', stroke: accent, 'stroke-width': '3.5' }));
        });
        break;
      case 'crescent':
        g.appendChild(
          svgEl('path', {
            d: 'M14 -44 A44 44 0 1 0 14 44 A32 32 0 1 1 14 -44 Z',
            fill: accent
          })
        );
        break;
      default:
        g.appendChild(
          svgEl('circle', {
            cx: 0,
            cy: 0,
            r: 46,
            fill: 'none',
            stroke: accent,
            'stroke-width': '6'
          })
        );
        g.appendChild(
          svgEl('path', {
            d: 'M-30 -30 L30 30 M30 -30 L-30 30',
            stroke: primary,
            'stroke-width': '9',
            'stroke-linecap': 'round'
          })
        );
        break;
    }
    return g;
  }

  /**
   * Builds a bespoke Marvel Four-Color & Kirby-Krackle Collector Comic Cover Plate SVG
   */
  function createComicCoverSvg(resolvedState, customLabel) {
    const ch = resolvedState.character;
    const theme = ch.coverTheme || {
      bg: '#111827',
      secondary: '#e62429',
      accent: '#facc15',
      emblem: 'xcrest',
      issueNo: '#1',
      seriesTitle: 'MARVEL OMNIBUS'
    };
    const variantAccent = resolvedState.coverAccent || theme.accent;
    const earthLabel = (resolvedState.earth || 'Earth-616').replace('Battleworld / WHR', 'BATTLEWORLD');

    const krackleDots = [
      [34, 96, 7],
      [48, 108, 4.5],
      [26, 118, 5],
      [204, 88, 8],
      [190, 102, 4.5],
      [212, 112, 5.5],
      [42, 248, 6],
      [198, 244, 6.5],
      [184, 256, 4]
    ].map(([cx, cy, r]) =>
      svgEl('circle', { cx, cy, r, fill: variantAccent, opacity: '0.45' })
    );

    const svg = svgEl(
      'svg',
      {
        viewBox: '0 0 240 325',
        class: 'comic-cover-svg',
        role: 'img',
        'aria-label': customLabel || `${ch.name} — ${resolvedState.variantName} comic cover plate`
      },
      [
        // Base Comic Board Canvas
        svgEl('rect', { x: 0, y: 0, width: 240, height: 325, fill: theme.bg }),
        // Dynamic Kirby Diagonal Action Ray
        svgEl('polygon', {
          points: '0,62 240,34 240,195 0,242',
          fill: theme.secondary,
          opacity: '0.18'
        }),
        // Cosmic Halo Ring
        svgEl('circle', {
          cx: 120,
          cy: 172,
          r: 72,
          fill: 'none',
          stroke: variantAccent,
          'stroke-width': '2',
          'stroke-dasharray': '7 5',
          opacity: '0.6'
        }),
        ...krackleDots,
        // Top Masthead Strip
        svgEl('rect', { x: 0, y: 0, width: 240, height: 48, fill: '#090d14', opacity: '0.88' }),
        svgEl('line', { x1: 0, y1: 48, x2: 240, y2: 48, stroke: variantAccent, 'stroke-width': '2.5' }),
        // Authentic Marvel Corner Box (Top-Left)
        svgEl('rect', {
          x: 8,
          y: 6,
          width: 48,
          height: 36,
          rx: 3,
          fill: variantAccent
        }),
        svgEl(
          'text',
          {
            x: 32,
            y: 21,
            'text-anchor': 'middle',
            fill: '#090d14',
            'font-size': '10',
            'font-weight': '900',
            'font-family': 'monospace'
          },
          [document.createTextNode(theme.issueNo || '#1')]
        ),
        svgEl(
          'text',
          {
            x: 32,
            y: 35,
            'text-anchor': 'middle',
            fill: '#090d14',
            'font-size': '7.5',
            'font-weight': '800',
            'font-family': 'sans-serif'
          },
          [document.createTextNode(ch.omegaMutant ? 'OMEGA' : ch.origin.toUpperCase().slice(0, 6))]
        ),
        // Masthead Series Title
        svgEl(
          'text',
          {
            x: 146,
            y: 23,
            'text-anchor': 'middle',
            fill: '#ffffff',
            'font-size': '11.5',
            'font-weight': '900',
            'letter-spacing': '0.8',
            'font-family': 'sans-serif'
          },
          [document.createTextNode((theme.seriesTitle || ch.name).slice(0, 17).toUpperCase())]
        ),
        svgEl(
          'text',
          {
            x: 146,
            y: 38,
            'text-anchor': 'middle',
            fill: variantAccent,
            'font-size': '8.5',
            'font-weight': '700',
            'font-family': 'monospace'
          },
          [document.createTextNode(earthLabel.toUpperCase().slice(0, 18))]
        ),
        // Central Hero/Villain Emblem
        renderEmblemMotif(theme.emblem, theme.secondary, variantAccent),
        // Bottom Collector Variant Ribbon
        svgEl('rect', { x: 0, y: 266, width: 240, height: 59, fill: '#090d14', opacity: '0.92' }),
        svgEl('line', { x1: 0, y1: 266, x2: 240, y2: 266, stroke: variantAccent, 'stroke-width': '2.5' }),
        svgEl(
          'text',
          {
            x: 120,
            y: 287,
            'text-anchor': 'middle',
            fill: '#ffffff',
            'font-size': '12',
            'font-weight': '800',
            'font-family': 'sans-serif'
          },
          [document.createTextNode(ch.name.slice(0, 22))]
        ),
        svgEl(
          'text',
          {
            x: 120,
            y: 306,
            'text-anchor': 'middle',
            fill: variantAccent,
            'font-size': '9',
            'font-weight': '700',
            'font-family': 'sans-serif'
          },
          [document.createTextNode((resolvedState.variantName || '').slice(0, 28))]
        ),
        // Outer Collector Frame Border
        svgEl('rect', {
          x: 1.5,
          y: 1.5,
          width: 237,
          height: 322,
          fill: 'none',
          stroke: 'rgba(255,255,255,0.18)',
          'stroke-width': '1.5'
        })
      ]
    );

    return svg;
  }

  function createPowerBarSvg(score) {
    const clamped = Math.max(0, Math.min(100, Number(score) || 0));
    const fillWidth = Math.round((clamped / 100) * 200);
    const barColor = clamped >= 95 ? '#facc15' : clamped >= 88 ? '#e62429' : '#38bdf8';

    return svgEl(
      'svg',
      {
        viewBox: '0 0 200 8',
        preserveAspectRatio: 'none',
        class: 'power-bar-svg',
        'aria-hidden': 'true'
      },
      [
        svgEl('rect', { x: 0, y: 0, width: 200, height: 8, rx: 4, fill: 'rgba(148, 163, 184, 0.22)' }),
        svgEl('rect', { x: 0, y: 0, width: fillWidth, height: 8, rx: 4, fill: barColor })
      ]
    );
  }

  /**
   * Builds Official Marvel Handbook (OHOTMU) 1–7 Power Grid Radar Hexagon
   * Supports 1 character (Dossier) or 2 overlaid variants (1v1 Battleworld Arena)
   */
  function createOhotmuRadarSvg(stateA, stateB, axisLabels) {
    const keys = ['intelligence', 'strength', 'speed', 'durability', 'energy', 'fighting'];
    const labels = axisLabels || ['INT', 'STR', 'SPD', 'DUR', 'NRG', 'FGT'];
    const cx = 140;
    const cy = 128;
    const maxR = 84;

    function pt(idx, val) {
      const angle = -Math.PI / 2 + (idx * 2 * Math.PI) / 6;
      const ratio = Math.max(1, Math.min(7, Number(val) || 1)) / 7;
      return [
        Number((cx + Math.cos(angle) * maxR * ratio).toFixed(1)),
        Number((cy + Math.sin(angle) * maxR * ratio).toFixed(1))
      ];
    }

    const rings = [2, 4, 6, 7].map((lvl) => {
      const pts = keys.map((_, i) => pt(i, lvl).join(',')).join(' ');
      return svgEl('polygon', {
        points: pts,
        fill: 'none',
        stroke: 'rgba(148, 163, 184, 0.25)',
        'stroke-width': lvl === 7 ? '1.5' : '1'
      });
    });

    const spokes = keys.map((_, i) => {
      const [x, y] = pt(i, 7);
      return svgEl('line', {
        x1: cx,
        y1: cy,
        x2: x,
        y2: y,
        stroke: 'rgba(148, 163, 184, 0.22)',
        'stroke-width': '1'
      });
    });

    const textNodes = labels.map((lbl, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 6;
      const lx = Number((cx + Math.cos(angle) * (maxR + 24)).toFixed(1));
      const ly = Number((cy + Math.sin(angle) * (maxR + 18) + 4).toFixed(1));
      return svgEl(
        'text',
        {
          x: lx,
          y: ly,
          'text-anchor': 'middle',
          fill: 'currentColor',
          'font-size': '10',
          'font-weight': '700'
        },
        [document.createTextNode(lbl)]
      );
    });

    const ptsA = keys.map((k, i) => pt(i, stateA.grid[k]));
    const polyA = svgEl('polygon', {
      points: ptsA.map((p) => p.join(',')).join(' '),
      fill: 'rgba(230, 36, 41, 0.26)',
      stroke: '#e62429',
      'stroke-width': '2.5'
    });
    const markersA = ptsA.map(([x, y]) =>
      svgEl('circle', { cx: x, cy: y, r: 3.5, fill: '#e62429' })
    );

    const children = [...rings, ...spokes, polyA, ...markersA];

    if (stateB) {
      const ptsB = keys.map((k, i) => pt(i, stateB.grid[k]));
      children.push(
        svgEl('polygon', {
          points: ptsB.map((p) => p.join(',')).join(' '),
          fill: 'rgba(56, 189, 248, 0.22)',
          stroke: '#38bdf8',
          'stroke-width': '2.5',
          'stroke-dasharray': '5 3'
        })
      );
      ptsB.forEach(([x, y]) => {
        children.push(
          svgEl('polygon', {
            points: `${x},${y - 4.5} ${x + 4.5},${y} ${x},${y + 4.5} ${x - 4.5},${y}`,
            fill: '#38bdf8'
          })
        );
      });
    }

    children.push(...textNodes);

    return svgEl(
      'svg',
      {
        viewBox: '0 0 280 256',
        width: 280,
        height: 256,
        role: 'img',
        'aria-label': stateB
          ? `OHOTMU 1 to 7 Power Grid radar comparing ${stateA.character.name} and ${stateB.character.name}`
          : `OHOTMU 1 to 7 Power Grid radar for ${stateA.character.name}`
      },
      children
    );
  }

  function createGridComparisonBars(stateA, stateB, axisNames) {
    const keys = ['intelligence', 'strength', 'speed', 'durability', 'energy', 'fighting'];
    const wrap = el('div', { className: 'stat-compare-list' });

    keys.forEach((key, idx) => {
      const valA = Number(stateA.grid[key]) || 1;
      const valB = Number(stateB.grid[key]) || 1;
      const wA = Math.round((valA / 7) * 96);
      const wB = Math.round((valB / 7) * 96);

      const barSvg = svgEl(
        'svg',
        {
          viewBox: '0 0 200 12',
          preserveAspectRatio: 'none',
          class: 'dual-bar-svg',
          'aria-hidden': 'true'
        },
        [
          svgEl('rect', { x: 0, y: 2, width: 96, height: 8, rx: 4, fill: 'rgba(148, 163, 184, 0.2)' }),
          svgEl('rect', { x: 96 - wA, y: 2, width: wA, height: 8, rx: 4, fill: '#e62429' }),
          svgEl('rect', { x: 104, y: 2, width: 96, height: 8, rx: 4, fill: 'rgba(148, 163, 184, 0.2)' }),
          svgEl('rect', { x: 104, y: 2, width: wB, height: 8, rx: 4, fill: '#38bdf8' })
        ]
      );

      wrap.appendChild(
        el('div', { className: 'stat-compare-row' }, [
          el('div', { className: 'stat-compare-head' }, [
            el('span', { className: 'tabular-nums', text: `${valA} / 7` }),
            el('span', { text: axisNames[idx] || key }),
            el('span', { className: 'tabular-nums', text: `${valB} / 7` })
          ]),
          barSvg
        ])
      );
    });

    return wrap;
  }

  /**
   * Builds a museum-grade Collector Art Frame backed by self-hosted local Marvel artwork
   * (./assets/art/*) with ambient blurred backdrop, portrait-safe focal framing, and
   * automatic fallback to bespoke SVG cover plates if an image fails to load.
   */
  function createCollectorArtFrame(resolvedState, plate, options) {
    const opts = options || {};
    const ch = resolvedState.character;
    const variant = opts.variant || 'card'; // 'card' | 'inspector' | 'arena' | 'vault' | 'lightbox'
    const rarityClass = opts.rarityClass || (ch.powerScore >= 96 || ch.omegaMutant ? 'omnibus-mythic' : 'key-issue');
    const altText =
      opts.alt ||
      `${ch.name} — ${resolvedState.variantName} (${resolvedState.earth}) Marvel comic artwork`;

    const frame = el('div', {
      className: `collector-art-frame variant-${variant} rarity-${rarityClass}`,
      dataset: {
        variant,
        rarity: rarityClass
      }
    });

    if (plate && plate.localPath) {
      const backdropImg = el('img', {
        className: 'collector-art-backdrop',
        attrs: {
          src: plate.localPath,
          alt: '',
          loading: 'lazy',
          decoding: 'async',
          'aria-hidden': 'true'
        }
      });

      const isLandscapeArt =
        plate.width && plate.height ? plate.width > plate.height * 1.15 : false;
      const fitMode =
        variant === 'lightbox'
          ? 'contain'
          : isLandscapeArt && (variant === 'inspector' || variant === 'vault')
            ? 'contain'
            : 'cover';

      const mainImg = el('img', {
        className: 'collector-art-img',
        dataset: {
          focal: plate.focalPoint || 'center 15%',
          fit: fitMode,
          variant
        },
        attrs: {
          src: plate.localPath,
          alt: altText,
          loading: variant === 'inspector' || variant === 'lightbox' ? 'eager' : 'lazy',
          decoding: 'async'
        }
      });

      mainImg.addEventListener('error', () => {
        backdropImg.remove();
        mainImg.remove();
        frame.appendChild(
          el('div', { className: 'collector-art-fallback' }, [
            createComicCoverSvg(resolvedState, altText)
          ])
        );
      });

      frame.appendChild(backdropImg);
      frame.appendChild(mainImg);
    } else {
      frame.appendChild(
        el('div', { className: 'collector-art-fallback' }, [
          createComicCoverSvg(resolvedState, altText)
        ])
      );
    }

    if (opts.showTopChips) {
      const overlay = el('div', { className: 'collector-frame-overlay-top' });
      if (opts.earthChip) {
        overlay.appendChild(
          el('span', { className: 'collector-earth-chip tabular-nums', text: opts.earthChip })
        );
      }
      if (opts.badgeChip) {
        overlay.appendChild(
          el('span', {
            className: `collector-badge-chip${opts.badgeHighlight ? ' is-highlight' : ''}`,
            text: opts.badgeChip
          })
        );
      }
      if (overlay.childNodes.length) {
        frame.appendChild(overlay);
      }
    }

    if (opts.captionText) {
      frame.appendChild(
        el('div', { className: 'collector-frame-caption', text: opts.captionText })
      );
    }

    return frame;
  }

  const exported = {
    clearEl,
    el,
    svgEl,
    createUiIconSvg,
    createComicCoverSvg,
    createCollectorArtFrame,
    createPowerBarSvg,
    createOhotmuRadarSvg,
    createGridComparisonBars
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exported;
  }
  root.MARVEL_DOM = exported;
})(typeof window !== 'undefined' ? window : globalThis);
