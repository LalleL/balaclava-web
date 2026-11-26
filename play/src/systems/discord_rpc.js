// Abyssea - Discord Rich Presence Bridge (Tauri v2 Native IPC)
(function () {
  'use strict';

  const Abyssea = (window.Abyssea = window.Abyssea || {});

  const WEBSITE_URL = 'https://abyssea.online/';
  const DISCORD_INVITE_URL = 'https://discord.gg/8wrsjRSMY2';
  const RPC_LARGE_IMAGE_KEY = 'rpc';
  const APP_VERSION_LABEL = 'Beta 2.0.0 RC2';
  const SESSION_START_SEC = Math.floor(Date.now() / 1000);
  const MIN_PUSH_INTERVAL_MS = 1200;
  const POLL_INTERVAL_MS = 2500;
  const TOTAL_SKILLS_FALLBACK = 345;
  const TOTAL_ISLANDS_FALLBACK = 361;

  const BIOME_NAMES_EN = {
    pradera: 'Emerald Meadow',
    desierto: 'Golden Desert',
    montanas_heladas: 'Frozen Mountains',
    bosque_oscuro: 'Dark Forest',
    tierras_volcanicas: 'Volcanic Lands',
    archipielago_coral: 'Coral Archipelago',
    cavernas_cristal: 'Crystal Caverns',
    selva_esmeralda: 'Emerald Jungle',
    caldera_ceniza: 'Ash Caldera',
    dinastia_arena: 'Scarlet Sand Dynasty',
    glaciar_profundo: 'Deep Glacier',
    cienaga_putrida: 'Putrid Mire',
    necropolis_osea: 'Bone Necropolis',
    tierras_malditas: 'Abyssal Cursed Lands'
  };

  const LUNAR_NAMES_EN = {
    luna_nueva: 'New Moon',
    cuarto_creciente: 'Waxing Crescent',
    luna_llena: 'Full Moon',
    luna_sangre: 'Blood Moon',
    eclipse_astral: 'Astral Eclipse'
  };

  let initialized = false;
  let lastSignature = '';
  let lastPushMs = 0;
  let pendingTimer = null;
  let pollTimer = null;

  function getTauriInvoke() {
    try {
      if (window.__TAURI__ && window.__TAURI__.core && typeof window.__TAURI__.core.invoke === 'function') {
        return window.__TAURI__.core.invoke.bind(window.__TAURI__.core);
      }
    } catch (_) {}
    try {
      if (window.__TAURI_INTERNALS__ && typeof window.__TAURI_INTERNALS__.invoke === 'function') {
        return window.__TAURI_INTERNALS__.invoke.bind(window.__TAURI_INTERNALS__);
      }
    } catch (_) {}
    return null;
  }

  function getLang() {
    try {
      if (Abyssea.I18n && typeof Abyssea.I18n.getLanguage === 'function') {
        return Abyssea.I18n.getLanguage() === 'en' ? 'en' : 'es';
      }
    } catch (_) {}
    return 'es';
  }

  function countUnlockedIslands(world) {
    if (!world || !Array.isArray(world.plotUnlocked)) {
      return { unlocked: 1, total: TOTAL_ISLANDS_FALLBACK };
    }
    let unlocked = 0;
    let total = 0;
    for (let gy = 0; gy < world.plotUnlocked.length; gy++) {
      const row = world.plotUnlocked[gy];
      if (!Array.isArray(row)) continue;
      for (let gx = 0; gx < row.length; gx++) {
        total++;
        if (row[gx]) unlocked++;
      }
    }
    return { unlocked: Math.max(1, unlocked), total: total || TOTAL_ISLANDS_FALLBACK };
  }

  function getPlayerBiomeInfo(game, isEn = false) {
    const BIOMES = (Abyssea.CONST && Abyssea.CONST.BIOMES) || {};
    const TILE_SIZE = (Abyssea.CONST && Abyssea.CONST.TILE_SIZE) || 48;
    const world = game && game.world;
    const player = game && game.player;
    let biomeId = 'pradera';

    if (world && player) {
      const tx = Math.floor(player.x / TILE_SIZE);
      const ty = Math.floor(player.y / TILE_SIZE);
      if (typeof world.getVisualBiomeAtTile === 'function') {
        biomeId = world.getVisualBiomeAtTile(tx, ty) || biomeId;
      } else if (typeof world.getBiomeAtPixel === 'function') {
        biomeId = world.getBiomeAtPixel(player.x, player.y) || biomeId;
      }
    }

    const def = BIOMES[biomeId];
    let name = (def && def.name) || biomeId;
    if (isEn) {
      if (Abyssea.I18n && typeof Abyssea.I18n.biomeName === 'function') {
        name = Abyssea.I18n.biomeName(biomeId) || BIOME_NAMES_EN[biomeId] || name;
      } else {
        name = BIOME_NAMES_EN[biomeId] || name;
      }
    }
    return {
      id: biomeId,
      name
    };
  }

  function getLunarInfo(game, isEn) {
    try {
      if (!game || typeof game.getLunarPhase !== 'function') return null;
      const ph = game.getLunarPhase();
      if (!ph || !ph.id) return null;
      const label = isEn ? (LUNAR_NAMES_EN[ph.id] || ph.name) : ph.name;
      const isSpecial = ph.id === 'luna_sangre' || ph.id === 'eclipse_astral';
      const isNight = Boolean(game.isNight || (typeof game.dayTime === 'number' && game.dayTime >= 0.625));
      return { id: ph.id, label, isSpecial, isNight };
    } catch (_) {
      return null;
    }
  }

  function buildButtons(lang) {
    return [
      {
        label: lang === 'en' ? 'Play Abyssea' : 'Jugar Abyssea',
        url: WEBSITE_URL
      },
      {
        label: lang === 'en' ? 'Join Discord' : 'Unirse al Discord',
        url: DISCORD_INVITE_URL
      }
    ];
  }

  function buildPayload() {
    const game = Abyssea.game;
    const ui = Abyssea.UI;
    const lang = getLang();
    const isEn = lang === 'en';
    const activeModal = ui ? ui.activeModal : null;
    const modalData = ui ? ui.modalData : null;
    const largeText = `Abyssea · ${APP_VERSION_LABEL}`;

    if (!game || !game.started) {
      return {
        details: isEn ? `Main Menu · ${APP_VERSION_LABEL}` : `Menú Principal · ${APP_VERSION_LABEL}`,
        state: isEn ? 'Preparing an expedition' : 'Preparando expedición',
        startTimestamp: SESSION_START_SEC,
        largeImage: RPC_LARGE_IMAGE_KEY,
        largeText,
        smallImage: null,
        smallText: null,
        buttons: buildButtons(lang),
        clear: false
      };
    }

    const lvl = (game.player && game.player.level) || 1;
    const day = game.dayCount || 1;
    const clearedCount = Array.isArray(game.clearedDungeons) ? game.clearedDungeons.length : 0;
    const islands = countUnlockedIslands(game.world);

    if (typeof game.isPlayerDead === 'function' && game.isPlayerDead()) {
      return {
        details: isEn ? 'Fallen in Battle' : 'Caído en combate',
        state: isEn ? `Respawning · Lv.${lvl}` : `Reapareciendo · Nv.${lvl}`,
        startTimestamp: SESSION_START_SEC,
        largeImage: RPC_LARGE_IMAGE_KEY,
        largeText,
        smallImage: null,
        smallText: null,
        buttons: buildButtons(lang),
        clear: false
      };
    }

    // Coastal Abyssal Leviathan Sea Boss encounter (RC2)
    const seaBoss = game.v2Runtime && game.v2Runtime.seaBoss;
    if (seaBoss && seaBoss.hp > 0 && !game.activeDungeon) {
      const hpPct = Math.max(1, Math.round((seaBoss.hp / Math.max(1, seaBoss.maxHp || 1)) * 100));
      return {
        details: isEn ? 'Boss: Abyssal Leviathan' : 'Jefe: Leviatán Abisal',
        state: isEn
          ? `Sea Boss (${hpPct}% HP) · Lv.${lvl}`
          : `Jefe Marino (${hpPct}% HP) · Nv.${lvl}`,
        startTimestamp: SESSION_START_SEC,
        largeImage: RPC_LARGE_IMAGE_KEY,
        largeText,
        smallImage: null,
        smallText: null,
        buttons: buildButtons(lang),
        clear: false
      };
    }

    if (game.activeDungeon) {
      const dung = game.activeDungeon;
      const isAbyss = Boolean(dung.abyssFloor || dung.isAbyss || dung.id === 'abismo_infinito' || (dung.def && dung.def.id === 'abismo_infinito'));
      const abyssFloor = dung.abyssFloor || (game.omega && game.omega.state && game.omega.state.abyss && game.omega.state.abyss.current) || 1;
      const dungName = isAbyss
        ? (isEn ? `Infinite Abyss F${abyssFloor}` : `Abismo Infinito P${abyssFloor}`)
        : ((dung.def && dung.def.name) || (isEn ? 'Dungeon' : 'Mazmorra'));
      const boss = dung.boss;
      const TILE_SIZE = (Abyssea.CONST && Abyssea.CONST.TILE_SIZE) || 48;
      const playerTx = game.player ? Math.floor(game.player.x / TILE_SIZE) : 0;
      const bossAlive = Boolean(boss && !boss._dead && (boss.hp || 0) > 0);
      const inBossRoom = Boolean(bossAlive && (dung.bossLocked || playerTx >= ((dung.bossRoomMinX || 34) - 2)));

      let details;
      let state;
      if (inBossRoom) {
        const hpPct = Math.max(1, Math.round(((boss.hp || 0) / Math.max(1, boss.maxHp || 1)) * 100));
        details = isEn ? `Boss: ${boss.name}` : `Jefe: ${boss.name}`;
        state = isEn
          ? `${dungName} (${hpPct}%) · Lv.${lvl}`
          : `${dungName} (${hpPct}%) · Nv.${lvl}`;
      } else if (dung.completed || (boss && boss._dead)) {
        details = isEn ? `Cleared: ${dungName}` : `Despejada: ${dungName}`;
        state = isEn
          ? `Lv.${lvl} · ${clearedCount} dungeons cleared`
          : `Nv.${lvl} · ${clearedCount} mazmorras`;
      } else {
        const aliveEnemies = Array.isArray(dung.enemies)
          ? dung.enemies.filter(e => e && !e._dead && (e.hp || 0) > 0).length + (bossAlive ? 1 : 0)
          : 0;
        details = isEn ? `Dungeon: ${dungName}` : `Mazmorra: ${dungName}`;
        state = isEn
          ? `Lv.${lvl} · ${aliveEnemies} foes left`
          : `Nv.${lvl} · ${aliveEnemies} enemigos`;
      }

      return {
        details,
        state,
        startTimestamp: SESSION_START_SEC,
        largeImage: RPC_LARGE_IMAGE_KEY,
        largeText,
        smallImage: null,
        smallText: null,
        buttons: buildButtons(lang),
        clear: false
      };
    }

    const biome = getPlayerBiomeInfo(game, isEn);
    const lunar = getLunarInfo(game, isEn);
    const totalSkills = (Abyssea.SKILLS && typeof Abyssea.SKILLS === 'object')
      ? (Array.isArray(Abyssea.SKILLS) ? Abyssea.SKILLS.length : Object.keys(Abyssea.SKILLS).length) || TOTAL_SKILLS_FALLBACK
      : TOTAL_SKILLS_FALLBACK;
    const bType = activeModal === 'building' && modalData ? modalData.type : null;

    let details = isEn ? `Exploring: ${biome.name}` : `Explorando: ${biome.name}`;
    let state = isEn
      ? `Lv.${lvl} · Day ${day} · ${islands.unlocked}/${islands.total} Islands`
      : `Nv.${lvl} · Día ${day} · ${islands.unlocked}/${islands.total} Islas`;

    if (game.paused || activeModal === 'pause') {
      details = isEn ? `Paused · ${biome.name}` : `En pausa · ${biome.name}`;
    } else if (activeModal === 'aquarium' || bType === 'portal_acuario') {
      details = isEn ? 'Visiting the Aquarium' : 'Visitando el Acuario';
      state = isEn ? `Lv.${lvl} · Exotic Fish Collection` : `Nv.${lvl} · Colección de peces`;
    } else if (activeModal === 'ghost_merchant') {
      details = isEn ? 'Ghost Merchant Ship' : 'Barco Mercader Fantasma';
      state = isEn ? `Lv.${lvl} · Coastal Trade` : `Nv.${lvl} · Comercio costero`;
    } else if (bType === 'mesa_reforja' || activeModal === 'reforge') {
      details = isEn ? 'Reforging Equipment' : 'Yunque de Reforja';
      state = isEn ? `Lv.${lvl} · Hunting Singular Tier` : `Nv.${lvl} · Buscando rareza Singular`;
    } else if (bType === 'salon_trofeos' || activeModal === 'museum') {
      const exhibits = Array.isArray(game.trophyExhibits) ? game.trophyExhibits.length : 0;
      details = isEn ? 'Trophy Hall Museum' : 'Salón de Trofeos';
      state = isEn ? `Lv.${lvl} · ${exhibits} relics displayed` : `Nv.${lvl} · ${exhibits} reliquias`;
    } else if (activeModal === 'spell_ritual' || activeModal === 'grimorio' || bType === 'alquimia' || bType === 'laboratorio') {
      details = isEn ? 'Alchemy & Arcane Rituals' : 'Alquimia y Rituales';
      state = isEn ? `Lv.${lvl} · ${biome.name}` : `Nv.${lvl} · ${biome.name}`;
    } else if (activeModal === 'skills') {
      const skillsCount = Array.isArray(game.unlockedSkills) ? game.unlockedSkills.length : 0;
      details = isEn ? 'Astral Constellation' : 'Árbol Astral';
      state = isEn
        ? `Lv.${lvl} · ${skillsCount}/${totalSkills} stars`
        : `Nv.${lvl} · ${skillsCount}/${totalSkills} estrellas`;
    } else if (activeModal === 'map') {
      details = isEn ? 'Archipelago Atlas' : 'Atlas del Archipiélago';
      state = isEn
        ? `${islands.unlocked}/${islands.total} islands · Lv.${lvl}`
        : `${islands.unlocked}/${islands.total} islas · Nv.${lvl}`;
    } else if (activeModal === 'encyclopedia' || activeModal === 'bestiary' || activeModal === 'compendium') {
      details = isEn ? 'Reading the Bestiary' : 'Consultando el Bestiario';
      state = isEn
        ? `Lv.${lvl} · ${clearedCount} dungeons`
        : `Nv.${lvl} · ${clearedCount} mazmorras`;
    } else if (activeModal === 'quests') {
      details = isEn ? 'Quests & Island Legacy' : 'Misiones y Legado';
      state = isEn
        ? `Lv.${lvl} · Day ${day} · ${biome.name}`
        : `Nv.${lvl} · Día ${day} · ${biome.name}`;
    } else if (activeModal === 'build' || activeModal === 'crafting') {
      details = isEn ? `Building in ${biome.name}` : `Construyendo en ${biome.name}`;
      state = isEn
        ? `Lv.${lvl} · ${islands.unlocked}/${islands.total} Islands`
        : `Nv.${lvl} · ${islands.unlocked}/${islands.total} Islas`;
    } else if (lunar && lunar.isSpecial && lunar.isNight) {
      details = isEn ? `${lunar.label} · ${biome.name}` : `${lunar.label} · ${biome.name}`;
    }

    return {
      details,
      state,
      startTimestamp: SESSION_START_SEC,
      largeImage: RPC_LARGE_IMAGE_KEY,
      largeText,
      smallImage: null,
      smallText: null,
      buttons: buildButtons(lang),
      clear: false
    };
  }

  function flushUpdate(force = false) {
    const invoke = getTauriInvoke();
    if (!invoke) return;

    const payload = buildPayload();
    const signature = JSON.stringify(payload);
    if (!force && signature === lastSignature) return;

    const now = Date.now();
    const elapsed = now - lastPushMs;
    if (!force && elapsed < MIN_PUSH_INTERVAL_MS) {
      if (!pendingTimer) {
        pendingTimer = setTimeout(() => {
          pendingTimer = null;
          flushUpdate(false);
        }, MIN_PUSH_INTERVAL_MS - elapsed);
      }
      return;
    }

    lastSignature = signature;
    lastPushMs = now;
    try {
      Promise.resolve(invoke('rpc_update_activity', { payload })).catch(() => {});
    } catch (_) {}
  }

  function initDiscord() {
    if (!getTauriInvoke()) return;
    if (initialized) {
      flushUpdate(true);
      return;
    }
    initialized = true;
    flushUpdate(true);
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(() => flushUpdate(false), POLL_INTERVAL_MS);
  }

  function actualizarDiscord(force = false) {
    flushUpdate(Boolean(force));
  }

  async function getDiscordStatus() {
    const invoke = getTauriInvoke();
    if (!invoke) return { tauri: false, connected: false };
    try {
      const status = await invoke('rpc_get_status');
      return Object.assign({ tauri: true }, status || {});
    } catch (err) {
      return { tauri: true, connected: false, error: String(err) };
    }
  }

  Abyssea.DiscordRPC = {
    init: initDiscord,
    update: actualizarDiscord,
    buildPayload,
    getStatus: getDiscordStatus
  };
  Abyssea.initDiscord = initDiscord;
  Abyssea.actualizarDiscord = actualizarDiscord;
  window.actualizarDiscord = actualizarDiscord;
})();
