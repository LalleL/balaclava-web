(function () {
  'use strict';

  const Abyssea = (window.Abyssea = window.Abyssea || {});
  const { TILE_SIZE } = Abyssea.CONST || { TILE_SIZE: 48 };

  Abyssea.VERSION = '2.0.0-rc2';
  Abyssea.VERSION_LABEL = 'Beta 2.0.0 Release Candidate 2';

  // Preload authentic native pixel-art sprites from assets/sprites_extra/ for the animated station scenes
  const V14_SPRITES = {};
  function preloadNativePixelSprites() {
    if (typeof Image === 'undefined') return;
    const root = window.ABYSSEA_ROOT_BASE || '';
    const map = {
      alchemyTable: root + 'assets/icons_tiers_v14/buildings/station_alchemy.png',
      sorceryTable: root + 'assets/icons_tiers_v14/buildings/bld_mesa_hechiceria.png',
      brazier:      root + 'assets/icons_tiers_v14/buildings/fire_brazier.png',
      bookshelf:    root + 'assets/icons_tiers_v14/buildings/prop_bookshelf.png',
      runeCircle:   root + 'assets/sprites_extra/rune_circle.png',
      runePillar:   root + 'assets/sprites_extra/rune_pillar.png'
    };
    for (const [k, src] of Object.entries(map)) {
      const img = new Image();
      img.src = src;
      V14_SPRITES[k] = img;
    }
  }
  preloadNativePixelSprites();
  Abyssea.V14_SPRITES = V14_SPRITES;

  // ============================================================================
  // 1. GEAR RARITY & REFORGE SYSTEM (7 Tiers: Comun -> Singular 0.1%)
  // ============================================================================
  const GEAR_RARITIES = {
    comun: {
      id: 'comun',
      name: 'Común',
      nameEn: 'Common',
      chance: 0.50,
      chanceLabel: '50%',
      color: '#cfd8dc',
      bg: 'rgba(144, 164, 174, 0.18)',
      border: '#90a4ae',
      powerMult: 1.00,
      dmgMult: 1.00,
      speedMult: 1.00,
      critBonus: 0.00,
      luckBonus: 0.00,
      energySave: 0.00,
      defMult: 1.00,
      desc: 'Calidad estándar de herrería (+0% bonificación).'
    },
    no_comun: {
      id: 'no_comun',
      name: 'No Común',
      nameEn: 'Uncommon',
      chance: 0.25,
      chanceLabel: '25%',
      color: '#81c784',
      bg: 'rgba(102, 187, 106, 0.20)',
      border: '#66bb6a',
      powerMult: 1.12,
      dmgMult: 1.12,
      speedMult: 1.06,
      critBonus: 0.03,
      luckBonus: 0.04,
      energySave: 0.03,
      defMult: 1.08,
      desc: '+12% Daño/Poder | +6% Velocidad | +4% Suerte | +3% Crítico'
    },
    raro: {
      id: 'raro',
      name: 'Raro',
      nameEn: 'Rare',
      chance: 0.14,
      chanceLabel: '14%',
      color: '#4fc3f7',
      bg: 'rgba(41, 182, 246, 0.22)',
      border: '#29b6f6',
      powerMult: 1.25,
      dmgMult: 1.25,
      speedMult: 1.12,
      critBonus: 0.06,
      luckBonus: 0.08,
      energySave: 0.06,
      defMult: 1.16,
      desc: '+25% Daño/Poder | +12% Velocidad | +8% Suerte | +6% Crítico | -6% Energía'
    },
    epico: {
      id: 'epico',
      name: 'Épico',
      nameEn: 'Epic',
      chance: 0.069,
      chanceLabel: '6.9%',
      color: '#ce93d8',
      bg: 'rgba(171, 71, 188, 0.24)',
      border: '#ab47bc',
      powerMult: 1.45,
      dmgMult: 1.45,
      speedMult: 1.18,
      critBonus: 0.10,
      luckBonus: 0.14,
      energySave: 0.12,
      defMult: 1.28,
      desc: '+45% Daño/Poder | +18% Velocidad | +14% Suerte | +10% Crítico | -12% Energía'
    },
    legendario: {
      id: 'legendario',
      name: 'Legendario',
      nameEn: 'Legendary',
      chance: 0.03,
      chanceLabel: '3.0%',
      color: '#ffd54f',
      bg: 'rgba(255, 193, 7, 0.24)',
      border: '#ffc107',
      powerMult: 1.70,
      dmgMult: 1.70,
      speedMult: 1.26,
      critBonus: 0.16,
      luckBonus: 0.22,
      energySave: 0.18,
      defMult: 1.42,
      desc: '+70% Daño/Poder | +26% Velocidad | +22% Suerte | +16% Crítico | -18% Energía'
    },
    mitico: {
      id: 'mitico',
      name: 'Mítico',
      nameEn: 'Mythic',
      chance: 0.01,
      chanceLabel: '1.0%',
      color: '#ff5252',
      bg: 'rgba(244, 67, 54, 0.26)',
      border: '#ff1744',
      powerMult: 2.05,
      dmgMult: 2.05,
      speedMult: 1.36,
      critBonus: 0.24,
      luckBonus: 0.32,
      energySave: 0.25,
      defMult: 1.65,
      desc: '+105% Daño/Poder | +36% Velocidad | +32% Suerte | +24% Crítico | -25% Energía'
    },
    singular: {
      id: 'singular',
      name: 'Singular',
      nameEn: 'Singular',
      chance: 0.001,
      chanceLabel: '0.1%',
      color: '#00e5ff',
      bg: 'linear-gradient(90deg, rgba(0,229,255,0.28), rgba(224,64,251,0.28))',
      border: '#00e5ff',
      powerMult: 2.60,
      dmgMult: 2.60,
      speedMult: 1.50,
      critBonus: 0.35,
      luckBonus: 0.45,
      energySave: 0.35,
      defMult: 2.00,
      desc: '+160% Daño/Poder | +50% Velocidad | +45% Suerte | +35% Crítico | -35% Energía'
    }
  };

  const GEAR_RARITY_ORDER = ['comun', 'no_comun', 'raro', 'epico', 'legendario', 'mitico', 'singular'];
  Abyssea.GEAR_RARITIES = GEAR_RARITIES;
  Abyssea.GEAR_RARITY_ORDER = GEAR_RARITY_ORDER;

  const TIER_REFORGE_MATERIAL = {
    basica:     { item: 'madera', qty: 6, coins: 15 },
    mejorada:   { item: 'piedra', qty: 8, coins: 25 },
    cobre:      { item: 'lingote_cobre', qty: 4, coins: 40 },
    hierro:     { item: 'lingote_hierro', qty: 4, coins: 65 },
    plata:      { item: 'lingote_plata', qty: 4, coins: 95 },
    oro:        { item: 'lingote_oro', qty: 4, coins: 135 },
    platino:    { item: 'lingote_platino', qty: 4, coins: 180 },
    acero:      { item: 'lingote_acero', qty: 4, coins: 230 },
    cristal:    { item: 'cristales', qty: 5, coins: 290 },
    mitrilo:    { item: 'lingotes_especiales', qty: 4, coins: 360 },
    titanio:    { item: 'lingote_titanio', qty: 4, coins: 450 },
    adamantita: { item: 'lingote_adamantita', qty: 5, coins: 560 },
    oricalco:   { item: 'lingote_oricalco', qty: 5, coins: 680 },
    coral:      { item: 'lingote_coral', qty: 5, coins: 800 },
    boreal:     { item: 'lingote_boreal', qty: 5, coins: 940 },
    selvano:    { item: 'lingote_selvano', qty: 5, coins: 1080 },
    escoria:    { item: 'lingote_escoria', qty: 5, coins: 1240 },
    pirita:     { item: 'lingote_pirita', qty: 5, coins: 1420 },
    glaciar:    { item: 'hielo_eterno', qty: 5, coins: 1620 },
    maldito:    { item: 'lingote_maldito', qty: 5, coins: 1850 },
    legendaria: { item: 'polvo_estelar', qty: 5, coins: 2200 },
    celestial:  { item: 'lingote_celestial', qty: 6, coins: 2800 },
    omega:      { item: 'lingote_omega', qty: 3, coins: 4500 }
  };
  Abyssea.TIER_REFORGE_MATERIAL = TIER_REFORGE_MATERIAL;

  function rollGearRarityId(qualityBonus = 0) {
    const mult = 1 + Math.max(0, Math.min(1.5, qualityBonus));
    const r = Math.random();
    const pSingular = 0.001 * mult;
    const pMitico = pSingular + 0.010 * mult;
    const pLegendario = pMitico + 0.030 * mult;
    const pEpico = pLegendario + 0.069 * mult;
    const pRaro = pEpico + 0.140 * Math.sqrt(mult);
    const pNoComun = pRaro + 0.250;

    if (r < pSingular) return 'singular';
    if (r < pMitico) return 'mitico';
    if (r < pLegendario) return 'legendario';
    if (r < pEpico) return 'epico';
    if (r < pRaro) return 'raro';
    if (r < pNoComun) return 'no_comun';
    return 'comun';
  }
  Abyssea.rollGearRarityId = rollGearRarityId;

  // ============================================================================
  // 2. AQUARIUM DIMENSION & FISH EXHIBITION PASSIVES
  // ============================================================================
  const NEW_EXOTIC_FISH = [
    {
      id: 'mantarraya_celestial',
      name: 'Mantarraya Celestial',
      category: 'alimentos',
      rarity: 'epico',
      icon: 'fish_exotic_mantarraya',
      sellValue: 120,
      buyValue: 260,
      edible: { hp: 55, energy: 65, speedBoost: 75 },
      desc: 'Planea bajo las corrientes astrales. Expuesta en el Acuario otorga +16% Velocidad de Movimiento y +10% Esquiva.'
    },
    {
      id: 'tiburon_cristal',
      name: 'Tiburón de Cristal Arcano',
      category: 'alimentos',
      rarity: 'epico',
      icon: 'fish_exotic_tiburon',
      sellValue: 145,
      buyValue: 310,
      edible: { hp: 70, energy: 50, dmgBoost: 80 },
      desc: 'Depredador con escamas de cuarzo. Expuesto en el Acuario otorga +18% Daño Cuerpo a Cuerpo y +10% Crítico.'
    },
    {
      id: 'celacanto_ancestral',
      name: 'Celacanto Ancestral',
      category: 'alimentos',
      rarity: 'legendario',
      icon: 'fish_exotic_celacanto',
      sellValue: 240,
      buyValue: 520,
      edible: { hp: 110, energy: 90 },
      desc: 'Fósil viviente de las eras olvidadas. Expuesto en el Acuario otorga +22% Reducción de Daño y +180 Vida Máxima.'
    },
    {
      id: 'koi_solar_mitico',
      name: 'Koi Imperial del Sol',
      category: 'alimentos',
      rarity: 'legendario',
      icon: 'fish_exotic_koi',
      sellValue: 260,
      buyValue: 560,
      edible: { hp: 95, energy: 100, luckBoost: 120 },
      desc: 'Irradia luz áurea en aguas sagradas. Expuesto en el Acuario otorga +25% Monedas Obtenidas y +20% Suerte General.'
    },
    {
      id: 'leviatan_esmeralda',
      name: 'Cría de Leviatán Esmeralda',
      category: 'alimentos',
      rarity: 'legendario',
      icon: 'fish_exotic_leviatan',
      sellValue: 310,
      buyValue: 680,
      edible: { hp: 130, energy: 110, dmgBoost: 120 },
      desc: 'Soberano juvenil de las fosas oceánicas. Expuesto en el Acuario otorga +20% Daño Total y +20% Poder de Recolección.'
    },
    {
      id: 'raya_singularidad',
      name: 'Raya Astral de Singularidad',
      category: 'alimentos',
      rarity: 'legendario',
      icon: 'fish_exotic_raya',
      sellValue: 380,
      buyValue: 840,
      edible: { hp: 150, energy: 150, dmgBoost: 150 },
      desc: 'Criatura tejida con polvo estelar líquido. Expuesta en el Acuario otorga +24% Poder de Hechizo y -15% Enfriamiento Arcano.'
    }
  ];

  const AQUARIUM_FISH_PASSIVES = {
    pez_comun:         { label: '+5% Daño General', effect: { dmgBonus: 0.05 }, color: '#cfd8dc' },
    anchoa:            { label: '+6% Velocidad de Minado', effect: { mineSpeed: 0.06 }, color: '#cfd8dc' },
    lubina:            { label: '+6% Velocidad de Tala', effect: { chopSpeed: 0.06 }, color: '#cfd8dc' },
    pez_azul:          { label: '+9% Daño General', effect: { dmgBonus: 0.09 }, color: '#81c784' },
    pez_payaso:        { label: '+10% Suerte y Hallazgo', effect: { luckBonus: 0.10 }, color: '#81c784' },
    pez_cirujano:      { label: '+9% Velocidad de Ataque', effect: { attackSpeed: 0.09 }, color: '#81c784' },
    bagre:             { label: '+10% Poder de Recolección', effect: { gatherPower: 0.10 }, color: '#81c784' },
    trucha_arcoiris:   { label: '+10% Monedas y Venta', effect: { coinDropBonus: 0.10 }, color: '#81c784' },
    pez_helado:        { label: '+13% Daño y +10% Ralentización', effect: { dmgBonus: 0.13, frostSlowChance: 0.10 }, color: '#4fc3f7' },
    pez_dorado_solar:  { label: '+15% Oro Obtenido', effect: { coinDropBonus: 0.15 }, color: '#4fc3f7' },
    pez_dorado:        { label: '+14% Suerte y Fortuna', effect: { luckBonus: 0.14 }, color: '#4fc3f7' },
    anguila:           { label: '+13% Velocidad de Ataque y Movimiento', effect: { attackSpeed: 0.13, moveSpeed: 0.08 }, color: '#4fc3f7' },
    medusa:            { label: '+14% Poder de Hechizo', effect: { spellPower: 0.14 }, color: '#4fc3f7' },
    pez_globo:         { label: '+18 Defensa y +15 Espinas', effect: { def: 18, thorns: 15 }, color: '#4fc3f7' },
    pez_angel:         { label: '+60 Vida Máx y +2.5 Regen/s', effect: { maxHp: 60, regen: 2.5 }, color: '#4fc3f7' },
    carpa_dorada:      { label: '+15% Experiencia y +12% Suerte', effect: { xpBonus: 0.15, luckBonus: 0.12 }, color: '#4fc3f7' },
    pez_abismal:       { label: '+17% Poder de Hechizo y +80 Radio de Luz', effect: { spellPower: 0.17, lightRadius: 80 }, color: '#ce93d8' },
    esturion_glacial:  { label: '+16% Daño Total y +14% Defensa', effect: { dmgBonus: 0.16, defPct: 0.14 }, color: '#ce93d8' },
    anguila_sombras:   { label: '+16% Daño y +12% Prob. Crítica', effect: { dmgBonus: 0.16, critChance: 0.12 }, color: '#ce93d8' },
    pulpo:             { label: '+18% Prob. de Botín Doble', effect: { doubleDropChance: 0.18 }, color: '#ce93d8' },
    mantarraya_celestial: { label: '+16% Velocidad Movimiento y +10% Esquiva', effect: { moveSpeed: 0.16, dodgeChance: 0.10 }, color: '#ce93d8' },
    tiburon_cristal:   { label: '+18% Daño Total y +10% Prob. Crítica', effect: { dmgBonus: 0.18, critChance: 0.10 }, color: '#ce93d8' },
    pez_lava:          { label: '+20% Daño Total y +12 Quemadura', effect: { dmgBonus: 0.20, burnDmg: 12 }, color: '#ffd54f' },
    pez_fenix_magma:   { label: '+22% Daño Total y +5 Regen Vida/s', effect: { dmgBonus: 0.22, regen: 5.0 }, color: '#ffd54f' },
    pez_legendario_kraken: { label: '+25% Daño Total y +20% Daño a Jefes', effect: { dmgBonus: 0.25, bossDmgBonus: 0.20 }, color: '#ffd54f' },
    celacanto_ancestral:   { label: '+22% Reducción de Daño y +180 Vida Máx', effect: { defPct: 0.22, maxHp: 180 }, color: '#ffd54f' },
    koi_solar_mitico:      { label: '+25% Monedas Obtenidas y +20% Suerte', effect: { coinDropBonus: 0.25, luckBonus: 0.20 }, color: '#ffd54f' },
    leviatan_esmeralda:    { label: '+20% Daño Total y +20% Poder Recolección', effect: { dmgBonus: 0.20, gatherPower: 0.20 }, color: '#ffd54f' },
    raya_singularidad:     { label: '+24% Poder de Hechizo y -15% Cooldown', effect: { spellPower: 0.24, spellCdRed: 0.15 }, color: '#00e5ff' }
  };
  Abyssea.AQUARIUM_FISH_PASSIVES = AQUARIUM_FISH_PASSIVES;

  // ============================================================================
  // 3. ALCHEMICAL POTIONS & MULTI-STEP ALCHEMY SYSTEM
  // ============================================================================
  const NEW_ALCHEMICAL_POTIONS = [
    {
      id: 'elixir_furia_volcanica',
      name: 'Elixir de Furia Volcánica',
      category: 'pociones',
      rarity: 'epico',
      icon: 'alc_furia_volcanica',
      sellValue: 95,
      buyValue: 210,
      healHp: 45,
      buff: { type: 'dmg', mult: 1.48, duration: 120 },
      alchemyMeta: {
        base: 'icor_volcanico',
        tempZone: [0.62, 0.88],
        color: '#ff5722',
        ingredients: { carbon: 4, rubi: 1, esencia_magma: 1 }
      },
      desc: 'Alquimia Ígnea: +48% Daño Total y restaura 45 HP durante 120s.'
    },
    {
      id: 'pocion_piel_adamantita',
      name: 'Poción de Piel de Adamantita',
      category: 'pociones',
      rarity: 'epico',
      icon: 'alc_piel_adamantita',
      sellValue: 110,
      buyValue: 245,
      healHp: 80,
      buff: { type: 'titan_skin', mult: 1.45, duration: 120 },
      alchemyMeta: {
        base: 'savia_luminosa',
        tempZone: [0.40, 0.68],
        color: '#4fc3f7',
        ingredients: { hierro: 4, cristales: 2, piedra: 6 }
      },
      desc: 'Alquimia Acorazada: +45 Defensa, +25% Reducción de Daño y +25 Espinas durante 120s.'
    },
    {
      id: 'brebaje_clarividencia_minera',
      name: 'Brebaje de Clarividencia Minera',
      category: 'pociones',
      rarity: 'raro',
      icon: 'alc_clarividencia_minera',
      sellValue: 85,
      buyValue: 190,
      healEnergy: 60,
      buff: { type: 'miner_sight', mult: 1.55, duration: 150 },
      alchemyMeta: {
        base: 'agua_purificada',
        tempZone: [0.35, 0.65],
        color: '#69f0ae',
        ingredients: { cristales: 2, carbon: 3, bayas: 3 }
      },
      desc: 'Alquimia Geológica: +55% Velocidad de Minado/Tala, +30% Botín Doble y Visión Nocturna por 150s.'
    },
    {
      id: 'elixir_crono_velocidad',
      name: 'Elixir de Crono-Velocidad',
      category: 'pociones',
      rarity: 'epico',
      icon: 'alc_crono_velocidad',
      sellValue: 105,
      buyValue: 235,
      healEnergy: 80,
      buff: { type: 'chrono_haste', mult: 1.45, duration: 120 },
      alchemyMeta: {
        base: 'savia_luminosa',
        tempZone: [0.48, 0.76],
        color: '#00e5ff',
        ingredients: { cristales_magicos: 2, pluma_oscura: 2, bayas: 4 }
      },
      desc: 'Alquimia Temporal: +45% Velocidad de Movimiento, +35% Velocidad de Ataque y +40% Dash por 120s.'
    },
    {
      id: 'tonico_vampirismo_sanguino',
      name: 'Tónico de Vampirismo Sanguino',
      category: 'pociones',
      rarity: 'epico',
      icon: 'alc_vampirismo_sanguino',
      sellValue: 115,
      buyValue: 255,
      healHp: 50,
      buff: { type: 'vampiric_thirst', mult: 1.38, duration: 120 },
      alchemyMeta: {
        base: 'icor_volcanico',
        tempZone: [0.55, 0.82],
        color: '#e53935',
        ingredients: { huesos: 4, rubi: 1, hongo_luminoso: 3 }
      },
      desc: 'Alquimia Carmesí: +20% Probabilidad Crítica, +25% Daño y +15 Curación al matar por 120s.'
    },
    {
      id: 'esencia_tormenta_electrica',
      name: 'Esencia de Tormenta Eléctrica',
      category: 'pociones',
      rarity: 'epico',
      icon: 'alc_tormenta_electrica',
      sellValue: 125,
      buyValue: 275,
      healEnergy: 75,
      buff: { type: 'storm_overload', mult: 1.45, duration: 120 },
      alchemyMeta: {
        base: 'eter_astral',
        tempZone: [0.58, 0.84],
        color: '#80d8ff',
        ingredients: { cristales_magicos: 2, zafiro: 1, oro: 2 }
      },
      desc: 'Alquimia Fulgurante: +45% Poder de Hechizo, +30% Velocidad de Ataque y +18% Crítico por 120s.'
    },
    {
      id: 'elixir_fortuna_dorada',
      name: 'Elixir de Fortuna Dorada',
      category: 'pociones',
      rarity: 'legendario',
      icon: 'alc_fortuna_dorada',
      sellValue: 160,
      buyValue: 350,
      healEnergy: 60,
      buff: { type: 'golden_fortune', mult: 1.75, duration: 180 },
      alchemyMeta: {
        base: 'savia_luminosa',
        tempZone: [0.45, 0.72],
        color: '#ffd54f',
        ingredients: { lingote_oro: 2, esmeraldas: 1, miel: 2 }
      },
      desc: 'Alquimia Áurea: +75% Monedas Obtenidas, +45% Suerte General y +30% Hallazgo de Gemas por 180s.'
    },
    {
      id: 'nectar_sobrecarga_arcana',
      name: 'Néctar de Sobrecarga Arcana',
      category: 'pociones',
      rarity: 'legendario',
      icon: 'alc_sobrecarga_arcana',
      sellValue: 175,
      buyValue: 385,
      healEnergy: 100,
      buff: { type: 'arcane', mult: 1.65, duration: 140 },
      alchemyMeta: {
        base: 'eter_astral',
        tempZone: [0.60, 0.85],
        color: '#d500f9',
        ingredients: { cristales_magicos: 3, amatista: 2, polvo_estelar: 1 }
      },
      desc: 'Alquimia Astral: +65% Poder de Hechizo, -25% Cooldown de Hechizos y gran regeneración de Energía por 140s.'
    },
    {
      id: 'pocion_paso_fantasmal',
      name: 'Poción de Paso Fantasmal',
      category: 'pociones',
      rarity: 'epico',
      icon: 'alc_paso_fantasmal',
      sellValue: 120,
      buyValue: 265,
      healEnergy: 55,
      buff: { type: 'phantom_step', mult: 1.35, duration: 110 },
      alchemyMeta: {
        base: 'eter_astral',
        tempZone: [0.38, 0.64],
        color: '#b388ff',
        ingredients: { esencia_oscura: 1, cristales: 3, hongo_luminoso: 2 }
      },
      desc: 'Alquimia Espectral: +28% Esquiva, +35% Velocidad Movimiento y +20% Crítico Furtivo por 110s.'
    },
    {
      id: 'elixir_coloso_titan',
      name: 'Elixir del Coloso Titán',
      category: 'pociones',
      rarity: 'legendario',
      icon: 'alc_coloso_titan',
      sellValue: 185,
      buyValue: 410,
      healHp: 140,
      buff: { type: 'colossus_might', mult: 1.50, duration: 150 },
      alchemyMeta: {
        base: 'icor_volcanico',
        tempZone: [0.52, 0.78],
        color: '#ffab40',
        ingredients: { lingote_acero: 2, diamantes: 1, filete: 2 }
      },
      desc: 'Alquimia Titánica: +220 Vida Máxima, +40% Daño Cuerpo a Cuerpo y +25% Defensa por 150s.'
    },
    {
      id: 'filtro_cosecha_radiante',
      name: 'Filtro de Cosecha Radiante',
      category: 'pociones',
      rarity: 'raro',
      icon: 'alc_cosecha_radiante',
      sellValue: 80,
      buyValue: 180,
      healEnergy: 75,
      buff: { type: 'radiant_harvest', mult: 1.60, duration: 160 },
      alchemyMeta: {
        base: 'agua_purificada',
        tempZone: [0.32, 0.62],
        color: '#aed581',
        ingredients: { bayas: 5, trigo: 4, cristales: 1 }
      },
      desc: 'Alquimia Botánica: +60% Rendimiento de Cosecha/Recolección y +35% Experiencia por 160s.'
    },
    {
      id: 'elixir_singularidad_omega',
      name: 'Elixir de Singularidad Astral',
      category: 'pociones',
      rarity: 'legendario',
      icon: 'alc_singularidad_omega',
      sellValue: 350,
      buyValue: 780,
      healHp: 200,
      healEnergy: 200,
      buff: { type: 'omega_transcendence', mult: 1.55, duration: 180 },
      alchemyMeta: {
        base: 'eter_astral',
        tempZone: [0.66, 0.86],
        color: '#00e5ff',
        ingredients: { polvo_estelar: 2, cristales_magicos: 4, diamantes: 1 }
      },
      desc: 'Alquimia Suprema: +50% Daño, +50% Poder de Hechizo, +35% Velocidad, +45% Suerte y +30% Defensa por 180s.'
    }
  ];
  Abyssea.NEW_ALCHEMICAL_POTIONS = NEW_ALCHEMICAL_POTIONS;

  const ALCHEMY_SOLVENTS = [
    { id: 'agua_purificada', name: 'Agua Purificada', color: '#4fc3f7', bonus: 'Estabilidad +15%' },
    { id: 'savia_luminosa',  name: 'Savia Luminosa',  color: '#69f0ae', bonus: 'Duración +20%' },
    { id: 'icor_volcanico',  name: 'Ícor Magmático',  color: '#ff7043', bonus: 'Potencia +20%' },
    { id: 'eter_astral',     name: 'Éter Astral',     color: '#e040fb', bonus: 'Frasco Doble +25%' }
  ];
  Abyssea.ALCHEMY_SOLVENTS = ALCHEMY_SOLVENTS;

  // ============================================================================
  // 4. "LEGADO DE LA ISLA" — LONG-TERM 10,000+ MILESTONE QUESTS
  // ============================================================================
  const ISLAND_LEGACY_QUESTS = [
    {
      id: 'legado_mineria',
      title: 'Rompemontañas Ancestral',
      icon: 'iron_ore',
      color: '#4fc3f7',
      category: 'Minería',
      lore: 'Quien perfora el corazón de diez mil vetas despierta el pulso mineral del archipiélago.',
      unit: 'minerales extraídos',
      tiers: [250, 1000, 2500, 5000, 10000],
      titles: ['Cantero Iniciado', 'Rompedor de Vetas', 'Maestro Geólogo', 'Señor del Subsuelo', 'Titán de la Roca Eterna'],
      passiveLabel: '+5% Velocidad y Poder de Minado por rango (hasta +25%)',
      passivePerTier: { mineSpeed: 0.05, gatherPower: 0.04 },
      getProgress: (g) => {
        const byItem = (g.stats && g.stats.byItem) || {};
        const oreKeys = ['piedra', 'carbon', 'cobre', 'hierro', 'plata', 'oro', 'platino', 'cristales', 'mitrilo_bruto', 'titanio', 'adamantita', 'oricalco', 'diamantes', 'rubi', 'zafiro', 'esmeraldas', 'amatista', 'topacio', 'coral_roca', 'cuarzo_boreal', 'escoria_caldera', 'pirita_solar', 'hielo_eterno', 'plata_maldita'];
        let sum = (g.stats && g.stats.oresMined) || 0;
        let fromItems = 0;
        for (const k of oreKeys) fromItems += (byItem[k] || 0);
        return Math.max(sum, fromItems, Math.floor(((g.stats && g.stats.gatheredTotal) || 0) * 0.45));
      }
    },
    {
      id: 'legado_tala',
      title: 'Señor del Bosque Eterno',
      icon: 'wood',
      color: '#81c784',
      category: 'Silvicultura',
      lore: 'Diez mil troncos alimentaron las fraguas, puentes y navíos que unieron las islas.',
      unit: 'árboles y maderas talados',
      tiers: [250, 1000, 2500, 5000, 10000],
      titles: ['Leñador de Pradera', 'Talador de Robledales', 'Guardián Forestal', 'Patriarca Silvano', 'Soberano del Bosque Eterno'],
      passiveLabel: '+5% Velocidad de Tala y +3% Botín Doble por rango (hasta +25%)',
      passivePerTier: { chopSpeed: 0.05, doubleDropChance: 0.03 },
      getProgress: (g) => {
        const byItem = (g.stats && g.stats.byItem) || {};
        const woodSum = (byItem.madera || 0) + (byItem.madera_ferrea || 0) + (byItem.fibra_vegetal || 0);
        return Math.max((g.stats && g.stats.treesChopped) || 0, woodSum);
      }
    },
    {
      id: 'legado_combate',
      title: 'Azote de las Sombras',
      icon: 'sword',
      color: '#ff5252',
      category: 'Combate',
      lore: 'Diez mil criaturas abatidas en criptas, selvas y volcanes graban tu nombre en la eternidad.',
      unit: 'enemigos derrotados',
      tiers: [200, 800, 2500, 5000, 10000],
      titles: ['Centinela Insular', 'Cazador de Monstruos', 'Campeón de Abyssea', 'Terror del Abismo', 'Verdugo Inmortal del Archipiélago'],
      passiveLabel: '+4% Daño Total y +2% Crítico por rango (hasta +20% Daño / +10% Crítico)',
      passivePerTier: { dmgBonus: 0.04, critChance: 0.02 },
      getProgress: (g) => (g.stats && g.stats.enemiesKilled) || 0
    },
    {
      id: 'legado_cosecha',
      title: 'Cosecha de las Edades',
      icon: 'wheat',
      color: '#ffd54f',
      category: 'Agricultura',
      lore: 'De una humilde parcela arada nacieron diez mil frutos que sostienen un imperio.',
      unit: 'cultivos cosechados',
      tiers: [200, 800, 2500, 5000, 10000],
      titles: ['Sembrador', 'Huertero Próspero', 'Agrónomo Real', 'Maestro de las Estaciones', 'Heraldo de la Abundancia Eterna'],
      passiveLabel: '+5% Energía Máxima y +0.8 Regeneración Energía/s por rango',
      passivePerTier: { maxEnergy: 12, energyRegen: 0.8 },
      getProgress: (g) => ((g.stats && g.stats.cropsHarvested) || 0) + ((g.stats && g.stats.tilesTilled) || 0)
    },
    {
      id: 'legado_pesca',
      title: 'Soberano de los Siete Mares',
      icon: 'fish_gold',
      color: '#29b6f6',
      category: 'Pesca',
      lore: 'Con paciencia y muñeca firme extrajiste desde anchoas plateadas hasta leviatanes abisales.',
      unit: 'peces capturados',
      tiers: [100, 400, 1200, 3000, 10000],
      titles: ['Pescador Costero', 'Arponero de Arrecife', 'Capitán Pelágico', 'Domador de Mareas', 'Soberano Abisal de los Mares'],
      passiveLabel: '+5% Suerte General y +4% Ventana de Pesca por rango',
      passivePerTier: { luckBonus: 0.05, fishWindow: 0.04 },
      getProgress: (g) => (g.stats && g.stats.fishCaught) || 0
    },
    {
      id: 'legado_forja',
      title: 'Maestro de la Gran Fragua',
      icon: 'iron_ingot',
      color: '#ffab40',
      category: 'Herrería',
      lore: 'Cada golpe de martillo sobre el yunque candente templó el destino de tus armas.',
      unit: 'objetos forjados o reforjados',
      tiers: [100, 400, 1000, 2500, 10000],
      titles: ['Aprendiz de Fuelle', 'Forjador de Acero', 'Maestro del Yunque', 'Artífice Rúnico', 'Herrero Inmortal del Yunque'],
      passiveLabel: '+5% Velocidad de Crafteo y +3% Velocidad de Ataque por rango',
      passivePerTier: { craftSpeed: 0.05, attackSpeed: 0.03 },
      getProgress: (g) => ((g.stats && g.stats.craftedTotal) || 0) + ((g.stats && g.stats.reforgedTotal) || 0)
    },
    {
      id: 'legado_magia',
      title: 'Archimago del Firmamento',
      icon: 'magic_crystal',
      color: '#e040fb',
      category: 'Hechicería',
      lore: 'Diez mil conjuros resonaron entre las estrellas obedeciendo a tu Grimorio.',
      unit: 'hechizos y rituales canalizados',
      tiers: [150, 600, 2000, 5000, 10000],
      titles: ['Acólito Rúnico', 'Conjurador Astral', 'Sabio del Grimorio', 'Señor de los Elementos', 'Archimago Eterno del Cosmos'],
      passiveLabel: '+5% Poder de Hechizo y -2.5% Cooldown por rango',
      passivePerTier: { spellPower: 0.05, spellCdRed: 0.025 },
      getProgress: (g) => ((g.stats && g.stats.spellsCast) || 0) + ((g.unlockedSpells ? g.unlockedSpells.length : 1) * 25)
    },
    {
      id: 'legado_riqueza',
      title: 'Emperador Mercante del Archipiélago',
      icon: 'gold_ingot',
      color: '#ffee58',
      category: 'Economía',
      lore: 'El flujo de monedas acuñadas y comercios convirtió tu isla en la capital del mundo.',
      unit: 'monedas de oro acumuladas',
      tiers: [2500, 15000, 75000, 250000, 1000000],
      titles: ['Mercader Ambulante', 'Banquero Insular', 'Barón del Oro', 'Magnate Real', 'Emperador Mercante del Archipiélago'],
      passiveLabel: '+6% Monedas Obtenidas y +4% Bono de Venta por rango',
      passivePerTier: { coinDropBonus: 0.06, sellBonus: 0.04 },
      getProgress: (g) => Math.max((g.stats && g.stats.coinsEarned) || 0, g.coins || 0)
    },
    {
      id: 'legado_mazmorras',
      title: 'Conquistador de Criptas y Abismos',
      icon: 'ancient_fragment',
      color: '#b388ff',
      category: 'Mazmorras',
      lore: 'Ningún guardián ni acertijo antiguo pudo detener tu descenso a las profundidades.',
      unit: 'mazmorras y jefes conquistados',
      tiers: [5, 20, 60, 150, 400],
      titles: ['Explorador de Ruinas', 'Rompesellos', 'Conquistador de Criptas', 'Terror de los Jefes', 'Señor Supremo de las Mazmorras'],
      passiveLabel: '+4% Daño a Jefes y +25 Vida Máxima por rango',
      passivePerTier: { bossDmgBonus: 0.04, maxHp: 25 },
      getProgress: (g) => ((g.clearedDungeons ? g.clearedDungeons.length : 0) * 3) + ((g.stats && g.stats.bossesKilled) || 0)
    },
    {
      id: 'legado_recoleccion_total',
      title: 'Leyenda Viviente de Abyssea',
      icon: 'abyssea_core',
      color: '#00e5ff',
      category: 'Supremo',
      lore: 'Cien mil recursos recolectados con tus propias manos sellan el legado definitivo de la isla.',
      unit: 'recursos totales recolectados',
      tiers: [1000, 5000, 20000, 50000, 100000],
      titles: ['Pionero de la Isla', 'Héroe del Archipiélago', 'Campeón Legendario', 'Avatar de Abyssea', 'Leyenda Eterna de Abyssea'],
      passiveLabel: '+3% Daño, +3% Poder Mágico, +3% Velocidad y +3% Defensa por rango',
      passivePerTier: { dmgBonus: 0.03, spellPower: 0.03, moveSpeed: 0.03, defPct: 0.03 },
      getProgress: (g) => (g.stats && g.stats.gatheredTotal) || 0
    }
  ];
  Abyssea.ISLAND_LEGACY_QUESTS = ISLAND_LEGACY_QUESTS;

  // ============================================================================
  // 5. SPELL RITUAL REQUIREMENTS
  // ============================================================================
  function getSpellRitualRecipe(spellId) {
    const sp = Abyssea.SPELLS && Abyssea.SPELLS[spellId];
    if (!sp) return { coins: 100, items: { cristales: 2 } };
    const tier = Math.max(1, sp.tier || 1);
    const RECIPES_BY_SPELL = {
      misil_arcano:      { coins: 0,   items: {} },
      bola_fuego:        { coins: 90,  items: { carbon: 5, cristales: 2 } },
      nova_hielo:        { coins: 130, items: { cristales: 3, hierro: 3 } },
      curacion_sagrada:  { coins: 150, items: { bayas: 6, cristales: 3 } },
      cadena_rayos:      { coins: 220, items: { oro: 3, cristales_magicos: 2 } },
      escudo_divino:     { coins: 240, items: { lingote_hierro: 4, cristales: 4 } },
      paso_etereo:       { coins: 260, items: { cristales_magicos: 2, pluma_oscura: 2 } },
      daga_veneno:       { coins: 200, items: { hongo_luminoso: 5, cristales: 3 } }
    };
    if (RECIPES_BY_SPELL[spellId]) return RECIPES_BY_SPELL[spellId];
    return {
      coins: tier * 140,
      items: tier >= 3
        ? { cristales_magicos: tier, amatista: 1 }
        : { cristales: tier * 2, hierro: tier * 2 }
    };
  }
  Abyssea.getSpellRitualRecipe = getSpellRitualRecipe;

  // ============================================================================
  // 6. REGISTER NEW ITEMS, BUILDINGS & RECIPES ON INIT
  // ============================================================================
  function registerV14Content() {
    const ITEMS = Abyssea.ITEMS || {};
    const BUILDINGS = Abyssea.BUILDINGS || {};
    const RECIPES = Abyssea.RECIPES || [];

    for (const f of NEW_EXOTIC_FISH) {
      if (!ITEMS[f.id]) ITEMS[f.id] = f;
    }

    for (const p of NEW_ALCHEMICAL_POTIONS) {
      if (!ITEMS[p.id]) ITEMS[p.id] = p;
      const recId = 'r_alc_' + p.id;
      if (!RECIPES.some(r => r.id === recId || r.out === p.id)) {
        RECIPES.push({
          id: recId,
          name: p.name,
          station: 'alquimia',
          in: p.alchemyMeta.ingredients,
          out: p.id,
          qty: 1,
          xp: 38,
          craftTime: 3.0
        });
      }
    }

    if (!BUILDINGS.portal_acuario) {
      BUILDINGS.portal_acuario = {
        id: 'portal_acuario',
        name: 'Portal al Santuario Acuático',
        category: 'especiales',
        placeOn: 'land',
        size: 2,
        sprite: 'bld_portal_acuario',
        cost: { piedra: 18, cristales: 4, madera: 12 },
        opensPanel: 'aquarium',
        lightRadius: 170,
        desc: 'Abre un portal dimensional hacia el Santuario Acuático donde puedes exponer tus peces capturados para obtener poderosas pasivas permanentes según su rareza.'
      };
    }

    if (!BUILDINGS.mesa_reforja) {
      BUILDINGS.mesa_reforja = {
        id: 'mesa_reforja',
        name: 'Yunque de Reforja Rúnica',
        category: 'produccion',
        placeOn: 'land',
        size: 1,
        sprite: 'bld_mesa_reforja',
        cost: { lingote_hierro: 6, piedra: 14, carbon: 6 },
        opensPanel: 'reforge',
        lightRadius: 145,
        desc: 'Permite reforjar la rareza de tus herramientas y armas (Común a Singular 0.1%) usando material de su mismo tier o un Catalizador de Reforja.'
      };
    }
  }

  registerV14Content();

  // ============================================================================
  // 7. ATTACH RUNTIME METHODS TO GameEngine.prototype
  // ============================================================================
  function attachGameEngineV14() {
    const GameEngine = Abyssea.GameEngine;
    if (!GameEngine || GameEngine.prototype._v14Attached) return;
    GameEngine.prototype._v14Attached = true;

    const proto = GameEngine.prototype;

    proto.ensureV14State = function () {
      if (!this.toolRarities || typeof this.toolRarities !== 'object') {
        this.toolRarities = {};
      }
      for (const tId of Object.keys(Abyssea.TOOLS || {})) {
        if (this.toolTiers && this.toolTiers[tId] && !this.toolRarities[tId]) {
          this.toolRarities[tId] = 'comun';
        }
      }
      if (!this.weaponRarities || typeof this.weaponRarities !== 'object') {
        this.weaponRarities = {};
      }
      if (!Array.isArray(this.aquariumExhibits)) {
        this.aquariumExhibits = new Array(12).fill(null);
      } else if (this.aquariumExhibits.length < 12) {
        while (this.aquariumExhibits.length < 12) this.aquariumExhibits.push(null);
      }
      if (!this.claimedLegacyTiers || typeof this.claimedLegacyTiers !== 'object') {
        this.claimedLegacyTiers = {};
      }
      if (!this.masteredPotions || typeof this.masteredPotions !== 'object') {
        this.masteredPotions = {};
      }
    };

    proto.getGearRarity = function (kind, id) {
      this.ensureV14State();
      const rId = kind === 'tool'
        ? (this.toolRarities[id] || 'comun')
        : (this.weaponRarities[id] || 'comun');
      return GEAR_RARITIES[rId] || GEAR_RARITIES.comun;
    };

    proto.rollAndAssignGearRarity = function (kind, id, qualityBonus = 0, silent = false) {
      this.ensureV14State();
      const newRarityId = rollGearRarityId(qualityBonus);
      if (kind === 'tool') {
        this.toolRarities[id] = newRarityId;
      } else {
        this.weaponRarities[id] = newRarityId;
      }
      const rDef = GEAR_RARITIES[newRarityId] || GEAR_RARITIES.comun;
      if (!silent && this.player) {
        const gearName = kind === 'tool'
          ? (Abyssea.TOOLS[id] ? Abyssea.TOOLS[id].name : id)
          : (Abyssea.ITEMS[id] ? Abyssea.ITEMS[id].name : id);
        this.addFloatingText(this.player.x, this.player.y - 38, `${gearName}: [${rDef.name.toUpperCase()}]`, rDef.color);
        if (newRarityId === 'singular' || newRarityId === 'mitico' || newRarityId === 'legendario') {
          this.spawnShockwave(this.player.x, this.player.y, 130, rDef.color);
          this.spawnParticles(this.player.x, this.player.y, rDef.color, 32);
          Abyssea.Audio.play('levelup');
        }
      }
      this.recomputeModifiers();
      this.uiDirty = true;
      return rDef;
    };

    proto.getReforgeCost = function (kind, id) {
      this.ensureV14State();
      if (kind === 'tool') {
        const curTier = (this.toolTiers && this.toolTiers[id]) || 'basica';
        const tierMat = TIER_REFORGE_MATERIAL[curTier] || TIER_REFORGE_MATERIAL.basica;
        const matId = Abyssea.ITEMS[tierMat.item] ? tierMat.item : 'lingote_hierro';
        return {
          tier: curTier,
          coins: tierMat.coins,
          items: { [matId]: tierMat.qty }
        };
      }
      const rec = (Abyssea.RECIPES || []).find(r => r.out === id);
      if (rec && rec.in) {
        const entries = Object.entries(rec.in);
        if (entries.length > 0) {
          const genericMats = new Set(['madera', 'tablon', 'cuerda', 'cuero', 'fibra_vegetal']);
          const isMatOnly = (k) => {
            const itK = Abyssea.ITEMS && Abyssea.ITEMS[k];
            if (!itK) return true;
            if (itK.weapon || itK.weaponKind || itK.weaponMelee || itK.isRangedWeapon || itK.isStaffWeapon || itK.isSpecialBlade || itK.equipSlot || itK.equip) return false;
            if (itK.category === 'armas' || itK.category === 'armaduras' || itK.category === 'equipo' || itK.category === 'equipamiento') return false;
            return true;
          };
          const primary = entries.find(([k]) => !genericMats.has(k) && isMatOnly(k))
            || entries.find(([k]) => isMatOnly(k))
            || entries[0];
          const [matId, baseQty] = primary;
          return {
            tier: 'arma',
            coins: 120,
            items: { [matId]: Math.max(1, Math.ceil(baseQty * 0.5)) }
          };
        }
      }
      return {
        tier: 'arma',
        coins: 120,
        items: { lingote_hierro: 3 }
      };
    };

    proto.canReforgeGear = function (kind, id) {
      const cost = this.getReforgeCost(kind, id);
      if (!cost) return false;
      if ((this.coins || 0) < cost.coins) return false;
      return Object.entries(cost.items).every(([mId, q]) => (this.inventory[mId] || 0) >= q);
    };

    proto.reforgeGear = function (kind, id, qualityBonus = 0) {
      if (!this.canReforgeGear(kind, id)) {
        this.toast('No tienes suficientes materiales del mismo tier para reforjar.', 'warn');
        Abyssea.Audio.play('error');
        return null;
      }
      const cost = this.getReforgeCost(kind, id);
      this.coins -= cost.coins;
      for (const [mId, q] of Object.entries(cost.items)) {
        this.removeItem(mId, q);
      }
      this.stats.reforgedTotal = (this.stats.reforgedTotal || 0) + 1;
      const rDef = this.rollAndAssignGearRarity(kind, id, qualityBonus, false);
      const gearName = kind === 'tool'
        ? (Abyssea.TOOLS[id] ? Abyssea.TOOLS[id].name : id)
        : (Abyssea.ITEMS[id] ? Abyssea.ITEMS[id].name : id);
      this.toast(`¡${gearName} reforjado! Rareza obtenida: ${rDef.name} (${rDef.chanceLabel}) — ${rDef.desc}`, 'success');
      return rDef;
    };

    proto.getAquariumModifiers = function () {
      this.ensureV14State();
      const bonus = {};
      for (const fishId of this.aquariumExhibits) {
        if (!fishId) continue;
        const p = AQUARIUM_FISH_PASSIVES[fishId];
        if (!p || !p.effect) continue;
        for (const [k, v] of Object.entries(p.effect)) {
          bonus[k] = (bonus[k] || 0) + v;
        }
      }
      return bonus;
    };

    proto.exhibitFishInAquarium = function (slotIdx, fishId) {
      this.ensureV14State();
      if (slotIdx < 0 || slotIdx >= 12) return false;
      if (fishId && (this.inventory[fishId] || 0) <= 0) return false;
      const prev = this.aquariumExhibits[slotIdx];
      if (prev) {
        this.addItem(prev, 1);
      }
      if (fishId) {
        this.removeItem(fishId, 1);
        this.aquariumExhibits[slotIdx] = fishId;
        const fItem = Abyssea.ITEMS[fishId];
        const pInfo = AQUARIUM_FISH_PASSIVES[fishId];
        this.toast(`${fItem ? fItem.name : fishId} expuesto en Pecera #${slotIdx + 1} (${pInfo ? pInfo.label : 'Pasiva activa'})`, 'success');
        Abyssea.Audio.play('levelup');
      } else {
        this.aquariumExhibits[slotIdx] = null;
        Abyssea.Audio.play('pickup');
      }
      this.recomputeModifiers();
      this.uiDirty = true;
      return true;
    };

    proto.enterAquarium = function () {
      this.ensureV14State();
      if (this.activeDungeon) {
        this.toast('No puedes entrar al Santuario Acuático desde una mazmorra.', 'warn');
        return false;
      }
      if (this.activeAquarium) return true;
      const W = 22;
      const H = 15;
      const tanks = [];
      const coords = [
        [4, 3], [7, 3], [10, 3], [13, 3], [16, 3], [18, 3],
        [4, 7], [7, 7], [14, 7], [17, 7], [4, 11], [17, 11]
      ];
      coords.forEach(([tx, ty], idx) => {
        tanks.push({ idx, tx, ty });
      });
      this.activeAquarium = {
        width: W,
        height: H,
        returnPos: { x: this.player.x, y: this.player.y },
        consolePos: { tx: 11, ty: 7 },
        exitPortalPos: { tx: 11, ty: 12 },
        tanks
      };
      this.player.x = 11 * TILE_SIZE + 24;
      this.player.y = 11 * TILE_SIZE + 24;
      this.camera.x = this.player.x;
      this.camera.y = this.player.y;
      Abyssea.Audio.play('portal');
      this.spawnParticles(this.player.x, this.player.y, '#00e5ff', 30);
      this.toast('Has entrado al Santuario Acuático Dimensional. Acércate a una pecera o consola y pulsa [E].', 'info');
      return true;
    };

    proto.exitAquarium = function () {
      if (!this.activeAquarium) return false;
      const rp = this.activeAquarium.returnPos || { x: this.player.x, y: this.player.y };
      this.activeAquarium = null;
      this.player.x = rp.x;
      this.player.y = rp.y;
      this.camera.x = this.player.x;
      this.camera.y = this.player.y;
      Abyssea.Audio.play('portal');
      this.spawnParticles(this.player.x, this.player.y, '#80deea', 24);
      this.toast('Has regresado al archipiélago.', 'info');
      return true;
    };

    proto.updateAquarium = function (dt) {
      const aq = this.activeAquarium;
      if (!aq) return;
      const minX = 2.2 * TILE_SIZE;
      const maxX = (aq.width - 2.2) * TILE_SIZE;
      const minY = 2.2 * TILE_SIZE;
      const maxY = (aq.height - 2.2) * TILE_SIZE;
      this.player.x = Math.max(minX, Math.min(maxX, this.player.x));
      this.player.y = Math.max(minY, Math.min(maxY, this.player.y));

      // Solid collision against the 12 fish tanks and center console so the hero never clips inside them
      const pushOut = (ox, oy, minDist) => {
        const dx = this.player.x - ox;
        const dy = this.player.y - oy;
        const d = Math.hypot(dx, dy);
        if (d > 0.001 && d < minDist) {
          this.player.x = ox + (dx / d) * minDist;
          this.player.y = oy + (dy / d) * minDist;
        } else if (d <= 0.001) {
          this.player.y = oy + minDist;
        }
      };
      if (Array.isArray(aq.tanks)) {
        for (const tk of aq.tanks) {
          pushOut((tk.tx + 0.5) * TILE_SIZE, (tk.ty + 0.5) * TILE_SIZE, 34);
        }
      }
      if (aq.consolePos) {
        pushOut((aq.consolePos.tx + 0.5) * TILE_SIZE, (aq.consolePos.ty + 0.5) * TILE_SIZE, 30);
      }

      const ptx = this.player.x / TILE_SIZE;
      const pty = this.player.y / TILE_SIZE;
      const customInteract = Abyssea.UI && Abyssea.UI.keybinds && Abyssea.UI.keybinds.interact;
      const interact = !!(this.keys && (this.keys.KeyE || this.keys.KeyF || (customInteract && this.keys[customInteract])));
      if (interact && !this._aqInteractLock) {
        this._aqInteractLock = true;
        if (Math.hypot(ptx - (aq.exitPortalPos.tx + 0.5), pty - (aq.exitPortalPos.ty + 0.5)) <= 1.8) {
          this.exitAquarium();
          return;
        }
        let nearestTank = null;
        let bestD = 2.0;
        for (const tk of aq.tanks) {
          const d = Math.hypot(ptx - (tk.tx + 0.5), pty - (tk.ty + 0.5));
          if (d < bestD) { bestD = d; nearestTank = tk; }
        }
        const dConsole = Math.hypot(ptx - (aq.consolePos.tx + 0.5), pty - (aq.consolePos.ty + 0.5));
        if (nearestTank || dConsole <= 2.2) {
          if (Abyssea.UI) {
            Abyssea.UI.selectedAquariumSlot = nearestTank ? nearestTank.idx : 0;
            Abyssea.UI.openModal('aquarium');
          }
        }
      } else if (!interact) {
        this._aqInteractLock = false;
      }
    };

    proto.renderAquarium = function (ctx) {
      const aq = this.activeAquarium;
      if (!aq) return;
      this.ensureV14State();
      const W = aq.width;
      const H = aq.height;
      const t = this.time || 0;

      ctx.fillStyle = '#041322';
      ctx.fillRect(-400, -400, W * TILE_SIZE + 800, H * TILE_SIZE + 800);

      for (let ty = 0; ty < H; ty++) {
        for (let tx = 0; tx < W; tx++) {
          const px = tx * TILE_SIZE;
          const py = ty * TILE_SIZE;
          const isWall = tx <= 1 || ty <= 1 || tx >= W - 2 || ty >= H - 2;
          if (isWall) {
            ctx.fillStyle = (tx + ty) % 2 === 0 ? '#0c2d48' : '#103758';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = 'rgba(79, 195, 247, 0.25)';
            ctx.lineWidth = 1;
            ctx.strokeRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          } else {
            const checker = (tx + ty) & 1;
            ctx.fillStyle = checker ? '#113f59' : '#154a68';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = 'rgba(128, 222, 234, 0.12)';
            ctx.lineWidth = 1;
            ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
            const caustic = Math.sin(t * 2.2 + tx * 0.7 + ty * 0.9);
            if (caustic > 0.65) {
              ctx.fillStyle = 'rgba(128, 222, 234, 0.09)';
              ctx.fillRect(px + 8, py + 8, TILE_SIZE - 16, TILE_SIZE - 16);
            }
          }
        }
      }

      for (const tk of aq.tanks) {
        const px = tk.tx * TILE_SIZE;
        const py = tk.ty * TILE_SIZE;
        const fishId = this.aquariumExhibits[tk.idx];
        const fishItem = fishId ? Abyssea.ITEMS[fishId] : null;
        const passInfo = fishId ? AQUARIUM_FISH_PASSIVES[fishId] : null;

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(px - 4, py + TILE_SIZE - 8, TILE_SIZE + 8, 12);
        ctx.strokeStyle = fishId ? (passInfo ? passInfo.color : '#ffd54f') : '#475569';
        ctx.lineWidth = 2;

        ctx.fillStyle = fishId ? 'rgba(0, 188, 212, 0.34)' : 'rgba(15, 42, 66, 0.55)';
        ctx.fillRect(px - 2, py - 10, TILE_SIZE + 4, TILE_SIZE + 10);
        ctx.strokeRect(px - 2, py - 10, TILE_SIZE + 4, TILE_SIZE + 10);

        for (let b = 0; b < 3; b++) {
          const bx = px + 10 + b * 14 + Math.sin(t * 3 + b + tk.idx) * 3;
          const by = py + TILE_SIZE - 8 - (((t * 24 + b * 17 + tk.idx * 9) % (TILE_SIZE - 4)));
          ctx.fillStyle = 'rgba(224, 247, 250, 0.55)';
          ctx.beginPath();
          ctx.arc(bx, by, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        if (fishItem) {
          const swimX = px + 24 + Math.sin(t * 2.4 + tk.idx) * 10;
          const swimY = py + 14 + Math.cos(t * 3.1 + tk.idx) * 5;
          const iconCanvas = Abyssea.Assets && Abyssea.Assets.getItemIconCanvas
            ? Abyssea.Assets.getItemIconCanvas(fishItem.icon)
            : null;
          if (iconCanvas) {
            ctx.save();
            ctx.translate(swimX, swimY);
            if (Math.cos(t * 2.4 + tk.idx) < 0) ctx.scale(-1, 1);
            ctx.drawImage(iconCanvas, -14, -14, 28, 28);
            ctx.restore();
          }
          ctx.font = '11px AbysseaPixel, monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = passInfo ? passInfo.color : '#fff';
          ctx.fillText(fishItem.name, px + 24, py - 15);
          if (passInfo) {
            ctx.fillStyle = '#a7f3d0';
            ctx.fillText(passInfo.label, px + 24, py + TILE_SIZE + 16);
          }
        } else {
          ctx.font = '11px AbysseaPixel, monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(`PECERA #${tk.idx + 1} [E]`, px + 24, py + 18);
        }
      }

      const cpx = aq.consolePos.tx * TILE_SIZE;
      const cpy = aq.consolePos.ty * TILE_SIZE;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cpx + 4, cpy + 4, TILE_SIZE - 8, TILE_SIZE - 8);
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(cpx + 4, cpy + 4, TILE_SIZE - 8, TILE_SIZE - 8);
      ctx.font = '12px AbysseaPixel, monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffd54f';
      ctx.fillText('[E] GESTIONAR ACUARIO', cpx + 24, cpy - 6);

      const epx = aq.exitPortalPos.tx * TILE_SIZE + 24;
      const epy = aq.exitPortalPos.ty * TILE_SIZE + 24;
      ctx.save();
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(epx, epy, 20 + Math.sin(t * 4) * 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(0, 229, 255, 0.28)';
      ctx.beginPath();
      ctx.arc(epx, epy, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '12px AbysseaPixel, monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#e0f7fa';
      ctx.fillText('[E] PORTAL A LA ISLA', epx, epy - 26);
      ctx.restore();

      if (typeof this.drawPlayer === 'function') {
        this.drawPlayer(ctx);
      }
    };

    proto.getLegacyModifiers = function () {
      this.ensureV14State();
      const bonus = {};
      for (const q of ISLAND_LEGACY_QUESTS) {
        const claimedLvl = this.claimedLegacyTiers[q.id] || 0;
        if (claimedLvl > 0 && q.passivePerTier) {
          for (const [k, v] of Object.entries(q.passivePerTier)) {
            bonus[k] = (bonus[k] || 0) + v * claimedLvl;
          }
        }
      }
      return bonus;
    };

    proto.claimLegacyTier = function (questId) {
      this.ensureV14State();
      const q = ISLAND_LEGACY_QUESTS.find(x => x.id === questId);
      if (!q) return false;
      const curTierIdx = this.claimedLegacyTiers[questId] || 0;
      if (curTierIdx >= q.tiers.length) return false;
      const req = q.tiers[curTierIdx];
      const prog = q.getProgress(this);
      if (prog < req) {
        this.toast(`Aún te falta progreso (${prog}/${req} ${q.unit}).`, 'warn');
        Abyssea.Audio.play('error');
        return false;
      }
      const nextRank = curTierIdx + 1;
      this.claimedLegacyTiers[questId] = nextRank;
      const coinReward = nextRank * 450;
      const xpReward = nextRank * 350;
      this.addCoins(coinReward);
      this.gainXp(xpReward);
      this.addItem('cristales_magicos', nextRank * 2);
      if (nextRank >= 4) this.addItem('polvo_estelar', nextRank - 2);
      const unlockedTitle = q.titles[curTierIdx] || q.title;
      this.activeLegacyTitle = unlockedTitle;
      Abyssea.Audio.play('levelup');
      this.spawnShockwave(this.player.x, this.player.y, 160, q.color);
      this.spawnParticles(this.player.x, this.player.y, q.color, 36);
      this.recomputeModifiers();
      this.toast(`¡Legado de la Isla ascendido! "${q.title}" Rango ${nextRank}/5 — Título: [${unlockedTitle}] (+${coinReward} Oro)`, 'success');
      this.uiDirty = true;
      return true;
    };
  }

  attachGameEngineV14();

  // ============================================================================
  // 8. UI EXTENSIONS (Aquarium, Legacy, Alchemy, Rituals, Enchanting, Anvil Forge, Reforge)
  //    - 100% Native Animated Pixel-Art Sprites (NO static AI photo backgrounds)
  //    - Large 880x440 Interactive 60 FPS Canvas
  //    - Zero Emojis, Zero "Bladesong" UI strings, Zero vector tongs cursor
  //    - Auto-closes modal after forging/reforging completes
  // ============================================================================
  function attachUIV14() {
    const UI = Abyssea.UI;
    if (!UI) {
      setTimeout(attachUIV14, 50);
      return;
    }

    // Helper: draw animated 7-frame Tiny Swords fire sprite or crisp pixel fallback
    function drawNativeAnimatedFire(ctx, cx, cy, size, timeSec, seedOffset) {
      const fireSheet = Abyssea.Assets && Abyssea.Assets.images && Abyssea.Assets.images.fx_fire;
      const frame = Math.floor((timeSec * 12 + (seedOffset || 0)) % 7);
      if (fireSheet && fireSheet.complete && fireSheet.naturalWidth >= 896) {
        ctx.drawImage(fireSheet, frame * 128, 0, 128, 128, Math.round(cx - size / 2), Math.round(cy - size / 2), Math.round(size), Math.round(size));
      } else {
        const p = 4;
        for (let i = 0; i < 6; i++) {
          const ox = Math.round(Math.sin(timeSec * 10 + i) * 2) * p;
          const oy = -i * p;
          ctx.fillStyle = i < 2 ? '#fffde7' : (i < 4 ? '#ffb300' : '#e65100');
          ctx.fillRect(Math.round(cx - (6 - i) * 2 + ox), Math.round(cy + oy), (6 - i) * 4, p);
        }
      }
    }

    // Helper: draw clean atmospheric pixel-art workshop backdrop (no blurry stretched tiles)
    function drawNativeWorkshopRoom(ctx, W, H, wallH, theme) {
      const bgTop = theme === 'ritual' ? '#070412' : (theme === 'alchemy' ? '#0a1218' : '#120d0a');
      const bgBot = theme === 'ritual' ? '#120826' : (theme === 'alchemy' ? '#101d24' : '#1a120d');
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, bgTop);
      grad.addColorStop(1, bgBot);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Crisp pixel-grid / starfield ambiance
      const seedCount = theme === 'ritual' ? 38 : 20;
      for (let i = 0; i < seedCount; i++) {
        const sx = ((i * 197 + 53) % (W - 20)) + 10;
        const sy = ((i * 113 + 29) % (wallH - 18)) + 8;
        ctx.fillStyle = theme === 'ritual'
          ? (i % 3 === 0 ? 'rgba(224,64,251,0.35)' : 'rgba(0,229,255,0.28)')
          : 'rgba(255,213,79,0.18)';
        ctx.fillRect(sx, sy, 2, 2);
      }

      if (theme !== 'ritual') {
        // Subtle clean workbench horizon ledge
        ctx.fillStyle = '#251811';
        ctx.fillRect(0, wallH - 8, W, 8);
        ctx.fillStyle = '#3b261b';
        ctx.fillRect(0, wallH - 8, W, 2);
        ctx.fillStyle = '#0d0907';
        ctx.fillRect(0, wallH, W, 2);

        // Floor perspective stripes (subtle clean dark stone bands)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
        for (let y = wallH; y < H; y += 36) {
          ctx.fillRect(0, y, W, 2);
        }
      } else {
        // Arcane floor border ring accents
        ctx.strokeStyle = 'rgba(179, 136, 255, 0.14)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(W / 2, H * 0.56, W * 0.42, H * 0.36, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // ------------------------------------------------------------------------
    // Rarity Badge Helper (Zero Emojis, returns DOM node via this.el)
    // ------------------------------------------------------------------------
    UI.renderGearRarityBadge = function (rarityId) {
      const r = GEAR_RARITIES[rarityId] || GEAR_RARITIES.comun;
      return this.el('span', {
        class: 'v14-rarity-badge',
        style: `display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:bold;background:${r.bg};color:${r.color};border:1px solid ${r.border};text-shadow:0 1px 2px #000;`
      }, `[${r.name.toUpperCase()} · ${r.chanceLabel}]`);
    };

    // ------------------------------------------------------------------------
    // 8.1 Sanctuary Aquarium Modal (Zero Emojis)
    // ------------------------------------------------------------------------
    UI.renderAquariumModal = function (body) {
      const g = this.game;
      g.ensureV14State();
      const aqBonus = g.getAquariumModifiers() || {};
      const activeCount = g.aquariumExhibits.filter(Boolean).length;

      const passiveRow = this.el('div', { style: 'display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;' });
      const entries = Object.entries(aqBonus);
      if (entries.length === 0) {
        passiveRow.appendChild(this.el('span', { style: 'color:#90a4ae;font-size:12px;' },
          'Exhibe peces en las 12 peceras de cristal para activar bendiciones pasivas permanentes en toda la isla.'));
      } else {
        const FLAT_AQUARIUM_KEYS = new Set(['maxHp', 'maxEnergy', 'def', 'regen', 'energyRegen', 'lightRadius', 'burnDmg', 'extraDrop', 'harvestBonus', 'killHeal']);
        const STAT_LABELS = {
          maxHp: 'Vida Máx.', maxEnergy: 'Energía Máx.', def: 'Defensa', defPct: 'Mitigación',
          regen: 'Regen. Vida/s', energyRegen: 'Regen. Energía/s', lightRadius: 'Radio Luz',
          moveSpeed: 'Vel. Mov.', dmgBonus: 'Daño', spellPower: 'Poder Mágico',
          critChance: 'Crítico', dodgeChance: 'Esquiva', luckBonus: 'Suerte',
          doubleDropChance: 'Botín Doble', mineSpeed: 'Minería', chopSpeed: 'Tala',
          gatherPower: 'Recolección', craftSpeed: 'Crafteo', sellBonus: 'Venta',
          coinDropBonus: 'Monedas', bossDmgBonus: 'Daño Jefes', spellCdRed: 'Red. Enfriamiento',
          burnDmg: 'Daño Fuego', frostSlowChance: 'Ralent. Hielo', thorns: 'Espinas',
          lifeSteal: 'Robo Vida', xpBonus: 'Experiencia', fishWindow: 'Ventana Pesca'
        };
        for (const [k, v] of entries) {
          const lbl = STAT_LABELS[k] || k;
          const valStr = FLAT_AQUARIUM_KEYS.has(k)
            ? `+${Number.isInteger(v) ? v : Number(v.toFixed(1))}`
            : `+${Math.round(v * 100)}%`;
          passiveRow.appendChild(this.el('span', {
            style: 'background:rgba(0,229,255,0.14);border:1px solid #00e5ff;color:#e0f7fa;padding:3px 9px;border-radius:4px;font-size:12px;'
          }, `${lbl}: ${valStr}`));
        }
      }

      const headerCard = this.el('div', {
        style: 'background:linear-gradient(135deg,#041c32,#063852);border:2px solid #00e5ff;border-radius:8px;padding:12px;margin-bottom:12px;'
      }, [
        this.el('div', { style: 'display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;' }, [
          this.el('div', {}, [
            this.el('div', { style: 'font-size:18px;font-weight:bold;color:#00e5ff;' }, `Santuario Acuático Dimensional (${activeCount}/12 Peceras)`),
            this.el('div', { style: 'font-size:12px;color:#b2ebf2;' }, 'Cada especie exhibida canaliza una pasiva permanente hacia tu personaje.')
          ]),
          this.el('button', {
            class: 'btn btn-gold btn-sm',
            onclick: () => {
              this.closeModal();
              if (g.activeAquarium) g.exitAquarium();
              else g.enterAquarium();
            }
          }, g.activeAquarium ? 'Salir por el Portal a la Isla' : 'Teletransportarse a la Sala del Acuario')
        ]),
        passiveRow
      ]);
      body.appendChild(headerCard);

      const fishInBag = Object.keys(AQUARIUM_FISH_PASSIVES).filter(fId => (g.inventory[fId] || 0) > 0);
      const grid = this.el('div', { style: 'display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;' });

      for (let i = 0; i < 12; i++) {
        const fId = g.aquariumExhibits[i];
        const fItem = fId ? Abyssea.ITEMS[fId] : null;
        const fPass = fId ? AQUARIUM_FISH_PASSIVES[fId] : null;
        const borderCol = fPass ? fPass.color : '#29434e';

        const tankCard = this.el('div', {
          style: `background:linear-gradient(180deg,rgba(8,35,56,0.92),rgba(4,18,32,0.96));border:2px solid ${borderCol};border-radius:6px;padding:10px;display:flex;flex-direction:column;justify-content:space-between;`
        }, [
          this.el('div', { style: 'display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;' }, [
            this.el('span', { style: 'font-size:11px;color:#80deea;font-weight:bold;' }, `PECERA #${i + 1}`),
            this.el('span', { style: `font-size:10px;color:${borderCol};` }, fItem ? `[${(fItem.rarity || 'raro').toUpperCase()}]` : 'Vacía')
          ])
        ]);

        if (fItem) {
          tankCard.appendChild(this.el('div', { style: 'display:flex;align-items:center;gap:10px;margin:6px 0;' }, [
            this.itemIcon(fItem.icon, 32),
            this.el('div', {}, [
              this.el('div', { style: `font-weight:bold;color:${borderCol};font-size:14px;` }, fItem.name),
              this.el('div', { style: 'color:#a7f3d0;font-size:12px;' }, fPass ? fPass.label : '+5% Bono Acuático')
            ])
          ]));
          tankCard.appendChild(this.el('button', {
            class: 'btn btn-stone btn-sm',
            onclick: () => {
              g.exhibitFishInAquarium(i, null);
              this.renderModal();
            }
          }, 'Retirar Pez al Inventario'));
        } else {
          tankCard.appendChild(this.el('div', {
            style: 'height:42px;display:flex;align-items:center;justify-content:center;color:#546e7a;font-size:12px;border:1px dashed #29434e;border-radius:6px;margin:6px 0;'
          }, 'Agua Cristalina Sin Pez'));

          if (fishInBag.length > 0) {
            const selRow = this.el('div', { style: 'display:flex;gap:6px;align-items:center;margin-top:4px;' });
            const selectEl = this.el('select', {
              style: 'flex:1;background:#0a1929;color:#e0f7fa;border:1px solid #0288d1;border-radius:4px;padding:4px 6px;font-size:12px;'
            });
            for (const fId of fishInBag) {
              const itF = Abyssea.ITEMS[fId];
              const pF = AQUARIUM_FISH_PASSIVES[fId];
              selectEl.appendChild(this.el('option', { value: fId }, `${itF ? itF.name : fId} (${g.inventory[fId] || 0})${pF ? ' · ' + pF.label : ''}`));
            }
            selRow.appendChild(selectEl);
            selRow.appendChild(this.el('button', {
              class: 'btn btn-primary btn-sm',
              onclick: () => {
                const chosen = selectEl.value || fishInBag[0];
                g.exhibitFishInAquarium(i, chosen);
                this.renderModal();
              }
            }, 'Exhibir'));
            tankCard.appendChild(selRow);
          }
        }
        grid.appendChild(tankCard);
      }
      body.appendChild(grid);
    };

    // ------------------------------------------------------------------------
    // 8.2 "Legado de la Isla" Long-Term Milestone Quests Tab (Zero Emojis)
    // ------------------------------------------------------------------------
    UI.renderIslandLegacyTab = function (body) {
      const g = this.game;
      g.ensureV14State();

      let totalRanks = 0;
      const maxRanks = ISLAND_LEGACY_QUESTS.length * 5;
      for (const q of ISLAND_LEGACY_QUESTS) {
        totalRanks += (g.claimedLegacyTiers[q.id] || 0);
      }

      body.appendChild(this.el('div', {
        style: 'background:linear-gradient(135deg,#1a102e,#2d1846);border:2px solid #ffd54f;border-radius:8px;padding:12px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;'
      }, [
        this.el('div', {}, [
          this.el('div', { style: 'font-size:18px;font-weight:bold;color:#ffd54f;' }, `Crónicas del Legado de la Isla (${totalRanks}/${maxRanks} Hitos Consagrados)`),
          this.el('div', { style: 'font-size:12px;color:#e1bee7;' }, 'Hazañas monumentales a largo plazo (hasta 10,000 minerales, árboles, monstruos, peces y 100,000 recursos). Cada rango otorga pasivas permanentes.')
        ]),
        this.el('div', { style: 'background:rgba(0,0,0,0.45);border:1px solid #ffd54f;padding:6px 12px;border-radius:6px;text-align:right;' }, [
          this.el('div', { style: 'font-size:11px;color:#bdbdbd;' }, 'TÍTULO DE LEGADO ACTIVO'),
          this.el('div', { style: 'font-size:14px;font-weight:bold;color:#00e5ff;' }, g.activeLegacyTitle || 'Pionero de Abyssea')
        ])
      ]));

      for (const q of ISLAND_LEGACY_QUESTS) {
        const curTier = g.claimedLegacyTiers[q.id] || 0;
        const isMax = curTier >= q.tiers.length;
        const target = isMax ? q.tiers[q.tiers.length - 1] : q.tiers[curTier];
        const progress = Math.floor(q.getProgress(g));
        const pct = Math.min(100, Math.floor((progress / Math.max(1, target)) * 100));
        const canClaim = !isMax && progress >= target;
        const nextTitle = isMax ? q.titles[q.titles.length - 1] : q.titles[curTier];

        const card = this.el('div', {
          style: `background:linear-gradient(180deg,rgba(24,20,36,0.95),rgba(14,12,22,0.98));border:2px solid ${canClaim ? '#00e676' : q.color};border-radius:8px;padding:12px;margin-bottom:10px;`
        }, [
          this.el('div', { style: 'display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap;' }, [
            this.el('div', { style: 'display:flex;align-items:center;gap:10px;' }, [
              this.itemIcon(q.icon, 32),
              this.el('div', {}, [
                this.el('div', { style: `font-size:16px;font-weight:bold;color:${q.color};` }, `${q.title} [Rango ${curTier}/5]`),
                this.el('div', { style: 'font-size:12px;color:#b0bec5;margin-top:2px;' }, q.lore),
                this.el('div', { style: 'font-size:12px;color:#80cbc4;margin-top:3px;' }, `Bendición Permanente: ${q.passiveLabel}`)
              ])
            ]),
            this.el('div', { style: 'text-align:right;' }, [
              this.el('div', { style: 'font-size:11px;color:#ffd54f;margin-bottom:6px;' }, `Título: [${nextTitle}]`),
              isMax
                ? this.el('span', { style: 'padding:4px 10px;background:rgba(0,230,118,0.18);border:1px solid #00e676;color:#69f0ae;border-radius:4px;font-size:12px;font-weight:bold;' }, '[LEGADO COMPLETADO]')
                : this.el('button', {
                    class: canClaim ? 'btn btn-green btn-sm' : 'btn btn-stone btn-sm',
                    disabled: canClaim ? null : 'disabled',
                    onclick: () => {
                      if (g.claimLegacyTier(q.id)) this.renderModal();
                    }
                  }, canClaim ? `Reclamar Rango ${curTier + 1} (+${(curTier + 1) * 450} Oro)` : `En Progreso (${pct}%)`)
            ])
          ]),
          this.el('div', { style: 'margin-top:10px;' }, [
            this.el('div', { style: 'display:flex;justify-content:space-between;font-size:12px;color:#eceff1;margin-bottom:4px;' }, [
              this.el('span', {}, `Hito Actual: ${progress.toLocaleString()} / ${target.toLocaleString()} ${q.unit}`),
              this.el('span', {}, `Escala: ${q.tiers.join(' -> ')}`)
            ]),
            this.el('div', { style: 'height:10px;background:#0d1117;border:1px solid rgba(255,255,255,0.15);border-radius:5px;overflow:hidden;' }, [
              this.el('div', { style: `width:${pct}%;height:100%;background:${q.color};` })
            ])
          ])
        ]);
        body.appendChild(card);
      }
    };

    // ------------------------------------------------------------------------
    // 8.3 Interactive Multi-Step Alchemy Laboratory (Large 880x440 Native Pixel-Art)
    // ------------------------------------------------------------------------
    UI.renderAlchemyLab = function (body) {
      const g = this.game;
      g.ensureV14State();
      if (this._v14ActiveLoop) {
        cancelAnimationFrame(this._v14ActiveLoop);
        this._v14ActiveLoop = null;
      }

      if (!this._alchemyState) {
        this._alchemyState = {
          selectedPotionId: NEW_ALCHEMICAL_POTIONS[0].id,
          step: 0,
          mortarClicks: 0,
          solventId: 'agua_purificada',
          heatCursor: 15,
          heatVel: 58,
          distilledScore: 100,
          PestleY: 0,
          bubbles: [],
          sparks: []
        };
      }
      const st = this._alchemyState;
      const potion = NEW_ALCHEMICAL_POTIONS.find(p => p.id === st.selectedPotionId) || NEW_ALCHEMICAL_POTIONS[0];
      const meta = potion.alchemyMeta || { base: 'agua_purificada', tempZone: [0.35, 0.65], color: '#00e676', ingredients: {} };
      const pColor = meta.color || '#00e676';
      const idealHeat = [Math.round((meta.tempZone ? meta.tempZone[0] : 0.35) * 100), Math.round((meta.tempZone ? meta.tempZone[1] : 0.65) * 100)];
      if (st.step === 0) st.solventId = meta.base;

      const selectorRow = this.el('div', { style: 'display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;margin-bottom:8px;' });
      for (const p of NEW_ALCHEMICAL_POTIONS) {
        const active = p.id === potion.id;
        const owned = g.inventory[p.id] || 0;
        const col = (p.alchemyMeta && p.alchemyMeta.color) || '#00e676';
        selectorRow.appendChild(this.el('button', {
          class: 'btn btn-sm',
          style: `display:flex;align-items:center;gap:6px;padding:6px 10px;background:${active ? '#1b4332' : '#161b22'};border:2px solid ${active ? '#00e676' : col};color:#fff;`,
          onclick: () => {
            st.selectedPotionId = p.id;
            st.step = 0;
            st.mortarClicks = 0;
            body.innerHTML = '';
            this.renderAlchemyLab(body);
          }
        }, [
          this.itemIcon(p.icon, 20),
          this.el('span', { style: `font-size:12px;font-weight:bold;color:${col};` }, `${p.name} (${owned})`)
        ]));
      }

      const ingRow = this.el('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;align-items:center;' });
      let hasAllIng = true;
      for (const [ingId, reqCnt] of Object.entries(meta.ingredients)) {
        const it = Abyssea.ITEMS[ingId];
        const have = g.inventory[ingId] || 0;
        if (have < reqCnt) hasAllIng = false;
        ingRow.appendChild(this.el('span', {
          style: `display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:4px;background:rgba(0,0,0,0.55);border:1px solid ${have >= reqCnt ? '#00e676' : '#ff5252'};color:${have >= reqCnt ? '#a7f3d0' : '#ff8a80'};font-size:12px;`
        }, [
          this.itemIcon(it ? it.icon : ingId, 18),
          this.el('strong', {}, `${it ? it.name : ingId}: ${have}/${reqCnt}`)
        ]));
      }

      ingRow.appendChild(this.el('button', {
        class: 'btn btn-green btn-sm',
        onclick: () => {
          if (!hasAllIng) {
            g.toast('Te faltan reactivos para destilar esta poción.', 'warn');
            Abyssea.Audio.play('error');
            return;
          }
          for (const [ingId, reqCnt] of Object.entries(meta.ingredients)) {
            g.removeItem(ingId, reqCnt);
          }
          g.addItem(potion.id, 1);
          g.masteredPotions[potion.id] = (g.masteredPotions[potion.id] || 0) + 1;
          st.step = 0;
          st.mortarClicks = 0;
          st.distilledScore = 0;
          Abyssea.Audio.play('craft');
          g.toast(`¡Has elaborado ${potion.name} x1!`, 'success');
          body.innerHTML = '';
          this.renderAlchemyLab(body);
        }
      }, 'Destilación Rápida (x1)'));

      const topInfoCard = this.el('div', {
        style: `background:rgba(10,22,28,0.92);border:2px solid ${pColor};border-radius:8px;padding:10px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;`
      }, [
        this.el('div', { style: 'display:flex;align-items:center;gap:10px;' }, [
          this.itemIcon(potion.icon, 32),
          this.el('div', {}, [
            this.el('div', { style: `font-size:16px;font-weight:bold;color:${pColor};` }, potion.name),
            this.el('div', { style: 'font-size:12px;color:#b2dfdb;' }, potion.desc)
          ])
        ]),
        ingRow
      ]);

      const canvas = this.el('canvas', {
        width: 880,
        height: 440,
        style: 'width:100%;max-width:1180px;height:540px;image-rendering:pixelated;cursor:pointer;border-radius:4px;'
      });

      const canvasWrap = this.el('div', {
        style: `display:flex;justify-content:center;background:#080e12;border:3px solid ${pColor};border-radius:8px;padding:6px;box-shadow:inset 0 0 24px rgba(0,0,0,0.9);`
      }, [canvas]);

      const wrapper = this.el('div', { style: 'padding:6px;' }, [
        this.el('div', {}, [selectorRow, topInfoCard]),
        canvasWrap
      ]);
      body.appendChild(wrapper);

      if (!canvas.getContext) return;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      const spr = Abyssea.V14_SPRITES || {};
      const ingEntries = Object.entries(meta.ingredients);

      if (st.bubbles.length === 0) {
        for (let i = 0; i < 24; i++) {
          st.bubbles.push({
            x: 410 + Math.random() * 60,
            y: 230 + Math.random() * 40,
            r: 2 + Math.floor(Math.random() * 4),
            vy: 22 + Math.random() * 35
          });
        }
      }

      if (canvas.addEventListener) {
        canvas.addEventListener('mousedown', (ev) => {
          const rect = canvas.getBoundingClientRect();
          const mx = (ev.clientX - rect.left) * (canvas.width / rect.width);
          const my = (ev.clientY - rect.top) * (canvas.height / rect.height);

          if (!hasAllIng && st.step === 0) {
            g.toast('Reúne los ingredientes requeridos primero.', 'warn');
            Abyssea.Audio.play('error');
            return;
          }

          if (st.step === 0) {
            if (mx < 320 && my > 120) {
              st.mortarClicks++;
              st.PestleY = 18;
              Abyssea.Audio.play('hit');
              for (let i = 0; i < 16; i++) {
                st.sparks.push({
                  x: 170 + (Math.random() - 0.5) * 44,
                  y: 265 + (Math.random() - 0.5) * 18,
                  vx: (Math.random() - 0.5) * 150,
                  vy: -50 - Math.random() * 110,
                  col: pColor,
                  life: 0.45 + Math.random() * 0.3
                });
              }
              if (st.mortarClicks >= 5) {
                st.step = 1;
                Abyssea.Audio.play('craft');
              }
            }
          } else if (st.step === 1) {
            for (let i = 0; i < ALCHEMY_SOLVENTS.length; i++) {
              const sv = ALCHEMY_SOLVENTS[i];
              const fx = 335 + i * 70;
              const fy = 148;
              if (Math.hypot(mx - fx, my - fy) <= 38) {
                st.solventId = sv.id;
                st.step = 2;
                Abyssea.Audio.play('pickup');
                for (let k = 0; k < 24; k++) {
                  st.sparks.push({
                    x: 440 + (Math.random() - 0.5) * 50,
                    y: 235,
                    vx: (Math.random() - 0.5) * 140,
                    vy: -60 - Math.random() * 100,
                    col: sv.color,
                    life: 0.6
                  });
                }
                return;
              }
            }
          } else if (st.step === 2) {
            if (mx < 220 || mx > 680 || my < 80 || my > 410) return;
            const stabPad = st.solventId === 'agua_purificada' ? 8 : 0;
            const minH = Math.max(0, idealHeat[0] - stabPad);
            const maxH = Math.min(100, idealHeat[1] + stabPad);
            const cur = Math.round(st.heatCursor);
            let score = 75;
            if (cur >= minH && cur <= maxH) {
              score = 125;
              Abyssea.Audio.play('levelup');
            } else {
              Abyssea.Audio.play('craft');
            }
            if (st.solventId === meta.base) score += 25;
            if (st.solventId === 'savia_luminosa' || st.solventId === 'icor_volcanico') score += 15;
            st.distilledScore = score;
            st.step = 3;
            for (let k = 0; k < 35; k++) {
              st.sparks.push({
                x: 440,
                y: 230,
                vx: (Math.random() - 0.5) * 200,
                vy: -80 - Math.random() * 140,
                col: score >= 125 ? '#00e676' : '#ffd54f',
                life: 0.7
              });
            }
          } else if (st.step === 3) {
            if (mx < 220 || mx > 760 || my < 80 || my > 410) return;
            // Re-validate ingredients at distillation time to prevent any quick-distill dupe
            const stillHasAll = Object.entries(meta.ingredients).every(([ingId, reqCnt]) => (g.inventory[ingId] || 0) >= reqCnt);
            if (!stillHasAll) {
              g.toast('Te faltan reactivos para completar la destilación.', 'warn');
              Abyssea.Audio.play('error');
              st.step = 0;
              st.mortarClicks = 0;
              return;
            }
            for (const [ingId, reqCnt] of Object.entries(meta.ingredients)) {
              g.removeItem(ingId, reqCnt);
            }
            let yieldCount = st.distilledScore >= 135 ? 2 : 1;
            if (st.solventId === 'eter_astral' && yieldCount < 2 && Math.random() < 0.25) {
              yieldCount = 2;
            }
            g.addItem(potion.id, yieldCount);
            g.masteredPotions[potion.id] = (g.masteredPotions[potion.id] || 0) + 1;
            Abyssea.Audio.play('levelup');
            g.spawnParticles(g.player.x, g.player.y, pColor, 26);
            g.toast(`¡Alquimia completada! Recibiste ${potion.name} x${yieldCount}`, 'success');
            st.step = 0;
            st.mortarClicks = 0;
            st.distilledScore = 0;
            body.innerHTML = '';
            this.renderAlchemyLab(body);
          }
        });
      }

      let lastT = performance.now();
      const loop = (now) => {
        if (typeof document !== 'undefined' && document.body && !document.body.contains(canvas)) return;
        const dt = Math.min(0.05, (now - lastT) / 1000);
        lastT = now;
        const timeSec = now / 1000;

        if (st.step === 2) {
          st.heatCursor += st.heatVel * dt;
          if (st.heatCursor >= 100) { st.heatCursor = 100; st.heatVel = -Math.abs(st.heatVel); }
          if (st.heatCursor <= 0) { st.heatCursor = 0; st.heatVel = Math.abs(st.heatVel); }
        }
        if (st.PestleY > 0) st.PestleY = Math.max(0, st.PestleY - 90 * dt);

        ctx.clearRect(0, 0, 880, 440);
        drawNativeWorkshopRoom(ctx, 880, 440, 195, 'alchemy');

        if (spr.bookshelf && spr.bookshelf.complete && spr.bookshelf.naturalWidth > 0) {
          ctx.drawImage(spr.bookshelf, 40, 42, 128, 128);
          ctx.drawImage(spr.bookshelf, 710, 42, 128, 128);
        }
        if (spr.brazier && spr.brazier.complete && spr.brazier.naturalWidth > 0) {
          ctx.drawImage(spr.brazier, 240, 88, 72, 72);
          ctx.drawImage(spr.brazier, 565, 88, 72, 72);
        }
        drawNativeAnimatedFire(ctx, 276, 90, 44, timeSec, 1);
        drawNativeAnimatedFire(ctx, 601, 90, 44, timeSec, 4);

        ctx.fillStyle = 'rgba(7, 14, 20, 0.92)';
        ctx.fillRect(16, 10, 848, 42);
        ctx.strokeStyle = pColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(16, 10, 848, 42);

        const stepTitles = [
          `FASE 1: HAZ CLIC 5 VECES EN EL MORTERO (IZQUIERDA) PARA TRITURAR (${st.mortarClicks}/5)`,
          'FASE 2: HAZ CLIC EN UNO DE LOS 4 MATRACES DE DISOLVENTE (CENTRO) PARA VERTERLO',
          `FASE 3: HAZ CLIC EN EL CALDERO CUANDO EL TERMÓMETRO ESTÉ EN LA ZONA VERDE (${idealHeat[0]}-${idealHeat[1]} C)`,
          'FASE 4: HAZ CLIC EN EL ALAMBIQUE (DERECHA) PARA EMBOTELLAR TU ELIXIR'
        ];
        ctx.font = 'bold 14px AbysseaPixel, monospace';
        ctx.fillStyle = '#00e676';
        ctx.textAlign = 'center';
        ctx.fillText(stepTitles[st.step], 440, 36);

        // LEFT STATION: MORTAR & PESTLE
        ctx.fillStyle = '#2d1a10';
        ctx.fillRect(60, 285, 220, 24);
        ctx.fillStyle = '#1b0f09';
        ctx.fillRect(80, 309, 24, 95);
        ctx.fillRect(236, 309, 24, 95);

        if (st.step === 0) {
          ctx.strokeStyle = '#00e676';
          ctx.lineWidth = 3;
          ctx.strokeRect(70, 175, 200, 130);
        }

        ctx.fillStyle = '#546e7a';
        ctx.fillRect(120, 248, 100, 36);
        ctx.fillStyle = '#37474f';
        ctx.fillRect(132, 238, 76, 14);
        if (st.mortarClicks > 0) {
          ctx.fillStyle = pColor;
          const pw = Math.min(68, st.mortarClicks * 14);
          ctx.fillRect(170 - pw / 2, 242, pw, 8);
        }
        const pyOff = st.PestleY || 0;
        ctx.fillStyle = '#90a4ae';
        ctx.fillRect(162, 192 + pyOff, 16, 52);

        for (let i = 0; i < ingEntries.length; i++) {
          const [ingId] = ingEntries[i];
          const it = Abyssea.ITEMS[ingId];
          const ic = Abyssea.Assets && Abyssea.Assets.getItemIconCanvas ? Abyssea.Assets.getItemIconCanvas(it ? it.icon : ingId) : null;
          if (ic) {
            const ix = 115 + i * 48;
            const iy = 195 + Math.sin(timeSec * 4 + i) * 5;
            ctx.drawImage(ic, ix, iy, 32, 32);
          }
        }
        ctx.font = 'bold 13px AbysseaPixel, monospace';
        ctx.fillStyle = st.step === 0 ? '#00e676' : '#b0bec5';
        ctx.fillText(`1. MORTERO (${st.mortarClicks}/5)`, 170, 336);

        // CENTER STATION: ALCHEMY TABLE & BUBBLING CAULDRON
        if (spr.alchemyTable && spr.alchemyTable.complete && spr.alchemyTable.naturalWidth > 0) {
          ctx.drawImage(spr.alchemyTable, 345, 205, 190, 165);
        }
        drawNativeAnimatedFire(ctx, 440, 315, 64, timeSec, 2);

        for (let i = 0; i < ALCHEMY_SOLVENTS.length; i++) {
          const sv = ALCHEMY_SOLVENTS[i];
          const fx = 335 + i * 70;
          const fy = 148;
          const isIdeal = sv.id === meta.base;
          const isPicked = sv.id === st.solventId;
          ctx.fillStyle = 'rgba(10, 18, 28, 0.9)';
          ctx.fillRect(fx - 26, fy - 24, 52, 48);
          ctx.strokeStyle = (st.step === 1 && isIdeal) ? '#00e676' : (isPicked ? sv.color : '#455a64');
          ctx.lineWidth = isPicked ? 3 : 1;
          ctx.strokeRect(fx - 26, fy - 24, 52, 48);
          ctx.fillStyle = sv.color;
          ctx.fillRect(fx - 10, fy - 6, 20, 18);
          ctx.fillStyle = '#e0f7fa';
          ctx.fillRect(fx - 4, fy - 16, 8, 10);
          if (isIdeal) {
            ctx.font = '10px AbysseaPixel, monospace';
            ctx.fillStyle = '#00e676';
            ctx.fillText('IDEAL', fx, fy + 36);
          }
        }

        for (const b of st.bubbles) {
          b.y -= b.vy * dt;
          if (b.y < 195) {
            b.y = 248;
            b.x = 415 + Math.random() * 50;
          }
          ctx.fillStyle = pColor;
          ctx.fillRect(Math.round(b.x), Math.round(b.y), b.r, b.r);
        }

        const gx = 548, gy = 188, gw = 22, gh = 135;
        ctx.fillStyle = '#091016';
        ctx.fillRect(gx, gy, gw, gh);
        ctx.strokeStyle = '#90a4ae';
        ctx.lineWidth = 2;
        ctx.strokeRect(gx, gy, gw, gh);
        const [minH, maxH] = idealHeat;
        const zTop = gy + gh - (maxH / 100) * gh;
        const zH = ((maxH - minH) / 100) * gh;
        ctx.fillStyle = 'rgba(0, 230, 118, 0.45)';
        ctx.fillRect(gx + 2, zTop, gw - 4, zH);
        const curY = gy + gh - (st.heatCursor / 100) * gh;
        ctx.fillStyle = '#ffca28';
        ctx.fillRect(gx - 4, curY - 3, gw + 8, 6);

        ctx.font = 'bold 13px AbysseaPixel, monospace';
        ctx.fillStyle = (st.step === 1 || st.step === 2) ? '#00e676' : '#b0bec5';
        ctx.fillText(`2. CALDERO (${Math.round(st.heatCursor)} C)`, 440, 385);

        // RIGHT STATION: CONDENSER & POTION BOTTLE
        ctx.fillStyle = '#2d1a10';
        ctx.fillRect(625, 285, 200, 24);
        ctx.fillStyle = '#1b0f09';
        ctx.fillRect(645, 309, 24, 95);
        ctx.fillRect(785, 309, 24, 95);

        if (st.step === 3) {
          ctx.strokeStyle = '#00e676';
          ctx.lineWidth = 3;
          ctx.strokeRect(640, 165, 170, 130);
        }

        const pIcon = Abyssea.Assets && Abyssea.Assets.getItemIconCanvas ? Abyssea.Assets.getItemIconCanvas(potion.icon) : null;
        if (pIcon) {
          const bounce = st.step === 3 ? Math.sin(timeSec * 6) * 6 : 0;
          ctx.drawImage(pIcon, 685, 190 + bounce, 80, 80);
        }
        ctx.font = 'bold 13px AbysseaPixel, monospace';
        ctx.fillStyle = st.step === 3 ? '#00e676' : '#b0bec5';
        ctx.fillText(st.step === 3 ? '3. CLIC PARA EMBOTELLAR' : '3. ALAMBIQUE', 725, 336);

        for (let i = st.sparks.length - 1; i >= 0; i--) {
          const sp = st.sparks[i];
          sp.x += sp.vx * dt;
          sp.y += sp.vy * dt;
          sp.vy += 260 * dt;
          sp.life -= dt;
          if (sp.life <= 0) {
            st.sparks.splice(i, 1);
            continue;
          }
          ctx.fillStyle = sp.col;
          ctx.fillRect(Math.round(sp.x), Math.round(sp.y), 4, 4);
        }

        this._v14ActiveLoop = requestAnimationFrame(loop);
      };
      this._v14ActiveLoop = requestAnimationFrame(loop);
    };

    // ------------------------------------------------------------------------
    // 8.4 Interactive Spell Invocation & Ascension Rituals (880x440 Native Pixel-Art)
    // ------------------------------------------------------------------------
    UI.openSpellRitualModal = function (spellId, isAscension) {
      const spMap = Abyssea.SPELLS || {};
      const spell = Array.isArray(spMap) ? spMap.find(s => s.id === spellId) : spMap[spellId];
      if (!spell) return;
      this._ritualState = {
        spellId,
        isAscension: !!isAscension,
        activatedNodes: [false, false, false, false, false],
        channelProgress: 0,
        completed: false,
        autoCloseTimer: 1.0,
        particles: []
      };
      this.openModal('spell_ritual');
    };

    UI.renderSpellRitualModal = function (body) {
      const g = this.game;
      if (this._v14ActiveLoop) {
        cancelAnimationFrame(this._v14ActiveLoop);
        this._v14ActiveLoop = null;
      }
      if (this._v14ModalCleanup) {
        this._v14ModalCleanup();
        this._v14ModalCleanup = null;
      }
      const st = this._ritualState;
      if (!st) return;
      const spMap = Abyssea.SPELLS || {};
      const spell = Array.isArray(spMap) ? spMap.find(s => s.id === st.spellId) : spMap[st.spellId];
      if (!spell) return;
      const curMastery = g.getSpellLevel ? g.getSpellLevel(spell.id) : 1;
      let recipe = getSpellRitualRecipe(spell.id);
      if (st.isAscension) {
        if (typeof g.getSpellUpgradeCost === 'function') {
          const uc = g.getSpellUpgradeCost(spell.id);
          if (uc) recipe = { coins: uc.coins || 0, items: uc.items || {} };
        } else {
          const nextLvl = curMastery + 1;
          recipe = { coins: nextLvl * 140, items: { cristales_magicos: nextLvl, polvo_estelar: Math.max(1, nextLvl - 1) } };
        }
      }
      const reqCoins = recipe.coins || 0;

      const ingRow = this.el('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;' }, [
        this.el('span', {
          style: `padding:3px 9px;border-radius:4px;background:rgba(0,0,0,0.45);border:1px solid ${g.coins >= reqCoins ? '#ffd54f' : '#ff5252'};color:${g.coins >= reqCoins ? '#ffe082' : '#ff8a80'};font-size:12px;`
        }, `Oro: ${g.coins}/${reqCoins}`)
      ]);
      for (const [k, req] of Object.entries(recipe.items || {})) {
        const it = Abyssea.ITEMS[k];
        const have = g.inventory[k] || 0;
        ingRow.appendChild(this.el('span', {
          style: `display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:4px;background:rgba(0,0,0,0.45);border:1px solid ${have >= req ? '#00e676' : '#ff5252'};color:${have >= req ? '#b9f6ca' : '#ff8a80'};font-size:12px;`
        }, [
          this.itemIcon(it ? it.icon : k, 16),
          this.el('strong', {}, `${it ? it.name : k}: ${have}/${req}`)
        ]));
      }

      const headerBar = this.el('div', {
        style: 'background:rgba(18,8,34,0.92);border:2px solid #b388ff;border-radius:8px;padding:10px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;'
      }, [
        this.el('div', {}, [
          this.el('div', { style: 'font-size:16px;font-weight:bold;color:#e040fb;' },
            st.isAscension ? `Ascender ${spell.name} a Nivel ${curMastery + 1}` : `Invocar Grimorio: ${spell.name}`),
          ingRow
        ]),
        this.el('button', {
          class: 'btn btn-primary btn-sm',
          onclick: () => {
            if (this._v14ActiveLoop) cancelAnimationFrame(this._v14ActiveLoop);
            this.openModal('grimorio');
          }
        }, 'Volver al Grimorio')
      ]);

      const canvas = this.el('canvas', {
        width: 880,
        height: 440,
        style: 'width:100%;max-width:1180px;height:540px;image-rendering:pixelated;cursor:pointer;border-radius:4px;'
      });
      const canvasWrap = this.el('div', {
        style: 'display:flex;justify-content:center;background:#07030d;border:3px solid #ce93d8;border-radius:8px;padding:6px;'
      }, [canvas]);

      body.appendChild(headerBar);
      body.appendChild(canvasWrap);

      if (!canvas.getContext) return;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      const spr = Abyssea.V14_SPRITES || {};

      const cx = 440, cy = 235, radius = 148;
      const nodeLabels = ['FUEGO', 'ÉTER', 'ASTRAL', 'VACÍO', 'ALMA'];
      const nodeColors = ['#ff5252', '#00e5ff', '#ffd54f', '#e040fb', '#69f0ae'];
      const getNodes = (t) => {
        const arr = [];
        for (let i = 0; i < 5; i++) {
          const ang = -Math.PI / 2 + (i * Math.PI * 2) / 5 + Math.sin(t * 0.4) * 0.03;
          arr.push({
            x: cx + Math.cos(ang) * radius,
            y: cy + Math.sin(ang) * radius,
            label: nodeLabels[i],
            color: nodeColors[i]
          });
        }
        return arr;
      };

      let isHoldingCenter = false;
      const completeRitual = () => {
        if (st.isAscension) {
          if (g.upgradeSpell && !g.upgradeSpell(spell.id)) return false;
        } else {
          if (g.coins < reqCoins) {
            g.toast('Oro insuficiente para la ofrenda ritual.', 'warn');
            return false;
          }
          for (const [k, req] of Object.entries(recipe.items || {})) {
            if ((g.inventory[k] || 0) < req) {
              g.toast('Faltan catalizadores para el ritual.', 'warn');
              return false;
            }
          }
          g.coins -= reqCoins;
          for (const [k, req] of Object.entries(recipe.items || {})) {
            g.removeItem(k, req);
          }
          if (!g.unlockedSpells.includes(spell.id)) g.unlockedSpells.push(spell.id);
          g.toast(`¡Ritual consumado! Has desbloqueado el hechizo ${spell.name}.`, 'success');
        }
        Abyssea.Audio.play('levelup');
        g.spawnShockwave(g.player.x, g.player.y, 180, '#e040fb');
        g.spawnParticles(g.player.x, g.player.y, '#00e5ff', 42);
        return true;
      };

      if (canvas.addEventListener) {
        canvas.addEventListener('mousedown', (ev) => {
          if (st.completed) return;
          const rect = canvas.getBoundingClientRect();
          const mx = (ev.clientX - rect.left) * (canvas.width / rect.width);
          const my = (ev.clientY - rect.top) * (canvas.height / rect.height);
          const nodes = getNodes(performance.now() / 1000);

          for (let i = 0; i < 5; i++) {
            const d = Math.hypot(mx - nodes[i].x, my - nodes[i].y);
            if (d <= 44 && !st.activatedNodes[i]) {
              st.activatedNodes[i] = true;
              Abyssea.Audio.play('magic');
              for (let k = 0; k < 24; k++) {
                st.particles.push({
                  x: nodes[i].x,
                  y: nodes[i].y,
                  vx: (Math.random() - 0.5) * 180,
                  vy: (Math.random() - 0.5) * 180,
                  color: nodes[i].color,
                  life: 0.7
                });
              }
              return;
            }
          }

          if (st.activatedNodes.every(Boolean)) {
            if (Math.hypot(mx - cx, my - cy) <= 72) {
              isHoldingCenter = true;
              st.channelProgress = Math.min(100, st.channelProgress + 38);
              Abyssea.Audio.play('magic');
            }
          }
        });
      }

      const onWindowMouseUp = () => { isHoldingCenter = false; };
      if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('mouseup', onWindowMouseUp);
        this._v14ModalCleanup = () => {
          window.removeEventListener('mouseup', onWindowMouseUp);
        };
      }

      let lastT = performance.now();
      const loop = (now) => {
        if (typeof document !== 'undefined' && document.body && !document.body.contains(canvas)) return;
        const dt = Math.min(0.05, (now - lastT) / 1000);
        lastT = now;
        const t = now / 1000;
        const allLit = st.activatedNodes.every(Boolean);

        if (allLit && isHoldingCenter && !st.completed) {
          st.channelProgress = Math.min(100, st.channelProgress + 75 * dt);
        }

        if (st.channelProgress >= 100 && !st.completed) {
          st.completed = true;
          if (!completeRitual()) {
            st.completed = false;
            st.channelProgress = 0;
          }
        }

        if (st.completed) {
          st.autoCloseTimer -= dt;
          if (st.autoCloseTimer <= 0) {
            if (this._v14ActiveLoop) cancelAnimationFrame(this._v14ActiveLoop);
            this.closeModal();
            return;
          }
        }

        ctx.clearRect(0, 0, 880, 440);
        drawNativeWorkshopRoom(ctx, 880, 440, 140, 'ritual');

        if (spr.runeCircle && spr.runeCircle.complete && spr.runeCircle.naturalWidth > 0) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(t * (allLit ? 0.8 : 0.25));
          ctx.drawImage(spr.runeCircle, -165, -165, 330, 330);
          ctx.restore();
        }

        const nodes = getNodes(t);
        const starOrder = [0, 2, 4, 1, 3, 0];
        ctx.beginPath();
        for (let i = 0; i < starOrder.length; i++) {
          const n = nodes[starOrder[i]];
          if (i === 0) ctx.moveTo(n.x, n.y);
          else ctx.lineTo(n.x, n.y);
        }
        ctx.strokeStyle = allLit ? '#00e5ff' : 'rgba(224, 64, 251, 0.45)';
        ctx.lineWidth = allLit ? 3 : 2;
        ctx.stroke();

        for (let i = 0; i < 5; i++) {
          const n = nodes[i];
          const lit = st.activatedNodes[i];
          if (spr.runePillar && spr.runePillar.complete && spr.runePillar.naturalWidth > 0) {
            ctx.drawImage(spr.runePillar, Math.round(n.x - 36), Math.round(n.y - 44), 72, 72);
          } else {
            ctx.fillStyle = '#1a0933';
            ctx.fillRect(n.x - 24, n.y - 24, 48, 48);
          }
          if (lit) {
            drawNativeAnimatedFire(ctx, n.x, n.y - 16, 48, t, i);
            ctx.strokeStyle = n.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo((n.x + cx) / 2 + Math.sin(t * 25 + i) * 8, (n.y + cy) / 2 + Math.cos(t * 25 + i) * 8);
            ctx.lineTo(cx, cy);
            ctx.stroke();
          }
          ctx.font = 'bold 12px AbysseaPixel, monospace';
          ctx.fillStyle = lit ? n.color : '#ce93d8';
          ctx.textAlign = 'center';
          ctx.fillText(lit ? `[${n.label} ACTIVO]` : `[CLIC: ${n.label}]`, n.x, n.y + 42);
        }

        if (spr.sorceryTable && spr.sorceryTable.complete && spr.sorceryTable.naturalWidth > 0) {
          ctx.drawImage(spr.sorceryTable, cx - 48, cy - 48, 96, 96);
        }
        ctx.strokeStyle = allLit ? '#00e676' : '#ffd54f';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx, cy, 52, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * (st.channelProgress / 100)));
        ctx.stroke();

        ctx.fillStyle = 'rgba(10, 4, 20, 0.92)';
        ctx.fillRect(20, 10, 840, 38);
        ctx.strokeStyle = '#ce93d8';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 10, 840, 38);
        ctx.font = 'bold 14px AbysseaPixel, monospace';
        ctx.fillStyle = allLit ? '#00e676' : '#ffd54f';
        ctx.textAlign = 'center';
        ctx.fillText(
          st.completed
            ? (st.isAscension
              ? `RITUAL CONSUMADO: ${spell.name.toUpperCase()} ASCENDIDO A NV.${curMastery + 1}`
              : `RITUAL CONSUMADO: ${spell.name.toUpperCase()} DESBLOQUEADO`)
            : (allLit ? `PILARES ENCENDIDOS — HAZ CLIC EN EL ALTAR CENTRAL (${Math.round(st.channelProgress)}%)` : `FASE 1: HAZ CLIC EN LOS 5 PILARES RÚNICOS PARA ENCENDERLOS (${st.activatedNodes.filter(Boolean).length}/5)`),
          440, 34
        );

        for (let i = st.particles.length - 1; i >= 0; i--) {
          const p = st.particles[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.life -= dt;
          if (p.life <= 0) {
            st.particles.splice(i, 1);
            continue;
          }
          ctx.fillStyle = p.color;
          ctx.fillRect(Math.round(p.x), Math.round(p.y), 4, 4);
        }

        this._v14ActiveLoop = requestAnimationFrame(loop);
      };
      this._v14ActiveLoop = requestAnimationFrame(loop);
    };

    // ------------------------------------------------------------------------
    // 8.5 Runic Constellation Enchanting Altar (Native Pixel-Art, Zero Emojis)
    // ------------------------------------------------------------------------
    UI.renderRunicEnchantingAltar = function (body, tKind, tId, table, curLevels, usedSlots, maxSlots, tableTier) {
      if (this._v14EnchantLoop) {
        cancelAnimationFrame(this._v14EnchantLoop);
        this._v14EnchantLoop = null;
      }

      const badge = this.el('span', {
        style: 'padding:3px 10px;border-radius:4px;background:rgba(224,64,251,0.18);border:1px solid #e040fb;color:#f3e5f5;font-size:12px;font-weight:bold;'
      }, `Armonía Rúnica: ${(this._enchantHarmonyCharge || 0)}%`);

      const canvas = this.el('canvas', {
        width: 820,
        height: 230,
        style: 'width:100%;max-width:1180px;height:320px;image-rendering:pixelated;cursor:pointer;border-radius:4px;'
      });

      const holder = this.el('div', {
        style: 'margin:8px 0 12px 0;background:#080512;border:2px solid #b388ff;border-radius:8px;padding:8px;'
      }, [
        this.el('div', { style: 'display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;flex-wrap:wrap;gap:6px;' }, [
          this.el('div', {}, [
            this.el('span', { style: 'font-size:15px;font-weight:bold;color:#e040fb;' }, `Altar de Constelación Rúnica (Nivel ${tableTier})`),
            this.el('span', { style: 'font-size:12px;color:#b39ddb;margin-left:8px;' }, 'Haz clic en el círculo central cuando el pulso áureo coincida para cargar Armonía Rúnica.')
          ]),
          badge
        ]),
        this.el('div', { style: 'display:flex;justify-content:center;' }, [canvas])
      ]);

      body.appendChild(holder);

      if (!canvas.getContext) return;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      const spr = Abyssea.V14_SPRITES || {};

      let pulseR = 15;
      const targetR = 64;
      const sparks = [];

      let iconCanvas = null;
      if (tKind === 'tool' && Abyssea.Assets && Abyssea.Assets.getToolIconCanvas) {
        iconCanvas = Abyssea.Assets.getToolIconCanvas(tId, (this.game.toolTiers && this.game.toolTiers[tId]) || 'basica');
      } else if (tId && Abyssea.ITEMS[tId] && Abyssea.Assets && Abyssea.Assets.getItemIconCanvas) {
        iconCanvas = Abyssea.Assets.getItemIconCanvas(Abyssea.ITEMS[tId].icon);
      }

      if (canvas.addEventListener) {
        canvas.addEventListener('mousedown', () => {
          const diff = Math.abs(pulseR - targetR);
          const gain = diff < 16 ? 35 : 20;
          this._enchantHarmonyCharge = Math.min(100, (this._enchantHarmonyCharge || 0) + gain);
          Abyssea.Audio.play('magic');
          badge.textContent = `Armonía Rúnica: ${this._enchantHarmonyCharge}% ${this._enchantHarmonyCharge >= 100 ? '[LISTO]' : ''}`;
          for (let i = 0; i < 24; i++) {
            sparks.push({
              x: 410,
              y: 115,
              vx: (Math.random() - 0.5) * 200,
              vy: (Math.random() - 0.5) * 200,
              color: diff < 16 ? '#00e676' : '#e040fb',
              life: 0.6
            });
          }
        });
      }

      const activeEntries = Object.entries(curLevels || {}).filter(([, lvl]) => lvl > 0);
      let lastT = performance.now();
      const loop = (now) => {
        if (typeof document !== 'undefined' && document.body && !document.body.contains(canvas)) return;
        const dt = Math.min(0.05, (now - lastT) / 1000);
        lastT = now;
        const t = now / 1000;

        pulseR += 52 * dt;
        if (pulseR > 92) pulseR = 14;

        ctx.clearRect(0, 0, 820, 230);
        drawNativeWorkshopRoom(ctx, 820, 230, 95, 'ritual');

        const cx = 410, cy = 120;
        if (spr.runeCircle && spr.runeCircle.complete && spr.runeCircle.naturalWidth > 0) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(t * 0.45);
          ctx.drawImage(spr.runeCircle, -95, -95, 190, 190);
          ctx.restore();
        }

        ctx.strokeStyle = 'rgba(0, 229, 255, 0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, targetR, 0, Math.PI * 2);
        ctx.stroke();

        const isSweet = Math.abs(pulseR - targetR) < 15;
        ctx.strokeStyle = isSweet ? '#00e676' : '#ffd54f';
        ctx.lineWidth = isSweet ? 4 : 2;
        ctx.beginPath();
        ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
        ctx.stroke();

        const totalNodes = Math.max(maxSlots, activeEntries.length, 4);
        for (let i = 0; i < totalNodes; i++) {
          const ang = t * 0.7 + (i * Math.PI * 2) / totalNodes;
          const nx = cx + Math.cos(ang) * 145;
          const ny = cy + Math.sin(ang) * 72;
          const ench = activeEntries[i];
          ctx.strokeStyle = ench ? '#e040fb' : 'rgba(255,255,255,0.18)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(nx, ny);
          ctx.stroke();

          ctx.fillStyle = ench ? '#4a148c' : '#120b1d';
          ctx.fillRect(Math.round(nx - 14), Math.round(ny - 14), 28, 28);
          ctx.strokeRect(Math.round(nx - 14), Math.round(ny - 14), 28, 28);
          if (ench && table) {
            const def = table[ench[0]];
            ctx.font = '11px AbysseaPixel, monospace';
            ctx.fillStyle = '#ffe082';
            ctx.textAlign = 'center';
            ctx.fillText(`${def ? def.name : ench[0]} Nv.${ench[1]}`, nx, ny - 20);
          }
        }

        if (iconCanvas) {
          ctx.drawImage(iconCanvas, cx - 28, cy - 28 + Math.sin(t * 3) * 3, 56, 56);
        }

        for (let i = sparks.length - 1; i >= 0; i--) {
          const p = sparks[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.life -= dt;
          if (p.life <= 0) {
            sparks.splice(i, 1);
            continue;
          }
          ctx.fillStyle = p.color;
          ctx.fillRect(Math.round(p.x), Math.round(p.y), 4, 4);
        }

        this._v14EnchantLoop = requestAnimationFrame(loop);
      };
      this._v14EnchantLoop = requestAnimationFrame(loop);
    };

    // ------------------------------------------------------------------------
    // 8.6 Same-Tier Material Reforge Station & Tab (Clean Normal Recipe UI)
    // ------------------------------------------------------------------------
    UI.renderReforgeTab = function (body) {
      const g = this.game;
      g.ensureV14State();

      const probRow = this.el('div', { style: 'display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;' });
      for (const r of Object.values(GEAR_RARITIES)) {
        probRow.appendChild(this.el('span', {
          style: `padding:3px 8px;border-radius:4px;font-size:11px;font-weight:bold;background:${r.bg};color:${r.color};border:1px solid ${r.border};`
        }, `[${r.name.toUpperCase()}: ${r.chanceLabel}]`));
      }

      body.appendChild(this.el('div', {
        class: 'card',
        style: 'margin-bottom:12px;border-color:#ff9100;'
      }, [
        this.el('strong', { style: 'font-size:17px;color:#ffd54f;' }, 'Mesa de Reforja — Rareza de Equipo'),
        this.el('div', { style: 'font-size:13px;color:#ffe0b2;margin-top:4px;line-height:1.45;' },
          'Reforja tus herramientas y armas consumiendo material de su MISMO TIER. Al subir de Tier una herramienta, su rareza se vuelve a aleatorizar automáticamente.'),
        probRow
      ]));

      const entries = [];
      for (const [tId, tier] of Object.entries(g.toolTiers || {})) {
        if (!tier) continue;
        const r = g.getGearRarity('tool', tId);
        const cost = g.getReforgeCost('tool', tId);
        const def = Abyssea.TOOLS && Abyssea.TOOLS[tId];
        const tierMeta = (Abyssea.TIER_META && Abyssea.TIER_META[tier]) || { name: tier };
        const matKey = Object.keys(cost.items)[0];
        const matQty = cost.items[matKey];
        entries.push({
          kind: 'tool',
          id: tId,
          tier,
          tierName: tierMeta.name || tier,
          name: def ? `${def.name} (${tierMeta.name || tier})` : `${tId} (${tier})`,
          icon: tId,
          rarity: r,
          matId: matKey,
          matCount: matQty,
          gold: cost.coins
        });
      }

      for (const [itemId, cnt] of Object.entries(g.inventory || {})) {
        if (cnt <= 0) continue;
        const it = Abyssea.ITEMS[itemId];
        const isWeapon = it && (
          it.category === 'armas' || it.category === 'armas_especiales' || it.cat === 'weapon' ||
          it.isRangedWeapon || it.isStaffWeapon || it.isSpecialBlade || it.weaponMelee || it.isLaserWeapon
        );
        if (!isWeapon) continue;
        const r = g.getGearRarity('weapon', itemId);
        const cost = g.getReforgeCost('weapon', itemId);
        const matKey = Object.keys(cost.items)[0];
        const matQty = cost.items[matKey];
        entries.push({
          kind: 'weapon',
          id: itemId,
          tier: it.tier ? `T${it.tier}` : 'Especial',
          tierName: it.tier ? `Tier ${it.tier}` : 'Especial',
          name: it.name,
          icon: it.icon || itemId,
          rarity: r,
          matId: matKey,
          matCount: matQty,
          gold: cost.coins
        });
      }

      // RC2: Rarity Preservation Toggle Banner (preserve Legendary/Mythic/Singular rarity when upgrading tool tiers!)
      const catCount = g.inventory.catalizador_reforja || 0;
      body.appendChild(this.el('div', {
        style: 'background:linear-gradient(135deg,rgba(24,20,48,0.95),rgba(14,32,54,0.95));border:1.5px solid #00e5ff;border-radius:8px;padding:10px 12px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;'
      }, [
        this.el('div', {}, [
          this.el('strong', { style: 'color:#00e5ff;font-size:14px;' }, `Preservación de Rareza al Mejorar Tier (Catalizadores: ${catCount})`),
          this.el('div', { style: 'font-size:12px;color:#b8d4ec;' }, 'Si está activo y tienes 1x Catalizador de Reforja, tus herramientas Legendarias/Míticas/Singulares conservan su rareza al subir de Tier.')
        ]),
        this.el('button', {
          class: `btn btn-sm ${g.preserveRarityMode ? 'btn-green' : 'btn-stone'}`,
          onclick: () => {
            g.preserveRarityMode = !g.preserveRarityMode;
            g.toast(g.preserveRarityMode
              ? 'Preservación de Rareza ACTIVADA (consumirá 1 Catalizador de Reforja al mejorar una herramienta rara+).'
              : 'Preservación de Rareza desactivada.', 'info');
            this.renderModal();
          }
        }, g.preserveRarityMode ? 'Preservar Rareza: ACTIVO' : 'Preservar Rareza: OFF')
      ]));

      const grid = this.el('div', { class: 'grid-cards' });
      for (const e of entries) {
        const matItem = Abyssea.ITEMS[e.matId];
        const haveMat = g.inventory[e.matId] || 0;
        const canAfford = haveMat >= e.matCount && g.coins >= e.gold;
        const canCatalyst = catCount >= 1 && g.coins >= e.gold;
        const iconNode = e.kind === 'tool' && typeof this.toolIcon === 'function'
          ? this.toolIcon(e.id, e.tier, 34)
          : this.itemIcon(e.icon, 34);

        const card = this.el('div', {
          class: 'card',
          style: `border-color:${e.rarity.border};`
        }, [
          this.el('div', { class: 'card-head' }, [
            iconNode,
            this.el('div', {}, [
              this.el('div', { style: 'display:flex;align-items:center;gap:6px;flex-wrap:wrap;' }, [
                this.el('strong', { style: `color:${e.rarity.color};` }, e.name),
                this.renderGearRarityBadge(e.rarity.id)
              ]),
              this.el('div', { style: 'font-size:12px;color:#b0bec5;' }, e.kind === 'tool' ? `Material del Tier ${e.tierName}` : `Arma (${e.tierName})`)
            ])
          ]),
          this.el('div', { style: 'font-size:13px;color:#a7f3d0;' }, e.rarity.desc),
          this.el('div', { style: 'font-size:14px;line-height:1.48;' }, [
            this.el('div', { style: `color:${g.coins >= e.gold ? '#ffd54f' : '#ff8a65'};` }, `Oro: ${g.coins}/${e.gold}`),
            this.el('div', { style: `display:flex;align-items:center;gap:5px;color:${haveMat >= e.matCount ? '#81c784' : '#ff8a65'};` }, [
              this.itemIcon(matItem ? matItem.icon : e.matId, 16),
              this.el('span', {}, `${matItem ? matItem.name : e.matId}: ${haveMat}/${e.matCount}`)
            ])
          ]),
          this.el('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;' }, [
            this.el('button', {
              class: canAfford ? 'btn btn-gold btn-sm' : 'btn btn-stone btn-sm',
              disabled: canAfford ? null : 'disabled',
              onclick: () => {
                if (g.reforgeGear(e.kind, e.id, 0)) {
                  this.renderModal();
                }
              }
            }, `Reforjar`),
            this.el('button', {
              class: canCatalyst ? 'btn btn-primary btn-sm' : 'btn btn-stone btn-sm',
              disabled: canCatalyst ? null : 'disabled',
              title: 'Consume 1 Catalizador de Reforja + Oro para garantizar tirada Épica o superior (+50% prob. Mítica/Singular)',
              onclick: () => {
                if ((g.inventory.catalizador_reforja || 0) < 1 || g.coins < e.gold) return;
                g.coins -= e.gold;
                g.removeItem('catalizador_reforja', 1);
                g.stats.reforgedTotal = (g.stats.reforgedTotal || 0) + 1;
                // Catalyst grants +50% Mythic/Singular odds & guarantees Epic+ rarity (no inflated 4% Singular rate)
                let rolledId = rollGearRarityId(0.50);
                if (['comun', 'no_comun', 'raro'].includes(rolledId)) {
                  const pr = Math.random();
                  rolledId = pr < 0.0015 ? 'singular' : pr < 0.0165 ? 'mitico' : pr < 0.22 ? 'legendario' : 'epico';
                }
                if (e.kind === 'tool') g.toolRarities[e.id] = rolledId;
                else g.weaponRarities[e.id] = rolledId;
                g.recomputeModifiers();
                const finalR = g.getGearRarity(e.kind, e.id);
                if (g.addFloatingText && g.player && finalR) {
                  g.addFloatingText(g.player.x, g.player.y - 36, `[${finalR.name.toUpperCase()}]`, finalR.color);
                }
                Abyssea.Audio.play('levelup');
                g.toast(`¡Reforja Catalizada en ${e.name}! Rareza garantizada: ${finalR.name} — ${finalR.desc}`, 'success');
                this.renderModal();
              }
            }, `Catalizar (${catCount})`)
          ])
        ]);
        grid.appendChild(card);
      }
      body.appendChild(grid);
    };
  }

  attachUIV14();
})();
