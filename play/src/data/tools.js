(function () {
  'use strict';

  const Abyssea = (window.Abyssea = window.Abyssea || {});

  const TIER_ORDER = [
    'basica', 'mejorada', 'cobre', 'hierro', 'plata',
    'oro', 'platino', 'acero', 'cristal', 'mitrilo',
    'titanio', 'adamantita', 'oricalco',
    'coral', 'boreal', 'selvano', 'escoria', 'pirita', 'glaciar', 'maldito',
    'legendaria', 'celestial', 'omega'
  ];

  const TIER_META = {
    basica:     { id: 'basica',     name: 'Básica',            color: '#b0bec5', mult: 0.55, speed: 0.72, rareBonus: 0.00, rarity: 'comun' },
    mejorada:   { id: 'mejorada',   name: 'Mejorada',          color: '#81c784', mult: 0.95, speed: 0.92, rareBonus: 0.04, rarity: 'poco_comun' },
    cobre:      { id: 'cobre',      name: 'De Cobre',          color: '#ffab91', mult: 1.45, speed: 1.08, rareBonus: 0.08, rarity: 'poco_comun' },
    hierro:     { id: 'hierro',     name: 'De Hierro',         color: '#90caf9', mult: 2.05, speed: 1.16, rareBonus: 0.14, rarity: 'poco_comun' },
    plata:      { id: 'plata',      name: 'De Plata',          color: '#cfd8dc', mult: 3.10, speed: 1.28, rareBonus: 0.20, rarity: 'raro' },
    oro:        { id: 'oro',        name: 'De Oro',            color: '#ffd54f', mult: 4.10, speed: 1.44, rareBonus: 0.26, rarity: 'raro' },
    platino:    { id: 'platino',    name: 'De Platino',        color: '#80deea', mult: 5.10, speed: 1.58, rareBonus: 0.33, rarity: 'raro' },
    acero:      { id: 'acero',      name: 'De Acero Azul',     color: '#64b5f6', mult: 6.20, speed: 1.76, rareBonus: 0.40, rarity: 'epico' },
    cristal:    { id: 'cristal',    name: 'De Cristal',        color: '#ce93d8', mult: 7.45, speed: 1.94, rareBonus: 0.47, rarity: 'epico' },
    mitrilo:    { id: 'mitrilo',    name: 'De Mitrilo',        color: '#4dd0e1', mult: 8.85, speed: 2.12, rareBonus: 0.55, rarity: 'epico' },
    titanio:    { id: 'titanio',    name: 'De Titanio',        color: '#b0bec5', mult: 10.4, speed: 2.30, rareBonus: 0.63, rarity: 'epico' },
    adamantita: { id: 'adamantita', name: 'De Adamantita',     color: '#66bb6a', mult: 12.2, speed: 2.48, rareBonus: 0.72, rarity: 'legendario' },
    oricalco:   { id: 'oricalco',   name: 'De Oricalco',       color: '#ff7043', mult: 14.4, speed: 2.68, rareBonus: 0.80, rarity: 'legendario' },
    coral:      { id: 'coral',      name: 'Coralina',          color: '#4deeea', mult: 16.0, speed: 2.78, rareBonus: 0.84, rarity: 'legendario' },
    boreal:     { id: 'boreal',     name: 'De Cristal Boreal', color: '#80deea', mult: 17.6, speed: 2.88, rareBonus: 0.88, rarity: 'legendario' },
    selvano:    { id: 'selvano',    name: 'Selvana de Jade',   color: '#69f0ae', mult: 19.3, speed: 2.98, rareBonus: 0.92, rarity: 'legendario' },
    escoria:    { id: 'escoria',    name: 'De Escoria Ígnea',  color: '#ff6d00', mult: 21.1, speed: 3.08, rareBonus: 0.96, rarity: 'legendario' },
    pirita:     { id: 'pirita',     name: 'De Pirita Solar',   color: '#ffd54f', mult: 23.0, speed: 3.18, rareBonus: 1.00, rarity: 'legendario' },
    glaciar:    { id: 'glaciar',    name: 'Glacial Eterna',    color: '#4fc3f7', mult: 25.0, speed: 3.28, rareBonus: 1.05, rarity: 'legendario' },
    maldito:    { id: 'maldito',    name: 'De Plata Maldita',  color: '#ba68c8', mult: 27.2, speed: 3.40, rareBonus: 1.10, rarity: 'legendario' },
    legendaria: { id: 'legendaria', name: 'Legendaria',        color: '#ffb74d', mult: 30.0, speed: 3.55, rareBonus: 1.18, rarity: 'legendario' },
    celestial:  { id: 'celestial',  name: 'Celestial',         color: '#29b6f6', mult: 33.5, speed: 3.72, rareBonus: 1.28, rarity: 'legendario' },
    omega:      { id: 'omega',      name: 'Omega',             color: '#e040fb', mult: 40.0, speed: 4.10, rareBonus: 1.50, rarity: 'legendario' }
  };

  const TOOLS = {
    pico: {
      id: 'pico', name: 'Pico', key: '1', role: 'Minar rocas, minerales, cristales y obsidiana',
      anim: 'pickaxe', basePower: 4, swingRate: 0.96, baseRange: 74, energyCost: 2,
      tierCosts: {
        mejorada:   { coins: 35,   items: { madera: 8, piedra: 10 } },
        cobre:      { coins: 75,   items: { madera: 10, lingote_cobre: 5 } },
        hierro:     { coins: 135,  items: { tablon: 8, lingote_hierro: 6 } },
        plata:      { coins: 210,  items: { tablon: 10, lingote_plata: 5, malaquita_pradera: 2 } },
        oro:        { coins: 320,  items: { tablon: 10, lingote_oro: 6, carbon: 8 } },
        platino:    { coins: 480,  items: { lingote_platino: 6, jade: 2, lingote_bronce: 4 } },
        acero:      { coins: 640,  items: { lingote_acero: 7, esquirla_hielo: 3, azurita_glacial: 2 } },
        cristal:    { coins: 860,  items: { lingote_acero: 8, cristales: 8, amatista: 2, cristales_magicos: 3 } },
        mitrilo:    { coins: 1180, items: { lingotes_especiales: 6, sanguinaria: 3, lingote_platino: 4 } },
        titanio:    { coins: 1520, items: { lingote_titanio: 5, arena_estelar: 4, ambar_desierto: 2 } },
        adamantita: { coins: 1920, items: { lingote_adamantita: 20, diamantes: 12, material_volcanico: 24 } },
        oricalco:   { coins: 2350,  items: { lingote_oricalco: 24, obsidiana_refinada: 14, esencia_magma: 8 } },
        coral:      { coins: 2700,  items: { lingote_coral: 14, placa_coral: 4, perla_turquesa: 6 } },
        boreal:     { coins: 3100,  items: { lingote_boreal: 16, placa_boreal: 4, celestita_cristal: 6 } },
        selvano:    { coins: 3550,  items: { lingote_selvano: 16, placa_selvano: 5, jade_ancestral: 6 } },
        escoria:    { coins: 4050,  items: { lingote_escoria: 18, placa_escoria: 5, esencia_magma: 10 } },
        pirita:     { coins: 4600,  items: { lingote_pirita: 18, placa_pirita: 6, agata_roja: 6 } },
        glaciar:    { coins: 5200,  items: { hielo_eterno: 12, bismuto_astral: 6, placa_boreal: 6, resina_toxica: 6 } },
        maldito:    { coins: 5850,  items: { lingote_maldito: 18, placa_maldito: 6, cristal_carmesi: 6, lingote_hueso: 10 } },
        legendaria: { coins: 6600,  items: { lingote_celestial: 20, polvo_estelar: 14, escamas_dragon: 10, cristal_carmesi: 6 } },
        celestial:  { coins: 8200,  items: { lingote_celestial: 30, gema_alma: 12, runa_tierra: 10, fragmentos_antiguos: 18, bismuto_astral: 8 } },
        omega:      { coins: 18000, items: { lingote_omega: 8, singularidad: 2, materia_comprimida: 3, lingote_maldito: 12, lingote_pirita: 12, cristal_carmesi: 8 }, reqOmega: 'omega_equipo' }
      }
    },
    hacha: {
      id: 'hacha', name: 'Hacha', key: '2', role: 'Talar árboles comunes, gigantes y golpe pesado en combate',
      anim: 'axe', basePower: 5, swingRate: 0.68, baseRange: 76, energyCost: 2.5,
      tierCosts: {
        mejorada:   { coins: 30,   items: { madera: 10, piedra: 6 } },
        cobre:      { coins: 70,   items: { madera: 10, lingote_cobre: 4 } },
        hierro:     { coins: 125,  items: { tablon: 8, lingote_hierro: 5 } },
        plata:      { coins: 195,  items: { tablon: 10, lingote_plata: 4, malaquita_pradera: 2 } },
        oro:        { coins: 295,  items: { tablon: 12, lingote_oro: 5, cobre: 6 } },
        platino:    { coins: 450,  items: { lingote_platino: 5, jade: 2, tablon: 12 } },
        acero:      { coins: 610,  items: { lingote_acero: 6, azurita_glacial: 2, tablon: 12 } },
        cristal:    { coins: 820,  items: { lingote_acero: 6, cristales: 7, esmeraldas: 2 } },
        mitrilo:    { coins: 1120, items: { lingotes_especiales: 5, sanguinaria: 2, esencia_oscura: 4 } },
        titanio:    { coins: 1460, items: { lingote_titanio: 5, ambar_desierto: 2, cristales_magicos: 3 } },
        adamantita: { coins: 1840, items: { lingote_adamantita: 20, diamantes: 12, esencia_oscura: 20 } },
        oricalco:   { coins: 2240,  items: { lingote_oricalco: 24, cristal_abismal: 10, esencia_magma: 8 } },
        coral:      { coins: 2600,  items: { lingote_coral: 12, placa_coral: 4, perla_turquesa: 5 } },
        boreal:     { coins: 3000,  items: { lingote_boreal: 14, placa_boreal: 4, celestita_cristal: 5 } },
        selvano:    { coins: 3450,  items: { lingote_selvano: 16, placa_selvano: 5, madera_ferrea: 14, jade_ancestral: 5 } },
        escoria:    { coins: 3950,  items: { lingote_escoria: 16, placa_escoria: 5, esencia_magma: 8 } },
        pirita:     { coins: 4500,  items: { lingote_pirita: 16, placa_pirita: 5, agata_roja: 6 } },
        glaciar:    { coins: 5100,  items: { hielo_eterno: 12, bismuto_astral: 6, placa_selvano: 5, resina_toxica: 6 } },
        maldito:    { coins: 5750,  items: { lingote_maldito: 16, placa_maldito: 6, lingote_hueso: 10, cristal_carmesi: 6 } },
        legendaria: { coins: 6400,  items: { lingote_celestial: 20, polvo_estelar: 12, rubi: 12, cristal_carmesi: 6 } },
        celestial:  { coins: 7900,  items: { lingote_celestial: 30, gema_alma: 12, runa_vida: 10, fragmentos_antiguos: 16, bismuto_astral: 8 } },
        omega:      { coins: 17000, items: { lingote_omega: 8, singularidad: 2, materia_comprimida: 3, lingote_maldito: 12, madera_ferrea: 18, cristal_carmesi: 8 }, reqOmega: 'omega_equipo' }
      }
    },
    espada: {
      id: 'espada', name: 'Espada', key: '3', role: 'Combate cuerpo a cuerpo equilibrado con amplio arco de corte',
      anim: 'sword', basePower: 6, swingRate: 1.08, baseRange: 78, energyCost: 2.5,
      tierCosts: {
        mejorada:   { coins: 45,   items: { piedra: 10, madera: 6, fibra_vegetal: 4 } },
        cobre:      { coins: 90,   items: { lingote_cobre: 6, cuero: 3 } },
        hierro:     { coins: 155,  items: { lingote_hierro: 8, cuero: 4 } },
        plata:      { coins: 235,  items: { lingote_plata: 6, cuero: 4, malaquita_pradera: 2 } },
        oro:        { coins: 345,  items: { lingote_oro: 7, lingote_hierro: 6 } },
        platino:    { coins: 530,  items: { lingote_platino: 7, jade: 2, cuero: 5 } },
        acero:      { coins: 710,  items: { lingote_acero: 8, azurita_glacial: 3, esquirla_hielo: 2 } },
        cristal:    { coins: 920,  items: { lingote_acero: 8, cristales_magicos: 6, huesos: 8 } },
        mitrilo:    { coins: 1280, items: { lingotes_especiales: 6, sanguinaria: 4, amatista: 3 } },
        titanio:    { coins: 1640, items: { lingote_titanio: 6, ambar_desierto: 3, arena_estelar: 4 } },
        adamantita: { coins: 2050, items: { lingote_adamantita: 22, diamantes: 14, fragmentos_antiguos: 12 } },
        oricalco:   { coins: 2480,  items: { lingote_oricalco: 26, esencia_magma: 10, cristal_abismal: 12 } },
        coral:      { coins: 2850,  items: { lingote_coral: 14, placa_coral: 5, perla_turquesa: 6 } },
        boreal:     { coins: 3250,  items: { lingote_boreal: 16, placa_boreal: 5, celestita_cristal: 6 } },
        selvano:    { coins: 3750,  items: { lingote_selvano: 18, placa_selvano: 6, jade_ancestral: 6 } },
        escoria:    { coins: 4300,  items: { lingote_escoria: 18, placa_escoria: 6, polvo_carmesi: 6 } },
        pirita:     { coins: 4900,  items: { lingote_pirita: 20, placa_pirita: 6, agata_roja: 8 } },
        glaciar:    { coins: 5500,  items: { hielo_eterno: 14, bismuto_astral: 8, placa_boreal: 6, resina_toxica: 8 } },
        maldito:    { coins: 6200,  items: { lingote_maldito: 20, placa_maldito: 8, cristal_carmesi: 8, lingote_hueso: 10 } },
        legendaria: { coins: 7000,  items: { lingote_celestial: 22, polvo_estelar: 14, cuerno_demonio: 12, cristal_carmesi: 8 } },
        celestial:  { coins: 8800,  items: { lingote_celestial: 32, gema_alma: 14, runa_fuego: 10, runa_luz: 10, bismuto_astral: 8 } },
        omega:      { coins: 22000, items: { lingote_omega: 10, singularidad: 3, materia_comprimida: 4, lingote_maldito: 14, lingote_pirita: 14, cristal_carmesi: 10 }, reqOmega: 'omega_equipo' }
      }
    },
    pala: {
      id: 'pala', name: 'Pala', key: '4', role: 'Excavar arena, arcilla, tesoros enterrados y preparar tierra',
      anim: 'dig', basePower: 4, swingRate: 1.06, baseRange: 74, energyCost: 2,
      tierCosts: {
        mejorada:   { coins: 28,   items: { madera: 8, piedra: 6 } },
        cobre:      { coins: 65,   items: { madera: 8, lingote_cobre: 4 } },
        hierro:     { coins: 115,  items: { tablon: 6, lingote_hierro: 4 } },
        plata:      { coins: 180,  items: { tablon: 8, lingote_plata: 4, arena: 8 } },
        oro:        { coins: 265,  items: { tablon: 8, lingote_oro: 4, arcilla: 8 } },
        platino:    { coins: 410,  items: { lingote_platino: 4, lingote_bronce: 4, arena: 10 } },
        acero:      { coins: 560,  items: { lingote_acero: 5, arena_estelar: 4, arcilla: 8 } },
        cristal:    { coins: 740,  items: { lingote_acero: 5, cristales: 6 } },
        mitrilo:    { coins: 1020, items: { lingotes_especiales: 4, jade: 3 } },
        titanio:    { coins: 1320, items: { lingote_titanio: 4, arena_estelar: 5, ambar_desierto: 2 } },
        adamantita: { coins: 1650, items: { lingote_adamantita: 18, diamantes: 10, fragmentos_antiguos: 10 } },
        oricalco:   { coins: 1980,  items: { lingote_oricalco: 22, obsidiana_refinada: 12 } },
        coral:      { coins: 2350,  items: { lingote_coral: 12, placa_coral: 3, arena_estelar: 10 } },
        boreal:     { coins: 2750,  items: { lingote_boreal: 12, placa_boreal: 3, cuarzo_boreal: 10 } },
        selvano:    { coins: 3150,  items: { lingote_selvano: 14, placa_selvano: 4, madera_ferrea: 10 } },
        escoria:    { coins: 3600,  items: { lingote_escoria: 14, placa_escoria: 4, obsidiana_refinada: 10 } },
        pirita:     { coins: 4100,  items: { lingote_pirita: 14, placa_pirita: 4, arena_estelar: 12 } },
        glaciar:    { coins: 4650,  items: { hielo_eterno: 10, bismuto_astral: 5, resina_toxica: 6 } },
        maldito:    { coins: 5250,  items: { lingote_maldito: 14, placa_maldito: 5, marmol_oscuro: 12 } },
        legendaria: { coins: 5900,  items: { lingote_celestial: 18, polvo_estelar: 12, onice: 10 } },
        celestial:  { coins: 7400,  items: { lingote_celestial: 26, gema_alma: 10, runa_tierra: 10, bismuto_astral: 6 } },
        omega:      { coins: 15000, items: { lingote_omega: 6, singularidad: 2, materia_comprimida: 2, marmol_oscuro: 16, arena_estelar: 16 }, reqOmega: 'omega_equipo' }
      }
    },
    cana: {
      id: 'cana', name: 'Caña de pescar', key: '5', role: 'Pescar peces raros y tesoros hundidos en cualquier costa',
      anim: 'fish', basePower: 2, swingRate: 1.00, baseRange: 160, energyCost: 2,
      tierCosts: {
        mejorada:   { coins: 35,   items: { madera: 8, fibra_vegetal: 8 } },
        cobre:      { coins: 75,   items: { tablon: 6, fibra_vegetal: 8, lingote_cobre: 3 } },
        hierro:     { coins: 135,  items: { tablon: 6, tela: 4, lingote_hierro: 4 } },
        plata:      { coins: 205,  items: { tablon: 8, lingote_plata: 4, tela: 4 } },
        oro:        { coins: 295,  items: { tablon: 8, lingote_oro: 4, tela: 6 } },
        platino:    { coins: 460,  items: { lingote_platino: 4, perla: 2, tela: 6 } },
        acero:      { coins: 620,  items: { lingote_acero: 5, azurita_glacial: 2, tela: 6 } },
        cristal:    { coins: 810,  items: { cristales: 6, cristales_magicos: 3, tela: 8 } },
        mitrilo:    { coins: 1120, items: { lingotes_especiales: 4, jade: 2, pez_dorado: 2 } },
        titanio:    { coins: 1420, items: { lingote_titanio: 4, gema_marina: 2, pez_helado: 2 } },
        adamantita: { coins: 1740, items: { lingote_adamantita: 18, esmeraldas: 10, pez_abismal: 4 } },
        oricalco:   { coins: 2080,  items: { lingote_oricalco: 22, gema_marina: 10, coral_brillante: 10 } },
        coral:      { coins: 2450,  items: { lingote_coral: 12, placa_coral: 4, perla_turquesa: 6, coral_brillante: 8 } },
        boreal:     { coins: 2850,  items: { lingote_boreal: 14, placa_boreal: 4, celestita_cristal: 5, pez_helado: 2 } },
        selvano:    { coins: 3300,  items: { lingote_selvano: 14, placa_selvano: 4, jade_ancestral: 5, gema_marina: 6 } },
        escoria:    { coins: 3750,  items: { lingote_escoria: 14, placa_escoria: 4, pez_lava: 3 } },
        pirita:     { coins: 4250,  items: { lingote_pirita: 16, placa_pirita: 4, perla_turquesa: 6 } },
        glaciar:    { coins: 4850,  items: { hielo_eterno: 10, bismuto_astral: 5, esturion_glacial: 2, pez_abismal: 3 } },
        maldito:    { coins: 5450,  items: { lingote_maldito: 14, placa_maldito: 5, anguila_sombras: 2, gema_marina: 8 } },
        legendaria: { coins: 6100,  items: { lingote_celestial: 18, perla: 14, pez_lava: 4, bismuto_astral: 6 } },
        celestial:  { coins: 7600,  items: { lingote_celestial: 28, gema_marina: 14, runa_agua: 10, cristal_carmesi: 6 } },
        omega:      { coins: 15500, items: { lingote_omega: 6, singularidad: 2, materia_comprimida: 2, gema_marina: 16, pez_legendario_kraken: 1 }, reqOmega: 'omega_equipo' }
      }
    },
    guadana: {
      id: 'guadana', name: 'Guadaña', key: '6', role: 'Segar hierba, flores, arbustos y cultivos con barrido amplio',
      anim: 'scythe', basePower: 6, swingRate: 0.90, baseRange: 86, energyCost: 2,
      tierCosts: {
        mejorada:   { coins: 35,   items: { madera: 8, piedra: 6, hierba: 10 } },
        cobre:      { coins: 75,   items: { madera: 8, lingote_cobre: 4, hierba: 10 } },
        hierro:     { coins: 135,  items: { tablon: 6, lingote_hierro: 5 } },
        plata:      { coins: 210,  items: { tablon: 8, lingote_plata: 4, malaquita_pradera: 2 } },
        oro:        { coins: 310,  items: { lingote_oro: 5, trigo: 12 } },
        platino:    { coins: 470,  items: { lingote_platino: 5, jade: 2, tela: 4 } },
        acero:      { coins: 630,  items: { lingote_acero: 5, esquirla_hielo: 2, trigo: 14 } },
        cristal:    { coins: 820,  items: { lingote_acero: 6, cristales: 6, flor_cristal: 2 } },
        mitrilo:    { coins: 1140, items: { lingotes_especiales: 5, amatista: 2, esencia_oscura: 3 } },
        titanio:    { coins: 1480, items: { lingote_titanio: 4, cristal_abismal: 2, flor_cristal: 2 } },
        adamantita: { coins: 1820, items: { lingote_adamantita: 18, esmeraldas: 12, esencia_oscura: 14 } },
        oricalco:   { coins: 2160,  items: { lingote_oricalco: 22, esencia_magma: 10, flor_cristal: 8 } },
        coral:      { coins: 2520,  items: { lingote_coral: 12, placa_coral: 4, perla_turquesa: 5 } },
        boreal:     { coins: 2920,  items: { lingote_boreal: 14, placa_boreal: 4, celestita_cristal: 5 } },
        selvano:    { coins: 3380,  items: { lingote_selvano: 16, placa_selvano: 5, jade_ancestral: 6 } },
        escoria:    { coins: 3880,  items: { lingote_escoria: 16, placa_escoria: 5, esencia_magma: 8 } },
        pirita:     { coins: 4400,  items: { lingote_pirita: 16, placa_pirita: 5, agata_roja: 6 } },
        glaciar:    { coins: 5000,  items: { hielo_eterno: 12, bismuto_astral: 5, flor_pantano: 8, resina_toxica: 6 } },
        maldito:    { coins: 5600,  items: { lingote_maldito: 16, placa_maldito: 5, cristal_carmesi: 6, lingote_hueso: 8 } },
        legendaria: { coins: 6250,  items: { lingote_celestial: 18, polvo_estelar: 12, flor_cristal: 12 } },
        celestial:  { coins: 7750,  items: { lingote_celestial: 28, gema_alma: 12, runa_vida: 10, bismuto_astral: 6 } },
        omega:      { coins: 16500, items: { lingote_omega: 7, singularidad: 2, materia_comprimida: 2, flor_cristal: 14, jade_ancestral: 12 }, reqOmega: 'omega_equipo' }
      }
    },
    arco: {
      id: 'arco', name: 'Arco', key: '7', role: 'Disparar flechas precisas a distancia contra enemigos y jefes',
      anim: 'bow', basePower: 6, swingRate: 1.00, baseRange: 380, energyCost: 3.0,
      tierCosts: {
        mejorada:   { coins: 50,   items: { madera: 12, fibra_vegetal: 10 } },
        cobre:      { coins: 95,   items: { madera: 12, lingote_cobre: 4, tela: 3 } },
        hierro:     { coins: 165,  items: { tablon: 10, lingote_hierro: 4, tela: 4 } },
        plata:      { coins: 245,  items: { tablon: 10, lingote_plata: 4, tela: 5 } },
        oro:        { coins: 350,  items: { tablon: 12, lingote_oro: 5, cuero: 5 } },
        platino:    { coins: 540,  items: { lingote_platino: 5, tela: 6, jade: 2 } },
        acero:      { coins: 730,  items: { lingote_acero: 6, azurita_glacial: 2, tela: 6 } },
        cristal:    { coins: 950,  items: { cristales: 8, cristales_magicos: 4, tela: 6 } },
        mitrilo:    { coins: 1320, items: { lingotes_especiales: 6, sanguinaria: 3, seda_arana: 5 } },
        titanio:    { coins: 1680, items: { lingote_titanio: 5, ambar_desierto: 3, seda_arana: 5 } },
        adamantita: { coins: 2040, items: { lingote_adamantita: 20, diamantes: 12, material_volcanico: 18 } },
        oricalco:   { coins: 2450,  items: { lingote_oricalco: 24, cristal_abismal: 10, pluma_oscura: 10 } },
        coral:      { coins: 2800,  items: { lingote_coral: 14, placa_coral: 4, perla_turquesa: 6, seda_arana: 6 } },
        boreal:     { coins: 3200,  items: { lingote_boreal: 14, placa_boreal: 5, celestita_cristal: 6 } },
        selvano:    { coins: 3700,  items: { lingote_selvano: 16, placa_selvano: 5, madera_ferrea: 12, jade_ancestral: 5 } },
        escoria:    { coins: 4200,  items: { lingote_escoria: 16, placa_escoria: 5, polvo_carmesi: 6 } },
        pirita:     { coins: 4780,  items: { lingote_pirita: 18, placa_pirita: 6, agata_roja: 6 } },
        glaciar:    { coins: 5400,  items: { hielo_eterno: 12, bismuto_astral: 6, resina_toxica: 6 } },
        maldito:    { coins: 6050,  items: { lingote_maldito: 18, placa_maldito: 6, cristal_carmesi: 6, pluma_oscura: 12 } },
        legendaria: { coins: 6800,  items: { lingote_celestial: 20, polvo_estelar: 14, pluma_fenix: 10, cristal_carmesi: 6 } },
        celestial:  { coins: 8500,  items: { lingote_celestial: 30, gema_alma: 12, runa_aire: 10, bismuto_astral: 8 } },
        omega:      { coins: 20000, items: { lingote_omega: 9, singularidad: 3, materia_comprimida: 3, cristal_carmesi: 10, pluma_fenix: 10 }, reqOmega: 'omega_equipo' }
      }
    },
    azada: {
      id: 'azada', name: 'Azada', key: '8', role: 'Arar y regar la tierra rápidamente para plantar y cosechar',
      anim: 'hoe', basePower: 4, swingRate: 1.12, baseRange: 76, energyCost: 2,
      tierCosts: {
        mejorada:   { coins: 34,   items: { madera: 8, piedra: 6 } },
        cobre:      { coins: 70,   items: { madera: 8, lingote_cobre: 4 } },
        hierro:     { coins: 125,  items: { tablon: 6, lingote_hierro: 4 } },
        plata:      { coins: 190,  items: { tablon: 8, lingote_plata: 4, fertilizante: 3 } },
        oro:        { coins: 280,  items: { lingote_oro: 4, trigo: 10 } },
        platino:    { coins: 440,  items: { lingote_platino: 4, fertilizante: 5 } },
        acero:      { coins: 590,  items: { lingote_acero: 5, malaquita_pradera: 3, fertilizante: 5 } },
        cristal:    { coins: 760,  items: { lingote_acero: 6, cristales: 5 } },
        mitrilo:    { coins: 1080, items: { lingotes_especiales: 4, jade: 3 } },
        titanio:    { coins: 1380, items: { lingote_titanio: 4, ambar_desierto: 2, fertilizante: 6 } },
        adamantita: { coins: 1710, items: { lingote_adamantita: 18, esmeraldas: 10 } },
        oricalco:   { coins: 2050,  items: { lingote_oricalco: 22, cristal_abismal: 10, flor_cristal: 8 } },
        coral:      { coins: 2420,  items: { lingote_coral: 12, placa_coral: 3, perla_turquesa: 5 } },
        boreal:     { coins: 2820,  items: { lingote_boreal: 12, placa_boreal: 4, cuarzo_boreal: 10 } },
        selvano:    { coins: 3260,  items: { lingote_selvano: 14, placa_selvano: 4, jade_ancestral: 5, fertilizante: 8 } },
        escoria:    { coins: 3720,  items: { lingote_escoria: 14, placa_escoria: 4, esencia_magma: 8 } },
        pirita:     { coins: 4220,  items: { lingote_pirita: 14, placa_pirita: 4, agata_roja: 5 } },
        glaciar:    { coins: 4780,  items: { hielo_eterno: 10, bismuto_astral: 5, flor_pantano: 8 } },
        maldito:    { coins: 5380,  items: { lingote_maldito: 14, placa_maldito: 5, lingote_hueso: 8 } },
        legendaria: { coins: 6000,  items: { lingote_celestial: 18, polvo_estelar: 12, flor_cristal: 10 } },
        celestial:  { coins: 7500,  items: { lingote_celestial: 28, gema_alma: 10, runa_vida: 10, bismuto_astral: 6 } },
        omega:      { coins: 15000, items: { lingote_omega: 6, singularidad: 2, materia_comprimida: 2, jade_ancestral: 12, flor_cristal: 12 }, reqOmega: 'omega_equipo' }
      }
    }
  };

  function getToolReach(toolId, tierId) {
    const tool = TOOLS[toolId];
    if (!tool) return 74;
    const meta = TIER_META[tierId] || TIER_META.basica;
    const tierIndex = Math.max(0, TIER_ORDER.indexOf(meta.id));
    const step = toolId === 'arco' ? 14 : toolId === 'cana' ? 12 : 8;
    return Math.round(tool.baseRange + tierIndex * step);
  }

  function getToolStats(toolId, tierId) {
    const tool = TOOLS[toolId];
    const meta = TIER_META[tierId] || TIER_META.basica;
    if (!tool) return null;
    const reach = getToolReach(toolId, meta.id);
    return {
      ...tool,
      tier: meta.id,
      tierName: meta.name,
      tierColor: meta.color,
      power: Math.max(1, Math.round(tool.basePower * meta.mult)),
      speed: meta.speed,
      swingRate: tool.swingRate || 1.0,
      rareBonus: meta.rareBonus,
      reach,
      tierIndex: TIER_ORDER.indexOf(meta.id)
    };
  }

  function getNextTier(tierId) {
    const idx = TIER_ORDER.indexOf(tierId);
    if (idx < 0 || idx >= TIER_ORDER.length - 1) return null;
    return TIER_ORDER[idx + 1];
  }

  // Clean out zero-cost placeholder keys if any
  Object.values(TOOLS).forEach(t => {
    Object.values(t.tierCosts).forEach(c => {
      Object.keys(c.items).forEach(k => {
        if (!c.items[k] || !Abyssea.ITEMS[k]) delete c.items[k];
      });
    });
  });

  // Required minimum pickaxe tier index across 23 tiers (0=basica .. 22=omega)
  function getRequiredPickTier(nodeKind) {
    const reqs = {
      rock: 0, ruin_pillar: 0, coal_vein: 0, copper_vein: 0, tin_vein: 0, sulfur_vein: 0, malachite_vein: 0,
      iron_vein: 2, silver_vein: 3, gold_vein: 4, ice_crystal: 4, jade_vein: 4, amber_vein: 4, star_sand_vein: 3,
      platinum_vein: 5, crystal_node: 6, emerald_vein: 6, azurite_vein: 6,
      ruby_node: 7, sapphire_node: 7, amethyst_vein: 7,
      volcanic_rock: 8, diamond_vein: 8, bloodstone_vein: 8, abyssal_crystal_vein: 8, mithril_vein: 8, meteor: 8,
      titanium_vein: 9, magma_core_vein: 9,
      adamantite_vein: 10,
      orichalcum_vein: 11, oricalco_vein: 11, obsidian_vein: 11,
      coral_abisal_node: 12, perla_turquesa_node: 12,
      cuarzo_boreal_node: 13, celestita_node: 13,
      jade_ancestral_node: 14,
      escoria_caldera_node: 15, cristal_carmesi_node: 15,
      pirita_solar_node: 16, agata_roja_node: 16,
      hielo_eterno_node: 17, bismuto_astral_node: 17, resina_toxica_node: 17,
      hueso_fosil_node: 18, plata_maldita_node: 18, marmol_oscuro_node: 18
    };
    return reqs[nodeKind] ?? 0;
  }

  // Strict tool hierarchy multiplier & feedback for mining, chopping, foraging, excavation & combat.
  function getToolEfficiency(toolId, targetKind, tierId = 'basica') {
    const T = (k, vars) => (Abyssea.I18n ? Abyssea.I18n.t(k, vars) : k);
    if (!toolId || !tierId) return { mult: 0, blocked: true, hint: T('tool.none') };
    const tierIdx = TIER_ORDER.indexOf(tierId);

    const miningNodes = new Set([
      'rock', 'coal_vein', 'copper_vein', 'tin_vein', 'iron_vein', 'gold_vein', 'silver_vein', 'platinum_vein',
      'sulfur_vein', 'jade_vein', 'amethyst_vein', 'bloodstone_vein', 'crystal_node', 'crystal_cluster', 'emerald_vein', 'ruby_node',
      'sapphire_node', 'diamond_vein', 'mithril_vein', 'volcanic_rock', 'ice_crystal', 'meteor', 'ruin_pillar',
      'malachite_vein', 'amber_vein', 'star_sand_vein', 'azurite_vein', 'abyssal_crystal_vein', 'titanium_vein',
      'adamantite_vein', 'orichalcum_vein', 'oricalco_vein', 'obsidian_vein', 'magma_core_vein',
      'coral_abisal_node', 'perla_turquesa_node', 'cuarzo_boreal_node', 'celestita_node',
      'jade_ancestral_node', 'escoria_caldera_node', 'pirita_solar_node', 'agata_roja_node',
      'hielo_eterno_node', 'bismuto_astral_node', 'resina_toxica_node', 'hueso_fosil_node',
      'plata_maldita_node', 'cristal_carmesi_node', 'marmol_oscuro_node'
    ]);
    const woodNodes = new Set(['tree', 'giant_tree', 'cactus', 'madera_ferrea_node']);
    const forageNodes = new Set(['bush', 'herb_patch', 'mushroom_node', 'wild_crop_patch', 'flor_pantano_node']);

    if (targetKind === 'enemy' || targetKind === 'boss') {
      const weights = {
        espada: 1.15,
        arco: 1.10,
        hacha: 0.92,
        guadana: 0.72,
        pico: 0.42,
        azada: 0.38,
        pala: 0.34,
        cana: 0.25
      };
      const mult = weights[toolId] ?? 0.35;
      const hint = (toolId !== 'espada' && toolId !== 'arco' && toolId !== 'hacha') ? T('tool.lowCombatDmg') : null;
      return { mult, blocked: false, hint };
    }

    if (miningNodes.has(targetKind)) {
      const reqIdx = getRequiredPickTier(targetKind);
      if (toolId === 'pico') {
        if (tierIdx < reqIdx) {
          const reqTier = TIER_ORDER[reqIdx];
          const reqName = (Abyssea.I18n && Abyssea.I18n.getTierName ? Abyssea.I18n.getTierName(reqTier) : null) || (TIER_META[reqTier] && TIER_META[reqTier].name) || reqTier;
          const lowHint = T('tool.pickTooLow', { tier: reqName, n: reqIdx + 1 });
          return {
            mult: 0.0,
            capDmg: 0,
            blocked: true,
            hint: (lowHint && lowHint !== 'tool.pickTooLow') ? lowHint : `¡Pico insuficiente! Requiere Pico ${reqName} (Tier ${reqIdx + 1}) o superior.`
          };
        }
        const pickTierMult = tierIdx === 0 ? 0.68 : tierIdx === 1 ? 0.98 : 1.32;
        return { mult: pickTierMult, blocked: false, hint: null };
      }
      if (toolId === 'espada') {
        if (targetKind === 'rock' || targetKind === 'coal_vein') {
          return { mult: 0.03, capDmg: 1, blocked: false, hint: T('tool.swordBarelyRock') };
        }
        return { mult: 0.0, capDmg: 0, blocked: true, hint: T('tool.swordCantOre') };
      }
      if (targetKind === 'rock' || targetKind === 'coal_vein') {
        return { mult: 0.14, capDmg: 2, blocked: false, hint: T('tool.usePickFaster') };
      }
      const needPickHint = T('tool.needPickForOre');
      return { mult: 0.0, capDmg: 0, blocked: true, hint: (needPickHint && needPickHint !== 'tool.needPickForOre') ? needPickHint : 'Se requiere un pico adecuado para extraer este mineral.' };
    }

    if (woodNodes.has(targetKind)) {
      if (toolId === 'hacha') return { mult: 1.45, blocked: false, hint: null };
      if (toolId === 'espada') {
        return { mult: 0.06, capDmg: 1, blocked: false, hint: T('tool.swordBarelyTree') };
      }
      if (targetKind === 'giant_tree') {
        return { mult: 0.10, capDmg: 1, blocked: false, hint: T('tool.giantTreeAxe') };
      }
      if (toolId === 'pico') return { mult: 0.18, capDmg: 2, blocked: false, hint: T('tool.fasterWithAxe') };
      return { mult: 0.20, capDmg: 2, blocked: false, hint: T('tool.useAxeChop') };
    }

    if (forageNodes.has(targetKind)) {
      if (toolId === 'guadana') return { mult: 1.55, aoe: true, bonusSeed: true, blocked: false, hint: null };
      if (toolId === 'hacha' || toolId === 'espada' || toolId === 'azada') return { mult: 0.9, blocked: false, hint: null };
      return { mult: 0.65, blocked: false, hint: T('tool.scytheMoreSeeds') };
    }

    if (targetKind === 'dig_spot') {
      if (toolId === 'pala') return { mult: 1.35, blocked: false, hint: null };
      return { mult: 0, blocked: true, hint: T('tool.needShovel') };
    }

    if (targetKind === 'soil') {
      if (toolId === 'azada') return { mult: 1.4, blocked: false, hint: null };
      return { mult: 0, blocked: true, hint: T('tool.needHoe') };
    }

    if (targetKind === 'fish_spot' || targetKind === 'water') {
      if (toolId === 'cana') return { mult: 1.0, blocked: false, hint: null };
      return { mult: 0, blocked: true, hint: T('tool.needRod') };
    }

    return { mult: 1.0, blocked: false, hint: null };
  }

  const ARMOR_CHAINS = {
    helm: {
      slot: 'helm',
      nameKey: 'inv.slotHelm',
      fallbackName: 'Casco',
      baseItem: 'casco_cuero',
      tiers: [
        'casco_cuero', 'casco_bronce', 'casco_cobre', 'casco_hierro', 'casco_plata',
        'casco_oro', 'casco_platino', 'casco_acero', 'casco_cristal', 'casco_mitrilo',
        'casco_titanio', 'casco_adamantita', 'casco_oricalco',
        'casco_coral', 'casco_boreal', 'casco_selva', 'casco_caldera',
        'casco_faraon', 'casco_glaciar', 'casco_abismal',
        'casco_abyssea', 'casco_solar', 'casco_omega'
      ]
    },
    armor: {
      slot: 'armor',
      nameKey: 'inv.slotArmor',
      fallbackName: 'Armadura',
      baseItem: 'armadura_cuero',
      tiers: [
        'armadura_cuero', 'armadura_bronce', 'armadura_cobre', 'armadura_hierro', 'armadura_plata',
        'armadura_oro', 'armadura_platino', 'armadura_acero', 'armadura_cristal', 'armadura_mitrilo',
        'armadura_titanio', 'armadura_adamantita', 'armadura_oricalco',
        'armadura_coral', 'armadura_boreal', 'armadura_selva', 'armadura_caldera',
        'armadura_faraon', 'armadura_glaciar', 'armadura_abismal',
        'armadura_volcanica', 'armadura_celestial', 'armadura_omega'
      ]
    },
    shield: {
      slot: 'shield',
      nameKey: 'inv.slotShield',
      fallbackName: 'Escudo',
      baseItem: 'escudo_madera',
      tiers: [
        'escudo_madera', 'escudo_bronce', 'escudo_cobre', 'escudo_hierro', 'escudo_plata',
        'escudo_oro', 'escudo_platino', 'escudo_acero', 'escudo_cristal', 'escudo_mitrilo',
        'escudo_titanio', 'escudo_adamantita', 'escudo_oricalco',
        'escudo_coral', 'escudo_boreal', 'escudo_selva', 'escudo_caldera',
        'escudo_faraon', 'escudo_glaciar', 'escudo_eclipse',
        'escudo_solar', 'escudo_celestial', 'escudo_omega'
      ]
    },
    boots: {
      slot: 'boots',
      nameKey: 'inv.slotBoots',
      fallbackName: 'Botas',
      baseItem: 'botas_cuero',
      tiers: [
        'botas_cuero', 'botas_bronce', 'botas_cobre', 'botas_hierro', 'botas_plata',
        'botas_oro', 'botas_platino', 'botas_acero', 'botas_cristal', 'botas_mitrilo',
        'botas_titanio', 'botas_adamantita', 'botas_oricalco',
        'botas_coral', 'botas_boreal', 'botas_selva', 'botas_caldera',
        'botas_faraon', 'botas_glaciar', 'botas_abismal',
        'botas_viento', 'botas_celestiales', 'botas_omega'
      ]
    },
    legs: {
      slot: 'legs',
      nameKey: 'inv.slotLegs',
      fallbackName: 'Pantalones',
      baseItem: 'pantalones_cuero',
      tiers: [
        'pantalones_cuero', 'pantalones_bronce', 'pantalones_cobre', 'pantalones_hierro',
        'pantalones_plata', 'pantalones_oro', 'pantalones_platino', 'pantalones_acero',
        'pantalones_cristal', 'pantalones_mitrilo', 'pantalones_titanio', 'pantalones_adamantita',
        'pantalones_oricalco',
        'pantalones_coral', 'pantalones_boreal', 'pantalones_selva', 'pantalones_caldera',
        'pantalones_faraon', 'pantalones_glaciar', 'pantalones_abismal',
        'pantalones_volcanicos', 'pantalones_celestiales', 'pantalones_omega'
      ]
    }
  };

  const ARMOR_ITEM_LOOKUP = {};
  Object.entries(ARMOR_CHAINS).forEach(([slot, chain]) => {
    chain.tiers.forEach((itemId, tierIdx) => {
      ARMOR_ITEM_LOOKUP[itemId] = { slot, tierIdx, itemId, chain };
    });
  });

  function isProgressiveArmorItem(itemId) {
    return ARMOR_ITEM_LOOKUP[itemId] || null;
  }

  function getArmorNextItem(slot, curItemId) {
    const chain = ARMOR_CHAINS[slot];
    if (!chain) return null;
    if (!curItemId) return chain.tiers[0];
    const idx = chain.tiers.indexOf(curItemId);
    if (idx < 0 || idx >= chain.tiers.length - 1) return null;
    return chain.tiers[idx + 1];
  }

  function getArmorTierIndex(slot, itemId) {
    const chain = ARMOR_CHAINS[slot];
    if (!chain || !itemId) return -1;
    return chain.tiers.indexOf(itemId);
  }

  function getArmorUpgradeMaterials(slot, targetItemId) {
    const rec = Abyssea.RECIPES && Abyssea.RECIPES.find(r => r.out === targetItemId);
    if (!rec) return null;
    const prevChain = ARMOR_CHAINS[slot] && ARMOR_CHAINS[slot].tiers;
    const prevIdx = prevChain ? prevChain.indexOf(targetItemId) - 1 : -1;
    const prevId = prevIdx >= 0 ? prevChain[prevIdx] : null;
    const items = {};
    Object.entries(rec.in || {}).forEach(([k, v]) => {
      if (k !== prevId && v > 0) items[k] = v;
    });
    return {
      recipeId: rec.id,
      station: rec.station,
      items,
      xp: rec.xp || 24,
      craftTime: rec.craftTime,
      reqOmega: rec.reqOmega || null
    };
  }

  Abyssea.TOOL_TIERS = TIER_ORDER;
  Abyssea.TIER_ORDER = TIER_ORDER;
  Abyssea.TIER_META = TIER_META;
  Abyssea.TOOLS = TOOLS;
  Abyssea.ARMORS = ARMOR_CHAINS;
  Abyssea.getToolStats = getToolStats;
  Abyssea.getToolReach = getToolReach;
  Abyssea.getNextTier = getNextTier;
  Abyssea.getRequiredPickTier = getRequiredPickTier;
  Abyssea.getToolEfficiency = getToolEfficiency;
  Abyssea.isProgressiveArmorItem = isProgressiveArmorItem;
  Abyssea.getArmorNextItem = getArmorNextItem;
  Abyssea.getArmorTierIndex = getArmorTierIndex;
  Abyssea.getArmorUpgradeMaterials = getArmorUpgradeMaterials;
})();
