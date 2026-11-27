(function () {
  'use strict';

  const Abyssea = (window.Abyssea = window.Abyssea || {});
  const { TILE_SIZE } = Abyssea.CONST;
  const { randInt, pick, clamp } = Abyssea.Utils;

  const CROPS = {
    trigo: {
      id: 'trigo', name: 'Trigo Dorado', seedId: 'semillas', growTime: 40,
      yieldId: 'trigo', minQty: 2, maxQty: 4, seedDrop: 1, xp: 6, color: '#f9d74a', sprite: 'crop_trigo'
    },
    zanahoria: {
      id: 'zanahoria', name: 'Zanahoria Dulce', seedId: 'semillas_zanahoria', growTime: 48,
      yieldId: 'zanahoria', minQty: 2, maxQty: 3, seedDrop: 1, xp: 10, color: '#ff7043', sprite: 'crop_zanahoria'
    },
    tomate: {
      id: 'tomate', name: 'Tomate Jugoso', seedId: 'semillas_tomate', growTime: 54,
      yieldId: 'tomate', minQty: 2, maxQty: 4, seedDrop: 1, xp: 12, color: '#ef5350', sprite: 'crop_tomate'
    },
    papa: {
      id: 'papa', name: 'Patata Dorada', seedId: 'semillas_papa', growTime: 58,
      yieldId: 'papa', minQty: 2, maxQty: 4, seedDrop: 1, xp: 13, color: '#d7a86e', sprite: 'crop_papa'
    },
    maiz: {
      id: 'maiz', name: 'Maíz Dorado', seedId: 'semillas_maiz', growTime: 64,
      yieldId: 'maiz', minQty: 2, maxQty: 4, seedDrop: 1, xp: 14, color: '#ffd54f', sprite: 'crop_maiz'
    },
    calabaza: {
      id: 'calabaza', name: 'Calabaza Real', seedId: 'semillas_calabaza', growTime: 70,
      yieldId: 'calabaza', minQty: 1, maxQty: 2, seedDrop: 1, xp: 16, color: '#fb8c00', sprite: 'crop_calabaza'
    },
    berenjena: {
      id: 'berenjena', name: 'Berenjena Morada', seedId: 'semillas_berenjena', growTime: 74,
      yieldId: 'berenjena', minQty: 2, maxQty: 3, seedDrop: 1, xp: 18, color: '#ab47bc', sprite: 'crop_berenjena'
    },
    chile: {
      id: 'chile', name: 'Chile Ígneo', seedId: 'semillas_chile', growTime: 80,
      yieldId: 'chile', minQty: 2, maxQty: 4, seedDrop: 1, xp: 20, color: '#e53935', sprite: 'crop_chile'
    },
    fresa: {
      id: 'fresa', name: 'Fresa Real', seedId: 'semillas_fresa', growTime: 88,
      yieldId: 'fresa', minQty: 2, maxQty: 3, seedDrop: 1, xp: 24, color: '#ec407a', sprite: 'crop_fresa'
    },
    uva: {
      id: 'uva', name: 'Vid Arcana', seedId: 'semillas_uva', growTime: 96,
      yieldId: 'uva', minQty: 2, maxQty: 3, seedDrop: 1, xp: 28, color: '#7e57c2', sprite: 'crop_uva'
    },
    flor_cristal: {
      id: 'flor_cristal', name: 'Flor de Cristal', seedId: 'semillas_cristal', growTime: 105,
      yieldId: 'flor_cristal', minQty: 1, maxQty: 2, seedDrop: 1, xp: 34, color: '#80deea', sprite: 'crop_flor_cristal'
    }
  };

  class FarmingAndFishing {
    constructor() {
      // Multi-phase interactive fishing state:
      // { active, phase: 'cast'|'wait'|'bite'|'reel', timer, maxTimer, startX, startY, wx, wy,
      //   biome, spotNode, baitId, targetFish, barPos, barSize, barVel, fishPos, fishVel,
      //   fishTarget, fishTimer, progress, rippleT, shadows }
      this.fishing = null;
      this.lastUntilledWarnAt = 0;
    }

    tillTile(game, tx, ty) {
      if (!game.world.isTileUnlocked(tx, ty)) return false;
      if (!game.world.tiles[ty] || game.world.tiles[ty][tx] !== 1) return false;
      if (game.world.getNodeAtTile(tx, ty)) return false;
      if (game.getBuildingAtTile(tx, ty)) return false;
      game.world.tiles[ty][tx] = 2; // tilled soil
      game.stats.tilesTilled = (game.stats.tilesTilled || 0) + 1;
      Abyssea.Audio.play('dig');
      game.spawnParticles((tx + 0.5) * TILE_SIZE, (ty + 0.5) * TILE_SIZE, '#8d6e63', 7);
      // Occasional earthy find when tilling virgin soil
      if (Math.random() < 0.14) {
        const find = Math.random() < 0.65 ? 'cebo_gusano' : 'semillas_papa';
        if (Abyssea.ITEMS[find]) {
          game.spawnDrop((tx + 0.5) * TILE_SIZE, (ty + 0.5) * TILE_SIZE, find, 1);
        }
      }
      return true;
    }

    tillArea(game, tx, ty, tierId = 'basica') {
      const idx = (Abyssea.TOOL_TIERS || []).indexOf(tierId);
      const offsets = idx >= 4
        ? [[-1,-1],[0,-1],[1,-1],[-1,0],[0,0],[1,0],[-1,1],[0,1],[1,1]]
        : idx >= 3
          ? [[0,0],[1,0]]
          : [[0,0]];
      let tilled = 0;
      let watered = 0;
      for (const [ox, oy] of offsets) {
        const cx = tx + ox;
        const cy = ty + oy;
        if (this.tillTile(game, cx, cy)) tilled++;
        else if (this.waterTile(game, cx, cy)) watered++;
      }
      if (tilled > 0) {
        game.addFloatingText((tx + 0.5) * TILE_SIZE, ty * TILE_SIZE, tilled > 1 ? `Tierra arada x${tilled}` : 'Tierra arada', '#d7ccc8');
      } else if (watered > 0) {
        game.addFloatingText((tx + 0.5) * TILE_SIZE, ty * TILE_SIZE, 'Cultivo regado', '#4fc3f7');
      }
      return tilled > 0 || watered > 0;
    }

    plantSeed(game, tx, ty, seedItemId) {
      const item = Abyssea.ITEMS[seedItemId];
      if (!item || !item.plantCrop) return false;
      if ((game.inventory[seedItemId] || 0) < 1) return false;
      if (!game.world.isTileUnlocked(tx, ty)) return false;
      const t = game.world.tiles[ty] && game.world.tiles[ty][tx];
      if (game.world.getNodeAtTile(tx, ty) || game.getBuildingAtTile(tx, ty)) return false;
      if (game.world.crops.some(c => c.tx === tx && c.ty === ty)) return false;

      // Strict agricultural progression: soil MUST be tilled with Azada first!
      if (t !== 2) {
        const now = performance.now();
        if (now - this.lastUntilledWarnAt > 900) {
          this.lastUntilledWarnAt = now;
          const T = (k, v) => (Abyssea.I18n ? Abyssea.I18n.t(k, v) : k);
          const msg = !game.toolTiers.azada
            ? T('farm.needHoeCraft')
            : T('farm.needHoeUse');
          game.addFloatingText((tx + 0.5) * TILE_SIZE, ty * TILE_SIZE, msg, '#ffcc80');
          game.toast(msg, 'warn');
          Abyssea.Audio.play('error');
        }
        return false;
      }

      game.removeItem(seedItemId, 1);
      const fertKey = `${tx},${ty}`;
      const preFert = (game.world.fertilizedTiles && game.world.fertilizedTiles[fertKey]) || null;
      if (preFert && game.world.fertilizedTiles) delete game.world.fertilizedTiles[fertKey];
      const initProg = preFert ? Math.min(0.65, (preFert.boost || 0) * 0.35) : 0;
      game.world.crops.push({
        tx, ty,
        cropId: item.plantCrop,
        progress: initProg,
        stage: initProg >= 0.65 ? 2 : initProg >= 0.3 ? 1 : 0,
        watered: Boolean(preFert),
        fertilized: preFert ? preFert.id : null,
        yieldBonus: preFert ? (preFert.yieldBonus || 0) : 0,
        qualityBonus: preFert ? (preFert.qualityBonus || 0) : 0
      });
      Abyssea.Audio.play('pickup');
      if (game.triggerPlayerAction) game.triggerPlayerAction('hana_planting', 0.28, (tx + 0.5) * TILE_SIZE, (ty + 0.5) * TILE_SIZE);
      game.spawnParticles((tx + 0.5) * TILE_SIZE, (ty + 0.5) * TILE_SIZE, '#a5d6a7', 5);
      game.addFloatingText((tx + 0.5) * TILE_SIZE, ty * TILE_SIZE, Abyssea.I18n ? Abyssea.I18n.t('farm.planted') : 'Plantado', '#a5d6a7');
      return true;
    }

    fertilizeTile(game, tx, ty, preferredId = null) {
      const T = (k) => (Abyssea.I18n ? Abyssea.I18n.t(k) : k);
      const FERTILIZER_EFFECTS = {
        compost_magico: { boost: 0.92, yieldBonus: 3, qualityBonus: 0.55, color: '#ce93d8', label: T('farm.fertMagic') },
        abono_dorado:   { boost: 0.70, yieldBonus: 2, qualityBonus: 0.35, color: '#ffd54f', label: T('farm.fertGold') },
        fertilizante:   { boost: 0.48, yieldBonus: 1, qualityBonus: 0.15, color: '#aed581', label: T('farm.fertOrganic') }
      };
      let fertId = null;
      if (preferredId && FERTILIZER_EFFECTS[preferredId] && (game.inventory[preferredId] || 0) >= 1) {
        fertId = preferredId;
      } else {
        for (const cand of ['compost_magico', 'abono_dorado', 'fertilizante']) {
          if ((game.inventory[cand] || 0) >= 1) { fertId = cand; break; }
        }
      }
      if (!fertId) return false;
      const eff = FERTILIZER_EFFECTS[fertId];
      const crop = game.world.crops.find(c => c.tx === tx && c.ty === ty);
      if (crop) {
        if (crop.fertilized || crop.stage >= 3) return false;
        game.removeItem(fertId, 1);
        crop.progress = Math.min(1, crop.progress + eff.boost);
        crop.watered = true;
        crop.fertilized = fertId;
        crop.yieldBonus = Math.max(crop.yieldBonus || 0, eff.yieldBonus);
        crop.qualityBonus = Math.max(crop.qualityBonus || 0, eff.qualityBonus);
        crop.stage = crop.progress >= 1 ? 3 : crop.progress >= 0.65 ? 2 : crop.progress >= 0.3 ? 1 : 0;
        Abyssea.Audio.play('cast');
        if (game.triggerPlayerAction) game.triggerPlayerAction('hana_planting', 0.28, (tx + 0.5) * TILE_SIZE, (ty + 0.5) * TILE_SIZE);
        game.spawnParticles((tx + 0.5) * TILE_SIZE, (ty + 0.5) * TILE_SIZE, eff.color, 12);
        game.addFloatingText((tx + 0.5) * TILE_SIZE, ty * TILE_SIZE, eff.label, eff.color);
        return true;
      }
      // Allow pre-fertilizing empty tilled soil (tile === 2) before planting!
      if (!game.world.isTileUnlocked(tx, ty) || game.world.tiles[ty]?.[tx] !== 2) return false;
      if (!game.world.fertilizedTiles) game.world.fertilizedTiles = {};
      const key = `${tx},${ty}`;
      if (game.world.fertilizedTiles[key] && game.world.fertilizedTiles[key].id === fertId) return false;
      game.removeItem(fertId, 1);
      game.world.fertilizedTiles[key] = { id: fertId, boost: eff.boost, yieldBonus: eff.yieldBonus, qualityBonus: eff.qualityBonus };
      Abyssea.Audio.play('cast');
      if (game.triggerPlayerAction) game.triggerPlayerAction('hana_planting', 0.28, (tx + 0.5) * TILE_SIZE, (ty + 0.5) * TILE_SIZE);
      game.spawnParticles((tx + 0.5) * TILE_SIZE, (ty + 0.5) * TILE_SIZE, eff.color, 10);
      game.addFloatingText((tx + 0.5) * TILE_SIZE, ty * TILE_SIZE, eff.label, eff.color);
      return true;
    }

    waterTile(game, tx, ty) {
      const crop = game.world.crops.find(c => c.tx === tx && c.ty === ty);
      if (!crop || crop.watered) return false;
      crop.watered = true;
      Abyssea.Audio.play('cast');
      if (game.triggerPlayerAction) game.triggerPlayerAction('hana_watering', 0.36, (tx + 0.5) * TILE_SIZE, (ty + 0.5) * TILE_SIZE);
      game.spawnParticles((tx + 0.5) * TILE_SIZE, (ty + 0.5) * TILE_SIZE, '#4fc3f7', 8);
      return true;
    }

    harvestCrop(game, tx, ty) {
      const idx = game.world.crops.findIndex(c => c.tx === tx && c.ty === ty);
      if (idx < 0) return false;
      const crop = game.world.crops[idx];
      const def = CROPS[crop.cropId];
      if (!def || crop.stage < 3) return false;

      game.world.crops.splice(idx, 1);
      const azEnch = game.getToolEnchantBonuses ? game.getToolEnchantBonuses('azada') : null;
      const guEnch = game.getToolEnchantBonuses ? game.getToolEnchantBonuses('guadana') : null;
      const harvestBonus = Math.max(azEnch ? (azEnch.harvestBonus || 0) : 0, guEnch ? (guEnch.harvestBonus || 0) : 0) + (game.mods.harvestBonus || 0);
      const cropDoubleChance = Math.max(azEnch ? (azEnch.doubleChance || 0) : 0, guEnch ? (guEnch.doubleChance || 0) : 0);
      let qty = randInt(def.minQty, def.maxQty) + (game.mods.extraDrop || 0) + harvestBonus + (crop.yieldBonus || 0);
      if (cropDoubleChance > 0 && Math.random() < cropDoubleChance) qty *= 2;
      if ((crop.qualityBonus || 0) > 0 && Math.random() < crop.qualityBonus) qty += 1;
      game.addItem(def.yieldId, qty);
      if (Math.random() < 0.8 + (crop.qualityBonus || 0) * 0.25) {
        game.addItem(def.seedId, def.seedDrop + ((crop.qualityBonus || 0) >= 0.5 && Math.random() < 0.45 ? 1 : 0));
      }
      if (crop.cropId === 'trigo' && (crop.qualityBonus || 0) >= 0.35 && Math.random() < 0.25) {
        game.addItem('trigo_dorado', 1);
      }
      game.gainXp(def.xp);
      game.stats.cropsHarvested++;
      Abyssea.Audio.play('pickup');
      if (game.triggerPlayerAction) game.triggerPlayerAction('hana_pick_up', 0.26, (tx + 0.5) * TILE_SIZE, (ty + 0.5) * TILE_SIZE);
      game.spawnParticles((tx + 0.5) * TILE_SIZE, (ty + 0.5) * TILE_SIZE, def.color, 10);
      return true;
    }

    updateCrops(dt, game) {
      const crops = game.world && game.world.crops;
      if (!crops || crops.length === 0) return;

      const mills = [];
      const plantations = [];
      const boosters = [];
      for (let bi = 0; bi < game.buildings.length; bi++) {
        const b = game.buildings[bi];
        if (b.type === 'molino') mills.push(b);
        else if (b.type === 'plantacion') plantations.push(b);
        const def = Abyssea.BUILDINGS[b.type];
        if (def && def.cropBoost) boosters.push(b);
      }
      const modCropSpeed = 1 + (game.mods.cropSpeed || 0);

      for (let i = crops.length - 1; i >= 0; i--) {
        const c = crops[i];
        if (c.progress >= 1 && c.stage >= 3) continue;
        const def = CROPS[c.cropId];
        if (!def) continue;

        const cx = (c.tx + 0.5) * TILE_SIZE;
        const cy = (c.ty + 0.5) * TILE_SIZE;

        if (!c.watered && plantations.length > 0) {
          for (let pi = 0; pi < plantations.length; pi++) {
            const p = plantations[pi];
            const pDef = Abyssea.BUILDINGS[p.type];
            const pCx = p.tx + ((pDef && pDef.size) || 1) * 0.5;
            const pCy = p.ty + ((pDef && pDef.size) || 1) * 0.5;
            if (Math.abs((c.tx + 0.5) - pCx) <= 4.5 && Math.abs((c.ty + 0.5) - pCy) <= 4.5) {
              c.watered = true;
              break;
            }
          }
        }

        let speedMult = c.watered ? 1.9 : 0.72; // Watering nearly triples speed compared to dry soil!
        for (let mi = 0; mi < mills.length; mi++) {
          const m = mills[mi];
          const mDef = Abyssea.BUILDINGS[m.type];
          const mCx = m.tx + ((mDef && mDef.size) || 1) * 0.5;
          const mCy = m.ty + ((mDef && mDef.size) || 1) * 0.5;
          if (Math.abs((c.tx + 0.5) - mCx) <= 6.5 && Math.abs((c.ty + 0.5) - mCy) <= 6.5) {
            speedMult += (mDef && mDef.auraCropSpeed) || 0.30;
            break;
          }
        }
        for (let bi = 0; bi < boosters.length; bi++) {
          const br = boosters[bi];
          const defB = Abyssea.BUILDINGS[br.type];
          const r = (defB.autoWaterRadius || 220) * (1 + (br.level - 1) * 0.2);
          const bx = (br.tx + (defB.size || 1) * 0.5) * TILE_SIZE;
          const by = (br.ty + (defB.size || 1) * 0.5) * TILE_SIZE;
          const dx = bx - cx;
          const dy = by - cy;
          if (dx * dx + dy * dy <= r * r) {
            speedMult += defB.cropBoost;
          }
        }

        c.progress = Math.min(1, c.progress + (dt * speedMult * modCropSpeed) / def.growTime);
        c.stage = c.progress >= 1 ? 3 : c.progress >= 0.65 ? 2 : c.progress >= 0.3 ? 1 : 0;
      }
    }

    rollTargetFish(biome, luck, baitId, tierIdx) {
      const roll = Math.random();
      const baitMult = baitId === 'cebo_arcano' ? 3.2
        : baitId === 'cebo_volcanico' ? 2.6
        : baitId === 'cebo_dorado' ? 2.1
        : baitId === 'cebo_gusano' ? 1.35
        : baitId === 'cebo_lombriz' ? 1.22 : 1.0;
      // Multiplicative rarity boost keeps every rare tier proportional without collapsing negative rolls onto index 0
      const rareMult = 1 + Math.min(3.5, Math.max(0, luck || 0) * 0.75 + Math.max(0, baitMult - 1) * 0.95);
      const rareScore = roll / rareMult;

      if (rareScore < 0.008) return { id: 'raya_singularidad', diff: 0.96, xp: 165 };
      if (rareScore < 0.016) return { id: 'pez_legendario_kraken', diff: 0.95, xp: 120 };
      if (rareScore < 0.026) return { id: 'leviatan_esmeralda', diff: 0.92, xp: 115 };
      if (rareScore < 0.036) return { id: 'celacanto_ancestral', diff: 0.88, xp: 100 };
      if (rareScore < 0.048) return { id: 'koi_solar_mitico', diff: 0.86, xp: 95 };
      if (rareScore < 0.064) return { id: 'tiburon_cristal', diff: 0.78, xp: 75 };
      if (rareScore < 0.080) return { id: 'mantarraya_celestial', diff: 0.75, xp: 70 };
      if (rareScore < 0.095) return { id: 'cofre_hundido', diff: 0.84, xp: 55 };
      if (rareScore < 0.115) return { id: 'perla', diff: 0.78, xp: 48 };
      if (rareScore < 0.14) return { id: 'gema_marina', diff: 0.76, xp: 44 };
      if (rareScore < 0.17) return { id: 'cangrejo_dorado', diff: 0.70, xp: 40 };
      if (rareScore < 0.20) return { id: 'mapa_tesoro_item', diff: 0.68, xp: 38 };
      if (rareScore < 0.24) return { id: 'pulpo', diff: 0.72, xp: 38 };
      if (rareScore < 0.28) return { id: 'carpa_dorada', diff: 0.66, xp: 34 };
      if (rareScore < 0.32) return { id: 'pez_dorado', diff: 0.64, xp: 30 };

      if ((biome === 'tierras_volcanicas' || biome === 'caldera_ceniza') && (tierIdx >= 3 || Math.random() < 0.62 || baitId === 'cebo_volcanico')) {
        return pick([
          { id: 'pez_fenix_magma', diff: 0.82, xp: 52 },
          { id: 'pez_lava', diff: 0.66, xp: 32 },
          { id: 'anguila', diff: 0.60, xp: 26 },
          { id: 'pez_globo', diff: 0.58, xp: 24 }
        ]);
      }
      if (biome === 'archipielago_coral') {
        return pick([
          { id: 'mantarraya_celestial', diff: 0.72, xp: 58 },
          { id: 'pez_angel', diff: 0.46, xp: 24 },
          { id: 'pez_payaso', diff: 0.40, xp: 20 },
          { id: 'pez_cirujano', diff: 0.44, xp: 22 },
          { id: 'pulpo', diff: 0.62, xp: 34 },
          { id: 'perla', diff: 0.70, xp: 42 },
          { id: 'concha_marina', diff: 0.34, xp: 18 }
        ]);
      }
      if (biome === 'cavernas_cristal' || biome === 'glaciar_profundo' || biome === 'montanas_heladas') {
        return pick([
          { id: 'tiburon_cristal', diff: 0.76, xp: 64 },
          { id: 'esturion_glacial', diff: 0.72, xp: 42 },
          { id: 'pez_helado', diff: 0.52, xp: 25 },
          { id: 'trucha_arcoiris', diff: 0.44, xp: 20 },
          { id: 'medusa', diff: 0.50, xp: 22 },
          { id: 'pez_azul', diff: 0.40, xp: 16 }
        ]);
      }
      if (biome === 'selva_esmeralda' || biome === 'cienaga_putrida') {
        return pick([
          { id: 'leviatan_esmeralda', diff: 0.86, xp: 88 },
          { id: 'bagre', diff: 0.46, xp: 24 },
          { id: 'anguila', diff: 0.54, xp: 26 },
          { id: 'carpa_dorada', diff: 0.62, xp: 34 },
          { id: 'pez_globo', diff: 0.54, xp: 24 },
          { id: 'algas', diff: 0.22, xp: 10 }
        ]);
      }
      if (biome === 'bosque_oscuro' || biome === 'necropolis_osea' || biome === 'tierras_malditas') {
        return pick([
          { id: 'celacanto_ancestral', diff: 0.84, xp: 85 },
          { id: 'anguila_sombras', diff: 0.74, xp: 46 },
          { id: 'pez_abismal', diff: 0.58, xp: 30 },
          { id: 'bagre', diff: 0.44, xp: 20 },
          { id: 'medusa', diff: 0.48, xp: 22 },
          { id: 'algas', diff: 0.20, xp: 9 }
        ]);
      }
      if (biome === 'desierto' || biome === 'dinastia_arena') {
        return pick([
          { id: 'koi_solar_mitico', diff: 0.82, xp: 80 },
          { id: 'pez_dorado_solar', diff: 0.65, xp: 38 },
          { id: 'pez_cirujano', diff: 0.44, xp: 20 },
          { id: 'pez_payaso', diff: 0.42, xp: 18 },
          { id: 'cangrejo_dorado', diff: 0.64, xp: 36 },
          { id: 'caracola_antigua', diff: 0.58, xp: 24 },
          { id: 'concha_marina', diff: 0.34, xp: 18 }
        ]);
      }
      return pick([
        { id: 'pez_dorado_solar', diff: 0.65, xp: 35 },
        { id: 'algas', diff: 0.18, xp: 8 },
        { id: 'anchoa', diff: 0.25, xp: 12 },
        { id: 'lubina', diff: 0.30, xp: 14 },
        { id: 'pez_comun', diff: 0.28, xp: 12 },
        { id: 'pez_angel', diff: 0.44, xp: 20 },
        { id: 'pez_azul', diff: 0.34, xp: 15 },
        { id: 'camaron', diff: 0.26, xp: 12 },
        { id: 'cangrejo_dungeness', diff: 0.36, xp: 16 },
        { id: 'pez_payaso', diff: 0.40, xp: 17 },
        { id: 'concha_marina', diff: 0.34, xp: 18 },
        { id: 'botella_mensaje', diff: 0.46, xp: 24 }
      ]);
    }

    startFishing(game, wx, wy, spotNode = null) {
      // Handle clicks inside existing fishing state WITHOUT ever insta-catching!
      if (this.fishing) {
        const f = this.fishing;
        if (f.phase === 'cast') {
          return; // Ignore clicks mid-cast animation
        }
        if (f.phase === 'wait') {
          this.fishing = null;
          game.addFloatingText(game.player.x, game.player.y - 24, 'Recogiste muy pronto', '#cfd8dc');
          return;
        }
        if (f.phase === 'bite') {
          // Transition from bite alert to Fish Hunters timing minigame!
          this.beginReeling(game);
          return;
        }
        if (f.phase === 'reel') {
          this.strikeFishingZone(game);
          return;
        }
      }

      const tier = Abyssea.getToolStats('cana', game.toolTiers.cana);
      const tierIdx = tier ? tier.tierIndex : 0;
      const lighthouseLuck = game.buildings.some(b => {
        const d = Abyssea.BUILDINGS[b.type];
        return d && d.auraLuck && Abyssea.Utils.dist((b.tx + 0.5) * TILE_SIZE, (b.ty + 0.5) * TILE_SIZE, wx, wy) <= 320;
      }) ? 0.16 : 0;
      const luck = (game.mods.luckBonus || 0) + (tier ? tier.rareBonus : 0) + lighthouseLuck;

      let baitId = null;
      if ((game.inventory.cebo_arcano || 0) > 0) baitId = 'cebo_arcano';
      else if ((game.inventory.cebo_volcanico || 0) > 0) baitId = 'cebo_volcanico';
      else if ((game.inventory.cebo_dorado || 0) > 0) baitId = 'cebo_dorado';
      else if ((game.inventory.cebo_gusano || 0) > 0) baitId = 'cebo_gusano';
      else if ((game.inventory.cebo_lombriz || 0) > 0) baitId = 'cebo_lombriz';

      const baitSpeed = baitId === 'cebo_arcano' ? 0.52
        : baitId === 'cebo_volcanico' ? 0.58
        : baitId === 'cebo_dorado' ? 0.65
        : baitId === 'cebo_gusano' ? 0.80
        : baitId === 'cebo_lombriz' ? 0.86 : 1.0;
      const lunarFishBonus = (typeof game.getLunarFishingLuckBonus === 'function') ? game.getLunarFishingLuckBonus() : 0;
      const nearWhirlpool = (typeof game.getWhirlpoolNear === 'function') ? game.getWhirlpoolNear(wx, wy, 130) : null;
      const effectiveLuck = luck + lunarFishBonus + (nearWhirlpool ? 0.85 : 0);
      const baseWait = (2.6 - Math.min(1.1, tierIdx * 0.2)) * baitSpeed * (nearWhirlpool ? 0.72 : 1.0);
      const waitTime = Math.max(1.0, baseWait + Math.random() * 1.1);
      const biome = game.world.getBiomeAtPixel(wx, wy);
      const targetFish = nearWhirlpool && Math.random() < 0.72
        ? pick([
            { id: 'mantarraya_celestial', diff: 0.74, xp: 75 },
            { id: 'tiburon_cristal', diff: 0.78, xp: 80 },
            { id: 'celacanto_ancestral', diff: 0.84, xp: 105 },
            { id: 'koi_solar_mitico', diff: 0.84, xp: 100 },
            { id: 'leviatan_esmeralda', diff: 0.88, xp: 120 },
            { id: 'raya_singularidad', diff: 0.90, xp: 155 },
            { id: 'cofre_hundido', diff: 0.78, xp: 70 }
          ])
        : this.rollTargetFish(biome, effectiveLuck, baitId, tierIdx);
      const diff = targetFish ? targetFish.diff : 0.35;
      // Rarity/difficulty sharply narrows the green skill zone
      const zoneWidth = clamp(0.32 - diff * 0.25 + tierIdx * 0.008 + (game.mods.fishWindow || 0) * 0.5, 0.075, 0.34);

      // Generate ambient pixel-art fish swimming around the bobber while waiting
      const targetFishId = targetFish ? targetFish.id : 'pez_comun';
      const shadows = [
        {
          id: targetFishId,
          isTarget: true,
          ang: Math.random() * Math.PI * 2,
          dist: 32 + Math.random() * 10,
          speed: (Math.random() < 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.3),
          depth: 0.65,
          wiggle: Math.random() * Math.PI * 2,
          wiggleSpeed: 9 + Math.random() * 3,
          size: 1.15,
          fleeing: false,
          x: wx,
          y: wy
        }
      ];
      const ambPool = nearWhirlpool
        ? ['mantarraya_celestial', 'tiburon_cristal', 'koi_solar_mitico', 'pez_dorado', 'pez_payaso']
        : ['anchoa', 'pez_azul', 'pez_comun', 'pez_payaso'];
      const extraFishCount = nearWhirlpool ? 3 : (1 + (Math.random() < 0.45 ? 1 : 0));
      for (let k = 0; k < extraFishCount; k++) {
        shadows.push({
          id: pick(ambPool),
          isTarget: false,
          ang: Math.random() * Math.PI * 2,
          dist: 24 + Math.random() * 16,
          speed: (Math.random() < 0.5 ? 1 : -1) * (0.55 + Math.random() * 0.35),
          depth: nearWhirlpool ? 0.45 : 0.78,
          wiggle: Math.random() * Math.PI * 2,
          wiggleSpeed: 7 + Math.random() * 3,
          size: nearWhirlpool ? 0.96 : 0.82,
          fleeing: false,
          x: wx,
          y: wy
        });
      }

      this.fishing = {
        active: true,
        phase: 'cast',
        timer: 0.38,
        maxTimer: 0.38,
        waitDuration: waitTime,
        startX: game.player.x,
        startY: game.player.y - 12,
        bobX: game.player.x,
        bobY: game.player.y - 12,
        wx, wy,
        biome,
        spotNode,
        inWhirlpool: Boolean(nearWhirlpool),
        baitId,
        luck: effectiveLuck,
        targetFish,
        zoneWidth,
        zoneStart: 0.34,
        cursorPos: 0.12,
        cursorDir: 1,
        cursorSpeed: 1.05 + diff * 0.85,
        hitsDone: 0,
        hitsReq: diff >= 0.64 ? 3 : diff >= 0.44 ? 2 : 1,
        mistakes: 0,
        maxMistakes: 3,
        missFlash: 0,
        hitFlash: 0,
        progress: 0,
        rippleT: 0,
        shadows
      };
      if (game.updatePlayerDirectionFromVector) {
        game.updatePlayerDirectionFromVector(wx - game.player.x, wy - game.player.y);
      }
      Abyssea.Audio.play('cast');
    }

    beginReeling(game) {
      const f = this.fishing;
      if (!f || f.phase !== 'bite') return;
      const diff = f.targetFish ? f.targetFish.diff : 0.35;
      f.phase = 'reel';
      f.timer = 18.0; // max fail-safe duration
      f.zoneStart = clamp(0.16 + Math.random() * (0.76 - f.zoneWidth), 0.08, 0.88 - f.zoneWidth);
      f.cursorPos = f.zoneStart > 0.45 ? 0.06 : 0.94;
      f.cursorDir = f.cursorPos < 0.5 ? 1 : -1;
      f.cursorSpeed = 1.05 + diff * 0.82;
      f.hitsDone = 0;
      f.mistakes = 0;
      f.progress = 0;
      Abyssea.Audio.play('bite');
      if (game.spawnParticles) game.spawnParticles(f.wx, f.wy, '#80deea', 10);
      if (game.spawnFx) game.spawnFx('water_splash_fx', f.wx, f.wy, 0, 0.35, 0.28, 0.9);
      game.addFloatingText(f.wx, f.wy - 28, Abyssea.I18n ? Abyssea.I18n.t('fish.hooked') : '¡Enganchado! Pulsa Click, [E] o Espacio en lo verde', '#80deea');
    }

    strikeFishingZone(game) {
      const f = this.fishing;
      if (!f || f.phase !== 'reel') return false;
      const inZone = f.cursorPos >= (f.zoneStart - 0.018) && f.cursorPos <= (f.zoneStart + f.zoneWidth + 0.018);
      if (inZone) {
        f.hitsDone++;
        f.progress = clamp(f.hitsDone / f.hitsReq, 0, 1);
        f.hitFlash = 0.25;
        Abyssea.Audio.play('bite');
        game.spawnParticles(f.wx, f.wy, '#66bb6a', 10);
        if (game.spawnFx) game.spawnFx('water_splash_fx', f.wx, f.wy, 0, 0.30, 0.24, 0.85);
        if (f.hitsDone >= f.hitsReq) {
          this.completeCatch(game);
          return true;
        }
        // Relocate green target zone cleanly for multi-hit rarer fish
        f.zoneStart = clamp(0.10 + Math.random() * (0.80 - f.zoneWidth), 0.08, 0.90 - f.zoneWidth);
        f.cursorSpeed *= 1.08;
        game.addFloatingText(f.wx, f.wy - 24, Abyssea.I18n ? Abyssea.I18n.t('fish.pull', { cur: f.hitsDone, req: f.hitsReq }) : `¡Tirón ${f.hitsDone}/${f.hitsReq}!`, '#a5e6a1');
        return true;
      }
      f.mistakes++;
      f.missFlash = 0.28;
      Abyssea.Audio.play('error');
      game.addFloatingText(f.wx, f.wy - 24, Abyssea.I18n ? Abyssea.I18n.t('fish.miss', { cur: f.mistakes, max: f.maxMistakes }) : `¡Falló! (${f.mistakes}/${f.maxMistakes})`, '#ef9a9a');
      if (f.mistakes >= f.maxMistakes) {
        if (game.spawnParticles) game.spawnParticles(f.wx, f.wy, '#ef5350', 8);
        if (game.spawnFx) game.spawnFx('water_splash_fx', f.wx, f.wy, 0, 0.36, 0.30, 0.9);
        this.fishing = null;
        game.toast(Abyssea.I18n ? Abyssea.I18n.t('fish.lineSnapped') : 'El pez rompió el sedal tras fallar el momento.', 'warn');
      }
      return false;
    }

    updateFishing(dt, game) {
      const f = this.fishing;
      if (!f) return;

      f.rippleT += dt;
      if (Abyssea.Utils.dist(game.player.x, game.player.y, f.wx, f.wy) > 240) {
        this.fishing = null;
        return;
      }

      // Update natural fish swim movements & tail wiggle
      if (f.shadows) {
        for (const s of f.shadows) {
          s.wiggle = (s.wiggle || 0) + dt * (s.wiggleSpeed || 8);
          if (s.fleeing) {
            s.dist += dt * 44;
            s.depth = Math.min(1, (s.depth || 0.6) + dt * 0.45);
            s.ang += s.speed * dt * 0.5;
          } else if (f.phase === 'cast') {
            s.ang += s.speed * dt * 0.7;
          } else if (f.phase === 'wait') {
            if (s.isTarget) {
              if (f.timer <= 1.35) {
                // Target fish spots the bait and approaches the bobber
                s.ang += s.speed * dt * 0.45;
                s.dist = Math.max(3, s.dist - dt * 20);
                s.depth = Math.max(0.12, (s.depth || 0.65) - dt * 0.45);
              } else {
                s.ang += s.speed * dt;
                s.dist = Math.max(16, s.dist - dt * 3.5);
              }
            } else {
              s.ang += s.speed * dt;
            }
          } else if (f.phase === 'bite') {
            if (s.isTarget) {
              // Target fish strikes and tugs on the hook
              s.dist = Math.max(2, Math.min(6, s.dist + Math.sin(f.rippleT * 18) * 3));
              s.ang += Math.sin(f.rippleT * 22) * dt * 4;
              s.depth = 0.08;
            } else {
              s.fleeing = true;
            }
          } else if (f.phase === 'reel') {
            if (s.isTarget) {
              // Hooked fish thrashes in water struggling against the rod
              s.dist = 5 + Math.sin(f.rippleT * 14) * 6;
              s.ang += s.speed * dt * 2.2 + Math.sin(f.rippleT * 12) * dt * 3;
              s.depth = 0.10;
            } else {
              s.fleeing = true;
            }
          }
          // Compute Cartesian coordinates around lure
          s.x = f.wx + Math.cos(s.ang) * s.dist;
          s.y = f.wy + Math.sin(s.ang) * (s.dist * 0.62);
        }
      }

      if (f.phase === 'cast') {
        f.timer -= dt;
        const p = clamp(1 - f.timer / Math.max(0.01, f.maxTimer), 0, 1);
        const arc = Math.sin(p * Math.PI) * 34;
        f.bobX = f.startX + (f.wx - f.startX) * p;
        f.bobY = f.startY + (f.wy - f.startY) * p - arc;
        if (f.timer <= 0) {
          f.phase = 'wait';
          f.bobX = f.wx;
          f.bobY = f.wy;
          f.timer = f.waitDuration;
          game.spawnParticles(f.wx, f.wy, '#81d4fa', 10);
          if (game.spawnFx) game.spawnFx('water_splash_fx', f.wx, f.wy, 0, 0.32, 0.22, 0.85);
        }
        return;
      }

      if (f.phase === 'wait') {
        f.timer -= dt;
        if (f.timer <= 0) {
          f.phase = 'bite';
          f.timer = 2.0;
          Abyssea.Audio.play('bite');
          game.spawnParticles(f.wx, f.wy, '#81d4fa', 12);
          game.spawnParticles(f.wx, f.wy, '#ffd54f', 8);
          if (game.spawnFx) game.spawnFx('water_splash_fx', f.wx, f.wy, 0, 0.38, 0.32, 0.95);
          game.addFloatingText(f.wx, f.wy - 22, Abyssea.I18n ? Abyssea.I18n.t('fish.bite') : '¡PICA! ¡Click o Espacio!', '#ffd54f');
        }
        return;
      }

      if (f.phase === 'bite') {
        f.timer -= dt;
        if (f.timer <= 0) {
          if (game.spawnParticles) game.spawnParticles(f.wx, f.wy, '#81d4fa', 10);
          if (game.spawnFx) game.spawnFx('water_splash_fx', f.wx, f.wy, 0, 0.38, 0.30, 0.9);
          this.fishing = null;
          game.addFloatingText(game.player.x, game.player.y - 24, Abyssea.I18n ? Abyssea.I18n.t('fish.escaped') : 'Escapó el pez...', '#ef9a9a');
        }
        return;
      }

      if (f.phase === 'reel') {
        if (f.missFlash > 0) f.missFlash = Math.max(0, f.missFlash - dt);
        if (f.hitFlash > 0) f.hitFlash = Math.max(0, f.hitFlash - dt);
        f.timer -= dt;
        f.cursorPos += f.cursorDir * f.cursorSpeed * dt;
        if (f.cursorPos >= 1) {
          f.cursorPos = 1;
          f.cursorDir = -1;
        } else if (f.cursorPos <= 0) {
          f.cursorPos = 0;
          f.cursorDir = 1;
        }
        if (f.timer <= 0) {
          if (game.spawnParticles) game.spawnParticles(f.wx, f.wy, '#81d4fa', 10);
          if (game.spawnFx) game.spawnFx('water_splash_fx', f.wx, f.wy, 0, 0.38, 0.30, 0.9);
          this.fishing = null;
          Abyssea.Audio.play('error');
          game.addFloatingText(game.player.x, game.player.y - 26, Abyssea.I18n ? Abyssea.I18n.t('fish.slipped') : '¡Se soltó del anzuelo!', '#ef9a9a');
        }
      }
    }

    completeCatch(game) {
      const f = this.fishing;
      if (!f || (f.phase !== 'reel' && f.phase !== 'bite')) return;
      this.fishing = null;

      // Consume bait on catch!
      if (f.baitId && (game.inventory[f.baitId] || 0) > 0) {
        game.removeItem(f.baitId, 1);
      }

      const fishObj = f.targetFish || { id: 'pez_comun', xp: 14 };
      const fishId = Abyssea.ITEMS[fishObj.id] ? fishObj.id : 'pez_comun';
      game.addItem(fishId, 1);
      game.stats.fishCaught++;
      game.gainXp(fishObj.xp || 16);
      Abyssea.Audio.play('catch');
      if (game.triggerPlayerAction) game.triggerPlayerAction('hana_fish_catch', 0.55, f.wx, f.wy);
      if (game.spawnFishCatchLeap) {
        game.spawnFishCatchLeap(f.wx, f.wy, game.player.x, game.player.y - 14, fishId);
      }
      game.spawnParticles(f.wx, f.wy, '#ffd54f', 14);
      const itemName = (Abyssea.ITEMS[fishId] && Abyssea.ITEMS[fishId].name) || 'Pez';
      game.addFloatingText(game.player.x, game.player.y - 34, `¡Atrapado: ${itemName}!`, '#ffe082');

      // Chance for sunken treasure (scales across all high-tier baits)
      const baitTreasureBonus = f.baitId === 'cebo_arcano' ? 0.30
        : f.baitId === 'cebo_volcanico' ? 0.25
        : f.baitId === 'cebo_dorado' ? 0.20 : 0;
      const treasureChance = 0.20 + (f.luck || 0) * 0.22 + baitTreasureBonus;
      if (Math.random() < treasureChance) {
        const bonusCoins = randInt(8, 22);
        game.addCoins(bonusCoins);
        const treasureRoll = Math.random();
        if (treasureRoll < 0.16) game.addItem('perla', 1);
        else if (treasureRoll < 0.30) game.addItem('gema_marina', 1);
        else if (treasureRoll < 0.46) game.addItem('caracola_antigua', 1);
        else if (treasureRoll < 0.62) game.addItem('coral_brillante', 1);
        else if (treasureRoll < 0.76) game.addItem('llave_mazmorra', 1);
        else if (treasureRoll < 0.88) game.addItem('lata_oxidada', 1);
        else game.addItem('bota_vieja', 1);
        game.toast(`¡Tesoro sumergido junto a ${itemName}! +${bonusCoins} monedas`, 'success');
      }
      if (f.spotNode) {
        game.world.nodes = game.world.nodes.filter(n => n !== f.spotNode);
      }
    }
  }

  Abyssea.CROPS = CROPS;
  Abyssea.FarmingAndFishing = FarmingAndFishing;
})();