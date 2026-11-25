(function () {
  'use strict';

  const cfg = Object.assign({
    downloadUrl: '#pon-tu-link-de-descarga-aqui',
    mirrorUrl: '',
    version: 'Beta 2.0.0 RC2',
    versionLabel: 'Beta 2.0.0 RC2',
    fileName: 'Abyssea_2.0.0-rc2_x64-setup.exe',
    fileSizeEs: 'Por definir (~140 MB)',
    fileSizeEn: 'TBD (~140 MB)',
    releaseDateEs: 'Noviembre 2026',
    releaseDateEn: 'November 2026',
    platformLabel: 'Windows 10 / 11 (64-bit · Tauri 2)',
    githubRepo: 'LalleL/balaclava-web',
    webPlayersCounterUrl: '',
    discordUrl: 'https://discord.gg/8wrsjRSMY2',
    kofiUrl: 'https://ko-fi.com/balaclava'
  }, window.BALACLAVA_SITE_CONFIG || {});

  const DATA = window.BALACLAVA_DATA;
  const state = {
    lang: (function () {
      try {
        const saved = window.localStorage.getItem('balaclava_web_lang_v2');
        return saved === 'es' ? 'es' : 'en';
      } catch (_) {
        return 'en';
      }
    })(),
    activeZone: 'all',
    selectedBiomeId: 'pradera',
    hoverGrid: null,
    activeSysTab: 'combat',
    selectedRelicId: DATA.relicsShowcase[0].id,
    activePatchVer: '2.0.0-rc2',
    downloadCount: 15,
    webPlayerCount: null
  };

  const t = (key, fallback = null) => {
    const val = DATA.i18n && DATA.i18n[state.lang] && DATA.i18n[state.lang][key];
    if (val) return val;
    const alt = DATA.i18n && (DATA.i18n.es[key] || DATA.i18n.en[key]);
    if (alt) return alt;
    return fallback !== null ? fallback : key;
  };
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

    document.querySelectorAll('.js-version-text').forEach((n) => { n.textContent = ver; });
    document.querySelectorAll('.js-version-badge').forEach((n) => { n.textContent = ver.toUpperCase(); });
    document.querySelectorAll('.js-filesize-text').forEach((n) => { n.textContent = fileSize; });
    document.querySelectorAll('.js-releasedate-text').forEach((n) => { n.textContent = releaseDate; });
    document.querySelectorAll('.js-platform-text').forEach((n) => { n.textContent = cfg.platformLabel; });
    document.querySelectorAll('.js-filename-text').forEach((n) => { n.textContent = cfg.fileName; });

    document.querySelectorAll('.js-discord-link').forEach((a) => {
      a.setAttribute('href', cfg.discordUrl || 'https://discord.gg/8wrsjRSMY2');
    });

    document.querySelectorAll('.js-kofi-link').forEach((a) => {
      a.setAttribute('href', cfg.kofiUrl || 'https://ko-fi.com/balaclava');
    });

    const isPlaceholder = isPlaceholderUrl(cfg.downloadUrl);
    document.querySelectorAll('.js-download-trigger').forEach((btn) => {
      if (isPlaceholder) {
        btn.setAttribute('href', '#descargar');
        btn.removeAttribute('target');
        btn.removeAttribute('rel');
      } else {
        const isDirectFile = /\.(exe|msi|zip|7z|rar|tar\.gz)(\?|#|$)/i.test(cfg.downloadUrl);
        btn.setAttribute('href', cfg.downloadUrl);
        if (isDirectFile) {
          btn.setAttribute('download', cfg.fileName || '');
          btn.removeAttribute('target');
          btn.removeAttribute('rel');
        } else {
          btn.removeAttribute('download');
          btn.setAttribute('target', '_blank');
          btn.setAttribute('rel', 'noopener noreferrer');
        }
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

    syncMaintenanceMode();
  }

  function syncMaintenanceMode() {
    const active = Boolean(cfg.maintenanceMode);
    const overlay = document.getElementById('maintenance-overlay');
    const titleEl = document.getElementById('maintenance-title');
    const descEl = document.getElementById('maintenance-desc');

    if (active) {
      document.body.classList.add('maintenance-active');
      if (titleEl) {
        titleEl.textContent = pickLang(
          cfg.maintenanceTitleEs || 'Actualización en Curso',
          cfg.maintenanceTitleEn || 'Update in Progress'
        );
      }
      if (descEl) {
        descEl.textContent = pickLang(
          cfg.maintenanceMsgEs || 'Estamos subiendo una nueva actualización. Vuelve en unos minutos.',
          cfg.maintenanceMsgEn || 'We are currently uploading a new update. Please check back in a few minutes!'
        );
      }
      document.querySelectorAll('.js-download-trigger, #hero-play-web-btn').forEach((btn) => {
        btn.setAttribute('href', '#maintenance');
        btn.removeAttribute('download');
      });
      if (overlay) overlay.classList.remove('hidden');
    } else {
      document.body.classList.remove('maintenance-active');
      if (overlay) overlay.classList.add('hidden');
    }
  }

  const DL_CACHE_KEY = 'balaclava_dl_count_v2';
  const DL_CLICK_KEY = 'balaclava_dl_clicked_v2';
  const DL_CACHE_TTL_MS = 120 * 1000;
  const DL_STALE_MAX_MS = 24 * 60 * 60 * 1000;

  function resolveGithubRepo() {
    if (cfg.githubRepo && /^[^/\s]+\/[^/\s]+$/.test(String(cfg.githubRepo).trim())) {
      return String(cfg.githubRepo).trim();
    }
    const m = String(cfg.downloadUrl || '').match(/^https?:\/\/github\.com\/([^/]+\/[^/]+)\/releases\//i);
    return m ? m[1] : '';
  }

  function readDownloadCache() {
    try {
      const raw = window.localStorage.getItem(DL_CACHE_KEY);
      const baseOffset = (cfg && typeof cfg.downloadBaseOffset === 'number') ? cfg.downloadBaseOffset : 15;
      if (!raw) return { count: baseOffset, ts: 0, optimisticUntil: 0 };
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed.count !== 'number' || !Number.isFinite(parsed.count)) return { count: baseOffset, ts: 0, optimisticUntil: 0 };
      if (parsed.count < baseOffset) parsed.count = baseOffset;
      return parsed;
    } catch (_) {
      return null;
    }
  }

  function writeDownloadCache(count, optimisticUntil) {
    try {
      window.localStorage.setItem(DL_CACHE_KEY, JSON.stringify({
        count,
        ts: Date.now(),
        optimisticUntil: optimisticUntil || 0
      }));
    } catch (_) {}
  }

  function renderDownloadCount() {
    const wraps = document.querySelectorAll('.js-dl-counter-wrap');
    const texts = document.querySelectorAll('.js-dl-counter-text');
    const count = state.downloadCount;
    if (typeof count !== 'number' || !Number.isFinite(count) || count < 0) {
      wraps.forEach((w) => w.classList.add('hidden'));
      return;
    }
    const locale = state.lang === 'en' ? 'en-US' : 'es-ES';
    const numStr = new Intl.NumberFormat(locale).format(count);
    const unit = state.lang === 'en'
      ? (count === 1 ? 'download' : 'downloads')
      : (count === 1 ? 'descarga' : 'descargas');
    const label = `${numStr} ${unit}`;
    texts.forEach((n) => { n.textContent = label; });
    wraps.forEach((w) => w.classList.remove('hidden'));
  }

  async function loadDownloadCount() {
    const repo = resolveGithubRepo();
    if (!repo || typeof window.fetch !== 'function') return;

    const cached = readDownloadCache();
    const now = Date.now();
    if (cached && (now - (cached.ts || 0)) < DL_STALE_MAX_MS) {
      state.downloadCount = cached.count;
      renderDownloadCount();
      if ((now - (cached.ts || 0)) < DL_CACHE_TTL_MS) return;
    }

    try {
      const res = await window.fetch(`https://api.github.com/repos/${repo}/releases`, {
        headers: { Accept: 'application/vnd.github+json' }
      });
      if (!res.ok) return;
      const releases = await res.json();
      if (!Array.isArray(releases)) return;

      const total = releases.reduce((acc, rel) => {
        const assets = Array.isArray(rel && rel.assets) ? rel.assets : [];
        return acc + assets.reduce((sum, asset) => sum + (Number(asset && asset.download_count) || 0), 0);
      }, 0);

      const baseOffset = (cfg && typeof cfg.downloadBaseOffset === 'number') ? cfg.downloadBaseOffset : 15;
      const combinedTotal = total + baseOffset;
      const optimisticValid = cached && cached.optimisticUntil && Date.now() < cached.optimisticUntil;
      const nextCount = optimisticValid ? Math.max(combinedTotal, cached.count) : combinedTotal;
      state.downloadCount = nextCount;
      writeDownloadCache(nextCount, optimisticValid ? cached.optimisticUntil : 0);
      renderDownloadCount();
    } catch (_) {}
  }

  function renderWebPlayerCount() {
    const wraps = document.querySelectorAll('.js-web-counter-wrap');
    const texts = document.querySelectorAll('.js-web-counter-text');
    const count = state.webPlayerCount;
    if (typeof count !== 'number' || !Number.isFinite(count) || count < 0) {
      wraps.forEach((w) => w.classList.add('hidden'));
      return;
    }
    const locale = state.lang === 'en' ? 'en-US' : 'es-ES';
    const numStr = new Intl.NumberFormat(locale).format(count);
    const unit = state.lang === 'en'
      ? (count === 1 ? 'browser player' : 'browser players')
      : (count === 1 ? 'jugador web' : 'jugadores web');
    const label = `${numStr} ${unit}`;
    texts.forEach((n) => { n.textContent = label; });
    wraps.forEach((w) => w.classList.remove('hidden'));
  }

  async function loadWebPlayerCount() {
    const baseUrl = String(cfg.webPlayersCounterUrl || '').trim().replace(/\/+$/, '');
    if (!baseUrl || typeof window.fetch !== 'function') return;
    try {
      const res = await window.fetch(`${baseUrl}/`);
      if (!res.ok) return;
      const data = await res.json();
      const count = Number(data && data.uniquePlayers);
      if (Number.isFinite(count) && count >= 0) {
        state.webPlayerCount = count;
        renderWebPlayerCount();
      }
    } catch (_) {}
  }

  function recordLocalDownloadClick() {
    try {
      if (window.sessionStorage.getItem(DL_CLICK_KEY)) return;
      window.sessionStorage.setItem(DL_CLICK_KEY, '1');
    } catch (_) {}
    if (typeof state.downloadCount === 'number' && Number.isFinite(state.downloadCount)) {
      state.downloadCount += 1;
      writeDownloadCache(state.downloadCount, Date.now() + DL_CACHE_TTL_MS);
      renderDownloadCount();
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
          return;
        }
        recordLocalDownloadClick();
      });
    });
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

  // Cache de texturas reales 192x192 (3x3 bloques de 64px) idéntico a assets.js
  const biomeTileCache = {};
  const atlasExtraImgs = {};
  let atlasTilesReady = false;

  function makeBiomeSheet(srcImg, sx, sy, sw, sh, overlayColor) {
    if (!srcImg || !srcImg.complete || srcImg.naturalWidth <= 0) return null;
    const c = document.createElement('canvas');
    c.width = sw;
    c.height = sh;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(srcImg, sx, sy, sw, sh, 0, 0, sw, sh);
    if (overlayColor) {
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = overlayColor;
      ctx.fillRect(0, 0, sw, sh);
      ctx.globalCompositeOperation = 'source-over';
    }
    return c;
  }

  function loadAtlasTextures() {
    const sources = {
      tile_1: 'assets/tiles/Tilemap_color1.png',
      tile_2: 'assets/tiles/Tilemap_color2.png',
      tile_5: 'assets/tiles/Tilemap_color5.png',
      tile_flat: 'assets/tiles/Tilemap_Flat.png',
      compass: 'assets/ui/rpg_compass.png',
      core: 'assets/icons/abyssea_core.png',
      archipielago_coral: 'assets/sprites_v13/biomes/archipielago_coral.png',
      selva_esmeralda: 'assets/sprites_v13/biomes/selva_esmeralda.png',
      cavernas_cristal: 'assets/sprites_v13/biomes/cavernas_cristal.png',
      caldera_ceniza: 'assets/sprites_v13/biomes/caldera_ceniza.png',
      cienaga_putrida: 'assets/sprites_v13/biomes/cienaga_putrida.png',
      dinastia_arena: 'assets/sprites_v13/biomes/dinastia_arena.png',
      glaciar_profundo: 'assets/sprites_v13/biomes/glaciar_profundo.png',
      necropolis_osea: 'assets/sprites_v13/biomes/necropolis_osea.png',
      tierras_malditas: 'assets/sprites_v13/biomes/tierras_malditas.png'
    };

    const imgs = {};
    let pending = Object.keys(sources).length;
    const onOneDone = () => {
      pending -= 1;
      if (pending > 0) return;
      biomeTileCache.pradera = makeBiomeSheet(imgs.tile_1, 0, 0, 192, 192, null);
      biomeTileCache.desierto = makeBiomeSheet(imgs.tile_flat, 320, 0, 192, 192, null);
      biomeTileCache.bosque_oscuro = makeBiomeSheet(imgs.tile_5 || imgs.tile_1, 0, 0, 192, 192, 'rgba(38, 24, 72, 0.36)');
      biomeTileCache.montanas_heladas = makeBiomeSheet(imgs.tile_5 || imgs.tile_1, 0, 0, 192, 192, 'rgba(218, 245, 255, 0.65)');
      biomeTileCache.tierras_volcanicas = makeBiomeSheet(imgs.tile_2 || imgs.tile_1, 0, 0, 192, 192, 'rgba(42, 18, 22, 0.66)');

      [
        'archipielago_coral', 'selva_esmeralda', 'cavernas_cristal', 'caldera_ceniza',
        'cienaga_putrida', 'dinastia_arena', 'glaciar_profundo', 'necropolis_osea', 'tierras_malditas'
      ].forEach((bId) => {
        biomeTileCache[bId] = makeBiomeSheet(imgs[bId], 0, 0, 192, 192, null);
      });

      atlasExtraImgs.compass = imgs.compass;
      atlasExtraImgs.core = imgs.core;
      atlasTilesReady = true;
      drawAtlasMap();
      renderBiomeInspector();
    };

    Object.entries(sources).forEach(([k, src]) => {
      const im = new Image();
      im.onload = onOneDone;
      im.onerror = onOneDone;
      im.src = src;
      imgs[k] = im;
    });
  }

  // Máscara orgánica determinista 7x7 por cada isla (imita el trazado de world.js)
  const SUB = 7;
  const islandMasks = [];
  for (let gy = 0; gy < 19; gy++) {
    const row = [];
    for (let gx = 0; gx < 19; gx++) {
      const isCenter = gx === 9 && gy === 9;
      const rot = hash2D(gx + 3, gy + 7, 901) * Math.PI * 2;
      const stretchX = 0.86 + hash2D(gx + 5, gy + 11, 942) * 0.28;
      const stretchY = 0.86 + hash2D(gx + 17, gy + 23, 968) * 0.28;
      const mask = Array.from({ length: SUB }, () => new Uint8Array(SUB));
      for (let ly = 0; ly < SUB; ly++) {
        for (let lx = 0; lx < SUB; lx++) {
          if (isCenter) {
            mask[ly][lx] = (lx >= 1 && lx <= 5 && ly >= 1 && ly <= 5) ? 1 : 0;
            continue;
          }
          const dx = (lx - 3) / stretchX;
          const dy = (ly - 3) / stretchY;
          const ang = Math.atan2(dy, dx);
          const n = (hash2D(gx * SUB + lx, gy * SUB + ly, 777) - 0.5) * 0.85;
          const lobe = 2.35 + 0.36 * Math.sin(ang * 2 + rot) + 0.24 * Math.cos(ang * 3 - rot) + n;
          const edge = lx === 0 || ly === 0 || lx === SUB - 1 || ly === SUB - 1;
          mask[ly][lx] = (!edge && Math.hypot(dx, dy) <= lobe) || (lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4) ? 1 : 0;
        }
      }
      row.push(mask);
    }
    islandMasks.push(row);
  }

  function drawAtlasMap() {
    const canvas = document.getElementById('atlas-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 532; // 19 plots * 28px (SUB=7 * 4px)
    const cell = 28;
    const tilePx = 4;

    ctx.imageSmoothingEnabled = false;
    const oceanGrad = ctx.createRadialGradient(size * 0.48, size * 0.46, 30, size * 0.5, size * 0.5, size * 0.72);
    oceanGrad.addColorStop(0, '#19577a');
    oceanGrad.addColorStop(0.58, '#103b57');
    oceanGrad.addColorStop(1, '#081b2c');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, size, size);

    for (let gy = 0; gy < 19; gy++) {
      for (let gx = 0; gx < 19; gx++) {
        const bId = atlasGrid[gy][gx];
        const b = biomeById[bId];
        if (!b) continue;
        const zoneMatch = state.activeZone === 'all' || String(b.zone) === state.activeZone;
        const isSelected = bId === state.selectedBiomeId;
        const px0 = gx * cell;
        const py0 = gy * cell;
        const mask = islandMasks[gy][gx];
        const sheet = atlasTilesReady ? biomeTileCache[bId] : null;

        const isLand = (lx, ly) => lx >= 0 && ly >= 0 && lx < SUB && ly < SUB && mask[ly][lx] === 1;

        ctx.save();
        ctx.globalAlpha = zoneMatch ? (isSelected ? 1.0 : 0.86) : 0.24;

        for (let ly = 0; ly < SUB; ly++) {
          for (let lx = 0; lx < SUB; lx++) {
            const rx = px0 + lx * tilePx;
            const ry = py0 + ly * tilePx;

            if (!isLand(lx, ly)) {
              const nearLand = isLand(lx, ly - 1) || isLand(lx, ly + 1) || isLand(lx - 1, ly) || isLand(lx + 1, ly);
              if (nearLand) {
                ctx.fillStyle = 'rgba(135, 218, 240, 0.22)';
                ctx.fillRect(rx, ry, tilePx, tilePx);
                if (isLand(lx, ly - 1)) {
                  ctx.fillStyle = 'rgba(220, 246, 255, 0.45)';
                  ctx.fillRect(rx, ry, tilePx, 1);
                }
              }
              continue;
            }

            const up = isLand(lx, ly - 1);
            const dn = isLand(lx, ly + 1);
            const lt = isLand(lx - 1, ly);
            const rt = isLand(lx + 1, ly);

            if (!dn) {
              ctx.fillStyle = '#1c1828';
              ctx.fillRect(rx, ry + tilePx - 1, tilePx, 2);
            }

            if (sheet) {
              const sx = !lt ? 0 : !rt ? 128 : 64;
              const sy = !up ? 0 : !dn ? 128 : 64;
              ctx.drawImage(sheet, sx, sy, 64, 64, rx, ry, tilePx, tilePx);
            } else {
              ctx.fillStyle = b.color;
              ctx.fillRect(rx, ry, tilePx, tilePx);
            }
          }
        }

        if (isSelected && zoneMatch) {
          ctx.globalAlpha = 0.85;
          ctx.strokeStyle = '#ffd54f';
          ctx.lineWidth = 1;
          ctx.strokeRect(px0 + 1.5, py0 + 1.5, cell - 3, cell - 3);
        }

        // Marcador del núcleo inicial (9,9) y Ciudadela Carmesí (0,9)
        if (gx === 9 && gy === 9) {
          ctx.globalAlpha = 1;
          if (atlasExtraImgs.core && atlasExtraImgs.core.complete) {
            ctx.drawImage(atlasExtraImgs.core, px0 + 7, py0 + 7, 14, 14);
          } else {
            ctx.fillStyle = '#ffd54f';
            ctx.fillRect(px0 + 11, py0 + 11, 6, 6);
          }
        }
        if (gx === 0 && gy === 9) {
          ctx.globalAlpha = 1;
          ctx.fillStyle = '#ff1744';
          ctx.fillRect(px0 + 10, py0 + 10, 8, 8);
          ctx.strokeStyle = '#ffd54f';
          ctx.lineWidth = 1;
          ctx.strokeRect(px0 + 9.5, py0 + 9.5, 9, 9);
        }
        ctx.restore();
      }
    }

    if (atlasExtraImgs.compass && atlasExtraImgs.compass.complete && atlasExtraImgs.compass.naturalWidth > 0) {
      ctx.drawImage(atlasExtraImgs.compass, size - 52, size - 52, 44, 44);
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
        el('img', { src: b.icon, alt: '', class: 'pixel-img biome-pill-icon', width: 20, height: 20 }),
        el('span', {}, pickLang(b.nameEs, b.nameEn)),
        el('span', { class: 'biome-pill-count' }, `${b.islands}`)
      ]);
      grid.appendChild(btn);
    });
  }

  function buildBiomeSwatchCanvas(biomeId) {
    const sheet = biomeTileCache[biomeId];
    if (!sheet) return null;
    const c = document.createElement('canvas');
    c.width = 54;
    c.height = 54;
    c.className = 'pixel-img inspector-swatch';
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sheet, 0, 0, 192, 192, 0, 0, 54, 54);
    return c;
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

    const stripItems = [];
    if (b.gate) {
      stripItems.push(el('img', { src: b.gate, alt: 'Portal', class: 'pixel-img', width: 48, height: 48 }));
    }
    const swatchCanvas = buildBiomeSwatchCanvas(b.id);
    if (swatchCanvas) {
      stripItems.push(swatchCanvas);
    } else if (b.swatch) {
      stripItems.push(el('img', { src: b.swatch, alt: 'Terreno', class: 'pixel-img inspector-swatch' }));
    }
    stripItems.push(el('div', {}, [
      el('strong', { class: 'mech-title' }, pickLang('Portal y Terreno del Bioma', 'Biome Gate & Terrain')),
      el('span', { class: 'mech-sub' }, pickLang('Texturas reales extraídas del juego.', 'Real terrain tiles extracted from the game.'))
    ]));
    box.appendChild(el('div', { class: 'inspector-preview-strip' }, stripItems));

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

    const versions = [DATA.patchNotes['2.0.0-rc2'], DATA.patchNotes['1.3.3'], DATA.patchNotes['1.3.2'], DATA.patchNotes['1.3.1'], DATA.patchNotes['1.3.0'], DATA.patchNotes['1.2.1']].filter(Boolean);
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

    const active = DATA.patchNotes[state.activePatchVer] || DATA.patchNotes['2.0.0-rc2'] || DATA.patchNotes['1.3.3'];
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
      if (key) {
        const val = t(key, null);
        if (val) node.textContent = val;
      }
    });

    const langBtnLabel = document.getElementById('lang-toggle-label');
    if (langBtnLabel) {
      langBtnLabel.textContent = state.lang === 'es' ? 'ES / EN' : 'EN / ES';
    }

    syncConfigUI();
    renderDownloadCount();
    renderWebPlayerCount();
    renderStats();
    renderZoneFilters();
    renderBiomePills();
    renderBiomeInspector();
    drawAtlasMap();
    renderSystems();
    renderPatchNotes();
    renderInstallAndFaq();
  }

  function bindNavAndLang() {
    const langBtn = document.getElementById('btn-lang-toggle');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        state.lang = state.lang === 'es' ? 'en' : 'es';
        try { window.localStorage.setItem('balaclava_web_lang_v2', state.lang); } catch (_) {}
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
    loadAtlasTextures();
    applyLanguage();
    loadDownloadCount();
    loadWebPlayerCount();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
