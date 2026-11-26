(function () {
  'use strict';

  const Abyssea = (window.Abyssea = window.Abyssea || {});

  const BASE = window.ABYSSEA_ASSET_BASE || 'assets/packs/';
  const ROOT = window.ABYSSEA_ROOT_BASE || '';
  const HANA_DIR = 'assets/sprites_extra/hana_caraka/';
  const PATHS = {
    // Hana Caraka - Unique Hero (all 33 animations)
    hana_idle: HANA_DIR + 'idle.png',
    hana_walk: HANA_DIR + 'walk.png',
    hana_run: HANA_DIR + 'run.png',
    hana_jump: HANA_DIR + 'jump.png',
    hana_hurt: HANA_DIR + 'hurt.png',
    hana_death: HANA_DIR + 'death.png',
    hana_pick_up: HANA_DIR + 'pick_up.png',
    hana_swim_idle: HANA_DIR + 'swim_idle.png',
    hana_swim_move: HANA_DIR + 'swim_move.png',
    hana_sword: HANA_DIR + 'sword.png',
    hana_sword_2: HANA_DIR + 'sword_2.png',
    hana_spear: HANA_DIR + 'spear.png',
    hana_spear_2: HANA_DIR + 'spear_2.png',
    hana_bow: HANA_DIR + 'bow.png',
    hana_crossbow: HANA_DIR + 'crossbow.png',
    hana_wand: HANA_DIR + 'wand.png',
    hana_staff: HANA_DIR + 'staff.png',
    hana_block: HANA_DIR + 'block.png',
    hana_axe: HANA_DIR + 'axe.png',
    hana_pickaxe: HANA_DIR + 'pickaxe.png',
    hana_shovel: HANA_DIR + 'shovel.png',
    hana_hoe: HANA_DIR + 'hoe.png',
    hana_sickle: HANA_DIR + 'sickle.png',
    hana_hammer: HANA_DIR + 'hammer.png',
    hana_watering: HANA_DIR + 'watering.png',
    hana_planting: HANA_DIR + 'planting.png',
    hana_brush: HANA_DIR + 'brush.png',
    hana_milking: HANA_DIR + 'milking.png',
    hana_shear: HANA_DIR + 'shear.png',
    hana_fish_cast: HANA_DIR + 'fishing_casting.png',
    hana_fish_idle: HANA_DIR + 'fishing_idle.png',
    hana_fish_reel: HANA_DIR + 'fishing_reeling.png',
    hana_fish_catch: HANA_DIR + 'fishing_catch.png',

    arrow: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Blue Units/Archer/Arrow.png',

    biome_pradera:            ROOT + 'assets/icons_tiers_v14/biomes/pradera.png?v=1.6.2',
    biome_desierto:           ROOT + 'assets/icons_tiers_v14/biomes/desierto.png?v=1.6.2',
    biome_bosque_oscuro:      ROOT + 'assets/icons_tiers_v14/biomes/bosque_oscuro.png?v=1.6.2',
    biome_montanas_heladas:   ROOT + 'assets/icons_tiers_v14/biomes/montanas_heladas.png?v=1.6.2',
    biome_tierras_volcanicas: ROOT + 'assets/icons_tiers_v14/biomes/tierras_volcanicas.png?v=1.6.2',
    biome_archipielago_coral: ROOT + 'assets/icons_tiers_v14/biomes/archipielago_coral.png?v=1.6.2',
    biome_selva_esmeralda:    ROOT + 'assets/icons_tiers_v14/biomes/selva_esmeralda.png?v=1.6.2',
    biome_cavernas_cristal:   ROOT + 'assets/icons_tiers_v14/biomes/cavernas_cristal.png?v=1.6.2',
    biome_caldera_ceniza:     ROOT + 'assets/icons_tiers_v14/biomes/caldera_ceniza.png?v=1.6.2',
    biome_cienaga_putrida:    ROOT + 'assets/icons_tiers_v14/biomes/cienaga_putrida.png?v=1.6.2',
    biome_dinastia_arena:     ROOT + 'assets/icons_tiers_v14/biomes/dinastia_arena.png?v=1.6.2',
    biome_glaciar_profundo:   ROOT + 'assets/icons_tiers_v14/biomes/glaciar_profundo.png?v=1.6.2',
    biome_necropolis_osea:    ROOT + 'assets/icons_tiers_v14/biomes/necropolis_osea.png?v=1.6.2',
    biome_tierras_malditas:   ROOT + 'assets/icons_tiers_v14/biomes/tierras_malditas.png?v=1.6.2',
    water_foam: ROOT + 'assets/icons_tiers_v14/world/water_foam_4f.png?v=1.6.2',
    bridge: ROOT + 'assets/icons_tiers_v14/world/bridge_h.png?v=1.6.2',
    bridge_v: ROOT + 'assets/icons_tiers_v14/world/bridge_v.png?v=1.6.2',
    bridge_h_mid: ROOT + 'assets/icons_tiers_v14/world/bridge_h_mid.png?v=1.6.2',
    bridge_h_l: ROOT + 'assets/icons_tiers_v14/world/bridge_h_l.png?v=1.6.2',
    bridge_h_r: ROOT + 'assets/icons_tiers_v14/world/bridge_h_r.png?v=1.6.2',
    bridge_v_mid: ROOT + 'assets/icons_tiers_v14/world/bridge_v_mid.png?v=1.6.2',
    bridge_v_t: ROOT + 'assets/icons_tiers_v14/world/bridge_v_t.png?v=1.6.2',
    bridge_v_b: ROOT + 'assets/icons_tiers_v14/world/bridge_v_b.png?v=1.6.2',

    tree1: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Resources/Wood/Trees/Tree1.png',
    tree2: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Resources/Wood/Trees/Tree2.png',
    tree3: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Resources/Wood/Trees/Tree3.png',
    tree4: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Resources/Wood/Trees/Tree4.png',
    bush1: ROOT + 'assets/icons_tiers_v14/flora/deco_berry_bush.png?v=2.0.3',
    bush2: ROOT + 'assets/icons_tiers_v14/flora/deco_dark_bush.png?v=2.0.3',
    rock1: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Decorations/Rocks/Rock1.png',
    sheep_idle: ROOT + 'assets/icons_tiers_v14/animals/animal_sheep_4f.png?v=2.0.3',
    sheep_move: ROOT + 'assets/icons_tiers_v14/animals/animal_sheep_4f.png?v=2.0.3',
    sheep_grass: ROOT + 'assets/icons_tiers_v14/animals/animal_sheep_4f.png?v=2.0.3',

    mine_active: BASE + 'Tiny Swords/Tiny Swords (Update 010)/Resources/Gold Mine/GoldMine_Active.png',
    props: BASE + 'Pixel Art Top Down - Basic v1.2.3/Texture/TX Props.png',
    goblin_torch: BASE + 'Tiny Swords/Tiny Swords (Update 010)/Factions/Goblins/Troops/Torch/Red/Torch_Red.png',
    goblin_tnt: BASE + 'Tiny Swords/Tiny Swords (Update 010)/Factions/Goblins/Troops/TNT/Red/TNT_Red.png',
    fx_fire: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Particle FX/Fire_01.png',

    char1: BASE + 'Free Character Sprites - Fantasy Dreamland/Free Character Sprites - Fantasy Dreamland/32x32/Char_001.png',
    char2: BASE + 'Free Character Sprites - Fantasy Dreamland/Free Character Sprites - Fantasy Dreamland/32x32/Char_002.png',
    char3: BASE + 'Free Character Sprites - Fantasy Dreamland/Free Character Sprites - Fantasy Dreamland/32x32/Char_003.png',
    char4: BASE + 'Free Character Sprites - Fantasy Dreamland/Free Character Sprites - Fantasy Dreamland/32x32/Char_004.png',
    char5: BASE + 'Free Character Sprites - Fantasy Dreamland/Free Character Sprites - Fantasy Dreamland/32x32/Char_005.png'
  };

  class AssetManager {
    constructor() {
      this.images = {};
      this.loadedCount = 0;
      this.totalCount = Object.keys(PATHS).length;
      this._coreTotal = this.totalCount;
      this._coreLoaded = 0;
      this._extraTotal = 0;
      this._extraLoaded = 0;
      this.ready = false;
      this.biomeTiles = {};
      this.iconCache = new Map();
      this.toolIconCache = new Map();
      this.preloadedUrls = {};
    }

    getLoadProgress() {
      const cTotal = this._coreTotal || this.totalCount || 1;
      const cLoaded = Math.min(cTotal, this._coreLoaded || this.loadedCount || 0);
      const eTotal = this._extraTotal || 0;
      const eLoaded = Math.min(eTotal, this._extraLoaded || 0);
      const total = Math.max(1, cTotal + eTotal);
      const loaded = cLoaded + eLoaded;
      const ratio = this.ready ? 1 : Math.min(0.99, loaded / total);
      return { loaded, total, ratio };
    }

    loadAll() {
      this.preloadedUrls = this.preloadedUrls || {};
      const pathEntries = Object.entries(PATHS);
      this._coreTotal = Math.max(1, pathEntries.length);
      this._coreLoaded = 0;

      // Load only core PATHS here; batched sprites_atlas.js handles all UI/tool/item/world assets once without double-fetching.
      const promises = pathEntries.map(([key, url]) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            this.images[key] = img;
            this.loadedCount++;
            this._coreLoaded++;
            resolve();
          };
          img.onerror = () => {
            this.loadedCount++;
            this._coreLoaded++;
            resolve();
          };
          img.src = encodeURI(url);
        });
      });

      return Promise.all(promises).then(() => {
        if (!this.deferReady) {
          this.buildBiomeCaches();
          this.ready = true;
        }
      });
    }

    get(key) {
      return this.images[key] || null;
    }

    getBuildingImg(spriteKey) {
      const CHEST_MAP = { chest_wood: 'wood_closed', chest_sapphire: 'sapphire_closed', chest_gold: 'gold_closed' };
      if (CHEST_MAP[spriteKey] && this.chestImages && this.chestImages[CHEST_MAP[spriteKey]]) {
        return this.chestImages[CHEST_MAP[spriteKey]];
      }
      const ex = this.extraImages && this.extraImages[spriteKey];
      if (ex && (!ex.tagName || (ex.complete && (ex.naturalWidth > 0 || ex.width > 0)))) return ex;
      return ex || this.images[spriteKey] || null;
    }

    buildBiomeCaches() {
      const makeSheet = (srcImg, sw, sh) => {
        if (!srcImg) return null;
        const c = document.createElement('canvas');
        c.width = sw;
        c.height = sh;
        const ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(srcImg, 0, 0, sw, sh, 0, 0, sw, sh);
        return c;
      };

      const allBiomes = [
        'pradera', 'desierto', 'bosque_oscuro', 'montanas_heladas', 'tierras_volcanicas',
        'archipielago_coral', 'selva_esmeralda', 'cavernas_cristal', 'caldera_ceniza',
        'cienaga_putrida', 'dinastia_arena', 'glaciar_profundo', 'necropolis_osea', 'tierras_malditas'
      ];
      for (const b of allBiomes) {
        const img = this.images['biome_' + b];
        if (img) {
          const sw = img.naturalWidth || img.width || 192;
          const sh = img.naturalHeight || img.height || 256;
          this.biomeTiles[b] = makeSheet(img, sw, sh);
        }
      }
    }

    // Minimal crash-safe fallback canvas if an image fails to load
    getItemIconCanvas(iconType) {
      const key = typeof iconType === 'string' && iconType ? iconType : '_unknown';
      if (this.iconCache.has(key)) return this.iconCache.get(key);
      const c = document.createElement('canvas');
      c.width = 24;
      c.height = 24;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      this.paintItemIcon(ctx, key);
      this.iconCache.set(key, c);
      return c;
    }

    getToolIconCanvas(toolId, tierId = 'basica') {
      const key = (toolId || 'pico') + '_' + (tierId || 'basica');
      if (this.toolIconCache.has(key)) return this.toolIconCache.get(key);
      const c = document.createElement('canvas');
      c.width = 28;
      c.height = 28;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      this.paintToolIcon(ctx, toolId, tierId);
      this.toolIconCache.set(key, c);
      return c;
    }

    getToolImg(toolId, tierId = 'basica') {
      const map = Abyssea.TOOL_PNG_MAP && Abyssea.TOOL_PNG_MAP[toolId];
      if (map) {
        const rawUrl = (tierId === 'basica' || !tierId) ? map.basica : map[tierId];
        if (rawUrl) {
          const ROOT_BASE = window.ABYSSEA_ROOT_BASE || '';
          const resolved = (ROOT_BASE && rawUrl.startsWith('assets/')) ? (ROOT_BASE + rawUrl) : rawUrl;
          const enc = encodeURI(resolved);
          const img = this.preloadedUrls && (this.preloadedUrls[enc] || this.preloadedUrls[encodeURI(rawUrl)]);
          if (img && img.complete && img.naturalWidth > 0) return img;
        }
      }
      return this.getToolIconCanvas(toolId, tierId) || this.getItemIconCanvas(toolId);
    }

    paintToolIcon(ctx, toolId, tierId) {
      const colors = {
        basica: '#a1887f', mejorada: '#66bb6a', cobre: '#e67e22', hierro: '#90a4ae',
        plata: '#cfd8dc', oro: '#ffb300', platino: '#80deea', acero: '#42a5f5',
        cristal: '#ab47bc', mitrilo: '#4dd0e1', titanio: '#b0bec5', adamantita: '#66bb6a',
        oricalco: '#ff7043', legendaria: '#ff9800', celestial: '#80deea', omega: '#e040fb'
      };
      const col = colors[tierId] || '#a1887f';
      ctx.fillStyle = '#1b1116';
      ctx.fillRect(4, 4, 20, 20);
      ctx.fillStyle = col;
      ctx.fillRect(6, 6, 16, 16);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillRect(7, 7, 6, 5);
    }

    paintItemIcon(ctx, iconType) {
      if (typeof iconType !== 'string' || !iconType) return;
      let h = 0;
      for (let i = 0; i < iconType.length; i++) h = (h * 31 + iconType.charCodeAt(i)) >>> 0;
      const hue = h % 360;
      ctx.fillStyle = '#1a1118';
      ctx.fillRect(4, 4, 16, 16);
      ctx.fillStyle = `hsl(${hue}, 42%, 42%)`;
      ctx.fillRect(5, 5, 14, 14);
      ctx.fillStyle = `hsl(${hue}, 55%, 64%)`;
      ctx.fillRect(6, 6, 6, 4);
    }
  }

  Abyssea.Assets = new AssetManager();

  Abyssea.SKINS = [
    {
      id: 'hana',
      name: 'Hana Caraka',
      name_en: 'Hana Caraka',
      role: 'Superviviente del Archipiélago',
      role_en: 'Archipelago Survivor',
      desc: 'Personaje único con animaciones completas de combate, magia, herramientas, granja, natación y pesca.',
      desc_en: 'Unique character with full animations for combat, magic, tools, farming, swimming, and fishing.',
      idle: 'hana_idle',
      walk: 'hana_walk',
      run: 'hana_run',
      jump: 'hana_jump',
      hurt: 'hana_hurt',
      death: 'hana_death',
      pickUp: 'hana_pick_up',
      swimIdle: 'hana_swim_idle',
      swimMove: 'hana_swim_move',
      sword: 'hana_sword',
      sword2: 'hana_sword_2',
      spear: 'hana_spear',
      spear2: 'hana_spear_2',
      bow: 'hana_bow',
      crossbow: 'hana_crossbow',
      wand: 'hana_wand',
      staff: 'hana_staff',
      block: 'hana_block',
      axe: 'hana_axe',
      pickaxe: 'hana_pickaxe',
      shovel: 'hana_shovel',
      hoe: 'hana_hoe',
      sickle: 'hana_sickle',
      hammer: 'hana_hammer',
      watering: 'hana_watering',
      planting: 'hana_planting',
      brush: 'hana_brush',
      milking: 'hana_milking',
      shear: 'hana_shear',
      fishCast: 'hana_fish_cast',
      fishIdle: 'hana_fish_idle',
      fishReel: 'hana_fish_reel',
      fishCatch: 'hana_fish_catch',
      type: 'hana'
    }
  ];
})();
