(function () {
  'use strict';

  const Abyssea = (window.Abyssea = window.Abyssea || {});
  const { BIOMES, RARITIES, GRID_PLOTS, PLOT_TILES, TILE_SIZE, CENTER_PLOT, WORLD_TILES } = Abyssea.CONST;
  const { formatNum } = Abyssea.Utils;
  const tr = (k, vars) => (Abyssea.I18n ? Abyssea.I18n.t(k, vars) : k);

  const UI_SCALES = [0.75, 0.85, 0.88, 1, 1.25, 1.5];
  const UI_SCALE_STORAGE_KEY = 'abyssea_ui_scale';
  const DISCORD_URL = 'https://discord.gg/8wrsjRSMY2';

  function getStationDesc(id) {
    const kTitle = `station.${id}.title`;
    const kText = `station.${id}.text`;
    const title = tr(kTitle);
    const text = tr(kText);
    if (title === kTitle && text === kText) return null;
    return { title, text };
  }

  const KEYBIND_STORAGE_KEY = 'abyssea_keybinds_v2';
  const DEFAULT_KEYBINDS = {
    moveUp: 'KeyW',
    moveDown: 'KeyS',
    moveLeft: 'KeyA',
    moveRight: 'KeyD',
    dash: 'Space',
    interact: 'KeyE',
    menu: 'KeyF',
    inventory: 'KeyQ',
    crafting: 'KeyC',
    build: 'KeyR',
    skills: 'KeyG',
    map: 'KeyM',
    market: 'KeyV',
    quests: 'KeyX',
    encyclopedia: 'KeyL',
    pause: 'KeyO',
    spell1: 'KeyZ',
    spell2: 'KeyT',
    spell3: 'KeyB',
    spell4: 'KeyN'
  };
  const KEYBIND_DEFS = [
    { id: 'moveUp', key: 'key.moveUp' },
    { id: 'moveDown', key: 'key.moveDown' },
    { id: 'moveLeft', key: 'key.moveLeft' },
    { id: 'moveRight', key: 'key.moveRight' },
    { id: 'dash', key: 'key.dash' },
    { id: 'interact', key: 'key.interact' },
    { id: 'menu', key: 'key.menu' },
    { id: 'inventory', key: 'key.inventory' },
    { id: 'crafting', key: 'key.crafting' },
    { id: 'build', key: 'key.build' },
    { id: 'skills', key: 'key.skills' },
    { id: 'map', key: 'key.map' },
    { id: 'market', key: 'key.market' },
    { id: 'quests', key: 'key.quests' },
    { id: 'encyclopedia', key: 'key.encyclopedia' },
    { id: 'pause', key: 'key.pause' },
    { id: 'spell1', key: 'key.spell1' },
    { id: 'spell2', key: 'key.spell2' },
    { id: 'spell3', key: 'key.spell3' },
    { id: 'spell4', key: 'key.spell4' }
  ];

  function loadStoredKeybinds() {
    try {
      const raw = localStorage.getItem(KEYBIND_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return Object.assign({}, DEFAULT_KEYBINDS, parsed);
        }
      }
    } catch (_) {}
    return Object.assign({}, DEFAULT_KEYBINDS);
  }

  class UIController {
    constructor() {
      this.game = null;
      if (this._mapCleanup) { this._mapCleanup(); this._mapCleanup = null; }
      this.activeModal = null;
      this.modalData = null;
      this.invFilter = 'todos';
      this.selectedItemId = null;
      this.craftFilter = 'todas';
      this.buildFilter = 'produccion';
      this.questFilter = 'historia';
      this.questCatFilter = 'todas';
      this.encycFilter = 'items';
      this.invSearch = '';
      this.craftSearch = '';
      this.buildSearch = '';
      this.encycSearch = '';
      this.showDungeonAtlas = false;
      this.selectedSkillId = 'rec_1';
      this.selectedMapPlot = [CENTER_PLOT || 4, CENTER_PLOT || 4];
      this.lastHudTick = 0;
      this.skillZoom = 0.72;
      this.skillPanX = null;
      this.skillPanY = null;
      this.enchantTarget = { kind: 'tool', id: 'pico' };
      this._visibleHotbarIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      this.titleSlotPickerOpen = false;
      this.confirmDeleteSlot = null;
      this.keybinds = loadStoredKeybinds();
      this.rebindingAction = null;
      this.pauseView = 'root';
      this.settingsTab = 'sonido';
      this.menuOpen = false;
      this._lastResKey = '';
      this._lastHotbarKey = '';
      this._lastBuffKey = '';
      this._toastNodes = new Map();
      this._pickupNodes = new Map();
      this.controlsHelperVisible = false;
      this.controlsHelperCause = null;
      this.lastPlayerInputTime = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
      this._controlsHelperTimer = null;
      this._controlsHelperEl = null;
      this._lastMouseClientX = 0;
      this._lastMouseClientY = 0;
      this._cmdOpen = false;
      this._cmdEl = null;
      this._cmdLogEl = null;
      this._cmdInputEl = null;
      this._cmdHistory = [];
      this._cmdHistIdx = -1;
      this._cmdTapTimes = [];
      this._cmdLogs = [];
    }

    formatKeyCode(code) {
      if (!code) return '---';
      if (code.startsWith('Key')) return code.slice(3);
      if (code.startsWith('Digit')) return code.slice(5);
      const map = {
        Space: tr('key.space'),
        ShiftLeft: tr('key.shiftLeft'),
        ShiftRight: tr('key.shiftRight'),
        ControlLeft: tr('key.ctrlLeft'),
        ControlRight: tr('key.ctrlRight'),
        AltLeft: tr('key.altLeft'),
        ArrowUp: tr('key.arrowUp'),
        ArrowDown: tr('key.arrowDown'),
        ArrowLeft: tr('key.arrowLeft'),
        ArrowRight: tr('key.arrowRight'),
        Enter: 'Enter',
        Tab: 'Tab',
        Backspace: tr('key.backspace')
      };
      return map[code] || code;
    }

    getKeyLabel(actionId) {
      return this.formatKeyCode((this.keybinds && this.keybinds[actionId]) || DEFAULT_KEYBINDS[actionId]);
    }

    setKeybind(actionId, code) {
      if (!DEFAULT_KEYBINDS[actionId] || !code) return;
      this.keybinds[actionId] = code;
      try { localStorage.setItem(KEYBIND_STORAGE_KEY, JSON.stringify(this.keybinds)); } catch (_) {}
      this.rebindingAction = null;
    }

    resetKeybinds() {
      this.keybinds = Object.assign({}, DEFAULT_KEYBINDS);
      this.rebindingAction = null;
      try { localStorage.setItem(KEYBIND_STORAGE_KEY, JSON.stringify(this.keybinds)); } catch (_) {}
      if (this.game) this.game.toast(tr('settings.controlsResetToast'), 'info');
      this.updateControlsHelperLabels();
    }

    getControlsHelperEl() {
      if (!this._controlsHelperEl && typeof document !== 'undefined') {
        this._controlsHelperEl = document.getElementById('hud-controls-helper');
      }
      return this._controlsHelperEl;
    }

    updateControlsHelperLabels() {
      const el = this.getControlsHelperEl();
      if (!el) return;
      const moveKey = document.getElementById('ctrl-move-key');
      const dashKey = document.getElementById('ctrl-dash-key');
      const interactKey = document.getElementById('ctrl-interact-key');
      const zoomKey = document.getElementById('ctrl-zoom-key');
      if (moveKey) {
        const up = this.getKeyLabel('moveUp');
        const lt = this.getKeyLabel('moveLeft');
        const dn = this.getKeyLabel('moveDown');
        const rt = this.getKeyLabel('moveRight');
        moveKey.textContent = `${up}${lt}${dn}${rt}`;
      }
      if (dashKey) dashKey.textContent = this.getKeyLabel('dash');
      if (interactKey) interactKey.textContent = this.getKeyLabel('interact');
      if (zoomKey && Abyssea.I18n) {
        zoomKey.textContent = Abyssea.I18n.t('controls.keyWheel');
      }
      if (Abyssea.I18n && typeof Abyssea.I18n.translateDOM === 'function') {
        Abyssea.I18n.translateDOM(el);
      }
    }

    showControlsHelper(cause = 'entry', autoHideMs = 2800) {
      const el = this.getControlsHelperEl();
      if (!el) return;
      const g = this.game;
      if (!g || !g.started || (g.isPlayerDead && g.isPlayerDead())) return;

      this.updateControlsHelperLabels();

      if (this._controlsHelperTimer) {
        clearTimeout(this._controlsHelperTimer);
        this._controlsHelperTimer = null;
      }

      this.controlsHelperVisible = true;
      this.controlsHelperCause = cause;
      el.classList.remove('hud-controls-hidden');

      if (autoHideMs && autoHideMs > 0) {
        this._controlsHelperTimer = setTimeout(() => {
          this.hideControlsHelper();
        }, autoHideMs);
      }
    }

    hideControlsHelper(immediate = false) {
      const el = this.getControlsHelperEl();
      if (this._controlsHelperTimer) {
        clearTimeout(this._controlsHelperTimer);
        this._controlsHelperTimer = null;
      }
      this.controlsHelperVisible = false;
      this.controlsHelperCause = null;
      if (el) {
        if (immediate) {
          el.style.transition = 'none';
          el.classList.add('hud-controls-hidden');
          requestAnimationFrame(() => {
            el.style.transition = '';
          });
        } else {
          el.classList.add('hud-controls-hidden');
        }
      }
    }

    recordPlayerActivity() {
      const now = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
      const wasAfk = this.controlsHelperCause === 'afk' && this.controlsHelperVisible;
      this.lastPlayerInputTime = now;

      if (wasAfk) {
        // Player returned from AFK! "se quite cuando vuelvas a los dos segundos o 3"
        this.controlsHelperCause = 'returning';
        if (this._controlsHelperTimer) clearTimeout(this._controlsHelperTimer);
        this._controlsHelperTimer = setTimeout(() => {
          this.hideControlsHelper();
        }, 2500); // 2.5 seconds
      }
    }

    checkControlsHelperAFK(dt) {
      const g = this.game;
      if (!g || !g.started || g.paused || this.hasOpenModal() || (g.isPlayerDead && g.isPlayerDead())) {
        this.lastPlayerInputTime = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
        if (this.controlsHelperVisible && this.controlsHelperCause === 'afk') {
          this.hideControlsHelper(true);
        }
        return;
      }

      // Check if player is holding movement or action
      const kb = this.keybinds || DEFAULT_KEYBINDS;
      if (g.keys && (g.keys[kb.moveUp] || g.keys[kb.moveDown] || g.keys[kb.moveLeft] || g.keys[kb.moveRight] ||
          g.keys['ArrowUp'] || g.keys['ArrowDown'] || g.keys['ArrowLeft'] || g.keys['ArrowRight'] ||
          (g.mouse && g.mouse.down))) {
        this.recordPlayerActivity();
        return;
      }

      const now = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
      if (!this.lastPlayerInputTime) this.lastPlayerInputTime = now;
      const idleSec = now - this.lastPlayerInputTime;

      // When AFK for 10 seconds, smoothly animate in
      if (idleSec >= 10.0) {
        if (!this.controlsHelperVisible) {
          this.showControlsHelper('afk', null); // stays until player returns
        }
      }
    }

    init(game) {
      this.game = game;
      this.initUiScale();
      this.bindGlobalInputs();
      this.renderTitleScreen();
    }

    toggleMenuDropdown(force) {
      const dead = Boolean(this.game && this.game.isPlayerDead && this.game.isPlayerDead());
      const next = dead ? false : (typeof force === 'boolean' ? force : !this.menuOpen);
      this.menuOpen = next;
      const dd = document.getElementById('menu-dropdown');
      const btn = document.getElementById('btn-menu-toggle');
      if (dd) dd.classList.toggle('hidden', !next);
      if (btn) btn.classList.toggle('open', next);
    }

    closeMenuDropdown() {
      this.toggleMenuDropdown(false);
    }

    hasOpenModal() {
      return this.activeModal !== null;
    }

    itemIcon(iconType, size = 28) {
      return Abyssea.Assets.createItemIconEl(iconType, size);
    }

    biomeIcon(biomeId, size = 26) {
      const pngMap = Abyssea.ITEM_PNG_MAP || {};
      const urlMap = {
        pradera: pngMap.malaquita_pradera || Abyssea.UI_URLS.biomePradera,
        desierto: pngMap.ambar_desierto || Abyssea.UI_URLS.biomeDesierto,
        bosque_oscuro: pngMap.cristal_abismal || Abyssea.UI_URLS.biomeBosque,
        montanas_heladas: pngMap.azurita_glacial || Abyssea.UI_URLS.biomeHielo,
        tierras_volcanicas: pngMap.esencia_magma || Abyssea.UI_URLS.biomeVolcan,
        archipielago_coral: pngMap.perla_turquesa,
        cavernas_cristal: pngMap.celestita_cristal,
        selva_esmeralda: pngMap.jade_ancestral,
        caldera_ceniza: pngMap.escoria_caldera,
        dinastia_arena: pngMap.agata_roja,
        glaciar_profundo: pngMap.hielo_eterno,
        cienaga_putrida: pngMap.flor_pantano,
        necropolis_osea: pngMap.hueso_fosil,
        tierras_malditas: pngMap.cristal_carmesi
      };
      const url = urlMap[biomeId] || Abyssea.UI_URLS.biomePradera;
      if (url) {
        return this.el('img', {
          class: 'pixel-img',
          src: encodeURI(url),
          width: size,
          height: size,
          alt: biomeId || 'bioma',
          style: `width:${size}px;height:${size}px;flex-shrink:0;border-radius:4px;border:1.5px solid #2b1a10;`
        });
      }
      const bDef = BIOMES[biomeId] || {};
      return this.el('span', { style: `width:${size}px;height:${size}px;border-radius:4px;border:2px solid #2b1a10;background:${bDef.color || '#6d4c41'};display:inline-block;flex-shrink:0;` });
    }

    toolIcon(toolId, tierId = 'basica', size = 28) {
      return Abyssea.Assets.createToolIconEl(toolId, tierId, size);
    }

    skillIcon(skillId, size = 28) {
      return Abyssea.Assets.createSkillIconEl(skillId, size);
    }

    npcPortrait(npcId, size = 56) {
      return Abyssea.Assets.createNpcPortraitEl(npcId, size);
    }

    makeBuildingThumb(bDef, size = 44) {
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      c.className = 'pixel-img';
      c.style.width = size + 'px';
      c.style.height = size + 'px';
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      const assets = Abyssea.Assets;

      if (bDef.sprite === 'Campfire_Anim') {
        const img = (assets.extraImages && (assets.extraImages.Campfire_Anim || assets.extraImages.campfireAnim)) || null;
        if (img && img.complete && img.width > 0) {
          const fw = img.width >= img.height * 3 ? (Math.round(img.width / 6) || img.height) : 16;
          ctx.drawImage(img, 0, 0, fw, img.height, 4, 4, size - 8, size - 8);
          return c;
        }
      }
      const extraMap = { Corral_Pen: 'corral_pen', Fish_Pond: 'fish_pond', Plot_Garden: 'garden_plot' };
      const bImg = assets.getBuildingImg(bDef.sprite) || (extraMap[bDef.sprite] && assets.extraImages && assets.extraImages[extraMap[bDef.sprite]]);
      if (bImg && bImg.complete && bImg.width > 0) {
        const fw = (bDef.sprite === 'well_health_strip' && bImg.width === 192 && bImg.height === 64) ? 32
          : ((bImg.width === 64 && bImg.height === 32) ? 16
          : (bImg.width >= bImg.height * 2.5 ? bImg.height : bImg.width));
        const fh = bImg.height;
        const aspect = fw / Math.max(1, fh);
        let dw = size - 4;
        let dh = dw / aspect;
        if (dh > size - 4) { dh = size - 4; dw = dh * aspect; }
        ctx.drawImage(bImg, 0, 0, fw, fh, (size - dw) / 2, (size - dh) / 2, dw, dh);
        return c;
      }
      if (bDef.isChest && assets.chestImages) { const ci = assets.chestImages[(bDef.chestSpriteKey || 'wood') + '_closed']; if (ci) { const d = size - 4; ctx.drawImage(ci, (size - d) / 2, (size - d) / 2, d, d); return c; } }
      // Fallback crisp pixel icon per sprite category
      ctx.fillStyle = '#261a24';
      ctx.fillRect(4, 4, size - 8, size - 8);
      ctx.fillStyle = bDef.color || '#ffb74d';
      ctx.fillRect(8, 8, size - 16, size - 16);
      ctx.strokeStyle = '#ffd54f';
      ctx.lineWidth = 2;
      ctx.strokeRect(5, 5, size - 10, size - 10);
      return c;
    }

    makeEnemyThumb(en, size = 40) {
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      c.className = 'pixel-img';
      c.style.width = size + 'px';
      c.style.height = size + 'px';
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      const meta = Abyssea.ENEMY_SPRITE_PATHS && Abyssea.ENEMY_SPRITE_PATHS[en.id];
      const img = Abyssea.Assets.enemyImages && Abyssea.Assets.enemyImages[en.id];
      if (meta && img) {
        const aspect = meta.fw / Math.max(1, meta.fh);
        let dh = size - 4;
        let dw = dh * aspect;
        if (dw > size - 4) { dw = size - 4; dh = dw / aspect; }
        ctx.drawImage(img, 0, 0, meta.fw, meta.fh, (size - dw) / 2, (size - dh) / 2, dw, dh);
      } else {
        ctx.fillStyle = en.color || '#ef5350';
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size * 0.34, 0, Math.PI * 2);
        ctx.fill();
      }
      return c;
    }

    el(tag, attrs = {}, children = []) {
      this.bindTooltipDelegation();
      const node = document.createElement(tag);
      for (const [k, v] of Object.entries(attrs)) {
        if (k === 'class') node.className = v;
        else if (k === 'style') node.style.cssText = v;
        else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
        else if (k === 'title' && v !== undefined && v !== null && String(v).trim()) {
          if (!attrs['data-tip'] && !attrs['data-tip-text']) node.setAttribute('data-tip-text', String(v));
          if (!attrs['aria-label']) node.setAttribute('aria-label', String(v));
        }
        else if (v !== undefined && v !== null) node.setAttribute(k, v);
      }
      for (const ch of (Array.isArray(children) ? children : [children])) {
        if (ch === null || ch === undefined) continue;
        node.appendChild(typeof ch === 'string' || typeof ch === 'number' ? document.createTextNode(String(ch)) : ch);
      }
      return node;
    }

    _uiAssetFallback(relPath) {
      const base = (typeof window !== 'undefined' && window.ABYSSEA_ROOT_BASE)
        ? window.ABYSSEA_ROOT_BASE
        : (typeof window !== 'undefined' && window.location && window.location.pathname && window.location.pathname.indexOf('/tests/') !== -1 ? '../' : '');
      return base + relPath;
    }

    uiIcon(key, size = 16, alt = '') {
      const fileMap = {
        iconCheck: 'assets/ui/ico_check.png',
        iconCross: 'assets/ui/ico_cross.png',
        iconGear: 'assets/ui/ico_gear.png',
        iconHeart: 'assets/ui/ico_heart.png',
        iconHome: 'assets/ui/ico_home.png',
        iconLock: 'assets/ui/ico_lock.png',
        iconReset: 'assets/ui/ico_reset.png',
        iconSliders: 'assets/ui/ico_sliders.png',
        iconSoundOff: 'assets/ui/ico_sound_off.png',
        iconSoundOn: 'assets/ui/ico_sound_on.png',
        iconSparkle: 'assets/ui/ico_sparkle.png',
        iconStar: 'assets/ui/ico_star.png',
        iconTrash: 'assets/ui/ico_trash.png',
        iconTrophy: 'assets/ui/ico_trophy.png',
        iconZoomIn: 'assets/ui/ico_zoom_in.png',
        iconZoomOut: 'assets/ui/ico_zoom_out.png'
      };
      const raw = (Abyssea.UI_URLS && Abyssea.UI_URLS[key]) || (fileMap[key] ? this._uiAssetFallback(fileMap[key]) : key);
      return this.el('img', {
        class: 'pixel-img pixel-inline-ico',
        src: encodeURI(raw),
        width: size,
        height: size,
        alt
      });
    }

    tipAttr(spec) {
      if (!spec) return null;
      return typeof spec === 'string' ? spec : JSON.stringify(spec);
    }

    normalizeUiScale(val) {
      const n = Number(val);
      if (UI_SCALES.includes(n)) return n;
      if (!Number.isFinite(n)) return 0.88;
      let best = 0.88;
      let minDiff = Infinity;
      UI_SCALES.forEach(s => {
        const d = Math.abs(s - n);
        if (d < minDiff) { minDiff = d; best = s; }
      });
      return best;
    }

    getUiScale() {
      if (this._uiScale && UI_SCALES.includes(this._uiScale)) return this._uiScale;
      let raw = 0.88;
      try {
        const stored = localStorage.getItem(UI_SCALE_STORAGE_KEY);
        if (stored !== null && stored !== undefined && stored !== '') raw = Number(stored);
        else if (this.game && this.game.settings && this.game.settings.uiScale != null) raw = this.game.settings.uiScale;
      } catch (_) {}
      return this.normalizeUiScale(raw);
    }

    applyUiScale(scale, opts = {}) {
      const next = this.normalizeUiScale(scale);
      this._uiScale = next;
      if (opts.persist !== false) {
        try { localStorage.setItem(UI_SCALE_STORAGE_KEY, String(next)); } catch (_) {}
      }
      if (this.game) {
        this.game.settings = this.game.settings || {};
        this.game.settings.uiScale = next;
      }
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        if (root && root.style) {
          root.style.setProperty('--ui-scale', String(next));
          root.style.setProperty('--ui-inv-scale', String(1 / next));
        }
        if (document.body && document.body.classList) {
          document.body.classList.remove('ui-scale-05', 'ui-scale-075', 'ui-scale-085', 'ui-scale-088', 'ui-scale-1', 'ui-scale-125', 'ui-scale-15', 'ui-scale-2', 'ui-scale-4');
          const cls = `ui-scale-${String(next).replace('.', '')}`;
          document.body.classList.add(cls);
        }
      }
      this.hideTooltip();
      return next;
    }

    initUiScale() {
      let raw = 0.88;
      try {
        const stored = localStorage.getItem(UI_SCALE_STORAGE_KEY);
        if (stored !== null && stored !== undefined && stored !== '') {
          const num = Number(stored);
          if (Number.isFinite(num) && num > 0) raw = num;
        }
      } catch (_) {}
      return this.applyUiScale(raw, { persist: false });
    }

    _catLabel(cat) {
      if (!cat) return '';
      const map = {
        recursos: tr('inv.tabRes'),
        minerales: tr('inv.tabRes'),
        gemas: tr('inv.tabRes'),
        monstruo: tr('inv.tabRes'),
        materiales: tr('inv.tabMat'),
        semillas: tr('inv.tabFood'),
        alimentos: tr('inv.tabFood'),
        comida: tr('inv.tabFood'),
        pociones: tr('inv.tabFood'),
        equipamiento: tr('inv.tabGear'),
        herramientas: tr('inv.tabGear'),
        construccion: tr('inv.tabBlocks'),
        especiales: tr('inv.tabSpecial'),
        magia: tr('inv.tabSpecial')
      };
      return map[cat] || cat;
    }

    _buildItemTipSpec(itemId, opts = {}) {
      const it = Abyssea.ITEMS && Abyssea.ITEMS[itemId];
      if (!it) return null;
      const rar = RARITIES[it.rarity] || RARITIES.comun;
      const stats = [];
      if (opts.count !== undefined && opts.count !== null) stats.push(tr('tip.count', { n: opts.count }));
      if (it.heal) stats.push(tr('tip.heal', { n: it.heal }));
      if (it.energy) stats.push(tr('tip.energy', { n: it.energy }));
      if (it.armor) stats.push(tr('tip.armor', { n: it.armor }));
      if (it.dmg) stats.push(tr('tip.dmg', { n: it.dmg }));
      if (it.speed) stats.push(tr('tip.speed', { n: Math.round(it.speed * 100) }));
      if (it.sellValue) stats.push(tr('tip.sellValue', { n: it.sellValue }));
      const parts = [rar.name];
      if (it.category) parts.push(this._catLabel(it.category));
      if (opts.enchantsText) parts.push(opts.enchantsText);
      const foot = opts.context === 'equip'
        ? tr('tip.footEquip')
        : (opts.context === 'hotbar'
          ? tr('tip.footHotbar')
          : tr('tip.footInv'));
      return {
        title: it.name,
        sub: parts.join(' · '),
        rarity: it.rarity || 'comun',
        icon: { kind: 'item', key: it.icon },
        desc: it.desc || '',
        stats,
        foot
      };
    }

    _positionTooltip(tip, ev, anchor) {
      const sc = this.getUiScale ? this.getUiScale() : 1;
      const vw = window.innerWidth || 1280;
      const vh = window.innerHeight || 720;
      const rect = tip.getBoundingClientRect();
      const pad = 10;
      let ax = 0;
      let ay = 0;
      if (ev && typeof ev.clientX === 'number' && typeof ev.clientY === 'number' && (ev.clientX !== 0 || ev.clientY !== 0)) {
        ax = ev.clientX;
        ay = ev.clientY;
      } else if (anchor) {
        const ar = anchor.getBoundingClientRect();
        ax = ar.left + Math.min(24 * sc, ar.width / 2);
        ay = ar.bottom;
      }
      let left = ax + 14;
      let top = ay + 18;
      if (left + rect.width > vw - pad) left = Math.max(pad, ax - rect.width - 14);
      if (top + rect.height > vh - pad) top = Math.max(pad, ay - rect.height - 14);
      left = Math.max(pad, Math.min(left, vw - rect.width - pad));
      top = Math.max(pad, Math.min(top, vh - rect.height - pad));
      tip.style.left = `${Math.round(left / sc)}px`;
      tip.style.top = `${Math.round(top / sc)}px`;
    }

    showTooltip(anchor, ev) {
      const tip = document.getElementById('abyssea-tooltip');
      if (!tip || !anchor || !anchor.isConnected) return this.hideTooltip();
      if (anchor.hasAttribute('title')) {
        const t = anchor.getAttribute('title');
        anchor.removeAttribute('title');
        if (t && !anchor.getAttribute('data-tip')) {
          anchor.setAttribute('data-tip-text', t);
          if (!anchor.getAttribute('aria-label')) anchor.setAttribute('aria-label', t);
        }
      }
      const rawSpec = anchor.getAttribute('data-tip');
      const rawText = anchor.getAttribute('data-tip-text');
      let spec = null;
      if (rawSpec) {
        if (rawSpec.startsWith('{')) {
          try { spec = JSON.parse(rawSpec); } catch (_) { spec = { title: rawSpec }; }
        } else {
          spec = { desc: rawSpec };
        }
      } else if (rawText) {
        spec = { desc: rawText };
      }
      if (!spec || (!spec.title && !spec.desc)) return this.hideTooltip();

      this._tipAnchor = anchor;
      tip.innerHTML = '';
      if (spec.title) {
        const rarColor = spec.color || (spec.rarity && RARITIES[spec.rarity] ? RARITIES[spec.rarity].color : '#ffe8a3');
        let iconNode = null;
        if (spec.icon && spec.icon.kind === 'item' && typeof this.itemIcon === 'function') {
          iconNode = this.itemIcon(spec.icon.key, 30);
        } else if (spec.icon && spec.icon.kind === 'tool' && typeof this.toolIcon === 'function') {
          iconNode = this.toolIcon(spec.icon.id, spec.icon.tier || 'basica', 30);
        } else if (spec.icon && spec.icon.kind === 'ui') {
          iconNode = this.uiIcon(spec.icon.key, 24);
        }
        const titleWrap = document.createElement('div');
        titleWrap.className = 'tip-title-wrap';
        const titleEl = document.createElement('strong');
        titleEl.className = 'tip-title';
        titleEl.style.color = rarColor;
        titleEl.textContent = spec.title;
        titleWrap.appendChild(titleEl);
        if (spec.sub) {
          const subEl = document.createElement('div');
          subEl.className = 'tip-sub';
          subEl.textContent = spec.sub;
          titleWrap.appendChild(subEl);
        }
        const head = document.createElement('div');
        head.className = 'tip-head';
        if (iconNode) head.appendChild(iconNode);
        head.appendChild(titleWrap);
        tip.appendChild(head);
      }
      if (spec.desc) {
        const descEl = document.createElement('div');
        descEl.className = 'tip-desc';
        descEl.textContent = spec.desc;
        tip.appendChild(descEl);
      }
      if (Array.isArray(spec.stats) && spec.stats.length > 0) {
        const statsEl = document.createElement('div');
        statsEl.className = 'tip-stats';
        spec.stats.slice(0, 6).forEach(st => {
          const pill = document.createElement('span');
          pill.className = 'tip-stat-pill';
          pill.textContent = String(st);
          statsEl.appendChild(pill);
        });
        tip.appendChild(statsEl);
      }
      if (spec.foot) {
        const footEl = document.createElement('div');
        footEl.className = 'tip-foot';
        footEl.textContent = spec.foot;
        tip.appendChild(footEl);
      }

      tip.classList.remove('hidden');
      tip.setAttribute('aria-hidden', 'false');
      this._positionTooltip(tip, ev, anchor);
    }

    hideTooltip() {
      this._tipAnchor = null;
      const tip = document.getElementById('abyssea-tooltip');
      if (!tip) return;
      tip.classList.add('hidden');
      tip.setAttribute('aria-hidden', 'true');
    }

    migrateStaticTitles() {
      if (typeof document === 'undefined') return;
      document.querySelectorAll('[title]').forEach(node => {
        const t = node.getAttribute('title');
        node.removeAttribute('title');
        if (t && !node.getAttribute('data-tip')) {
          node.setAttribute('data-tip-text', t);
          if (!node.getAttribute('aria-label')) node.setAttribute('aria-label', t);
        }
      });
    }

    bindTooltipDelegation() {
      if (this._tooltipBound || typeof document === 'undefined') return;
      this._tooltipBound = true;
      this.migrateStaticTitles();
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.migrateStaticTitles(), { once: true });
      }
      const selector = '[data-tip], [data-tip-text], [title]';
      document.addEventListener('mouseover', (e) => {
        const target = e.target && e.target.closest ? e.target.closest(selector) : null;
        if (!target) {
          this.hideTooltip();
          return;
        }
        this.showTooltip(target, e);
      }, { passive: true });
      document.addEventListener('mousemove', (e) => {
        if (!this._tipAnchor) return;
        if (!this._tipAnchor.isConnected) {
          this.hideTooltip();
          return;
        }
        const tip = document.getElementById('abyssea-tooltip');
        if (tip && !tip.classList.contains('hidden')) {
          this._positionTooltip(tip, e, this._tipAnchor);
        }
      }, { passive: true });
      document.addEventListener('mouseout', (e) => {
        if (!this._tipAnchor) return;
        const related = e.relatedTarget && e.relatedTarget.closest ? e.relatedTarget.closest(selector) : null;
        if (!related || related !== this._tipAnchor) this.hideTooltip();
      }, { passive: true });
      document.addEventListener('focusin', (e) => {
        const target = e.target && e.target.closest ? e.target.closest(selector) : null;
        if (target) this.showTooltip(target, null);
      }, { passive: true });
      document.addEventListener('focusout', () => this.hideTooltip(), { passive: true });
      document.addEventListener('mousedown', () => this.hideTooltip(), { passive: true });
      document.addEventListener('scroll', () => this.hideTooltip(), { passive: true, capture: true });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.hideTooltip(); });

      if (typeof MutationObserver !== 'undefined') {
        const modalBackdrop = document.getElementById('modal-backdrop');
        if (modalBackdrop) {
          new MutationObserver(() => {
            if (modalBackdrop.classList.contains('hidden')) this.hideTooltip();
          }).observe(modalBackdrop, { attributes: true, attributeFilter: ['class'] });
        }
        const modalBody = document.getElementById('modal-body');
        if (modalBody) {
          new MutationObserver(() => {
            if (!this._tipAnchor || !this._tipAnchor.isConnected) this.hideTooltip();
          }).observe(modalBody, { childList: true });
        }
      }
    }

    getLatestSaveSlot() {
      let bestSlot = null;
      let bestTime = -1;
      let bestSeq = -1;
      [1, 2, 3].forEach(s => {
        const sum = this.game && this.game.saveSys ? this.game.saveSys.getSlotSummary(s) : null;
        if (sum) {
          const ts = Number(sum.savedAtTs) || Date.parse(sum.savedAt) || 0;
          const seq = Number(sum.savedSeq) || 0;
          if (!bestSlot || ts > bestTime || (ts === bestTime && seq >= bestSeq)) {
            bestTime = ts;
            bestSeq = seq;
            bestSlot = { slot: s, summary: sum };
          }
        }
      });
      return bestSlot;
    }

    openDiscordExternal() {
      const now = Date.now();
      if (this._discordCooldownUntil && now < this._discordCooldownUntil) return;
      this._discordCooldownUntil = now + 700;
      let win = null;
      try {
        win = window.open(DISCORD_URL, '_blank', 'noopener,noreferrer');
      } catch (_) {
        win = null;
      }
      if (!win || win.closed) {
        this.openModal('discord_fallback');
      }
    }

    _getTauriInvoke() {
      try {
        if (window.__TAURI__ && window.__TAURI__.core && typeof window.__TAURI__.core.invoke === 'function') {
          return window.__TAURI__.core.invoke.bind(window.__TAURI__.core);
        }
        if (window.__TAURI_INTERNALS__ && typeof window.__TAURI_INTERNALS__.invoke === 'function') {
          return window.__TAURI_INTERNALS__.invoke.bind(window.__TAURI_INTERNALS__);
        }
      } catch (_) {}
      return null;
    }

    isDisplayFullscreen() {
      return Boolean(this._nativeFullscreen || document.fullscreenElement);
    }

    _syncDisplayModeUi() {
      const el = document.getElementById('display-mode-readout');
      if (el) el.textContent = this.isDisplayFullscreen() ? tr('settings.fullscreen') : tr('settings.windowed');
    }

    async syncNativeFullscreenState() {
      const invoke = this._getTauriInvoke();
      if (!invoke) return;
      try {
        const fs = await invoke('is_window_fullscreen');
        this._nativeFullscreen = Boolean(fs);
        this._syncDisplayModeUi();
      } catch (_) {}
    }

    async toggleDisplayMode() {
      const g = this.game;
      const invoke = this._getTauriInvoke();
      if (invoke) {
        try {
          if (document.fullscreenElement && document.exitFullscreen) {
            await document.exitFullscreen().catch(() => {});
          }
          const cur = await invoke('is_window_fullscreen').catch(() => Boolean(this._nativeFullscreen));
          const next = !cur;
          await invoke('set_window_fullscreen', { fullscreen: next });
          this._nativeFullscreen = next;
          this._syncDisplayModeUi();
          if (this.hasOpenModal() && (this.activeModal === 'settings' || this.activeModal === 'pause' || this.activeModal === 'title_settings')) {
            this.renderModal();
          }
          return next;
        } catch (_) {}
      }

      try {
        if (document.fullscreenElement) {
          if (navigator.keyboard && typeof navigator.keyboard.unlock === 'function') {
            try { navigator.keyboard.unlock(); } catch (_) {}
          }
          if (document.exitFullscreen) {
            const res = document.exitFullscreen();
            if (res && typeof res.catch === 'function') {
              res.catch(() => g && g.toast && g.toast(tr('settings.fullscreenError'), 'warn'));
            }
          }
        } else if (document.documentElement && document.documentElement.requestFullscreen) {
          const res = document.documentElement.requestFullscreen();
          Promise.resolve(res).then(() => {
            if (navigator.keyboard && typeof navigator.keyboard.lock === 'function') {
              navigator.keyboard.lock(['Escape']).catch(() => {});
            }
          }).catch(() => g && g.toast && g.toast(tr('settings.fullscreenError'), 'warn'));
        } else if (g && g.toast) {
          g.toast(tr('settings.fullscreenError'), 'warn');
        }
      } catch (_) {
        if (g && g.toast) g.toast(tr('settings.fullscreenError'), 'warn');
      }
      return this.isDisplayFullscreen();
    }

    executeQuitGame() {
      const g = this.game;
      if (g && g.started && g.saveSys && !(g.isPlayerDead && g.isPlayerDead())) {
        try {
          g.saveSys.save(g, g.currentSlot || 1, true);
        } catch (_) {}
      }

      // 1. Tauri v2 Desktop App Exit
      try {
        if (window.__TAURI__ && window.__TAURI__.core && typeof window.__TAURI__.core.invoke === 'function') {
          window.__TAURI__.core.invoke('exit_app');
          return;
        }
      } catch (_) {}
      try {
        if (window.__TAURI_INTERNALS__ && typeof window.__TAURI_INTERNALS__.invoke === 'function') {
          window.__TAURI_INTERNALS__.invoke('exit_app');
          return;
        }
      } catch (_) {}

      // 2. Browser Window Close Fallback
      try { window.close(); } catch (_) {}
      setTimeout(() => {
        try {
          if (typeof window !== 'undefined' && !window.closed && this.activeModal === 'quit_confirm') {
            this.activeModal = 'quit_web_fallback';
            this.renderModal();
          }
        } catch (_) {}
      }, 160);
    }

    renderTitleScreen() {
      const box = document.getElementById('title-slots');
      if (!box) return;
      box.innerHTML = '';

      const navStack = this.el('div', { class: 'title-nav-stack' });
      const latest = this.getLatestSaveSlot();
      const hasAny = [1, 2, 3].some(s => this.game.saveSys.hasSave(s));

      if (latest) {
        const sSum = latest.summary;
        navStack.appendChild(this.el('button', {
          id: 'btn-title-continue',
          class: 'title-nav-btn primary',
          onclick: () => {
            Abyssea.Audio.init();
            if (Abyssea.Audio.fadeOutMusic) Abyssea.Audio.fadeOutMusic(650);
            this.playSceneTransition(tr('transition.loadingAdventure'), () => {
              this.game.saveSys.load(this.game, latest.slot);
              this.hideTitleScreen();
            }, { sub: tr('title.continueSub', { slot: latest.slot, level: sSum.level || 1, day: sSum.day || 1 }) });
          }
        }, [
          this.el('span', { class: 'title-btn-lead' }, [
            this.el('img', { class: 'pixel-img title-btn-ico', src: encodeURI(Abyssea.UI_URLS.titleIcoContinue || Abyssea.UI_URLS.iconPlay), width: 28, height: 28, alt: '' }),
            tr('title.continue')
          ]),
          this.el('span', { class: 'title-nav-sub' }, tr('title.continueSub', {
            slot: latest.slot,
            level: sSum.level || 1,
            day: sSum.day || 1
          }))
        ]));
      }

      navStack.appendChild(this.el('button', {
        id: 'btn-title-play',
        class: (latest ? 'title-nav-btn' : 'title-nav-btn primary') + (this.titleSlotPickerOpen ? ' is-open' : ''),
        'aria-expanded': this.titleSlotPickerOpen ? 'true' : 'false',
        onclick: () => {
          const ts = document.getElementById('title-screen');
          if (ts) ts.classList.remove('title-entering');
          this.titleSlotPickerOpen = !this.titleSlotPickerOpen;
          if (!this.titleSlotPickerOpen) this.confirmDeleteSlot = null;
          this.renderTitleScreen();
        }
      }, [
        this.el('span', { class: 'title-btn-lead' }, [
          this.el('img', { class: 'pixel-img title-btn-ico', src: encodeURI(Abyssea.UI_URLS.titleIcoPlay || 'assets/icons/scroll_map.png'), width: 28, height: 28, alt: '' }),
          tr('title.play')
        ]),
        this.el('span', { class: 'title-nav-sub' }, hasAny ? tr('title.playSub') : tr('title.slotEmpty'))
      ]));

      if (this.titleSlotPickerOpen) {
        const drawer = this.el('div', { class: 'title-slot-drawer' });
        drawer.appendChild(this.el('div', { class: 'title-slot-drawer-head' }, [
          this.el('img', { class: 'pixel-img title-slot-head-ico', src: encodeURI(Abyssea.UI_URLS.titleIcoAnchor || 'assets/icons/abyssea_core.png?v=1.6.3'), width: 20, height: 20, alt: '' }),
          this.el('span', {}, tr('title.chooseSlot'))
        ]));
        [1, 2, 3].forEach(s => {
          const sSum = this.game.saveSys.getSlotSummary(s);
          const isConfirming = this.confirmDeleteSlot === s;
          const rowCls = 'title-slot-row' + (!sSum ? ' is-empty' : '') + (isConfirming ? ' is-confirming' : '');
          const slotLineText = sSum
            ? tr('title.slotLine', { level: sSum.level, coins: sSum.coins, plots: sSum.plots || 1 })
            : tr('common.empty');

          const row = this.el('div', { class: rowCls }, [
            this.el('div', { class: 'title-slot-info' }, [
              this.el('strong', { class: 'title-slot-title' }, isConfirming
                ? tr('title.deleteAsk', { slot: s })
                : tr('title.slotTitle', { slot: s })),
              this.el('span', { class: 'title-slot-meta' }, isConfirming
                ? `${slotLineText} · ${tr('title.deleteWarn')}`
                : slotLineText)
            ]),
            this.el('div', { class: 'title-slot-actions' },
              isConfirming ? [
                this.el('button', {
                  id: `btn-confirm-delete-${s}`,
                  class: 'title-slot-btn danger',
                  onclick: () => {
                    this.game.saveSys.deleteSlot(s);
                    this.confirmDeleteSlot = null;
                    this.renderTitleScreen();
                  }
                }, tr('title.deleteConfirm')),
                this.el('button', {
                  id: `btn-cancel-delete-${s}`,
                  class: 'title-slot-btn neutral',
                  onclick: () => {
                    this.confirmDeleteSlot = null;
                    this.renderTitleScreen();
                  }
                }, tr('common.cancel'))
              ] : [
                this.el('button', {
                  id: `btn-slot-play-${s}`,
                  class: sSum ? 'title-slot-btn play' : 'title-slot-btn create',
                  onclick: () => {
                    Abyssea.Audio.init();
                    if (Abyssea.Audio.fadeOutMusic) Abyssea.Audio.fadeOutMusic(650);
                    const subText = sSum
                      ? tr('title.slotLine', { level: sSum.level, coins: sSum.coins, plots: sSum.plots || 1 })
                      : tr('transition.newWorldSub');
                    this.playSceneTransition(sSum ? tr('transition.loadingAdventure') : tr('transition.preparingAdventure'), () => {
                      this._lastTutStep = undefined;
                      if (sSum) this.game.saveSys.load(this.game, s);
                      else this.game.startNewGame(s);
                      this.hideTitleScreen();
                    }, { sub: subText });
                  }
                }, sSum ? tr('title.loadSlotBtn') : tr('title.createSlotBtn')),
                sSum ? this.el('button', {
                  id: `btn-slot-reset-${s}`,
                  class: 'title-slot-btn reset',
                  'data-tip-text': tr('title.resetSlotTip'),
                  'aria-label': tr('title.resetSlotTip'),
                  onclick: () => {
                    this.confirmDeleteSlot = s;
                    this.renderTitleScreen();
                  }
                }, [this.uiIcon('iconTrash', 14), tr('title.resetSlotBtn')]) : null
              ]
            )
          ]);
          drawer.appendChild(row);
        });
        navStack.appendChild(drawer);
      }

      navStack.appendChild(this.el('button', {
        id: 'btn-title-settings',
        class: 'title-nav-btn',
        onclick: () => this.openModal('title_settings')
      }, [
        this.el('span', { class: 'title-btn-lead' }, [
          this.el('img', { class: 'pixel-img title-btn-ico', src: encodeURI(Abyssea.UI_URLS.titleIcoSettings || Abyssea.UI_URLS.iconSettings), width: 28, height: 28, alt: '' }),
          tr('title.settings')
        ]),
        this.el('span', { class: 'title-nav-sub' }, tr('title.settingsSub'))
      ]));

      navStack.appendChild(this.el('button', {
        id: 'btn-title-quit',
        class: 'title-nav-btn danger',
        onclick: () => this.executeQuitGame()
      }, [
        this.el('span', { class: 'title-btn-lead' }, [
          this.el('img', { class: 'pixel-img title-btn-ico', src: encodeURI(Abyssea.UI_URLS.titleIcoQuit || 'assets/ui/ico_cross.png'), width: 28, height: 28, alt: '' }),
          tr('title.quit')
        ]),
        this.el('span', { class: 'title-nav-sub' }, tr('title.quitSub'))
      ]));

      box.appendChild(navStack);

      const isEnTitle = Abyssea.I18n && Abyssea.I18n.getLanguage && Abyssea.I18n.getLanguage() === 'en';
      const patchBtn = this.el('button', {
        id: 'btn-title-patch-notes',
        type: 'button',
        class: 'title-patch-notes-btn',
        'data-tip-text': isEnTitle
          ? 'View recent changes and new content in Beta 2.0.0 RC2'
          : 'Ver todos los cambios recientes y contenido nuevo de la Beta 2.0.0 RC2',
        onclick: () => this.openModal('patch_notes')
      }, [
        this.el('img', { class: 'pixel-img title-patch-ico', src: encodeURI(Abyssea.UI_URLS.titleIcoPatch || 'assets/icons/scroll_map.png'), width: 28, height: 28, alt: '' }),
        this.el('span', { class: 'title-patch-notes-label' }, isEnTitle ? 'Patch Notes' : 'Cambios recientes'),
        this.el('span', { class: 'title-patch-notes-badge' }, 'Beta 2.0.0 RC2')
      ]);
      box.appendChild(patchBtn);

      const verEl = document.querySelector('#title-screen .title-version');
      if (verEl) {
        verEl.textContent = 'Abyssea Beta v2.0.0 RC2';
        verEl.style.pointerEvents = 'auto';
        verEl.style.cursor = 'pointer';
        verEl.onclick = () => this.openModal('patch_notes');
      }

      const cornerActions = this.el('div', { class: 'title-corner-actions' }, [
        this.el('button', {
          id: 'btn-title-discord',
          class: 'title-nav-btn title-sq-btn discord',
          'data-tip-text': `${tr('title.discord')} — ${tr('title.discordSub')}`,
          'aria-label': tr('title.discord'),
          onclick: () => this.openDiscordExternal()
        }, [
          this.el('img', { class: 'pixel-img', src: encodeURI(Abyssea.UI_URLS.titleIcoDiscord || Abyssea.UI_URLS.iconDiscord || Abyssea.UI_URLS.iconStar), width: 28, height: 28, alt: '' })
        ]),
        this.el('button', {
          id: 'btn-title-credits',
          class: 'title-nav-btn title-sq-btn',
          'data-tip-text': `${tr('title.credits')} — ${tr('title.creditsSub')}`,
          'aria-label': tr('title.credits'),
          onclick: () => this.openModal('credits')
        }, [
          this.el('img', { class: 'pixel-img', src: encodeURI(Abyssea.UI_URLS.titleIcoCredits || Abyssea.UI_URLS.iconInfo || Abyssea.UI_URLS.iconStar), width: 28, height: 28, alt: '' })
        ])
      ]);
      box.appendChild(cornerActions);
    }

    playSceneTransition(label, onMidpoint, onDoneOrOpts = null, extraOpts = null) {
      const onDone = typeof onDoneOrOpts === 'function' ? onDoneOrOpts : null;
      const opts = (typeof onDoneOrOpts === 'object' && onDoneOrOpts !== null) ? onDoneOrOpts : (extraOpts || {});
      const overlay = document.getElementById('scene-transition');
      if (!overlay) {
        if (typeof onMidpoint === 'function') onMidpoint();
        if (typeof onDone === 'function') onDone();
        return;
      }
      if (this._sceneTransitionTimer) {
        clearTimeout(this._sceneTransitionTimer);
        this._sceneTransitionTimer = null;
      }
      if (this._sceneTransitionEndTimer) {
        clearTimeout(this._sceneTransitionEndTimer);
        this._sceneTransitionEndTimer = null;
      }
      this._stopTransitionDiorama();

      const inferredSave = (!opts.kind && label && /guard|sav|salv/i.test(label));
      const sceneKind = opts.kind === 'dungeon' ? 'dungeon' : ((opts.kind === 'save' || inferredSave) ? 'save' : 'overworld');

      overlay.classList.toggle('is-dungeon', sceneKind === 'dungeon');
      overlay.classList.toggle('is-save', sceneKind === 'save');

      const lblEl = document.getElementById('scene-transition-label');
      if (lblEl) lblEl.textContent = label || 'ABYSSEA';

      const subEl = document.getElementById('scene-transition-sub');
      if (subEl) {
        const subTxt = opts.sub || '';
        subEl.textContent = subTxt;
        if (subTxt) subEl.classList.remove('hidden');
        else subEl.classList.add('hidden');
      }

      const briefEl = document.getElementById('scene-transition-dungeon');
      if (briefEl) {
        if (sceneKind === 'dungeon' && opts.dungeonMeta) {
          briefEl.innerHTML = '';
          this._renderDungeonTransitionBrief(briefEl, opts.dungeonMeta);
          briefEl.classList.remove('hidden');
          overlay.classList.add('has-dungeon-brief');
        } else {
          briefEl.innerHTML = '';
          briefEl.classList.add('hidden');
          overlay.classList.remove('has-dungeon-brief');
        }
      }

      const iconEl = document.getElementById('scene-transition-icon');
      if (iconEl) {
        iconEl.src = opts.icon || 'assets/icons/abyssea_core.png?v=1.6.3';
      }

      const statusEl = document.getElementById('st-loading-text');
      if (statusEl) {
        const trFn = (k, fb) => (Abyssea.I18n && Abyssea.I18n.t) ? Abyssea.I18n.t(k) : fb;
        if (sceneKind === 'dungeon') statusEl.textContent = trFn('transition.statusDungeon', 'Unsealing ancient catacombs...');
        else if (sceneKind === 'save') statusEl.textContent = trFn('transition.statusSave', 'Inscribing island chronicle...');
        else statusEl.textContent = trFn('transition.statusOverworld', 'Sailing across the archipelago...');
      }

      const barFillEl = document.getElementById('st-loading-bar-fill');
      const pctEl = document.getElementById('st-loading-pct');
      if (barFillEl) barFillEl.style.width = '0%';
      if (pctEl) pctEl.textContent = '0%';

      const tipEl = document.getElementById('scene-transition-tip-text');
      if (tipEl) {
        if (opts.tip) {
          tipEl.textContent = opts.tip;
        } else {
          const isEn = Boolean(Abyssea.I18n && ((Abyssea.I18n.getLanguage && Abyssea.I18n.getLanguage() === 'en') || Abyssea.I18n.lang === 'en'));
          const tipsEs = [
            'Construye una Mesa de Artesanía para forjar herramientas de mayor rango.',
            'Explora los bordes del archipiélago para desbloquear nuevas islas con monedas.',
            'Los árboles y rocas a veces sueltan monedas brillantes adicionales.',
            'Comer bayas o descansar junto a una fogata restaura tu salud y energía.',
            'Cada bioma alberga minerales exclusivos como cobre, hierro, oro y cristales.',
            'Sube de nivel para ganar Puntos de Constelación y desbloquear pasivas legendarias.',
            'Las mazmorras antiguas esconden cofres dorados con reliquias permanentes.',
            'Usa el esquive (Espacio) para moverte más rápido y evadir peligros.',
            'Crea un Horno de Fundición para convertir minerales en lingotes refinados.'
          ];
          const tipsEn = [
            'Build a Crafting Table to forge higher tier tools and equipment.',
            'Explore island borders to unlock new lands using your earned coins.',
            'Trees and rocks occasionally drop shiny bonus coins when broken.',
            'Eating berries or resting near a campfire restores your health and energy.',
            'Each biome holds unique ores such as copper, iron, gold and crystals.',
            'Level up to earn Constellation Points and unlock legendary passives.',
            'Ancient dungeons conceal golden chests with permanent relics.',
            'Use dash (Space) to sprint swiftly and evade hazards.',
            'Build a Furnace to smelt raw ores into refined ingots.'
          ];
          const pool = isEn ? tipsEn : tipsEs;
          tipEl.textContent = pool[Math.floor(Math.random() * pool.length)];
        }
      }

      // Audio cue for atmospheric transition
      if (Abyssea.Audio) {
        Abyssea.Audio.play('portal');
        if (sceneKind === 'dungeon') {
          Abyssea.Audio.tone(130, 60, 0.65, 'sawtooth', 0.35);
        } else {
          Abyssea.Audio.tone(260, 130, 0.45, 'triangle', 0.25);
        }
      }

      const HOLD_MS = 5600;
      const EXIT_MS = 650;
      this._transitioning = true;
      overlay.classList.remove('hidden', 'is-opening', 'is-closing');
      void overlay.offsetWidth;
      overlay.classList.add('is-closing');

      this._startTransitionDiorama(sceneKind, HOLD_MS);

      this._sceneTransitionTimer = setTimeout(() => {
        if (barFillEl) barFillEl.style.width = '100%';
        if (pctEl) pctEl.textContent = '100%';
        try {
          if (typeof onMidpoint === 'function') onMidpoint();
        } finally {
          overlay.classList.remove('is-closing');
          overlay.classList.add('is-opening');
          if (Abyssea.Audio) {
            Abyssea.Audio.tone(196, 440, 0.45, 'sine', 0.22, 0.05);
          }
          this._sceneTransitionEndTimer = setTimeout(() => {
            this._stopTransitionDiorama();
            overlay.classList.remove('is-opening', 'is-closing', 'is-dungeon', 'is-save', 'has-dungeon-brief');
            overlay.classList.add('hidden');
            this._transitioning = false;
            if (typeof onDone === 'function') onDone();
          }, EXIT_MS);
        }
      }, HOLD_MS);
    }

    _drawTransitionThumb(canvas, meta, fallbackPath) {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const paint = (img, sx, sy, sw, sh) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = false;
        const aspect = sw / Math.max(1, sh);
        let dw = canvas.width;
        let dh = canvas.height;
        if (aspect > 1) dh = Math.round(dw / aspect);
        else dw = Math.round(dh * aspect);
        const dx = Math.round((canvas.width - dw) / 2);
        const dy = Math.round((canvas.height - dh) / 2);
        ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
      };
      const assets = Abyssea.Assets;
      let img = (meta && meta.bossKey && assets && assets.bossImages && assets.bossImages[meta.bossKey]) || null;
      if (!img && meta && meta.key) img = this._getStSprite(meta.key, fallbackPath);
      if (img && this._isStImgReady(img)) {
        paint(img, meta.sx || 0, meta.sy || 0, meta.sw || img.naturalWidth || 32, meta.sh || img.naturalHeight || 32);
      } else if (img) {
        img.addEventListener('load', () => {
          paint(img, meta.sx || 0, meta.sy || 0, meta.sw || img.naturalWidth || 32, meta.sh || img.naturalHeight || 32);
        }, { once: true });
      }
    }

    _renderDungeonTransitionBrief(container, meta) {
      const isEn = Boolean(Abyssea.I18n && Abyssea.I18n.getLanguage && Abyssea.I18n.getLanguage() === 'en');
      const top = document.createElement('div');
      top.className = 'st-db-top';

      const badges = document.createElement('div');
      badges.className = 'st-db-badges';

      const addBadge = (cls, text) => {
        const b = document.createElement('span');
        b.className = 'st-db-badge' + (cls ? ' ' + cls : '');
        b.textContent = text;
        badges.appendChild(b);
      };
      const totalDungs = Object.keys(Abyssea.DUNGEON_DEFS || {}).length || 75;
      addBadge('', `${meta.biomeName || 'Archipiélago'} · ${isEn ? 'Depth' : 'Nv.'} ${meta.tier || 1}/${totalDungs}`);
      addBadge('is-rec', `${isEn ? 'Rec. Level' : 'Nivel Rec.'} ${meta.recLevel || 2}+`);
      addBadge('is-lvl', `${isEn ? 'Mobs Lv.' : 'Mobs Nv.'}${meta.mobLevelMin || 2}+ · ${isEn ? 'Guardian Lv.' : 'Guardián Nv.'}${meta.miniLevel || 4}`);
      top.appendChild(badges);

      const floors = document.createElement('div');
      floors.className = 'st-db-floors';
      floors.textContent = isEn
        ? '4 Sectors: Entry Hall · Rune Wings · Guardian Chamber · Boss Sanctum'
        : (meta.floorsDesc || '4 Sectores: Atrio · Alas Rúnicas · Guardián · Santuario del Jefe');
      top.appendChild(floors);
      container.appendChild(top);

      const grid = document.createElement('div');
      grid.className = 'st-db-grid';

      const mobPanel = document.createElement('div');
      mobPanel.className = 'st-db-panel';
      const mobTitle = document.createElement('div');
      mobTitle.className = 'st-db-panel-title';
      mobTitle.textContent = isEn ? 'Enemies Inside' : 'Enemigos en esta Mazmorra';
      mobPanel.appendChild(mobTitle);

      const mobWrap = document.createElement('div');
      mobWrap.className = 'st-db-mobs';
      const ePaths = Abyssea.ENEMY_SPRITE_PATHS || {};
      const list = Array.isArray(meta.enemies) ? meta.enemies.slice(0, 6) : [];
      list.forEach(em => {
        const chip = document.createElement('div');
        chip.className = 'st-db-mob-chip';
        const cvs = document.createElement('canvas');
        cvs.className = 'st-db-mob-canvas';
        cvs.width = 28;
        cvs.height = 28;
        const sprMeta = ePaths[em.type];
        if (sprMeta) {
          this._drawTransitionThumb(cvs, {
            key: em.type,
            sx: 0,
            sy: 0,
            sw: sprMeta.fw || 32,
            sh: sprMeta.fh || 32
          }, sprMeta.path);
        }
        chip.appendChild(cvs);

        const info = document.createElement('div');
        info.className = 'st-db-mob-info';
        const nm = document.createElement('div');
        nm.className = 'st-db-mob-name';
        nm.textContent = em.name || em.type;
        const sub = document.createElement('div');
        sub.className = 'st-db-mob-sub';
        sub.textContent = `${isEn ? 'Lv.' : 'Nv.'}${em.level || meta.mobLevelMin || 2} · ${em.ranged ? (isEn ? 'Ranged' : 'A distancia') : (isEn ? 'Melee' : 'Cuerpo a cuerpo')}`;
        info.appendChild(nm);
        info.appendChild(sub);
        chip.appendChild(info);
        mobWrap.appendChild(chip);
      });
      mobPanel.appendChild(mobWrap);
      grid.appendChild(mobPanel);

      const bossPanel = document.createElement('div');
      bossPanel.className = 'st-db-panel';
      const bossTitle = document.createElement('div');
      bossTitle.className = 'st-db-panel-title';
      bossTitle.textContent = isEn ? 'Chamber Boss' : 'Jefe de la Cámara';
      bossPanel.appendChild(bossTitle);

      const bossBox = document.createElement('div');
      bossBox.className = 'st-db-boss-box';
      const bMetaMap = Abyssea.BOSS_SPRITE_PATHS || {};
      const bMeta = meta.id ? bMetaMap[meta.id] : null;
      if (bMeta) {
        const bCvs = document.createElement('canvas');
        bCvs.className = 'st-db-boss-icon';
        bCvs.width = 38;
        bCvs.height = 38;
        this._drawTransitionThumb(bCvs, {
          key: 'boss_' + meta.id,
          bossKey: meta.id,
          sx: bMeta.sx || 0,
          sy: bMeta.sy || 0,
          sw: bMeta.sw || bMeta.fw || 48,
          sh: bMeta.sh || bMeta.fh || 48
        }, bMeta.path);
        bossBox.appendChild(bCvs);
      } else {
        const bImg = document.createElement('img');
        bImg.className = 'st-db-boss-icon';
        bImg.src = 'assets/icons/skull_death.png';
        bImg.alt = '';
        bossBox.appendChild(bImg);
      }

      const bInfo = document.createElement('div');
      bInfo.className = 'st-db-boss-info';
      const bName = document.createElement('div');
      bName.className = 'st-db-boss-name';
      bName.textContent = (meta.boss && meta.boss.name) || (isEn ? 'Ancient Guardian' : 'Guardián Ancestral');
      const bStats = document.createElement('div');
      bStats.className = 'st-db-boss-stats';
      const fmtStat = (v) => (Abyssea.Utils && Abyssea.Utils.formatNum) ? Abyssea.Utils.formatNum(Math.round(v)) : Math.round(v);
      bStats.textContent = meta.boss ? `HP ${fmtStat(meta.boss.hp)} · ${isEn ? 'ATK' : 'ATQ'} ${fmtStat(meta.boss.dmg)}` : (isEn ? 'Boss Encounter' : 'Desafío de Jefe');
      bInfo.appendChild(bName);
      bInfo.appendChild(bStats);
      if (meta.boss && meta.boss.relicName) {
        const bRel = document.createElement('div');
        bRel.className = 'st-db-boss-relic';
        bRel.textContent = `${isEn ? 'Relic' : 'Reliquia'}: ${meta.boss.relicName}`;
        bInfo.appendChild(bRel);
      }
      bossBox.appendChild(bInfo);
      bossPanel.appendChild(bossBox);
      grid.appendChild(bossPanel);

      container.appendChild(grid);
    }

    _getStSprite(key, fallbackPath) {
      const a = Abyssea.Assets;
      if (a) {
        const found = (a.get && a.get(key))
          || (a.extraImages && a.extraImages[key])
          || (a.dungeonImages && a.dungeonImages[key])
          || (a.chestImages && a.chestImages[key])
          || (a.enemyImages && a.enemyImages[key]);
        if (found) return found;
      }
      if (!fallbackPath || typeof Image === 'undefined') return null;
      this._stSpriteCache = this._stSpriteCache || {};
      let img = this._stSpriteCache[key];
      if (!img) {
        img = new Image();
        const root = (typeof window !== 'undefined' && window.ABYSSEA_ROOT_BASE) ? window.ABYSSEA_ROOT_BASE : '';
        img.src = encodeURI(root + fallbackPath);
        this._stSpriteCache[key] = img;
      }
      return img;
    }

    _isStImgReady(img) {
      return Boolean(img && img.complete !== false && (img.naturalWidth === undefined || img.naturalWidth > 0) && (img.width === undefined || img.width > 0));
    }

    _drawPixelSprite(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh, flipX = false) {
      if (!this._isStImgReady(img)) return false;
      const rx = Math.round(dx);
      const ry = Math.round(dy);
      const rw = Math.round(dw);
      const rh = Math.round(dh);
      ctx.imageSmoothingEnabled = false;
      if (!flipX) {
        ctx.drawImage(img, sx, sy, sw, sh, rx, ry, rw, rh);
      } else {
        ctx.save();
        ctx.translate(rx + rw, ry);
        ctx.scale(-1, 1);
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, rw, rh);
        ctx.restore();
      }
      return true;
    }

    _drawDitherBands(ctx, w, bands) {
      for (let i = 0; i < bands.length; i++) {
        const b = bands[i];
        ctx.fillStyle = b[2];
        ctx.fillRect(0, b[0], w, b[1] - b[0]);
      }
    }

    _drawDitherLight(ctx, cx, cy, rx, ry, outerCol, coreCol) {
      const ix = Math.round(cx);
      const iy = Math.round(cy);
      const minY = Math.round(iy - ry);
      const maxY = Math.round(iy + ry);
      for (let py = minY; py <= maxY; py += 2) {
        const ny = (py - iy) / Math.max(1, ry);
        const span = Math.floor(rx * Math.sqrt(Math.max(0, 1 - ny * ny)));
        if (span <= 0) continue;
        const innerSpan = Math.floor(span * 0.56);
        if (coreCol && innerSpan > 2 && Math.abs(py - iy) <= ry * 0.6) {
          ctx.fillStyle = coreCol;
          ctx.fillRect(ix - innerSpan, py, innerSpan * 2, 2);
        }
        ctx.fillStyle = outerCol;
        const startX = ix - span;
        const endX = ix + span;
        for (let px = startX; px <= endX; px += 4) {
          if (coreCol && Math.abs(px - ix) <= innerSpan && Math.abs(py - iy) <= ry * 0.56) continue;
          const phase = (((px >> 2) + (py >> 1)) & 1) * 2;
          ctx.fillRect(px + phase, py, 2, 2);
        }
      }
    }

    _drawPixelCloud(ctx, x, y, w, cBase, cLit, cShade) {
      const rx = Math.round(x);
      const ry = Math.round(y);
      ctx.fillStyle = cShade;
      ctx.fillRect(rx, ry + 10, w, 7);
      ctx.fillStyle = cBase;
      ctx.fillRect(rx + 4, ry + 6, w - 8, 9);
      ctx.fillRect(rx + Math.round(w * 0.2), ry + 2, Math.round(w * 0.48), 6);
      ctx.fillStyle = cLit;
      ctx.fillRect(rx + Math.round(w * 0.28), ry, Math.round(w * 0.28), 3);
    }

    _startTransitionDiorama(sceneKind, durationMs) {
      this._stopTransitionDiorama();
      const canvas = document.getElementById('st-pixel-canvas');
      if (!canvas || typeof canvas.getContext !== 'function') return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const startMs = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      const dur = Math.max(400, durationMs || 5600);
      const state = { active: true, rafId: null, kind: sceneKind, startMs, dur };
      this._stDioramaState = state;

      const barFillEl = document.getElementById('st-loading-bar-fill');
      const pctEl = document.getElementById('st-loading-pct');

      const step = (nowTs) => {
        if (!state.active || this._stDioramaState !== state) return;
        const now = (typeof nowTs === 'number') ? nowTs : Date.now();
        const elapsed = Math.max(0, now - state.startMs);
        const t = elapsed / 1000;
        const rawNorm = Math.min(1, elapsed / state.dur);
        const eased = Math.min(1, 0.28 * rawNorm + 0.72 * (1 - Math.pow(1 - rawNorm, 2.3)));

        if (barFillEl) barFillEl.style.width = (eased * 100).toFixed(1) + '%';
        if (pctEl) pctEl.textContent = Math.min(100, Math.round(eased * 100)) + '%';

        this._renderTransitionFrame(ctx, state.kind, t, eased);

        if (typeof requestAnimationFrame === 'function') {
          state.rafId = requestAnimationFrame(step);
        }
      };

      this._renderTransitionFrame(ctx, state.kind, 0, 0);
      if (typeof requestAnimationFrame === 'function') {
        state.rafId = requestAnimationFrame(step);
      }
    }

    _stopTransitionDiorama() {
      const state = this._stDioramaState;
      if (!state) return;
      state.active = false;
      if (state.rafId !== null && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(state.rafId);
      }
      this._stDioramaState = null;
    }

    _renderTransitionFrame(ctx, sceneKind, t, normP) {
      ctx.imageSmoothingEnabled = false;
      if (sceneKind === 'dungeon') {
        this._renderDungeonDiorama(ctx, t, normP);
      } else {
        this._renderOverworldDiorama(ctx, t, normP, sceneKind === 'save');
      }
    }

    _renderOverworldDiorama(ctx, t, normP, isSave) {
      const W = 640;
      const H = 360;
      // 1. Calm stepped atmospheric night ocean sky (zero seam teeth)
      this._drawDitherBands(ctx, W, [
        [0, 44, '#050b16'],
        [44, 90, '#071222'],
        [90, 138, '#0a1a2e'],
        [138, 180, '#0e233d'],
        [180, 214, '#132e4d']
      ]);

      // 2. Crisp pixel stars with gentle stepped twinkle
      const stars = [
        [36, 22], [88, 46], [152, 16], [208, 62], [272, 26], [336, 44], [404, 18], [468, 54], [584, 30],
        [60, 102], [124, 82], [184, 118], [256, 94], [368, 90], [436, 110], [500, 78], [612, 106],
        [28, 154], [104, 146], [232, 162], [412, 150], [564, 158], [596, 134]
      ];
      const tick = Math.floor(t * 2.0);
      for (let i = 0; i < stars.length; i++) {
        const [sx, sy] = stars[i];
        const bright = ((i + tick) % 5) === 0;
        ctx.fillStyle = bright ? '#f5ebd6' : ((i % 2 === 0) ? '#7fa2c2' : '#4a6f91');
        ctx.fillRect(sx, sy, 2, 2);
      }

      // 3. Hand-pixeled crescent moon in upper-right sky
      const mx = 548;
      const my = 34;
      ctx.fillStyle = '#f3e7c2';
      ctx.fillRect(mx + 4, my, 8, 2);
      ctx.fillRect(mx + 2, my + 2, 6, 2);
      ctx.fillRect(mx, my + 4, 6, 8);
      ctx.fillRect(mx + 2, my + 12, 6, 2);
      ctx.fillRect(mx + 4, my + 14, 8, 2);
      ctx.fillStyle = '#c8b88e';
      ctx.fillRect(mx + 10, my + 2, 2, 2);
      ctx.fillRect(mx + 10, my + 12, 2, 2);

      // 4. Slow drifting multi-shade pixel clouds
      const cloudWrap = (base, speed) => ((Math.round(base + t * speed)) % (W + 140)) - 110;
      this._drawPixelCloud(ctx, cloudWrap(48, 5.2), 54, 72, '#132840', '#1c3857', '#0d1d30');
      this._drawPixelCloud(ctx, cloudWrap(372, 3.8), 94, 56, '#162f4b', '#204266', '#102238');
      this._drawPixelCloud(ctx, cloudWrap(208, 2.8), 136, 44, '#1a3857', '#254c73', '#132a44');

      // 5. Distant silhouetted archipelago ridges resting on the sea horizon
      ctx.fillStyle = '#0b1e32';
      ctx.fillRect(16, 202, 108, 12);
      ctx.fillRect(32, 194, 68, 8);
      ctx.fillRect(48, 186, 28, 8);
      ctx.fillStyle = '#0e263d';
      ctx.fillRect(488, 200, 132, 14);
      ctx.fillRect(512, 190, 80, 10);
      ctx.fillRect(536, 182, 32, 8);
      ctx.fillStyle = '#f2b84b';
      ctx.fillRect(72, 204, 2, 2);
      ctx.fillRect(548, 202, 2, 2);

      // 6. Living animated ocean plane (y = 214..360) using ABYSSEA water sprites + twilight depth glaze
      const seaTop = 214;
      const waterImg = this._getStSprite('water_profundo', 'assets/tiles/water_profundo.png');
      ctx.fillStyle = '#1f648d';
      ctx.fillRect(0, seaTop, W, H - seaTop);

      const WT = 32;
      if (this._isStImgReady(waterImg)) {
        const wFrames = Math.max(1, Math.floor((waterImg.width || 80) / 16));
        const wFrame = Math.floor(t * 4.2) % wFrames;
        for (let wy = seaTop; wy < H; wy += WT) {
          const dh = Math.min(WT, H - wy);
          const sh = Math.max(1, Math.floor(dh / 2));
          for (let wx = 0; wx < W; wx += WT) {
            this._drawPixelSprite(ctx, waterImg, wFrame * 16, 0, 16, sh, wx, wy, WT, dh);
          }
        }
      } else {
        const wf = Math.floor(t * 4) % 4;
        for (let wy = seaTop; wy < H; wy += WT) {
          const dh = Math.min(WT, H - wy);
          for (let wx = 0; wx < W; wx += WT) {
            const alt = (((wx + wy) >> 5) + (wf & 1)) & 1;
            ctx.fillStyle = alt ? '#236b96' : '#1d5b82';
            ctx.fillRect(wx, wy, WT, dh);
            if (dh >= 14) {
              ctx.fillStyle = '#3b8fb8';
              ctx.fillRect(wx + 6 + (wf * 3) % 10, wy + 12, 8, 2);
            }
          }
        }
      }

      // Stepped twilight ocean veil: misty blue-navy at horizon, rich readable ocean around & in front of island
      ctx.fillStyle = 'rgba(7, 20, 38, 0.48)';
      ctx.fillRect(0, seaTop, W, 12);
      ctx.fillStyle = 'rgba(7, 20, 38, 0.39)';
      ctx.fillRect(0, seaTop + 12, W, 14);
      ctx.fillStyle = 'rgba(7, 20, 38, 0.31)';
      ctx.fillRect(0, seaTop + 26, W, 18);
      ctx.fillStyle = 'rgba(6, 18, 34, 0.25)';
      ctx.fillRect(0, seaTop + 44, W, 24);
      ctx.fillStyle = 'rgba(6, 18, 34, 0.19)';
      ctx.fillRect(0, seaTop + 68, W, H - (seaTop + 68));

      // Crisp horizon line + distant island shoreline shadows & harbor lantern glints
      ctx.fillStyle = '#2e7aa1';
      ctx.fillRect(0, seaTop, W, 2);
      ctx.fillStyle = '#4da3c9';
      ctx.fillRect(496, seaTop, 112, 2);
      ctx.fillStyle = 'rgba(6, 18, 34, 0.45)';
      ctx.fillRect(16, seaTop + 2, 108, 3);
      ctx.fillRect(488, seaTop + 2, 132, 3);

      // Moonlit shimmer ripples & harbor lantern reflections
      const moonRipple = Math.round(Math.sin(t * 2.4) * 2);
      ctx.fillStyle = '#9cd9ed';
      ctx.fillRect(542 + moonRipple, 219, 14, 2);
      ctx.fillRect(546 - moonRipple, 224, 10, 2);
      ctx.fillStyle = '#64b5d4';
      ctx.fillRect(548 + moonRipple, 230, 8, 2);
      ctx.fillRect(550, 236, 4, 2);

      ctx.fillStyle = ((Math.floor(t * 4) & 1) === 0) ? '#d99e43' : '#a3732c';
      ctx.fillRect(71, 219, 4, 2);
      ctx.fillRect(72, 224, 2, 2);
      ctx.fillRect(547, 219, 4, 2);
      ctx.fillRect(548, 224, 2, 2);

      // Drifting surface ocean glints across left, right, horizon & foreground waters
      const waves = [
        [24, 226, 12, 7.2], [178, 232, 14, 5.4], [326, 224, 10, 8.1], [442, 236, 12, 6.0],
        [14, 274, 10, 6.4], [28, 298, 12, 5.2], [602, 268, 10, 6.8], [610, 296, 12, 5.6],
        [44, 326, 14, 7.6], [164, 336, 12, 5.8], [296, 328, 16, 6.9], [438, 340, 12, 6.1], [568, 332, 14, 5.5]
      ];
      for (let i = 0; i < waves.length; i++) {
        const [bx, by, len, sp] = waves[i];
        const wx = Math.round((bx + t * sp) % (W + 32)) - 16;
        ctx.fillStyle = (i % 2 === 0) ? '#78cde8' : '#a8e4f5';
        ctx.fillRect(wx, by, len, 2);
      }

      // 7. Foreground Archipelago Island seated directly in the ocean with shoreline surf & water reflection
      const TILE = 48;
      const COLS = 11;
      const ix = 56;
      const iw = COLS * TILE;
      const foamImg = this._getStSprite('water_foam', 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Tileset/Water Foam.png');
      const tileImg = this._getStSprite('tile_1', 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Tileset/Tilemap_color1.png');

      // Water shadow directly underneath the island shoreline + warm campfire reflection on the ocean
      ctx.fillStyle = 'rgba(6, 20, 38, 0.24)';
      ctx.fillRect(ix + 10, 305, iw - 20, 14);
      ctx.fillStyle = 'rgba(6, 20, 38, 0.34)';
      ctx.fillRect(ix + 16, 304, iw - 32, 8);

      const fireReflectShift = Math.round(Math.sin(t * 4.5) * 2);
      ctx.fillStyle = 'rgba(255, 192, 82, 0.62)';
      ctx.fillRect(415 + fireReflectShift, 315, 16, 2);
      ctx.fillStyle = 'rgba(255, 164, 58, 0.48)';
      ctx.fillRect(418 - fireReflectShift, 320, 12, 2);
      ctx.fillStyle = 'rgba(255, 213, 96, 0.34)';
      ctx.fillRect(421 + fireReflectShift, 325, 6, 2);

      // Phase-offset rolling ocean surf wrapping smoothly around the island shoreline BEFORE the grass plateau
      if (this._isStImgReady(foamImg)) {
        const isTs16 = foamImg.width >= 2048;
        ctx.save();
        ctx.globalAlpha = 0.58;
        if (isTs16) {
          const foamFrame = Math.floor(t * 7) % 16;
          for (let col = 0; col < COLS; col++) {
            const isLeft = col === 0;
            const isRight = col === COLS - 1;
            const colFrame = (foamFrame + col * 5) % 16;
            const fx = colFrame * 192 + (isLeft ? 48 : 64);
            const fw = (isLeft || isRight) ? 80 : 64;
            const dx = isLeft ? (ix - 6) : (ix + col * TILE);
            const dw = (isLeft || isRight) ? (TILE + 6) : TILE;
            this._drawPixelSprite(ctx, foamImg, fx, 114, fw, 32, dx, 293, dw, 26);
          }
        } else {
          const fw = Math.round(foamImg.width / 4) || foamImg.height;
          const fh = foamImg.height || 128;
          for (let col = 0; col < COLS; col++) {
            const fr = (Math.floor(t * 5) + col) % 4;
            this._drawPixelSprite(ctx, foamImg, fr * fw, 0, fw, fh, ix + col * TILE, 290, TILE, 26);
          }
        }
        ctx.restore();
      } else {
        const foamPulse = Math.floor(t * 2.5) % 2;
        ctx.fillStyle = 'rgba(138, 220, 242, 0.65)';
        ctx.fillRect(ix - 4 - foamPulse * 2, 306, iw + 8 + foamPulse * 4, 3);
      }

      // Delicate pixel surf lines kissing left, right & front waterlines
      const surfShift = (Math.floor(t * 3) & 1) ? 2 : 0;
      ctx.fillStyle = '#9ce7fa';
      ctx.fillRect(ix - 7 - surfShift, 282, 5, 2);
      ctx.fillRect(ix + iw + 2 + surfShift, 284, 5, 2);
      ctx.fillStyle = 'rgba(142, 224, 245, 0.72)';
      ctx.fillRect(ix + 18 - surfShift, 316, 20, 2);
      ctx.fillRect(ix + 150 + surfShift, 318, 24, 2);
      ctx.fillRect(ix + 296 - surfShift, 317, 22, 2);
      ctx.fillRect(ix + 456 + surfShift, 316, 18, 2);

      if (this._isStImgReady(tileImg)) {
        // Real 9-slice grass island plateau merged cleanly down to its natural dark-green coastal lip
        for (let col = 0; col < COLS; col++) {
          const sx = col === 0 ? 0 : (col === COLS - 1 ? 128 : 64);
          this._drawPixelSprite(ctx, tileImg, sx, 0, 64, 48, ix + col * TILE, 246, TILE, 36);
          this._drawPixelSprite(ctx, tileImg, sx, 128, 64, 64, ix + col * TILE, 268, TILE, 40);
        }
      } else {
        ctx.fillStyle = '#2d5c2d';
        ctx.fillRect(ix + 2, 274, iw - 4, 10);
        ctx.fillStyle = '#4c8f40';
        ctx.fillRect(ix + 8, 256, iw - 16, 22);
        ctx.fillStyle = '#68b34c';
        ctx.fillRect(ix + 14, 250, iw - 28, 12);
      }

      // 8. Native-scale world props from ABYSSEA assets
      const tree1Img = this._getStSprite('tree1', 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Resources/Wood/Trees/Tree1.png');
      const tree4Img = this._getStSprite('tree4', 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Resources/Wood/Trees/Tree4.png');
      const houseImg = this._getStSprite('b_house1_blue', 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Blue Buildings/House1.png');
      const bushImg = this._getStSprite('bush1', 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Decorations/Bushes/Bushe1.png');
      const rockImg = this._getStSprite('rock1', 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Decorations/Rocks/Rock1.png');
      const fireImg = this._getStSprite('campfireAnim', 'assets/packs/FantasyDungeonAdventure_v1.0/FantasyDungeonAdventure/10_Overworld/Campsite/campfire_anim_6f.png');

      if (this._isStImgReady(tree1Img)) {
        const tFrame = Math.floor(t * 3.5) % 8;
        this._drawPixelSprite(ctx, tree1Img, tFrame * 192, 0, 192, 256, 62, 138, 102, 136);
      }
      if (this._isStImgReady(houseImg)) {
        this._drawPixelSprite(ctx, houseImg, 0, 0, houseImg.width, houseImg.height, 146, 174, 72, 108);
        // Warm cabin lantern window & subtle chimney smoke puffs
        ctx.fillStyle = '#ffd54f';
        ctx.fillRect(178, 240, 6, 6);
        for (let k = 0; k < 3; k++) {
          const sp = (t * 8 + k * 7) % 21;
          ctx.fillStyle = 'rgba(180, 205, 225, 0.35)';
          ctx.fillRect(Math.round(166 + Math.sin(t * 1.8 + k) * 3), Math.round(176 - sp), 3, 2);
        }
      }
      if (this._isStImgReady(tree4Img)) {
        const t4Frame = Math.floor(t * 3.2 + 2) % 8;
        this._drawPixelSprite(ctx, tree4Img, t4Frame * 192, 0, 192, 192, 474, 182, 96, 96);
      }
      if (this._isStImgReady(bushImg)) {
        if (bushImg.width >= bushImg.height * 3) {
          const bFrame = Math.floor(t * 2.5) % 8;
          this._drawPixelSprite(ctx, bushImg, bFrame * 128, 0, 128, 128, 456, 236, 52, 52);
        } else {
          this._drawPixelSprite(ctx, bushImg, 0, 0, bushImg.width, bushImg.height, 464, 240, 38, 38);
        }
      }
      if (this._isStImgReady(rockImg)) {
        this._drawPixelSprite(ctx, rockImg, 0, 0, rockImg.width, rockImg.height, 536, 252, 32, 32);
      }

      // 9. Campfire & quantized Bayer dithered warm island light pool
      const firePulse = ((Math.floor(t * 8)) & 1) ? 4 : 0;
      this._drawDitherLight(ctx, 424, 268, 44 + firePulse, 16, 'rgba(255, 166, 61, 0.16)', 'rgba(255, 213, 79, 0.24)');
      if (this._isStImgReady(fireImg)) {
        const cFrame = Math.floor(t * 9) % 6;
        const fw = fireImg.width >= fireImg.height * 4 ? Math.round(fireImg.width / 6) : 16;
        const fh = fireImg.height || 16;
        this._drawPixelSprite(ctx, fireImg, cFrame * fw, 0, fw, fh, 408, 242, 32, 32);
      } else {
        ctx.fillStyle = '#ff9800';
        ctx.fillRect(418, 254, 12, 14);
        ctx.fillStyle = '#ffe082';
        ctx.fillRect(422, 250, 4, 12);
      }
      for (let e = 0; e < 5; e++) {
        const phase = (t * 18 + e * 7) % 32;
        const ex = 423 + Math.round(Math.sin(t * 3 + e * 2.1) * 5);
        const ey = Math.round(244 - phase);
        ctx.fillStyle = (e & 1) ? '#ffe082' : '#ff7043';
        ctx.fillRect(ex, ey, 2, 2);
      }

      // 10. Active Player Skin Hero + Sheep at crisp pixel resolution
      const useIdle = Boolean(isSave);
      const heroKey = useIdle ? 'hana_idle' : 'hana_run';
      const heroImg = this._getStSprite(heroKey, 'assets/sprites_extra/hana_caraka/' + (useIdle ? 'idle.png' : 'run.png'));
      const sheepKey = useIdle ? 'sheep_idle' : 'sheep_move';
      const sheepImg = this._getStSprite(sheepKey, 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Resources/Meat/Sheep/Sheep_Move.png');

      const heroX = useIdle ? 326 : Math.round(220 + normP * 116);
      const sheepX = useIdle ? 268 : (heroX - 60);

      if (this._isStImgReady(sheepImg)) {
        const isV15Sh = sheepImg.width >= sheepImg.height * 3;
        const sw = isV15Sh ? (Math.round(sheepImg.width / 4) || sheepImg.height) : 128;
        const sh = isV15Sh ? sheepImg.height : 128;
        const sFrames = isV15Sh ? 4 : (useIdle ? Math.max(1, Math.floor(sheepImg.width / 128)) : 4);
        const sf = Math.floor(t * (useIdle ? 3.5 : 5.5)) % sFrames;
        this._drawPixelSprite(ctx, sheepImg, sf * sw, 0, sw, sh, sheepX, 226, 56, 56);
      }
      if (this._isStImgReady(heroImg)) {
        const hFrames = Math.max(1, Math.floor(heroImg.width / 79));
        const hf = Math.floor(t * (useIdle ? 5 : 10)) % hFrames;
        this._drawPixelSprite(ctx, heroImg, hf * 79, 0, 79, 79, heroX - 51, 170, 198, 198);
      }
    }

    _renderDungeonDiorama(ctx, t, normP) {
      const W = 640;
      const FDA = 'assets/packs/FantasyDungeonAdventure_v1.0/FantasyDungeonAdventure/';

      // 1. Deep subterranean cavern vault backdrop
      this._drawDitherBands(ctx, W, [
        [0, 62, '#07050b'],
        [62, 126, '#0c0914'],
        [126, 182, '#130e1e'],
        [182, 360, '#09070e']
      ]);

      // Floating cavern dust specks in upper darkness
      const dustTick = Math.floor(t * 6);
      for (let d = 0; d < 16; d++) {
        const dx = (44 + d * 38 + ((dustTick + d) % 11)) % W;
        const dy = 48 + ((d * 31 + Math.round(t * 4)) % 110);
        ctx.fillStyle = (d % 3 === 0) ? '#544666' : '#31283d';
        ctx.fillRect(dx, dy, 2, 2);
      }

      // 2. Load real FantasyDungeonAdventure tiles & props
      const wallImg = this._getStSprite('pradera_wall', FDA + '01_Dungeon_Tiles/Stone_Dungeon/Walls/Faces_16x32/face_mid.png');
      const bannerImg = this._getStSprite('pradera_wallBanner', FDA + '01_Dungeon_Tiles/Stone_Dungeon/Walls/Faces_16x32/face_banner_red.png');
      const floorImg = this._getStSprite('pradera_floor1', FDA + '01_Dungeon_Tiles/Stone_Dungeon/Floors/floor_1.png');
      const floorCrack = this._getStSprite('pradera_floor2', FDA + '01_Dungeon_Tiles/Stone_Dungeon/Floors/floor_cracked.png');
      const doorClosed = this._getStSprite('st_stone_door_closed', FDA + '01_Dungeon_Tiles/Stone_Dungeon/Walls/Faces_16x32/door_iron_closed.png');
      const doorOpen = this._getStSprite('st_stone_door_open', FDA + '01_Dungeon_Tiles/Stone_Dungeon/Walls/Faces_16x32/door_iron_open.png');
      const pillarImg = this._getStSprite('pradera_pillar', FDA + '02_Props/Statues_Pillars/pillar_stone_16x48.png');
      const torchImg = this._getStSprite('torch_orange', FDA + '02_Props/Lights/wall_torch_orange_anim_6f.png');
      const brazierImg = this._getStSprite('brazier_orange', FDA + '02_Props/Lights/brazier_orange_16x32_anim_6f.png');
      const statueImg = this._getStSprite('statue_knight', FDA + '02_Props/Statues_Pillars/statue_knight_16x32.png');
      const chestImg = this._getStSprite('st_fda_chest_gold', FDA + '02_Props/Chests/chest_gold_closed.png');
      const webTL = this._getStSprite('st_cobweb_tl', FDA + '02_Props/Bones_Webs_Chains/cobweb_TL.png');
      const webTR = this._getStSprite('st_cobweb_tr', FDA + '02_Props/Bones_Webs_Chains/cobweb_TR.png');
      const skelImg = this._getStSprite('skeleton', 'assets/sprites_extra/enemies/skeleton_warrior_rogue_48px_4f.png');

      // Stone cornice ridge above corridor wall
      ctx.fillStyle = '#1b1626';
      ctx.fillRect(0, 166, W, 8);
      ctx.fillStyle = '#292238';
      ctx.fillRect(0, 172, W, 3);

      // 3. Corridor wall tiles (14 columns x 48px = exact 3x pixel scale across 640px)
      const COLS = 14;
      const WALL_X0 = -16;
      const WALL_Y = 174;
      for (let col = 0; col < COLS; col++) {
        const wx = WALL_X0 + col * 48;
        if (this._isStImgReady(wallImg)) {
          this._drawPixelSprite(ctx, wallImg, 0, 0, 16, 32, wx, WALL_Y, 48, 96);
        } else {
          ctx.fillStyle = '#2b2638';
          ctx.fillRect(wx, WALL_Y, 46, 96);
        }
        if ((col === 3 || col === 10) && this._isStImgReady(bannerImg)) {
          this._drawPixelSprite(ctx, bannerImg, 0, 0, 16, 32, wx, WALL_Y, 48, 96);
        }
      }

      // 4. Flagstone floor rows (2 rows x 48px at exact TILE_SIZE = 48 + foreground slab)
      for (let row = 0; row < 2; row++) {
        const fy = 268 + row * 40;
        for (let col = 0; col < COLS; col++) {
          const fx = WALL_X0 + col * 48;
          const fSrc = ((col + row) % 3 === 1 && this._isStImgReady(floorCrack)) ? floorCrack : floorImg;
          if (this._isStImgReady(fSrc)) {
            this._drawPixelSprite(ctx, fSrc, 0, 0, 16, 16, fx, fy, 48, 40);
          } else {
            ctx.fillStyle = (col + row) & 1 ? '#1e1a28' : '#252030';
            ctx.fillRect(fx, fy, 48, 40);
          }
        }
      }
      ctx.fillStyle = '#07050a';
      ctx.fillRect(0, 342, W, 18);

      // Quantized shadow vignette framing outer wings
      ctx.fillStyle = 'rgba(6, 4, 12, 0.50)';
      ctx.fillRect(0, 174, 84, 168);
      ctx.fillRect(556, 174, 84, 168);

      // 5. Central Iron Archway Gate (clicks open smoothly as progress passes midpoint)
      const isGateOpen = normP >= 0.56;
      const gateImg = isGateOpen ? doorOpen : doorClosed;
      if (this._isStImgReady(gateImg)) {
        this._drawPixelSprite(ctx, gateImg, 0, 0, 16, 32, 296, 174, 48, 96);
      } else {
        ctx.fillStyle = isGateOpen ? '#050408' : '#3a3548';
        ctx.fillRect(298, 184, 44, 86);
      }
      if (isGateOpen) {
        this._drawDitherLight(ctx, 320, 260, 32, 14, 'rgba(130, 177, 255, 0.14)', 'rgba(179, 136, 255, 0.18)');
      }

      // 6. Cobwebs, Knight Statue, Chest & Carved Stone Pillars
      if (this._isStImgReady(webTL)) this._drawPixelSprite(ctx, webTL, 0, 0, 16, 16, 0, 174, 40, 40);
      if (this._isStImgReady(webTR)) this._drawPixelSprite(ctx, webTR, 0, 0, 16, 16, W - 40, 174, 40, 40);
      if (this._isStImgReady(pillarImg)) {
        this._drawPixelSprite(ctx, pillarImg, 0, 0, 16, 48, 56, 152, 44, 132);
        this._drawPixelSprite(ctx, pillarImg, 0, 0, 16, 48, 540, 152, 44, 132);
      }
      if (this._isStImgReady(statueImg)) {
        this._drawPixelSprite(ctx, statueImg, 0, 0, 16, 32, 128, 204, 36, 72);
      }
      if (this._isStImgReady(chestImg)) {
        this._drawPixelSprite(ctx, chestImg, 0, 0, chestImg.width, chestImg.height, 480, 250, 32, 32);
      }

      // 7. Flickering Wall Torches, Standing Braziers & Quantized Bayer Light Pools
      const torchFr = Math.floor(t * 9) % 6;
      const pulse = (torchFr & 1) ? 4 : 0;
      this._drawDitherLight(ctx, 232, 248, 58 + pulse, 28, 'rgba(255, 128, 32, 0.16)', 'rgba(255, 195, 72, 0.24)');
      this._drawDitherLight(ctx, 408, 248, 58 - pulse, 28, 'rgba(255, 128, 32, 0.16)', 'rgba(255, 195, 72, 0.24)');

      if (this._isStImgReady(torchImg)) {
        this._drawPixelSprite(ctx, torchImg, torchFr * 16, 0, 16, 16, 236, 196, 32, 32);
        this._drawPixelSprite(ctx, torchImg, ((torchFr + 2) % 6) * 16, 0, 16, 16, 372, 196, 32, 32);
      }
      if (this._isStImgReady(brazierImg)) {
        this._drawPixelSprite(ctx, brazierImg, ((torchFr + 1) % 6) * 16, 0, 16, 32, 196, 212, 32, 64);
        this._drawPixelSprite(ctx, brazierImg, ((torchFr + 4) % 6) * 16, 0, 16, 32, 412, 212, 32, 64);
      }

      for (let s = 0; s < 6; s++) {
        const bx = (s & 1) ? 211 : 427;
        const life = (t * 24 + s * 8) % 30;
        ctx.fillStyle = (s % 2 === 0) ? '#ffd54f' : '#ff7043';
        ctx.fillRect(bx + Math.round(Math.sin(t * 4 + s) * 4), Math.round(220 - life), 2, 2);
      }

      // 8. Lurking skeleton warrior on right wing + Active Hero marching toward gate
      if (this._isStImgReady(skelImg)) {
        const skFw = skelImg.height || 48;
        const skFrames = Math.max(1, Math.floor((skelImg.width || skFw) / skFw));
        const sf = Math.floor(t * 5) % skFrames;
        this._drawPixelSprite(ctx, skelImg, sf * skFw, 0, skFw, skFw, 536, 224, 68, 68, true);
      }

      const heroImg = this._getStSprite('hana_run', 'assets/sprites_extra/hana_caraka/run.png');
      if (this._isStImgReady(heroImg)) {
        const hFrames = Math.max(1, Math.floor(heroImg.width / 79));
        const hf = Math.floor(t * 10) % hFrames;
        const heroX = Math.round(108 + normP * 164);
        this._drawPixelSprite(ctx, heroImg, hf * 79, 0, 79, 79, heroX - 45, 174, 198, 198);
      }
    }

    _drawDitherSeam(ctx, w, y, color, step = 4, size = 2) {
      ctx.fillStyle = color;
      const ry = Math.round(y);
      for (let x = 0; x < w; x += step) {
        ctx.fillRect(x, ry, size, size);
      }
    }

    _startDeathDiorama() {
      if (this._deathDioramaState && this._deathDioramaState.active) return;
      const canvas = document.getElementById('death-pixel-canvas');
      if (!canvas || typeof canvas.getContext !== 'function') return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const startMs = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      const state = { active: true, rafId: null, startMs };
      this._deathDioramaState = state;

      const getRecovery = () => {
        const p = this.game && this.game.player;
        if (!p || !(p.deadTimer > 0)) return 1;
        const maxD = p.deadMax || 10.0;
        return Math.max(0, Math.min(1, 1 - (p.deadTimer / maxD)));
      };

      const step = (nowTs) => {
        if (!state.active || this._deathDioramaState !== state) return;
        const now = (typeof nowTs === 'number') ? nowTs : Date.now();
        const t = Math.max(0, (now - state.startMs) / 1000);
        this._renderDeathDiorama(ctx, t, getRecovery());
        if (typeof requestAnimationFrame === 'function') {
          state.rafId = requestAnimationFrame(step);
        }
      };

      this._renderDeathDiorama(ctx, 0, getRecovery());
      if (typeof requestAnimationFrame === 'function') {
        state.rafId = requestAnimationFrame(step);
      }
    }

    _stopDeathDiorama() {
      const state = this._deathDioramaState;
      if (!state) return;
      state.active = false;
      if (state.rafId !== null && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(state.rafId);
      }
      this._deathDioramaState = null;
    }

    _renderDeathDiorama(ctx, t, recovery = 0) {
      const W = 640;
      const H = 360;
      const TS = 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/';
      const FDA = 'assets/packs/FantasyDungeonAdventure_v1.0/FantasyDungeonAdventure/';
      ctx.imageSmoothingEnabled = false;

      // 1. Dusk Astral Sky Bands + Horizontal 2px Checker Seams
      this._drawDitherBands(ctx, W, [
        [0, 56, '#09040c'],
        [56, 108, '#110815'],
        [108, 154, '#1a0b1a'],
        [154, 194, '#25101e'],
        [194, 224, '#321623']
      ]);
      this._drawDitherSeam(ctx, W, 55, '#110815');
      this._drawDitherSeam(ctx, W, 107, '#1a0b1a');
      this._drawDitherSeam(ctx, W, 153, '#25101e');
      this._drawDitherSeam(ctx, W, 193, '#321623');

      // Outer sky stars (leaving central HUD text zone calm & uncluttered)
      const starCoords = [
        [34, 22], [72, 48], [116, 18], [148, 72], [58, 96], [96, 126],
        [496, 26], [534, 86], [584, 34], [608, 104], [468, 120], [568, 138]
      ];
      const twinkleTick = Math.floor(t * 2.5);
      for (let s = 0; s < starCoords.length; s++) {
        const bright = ((twinkleTick + s) % 4) === 0;
        ctx.fillStyle = bright ? '#f2dfcc' : '#857094';
        ctx.fillRect(starCoords[s][0], starCoords[s][1], bright ? 2 : 1, bright ? 2 : 1);
      }

      // Crisp pixel Crescent Moon upper-right (integer fillRect silhouette)
      const moonRows = [
        [2, 5], [1, 4], [0, 3], [0, 3], [0, 3], [0, 3], [0, 4], [1, 5], [2, 6]
      ];
      for (let mr = 0; mr < moonRows.length; mr++) {
        ctx.fillStyle = (mr === 0 || mr === moonRows.length - 1) ? '#bda999' : '#f2e4cc';
        ctx.fillRect(540 + moonRows[mr][0] * 2, 34 + mr * 2, moonRows[mr][1] * 2, 2);
      }

      // Drifting dark dusk clouds & distant horizon islets
      const cOff1 = Math.round((t * 4) % (W + 120)) - 90;
      const cOff2 = Math.round((t * 2.6 + 260) % (W + 140)) - 100;
      this._drawPixelCloud(ctx, cOff1, 146, 56, '#1b0e22', '#261530', '#120818');
      this._drawPixelCloud(ctx, cOff2, 166, 68, '#1f1024', '#2c1732', '#140919');

      ctx.fillStyle = '#150914';
      ctx.fillRect(18, 206, 92, 18);
      ctx.fillRect(36, 198, 48, 10);
      ctx.fillRect(528, 208, 94, 16);
      ctx.fillRect(552, 200, 44, 10);
      ctx.fillStyle = '#d9823b';
      ctx.fillRect(58, 200, 2, 2);
      ctx.fillRect(574, 202, 2, 2);

      // 2. Twilight Archipelago Ocean + Stepped Water Shimmer
      this._drawDitherBands(ctx, W, [
        [224, 248, '#0b1420'],
        [248, 286, '#0f1b2b'],
        [286, 330, '#0b1522'],
        [330, H, '#070e18']
      ]);
      this._drawDitherSeam(ctx, W, 247, '#0f1b2b');
      this._drawDitherSeam(ctx, W, 285, '#0b1522');
      this._drawDitherSeam(ctx, W, 329, '#070e18');

      // Twilight dusk wave shimmer dashes (subtle pixel surface ripples, no harsh daytime tiles)
      const waveTick = Math.floor(t * 3);
      for (let wv = 0; wv < 20; wv++) {
        const rx = Math.round(((wv * 53 + waveTick * ((wv & 1) ? 2 : 1)) % (W - 28)) + 8);
        const ry = 230 + (wv % 7) * 18;
        const wLen = 10 + (wv % 3) * 6;
        ctx.fillStyle = (wv % 3 === 0) ? '#264463' : '#182c42';
        ctx.fillRect(rx, ry, wLen, 2);
      }

      // Warm campfire reflection shimmer below island in twilight water
      for (let r = 0; r < 5; r++) {
        const refX = 310 + Math.round(Math.sin(Math.floor(t * 6) + r * 1.4) * 5) - Math.max(0, 8 - r);
        const refY = 296 + r * 8;
        ctx.fillStyle = (r & 1) ? '#5e3120' : '#854929';
        ctx.fillRect(refX, refY, Math.max(6, 20 - r * 3), 2);
      }

      // 3. Sanctuary Shrine Isle Grounded in Dusk-Tinted Animated Water Foam
      const foamImg = this._getStSprite('water_foam', TS + 'Terrain/Tileset/Water Foam.png');
      const tileImg = this._getStSprite('tile_1', TS + 'Terrain/Tileset/Tilemap_color1.png');
      const ISLE_X = 96;
      const ISLE_W = 448;

      if (this._isStImgReady(foamImg)) {
        const fFr = Math.floor(t * 7) % 16;
        for (let fx = ISLE_X - 4; fx <= ISLE_X + ISLE_W - 28; fx += 32) {
          this._drawPixelSprite(ctx, foamImg, fFr * 192 + 56, 72, 80, 64, fx, 266, 40, 26);
        }
        ctx.fillStyle = 'rgba(11, 20, 32, 0.46)';
        ctx.fillRect(ISLE_X - 8, 266, ISLE_W + 18, 28);
      }
      ctx.fillStyle = 'rgba(5, 10, 18, 0.62)';
      ctx.fillRect(ISLE_X + 2, 286, ISLE_W - 4, 4);

      // Organic stepped earthen cliff strata (asymmetric rock bricks)
      ctx.fillStyle = '#3b2926';
      ctx.fillRect(ISLE_X, 264, ISLE_W, 9);
      ctx.fillStyle = '#281b1c';
      ctx.fillRect(ISLE_X, 273, ISLE_W, 8);
      ctx.fillStyle = '#191114';
      ctx.fillRect(ISLE_X, 281, ISLE_W, 5);
      for (let rx = ISLE_X + 10; rx < ISLE_X + ISLE_W - 18; rx += 22) {
        const odd = (Math.floor(rx / 22)) & 1;
        ctx.fillStyle = odd ? '#241819' : '#4a342e';
        ctx.fillRect(rx, odd ? 267 : 269, 10, 3);
        ctx.fillStyle = '#170f12';
        ctx.fillRect(rx + 6, odd ? 276 : 274, 8, 3);
      }
      ctx.fillStyle = '#1d2d20';
      ctx.fillRect(ISLE_X, 263, ISLE_W, 2);

      // Top grass terrain tiles + dusk shade wash
      for (let tx = ISLE_X; tx < ISLE_X + ISLE_W; tx += 32) {
        const sx = tx === ISLE_X ? 0 : (tx + 32 >= ISLE_X + ISLE_W ? 128 : 64);
        if (this._isStImgReady(tileImg)) {
          this._drawPixelSprite(ctx, tileImg, sx, 0, 64, 64, tx, 240, 32, 26);
        } else {
          ctx.fillStyle = '#334d36';
          ctx.fillRect(tx, 240, 32, 26);
        }
      }
      ctx.fillStyle = 'rgba(14, 10, 26, 0.44)';
      ctx.fillRect(ISLE_X, 240, ISLE_W, 25);

      // 4. Sanctuary Props & Ambient Shrine Lights
      const deadTree = this._getStSprite('st_dead_tree_big', FDA + '10_Overworld/Dark_Forest/dead_tree_big_32x48.png');
      const darkPine = this._getStSprite('st_dark_pine', FDA + '10_Overworld/Dark_Forest/dark_pine_32x40.png');
      const colImg = this._getStSprite('st_broken_column', FDA + '10_Overworld/Ruins/broken_column_16x48.png');
      const grave1 = this._getStSprite('st_gravestone_1', FDA + '10_Overworld/Graveyard/gravestone_1.png');
      const grave3 = this._getStSprite('st_gravestone_3', FDA + '10_Overworld/Graveyard/gravestone_3.png');
      const rubbleImg = this._getStSprite('st_rubble_1', FDA + '10_Overworld/Ruins/rubble_1.png');
      const skullImg = this._getStSprite('st_skull_drop', FDA + '07_Items/Monster_Drops/skull.png');
      const shrineImg = this._getStSprite('st_sanctuary_shrine', FDA + '02_Props/Altars_Shrines/shrine_32x32_anim_4f.png');
      const brazierImg = this._getStSprite('brazier_orange', FDA + '02_Props/Lights/brazier_orange_16x32_anim_6f.png');
      const candlesImg = this._getStSprite('st_candles_group', FDA + '02_Props/Lights/candles_group_anim_4f.png');
      const fireImg = this._getStSprite('campfireAnim', FDA + '10_Overworld/Campsite/campfire_anim_6f.png');

      this._drawPixelSprite(ctx, deadTree, 0, 0, 32, 48, 108, 162, 64, 96);
      this._drawPixelSprite(ctx, colImg, 0, 0, 16, 48, 172, 166, 32, 96);
      this._drawPixelSprite(ctx, grave3, 0, 0, 16, 16, 148, 228, 26, 26);
      this._drawPixelSprite(ctx, skullImg, 0, 0, 16, 16, 186, 242, 16, 16);
      this._drawPixelSprite(ctx, darkPine, 0, 0, 32, 40, 456, 178, 64, 80);
      this._drawPixelSprite(ctx, grave1, 0, 0, 16, 16, 408, 228, 26, 26);
      this._drawPixelSprite(ctx, rubbleImg, 0, 0, 16, 16, 492, 240, 22, 22);

      // Central Sanctuary Shrine
      this._drawDitherLight(ctx, 274, 226, 28, 16, 'rgba(77, 208, 225, 0.14)', 'rgba(178, 235, 242, 0.18)');
      if (this._isStImgReady(shrineImg)) {
        const shF = Math.floor(t * 4) % 4;
        this._drawPixelSprite(ctx, shrineImg, shF * 32, 0, 32, 32, 242, 194, 64, 64);
      }

      // Flanking Orange Braziers & Central Campfire Light Pools
      const fFr = Math.floor(t * 8) % 6;
      const pulse = (fFr & 1) ? 4 : 0;
      this._drawDitherLight(ctx, 220, 220, 26 + pulse, 16, 'rgba(255, 138, 44, 0.14)', 'rgba(255, 195, 72, 0.22)');
      this._drawDitherLight(ctx, 442, 220, 26 - pulse, 16, 'rgba(255, 138, 44, 0.14)', 'rgba(255, 195, 72, 0.22)');
      this._drawDitherLight(ctx, 320, 250, 56 + pulse, 22, 'rgba(255, 138, 44, 0.16)', 'rgba(255, 213, 79, 0.26)');

      this._drawPixelSprite(ctx, brazierImg, ((fFr + 1) % 6) * 16, 0, 16, 32, 204, 196, 32, 64);
      this._drawPixelSprite(ctx, brazierImg, ((fFr + 4) % 6) * 16, 0, 16, 32, 426, 196, 32, 64);
      if (this._isStImgReady(candlesImg)) {
        const caF = Math.floor(t * 6) % 4;
        this._drawPixelSprite(ctx, candlesImg, caF * 16, 0, 16, 16, 280, 234, 24, 24);
      }
      if (this._isStImgReady(fireImg)) {
        const fw = fireImg.width >= fireImg.height * 4 ? Math.round(fireImg.width / 6) : 16;
        const fh = fireImg.height || 16;
        this._drawPixelSprite(ctx, fireImg, fFr * fw, 0, fw, fh, 304, 228, 32, 32);
      }

      // Rising hearth embers
      for (let e = 0; e < 6; e++) {
        const eLife = (t * 20 + e * 7) % 34;
        const ex = 319 + Math.round(Math.sin(t * 3 + e * 1.9) * 5);
        const ey = Math.round(234 - eLife);
        ctx.fillStyle = (e & 1) ? '#ffe082' : '#ff7043';
        ctx.fillRect(ex, ey, 2, 2);
      }

      // 5. Player Skin Resting by Fire + Descending Soul Wisp Returning Before Respawn
      ctx.fillStyle = 'rgba(10, 6, 16, 0.48)';
      ctx.fillRect(368, 253, 28, 5);
      const heroImg = this._getStSprite('hana_idle', 'assets/sprites_extra/hana_caraka/idle.png');
      if (this._isStImgReady(heroImg)) {
        const hFrames = Math.max(1, Math.floor(heroImg.width / 79));
        const hf = Math.floor(t * 5) % hFrames;
        this._drawPixelSprite(ctx, heroImg, hf * 79, 0, 79, 79, 283, 155, 198, 198, true);
      }

      // Soul Wisp arcs back from Shrine toward Hero as recovery progresses 0 -> 1
      const rec = Math.max(0, Math.min(1, recovery));
      const arcLift = Math.round(Math.sin(rec * Math.PI) * 26);
      const wx = Math.round(274 + (382 - 274) * rec + Math.sin(Math.floor(t * 7) * 0.7) * 2);
      const wy = Math.round(182 + (238 - 182) * rec - arcLift + ((Math.floor(t * 6) & 1) ? -1 : 0));
      ctx.fillStyle = '#163442';
      ctx.fillRect(wx - 4, wy - 5, 8, 10);
      ctx.fillStyle = '#4dd0e1';
      ctx.fillRect(wx - 3, wy - 4, 6, 8);
      ctx.fillRect(wx - 1, wy - 6, 2, 2);
      ctx.fillStyle = '#e0f7fa';
      ctx.fillRect(wx - 2, wy - 2, 4, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(wx - 1, wy - 1, 2, 2);
    }

    triggerTitleIntro() {
      const titleScreen = document.getElementById('title-screen');
      if (!titleScreen) return;
      if (this._titleIntroTimer) {
        clearTimeout(this._titleIntroTimer);
        this._titleIntroTimer = null;
      }
      titleScreen.classList.remove('title-booting', 'title-entering');
      this.renderTitleScreen();
      void titleScreen.offsetWidth;
      titleScreen.classList.add('title-entering');
      this._titleIntroTimer = setTimeout(() => {
        titleScreen.classList.remove('title-entering');
        this._titleIntroTimer = null;
      }, 1450);
    }

    hideTitleScreen() {
      this._stopDeathDiorama();
      if (this._titleIntroTimer) {
        clearTimeout(this._titleIntroTimer);
        this._titleIntroTimer = null;
      }
      const titleScreen = document.getElementById('title-screen');
      if (titleScreen) {
        titleScreen.classList.remove('title-booting', 'title-entering');
        titleScreen.classList.add('hidden');
      }
      document.getElementById('hud-root').classList.remove('hidden');
      const bHud = document.getElementById('bottom-hud');
      if (bHud) bHud.classList.remove('hidden');
      this.closeMenuDropdown();
      this._lastResKey = '';
      this._lastHotbarKey = '';
      this.game.started = true;
      this.game.paused = false;
      this.game.uiDirty = true;
      if (Abyssea.Audio && typeof Abyssea.Audio.setMood === 'function') {
        Abyssea.Audio.setMood('meadow', { delayMs: 780, fadeOutMs: 300, fadeInMs: 4600 });
      }
      this.updateHUD(true);
      this.lastPlayerInputTime = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
      this.showControlsHelper('entry', 2800);
    }

    showTitleScreen(opts = null) {
      if (!(opts && opts.skipSave) && this.game && this.game.started && !(this.game.isPlayerDead && this.game.isPlayerDead())) {
        this.game.saveSys.save(this.game, this.game.currentSlot || 1, true);
      }
      this.hideTooltip();
      this.closeMenuDropdown();
      this.closeModal();
      this.closeSecretConsole();
      this.hideControlsHelper(true);
      const deathOverlay = document.getElementById('death-overlay');
      if (deathOverlay) deathOverlay.classList.add('hidden');
      this._stopDeathDiorama();
      const altarStack = document.getElementById('altar-blessing-stack');
      if (altarStack) {
        altarStack.classList.add('hidden');
        altarStack.innerHTML = '';
      }
      this._lastAltarKey = '';
      if (this.game) {
        if (this.game.clearTransientInputs) this.game.clearTransientInputs();
        if (this.game.resetAmbientParticles) this.game.resetAmbientParticles();
        if (this.game.resetAltarNotifications) this.game.resetAltarNotifications();
        const cv = this.game.canvas;
        if (cv && typeof this.game.generateTitleArchipelago === 'function') {
          this.game.generateTitleArchipelago(cv.width, cv.height);
        }
        this.game.activeDungeon = null;
        this.game.started = false;
        this.game.paused = false;
      }
      document.getElementById('title-screen').classList.remove('hidden');
      document.getElementById('hud-root').classList.add('hidden');
      const bHud = document.getElementById('bottom-hud');
      if (bHud) bHud.classList.add('hidden');
      this.triggerTitleIntro();
      if (Abyssea.Audio && typeof Abyssea.Audio.setMood === 'function') {
        Abyssea.Audio.setMood('title', { delayMs: 480, fadeOutMs: 420, fadeInMs: 4200 });
      }
    }

    bindGlobalInputs() {
      const g = this.game;
      const canvas = g.canvas;

      const deathMenuBtn = document.getElementById('btn-death-main-menu');
      if (deathMenuBtn) {
        deathMenuBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this._exitingFromDeath || !g.started || !(g.isPlayerDead && g.isPlayerDead())) return;
          this._exitingFromDeath = true;
          g.exitFromDeathToTitle();
          if (Abyssea.Audio && Abyssea.Audio.fadeOutMusic) Abyssea.Audio.fadeOutMusic(620);
          this.playSceneTransition(tr('transition.backMenu'), () => {
            this._exitingFromDeath = false;
            this.showTitleScreen({ skipSave: true });
          });
        });
      }

      const toggleBtn = document.getElementById('btn-menu-toggle');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (g.isPlayerDead && g.isPlayerDead()) return;
          this.toggleMenuDropdown();
        });
      }

      const tutMinBtn = document.getElementById('btn-tut-minimize');
      if (tutMinBtn) {
        tutMinBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (g.tutorialSys) {
            g.tutorialSys.minimized = !g.tutorialSys.minimized;
            this.updateHUD(true);
          }
        });
      }

      const tutSkipBtn = document.getElementById('btn-tut-skip');
      if (tutSkipBtn) {
        tutSkipBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (g.tutorialSys) {
            g.tutorialSys.skip(g);
            this.updateHUD(true);
          }
        });
      }

      const objToggleBtn = document.getElementById('btn-objective-toggle');
      const objBanner = document.getElementById('objective-banner');
      if (objToggleBtn && objBanner) {
        try {
          if (localStorage.getItem('abyssea_obj_minimized') === '1') {
            objBanner.classList.add('minimized');
            objToggleBtn.textContent = '+';
          }
        } catch (_) {}
        const toggleObj = (e) => {
          if (e) e.stopPropagation();
          const isMin = objBanner.classList.toggle('minimized');
          objToggleBtn.textContent = isMin ? '+' : '-';
          try { localStorage.setItem('abyssea_obj_minimized', isMin ? '1' : '0'); } catch (_) {}
        };
        objToggleBtn.addEventListener('click', toggleObj);
        const objHead = objBanner.querySelector('.obj-head');
        if (objHead) {
          objHead.addEventListener('click', (e) => {
            if (e.target !== objToggleBtn) toggleObj(e);
          });
        }
      }

      const dungToggleBtn = document.getElementById('btn-dungeon-obj-toggle');
      const dungHudEl = document.getElementById('dungeon-hud');
      if (dungToggleBtn && dungHudEl) {
        const toggleDung = (e) => {
          if (e) e.stopPropagation();
          const isMin = dungHudEl.classList.toggle('minimized');
          dungToggleBtn.textContent = isMin ? '+' : '-';
        };
        dungToggleBtn.addEventListener('click', toggleDung);
        const dungHead = dungHudEl.querySelector('.obj-head');
        if (dungHead) {
          dungHead.addEventListener('click', (e) => {
            if (e.target !== dungToggleBtn) toggleDung(e);
          });
        }
      }

      const lvlBadge = document.getElementById('lvl-text');
      if (lvlBadge) {
        lvlBadge.addEventListener('click', (e) => {
          if (!g || !g.started) return;
          e.stopPropagation();
          const now = Date.now();
          this._cmdTapTimes = (this._cmdTapTimes || []).filter(t => now - t <= 2500);
          this._cmdTapTimes.push(now);
          if (this._cmdTapTimes.length >= 7) {
            this._cmdTapTimes = [];
            this.toggleSecretConsole();
          }
        });
      }

      document.addEventListener('click', (e) => {
        if (!this.menuOpen) return;
        const wrap = document.getElementById('hud-menu-wrap');
        if (wrap && !wrap.contains(e.target)) {
          this.closeMenuDropdown();
        }
      });

      // Subtle crystalline hover SFX on buttons and interactive controls
      const HOVER_SFX_SELECTOR = [
        'button',
        '.title-nav-btn',
        '.title-corner-btn',
        '.btn',
        '.btn-close-sq',
        '.modal-tab',
        '.menu-dropdown-item',
        '.arrow-pick-btn',
        '.hotbar-slot',
        '.spell-slot'
      ].join(', ');
      this._hoverSfxEl = null;
      this._hoverSuppressUntil = 0;

      document.addEventListener('pointerdown', () => {
        this._hoverSuppressUntil = Date.now() + 150;
      }, true);

      document.addEventListener('pointerover', (e) => {
        if (e.pointerType === 'touch') return;
        const target = (e.target && typeof e.target.closest === 'function')
          ? e.target.closest(HOVER_SFX_SELECTOR)
          : null;
        if (!target) return;
        if (this._hoverSfxEl && typeof document.contains === 'function' && !document.contains(this._hoverSfxEl)) {
          this._hoverSfxEl = null;
        }
        if (target === this._hoverSfxEl) return;
        if (e.relatedTarget && target.contains(e.relatedTarget)) return;
        if (target.disabled || target.classList.contains('disabled') || target.getAttribute('aria-disabled') === 'true') return;
        this._hoverSfxEl = target;
        if (Date.now() < this._hoverSuppressUntil) return;
        if (Abyssea.Audio && typeof Abyssea.Audio.play === 'function') {
          Abyssea.Audio.play('ui_hover');
        }
      }, true);

      document.addEventListener('pointerout', (e) => {
        if (!this._hoverSfxEl) return;
        if (typeof document.contains === 'function' && !document.contains(this._hoverSfxEl)) {
          this._hoverSfxEl = null;
          return;
        }
        if (!e.relatedTarget || !this._hoverSfxEl.contains(e.relatedTarget)) {
          this._hoverSfxEl = null;
        }
      }, true);

      const clearTransient = () => {
        if (g && typeof g.clearTransientInputs === 'function') {
          g.clearTransientInputs();
        }
      };
      window.addEventListener('blur', clearTransient);
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) clearTransient();
      });
      document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
          if (navigator.keyboard && typeof navigator.keyboard.lock === 'function') {
            navigator.keyboard.lock(['Escape']).catch(() => {});
          }
        } else if (navigator.keyboard && typeof navigator.keyboard.unlock === 'function') {
          try { navigator.keyboard.unlock(); } catch (_) {}
        }
        this._syncDisplayModeUi();
      });
      this.syncNativeFullscreenState();

      window.addEventListener('keydown', (e) => {
        this.recordPlayerActivity();
        if (e.code === 'F11' && !this.rebindingAction) {
          e.preventDefault();
          e.stopPropagation();
          this.toggleDisplayMode();
          return;
        }
        if (!this.rebindingAction && e.code === 'F9' && e.shiftKey && !e.altKey && g && g.started) {
          e.preventDefault();
          e.stopPropagation();
          this.toggleSecretConsole();
          return;
        }
        if (this._cmdOpen && e.code === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          this.closeSecretConsole();
          return;
        }
        const evtTarget = e.target;
        const isTypingTarget = Boolean(
          evtTarget && (
            evtTarget.tagName === 'INPUT' ||
            evtTarget.tagName === 'TEXTAREA' ||
            evtTarget.tagName === 'SELECT' ||
            evtTarget.isContentEditable
          )
        );
        if (this._cmdOpen && (isTypingTarget || (evtTarget && typeof evtTarget.closest === 'function' && evtTarget.closest('#bal-cmd-shell')))) {
          return;
        }
        if (this.game && this.game.introCinematic && this.game.introCinematic.active) {
          if (e.code === 'Escape') {
            e.preventDefault();
            this.game.finishIntroCinematic();
            return;
          }
          if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            this.game.advanceIntroCinematic();
            return;
          }
          if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
            this.game.finishIntroCinematic();
          }
        }
        if (this.rebindingAction) {
          e.preventDefault();
          e.stopPropagation();
          if (e.code === 'Escape') {
            this.rebindingAction = null;
          } else if (e.code) {
            this.setKeybind(this.rebindingAction, e.code);
          }
          if (this.hasOpenModal()) this.renderModal();
          return;
        }

        if (isTypingTarget) {
          if (e.code === 'Escape') {
            if (typeof evtTarget.blur === 'function') evtTarget.blur();
            if (this.hasOpenModal()) this.closeModal();
          }
          return;
        }

        if (g.started && g.isPlayerDead && g.isPlayerDead()) {
          if (document.activeElement && document.activeElement.id === 'btn-death-main-menu' && (e.code === 'Enter' || e.code === 'Space')) {
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
          if (g.started && !this.hasOpenModal()) e.preventDefault();
        }
        g.keys[e.code] = true;

        if (!g.started) {
          if (e.code === 'Escape' && this.hasOpenModal()) this.closeModal();
          return;
        }

        const kb = this.keybinds || DEFAULT_KEYBINDS;
        if (e.code === 'Escape') {
          e.preventDefault();
          if (this.hasOpenModal()) {
            if (this.activeModal === 'pause' && this.pauseView === 'settings') {
              this.pauseView = 'root';
              this.renderModal();
            } else {
              this.closeModal();
            }
          }
          else if (this.photoMode) this.togglePhotoMode();
          else if (this.menuOpen) this.closeMenuDropdown();
          else if (g.v2Runtime && g.v2Runtime.relocatorActive) { g.v2Runtime.relocatorActive = false; g.v2Runtime.relocating = null; g.toast('Modo Traslado cancelado.', 'info'); this.updateHUD(true); }
          else if (g.placingBuildingId || g.placingItemId) { g.placingBuildingId = null; g.placingItemId = null; this.updateHUD(true); }
          else this.openModal('pause');
          return;
        }

        if (e.code === 'F9' || e.code === 'F8' || (e.code === 'KeyP' && !this.hasOpenModal() && !isTypingTarget)) {
          e.preventDefault();
          this.togglePhotoMode();
          return;
        }

        const modalBindOrder = ['inventory', 'crafting', 'build', 'skills', 'map', 'market', 'quests', 'encyclopedia', 'pause'];
        if (this.hasOpenModal()) {
          if (this.activeModal === 'inventory' && this._hoveredInvSlot && e.code >= 'Digit1' && e.code <= 'Digit9') {
            const hotbarIdx = Number(e.code.replace('Digit', '')) - 1;
            g.assignHotbarSlot(hotbarIdx, this._hoveredInvSlot.kind, this._hoveredInvSlot.id);
            Abyssea.Audio.play('pickup');
            this.updateHUD(true);
            this.renderModal();
            return;
          }
          const matchedModal = modalBindOrder.find(m => kb[m] === e.code);
          if (matchedModal && (matchedModal === this.activeModal || (matchedModal === 'pause' && (this.activeModal === 'settings' || this.activeModal === 'controls')))) {
            this.closeModal();
          }
          return;
        }

        if (e.code >= 'Digit1' && e.code <= 'Digit9') {
          const slotIdx = Number(e.code.replace('Digit', '')) - 1;
          const slot = g.hotbar[slotIdx];
          if (slot && (slot.kind !== 'tool' || g.toolTiers[slot.id])) {
            g.activeSlot = slotIdx;
            Abyssea.Audio.play('ui');
            g.uiDirty = true;
          }
        } else if (e.code === kb.dash) {
          g.triggerDash();
        } else if (e.code === kb.spell1) {
          g.castSpell(0, g.mouse.wx, g.mouse.wy);
        } else if (e.code === kb.spell2) {
          g.castSpell(1, g.mouse.wx, g.mouse.wy);
        } else if (e.code === kb.spell3) {
          g.castSpell(2, g.mouse.wx, g.mouse.wy);
        } else if (e.code === kb.spell4) {
          g.castSpell(3, g.mouse.wx, g.mouse.wy);
        } else if (e.code === kb.menu) {
          this.toggleMenuDropdown();
        } else if (e.code === kb.interact) {
          g.interactNearby();
        } else if (e.code === 'KeyK') {
          if (g.cyclePlayerSkin) g.cyclePlayerSkin(1);
        } else {
          const opened = modalBindOrder.find(m => kb[m] === e.code);
          if (opened) this.openModal(opened);
        }
      }, true);

      window.addEventListener('keyup', (e) => {
        g.keys[e.code] = false;
      });

      const syncCanvasMouse = (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / Math.max(1, rect.width);
        const scaleY = canvas.height / Math.max(1, rect.height);
        g.mouse.sx = (e.clientX - rect.left) * scaleX;
        g.mouse.sy = (e.clientY - rect.top) * scaleY;
        g.updateMouseWorld();
        if (Math.abs(e.clientX - (this._lastMouseClientX || 0)) > 6 || Math.abs(e.clientY - (this._lastMouseClientY || 0)) > 6) {
          this._lastMouseClientX = e.clientX;
          this._lastMouseClientY = e.clientY;
          this.recordPlayerActivity();
        }
      };

      canvas.addEventListener('mousemove', syncCanvasMouse);

      canvas.addEventListener('mousedown', (e) => {
        Abyssea.Audio.init();
        this.recordPlayerActivity();
        if (g.introCinematic && g.introCinematic.active) {
          g.advanceIntroCinematic();
          return;
        }
        if (!g.started || this.hasOpenModal() || (g.isPlayerDead && g.isPlayerDead())) return;
        this.closeMenuDropdown();
        if (e.button === 2) {
          g.placingBuildingId = null;
          g.placingItemId = null;
          g.uiDirty = true;
          return;
        }
        if (e.button !== 0) return;

        syncCanvasMouse(e);

        if (!g.activeDungeon && !g.placingBuildingId) {
          const tx = Math.floor(g.mouse.wx / TILE_SIZE);
          const ty = Math.floor(g.mouse.wy / TILE_SIZE);
          const b = g.getBuildingAtTile(tx, ty);
          const actSlot = g.hotbar && g.hotbar[g.activeSlot];
          const actItem = actSlot && actSlot.kind === 'item' ? Abyssea.ITEMS[actSlot.id] : null;
          const holdingActionItem = Boolean(actItem && (
            actItem.isBomb || (actItem.consumableEffect && actItem.consumableEffect.bombRadius) ||
            actItem.isLaserWeapon || actItem.isSpecialBlade || actItem.plantCrop ||
            actSlot.id === 'fertilizante' || actSlot.id === 'abono_dorado' || actSlot.id === 'compost_magico'
          ));
          if (b && !holdingActionItem && Abyssea.Utils.dist(g.player.x, g.player.y, g.mouse.wx, g.mouse.wy) <= 95) {
            const bDef = Abyssea.BUILDINGS[b.type] || {};
            const isChestOrLogistic = Boolean(b.isChest || bDef.isChest || b.type === 'cofre_logistico' || bDef.opensPanel === 'cofre_logistico');
            const collected = isChestOrLogistic ? false : g.automation.collectFromBuilding(g, b);
            if (isChestOrLogistic || !collected || bDef.station || bDef.opensPanel) {
              this.openBuildingModal(b);
            }
            return;
          }
        }

        g.mouse.down = true;
        g.useActiveSlot(g.mouse.wx, g.mouse.wy);
      });

      window.addEventListener('mouseup', () => {
        g.mouse.down = false;
      });

      canvas.addEventListener('contextmenu', (e) => e.preventDefault());

      canvas.addEventListener('wheel', (e) => {
        this.recordPlayerActivity();
        if (!g.started || (g.isPlayerDead && g.isPlayerDead())) return;
        if (e.ctrlKey) {
          e.preventDefault();
          g.camera.zoom = Abyssea.Utils.clamp(g.camera.zoom + (e.deltaY < 0 ? 0.12 : -0.12), 0.7, 2.5);
          return;
        }
        const dir = e.deltaY > 0 ? 1 : -1;
        for (let step = 1; step <= 9; step++) {
          const idx = (g.activeSlot + dir * step + 9) % 9;
          const sl = g.hotbar[idx];
          if (!sl) continue;
          if (sl.kind === 'tool' && !g.toolTiers[sl.id]) continue;
          g.activeSlot = idx;
          g.uiDirty = true;
          this.updateHUD(true);
          return;
        }
        g.activeSlot = (g.activeSlot + dir + 9) % 9;
        g.uiDirty = true;
        this.updateHUD(true);
      }, { passive: false });
    }

    openModal(name, data = null) {
      const g = this.game;
      if (g && g.started && g.isPlayerDead && g.isPlayerDead()) return;
      this.hideControlsHelper(true);
      this.lastPlayerInputTime = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
      if (name === 'controls') {
        name = (g && g.started) ? 'pause' : 'title_settings';
        this.pauseView = 'settings';
        this.settingsTab = 'controles';
      } else if (name === 'settings') {
        name = (g && g.started) ? 'pause' : 'title_settings';
        this.pauseView = 'settings';
      } else if (name === 'title_settings') {
        this.pauseView = 'settings';
      } else if (name === 'pause') {
        this.pauseView = (data === 'settings') ? 'settings' : 'root';
      }
      this.closeMenuDropdown();
      // Structure-gated menus: require building the corresponding structure first!
      if (g && g.started) {
        if (name === 'crafting' && !g.hasCraftingStructureBuilt()) {
          g.toast(tr('toast.needCraftingTable'), 'warn');
          Abyssea.Audio.play('error');
          return;
        }
        if (name === 'market' && !g.hasBuilding('mercado')) {
          g.toast(tr('toast.needMarketBuilding'), 'warn');
          Abyssea.Audio.play('error');
          return;
        }
        if (name === 'achievements' && !g.hasBuilding('tablon_logros')) {
          g.toast(tr('toast.needAchievementsBoard'), 'warn');
          Abyssea.Audio.play('error');
          return;
        }
        if (name === 'enchant' && !g.hasBuilding('mesa_encantamientos')) {
          g.toast(tr('toast.needEnchantTable'), 'warn');
          Abyssea.Audio.play('error');
          return;
        }
      }

      Abyssea.Audio.play('ui');
      this.activeModal = name;
      this.modalData = data;
      if (g) g.paused = (name === 'pause' || name === 'skills' || name === 'map');
      if (name === 'skills') {
        this.skillPanX = null;
        this.skillPanY = null;
        if (typeof data === 'string' && Abyssea.SKILLS[data]) {
          this.selectedSkillId = data;
        }
      }
      if (name === 'map' && g) {
        this.mapZoom = 1.15;
        this.mapPanX = null;
        this.mapPanY = null;
        this.selectedMapPlot = [
          Abyssea.Utils.clamp(Math.floor(g.player.x / (PLOT_TILES * TILE_SIZE)), 0, GRID_PLOTS - 1),
          Abyssea.Utils.clamp(Math.floor(g.player.y / (PLOT_TILES * TILE_SIZE)), 0, GRID_PLOTS - 1)
        ];
      }
      const backdrop = document.getElementById('modal-backdrop');
      const modalBox = document.getElementById('modal-box');
      const fullModals = new Set(['skills', 'map']);
      const leftDrawers = new Set(['inventory', 'crafting', 'build', 'market', 'quests', 'achievements', 'building', 'npc', 'chest']);
      const wideDrawers = new Set(['build', 'inventory', 'crafting', 'quests', 'achievements', 'building', 'chest']);
      backdrop.classList.toggle('fullscreen-modal', fullModals.has(name));
      const compactStyled = new Set(['pause', 'title_settings', 'credits', 'quit_confirm', 'quit_web_fallback', 'discord_fallback', 'exit_dungeon_confirm']);
      const isCompactModal = compactStyled.has(name);
      if (modalBox) {
        modalBox.classList.toggle('modal-fullscreen', fullModals.has(name));
        modalBox.classList.toggle('skills-cosmic-fullscreen', name === 'skills');
        modalBox.classList.toggle('map-atlas-fullscreen', name === 'map');
        modalBox.classList.toggle('quests-modal', name === 'quests');
        modalBox.classList.toggle('pause-pixel-modal', isCompactModal);
        modalBox.classList.toggle('pause-root-compact', (name === 'pause' && this.pauseView === 'root') || name === 'credits' || name === 'quit_confirm' || name === 'quit_web_fallback' || name === 'discord_fallback' || name === 'exit_dungeon_confirm');
        modalBox.classList.toggle('pause-settings-compact', (name === 'pause' && this.pauseView === 'settings') || name === 'title_settings');
      }
      backdrop.classList.toggle('drawer-left', leftDrawers.has(name));
      backdrop.classList.toggle('drawer-wide', wideDrawers.has(name));
      if (typeof document !== 'undefined' && document.body) {
        document.body.classList.add('modal-open');
        document.body.classList.toggle('modal-drawer-open', leftDrawers.has(name));
        document.body.classList.toggle('modal-fullscreen-active', fullModals.has(name));
      }
      backdrop.classList.remove('hidden');
      this.hideTooltip();
      this.renderModal();
    }

    openBuildingModal(b) {
      if (!b) return;
      const def = Abyssea.BUILDINGS[b.type || b.defId];
      if (b.isChest || (def && def.isChest)) {
        b.isOpen = true;
        if (this.game) this.game.activeChestBuilding = b;
        if (Abyssea.Audio && typeof Abyssea.Audio.play === 'function') {
          Abyssea.Audio.play('chest');
        }
        this.openModal('chest', b);
        return;
      }
      this.openModal('building', b);
    }

    openNpcModal(npc) {
      this.openModal('npc', npc);
    }

    _cleanupActiveModalResources(nextModalName = null) {
      if (this._v14ActiveLoop) { cancelAnimationFrame(this._v14ActiveLoop); this._v14ActiveLoop = null; }
      if (this._v14EnchantLoop) { cancelAnimationFrame(this._v14EnchantLoop); this._v14EnchantLoop = null; }
      if (this._v14ModalCleanup) { this._v14ModalCleanup(); this._v14ModalCleanup = null; }
      if (this._mapCleanup) { this._mapCleanup(); this._mapCleanup = null; }
      if (this._skillBoardCleanup) { this._skillBoardCleanup(); this._skillBoardCleanup = null; }
      if (this._skillHoldCleanup) { this._skillHoldCleanup(); this._skillHoldCleanup = null; }
      if (this._skillUnlockFxTimer) { clearTimeout(this._skillUnlockFxTimer); this._skillUnlockFxTimer = null; }
      if (this._skillQuakeTimer) { clearTimeout(this._skillQuakeTimer); this._skillQuakeTimer = null; }
      if (nextModalName !== 'chest' && this.game && this.game.activeChestBuilding) {
        this.game.activeChestBuilding.isOpen = false;
        this.game.activeChestBuilding = null;
        if (Abyssea.Audio && typeof Abyssea.Audio.play === 'function') {
          Abyssea.Audio.play('chest');
        }
      }
    }

    closeModal() {
      const closingModal = this.activeModal;
      this.hideTooltip();
      this._cleanupActiveModalResources(null);
      this.activeModal = null;
      this.modalData = null;
      this.rebindingAction = null;
      this.lastPlayerInputTime = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
      if (closingModal === 'title_settings' && (!this.game || !this.game.started) &&
          Abyssea.Audio && Abyssea.Audio._previewThemeInTitle && typeof Abyssea.Audio.setMood === 'function') {
        Abyssea.Audio.setMood('title', { delayMs: 360, fadeOutMs: 420, fadeInMs: 4200 });
      }
      if (this.game) {
        this.game.paused = false;
        if (this.game.tutorialSys && !this.game.tutorialSys.done) {
          this.game.tutorialSys.update(this.game, 0);
        }
      }
      const backdrop = document.getElementById('modal-backdrop');
      const modalBox = document.getElementById('modal-box');
      const bodyEl = document.getElementById('modal-body');
      if (bodyEl) bodyEl.innerHTML = '';
      const headerTools = document.getElementById('modal-header-tools');
      if (headerTools) {
        headerTools.innerHTML = '';
        headerTools.classList.add('hidden');
      }
      backdrop.classList.add('hidden');
      backdrop.classList.remove('drawer-left', 'drawer-wide', 'fullscreen-modal');
      if (typeof document !== 'undefined' && document.body) {
        document.body.classList.remove('modal-open', 'modal-drawer-open', 'modal-fullscreen-active');
      }
      if (modalBox) {
        modalBox.classList.remove(
          'modal-fullscreen', 'skills-cosmic-fullscreen', 'map-atlas-fullscreen',
          'quests-modal', 'pause-pixel-modal', 'pause-root-compact', 'pause-settings-compact',
          'steam-dialog-box', 'patch-notes-modal', 'chest-wide-modal', 'cosmic-quake-active'
        );
        modalBox.style.width = '';
        modalBox.style.maxWidth = '';
        modalBox.style.minHeight = '';
      }
    }

    _getHudEls() {
      if (!this._hudEls && typeof document !== 'undefined') {
        this._hudEls = {
          hpFill: document.getElementById('hp-fill'),
          hpText: document.getElementById('hp-text'),
          enFill: document.getElementById('en-fill'),
          enText: document.getElementById('en-text'),
          xpFill: document.getElementById('xp-fill'),
          xpText: document.getElementById('xp-text'),
          xpRow: document.getElementById('hud-xp-row'),
          lvlText: document.getElementById('lvl-text'),
          coinText: document.getElementById('coin-text'),
          dayIcon: document.getElementById('day-icon'),
          dayLabel: document.getElementById('day-label'),
          dayFill: document.getElementById('day-progress-fill'),
          tCard: document.getElementById('hud-target'),
          deathOverlay: document.getElementById('death-overlay'),
          tutHud: document.getElementById('tutorial-hud'),
          objEl: document.getElementById('objective-text'),
          objProg: document.getElementById('objective-progress'),
          objRew: document.getElementById('objective-reward'),
          dungHud: document.getElementById('dungeon-hud'),
          lvlEl: document.getElementById('levelup-banner'),
          altarStack: document.getElementById('altar-blessing-stack'),
          topLeft: document.getElementById('hud-top-left')
        };
      }
      return this._hudEls || {};
    }

    updateHUD(force = false) {
      const g = this.game;
      const H = this._getHudEls();
      // Throttle: sin force, solo ejecutar el HUD completo ~10 veces/seg.
      // El hover-HP se actualiza igual fuera del throttle (ver bloque tCard abajo).
      this._hudFrameCount = ((this._hudFrameCount || 0) + 1);
      const throttled = !force && (this._hudFrameCount % 6 !== 0);
      if (throttled) {
        // Solo actualiza la barra de HP del hoveredTarget sin reconstruir nada más
        const ht = g && g.hoveredTarget;
        if (ht && ht.hp != null && ht.maxHp > 0) {
          const hpPct = Math.max(0, Math.min(100, Math.round((ht.hp / ht.maxHp) * 100)));
          if (hpPct !== this._lastTargetHp) {
            this._lastTargetHp = hpPct;
            const tCard = H.tCard;
            if (tCard) {
              const fill = tCard.querySelector('[data-tghp]');
              if (fill) fill.style.width = `${hpPct}%`;
              const subEl = tCard.querySelector('[data-tgsub]');
              if (subEl && ht.sub) subEl.textContent = ht.sub;
            }
          }
        } else if (!ht) {
          if (this._lastTargetKey !== '') {
            this._lastTargetKey = '';
            this._lastTargetHp = null;
            if (H.tCard) H.tCard.classList.add('hidden');
          }
        }
        return;
      }
      const deathOverlay = H.deathOverlay;
      const isDead = Boolean(g && g.started && g.isPlayerDead && g.isPlayerDead());
      if (deathOverlay) {
        const maxD = (g && g.player && g.player.deadMax) || 10.0;
        const elapsedDead = isDead && g.player ? Math.max(0, maxD - g.player.deadTimer) : 0;
        const showDeathScreen = isDead && (elapsedDead >= 2.35 || maxD < 2.6);
        deathOverlay.classList.toggle('hidden', !showDeathScreen);
        if (showDeathScreen && g.player) {
          this._startDeathDiorama();
          const pctLeft = Math.max(0, Math.min(100, (g.player.deadTimer / maxD) * 100));
          const snappedPct = Math.round(pctLeft / 2) * 2;
          const fillEl = document.getElementById('death-bar-fill');
          const cdEl = document.getElementById('death-countdown');
          const stEl = document.getElementById('death-stats-pill');
          if (fillEl) fillEl.style.width = `${snappedPct}%`;
          if (cdEl) cdEl.textContent = tr('death.respawnCount', { sec: Math.max(0.1, g.player.deadTimer).toFixed(1) });
          if (stEl) stEl.textContent = tr('toast.statSummary', {
            level: g.player.level || 1,
            day: g.dayCount || 1,
            kills: (g.stats && g.stats.kills) || 0,
            plots: (g.unlockedPlots && g.unlockedPlots.length) || 1
          });
        } else {
          this._stopDeathDiorama();
        }
      }
      if (!g.started) return;
      if (!force && !g.uiDirty && performance.now() - this.lastHudTick < 220) return;
      this.lastHudTick = performance.now();
      g.uiDirty = false;

      const p = g.player;
      const hpW = `${((p.hp / Math.max(1, p.maxHp)) * 100).toFixed(1)}%`;
      const hpT = `${Math.ceil(p.hp)}/${p.maxHp}`;
      if (H.hpFill && H.hpFill.style.width !== hpW) H.hpFill.style.width = hpW;
      if (H.hpText && H.hpText.textContent !== hpT) H.hpText.textContent = hpT;
      const enW = `${((p.energy / Math.max(1, p.maxEnergy)) * 100).toFixed(1)}%`;
      const enT = `${Math.floor(p.energy)}/${p.maxEnergy}`;
      if (H.enFill && H.enFill.style.width !== enW) H.enFill.style.width = enW;
      if (H.enText && H.enText.textContent !== enT) H.enText.textContent = enT;
      const xpPct = Math.min(100, Math.max(0, (p.xp / Math.max(1, p.nextXp)) * 100));
      const xpW = `${xpPct.toFixed(1)}%`;
      if (H.xpFill && H.xpFill.style.width !== xpW) H.xpFill.style.width = xpW;
      if (H.xpText) {
        const curXp = Math.floor(p.xp);
        const nextXp = Math.floor(p.nextXp);
        const langNow = Abyssea.I18n && Abyssea.I18n.getLanguage ? Abyssea.I18n.getLanguage() : 'es';
        const xpSig = `${langNow}|${curXp}|${nextXp}`;
        if (xpSig !== this._lastXpSig) {
          this._lastXpSig = xpSig;
          const remXp = Math.max(0, nextXp - curXp);
          H.xpText.textContent = `${formatNum(curXp)}/${formatNum(nextXp)}`;
          const tip = langNow === 'en'
            ? `Progress: ${curXp.toLocaleString()} / ${nextXp.toLocaleString()} XP (${Math.floor(xpPct)}%) - Next level in ${remXp.toLocaleString()} XP`
            : `Progreso: ${curXp.toLocaleString()} / ${nextXp.toLocaleString()} XP (${Math.floor(xpPct)}%) - Siguiente nivel en ${remXp.toLocaleString()} XP`;
          H.xpText.setAttribute('data-tip-text', tip);
          if (H.xpRow) H.xpRow.setAttribute('data-tip-text', tip);
        }
      }
      const lvlStr = `${tr('common.levelShort')}${p.level}`;
      if (H.lvlText && H.lvlText.textContent !== lvlStr) H.lvlText.textContent = lvlStr;
      const coinStr = formatNum(g.coins);
      if (H.coinText && H.coinText.textContent !== coinStr) H.coinText.textContent = coinStr;

      ['skill-badge', 'skill-badge-top'].forEach(bid => {
        const spBadge = document.getElementById(bid);
        if (!spBadge) return;
        if (p.skillPoints > 0) {
          const spStr = String(p.skillPoints);
          if (spBadge.textContent !== spStr) spBadge.textContent = spStr;
          spBadge.classList.remove('hidden');
        } else {
          spBadge.classList.add('hidden');
        }
      });

      // Day/Night clock pill with exact mm:ss phase countdown (no biome indicator)
      const dayPhase = g.getDayPhase ? g.getDayPhase() : { phase: 'dia', label: tr('hud.phaseDay'), iconKey: 'sun', phaseLeftSec: 480 };
      const dIcon = H.dayIcon;
      const dLabel = H.dayLabel;
      const dFill = H.dayFill;
      if (dIcon && Abyssea.UI_URLS[dayPhase.iconKey]) {
        const targetSrc = Abyssea.UI_URLS[dayPhase.iconKey];
        if (dIcon.getAttribute('src') !== targetSrc) dIcon.src = targetSrc;
      }
      if (dLabel) {
        const left = Math.max(0, Math.round(dayPhase.phaseLeftSec || 0));
        const mm = String(Math.floor(left / 60)).padStart(2, '0');
        const ss = String(left % 60).padStart(2, '0');
        const lp = typeof g.getLunarPhase === 'function' ? g.getLunarPhase() : null;
        const lunarTag = lp ? ` · Luna ${lp.short}` : '';
        const clockStr = `${tr('common.dayShort')} ${g.dayCount || 1} · ${dayPhase.label}${lunarTag} · ${mm}:${ss}`;
        if (dLabel.textContent !== clockStr) dLabel.textContent = clockStr;
      }
      if (dFill) {
        const pctW = `${Math.round(((g.dayTime % 1) + 1) % 1 * 100)}%`;
        if (dFill.style.width !== pctW) dFill.style.width = pctW;
        dFill.classList.toggle('night', Boolean(g.isNightTime && g.isNightTime()));
      }

      // Guided Interactive Tutorial Widget Sync (caches desc innerHTML per step+lang)
      const tutHud = H.tutHud;
      if (tutHud) {
        const tut = g.tutorialSys;
        if (!tut || tut.done || tut.skipped || g.activeDungeon) {
          tutHud.classList.add('hidden');
        } else {
          tutHud.classList.remove('hidden');
          if (this._lastTutStep !== undefined && this._lastTutStep !== tut.step) {
            tutHud.classList.remove('tut-completed-pop');
            void tutHud.offsetWidth;
            tutHud.classList.add('tut-completed-pop');
          }
          this._lastTutStep = tut.step;
          const stepDef = tut.getCurrentStepDef();
          if (stepDef) {
            const titleEl = document.getElementById('tut-title');
            const descEl = document.getElementById('tut-desc');
            const progBar = document.getElementById('tut-progress-bar');
            const progTxt = document.getElementById('tut-progress-text');
            const counterEl = document.getElementById('tut-step-counter');
            const totalSteps = Abyssea.TUTORIAL_STEPS ? Abyssea.TUTORIAL_STEPS.length : 9;

            const isEn = Abyssea.I18n && Abyssea.I18n.getLanguage() === 'en';
            const tutHtmlKey = `${isEn ? 'en' : 'es'}|${tut.step}`;
            if (tutHtmlKey !== this._lastTutHtmlKey) {
              this._lastTutHtmlKey = tutHtmlKey;
              if (titleEl) titleEl.textContent = (isEn && stepDef.title_en) ? stepDef.title_en : stepDef.title;
              if (descEl) descEl.innerHTML = tut.getFormattedDesc(stepDef, this);
              if (counterEl) counterEl.textContent = `${tut.step + 1}/${totalSteps}`;
              if (progBar) progBar.style.width = `${Math.round(((tut.step) / totalSteps) * 100)}%`;
            }

            const progLine = stepDef.getProgress ? stepDef.getProgress(g, tut.stepState) : '';
            if (progTxt && progTxt.textContent !== progLine) progTxt.textContent = progLine;

            const bodyEl = document.getElementById('tut-body');
            const minBtn = document.getElementById('btn-tut-minimize');
            if (bodyEl) {
              bodyEl.classList.toggle('hidden', !!tut.minimized);
              let mapActionBtn = document.getElementById('btn-tut-open-map');
              if (stepDef.id === 'buy_island') {
                if (!mapActionBtn) {
                  mapActionBtn = this.el('button', {
                    id: 'btn-tut-open-map',
                    class: 'btn btn-gold',
                    style: 'margin-top:6px;width:100%;font-size:13px;padding:5px 8px;font-weight:800;letter-spacing:0.3px;'
                  });
                  bodyEl.appendChild(mapActionBtn);
                }
                const btnLbl = isEn ? 'Open Map & Focus 1st Island [M]' : 'Abrir Mapa y Ver 1ra Isla [M]';
                if (mapActionBtn.textContent !== btnLbl) mapActionBtn.textContent = btnLbl;
                mapActionBtn.classList.remove('hidden');
                mapActionBtn.onclick = () => {
                  if (typeof tut.focusRecommendedIslandInMap === 'function') {
                    tut.focusRecommendedIslandInMap(g, true);
                  } else {
                    this.openModal('map');
                  }
                };
              } else if (mapActionBtn) {
                mapActionBtn.classList.add('hidden');
              }
            }
            if (minBtn) minBtn.textContent = tut.minimized ? '+' : '-';
          }
        }
      }

      const objEl = H.objEl;
      if (objEl) {
        const nextHint = g.events.getNextObjectiveHint(g);
        if (objEl.textContent !== nextHint) objEl.textContent = nextHint;
      }
      const objProg = H.objProg;
      const objRew = H.objRew;
      const ch = Abyssea.STORY_CHAPTERS && Abyssea.STORY_CHAPTERS[g.storyIndex];
      if (objProg) {
        let progText = '';
        if (ch && ch.getProgress) {
          const items = ch.getProgress(g) || [];
          progText = items.map(p => `${p.label}: ${p.cur}/${p.max}`).join(' · ');
        } else {
          progText = g.storyIndex >= (Abyssea.STORY_CHAPTERS || []).length ? tr('hud.mainStoryComplete') : '';
        }
        if (objProg.textContent !== progText) objProg.textContent = progText;
      }
      if (objRew) {
        let rewText = '';
        if (ch && ch.reward) {
          const rwItems = ch.reward.items
            ? Object.entries(ch.reward.items).filter(([, q]) => q > 0).map(([id, q]) => `${q}x ${(Abyssea.ITEMS[id] && Abyssea.ITEMS[id].name) || id}`).join(', ')
            : '';
          const parts = `+${ch.reward.coins} ${tr('common.coins')} · +${ch.reward.xp} ${tr('common.xp')}${rwItems ? ' · ' + rwItems : ''}`;
          rewText = tr('hud.rewardLine', { parts });
        }
        if (objRew.textContent !== rewText) objRew.textContent = rewText;
      }

      // Left-column Dungeon Objective HUD (moved out of canvas top-center)
      const dungHud = H.dungHud;
      if (dungHud) {
        const dung = g.activeDungeon;
        if (!dung) {
          if (this._lastDungKey !== '') {
            this._lastDungKey = '';
            dungHud.classList.add('hidden');
          }
        } else {
          const wingDone = dung.runes ? dung.runes.filter(x => x.kind === 'wing' && x.active).length : 0;
          const maxSeq = dung.seqTarget || 3;
          const seqTxt = dung.vaultOpen ? tr('hud.dungVaultOpen') : `${dung.seqProgress || 0}/${maxSeq}`;
          const miniTxt = dung.miniBossDefeated ? tr('hud.dungDefeated') : tr('hud.dungPending');
          const gateTxt = dung.gateOpen ? tr('hud.dungGateOpen') : tr('hud.dungGateClosed');
          let phaseLine = '';
          if (dung.boss && dung.boss.hp > 0) {
            const fmtB = (v) => (Abyssea.Utils && Abyssea.Utils.formatNum) ? Abyssea.Utils.formatNum(Math.round(v)) : Math.round(v);
            phaseLine = tr('hud.dungPhaseLive', {
              phase: dung.boss.phase || 1,
              hp: fmtB(Math.ceil(dung.boss.hp)),
              maxHp: fmtB(dung.boss.maxHp)
            });
          } else if (dung.gateOpen) {
            phaseLine = tr('hud.dungConquered');
          }
          const dName = dung.def.name;
          let dObj = '';
          if (dung.isLateBiome) {
            const isEn = Abyssea.I18n && Abyssea.I18n.getLanguage && Abyssea.I18n.getLanguage() === 'en';
            const mini2Txt = dung.miniBoss2Defeated ? tr('hud.dungDefeated') : tr('hud.dungPending');
            const shrineTxt = `${dung.shrineProgress || 0}/${dung.shrineTarget || 2}`;
            dObj = isEn
              ? `Wings: ${wingDone}/2 · Runes: ${seqTxt} · Guardian 1: ${miniTxt} · Guardian 2: ${mini2Txt} · Shrines: ${shrineTxt} · Gate: ${gateTxt}${phaseLine}`
              : `Alas: ${wingDone}/2 · Runas: ${seqTxt} · Guardián 1: ${miniTxt} · Guardián 2: ${mini2Txt} · Altares: ${shrineTxt} · Puerta: ${gateTxt}${phaseLine}`;
          } else {
            dObj = tr('hud.dungObjLine', { wings: wingDone, seq: seqTxt, mini: miniTxt, gate: gateTxt, phaseLine });
          }
          if (Array.isArray(dung.affixes) && dung.affixes.length > 0 && Abyssea.DUNGEON_AFFIXES) {
            const afNames = dung.affixes.map(id => (Abyssea.DUNGEON_AFFIXES[id] && Abyssea.DUNGEON_AFFIXES[id].name) || id).join(', ');
            dObj += ` · Afijos: ${afNames}`;
          }
          const dKey = `${dName}|${dObj}`;
          if (force || dKey !== this._lastDungKey) {
            this._lastDungKey = dKey;
            const nEl = document.getElementById('dungeon-hud-name');
            const oEl = document.getElementById('dungeon-hud-obj');
            if (nEl) nEl.textContent = dName;
            if (oEl) oEl.textContent = dObj;
          }
          dungHud.classList.remove('hidden');
        }
      }

      // Centered Level-Up Celebration Banner (zero per-tick getBoundingClientRect reflows!)
      const lvlEl = H.lvlEl;
      if (lvlEl) {
        if (g.levelBannerTimer > 0 && g.levelUpSummary) {
          const s = g.levelUpSummary;
          if (s.title) {
            const lKey = `custom:${s.title}:${s.subtitle || ''}`;
            if (this._lastLevelBannerKey !== lKey) {
              this._lastLevelBannerKey = lKey;
              lvlEl.innerHTML = '';
              lvlEl.appendChild(this.el('div', { class: 'levelup-banner-title' }, s.title));
              if (s.subtitle) lvlEl.appendChild(this.el('div', { class: 'levelup-banner-sub' }, s.subtitle));
            }
            lvlEl.classList.remove('hidden');
          } else if (s.from !== undefined && s.to !== undefined) {
            const pts = (s.pts !== undefined && s.pts !== null) ? s.pts : ((s.points !== undefined && s.points !== null) ? s.points : 1);
            const langCode = Abyssea.I18n ? Abyssea.I18n.getLanguage() : 'en';
            const lKey = `${langCode}:${s.from}:${s.to}:${pts}`;
            if (this._lastLevelBannerKey !== lKey) {
              this._lastLevelBannerKey = lKey;
              lvlEl.innerHTML = '';
              lvlEl.appendChild(this.el('div', { class: 'levelup-banner-title' }, tr('hud.levelUpBannerTitle', { from: s.from, to: s.to })));
              lvlEl.appendChild(this.el('div', { class: 'levelup-banner-sub' }, tr('hud.levelUpBannerSub', { pts, s: pts === 1 ? '' : 's' })));
            }
            lvlEl.classList.remove('hidden');
          } else {
            lvlEl.classList.add('hidden');
          }
          if (!lvlEl.classList.contains('hidden')) {
            const hasTarget = H.tCard && !H.tCard.classList.contains('hidden');
            const bossEl = document.getElementById('boss-bar');
            const hasBoss = bossEl && !bossEl.classList.contains('hidden');
            const safeTop = hasBoss ? 228 : hasTarget ? 194 : 156;
            const topStr = `${safeTop}px`;
            if (lvlEl.style.top !== topStr) lvlEl.style.top = topStr;
          }
        } else if (this._lastLevelBannerKey !== '') {
          this._lastLevelBannerKey = '';
          lvlEl.classList.add('hidden');
        }
      }

      // Floating Altar Blessing Notifications (in-place timer updates + zero layout reflow thrashing)
      const altarStack = H.altarStack;
      if (altarStack) {
        const notices = (!(g.isPlayerDead && g.isPlayerDead()) && Array.isArray(g.altarNotifications)) ? g.altarNotifications : [];
        if (notices.length === 0) {
          if (this._lastAltarKey !== '') {
            this._lastAltarKey = '';
            this._altarDurEls = null;
            altarStack.innerHTML = '';
            altarStack.classList.add('hidden');
          }
        } else {
          altarStack.classList.remove('hidden');
          const structSig = `${Abyssea.I18n ? Abyssea.I18n.getLanguage() : 'en'}|` +
            notices.map(n => `${n.uid}:${n.rev || 1}:${n.status}:${n.leaving ? 1 : 0}`).join('|');
          if (force || structSig !== this._lastAltarKey) {
            this._lastAltarKey = structSig;
            this._altarDurEls = [];
            altarStack.innerHTML = '';
            notices.forEach(n => {
              let durLine = n.durationText || tr('hud.altarInstant');
              if ((n.status === 'active' || n.status === 'renewed') && Array.isArray(n.buffKeys) && n.buffKeys.length > 0 && g.activeBuffs && g.activeBuffs[n.buffKeys[0]]) {
                const rem = Math.max(0, Math.ceil(g.activeBuffs[n.buffKeys[0]].time));
                durLine = n.durationSec ? tr('hud.altarDurRem', { total: n.durationSec, rem }) : `${rem}s`;
              }
              const cardCls = [
                'altar-blessing-card',
                n.status === 'renewed' ? 'is-renewed' : '',
                n.status === 'replaced' ? 'is-replaced' : '',
                n.status === 'expired' ? 'is-expired' : '',
                n.leaving ? 'is-leaving' : ''
              ].filter(Boolean).join(' ');
              const durSpan = this.el('span', { class: 'altar-blessing-dur' }, durLine);
              this._altarDurEls.push({ notice: n, span: durSpan });
              const card = this.el('div', {
                class: cardCls,
                style: `--blessing-accent:${n.color || '#ffd54f'};`
              }, [
                this.el('div', { class: 'altar-blessing-icon-box' }, [
                  n.iconUrl ? this.el('img', { class: 'pixel-img', src: encodeURI(n.iconUrl), width: 26, height: 26, alt: n.title || '' }) : null
                ]),
                this.el('div', { class: 'altar-blessing-body' }, [
                  this.el('div', { class: 'altar-blessing-title' }, n.kicker || n.title || tr('hud.altarFallbackSub')),
                  this.el('div', { class: 'altar-blessing-kicker' }, n.title || tr('hud.altarFallbackTitle')),
                  this.el('div', { class: 'altar-blessing-desc' }, n.effectText || ''),
                  this.el('div', { class: 'altar-blessing-meta' }, [durSpan])
                ])
              ]);
              altarStack.appendChild(card);
            });
          } else if (Array.isArray(this._altarDurEls)) {
            for (const rec of this._altarDurEls) {
              const n = rec.notice;
              if ((n.status === 'active' || n.status === 'renewed') && Array.isArray(n.buffKeys) && n.buffKeys.length > 0 && g.activeBuffs && g.activeBuffs[n.buffKeys[0]]) {
                const rem = Math.max(0, Math.ceil(g.activeBuffs[n.buffKeys[0]].time));
                const nextLine = n.durationSec ? tr('hud.altarDurRem', { total: n.durationSec, rem }) : `${rem}s`;
                if (rec.span.textContent !== nextLine) rec.span.textContent = nextLine;
              }
            }
          }

          // Pure math positioning above the hero without synchronous layout reflow queries
          const sc = this.getUiScale ? this.getUiScale() : 1;
          const hudW = (window.innerWidth || 1280) / sc;
          const hudH = (window.innerHeight || 720) / sc;
          const canvas = g.canvas || document.getElementById('game-canvas');
          const cw = canvas ? canvas.width : window.innerWidth;
          const ch = canvas ? canvas.height : window.innerHeight;
          const zoom = (g.camera && g.camera.zoom) || 1;
          const pxScr = (cw * 0.5 + ((g.player ? g.player.x : g.camera.x) - g.camera.x) * zoom) / sc;
          const pyScr = (ch * 0.5 + ((g.player ? g.player.y : g.camera.y) - g.camera.y) * zoom) / sc;
          const halfCardW = Math.min(190, Math.floor((hudW - 32) / 2));
          const leftPx = Math.max(halfCardW + 16, Math.min(hudW - halfCardW - 16, Math.round(pxScr)));
          const minTopSafe = g.levelBannerTimer > 0 ? 248 : 112;
          const estH = Math.max(88, notices.length * 102);
          const maxBottomFromHotbar = 114;
          const maxBottomBeforeTopHud = Math.max(maxBottomFromHotbar, Math.round(hudH - minTopSafe - estH));
          const desiredBottom = Math.round(hudH - (pyScr - (56 * zoom) / sc));
          const clampedBottom = Math.max(maxBottomFromHotbar, Math.min(maxBottomBeforeTopHud, desiredBottom));
          altarStack.style.left = `${leftPx}px`;
          altarStack.style.top = 'auto';
          altarStack.style.bottom = `${clampedBottom}px`;
        }
      }

      // Active potion / elixir buff pills (in-place timer updates + all 10 V14 buffs labeled)
      const topLeft = H.topLeft;
      if (topLeft) {
        let buffBar = document.getElementById('hud-buffs');
        if (!buffBar) {
          buffBar = this.el('div', { id: 'hud-buffs', class: 'hud-buffs-row hidden' });
          const heroPanel = document.getElementById('hero-panel');
          if (heroPanel && heroPanel.parentElement === topLeft) {
            heroPanel.insertAdjacentElement('afterend', buffBar);
          } else {
            topLeft.appendChild(buffBar);
          }
        }
        const entries = Object.entries(g.activeBuffs || {}).filter(([, b]) => b && b.time > 0);
        const langB = Abyssea.I18n && Abyssea.I18n.getLanguage ? Abyssea.I18n.getLanguage() : 'es';
        const isEnB = langB === 'en';
        const buffStructKey = `${langB}|` + entries.map(([k]) => k).join('|');
        const buffLabels = {
          speed: tr('buff.speed'), dmg: tr('buff.dmg'), attack: tr('buff.dmg'),
          luck: tr('buff.luck'), xp: tr('buff.xp'), defense: tr('buff.defense'),
          regen: tr('buff.regen'), crit: tr('buff.crit'), arcane: tr('buff.arcane'),
          hunter: tr('buff.hunter'), furia_arcana: tr('buff.furia_arcana'),
          titan_skin: isEnB ? 'Titan Skin' : 'Piel de Titán',
          miner_sight: isEnB ? 'Miner Sight' : 'Vista Minera',
          chrono_haste: isEnB ? 'Chrono Haste' : 'Celeridad Crono',
          vampiric_thirst: isEnB ? 'Vampiric Thirst' : 'Sed Vampírica',
          storm_overload: isEnB ? 'Storm Overload' : 'Sobrecarga Tormenta',
          golden_fortune: isEnB ? 'Golden Fortune' : 'Fortuna Dorada',
          phantom_step: isEnB ? 'Phantom Step' : 'Paso Fantasmal',
          colossus_might: isEnB ? 'Colossus Might' : 'Fuerza Coloso',
          radiant_harvest: isEnB ? 'Radiant Harvest' : 'Cosecha Radiante',
          omega_transcendence: isEnB ? 'Omega Transcendence' : 'Trascendencia Omega'
        };
        if (force || buffStructKey !== this._lastBuffKey) {
          this._lastBuffKey = buffStructKey;
          this._buffNodes = new Map();
          buffBar.innerHTML = '';
          if (entries.length === 0) {
            buffBar.classList.add('hidden');
          } else {
            const urlMap = Abyssea.BUFF_ICON_URLS || {};
            const fallbackMap = {
              titan_skin: 'defense', miner_sight: 'luck', chrono_haste: 'speed',
              vampiric_thirst: 'regen', storm_overload: 'arcane', golden_fortune: 'luck',
              phantom_step: 'speed', colossus_might: 'dmg', radiant_harvest: 'xp',
              omega_transcendence: 'furia_arcana'
            };
            buffBar.classList.remove('hidden');
            entries.forEach(([k, b]) => {
              const iconUrl = urlMap[k] || urlMap[fallbackMap[k]] || urlMap.speed;
              const pct = Math.round(((b.mult || 1) - 1) * 100);
              const label = buffLabels[k] || k;
              const rem = Math.ceil(b.time);
              const txtSpan = this.el('span', {}, `${label} ${rem}s`);
              const pill = this.el('div', {
                class: 'hud-buff-pill',
                'data-tip-text': tr('hud.buffTitle', { label, pct, src: b.sourceName ? ' · ' + b.sourceName : '', rem })
              }, [
                iconUrl ? this.el('img', { class: 'pixel-img', src: iconUrl, width: 18, height: 18, alt: label }) : null,
                txtSpan
              ]);
              this._buffNodes.set(k, { pill, txtSpan, label });
              buffBar.appendChild(pill);
            });
          }
        } else if (this._buffNodes && entries.length > 0) {
          entries.forEach(([k, b]) => {
            const rec = this._buffNodes.get(k);
            if (!rec) return;
            const rem = Math.ceil(b.time);
            const txt = `${rec.label} ${rem}s`;
            if (rec.txtSpan.textContent !== txt) {
              rec.txtSpan.textContent = txt;
              const pct = Math.round(((b.mult || 1) - 1) * 100);
              rec.pill.setAttribute('data-tip-text', tr('hud.buffTitle', { label: rec.label, pct, src: b.sourceName ? ' · ' + b.sourceName : '', rem }));
            }
          });
        }
      }

      const tCard = document.getElementById('hud-target');
      if (tCard) {
        const ht = g.hoveredTarget;
        if (!ht) {
          if (this._lastTargetKey !== '') {
            this._lastTargetKey = '';
            this._lastTargetHp = null;
            tCard.classList.add('hidden');
          }
        } else {
          // Clave de ESTRUCTURA: solo cambia cuando el tipo/nombre/icono cambia — NO incluye HP ni sub dinámico
          const thumbSig = ht.thumbSpec ? `${ht.thumbSpec.prefix || ''}:${ht.thumbSpec.key || ''}:${ht.thumbSpec.fx || 0}:${ht.thumbSpec.fy || 0}` : '';
          const iconIdentity = ht.iconUrl ? String(ht.iconUrl).slice(0, 64) : (thumbSig || ht.itemIcon || ht.iconKey || '');
          const layoutKey = `${ht.kind}:${ht.name}:${iconIdentity}`;

          if (force || layoutKey !== this._lastTargetKey) {
            // Reconstruir DOM solo cuando cambia la entidad/icono
            this._lastTargetKey = layoutKey;
            this._lastTargetHp = null;
            tCard.innerHTML = '';
            tCard.classList.remove('hidden');
            let iconEl = null;
            if (ht.iconUrl) {
              iconEl = this.el('img', { class: 'pixel-img', src: encodeURI(ht.iconUrl), width: 32, height: 32, alt: '' });
            } else if (ht.thumbSpec && Abyssea.Assets && Abyssea.Assets.getSpriteThumbCanvas) {
              const srcC = Abyssea.Assets.getSpriteThumbCanvas(ht.thumbSpec);
              if (srcC) {
                const c = document.createElement('canvas');
                c.width = 32; c.height = 32; c.className = 'pixel-img';
                const cctx = c.getContext('2d');
                cctx.imageSmoothingEnabled = false;
                cctx.drawImage(srcC, 0, 0, srcC.width, srcC.height, 0, 0, 32, 32);
                iconEl = c;
              }
            }
            if (!iconEl && ht.itemIcon) {
              iconEl = this.itemIcon(ht.itemIcon, 32);
            } else if (!iconEl && ht.iconKey) {
              iconEl = this.itemIcon(ht.iconKey, 32);
            } else if (!iconEl) {
              const fallbackKindKey = ht.kind === 'enemy' ? 'espada_hierro' : (ht.kind === 'animal' ? 'lana' : (ht.kind === 'altar' ? 'reliquia_antigua' : 'piedra'));
              iconEl = this.itemIcon(fallbackKindKey, 32);
            }
            const infoKids = [
              this.el('div', { class: 'hud-target-name' }, ht.name || tr('hud.targetDefault')),
              ht.sub ? this.el('div', { class: 'hud-target-sub', 'data-tgsub': '1' }, ht.sub) : null,
              ht.sub2 ? this.el('div', { class: 'hud-target-sub2' }, ht.sub2) : null
            ];
            if (ht.hp != null && ht.maxHp > 0) {
              infoKids.push(this.el('div', { class: 'hud-target-hp' }, [
                this.el('div', { class: 'hud-target-hp-fill', 'data-tghp': '1', style: `width:${Math.max(0,Math.min(100,Math.round((ht.hp/ht.maxHp)*100)))}%` })
              ]));
            }
            tCard.appendChild(iconEl);
            tCard.appendChild(this.el('div', { class: 'hud-target-info' }, infoKids));
          } else if (ht.hp != null && ht.maxHp > 0) {
            // Solo actualizar barra de HP en DOM existente — sin reconstruir nada
            const hpPct = Math.max(0, Math.min(100, Math.round((ht.hp / ht.maxHp) * 100)));
            if (hpPct !== this._lastTargetHp) {
              this._lastTargetHp = hpPct;
              const fill = tCard.querySelector('[data-tghp]');
              if (fill) fill.style.width = `${hpPct}%`;
              const subEl = tCard.querySelector('[data-tgsub]');
              if (subEl && ht.sub) subEl.textContent = ht.sub;
            }
          }
        }
      }

      const warnEl = document.getElementById('warning-banner');
      if (warnEl) {
        if (g.warningBanner && g.warningBanner.text && g.warningBanner.time > 0) {
          if (warnEl.textContent !== g.warningBanner.text) warnEl.textContent = g.warningBanner.text;
          warnEl.classList.remove('hidden');
        } else {
          warnEl.classList.add('hidden');
        }
      }

      const bossBar = document.getElementById('boss-bar');
      const dungPtx = g.activeDungeon ? Math.floor(g.player.x / TILE_SIZE) : 0;
      const dungPty = g.activeDungeon ? Math.floor(g.player.y / TILE_SIZE) : 0;
      const bossMinX = (g.activeDungeon && g.activeDungeon.bossRoomMinX) || 34;
      if (g.activeDungeon && g.activeDungeon.boss && g.activeDungeon.boss.hp > 0 && dungPtx >= bossMinX && dungPty >= 9 && dungPty <= 29) {
        const b = g.activeDungeon.boss;
        bossBar.classList.remove('hidden');
        document.getElementById('boss-name').textContent = tr('hud.bossPhaseTitle', { name: b.name, phase: b.phase });
        document.getElementById('boss-hp-fill').style.width = `${Math.max(0, (b.hp / b.maxHp) * 100)}%`;
      } else {
        bossBar.classList.add('hidden');
      }

      const bb = document.getElementById('build-banner');
      if (g.placingBuildingId && Abyssea.BUILDINGS[g.placingBuildingId]) {
        bb.classList.remove('hidden');
        document.getElementById('build-banner-name').textContent = Abyssea.BUILDINGS[g.placingBuildingId].name;
      } else {
        bb.classList.add('hidden');
      }

      const edBtn = document.getElementById('btn-exit-dungeon');
      const bossLocked = !!(g.activeDungeon && g.activeDungeon.bossLocked && g.activeDungeon.boss && g.activeDungeon.boss.hp > 0);
      if (g.activeDungeon && !bossLocked) edBtn.classList.remove('hidden');
      else edBtn.classList.add('hidden');

      // Universal 9-slot Hotbar (1..9 holds ANY item or unlocked tool; Shift+Click swaps slots; diff-cached!)
      const hb = document.getElementById('hotbar');
      if (hb) {
        this._visibleHotbarIndices = [];
        for (let idx = 0; idx < 9; idx++) this._visibleHotbarIndices.push(idx);
        if (g.activeSlot < 0 || g.activeSlot >= 9) {
          g.activeSlot = 0;
        }
        const hbStateParts = [Abyssea.I18n ? Abyssea.I18n.getLanguage() : 'en', String(g.activeSlot)];
        for (let idx = 0; idx < 9; idx++) {
          let slot = g.hotbar[idx];
          if (slot && slot.kind === 'item' && (g.inventory[slot.id] || 0) <= 0) {
            g.hotbar[idx] = null;
            slot = null;
          }
          if (!slot || (slot.kind === 'tool' && !g.toolTiers[slot.id])) {
            hbStateParts.push('empty');
          } else if (slot.kind === 'tool') {
            const tier = g.toolTiers[slot.id] || 'basica';
            const enchCount = g.toolEnchants && g.toolEnchants[slot.id]
              ? Object.values(g.toolEnchants[slot.id]).reduce((a, b) => a + b, 0) : 0;
            const bowAmmoState = slot.id === 'arco'
              ? `:${(g.inventory && g.inventory.flecha) || 0}:${g.player && g.player.bowReloadTimer > 0 ? 'rel' : (g.player && g.player.bowLoaded ? 'rdy' : 'emp')}`
              : '';
            hbStateParts.push(`T:${slot.id}:${tier}:${enchCount}${bowAmmoState}`);
          } else {
            hbStateParts.push(`I:${slot.id}:${g.inventory[slot.id] || 0}`);
          }
        }
        const hbKey = hbStateParts.join('|');
        if (force || hbKey !== this._lastHotbarKey) {
          this._lastHotbarKey = hbKey;
          hb.innerHTML = '';
          for (let idx = 0; idx < 9; idx++) {
            const slot = g.hotbar[idx];
            const isTool = slot && slot.kind === 'tool';
            const isItemReady = slot && slot.kind === 'item' && (g.inventory[slot.id] || 0) > 0 && Abyssea.ITEMS[slot.id];
            const hasContent = Boolean((isTool && g.toolTiers[slot.id]) || isItemReady);
            const labelKey = String(idx + 1);

            if (!hasContent) {
              const emptyDiv = this.el('div', {
                class: 'hotbar-slot slot-empty' + (g.activeSlot === idx ? ' active' : ''),
                title: tr('hud.hotbarEmptyTip', { key: labelKey }),
                onclick: (ev) => {
                  if (g.isPlayerDead && g.isPlayerDead()) return;
                  if (ev && ev.shiftKey && g.activeSlot !== idx && g.swapHotbarSlots) {
                    g.swapHotbarSlots(g.activeSlot, idx);
                    g.activeSlot = idx;
                  } else {
                    g.activeSlot = idx;
                  }
                  this.updateHUD(true);
                }
              });
              emptyDiv.appendChild(this.el('span', { class: 'slot-key' }, labelKey));
              hb.appendChild(emptyDiv);
              continue;
            }

            const enchCount = isTool && g.toolEnchants && g.toolEnchants[slot.id]
              ? Object.values(g.toolEnchants[slot.id]).reduce((a, b) => a + b, 0) : 0;

            const sDiv = this.el('div', {
              class: 'hotbar-slot' + (g.activeSlot === idx ? ' active' : ''),
              title: (isTool
                ? `${Abyssea.TOOLS[slot.id].name} (${Abyssea.TIER_META[g.toolTiers[slot.id]].name})` + (enchCount > 0 ? tr('hud.enchantedSuffix') : '')
                : (Abyssea.ITEMS[slot.id] ? Abyssea.ITEMS[slot.id].name : tr('hover.toolFallback'))) + tr('hud.hotbarTipSuffix'),
              onclick: (ev) => {
                if (g.isPlayerDead && g.isPlayerDead()) return;
                if (ev && ev.shiftKey && g.transferHotbarToInventory) {
                  const moved = g.transferHotbarToInventory(idx);
                  if (moved) {
                    this.updateHUD(true);
                    if (this.hasOpenModal && this.hasOpenModal()) this.renderModal();
                  }
                  return;
                }
                g.activeSlot = idx;
                this.updateHUD(true);
              }
            });
            sDiv.appendChild(this.el('span', { class: 'slot-key' }, labelKey));

            if (isTool) {
              const tier = g.toolTiers[slot.id] || 'basica';
              sDiv.appendChild(this.toolIcon(slot.id, tier, 38));
              const tm = Abyssea.TIER_META[tier];
              sDiv.style.boxShadow = g.activeSlot === idx
                ? `0 0 14px rgba(255,213,79,0.5), inset 0 -3px 0 ${tm.color}`
                : `inset 0 -3px 0 ${tm.color}`;
              if (enchCount > 0) {
                sDiv.appendChild(this.el('span', { class: 'slot-ench-pip' }, '+'));
              }
              if (slot.id === 'arco') {
                const arrowCnt = (g.inventory && g.inventory.flecha) || 0;
                const isRel = Boolean(g.player && g.player.bowReloadTimer > 0);
                sDiv.appendChild(this.el('span', {
                  class: 'slot-qty',
                  style: arrowCnt <= 0 ? 'color:#ff8a65;' : (isRel ? 'color:#ffe082;' : '')
                }, isRel ? '...' : String(arrowCnt)));
              }
            } else if (slot.kind === 'item' && (g.inventory[slot.id] || 0) > 0) {
              const it = Abyssea.ITEMS[slot.id];
              if (it) {
                const maxStack = g.getMaxStackSize ? g.getMaxStackSize() : 25;
                const showQty = Math.min(g.inventory[slot.id], maxStack);
                sDiv.appendChild(this.itemIcon(it.icon, 36));
                sDiv.appendChild(this.el('span', { class: 'slot-qty' }, String(showQty)));
              }
            }
            hb.appendChild(sDiv);
          }
        }
      }

      // 4-slot Active Spell Bar + Grimorio Button
      const sb = document.getElementById('spell-bar');
      if (sb) {
        const kb = this.keybinds || DEFAULT_KEYBINDS;
        const slots = Array.isArray(g.spellSlots) ? g.spellSlots : ['misil_arcano', null, null, null];
        const cds = g.spellCooldowns || {};
        const keyCodes = [kb.spell1 || 'KeyZ', kb.spell2 || 'KeyT', kb.spell3 || 'KeyB', kb.spell4 || 'KeyN'];
        const sbParts = slots.map((sid, i) => {
          const sp = sid && Abyssea.SPELLS && Abyssea.SPELLS[sid];
          const rem = sid && cds[sid] ? Math.ceil(cds[sid] * 10) : 0;
          return `${keyCodes[i]}:${sp ? sp.id : 'none'}:${rem}`;
        });
        const sbKey = `${Abyssea.I18n ? Abyssea.I18n.getLanguage() : 'en'}:${sbParts.join('|')}`;
        if (force || sbKey !== this._lastSpellBarKey) {
          this._lastSpellBarKey = sbKey;
          sb.innerHTML = '';
          slots.forEach((sid, idx) => {
            const keyLbl = this.formatKeyCode(keyCodes[idx] || '');
            const sp = sid && Abyssea.SPELLS && Abyssea.SPELLS[sid];
            if (!sp) {
              const emptyS = this.el('div', {
                class: 'spell-slot slot-empty',
                'data-tip-text': tr('hud.spellEmptyTip', { key: keyLbl }),
                onclick: () => this.openModal('grimorio')
              });
              emptyS.appendChild(this.el('span', { class: 'slot-key' }, keyLbl));
              sb.appendChild(emptyS);
              return;
            }
            const remCd = cds[sid] || 0;
            const manaSave = Math.min(0.45, (g.mods.manaSave || 0) + (g.mods.energySave || 0) * 0.4);
            const effCost = Math.max(2, Math.round((sp.cost || 10) * (1 - manaSave)));
            const sBtn = this.el('div', {
              class: 'spell-slot' + (remCd > 0.05 ? ' spell-on-cd' : ''),
              'data-tip-text': tr('hud.spellTip', { name: sp.name, key: keyLbl, cost: effCost, desc: sp.desc }),
              onclick: () => g.castSpell(idx),
              oncontextmenu: (ev) => { ev.preventDefault(); this.openModal('grimorio'); }
            });
            sBtn.appendChild(this.el('span', { class: 'slot-key' }, keyLbl));
            sBtn.appendChild(this.itemIcon(sp.icon, 32));
            sBtn.appendChild(this.el('span', { class: 'spell-slot-cost' }, String(effCost)));
            if (remCd > 0.05) {
              sBtn.appendChild(this.el('span', { class: 'spell-slot-cd' }, `${remCd.toFixed(1)}`));
            }
            sb.appendChild(sBtn);
          });
          sb.appendChild(this.el('button', {
            type: 'button',
            class: 'spell-book-btn',
            'data-tip-text': tr('hud.openGrimoireTip'),
            onclick: () => this.openModal('grimorio')
          }, [this.uiIcon('spellbook', 26)]));
        }
      }

      // Live timed craft-queue & ready-box sync (skip entirely when crafting/building modal is closed)
      const qBox = (this.activeModal === 'crafting' || this.activeModal === 'building') ? document.getElementById('live-craft-queue-list') : null;
      if (qBox) {
        const queue = g.craftQueue || [];
        const ready = g.craftReady || [];
        if (queue.length !== Number(qBox.dataset.count || 0) || ready.length !== Number(qBox.dataset.readyCount || 0)) {
          if (this.activeModal === 'crafting' || this.activeModal === 'building') this.renderModal();
        } else {
          queue.forEach((job, ji) => {
            const pctEl = document.getElementById(`cq-fill-${ji}`);
            const remEl = document.getElementById(`cq-rem-${ji}`);
            const pct = Math.min(100, Math.round(((job.elapsed || 0) / Math.max(0.1, job.totalTime || 1)) * 100));
            const rem = Math.max(0, (job.totalTime || 0) - (job.elapsed || 0)).toFixed(1);
            if (pctEl) pctEl.style.width = `${pct}%`;
            if (remEl) remEl.textContent = `${rem}s`;
            const busyTid = job.toolUpgrade || job.toolUnlock;
            if (busyTid) {
              const btn = document.querySelector(`[data-tool-busy-id="${busyTid}"]`);
              if (btn) {
                btn.textContent = job.toolUpgrade
                  ? tr('craft.upgradingProgress', { sec: rem })
                  : tr('craft.forgingProgress', { sec: rem });
              }
            }
            const busyArmorSlot = job.armorUpgrade || job.armorUnlock;
            if (busyArmorSlot) {
              const btn = document.querySelector(`[data-armor-busy-slot="${busyArmorSlot}"]`);
              if (btn) {
                btn.textContent = job.armorUpgrade
                  ? tr('craft.upgradingProgress', { sec: rem })
                  : tr('craft.forgingProgress', { sec: rem });
              }
            }
          });
        }
      }
      const cooldownKeys = g.toolUpgradeCooldowns ? Object.keys(g.toolUpgradeCooldowns) : [];
      if (cooldownKeys.length > 0) {
        this._hadToolUpgradeCooldowns = true;
        cooldownKeys.forEach(tid => {
          const btn = document.querySelector(`[data-tool-busy-id="${tid}"][data-busy-kind="cd"]`);
          if (btn) {
            const rem = Math.max(0, g.toolUpgradeCooldowns[tid] || 0).toFixed(1);
            btn.textContent = tr('craft.upgradeCooldown', { sec: rem });
          }
        });
      } else if (this._hadToolUpgradeCooldowns) {
        this._hadToolUpgradeCooldowns = false;
        if (this.activeModal === 'crafting' || this.activeModal === 'building') this.renderModal();
      }
      const armorCooldownKeys = g.armorUpgradeCooldowns ? Object.keys(g.armorUpgradeCooldowns) : [];
      if (armorCooldownKeys.length > 0) {
        this._hadArmorUpgradeCooldowns = true;
        armorCooldownKeys.forEach(sl => {
          const btn = document.querySelector(`[data-armor-busy-slot="${sl}"][data-busy-kind="cd"]`);
          if (btn) {
            const rem = Math.max(0, g.armorUpgradeCooldowns[sl] || 0).toFixed(1);
            btn.textContent = tr('craft.upgradeCooldown', { sec: rem });
          }
        });
      } else if (this._hadArmorUpgradeCooldowns) {
        this._hadArmorUpgradeCooldowns = false;
        if (this.activeModal === 'crafting' || this.activeModal === 'building') this.renderModal();
      }

      // Zero-flicker Toasts reconciliation (never clears/re-animates active toasts)
      const tc = document.getElementById('toast-container');
      if (tc) {
        const activeToasts = new Set(g.toasts);
        for (const [toastObj, el] of this._toastNodes.entries()) {
          if (!activeToasts.has(toastObj)) {
            if (el.parentElement === tc) tc.removeChild(el);
            this._toastNodes.delete(toastObj);
          }
        }
        g.toasts.forEach(t => {
          if (!this._toastNodes.has(t)) {
            const el = this.el('div', { class: 'toast ' + (t.kind || '') + ' is-new' }, t.text);
            this._toastNodes.set(t, el);
            tc.appendChild(el);
          }
        });
      }

      // Zero-flicker 2-second Pickup Feed reconciliation (updates quantities in-place!)
      const pf = document.getElementById('pickup-feed');
      if (pf) {
        const feed = g.pickupFeed || [];
        const activeIds = new Set(feed.map(e => e.id));
        for (const [id, rec] of this._pickupNodes.entries()) {
          if (!activeIds.has(id)) {
            if (rec.el.parentElement === pf) pf.removeChild(rec.el);
            this._pickupNodes.delete(id);
          }
        }
        feed.forEach(entry => {
          const iconKey = entry.id === '_coin'
            ? 'coin_gold'
            : (entry.icon || (Abyssea.ITEMS[entry.id] ? Abyssea.ITEMS[entry.id].icon : 'madera'));
          const opStr = entry.ttl < 0.75 ? Math.max(0.12, entry.ttl / 0.75).toFixed(2) : '1';
          const existing = this._pickupNodes.get(entry.id);
          if (existing) {
            const qtyTxt = `+${entry.qty}`;
            if (existing.qtyEl.textContent !== qtyTxt) existing.qtyEl.textContent = qtyTxt;
            if (existing.el.style.opacity !== opStr) existing.el.style.opacity = opStr;
          } else {
            const qtyEl = this.el('span', { class: 'pickup-qty', style: entry.color ? `color:${entry.color}` : '' }, `+${entry.qty}`);
            const pill = this.el('div', {
              class: 'pickup-pill is-new',
              style: `opacity:${opStr}`
            }, [
              this.itemIcon(iconKey, 24),
              qtyEl,
              this.el('span', { class: 'pickup-name' }, entry.name)
            ]);
            this._pickupNodes.set(entry.id, { el: pill, qtyEl });
            pf.appendChild(pill);
          }
        });
      }
    }

    renderModal() {
      this._cleanupActiveModalResources(this.activeModal);
      const titleEl = document.getElementById('modal-title');
      const body = document.getElementById('modal-body');
      const headerTools = document.getElementById('modal-header-tools');
      if (headerTools) {
        headerTools.innerHTML = '';
        headerTools.classList.add('hidden');
      }
      body.innerHTML = '';

      const titles = {
        inventory: tr('inv.title'),
        stats: tr('inv.stats'),
        crafting: tr('craft.title'),
        build: tr('build.title'),
        skills: tr('modal.titleSkillsCount', { n: Object.keys(Abyssea.SKILLS || {}).length }),
        grimorio: tr('grim.learnedTitle', { cur: (this.game.unlockedSpells || []).length, total: Object.keys(Abyssea.SPELLS || {}).length }),
        map: tr('map.title'),
        market: tr('market.title'),
        quests: tr('quests.title'),
        achievements: tr('ach.title'),
        enchant: tr('ench.title'),
        encyclopedia: tr('enc.title'),
        pause: this.pauseView === 'settings' ? tr('settings.title') : tr('pause.title'),
        settings: tr('settings.title'),
        title_settings: tr('settings.title'),
        controls: tr('settings.title'),
        credits: tr('credits.title'),
        relics: (Abyssea.I18n && Abyssea.I18n.getLanguage && Abyssea.I18n.getLanguage() === 'en') ? 'Permanent Relics Vault' : 'Cofre de Reliquias',
        patch_notes: (Abyssea.I18n && Abyssea.I18n.getLanguage && Abyssea.I18n.getLanguage() === 'en')
          ? `Patch Notes — Beta ${this._activePatchVer || '2.0.0-rc2'}`
          : `Cambios Recientes — Beta ${this._activePatchVer || '2.0.0-rc2'}`,
        aquarium: (Abyssea.I18n && Abyssea.I18n.getLanguage && Abyssea.I18n.getLanguage() === 'en') ? 'Dimensional Aquatic Sanctuary' : 'Santuario Acuático Dimensional',
        spell_ritual: (Abyssea.I18n && Abyssea.I18n.getLanguage && Abyssea.I18n.getLanguage() === 'en') ? 'Arcane Summoning Ritual' : 'Ritual de Invocación Arcana',
        reforge: (Abyssea.I18n && Abyssea.I18n.getLanguage && Abyssea.I18n.getLanguage() === 'en') ? 'Reforging Table' : 'Mesa de Reforja',
        alchemy: (Abyssea.I18n && Abyssea.I18n.getLanguage && Abyssea.I18n.getLanguage() === 'en') ? 'Grand Alchemy Laboratory' : 'Gran Laboratorio de Alquimia',
        trophy_hall: (Abyssea.I18n && Abyssea.I18n.getLanguage && Abyssea.I18n.getLanguage() === 'en') ? 'Trophy Hall & Museum' : 'Salón de Trofeos y Museo',
        ghost_merchant: (Abyssea.I18n && Abyssea.I18n.getLanguage && Abyssea.I18n.getLanguage() === 'en') ? 'Ghost Merchant Ship' : 'Barco Mercader Fantasma',
        guild_shop: (Abyssea.I18n && Abyssea.I18n.getLanguage && Abyssea.I18n.getLanguage() === 'en') ? 'Guild Contracts & Cosmetics Shop' : 'Tienda y Contratos del Gremio',
        quit_confirm: tr('quit.title'),
        quit_web_fallback: tr('quit.webFallbackTitle'),
        discord_fallback: tr('title.discord'),
        exit_dungeon_confirm: tr('dungeon.exitTitle'),
        chest: (this.modalData && Abyssea.BUILDINGS[this.modalData.type] && Abyssea.BUILDINGS[this.modalData.type].name) || 'Cofre'
      };
      const backdrop = document.getElementById('modal-backdrop');
      const modalBox = document.getElementById('modal-box');
      const fullModals = new Set(['skills', 'map']);
      const isFullScreen = fullModals.has(this.activeModal);
      if (backdrop) {
        backdrop.classList.toggle('fullscreen-modal', isFullScreen);
      }
      if (modalBox) {
        modalBox.classList.toggle('modal-fullscreen', isFullScreen);
        modalBox.classList.toggle('skills-cosmic-fullscreen', this.activeModal === 'skills');
        modalBox.classList.toggle('map-atlas-fullscreen', this.activeModal === 'map');
        const isCompactMenu = this.activeModal === 'credits' || this.activeModal === 'quit_confirm' || this.activeModal === 'quit_web_fallback' || this.activeModal === 'discord_fallback' || this.activeModal === 'exit_dungeon_confirm';
        modalBox.classList.toggle('pause-root-compact', (this.activeModal === 'pause' && this.pauseView === 'root') || isCompactMenu);
        modalBox.classList.toggle('pause-settings-compact', this.pauseView === 'settings' || this.activeModal === 'title_settings');
        modalBox.classList.toggle('steam-dialog-box', isCompactMenu);
        modalBox.classList.toggle('patch-notes-modal', this.activeModal === 'patch_notes');
        const bTypeNow = this.modalData && (this.modalData.type || this.modalData.defId);
        const isLargeWorkshop = ['alchemy', 'spell_ritual', 'enchant', 'reforge', 'aquarium', 'grimorio'].includes(this.activeModal)
          || (this.activeModal === 'building' && ['caldero_alquimia', 'mesa_reforja', 'mesa_encantamientos', 'portal_acuario', 'mesa_hechiceria'].includes(bTypeNow));
        const isWideWorkshop = ['chest'].includes(this.activeModal) || isLargeWorkshop;
        modalBox.classList.toggle('chest-wide-modal', isWideWorkshop);
        if (isLargeWorkshop) {
          if (backdrop) backdrop.classList.remove('drawer-left');
          modalBox.style.width = 'min(96vw, 1320px)';
          modalBox.style.maxWidth = '1320px';
          modalBox.style.minHeight = 'min(84vh, 760px)';
        } else {
          modalBox.style.width = '';
          modalBox.style.maxWidth = '';
          modalBox.style.minHeight = '';
        }
      }
      if (titles[this.activeModal]) titleEl.textContent = titles[this.activeModal];

      if (this.activeModal === 'inventory') this.renderInventory(body);
      else if (this.activeModal === 'relics') this.renderRelicsModal(body);
      else if (this.activeModal === 'stats') this.renderStats(body);
      else if (this.activeModal === 'crafting') {
        const bType = this.modalData && this.modalData.building && this.modalData.building.type;
        this.renderCrafting(body, bType === 'mesa_artesania' ? { onlyStation: 'mano' } : {});
      }
      else if (this.activeModal === 'build') this.renderBuildMenu(body);
      else if (this.activeModal === 'skills') this.renderSkills(body);
      else if (this.activeModal === 'grimorio') this.renderGrimorio(body);
      else if (this.activeModal === 'map') this.renderMap(body);
      else if (this.activeModal === 'market') this.renderMarket(body);
      else if (this.activeModal === 'quests') this.renderQuests(body);
      else if (this.activeModal === 'achievements') this.renderAchievements(body);
      else if (this.activeModal === 'enchant') this.renderEnchanting(body);
      else if (this.activeModal === 'encyclopedia') this.renderEncyclopedia(body);
      else if (this.activeModal === 'aquarium' && typeof this.renderAquariumModal === 'function') this.renderAquariumModal(body);
      else if (this.activeModal === 'spell_ritual' && typeof this.renderSpellRitualModal === 'function') this.renderSpellRitualModal(body);
      else if (this.activeModal === 'reforge' && typeof this.renderReforgeTab === 'function') this.renderReforgeTab(body);
      else if (this.activeModal === 'alchemy' && typeof this.renderAlchemyLab === 'function') this.renderAlchemyLab(body);
      else if (this.activeModal === 'trophy_hall' && typeof this.renderTrophyHallModal === 'function') this.renderTrophyHallModal(body);
      else if (this.activeModal === 'ghost_merchant' && typeof this.renderGhostMerchantModal === 'function') this.renderGhostMerchantModal(body);
      else if (this.activeModal === 'guild_shop') this.renderQuests(body);
      else if (this.activeModal === 'specialist_villager' && typeof this.renderSpecialistVillagerModal === 'function') { titleEl.textContent = (this.modalData && this.modalData.name) || 'Especialista'; this.renderSpecialistVillagerModal(body, this.modalData); }
      else if (this.activeModal === 'pause' || this.activeModal === 'settings') this.renderPauseMenu(body);
      else if (this.activeModal === 'title_settings') this.renderTitleAudioSettings(body);
      else if (this.activeModal === 'credits') this.renderCreditsModal(body);
      else if (this.activeModal === 'patch_notes') this.renderPatchNotesModal(body);
      else if (this.activeModal === 'quit_confirm') this.renderQuitModal(body, false);
      else if (this.activeModal === 'quit_web_fallback') this.renderQuitModal(body, true);
      else if (this.activeModal === 'discord_fallback') this.renderDiscordFallbackModal(body);
      else if (this.activeModal === 'exit_dungeon_confirm') this.renderExitDungeonConfirmModal(body);
      else if (this.activeModal === 'corrupted_dungeon_choice') this.renderCorruptedDungeonChoice(titleEl, body);
      else if (this.activeModal === 'building') this.renderBuildingInspector(titleEl, body, this.modalData);
      else if (this.activeModal === 'chest') this.renderChestModal(titleEl, body, this.modalData);
      else if (this.activeModal === 'npc') this.renderNpcDialog(titleEl, body, this.modalData);
      else if (this.activeModal === 'controls') {
        this.pauseView = 'settings';
        this.settingsTab = 'controles';
        this.renderPauseMenu(body);
      }
    }

    _buildSearchBar(initialVal, placeholder, onFilter) {
      const inp = this.el('input', {
        type: 'search',
        class: 'modal-search-input',
        placeholder: placeholder || tr('common.search'),
        value: initialVal || ''
      });
      const clr = this.el('button', {
        type: 'button',
        class: 'btn btn-stone btn-sm',
        onclick: () => { inp.value = ''; onFilter(''); inp.focus(); }
      }, tr('modal.clear'));
      inp.addEventListener('input', () => onFilter(inp.value || ''));
      return this.el('div', { class: 'modal-search-bar' }, [inp, clr]);
    }

    _storageItemMatches(itemId, catId, needle) {
      const it = Abyssea.ITEMS && Abyssea.ITEMS[itemId];
      const catGroups = {
        todos: null,
        recursos: ['recursos', 'minerales', 'gemas', 'monstruo'],
        materiales: ['materiales'],
        cultivos: ['semillas', 'alimentos', 'comida', 'pociones', 'cultivos'],
        equipamiento: ['equipamiento', 'herramientas'],
        construccion: ['construccion'],
        especiales: ['especiales', 'magia']
      };
      const allowed = catGroups[catId || 'todos'];
      if (allowed && (!it || !allowed.includes(it.category))) return false;
      if (needle) {
        const q = needle.trim().toLowerCase();
        if (q) {
          const name = (it && it.name ? it.name : itemId).toLowerCase();
          const idLow = String(itemId || '').toLowerCase();
          if (!name.includes(q) && !idLow.includes(q)) return false;
        }
      }
      return true;
    }

    _renderStorageFilterBar(container, stateKey, onFilterChange) {
      this._storageFilters = this._storageFilters || {};
      const st = this._storageFilters[stateKey] || (this._storageFilters[stateKey] = { cat: 'todos', search: '' });
      const tabs = this.el('div', { class: 'tab-row', style: 'margin-bottom:6px;' });
      const tabDefs = [
        ['todos', tr('inv.tabAll')],
        ['recursos', tr('inv.tabRes')],
        ['materiales', tr('inv.tabMat')],
        ['cultivos', tr('inv.tabFood')],
        ['equipamiento', tr('inv.tabGear')],
        ['construccion', tr('inv.tabBlocks')],
        ['especiales', tr('inv.tabSpecial')]
      ];
      const btns = [];
      tabDefs.forEach(([id, lbl]) => {
        const b = this.el('button', {
          type: 'button',
          class: 'tab-btn' + (st.cat === id ? ' active' : ''),
          onclick: () => {
            st.cat = id;
            btns.forEach(x => x.el.classList.toggle('active', x.id === id));
            onFilterChange(st.cat, st.search);
          }
        }, lbl);
        btns.push({ id, el: b });
        tabs.appendChild(b);
      });
      container.appendChild(tabs);
      const sBar = this._buildSearchBar(st.search, tr('inv.searchPlaceholder'), (q) => {
        st.search = q || '';
        onFilterChange(st.cat, st.search);
      });
      container.appendChild(sBar);
      return st;
    }

    renderGrimorio(body) {
      const g = this.game;
      const kb = this.keybinds || DEFAULT_KEYBINDS;
      const unlocked = Array.isArray(g.unlockedSpells) ? g.unlockedSpells : ['misil_arcano'];
      const slots = Array.isArray(g.spellSlots) ? g.spellSlots : ['misil_arcano', null, null, null];
      const keyCodes = [kb.spell1 || 'KeyZ', kb.spell2 || 'KeyT', kb.spell3 || 'KeyB', kb.spell4 || 'KeyN'];

      body.appendChild(this.el('div', { class: 'parchment-box', style: 'margin-bottom:12px;' }, [
        this.el('strong', { style: 'font-size:16px;display:block;margin-bottom:4px;' }, tr('grim.learnedTitle', { cur: unlocked.length, total: Object.keys(Abyssea.SPELLS || {}).length })),
        this.el('div', { style: 'font-size:14px;color:#dbe7f5;line-height:1.45;' }, tr('grim.intro'))
      ]));

      const slotBar = this.el('div', { class: 'grimorio-slots-bar' });
      slots.forEach((sid, idx) => {
        const sp = sid && Abyssea.SPELLS && Abyssea.SPELLS[sid];
        const kLbl = this.formatKeyCode(keyCodes[idx] || '');
        slotBar.appendChild(this.el('div', { class: 'card' + (sp ? ' selected' : '') }, [
          this.el('strong', { style: 'color:#ffd54f;font-size:14px;' }, tr('grim.slotTitle', { n: idx + 1, key: kLbl })),
          sp ? this.el('div', { class: 'card-head', style: 'margin-top:4px;' }, [
            this.itemIcon(sp.icon, 28),
            this.el('span', { style: `color:${sp.color};font-size:15px;` }, sp.name)
          ]) : this.el('div', { style: 'font-size:14px;color:#90a4ae;margin:6px 0;' }, tr('common.empty')),
          sp ? this.el('button', {
            class: 'btn btn-stone btn-sm',
            onclick: () => { g.assignSpellSlot(idx, null); this.updateHUD(true); this.renderModal(); }
          }, tr('grim.remove')) : null
        ]));
      });
      body.appendChild(slotBar);

      const grid = this.el('div', { class: 'grid-cards' });
      Object.values(Abyssea.SPELLS || {}).forEach(sp => {
        const known = unlocked.includes(sp.id);
        const equippedAt = slots.indexOf(sp.id);
        const card = this.el('div', { class: 'card' + (known ? (equippedAt >= 0 ? ' selected' : '') : ' card-locked') }, [
          (() => {
            const sLvl = g.getSpellLevel ? g.getSpellLevel(sp.id) : 1;
            return this.el('div', { class: 'card-head' }, [
              this.itemIcon(sp.icon, 34),
              this.el('div', {}, [
                this.el('div', { style: 'display:flex;align-items:center;gap:6px;' }, [
                  this.el('strong', { style: `color:${known ? sp.color : '#90a4ae'};font-size:16px;` }, sp.name),
                  this.el('span', { style: 'padding:1px 6px;border-radius:4px;font-size:12px;background:#311b92;color:#b388ff;border:1px solid #7c4dff;font-weight:bold;' }, `Nv. ${sLvl}/5`)
                ]),
                this.el('div', { style: 'font-size:14px;color:#b0bec5;' }, tr('grim.spellMeta', { tier: sp.tier, cost: sp.cost, cd: sp.cooldown }))
              ])
            ]);
          })(),
          this.el('div', { style: 'font-size:14px;color:#e6eef6;line-height:1.45;' }, sp.desc)
        ]);
        if (known) {
          const sLvl = g.getSpellLevel ? g.getSpellLevel(sp.id) : 1;
          const upgradeRow = this.el('div', { style: 'margin-top:8px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;' });
          if (sLvl < 5) {
            const cost = g.getSpellUpgradeCost ? g.getSpellUpgradeCost(sp.id) : null;
            const canUp = g.canUpgradeSpell ? g.canUpgradeSpell(sp.id) : false;
            if (cost) {
              upgradeRow.appendChild(this.el('span', { style: 'font-size:13px;color:#94a3b8;' },
                `Mejora: ${cost.coins} Oro + ${cost.crystals} Cristales`));
              upgradeRow.appendChild(this.el('button', {
                class: canUp ? 'btn btn-gold btn-sm' : 'btn btn-stone btn-sm',
                onclick: () => {
                  if (typeof this.openSpellRitualModal === 'function') {
                    this.openSpellRitualModal(sp.id, true);
                  } else if (g.upgradeSpell && g.upgradeSpell(sp.id)) {
                    this.updateHUD(true);
                    this.renderModal();
                  }
                }
              }, `Ritual de Ascensión Nv. ${cost.level} (+25% Daño)`));
            }
          } else {
            upgradeRow.appendChild(this.el('span', { style: 'color:#ffd54f;font-size:13px;font-weight:bold;' }, 'Maestría Máxima (Nivel 5)'));
          }
          card.appendChild(upgradeRow);
          const btnRow = this.el('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;' });
          for (let sIdx = 0; sIdx < 4; sIdx++) {
            const kLbl = this.formatKeyCode(keyCodes[sIdx] || '');
            btnRow.appendChild(this.el('button', {
              class: equippedAt === sIdx ? 'btn btn-gold btn-sm' : 'btn btn-primary btn-sm',
              onclick: () => { g.assignSpellSlot(sIdx, sp.id); this.updateHUD(true); this.renderModal(); }
            }, tr('grim.bindSlot', { key: kLbl })));
          }
          card.appendChild(btnRow);
        } else {
          const ritRec = Abyssea.getSpellRitualRecipe ? Abyssea.getSpellRitualRecipe(sp.id) : { coins: 100, items: { cristales: 2 } };
          const cOk = g.coins >= (ritRec.coins || 0);
          const iOk = Object.entries(ritRec.items || {}).every(([id, q]) => (g.inventory[id] || 0) >= q);
          const canRit = cOk && iOk;
          const offParts = [
            `${ritRec.coins || 0} Oro`,
            ...Object.entries(ritRec.items || {}).map(([id, q]) => `${q}x ${Abyssea.ITEMS[id] ? Abyssea.ITEMS[id].name : id}`)
          ];
          card.appendChild(this.el('div', { style: 'font-size:13px;color:#ffe082;margin-top:6px;' },
            `Ofrenda Ritual: ${offParts.join(' + ')}`));
          card.appendChild(this.el('button', {
            class: canRit ? 'btn btn-gold btn-sm' : 'btn btn-primary btn-sm',
            style: 'margin-top:6px;',
            onclick: () => {
              if (typeof this.openSpellRitualModal === 'function') {
                this.openSpellRitualModal(sp.id, false);
              }
            }
          }, 'Iniciar Ritual de Invocación'));
        }
        grid.appendChild(card);
      });
      body.appendChild(grid);
    }

    renderInventory(body) {
      const g = this.game;
      const maxSlots = g.getMaxInventorySlots ? g.getMaxInventorySlots() : 24;
      const maxStack = g.getMaxStackSize ? g.getMaxStackSize() : 25;
      const usedSlots = g.getUsedInventorySlots ? g.getUsedInventorySlots() : Object.keys(g.inventory).length;
      const bpLabel = g.backpackTier === 3 ? 'Mochila Astral (+24 ranuras, +35 stack)'
                    : g.backpackTier === 2 ? 'Mochila Reforzada (+16 ranuras, +20 stack)'
                    : g.backpackTier === 1 ? 'Mochila de Cuero (+8 ranuras, +10 stack)'
                    : 'Básica (Sin Mochila)';

      const capBar = this.el('div', {
        style: 'display:flex;align-items:center;justify-content:space-between;padding:7px 12px;background:rgba(12,18,28,0.78);border-radius:6px;border:1px solid rgba(255,213,79,0.25);margin-bottom:8px;'
      }, [
        this.el('div', { style: 'display:flex;align-items:center;gap:10px;' }, [
          this.el('span', { class: 'inv-cap-pill' }, `${usedSlots} / ${maxSlots} Ranuras`),
          this.el('span', { style: 'font-size:13px;color:#cbd5e1;' }, `Stack Máximo: ${maxStack}`)
        ]),
        this.el('span', { style: 'font-size:12px;color:#a3e635;font-weight:600;' }, bpLabel)
      ]);
      body.appendChild(capBar);

      const catGroups = {
        todos: null,
        recursos: ['recursos', 'minerales', 'gemas', 'monstruo'],
        materiales: ['materiales'],
        cultivos: ['semillas', 'alimentos', 'comida', 'pociones'],
        equipamiento: ['equipamiento', 'herramientas'],
        construccion: ['construccion'],
        especiales: ['especiales', 'magia']
      };
      const tabs = this.el('div', { class: 'tab-row' });
      [
        ['todos', tr('inv.tabAll')],
        ['recursos', tr('inv.tabRes')],
        ['materiales', tr('inv.tabMat')],
        ['cultivos', tr('inv.tabFood')],
        ['equipamiento', tr('inv.tabGear')],
        ['construccion', tr('inv.tabBlocks')],
        ['especiales', tr('inv.tabSpecial')]
      ].forEach(([id, lbl]) => {
        tabs.appendChild(this.el('button', {
          class: 'tab-btn' + (this.invFilter === id ? ' active' : ''),
          onclick: () => { this.invFilter = id; this.renderModal(); }
        }, lbl));
      });
      body.appendChild(tabs);

      const layout = this.el('div', { class: 'inv-layout' });
      const grid = this.el('div', { class: 'inv-grid' });
      const applyInvSearch = (q) => {
        this.invSearch = q;
        const needle = (q || '').trim().toLowerCase();
        Array.from(grid.children).forEach(ch => {
          const lbl = (ch.getAttribute('aria-label') || ch.textContent || '').toLowerCase();
          ch.style.display = (!needle || lbl.includes(needle)) ? '' : 'none';
        });
      };
      body.appendChild(this._buildSearchBar(this.invSearch, tr('inv.searchPlaceholder'), applyInvSearch));

      const allowedCats = catGroups[this.invFilter];
      const showTools = !allowedCats || allowedCats.includes('herramientas');
      const ownedTools = showTools
        ? Object.values(Abyssea.TOOLS)
            .filter(t => Boolean(g.toolTiers && g.toolTiers[t.id]))
            .filter(t => !(g.hotbar || []).some(s => s && s.kind === 'tool' && s.id === t.id))
        : [];
      const ids = Object.keys(g.inventory).filter(id => {
        const it = Abyssea.ITEMS[id];
        if (!it || !g.inventory[id] || (allowedCats && !allowedCats.includes(it.category))) return false;
        const hbSlots = (g.hotbar || []).filter(s => s && s.kind === 'item' && s.id === id).length;
        const invCount = Math.max(0, g.inventory[id] - hbSlots * maxStack);
        return invCount > 0;
      });

      if (this.selectedToolId && !g.toolTiers[this.selectedToolId]) {
        this.selectedToolId = null;
      }
      if (this.selectedItemId && !g.inventory[this.selectedItemId]) {
        this.selectedItemId = null;
      }
      if (ownedTools.length === 0 && ids.length === 0) {
        grid.appendChild(this.el('div', { class: 'card', style: 'grid-column:1/-1;' }, tr('inv.emptyCat')));
      } else {
        ownedTools.forEach(tool => {
          const tierId = g.toolTiers[tool.id] || 'basica';
          const tierMeta = Abyssea.TIER_META[tierId] || Abyssea.TIER_META.basica;
          const rarity = tierMeta.rarity || 'comun';
          const isSelected = this.selectedToolId === tool.id;
          const slot = this.el('div', {
            class: `inv-slot rarity-${rarity}` + (isSelected ? ' selected' : ''),
            title: `${tool.name} (${tierMeta.name})`,
            'aria-label': `${tool.name} (${tierMeta.name})`,
            onmouseenter: () => { this._hoveredInvSlot = { kind: 'tool', id: tool.id }; },
            onmouseleave: () => { if (this._hoveredInvSlot && this._hoveredInvSlot.id === tool.id) this._hoveredInvSlot = null; },
            onclick: (ev) => {
              if (ev && ev.shiftKey && g.quickTransferToHotbar) {
                const idx = g.quickTransferToHotbar('tool', tool.id);
                Abyssea.Audio.play('pickup');
                g.toast(tr('inv.sentHotbar', { name: `${tool.name} (${tierMeta.name})`, slot: idx + 1 }), 'success');
                this.updateHUD(true);
                this.renderModal();
                return;
              }
              if (this.selectedToolId === tool.id) {
                this.selectedToolId = null;
              } else {
                this.selectedToolId = tool.id;
                this.selectedItemId = null;
              }
              this.renderModal();
            }
          }, [
            this.toolIcon(tool.id, tierId, 46),
            this.el('span', { class: 'slot-qty', style: `color:${tierMeta.color};` }, 'H')
          ]);
          grid.appendChild(slot);
        });
        ids.forEach(id => {
          const it = Abyssea.ITEMS[id];
          const isSelected = !this.selectedToolId && this.selectedItemId === id;
          const hbSlots = (g.hotbar || []).filter(s => s && s.kind === 'item' && s.id === id).length;
          const totalCount = Math.max(0, (g.inventory[id] || 0) - hbSlots * maxStack);
          let remaining = totalCount;
          while (remaining > 0) {
            const stackQty = Math.min(remaining, maxStack);
            remaining -= stackQty;

            const slot = this.el('div', {
              class: `inv-slot rarity-${it.rarity || 'comun'}` + (isSelected ? ' selected' : ''),
              title: `${it.name} (x${stackQty}/${maxStack})`,
              'aria-label': `${it.name} ${stackQty}`,
              onmouseenter: () => { this._hoveredInvSlot = { kind: 'item', id }; },
              onmouseleave: () => { if (this._hoveredInvSlot && this._hoveredInvSlot.id === id) this._hoveredInvSlot = null; },
              onclick: (ev) => {
                if (ev && ev.shiftKey && g.quickTransferToHotbar) {
                  const idx = g.quickTransferToHotbar('item', id);
                  Abyssea.Audio.play('pickup');
                  g.toast(tr('inv.sentHotbar', { name: it.name, slot: idx + 1 }), 'success');
                  this.updateHUD(true);
                  this.renderModal();
                  return;
                }
                if (this.selectedItemId === id) {
                  this.selectedItemId = null;
                } else {
                  this.selectedToolId = null;
                  this.selectedItemId = id;
                }
                this.renderModal();
              }
            }, [
              this.itemIcon(it.icon, 46),
              this.el('span', { class: 'slot-qty' }, String(stackQty))
            ]);
            grid.appendChild(slot);
          }
        });
        if (this.invFilter === 'todos' || !this.invFilter) {
          const emptyCount = Math.max(0, maxSlots - usedSlots);
          for (let i = 0; i < emptyCount; i++) {
            grid.appendChild(this.el('div', { class: 'inv-slot empty-slot' }));
          }
        }
      }
      if (this.invSearch) applyInvSearch(this.invSearch);
      layout.appendChild(grid);

      // Right Parchment Detail & 5-Slot Paperdoll Inspector
      const rightCol = this.el('div', { style: 'display:flex;flex-direction:column;gap:10px;' });

      const selTool = this.selectedToolId && g.toolTiers[this.selectedToolId] && Abyssea.TOOLS[this.selectedToolId];
      const sel = !selTool && this.selectedItemId && Abyssea.ITEMS[this.selectedItemId];
      if (selTool) {
        const tierId = g.toolTiers[selTool.id] || 'basica';
        const stats = Abyssea.getToolStats(selTool.id, tierId);
        const rar = RARITIES[Abyssea.TIER_META[tierId].rarity] || RARITIES.comun;
        const det = this.el('div', { class: 'parchment-box', style: 'display:flex;flex-direction:column;gap:8px;' }, [
          this.el('div', { class: 'card-head' }, [
            this.toolIcon(selTool.id, tierId, 48),
            this.el('div', {}, [
              this.el('strong', { style: 'font-size:18px;' }, `${selTool.name} (${stats.tierName})`),
              this.el('div', {}, this.el('span', { class: 'rarity-tag', style: `background:${rar.bg};color:${rar.color}` }, rar.name))
            ])
          ]),
          this.el('div', { style: 'font-size:16px;line-height:1.45;color:#e6dfd2;' }, selTool.role),
          this.el('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;' }, [
            this.el('span', { class: 'rarity-tag', style: 'background:rgba(40,26,14,0.85);color:#ffd54f;border:1px solid #a87b3d;' }, tr('inv.powerTag', { n: stats.power })),
            this.el('span', { class: 'rarity-tag', style: 'background:rgba(20,38,54,0.85);color:#80deea;border:1px solid #3c789c;' }, tr('inv.speedTag', { n: (stats.speed * stats.swingRate).toFixed(2) })),
            this.el('span', { class: 'rarity-tag', style: 'background:rgba(32,48,26,0.85);color:#aed581;border:1px solid #558b2f;' }, tr('inv.reachTag', { n: (stats.reach / 48).toFixed(1) }))
          ])
        ]);
        const actRow = this.el('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;' });
        actRow.appendChild(this.el('button', {
          class: 'btn btn-gold btn-sm',
          onclick: () => {
            const idx = g.quickTransferToHotbar ? g.quickTransferToHotbar('tool', selTool.id) : 0;
            g.toast(tr('inv.sentHotbar', { name: selTool.name, slot: idx + 1 }), 'info');
            this.updateHUD(true);
            this.renderModal();
          }
        }, tr('inv.sendHotbar')));
        det.appendChild(actRow);
        det.appendChild(this.el('div', { style: 'font-size:16px;color:#ffe8a3;margin-top:4px;' }, tr('inv.assignToolHotbar')));
        const hbRow = this.el('div', { class: 'inv-hotbar-assign' });
        for (let slotNum = 0; slotNum < 9; slotNum++) {
          const cur = g.hotbar[slotNum];
          const isBound = cur && cur.kind === 'tool' && cur.id === selTool.id;
          hbRow.appendChild(this.el('button', {
            class: 'inv-hb-btn' + (isBound ? ' bound' : ''),
            title: isBound ? tr('inv.removeSlot', { slot: slotNum + 1 }) : tr('inv.pinSlot', { name: selTool.name, slot: slotNum + 1 }),
            onclick: () => {
              if (isBound) {
                g.assignHotbarSlot(slotNum, null, null);
                g.toast(tr('inv.slotFreed', { slot: slotNum + 1 }), 'info');
              } else {
                g.assignHotbarSlot(slotNum, 'tool', selTool.id);
                g.toast(tr('inv.assignedSlot', { name: selTool.name, slot: slotNum + 1 }), 'info');
              }
              this.updateHUD(true);
              this.renderModal();
            }
          }, String(slotNum + 1)));
        }
        det.appendChild(hbRow);
        det.appendChild(this.el('button', {
          class: 'btn btn-stone btn-sm',
          style: 'margin-top:8px;font-size:13px;width:100%;',
          onclick: () => {
            this.selectedToolId = null;
            this.selectedItemId = null;
            this.renderModal();
          }
        }, '← Volver a Equipo / Estadísticas'));
        rightCol.appendChild(det);
      } else if (sel) {
        const rar = RARITIES[sel.rarity] || RARITIES.comun;
        const hpGain = sel.healHp || (sel.edible && sel.edible.hp) || 0;
        const enGain = sel.healEnergy || (sel.edible && sel.edible.energy) || 0;
        const ed = sel.edible;
        const statChips = [];
        if (hpGain > 0) {
          statChips.push(this.el('span', {
            class: 'rarity-tag',
            style: 'background:rgba(20,58,28,0.9);color:#81c784;border:1px solid #4caf50;'
          }, tr('inv.healGradual', { n: hpGain })));
        }
        if (enGain > 0) {
          statChips.push(this.el('span', {
            class: 'rarity-tag',
            style: 'background:rgba(16,44,64,0.9);color:#4fc3f7;border:1px solid #29b6f6;'
          }, tr('inv.enGain', { n: enGain })));
        }
        if (sel.buff) {
          statChips.push(this.el('span', {
            class: 'rarity-tag',
            style: 'background:rgba(68,38,14,0.9);color:#ffd54f;border:1px solid #ffb300;'
          }, tr('inv.buffTag', { type: sel.buff.type, dur: sel.buff.duration })));
        }
        if (ed && ed.speedBoost) {
          statChips.push(this.el('span', {
            class: 'rarity-tag',
            style: 'background:rgba(20,46,60,0.9);color:#80deea;border:1px solid #26c6da;'
          }, tr('inv.speedBuff', { dur: ed.speedBoost })));
        }
        if (ed && ed.dmgBoost) {
          statChips.push(this.el('span', {
            class: 'rarity-tag',
            style: 'background:rgba(68,24,24,0.9);color:#ff8a80;border:1px solid #ef5350;'
          }, tr('inv.dmgBuff', { dur: ed.dmgBoost })));
        }
        if (ed && ed.luckBoost) {
          statChips.push(this.el('span', {
            class: 'rarity-tag',
            style: 'background:rgba(56,28,68,0.9);color:#ea80fc;border:1px solid #ba68c8;'
          }, tr('inv.luckBuff', { dur: ed.luckBoost })));
        }
        const det = this.el('div', { class: 'parchment-box', style: 'display:flex;flex-direction:column;gap:8px;' }, [
          this.el('div', { class: 'card-head' }, [
            this.itemIcon(sel.icon, 48),
            this.el('div', {}, [
              this.el('strong', { style: 'font-size:18px;' }, sel.name),
              this.el('div', {}, this.el('span', { class: 'rarity-tag', style: `background:${rar.bg};color:${rar.color}` }, rar.name))
            ])
          ]),
          this.el('div', { style: 'font-size:16px;line-height:1.45;color:#e6dfd2;' }, sel.desc),
          this._buildWeaponStatsBox(sel),
          (sel.equipSlot && (sel.stats || sel.bonus)) ? (() => {
            const sk = sel.equipSlot === 'helmet' ? 'helm' : sel.equipSlot;
            const eqId = g.equipped && g.equipped[sk];
            const eqIt = eqId && eqId !== sel.id ? Abyssea.ITEMS[eqId] : null;
            return this._buildArmorComparisonBox(eqIt, sel);
          })() : null,
          statChips.length > 0 ? this.el('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;' }, statChips) : null,
          this.el('div', { style: 'font-size:16px;color:#9ec5ff;' }, tr('inv.sourceValue', { source: sel.source, value: sel.sellValue }))
        ]);
        const actRow = this.el('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;' });
        if (sel.placeBuilding) {
          actRow.appendChild(this.el('button', {
            class: 'btn btn-green btn-sm',
            onclick: () => { g.useOrEquipItem(sel.id); this.closeModal(); this.updateHUD(true); }
          }, tr('inv.placeIsland')));
        } else if (sel.isLaserWeapon) {
          actRow.appendChild(this.el('button', {
            class: 'btn btn-green btn-sm',
            onclick: () => {
              const slotIdx = g.quickTransferToHotbar ? g.quickTransferToHotbar('item', sel.id) : 7;
              g.activeSlot = slotIdx;
              g.toast(tr('inv.equippedGunToast', { name: sel.name, slot: slotIdx + 1 }), 'success');
              this.closeModal();
              this.updateHUD(true);
            }
          }, tr('inv.equipUse')));
        } else if (sel.consumable || sel.equipSlot || sel.backpackTier) {
          actRow.appendChild(this.el('button', {
            class: 'btn btn-green btn-sm',
            onclick: () => { g.useOrEquipItem(sel.id); this.renderModal(); }
          }, sel.backpackTier ? 'Equipar Mochila' : sel.equipSlot ? tr('common.equip') : sel.isBomb ? tr('inv.throwExplosive') : tr('inv.useConsume')));
        }
        actRow.appendChild(this.el('button', {
          class: 'btn btn-gold btn-sm',
          title: tr('inv.shiftHint'),
          onclick: () => {
            const idx = g.quickTransferToHotbar ? g.quickTransferToHotbar('item', sel.id) : 7;
            g.toast(tr('inv.sentHotbar', { name: sel.name, slot: idx + 1 }), 'info');
            this.updateHUD(true);
            this.renderModal();
          }
        }, tr('inv.sendHotbar')));
        det.appendChild(actRow);

        det.appendChild(this.el('div', { style: 'font-size:16px;color:#ffe8a3;margin-top:4px;' }, tr('inv.assignItemHotbar')));
        const hbRow = this.el('div', { class: 'inv-hotbar-assign' });
        for (let slotNum = 0; slotNum < 9; slotNum++) {
          const cur = g.hotbar[slotNum];
          const isBound = cur && cur.kind === 'item' && cur.id === sel.id;
          hbRow.appendChild(this.el('button', {
            class: 'inv-hb-btn' + (isBound ? ' bound' : ''),
            title: isBound ? tr('inv.removeSlot', { slot: slotNum + 1 }) : tr('inv.pinSlot', { name: sel.name, slot: slotNum + 1 }),
            onclick: () => {
              if (isBound && g.assignHotbarSlot) {
                g.assignHotbarSlot(slotNum, null, null);
                g.toast(tr('inv.slotFreed', { slot: slotNum + 1 }), 'info');
              } else if (g.assignHotbarSlot) {
                g.assignHotbarSlot(slotNum, 'item', sel.id);
                g.toast(tr('inv.assignedSlot', { name: sel.name, slot: slotNum + 1 }), 'info');
              } else {
                g.hotbar[slotNum] = { kind: 'item', id: sel.id };
              }
              this.updateHUD(true);
              this.renderModal();
            }
          }, String(slotNum + 1)));
        }
        det.appendChild(hbRow);
        const curQty = g.inventory[sel.id] || 0;
        if (curQty > 0) {
          const trashRow = this.el('div', { style: 'display:flex;gap:6px;margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.1);flex-wrap:wrap;' }, [
            this.el('button', {
              class: 'btn btn-danger btn-sm',
              title: 'Eliminar 1 unidad de este objeto permanentemente',
              onclick: () => {
                g.removeItem(sel.id, 1);
                if (Abyssea.Audio && typeof Abyssea.Audio.play === 'function') Abyssea.Audio.play('destroy');
                g.toast(`Eliminado: 1x ${sel.name}`, 'info');
                if (!g.inventory[sel.id]) this.selectedItemId = null;
                this.updateHUD(true);
                this.renderModal();
              }
            }, 'Basurero (-1)'),
            this.el('button', {
              class: 'btn btn-danger btn-sm',
              title: 'Eliminar todas las unidades de este objeto permanentemente',
              onclick: () => {
                const qty = g.inventory[sel.id] || 0;
                if (qty > 0) {
                  g.removeItem(sel.id, qty);
                  if (Abyssea.Audio && typeof Abyssea.Audio.play === 'function') Abyssea.Audio.play('destroy');
                  g.toast(`Eliminado: ${qty}x ${sel.name}`, 'warn');
                  this.selectedItemId = null;
                  this.updateHUD(true);
                  this.renderModal();
                }
              }
            }, `Eliminar Todo (${curQty})`)
          ]);
          det.appendChild(trashRow);
        }
        det.appendChild(this.el('button', {
          class: 'btn btn-stone btn-sm',
          style: 'margin-top:8px;font-size:13px;width:100%;',
          onclick: () => {
            this.selectedToolId = null;
            this.selectedItemId = null;
            this.renderModal();
          }
        }, '← Volver a Equipo / Estadísticas'));
        rightCol.appendChild(det);
      } else {
        // Character Overview: Equipment Paperdoll + Live Stats (no wrap, NO emojis) + Permanent Relics
        rightCol.appendChild(this.el('div', {
          class: 'parchment-box',
          style: 'display:flex;align-items:center;gap:10px;padding:9px 12px;'
        }, [
          this.uiIcon('backpack', 28),
          this.el('div', { style: 'font-size:13px;color:#cbd5e1;line-height:1.4;' },
            'Selecciona un objeto o herramienta de la mochila para ver sus detalles, equiparlo, consumirlo o asignarlo a la barra rápida.')
        ]));

      // 10-Slot Dedicated Equipment Paperdoll with FDA Slot Frames
      const equipDefs = [
        ['helm', 'Casco', Abyssea.UI_URLS.slotHead],
        ['armor', 'Pechera', Abyssea.UI_URLS.slotChest],
        ['legs', 'Pantalones', Abyssea.UI_URLS.slotFeet],
        ['boots', 'Botas', Abyssea.UI_URLS.slotFeet],
        ['shield', 'Escudo', Abyssea.UI_URLS.slotOffhand],
        ['ring', 'Accesorio 1', Abyssea.UI_URLS.slotRing],
        ['amulet', 'Accesorio 2', Abyssea.UI_URLS.slotNeck],
        ['relic', 'Reliquia 1', Abyssea.UI_URLS.slotRing],
        ['relic2', 'Reliquia 2', Abyssea.UI_URLS.slotRing],
        ['relic3', 'Reliquia 3', Abyssea.UI_URLS.slotRing]
      ];
      const dollGrid = this.el('div', { class: 'equip-doll-grid' });
      equipDefs.forEach(([slotKey, slotLabel, bgUrl]) => {
        const eqId = g.equipped[slotKey];
        const eqItem = eqId && Abyssea.ITEMS[eqId];
        const enchs = eqId && g.armorEnchants && g.armorEnchants[eqId]
          ? Object.entries(g.armorEnchants[eqId]).filter(([, l]) => l > 0)
            .map(([eid, l]) => `${Abyssea.ARMOR_ENCHANTS[eid] ? Abyssea.ARMOR_ENCHANTS[eid].name : eid} ${tr('common.levelShort')}${l}`).join(', ')
          : '';
        const frame = this.el('div', {
          class: 'equip-doll-frame',
          style: `background-image:url('${bgUrl}');` + (eqItem ? 'outline:2px solid #ffd54f;outline-offset:-2px;box-shadow:0 0 10px rgba(255,213,79,0.55);' : ''),
          'data-tip': this.tipAttr(eqItem
            ? this._buildItemTipSpec(eqItem.id, { enchantsText: enchs, context: 'equip' })
            : { title: slotLabel, sub: tr('inv.emptyEquipSub'), desc: tr('inv.emptyEquipDesc') }),
          'aria-label': eqItem ? `${eqItem.name}${enchs ? ' (' + enchs + ')' : ''}` : `${slotLabel}: ${tr('common.empty')}`,
          onclick: () => {
            if (eqItem) {
              g.addItem(eqId, 1);
              g.equipped[slotKey] = null;
              g.recomputeModifiers();
              this.updateHUD(true);
              this.renderModal();
            }
          }
        }, eqItem ? this.itemIcon(eqItem.icon, 30) : null);

        dollGrid.appendChild(this.el('div', { class: 'equip-doll-slot' }, [
          frame,
          this.el('div', { class: 'equip-doll-label' }, eqItem ? eqItem.name.split(' ')[0] : slotLabel)
        ]));
      });

      // Live Stat Panel (Zero Emojis, Clean Pixel Icons, Single-Line Space-Between Layout)
      const isEnStat = Abyssea.I18n && Abyssea.I18n.getLanguage && Abyssea.I18n.getLanguage() === 'en';
      const defFlat = Math.round(g.mods.def || 0);
      const defPctVal = Math.round((g.mods.defPct || 0) * 100);
      const defDisplay = defPctVal > 0 ? `${defFlat} (+${defPctVal}%)` : `${defFlat}`;
      const luckTotalPct = Math.round(((g.mods.doubleDropChance || 0) + (g.mods.luckBonus || 0)) * 100);
      const statItems = [
        { icon: 'iconHeart', label: isEnStat ? 'HP' : 'Vida', val: `${Math.round(g.player.hp)} / ${Math.round(g.player.maxHp)}`, color: '#ef5350' },
        { icon: 'manaOrb', label: isEnStat ? 'Energy' : 'Energía', val: `${Math.round(g.player.energy)} / ${Math.round(g.player.maxEnergy)}`, color: '#4fc3f7' },
        { icon: 'iconSword', label: isEnStat ? 'Damage' : 'Daño', val: `+${Math.round((g.mods.dmgBonus || 0) * 100)}%`, color: '#ffb74d' },
        { icon: 'iconBow', label: isEnStat ? 'Atk Spd' : 'Vel. Ataque', val: `+${Math.round((g.mods.attackSpeed || 0) * 100)}%`, color: '#80deea' },
        { icon: 'iconShield', label: isEnStat ? 'Defense' : 'Defensa', val: defDisplay, color: '#81c784' },
        { icon: 'iconReset', label: isEnStat ? 'Move Spd' : 'Vel. Mov.', val: `+${Math.round((g.mods.moveSpeed || 0) * 100)}%`, color: '#ba68c8' },
        { icon: 'iconSparkle', label: isEnStat ? 'Luck / Drop' : 'Suerte / Drop', val: `+${luckTotalPct}%`, color: '#ffd54f', full: true }
      ];

      const statGrid = this.el('div', {
        class: 'parchment-box inv-stat-grid',
        style: 'margin-top:8px;display:grid;grid-template-columns:1fr 1fr;gap:6px 12px;font-size:13px;padding:8px 10px;'
      }, statItems.map(st => {
        return this.el('div', {
          style: `display:flex;align-items:center;justify-content:space-between;white-space:nowrap;gap:6px;${st.full ? 'grid-column:1/-1;border-top:1px solid rgba(255,255,255,0.08);padding-top:4px;margin-top:2px;' : ''}`
        }, [
          this.el('span', { style: 'display:inline-flex;align-items:center;gap:5px;color:#d5e2f0;font-weight:600;' }, [
            this.uiIcon(st.icon, 14),
            st.label + ':'
          ]),
          this.el('span', { style: `color:${st.color};font-weight:700;font-family:\'AbysseaPixel\',monospace;` }, st.val)
        ]);
      }));

      const eqPanel = this.el('div', { class: 'parchment-box' }, [
        this.el('div', { style: 'display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:4px;' }, [
          this.el('strong', { style: 'font-size:16px;' }, tr('inv.activeGearTitle')),
          this.el('button', {
            class: 'btn btn-stone btn-sm',
            onclick: () => this.openModal('stats')
          }, tr('inv.viewStats'))
        ]),
        dollGrid,
        statGrid
      ]);
      rightCol.appendChild(eqPanel);

      // Permanent Boss & Secret Relics button (opens compact Chest-Grid Relics modal)
      const relics = Abyssea.PERMANENT_RELICS ? Object.values(Abyssea.PERMANENT_RELICS) : [];
      if (relics.length) {
        const ownedCount = relics.filter(rel => g.hasPermanentRelic(rel.id)).length;
        const isEnInv = Abyssea.I18n && Abyssea.I18n.getLanguage && Abyssea.I18n.getLanguage() === 'en';
        rightCol.appendChild(this.el('div', { class: 'card', style: 'display:flex;align-items:center;justify-content:space-between;gap:10px;' }, [
          this.el('div', {}, [
            this.el('strong', { style: 'color:#ffd54f;font-size:15px;display:block;' }, tr('inv.permRelicsCount', { cur: ownedCount, total: relics.length })),
            this.el('span', { style: 'font-size:12px;color:#b8d4ec;' }, isEnInv ? 'Inspect all passive relics in vault grid' : 'Explora todas tus reliquias en cuadros de cofre')
          ]),
          this.el('button', {
            id: 'btn-open-relics-modal',
            type: 'button',
            class: 'btn btn-gold',
            style: 'white-space:nowrap;flex-shrink:0;',
            onclick: () => this.openModal('relics')
          }, isEnInv ? 'Relics' : 'Reliquias')
        ]));
      }
      }

      layout.appendChild(rightCol);
      body.appendChild(layout);
      if (typeof this.renderV2PetsAndSynergiesBar === 'function') {
        this.renderV2PetsAndSynergiesBar(body);
      }
    }

    renderRelicsModal(body) {
      const g = this.game;
      const relics = Abyssea.PERMANENT_RELICS ? Object.values(Abyssea.PERMANENT_RELICS) : [];
      const isEn = Abyssea.I18n && Abyssea.I18n.getLanguage && Abyssea.I18n.getLanguage() === 'en';
      const ownedCount = relics.filter(r => g.hasPermanentRelic(r.id)).length;
      if (!this._selectedRelicId || !relics.some(r => r.id === this._selectedRelicId)) {
        const firstOwned = relics.find(r => g.hasPermanentRelic(r.id));
        this._selectedRelicId = (firstOwned && firstOwned.id) || (relics[0] && relics[0].id) || null;
      }

      const wrap = this.el('div', { class: 'relic-chest-modal' });
      const topRow = this.el('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;' }, [
        this.el('strong', { style: 'color:#ffd54f;font-size:16px;' }, tr('inv.permRelicsCount', { cur: ownedCount, total: relics.length })),
        this.el('button', {
          id: 'btn-relics-back-inv',
          type: 'button',
          class: 'btn btn-stone btn-sm',
          onclick: () => this.openModal('inventory')
        }, isEn ? 'Back to Inventory' : 'Volver al Inventario')
      ]);
      wrap.appendChild(topRow);

      const detailSlot = this.el('div', { class: 'relic-detail-card' });
      const renderDetail = () => {
        detailSlot.innerHTML = '';
        const rel = relics.find(r => r.id === this._selectedRelicId) || relics[0];
        if (!rel) return;
        const owned = g.hasPermanentRelic(rel.id);
        const isSec = !!rel.isSecret;
        const srcText = rel.source || (rel.bossName ? `${rel.bossName}` : tr('inv.archipelago'));
        const dispName = owned ? rel.name : (isSec ? tr('inv.secretLockName') : `${rel.name}`);
        const statusBadge = owned
          ? (isEn ? 'Obtained (Active)' : 'Obtenida (Activa)')
          : (isEn ? 'Locked' : 'Bloqueada');
        detailSlot.appendChild(this.el('div', {
          class: 'relic-detail-icon-box',
          style: owned ? '' : 'filter:grayscale(0.92);opacity:0.65;'
        }, [this.itemIcon(rel.icon, 40)]));
        detailSlot.appendChild(this.el('div', { class: 'relic-detail-info' }, [
          this.el('div', { class: 'relic-detail-name' }, dispName),
          this.el('div', { class: 'relic-detail-meta' }, [
            this.el('span', { style: `font-weight:800;color:${owned ? '#86efac' : '#ffab91'};` }, statusBadge),
            this.el('span', {}, ` · ${isEn ? 'Source' : 'Origen'}: ${srcText}`)
          ]),
          this.el('div', { class: 'relic-detail-desc' }, owned
            ? rel.desc
            : (isSec ? tr('inv.secretChestLockTitle') : `${rel.desc} (${isEn ? 'Locked until defeated' : 'Bloqueada hasta derrotar al jefe'})`))
        ]));
      };

      const gridEl = this.el('div', { class: 'relic-chest-grid' });
      const cellMap = new Map();
      relics.forEach(rel => {
        const owned = g.hasPermanentRelic(rel.id);
        const isSel = rel.id === this._selectedRelicId;
        const cell = this.el('button', {
          type: 'button',
          class: 'relic-chest-cell' + (owned ? ' owned' : ' locked') + (isSel ? ' selected' : ''),
          title: owned ? rel.name : (rel.source || rel.name),
          onclick: () => {
            if (cellMap.has(this._selectedRelicId)) {
              cellMap.get(this._selectedRelicId).classList.remove('selected');
            }
            this._selectedRelicId = rel.id;
            cell.classList.add('selected');
            renderDetail();
          }
        }, [
          this.itemIcon(rel.icon, 36),
          owned ? this.el('span', { class: 'relic-chest-cell-badge' }, 'OK') : null
        ]);
        cellMap.set(rel.id, cell);
        gridEl.appendChild(cell);
      });

      renderDetail();
      wrap.appendChild(detailSlot);
      wrap.appendChild(gridEl);
      body.appendChild(wrap);
    }

    renderChestModal(titleEl, body, b) {
      const g = this.game;
      if (!b) return;
      b.storage = b.storage || {};
      const def = Abyssea.BUILDINGS[b.type || b.defId] || { name: 'Cofre', capacity: 30 };
      const chestCapacity = def.capacity || 30;
      const CHEST_MAX_STACK = 1000;
      const maxStack = g.getMaxStackSize ? g.getMaxStackSize() : 25;
      const maxPlayerSlots = g.getMaxInventorySlots ? g.getMaxInventorySlots() : 24;
      const usedPlayerSlots = g.getUsedInventorySlots ? g.getUsedInventorySlots() : Object.keys(g.inventory).length;

      const getChestUsedSlots = () => {
        let used = 0;
        for (const [id, q] of Object.entries(b.storage || {})) {
          if (q > 0 && Abyssea.ITEMS[id]) {
            used += Math.ceil(q / CHEST_MAX_STACK);
          }
        }
        return used;
      };

      const getChestFit = (itemId) => {
        const used = getChestUsedSlots();
        const curQ = b.storage[itemId] || 0;
        const mod = curQ % CHEST_MAX_STACK;
        const spaceInPartial = mod === 0 ? 0 : (CHEST_MAX_STACK - mod);
        const freeSlots = Math.max(0, chestCapacity - used);
        return spaceInPartial + (freeSlots * CHEST_MAX_STACK);
      };

      const getPlayerFit = (itemId) => {
        const pMaxStack = g.getMaxStackSize ? g.getMaxStackSize() : 25;
        const pMaxSlots = g.getMaxInventorySlots ? g.getMaxInventorySlots() : 24;
        const pUsed = g.getUsedInventorySlots ? g.getUsedInventorySlots() : Object.keys(g.inventory).length;
        const curP = g.inventory[itemId] || 0;
        const mod = curP % pMaxStack;
        const spaceInPartial = mod === 0 ? 0 : (pMaxStack - mod);
        const freeSlots = Math.max(0, pMaxSlots - pUsed);
        return spaceInPartial + (freeSlots * pMaxStack);
      };

      const chestUsedSlots = getChestUsedSlots();

      if (titleEl) {
        titleEl.textContent = `${def.name} (${chestUsedSlots} / ${chestCapacity} Ranuras · Stacks de 1000)`;
      }

      const chestSlotNodes = [];
      const playerSlotNodes = [];
      const applyChestFilter = (catId, searchQ) => {
        const isFiltered = Boolean((catId && catId !== 'todos') || (searchQ && searchQ.trim()));
        chestSlotNodes.forEach(({ id, el }) => {
          if (!id) {
            el.style.display = isFiltered ? 'none' : '';
            return;
          }
          el.style.display = this._storageItemMatches(id, catId, searchQ) ? '' : 'none';
        });
        playerSlotNodes.forEach(({ id, el }) => {
          if (!id) {
            el.style.display = isFiltered ? 'none' : '';
            return;
          }
          el.style.display = this._storageItemMatches(id, catId, searchQ) ? '' : 'none';
        });
      };

      const filterState = this._renderStorageFilterBar(body, 'chest', applyChestFilter);

      const container = this.el('div', { class: 'chest-layout' });

      // 1. CHEST SECTION
      const chestBox = this.el('div', { class: 'chest-panel-box' });
      const chestHead = this.el('div', { class: 'chest-section-title' }, [
        this.el('div', { style: 'display:flex;align-items:center;gap:8px;' }, [
          this.el('span', { class: 'chest-title-lbl' }, def.name),
          this.el('span', { class: 'inv-cap-pill' }, `${chestUsedSlots} / ${chestCapacity} Slots`),
          this.el('span', { style: 'font-size:12px;color:#94a3b8;' }, `(Stacks de 1000 · Click: Mover · Clic Der: 1 · Shift+Clic: Todo)`)
        ]),
        this.el('div', { class: 'chest-actions-row' }, [
          this.el('button', {
            class: 'btn btn-gold btn-sm',
            title: 'Mover desde tu inventario solo los objetos que ya tengan stack en este cofre',
            onclick: () => {
              let anyMoved = false;
              for (const [id, curQ] of Object.entries(b.storage || {})) {
                if (!curQ || curQ <= 0) continue;
                const count = g.inventory[id] || 0;
                if (count <= 0) continue;
                const hbSlots = (g.hotbar || []).filter(s => s && s.kind === 'item' && s.id === id).length;
                const invOnlyCount = Math.max(0, count - hbSlots * maxStack);
                if (invOnlyCount <= 0) continue;
                const fit = getChestFit(id);
                const toMove = Math.min(invOnlyCount, fit);
                if (toMove > 0) {
                  b.storage[id] = (b.storage[id] || 0) + toMove;
                  g.removeItem(id, toMove);
                  anyMoved = true;
                }
              }
              if (anyMoved) {
                if (Abyssea.Audio && typeof Abyssea.Audio.play === 'function') Abyssea.Audio.play('pickup');
                g.toast('Objetos coincidentes apilados al cofre.', 'success');
                this.updateHUD(true);
                this.renderModal();
              } else {
                g.toast('No hay objetos coincidentes para apilar.', 'info');
              }
            }
          }, 'Guardar iguales'),
          this.el('button', {
            class: 'btn btn-stone btn-sm',
            title: 'Mover todos los objetos de tu inventario al cofre (los objetos de tu Hotbar se conservan)',
            onclick: () => {
              let anyMoved = false;
              let hadSource = false;
              for (const [id, count] of Object.entries(g.inventory)) {
                if (count <= 0) continue;
                const hbSlots = (g.hotbar || []).filter(s => s && s.kind === 'item' && s.id === id).length;
                const invOnlyCount = Math.max(0, count - hbSlots * maxStack);
                if (invOnlyCount <= 0) continue;
                hadSource = true;
                const fit = getChestFit(id);
                const toMove = Math.min(invOnlyCount, fit);
                if (toMove > 0) {
                  b.storage[id] = (b.storage[id] || 0) + toMove;
                  g.removeItem(id, toMove);
                  anyMoved = true;
                }
              }
              if (anyMoved) {
                if (Abyssea.Audio && typeof Abyssea.Audio.play === 'function') Abyssea.Audio.play('pickup');
                this.updateHUD(true);
                this.renderModal();
              } else {
                g.toast(hadSource ? 'Cofre lleno' : 'No hay objetos para depositar', hadSource ? 'warn' : 'info');
              }
            }
          }, 'Depositar Todo'),
          this.el('button', {
            class: 'btn btn-stone btn-sm',
            title: 'Mover todos los objetos del cofre a tu inventario',
            onclick: () => {
              let anyMoved = false;
              let hadSource = false;
              for (const [id, count] of Object.entries(b.storage)) {
                if (count <= 0) continue;
                hadSource = true;
                const fit = getPlayerFit(id);
                const toMove = Math.min(count, fit);
                if (toMove > 0) {
                  g.addItem(id, toMove);
                  b.storage[id] -= toMove;
                  if (b.storage[id] <= 0) delete b.storage[id];
                  anyMoved = true;
                }
              }
              if (anyMoved) {
                if (Abyssea.Audio && typeof Abyssea.Audio.play === 'function') Abyssea.Audio.play('pickup');
                this.updateHUD(true);
                this.renderModal();
              } else {
                g.toast(hadSource ? 'Inventario lleno' : 'El cofre está vacío', hadSource ? 'warn' : 'info');
              }
            }
          }, 'Retirar Todo'),
          this.el('button', {
            class: 'btn btn-danger btn-sm',
            title: 'Demoler este cofre (arroja todo su contenido al suelo)',
            onclick: () => {
              g.demolishBuilding(b);
              if (Abyssea.Audio && typeof Abyssea.Audio.play === 'function') Abyssea.Audio.play('destroy');
              this.closeModal();
            }
          }, 'Demoler')
        ])
      ]);
      chestBox.appendChild(chestHead);

      const chestGrid = this.el('div', { class: 'chest-grid' });
      const chestItems = Object.entries(b.storage).filter(([id, q]) => q > 0 && Abyssea.ITEMS[id]);
      chestItems.forEach(([id, qty]) => {
        const it = Abyssea.ITEMS[id];
        let rem = qty;
        while (rem > 0) {
          const stackQty = Math.min(rem, CHEST_MAX_STACK);
          rem -= stackQty;

          const slot = this.el('div', {
            class: `inv-slot rarity-${it.rarity || 'comun'}`,
            title: `${it.name} (x${stackQty}/${CHEST_MAX_STACK})`,
            'aria-label': `${it.name} ${stackQty}`,
            onclick: (ev) => {
              const wantMove = (ev && ev.shiftKey) ? (b.storage[id] || 0) : stackQty;
              const fit = getPlayerFit(id);
              const actualMove = Math.min(wantMove, fit);
              if (actualMove > 0) {
                g.addItem(id, actualMove);
                b.storage[id] -= actualMove;
                if (b.storage[id] <= 0) delete b.storage[id];
                if (Abyssea.Audio && typeof Abyssea.Audio.play === 'function') Abyssea.Audio.play('pickup');
                this.updateHUD(true);
                this.renderModal();
              } else {
                g.toast('Inventario lleno', 'warn');
              }
            },
            oncontextmenu: (ev) => {
              ev.preventDefault();
              if ((b.storage[id] || 0) <= 0) return;
              const fit = getPlayerFit(id);
              if (fit >= 1) {
                g.addItem(id, 1);
                b.storage[id] -= 1;
                if (b.storage[id] <= 0) delete b.storage[id];
                if (Abyssea.Audio && typeof Abyssea.Audio.play === 'function') Abyssea.Audio.play('pickup');
                this.updateHUD(true);
                this.renderModal();
              } else {
                g.toast('Inventario lleno', 'warn');
              }
            }
          }, [
            this.itemIcon(it.icon, 44),
            this.el('span', { class: 'slot-qty' }, String(stackQty))
          ]);
          chestSlotNodes.push({ id, el: slot });
          chestGrid.appendChild(slot);
        }
      });

      const emptyChestSlots = Math.max(0, chestCapacity - chestUsedSlots);
      for (let i = 0; i < emptyChestSlots; i++) {
        const emp = this.el('div', { class: 'inv-slot empty-slot' });
        chestSlotNodes.push({ id: null, el: emp });
        chestGrid.appendChild(emp);
      }
      chestBox.appendChild(chestGrid);
      container.appendChild(chestBox);

      // 2. PLAYER INVENTORY SECTION
      const playerBox = this.el('div', { class: 'chest-panel-box' });
      const playerItems = Object.entries(g.inventory)
        .map(([id, q]) => {
          const hbSlots = (g.hotbar || []).filter(s => s && s.kind === 'item' && s.id === id).length;
          const invQ = Math.max(0, q - hbSlots * maxStack);
          return [id, invQ];
        })
        .filter(([id, q]) => q > 0 && Abyssea.ITEMS[id]);
      const bpName = g.backpackTier === 3 ? 'Mochila Astral (+24 slots)'
                   : g.backpackTier === 2 ? 'Mochila Reforzada (+16 slots)'
                   : g.backpackTier === 1 ? 'Mochila de Cuero (+8 slots)'
                   : 'Sin Mochila (Básica)';

      const playerHead = this.el('div', { class: 'chest-section-title' }, [
        this.el('div', { style: 'display:flex;align-items:center;gap:8px;' }, [
          this.el('span', { class: 'chest-title-lbl' }, 'Tu Inventario'),
          this.el('span', { class: 'inv-cap-pill' }, `${usedPlayerSlots} / ${maxPlayerSlots} Slots`),
          this.el('span', { style: 'font-size:13px;color:#a3e635;font-weight:600;' }, bpName)
        ]),
        this.el('div', { style: 'font-size:12px;color:#94a3b8;' }, `Stack Máximo: ${maxStack}`)
      ]);
      playerBox.appendChild(playerHead);

      const playerGrid = this.el('div', { class: 'chest-grid' });
      playerItems.forEach(([id, qty]) => {
        const it = Abyssea.ITEMS[id];
        let rem = qty;
        while (rem > 0) {
          const stackQty = Math.min(rem, maxStack);
          rem -= stackQty;

          const slot = this.el('div', {
            class: `inv-slot rarity-${it.rarity || 'comun'}`,
            title: `${it.name} (x${stackQty}/${maxStack})`,
            'aria-label': `${it.name} ${stackQty}`,
            onclick: (ev) => {
              const hbSlots = (g.hotbar || []).filter(s => s && s.kind === 'item' && s.id === id).length;
              const invOnlyCount = Math.max(0, (g.inventory[id] || 0) - hbSlots * maxStack);
              const wantMove = (ev && ev.shiftKey) ? invOnlyCount : stackQty;
              const fit = getChestFit(id);
              const actualMove = Math.min(wantMove, fit);
              if (actualMove > 0) {
                b.storage[id] = (b.storage[id] || 0) + actualMove;
                g.removeItem(id, actualMove);
                if (Abyssea.Audio && typeof Abyssea.Audio.play === 'function') Abyssea.Audio.play('pickup');
                this.updateHUD(true);
                this.renderModal();
              } else {
                g.toast('Cofre lleno', 'warn');
              }
            },
            oncontextmenu: (ev) => {
              ev.preventDefault();
              if ((g.inventory[id] || 0) <= 0) return;
              const fit = getChestFit(id);
              if (fit >= 1) {
                b.storage[id] = (b.storage[id] || 0) + 1;
                g.removeItem(id, 1);
                if (Abyssea.Audio && typeof Abyssea.Audio.play === 'function') Abyssea.Audio.play('pickup');
                this.updateHUD(true);
                this.renderModal();
              } else {
                g.toast('Cofre lleno', 'warn');
              }
            }
          }, [
            this.itemIcon(it.icon, 44),
            this.el('span', { class: 'slot-qty' }, String(stackQty))
          ]);
          playerSlotNodes.push({ id, el: slot });
          playerGrid.appendChild(slot);
        }
      });

      const emptyPlayerSlots = Math.max(0, maxPlayerSlots - usedPlayerSlots);
      for (let i = 0; i < emptyPlayerSlots; i++) {
        const emp = this.el('div', { class: 'inv-slot empty-slot' });
        playerSlotNodes.push({ id: null, el: emp });
        playerGrid.appendChild(emp);
      }
      playerBox.appendChild(playerGrid);
      container.appendChild(playerBox);

      body.appendChild(container);
      applyChestFilter(filterState.cat, filterState.search);
    }

    renderStats(body) {
      const g = this.game;
      const p = g.player;
      const m = g.mods || {};
      const fmtPct = (v) => {
        const n = Math.round((v || 0) * 100);
        return `${n >= 0 ? '+' : ''}${n}%`;
      };
      const dayPhase = g.getDayPhase ? g.getDayPhase() : { label: tr('hud.phaseDay'), phase: 'dia' };
      const maxEnch = g.getMaxEnchantSlots ? g.getMaxEnchantSlots() : 3;
      const makeRow = (k, v, valColor = '#ffe082') => this.el('div', { class: 'stat-detail-row' }, [
        this.el('span', { style: 'color:#e6dccb;' }, k),
        this.el('strong', { style: `color:${valColor};` }, String(v))
      ]);

      body.appendChild(this.el('div', { class: 'parchment-box', style: 'margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;' }, [
        this.el('div', {}, [
          this.el('strong', { style: 'font-size:18px;' }, tr('stats.heroTitle', { level: p.level })),
          this.el('div', { style: 'font-size:14px;color:#bfd0ea;font-weight:600;' }, tr('stats.heroMeta', { xp: p.xp, nextXp: p.nextXp, day: g.dayCount || 1, phase: dayPhase.label, sp: p.skillPoints }))
        ]),
        this.el('button', {
          class: 'btn btn-gold btn-sm',
          onclick: () => this.openModal('skills')
        }, tr('stats.openSkills'))
      ]));

      const combatCard = this.el('div', { class: 'card' }, [
        this.el('strong', { style: 'color:#ff8a80;font-size:15px;margin-bottom:4px;display:block;' }, tr('stats.combatSec')),
        makeRow(tr('stats.hpRow'), `${Math.round(p.hp)} / ${Math.round(p.maxHp)}`, '#ef9a9a'),
        makeRow(tr('stats.defRow'), tr('stats.defVal', { def: Math.round(m.def || 0), mit: Math.round((m.def || 0) * 0.65) })),
        makeRow(tr('stats.dmgRow'), fmtPct(m.dmgBonus)),
        makeRow(tr('stats.bossDmgRow'), fmtPct(m.bossDmg)),
        makeRow(tr('stats.critRow'), `${Math.round((m.critChance || 0) * 100)}%`),
        makeRow(tr('stats.atkSpdRow'), fmtPct(m.attackSpeed)),
        makeRow(tr('stats.regenRow'), `${(m.regen || 0).toFixed(1)} HP/s`, '#81c784'),
        makeRow(tr('stats.lifestealRow'), `+${Math.round(m.killHeal || 0)} HP`, '#81c784'),
        makeRow(tr('stats.thornsRow'), `${Math.round((m.thorns || 0) * 100)}%`)
      ]);

      const worldCard = this.el('div', { class: 'card' }, [
        this.el('strong', { style: 'color:#80deea;font-size:15px;margin-bottom:4px;display:block;' }, tr('stats.gatherSec')),
        makeRow(tr('stats.enRow'), `${Math.round(p.energy)} / ${Math.round(p.maxEnergy)}`, '#80d8ff'),
        makeRow(tr('stats.enRegenRow'), `${(1.2 + (m.energyRegen || 0)).toFixed(1)}/s`, '#80d8ff'),
        makeRow(tr('stats.moveSpdRow'), fmtPct(m.moveSpeed)),
        makeRow(tr('stats.gatherPwrRow'), fmtPct(m.gatherPower)),
        makeRow(tr('stats.mineChopRow'), `${fmtPct(m.mineSpeed)} / ${fmtPct(m.chopSpeed)}`),
        makeRow(tr('stats.luckRow'), fmtPct(m.luckBonus), '#b9f6ca'),
        makeRow(tr('stats.magnetRow'), tr('stats.magnetVal', { n: 72 + Math.round(m.magnetBonus || 0) })),
        makeRow(tr('stats.nightLightRow'), tr('stats.nightLightVal', { n: Math.round(m.lightRadius || 0) })),
        makeRow(tr('stats.enchSlotsRow'), `${maxEnch} / 6`, '#ce93d8')
      ]);

      const recordsCard = this.el('div', { class: 'card' }, [
        this.el('strong', { style: 'color:#ffd54f;font-size:15px;margin-bottom:4px;display:block;' }, tr('stats.recordsSec')),
        makeRow(tr('stats.goldRow'), `${Abyssea.Utils.formatNum(g.coins)} / ${Abyssea.Utils.formatNum(g.stats.coinsEarned || 0)}`),
        makeRow(tr('stats.plotsRow'), `${g.unlockedPlots.length} / ${GRID_PLOTS * GRID_PLOTS}`),
        makeRow(tr('stats.dungeonsRow'), `${g.clearedDungeons.length} / ${Object.keys(Abyssea.DUNGEON_DEFS || {}).length}`),
        makeRow(tr('stats.starsRow'), `${g.unlockedSkills.length} / ${Object.keys(Abyssea.SKILLS || {}).length}`),
        makeRow(tr('stats.relicsRow'), `${(g.permanentRelics || []).length} / ${Object.keys(Abyssea.PERMANENT_RELICS || {}).length}`),
        makeRow(tr('stats.killsRow'), Abyssea.Utils.formatNum(g.stats.kills || 0)),
        makeRow(tr('stats.gatheredRow'), Abyssea.Utils.formatNum(g.stats.gatheredTotal || 0)),
        makeRow(tr('stats.craftedRow'), Abyssea.Utils.formatNum(g.stats.craftedTotal || 0)),
        makeRow(tr('stats.farmRow'), `${g.stats.fishCaught || 0} / ${g.stats.cropsHarvested || 0} / ${g.stats.chestsOpened || 0}`)
      ]);

      body.appendChild(this.el('div', { class: 'stats-section-grid' }, [combatCard, worldCard, recordsCard]));
    }

    _renderCraftQueueBanner(parent, activeStation = null) {
      const g = this.game;
      const allQueue = g.craftQueue || [];
      const allReady = g.craftReady || [];
      const queue = activeStation ? allQueue.filter(j => j.station === activeStation) : allQueue;
      const ready = activeStation ? allReady.filter(e => e.station === activeStation) : allReady;
      if (!queue.length && !ready.length) return;
      const wrapper = this.el('div', {
        id: 'live-craft-queue-list',
        'data-count': String(queue.length),
        'data-ready-count': String(ready.length)
      });

      if (ready.length > 0) {
        const rBox = this.el('div', { class: 'craft-ready-box' }, [
          this.el('div', { class: 'craft-ready-hdr' }, [
            this.el('strong', { style: 'color:#b9f6ca;font-size:14px;' }, tr('craft.pickupTray', { n: ready.length })),
            this.el('button', {
              class: 'btn btn-green btn-sm',
              onclick: () => { g.claimAllCrafted(activeStation); this.updateHUD(true); this.renderModal(); }
            }, tr('craft.claimAll'))
          ])
        ]);
        const rGrid = this.el('div', { class: 'craft-ready-grid' });
        ready.forEach((entry, ri) => {
          const itDef = Abyssea.ITEMS[entry.out];
          rGrid.appendChild(this.el('div', { class: 'craft-ready-item' }, [
            itDef ? this.itemIcon(itDef.icon, 26) : null,
            this.el('div', {}, [
              this.el('div', { style: 'font-size:14px;font-weight:700;color:#fff;' }, `${entry.name} x${entry.qty}`),
              this.el('div', { style: 'font-size:14px;color:#b9f6ca;line-height:1.45;' }, entry.isCook ? tr('craft.dishReady') : tr('craft.craftedDone'))
            ]),
            this.el('button', {
              class: 'btn btn-gold btn-sm',
              style: 'padding:3px 9px;font-size:14px;',
              onclick: () => { g.claimCrafted(ri, activeStation); this.updateHUD(true); this.renderModal(); }
            }, tr('craft.claim'))
          ]));
        });
        rBox.appendChild(rGrid);
        wrapper.appendChild(rBox);
      }

      if (queue.length > 0) {
        const qBox = this.el('div', { class: 'craft-queue-box' }, [
          this.el('strong', { style: 'color:#ffd54f;font-size:14px;display:block;margin-bottom:4px;' }, tr('craft.activeQueue', { n: queue.length }))
        ]);
        queue.forEach((job, ji) => {
          const pct = Math.min(100, Math.round(((job.elapsed || 0) / Math.max(0.1, job.totalTime || 1)) * 100));
          const rem = Math.max(0, (job.totalTime || 0) - (job.elapsed || 0)).toFixed(1);
          qBox.appendChild(this.el('div', { style: 'margin-top:4px;' }, [
            this.el('div', { class: 'craft-queue-row' }, [
              this.el('span', {}, `${job.name} x${job.qty}`),
              this.el('span', { id: `cq-rem-${ji}` }, `${rem}s`)
            ]),
            this.el('div', { class: 'craft-queue-bar' }, [
              this.el('div', { id: `cq-fill-${ji}`, class: 'craft-queue-fill', style: `width:${pct}%` })
            ])
          ]));
        });
        wrapper.appendChild(qBox);
      }

      parent.appendChild(wrapper);
    }

    _checkCraftIngredient(id, q) {
      const g = this.game;
      const invQty = g.inventory[id] || 0;
      if (invQty >= q) return { ok: true, have: invQty, viaEquipped: false };
      const itDef = Abyssea.ITEMS[id];
      if (q === 1 && itDef && itDef.equipSlot) {
        const sk = itDef.equipSlot === 'helmet' ? 'helm' : itDef.equipSlot;
        if (g.equipped && g.equipped[sk] === id) {
          return { ok: true, have: 1, viaEquipped: true };
        }
      }
      return { ok: false, have: invQty, viaEquipped: false };
    }

    _getWeaponAttributes(item) {
      if (!item) return null;
      const isEn = Abyssea.I18n && Abyssea.I18n.getLanguage() === 'en';
      const wm = item.weaponMelee;
      const bs = item.bladeStats;
      const rs = item.rangedStats;
      const ss = item.staffStats;
      const ls = item.laserStats;
      if (!wm && !bs && !rs && !ss && !ls) return null;

      let dmg = 0;
      let nodeDmg = 0;
      let cooldown = 0.25;
      let rangePx = 74;
      let energyCost = 0;
      let kindLabel = isEn ? 'Melee Weapon' : 'Arma Cuerpo a Cuerpo';
      const effects = [];

      if (wm) {
        dmg = wm.dmg || 20;
        cooldown = wm.speed || 0.24;
        rangePx = wm.range || 74;
        if (wm.critBonus) effects.push(isEn ? `+${Math.round(wm.critBonus * 100)}% Critical Chance` : `+${Math.round(wm.critBonus * 100)}% Prob. Crítico`);
        if (wm.stunChance) effects.push(isEn ? `${Math.round(wm.stunChance * 100)}% Stun Chance` : `${Math.round(wm.stunChance * 100)}% Prob. Aturdir`);
        if (wm.cleave) effects.push(isEn ? 'Wide Area Cleave' : 'Barrido en Área Amplia');
      } else if (bs) {
        kindLabel = isEn ? 'Elemental Blade' : 'Hoja Elemental';
        dmg = bs.dmg || 60;
        cooldown = bs.cooldown || 0.24;
        rangePx = bs.range || 115;
        energyCost = bs.energyCost || 0;
        if (bs.waveRange) {
          effects.push(isEn
            ? `Projected Wave (${(bs.waveRange / 48).toFixed(1)} tiles)`
            : `Onda Proyectada (${(bs.waveRange / 48).toFixed(1)} casillas)`);
        }
        if (bs.lifeSteal) effects.push(isEn ? `${Math.round(bs.lifeSteal * 100)}% Lifesteal` : `${Math.round(bs.lifeSteal * 100)}% Robo de Vida`);
        if (bs.slow) effects.push(isEn ? 'Chills & Slows Enemies' : 'Congela y Ralentiza Enemigos');
      } else if (rs) {
        kindLabel = isEn ? 'Ranged Ballistic Weapon' : 'Arma a Distancia';
        dmg = rs.dmg || 38;
        cooldown = rs.cooldown || 0.32;
        rangePx = rs.range || 420;
        if (rs.pierce) effects.push(isEn ? `Pierces up to ${rs.pierce} targets` : `Perfora hasta ${rs.pierce} objetivos`);
      } else if (ss) {
        kindLabel = isEn ? 'Arcane Staff / Wand' : 'Báculo / Varita Arcana';
        dmg = ss.dmg || 45;
        cooldown = ss.cooldown || 0.28;
        rangePx = ss.range || 420;
        energyCost = ss.energyCost || 0;
        effects.push(isEn ? 'Scales with Magic Power' : 'Escala con Poder Mágico');
        if (ss.slowDur) effects.push(isEn ? `Slows for ${ss.slowDur}s` : `Ralentiza por ${ss.slowDur}s`);
        if (ss.burnDmg) effects.push(isEn ? `Burns (+${ss.burnDmg} dmg)` : `Quemadura (+${ss.burnDmg} daño)`);
        if (ss.pierce) effects.push(isEn ? `Pierces ${ss.pierce} enemy` : `Perfora ${ss.pierce} enemigo`);
        if (ss.aoeRadius) effects.push(isEn ? `Area Explosion (${ss.aoeRadius}px)` : `Explosión en Área (${ss.aoeRadius}px)`);
      } else if (ls) {
        kindLabel = isEn ? 'Continuous Laser Beam' : 'Arma de Haz Láser';
        dmg = ls.dmg || 75;
        nodeDmg = ls.nodeDmg || 0;
        cooldown = ls.cooldown || 0.20;
        rangePx = ls.range || 460;
        energyCost = ls.energyCost || 0;
        if (nodeDmg > 0) effects.push(isEn ? `Mining Beam (${nodeDmg} node dmg)` : `Rayo Minero (${nodeDmg} daño a vetas)`);
      }

      const aps = +(1 / Math.max(0.05, cooldown)).toFixed(1);
      const rangeTiles = +(rangePx / 48).toFixed(1);
      return {
        kindLabel,
        dmg,
        nodeDmg,
        cooldown,
        aps,
        rangePx,
        rangeTiles,
        energyCost,
        effects,
        uses: item.uses || ''
      };
    }

    _getBaselineWeaponForComparison(targetItem) {
      const g = this.game;
      if (!g) return null;
      const isEn = Abyssea.I18n && Abyssea.I18n.getLanguage() === 'en';
      // Check active hotbar slot first if it holds another weapon
      const activeEntry = g.hotbar && g.hotbar[g.activeSlot || 0];
      if (activeEntry && activeEntry.kind === 'item' && activeEntry.id !== targetItem.id) {
        const eqIt = Abyssea.ITEMS && Abyssea.ITEMS[activeEntry.id];
        const eqW = this._getWeaponAttributes(eqIt);
        if (eqW) return { name: eqIt.name, dmg: eqW.dmg, aps: eqW.aps, rangeTiles: eqW.rangeTiles };
      }
      // Otherwise compare against owned sword or bow tier
      const isRanged = Boolean(targetItem.rangedStats || targetItem.staffStats || targetItem.laserStats);
      const refToolId = isRanged && g.toolTiers && g.toolTiers.arco ? 'arco' : (g.toolTiers && g.toolTiers.espada ? 'espada' : null);
      if (refToolId && Abyssea.getToolStats) {
        const st = Abyssea.getToolStats(refToolId, g.toolTiers[refToolId]);
        if (st) {
          return {
            name: `${st.name} (${st.tierName})`,
            dmg: st.power,
            aps: +(st.swingRate * st.speed).toFixed(1),
            rangeTiles: +(st.reach / 48).toFixed(1)
          };
        }
      }
      return null;
    }

    _buildWeaponStatsBox(item) {
      const w = this._getWeaponAttributes(item);
      if (!w) return null;
      const isEn = Abyssea.I18n && Abyssea.I18n.getLanguage() === 'en';
      const baseRef = this._getBaselineWeaponForComparison(item);

      const fmtDiff = (diff, suffix = '') => {
        if (!Number.isFinite(diff) || Math.abs(diff) < 0.05) return '';
        const sign = diff > 0 ? '+' : '';
        const val = Number.isInteger(diff) ? diff : diff.toFixed(1);
        return ` (${sign}${val}${suffix})`;
      };

      const rows = [
        this.el('div', { style: 'font-size:12px;font-weight:800;color:#80deea;text-transform:uppercase;letter-spacing:0.3px;' }, w.kindLabel),
        this.el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:4px 8px;font-size:13px;color:#f1f5f9;margin-top:2px;' }, [
          this.el('div', {}, [
            this.el('span', { style: 'color:#94a3b8;' }, isEn ? 'Damage: ' : 'Daño: '),
            this.el('strong', { style: 'color:#ffd54f;' }, `${w.dmg}`),
            baseRef ? this.el('span', {
              style: `font-size:12px;color:${w.dmg >= baseRef.dmg ? '#86efac' : '#fca5a5'};`
            }, fmtDiff(w.dmg - baseRef.dmg)) : null
          ]),
          this.el('div', {}, [
            this.el('span', { style: 'color:#94a3b8;' }, isEn ? 'Atk Speed: ' : 'Cadencia: '),
            this.el('strong', { style: 'color:#81c784;' }, `${w.aps}/s`),
            this.el('span', { style: 'color:#cbd5e1;font-size:12px;' }, ` (${w.cooldown.toFixed(2)}s)`)
          ]),
          this.el('div', {}, [
            this.el('span', { style: 'color:#94a3b8;' }, isEn ? 'Range: ' : 'Alcance: '),
            this.el('strong', { style: 'color:#93c5fd;' }, `${w.rangeTiles} ${isEn ? 'tiles' : 'cas.'}`),
            baseRef ? this.el('span', {
              style: `font-size:12px;color:${w.rangeTiles >= baseRef.rangeTiles ? '#86efac' : '#fca5a5'};`
            }, fmtDiff(w.rangeTiles - baseRef.rangeTiles)) : null
          ]),
          w.energyCost > 0 ? this.el('div', {}, [
            this.el('span', { style: 'color:#94a3b8;' }, isEn ? 'Energy: ' : 'Energía: '),
            this.el('strong', { style: 'color:#67e8f9;' }, `${w.energyCost}`)
          ]) : null
        ])
      ];

      if (w.effects.length > 0) {
        rows.push(this.el('div', { style: 'font-size:12px;color:#e9d5ff;margin-top:3px;line-height:1.35;' },
          (isEn ? 'Special: ' : 'Efecto: ') + w.effects.join(' · ')));
      } else if (w.uses) {
        rows.push(this.el('div', { style: 'font-size:12px;color:#e9d5ff;margin-top:3px;line-height:1.35;' }, w.uses));
      }
      if (baseRef) {
        rows.push(this.el('div', { style: 'font-size:11px;color:#94a3b8;margin-top:2px;' },
          isEn ? `Compared vs ${baseRef.name}` : `Comparado con ${baseRef.name}`));
      }

      return this.el('div', {
        class: 'item-stats-compare-box',
        style: 'background:rgba(15,23,42,0.72);border:1px solid rgba(125,211,252,0.28);border-radius:6px;padding:6px 8px;margin:4px 0;'
      }, rows);
    }

    _renderUpgradeComparisonPanel({ title, subtitle, accent = '#ffd54f', curColLabel, nextColLabel, rows }) {
      const isEn = Abyssea.I18n && Abyssea.I18n.getLanguage && Abyssea.I18n.getLanguage() === 'en';
      const box = this.el('div', { class: 'upgrade-cmp-panel', style: `--cmp-accent:${accent};` });
      const head = this.el('div', { class: 'upgrade-cmp-head' }, [
        this.el('div', { class: 'upgrade-cmp-title' }, title),
        subtitle ? this.el('div', { class: 'upgrade-cmp-sub' }, subtitle) : null
      ]);
      box.appendChild(head);

      const grid = this.el('div', { class: 'upgrade-cmp-table' });
      const hasCur = Boolean(curColLabel);
      const colCls = hasCur ? '' : ' is-3col';
      grid.appendChild(this.el('div', { class: `upgrade-cmp-row is-header${colCls}` }, [
        this.el('span', { class: 'cmp-col-stat' }, isEn ? 'Stat' : 'Atributo'),
        hasCur ? this.el('span', { class: 'cmp-col-cur' }, curColLabel) : null,
        this.el('span', { class: 'cmp-col-next' }, nextColLabel || (isEn ? 'New' : 'Nuevo')),
        this.el('span', { class: 'cmp-col-delta' }, isEn ? 'Delta' : 'Cambio')
      ]));

      rows.forEach((r, idx) => {
        const deltaCls = r.deltaType === 'pos' ? 'is-pos' : (r.deltaType === 'neg' ? 'is-neg' : 'is-flat');
        grid.appendChild(this.el('div', { class: `upgrade-cmp-row${colCls} ${idx % 2 === 1 ? 'is-alt' : ''}` }, [
          this.el('span', { class: 'cmp-stat-label' }, r.label),
          hasCur ? this.el('span', { class: 'cmp-val-cur' }, `${r.cur}`) : null,
          this.el('span', { class: 'cmp-val-next' }, `${r.next}`),
          this.el('span', { class: `cmp-delta-pill ${deltaCls}` }, r.deltaText || '=')
        ]));
      });
      box.appendChild(grid);
      return box;
    }

    _buildToolUpgradeComparisonBox(toolId, curTier, nextTier) {
      if (!Abyssea.getToolStats || !curTier || !nextTier) return null;
      const curS = Abyssea.getToolStats(toolId, curTier);
      const nextS = Abyssea.getToolStats(toolId, nextTier);
      if (!curS || !nextS) return null;
      const isEn = Abyssea.I18n && Abyssea.I18n.getLanguage() === 'en';
      const pDiff = nextS.power - curS.power;
      const spdDiff = +(nextS.speed - curS.speed).toFixed(2);
      const rCur = +(curS.reach / 48).toFixed(1);
      const rNext = +(nextS.reach / 48).toFixed(1);
      const rDiff = +(rNext - rCur).toFixed(1);
      const rareCur = Math.round((curS.rareBonus || 0) * 100);
      const rareNext = Math.round((nextS.rareBonus || 0) * 100);
      const rareDiff = rareNext - rareCur;

      const rows = [
        {
          label: isEn ? 'Power' : 'Poder / Daño',
          cur: curS.power,
          next: nextS.power,
          deltaText: pDiff > 0 ? `+${pDiff}` : '=',
          deltaType: pDiff > 0 ? 'pos' : 'flat'
        },
        {
          label: isEn ? 'Speed' : 'Velocidad',
          cur: `${curS.speed.toFixed(2)}x`,
          next: `${nextS.speed.toFixed(2)}x`,
          deltaText: spdDiff > 0 ? `+${spdDiff}x` : '=',
          deltaType: spdDiff > 0 ? 'pos' : 'flat'
        },
        {
          label: isEn ? 'Reach' : 'Alcance',
          cur: `${rCur}u`,
          next: `${rNext}u`,
          deltaText: rDiff > 0 ? `+${rDiff}` : '=',
          deltaType: rDiff > 0 ? 'pos' : 'flat'
        }
      ];
      if (rareCur > 0 || rareNext > 0) {
        rows.push({
          label: isEn ? 'Rare Find' : 'Hallazgo Raro',
          cur: `${rareCur}%`,
          next: `${rareNext}%`,
          deltaText: rareDiff > 0 ? `+${rareDiff}%` : '=',
          deltaType: rareDiff > 0 ? 'pos' : 'flat'
        });
      }

      return this._renderUpgradeComparisonPanel({
        title: isEn ? `UPGRADE -> ${nextS.tierName}` : `MEJORA -> ${nextS.tierName}`,
        subtitle: `${curS.tierName}  »  ${nextS.tierName}`,
        accent: nextS.tierColor || '#ffd54f',
        curColLabel: isEn ? 'Current' : 'Actual',
        nextColLabel: isEn ? 'Next' : 'Mejora',
        rows
      });
    }

    _buildArmorComparisonBox(curItem, nextItem, customHeader = null) {
      if (!nextItem) return null;
      const curSt = (curItem && (curItem.stats || curItem.bonus)) || {};
      const nextSt = nextItem.stats || nextItem.bonus || {};
      const isEn = Abyssea.I18n && Abyssea.I18n.getLanguage() === 'en';

      const fields = [
        { label: isEn ? 'Defense' : 'Defensa', cur: curSt.def || 0, next: nextSt.def || 0, suffix: '' },
        { label: isEn ? 'Max HP' : 'Vida Máx.', cur: curSt.maxHp || 0, next: nextSt.maxHp || 0, suffix: '' },
        { label: isEn ? 'Max Energy' : 'Energía', cur: curSt.maxEnergy || 0, next: nextSt.maxEnergy || 0, suffix: '' },
        {
          label: isEn ? 'Damage' : 'Daño',
          cur: Math.round(((curSt.dmgPct || curSt.dmgBonus) || 0) * 100),
          next: Math.round(((nextSt.dmgPct || nextSt.dmgBonus) || 0) * 100),
          suffix: '%'
        },
        {
          label: isEn ? 'Speed' : 'Velocidad',
          cur: Math.round(((curSt.speedPct || curSt.moveSpeed) || 0) * 100),
          next: Math.round(((nextSt.speedPct || nextSt.moveSpeed) || 0) * 100),
          suffix: '%'
        },
        {
          label: isEn ? 'Luck' : 'Suerte',
          cur: Math.round((curSt.luck || 0) * 100),
          next: Math.round((nextSt.luck || 0) * 100),
          suffix: '%'
        }
      ].filter(f => f.cur !== 0 || f.next !== 0);

      if (!fields.length) return null;

      const rows = fields.map(f => {
        const diff = f.next - f.cur;
        const sign = diff > 0 ? '+' : '';
        return {
          label: f.label,
          cur: `${f.cur}${f.suffix}`,
          next: `${f.next}${f.suffix}`,
          deltaText: curItem ? (diff !== 0 ? `${sign}${diff}${f.suffix}` : '=') : `+${f.next}${f.suffix}`,
          deltaType: !curItem || diff > 0 ? 'pos' : (diff < 0 ? 'neg' : 'flat')
        };
      });

      return this._renderUpgradeComparisonPanel({
        title: customHeader || (curItem
          ? (isEn ? 'EQUIPMENT COMPARISON' : 'COMPARATIVA DE MEJORA')
          : (isEn ? `NEW STATS: ${nextItem.name}` : `ATRIBUTOS: ${nextItem.name}`)),
        subtitle: curItem ? `${curItem.name}  »  ${nextItem.name}` : nextItem.name,
        accent: '#86efac',
        curColLabel: curItem ? (isEn ? 'Current' : 'Actual') : null,
        nextColLabel: isEn ? 'Upgraded' : 'Mejorado',
        rows
      });
    }

    _describeItemExtras(item) {
      if (!item) return '';
      const bits = [];
      if (item.desc) bits.push(item.desc);
      const st = item.stats || item.bonus;
      if (st) {
        const sList = [];
        if (st.def) sList.push(`+${st.def} ${tr('tooltip.statDef')}`);
        if (st.maxHp) sList.push(`+${st.maxHp} ${tr('tooltip.statHp')}`);
        if (st.maxEnergy) sList.push(`+${st.maxEnergy} ${tr('tooltip.statEn')}`);
        if (st.dmgPct || st.dmgBonus) sList.push(`+${Math.round((st.dmgPct || st.dmgBonus) * 100)}% ${tr('tooltip.statDmg')}`);
        if (st.speedPct || st.moveSpeed) sList.push(`+${Math.round((st.speedPct || st.moveSpeed) * 100)}% ${tr('tooltip.statSpd')}`);
        if (st.luck) sList.push(`+${Math.round(st.luck * 100)}% Suerte`);
        if (sList.length) bits.push(tr('craft.bonuses', { list: sList.join(' · ') }));
      }
      const w = this._getWeaponAttributes(item);
      if (w) {
        bits.push(`Daño: ${w.dmg} · Cadencia: ${w.aps}/s · Alcance: ${w.rangeTiles} cas.`);
        if (w.effects.length) bits.push(w.effects.join(' · '));
      }
      return bits.join(' · ');
    }

    _sortRecipes(recs) {
      const getTierScore = (id, item) => {
        if (item && item.tier) return Number(item.tier) * 50;
        if (!id) return 500;
        const s = id.toLowerCase();
        if (s.includes('omega') || s.includes('singularidad') || s.includes('antimateria') || s.includes('cronal')) return 1150;
        if (s.includes('celestial') || s.includes('estelar') || s.includes('arcano') || s.includes('vacio')) return 1100;
        if (s.includes('obsidiana') || s.includes('magma') || s.includes('fuego')) return 700;
        if (s.includes('platino') || s.includes('plata') || s.includes('titanio')) return 600;
        if (s.includes('acero')) return 500;
        if (s.includes('oro')) return 400;
        if (s.includes('hierro')) return 300;
        if (s.includes('cobre') || s.includes('bronce')) return 200;
        if (s.includes('piedra') || s.includes('hueso')) return 150;
        if (s.includes('madera') || s.includes('cuero') || s.includes('fibra')) return 100;
        return 250;
      };

      const getCatScore = (out) => {
        if (!out) return 10;
        const cat = (out.category || out.cat || '').toLowerCase();
        if (cat === 'materiales' || cat === 'recursos' || out.type === 'material') return 1000;
        if (cat === 'herramientas' || out.type === 'tool') return 2000;
        if (cat === 'armas' || out.type === 'weapon' || out.equipSlot === 'weapon') return 3000;
        if (cat === 'armaduras' || cat === 'equipamiento' || out.equipSlot) return 4000;
        if (cat === 'comida' || cat === 'pociones' || cat === 'alimentos' || cat === 'consumibles') return 5000;
        if (cat === 'construccion' || cat === 'bloques') return 6000;
        return 3500;
      };

      const score = (rec) => {
        if (rec.toolUnlock) return 50;
        if (rec.out === '_coin') return 10;
        const out = Abyssea.ITEMS[rec.out];
        const tier = getTierScore(rec.out, out);
        const cat = getCatScore(out);
        const val = out && out.value ? Math.min(out.value, 999) : 0;
        return cat + tier * 10 + val * 0.01;
      };

      return [...recs].sort((a, b) => {
        const sa = score(a);
        const sb = score(b);
        if (sa !== sb) return sa - sb;
        const nameA = (Abyssea.ITEMS[a.out] ? Abyssea.ITEMS[a.out].name : (a.out || '')).toLowerCase();
        const nameB = (Abyssea.ITEMS[b.out] ? Abyssea.ITEMS[b.out].name : (b.out || '')).toLowerCase();
        return nameA.localeCompare(nameB);
      });
    }

    _renderCraftingWorkspace(body, recList, opts = {}) {
      const g = this.game;
      const isEn = Abyssea.I18n && Abyssea.I18n.getLanguage && Abyssea.I18n.getLanguage() === 'en';
      const showStationLabel = opts.showStationLabel !== false;
      const sortedRecs = this._sortRecipes(recList || []);

      if (!sortedRecs.length) {
        body.appendChild(this.el('div', { class: 'parchment-box craft-inspector-empty', style: 'padding:24px;text-align:center;' }, [
          this.uiIcon('backpack', 32),
          this.el('strong', { style: 'color:#cbd5e1;font-size:16px;' }, isEn ? 'No recipes available in this category' : 'No hay recetas disponibles en esta categoría.')
        ]));
        return;
      }

      // If active selection is in the list, preserve it; otherwise null so details show only when clicked
      const currentSelected = sortedRecs.find(r => {
        const key = r.id || r.toolUnlock || r.out;
        return this.selectedCraftRecipeId && this.selectedCraftRecipeId === key;
      });

      const layout = this.el('div', { class: 'craft-layout' });
      const palette = this.el('div', { class: 'craft-palette' });

      // Live search bar for recipes & materials
      const searchBox = this._buildSearchBar(this.craftSearch || '', isEn ? 'Search recipes or materials...' : 'Buscar recetas o materiales...', (q) => {
        this.craftSearch = q;
        const needle = (q || '').trim().toLowerCase();
        Array.from(gridEl.children).forEach(slotEl => {
          const title = slotEl.getAttribute('data-search') || '';
          slotEl.style.display = (!needle || title.includes(needle)) ? '' : 'none';
        });
      });
      palette.appendChild(searchBox);

      // Recipe Slot Grid
      const gridEl = this.el('div', { class: 'craft-recipe-grid' });
      palette.appendChild(gridEl);
      layout.appendChild(palette);

      // Detail Inspector Panel (Master-Detail layout)
      const inspectorEl = this.el('div', { class: 'craft-inspector parchment-box' });
      layout.appendChild(inspectorEl);
      body.appendChild(layout);

      const renderInspector = (rec) => {
        inspectorEl.innerHTML = '';
        if (!rec) {
          inspectorEl.appendChild(this.el('div', { class: 'craft-inspector-empty' }, [
            this.uiIcon('anvil', 36),
            this.el('strong', { style: 'color:#ffd54f;font-size:16px;' }, isEn ? 'Select a Recipe' : 'Selecciona una Receta'),
            this.el('div', { style: 'font-size:13px;line-height:1.45;color:#94a3b8;' },
              isEn ? 'Click any item on the left to inspect its required materials, statistics, and craft it.'
                   : 'Haz clic en cualquier objeto de la izquierda para ver sus materiales requeridos, atributos y fabricarlo.'),
            this.el('div', { style: 'font-size:12px;color:#81c784;border-top:1px solid rgba(255,255,255,0.08);padding-top:8px;margin-top:4px;display:flex;align-items:center;justify-content:center;gap:6px;' }, [
              this.uiIcon('iconCheck', 12),
              this.el('span', {}, isEn ? 'Green indicator = Ready to craft!' : 'Punto verde = Listo para fabricar')
            ])
          ]));
          return;
        }

        const isCoin = rec.out === '_coin';
        const isTool = Boolean(rec.toolUnlock);
        const tDef = isTool ? Abyssea.TOOLS[rec.toolUnlock] : null;
        const outItem = isTool
          ? { name: tDef ? tDef.name : rec.toolUnlock, icon: rec.toolUnlock, desc: tDef ? (tDef.desc || tDef.role) : '' }
          : (isCoin ? { name: tr('craft.coinName'), icon: 'coin_gold', desc: tr('craft.coinDesc'), category: 'economia' } : Abyssea.ITEMS[rec.out]);

        if (!outItem) {
          inspectorEl.appendChild(this.el('div', { class: 'craft-inspector-empty' }, 'Información de receta no disponible.'));
          return;
        }

        const dur = g.getCraftDuration ? g.getCraftDuration(rec) : (rec.craftTime || 2.0);
        const hasStation = g.hasStationAvailable(rec.station);
        const reqSkill = rec.reqSkill ? (Abyssea.SKILLS && Abyssea.SKILLS[rec.reqSkill]) : null;
        const hasSkill = !rec.reqSkill || (Array.isArray(g.unlockedSkills) && g.unlockedSkills.includes(rec.reqSkill));
        const hasOmegaRes = !rec.reqOmega || Boolean(g.omega && g.omega.hasResearch(rec.reqOmega));
        const canAfford = hasStation && hasSkill && hasOmegaRes && Object.entries(rec.in || {}).every(([id, q]) => this._checkCraftIngredient(id, q).ok);
        const alreadyOwnedTool = isTool && Boolean(g.toolTiers && g.toolTiers[rec.toolUnlock]);

        // Calculate max batches player can craft right now
        let maxBatches = 9999;
        Object.entries(rec.in || {}).forEach(([id, q]) => {
          const check = this._checkCraftIngredient(id, q);
          maxBatches = Math.min(maxBatches, Math.floor(check.have / q));
        });
        if (maxBatches === 9999) maxBatches = 0;

        // Header: Big Icon + Name + Category/Rarity Badge
        const header = this.el('div', { style: 'display:flex;align-items:center;gap:12px;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:10px;' }, [
          isTool ? this.toolIcon(rec.toolUnlock, 'basica', 44) : this.itemIcon(outItem.icon, 44),
          this.el('div', { style: 'flex:1;min-width:0;' }, [
            this.el('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:6px;' }, [
              this.el('strong', { style: 'font-size:17px;color:#ffd54f;' }, isTool ? outItem.name : `${outItem.name}${rec.qty > 1 ? ` x${rec.qty}` : ''}`),
              outItem.rarity ? this.el('span', { class: `rarity-badge rarity-${outItem.rarity}`, style: 'font-size:11px;' }, outItem.rarity.toUpperCase()) : null
            ]),
            this.el('div', { style: 'display:flex;gap:6px;margin-top:3px;flex-wrap:wrap;' }, [
              this.el('span', { style: 'font-size:12px;color:#90caf9;background:rgba(33,150,243,0.15);border:1px solid rgba(33,150,243,0.3);padding:1px 6px;border-radius:3px;' },
                (Abyssea.I18n && Abyssea.I18n.getStationName ? Abyssea.I18n.getStationName(rec.station) : rec.station) || 'Mesa'),
              this.el('span', { style: 'font-size:12px;color:#cfd8dc;background:rgba(255,255,255,0.06);padding:1px 6px;border-radius:3px;' },
                `Tiempo: ${dur.toFixed(1)}s`)
            ])
          ])
        ]);
        inspectorEl.appendChild(header);

        // Description / Lore
        if (outItem.desc) {
          inspectorEl.appendChild(this.el('div', { style: 'font-size:13px;color:#cbd5e1;line-height:1.45;margin-top:6px;' }, outItem.desc));
        }

        // Weapon Stats / Armor Stats if applicable
        const wBox = this._buildWeaponStatsBox(outItem);
        if (wBox) inspectorEl.appendChild(wBox);

        if (outItem.equipSlot && (outItem.stats || outItem.bonus)) {
          const sk = outItem.equipSlot === 'helmet' ? 'helm' : outItem.equipSlot;
          const eqId = g.equipped && g.equipped[sk];
          const eqIt = eqId && eqId !== outItem.id ? Abyssea.ITEMS[eqId] : null;
          const armBox = this._buildArmorComparisonBox(eqIt, outItem);
          if (armBox) inspectorEl.appendChild(armBox);
        }

        // Skill / Omega research requirement
        if (reqSkill) {
          inspectorEl.appendChild(this.el('div', {
            style: `font-size:12px;font-weight:700;padding:5px 8px;border-radius:4px;background:${hasSkill ? 'rgba(46,125,50,0.22)' : 'rgba(183,28,28,0.28)'};border:1px solid ${hasSkill ? '#66bb6a' : '#ef5350'};color:${hasSkill ? '#a5d6a7' : '#ffab91'};margin-top:6px;`
          }, hasSkill ? `Habilidad aprendida: ${reqSkill.name}` : `Requiere Habilidad: ${reqSkill.name}`));
        }
        if (rec.reqOmega) {
          inspectorEl.appendChild(this.el('div', {
            style: `font-size:12px;font-weight:700;padding:5px 8px;border-radius:4px;background:${hasOmegaRes ? 'rgba(46,125,50,0.22)' : 'rgba(156,39,176,0.28)'};border:1px solid ${hasOmegaRes ? '#66bb6a' : '#e040fb'};color:${hasOmegaRes ? '#a5d6a7' : '#f3e5f5'};margin-top:6px;`
          }, hasOmegaRes
            ? (isEn ? 'Omega Research unlocked: Omega Metallurgy' : 'Investigación Omega completada: Metalurgia Omega')
            : (isEn ? 'Requires Central Nexus Research: Omega Metallurgy' : 'Requiere Investigación en el Nexo: Metalurgia Omega')));
        }

        // Station warning if not available
        if (!hasStation) {
          const stLabel = (Abyssea.I18n && Abyssea.I18n.getStationName) ? Abyssea.I18n.getStationName(rec.station) : rec.station;
          inspectorEl.appendChild(this.el('div', {
            style: 'font-size:12px;font-weight:700;padding:5px 8px;border-radius:4px;background:rgba(239,83,80,0.2);border:1px solid #ef5350;color:#ffab91;margin-top:6px;'
          }, `Requiere estación cercana: ${stLabel}`));
        }

        // Ingredients Checklist
        const ingCard = this.el('div', { style: 'margin-top:8px;display:flex;flex-direction:column;gap:5px;' }, [
          this.el('strong', { style: 'font-size:13px;color:#d5e2f0;margin-bottom:2px;' }, 'Materiales Necesarios:')
        ]);
        Object.entries(rec.in || {}).forEach(([ingId, needQty]) => {
          const check = this._checkCraftIngredient(ingId, needQty);
          const ingDef = Abyssea.ITEMS[ingId] || { name: ingId, icon: 'piedra' };
          const row = this.el('div', {
            class: `craft-ing-row ${check.ok ? 'ing-ok' : 'ing-missing'}`
          }, [
            this.el('div', { style: 'display:flex;align-items:center;gap:6px;' }, [
              this.itemIcon(ingDef.icon, 22),
              this.el('span', { style: `color:${check.ok ? '#e2e8f0' : '#ffa4a2'};font-size:13px;` },
                `${ingDef.name}${check.viaEquipped ? ' (equipado)' : ''}`)
            ]),
            this.el('strong', { style: `color:${check.ok ? '#81c784' : '#ef5350'};font-family:'AbysseaPixel',monospace;font-size:14px;` },
              `${check.have} / ${needQty}`)
          ]);
          ingCard.appendChild(row);
        });
        inspectorEl.appendChild(ingCard);

        // Action Buttons
        const actionArea = this.el('div', { style: 'display:flex;flex-direction:column;gap:6px;margin-top:10px;' });

        if (isTool && alreadyOwnedTool) {
          actionArea.appendChild(this.el('div', {
            class: 'card',
            style: 'text-align:center;padding:8px;color:#81c784;font-weight:bold;font-size:14px;'
          }, 'Herramienta ya desbloqueada'));
        } else {
          const queuedJob = (g.craftQueue || []).find(j => (isTool ? j.toolUnlock === rec.toolUnlock : j.recipeId === rec.id));
          if (queuedJob) {
            const rem = Math.max(0, (queuedJob.totalTime || 0) - (queuedJob.elapsed || 0)).toFixed(1);
            actionArea.appendChild(this.el('div', {
              class: 'card',
              style: 'text-align:center;padding:8px;color:#ffd54f;font-weight:bold;'
            }, `Fabricando... (${rem}s)`));
          } else {
            const btnRow = this.el('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;' });
            const btnX1 = this.el('button', {
              class: 'btn btn-green',
              style: 'flex:1 1 120px;padding:7px 10px;font-size:14px;',
              disabled: canAfford ? null : 'disabled',
              onclick: () => {
                g.craftRecipe(rec.id, 1);
                this.updateHUD(true);
                this.renderModal();
              }
            }, `Fabricar x1 (${dur.toFixed(1)}s)`);
            btnRow.appendChild(btnX1);

            if (canAfford && maxBatches >= 5 && !isTool) {
              btnRow.appendChild(this.el('button', {
                class: 'btn btn-gold btn-sm',
                style: 'min-width:44px;',
                onclick: () => {
                  g.craftRecipe(rec.id, 5);
                  this.updateHUD(true);
                  this.renderModal();
                }
              }, 'x5'));
            }

            if (canAfford && maxBatches >= 10 && !isTool) {
              btnRow.appendChild(this.el('button', {
                class: 'btn btn-gold btn-sm',
                style: 'min-width:48px;',
                onclick: () => {
                  g.craftRecipe(rec.id, 10);
                  this.updateHUD(true);
                  this.renderModal();
                }
              }, 'x10'));
            }

            if (canAfford && maxBatches > 1 && maxBatches !== 5 && maxBatches !== 10 && !isTool) {
              btnRow.appendChild(this.el('button', {
                class: 'btn btn-gold btn-sm',
                style: 'flex:1 1 auto;',
                onclick: () => {
                  g.craftRecipe(rec.id, maxBatches);
                  this.updateHUD(true);
                  this.renderModal();
                }
              }, `Todo (x${maxBatches})`));
            }

            actionArea.appendChild(btnRow);
          }
        }
        inspectorEl.appendChild(actionArea);
      };

      // Populate Palette Slots
      sortedRecs.forEach(rec => {
        const key = rec.id || rec.toolUnlock || rec.out;
        const isTool = Boolean(rec.toolUnlock);
        const tDef = isTool ? Abyssea.TOOLS[rec.toolUnlock] : null;
        const outItem = isTool
          ? { name: tDef ? tDef.name : rec.toolUnlock, icon: rec.toolUnlock }
          : (rec.out === '_coin' ? { name: tr('craft.coinName'), icon: 'coin_gold' } : Abyssea.ITEMS[rec.out]);

        if (!outItem) return;

        const hasStation = g.hasStationAvailable(rec.station);
        const hasSkill = !rec.reqSkill || (Array.isArray(g.unlockedSkills) && g.unlockedSkills.includes(rec.reqSkill));
        const hasOmegaRes = !rec.reqOmega || Boolean(g.omega && g.omega.hasResearch(rec.reqOmega));
        const canAfford = hasStation && hasSkill && hasOmegaRes && Object.entries(rec.in || {}).every(([id, q]) => this._checkCraftIngredient(id, q).ok);
        const isSelected = Boolean(this.selectedCraftRecipeId && this.selectedCraftRecipeId === key);

        const slotKids = [
          isTool ? this.toolIcon(rec.toolUnlock, 'basica', 34) : this.itemIcon(outItem.icon, 34)
        ];

        const outCount = rec.qty || rec.count || 1;
        if (outCount > 1) {
          slotKids.push(this.el('span', { class: 'slot-out-badge' }, `x${outCount}`));
        }

        const slotEl = this.el('div', {
          class: `craft-recipe-slot ${isSelected ? 'selected' : ''} ${canAfford ? 'can-craft' : 'cant-craft'}`,
          title: `${outItem.name}${canAfford ? ' (Listo para fabricar)' : ''}`,
          'data-search': `${outItem.name} ${outItem.category || ''} ${Object.keys(rec.in || {}).join(' ')}`.toLowerCase(),
          onclick: () => {
            if (this.selectedCraftRecipeId === key) {
              this.selectedCraftRecipeId = null;
              Array.from(gridEl.children).forEach(c => c.classList.remove('selected'));
              renderInspector(null);
              return;
            }
            this.selectedCraftRecipeId = key;
            Array.from(gridEl.children).forEach(c => c.classList.remove('selected'));
            slotEl.classList.add('selected');
            renderInspector(rec);
          }
        }, slotKids);

        gridEl.appendChild(slotEl);
      });

      // Initial inspector view
      renderInspector(currentSelected || null);
    }

    renderCrafting(body, opts = {}) {
      const g = this.game;
      const onlyStation = opts && opts.onlyStation ? opts.onlyStation : null;
      const activeFilter = onlyStation || this.craftFilter;

      if (!onlyStation) {
        const tabs = this.el('div', { class: 'tab-row' });
        [
          ['todas', tr('craft.tabTodas')],
          ['mano', tr('craft.tabMano')],
          ['horno', tr('craft.tabHorno')],
          ['aserradero', tr('craft.tabAserradero')],
          ['cocina', tr('craft.tabCocina')],
          ['taller', tr('craft.tabTaller')],
          ['forja', tr('craft.tabForja')],
          ['yunque_runico', tr('craft.tabYunque')],
          ['reforja', 'Reforja'],
          ['alquimia', 'Alquimia'],
          ['mesa_hechiceria', tr('craft.tabSorcery')],
          ['herramientas', tr('craft.tabTools')]
        ].forEach(([id, label]) => {
          tabs.appendChild(this.el('button', {
            class: 'tab-btn' + (this.craftFilter === id ? ' active' : ''),
            onclick: () => { this.craftFilter = id; this.renderModal(); }
          }, label));
        });
        body.appendChild(tabs);
      }

      if (activeFilter === 'alquimia' && typeof this.renderAlchemyLab === 'function') {
        const hasAlch = g.hasStationAvailable('alquimia') || (g.buildings || []).some(b => b.type === 'alquimia' || b.type === 'laboratorio');
        if (!hasAlch) {
          body.appendChild(this.el('div', { class: 'parchment-box', style: 'padding:20px;text-align:center;' }, [
            this.el('strong', { style: 'color:#ffd54f;font-size:16px;display:block;margin-bottom:6px;' }, 'Requiere Mesa de Alquimia construida'),
            this.el('div', { style: 'color:#cbd5e1;font-size:14px;' }, 'Construye una Mesa de Alquimia desde el menú de Construcción [R] para destilar pociones y elixires.')
          ]));
          return;
        }
        this.renderAlchemyLab(body);
        return;
      }
      if (activeFilter === 'reforja' && typeof this.renderReforgeTab === 'function') {
        const hasReforge = (g.buildings || []).some(b => b.type === 'mesa_reforja');
        if (!hasReforge) {
          body.appendChild(this.el('div', { class: 'parchment-box', style: 'padding:20px;text-align:center;' }, [
            this.el('strong', { style: 'color:#ffd54f;font-size:16px;display:block;margin-bottom:6px;' }, 'Requiere Mesa de Reforja construida'),
            this.el('div', { style: 'color:#cbd5e1;font-size:14px;' }, 'Construye una Mesa de Reforja desde el menú de Construcción [R] para reforjar prefijos de equipo.')
          ]));
          return;
        }
        this.renderReforgeTab(body);
        return;
      }

      const stInfo = getStationDesc(activeFilter);
      if (!onlyStation && stInfo && activeFilter !== 'herramientas') {
        body.appendChild(this.el('div', { class: 'parchment-box', style: 'margin-bottom:10px;font-size:15px;line-height:1.5;' }, [
          this.el('strong', { style: 'font-size:16px;' }, `${stInfo.title}: `),
          stInfo.text
        ]));
      }
      if (!onlyStation) {
        this._renderCraftQueueBanner(body);
      }

      if (activeFilter === 'herramientas') {
        const toolStInfo = getStationDesc('herramientas');
        body.appendChild(this.el('div', { class: 'parchment-box', style: 'margin-bottom:12px;font-size:15px;line-height:1.5;' }, [
          this.el('strong', { style: 'font-size:16px;' }, `${toolStInfo.title}: `),
          toolStInfo.text
        ]));
        body.appendChild(this._buildToolsGrid());
        return;
      }

      if (activeFilter === 'mano') {
        this.renderArtesaniaCategories(body, !onlyStation);
        return;
      }

      if (activeFilter === 'forja' || activeFilter === 'yunque_runico') {
        this.renderForjaCategories(body, activeFilter, !onlyStation);
        return;
      }

      const matchStation = (s) => {
        if (activeFilter === 'todas') return true;
        if (activeFilter === 'horno') return ['horno', 'fundicion'].includes(s);
        if (activeFilter === 'aserradero') return ['aserradero', 'molino', 'telar'].includes(s);
        if (activeFilter === 'cocina') return ['cocina', 'alquimia'].includes(s);
        if (activeFilter === 'taller') return ['taller', 'laboratorio', 'investigacion'].includes(s);
        if (activeFilter === 'mano') return s === 'mano' || s === 'mesa_artesania';
        return s === activeFilter;
      };

      const filteredRecs = Abyssea.RECIPES.filter(r => {
        if (!matchStation(r.station)) return false;
        const pa = Abyssea.isProgressiveArmorItem && Abyssea.isProgressiveArmorItem(r.out);
        if (pa && pa.tierIdx > 0) return false;
        return true;
      });
      this._renderCraftingWorkspace(body, filteredRecs, { showStationLabel: !onlyStation });
    }

    _buildToolsGrid(gridStyle = '') {
      const g = this.game;
      const grid = this.el('div', { class: 'grid-cards', style: gridStyle || null });
      const queue = g.craftQueue || [];
      Object.values(Abyssea.TOOLS).forEach(tool => {
        const curTier = g.toolTiers[tool.id];
        if (!curTier) {
          const rec = Abyssea.RECIPES.find(r => r.toolUnlock === tool.id);
          const queuedCraft = queue.find(j => j.toolUnlock === tool.id);
          const rem = queuedCraft ? Math.max(0, (queuedCraft.totalTime || 0) - (queuedCraft.elapsed || 0)).toFixed(1) : null;
          const dur = rec && g.getCraftDuration ? g.getCraftDuration(rec) : 2.0;
          const canCraft = !queuedCraft && rec && Object.entries(rec.in).every(([id, q]) => (g.inventory[id] || 0) >= q);
          const costBox = this.el('div', { style: 'font-size:14px;line-height:1.48;' });
          if (rec) {
            Object.entries(rec.in).forEach(([id, q]) => {
              const have = g.inventory[id] || 0;
              costBox.appendChild(this.el('div', { style: `color:${have >= q ? '#81c784' : '#ff8a65'}` },
                `${Abyssea.ITEMS[id] ? Abyssea.ITEMS[id].name : id}: ${have}/${q}`));
            });
          }
          const baseStats = Abyssea.getToolStats ? Abyssea.getToolStats(tool.id, 'basica') : null;
          const card = this.el('div', { class: 'card card-locked' }, [
            this.el('div', { class: 'card-head' }, [
              this.toolIcon(tool.id, 'basica', 34),
              this.el('div', {}, [
                this.el('strong', {}, tool.name),
                this.el('div', { style: 'font-size:14px;line-height:1.45;color:#ffb74d;' }, tr('craft.unbuiltTool'))
              ])
            ]),
            this.el('div', { style: 'font-size:14px;color:#e6eef6;line-height:1.48;' }, tool.desc || tool.role || ''),
            baseStats ? this.el('div', {
              style: 'background:rgba(15,23,42,0.72);border:1px solid rgba(255,213,79,0.28);border-radius:6px;padding:5px 8px;font-size:13px;color:#f8fafc;'
            }, `${tr('inv.powerTag', { n: baseStats.power })} · ${tr('inv.speedTag', { n: baseStats.speed })} · ${tr('inv.reachTag', { n: (baseStats.reach / 48).toFixed(1) })}`) : null,
            costBox,
            this.el('button', {
              class: 'btn btn-green btn-sm',
              'data-tool-busy-id': queuedCraft ? tool.id : null,
              'data-busy-kind': queuedCraft ? 'craft' : null,
              disabled: canCraft ? null : 'disabled',
              onclick: () => { g.craftTool(tool.id); this.renderModal(); }
            }, queuedCraft ? tr('craft.forgingProgress', { sec: rem }) : tr('craft.craftTimedBtn', { dur: dur.toFixed(1) }))
          ]);
          grid.appendChild(card);
          return;
        }

        const nextTier = Abyssea.getNextTier(curTier);
        const curStats = Abyssea.getToolStats(tool.id, curTier);
        const toolRarity = g.getGearRarity ? g.getGearRarity('tool', tool.id) : null;
        const hotSlotIdx = g.hotbar.findIndex(s => s && s.kind === 'tool' && s.id === tool.id);
        const card = this.el('div', { class: 'card' }, [
          this.el('div', { class: 'card-head' }, [
            this.toolIcon(tool.id, curTier, 34),
            this.el('div', {}, [
              this.el('div', { style: 'display:flex;align-items:center;gap:6px;flex-wrap:wrap;' }, [
                this.el('strong', { style: `color:${curStats.tierColor}` }, `${tool.name} (${curStats.tierName})`),
                (toolRarity && typeof this.renderGearRarityBadge === 'function') ? this.renderGearRarityBadge(toolRarity.id) : null
              ]),
              this.el('div', { style: 'font-size:14px;color:#e6eef6;line-height:1.45;' }, `${tr('inv.powerTag', { n: Math.round(curStats.power * (toolRarity ? toolRarity.powerMult : 1)) })} · ${tr('inv.speedTag', { n: curStats.speed })} · ${tr('inv.reachTag', { n: (curStats.reach / 48).toFixed(1) })}`),
              toolRarity && toolRarity.id !== 'comun'
                ? this.el('div', { style: `font-size:12px;color:${toolRarity.color};font-weight:700;` }, toolRarity.desc)
                : null
            ])
          ]),
          this.el('div', { style: 'font-size:14px;color:#dde8f4;line-height:1.48;' }, tool.desc || tool.role || '')
        ]);
        const hotBtnLabel = hotSlotIdx >= 0
          ? (hotSlotIdx === g.activeSlot ? tr('craft.equippedSlot', { slot: hotSlotIdx + 1 }) : tr('craft.moveToSlot', { from: hotSlotIdx + 1, to: g.activeSlot + 1 }))
          : tr('inv.sendHotbar');
        card.appendChild(this.el('button', {
          class: 'btn btn-stone btn-sm',
          onclick: () => {
            if (hotSlotIdx >= 0 && hotSlotIdx !== g.activeSlot) {
              g.swapHotbarSlots(hotSlotIdx, g.activeSlot);
            } else {
              g.quickTransferToHotbar('tool', tool.id);
            }
            this.renderModal();
          }
        }, hotBtnLabel));
        if (nextTier) {
          const compareBox = this._buildToolUpgradeComparisonBox(tool.id, curTier, nextTier);
          if (compareBox) card.appendChild(compareBox);
          const cost = tool.tierCosts[nextTier];
          const needsForja = (nextTier !== 'mejorada' && nextTier !== 'cobre') && !g.hasStationAvailable('forja');
          const needsOmegaRes = Boolean(cost && cost.reqOmega && (!g.omega || !g.omega.hasResearch(cost.reqOmega)));
          const itemsOk = cost && cost.items ? Object.entries(cost.items).every(([id, q]) => (g.inventory[id] || 0) >= q) : true;
          const queuedUp = queue.find(j => j.toolUpgrade === tool.id);
          const cdLeft = (g.toolUpgradeCooldowns && g.toolUpgradeCooldowns[tool.id]) || 0;
          const busy = Boolean(queuedUp || cdLeft > 0);
          const canUp = !busy && !needsForja && !needsOmegaRes && g.coins >= (cost ? cost.coins : 0) && itemsOk;
          const cDiv = this.el('div', { style: 'font-size:14px;line-height:1.48;' }, [
            this.el('div', { style: `color:${g.coins >= (cost ? cost.coins : 0) ? '#ffd54f' : '#ff8a65'}` }, `${tr('tooltip.goldLabel')}: ${g.coins}/${cost ? cost.coins : 0}`),
            ...(cost && cost.items ? Object.entries(cost.items).map(([id, q]) =>
              this.el('div', { style: `color:${(g.inventory[id] || 0) >= q ? '#81c784' : '#ff8a65'}` },
                `${Abyssea.ITEMS[id] ? Abyssea.ITEMS[id].name : id}: ${g.inventory[id] || 0}/${q}`)
            ) : [])
          ]);
          if (needsForja) cDiv.appendChild(this.el('div', { style: 'color:#ff8a65;' }, tr('tools.forjaRequired')));
          if (needsOmegaRes) {
            const isEnT = Abyssea.I18n && Abyssea.I18n.getLanguage && Abyssea.I18n.getLanguage() === 'en';
            cDiv.appendChild(this.el('div', { style: 'color:#e040fb;font-weight:700;' }, isEnT ? 'Requires Central Nexus: Omega Metallurgy' : 'Requiere Nexo Central: Metalurgia Omega'));
          }
          card.appendChild(cDiv);
          let upLabel;
          if (queuedUp) {
            const rem = Math.max(0, (queuedUp.totalTime || 0) - (queuedUp.elapsed || 0)).toFixed(1);
            upLabel = tr('craft.upgradingProgress', { sec: rem });
          } else if (cdLeft > 0) {
            upLabel = tr('craft.upgradeCooldown', { sec: cdLeft.toFixed(1) });
          } else {
            const dur = g.getToolUpgradeDuration ? g.getToolUpgradeDuration(nextTier) : 2.0;
            upLabel = tr('craft.upgradeTimedBtn', { tier: Abyssea.TIER_META[nextTier].name, dur: dur.toFixed(1) });
          }
          card.appendChild(this.el('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;' }, [
            this.el('button', {
              class: 'btn btn-gold btn-sm',
              'data-tool-busy-id': busy ? tool.id : null,
              'data-busy-kind': queuedUp ? 'up' : (cdLeft > 0 ? 'cd' : null),
              disabled: canUp ? null : 'disabled',
              onclick: () => {
                g.upgradeTool(tool.id);
                this.renderModal();
              }
            }, upLabel),
            this.el('button', {
              class: 'btn btn-primary btn-sm',
              onclick: () => {
                this.openModal('reforge');
              }
            }, 'Reforjar Rareza')
          ]));
        } else {
          card.appendChild(this.el('div', { style: 'display:flex;gap:6px;align-items:center;flex-wrap:wrap;' }, [
            this.el('span', { style: 'color:#81c784;font-weight:700;font-size:14px;' }, tr('craft.maxCelestial')),
            this.el('button', {
              class: 'btn btn-primary btn-sm',
              onclick: () => this.openModal('reforge')
            }, 'Reforjar Rareza')
          ]));
        }
        grid.appendChild(card);
      });
      return grid;
    }

    _buildArmorSlotCard(slot) {
      const g = this.game;
      const chain = Abyssea.ARMORS && Abyssea.ARMORS[slot];
      if (!chain) return null;
      const queue = g.craftQueue || [];
      const curId = g.getOwnedArmorItem ? g.getOwnedArmorItem(slot) : null;
      const slotLabel = chain.nameKey ? tr(chain.nameKey) : (chain.fallbackName || slot);

      if (!curId) {
        const baseItem = Abyssea.ITEMS[chain.baseItem];
        const rec = Abyssea.RECIPES.find(r => r.out === chain.baseItem);
        const queuedCraft = queue.find(j => j.armorUnlock === slot);
        const rem = queuedCraft ? Math.max(0, (queuedCraft.totalTime || 0) - (queuedCraft.elapsed || 0)).toFixed(1) : null;
        const dur = g.getCraftDuration ? g.getCraftDuration({ craftTime: 2.0 }) : 2.0;
        const hasSt = !rec || g.hasStationAvailable(rec.station);
        const canCraft = !queuedCraft && hasSt && rec && Object.entries(rec.in || {}).every(([id, q]) => (g.inventory[id] || 0) >= q);
        const costBox = this.el('div', { style: 'font-size:14px;line-height:1.48;' });
        if (rec) {
          Object.entries(rec.in || {}).forEach(([id, q]) => {
            const have = g.inventory[id] || 0;
            costBox.appendChild(this.el('div', { style: `color:${have >= q ? '#81c784' : '#ff8a65'}` },
              `${Abyssea.ITEMS[id] ? Abyssea.ITEMS[id].name : id}: ${have}/${q}`));
          });
        }
        return this.el('div', { class: 'card card-locked' }, [
          this.el('div', { class: 'card-head' }, [
            baseItem ? this.itemIcon(baseItem.icon, 34) : null,
            this.el('div', {}, [
              this.el('div', { style: 'font-size:12px;font-weight:700;color:#ffb74d;text-transform:uppercase;' }, slotLabel),
              this.el('strong', {}, baseItem ? baseItem.name : chain.baseItem),
              this.el('div', { style: 'font-size:14px;line-height:1.45;color:#ffb74d;' }, tr('craft.unbuiltArmor'))
            ])
          ]),
          baseItem ? this.el('div', { style: 'font-size:14px;color:#e6eef6;line-height:1.48;' }, this._describeItemExtras(baseItem) || baseItem.desc || '') : null,
          (!hasSt && rec) ? this.el('div', { style: 'color:#ff8a65;font-size:13px;font-weight:700;' }, `Requiere: ${(Abyssea.I18n && Abyssea.I18n.getStationName) ? Abyssea.I18n.getStationName(rec.station) : rec.station}`) : null,
          costBox,
          this.el('button', {
            class: 'btn btn-green btn-sm',
            'data-armor-busy-slot': queuedCraft ? slot : null,
            'data-busy-kind': queuedCraft ? 'craft' : null,
            disabled: canCraft ? null : 'disabled',
            onclick: () => { g.craftArmor(slot); this.renderModal(); }
          }, queuedCraft ? tr('craft.forgingProgress', { sec: rem }) : tr('craft.craftTimedBtn', { dur: dur.toFixed(1) }))
        ]);
      }

      const curItem = Abyssea.ITEMS[curId];
      const nextId = Abyssea.getArmorNextItem ? Abyssea.getArmorNextItem(slot, curId) : null;
      const nextItem = nextId ? Abyssea.ITEMS[nextId] : null;
      const tierIdx = Abyssea.getArmorTierIndex ? Abyssea.getArmorTierIndex(slot, curId) : 0;
      const isEquipped = g.equipped && g.equipped[slot] === curId;
      const rarityColors = { comun: '#cfd8dc', poco_comun: '#81c784', raro: '#64b5f6', epico: '#ce93d8', legendario: '#ffd54f' };
      const titleColor = (curItem && rarityColors[curItem.rarity]) || '#ffd54f';

      const card = this.el('div', { class: 'card' }, [
        this.el('div', { class: 'card-head' }, [
          curItem ? this.itemIcon(curItem.icon, 34) : null,
          this.el('div', {}, [
            this.el('div', { style: 'font-size:12px;font-weight:700;color:#ffb74d;text-transform:uppercase;' }, `${slotLabel} · T${tierIdx + 1}`),
            this.el('strong', { style: `color:${titleColor}` }, curItem ? curItem.name : curId)
          ])
        ]),
        curItem ? this.el('div', { style: 'font-size:14px;color:#dde8f4;line-height:1.48;' }, this._describeItemExtras(curItem) || curItem.desc || '') : null
      ]);

      card.appendChild(this.el('button', {
        class: isEquipped ? 'btn btn-stone btn-sm' : 'btn btn-primary btn-sm',
        disabled: isEquipped ? 'disabled' : null,
        onclick: () => {
          if (g.inventory && g.inventory[curId]) delete g.inventory[curId];
          if (g.equipped[slot] && g.equipped[slot] !== curId) {
            const prevEq = g.equipped[slot];
            if (!(Abyssea.isProgressiveArmorItem && Abyssea.isProgressiveArmorItem(prevEq))) {
              g.addItem(prevEq, 1);
            }
          }
          g.equipped[slot] = curId;
          g.recomputeModifiers();
          Abyssea.Audio.play('equip');
          this.renderModal();
        }
      }, isEquipped ? tr('craft.equippedArmorSlot') : tr('craft.equipArmorSlot', { name: curItem ? curItem.name : slotLabel })));

      if (nextId && nextItem) {
        const mat = Abyssea.getArmorUpgradeMaterials ? Abyssea.getArmorUpgradeMaterials(slot, nextId) : null;
        const stOk = !mat ? true : (mat.station === 'investigacion'
          ? (g.hasStationAvailable('investigacion') || g.hasStationAvailable('forja'))
          : g.hasStationAvailable(mat.station));
        const needsOmegaRes = Boolean(mat && mat.reqOmega && (!g.omega || !g.omega.hasResearch(mat.reqOmega)));
        const itemsOk = mat && mat.items
          ? Object.entries(mat.items).every(([id, q]) => (g.inventory[id] || 0) >= q)
          : true;
        const queuedUp = queue.find(j => j.armorUpgrade === slot);
        const cdLeft = (g.armorUpgradeCooldowns && g.armorUpgradeCooldowns[slot]) || 0;
        const busy = Boolean(queuedUp || cdLeft > 0);
        const canUp = !busy && stOk && !needsOmegaRes && itemsOk;

        const armorCmp = this._buildArmorComparisonBox(curItem, nextItem);
        if (armorCmp) card.appendChild(armorCmp);
        const cDiv = this.el('div', { style: 'font-size:14px;line-height:1.48;' }, [
          !armorCmp && nextItem.desc ? this.el('div', { style: 'color:#bfe2ff;font-size:13px;margin-bottom:2px;' }, `${nextItem.name}: ${nextItem.desc}`) : null,
          ...(mat && mat.items ? Object.entries(mat.items).map(([id, q]) =>
            this.el('div', { style: `color:${(g.inventory[id] || 0) >= q ? '#81c784' : '#ff8a65'}` },
              `${Abyssea.ITEMS[id] ? Abyssea.ITEMS[id].name : id}: ${g.inventory[id] || 0}/${q}`)
          ) : [])
        ]);
        if (!stOk) {
          const reqStLabel = (mat && mat.station && mat.station !== 'forja' && Abyssea.I18n && Abyssea.I18n.getStationName) ? `Requiere ${Abyssea.I18n.getStationName(mat.station)}` : tr('tools.forjaRequired');
          cDiv.appendChild(this.el('div', { style: 'color:#ff8a65;' }, reqStLabel));
        }
        if (needsOmegaRes) {
          const isEnA = Abyssea.I18n && Abyssea.I18n.getLanguage && Abyssea.I18n.getLanguage() === 'en';
          cDiv.appendChild(this.el('div', { style: 'color:#e040fb;font-weight:700;' }, isEnA ? 'Requires Central Nexus: Omega Metallurgy' : 'Requiere Nexo Central: Metalurgia Omega'));
        }
        card.appendChild(cDiv);

        let upLabel;
        if (queuedUp) {
          const rem = Math.max(0, (queuedUp.totalTime || 0) - (queuedUp.elapsed || 0)).toFixed(1);
          upLabel = tr('craft.upgradingProgress', { sec: rem });
        } else if (cdLeft > 0) {
          upLabel = tr('craft.upgradeCooldown', { sec: cdLeft.toFixed(1) });
        } else {
          const nextIdx = tierIdx + 1;
          const dur = g.getArmorUpgradeDuration ? g.getArmorUpgradeDuration(nextIdx) : 2.0;
          upLabel = tr('craft.upgradeTimedBtn', { tier: nextItem.name, dur: dur.toFixed(1) });
        }
        card.appendChild(this.el('button', {
          class: 'btn btn-gold btn-sm',
          'data-armor-busy-slot': busy ? slot : null,
          'data-busy-kind': queuedUp ? 'up' : (cdLeft > 0 ? 'cd' : null),
          disabled: canUp ? null : 'disabled',
          onclick: () => {
            g.upgradeArmor(slot);
            this.renderModal();
          }
        }, upLabel));
      } else {
        card.appendChild(this.el('span', { style: 'color:#81c784;font-weight:700;font-size:14px;' }, tr('craft.maxArmorRank')));
      }
      return card;
    }

    _buildArmorGrid(gridStyle = '') {
      const grid = this.el('div', { class: 'grid-cards', style: gridStyle || null });
      Object.keys(Abyssea.ARMORS || {}).forEach(slot => {
        const card = this._buildArmorSlotCard(slot);
        if (card) grid.appendChild(card);
      });
      return grid;
    }

    renderArtesaniaCategories(body, showStationLabel = false) {
      const g = this.game;
      this.artesaniaTab = this.artesaniaTab || 'herramientas';
      const validTabs = ['herramientas', 'economia', 'otros'];
      if (!validTabs.includes(this.artesaniaTab)) this.artesaniaTab = 'herramientas';

      const tabs = this.el('div', { class: 'tab-row', style: 'margin-bottom:12px;' });
      [
        ['herramientas', tr('craft.tabTools')],
        ['economia', tr('craft.tabEconomy')],
        ['otros', tr('craft.tabOther')]
      ].forEach(([catId, label]) => {
        tabs.appendChild(this.el('button', {
          class: 'tab-btn' + (this.artesaniaTab === catId ? ' active' : ''),
          onclick: () => { this.artesaniaTab = catId; this.renderModal(); }
        }, label));
      });
      body.appendChild(tabs);

      if (this.artesaniaTab === 'herramientas') {
        body.appendChild(this._buildToolsGrid('margin-bottom:12px;'));
        return;
      }

      if (this.artesaniaTab === 'economia') {
        const stRecs = Abyssea.RECIPES.filter(r => r.station === 'mano' && (r.out === '_coin' || r.coinIcon));
        this._renderCraftingWorkspace(body, stRecs, { showStationLabel });
        return;
      }

      if (this.artesaniaTab === 'otros') {
        const armorBaseIds = ['casco_cuero', 'armadura_cuero', 'escudo_madera', 'botas_cuero'];
        const otherRecs = Abyssea.RECIPES.filter(r => {
          if (r.station !== 'mano' && r.station !== 'mesa_artesania') return false;
          if (r.toolUnlock) return false;
          if (r.out === '_coin' || r.coinIcon) return false;
          if (armorBaseIds.includes(r.out)) return false;
          return true;
        });

        this._renderCraftingWorkspace(body, otherRecs, { showStationLabel });
        return;
      }
    }

    renderForjaCategories(body, stationId = 'forja', showStationLabel = false) {
      const g = this.game;
      this.forjaTab = this.forjaTab || 'armas';
      const validTabs = ['armas', 'armas_especiales', 'armadura', 'reforja', 'otros'];
      if (!validTabs.includes(this.forjaTab)) this.forjaTab = 'armas';

      const tabs = this.el('div', { class: 'tab-row', style: 'margin-bottom:12px;' });
      [
        ['armas', tr('craft.tabWeapons')],
        ['armas_especiales', tr('craft.tabSpecialWeapons')],
        ['armadura', tr('craft.tabArmor')],
        ['reforja', 'Reforjar Rareza'],
        ['otros', tr('craft.tabOther')]
      ].forEach(([catId, label]) => {
        tabs.appendChild(this.el('button', {
          class: 'tab-btn' + (this.forjaTab === catId ? ' active' : ''),
          onclick: () => { this.forjaTab = catId; this.renderModal(); }
        }, label));
      });
      body.appendChild(tabs);

      if (this.forjaTab === 'reforja' && typeof this.renderReforgeTab === 'function') {
        this.renderReforgeTab(body);
        return;
      }

      const standardWeaponTypes = ['daga_hierro', 'lanza_hierro', 'maza_hierro', 'hacha_batalla_hierro', 'espadon_hierro', 'ballesta_madera', 'daga_acero', 'daga_oro'];
      const isWeaponOut = (id) => {
        const item = Abyssea.ITEMS[id];
        if (!item) return false;
        if (item.equipSlot === 'weapon' || item.type === 'weapon') return true;
        return ['espada_', 'daga_', 'lanza_', 'maza_', 'hacha_batalla_', 'espadon_', 'ballesta_', 'varita_', 'cetro_', 'alabarda_', 'martillo_', 'katana_', 'hoja_'].some(p => id.startsWith(p));
      };

      if (this.forjaTab === 'armas' || this.forjaTab === 'armas_especiales') {
        const isSpecialTab = this.forjaTab === 'armas_especiales';
        const stRecs = Abyssea.RECIPES.filter(r => {
          if (r.station !== stationId) return false;
          if (!isWeaponOut(r.out)) return false;
          const isStd = standardWeaponTypes.includes(r.out);
          return isSpecialTab ? !isStd : isStd;
        });
        this._renderCraftingWorkspace(body, stRecs, { stationId, showStationLabel });
        return;
      }

      if (this.forjaTab === 'armadura') {
        body.appendChild(this.el('div', { class: 'parchment-box', style: 'margin-bottom:12px;font-size:15px;line-height:1.5;' }, [
          this.el('strong', { style: 'font-size:16px;color:#ffd54f;' }, tr('craft.progressiveArmorTitle')),
          this.el('div', { style: 'color:#d6e4f0;margin-top:2px;' }, tr('craft.progressiveArmorDesc'))
        ]));

        body.appendChild(this._buildArmorGrid('margin-bottom:14px;'));

        const armorSlots = ['helm', 'armor', 'legs', 'shield', 'boots'];
        const exoticRecs = Abyssea.RECIPES.filter(r => {
          if (r.station !== stationId) return false;
          const it = Abyssea.ITEMS[r.out];
          if (!it || !it.equipSlot) return false;
          const sk = it.equipSlot === 'helmet' ? 'helm' : it.equipSlot;
          if (!armorSlots.includes(sk)) return false;
          return !(Abyssea.isProgressiveArmorItem && Abyssea.isProgressiveArmorItem(r.out));
        });

        if (exoticRecs.length > 0) {
          body.appendChild(this.el('h4', { style: 'margin:12px 0 8px;color:#ce93d8;' }, tr('craft.exoticArmorTitle')));
          this._renderCraftingWorkspace(body, exoticRecs, { stationId, showStationLabel });
        }
        return;
      }

      if (this.forjaTab === 'otros') {
        const armorSlots = ['helm', 'armor', 'legs', 'shield', 'boots'];
        const otherRecs = Abyssea.RECIPES.filter(r => {
          if (r.station !== stationId) return false;
          if (isWeaponOut(r.out)) return false;
          const it = Abyssea.ITEMS[r.out];
          if (it && it.equipSlot) {
            const sk = it.equipSlot === 'helmet' ? 'helm' : it.equipSlot;
            if (armorSlots.includes(sk)) return false;
          }
          return true;
        });

        this._renderCraftingWorkspace(body, otherRecs, { stationId, showStationLabel });
        return;
      }
    }

    renderBuildMenu(body) {
      const g = this.game;
      const catIcons = {
        produccion: { src: Abyssea.UI_URLS.anvil, short: tr('build.catOficio') },
        economia: { src: Abyssea.UI_URLS.iconCoin, short: tr('build.catComercio') },
        agricultura: { src: Abyssea.UI_URLS.iconFood, short: tr('build.catCultivo') },
        tecnologia: { src: Abyssea.UI_URLS.iconSettings, short: tr('build.catTecno') },
        especiales: { src: Abyssea.UI_URLS.spellbook, short: tr('build.catArcano') },
        automatizacion: { src: Abyssea.UI_URLS.iconHammer, short: tr('build.catAuto') },
        fortificacion: { src: Abyssea.UI_URLS.iconWood, short: tr('build.catAldea') }
      };

      const layout = this.el('div', { class: 'build-layout' });
      const rail = this.el('div', { class: 'build-cat-rail' });
      Abyssea.BUILDING_CATEGORIES.forEach(cat => {
        const meta = catIcons[cat.id] || { src: Abyssea.UI_URLS.iconHammer, short: cat.name.slice(0, 6) };
        rail.appendChild(this.el('button', {
          class: 'build-cat-btn' + (this.buildFilter === cat.id ? ' active' : ''),
          title: cat.name,
          onclick: () => { this.buildFilter = cat.id; this.renderModal(); }
        }, [
          this.el('img', { class: 'pixel-img', src: encodeURI(meta.src), width: 22, height: 22, alt: '' }),
          this.el('span', {}, meta.short)
        ]));
      });
      layout.appendChild(rail);

      const rightCol = this.el('div', { class: 'build-list' });
      const bCards = [];
      const applyBuildSearch = (q) => {
        this.buildSearch = q;
        const needle = (q || '').trim().toLowerCase();
        bCards.forEach(card => {
          const txt = (card.textContent || '').toLowerCase();
          card.style.display = (!needle || txt.includes(needle)) ? '' : 'none';
        });
      };
      rightCol.appendChild(this._buildSearchBar(this.buildSearch, tr('build.searchPlaceholder'), applyBuildSearch));
      const activeCat = Abyssea.BUILDING_CATEGORIES.find(c => c.id === this.buildFilter);
      rightCol.appendChild(this.el('div', { class: 'parchment-box', style: 'padding:7px 10px;' }, [
        this.el('strong', { style: 'font-size:16px;' }, activeCat ? activeCat.name : tr('build.defaultTitle')),
        this.el('div', { style: 'font-size:14px;color:#bfd0ea;margin-top:2px;' }, tr('build.subtitle'))
      ]));

      Object.values(Abyssea.BUILDINGS)
        .filter(b => b.category === this.buildFilter || b.altCategory === this.buildFilter)
        .sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999))
        .forEach(b => {
        const buildCheck = g.canBuild(b.id);
        const skillUnlocked = Boolean(buildCheck && buildCheck.ok);
        const reqSkillObj = b.reqSkill && Abyssea.SKILLS[b.reqSkill];
        const cost = g.getAdjustedBuildCost(b.id);
        const canAfford = skillUnlocked && Object.entries(cost).every(([id, q]) => (g.inventory[id] || 0) >= q);

        const costLines = this.el('div', { style: 'display:flex;flex-wrap:wrap;gap:8px;font-size:14px;font-weight:700;' });
        Object.entries(cost).forEach(([id, q]) => {
          const have = g.inventory[id] || 0;
          const it = Abyssea.ITEMS[id];
          costLines.appendChild(this.el('span', {
            style: `display:inline-flex;align-items:center;gap:4px;color:${have >= q ? '#9be89d' : '#ff9e80'}`
          }, [
            it ? this.itemIcon(it.icon, 16) : null,
            `${it ? it.name : id}: ${have}/${q}`
          ]));
        });

        const actionBtn = !skillUnlocked && reqSkillObj
          ? this.el('button', {
              class: 'btn btn-gold btn-sm',
              'data-tip-text': tr('build.reqSkillTip', { name: reqSkillObj.name }),
              onclick: () => this.openModal('skills', b.reqSkill)
            }, tr('build.viewSkill'))
          : this.el('button', {
              class: 'btn btn-green btn-sm',
              disabled: canAfford ? null : 'disabled',
              onclick: () => {
                g.placingBuildingId = b.id;
                this.closeModal();
                this.updateHUD(true);
              }
            }, canAfford ? tr('common.build') : tr('common.missingMaterials'));

        const bCard = this.el('div', { class: 'build-row-card' + (skillUnlocked ? '' : ' card-locked') }, [
          this.el('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:10px;' }, [
            this.el('div', { style: 'display:flex;align-items:center;gap:10px;' }, [
              this.makeBuildingThumb(b, 44),
              this.el('div', {}, [
                this.el('strong', { style: 'font-size:16px;color:#ffe39a;display:block;' }, b.name),
                this.el('div', { style: 'font-size:14px;color:#dce8f5;line-height:1.45;' },
                  `${b.size}x${b.size}${b.placeOn === 'water' ? tr('build.waterPlace') : tr('build.landPlace')}` + (!skillUnlocked && reqSkillObj ? tr('build.reqPrefix', { name: reqSkillObj.name }) : ''))
              ])
            ]),
            actionBtn
          ]),
          this.el('div', { class: 'build-row-desc' }, b.desc),
          costLines
        ]);
        bCards.push(bCard);
        rightCol.appendChild(bCard);
      });
      if (this.buildSearch) applyBuildSearch(this.buildSearch);

      layout.appendChild(rightCol);
      body.appendChild(layout);
    }

    _ensureSkillSpriteStyles() {
      if (typeof document === 'undefined') return;
      if (document.getElementById('skill-socket-sprite-css')) return;

      const PALS = {
        locked: {
          hi: '#4c5e82', mid: '#2d3952', lo: '#192133',
          wellTop: '#13192c', wellBot: '#070a14',
          starDot: 'rgba(148, 163, 184, 0.25)', aura: null
        },
        available: {
          hi: '#7dd3fc', mid: '#0ea5e9', lo: '#0369a1',
          wellTop: '#153461', wellBot: '#091830',
          starDot: 'rgba(186, 230, 253, 0.45)', aura: 'rgba(56, 189, 248, 0.44)'
        },
        canAfford: {
          hi: '#6ee7b7', mid: '#10b981', lo: '#047857',
          wellTop: '#124739', wellBot: '#07221a',
          starDot: 'rgba(167, 243, 208, 0.52)', aura: 'rgba(52, 211, 153, 0.52)'
        },
        unlocked: {
          hi: '#fef08a', mid: '#f59e0b', lo: '#b45309',
          wellTop: '#3d2c0c', wellBot: '#1a1204',
          starDot: 'rgba(254, 240, 138, 0.55)', aura: 'rgba(251, 191, 36, 0.46)'
        }
      };

      const parseColor = (col) => {
        if (!col) return null;
        if (col[0] === '#') {
          const hex = col.slice(1);
          const n = parseInt(hex, 16);
          return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
        }
        const m = col.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);
        if (!m) return [255, 255, 255, 255];
        return [Math.round(+m[1]), Math.round(+m[2]), Math.round(+m[3]), m[4] !== undefined ? Math.round(+m[4] * 255) : 255];
      };
      const putPx = (buf, size, x, y, rgba) => {
        if (!rgba || x < 0 || y < 0 || x >= size || y >= size) return;
        const p = (y * size + x) << 2;
        buf[p] = rgba[0]; buf[p + 1] = rgba[1]; buf[p + 2] = rgba[2]; buf[p + 3] = rgba[3];
      };
      const blendPx = (buf, size, x, y, rgba) => {
        if (!rgba || x < 0 || y < 0 || x >= size || y >= size) return;
        const p = (y * size + x) << 2;
        const a = rgba[3] / 255;
        const dstA = buf[p + 3] / 255;
        const outA = a + dstA * (1 - a);
        if (outA <= 0) return;
        buf[p] = Math.round((rgba[0] * a + buf[p] * dstA * (1 - a)) / outA);
        buf[p + 1] = Math.round((rgba[1] * a + buf[p + 1] * dstA * (1 - a)) / outA);
        buf[p + 2] = Math.round((rgba[2] * a + buf[p + 2] * dstA * (1 - a)) / outA);
        buf[p + 3] = Math.round(outA * 255);
      };

      const renderPixelSocket = (size, wellR, shapeFn, pal) => {
        const cvs = document.createElement('canvas');
        cvs.width = size;
        cvs.height = size;
        const ctx = cvs.getContext('2d');
        const img = ctx.createImageData(size, size);
        const buf = img.data;
        const c = (size - 1) / 2;
        const mask = new Uint8Array(size * size);
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            if (shapeFn(x - c, y - c)) mask[y * size + x] = 1;
          }
        }
        const outline = new Uint8Array(size * size);
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            const idx = y * size + x;
            if (mask[idx]) continue;
            let touch = false;
            for (let oy = -1; oy <= 1 && !touch; oy++) {
              for (let ox = -1; ox <= 1; ox++) {
                const nx = x + ox, ny = y + oy;
                if (nx >= 0 && nx < size && ny >= 0 && ny < size && mask[ny * size + nx]) {
                  touch = true;
                  break;
                }
              }
            }
            if (touch) outline[idx] = 1;
          }
        }
        const cShadow = parseColor('rgba(2, 5, 13, 0.85)');
        const cAura = parseColor(pal.aura);
        const cContour = parseColor('#040711');
        const cInner = parseColor('#050814');
        const cWellTop = parseColor(pal.wellTop);
        const cWellBot = parseColor(pal.wellBot);
        const cHi = parseColor(pal.hi);
        const cMid = parseColor(pal.mid);
        const cLo = parseColor(pal.lo);
        const cStarDot = parseColor(pal.starDot);

        const maxR = c || 1;
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            const idx = y * size + x;
            if (outline[idx]) {
              putPx(buf, size, x, y, cContour);
              continue;
            }
            if (!mask[idx]) {
              if (x > 0 && y > 0 && outline[(y - 1) * size + (x - 1)]) {
                putPx(buf, size, x, y, cShadow);
              } else if (cAura) {
                const adj = (x > 0 && outline[idx - 1]) || (x + 1 < size && outline[idx + 1]) ||
                            (y > 0 && outline[idx - size]) || (y + 1 < size && outline[idx + size]);
                if (adj) putPx(buf, size, x, y, cAura);
              }
              continue;
            }
            const dx = x - c, dy = y - c;
            const d = Math.hypot(dx, dy);
            if (d <= wellR) {
              putPx(buf, size, x, y, (dy < 0 || d < wellR * 0.58) ? cWellTop : cWellBot);
            } else if (d <= wellR + 0.95) {
              putPx(buf, size, x, y, cInner);
            } else {
              const shade = (-dx - dy) / (maxR * 1.15);
              putPx(buf, size, x, y, shade > 0.22 ? cHi : shade > -0.24 ? cMid : cLo);
            }
          }
        }
        // Subtle pixel starlight sparkles inside socket well
        blendPx(buf, size, Math.round(c - wellR * 0.42), Math.round(c - wellR * 0.42), cStarDot);
        blendPx(buf, size, Math.round(c + wellR * 0.38), Math.round(c + wellR * 0.35), cStarDot);
        ctx.putImageData(img, 0, 0);
        return cvs.toDataURL();
      };

      const renderSelectionRing = (size, outerR, starPoints) => {
        const cvs = document.createElement('canvas');
        cvs.width = size;
        cvs.height = size;
        const ctx = cvs.getContext('2d');
        const img = ctx.createImageData(size, size);
        const buf = img.data;
        const c = (size - 1) / 2;
        const cWhite = [255, 255, 255, 255];
        const cGold = parseColor('#fde047');
        const cGlow = parseColor('rgba(251, 191, 36, 0.55)');
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            const dx = x - c, dy = y - c;
            const ax = Math.abs(dx), ay = Math.abs(dy);
            const d = Math.hypot(dx, dy);
            const onCircle = d >= outerR - 0.85 && d <= outerR + 0.35;
            const onCardinalTick = starPoints && ((ax <= 0.6 && ay >= outerR && ay <= outerR + 2.2) || (ay <= 0.6 && ax >= outerR && ax <= outerR + 2.2));
            if (onCircle || onCardinalTick) {
              putPx(buf, size, x, y, d <= outerR - 0.15 ? cWhite : cGold);
            } else if (d > outerR + 0.35 && d <= outerR + 1.3) {
              putPx(buf, size, x, y, cGlow);
            }
          }
        }
        ctx.putImageData(img, 0, 0);
        return cvs.toDataURL();
      };

      const renderLegendDot = (fillCol) => {
        const cvs = document.createElement('canvas');
        cvs.width = 7;
        cvs.height = 7;
        const ctx = cvs.getContext('2d');
        const img = ctx.createImageData(7, 7);
        const buf = img.data;
        const cFill = parseColor(fillCol);
        const cOut = parseColor('#040711');
        for (let y = 0; y < 7; y++) {
          for (let x = 0; x < 7; x++) {
            const d = Math.hypot(x - 3, y - 3);
            if (d <= 2.35) putPx(buf, 7, x, y, cFill);
            else if (d <= 3.35) putPx(buf, 7, x, y, cOut);
          }
        }
        ctx.putImageData(img, 0, 0);
        return cvs.toDataURL();
      };

      const circleShape = (dx, dy) => Math.hypot(dx, dy) <= 10.6;
      const keystoneShape = (dx, dy) => {
        const ax = Math.abs(dx), ay = Math.abs(dy);
        const d = Math.hypot(dx, dy);
        return d <= 10.6 || (ax * 2.25 + ay * 0.86 <= 12.2) || (ay * 2.25 + ax * 0.86 <= 12.2) || ((ax + ay) * 0.94 <= 11.4);
      };
      const hubShape = (dx, dy) => {
        const ax = Math.abs(dx), ay = Math.abs(dy);
        return Math.hypot(dx, dy) <= 22.8 || (ax <= 2.5 && ay <= 24.0) || (ay <= 2.5 && ax <= 24.0);
      };

      const urls = {};
      Object.keys(PALS).forEach(k => {
        urls[`c_${k}`] = renderPixelSocket(26, 7.6, circleShape, PALS[k]);
        urls[`k_${k}`] = renderPixelSocket(31, 7.8, keystoneShape, PALS[k]);
      });
      urls.hub = renderPixelSocket(52, 19.2, hubShape, {
        hi: '#fef08a', mid: '#f59e0b', lo: '#b45309',
        wellTop: '#1d2d59', wellBot: '#0b1124',
        starDot: 'rgba(254, 240, 138, 0.72)', aura: 'rgba(251, 191, 36, 0.5)'
      });
      urls.selRing = renderSelectionRing(30, 12.8, false);
      urls.keystoneSelRing = renderSelectionRing(35, 15.2, true);
      urls.legAvail = renderLegendDot('#38bdf8');
      urls.legUnlocked = renderLegendDot('#fbbf24');
      urls.legLocked = renderLegendDot('#475569');

      const styleEl = document.createElement('style');
      styleEl.id = 'skill-socket-sprite-css';
      styleEl.textContent = `
        #modal-box.skills-cosmic-fullscreen {
          --skill-sel-ring: url("${urls.selRing}");
          --skill-keystone-sel-ring: url("${urls.keystoneSelRing}");
        }
        #modal-box.skills-cosmic-fullscreen .tree-node-btn.locked { background-image: url("${urls.c_locked}") !important; }
        #modal-box.skills-cosmic-fullscreen .tree-node-btn.available { background-image: url("${urls.c_available}") !important; }
        #modal-box.skills-cosmic-fullscreen .tree-node-btn.available.can-afford { background-image: url("${urls.c_canAfford}") !important; }
        #modal-box.skills-cosmic-fullscreen .tree-node-btn.unlocked { background-image: url("${urls.c_unlocked}") !important; }
        #modal-box.skills-cosmic-fullscreen .tree-node-btn.keystone.locked { background-image: url("${urls.k_locked}") !important; }
        #modal-box.skills-cosmic-fullscreen .tree-node-btn.keystone.available { background-image: url("${urls.k_available}") !important; }
        #modal-box.skills-cosmic-fullscreen .tree-node-btn.keystone.available.can-afford { background-image: url("${urls.k_canAfford}") !important; }
        #modal-box.skills-cosmic-fullscreen .tree-node-btn.keystone.unlocked { background-image: url("${urls.k_unlocked}") !important; }
        #modal-box.skills-cosmic-fullscreen .skill-core-hub { background-image: url("${urls.hub}") !important; }
        #modal-box.skills-cosmic-fullscreen .skill-legend-hex.is-available { background-image: url("${urls.legAvail}"); }
        #modal-box.skills-cosmic-fullscreen .skill-legend-hex.is-unlocked { background-image: url("${urls.legUnlocked}"); }
        #modal-box.skills-cosmic-fullscreen .skill-legend-hex.is-locked { background-image: url("${urls.legLocked}"); }
      `;
      document.head.appendChild(styleEl);
    }

    _drawSkillPixelSky(canvas, dim) {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const pw = canvas.width;
      const ph = canvas.height;
      const cacheKey = `${pw}x${ph}:${dim.cx}x${dim.cy}`;
      if (this._cachedSkillSky && this._cachedSkillSkyKey === cacheKey) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(this._cachedSkillSky, 0, 0);
        return;
      }
      const off = document.createElement('canvas');
      off.width = pw;
      off.height = ph;
      const octx = off.getContext('2d');
      const cx = Math.round((dim.cx / dim.width) * pw);
      const cy = Math.round((dim.cy / dim.height) * ph);
      octx.imageSmoothingEnabled = false;

      // Stepped pixel midnight gradient rings (zero smooth gradient blur)
      octx.fillStyle = '#040712';
      octx.fillRect(0, 0, pw, ph);
      const rings = [
        { r: Math.round(pw * 0.48), col: '#060c1d' },
        { r: Math.round(pw * 0.35), col: '#081128' },
        { r: Math.round(pw * 0.22), col: '#0b1735' },
        { r: Math.round(pw * 0.11), col: '#102047' }
      ];
      rings.forEach(rg => {
        octx.fillStyle = rg.col;
        for (let y = -rg.r; y <= rg.r; y += 2) {
          const span = Math.floor(Math.sqrt(Math.max(0, rg.r * rg.r - y * y)));
          const px = cx - span;
          const py = cy + y;
          if (py >= 0 && py < ph) octx.fillRect(px, py, span * 2, 2);
        }
      });

      // Subtle dithered branch nebula clusters along each constellation arm
      const branches = Array.isArray(Abyssea.SKILL_BRANCHES) ? Abyssea.SKILL_BRANCHES : [];
      branches.forEach((br, bi) => {
        const ang = typeof br.angle === 'number' ? br.angle : (bi * Math.PI * 2 / Math.max(1, branches.length));
        octx.fillStyle = br.color || '#60a5fa';
        for (let step = 34; step <= 215; step += 12) {
          const bx = Math.round(cx + Math.cos(ang) * step);
          const by = Math.round(cy + Math.sin(ang) * step);
          for (let dx = -10; dx <= 10; dx += 2) {
            for (let dy = -10; dy <= 10; dy += 2) {
              if (((bx + dx + by + dy) & 3) !== 0) continue;
              const d = Math.hypot(dx, dy);
              if (d < 9 && ((dx * 7 + dy * 13 + step) & 3) === 0) {
                octx.globalAlpha = 0.08 + (1 - d / 9) * 0.09;
                octx.fillRect(bx + dx, by + dy, 2, 2);
              }
            }
          }
        }
      });
      octx.globalAlpha = 1;

      // Pixel-dotted orbital rings
      [58, 108, 158, 206].forEach((r, idx) => {
        octx.fillStyle = idx % 2 === 0 ? 'rgba(96, 165, 250, 0.22)' : 'rgba(148, 163, 184, 0.16)';
        const steps = Math.round(r * 1.9);
        for (let i = 0; i < steps; i++) {
          if (i % 3 === 0) continue;
          const a = (i / steps) * Math.PI * 2;
          const rx = Math.round(cx + Math.cos(a) * r);
          const ry = Math.round(cy + Math.sin(a) * r);
          octx.fillRect(rx, ry, 1, 1);
        }
      });

      // Deterministic pixel stars & 4-point cross sparkles
      let seed = 918273;
      const rnd = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
      };
      const starCols = ['#94a3b8', '#cbd5e1', '#bae6fd', '#fde68a', '#e9d5ff'];
      for (let i = 0; i < 310; i++) {
        const sx = Math.floor(rnd() * pw);
        const sy = Math.floor(rnd() * ph);
        const roll = rnd();
        octx.fillStyle = starCols[Math.floor(rnd() * starCols.length)];
        if (roll < 0.72) {
          octx.fillRect(sx, sy, 1, 1);
        } else if (roll < 0.90) {
          octx.fillRect(sx, sy, 2, 2);
        } else {
          octx.fillStyle = '#ffffff';
          octx.fillRect(sx, sy, 1, 1);
          octx.fillStyle = roll < 0.96 ? '#93c5fd' : '#fde68a';
          octx.fillRect(sx - 1, sy, 1, 1);
          octx.fillRect(sx + 1, sy, 1, 1);
          octx.fillRect(sx, sy - 1, 1, 1);
          octx.fillRect(sx, sy + 1, 1, 1);
        }
      }

      this._cachedSkillSky = off;
      this._cachedSkillSkyKey = cacheKey;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(off, 0, 0);
    }

    renderSkills(body) {
      this._ensureSkillSpriteStyles();
      const g = this.game;
      const unlockedCount = g.unlockedSkills.length;
      const allSkills = Object.values(Abyssea.SKILLS);
      const totalCount = allSkills.length;
      const dim = Abyssea.SKILL_CONSTELLATION_SIZE || { width: 1680, height: 1260, cx: 840, cy: 630 };

      const wrap = this.el('div', { class: 'skill-board-wrap' });
      const board = this.el('div', {
        class: 'skill-board',
        style: `width:${dim.width}px;height:${dim.height}px;`
      });
      const skyCvs = this.el('canvas', {
        class: 'skill-pixel-sky',
        width: String(Math.max(320, Math.round(dim.width / 3))),
        height: String(Math.max(240, Math.round(dim.height / 3)))
      });
      this._drawSkillPixelSky(skyCvs, dim);
      board.appendChild(skyCvs);

      // Single GPU-friendly canvas for all orbital rings + constellation lines (replaces 356 SVG vector nodes)
      const LINE_SCALE = 0.6;
      const lineCvs = this.el('canvas', {
        class: 'skill-lines-canvas',
        width: String(Math.round(dim.width * LINE_SCALE)),
        height: String(Math.round(dim.height * LINE_SCALE))
      });
      board.appendChild(lineCvs);

      const viewW = Math.max(760, (typeof window !== 'undefined' ? window.innerWidth : 1280) - 430);
      const viewH = Math.max(520, (typeof window !== 'undefined' ? window.innerHeight : 800) - 140);
      const fitZoom = Abyssea.Utils.clamp(
        Math.min((viewW - 44) / 2520, (viewH - 44) / 2160),
        0.28,
        0.52
      );
      const initialZoom = 1.04;
      if (this.skillPanX === null || this.skillPanY === null) {
        this.skillZoom = initialZoom;
        this.skillPanX = viewW / 2 - dim.cx * this.skillZoom;
        this.skillPanY = viewH / 2 - dim.cy * this.skillZoom;
      }

      let lastZoomText = `${Math.round(this.skillZoom * 100)}%`;
      const zoomLabel = this.el('span', { class: 'skill-zoom-readout' }, lastZoomText);
      let transformRaf = null;
      const applyTransformNow = () => {
        transformRaf = null;
        board.style.transform = `translate3d(${this.skillPanX.toFixed(1)}px, ${this.skillPanY.toFixed(1)}px, 0) scale(${this.skillZoom.toFixed(3)})`;
        const nextZoomText = `${Math.round(this.skillZoom * 100)}%`;
        if (nextZoomText !== lastZoomText) {
          lastZoomText = nextZoomText;
          zoomLabel.textContent = nextZoomText;
        }
      };
      const scheduleTransform = () => {
        if (transformRaf !== null) return;
        transformRaf = requestAnimationFrame(applyTransformNow);
      };

      const setZoomAround = (nextZoom, anchorX = wrap.clientWidth / 2 || viewW / 2, anchorY = wrap.clientHeight / 2 || viewH / 2, immediate = false) => {
        const clamped = Abyssea.Utils.clamp(nextZoom, 0.25, 1.85);
        const worldX = (anchorX - this.skillPanX) / this.skillZoom;
        const worldY = (anchorY - this.skillPanY) / this.skillZoom;
        this.skillZoom = clamped;
        this.skillPanX = anchorX - worldX * clamped;
        this.skillPanY = anchorY - worldY * clamped;
        if (immediate) applyTransformNow();
        else scheduleTransform();
      };

      const focusPoint = (wx, wy, z = 1.0) => {
        const vw = wrap.clientWidth || viewW;
        const vh = wrap.clientHeight || viewH;
        this.skillZoom = Abyssea.Utils.clamp(z, 0.25, 1.85);
        this.skillPanX = vw / 2 - wx * this.skillZoom;
        this.skillPanY = vh / 2 - wy * this.skillZoom;
        applyTransformNow();
      };

      if (this._skillHoldCleanup) { this._skillHoldCleanup(); this._skillHoldCleanup = null; }
      const pointsPill = this.el('div', { class: 'skill-points-pill' }, tr('skills.pointsPill', { sp: g.player.skillPoints, cur: unlockedCount, tot: totalCount }));
      const topBar = this.el('div', { class: 'skill-tree-topbar' }, [
        pointsPill,
        this.el('div', { class: 'skill-zoom-bar' }, [
          this.el('button', {
            class: 'btn btn-sm',
            'data-tip-text': tr('skills.zoomOutTip'),
            'aria-label': tr('skills.zoomOutTip'),
            onclick: () => setZoomAround(this.skillZoom - 0.16, undefined, undefined, true)
          }, [this.uiIcon('iconZoomOut', 18)]),
          zoomLabel,
          this.el('button', {
            class: 'btn btn-sm',
            'data-tip-text': tr('skills.zoomInTip'),
            'aria-label': tr('skills.zoomInTip'),
            onclick: () => setZoomAround(this.skillZoom + 0.16, undefined, undefined, true)
          }, [this.uiIcon('iconZoomIn', 18)]),
          this.el('button', { class: 'btn btn-gold btn-sm', onclick: () => focusPoint(dim.cx, dim.cy, fitZoom) }, tr('skills.resetZoom')),
          this.el('button', { class: 'btn btn-primary btn-sm', onclick: () => this.openModal('grimorio') }, tr('skills.grimoireBtn')),
          ...Abyssea.SKILL_BRANCHES.map(br => this.el('button', {
            class: 'btn btn-sm',
            style: `color:${br.color};`,
            onclick: () => focusPoint(dim.cx + Math.cos(br.angle) * 480, dim.cy + Math.sin(br.angle) * 480, 0.80)
          }, br.name.split(' ')[0]))
        ])
      ]);
      const headerTools = document.getElementById('modal-header-tools');
      if (headerTools) {
        headerTools.innerHTML = '';
        headerTools.appendChild(topBar);
        headerTools.classList.remove('hidden');
      } else {
        body.appendChild(topBar);
      }

      const workspace = this.el('div', { class: 'skill-tree-workspace' });

      // Build coordinate map straight from skills.js constellation layout
      const posById = {};
      allSkills.forEach(sk => {
        const br = Abyssea.SKILL_BRANCHES.find(b => b.id === sk.branch) || Abyssea.SKILL_BRANCHES[0];
        posById[sk.id] = { x: sk.x, y: sk.y, br };
      });

      const nodeBtnById = {};

      const drawSkillLines = () => {
        const lctx = lineCvs.getContext('2d');
        if (!lctx) return;
        lctx.setTransform(1, 0, 0, 1, 0, 0);
        lctx.clearRect(0, 0, lineCvs.width, lineCvs.height);
        lctx.setTransform(LINE_SCALE, 0, 0, LINE_SCALE, 0, 0);
        lctx.lineCap = 'round';

        // Decorative dashed cosmic rings
        lctx.strokeStyle = 'rgba(255, 226, 150, 0.08)';
        lctx.lineWidth = 1.5;
        lctx.setLineDash([6, 10]);
        [155, 295, 435, 580, 725, 865].forEach(rad => {
          lctx.beginPath();
          lctx.arc(dim.cx, dim.cy, rad, 0, Math.PI * 2);
          lctx.stroke();
        });

        const unlockedSet = new Set(g.unlockedSkills || []);
        const lockedSegs = [];
        const availGlowSegs = [];
        const availCoreSegs = [];
        const ownedGlowSegs = [];
        const ownedCoreSegs = [];

        allSkills.forEach(sk => {
          const p2 = posById[sk.id];
          if (!p2) return;
          const p1 = sk.req && posById[sk.req] ? posById[sk.req] : { x: dim.cx, y: dim.cy };
          if (unlockedSet.has(sk.id)) {
            ownedGlowSegs.push([p1.x, p1.y, p2.x, p2.y]);
            ownedCoreSegs.push([p1.x, p1.y, p2.x, p2.y]);
          } else if (!sk.req || unlockedSet.has(sk.req)) {
            availGlowSegs.push([p1.x, p1.y, p2.x, p2.y]);
            availCoreSegs.push([p1.x, p1.y, p2.x, p2.y]);
          } else {
            lockedSegs.push([p1.x, p1.y, p2.x, p2.y]);
          }
        });

        const strokeBatch = (segs, col, w, alpha, dash) => {
          if (!segs.length) return;
          lctx.globalAlpha = alpha;
          lctx.strokeStyle = col;
          lctx.lineWidth = w;
          lctx.setLineDash(dash);
          lctx.beginPath();
          for (let i = 0; i < segs.length; i++) {
            const s = segs[i];
            lctx.moveTo(s[0], s[1]);
            lctx.lineTo(s[2], s[3]);
          }
          lctx.stroke();
        };

        strokeBatch(lockedSegs, '#475569', 1.8, 0.28, [4, 7]);
        strokeBatch(availGlowSegs, '#0ea5e9', 6, 0.34, []);
        strokeBatch(availCoreSegs, '#7dd3fc', 2.8, 0.92, [7, 4]);
        strokeBatch(ownedGlowSegs, '#f59e0b', 8, 0.38, []);
        strokeBatch(ownedCoreSegs, '#fde68a', 3.2, 0.96, []);
        lctx.globalAlpha = 1;
        lctx.setLineDash([]);
      };

      const spawnUnlockBurst = (nodeBtn, fxColor) => {
        nodeBtn.querySelectorAll('.skill-fx-burst').forEach(el => {
          if (el.parentNode) el.parentNode.removeChild(el);
        });
        nodeBtn.classList.remove('skill-node-channeling', 'skill-node-unlocking');
        void nodeBtn.offsetWidth;
        nodeBtn.classList.add('skill-node-unlocking');

        const burst = document.createElement('div');
        burst.className = 'skill-fx-burst';

        const flash = document.createElement('div');
        flash.className = 'skill-node-flash';
        burst.appendChild(flash);

        const shock = document.createElement('div');
        shock.className = 'skill-shockwave-ring';
        shock.style.borderColor = fxColor;
        burst.appendChild(shock);

        const outerShock = document.createElement('div');
        outerShock.className = 'skill-shockwave-outer';
        burst.appendChild(outerShock);

        const rayH = document.createElement('div');
        rayH.className = 'skill-axial-ray';
        burst.appendChild(rayH);

        const rayV = document.createElement('div');
        rayV.className = 'skill-axial-ray vertical';
        burst.appendChild(rayV);

        const sparkColors = ['#ffd700', '#ffffff', '#80deea', '#6ee7b7', fxColor];
        const shardCount = 12;
        for (let p = 0; p < shardCount; p++) {
          const angle = (p / shardCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.18;
          const dist = (p % 2 === 0 ? 44 : 30) + Math.random() * 20;
          const part = document.createElement('div');
          part.className = 'skill-burst-particle';
          part.style.setProperty('--tx', `${(Math.cos(angle) * dist).toFixed(1)}px`);
          part.style.setProperty('--ty', `${(Math.sin(angle) * dist).toFixed(1)}px`);
          part.style.setProperty('--delay', `${(p % 3) * 0.03}s`);
          part.style.backgroundColor = sparkColors[p % sparkColors.length];
          const size = (p % 2 === 0) ? 7 : 5;
          part.style.width = `${size}px`;
          part.style.height = `${size}px`;
          part.style.margin = `${-size / 2}px 0 0 ${-size / 2}px`;
          burst.appendChild(part);
        }

        nodeBtn.appendChild(burst);
        setTimeout(() => {
          if (burst.parentNode) burst.parentNode.removeChild(burst);
          nodeBtn.classList.remove('skill-node-unlocking');
        }, 820);
      };

      const syncUnlockedBoardNodes = (skillId) => {
        pointsPill.textContent = tr('skills.pointsPill', {
          sp: g.player.skillPoints,
          cur: g.unlockedSkills.length,
          tot: totalCount
        });

        const unlockedBtn = nodeBtnById[skillId];
        if (unlockedBtn) {
          unlockedBtn.classList.remove('available', 'can-afford', 'locked');
          unlockedBtn.classList.add('unlocked');
          const badge = unlockedBtn.querySelector('.tree-node-tier');
          if (badge) {
            badge.innerHTML = '';
            const chk = this.uiIcon('iconCheck', 13);
            if (chk) badge.appendChild(chk);
          }
        }

        const spNow = g.player.skillPoints || 0;
        const unlockedSet = new Set(g.unlockedSkills || []);
        allSkills.forEach(ch => {
          if (unlockedSet.has(ch.id)) return;
          if (ch.req === skillId) {
            const childBtn = nodeBtnById[ch.id];
            if (childBtn) {
              childBtn.classList.remove('locked');
              childBtn.classList.add('available');
              childBtn.classList.toggle('can-afford', spNow >= (ch.cost || 1));
            }
          } else if (!ch.req || unlockedSet.has(ch.req)) {
            const oBtn = nodeBtnById[ch.id];
            if (oBtn) oBtn.classList.toggle('can-afford', spNow >= (ch.cost || 1));
          }
        });
        drawSkillLines();
      };

      // Right Parchment Inspector (updated in-place without rebuilding all 345 nodes)
      const inspector = this.el('div', { class: 'parchment-box skill-inspector', style: 'display:flex;flex-direction:column;gap:8px;' });

      const updateInspector = () => {
        if (this._skillHoldCleanup) { this._skillHoldCleanup(); this._skillHoldCleanup = null; }
        inspector.innerHTML = '';

        const selSk = Abyssea.SKILLS[this.selectedSkillId] || allSkills[0];
        const br = Abyssea.SKILL_BRANCHES.find(b => b.id === selSk.branch) || Abyssea.SKILL_BRANCHES[0];
        const owned = g.unlockedSkills.includes(selSk.id);
        const reqMet = !selSk.req || g.unlockedSkills.includes(selSk.req);
        const canBuy = !owned && reqMet && g.player.skillPoints >= selSk.cost;

        const unlocksBox = this.el('div', { style: 'margin-top:8px;' });
        if (selSk.unlocksBuildings && selSk.unlocksBuildings.length) {
          unlocksBox.appendChild(this.el('strong', { style: 'font-size:14px;color:#bae6fd;display:block;margin-bottom:5px;' }, tr('skills.unlocksTitle')));
          selSk.unlocksBuildings.forEach(bid => {
            const bd = Abyssea.BUILDINGS[bid];
            if (!bd) return;
            unlocksBox.appendChild(this.el('div', {
              style: 'display:flex;align-items:center;gap:8px;background:rgba(30,50,95,0.45);border:1px solid rgba(128,216,255,0.22);padding:5px 7px;border-radius:6px;margin-bottom:5px;'
            }, [
              this.makeBuildingThumb(bd, 28),
              this.el('div', {}, [
                this.el('div', { style: 'font-weight:700;font-size:14px;color:#f8fafc;' }, bd.name),
                this.el('div', { style: 'font-size:14px;color:#b8dcff;' }, this._catLabel(bd.category))
              ])
            ]));
          });
        } else {
          unlocksBox.appendChild(this.el('div', { style: 'font-size:14px;line-height:1.48;color:#b8dcff;' }, tr('skills.passiveDesc')));
        }

        const reqText = !selSk.req ? tr('skills.rootReq')
          : tr('skills.reqLine', {
            name: Abyssea.SKILLS[selSk.req] ? Abyssea.SKILLS[selSk.req].name : selSk.req,
            state: g.unlockedSkills.includes(selSk.req) ? tr('skills.reqDone') : tr('skills.reqPending')
          });

        inspector.appendChild(this.el('div', { class: 'card-head' }, [
          this.skillIcon(selSk.id, 44),
          this.el('div', {}, [
            this.el('strong', { style: 'font-size:17px;color:#ffffff;' }, selSk.name),
            this.el('div', { style: `font-size:14px;font-weight:800;color:${br.color || '#fde047'}` },
              `${br.fullName || br.name} · ${tr('common.level')} ${selSk.tier}`)
          ])
        ]));
        inspector.appendChild(this.el('div', { style: 'font-size:15px;line-height:1.48;font-weight:600;color:#eef4fc;' }, selSk.desc));
        inspector.appendChild(this.el('div', { style: 'font-size:14px;line-height:1.48;color:#b8dcff;' }, reqText));
        inspector.appendChild(this.el('div', { style: 'font-size:14px;line-height:1.45;color:#cbd5e1;' }, tr('skills.dragHint')));
        inspector.appendChild(unlocksBox);

        if (owned) {
          inspector.appendChild(this.el('div', { style: 'margin-top:8px;padding-top:8px;border-top:1px solid rgba(128,216,255,0.25);' }, [
            this.el('div', { style: 'color:#86efac;font-weight:800;font-size:15px;text-align:center;padding:8px;' }, tr('skills.activated'))
          ]));
          return;
        }
        if (!reqMet || !canBuy) {
          inspector.appendChild(this.el('div', { style: 'margin-top:8px;padding-top:8px;border-top:1px solid rgba(128,216,255,0.25);' }, [
            this.el('button', {
              class: 'btn btn-stone',
              style: 'width:100%;',
              disabled: 'disabled'
            }, reqMet ? tr('skills.needPoints', { cur: g.player.skillPoints, req: selSk.cost }) : tr('skills.needPrev'))
          ]));
          return;
        }

        // Hold-to-learn button (holds for 2.3 seconds with live progress fill, channeling aura, tone & particle flow)
        const isEnSk = Abyssea.I18n && Abyssea.I18n.getLanguage && Abyssea.I18n.getLanguage() === 'en';
        const holdHintText = isEnSk ? '(Hold)' : '(Mantener)';
        const fillBar = this.el('div', { class: 'btn-skill-hold-fill' });
        const baseLabel = tr('skills.activateCost', { cost: selSk.cost, unit: selSk.cost === 1 ? tr('skills.pointOne') : tr('skills.pointMany') });
        const textSpan = this.el('span', { class: 'btn-skill-hold-text' }, [
          this.el('span', {}, baseLabel),
          this.el('span', { style: 'font-size:13px;opacity:0.85;font-weight:normal;' }, holdHintText)
        ]);

        const holdBtn = this.el('div', {
          class: 'btn-skill-hold-activate',
          role: 'button',
          tabindex: '0'
        }, [fillBar, textSpan]);

        let holdRaf = null;
        let holdStartTime = 0;
        const HOLD_DURATION = 2300;
        let isHolding = false;

        const startHold = (e) => {
          if (e.button !== 0 && e.type !== 'touchstart' && e.pointerType === 'mouse' && e.button !== 0) return;
          if (isHolding) return;
          isHolding = true;
          holdStartTime = (typeof performance !== 'undefined' ? performance.now() : Date.now());
          holdBtn.classList.add('channeling');

          const targetNode = nodeBtnById[selSk.id];
          if (targetNode) targetNode.classList.add('skill-node-channeling');

          if (Abyssea.Audio) {
            Abyssea.Audio.tone(220, 360, 0.2, 'triangle', 0.22);
          }

          let nextSparkTime = 0;
          let lastPctStep = 0;

          const onFrame = (now) => {
            if (!isHolding) return;
            if (this.activeModal !== 'skills') {
              stopHold(false);
              return;
            }
            const elapsed = now - holdStartTime;
            const progress = Math.min(1, elapsed / HOLD_DURATION);
            fillBar.style.width = `${(progress * 100).toFixed(1)}%`;

            const pctInt = Math.floor(progress * 100);
            textSpan.innerHTML = `<span>${isEnSk ? 'Channeling...' : 'Canalizando...'}</span> <span style="color:#6ee7b7;font-weight:900;">${pctInt}%</span>`;

            if (targetNode && now > nextSparkTime) {
              nextSparkTime = now + 130;
              const spark = document.createElement('div');
              spark.className = 'skill-channel-spark';
              const sAngle = Math.random() * Math.PI * 2;
              const sDist = 34 + Math.random() * 22;
              spark.style.setProperty('--ox', `${(Math.cos(sAngle) * sDist).toFixed(1)}px`);
              spark.style.setProperty('--oy', `${(Math.sin(sAngle) * sDist).toFixed(1)}px`);
              targetNode.appendChild(spark);
              setTimeout(() => { if (spark.parentNode) spark.parentNode.removeChild(spark); }, 650);
            }

            if (pctInt >= lastPctStep + 20 && Abyssea.Audio) {
              lastPctStep = pctInt;
              const freq = 260 + (pctInt * 5);
              Abyssea.Audio.tone(freq, freq + 40, 0.08, 'sine', 0.18);
            }

            if (progress >= 1) {
              stopHold(false);
              unlockAndAdvance(selSk.id);
              return;
            }

            holdRaf = requestAnimationFrame(onFrame);
          };

          holdRaf = requestAnimationFrame(onFrame);
        };

        const stopHold = (cancelled = true) => {
          if (!isHolding) return;
          isHolding = false;
          if (holdRaf) {
            cancelAnimationFrame(holdRaf);
            holdRaf = null;
          }
          holdBtn.classList.remove('channeling');
          fillBar.style.width = '0%';
          textSpan.innerHTML = `<span>${baseLabel}</span> <span style="font-size:13px;opacity:0.85;font-weight:normal;">${holdHintText}</span>`;

          const targetNode = nodeBtnById[selSk.id];
          if (targetNode) targetNode.classList.remove('skill-node-channeling');

          if (cancelled && Abyssea.Audio) {
            Abyssea.Audio.play('cancel');
          }
        };
        this._skillHoldCleanup = () => stopHold(false);

        holdBtn.addEventListener('pointerdown', startHold);
        holdBtn.addEventListener('pointerup', () => stopHold(true));
        holdBtn.addEventListener('pointerleave', () => stopHold(true));
        holdBtn.addEventListener('pointercancel', () => stopHold(true));
        holdBtn.addEventListener('contextmenu', (e) => e.preventDefault());

        inspector.appendChild(this.el('div', { style: 'margin-top:8px;padding-top:8px;border-top:1px solid rgba(128,216,255,0.25);' }, [holdBtn]));
      };

      const selectSkillNode = (skId) => {
        const prevId = this.selectedSkillId;
        if (prevId === skId) return;
        const prevBtn = nodeBtnById[prevId];
        if (prevBtn) prevBtn.classList.remove('selected-node');
        this.selectedSkillId = skId;
        const nextBtn = nodeBtnById[skId];
        if (nextBtn) nextBtn.classList.add('selected-node');
        updateInspector();
      };

      const unlockAndAdvance = (skillId) => {
        if (!g.unlockSkill(skillId)) return;
        const skDef = Abyssea.SKILLS[skillId];
        const fxPos = posById[skillId];
        const fxColor = (fxPos && fxPos.br && fxPos.br.color) || '#ffd54f';

        if (fxPos) focusPoint(fxPos.x, fxPos.y, Math.max(0.95, this.skillZoom));

        // Update node & child nodes immediately so consecutive unlocks stay responsive during animation
        syncUnlockedBoardNodes(skillId);

        // Crisp micro-impact shake without overlapping stale timers
        if (this._skillQuakeTimer) {
          clearTimeout(this._skillQuakeTimer);
          this._skillQuakeTimer = null;
        }
        const modalBoxEl = document.getElementById('modal-box');
        if (modalBoxEl) {
          modalBoxEl.classList.remove('cosmic-quake-active');
          void modalBoxEl.offsetWidth;
          modalBoxEl.classList.add('cosmic-quake-active');
        }
        workspace.classList.remove('cosmic-quake-active');
        void workspace.offsetWidth;
        workspace.classList.add('cosmic-quake-active');
        this._skillQuakeTimer = setTimeout(() => {
          this._skillQuakeTimer = null;
          if (modalBoxEl) modalBoxEl.classList.remove('cosmic-quake-active');
          workspace.classList.remove('cosmic-quake-active');
        }, 300);

        if (Abyssea.Audio) {
          Abyssea.Audio.play('levelup');
          Abyssea.Audio.play('unlock_skill');
          Abyssea.Audio.tone(115, 38, 0.48, 'sawtooth', 0.42);
          Abyssea.Audio.tone(523.25, 1046.5, 0.38, 'triangle', 0.3, 0.05);
          Abyssea.Audio.tone(659.25, 1318.5, 0.42, 'sine', 0.25, 0.1);
        }

        const nodeBtn = nodeBtnById[skillId];
        if (nodeBtn) spawnUnlockBurst(nodeBtn, fxColor);

        workspace.querySelectorAll('.skill-unlock-celebration').forEach(el => {
          if (el.parentNode) el.parentNode.removeChild(el);
        });
        const banner = document.createElement('div');
        banner.className = 'skill-unlock-celebration';
        banner.innerHTML = `
          <div class="skill-cel-title">${tr('skills.activated')}</div>
          <div class="skill-cel-name">${skDef ? skDef.name : skillId}</div>
        `;
        workspace.appendChild(banner);

        // Keep the newly unlocked skill selected and refresh inspector in-place (zero board teardown)
        const prevBtn = nodeBtnById[this.selectedSkillId];
        if (prevBtn && this.selectedSkillId !== skillId) prevBtn.classList.remove('selected-node');
        this.selectedSkillId = skillId;
        if (nodeBtn) nodeBtn.classList.add('selected-node');
        updateInspector();

        if (this._skillUnlockFxTimer) clearTimeout(this._skillUnlockFxTimer);
        this._skillUnlockFxTimer = setTimeout(() => {
          this._skillUnlockFxTimer = null;
          if (this.activeModal !== 'skills') return;
          if (fxPos) focusPoint(fxPos.x, fxPos.y, Math.max(0.95, this.skillZoom));
        }, 900);
      };

      drawSkillLines();

      // Center Core Emblem
      const hub = this.el('div', {
        class: 'skill-core-hub',
        style: `left:${dim.cx}px;top:${dim.cy}px;`
      }, [
        this.itemIcon('abyssea_core', 34),
        this.el('span', {}, 'ABYSSEA')
      ]);
      board.appendChild(hub);

      // Constellation labels positioned outside the outer T8 orbital ring so no star overlaps
      const metaFrag = document.createDocumentFragment();
      Abyssea.SKILL_BRANCHES.forEach(br => {
        const lx = dim.cx + Math.cos(br.angle) * 1065;
        const ly = dim.cy + Math.sin(br.angle) * 1015;
        metaFrag.appendChild(this.el('div', {
          class: 'skill-branch-tag',
          style: `left:${lx.toFixed(1)}px;top:${ly.toFixed(1)}px;color:${br.color};`
        }, br.fullName || br.name));
      });
      board.appendChild(metaFrag);

      // Drag-to-Pan & Mouse-Wheel Zoom (rAF-coalesced + zero hover hit-testing while dragging)
      let dragging = false;
      let dragMoved = false;
      let startX = 0, startY = 0, origPanX = 0, origPanY = 0;

      const onPointerDown = (e) => {
        if (e.button !== 0) return;
        dragging = true;
        dragMoved = false;
        startX = e.clientX;
        startY = e.clientY;
        origPanX = this.skillPanX;
        origPanY = this.skillPanY;
      };
      const onPointerMove = (e) => {
        if (!dragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (!dragMoved && Math.hypot(dx, dy) > 4) {
          dragMoved = true;
          wrap.classList.add('dragging');
        }
        this.skillPanX = origPanX + dx;
        this.skillPanY = origPanY + dy;
        scheduleTransform();
      };
      const endDrag = () => {
        if (!dragging) return;
        dragging = false;
        wrap.classList.remove('dragging');
      };
      const onWheel = (e) => {
        e.preventDefault();
        const rect = wrap.getBoundingClientRect();
        const factor = e.deltaY < 0 ? 1.14 : 0.88;
        setZoomAround(this.skillZoom * factor, e.clientX - rect.left, e.clientY - rect.top);
      };

      wrap.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', endDrag);
      window.addEventListener('pointercancel', endDrag);
      window.addEventListener('blur', endDrag);
      wrap.addEventListener('wheel', onWheel, { passive: false });

      this._skillBoardCleanup = () => {
        if (transformRaf !== null) { cancelAnimationFrame(transformRaf); transformRaf = null; }
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', endDrag);
        window.removeEventListener('pointercancel', endDrag);
        window.removeEventListener('blur', endDrag);
      };

      // All Constellation Star Nodes appended in a single fragment
      const curSp = g.player.skillPoints || 0;
      const unlockedSet = new Set(g.unlockedSkills || []);
      const nodeFrag = document.createDocumentFragment();
      allSkills.forEach(sk => {
        const pos = posById[sk.id];
        if (!pos) return;
        const owned = unlockedSet.has(sk.id);
        const reqMet = !sk.req || unlockedSet.has(sk.req);
        const avail = !owned && reqMet;
        const canAfford = avail && curSp >= (sk.cost || 1);
        const isSel = this.selectedSkillId === sk.id;

        const btn = this.el('button', {
          class: 'tree-node-btn ' + (owned ? 'unlocked' : avail ? 'available' : 'locked')
            + (canAfford ? ' can-afford' : '')
            + (sk.keystone ? ' keystone' : '')
            + (isSel ? ' selected-node' : ''),
          'data-skill-node': sk.id,
          'data-skill-branch': sk.branch,
          style: `left:${pos.x.toFixed(1)}px;top:${pos.y.toFixed(1)}px;`,
          title: `${sk.name} — ${sk.desc}`,
          onclick: () => {
            if (dragMoved) { dragMoved = false; return; }
            selectSkillNode(sk.id);
          },
          ondblclick: () => {
            if (!unlockedSet.has(sk.id)) unlockAndAdvance(sk.id);
          }
        }, [
          this.skillIcon(sk.id, sk.keystone ? 28 : 24),
          this.el('span', { class: 'tree-node-tier' }, owned ? this.uiIcon('iconCheck', 13) : `T${sk.tier}`)
        ]);
        nodeBtnById[sk.id] = btn;
        nodeFrag.appendChild(btn);
      });
      board.appendChild(nodeFrag);

      applyTransformNow();
      wrap.appendChild(board);
      wrap.appendChild(this.el('div', { class: 'skill-tree-legend' }, [
        this.el('span', { class: 'skill-legend-item' }, [
          this.el('span', { class: 'skill-legend-hex is-available' }),
          tr('skills.legendAvailable')
        ]),
        this.el('span', { class: 'skill-legend-item' }, [
          this.el('span', { class: 'skill-legend-hex is-unlocked' }),
          tr('skills.legendUnlocked')
        ]),
        this.el('span', { class: 'skill-legend-item' }, [
          this.el('span', { class: 'skill-legend-hex is-locked' }),
          tr('skills.legendLocked')
        ])
      ]));
      workspace.appendChild(wrap);
      updateInspector();
      workspace.appendChild(inspector);
      body.appendChild(workspace);
    }

    renderMap(body) {
      const g = this.game;
      const pGx = Abyssea.Utils.clamp(Math.floor(g.player.x / (PLOT_TILES * TILE_SIZE)), 0, GRID_PLOTS - 1);
      const pGy = Abyssea.Utils.clamp(Math.floor(g.player.y / (PLOT_TILES * TILE_SIZE)), 0, GRID_PLOTS - 1);
      const getTutorialRecommendedPlot = () => {
        const tut = g.tutorialSys;
        const onlyFirstIsland = Array.isArray(g.unlockedPlots) && g.unlockedPlots.length === 1;
        const tutActive = Boolean(tut && !tut.done && !tut.skipped && ((typeof tut.isBuyIslandStepActive === 'function' && tut.isBuyIslandStepActive(g)) || onlyFirstIsland));
        if (!tutActive || !onlyFirstIsland) return null;
        if (tut && typeof tut.getRecommendedFirstPlot === 'function') {
          return tut.getRecommendedFirstPlot(g);
        }
        return [CENTER_PLOT !== undefined ? CENTER_PLOT : 9, Math.max(0, (CENTER_PLOT !== undefined ? CENTER_PLOT : 9) - 1)];
      };
      const initialRecPlot = getTutorialRecommendedPlot();
      if (!this.selectedMapPlot || (initialRecPlot && this.selectedMapPlot[0] === pGx && this.selectedMapPlot[1] === pGy && g.world.isPlotUnlocked(pGx, pGy))) {
        this.selectedMapPlot = initialRecPlot ? [initialRecPlot[0], initialRecPlot[1]] : [pGx, pGy];
      }

      const workspace = this.el('div', { class: 'map-workspace' });
      const boardWrap = this.el('div', { class: 'map-board-wrap' });

      const MAP_WORLD_SZ = 1216; // 19 * 64 logical units; static layer renders at 3x (3648x3648 = exact 16x16 px per tile!)
      const STATIC_TILE_PX = 16;
      const STATIC_PLOT_PX = PLOT_TILES * STATIC_TILE_PX; // 192px per plot
      const STATIC_WORLD_SZ = GRID_PLOTS * STATIC_PLOT_PX; // 3648px total
      const getPlotCenterPx = (gx, gy) => {
        const plotSz = MAP_WORLD_SZ / GRID_PLOTS;
        return { x: (gx + 0.5) * plotSz, y: (gy + 0.5) * plotSz };
      };

      const getMapCssSizeAndDpr = () => {
        const w = boardWrap.clientWidth || Math.max(640, (typeof window !== 'undefined' ? window.innerWidth : 1280) - 370);
        const h = boardWrap.clientHeight || Math.max(480, (typeof window !== 'undefined' ? window.innerHeight : 800) - 62);
        const rawDpr = (typeof window !== 'undefined' && Number.isFinite(window.devicePixelRatio)) ? window.devicePixelRatio : 1;
        // Minimum 2x supersampling ensures razor-sharp HD map icons, portraits & text on 1080p and HiDPI displays
        const dpr = Math.max(1.75, Math.min(2.5, rawDpr >= 1.5 ? rawDpr : rawDpr * 2));
        return { w, h, dpr };
      };
      const initView = getMapCssSizeAndDpr();
      const viewW = initView.w;
      const viewH = initView.h;
      const mapCanvas = document.createElement('canvas');
      mapCanvas.id = 'world-map-canvas';
      mapCanvas._cssW = viewW;
      mapCanvas._cssH = viewH;
      mapCanvas._dpr = initView.dpr;
      mapCanvas.width = Math.round(viewW * initView.dpr);
      mapCanvas.height = Math.round(viewH * initView.dpr);

      const fitZoom = Abyssea.Utils.clamp(Math.min((viewW - 40) / MAP_WORLD_SZ, (viewH - 40) / MAP_WORLD_SZ), 0.45, 1.35);
      if (!this.mapZoom || this.mapZoom < 0.45) this.mapZoom = Math.max(0.92, fitZoom * 1.25);
      if (this.mapPanX === null || this.mapPanY === null || this.mapPanX === undefined) {
        const focusGx = this.selectedMapPlot ? this.selectedMapPlot[0] : pGx;
        const focusGy = this.selectedMapPlot ? this.selectedMapPlot[1] : pGy;
        const focusPt = getPlotCenterPx(focusGx, focusGy);
        this.mapPanX = viewW / 2 - focusPt.x * this.mapZoom;
        this.mapPanY = viewH / 2 - focusPt.y * this.mapZoom;
      }

      const zoomReadout = this.el('span', { class: 'skill-zoom-readout', style: 'color:#ffe082;' }, `${Math.round(this.mapZoom * 100)}%`);
      const inspectorSlot = this.el('div', { class: 'map-inspector' });

      // Live skill-style Map Unlock FX state (channeling aura + burst shockwaves + starburst particles + energy links)
      let mapChannelState = null; // { gx, gy, progress, color, sparks: [] }
      const mapUnlockBursts = []; // { gx, gy, startTs, dur, color, accent, sparks: [], adjFrom: [[ax,ay]] }
      let mapFxRaf = null;
      let mapHoldCleanup = null;
      let mapQuakeTimer = null;

      const tickMapFx = () => {
        mapFxRaf = null;
        if (this.activeModal !== 'map') return;
        const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
        for (let i = mapUnlockBursts.length - 1; i >= 0; i--) {
          if (now - mapUnlockBursts[i].startTs >= mapUnlockBursts[i].dur) {
            mapUnlockBursts.splice(i, 1);
          }
        }
        drawMapCanvas();
        if (mapChannelState || mapUnlockBursts.length > 0) {
          mapFxRaf = requestAnimationFrame(tickMapFx);
        }
      };
      const ensureMapFxLoop = () => {
        if (mapFxRaf === null && typeof requestAnimationFrame === 'function') {
          mapFxRaf = requestAnimationFrame(tickMapFx);
        }
      };

      const triggerMapUnlockCelebration = (ugx, ugy) => {
        const uBiomeId = (g.world.plotBiomes && g.world.plotBiomes[ugy] && g.world.plotBiomes[ugy][ugx]) || 'pradera';
        const uBiome = BIOMES[uBiomeId] || { name: uBiomeId, color: '#63ab3f', accent: '#ffd54f' };
        const fxColor = uBiome.accent || '#ffd54f';
        const fxAccent = uBiome.color || '#69f0ae';
        const isEnMap = Abyssea.I18n && Abyssea.I18n.getLanguage && Abyssea.I18n.getLanguage() === 'en';

        // Collect adjacent owned islands to draw surging energy bridges into the newly conquered plot
        const adjFrom = [];
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          if (g.world.isPlotUnlocked(ugx + dx, ugy + dy)) adjFrom.push([ugx + dx, ugy + dy]);
        }

        // 32 radial starburst particles
        const sparks = [];
        for (let i = 0; i < 32; i++) {
          const ang = (Math.PI * 2 * i) / 32 + (Math.random() - 0.5) * 0.22;
          const spd = 28 + Math.random() * 68;
          sparks.push({
            ang,
            spd,
            sz: 2.2 + Math.random() * 3.2,
            col: i % 3 === 0 ? '#ffffff' : (i % 2 === 0 ? '#ffd54f' : fxColor),
            spin: (Math.random() - 0.5) * 6
          });
        }
        mapUnlockBursts.push({
          gx: ugx,
          gy: ugy,
          startTs: (typeof performance !== 'undefined' ? performance.now() : Date.now()),
          dur: 1350,
          color: fxColor,
          accent: fxAccent,
          sparks,
          adjFrom
        });
        ensureMapFxLoop();

        // Focus smoothly on the newly unlocked island
        focusMapPlot(ugx, ugy, Math.max(1.25, this.mapZoom));

        // Cosmic micro-impact shake matching the Skill Constellation Tree
        if (mapQuakeTimer) { clearTimeout(mapQuakeTimer); mapQuakeTimer = null; }
        const modalBoxEl = document.getElementById('modal-box');
        if (modalBoxEl) {
          modalBoxEl.classList.remove('cosmic-quake-active');
          void modalBoxEl.offsetWidth;
          modalBoxEl.classList.add('cosmic-quake-active');
        }
        workspace.classList.remove('cosmic-quake-active');
        void workspace.offsetWidth;
        workspace.classList.add('cosmic-quake-active');
        mapQuakeTimer = setTimeout(() => {
          mapQuakeTimer = null;
          if (modalBoxEl) modalBoxEl.classList.remove('cosmic-quake-active');
          workspace.classList.remove('cosmic-quake-active');
        }, 300);

        // Epic fanfare chord matching Skill Constellation unlock
        if (Abyssea.Audio) {
          Abyssea.Audio.play('unlock_skill');
          Abyssea.Audio.tone(115, 42, 0.42, 'sawtooth', 0.34);
          Abyssea.Audio.tone(523.25, 1046.5, 0.36, 'triangle', 0.28, 0.04);
          Abyssea.Audio.tone(659.25, 1318.5, 0.40, 'sine', 0.24, 0.09);
          Abyssea.Audio.tone(783.99, 1567.98, 0.44, 'sine', 0.20, 0.14);
        }

        // Floating Skill-Style Celebration Banner over the map workspace
        workspace.querySelectorAll('.skill-unlock-celebration').forEach(el => {
          if (el.parentNode) el.parentNode.removeChild(el);
        });
        const banner = document.createElement('div');
        banner.className = 'skill-unlock-celebration';
        banner.style.top = '78px';
        banner.innerHTML = `
          <div class="skill-cel-title">${isEnMap ? 'ISLAND CONQUERED!' : '¡ISLA CONQUISTADA!'}</div>
          <div class="skill-cel-name">${uBiome.name} (${ugx}, ${ugy})</div>
        `;
        workspace.appendChild(banner);
        setTimeout(() => { if (banner.parentNode) banner.parentNode.removeChild(banner); }, 1900);
      };

      let mapImgLoadGen = 0;
      const mapImg = (url) => {
        if (!this._mapImgCache) this._mapImgCache = {};
        if (!url) return null;
        const enc = encodeURI(url);
        const pre = Abyssea.Assets && Abyssea.Assets.preloadedUrls && Abyssea.Assets.preloadedUrls[enc];
        if (pre && pre.complete && pre.naturalWidth > 0) return pre;
        if (this._mapImgCache[url]) return this._mapImgCache[url];
        const im = new Image();
        im.onload = () => { mapImgLoadGen++; if (this.activeModal === 'map') drawMapCanvas(); };
        im.src = enc;
        this._mapImgCache[url] = im;
        return im;
      };

      const drawMapPin = (ctx, x, y, kind, opts = {}) => {
        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        const r = opts.r || 9;

        // Soft drop shadow for clean map readability
        ctx.fillStyle = 'rgba(4, 10, 20, 0.55)';
        ctx.beginPath();
        ctx.arc(x, y + 1.0, r + 0.6, 0, Math.PI * 2);
        ctx.fill();

        if (kind === 'player') {
          ctx.fillStyle = '#0f9f6e';
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.4;
          ctx.stroke();
          // Minimalist directional diamond/chevron inside
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(x, y - r * 0.55);
          ctx.lineTo(x + r * 0.48, y + r * 0.42);
          ctx.lineTo(x, y + r * 0.16);
          ctx.lineTo(x - r * 0.48, y + r * 0.42);
          ctx.closePath();
          ctx.fill();
        } else if (kind === 'dungeon' || kind === 'dungeon_cleared') {
          const cleared = kind === 'dungeon_cleared';
          // Sleek diamond badge
          ctx.fillStyle = cleared ? '#15803d' : '#b91c1c';
          ctx.beginPath();
          ctx.moveTo(x, y - r);
          ctx.lineTo(x + r, y);
          ctx.lineTo(x, y + r);
          ctx.lineTo(x - r, y);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = cleared ? '#bbf7d0' : '#fde68a';
          ctx.lineWidth = 1.1;
          ctx.stroke();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.25;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          if (cleared) {
            ctx.beginPath();
            ctx.moveTo(x - r * 0.36, y + 0.2);
            ctx.lineTo(x - r * 0.08, y + r * 0.34);
            ctx.lineTo(x + r * 0.38, y - r * 0.30);
            ctx.stroke();
          } else {
            // Minimalist doorway arch
            ctx.beginPath();
            ctx.moveTo(x - r * 0.32, y + r * 0.36);
            ctx.lineTo(x - r * 0.32, y - r * 0.08);
            ctx.arc(x, y - r * 0.08, r * 0.32, Math.PI, 0, false);
            ctx.lineTo(x + r * 0.32, y + r * 0.36);
            ctx.stroke();
          }
        } else if (kind === 'npc') {
          ctx.fillStyle = '#0369a1';
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
          const im = opts.url ? mapImg(opts.url) : null;
          if (im && im.complete && im.naturalWidth > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(x, y, Math.max(1, r - 0.9), 0, Math.PI * 2);
            ctx.clip();
            const s = (r - 0.5) * 2.15;
            ctx.drawImage(im, x - s / 2, y - s / 2, s, s);
            ctx.restore();
          } else {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x, y - r * 0.2, r * 0.28, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, y + r * 0.52, r * 0.45, Math.PI, 0, false);
            ctx.fill();
          }
          ctx.strokeStyle = '#bae6fd';
          ctx.lineWidth = 1.15;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.stroke();
        } else if (kind === 'altar') {
          ctx.fillStyle = '#6d28d9';
          ctx.beginPath();
          ctx.moveTo(x, y - r);
          ctx.lineTo(x + r * 0.85, y);
          ctx.lineTo(x, y + r);
          ctx.lineTo(x - r * 0.85, y);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#e9d5ff';
          ctx.lineWidth = 1.05;
          ctx.stroke();
          ctx.fillStyle = '#f5f3ff';
          ctx.beginPath();
          ctx.arc(x, y, r * 0.28, 0, Math.PI * 2);
          ctx.fill();
        } else if (kind === 'secret' || kind === 'secret_done') {
          const done = kind === 'secret_done';
          ctx.fillStyle = done ? '#475569' : (opts.locked ? '#7e22ce' : '#d97706');
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = done ? '#cbd5e1' : '#fef08a';
          ctx.lineWidth = 1.05;
          ctx.stroke();
          // Minimalist 4-point sparkle star
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          const ro = r * 0.56, ri = r * 0.20;
          for (let i = 0; i < 8; i++) {
            const ang = (i * Math.PI) / 4 - Math.PI / 2;
            const rr = i % 2 === 0 ? ro : ri;
            const pxS = x + Math.cos(ang) * rr;
            const pyS = y + Math.sin(ang) * rr;
            if (i === 0) ctx.moveTo(pxS, pyS);
            else ctx.lineTo(pxS, pyS);
          }
          ctx.closePath();
          ctx.fill();
        } else if (kind === 'portal') {
          ctx.fillStyle = '#0e7490';
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#67e8f9';
          ctx.lineWidth = 1.15;
          ctx.stroke();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.arc(x, y, r * 0.42, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      };

      const mapCoinsVal = this.el('span', { id: 'map-coins-readout' }, Abyssea.Utils.formatNum(g.coins));
      const syncMapCoinsBadge = () => {
        if (mapCoinsVal) mapCoinsVal.textContent = Abyssea.Utils.formatNum(g.coins);
      };
      const renderInspector = () => {
        syncMapCoinsBadge();
        inspectorSlot.innerHTML = '';
        const [sgx, sgy] = this.selectedMapPlot;
        const unlocked = g.world.isPlotUnlocked(sgx, sgy);
        const biomeId = g.world.plotBiomes[sgy][sgx];
        const biome = BIOMES[biomeId];
        const price = g.economy.getPlotPrice(g, sgx, sgy);
        const canAfford = g.coins >= price;
        const biomeLock = (g.economy && typeof g.economy.getBiomeLockStatus === 'function')
          ? g.economy.getBiomeLockStatus(g, sgx, sgy)
          : { lockedByBiome: false };
        const biomeProg = (g.economy && typeof g.economy.getBiomeUnlockProgress === 'function')
          ? g.economy.getBiomeUnlockProgress(g, biomeId)
          : null;
        const adj = !unlocked && ((g.economy && typeof g.economy.isPlotAdjacentlyReachable === 'function')
          ? g.economy.isPlotAdjacentlyReachable(g, sgx, sgy)
          : (g.world.isPlotUnlocked(sgx - 1, sgy) || g.world.isPlotUnlocked(sgx + 1, sgy) ||
             g.world.isPlotUnlocked(sgx, sgy - 1) || g.world.isPlotUnlocked(sgx, sgy + 1)));
        const portalB = g.buildings.find(b => b.type === 'portal' && Math.floor(b.tx / PLOT_TILES) === sgx && Math.floor(b.ty / PLOT_TILES) === sgy);
        const gate = g.world.getDungeonGateForPlot(sgx, sgy);
        const altarKey = unlocked && g.world.altarPlots && g.world.altarPlots[`${sgx},${sgy}`];
        const altarDef = altarKey && Abyssea.ALTAR_DEFS && Abyssea.ALTAR_DEFS[altarKey];
        const eeKey = unlocked && g.world.easterEggPlots && g.world.easterEggPlots[`${sgx},${sgy}`];
        const eeDef = eeKey && Abyssea.EASTER_EGG_DEFS && Abyssea.EASTER_EGG_DEFS[eeKey];
        const hasSecretKey = unlocked && g.world.secretChestPlots && g.world.secretChestPlots[`${sgx},${sgy}`] !== undefined;
        const secretNode = hasSecretKey
          ? g.world.nodes.find(n => n.kind === 'secret_chest' && Math.floor(n.tx / PLOT_TILES) === sgx && Math.floor(n.ty / PLOT_TILES) === sgy)
          : null;
        const secretPillarsDone = secretNode
          ? g.world.nodes.filter(n => n.kind === 'puzzle_pillar' && n.secretIdx === secretNode.secretIdx && n.activated).length
          : 0;
        const npc = Abyssea.NPCS.find(n => {
          const p = g.world.getNpcPlot(n);
          return p[0] === sgx && p[1] === sgy;
        });
        const localBuildings = g.buildings.filter(b => Math.floor(b.tx / PLOT_TILES) === sgx && Math.floor(b.ty / PLOT_TILES) === sgy);

        const isEn = Abyssea.I18n && Abyssea.I18n.getLanguage() === 'en';
        const recPlot = getTutorialRecommendedPlot();
        const isRecSelected = Boolean(recPlot && recPlot[0] === sgx && recPlot[1] === sgy);

        const tutGuideBanner = recPlot ? this.el('div', {
          class: 'map-tutorial-callout',
          style: 'background:linear-gradient(180deg, rgba(255,213,79,0.20), rgba(16,26,44,0.94));border:2px solid #ffd54f;border-radius:6px;padding:10px;display:flex;flex-direction:column;gap:6px;box-shadow:0 0 12px rgba(255,213,79,0.18);'
        }, [
          this.el('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:6px;' }, [
            this.el('strong', { style: 'font-size:14px;color:#ffd54f;letter-spacing:0.4px;' },
              isEn ? 'TUTORIAL: EXPAND YOUR TERRITORY' : 'TUTORIAL: EXPANDE TU TERRITORIO'),
            isRecSelected ? this.el('span', {
              style: 'background:#ffd54f;color:#101827;font-size:11px;font-weight:900;padding:2px 6px;border-radius:3px;'
            }, isEn ? 'RECOMMENDED' : 'RECOMENDADA') : null
          ]),
          this.el('div', { style: 'font-size:13px;line-height:1.4;color:#f1f5f9;' },
            isRecSelected
              ? (isEn
                ? 'This adjacent Meadow island is the ideal first expansion: low cost, rich resources, and safe terrain. Click the gold button below to unlock it!'
                : 'Esta isla adyacente de Pradera es la primera expansión ideal: bajo coste, recursos abundantes y terreno seguro. Pulsa el botón dorado de abajo para desbloquearla.')
              : (isEn
                ? `We recommend starting with adjacent plot (${recPlot[0]}, ${recPlot[1]}). Unlocking islands reveals new mineral veins, timber, NPCs, and dungeons.`
                : `Te recomendamos empezar por la parcela adyacente (${recPlot[0]}, ${recPlot[1]}). Desbloquear islas revela nuevas vetas minerales, madera, NPCs y mazmorras.`)),
          !isRecSelected ? this.el('button', {
            class: 'btn btn-gold',
            style: 'font-size:13px;padding:5px 8px;margin-top:2px;',
            onclick: () => {
              this.selectedMapPlot = [recPlot[0], recPlot[1]];
              focusMapPlot(recPlot[0], recPlot[1], Math.max(1.35, this.mapZoom));
              drawMapCanvas();
              renderInspector();
            }
          }, isEn ? `Select Recommended Island (${recPlot[0]}, ${recPlot[1]})` : `Seleccionar Isla Recomendada (${recPlot[0]}, ${recPlot[1]})`) : null
        ]) : null;

        const card = this.el('div', { style: 'display:flex;flex-direction:column;gap:10px;' }, [
          tutGuideBanner,
          this.el('div', { style: 'display:flex;align-items:center;gap:10px;border-bottom:1px solid rgba(255,213,79,0.22);padding-bottom:10px;' }, [
            this.biomeIcon(biomeId, 34),
            this.el('div', {}, [
              this.el('strong', { style: 'font-size:20px;color:#ffd54f;display:block;' }, biome.name),
              this.el('div', { style: 'font-size:14px;color:#b8d4ec;' }, tr('map.islandMeta', {
                x: sgx, y: sgy, state: unlocked ? tr('map.plotOwned') : tr('map.toExplore'),
                cur: g.unlockedPlots.length, tot: GRID_PLOTS * GRID_PLOTS
              })),
              biomeProg ? this.el('div', {
                style: `font-size:13px;font-weight:800;margin-top:2px;color:${biomeProg.complete ? '#86efac' : '#ffe082'};`
              }, isEn
                ? `Biome Progress: ${biomeProg.unlocked}/${biomeProg.total} islands · ${biomeProg.dungeonsDone}/${biomeProg.dungeonsTotal} dungeons`
                : `Progreso del Bioma: ${biomeProg.unlocked}/${biomeProg.total} islas · ${biomeProg.dungeonsDone}/${biomeProg.dungeonsTotal} mazmorras`) : null
            ])
          ]),
          (!unlocked && biomeLock.lockedByBiome) ? this.el('div', {
            style: 'background:rgba(127,29,29,0.28);border:1.5px solid #ef5350;border-radius:6px;padding:8px 10px;font-size:13px;line-height:1.4;color:#fecaca;'
          }, [
            this.el('strong', { style: 'color:#fca5a5;display:block;margin-bottom:3px;' },
              isEn ? 'BIOME LOCKED BY PROGRESSION' : 'BIOMA BLOQUEADO POR PROGRESIÓN'),
            this.el('div', {},
              isEn
                ? `You must unlock all islands (${biomeLock.unlocked}/${biomeLock.total}) and clear all dungeons (${biomeLock.dungeonsDone}/${biomeLock.dungeonsTotal}) of ${biomeLock.blockingBiomeName} before purchasing islands in ${biome.name}.`
                : `Debes desbloquear todas las islas (${biomeLock.unlocked}/${biomeLock.total}) y completar todas las mazmorras (${biomeLock.dungeonsDone}/${biomeLock.dungeonsTotal}) de ${biomeLock.blockingBiomeName} antes de comprar islas en ${biome.name}.`)
          ]) : null,
          this.el('div', { style: 'font-size:14px;line-height:1.45;color:#e8eef6;' },
            unlocked
              ? tr('map.unlockedDesc', { b: localBuildings.length, d: g.clearedDungeons.length, dt: Object.keys(Abyssea.DUNGEON_DEFS).length })
              : tr('map.lockedCostDesc', { price, coins: g.coins })),
          npc ? this.el('div', { style: 'display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.08);padding:8px;border-radius:6px;border:1px solid rgba(128,216,255,0.28);' }, [
            this.npcPortrait(npc.id, 40),
            this.el('div', { style: 'font-size:14px;' }, [this.el('strong', { style: 'color:#80f0ff;' }, npc.name), this.el('div', {}, tr('map.questNpc'))])
          ]) : null,
          gate ? this.el('div', { style: 'font-size:14px;color:#ff8a80;font-weight:800;display:flex;align-items:center;gap:6px;flex-wrap:wrap;' }, [
            tr('map.dungeonBadge', { lvl: gate.recLevel || 2, name: gate.name }),
            g.clearedDungeons.includes(gate.id) ? this.el('span', { style: 'color:#86efac;' }, [this.uiIcon('iconCheck', 13), tr('common.completed')]) : null
          ]) : null,
          altarDef ? this.el('div', { style: 'font-size:14px;color:#ce93d8;font-weight:800;' }, tr('map.altarLine', { name: altarDef.name })) : null,
          eeDef ? this.el('div', { style: 'font-size:14px;color:#ffb74d;font-weight:800;' }, tr('map.secretLine', { name: eeDef.name })) : null,
          secretNode ? this.el('div', {
            style: `font-size:14px;font-weight:800;color:${secretNode.opened ? '#b0bec5' : (!secretNode.puzzleLocked ? '#ffd54f' : '#ea80fc')};`
          }, secretNode.opened
            ? tr('map.secretClaimed')
            : (!secretNode.puzzleLocked
              ? tr('map.secretReady')
              : tr('map.secretPillars', { done: secretPillarsDone }))) : null
        ]);

        if (mapHoldCleanup) { mapHoldCleanup(); mapHoldCleanup = null; }
        if (!unlocked) {
          const canUnlockHere = adj && !biomeLock.lockedByBiome;
          const btnLabel = biomeLock.lockedByBiome
            ? (isEn
              ? `Complete ${biomeLock.blockingBiomeName} (${biomeLock.unlocked}/${biomeLock.total} isl. · ${biomeLock.dungeonsDone}/${biomeLock.dungeonsTotal} dung.)`
              : `Completa ${biomeLock.blockingBiomeName} (${biomeLock.unlocked}/${biomeLock.total} isl. · ${biomeLock.dungeonsDone}/${biomeLock.dungeonsTotal} maz.)`)
            : (!adj
              ? tr('map.reqAdjacent')
              : (canAfford ? tr('map.unlockPlot', { coins: price }) : tr('map.lowCoins', { cur: g.coins, req: price })));

          if (canUnlockHere && canAfford) {
            // Skill-Tree-Style Hold-to-Conquer button with channeling progress, live map energy vortex & burst celebration!
            const holdHintText = isEn ? '(Hold)' : '(Mantener)';
            const fillBar = this.el('div', { class: 'btn-skill-hold-fill' });
            const textSpan = this.el('span', { class: 'btn-skill-hold-text' }, [
              this.el('span', {}, btnLabel),
              this.el('span', { style: 'font-size:13px;opacity:0.88;font-weight:normal;' }, holdHintText)
            ]);
            const holdBtn = this.el('div', {
              class: 'btn-skill-hold-activate',
              role: 'button',
              tabindex: '0',
              style: 'margin-top:4px;'
            }, [fillBar, textSpan]);

            let holdRaf = null;
            let holdStart = 0;
            const HOLD_MS = 1350;
            let isHolding = false;

            const stopHold = (cancelled = true) => {
              if (!isHolding) return;
              isHolding = false;
              if (holdRaf) { cancelAnimationFrame(holdRaf); holdRaf = null; }
              holdBtn.classList.remove('channeling');
              fillBar.style.width = '0%';
              textSpan.innerHTML = `<span>${btnLabel}</span> <span style="font-size:13px;opacity:0.88;font-weight:normal;">${holdHintText}</span>`;
              mapChannelState = null;
              drawMapCanvas();
              if (cancelled && Abyssea.Audio) Abyssea.Audio.play('cancel');
            };

            const startHold = (e) => {
              if (e.pointerType === 'mouse' && e.button !== 0) return;
              if (isHolding) return;
              isHolding = true;
              holdStart = (typeof performance !== 'undefined' ? performance.now() : Date.now());
              holdBtn.classList.add('channeling');
              const bAccent = (biome && biome.accent) || '#ffd54f';
              mapChannelState = { gx: sgx, gy: sgy, progress: 0, color: bAccent, startTs: holdStart };
              ensureMapFxLoop();
              if (Abyssea.Audio) Abyssea.Audio.tone(220, 340, 0.18, 'triangle', 0.22);

              let lastPctStep = 0;
              const onFrame = (now) => {
                if (!isHolding) return;
                if (this.activeModal !== 'map') { stopHold(false); return; }
                const progress = Math.min(1, (now - holdStart) / HOLD_MS);
                fillBar.style.width = `${(progress * 100).toFixed(1)}%`;
                const pctInt = Math.floor(progress * 100);
                textSpan.innerHTML = `<span>${isEn ? 'Conquering...' : 'Desbloqueando...'}</span> <span style="color:#ffe082;font-weight:900;">${pctInt}%</span>`;
                if (mapChannelState) mapChannelState.progress = progress;

                if (pctInt >= lastPctStep + 20 && Abyssea.Audio) {
                  lastPctStep = pctInt;
                  const freq = 260 + pctInt * 4.8;
                  Abyssea.Audio.tone(freq, freq + 45, 0.08, 'sine', 0.18);
                }

                if (progress >= 1) {
                  stopHold(false);
                  const bought = g.economy.buyPlot(g, sgx, sgy);
                  if (bought) {
                    triggerMapUnlockCelebration(sgx, sgy);
                  } else {
                    drawMapCanvas();
                  }
                  renderInspector();
                  this.updateHUD(true);
                  return;
                }
                holdRaf = requestAnimationFrame(onFrame);
              };
              holdRaf = requestAnimationFrame(onFrame);
            };

            mapHoldCleanup = () => stopHold(false);
            holdBtn.addEventListener('pointerdown', startHold);
            holdBtn.addEventListener('pointerup', () => stopHold(true));
            holdBtn.addEventListener('pointerleave', () => stopHold(true));
            holdBtn.addEventListener('pointercancel', () => stopHold(true));
            holdBtn.addEventListener('contextmenu', (e) => e.preventDefault());
            card.appendChild(holdBtn);
          } else {
            card.appendChild(this.el('button', {
              class: 'btn btn-stone',
              style: `margin-top:4px;${(canUnlockHere && !canAfford) || biomeLock.lockedByBiome ? 'color:#ff8a80;border-color:#c62828;' : ''}`,
              disabled: 'disabled'
            }, btnLabel));
          }
        } else if (portalB) {
          card.appendChild(this.el('button', {
            class: 'btn btn-primary',
            style: 'margin-top:4px;',
            onclick: () => {
              if (g.activeDungeon) {
                g.toast('No puedes usar viaje rápido dentro de una mazmorra.', 'warn');
                return;
              }
              const tx = (portalB.tx + 0.5) * TILE_SIZE;
              const ty = (portalB.ty + 1.4) * TILE_SIZE;
              const safe = typeof g.findSafeOverworldSpawn === 'function' ? g.findSafeOverworldSpawn(tx, ty) : { x: tx, y: ty };
              g.player.x = safe.x;
              g.player.y = safe.y;
              g.camera.x = g.player.x;
              g.camera.y = g.player.y;
              Abyssea.Audio.play('portal');
              this.closeModal();
            }
          }, tr('map.fastTravel')));
        }
        // RC2 (#5): Archipelago Teleport Beacon fast travel from Map Inspector!
        if (unlocked) {
          const beaconB = (g.buildings || []).find(b =>
            b.type === 'baliza_teletransporte' &&
            Math.floor(b.tx / PLOT_TILES) === sgx &&
            Math.floor(b.ty / PLOT_TILES) === sgy
          );
          if (beaconB) {
            card.appendChild(this.el('button', {
              class: 'btn btn-gold',
              style: 'margin-top:6px;border-color:#00e5ff;',
              onclick: () => {
                if (g.activeDungeon) {
                  g.toast('No puedes usar viaje rápido dentro de una mazmorra.', 'warn');
                  return;
                }
                const tx = (beaconB.tx + 0.5) * TILE_SIZE;
                const ty = (beaconB.ty + 1.4) * TILE_SIZE;
                const safe = typeof g.findSafeOverworldSpawn === 'function' ? g.findSafeOverworldSpawn(tx, ty) : { x: tx, y: ty };
                g.player.x = safe.x;
                g.player.y = safe.y;
                g.camera.x = g.player.x;
                g.camera.y = g.player.y;
                Abyssea.Audio.play('portal');
                g.spawnParticles(g.player.x, g.player.y, '#00e5ff', 22);
                g.toast(`Viaje rápido completado a Baliza en (${sgx}, ${sgy}).`, 'success');
                this.closeModal();
              }
            }, 'Viaje Rápido a Baliza Rúnica'));
          }
        }

        if (unlocked && g.omega) {
          const plotKey = `${sgx},${sgy}`;
          const isAscended = Boolean(g.omega.state.ascension && g.omega.state.ascension[plotKey]);
          if (isAscended) {
            card.appendChild(this.el('div', {
              style: 'background:linear-gradient(135deg, rgba(74,20,140,0.5), rgba(136,14,79,0.5));border:1.5px solid #e040fb;border-radius:6px;padding:8px 10px;font-size:13px;color:#f3e5f5;margin-top:6px;box-shadow:0 0 10px rgba(224,64,251,0.25);'
            }, [
              this.el('strong', { style: 'color:#ea80fc;display:block;' }, '[OMEGA] ISLA ASCENDIDA (PRESTIGIO OMEGA)'),
              this.el('div', {}, 'Enemigos: 10x HP / 10x Daño (Sueltan Materia Comprimida) · Extractores: 2x Velocidad')
            ]));
          } else if (g.clearedDungeons && g.clearedDungeons.length >= ((g.omega.UNLOCK_THRESHOLDS && g.omega.UNLOCK_THRESHOLDS.ascensionUnlockDungeons) || 55)) {
            card.appendChild(this.el('button', {
              class: 'btn btn-primary',
              style: 'margin-top:6px;background:linear-gradient(90deg, #4a148c, #7b1fa2);border:1px solid #e040fb;color:#fff;font-weight:bold;',
              onclick: () => {
                const res = g.omega.ascendIsland(g, plotKey);
                if (res.ok) {
                  Abyssea.Audio.play('levelup');
                  g.toast(`¡Isla (${sgx}, ${sgy}) ascendida a Rango Omega!`, 'success');
                  drawMapCanvas();
                  renderInspector();
                  this.updateHUD(true);
                } else {
                  Abyssea.Audio.play('error');
                  g.toast(res.reason, 'warn');
                }
              }
            }, 'Ascender Isla (Costo: 1x Singularidad + 50x Materia)'));
          }
        }
        card.appendChild(this.el('div', { style: 'margin-top:6px;font-size:14px;color:#8bb3d1;line-height:1.4;' }, tr('map.controlsHint')));
        if (this.showDungeonAtlas) {
          const atlasBox = this.el('div', { class: 'dungeon-atlas-list', style: 'margin-top:8px;' });
          const defs = Object.values(Abyssea.DUNGEON_DEFS || {});
          const gatesObj = Abyssea.DUNGEON_GATES || {};
          defs.forEach(dDef => {
            const gateEntry = Array.isArray(gatesObj) ? gatesObj.find(gt => gt.id === dDef.id) : gatesObj[dDef.id];
            const resolvedPlot = (g.world.dungeonGatePlots && g.world.dungeonGatePlots[dDef.id]) || (gateEntry && gateEntry.plot);
            const gx = resolvedPlot ? resolvedPlot[0] : (CENTER_PLOT !== undefined ? CENTER_PLOT : 9);
            const gy = resolvedPlot ? resolvedPlot[1] : (CENTER_PLOT !== undefined ? CENTER_PLOT : 9);
            const cleared = Array.isArray(g.clearedDungeons) && g.clearedDungeons.includes(dDef.id);
            const dmBiome = BIOMES[dDef.themeKey || dDef.biomeId] || BIOMES.pradera;
            atlasBox.appendChild(this.el('div', {
              class: 'dungeon-atlas-row',
              onclick: () => {
                this.selectedMapPlot = [gx, gy];
                focusMapPlot(gx, gy, Math.max(1.35, this.mapZoom));
                drawMapCanvas();
                renderInspector();
              }
            }, [
              this.el('div', {}, [
                this.el('strong', { style: `font-size:14px;color:${cleared ? '#86efac' : '#ffd54f'};display:block;` }, dDef.name),
                this.el('div', { style: 'font-size:14px;color:#b8d4ec;' }, `${dmBiome.name} · ${tr('common.levelShort')}${(gateEntry && gateEntry.recLevel) || dDef.recLevel || 2}+ · (${gx},${gy})`)
              ]),
              cleared ? this.uiIcon('iconCheck', 16) : this.el('span', { style: 'font-size:14px;color:#ffab91;' }, tr('map.goBtn'))
            ]));
          });
          card.appendChild(this.el('div', { style: 'margin-top:10px;font-size:14px;color:#ffd54f;font-weight:800;' }, tr('map.dungeonAtlasTitle', { cur: g.clearedDungeons.length, tot: defs.length })));
          card.appendChild(atlasBox);
        }
        inspectorSlot.appendChild(card);
      };

      const drawMapBuilding = (ctx, b, tilePx) => {
        const def = (Abyssea.BUILDINGS && Abyssea.BUILDINGS[b.type]) || { size: 1, name: b.type, sprite: 'building' };
        const bSize = def.size || 1;
        const bx = b.tx * tilePx;
        const by = b.ty * tilePx;
        const bw = bSize * tilePx;
        const bh = bSize * tilePx;
        const cx = bx + bw / 2;
        const cy = by + bh / 2;

        // 1. Soft drop shadow on the ground
        ctx.fillStyle = 'rgba(0, 0, 0, 0.40)';
        ctx.beginPath();
        ctx.ellipse(cx, by + bh - 1.2, bw * 0.46, bh * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Check if a preloaded image sprite exists
        const assets = Abyssea.Assets;
        const bImg = assets && assets.getBuildingImg && assets.getBuildingImg(def.sprite);
        if (bImg && bImg.complete && bImg.naturalWidth > 0 && !(bImg.naturalWidth > 200 && bImg.naturalHeight <= 64)) {
          const fw = bImg.width >= bImg.height * 2.5 ? bImg.height : bImg.width;
          const aspect = fw / Math.max(1, bImg.height);
          const sW = bw * (def.visualScale || 1.15);
          const sH = sW / aspect;
          ctx.save();
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(bImg, 0, 0, fw, bImg.height, cx - sW / 2, cy - sH / 2, sW, sH);
          ctx.restore();
        } else {
          // 3. Minecraft-style high-detail architectural isometric miniature
          const type = b.type;
          if (type === 'portal') {
            const grad = ctx.createRadialGradient(cx, cy, 1, cx, cy, bw * 0.48);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.35, '#00e5ff');
            grad.addColorStop(0.75, '#7c4dff');
            grad.addColorStop(1, '#1a0033');
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(cx, cy, bw * 0.45, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.strokeStyle = '#263238'; ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.arc(cx, cy, bw * 0.52, 0, Math.PI * 2); ctx.stroke();
          } else if (type === 'fogata') {
            ctx.fillStyle = '#424242';
            ctx.beginPath(); ctx.arc(cx, cy, bw * 0.38, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ff6d00';
            ctx.beginPath(); ctx.arc(cx, cy - 1, bw * 0.25, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffd54f';
            ctx.beginPath(); ctx.arc(cx, cy - 2, bw * 0.14, 0, Math.PI * 2); ctx.fill();
          } else if (type === 'horno') {
            ctx.fillStyle = '#455a64';
            ctx.fillRect(bx + 1, by + 1, bw - 2, bh - 2);
            ctx.fillStyle = '#37474f';
            ctx.fillRect(bx + 1, by + bh - 2.5, bw - 2, 1.8);
            ctx.fillStyle = '#1c2529';
            ctx.fillRect(bx + 2.5, by + 3, bw - 5, bh - 4.5);
            ctx.fillStyle = '#ff6f00';
            ctx.fillRect(bx + 3.2, by + 4, bw - 6.4, bh - 6);
            ctx.fillStyle = '#ffe082';
            ctx.fillRect(bx + 4, by + 4.8, bw - 8, bh - 7.5);
          } else if (type === 'forja') {
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(bx + 2, by + bh * 0.45, bw - 4, bh * 0.5);
            ctx.fillStyle = '#263238';
            ctx.fillRect(bx + 1, by + 1.5, bw - 2, bh * 0.45);
            ctx.fillStyle = '#78909c';
            ctx.fillRect(bx + 1.5, by + 1.5, bw - 3, 1.8);
            ctx.fillStyle = '#ff5722';
            ctx.fillRect(cx - 1.5, by + 1, 3, 1.8);
          } else if (type === 'aserradero') {
            ctx.fillStyle = '#6d4c41';
            ctx.fillRect(bx + 1, by + 3, bw - 2, bh - 4);
            ctx.fillStyle = '#8d6e63';
            ctx.fillRect(bx + 2, by + 1.5, bw - 4, 2.5);
            ctx.fillStyle = '#cfd8dc';
            ctx.beginPath(); ctx.arc(cx, cy, bw * 0.35, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#37474f'; ctx.lineWidth = 1; ctx.stroke();
            ctx.fillStyle = '#263238'; ctx.beginPath(); ctx.arc(cx, cy, 1.2, 0, Math.PI * 2); ctx.fill();
          } else if (type === 'molino') {
            ctx.fillStyle = '#cfd8dc';
            ctx.beginPath(); ctx.arc(cx, cy, bw * 0.38, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#8d6e63';
            ctx.beginPath(); ctx.arc(cx, cy, bw * 0.22, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#fff8e1'; ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(cx - bw * 0.42, cy - bh * 0.42); ctx.lineTo(cx + bw * 0.42, cy + bh * 0.42);
            ctx.moveTo(cx + bw * 0.42, cy - bh * 0.42); ctx.lineTo(cx - bw * 0.42, cy + bh * 0.42);
            ctx.stroke();
            ctx.fillStyle = '#d32f2f'; ctx.beginPath(); ctx.arc(cx, cy, 1.8, 0, Math.PI * 2); ctx.fill();
          } else if (type === 'huerto' || type === 'plantacion' || type === 'granja') {
            ctx.fillStyle = '#3e2723';
            ctx.fillRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
            ctx.fillStyle = '#4caf50';
            ctx.fillRect(bx + 1.8, by + 2, bw - 3.6, 1.8);
            ctx.fillRect(bx + 1.8, by + bh * 0.45, bw - 3.6, 1.8);
            ctx.fillRect(bx + 1.8, by + bh - 3.8, bw - 3.6, 1.8);
            ctx.fillStyle = '#81c784';
            ctx.fillRect(bx + 2.5, by + 1.5, 2, 2);
            ctx.fillRect(cx - 1, by + bh * 0.45 - 0.5, 2, 2);
            ctx.fillRect(bx + bw - 4.5, by + bh - 4.2, 2, 2);
            ctx.fillStyle = '#8d6e63';
            ctx.fillRect(bx, by, 1.8, 1.8); ctx.fillRect(bx + bw - 1.8, by, 1.8, 1.8);
            ctx.fillRect(bx, by + bh - 1.8, 1.8, 1.8); ctx.fillRect(bx + bw - 1.8, by + bh - 1.8, 1.8, 1.8);
          } else if (type === 'corral') {
            ctx.fillStyle = '#fff59d';
            ctx.fillRect(bx + 2, by + 2, bw - 4, bh - 4);
            ctx.strokeStyle = '#8d6e63'; ctx.lineWidth = 1.8;
            ctx.strokeRect(bx + 1, by + 1, bw - 2, bh - 2);
          } else if (type === 'alquimia' || type === 'laboratorio') {
            ctx.fillStyle = '#37474f';
            ctx.fillRect(bx + 1.5, by + bh * 0.5, bw - 3, bh * 0.45);
            ctx.fillStyle = '#ba68c8';
            ctx.beginPath(); ctx.arc(cx, cy - 1, bw * 0.32, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#e1bee7';
            ctx.beginPath(); ctx.arc(cx - 1, cy - 2, bw * 0.12, 0, Math.PI * 2); ctx.fill();
          } else if (type === 'cocina') {
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(bx + 1, by + 1, bw - 2, bh - 2);
            ctx.fillStyle = '#d84315';
            ctx.beginPath(); ctx.arc(cx, cy, bw * 0.28, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffd54f';
            ctx.fillRect(cx - 1, cy - 1, 2, 2);
          } else if (type === 'mercado' || type === 'casa_comercio') {
            ctx.fillStyle = '#8d6e63';
            ctx.fillRect(bx + 1, by + bh * 0.5, bw - 2, bh * 0.45);
            const stW = bw / 4;
            ctx.fillStyle = '#d32f2f'; ctx.fillRect(bx, by, stW, bh * 0.55);
            ctx.fillStyle = '#ffffff'; ctx.fillRect(bx + stW, by, stW, bh * 0.55);
            ctx.fillStyle = '#d32f2f'; ctx.fillRect(bx + stW * 2, by, stW, bh * 0.55);
            ctx.fillStyle = '#ffffff'; ctx.fillRect(bx + stW * 3, by, stW, bh * 0.55);
          } else if (type === 'banco' || type === 'tesoreria') {
            ctx.fillStyle = '#37474f';
            ctx.fillRect(bx + 1, by + 1, bw - 2, bh - 2);
            ctx.strokeStyle = '#ffd54f'; ctx.lineWidth = 1.2;
            ctx.strokeRect(bx + 2, by + 2, bw - 4, bh - 4);
            ctx.fillStyle = '#ffd54f';
            ctx.beginPath(); ctx.arc(cx, cy, 2, 0, Math.PI * 2); ctx.fill();
          } else if (type === 'torre_magica' || type === 'monumento' || type === 'altar') {
            ctx.fillStyle = '#263238';
            ctx.fillRect(bx + 2, by + bh * 0.35, bw - 4, bh * 0.6);
            ctx.fillStyle = '#00e5ff';
            ctx.beginPath();
            ctx.moveTo(cx, by);
            ctx.lineTo(cx + bw * 0.28, by + bh * 0.38);
            ctx.lineTo(cx, by + bh * 0.48);
            ctx.lineTo(cx - bw * 0.28, by + bh * 0.38);
            ctx.closePath();
            ctx.fill();
          } else if (type === 'estanque') {
            ctx.fillStyle = '#546e7a';
            ctx.fillRect(bx + 1, by + 1, bw - 2, bh - 2);
            ctx.fillStyle = '#0288d1';
            ctx.fillRect(bx + 2, by + 2, bw - 4, bh - 4);
            ctx.fillStyle = '#81c784';
            ctx.beginPath(); ctx.arc(cx, cy, 1.8, 0, Math.PI * 2); ctx.fill();
          } else {
            ctx.fillStyle = '#8d6e63';
            ctx.fillRect(bx + 1, by + bh * 0.4, bw - 2, bh * 0.55);
            ctx.fillStyle = '#a0522d';
            ctx.beginPath();
            ctx.moveTo(bx, by + bh * 0.45);
            ctx.lineTo(cx, by + 0.5);
            ctx.lineTo(bx + bw, by + bh * 0.45);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#ffe082';
            ctx.fillRect(cx - 1.2, by + bh * 0.55, 2.4, 2.4);
          }
        }

        // 4. Level & Activity Badge
        if (b.level > 1) {
          ctx.fillStyle = 'rgba(12, 16, 28, 0.90)';
          ctx.fillRect(bx + bw - 9, by, 9, 7);
          ctx.fillStyle = '#ffd54f';
          ctx.font = '7px AbysseaPixel, monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`${b.level}`, bx + bw - 4.5, by + 6);
        }
        if (b.fuel > 0 || (b.timer && b.timer > 0)) {
          ctx.fillStyle = '#4ade80';
          ctx.beginPath(); ctx.arc(bx + 2, by + 2, 1.2, 0, Math.PI * 2); ctx.fill();
        }
      };

      // Offscreen high-res static world-map layer cache (3648x3648 = exact 16x16 px/tile -> crisp up to 280% zoom!)
      let mapStaticCanvas = null;
      let mapStaticKey = '';
      let mapAdjPlotsCache = [];
      let mapPinsCache = [];
      let cachedOceanGrad = null;
      let cachedOceanW = 0;
      let cachedOceanH = 0;

      const rebuildMapStaticLayer = () => {
        const sTile = STATIC_TILE_PX;
        if (!mapStaticCanvas) {
          mapStaticCanvas = document.createElement('canvas');
          mapStaticCanvas.width = STATIC_WORLD_SZ;
          mapStaticCanvas.height = STATIC_WORLD_SZ;
        }
        const sctx = mapStaticCanvas.getContext('2d');
        sctx.imageSmoothingEnabled = true;
        sctx.imageSmoothingQuality = 'high';
        sctx.clearRect(0, 0, STATIC_WORLD_SZ, STATIC_WORLD_SZ);

        const terraformedSet = new Set();
        const tfList = g.world.terraformedTiles || [];
        for (let i = 0; i < tfList.length; i++) {
          const p = tfList[i];
          terraformedSet.add((p[0] & 0xfff) | ((p[1] & 0xfff) << 12));
        }

        const maxTiles = (typeof WORLD_TILES !== 'undefined' ? WORLD_TILES : GRID_PLOTS * PLOT_TILES);
        const cliffColors = {
          pradera:            { top: '#5d4037', mid: '#4e342e', shadow: 'rgba(10,30,45,0.42)' },
          desierto:           { top: '#8d6e3f', mid: '#6d4c23', shadow: 'rgba(10,30,45,0.42)' },
          bosque_oscuro:      { top: '#4a3f5c', mid: '#2f243d', shadow: 'rgba(8,12,24,0.46)' },
          montanas_heladas:   { top: '#607d8b', mid: '#37474f', shadow: 'rgba(10,25,40,0.48)' },
          tierras_volcanicas: { top: '#5c261f', mid: '#33120e', shadow: 'rgba(8,6,12,0.52)' },
          archipielago_coral: { top: '#8a4c56', mid: '#5f2d38', shadow: 'rgba(10,30,48,0.44)' },
          cavernas_cristal:   { top: '#43386b', mid: '#281f48', shadow: 'rgba(8,10,28,0.48)' },
          selva_esmeralda:    { top: '#3c562c', mid: '#26381c', shadow: 'rgba(8,22,26,0.46)' },
          caldera_ceniza:     { top: '#4c2620', mid: '#2a1310', shadow: 'rgba(8,6,10,0.52)' },
          dinastia_arena:     { top: '#7f5b28', mid: '#593d18', shadow: 'rgba(10,24,38,0.44)' },
          glaciar_profundo:   { top: '#3f6a86', mid: '#24465e', shadow: 'rgba(6,20,38,0.48)' },
          cienaga_putrida:    { top: '#384b2c', mid: '#212e1a', shadow: 'rgba(6,16,20,0.48)' },
          necropolis_osea:    { top: '#434354', mid: '#282834', shadow: 'rgba(6,8,18,0.50)' },
          tierras_malditas:   { top: '#542038', mid: '#331022', shadow: 'rgba(8,4,14,0.52)' }
        };
        const getMapVisualBiome = (tx, ty, fallbackBiome) => (
          g.world.getVisualBiomeAtTile ? g.world.getVisualBiomeAtTile(tx, ty) : fallbackBiome
        );
        const isLand = (x, y) => {
          if (x < 0 || y < 0 || x >= maxTiles || y >= maxTiles) return false;
          const pX = Math.floor(x / PLOT_TILES);
          const pY = Math.floor(y / PLOT_TILES);
          if (!g.world.isPlotUnlocked(pX, pY)) return false;
          const tVal = g.world.tiles[y]?.[x];
          return tVal === 1 || tVal === 2 || tVal === 3 || tVal === 4;
        };

        // Single O(N) pre-pass bucketing nodes by plot (eliminates O(361 * N) = 1.8M loop!)
        const plotCount = GRID_PLOTS * GRID_PLOTS;
        const nodesByPlot = new Array(plotCount);
        const gateNodeByPlot = new Map();
        const gateNodeById = new Map();
        const secretNodeByPlot = new Map();
        const altarNodeByPlot = new Map();
        const eeNodeByPlot = new Map();
        const npcNodeById = new Map();
        if (Array.isArray(g.world.nodes)) {
          for (let ni = 0; ni < g.world.nodes.length; ni++) {
            const n = g.world.nodes[ni];
            if (!n) continue;
            const pgx = Math.floor(n.tx / PLOT_TILES);
            const pgy = Math.floor(n.ty / PLOT_TILES);
            if (pgx < 0 || pgy < 0 || pgx >= GRID_PLOTS || pgy >= GRID_PLOTS) continue;
            const pidx = pgy * GRID_PLOTS + pgx;
            if (n.kind === 'dungeon_gate') {
              gateNodeByPlot.set(pidx, n);
              if (n.dungeonId) gateNodeById.set(n.dungeonId, n);
            } else if (n.kind === 'secret_chest') {
              secretNodeByPlot.set(pidx, n);
            } else if (n.kind === 'altar_shrine') {
              altarNodeByPlot.set(pidx, n);
            } else if (n.kind === 'easter_egg') {
              eeNodeByPlot.set(pidx, n);
            } else if (n.kind === 'npc') {
              if (n.npcId) npcNodeById.set(n.npcId, n);
            } else {
              let bucket = nodesByPlot[pidx];
              if (!bucket) { bucket = []; nodesByPlot[pidx] = bucket; }
              bucket.push(n);
            }
          }
        }
        const npcByPlot = new Map();
        for (let i = 0; i < Abyssea.NPCS.length; i++) {
          const npc = Abyssea.NPCS[i];
          const p = g.world.getNpcPlot(npc);
          if (p) npcByPlot.set(p[1] * GRID_PLOTS + p[0], npc);
        }

        const bridgeHImg = (Abyssea.Assets && Abyssea.Assets.extraImages && Abyssea.Assets.extraImages.bridge_h_mid)
          || (Abyssea.Assets && Abyssea.Assets.get && Abyssea.Assets.get('bridge_h_mid'));
        const bridgeVImg = (Abyssea.Assets && Abyssea.Assets.extraImages && Abyssea.Assets.extraImages.bridge_v_mid)
          || (Abyssea.Assets && Abyssea.Assets.get && Abyssea.Assets.get('bridge_v_mid'));
        const bridgeHReady = !!(bridgeHImg && bridgeHImg.complete && bridgeHImg.naturalWidth > 0);
        const bridgeVReady = !!(bridgeVImg && bridgeVImg.complete && bridgeVImg.naturalWidth > 0);
        const soilImg = Abyssea.Assets && Abyssea.Assets.extraImages && Abyssea.Assets.extraImages.tilled_soil;
        const soilReady = !!(soilImg && soilImg.complete && soilImg.naturalWidth > 0);
        const clearedSet = new Set(g.clearedDungeons || []);
        mapAdjPlotsCache = [];
        mapPinsCache = [];
        const logicalPlotPx = MAP_WORLD_SZ / GRID_PLOTS;
        const logicalTilePx = logicalPlotPx / PLOT_TILES;

        // Pass 1: Continuous shallow coastal water glow & surf rim hugging unlocked land across plot borders
        for (let gy = 0; gy < GRID_PLOTS; gy++) {
          for (let gx = 0; gx < GRID_PLOTS; gx++) {
            const unlocked = g.world.isPlotUnlocked(gx, gy);
            const checkCoast = unlocked ||
              g.world.isPlotUnlocked(gx - 1, gy) || g.world.isPlotUnlocked(gx + 1, gy) ||
              g.world.isPlotUnlocked(gx, gy - 1) || g.world.isPlotUnlocked(gx, gy + 1);
            if (!checkCoast) continue;
            for (let ly = 0; ly < PLOT_TILES; ly++) {
              for (let lx = 0; lx < PLOT_TILES; lx++) {
                const tx = gx * PLOT_TILES + lx;
                const ty = gy * PLOT_TILES + ly;
                if (isLand(tx, ty)) continue;
                const adjN = isLand(tx, ty - 1);
                const adjS = isLand(tx, ty + 1);
                const adjW = isLand(tx - 1, ty);
                const adjE = isLand(tx + 1, ty);
                if (adjN || adjS || adjW || adjE) {
                  const rx = tx * sTile;
                  const ry = ty * sTile;
                  sctx.fillStyle = 'rgba(120, 212, 240, 0.20)';
                  sctx.fillRect(rx, ry, sTile, sTile);
                  if (adjN) {
                    sctx.fillStyle = 'rgba(220, 248, 255, 0.50)';
                    sctx.fillRect(rx, ry, sTile, 3);
                  }
                }
              }
            }
          }
        }

        for (let gy = 0; gy < GRID_PLOTS; gy++) {
          for (let gx = 0; gx < GRID_PLOTS; gx++) {
            const unlocked = g.world.isPlotUnlocked(gx, gy);
            const biomeId = g.world.plotBiomes[gy][gx];
            const biome = BIOMES[biomeId];
            const px0 = gx * logicalPlotPx;
            const py0 = gy * logicalPlotPx;
            const pidx = gy * GRID_PLOTS + gx;

            if (unlocked) {
              const bColor = biome?.color || '#5c9e31';
              for (let ly = 0; ly < PLOT_TILES; ly++) {
                for (let lx = 0; lx < PLOT_TILES; lx++) {
                  const tx = gx * PLOT_TILES + lx;
                  const ty = gy * PLOT_TILES + ly;
                  const t = g.world.tiles[ty]?.[tx] ?? 0;
                  if (t === 0) continue;
                  const rx = tx * sTile;
                  const ry = ty * sTile;

                  if (t === 3) {
                    const isBrV = (g.world.tiles[ty - 1]?.[tx] === 3 || g.world.tiles[ty + 1]?.[tx] === 3) &&
                                  !(g.world.tiles[ty]?.[tx - 1] === 3 || g.world.tiles[ty]?.[tx + 1] === 3);
                    if (isBrV && bridgeVReady) {
                      sctx.drawImage(bridgeVImg, 0, 0, bridgeVImg.width, bridgeVImg.height, rx, ry, sTile, sTile);
                    } else if (!isBrV && bridgeHReady) {
                      sctx.drawImage(bridgeHImg, 0, 0, bridgeHImg.width, bridgeHImg.height, rx, ry, sTile, sTile);
                    } else {
                      sctx.fillStyle = '#8d5524';
                      sctx.fillRect(rx, ry, sTile, sTile);
                      sctx.fillStyle = '#b46e3c';
                      sctx.fillRect(rx + 1, ry + 1, sTile - 2, sTile - 2);
                    }
                  } else if (t === 4) {
                    sctx.fillStyle = '#3b2421';
                    sctx.fillRect(rx, ry, sTile, sTile);
                    sctx.fillStyle = '#180a0c';
                    sctx.fillRect(rx + 1, ry + 1, sTile - 2, sTile - 2);
                    sctx.fillStyle = '#c62828';
                    sctx.fillRect(rx + 2, ry + 3, sTile - 4, sTile - 5);
                    sctx.fillStyle = '#ff8f00';
                    sctx.fillRect(rx + 4, ry + 5, sTile - 8, sTile - 9);
                  } else {
                    const tBiome = getMapVisualBiome(tx, ty, biomeId);
                    const tSheet = Abyssea.Assets && Abyssea.Assets.biomeTiles && Abyssea.Assets.biomeTiles[tBiome];
                    const tcPal = cliffColors[tBiome] || cliffColors.pradera;
                    const tbColor = (BIOMES[tBiome] && BIOMES[tBiome].color) || bColor;
                    const up = isLand(tx, ty - 1);
                    const dn = isLand(tx, ty + 1);
                    const lt = isLand(tx - 1, ty);
                    const rt = isLand(tx + 1, ty);

                    if (!dn) {
                      sctx.fillStyle = tcPal.mid;
                      sctx.fillRect(rx, ry + sTile - 2, sTile, 5);
                      sctx.fillStyle = tcPal.shadow;
                      sctx.fillRect(rx, ry + sTile + 3, sTile, 3);
                    }

                    if (tSheet && tSheet.width > 0 && tSheet.height > 0) {
                      const bts = Math.round(tSheet.width / 3) || 64;
                      const tsx = !lt ? 0 : !rt ? bts * 2 : bts;
                      const tsy = !up ? 0 : !dn ? bts * 2 : bts;
                      sctx.drawImage(tSheet, tsx, tsy, bts, bts, rx, ry, sTile, sTile);
                    } else {
                      sctx.fillStyle = tbColor;
                      sctx.fillRect(rx, ry, sTile, sTile);
                    }

                    if (t === 2) {
                      if (soilReady) {
                        sctx.drawImage(soilImg, rx, ry, sTile, sTile);
                      } else {
                        sctx.fillStyle = '#4e342e';
                        sctx.fillRect(rx + 2, ry + 2, sTile - 4, sTile - 4);
                        sctx.fillStyle = '#3e2723';
                        sctx.fillRect(rx + 2, ry + Math.round(sTile * 0.35), sTile - 4, 2);
                        sctx.fillRect(rx + 2, ry + Math.round(sTile * 0.70), sTile - 4, 2);
                      }
                    }

                    if (t === 1 && terraformedSet.has((tx & 0xfff) | ((ty & 0xfff) << 12))) {
                      sctx.fillStyle = 'rgba(96, 125, 139, 0.72)';
                      sctx.fillRect(rx + 1, ry + 1, sTile - 2, sTile - 2);
                      sctx.fillStyle = '#455a64';
                      sctx.fillRect(rx + 2, ry + 2, 6, 6);
                      sctx.fillRect(rx + 8, ry + 8, 6, 6);
                    }
                  }
                }
              }

              // Detailed miniature pixel flora & resource nodes at 16px/tile resolution
              const bucket = nodesByPlot[pidx];
              if (bucket) {
                for (let ni = 0; ni < bucket.length; ni++) {
                  const n = bucket[ni];
                  const nx = (n.tx + 0.5) * sTile;
                  const ny = (n.ty + 0.5) * sTile;
                  const k = n.kind || '';

                  if (k.includes('tree')) {
                    sctx.fillStyle = 'rgba(0, 0, 0, 0.34)';
                    sctx.beginPath(); sctx.ellipse(nx, ny + 5.5, 6.2, 2.8, 0, 0, Math.PI * 2); sctx.fill();
                    sctx.fillStyle = '#5d4037';
                    sctx.fillRect(nx - 1.8, ny + 1.5, 3.6, 4.5);

                    if (k.includes('pine')) {
                      sctx.fillStyle = '#14421b';
                      sctx.beginPath();
                      sctx.moveTo(nx, ny - 8.5); sctx.lineTo(nx + 6.2, ny + 2.5); sctx.lineTo(nx - 6.2, ny + 2.5);
                      sctx.closePath(); sctx.fill();
                      sctx.fillStyle = '#2e7d32';
                      sctx.beginPath();
                      sctx.moveTo(nx, ny - 8.5); sctx.lineTo(nx + 4.4, ny - 1); sctx.lineTo(nx - 4.4, ny - 1);
                      sctx.closePath(); sctx.fill();
                    } else if (k.includes('palm')) {
                      sctx.fillStyle = '#388e3c';
                      sctx.beginPath(); sctx.arc(nx, ny - 3, 6.2, 0, Math.PI * 2); sctx.fill();
                      sctx.fillStyle = '#81c784';
                      sctx.fillRect(nx - 2, ny - 5.5, 4, 4);
                    } else {
                      sctx.fillStyle = '#1b5e20';
                      sctx.beginPath(); sctx.arc(nx, ny - 1.2, 6.8, 0, Math.PI * 2); sctx.fill();
                      sctx.fillStyle = '#2e7d32';
                      sctx.beginPath(); sctx.arc(nx - 0.8, ny - 2.2, 5.2, 0, Math.PI * 2); sctx.fill();
                      sctx.fillStyle = '#66bb6a';
                      sctx.beginPath(); sctx.arc(nx - 1.6, ny - 3.4, 3.0, 0, Math.PI * 2); sctx.fill();
                      if (k.includes('apple')) {
                        sctx.fillStyle = '#ef5350';
                        sctx.fillRect(nx + 2, ny - 1, 2.2, 2.2); sctx.fillRect(nx - 3, ny - 4.2, 2.2, 2.2);
                      } else if (k.includes('orange')) {
                        sctx.fillStyle = '#ffa726';
                        sctx.fillRect(nx + 2, ny - 1, 2.2, 2.2); sctx.fillRect(nx - 3, ny - 4.2, 2.2, 2.2);
                      }
                    }
                  } else if (k.includes('rock') || k.includes('vein') || k.includes('node')) {
                    sctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
                    sctx.beginPath(); sctx.ellipse(nx, ny + 3.4, 5.6, 2.4, 0, 0, Math.PI * 2); sctx.fill();
                    sctx.fillStyle = '#37474f';
                    sctx.beginPath(); sctx.arc(nx, ny, 5.2, 0, Math.PI * 2); sctx.fill();
                    sctx.fillStyle = '#78909c';
                    sctx.beginPath(); sctx.arc(nx - 1.1, ny - 1.1, 3.4, 0, Math.PI * 2); sctx.fill();
                    if (k.includes('gold')) {
                      sctx.fillStyle = '#ffd54f';
                      sctx.fillRect(nx - 2, ny - 2.2, 2.8, 2.8); sctx.fillRect(nx + 1.4, ny + 0.4, 2.2, 2.2);
                    } else if (k.includes('gem') || k.includes('crystal') || k.includes('diamond') || k.includes('emerald')) {
                      sctx.fillStyle = '#00e5ff';
                      sctx.fillRect(nx - 1.6, ny - 2.2, 3.0, 3.0);
                      sctx.fillStyle = '#e040fb';
                      sctx.fillRect(nx + 1.2, ny + 0.4, 2.2, 2.2);
                    } else if (k.includes('iron')) {
                      sctx.fillStyle = '#cfd8dc';
                      sctx.fillRect(nx - 1.6, ny - 1.8, 2.8, 2.8);
                    } else if (k.includes('coal')) {
                      sctx.fillStyle = '#212121';
                      sctx.fillRect(nx - 1.6, ny - 1.8, 2.8, 2.8);
                    }
                  } else if (k === 'berry_bush' || k === 'bush') {
                    sctx.fillStyle = '#2e7d32';
                    sctx.beginPath(); sctx.arc(nx, ny, 4.6, 0, Math.PI * 2); sctx.fill();
                    sctx.fillStyle = '#e91e63';
                    sctx.fillRect(nx - 2, ny - 2, 2.2, 2.2);
                    sctx.fillRect(nx + 1.4, ny - 1, 2.2, 2.2);
                    sctx.fillRect(nx - 0.4, ny + 1.4, 2.2, 2.2);
                  } else if (k.includes('wheat')) {
                    sctx.fillStyle = '#ffd54f';
                    sctx.fillRect(nx - 2.4, ny - 4, 1.6, 6.5); sctx.fillRect(nx + 0.8, ny - 4.8, 1.6, 7.2);
                    sctx.fillStyle = '#f57f17';
                    sctx.fillRect(nx - 2.4, ny - 4.8, 1.8, 2.2); sctx.fillRect(nx + 0.8, ny - 5.6, 1.8, 2.2);
                  } else if (k.includes('carrot')) {
                    sctx.fillStyle = '#4caf50';
                    sctx.fillRect(nx - 2, ny - 4, 4, 2.8);
                    sctx.fillStyle = '#ff9800';
                    sctx.fillRect(nx - 1, ny - 1, 2.4, 4);
                  } else if (k === 'flower') {
                    sctx.fillStyle = '#ff4081';
                    sctx.beginPath(); sctx.arc(nx, ny, 2.8, 0, Math.PI * 2); sctx.fill();
                    sctx.fillStyle = '#ffe082';
                    sctx.fillRect(nx - 1, ny - 1, 2, 2);
                  }
                }
              }
            } else {
              const adj = (g.economy && typeof g.economy.isPlotAdjacentlyReachable === 'function')
                ? g.economy.isPlotAdjacentlyReachable(g, gx, gy)
                : false;
              if (adj) mapAdjPlotsCache.push([gx, gy]);
              const lockColor = (BIOMES[biomeId] && BIOMES[biomeId].color) || '#4c8f40';
              const lockCliff = cliffColors[biomeId] || cliffColors.pradera;
              sctx.save();
              sctx.globalAlpha = adj ? 0.50 : 0.28;
              for (let ly = 0; ly < PLOT_TILES; ly++) {
                for (let lx = 0; lx < PLOT_TILES; lx++) {
                  const tx = gx * PLOT_TILES + lx;
                  const ty = gy * PLOT_TILES + ly;
                  const t = g.world.tiles[ty]?.[tx] ?? 0;
                  if (t === 0) continue;
                  const rx = tx * sTile;
                  const ry = ty * sTile;
                  const belowT = g.world.tiles[ty + 1]?.[tx] ?? 0;
                  if (belowT === 0) {
                    sctx.fillStyle = lockCliff.mid;
                    sctx.fillRect(rx, ry + sTile, sTile, 4);
                  }
                  sctx.fillStyle = t === 4 ? '#8e240c' : lockColor;
                  sctx.fillRect(rx, ry, sTile, sTile);
                }
              }
              sctx.restore();
            }

            // Collect crisp map pins in logical world coords -> rendered at full native HiDPI resolution in drawMapCanvas()!
            const gate = g.world.getDungeonGateForPlot(gx, gy);
            if (gate) {
              const cleared = clearedSet.has(gate.id);
              if (unlocked) {
                const gNode = gateNodeByPlot.get(pidx) || gateNodeById.get(gate.id);
                if (gNode) {
                  mapPinsCache.push({ wx: (gNode.tx + 0.5) * logicalTilePx, wy: (gNode.ty + 0.5) * logicalTilePx, kind: cleared ? 'dungeon_cleared' : 'dungeon', r: 9.2, z: 3 });
                }
              } else {
                mapPinsCache.push({ wx: px0 + logicalPlotPx - 10, wy: py0 + 10, kind: cleared ? 'dungeon_cleared' : 'dungeon', r: 7.5, z: 2 });
              }
            }

            const hasSecret = unlocked && g.world.secretChestPlots && g.world.secretChestPlots[`${gx},${gy}`] !== undefined;
            if (hasSecret) {
              const sNode = secretNodeByPlot.get(pidx);
              const sDone = sNode && sNode.opened;
              const sUnlocked = sNode && !sNode.puzzleLocked;
              mapPinsCache.push({
                wx: sNode ? (sNode.tx + 0.5) * logicalTilePx : px0 + logicalPlotPx / 2,
                wy: sNode ? (sNode.ty + 0.5) * logicalTilePx : py0 + 10,
                kind: sDone ? 'secret_done' : 'secret',
                r: 8.4,
                z: 2,
                opts: { locked: !sUnlocked }
              });
            }

            const altarId = unlocked && g.world.altarPlots && g.world.altarPlots[`${gx},${gy}`];
            if (altarId) {
              const aNode = altarNodeByPlot.get(pidx);
              mapPinsCache.push({
                wx: aNode ? (aNode.tx + 0.5) * logicalTilePx : px0 + 10,
                wy: aNode ? (aNode.ty + 0.5) * logicalTilePx : py0 + logicalPlotPx - 10,
                kind: 'altar',
                r: 8.6,
                z: 2
              });
            }

            const eeId = unlocked && g.world.easterEggPlots && g.world.easterEggPlots[`${gx},${gy}`];
            if (eeId) {
              const eeNode = eeNodeByPlot.get(pidx);
              mapPinsCache.push({
                wx: eeNode ? (eeNode.tx + 0.5) * logicalTilePx : px0 + logicalPlotPx - 10,
                wy: eeNode ? (eeNode.ty + 0.5) * logicalTilePx : py0 + logicalPlotPx - 10,
                kind: 'secret',
                r: 8.2,
                z: 2
              });
            }

            const npc = npcByPlot.get(pidx);
            if (npc && unlocked) {
              const nNode = npcNodeById.get(npc.id);
              mapPinsCache.push({
                wx: nNode ? (nNode.tx + 0.5) * logicalTilePx : px0 + 12,
                wy: nNode ? (nNode.ty + 0.5) * logicalTilePx : py0 + 12,
                kind: 'npc',
                r: 10.6,
                z: 4,
                opts: { url: Abyssea.NPC_PORTRAIT_URLS && Abyssea.NPC_PORTRAIT_URLS[npc.id] }
              });
            }
          }
        }

        if (Array.isArray(g.buildings)) {
          for (let bi = 0; bi < g.buildings.length; bi++) {
            const bld = g.buildings[bi];
            drawMapBuilding(sctx, bld, sTile);
            if (bld && (bld.type === 'portal' || bld.type === 'baliza_teletransporte')) {
              mapPinsCache.push({
                wx: (bld.tx + 0.5) * logicalTilePx,
                wy: (bld.ty + 0.5) * logicalTilePx,
                kind: 'portal',
                r: 8.2,
                z: 2
              });
            }
          }
        }
        mapPinsCache.sort((a, b) => (a.z || 0) - (b.z || 0));
      };

      const drawMapCanvas = () => {
        const metrics = getMapCssSizeAndDpr();
        const cw = metrics.w;
        const ch = metrics.h;
        const dpr = metrics.dpr;
        const targetPW = Math.round(cw * dpr);
        const targetPH = Math.round(ch * dpr);
        if (mapCanvas.width !== targetPW || mapCanvas.height !== targetPH) {
          mapCanvas.width = targetPW;
          mapCanvas.height = targetPH;
        }
        mapCanvas._cssW = cw;
        mapCanvas._cssH = ch;
        mapCanvas._dpr = dpr;

        const ctx = mapCanvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        const plotPx = MAP_WORLD_SZ / GRID_PLOTS;
        const tilePx = plotPx / PLOT_TILES;

        if (!cachedOceanGrad || cachedOceanW !== cw || cachedOceanH !== ch) {
          cachedOceanGrad = ctx.createRadialGradient(cw * 0.45, ch * 0.45, 40, cw * 0.5, ch * 0.5, Math.max(cw, ch) * 0.72);
          cachedOceanGrad.addColorStop(0, '#19577a');
          cachedOceanGrad.addColorStop(0.6, '#103b57');
          cachedOceanGrad.addColorStop(1, '#081b2c');
          cachedOceanW = cw;
          cachedOceanH = ch;
        }
        ctx.fillStyle = cachedOceanGrad;
        ctx.fillRect(0, 0, cw, ch);

        zoomReadout.textContent = `${Math.round(this.mapZoom * 100)}%`;

        const nextStaticKey = `${g.unlockedPlots.length}|${g.buildings.length}|${g.world.nodes.length}|${(g.world.terraformedTiles || []).length}|${(g.clearedDungeons || []).length}|${mapImgLoadGen}`;
        if (!mapStaticCanvas || mapStaticKey !== nextStaticKey) {
          rebuildMapStaticLayer();
          mapStaticKey = nextStaticKey;
        }

        ctx.save();
        ctx.translate(this.mapPanX, this.mapPanY);
        ctx.scale(this.mapZoom, this.mapZoom);

        // Blit 3648x3648 high-res archipelago terrain, cliffs, bridges, trees & buildings smoothly into logical space
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(mapStaticCanvas, 0, 0, STATIC_WORLD_SZ, STATIC_WORLD_SZ, 0, 0, MAP_WORLD_SZ, MAP_WORLD_SZ);

        // Crisp zoom-invariant border on Center Island
        const cPlot = (CENTER_PLOT !== undefined ? CENTER_PLOT : 9);
        if (g.world.isPlotUnlocked(cPlot, cPlot)) {
          ctx.strokeStyle = 'rgba(255, 213, 79, 0.65)';
          ctx.lineWidth = 2.0 / this.mapZoom;
          ctx.strokeRect(cPlot * plotPx + 0.5, cPlot * plotPx + 0.5, plotPx - 1, plotPx - 1);
        }

        // Adjacent buyable border frame
        for (let ai = 0; ai < mapAdjPlotsCache.length; ai++) {
          const [gx, gy] = mapAdjPlotsCache[ai];
          if (g.world.isPlotUnlocked(gx, gy)) continue;
          const plotBiomeLock = (g.economy && typeof g.economy.getBiomeLockStatus === 'function')
            ? g.economy.getBiomeLockStatus(g, gx, gy)
            : { lockedByBiome: false };
          if (!plotBiomeLock.lockedByBiome) {
            const price = g.economy.getPlotPrice(g, gx, gy);
            const canAfford = g.coins >= price;
            ctx.strokeStyle = canAfford ? 'rgba(245, 204, 102, 0.72)' : 'rgba(239, 83, 80, 0.62)';
            ctx.lineWidth = 1.4 / this.mapZoom;
            ctx.strokeRect(gx * plotPx + 1, gy * plotPx + 1, plotPx - 2, plotPx - 2);
          }
        }

        // Square plot grid overlay (toggled by Cuadrícula button)
        if (this.mapShowGrid) {
          ctx.strokeStyle = 'rgba(129, 212, 250, 0.28)';
          ctx.lineWidth = 1.2 / this.mapZoom;
          for (let i = 0; i <= GRID_PLOTS; i++) {
            const p = i * plotPx;
            ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, MAP_WORLD_SZ); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(MAP_WORLD_SZ, p); ctx.stroke();
          }
        }

        // Selected square highlight
        const [sx, sy] = this.selectedMapPlot;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.95)';
        ctx.lineWidth = 2.6 / this.mapZoom;
        ctx.strokeRect(sx * plotPx + 1, sy * plotPx + 1, plotPx - 2, plotPx - 2);

        const pulse = (Math.sin(Date.now() / 260) + 1) * 0.5;

        // Skill-Style Live Channeling Aura on the target island while holding to conquer
        if (mapChannelState) {
          const ch = mapChannelState;
          const cp = getPlotCenterPx(ch.gx, ch.gy);
          const p = Math.max(0, Math.min(1, ch.progress || 0));
          const tNow = (typeof performance !== 'undefined' ? performance.now() : Date.now()) * 0.006;
          ctx.save();
          // Golden glowing fill charging across the plot
          ctx.fillStyle = `rgba(255, 213, 79, ${(0.12 + p * 0.34).toFixed(3)})`;
          ctx.fillRect(ch.gx * plotPx, ch.gy * plotPx, plotPx, plotPx);
          // Contracting arcane energy ring + spinning constellation arc
          const outerR = plotPx * (1.15 - p * 0.45);
          ctx.strokeStyle = ch.color || '#ffd54f';
          ctx.lineWidth = (2.6 + p * 2.4) / this.mapZoom;
          ctx.beginPath();
          ctx.arc(cp.x, cp.y, outerR, tNow, tNow + Math.PI * 2 * Math.max(0.15, p));
          ctx.stroke();
          // Progress ring snug around the plot center
          ctx.strokeStyle = '#fff59d';
          ctx.lineWidth = 3.4 / this.mapZoom;
          ctx.beginPath();
          ctx.arc(cp.x, cp.y, plotPx * 0.48, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p);
          ctx.stroke();
          // Inward-rushing golden channeling sparks (just like Skill Tree sparks!)
          for (let i = 0; i < 10; i++) {
            const ph = ((tNow * 0.55 + i * 0.1) % 1);
            const ang = i * (Math.PI * 2 / 10) + tNow * 0.4;
            const distR = plotPx * (1.25 * (1 - ph));
            const pxS = cp.x + Math.cos(ang) * distR;
            const pyS = cp.y + Math.sin(ang) * distR;
            ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#ffd54f';
            ctx.globalAlpha = Math.sin(ph * Math.PI);
            ctx.beginPath();
            ctx.arc(pxS, pyS, (2.2 + p * 2.0) / this.mapZoom, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        // Skill-Style Island Conquest Starburst, Shockwaves & Neighbor Energy Bridges!
        if (mapUnlockBursts.length > 0) {
          const nowTs = (typeof performance !== 'undefined' ? performance.now() : Date.now());
          for (const fx of mapUnlockBursts) {
            const u = Math.max(0, Math.min(1, (nowTs - fx.startTs) / fx.dur));
            const easeOut = 1 - Math.pow(1 - u, 3);
            const cp = getPlotCenterPx(fx.gx, fx.gy);
            ctx.save();

            // 1. Surging constellation-style golden link beams from adjacent owned islands
            if (Array.isArray(fx.adjFrom) && u < 0.72) {
              const linkA = (1 - u / 0.72) * 0.92;
              for (const [ax, ay] of fx.adjFrom) {
                const ap = getPlotCenterPx(ax, ay);
                const grad = ctx.createLinearGradient(ap.x, ap.y, cp.x, cp.y);
                grad.addColorStop(0, `rgba(255, 213, 79, ${(linkA * 0.35).toFixed(3)})`);
                grad.addColorStop(0.5, `rgba(255, 255, 255, ${linkA.toFixed(3)})`);
                grad.addColorStop(1, `rgba(128, 222, 234, ${linkA.toFixed(3)})`);
                ctx.strokeStyle = grad;
                ctx.lineWidth = (5.5 * (1 - u * 0.6)) / this.mapZoom;
                ctx.beginPath();
                ctx.moveTo(ap.x, ap.y);
                ctx.lineTo(cp.x, cp.y);
                ctx.stroke();
              }
            }

            // 2. Brilliant reveal flash over newly conquered island
            if (u < 0.45) {
              const flashA = Math.pow(1 - u / 0.45, 2) * 0.85;
              ctx.fillStyle = `rgba(255, 249, 196, ${flashA.toFixed(3)})`;
              ctx.fillRect(fx.gx * plotPx, fx.gy * plotPx, plotPx, plotPx);
            }

            // 3. Double expanding cosmic shockwave rings
            const r1 = plotPx * (0.38 + easeOut * 1.65);
            ctx.strokeStyle = `rgba(255, 213, 79, ${(Math.pow(1 - u, 1.5) * 0.95).toFixed(3)})`;
            ctx.lineWidth = (6.0 * (1 - u * 0.75)) / this.mapZoom;
            ctx.beginPath();
            ctx.arc(cp.x, cp.y, r1, 0, Math.PI * 2);
            ctx.stroke();

            const u2 = Math.max(0, Math.min(1, (u - 0.08) / 0.92));
            if (u2 > 0) {
              const r2 = plotPx * (0.30 + (1 - Math.pow(1 - u2, 2.5)) * 1.25);
              ctx.strokeStyle = fx.color || '#80deea';
              ctx.globalAlpha = Math.pow(1 - u2, 1.4) * 0.85;
              ctx.lineWidth = (3.8 * (1 - u2 * 0.7)) / this.mapZoom;
              ctx.beginPath();
              ctx.arc(cp.x, cp.y, r2, 0, Math.PI * 2);
              ctx.stroke();
              ctx.globalAlpha = 1;
            }

            // 4. Radial starburst diamond sparks flying outward
            for (const sp of fx.sparks) {
              const distR = sp.spd * easeOut * 1.35;
              const sxP = cp.x + Math.cos(sp.ang) * distR;
              const syP = cp.y + Math.sin(sp.ang) * distR;
              const sAlpha = Math.pow(1 - u, 1.35);
              const sSize = (sp.sz * (1 - u * 0.55)) / Math.max(0.7, this.mapZoom * 0.75);
              ctx.save();
              ctx.translate(sxP, syP);
              ctx.rotate(sp.ang + u * sp.spin);
              ctx.globalAlpha = sAlpha;
              ctx.fillStyle = sp.col;
              ctx.beginPath();
              ctx.moveTo(0, -sSize * 1.4);
              ctx.lineTo(sSize * 0.8, 0);
              ctx.lineTo(0, sSize * 1.4);
              ctx.lineTo(-sSize * 0.8, 0);
              ctx.closePath();
              ctx.fill();
              ctx.restore();
            }
            ctx.restore();
          }
        }

        // Tutorial Recommended 1st Island Golden Callout border (world space)
        const tutRecPlot = getTutorialRecommendedPlot();
        if (tutRecPlot) {
          const [rgx, rgy] = tutRecPlot;
          ctx.save();
          ctx.strokeStyle = `rgba(255, 213, 79, ${0.75 + pulse * 0.25})`;
          ctx.lineWidth = 3.2 / this.mapZoom;
          ctx.strokeRect(rgx * plotPx + 2, rgy * plotPx + 2, plotPx - 4, plotPx - 4);
          ctx.restore();
        }
        ctx.restore();

        // Crisp HiDPI Screen-Space Icons (Dungeons, Altars, Secrets, NPC Portraits, Price Pills, Player Beacon)
        const toScreenX = (wx) => wx * this.mapZoom + this.mapPanX;
        const toScreenY = (wy) => wy * this.mapZoom + this.mapPanY;
        const pinScale = Abyssea.Utils.clamp(0.75 + Math.sqrt(this.mapZoom) * 0.34, 0.78, 1.32);

        for (let pi = 0; pi < mapPinsCache.length; pi++) {
          const pin = mapPinsCache[pi];
          const pxS = toScreenX(pin.wx);
          const pyS = toScreenY(pin.wy);
          if (pxS < -36 || pxS > cw + 36 || pyS < -36 || pyS > ch + 36) continue;
          drawMapPin(ctx, pxS, pyS, pin.kind, Object.assign({}, pin.opts || {}, { r: (pin.r || 8.5) * pinScale }));
        }

        // Dynamic HiDPI adjacent-island price & biome-lock badges
        const plotScrW = plotPx * this.mapZoom;
        for (let ai = 0; ai < mapAdjPlotsCache.length; ai++) {
          const [gx, gy] = mapAdjPlotsCache[ai];
          if (g.world.isPlotUnlocked(gx, gy)) continue;
          const hcx = toScreenX((gx + 0.5) * plotPx);
          const hcy = toScreenY((gy + 0.5) * plotPx);
          if (hcx < -90 || hcx > cw + 90 || hcy < -40 || hcy > ch + 40) continue;
          const plotBiomeLock = (g.economy && typeof g.economy.getBiomeLockStatus === 'function')
            ? g.economy.getBiomeLockStatus(g, gx, gy)
            : { lockedByBiome: false };
          const price = g.economy.getPlotPrice(g, gx, gy);
          const canAfford = !plotBiomeLock.lockedByBiome && g.coins >= price;
          const pillTxt = plotBiomeLock.lockedByBiome
            ? `${plotBiomeLock.unlocked}/${plotBiomeLock.total}`
            : (price >= 10000 ? `${Math.round(price / 1000)}k` : `${price}`);
          ctx.save();
          ctx.imageSmoothingEnabled = true;
          const fontPx = Math.round(Abyssea.Utils.clamp(11 * Math.max(0.9, Math.min(1.25, Math.sqrt(this.mapZoom))), 10, 14));
          ctx.font = `bold ${fontPx}px ui-monospace, Consolas, monospace`;
          const txtW = ctx.measureText(pillTxt).width;
          const bw = Math.min(Math.max(36, plotScrW - 8), Math.max(38, Math.round(txtW + 24)));
          const bh = Math.round(fontPx + 10);
          const bx = hcx - bw / 2;
          const by = hcy - bh / 2;

          ctx.fillStyle = 'rgba(8, 16, 30, 0.90)';
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 5);
          else ctx.rect(bx, by, bw, bh);
          ctx.fill();
          ctx.strokeStyle = plotBiomeLock.lockedByBiome ? 'rgba(148, 163, 184, 0.78)' : (canAfford ? 'rgba(245, 204, 102, 0.95)' : 'rgba(239, 83, 80, 0.85)');
          ctx.lineWidth = 1.4;
          ctx.stroke();

          if (plotBiomeLock.lockedByBiome) {
            const lx = bx + 10;
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.arc(lx, hcy - 2, 2.8, Math.PI, 0, false);
            ctx.stroke();
            ctx.fillStyle = '#cbd5e1';
            ctx.fillRect(lx - 3.2, hcy - 1.5, 6.4, 5.2);
            ctx.fillStyle = '#f1f5f9';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(pillTxt, bx + 17.5, hcy + 0.5);
          } else {
            const cxCoin = bx + 10;
            ctx.fillStyle = canAfford ? '#fbbf24' : '#f87171';
            ctx.beginPath();
            ctx.arc(cxCoin, hcy, 4.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = canAfford ? '#fef3c7' : '#fecaca';
            ctx.beginPath();
            ctx.arc(cxCoin - 1.0, hcy - 1.0, 1.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = canAfford ? '#fef08a' : '#fca5a5';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(pillTxt, bx + 17.5, hcy + 0.5);
          }
          ctx.restore();
        }

        // Crisp HiDPI 1st-Island Tutorial Tag cleanly above the plot center badge
        if (tutRecPlot) {
          const [rgx, rgy] = tutRecPlot;
          const recSx = toScreenX((rgx + 0.5) * plotPx);
          const recTopY = toScreenY(rgy * plotPx);
          const recCenterY = toScreenY((rgy + 0.5) * plotPx);
          const badgeY = Math.max(recTopY + 12, recCenterY - 26);
          const isEnMap = Abyssea.I18n && Abyssea.I18n.getLanguage() === 'en';
          const lbl = isEnMap ? '1ST ISLAND' : '1ra ISLA';
          ctx.save();
          ctx.imageSmoothingEnabled = true;
          ctx.font = 'bold 11px ui-monospace, Consolas, monospace';
          const tw = ctx.measureText(lbl).width;
          const bw = Math.round(tw + 14);
          const bh = 18;
          ctx.fillStyle = 'rgba(16, 24, 39, 0.95)';
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(recSx - bw / 2, badgeY - bh / 2, bw, bh, 4);
          else ctx.rect(recSx - bw / 2, badgeY - bh / 2, bw, bh);
          ctx.fill();
          ctx.strokeStyle = '#ffd54f';
          ctx.lineWidth = 1.4;
          ctx.stroke();
          ctx.fillStyle = '#ffd54f';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(lbl, recSx, badgeY + 0.5);
          ctx.restore();
        }

        // Pulsating minimalist HiDPI player beacon at exact world position
        const ptx = toScreenX((g.player.x / TILE_SIZE) * tilePx);
        const pty = toScreenY((g.player.y / TILE_SIZE) * tilePx);
        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.strokeStyle = `rgba(52, 211, 153, ${(0.32 + pulse * 0.44).toFixed(2)})`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(ptx, pty, (11.5 + pulse * 5) * Math.max(0.85, Math.min(1.2, pinScale)), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        drawMapPin(ctx, ptx, pty, 'player', { r: 9.8 * pinScale });

        // Crisp fixed bottom-right pixel-art compass rose in screen space
        const westCh = tr('map.westLetter') || 'W';
        const compImg = mapImg((Abyssea.UI_URLS && Abyssea.UI_URLS.rpgCompass) || this._uiAssetFallback('assets/ui/rpg_compass.png'));
        if (compImg && compImg.complete && compImg.naturalWidth > 0) {
          const cwPx = 68;
          const chPx = Math.round(cwPx * (compImg.naturalHeight / Math.max(1, compImg.naturalWidth)));
          const bx = cw - cwPx - 14;
          const by = ch - chPx - 14;
          const cx = bx + cwPx / 2;
          const cy = by + chPx / 2;
          ctx.fillStyle = 'rgba(10, 14, 28, 0.80)';
          ctx.beginPath(); ctx.arc(cx, cy, Math.max(cwPx, chPx) * 0.44, 0, Math.PI * 2); ctx.fill();
          ctx.save();
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(compImg, bx, by, cwPx, chPx);
          ctx.restore();
          ctx.font = '14px AbysseaPixel, monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#090d1a';
          ctx.fillText('N', cx + 1, by + 9);
          ctx.fillText('S', cx + 1, by + chPx - 7);
          ctx.fillText(westCh, bx + 9, cy + 1);
          ctx.fillText('E', bx + cwPx - 7, cy + 1);
          ctx.fillStyle = '#ffe8a3';
          ctx.fillText('N', cx, by + 8);
          ctx.fillText('S', cx, by + chPx - 8);
          ctx.fillText(westCh, bx + 8, cy);
          ctx.fillText('E', bx + cwPx - 8, cy);
          ctx.textAlign = 'left';
          ctx.textBaseline = 'alphabetic';
        } else {
          const compX = cw - 38;
          const compY = ch - 38;
          ctx.fillStyle = 'rgba(10, 22, 38, 0.86)';
          ctx.beginPath(); ctx.arc(compX, compY, 24, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#ffd54f'; ctx.lineWidth = 2; ctx.stroke();
          ctx.fillStyle = '#ffd54f'; ctx.font = '15px AbysseaPixel, monospace'; ctx.textAlign = 'center';
          ctx.fillText('N', compX, compY - 10);
          ctx.fillText('S', compX, compY + 18);
          ctx.fillText(westCh, compX - 15, compY + 4);
          ctx.fillText('E', compX + 15, compY + 4);
          ctx.textAlign = 'left';
        }
      };

      const setMapZoomAround = (nextZoom, ax = (mapCanvas._cssW || viewW) / 2, ay = (mapCanvas._cssH || viewH) / 2) => {
        const z = Abyssea.Utils.clamp(nextZoom, 0.55, 2.8);
        const wx = (ax - this.mapPanX) / this.mapZoom;
        const wy = (ay - this.mapPanY) / this.mapZoom;
        this.mapZoom = z;
        this.mapPanX = ax - wx * z;
        this.mapPanY = ay - wy * z;
        drawMapCanvas();
      };

      const focusMapPlot = (gx, gy, z = 1.45) => {
        const pt = getPlotCenterPx(gx, gy);
        const cw = mapCanvas._cssW || viewW;
        const ch = mapCanvas._cssH || viewH;
        this.mapZoom = Abyssea.Utils.clamp(z, 0.45, 2.8);
        this.mapPanX = cw / 2 - pt.x * this.mapZoom;
        this.mapPanY = ch / 2 - pt.y * this.mapZoom;
        drawMapCanvas();
      };

      let dragActive = false;
      let dragMoved = false;
      let dragStartX = 0;
      let dragStartY = 0;
      let startPanX = 0;
      let startPanY = 0;

      mapCanvas.addEventListener('mousedown', (ev) => {
        if (ev.button !== 0) return;
        dragActive = true;
        dragMoved = false;
        dragStartX = ev.clientX;
        dragStartY = ev.clientY;
        startPanX = this.mapPanX;
        startPanY = this.mapPanY;
        boardWrap.classList.add('dragging');
      });

      if (this._mapCleanup) { this._mapCleanup(); this._mapCleanup = null; }
      const onMapMove = (ev) => {
        if (!dragActive || this.activeModal !== 'map') return;
        const dx = ev.clientX - dragStartX;
        const dy = ev.clientY - dragStartY;
        if (Math.hypot(dx, dy) > 5) dragMoved = true;
        this.mapPanX = startPanX + dx;
        this.mapPanY = startPanY + dy;
        drawMapCanvas();
      };
      const onMapUp = () => {
        if (!dragActive) return;
        dragActive = false;
        boardWrap.classList.remove('dragging');
      };
      const onMapResize = () => {
        if (this.activeModal === 'map') drawMapCanvas();
      };
      window.addEventListener('mousemove', onMapMove);
      window.addEventListener('mouseup', onMapUp);
      window.addEventListener('resize', onMapResize);
      this._mapCleanup = () => {
        if (mapFxRaf !== null) { cancelAnimationFrame(mapFxRaf); mapFxRaf = null; }
        if (mapHoldCleanup) { mapHoldCleanup(); mapHoldCleanup = null; }
        if (mapQuakeTimer) { clearTimeout(mapQuakeTimer); mapQuakeTimer = null; }
        mapChannelState = null;
        mapUnlockBursts.length = 0;
        window.removeEventListener('mousemove', onMapMove);
        window.removeEventListener('mouseup', onMapUp);
        window.removeEventListener('resize', onMapResize);
      };

      mapCanvas.addEventListener('click', (ev) => {
        if (dragMoved) { dragMoved = false; return; }
        const rect = mapCanvas.getBoundingClientRect();
        const cw = mapCanvas._cssW || rect.width;
        const ch = mapCanvas._cssH || rect.height;
        const sx = (ev.clientX - rect.left) * (cw / Math.max(1, rect.width));
        const sy = (ev.clientY - rect.top) * (ch / Math.max(1, rect.height));
        const wx = (sx - this.mapPanX) / this.mapZoom;
        const wy = (sy - this.mapPanY) / this.mapZoom;
        if (wx < 0 || wy < 0 || wx > MAP_WORLD_SZ || wy > MAP_WORLD_SZ) return;
        const gx = Abyssea.Utils.clamp(Math.floor(wx / (MAP_WORLD_SZ / GRID_PLOTS)), 0, GRID_PLOTS - 1);
        const gy = Abyssea.Utils.clamp(Math.floor(wy / (MAP_WORLD_SZ / GRID_PLOTS)), 0, GRID_PLOTS - 1);
        this.selectedMapPlot = [gx, gy];
        drawMapCanvas();
        renderInspector();
      });

      mapCanvas.addEventListener('wheel', (ev) => {
        ev.preventDefault();
        const rect = mapCanvas.getBoundingClientRect();
        const cw = mapCanvas._cssW || rect.width;
        const ch = mapCanvas._cssH || rect.height;
        const ax = (ev.clientX - rect.left) * (cw / Math.max(1, rect.width));
        const ay = (ev.clientY - rect.top) * (ch / Math.max(1, rect.height));
        const step = ev.deltaY < 0 ? 1.15 : 0.87;
        setMapZoomAround(this.mapZoom * step, ax, ay);
      }, { passive: false });

      const toolbarSvgIcon = (inner) => {
        const s = document.createElement('span');
        s.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;';
        s.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
        return s;
      };

      const toolbar = this.el('div', { class: 'map-atlas-toolbar' }, [
        this.el('button', {
          class: 'btn btn-sm',
          'data-tip-text': tr('map.zoomOutTip'),
          'aria-label': tr('map.zoomOutTip'),
          onclick: () => setMapZoomAround(this.mapZoom * 0.82)
        }, [toolbarSvgIcon('<circle cx="7" cy="7" r="4.6" stroke="#e2e8f0" stroke-width="1.6"/><line x1="10.4" y1="10.4" x2="14" y2="14" stroke="#e2e8f0" stroke-width="1.8" stroke-linecap="round"/><line x1="4.8" y1="7" x2="9.2" y2="7" stroke="#ffd54f" stroke-width="1.6" stroke-linecap="round"/>')]),
        zoomReadout,
        this.el('button', {
          class: 'btn btn-sm',
          'data-tip-text': tr('map.zoomInTip'),
          'aria-label': tr('map.zoomInTip'),
          onclick: () => setMapZoomAround(this.mapZoom * 1.22)
        }, [toolbarSvgIcon('<circle cx="7" cy="7" r="4.6" stroke="#e2e8f0" stroke-width="1.6"/><line x1="10.4" y1="10.4" x2="14" y2="14" stroke="#e2e8f0" stroke-width="1.8" stroke-linecap="round"/><line x1="4.8" y1="7" x2="9.2" y2="7" stroke="#ffd54f" stroke-width="1.6" stroke-linecap="round"/><line x1="7" y1="4.8" x2="7" y2="9.2" stroke="#ffd54f" stroke-width="1.6" stroke-linecap="round"/>')]),
        this.el('button', { class: 'btn btn-gold btn-sm', onclick: () => { this.selectedMapPlot = [pGx, pGy]; focusMapPlot(pGx, pGy, 1.45); renderInspector(); } }, tr('map.centerMe')),
        this.el('button', { class: 'btn btn-sm', onclick: () => {
          const cw = mapCanvas._cssW || viewW;
          const ch = mapCanvas._cssH || viewH;
          const curFit = Abyssea.Utils.clamp(Math.min((cw - 40) / MAP_WORLD_SZ, (ch - 40) / MAP_WORLD_SZ), 0.45, 1.35);
          this.mapZoom = curFit;
          this.mapPanX = (cw - MAP_WORLD_SZ * curFit) / 2;
          this.mapPanY = (ch - MAP_WORLD_SZ * curFit) / 2;
          drawMapCanvas();
        } }, tr('map.viewAll')),
        this.el('button', {
          class: 'btn ' + (this.mapShowGrid ? 'btn-gold' : 'btn-sm'),
          style: 'padding:3px 8px;font-size:13px;',
          title: (Abyssea.I18n && Abyssea.I18n.getLanguage && Abyssea.I18n.getLanguage() === 'en') ? 'Toggle plot grid' : 'Alternar cuadrícula de parcelas',
          onclick: (e) => {
            this.mapShowGrid = !this.mapShowGrid;
            e.currentTarget.className = 'btn ' + (this.mapShowGrid ? 'btn-gold' : 'btn-sm');
            drawMapCanvas();
          }
        }, [this.el('span', {}, (Abyssea.I18n && Abyssea.I18n.getLanguage && Abyssea.I18n.getLanguage() === 'en') ? 'Grid' : 'Cuadrícula')]),
        this.el('button', {
          class: 'btn ' + (this.showDungeonAtlas ? 'btn-gold' : 'btn-primary') + ' btn-sm',
          onclick: () => { this.showDungeonAtlas = !this.showDungeonAtlas; renderInspector(); }
        }, tr('map.dungeonsBtn', { n: Object.keys(Abyssea.DUNGEON_DEFS || {}).length })),
        this.el('div', {
          id: 'map-coins-badge',
          class: 'map-coins-pill',
          'data-tip-text': (Abyssea.I18n && Abyssea.I18n.getLanguage && Abyssea.I18n.getLanguage() === 'en') ? 'Available Gold' : 'Oro disponible',
          'aria-label': (Abyssea.I18n && Abyssea.I18n.getLanguage && Abyssea.I18n.getLanguage() === 'en') ? 'Available Gold' : 'Oro disponible'
        }, [
          this.el('img', {
            class: 'pixel-img',
            src: encodeURI((Abyssea.UI_URLS && Abyssea.UI_URLS.coin) || this._uiAssetFallback('assets/ui/coin_gold.png')),
            width: 16,
            height: 16,
            alt: ''
          }),
          mapCoinsVal
        ])
      ]);

      const legendSvg = (svgInner, label) => {
        const ico = document.createElement('span');
        ico.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;flex-shrink:0;';
        ico.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">${svgInner}</svg>`;
        return this.el('span', { style: 'display:inline-flex;align-items:center;gap:5px;' }, [ico, label]);
      };

      const headerTools = document.getElementById('modal-header-tools');
      if (headerTools) {
        headerTools.innerHTML = '';
        headerTools.appendChild(toolbar);
        headerTools.classList.remove('hidden');
      } else {
        boardWrap.appendChild(toolbar);
      }
      boardWrap.appendChild(mapCanvas);
      boardWrap.appendChild(this.el('div', { class: 'map-legend-floating' }, [
        legendSvg('<circle cx="8" cy="8" r="6.5" fill="#0f9f6e" stroke="#ffffff" stroke-width="1.3"/><path d="M8 4.2 L11 10.6 L8 9 L5 10.6 Z" fill="#ffffff"/>', tr('map.playerHere')),
        legendSvg('<rect x="1.5" y="3.5" width="13" height="9" rx="2.5" fill="#08101e" stroke="#f5cc66" stroke-width="1.2"/><circle cx="6" cy="8" r="2.2" fill="#fbbf24"/><rect x="9.5" y="7.1" width="3" height="1.8" rx="0.6" fill="#fef08a"/>', tr('map.legForSale')),
        legendSvg('<circle cx="8" cy="8" r="6.5" fill="#0369a1" stroke="#bae6fd" stroke-width="1.2"/><circle cx="8" cy="6.2" r="2" fill="#ffffff"/><path d="M4.6 12 A3.4 3.4 0 0 1 11.4 12" fill="#ffffff"/>', tr('map.legNpc')),
        legendSvg('<polygon points="8,1.5 14.5,8 8,14.5 1.5,8" fill="#b91c1c" stroke="#fde68a" stroke-width="1.1"/><path d="M6.1 10.5 V7.5 A1.9 1.9 0 0 1 9.9 7.5 V10.5" fill="none" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round"/>', tr('map.legDungeon')),
        legendSvg('<polygon points="8,1.5 13.5,8 8,14.5 2.5,8" fill="#6d28d9" stroke="#e9d5ff" stroke-width="1.1"/><circle cx="8" cy="8" r="2" fill="#ffffff"/>', tr('map.legAltar')),
        legendSvg('<circle cx="8" cy="8" r="6.2" fill="#d97706" stroke="#fef08a" stroke-width="1.1"/><path d="M8 4.2 L9 7 L11.8 8 L9 9 L8 11.8 L7 9 L4.2 8 L7 7 Z" fill="#ffffff"/>', tr('map.legSecret')),
        legendSvg('<circle cx="8" cy="8" r="6.2" fill="#0e7490" stroke="#67e8f9" stroke-width="1.2"/><circle cx="8" cy="8" r="2.6" fill="none" stroke="#ffffff" stroke-width="1.2"/>', tr('map.legPortal'))
      ]));

      workspace.appendChild(boardWrap);
      workspace.appendChild(inspectorSlot);
      body.appendChild(workspace);

      try {
        drawMapCanvas();
      } catch (err) {
        console.error('Error drawing map canvas:', err);
      }
      try {
        renderInspector();
      } catch (err) {
        console.error('Error rendering map inspector:', err);
      }
    }

    renderMarket(body) {
      const g = this.game;
      if (!this.marketTab) this.marketTab = 'comprar';

      const secs = Math.max(0, Math.ceil(g.economy.refreshTimer || 0));
      const mm = String(Math.floor(secs / 60)).padStart(2, '0');
      const ss = String(secs % 60).padStart(2, '0');
      const sellMult = g.economy.getSellMultiplier(g);

      body.appendChild(this.el('div', { class: 'parchment-box', style: 'margin-bottom:10px;font-size:14px;line-height:1.4;' }, [
        this.el('strong', { style: 'font-size:16px;display:block;margin-bottom:2px;' }, tr('market.postTitle')),
        tr('market.rotInfo', { mm, ss, pct: Math.round((sellMult - 1) * 100) })
      ]));

      // RC2 (G): Daily Dynamic Market Demand Banner
      if (typeof g.getDailyMarketDemand === 'function') {
        const dem = g.getDailyMarketDemand();
        if (dem) {
          body.appendChild(this.el('div', {
            style: `background:linear-gradient(135deg,rgba(16,28,44,0.95),rgba(34,24,48,0.95));border:1.5px solid ${dem.color};border-radius:8px;padding:9px 12px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;`
          }, [
            this.el('strong', { style: `color:${dem.color};font-size:14px;` }, `Demanda Diaria (Día ${g.dayCount || 1}): ${dem.title}`),
            this.el('span', { style: 'font-size:12px;color:#cfd8dc;' }, 'Aplica automáticamente al vender en el Mercado o Inventario')
          ]));
        }
      }

      const topRow = this.el('div', { style: 'display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px;' }, [
        this.el('div', { class: 'tab-row', style: 'margin-bottom:0;' }, [
          this.el('button', {
            class: 'tab-btn' + (this.marketTab === 'comprar' ? ' active' : ''),
            onclick: () => { this.marketTab = 'comprar'; this.renderModal(); }
          }, tr('market.tabBuy', { n: Math.min(5, (g.economy.marketStock || []).length) })),
          this.el('button', {
            class: 'tab-btn' + (this.marketTab === 'vender' ? ' active' : ''),
            onclick: () => { this.marketTab = 'vender'; this.renderModal(); }
          }, tr('market.tabSell', { n: Math.min(5, (g.economy.sellContracts || []).length) }))
        ]),
        (() => {
          const maxRef = g.economy.maxManualRefreshes || 3;
          const remRef = typeof g.economy.getRemainingRefreshes === 'function'
            ? g.economy.getRemainingRefreshes()
            : Math.max(0, maxRef - (g.economy.manualRefreshesUsed || 0));
          const btnText = remRef > 0
            ? tr('market.refreshBtn', { rem: remRef, max: maxRef })
            : tr('market.refreshLimitBtn', { max: maxRef, mm, ss });
          return this.el('button', {
            id: 'btn-market-refresh',
            class: remRef > 0 ? 'btn btn-gold btn-sm' : 'btn btn-stone btn-sm',
            disabled: remRef <= 0 ? 'disabled' : null,
            onclick: () => {
              if (typeof g.economy.manualRefreshStock === 'function') {
                g.economy.manualRefreshStock(g);
              }
              this.renderModal();
            }
          }, btnText);
        })()
      ]);
      body.appendChild(topRow);

      const list = this.el('div', { class: 'build-list' });
      if (this.marketTab === 'comprar') {
        (g.economy.marketStock || []).slice(0, 5).forEach((offer, idx) => {
          const it = Abyssea.ITEMS[offer.itemId];
          if (!it) return;
          const cost = g.economy.getBuyPrice(g, offer.price);
          const rar = RARITIES[it.rarity] || RARITIES.comun;
          list.appendChild(this.el('div', { class: 'build-row-card' }, [
            this.el('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:10px;' }, [
              this.el('div', { style: 'display:flex;align-items:center;gap:10px;' }, [
                this.itemIcon(it.icon, 32),
                this.el('div', {}, [
                  this.el('strong', { style: 'font-size:15px;color:#ffe39a;display:block;' }, it.name),
                  this.el('span', { class: 'rarity-tag', style: `background:${rar.bg};color:${rar.color}` },
                    tr('market.stockLabel', { rar: rar.name, stock: offer.stock, disc: offer.discount ? ` · -${offer.discount}%` : '' }))
                ])
              ]),
              this.el('div', { style: 'text-align:right;' }, [
                this.el('div', { style: 'font-size:14px;color:#ffd54f;font-weight:800;margin-bottom:4px;' }, tr('market.goldPrice', { cost })),
                this.el('div', { style: 'display:flex;gap:6px;justify-content:flex-end;' }, [
                  this.el('button', {
                    class: 'btn btn-primary btn-sm',
                    disabled: offer.stock <= 0 || g.coins < cost ? 'disabled' : null,
                    onclick: () => { g.economy.buyMarketItem(g, idx, 1); this.renderModal(); }
                  }, tr('market.buyOne')),
                  this.el('button', {
                    class: 'btn btn-stone btn-sm',
                    disabled: offer.stock <= 0 || g.coins < cost ? 'disabled' : null,
                    onclick: () => { g.economy.buyMarketItem(g, idx, 5); this.renderModal(); }
                  }, 'x5')
                ])
              ])
            ])
          ]));
        });
      } else {
        (g.economy.sellContracts || []).slice(0, 5).forEach((c, idx) => {
          const it = Abyssea.ITEMS[c.itemId];
          if (!it) return;
          const owned = g.inventory[c.itemId] || 0;
          const unit = Math.max(1, Math.round(c.price * sellMult));
          const maxSell = Math.min(owned, c.demand);
          list.appendChild(this.el('div', { class: 'build-row-card' }, [
            this.el('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:10px;' }, [
              this.el('div', { style: 'display:flex;align-items:center;gap:10px;' }, [
                this.itemIcon(it.icon, 32),
                this.el('div', {}, [
                  this.el('strong', { style: 'font-size:15px;color:#ffe39a;display:block;' }, it.name),
                  this.el('div', { style: 'font-size:14px;color:#dce8f5;line-height:1.45;' },
                    tr('market.demandLine', { demand: c.demand, bonus: c.bonusPct || 15, owned }))
                ])
              ]),
              this.el('div', { style: 'text-align:right;' }, [
                this.el('div', { style: 'font-size:14px;color:#81c784;font-weight:800;margin-bottom:4px;' }, tr('market.goldPerUnit', { unit })),
                this.el('div', { style: 'display:flex;gap:6px;justify-content:flex-end;' }, [
                  this.el('button', {
                    class: 'btn btn-gold btn-sm',
                    disabled: maxSell <= 0 ? 'disabled' : null,
                    onclick: () => { g.economy.sellMarketContract(g, idx, 1); this.renderModal(); }
                  }, tr('market.sellOne')),
                  this.el('button', {
                    class: 'btn btn-green btn-sm',
                    disabled: maxSell <= 0 ? 'disabled' : null,
                    onclick: () => { g.economy.sellMarketContract(g, idx, maxSell); this.renderModal(); }
                  }, maxSell > 0 ? tr('market.sellCount', { n: maxSell }) : tr('market.noStock'))
                ])
              ])
            ])
          ]));
        });
      }
      body.appendChild(list);
    }

    renderQuests(body) {
      const g = this.game;
      const contracts = Abyssea.GUILD_CONTRACTS || [];
      const claimedIds = g.claimedContracts || [];
      const readyContracts = contracts.filter(c => !claimedIds.includes(c.id) && c.progress(g) >= c.target).length;
      const readyDaily = g.events.dailyChallenges.filter(dc => !dc.claimed && dc.progress >= dc.target).length;
      const totalNpcQuests = Abyssea.NPCS.reduce((acc, n) => acc + n.quests.length, 0);
      const doneNpcQuests = Abyssea.NPCS.reduce((acc, n) => acc + Math.min(n.quests.length, g.npcQuestProgress[n.id] || 0), 0);

      // Summary Parchment Banner
      body.appendChild(this.el('div', { class: 'parchment-box quests-summary' }, [
        this.el('div', {}, [
          this.el('strong', { class: 'quests-summary-title' }, tr('quests.logTitle')),
          this.el('span', { class: 'quests-summary-meta' },
            tr('quests.logMeta', { s: g.storyIndex, st: Abyssea.STORY_CHAPTERS.length, n: doneNpcQuests, nt: totalNpcQuests, c: claimedIds.length, ct: contracts.length }))
        ]),
        this.el('div', { class: 'skill-points-pill' },
          tr('quests.totalPill', { tot: contracts.length + Abyssea.STORY_CHAPTERS.length + totalNpcQuests + g.events.dailyChallenges.length }))
      ]));

      // RC2 (C): Visual "What To Do Now?" Progression Guide
      if (typeof g.getProgressionGuideSteps === 'function') {
        const steps = g.getProgressionGuideSteps();
        const nextStep = steps.find(s => !s.done) || steps[steps.length - 1];
        const doneCnt = steps.filter(s => s.done).length;
        body.appendChild(this.el('div', {
          style: 'background:linear-gradient(135deg,rgba(14,26,42,0.92),rgba(20,38,52,0.92));border:1.5px solid #00e5ff;border-radius:8px;padding:9px 12px;margin-bottom:10px;'
        }, [
          this.el('div', { style: 'display:flex;justify-content:space-between;align-items:center;gap:8px;' }, [
            this.el('strong', { style: 'color:#00e5ff;font-size:14px;' }, `¿Qué hacer ahora? (Guía de Progresión: ${doneCnt}/${steps.length})`),
            this.el('span', { style: 'font-size:12px;color:#69f0ae;font-weight:bold;' }, doneCnt === steps.length ? '¡Maestro de Abyssea!' : 'Siguiente Hito')
          ]),
          this.el('div', { style: 'font-size:13px;color:#e0f7fa;margin-top:4px;' }, nextStep ? nextStep.label : '')
        ]));
      }

      const tabs = this.el('div', { class: 'tab-row quests-tabs' });
      [
        ['historia', tr('quests.tabStoryCount', { cur: g.storyIndex, tot: Abyssea.STORY_CHAPTERS.length })],
        ['legado', 'Legado de la Isla'],
        ['gremio', `Gremio (${(g.inventory && g.inventory.ficha_gremio) || 0} Fichas)`],
        ['contratos', readyContracts > 0 ? tr('quests.tabContractsReady', { n: readyContracts }) : tr('quests.tabContractsCount', { cur: claimedIds.length, tot: contracts.length })],
        ['npcs', tr('quests.tabNpcsCount', { cur: doneNpcQuests, tot: totalNpcQuests })],
        ['diarios', readyDaily > 0 ? tr('quests.tabDailyReady', { n: readyDaily }) : tr('quests.tabDaily')]
      ].forEach(([id, lbl]) => {
        tabs.appendChild(this.el('button', {
          class: 'tab-btn' + (this.questFilter === id ? ' active' : ''),
          onclick: () => { this.questFilter = id; this.renderModal(); }
        }, lbl));
      });
      body.appendChild(tabs);
      if (this.questFilter === 'logros') this.questFilter = 'historia';
      if (this.questFilter === 'legado' && typeof this.renderIslandLegacyTab === 'function') {
        this.renderIslandLegacyTab(body);
        return;
      }
      if (this.questFilter === 'gremio' && typeof this.renderGuildShopTab === 'function') {
        this.renderGuildShopTab(body);
        return;
      }

      let filteredContracts = contracts;
      if (this.questFilter === 'contratos') {
        const catRow = this.el('div', { class: 'tab-row quests-cat-row' });
        const catOpts = [
          ['todas', tr('quests.catAll', { n: contracts.length }), null],
          ['gather', tr('quests.catGather'), tr('quests.catGather')],
          ['farmFish', tr('quests.catFarmFish'), tr('quests.catFarmFish')],
          ['forgeTrade', tr('quests.catForgeTrade'), tr('quests.catForgeTrade')],
          ['combatDung', tr('quests.catCombatDung'), tr('quests.catCombatDung')],
          ['exploreMagic', tr('quests.catExploreMagic'), tr('quests.catExploreMagic')]
        ];
        if (!catOpts.some(([cid]) => cid === this.questCatFilter)) {
          const matched = catOpts.find(([, , matchCat]) => matchCat === this.questCatFilter);
          this.questCatFilter = matched ? matched[0] : 'todas';
        }
        catOpts.forEach(([cid, clbl]) => {
          catRow.appendChild(this.el('button', {
            class: 'tab-btn quests-cat-btn' + (this.questCatFilter === cid ? ' active' : ''),
            onclick: () => { this.questCatFilter = cid; this.renderModal(); }
          }, clbl));
        });
        body.appendChild(catRow);
        const activeCat = catOpts.find(([cid]) => cid === this.questCatFilter);
        filteredContracts = (!activeCat || !activeCat[2])
          ? contracts
          : contracts.filter(c => c.cat === activeCat[2]);
      }

      const grid = this.el('div', { class: 'grid-cards quests-grid' });
      if (this.questFilter === 'historia') {
        Abyssea.STORY_CHAPTERS.forEach((ch, idx) => {
          const done = idx < g.storyIndex;
          const active = idx === g.storyIndex;
          const rewardItems = ch.reward && ch.reward.items
            ? Object.entries(ch.reward.items).filter(([k, q]) => q > 0 && Abyssea.ITEMS[k]).map(([k, q]) => `${q}x ${Abyssea.ITEMS[k].name}`).join(', ')
            : '';
          grid.appendChild(this.el('div', { class: 'card quests-card' + (active ? ' selected' : '') + (done ? ' is-done' : '') }, [
            this.el('strong', { class: 'quests-title', style: `color:${done ? '#9be89e' : active ? '#ffe082' : '#f2e6d4'};` }, [
              done ? this.uiIcon('iconCheck', 15) : (active ? this.uiIcon('iconStar', 15) : null),
              ch.title
            ]),
            this.el('p', { class: 'quests-lore' }, ch.lore),
            this.el('div', { class: 'quests-obj' }, tr('quests.objectiveLine', { obj: ch.objective })),
            ch.reward ? this.el('div', { class: 'quests-reward' },
              tr('quests.rewardLineXp', { coins: ch.reward.coins, xp: ch.reward.xp, items: rewardItems ? ` · ${rewardItems}` : '' })) : null
          ]));
        });
      } else if (this.questFilter === 'contratos') {
        filteredContracts.forEach(c => {
          const claimed = claimedIds.includes(c.id);
          const cur = Math.min(c.target, c.progress(g));
          const ready = !claimed && cur >= c.target;
          const itemStr = c.reward && c.reward.items
            ? Object.entries(c.reward.items).filter(([id, q]) => q > 0 && Abyssea.ITEMS[id]).map(([id, q]) => `${q}x ${Abyssea.ITEMS[id].name}`).join(', ')
            : '';
          grid.appendChild(this.el('div', { class: 'card quests-card' + (ready ? ' selected' : '') + (claimed ? ' is-done' : '') }, [
            this.el('div', { class: 'quests-card-head' }, [
              this.el('strong', { class: 'quests-title', style: `color:${claimed ? '#9be89e' : '#ffe082'};` }, [
                claimed ? this.uiIcon('iconCheck', 15) : null,
                c.title
              ]),
              this.el('span', { class: 'rarity-tag quests-cat-tag' }, c.cat)
            ]),
            this.el('div', { class: 'quests-desc' }, `${c.desc} (${cur}/${c.target})`),
            this.el('div', { class: 'quests-progress-bar' }, [
              this.el('div', { style: `height:100%;width:${Math.round((cur / c.target) * 100)}%;background:${claimed || ready ? '#66bb6a' : '#ffb74d'};` })
            ]),
            this.el('div', { class: 'quests-reward' },
              tr('quests.rewardLineXp', { coins: c.reward.coins, xp: c.reward.xp, items: itemStr ? ` · ${itemStr}` : '' })),
            this.el('button', {
              class: (ready ? 'btn btn-green btn-sm' : 'btn btn-sm') + ' quests-btn',
              disabled: ready ? null : 'disabled',
              onclick: () => { g.events.claimContract(g, c.id); this.renderModal(); }
            }, claimed ? [this.uiIcon('iconCheck', 14), tr('common.claimed')] : ready ? tr('quests.claimReward') : tr('quests.inProgressParen', { cur, req: c.target }))
          ]));
        });
      } else if (this.questFilter === 'npcs') {
        Abyssea.NPCS.forEach(npc => {
          const step = g.npcQuestProgress[npc.id] || 0;
          const q = npc.quests[step];
          const nPlot = g.world.getNpcPlot(npc);
          const questList = this.el('div', { class: 'quests-npc-list' });
          npc.quests.forEach((nq, qi) => {
            const isDone = qi < step;
            const isCurr = qi === step;
            questList.appendChild(this.el('div', {
              class: 'quests-npc-step',
              style: `background:${isCurr ? 'rgba(255,213,79,0.16)' : isDone ? 'rgba(24,48,34,0.68)' : 'rgba(20,26,44,0.82)'};border:1px solid ${isDone ? '#66bb6a' : isCurr ? '#ffd54f' : 'rgba(140,165,210,0.38)'};color:${isDone ? '#bdf5b9' : isCurr ? '#fff0b3' : '#d2dff0'};`
            }, [
              isDone ? this.uiIcon('iconCheck', 14) : (isCurr ? this.uiIcon('iconStar', 14) : this.uiIcon('iconLock', 14)),
              `${qi + 1}. ${nq.title}${isCurr ? ` — ${nq.desc}` : ''}`
            ]));
          });
          grid.appendChild(this.el('div', { class: 'card quests-card' }, [
            this.el('div', { class: 'card-head' }, [
              this.npcPortrait(npc.id, 46),
              this.el('div', {}, [
                this.el('strong', { class: 'quests-title' }, `${npc.name} (${Math.min(step, npc.quests.length)}/${npc.quests.length})`),
                this.el('div', { class: 'quests-npc-meta' }, tr('quests.biomePlot', { biome: BIOMES[npc.biome].name, x: nPlot[0], y: nPlot[1] }))
              ])
            ]),
            this.el('div', { class: 'quests-npc-active' }, q
              ? tr('quests.npcActive', { title: q.title, coins: q.reward.coins })
              : [this.uiIcon('iconCheck', 14), tr('quests.npcDone')]),
            questList
          ]));
        });
      } else {
        g.events.dailyChallenges.forEach(dc => {
          const ready = !dc.claimed && dc.progress >= dc.target;
          grid.appendChild(this.el('div', { class: 'card quests-card' + (ready ? ' selected' : '') + (dc.claimed ? ' is-done' : '') }, [
            this.el('strong', { class: 'quests-title', style: 'color:#ffe082;' }, dc.title),
            this.el('div', { class: 'quests-desc' }, `${dc.desc} (${dc.progress}/${dc.target})`),
            this.el('div', { class: 'quests-reward' }, tr('quests.dailyReward', { coins: dc.rewardCoins, xp: dc.rewardXp })),
            this.el('button', {
              class: 'btn btn-green btn-sm quests-btn',
              disabled: ready ? null : 'disabled',
              onclick: () => { g.events.claimChallenge(g, dc.id); this.renderModal(); }
            }, dc.claimed ? [this.uiIcon('iconCheck', 14), tr('common.claimed')] : ready ? tr('quests.claimReward') : tr('common.inProgress'))
          ]));
        });
      }
      body.appendChild(grid);
    }

    renderAchievements(body) {
      const g = this.game;
      if (g.events) g.events.checkProgress(g);
      const done = g.unlockedAchievements.length;
      const total = Abyssea.ACHIEVEMENTS.length;
      body.appendChild(this.el('div', { class: 'parchment-box', style: 'margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;' }, [
        this.el('div', {}, [
          this.el('strong', { style: 'font-size:16px;display:block;' }, tr('ach.boardTitle', { cur: done, tot: total })),
          this.el('span', { style: 'font-size:15px;line-height:1.48;' }, tr('ach.boardDesc'))
        ]),
        this.el('div', { class: 'skill-points-pill' }, `${Math.round((done / Math.max(1, total)) * 100)}%`)
      ]));

      const grid = this.el('div', { class: 'grid-cards' });
      Abyssea.ACHIEVEMENTS.forEach(ach => {
        const ok = g.unlockedAchievements.includes(ach.id);
        grid.appendChild(this.el('div', { class: 'card' + (ok ? ' selected' : ''), style: ok ? '' : 'opacity:0.74' }, [
          this.el('div', { class: 'card-head' }, [
            this.itemIcon(ok ? 'abyssea_core' : 'ancient_fragment', 30),
            this.el('strong', { style: `color:${ok ? '#a5e6a1' : '#eadfcf'};font-size:16px;` }, [
              ok ? this.uiIcon('iconCheck', 14) : null,
              ach.name
            ])
          ]),
          this.el('div', { style: 'font-size:15px;color:#f3e7d8;line-height:1.5;' }, ach.desc),
          this.el('div', { style: 'font-size:14px;color:#ffd54f;font-weight:700;' }, tr('ach.rewardCoins', { coins: ach.coins }))
        ]));
      });
      body.appendChild(grid);
    }

    renderEnchanting(body) {
      const g = this.game;
      if (!this.enchantTarget) this.enchantTarget = { kind: 'tool', id: 'pico' };

      body.appendChild(this.el('div', { class: 'parchment-box', style: 'margin-bottom:12px;' }, [
        this.el('strong', { style: 'font-size:16px;display:block;margin-bottom:3px;' }, tr('ench.tableTitle')),
        this.el('span', { style: 'font-size:15px;line-height:1.48;' }, tr('ench.tableDesc'))
      ]));

      // Owned tools & modular armor pieces (helm, armor, legs, shield, boots, ring, amulet)
      const ownedTools = Object.values(Abyssea.TOOLS).filter(t => Boolean(g.toolTiers[t.id]));
      const ownedArmors = Object.values(Abyssea.ITEMS).filter(it => {
        const slot = it.equipSlot === 'helmet' ? 'helm' : it.equipSlot;
        return ['armor', 'helm', 'legs', 'shield', 'boots', 'ring', 'amulet'].includes(slot) &&
          ((g.inventory[it.id] || 0) > 0 || g.equipped[slot] === it.id);
      });

      // Ensure valid default selection
      if (this.enchantTarget.kind === 'tool' && !g.toolTiers[this.enchantTarget.id]) {
        this.enchantTarget = ownedTools.length
          ? { kind: 'tool', id: ownedTools[0].id }
          : (ownedArmors.length ? { kind: 'armor', id: ownedArmors[0].id } : { kind: 'tool', id: '' });
      } else if (this.enchantTarget.kind === 'armor' && !ownedArmors.some(a => a.id === this.enchantTarget.id)) {
        this.enchantTarget = ownedTools.length
          ? { kind: 'tool', id: ownedTools[0].id }
          : { kind: 'armor', id: ownedArmors[0] ? ownedArmors[0].id : '' };
      }

      const selRow = this.el('div', { class: 'tab-row' });
      ownedTools.forEach(t => {
        const active = this.enchantTarget.kind === 'tool' && this.enchantTarget.id === t.id;
        selRow.appendChild(this.el('button', {
          class: 'tab-btn' + (active ? ' active' : ''),
          onclick: () => { this.enchantTarget = { kind: 'tool', id: t.id }; this.renderModal(); }
        }, [this.toolIcon(t.id, g.toolTiers[t.id], 18), ' ', t.name]));
      });
      ownedArmors.forEach(ar => {
        const active = this.enchantTarget.kind === 'armor' && this.enchantTarget.id === ar.id;
        selRow.appendChild(this.el('button', {
          class: 'tab-btn' + (active ? ' active' : ''),
          onclick: () => { this.enchantTarget = { kind: 'armor', id: ar.id }; this.renderModal(); }
        }, [this.itemIcon(ar.icon, 18), ' ', ar.name]));
      });
      body.appendChild(selRow);

      const tKind = this.enchantTarget.kind;
      const tId = this.enchantTarget.id;
      const table = tKind === 'armor' ? Abyssea.ARMOR_ENCHANTS : Abyssea.TOOL_ENCHANTS;
      const curStore = tKind === 'armor' ? (g.armorEnchants && g.armorEnchants[tId]) : (g.toolEnchants && g.toolEnchants[tId]);
      const curLevels = curStore || {};

      if (!tId || (tKind === 'tool' && (!Abyssea.TOOLS[tId] || !g.toolTiers[tId]))) {
        body.appendChild(this.el('div', { class: 'card' }, tr('ench.noGear')));
        return;
      }

      const targetTierMeta = Abyssea.TIER_META[g.toolTiers[tId]];
      const targetLabel = tKind === 'armor'
        ? (Abyssea.ITEMS[tId] ? Abyssea.ITEMS[tId].name : tId)
        : `${Abyssea.TOOLS[tId].name} (${targetTierMeta ? targetTierMeta.name : g.toolTiers[tId]})`;
      const appliedEntries = Object.entries(curLevels).filter(([, v]) => v > 0);
      const usedSlots = appliedEntries.length;
      const maxSlots = g.getMaxEnchantSlots ? g.getMaxEnchantSlots() : 3;
      const appliedText = appliedEntries
        .map(([eid, lvl]) => `${table[eid] ? table[eid].name : eid} ${tr('common.levelShort')}${lvl}`).join(' · ') || tr('ench.noneYet');
      const pipRow = this.el('span', { class: 'enchant-pip-row' },
        Array.from({ length: maxSlots }, (_, i) => this.el('span', { class: 'enchant-pip' + (i < usedSlots ? ' filled' : '') }))
      );

      body.appendChild(this.el('div', { class: 'card selected', style: 'margin-bottom:12px;' }, [
        this.el('strong', { style: 'font-size:16px;color:#ffd54f;' }, tr('ench.selected', { label: targetLabel })),
        this.el('div', { style: 'font-size:14px;color:#80f0ff;font-weight:800;display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:4px 0;' }, [
          tr('ench.slotsLine', { cur: usedSlots, max: maxSlots }),
          pipRow,
          maxSlots < 6 ? tr('ench.slotsExtra') : tr('ench.slotsMaxed')
        ]),
        this.el('div', { style: 'font-size:15px;line-height:1.48;color:#e4d3f5;font-weight:600;' }, tr('ench.activeList', { list: appliedText }))
      ]));

      const tableTier = g.getEnchantTableTier ? g.getEnchantTableTier() : 1;
      if (typeof this.renderRunicEnchantingAltar === 'function') {
        this.renderRunicEnchantingAltar(body, tKind, tId, table, curLevels, usedSlots, maxSlots, tableTier);
      }
      const grid = this.el('div', { class: 'grid-cards' });
      Object.values(table).forEach(ench => {
        const lvl = curLevels[ench.id] || 0;
        const maxed = lvl >= ench.maxLevel;
        const slotsFull = lvl === 0 && usedSlots >= maxSlots;
        const conflictName = g.getEnchantConflict ? g.getEnchantConflict(tKind, tId, ench.id) : null;
        const tierLocked = (ench.reqTier || 1) > tableTier;
        const cost = !maxed ? Abyssea.getEnchantCost(tKind, ench.id, lvl + 1) : null;
        const coinsOk = cost && g.coins >= cost.coins;
        const itemsOk = cost && Object.entries(cost.items).every(([id, q]) => (g.inventory[id] || 0) >= q);
        const can = Boolean(cost && coinsOk && itemsOk && !slotsFull && !conflictName && !tierLocked);

        const costBox = this.el('div', { style: 'font-size:14px;line-height:1.48;' });
        if (cost) {
          costBox.appendChild(this.el('div', { style: `color:${coinsOk ? '#ffd54f' : '#ff8a65'};font-weight:700;` }, tr('ench.coinsRow', { cur: g.coins, req: cost.coins })));
          Object.entries(cost.items).forEach(([id, q]) => {
            const have = g.inventory[id] || 0;
            const iName = Abyssea.ITEMS[id] ? Abyssea.ITEMS[id].name : id;
            costBox.appendChild(this.el('div', { style: `color:${have >= q ? '#81c784' : '#ff8a65'}` }, `${iName}: ${have}/${q}`));
          });
        }

        const enchIconMap = {
          eficiencia: 'crystal', fortuna: 'emerald', filo: 'ancient_fragment',
          toque_igneo: 'coal', alcance: 'magic_crystal', proteccion: 'armor_iron',
          vitalidad: 'relic_heart', espinas: 'bone', agilidad: 'leather', aura_luz: 'relic_lantern'
        };
        const incList = Array.isArray(ench.incompatibleWith) && ench.incompatibleWith.length
          ? ench.incompatibleWith.map(cid => (table[cid] ? table[cid].name : cid)).join(', ')
          : '';
        grid.appendChild(this.el('div', { class: 'card' + (lvl > 0 ? ' selected' : '') + ((conflictName || tierLocked) ? ' card-locked' : '') }, [
          this.el('div', { class: 'card-head' }, [
            this.itemIcon(ench.icon || enchIconMap[ench.id] || 'magic_crystal', 30),
            this.el('div', {}, [
              this.el('strong', { style: `color:${ench.color};font-size:16px;` }, ench.name),
              this.el('div', { style: 'font-size:14px;color:#f0e2cf;line-height:1.45;' }, tr('ench.lvlTable', { lvl, max: ench.maxLevel, req: ench.reqTier || 1 }))
            ])
          ]),
          this.el('div', { style: 'font-size:15px;color:#f8f1e4;line-height:1.5;' }, ench.desc),
          conflictName ? this.el('div', { class: 'ench-conflict-tag' }, tr('ench.incompat', { name: conflictName }))
            : incList ? this.el('div', { style: 'font-size:14px;color:#b0bec5;' }, tr('ench.exclusiveVs', { list: incList })) : null,
          costBox,
          maxed
            ? this.el('span', { style: 'color:#81c784;font-weight:800;font-size:14px;' }, [this.uiIcon('iconCheck', 14), tr('common.maxLevel')])
            : conflictName
              ? this.el('button', { class: 'btn btn-stone btn-sm', disabled: 'disabled' }, tr('common.incompatible'))
              : tierLocked
                ? this.el('button', { class: 'btn btn-stone btn-sm', disabled: 'disabled' }, tr('ench.reqTable', { lvl: ench.reqTier }))
                : slotsFull
                  ? this.el('button', { class: 'btn btn-stone btn-sm', disabled: 'disabled' }, tr('ench.slotsFullBtn', { cur: usedSlots, max: maxSlots }))
                  : this.el('button', {
                      class: can ? 'btn btn-green btn-sm' : 'btn btn-stone btn-sm',
                      disabled: can ? null : 'disabled',
                      onclick: () => { if (g.enchantItem(tKind, tId, ench.id)) this.renderModal(); }
                    }, tr('ench.enchantTo', { lvl: lvl + 1 }))
        ]));
      });
      body.appendChild(grid);
    }

    makeShrineThumb(spriteKey, fallbackIcon = 'ancient_fragment', size = 40) {
      const assets = Abyssea.Assets;
      const img = assets && assets.extraImages && assets.extraImages[spriteKey];
      if (!img || !img.complete || img.width <= 0) {
        return this.itemIcon(fallbackIcon, size);
      }
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      c.className = 'pixel-img';
      c.style.width = size + 'px';
      c.style.height = size + 'px';
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      const frameCounts = { healing_fountain: 4, fuente_sagrada: 4, ee_cauldron: 4, ee_caldero: 4, ee_fuente_mana: 4, well_mana_strip: 4, well_health_strip: 6, ee_lantern: 4, Campfire_Anim: 6, Fish_Pond: 4, prop_burning_tree: 4 };
      let sw = img.width;
      const sh = img.height;
      if (frameCounts[spriteKey] && img.width >= img.height * 1.8) sw = Math.max(1, Math.floor(img.width / frameCounts[spriteKey]));
      else if (img.width === 64 && img.height === 32) sw = 16;
      else if (img.width >= img.height * 2.5 && img.height > 0) sw = img.height;
      const aspect = sw / Math.max(1, sh);
      let dw = size - 4;
      let dh = dw / aspect;
      if (dh > size - 4) { dh = size - 4; dw = dh * aspect; }
      ctx.drawImage(img, 0, 0, sw, sh, (size - dw) / 2, (size - dh) / 2, dw, dh);
      return c;
    }

    getEncyclopediaTabDefs(g) {
      const totalRelics = Object.keys(Abyssea.PERMANENT_RELICS || {}).length;
      const foundRelics = g.encyclopedia && g.encyclopedia.relics ? g.encyclopedia.relics.size : (g.permanentRelics || []).length;
      const totalEnchants = Object.keys(Abyssea.TOOL_ENCHANTS || {}).length + Object.keys(Abyssea.ARMOR_ENCHANTS || {}).length;
      const foundEnchants = g.encyclopedia && g.encyclopedia.enchants ? g.encyclopedia.enchants.size : 0;
      const totalAltars = Object.keys(Abyssea.ALTAR_DEFS || {}).length + Object.keys(Abyssea.EASTER_EGG_DEFS || {}).length;
      const foundAltars = g.encyclopedia && g.encyclopedia.altars ? g.encyclopedia.altars.size : 0;
      return [
        ['items', tr('enc.tabItems', { cur: g.encyclopedia.items.size, tot: Object.keys(Abyssea.ITEMS).length })],
        ['enemies', tr('enc.tabEnemies', { cur: g.encyclopedia.enemies.size, tot: Object.keys(Abyssea.ENEMY_DEFS).length })],
        ['buildings', tr('enc.tabBuildings', { cur: g.encyclopedia.buildings.size, tot: Object.keys(Abyssea.BUILDINGS).length })],
        ['relics', tr('enc.tabRelics', { cur: foundRelics, tot: totalRelics })],
        ['enchants', tr('enc.tabEnchants', { cur: foundEnchants, tot: totalEnchants })],
        ['altars', tr('enc.tabAltars', { cur: foundAltars, tot: totalAltars })],
        ['lore', tr('enc.tabLore')]
      ];
    }

    renderEncyclopediaTabs(body) {
      const g = this.game;
      const tabs = this.el('div', { class: 'tab-row' });
      this.getEncyclopediaTabDefs(g).forEach(([id, lbl]) => {
        tabs.appendChild(this.el('button', {
          class: 'tab-btn' + (this.encycFilter === id ? ' active' : ''),
          onclick: () => { this.encycFilter = id; this.renderModal(); }
        }, lbl));
      });
      body.appendChild(tabs);
    }

    renderEncyclopediaExtra(body, filter) {
      const g = this.game;
      const grid = this.el('div', { class: 'grid-cards' });

      if (filter === 'relics') {
        const relics = Object.values(Abyssea.PERMANENT_RELICS || {});
        const ownedSet = new Set([...(g.permanentRelics || []), ...(g.encyclopedia && g.encyclopedia.relics ? Array.from(g.encyclopedia.relics) : [])]);
        body.appendChild(this.el('div', { class: 'parchment-box', style: 'margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;' }, [
          this.el('span', { style: 'font-size:14px;' }, tr('enc.relicsDesc')),
          this.el('strong', { style: 'font-size:14px;color:#ffe8a3;' }, tr('enc.obtainedCount', { cur: ownedSet.size, tot: relics.length }))
        ]));
        relics.forEach(rel => {
          const found = ownedSet.has(rel.id);
          const isSec = !!rel.isSecret || !rel.bossName;
          const bName = (rel.biome && BIOMES[rel.biome] && BIOMES[rel.biome].name) || rel.biome || '';
          const metaLine = isSec
            ? tr('enc.secretOrigin')
            : tr('enc.bossOrigin', { boss: rel.bossName || tr('hud.guardianDefault'), biome: bName });
          grid.appendChild(this.el('div', { class: 'card' + (found ? ' selected' : ''), style: found ? '' : 'opacity:0.8;' }, [
            this.el('div', { class: 'card-head' }, [
              this.itemIcon(rel.icon || 'relic_heart', 36),
              this.el('div', {}, [
                this.el('strong', { style: `color:${found ? (rel.color || '#ffd54f') : '#d7c5af'};font-size:16px;` }, found || !isSec ? rel.name : tr('enc.hiddenRelic')),
                this.el('div', { style: 'font-size:14px;color:#d6e9f8;line-height:1.45;' }, metaLine)
              ]),
              this.el('span', { class: 'rarity-tag', style: found ? 'background:#285432;color:#c8f7c5;margin-left:auto;' : 'background:#2b314d;color:#c7d0e0;margin-left:auto;' }, found ? tr('enc.obtainedTag') : tr('enc.undiscTag'))
            ]),
            this.el('p', { style: 'font-size:14px;color:#f5ece0;margin:6px 0 0;line-height:1.4;' }, found || !isSec ? rel.desc : tr('enc.hiddenRelicHint'))
          ]));
        });
      } else if (filter === 'enchants') {
        const allEnch = [
          ...Object.values(Abyssea.TOOL_ENCHANTS || {}),
          ...Object.values(Abyssea.ARMOR_ENCHANTS || {})
        ];
        const discSet = g.encyclopedia && g.encyclopedia.enchants ? g.encyclopedia.enchants : new Set();
        body.appendChild(this.el('div', { class: 'parchment-box', style: 'margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;' }, [
          this.el('span', { style: 'font-size:14px;' }, tr('enc.enchDesc')),
          this.el('strong', { style: 'font-size:14px;color:#ffe8a3;' }, tr('enc.inscribedCount', { cur: discSet.size, tot: allEnch.length }))
        ]));
        allEnch.forEach(ench => {
          const found = discSet.has(ench.id);
          const costItems = ench.costBase && ench.costBase.items
            ? Object.entries(ench.costBase.items).map(([k, v]) => `${v}x ${(Abyssea.ITEMS[k] && Abyssea.ITEMS[k].name) || k}`).join(', ')
            : '';
          grid.appendChild(this.el('div', { class: 'card' + (found ? ' selected' : ''), style: found ? '' : 'opacity:0.84;' }, [
            this.el('div', { class: 'card-head' }, [
              this.itemIcon(ench.icon || 'magic_crystal', 34),
              this.el('div', {}, [
                this.el('strong', { style: `color:${ench.color || '#ffd54f'};font-size:16px;` }, ench.name),
                this.el('div', { style: 'font-size:14px;color:#d6e9f8;line-height:1.45;' }, `${ench.target === 'tool' ? tr('ench.typeTool') : tr('ench.typeArmor')} · ${tr('common.maxLevelShort')}.${ench.maxLevel}`)
              ]),
              this.el('span', { class: 'rarity-tag', style: found ? 'background:#2e5b3f;color:#c8f7c5;margin-left:auto;' : 'background:#2b314d;color:#c7d0e0;margin-left:auto;' }, found ? tr('enc.inscribedTag') : tr('enc.catalogedTag'))
            ]),
            this.el('p', { style: 'font-size:15px;color:#f8f1e4;margin:6px 0 4px;line-height:1.5;' }, ench.desc),
            this.el('div', { style: 'font-size:14px;color:#ffe082;line-height:1.48;' }, tr('enc.baseCost', { coins: ench.costBase ? ench.costBase.coins : 0, items: costItems ? ` + ${costItems}` : '' }))
          ]));
        });
      } else if (filter === 'altars') {
        const altars = Object.values(Abyssea.ALTAR_DEFS || {}).map(a => Object.assign({ kindLabel: tr('enc.kindAltar'), biome: null }, a));
        const secrets = Object.values(Abyssea.EASTER_EGG_DEFS || {}).map(s => Object.assign({ kindLabel: tr('enc.kindSecret') }, s));
        const entries = [...altars, ...secrets];
        const discSet = g.encyclopedia && g.encyclopedia.altars ? g.encyclopedia.altars : new Set();
        body.appendChild(this.el('div', { class: 'parchment-box', style: 'margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;' }, [
          this.el('span', { style: 'font-size:14px;' }, tr('enc.altarsDesc')),
          this.el('strong', { style: 'font-size:14px;color:#ffe8a3;' }, tr('enc.discAltarsCount', { cur: discSet.size, tot: entries.length }))
        ]));
        entries.forEach(ent => {
          const found = discSet.has(ent.id);
          const subMeta = ent.biome ? `${ent.kindLabel} · ${(BIOMES[ent.biome] && BIOMES[ent.biome].name) || ent.biome}` : `${ent.kindLabel}${ent.cooldown ? tr('enc.rechargeSec', { sec: ent.cooldown }) : ''}`;
          grid.appendChild(this.el('div', { class: 'card' + (found ? ' selected' : ''), style: found ? '' : 'opacity:0.84;' }, [
            this.el('div', { class: 'card-head' }, [
              this.makeShrineThumb(ent.spriteKey, 'ancient_fragment', 42),
              this.el('div', {}, [
                this.el('strong', { style: `color:${ent.color || '#80deea'};font-size:16px;` }, ent.name),
                this.el('div', { style: 'font-size:14px;color:#d6e9f8;line-height:1.45;' }, subMeta)
              ]),
              this.el('span', { class: 'rarity-tag', style: found ? 'background:#285432;color:#c8f7c5;margin-left:auto;' : 'background:#2b314d;color:#c7d0e0;margin-left:auto;' }, found ? tr('enc.activatedTag') : tr('enc.toFindTag'))
            ]),
            this.el('p', { style: 'font-size:15px;color:#f8f1e4;margin:6px 0 4px;line-height:1.5;' }, ent.desc || ent.hint || ''),
            ent.effectDetail ? this.el('div', { style: 'font-size:14px;color:#80deea;font-weight:700;line-height:1.48;' }, tr('enc.effectLine', { detail: ent.effectDetail, dur: ent.durationText ? ` · ${ent.durationText}` : '' })) : null
          ]));
        });
      } else if (filter === 'lore') {
        const loreData = Abyssea.LORE || { chronicle: [], biomes: [] };
        body.appendChild(this.el('div', { class: 'parchment-box', style: 'margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;' }, [
          this.el('span', { style: 'font-size:14px;font-weight:600;' }, tr('enc.loreDesc')),
          this.el('strong', { style: 'font-size:14px;color:#ffe8a3;' }, tr('enc.loreCounts', { ch: loreData.chronicle.length, bm: loreData.biomes.length }))
        ]));
        (loreData.chronicle || []).forEach(ch => {
          grid.appendChild(this.el('div', { class: 'card selected' }, [
            this.el('div', { class: 'card-head' }, [
              this.itemIcon('ancient_fragment', 36),
              this.el('div', {}, [
                this.el('strong', { style: 'color:#ffe082;font-size:16px;' }, ch.title),
                this.el('div', { style: 'font-size:14px;color:#d6e9f8;line-height:1.45;' }, ch.era)
              ])
            ]),
            this.el('div', { style: 'font-size:14px;color:#ffd54f;font-weight:600;margin-top:4px;' }, ch.summary),
            this.el('p', { style: 'font-size:14px;color:#f5ece0;margin:6px 0 0;line-height:1.48;' }, ch.body)
          ]));
        });
        body.appendChild(grid);
        body.appendChild(this.el('div', { class: 'parchment-box', style: 'margin:14px 0 10px;' }, [
          this.el('strong', { style: 'font-size:16px;color:#ffe8a3;' }, tr('enc.biomesAtlasTitle'))
        ]));
        const bGrid = this.el('div', { class: 'grid-cards' });
        (loreData.biomes || []).forEach(bm => {
          bGrid.appendChild(this.el('div', { class: 'card' }, [
            this.el('div', { class: 'card-head' }, [
              this.biomeIcon(bm.id, 30),
              this.el('div', {}, [
                this.el('strong', { style: 'color:#fff3d6;font-size:16px;' }, bm.name),
                this.el('div', { style: 'font-size:14px;color:#ffd54f;font-weight:600;line-height:1.45;' }, bm.minerals)
              ])
            ]),
            this.el('p', { style: 'font-size:14px;color:#e8dccb;margin:6px 0 0;line-height:1.45;' }, bm.desc)
          ]));
        });
        body.appendChild(bGrid);
        return;
      }

      body.appendChild(grid);
    }

    renderEncyclopedia(body) {
      const g = this.game;
      if (typeof g.syncEncyclopedia === 'function') g.syncEncyclopedia();
      if (['relics', 'enchants', 'altars', 'lore'].includes(this.encycFilter)) {
        this.renderEncyclopediaTabs(body);
        this.renderEncyclopediaExtra(body, this.encycFilter);
        return;
      }
      const tabs = this.el('div', { class: 'tab-row' });
      this.getEncyclopediaTabDefs(g).forEach(([id, lbl]) => {
        tabs.appendChild(this.el('button', {
          class: 'tab-btn' + (this.encycFilter === id ? ' active' : ''),
          onclick: () => { this.encycFilter = id; this.renderModal(); }
        }, lbl));
      });
      body.appendChild(tabs);

      const grid = this.el('div', { class: 'grid-cards' });
      const applyEncycSearch = (q) => {
        this.encycSearch = q;
        const needle = (q || '').trim().toLowerCase();
        Array.from(grid.children).forEach(ch => {
          const txt = (ch.textContent || '').toLowerCase();
          ch.style.display = (!needle || txt.includes(needle)) ? '' : 'none';
        });
      };
      body.appendChild(this._buildSearchBar(this.encycSearch, tr('enc.searchPlaceholder'), applyEncycSearch));
      if (this.encycFilter === 'items') {
        Object.values(Abyssea.ITEMS).forEach(it => {
          const found = g.encyclopedia.items.has(it.id);
          grid.appendChild(this.el('div', { class: 'card', style: found ? '' : 'opacity:0.5' }, [
            this.el('div', { class: 'card-head' }, [
              this.itemIcon(it.icon, 28),
              this.el('strong', {}, found ? it.name : '???')
            ]),
            this.el('div', { style: 'font-size:14px;color:#dce8f5;line-height:1.48;' }, found ? it.source : tr('enc.itemHint'))
          ]));
        });
      } else if (this.encycFilter === 'enemies') {
        // RC2 (#2): Interactive Bestiary with Silhouettes, Exact Drops & Mastery Bonuses (25/100/250 kills)
        Object.values(Abyssea.ENEMY_DEFS).forEach(en => {
          const found = g.encyclopedia.enemies.has(en.id);
          const bm = typeof g.getBestiaryMastery === 'function' ? g.getBestiaryMastery(en.id) : { kills: 0, tier: 0, nextTarget: 25, dmgBonus: 0, dropBonus: 0 };
          const thumb = this.makeEnemyThumb(en, 42);
          if (!found && thumb) thumb.style.filter = 'brightness(0) contrast(1.2)';
          const dropsText = found && en.drops
            ? (Array.isArray(en.drops)
                ? en.drops.map(d => (Abyssea.ITEMS[d.id] && Abyssea.ITEMS[d.id].name) || d.id)
                : Object.keys(en.drops).map(k => (Abyssea.ITEMS[k] && Abyssea.ITEMS[k].name) || k)
              ).filter(Boolean).join(', ')
            : '';
          const tierColors = ['#78909c', '#69f0ae', '#4fc3f7', '#ffd54f'];
          const tierLabels = ['Sin Maestría', 'Maestría I', 'Maestría II', 'Maestría III (MAX)'];
          grid.appendChild(this.el('div', {
            class: 'card',
            style: `border-color:${found ? tierColors[bm.tier] : '#37474f'};opacity:${found ? 1 : 0.62};`
          }, [
            this.el('div', { class: 'card-head' }, [
              thumb,
              this.el('div', {}, [
                this.el('strong', { style: `color:${found ? (en.color || '#ffd54f') : '#90a4ae'}` }, found ? en.name : tr('enc.unknownCreature')),
                this.el('div', { style: 'font-size:13px;color:#dce8f5;line-height:1.4;' }, en.nocturnal ? tr('enc.nocturnalCreature') : ((BIOMES[en.biome] && BIOMES[en.biome].name) || en.biome)),
                found ? this.el('div', { style: `font-size:12px;color:${tierColors[bm.tier]};font-weight:bold;` }, `${tierLabels[bm.tier]} · Bajas: ${bm.kills}/${bm.nextTarget}`) : null
              ])
            ]),
            this.el('div', { style: 'font-size:13px;color:#efe8db;line-height:1.45;' }, found ? tr('enc.enemyStats', { hp: en.hp, dmg: en.dmg, coins: Array.isArray(en.coins) ? `${en.coins[0]}–${en.coins[1]}` : en.coins }) : tr('enc.enemyHint')),
            found && dropsText ? this.el('div', { style: 'font-size:12px;color:#80cbc4;margin-top:3px;' }, `Botín: ${dropsText}`) : null,
            found && bm.tier > 0 ? this.el('div', { style: 'font-size:12px;color:#ffd54f;margin-top:2px;' }, `Bono Permanente: +${Math.round(bm.dmgBonus * 100)}% Daño y +${Math.round(bm.dropBonus * 100)}% Drops`) : null
          ]));
        });
      } else {
        Object.values(Abyssea.BUILDINGS).forEach(b => {
          const found = g.encyclopedia.buildings.has(b.id);
          grid.appendChild(this.el('div', { class: 'card', style: found ? '' : 'opacity:0.5' }, [
            this.el('div', { class: 'card-head' }, [
              this.makeBuildingThumb(b, 36),
              this.el('strong', {}, found ? b.name : tr('enc.unbuiltBlueprint'))
            ]),
            this.el('div', { style: 'font-size:14px;color:#dce8f5;line-height:1.48;' }, found ? b.desc : tr('enc.buildingHint'))
          ]));
        });
      }
      if (this.encycSearch) applyEncycSearch(this.encycSearch);
      body.appendChild(grid);
    }

    _syncPauseModalClasses(isSettings) {
      const mbox = document.getElementById('modal-box');
      if (!mbox) return;
      mbox.classList.add('pause-pixel-modal');
      mbox.classList.toggle('pause-root-compact', !isSettings);
      mbox.classList.toggle('pause-settings-compact', !!isSettings);
      const mtitle = document.getElementById('modal-title');
      if (mtitle) mtitle.textContent = isSettings ? tr('settings.title') : tr('pause.title');
    }

    _buildAudioCard() {
      const masterPct = Math.round((Abyssea.Audio.masterVolume ?? 1.0) * 100);
      const musicPct = Math.round(Abyssea.Audio.musicVolume * 100);
      const sfxPct = Math.round(Abyssea.Audio.sfxVolume * 100);
      const mastVal = this.el('span', { class: 'compact-audio-pct' }, `${masterPct}%`);
      const mVal = this.el('span', { class: 'compact-audio-pct' }, `${musicPct}%`);
      const sVal = this.el('span', { class: 'compact-audio-pct' }, `${sfxPct}%`);
      const mastFill = this.el('div', { class: 'pixel-slider-fill', style: `width:${masterPct}%` });
      const mFill = this.el('div', { class: 'pixel-slider-fill', style: `width:${musicPct}%` });
      const sFill = this.el('div', { class: 'pixel-slider-fill', style: `width:${sfxPct}%` });
      return this.el('div', { class: 'card pause-audio-card' }, [
        this.el('div', { class: 'settings-section-head' }, tr('settings.audioHeader')),
        this.el('div', { class: 'compact-audio-row' }, [
          this.el('span', { class: 'compact-audio-lbl' }, tr('settings.master')),
          this.el('div', { class: 'pixel-range-wrap' }, [
            this.el('div', { class: 'pixel-slider-track' }, [mastFill]),
            this.el('input', {
              type: 'range', class: 'pixel-range', min: 0, max: 1, step: 0.05, value: Abyssea.Audio.masterVolume ?? 1.0,
              oninput: (e) => {
                const v = Number(e.target.value);
                if (typeof Abyssea.Audio.setMasterVolume === 'function') {
                  Abyssea.Audio.setMasterVolume(v);
                } else {
                  Abyssea.Audio.masterVolume = v;
                  Abyssea.Audio.applyVolumes();
                  Abyssea.Audio.savePrefs();
                }
                const pct = Math.round(v * 100);
                mastVal.textContent = `${pct}%`;
                mastFill.style.width = `${pct}%`;
              }
            })
          ]),
          mastVal
        ]),
        this.el('div', { class: 'compact-audio-row' }, [
          this.el('span', { class: 'compact-audio-lbl' }, tr('settings.music')),
          this.el('div', { class: 'pixel-range-wrap' }, [
            this.el('div', { class: 'pixel-slider-track' }, [mFill]),
            this.el('input', {
              type: 'range', class: 'pixel-range', min: 0, max: 1, step: 0.05, value: Abyssea.Audio.musicVolume,
              oninput: (e) => {
                const v = Number(e.target.value);
                Abyssea.Audio.setMusicVolume(v);
                const pct = Math.round(v * 100);
                mVal.textContent = `${pct}%`;
                mFill.style.width = `${pct}%`;
              }
            })
          ]),
          mVal
        ]),
        this.el('div', { class: 'compact-audio-row' }, [
          this.el('span', { class: 'compact-audio-lbl' }, tr('settings.sfx')),
          this.el('div', { class: 'pixel-range-wrap' }, [
            this.el('div', { class: 'pixel-slider-track' }, [sFill]),
            this.el('input', {
              type: 'range', class: 'pixel-range', min: 0, max: 1, step: 0.05, value: Abyssea.Audio.sfxVolume,
              oninput: (e) => {
                const v = Number(e.target.value);
                Abyssea.Audio.setSfxVolume(v);
                const pct = Math.round(v * 100);
                sVal.textContent = `${pct}%`;
                sFill.style.width = `${pct}%`;
              }
            })
          ]),
          sVal
        ]),
        this.el('div', { class: 'audio-mute-grid' }, [
          this.el('button', {
            id: 'btn-toggle-music-mute',
            class: Abyssea.Audio.musicMuted ? 'btn btn-danger btn-sm' : 'btn btn-green btn-sm',
            onclick: () => {
              Abyssea.Audio.setMusicMuted(!Abyssea.Audio.musicMuted);
              this.renderModal();
            }
          }, tr('settings.musicBtn', { state: Abyssea.Audio.musicMuted ? tr('common.off') : tr('common.on') })),
          this.el('button', {
            id: 'btn-toggle-sfx-mute',
            class: Abyssea.Audio.sfxMuted ? 'btn btn-danger btn-sm' : 'btn btn-green btn-sm',
            onclick: () => {
              Abyssea.Audio.setSfxMuted(!Abyssea.Audio.sfxMuted);
              this.renderModal();
            }
          }, tr('settings.sfxBtn', { state: Abyssea.Audio.sfxMuted ? tr('common.off') : tr('common.on') })),
          this.el('button', {
            id: 'btn-toggle-master-mute',
            class: Abyssea.Audio.muted ? 'btn btn-green btn-sm' : 'btn btn-primary btn-sm',
            style: 'display:inline-flex;align-items:center;justify-content:center;gap:6px;',
            onclick: () => {
              Abyssea.Audio.setMuted(!Abyssea.Audio.muted);
              this.renderModal();
            }
          }, [
            this.el('img', { class: 'pixel-img', src: encodeURI(Abyssea.Audio.muted ? Abyssea.UI_URLS.iconMute : Abyssea.UI_URLS.iconSound), width: 16, height: 16, alt: '' }),
            Abyssea.Audio.muted ? tr('settings.unmuteAll') : tr('settings.muteAll')
          ])
        ]),
        (() => {
          const themeOptions = (typeof Abyssea.Audio.getAvailableThemes === 'function')
            ? Abyssea.Audio.getAvailableThemes()
            : [
                { id: 'adventure', key: 'settings.musicThemeAdv', descKey: 'settings.musicThemeAdvDesc' },
                { id: 'chill', key: 'settings.musicThemeChill', descKey: 'settings.musicThemeChillDesc' },
                { id: 'lofi', key: 'settings.musicThemeLofi', descKey: 'settings.musicThemeLofiDesc' },
                { id: 'meadow', key: 'settings.musicThemeMeadow', descKey: 'settings.musicThemeMeadowDesc' }
              ];

          const curThemeId = (typeof Abyssea.Audio.getMusicTheme === 'function')
            ? Abyssea.Audio.getMusicTheme()
            : (Abyssea.Audio.musicTheme || 'adventure');

          let themeIdx = themeOptions.findIndex(t => t.id === curThemeId);
          if (themeIdx < 0) themeIdx = 0;
          const curTheme = themeOptions[themeIdx];

          const setMusicThemeAt = (idx) => {
            const nextIdx = (idx + themeOptions.length) % themeOptions.length;
            const nextTheme = themeOptions[nextIdx];
            if (typeof Abyssea.Audio.setMusicTheme === 'function') {
              Abyssea.Audio.setMusicTheme(nextTheme.id);
            } else {
              Abyssea.Audio.musicTheme = nextTheme.id;
              Abyssea.Audio.savePrefs();
              Abyssea.Audio.startMusic(true);
            }
            this.renderModal();
          };

          return this.el('div', { style: 'margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1);' }, [
            this.el('div', { class: 'water-carousel-row compact-speed' }, [
              this.el('span', { class: 'carousel-row-label' }, tr('settings.musicThemeHeader')),
              this.el('div', { class: 'carousel-controls' }, [
                this.el('button', {
                  id: 'btn-music-theme-prev',
                  type: 'button',
                  class: 'arrow-pick-btn',
                  title: tr('settings.prevOption'),
                  onclick: () => setMusicThemeAt(themeIdx - 1)
                }, [
                  this.el('img', { class: 'pixel-img', src: encodeURI(Abyssea.UI_URLS.arrowLeft), width: 16, height: 16, alt: '<' })
                ]),
                this.el('div', {
                  class: 'water-preview-box',
                  style: 'min-width: 175px; cursor: pointer;',
                  title: tr('settings.nextOption'),
                  onclick: () => setMusicThemeAt(themeIdx + 1)
                }, [
                  this.el('div', { class: 'water-preview-meta' }, [
                    this.el('span', { class: 'water-preview-name' }, tr(curTheme.key)),
                    this.el('span', { class: 'water-preview-idx' }, `${themeIdx + 1}/${themeOptions.length}`)
                  ])
                ]),
                this.el('button', {
                  id: 'btn-music-theme-next',
                  type: 'button',
                  class: 'arrow-pick-btn',
                  title: tr('settings.nextOption'),
                  onclick: () => setMusicThemeAt(themeIdx + 1)
                }, [
                  this.el('img', { class: 'pixel-img', src: encodeURI(Abyssea.UI_URLS.arrowRight), width: 16, height: 16, alt: '>' })
                ])
              ])
            ]),
            this.el('div', {
              class: 'settings-hint',
              style: 'text-align: right; margin-top: 5px; font-size: 13px; color: #a8c2db; font-style: italic;'
            }, tr(curTheme.descKey))
          ]);
        })(),
        (() => {
          const mediaOn = Abyssea.MediaOverlay && typeof Abyssea.MediaOverlay.isEnabled === 'function'
            ? Abyssea.MediaOverlay.isEnabled()
            : false;
          const chk = this.el('input', {
            id: 'chk-media-overlay',
            type: 'checkbox',
            class: 'pixel-check-switch',
            checked: mediaOn ? 'checked' : null,
            onchange: (e) => {
              const checked = !!e.target.checked;
              if (Abyssea.MediaOverlay && typeof Abyssea.MediaOverlay.setEnabled === 'function') {
                Abyssea.MediaOverlay.setEnabled(checked);
              }
              this.renderModal();
            }
          });
          return this.el('div', { class: 'media-setting-block' }, [
            this.el('label', { class: 'media-overlay-setting-row', for: 'chk-media-overlay' }, [
              this.el('span', { class: 'media-setting-label-wrap' }, [
                this.el('span', { class: 'media-setting-title' }, tr('settings.mediaOverlay')),
                this.el('span', { class: 'media-setting-sub' }, tr('settings.mediaOverlayDesc'))
              ]),
              this.el('span', { class: 'media-setting-control' }, [
                chk,
                this.el('img', {
                  class: 'setting-toggle-img',
                  src: mediaOn ? Abyssea.UI_URLS.toggleOn : Abyssea.UI_URLS.toggleOff,
                  alt: mediaOn ? tr('common.on') : tr('common.off')
                })
              ])
            ])
          ]);
        })()
      ]);
    }

    _buildControlsCard() {
      const grid = this.el('div', { class: 'keybinds-grid' });
      KEYBIND_DEFS.forEach(def => {
        const waiting = this.rebindingAction === def.id;
        grid.appendChild(this.el('div', { class: 'keybind-row' }, [
          this.el('span', { class: 'keybind-name' }, tr(def.key)),
          this.el('button', {
            type: 'button',
            'data-rebind-action': def.id,
            class: 'keybind-btn' + (waiting ? ' waiting' : ''),
            onclick: () => {
              this.rebindingAction = waiting ? null : def.id;
              this.renderModal();
            }
          }, waiting ? tr('settings.pressKey') : this.getKeyLabel(def.id))
        ]));
      });

      return this.el('div', { class: 'card keybinds-card' }, [
        this.el('div', { style: 'display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px;' }, [
          this.el('strong', { class: 'settings-section-head', style: 'margin:0;' }, tr('settings.controlsHeader')),
          this.el('div', { style: 'display:flex;gap:6px;' }, [
            this.el('button', {
              id: 'btn-reset-tutorial',
              type: 'button',
              class: 'btn btn-gold btn-sm',
              title: 'Reiniciar tutorial guiado',
              onclick: () => {
                if (this.game && this.game.tutorialSys) {
                  this.game.tutorialSys.reset(this.game);
                  this.updateHUD(true);
                  this.renderModal();
                }
              }
            }, 'Reiniciar Tutorial'),
            this.el('button', {
              id: 'btn-reset-keybinds',
              type: 'button',
              class: 'btn btn-danger btn-sm',
              onclick: () => {
                this.resetKeybinds();
                this.renderModal();
              }
            }, [this.uiIcon('iconReset', 15), tr('settings.resetControls')])
          ])
        ]),
        this.el('div', { class: 'settings-hint' }, tr('settings.controlsTip')),
        grid
      ]);
    }

    _buildVisualSettingsCard() {
      const g = this.game;
      g.settings = g.settings || {
        screenShake: true, waterAnim: true, waterStyle: 'clasico', waterSpeed: 'normal',
        treeSway: true, particles: true, floatingText: true, showHitbox: true,
        lang: Abyssea.I18n ? Abyssea.I18n.getLanguage() : 'en',
        uiScale: this.getUiScale()
      };
      if (!g.settings.waterStyle) g.settings.waterStyle = 'clasico';
      if (!g.settings.waterSpeed) g.settings.waterSpeed = 'normal';

      const saveSettings = () => {
        if (g.started && g.saveSys) g.saveSys.save(g, g.currentSlot || 1, true);
      };

      const langs = (Abyssea.I18n && Abyssea.I18n.SUPPORTED_LANGS) || ['en', 'es'];
      const curLang = Abyssea.I18n ? Abyssea.I18n.getLanguage() : 'en';
      let langIdx = langs.indexOf(curLang);
      if (langIdx < 0) langIdx = 0;
      const setLangAt = (idx) => {
        const nextLang = langs[(idx + langs.length) % langs.length];
        g.settings.lang = nextLang;
        if (Abyssea.I18n) Abyssea.I18n.setLanguage(nextLang);
        saveSettings();
      };
      const langCarousel = this.el('div', { class: 'water-carousel-row compact-speed' }, [
        this.el('span', { class: 'carousel-row-label' }, tr('settings.language')),
        this.el('div', { class: 'carousel-controls' }, [
          this.el('button', {
            id: 'btn-lang-prev',
            type: 'button',
            class: 'arrow-pick-btn',
            title: tr('settings.prevOption'),
            onclick: () => setLangAt(langIdx - 1)
          }, [
            this.el('img', { class: 'pixel-img', src: encodeURI(Abyssea.UI_URLS.arrowLeft), width: 16, height: 16, alt: '<' })
          ]),
          this.el('span', { id: 'settings-lang-readout', class: 'water-speed-value' }, curLang === 'es' ? tr('lang.es') : tr('lang.en')),
          this.el('button', {
            id: 'btn-lang-next',
            type: 'button',
            class: 'arrow-pick-btn',
            title: tr('settings.nextOption'),
            onclick: () => setLangAt(langIdx + 1)
          }, [
            this.el('img', { class: 'pixel-img', src: encodeURI(Abyssea.UI_URLS.arrowRight), width: 16, height: 16, alt: '>' })
          ])
        ])
      ]);

      const curScale = this.getUiScale();
      let scaleIdx = UI_SCALES.indexOf(curScale);
      if (scaleIdx < 0) scaleIdx = UI_SCALES.indexOf(1);
      const scaleCarousel = this.el('div', { class: 'water-carousel-row compact-speed' }, [
        this.el('span', { class: 'carousel-row-label' }, tr('settings.uiScale')),
        this.el('div', { class: 'carousel-controls' }, [
          this.el('button', {
            id: 'btn-ui-scale-prev',
            type: 'button',
            class: 'arrow-pick-btn',
            title: tr('settings.prevOption'),
            disabled: scaleIdx <= 0 ? 'disabled' : null,
            onclick: () => {
              if (scaleIdx <= 0) return;
              this.applyUiScale(UI_SCALES[scaleIdx - 1], { persist: true });
              saveSettings();
              this.renderModal();
            }
          }, [
            this.el('img', { class: 'pixel-img', src: encodeURI(Abyssea.UI_URLS.arrowLeft), width: 16, height: 16, alt: '<' })
          ]),
          this.el('span', { id: 'ui-scale-readout', class: 'water-speed-value' }, `${curScale}x`),
          this.el('button', {
            id: 'btn-ui-scale-next',
            type: 'button',
            class: 'arrow-pick-btn',
            title: tr('settings.nextOption'),
            disabled: scaleIdx >= UI_SCALES.length - 1 ? 'disabled' : null,
            onclick: () => {
              if (scaleIdx >= UI_SCALES.length - 1) return;
              this.applyUiScale(UI_SCALES[scaleIdx + 1], { persist: true });
              saveSettings();
              this.renderModal();
            }
          }, [
            this.el('img', { class: 'pixel-img', src: encodeURI(Abyssea.UI_URLS.arrowRight), width: 16, height: 16, alt: '>' })
          ])
        ])
      ]);

      const isFullscreen = this.isDisplayFullscreen();
      const toggleDisplayMode = () => {
        this.toggleDisplayMode().finally(() => {
          saveSettings();
          if (this.hasOpenModal()) this.renderModal();
        });
      };
      const displayCarousel = this.el('div', { class: 'water-carousel-row compact-speed' }, [
        this.el('span', { class: 'carousel-row-label' }, tr('settings.displayMode')),
        this.el('div', { class: 'carousel-controls' }, [
          this.el('button', {
            id: 'btn-display-mode-prev',
            type: 'button',
            class: 'arrow-pick-btn',
            title: tr('settings.prevOption'),
            onclick: toggleDisplayMode
          }, [
            this.el('img', { class: 'pixel-img', src: encodeURI(Abyssea.UI_URLS.arrowLeft), width: 16, height: 16, alt: '<' })
          ]),
          this.el('span', { id: 'display-mode-readout', class: 'water-speed-value' }, isFullscreen ? tr('settings.fullscreen') : tr('settings.windowed')),
          this.el('button', {
            id: 'btn-display-mode-next',
            type: 'button',
            class: 'arrow-pick-btn',
            title: tr('settings.nextOption'),
            onclick: toggleDisplayMode
          }, [
            this.el('img', { class: 'pixel-img', src: encodeURI(Abyssea.UI_URLS.arrowRight), width: 16, height: 16, alt: '>' })
          ])
        ])
      ]);

      const waterOpts = [
        { id: 'clasico', label: tr('settings.waterClassic'), img: Abyssea.UI_URLS.waterClasico },
        { id: 'profundo', label: tr('settings.waterDeep'), img: Abyssea.UI_URLS.waterProfundo },
        { id: 'esmeralda', label: tr('settings.waterEmerald'), img: Abyssea.UI_URLS.waterEsmeralda },
        { id: 'abisal', label: tr('settings.waterAbyssal'), img: Abyssea.UI_URLS.waterAbisal }
      ];
      let waterIdx = waterOpts.findIndex(o => o.id === g.settings.waterStyle);
      if (waterIdx < 0) waterIdx = 0;
      const curWater = waterOpts[waterIdx];

      const waterCarousel = this.el('div', { class: 'water-carousel-row' }, [
        this.el('span', { class: 'carousel-row-label' }, tr('settings.waterStyle')),
        this.el('div', { class: 'carousel-controls' }, [
          this.el('button', {
            id: 'btn-water-style-prev',
            type: 'button',
            class: 'arrow-pick-btn',
            title: tr('settings.prevOption'),
            onclick: () => {
              const nextIdx = (waterIdx - 1 + waterOpts.length) % waterOpts.length;
              g.settings.waterStyle = waterOpts[nextIdx].id;
              saveSettings();
              this.renderModal();
            }
          }, [
            this.el('img', { class: 'pixel-img', src: encodeURI(Abyssea.UI_URLS.arrowLeft), width: 16, height: 16, alt: '<' })
          ]),
          this.el('div', { class: 'water-preview-box' }, [
            this.el('div', { class: 'water-preview-meta' }, [
              this.el('span', { class: 'water-preview-name' }, curWater.label),
              this.el('span', { class: 'water-preview-idx' }, `${waterIdx + 1}/${waterOpts.length}`)
            ])
          ]),
          this.el('button', {
            id: 'btn-water-style-next',
            type: 'button',
            class: 'arrow-pick-btn',
            title: tr('settings.nextOption'),
            onclick: () => {
              const nextIdx = (waterIdx + 1) % waterOpts.length;
              g.settings.waterStyle = waterOpts[nextIdx].id;
              saveSettings();
              this.renderModal();
            }
          }, [
            this.el('img', { class: 'pixel-img', src: encodeURI(Abyssea.UI_URLS.arrowRight), width: 16, height: 16, alt: '>' })
          ])
        ])
      ]);

      const speedOpts = [
        { id: 'lenta', label: tr('settings.waveSlow') },
        { id: 'normal', label: tr('settings.waveNormal') },
        { id: 'rapida', label: tr('settings.waveFast') },
        { id: 'tormenta', label: tr('settings.waveStorm') }
      ];
      let speedIdx = speedOpts.findIndex(o => o.id === g.settings.waterSpeed);
      if (speedIdx < 0) speedIdx = 1;
      const curSpeed = speedOpts[speedIdx];

      const speedCarousel = this.el('div', { class: 'water-carousel-row compact-speed' }, [
        this.el('span', { class: 'carousel-row-label' }, tr('settings.waves')),
        this.el('div', { class: 'carousel-controls' }, [
          this.el('button', {
            id: 'btn-water-speed-prev',
            type: 'button',
            class: 'arrow-pick-btn',
            title: tr('settings.prevOption'),
            onclick: () => {
              const nextIdx = (speedIdx - 1 + speedOpts.length) % speedOpts.length;
              g.settings.waterSpeed = speedOpts[nextIdx].id;
              saveSettings();
              this.renderModal();
            }
          }, [
            this.el('img', { class: 'pixel-img', src: encodeURI(Abyssea.UI_URLS.arrowLeft), width: 16, height: 16, alt: '<' })
          ]),
          this.el('span', { class: 'water-speed-value' }, curSpeed.label),
          this.el('button', {
            id: 'btn-water-speed-next',
            type: 'button',
            class: 'arrow-pick-btn',
            title: tr('settings.nextOption'),
            onclick: () => {
              const nextIdx = (speedIdx + 1) % speedOpts.length;
              g.settings.waterSpeed = speedOpts[nextIdx].id;
              saveSettings();
              this.renderModal();
            }
          }, [
            this.el('img', { class: 'pixel-img', src: encodeURI(Abyssea.UI_URLS.arrowRight), width: 16, height: 16, alt: '>' })
          ])
        ])
      ]);

      const items = [
        ['screenShake', tr('settings.screenShake')],
        ['waterAnim', tr('settings.waterAnim')],
        ['treeSway', tr('settings.treeSway')],
        ['particles', tr('settings.particles')],
        ['floatingText', tr('settings.floatingText')],
        ['showHitbox', tr('settings.showHitbox')]
      ];
      const grid = this.el('div', { class: 'settings-toggle-grid' });
      items.forEach(([key, label]) => {
        const on = g.settings[key] !== false;
        grid.appendChild(this.el('button', {
          type: 'button',
          class: 'setting-chip',
          onclick: () => {
            g.settings[key] = !on;
            saveSettings();
            this.renderModal();
          }
        }, [
          this.el('span', {}, label),
          this.el('img', {
            class: 'setting-toggle-img',
            src: on ? Abyssea.UI_URLS.toggleOn : Abyssea.UI_URLS.toggleOff,
            alt: on ? tr('common.on') : tr('common.off')
          })
        ]));
      });

      return this.el('div', { class: 'card pause-audio-card' }, [
        this.el('div', { class: 'settings-section-head' }, tr('settings.visualHeader')),
        langCarousel,
        scaleCarousel,
        displayCarousel,
        waterCarousel,
        speedCarousel,
        grid
      ]);
    }

    _buildSettingsView(isTitle) {
      this._syncPauseModalClasses(true);
      const tab = ['sonido', 'visuales', 'controles'].includes(this.settingsTab) ? this.settingsTab : 'sonido';
      this.settingsTab = tab;

      const tabsBar = this.el('div', { class: 'settings-tabs-bar' }, [
        this.el('button', {
          id: 'btn-tab-sonido',
          type: 'button',
          class: tab === 'sonido' ? 'btn btn-gold settings-tab-btn active' : 'btn btn-stone settings-tab-btn',
          onclick: () => { this.settingsTab = 'sonido'; this.renderModal(); }
        }, tr('settings.tabSound')),
        this.el('button', {
          id: 'btn-tab-visuales',
          type: 'button',
          class: tab === 'visuales' ? 'btn btn-gold settings-tab-btn active' : 'btn btn-stone settings-tab-btn',
          onclick: () => { this.settingsTab = 'visuales'; this.renderModal(); }
        }, tr('settings.tabVisuals')),
        this.el('button', {
          id: 'btn-tab-controles',
          type: 'button',
          class: tab === 'controles' ? 'btn btn-gold settings-tab-btn active' : 'btn btn-stone settings-tab-btn',
          onclick: () => { this.settingsTab = 'controles'; this.renderModal(); }
        }, tr('settings.tabControls'))
      ]);

      const tabBody = tab === 'visuales'
        ? this._buildVisualSettingsCard()
        : (tab === 'controles' ? this._buildControlsCard() : this._buildAudioCard());

      return this.el('div', { class: 'pause-stack settings-stack' }, [
        tabsBar,
        tabBody,
        this.el('button', {
          id: 'btn-settings-back',
          type: 'button',
          class: 'btn btn-gold pause-big-btn',
          onclick: () => {
            if (isTitle) {
              this.closeModal();
            } else {
              this.pauseView = 'root';
              this.renderModal();
            }
          }
        }, tr('common.back'))
      ]);
    }

    renderTitleAudioSettings(body) {
      body.appendChild(this._buildSettingsView(true));
    }

    renderCreditsModal(body) {
      body.appendChild(this.el('div', { class: 'pause-stack credits-box' }, [
        this.el('div', { class: 'card credits-card' }, [
          this.el('img', {
            class: 'credits-logo-img pixel-img',
            src: 'assets/ui/abyssea_logo.png?v=2.0.0-rc2',
            alt: 'ABYSSEA'
          }),
          this.el('div', { class: 'credits-role' }, tr('credits.developedBy')),
          this.el('div', { class: 'credits-creator' }, tr('credits.creator')),
          this.el('div', { class: 'credits-studio' }, tr('credits.studio')),
          this.el('div', { class: 'credits-music-attr' }, [
            this.el('strong', {}, tr('credits.musicLabel')),
            this.el('span', {}, tr('credits.musicAttribution'))
          ])
        ]),
        this.el('button', {
          id: 'btn-credits-back',
          type: 'button',
          class: 'btn btn-gold pause-big-btn',
          onclick: () => this.closeModal()
        }, tr('common.back'))
      ]));
    }

    renderPatchNotesModal(body) {
      const isEn = Abyssea.I18n && Abyssea.I18n.getLanguage && Abyssea.I18n.getLanguage() === 'en';
      if (!this._activePatchVer) this._activePatchVer = '2.0.0-rc2';
      const sections200rc2 = isEn ? [
        {
          badge: 'VISUAL OVERHAUL & ABYSSEA',
          color: '#5be3d1',
          icon: 'nucleo_abyssea',
          title: 'Full Rebrand to Abyssea & Vectorized HD Texture Overhaul',
          items: [
            'Official rebrand to Abyssea with a smooth biome-gradient logo (Emerald Coast to Crimson Abyss), crisp monochrome white minimalist title icons, split early/endgame animated archipelago title diorama, and updated Discord Rich Presence.',
            'Complete 1-by-1 visual quality audit across all dungeon gates, structures, biome nodes, crops, farm animals, props, icons, and 42 brand-new vectorized HD sprites for RC2 (pets, alchemy potions, exotic fish, marine encounters, and stations).',
            'Windowed-maximized 1280x720 launch defaults in Tauri and music media overlay disabled by default.'
          ]
        },
        {
          badge: 'LIVING ARCHIPELAGO',
          color: '#ffd54f',
          icon: 'pet_pez_linterna',
          title: 'Active Pets, Dynamic Events, Lunar Cycle & Marine Encounters',
          items: [
            '5 Active Companion Pets (Golden Slime, Coral Crab, Astral Owl, Ember Spirit, Abyssal Lanternfish) that follow Hana with auto-loot, combat bolts, and light passives, plus Specialist Villagers roaming your built cottages.',
            'Dynamic World Events: Island Raids, Abyssal Night Pulses, Biome Weather (Sandstorms, Blizzards, Crimson Ash, Acid Rain), and the Ghost Merchant Ship docking at coastlines with rare rotating stock.',
            '5-Phase Lunar Cycle (New Moon, Waxing Quarter, Full Moon, Blood Moon, Astral Eclipse) affecting magic, crop growth, nocturnal drops, rare catches, and combat challenge.',
            'Marine Encounters: Deep-Sea Whirlpools with rare fishing luck and the Coastal Leviathan Boss with 3 destructible tentacles dropping Leviathan Pearls.'
          ]
        },
        {
          badge: 'COMBAT & DUNGEONS',
          color: '#ff6b7a',
          icon: 'espada_eclipse',
          title: 'Perfect Dodge, 6 Roguelike Dungeon Affixes & Armor Set Synergies',
          items: [
            'Perfect Dodge timing window grants brief invulnerability, a slow-mo flash, energy recovery, and a guaranteed next critical hit.',
            '6 Roguelike Dungeon Affixes (Volcanic Floor, Swift Foes, Rain of Gold, Infinite Mana, Critical Fury, Vampiric Echo) adding variety and bonus rewards to dungeon runs.',
            'Full Armor Set Synergies (2/4/5 pieces) across every biome & tier plus Bestiary Mastery tiers revealing enemy drop tables and permanent species damage bonuses.',
            'Complete combat damage rebalance across all 14 biomes and 75 dungeons eliminating unfair instant one-shots.'
          ]
        },
        {
          badge: 'CRAFTING, BASE & QOL',
          color: '#81c784',
          icon: 'cetro_traslado',
          title: 'Trophy Hall, Teleport Beacons, Relocator, Chest QoL & Guild Shop',
          items: [
            'Trophy Hall Museum to donate items/fish/boss drops for permanent archipelago-wide milestones, plus Archipelago Teleport Beacons for instant fast travel from the World Map.',
            'Structure Relocator Scepter to move chests, machines, and stations without losing contents, Chest Stack-All button, and Logistic Chest category reception filters.',
            'Fishing Dock automated bait traps, Fish Pond breeding, Offering Altar a-la-carte buffs, Rarity Preservation & Catalyst Reforge for all 62 weapons, and Daily Dynamic Market Demand.',
            'Weekly Guild Contracts & Token Shop with cosmetic auras for Hana, contextual hints & "What To Do Now?" guide, Gamepad API support, and Enhanced Photo Mode (F9/F8/P + WASD pan + PNG capture).'
          ]
        },
        {
          badge: 'FULL FUNCTIONAL RE-AUDIT',
          color: '#b388ff',
          icon: 'catalizador_reforja',
          title: 'System-Wide Bug Fixes & Dead-End Material Recipes',
          items: [
            'Fixed full-inventory addItem crash, Backpack equip modifier calculation, Endless Abyss dungeon entry & scaling, Omega building initialization, and buff potion/scroll consumption.',
            'Fixed all broken alchemy/ritual/legacy recipes, enabled all 5 fishing baits and 14-biome fishing/auto-drill tables, and added 18 new recipes giving every material real gameplay utility.'
          ]
        }
      ] : [
        {
          badge: 'REDISEÑO VISUAL Y ABYSSEA',
          color: '#5be3d1',
          icon: 'nucleo_abyssea',
          title: 'Rebrand Oficial a Abyssea y Rework Completo de Texturas HD',
          items: [
            'Rebrand completo a Abyssea con logo degradado continuo de biomas (de costa esmeralda a abismo carmesí), iconos minimalistas monocromáticos blancos en el menú principal, diorama animado dividido en islas iniciales y finales, y Discord Rich Presence actualizado.',
            'Auditoría visual 1 por 1 en todas las entradas de mazmorras, estructuras, nodos de bioma, cultivos, animales, props e iconos, además de 42 nuevos sprites vectorizados HD para RC2 (mascotas, pociones alquímicas, peces exóticos, encuentros marinos y estaciones).',
            'Ventana inicial maximizada 1280x720 en Tauri y overlay de música desactivado por defecto.'
          ]
        },
        {
          badge: 'ARCHIPIÉLAGO VIVO',
          color: '#ffd54f',
          icon: 'pet_pez_linterna',
          title: 'Mascotas Activas, Eventos Dinámicos, Ciclo Lunar y Encuentros Marinos',
          items: [
            '5 Mascotas Compañeras Activas (Limo Dorado, Cangrejo Coralino, Búho Astral, Espíritu Ígneo y Pez Linterna Abisal) que siguen a Hana recogiendo botín, atacando enemigos e iluminando, más Aldeanos Especialistas en tus cabañas.',
            'Eventos Dinámicos Interactivos: Incursiones de Isla, Pulso Nocturno Abisal, Clima por Bioma (tormentas de arena, ventiscas, ceniza carmesí, lluvia ácida) y el Barco Mercader Fantasma con ofertas raras.',
            'Ciclo Lunar de 5 fases (Luna Nueva, Cuarto Creciente, Luna Llena, Luna de Sangre y Eclipse Astral) con impacto en magia, cultivos, pesca exótica y dificultad nocturna.',
            'Encuentros Marinos: Remolinos Abisales de pesca rara y el Jefe Costero Leviatán con 3 tentáculos destruibles que sueltan Perlas de Leviatán.'
          ]
        },
        {
          badge: 'COMBATE Y MAZMORRAS',
          color: '#ff6b7a',
          icon: 'espada_eclipse',
          title: 'Esquiva Perfecta, 6 Afijos Roguelike y Sinergias de Sets',
          items: [
            'Ventana de Esquiva Perfecta que otorga invulnerabilidad breve, destello slow-mo, recuperación de energía y crítico garantizado en el siguiente golpe.',
            '6 Afijos Roguelike de Mazmorra (Suelo Volcánico, Enemigos Veloces, Lluvia de Oro, Maná Infinito, Furia Crítica y Eco Vampírico) con botín extra.',
            'Sinergias completas de sets de armadura (2/4/5 piezas) en todos los biomas y tiers, además de Maestría del Bestiario con tablas de drops y bonos permanentes por especie.',
            'Rebalance integral de daño de enemigos y jefes en los 14 biomas y 75 mazmorras eliminando golpes letales injustos.'
          ]
        },
        {
          badge: 'BASE, ECONOMÍA Y CALIDAD DE VIDA',
          color: '#81c784',
          icon: 'cetro_traslado',
          title: 'Salón de Trofeos, Balizas de Teletransporte, Cetro de Traslado y Gremio',
          items: [
            'Salón de Trofeos (Museo) con donaciones y bonos permanentes globales, además de Balizas de Teletransporte para viaje rápido directo desde el Mapa del Mundo.',
            'Cetro de Traslado de Estructuras para reubicar cofres y máquinas sin perder su contenido, botón "Guardar iguales" en cofres y filtros por categoría en Cofres Logísticos.',
            'Trampas de cebo automáticas en Muelles de Pesca, crianza en Estanques de Peces, Altar de Ofrendas a la carta, Preservación de Rareza y Catalizador de Reforja para las 62 armas, y Demanda Diaria Dinámica en el Mercado.',
            'Contratos Semanales del Gremio y Tienda de Fichas con auras cosméticas para Hana, pistas contextuales y guía "¿Qué hago ahora?", soporte para mando (Gamepad API) y Modo Foto mejorado (F9/F8/P + cámara WASD + captura PNG).'
          ]
        },
        {
          badge: 'RE-AUDITORÍA FUNCIONAL TOTAL',
          color: '#b388ff',
          icon: 'catalizador_reforja',
          title: 'Correcciones Críticas y Utilidad Real para Todos los Ítems',
          items: [
            'Corregidos el error al llenar inventario en addItem, modificadores al equipar mochilas, entrada y escalado del Abismo Infinito, inicialización de estructuras Omega y consumo real de pociones/pergaminos de buff.',
            'Reparadas recetas rotas de alquimia, rituales y legado, activados los 5 cebos y tablas de pesca/taladro en los 14 biomas, y añadidas 18 recetas nuevas para que ningún material quede sin uso.'
          ]
        }
      ];
      const sections121 = isEn ? [
        {
          badge: 'BETA 1.2.1',
          color: '#ffd54f',
          icon: 'cofre_madera',
          title: 'Beta 1.2.1 — Chests (1,000 Stacks), Storage Fix & Compact XP',
          items: [
            'Chest stack limit increased from 100 to 1,000 items per slot across Wooden, Iron, and Golden Runic Chests.',
            'Fixed storage chests losing or emptying items when reopening or interacting, plus fixed Collector Towers draining chests.',
            'Improved ground drop & Backpack Tier persistence across saves, loads, and dungeon transitions.',
            'Fixed Logistic Chest withdrawals when inventory is full so items never vanish.',
            'Added side-by-side Chest + Inventory layout, live search bar, and category filters in Chests, Logistic Chests, and the Omega Virtual Warehouse.',
            'Added a new Basurero (Item Incinerator) building in [R] and quick Trash buttons in Inventory [Q] to permanently delete unwanted items.',
            'Introduced Hana Caraka as the unique playable character with all 33 directional animations (combat, weapons, tools, farming, swimming, fishing, hurt, pickup, block, jump, and death) aligned with all in-game items.',
            'Simplified level XP bar numbers (e.g. 1M, 250K) with full exact numbers displayed on mouse hover.'
          ]
        },
        {
          badge: 'INVENTORY & HOTBAR',
          color: '#ffd54f',
          icon: 'mochila_astral',
          title: 'Slot-Based Inventory, Backpacks & Independent Hotbar',
          items: [
            'Slot-based inventory (20 base slots) decoupled from the 9-slot Hotbar (29 base slots in total).',
            'Base stack size increased to 25 items per slot (expandable up to 100 via skills and backpacks).',
            'Quick item transfer between Inventory [Q] and Hotbar [1-9] using Shift + Click.',
            '3 Craftable Backpacks at the Loom: Leather Backpack (Tier 2), Reinforced Backpack (Tier 5), and Astral Backpack (Tier 9), plus 3 early inventory nodes in the Gathering Constellation.',
            'Legacy Save Protection: existing saves with over-capacity inventories automatically spawn on the Main Island with excess stacks neatly dropped around the player for safe chest storage.'
          ]
        },
        {
          badge: 'STORAGE [R]',
          color: '#4fc3f7',
          icon: 'tablon',
          title: 'Storage Chests in the Build Menu [R]',
          items: [
            '3 placeable Storage Chest tiers in the Build Menu [R]: Wooden Chest (30 slots), Iron Chest (50 slots), and Runic Golden Chest (70 slots).',
            'Chest stack capacity increased to 1,000 items per slot across all storage chests.',
            'Quick deposit and withdraw controls (x1, x5, x10, Half, Full Stack, Deposit All) and Shift + Click support.'
          ]
        },
        {
          badge: 'EQUIPMENT & ORES',
          color: '#81c784',
          icon: 'pantalones_omega',
          title: 'New Armor Slot: Leggings / Greaves (16 Tiers)',
          items: [
            '5th Paperdoll Armor Slot: 16 complete tiers from Leather Pants (Tier 1) to Graviton Greaves Omega (Tier 16), granting Defense, Max HP, and Movement Speed.',
            'Full recipe and mineral progression rebalance across all 16 tiers and biome rings.'
          ]
        },
        {
          badge: 'DUNGEONS & BOSSES',
          color: '#ff8a65',
          icon: 'espada_eclipse',
          title: 'Expanded Late-Biome Dungeons (Biomes 3, 4 & 5) & Corrupted Mode',
          items: [
            'Desert, Volcano, and Shadow Crypt dungeons expanded with 3x difficulty, 3 new side chambers, and reinforced 3-tile boss chamber stone walls.',
            'New Boss Gate requirements: defeat 2 Guardians (North & South), purify 2 Elemental Shrines, and solve a 4-Rune sequence puzzle.',
            'Late-biome Bosses feature 5x HP and 3 new attack patterns: Spiral Barrage, Expanding Shockwave Ring, and Meteor Rain.',
            'Unrestricted dungeon re-entry after death, plus Corrupted Dungeon Mode (25x difficulty) after clearing all 24 dungeons.'
          ]
        },
        {
          badge: 'OMEGA ENDGAME',
          color: '#ea80fc',
          icon: 'singularidad',
          title: 'Omega Energy Grid, Automation & Tier 16 Endgame',
          items: [
            'Power Grid & Virtual Storage: Omega Central Nexus, Link Pylons, Quantum Battery (+5,000 to +40,000 W·s reserve), and 4 Generators (Combustion, Geothermal, Arcane Solar, Singularity Reactor).',
            '6 Processing Machines & Harvesters: Crusher, Arcane Washer, Omega Smelter, Gem Synthesizer, Omega Runic Inscriber, Pure Matter Condenser, Deep Core Extractor, and Hydroponic Dome.',
            'Defense, Bosses & Overcharge: Omega Prism Turret, Island Overcharge Beacon (+25% to +60% machine speed & +30% damage), Singularity Press, Boss Simulation Chamber, and Infinite Overcharge Altar.',
            '13 Omega Research Technologies, Tier 16 Omega Gear, Island Ascension (Ranks I-III), and The Infinite Abyss endless dungeon.'
          ]
        },
        {
          badge: 'PROGRESSION & ART',
          color: '#69f0ae',
          icon: 'cristal_datos',
          title: 'High-Level XP Scaling, Constellation Costs & Visual Overhaul',
          items: [
            'High-level XP requirement scaling: Lv. 50+ (x2 XP), Lv. 100+ (x4 XP), Lv. 200+ (x10 XP), and Lv. 300+ (x20 XP).',
            'Progressive Constellation Skill costs [G]: skills now cost Constellation Points equal to their Tier (Tier 1 = 1 pt up to Tier 10 = 10 pts).',
            'Complete pixel-art visual overhaul for all crafting stations, defensive towers, 2x2 Royal Bazaar Pavilion, Omega structures, and live animated farm animals in corrals.'
          ]
        }
      ] : [
        {
          badge: 'BETA 1.2.1',
          color: '#ffd54f',
          icon: 'cofre_madera',
          title: 'Beta 1.2.1 — Cofres (Stacks de 1000), Guardado y XP Simplificada',
          items: [
            'Capacidad de stack en cofres aumentada de 100 a 1000 unidades por ranura en todos los cofres.',
            'Corregido el fallo que vaciaba o tiraba los objetos de los cofres al cerrarlos y volverlos a abrir, y evitado que las Torres Recolectoras vacien cofres.',
            'Corregida la persistencia de objetos tirados en el suelo y del rango de Mochila al guardar/cargar o entrar a mazmorras.',
            'Corregido el retiro de objetos del Cofre Logistico cuando el inventario estaba lleno para evitar que desaparezcan.',
            'Vista lado a lado de Cofre + Tu Inventario, buscador en vivo y filtros por categoria en Cofres, Cofre Logistico y Almacen Virtual Omega.',
            'Anadido el edificio Basurero (Incinerador) en [R] y botones de eliminacion rapida en el Inventario [Q] para borrar objetos permanentemente.',
            'Nuevo personaje jugable unico Hana Caraka con sus 33 animaciones direccionales completas (combate, armas, herramientas, granja, nado, pesca, dano, recoleccion, bloqueo, salto y muerte) ajustadas con los objetos del juego.',
            'Numeros de XP de nivel simplificados (ej. 1M, 250K) mostrando el numero exacto completo al pasar el cursor.'
          ]
        },
        {
          badge: 'INVENTARIO Y HOTBAR',
          color: '#ffd54f',
          icon: 'mochila_astral',
          title: 'Sistema de Inventario, Mochilas y Hotbar Independiente',
          items: [
            'Inventario basado en ranuras (20 espacios iniciales) separado de la barra rapida (9 espacios de Hotbar = 29 espacios base en total).',
            'Capacidad de stack base aumentada a 25 unidades por ranura (ampliable hasta 100 con habilidades y mochilas).',
            'Transferencia rapida de objetos entre el Inventario [Q] y la Hotbar [1-9] usando Shift + Clic.',
            '3 Mochilas crafteables en el Telar: Mochila de Cuero (Tier 2), Mochila Reforzada (Tier 5) y Mochila Astral (Tier 9), mas 3 habilidades tempranas de inventario en la Constelacion de Recoleccion.',
            'Proteccion para partidas antiguas: al cargar una partida previa a la actualizacion con exceso de objetos, apareces en la Isla Principal y los objetos sobrantes caen ordenadamente a tu alrededor para guardarlos en cofres.'
          ]
        },
        {
          badge: 'ALMACENAMIENTO [R]',
          color: '#4fc3f7',
          icon: 'tablon',
          title: 'Cofres de Almacenamiento en el Menu de Construccion [R]',
          items: [
            '3 Tiers de Cofres fisicos construibles desde el menu [R]: Cofre de Madera (30 ranuras), Cofre de Hierro (50 ranuras) y Cofre Dorado Runico (70 ranuras).',
            'Capacidad de stack ampliada a 1000 unidades por ranura dentro de todos los cofres.',
            'Controles rapidos para depositar y retirar (x1, x5, x10, Mitad, Stack Completo, Depositar Todo) y soporte para Shift + Clic.'
          ]
        },
        {
          badge: 'EQUIPO Y MINERALES',
          color: '#81c784',
          icon: 'pantalones_omega',
          title: 'Nueva Ranura de Equipamiento: Pantalones y Grebas (16 Tiers)',
          items: [
            '5ta ranura de armadura en el panel del heroe con 16 tiers completos: desde Pantalones de Cuero (Tier 1) hasta Grebas Gravitatorias Omega (Tier 16), otorgando Defensa, Vida maxima y Velocidad de movimiento.',
            'Balanceo integral de spawneo de minerales por anillo de bioma y recetas de herramientas, picos y armaduras de Tier 1 a Tier 16.'
          ]
        },
        {
          badge: 'MAZMORRAS Y JEFES',
          color: '#ff8a65',
          icon: 'espada_eclipse',
          title: 'Expansion de Mazmorras (Biomas 3, 4 y 5) y Modo Corrupto',
          items: [
            'Mazmorras de Desierto, Volcan y Criptas Sombrias expandidas con dificultad x3, 3 salas nuevas y muros reforzados en la camara del jefe.',
            'Nuevos requisitos para abrir la puerta del jefe: derrotar a 2 Guardianes (Norte y Sur), purificar 2 Altares Elementales y resolver el puzle de secuencia de 4 Runas.',
            'Jefes de Biomas 3, 4 y 5 con x5 de vida y 3 nuevos ataques: Rafaga en Espiral, Anillo de Choque Expansivo y Lluvia de Meteoros.',
            'Reingreso libre a las mazmorras tras morir y Nuevo Modo Corrupto (dificultad 25x) al completar las 24 mazmorras.'
          ]
        },
        {
          badge: 'ENDGAME OMEGA',
          color: '#ea80fc',
          icon: 'singularidad',
          title: 'Red de Energia Omega, Automatizacion y Tier 16',
          items: [
            'Red Electrica y Almacen Virtual: Nexo Central Omega, Pilones de Enlace, Acumulador Cuantico (+5.000 a +40.000 W·s) y 4 Generadores (Combustion, Geotermico, Solar Arcano y Reactor de Singularidad).',
            '6 Maquinas Procesadoras y Extractores: Trituradora, Lavadora Arcana, Fundidora Omega, Sintetizador de Gemas, Inscriptor Runico Omega, Condensador de Materia Pura, Extractor de Nucleo Profundo y Domo Hidroponico.',
            'Defensa, Jefes y Sobrecarga: Torreta de Prisma Omega, Baliza de Sobrecarga de Isla (+25% a +60% velocidad de maquinas y +30% dano), Prensa de Singularidades, Camara de Simulacion de Jefes y Altar de Sobrecarga Infinita.',
            'Arbol de 13 Tecnologias Omega, Equipamiento Tier 16, Ascension de Islas (Rango I a III) y la mazmorra infinita El Abismo Infinito.'
          ]
        },
        {
          badge: 'PROGRESION Y ARTE',
          color: '#69f0ae',
          icon: 'cristal_datos',
          title: 'Escalado de Nivel, Costo de Constelaciones y Renovacion Visual',
          items: [
            'Escalado de XP en niveles altos: Nv. 50+ (x2 XP), Nv. 100+ (x4 XP), Nv. 200+ (x10 XP) y Nv. 300+ (x20 XP).',
            'Costo progresivo en el Arbol de Constelaciones [G]: cada habilidad cuesta tantos puntos como su Tier (Tier 1 = 1 punto ... Tier 10 = 10 puntos).',
            'Renovacion visual completa con texturas pixel-art a medida para estaciones, torres defensivas, Pabellon de Feria Urbana (2x2), maquinas Omega y corrales con animales animados en vivo.'
          ]
        }
      ];

      const sections130 = isEn ? [
        {
          badge: 'BETA 1.3.0',
          color: '#ff1744',
          icon: 'espada_eclipse',
          title: 'Final Boss: Abyssal Crimson Swordsman (#75)',
          items: [
            'Brand-new climax encounter in the Cursed Lands finale Dungeon: Eclipse of the Crimson Swordsman.',
            'Full multi-row combat animations (Stance Guard, Stalk Run, Scarlet Aura Charge, 14-frame 360 Whirlwind, Cross-Step Blink, Dash Slash Lunge & 9-frame Particle Dissolve Death).',
            'Drops Cosmic Singularities, Cursed Plates, Crimson Crystals, the Eclipse Blade and the Sovereign Relic Heart of the Crimson Eclipse.'
          ]
        },
        {
          badge: 'WORLD 19x19',
          color: '#4fc3f7',
          icon: 'mapa_tesoro_item',
          title: '361 Directional Islands, 14 Biomes & 4 Zones',
          items: [
            'Expanded archipelago from 10x10 (100 islands) to 19x19 (361 islands) anchored around Zone I (Central Emerald Meadow 3x3).',
            'Directional climate layout keeps Snow strictly East and Lava strictly West (North Desert, South Jungle & Swamp), preventing jarring climate clashes.',
            'Strict Zone I -> II -> III -> IV progression lock across 9 brand-new biomes (Coral Archipelago, Crystal Cavern, Emerald Jungle, Ash Caldera, Sand Dynasty, Deep Glacier, Putrid Swamp, Bone Necropolis & Cursed Lands). Automatic 10x10 -> 19x19 save migration included.'
          ]
        },
        {
          badge: '75 DUNGEONS',
          color: '#ffd54f',
          icon: 'llave_maestra_mazmorra',
          title: '75 Unique Dungeons, 75 Boss Relics & Vault Grid UI',
          items: [
            'Added 51 new tiered dungeons (75 total) with biome-specific tilesets, 18 new enemies, Gigapack sp_* VFX and 51 unique boss relics.',
            'Inventory right column now features a compact "Reliquias" button opening a Chest-Grid Relics Vault where clicking any relic square reveals its effects and source.'
          ]
        },
        {
          badge: 'BALANCE & ART',
          color: '#e040fb',
          icon: 'singularidad',
          title: 'Omega Endgame Rebalance, Texture Overhaul & Trailer Studio',
          items: [
            'Buffed T16 Omega Armor & fixed Singularity Blade melee scaling so Omega gear stays strictly stronger than all T9-T15 sets; raised Omega Research & Ascension thresholds.',
            'Rebuilt dozens of machine sprites (T1/T2 Furnaces, Anvils, Crushers, Omega Extractors, Void Nexus) and removed duplicate crafting recipes.',
            'Added /boss, /spawnboss, /hud, /spectator, /freezeai, /zoom, /vfx, /clearmobs and /trailer commands in Shift+F9 console for rapid trailer capture.'
          ]
        }
      ] : [
        {
          badge: 'BETA 1.3.0',
          color: '#ff1744',
          icon: 'espada_eclipse',
          title: 'Jefe Final Supremo: Espadachin Carmesi Abisal (#75)',
          items: [
            'Nuevo jefe final en la mazmorra numero 75: Eclipse del Espadachin Carmesi en Tierras Malditas.',
            'Animacion completa fila por fila (Guardia, Carrera, Carga de Aura, Torbellino 360 de 14 frames, Paso Espectral, Estocada Carmesi y Disolucion en particulas al morir).',
            'Otorga Singularidades Cosmicas, Espada del Eclipse Carmesi y la reliquia suprema Corazon del Eclipse Carmesi.'
          ]
        },
        {
          badge: 'MUNDO 19x19',
          color: '#4fc3f7',
          icon: 'mapa_tesoro_item',
          title: '361 Islas Direccionales, 14 Biomas y 4 Zonas',
          items: [
            'Mapa expandido a 19x19 (361 islas) centrado en la Zona I (Pradera Esmeralda 3x3).',
            'Distribucion climatica por orientacion: Lava al Oeste, Nieve/Hielo al Este, Desierto al Norte y Selva/Pantanales al Sur (la nieve nunca toca la lava).',
            'Bloqueo secuencial Zona I -> II -> III -> IV con 9 biomas nuevos, 17 vetas minerales nuevas y migracion automatica de partidas 10x10 anteriores.'
          ]
        },
        {
          badge: '75 MAZMORRAS',
          color: '#ffd54f',
          icon: 'llave_maestra_mazmorra',
          title: '75 Dungeons Unicas, 75 Reliquias de Jefe y Boton Reliquias',
          items: [
            '51 mazmorras nuevas (75 en total) con escenografia por bioma, 18 enemigos nuevos, VFX Gigapack sp_* en combates y 51 reliquias unicas.',
            'Nuevo boton "Reliquias" en el Inventario que abre una cuadricula compacta estilo cofre: selecciona cualquier reliquia para ver su origen y estadisticas.'
          ]
        },
        {
          badge: 'BALANCE Y TRAILER',
          color: '#e040fb',
          icon: 'singularidad',
          title: 'Omega Endgame, Texturas Renovadas y Comandos de Trailer',
          items: [
            'Armadura Omega T16 y Hoja de la Singularidad reforzadas por encima de todo el equipo T9-T15; requisitos de ascension y Singularidades ajustados para seguir siendo verdadero endgame.',
            'Redibujo completo de maquinas, hornos, yunques, edificios Omega y eliminacion de recetas duplicadas o atajos de crafteo.',
            'Consola Shift+F9 ampliada con /boss, /spawnboss, /hud, /spectator, /freezeai, /zoom, /vfx, /clearmobs y /trailer para grabar capturas y trailers rapidamente.'
          ]
        }
      ];

            const sections132 = [
        {
          badge: 'SANTUARIO Y BIOMAS',
          color: '#ff5252',
          icon: 'llave_maestra',
          title: isEn ? 'Strict Biome Lock for Dungeon Sanctuary' : 'Bloqueo Estricto de Mazmorras por Bioma',
          items: isEn ? [
            'Dungeon Sanctuary strictly validates biome progression: entering a dungeon now requires unlocking its island/biome first.',
            'Removed premature direct boss teleport bypass. Access to the Crimson Citadel requires reaching the Tierras Malditas.',
            'Locked dungeons are grayed out with a lock badge showing the required biome.'
          ] : [
            'El Santuario de Mazmorras valida estrictamente la progresión del mundo: acceder a una mazmorra requiere explorar y desbloquear su bioma primero.',
            'Se eliminó el botón de atajo directo al Jefe Final. La Ciudadela del Eclipse Carmesí requiere desbloquear las Tierras Malditas.',
            'Las mazmorras en biomas aún no alcanzados se muestran bloqueadas indicando el bioma requerido.'
          ]
        },
        {
          badge: 'RESILIENCIA Y FUENTES',
          color: '#4fc3f7',
          icon: 'cristal_datos',
          title: isEn ? 'Asset Resiliency & Clean UTF-8' : 'Resiliencia de Texturas y Tipografía Limpia',
          items: isEn ? [
            'Resilient canvas fallbacks for all items, drop icons and recipes (preventing broken image glyphs).',
            'Full UTF-8 cleanup across crafting stations, tooltips and building inspectors.',
            'Web download counter stabilized and persistent.'
          ] : [
            'Fallback automático procedimental para iconos de objetos y recetas (evita imágenes rotas).',
            'Limpieza total de caracteres UTF-8 en fichas de edificios, estaciones de trabajo y descripciones.',
            'Contador de descargas de la web protegido contra reinicios.'
          ]
        }
      ];

      const sections133 = [
        {
          badge: '23 TIERS COMPLETOS',
          color: '#e040fb',
          icon: 'casco_omega',
          title: isEn ? 'Expanded 23-Tier Progression (T14–T20 Biome Metals & Omega T23 Endgame)' : 'Progresión Expandida a 23 Tiers (T14–T20 Metales de Bioma y Omega T23)',
          items: isEn ? [
            'All 8 tools and all 5 armor slots (Helm, Armor, Shield, Boots, Greaves) now scale across 23 complete tiers from Basic (T1) to Omega (T23).',
            'All 7 new Zone III & IV biome metals integrated directly into the main upgrade ladder after Orichalcum (T13): Coraline (T14), Boreal (T15), Emerald Jungle (T16), Caldera Slag (T17), Solar Pyrite (T18), Eternal Glacier (T19), and Cursed Silver / Abyssal (T20).',
            'Legendary (T21) and Celestial (T22) rescaled cleanly above Zone IV gear, crowning Singularity Omega (T23) as true late-game requiring Omega Metallurgy research, Singularities, and Compressed Matter.',
            'Complete 23-tier sets with new biome boots, leggings, helms, shields, and glacier armor, plus distinct pixel palettes and glow cues for all new tool tiers.'
          ] : [
            'Todas las 8 herramientas y las 5 ranuras de armadura (Casco, Coraza, Escudo, Botas y Pantalones) ahora escalan por 23 tiers completos desde Básica (T1) hasta Omega (T23).',
            'Los 7 metales de Zona III y IV quedan integrados en la progresión principal tras Oricalco (T13): Coralina (T14), Boreal (T15), Selvana (T16), Escoria Ígnea (T17), Pirita Solar (T18), Glacial Eterna (T19) y Plata Maldita / Abismal (T20).',
            'Legendaria (T21) y Celestial (T22) se reescalan por encima de Zona IV, coronando a Omega (T23) como verdadero late-game que exige Investigación de Metalurgia Omega, Singularidades y Materia Comprimida.',
            'Sets completos en las 5 piezas (incluyendo nuevas botas, grebas, yelmos, escudos y coraza glaciar) y paletas visuales propias para los nuevos tiers de herramientas.'
          ]
        },
        {
          badge: 'BALANCE Y CORRECCIONES',
          color: '#81c784',
          icon: 'lingote_omega',
          title: isEn ? 'Zero-Softlock Forging & Omega Research Gating' : 'Cero Bloqueos de Progresión y Requisito Omega Estricto',
          items: isEn ? [
            'Fixed Copper Pickaxe (T3) crafting order so upgrading Improved -> Copper no longer requires a Forge (which needs Iron), while Iron (T4+) keeps the Forge requirement.',
            'Enforced Omega Metallurgy research check in Recipes, Tools, and Armor upgrades so T23 Omega gear stays locked until earned in late-game.',
            'Step-by-step Pickaxe mining requirements aligned smoothly across all 14 biomes in Zones I–IV.'
          ] : [
            'Corregido el crafteo del Pico de Cobre (T3): ya no exige Forja (evitando el bloqueo mutuo con el Hierro), manteniendo la Forja obligatoria desde Hierro (T4+).',
            'Validación estricta de la investigación Metalurgia Omega en recetas, herramientas y armaduras para proteger el endgame T23.',
            'Requisitos de pico por mineral ajustados bioma a bioma en Zonas I–IV para una progresión sin bloqueos.'
          ]
        }
      ];

      const patchVersions = [
        {
          id: '2.0.0-rc2',
          label: 'Beta 2.0.0 RC2',
          pill: 'BETA 2.0.0 RC2',
          subtitle: isEn ? 'Abyssea HD Rework, Pets, Events, Lunar Cycle & Re-Audit' : 'Rework HD Abyssea, Mascotas, Eventos, Ciclo Lunar y Re-Auditoría',
          heroTitle: isEn ? 'ABYSSEA — Beta 2.0.0 RC2 Release Notes' : 'ABYSSEA — Notas de la Versión Beta 2.0.0 RC2',
          heroSub: isEn
            ? 'Complete Abyssea visual & HD texture overhaul, functional re-audit, combat rebalance, active pets, dynamic events, lunar cycle, marine encounters, trophy hall, beacons, and quality-of-life upgrades.'
            : 'Rework visual completo de Abyssea con texturas HD, re-auditoría funcional integral, rebalance de combate, mascotas activas, eventos dinámicos, ciclo lunar, encuentros marinos, salón de trofeos, balizas y mejoras de calidad de vida.',
          sections: sections200rc2
        },
        {
          id: '1.3.3',
          label: 'Beta 1.3.3',
          pill: 'BETA v1.3.3',
          subtitle: isEn ? '23-Tier Progression & True Late-Game Omega' : '23 Tiers de Equipo y Omega Late-Game',
          heroTitle: isEn ? 'ABYSSEA — Beta 1.3.3 Release Notes' : 'ABYSSEA — Notas de la Versión Beta 1.3.3',
          heroSub: isEn
            ? 'Massive 23-tier progression expansion integrating Zone III-IV biome metals (T14-T20), Legendary T21, Celestial T22, and true late-game Omega T23.'
            : 'Expansión completa a 23 tiers de herramientas y armaduras integrando los minerales de Zona III-IV (T14-T20), Legendaria T21, Celestial T22 y Omega T23 como verdadero late-game.',
          sections: sections133
        },
        {
          id: '1.3.2',
          label: 'Beta 1.3.2',
          pill: 'BETA v1.3.2',
          subtitle: isEn ? 'Dungeon Progression Fix & Clean Typography' : 'Bloqueo de Mazmorras por Bioma y Correcciones',
          heroTitle: isEn ? 'ABYSSEA — Beta 1.3.2 Release Notes' : 'ABYSSEA — Notas de la Versión Beta 1.3.2',
          heroSub: isEn
            ? 'Dungeon Sanctuary biome progression locks, boss portal fixes, canvas fallbacks and clean UTF-8 text.'
            : 'Bloqueo estricto de mazmorras por bioma en el Santuario, corrección del portal del Jefe Final, fallbacks de iconos y tipografía UTF-8 limpia.',
          sections: sections132
        },
        {
          id: '1.3.1',
          label: 'Beta 1.3.1',
          pill: 'BETA v1.3.1',
          subtitle: isEn ? 'Spell Leveling, Omega Power & Proportions' : 'Nivel de Hechizos, Red Omega & Escala 2x2',
          heroTitle: isEn ? 'ABYSSEA — Beta 1.3.1 Release Notes' : 'ABYSSEA — Notas de la Versión Beta 1.3.1',
          heroSub: isEn
            ? 'Central Nexus auto-vacuum, Spell Leveling Lv.1-5, Smart Collector Tower, Trash Bin fix and 2x2 grand building proportions.'
            : 'Nexo Central autónomo, subida de nivel de hechizos (Nv.1-5), Torre Recolectora inteligente, Basurero reparado y edificios grandes 2x2.',
          sections: [
            {
              badge: 'RED OMEGA',
              color: '#80d8ff',
              icon: 'elixir_mana',
              title: isEn ? 'Autonomous Nexus & Energy Grid' : 'Nexo Central Autónomo y Energía',
              items: isEn ? [
                'Central Nexus passively vacuums nearby fuels and drops on the island.',
                'Collector Towers refuel adjacent furnaces/generators and deposit surplus into the Nexus.'
              ] : [
                'El Nexo Central absorbe automáticamente combustibles y drops en la isla.',
                'Las Torres Recolectoras abastecen hornos/generadores cercanos y envían excedentes al Nexo.'
              ]
            },
            {
              badge: 'HECHIZOS & PROPORCIONES',
              color: '#b388ff',
              icon: 'grimorio_furia_arcana',
              title: isEn ? 'Spell Leveling (Lv.1-5) & 2x2 Scaling' : 'Niveles de Hechizos y Proporciones 2x2',
              items: isEn ? [
                'Upgrade every spell up to Lv.5 in the Grimoire (+25% damage, -8% cooldown per level).',
                'Banks, Trade Houses and Grand Towers resized to 2x2; Trash Bin properly scaled down.'
              ] : [
                'Sube de nivel todos los hechizos hasta Nv.5 en el Grimorio (+25% daño, -8% cooldown).',
                'Bancos, Casas de Comercio y Torres grandes ampliadas a 2x2; Basurero proporcionado.'
              ]
            }
          ]
        },
        {
          id: '1.3.0',
          label: 'Beta 1.3.0',
          pill: 'BETA v1.3.0',
          subtitle: isEn ? '361-Island Expansion & Crimson Abyss' : 'Gran Expansion Beta 1.3.0',
          heroTitle: isEn ? 'ABYSSEA — Beta 1.3.0 Release Notes' : 'ABYSSEA — Notas de la Version Beta 1.3.0',
          heroSub: isEn
            ? 'Complete summary of all 14 biomes, 75 dungeons, Omega balance, texture overhaul, Chest Relics UI and trailer debug tools.'
            : 'Resumen completo de las 361 islas, 14 biomas, 75 mazmorras, Jefe Final Carmesi Abisal, balance Omega y herramientas de trailer.',
          sections: sections130
        },
        {
          id: '1.2.1',
          label: 'Beta 1.2.1',
          pill: 'BETA v1.2.1',
          subtitle: isEn ? 'Chests (1,000 Stacks) & Storage Fix' : 'Cofres (Stacks de 1000) y Correcciones',
          heroTitle: isEn ? 'ABYSSEA — Beta 1.2.1 Release Notes' : 'ABYSSEA — Notas de la Version Beta 1.2.1',
          heroSub: isEn
            ? 'Previous release notes kept for reference: 1,000 stack chests, storage durability, combat scaling and UI refinements.'
            : 'Historial de cambios de la version anterior Beta 1.2.1.',
          sections: sections121
        }
      ];
      const activeVer = patchVersions.find(v => v.id === this._activePatchVer) || patchVersions[0];
      const sections = activeVer.sections;

      const wrap = this.el('div', { class: 'patch-notes-wrap' });
      const verTabs = this.el('div', { class: 'patch-version-tabs' });
      patchVersions.forEach(ver => {
        verTabs.appendChild(this.el('button', {
          type: 'button',
          class: 'patch-ver-btn' + (ver.id === activeVer.id ? ' active' : ''),
          onclick: () => {
            this._activePatchVer = ver.id;
            this.renderModal();
          }
        }, ver.label));
      });
      wrap.appendChild(verTabs);

      wrap.appendChild(this.el('div', { class: 'parchment-box patch-notes-hero' }, [
        this.el('div', { class: 'patch-notes-hero-top' }, [
          this.el('span', { class: 'patch-version-pill' }, activeVer.pill),
          this.el('span', { class: 'patch-notes-date' }, activeVer.subtitle)
        ]),
        this.el('div', { class: 'patch-notes-hero-title' }, activeVer.heroTitle),
        this.el('div', { class: 'patch-notes-hero-sub' }, activeVer.heroSub)
      ]));

      const list = this.el('div', { class: 'patch-notes-list' });
      sections.forEach(sec => {
        const ul = this.el('ul', { class: 'patch-notes-bullets' });
        sec.items.forEach(line => {
          ul.appendChild(this.el('li', {}, line));
        });
        const card = this.el('div', {
          class: 'card patch-notes-card',
          style: `--patch-accent:${sec.color};`
        }, [
          this.el('div', { class: 'patch-notes-card-head' }, [
            this.itemIcon(sec.icon, 32),
            this.el('div', { class: 'patch-notes-card-titles' }, [
              this.el('span', { class: 'patch-notes-cat-badge', style: `color:${sec.color};border-color:${sec.color};` }, sec.badge),
              this.el('strong', { class: 'patch-notes-card-title' }, sec.title)
            ])
          ]),
          ul
        ]);
        list.appendChild(card);
      });
      wrap.appendChild(list);

      wrap.appendChild(this.el('div', { class: 'patch-notes-footer' }, [
        this.el('button', {
          id: 'btn-patch-notes-close',
          type: 'button',
          class: 'btn btn-gold pause-big-btn',
          onclick: () => this.closeModal()
        }, tr('common.back'))
      ]));

      body.appendChild(wrap);
    }

    renderExitDungeonConfirmModal(body) {
      const g = this.game;
      const dung = g && g.activeDungeon;
      const unopenedChests = dung && Array.isArray(dung.chests) ? dung.chests.filter(c => c && !c.opened).length : 0;
      const unlootedDrops = g && Array.isArray(g.drops) ? g.drops.length : 0;
      const children = [
        this.el('p', { class: 'quit-msg' }, tr('dungeon.exitConfirmMsg'))
      ];
      if (unopenedChests > 0 || unlootedDrops > 0) {
        children.push(this.el('p', {
          class: 'quit-msg',
          style: 'margin-top:8px;color:#ffd54f;font-size:14px;'
        }, tr('dungeon.exitLootWarn', { chests: unopenedChests, drops: unlootedDrops })));
      }
      body.appendChild(this.el('div', { class: 'pause-stack quit-box' }, [
        this.el('div', { class: 'card quit-card' }, children),
        this.el('div', { class: 'quit-actions-row' }, [
          this.el('button', {
            id: 'btn-exit-dungeon-cancel',
            type: 'button',
            class: 'btn btn-stone pause-big-btn',
            onclick: () => this.closeModal()
          }, tr('dungeon.exitStayBtn')),
          this.el('button', {
            id: 'btn-exit-dungeon-confirm',
            type: 'button',
            class: 'btn btn-danger pause-big-btn',
            onclick: () => {
              this.closeModal();
              if (g) g.exitDungeon();
            }
          }, tr('dungeon.exitConfirmBtn'))
        ])
      ]));
    }

    renderCorruptedDungeonChoice(titleEl, body) {
      const g = this.game;
      const dId = this.modalData?.dungeonId;
      const def = (Abyssea.DUNGEON_DEFS && Abyssea.DUNGEON_DEFS[dId]) || {};
      titleEl.textContent = `Desafío Corrupto: ${def.name || 'Mazmorra'}`;

      body.appendChild(this.el('div', { class: 'parchment-box', style: 'margin-bottom:12px;' }, [
        this.el('div', { style: 'font-size:16px;font-weight:700;color:#e040fb;margin-bottom:6px;' }, '¡Has dominado las 24 Mazmorras del Archipiélago!'),
        this.el('div', { style: 'font-size:14px;color:#eceff1;line-height:1.45;' },
          'Las energías del vacío han corrompido esta mazmorra ancestral. Los enemigos y el jefe poseen 25x vida, daño abrumador y patrones intensos, pero otorgan Esencias Corruptas, Gemas del Vacío y Reliquias Legendarias.'
        )
      ]));

      const isCorruptedCleared = Array.isArray(g.corruptedClearedDungeons) && g.corruptedClearedDungeons.includes(dId);
      if (isCorruptedCleared) {
        body.appendChild(this.el('div', { class: 'card', style: 'color:#81c784;font-weight:700;margin-bottom:12px;' }, [
          this.uiIcon('iconCheck', 16),
          '¡Ya completaste esta mazmorra en Modo Corrupto!'
        ]));
      }

      const btnRow = this.el('div', { style: 'display:flex;gap:10px;justify-content:flex-end;margin-top:14px;flex-wrap:wrap;' }, [
        this.el('button', {
          class: 'btn btn-stone',
          onclick: () => this.closeModal()
        }, 'Cancelar'),
        this.el('button', {
          class: 'btn btn-primary',
          onclick: () => {
            this.closeModal();
            g.enterDungeon(dId, false, { forceNormal: true });
          }
        }, 'Entrar en Modo Normal'),
        this.el('button', {
          class: 'btn btn-danger',
          style: 'background:linear-gradient(135deg, #7b1fa2, #d500f9);border-color:#ea80fc;',
          onclick: () => {
            this.closeModal();
            g.enterDungeon(dId, true);
          }
        }, 'Entrar en Modo Corrupto (25x Dificultad)')
      ]);
      body.appendChild(btnRow);
    }

    renderQuitModal(body, webFallback = false) {
      if (webFallback) {
        body.appendChild(this.el('div', { class: 'pause-stack quit-box' }, [
          this.el('div', { class: 'card quit-card' }, [
            this.el('p', { class: 'quit-msg' }, tr('quit.webFallbackMsg'))
          ]),
          this.el('button', {
            id: 'btn-quit-return-menu',
            type: 'button',
            class: 'btn btn-gold pause-big-btn',
            onclick: () => this.closeModal()
          }, tr('quit.returnMenu'))
        ]));
        return;
      }

      body.appendChild(this.el('div', { class: 'pause-stack quit-box' }, [
        this.el('div', { class: 'card quit-card' }, [
          this.el('p', { class: 'quit-msg' }, tr('quit.confirmMsg'))
        ]),
        this.el('div', { class: 'quit-actions-row' }, [
          this.el('button', {
            id: 'btn-quit-cancel',
            type: 'button',
            class: 'btn btn-stone pause-big-btn',
            onclick: () => this.closeModal()
          }, tr('common.cancel')),
          this.el('button', {
            id: 'btn-quit-confirm',
            type: 'button',
            class: 'btn btn-danger pause-big-btn',
            onclick: () => this.executeQuitGame()
          }, tr('quit.confirmBtn'))
        ])
      ]));
    }

    renderDiscordFallbackModal(body) {
      body.appendChild(this.el('div', { class: 'pause-stack quit-box' }, [
        this.el('div', { class: 'card quit-card' }, [
          this.el('p', { class: 'quit-msg' }, tr('title.discordBlocked', { url: DISCORD_URL })),
          this.el('div', { class: 'discord-link-pill' }, DISCORD_URL)
        ]),
        this.el('div', { class: 'quit-actions-row' }, [
          this.el('a', {
            id: 'btn-discord-open-link',
            href: DISCORD_URL,
            target: '_blank',
            rel: 'noopener noreferrer',
            class: 'btn btn-primary pause-big-btn'
          }, tr('title.discordOpen')),
          this.el('button', {
            id: 'btn-discord-close',
            type: 'button',
            class: 'btn btn-stone pause-big-btn',
            onclick: () => this.closeModal()
          }, tr('common.close'))
        ])
      ]));
    }

    renderPauseMenu(body) {
      if (this.pauseView === 'settings') {
        body.appendChild(this._buildSettingsView(false));
        return;
      }

      this._syncPauseModalClasses(false);
      const g = this.game;
      const dayPhase = g.getDayPhase ? g.getDayPhase() : { label: tr('hud.day') };

      const stack = this.el('div', { class: 'pause-stack pause-root-stack' });
      stack.appendChild(this.el('div', { class: 'parchment-box pause-hero-bar' }, [
        this.el('img', {
          class: 'pixel-img pause-hero-avatar',
          src: encodeURI(Abyssea.UI_URLS.avatarHero),
          width: 44,
          height: 44,
          alt: tr('pause.heroAlt')
        }),
        this.el('div', { class: 'pause-hero-meta' }, [
          this.el('div', { class: 'pause-hero-title' }, tr('pause.slotMeta', {
            slot: g.currentSlot || 1,
            day: g.dayCount || 1,
            phase: dayPhase.label
          })),
          this.el('div', { class: 'pause-stat-row' }, [
            this.el('span', { class: 'pause-stat-chip' }, tr('pause.statsMeta', { level: g.player.level })),
            this.el('span', { class: 'pause-stat-chip' }, `${formatNum(g.coins)} ${tr('common.gold')}`),
            this.el('span', { class: 'pause-stat-chip' }, `${g.unlockedPlots.length} ${tr('common.islands')}`)
          ])
        ])
      ]));

      const skins = Abyssea.SKINS || [];
      if (skins.length > 1) {
        const curSkinId = g.player.skinId || 'hana';
        const curSkin = skins.find(s => s.id === curSkinId) || skins[0];
        const curIndex = skins.findIndex(s => s.id === curSkin.id);
        const isEn = Abyssea.I18n && Abyssea.I18n.getLanguage() === 'en';
        const skinName = (isEn && curSkin.name_en) ? curSkin.name_en : curSkin.name;
        const skinRole = (isEn && curSkin.role_en) ? curSkin.role_en : (curSkin.role || '');
        const skinDesc = (isEn && curSkin.desc_en) ? curSkin.desc_en : (curSkin.desc || '');

        const skinBox = this.el('div', { class: 'parchment-box', style: 'padding:10px 14px; margin-bottom:12px; display:flex; align-items:center; justify-content:space-between; gap:10px; background:rgba(30,22,14,0.92); border:2px solid #b8860b; border-radius:6px;' }, [
          this.el('div', { style: 'text-align:left; flex:1;' }, [
            this.el('div', { style: 'font-size:10px; text-transform:uppercase; letter-spacing:1px; color:#d4af37; margin-bottom:2px;' }, tr('settings.heroSkinTitle')),
            this.el('div', { style: 'font-size:14px; font-weight:bold; color:#fff; display:flex; align-items:center; gap:6px;' }, [
              this.el('span', { style: 'color:#ffe082;' }, `${curIndex + 1}/${skins.length}`),
              skinName,
              skinRole ? this.el('span', { style: 'font-size:11px; font-weight:normal; color:#81c784; background:rgba(76,175,80,0.18); padding:2px 6px; border-radius:3px;' }, skinRole) : null
            ]),
            this.el('div', { style: 'font-size:11px; color:#c0b090; margin-top:2px;' }, skinDesc)
          ]),
          this.el('div', { style: 'display:flex; gap:6px;' }, [
            this.el('button', {
              type: 'button',
              class: 'btn btn-gold',
              style: 'padding:6px 12px; font-size:14px;',
              title: tr('settings.prevSkin'),
              onclick: () => {
                if (g.cyclePlayerSkin) g.cyclePlayerSkin(-1);
                this.renderModal();
              }
            }, '<'),
            this.el('button', {
              type: 'button',
              class: 'btn btn-gold',
              style: 'padding:6px 12px; font-size:14px;',
              title: tr('settings.nextSkin'),
              onclick: () => {
                if (g.cyclePlayerSkin) g.cyclePlayerSkin(1);
                this.renderModal();
              }
            }, '>')
          ])
        ]);
        stack.appendChild(skinBox);
      }

      stack.appendChild(this.el('button', {
        id: 'btn-pause-resume',
        type: 'button',
        class: 'btn btn-green pause-big-btn',
        onclick: () => this.closeModal()
      }, [
        this.el('img', { class: 'pixel-img', src: encodeURI(Abyssea.UI_URLS.iconPlay), width: 18, height: 18, alt: '' }),
        tr('pause.resume')
      ]));

      stack.appendChild(this.el('button', {
        id: 'btn-pause-photo',
        type: 'button',
        class: 'btn btn-primary pause-big-btn',
        onclick: () => {
          this.closeModal();
          this.togglePhotoMode();
        }
      }, [
        this.el('img', { class: 'pixel-img', src: encodeURI(Abyssea.UI_URLS.iconStar), width: 18, height: 18, alt: '' }),
        'Modo Foto / Cámara Libre (F9)'
      ]));

      stack.appendChild(this.el('button', {
        id: 'btn-pause-settings',
        type: 'button',
        class: 'btn btn-gold pause-big-btn',
        onclick: () => {
          this.pauseView = 'settings';
          this.renderModal();
        }
      }, [
        this.el('img', { class: 'pixel-img', src: encodeURI(Abyssea.UI_URLS.iconSettings), width: 18, height: 18, alt: '' }),
        tr('pause.settings')
      ]));

      stack.appendChild(this.el('button', {
        id: 'btn-pause-save-exit',
        type: 'button',
        class: 'btn btn-danger pause-big-btn',
        onclick: () => {
          if (g.saveSys) g.saveSys.save(g, g.currentSlot || 1, true);
          if (Abyssea.Audio && Abyssea.Audio.fadeOutMusic) Abyssea.Audio.fadeOutMusic(620);
          this.playSceneTransition(tr('transition.savingExit'), () => {
            this.showTitleScreen();
          }, { sub: 'Guardando datos y regresando al campamento...' });
        }
      }, [
        this.el('img', { class: 'pixel-img', src: encodeURI(Abyssea.UI_URLS.iconSave), width: 18, height: 18, alt: '' }),
        tr('pause.saveExit')
      ]));

      body.appendChild(stack);
    }

    _buildBuildingUpgradePerksCard(b, def) {
      const isEn = Abyssea.I18n && Abyssea.I18n.getLanguage && Abyssea.I18n.getLanguage() === 'en';
      const lvl = Math.max(1, Number(b && b.level) || 1);
      const rows = [];

      if (def.opensPanel === 'enchant') {
        rows.push({ lv: 1, text: isEn ? 'Tier I enchantments unlocked.' : 'Encantamientos Grado I disponibles.' });
        rows.push({ lv: 2, text: isEn ? 'Unlocks Tier II enchantments.' : 'Desbloquea encantamientos Grado II.' });
        rows.push({ lv: 3, text: isEn ? 'Unlocks Tier III (Master) enchantments.' : 'Desbloquea encantamientos Grado III (Maestros).' });
      } else if (def.station) {
        rows.push({ lv: 1, text: isEn ? `Unlocks base ${def.name} recipes.` : `Desbloquea recetas base de ${def.name}.` });
        rows.push({ lv: 2, text: isEn ? '+35% crafting/forging speed · +20% Craft XP.' : '+35% velocidad de crafteo/forja · +20% EXP obtenida.' });
        rows.push({ lv: 3, text: isEn ? '+75% speed · +40% XP · 25% double output (x2) · 20% Material Echo.' : '+75% velocidad · +40% EXP · 25% doble producción (x2) · 20% Eco de materiales.' });
      }

      const hasAura = Boolean(def.auraDmg || def.auraSpeed || def.auraLuck || def.xpBonus || def.auraXp || def.auraSpellPower);
      if (hasAura) {
        const auraTags = [];
        if (def.auraDmg) auraTags.push(isEn ? `+${Math.round(def.auraDmg * 100)}% DMG` : `+${Math.round(def.auraDmg * 100)}% Daño`);
        if (def.auraSpeed) auraTags.push(isEn ? `+${Math.round(def.auraSpeed * 100)}% SPD` : `+${Math.round(def.auraSpeed * 100)}% Vel.`);
        if (def.auraLuck) auraTags.push(isEn ? `+${Math.round(def.auraLuck * 100)}% Luck` : `+${Math.round(def.auraLuck * 100)}% Suerte`);
        if (def.xpBonus || def.auraXp) auraTags.push(`+${Math.round(((def.xpBonus || 0) + (def.auraXp || 0)) * 100)}% XP`);
        if (def.auraSpellPower) auraTags.push(isEn ? `+${Math.round(def.auraSpellPower * 100)}% Spells` : `+${Math.round(def.auraSpellPower * 100)}% Hechizos`);
        const baseStr = auraTags.join(' · ');
        if (!def.station) rows.push({ lv: 1, text: isEn ? `Base aura: ${baseStr}.` : `Aura base: ${baseStr}.` });
        rows.push({ lv: 2, text: isEn ? `Empowered aura (+45%): x1.45 (${baseStr}).` : `Aura potenciada (+45%): bonos x1.45 (${baseStr}).` });
        rows.push({ lv: 3, text: isEn ? `Supreme aura (+90%): x1.90 (${baseStr}).` : `Aura suprema (+90%): bonos x1.90 (${baseStr}).` });
      }

      if (def.isTurret) {
        const baseDmg = def.turretDmg || 28;
        rows.push({ lv: 1, text: isEn ? `Base turret (${baseDmg} DMG per shot).` : `Torreta base (${baseDmg} daño por disparo).` });
        rows.push({ lv: 2, text: isEn ? `+45% damage (${Math.round(baseDmg * 1.45)}) · +25% fire rate.` : `+45% daño (${Math.round(baseDmg * 1.45)}) · +25% cadencia de tiro.` });
        rows.push({ lv: 3, text: isEn ? `+90% damage (${Math.round(baseDmg * 1.90)}) · +50% fire rate.` : `+90% daño (${Math.round(baseDmg * 1.90)}) · +50% cadencia de tiro.` });
      }

      if (def.machineSpeedBonus) {
        rows.push({ lv: 2, text: isEn ? `+35% machine accelerator efficiency (+${Math.round(def.machineSpeedBonus * 135)}%).` : `+35% eficacia al acelerador de máquinas (+${Math.round(def.machineSpeedBonus * 135)}%).` });
        rows.push({ lv: 3, text: isEn ? `+70% machine accelerator efficiency (+${Math.round(def.machineSpeedBonus * 170)}%).` : `+70% eficacia al acelerador de máquinas (+${Math.round(def.machineSpeedBonus * 170)}%).` });
      }

      if (def.autoCycle && !def.autoWaterRadius && !def.cropBoost) {
        if (def.autoCoins || def.autoXp) {
          rows.push({ lv: 1, text: isEn ? `Auto generation every ${def.autoCycle}s.` : `Generación automática cada ${def.autoCycle}s.` });
          rows.push({ lv: 2, text: isEn ? '+45% speed · +50% coins / +40% XP.' : '+45% velocidad · +50% monedas / +40% EXP.' });
          rows.push({ lv: 3, text: isEn ? '+90% speed · +100% coins / +80% XP.' : '+90% velocidad · +100% monedas / +80% EXP.' });
        } else if (def.autoMine || def.autoProduce) {
          rows.push({ lv: 1, text: isEn ? `Auto production every ${def.autoCycle}s.` : `Producción automática cada ${def.autoCycle}s.` });
          rows.push({ lv: 2, text: isEn ? '+35% speed · 35% higher-purity ore chance.' : '+35% velocidad · 35% prob. mineral de mayor pureza.' });
          rows.push({ lv: 3, text: isEn ? '+70% speed · Double output per cycle (x2).' : '+70% velocidad · Doble producción por ciclo (x2).' });
        }
      }

      if (def.autoWaterRadius) {
        rows.push({ lv: 1, text: isEn ? `Auto watering in ${def.autoWaterRadius}px radius.` : `Riego automático en radio ${def.autoWaterRadius}px.` });
        rows.push({ lv: 2, text: isEn ? '+20% range radius and faster cycles.' : '+20% radio de alcance y ciclos más frecuentes.' });
        rows.push({ lv: 3, text: isEn ? '+40% range covering the entire garden.' : '+40% radio de alcance sobre toda la huerta.' });
      }

      if (!rows.length) return null;

      // Deduplicate by tier level (merge multiple perks on the same tier cleanly)
      const byTier = { 1: [], 2: [], 3: [] };
      rows.forEach(r => { if (byTier[r.lv]) byTier[r.lv].push(r.text); });
      const tiers = [1, 2, 3].filter(t => byTier[t].length > 0);
      if (!tiers.length) return null;

      const lvShort = isEn ? 'Lv.' : 'Nv.';
      const card = this.el('div', { class: 'bldg-perks-card' }, [
        this.el('div', { class: 'bldg-perks-header' }, [
          this.el('span', { class: 'bldg-perks-title' }, isEn ? 'LEVEL UPGRADE PERKS' : 'BENEFICIOS DE MEJORA POR NIVEL'),
          this.el('span', { class: 'bldg-perks-badge' }, lvl >= 3 ? (isEn ? 'MAX LEVEL (3/3)' : 'NIVEL MÁXIMO (3/3)') : (isEn ? `CURRENT: Lv.${lvl}/3` : `ACTUAL: Nv.${lvl}/3`))
        ]),
        this.el('div', { class: 'bldg-perks-list' }, tiers.map(lv => {
          const isUnlocked = lv <= lvl;
          const isNext = lv === lvl + 1;
          const cls = isUnlocked ? 'is-unlocked' : (isNext ? 'is-next' : '');
          const status = isUnlocked ? (isEn ? 'ACTIVE' : 'ACTIVO') : (isNext ? (isEn ? 'NEXT' : 'SIGUIENTE') : (isEn ? 'LOCKED' : 'BLOQUEADO'));
          return this.el('div', { class: `bldg-perk-tier ${cls}` }, [
            this.el('span', { class: 'bldg-perk-lv' }, `${lvShort}${lv}`),
            this.el('span', { style: 'flex:1;' }, byTier[lv].join(' ')),
            this.el('span', { class: 'bldg-perk-status' }, status)
          ]);
        }))
      ]);
      return card;
    }

    renderBuildingInspector(titleEl, body, b) {
      const g = this.game;
      const def = Abyssea.BUILDINGS[b.type];
      titleEl.textContent = `${def.name} (${tr('common.levelShort')}${b.level}/3)`;
      body.appendChild(this.el('div', { class: 'parchment-box', style: 'margin-bottom:12px;display:flex;align-items:center;gap:12px;' }, [
        this.makeBuildingThumb(def, 52),
        this.el('div', { style: 'font-size:15px;line-height:1.48;' }, def.desc)
      ]));

      const perksCard = this._buildBuildingUpgradePerksCard(b, def);
      if (perksCard) body.appendChild(perksCard);

      this._renderCraftQueueBanner(body, def.station || null);

      const appendFooter = () => {
        const foot = this.el('div', { style: 'display:flex;gap:10px;margin-top:12px;flex-wrap:wrap;' });
        if (b.level < 3) {
          const nxt = b.level + 1;
          foot.appendChild(this.el('button', {
            class: 'btn btn-gold',
            onclick: () => { g.automation.upgradeBuilding(g, b); this.renderModal(); }
          }, tr('bldg.upgradeToCost', { lvl: nxt, coins: nxt * 85, gears: nxt === 2 ? 2 : 4 })));
        }
        foot.appendChild(this.el('button', {
          class: 'btn btn-danger',
          onclick: () => {
            if (b.baitSlot && b.baitSlot.id && b.baitSlot.qty > 0) {
              g.addItem(b.baitSlot.id, b.baitSlot.qty);
              b.baitSlot = null;
            }
            if (b.breedFish) {
              g.addItem(b.breedFish, 1);
              b.breedFish = null;
            }
            if (typeof g.demolishBuilding === 'function') {
              g.demolishBuilding(b);
            } else {
              g.automation.collectFromBuilding(g, b);
              g.buildings = g.buildings.filter(x => x !== b);
              Object.entries(def.cost || {}).forEach(([id, q]) => g.addItem(id, Math.max(1, Math.floor(q * 0.5))));
              g.recomputeModifiers();
              g.toast(tr('bldg.demolishToast', { name: def.name }), 'info');
            }
            if (Abyssea.Audio && typeof Abyssea.Audio.play === 'function') Abyssea.Audio.play('destroy');
            this.closeModal();
          }
        }, tr('bldg.demolishBtn')));
        body.appendChild(foot);
      };

      const appendOmegaFooter = () => {
        const foot = this.el('div', { style: 'display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;' });
        foot.appendChild(this.el('button', {
          class: 'btn btn-danger',
          onclick: () => {
            if (typeof g.demolishBuilding === 'function') {
              g.demolishBuilding(b);
            } else {
              g.buildings = g.buildings.filter(x => x !== b);
              if (def.cost) {
                Object.entries(def.cost).forEach(([id, q]) => g.addItem(id, Math.max(1, Math.floor(q * 0.5))));
              }
              g.recomputeModifiers();
              g.toast(tr('bldg.demolishToast', { name: def.name }), 'info');
            }
            if (Abyssea.Audio && typeof Abyssea.Audio.play === 'function') Abyssea.Audio.play('destroy');
            this.closeModal();
          }
        }, tr('bldg.demolishBtn')));
        body.appendChild(foot);
      };

      if (def.omega) {
        titleEl.textContent = `${def.name} [OMEGA]`;
        if (def.omega.kind === 'nexus') {
          this.renderOmegaNexus(body, b, def);
          appendOmegaFooter();
          return;
        }
        if (def.omega.kind === 'press') {
          this.renderOmegaPress(body, b, def);
          appendOmegaFooter();
          return;
        }
        if (def.omega.kind === 'chamber') {
          this.renderOmegaChamber(body, b, def);
          appendOmegaFooter();
          return;
        }
        if (def.omega.kind === 'altar') {
          this.renderOmegaAltar(body, b, def);
          appendOmegaFooter();
          return;
        }
        this.renderOmegaMachine(body, b, def);
        appendOmegaFooter();
        return;
      }

      if (def.opensPanel === 'market') {
        this.renderMarket(body);
        appendFooter();
        return;
      }
      if (def.opensPanel === 'crafting') {
        this.renderCrafting(body, { onlyStation: 'mano' });
        appendFooter();
        return;
      }
      if (def.opensPanel === 'achievements') {
        this.renderAchievements(body);
        appendFooter();
        return;
      }
      if (def.opensPanel === 'enchant') {
        this.renderEnchanting(body);
        appendFooter();
        return;
      }
      if (def.opensPanel === 'aquarium' || b.type === 'portal_acuario') {
        if (typeof this.renderAquariumModal === 'function') this.renderAquariumModal(body);
        appendFooter();
        return;
      }
      if (def.opensPanel === 'reforge' || b.type === 'mesa_reforja') {
        if (typeof this.renderReforgeTab === 'function') this.renderReforgeTab(body);
        appendFooter();
        return;
      }
      if (def.opensPanel === 'trophy_hall' || b.type === 'salon_trofeos') {
        if (typeof this.renderTrophyHallModal === 'function') this.renderTrophyHallModal(body);
        appendFooter();
        return;
      }
      if (def.opensPanel === 'teleport_beacon' || b.type === 'baliza_teletransporte') {
        if (typeof this.renderTeleportBeaconModal === 'function') this.renderTeleportBeaconModal(body, b);
        appendFooter();
        return;
      }
      // RC2 (K): Fishing Dock Passive Bait Trap & Fish Pond Rare Fish Breeding
      if (b.type === 'muelle_pesca') {
        const baits = ['cebo_arcano', 'cebo_volcanico', 'cebo_dorado', 'cebo_gusano', 'cebo_lombriz'];
        const curBait = b.baitSlot && b.baitSlot.qty > 0 ? `${(Abyssea.ITEMS[b.baitSlot.id]?.name) || b.baitSlot.id} x${b.baitSlot.qty}` : 'Sin cebo cargado';
        const baitBtns = this.el('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;' });
        baits.forEach(bid => {
          const owned = g.inventory[bid] || 0;
          const bIt = Abyssea.ITEMS[bid];
          if (!bIt) return;
          baitBtns.appendChild(this.el('button', {
            class: owned > 0 ? 'btn btn-primary btn-sm' : 'btn btn-stone btn-sm',
            disabled: owned > 0 ? null : 'disabled',
            onclick: () => {
              const loadQty = Math.min(owned, 5);
              if (loadQty <= 0) return;
              if (b.baitSlot && b.baitSlot.id && b.baitSlot.id !== bid && b.baitSlot.qty > 0) {
                g.addItem(b.baitSlot.id, b.baitSlot.qty);
              }
              g.removeItem(bid, loadQty);
              if (b.baitSlot && b.baitSlot.id === bid) b.baitSlot.qty += loadQty;
              else b.baitSlot = { id: bid, qty: loadQty };
              g.toast(`Cargado ${loadQty}x ${bIt.name} en las trampas del Muelle.`, 'success');
              this.renderModal();
            }
          }, `Cargar ${bIt.name} (${owned})`));
        });
        body.appendChild(this.el('div', { class: 'card', style: 'margin-bottom:12px;' }, [
          this.el('strong', { style: 'color:#4fc3f7;' }, `Trampas Pasivas de Pesca — Cebo activo: ${curBait}`),
          this.el('div', { style: 'font-size:13px;color:#cfd8dc;margin-top:3px;' }, 'Deja cebos aquí para capturar automáticamente peces raros y exóticos mientras exploras o entras en mazmorras.'),
          baitBtns
        ]));
      }
      if (b.type === 'estanque') {
        const fishIds = Object.keys(g.inventory || {}).filter(id => (g.inventory[id] || 0) > 0 && Abyssea.AQUARIUM_FISH_PASSIVES && Abyssea.AQUARIUM_FISH_PASSIVES[id]);
        const curBreed = b.breedFish && Abyssea.ITEMS[b.breedFish] ? Abyssea.ITEMS[b.breedFish].name : 'Ninguno (pesca aleatoria)';
        const breedRow = this.el('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;' });
        fishIds.slice(0, 10).forEach(fid => {
          const fIt = Abyssea.ITEMS[fid];
          breedRow.appendChild(this.el('button', {
            class: b.breedFish === fid ? 'btn btn-gold btn-sm' : 'btn btn-primary btn-sm',
            onclick: () => {
              if (b.breedFish === fid) return;
              if (b.breedFish) g.addItem(b.breedFish, 1);
              g.removeItem(fid, 1);
              b.breedFish = fid;
              g.toast(`Cría activa en Estanque: ${fIt.name} se reproducirá pasivamente.`, 'success');
              this.renderModal();
            }
          }, `Criar ${fIt.name}`));
        });
        if (b.breedFish) {
          breedRow.appendChild(this.el('button', {
            class: 'btn btn-stone btn-sm',
            onclick: () => {
              if (b.breedFish) g.addItem(b.breedFish, 1);
              b.breedFish = null;
              this.renderModal();
            }
          }, 'Limpiar Cría'));
        }
        body.appendChild(this.el('div', { class: 'card', style: 'margin-bottom:12px;' }, [
          this.el('strong', { style: 'color:#69f0ae;' }, `Cría de Peces Raros — Especie actual: ${curBreed}`),
          this.el('div', { style: 'font-size:13px;color:#cfd8dc;margin-top:3px;' }, 'Coloca 1 ejemplar capturado para reproducir duplicados pasivamente (ideal para Acuario y Alquimia).'),
          breedRow
        ]));
      }
      if (def.opensPanel === 'portal') {
        const portals = g.buildings.filter(x => x.type === 'portal');
        const pCard = this.el('div', { class: 'card', style: 'margin-bottom:12px;' }, [
          this.el('strong', { style: 'color:#4fc3f7;' }, tr('bldg.portalsDest')),
          this.el('div', { style: 'display:flex;gap:8px;flex-wrap:wrap;margin:8px 0;' }, [
            this.el('button', {
              class: 'btn btn-gold btn-sm',
              onclick: () => {
                this.closeModal();
                if (typeof g.enterAquarium === 'function') g.enterAquarium();
              }
            }, 'Viajar a la Dimensión del Acuario'),
            this.el('button', {
              class: 'btn btn-primary btn-sm',
              onclick: () => this.openModal('aquarium')
            }, 'Gestionar Peces del Acuario')
          ])
        ]);
        portals.forEach((pt, idx) => {
          const biome = BIOMES[g.world.getBiomeAtPixel(pt.tx * TILE_SIZE, pt.ty * TILE_SIZE)];
          pCard.appendChild(this.el('button', {
            class: 'btn btn-primary btn-sm',
            onclick: () => {
              if (g.activeDungeon) {
                g.toast('No puedes usar portales de superficie dentro de una mazmorra.', 'warn');
                return;
              }
              const tx = (pt.tx + 0.5) * TILE_SIZE;
              const ty = (pt.ty + 1.4) * TILE_SIZE;
              const safe = typeof g.findSafeOverworldSpawn === 'function' ? g.findSafeOverworldSpawn(tx, ty) : { x: tx, y: ty };
              g.player.x = safe.x;
              g.player.y = safe.y;
              g.camera.x = g.player.x;
              g.camera.y = g.player.y;
              Abyssea.Audio.play('portal');
              this.closeModal();
            }
          }, tr('bldg.portalLine', { idx: idx + 1, biome: biome.name, x: pt.tx, y: pt.ty })));
        });
        body.appendChild(pCard);
      }
      if (def.opensPanel === 'altar') {
        // RC2 (L): Offering Altar A-la-Carte (Fish -> Luck/Fishing, Ingots -> Mining/Chopping, Essences -> Dungeon/Boss DMG, Summon Sea Boss)
        const anyFish = Object.keys(g.inventory || {}).find(id => (g.inventory[id] || 0) >= 2 && Abyssea.AQUARIUM_FISH_PASSIVES && Abyssea.AQUARIUM_FISH_PASSIVES[id]);
        const anyIngot = Object.keys(g.inventory || {}).find(id => (g.inventory[id] || 0) >= 3 && id.startsWith('lingote_'));
        const hasEss = (g.inventory.esencia_oscura || 0) >= 1 || (g.inventory.esencia_lunar || 0) >= 1;
        const aCard = this.el('div', { class: 'card', style: 'margin-bottom:12px;display:flex;flex-direction:column;gap:8px;' }, [
          this.el('strong', { style: 'color:#ce93d8;font-size:15px;' }, 'Altar de Ofrendas a la Carta'),
          this.el('button', {
            class: anyFish ? 'btn btn-primary btn-sm' : 'btn btn-stone btn-sm',
            onclick: () => {
              if (!anyFish) return g.toast('Necesitas al menos 2 unidades de cualquier pez.', 'warn');
              g.removeItem(anyFish, 2);
              g.activeBuffs.luck = { mult: 1.55, time: 120 };
              g.recomputeModifiers();
              Abyssea.Audio.play('levelup');
              g.toast(`Ofrenda Marina aceptada (${Abyssea.ITEMS[anyFish].name} x2): +55% Suerte y Pesca por 120s.`, 'success');
              this.closeModal();
            }
          }, `Ofrenda de Peces (2x ${anyFish ? Abyssea.ITEMS[anyFish].name : 'cualquier pez'}) -> +55% Suerte y Pesca (120s)`),
          this.el('button', {
            class: anyIngot ? 'btn btn-gold btn-sm' : 'btn btn-stone btn-sm',
            onclick: () => {
              if (!anyIngot) return g.toast('Necesitas al menos 3 unidades de cualquier lingote.', 'warn');
              g.removeItem(anyIngot, 3);
              g.activeBuffs.miner_sight = { mult: 1.55, time: 120 };
              g.recomputeModifiers();
              Abyssea.Audio.play('levelup');
              g.toast(`Ofrenda de Forja aceptada (${Abyssea.ITEMS[anyIngot].name} x3): +55% Minería y Tala por 120s.`, 'success');
              this.closeModal();
            }
          }, `Ofrenda de Lingotes (3x ${anyIngot ? Abyssea.ITEMS[anyIngot].name : 'cualquier lingote'}) -> +55% Minería y Tala (120s)`),
          this.el('button', {
            class: hasEss ? 'btn btn-danger btn-sm' : 'btn btn-stone btn-sm',
            onclick: () => {
              const essId = (g.inventory.esencia_lunar || 0) >= 1 ? 'esencia_lunar' : (g.inventory.esencia_oscura || 0) >= 1 ? 'esencia_oscura' : null;
              if (!essId) return g.toast('Necesitas 1 Esencia Oscura o Esencia Lunar.', 'warn');
              g.removeItem(essId, 1);
              g.activeBuffs.dmg = { mult: 1.40, time: 120 };
              g.recomputeModifiers();
              Abyssea.Audio.play('levelup');
              g.toast(`Ofrenda Abisal aceptada (1x ${Abyssea.ITEMS[essId].name}): +40% Daño en Mazmorras y Jefes (120s).`, 'success');
              this.closeModal();
            }
          }, 'Ofrenda de Esencia (1x Esencia Oscura o Lunar) -> +40% Daño en Combate (120s)'),
          this.el('div', { style: 'display:flex;gap:8px;flex-wrap:wrap;' }, [
            this.el('button', {
              class: 'btn btn-gold btn-sm',
              onclick: () => {
                if ((g.inventory.esencia_oscura || 0) < 1) return g.toast(tr('bldg.altarNeedEssence'), 'warn');
                g.removeItem('esencia_oscura', 1);
                g.events.triggerRandomEvent(g);
                this.closeModal();
              }
            }, tr('bldg.altarEventBtn')),
            this.el('button', {
              class: 'btn btn-primary btn-sm',
              onclick: () => {
                const useKey = (g.inventory.llave_jefe || 0) >= 1;
                const useEss = (g.inventory.esencia_oscura || 0) >= 2;
                if (!useKey && !useEss) return g.toast('Requiere 1x Llave de Jefe o 2x Esencia Oscura para invocar al Leviatán Marino.', 'warn');
                if (useKey) g.removeItem('llave_jefe', 1); else g.removeItem('esencia_oscura', 2);
                if (typeof g.spawnSeaBoss === 'function') g.spawnSeaBoss(true);
                this.closeModal();
              }
            }, 'Invocar Leviatán Abisal (1x Llave Jefe o 2x Esencia)')
          ])
        ]);
        body.appendChild(aCard);
      }
      if (def.opensPanel === 'dungeons') {
        const dList = this.el('div', { class: 'dungeon-atlas-list', style: 'margin-top:8px;' });

        // Unlocked plots & biomes calculation
        const unlockedPlots = Array.isArray(g.unlockedPlots) ? g.unlockedPlots : [];
        const unlockedBiomes = new Set(
          unlockedPlots.map(([gx, gy]) => (g.world && g.world.plotBiomes && g.world.plotBiomes[gy] && g.world.plotBiomes[gy][gx]) || 'pradera')
        );
        const clearedSet = new Set(Array.isArray(g.clearedDungeons) ? g.clearedDungeons : []);
        const gatesObj = Abyssea.DUNGEON_GATES || {};

        // T23 Endgame: El Abismo Infinito (usa omega.abyssUnlocked)
        const abyssReady = g.omega && typeof g.omega.abyssUnlocked === 'function'
          ? g.omega.abyssUnlocked(g)
          : clearedSet.size >= 45;
        if (abyssReady) {
          const abFl = (g.omega && g.omega.state.abyss && g.omega.state.abyss.current) || 1;
          const abBest = (g.omega && g.omega.state.abyss && g.omega.state.abyss.best) || 0;
          dList.appendChild(this.el('button', {
            class: 'btn btn-primary btn-sm',
            style: 'background:linear-gradient(90deg, #4a148c, #880e4f);border:1.5px solid #e040fb;color:#fff;font-weight:bold;margin-bottom:6px;width:100%;display:flex;justify-content:space-between;align-items:center;box-shadow:0 0 10px rgba(224,64,251,0.3);',
            onclick: () => {
              this.closeModal();
              g.enterDungeon('abismo_infinito');
            }
          }, [
            this.el('span', {}, `El Abismo Infinito (Piso ${abFl} · Récord: ${abBest})`),
            this.el('span', { style: 'color:#ffd54f;font-size:12px;font-weight:900;' }, 'T23 ENDGAME')
          ]));
        }

        // List all 75 dungeons with strict Biome Lock enforcement
        const allDefs = Object.values(Abyssea.DUNGEON_DEFS || {});
        allDefs.forEach(d => {
          const gate = gatesObj[d.id] || null;
          const targetBiomeKey = (gate && gate.biome) || d.themeKey || d.biomeId || 'pradera';
          const dmBiome = BIOMES[targetBiomeKey] || BIOMES.pradera;
          const isIslandUnlocked = gate && gate.plot && unlockedPlots.some(([gx, gy]) => gx === gate.plot[0] && gy === gate.plot[1]);
          const isBiomeUnlocked = unlockedBiomes.has(targetBiomeKey);
          const isCleared = clearedSet.has(d.id);
          const isAvailable = isCleared || isBiomeUnlocked || isIslandUnlocked || (g.player && g.player.godMode);
          const isFinalBoss = d.id === 'eclipse_carmesi' || (gate && gate.isFinal);

          if (isAvailable) {
            dList.appendChild(this.el('button', {
              class: 'btn btn-sm',
              style: 'justify-content:space-between;margin-bottom:4px;' + (isFinalBoss ? 'background:linear-gradient(90deg, rgba(183,28,28,0.35), rgba(136,14,79,0.35));border:1.5px solid #ff5252;' : ''),
              onclick: () => { this.closeModal(); g.enterDungeon(d.id); }
            }, [
              this.el('span', { style: isFinalBoss ? 'color:#ff8a80;font-weight:900;' : '' }, [
                isFinalBoss ? '[JEFE] ' : '',
                tr('bldg.dungeonRow', { name: d.name, biome: dmBiome.name, lvl: d.recLevel || 2 })
              ]),
              isCleared ? this.uiIcon('iconCheck', 14) : (isFinalBoss ? this.el('span', { style: 'color:#ffd54f;font-size:11px;font-weight:900;padding:2px 6px;background:rgba(0,0,0,0.4);border-radius:3px;' }, 'JEFE FINAL') : null)
            ]));
          } else {
            // Locked: Biome has not been unlocked in the world
            dList.appendChild(this.el('button', {
              class: 'btn btn-sm',
              style: 'justify-content:space-between;margin-bottom:4px;opacity:0.42;background:rgba(20,22,28,0.7);border:1px dashed #546e7a;cursor:not-allowed;color:#90a4ae;',
              onclick: () => {
                g.toast(`Mazmorra bloqueada: debes explorar y desbloquear el bioma ${dmBiome.name} en el archipiélago primero.`, 'warn');
                if (Abyssea.Audio && typeof Abyssea.Audio.play === 'function') Abyssea.Audio.play('error');
              }
            }, [
              this.el('span', {}, [
                isFinalBoss ? '[BLOQUEADA - JEFE] ' : '[BLOQUEADA] ',
                `${d.name} (${dmBiome.name} · Nv.${d.recLevel || 2}+)`
              ]),
              this.el('span', { style: 'color:#ffab91;font-size:11px;font-weight:bold;' }, 'BLOQUEADA')
            ]));
          }
        });

        body.appendChild(this.el('div', { class: 'card', style: 'margin-bottom:12px;' }, [
          this.el('strong', { style: 'color:#ff8a65;' }, tr('bldg.enterDungeonTitle', { n: allDefs.length })),
          dList
        ]));
      }

      if (def.opensPanel === 'cofre_logistico' || b.type === 'cofre_logistico') {
        this.renderLogisticChest(body, b);
        appendFooter();
        return;
      }

      if (def.opensPanel === 'basurero' || b.type === 'basurero') {
        this.renderTrashBin(body, b);
        appendFooter();
        return;
      }

      if (def.station) {
        if (def.station === 'forja' || def.station === 'yunque_runico') {
          this.renderForjaCategories(body, def.station, false);
        } else if (def.station === 'alquimia' && typeof this.renderAlchemyLab === 'function') {
          this.renderAlchemyLab(body);
        } else {
          if (def.station === 'mesa_hechiceria') {
            body.appendChild(this.el('div', { class: 'card', style: 'margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;' }, [
              this.el('strong', { style: 'color:#ce93d8;' }, 'Círculo de Invocación y Rituales del Grimorio'),
              this.el('button', {
                class: 'btn btn-gold btn-sm',
                onclick: () => this.openModal('grimorio')
              }, 'Abrir Rituales de Hechizos')
            ]));
          }
          this.renderStationCategories(body, def.station);
        }
      }

      appendFooter();
    }

    renderOmegaNexus(body, b, def) {
      const g = this.game;
      if (!g.omega) return;
      const plotKey = Abyssea.OmegaSystem.plotKeyOf(b.tx, b.ty);
      this.omegaNexusTab = this.omegaNexusTab || 'storage';

      const tabRow = this.el('div', { style: 'display:flex;gap:8px;margin-bottom:12px;border-bottom:1px solid rgba(255,213,79,0.25);padding-bottom:8px;' }, [
        this.el('button', {
          class: 'btn btn-sm ' + (this.omegaNexusTab === 'storage' ? 'btn-gold' : 'btn-stone'),
          onclick: () => { this.omegaNexusTab = 'storage'; this.renderModal(); }
        }, 'Almacén Virtual'),
        this.el('button', {
          class: 'btn btn-sm ' + (this.omegaNexusTab === 'energy' ? 'btn-gold' : 'btn-stone'),
          onclick: () => { this.omegaNexusTab = 'energy'; this.renderModal(); }
        }, 'Red de Energía'),
        this.el('button', {
          class: 'btn btn-sm ' + (this.omegaNexusTab === 'research' ? 'btn-gold' : 'btn-stone'),
          onclick: () => { this.omegaNexusTab = 'research'; this.renderModal(); }
        }, 'Investigación Omega')
      ]);
      body.appendChild(tabRow);

      if (this.omegaNexusTab === 'storage') {
        const nData = g.omega.nexusData(plotKey);
        const cap = g.omega.nexusCapacity(plotKey, b);
        const used = g.omega.nexusUsed(plotKey);
        const pct = Math.min(100, Math.round((used / Math.max(1, cap)) * 100));

        const barCard = this.el('div', { class: 'card', style: 'margin-bottom:10px;padding:10px;' }, [
          this.el('div', { style: 'display:flex;justify-content:space-between;font-size:13px;font-weight:bold;margin-bottom:6px;' }, [
            this.el('span', { style: 'color:#b8d4ec;' }, `Capacidad de Almacén: ${used} / ${cap} unidades`),
            this.el('span', { style: `color:${pct >= 95 ? '#ff5252' : '#80d8ff'};` }, `${pct}%`)
          ]),
          this.el('div', { style: 'width:100%;height:10px;background:rgba(0,0,0,0.5);border-radius:4px;overflow:hidden;border:1px solid rgba(128,216,255,0.3);' }, [
            this.el('div', { style: `width:${pct}%;height:100%;background:${pct >= 95 ? '#ff5252' : 'linear-gradient(90deg, #00b0ff, #00e676)'};transition:width 0.2s;` })
          ])
        ]);
        body.appendChild(barCard);

        const actionsRow = this.el('div', { style: 'display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;' }, [
          this.el('button', {
            class: 'btn btn-primary btn-sm',
            onclick: () => {
              let count = 0;
              for (const [id, q] of Object.entries(g.inventory || {})) {
                if (q > 0) {
                  const it = Abyssea.ITEMS[id];
                  if (it && (it.isOre || it.isIngot || it.isCrop || it.category === 'minerales' || it.category === 'cultivos' || it.category === 'especiales' || /fragmento_|polvo_|cristal_datos_|lingote_|mineral_|materia_/.test(id))) {
                    const r = g.omega.depositFromInventory(g, plotKey, id, q);
                    if (r.ok) count += q;
                  }
                }
              }
              if (count > 0) {
                Abyssea.Audio.play('pickup');
                g.toast(`Depositados ${count} objetos en el Nexo.`, 'success');
                this.renderModal();
              } else {
                g.toast('No tienes recursos válidos para depositar.', 'warn');
              }
            }
          }, 'Depositar Recursos Compatibles'),
          this.el('button', {
            class: 'btn btn-stone btn-sm',
            onclick: () => {
              let count = 0;
              for (const [id, q] of Object.entries(nData.items || {})) {
                if (q > 0) {
                  const r = g.omega.withdrawToInventory(g, plotKey, id, q);
                  if (r.ok) count += q;
                }
              }
              if (count > 0) {
                Abyssea.Audio.play('pickup');
                g.toast(`Retirados ${count} objetos al inventario.`, 'info');
                this.renderModal();
              } else {
                g.toast('Almacén virtual vacío.', 'warn');
              }
            }
          }, 'Retirar Todo')
        ]);
        body.appendChild(actionsRow);

        const omegaSlotNodes = [];
        const applyOmegaFilter = (catId, searchQ) => {
          omegaSlotNodes.forEach(({ id, el }) => {
            el.style.display = this._storageItemMatches(id, catId, searchQ) ? '' : 'none';
          });
        };
        const omegaFilterState = this._renderStorageFilterBar(body, 'omega_storage', applyOmegaFilter);

        const itemsGrid = this.el('div', {
          style: 'display:grid;grid-template-columns:repeat(auto-fill, minmax(70px, 1fr));gap:6px;max-height:240px;overflow-y:auto;background:rgba(0,0,0,0.35);padding:8px;border-radius:6px;border:1px solid rgba(255,255,255,0.1);'
        });
        const entries = Object.entries(nData.items || {}).filter(([k, q]) => q > 0);
        if (!entries.length) {
          itemsGrid.appendChild(this.el('div', { style: 'grid-column:1/-1;text-align:center;padding:20px;color:#8ba2b8;font-size:13px;' },
            'Almacén virtual vacío. Los extractores, domos y procesadoras conectadas depositarán automáticamente sus productos aquí.'));
        } else {
          for (const [id, q] of entries) {
            const it = Abyssea.ITEMS[id] || { name: id, icon: 'piedra' };
            const itemBox = this.el('button', {
              class: 'btn btn-stone',
              style: 'padding:4px;display:flex;flex-direction:column;align-items:center;position:relative;min-height:64px;justify-content:center;',
              title: `${it.name} (Clic para retirar 1, Shift para 10)`,
              onclick: (e) => {
                const takeQty = e.shiftKey ? Math.min(10, q) : 1;
                const r = g.omega.withdrawToInventory(g, plotKey, id, takeQty);
                if (r.ok) {
                  Abyssea.Audio.play('pickup');
                  this.renderModal();
                } else {
                  g.toast(r.reason, 'warn');
                }
              }
            }, [
              this.itemIcon(it.icon || id, 28),
              this.el('span', { style: 'font-size:11px;font-weight:bold;color:#ffd54f;margin-top:2px;' }, `x${q}`)
            ]);
            omegaSlotNodes.push({ id, el: itemBox });
            itemsGrid.appendChild(itemBox);
          }
        }
        body.appendChild(itemsGrid);
        applyOmegaFilter(omegaFilterState.cat, omegaFilterState.search);
      } else if (this.omegaNexusTab === 'energy') {
        const nets = g.omega.networks(g);
        const net = nets.get(plotKey) || { gens: [], consumers: [], pylons: [] };
        const nData = g.omega.nexusData(plotKey);
        const baseBuf = (Abyssea.OMEGA_CONFIG && Abyssea.OMEGA_CONFIG.nexusEnergyBuffer && Abyssea.OMEGA_CONFIG.nexusEnergyBuffer[Math.min(2, Math.max(0, (b.level || 1) - 1))]) || 2000;
        let batBonus = 0;
        for (const cEntry of net.consumers) {
          if (cEntry.def.omega.kind === 'battery') {
            const arr = cEntry.def.omega.capBonus || [5000, 15000, 40000];
            batBonus += arr[Math.min(2, Math.max(0, (cEntry.b.level || 1) - 1))] || 5000;
          }
        }
        const bufCap = nData.bufCap || (baseBuf + batBonus);
        const curEn = Math.round(nData.energy || 0);
        const enPct = Math.min(100, Math.round((curEn / Math.max(1, bufCap)) * 100));
        let totalGen = 0;
        let totalDem = 0;
        for (const gEntry of net.gens) {
          totalGen += g.omega.genOutput(gEntry, plotKey);
        }
        for (const cEntry of net.consumers) {
          totalDem += g.omega.consumerDemand(cEntry);
        }
        const bal = totalGen - totalDem;

        body.appendChild(this.el('div', { class: 'card', style: 'margin-bottom:10px;padding:10px;' }, [
          this.el('div', { style: 'display:flex;justify-content:space-between;font-size:13px;font-weight:bold;margin-bottom:6px;' }, [
            this.el('span', { style: 'color:#80d8ff;' }, `Reserva Energética del Nexo: ${curEn} / ${bufCap} W·s${batBonus > 0 ? ` (+${batBonus} por Acumuladores)` : ''}`),
            this.el('span', { style: 'color:#69f0ae;' }, `${enPct}%`)
          ]),
          this.el('div', { style: 'width:100%;height:10px;background:rgba(0,0,0,0.5);border-radius:4px;overflow:hidden;border:1px solid rgba(0,229,255,0.35);' }, [
            this.el('div', { style: `width:${enPct}%;height:100%;background:linear-gradient(90deg, #00e5ff, #e040fb);transition:width 0.2s;` })
          ])
        ]));

        const statGrid = this.el('div', { style: 'display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px;' }, [
          this.el('div', { class: 'card', style: 'padding:8px;text-align:center;' }, [
            this.el('div', { style: 'font-size:12px;color:#a5d6a7;' }, 'Generación'),
            this.el('strong', { style: 'font-size:16px;color:#69f0ae;' }, `+${Math.round(totalGen)} W`)
          ]),
          this.el('div', { class: 'card', style: 'padding:8px;text-align:center;' }, [
            this.el('div', { style: 'font-size:12px;color:#ffab91;' }, 'Demanda'),
            this.el('strong', { style: 'font-size:16px;color:#ff7043;' }, `-${Math.round(totalDem)} W`)
          ]),
          this.el('div', { class: 'card', style: 'padding:8px;text-align:center;' }, [
            this.el('div', { style: 'font-size:12px;color:#b8d4ec;' }, 'Balance Neto'),
            this.el('strong', { style: `font-size:16px;color:${bal >= 0 ? '#69f0ae' : '#ff5252'};` }, `${bal >= 0 ? '+' : ''}${Math.round(bal)} W`)
          ])
        ]);
        body.appendChild(statGrid);

        const listWrap = this.el('div', { style: 'max-height:220px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;' });
        const allNodes = [...net.gens, ...net.consumers];
        if (!allNodes.length) {
          listWrap.appendChild(this.el('div', { style: 'text-align:center;padding:16px;color:#8ba2b8;font-size:13px;' },
            'No hay generadores ni máquinas conectadas a este Nexo. Coloca generadores y pilones de enlace para extender la red.'));
        } else {
          for (const node of allNodes) {
            const bDef = Abyssea.BUILDINGS[node.b.type];
            const isGen = node.def.omega.kind === 'generator';
            const statText = isGen ? `+${Math.round(g.omega.genOutput(node, plotKey))} W` : `-${Math.round(g.omega.consumerDemand(node))} W`;
            const row = this.el('div', {
              class: 'card',
              style: 'display:flex;align-items:center;justify-content:space-between;padding:6px 10px;font-size:13px;'
            }, [
              this.el('div', { style: 'display:flex;align-items:center;gap:8px;' }, [
                this.makeBuildingThumb(bDef, 30),
                this.el('div', {}, [
                  this.el('strong', { style: 'color:#fff;' }, bDef.name),
                  this.el('div', { style: 'font-size:11px;color:#80d8ff;' }, node.b.omega ? node.b.omega.reason || node.b.omega.state : '')
                ])
              ]),
              this.el('div', { style: 'display:flex;align-items:center;gap:10px;' }, [
                this.el('span', { style: `font-weight:bold;color:${isGen ? '#69f0ae' : '#ffd54f'};` }, statText),
                !isGen ? this.el('button', {
                  class: 'btn btn-stone btn-sm',
                  style: 'font-size:11px;padding:2px 6px;',
                  title: 'Cambiar prioridad energética (1: Baja, 2: Media, 3: Alta)',
                  onclick: () => {
                    node.b.omega.prio = ((node.b.omega.prio || 2) % 3) + 1;
                    this.renderModal();
                  }
                }, `Prio: ${node.b.omega.prio || 2}`) : null
              ])
            ]);
            listWrap.appendChild(row);
          }
        }
        body.appendChild(listWrap);
      } else if (this.omegaNexusTab === 'research') {
        const state = g.omega.state;
        const R_LIST = Abyssea.OmegaSystem.RESEARCH || [];
        const researchedCount = Object.keys(state.research || {}).length;

        const headerCard = this.el('div', { class: 'card', style: 'padding:8px 12px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;' }, [
          this.el('strong', { style: 'color:#e040fb;' }, `Tecnologías Omega: ${researchedCount} / ${R_LIST.length}`),
          this.el('span', { style: 'font-size:12px;color:#b8d4ec;' }, `Singularidades en almacén: ${g.omega.nexusCount(plotKey, 'singularidad') + (g.inventory.singularidad || 0)}`)
        ]);
        body.appendChild(headerCard);

        const treeGrid = this.el('div', {
          style: 'display:grid;grid-template-columns:repeat(auto-fill, minmax(260px, 1fr));gap:8px;max-height:260px;overflow-y:auto;padding-right:4px;'
        });

        for (const r of R_LIST) {
          const status = g.omega.researchStatus(g, r.id);
          const isDone = g.omega.hasResearch(r.id);
          const isAvail = status.ok;

          const rCard = this.el('div', {
            class: 'card',
            style: `padding:8px;border:1px solid ${isDone ? '#69f0ae' : (isAvail ? '#ffd54f' : 'rgba(255,255,255,0.15)')};background:${isDone ? 'rgba(46,125,50,0.15)' : (isAvail ? 'rgba(255,213,79,0.08)' : 'rgba(0,0,0,0.3)')};display:flex;flex-direction:column;gap:4px;`
          }, [
            this.el('div', { style: 'display:flex;justify-content:space-between;align-items:center;' }, [
              this.el('strong', { style: `color:${isDone ? '#a5d6a7' : (isAvail ? '#ffe082' : '#90a4ae')};font-size:13px;` }, r.name),
              this.el('span', {
                style: `font-size:10px;font-weight:900;padding:2px 5px;border-radius:3px;background:${isDone ? '#2e7d32' : (isAvail ? '#f57f17' : '#37474f')};color:#fff;`
              }, isDone ? 'INVESTIGADO' : (isAvail ? 'DISPONIBLE' : 'BLOQUEADO'))
            ]),
            this.el('div', { style: 'font-size:12px;color:#dce8f5;line-height:1.35;' }, r.desc),
            this.el('div', { style: 'font-size:11px;color:#b0bec5;margin-top:2px;' }, `Coste: ${g.omega.fmtMap(r.cost)}`),
            !isDone ? this.el('button', {
              class: isAvail ? 'btn btn-gold btn-sm' : 'btn btn-stone btn-sm',
              disabled: isAvail ? null : 'disabled',
              style: 'margin-top:4px;align-self:flex-start;',
              onclick: () => {
                const res = g.omega.researchAtomic(g, plotKey, r.id);
                if (res.ok) {
                  Abyssea.Audio.play('levelup');
                  g.toast(`¡Investigado: ${r.name}!`, 'success');
                  this.renderModal();
                } else {
                  Abyssea.Audio.play('error');
                  g.toast(res.reason, 'warn');
                }
              }
            }, isAvail ? 'Investigar Tecnología' : (status.reason || 'Bloqueado')) : null
          ]);
          treeGrid.appendChild(rCard);
        }
        body.appendChild(treeGrid);
      }
    }

    renderOmegaPress(body, b, def) {
      const g = this.game;
      if (!g.omega) return;
      const plotKey = Abyssea.OmegaSystem.plotKeyOf(b.tx, b.ty);
      const o = g.omega.ensureOmegaState(b);
      const cost = g.omega.pressCost();
      const CATS = Abyssea.OmegaSystem.PRESS_CATEGORIES;
      const currentCat = o.category;

      const catSelectRow = this.el('div', { style: 'display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap;' });
      for (const catId of Object.keys(CATS)) {
        const isSel = currentCat === catId;
        catSelectRow.appendChild(this.el('button', {
          class: 'btn btn-sm ' + (isSel ? 'btn-gold' : 'btn-stone'),
          onclick: () => {
            const r = g.omega.pressSetCategory(b, catId);
            if (r.ok) {
              this.renderModal();
            } else {
              g.toast(r.reason, 'warn');
            }
          }
        }, catId.charAt(0).toUpperCase() + catId.slice(1)));
      }
      body.appendChild(catSelectRow);

      if (!currentCat) {
        body.appendChild(this.el('div', { class: 'parchment-box', style: 'text-align:center;padding:24px;color:#b8d4ec;' },
          `Selecciona una categoría de recursos para calibrar la Prensa de Singularidades. Requiere ${cost.toLocaleString('es-ES')} recursos compatibles de dicha categoría para condensar 1 Singularidad.`));
        return;
      }

      const dep = o.deposit || {};
      let totalDep = 0;
      for (const q of Object.values(dep)) totalDep += q;
      const pct = Math.min(100, Math.round((totalDep / cost) * 100));

      const compCard = this.el('div', { class: 'card', style: 'padding:12px;margin-bottom:12px;' }, [
        this.el('div', { style: 'display:flex;justify-content:space-between;margin-bottom:6px;' }, [
          this.el('strong', { style: 'color:#ea80fc;font-size:15px;' }, `Compresión de ${currentCat.toUpperCase()}`),
          this.el('span', { style: 'color:#ffd54f;font-weight:bold;' }, `${totalDep} / ${cost} (${pct}%)`)
        ]),
        this.el('div', { style: 'width:100%;height:12px;background:rgba(0,0,0,0.5);border-radius:6px;overflow:hidden;border:1px solid #ba68c8;margin-bottom:10px;' }, [
          this.el('div', { style: `width:${pct}%;height:100%;background:linear-gradient(90deg, #7b1fa2, #e040fb);transition:width 0.2s;` })
        ]),
        this.el('div', { style: 'font-size:13px;color:#dce8f5;line-height:1.45;' },
          `Objetivo: 1x Singularidad. La prensa extraerá recursos de la categoría «${currentCat}» automáticamente del Nexo mientras reciba suficiente energía (200 W).`),
        this.el('div', { style: 'display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;' }, [
          this.el('button', {
            class: 'btn btn-primary btn-sm',
            onclick: () => {
              const it = g.omega.nexusData(plotKey).items;
              if (!o.deposit) o.deposit = {};
              let added = 0;
              for (const id of CATS[currentCat] || []) {
                const avail = it[id] || 0;
                if (avail > 0 && totalDep + added < cost) {
                  const take = Math.min(avail, cost - (totalDep + added));
                  if (take > 0 && g.omega.nexusTake(plotKey, { [id]: take })) {
                    o.deposit[id] = (o.deposit[id] || 0) + take;
                    added += take;
                  }
                }
              }
              if (added > 0) {
                Abyssea.Audio.play('pickup');
                g.toast(`Transferidos ${added} recursos del Nexo a la prensa.`, 'success');
                this.renderModal();
              } else {
                g.toast('No hay más recursos compatibles en el Nexo.', 'warn');
              }
            }
          }, 'Cargar Recursos del Nexo'),
          totalDep > 0 ? this.el('button', {
            class: 'btn btn-stone btn-sm',
            onclick: () => {
              const r = g.omega.pressCancel(plotKey, b);
              if (r.ok) {
                Abyssea.Audio.play('pickup');
                g.toast('Compresión cancelada. Materiales devueltos al Nexo.', 'info');
                this.renderModal();
              } else {
                g.toast(r.reason, 'warn');
              }
            }
          }, 'Cancelar y Devolver Materiales') : null
        ])
      ]);
      body.appendChild(compCard);
    }

    renderOmegaChamber(body, b, def) {
      const g = this.game;
      if (!g.omega) return;
      const plotKey = Abyssea.OmegaSystem.plotKeyOf(b.tx, b.ty);
      const o = g.omega.ensureOmegaState(b);

      const statusCard = this.el('div', { class: 'card', style: 'padding:10px;margin-bottom:12px;' }, [
        this.el('div', { style: 'display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;' }, [
          this.el('strong', { style: 'color:#80d8ff;font-size:15px;' }, 'Estado de la Simulación'),
          this.el('span', {
            style: `font-size:11px;font-weight:900;padding:2px 6px;border-radius:3px;background:${o.crystal ? '#00c853' : '#37474f'};color:#fff;`
          }, o.crystal ? 'SIMULANDO' : 'INACTIVA')
        ]),
        o.crystal ? this.el('div', {}, [
          this.el('div', { style: 'font-size:13px;color:#e1f5fe;margin-bottom:4px;' },
            `Jefe Simulado: ${Abyssea.DUNGEON_DEFS[o.crystal.did]?.boss?.name || o.crystal.did} (Ciclos restantes: ${o.crystal.cycles})`),
          this.el('div', { style: 'width:100%;height:8px;background:rgba(0,0,0,0.5);border-radius:4px;overflow:hidden;border:1px solid #00e5ff;' }, [
            this.el('div', { style: `width:${Math.min(100, Math.round(((o.progress || 0) / 30) * 100))}%;height:100%;background:#00e5ff;` })
          ])
        ]) : this.el('div', { style: 'font-size:13px;color:#90a4ae;' },
          'Inserta un Cristal de Datos de Jefe sintetizado para comenzar la simulación de combate continua.')
      ]);
      body.appendChild(statusCard);

      const bossListWrap = this.el('div', { style: 'max-height:240px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;' });
      const dungDefs = Object.values(Abyssea.DUNGEON_DEFS || {});

      for (const d of dungDefs) {
        if (!d.boss) continue;
        const kills = g.omega.state.bossKills[d.id] || 0;
        const canMake = g.omega.canMakeCrystal(g, d.id);
        const crystalId = 'cristal_datos_' + d.id;
        const hasCrystal = (g.inventory[crystalId] || 0) > 0 || (g.omega.nexusCount(plotKey, crystalId) > 0);

        const row = this.el('div', {
          class: 'card',
          style: 'display:flex;align-items:center;justify-content:space-between;padding:8px 10px;font-size:13px;'
        }, [
          this.el('div', {}, [
            this.el('strong', { style: 'color:#fff;' }, d.boss.name),
            this.el('div', { style: 'font-size:11px;color:#b0bec5;' }, `Derrotas registradas: ${kills} / 3 necesarias`)
          ]),
          this.el('div', { style: 'display:flex;gap:6px;' }, [
            hasCrystal ? this.el('button', {
              class: 'btn btn-primary btn-sm',
              disabled: o.crystal ? 'disabled' : null,
              onclick: () => {
                if ((g.inventory[crystalId] || 0) > 0 && g.omega.nexusCount(plotKey, crystalId) === 0) {
                  g.omega.depositFromInventory(g, plotKey, crystalId, 1);
                }
                const r = g.omega.insertCrystal(g, plotKey, b, d.id);
                if (r.ok) {
                  Abyssea.Audio.play('portal');
                  g.toast(`¡Iniciada simulación de ${d.boss.name}!`, 'success');
                  this.renderModal();
                } else {
                  g.toast(r.reason, 'warn');
                }
              }
            }, 'Insertar y Simular') : this.el('button', {
              class: canMake.ok ? 'btn btn-gold btn-sm' : 'btn btn-stone btn-sm',
              disabled: canMake.ok ? null : 'disabled',
              onclick: () => {
                const r = g.omega.craftCrystal(g, plotKey, d.id);
                if (r.ok) {
                  Abyssea.Audio.play('pickup');
                  g.toast(`Cristal de ${d.boss.name} sintetizado.`, 'success');
                  this.renderModal();
                } else {
                  Abyssea.Audio.play('error');
                  g.toast(r.reason, 'warn');
                }
              }
            }, canMake.ok ? 'Sintetizar Cristal' : 'Bloqueado')
          ])
        ]);
        bossListWrap.appendChild(row);
      }
      body.appendChild(bossListWrap);
    }

    renderOmegaAltar(body, b, def) {
      const g = this.game;
      if (!g.omega) return;
      const plotKey = Abyssea.OmegaSystem.plotKeyOf(b.tx, b.ty);
      this.omegaAltarTarget = this.omegaAltarTarget || 'tool:espada';

      const candidateKeys = [];
      for (const tid of ['espada', 'arco', 'pico', 'hacha', 'pala']) {
        if (g.toolTiers && g.toolTiers[tid]) candidateKeys.push('tool:' + tid);
      }
      for (const [slot, id] of Object.entries(g.equipped || {})) {
        if (id && Abyssea.ITEMS[id]) candidateKeys.push(id);
      }

      const selRow = this.el('div', { style: 'display:flex;gap:6px;margin-bottom:12px;overflow-x:auto;padding-bottom:6px;' });
      for (const k of candidateKeys) {
        const info = g.omega.overloadKeyInfo(g, k);
        if (!info) continue;
        const isSel = this.omegaAltarTarget === k;
        const lvl = g.omega.overloadLevel(k);
        selRow.appendChild(this.el('button', {
          class: 'btn btn-sm ' + (isSel ? 'btn-gold' : 'btn-stone'),
          style: 'white-space:nowrap;',
          onclick: () => { this.omegaAltarTarget = k; this.renderModal(); }
        }, `${info.name} (+${lvl})`));
      }
      body.appendChild(selRow);

      const targetKey = this.omegaAltarTarget;
      const info = g.omega.overloadKeyInfo(g, targetKey);
      if (!info) {
        body.appendChild(this.el('div', { class: 'parchment-box', style: 'text-align:center;padding:16px;' }, 'Selecciona un equipo o herramienta para sobrecargar.'));
        return;
      }

      const curLvl = g.omega.overloadLevel(targetKey);
      const curPct = g.omega.overloadPct(info.cat, curLvl);
      const nextPct = g.omega.overloadPct(info.cat, curLvl + 1);

      const infoCard = this.el('div', { class: 'card', style: 'padding:12px;margin-bottom:12px;' }, [
        this.el('div', { style: 'display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;' }, [
          this.el('strong', { style: 'color:#ffd54f;font-size:16px;' }, `${info.name} — Nivel +${curLvl}`),
          this.el('span', { style: 'color:#80d8ff;font-weight:bold;' }, `Bonus Actual: +${curPct}%`)
        ]),
        this.el('div', { style: 'font-size:13px;color:#dce8f5;line-height:1.45;' },
          `Tipo de Sobrecarga: ${info.cat === 'damage' ? 'Daño Bruto' : (info.cat === 'defense' ? 'Defensa y Salud' : 'Potencia de Extracción')}. Siguiente nivel: +${nextPct}%. Fórmulas de coste exponencial Base × 1.35^Nivel.`)
      ]);
      body.appendChild(infoCard);

      const buyRows = this.el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:8px;' });
      const counts = [1, 10, 50];
      for (const n of counts) {
        const q = g.omega.overloadQuote(g, targetKey, n, plotKey);
        const costStr = q.ok ? g.omega.fmtMap(q.cost) : 'N/A';
        buyRows.appendChild(this.el('button', {
          class: q.ok && q.affordable ? 'btn btn-primary' : 'btn btn-stone',
          disabled: q.ok && q.affordable ? null : 'disabled',
          style: 'padding:8px;display:flex;flex-direction:column;align-items:center;gap:3px;',
          onclick: () => {
            const r = g.omega.overloadBuy(g, targetKey, n, plotKey);
            if (r.ok) {
              Abyssea.Audio.play('levelup');
              g.toast(`¡Sobrecargado ${info.name} a +${r.to}!`, 'success');
              this.renderModal();
            } else {
              Abyssea.Audio.play('error');
              g.toast(r.reason, 'warn');
            }
          }
        }, [
          this.el('strong', {}, `+${n} Niveles`),
          this.el('span', { style: 'font-size:11px;color:#ffd54f;' }, costStr)
        ]));
      }

      const maxN = g.omega.overloadMaxAffordable(g, targetKey, plotKey, 500);
      const maxQuote = maxN > 0 ? g.omega.overloadQuote(g, targetKey, maxN, plotKey) : null;
      buyRows.appendChild(this.el('button', {
        class: maxN > 0 ? 'btn btn-gold' : 'btn btn-stone',
        disabled: maxN > 0 ? null : 'disabled',
        style: 'padding:8px;display:flex;flex-direction:column;align-items:center;gap:3px;',
        onclick: () => {
          if (maxN <= 0) return;
          const r = g.omega.overloadBuy(g, targetKey, maxN, plotKey);
          if (r.ok) {
            Abyssea.Audio.play('levelup');
            g.toast(`¡Sobrecargado al máximo posible: +${r.to}!`, 'success');
            this.renderModal();
          } else {
            Abyssea.Audio.play('error');
            g.toast(r.reason, 'warn');
          }
        }
      }, [
        this.el('strong', {}, `Máximo Posible (+${maxN})`),
        this.el('span', { style: 'font-size:11px;' }, maxQuote ? g.omega.fmtMap(maxQuote.cost) : 'Sin recursos suficientes')
      ]));

      body.appendChild(buyRows);
    }

    renderOmegaMachine(body, b, def) {
      const g = this.game;
      if (!g.omega) return;
      const plotKey = Abyssea.OmegaSystem.plotKeyOf(b.tx, b.ty);
      const o = g.omega.ensureOmegaState(b);
      const kind = def.omega.kind;
      const isGen = kind === 'generator';
      const isBat = kind === 'battery';
      const isPylon = kind === 'pylon';
      const genDef = isGen && Abyssea.OmegaSystem.GENERATORS ? Abyssea.OmegaSystem.GENERATORS[b.type] : null;
      const lvlIdx = Math.min(2, Math.max(0, (b.level || 1) - 1));
      const genMult = [1, 1.6, 2.4][lvlIdx] || 1;
      const powerVal = isGen
        ? Math.round((genDef ? genDef.out : 40) * genMult * (1 + g.omega.getMod('genOutput')))
        : (o.job && o.job.power ? o.job.power : (def.omega.power || 0));

      const energyDesc = isGen
        ? `+${powerVal} W/s (Producción Energética)`
        : isBat
        ? `+${(def.omega.capBonus && def.omega.capBonus[lvlIdx]) || 5000} W·s (Reserva de Batería)`
        : isPylon
        ? `Capacidad de transmisión: ${((Abyssea.OMEGA_CONFIG && Abyssea.OMEGA_CONFIG.pylonCapacity) || [60, 180, 540])[lvlIdx]} W/s`
        : `-${powerVal} W/s (Consumo de Red)`;

      const card = this.el('div', { class: 'card', style: 'padding:12px;margin-bottom:12px;' }, [
        this.el('div', { style: 'display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;' }, [
          this.el('strong', { style: 'color:#fff;font-size:15px;' }, def.name),
          this.el('span', {
            style: `font-size:11px;font-weight:900;padding:2px 6px;border-radius:3px;background:${o.state === 'activa' ? '#2e7d32' : '#c62828'};color:#fff;`
          }, o.state ? o.state.toUpperCase() : 'CONECTADA')
        ]),
        this.el('div', { style: 'font-size:13px;color:#80d8ff;font-weight:600;margin-bottom:6px;' }, energyDesc),
        this.el('div', { style: 'font-size:12px;color:#dce8f5;margin-bottom:8px;line-height:1.4;' }, def.desc || ''),
        o.reason ? this.el('div', { style: 'font-size:12px;color:#ffd54f;margin-bottom:8px;' }, o.reason) : null,
        (!isGen && !isBat && !isPylon) ? this.el('div', { style: 'display:flex;align-items:center;gap:8px;margin-top:6px;' }, [
          this.el('span', { style: 'font-size:12px;color:#b8d4ec;' }, 'Prioridad de energía:'),
          this.el('button', {
            class: 'btn btn-stone btn-sm ' + ((o.prio || 2) === 1 ? 'btn-gold' : ''),
            onclick: () => { o.prio = 1; this.renderModal(); }
          }, 'Baja'),
          this.el('button', {
            class: 'btn btn-stone btn-sm ' + ((o.prio || 2) === 2 ? 'btn-gold' : ''),
            onclick: () => { o.prio = 2; this.renderModal(); }
          }, 'Media'),
          this.el('button', {
            class: 'btn btn-stone btn-sm ' + ((o.prio || 2) === 3 ? 'btn-gold' : ''),
            onclick: () => { o.prio = 3; this.renderModal(); }
          }, 'Alta')
        ]) : null
      ]);
      body.appendChild(card);

      if (isGen && genDef && Array.isArray(genDef.fuels)) {
        body.appendChild(this.el('div', { class: 'parchment-box', style: 'padding:10px;font-size:13px;margin-bottom:10px;' }, [
          this.el('strong', { style: 'color:#69f0ae;display:block;margin-bottom:4px;' }, 'Combustibles Compatibles (desde el Nexo):'),
          this.el('div', { style: 'color:#dce8f5;line-height:1.45;' },
            genDef.fuels.map(f => `${(Abyssea.ITEMS[f.id] && Abyssea.ITEMS[f.id].name) || f.id} (${f.t}s por unidad · En Nexo: ${g.omega.nexusCount(plotKey, f.id)})`).join(' · '))
        ]));
      }

      if (kind === 'machine') {
        const mtype = def.omega.mtype;
        const recipes = (Abyssea.OmegaSystem.MACHINE_RECIPES && Abyssea.OmegaSystem.MACHINE_RECIPES[mtype]) || [];
        const curRec = o.recipe || 'auto';
        const recBox = this.el('div', { class: 'card', style: 'padding:10px;margin-bottom:10px;' }, [
          this.el('strong', { style: 'color:#ffe082;display:block;margin-bottom:8px;font-size:14px;' }, 'Receta de Procesamiento (Automático o Fijo):')
        ]);
        const btnWrap = this.el('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;' });
        btnWrap.appendChild(this.el('button', {
          class: 'btn btn-sm ' + (curRec === 'auto' ? 'btn-gold' : 'btn-stone'),
          onclick: () => { o.recipe = 'auto'; this.renderModal(); }
        }, 'Automático (Cualquier Receta Disponible)'));
        for (const r of recipes) {
          const unlocked = !r.reqResearch || g.omega.hasResearch(r.reqResearch);
          btnWrap.appendChild(this.el('button', {
            class: 'btn btn-sm ' + (curRec === r.id ? 'btn-gold' : 'btn-stone'),
            disabled: unlocked ? null : 'disabled',
            title: `${g.omega.fmtMap(r.in)} -> ${g.omega.fmtMap(r.out)} (${r.power} W/s, ${r.time}s)`,
            onclick: () => { o.recipe = r.id; this.renderModal(); }
          }, `${r.name} (${r.power}W)`));
        }
        recBox.appendChild(btnWrap);
        const listEl = this.el('div', { style: 'max-height:150px;overflow-y:auto;display:flex;flex-direction:column;gap:4px;font-size:12px;color:#dce8f5;' });
        for (const r of recipes) {
          listEl.appendChild(this.el('div', { style: 'padding:4px 6px;background:rgba(0,0,0,0.28);border-radius:4px;display:flex;justify-content:space-between;gap:8px;' }, [
            this.el('span', {}, `${r.name}: ${g.omega.fmtMap(r.in)} -> ${g.omega.fmtMap(r.out)}`),
            this.el('span', { style: 'color:#80d8ff;white-space:nowrap;' }, `${r.time}s · ${r.power} W/s`)
          ]));
        }
        recBox.appendChild(listEl);
        body.appendChild(recBox);
      }

      if (kind === 'extractor') {
        const biomeId = g.world.getBiomeAtPixel(b.tx * Abyssea.CONST.TILE_SIZE, b.ty * Abyssea.CONST.TILE_SIZE);
        const tbl = Abyssea.OmegaSystem.EXTRACT_TABLES[biomeId] || [];
        const resCard = this.el('div', { class: 'parchment-box', style: 'padding:10px;font-size:13px;' }, [
          this.el('strong', { style: 'color:#ffe082;display:block;margin-bottom:4px;' }, 'Vetas del Bioma Detectadas:'),
          this.el('div', { style: 'color:#dce8f5;line-height:1.4;' },
            tbl.length ? tbl.map(k => {
              const itemId = typeof k === 'object' ? k.id : k;
              return (Abyssea.ITEMS[itemId] && Abyssea.ITEMS[itemId].name) || itemId;
            }).join(', ') : 'Minerales estándar')
        ]);
        body.appendChild(resCard);
      }

      if (kind === 'condenser') {
        const cyc = (def.omega && def.omega.cycleSec) || 20;
        const pct = Math.min(100, Math.round(((o.progress || 0) / cyc) * 100));
        body.appendChild(this.el('div', { class: 'parchment-box', style: 'padding:10px;font-size:13px;' }, [
          this.el('strong', { style: 'color:#ea80fc;display:block;margin-bottom:6px;' }, `Progreso de Condensación Pura: ${pct}%`),
          this.el('div', { style: 'width:100%;height:10px;background:rgba(0,0,0,0.5);border-radius:4px;overflow:hidden;border:1px solid #ea80fc;margin-bottom:6px;' }, [
            this.el('div', { style: `width:${pct}%;height:100%;background:linear-gradient(90deg, #7b1fa2, #e040fb);` })
          ]),
          this.el('div', { style: 'color:#dce8f5;line-height:1.4;' },
            'Cada ciclo de 20s a 500 W/s genera Polvo Estelar x2, Cristales Mágicos x2 y un 25% de probabilidad de Materia Comprimida directamente en el Nexo.')
        ]));
      }
    }

    renderStationCategories(body, stationId) {
      const g = this.game;
      const allRecs = Abyssea.RECIPES.filter(r => r.station === stationId);
      if (!allRecs.length) return;

      this.stationTabs = this.stationTabs || {};
      const curTab = this.stationTabs[stationId] || 'todos';

      let catDefs = [['todos', tr('inv.tabAll')]];
      if (stationId === 'horno' || stationId === 'fundicion') {
        catDefs = [
          ['todos', tr('inv.tabAll')],
          ['lingotes', 'Lingotes'],
          ['aleaciones', 'Aleaciones / Materiales'],
          ['otros', 'Otros']
        ];
      } else if (stationId === 'aserradero') {
        catDefs = [
          ['todos', tr('inv.tabAll')],
          ['vigas', 'Tablones y Vigas'],
          ['maderas', 'Maderas Refinadas'],
          ['otros', 'Otros']
        ];
      } else if (stationId === 'telar') {
        catDefs = [
          ['todos', tr('inv.tabAll')],
          ['telas', 'Telas y Hilos'],
          ['armaduras', 'Prendas y Ropa'],
          ['pantalones', 'Pantalones']
        ];
      } else if (stationId === 'cocina') {
        catDefs = [
          ['todos', tr('inv.tabAll')],
          ['platos', 'Platos y Guisos'],
          ['pescados', 'Pescados y Brochetas'],
          ['otros', 'Otros']
        ];
      } else {
        catDefs = [
          ['todos', tr('inv.tabAll')],
          ['materiales', 'Materiales'],
          ['equipo', 'Equipo'],
          ['otros', 'Otros']
        ];
      }

      const tabs = this.el('div', { class: 'tab-row', style: 'margin-bottom:12px;' });
      catDefs.forEach(([catId, label]) => {
        tabs.appendChild(this.el('button', {
          class: 'tab-btn' + (curTab === catId ? ' active' : ''),
          onclick: () => {
            this.stationTabs[stationId] = catId;
            this.renderModal();
          }
        }, label));
      });
      body.appendChild(tabs);

      const filteredRecs = allRecs.filter(r => {
        if (curTab === 'todos') return true;
        const it = Abyssea.ITEMS[r.out] || {};
        const outId = r.out || '';
        if (stationId === 'horno' || stationId === 'fundicion') {
          if (curTab === 'lingotes') return outId.startsWith('lingote_') && !outId.includes('aleacion');
          if (curTab === 'aleaciones') return outId.includes('aleacion') || outId.includes('acero') || outId.includes('bronce') || outId === 'vidrio';
          return !outId.startsWith('lingote_') && !outId.includes('aleacion') && !outId.includes('acero') && !outId.includes('bronce') && outId !== 'vidrio';
        }
        if (stationId === 'aserradero') {
          if (curTab === 'vigas') return outId.includes('tablon') || outId.includes('viga');
          if (curTab === 'maderas') return outId.includes('madera_refinada') || outId.includes('madera');
          return !outId.includes('tablon') && !outId.includes('viga') && !outId.includes('madera');
        }
        if (stationId === 'telar') {
          const isTela = outId.includes('tela') || outId.includes('cuerda') || outId.includes('hilo') || outId.includes('fibra');
          const isPant = outId.includes('pantalones') || it.equipSlot === 'legs';
          const isArm = (it.equipSlot === 'armor' || it.equipSlot === 'helm') && !outId.includes('pantalones');
          if (curTab === 'telas') return isTela;
          if (curTab === 'armaduras') return isArm;
          if (curTab === 'pantalones') return isPant;
          return !isTela && !isArm && !isPant;
        }
        if (stationId === 'cocina') {
          const isPlato = outId.includes('estofado') || outId.includes('sopa') || outId.includes('guiso') || outId.includes('pan');
          const isPesc = outId.includes('sashimi') || outId.includes('brocheta') || outId.includes('pez') || outId.includes('pescado');
          if (curTab === 'platos') return isPlato;
          if (curTab === 'pescados') return isPesc;
          return !isPlato && !isPesc;
        }
        const isMat = it.category === 'materiales' || it.category === 'recursos';
        const isEq = Boolean(it.equipSlot || it.type === 'weapon' || it.category === 'equipamiento');
        if (curTab === 'materiales') return isMat;
        if (curTab === 'equipo') return isEq;
        return !isMat && !isEq;
      });

      const stRecs = this._sortRecipes(filteredRecs);
      if (stRecs.length) {
        body.appendChild(this.el('h4', { style: 'margin:8px 0;color:#ffd54f;' }, tr('bldg.stationRecipesTitle')));
        this._renderCraftingWorkspace(body, stRecs, { stationId, showStationLabel: false });
      } else {
        body.appendChild(this.el('div', { class: 'card', style: 'margin-bottom:12px;color:#90a4ae;' }, 'No hay recetas en esta categoría.'));
      }
    }

    renderLogisticChest(body, b) {
      const g = this.game;
      b.storage = b.storage || {};
      b.filters = b.filters || [];
      const totalStored = Object.values(b.storage).reduce((sum, q) => sum + (Number(q) || 0), 0);
      const cap = 300;

      body.appendChild(this.el('div', { class: 'parchment-box', style: 'margin-bottom:10px;' }, [
        this.el('div', { style: 'display:flex;justify-content:space-between;align-items:center;' }, [
          this.el('strong', { style: 'color:#ffd54f;font-size:16px;' }, 'Almacenamiento Inteligente'),
          this.el('span', { style: 'color:#80deea;font-weight:700;' }, `${totalStored} / ${cap} unidades`)
        ]),
        this.el('div', { style: 'font-size:14px;color:#b0bec5;margin-top:4px;' },
          'Las máquinas conectadas por tuberías envían automáticamente su exceso a este cofre cuando se llenan.'
        )
      ]));

      const filterWrap = this.el('div', { class: 'card', style: 'margin-bottom:12px;' });
      filterWrap.appendChild(this.el('strong', { style: 'color:#ffb74d;display:block;margin-bottom:6px;' }, 'Filtro de Recepción (Objetos aceptados):'));
      const activeFilterText = b.filters.length > 0
        ? b.filters.map(fid => (Abyssea.ITEMS[fid]?.name || fid)).join(', ')
        : 'Todos los objetos permitidos (Sin filtro restrictivo)';
      filterWrap.appendChild(this.el('div', { style: 'font-size:14px;color:#eceff1;margin-bottom:8px;' }, `Filtros activos: ${activeFilterText}`));

      const filterBtnRow = this.el('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;' });
      const commonFilters = [
        ['cat:minerales', 'Solo Minerales'],
        ['cat:peces', 'Solo Peces'],
        ['cat:semillas', 'Solo Semillas'],
        ['cat:cultivos', 'Solo Cultivos'],
        ['cat:botin', 'Solo Botín'],
        ['madera', 'Madera'],
        ['piedra', 'Piedra'],
        ['hierro', 'Hierro'],
        ['oro', 'Oro'],
        ['carbon', 'Carbón'],
        ['tablon', 'Tablones'],
        ['lingote_hierro', 'L. Hierro']
      ];
      commonFilters.forEach(([fId, fLabel]) => {
        const isF = b.filters.includes(fId);
        filterBtnRow.appendChild(this.el('button', {
          class: `btn btn-sm ${isF ? 'btn-green' : 'btn-stone'}`,
          onclick: () => {
            if (isF) b.filters = b.filters.filter(x => x !== fId);
            else b.filters.push(fId);
            this.renderModal();
          }
        }, `${isF ? '[OK] ' : '+ '}${fLabel}`));
      });
      if (b.filters.length > 0) {
        filterBtnRow.appendChild(this.el('button', {
          class: 'btn btn-sm btn-danger',
          onclick: () => { b.filters = []; this.renderModal(); }
        }, 'Limpiar Filtros'));
      }
      filterWrap.appendChild(filterBtnRow);
      body.appendChild(filterWrap);

      const logStorageNodes = [];
      const logDepositNodes = [];
      const applyLogisticFilter = (catId, searchQ) => {
        logStorageNodes.forEach(({ id, el }) => {
          el.style.display = this._storageItemMatches(id, catId, searchQ) ? '' : 'none';
        });
        logDepositNodes.forEach(({ id, el }) => {
          el.style.display = this._storageItemMatches(id, catId, searchQ) ? '' : 'none';
        });
      };
      const logFilterState = this._renderStorageFilterBar(body, 'logistic_chest', applyLogisticFilter);

      const stKeys = Object.keys(b.storage).filter(k => b.storage[k] > 0);
      body.appendChild(this.el('h4', { style: 'margin:8px 0;color:#80cbc4;' }, 'Contenido del Cofre (Retiro Gradual):'));
      if (stKeys.length === 0) {
        body.appendChild(this.el('div', { class: 'card', style: 'color:#90a4ae;margin-bottom:12px;' }, 'El cofre logístico está vacío actualmente.'));
      } else {
        const grid = this.el('div', { style: 'display:flex;flex-direction:column;gap:8px;margin-bottom:12px;max-height:240px;overflow-y:auto;' });
        stKeys.forEach(k => {
          const qty = b.storage[k];
          const it = Abyssea.ITEMS[k] || { name: k, icon: 'rubi' };
          const withdraw = (amount) => {
            const want = Math.min(qty, amount);
            if (want <= 0) return;
            const maxStack = g.getMaxStackSize ? g.getMaxStackSize() : 25;
            const maxSlots = g.getMaxInventorySlots ? g.getMaxInventorySlots() : 20;
            const usedSlots = g.getUsedInventorySlots ? g.getUsedInventorySlots() : Object.keys(g.inventory).length;
            const hbSlots = (g.hotbar || []).filter(s => s && s.kind === 'item' && s.id === k).length;
            const hbCap = hbSlots * maxStack;
            const totalQty = g.inventory[k] || 0;
            const freeInHb = Math.max(0, hbCap - Math.min(totalQty, hbCap));
            const curInvQty = Math.max(0, totalQty - hbCap);
            const mod = curInvQty % maxStack;
            const spaceInPartial = mod === 0 ? 0 : (maxStack - mod);
            const freeSlots = Math.max(0, maxSlots - usedSlots);
            const fit = freeInHb + spaceInPartial + (freeSlots * maxStack);
            const take = Math.min(want, fit);
            if (take <= 0) {
              g.toast('Inventario lleno. Libera espacio antes de retirar.', 'warn');
              return;
            }
            b.storage[k] -= take;
            if (b.storage[k] <= 0) delete b.storage[k];
            g.addItem(k, take);
            Abyssea.Audio.play('pickup');
            this.updateHUD(true);
            this.renderModal();
          };

          const itemRow = this.el('div', {
            class: 'card',
            style: 'display:flex;justify-content:space-between;align-items:center;padding:8px 12px;'
          }, [
            this.el('div', { style: 'display:flex;align-items:center;gap:10px;' }, [
              this.itemIcon(it.icon, 32),
              this.el('div', {}, [
                this.el('strong', { style: 'color:#fff;font-size:15px;' }, it.name),
                this.el('div', { style: 'color:#ffd54f;font-weight:700;' }, `x${qty}`)
              ])
            ]),
            this.el('div', { style: 'display:flex;gap:4px;' }, [
              this.el('button', { class: 'btn btn-sm btn-stone', onclick: () => withdraw(1) }, '-1'),
              this.el('button', { class: 'btn btn-sm btn-stone', onclick: () => withdraw(10) }, '-10'),
              this.el('button', { class: 'btn btn-sm btn-stone', onclick: () => withdraw(50) }, '-50'),
              this.el('button', { class: 'btn btn-sm btn-gold', onclick: () => withdraw(qty) }, 'Todo')
            ])
          ]);
          logStorageNodes.push({ id: k, el: itemRow });
          grid.appendChild(itemRow);
        });
        body.appendChild(grid);
      }

      const invDeposit = this.el('div', { class: 'card', style: 'margin-bottom:12px;' });
      const depHead = this.el('div', { style: 'display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;gap:8px;flex-wrap:wrap;' }, [
        this.el('strong', { style: 'color:#a5d6a7;' }, 'Depositar desde tu inventario:'),
        this.el('button', {
          class: 'btn btn-gold btn-sm',
          onclick: () => {
            let moved = 0;
            for (const [k, curQ] of Object.entries(b.storage || {})) {
              if (!curQ || curQ <= 0) continue;
              const have = g.inventory[k] || 0;
              if (have <= 0) continue;
              const curTot = Object.values(b.storage).reduce((s, q) => s + (Number(q) || 0), 0);
              const space = Math.max(0, cap - curTot);
              const take = Math.min(have, space);
              if (take > 0) {
                g.removeItem(k, take);
                b.storage[k] = (b.storage[k] || 0) + take;
                moved += take;
              }
            }
            if (moved > 0) {
              Abyssea.Audio.play('pickup');
              g.toast(`Apilados ${moved} objetos coincidentes en el cofre logístico.`, 'success');
              this.updateHUD(true);
              this.renderModal();
            } else {
              g.toast('No hay objetos coincidentes para apilar.', 'info');
            }
          }
        }, 'Guardar iguales (Stack All)')
      ]);
      invDeposit.appendChild(depHead);
      const invKeys = Object.keys(g.inventory).filter(k => g.inventory[k] > 0 && Abyssea.ITEMS[k]);
      if (invKeys.length === 0) {
        invDeposit.appendChild(this.el('div', { style: 'color:#90a4ae;' }, 'Tu inventario está vacío.'));
      } else {
        const depGrid = this.el('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;max-height:170px;overflow-y:auto;' });
        invKeys.forEach(k => {
          const count = g.inventory[k];
          const it = Abyssea.ITEMS[k] || { name: k };
          const depBtn = this.el('button', {
            class: 'btn btn-sm btn-stone',
            onclick: () => {
              const curTot = Object.values(b.storage).reduce((s, q) => s + (Number(q) || 0), 0);
              const space = Math.max(0, cap - curTot);
              if (space <= 0) {
                g.toast('El cofre logístico está lleno', 'warn');
                return;
              }
              const depositQty = Math.min(count, Math.min(10, space));
              g.removeItem(k, depositQty);
              b.storage[k] = (b.storage[k] || 0) + depositQty;
              Abyssea.Audio.play('pickup');
              this.updateHUD(true);
              this.renderModal();
            }
          }, `+10 ${it.name} (${count})`);
          logDepositNodes.push({ id: k, el: depBtn });
          depGrid.appendChild(depBtn);
        });
        invDeposit.appendChild(depGrid);
      }
      body.appendChild(invDeposit);
      applyLogisticFilter(logFilterState.cat, logFilterState.search);
    }

    renderTrashBin(body, b) {
      const g = this.game;
      b.storage = b.storage || {};
      const maxStack = g.getMaxStackSize ? g.getMaxStackSize() : 25;

      body.appendChild(this.el('div', { class: 'parchment-box', style: 'margin-bottom:10px;border-left:3px solid #ef5350;' }, [
        this.el('strong', { style: 'color:#ff8a80;font-size:15px;display:block;margin-bottom:4px;' }, 'Basurero / Incinerador de Objetos'),
        this.el('div', { style: 'font-size:13px;color:#dbe7f5;line-height:1.4;' },
          'Deposita aqui objetos de tu inventario para eliminarlos. Puedes recuperarlos antes de incinerarlos, o pulsar "Incinerar Todo" para borrarlos permanentemente.')
      ]));

      const trashNodes = [];
      const invNodes = [];
      const applyTrashFilter = (catId, searchQ) => {
        trashNodes.forEach(({ id, el }) => {
          el.style.display = this._storageItemMatches(id, catId, searchQ) ? '' : 'none';
        });
        invNodes.forEach(({ id, el }) => {
          el.style.display = this._storageItemMatches(id, catId, searchQ) ? '' : 'none';
        });
      };
      const filterState = this._renderStorageFilterBar(body, 'trash_bin', applyTrashFilter);

      const stagedEntries = Object.entries(b.storage).filter(([id, q]) => q > 0 && Abyssea.ITEMS[id]);
      const stagedCount = stagedEntries.reduce((sum, [, q]) => sum + q, 0);

      const binCard = this.el('div', { class: 'card', style: 'margin-bottom:10px;padding:10px;border:1px solid rgba(239,83,80,0.45);' });
      binCard.appendChild(this.el('div', { style: 'display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:8px;' }, [
        this.el('strong', { style: 'color:#ff8a80;font-size:14px;' }, `Dentro del Basurero (${stagedCount} unidades)`),
        this.el('div', { style: 'display:flex;gap:6px;' }, [
          stagedEntries.length > 0 ? this.el('button', {
            class: 'btn btn-danger btn-sm',
            onclick: () => {
              b.storage = {};
              if (Array.isArray(g.hotbar)) {
                g.hotbar.forEach((slot, idx) => {
                  if (slot && slot.kind === 'item' && (g.inventory[slot.id] || 0) <= 0) {
                    g.hotbar[idx] = null;
                  }
                });
              }
              if (Abyssea.Audio && typeof Abyssea.Audio.play === 'function') Abyssea.Audio.play('destroy');
              g.toast(`Incinerados ${stagedCount} objetos permanentemente.`, 'warn');
              this.updateHUD(true);
              this.renderModal();
            }
          }, 'Incinerar Todo (Eliminar)') : null
        ])
      ]));

      const binGrid = this.el('div', { class: 'chest-grid', style: 'max-height:150px;overflow-y:auto;' });
      if (stagedEntries.length === 0) {
        binGrid.appendChild(this.el('div', { style: 'grid-column:1/-1;color:#90a4ae;font-size:13px;padding:10px;' },
          'El basurero está vacío. Haz clic en objetos de tu inventario abajo para enviarlos aquí.'));
      } else {
        stagedEntries.forEach(([id, q]) => {
          const it = Abyssea.ITEMS[id];
          const slot = this.el('div', {
            class: `inv-slot rarity-${it.rarity || 'comun'}`,
            title: `${it.name} (x${q}) — Clic: Recuperar al inventario`,
            onclick: () => {
              const capInfo = typeof g.getItemCapacityInfo === 'function' ? g.getItemCapacityInfo(id) : null;
              const fit = capInfo ? capInfo.totalFit : (g.canAddItem(id, 1) ? maxStack : 0);
              const take = Math.min(q, maxStack, fit);
              if (take <= 0) {
                g.toast('Inventario lleno para recuperar.', 'warn');
                return;
              }
              b.storage[id] -= take;
              if (b.storage[id] <= 0) delete b.storage[id];
              g.addItem(id, take);
              if (Abyssea.Audio && typeof Abyssea.Audio.play === 'function') Abyssea.Audio.play('pickup');
              this.updateHUD(true);
              this.renderModal();
            }
          }, [
            this.itemIcon(it.icon, 42),
            this.el('span', { class: 'slot-qty' }, String(q))
          ]);
          trashNodes.push({ id, el: slot });
          binGrid.appendChild(slot);
        });
      }
      binCard.appendChild(binGrid);
      body.appendChild(binCard);

      const invCard = this.el('div', { class: 'card', style: 'padding:10px;' });
      invCard.appendChild(this.el('strong', { style: 'color:#e2e8f0;font-size:14px;display:block;margin-bottom:8px;' },
        'Tu Inventario (Clic: mover stack · Clic Der: mover 1 · Shift+Clic: mover todo)'));
      const invGrid = this.el('div', { class: 'chest-grid', style: 'max-height:200px;overflow-y:auto;' });
      const playerItems = Object.entries(g.inventory)
        .map(([id, q]) => [id, q || 0])
        .filter(([id, q]) => q > 0 && Abyssea.ITEMS[id]);

      if (playerItems.length === 0) {
        invGrid.appendChild(this.el('div', { style: 'grid-column:1/-1;color:#90a4ae;font-size:13px;padding:10px;' }, 'No hay objetos en tu inventario.'));
      } else {
        playerItems.forEach(([id, qty]) => {
          const it = Abyssea.ITEMS[id];
          let rem = qty;
          while (rem > 0) {
            const stackQty = Math.min(rem, maxStack);
            rem -= stackQty;
            const slot = this.el('div', {
              class: `inv-slot rarity-${it.rarity || 'comun'}`,
              title: `${it.name} (x${stackQty}) — Enviar al basurero`,
              onclick: (ev) => {
                const total = g.inventory[id] || 0;
                const move = (ev && ev.shiftKey) ? total : Math.min(total, stackQty);
                if (move > 0) {
                  g.removeItem(id, move);
                  b.storage[id] = (b.storage[id] || 0) + move;
                  if (Abyssea.Audio && typeof Abyssea.Audio.play === 'function') Abyssea.Audio.play('pickup');
                  this.updateHUD(true);
                  this.renderModal();
                }
              },
              oncontextmenu: (ev) => {
                ev.preventDefault();
                if ((g.inventory[id] || 0) > 0) {
                  g.removeItem(id, 1);
                  b.storage[id] = (b.storage[id] || 0) + 1;
                  if (Abyssea.Audio && typeof Abyssea.Audio.play === 'function') Abyssea.Audio.play('pickup');
                  this.updateHUD(true);
                  this.renderModal();
                }
              }
            }, [
              this.itemIcon(it.icon, 42),
              this.el('span', { class: 'slot-qty' }, String(stackQty))
            ]);
            invNodes.push({ id, el: slot });
            invGrid.appendChild(slot);
          }
        });
      }
      invCard.appendChild(invGrid);
      body.appendChild(invCard);
      applyTrashFilter(filterState.cat, filterState.search);
    }

    togglePhotoMode() {
      const g = this.game;
      g.photoMode = !g.photoMode;
      if (g.photoMode) {
        document.body.classList.add('photo-mode-active');
        g.toast('Modo Foto activado (WASD mover cámara · Rueda zoom · F9/F8/P salir)', 'info');
      } else {
        document.body.classList.remove('photo-mode-active');
        g.toast('Modo Foto desactivado', 'info');
      }
      if (typeof this.syncPhotoModeToolbar === 'function') this.syncPhotoModeToolbar();
      this.updateHUD(true);
    }

    renderNpcDialog(titleEl, body, npc) {
      const g = this.game;
      titleEl.textContent = npc.name;

      body.appendChild(this.el('div', { class: 'parchment-box', style: 'display:flex;gap:16px;align-items:center;margin-bottom:14px;padding:12px 14px;' }, [
        this.npcPortrait(npc.id, 76),
        this.el('div', {}, [
          this.el('div', { style: 'font-size:14px;font-weight:800;color:#9ec5ff;margin-bottom:5px;' }, `${npc.personality} · ${BIOMES[npc.biome].name}`),
          this.el('div', { style: 'font-size:16px;font-style:italic;line-height:1.45;color:#f4efe6;' }, `"${npc.greeting}"`)
        ])
      ]));

      const step = g.npcQuestProgress[npc.id] || 0;
      const q = npc.quests[step];
      if (!q) {
        body.appendChild(this.el('div', { class: 'card', style: 'color:#81c784;font-weight:700;' }, [
          this.uiIcon('iconCheck', 15),
          tr('npc.allQuestsDone')
        ]));
        return;
      }

      const checks = [];
      const parts = [];
      if (q.reqItems) {
        const itemsOk = Object.entries(q.reqItems).every(([id, amt]) => (g.inventory[id] || 0) >= amt);
        checks.push(itemsOk);
        parts.push(Object.entries(q.reqItems).map(([id, amt]) => `${Abyssea.ITEMS[id] ? Abyssea.ITEMS[id].name : id}: ${g.inventory[id] || 0}/${amt}`).join(' · '));
      }
      if (q.reqKillBiome) {
        const cur = (g.stats.killsByBiome && g.stats.killsByBiome[q.reqKillBiome.biome]) || 0;
        const ok = cur >= q.reqKillBiome.count;
        checks.push(ok);
        const bmName = BIOMES[q.reqKillBiome.biome] ? BIOMES[q.reqKillBiome.biome].name : q.reqKillBiome.biome;
        parts.push(`${bmName}: ${cur}/${q.reqKillBiome.count}`);
      }
      if (q.reqDungeon) {
        const ok = g.clearedDungeons.includes(q.reqDungeon);
        checks.push(ok);
        const dDef = Abyssea.DUNGEON_DEFS && Abyssea.DUNGEON_DEFS[q.reqDungeon];
        parts.push(tr('npc.cryptStatus', { name: dDef ? dDef.name : q.reqDungeon, state: ok ? tr('common.done') : tr('hud.dungPending') }));
      }
      if (q.reqCheck) {
        const ok = Boolean(q.reqCheck(g));
        checks.push(ok);
        parts.push(ok ? tr('npc.exploreDone') : tr('npc.exploreInProgress'));
      }
      const ready = checks.length > 0 && checks.every(Boolean);
      const statusText = parts.join('  |  ');

      const rewardExtra = q.reward.items
        ? ' + ' + Object.entries(q.reward.items).map(([id, amt]) => `${amt}x ${Abyssea.ITEMS[id].name}`).join(', ')
        : '';

      body.appendChild(this.el('div', { class: 'card npc-mission-card' }, [
        this.el('strong', { style: 'color:#ffd54f;font-size:19px;' }, tr('npc.missionHeading', { title: q.title })),
        this.el('p', { style: 'font-size:16px;margin:4px 0;line-height:1.48;color:#fff5e1;' }, q.desc),
        this.el('div', { style: `font-size:15px;font-weight:700;color:${ready ? '#81c784' : '#ffab91'};line-height:1.48;` }, statusText),
        this.el('div', { style: 'font-size:14px;color:#9be0ff;font-weight:700;' },
          tr('npc.rewardLine', { coins: q.reward.coins, xp: q.reward.xp, items: rewardExtra })),
        this.el('button', {
          class: 'btn btn-green',
          disabled: ready ? null : 'disabled',
          onclick: () => {
            if (q.reqItems) {
              Object.entries(q.reqItems).forEach(([id, amt]) => g.removeItem(id, amt));
            }
            g.npcQuestProgress[npc.id] = step + 1;
            g.addCoins(q.reward.coins);
            g.gainXp(q.reward.xp);
            if (q.reward.items) Object.entries(q.reward.items).forEach(([id, amt]) => g.addItem(id, amt));
            Abyssea.Audio.play('levelup');
            g.toast(tr('npc.completedToast', { title: q.title }), 'success');
            this.renderModal();
          }
        }, ready ? tr('npc.completeBtn') : tr('npc.pendingBtn'))
      ]));
    }

    _normCmdStr(str) {
      return String(str || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
    }

    _ensureSecretConsole() {
      if (this._cmdEl && typeof document !== 'undefined' && document.body && document.body.contains(this._cmdEl)) {
        return this._cmdEl;
      }
      if (typeof document === 'undefined' || !document.body) return null;

      const shell = this.el('div', { id: 'bal-cmd-shell', class: 'bal-cmd-shell hidden' });
      const closeBtn = this.el('button', {
        type: 'button',
        class: 'bal-cmd-close',
        onclick: () => this.closeSecretConsole()
      }, 'X');
      const hdr = this.el('div', { class: 'bal-cmd-hdr' }, [
        this.el('span', {}, '[DEV] CONSOLA'),
        this.el('span', { class: 'bal-cmd-hint' }, 'Tab: completar · ↑↓: historial · Esc: cerrar'),
        closeBtn
      ]);

      const logEl = this.el('div', { id: 'bal-cmd-log', class: 'bal-cmd-log' });
      const inputEl = this.el('input', {
        id: 'bal-cmd-input',
        class: 'bal-cmd-input',
        type: 'text',
        autocomplete: 'off',
        spellcheck: 'false',
        placeholder: '/help'
      });

      const form = this.el('form', {
        class: 'bal-cmd-form',
        onsubmit: (ev) => {
          ev.preventDefault();
          const val = inputEl.value;
          inputEl.value = '';
          this.executeSecretCommand(val);
        }
      }, [
        this.el('span', { class: 'bal-cmd-prompt' }, '>'),
        inputEl
      ]);

      inputEl.addEventListener('keydown', (ev) => {
        if (ev.code === 'Tab') {
          ev.preventDefault();
          this._autocompleteSecretCommand();
        } else if (ev.code === 'ArrowUp') {
          ev.preventDefault();
          if (!this._cmdHistory.length) return;
          if (this._cmdHistIdx < 0) this._cmdHistIdx = this._cmdHistory.length - 1;
          else if (this._cmdHistIdx > 0) this._cmdHistIdx--;
          inputEl.value = this._cmdHistory[this._cmdHistIdx] || '';
        } else if (ev.code === 'ArrowDown') {
          ev.preventDefault();
          if (!this._cmdHistory.length || this._cmdHistIdx < 0) {
            inputEl.value = '';
            return;
          }
          if (this._cmdHistIdx < this._cmdHistory.length - 1) {
            this._cmdHistIdx++;
            inputEl.value = this._cmdHistory[this._cmdHistIdx] || '';
          } else {
            this._cmdHistIdx = -1;
            inputEl.value = '';
          }
        } else if (ev.code === 'Escape') {
          ev.preventDefault();
          ev.stopPropagation();
          this.closeSecretConsole();
        }
      });

      shell.appendChild(hdr);
      shell.appendChild(logEl);
      shell.appendChild(form);
      document.body.appendChild(shell);

      this._cmdEl = shell;
      this._cmdLogEl = logEl;
      this._cmdInputEl = inputEl;

      if (!this._cmdLogs.length) {
        this._pushCmdLog('Consola privada lista. Escribe /help para ver comandos.', 'warn');
      } else {
        this._cmdLogs.forEach(entry => {
          logEl.appendChild(this.el('div', { class: `bal-cmd-line is-${entry.kind}` }, entry.text));
        });
      }
      return shell;
    }

    _pushCmdLog(text, kind = 'info') {
      const msg = String(text || '');
      if (!this._cmdLogs) this._cmdLogs = [];
      this._cmdLogs.push({ text: msg, kind });
      if (this._cmdLogs.length > 100) this._cmdLogs.shift();
      if (this._cmdLogEl) {
        this._cmdLogEl.appendChild(this.el('div', { class: `bal-cmd-line is-${kind}` }, msg));
        while (this._cmdLogEl.children.length > 100) {
          this._cmdLogEl.removeChild(this._cmdLogEl.firstChild);
        }
        this._cmdLogEl.scrollTop = this._cmdLogEl.scrollHeight;
      }
    }

    openSecretConsole() {
      const g = this.game;
      if (!g || !g.started) return false;
      const shell = this._ensureSecretConsole();
      if (!shell) return false;
      this._cmdOpen = true;
      shell.classList.remove('hidden');
      if (typeof g.clearTransientInputs === 'function') g.clearTransientInputs();
      if (this._cmdInputEl && typeof this._cmdInputEl.focus === 'function') {
        this._cmdInputEl.focus();
      }
      return true;
    }

    closeSecretConsole() {
      this._cmdOpen = false;
      if (this._cmdInputEl && typeof this._cmdInputEl.blur === 'function') {
        this._cmdInputEl.blur();
      }
      if (this._cmdEl) this._cmdEl.classList.add('hidden');
    }

    toggleSecretConsole(forceOpen = null) {
      if (forceOpen === false) {
        this.closeSecretConsole();
        return false;
      }
      if (forceOpen === true) {
        return this.openSecretConsole();
      }
      if (this._cmdOpen) {
        this.closeSecretConsole();
        return false;
      }
      return this.openSecretConsole();
    }

    _getSecretStatMap() {
      return {
        maxhp:        { key: 'maxHp', pct: false },
        hp:           { key: 'maxHp', pct: false },
        vida:         { key: 'maxHp', pct: false },
        health:       { key: 'maxHp', pct: false },
        maxenergy:    { key: 'maxEnergy', pct: false },
        energy:       { key: 'maxEnergy', pct: false },
        energia:      { key: 'maxEnergy', pct: false },
        mana:         { key: 'maxEnergy', pct: false },
        dmgbonus:     { key: 'dmgBonus', pct: true },
        dmg:          { key: 'dmgBonus', pct: true },
        damage:       { key: 'dmgBonus', pct: true },
        dano:         { key: 'dmgBonus', pct: true },
        ataque:       { key: 'dmgBonus', pct: true },
        atk:          { key: 'dmgBonus', pct: true },
        fuerza:       { key: 'dmgBonus', pct: true },
        bossdmg:      { key: 'bossDmg', pct: true },
        boss:         { key: 'bossDmg', pct: true },
        jefes:        { key: 'bossDmg', pct: true },
        spellpower:   { key: 'spellPower', pct: true },
        spell:        { key: 'spellPower', pct: true },
        magic:        { key: 'spellPower', pct: true },
        magia:        { key: 'spellPower', pct: true },
        hechizo:      { key: 'spellPower', pct: true },
        movespeed:    { key: 'moveSpeed', pct: true },
        speed:        { key: 'moveSpeed', pct: true },
        velocidad:    { key: 'moveSpeed', pct: true },
        vel:          { key: 'moveSpeed', pct: true },
        spd:          { key: 'moveSpeed', pct: true },
        def:          { key: 'def', pct: false },
        defense:      { key: 'def', pct: false },
        defensa:      { key: 'def', pct: false },
        critchance:   { key: 'critChance', pct: true },
        crit:         { key: 'critChance', pct: true },
        critico:      { key: 'critChance', pct: true },
        attackspeed:  { key: 'attackSpeed', pct: true },
        atkspd:       { key: 'attackSpeed', pct: true },
        as:           { key: 'attackSpeed', pct: true },
        luckbonus:    { key: 'luckBonus', pct: true },
        luck:         { key: 'luckBonus', pct: true },
        suerte:       { key: 'luckBonus', pct: true },
        gatherpower:  { key: 'gatherPower', pct: true },
        gather:       { key: 'gatherPower', pct: true },
        recoleccion:  { key: 'gatherPower', pct: true },
        minespeed:    { key: 'mineSpeed', pct: true },
        minar:        { key: 'mineSpeed', pct: true },
        chopspeed:    { key: 'chopSpeed', pct: true },
        talar:        { key: 'chopSpeed', pct: true },
        regen:        { key: 'regen', pct: false },
        hpregen:      { key: 'regen', pct: false },
        energyregen:  { key: 'energyRegen', pct: false },
        enregen:      { key: 'energyRegen', pct: false },
        dodgechance:  { key: 'dodgeChance', pct: true },
        dodge:        { key: 'dodgeChance', pct: true },
        esquiva:      { key: 'dodgeChance', pct: true },
        xpbonus:      { key: 'xpBonus', pct: true },
        coindropbonus:{ key: 'coinDropBonus', pct: true },
        coinbonus:    { key: 'coinDropBonus', pct: true },
        magnetbonus:  { key: 'magnetBonus', pct: false },
        magnet:       { key: 'magnetBonus', pct: false },
        iman:         { key: 'magnetBonus', pct: false },
        lightradius:  { key: 'lightRadius', pct: false },
        energysave:   { key: 'energySave', pct: true },
        manasave:     { key: 'manaSave', pct: true },
        spellcdred:   { key: 'spellCdRed', pct: true },
        thorns:       { key: 'thorns', pct: true },
        espinas:      { key: 'thorns', pct: true },
        killheal:     { key: 'killHeal', pct: false },
        lifesteal:    { key: 'killHeal', pct: false }
      };
    }

    _autocompleteSecretCommand() {
      if (!this._cmdInputEl) return;
      const raw = this._cmdInputEl.value || '';
      const hasTrailSpace = /\s$/.test(raw);
      const parts = raw.trim().split(/\s+/).filter(Boolean);
      const cmds = ['/help', '/give', '/tool', '/armor', '/money', '/xp', '/level', '/sp', '/godmode', '/heal', '/stat', '/unlock', '/time', '/tp', '/boss', '/spawnboss', '/hud', '/photo', '/spectator', '/freezeai', '/zoom', '/vfx', '/clearmobs', '/trailer', '/clear'];

      if (parts.length <= 1 && !hasTrailSpace) {
        const prefix = (parts[0] || '/').replace(/^\/?/, '/').toLowerCase();
        const matches = cmds.filter(c => c.startsWith(prefix));
        if (matches.length === 1) {
          this._cmdInputEl.value = `${matches[0]} `;
        } else if (matches.length > 1) {
          this._pushCmdLog(matches.join('  '), 'info');
        }
        return;
      }

      const cmd = parts[0].replace(/^\/+/, '').toLowerCase();
      const argIdx = hasTrailSpace ? parts.length : parts.length - 1;
      const cur = hasTrailSpace ? '' : this._normCmdStr(parts[parts.length - 1]);
      let candidates = [];

      if (cmd === 'give' && argIdx === 1) {
        candidates = ['all', 'kit', ...Object.keys(Abyssea.ITEMS || {})];
      } else if (cmd === 'tool') {
        candidates = argIdx === 1
          ? ['all', ...Object.keys(Abyssea.TOOLS || {})]
          : (Abyssea.TOOL_TIERS || []);
      } else if (cmd === 'armor') {
        candidates = argIdx === 1
          ? ['all', ...Object.keys(Abyssea.ARMORS || {})]
          : (Abyssea.TOOL_TIERS || []);
      } else if (cmd === 'money' || cmd === 'coins' || cmd === 'gold' || cmd === 'eco') {
        candidates = argIdx === 1 ? ['give', 'add', 'set', 'take'] : [];
      } else if (cmd === 'xp' || cmd === 'sp') {
        candidates = argIdx === 1 ? ['give', 'add', 'set'] : [];
      } else if (cmd === 'level' || cmd === 'lvl' || cmd === 'nivel') {
        candidates = argIdx === 1 ? ['set', 'add'] : [];
      } else if (cmd === 'godmode' || cmd === 'god' || cmd === 'inmortal') {
        candidates = argIdx === 1 ? ['on', 'off', 'toggle'] : [];
      } else if (cmd === 'stat' || cmd === 'stats' || cmd === 'buff') {
        if (argIdx === 1) candidates = ['add', 'set', 'reset', 'list'];
        else if (argIdx === 2) {
          candidates = ['maxHp', 'maxEnergy', 'dmgBonus', 'spellPower', 'moveSpeed', 'def', 'critChance', 'attackSpeed', 'luckBonus', 'gatherPower', 'regen', 'energyRegen', 'dodgeChance', 'xpBonus', 'coinDropBonus', 'bossDmg', 'thorns', 'killHeal', 'magnetBonus'];
        }
      } else if (cmd === 'unlock') {
        candidates = argIdx === 1 ? ['all', 'plots', 'skills', 'spells'] : [];
      } else if (cmd === 'time' || cmd === 'hora') {
        candidates = argIdx === 1 ? ['dawn', 'day', 'dusk', 'night'] : [];
      } else if (cmd === 'tp') {
        candidates = argIdx === 1 ? ['camp'] : [];
      }

      const matches = candidates.filter(c => this._normCmdStr(c).startsWith(cur));
      if (!matches.length) return;
      if (matches.length === 1) {
        const prefixParts = hasTrailSpace ? parts : parts.slice(0, -1);
        this._cmdInputEl.value = `${[...prefixParts, matches[0]].join(' ')} `;
      } else {
        this._pushCmdLog(matches.slice(0, 12).join('  '), 'info');
      }
    }

    executeSecretCommand(rawCmd) {
      const raw = String(rawCmd || '').trim();
      if (!raw) return { ok: false, message: 'Comando vacío.' };
      const g = this.game;
      if (!g || !g.started || !g.player) {
        this._pushCmdLog('Inicia o carga una partida primero.', 'err');
        return { ok: false, message: 'No active game' };
      }

      if (this._cmdHistory[this._cmdHistory.length - 1] !== raw) {
        this._cmdHistory.push(raw);
        if (this._cmdHistory.length > 50) this._cmdHistory.shift();
      }
      this._cmdHistIdx = -1;
      this._pushCmdLog(`> ${raw}`, 'cmd');

      const tokens = raw.split(/\s+/);
      const cmd = tokens[0].replace(/^\/+/, '').toLowerCase();
      const args = tokens.slice(1);
      const fail = (msg) => {
        this._pushCmdLog(msg, 'err');
        return { ok: false, message: msg };
      };
      const succeed = (msg, kind = 'ok') => {
        this._pushCmdLog(msg, kind);
        g.uiDirty = true;
        this.updateHUD(true);
        if (this.hasOpenModal()) this.renderModal();
        return { ok: true, message: msg };
      };

      const calcNextXp = (lv) => (typeof g.getNextXpForLevel === 'function')
        ? g.getNextXpForLevel(lv)
        : Math.round((42 + lv * 28 + Math.pow(lv, 1.65) * 16) * (lv >= 300 ? 20 : lv >= 200 ? 10 : lv >= 100 ? 4 : lv >= 50 ? 2 : 1));

      if (cmd === 'help' || cmd === '?' || cmd === 'cmds') {
        [
          '/give <item|all|kit> [cant]  - Dar items o kit completo',
          '/tool <id|all> [tier]       - Desbloquear/subir herramientas (ej. celestial)',
          '/armor <slot|all> [tier]    - Equipar casco/armadura/escudo/botas',
          '/money <give|set|take> <n>  - Modificar monedas (/coins, /gold)',
          '/xp <give|set> <n>          - Dar o fijar experiencia',
          '/level <set|add> <n>        - Subir o fijar nivel (/lvl)',
          '/sp <give|set> <n>          - Puntos de Constelación',
          '/godmode [on|off]           - Inmortalidad y energía infinita (/god)',
          '/heal                       - Curar HP/Energía al máximo y revivir',
          '/stat <add|set|reset|list> <stat> [val] - Modificar stats (ej. 50% o 200)',
          '/unlock <plots|skills|spells|all> - Desbloquear islas, árbol o hechizos',
          '/time <dawn|day|dusk|night|0..1>  - Cambiar hora del día',
          '/tp <camp | tx ty>          - Teletransporte a campamento o tile',
          '/boss <id|next|final|list>  - Ir directo a la arena del jefe (/boss eclipse_carmesi)',
          '/spawnboss <id>             - Invocar jefe en tu posición actual',
          '/hud [on|off]               - Ocultar/mostrar HUD para capturas (/photo)',
          '/spectator [on|off]         - Cámara libre invisible e inmortal (WASD)',
          '/freezeai [on|off]          - Congelar/reanudar IA de enemigos y jefes',
          '/zoom <0.4..2.5|reset>      - Ajustar zoom cinematográfico',
          '/vfx <key|list>             - Lanzar efecto visual Gigapack sobre ti',
          '/clearmobs                  - Limpiar enemigos menores y proyectiles',
          '/trailer [eclipse|camp|off] - Preparar escena épica de trailer al instante',
          '/clear                      - Limpiar pantalla'
        ].forEach(line => this._pushCmdLog(line, 'info'));
        return { ok: true, message: 'help' };
      }

      if (cmd === 'clear' || cmd === 'cls') {
        this._cmdLogs = [];
        if (this._cmdLogEl) this._cmdLogEl.innerHTML = '';
        return { ok: true, message: 'cleared' };
      }

      if (cmd === 'give') {
        if (!args.length) return fail('Uso: /give <item|all|kit> [cantidad]');
        const ITEMS = Abyssea.ITEMS || {};
        let qty = 1;
        let queryParts = args;
        if (args.length >= 2 && /^\d+$/.test(args[args.length - 1])) {
          qty = Math.max(1, Math.min(999999, parseInt(args[args.length - 1], 10)));
          queryParts = args.slice(0, -1);
        }
        const queryRaw = queryParts.join(' ');
        const q = this._normCmdStr(queryRaw);

        if (q === 'all' || q === 'todo') {
          const allQty = args.length >= 2 && /^\d+$/.test(args[1]) ? qty : 50;
          const ids = Object.keys(ITEMS);
          ids.forEach(id => g.addItem(id, allQty));
          return succeed(`Añadidos ${ids.length} tipos de items (x${allQty}).`);
        }

        if (q === 'kit') {
          const kitMap = {
            madera: 250, piedra: 250, tablon: 150, carbon: 120,
            lingote_cobre: 100, lingote_hierro: 100, lingote_plata: 80, lingote_oro: 80,
            lingote_platino: 60, lingote_acero: 60, lingote_titanio: 50,
            lingote_adamantita: 50, lingote_oricalco: 50, lingote_celestial: 40,
            diamantes: 30, esmeraldas: 30, amatista: 30, rubi: 30,
            gema_alma: 20, polvo_estelar: 20, flecha: 200
          };
          let count = 0;
          Object.entries(kitMap).forEach(([id, kQty]) => {
            if (ITEMS[id]) {
              g.addItem(id, kQty);
              count++;
            }
          });
          g.addCoins(5000);
          return succeed(`Kit entregado (${count} stacks de recursos + 5000 oro).`);
        }

        const keys = Object.keys(ITEMS);
        let targetId = ITEMS[queryRaw] ? queryRaw : keys.find(k => this._normCmdStr(k) === q);
        if (!targetId) {
          targetId = keys.find(k => this._normCmdStr(ITEMS[k].name) === q);
        }
        if (!targetId) {
          const matches = keys.filter(k => {
            const nk = this._normCmdStr(k);
            const nn = this._normCmdStr(ITEMS[k].name);
            return nk.includes(q) || nn.includes(q);
          });
          if (matches.length === 1) {
            targetId = matches[0];
          } else if (matches.length > 1) {
            const exactStart = matches.filter(k => this._normCmdStr(k).startsWith(q));
            if (exactStart.length === 1) targetId = exactStart[0];
            else return fail(`Coincidencias (${matches.length}): ${matches.slice(0, 6).join(', ')}`);
          }
        }
        if (!targetId || !ITEMS[targetId]) {
          return fail(`Item no encontrado: "${queryRaw}"`);
        }
        g.addItem(targetId, qty);
        return succeed(`+${qty} ${ITEMS[targetId].name} (${targetId}).`);
      }

      if (cmd === 'tool' || cmd === 'tools' || cmd === 'herramienta') {
        if (!args.length) return fail('Uso: /tool <id|all> [tier=celestial]');
        const TOOLS = Abyssea.TOOLS || {};
        const TIERS = Abyssea.TOOL_TIERS || [];
        const who = this._normCmdStr(args[0]);
        let tier = 'celestial';
        if (args[1]) {
          const tRaw = this._normCmdStr(args[1]);
          if (/^\d+$/.test(tRaw)) {
            const idx = Math.max(0, Math.min(TIERS.length - 1, parseInt(tRaw, 10) - 1));
            tier = TIERS[idx] || tier;
          } else {
            const foundTier = TIERS.find(t => this._normCmdStr(t) === tRaw || this._normCmdStr(t).startsWith(tRaw));
            if (!foundTier) return fail(`Tier desconocido "${args[1]}". Tiers: ${TIERS.join(', ')}`);
            tier = foundTier;
          }
        }
        const toolKeys = Object.keys(TOOLS);
        const targetTools = (who === 'all' || who === 'todas')
          ? toolKeys
          : [toolKeys.find(k => this._normCmdStr(k) === who || this._normCmdStr(TOOLS[k].name).includes(who))].filter(Boolean);
        if (!targetTools.length) return fail(`Herramienta desconocida. Opciones: ${toolKeys.join(', ')}, all`);
        targetTools.forEach(tid => {
          const had = Boolean(g.toolTiers[tid]);
          g.toolTiers[tid] = tier;
          if (!had && typeof g.placeInNearestAvailableHotbarSlot === 'function') {
            if (Array.isArray(g.hotbar)) {
              for (let i = 0; i < g.hotbar.length; i++) {
                const s = g.hotbar[i];
                if (s && s.kind === 'tool' && s.id === tid) g.hotbar[i] = null;
              }
            }
            g.placeInNearestAvailableHotbarSlot('tool', tid, true);
          }
          if (tid === 'arco') {
            if (typeof g.getArrowCount === 'function' && g.getArrowCount() <= 0) g.addItem('flecha', 24);
            g.player.bowLoaded = true;
            g.player.bowReloadTimer = 0;
            g.player.bowNeedsAutoReload = false;
          }
        });
        g.recomputeModifiers();
        return succeed(`Herramienta(s) [${targetTools.join(', ')}] ajustada(s) a tier "${tier}".`);
      }

      if (cmd === 'armor' || cmd === 'armadura') {
        if (!args.length) return fail('Uso: /armor <helm|armor|legs|shield|boots|all> [tier=celestial]');
        const ARMORS = Abyssea.ARMORS || {};
        const TIERS = Abyssea.TOOL_TIERS || [];
        const aliasMap = {
          helm: 'helm', helmet: 'helm', casco: 'helm',
          armor: 'armor', armadura: 'armor', pecho: 'armor', chest: 'armor',
          legs: 'legs', pantalones: 'legs', grebas: 'legs',
          shield: 'shield', escudo: 'shield',
          boots: 'boots', botas: 'boots'
        };
        const slotReq = this._normCmdStr(args[0]);
        let tierIdx = TIERS.length - 1;
        if (args[1]) {
          const tRaw = this._normCmdStr(args[1]);
          if (/^\d+$/.test(tRaw)) {
            tierIdx = Math.max(0, Math.min(TIERS.length - 1, parseInt(tRaw, 10) - 1));
          } else {
            const foundIdx = TIERS.findIndex(t => this._normCmdStr(t) === tRaw || this._normCmdStr(t).startsWith(tRaw));
            if (foundIdx < 0) return fail(`Tier desconocido "${args[1]}".`);
            tierIdx = foundIdx;
          }
        }
        const slots = (slotReq === 'all' || slotReq === 'todas' || slotReq === 'todo')
          ? Object.keys(ARMORS)
          : (aliasMap[slotReq] ? [aliasMap[slotReq]] : []);
        if (!slots.length) return fail('Slot inválido. Usa helm, armor, legs, shield, boots o all.');
        slots.forEach(sl => {
          const chain = ARMORS[sl];
          if (!chain || !chain.tiers.length) return;
          const itemId = chain.tiers[Math.min(chain.tiers.length - 1, tierIdx)];
          if (typeof g.autoEquipCraftedArmor === 'function') {
            g.autoEquipCraftedArmor(sl, itemId, null);
          } else {
            g.equipped[sl] = itemId;
          }
        });
        g.recomputeModifiers();
        return succeed(`Armadura equipada (${slots.join(', ')}) en rango ${tierIdx + 1}.`);
      }

      if (cmd === 'money' || cmd === 'coins' || cmd === 'gold' || cmd === 'eco') {
        if (!args.length) return fail('Uso: /money <give|add|set|take> <cantidad>');
        let mode = 'give';
        let numRaw = args[0];
        if (['give', 'add', 'set', 'take', 'remove'].includes(this._normCmdStr(args[0]))) {
          mode = this._normCmdStr(args[0]);
          numRaw = args[1];
        }
        const amt = Number(numRaw);
        if (!Number.isFinite(amt) || amt < 0) return fail('Cantidad inválida.');
        const val = Math.min(1000000000, Math.floor(amt));
        if (mode === 'set') {
          g.coins = val;
        } else if (mode === 'take' || mode === 'remove') {
          g.coins = Math.max(0, g.coins - val);
        } else {
          g.coins += val;
          if (g.stats) g.stats.coinsEarned = (g.stats.coinsEarned || 0) + val;
          if (val > 0 && typeof g.addFloatingText === 'function') {
            g.addFloatingText(g.player.x + 14, g.player.y - 24, `+${val}g`, '#ffd54f');
          }
        }
        return succeed(`Oro actual: ${g.coins}.`);
      }

      if (cmd === 'xp') {
        if (!args.length) return fail('Uso: /xp <give|add|set> <cantidad>');
        let mode = 'give';
        let numRaw = args[0];
        if (['give', 'add', 'set'].includes(this._normCmdStr(args[0]))) {
          mode = this._normCmdStr(args[0]);
          numRaw = args[1];
        }
        const amt = Number(numRaw);
        if (!Number.isFinite(amt) || amt < 0) return fail('Cantidad de XP inválida.');
        const val = Math.floor(amt);
        if (mode === 'set') {
          g.player.xp = val;
          while (g.player.xp >= g.player.nextXp) {
            g.player.xp -= g.player.nextXp;
            g.player.level++;
            g.player.skillPoints += 1;
            g.player.nextXp = calcNextXp(g.player.level);
            g.recomputeModifiers();
            g.player.hp = g.player.maxHp;
            g.player.energy = g.player.maxEnergy;
          }
        } else {
          if (val > 0) g.gainXp(val);
        }
        return succeed(`Nivel ${g.player.level} · XP ${g.player.xp}/${g.player.nextXp}.`);
      }

      if (cmd === 'level' || cmd === 'lvl' || cmd === 'nivel') {
        if (!args.length) return fail('Uso: /level <set|add> <nivel>');
        let mode = 'set';
        let numRaw = args[0];
        if (['set', 'add', 'give'].includes(this._normCmdStr(args[0]))) {
          mode = this._normCmdStr(args[0]);
          numRaw = args[1];
        }
        const amt = Number(numRaw);
        if (!Number.isFinite(amt)) return fail('Nivel inválido.');
        const oldLv = g.player.level;
        const target = mode === 'add' || mode === 'give'
          ? oldLv + Math.floor(amt)
          : Math.floor(amt);
        const clamped = Math.max(1, Math.min(999, target));
        if (clamped > oldLv) g.player.skillPoints += (clamped - oldLv);
        g.player.level = clamped;
        g.player.xp = 0;
        g.player.nextXp = calcNextXp(clamped);
        g.recomputeModifiers();
        g.player.hp = g.player.maxHp;
        g.player.energy = g.player.maxEnergy;
        return succeed(`Nivel establecido a ${g.player.level} (SP: ${g.player.skillPoints}).`);
      }

      if (cmd === 'sp') {
        if (!args.length) return fail('Uso: /sp <give|add|set> <cantidad>');
        let mode = 'give';
        let numRaw = args[0];
        if (['give', 'add', 'set'].includes(this._normCmdStr(args[0]))) {
          mode = this._normCmdStr(args[0]);
          numRaw = args[1];
        }
        const amt = Number(numRaw);
        if (!Number.isFinite(amt) || amt < 0) return fail('Cantidad inválida.');
        const val = Math.floor(amt);
        g.player.skillPoints = mode === 'set' ? val : g.player.skillPoints + val;
        return succeed(`Puntos de Constelación: ${g.player.skillPoints}.`);
      }

      if (cmd === 'godmode' || cmd === 'god' || cmd === 'inmortal') {
        const arg = args[0] ? this._normCmdStr(args[0]) : 'toggle';
        let next = !g.player.godMode;
        if (['on', '1', 'true', 'si', 'yes'].includes(arg)) next = true;
        else if (['off', '0', 'false', 'no'].includes(arg)) next = false;
        g.player.godMode = next;
        g.player.invuln = 0;
        if (next) {
          g.player.deadTimer = 0;
          g.player.hp = g.player.maxHp;
          g.player.energy = g.player.maxEnergy;
          g.warningBanner = null;
          if (typeof g.addFloatingText === 'function') {
            g.addFloatingText(g.player.x, g.player.y - 30, 'GODMODE ON', '#ffd54f');
          }
        }
        return succeed(`Godmode ${next ? 'ACTIVADO (inmortal + energía infinita)' : 'DESACTIVADO'}.`, next ? 'warn' : 'ok');
      }

      if (cmd === 'heal' || cmd === 'curar' || cmd === 'revive') {
        g.player.deadTimer = 0;
        g.player.invuln = 0.8;
        g.player.hp = g.player.maxHp;
        g.player.energy = g.player.maxEnergy;
        g.warningBanner = null;
        if (typeof g.addFloatingText === 'function') {
          g.addFloatingText(g.player.x, g.player.y - 28, '+MAX HP/EN', '#81c784');
        }
        return succeed(`Salud (${g.player.hp}/${g.player.maxHp}) y Energía (${g.player.energy}/${g.player.maxEnergy}) restauradas.`);
      }

      if (cmd === 'stat' || cmd === 'stats' || cmd === 'buff') {
        if (!g.player.bonusStats) g.player.bonusStats = {};
        const sub = args[0] ? this._normCmdStr(args[0]) : 'list';
        const statMap = this._getSecretStatMap();

        if (sub === 'list') {
          const active = Object.entries(g.player.bonusStats);
          const summary = active.length
            ? active.map(([k, v]) => `${k}=${v}`).join(', ')
            : 'ninguno';
          return succeed(`Bonus activos: ${summary} | Claves: maxHp, maxEnergy, dmgBonus, spellPower, moveSpeed, def, critChance, attackSpeed, luckBonus, gatherPower, regen, energyRegen`, 'info');
        }

        if (sub === 'reset') {
          if (args[1]) {
            const entry = statMap[this._normCmdStr(args[1])];
            if (!entry) return fail(`Stat desconocida: "${args[1]}"`);
            delete g.player.bonusStats[entry.key];
            g.recomputeModifiers();
            return succeed(`Bonus "${entry.key}" reiniciado.`);
          }
          g.player.bonusStats = {};
          g.recomputeModifiers();
          return succeed('Todos los bonus de estadísticas reiniciados.');
        }

        if ((sub !== 'add' && sub !== 'set') || args.length < 3) {
          return fail('Uso: /stat <add|set|reset|list> <stat> [valor]');
        }
        const entry = statMap[this._normCmdStr(args[1])];
        if (!entry) return fail(`Stat desconocida "${args[1]}". Usa /stat list.`);

        const rawVal = String(args[2]).trim();
        const isPctInput = rawVal.endsWith('%');
        const numParsed = Number(isPctInput ? rawVal.slice(0, -1) : rawVal);
        if (!Number.isFinite(numParsed)) return fail(`Valor numérico inválido: "${args[2]}"`);
        const delta = isPctInput ? (numParsed / 100) : numParsed;

        if (sub === 'set') {
          g.player.bonusStats[entry.key] = +delta.toFixed(4);
        } else {
          g.player.bonusStats[entry.key] = +((g.player.bonusStats[entry.key] || 0) + delta).toFixed(4);
        }
        g.recomputeModifiers();
        if (entry.key === 'maxHp' && g.player.bonusStats.maxHp > 0) g.player.hp = g.player.maxHp;
        if (entry.key === 'maxEnergy' && g.player.bonusStats.maxEnergy > 0) g.player.energy = g.player.maxEnergy;
        return succeed(`Stat ${entry.key} bonus = ${g.player.bonusStats[entry.key]} (total mod: ${+(g.mods[entry.key] || 0).toFixed(3)}).`);
      }

      if (cmd === 'unlock') {
        const target = args[0] ? this._normCmdStr(args[0]) : '';
        if (!['plots', 'skills', 'spells', 'all'].includes(target)) {
          return fail('Uso: /unlock <plots|skills|spells|all>');
        }
        const done = [];
        if (target === 'plots' || target === 'all') {
          let unlockedCount = 0;
          if (g.world) {
            if (typeof g.world.unlockAllPlots === 'function') {
              unlockedCount = g.world.unlockAllPlots();
            } else {
              for (let gy = 0; gy < GRID_PLOTS; gy++) {
                for (let gx = 0; gx < GRID_PLOTS; gx++) {
                  if (!g.world.plotUnlocked[gy] || !g.world.plotUnlocked[gy][gx]) {
                    g.world.unlockPlot(gx, gy, false);
                    unlockedCount++;
                  }
                }
              }
            }
            const existingPlots = new Set((g.unlockedPlots || []).map(p => (p[1] << 8) | p[0]));
            for (let gy = 0; gy < GRID_PLOTS; gy++) {
              for (let gx = 0; gx < GRID_PLOTS; gx++) {
                const k = (gy << 8) | gx;
                if (!existingPlots.has(k)) {
                  existingPlots.add(k);
                  g.unlockedPlots.push([gx, gy]);
                }
              }
            }
          }
          done.push(`islas +${unlockedCount}`);
        }
        if (target === 'skills' || target === 'all') {
          const allSkills = Object.keys(Abyssea.SKILLS || {});
          let added = 0;
          allSkills.forEach(sid => {
            if (!g.unlockedSkills.includes(sid)) {
              g.unlockedSkills.push(sid);
              added++;
            }
          });
          g.recomputeModifiers();
          done.push(`constelaciones +${added}`);
        }
        if (target === 'spells' || target === 'all') {
          const allSpells = Object.keys(Abyssea.SPELLS || {});
          if (!Array.isArray(g.unlockedSpells)) g.unlockedSpells = [];
          if (!Array.isArray(g.spellSlots)) g.spellSlots = [null, null, null, null];
          let added = 0;
          allSpells.forEach(spId => {
            if (!g.unlockedSpells.includes(spId)) {
              g.unlockedSpells.push(spId);
              added++;
            }
            const emptySlot = g.spellSlots.findIndex(s => !s);
            if (emptySlot !== -1 && !g.spellSlots.includes(spId)) g.spellSlots[emptySlot] = spId;
          });
          done.push(`hechizos +${added}`);
        }
        return succeed(`Desbloqueado: ${done.join(', ')}.`);
      }

      if (cmd === 'time' || cmd === 'hora') {
        if (!args.length) return fail('Uso: /time <dawn|day|dusk|night|0..1>');
        const tArg = this._normCmdStr(args[0]);
        const preset = {
          dawn: 0.02, amanecer: 0.02,
          day: 0.25, dia: 0.25,
          dusk: 0.69, atardecer: 0.69,
          night: 0.80, noche: 0.80
        };
        if (Object.prototype.hasOwnProperty.call(preset, tArg)) {
          g.dayTime = preset[tArg];
        } else {
          const num = Number(tArg);
          if (!Number.isFinite(num)) return fail('Hora inválida. Usa dawn, day, dusk, night o un número 0..1.');
          g.dayTime = ((num % 1) + 1) % 1;
        }
        return succeed(`Hora ajustada (${g.getDayPhase ? g.getDayPhase().label : g.dayTime}).`);
      }

      if (cmd === 'tp') {
        if (!args.length) return fail('Uso: /tp <camp | tx ty>');
        const dst = this._normCmdStr(args[0]);
        if (dst === 'camp' || dst === 'home' || dst === 'base') {
          if (g.activeDungeon && typeof g.exitDungeon === 'function') g.exitDungeon(true);
          const C = CENTER_PLOT !== undefined ? CENTER_PLOT : 9;
          const cx = (C * PLOT_TILES + 6.5) * TILE_SIZE;
          const cy = (C * PLOT_TILES + 6.5) * TILE_SIZE;
          const spawn = typeof g.findSafeOverworldSpawn === 'function'
            ? g.findSafeOverworldSpawn(cx, cy, { maxRadius: 8 })
            : { x: cx, y: cy };
          g.player.x = spawn.x;
          g.player.y = spawn.y;
          g.camera.x = g.player.x;
          g.camera.y = g.player.y;
          return succeed(`Teletransportado al campamento (${Math.round(g.player.x / TILE_SIZE)}, ${Math.round(g.player.y / TILE_SIZE)}).`);
        }
        if (args.length < 2) return fail('Uso: /tp <camp | tx ty>');
        const tx = Number(args[0]);
        const ty = Number(args[1]);
        if (!Number.isFinite(tx) || !Number.isFinite(ty)) return fail('Coordenadas de tile inválidas.');
        const clampedX = Math.max(1, Math.min(WORLD_TILES - 2, tx));
        const clampedY = Math.max(1, Math.min(WORLD_TILES - 2, ty));
        g.player.x = (clampedX + 0.5) * TILE_SIZE;
        g.player.y = (clampedY + 0.5) * TILE_SIZE;
        g.camera.x = g.player.x;
        g.camera.y = g.player.y;
        return succeed(`Teletransportado al tile (${clampedX}, ${clampedY}).`);
      }

      if (cmd === 'boss' || cmd === 'dungeon') {
        const dList = Abyssea.DUNGEON_TIER_LIST || Object.keys(Abyssea.DUNGEON_DEFS || {});
        const arg = args[0] ? this._normCmdStr(args[0]) : 'final';
        if (arg === 'list') {
          return succeed(`75 Bosses: ${dList.slice(0, 8).join(', ')} ... ${dList.slice(-8).join(', ')} (usa /boss final o /boss <id>).`, 'info');
        }
        let targetId = arg;
        if (arg === 'final' || arg === 'last' || arg === 'eclipse') {
          targetId = 'eclipse_carmesi';
        } else if (arg === 'next') {
          const cleared = new Set(g.clearedDungeons || []);
          targetId = dList.find(id => !cleared.has(id)) || dList[dList.length - 1];
        } else if (!Abyssea.DUNGEON_DEFS || !Abyssea.DUNGEON_DEFS[targetId]) {
          const match = dList.find(id => id.includes(arg) || (Abyssea.DUNGEON_DEFS[id] && this._normCmdStr(Abyssea.DUNGEON_DEFS[id].name).includes(arg)));
          if (match) targetId = match;
        }
        if (!Abyssea.DUNGEON_DEFS || !Abyssea.DUNGEON_DEFS[targetId]) {
          return fail(`Mazmorra/Jefe desconocido "${args[0]}". Usa /boss list.`);
        }
        if (g.activeDungeon && typeof g.exitDungeon === 'function') g.exitDungeon(true);
        g.enterDungeon(targetId, false, { directArena: true, forceNormal: true });
        this.toggleSecretConsole(false);
        return succeed(`Entrando directo a la arena de ${Abyssea.DUNGEON_DEFS[targetId].boss ? Abyssea.DUNGEON_DEFS[targetId].boss.name : targetId}!`);
      }

      if (cmd === 'spawnboss' || cmd === 'summonboss') {
        const dList = Abyssea.DUNGEON_TIER_LIST || Object.keys(Abyssea.DUNGEON_DEFS || {});
        const arg = args[0] ? this._normCmdStr(args[0]) : 'eclipse_carmesi';
        let targetId = arg === 'final' ? 'eclipse_carmesi' : arg;
        if (!Abyssea.DUNGEON_DEFS || !Abyssea.DUNGEON_DEFS[targetId]) {
          targetId = dList.find(id => id.includes(arg)) || 'eclipse_carmesi';
        }
        const def = Abyssea.DUNGEON_DEFS[targetId];
        if (!def) return fail(`Def no encontrada: ${targetId}`);
        const tier = Math.max(0, dList.indexOf(targetId));
        const stats = (Abyssea.DungeonInstance && Abyssea.DungeonInstance.computeBossStats)
          ? Abyssea.DungeonInstance.computeBossStats(def, tier, g.player.level || 1)
          : { hp: def.boss.hp * 30, maxHp: def.boss.hp * 30, dmg: def.boss.dmg * 10 };
        const bossMob = {
          id: (g.combat ? g.combat.nextId++ : Math.floor(Math.random() * 99999)),
          isBoss: true,
          type: 'boss_' + targetId,
          name: def.boss.name,
          biome: def.themeKey || 'tierras_malditas',
          x: g.player.x + 150,
          y: g.player.y - 20,
          vx: 0, vy: 0,
          hp: stats.hp,
          maxHp: stats.maxHp,
          dmg: stats.dmg,
          speed: def.boss.speed || 120,
          color: def.boss.color || '#ff1744',
          facing: -1,
          radius: 34, hitW: 78, hitH: 86, bodyOffY: 30,
          phase: 1, phaseCycle: 0, attackTimer: 1.5,
          animRow: 0, animTimer: 0, animLock: 0, animFps: 8, animFrames: 7
        };
        if (g.activeDungeon) g.activeDungeon.boss = bossMob;
        else if (g.combat && Array.isArray(g.combat.enemies)) g.combat.enemies.push(bossMob);
        if (typeof g.spawnFx === 'function') g.spawnFx('sp_spell_death_red', bossMob.x, bossMob.y, 0, 0.85, 2.2, 1.0, { blend: 'lighter' });
        return succeed(`Invocado jefe ${def.boss.name} (${targetId}) cerca de ti.`);
      }

      if (cmd === 'hud' || cmd === 'photo') {
        const sub = args[0] ? this._normCmdStr(args[0]) : '';
        if (sub === 'on' || sub === 'show') {
          if (g.photoMode) this.togglePhotoMode();
        } else if (sub === 'off' || sub === 'hide') {
          if (!g.photoMode) this.togglePhotoMode();
        } else {
          this.togglePhotoMode();
        }
        return succeed(`HUD ${g.photoMode ? 'OCULTO (Modo Foto/Trailer)' : 'VISIBLE'}.`);
      }

      if (cmd === 'spectator' || cmd === 'spec') {
        const sub = args[0] ? this._normCmdStr(args[0]) : '';
        g.spectatorMode = sub === 'on' ? true : (sub === 'off' ? false : !g.spectatorMode);
        return succeed(`Modo Espectador ${g.spectatorMode ? 'ACTIVADO (invisible, invulnerable, camara libre WASD + Shift)' : 'DESACTIVADO'}.`);
      }

      if (cmd === 'freezeai' || cmd === 'freeze') {
        const sub = args[0] ? this._normCmdStr(args[0]) : '';
        g.freezeAI = sub === 'on' ? true : (sub === 'off' ? false : !g.freezeAI);
        return succeed(`IA de enemigos y jefes ${g.freezeAI ? 'CONGELADA' : 'REANUDADA'}.`);
      }

      if (cmd === 'zoom') {
        if (!args.length || this._normCmdStr(args[0]) === 'reset') {
          g.debugZoomOverride = 0;
          g.camera.zoom = 1.26;
          return succeed('Zoom restaurado (1.26x).');
        }
        const zv = Number(args[0]);
        if (!Number.isFinite(zv) || zv < 0.25 || zv > 3.0) return fail('Uso: /zoom <0.25..3.0 | reset>');
        g.debugZoomOverride = zv;
        g.camera.zoom = zv;
        return succeed(`Zoom fijado en ${zv.toFixed(2)}x.`);
      }

      if (cmd === 'vfx') {
        const keys = Object.keys(Abyssea.VFX_V2 || {}).filter(k => k.startsWith('sp_'));
        if (!args.length || this._normCmdStr(args[0]) === 'list') {
          return succeed(`VFX sp_*: ${keys.join(', ')}`, 'info');
        }
        const key = args[0].trim();
        if (typeof g.spawnFx === 'function') {
          g.spawnFx(key, g.player.x, g.player.y - 16, 0, 0.9, 2.2, 1.0, { blend: 'lighter' });
        }
        return succeed(`VFX lanzado: ${key}`);
      }

      if (cmd === 'clearmobs') {
        if (g.activeDungeon) g.activeDungeon.enemies = [];
        else if (g.combat) g.combat.enemies = [];
        g.enemyProjectiles = [];
        g.thrownBombs = [];
        g.laserBeams = [];
        return succeed('Mobs menores y proyectiles eliminados de escena.');
      }

      if (cmd === 'trailer') {
        const preset = args[0] ? this._normCmdStr(args[0]) : 'eclipse';
        if (preset === 'off' || preset === 'reset') {
          if (g.photoMode) this.togglePhotoMode();
          g.spectatorMode = false;
          g.freezeAI = false;
          g.player.godMode = false;
          g.debugZoomOverride = 0;
          g.camera.zoom = 1.26;
          return succeed('Modo Trailer desactivado y camara/HUD restaurados.');
        }
        g.player.godMode = true;
        g.player.hp = g.player.maxHp;
        g.player.energy = g.player.maxEnergy;
        ['casco_omega', 'armadura_omega', 'escudo_omega', 'botas_omega', 'hoja_singularidad'].forEach(id => {
          if (Abyssea.ITEMS && Abyssea.ITEMS[id]) g.addItem(id, 1);
        });
        if (preset === 'camp') {
          if (g.activeDungeon && typeof g.exitDungeon === 'function') g.exitDungeon(true);
          g.spectatorMode = true;
          g.debugZoomOverride = 0.85;
          g.camera.zoom = 0.85;
          if (!g.photoMode) this.togglePhotoMode();
          this.toggleSecretConsole(false);
          return succeed('Escena Trailer Campamento lista (HUD oculto, camara libre 0.85x).');
        }
        if (g.activeDungeon && typeof g.exitDungeon === 'function') g.exitDungeon(true);
        g.enterDungeon('eclipse_carmesi', false, { directArena: true, forceNormal: true });
        g.debugZoomOverride = 1.15;
        g.camera.zoom = 1.15;
        if (!g.photoMode) this.togglePhotoMode();
        this.toggleSecretConsole(false);
        return succeed('Escena Trailer Final Boss: Espadachin Carmesi Abisal! (Usa /spectator o /freezeai para tomas libres).');
      }

      return fail(`Comando desconocido "/${cmd}". Escribe /help.`);
    }

  }

  Abyssea.getKeybinds = () => (Abyssea.UI && Abyssea.UI.keybinds) || DEFAULT_KEYBINDS;
  Abyssea.UIController = UIController;
  Abyssea.UIManager = UIController;
  Abyssea.UI = new UIController();
})();
