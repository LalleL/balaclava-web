/**
 * ABYSSEA — Beta 2.0.0 Release Candidate 2 Systems Module
 * Modular implementation of:
 *  - Dynamic Interactive Events (Raids, Abyssal Night Pulse, Biome Weather, Ghost Merchant Ship)
 *  - Active Companion Pets (5 animated 4-frame pets) & Base Specialist Villagers
 *  - Contextual Onboarding Hints, "What To Do Now?" Progression Guide & Gamepad API Support
 *  - Perfect Dodge, Roguelike Dungeon Affixes, Lunar Cycle (5 phases) & Dynamic Daily Market Demand
 *  - Trophy Hall / Museum, Architectural Structure Relocator (Buildings, Gates & Altars)
 *  - Armor Set Synergies, Marine Encounters (Whirlpools + Coastal Leviathan Boss & Tentacles)
 *  - Archipelago Teleport Beacons, Expanded Guild Contracts & Token Shop, Enhanced Photo Mode
 */
(function () {
  'use strict';

  const Abyssea = (window.Abyssea = window.Abyssea || {});
  const { PLOT_TILES, TILE_SIZE, BIOMES } = Abyssea.CONST || { PLOT_TILES: 12, TILE_SIZE: 48, BIOMES: {} };
  const { dist, clamp, pick, randInt } = Abyssea.Utils || {
    dist: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1),
    clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
    pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
    randInt: (a, b) => a + Math.floor(Math.random() * (b - a + 1))
  };

  Abyssea.V2_VERSION = '2.0.0-rc2';

  // ============================================================================
  // 1. CATALOGS: PETS, LUNAR PHASES, DUNGEON AFFIXES, MARKET DEMAND, SETS, GUILD
  // ============================================================================
  const PET_DEFS = {
    limo_dorado: {
      id: 'limo_dorado',
      name: 'Limo Dorado',
      role: 'Recolector',
      sprite: 'pet_limo_dorado_4f',
      icon: 'pet_limo_dorado',
      color: '#ffd54f',
      collectRadius: 245,
      passive: { coinDropBonus: 0.12, magnetBonus: 85 },
      desc: 'Recoge automáticamente drops y orbes en 245px. Pasiva: +12% Monedas.'
    },
    cangrejo_coral: {
      id: 'cangrejo_coral',
      name: 'Cangrejo Coralino',
      role: 'Recolector',
      sprite: 'pet_cangrejo_coral_4f',
      icon: 'pet_cangrejo_coral',
      color: '#ff8a65',
      collectRadius: 265,
      passive: { gatherPower: 0.15, fishWindow: 0.08, magnetBonus: 100 },
      desc: 'Recoge materiales en 265px. Pasiva: +15% Poder de Recolección y +8% Pesca.'
    },
    buho_astral: {
      id: 'buho_astral',
      name: 'Búho Astral',
      role: 'Combate',
      sprite: 'pet_buho_astral_4f',
      icon: 'pet_buho_astral',
      color: '#b388ff',
      attackRate: 2.2,
      attackRange: 340,
      attackEffect: 'slow',
      projColor: '#00e5ff',
      passive: { spellPower: 0.10, critChance: 0.05 },
      desc: 'Dispara proyectiles arcanos cada 2.2s que ralentizan enemigos. Pasiva: +10% Poder Mágico.'
    },
    espiritu_igneo: {
      id: 'espiritu_igneo',
      name: 'Espíritu Ígneo',
      role: 'Combate',
      sprite: 'pet_espiritu_igneo_4f',
      icon: 'pet_espiritu_igneo',
      color: '#ff7043',
      attackRate: 2.0,
      attackRange: 350,
      attackEffect: 'burn',
      projColor: '#ff7043',
      passive: { dmgBonus: 0.10, burnDmg: 8 },
      desc: 'Lanza llamas rastreadoras cada 2.0s con quemadura. Pasiva: +10% Daño Total.'
    },
    pez_linterna: {
      id: 'pez_linterna',
      name: 'Pez Linterna Abisal',
      role: 'Luminaria',
      sprite: 'pet_pez_linterna_4f',
      icon: 'pet_pez_linterna',
      color: '#4dd0e1',
      collectRadius: 165,
      passive: { lightRadius: 190, luckBonus: 0.20, doubleDropChance: 0.08 },
      desc: 'Ilumina cuevas, mazmorras y noches (+190px luz). Pasiva: +20% Suerte y +8% Doble Botín.'
    }
  };
  Abyssea.PET_DEFS = PET_DEFS;

  const LUNAR_PHASES = [
    { id: 'luna_nueva',      name: 'Luna Nueva',       short: 'Nueva',    color: '#90a4ae', nightTint: null,                     desc: 'Noche serena con visibilidad estándar.' },
    { id: 'cuarto_creciente',name: 'Cuarto Creciente', short: 'Creciente',color: '#b3e5fc', nightTint: 'rgba(18,38,72,0.10)',    desc: '+15% Suerte nocturna en recolección y pesca.' },
    { id: 'luna_llena',      name: 'Luna Llena',       short: 'Llena',    color: '#fff59d', nightTint: 'rgba(210,225,255,0.06)', desc: '+20% Velocidad de regeneración de cultivos y pesca rara.' },
    { id: 'luna_sangre',     name: 'Luna de Sangre',   short: 'Sangre',   color: '#ff5252', nightTint: 'rgba(135,18,32,0.24)',   desc: 'Enemigos nocturnos más frecuentes, +40% EXP en combate y sueltan Esencia Lunar.' },
    { id: 'eclipse_astral',  name: 'Eclipse Astral',   short: 'Eclipse',  color: '#e040fb', nightTint: 'rgba(66,18,112,0.26)',   desc: '+35% Poder Mágico, -25% Cooldown de Hechizos, +65% Pesca Exótica y Esencia Lunar.' }
  ];
  Abyssea.LUNAR_PHASES = LUNAR_PHASES;

  const DUNGEON_AFFIXES = {
    suelo_volcanico: { id: 'suelo_volcanico', name: 'Suelo Volcánico',   color: '#ff7043', desc: 'Círculos de magma telegrafiados emergen periódicamente bajo tus pies.' },
    enemigos_veloces:{ id: 'enemigos_veloces',name: 'Enemigos Veloces',  color: '#ffd54f', desc: 'Los enemigos se mueven +20% más rápido, pero otorgan +30% EXP.' },
    lluvia_oro:      { id: 'lluvia_oro',      name: 'Lluvia de Oro',     color: '#ffee58', desc: '+100% Monedas y +25% Botín doble dentro de la mazmorra.' },
    mana_infinito:   { id: 'mana_infinito',   name: 'Maná Infinito',     color: '#4fc3f7', desc: '-75% coste de energía y -35% enfriamiento en todos tus hechizos.' },
    furia_critica:   { id: 'furia_critica',   name: 'Furia Crítica',     color: '#ff5252', desc: '+25% Probabilidad Crítica para Hana (+15% daño enemigo).' },
    eco_vampirico:   { id: 'eco_vampirico',   name: 'Eco Vampírico',     color: '#ce93d8', desc: 'Cada enemigo derrotado restaura +10 HP instantáneamente.' }
  };
  Abyssea.DUNGEON_AFFIXES = DUNGEON_AFFIXES;

  const MARKET_DEMAND_ROTATION = [
    {
      id: 'lingotes',
      title: 'Fiebre Metalúrgica (+45% en Lingotes)',
      short: 'Lingotes +45%',
      mult: 1.45,
      color: '#ffab40',
      matches: (id, it) => id.startsWith('lingote_') || id.startsWith('placa_') || id.startsWith('aleacion_')
    },
    {
      id: 'peces',
      title: 'Feria del Acuario (2x en Peces y Mariscos)',
      short: 'Peces x2.0',
      mult: 2.0,
      color: '#4fc3f7',
      matches: (id, it) => Boolean((Abyssea.AQUARIUM_FISH_PASSIVES && Abyssea.AQUARIUM_FISH_PASSIVES[id]) || /^(pez_|anchoa|lubina|bagre|trucha|carpa_|anguila|medusa|pulpo|camaron|cangrejo_|mantarraya_|tiburon_|celacanto_|koi_|leviatan_|raya_|esturion_|perla)/.test(id))
    },
    {
      id: 'gemas',
      title: 'Subasta de Joyeros (+60% en Gemas y Cristales)',
      short: 'Gemas +60%',
      mult: 1.60,
      color: '#e040fb',
      matches: (id, it) => (it && it.category === 'gemas') || /cristal|diamante|rubi|zafiro|esmeralda|amatista|topacio|jade|onice|bismuto|celestita|agata|ambar/.test(id)
    },
    {
      id: 'cultivos',
      title: 'Banquete Insular (+50% en Cultivos y Cocina)',
      short: 'Cocina +50%',
      mult: 1.50,
      color: '#81c784',
      matches: (id, it) => it && (it.category === 'alimentos' || it.category === 'comida') && !(Abyssea.AQUARIUM_FISH_PASSIVES && Abyssea.AQUARIUM_FISH_PASSIVES[id])
    },
    {
      id: 'botin',
      title: 'Búsqueda del Gremio (+55% en Botín de Monstruos y Trofeos)',
      short: 'Botín +55%',
      mult: 1.55,
      color: '#ff5252',
      matches: (id, it) => (it && it.category === 'monstruo') || id.startsWith('trofeo_') || id.startsWith('esencia_')
    }
  ];
  Abyssea.MARKET_DEMAND_ROTATION = MARKET_DEMAND_ROTATION;

  const SPECIALIST_VILLAGERS = [
    {
      building: 'casa_comercio',
      id: 'spec_mercader',
      name: 'Mercader Orin',
      role: 'Corredor del Archipiélago',
      sheet: 'zara',
      greeting: 'Las rutas marítimas están en auge. Aprovecha la Demanda Diaria en el Mercado para multiplicar tus ganancias.',
      contract: { item: 'tablon', qty: 12, rewardCoins: 145, rewardTokens: 1 }
    },
    {
      building: 'banco',
      id: 'spec_banquero',
      name: 'Tesorero Bram',
      role: 'Maestro de Bóveda',
      sheet: 'bjorn',
      greeting: 'Cada moneda invertida en islas y balizas rúnicas devuelve el triple en producción automatizada.',
      contract: { item: 'lingote_oro', qty: 4, rewardCoins: 240, rewardTokens: 1 }
    },
    {
      building: 'laboratorio',
      id: 'spec_alquimista',
      name: 'Sabia Mirel',
      role: 'Archialquimista',
      sheet: 'lyra',
      greeting: 'Bajo Luna de Sangre y Eclipse Astral las criaturas sueltan Esencia Lunar pura. Úsala en Catalizadores de Reforja.',
      contract: { item: 'cristales', qty: 6, rewardCoins: 190, rewardTokens: 1 }
    },
    {
      building: 'cocina',
      id: 'spec_chef',
      name: 'Chef Nerea',
      role: 'Maestra Gastronómica',
      sheet: 'selene',
      greeting: 'El Trigo Dorado Real y los peces del Estanque preparan los mejores banquetes para las mazmorras profundas.',
      contract: { item: 'trigo', qty: 10, rewardCoins: 135, rewardTokens: 1 }
    }
  ];
  Abyssea.SPECIALIST_VILLAGERS = SPECIALIST_VILLAGERS;

  const ARMOR_SET_SYNERGIES = [
    {
      id: 'set_glacial',
      name: 'Sinergia Glacial',
      color: '#4fc3f7',
      keywords: ['glaciar', 'boreal', 'cristal', 'escarcha'],
      desc: '3+ piezas Glaciales/Boreales: los críticos liberan una Nova de Escarcha que congela enemigos cercanos (+12% Crítico).'
    },
    {
      id: 'set_volcanico',
      name: 'Sinergia Volcánica',
      color: '#ff7043',
      keywords: ['volcan', 'caldera', 'oricalco', 'fenix', 'escoria'],
      desc: '3+ piezas Volcánicas/Caldera: hacer Dash deja una estela de fuego que quema enemigos (+14% Daño).'
    },
    {
      id: 'set_astral',
      name: 'Sinergia Astral / Omega',
      color: '#e040fb',
      keywords: ['omega', 'celestial', 'solar', 'abyssea', 'astral'],
      desc: '3+ piezas Astrales/Celestiales/Omega: 22% de probabilidad de lanzar hechizos sin cooldown (+20% Poder Mágico).'
    },
    {
      id: 'set_coral',
      name: 'Sinergia de Marea Coralina',
      color: '#26c6da',
      keywords: ['coral', 'selva', 'platino'],
      desc: '3+ piezas Coralinas/Selvanas: +18% Velocidad de Movimiento y +3.5 HP/s de regeneración.'
    },
    {
      id: 'set_maldito',
      name: 'Sinergia Abisal / Maldita',
      color: '#ff5252',
      keywords: ['abismal', 'maldito', 'eclipse', 'faraon', 'sombra'],
      desc: '3+ piezas Abisales/Malditas: +10 Curación al matar y dispara un rayo espectral buscador tras cada baja.'
    }
  ];
  Abyssea.ARMOR_SET_SYNERGIES = ARMOR_SET_SYNERGIES;

  const HANA_COSMETICS = [
    { id: 'none',           name: 'Clásica de Hana',     costTokens: 0, color: '#ffffff', desc: 'Aspecto original sin aura adicional.' },
    { id: 'aura_estelar',   name: 'Aura Estelar Azul',   costTokens: 3, color: '#00e5ff', desc: 'Estela celeste con destellos orbitales alrededor de Hana.' },
    { id: 'manto_carmesi',  name: 'Manto del Eclipse',   costTokens: 5, color: '#ff1744', desc: 'Halo carmesí ardiente inspirado en el Espadachín del Eclipse.' },
    { id: 'destello_coral', name: 'Espuma Coralina',     costTokens: 3, color: '#4deeea', desc: 'Burbujas turquesa bioluminiscentes al caminar.' },
    { id: 'halo_dorado',    name: 'Corona de Campeón',   costTokens: 6, color: '#ffd54f', desc: 'Resplandor dorado real del Consejo del Gremio.' }
  ];
  Abyssea.HANA_COSMETICS = HANA_COSMETICS;

  const WEEKLY_GUILD_CHALLENGES = [
    {
      id: 'wk_coral_ingots',
      title: 'Envío de Lingotes Coralinos',
      desc: 'Reúne 25 Lingotes de Coral, Hierro o Acero en tu inventario.',
      target: 25,
      rewardTokens: 3,
      rewardCoins: 450,
      rewardXp: 240,
      progress: (g) => (g.inventory.lingote_coral || 0) + (g.inventory.lingote_acero || 0) + (g.inventory.lingote_hierro || 0)
    },
    {
      id: 'wk_dungeon_master',
      title: 'Incursión de Mazmorras',
      desc: 'Conquista 3 mazmorras (o 1 en Modo Corrupto).',
      target: 3,
      rewardTokens: 4,
      rewardCoins: 650,
      rewardXp: 360,
      progress: (g) => ((g.clearedDungeons || []).length) + ((g.corruptedClearedDungeons || []).length * 3)
    },
    {
      id: 'wk_epic_angler',
      title: 'Maestría Pesquera del Gremio',
      desc: 'Captura 15 peces en total en el archipiélago.',
      target: 15,
      rewardTokens: 3,
      rewardCoins: 420,
      rewardXp: 260,
      progress: (g) => (g.stats && g.stats.fishCaught) || 0
    },
    {
      id: 'wk_monster_hunter',
      title: 'Cacería Nocturna del Archipiélago',
      desc: 'Derrota 40 enemigos en islas o mazmorras.',
      target: 40,
      rewardTokens: 3,
      rewardCoins: 520,
      rewardXp: 310,
      progress: (g) => (g.stats && (g.stats.kills || g.stats.enemiesKilled)) || 0
    },
    {
      id: 'wk_artisan_reforge',
      title: 'Artífice del Yunque',
      desc: 'Fabrica o reforja 25 objetos en tus estaciones.',
      target: 25,
      rewardTokens: 3,
      rewardCoins: 480,
      rewardXp: 280,
      progress: (g) => ((g.stats && g.stats.craftedTotal) || 0) + ((g.stats && g.stats.reforgedTotal) || 0)
    },
    {
      id: 'wk_sea_conqueror',
      title: 'Cazador de Leviatanes y Remolinos',
      desc: 'Derrota 1 Jefe Marino o recolecta 1 Perla del Leviatán / 3 Esencias Lunares.',
      target: 1,
      rewardTokens: 5,
      rewardCoins: 850,
      rewardXp: 450,
      progress: (g) => Math.max(
        (g.stats && g.stats.seaBossesKilled) || 0,
        (g.inventory.perla_leviatan || 0),
        Math.floor((g.inventory.esencia_lunar || 0) / 3)
      )
    }
  ];
  Abyssea.WEEKLY_GUILD_CHALLENGES = WEEKLY_GUILD_CHALLENGES;

  // ============================================================================
  // 2. ATTACH RUNTIME METHODS TO GameEngine.prototype
  // ============================================================================
  function attachGameEngineV2() {
    const GameEngine = Abyssea.GameEngine;
    if (!GameEngine || GameEngine.prototype._v2Attached) return;
    GameEngine.prototype._v2Attached = true;

    const proto = GameEngine.prototype;

    proto.ensureV2State = function () {
      if (!Array.isArray(this.unlockedPets)) this.unlockedPets = [];
      if (this.activePet === undefined) this.activePet = null;
      if (!Array.isArray(this.trophyExhibits)) this.trophyExhibits = [];
      if (!Array.isArray(this.claimedWeeklyChallenges)) this.claimedWeeklyChallenges = [];
      if (!this.seenV2Hints || typeof this.seenV2Hints !== 'object') this.seenV2Hints = {};
      if (!this.hanaCosmetic) this.hanaCosmetic = 'none';
      if (!this.stats) this.stats = this.makeInitialStats ? this.makeInitialStats() : {};
      if (!this.stats.killsByEnemy || typeof this.stats.killsByEnemy !== 'object') this.stats.killsByEnemy = {};
      if (!Array.isArray(this.worldWhirlpools)) this.worldWhirlpools = [];
      if (!this.v2Runtime) {
        this.v2Runtime = {
          petPos: { x: (this.player && this.player.x) || 0, y: (this.player && this.player.y) || 0 },
          petAtkCd: 0,
          ghostShip: null,
          ghostShipCd: 110,
          raid: null,
          abyssPulseBoss: null,
          seaBoss: null,
          seaBossCd: 195,
          whirlpoolCd: 18,
          fireTrails: [],
          villagerContractDay: {},
          photoCamOff: { x: 0, y: 0 },
          relocating: null,
          relocatorActive: false,
          gpConnected: false,
          gpPrevButtons: {}
        };
      }
      return this.v2Runtime;
    };

    // --- F. LUNAR CYCLE ---
    proto.getLunarPhase = function () {
      const day = Math.max(1, Math.floor(this.dayCount || 1));
      const idx = (day - 1) % LUNAR_PHASES.length;
      return LUNAR_PHASES[idx] || LUNAR_PHASES[0];
    };

    proto.getLunarFishingLuckBonus = function () {
      const ph = this.getLunarPhase();
      if (ph.id === 'eclipse_astral') return 0.65;
      if (ph.id === 'luna_llena') return 0.25;
      if (ph.id === 'cuarto_creciente') return 0.15;
      return 0;
    };

    // --- G. DAILY DYNAMIC MARKET DEMAND ---
    proto.getDailyMarketDemand = function () {
      const day = Math.max(1, Math.floor(this.dayCount || 1));
      return MARKET_DEMAND_ROTATION[(day - 1) % MARKET_DEMAND_ROTATION.length] || MARKET_DEMAND_ROTATION[0];
    };

    // --- #2 BESTIARY MASTERY ---
    proto.getBestiaryMastery = function (enemyType) {
      const kills = (this.stats && this.stats.killsByEnemy && this.stats.killsByEnemy[enemyType]) || 0;
      const tier = kills >= 250 ? 3 : kills >= 100 ? 2 : kills >= 25 ? 1 : 0;
      const nextTarget = tier === 0 ? 25 : tier === 1 ? 100 : tier === 2 ? 250 : 250;
      return {
        kills,
        tier,
        nextTarget,
        dmgBonus: tier * 0.05,
        dropBonus: tier * 0.10
      };
    };

    // --- #3 ARMOR SET & RELIC SYNERGIES ---
    proto.getActiveSetSynergies = function () {
      const eq = this.equipped || {};
      const wornIds = Object.values(eq).filter(Boolean).map(s => String(s).toLowerCase());
      const active = [];
      for (const syn of ARMOR_SET_SYNERGIES) {
        let count = 0;
        for (const wid of wornIds) {
          if (syn.keywords.some(kw => wid.includes(kw))) count++;
        }
        if (count >= 3) active.push({ ...syn, count });
      }
      return active;
    };

    // --- H. TROPHY HALL BONUSES ---
    proto.getTrophyHallBonuses = function () {
      this.ensureV2State();
      const cleared = Array.isArray(this.clearedDungeons) ? this.clearedDungeons.length : 0;
      const exhibited = Array.isArray(this.trophyExhibits) ? this.trophyExhibits.length : 0;
      let singulars = 0;
      if (this.toolRarities) {
        for (const r of Object.values(this.toolRarities)) if (r === 'singular') singulars++;
      }
      if (this.weaponRarities) {
        for (const r of Object.values(this.weaponRarities)) if (r === 'singular') singulars++;
      }
      const hasHall = this.hasBuilding && this.hasBuilding('salon_trofeos');
      const ranks = hasHall ? (Math.floor(cleared / 5) + exhibited + singulars * 2) : 0;
      return {
        hasHall,
        cleared,
        exhibited,
        singulars,
        ranks,
        dmgBonus: +(ranks * 0.03).toFixed(3),
        luckBonus: +(ranks * 0.03).toFixed(3),
        xpBonus: +(ranks * 0.03).toFixed(3),
        maxHp: ranks * 20
      };
    };

    // --- COMBINED V2 MODIFIERS (called inside recomputeModifiers) ---
    proto.getV2Modifiers = function () {
      this.ensureV2State();
      const out = {};
      const add = (obj) => {
        if (!obj) return;
        for (const [k, v] of Object.entries(obj)) {
          if (typeof v === 'number') out[k] = (out[k] || 0) + v;
          else if (typeof v === 'boolean' && v) out[k] = true;
        }
      };

      // Active Companion Pet passive
      if (this.activePet && PET_DEFS[this.activePet]) {
        add(PET_DEFS[this.activePet].passive);
      }

      // Trophy Hall museum bonuses
      const th = this.getTrophyHallBonuses();
      if (th.ranks > 0) {
        out.dmgBonus = (out.dmgBonus || 0) + th.dmgBonus;
        out.luckBonus = (out.luckBonus || 0) + th.luckBonus;
        out.xpBonus = (out.xpBonus || 0) + th.xpBonus;
        out.maxHp = (out.maxHp || 0) + th.maxHp;
      }

      // Lunar Cycle active bonuses (during night or dusk)
      const dayPhase = this.getDayPhase ? this.getDayPhase().phase : 'dia';
      const isNight = dayPhase === 'noche' || dayPhase === 'atardecer';
      const lunar = this.getLunarPhase();
      if (isNight) {
        if (lunar.id === 'cuarto_creciente') out.luckBonus = (out.luckBonus || 0) + 0.15;
        if (lunar.id === 'luna_sangre') out.xpBonus = (out.xpBonus || 0) + 0.40;
        if (lunar.id === 'eclipse_astral') {
          out.spellPower = (out.spellPower || 0) + 0.35;
          out.spellCdRed = (out.spellCdRed || 0) + 0.25;
        }
      }

      // Armor Set Synergies
      const syns = this.getActiveSetSynergies();
      for (const s of syns) {
        if (s.id === 'set_glacial') { out.critChance = (out.critChance || 0) + 0.12; out.synergyGlacial = true; }
        if (s.id === 'set_volcanico') { out.dmgBonus = (out.dmgBonus || 0) + 0.14; out.synergyVolcanic = true; }
        if (s.id === 'set_astral') { out.spellPower = (out.spellPower || 0) + 0.20; out.synergyAstral = true; }
        if (s.id === 'set_coral') { out.moveSpeed = (out.moveSpeed || 0) + 0.18; out.regen = (out.regen || 0) + 3.5; }
        if (s.id === 'set_maldito') { out.killHeal = (out.killHeal || 0) + 10; out.synergyCursed = true; }
      }

      // Active Dungeon Roguelike Affixes
      if (this.activeDungeon && Array.isArray(this.activeDungeon.affixes)) {
        for (const afId of this.activeDungeon.affixes) {
          if (afId === 'enemigos_veloces') out.xpBonus = (out.xpBonus || 0) + 0.30;
          if (afId === 'lluvia_oro') { out.coinDropBonus = (out.coinDropBonus || 0) + 1.0; out.doubleDropChance = (out.doubleDropChance || 0) + 0.25; }
          if (afId === 'mana_infinito') { out.manaSave = (out.manaSave || 0) + 0.75; out.spellCdRed = (out.spellCdRed || 0) + 0.35; }
          if (afId === 'furia_critica') out.critChance = (out.critChance || 0) + 0.25;
          if (afId === 'eco_vampirico') out.killHeal = (out.killHeal || 0) + 10;
        }
      }

      return out;
    };

    // --- B. PETS MANAGEMENT ---
    proto.unlockPet = function (petId, autoEquip = true) {
      this.ensureV2State();
      const def = PET_DEFS[petId];
      if (!def) return false;
      if (this.unlockedPets.includes(petId)) {
        this.activePet = petId;
        this.recomputeModifiers();
        this.toast(`Mascota equipada: ${def.name} (${def.role}).`, 'info');
        this.uiDirty = true;
        return false;
      }
      this.unlockedPets.push(petId);
      if (autoEquip || !this.activePet) this.activePet = petId;
      this.recomputeModifiers();
      if (Abyssea.Audio) Abyssea.Audio.play('levelup');
      this.spawnParticles(this.player.x, this.player.y, def.color, 22);
      this.toast(`¡Nueva Mascota desbloqueada: ${def.name}! ${def.desc}`, 'success');
      this.uiDirty = true;
      return true;
    };

    proto.setActivePet = function (petId) {
      this.ensureV2State();
      if (petId === null) {
        this.activePet = null;
        this.recomputeModifiers();
        this.toast('Mascota descansando en tu campamento.', 'info');
        this.uiDirty = true;
        return true;
      }
      if (!this.unlockedPets.includes(petId) || !PET_DEFS[petId]) return false;
      this.activePet = petId;
      this.v2Runtime.petPos.x = this.player.x - 36;
      this.v2Runtime.petPos.y = this.player.y + 12;
      this.recomputeModifiers();
      if (Abyssea.Audio) Abyssea.Audio.play('equip');
      this.toast(`Mascota activa: ${PET_DEFS[petId].name} (${PET_DEFS[petId].role}).`, 'success');
      this.uiDirty = true;
      return true;
    };

    // --- D. PERFECT DODGE ---
    proto.triggerPerfectDodge = function () {
      const p = this.player;
      if (!p || (this.time - (p._lastPerfectDodge || -99)) < 0.75) return false;
      p._lastPerfectDodge = this.time;
      p.invuln = Math.max(p.invuln || 0, 0.70);
      p.guaranteedCritNext = true;
      // Reduce all active spell cooldowns by 2.5s
      if (this.spellCooldowns) {
        for (const sid of Object.keys(this.spellCooldowns)) {
          this.spellCooldowns[sid] = Math.max(0, this.spellCooldowns[sid] - 2.5);
          if (this.spellCooldowns[sid] <= 0) delete this.spellCooldowns[sid];
        }
      }
      if (Abyssea.Audio) Abyssea.Audio.play('crit');
      this.shake(0.18, 5);
      this.spawnShockwave(p.x, p.y, 115, '#ffd54f');
      this.spawnParticles(p.x, p.y, '#00e5ff', 18);
      this.addFloatingText(p.x, p.y - 38, '¡ESQUIVE PERFECTO! CRÍTICO x2.2', '#ffd54f');
      this.uiDirty = true;
      return true;
    };

    // --- E. ROGUELIKE DUNGEON AFFIXES ---
    proto.applyDungeonAffixes = function (dung) {
      if (!dung) return;
      const allKeys = Object.keys(DUNGEON_AFFIXES);
      const count = (dung.isCorrupted || dung.abyssFloor > 0) ? 2 : (dung.tier >= 1 ? 1 : 0);
      if (count <= 0) {
        dung.affixes = [];
        return;
      }
      const chosen = [];
      const pool = [...allKeys];
      for (let i = 0; i < count && pool.length > 0; i++) {
        const idx = Math.floor(Math.random() * pool.length);
        chosen.push(pool.splice(idx, 1)[0]);
      }
      dung.affixes = chosen;
      dung._volcanicAffixTimer = 5.5;
      // Apply immediate mob speed/dmg modifiers for chosen affixes
      const allMobs = [...(dung.enemies || []), ...(dung.boss ? [dung.boss] : [])];
      for (const m of allMobs) {
        if (chosen.includes('enemigos_veloces')) m.speed = Math.round((m.speed || 70) * 1.20);
        if (chosen.includes('furia_critica')) m.dmg = Math.round((m.dmg || 12) * 1.15);
      }
      this.recomputeModifiers();
      const names = chosen.map(id => DUNGEON_AFFIXES[id].name).join(' · ');
      this.toast(`Afijos de Mazmorra activos: ${names}`, 'warn');
    };

    // --- I. STRUCTURE RELOCATOR (Cetro de Traslado Arquitectónico) ---
    proto.toggleRelocatorMode = function () {
      const rt = this.ensureV2State();
      if (this.activeDungeon || this.activeAquarium) {
        this.toast('El Cetro de Traslado solo funciona en las islas del archipiélago.', 'warn');
        return false;
      }
      rt.relocatorActive = !rt.relocatorActive;
      rt.relocating = null;
      this.placingBuildingId = null;
      this.placingItemId = null;
      if (Abyssea.UI && Abyssea.UI.activeModal) Abyssea.UI.closeModal();
      if (rt.relocatorActive) {
        this.toast('Cetro de Traslado ACTIVO: Clic en un edificio, Altar o Portal de Mazmorra para moverlo (ESC cancela).', 'info');
      } else {
        this.toast('Modo Traslado desactivado.', 'info');
      }
      this.uiDirty = true;
      return rt.relocatorActive;
    };

    proto.handleRelocatorClick = function (wx, wy) {
      const rt = this.ensureV2State();
      if (!rt.relocatorActive || this.activeDungeon || this.activeAquarium) return false;
      const tx = Math.floor(wx / TILE_SIZE);
      const ty = Math.floor(wy / TILE_SIZE);

      // Step 1: Pick up a building, dungeon gate, or world altar
      if (!rt.relocating) {
        const b = this.getBuildingAtTile(tx, ty);
        if (b) {
          const def = Abyssea.BUILDINGS[b.type];
          rt.relocating = { kind: 'building', ref: b, name: (def && def.name) || b.type, size: (def && def.size) || 1, placeOn: (def && def.placeOn) || 'land' };
          if (Abyssea.Audio) Abyssea.Audio.play('pickup');
          this.toast(`Estructura recogida: ${rt.relocating.name}. Clic en el destino para reubicarla.`, 'info');
          this.uiDirty = true;
          return true;
        }
        const n = (this.world.nodes || []).find(nd =>
          (nd.kind === 'dungeon_gate' || nd.kind === 'altar_shrine') &&
          dist(wx, wy, nd.x, nd.y) <= 58
        );
        if (n) {
          const gName = n.kind === 'dungeon_gate'
            ? ((Abyssea.DUNGEON_DEFS[n.dungeonId] && Abyssea.DUNGEON_DEFS[n.dungeonId].name) || n.dungeonId)
            : ((Abyssea.ALTAR_DEFS && Abyssea.ALTAR_DEFS[n.altarId] && Abyssea.ALTAR_DEFS[n.altarId].name) || 'Altar Sagrado');
          rt.relocating = { kind: n.kind, ref: n, name: gName, size: 1, placeOn: 'land' };
          if (Abyssea.Audio) Abyssea.Audio.play('pickup');
          this.toast(`Estructura antigua recogida: ${gName}. Clic en una parcela desbloqueada para reubicarla.`, 'info');
          this.uiDirty = true;
          return true;
        }
        this.toast('Haz clic sobre un edificio propio, Altar o Portal de Mazmorra para trasladarlo.', 'warn');
        return true;
      }

      // Step 2: Drop onto target unlocked tile
      const item = rt.relocating;
      const sz = item.size || 1;
      for (let dy = 0; dy < sz; dy++) {
        for (let dx = 0; dx < sz; dx++) {
          const cx = tx + dx, cy = ty + dy;
          if (!this.world.isTileUnlocked(cx, cy)) {
            this.toast('Solo puedes reubicar en islas desbloqueadas.', 'warn');
            return true;
          }
          const tVal = this.world.tiles[cy] && this.world.tiles[cy][cx];
          const okTile = item.placeOn === 'water' ? (tVal === 0) : (tVal === 1 || tVal === 2 || tVal === 5);
          if (!okTile) {
            this.toast('Terreno no válido para esta estructura.', 'warn');
            return true;
          }
          const occ = this.getBuildingAtTile(cx, cy);
          if (occ && occ !== item.ref) {
            this.toast('Esa casilla está ocupada por otro edificio.', 'warn');
            return true;
          }
        }
      }

      if (item.kind === 'building') {
        item.ref.tx = tx;
        item.ref.ty = ty;
        if (this.omega) this.omega._sig = null;
      } else {
        const node = item.ref;
        node.tx = tx;
        node.ty = ty;
        node.x = (tx + 0.5) * TILE_SIZE;
        node.y = (ty + 0.5) * TILE_SIZE;
        const gx = Math.floor(tx / PLOT_TILES);
        const gy = Math.floor(ty / PLOT_TILES);
        if (node.kind === 'dungeon_gate' && this.world.dungeonGatePlots && node.dungeonId) {
          this.world.dungeonGatePlots[node.dungeonId] = [gx, gy];
        }
        if (node.kind === 'altar_shrine' && this.world.altarPlots && node.altarId) {
          this.world.altarPlots[node.altarId] = [gx, gy];
        }
        this.world._nodeIndexLen = -1;
      }

      if (Abyssea.Audio) Abyssea.Audio.play('build');
      this.spawnParticles((tx + sz * 0.5) * TILE_SIZE, (ty + sz * 0.5) * TILE_SIZE, '#00e5ff', 22);
      this.toast(`¡${item.name} reubicado con éxito!`, 'success');
      rt.relocating = null;
      this.uiDirty = true;
      return true;
    };

    // --- #4 MARINE ENCOUNTERS: WHIRLPOOLS + COASTAL LEVIATHAN BOSS ---
    proto.getWhirlpoolNear = function (wx, wy, radius = 130) {
      if (!Array.isArray(this.worldWhirlpools)) return null;
      return this.worldWhirlpools.find(wp => dist(wx, wy, wp.x, wp.y) <= radius) || null;
    };

    proto.findUnlockedOceanTileNearShore = function () {
      const plots = this.unlockedPlots || [];
      if (!plots.length) return null;
      const gridT = (Abyssea.CONST.GRID_PLOTS || 19) * PLOT_TILES;
      for (let tries = 0; tries < 40; tries++) {
        const [gx, gy] = pick(plots);
        const tx = gx * PLOT_TILES + randInt(-2, PLOT_TILES + 1);
        const ty = gy * PLOT_TILES + randInt(-2, PLOT_TILES + 1);
        if (tx < 1 || ty < 1 || tx >= gridT - 1 || ty >= gridT - 1) continue;
        if (this.world.tiles[ty] && this.world.tiles[ty][tx] === 0) {
          // Ensure adjacent to unlocked land within 3 tiles so player can reach or cast into it
          let nearLand = false;
          for (let oy = -3; oy <= 3 && !nearLand; oy++) {
            for (let ox = -3; ox <= 3 && !nearLand; ox++) {
              const nx = tx + ox, ny = ty + oy;
              if (this.world.isTileUnlocked(nx, ny) && this.world.tiles[ny] && this.world.tiles[ny][nx] === 1) {
                nearLand = true;
              }
            }
          }
          if (nearLand) return { tx, ty, x: (tx + 0.5) * TILE_SIZE, y: (ty + 0.5) * TILE_SIZE };
        }
      }
      return null;
    };

    proto.spawnSeaBoss = function (forced = false) {
      const rt = this.ensureV2State();
      if (rt.seaBoss && rt.seaBoss.hp > 0) return false;
      const spot = this.findUnlockedOceanTileNearShore();
      if (!spot) return false;
      const lv = Math.max(1, (this.player && this.player.level) || 1);
      const hp = Math.round(620 + lv * 55);
      const tentHp = Math.round(hp * 0.25);
      const tentacles = [
        { ox: -78, oy: 24, hp: tentHp, maxHp: tentHp, atkCd: 2.2 },
        { ox: 78, oy: 24, hp: tentHp, maxHp: tentHp, atkCd: 2.8 },
        { ox: 0, oy: 66, hp: tentHp, maxHp: tentHp, atkCd: 3.3 }
      ];
      rt.seaBoss = {
        id: 'leviatan_marino',
        name: 'Leviatán Abisal de las Fosas',
        x: spot.x,
        y: spot.y,
        tx: spot.tx,
        ty: spot.ty,
        hp,
        maxHp: hp,
        dmg: Math.round(24 + lv * 2.1),
        ttl: 180,
        atkCd: 2.6,
        tentacles
      };
      if (Abyssea.Audio) Abyssea.Audio.play('portal');
      this.shake(0.45, 8);
      this.toast('¡ENCUENTRO MARINO! El Leviatán Abisal emerge en la costa. ¡Destruye sus tentáculos y véncelo!', 'warn');
      this.uiDirty = true;
      return true;
    };

    // --- A. INTERACTIVE DYNAMIC EVENTS (Ghost Ship, Raids, Abyssal Pulse, Biome Weather) ---
    proto.spawnGhostMerchantShip = function () {
      const rt = this.ensureV2State();
      const spot = this.findUnlockedOceanTileNearShore();
      if (!spot) return false;
      rt.ghostShip = {
        x: spot.x,
        y: spot.y,
        tx: spot.tx,
        ty: spot.ty,
        ttl: 155,
        stock: [
          { itemId: 'cebo_arcano', price: 75, qty: 4 },
          { itemId: 'cebo_volcanico', price: 65, qty: 4 },
          { itemId: 'catalizador_reforja', price: 320, qty: 2 },
          { itemId: 'pergamino_fortuna', price: 110, qty: 3 },
          { itemId: 'pet_cangrejo_coral', price: 420, qty: 1 }
        ]
      };
      if (Abyssea.Audio) Abyssea.Audio.play('portal');
      this.toast('¡El Barco Fantasma Mercante ha fondeado junto a tus costas por 2.5 min! Acércate y pulsa [E] para comerciar.', 'success');
      this.uiDirty = true;
      return true;
    };

    proto.startBiomeRaid = function (kind = null) {
      const rt = this.ensureV2State();
      if (rt.raid || this.activeDungeon || !(this.unlockedPlots && this.unlockedPlots.length)) return false;
      const raidKind = kind || pick(['marea_pirata', 'incursion_goblin']);
      const plot = pick(this.unlockedPlots);
      const px = (plot[0] * PLOT_TILES + 6) * TILE_SIZE;
      const py = (plot[1] * PLOT_TILES + 6) * TILE_SIZE;
      const enemyType = raidKind === 'marea_pirata' ? 'goblin_raider' : 'goblin';
      const total = 6;
      const spawned = [];
      for (let i = 0; i < total; i++) {
        const ang = (i / total) * Math.PI * 2;
        const ex = px + Math.cos(ang) * 90;
        const ey = py + Math.sin(ang) * 90;
        const mob = this.combat && typeof this.combat.spawnEnemy === 'function'
          ? this.combat.spawnEnemy(this, enemyType, ex, ey)
          : null;
        if (mob) {
          mob._isRaidMob = true;
          mob.name = raidKind === 'marea_pirata' ? 'Corsario Pirata' : 'Incursor Goblin';
          spawned.push(mob);
        }
      }
      if (!spawned.length) return false;
      rt.raid = {
        kind: raidKind,
        name: raidKind === 'marea_pirata' ? 'Marea Pirata' : 'Incursión Goblin',
        plot,
        x: px,
        y: py,
        mobs: spawned,
        total: spawned.length,
        ttl: 95
      };
      if (Abyssea.Audio) Abyssea.Audio.play('portal');
      this.toast(`¡INVASIÓN: ${rt.raid.name} en parcela (${plot[0]},${plot[1]})! Repele a los ${spawned.length} invasores antes de 95s por un cofre real.`, 'warn');
      this.uiDirty = true;
      return true;
    };

    proto.triggerBiomeWeatherEvent = function () {
      if (this.activeDungeon || !(this.unlockedPlots && this.unlockedPlots.length)) return false;
      const curBiome = this.world.getBiomeAtPixel(this.player.x, this.player.y);
      if (curBiome === 'montanas_heladas' || curBiome === 'glaciar_profundo' || curBiome === 'cavernas_cristal') {
        this.events.activeEvent = {
          id: 'ventisca_glacial',
          name: 'Ventisca Glacial',
          desc: 'Vientos helados duplican la aparición de cristales y cuarzo boreal en la isla.',
          timeLeft: 95, duration: 95, color: '#80ecff'
        };
        for (let i = 0; i < 4; i++) {
          const tx = Math.floor(this.player.x / TILE_SIZE) + randInt(-6, 6);
          const ty = Math.floor(this.player.y / TILE_SIZE) + randInt(-6, 6);
          if (this.world.isTileUnlocked(tx, ty) && this.world.tiles[ty]?.[tx] === 1 && !this.world.getNodeAtTile(tx, ty)) {
            this.world.spawnNodeAtTile(tx, ty, 'crystal', curBiome);
          }
        }
        this.toast('¡Evento de Bioma: Ventisca Glacial! Han brotado vetas de cristal extra a tu alrededor.', 'info');
        return true;
      }
      if (curBiome === 'tierras_volcanicas' || curBiome === 'caldera_ceniza') {
        this.events.activeEvent = {
          id: 'erupcion_caldera',
          name: 'Erupción de Caldera',
          desc: 'Nodos temporales de magma y escoria caen sobre las parcelas volcánicas.',
          timeLeft: 95, duration: 95, color: '#ff7043'
        };
        for (let i = 0; i < 4; i++) {
          const tx = Math.floor(this.player.x / TILE_SIZE) + randInt(-6, 6);
          const ty = Math.floor(this.player.y / TILE_SIZE) + randInt(-6, 6);
          if (this.world.isTileUnlocked(tx, ty) && this.world.tiles[ty]?.[tx] === 1 && !this.world.getNodeAtTile(tx, ty)) {
            this.world.spawnNodeAtTile(tx, ty, 'meteor', curBiome);
          }
        }
        this.shake(0.35, 6);
        this.toast('¡Evento de Bioma: Erupción de Caldera! Vetas volcánicas ricas han emergido cerca.', 'warn');
        return true;
      }
      return false;
    };

    // --- C. CONTEXTUAL SOFT ONBOARDING HINTS & PROGRESSION GUIDE ---
    proto.maybeShowV2Hint = function (hintId, text) {
      this.ensureV2State();
      if (this.seenV2Hints[hintId]) return;
      this.seenV2Hints[hintId] = true;
      this.toast(`[Guía] ${text}`, 'info');
    };

    proto.getProgressionGuideSteps = function () {
      const cleared = (this.clearedDungeons || []).length;
      const toolCount = Object.values(this.toolTiers || {}).filter(t => t && t !== 'basica').length;
      const hasEnchant = this.hasBuilding && this.hasBuilding('mesa_encantamientos');
      const hasReforge = this.hasBuilding && this.hasBuilding('mesa_reforja');
      const hasAquarium = this.hasBuilding && this.hasBuilding('portal_acuario');
      const hasTrophy = this.hasBuilding && this.hasBuilding('salon_trofeos');
      const hasBeacon = this.hasBuilding && this.hasBuilding('baliza_teletransporte');
      const hasNexus = this.hasBuilding && this.hasBuilding('nexo_central');
      return [
        { done: toolCount >= 2, label: '1. Forja y mejora tus herramientas a Cobre/Hierro en Mesa de Artesanía y Forja.' },
        { done: cleared >= 1, label: '2. Explora y vence tu primera Mazmorra para obtener Reliquias Permanentes y tu primera Mascota.' },
        { done: hasEnchant && hasReforge, label: '3. Construye Mesa de Encantamientos y Yunque de Reforja (R) para potenciar rarezas hasta Singular (0.1%).' },
        { done: hasAquarium || hasTrophy, label: '4. Abre el Portal al Acuario o el Salón de Trofeos para acumular bonos pasivos permanentes.' },
        { done: hasBeacon, label: '5. Coloca Balizas Rúnicas en islas lejanas para teletransportarte al instante desde el Mapa (M).' },
        { done: hasNexus, label: '6. Tras 20 Mazmorras, desbloquea la Industria Omega (Nexo Central) y el Abismo Infinito (45 Mazmorras).' }
      ];
    };

    // --- C2. GAMEPAD API POLLING ---
    proto.pollGamepad = function (dt) {
      if (typeof navigator === 'undefined' || typeof navigator.getGamepads !== 'function') return;
      const pads = navigator.getGamepads();
      if (!pads) return;
      let gp = null;
      for (let i = 0; i < pads.length; i++) {
        if (pads[i] && pads[i].connected) { gp = pads[i]; break; }
      }
      const rt = this.ensureV2State();
      if (!gp) {
        rt.gpConnected = false;
        this._gpMove = null;
        return;
      }
      if (!rt.gpConnected) {
        rt.gpConnected = true;
        this.toast(`Mando conectado: ${gp.id.slice(0, 36)}`, 'success');
      }

      const dead = 0.22;
      const lx = Math.abs(gp.axes[0] || 0) > dead ? gp.axes[0] : 0;
      const ly = Math.abs(gp.axes[1] || 0) > dead ? gp.axes[1] : 0;
      this._gpMove = (lx !== 0 || ly !== 0) ? { x: lx, y: ly } : null;

      // Right stick aim OR auto-aim nearest enemy/node
      const rx = Math.abs(gp.axes[2] || 0) > 0.25 ? gp.axes[2] : 0;
      const ry = Math.abs(gp.axes[3] || 0) > 0.25 ? gp.axes[3] : 0;
      if (rx !== 0 || ry !== 0) {
        this.mouse.wx = this.player.x + rx * 140;
        this.mouse.wy = this.player.y + ry * 140;
      } else if (lx !== 0 || ly !== 0) {
        // Soft auto-aim toward closest enemy within 260px
        const foes = this.activeDungeon
          ? [...this.activeDungeon.enemies, ...(this.activeDungeon.boss ? [this.activeDungeon.boss] : [])]
          : (this.combat ? this.combat.enemies : []);
        let near = null, nearD = 260;
        for (const e of foes) {
          if (!e || e._dead) continue;
          const d = dist(this.player.x, this.player.y, e.x, e.y);
          if (d < nearD) { nearD = d; near = e; }
        }
        if (near) {
          this.mouse.wx = near.x;
          this.mouse.wy = near.y;
        } else {
          this.mouse.wx = this.player.x + lx * 95;
          this.mouse.wy = this.player.y + ly * 95;
        }
      }

      const pressed = (idx) => Boolean(gp.buttons[idx] && gp.buttons[idx].pressed);
      const justPressed = (idx) => {
        const cur = pressed(idx);
        const prev = !!rt.gpPrevButtons[idx];
        rt.gpPrevButtons[idx] = cur;
        return cur && !prev;
      };

      // Continuous attack/use with A (0) or RT (7)
      if (!Abyssea.UI || !Abyssea.UI.hasOpenModal()) {
        if (pressed(0) || pressed(7)) {
          this.useActiveSlot(this.mouse.wx, this.mouse.wy);
        }
        if (justPressed(1) || justPressed(6)) this.triggerDash(); // B or LT
        if (justPressed(2)) this.interactNearby();                // X
        if (justPressed(3) && Abyssea.UI) Abyssea.UI.openModal('inventory'); // Y
        if (justPressed(4)) {                                     // LB
          this.activeSlot = (this.activeSlot + 8) % 9;
          this.uiDirty = true;
        }
        if (justPressed(5)) {                                     // RB
          this.activeSlot = (this.activeSlot + 1) % 9;
          this.uiDirty = true;
        }
        if (justPressed(12) && this.castSpellSlot) this.castSpellSlot(0); // D-Up
        if (justPressed(15) && this.castSpellSlot) this.castSpellSlot(1); // D-Right
        if (justPressed(13) && this.castSpellSlot) this.castSpellSlot(2); // D-Down
        if (justPressed(14) && this.castSpellSlot) this.castSpellSlot(3); // D-Left
      } else if (justPressed(1) && Abyssea.UI) {
        Abyssea.UI.closeModal();
      }
      if (justPressed(9) && Abyssea.UI) {                         // Start
        if (Abyssea.UI.hasOpenModal()) Abyssea.UI.closeModal();
        else Abyssea.UI.openModal('pause');
      }
      if (justPressed(8) && Abyssea.UI) {                         // Select -> Map
        if (Abyssea.UI.activeModal === 'map') Abyssea.UI.closeModal();
        else Abyssea.UI.openModal('map');
      }
    };

    // --- MAIN V2 UPDATE TICK (called from GameEngine.update) ---
    proto.updateV2Systems = function (dt) {
      const rt = this.ensureV2State();
      this.pollGamepad(dt);

      // Update Perfect Dodge timer
      if (this.player && (this.player.perfectDodgeWindow || 0) > 0) {
        this.player.perfectDodgeWindow = Math.max(0, this.player.perfectDodgeWindow - dt);
      }

      // Photo Mode free WASD camera panning
      if (this.photoMode) {
        const panSpd = 380 / Math.max(0.45, this.camera.zoom || 1);
        if (this.keys.KeyW || this.keys.ArrowUp) rt.photoCamOff.y -= panSpd * dt;
        if (this.keys.KeyS || this.keys.ArrowDown) rt.photoCamOff.y += panSpd * dt;
        if (this.keys.KeyA || this.keys.ArrowLeft) rt.photoCamOff.x -= panSpd * dt;
        if (this.keys.KeyD || this.keys.ArrowRight) rt.photoCamOff.x += panSpd * dt;
        this.camera.x = this.player.x + rt.photoCamOff.x;
        this.camera.y = this.player.y + rt.photoCamOff.y;
      } else if (rt.photoCamOff.x !== 0 || rt.photoCamOff.y !== 0) {
        rt.photoCamOff.x = 0;
        rt.photoCamOff.y = 0;
      }

      // Soft contextual onboarding hints when building key v1.4/v2.0 stations
      if (!this.activeDungeon && (this.buildings || []).length > 0) {
        for (const b of this.buildings) {
          if (b.type === 'mesa_reforja') this.maybeShowV2Hint('reforja', 'Construiste el Yunque de Reforja: pulsa [E] para mejorar rarezas (hasta Singular 0.1%) o activar Preservación de Rareza.');
          if (b.type === 'portal_acuario') this.maybeShowV2Hint('acuario', 'Construiste el Portal al Acuario: exhibe peces capturados para ganar pasivas permanentes y desbloquear mascotas marinas.');
          if (b.type === 'alquimia') this.maybeShowV2Hint('alquimia', 'El Laboratorio de Alquimia permite destilación multi-paso (mortero, solvente y temperatura) para pociones maestras.');
          if (b.type === 'salon_trofeos') this.maybeShowV2Hint('trofeos', 'En el Salón de Trofeos puedes exhibir reliquias de jefes y armas Singulares para potenciar toda la isla.');
          if (b.type === 'baliza_teletransporte') this.maybeShowV2Hint('baliza', '¡Baliza Rúnica activa! Abre el Mapa (M) o pulsa [E] en cualquier Baliza para viajar al instante entre islas.');
        }
      }

      // Auto-unlock pet milestones (first dungeon clear -> Limo Dorado; 3+ aquarium fish -> Cangrejo Coralino; 6+ -> Pez Linterna)
      if ((this.clearedDungeons || []).length >= 1 && !this.unlockedPets.includes('limo_dorado')) {
        this.unlockPet('limo_dorado', true);
      }
      const aqCount = Array.isArray(this.aquariumExhibits) ? this.aquariumExhibits.filter(Boolean).length : 0;
      if (aqCount >= 3 && !this.unlockedPets.includes('cangrejo_coral')) {
        this.unlockPet('cangrejo_coral', !this.activePet);
      }
      if (aqCount >= 6 && !this.unlockedPets.includes('pez_linterna')) {
        this.unlockPet('pez_linterna', false);
      }

      // Active Pet AI (follows Hana, collects drops, or fires projectiles)
      if (this.activePet && PET_DEFS[this.activePet] && this.player && !this.isPlayerDead()) {
        const pDef = PET_DEFS[this.activePet];
        const targetX = this.player.x - (this.player.facing || 1) * 42;
        const targetY = this.player.y + 14 + Math.sin(this.time * 4.5) * 6;
        const dP = dist(rt.petPos.x, rt.petPos.y, targetX, targetY);
        if (dP > 460) {
          rt.petPos.x = targetX;
          rt.petPos.y = targetY;
        } else {
          rt.petPos.x += (targetX - rt.petPos.x) * Math.min(1, dt * 6.5);
          rt.petPos.y += (targetY - rt.petPos.y) * Math.min(1, dt * 6.5);
        }

        // Collector Pets pull ground drops swiftly into player
        if (pDef.collectRadius && Array.isArray(this.drops)) {
          for (const d of this.drops) {
            const dd = dist(rt.petPos.x, rt.petPos.y, d.x, d.y);
            if (dd <= pDef.collectRadius && dd > 8) {
              const ang = Math.atan2(this.player.y - d.y, this.player.x - d.x);
              d.x += Math.cos(ang) * 280 * dt;
              d.y += Math.sin(ang) * 280 * dt;
            }
          }
        }

        // Combat Pets shoot homing projectiles
        if (pDef.attackRate) {
          rt.petAtkCd = Math.max(0, (rt.petAtkCd || 0) - dt);
          if (rt.petAtkCd <= 0) {
            const foes = this.activeDungeon
              ? [...(this.activeDungeon.enemies || []), ...(this.activeDungeon.boss ? [this.activeDungeon.boss] : [])]
              : (this.combat ? this.combat.enemies : []);
            let best = null, bestD = pDef.attackRange || 340;
            for (const e of foes) {
              if (!e || e._dead || e.hp <= 0) continue;
              const dd = dist(rt.petPos.x, rt.petPos.y, e.x, e.y);
              if (dd < bestD) { bestD = dd; best = e; }
            }
            if (best && typeof this.spawnPlayerProjectile === 'function') {
              rt.petAtkCd = pDef.attackRate;
              const ang = Math.atan2(best.y - rt.petPos.y, best.x - rt.petPos.x);
              const petDmg = Math.max(12, Math.round((16 + (this.player.level || 1) * 2.5) * (1 + (this.mods.dmgBonus || 0) * 0.45)));
              this.spawnPlayerProjectile(rt.petPos.x, rt.petPos.y, Math.cos(ang) * 410, Math.sin(ang) * 410, petDmg, pDef.projColor, false, {
                life: 1.15,
                homing: true,
                burnDmg: pDef.attackEffect === 'burn' ? 8 : 0,
                slowDur: pDef.attackEffect === 'slow' ? 2.5 : 0
              });
              this.spawnParticles(rt.petPos.x, rt.petPos.y, pDef.color, 4);
            }
          }
        }
      }

      // Volcanic Armor Set Dash Fire Trails
      if (this.player && this.player.dashTimer > 0 && this.mods && this.mods.synergyVolcanic) {
        if (Math.random() < 0.65) {
          rt.fireTrails.push({ x: this.player.x, y: this.player.y + 8, ttl: 2.2, tick: 0 });
        }
      }
      for (let i = rt.fireTrails.length - 1; i >= 0; i--) {
        const ft = rt.fireTrails[i];
        ft.ttl -= dt;
        ft.tick -= dt;
        if (ft.tick <= 0) {
          ft.tick = 0.45;
          const foes = this.activeDungeon
            ? [...(this.activeDungeon.enemies || []), ...(this.activeDungeon.boss ? [this.activeDungeon.boss] : [])]
            : (this.combat ? this.combat.enemies : []);
          for (const e of foes) {
            if (e && !e._dead && dist(ft.x, ft.y, e.x, e.y) <= 44) {
              this.combat.damageEnemy(this, e, Math.max(10, Math.round(18 + (this.player.level || 1) * 1.6)), 0, false, false);
              e.burnTimer = Math.max(e.burnTimer || 0, 2.5);
            }
          }
        }
        if (ft.ttl <= 0) rt.fireTrails.splice(i, 1);
      }

      // Dungeon Volcanic Floor Affix Hazard Tick
      if (this.activeDungeon && Array.isArray(this.activeDungeon.affixes) && this.activeDungeon.affixes.includes('suelo_volcanico')) {
        this.activeDungeon._volcanicAffixTimer = (this.activeDungeon._volcanicAffixTimer || 5.0) - dt;
        if (this.activeDungeon._volcanicAffixTimer <= 0) {
          this.activeDungeon._volcanicAffixTimer = 5.2;
          if (!Array.isArray(this.activeDungeon.hazardZones)) this.activeDungeon.hazardZones = [];
          this.activeDungeon.hazardZones.push({
            x: this.player.x,
            y: this.player.y,
            radius: 42,
            warn: 1.15,
            active: 0.45,
            dmg: Math.max(14, Math.round(18 + this.activeDungeon.tier * 2.5)),
            color: '#ff5722',
            kind: 'magma_ring'
          });
        }
      }

      // Overworld-only encounters (Whirlpools, Ghost Ship, Raids, Sea Boss, Abyssal Night Pulse)
      if (this.activeDungeon || this.activeAquarium) return;

      // Deep Fishing Whirlpools (max 2 active)
      rt.whirlpoolCd -= dt;
      if (rt.whirlpoolCd <= 0) {
        rt.whirlpoolCd = 42;
        if (this.worldWhirlpools.length < 2) {
          const spot = this.findUnlockedOceanTileNearShore();
          if (spot) {
            this.worldWhirlpools.push({ ...spot, ttl: 120 });
          }
        }
      }
      for (let i = this.worldWhirlpools.length - 1; i >= 0; i--) {
        this.worldWhirlpools[i].ttl -= dt;
        if (this.worldWhirlpools[i].ttl <= 0) this.worldWhirlpools.splice(i, 1);
      }

      // Ghost Merchant Ship lifecycle
      if (rt.ghostShip) {
        rt.ghostShip.ttl -= dt;
        if (rt.ghostShip.ttl <= 0) {
          rt.ghostShip = null;
          this.toast('El Barco Fantasma Mercante ha levado anclas hacia la niebla.', 'info');
          this.uiDirty = true;
        }
      } else {
        rt.ghostShipCd -= dt;
        if (rt.ghostShipCd <= 0) {
          rt.ghostShipCd = 280;
          if ((this.unlockedPlots || []).length >= 2) this.spawnGhostMerchantShip();
        }
      }

      // Active Biome Raid lifecycle
      if (rt.raid) {
        rt.raid.ttl -= dt;
        const alive = rt.raid.mobs.filter(m => m && !m._dead && m.hp > 0);
        if (alive.length === 0) {
          const rewardCoins = 180 + (this.player.level || 1) * 18;
          this.addCoins(rewardCoins);
          this.addItem('lingote_oro', 3);
          this.addItem('esencia_oscura', 2);
          this.addItem('ficha_gremio', 1);
          this.gainXp(180);
          if (Abyssea.Audio) Abyssea.Audio.play('levelup');
          this.toast(`¡Invasión "${rt.raid.name}" repelida! Botín: +${rewardCoins} oro, lingotes, esencias y +1 Ficha de Gremio.`, 'success');
          rt.raid = null;
          this.uiDirty = true;
        } else if (rt.raid.ttl <= 0) {
          this.toast(`Los invasores de "${rt.raid.name}" se retiraron al mar.`, 'info');
          rt.raid = null;
          this.uiDirty = true;
        }
      }

      // Sea Boss (Leviathan + 3 destructible tentacles) lifecycle
      if (rt.seaBoss) {
        const sb = rt.seaBoss;
        sb.ttl -= dt;
        sb.atkCd -= dt;
        const dPlayer = dist(this.player.x, this.player.y, sb.x, sb.y);
        if (sb.atkCd <= 0 && dPlayer <= 420) {
          sb.atkCd = 2.5;
          const ang = Math.atan2(this.player.y - sb.y, this.player.x - sb.x);
          for (const spread of [-0.22, 0, 0.22]) {
            this.enemyProjectiles.push({
              x: sb.x, y: sb.y,
              vx: Math.cos(ang + spread) * 235,
              vy: Math.sin(ang + spread) * 235,
              dmg: sb.dmg,
              life: 2.2,
              radius: 10,
              color: '#00e5ff',
              sprite: 'proj_ice'
            });
          }
        }
        if (sb.hp <= 0) {
          this.stats.seaBossesKilled = (this.stats.seaBossesKilled || 0) + 1;
          this.addCoins(420 + (this.player.level || 1) * 24);
          this.addItem('perla_leviatan', 1);
          this.addItem('ficha_gremio', 2);
          this.addItem(pick(['mantarraya_celestial', 'tiburon_cristal', 'leviatan_esmeralda']), 1);
          this.gainXp(320);
          if (Abyssea.Audio) Abyssea.Audio.play('levelup');
          this.spawnShockwave(sb.x, sb.y, 180, '#00e5ff');
          this.spawnParticles(sb.x, sb.y, '#80ffff', 34);
          this.toast('¡LEVIATÁN ABISAL DERROTADO! Has obtenido Perla del Leviatán, pez exótico y +2 Fichas de Gremio.', 'success');
          rt.seaBoss = null;
          this.uiDirty = true;
        } else if (sb.ttl <= 0) {
          this.toast('El Leviatán Abisal se ha sumergido de vuelta a las fosas.', 'info');
          rt.seaBoss = null;
          this.uiDirty = true;
        }
      } else {
        rt.seaBossCd -= dt;
        if (rt.seaBossCd <= 0) {
          rt.seaBossCd = 420;
          if ((this.unlockedPlots || []).length >= 3) this.spawnSeaBoss(false);
        }
      }

      // Nocturnal Abyssal Pulse wandering mini-boss (once per Blood Moon / Eclipse night)
      const phase = this.getDayPhase ? this.getDayPhase().phase : 'dia';
      const lunar = this.getLunarPhase();
      if (phase === 'noche' && (lunar.id === 'luna_sangre' || lunar.id === 'eclipse_astral')) {
        if (!rt.abyssPulseBoss && rt._lastPulseDay !== this.dayCount && (this.unlockedPlots || []).length >= 2) {
          rt._lastPulseDay = this.dayCount;
          const plot = pick(this.unlockedPlots);
          const bx = (plot[0] * PLOT_TILES + 6) * TILE_SIZE;
          const by = (plot[1] * PLOT_TILES + 6) * TILE_SIZE;
          const mb = this.combat && typeof this.combat.spawnEnemy === 'function'
            ? this.combat.spawnEnemy(this, 'shadow_wolf', bx, by)
            : null;
          if (mb) {
            mb.isMiniBoss = true;
            mb._isAbyssPulse = true;
            mb.name = 'Heraldo del Pulso Abisal';
            mb.hp = Math.round(mb.hp * 2.6);
            mb.maxHp = mb.hp;
            mb.coins = (mb.coins || 25) * 4;
            rt.abyssPulseBoss = mb;
            this.toast(`¡PULSO DEL ABISMO! Un Mini-Jefe Errante ha aparecido en (${plot[0]},${plot[1]}). Visible en el Mapa (M).`, 'warn');
          }
        }
      }
      if (rt.abyssPulseBoss && (rt.abyssPulseBoss._dead || rt.abyssPulseBoss.hp <= 0)) {
        this.addItem('esencia_lunar', 3);
        this.addItem('ficha_gremio', 1);
        this.toast('¡Heraldo del Pulso Abisal vencido! +3 Esencias Lunares y +1 Ficha de Gremio.', 'success');
        rt.abyssPulseBoss = null;
      }
    };

    // --- SEA BOSS DAMAGE HELPER (called from player attacks/projectiles) ---
    proto.tryDamageSeaBossAt = function (wx, wy, dmg, radius = 84) {
      const rt = this.v2Runtime;
      if (!rt || !rt.seaBoss || rt.seaBoss.hp <= 0) return false;
      const sb = rt.seaBoss;
      // Check destructible tentacles first
      for (const t of sb.tentacles) {
        if (t.hp <= 0) continue;
        const tx = sb.x + t.ox, ty = sb.y + t.oy;
        if (dist(wx, wy, tx, ty) <= radius) {
          t.hp = Math.max(0, t.hp - dmg);
          this.addFloatingText(tx, ty - 24, `-${dmg}`, '#80ffff');
          this.spawnParticles(tx, ty, '#26c6da', 8);
          if (Abyssea.Audio) Abyssea.Audio.play('hit');
          if (t.hp <= 0) {
            this.addFloatingText(tx, ty - 42, '¡Tentáculo destruido!', '#ffd54f');
            sb.hp = Math.max(1, sb.hp - Math.round(sb.maxHp * 0.12));
          }
          return true;
        }
      }
      // Direct hit on Leviathan head (takes 50% dmg while tentacles live, 100% when cleared)
      if (dist(wx, wy, sb.x, sb.y) <= radius + 34) {
        const aliveT = sb.tentacles.filter(t => t.hp > 0).length;
        const finalDmg = aliveT > 0 ? Math.max(1, Math.round(dmg * 0.55)) : dmg;
        sb.hp = Math.max(0, sb.hp - finalDmg);
        this.addFloatingText(sb.x, sb.y - 36, `-${finalDmg}`, '#ffd54f');
        this.spawnParticles(sb.x, sb.y, '#00e5ff', 10);
        if (Abyssea.Audio) Abyssea.Audio.play('crit');
        return true;
      }
      return false;
    };

    // --- INTERACT CHECK FOR V2 ENTITIES (Ghost Ship & Specialist Villagers) ---
    proto.tryInteractV2Nearby = function () {
      const rt = this.ensureV2State();
      if (this.activeDungeon || this.activeAquarium) return false;
      const px = this.player.x, py = this.player.y;

      // 1. Wandering Ghost Ship Merchant
      if (rt.ghostShip && dist(px, py, rt.ghostShip.x, rt.ghostShip.y) <= 135) {
        if (Abyssea.UI) Abyssea.UI.openModal('ghost_merchant');
        return true;
      }

      // 2. Specialist Villagers standing near built key buildings
      for (const spec of SPECIALIST_VILLAGERS) {
        const b = (this.buildings || []).find(x => x.type === spec.building);
        if (!b) continue;
        const bDef = Abyssea.BUILDINGS[b.type] || { size: 1 };
        const vx = (b.tx + bDef.size) * TILE_SIZE + 14;
        const vy = (b.ty + bDef.size * 0.5) * TILE_SIZE + 8;
        if (dist(px, py, vx, vy) <= 68) {
          if (Abyssea.UI) Abyssea.UI.openModal('specialist_villager', spec);
          return true;
        }
      }
      return false;
    };

    // --- WORLD RENDER LAYER FOR V2 ENTITIES (Pets, Specialist Villagers, Ghost Ship, Whirlpools, Sea Boss, Cosmetics, Relocator) ---
    proto.renderV2WorldEntities = function (ctx) {
      const rt = this.ensureV2State();
      const ex = (Abyssea.Assets && Abyssea.Assets.extraImages) || {};
      const fIdx = Math.floor(this.time * 5.5) % 4;

      const drawStrip4 = (img, x, y, drawW, drawH, flipX = false) => {
        if (!img || !img.complete || img.naturalWidth <= 0) return false;
        const fw = Math.round(img.naturalWidth / 4);
        const fh = img.naturalHeight;
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.translate(x, y);
        if (flipX) ctx.scale(-1, 1);
        ctx.drawImage(img, fIdx * fw, 0, fw, fh, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
        return true;
      };

      const drawWorldLabel = (text, x, y, fill = '#ffffff', fontSize = 11) => {
        ctx.save();
        ctx.font = `bold ${fontSize}px AbysseaPixel, monospace`;
        ctx.textAlign = 'center';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = 'rgba(8, 14, 24, 0.88)';
        ctx.strokeText(text, x, y);
        ctx.fillStyle = fill;
        ctx.fillText(text, x, y);
        ctx.restore();
      };

      // 1. Hana Cosmetic Aura (under player feet)
      if (this.player && !this.isPlayerDead() && this.hanaCosmetic && this.hanaCosmetic !== 'none') {
        const cos = HANA_COSMETICS.find(c => c.id === this.hanaCosmetic);
        if (cos) {
          ctx.save();
          const pulse = 0.72 + Math.sin(this.time * 4) * 0.18;
          ctx.strokeStyle = cos.color;
          ctx.globalAlpha = 0.55 * pulse;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.ellipse(this.player.x, this.player.y + 12, 22 + Math.sin(this.time * 3) * 3, 10, 0, 0, Math.PI * 2);
          ctx.stroke();
          for (let i = 0; i < 4; i++) {
            const a = this.time * 2.2 + i * (Math.PI / 2);
            const ox = this.player.x + Math.cos(a) * 24;
            const oy = this.player.y + Math.sin(a) * 12;
            ctx.fillStyle = cos.color;
            ctx.beginPath();
            ctx.arc(ox, oy, 2.8, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      }

      // 2. Volcanic Dash Fire Trails
      for (const ft of rt.fireTrails) {
        ctx.save();
        ctx.globalAlpha = Math.min(0.85, ft.ttl * 0.5);
        const g = ctx.createRadialGradient(ft.x, ft.y, 4, ft.x, ft.y, 28);
        g.addColorStop(0, '#fff59d');
        g.addColorStop(0.5, '#ff5722');
        g.addColorStop(1, 'rgba(255,87,34,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(ft.x, ft.y, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 3. Active Companion Pet
      if (this.activePet && PET_DEFS[this.activePet] && this.player && !this.isPlayerDead()) {
        const pDef = PET_DEFS[this.activePet];
        const img = ex[pDef.sprite];
        const px = rt.petPos.x, py = rt.petPos.y;
        // Luminary Pet light glow
        if (pDef.id === 'pez_linterna') {
          ctx.save();
          const lg = ctx.createRadialGradient(px, py, 8, px, py, 95);
          lg.addColorStop(0, 'rgba(128,255,255,0.34)');
          lg.addColorStop(1, 'rgba(128,255,255,0)');
          ctx.fillStyle = lg;
          ctx.beginPath();
          ctx.arc(px, py, 95, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        drawStrip4(img, px, py, 48, 48, (this.player.x < px));
      }

      if (this.activeDungeon || this.activeAquarium) return;

      // 4. Deep Fishing Whirlpools
      for (const wp of this.worldWhirlpools) {
        drawStrip4(ex.sea_whirlpool_4f, wp.x, wp.y, 76, 76, false);
        drawWorldLabel('Pesca Profunda', wp.x, wp.y - 42, '#e0ffff', 10);
      }

      // 5. Wandering Ghost Merchant Ship
      if (rt.ghostShip) {
        const gs = rt.ghostShip;
        // Subtle ocean reflection shadow beneath hull
        ctx.save();
        ctx.fillStyle = 'rgba(6, 26, 44, 0.30)';
        ctx.beginPath();
        ctx.ellipse(gs.x, gs.y + 52, 54, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        drawStrip4(ex.ship_mercader_fantasma_4f, gs.x, gs.y, 144, 144, false);
        drawWorldLabel(`Barco Fantasma (${Math.ceil(gs.ttl)}s) [E]`, gs.x, gs.y - 68, '#80ffff', 11);
      }

      // 6. Coastal Leviathan Sea Boss & Destructible Tentacles
      if (rt.seaBoss && rt.seaBoss.hp > 0) {
        const sb = rt.seaBoss;
        for (const t of sb.tentacles) {
          if (t.hp <= 0) continue;
          const tx = sb.x + t.ox, ty = sb.y + t.oy;
          drawStrip4(ex.kraken_tentacle_4f, tx, ty, 74, 74, t.ox > 0);
          ctx.fillStyle = 'rgba(0,0,0,0.68)';
          ctx.fillRect(tx - 24, ty - 42, 48, 6);
          ctx.fillStyle = '#26c6da';
          ctx.fillRect(tx - 23, ty - 41, 46 * (t.hp / Math.max(1, t.maxHp)), 4);
        }
        drawStrip4(ex.boss_leviatan_marino_4f, sb.x, sb.y, 152, 152, false);
        ctx.save();
        ctx.fillStyle = 'rgba(10,16,28,0.86)';
        ctx.fillRect(sb.x - 62, sb.y - 84, 124, 11);
        ctx.fillStyle = '#00e5ff';
        ctx.fillRect(sb.x - 60, sb.y - 82, 120 * (sb.hp / Math.max(1, sb.maxHp)), 7);
        ctx.restore();
        drawWorldLabel(`${sb.name} (${sb.hp}/${sb.maxHp})`, sb.x, sb.y - 91, '#ffd54f', 11);
      }

      // 7. Specialist Villagers idling near built key structures
      const npcSheets = (Abyssea.Assets && Abyssea.Assets.npcSheets) || {};
      for (const spec of SPECIALIST_VILLAGERS) {
        const b = (this.buildings || []).find(x => x.type === spec.building);
        if (!b) continue;
        const bDef = Abyssea.BUILDINGS[b.type] || { size: 1 };
        const vx = (b.tx + bDef.size) * TILE_SIZE + 14;
        const vy = (b.ty + bDef.size * 0.5) * TILE_SIZE + 8;
        const sh = npcSheets[spec.sheet];
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.34)';
        ctx.beginPath();
        ctx.ellipse(vx, vy + 18, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        if (sh && sh.complete && sh.naturalWidth > 0) {
          const fw = Math.round(sh.naturalWidth / 4);
          const fh = sh.naturalHeight;
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(sh, fIdx * fw, 0, fw, fh, vx - 22, vy - 26, 44, 48);
        }
        ctx.restore();
        if (dist(this.player.x, this.player.y, vx, vy) <= 95) {
          drawWorldLabel(`${spec.name} [E]`, vx, vy - 30, '#ffe082', 10);
        }
      }

      // 8. Structure Relocator Ghost Highlight
      if (rt.relocatorActive && this.mouse) {
        const tx = Math.floor((this.mouse.wx || 0) / TILE_SIZE);
        const ty = Math.floor((this.mouse.wy || 0) / TILE_SIZE);
        const sz = (rt.relocating && rt.relocating.size) || 1;
        ctx.save();
        ctx.strokeStyle = rt.relocating ? '#00e5ff' : '#ffd54f';
        ctx.fillStyle = rt.relocating ? 'rgba(0,229,255,0.22)' : 'rgba(255,213,79,0.18)';
        ctx.lineWidth = 3;
        ctx.fillRect(tx * TILE_SIZE, ty * TILE_SIZE, sz * TILE_SIZE, sz * TILE_SIZE);
        ctx.strokeRect(tx * TILE_SIZE, ty * TILE_SIZE, sz * TILE_SIZE, sz * TILE_SIZE);
        ctx.restore();
        drawWorldLabel(rt.relocating ? `Colocar: ${rt.relocating.name}` : 'Clic en estructura para trasladar', (tx + sz * 0.5) * TILE_SIZE, ty * TILE_SIZE - 8, '#ffffff', 10);
      }
    };
  }

  // ============================================================================
  // 3. ATTACH UI MODALS & ENHANCEMENTS TO UIManager.prototype
  // ============================================================================
  function attachUIManagerV2() {
    const UIManager = Abyssea.UIManager;
    if (!UIManager || UIManager.prototype._v2UiAttached) return;
    UIManager.prototype._v2UiAttached = true;

    const UI = UIManager.prototype;

    // --- H. TROPHY HALL / MUSEUM MODAL ---
    UI.renderTrophyHallModal = function (body) {
      const g = this.game;
      g.ensureV2State();
      const th = g.getTrophyHallBonuses();
      const allTrophyItems = ['trofeo_goblin', 'trofeo_faraon', 'trofeo_exanime', 'trofeo_dragon_fuego', 'huevo_dragon', 'reliquia_vacio', 'perla_leviatan'];

      body.appendChild(this.el('div', {
        style: 'background:linear-gradient(135deg,#24123a,#3d1852);border:2px solid #ffd54f;border-radius:8px;padding:12px;margin-bottom:12px;'
      }, [
        this.el('div', { style: 'font-size:18px;font-weight:bold;color:#ffd54f;' }, `Salón de Trofeos y Museo Real (${th.ranks} Vitrinas Activas)`),
        this.el('div', { style: 'font-size:13px;color:#e1bee7;margin-top:4px;' },
          `Jefes Conquistados: ${th.cleared}/75 · Reliquias Exhibidas: ${th.exhibited}/${allTrophyItems.length} · Equipo Singular (0.1%): ${th.singulars}`),
        this.el('div', { style: 'font-size:13px;color:#69f0ae;margin-top:6px;font-weight:bold;' },
          `Bono Global Pasivo: +${Math.round(th.dmgBonus * 100)}% Daño · +${Math.round(th.luckBonus * 100)}% Suerte · +${Math.round(th.xpBonus * 100)}% EXP · +${th.maxHp} Vida Máx`)
      ]));

      body.appendChild(this.el('h4', { style: 'color:#ffd54f;margin:8px 0;' }, 'Vitrinas de Trofeos de Jefes y Reliquias'));
      const grid = this.el('div', { class: 'grid-cards', style: 'margin-bottom:12px;' });
      for (const tid of allTrophyItems) {
        const it = Abyssea.ITEMS[tid];
        if (!it) continue;
        const exhibited = g.trophyExhibits.includes(tid);
        const owned = (g.inventory[tid] || 0) > 0;
        grid.appendChild(this.el('div', {
          class: 'card',
          style: `border-color:${exhibited ? '#ffd54f' : '#455a64'};opacity:${exhibited || owned ? 1 : 0.65};`
        }, [
          this.el('div', { class: 'card-head' }, [
            this.itemIcon(it.icon, 32),
            this.el('div', {}, [
              this.el('strong', { style: `color:${exhibited ? '#ffd54f' : '#e0e0e0'};` }, it.name),
              this.el('div', { style: 'font-size:12px;color:#90caf9;' }, exhibited ? 'EXHIBIDO (+3% Global)' : (owned ? 'En inventario' : 'Sin obtener'))
            ])
          ]),
          !exhibited && owned ? this.el('button', {
            class: 'btn btn-gold btn-sm',
            onclick: () => {
              g.removeItem(tid, 1);
              g.trophyExhibits.push(tid);
              g.recomputeModifiers();
              if (Abyssea.Audio) Abyssea.Audio.play('levelup');
              g.toast(`¡${it.name} consagrado en el Salón de Trofeos! +3% bono global.`, 'success');
              this.renderModal();
            }
          }, 'Exhibir en Vitrina') : null
        ]));
      }
      body.appendChild(grid);

      // Boss conquest plaque strip (75 bosses)
      body.appendChild(this.el('h4', { style: 'color:#80deea;margin:8px 0;' }, `Placas de Conquista de Mazmorras (${th.cleared}/75 — cada 5 suma 1 rango de Museo)`));
      const clearedSet = new Set(g.clearedDungeons || []);
      const plaqueWrap = this.el('div', { style: 'display:flex;flex-wrap:wrap;gap:6px;max-height:190px;overflow-y:auto;' });
      Object.values(Abyssea.DUNGEON_DEFS || {}).forEach(d => {
        const ok = clearedSet.has(d.id);
        plaqueWrap.appendChild(this.el('span', {
          style: `padding:4px 8px;border-radius:4px;font-size:12px;border:1px solid ${ok ? '#ffd54f' : '#37474f'};background:${ok ? 'rgba(255,213,79,0.16)' : 'rgba(18,24,34,0.6)'};color:${ok ? '#fff59d' : '#78909c'};`
        }, `${ok ? '[OK] ' : ''}${d.name}`));
      });
      body.appendChild(plaqueWrap);
    };

    // --- #5 TELEPORT BEACON NETWORK MODAL ---
    UI.renderTeleportBeaconModal = function (body, currentB) {
      const g = this.game;
      const beacons = (g.buildings || []).filter(x => x.type === 'baliza_teletransporte');
      body.appendChild(this.el('div', { class: 'parchment-box', style: 'margin-bottom:10px;' }, [
        this.el('strong', { style: 'color:#00e5ff;' }, `Red de Balizas Rúnicas (${beacons.length} activas)`),
        this.el('div', { style: 'font-size:13px;color:#cfd8dc;margin-top:4px;' },
          'Teletranspórtate al instante hacia cualquier otra Baliza construida en el archipiélago o desde el Mapa Mundial (M).')
      ]));
      const list = this.el('div', { style: 'display:flex;flex-direction:column;gap:8px;' });
      beacons.forEach((bk, idx) => {
        const bId = g.world.getBiomeAtPixel((bk.tx + 0.5) * TILE_SIZE, (bk.ty + 0.5) * TILE_SIZE);
        const bm = (BIOMES && BIOMES[bId]) || { name: bId };
        const gx = Math.floor(bk.tx / PLOT_TILES), gy = Math.floor(bk.ty / PLOT_TILES);
        const isHere = bk === currentB;
        list.appendChild(this.el('button', {
          class: isHere ? 'btn btn-stone btn-sm' : 'btn btn-primary btn-sm',
          disabled: isHere ? 'disabled' : null,
          onclick: () => {
            g.player.x = (bk.tx + 0.5) * TILE_SIZE;
            g.player.y = (bk.ty + 1.1) * TILE_SIZE;
            g.camera.x = g.player.x;
            g.camera.y = g.player.y;
            if (Abyssea.Audio) Abyssea.Audio.play('portal');
            g.spawnParticles(g.player.x, g.player.y, '#00e5ff', 22);
            g.toast(`Viaje rápido completado hacia Baliza #${idx + 1} (${bm.name}).`, 'success');
            this.closeModal();
          }
        }, isHere ? `Baliza #${idx + 1} — ${bm.name} (${gx},${gy}) [Ubicación actual]` : `Viajar a Baliza #${idx + 1} — ${bm.name} (${gx},${gy})`));
      });
      body.appendChild(list);
    };

    // --- A3. GHOST MERCHANT SHIP MODAL ---
    UI.renderGhostMerchantModal = function (body) {
      const g = this.game;
      const rt = g.ensureV2State();
      const gs = rt.ghostShip;
      if (!gs) {
        body.appendChild(this.el('div', { class: 'card' }, 'El Barco Fantasma ya ha zarpado.'));
        return;
      }
      body.appendChild(this.el('div', {
        style: 'background:linear-gradient(135deg,#0c2233,#133b4a);border:2px solid #00e5ff;border-radius:8px;padding:12px;margin-bottom:12px;'
      }, [
        this.el('strong', { style: 'color:#80ffff;font-size:17px;' }, `Barco Fantasma Mercante — Zarpa en ${Math.ceil(gs.ttl)}s`),
        this.el('div', { style: 'font-size:13px;color:#cfd8dc;margin-top:4px;' },
          'Compra cebos exóticos, catalizadores de reforja y sellos de mascotas, o vende tus peces raros y Perlas del Leviatán al doble de precio (2x).')
      ]));

      body.appendChild(this.el('h4', { style: 'color:#ffd54f;margin:6px 0;' }, 'Mercancía Espectral en Venta'));
      const buyGrid = this.el('div', { class: 'grid-cards', style: 'margin-bottom:12px;' });
      gs.stock.forEach((offer) => {
        const it = Abyssea.ITEMS[offer.itemId];
        if (!it) return;
        const canBuy = offer.qty > 0 && g.coins >= offer.price;
        buyGrid.appendChild(this.el('div', { class: 'card' }, [
          this.el('div', { class: 'card-head' }, [
            this.itemIcon(it.icon, 30),
            this.el('div', {}, [
              this.el('strong', { style: 'color:#ffe082;' }, it.name),
              this.el('div', { style: 'font-size:12px;color:#b0bec5;' }, `Stock: ${offer.qty} · ${offer.price} oro`)
            ])
          ]),
          this.el('button', {
            class: canBuy ? 'btn btn-gold btn-sm' : 'btn btn-stone btn-sm',
            disabled: canBuy ? null : 'disabled',
            onclick: () => {
              if (offer.qty <= 0 || g.coins < offer.price) return;
              g.coins -= offer.price;
              offer.qty--;
              g.addItem(offer.itemId, 1);
              if (Abyssea.Audio) Abyssea.Audio.play('coin');
              this.renderModal();
            }
          }, offer.qty > 0 ? `Comprar (${offer.price} oro)` : 'Agotado')
        ]));
      });
      body.appendChild(buyGrid);

      body.appendChild(this.el('h4', { style: 'color:#69f0ae;margin:6px 0;' }, 'Venta Premium al Barco (Pago x2.0)'));
      const sellKeys = Object.keys(g.inventory || {}).filter(id =>
        (g.inventory[id] || 0) > 0 &&
        (id === 'perla_leviatan' || id === 'perla' || id === 'reliquia_vacio' || (Abyssea.AQUARIUM_FISH_PASSIVES && Abyssea.AQUARIUM_FISH_PASSIVES[id]))
      );
      if (!sellKeys.length) {
        body.appendChild(this.el('div', { class: 'card', style: 'color:#90a4ae;' }, 'No llevas peces ni reliquias marinas para vender al doble.'));
      } else {
        const sellGrid = this.el('div', { class: 'grid-cards' });
        sellKeys.forEach((id) => {
          const it = Abyssea.ITEMS[id];
          if (!it) return;
          const cnt = g.inventory[id] || 0;
          const unit = Math.max(10, Math.round((it.sellValue || 20) * 2.0));
          sellGrid.appendChild(this.el('div', { class: 'card' }, [
            this.el('div', { class: 'card-head' }, [
              this.itemIcon(it.icon, 28),
              this.el('div', {}, [
                this.el('strong', {}, `${it.name} (x${cnt})`),
                this.el('div', { style: 'font-size:12px;color:#69f0ae;' }, `${unit} oro c/u (2x)`)
              ])
            ]),
            this.el('button', {
              class: 'btn btn-green btn-sm',
              onclick: () => {
                g.removeItem(id, 1);
                g.addCoins(unit);
                if (Abyssea.Audio) Abyssea.Audio.play('coin');
                this.renderModal();
              }
            }, `Vender 1 (+${unit} oro)`)
          ]));
        });
        body.appendChild(sellGrid);
      }
    };

    // --- B2. SPECIALIST VILLAGER MODAL ---
    UI.renderSpecialistVillagerModal = function (body, spec) {
      const g = this.game;
      const rt = g.ensureV2State();
      if (!spec) return;
      const doneToday = rt.villagerContractDay[spec.id] === g.dayCount;
      const c = spec.contract;
      const cItem = Abyssea.ITEMS[c.item];
      const have = g.inventory[c.item] || 0;

      body.appendChild(this.el('div', { class: 'parchment-box', style: 'margin-bottom:12px;' }, [
        this.el('strong', { style: 'color:#ffd54f;font-size:17px;' }, `${spec.name} — ${spec.role}`),
        this.el('div', { style: 'font-size:14px;color:#eceff1;font-style:italic;margin-top:6px;' }, `"${spec.greeting}"`)
      ]));

      body.appendChild(this.el('div', { class: 'card' }, [
        this.el('strong', { style: 'color:#80deea;' }, 'Encargo Rápido Diario'),
        this.el('div', { style: 'font-size:13px;color:#dce8f5;margin:6px 0;' },
          `Entrega ${c.qty}x ${cItem ? cItem.name : c.item} (Tienes: ${have}) -> Recibe +${c.rewardCoins} oro y +${c.rewardTokens} Ficha de Gremio.`),
        doneToday
          ? this.el('div', { style: 'color:#69f0ae;font-weight:bold;' }, 'Encargo completado hoy. Vuelve mañana.')
          : this.el('button', {
              class: have >= c.qty ? 'btn btn-gold btn-sm' : 'btn btn-stone btn-sm',
              disabled: have >= c.qty ? null : 'disabled',
              onclick: () => {
                if ((g.inventory[c.item] || 0) < c.qty) return;
                g.removeItem(c.item, c.qty);
                g.addCoins(c.rewardCoins);
                g.addItem('ficha_gremio', c.rewardTokens);
                rt.villagerContractDay[spec.id] = g.dayCount;
                if (Abyssea.Audio) Abyssea.Audio.play('levelup');
                g.toast(`¡Encargo de ${spec.name} completado! +${c.rewardCoins} oro y +${c.rewardTokens} Ficha de Gremio.`, 'success');
                this.renderModal();
              }
            }, `Entregar ${c.qty}x ${cItem ? cItem.name : c.item}`)
      ]));
    };

    // --- B1. PETS & SYNERGIES SECTION (embedded in Inventory modal) ---
    UI.renderV2PetsAndSynergiesBar = function (body) {
      const g = this.game;
      g.ensureV2State();
      const syns = g.getActiveSetSynergies();

      const wrap = this.el('div', {
        style: 'background:rgba(14,22,34,0.88);border:1px solid rgba(0,229,255,0.28);border-radius:8px;padding:10px 12px;margin-top:10px;'
      });

      const head = this.el('div', { style: 'display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:8px;' }, [
        this.el('strong', { style: 'color:#00e5ff;font-size:14px;' }, `Compañeros / Mascotas (${g.unlockedPets.length}/${Object.keys(PET_DEFS).length})`),
        g.activePet ? this.el('button', {
          class: 'btn btn-stone btn-sm',
          onclick: () => { g.setActivePet(null); this.renderModal(); }
        }, 'Descansar Mascota') : null
      ]);
      wrap.appendChild(head);

      const petRow = this.el('div', { style: 'display:flex;gap:8px;flex-wrap:wrap;' });
      Object.values(PET_DEFS).forEach(p => {
        const unlocked = g.unlockedPets.includes(p.id);
        const active = g.activePet === p.id;
        petRow.appendChild(this.el('button', {
          class: `btn btn-sm ${active ? 'btn-gold' : unlocked ? 'btn-primary' : 'btn-stone'}`,
          style: `display:flex;align-items:center;gap:6px;opacity:${unlocked ? 1 : 0.45};`,
          title: p.desc,
          onclick: () => {
            if (!unlocked) {
              g.toast(`Mascota bloqueada: ${p.name}. Fabrica su Sello o alcanza hitos de Mazmorras/Acuario.`, 'info');
              return;
            }
            g.setActivePet(active ? null : p.id);
            this.renderModal();
          }
        }, [
          this.itemIcon(p.icon, 20),
          this.el('span', {}, active ? `${p.name} [ACTIVA]` : unlocked ? p.name : `${p.name} (Bloq.)`)
        ]));
      });
      wrap.appendChild(petRow);

      if (syns.length > 0) {
        const synRow = this.el('div', { style: 'margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.1);' });
        syns.forEach(s => {
          synRow.appendChild(this.el('div', { style: `font-size:12px;color:${s.color};margin-top:2px;` }, `[SET ACTIVO] ${s.name}: ${s.desc}`));
        });
        wrap.appendChild(synRow);
      }

      body.appendChild(wrap);
    };

    // --- #6 GUILD SHOP & WEEKLY CHALLENGES TAB (in Quests modal) ---
    UI.renderGuildShopTab = function (body) {
      const g = this.game;
      g.ensureV2State();
      const tokens = g.inventory.ficha_gremio || 0;

      body.appendChild(this.el('div', {
        style: 'background:linear-gradient(135deg,#1d263b,#2c3e50);border:2px solid #ffd54f;border-radius:8px;padding:12px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;'
      }, [
        this.el('div', {}, [
          this.el('strong', { style: 'color:#ffd54f;font-size:17px;' }, 'Desafíos Semanales y Tienda del Gremio'),
          this.el('div', { style: 'font-size:12px;color:#cfd8dc;' }, 'Completa encargos de gran escala para ganar Fichas de Gremio y canjear cosméticos o Catalizadores de Reforja.')
        ]),
        this.el('div', { style: 'display:flex;align-items:center;gap:6px;background:rgba(0,0,0,0.45);border:1px solid #ffd54f;border-radius:6px;padding:6px 12px;' }, [
          this.itemIcon('ficha_gremio', 22),
          this.el('strong', { style: 'color:#ffe082;font-size:15px;' }, `${tokens} Fichas`)
        ])
      ]));

      // Weekly Challenges
      body.appendChild(this.el('h4', { style: 'color:#80deea;margin:6px 0;' }, 'Contratos Semanales de Gremio'));
      const cGrid = this.el('div', { class: 'grid-cards', style: 'margin-bottom:12px;' });
      WEEKLY_GUILD_CHALLENGES.forEach(wk => {
        const claimed = g.claimedWeeklyChallenges.includes(wk.id);
        const cur = Math.min(wk.target, Math.floor(wk.progress(g)));
        const ready = !claimed && cur >= wk.target;
        cGrid.appendChild(this.el('div', {
          class: 'card',
          style: `border-color:${ready ? '#69f0ae' : claimed ? '#546e7a' : '#ffd54f'};`
        }, [
          this.el('strong', { style: 'color:#ffe082;' }, wk.title),
          this.el('div', { style: 'font-size:12px;color:#cfd8dc;margin:4px 0;' }, wk.desc),
          this.el('div', { style: 'font-size:12px;color:#80deea;' }, `Progreso: ${cur}/${wk.target} · Premio: +${wk.rewardTokens} Fichas, +${wk.rewardCoins} oro`),
          claimed
            ? this.el('span', { style: 'color:#69f0ae;font-size:12px;font-weight:bold;margin-top:4px;display:inline-block;' }, 'Reclamado')
            : this.el('button', {
                class: ready ? 'btn btn-green btn-sm' : 'btn btn-stone btn-sm',
                disabled: ready ? null : 'disabled',
                style: 'margin-top:6px;',
                onclick: () => {
                  if (!ready) return;
                  g.claimedWeeklyChallenges.push(wk.id);
                  g.addCoins(wk.rewardCoins);
                  g.gainXp(wk.rewardXp);
                  g.addItem('ficha_gremio', wk.rewardTokens);
                  if (Abyssea.Audio) Abyssea.Audio.play('levelup');
                  g.toast(`¡Desafío "${wk.title}" completado! +${wk.rewardTokens} Fichas de Gremio.`, 'success');
                  this.renderModal();
                }
              }, ready ? 'Reclamar Recompensa' : 'En Progreso')
        ]));
      });
      body.appendChild(cGrid);

      // Token Rewards Shop
      body.appendChild(this.el('h4', { style: 'color:#ffd54f;margin:6px 0;' }, 'Tienda Exclusiva del Gremio'));
      const shopGrid = this.el('div', { class: 'grid-cards' });
      const shopItems = [
        { id: 'catalizador_reforja', qty: 1, cost: 2 },
        { id: 'cetro_traslado', qty: 1, cost: 3 },
        { id: 'pet_limo_dorado', qty: 1, cost: 3 },
        { id: 'cebo_arcano', qty: 3, cost: 1 }
      ];
      shopItems.forEach(s => {
        const it = Abyssea.ITEMS[s.id];
        if (!it) return;
        const ok = tokens >= s.cost;
        shopGrid.appendChild(this.el('div', { class: 'card' }, [
          this.el('div', { class: 'card-head' }, [
            this.itemIcon(it.icon, 28),
            this.el('div', {}, [
              this.el('strong', {}, `${it.name} x${s.qty}`),
              this.el('div', { style: 'font-size:12px;color:#ffd54f;' }, `Costo: ${s.cost} Fichas`)
            ])
          ]),
          this.el('button', {
            class: ok ? 'btn btn-gold btn-sm' : 'btn btn-stone btn-sm',
            disabled: ok ? null : 'disabled',
            onclick: () => {
              if ((g.inventory.ficha_gremio || 0) < s.cost) return;
              g.removeItem('ficha_gremio', s.cost);
              g.addItem(s.id, s.qty);
              if (Abyssea.Audio) Abyssea.Audio.play('coin');
              this.renderModal();
            }
          }, `Canjear (${s.cost} Fichas)`)
        ]));
      });

      // Cosmetics for Hana
      HANA_COSMETICS.forEach(cos => {
        const equipped = g.hanaCosmetic === cos.id;
        const unlocked = cos.costTokens === 0 || (g.unlockedCosmetics && g.unlockedCosmetics.includes(cos.id));
        shopGrid.appendChild(this.el('div', { class: 'card', style: `border-color:${cos.color};` }, [
          this.el('strong', { style: `color:${cos.color};` }, `Cosmético: ${cos.name}`),
          this.el('div', { style: 'font-size:12px;color:#cfd8dc;margin:4px 0;' }, cos.desc),
          unlocked
            ? this.el('button', {
                class: equipped ? 'btn btn-green btn-sm' : 'btn btn-primary btn-sm',
                onclick: () => { g.hanaCosmetic = cos.id; this.renderModal(); }
              }, equipped ? 'Equipado' : 'Equipar Aura')
            : this.el('button', {
                class: tokens >= cos.costTokens ? 'btn btn-gold btn-sm' : 'btn btn-stone btn-sm',
                disabled: tokens >= cos.costTokens ? null : 'disabled',
                onclick: () => {
                  if ((g.inventory.ficha_gremio || 0) < cos.costTokens) return;
                  g.removeItem('ficha_gremio', cos.costTokens);
                  if (!Array.isArray(g.unlockedCosmetics)) g.unlockedCosmetics = [];
                  g.unlockedCosmetics.push(cos.id);
                  g.hanaCosmetic = cos.id;
                  if (Abyssea.Audio) Abyssea.Audio.play('levelup');
                  g.toast(`¡Aura cosmética desbloqueada: ${cos.name}!`, 'success');
                  this.renderModal();
                }
              }, `Desbloquear (${cos.costTokens} Fichas)`)
        ]));
      });
      body.appendChild(shopGrid);
    };

    // --- #7 ENHANCED PHOTO MODE FLOATING TOOLBAR ---
    UI.syncPhotoModeToolbar = function () {
      const g = this.game;
      if (typeof document === 'undefined') return;
      let bar = document.getElementById('photo-mode-toolbar');
      if (!g.photoMode) {
        if (bar) bar.remove();
        return;
      }
      if (!bar) {
        bar = document.createElement('div');
        bar.id = 'photo-mode-toolbar';
        bar.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;gap:8px;align-items:center;background:rgba(10,16,28,0.88);border:1.5px solid #00e5ff;border-radius:10px;padding:8px 14px;box-shadow:0 8px 28px rgba(0,0,0,0.65);font-family:inherit;color:#e0f7fa;';
        const mkBtn = (lbl, cls, fn) => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'btn btn-sm ' + cls;
          b.textContent = lbl;
          b.onclick = fn;
          return b;
        };
        const info = document.createElement('span');
        info.style.cssText = 'font-size:12px;color:#80deea;margin-right:4px;';
        info.textContent = 'Modo Foto (WASD mover cámara · Rueda zoom)';
        bar.appendChild(info);
        bar.appendChild(mkBtn('Capturar PNG', 'btn-gold', () => {
          bar.style.display = 'none';
          requestAnimationFrame(() => {
            try {
              const url = g.canvas.toDataURL('image/png');
              const a = document.createElement('a');
              a.href = url;
              a.download = `abyssea_foto_${Date.now()}.png`;
              a.click();
              g.toast('Captura guardada en PNG.', 'success');
            } catch (_) {
              g.toast('Captura completada.', 'info');
            }
            setTimeout(() => { bar.style.display = 'flex'; }, 120);
          });
        }));
        bar.appendChild(mkBtn('Zoom +', 'btn-primary', () => { g.camera.zoom = clamp((g.camera.zoom || 1) + 0.15, 0.55, 2.2); }));
        bar.appendChild(mkBtn('Zoom -', 'btn-primary', () => { g.camera.zoom = clamp((g.camera.zoom || 1) - 0.15, 0.55, 2.2); }));
        bar.appendChild(mkBtn('Centrar', 'btn-stone', () => { const rt = g.ensureV2State(); rt.photoCamOff.x = 0; rt.photoCamOff.y = 0; }));
        bar.appendChild(mkBtn('Salir (F9)', 'btn-danger', () => { this.togglePhotoMode(); }));
        document.body.appendChild(bar);
      }
    };
  }

  attachGameEngineV2();
  attachUIManagerV2();
})();
