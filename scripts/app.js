(function () {
  'use strict';

  const cfg = Object.assign({
    downloadUrl: '#pon-tu-link-de-descarga-aqui',
    mirrorUrl: '',
    version: 'Beta 1.3.0',
    versionLabel: 'Beta 1.3.0',
    fileName: 'Balaclava_Beta_1.3.0_Setup_x64.exe',
    fileSizeEs: 'Por definir (~140 MB)',
    fileSizeEn: 'TBD (~140 MB)',
    releaseDateEs: 'Noviembre 2026',
    releaseDateEn: 'November 2026',
    platformLabel: 'Windows 10 / 11 (64-bit · Tauri 2)',
    checksumSha256Es: 'Se publicará junto al instalador oficial (SHA-256)',
    checksumSha256En: 'Published alongside the official installer (SHA-256)',
    discordUrl: 'https://discord.gg/8wrsjRSMY2'
  }, window.BALACLAVA_SITE_CONFIG || {});

  const DATA = window.BALACLAVA_DATA;
  const state = {
    lang: (function () {
      try {
        const saved = window.localStorage.getItem('balaclava_web_lang');
        return saved === 'en' ? 'en' : 'es';
      } catch (_) {
        return 'es';
      }
    })(),
    activeZone: 'all',
    selectedBiomeId: 'pradera',
    hoverGrid: null,
    activeSysTab: 'combat',
    selectedRelicId: DATA.relicsShowcase[0].id,
    activePatchVer: '1.3.0'
  };

  const t = (key) => (DATA.i18n[state.lang] && DATA.i18n[state.lang][key]) || key;
  const pickLang = (es, en) => (state.lang === 'en' ? en : es);
  const isPlaceholderUrl = (url) => !url || String(url).trim() === '' || String(url).trim().startsWith('#');

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') node.className = v;
      else if (k === 'style') node.setAttribute('style', v);
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
      else if (v !== null && v !== undefined) node.setAttribute(k, String(v));
    }
    const list = Array.isArray(children) ? children : [children];
    for (const child of list) {
      if (child === null || child === undefined) continue;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    }
    return node;
  }

  /* ========================================================================
   *  CONFIGURACIÓN CENTRAL Y DESCARGA
   * ======================================================================== */
  function syncConfigUI() {
    const ver = cfg.versionLabel || cfg.version || 'Beta 1.3.0';
    const fileSize = pickLang(cfg.fileSizeEs || cfg.fileSize, cfg.fileSizeEn || cfg.fileSize) || '';
    const releaseDate = pickLang(cfg.releaseDateEs || cfg.releaseDate, cfg.releaseDateEn || cfg.releaseDate) || '';
    const checksum = pickLang(cfg.checksumSha256Es || cfg.checksumSha256, cfg.checksumSha256En || cfg.checksumSha256) || 'N/A';

    document.querySelectorAll('.js-version-text').forEach((n) => { n.textContent = ver; });
    document.querySelectorAll('.js-version-badge').forEach((n) => { n.textContent = ver.toUpperCase(); });
    document.querySelectorAll('.js-filesize-text').forEach((n) => { n.textContent = fileSize; });
    document.querySelectorAll('.js-releasedate-text').forEach((n) => { n.textContent = releaseDate; });
    document.querySelectorAll('.js-platform-text').forEach((n) => { n.textContent = cfg.platformLabel; });
    document.querySelectorAll('.js-filename-text').forEach((n) => { n.textContent = cfg.fileName; });

    const checksumEl = document.getElementById('checksum-code');
    if (checksumEl) checksumEl.textContent = checksum;

    document.querySelectorAll('.js-discord-link').forEach((a) => {
      a.setAttribute('href', cfg.discordUrl || 'https://discord.gg/8wrsjRSMY2');
    });

    const isPlaceholder = isPlaceholderUrl(cfg.downloadUrl);
    document.querySelectorAll('.js-download-trigger').forEach((btn) => {
      if (isPlaceholder) {
        btn.setAttribute('href', '#descargar');
        btn.removeAttribute('target');
        btn.removeAttribute('rel');
      } else {
        btn.setAttribute('href', cfg.downloadUrl);
        btn.setAttribute('target', '_blank');
        btn.setAttribute('rel', 'noopener noreferrer');
      }
    });

    const mirrorBtn = document.getElementById('mirror-download-btn');
    if (mirrorBtn) {
      if (!isPlaceholderUrl(cfg.mirrorUrl)) {
        mirrorBtn.href = cfg.mirrorUrl;
        mirrorBtn.classList.remove('hidden');
      } else {
        mirrorBtn.classList.add('hidden');
      }
    }
  }

  function bindDownloadTriggers() {
    document.querySelectorAll('.js-download-trigger').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        if (isPlaceholderUrl(cfg.downloadUrl)) {
          e.preventDefault();
          openNoticeModal(
            t('modalPlaceholderTitle'),
            [
              el('p', {}, t('modalPlaceholderBody')),
              el('p', {}, [
                el('code', {}, "downloadUrl: 'https://github.com/.../releases/...'")
              ])
            ]
          );
        }
      });
    });

    const copyBtn = document.getElementById('btn-copy-checksum');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const text = pickLang(cfg.checksumSha256Es || cfg.checksumSha256, cfg.checksumSha256En || cfg.checksumSha256) || '';
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
          }
          copyBtn.textContent = t('modalCopyOk');
          setTimeout(() => { copyBtn.textContent = t('copyBtn'); }, 1500);
        } catch (_) {
          copyBtn.textContent = t('copyBtn');
        }
      });
    }
  }

  /* ========================================================================
   *  MODAL
   * ======================================================================== */
  function openNoticeModal(title, bodyNodes) {
    const backdrop = document.getElementById('rpg-modal');
    const titleEl = document.getElementById('rpg-modal-title');
    const bodyEl = document.getElementById('rpg-modal-body');
    if (!backdrop || !titleEl || !bodyEl) return;

    titleEl.textContent = title;
    bodyEl.innerHTML = '';
    for (const n of bodyNodes) bodyEl.appendChild(n);
    backdrop.classList.remove('hidden');
    const closeBtn = document.getElementById('rpg-modal-close');
    if (closeBtn) closeBtn.focus();
  }

  function closeNoticeModal() {
    const backdrop = document.getElementById('rpg-modal');
    if (backdrop) backdrop.classList.add('hidden');
  }

  function bindModalEvents() {
    const backdrop = document.getElementById('rpg-modal');
    const closeBtn = document.getElementById('rpg-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closeNoticeModal);
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeNoticeModal();
      });
    }
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeNoticeModal();
    });
  }

  /* ========================================================================
   *  CIFRAS CLAVE
   * ======================================================================== */
  function renderStats() {
    const grid = document.getElementById('stats-grid');
    if (!grid) return;
    grid.innerHTML = '';
    DATA.stats.forEach((st) => {
      grid.appendChild(el('div', { class: 'hud-slate-card stat-card' }, [
        el('div', { class: 'stat-icon-box' }, [
          el('img', { src: st.icon, alt: '', class: 'pixel-img', width: 28, height: 28 })
        ]),
        el('div', {}, [
          el('span', { class: 'stat-num', style: `color:${st.accent}` }, st.num),
          el('span', { class: 'stat-label' }, pickLang(st.labelEs, st.labelEn))
        ])
      ]));
    });
  }

  /* ========================================================================
   *  MUNDO ABIERTO 19×19 & 14 BIOMAS
   * ======================================================================== */
  function hash2D(x, y, seed = 42) {
    let h = (x * 374761393 + y * 668265263 + seed * 1442695041) | 0;
    h = (h ^ (h >> 13)) * 1274126177;
    h = h ^ (h >> 16);
    return (h >>> 0) / 4294967295;
  }

  function getPlotBiome(gx, gy) {
    const C = 9;
    const dx = gx - C;
    const dy = gy - C;
    if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) return 'pradera';
    const r = Math.hypot(dx, dy);
    const rw = r + (hash2D(gx, gy, 61) - 0.5) * 0.28;
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);

    if (dx < 0 && adx > ady) {
      if (rw <= 3.75) return 'tierras_volcanicas';
      if (rw <= 6.75) return 'caldera_ceniza';
      return 'tierras_malditas';
    }
    if (dx > 0 && adx > ady) {
      if (rw <= 3.75) return 'montanas_heladas';
      if (rw <= 6.75) return 'cavernas_cristal';
      return 'glaciar_profundo';
    }
    if (dy < 0 && ady >= adx) {
      if (rw <= 3.75) return 'desierto';
      if (rw <= 6.75) return 'archipielago_coral';
      return 'dinastia_arena';
    }
    if (rw <= 3.75) return 'bosque_oscuro';
    if (rw <= 6.75) return 'selva_esmeralda';
    if (r >= 6.85 && adx >= 4) return 'necropolis_osea';
    return 'cienaga_putrida';
  }

  const atlasGrid = [];
  for (let gy = 0; gy < 19; gy++) {
    const row = [];
    for (let gx = 0; gx < 19; gx++) {
      row.push(getPlotBiome(gx, gy));
    }
    atlasGrid.push(row);
  }

  const biomeById = Object.fromEntries(DATA.biomes.map((b) => [b.id, b]));

  function drawAtlasMap() {
    const canvas = document.getElementById('atlas-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 380;
    const cell = size / 19;

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = '#091121';
    ctx.fillRect(0, 0, size, size);

    for (let gy = 0; gy < 19; gy++) {
      for (let gx = 0; gx < 19; gx++) {
        const bId = atlasGrid[gy][gx];
        const b = biomeById[bId];
        if (!b) continue;
        const zoneMatch = state.activeZone === 'all' || String(b.zone) === state.activeZone;
        const isSelected = bId === state.selectedBiomeId;
        const x = gx * cell;
        const y = gy * cell;

        ctx.save();
        ctx.globalAlpha = zoneMatch ? (isSelected ? 1.0 : 0.78) : 0.2;
        ctx.fillStyle = b.color;
        ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2);

        ctx.fillStyle = b.accent;
        ctx.globalAlpha = zoneMatch ? (isSelected ? 0.55 : 0.22) : 0.08;
        ctx.fillRect(x + 2, y + 2, cell - 4, 3);

        if (isSelected) {
          ctx.globalAlpha = 1;
          ctx.strokeStyle = '#ffd54f';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x + 1.5, y + 1.5, cell - 3, cell - 3);
        }

        if (gx === 9 && gy === 9) {
          ctx.globalAlpha = 1;
          ctx.fillStyle = '#ffd54f';
          ctx.fillRect(x + 7, y + 7, 6, 6);
        }
        if (gx === 0 && gy === 9) {
          ctx.globalAlpha = 1;
          ctx.fillStyle = '#ff1744';
          ctx.fillRect(x + 6, y + 6, 8, 8);
        }
        ctx.restore();
      }
    }

    if (state.hoverGrid) {
      const { gx, gy } = state.hoverGrid;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(gx * cell + 1, gy * cell + 1, cell - 2, cell - 2);
    }
  }

  function renderZoneFilters() {
    const bar = document.getElementById('zone-filters');
    if (!bar) return;
    bar.innerHTML = '';
    DATA.zones.forEach((z) => {
      bar.appendChild(el('button', {
        type: 'button',
        class: 'patch-ver-btn' + (state.activeZone === z.id ? ' active' : ''),
        onclick: () => {
          state.activeZone = z.id;
          if (z.id !== 'all') {
            const firstMatch = DATA.biomes.find((b) => String(b.zone) === z.id);
            if (firstMatch && String(biomeById[state.selectedBiomeId].zone) !== z.id) {
              state.selectedBiomeId = firstMatch.id;
            }
          }
          renderZoneFilters();
          renderBiomePills();
          renderBiomeInspector();
          drawAtlasMap();
        }
      }, pickLang(z.labelEs, z.labelEn)));
    });
  }

  function selectBiome(id) {
    if (!biomeById[id] || state.selectedBiomeId === id) return;
    state.selectedBiomeId = id;
    renderBiomePills();
    renderBiomeInspector();
    drawAtlasMap();
  }

  function renderBiomePills() {
    const grid = document.getElementById('biome-pills-grid');
    if (!grid) return;
    grid.innerHTML = '';
    DATA.biomes.forEach((b) => {
      const zoneMatch = state.activeZone === 'all' || String(b.zone) === state.activeZone;
      const btn = el('button', {
        type: 'button',
        class: 'biome-pill-btn' + (b.id === state.selectedBiomeId ? ' active' : '') + (!zoneMatch ? ' is-dimmed' : ''),
        onclick: () => selectBiome(b.id),
        onmouseenter: () => selectBiome(b.id)
      }, [
        el('span', { class: 'biome-pill-dot', style: `background:${b.color};border-color:${b.accent}` }),
        el('span', {}, pickLang(b.nameEs, b.nameEn)),
        el('span', { class: 'biome-pill-count' }, `${b.islands}`)
      ]);
      grid.appendChild(btn);
    });
  }

  function renderBiomeInspector() {
    const box = document.getElementById('biome-inspector');
    if (!box) return;
    const b = biomeById[state.selectedBiomeId] || DATA.biomes[0];
    const resources = pickLang(b.resourcesEs, b.resourcesEn);
    const monsters = pickLang(b.monstersEs, b.monstersEn);

    box.innerHTML = '';
    box.appendChild(el('div', { class: 'inspector-head' }, [
      el('div', { class: 'inspector-icon-box', style: `border-color:${b.accent}` }, [
        el('img', { src: b.icon, alt: pickLang(b.nameEs, b.nameEn), class: 'pixel-img', width: 40, height: 40 })
      ]),
      el('div', {}, [
        el('span', { class: 'inspector-zone-badge', style: `color:${b.accent}` }, pickLang(b.difficultyEs, b.difficultyEn)),
        el('h3', { class: 'inspector-name' }, pickLang(b.nameEs, b.nameEn)),
        el('div', { class: 'inspector-wing' }, pickLang(b.wingLabelEs, b.wingLabelEn))
      ])
    ]));

    box.appendChild(el('p', { class: 'inspector-desc' }, pickLang(b.descEs, b.descEn)));

    box.appendChild(el('div', { class: 'inspector-metrics' }, [
      el('div', { class: 'inspector-metric-box' }, [
        el('span', { class: 'inspector-metric-label' }, t('inspectorIslands')),
        el('strong', { class: 'inspector-metric-val' }, `${b.islands} / 361`)
      ]),
      el('div', { class: 'inspector-metric-box' }, [
        el('span', { class: 'inspector-metric-label' }, t('inspectorDungeons')),
        el('strong', { class: 'inspector-metric-val' }, `${b.dungeons} / 75`)
      ])
    ]));

    if (b.gate || b.swatch) {
      const stripItems = [];
      if (b.gate) {
        stripItems.push(el('img', { src: b.gate, alt: 'Portal', class: 'pixel-img', width: 46, height: 46 }));
      }
      if (b.swatch) {
        stripItems.push(el('img', { src: b.swatch, alt: 'Terreno', class: 'pixel-img inspector-swatch' }));
      }
      stripItems.push(el('div', {}, [
        el('strong', { class: 'mech-title' }, pickLang('Portal y Terreno del Bioma', 'Biome Gate & Terrain')),
        el('span', { class: 'mech-sub' }, pickLang('Gráficos extraídos directamente del juego.', 'Sprites extracted directly from the game.'))
      ]));
      box.appendChild(el('div', { class: 'inspector-preview-strip' }, stripItems));
    }

    box.appendChild(el('div', {}, [
      el('h4', { class: 'inspector-block-title' }, t('inspectorResources')),
      el('div', { class: 'tag-cloud' }, resources.map((r) => el('span', { class: 'rpg-tag' }, r)))
    ]));

    box.appendChild(el('div', {}, [
      el('h4', { class: 'inspector-block-title' }, t('inspectorMonsters')),
      el('div', { class: 'tag-cloud' }, monsters.map((m) => el('span', { class: 'rpg-tag tag-enemy' }, m)))
    ]));
  }

  function bindAtlasCanvasEvents() {
    const canvas = document.getElementById('atlas-canvas');
    if (!canvas) return;
    const getCoords = (evt) => {
      const rect = canvas.getBoundingClientRect();
      const gx = Math.max(0, Math.min(18, Math.floor(((evt.clientX - rect.left) / rect.width) * 19)));
      const gy = Math.max(0, Math.min(18, Math.floor(((evt.clientY - rect.top) / rect.height) * 19)));
      return { gx, gy };
    };
    canvas.addEventListener('mousemove', (evt) => {
      const coords = getCoords(evt);
      state.hoverGrid = coords;
      const bId = atlasGrid[coords.gy][coords.gx];
      if (bId !== state.selectedBiomeId) {
        state.selectedBiomeId = bId;
        renderBiomePills();
        renderBiomeInspector();
      }
      drawAtlasMap();
    });
    canvas.addEventListener('mouseleave', () => {
      state.hoverGrid = null;
      drawAtlasMap();
    });
    canvas.addEventListener('click', (evt) => {
      const coords = getCoords(evt);
      selectBiome(atlasGrid[coords.gy][coords.gx]);
    });
  }

  /* ========================================================================
   *  JEFE FINAL (RETRATO ESTÁTICO) & EQUIPO OMEGA
   * ======================================================================== */
  function drawStaticBossPortrait() {
    const canvas = document.getElementById('boss-portrait');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = 'rgba(255, 23, 68, 0.22)';
      ctx.beginPath();
      ctx.ellipse(canvas.width / 2, 118, 56, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      // Fotograma estático centrado del Espadachín Carmesí (fila 0, col 1: recorte 26x25 -> 104x100)
      ctx.drawImage(img, 128 + 14, 26, 26, 25, 88, 16, 104, 100);
    };
    img.src = 'assets/sprites_v13/bosses/boss_espadachin_carmesi_full.png';
  }

  function renderBossSection() {
    const attacksEl = document.getElementById('boss-attacks-list');
    if (attacksEl) {
      attacksEl.innerHTML = '';
      DATA.bossAttacks.forEach((atk) => {
        attacksEl.appendChild(el('span', { class: 'rpg-tag tag-enemy' }, pickLang(atk.nameEs, atk.nameEn)));
      });
    }

    const mechGrid = document.getElementById('boss-mechanics-grid');
    if (mechGrid) {
      mechGrid.innerHTML = '';
      DATA.bossHighlights.forEach((h) => {
        mechGrid.appendChild(el('div', { class: 'hud-slate-card mini-mech-card' }, [
          el('img', { src: h.icon, alt: '', class: 'pixel-img', width: 28, height: 28 }),
          el('div', {}, [
            el('strong', { class: 'mech-title' }, pickLang(h.titleEs, h.titleEn)),
            el('span', { class: 'mech-sub' }, pickLang(h.descEs, h.descEn))
          ])
        ]));
      });
    }

    const gearGrid = document.getElementById('omega-gear-grid');
    if (gearGrid) {
      gearGrid.innerHTML = '';
      DATA.omegaGear.forEach((item) => {
        const name = pickLang(item.nameEs, item.nameEn);
        gearGrid.appendChild(el('div', { class: `omega-item-cell rarity-${item.rarity}`, title: name }, [
          el('img', { src: item.icon, alt: name, class: 'pixel-img', width: 32, height: 32 }),
          el('span', { class: 'omega-item-name' }, name)
        ]));
      });
    }
  }

  /* ========================================================================
   *  SISTEMAS DE JUEGO
   * ======================================================================== */
  function renderSystems() {
    const tabsEl = document.getElementById('systems-tabs');
    const panelEl = document.getElementById('systems-panel');
    if (!tabsEl || !panelEl) return;

    tabsEl.innerHTML = '';
    DATA.systemTabs.forEach((tab) => {
      tabsEl.appendChild(el('button', {
        type: 'button',
        role: 'tab',
        'aria-selected': String(state.activeSysTab === tab.id),
        class: 'sys-tab-btn' + (state.activeSysTab === tab.id ? ' active' : ''),
        onclick: () => {
          state.activeSysTab = tab.id;
          renderSystems();
        }
      }, [
        el('img', { src: tab.icon, alt: '', class: 'pixel-img', width: 22, height: 22 }),
        el('span', {}, pickLang(tab.labelEs, tab.labelEn))
      ]));
    });

    const active = DATA.systemTabs.find((x) => x.id === state.activeSysTab) || DATA.systemTabs[0];
    panelEl.innerHTML = '';
    panelEl.appendChild(el('div', { class: 'sys-panel-head' }, [
      el('h3', { class: 'sys-panel-title' }, pickLang(active.headlineEs, active.headlineEn)),
      el('p', { class: 'sys-panel-summary' }, pickLang(active.summaryEs, active.summaryEn))
    ]));

    if (active.cards) {
      panelEl.appendChild(el('div', { class: 'sys-cards-grid' }, active.cards.map((c) => (
        el('div', { class: 'hud-slate-card sys-card' }, [
          el('div', { class: 'sys-card-head' }, [
            el('img', { src: c.icon, alt: '', class: 'pixel-img', width: 32, height: 32 }),
            el('h4', {}, pickLang(c.titleEs, c.titleEn))
          ]),
          el('p', {}, pickLang(c.descEs, c.descEn))
        ])
      ))));
    } else if (active.constellations) {
      panelEl.appendChild(el('div', { class: 'constellations-grid' }, active.constellations.map((c) => (
        el('div', { class: 'constellation-card', style: `border-top: 3px solid ${c.color}` }, [
          el('span', { class: 'const-badge', style: `color:${c.color}` }, t('constellationBadge')),
          el('h4', { class: 'const-name' }, pickLang(c.nameEs, c.nameEn)),
          el('p', { class: 'const-desc' }, pickLang(c.descEs, c.descEn))
        ])
      ))));
    } else if (active.isRelicVault) {
      const selected = DATA.relicsShowcase.find((r) => r.id === state.selectedRelicId) || DATA.relicsShowcase[0];
      panelEl.appendChild(el('div', { class: 'relic-detail-card' }, [
        el('div', { class: 'relic-detail-icon-box' }, [
          el('img', { src: selected.icon, alt: pickLang(selected.nameEs, selected.nameEn), class: 'pixel-img', width: 38, height: 38 })
        ]),
        el('div', {}, [
          el('div', { class: 'relic-detail-name' }, pickLang(selected.nameEs, selected.nameEn)),
          el('div', { class: 'relic-detail-meta' }, pickLang(selected.sourceEs, selected.sourceEn)),
          el('div', { class: 'relic-detail-desc' }, pickLang(selected.effectEs, selected.effectEn))
        ])
      ]));

      const grid = el('div', { class: 'relic-chest-grid' });
      DATA.relicsShowcase.forEach((rel) => {
        grid.appendChild(el('button', {
          type: 'button',
          class: 'relic-chest-cell' + (rel.id === selected.id ? ' selected' : ''),
          title: pickLang(rel.nameEs, rel.nameEn),
          onclick: () => {
            state.selectedRelicId = rel.id;
            renderSystems();
          }
        }, [
          el('img', { src: rel.icon, alt: pickLang(rel.nameEs, rel.nameEn), class: 'pixel-img', width: 32, height: 32 })
        ]));
      });
      panelEl.appendChild(grid);

      panelEl.appendChild(el('p', { style: 'margin:10px 0 0;color:#bfd0ea;font-size:16px;' }, `${t('relicVaultCount')} — ${t('relicClickHint')}`));
      const badges = pickLang(active.extraBadgesEs, active.extraBadgesEn);
      panelEl.appendChild(el('div', { class: 'vault-extra-badges' }, badges.map((b) => el('span', { class: 'rpg-tag' }, b))));
    }
  }

  /* ========================================================================
   *  NOTAS DEL PARCHE
   * ======================================================================== */
  function renderPatchNotes() {
    const tabsEl = document.getElementById('patch-version-tabs');
    const contentEl = document.getElementById('patch-notes-content');
    if (!tabsEl || !contentEl) return;

    const versions = [DATA.patchNotes['1.3.0'], DATA.patchNotes['1.2.1']];
    tabsEl.innerHTML = '';
    versions.forEach((ver) => {
      tabsEl.appendChild(el('button', {
        type: 'button',
        role: 'tab',
        'aria-selected': String(state.activePatchVer === ver.id),
        class: 'patch-ver-btn' + (state.activePatchVer === ver.id ? ' active' : ''),
        onclick: () => {
          state.activePatchVer = ver.id;
          renderPatchNotes();
        }
      }, ver.label));
    });

    const active = DATA.patchNotes[state.activePatchVer] || DATA.patchNotes['1.3.0'];
    const sections = pickLang(active.sectionsEs, active.sectionsEn);

    contentEl.innerHTML = '';
    contentEl.appendChild(el('div', { class: 'patch-notes-hero' }, [
      el('div', { class: 'patch-notes-hero-top' }, [
        el('span', { class: 'patch-version-pill' }, active.pill),
        el('span', { class: 'patch-notes-date' }, pickLang(active.subtitleEs, active.subtitleEn))
      ]),
      el('div', { class: 'patch-notes-hero-title' }, pickLang(active.heroTitleEs, active.heroTitleEn)),
      el('div', { class: 'patch-notes-hero-sub' }, pickLang(active.heroSubEs, active.heroSubEn))
    ]));

    const list = el('div', { class: 'patch-notes-list' });
    sections.forEach((sec) => {
      const ul = el('ul', { class: 'patch-notes-bullets' });
      sec.items.forEach((line) => ul.appendChild(el('li', {}, line)));
      list.appendChild(el('article', {
        class: 'patch-notes-card',
        style: `--patch-accent:${sec.color}`
      }, [
        el('div', { class: 'patch-notes-card-head' }, [
          el('img', { src: sec.icon, alt: '', class: 'pixel-img', width: 32, height: 32 }),
          el('div', { class: 'patch-notes-card-titles' }, [
            el('span', { class: 'patch-notes-cat-badge', style: `color:${sec.color};border-color:${sec.color}` }, sec.badge),
            el('strong', { class: 'patch-notes-card-title' }, sec.title)
          ])
        ]),
        ul
      ]));
    });
    contentEl.appendChild(list);
  }

  /* ========================================================================
   *  INSTALACIÓN, REQUISITOS Y PREGUNTAS FRECUENTES
   * ======================================================================== */
  function renderInstallAndFaq() {
    const stepsEl = document.getElementById('install-steps-list');
    if (stepsEl) {
      stepsEl.innerHTML = '';
      (DATA.installSteps[state.lang] || DATA.installSteps.es).forEach((s) => {
        stepsEl.appendChild(el('div', { class: 'install-step' }, [
          el('span', { class: 'install-step-num' }, s.step),
          el('div', {}, [
            el('strong', {}, s.title),
            el('p', {}, s.desc)
          ])
        ]));
      });
    }

    const reqBody = document.getElementById('reqs-tbody');
    if (reqBody) {
      reqBody.innerHTML = '';
      (DATA.requirements[state.lang] || DATA.requirements.es).forEach((r) => {
        reqBody.appendChild(el('tr', {}, [
          el('td', {}, r.label),
          el('td', {}, r.min),
          el('td', {}, r.rec)
        ]));
      });
    }

    const faqList = document.getElementById('faq-list');
    if (faqList) {
      faqList.innerHTML = '';
      (DATA.faqs[state.lang] || DATA.faqs.es).forEach((item, idx) => {
        const ans = el('p', { class: 'faq-answer' + (idx === 0 ? '' : ' hidden') }, item.a);
        const btn = el('button', {
          type: 'button',
          class: 'faq-trigger',
          'aria-expanded': String(idx === 0),
          onclick: () => {
            const open = wrap.classList.toggle('open');
            ans.classList.toggle('hidden', !open);
            btn.setAttribute('aria-expanded', String(open));
          }
        }, [
          el('span', {}, item.q),
          el('span', { class: 'faq-chevron', 'aria-hidden': 'true' }, '▼')
        ]);
        const wrap = el('div', { class: 'hud-slate-card faq-item' + (idx === 0 ? ' open' : '') }, [btn, ans]);
        faqList.appendChild(wrap);
      });
    }
  }

  /* ========================================================================
   *  IDIOMA ES / EN Y MENÚ MÓVIL
   * ======================================================================== */
  function applyLanguage() {
    document.documentElement.lang = state.lang;
    document.title = t('pageTitle');

    const ariaMap = {
      'nav-brand-link': 'ariaBrand',
      'nav-main': 'ariaNav',
      'btn-lang-toggle': 'ariaLang',
      'btn-mobile-menu': 'ariaBurger',
      'rpg-modal-close': 'ariaModalClose'
    };
    Object.entries(ariaMap).forEach(([id, key]) => {
      const node = document.getElementById(id);
      if (node) node.setAttribute('aria-label', t(key));
    });

    document.querySelectorAll('[data-i18n]').forEach((node) => {
      const key = node.getAttribute('data-i18n');
      if (key) node.textContent = t(key);
    });

    const langBtnLabel = document.getElementById('lang-toggle-label');
    if (langBtnLabel) {
      langBtnLabel.textContent = state.lang === 'es' ? 'ES / EN' : 'EN / ES';
    }

    syncConfigUI();
    renderStats();
    renderZoneFilters();
    renderBiomePills();
    renderBiomeInspector();
    drawAtlasMap();
    renderBossSection();
    renderSystems();
    renderPatchNotes();
    renderInstallAndFaq();
  }

  function bindNavAndLang() {
    const langBtn = document.getElementById('btn-lang-toggle');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        state.lang = state.lang === 'es' ? 'en' : 'es';
        try { window.localStorage.setItem('balaclava_web_lang', state.lang); } catch (_) {}
        applyLanguage();
      });
    }

    const burger = document.getElementById('btn-mobile-menu');
    const drawer = document.getElementById('mobile-drawer');
    if (burger && drawer) {
      burger.addEventListener('click', () => {
        const isHidden = drawer.classList.toggle('hidden');
        burger.setAttribute('aria-expanded', String(!isHidden));
      });
      drawer.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          drawer.classList.add('hidden');
          burger.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }

  function init() {
    bindModalEvents();
    bindDownloadTriggers();
    bindAtlasCanvasEvents();
    bindNavAndLang();
    applyLanguage();
    drawStaticBossPortrait();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
