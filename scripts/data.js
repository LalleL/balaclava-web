/**
 * Datos reales de Abyssea Beta 2.0.0 RC2 (extraídos del código del juego)
 * Soporta Español (es) e Inglés (en) sin mezclar idiomas.
 */
window.BALACLAVA_DATA = {
  stats: [
    { key: 'islands', num: '361', icon: 'assets/icons/scroll_map.png', labelEs: 'Islas (19×19)', labelEn: 'Islands (19×19)', accent: '#64b5f6' },
    { key: 'biomes', num: '14', icon: 'assets/ui/rpg_compass.png', labelEs: 'Biomas', labelEn: 'Biomes', accent: '#81c784' },
    { key: 'dungeons', num: '75', icon: 'assets/icons_extra/llave_maestra.png', labelEs: 'Mazmorras', labelEn: 'Dungeons', accent: '#ff1744' },
    { key: 'relics', num: '92', icon: 'assets/sprites_v13/icons/relic_v13_52.png', labelEs: 'Reliquias', labelEn: 'Relics', accent: '#ffd54f' },
    { key: 'items', num: '710+', icon: 'assets/icons/backpack.png', labelEs: 'Objetos Únicos', labelEn: 'Unique Items', accent: '#ce93d8' },
    { key: 'skills', num: '345', icon: 'assets/icons/spellbook.png', labelEs: 'Nodos Astrales', labelEn: 'Astral Nodes', accent: '#64b5f6' },
    { key: 'buildings', num: '97', icon: 'assets/sprites_extra/bld_omega_nexo.png', labelEs: 'Construcciones', labelEn: 'Buildings', accent: '#ffd54f' },
    { key: 'recipes', num: '441', icon: 'assets/icons/anvil.png', labelEs: 'Recetas', labelEn: 'Recipes', accent: '#81c784' }
  ],

  zones: [
    { id: 'all', labelEs: 'Todo el Archipiélago (361)', labelEn: 'Full Archipelago (361)' },
    { id: '1', labelEs: 'Zona I · Centro (9)', labelEn: 'Zone I · Core (9)' },
    { id: '2', labelEs: 'Zona II · Anillo (36)', labelEn: 'Zone II · Inner (36)' },
    { id: '3', labelEs: 'Zona III · Profundo (100)', labelEn: 'Zone III · Deep (100)' },
    { id: '4', labelEs: 'Zona IV · Confines (216)', labelEn: 'Zone IV · Frontier (216)' }
  ],

  biomes: [
    {
      id: 'pradera',
      zone: 1,
      wing: 'center',
      islands: 9,
      dungeons: 5,
      color: '#63ab3f',
      accent: '#9de64e',
      icon: 'assets/icons/biome_pradera.png',
      gate: 'assets/sprites_extra/gate_pradera.png',
      swatch: null,
      difficultyEs: 'Zona I · Inicial (Nv. 1–15)',
      difficultyEn: 'Zone I · Starter (Lv. 1–15)',
      nameEs: 'Pradera Esmeralda',
      nameEn: 'Emerald Meadow',
      wingLabelEs: 'Centro 3×3',
      wingLabelEn: 'Center 3×3',
      descEs: 'Núcleo fértil central donde despierta Hana. Bosques mixtos, pastizales serenos, vetas iniciales y Eldrin el Cartógrafo.',
      descEn: 'Fertile central core where Hana awakens. Peaceful groves, starter ore veins, and Eldrin the Cartographer.',
      resourcesEs: ['Carbón', 'Cobre', 'Estaño', 'Hierro', 'Plata', 'Malaquita Silvestre'],
      resourcesEn: ['Coal', 'Copper', 'Tin', 'Iron', 'Silver', 'Wild Malachite'],
      monstersEs: ['Limo Esmeralda', 'Esqueleto Errante', 'Rata Gigante Alfa', 'Orco Saqueador', 'Goblin Artillero'],
      monstersEn: ['Emerald Slime', 'Wandering Skeleton', 'Alpha Giant Rat', 'Orc Raider', 'Goblin Cannoneer']
    },
    {
      id: 'desierto',
      zone: 2,
      wing: 'north',
      islands: 10,
      dungeons: 5,
      color: '#e5b85c',
      accent: '#ffe38c',
      icon: 'assets/icons/biome_desierto.png',
      gate: 'assets/sprites_extra/gate_desierto.png',
      swatch: null,
      difficultyEs: 'Zona II · Intermedia (Nv. 16–40)',
      difficultyEn: 'Zone II · Intermediate (Lv. 16–40)',
      nameEs: 'Desierto Dorado',
      nameEn: 'Golden Desert',
      wingLabelEs: 'Norte Interior',
      wingLabelEn: 'Inner North',
      descEs: 'Dunas cálidas al norte del núcleo, cactus curativos, oasis esmeralda y templos enterrados custodiados por Zara la Mercader.',
      descEn: 'Warm dunes north of the core with healing cacti, oasis grottos, and buried temples.',
      resourcesEs: ['Oro', 'Arena Estelar Fósil', 'Ámbar Solar', 'Topacio', 'Titanio'],
      resourcesEn: ['Gold', 'Fossil Star Sand', 'Solar Amber', 'Topaz', 'Titanium'],
      monstersEs: ['Escorpión Dorado', 'Cobra del Oasis', 'Escarabajo Solar', 'Necrófago de Arena', 'Gólem de Basalto'],
      monstersEn: ['Golden Scorpion', 'Oasis Cobra', 'Solar Scarab', 'Sand Ghoul', 'Basalt Golem']
    },
    {
      id: 'montanas_heladas',
      zone: 2,
      wing: 'east',
      islands: 8,
      dungeons: 5,
      color: '#a8d8ea',
      accent: '#e8fbff',
      icon: 'assets/icons/biome_montanas_heladas.png',
      gate: 'assets/sprites_extra/gate_montanas_heladas.png',
      swatch: null,
      difficultyEs: 'Zona II · Desafiante (Nv. 41–70)',
      difficultyEn: 'Zone II · Challenging (Lv. 41–70)',
      nameEs: 'Montañas Heladas',
      nameEn: 'Frozen Mountains',
      wingLabelEs: 'Este Interior',
      wingLabelEn: 'Inner East',
      descEs: 'Cumbres nevadas orientales (siempre separadas de la lava) donde cristaliza el acero azul y forja el maestro Bjorn.',
      descEn: 'Eastern snowy peaks (strictly isolated from lava) rich in blue steel and glacial sapphires.',
      resourcesEs: ['Platino', 'Azurita Glacial', 'Zafiro', 'Esquirla de Hielo', 'Titanio'],
      resourcesEn: ['Platinum', 'Glacial Azurite', 'Sapphire', 'Ice Shard', 'Titanium'],
      monstersEs: ['Lobo Glacial', 'Gólem de Runa', 'Caballero Sombrío', 'Nigromante Óseo', 'Gelatina de Escarcha'],
      monstersEn: ['Glacial Wolf', 'Rune Golem', 'Shadow Knight', 'Bone Necromancer', 'Frost Jelly']
    },
    {
      id: 'bosque_oscuro',
      zone: 2,
      wing: 'south',
      islands: 10,
      dungeons: 5,
      color: '#345b58',
      accent: '#8c69d4',
      icon: 'assets/icons/biome_bosque_oscuro.png',
      gate: 'assets/sprites_extra/gate_bosque_oscuro.png',
      swatch: null,
      difficultyEs: 'Zona II · Peligrosa (Nv. 71–105)',
      difficultyEn: 'Zone II · Dangerous (Lv. 71–105)',
      nameEs: 'Bosque Oscuro',
      nameEn: 'Dark Forest',
      wingLabelEs: 'Sur Interior',
      wingLabelEn: 'Inner South',
      descEs: 'Espesura violeta de árboles gigantes, hongos luminosos y criptas selladas donde investiga Lyra la Alquimista.',
      descEn: 'Violet woodland of giant trees, glowing mushrooms, and sealed crypts.',
      resourcesEs: ['Jade', 'Amatista', 'Sangrita', 'Cristal del Abismo', 'Oricalco'],
      resourcesEn: ['Jade', 'Amethyst', 'Bloodstone', 'Abyssal Crystal', 'Orichalcum'],
      monstersEs: ['Espectro Arcano', 'Goblin Pirómano', 'Cofre Mímico Voraz', 'Ojo Abisal Flotante', 'Gelatina del Vacío'],
      monstersEn: ['Arcane Wisp', 'Pyro Goblin', 'Ravenous Mimic', 'Floating Abyss Eye', 'Void Jelly']
    },
    {
      id: 'tierras_volcanicas',
      zone: 2,
      wing: 'west',
      islands: 8,
      dungeons: 5,
      color: '#5a3234',
      accent: '#ff6a33',
      icon: 'assets/icons/biome_tierras_volcanicas.png',
      gate: 'assets/sprites_extra/gate_tierras_volcanicas.png',
      swatch: null,
      difficultyEs: 'Zona II · Extrema (Nv. 106–150)',
      difficultyEn: 'Zone II · Extreme (Lv. 106–150)',
      nameEs: 'Tierras Volcánicas',
      nameEn: 'Volcanic Lands',
      wingLabelEs: 'Oeste Interior',
      wingLabelEn: 'Inner West',
      descEs: 'Suelo basáltico y ríos de magma al oeste del núcleo. Hogar de minerales míticos y de Ignis el Guardián de Ceniza.',
      descEn: 'Basalt terrain and lava rivers to the west, forging mythic ores and fire elementals.',
      resourcesEs: ['Adamantita', 'Obsidiana', 'Oricalco', 'Diamante', 'Núcleo de Magma'],
      resourcesEn: ['Adamantite', 'Obsidian', 'Orichalcum', 'Diamond', 'Magma Core'],
      monstersEs: ['Elemental Volcánico', 'Goblin Dinamitero', 'Cráneo Ardiente', 'Diablillo de Magma', 'Hormiga de Magma'],
      monstersEn: ['Volcanic Elemental', 'TNT Goblin', 'Flaming Skull', 'Magma Imp', 'Lava Ant']
    },
    {
      id: 'archipielago_coral',
      zone: 3,
      wing: 'north',
      islands: 27,
      dungeons: 5,
      color: '#f2c97d',
      accent: '#4deeea',
      icon: 'assets/sprites_v13/icons/ore_coral.png',
      gate: 'assets/sprites_v13/gates/gate_coral.png',
      swatch: 'assets/sprites_v13/biomes/archipielago_coral.png',
      difficultyEs: 'Zona III · Profunda (Nv. 151–195)',
      difficultyEn: 'Zone III · Deep (Lv. 151–195)',
      nameEs: 'Archipiélago Coral',
      nameEn: 'Coral Archipelago',
      wingLabelEs: 'Norte Medio',
      wingLabelEn: 'Mid North',
      descEs: 'Atolones turquesas al norte con arrecifes abisales, perlas luminosas y fortalezas de corsarios coralinos.',
      descEn: 'Turquoise northern atolls filled with abyssal reefs, luminous pearls, and coral corsairs.',
      resourcesEs: ['Coral Abisal', 'Perla Turquesa', 'Lingote Coralino', 'Arena Estelar'],
      resourcesEn: ['Abyssal Coral', 'Turquoise Pearl', 'Coral Ingot', 'Star Sand'],
      monstersEs: ['Cangrejo Acorazado de Coral', 'Víbora Marina del Arrecife'],
      monstersEn: ['Armored Coral Crab', 'Reef Sea Viper']
    },
    {
      id: 'cavernas_cristal',
      zone: 3,
      wing: 'east',
      islands: 23,
      dungeons: 5,
      color: '#5f9bc9',
      accent: '#a0e7ff',
      icon: 'assets/sprites_v13/icons/ore_boreal.png',
      gate: 'assets/sprites_v13/gates/gate_cristal.png',
      swatch: 'assets/sprites_v13/biomes/cavernas_cristal.png',
      difficultyEs: 'Zona III · Profunda (Nv. 196–240)',
      difficultyEn: 'Zone III · Deep (Lv. 196–240)',
      nameEs: 'Cavernas Cristalinas',
      nameEn: 'Crystal Caverns',
      wingLabelEs: 'Este Medio',
      wingLabelEn: 'Mid East',
      descEs: 'Grutas geódicas boreales al este que concentran resonancia arcana pura y autómatas prismáticos.',
      descEn: 'Boreal eastern geode caverns pulsing with pure arcane resonance and prism constructs.',
      resourcesEs: ['Cuarzo Boreal', 'Celestita Prismática', 'Lingote Boreal', 'Zafiro'],
      resourcesEn: ['Boreal Quartz', 'Prismatic Celestite', 'Boreal Ingot', 'Sapphire'],
      monstersEs: ['Ojo Prismático Astral', 'Gólem de Runa', 'Caballero Sombrío'],
      monstersEn: ['Astral Prism Eye', 'Rune Golem', 'Shadow Knight']
    },
    {
      id: 'selva_esmeralda',
      zone: 3,
      wing: 'south',
      islands: 27,
      dungeons: 5,
      color: '#2d7a47',
      accent: '#69f0ae',
      icon: 'assets/sprites_v13/icons/ore_selvano.png',
      gate: 'assets/sprites_v13/gates/gate_selva.png',
      swatch: 'assets/sprites_v13/biomes/selva_esmeralda.png',
      difficultyEs: 'Zona III · Profunda (Nv. 241–290)',
      difficultyEn: 'Zone III · Deep (Lv. 241–290)',
      nameEs: 'Selva Esmeralda',
      nameEn: 'Emerald Jungle',
      wingLabelEs: 'Sur Medio',
      wingLabelEn: 'Mid South',
      descEs: 'Jungla milenaria al sur poblada por árboles colosales de madera férrea, pirámides de jade y colmenas gigantes.',
      descEn: 'Ancient southern jungle of ironwood giants, hidden jade temples, and predator flora.',
      resourcesEs: ['Madera Férrea', 'Jade Ancestral', 'Lingote Selvano', 'Resina'],
      resourcesEn: ['Ironwood', 'Ancestral Jade', 'Jungle Ingot', 'Resin'],
      monstersEs: ['Tarántula Esmeralda', 'Planta Carnívora Selvática'],
      monstersEn: ['Emerald Tarantula', 'Carnivorous Jungle Plant']
    },
    {
      id: 'caldera_ceniza',
      zone: 3,
      wing: 'west',
      islands: 23,
      dungeons: 5,
      color: '#73453d',
      accent: '#ff9100',
      icon: 'assets/sprites_v13/icons/ore_escoria.png',
      gate: 'assets/sprites_v13/gates/gate_caldera.png',
      swatch: 'assets/sprites_v13/biomes/caldera_ceniza.png',
      difficultyEs: 'Zona III · Profunda (Nv. 291–340)',
      difficultyEn: 'Zone III · Deep (Lv. 291–340)',
      nameEs: 'Caldera de Ceniza',
      nameEn: 'Ash Caldera',
      wingLabelEs: 'Oeste Medio',
      wingLabelEn: 'Mid West',
      descEs: 'Crisol volcánico occidental de fumarolas ardientes donde se templan aleaciones infernales entre dragones cenizos.',
      descEn: 'Western volcanic crucible of blazing fumaroles, ash dragons, and demonic smelting forges.',
      resourcesEs: ['Escoria de Caldera', 'Polvo Carmesí', 'Lingote de Escoria', 'Obsidiana'],
      resourcesEn: ['Caldera Slag', 'Crimson Dust', 'Slag Ingot', 'Obsidian'],
      monstersEs: ['Limo de Escoria Fundida', 'Murciélago de Brasas', 'Bomba Viviente de Ceniza', 'Cría de Dragón Cenizo'],
      monstersEn: ['Molten Slag Slime', 'Ember Bat', 'Living Ash Bomb', 'Ash Dragon Whelp']
    },
    {
      id: 'dinastia_arena',
      zone: 4,
      wing: 'north',
      islands: 59,
      dungeons: 6,
      color: '#cc7a44',
      accent: '#ffd54f',
      icon: 'assets/sprites_v13/icons/ore_pirita.png',
      gate: 'assets/sprites_v13/gates/gate_dinastia.png',
      swatch: 'assets/sprites_v13/biomes/dinastia_arena.png',
      difficultyEs: 'Zona IV · Confín Norte (Nv. 341–410)',
      difficultyEn: 'Zone IV · North Frontier (Lv. 341–410)',
      nameEs: 'Dinastía de la Arena',
      nameEn: 'Sand Dynasty',
      wingLabelEs: 'Confín Norte',
      wingLabelEn: 'Outer North',
      descEs: 'Desierto escarlata imperial en el extremo norte, repleto de obeliscos solares, tumbas de escribas y faraones eternos.',
      descEn: 'Imperial scarlet desert at the northern frontier with solar obelisks and eternal pharaoh tombs.',
      resourcesEs: ['Pirita Solar', 'Ágata Roja', 'Lingote de Pirita', 'Placa Solar'],
      resourcesEn: ['Solar Pyrite', 'Red Agate', 'Pyrite Ingot', 'Solar Plate'],
      monstersEs: ['Escarabajo Solar', 'Esqueleto Espadachín', 'Lancero de Catacumbas', 'Necrófago de Arena'],
      monstersEn: ['Solar Scarab', 'Skeleton Swordsman', 'Catacomb Lancer', 'Sand Ghoul']
    },
    {
      id: 'glaciar_profundo',
      zone: 4,
      wing: 'east',
      islands: 49,
      dungeons: 6,
      color: '#6bb0c9',
      accent: '#e0f7fa',
      icon: 'assets/sprites_v13/icons/relic_v13_67.png',
      gate: 'assets/sprites_v13/gates/gate_glaciar.png',
      swatch: 'assets/sprites_v13/biomes/glaciar_profundo.png',
      difficultyEs: 'Zona IV · Confín Este (Nv. 411–460)',
      difficultyEn: 'Zone IV · East Frontier (Lv. 411–460)',
      nameEs: 'Glaciar Profundo',
      nameEn: 'Deep Glacier',
      wingLabelEs: 'Confín Este',
      wingLabelEn: 'Outer East',
      descEs: 'Hielo eterno milenario congelado al cero absoluto en la frontera este, custodiado por dragones de escarcha y colosos.',
      descEn: 'Millennial absolute-zero ice shelf on the eastern rim guarded by frost dragons and colossi.',
      resourcesEs: ['Hielo Eterno', 'Bismuto Astral', 'Lingote Glacial', 'Azurita'],
      resourcesEn: ['Eternal Ice', 'Astral Bismuth', 'Glacial Ingot', 'Azurite'],
      monstersEs: ['Dragón Glacial Menor', 'Ojo Espectral', 'Caballero Sombrío'],
      monstersEn: ['Lesser Frost Dragon', 'Spectral Eye', 'Shadow Knight']
    },
    {
      id: 'cienaga_putrida',
      zone: 4,
      wing: 'south',
      islands: 21,
      dungeons: 6,
      color: '#466146',
      accent: '#aeea00',
      icon: 'assets/sprites_v13/icons/dust_veneno.png',
      gate: 'assets/sprites_v13/gates/gate_pantano.png',
      swatch: 'assets/sprites_v13/biomes/cienaga_putrida.png',
      difficultyEs: 'Zona IV · Confín Sur (Nv. 461–505)',
      difficultyEn: 'Zone IV · South Frontier (Lv. 461–505)',
      nameEs: 'Ciénaga Pútrida',
      nameEn: 'Putrid Swamp',
      wingLabelEs: 'Confín Sur',
      wingLabelEn: 'Outer South',
      descEs: 'Manglares bioluminiscentes al sur profanados por esporas letales, resina tóxica e hidras venenosas.',
      descEn: 'Bioluminescent southern mangroves corrupted by lethal spores, toxic resin, and plague hydras.',
      resourcesEs: ['Resina Tóxica', 'Flor de Pantano', 'Polvo Venenoso', 'Esporas'],
      resourcesEn: ['Toxic Resin', 'Swamp Bloom', 'Venom Dust', 'Spores'],
      monstersEs: ['Cieno Pútrido Viviente', 'Micónido de Espora Letal', 'Sabueso Tóxico'],
      monstersEn: ['Living Putrid Mire', 'Lethal Spore Myconid', 'Toxic Hound']
    },
    {
      id: 'necropolis_osea',
      zone: 4,
      wing: 'south',
      islands: 38,
      dungeons: 6,
      color: '#737570',
      accent: '#ce93d8',
      icon: 'assets/sprites_v13/icons/ore_hueso.png',
      gate: 'assets/sprites_v13/gates/gate_necro.png',
      swatch: 'assets/sprites_v13/biomes/necropolis_osea.png',
      difficultyEs: 'Zona IV · Sur-Este/Oeste (Nv. 506–545)',
      difficultyEn: 'Zone IV · SE/SW Rim (Lv. 506–545)',
      nameEs: 'Necrópolis Ósea',
      nameEn: 'Bone Necropolis',
      wingLabelEs: 'Brumas SO / SE',
      wingLabelEn: 'SW / SE Mists',
      descEs: 'Cementerios de gigantes en las esquinas australes, dominados por archiliches, criptas silenciosas y reyes óseos.',
      descEn: 'Giant bone graveyards in the southern corners ruled by archliches and bone monarchs.',
      resourcesEs: ['Hueso Fósil', 'Mármol Oscuro', 'Plata Maldita', 'Lingote Óseo'],
      resourcesEn: ['Fossil Bone', 'Dark Marble', 'Cursed Silver', 'Bone Ingot'],
      monstersEs: ['Vampiro de Penumbra', 'Calavera Archiliche', 'Aparición Etérea', 'Espectro de Tumba'],
      monstersEn: ['Dusk Vampire', 'Archlich Skull', 'Ethereal Apparition', 'Grave Revenant']
    },
    {
      id: 'tierras_malditas',
      zone: 4,
      wing: 'west',
      islands: 49,
      dungeons: 6,
      color: '#6b2029',
      accent: '#ff1744',
      icon: 'assets/sprites_v13/icons/ore_maldito.png',
      gate: 'assets/sprites_v13/gates/gate_maldita.png',
      swatch: 'assets/sprites_v13/biomes/tierras_malditas.png',
      difficultyEs: 'Zona IV · CLÍMAX ABISAL (Nv. 546–600)',
      difficultyEn: 'Zone IV · ABYSSAL CLIMAX (Lv. 546–600)',
      nameEs: 'Tierras Malditas',
      nameEn: 'Cursed Lands',
      wingLabelEs: 'Confín Oeste Final',
      wingLabelEn: 'Final West Frontier',
      descEs: 'La frontera occidental definitiva. El cielo arde en rojo eclipse sobre la Ciudadela del Espadachín Carmesí Abisal (#75).',
      descEn: 'The ultimate western frontier beneath a crimson eclipse sky—home to the Abyssal Crimson Swordsman (#75).',
      resourcesEs: ['Cristal Carmesí Abisal', 'Plata Maldita', 'Placa Maldita', 'Singularidades Omega'],
      resourcesEn: ['Abyssal Crimson Crystal', 'Cursed Silver', 'Cursed Plate', 'Omega Singularities'],
      monstersEs: ['Sabueso de Sangre Abisal', 'Gárgola Cornuda del Abismo', 'Fuego Fatuo del Eclipse', 'Saqueador del Eclipse'],
      monstersEn: ['Abyssal Bloodhound', 'Horned Abyss Gargoyle', 'Eclipse Wisp', 'Eclipse Raider']
    }
  ],

  bossHighlights: [
    {
      icon: 'assets/icons_extra/llave_maestra.png',
      titleEs: '75 Mazmorras · 3 Fases',
      titleEn: '75 Dungeons · 3 Phases',
      descEs: 'Salas de runas, acertijos secuenciales, trampas y efectos visuales Gigapack.',
      descEn: 'Rune rooms, sequential puzzles, traps, and Gigapack visual effects.'
    },
    {
      icon: 'assets/sprites_v13/icons/relic_v13_52.png',
      titleEs: '92 Reliquias Permanentes',
      titleEn: '92 Permanent Relics',
      descEs: '75 reliquias únicas de jefes más 17 reliquias secretas en bóveda.',
      descEn: '75 unique boss relics plus 17 secret vault discoveries.'
    }
  ],

  bossAttacks: [
    { nameEs: 'Torbellino 360°', nameEn: '360° Whirlwind' },
    { nameEs: 'Paso Espectral', nameEn: 'Phantom Step' },
    { nameEs: 'Estocadas Carmesí', nameEn: 'Crimson Lunges' },
    { nameEs: 'Fisuras Abisales', nameEn: 'Abyssal Fissures' }
  ],

  omegaGear: [
    { nameEs: 'Casco Omega (R16)', nameEn: 'Omega Helm (T16)', icon: 'assets/icons_extra/casco_omega.png', rarity: 'legendario' },
    { nameEs: 'Armadura Omega (R16)', nameEn: 'Omega Armor (T16)', icon: 'assets/icons_extra/armadura_omega.png', rarity: 'legendario' },
    { nameEs: 'Grebas Gravitatorias (R16)', nameEn: 'Graviton Greaves (T16)', icon: 'assets/icons_extra/pantalones_omega.png', rarity: 'legendario' },
    { nameEs: 'Botas Omega (R16)', nameEn: 'Omega Boots (T16)', icon: 'assets/icons_extra/botas_omega.png', rarity: 'legendario' },
    { nameEs: 'Escudo Omega (R16)', nameEn: 'Omega Shield (T16)', icon: 'assets/icons_extra/escudo_omega.png', rarity: 'legendario' },
    { nameEs: 'Hoja de la Singularidad', nameEn: 'Singularity Blade', icon: 'assets/icons_extra/hoja_singularidad.png', rarity: 'abyssal' },
    { nameEs: 'Espada del Eclipse (R15)', nameEn: 'Eclipse Blade (T15)', icon: 'assets/sprites_v13/icons/wep_eclipse_blade.png', rarity: 'abyssal' },
    { nameEs: 'Singularidad Cósmica', nameEn: 'Cosmic Singularity', icon: 'assets/icons_extra/singularidad.png', rarity: 'epico' }
  ],

  relicsShowcase: [
    {
      id: 'corazon_eclipse_carmesi',
      nameEs: 'Corazón del Eclipse Carmesí',
      nameEn: 'Heart of the Crimson Eclipse',
      icon: 'assets/sprites_v13/icons/relic_v13_52.png',
      rarity: 'abyssal',
      sourceEs: 'Jefe #75 · Espadachín Carmesí Abisal (Tierras Malditas)',
      sourceEn: 'Boss #75 · Abyssal Crimson Swordsman (Cursed Lands)',
      effectEs: '+150 Vida máx., +35% Daño global, +30% Daño a Jefes, +18% Crítico, +15% Reducción de daño y +3.5 HP/s.',
      effectEn: '+150 Max HP, +35% Global Damage, +30% Boss Damage, +18% Crit, +15% Damage Reduction & +3.5 HP/s.'
    },
    {
      id: 'ojo_abismo_singularity',
      nameEs: 'Ojo del Abismo Primordial',
      nameEn: 'Eye of the Primordial Abyss',
      icon: 'assets/sprites_v13/icons/relic_v13_51.png',
      rarity: 'epico',
      sourceEs: 'Jefe #74 · Vigilante del Vacío Azathoth',
      sourceEn: 'Boss #74 · Void Watcher Azathoth',
      effectEs: '+26% Poder mágico, -15% Enfriamiento de hechizos y +45 Energía máxima.',
      effectEn: '+26% Spell Power, -15% Spell Cooldown & +45 Max Energy.'
    },
    {
      id: 'efigie_rey_cosecha',
      nameEs: 'Efigie del Rey de la Cosecha',
      nameEn: 'Effigy of the Harvest King',
      icon: 'assets/sprites_v13/icons/relic_v13_50.png',
      rarity: 'legendario',
      sourceEs: 'Jefe #73 · Espectro Dullahan (Tierras Malditas)',
      sourceEn: 'Boss #73 · Dullahan Specter (Cursed Lands)',
      effectEs: '+22% Doble Botín, +20% Suerte y +22% Monedas de oro.',
      effectEn: '+22% Double Drop, +20% Luck & +22% Gold Coins.'
    },
    {
      id: 'corona_soverano_huesos',
      nameEs: 'Corona del Soberano de los Huesos',
      nameEn: 'Crown of the Bone Sovereign',
      icon: 'assets/sprites_v13/icons/relic_v13_46.png',
      rarity: 'legendario',
      sourceEs: 'Necrópolis Ósea (Trono de los Mil Huesos)',
      sourceEn: 'Bone Necropolis (Throne of a Thousand Bones)',
      effectEs: '+12% Golpe crítico, +20% Daño global y +15% Experiencia.',
      effectEn: '+12% Crit Chance, +20% Global Damage & +15% XP Gain.'
    },
    {
      id: 'filacteria_archiliche',
      nameEs: 'Filacteria del Archiliche',
      nameEn: 'Archlich Phylactery',
      icon: 'assets/sprites_v13/icons/relic_v13_45.png',
      rarity: 'epico',
      sourceEs: 'Necrópolis Ósea (Torre del Archiliche)',
      sourceEn: 'Bone Necropolis (Archlich Tower)',
      effectEs: '+24% Poder de hechizos y +70 Vida máxima permanente.',
      effectEn: '+24% Spell Power & +70 permanent Max HP.'
    },
    {
      id: 'caliz_sangre_maldita',
      nameEs: 'Cáliz de Sangre Maldita',
      nameEn: 'Chalice of Cursed Blood',
      icon: 'assets/sprites_v13/icons/relic_v13_47.png',
      rarity: 'epico',
      sourceEs: 'Tierras Malditas (Sagrario de Sangre)',
      sourceEn: 'Cursed Lands (Blood Sanctuary)',
      effectEs: '+14 Curación al matar, +2.5 HP/s y +80 Vida máxima.',
      effectEn: '+14 Heal on Kill, +2.5 HP/s & +80 Max HP.'
    },
    {
      id: 'crisol_almas_condenadas',
      nameEs: 'Crisol de Almas Condenadas',
      nameEn: 'Crucible of Damned Souls',
      icon: 'assets/sprites_v13/icons/relic_v13_49.png',
      rarity: 'raro',
      sourceEs: 'Tierras Malditas (Forja de las Almas)',
      sourceEn: 'Cursed Lands (Soul Forge)',
      effectEs: '+25% Potencia de minería y tala, más +20% Velocidad de ataque.',
      effectEn: '+25% Mining & Logging Power plus +20% Attack Speed.'
    },
    {
      id: 'medallon_solario',
      nameEs: 'Medallón del Solario',
      nameEn: 'Medallion of the Solarium',
      icon: 'assets/icons_extra/medallon_solar.png',
      rarity: 'epico',
      sourceEs: 'Desierto Dorado · Faraón Radiante Ra-Men',
      sourceEn: 'Golden Desert · Radiant Pharaoh Ra-Men',
      effectEs: '+20% Daño contra Jefes, +140 Radio de luz y +12% Daño global.',
      effectEn: '+20% Boss Damage, +140 Light Radius & +12% Global Damage.'
    },
    {
      id: 'perla_turquesa_relic',
      nameEs: 'Reliquia de Perla Abisal',
      nameEn: 'Abyssal Pearl Relic',
      icon: 'assets/sprites_v13/icons/relic_v13_61.png',
      rarity: 'raro',
      sourceEs: 'Archipiélago Coral · Palacio del Leviatán',
      sourceEn: 'Coral Archipelago · Leviathan Palace',
      effectEs: '+18% Velocidad de nado y movimiento, más +25% Suerte de pesca.',
      effectEn: '+18% Swim/Move Speed & +25% Fishing Luck.'
    },
    {
      id: 'jade_ancestral_relic',
      nameEs: 'Talismán de Jade Ancestral',
      nameEn: 'Ancestral Jade Talisman',
      icon: 'assets/sprites_v13/icons/relic_v13_72.png',
      rarity: 'raro',
      sourceEs: 'Selva Esmeralda · Santuario del Tótem',
      sourceEn: 'Emerald Jungle · Ancestral Totem Sanctuary',
      effectEs: '+22% Cosecha doble y regeneración constante de energía.',
      effectEn: '+22% Double Harvest & steady stamina regeneration.'
    },
    {
      id: 'hielo_eterno_relic',
      nameEs: 'Corazón del Cero Absoluto',
      nameEn: 'Heart of Absolute Zero',
      icon: 'assets/sprites_v13/icons/relic_v13_67.png',
      rarity: 'epico',
      sourceEs: 'Glaciar Profundo · Soberano Escarchado',
      sourceEn: 'Deep Glacier · Frosted Sovereign',
      effectEs: '+16 Defensa, inmunidad a congelación y aura ralentizadora.',
      effectEn: '+16 Defense, freeze immunity & chilling aura.'
    },
    {
      id: 'bismuto_astral_relic',
      nameEs: 'Prisma de Bismuto Astral',
      nameEn: 'Astral Bismuth Prism',
      icon: 'assets/sprites_v13/icons/relic_v13_41.png',
      rarity: 'legendario',
      sourceEs: 'Secreta · Vestigios Estelares (17 Secretas)',
      sourceEn: 'Secret · Stellar Vestiges (17 Secret Relics)',
      effectEs: '+15% Puntos Astrales adicionales y +18% Poder elemental.',
      effectEn: '+15% Bonus Astral XP & +18% Elemental Power.'
    },
    {
      id: 'linterna_flotante',
      nameEs: 'Linterna Flotante Espiritual',
      nameEn: 'Floating Spirit Lantern',
      icon: 'assets/icons/lantern.png',
      rarity: 'comun',
      sourceEs: 'Jefe #1 · Rey Limo (Pradera Esmeralda)',
      sourceEn: 'Boss #1 · Slime King (Emerald Meadow)',
      effectEs: 'Ilumina la oscuridad nocturna (+165 radio de luz) y +10% Suerte.',
      effectEn: 'Illuminates the night (+165 light radius) & +10% Luck.'
    },
    {
      id: 'brujula_estelar',
      nameEs: 'Brújula Estelar de las Dunas',
      nameEn: 'Dunes Starlight Compass',
      icon: 'assets/ui/rpg_compass.png',
      rarity: 'poco_comun',
      sourceEs: 'Jefe · Gólem de Cristal (Desierto Dorado)',
      sourceEn: 'Boss · Crystal Golem (Golden Desert)',
      effectEs: '+100 Alcance de imán de botín y +12% Velocidad de exploración.',
      effectEn: '+100 Loot Magnet range & +12% Exploration Speed.'
    },
    {
      id: 'corazon_umbrio',
      nameEs: 'Corazón Umbrío Inmortal',
      nameEn: 'Immortal Shadow Heart',
      icon: 'assets/icons/heart_crimson.png',
      rarity: 'raro',
      sourceEs: 'Bosque Oscuro · Rey Exánime',
      sourceEn: 'Dark Forest · Lich King',
      effectEs: '+50 Vida máxima permanente y +8 de vida al derrotar enemigos.',
      effectEn: '+50 permanent Max HP & +8 HP per kill.'
    },
    {
      id: 'corona_escarcha',
      nameEs: 'Cáliz de Escarcha Eterna',
      nameEn: 'Chalice of Eternal Frost',
      icon: 'assets/icons/crown_sovereign.png',
      rarity: 'epico',
      sourceEs: 'Montañas Heladas · Coloso de Escarcha',
      sourceEn: 'Frozen Mountains · Frost Colossus',
      effectEs: '+10 Defensa permanente, -20% gasto de energía y +10% crítico.',
      effectEn: '+10 Defense, -20% energy cost & +10% crit chance.'
    },
    {
      id: 'pluma_fenix',
      nameEs: 'Pluma del Fénix Solar',
      nameEn: 'Solar Phoenix Feather',
      icon: 'assets/icons/pendant_phoenix.png',
      rarity: 'legendario',
      sourceEs: 'Tierras Volcánicas · Señor Ígneo Balak',
      sourceEn: 'Volcanic Lands · Fire Lord Balak',
      effectEs: 'Inmunidad a quemaduras, daño ígneo adicional y renacimiento parcial.',
      effectEn: 'Burn immunity, bonus fire damage & emergency revival spark.'
    },
    {
      id: 'cristal_carmesi_secret',
      nameEs: 'Fragmento del Eclipse Oculto',
      nameEn: 'Hidden Eclipse Fragment',
      icon: 'assets/sprites_v13/icons/relic_v13_74.png',
      rarity: 'abyssal',
      sourceEs: 'Reliquia Secreta #17 · Tierras Malditas',
      sourceEn: 'Secret Relic #17 · Cursed Lands',
      effectEs: 'Desbloquea resonancia abisal y potencia las armas de Singularidad.',
      effectEn: 'Unlocks abyssal resonance & empowers Singularity weaponry.'
    }
  ],

  systemTabs: [
    {
      id: 'combat',
      icon: 'assets/icons/sword.png',
      labelEs: 'Combate y Hechizos',
      labelEn: 'Combat & Spells',
      headlineEs: '81 Enemigos, 18 Hechizos y Arsenal de 23 Rangos',
      headlineEn: '81 Enemies, 18 Spells & 23-Tier Arsenal',
      summaryEs: 'Domina el combate direccional con Hana Caraka alternando entre espadas, lanzas, arcos, ballestas, báculos y 18 grimorios arcanos en tiempo real.',
      summaryEn: 'Master directional action combat as Hana Caraka, swapping between swords, spears, bows, crossbows, staves, and 18 arcane grimoires.',
      cards: [
        {
          icon: 'assets/icons/sword.png',
          titleEs: '8 Herramientas × 23 Rangos',
          titleEn: '8 Tools × 23 Tiers',
          descEs: 'Progresa desde Madera y Piedra hasta Oricalco (R13), los 7 metales de bioma Coral→Maldito (R14–R20), Legendaria (R21), Celestial (R22) y el equipo Omega R23 + Hoja de la Singularidad.',
          descEn: 'Advance from Wood & Stone to Orichalcum (T13), 7 Biome Metals Coral→Cursed Silver (T14–T20), Legendary (T21), Celestial (T22), and Tier 23 Omega + Singularity Blade.'
        },
        {
          icon: 'assets/icons_extra/grimorio_arcano.png',
          titleEs: '18 Hechizos y Grimorios',
          titleEn: '18 Spells & Grimoires',
          descEs: 'Misil Arcano, Bola de Fuego, Nova de Escarcha, Cadena de Rayos, Paso Etéreo, Égida Arcana, Sifón Vital y Lluvia de Meteoros.',
          descEn: 'Arcane Missile, Fireball, Frost Nova, Chain Lightning, Ethereal Step, Arcane Aegis, Vital Siphon, and Meteor Rain.'
        },
        {
          icon: 'assets/icons_extra/spell_lightning.png',
          titleEs: '81 Tipos de Enemigos + Jefes',
          titleEn: '81 Enemy Types + Bosses',
          descEs: 'Cada bioma alberga criaturas diurnas y nocturnas exclusivas, además de 75 jefes únicos con mecánicas por fases.',
          descEn: 'Each biome hosts unique diurnal & nocturnal creatures alongside 75 multi-phase dungeon bosses.'
        }
      ]
    },
    {
      id: 'omega',
      icon: 'assets/sprites_extra/bld_omega_nexo.png',
      labelEs: 'Automatización Omega',
      labelEn: 'Omega Automation',
      headlineEs: '93 Edificios, Logística e Industria Omega',
      headlineEn: '93 Buildings, Logistics & Omega Industry',
      summaryEs: 'Transforma tus islas en una red industrial automatizada con tuberías logísticas, extractores de núcleo, reactores de singularidad y almacén virtual.',
      summaryEn: 'Turn your islands into a self-running industrial grid with logistic pipes, deep core extractors, singularity reactors, and virtual storage.',
      cards: [
        {
          icon: 'assets/sprites_extra/bld_omega_nexo.png',
          titleEs: 'Nexo Central y Almacén Virtual',
          titleEn: 'Central Nexus & Virtual Warehouse',
          descEs: 'Conecta Pilones de Enlace y Acumuladores Cuánticos (+40.000 W·s) para abastecer tu red y consultar todos tus materiales en vivo.',
          descEn: 'Link Pylons and Quantum Batteries (+40,000 W·s) to power your archipelago and browse unified storage.'
        },
        {
          icon: 'assets/sprites_extra/bld_omega_reactor.png',
          titleEs: 'Maquinaria y Reactores Omega',
          titleEn: 'Omega Machines & Reactors',
          descEs: 'Trituradora, Lavadora Arcana, Fundidora Omega, Sintetizador de Gemas, Domo Hidropónico, Extractor Profundo y Reactor de Singularidad.',
          descEn: 'Crusher, Arcane Washer, Omega Smelter, Gem Synthesizer, Hydroponic Dome, Deep Extractor, and Singularity Reactor.'
        },
        {
          icon: 'assets/sprites_extra/bld_omega_torreta.png',
          titleEs: 'Defensa, Simulación y Abismo Infinito',
          titleEn: 'Defense, Simulation & Infinite Abyss',
          descEs: 'Torretas de Prisma Omega, Balizas de Sobrecarga (+60% velocidad), Cámara de Simulación de Jefes y la mazmorra sin fin El Abismo Infinito.',
          descEn: 'Omega Prism Turrets, Overcharge Beacons (+60% speed), Boss Simulation Chamber, and The Infinite Abyss endless dungeon.'
        }
      ]
    },
    {
      id: 'astral',
      icon: 'assets/icons/xp_orb.png',
      labelEs: 'Árbol Astral (345)',
      labelEn: 'Astral Tree (345)',
      headlineEs: '345 Nodos en 5 Constelaciones Estelares',
      headlineEn: '345 Nodes Across 5 Star Constellations',
      summaryEs: 'Cada nivel otorga Puntos de Constelación para desbloquear mejoras permanentes en 5 ramas radiales con costo progresivo de Rango 1 a Rango 10.',
      summaryEn: 'Every level grants Constellation Points to unlock permanent upgrades across 5 radial branches with progressive Tier 1–10 scaling.',
      constellations: [
        { nameEs: 'Recolección y Cultivo', nameEn: 'Gathering & Farming', color: '#81c784', nodes: 69, descEs: 'Velocidad de picado, doble botín, capacidad de mochilas y cosechas.', descEn: 'Mining speed, double drops, backpack capacity & crop yields.' },
        { nameEs: 'Economía y Comercio', nameEn: 'Economy & Trade', color: '#ffd54f', nodes: 69, descEs: 'Multiplicadores de oro, descuentos en islas, tesorerías y comercio.', descEn: 'Gold multipliers, island discounts, treasuries & royal trade.' },
        { nameEs: 'Combate y Defensa', nameEn: 'Combat & Defense', color: '#ff7043', nodes: 69, descEs: 'Daño crítico, vida máxima, robo de vida, poder arcano y maestría.', descEn: 'Crit damage, max HP, lifesteal, spell power & weapon mastery.' },
        { nameEs: 'Oficios y Cocina', nameEn: 'Crafting & Cooking', color: '#64b5f6', nodes: 69, descEs: 'Eficiencia de hornos, velocidad de máquinas Omega y recetas.', descEn: 'Smelting efficiency, Omega machine speed & culinary buffs.' },
        { nameEs: 'Exploración', nameEn: 'Exploration', color: '#ce93d8', nodes: 69, descEs: 'Velocidad de movimiento, recarga de esquive y suerte.', descEn: 'Movement speed, dash cooldown reduction & rare luck.' }
      ]
    },
    {
      id: 'relics',
      icon: 'assets/sprites_extra/chest_gold_open.png',
      labelEs: 'Reliquias y Encantamientos',
      labelEn: 'Relics & Enchants',
      headlineEs: 'Bóveda de 92 Reliquias y 25 Encantamientos',
      headlineEn: '92-Relic Vault & 25 Enchantments',
      summaryEs: 'Explora una muestra interactiva del Cofre de Reliquias (75 de Jefes + 17 Secretas). Haz clic en cualquier ranura para inspeccionar su origen y bonificación pasiva.',
      summaryEn: 'Browse an interactive preview of the Relic Chest (75 Boss + 17 Secret). Click any slot to inspect its origin and passive bonus.',
      isRelicVault: true,
      extraBadgesEs: ['13 Encantamientos de Herramienta', '12 Encantamientos de Armadura', '56 Logros Desbloqueables', '12 Secretos Ocultos'],
      extraBadgesEn: ['13 Tool Enchantments', '12 Armor Enchantments', '56 Unlockable Achievements', '12 Hidden Secrets']
    },
    {
      id: 'village',
      icon: 'assets/sprites_extra/bld_granja.png',
      labelEs: 'Granja, Pesca y Aldea',
      labelEn: 'Farming, Fishing & Village',
      headlineEs: 'Vida en el Archipiélago: Corrales, Pesca, 8 Personajes y 7 Altares',
      headlineEn: 'Archipelago Life: Livestock, Fishing, 8 NPCs & 7 Altars',
      summaryEs: 'Equilibra la acción con la gestión viva de tu aldea bajo un ciclo dinámico de día y noche que transforma criaturas, iluminación y música.',
      summaryEn: 'Balance intense dungeon raids with cozy island life under a dynamic day/night cycle.',
      cards: [
        {
          icon: 'assets/sprites_extra/bld_granja.png',
          titleEs: 'Corrales y Agricultura',
          titleEn: 'Corrals & Agriculture',
          descEs: 'Cuida ovejas, vacas y patos con cepillado y ordeño; cultiva tomates, fresas reales, berenjenas y flores de cristal.',
          descEn: 'Tend sheep, cows, and ducks; grow tomatoes, royal strawberries, eggplants, and crystal blooms.'
        },
        {
          icon: 'assets/icons/fishing_rod.png',
          titleEs: 'Pesca en 23 Rangos y Biomas',
          titleEn: '23-Tier Biome Fishing',
          descEs: 'Mejora tu caña del Rango 1 al 23 con cebos especiales para pescar truchas doradas, peces abisales, peces de lava y tesoros hundidos.',
          descEn: 'Upgrade fishing rods across 23 tiers with special baits to reel in golden trout, lava fish, and sunken chests.'
        },
        {
          icon: 'assets/icons/sun.png',
          titleEs: '8 Aldeanos, 7 Altares y Día/Noche',
          titleEn: '8 NPCs, 7 Altars & Day/Night Cycle',
          descEs: 'Cumple misiones de Eldrin, Zara, Lyra, Bjorn e Ignis, activa bendiciones en 7 altares rúnicos y prepárate para la fauna nocturna.',
          descEn: 'Complete questlines for Eldrin, Zara, Lyra, Bjorn & Ignis, activate 7 ancient altars, and brave nocturnal monsters.'
        }
      ]
    }
  ],

  patchNotes: {
    '2.0.0-rc2': {
      id: '2.0.0-rc2',
      label: 'Beta 2.0.0 RC2',
      pill: 'BETA 2.0.0 RC2',
      subtitleEs: 'Rework Visual HD Abyssea, Mascotas, Eventos, Ciclo Lunar y Re-Auditoría Total',
      subtitleEn: 'Abyssea HD Texture Overhaul, Pets, Dynamic Events, Lunar Cycle & Full Re-Audit',
      heroTitleEs: 'ABYSSEA — Notas de la Versión Beta 2.0.0 RC2',
      heroTitleEn: 'ABYSSEA — Beta 2.0.0 RC2 Release Notes',
      heroSubEs: 'Gran actualización integral con rework completo de texturas HD vectorizadas, rebrand oficial a Abyssea, mascotas activas, eventos dinámicos, ciclo lunar, encuentros marinos, hitboxes precisas, mapa mundial rediseñado y re-auditoría funcional completa.',
      heroSubEn: 'Major overhaul introducing full vectorized HD textures, official Abyssea rebrand, active companion pets, dynamic events, 5-phase lunar cycle, marine encounters, zero-clipping hitboxes, redesigned World Map markers, and a full system-wide functional re-audit.',
      sectionsEs: [
        {
          badge: 'REDISEÑO VISUAL Y ABYSSEA',
          color: '#5be3d1',
          icon: 'assets/icons/abyssea_core.png',
          title: 'Rebrand Oficial a Abyssea, Texturas HD, Mapa Rediseñado y Hitboxes Precisas',
          items: [
            'Nuevo logo degradado continuo de biomas (esmeralda costero a abismo carmesí), iconos minimalistas monocromáticos blancos en el menú principal, diorama animado dividido y Discord Rich Presence actualizado a Beta 2.0.0 RC2.',
            'Auditoría visual 1 por 1 en entradas de mazmorras, estructuras, nodos de los 14 biomas, cultivos, props e iconos + 42 sprites HD vectorizados nuevos para contenido RC2.',
            'Restauración de spritesheets animados originales para ovejas (idle, caminar y pastar), vacas, cerdos, conejos y patos con movimiento orgánico suavizado.',
            'Hitboxes y colisiones totalmente recalibradas para que Hana no pueda meterse dentro de ninguna roca, árbol, estructura, NPC o pared, y bordes entre biomas suavizados sin líneas ni cortes bruscos.',
            'Mapa del Mundo rediseñado con etiquetas de precio compactas sin solapamientos y marcadores vectoriales minimalistas nítidos.'
          ]
        },
        {
          badge: 'ARCHIPIÉLAGO VIVO',
          color: '#ffd54f',
          icon: 'assets/icons/moon.png',
          title: 'Mascotas Activas, Eventos Dinámicos, Ciclo Lunar y Encuentros Marinos',
          items: [
            '5 Mascotas Compañeras Activas (Limo Dorado, Cangrejo Coralino, Búho Astral, Espíritu Ígneo y Pez Linterna Abisal) que siguen a Hana recogiendo botín, lanzando ataques e iluminando, más Aldeanos Especialistas en tus cabañas.',
            'Eventos Dinámicos Interactivos: Incursiones de Isla, Pulso Nocturno Abisal, Clima por Bioma (tormentas de arena, ventiscas, ceniza carmesí, lluvia ácida) y Barco Mercader Fantasma con tienda rotativa rara.',
            'Ciclo Lunar de 5 fases (Luna Nueva, Cuarto Creciente, Luna Llena, Luna de Sangre y Eclipse Astral) afectando magia, cultivos, pesca exótica y Esencia Lunar.',
            'Encuentros Marinos: Remolinos Abisales de pesca rara y el Jefe Costero Leviatán con 3 tentáculos destruibles que sueltan Perlas de Leviatán.'
          ]
        },
        {
          badge: 'COMBATE Y MAZMORRAS',
          color: '#ff5252',
          icon: 'assets/icons/sword.png',
          title: 'Esquiva Perfecta, 6 Afijos Roguelike, Sinergias de Sets y Rebalance',
          items: [
            'Ventana de Esquiva Perfecta con breve invulnerabilidad, destello slow-mo, recuperación de energía y crítico garantizado en el siguiente golpe.',
            '6 Afijos Roguelike de Mazmorra (Suelo Volcánico, Enemigos Veloces, Lluvia de Oro, Maná Infinito, Furia Crítica y Eco Vampírico) con recompensas extra.',
            'Sinergias completas de sets de armadura (2/4/5 piezas) y Maestría del Bestiario revelando drops y bonos permanentes por especie.',
            'Rebalance integral del daño de enemigos y jefes en los 14 biomas y 75 mazmorras eliminando golpes letales injustos.'
          ]
        },
        {
          badge: 'BASE, ECONOMÍA Y CALIDAD DE VIDA',
          color: '#81c784',
          icon: 'assets/icons/chest.png',
          title: 'Salón de Trofeos, Balizas, Cetro de Traslado, Gremio y Modo Foto',
          items: [
            'Salón de Trofeos (Museo) con bonos permanentes globales y Balizas de Teletransporte para viaje rápido directo desde el Mapa del Mundo.',
            'Cetro de Traslado para mover cofres y máquinas sin perder contenido, botón "Guardar iguales" en cofres y filtros por categoría en Cofres Logísticos.',
            'Trampas de cebo automáticas en Muelles de Pesca, crianza en Estanques, Altar de Ofrendas a la carta, Preservación de Rareza y Catalizador de Reforja para las 62 armas, y Demanda Diaria Dinámica en el Mercado.',
            'Contratos Semanales del Gremio con auras cosméticas para Hana, guía "¿Qué hago ahora?", soporte para mando (Gamepad API), overlay de música desactivado por defecto y Modo Foto mejorado (F9/F8/P + cámara WASD + captura PNG).'
          ]
        },
        {
          badge: 'RE-AUDITORÍA FUNCIONAL',
          color: '#b388ff',
          icon: 'assets/icons/anvil.png',
          title: 'Correcciones Críticas de Estabilidad y 18 Recetas Nuevas',
          items: [
            'Corregidos el error al llenar inventario en addItem, modificadores al equipar mochilas, entrada/escalado del Abismo Infinito, inicialización Omega y consumo real de pociones/pergaminos de buff.',
            'Reparadas todas las recetas de alquimia, rituales y legado, habilitados los 5 cebos y tablas de pesca/taladro en los 14 biomas, y añadidas 18 recetas nuevas para dar uso real a cada material.'
          ]
        }
      ],
      sectionsEn: [
        {
          badge: 'VISUAL OVERHAUL & ABYSSEA',
          color: '#5be3d1',
          icon: 'assets/icons/abyssea_core.png',
          title: 'Official Abyssea Rebrand, HD Textures, Redesigned Map & Precision Hitboxes',
          items: [
            'New smooth continuous biome-gradient Abyssea logo (emerald coast to crimson abyss), monochrome white minimalist title icons, split animated archipelago diorama, and updated Discord Rich Presence for Beta 2.0.0 RC2.',
            '1-by-1 visual quality audit across all dungeon gates, structures, 14-biome nodes, crops, props, and icons, plus 42 brand-new vectorized HD sprites for RC2 content.',
            'Restored authentic animated multi-frame farm animal spritesheets (Tiny Swords sheep idle/walk/graze + 3x2 animated cow, pig, rabbit, and duck) with smooth organic movement.',
            'Fully recalibrated zero-clipping hitboxes across rocks, trees, structures, NPCs, gates, and dungeons, plus seamless feathered biome borders with zero harsh lines or drips.',
            'Redesigned World Map with compact non-overlapping island price pills, crisp minimalist vector markers, and matching SVG legend.'
          ]
        },
        {
          badge: 'LIVING ARCHIPELAGO',
          color: '#ffd54f',
          icon: 'assets/icons/moon.png',
          title: 'Active Pets, Dynamic Events, Lunar Cycle & Marine Encounters',
          items: [
            '5 Active Companion Pets (Golden Slime, Coral Crab, Astral Owl, Ember Spirit, Abyssal Lanternfish) with auto-loot, combat projectiles, and light passives, plus Specialist Villagers roaming your cottages.',
            'Dynamic Interactive Events: Island Raids, Abyssal Night Pulses, Biome Weather (Sandstorms, Blizzards, Crimson Ash, Acid Rain), and the Ghost Merchant Ship with rotating rare stock.',
            '5-Phase Lunar Cycle (New Moon, Waxing Quarter, Full Moon, Blood Moon, Astral Eclipse) impacting magic, crops, exotic fishing, and Lunar Essence drops.',
            'Marine Encounters: Deep-Sea Whirlpools with rare fishing luck and the Coastal Leviathan Boss with 3 destructible tentacles dropping Leviathan Pearls.'
          ]
        },
        {
          badge: 'COMBAT & DUNGEONS',
          color: '#ff5252',
          icon: 'assets/icons/sword.png',
          title: 'Perfect Dodge, 6 Roguelike Affixes, Set Synergies & Combat Rebalance',
          items: [
            'Perfect Dodge timing window granting brief invulnerability, slow-mo flash, energy recovery, and a guaranteed critical strike.',
            '6 Roguelike Dungeon Affixes (Volcanic Floor, Swift Foes, Rain of Gold, Infinite Mana, Critical Fury, Vampiric Echo) with bonus loot.',
            'Full Armor Set Synergies (2/4/5 pieces) and Bestiary Mastery tiers revealing enemy drop tables and species damage bonuses.',
            'Full combat damage rebalance across all 14 biomes and 75 dungeons eliminating unfair instant one-shots.'
          ]
        },
        {
          badge: 'BASE, ECONOMY & QOL',
          color: '#81c784',
          icon: 'assets/icons/chest.png',
          title: 'Trophy Hall, Beacons, Relocator Scepter, Guild Shop & Photo Mode',
          items: [
            'Trophy Hall Museum with permanent archipelago-wide milestones and Archipelago Teleport Beacons for instant fast travel from the World Map.',
            'Structure Relocator Scepter to move chests & machines without losing contents, Chest Stack-All button, and Logistic Chest category filters.',
            'Fishing Dock automated bait traps, Fish Pond breeding, Offering Altar a-la-carte buffs, Rarity Preservation & Reforge Catalysts for all 62 weapons, and Daily Dynamic Market Demand.',
            'Weekly Guild Contracts & Token Shop with cosmetic Hana auras, "What To Do Now?" guide, Gamepad API support, music overlay off by default, and Enhanced Photo Mode (F9/F8/P + WASD camera + PNG capture).'
          ]
        },
        {
          badge: 'FULL FUNCTIONAL RE-AUDIT',
          color: '#b388ff',
          icon: 'assets/icons/anvil.png',
          title: 'Critical Stability Fixes & 18 New Utility Recipes',
          items: [
            'Fixed full-inventory addItem crash, backpack equip modifiers, Endless Abyss entry/scaling, Omega building init, and buff potion/scroll consumption.',
            'Fixed all broken alchemy/ritual/legacy recipes, enabled all 5 baits and 14-biome fishing/auto-drill tables, and added 18 new recipes giving every material real gameplay utility.'
          ]
        }
      ]
    },
    '1.3.3': {
      id: '1.3.3',
      label: 'Beta 1.3.3',
      pill: 'BETA v1.3.3',
      subtitleEs: 'Actualización Beta 1.3.3 — Progresión de 23 Tiers y Omega Late-Game',
      subtitleEn: 'Beta 1.3.3 Update — 23-Tier Progression & True Late-Game Omega',
      heroTitleEs: 'ABYSSEA — Notas de la Versión Beta 1.3.3',
      heroTitleEn: 'ABYSSEA — Beta 1.3.3 Release Notes',
      heroSubEs: 'Expansión integral de herramientas y las 5 piezas de armadura hasta 23 tiers completos: los 7 metales de Zona III y IV pasan a formar la escalera principal T14–T20, seguidos por Legendaria (T21), Celestial (T22) y Omega de Singularidad (T23).',
      heroSubEn: 'Full 23-tier progression expansion across all 8 tools and 5 armor slots: all 7 Zone III-IV biome metals become the core T14-T20 ladder, crowned by Legendary (T21), Celestial (T22), and Singularity Omega (T23) late-game gear.',
      sectionsEs: [
        {
          badge: '23 TIERS DE EQUIPO',
          color: '#e040fb',
          icon: 'assets/icons_extra/casco_omega.png',
          title: 'Metales de Bioma T14–T20 y Verdadero Late-Game Omega T23',
          items: [
            'Todas las 8 herramientas y las 5 ranuras de armadura (Casco, Coraza, Escudo, Botas y Pantalones) ahora progresan del Tier 1 al Tier 23 sin saltos.',
            'Tras Oricalco (T13), progresas por los 7 metales de Zona III y IV: Coralina (T14), Boreal (T15), Selvana (T16), Escoria Ígnea (T17), Pirita Solar (T18), Glacial Eterna (T19) y Plata Maldita / Abismal (T20).',
            'Legendaria (T21) y Celestial (T22) superan el equipo de bioma, y Omega (T23) queda reservado al late-game definitivo exigiendo investigación Metalurgia Omega, Singularidades y Materia Comprimida.',
            'Nuevas botas, grebas, yelmos, escudos y coraza glaciar para completar cada set de Zona III–IV, además de paletas visuales propias por tier.'
          ]
        },
        {
          badge: 'BALANCE Y CRAFTEO',
          color: '#81c784',
          icon: 'assets/icons/anvil.png',
          title: 'Cero Bloqueos y Validación Estricta de Investigación Omega',
          items: [
            'Mejora del Pico a Cobre (T3) liberada de exigir Forja previa para eliminar el bloqueo mutuo con el Hierro; Hierro T4+ conserva el requisito de Forja.',
            'Validación estricta de la investigación Metalurgia Omega en recetas, herramientas y armaduras T23.',
            'Requisitos de pico por mineral reequilibrados paso a paso en los 14 biomas de Zonas I–IV.'
          ]
        }
      ],
      sectionsEn: [
        {
          badge: '23 GEAR TIERS',
          color: '#e040fb',
          icon: 'assets/icons_extra/casco_omega.png',
          title: 'T14–T20 Biome Metals & True Late-Game Omega T23',
          items: [
            'All 8 tools and all 5 armor slots (Helm, Armor, Shield, Boots, Greaves) now scale continuously from Tier 1 to Tier 23.',
            'After Orichalcum (T13), progress sequentially through all 7 Zone III & IV biome metals: Coraline (T14), Boreal (T15), Emerald Jungle (T16), Caldera Slag (T17), Solar Pyrite (T18), Eternal Glacier (T19), and Cursed Silver / Abyssal (T20).',
            'Legendary (T21) and Celestial (T22) scale above all biome gear, while Omega (T23) stands as true late-game requiring Omega Metallurgy research, Singularities, and Compressed Matter.',
            'Added missing biome boots, greaves, helms, shields, and glacier armor for full 5-piece sets, plus distinct tool pixel palettes.'
          ]
        },
        {
          badge: 'BALANCE & FORGING',
          color: '#81c784',
          icon: 'assets/icons/anvil.png',
          title: 'Zero Forging Deadlocks & Strict Omega Research Gating',
          items: [
            'Upgrading tools to Copper (T3) no longer requires a Forge first, eliminating the Iron/Forge circular dependency while keeping Forge mandatory for Iron (T4+).',
            'Enforced Omega Metallurgy research checks across Recipes, Tool Upgrades, and Armor Upgrades.',
            'Smooth step-by-step Pickaxe mining requirements aligned across all 14 biomes in Zones I–IV.'
          ]
        }
      ]
    },
    '1.3.2': {
      id: '1.3.2',
      label: 'Beta 1.3.2',
      pill: 'BETA v1.3.2',
      subtitleEs: 'Actualización Beta 1.3.2 — Bloqueo de Mazmorras por Bioma y Correcciones',
      subtitleEn: 'Beta 1.3.2 Update — Dungeon Progression Biome Lock & Polish',
      heroTitleEs: 'ABYSSEA — Notas de la Versión Beta 1.3.2',
      heroTitleEn: 'ABYSSEA — Beta 1.3.2 Release Notes',
      heroSubEs: 'Bloqueo estricto de acceso a mazmorras según progresión de biomas descubiertos en el archipiélago, corrección de atajo indebido al Jefe Final, resiliencia contra iconos rotos y tipografía limpia.',
      heroSubEn: 'Strict dungeon access gating requiring island/biome exploration, removal of premature final boss bypass, resilient procedural canvas fallbacks, and clean typography.',
      sectionsEs: [
        {
          badge: 'SANTUARIO Y BIOMAS',
          color: '#ff5252',
          icon: 'assets/icons_extra/llave_maestra.png',
          title: 'Bloqueo Estricto de Mazmorras por Progresión',
          items: [
            'El Santuario de Mazmorras valida estrictamente la progresión del mundo: acceder a una mazmorra requiere explorar y desbloquear su bioma primero.',
            'Se eliminó el botón de atajo directo al Jefe Final. La Ciudadela del Eclipse Carmesí requiere desbloquear las Tierras Malditas.',
            'Las mazmorras en biomas aún no alcanzados se muestran bloqueadas (🔒) indicando el bioma requerido.'
          ]
        },
        {
          badge: 'TEXTURAS E ICONOS',
          color: '#4fc3f7',
          icon: 'assets/icons_extra/cristal_datos.png',
          title: 'Resiliencia Total contra Iconos Rotos',
          items: [
            'Nuevo sistema de fallback automático a canvas procedimental en caso de texturas faltantes o demoradas.',
            'Nombres limpios en etiquetas alt para evitar que se muestren códigos técnicos como ov_ce o ov_fi.',
            'Soporte directo para iconos concordantes de cera de abeja, fibra vegetal y armaduras avanzadas.'
          ]
        },
        {
          badge: 'ESTABILIDAD Y WEB',
          color: '#69f0ae',
          icon: 'assets/icons/backpack.png',
          title: 'Contador de Descargas y Codificación UTF-8',
          items: [
            'El contador de descargas de la página oficial se mantiene sincronizado de forma segura sin reiniciarse.',
            'Revisión y verificación completa de codificación UTF-8 en todas las fichas de construcción y descripciones.'
          ]
        }
      ],
      sectionsEn: [
        {
          badge: 'DUNGEONS & BIOMES',
          color: '#ff5252',
          icon: 'assets/icons_extra/llave_maestra.png',
          title: 'Strict Biome Lock for Dungeon Sanctuary',
          items: [
            'Dungeon Sanctuary strictly validates biome progression: entering a dungeon now requires unlocking its island/biome first.',
            'Removed premature direct boss teleport bypass. Access to the Crimson Citadel requires reaching the Tierras Malditas.',
            'Locked dungeons are grayed out with a lock badge showing the required biome.'
          ]
        },
        {
          badge: 'TEXTURES & ICONS',
          color: '#4fc3f7',
          icon: 'assets/icons_extra/cristal_datos.png',
          title: 'Total Resiliency Against Missing Icons',
          items: [
            'Automated procedural canvas fallback for any missing or delayed inventory item icon.',
            'Clean alt labels preventing raw technical prefixes like ov_ce or ov_fi from ever showing.',
            'Concordant icons for beeswax, vegetable fiber, and advanced gear.'
          ]
        },
        {
          badge: 'STABILITY & WEB',
          color: '#69f0ae',
          icon: 'assets/icons/backpack.png',
          title: 'Download Counter & UTF-8 Text',
          items: [
            'Official site download counter guarded against resetting.',
            'Full UTF-8 verification across all building inspectors, cards and tooltips.'
          ]
        }
      ]
    },
    '1.3.1': {
      id: '1.3.1',
      label: 'Beta 1.3.1',
      pill: 'BETA v1.3.1',
      subtitleEs: 'Actualización Beta 1.3.1 — Nivel de Hechizos, Red Omega & Optimización Visual',
      subtitleEn: 'Beta 1.3.1 Update — Spell Leveling, Omega Power & Visual Overhaul',
      heroTitleEs: 'ABYSSEA — Notas de la Versión Beta 1.3.1',
      heroTitleEn: 'ABYSSEA — Beta 1.3.1 Release Notes',
      heroSubEs: 'Mejora completa de la red eléctrica, auto-recolección del Nexo Central, subida de nivel de hechizos en el Grimorio, portal directo al Jefe Final, balance de proporciones 2x2 y corrección de texturas.',
      heroSubEn: 'Complete power grid overhaul, Central Nexus fuel auto-vacuum, spell leveling in the Grimorio, direct Final Boss portal, 2x2 building resizing, and concordant textures.',
      sectionsEs: [
        {
          badge: 'RED OMEGA',
          color: '#80d8ff',
          icon: 'assets/icons/energy.png',
          title: 'Nexo Central Autónomo & Generadores de Energía',
          items: [
            'El Nexo Central auto-absorbe periódicamente drops y combustibles en la isla hacia su almacén virtual.',
            'Los generadores de vapor, geotérmicos, arcanos y de singularidad ahora toman combustible del Nexo, de su almacén interno o del inventario del jugador.',
            'El Reactor Geotérmico genera calor geotérmico pasivo constante en biomas volcánicos aun sin combustible.'
          ]
        },
        {
          badge: 'HECHIZOS & GRIMORIO',
          color: '#b388ff',
          icon: 'assets/icons_extra/grimorio_divino.png',
          title: 'Sistema de Nivel de Hechizos (Nv. 1 a 5)',
          items: [
            'Sube de nivel todos tus hechizos en el Grimorio usando monedas y cristales mágicos.',
            'Cada nivel aumenta un +25% el daño, reduce el tiempo de recarga un -8% y reduce el coste de maná.',
            'Misil Arcano dispara 3 proyectiles a Nv.3+ y 4 a Nv.5; radio explosivo y congelación ampliados.'
          ]
        },
        {
          badge: 'AUTOMATIZACIÓN',
          color: '#69f0ae',
          icon: 'assets/icons_extra/cofre_logistico_ico.png',
          title: 'Torre Recolectora Inteligente & Basurero',
          items: [
            'La Torre Recolectora abastece de combustible a máquinas cercanas y deposita excedentes directamente en el Nexo Central.',
            'Corrección integral del Basurero: ahora permite eliminar objetos de tu inventario e incinerarlos permanentemente sin bloqueos de barra rápida.'
          ]
        },
        {
          badge: 'MAZMORRAS & VISUALES',
          color: '#ff5252',
          icon: 'assets/icons_extra/rel_corazon_eclipse.png',
          title: 'Portal Directo al Jefe Final & Texturas Concordantes',
          items: [
            'El Santuario de Mazmorras incluye un botón heroico para acceder directamente a la arena del Espadachín Carmesí Abisal.',
            'Redimensionado a 2x2 de edificios grandes (Bancos, Casas de Comercio, Torres y Observatorios) y escala equilibrada del basurero.',
            'Nuevos iconos concordantes e independientes para cera de abeja, fibra vegetal, armaduras avanzadas y reliquias.',
            'Corrección integral de codificación tipográfica UTF-8 en todos los menús y diálogos.'
          ]
        }
      ],
      sectionsEn: [
        {
          badge: 'OMEGA POWER',
          color: '#80d8ff',
          icon: 'assets/icons/energy.png',
          title: 'Autonomous Central Nexus & Energy Generators',
          items: [
            'The Central Nexus now passively pulls ground drops and fuels across the island into its virtual buffer.',
            'Steam, Geothermal, Arcane, and Singularity generators pull fuels from the Nexus, internal storage, or player inventory.',
            'Geothermal Reactor produces baseline passive energy in volcanic biomes even without fuel.'
          ]
        },
        {
          badge: 'SPELLS & GRIMOIRE',
          color: '#b388ff',
          icon: 'assets/icons_extra/grimorio_divino.png',
          title: 'Spell Leveling System (Lv. 1 to 5)',
          items: [
            'Upgrade all spells in the Grimoire using coins and magic crystals.',
            'Each level grants +25% damage, -8% cooldown reduction, and mana cost savings.',
            'Arcane Missile fires 3 projectiles at Lv.3+ and 4 at Lv.5; Fireball and Ice Nova radii enlarged.'
          ]
        },
        {
          badge: 'AUTOMATION',
          color: '#69f0ae',
          icon: 'assets/icons_extra/cofre_logistico_ico.png',
          title: 'Smart Collector Tower & Trash Bin Fix',
          items: [
            'The Collector Tower auto-fuels nearby furnaces/forges and deposits gathered loot directly into the Central Nexus.',
            'Trash Bin overhaul: freely discard items without hotbar interference and incinerate permanently.'
          ]
        },
        {
          badge: 'DUNGEONS & VISUALS',
          color: '#ff5252',
          icon: 'assets/icons_extra/rel_corazon_eclipse.png',
          title: 'Direct Final Boss Arena & Concordant Textures',
          items: [
            'Dungeon Sanctuary features a direct teleport button straight to the Crimson Swordsman arena.',
            'Grand buildings resized to 2x2 (Banks, Trade Houses, Towers, Observatories) and balanced trash bin scale.',
            'Concordant standalone icons for beeswax, plant fiber, endgame armors, and relics.',
            'Full UTF-8 typographic encoding fix across all menus and interfaces.'
          ]
        }
      ]
    },
    '1.3.0': {
      id: '1.3.0',
      label: 'Beta 1.3.0',
      pill: 'BETA v1.3.0',
      subtitleEs: 'Gran Expansión Beta 1.3.0 — 361 Islas y Eclipse Carmesí',
      subtitleEn: '361-Island Expansion & Crimson Abyss',
      heroTitleEs: 'ABYSSEA — Notas de la Versión Beta 1.3.0',
      heroTitleEn: 'ABYSSEA — Beta 1.3.0 Release Notes',
      heroSubEs: 'Resumen oficial de las 361 islas, 14 biomas, 75 mazmorras, Jefe Final Carmesí Abisal, bóveda de 92 reliquias y equilibrio Omega.',
      heroSubEn: 'Complete summary of all 361 islands, 14 biomes, 75 dungeons, Final Boss Crimson Swordsman, 92-relic vault, and Omega T16 balance.',
      sectionsEs: [
        {
          badge: 'BETA 1.3.0',
          color: '#ff1744',
          icon: 'assets/sprites_v13/icons/wep_eclipse_blade.png',
          title: 'Jefe Final Supremo: Espadachín Carmesí Abisal (#75)',
          items: [
            'Nuevo jefe final en la mazmorra número 75: Eclipse del Espadachín Carmesí en Tierras Malditas.',
            'Combate completo con Guardia, Carga de Aura, Torbellino 360°, Paso Espectral y Estocada Carmesí.',
            'Otorga Singularidades Cósmicas, Espada del Eclipse Carmesí y la reliquia suprema Corazón del Eclipse Carmesí.'
          ]
        },
        {
          badge: 'MUNDO 19×19',
          color: '#64b5f6',
          icon: 'assets/icons/scroll_map.png',
          title: '361 Islas Direccionales, 14 Biomas y 4 Zonas',
          items: [
            'Mapa expandido de 10×10 a 19×19 (361 islas) centrado en la Zona I (Pradera Esmeralda 3×3).',
            'Distribución climática coherente por orientación: Lava al Oeste, Nieve y Hielo al Este, Desierto al Norte y Selva al Sur.',
            'Bloqueo secuencial Zona I → II → III → IV con 9 biomas nuevos, 17 vetas minerales nuevas y migración automática de partidas anteriores.'
          ]
        },
        {
          badge: '75 MAZMORRAS',
          color: '#ffd54f',
          icon: 'assets/icons_extra/llave_maestra.png',
          title: '75 Mazmorras Únicas, 92 Reliquias y Bóveda en Cuadrícula',
          items: [
            '51 mazmorras nuevas (75 en total) con escenografía por bioma, 18 enemigos nuevos, efectos visuales mejorados y 51 reliquias de jefe adicionales.',
            'Nuevo botón "Reliquias" en el Inventario que abre una cuadrícula compacta estilo cofre para consultar su origen y bonificaciones.'
          ]
        },
        {
          badge: 'EQUILIBRIO Y ARTE',
          color: '#ce93d8',
          icon: 'assets/icons_extra/singularidad.png',
          title: 'Contenido Final Omega R16 y Texturas Renovadas',
          items: [
            'Armadura Omega R16 y Hoja de la Singularidad reforzadas por encima de todo el equipo R9–R15.',
            'Redibujo completo de máquinas, hornos, yunques y edificios Omega, además de limpieza de recetas duplicadas.'
          ]
        }
      ],
      sectionsEn: [
        {
          badge: 'BETA 1.3.0',
          color: '#ff1744',
          icon: 'assets/sprites_v13/icons/wep_eclipse_blade.png',
          title: 'Final Boss: Abyssal Crimson Swordsman (#75)',
          items: [
            'Brand-new climax encounter in Cursed Lands Dungeon #75: Eclipse of the Crimson Swordsman.',
            'Full multi-phase combat featuring Scarlet Aura Charge, 360° Whirlwind, Phantom Cross-Step, and Crimson Lunges.',
            'Drops Cosmic Singularities, Cursed Plates, Crimson Crystals, the Eclipse Blade, and Heart of the Crimson Eclipse.'
          ]
        },
        {
          badge: 'WORLD 19×19',
          color: '#64b5f6',
          icon: 'assets/icons/scroll_map.png',
          title: '361 Directional Islands, 14 Biomes & 4 Zones',
          items: [
            'Expanded archipelago from 10×10 (100 islands) to 19×19 (361 islands) anchored around Zone I (Central Emerald Meadow 3×3).',
            'Directional climate layout keeps Snow strictly East and Lava strictly West, preventing jarring climate clashes.',
            'Strict Zone I → II → III → IV progression lock across 9 brand-new biomes with automatic 10×10 → 19×19 save migration.'
          ]
        },
        {
          badge: '75 DUNGEONS',
          color: '#ffd54f',
          icon: 'assets/icons_extra/llave_maestra.png',
          title: '75 Unique Dungeons, 92 Relics & Chest Vault UI',
          items: [
            'Added 51 new tiered dungeons (75 total) with biome-specific tilesets, 18 new enemies, Gigapack VFX, and 92 permanent relics (75 boss + 17 secret).',
            'Inventory right column features a compact Relics Vault chest grid where clicking any square reveals its effects and source.'
          ]
        },
        {
          badge: 'BALANCE & ART',
          color: '#ce93d8',
          icon: 'assets/icons_extra/singularidad.png',
          title: 'Omega Endgame Rebalance & Texture Overhaul',
          items: [
            'Buffed T16 Omega Armor & Singularity Blade scaling so Omega gear stays strictly stronger than all T9–T15 sets.',
            'Rebuilt dozens of machine sprites (Furnaces, Anvils, Crushers, Omega Extractors, Void Nexus) and removed duplicate recipes.'
          ]
        }
      ]
    },
    '1.2.1': {
      id: '1.2.1',
      label: 'Beta 1.2.1',
      pill: 'BETA v1.2.1',
      subtitleEs: 'Cofres (Acumulación de 1.000), Hana Caraka y Red Omega',
      subtitleEn: 'Chests (1,000 Stacks), Hana Caraka & Omega Grid',
      heroTitleEs: 'ABYSSEA — Notas de la Versión Beta 1.2.1',
      heroTitleEn: 'ABYSSEA — Beta 1.2.1 Release Notes',
      heroSubEs: 'Historial de cambios de la versión anterior Beta 1.2.1 conservado para referencia.',
      heroSubEn: 'Previous release notes kept for reference: 1,000-stack chests, Hana Caraka, and Omega Energy Grid.',
      sectionsEs: [
        {
          badge: 'BETA 1.2.1',
          color: '#ffd54f',
          icon: 'assets/sprites_extra/chest_wood_closed.png',
          title: 'Cofres (Acumulación de 1.000), Guardado y Hana Caraka',
          items: [
            'Capacidad por ranura en cofres aumentada de 100 a 1.000 unidades en todos los cofres físicos y logísticos.',
            'Vista lado a lado de Cofre + Inventario, buscador en vivo, filtros por categoría y nuevo edificio Basurero.',
            'Incorporación de Hana Caraka como protagonista jugable única y números de experiencia simplificados (1M, 250K).'
          ]
        },
        {
          badge: 'INVENTARIO Y EQUIPO',
          color: '#81c784',
          icon: 'assets/icons_extra/pantalones_omega.png',
          title: 'Inventario por Ranuras, Mochilas y Grebas (16 Rangos)',
          items: [
            'Inventario base de 20 ranuras separado de la barra rápida independiente de 9 espacios (29 ranuras iniciales).',
            '3 Mochilas fabricables en el Telar (Cuero R2, Reforzada R5 y Astral R9) y 5.ª ranura de Armadura: Pantalones y Grebas R1–R16.'
          ]
        },
        {
          badge: 'FINAL OMEGA',
          color: '#ce93d8',
          icon: 'assets/icons_extra/singularidad.png',
          title: 'Red de Energía Omega, Automatización y Modo Corrupto',
          items: [
            'Nexo Central Omega, Pilones de Enlace, Acumulador Cuántico, 4 Generadores y 6 Máquinas Procesadoras.',
            'Modo Mazmorra Corrupta (25× dificultad), 13 Tecnologías Omega, Ascensión de Islas (Rangos I–III) y El Abismo Infinito.'
          ]
        }
      ],
      sectionsEn: [
        {
          badge: 'BETA 1.2.1',
          color: '#ffd54f',
          icon: 'assets/sprites_extra/chest_wood_closed.png',
          title: '1,000-Stack Chests, Storage Fixes & Hana Caraka',
          items: [
            'Chest stack limit increased from 100 to 1,000 items per slot across Wooden, Iron, and Golden Runic Chests.',
            'Added side-by-side Chest + Inventory view, live search bar, category filters, and Item Incinerator.',
            'Introduced Hana Caraka as the playable heroine and simplified level XP numbers (1M, 250K).'
          ]
        },
        {
          badge: 'INVENTORY & GEAR',
          color: '#81c784',
          icon: 'assets/icons_extra/pantalones_omega.png',
          title: 'Slot-Based Inventory, Backpacks & 16-Tier Greaves',
          items: [
            '20-slot Inventory decoupled from the 9-slot Hotbar with Shift + Click quick transfer.',
            '3 Craftable Backpacks (Leather T2, Reinforced T5, Astral T9) plus 5th Armor Slot: Leggings & Greaves from Tier 1 to Tier 16.'
          ]
        },
        {
          badge: 'OMEGA ENDGAME',
          color: '#ce93d8',
          icon: 'assets/icons_extra/singularidad.png',
          title: 'Omega Energy Grid, Automation & Corrupted Mode',
          items: [
            'Omega Central Nexus, Link Pylons, Quantum Battery, 4 Generators, and 6 Processing Machines.',
            'Corrupted Dungeon Mode (25× difficulty), 13 Omega Research Technologies, Island Ascension (I–III), and The Infinite Abyss.'
          ]
        }
      ]
    }
  },

  installSteps: {
    es: [
      { step: '01', title: 'Descarga el juego', desc: 'Pulsa el botón dorado de descarga para bajar Balaclava.exe directamente.' },
      { step: '02', title: 'Abre y juega', desc: 'Haz doble clic en Balaclava.exe y empieza a jugar al instante. No necesita instalación.' }
    ],
    en: [
      { step: '01', title: 'Download the game', desc: 'Click the golden download button to download Balaclava.exe directly.' },
      { step: '02', title: 'Open & play', desc: 'Double-click Balaclava.exe to launch right away. No installation required.' }
    ]
  },

  requirements: {
    es: [
      { label: 'Sistema Operativo', min: 'Windows 10 / 11 (64-bit)', rec: 'Windows 11 (64-bit)' },
      { label: 'Motor de Escritorio', min: 'WebView2 (incluido en Win10/11)', rec: 'WebView2 actualizado' },
      { label: 'Procesador', min: 'Arranca hasta en una tostadora', rec: 'Cualquier CPU moderno' },
      { label: 'Memoria RAM', min: '1 GB de RAM', rec: '4 GB de RAM' },
      { label: 'Gráficos', min: 'Integrados con WebGL2 / DirectX 11', rec: 'Cualquier GPU moderna' },
      { label: 'Almacenamiento', min: 'Al menos 50 MB libres', rec: '100 MB libres' }
    ],
    en: [
      { label: 'Operating System', min: 'Windows 10 / 11 (64-bit)', rec: 'Windows 11 (64-bit)' },
      { label: 'Desktop Runtime', min: 'Microsoft WebView2 (built into Win10/11)', rec: 'Updated WebView2' },
      { label: 'Processor', min: 'Runs even on a toaster', rec: 'Any modern CPU' },
      { label: 'Memory (RAM)', min: '1 GB RAM', rec: '4 GB RAM' },
      { label: 'Graphics', min: 'Integrated GPU with WebGL2 / DX11', rec: 'Any modern GPU' },
      { label: 'Storage', min: 'At least 50 MB available space', rec: '100 MB available' }
    ]
  },

  faqs: {
    es: [
      {
        q: '¿Mis partidas de versiones anteriores (10×10 / Beta 1.2.1) siguen sirviendo en Beta 1.3.0?',
        a: 'Sí. Abyssea Beta 1.3.0 incluye migración automática de partidas anteriores (10×10 → 19×19) para conservar tu progreso, inventario, equipo y construcciones sin perder nada.'
      },
      {
        q: '¿Necesito conexión a internet para jugar?',
        a: 'No. Abyssea funciona sin conexión como aplicación nativa de escritorio en Windows mediante Tauri 2 (con integración opcional de estado en Discord si tienes Discord abierto).'
      },
      {
        q: '¿Está disponible en Español y en Inglés?',
        a: 'Sí. Todo el juego —incluyendo interfaz, biomas, objetos, reliquias, misiones de aldeanos, árbol astral y notas del parche— es completamente bilingüe (ES / EN).'
      },
      {
        q: '¿Cómo desbloqueo las 4 Zonas del Archipiélago 19×19?',
        a: 'Comienzas en el centro de la Pradera Esmeralda (Zona I). Cada isla vecina muestra su precio en oro en el Atlas; los biomas siguen progresión secuencial Zona I → II → III → IV para mantener una curva climática y de dificultad coherente.'
      },
      {
        q: '¿Dónde reporto errores, comparto mi fábrica Omega o sugiero ideas?',
        a: 'Únete al servidor oficial de Discord en discord.gg/8wrsjRSMY2 para seguir actualizaciones, compartir capturas y conversar con la comunidad.'
      }
    ],
    en: [
      {
        q: 'Do my older saves (10×10 / Beta 1.2.1) still work in Beta 1.3.0?',
        a: 'Yes! Abyssea Beta 1.3.0 includes automatic save migration (10×10 → 19×19) so you keep your inventory, gear, structures, and progress safely.'
      },
      {
        q: 'Do I need an internet connection to play?',
        a: 'No. Abyssea runs 100% offline as a native Windows desktop app powered by Tauri 2 (with optional Discord Rich Presence when Discord is running).'
      },
      {
        q: 'Is the game fully translated in Spanish and English?',
        a: 'Yes. The entire game—UI, biomes, items, relics, NPC questlines, Astral Tree, and patch notes—is fully bilingual (ES / EN).'
      },
      {
        q: 'How do I unlock all 4 Zones of the 19×19 Archipelago?',
        a: 'You start at the center of Emerald Meadow (Zone I). Adjacent islands can be purchased with gold on the Atlas following the sequential Zone I → II → III → IV progression lock.'
      },
      {
        q: 'Where can I report bugs or share my Omega factory?',
        a: 'Join the official Discord community at discord.gg/8wrsjRSMY2 to follow updates, share screenshots, and chat directly with the community.'
      }
    ]
  },

  i18n: {
    es: {
      pageTitle: 'ABYSSEA — RPG Pixel-Art de Exploración, Automatización y Mazmorras (Beta 2.0.0 RC2)',
      ariaBrand: 'Abyssea Inicio',
      ariaNav: 'Navegación principal',
      ariaLang: 'Cambiar idioma Español / Inglés',
      ariaBurger: 'Abrir menú',
      ariaModalClose: 'Cerrar',
      navFeatures: 'Características',
      navWorld: 'Mundo y Biomas',
      navBoss: 'Jefe Final',
      navSystems: 'Sistemas',
      navPatch: 'Notas del Parche',
      navDownload: 'Descargar',
      navPlay: 'Jugar Online',
      heroRibbon: 'RPG DE ACCIÓN · AUTOMATIZACIÓN · MAZMORRAS',
      heroSubtitle: 'Explora un archipiélago direccional de 361 islas, domina 75 mazmorras, automatiza maquinaria Omega y enfrenta al Espadachín Carmesí Abisal.',
      heroBtnPlayWeb: 'Jugar en Tu Navegador',
      heroBtnPlayBadge: 'SIN DESCARGA',
      heroBtnDownload: 'Descargar para Windows',
      heroBtnDiscord: 'Unirse a Discord',
      heroBtnKofi: 'Apoyar en Ko-fi',
      heroBtnPatch: 'Notas Beta 2.0.0 RC2',
      heroMetaPrefix: 'Gratis para Windows',
      heroDevCredit: 'Desarrollado por LalleL (Luveey)',
      statsTitle: 'Todo el Contenido de Beta 2.0.0 RC2',
      worldTag: 'MUNDO ABIERTO · 19×19 DIRECCIONAL',
      worldTitle: 'Explora las 4 Zonas y 14 Biomas',
      worldSub: 'Progresión secuencial Zona I → II → III → IV con distribución climática coherente: la nieve al Este nunca toca la lava del Oeste.',
      mapHint: 'Haz clic o pasa el cursor sobre cualquier isla del Atlas 19×19 o en los botones de bioma para inspeccionar recursos, monstruos y dificultad.',
      mapNorth: 'N · Arena y Coral',
      mapEast: 'E · Hielo y Cristal',
      mapSouth: 'S · Bosque, Selva y Necrópolis',
      mapWest: 'O · Volcán, Ceniza y Maldito',
      inspectorIslands: 'Islas',
      inspectorDungeons: 'Mazmorras',
      inspectorResources: 'Recursos y Minerales Principales',
      inspectorMonsters: 'Criaturas y Enemigos',
      bossTag: 'JEFE FINAL · MAZMORRA #75 · CLÍMAX ABISAL',
      bossTitle: 'El Jefe Final y las 75 Mazmorras',
      bossName: 'Espadachín Carmesí Abisal',
      bossHpTag: 'VIDA ×30 · DAÑO ×10',
      bossLocation: 'Eclipse del Espadachín Carmesí · Tierras Malditas (Oeste)',
      bossSummary: '75 mazmorras únicas con salas de runas, acertijos secuenciales, llaves de jefe, cofres temáticos, efectos visuales Gigapack y combates por fases (Vida ×30 / Daño ×10).',
      bossAttacksTitle: 'Habilidades del Jefe Final',
      bossDropsTitle: 'Botín Supremo y Conjunto Final Omega R23',
      bossDropsSub: 'Culmina tu aventura forjando el conjunto Rango 23 Omega y la Hoja de la Singularidad, o empuña la Espada del Eclipse Carmesí.',
      systemsTag: 'PROFUNDIDAD RPG Y AUTOMATIZACIÓN',
      systemsTitle: 'Sistemas de Abyssea',
      systemsSub: 'Alterna entre combate arcano, red eléctrica Omega, constelaciones astrales, bóveda de 92 reliquias y vida isleña.',
      constellationBadge: '69 NODOS',
      relicVaultCount: 'Muestra interactiva de la Bóveda (92 Reliquias: 75 de Jefes + 17 Secretas)',
      relicClickHint: 'Haz clic en cualquier ranura de la cuadrícula para ver su efecto real y origen.',
      patchTag: 'HISTORIAL OFICIAL DE VERSIONES',
      patchTitle: 'Notas de la Versión',
      patchSub: 'Selector idéntico al menú principal del juego: consulta todas las novedades de Beta 2.0.0 RC2 o el historial de versiones anteriores.',
      downloadTag: 'DESCARGA OFICIAL PARA ESCRITORIO',
      downloadTitle: 'Descarga e Instalación',
      downloadSub: 'Construido para Windows mediante Tauri 2. Descarga directa y sencilla para escritorio.',
      downloadBtnPrimary: 'Descargar Abyssea',
      downloadBtnMirror: 'Enlace Alternativo',
      downloadMetaVersion: 'Versión',
      downloadMetaSize: 'Peso',
      downloadMetaDate: 'Fecha',
      downloadMetaPlatform: 'Plataforma',
      installTitle: 'Pasos de Instalación',
      reqsTitle: 'Requisitos de Sistema (Windows)',
      reqsColSpec: 'Componente',
      reqsColMin: 'Mínimo',
      reqsColRec: 'Recomendado',
      faqTag: 'PREGUNTAS FRECUENTES',
      faqTitle: 'Preguntas Frecuentes',
      footerDesc: 'RPG pixel-art 2D cenital de exploración isleña, mazmorras, automatización Omega y combate de acción para Windows (Tauri 2).',
      footerDiscord: 'Comunidad Oficial en Discord',
      footerKofi: 'Apoyar en Ko-fi',
      modalPlaceholderTitle: 'Enlace de Descarga Pendiente de Configurar',
      modalPlaceholderBody: 'El enlace de descarga de esta versión aún no se ha publicado. Cuando lo añadas en site-config.js, este botón iniciará la descarga directa para Windows.'
    },
    en: {
      pageTitle: 'ABYSSEA — Pixel Action RPG, Automation & Dungeons (Beta 2.0.0 RC2)',
      ariaBrand: 'Abyssea Home',
      ariaNav: 'Main navigation',
      ariaLang: 'Switch language Spanish / English',
      ariaBurger: 'Open menu',
      ariaModalClose: 'Close',
      navFeatures: 'Features',
      navWorld: 'World & Biomes',
      navBoss: 'Final Boss',
      navSystems: 'Systems',
      navPatch: 'Patch Notes',
      navDownload: 'Download',
      navPlay: 'Play Online',
      heroRibbon: 'ACTION RPG · AUTOMATION · DUNGEONS',
      heroSubtitle: 'Explore a 361-island directional archipelago, conquer 75 dungeons, automate Omega machinery, and face the Abyssal Crimson Swordsman.',
      heroBtnPlayWeb: 'Play in Your Browser',
      heroBtnPlayBadge: 'NO DOWNLOAD',
      heroBtnDownload: 'Download for Windows',
      heroBtnDiscord: 'Join Discord',
      heroBtnKofi: 'Support on Ko-fi',
      heroBtnPatch: 'Beta 2.0.0 RC2 Notes',
      heroMetaPrefix: 'Free for Windows',
      heroDevCredit: 'Developed by LalleL (Luveey)',
      statsTitle: 'Everything Inside Beta 2.0.0 RC2',
      worldTag: 'OPEN WORLD · 19×19 DIRECTIONAL',
      worldTitle: 'Explore 4 Zones & 14 Biomes',
      worldSub: 'Sequential Zone I → II → III → IV progression with coherent climate borders: Eastern ice never touches Western lava.',
      mapHint: 'Click or hover any island on the 19×19 Atlas or the biome pills to inspect primary resources, enemies, and difficulty.',
      mapNorth: 'N · Sand & Coral',
      mapEast: 'E · Ice & Crystal',
      mapSouth: 'S · Woods, Jungle & Necropolis',
      mapWest: 'W · Volcano, Ash & Cursed',
      inspectorIslands: 'Islands',
      inspectorDungeons: 'Dungeons',
      inspectorResources: 'Primary Ores & Resources',
      inspectorMonsters: 'Creatures & Enemies',
      bossTag: 'FINAL BOSS · DUNGEON #75 · ABYSSAL CLIMAX',
      bossTitle: 'The Final Boss & 75 Dungeons',
      bossName: 'Abyssal Crimson Swordsman',
      bossHpTag: 'HP ×30 · DMG ×10',
      bossLocation: 'Eclipse of the Crimson Swordsman · Cursed Lands (West)',
      bossSummary: '75 unique dungeons featuring rune rooms, sequential puzzles, boss keys, themed chests, Gigapack VFX, and multi-phase boss fights (HP ×30 / DMG ×10).',
      bossAttacksTitle: 'Final Boss Abilities',
      bossDropsTitle: 'Supreme Loot & Tier 23 Omega Endgame Set',
      bossDropsSub: 'Reach the pinnacle of progression with Tier 23 Omega Armor, the Singularity Blade, and the Crimson Eclipse Blade.',
      systemsTag: 'RPG DEPTH & INDUSTRIAL AUTOMATION',
      systemsTitle: 'Game Systems',
      systemsSub: 'Switch between arcane combat, Omega power grids, 345 Astral constellation nodes, the 92-relic vault, and cozy island life.',
      constellationBadge: '69 NODES',
      relicVaultCount: 'Interactive Vault Preview (92 Relics: 75 Boss + 17 Secret)',
      relicClickHint: 'Click any chest grid cell to inspect its passive bonus and origin.',
      patchTag: 'OFFICIAL RELEASE HISTORY',
      patchTitle: 'Patch Notes',
      patchSub: 'Mirrors the in-game version switcher: review every addition in Beta 2.0.0 RC2 or browse previous version history.',
      downloadTag: 'OFFICIAL DESKTOP RELEASE',
      downloadTitle: 'Download & Installation',
      downloadSub: 'Built for Windows desktop via Tauri 2. Fast and direct desktop release.',
      downloadBtnPrimary: 'Download Abyssea',
      downloadBtnMirror: 'Alternative Mirror',
      downloadMetaVersion: 'Version',
      downloadMetaSize: 'Size',
      downloadMetaDate: 'Release',
      downloadMetaPlatform: 'Platform',
      installTitle: 'Installation Steps',
      reqsTitle: 'System Requirements (Windows)',
      reqsColSpec: 'Component',
      reqsColMin: 'Minimum',
      reqsColRec: 'Recommended',
      faqTag: 'FREQUENTLY ASKED QUESTIONS',
      faqTitle: 'Frequently Asked Questions',
      footerDesc: '2D top-down pixel-art action RPG with island exploration, 75 dungeons, Omega automation, and farming for Windows (Tauri 2).',
      footerDiscord: 'Official Discord Community',
      footerKofi: 'Support on Ko-fi',
      modalPlaceholderTitle: 'Download Link Not Configured Yet',
      modalPlaceholderBody: 'The release download link for this version has not been linked yet. Once you add your installer URL in site-config.js, this button will trigger the Windows download directly.'
    }
  }
};
