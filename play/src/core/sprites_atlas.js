(function () {
  'use strict';

  const Abyssea = (window.Abyssea = window.Abyssea || {});

  const ROOT = window.ABYSSEA_ROOT_BASE || '';
  const withRoot = (u) => (u && ROOT && u.startsWith('assets/') ? ROOT + u : u);
  const RPG_ICON_BASE = 'assets/packs/Pixel Art Icon Pack - RPG/';
  const RPG16_BASE = 'assets/packs/16x16_RPG_Item_Pack/16x16 RPG Item Pack/';
  const FDA_BASE = 'assets/packs/FantasyDungeonAdventure_v1.0/FantasyDungeonAdventure/';
  const TS_UI_BASE = 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/UI Elements/UI Elements/';
  const RAVEN_BASE = 'assets/packs/Free - Raven Fantasy Icons/Free - Raven Fantasy Icons/Separated Files/32x32/';
  const VERARC_BASE = 'assets/packs/VerArc_Basic_Skills_and_Buffs/';
  const FOOD_BASE = 'assets/packs/Free_pixel_food_16x16/Free_pixel_food_16x16/Icons/';
  const LEGENDS_BASE = 'assets/packs/Legends_of_Fantasy_Icons_32x32/Color 02 Seperate Outline/';

  // Real standalone PNG UI & Icon URLs (safe on file:// without tainted-canvas toDataURL!)
  Abyssea.UI_URLS = {
    avatarHero: 'assets/sprites_extra/hana_caraka/avatar.png',
    iconHammer: TS_UI_BASE + 'Icons/Icon_01.png',
    iconWood: TS_UI_BASE + 'Icons/Icon_02.png',
    iconCoin: 'assets/ui/coin_gold.png',
    iconCoinBlue: 'assets/ui/coin_blue.png',
    bossBar: 'assets/ui/ui_boss_dragon_bar.png',
    iconFood: TS_UI_BASE + 'Icons/Icon_04.png',
    iconSword: TS_UI_BASE + 'Icons/Icon_05.png',
    iconShield: TS_UI_BASE + 'Icons/Icon_06.png',
    iconBow: TS_UI_BASE + 'Icons/Icon_08.png',
    sun: 'assets/icons/sun.png',
    sunrise: 'assets/icons/sunrise.png',
    sunset: 'assets/icons/sunset.png',
    moon: 'assets/icons/moon.png',
    backpack: 'assets/icons/backpack.png',
    anvil: 'assets/icons/anvil.png',
    spellbook: 'assets/icons/spellbook.png',
    xpOrb: 'assets/icons/xp_orb.png',
    skullDeath: 'assets/icons_tiers_v14/items/craneo_maldito.png?v=2.0.3',
    barFrame: 'assets/ui/rpg_bar_frame.png',
    barOrnate: 'assets/ui/rpg_bar_ornate.png',
    barFillHp: FDA_BASE + '08_UI/Bars/fill_health_60x6.png',
    barFillEn: FDA_BASE + '08_UI/Bars/fill_stamina_60x6.png',
    barFillXp: FDA_BASE + '08_UI/Bars/fill_xp_60x6.png',
    scrollMap: 'assets/icons/scroll_map.png',
    trophy: 'assets/icons/trophy.png',
    chest: 'assets/sprites_extra/chest_gold_closed.png',
    campfire: 'assets/icons/campfire.png',
    lantern: 'assets/icons/lantern.png',
    frameCommon: FDA_BASE + '08_UI/Inventory/item_frame_common_20x20.png',
    frameUncommon: FDA_BASE + '08_UI/Inventory/item_frame_uncommon_20x20.png',
    frameRare: FDA_BASE + '08_UI/Inventory/item_frame_rare_20x20.png',
    frameEpic: FDA_BASE + '08_UI/Inventory/item_frame_epic_20x20.png',
    frameLegendary: FDA_BASE + '08_UI/Inventory/item_frame_legendary_20x20.png',
    skillSlotNormal: FDA_BASE + '08_UI/Skills/skill_slot_normal_20x20.png',
    skillSlotSelected: FDA_BASE + '08_UI/Skills/skill_slot_selected_20x20.png',
    skillSlotDisabled: FDA_BASE + '08_UI/Skills/skill_slot_disabled_20x20.png',
    heartFull: FDA_BASE + '08_UI/Hearts_Icons/heart_full.png',
    manaOrb: FDA_BASE + '08_UI/Hearts_Icons/mana_orb_full.png',
    armorFull: FDA_BASE + '08_UI/Hearts_Icons/armor_full.png',
    minimapFrame: 'assets/ui/rpg_compass.png',
    iconSettings: 'assets/ui/ico_gear.png',
    iconMap: RPG_ICON_BASE + 'Misc/Map.png',
    iconBook: RPG_ICON_BASE + 'Misc/Book.png',
    iconScroll: RPG_ICON_BASE + 'Misc/Scroll.png',
    iconKey: RPG_ICON_BASE + 'Misc/Golden Key.png',
    iconMute: 'assets/ui/ico_sound_off.png',
    iconSound: 'assets/ui/ico_sound_on.png',
    iconSave: RPG_ICON_BASE + 'Misc/Scroll.png',
    iconPlay: TS_UI_BASE + 'Icons/Icon_05.png',
    iconCheck: 'assets/ui/ico_check.png',
    iconCross: 'assets/ui/ico_cross.png',
    iconStar: 'assets/ui/ico_star.png',
    iconLock: 'assets/ui/ico_lock.png',
    iconTrash: 'assets/ui/ico_trash.png',
    iconZoomIn: 'assets/ui/ico_zoom_in.png',
    iconZoomOut: 'assets/ui/ico_zoom_out.png',
    iconReset: 'assets/ui/ico_reset.png',
    iconTrophy: 'assets/ui/ico_trophy.png',
    iconSparkle: 'assets/ui/ico_sparkle.png',
    iconHeart: 'assets/ui/ico_heart.png',
    iconHome: 'assets/ui/ico_home.png',
    iconSliders: 'assets/ui/ico_sliders.png',
    iconDiscord: 'assets/ui/ico_discord.png',
    arrowLeft: 'assets/ui/cryo_arrow_left.png',
    arrowRight: 'assets/ui/cryo_arrow_right.png',
    flatArrowLeft: 'assets/ui/ui_flat_btn_arrow_left.png',
    flatArrowRight: 'assets/ui/ui_flat_btn_arrow_right.png',
    waterClasico: 'assets/tiles/water_clasico.png',
    waterProfundo: 'assets/tiles/water_profundo.png',
    waterEsmeralda: 'assets/tiles/water_esmeralda.png',
    waterAbisal: 'assets/tiles/water_abisal.png',
    toggleOn: 'assets/ui/doboui_toggle_on.png',
    toggleOff: 'assets/ui/doboui_toggle_off.png',
    slotSlate: 'assets/ui/rpg_slot_slate.png',
    slotActive: 'assets/ui/rpg_slot_active.png',
    slotHead: 'assets/ui/rpg_equip_head.png',
    slotChest: 'assets/ui/rpg_equip_chest.png',
    slotLegs: 'assets/ui/rpg_equip_pants.png',
    slotWeapon: 'assets/ui/rpg_equip_weapon.png',
    slotOffhand: 'assets/ui/rpg_equip_offhand.png',
    slotFeet: 'assets/ui/rpg_equip_boots.png',
    slotRing: 'assets/ui/rpg_equip_ring.png',
    slotNeck: 'assets/ui/rpg_equip_neck.png',
    kbSheet: 'assets/packs/Controllers and Keyboard/Controllers and Keyboard/kb_light_alphanumeric.png',
    mouseImg: 'assets/packs/Controllers and Keyboard/Controllers and Keyboard/mouse.png',
    rpgHudPanel: 'assets/ui/rpg_hud_panel.png',
    rpgSubcardPanel: 'assets/ui/rpg_subcard_panel.png',
    rpgTooltipPanel: 'assets/ui/rpg_tooltip_panel.png',
    rpgHeaderPlaque: 'assets/ui/rpg_header_plaque.png',
    rpgTabNormal: 'assets/ui/rpg_tab_normal.png',
    rpgTabHover: 'assets/ui/rpg_tab_hover.png',
    rpgTabActive: 'assets/ui/rpg_tab_active.png',
    rpgTabGold: 'assets/ui/rpg_tab_gold.png',
    rpgAvatarFrame: 'assets/ui/rpg_avatar_frame.png',
    rpgCompass: 'assets/ui/rpg_compass.png',
    rpgTargetReticle: 'assets/ui/rpg_target_reticle.png',
    rpgScrollGold: 'assets/ui/rpg_scroll_gold.png',
    rpgScrollSlate: 'assets/ui/rpg_scroll_slate.png',
    skyNebulaBlue: 'assets/ui/sky_nebula_blue.png',
    skyNebulaPurple: 'assets/ui/sky_nebula_purple.png',
    skyStarfield: 'assets/ui/sky_starfield.png',
    buffAttack: 'assets/icons_extra/buff_attack.png',
    buffDefense: 'assets/icons_extra/buff_defense.png',
    buffSwiftness: 'assets/icons_extra/buff_swiftness.png',
    buffRegen: 'assets/icons_extra/buff_regen.png',
    buffLuck: 'assets/icons_extra/buff_luck.png',
    buffXp: 'assets/icons_extra/buff_xp.png',
    buffCrit: 'assets/icons_extra/buff_crit.png',
    biomePradera: 'assets/icons/biome_pradera.png',
    biomeDesierto: 'assets/icons/biome_desierto.png',
    biomeBosque: 'assets/icons/biome_bosque_oscuro.png',
    biomeHielo: 'assets/icons/biome_montanas_heladas.png',
    biomeVolcan: 'assets/icons/biome_tierras_volcanicas.png',
    keyE: 'assets/ui/key_e.png?v=1.6.2',
    keyEPressed: 'assets/ui/key_e_pressed.png?v=1.6.2',
    abysseaLogo: 'assets/ui/abyssea_logo.png?v=2.0.0-rc2',
    titleIcoContinue: 'assets/ui/title_ico_continue.png?v=2.0.0-rc2',
    titleIcoPlay: 'assets/ui/title_ico_play.png?v=2.0.0-rc2',
    titleIcoSettings: 'assets/ui/title_ico_settings.png?v=2.0.0-rc2',
    titleIcoQuit: 'assets/ui/title_ico_quit.png?v=2.0.0-rc2',
    titleIcoPatch: 'assets/ui/title_ico_patch.png?v=2.0.0-rc2',
    titleIcoDiscord: 'assets/ui/title_ico_discord.png?v=2.0.0-rc2',
    titleIcoCredits: 'assets/ui/title_ico_credits.png?v=2.0.0-rc2',
    titleIcoAnchor: 'assets/ui/title_ico_anchor.png?v=2.0.0-rc2',
    abysseaBtnPrimary: 'assets/ui/abyssea_btn_primary.png?v=1.6.5',
    abysseaBtnPrimaryHover: 'assets/ui/abyssea_btn_primary_hover.png?v=1.6.5',
    abysseaBtnNav: 'assets/ui/abyssea_btn_nav.png?v=1.6.5',
    abysseaBtnNavHover: 'assets/ui/abyssea_btn_nav_hover.png?v=1.6.5',
    abysseaBtnDanger: 'assets/ui/abyssea_btn_danger.png?v=1.6.5',
    abysseaBtnDangerHover: 'assets/ui/abyssea_btn_danger_hover.png?v=1.6.5',
    abysseaBtnSq: 'assets/ui/abyssea_btn_sq.png?v=1.6.5',
    abysseaBtnSqHover: 'assets/ui/abyssea_btn_sq_hover.png?v=1.6.5',
    abysseaBtnPill: 'assets/ui/abyssea_btn_pill.png?v=1.6.5',
    abysseaBtnPillHover: 'assets/ui/abyssea_btn_pill_hover.png?v=1.6.5'
  };

  Abyssea.BUFF_ICON_URLS = {
    speed: 'assets/icons_extra/buff_swiftness.png',
    dmg: 'assets/icons_extra/buff_attack.png',
    attack: 'assets/icons_extra/buff_attack.png',
    defense: 'assets/icons_extra/buff_defense.png',
    luck: 'assets/icons_extra/buff_luck.png',
    xp: 'assets/icons_extra/buff_xp.png',
    regen: 'assets/icons_extra/buff_regen.png',
    crit: 'assets/icons_extra/buff_crit.png',
    arcane: 'assets/icons_extra/scroll_purple.png',
    hunter: 'assets/icons_extra/buff_crit.png',
    furia_arcana: 'assets/icons_extra/buff_attack.png',
    titan_skin: 'assets/sprites_v2/alc_piel_adamantita.png?v=2.0.3',
    miner_sight: 'assets/sprites_v2/alc_clarividencia_minera.png?v=2.0.3',
    chrono_haste: 'assets/sprites_v2/alc_crono_velocidad.png?v=2.0.3',
    vampiric_thirst: 'assets/sprites_v2/alc_vampirismo_sanguino.png?v=2.0.3',
    storm_overload: 'assets/sprites_v2/alc_tormenta_electrica.png?v=2.0.3',
    golden_fortune: 'assets/sprites_v2/alc_fortuna_dorada.png?v=2.0.3',
    phantom_step: 'assets/sprites_v2/alc_paso_fantasmal.png?v=2.0.3',
    colossus_might: 'assets/sprites_v2/alc_coloso_titan.png?v=2.0.3',
    radiant_harvest: 'assets/sprites_v2/alc_cosecha_radiante.png?v=2.0.3',
    omega_transcendence: 'assets/sprites_v2/alc_singularidad_omega.png?v=2.0.3'
  };

  // Every item icon key mapped to a real crisp PNG file.
  Abyssea.ITEM_PNG_MAP = {
    wood: RPG_ICON_BASE + 'Material/Wood Log.png',
    plank: RPG_ICON_BASE + 'Material/Wooden Plank.png',
    stone: 'assets/sprites_extra/stewv_stone.png',
    herb: 'assets/icons/herb.png',
    fiber: RPG_ICON_BASE + 'Material/Rope.png',
    berries: 'assets/icons/berries.png',
    seeds: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Wheat/7 - Wheat Pouch Outline.png',
    coal: 'assets/sprites_extra/stewv_coal.png',
    carbon_eterno: 'assets/icons_extra/carbon_eterno.png',
    iron_ore: 'assets/sprites_extra/stewv_iron_ore.png',
    copper_ore: 'assets/sprites_extra/stewv_copper_ore.png',
    gold_ore: 'assets/sprites_extra/stewv_gold_ore.png',
    crystal: 'assets/icons_extra/crystal.png',
    cristal: 'assets/icons_extra/cristal.png',
    cristales: 'assets/icons_extra/cristales.png',
    magic_crystal: 'assets/icons_extra/magic_crystal.png',
    cristal_magico: 'assets/icons_extra/cristal_magico.png',
    cristales_magicos: 'assets/icons_extra/magic_crystal.png',
    cristal_abismal: 'assets/icons_extra/cristal_abismal.png',
    esquirla_hielo: 'assets/icons_extra/esquirla_hielo.png',
    coral_brillante: 'assets/icons_extra/coral_brillante.png',
    leather: RPG_ICON_BASE + 'Material/Leather.png',
    bone: RPG_ICON_BASE + 'Monster Part/Bone.png',
    sand: 'assets/icons/sand.png',
    arena_estelar: 'assets/sprites_extra/stewv_star_sand.png',
    clay: 'assets/sprites_extra/stewv_clay.png',
    diamond: 'assets/icons_extra/diamond.png',
    diamantes: 'assets/icons_extra/diamond.png',
    gema_diamante: 'assets/icons_extra/diamond.png',
    emerald: 'assets/icons_extra/emerald.png',
    esmeraldas: 'assets/icons_extra/emerald.png',
    gema_esmeralda: 'assets/icons_extra/emerald.png',
    ruby: 'assets/icons_extra/ruby.png',
    gema_rubi: 'assets/icons_extra/ruby.png',
    sapphire: 'assets/icons_extra/sapphire.png',
    gema_zafiro: 'assets/icons_extra/sapphire.png',
    gema_jade: 'assets/icons_extra/jade.png',
    ambar: 'assets/icons_extra/ambar.png',
    gema_ambar: 'assets/icons_extra/ambar.png',
    gema_alma: 'assets/icons_extra/gema_alma.png',
    dark_essence: FDA_BASE + '07_Items/Monster_Drops/shadow_essence.png',
    ancient_fragment: RPG_ICON_BASE + 'Misc/Rune Stone.png',
    special_ingot: 'assets/icons_extra/special_ingot.png',
    lingotes_especiales: 'assets/icons_extra/special_ingot.png',
    lingote_mitrilo: 'assets/icons_extra/lingote_mitrilo.png',
    mitrilo_refinado: 'assets/icons_extra/lingote_mitrilo.png',
    volcanic: 'assets/sprites_extra/stewv_volcanic.png',
    escama_obsidiana: 'assets/sprites_extra/stewv_volcanic_core.png',
    brick: 'assets/icons/brick.png',
    glass: 'assets/icons_extra/glass_item.png',
    cloth: RPG_ICON_BASE + 'Material/Fabric.png',
    copper_ingot: 'assets/icons_extra/copper_ingot.png',
    lingote_cobre: 'assets/icons_extra/lingote_cobre.png',
    lingote_bronce: 'assets/icons_extra/lingote_bronce.png',
    iron_ingot: 'assets/icons_extra/iron_ingot.png',
    lingote_hierro: 'assets/icons_extra/lingote_hierro.png',
    gold_ingot: 'assets/icons_extra/gold_ingot.png',
    lingote_oro: 'assets/icons_extra/lingote_oro.png',
    steel_ingot: 'assets/icons_extra/steel_ingot.png',
    lingote_acero: 'assets/icons_extra/lingote_acero.png',
    lingote_plata: 'assets/icons_extra/lingote_plata.png',
    lingote_adamantita: 'assets/icons_extra/lingote_adamantita.png',
    lingote_titanio: 'assets/icons_extra/lingote_titanio.png',
    lingote_celestial: 'assets/icons_extra/lingote_celestial.png',
    lingote_oricalco: 'assets/icons_extra/lingote_adamantita.png',
    gear: RPG_ICON_BASE + 'Misc/Gear.png',
    seeds_carrot: 'assets/icons/seeds_carrot.png',
    seeds_pumpkin: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Pumpkin/7 - Pumpkin Pouch Outline.png',
    seeds_crystal: 'assets/icons/seeds_crystal.png',
    seeds_tomato: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Tomato/7 - Tomato Pouch Outline.png',
    seeds_potato: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Potato/7 - Potato Pouch Outline.png',
    seeds_corn: RAVEN_BASE + 'fb417.png',
    seeds_eggplant: RAVEN_BASE + 'fb423.png',
    seeds_chili: RAVEN_BASE + 'fb420.png',
    seeds_strawberry: RAVEN_BASE + 'fb421.png',
    seeds_grapes: RAVEN_BASE + 'fb424.png',
    wheat: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Wheat/6 - Wheat Inventory Outline.png',
    carrot: 'assets/icons/carrot.png',
    pumpkin: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Pumpkin/6 - Pumpkin Inventory Outline.png',
    crystal_flower: 'assets/icons_extra/flor_cristal.png',
    crop_potato: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Potato/6 - Potato Inventory Outline.png',
    food_ration: FDA_BASE + '07_Items/Food/ration.png',
    food_pastry: 'assets/icons_extra/pastry.png',
    flour: 'assets/icons/flour.png',
    wool: 'assets/icons/wool.png',
    meat: RPG_ICON_BASE + 'Food/Meat.png',
    egg: FDA_BASE + '07_Items/Food/egg.png',
    milk: 'assets/icons/milk.png',
    mushroom: RPG_ICON_BASE + 'Food/Mushroom.png',
    cactus: 'assets/icons/cactus.png',
    fish_common: 'assets/icons/fish_common.png',
    fish_gold: 'assets/icons/fish_gold.png',
    fish_dark: 'assets/icons/fish_dark.png',
    fish_ice: 'assets/icons/fish_ice.png',
    fish_lava: 'assets/icons/fish_lava.png',
    bread: RPG_ICON_BASE + 'Food/Bread.png',
    pan_maiz: FOOD_BASE + 'pastry_brioche.png',
    steak: RPG_ICON_BASE + 'Food/Ham.png',
    trucha_asada: 'assets/icons_extra/trucha_asada.png',
    cangrejo_asado: 'assets/icons_extra/cangrejo_asado.png',
    stew: FDA_BASE + '07_Items/Food/stew.png',
    sopa_pescado: RAVEN_BASE + 'fb527.png',
    potion_hp: 'assets/icons_extra/potion_hp.png',
    potion_spd: 'assets/icons_extra/potion_spd.png',
    jugo_uva: 'assets/icons_extra/jugo_uva.png',
    potion_night: 'assets/icons_extra/potion_night.png',
    potion_luck: 'assets/icons_extra/potion_luck.png',
    potion_harvest: 'assets/icons_extra/potion_harvest.png',
    armor_leather: RPG_ICON_BASE + 'Equipment/Leather Armor.png',
    armor_wood: FDA_BASE + '07_Items/Armor/chestplate_wood.png',
    leggings_wood: 'assets/icons_extra/pantalones_cuero.png',
    leggings_leather: 'assets/icons_extra/pantalones_cuero.png',
    leggings_bronce: 'assets/icons_extra/pantalones_bronce.png',
    leggings_cobre: 'assets/icons_extra/pantalones_cobre.png',
    leggings_iron: 'assets/icons_extra/pantalones_hierro.png',
    leggings_plata: 'assets/icons_extra/pantalones_plata.png',
    leggings_steel: 'assets/icons_extra/pantalones_acero.png',
    leggings_gold: 'assets/icons_extra/pantalones_oro.png',
    leggings_platinum: 'assets/icons_extra/pantalones_platino.png',
    leggings_crystal: 'assets/icons_extra/pantalones_cristal.png',
    leggings_mithril: 'assets/icons_extra/pantalones_mitrilo.png',
    leggings_titanium: 'assets/icons_extra/pantalones_titanio.png',
    leggings_adamantite: 'assets/icons_extra/pantalones_adamantita.png',
    leggings_orichalcum: 'assets/icons_extra/pantalones_oricalco.png',
    leggings_volcanic: 'assets/icons_extra/pantalones_volcanicos.png',
    leggings_celestial: 'assets/icons_extra/pantalones_celestiales.png',
    leggings_legendary: 'assets/icons_extra/pantalones_omega.png',
    pantalones_cuero: 'assets/icons_extra/pantalones_cuero.png',
    pantalones_bronce: 'assets/icons_extra/pantalones_bronce.png',
    pantalones_cobre: 'assets/icons_extra/pantalones_cobre.png',
    pantalones_hierro: 'assets/icons_extra/pantalones_hierro.png',
    pantalones_plata: 'assets/icons_extra/pantalones_plata.png',
    pantalones_oro: 'assets/icons_extra/pantalones_oro.png',
    pantalones_platino: 'assets/icons_extra/pantalones_platino.png',
    pantalones_acero: 'assets/icons_extra/pantalones_acero.png',
    pantalones_cristal: 'assets/icons_extra/pantalones_cristal.png',
    pantalones_mitrilo: 'assets/icons_extra/pantalones_mitrilo.png',
    pantalones_titanio: 'assets/icons_extra/pantalones_titanio.png',
    pantalones_adamantita: 'assets/icons_extra/pantalones_adamantita.png',
    pantalones_oricalco: 'assets/icons_extra/pantalones_oricalco.png',
    pantalones_volcanicos: 'assets/icons_extra/pantalones_volcanicos.png',
    pantalones_celestiales: 'assets/icons_extra/pantalones_celestiales.png',
    pantalones_omega: 'assets/icons_extra/pantalones_omega.png',
    armor_cobre: RAVEN_BASE + 'fb1932.png',
    armor_iron: RPG_ICON_BASE + 'Equipment/Iron Armor.png',
    armor_plata: RAVEN_BASE + 'fb1921.png',
    armor_gold: FDA_BASE + '07_Items/Armor/chestplate_gold.png',
    armor_platinum: RAVEN_BASE + 'fb1889.png',
    armor_steel: FDA_BASE + '07_Items/Armor/chestplate_steel.png',
    armor_crystal: RAVEN_BASE + 'fb1902.png',
    armor_mithril: RAVEN_BASE + 'fb1863.png',
    armor_platino: RAVEN_BASE + 'fb2049.png',
    armor_adamantite: RAVEN_BASE + 'fb1869.png',
    armor_oricalco: RAVEN_BASE + 'fb2084.png',
    armor_legend: FDA_BASE + '07_Items/Armor/chestplate_legendary.png',
    armor_solar: RAVEN_BASE + 'fb1897.png',
    ring_gold: FDA_BASE + '07_Items/Armor/ring_topaz.png',
    ring_platinum: FDA_BASE + '07_Items/Armor/ring_emerald.png',
    ring_ruby: FDA_BASE + '07_Items/Armor/ring_ruby.png',
    ring_mithril: RAVEN_BASE + 'fb2186.png',
    amulet: FDA_BASE + '07_Items/Armor/amulet_sapphire.png',
    key: RPG_ICON_BASE + 'Misc/Golden Key.png',
    coin: FDA_BASE + '07_Items/Loot_Coins_Gems/coin_copper.png',
    coin_gold: 'assets/ui/coin_gold.png',
    espada_hierro: RPG_ICON_BASE + 'Weapon & Tool/Iron Sword.png',
    reliquia_antigua: FDA_BASE + '07_Items/Quest_Items/ancient_tablet.png',
    relic_lantern: 'assets/icons/lantern.png',
    relic_compass: FDA_BASE + '07_Items/Tools/compass.png',
    relic_heart: FDA_BASE + '07_Items/Relics/crystal_heart.png',
    relic_crown: FDA_BASE + '07_Items/Quest_Items/crown.png',
    relic_core: FDA_BASE + '07_Items/Relics/phoenix_feather.png',
    abyssea_core: 'assets/icons/abyssea_core.png?v=1.6.3',
    // Extended Ores, Gems, Crops, Foods, Fish, Equipment & Placeable Blocks
    ore_silver: 'assets/sprites_extra/stewv_silver_ore.png',
    ore_titanium: 'assets/sprites_extra/stewv_azurite_ore.png',
    bar_silver: 'assets/icons_extra/bar_silver.png',
    ore_mithril: 'assets/sprites_extra/stewv_mithril_ore.png',
    ore_adamantite: 'assets/sprites_extra/stewv_hematite.png',
    ore_orichalcum: 'assets/sprites_extra/stewv_bloodstone_ore.png',
    bar_adamantite: 'assets/icons_extra/bar_adamantite.png',
    sulfur: 'assets/icons_extra/sulfur.png',
    polvo_ceniza: 'assets/icons_extra/powder_ash.png',
    saltpeter: 'assets/icons_extra/saltpeter.png',
    gunpowder: 'assets/icons_extra/gunpowder.png',
    gem_ruby: 'assets/sprites_extra/stewv_ruby.png',
    gem_sapphire: 'assets/sprites_extra/stewv_sapphire.png',
    cuarzo_lunar: 'assets/sprites_extra/stewv_amethyst_cluster.png',
    gem_amethyst: 'assets/sprites_extra/stewv_amethyst.png',
    gem_topaz: 'assets/sprites_extra/stewv_topaz_cut.png',
    nucleo_solar: 'assets/sprites_extra/stewv_solar_core.png',
    ambar_desierto: 'assets/sprites_extra/stewv_amber_desert.png',
    stardust: 'assets/icons_extra/stardust.png',
    seed_bag: 'assets/icons_extra/seed_bag.png',
    crop_tomato: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Tomato/6 - Tomato Inventory Outline.png',
    ensalada_fresca: RAVEN_BASE + 'fb526.png',
    crop_corn: 'assets/icons_extra/corn.png',
    crop_eggplant: 'assets/icons_extra/eggplant.png',
    crop_chili: 'assets/icons_extra/chili.png',
    taco_picante: RAVEN_BASE + 'fb592.png',
    crop_strawberry: 'assets/icons_extra/strawberry.png',
    crop_grapes: 'assets/icons_extra/grapes.png',
    honey: 'assets/icons_extra/honey.png',
    resina_antigua: 'assets/icons_extra/resina_antigua.png',
    candle: 'assets/icons_extra/candle.png',
    cheese: 'assets/icons_extra/cheese.png',
    baguette: 'assets/icons_extra/baguette.png',
    cake: 'assets/icons_extra/cake.png',
    tarta_fresa: FOOD_BASE + 'cake_strawberry.png',
    banquete_real: 'assets/icons_extra/roasted_cutlet.png',
    macedonia_real: FOOD_BASE + 'fruit_apple-slice.png',
    sushi: 'assets/icons_extra/sushi.png',
    coffee: 'assets/icons_extra/coffee.png',
    apple_gold: 'assets/icons_extra/apple.png',
    fertilizer: 'assets/icons_extra/fertilizer.png',
    worm_bait: 'assets/icons_extra/worm_bait.png',
    gold_bait: 'assets/icons_extra/gold_bait.png',
    fish_blue: 'assets/icons_extra/blue_fish.png',
    fish_clown: 'assets/icons_extra/clownfish.png',
    fish_eel: 'assets/icons_extra/eel.png',
    crab: 'assets/icons_extra/crab.png',
    shrimp: 'assets/icons_extra/shrimp.png',
    jellyfish: 'assets/icons_extra/jellyfish.png',
    octopus: 'assets/icons_extra/octopus.png',
    pearl: 'assets/icons_extra/pearl.png',
    gema_marina: 'assets/sprites_extra/stewv_pearl_abyssal.png',
    shell: 'assets/icons_extra/shell.png',
    old_boot: 'assets/icons_extra/old_boot.png',
    spider_silk: FDA_BASE + '07_Items/Monster_Drops/spider_silk.png',
    fang: FDA_BASE + '07_Items/Monster_Drops/fang.png',
    demon_horn: FDA_BASE + '07_Items/Monster_Drops/demon_horn.png',
    scale_red: FDA_BASE + '07_Items/Monster_Drops/scale_red.png',
    bomb_item: FDA_BASE + '07_Items/Ammo/bomb.png',
    bomba_escarcha: 'assets/icons_extra/bomba_escarcha.png',
    bomba_solar: 'assets/icons_extra/bomba_solar.png',
    bomba_abismal: 'assets/icons_extra/bomba_abismal.png',
    potion_strength: 'assets/icons_extra/potion_strength.png',
    scroll_red: FDA_BASE + '07_Items/Scrolls_Books/scroll_fire.png',
    scroll_blue: FDA_BASE + '07_Items/Scrolls_Books/scroll_ice.png',
    scroll_fortuna: 'assets/icons_extra/scroll_gold.png',
    scroll_fuego: 'assets/icons_extra/scroll_crimson.png',
    scroll_rayo: 'assets/icons_extra/scroll_purple.png',
    scroll_hielo: 'assets/icons_extra/scroll_cyan.png',
    helm_leather: RPG_ICON_BASE + 'Equipment/Helm.png',
    helm_wood: FDA_BASE + '07_Items/Armor/helmet_wood.png',
    helm_cobre: RAVEN_BASE + 'fb1916.png',
    helm_iron: FDA_BASE + '07_Items/Armor/helmet_iron.png',
    helm_plata: RAVEN_BASE + 'fb1912.png',
    helm_gold: FDA_BASE + '07_Items/Armor/helmet_gold.png',
    helm_platinum: RAVEN_BASE + 'fb2052.png',
    helm_steel: FDA_BASE + '07_Items/Armor/helmet_steel.png',
    helm_crystal: RAVEN_BASE + 'fb1833.png',
    helm_mithril: RAVEN_BASE + 'fb1834.png',
    helm_titanio: RAVEN_BASE + 'fb2053.png',
    helm_adamantite: RAVEN_BASE + 'fb2054.png',
    helm_oricalco: RAVEN_BASE + 'fb1918.png',
    helm_legend: FDA_BASE + '07_Items/Armor/helmet_legendary.png',
    helm_solar: RAVEN_BASE + 'fb1839.png',
    shield_wood: FDA_BASE + '07_Items/Armor/shield_wood.png',
    shield_bronce: RAVEN_BASE + 'fb2114.png',
    shield_cobre: RAVEN_BASE + 'fb2135.png',
    shield_iron: FDA_BASE + '07_Items/Armor/shield_iron.png',
    shield_plata: RAVEN_BASE + 'fb2115.png',
    shield_gold: FDA_BASE + '07_Items/Armor/shield_gold.png',
    shield_platinum: RAVEN_BASE + 'fb2116.png',
    shield_acero: FDA_BASE + '07_Items/Armor/shield_steel.png',
    shield_legend: FDA_BASE + '07_Items/Armor/shield_legendary.png',
    shield_mithril: RAVEN_BASE + 'fb2145.png',
    shield_titanio: RAVEN_BASE + 'fb2117.png',
    shield_adamantite: RAVEN_BASE + 'fb2120.png',
    shield_oricalco: RAVEN_BASE + 'fb2139.png',
    shield_solar: RAVEN_BASE + 'fb2138.png',
    shield_celestial: RAVEN_BASE + 'fb2150.png',
    boots_wood: FDA_BASE + '07_Items/Armor/boots_wood.png',
    boots_bronce: RAVEN_BASE + 'fb1952.png',
    boots_cobre: RAVEN_BASE + 'fb1948.png',
    boots_iron: FDA_BASE + '07_Items/Armor/boots_iron.png',
    boots_plata: RAVEN_BASE + 'fb1944.png',
    boots_gold: FDA_BASE + '07_Items/Armor/boots_gold.png',
    boots_platinum: RAVEN_BASE + 'fb1937.png',
    boots_steel: FDA_BASE + '07_Items/Armor/boots_steel.png',
    boots_cristal: RAVEN_BASE + 'fb2166.png',
    boots_mithril: RAVEN_BASE + 'fb2161.png',
    boots_titanio: RAVEN_BASE + 'fb2055.png',
    boots_adamantite: RAVEN_BASE + 'fb1942.png',
    boots_oricalco: RAVEN_BASE + 'fb2163.png',
    boots_legend: FDA_BASE + '07_Items/Armor/boots_legendary.png',
    boots_legendary: RAVEN_BASE + 'fb2162.png',
    boots_solar: RAVEN_BASE + 'fb2164.png',
    amulet_emerald: FDA_BASE + '07_Items/Armor/amulet_emerald.png',
    prop_stone_block: 'assets/sprites_extra/stone_block.png',
    prop_crate: 'assets/sprites_extra/crate_wood.png',
    prop_fence: 'assets/sprites_extra/fence_wood.png',
    prop_cobble: 'assets/sprites_extra/cobble_tile.png',
    prop_lamppost: 'assets/sprites_extra/lamppost.png',
    prop_fireplace: 'assets/sprites_extra/fireplace.png',
    prop_angel: 'assets/sprites_extra/angel_statue.png',
    prop_well: 'assets/sprites_extra/stone_well.png',
    // Expanded 8-Tier Ores, Alloys, Gems, Pixel Gnome Fish, Relics & Gear
    estano: 'assets/sprites_extra/stewv_tin_ore.png',
    lingote_platino: 'assets/icons_extra/bar_silver.png',
    platino: 'assets/sprites_extra/stewv_platinum_ore.png',
    jade: 'assets/icons_extra/jade.png',
    amatista: 'assets/sprites_extra/stewv_amethyst_cut.png',
    sanguinaria: 'assets/sprites_extra/stewv_ruby_cut.png',
    celestial_ingot: 'assets/icons_extra/lingote_celestial.png',
    // Pixel Gnome Fish Icons (Outlined crisp sprites)
    pg_anchovy: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/A - Salt Water/Anchovy Outline.png',
    pg_clownfish: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/A - Salt Water/Clownfish Outline.png',
    pg_crab: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/A - Salt Water/Crab - Dungeness Outline.png',
    pg_pufferfish: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/A - Salt Water/Pufferfish Outline.png',
    pg_surgeonfish: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/A - Salt Water/Surgeonfish Outline.png',
    pg_angelfish: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/B - Fresh Water/Angelfish Outline.png',
    pg_bass: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/B - Fresh Water/Bass Outline.png',
    pg_catfish: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/B - Fresh Water/Catfish Outline.png',
    pg_goldfish: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/B - Fresh Water/Goldfish Outline.png',
    pg_trout: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/B - Fresh Water/Rainbow Trout Outline.png',
    pg_can: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/C - Misc/Rusty Can Outline.png',
    pg_worm: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/C - Misc/Worm Outline.png',
    // Extra Gear, Scrolls & Relics
    relic_goblet: FDA_BASE + '07_Items/Relics/holy_grail.png',
    relic_skull: FDA_BASE + '07_Items/Relics/skull_relic.png',
    relic_tome: FDA_BASE + '07_Items/Scrolls_Books/spellbook_ice.png',
    relic_dragon_scale: RAVEN_BASE + 'fb260.png',
    relic_abyss_eye: FDA_BASE + '07_Items/Relics/cursed_ring.png',
    prop_rune_pillar: 'assets/sprites_extra/rune_pillar.png',
    prop_bookshelf: 'assets/sprites_extra/bookshelf.png',
    prop_banquet_table: 'assets/sprites_extra/banquet_table.png',
    prop_barrel: 'assets/sprites_extra/barrel_wood.png',
    prop_bench: 'assets/sprites_extra/bench_wood.png',
    palisade_wood: 'assets/icons_extra/palisade_wood.png',
    bld_muro_madera: 'assets/sprites_extra/bld_muro_madera.png',
    prop_ancient_oak: 'assets/sprites_extra/prop_ancient_oak.png',
    giant_skeleton_1: 'assets/sprites_extra/giant_skeleton_1.png',
    tinta_arcana: 'assets/icons_extra/tinta_arcana.png',
    elixir_blue: 'assets/icons_extra/elixir_blue.png',
    potion_hp_large: 'assets/icons_extra/potion_hp_large.png',
    tnt_icon: 'assets/icons_extra/tnt_icon.png',
    varita_arcana: 'assets/icons_extra/varita_arcana.png',
    cetro_vacio: FDA_BASE + '07_Items/Weapons/staff_legendary.png',
    // Extended Runes, Relics, Ores, Monster Drops, Equipment, Scrolls, Potions, Food & Beach Items
    rune_fire: FDA_BASE + '07_Items/Runes/rune_fire.png',
    rune_water: FDA_BASE + '07_Items/Runes/rune_water.png',
    rune_earth: FDA_BASE + '07_Items/Runes/rune_earth.png',
    rune_air: FDA_BASE + '07_Items/Runes/rune_air.png',
    rune_light: FDA_BASE + '07_Items/Runes/rune_light.png',
    rune_dark: FDA_BASE + '07_Items/Runes/rune_dark.png',
    rune_life: FDA_BASE + '07_Items/Runes/rune_life.png',
    rune_death: FDA_BASE + '07_Items/Runes/rune_death.png',
    coin_stack: FDA_BASE + '07_Items/Loot_Coins_Gems/coin_stack.png',
    gem_onyx: FDA_BASE + '07_Items/Loot_Coins_Gems/gem_onyx.png',
    gem_soul_gem: FDA_BASE + '07_Items/Loot_Coins_Gems/gem_soul_gem.png',
    loot_bag_large: FDA_BASE + '07_Items/Loot_Coins_Gems/loot_bag_large.png',
    loot_bag_purple: FDA_BASE + '07_Items/Loot_Coins_Gems/loot_bag_purple.png',
    obsidian_ore: 'assets/sprites_extra/stewv_obsidian.png',
    obsidian_bar: FDA_BASE + '07_Items/Ores_Bars/bar_obsidian.png',
    bat_wing: FDA_BASE + '07_Items/Monster_Drops/bat_wing.png',
    monster_claw: FDA_BASE + '07_Items/Monster_Drops/claw.png',
    golem_core: FDA_BASE + '07_Items/Monster_Drops/golem_core.png',
    spores: FDA_BASE + '07_Items/Monster_Drops/spores.png',
    black_feather: FDA_BASE + '07_Items/Monster_Drops/feather_black.png',
    ectoplasm: FDA_BASE + '07_Items/Monster_Drops/ectoplasm.png',
    skull_drop: FDA_BASE + '07_Items/Monster_Drops/skull.png',
    slime_blue: FDA_BASE + '07_Items/Monster_Drops/slime_gel_blue.png',
    slime_toxic: FDA_BASE + '07_Items/Monster_Drops/slime_gel_toxic.png',
    eye_monster: FDA_BASE + '07_Items/Monster_Drops/monster_eye.png',
    scale_blue: FDA_BASE + '07_Items/Monster_Drops/scale_blue.png',
    scale_green: FDA_BASE + '07_Items/Monster_Drops/scale_green.png',
    goblin_tooth: FDA_BASE + '07_Items/Monster_Drops/goblin_tooth.png',
    venom_sac: FDA_BASE + '07_Items/Monster_Drops/venom_sac.png',
    sting_scorpion: FDA_BASE + '07_Items/Monster_Drops/horn.png',
    heart_golem: FDA_BASE + '07_Items/Monster_Drops/fire_essence.png',
    relic_dragon_egg: FDA_BASE + '07_Items/Relics/dragon_egg.png',
    ring_diamond: FDA_BASE + '07_Items/Armor/ring_diamond.png',
    ring_amethyst: FDA_BASE + '07_Items/Armor/ring_amethyst.png',
    ring_soul: FDA_BASE + '07_Items/Armor/ring_soul_gem.png',
    ring_onyx: FDA_BASE + '07_Items/Armor/ring_onyx.png',
    amulet_onyx: FDA_BASE + '07_Items/Armor/amulet_onyx.png',
    amulet_soul: FDA_BASE + '07_Items/Armor/amulet_soul_gem.png',
    amulet_diamond: FDA_BASE + '07_Items/Armor/amulet_diamond.png',
    cloak_black: FDA_BASE + '07_Items/Armor/cloak_black.png',
    cloak_red: FDA_BASE + '07_Items/Armor/cloak_red.png',
    cloak_purple: FDA_BASE + '07_Items/Armor/cloak_purple.png',
    mage_hat_purple: FDA_BASE + '07_Items/Armor/mage_hat_purple.png',
    mage_hat_red: FDA_BASE + '07_Items/Armor/mage_hat_red.png',
    gloves_iron: FDA_BASE + '07_Items/Armor/gloves_iron.png',
    gloves_gold: FDA_BASE + '07_Items/Armor/gloves_gold.png',
    gloves_legendary: FDA_BASE + '07_Items/Armor/gloves_legendary.png',
    staff_gold: 'assets/icons_extra/staff_gold.png',
    staff_steel: FDA_BASE + '07_Items/Weapons/staff_steel.png',
    wand_gold: FDA_BASE + '07_Items/Weapons/wand_gold.png',
    wand_legendary: 'assets/icons_extra/wand_legendary.png',
    scroll_heal: FDA_BASE + '07_Items/Scrolls_Books/scroll_heal.png',
    scroll_lightning: FDA_BASE + '07_Items/Scrolls_Books/scroll_lightning.png',
    scroll_teleport: FDA_BASE + '07_Items/Scrolls_Books/scroll_teleport.png',
    scroll_identify: FDA_BASE + '07_Items/Scrolls_Books/scroll_identify.png',
    spellbook_arcane: FDA_BASE + '07_Items/Scrolls_Books/spellbook_arcane.png',
    spellbook_fire: FDA_BASE + '07_Items/Scrolls_Books/spellbook_fire.png',
    spellbook_holy: FDA_BASE + '07_Items/Scrolls_Books/spellbook_holy.png',
    spellbook_necro: FDA_BASE + '07_Items/Scrolls_Books/spellbook_necro.png',
    potion_invis: 'assets/icons_extra/potion_invis.png',
    potion_fire_res: 'assets/icons_extra/potion_fire_res.png',
    potion_frost: 'assets/icons_extra/potion_frost.png',
    potion_elixir: 'assets/icons_extra/potion_elixir.png',
    apple_red: FDA_BASE + '07_Items/Food/apple_red.png',
    apple_green: FDA_BASE + '07_Items/Food/apple_green.png',
    drumstick: FDA_BASE + '07_Items/Food/drumstick.png',
    fish_cooked: FDA_BASE + '07_Items/Food/fish_cooked.png',
    cheese_fda: FDA_BASE + '07_Items/Food/cheese.png',
    treasure_map_extra: 'assets/sprites_extra/items/treasure_map.png',
    msg_bottle_extra: 'assets/sprites_extra/items/msg_bottle.png',
    shell_extra: 'assets/sprites_extra/items/shell_scallop.png',
    crab_extra: 'assets/sprites_extra/items/sand_crab.png',
    // Curated Unique Swords, Shields, Food, StewV Geodes, Keys & Relics
    key_legendaria: 'assets/icons/key_legendaria.png',
    key_crimson: 'assets/icons/key_crimson.png',
    hourglass_relic: 'assets/icons/hourglass_relic.png',
    candle_arcane: 'assets/icons/candle_arcane.png',
    heart_crimson: 'assets/icons/heart_crimson.png',
    xp_orb: 'assets/icons/xp_orb.png',
    mana_orb: 'assets/icons/mana_orb.png',
    geode_amethyst: 'assets/sprites_extra/stewv_geode_amethyst.png',
    geode_gold: 'assets/sprites_extra/stewv_geode_gold.png',
    geode_emerald: 'assets/sprites_extra/stewv_geode_emerald.png',
    cluster_rose: 'assets/icons/cluster_rose.png',
    prism_imperial: 'assets/icons/prism_imperial.png',
    amulet_frost: 'assets/icons/amulet_frost.png',
    pendant_moon: 'assets/icons/pendant_moon.png',
    pendant_phoenix: 'assets/icons/pendant_phoenix.png',
    necklace_ruby: 'assets/icons/necklace_ruby.png',
    ring_astral: 'assets/icons/ring_astral.png',
    crown_sovereign: 'assets/icons/crown_sovereign.png',
    sword_flame: 'assets/sprites_extra/sword_flame.png',
    sword_frost: 'assets/sprites_extra/sword_frost.png',
    sword_thorn: 'assets/sprites_extra/sword_thorn.png',
    sword_solar: 'assets/sprites_extra/sword_solar.png',
    sword_moon: 'assets/sprites_extra/sword_moon.png',
    sword_prism: 'assets/sprites_extra/sword_prism.png',
    sword_rose: 'assets/sprites_extra/sword_rose.png',
    sword_void: 'assets/sprites_extra/sword_void.png',
    sword_volcanic: 'assets/sprites_extra/sword_volcanic.png',
    sword_venom: 'assets/sprites_extra/sword_venom.png',
    sword_sakura: 'assets/sprites_extra/sword_sakura.png',
    shield_phoenix: RAVEN_BASE + 'fb2140.png',
    shield_frost: RAVEN_BASE + 'fb2148.png',
    shield_royal: FDA_BASE + '07_Items/Armor/buckler_gold.png',
    shield_abyss: RAVEN_BASE + 'fb2142.png',
    shield_lion: RAVEN_BASE + 'fb2137.png',
    shield_emerald: RAVEN_BASE + 'fb2121.png',
    shield_solar_v2: FDA_BASE + '07_Items/Armor/buckler_legendary.png',
    food_cake_choco: 'assets/sprites_extra/food_cake_choco.png',
    food_cake_berry: 'assets/sprites_extra/food_cake_berry.png',
    food_cheesecake: 'assets/sprites_extra/food_cheesecake.png',
    food_boba_matcha: 'assets/sprites_extra/food_boba_matcha.png',
    food_boba_mango: 'assets/sprites_extra/food_boba_mango.png',
    food_boba_taro: 'assets/sprites_extra/food_boba_taro.png',
    food_espresso: 'assets/sprites_extra/food_espresso.png',
    food_cheese_gouda: 'assets/sprites_extra/food_cheese_gouda.png',
    food_ice_apple: 'assets/sprites_extra/food_ice_apple.png',
    food_tart_crimson: 'assets/sprites_extra/food_tart_crimson.png',
    food_waffle: 'assets/sprites_extra/food_waffle.png',
    food_sandwich: 'assets/sprites_extra/food_sandwich.png',
    village_grass_turf: 'assets/sprites_extra/village_grass_turf.png',
    village_cobble_path: 'assets/sprites_extra/village_cobble_path.png',
    village_planter_wood: 'assets/sprites_extra/village_planter_wood.png',
    village_stall: 'assets/sprites_extra/village_stall.png',
    village_house_red: 'assets/sprites_extra/village_house_red.png',
    // Extended Fruits+, Nature Free, ALL Weapons/Staffs/Hammers, MV Icons & Undead King
    manzana_roja: 'assets/icons_extra/manzana_roja.png',
    manzana_dorada: 'assets/icons_extra/manzana_dorada.png',
    uvas_misticas: 'assets/icons_extra/uvas_misticas.png',
    platano: 'assets/icons_extra/platano.png',
    naranja: 'assets/icons_extra/naranja.png',
    pera: 'assets/icons_extra/pera.png',
    pina: 'assets/icons_extra/pina.png',
    durazno: 'assets/icons_extra/durazno.png',
    granada: 'assets/icons_extra/granada.png',
    cereza: 'assets/icons_extra/cereza.png',
    arandano: 'assets/icons_extra/arandano.png',
    limon: 'assets/icons_extra/limon.png',
    kiwi: 'assets/icons_extra/kiwi.png',
    pitaya: 'assets/icons_extra/pitaya.png',
    coco: 'assets/icons_extra/coco.png',
    sandia: 'assets/icons_extra/sandia.png',
    fresa_plus: 'assets/icons_extra/fresa.png',
    chile_fuego: 'assets/icons_extra/chile_fuego.png',
    mora_silvestre: 'assets/icons_extra/mora_silvestre.png',
    aguacate: 'assets/icons_extra/aguacate.png',
    bellota: 'assets/icons_extra/bellota.png',
    miel_ambar: 'assets/icons_extra/miel_ambar.png',
    martillo_roble: 'assets/icons_extra/martillo_roble.png',
    martillo_esmeralda: 'assets/icons_extra/martillo_esmeralda.png',
    martillo_paladin: 'assets/icons_extra/martillo_paladin.png',
    martillo_cristal: 'assets/icons_extra/martillo_cristal.png',
    martillo_astronomico: 'assets/icons_extra/martillo_astronomico.png',
    espada_relampago: 'assets/icons_extra/espada_relampago.png',
    espada_ignea: 'assets/icons_extra/espada_ignea.png',
    espada_glacial: 'assets/icons_extra/espada_glacial.png',
    espada_solaris: 'assets/icons_extra/espada_solaris.png',
    espada_paladin: 'assets/icons_extra/espada_paladin.png',
    espada_tormenta: 'assets/icons_extra/espada_tormenta.png',
    espada_volcanica_v2: 'assets/icons_extra/espada_volcanica.png',
    espada_astral_v2: 'assets/icons_extra/espada_astral.png',
    hacha_doble_carmesi: 'assets/icons_extra/hacha_doble_carmesi.png',
    hacha_doble_astral: 'assets/icons_extra/hacha_doble_astral.png',
    baculo_rubi: 'assets/icons_extra/baculo_rubi.png',
    baculo_zafiro: 'assets/icons_extra/baculo_zafiro.png',
    baculo_esmeralda: 'assets/icons_extra/baculo_esmeralda.png',
    baculo_solaris: 'assets/icons_extra/baculo_solaris.png',
    lanza_solar: 'assets/icons_extra/lanza_solar.png',
    lanza_abismal: 'assets/icons_extra/lanza_abismal.png',
    elixir_vida: 'assets/icons_extra/elixir_vida.png',
    elixir_mana: 'assets/icons_extra/elixir_mana.png',
    medallon_solar: 'assets/icons_extra/medallon_solar.png',
    llave_maestra: 'assets/icons_extra/llave_maestra.png',
    orbe_zafiro: 'assets/icons_extra/orbe_zafiro.png',
    caliz_nebulosa: 'assets/icons_extra/caliz_nebulosa.png',
    botella_estelar: 'assets/icons_extra/botella_estelar.png',
    anillo_rubi: 'assets/icons_extra/anillo_rubi.png',
    anillo_plata_mv: 'assets/icons_extra/anillo_plata.png',
    cristal_nebulosa: 'assets/icons_extra/cristal_nebulosa.png',
    estofado_real_mv: 'assets/icons_extra/estofado_real.png',
    grimorio_arcano: 'assets/icons_extra/grimorio_arcano.png',
    talisman_meteoro: 'assets/icons_extra/talisman_meteoro.png',
    collar_oseo: 'assets/icons_extra/collar_oseo.png',
    ramo_rosa: 'assets/icons_extra/ramo_rosa.png',
    corona_rey_oseo: 'assets/icons_extra/corona_rey_oseo.png',
    spell_lightning: 'assets/icons_extra/spell_lightning.png',
    roble_milenario: 'assets/sprites_extra/prop_ancient_oak.png',
    fire_brazier: 'assets/sprites_extra/fire_brazier.png',
    butterfly_icon: 'assets/sprites_extra/butterfly_orange.png',
    pile_skulls: 'assets/sprites_extra/pile_skulls.png',
    ore_emerald: 'assets/icons_extra/ore_emerald.png',
    ore_cobalt: 'assets/icons_extra/ore_cobalt.png',
    ore_amethyst: 'assets/icons_extra/ore_amethyst.png',
    ore_ruby: 'assets/icons_extra/ore_ruby.png',
    silver_bar: 'assets/icons_extra/bar_silver.png',
    adamantite_bar: 'assets/icons_extra/bar_adamantite.png',
    algas: 'assets/icons_extra/algas.png',
    abono_dorado: 'assets/icons_extra/abono_dorado.png',
    compost_magico: 'assets/icons_extra/compost_magico.png',
    cofre_hundido: 'assets/sprites_extra/chest_sapphire_closed.png',

    // === HECHIZOS ACTIVOS (128x128 Hand-Pixelled V14 Grimoires & Runes) ===
    spell_bola_fuego: 'assets/icons_tiers_v14/items/grimorio_bola_fuego.png?v=2.0.3',
    spell_lluvia_meteoros: 'assets/icons_tiers_v14/items/grimorio_lluvia_meteoros.png?v=2.0.3',
    spell_nova_hielo: 'assets/icons_tiers_v14/items/grimorio_nova_hielo.png?v=2.0.3',
    spell_cadena_rayos: 'assets/icons_tiers_v14/items/grimorio_cadena_rayos.png?v=2.0.3',
    spell_curacion_sagrada: 'assets/icons_tiers_v14/items/grimorio_curacion_sagrada.png?v=2.0.3',
    spell_escudo_divino: 'assets/icons_tiers_v14/items/grimorio_escudo_divino.png?v=2.0.3',
    spell_furia_arcana: 'assets/icons_tiers_v14/items/grimorio_furia_arcana.png?v=2.0.3',
    spell_paso_etereo: 'assets/icons_tiers_v14/items/grimorio_paso_etereo.png?v=2.0.3',
    spell_espinas_tierra: 'assets/icons_tiers_v14/items/grimorio_espinas_tierra.png?v=2.0.3',
    spell_espectro_aliado: 'assets/icons_tiers_v14/items/runa_muerte.png?v=2.0.3',
    spell_misil_arcano: 'assets/icons_tiers_v14/items/grimorio_misil_arcano.png?v=2.0.3',
    spell_vacio_gravitacional: 'assets/icons_tiers_v14/items/gema_vacio.png?v=2.0.3',
    spell_destello_solar: 'assets/icons_tiers_v14/items/runa_luz.png?v=2.0.3',
    spell_fortificacion: 'assets/icons_tiers_v14/items/pergamino_escudo.png?v=2.0.3',
    spell_drenaje_mana: 'assets/icons_tiers_v14/items/grimorio_drenaje_mana.png?v=2.0.3',
    spell_daga_veneno: 'assets/icons_tiers_v14/items/grimorio_daga_veneno.png?v=2.0.3',
    spell_lluvia_minerales: 'assets/icons_tiers_v14/items/grimorio_lluvia_minerales.png?v=2.0.3',
    spell_llamado_horda: 'assets/icons_tiers_v14/items/grimorio_llamado_horda.png?v=2.0.3',
    spell_llamado_fauna: 'assets/icons_tiers_v14/items/grimorio_llamado_fauna.png?v=2.0.3',

    // === FASE 5: NUEVAS ARMAS, BÁCULOS, VARITAS Y ARQUETIPOS (UNIFICADO 32x32) ===
    dagger_iron: 'assets/icons_extra/dagger_iron.png',
    dagger_steel: 'assets/icons_extra/dagger_steel.png',
    dagger_gold: 'assets/icons_extra/dagger_gold.png',
    dagger_legendary: 'assets/icons_extra/dagger_legendary.png',
    battleaxe_iron: 'assets/icons_extra/battleaxe_iron.png',
    battleaxe_gold: 'assets/icons_extra/battleaxe_gold.png',
    battleaxe_legendary: 'assets/icons_extra/battleaxe_legendary.png',
    greatsword_iron: 'assets/icons_extra/greatsword_iron.png',
    greatsword_steel: 'assets/icons_extra/greatsword_steel.png',
    greatsword_gold: 'assets/icons_extra/greatsword_gold.png',
    greatsword_legendary: 'assets/icons_extra/greatsword_legendary.png',
    spear_iron_wep: 'assets/icons_extra/spear_iron_wep.png',
    spear_crimson: 'assets/icons_extra/spear_crimson.png',
    halberd_royal: 'assets/icons_extra/halberd_royal.png',
    mace_iron: 'assets/icons_extra/mace_iron.png',
    mace_steel: 'assets/icons_extra/mace_steel.png',
    mace_legendary: 'assets/icons_extra/mace_legendary.png',
    crossbow_wood: 'assets/icons_extra/crossbow_wood.png',
    crossbow_legendary: 'assets/icons_extra/crossbow_legendary.png',
    staff_druid: 'assets/icons_extra/staff_druid.png',
    staff_crescent: 'assets/icons_extra/staff_crescent.png',
    staff_ruby: 'assets/icons_extra/staff_ruby.png',
    wand_ruby: 'assets/icons_extra/wand_ruby.png',
    wand_frost: 'assets/icons_extra/wand_frost.png',

    // === FASE 5: GRIMORIOS, LLAVES DE MAZMORRA, EQUIPO Y RELIQUIAS ===
    spellbook_dark: FDA_BASE + '07_Items/Scrolls_Books/spellbook_dark.png',
    spellbook_lightning: FDA_BASE + '07_Items/Scrolls_Books/spellbook_lightning.png',
    spellbook_nature: FDA_BASE + '07_Items/Scrolls_Books/spellbook_nature.png',
    ancient_idol: FDA_BASE + '07_Items/Relics/ancient_idol.png',
    key_gold: FDA_BASE + '07_Items/Keys/key_gold.png',
    key_blue: FDA_BASE + '07_Items/Keys/key_blue.png',
    key_red: FDA_BASE + '07_Items/Keys/key_red.png',
    key_skeleton: FDA_BASE + '07_Items/Keys/key_skeleton.png',
    key_boss: FDA_BASE + '07_Items/Keys/key_boss.png',
    key_dungeon_master: FDA_BASE + '07_Items/Keys/key_dungeon_master.png',
    hat_mage_dark: RPG16_BASE + 'Item__52.png',
    hat_witch_arcane: RPG16_BASE + 'Item__53.png',
    armor_paladin_gold: RPG16_BASE + 'Item__59.png',
    helm_viking: RPG16_BASE + 'Item__47.png',
    ring_diamond_rpg: RPG16_BASE + 'Item__41.png',
    ring_emerald_rpg: RPG16_BASE + 'Item__43.png',
    pendant_star: RPG16_BASE + 'Item__33.png',
    pendant_skull: RPG16_BASE + 'Item__35.png',
    scroll_blue_sealed: RPG16_BASE + 'Item__36.png',
    scroll_red_sealed: RPG16_BASE + 'Item__37.png',
    tablet_stone: RPG16_BASE + 'Item__39.png',
    relic_chalice_gold: RPG16_BASE + 'Item__71.png',
    relic_frost_chest: 'assets/sprites_extra/dungeon/chest_frost_closed.png',
    relic_winged_orb: LEGENDS_BASE + 'image_part_007.png',
    relic_warhammer_totem: LEGENDS_BASE + 'image_part_010.png',
    relic_gauntlet_steel: LEGENDS_BASE + 'image_part_012.png',
    relic_ruby_band: LEGENDS_BASE + 'image_part_013.png',
    relic_sun_scepter: LEGENDS_BASE + 'image_part_014.png',
    relic_astrolabe: LEGENDS_BASE + 'image_part_015.png',
    relic_crimson_tome: LEGENDS_BASE + 'image_part_016.png',
    relic_crimson_phial: LEGENDS_BASE + 'image_part_017.png',
    relic_frost_phial: LEGENDS_BASE + 'image_part_018.png',
    relic_arcane_phial: LEGENDS_BASE + 'image_part_019.png',
    relic_abyss_pearl: LEGENDS_BASE + 'image_part_020.png',
    relic_prism_shard: LEGENDS_BASE + 'image_part_021.png',
    relic_solar_sphere: LEGENDS_BASE + 'image_part_023.png',
    relic_emerald_sphere: LEGENDS_BASE + 'image_part_024.png',
    relic_mystic_blossom: LEGENDS_BASE + 'image_part_028.png',
    relic_sun_medallion: LEGENDS_BASE + 'image_part_029.png',
    relic_crescent_star: LEGENDS_BASE + 'image_part_030.png',
    relic_earth_core: LEGENDS_BASE + 'image_part_031.png',
    relic_tidal_core: LEGENDS_BASE + 'image_part_032.png',
    // Previously unmapped items & new items / backpacks / chests to eliminate blue box fallbacks
    arrow_ammo: 'assets/packs/Pixel Art Icon Pack - RPG/Weapon & Tool/Arrow.png',
    fish_shadow: 'assets/icons/fish_dark.png',
    fish_phoenix: 'assets/icons/fish_lava.png',
    fish_legendary: 'assets/icons/fish_gold.png',
    wood_beam: 'assets/icons_extra/palisade_wood.png',
    wood_refined: 'assets/icons/wood.png',
    rope: 'assets/packs/Pixel Art Icon Pack - RPG/Material/Rope.png',
    cloth_heavy: 'assets/icons/cloth.png',
    armor_cloth: 'assets/icons/cloth.png',
    ingot_fire: 'assets/icons_extra/lingote_adamantita.png',
    ingot_celestial: 'assets/icons_extra/lingote_celestial.png',
    abyssal_crystal: 'assets/sprites_extra/stewv_sapphire.png',
    relic_abyss: 'assets/icons/abyssea_core.png?v=1.6.3',
    polvo_estelar: 'assets/icons_extra/stardust.png',
    gema_vacio: 'assets/icons_extra/magic_crystal.png',
    sword_celestial: 'assets/icons/abyssea_sword.png',
    tuberias_conduit: 'assets/sprites_extra/prop_pipe.png',
    mochila_cuero: FDA_BASE + '07_Items/Loot_Coins_Gems/loot_bag_large.png',
    mochila_reforzada: FDA_BASE + '07_Items/Loot_Coins_Gems/loot_bag_purple.png',
    mochila_astral: 'assets/icons/abyssea_core.png?v=1.6.3',
    cofre_madera: 'assets/sprites_extra/chest_wood_closed.png',
    cofre_hierro: 'assets/sprites_extra/chest_sapphire_closed.png',
    cofre_dorado: 'assets/sprites_extra/chest_gold_closed.png',
    cofre_logistico: 'assets/sprites_extra/chest_logistic_closed.png',
    singularidad: 'assets/icons_extra/singularidad.png',
    lingote_omega: 'assets/icons_extra/lingote_omega.png',
    materia_comprimida: 'assets/icons_extra/materia_comprimida.png',
    cristal_datos: 'assets/icons_extra/cristal_datos.png',
    casco_omega: 'assets/icons_extra/casco_omega.png',
    armadura_omega: 'assets/icons_extra/armadura_omega.png',
    escudo_omega: 'assets/icons_extra/escudo_omega.png',
    botas_omega: 'assets/icons_extra/botas_omega.png',
    hoja_singularidad: 'assets/icons_extra/hoja_singularidad.png',
    arco_omega: 'assets/icons_extra/arco_omega.png',
    cetro_omega: 'assets/icons_extra/cetro_omega.png',
    // === Beta 1.3.0: Nuevos Minerales, Lingotes, Placas, Pociones, Armas y Reliquias ===
    coral_roca: 'assets/sprites_v13/icons/ore_coral.png',
    lingote_coral: 'assets/sprites_v13/icons/bar_coral.png',
    placa_coral: 'assets/sprites_v13/icons/plate_coral.png',
    perla_turquesa: 'assets/sprites_v13/icons/relic_v13_61.png',
    madera_ferrea: 'assets/sprites_v13/icons/ore_selvano.png',
    lingote_selvano: 'assets/sprites_v13/icons/bar_selvano.png',
    placa_selvano: 'assets/sprites_v13/icons/plate_selvano.png',
    jade_ancestral: 'assets/sprites_v13/icons/relic_v13_72.png',
    resina_toxica: 'assets/sprites_v13/icons/elixir_v13_4.png',
    flor_pantano: 'assets/sprites_v13/icons/potion_v13_7.png',
    polvo_veneno: 'assets/sprites_v13/icons/dust_veneno.png',
    pirita_solar: 'assets/sprites_v13/icons/ore_pirita.png',
    lingote_pirita: 'assets/sprites_v13/icons/bar_pirita.png',
    placa_pirita: 'assets/sprites_v13/icons/plate_pirita.png',
    agata_roja: 'assets/sprites_v13/icons/relic_v13_10.png',
    cuarzo_boreal: 'assets/sprites_v13/icons/ore_boreal.png',
    lingote_boreal: 'assets/sprites_v13/icons/bar_boreal.png',
    placa_boreal: 'assets/sprites_v13/icons/plate_boreal.png',
    celestita_cristal: 'assets/sprites_v13/icons/relic_v13_54.png',
    hielo_eterno: 'assets/sprites_v13/icons/relic_v13_67.png',
    bismuto_astral: 'assets/sprites_v13/icons/relic_v13_41.png',
    hueso_fosil: 'assets/sprites_v13/icons/ore_hueso.png',
    lingote_hueso: 'assets/sprites_v13/icons/bar_hueso.png',
    plata_maldita: 'assets/sprites_v13/icons/ore_maldito.png',
    lingote_maldito: 'assets/sprites_v13/icons/bar_maldito.png',
    placa_maldito: 'assets/sprites_v13/icons/plate_maldito.png',
    escoria_caldera: 'assets/sprites_v13/icons/ore_escoria.png',
    lingote_escoria: 'assets/sprites_v13/icons/bar_escoria.png',
    placa_escoria: 'assets/sprites_v13/icons/plate_escoria.png',
    cristal_carmesi: 'assets/sprites_v13/icons/relic_v13_74.png',
    marmol_oscuro: 'assets/sprites_v13/nodes/node_marmol_oscuro.png',
    polvo_carmesi: 'assets/sprites_v13/icons/dust_carmesi.png',
    potion_v13_0: 'assets/sprites_v13/icons/potion_v13_0.png',
    potion_v13_1: 'assets/sprites_v13/icons/potion_v13_1.png',
    potion_v13_2: 'assets/sprites_v13/icons/potion_v13_2.png',
    potion_v13_3: 'assets/sprites_v13/icons/potion_v13_3.png',
    potion_v13_4: 'assets/sprites_v13/icons/potion_v13_4.png',
    potion_v13_5: 'assets/sprites_v13/icons/potion_v13_5.png',
    potion_v13_6: 'assets/sprites_v13/icons/potion_v13_6.png',
    potion_v13_7: 'assets/sprites_v13/icons/potion_v13_7.png',
    potion_v13_8: 'assets/sprites_v13/icons/potion_v13_8.png',
    potion_v13_9: 'assets/sprites_v13/icons/potion_v13_9.png',
    elixir_v13_0: 'assets/sprites_v13/icons/elixir_v13_0.png',
    elixir_v13_1: 'assets/sprites_v13/icons/elixir_v13_1.png',
    elixir_v13_2: 'assets/sprites_v13/icons/elixir_v13_2.png',
    elixir_v13_3: 'assets/sprites_v13/icons/elixir_v13_3.png',
    elixir_v13_4: 'assets/sprites_v13/icons/elixir_v13_4.png',
    elixir_v13_5: 'assets/sprites_v13/icons/elixir_v13_5.png',
    elixir_v13_6: 'assets/sprites_v13/icons/elixir_v13_6.png',
    elixir_v13_7: 'assets/sprites_v13/icons/elixir_v13_7.png',
    elixir_v13_8: 'assets/sprites_v13/icons/elixir_v13_8.png',
    elixir_v13_9: 'assets/sprites_v13/icons/elixir_v13_9.png',
    wep_coral_sword: 'assets/sprites_v13/icons/wep_coral_sword.png',
    wep_coral_spear: 'assets/sprites_v13/icons/wep_coral_spear.png',
    wep_coral_staff: 'assets/sprites_v13/icons/wep_coral_staff.png',
    wep_coral_bow: 'assets/sprites_v13/icons/wep_coral_bow.png',
    wep_coral_shield: 'assets/sprites_v13/icons/wep_coral_shield.png',
    wep_selva_sword: 'assets/sprites_v13/icons/wep_selva_sword.png',
    wep_selva_axe: 'assets/sprites_v13/icons/wep_selva_axe.png',
    wep_selva_staff: 'assets/sprites_v13/icons/wep_selva_staff.png',
    wep_selva_bow: 'assets/sprites_v13/icons/wep_selva_bow.png',
    wep_selva_shield: 'assets/sprites_v13/icons/wep_selva_shield.png',
    wep_pantano_dagger: 'assets/sprites_v13/icons/wep_pantano_dagger.png',
    wep_pantano_scythe: 'assets/sprites_v13/icons/wep_pantano_scythe.png',
    wep_pantano_staff: 'assets/sprites_v13/icons/wep_pantano_staff.png',
    wep_pantano_tome: 'assets/sprites_v13/icons/wep_pantano_tome.png',
    wep_faraon_sword: 'assets/sprites_v13/icons/wep_faraon_sword.png',
    wep_faraon_spear: 'assets/sprites_v13/icons/wep_faraon_spear.png',
    wep_faraon_hammer: 'assets/sprites_v13/icons/wep_faraon_hammer.png',
    wep_faraon_shield: 'assets/sprites_v13/icons/wep_faraon_shield.png',
    wep_glacial_sword: 'assets/sprites_v13/icons/wep_glacial_sword.png',
    wep_glacial_hammer: 'assets/sprites_v13/icons/wep_glacial_hammer.png',
    wep_glacial_staff: 'assets/sprites_v13/icons/wep_glacial_staff.png',
    wep_glacial_shield: 'assets/sprites_v13/icons/wep_glacial_shield.png',
    wep_necro_sword: 'assets/sprites_v13/icons/wep_necro_sword.png',
    wep_necro_scythe: 'assets/sprites_v13/icons/wep_necro_scythe.png',
    wep_necro_staff: 'assets/sprites_v13/icons/wep_necro_staff.png',
    wep_necro_tome: 'assets/sprites_v13/icons/wep_necro_tome.png',
    wep_caldera_sword: 'assets/sprites_v13/icons/wep_caldera_sword.png',
    wep_caldera_axe: 'assets/sprites_v13/icons/wep_caldera_axe.png',
    wep_caldera_staff: 'assets/sprites_v13/icons/wep_caldera_staff.png',
    wep_caldera_bow: 'assets/sprites_v13/icons/wep_caldera_bow.png',
    wep_caldera_shield: 'assets/sprites_v13/icons/wep_caldera_shield.png',
    wep_eclipse_blade: 'assets/sprites_v13/icons/wep_eclipse_blade.png',
    wep_void_chakram: 'assets/sprites_v13/icons/wep_void_chakram.png',
    wep_phoenix_bow: 'assets/sprites_v13/icons/wep_phoenix_bow.png',
    relic_v13_0: 'assets/sprites_v13/icons/relic_v13_0.png',   relic_v13_1: 'assets/sprites_v13/icons/relic_v13_1.png',
    relic_v13_2: 'assets/sprites_v13/icons/relic_v13_2.png',   relic_v13_3: 'assets/sprites_v13/icons/relic_v13_3.png',
    relic_v13_4: 'assets/sprites_v13/icons/relic_v13_4.png',   relic_v13_5: 'assets/sprites_v13/icons/relic_v13_5.png',
    relic_v13_6: 'assets/sprites_v13/icons/relic_v13_6.png',   relic_v13_7: 'assets/sprites_v13/icons/relic_v13_7.png',
    relic_v13_8: 'assets/sprites_v13/icons/relic_v13_8.png',   relic_v13_9: 'assets/sprites_v13/icons/relic_v13_9.png',
    relic_v13_10: 'assets/sprites_v13/icons/relic_v13_10.png', relic_v13_11: 'assets/sprites_v13/icons/relic_v13_11.png',
    relic_v13_12: 'assets/sprites_v13/icons/relic_v13_12.png', relic_v13_13: 'assets/sprites_v13/icons/relic_v13_13.png',
    relic_v13_14: 'assets/sprites_v13/icons/relic_v13_14.png', relic_v13_15: 'assets/sprites_v13/icons/relic_v13_15.png',
    relic_v13_16: 'assets/sprites_v13/icons/relic_v13_16.png', relic_v13_17: 'assets/sprites_v13/icons/relic_v13_17.png',
    relic_v13_18: 'assets/sprites_v13/icons/relic_v13_18.png', relic_v13_19: 'assets/sprites_v13/icons/relic_v13_19.png',
    relic_v13_20: 'assets/sprites_v13/icons/relic_v13_20.png', relic_v13_21: 'assets/sprites_v13/icons/relic_v13_21.png',
    relic_v13_22: 'assets/sprites_v13/icons/relic_v13_22.png', relic_v13_23: 'assets/sprites_v13/icons/relic_v13_23.png',
    relic_v13_24: 'assets/sprites_v13/icons/relic_v13_24.png', relic_v13_25: 'assets/sprites_v13/icons/relic_v13_25.png',
    relic_v13_26: 'assets/sprites_v13/icons/relic_v13_26.png', relic_v13_27: 'assets/sprites_v13/icons/relic_v13_27.png',
    relic_v13_28: 'assets/sprites_v13/icons/relic_v13_28.png', relic_v13_29: 'assets/sprites_v13/icons/relic_v13_29.png',
    relic_v13_30: 'assets/sprites_v13/icons/relic_v13_30.png', relic_v13_31: 'assets/sprites_v13/icons/relic_v13_31.png',
    relic_v13_32: 'assets/sprites_v13/icons/relic_v13_32.png', relic_v13_33: 'assets/sprites_v13/icons/relic_v13_33.png',
    relic_v13_34: 'assets/sprites_v13/icons/relic_v13_34.png', relic_v13_35: 'assets/sprites_v13/icons/relic_v13_35.png',
    relic_v13_36: 'assets/sprites_v13/icons/relic_v13_36.png', relic_v13_37: 'assets/sprites_v13/icons/relic_v13_37.png',
    relic_v13_38: 'assets/sprites_v13/icons/relic_v13_38.png', relic_v13_39: 'assets/sprites_v13/icons/relic_v13_39.png',
    relic_v13_40: 'assets/sprites_v13/icons/relic_v13_40.png', relic_v13_41: 'assets/sprites_v13/icons/relic_v13_41.png',
    relic_v13_42: 'assets/sprites_v13/icons/relic_v13_42.png', relic_v13_43: 'assets/sprites_v13/icons/relic_v13_43.png',
    relic_v13_44: 'assets/sprites_v13/icons/relic_v13_44.png', relic_v13_45: 'assets/sprites_v13/icons/relic_v13_45.png',
    relic_v13_46: 'assets/sprites_v13/icons/relic_v13_46.png', relic_v13_47: 'assets/sprites_v13/icons/relic_v13_47.png',
    relic_v13_48: 'assets/sprites_v13/icons/relic_v13_48.png', relic_v13_49: 'assets/sprites_v13/icons/relic_v13_49.png',
    relic_v13_50: 'assets/sprites_v13/icons/relic_v13_50.png', relic_v13_51: 'assets/sprites_v13/icons/relic_v13_51.png',
    relic_v13_52: 'assets/sprites_v13/icons/relic_v13_52.png', relic_v13_53: 'assets/sprites_v13/icons/relic_v13_53.png',
    relic_v13_54: 'assets/sprites_v13/icons/relic_v13_54.png', relic_v13_55: 'assets/sprites_v13/icons/relic_v13_55.png',
    relic_v13_56: 'assets/sprites_v13/icons/relic_v13_56.png', relic_v13_57: 'assets/sprites_v13/icons/relic_v13_57.png',
    relic_v13_58: 'assets/sprites_v13/icons/relic_v13_58.png', relic_v13_59: 'assets/sprites_v13/icons/relic_v13_59.png',
    relic_v13_60: 'assets/sprites_v13/icons/relic_v13_60.png', relic_v13_61: 'assets/sprites_v13/icons/relic_v13_61.png',
    relic_v13_62: 'assets/sprites_v13/icons/relic_v13_62.png', relic_v13_63: 'assets/sprites_v13/icons/relic_v13_63.png',
    relic_v13_64: 'assets/sprites_v13/icons/relic_v13_64.png', relic_v13_65: 'assets/sprites_v13/icons/relic_v13_65.png',
    relic_v13_66: 'assets/sprites_v13/icons/relic_v13_66.png', relic_v13_67: 'assets/sprites_v13/icons/relic_v13_67.png',
    relic_v13_68: 'assets/sprites_v13/icons/relic_v13_68.png', relic_v13_69: 'assets/sprites_v13/icons/relic_v13_69.png',
    relic_v13_70: 'assets/sprites_v13/icons/relic_v13_70.png', relic_v13_71: 'assets/sprites_v13/icons/relic_v13_71.png',
    relic_v13_72: 'assets/sprites_v13/icons/relic_v13_72.png', relic_v13_73: 'assets/sprites_v13/icons/relic_v13_73.png',
    relic_v13_74: 'assets/sprites_v13/icons/relic_v13_74.png', relic_v13_75: 'assets/sprites_v13/icons/relic_v13_75.png',
    relic_v13_76: 'assets/sprites_v13/icons/relic_v13_76.png', relic_v13_77: 'assets/sprites_v13/icons/relic_v13_77.png',
    relic_v13_78: 'assets/sprites_v13/icons/relic_v13_78.png', relic_v13_79: 'assets/sprites_v13/icons/relic_v13_79.png',
    // === Beta 2.0.0 RC2: Authentic Pixel-Art Icons (12 Alchemy Potions, 6 Exotic Fish, RC2 Tools/Items/Pets) ===
    alc_furia_volcanica: 'assets/sprites_v2/alc_furia_volcanica.png?v=2.0.0-rc2px',
    alc_piel_adamantita: 'assets/sprites_v2/alc_piel_adamantita.png?v=2.0.0-rc2px',
    alc_clarividencia_minera: 'assets/sprites_v2/alc_clarividencia_minera.png?v=2.0.0-rc2px',
    alc_crono_velocidad: 'assets/sprites_v2/alc_crono_velocidad.png?v=2.0.0-rc2px',
    alc_vampirismo_sanguino: 'assets/sprites_v2/alc_vampirismo_sanguino.png?v=2.0.0-rc2px',
    alc_tormenta_electrica: 'assets/sprites_v2/alc_tormenta_electrica.png?v=2.0.0-rc2px',
    alc_fortuna_dorada: 'assets/sprites_v2/alc_fortuna_dorada.png?v=2.0.0-rc2px',
    alc_sobrecarga_arcana: 'assets/sprites_v2/alc_sobrecarga_arcana.png?v=2.0.0-rc2px',
    alc_paso_fantasmal: 'assets/sprites_v2/alc_paso_fantasmal.png?v=2.0.0-rc2px',
    alc_coloso_titan: 'assets/sprites_v2/alc_coloso_titan.png?v=2.0.0-rc2px',
    alc_cosecha_radiante: 'assets/sprites_v2/alc_cosecha_radiante.png?v=2.0.0-rc2px',
    alc_singularidad_omega: 'assets/sprites_v2/alc_singularidad_omega.png?v=2.0.0-rc2px',
    fish_exotic_mantarraya: 'assets/sprites_v2/fish_exotic_mantarraya.png?v=2.0.0-rc2px',
    fish_exotic_tiburon: 'assets/sprites_v2/fish_exotic_tiburon.png?v=2.0.0-rc2px',
    fish_exotic_celacanto: 'assets/sprites_v2/fish_exotic_celacanto.png?v=2.0.0-rc2px',
    fish_exotic_koi: 'assets/sprites_v2/fish_exotic_koi.png?v=2.0.0-rc2px',
    fish_exotic_leviatan: 'assets/sprites_v2/fish_exotic_leviatan.png?v=2.0.0-rc2px',
    fish_exotic_raya: 'assets/sprites_v2/fish_exotic_raya.png?v=2.0.0-rc2px',
    trigo_dorado: 'assets/sprites_v2/trigo_dorado.png?v=2.0.0-rc2px',
    cetro_traslado: 'assets/sprites_v2/cetro_traslado.png?v=2.0.0-rc2px',
    ficha_gremio: 'assets/sprites_v2/ficha_gremio.png?v=2.0.0-rc2px',
    catalizador_reforja: 'assets/sprites_v2/catalizador_reforja.png?v=2.0.0-rc2px',
    esencia_lunar: 'assets/sprites_v2/esencia_lunar.png?v=2.0.0-rc2px',
    perla_leviatan: 'assets/sprites_v2/perla_leviatan.png?v=2.0.0-rc2px',
    pet_limo_dorado: 'assets/sprites_v2/pet_limo_dorado.png?v=2.0.0-rc2px',
    pet_cangrejo_coral: 'assets/sprites_v2/pet_cangrejo_coral.png?v=2.0.0-rc2px',
    pet_buho_astral: 'assets/sprites_v2/pet_buho_astral.png?v=2.0.0-rc2px',
    pet_espiritu_igneo: 'assets/sprites_v2/pet_espiritu_igneo.png?v=2.0.0-rc2px',
    pet_pez_linterna: 'assets/sprites_v2/pet_pez_linterna.png?v=2.0.0-rc2px'
  };

  // Populated by v1.4.0+ HD tiered sprite mapping below
  Abyssea.TOOL_PNG_MAP = {};

  Abyssea.SKILL_EXTRA_ICONS = {
    scroll_map: 'assets/icons_tiers_v14/items/mapa_tesoro_item.png?v=2.0.3',
    amulet_ruby: 'assets/icons_tiers_v14/items/anillo_rubi_real.png?v=2.0.3',
    bow: 'assets/icons_tiers_v14/tools/arco_acero.png?v=2.0.3',
    axe: 'assets/icons_tiers_v14/tools/hacha_hierro.png?v=2.0.3',
    anvil: 'assets/icons_tiers_v14/items/lingote_acero.png?v=2.0.3',
    station_enchant: 'assets/icons_tiers_v14/items/tablilla_runica.png?v=2.0.3',
    chest: 'assets/icons_tiers_v14/items/cofre_hundido.png?v=2.0.3',
    ectoplasma: 'assets/icons_tiers_v14/items/ectoplasma.png?v=2.0.3',
    sun: 'assets/icons_tiers_v14/items/nucleo_solar.png?v=2.0.3',
    rune_pillar: 'assets/icons_tiers_v14/items/runa_luz.png?v=2.0.3',
    compass: 'assets/icons_tiers_v14/relics/brujula_estelar.png?v=2.0.3',
    waypoint_white: 'assets/icons_tiers_v14/items/pergamino_teletransporte.png?v=2.0.3',
    telar: 'assets/icons_tiers_v14/items/tela_reforzada.png?v=2.0.3',
    plantacion: 'assets/icons_tiers_v14/items/trigo.png?v=2.0.3',
    coin: 'assets/ui/coin_gold.png',
    sword: 'assets/icons_tiers_v14/tools/espada_hierro.png?v=2.0.3',
    lana: 'assets/icons_tiers_v14/items/lana.png?v=2.0.3'
  };

  Abyssea.SKILL_ICON_POOL = [
    'assets/icons_tiers_v14/tools/pico_acero.png?v=2.0.3',
    'assets/icons_tiers_v14/tools/hacha_oro.png?v=2.0.3',
    'assets/icons_tiers_v14/items/pocion_cosecha.png?v=2.0.3',
    'assets/icons_tiers_v14/tools/arco_cristal.png?v=2.0.3',
    'assets/icons_tiers_v14/items/grimorio_lluvia_meteoros.png?v=2.0.3',
    'assets/icons_tiers_v14/items/escudo_esmeralda.png?v=2.0.3',
    'assets/icons_tiers_v14/items/grimorio_curacion_sagrada.png?v=2.0.3',
    'assets/icons_tiers_v14/items/runa_luz.png?v=2.0.3',
    'assets/icons_tiers_v14/items/escudo_leon.png?v=2.0.3',
    'assets/icons_tiers_v14/items/elixir_vida_supremo.png?v=2.0.3',
    'assets/icons_tiers_v14/items/escudo_glacial.png?v=2.0.3',
    'assets/icons_tiers_v14/tools/espada_acero.png?v=2.0.3',
    'assets/icons_tiers_v14/items/hacha_batalla_oro.png?v=2.0.3',
    'assets/icons_tiers_v14/items/espada_llamarada.png?v=2.0.3',
    'assets/icons_tiers_v14/items/grimorio_furia_arcana.png?v=2.0.3',
    'assets/icons_tiers_v14/items/engrane.png?v=2.0.3',
    'assets/icons_tiers_v14/items/pergamino_furia.png?v=2.0.3',
    'assets/icons_tiers_v14/items/grimorio_espinas_tierra.png?v=2.0.3',
    'assets/icons_tiers_v14/items/grimorio_bola_fuego.png?v=2.0.3',
    'assets/icons_tiers_v14/items/grimorio_misil_arcano.png?v=2.0.3',
    'assets/icons_tiers_v14/armor/botas_viento.png?v=2.0.3',
    'assets/icons_tiers_v14/items/hoja_glacial.png?v=2.0.3',
    'assets/icons_tiers_v14/items/grimorio_cadena_rayos.png?v=2.0.3',
    'assets/icons_tiers_v14/items/grimorio_nova_hielo.png?v=2.0.3',
    'assets/icons_tiers_v14/items/grimorio_paso_etereo.png?v=2.0.3'
  ];

  Abyssea.SKILL_ICON_URLS = {
    rec_1: Abyssea.SKILL_ICON_POOL[0], rec_2: Abyssea.SKILL_ICON_POOL[1],
    rec_3: Abyssea.SKILL_ICON_POOL[2], rec_4: Abyssea.SKILL_ICON_POOL[3], rec_5: Abyssea.SKILL_ICON_POOL[4],
    eco_1: Abyssea.SKILL_ICON_POOL[5], eco_2: Abyssea.SKILL_ICON_POOL[6],
    eco_3: Abyssea.SKILL_ICON_POOL[7], eco_4: Abyssea.SKILL_ICON_POOL[8], eco_5: Abyssea.SKILL_ICON_POOL[9],
    com_1: Abyssea.SKILL_ICON_POOL[10], com_2: Abyssea.SKILL_ICON_POOL[11],
    com_3: Abyssea.SKILL_ICON_POOL[12], com_4: Abyssea.SKILL_ICON_POOL[13], com_5: Abyssea.SKILL_ICON_POOL[14],
    pro_1: Abyssea.SKILL_ICON_POOL[15], pro_2: Abyssea.SKILL_ICON_POOL[16],
    pro_3: Abyssea.SKILL_ICON_POOL[17], pro_4: Abyssea.SKILL_ICON_POOL[18], pro_5: Abyssea.SKILL_ICON_POOL[19],
    exp_1: Abyssea.SKILL_ICON_POOL[20], exp_2: Abyssea.SKILL_ICON_POOL[21],
    exp_3: Abyssea.SKILL_ICON_POOL[22], exp_4: Abyssea.SKILL_ICON_POOL[23], exp_5: Abyssea.SKILL_ICON_POOL[24]
  };

  Abyssea.NPC_PORTRAIT_URLS = {
    eldrin: 'assets/icons_tiers_v14/npcs/portrait_eldrin.png?v=2.0.3',
    zara: 'assets/icons_tiers_v14/npcs/portrait_zara.png?v=2.0.3',
    lyra: 'assets/icons_tiers_v14/npcs/portrait_lyra.png?v=2.0.3',
    bjorn: 'assets/icons_tiers_v14/npcs/portrait_bjorn.png?v=2.0.3',
    ignis: 'assets/icons_tiers_v14/npcs/portrait_ignis.png?v=2.0.3',
    kael: 'assets/icons_tiers_v14/npcs/portrait_kael.png?v=2.0.3',
    selene: 'assets/icons_tiers_v14/npcs/portrait_selene.png?v=2.0.3',
    doran: 'assets/icons_tiers_v14/npcs/portrait_doran.png?v=2.0.3'
  };

  const NPCS_V15 = 'assets/icons_tiers_v14/npcs/';
  Abyssea.NPC_SHEET_PATHS = {
    eldrin: NPCS_V15 + 'eldrin_4f.png?v=1.6.2',
    zara:   NPCS_V15 + 'zara_4f.png?v=1.6.2',
    lyra:   NPCS_V15 + 'lyra_4f.png?v=1.6.2',
    bjorn:  NPCS_V15 + 'bjorn_4f.png?v=1.6.2',
    ignis:  NPCS_V15 + 'ignis_4f.png?v=1.6.2',
    kael:   NPCS_V15 + 'kael_4f.png?v=1.6.2',
    selene: NPCS_V15 + 'selene_4f.png?v=1.6.2',
    doran:  NPCS_V15 + 'doran_4f.png?v=1.6.2'
  };

  // Animated enemy & boss sprite sheets (populated cleanly by v1.6.8+ HD 6-frame strips below)
  Abyssea.ENEMY_SPRITE_PATHS = {};
  Abyssea.BOSS_SPRITE_PATHS = {};

  const GV15 = 'assets/icons_tiers_v14/gates/';
  const GV15X = '.png?v=2.0.5';
  Abyssea.DUNGEON_GATE_PATHS = {
    // Bioma Pradera
    pradera:            GV15 + 'sub_mazmorra' + GV15X,
    pradera_profunda:   GV15 + 'caserio_goblin' + GV15X,
    pradera_madriguera: GV15 + 'goldmine_active' + GV15X,
    pradera_baston:     GV15 + 'torre_vigia_goblin' + GV15X,
    pradera_bosquecillo:GV15 + 'santuario_elfico' + GV15X,

    // Bioma Desierto
    desierto:           GV15 + 'templo_desierto' + GV15X,
    desierto_piramide:  GV15 + 'piramide_arena' + GV15X,
    desierto_oasis:     GV15 + 'caverna_arena' + GV15X,
    desierto_catacumbas:GV15 + 'fuerte_desierto' + GV15X,
    desierto_solario:   GV15 + 'campamento_desierto' + GV15X,

    // Bioma Bosque Oscuro
    bosque_oscuro:      GV15 + 'torre_oscura' + GV15X,
    bosque_necro:       GV15 + 'catedral_sombras' + GV15X,
    bosque_laboratorio: GV15 + 'monasterio_ruinoso' + GV15X,
    bosque_arana:       GV15 + 'catedral_ruinas' + GV15X,
    bosque_pantano:     GV15 + 'gate_pantano' + GV15X,

    // Bioma Montañas Heladas
    montanas_heladas:   GV15 + 'fortaleza_helada' + GV15X,
    montanas_glaciar:   GV15 + 'templo_hielo' + GV15X,
    montanas_mina:      GV15 + 'mina_congelada' + GV15X,
    montanas_fortaleza: GV15 + 'mausoleo_helado' + GV15X,
    montanas_cumbre:    GV15 + 'caverna_escarcha' + GV15X,

    // Bioma Tierras Volcánicas
    tierras_volcanicas: GV15 + 'castillo_obsidiana' + GV15X,
    volcan_abismo:      GV15 + 'prision_piedra' + GV15X,
    volcan_fragua:      GV15 + 'fortaleza_hierro' + GV15X,
    volcan_caldera:     GV15 + 'templo_fuego' + GV15X,
    volcan_trono_ceniza:GV15 + 'cuartel_mazmorra' + GV15X,

    // Beta 1.3.0: 50 Puertas de Mazmorra en 9 Biomas Nuevos
    coral_arrecife:     GV15 + 'gate_coral' + GV15X,
    coral_perla:        GV15 + 'portal_acuatico' + GV15X,
    coral_abismo:       GV15 + 'gate_coral' + GV15X,
    coral_bastion:      GV15 + 'portal_acuatico' + GV15X,
    coral_trono:        GV15 + 'gate_coral' + GV15X,
    cristal_geoda:      GV15 + 'gate_cristal' + GV15X,
    cristal_espejo:     GV15 + 'torre_cristal' + GV15X,
    cristal_camara:     GV15 + 'gate_cristal' + GV15X,
    cristal_nexo:       GV15 + 'torre_cristal' + GV15X,
    cristal_corazon:    GV15 + 'gate_cristal' + GV15X,
    selva_raices:       GV15 + 'gate_selva' + GV15X,
    selva_piramide:     GV15 + 'templo_jungla' + GV15X,
    selva_colmena:      GV15 + 'goblin_house' + GV15X,
    selva_dosel:        GV15 + 'gate_selva' + GV15X,
    selva_corazon:      GV15 + 'templo_jungla' + GV15X,
    caldera_fumarola:   GV15 + 'gate_caldera' + GV15X,
    caldera_crater:     GV15 + 'templo_fuego' + GV15X,
    caldera_fundicion:  GV15 + 'mina_ruinas' + GV15X,
    caldera_bestia:     GV15 + 'campamento_orco' + GV15X,
    caldera_senor:      GV15 + 'castillo_obsidiana' + GV15X,
    dinastia_tumbas:    GV15 + 'gate_dinastia' + GV15X,
    dinastia_escarabajo:GV15 + 'mina_arena' + GV15X,
    dinastia_obelisco:  GV15 + 'fuerte_desierto' + GV15X,
    dinastia_camara:    GV15 + 'templo_desierto' + GV15X,
    dinastia_sol:       GV15 + 'piramide_arena' + GV15X,
    dinastia_faraon:    GV15 + 'gate_dinastia' + GV15X,
    glaciar_grieta:     GV15 + 'ruinas_glaciares' + GV15X,
    glaciar_vestigios:  GV15 + 'gate_glaciar' + GV15X,
    glaciar_ojo:        GV15 + 'caverna_escarcha' + GV15X,
    glaciar_coloso:     GV15 + 'campamento_nieve' + GV15X,
    glaciar_sancta:     GV15 + 'templo_hielo' + GV15X,
    glaciar_abismo:     GV15 + 'mausoleo_helado' + GV15X,
    pantano_raices:     GV15 + 'gate_pantano' + GV15X,
    pantano_esporas:    GV15 + 'fuerte_bandidos' + GV15X,
    pantano_cieno:      GV15 + 'guarida_bandidos' + GV15X,
    pantano_calabaza:   GV15 + 'monasterio_ruinoso' + GV15X,
    pantano_bastion:    GV15 + 'cuartel_orcos' + GV15X,
    pantano_madre:      GV15 + 'gate_pantano' + GV15X,
    necro_osario:       GV15 + 'tumba_gigantes' + GV15X,
    necro_cripta:       GV15 + 'mausoleo_ancestral' + GV15X,
    necro_catacumba:    GV15 + 'catedral_ruinas' + GV15X,
    necro_foso:         GV15 + 'tumba_gigantes' + GV15X,
    necro_torre:        GV15 + 'gate_necro' + GV15X,
    necro_trono:        GV15 + 'catedral_sombras' + GV15X,
    maldita_sangre:     GV15 + 'gate_maldita' + GV15X,
    maldita_carne:      GV15 + 'castillo_imperial' + GV15X,
    maldita_forja:      GV15 + 'fortaleza_hierro' + GV15X,
    maldita_calabaza:   GV15 + 'castillo_obsidiana' + GV15X,
    maldita_abismo:     GV15 + 'prision_piedra' + GV15X,
    eclipse_carmesi:    GV15 + 'gate_maldita' + GV15X
  };

  Abyssea.CHEST_SPRITE_PATHS = {
    wood_closed: 'assets/sprites_extra/chest_wood_closed.png',
    wood_open: 'assets/sprites_extra/chest_wood_open.png',
    gold_closed: 'assets/sprites_extra/chest_gold_closed.png',
    gold_open: 'assets/sprites_extra/chest_gold_open.png',
    sapphire_closed: 'assets/sprites_extra/chest_sapphire_closed.png',
    sapphire_open: 'assets/sprites_extra/chest_sapphire_open.png',
    skull_closed: 'assets/sprites_extra/chest_skull_closed.png?v=1.6.8',
    skull_open: 'assets/sprites_extra/chest_skull_open.png?v=1.6.8',
    frost_closed: 'assets/sprites_extra/dungeon/chest_frost_closed.png?v=1.6.8',
    frost_open: 'assets/sprites_extra/dungeon/chest_frost_open.png?v=1.6.8',
    crimson_closed: 'assets/sprites_extra/dungeon/chest_crimson_closed.png?v=1.6.8',
    crimson_open: 'assets/sprites_extra/dungeon/chest_crimson_open.png?v=1.6.8'
  };

  Abyssea.DUNGEON_TILE_PATHS = {
    // Shared props, animations & dark-fantasy masonry atlases
    rfMain: 'assets/packs/RF_Catacombs_v1.0/mainlevbuild.png',
    rfDeco: 'assets/packs/RF_Catacombs_v1.0/decorative.png',
    dtFree: 'assets/packs/DungeonTileset_Free/DungeonTileset/Tileset.png',
    carpetRedSheet: FDA_BASE + '01_Dungeon_Tiles/Carpets/carpet_red_over_stone_floor.png',
    carpetBlueSheet: FDA_BASE + '01_Dungeon_Tiles/Carpets/carpet_blue_over_stone_floor.png',
    carpetPurpleSheet: FDA_BASE + '01_Dungeon_Tiles/Carpets/carpet_purple_over_stone_floor.png',
    torch1: 'assets/packs/RF_Catacombs_v1.0/torch_1.png',
    torch2: 'assets/packs/RF_Catacombs_v1.0/torch_2.png',
    torch3: 'assets/packs/RF_Catacombs_v1.0/torch_3.png',
    torch4: 'assets/packs/RF_Catacombs_v1.0/torch_4.png',
    spike0: 'assets/packs/RF_Catacombs_v1.0/spike_0.png',
    spike4: 'assets/packs/RF_Catacombs_v1.0/spike_4.png',
    urn: FDA_BASE + '02_Props/Containers/pot_clay.png',
    urnGold: FDA_BASE + '02_Props/Containers/urn_gold.png',
    sarcophagus: FDA_BASE + '02_Props/Furniture/sarcophagus_closed_32x32.png',
    altarRitual: FDA_BASE + '02_Props/Altars_Shrines/altar_ritual_32x16_anim_6f.png',
    portalStairs: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Stairs/stairs_up.png',
    carpetRed: 'assets/sprites_extra/dungeon/carpet_crimson.png',
    carpetBlue: 'assets/sprites_extra/dungeon/carpet_frost.png',
    carpetPurple: 'assets/sprites_extra/dungeon/carpet_arcane.png',
    carpetSandstone: 'assets/sprites_extra/dungeon/carpet_sandstone.png',
    // Per-biome floors, walls & pillars (using staggered flagstones floor_2/floor_3 + full sheets)
    pradera_floor1: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Floors/floor_2.png',
    pradera_floor2: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Floors/floor_3.png',
    pradera_floorsSheet: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Floors/_floors_sheet.png',
    pradera_floorRune: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Floors/floor_rune.png',
    pradera_wall: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Walls/Faces_16x32/face_mid.png',
    pradera_wallBanner: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Walls/Faces_16x32/face_banner_green.png',
    pradera_wallSheet: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Walls/_wall_faces_sheet_16x32.png',
    pradera_wallTop: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Walls/wall_top_blob47.png',
    pradera_doorClosed: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Walls/Faces_16x32/door_barred_closed.png',
    pradera_doorOpen: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Walls/Faces_16x32/door_barred_open.png',
    pradera_pillar: FDA_BASE + '02_Props/Statues_Pillars/pillar_stone_16x48.png',

    desierto_floor1: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Floors/floor_2.png',
    desierto_floor2: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Floors/floor_3.png',
    desierto_floorsSheet: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Floors/_floors_sheet.png',
    desierto_floorRune: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Floors/floor_rune.png',
    desierto_wall: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/Faces_16x32/face_mid.png',
    desierto_wallBanner: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/Faces_16x32/face_banner_red.png',
    desierto_wallSheet: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/_wall_faces_sheet_16x32.png',
    desierto_wallTop: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/wall_top_blob47.png',
    desierto_doorClosed: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/Faces_16x32/door_iron_closed.png',
    desierto_doorOpen: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/Faces_16x32/door_iron_open.png',
    desierto_pillar: FDA_BASE + '02_Props/Statues_Pillars/pillar_cave_16x48.png',

    bosque_oscuro_floor1: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Floors/floor_2.png',
    bosque_oscuro_floor2: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Floors/floor_3.png',
    bosque_oscuro_floorsSheet: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Floors/_floors_sheet.png',
    bosque_oscuro_floorRune: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Floors/floor_rune.png',
    bosque_oscuro_wall: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Walls/Faces_16x32/face_mid.png',
    bosque_oscuro_wallBanner: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Walls/Faces_16x32/face_banner_purple.png',
    bosque_oscuro_wallSheet: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Walls/_wall_faces_sheet_16x32.png',
    bosque_oscuro_wallTop: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Walls/wall_top_blob47.png',
    bosque_oscuro_doorClosed: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Walls/Faces_16x32/door_barred_closed.png',
    bosque_oscuro_doorOpen: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Walls/Faces_16x32/door_barred_open.png',
    bosque_oscuro_pillar: FDA_BASE + '02_Props/Statues_Pillars/pillar_crypt_16x48.png',

    montanas_heladas_floor1: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Floors/floor_2.png',
    montanas_heladas_floor2: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Floors/floor_3.png',
    montanas_heladas_floorsSheet: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Floors/_floors_sheet.png',
    montanas_heladas_floorRune: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Floors/floor_rune.png',
    montanas_heladas_wall: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Walls/Faces_16x32/face_mid.png',
    montanas_heladas_wallBanner: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Walls/Faces_16x32/face_banner_blue.png',
    montanas_heladas_wallSheet: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Walls/_wall_faces_sheet_16x32.png',
    montanas_heladas_wallTop: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Walls/wall_top_blob47.png',
    montanas_heladas_doorClosed: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Walls/Faces_16x32/door_iron_closed.png',
    montanas_heladas_doorOpen: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Walls/Faces_16x32/door_iron_open.png',
    montanas_heladas_pillar: FDA_BASE + '02_Props/Statues_Pillars/pillar_ice_16x48.png',

    tierras_volcanicas_floor1: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Floors/floor_2.png',
    tierras_volcanicas_floor2: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Floors/floor_3.png',
    tierras_volcanicas_floorsSheet: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Floors/_floors_sheet.png',
    tierras_volcanicas_floorRune: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Floors/floor_rune.png',
    tierras_volcanicas_wall: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Walls/Faces_16x32/face_mid.png',
    tierras_volcanicas_wallBanner: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Walls/Faces_16x32/face_banner_red.png',
    tierras_volcanicas_wallSheet: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Walls/_wall_faces_sheet_16x32.png',
    tierras_volcanicas_wallTop: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Walls/wall_top_blob47.png',
    tierras_volcanicas_doorClosed: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Walls/Faces_16x32/door_gold_closed.png',
    tierras_volcanicas_doorOpen: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Walls/Faces_16x32/door_gold_open.png',
    tierras_volcanicas_pillar: FDA_BASE + '02_Props/Statues_Pillars/pillar_lava_16x48.png',

    // Biome-specific lights, banners & statues inside Dungeons
    torch_green: FDA_BASE + '02_Props/Lights/wall_torch_green_anim_6f.png',
    torch_orange: FDA_BASE + '02_Props/Lights/wall_torch_orange_anim_6f.png',
    torch_purple: FDA_BASE + '02_Props/Lights/wall_torch_purple_anim_6f.png',
    torch_blue: FDA_BASE + '02_Props/Lights/wall_torch_blue_anim_6f.png',
    brazier_green: FDA_BASE + '02_Props/Lights/brazier_green_16x32_anim_6f.png',
    brazier_orange: FDA_BASE + '02_Props/Lights/brazier_orange_16x32_anim_6f.png',
    brazier_purple: FDA_BASE + '02_Props/Lights/brazier_purple_16x32_anim_6f.png',
    brazier_blue: FDA_BASE + '02_Props/Lights/brazier_blue_16x32_anim_6f.png',
    banner_green: FDA_BASE + '02_Props/Graves_Signs_Banners/banner_pole_green_16x32.png',
    banner_red: FDA_BASE + '02_Props/Graves_Signs_Banners/banner_pole_red_16x32.png',
    banner_purple: FDA_BASE + '02_Props/Graves_Signs_Banners/banner_pole_purple_16x32.png',
    banner_blue: FDA_BASE + '02_Props/Graves_Signs_Banners/banner_pole_blue_16x32.png',
    statue_knight: FDA_BASE + '02_Props/Statues_Pillars/statue_knight_16x32.png',
    statue_goddess: FDA_BASE + '02_Props/Statues_Pillars/statue_goddess_16x32.png',
    statue_gargoyle: FDA_BASE + '02_Props/Statues_Pillars/statue_gargoyle_16x32.png',
    statue_dragon: FDA_BASE + '02_Props/Statues_Pillars/statue_dragon_16x32.png',
    statue_sphinx: 'assets/packs/Ancient_Egypt/Back.png',
    pyr_banner_red: 'assets/sprites_extra/dungeon/pyr_banner_red.png',
    pyr_banner_black: 'assets/sprites_extra/dungeon/pyr_banner_black.png',
    desierto_piramide_floor1: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Floors/floor_2.png',
    desierto_piramide_floor2: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Floors/floor_3.png',
    desierto_piramide_floorsSheet: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Floors/_floors_sheet.png',
    desierto_piramide_floorRune: 'assets/sprites_extra/dungeon/pyr_lotus.png',
    desierto_piramide_wall: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/Faces_16x32/face_mid.png',
    desierto_piramide_wallBanner: 'assets/sprites_extra/dungeon/pyr_wall_banner.png',
    desierto_piramide_wallSheet: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/_wall_faces_sheet_16x32.png',
    desierto_piramide_wallTop: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/wall_top_blob47.png',
    desierto_piramide_doorClosed: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/Faces_16x32/door_gold_closed.png',
    desierto_piramide_doorOpen: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/Faces_16x32/door_gold_open.png',
    desierto_piramide_pillar: 'assets/sprites_extra/dungeon/pyr_pillar.png',

    // Sub-biome dungeon themes (Cave, Fire Zone, Arcane Lab, Necro Crypt)
    cave_floor1: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Floors/floor_2.png',
    cave_floor2: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Floors/floor_3.png',
    cave_floorsSheet: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Floors/_floors_sheet.png',
    cave_floorRune: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Floors/floor_rune.png',
    cave_wall: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/Faces_16x32/face_mid.png',
    cave_wallBanner: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/Faces_16x32/face_banner_red.png',
    cave_wallSheet: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/_wall_faces_sheet_16x32.png',
    cave_wallTop: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/wall_top_blob47.png',
    cave_doorClosed: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/Faces_16x32/door_iron_closed.png',
    cave_doorOpen: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/Faces_16x32/door_iron_open.png',
    cave_pillar: FDA_BASE + '02_Props/Statues_Pillars/pillar_cave_16x48.png',

    fire_zone_floor1: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Floors/floor_2.png',
    fire_zone_floor2: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Floors/floor_3.png',
    fire_zone_floorsSheet: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Floors/_floors_sheet.png',
    fire_zone_floorRune: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Floors/floor_rune.png',
    fire_zone_wall: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Walls/Faces_16x32/face_mid.png',
    fire_zone_wallBanner: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Walls/Faces_16x32/face_banner_red.png',
    fire_zone_wallSheet: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Walls/_wall_faces_sheet_16x32.png',
    fire_zone_wallTop: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Walls/wall_top_blob47.png',
    fire_zone_doorClosed: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Walls/Faces_16x32/door_gold_closed.png',
    fire_zone_doorOpen: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Walls/Faces_16x32/door_gold_open.png',
    fire_zone_pillar: FDA_BASE + '02_Props/Statues_Pillars/pillar_lava_16x48.png',

    arcane_lab_floor1: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Floors/floor_2.png',
    arcane_lab_floor2: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Floors/floor_3.png',
    arcane_lab_floorsSheet: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Floors/_floors_sheet.png',
    arcane_lab_floorRune: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Floors/floor_rune.png',
    arcane_lab_wall: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Walls/Faces_16x32/face_mid.png',
    arcane_lab_wallBanner: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Walls/Faces_16x32/face_banner_purple.png',
    arcane_lab_wallSheet: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Walls/_wall_faces_sheet_16x32.png',
    arcane_lab_wallTop: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Walls/wall_top_blob47.png',
    arcane_lab_doorClosed: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Walls/Faces_16x32/door_barred_closed.png',
    arcane_lab_doorOpen: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Walls/Faces_16x32/door_barred_open.png',
    arcane_lab_pillar: FDA_BASE + '02_Props/Statues_Pillars/pillar_crypt_16x48.png',

    // === Beta 1.3.0: Dungeon Tile Themes for 9 New Biomes + Eclipse Carmesi ===
    archipielago_coral_floor1: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Floors/floor_2.png',
    archipielago_coral_floor2: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Floors/floor_3.png',
    archipielago_coral_floorsSheet: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Floors/_floors_sheet.png',
    archipielago_coral_floorRune: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Floors/floor_rune.png',
    archipielago_coral_wall: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Walls/Faces_16x32/face_mid.png',
    archipielago_coral_wallBanner: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Walls/Faces_16x32/face_banner_blue.png',
    archipielago_coral_wallSheet: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Walls/_wall_faces_sheet_16x32.png',
    archipielago_coral_wallTop: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Walls/wall_top_blob47.png',
    archipielago_coral_doorClosed: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Walls/Faces_16x32/door_barred_closed.png',
    archipielago_coral_doorOpen: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Walls/Faces_16x32/door_barred_open.png',
    archipielago_coral_pillar: FDA_BASE + '02_Props/Statues_Pillars/pillar_stone_16x48.png',

    cavernas_cristal_floor1: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Floors/floor_2.png',
    cavernas_cristal_floor2: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Floors/floor_3.png',
    cavernas_cristal_floorsSheet: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Floors/_floors_sheet.png',
    cavernas_cristal_floorRune: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Floors/floor_rune.png',
    cavernas_cristal_wall: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Walls/Faces_16x32/face_mid.png',
    cavernas_cristal_wallBanner: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Walls/Faces_16x32/face_banner_blue.png',
    cavernas_cristal_wallSheet: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Walls/_wall_faces_sheet_16x32.png',
    cavernas_cristal_wallTop: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Walls/wall_top_blob47.png',
    cavernas_cristal_doorClosed: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Walls/Faces_16x32/door_iron_closed.png',
    cavernas_cristal_doorOpen: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Walls/Faces_16x32/door_iron_open.png',
    cavernas_cristal_pillar: FDA_BASE + '02_Props/Statues_Pillars/pillar_ice_16x48.png',

    selva_esmeralda_floor1: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Floors/floor_2.png',
    selva_esmeralda_floor2: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Floors/floor_3.png',
    selva_esmeralda_floorsSheet: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Floors/_floors_sheet.png',
    selva_esmeralda_floorRune: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Floors/floor_rune.png',
    selva_esmeralda_wall: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Walls/Faces_16x32/face_mid.png',
    selva_esmeralda_wallBanner: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Walls/Faces_16x32/face_banner_green.png',
    selva_esmeralda_wallSheet: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Walls/_wall_faces_sheet_16x32.png',
    selva_esmeralda_wallTop: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Walls/wall_top_blob47.png',
    selva_esmeralda_doorClosed: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Walls/Faces_16x32/door_barred_closed.png',
    selva_esmeralda_doorOpen: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Walls/Faces_16x32/door_barred_open.png',
    selva_esmeralda_pillar: FDA_BASE + '02_Props/Statues_Pillars/pillar_stone_16x48.png',

    caldera_ceniza_floor1: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Floors/floor_2.png',
    caldera_ceniza_floor2: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Floors/floor_3.png',
    caldera_ceniza_floorsSheet: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Floors/_floors_sheet.png',
    caldera_ceniza_floorRune: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Floors/floor_rune.png',
    caldera_ceniza_wall: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Walls/Faces_16x32/face_mid.png',
    caldera_ceniza_wallBanner: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Walls/Faces_16x32/face_banner_red.png',
    caldera_ceniza_wallSheet: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Walls/_wall_faces_sheet_16x32.png',
    caldera_ceniza_wallTop: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Walls/wall_top_blob47.png',
    caldera_ceniza_doorClosed: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Walls/Faces_16x32/door_gold_closed.png',
    caldera_ceniza_doorOpen: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Walls/Faces_16x32/door_gold_open.png',
    caldera_ceniza_pillar: FDA_BASE + '02_Props/Statues_Pillars/pillar_lava_16x48.png',

    dinastia_arena_floor1: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Floors/floor_2.png',
    dinastia_arena_floor2: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Floors/floor_3.png',
    dinastia_arena_floorsSheet: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Floors/_floors_sheet.png',
    dinastia_arena_floorRune: 'assets/sprites_extra/dungeon/pyr_lotus.png',
    dinastia_arena_wall: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/Faces_16x32/face_mid.png',
    dinastia_arena_wallBanner: 'assets/sprites_extra/dungeon/pyr_wall_banner.png',
    dinastia_arena_wallSheet: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/_wall_faces_sheet_16x32.png',
    dinastia_arena_wallTop: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/wall_top_blob47.png',
    dinastia_arena_doorClosed: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/Faces_16x32/door_gold_closed.png',
    dinastia_arena_doorOpen: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/Faces_16x32/door_gold_open.png',
    dinastia_arena_pillar: 'assets/sprites_extra/dungeon/pyr_pillar.png',

    glaciar_profundo_floor1: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Floors/floor_2.png',
    glaciar_profundo_floor2: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Floors/floor_3.png',
    glaciar_profundo_floorsSheet: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Floors/_floors_sheet.png',
    glaciar_profundo_floorRune: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Floors/floor_rune.png',
    glaciar_profundo_wall: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Walls/Faces_16x32/face_mid.png',
    glaciar_profundo_wallBanner: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Walls/Faces_16x32/face_banner_blue.png',
    glaciar_profundo_wallSheet: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Walls/_wall_faces_sheet_16x32.png',
    glaciar_profundo_wallTop: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Walls/wall_top_blob47.png',
    glaciar_profundo_doorClosed: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Walls/Faces_16x32/door_iron_closed.png',
    glaciar_profundo_doorOpen: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Walls/Faces_16x32/door_iron_open.png',
    glaciar_profundo_pillar: FDA_BASE + '02_Props/Statues_Pillars/pillar_ice_16x48.png',

    cienaga_putrida_floor1: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Floors/floor_2.png',
    cienaga_putrida_floor2: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Floors/floor_3.png',
    cienaga_putrida_floorsSheet: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Floors/_floors_sheet.png',
    cienaga_putrida_floorRune: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Floors/floor_rune.png',
    cienaga_putrida_wall: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Walls/Faces_16x32/face_mid.png',
    cienaga_putrida_wallBanner: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Walls/Faces_16x32/face_banner_green.png',
    cienaga_putrida_wallSheet: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Walls/_wall_faces_sheet_16x32.png',
    cienaga_putrida_wallTop: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Walls/wall_top_blob47.png',
    cienaga_putrida_doorClosed: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Walls/Faces_16x32/door_barred_closed.png',
    cienaga_putrida_doorOpen: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Walls/Faces_16x32/door_barred_open.png',
    cienaga_putrida_pillar: FDA_BASE + '02_Props/Statues_Pillars/pillar_crypt_16x48.png',

    necropolis_osea_floor1: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Floors/floor_2.png',
    necropolis_osea_floor2: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Floors/floor_3.png',
    necropolis_osea_floorsSheet: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Floors/_floors_sheet.png',
    necropolis_osea_floorRune: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Floors/floor_rune.png',
    necropolis_osea_wall: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Walls/Faces_16x32/face_mid.png',
    necropolis_osea_wallBanner: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Walls/Faces_16x32/face_banner_purple.png',
    necropolis_osea_wallSheet: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Walls/_wall_faces_sheet_16x32.png',
    necropolis_osea_wallTop: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Walls/wall_top_blob47.png',
    necropolis_osea_doorClosed: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Walls/Faces_16x32/door_iron_closed.png',
    necropolis_osea_doorOpen: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Walls/Faces_16x32/door_iron_open.png',
    necropolis_osea_pillar: FDA_BASE + '02_Props/Statues_Pillars/pillar_crypt_16x48.png',

    tierras_malditas_floor1: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Floors/floor_2.png',
    tierras_malditas_floor2: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Floors/floor_3.png',
    tierras_malditas_floorsSheet: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Floors/_floors_sheet.png',
    tierras_malditas_floorRune: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Floors/floor_rune.png',
    tierras_malditas_wall: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Walls/Faces_16x32/face_mid.png',
    tierras_malditas_wallBanner: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Walls/Faces_16x32/face_banner_red.png',
    tierras_malditas_wallSheet: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Walls/_wall_faces_sheet_16x32.png',
    tierras_malditas_wallTop: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Walls/wall_top_blob47.png',
    tierras_malditas_doorClosed: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Walls/Faces_16x32/door_gold_closed.png',
    tierras_malditas_doorOpen: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Walls/Faces_16x32/door_gold_open.png',
    tierras_malditas_pillar: FDA_BASE + '02_Props/Statues_Pillars/pillar_lava_16x48.png'
  };

  Abyssea.EXTRA_SPRITE_PATHS = {
    campfireAnim: FDA_BASE + '10_Overworld/Campsite/campfire_anim_6f.png',
    slashWhite: FDA_BASE + '09_Effects/Slashes/slash_white_medium_32_5f.png',
    slashFire: FDA_BASE + '09_Effects/Slashes/slash_fire_medium_32_5f.png',
    slashIce: FDA_BASE + '09_Effects/Slashes/slash_ice_medium_32_5f.png',
    slashDark: FDA_BASE + '09_Effects/Slashes/slash_dark_medium_32_5f.png',
    hitSpark: FDA_BASE + '09_Effects/Combat/hit_spark_4f.png',
    explosionSmall: FDA_BASE + '09_Effects/Explosions/explosion_small_32_7f.png',
    explosionLarge: FDA_BASE + '09_Effects/Explosions/explosion_large_48_8f.png',
    dynamiteAnim: 'assets/packs/Tiny Swords/Tiny Swords (Update 010)/Factions/Goblins/Troops/TNT/Dynamite/Dynamite.png',
    tinyExplosion: 'assets/packs/Tiny Swords/Tiny Swords (Update 010)/Effects/Explosion/Explosions.png',
    arcaneBlast: 'assets/misc/arcane_blast_strip.png',
    levelUpPillar: FDA_BASE + '09_Effects/Magic/level_up_pillar_32x64_8f.png',
    // Real artist crop growth & produce textures (Pixel_Gnome_Crops 4-stage + extended crops)
    crop_stage_0: 'assets/icons_extra/crop_stage_0.png',
    crop_stage_1: 'assets/icons_extra/crop_stage_1.png',
    crop_stage_2: 'assets/icons_extra/crop_stage_2.png',
    crop_trigo_s0: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Wheat/1 - Wheat Seed.png',
    crop_trigo_s1: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Wheat/2 - Wheat Sprout.png',
    crop_trigo_s2: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Wheat/3 - Wheat Mid.png',
    crop_trigo_s3: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Wheat/4 - Wheat Full.png',
    crop_tomate_s0: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Tomato/1 - Tomato Seed.png',
    crop_tomate_s1: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Tomato/2 - Tomato Sprout.png',
    crop_tomate_s2: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Tomato/3 - Tomato Mid.png',
    crop_tomate_s3: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Tomato/4 - Tomato Full.png',
    crop_calabaza_s0: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Pumpkin/1 - Pumpkin Seed.png',
    crop_calabaza_s1: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Pumpkin/2 - Pumpkin Sprout.png',
    crop_calabaza_s2: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Pumpkin/3 - Pumpkin Mid.png',
    crop_calabaza_s3: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Pumpkin/4 - Pumpkin Full.png',
    crop_papa_s0: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Potato/1 - Potato Seed.png',
    crop_papa_s1: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Potato/2 - Potato Sprout.png',
    crop_papa_s2: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Potato/3 - Potato Mid.png',
    crop_papa_s3: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Potato/4 - Potato Full.png',
    crop_trigo: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Wheat/4 - Wheat Full.png',
    crop_zanahoria_s0: 'assets/sprites_extra/crop_zanahoria_s0.png',
    crop_zanahoria_s1: 'assets/sprites_extra/crop_zanahoria_s1.png',
    crop_zanahoria_s2: 'assets/sprites_extra/crop_zanahoria_s2.png',
    crop_zanahoria_s3: 'assets/sprites_extra/crop_zanahoria_s3.png',
    crop_zanahoria: 'assets/icons/carrot.png',
    crop_calabaza: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Pumpkin/4 - Pumpkin Full.png',
    crop_papa: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Potato/4 - Potato Full.png',
    crop_flor_cristal_s0: 'assets/sprites_extra/crop_flor_cristal_s0.png',
    crop_flor_cristal_s1: 'assets/sprites_extra/crop_flor_cristal_s1.png',
    crop_flor_cristal_s2: 'assets/sprites_extra/crop_flor_cristal_s2.png',
    crop_flor_cristal_s3: 'assets/sprites_extra/crop_flor_cristal_s3.png',
    crop_flor_cristal: 'assets/icons_extra/flor_cristal.png',
    crop_tomate: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Tomato/4 - Tomato Full.png',
    crop_maiz_s0: 'assets/sprites_extra/crop_maiz_s0.png',
    crop_maiz_s1: 'assets/sprites_extra/crop_maiz_s1.png',
    crop_maiz_s2: 'assets/sprites_extra/crop_maiz_s2.png',
    crop_maiz_s3: 'assets/sprites_extra/crop_maiz_s3.png',
    crop_maiz: 'assets/icons_extra/corn.png',
    crop_berenjena_s0: 'assets/sprites_extra/crop_berenjena_s0.png',
    crop_berenjena_s1: 'assets/sprites_extra/crop_berenjena_s1.png',
    crop_berenjena_s2: 'assets/sprites_extra/crop_berenjena_s2.png',
    crop_berenjena_s3: 'assets/sprites_extra/crop_berenjena_s3.png',
    crop_berenjena: 'assets/icons_extra/eggplant.png',
    crop_chile_s0: 'assets/sprites_extra/crop_chile_s0.png',
    crop_chile_s1: 'assets/sprites_extra/crop_chile_s1.png',
    crop_chile_s2: 'assets/sprites_extra/crop_chile_s2.png',
    crop_chile_s3: 'assets/sprites_extra/crop_chile_s3.png',
    crop_chile: 'assets/icons_extra/chili.png',
    crop_fresa_s0: 'assets/sprites_extra/crop_fresa_s0.png',
    crop_fresa_s1: 'assets/sprites_extra/crop_fresa_s1.png',
    crop_fresa_s2: 'assets/sprites_extra/crop_fresa_s2.png',
    crop_fresa_s3: 'assets/sprites_extra/crop_fresa_s3.png',
    crop_fresa: 'assets/icons_extra/strawberry.png',
    crop_uva_s0: 'assets/sprites_extra/crop_uva_s0.png',
    crop_uva_s1: 'assets/sprites_extra/crop_uva_s1.png',
    crop_uva_s2: 'assets/sprites_extra/crop_uva_s2.png',
    crop_uva_s3: 'assets/sprites_extra/crop_uva_s3.png',
    crop_uva: 'assets/icons_extra/grapes.png',
    // Subtle movement & dash dust FX strips (Retro_Impact_Effects_3)
    walkDust: 'assets/misc/walk_dust_strip.png',
    dashDust: 'assets/misc/dash_dust_strip.png',
    // Ambient biome vegetation & ground details
    flora_tx_plant: 'assets/packs/Pixel Art Top Down - Basic v1.2.3/Texture/TX Plant.png',
    deco_shroom_1: 'assets/packs/Tiny Swords/Tiny Swords (Update 010)/Deco/01.png',
    deco_shroom_2: 'assets/packs/Tiny Swords/Tiny Swords (Update 010)/Deco/02.png',
    deco_shroom_3: 'assets/packs/Tiny Swords/Tiny Swords (Update 010)/Deco/03.png',
    deco_pebble_1: 'assets/packs/Tiny Swords/Tiny Swords (Update 010)/Deco/05.png',
    deco_bush_1: 'assets/packs/Tiny Swords/Tiny Swords (Update 010)/Deco/07.png',
    deco_bush_2: 'assets/packs/Tiny Swords/Tiny Swords (Update 010)/Deco/09.png',
    deco_fern_1: 'assets/packs/Tiny Swords/Tiny Swords (Update 010)/Deco/10.png',
    deco_fern_2: 'assets/packs/Tiny Swords/Tiny Swords (Update 010)/Deco/11.png',
    deco_dark_bush: 'assets/sprites_extra/deco_dark_bush.png',
    deco_berry_bush: 'assets/sprites_extra/deco_berry_bush.png',
    deco_thorn_bush: FDA_BASE + '10_Overworld/Dark_Forest/thorn_bush.png',
    deco_glow_shroom_b: FDA_BASE + '02_Props/Crystals_Nature/mushrooms_glow_blue.png',
    deco_glow_shroom_g: FDA_BASE + '02_Props/Crystals_Nature/mushrooms_glow_green.png',
    deco_shroom_p: FDA_BASE + '02_Props/Crystals_Nature/mushrooms_purple.png',
    deco_shroom_r: FDA_BASE + '02_Props/Crystals_Nature/mushrooms_red.png',
    // Real artist placeable blocks & furniture
    prop_bench: 'assets/sprites_extra/bench_wood.png',
    prop_lamppost: 'assets/sprites_extra/lamppost.png',
    prop_planter_wood: 'assets/sprites_extra/planter_wood.png',
    prop_fence: 'assets/sprites_extra/fence_wood.png',
    prop_cobble: 'assets/sprites_extra/cobble_tile.png',
    prop_cottage_orange: 'assets/sprites_extra/cottage_orange.png',
    prop_manor_blue: 'assets/sprites_extra/manor_blue.png',
    prop_crate: 'assets/sprites_extra/crate_wood.png',
    prop_barrel: 'assets/sprites_extra/barrel_wood.png',
    prop_angel: 'assets/sprites_extra/angel_statue.png',
    prop_rune_pillar: 'assets/sprites_extra/rune_pillar.png',
    prop_stone_block: 'assets/sprites_extra/stone_block.png',
    prop_well: 'assets/sprites_extra/stone_well.png',
    prop_bookshelf: 'assets/sprites_extra/bookshelf.png',
    prop_fireplace: 'assets/sprites_extra/fireplace.png',
    prop_banquet_table: 'assets/sprites_extra/banquet_table.png',
    // Fish shadows & live Pixel_Gnome_Fishing sprites for Fishing HUD & catches
    fish_shadow: 'assets/icons_extra/blue_fish.png',
    fish_rare_shadow: 'assets/icons_extra/yellow_fish.png',
    fish_anchoa: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/A - Salt Water/Anchovy Outline.png',
    fish_pez_payaso: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/A - Salt Water/Clownfish Outline.png',
    fish_cangrejo_dungeness: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/A - Salt Water/Crab - Dungeness Outline.png',
    fish_pez_globo: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/A - Salt Water/Pufferfish Outline.png',
    fish_pez_cirujano: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/A - Salt Water/Surgeonfish Outline.png',
    fish_pez_angel: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/B - Fresh Water/Angelfish Outline.png',
    fish_lubina: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/B - Fresh Water/Bass Outline.png',
    fish_bagre: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/B - Fresh Water/Catfish Outline.png',
    fish_pez_dorado: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/B - Fresh Water/Goldfish Outline.png',
    fish_carpa_dorada: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/B - Fresh Water/Goldfish Outline.png',
    fish_trucha_arcoiris: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/B - Fresh Water/Rainbow Trout Outline.png',
    fish_pez_comun: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/B - Fresh Water/Rainbow Trout Outline.png',
    fish_pez_azul: 'assets/icons_extra/blue_fish.png',
    fish_anguila: 'assets/icons_extra/eel.png',
    fish_camaron: 'assets/icons_extra/shrimp.png',
    fish_medusa: 'assets/icons_extra/jellyfish.png',
    fish_pulpo: 'assets/icons_extra/octopus.png',
    fish_perla: 'assets/icons_extra/pearl.png',
    fish_gema_marina: FDA_BASE + '07_Items/Loot_Coins_Gems/gem_sapphire.png',
    fish_caracola_antigua: 'assets/icons_extra/shell.png',
    fish_pez_abismal: 'assets/icons/fish_dark.png',
    fish_pez_helado: 'assets/icons/fish_ice.png',
    fish_pez_lava: 'assets/icons/fish_lava.png',
    water_splash_fx: 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Particle FX/Water Splash.png',
    water_ripple_sheet: 'assets/packs/Super_retro_water/Super_retro_world_water_animation/spritesheet_16x16_5frames.png',
    // Animated ocean water styles (4 clean light presets in Settings) + volcanic lava sprite
    water_anim: 'assets/tiles/water_clasico.png',
    water_clasico: 'assets/tiles/water_clasico.png',
    water_profundo: 'assets/tiles/water_profundo.png',
    water_esmeralda: 'assets/tiles/water_esmeralda.png',
    water_abisal: 'assets/tiles/water_abisal.png',
    lava_anim: 'assets/tiles/lava_anim.png',
    // VFX Free Pack multi-frame strips
    fx_vfx_elden_ring: 'assets/sprites_extra/fx_vfx_elden_ring.png',
    fx_vfx_explosion: 'assets/sprites_extra/fx_vfx_explosion.png',
    fx_vfx_magma: 'assets/sprites_extra/fx_vfx_magma.png',
    fx_vfx_shield: 'assets/sprites_extra/fx_vfx_shield.png',
    fx_vfx_puff: 'assets/sprites_extra/fx_vfx_puff.png',
    // Workstations (Furniture_Pack & ARPG Grajo)
    station_furnace: 'assets/sprites_extra/station_furnace.png',
    station_blast_furnace: 'assets/sprites_extra/station_blast_furnace.png',
    station_anvil: 'assets/sprites_extra/station_anvil.png',
    station_alchemy: 'assets/sprites_extra/station_alchemy.png',
    station_library: 'assets/sprites_extra/station_library.png',
    station_enchant: 'assets/sprites_extra/station_enchant.png',
    station_sawtable: 'assets/sprites_extra/station_sawtable.png',
    station_well_health: 'assets/sprites_extra/station_well_health.png',
    station_well_mana: 'assets/sprites_extra/station_well_mana.png',
    well_health_strip: 'assets/sprites_extra/well_health_strip.png',
    bld_fuente_plaza: 'assets/sprites_extra/bld_fuente_plaza.png',
    well_mana_strip: 'assets/sprites_extra/well_mana_strip.png',
    waypoint_white_strip: 'assets/sprites_extra/waypoint_white_strip.png',
    waypoint_dark_strip: 'assets/sprites_extra/waypoint_dark_strip.png',
    altar_amethyst: 'assets/sprites_extra/altar_amethyst.png',
    altar_volcano: 'assets/sprites_extra/altar_volcano.png',
    altar_emerald: 'assets/sprites_extra/altar_emerald.png',
    altar_blood: 'assets/sprites_extra/altar_blood.png',
    altar_sun: 'assets/sprites_extra/altar_sun.png',
    altar_arcane: 'assets/sprites_extra/altar_arcane.png',
    xp_orb: 'assets/icons/xp_orb.png',
    // Qoupys ROGNs crisp artist mineral & rock nodes (16x16)
    node_stone: 'assets/packs/Qoupys_ROGNs_Free/Individual_Sprites/Nodes/stoneNode.png',
    node_coal: 'assets/packs/Qoupys_ROGNs_Free/Individual_Sprites/Nodes/coalNode.png',
    node_copper: 'assets/packs/Qoupys_ROGNs_Free/Individual_Sprites/Nodes/copperNode.png',
    node_tin: 'assets/packs/Qoupys_ROGNs_Free/Individual_Sprites/Nodes/tinNode.png',
    node_iron: 'assets/packs/Qoupys_ROGNs_Free/Individual_Sprites/Nodes/ironNode.png',
    node_gold: 'assets/packs/Qoupys_ROGNs_Free/Individual_Sprites/Nodes/goldNode.png',
    node_jade: 'assets/packs/Qoupys_ROGNs_Free/Individual_Sprites/Nodes/jadeNode.png',
    node_amethyst: 'assets/packs/Qoupys_ROGNs_Free/Individual_Sprites/Nodes/amethystNode.png',
    node_bloodstone: 'assets/packs/Qoupys_ROGNs_Free/Individual_Sprites/Nodes/bloodstoneNode.png',
    node_boulder: 'assets/packs/Qoupys_ROGNs_Free/Individual_Sprites/Nodes/boulderNode.png',
    node_forge_stone: 'assets/packs/Qoupys_ROGNs_Free/Individual_Sprites/Nodes/forgeStoneNode.png',
    node_keep_stone: 'assets/packs/Qoupys_ROGNs_Free/Individual_Sprites/Nodes/keepStoneNode.png',
    // Altars & Shrines (FDA Props)
    altar_shrine: FDA_BASE + '02_Props/Altars_Shrines/shrine_32x32_anim_4f.png',
    altar_ritual: FDA_BASE + '02_Props/Altars_Shrines/altar_ritual_32x16_anim_6f.png',
    altar_gold: FDA_BASE + '02_Props/Altars_Shrines/altar_gold_32x16.png',
    altar_dark: FDA_BASE + '02_Props/Altars_Shrines/altar_dark_32x16.png',
    altar_stone: FDA_BASE + '02_Props/Altars_Shrines/altar_stone_32x16.png',
    healing_fountain: FDA_BASE + '02_Props/Altars_Shrines/healing_fountain_32x32_anim_4f.png',
    ee_throne: FDA_BASE + '02_Props/Altars_Shrines/throne_32x32.png',
    ee_treasure: FDA_BASE + '02_Props/Altars_Shrines/treasure_pile_32x16.png',
    ee_well: FDA_BASE + '02_Props/Altars_Shrines/well_32x32.png',
    // MagicMarket Animated Easter Egg & World Details
    ee_cauldron: 'assets/packs/MagicMarket/MagicMarket/Background/Animations/Cauldron.png',
    ee_crystal: 'assets/packs/MagicMarket/MagicMarket/Background/Animations/Crystal.png',
    ee_device: 'assets/packs/MagicMarket/MagicMarket/Background/Animations/Device.png',
    ee_lantern: 'assets/packs/MagicMarket/MagicMarket/Background/Animations/Lantern.png',
    ee_log: 'assets/packs/MagicMarket/MagicMarket/Background/Animations/Log.png',
    ee_sword_legend: FDA_BASE + '07_Items/Weapons/sword_legendary.png',
    // Textured UI Island Purchase Plaques & Passive Fauna
    plaque_green: 'assets/ui/ms_btn_green_normal.png',
    plaque_gold: 'assets/ui/ms_btn_gold_normal.png',
    plaque_blue: 'assets/ui/ms_btn_blue_normal.png',
    plaque_red: 'assets/ui/ms_btn_red_normal.png',
    plaque_stone: 'assets/ui/ms_btn_stone_normal.png',
    plaque_wood: 'assets/ui/ms_btn_gold_normal.png',
    plaque_cocoa: 'assets/ui/ms_btn_stone_normal.png',
    rubber_duck: 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Decorations/Rubber Duck/Rubber duck.png',
    cactus_icon: 'assets/icons/cactus.png',
    // Textured Passive Animals (animated sprite sheets)
    cow_sheet: 'assets/packs/Pixel_Farm_Assets/Pixel Farm_Assets/PixelFarm_Cow-Sheet.png',
    sheep_pf_sheet: 'assets/packs/Pixel_Farm_Assets/Pixel Farm_Assets/PixelFarm_Sheep-Sheet.png',
    pig_sheet: 'assets/sprites_extra/animals/pig_sheet.png',
    rabbit_sheet: 'assets/sprites_extra/animals/rabbit_sheet.png',
    duck_sheet: 'assets/sprites_extra/animals/duck_sheet.png',
    // Textured Meteors, Volcanic Rocks, Mushrooms, Dig/Fish Spots & Specialized Buildings
    meteor_red: 'assets/sprites_extra/nodes/meteor_red.png',
    meteor_gold: 'assets/sprites_extra/nodes/meteor_gold.png',
    meteor_blue: 'assets/sprites_extra/nodes/meteor_blue.png',
    meteor_dark: 'assets/sprites_extra/nodes/meteor_dark.png',
    cave_rock_big: 'assets/sprites_extra/nodes/cave_rock_big.png',
    cave_mushroom_orange: 'assets/sprites_extra/nodes/cave_mushroom_orange.png',
    cave_mushroom_brown: 'assets/sprites_extra/nodes/cave_mushroom_brown.png',
    mushroom_blue_anim: FDA_BASE + '02_Props/Crystals_Nature/mushrooms_glow_blue.png',
    mushroom_green_anim: FDA_BASE + '02_Props/Crystals_Nature/mushrooms_glow_green.png',
    dig_spot_x: 'assets/sprites_extra/nodes/dig_spot_x.png?v=1.6.8',
    fish_ripple: 'assets/sprites_extra/nodes/fish_ripple.png?v=1.6.8',
    corral_pen: 'assets/sprites_extra/nodes/corral_pen.png',
    Corral_Pen: 'assets/sprites_extra/nodes/corral_pen.png',
    fish_pond: 'assets/sprites_extra/nodes/fish_pond.png?v=1.6.2',
    Fish_Pond: 'assets/sprites_extra/nodes/fish_pond.png?v=1.6.2',
    garden_plot: 'assets/sprites_extra/nodes/garden_plot.png',
    Plot_Garden: 'assets/sprites_extra/nodes/garden_plot.png',
    Mercado_Stall: 'assets/sprites_extra/bld_mercado.png',
    Castle_Yellow: 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Yellow Buildings/Castle.png',
    Tower_Purple: 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Purple Buildings/Tower.png',
    Tablon_Logros: 'assets/sprites_extra/bld_tablon_logros.png',
    // Distinct building textures for all specialized buildings
    bld_molino: 'assets/sprites_extra/bld_molino.png',
    bld_telar: 'assets/sprites_extra/bld_telar.png',
    bld_cocina: 'assets/sprites_extra/bld_cocina.png',
    bld_casa_comercio: 'assets/sprites_extra/bld_casa_comercio.png',
    bld_tesoreria: 'assets/sprites_extra/bld_tesoreria.png',
    bld_plantacion: 'assets/sprites_extra/bld_plantacion.png',
    bld_granja: 'assets/sprites_extra/bld_granja.png',
    bld_laboratorio: 'assets/sprites_extra/bld_laboratorio.png',
    bld_taller_mecanico: 'assets/sprites_extra/bld_taller_mecanico.png',
    bld_centro_investigacion: 'assets/sprites_extra/bld_centro_investigacion.png',
    bld_santuario: 'assets/sprites_extra/bld_santuario.png',
    bld_taladro: 'assets/sprites_extra/bld_taladro.png',
    bld_aspersor: 'assets/sprites_extra/bld_aspersor.png',
    bld_invernadero: 'assets/sprites_extra/bld_invernadero.png',
    bld_colmena: 'assets/sprites_extra/bld_colmena.png',
    bld_ahumador: 'assets/sprites_extra/bld_ahumador.png',
    bld_cantera: 'assets/sprites_extra/bld_cantera.png',
    bld_muelle_pesca: 'assets/sprites_extra/bld_muelle_pesca.png',
    bld_balista: 'assets/sprites_extra/bld_balista.png',
    bld_faro_costero: 'assets/sprites_extra/bld_faro_costero.png',
    bld_muro_madera: 'assets/sprites_extra/bld_muro_madera.png',
    bld_jardin_mariposas: 'assets/sprites_extra/bld_jardin_mariposas.png',
    // Extended world nodes & biome crystal/mineral clusters
    node_herb_patch: 'assets/sprites_extra/nodes/node_herb_patch.png',
    node_wild_crop: 'assets/sprites_extra/nodes/node_wild_crop.png',
    node_cactus: 'assets/sprites_extra/nodes/node_cactus.png',
    node_sulfur: 'assets/sprites_extra/nodes/node_sulfur.png',
    node_silver: 'assets/sprites_extra/nodes/node_silver.png',
    node_platinum: 'assets/sprites_extra/nodes/node_platinum.png',
    node_malachite: 'assets/sprites_extra/nodes/node_malachite.png',
    node_star_sand: 'assets/sprites_extra/nodes/node_star_sand.png',
    node_amber: 'assets/sprites_extra/nodes/node_amber.png',
    node_titanium: 'assets/sprites_extra/nodes/node_titanium.png',
    node_obsidian: 'assets/sprites_extra/nodes/node_obsidian.png',
    node_magma_core: 'assets/sprites_extra/nodes/node_magma_core.png',
    node_adamantite: 'assets/sprites_extra/nodes/node_adamantite.png',
    node_orichalcum: 'assets/sprites_extra/nodes/node_orichalcum.png',
    node_emerald: 'assets/sprites_extra/nodes/node_emerald.png',
    node_diamond: 'assets/sprites_extra/nodes/node_diamond.png',
    node_ruby: 'assets/sprites_extra/nodes/node_ruby.png',
    node_sapphire: 'assets/sprites_extra/nodes/node_sapphire.png',
    node_mithril: 'assets/sprites_extra/nodes/node_mithril.png',
    node_azurite: 'assets/sprites_extra/nodes/node_azurite.png',
    node_ice_crystal: 'assets/sprites_extra/nodes/node_ice_crystal.png',
    node_abyssal_crystal: 'assets/sprites_extra/nodes/node_abyssal_crystal.png',
    // Animated Mini-Boss Champion Sprites (6-frame HD V14 strips)
    miniboss_sword: 'assets/sprites_extra/miniboss_sword_4f.png?v=2.0.3',
    miniboss_mace: 'assets/sprites_extra/miniboss_mace_4f.png?v=2.0.3',
    miniboss_mage: 'assets/sprites_extra/miniboss_mage_4f.png?v=2.0.3',
    // Textured Projectiles (Player Arrows & Enemy Magic/Spells)
    proj_arrow: FDA_BASE + '04_Enemies/Projectiles/arrow_right_1f.png',
    proj_fireball: FDA_BASE + '04_Enemies/Projectiles/fireball_right_4f.png',
    proj_ice: FDA_BASE + '04_Enemies/Projectiles/ice_shard_right_4f.png',
    proj_dark: FDA_BASE + '04_Enemies/Projectiles/dark_orb_right_4f.png',
    proj_magic: FDA_BASE + '04_Enemies/Projectiles/magic_bolt_right_4f.png',
    proj_necro: FDA_BASE + '04_Enemies/Projectiles/necro_bolt_right_4f.png',
    proj_poison: FDA_BASE + '04_Enemies/Projectiles/poison_spit_right_4f.png',
    proj_bone: FDA_BASE + '04_Enemies/Projectiles/bone_throw_right_4f.png',
    proj_web: FDA_BASE + '04_Enemies/Projectiles/web_shot_right_4f.png',
    // Textured Crescent Slash FX & Village Props
    slash_strip_gold: 'assets/sprites_extra/slash_strip_gold.png',
    slash_strip_crimson: 'assets/sprites_extra/slash_strip_crimson.png',
    slash_strip_cyan: 'assets/sprites_extra/slash_strip_cyan.png',
    slash_strip_violet: 'assets/sprites_extra/slash_strip_violet.png',
    slash_strip_emerald: 'assets/sprites_extra/slash_strip_emerald.png',
    slash_strip_white: 'assets/sprites_extra/slash_strip_white.png',
    water_foam: 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Tileset/Water Foam.png',
    village_grass_turf: 'assets/sprites_extra/village_grass_turf.png',
    village_cobble_path: 'assets/sprites_extra/village_cobble_path.png',
    village_fence: 'assets/sprites_extra/village_fence.png',
    village_bench: 'assets/sprites_extra/village_bench.png',
    village_lamppost: 'assets/sprites_extra/village_lamppost.png',
    village_planter_wood: 'assets/sprites_extra/village_planter_wood.png',
    village_stall: 'assets/sprites_extra/village_stall.png',
    village_house_red: 'assets/sprites_extra/village_house_red.png',
    village_house_blue: 'assets/sprites_extra/village_house_blue.png',
    fda_bar_frame: 'assets/ui/fda_bar_frame.png',
    fda_fill_hp: 'assets/ui/fda_fill_hp.png',
    fda_fill_mana: 'assets/ui/fda_fill_mana.png',
    fda_fill_xp: 'assets/ui/fda_fill_xp.png',
    // Level-Up Thunder FX, Nature Butterflies/Flora & Purple Undead Monument Props
    fx_thunder_strike: 'assets/sprites_extra/fx_thunder_strike.png',
    fx_thunder_splash: 'assets/sprites_extra/fx_thunder_splash.png',
    fx_level_ring: 'assets/sprites_extra/fx_level_ring.png',
    nat_leaf: 'assets/sprites_extra/nat_leaf.png',
    nat_flower: 'assets/sprites_extra/nat_flower.png',
    nat_mushroom: 'assets/sprites_extra/nat_mushroom.png',
    butterfly_orange: 'assets/sprites_extra/butterfly_orange.png',
    butterfly_blue: 'assets/sprites_extra/butterfly_blue.png',
    butterfly_violet: 'assets/sprites_extra/butterfly_violet.png',
    butterfly_gold: 'assets/sprites_extra/butterfly_gold.png',
    prop_ancient_oak: 'assets/sprites_extra/prop_ancient_oak.png',
    fire_brazier: 'assets/sprites_extra/fire_brazier.png',
    giant_skeleton_1: 'assets/sprites_extra/giant_skeleton_1.png',
    giant_skeleton_2: 'assets/sprites_extra/giant_skeleton_2.png?v=1.6.8',
    giant_skeleton_3: 'assets/sprites_extra/giant_skeleton_3.png?v=1.6.8',
    pile_skulls: 'assets/sprites_extra/pile_skulls.png?v=1.6.8',
    skull_door: 'assets/sprites_extra/skull_door.png?v=1.6.8',
    undead_crystal: 'assets/sprites_extra/undead_crystal.png',
    undead_grave: 'assets/sprites_extra/undead_grave.png',
    undead_dead_arm: 'assets/sprites_extra/undead_dead_arm.png',
    undead_dead_tree: 'assets/sprites_extra/undead_dead_tree.png',
    undead_bones: 'assets/sprites_extra/undead_bones.png',
    sky_nebula_blue: 'assets/ui/sky_nebula_blue.png',
    sky_nebula_purple: 'assets/ui/sky_nebula_purple.png',
    sky_starfield: 'assets/ui/sky_starfield.png',
    key_e: 'assets/ui/key_e.png?v=1.6.2',
    key_e_pressed: 'assets/ui/key_e_pressed.png?v=1.6.2',
    tilled_soil: 'assets/sprites_extra/tilled_soil.png',
    tilled_soil_wet: 'assets/sprites_extra/tilled_soil_wet.png',
    Mesa_Artesania: 'assets/sprites_extra/bld_mesa_artesania.png',
    bld_mesa_artesania: 'assets/sprites_extra/bld_mesa_artesania.png',
    bld_mesa_hechiceria: 'assets/sprites_extra/bld_mesa_hechiceria.png',
    bld_yunque_runico: 'assets/sprites_extra/bld_yunque_runico.png',
    bld_observatorio_astral: 'assets/sprites_extra/globe_stand.png',
    bld_torre_rayos: 'assets/sprites_extra/bld_torre_rayos.png',
    bld_torre_magica: 'assets/sprites_extra/bld_torre_magica.png',
    bld_recolector: 'assets/sprites_extra/bld_recolector.png',
    bld_banco: 'assets/sprites_extra/bld_banco.png',
    prop_pipe: 'assets/sprites_extra/prop_pipe.png',
    prop_chest: 'assets/sprites_extra/chest_logistic_closed.png',
    chest_logistic_closed: 'assets/sprites_extra/chest_logistic_closed.png',
    chest_logistic_open: 'assets/sprites_extra/chest_logistic_open.png',
    animal_cow: 'assets/sprites_extra/animals/animal_cow.png',
    animal_pig: 'assets/sprites_extra/animals/animal_pig.png',
    animal_duck: 'assets/sprites_extra/animals/animal_duck.png',
    bld_omega_nexo: 'assets/sprites_extra/bld_omega_nexo.png?v=2.0.3',
    bld_omega_pilon: 'assets/sprites_extra/bld_omega_pilon.png',
    bld_omega_bateria: 'assets/sprites_extra/bld_omega_bateria.png',
    bld_omega_gen_vapor: 'assets/sprites_extra/bld_omega_gen_vapor.png',
    bld_omega_gen_geo: 'assets/sprites_extra/bld_omega_gen_geo.png',
    bld_omega_nucleo: 'assets/sprites_extra/bld_omega_nucleo.png',
    bld_omega_reactor: 'assets/sprites_extra/bld_omega_reactor.png',
    bld_omega_trituradora: 'assets/sprites_extra/bld_omega_trituradora.png',
    bld_omega_lavadora: 'assets/sprites_extra/bld_omega_lavadora.png',
    bld_omega_fundidora: 'assets/sprites_extra/bld_omega_fundidora.png',
    bld_omega_sintetizador: 'assets/sprites_extra/bld_omega_sintetizador.png',
    bld_omega_inscriptor: 'assets/sprites_extra/bld_omega_inscriptor.png',
    bld_omega_extractor: 'assets/sprites_extra/bld_omega_extractor.png',
    bld_omega_domo: 'assets/sprites_extra/bld_omega_domo.png',
    bld_omega_torreta: 'assets/sprites_extra/bld_omega_torreta.png',
    bld_omega_baliza: 'assets/sprites_extra/bld_omega_baliza.png',
    bld_omega_camara: 'assets/sprites_extra/bld_omega_camara.png',
    bld_omega_prensa: 'assets/sprites_extra/bld_omega_prensa.png',
    bld_omega_condensador: 'assets/sprites_extra/bld_omega_condensador.png',
    bld_omega_altar: 'assets/sprites_extra/bld_omega_altar.png',
    bld_basurero: 'assets/sprites_extra/bld_basurero.png',
    // === Beta 1.3.0: 17 Nuevos Nodos de Recoleccion & 13 Props de Bioma ===
    node_coral_abisal:    'assets/sprites_v13/nodes/node_coral_abisal.png',
    node_perla_turquesa:  'assets/sprites_v13/nodes/node_perla_turquesa.png',
    node_madera_ferrea:   'assets/sprites_v13/nodes/node_madera_ferrea.png',
    node_resina_toxica:   'assets/sprites_v13/nodes/node_resina_toxica.png',
    node_pirita_solar:    'assets/sprites_v13/nodes/node_pirita_solar.png',
    node_agata_roja:      'assets/sprites_v13/nodes/node_agata_roja.png',
    node_cuarzo_boreal:   'assets/sprites_v13/nodes/node_cuarzo_boreal.png',
    node_hielo_eterno:    'assets/sprites_v13/nodes/node_hielo_eterno.png',
    node_hueso_fosil:     'assets/sprites_v13/nodes/node_hueso_fosil.png',
    node_plata_maldita:   'assets/sprites_v13/nodes/node_plata_maldita.png',
    node_escoria_caldera: 'assets/sprites_v13/nodes/node_escoria_caldera.png',
    node_cristal_carmesi: 'assets/sprites_v13/nodes/node_cristal_carmesi.png',
    node_bismuto_astral:  'assets/sprites_v13/nodes/node_bismuto_astral.png',
    node_celestita:       'assets/sprites_v13/nodes/node_celestita.png',
    node_jade_ancestral:  'assets/sprites_v13/nodes/node_jade_ancestral.png',
    node_marmol_oscuro:   'assets/sprites_v13/nodes/node_marmol_oscuro.png',
    node_flor_pantano:    'assets/sprites_v13/nodes/node_flor_pantano.png',
    prop_palm_tree:       'assets/sprites_v13/props/palm_tree.png',
    prop_desert_ribs:     'assets/sprites_v13/props/desert_ribs.png',
    prop_cactus_tall:     'assets/sprites_v13/props/cactus_tall.png',
    prop_giant_jungle:    'assets/sprites_v13/props/giant_jungle_tree.png',
    prop_giant_fungi:     'assets/sprites_v13/props/giant_swamp_fungi.png',
    prop_snow_pine:       'assets/sprites_v13/props/snow_pine_tall.png',
    prop_crystal_pillar:  'assets/sprites_v13/props/crystal_pillar_blue.png',
    prop_swamp_altar:     'assets/sprites_v13/props/swamp_altar_prop.png',
    prop_obelisk_sand:    'assets/sprites_v13/props/obelisk_sand.png',
    prop_grave_angel:     'assets/sprites_v13/props/grave_angel.png',
    prop_cursed_eye:      'assets/sprites_v13/props/cursed_eye_tree.png',
    prop_volcano_cone:    'assets/sprites_v13/props/volcano_cone.png',
    prop_burning_tree:    'assets/sprites_v13/props/burning_tree.png',
    // === Beta 2.0.0 RC2: Authentic Pixel-Art Buildings, Active Pets & Marine Encounters ===
    bld_portal_acuario:        'assets/sprites_v2/bld_portal_acuario.png?v=2.0.3',
    bld_mesa_reforja:          'assets/sprites_v2/bld_mesa_reforja.png?v=2.0.3',
    bld_salon_trofeos:         'assets/sprites_v2/bld_salon_trofeos.png?v=2.0.0-rc2px',
    bld_baliza_teletransporte: 'assets/sprites_v2/bld_baliza_teletransporte.png?v=2.0.3',
    pet_limo_dorado_4f:        'assets/sprites_v2/pet_limo_dorado_4f.png?v=2.0.0-rc2px',
    pet_cangrejo_coral_4f:     'assets/sprites_v2/pet_cangrejo_coral_4f.png?v=2.0.0-rc2px',
    pet_buho_astral_4f:        'assets/sprites_v2/pet_buho_astral_4f.png?v=2.0.0-rc2px',
    pet_espiritu_igneo_4f:     'assets/sprites_v2/pet_espiritu_igneo_4f.png?v=2.0.0-rc2px',
    pet_pez_linterna_4f:       'assets/sprites_v2/pet_pez_linterna_4f.png?v=2.0.0-rc2px',
    ship_mercader_fantasma_4f: 'assets/sprites_v2/ship_mercader_fantasma_4f.png?v=2.0.0-rc2px',
    sea_whirlpool_4f:          'assets/sprites_v2/sea_whirlpool_4f.png?v=2.0.0-rc2px',
    boss_leviatan_marino_4f:   'assets/sprites_v2/boss_leviatan_marino_4f.png?v=2.0.0-rc2px',
    kraken_tentacle_4f:        'assets/sprites_v2/kraken_tentacle_4f.png?v=2.0.0-rc2px',
    pipe_conduit_sheet_20:     'assets/sprites_v2/pipe_conduit_sheet_20.png?v=2.0.0-rc2px2',
    pipe_conduit_icon:         'assets/sprites_v2/pipe_conduit_icon.png?v=2.0.0-rc2px2'
  };

  const assets = Abyssea.Assets;
  if (!assets) return;

  assets.extraImages = {};
  assets.itemImages = {};
  assets.enemyImages = {};
  assets.bossImages = {};
  assets.npcSheets = {};
  assets.gateImages = {};
  assets.chestImages = {};
  assets.dungeonImages = {};

  function loadImg(url, retries = 3) {
    return new Promise((resolve) => {
      const baseSrc = encodeURI(withRoot(url));
      let attempt = 0;
      const tryLoad = () => {
        const img = new Image();
        img.onload = () => {
          if (img.naturalWidth > 0) resolve(img);
          else onFail();
        };
        const onFail = () => {
          attempt++;
          if (attempt <= retries) {
            const sep = baseSrc.includes('?') ? '&' : '?';
            setTimeout(() => {
              const retryImg = new Image();
              retryImg.onload = () => (retryImg.naturalWidth > 0 ? resolve(retryImg) : onFail());
              retryImg.onerror = onFail;
              retryImg.src = baseSrc + sep + '_r=' + attempt;
            }, 180 * attempt);
          } else {
            resolve(null);
          }
        };
        img.onerror = onFail;
        img.src = baseSrc;
      };
      tryLoad();
    });
  }

  async function runBatched(tasks, concurrency = 24) {
    let idx = 0;
    const workers = Array.from({ length: Math.min(concurrency, Math.max(1, tasks.length)) }, async () => {
      while (idx < tasks.length) {
        const cur = idx++;
        try { await tasks[cur](); } catch (_) {}
      }
    });
    await Promise.all(workers);
  }

  const _pendingEnemyLoads = new Set();
  assets.ensureEnemyImage = function (enemyType) {
    if (!enemyType) return null;
    const existing = assets.enemyImages && assets.enemyImages[enemyType];
    if (existing && existing.complete && existing.naturalWidth > 0) return existing;
    const meta = Abyssea.ENEMY_SPRITE_PATHS && Abyssea.ENEMY_SPRITE_PATHS[enemyType];
    if (!meta || !meta.path || _pendingEnemyLoads.has('e:' + enemyType)) return existing || null;
    _pendingEnemyLoads.add('e:' + enemyType);
    loadImg(meta.path, 3).then((img) => {
      _pendingEnemyLoads.delete('e:' + enemyType);
      if (img) assets.enemyImages[enemyType] = img;
    });
    return null;
  };

  assets.ensureBossImage = function (bossBiome) {
    if (!bossBiome) return null;
    const existing = assets.bossImages && assets.bossImages[bossBiome];
    if (existing && existing.complete && existing.naturalWidth > 0) return existing;
    const meta = Abyssea.BOSS_SPRITE_PATHS && Abyssea.BOSS_SPRITE_PATHS[bossBiome];
    if (!meta || !meta.path || _pendingEnemyLoads.has('b:' + bossBiome)) return existing || null;
    _pendingEnemyLoads.add('b:' + bossBiome);
    loadImg(meta.path, 3).then((img) => {
      _pendingEnemyLoads.delete('b:' + bossBiome);
      if (img) assets.bossImages[bossBiome] = img;
    });
    return null;
  };

  // Upgrade ground drop / canvas icon resolver to serve crisp loaded PNGs whenever available
  const origGetItemIconCanvas = assets.getItemIconCanvas.bind(assets);
  assets.getItemIconCanvas = function (iconType) {
    const rawKey = typeof iconType === 'string' ? iconType.replace(/^ov_/, '') : iconType;
    const itDef = Abyssea.ITEMS && (Abyssea.ITEMS[iconType] || Abyssea.ITEMS[rawKey]);
    const mappedIcon = itDef && itDef.icon;
    const cleanMapped = typeof mappedIcon === 'string' ? mappedIcon.replace(/^ov_/, '') : mappedIcon;
    const img = assets.itemImages && (assets.itemImages[iconType] || assets.itemImages[rawKey] || (mappedIcon && assets.itemImages[mappedIcon]));
    if (img && img.complete && img.naturalWidth > 0) return img;
    return origGetItemIconCanvas(cleanMapped || rawKey || iconType);
  };

  const origGetToolIconCanvas = assets.getToolIconCanvas.bind(assets);
  assets.getToolIconCanvas = function (toolId, tierId = 'basica') {
    const tierMap = Abyssea.TOOL_PNG_MAP && Abyssea.TOOL_PNG_MAP[toolId];
    const rawUrl = tierMap && ((tierId === 'basica' || !tierId) ? tierMap.basica : tierMap[tierId]);
    if (rawUrl && assets.preloadedUrls) {
      const enc = encodeURI(withRoot(rawUrl));
      const img = assets.preloadedUrls[enc] || assets.preloadedUrls[encodeURI(rawUrl)];
      if (img && img.complete && img.naturalWidth > 0) return img;
    }
    return origGetToolIconCanvas(toolId, tierId);
  };

  assets.loadExtraAssets = async function () {
    const uniqueItemUrlCache = {};
    const loadCached = (url) => {
      if (!uniqueItemUrlCache[url]) uniqueItemUrlCache[url] = loadImg(url, 3);
      return uniqueItemUrlCache[url];
    };

    // Priority Wave 1: Enemies, Bosses, NPCs, Gates, Chests, Dungeon Tiles & World Extra Sprites (batched so HTTP/2 never drops sprites!)
    const priorityTasks = [];
    for (const [id, meta] of Object.entries(Abyssea.ENEMY_SPRITE_PATHS)) {
      if (!meta || !meta.path) continue;
      priorityTasks.push(() => loadCached(meta.path).then(img => { if (img) assets.enemyImages[id] = img; }));
    }
    for (const [id, meta] of Object.entries(Abyssea.BOSS_SPRITE_PATHS)) {
      if (!meta || !meta.path) continue;
      priorityTasks.push(() => loadCached(meta.path).then(img => { if (img) assets.bossImages[id] = img; }));
    }
    for (const [id, url] of Object.entries(Abyssea.NPC_SHEET_PATHS)) {
      if (!url) continue;
      priorityTasks.push(() => loadCached(url).then(img => { if (img) assets.npcSheets[id] = img; }));
    }
    for (const [id, url] of Object.entries(Abyssea.DUNGEON_GATE_PATHS)) {
      if (!url) continue;
      priorityTasks.push(() => loadCached(url).then(img => { if (img) assets.gateImages[id] = img; }));
    }
    for (const [id, url] of Object.entries(Abyssea.CHEST_SPRITE_PATHS)) {
      if (!url) continue;
      priorityTasks.push(() => loadCached(url).then(img => { if (img) assets.chestImages[id] = img; }));
    }
    for (const [id, url] of Object.entries(Abyssea.DUNGEON_TILE_PATHS)) {
      if (!url) continue;
      priorityTasks.push(() => loadCached(url).then(img => { if (img) assets.dungeonImages[id] = img; }));
    }
    for (const [id, url] of Object.entries(Abyssea.EXTRA_SPRITE_PATHS)) {
      if (!url) continue;
      priorityTasks.push(() => loadCached(url).then(img => { if (img) assets.extraImages[id] = img; }));
    }

    // Priority Wave 2: Item Icons & VFX (batched cleanly)
    const secondaryTasks = [];
    for (const [id, url] of Object.entries(Abyssea.ITEM_PNG_MAP)) {
      if (!url) continue;
      secondaryTasks.push(() => loadCached(url).then(img => { if (img) assets.itemImages[id] = img; }));
    }
    if (Abyssea.ITEMS) {
      for (const it of Object.values(Abyssea.ITEMS)) {
        if (!it || !it.id || !it.icon || assets.itemImages[it.id]) continue;
        const url = Abyssea.ITEM_PNG_MAP[it.icon];
        if (!url) continue;
        secondaryTasks.push(() => loadCached(url).then(img => { if (img && !assets.itemImages[it.id]) assets.itemImages[it.id] = img; }));
      }
    }
    if (Abyssea.VFX_V2) {
      for (const [id, meta] of Object.entries(Abyssea.VFX_V2)) {
        if (!meta || !meta.path) continue;
        secondaryTasks.push(() => loadCached(meta.path).then(img => { if (img) assets.extraImages[id] = img; }));
      }
    }

    assets.preloadedIcons = assets.preloadedIcons || [];
    assets.preloadedUrls = assets.preloadedUrls || {};
    const preloadPool = [
      ...Object.values(Abyssea.TOOL_PNG_MAP || {}).flatMap(m => Object.values(m || {})),
      ...(Abyssea.SKILL_ICON_POOL || []),
      ...Object.values(Abyssea.SKILL_ICON_URLS || {}),
      ...Object.values(Abyssea.SKILL_EXTRA_ICONS || {}),
      ...Object.values(Abyssea.UI_URLS || {}),
      ...Object.values(Abyssea.BUFF_ICON_URLS || {}),
      ...Object.values(Abyssea.NPC_PORTRAIT_URLS || {}),
      'assets/icons/biome_pradera.png',
      'assets/icons/biome_desierto.png',
      'assets/icons/biome_bosque_oscuro.png',
      'assets/icons/biome_montanas_heladas.png',
      'assets/icons/biome_tierras_volcanicas.png',
      'assets/ui/ms_btn_blue_normal.png',
      'assets/ui/ms_btn_blue_hover.png',
      'assets/ui/ms_btn_green_normal.png',
      'assets/ui/ms_btn_green_hover.png',
      'assets/ui/ms_btn_gold_normal.png',
      'assets/ui/ms_btn_gold_hover.png',
      'assets/ui/ms_btn_red_normal.png',
      'assets/ui/ms_btn_red_hover.png',
      'assets/ui/ms_btn_stone_normal.png',
      'assets/ui/ms_btn_stone_hover.png',
      'assets/ui/ms_close_normal.png',
      'assets/ui/ms_close_hover.png',
      'assets/ui/ms_slider_track.png',
      'assets/ui/ms_slider_fill.png',
      'assets/ui/ms_slider_thumb.png'
    ];
    const preloadTasks = [];
    for (const rawUrl of preloadPool) {
      if (!rawUrl || typeof rawUrl !== 'string') continue;
      preloadTasks.push(() => loadCached(rawUrl).then(img => {
        if (img) {
          assets.preloadedIcons.push(img);
          assets.preloadedUrls[encodeURI(withRoot(rawUrl))] = img;
          assets.preloadedUrls[encodeURI(rawUrl)] = img;
        }
      }));
    }
    const allTotal = Math.max(1, priorityTasks.length + secondaryTasks.length + preloadTasks.length);
    assets._extraTotal = allTotal;
    assets._extraLoaded = 0;
    const wrapTrack = (list) => list.map((fn) => async () => { try { await fn(); } finally { assets._extraLoaded++; } });
    // Wave 1 (enemies, bosses, NPCs, world sprites) runs first so combat entities are ALWAYS ready!
    await runBatched(wrapTrack(priorityTasks), 28);
    await runBatched(wrapTrack(secondaryTasks), 28);
    await runBatched(wrapTrack(preloadTasks), 24);
  };


  // ===== TEXTURE OVERHAUL v1.3.1: concordant per-item icons =====
  (function () {
    const P = 'assets/icons_extra/', X = '.png'; const M = Abyssea.ITEM_PNG_MAP; const I = Abyssea.ITEMS || {}; const R = Abyssea.PERMANENT_RELICS || {};
    const items = {'cera_abeja':'cera_abeja','miel':'miel','sashimi_glacial':'sashimi_glacial','brocheta_magma':'brocheta_magma','estofado_marino_supremo':'estofado_marino','pescado_brasa':'pescado_brasa','pez_legendario_kraken':'fish_kraken','pez_abismal':'fish_abismal','anguila_sombras':'fish_eel_shadow','pez_fenix_magma':'fish_phoenix_lava','esturion_glacial':'fish_sturgeon_ice','pez_dorado_solar':'fish_gold_solar','cofre_hundido':'cofre_hundido','viga_madera':'viga_madera','fibra_vegetal':'fibra_vegetal','tela_reforzada':'tela_reforzada','reliquia_vacio':'reliquia_vacio','abono_dorado':'abono_dorado','compost_magico':'compost_magico','cebo_arcano':'cebo_arcano','cebo_volcanico':'cebo_volcanico','gema_vacio':'gema_vacio','lingote_plata':'lingote_plata','lingote_platino':'lingote_platino','lingote_titanio':'lingote_titanio','aleacion_celestial':'aleacion_celestial','lingote_oricalco':'lingote_oricalco','grimorio_escudo_divino':'grimorio_divino','grimorio_paso_etereo':'grimorio_etereo','armadura_coral':'armadura_coral','casco_coral':'casco_coral','armadura_boreal':'armadura_boreal','casco_boreal':'casco_boreal','armadura_selva':'armadura_selva','armadura_caldera':'armadura_caldera','armadura_faraon':'armadura_faraon','armadura_abismal':'armadura_abismal','casco_abismal':'casco_abismal','botas_abismal':'botas_abismal','mochila_astral':'mochila_astral','escudo_celestial':'shield_celestial','armadura_volcanica':'armor_volcanica','casco_abyssea':'helm_abyssea','botas_celestiales':'boots_celestiales','armadura_tela':'armor_cloth_tunic','armadura_oricalco':'armor_oricalco','casco_oricalco':'helm_oricalco','botas_oricalco':'boots_oricalco','casco_solar':'helm_solar','armadura_celestial':'armor_solar','botas_solar':'boots_solar','escudo_solar':'shield_solar','escudo_oricalco':'shield_oricalco','escudo_boreal':'shield_boreal','escudo_glaciar':'shield_glaciar','hoja_singularidad':'hoja_singularidad','arco_omega':'arco_omega','cetro_omega':'cetro_omega','cofre_logistico_item':'cofre_logistico_ico'};
    const relics = {'tridente_fosa_marina':'rel_tridente_fosa','corona_emperatriz_mar':'rel_corona_emperatriz','perla_sirena_azul':'rel_perla_sirena','espejo_cuarzo_astral':'rel_espejo_cuarzo','nemes_faraon_inmortal':'rel_nemes_faraon','cetro_sol_cenit':'rel_cetro_sol','corona_soverano_huesos':'rel_corona_soverano','caliz_sangre_maldita':'rel_caliz_sangre','caliz_hielo_inmaculado':'rel_caliz_hielo','esquirla_prisma_tierra':'rel_esquirla_prisma','fragmento_obelisco_solar':'rel_fragmento_obelisco','mascara_serpiente_jade':'rel_mascara_serpiente','farol_almas_errantes':'rel_farol_almas','costilla_dragon_oseo':'rel_costilla_dragon','corazon_abominacion_carnica':'rel_corazon_abominacion','corona_senor_caldera':'rel_corona_caldera','fetiche_manglar_negro':'rel_fetiche_manglar','totem_hidra_cienaga':'rel_totem_hidra','talisman_raices_antiguas':'rel_talisman_raices','colmillo_bestia_ceniza':'rel_colmillo_bestia','linterna_cosecha_maldita':'rel_linterna_cosecha','osario_marfil_maldito':'rel_osario_marfil','ojo_tormenta_polar':'rel_ojo_tormenta','yunque_basalto_rojo':'rel_yunque_basalto','pluma_quetzal_dorado':'rel_pluma_quetzal','corazon_celestita_eterno':'rel_corazon_celestita','prisma_geoda_viva':'rel_prisma_geoda','brasa_fumarola_oscura':'rel_brasa_fumarola','escoria_crater_ardiente':'rel_escoria_crater','ambar_reina_esmeralda':'rel_ambar_reina','esquirla_grieta_azul':'rel_esquirla_grieta','corazon_cero_absoluto':'rel_corazon_cero','corazon_eclipse_carmesi':'rel_corazon_eclipse','ojo_abismo_singularity':'rel_ojo_abismo_sing'};
    for (const [id, f] of Object.entries(items)) { const k = 'ov_' + id; M[k] = P + f + X; M[id] = M[k]; if (I[id]) I[id].icon = k; }
    for (const [id, f] of Object.entries(relics)) { const k = 'ov_' + id; M[k] = P + f + X; M[id] = M[k]; if (R[id]) R[id].icon = k; }
    const OIP = 'assets/icons_tiers_v14/items/', OX = '.png?v=2.0.0';
    for (const f of ['fragmento_', 'polvo_']) for (const fam of ['cobre','hierro','oro','plata','platino','titanio','adamantita','oricalco','coral','boreal','selvano','escoria','pirita','hueso','maldito']) M[f + fam] = OIP + f + fam + OX;
    ['armor_solar','helm_solar','boots_solar','shield_solar'].forEach(k => { M[k] = P + k + X; });
    M.helm_caldera = P + 'rel_corona_caldera' + X;
    M.helm_faraon = P + 'rel_nemes_faraon' + X;
    M.pantalones_abismal = P + 'pantalones_volcanico' + X;
    M.shield_eclipse = RAVEN_BASE + 'fb2150.png';
    Abyssea.EXTRA_SPRITE_PATHS = Abyssea.EXTRA_SPRITE_PATHS || {};
  })();

  // ===== USER CUSTOM TIERED SPRITES v1.4.0 (324 tools, armors & mini-chains) =====
  (function () {
    const TP = 'assets/icons_tiers_v14/tools/';
    const AP = 'assets/icons_tiers_v14/armor/';
    const EP = 'assets/icons_tiers_v14/extra/';
    const X = '.png?v=1.6.8';
    const TIER23 = [
      'basica','mejorada','cobre','hierro','plata','oro','platino','acero',
      'cristal','mitrilo','titanio','adamantita','oricalco','coral','boreal',
      'selvano','escoria','pirita','glaciar','maldito','legendaria','celestial','omega'
    ];
    const TM = Abyssea.TOOL_PNG_MAP = Abyssea.TOOL_PNG_MAP || {};
    ['espada','pico','hacha','pala','azada','guadana','arco','cana'].forEach((tool) => {
      TM[tool] = TM[tool] || {};
      TIER23.forEach((tier) => {
        TM[tool][tier] = TP + tool + '_' + tier + X;
      });
    });

    const M = Abyssea.ITEM_PNG_MAP = Abyssea.ITEM_PNG_MAP || {};
    const I = Abyssea.ITEMS || {};
    const bindItem = (id, url) => {
      const k = 'ov_' + id;
      M[k] = url;
      M[id] = url;
      if (I[id]) I[id].icon = k;
    };

    const armorIds = [
      // Helmets (T1-T23)
      'casco_cuero','casco_bronce','casco_cobre','casco_hierro','casco_plata','casco_oro',
      'casco_platino','casco_acero','casco_cristal','casco_mitrilo','casco_titanio','casco_adamantita',
      'casco_oricalco','casco_coral','casco_boreal','casco_selva','casco_caldera','casco_faraon',
      'casco_glaciar','casco_abismal','casco_abyssea','casco_solar','casco_omega',
      // Chestplates (T1-T23)
      'armadura_cuero','armadura_bronce','armadura_cobre','armadura_hierro','armadura_plata','armadura_oro',
      'armadura_platino','armadura_acero','armadura_cristal','armadura_mitrilo','armadura_titanio','armadura_adamantita',
      'armadura_oricalco','armadura_coral','armadura_boreal','armadura_selva','armadura_caldera','armadura_faraon',
      'armadura_glaciar','armadura_abismal','armadura_volcanica','armadura_celestial','armadura_omega',
      // Shields (T1-T23)
      'escudo_madera','escudo_bronce','escudo_cobre','escudo_hierro','escudo_plata','escudo_oro',
      'escudo_platino','escudo_acero','escudo_cristal','escudo_mitrilo','escudo_titanio','escudo_adamantita',
      'escudo_oricalco','escudo_coral','escudo_boreal','escudo_selva','escudo_caldera','escudo_faraon',
      'escudo_glaciar','escudo_eclipse','escudo_solar','escudo_celestial','escudo_omega',
      // Legs (T1-T23)
      'pantalones_cuero','pantalones_bronce','pantalones_cobre','pantalones_hierro','pantalones_plata','pantalones_oro',
      'pantalones_platino','pantalones_acero','pantalones_cristal','pantalones_mitrilo','pantalones_titanio','pantalones_adamantita',
      'pantalones_oricalco','pantalones_coral','pantalones_boreal','pantalones_selva','pantalones_caldera','pantalones_faraon',
      'pantalones_glaciar','pantalones_abismal','pantalones_volcanicos','pantalones_celestiales','pantalones_omega',
      // Boots (T1-T23)
      'botas_cuero','botas_bronce','botas_cobre','botas_hierro','botas_plata','botas_oro',
      'botas_platino','botas_acero','botas_cristal','botas_mitrilo','botas_titanio','botas_adamantita',
      'botas_oricalco','botas_coral','botas_boreal','botas_selva','botas_caldera','botas_faraon',
      'botas_glaciar','botas_abismal','botas_viento','botas_celestiales','botas_omega'
    ];
    armorIds.forEach((id) => bindItem(id, AP + id + X));
    // Custom 3D Navy & Gold Solar Greaves (T15 Solar Set)
    bindItem('botas_solar', AP + 'botas_solar' + X);

    const miniIds = [
      'mochila_cuero','mochila_reforzada','mochila_astral',
      'fertilizante','abono_dorado','compost_magico',
      'daga_hierro','daga_acero','daga_oro','daga_legendaria',
      'espadon_hierro','espadon_acero','espadon_oro','espadon_legendario',
      'maza_hierro','maza_acero','maza_legendaria','martillo_paladin',
      'varita_escarcha','varita_rubi','baculo_druida','baculo_lunar',
      'baculo_rubi','baculo_solaris','baculo_necro'
    ];
    miniIds.forEach((id) => bindItem(id, EP + id + X));

    const IP = 'assets/icons_tiers_v14/items/';
    const sheetItemIds = [
      // H1: Espadas, Hachas y Lanzas unicas
      'espada_llamarada','hoja_glacial','espada_solar_mitica','media_luna_abisal','espada_prismatica','katana_sakura',
      'hoja_espinas','espada_relampago','espada_tormenta','espada_hueso_rey','espada_coral','espada_boreal',
      'espada_selva','espada_caldera','espada_faraon','espada_eclipse','hoja_singularidad','hacha_batalla_hierro',
      'hacha_batalla_oro','hacha_batalla_legendaria','lanza_hierro','lanza_carmesi','alabarda_real','lanza_coral',
      // H2: Baculos, Arcos, Ballestas y Escudos especiales
      'varita_arcana','cetro_vacio','baculo_dorado','baculo_estelar','cetro_prism_vacio','cetro_omega',
      'baculo_coral','baculo_caldera','martillo_boreal','hacha_selva','guadana_pantano','daga_pantano',
      'guadana_necro','arco_coral','arco_selva','arco_fenix_abisal','arco_omega','ballesta_madera',
      'ballesta_legendaria','escudo_fenix','escudo_glacial','escudo_leon','escudo_abismal','escudo_esmeralda',
      // H3: Anillos, Amuletos y Sombreros
      'anillo_mercader','anillo_vampiro','anillo_platino','anillo_mitrilo','anillo_diamante','anillo_amatista',
      'anillo_alma','anillo_astral','anillo_rubi_real','anillo_esmeralda','amuleto_imantado','amuleto_vida',
      'amuleto_estelar','amuleto_onice','amuleto_diamante','amuleto_escarcha','colgante_fenix','collar_oseo',
      'talisman_meteoro','colgante_estrella','colgante_calavera','sombrero_mago','sombrero_hechicero','sombrero_bruja',
      // H4: Grimorios y Pergaminos
      'grimorio_misil_arcano','grimorio_bola_fuego','grimorio_nova_hielo','grimorio_cadena_rayos','grimorio_curacion_sagrada','grimorio_escudo_divino',
      'grimorio_paso_etereo','grimorio_furia_arcana','grimorio_espinas_tierra','grimorio_daga_veneno','grimorio_drenaje_mana','grimorio_lluvia_meteoros',
      'grimorio_lluvia_minerales','grimorio_llamado_horda','grimorio_llamado_fauna','pergamino_furia','pergamino_escudo','pergamino_rayo',
      'pergamino_fortuna','pergamino_curacion','pergamino_fuego','pergamino_hielo','pergamino_teletransporte','mapa_tesoro_item',
      // H5: Pociones, Elixires y Bombas
      'pocion_vida','pocion_velocidad','pocion_suerte','pocion_fuerza','elixir_titan','elixir_arcano',
      'pocion_nocturna','pocion_cosecha','elixir_supremo','elixir_fuego','elixir_escarcha','pocion_coralina',
      'pocion_selva','pocion_veneno_res','elixir_solar_real','elixir_eclipse','elixir_vida_supremo','elixir_mana_astral',
      'batido_nebula','bomba_mina','dinamita_tnt','bomba_escarcha','bomba_solar','bomba_abismal',
      // H6: Recursos y Menas brutas
      'madera','piedra','hierba','fibra_vegetal','carbon','hierro',
      'cobre','plata','oro','estano','platino','mitrilo_bruto',
      'titanio','adamantita','oricalco','cristales','cristales_magicos','obsidiana_bruta',
      'material_volcanico','azufre','salitre','coral_roca','cuarzo_boreal','escoria_caldera',
      // H7: Lingotes, Aleaciones y Placas
      'lingote_bronce','lingote_cobre','lingote_hierro','lingote_plata','lingote_oro','lingote_acero',
      'lingote_platino','lingotes_especiales','lingote_titanio','lingote_adamantita','lingote_oricalco','obsidiana_refinada',
      'aleacion_ignea','aleacion_celestial','lingote_celestial','lingote_omega','lingote_coral','placa_coral',
      'lingote_selvano','placa_selvano','lingote_boreal','placa_boreal','lingote_escoria','placa_escoria',
      // H8: Placas finales, Polvos, Esencias y Gemas 1
      'lingote_pirita','placa_pirita','lingote_hueso','placa_maldito','plata_maldita','lingote_maldito',
      'pirita_solar','hielo_eterno','hueso_fosil','esencia_oscura','esencia_corrupta','esencia_magma',
      'polvo_estelar','polvo_ceniza','polvo_carmesi','polvo_veneno','resina_antigua','resina_toxica',
      'diamantes','esmeraldas','rubi','zafiro','amatista','topacio',
      // H9: Gemas 2, Geodas y Runas
      'jade','gema_marina','perla','perla_turquesa','onice','gema_vacio',
      'gema_alma','prisma_imperial','bismuto_astral','cristal_carmesi','cristal_abismal','celestita_cristal',
      'azurita_glacial','agata_roja','ambar_desierto','geoda_amatista','geoda_dorada','geoda_esmeralda',
      'runa_fuego','runa_agua','runa_tierra','runa_aire','runa_oscura','runa_vida',
      // H10: Peces y Criaturas Marinas
      'pez_comun','pez_helado','pez_azul','pez_dorado','pez_payaso','anchoa',
      'pez_cirujano','pez_angel','lubina','bagre','trucha_arcoiris','carpa_dorada',
      'anguila','cangrejo','cangrejo_dungeness','cangrejo_dorado','camaron','pulpo',
      'pez_globo','medusa','pez_dorado_solar','pez_abismal','pez_lava','esturion_glacial',
      // H11: Peces Legendarios, Cebos, Tesoros y Llaves
      'anguila_sombras','pez_fenix_magma','pez_legendario_kraken','concha_marina','caracola_antigua','cofre_hundido',
      'botella_mensaje','bota_vieja','lata_oxidada','cebo_lombriz','cebo_gusano','cebo_dorado',
      'cebo_arcano','cebo_volcanico','llave_mazmorra','llave_dorada','llave_zafiro','llave_rubi',
      'llave_esqueleto','llave_jefe','llave_maestra_mazmorra','llave_legendaria','trofeo_goblin','trofeo_faraon',
      // H12: Drops de Monstruos y Trofeos
      'cuero','huesos','seda_arana','colmillo','cuerno_demonio','escamas_dragon',
      'esporas_toxicas','garra_sombras','nucleo_golem_puro','pluma_oscura','ectoplasma','craneo_maldito',
      'gel_azul','saco_veneno','diente_goblin','aguijon_escorpion','ala_murcielago','flor_pantano',
      'trofeo_exanime','trofeo_dragon_fuego','corazon_golem','nucleo_abyssea','pluma_fenix','huevo_dragon',
      // H13: Semillas y Cultivos crudos
      'semillas','semillas_tomate','semillas_papa','semillas_maiz','semillas_berenjena','semillas_chile',
      'semillas_fresa','semillas_uva','semillas_zanahoria','semillas_calabaza','semillas_cristal','trigo',
      'tomate','papa','maiz','berenjena','chile','zanahoria',
      'calabaza','cactus','bayas','fresa','uva','algas',
      // H14: Frutas e Ingredientes naturales
      'manzana_roja','manzana_verde','manzana_helada','manzana_dorada','platano','naranja',
      'pera','pina','durazno','granada','cereza','arandano',
      'kiwi','pitaya','sandia','aguacate','flor_cristal','hongo_luminoso',
      'bellota','madera_ferrea','malaquita_pradera','sanguinaria','cuarzo_lunar','arena_estelar',
      // H15: Granja, Panes y Platos salados
      'carne','huevo','leche','harina','miel','miel_ambar',
      'queso','cera_abeja','lana','pan','baguette','pan_maiz',
      'filete','muslo_asado','patatas_asadas','tortilla_patata','trucha_asada','pescado_brasa',
      'sashimi_glacial','sushi','cangrejo_asado','sopa_pescado','estofado_marino_supremo','estofado_bayas',
      // H16: Comidas especiales, Postres, Bebidas y Cosmicos
      'brocheta_magma','ensalada_fresca','taco_picante','sandwich_maestro','banquete_real','tarta_fresa',
      'pastel_fresa','pastel_miel','pastel_chocolate','cheesecake_real','waffle_dorado','macedonia_real',
      'jugo_uva','cafe_energizante','cafe_espresso','boba_matcha','boba_mango','boba_taro',
      'caliz_nebulosa_obj','nucleo_solar','runa_luz','runa_muerte','fragmentos_antiguos','singularidad',
      // H17: Materiales de base, Utilidades y Ropa unica
      'arena','arcilla','tablon','ladrillo','vidrio','tela',
      'tela_reforzada','cuerda','viga_madera','madera_refinada','engrane','polvora',
      'carbon_eterno','tinta_arcana','tablilla_runica','tuberias_conduit','materia_comprimida','reliquia_vacio',
      'cofre_logistico','flecha','corona_soberana','capa_sombras','capa_fenix','armadura_tela',
      // H18: Resto equipo/minerales y Bloques (solo icono de inventario)
      'armadura_paladin','yelmo_vikingo','marmol_oscuro','jade_ancestral','bloque_muro_piedra','bloque_muro_madera',
      'bloque_valla','bloque_camino_piedra','bloque_farola','bloque_brasero','bloque_estatua_caballero','bloque_fuente',
      'bloque_pilar_runico','bloque_estanteria','bloque_mesa_banquete','bloque_barril','bloque_banco','suelo_hierba',
      'bloque_camino_hierba','bloque_maceta_flores','bloque_puesto_mercado','bloque_cabana_aldeano','bloque_roble_milenario','bloque_brasero_magma',
      // EXTRA3: 3 items sueltos finales
      'esquirla_hielo','coral_brillante','escama_obsidiana'
    ];
    sheetItemIds.forEach((id) => bindItem(id, IP + id + X));

    // 73 placeable building / block / chest world sprites
    const BP = 'assets/icons_tiers_v14/buildings/';
    const EX = Abyssea.EXTRA_SPRITE_PATHS = Abyssea.EXTRA_SPRITE_PATHS || {};
    const buildingKeys = [
      'prop_stone_block','bld_muro_madera','prop_fence','prop_cobble','village_grass_turf','village_cobble_path',
      'village_planter_wood','village_stall','village_house_red','prop_lamppost','prop_fireplace','prop_angel',
      'prop_rune_pillar','bld_fuente_plaza','prop_bench','prop_ancient_oak','fire_brazier','giant_skeleton_1',
      'prop_banquet_table','prop_barrel','prop_bookshelf','chest_wood','chest_sapphire','chest_gold',
      'station_furnace','station_anvil','station_sawtable','bld_molino','bld_telar','station_blast_furnace',
      'station_alchemy','bld_cocina','bld_basurero','Campfire_Anim','Mesa_Artesania','bld_ahumador',
      'bld_cantera','bld_yunque_runico','Plot_Garden','bld_plantacion','Corral_Pen','bld_granja',
      'bld_aspersor','bld_invernadero','bld_colmena','bld_muelle_pesca','bld_jardin_mariposas',
      'Mercado_Stall','bld_banco','bld_casa_comercio','bld_tesoreria','bld_torre_magica','waypoint_white_strip',
      'altar_sun','altar_blood','bld_santuario','Tablon_Logros','bld_faro_costero','bld_observatorio_astral',
      'bld_torre_rayos','bld_laboratorio','station_library','bld_taller_mecanico','bld_centro_investigacion','station_enchant',
      'bld_mesa_hechiceria','bld_taladro','bld_recolector','Bridge_Tile','prop_pipe','prop_chest','bld_balista'
    ];
    const V15Q = '.png?v=2.0.3';
    buildingKeys.forEach((k) => { EX[k] = BP + k + V15Q; });
    EX.prop_pipe = 'assets/sprites_v2/pipe_conduit_icon.png?v=2.0.0-rc2px2';
    EX.pipe_conduit_sheet_20 = 'assets/sprites_v2/pipe_conduit_sheet_20.png?v=2.0.0-rc2px2';
    EX.pipe_conduit_icon = 'assets/sprites_v2/pipe_conduit_icon.png?v=2.0.0-rc2px2';
    EX.prop_well = 'assets/sprites_extra/stone_well.png?v=2.0.0-rc2px2';
    EX.station_well_health = 'assets/sprites_extra/station_well_health.png?v=2.0.0-rc2px2';
    EX.station_well_mana = 'assets/sprites_extra/station_well_mana.png?v=2.0.0-rc2px2';
    EX.well_health_strip = 'assets/sprites_extra/well_health_strip.png?v=2.0.0-rc2px2';
    if (Abyssea.ITEM_PNG_MAP) {
      Abyssea.ITEM_PNG_MAP.tuberias_conduit = 'assets/sprites_v2/pipe_conduit_icon.png?v=2.0.0-rc2px2';
      Abyssea.ITEM_PNG_MAP.bloque_fuente = 'assets/icons_tiers_v14/items/bloque_fuente.png?v=2.0.0-rc2px2';
      Abyssea.ITEM_PNG_MAP.bloque_estatua_caballero = 'assets/icons_tiers_v14/items/bloque_estatua_caballero.png?v=2.0.0-rc2px2';
      Abyssea.ITEM_PNG_MAP.prop_well = 'assets/sprites_extra/stone_well.png?v=2.0.0-rc2px2';
    }
    EX.ruin_pillar = BP + 'ruin_pillar' + V15Q;
    EX.corral_pen = BP + 'Corral_Pen' + V15Q;
    EX.garden_plot = BP + 'Plot_Garden' + V15Q;

    const CP = Abyssea.CHEST_SPRITE_PATHS = Abyssea.CHEST_SPRITE_PATHS || {};
    CP.wood_closed = BP + 'chest_wood' + V15Q;
    CP.wood_open = BP + 'chest_wood_open' + V15Q;
    CP.oak_closed = BP + 'chest_wood' + V15Q;
    CP.oak_open = BP + 'chest_wood_open' + V15Q;
    CP.sapphire_closed = BP + 'chest_sapphire' + V15Q;
    CP.sapphire_open = BP + 'chest_sapphire_open' + V15Q;
    CP.gold_closed = BP + 'chest_gold' + V15Q;
    CP.gold_open = BP + 'chest_gold_open' + V15Q;

    // 72 world resource nodes, crystals, meteors & biome props
    const NP = 'assets/icons_tiers_v14/nodes/';
    const nodeKeys = [
      'node_stone','node_coal','node_copper','node_tin','node_iron','node_silver','node_gold','node_platinum',
      'node_titanium','node_mithril','node_adamantite','node_orichalcum','node_obsidian','node_sulfur','node_pirita_solar','node_plata_maldita',
      'node_escoria_caldera','node_hueso_fosil','node_marmol_oscuro','node_boulder','node_forge_stone','node_keep_stone','node_volcanic_rock','cave_rock_big','meteor_dark',
      'node_jade','node_amethyst','node_bloodstone','node_malachite','node_star_sand','node_amber','node_magma_core','node_emerald',
      'node_diamond','node_ruby','node_sapphire','node_azurite','node_ice_crystal','node_abyssal_crystal','node_coral_abisal','node_perla_turquesa',
      'node_agata_roja','node_cuarzo_boreal','node_hielo_eterno','node_cristal_carmesi','node_bismuto_astral','node_celestita','node_jade_ancestral','meteor_red',
      'meteor_gold','meteor_blue','node_herb_patch','node_wild_crop','node_cactus','node_madera_ferrea','node_resina_toxica','node_flor_pantano',
      'cave_mushroom_orange','cave_mushroom_brown','mushroom_blue_anim','mushroom_green_anim','prop_palm_tree','prop_desert_ribs','prop_cactus_tall','prop_giant_jungle',
      'prop_giant_fungi','prop_snow_pine','prop_crystal_pillar','prop_swamp_altar','prop_obelisk_sand','prop_grave_angel','prop_cursed_eye','prop_burning_tree','dig_spot_x'
    ];
    nodeKeys.forEach((k) => { EX[k] = NP + k + V15Q; });
    EX.cactus_icon = NP + 'node_cactus' + V15Q;

    // 19 biome trees (de-haloed, 4-frame sway strips)
    const TRP = 'assets/icons_tiers_v14/trees/';
    const v14TreeIds = [
      'pradera_1','pradera_3',
      'desierto_1','desierto_2',
      'bosque_oscuro_1',
      'montanas_heladas_1','montanas_heladas_2',
      'tierras_volcanicas_1','tierras_volcanicas_2',
      'archipielago_coral_1','selva_esmeralda_1','cavernas_cristal_1',
      'caldera_ceniza_1','cienaga_putrida_1',
      'dinastia_arena_1','dinastia_arena_2',
      'glaciar_profundo_1','necropolis_osea_1','tierras_malditas_1'
    ];
    v14TreeIds.forEach((tid) => { EX['tree_v14_' + tid] = TRP + tid + '_4f.png?v=2.0.5'; });

    // v15 Unified Sprite Sets: Flora, Crops + Tilled Soil, Proportional Altars & Secrets, Animated Animals, Water Foam & Bridges
    const FP = 'assets/icons_tiers_v14/flora/';
    [
      'deco_berry_bush','deco_dark_bush','deco_bush_1','deco_fern_1','deco_pebble_1','deco_shroom_1','deco_thorn_bush',
      'deco_glow_shroom_b','deco_glow_shroom_g','deco_shroom_p','deco_shroom_r','nat_flower','nat_leaf','nat_mushroom',
      'undead_grave','undead_bones','undead_dead_arm','undead_crystal','undead_dead_tree',
      'butterfly_orange','butterfly_blue','butterfly_violet','butterfly_gold',
      'flora_desert_agave','flora_desert_grass','flora_coral_grass','flora_volcanic_grass',
      'flora_shadow_grass','flora_jungle_flowers','flora_frost_tuft'
    ].forEach((k) => {
      EX[k] = FP + k + V15Q;
    });
    const DGP = 'assets/icons_tiers_v14/dungeon/';
    EX.dungeon_stele = DGP + 'dungeon_stele' + V15Q;
    EX.dungeon_stele_lit = DGP + 'dungeon_stele_lit' + V15Q;
    EX.dungeon_exit_portal = DGP + 'dungeon_exit_portal' + V15Q;
    EX.dungeon_obelisk = DGP + 'dungeon_obelisk' + V15Q;
    EX.butterfly_icon = FP + 'butterfly_orange' + V15Q;
    EX.deco_shroom_2 = FP + 'deco_shroom_1' + V15Q;
    EX.deco_shroom_3 = FP + 'deco_shroom_1' + V15Q;
    EX.deco_fern_2 = FP + 'deco_fern_1' + V15Q;
    EX.deco_bush_2 = FP + 'deco_dark_bush' + V15Q;
    EX.village_fence = BP + 'prop_fence' + V15Q;

    const CRP = 'assets/icons_tiers_v14/crops/';
    EX.tilled_soil = CRP + 'tilled_soil' + V15Q;
    EX.tilled_soil_wet = CRP + 'tilled_soil_wet' + V15Q;
    EX.crop_stage_0 = CRP + 'crop_stage_0' + V15Q;
    EX.crop_stage_1 = CRP + 'crop_stage_1' + V15Q;
    EX.crop_stage_2 = CRP + 'crop_stage_2' + V15Q;
    ['trigo','zanahoria','tomate','papa','maiz','calabaza','berenjena','chile','fresa','uva','flor_cristal'].forEach((cid) => {
      EX[`crop_${cid}_s0`] = CRP + 'crop_stage_0' + V15Q;
      EX[`crop_${cid}_s1`] = CRP + 'crop_stage_1' + V15Q;
      EX[`crop_${cid}_s2`] = CRP + 'crop_stage_2' + V15Q;
      EX[`crop_${cid}_s3`] = CRP + `crop_${cid}_s3` + V15Q;
      EX[`crop_${cid}`] = EX[`crop_${cid}_s3`];
    });

    const ALP = 'assets/icons_tiers_v14/altars/';
    [
      'altar_fortuna','altar_furia','fuente_sagrada','altar_sabio','altar_sacrificio','altar_arcanista','altar_cazador','altar_stone',
      'ee_sword_rock','ee_caldero','ee_monolito','ee_arbol_cristal','ee_naufragio','ee_well','ee_fuente_mana','ee_altar_guardian','ee_throne'
    ].forEach((k) => { EX[k] = ALP + k + V15Q; });
    EX.altar_gold = EX.altar_fortuna;
    EX.altar_dark = EX.altar_furia;
    EX.healing_fountain = EX.fuente_sagrada;
    EX.altar_shrine = EX.altar_sabio;
    EX.altar_ritual = EX.altar_sacrificio;
    EX.altar_arcane = EX.altar_arcanista;
    EX.altar_emerald = EX.altar_cazador;
    EX.altar_volcano = EX.ee_altar_guardian;
    EX.ee_cauldron = EX.ee_caldero;
    EX.ee_crystal = EX.ee_arbol_cristal;
    EX.ee_device = EX.ee_monolito;
    EX.ee_treasure = EX.ee_naufragio;
    EX.well_mana_strip = EX.ee_fuente_mana;

    // Authentic cohesive 4-frame hand-pixelled farm animal strips (cow, sheep, pig, rabbit, duck)
    const ANP = 'assets/icons_tiers_v14/animals/';
    EX.cow_sheet = ANP + 'animal_cow_4f' + V15Q;
    EX.sheep_farm_sheet = ANP + 'animal_sheep_4f' + V15Q;
    EX.sheep_pf_sheet = EX.sheep_farm_sheet;
    EX.pig_sheet = ANP + 'animal_pig_4f' + V15Q;
    EX.rabbit_sheet = ANP + 'animal_rabbit_4f' + V15Q;
    EX.duck_sheet = ANP + 'animal_duck_4f' + V15Q;
    EX.animal_cow = EX.cow_sheet;
    EX.animal_pig = EX.pig_sheet;
    EX.animal_duck = EX.duck_sheet;

    const WP = 'assets/icons_tiers_v14/world/';
    EX.water_foam = WP + 'water_foam_4f' + V15Q;
    EX.bridge_h = WP + 'bridge_h' + V15Q;
    EX.bridge_v = WP + 'bridge_v' + V15Q;
    EX.bridge_h_mid = WP + 'bridge_h_mid' + V15Q;
    EX.bridge_h_l = WP + 'bridge_h_l' + V15Q;
    EX.bridge_h_r = WP + 'bridge_h_r' + V15Q;
    EX.bridge_v_mid = WP + 'bridge_v_mid' + V15Q;
    EX.bridge_v_t = WP + 'bridge_v_t' + V15Q;
    EX.bridge_v_b = WP + 'bridge_v_b' + V15Q;

    // 92 permanent relics
    const RP = 'assets/icons_tiers_v14/relics/';
    const RMap = Abyssea.PERMANENT_RELICS || {};
    const relicIds = [
      'linterna_flotante','brujula_estelar','corazon_umbrio','corona_escarcha','nucleo_volcanico','cetro_goblin','amuleto_arena','calavera_espectral',
      'grimorio_glaciar','ojo_abismo','grimorio_ranura_arcana','reloj_arena_eterno','corazon_carmesi_secreto','prisma_auroral_secreto','estrella_magnetica_secreta','sello_maestro_minero',
      'estandarte_fenix_secreto','luna_argentina_secreta','corona_fortunata_secreta','bastion_diamante_secreto','corona_rey_oseo','emblema_cazador_madri','baston_claro_pradera','flor_bosquecillo_ancestral',
      'astrolabio_oasis_perdido','caliz_catacumbas_arena','disco_solario_eterno','tomo_necromante_oscuro','vial_laboratorio_arcano','glandula_reina_aracnida','perla_pantano_putrido','vial_glaciar_puro',
      'arca_mina_profunda','sello_fortaleza_norte','cetro_solar_abismo','anillo_fragua_rubi','esfera_caldera_solar','idolo_trono_ceniza','esquirla_prisma_tierra','esfera_esmeralda_gaia',
      'nucleo_marea_astral','sello_cumbre_helada','amuleto_arrecife_coral','perla_sirena_azul','tridente_fosa_marina','escama_leviatan_coral','corona_emperatriz_mar','prisma_geoda_viva',
      'espejo_cuarzo_astral','diapason_amatista','lente_refraccion_pura','corazon_celestita_eterno','talisman_raices_antiguas','mascara_serpiente_jade','ambar_reina_esmeralda','pluma_quetzal_dorado',
      'semilla_corazon_selva','brasa_fumarola_oscura','escoria_crater_ardiente','yunque_basalto_rojo','colmillo_bestia_ceniza','corona_senor_caldera','ankh_dinastia_dorada','escarabajo_lapislazuli',
      'fragmento_obelisco_solar','balanza_juicio_eterno','cetro_sol_cenit','nemes_faraon_inmortal','esquirla_grieta_azul','reliquia_mamut_congelado','ojo_tormenta_polar','runa_coloso_escarcha',
      'caliz_hielo_inmaculado','corazon_cero_absoluto','fetiche_manglar_negro','hongo_bioluminiscente','matraz_cieno_alquimico','linterna_cosecha_maldita','totem_hidra_cienaga','ovulo_madre_putrida',
      'osario_marfil_maldito','sello_cripta_silenciosa','farol_almas_errantes','costilla_dragon_oseo','filacteria_archiliche','corona_soverano_huesos','caliz_sangre_maldita','corazon_abominacion_carnica',
      'crisol_almas_condenadas','efigie_rey_cosecha','ojo_abismo_singularity','corazon_eclipse_carmesi'
    ];
    relicIds.forEach((id) => {
      const k = 'ov_' + id;
      M[k] = RP + id + X;
      M[id] = M[k];
      if (RMap[id]) RMap[id].icon = k;
    });

    // Custom animated enemies v1.6.1 HD (2x Scale2x -> 128x128 per frame x 6 frames)
    const EPPaths = Abyssea.ENEMY_SPRITE_PATHS = Abyssea.ENEMY_SPRITE_PATHS || {};
    const ENP = 'assets/icons_tiers_v14/enemies/';
    EPPaths.zombie = { path: ENP + 'zombie_walk_6f.png?v=1.6.8', kind: 'strip', fw: 128, fh: 128, frames: 6, scale: 0.39 };
    const enemyScales = {
      slime:0.65, golden_slime:0.66, skeleton:0.78, scorpion:0.72,
      sand_ghoul:0.80, cobra:0.75, bat:0.68, vampire_bat:0.74,
      wisp:0.65, ghost:0.74, spider:0.75, mushroom_mob:0.72,
      goblin:0.76, goblin_tnt:0.80, wolf:0.90, shadow_wolf:0.94,
      golem:0.98, rock_golem:0.98, magma:1.02, cultist:0.80,
      fire_elem:0.82, rat:0.64, rat_giant:0.86, beetle:0.68,
      beetle_fire:0.70, imp:0.72, orc:0.92, mimic:0.76,
      mushroom_purple:0.72, skeleton_archer:0.78, skeleton_mage:0.80, goblin_shaman:0.80,
      floating_eye:0.72, cave_spider:0.75, slime_toxic:0.68, grave_revenant:0.82,
      royal_scarab:0.74, toxic_hound:0.90, ghastly_eye:0.74, brittle_archer:0.78,
      lava_ant:0.75, acid_ant:0.75, tunneling_mole:0.82, plague_bat:0.72,
      goblin_archer:0.76, ghost_spectral:0.76, slime_blue:0.65, slime_red:0.66,
      vine_snake:0.76, wisp_green:0.65, skel_swordsman:0.80, skel_mage_dark:0.82,
      skel_crossbow:0.78, skel_spearman:0.80, flaming_skull:0.74, dark_lancer:0.86,
      goblin_barrel:0.78, goblin_sapper:0.80, goblin_raider:0.80, crimson_jelly:0.68,
      frost_jelly:0.68, void_jelly:0.70, enemy_biter_red:0.76, enemy_bomb_black:0.72,
      enemy_bat_horned:0.76, enemy_dragon_whelp:0.84, enemy_fire_slime:0.68, enemy_ember_bat:0.76,
      enemy_dark_bat:0.76, enemy_coral_crab:0.76, enemy_coral_cobra:0.76, enemy_selva_spider:0.78,
      enemy_selva_plant:0.82, enemy_pantano_slime:0.68, enemy_pantano_shroom:0.74, enemy_cristal_eye:0.76,
      enemy_glaciar_whelp:0.86, enemy_necro_skull:0.76, enemy_abismo_wisp:0.70, enemy_abismo_goblin:0.82
    };
    Object.entries(enemyScales).forEach(([id, sc]) => {
      EPPaths[id] = { path: ENP + id + '_6f.png?v=1.6.8', kind: 'strip', fw: 128, fh: 128, frames: 6, scale: Number((sc * 0.5).toFixed(4)) };
    });

    // Custom animated bosses v1.6.1 HD (2x Scale2x -> 192x192 per frame x 6 frames)
    const BPPaths = Abyssea.BOSS_SPRITE_PATHS = Abyssea.BOSS_SPRITE_PATHS || {};
    const BSP = 'assets/icons_tiers_v14/bosses/';
    const bossScales = {
      pradera:1.10, pradera_profunda:1.20, pradera_madriguera:1.12, pradera_baston:1.22,
      pradera_bosquecillo:1.25, desierto:1.22, desierto_piramide:1.24, desierto_oasis:1.20,
      desierto_catacumbas:1.25, desierto_solario:1.28, bosque_oscuro:1.22, bosque_necro:1.25,
      bosque_laboratorio:1.26, bosque_arana:1.30, bosque_pantano:1.32, montanas_heladas:1.28,
      montanas_glaciar:1.26, montanas_mina:1.26, montanas_fortaleza:1.28, montanas_cumbre:1.26,
      tierras_volcanicas:1.30, volcan_abismo:1.32, volcan_fragua:1.28, volcan_caldera:1.34,
      volcan_trono_ceniza:1.36, coral_arrecife:1.28, coral_perla:1.22, coral_abismo:1.30,
      coral_bastion:1.34, coral_trono:1.36, cristal_geoda:1.28, cristal_espejo:1.22,
      cristal_camara:1.32, cristal_nexo:1.34, cristal_corazon:1.36, selva_raices:1.32,
      selva_piramide:1.30, selva_colmena:1.28, selva_dosel:1.32, selva_corazon:1.36,
      caldera_fumarola:1.30, caldera_crater:1.24, caldera_fundicion:1.32, caldera_bestia:1.36,
      caldera_senor:1.38, dinastia_tumbas:1.34, dinastia_escarabajo:1.28, dinastia_obelisco:1.34,
      dinastia_camara:1.30, dinastia_sol:1.36, dinastia_faraon:1.38, glaciar_grieta:1.32,
      glaciar_vestigios:1.34, glaciar_ojo:1.26, glaciar_coloso:1.38, glaciar_sancta:1.38,
      glaciar_abismo:1.40, pantano_raices:1.32, pantano_esporas:1.34, pantano_cieno:1.30,
      pantano_calabaza:1.32, pantano_bastion:1.38, pantano_madre:1.40, necro_osario:1.38,
      necro_cripta:1.34, necro_catacumba:1.26, necro_foso:1.34, necro_torre:1.40,
      necro_trono:1.42, maldita_sangre:1.28, maldita_carne:1.38, maldita_forja:1.38,
      maldita_calabaza:1.36, maldita_abismo:1.44
    };
    // All 74 dungeon bosses use crisp 256x256 x 6-frame HD locomotion strips (1536x256)
    Object.entries(bossScales).forEach(([id, sc]) => {
      BPPaths[id] = { path: BSP + id + '_6f.png?v=2.0.2', fw: 256, fh: 256, frames: 6, scale: Number((sc * 0.375).toFixed(4)) };
    });
    // Final Boss #75: authentic 8-row multi-animation pixel-art sheet (Guard, Charge, 8f Run, Scarlet Aura, 14f Whirlwind, 7f Dash Slash, Blink, 9f Death)
    BPPaths.eclipse_carmesi = { path: 'assets/sprites_v13/bosses/boss_espadachin_carmesi_full.png', fw: 128, fh: 64, cols: 14, rows: 8, frames: 7, multiRow: true, scale: 2.45, anchorX: 29, anchorY: 50 };
  })();

  if (ROOT) {
    [Abyssea.UI_URLS, Abyssea.NPC_PORTRAIT_URLS, Abyssea.ITEM_PNG_MAP, Abyssea.BUFF_ICON_URLS].forEach(map => {
      if (!map) return;
      Object.keys(map).forEach(k => {
        map[k] = withRoot(map[k]);
      });
    });
  }

  assets.deferReady = true;
  const origLoadAll = assets.loadAll.bind(assets);
  assets.loadAll = async function () {
    const [ok] = await Promise.all([origLoadAll(), assets.loadExtraAssets()]);
    assets.buildBiomeCaches();
    assets.ready = true;
    return ok;
  };

  // Safe DOM icon helper using real transparent PNG assets (zero dataURL taint!).
  assets.createItemIconEl = function (iconType, size = 28) {
    const rawKey = typeof iconType === 'string' ? iconType.replace(/^ov_/, '') : iconType;
    const itDef = (Abyssea.ITEMS && (Abyssea.ITEMS[iconType] || Abyssea.ITEMS[rawKey])) || null;
    const targetKey = (itDef && itDef.icon) || iconType;
    const url = Abyssea.ITEM_PNG_MAP[iconType]
      || Abyssea.ITEM_PNG_MAP[targetKey]
      || Abyssea.ITEM_PNG_MAP[rawKey]
      || (itDef && itDef.icon && Abyssea.ITEM_PNG_MAP[itDef.icon]);
    if (url) {
      const img = document.createElement('img');
      img.src = encodeURI(withRoot(url));
      img.width = size;
      img.height = size;
      img.alt = (itDef && itDef.name) || rawKey || 'item';
      img.className = 'pixel-img';
      img.style.width = size + 'px';
      img.style.height = size + 'px';
      img.draggable = false;
      const swapToFallback = () => {
        try {
          const fallbackCanvas = origGetItemIconCanvas(rawKey) || assets.getItemIconCanvas(rawKey);
          if (fallbackCanvas && img.parentNode) {
            const copy = document.createElement('canvas');
            copy.width = fallbackCanvas.width || 32;
            copy.height = fallbackCanvas.height || 32;
            copy.style.width = size + 'px';
            copy.style.height = size + 'px';
            copy.className = 'pixel-img';
            const ctx = copy.getContext('2d');
            ctx.drawImage(fallbackCanvas, 0, 0);
            img.parentNode.replaceChild(copy, img);
          }
        } catch (_) {}
      };
      img.onerror = swapToFallback;
      return img;
    }
    const c = origGetItemIconCanvas(rawKey) || assets.getItemIconCanvas(rawKey);
    const copy = document.createElement('canvas');
    copy.width = c.width || 32;
    copy.height = c.height || 32;
    copy.style.width = size + 'px';
    copy.style.height = size + 'px';
    copy.className = 'pixel-img';
    copy.getContext('2d').drawImage(c, 0, 0);
    return copy;
  };

  assets.createToolIconEl = function (toolId, tierId = 'basica', size = 28) {
    const tierMap = Abyssea.TOOL_PNG_MAP[toolId];
    const url = tierMap && ((tierId === 'basica' || !tierId) ? tierMap.basica : tierMap[tierId]);
    if (url) {
      const img = document.createElement('img');
      img.src = encodeURI(withRoot(url));
      img.width = size;
      img.height = size;
      img.alt = toolId;
      img.className = 'pixel-img';
      img.style.width = size + 'px';
      img.style.height = size + 'px';
      img.draggable = false;
      if (tierId === 'legendaria') {
        img.style.filter = 'drop-shadow(0 0 3px rgba(255, 145, 0, 0.85))';
      } else if (tierId === 'celestial') {
        img.style.filter = 'drop-shadow(0 0 4px rgba(79, 195, 247, 0.9))';
      } else if (tierId === 'omega') {
        img.style.filter = 'drop-shadow(0 0 4px rgba(255, 68, 68, 0.72))';
      }
      return img;
    }
    const c = assets.getToolIconCanvas(toolId, tierId || 'basica');
    const copy = document.createElement('canvas');
    copy.width = c.width;
    copy.height = c.height;
    copy.style.width = size + 'px';
    copy.style.height = size + 'px';
    copy.className = 'pixel-img';
    if (tierId === 'omega') {
      copy.style.filter = 'drop-shadow(0 0 5px rgba(224, 64, 251, 0.95)) brightness(1.12)';
    } else if (tierId === 'maldito' || tierId === 'glaciar' || tierId === 'pirita' || tierId === 'escoria') {
      const glowMap = {
        escoria: 'rgba(255, 109, 0, 0.75)',
        pirita:  'rgba(255, 213, 79, 0.75)',
        glaciar: 'rgba(79, 195, 247, 0.8)',
        maldito: 'rgba(186, 104, 200, 0.85)'
      };
      copy.style.filter = `drop-shadow(0 0 3px ${glowMap[tierId]})`;
    }
    copy.getContext('2d').drawImage(c, 0, 0);
    return copy;
  };

  assets.createSkillIconEl = function (skillId, size = 32) {
    const sk = Abyssea.SKILLS && Abyssea.SKILLS[skillId];
    let url = null;
    if (sk && sk.grantSpell && Abyssea.SKILL_ICON_URLS[skillId]) {
      url = Abyssea.SKILL_ICON_URLS[skillId];
    } else {
      url = Abyssea.SKILL_ICON_URLS[skillId];
      if (!url && sk) {
        if (sk.icon && Abyssea.ITEM_PNG_MAP[sk.icon]) {
          url = Abyssea.ITEM_PNG_MAP[sk.icon];
        } else if (sk.icon && Abyssea.SKILL_EXTRA_ICONS && Abyssea.SKILL_EXTRA_ICONS[sk.icon]) {
          url = Abyssea.SKILL_EXTRA_ICONS[sk.icon];
        } else {
          let h = 0;
          for (let i = 0; i < skillId.length; i++) h = (h * 31 + skillId.charCodeAt(i)) >>> 0;
          const pool = Abyssea.SKILL_ICON_POOL || Object.values(Abyssea.SKILL_ICON_URLS);
          url = pool[h % pool.length];
        }
      }
    }
    if (url) {
      const img = document.createElement('img');
      img.src = encodeURI(withRoot(url));
      img.width = size;
      img.height = size;
      img.alt = skillId;
      img.className = 'pixel-img';
      img.style.width = size + 'px';
      img.style.height = size + 'px';
      img.draggable = false;
      return img;
    }
    return document.createElement('span');
  };

  assets.createNpcPortraitEl = function (npcId, size = 48) {
    const url = Abyssea.NPC_PORTRAIT_URLS[npcId];
    const img = document.createElement('img');
    img.src = encodeURI(url ? withRoot(url) : Abyssea.UI_URLS.avatarHero);
    img.width = size;
    img.height = size;
    img.alt = npcId;
    img.className = 'pixel-img portrait-img';
    img.style.width = size + 'px';
    img.style.height = size + 'px';
    img.draggable = false;
    return img;
  };

  assets._spriteThumbCache = {};
  assets._spriteThumbCanvasCache = {};

  assets.cropImageCanvas = function (cacheKey, img, sx = 0, sy = 0, sw = 0, sh = 0, size = 36) {
    if (!img || !img.complete || !(img.naturalWidth > 0 || img.width > 0)) return null;
    if (assets._spriteThumbCanvasCache[cacheKey]) return assets._spriteThumbCanvasCache[cacheKey];
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    const w = Math.max(1, Math.min(iw - sx, sw || iw));
    const h = Math.max(1, Math.min(ih - sy, sh || ih));
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const aspect = w / Math.max(1, h);
    let dw = size - 2;
    let dh = dw / aspect;
    if (dh > size - 2) { dh = size - 2; dw = dh * aspect; }
    ctx.drawImage(img, sx, sy, w, h, Math.round((size - dw) / 2), Math.round((size - dh) / 2), Math.round(dw), Math.round(dh));
    assets._spriteThumbCanvasCache[cacheKey] = c;
    return c;
  };

  assets.cropImageUrl = function (cacheKey, img, sx = 0, sy = 0, sw = 0, sh = 0, size = 36) {
    if (Object.prototype.hasOwnProperty.call(assets._spriteThumbCache, cacheKey)) {
      return assets._spriteThumbCache[cacheKey] || null;
    }
    const c = assets.cropImageCanvas(cacheKey, img, sx, sy, sw, sh, size);
    if (!c) return null;
    // Guard toDataURL against tainted-canvas SecurityError when opened directly via file://
    try {
      const url = c.toDataURL('image/png');
      assets._spriteThumbCache[cacheKey] = url;
      return url;
    } catch (_) {
      assets._spriteThumbCache[cacheKey] = '';
      return null;
    }
  };

  function resolveThumbCrop(spec = {}) {
    if (!spec) return null;
    const ex = assets.extraImages || {};
    const ok = (im) => !!(im && (im.tagName === 'CANVAS' ? im.width > 0 : (im.complete && im.naturalWidth > 0)));
    const kind = spec.kind;

    if (kind === 'enemy') {
      if (spec.isBoss) {
        const bKey = String(spec.enemyType || '').replace(/^boss_/, '');
        const bMeta = Abyssea.BOSS_SPRITE_PATHS && Abyssea.BOSS_SPRITE_PATHS[bKey];
        const bImg = assets.bossImages && assets.bossImages[bKey];
        if (bMeta && ok(bImg)) {
          return { key: `boss:${bKey}`, img: bImg, sx: bMeta.sx || 0, sy: bMeta.sy || 0, sw: bMeta.sw || bMeta.fw, sh: bMeta.sh || bMeta.fh, size: 36 };
        }
      }
      const eType = spec.enemyType;
      const meta = Abyssea.ENEMY_SPRITE_PATHS && Abyssea.ENEMY_SPRITE_PATHS[eType];
      const eImg = assets.enemyImages && assets.enemyImages[eType];
      if (meta && ok(eImg)) {
        return { key: `enemy:${eType}`, img: eImg, sx: 0, sy: 0, sw: meta.fw || 32, sh: meta.fh || 32, size: 36 };
      }
      if (spec.sprite) {
        const sImg = assets.get(spec.sprite);
        if (ok(sImg)) {
          const fw = sImg.width > sImg.height ? sImg.height : sImg.width;
          return { key: `espr:${spec.sprite}`, img: sImg, sx: 0, sy: 0, sw: fw, sh: sImg.height, size: 36 };
        }
      }
      const fallbackUrl = Abyssea.ITEM_PNG_MAP && Abyssea.ITEM_PNG_MAP.espada_hierro;
      return fallbackUrl ? { url: encodeURI(withRoot(fallbackUrl)) } : null;
    }

    if (kind === 'animal') {
      const aKind = spec.animalKind || 'sheep';
      const cropAnim = (key, im) => {
        const is4f = im.width >= im.height * 3.5;
        return {
          key, img: im, sx: 0, sy: 0,
          sw: is4f ? Math.round(im.width / 4) : (Math.round(im.width / 3) || 32),
          sh: is4f ? im.height : (Math.round(im.height / 2) || 32),
          size: 36
        };
      };
      if (aKind === 'sheep') {
        const sh = ex.sheep_farm_sheet || assets.get('sheep_move') || assets.get('sheep_idle');
        if (ok(sh)) return cropAnim('animal:sheep', sh);
      } else if (aKind === 'vaca' && ok(ex.cow_sheet)) {
        return cropAnim('animal:vaca', ex.cow_sheet);
      } else if (aKind === 'cerdo' && ok(ex.pig_sheet)) {
        return cropAnim('animal:cerdo', ex.pig_sheet);
      } else if (aKind === 'conejo' && ok(ex.rabbit_sheet)) {
        return cropAnim('animal:conejo', ex.rabbit_sheet);
      } else if (aKind === 'pato') {
        if (ok(ex.duck_sheet)) return cropAnim('animal:pato_s', ex.duck_sheet);
        if (ok(ex.rubber_duck)) return { key: 'animal:pato_r', img: ex.rubber_duck, sx: 0, sy: 0, sw: 32, sh: 32, size: 36 };
      }
      const lanaUrl = Abyssea.ITEM_PNG_MAP && (Abyssea.ITEM_PNG_MAP.wool || Abyssea.ITEM_PNG_MAP.lana);
      return lanaUrl ? { url: encodeURI(withRoot(lanaUrl)) } : null;
    }

    if (kind === 'npc') {
      const nUrl = Abyssea.NPC_PORTRAIT_URLS && Abyssea.NPC_PORTRAIT_URLS[spec.npcId];
      if (nUrl) return { url: encodeURI(withRoot(nUrl)) };
      const sheet = assets.npcSheets && assets.npcSheets[spec.npcId];
      if (ok(sheet)) {
        const is4f = sheet.width >= sheet.height * 3.5;
        return {
          key: `npc:${spec.npcId}`, img: sheet, sx: 0, sy: 0,
          sw: is4f ? Math.round(sheet.width / 4) : (Math.round(sheet.width / 6) || 16),
          sh: is4f ? sheet.height : (Math.round(sheet.height / 4) || 32),
          size: 36
        };
      }
      return { url: encodeURI(withRoot(Abyssea.UI_URLS.avatarHero)) };
    }

    if (kind === 'building') {
      const bDef = Abyssea.BUILDINGS && Abyssea.BUILDINGS[spec.buildingType];
      if (bDef) {
        if (bDef.sprite === 'Campfire_Anim') {
          const cf = ex.Campfire_Anim || ex.campfireAnim;
          if (ok(cf)) {
            const fw = cf.width >= cf.height * 3 ? (Math.round(cf.width / 6) || cf.height) : 16;
            return { key: 'bld:campfire', img: cf, sx: 0, sy: 0, sw: fw, sh: cf.height, size: 36 };
          }
        }
        if (bDef.sprite === 'Bridge_Tile') {
          const brImg = ex.Bridge_Tile || assets.getBuildingImg('Bridge_Tile') || assets.get('bridge');
          if (ok(brImg)) return { key: 'bld:bridge_tile', img: brImg, sx: 0, sy: 0, sw: brImg.width, sh: brImg.height, size: 36 };
        }
        const extraMap = { Corral_Pen: 'corral_pen', Fish_Pond: 'fish_pond', Plot_Garden: 'garden_plot' };
        const bImg = assets.getBuildingImg(bDef.sprite) || (extraMap[bDef.sprite] ? ex[extraMap[bDef.sprite]] : ex[bDef.sprite]);
        if (ok(bImg)) {
          const fw = (bDef.sprite === 'well_health_strip' && bImg.width === 192 && bImg.height === 64) ? 32
            : ((bImg.width === 64 && bImg.height === 32) ? 16
            : (bImg.width >= bImg.height * 2.5 ? bImg.height : bImg.width));
          return { key: `bld:${spec.buildingType}`, img: bImg, sx: 0, sy: 0, sw: fw, sh: bImg.height, size: 36 };
        }
        if (bDef.opensPanel === 'market') return { url: encodeURI(withRoot(Abyssea.UI_URLS.iconCoin || Abyssea.ITEM_PNG_MAP.oro || 'assets/ui/coin_gold.png')) };
      }
      return null;
    }

    if (kind === 'gate') {
      const gImg = assets.gateImages && assets.gateImages[spec.dungeonId];
      if (ok(gImg)) return { key: `gate:${spec.dungeonId}`, img: gImg, sx: 0, sy: 0, sw: gImg.width, sh: gImg.height, size: 36 };
      return null;
    }

    if (kind === 'altar') {
      const aDef = Abyssea.ALTAR_DEFS && Abyssea.ALTAR_DEFS[spec.altarId];
      const aImg = (aDef && ex[aDef.spriteKey]) || ex.altar_shrine;
      if (ok(aImg)) {
        const fw = aImg.width >= aImg.height * 2.5 ? aImg.height : aImg.width;
        return { key: `altar:${spec.altarId}`, img: aImg, sx: 0, sy: 0, sw: fw, sh: aImg.height, size: 36 };
      }
      return null;
    }

    if (kind === 'easter_egg') {
      const eDef = Abyssea.EASTER_EGG_DEFS && Abyssea.EASTER_EGG_DEFS[spec.eeId];
      const eImg = eDef && (ex[eDef.spriteKey] || ex[eDef.baseSprite]);
      if (ok(eImg)) {
        const fw = (eImg.width === 64 && eImg.height === 32) ? 16
          : (eImg.width >= eImg.height * 2.5 ? eImg.height : eImg.width);
        return { key: `ee:${spec.eeId}`, img: eImg, sx: 0, sy: 0, sw: fw, sh: eImg.height, size: 36 };
      }
      return null;
    }

    if (kind === 'chest') {
      const ch = assets.chestImages && (assets.chestImages.gold_closed || assets.chestImages.oak_closed);
      if (ok(ch)) return { key: 'node:chest', img: ch, sx: 0, sy: 0, sw: ch.width, sh: ch.height, size: 36 };
    }
    if (kind === 'secret_chest') {
      const ch = assets.chestImages && (assets.chestImages.sapphire_closed || assets.chestImages.gold_closed);
      if (ok(ch)) return { key: 'node:secret_chest', img: ch, sx: 0, sy: 0, sw: ch.width, sh: ch.height, size: 36 };
    }
    if (kind === 'puzzle_pillar' && ok(ex.prop_rune_pillar)) {
      return { key: 'node:puzzle_pillar', img: ex.prop_rune_pillar, sx: 0, sy: 0, sw: ex.prop_rune_pillar.width, sh: ex.prop_rune_pillar.height, size: 36 };
    }
    if (kind === 'bone_totem' && ok(ex.bone_totem || ex.prop_skull_pillar)) {
      const im = ex.bone_totem || ex.prop_skull_pillar;
      return { key: 'node:bone_totem', img: im, sx: 0, sy: 0, sw: im.width, sh: im.height, size: 36 };
    }
    if (kind === 'skeleton_king_shrine' && ok(ex.giant_skeleton_1)) {
      return { key: 'node:sk_shrine', img: ex.giant_skeleton_1, sx: 0, sy: 0, sw: ex.giant_skeleton_1.width, sh: ex.giant_skeleton_1.height, size: 36 };
    }
    return null;
  }

  assets.getSpriteThumbUrl = function (spec = {}) {
    const info = resolveThumbCrop(spec);
    if (!info) return null;
    if (info.url) return info.url;
    return assets.cropImageUrl(info.key, info.img, info.sx, info.sy, info.sw, info.sh, info.size);
  };

  assets.getSpriteThumbCanvas = function (spec = {}) {
    const info = resolveThumbCrop(spec);
    if (!info || !info.img) return null;
    return assets.cropImageCanvas(info.key, info.img, info.sx, info.sy, info.sw, info.sh, info.size);
  };
})();
