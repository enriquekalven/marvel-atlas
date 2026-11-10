/**
 * Interactive SVG Marvel Multiverse Nexus, Sacred Timeline & Incursion Map
 */

(function initMarvelMapUi(root) {
  'use strict';

  const domModule =
    typeof module !== 'undefined' && module.exports
      ? require('./dom.js')
      : root.MARVEL_DOM;

  const { svgEl, clearEl } = domModule;

  function renderMultiverseMap(container, realities, selectedRealityId, isZoomed, onSelectReality) {
    clearEl(container);
    const viewBox = isZoomed ? '170 75 560 340' : '90 45 720 430';

    const byId = new Map(realities.map((r) => [r.id, r]));

    // Orbital Sacred Timeline Rings
    const rings = [115, 195, 275].map((rx) =>
      svgEl('ellipse', {
        cx: 450,
        cy: 245,
        rx: rx * 1.18,
        ry: rx * 0.72,
        fill: 'none',
        stroke: 'rgba(148, 163, 184, 0.16)',
        'stroke-width': '1.2',
        'stroke-dasharray': '6 6'
      })
    );

    // Incursion & Web-of-Life Tethers
    const drawnPairs = new Set();
    const tetherLines = [];
    for (const r of realities) {
      for (const targetId of r.tethers || []) {
        const target = byId.get(targetId);
        if (!target) continue;
        const pairKey = [r.id, target.id].sort().join('--');
        if (drawnPairs.has(pairKey)) continue;
        drawnPairs.add(pairKey);

        const isActiveLink = r.id === selectedRealityId || target.id === selectedRealityId;
        tetherLines.push(
          svgEl('line', {
            x1: r.x,
            y1: r.y,
            x2: target.x,
            y2: target.y,
            stroke: isActiveLink ? '#e62429' : 'rgba(56, 189, 248, 0.32)',
            'stroke-width': isActiveLink ? '2.6' : '1.4',
            'stroke-dasharray': isActiveLink ? 'none' : '5 4'
          })
        );
      }
    }

    // Reality Nodes
    const nodes = realities.map((reality) => {
      const isSelected = reality.id === selectedRealityId;
      const g = svgEl(
        'g',
        {
          class: 'earth-node-group',
          tabindex: '0',
          role: 'button',
          'aria-pressed': isSelected ? 'true' : 'false',
          'aria-label': `${reality.code} — ${reality.name}`
        },
        [
          isSelected
            ? svgEl('circle', {
                cx: reality.x,
                cy: reality.y,
                r: reality.radius + 8,
                fill: 'none',
                stroke: '#facc15',
                'stroke-width': '2.5',
                'stroke-dasharray': '4 3'
              })
            : null,
          svgEl('circle', {
            cx: reality.x,
            cy: reality.y,
            r: reality.radius,
            fill: reality.color,
            stroke: isSelected ? '#ffffff' : '#0f172a',
            'stroke-width': isSelected ? '3' : '2'
          }),
          svgEl(
            'text',
            {
              x: reality.x,
              y: reality.y + 4,
              'text-anchor': 'middle',
              fill: '#ffffff',
              'font-size': '9.5',
              'font-weight': '900',
              'font-family': 'monospace'
            },
            [
              document.createTextNode(
                reality.code.replace('Earth-', '').replace('Battleworld / WHR', 'BW')
              )
            ]
          ),
          svgEl(
            'text',
            {
              x: reality.x,
              y: reality.y + reality.radius + 15,
              'text-anchor': 'middle',
              fill: isSelected ? '#facc15' : '#cbd5e1',
              'font-size': '10.5',
              'font-weight': isSelected ? '800' : '700'
            },
            [document.createTextNode(reality.code)]
          )
        ]
      );

      g.addEventListener('click', () => onSelectReality(reality.id));
      g.addEventListener('keydown', (evt) => {
        if (evt.key === 'Enter' || evt.key === ' ') {
          evt.preventDefault();
          onSelectReality(reality.id);
        }
      });
      return g;
    });

    const svg = svgEl(
      'svg',
      {
        viewBox,
        class: 'nexus-map-svg',
        role: 'group',
        'aria-label': 'Interactive Marvel Multiverse Earths and Incursion Map'
      },
      [...rings, ...tetherLines, ...nodes]
    );

    container.appendChild(svg);
  }

  const exported = { renderMultiverseMap };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exported;
  }
  root.MARVEL_MAP_UI = exported;
})(typeof window !== 'undefined' ? window : globalThis);
