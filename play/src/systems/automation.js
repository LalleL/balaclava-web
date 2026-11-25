(function () {
  'use strict';

  const Abyssea = (window.Abyssea = window.Abyssea || {});
  const { TILE_SIZE } = Abyssea.CONST;
  const { pick } = Abyssea.Utils;

  // Handles building placement, machine automation cycles, upgrades, turrets, collectors & passive buffs.
  class AutomationSystem {
    getMachineSpeedMultiplier(game) {
      let mult = 1.0 + (game.mods.machineSpeed || 0);
      for (const b of game.buildings) {
        const def = Abyssea.BUILDINGS[b.type];
        if (def && def.machineSpeedBonus) {
          if (def.omegaStructure && !b.omegaActive) continue;
          mult += def.machineSpeedBonus * (1 + (b.level - 1) * 0.35);
        }
      }
      return mult;
    }

    getStorageCapacity(game, building) {
      const def = Abyssea.BUILDINGS[building.type];
      const base = (def && def.capacity) || 30;
      const lvlMult = 1 + (building.level - 1) * 0.6;
      const skillMult = 1 + (game.mods.storageMult || 0);
      return Math.round(base * lvlMult * skillMult);
    }

    getTotalStoredCount(building) {
      let total = 0;
      if (building.storage) {
        for (const q of Object.values(building.storage)) total += q;
      }
      return total;
    }

    update(dt, game) {
      const speedMult = this.getMachineSpeedMultiplier(game);
      let treasuryCount = 0;
      for (let ti = 0; ti < game.buildings.length; ti++) {
        if (game.buildings[ti].type === 'tesoreria') treasuryCount++;
      }

      for (const b of game.buildings) {
        const def = Abyssea.BUILDINGS[b.type];
        if (!def) continue;
        if (!b.storage) b.storage = {};
        if (!b.coinsStored) b.coinsStored = 0;
        if (!b.level) b.level = 1;
        if (typeof b.fuel !== 'number') b.fuel = def.usesFuel ? 5 : 0;

        // Warmth regen aura (Fogata)
        if (def.warmRegenRadius && !game.activeDungeon) {
          const bx = (b.tx + def.size * 0.5) * TILE_SIZE;
          const by = (b.ty + def.size * 0.5) * TILE_SIZE;
          if (Abyssea.Utils.dist(bx, by, game.player.x, game.player.y) <= def.warmRegenRadius) {
            game.player.hp = Math.min(game.player.maxHp, game.player.hp + dt * 2.2);
            game.player.energy = Math.min(game.player.maxEnergy, game.player.energy + dt * 6.0);
          }
        }

        // Turret defense (Torre Mágica / Torre Voltaica / Torreta de Prisma Omega)
        if (def.turretRange) {
          if (def.omegaStructure && !b.omegaActive) continue;
          b.turretCd = Math.max(0, (b.turretCd || 0) - dt);
          if (b.turretCd <= 0 && !game.activeDungeon) {
            const bx = (b.tx + def.size * 0.5) * TILE_SIZE;
            const by = (b.ty + def.size * 0.5) * TILE_SIZE;
            const target = game.combat.enemies.find(e => Abyssea.Utils.dist(bx, by, e.x, e.y) <= def.turretRange);
            if (target) {
              const baseCd = def.turretCooldown || def.turretRate || 1.6;
              b.turretCd = baseCd / (1 + (b.level - 1) * 0.25);
              const ang = Math.atan2(target.y - by, target.x - bx);
              const dmg = Math.round((def.turretDmg || 28) * (1 + (b.level - 1) * 0.45));
              if (def.isLightningTurret) {
                game.spawnFx('fx_thunder_strike', target.x, target.y - 18, 0, 0.34, 1.35, 0.92);
                game.combat.damageEnemy(game, target, dmg, ang, false);
                const near = game.combat.enemies.filter(e => e !== target && Abyssea.Utils.dist(target.x, target.y, e.x, e.y) <= 120).slice(0, 2);
                for (const se of near) {
                  game.combat.damageEnemy(game, se, Math.round(dmg * 0.6), ang, false);
                }
              } else {
                game.spawnPlayerProjectile(bx, by, Math.cos(ang) * 340, Math.sin(ang) * 340, dmg, '#ce93d8');
              }
            }
          }
          continue;
        }

        // Auto-Collector (Torre Recolectora)
        if (def.collectRadius) {
          b.timer = (b.timer || 0) + dt * speedMult * (1 + (b.level - 1) * 0.35);
          if (b.timer >= def.autoCycle) {
            b.timer = 0;
            this.runCollector(game, b, def.collectRadius);
          }
          continue;
        }

        // Plantation auto-harvest mature crops
        if (def.autoHarvestRadius) {
          b.timer = (b.timer || 0) + dt * speedMult;
          if (b.timer >= def.autoCycle) {
            b.timer = 0;
            this.runPlantation(game, b, def.autoHarvestRadius);
          }
          continue;
        }

        // Auto-Irrigator (Aspersor / Invernadero) — throttled to 0.45s + squared distance (zero per-frame O(N*M) scan)
        if (def.autoWaterRadius) {
          b._waterCd = (b._waterCd || 0) - dt;
          if (b._waterCd <= 0) {
            b._waterCd = 0.45;
            const bx = (b.tx + def.size * 0.5) * TILE_SIZE;
            const by = (b.ty + def.size * 0.5) * TILE_SIZE;
            const r = def.autoWaterRadius * (1 + (b.level - 1) * 0.2);
            const rSq = r * r;
            const crops = game.world.crops;
            for (let ci = 0; ci < crops.length; ci++) {
              const c = crops[ci];
              if (c.watered) continue;
              const dx = (c.tx + 0.5) * TILE_SIZE - bx;
              const dy = (c.ty + 0.5) * TILE_SIZE - by;
              if (dx * dx + dy * dy <= rSq) c.watered = true;
            }
          }
        }

        if (!def.autoCycle) continue;

        // Fuel check for fuel-consuming machines (unless freeFuel skill unlocked)
        if (def.usesFuel && !game.mods.freeFuel && b.fuel <= 0) {
          if ((game.inventory.carbon || 0) > 0 && b.autoRefuel !== false) {
            game.removeItem('carbon', 1);
            b.fuel += 5;
          } else {
            b.noFuel = true;
            continue;
          }
        }
        b.noFuel = false;

        const lvlSpeed = 1 + (b.level - 1) * 0.45;
        b.timer = (b.timer || 0) + dt * speedMult * lvlSpeed;
        if (b.timer < def.autoCycle) continue;
        b.timer = 0;

        // Check queued manual smelting/crafting task first
        if (b.queue && b.queue.length > 0) {
          const job = b.queue[0];
          this.depositToBuilding(game, b, job.out, job.qty);
          job.left--;
          if (job.left <= 0) b.queue.shift();
          if (def.usesFuel && !game.mods.freeFuel) b.fuel = Math.max(0, b.fuel - 0.5);
          continue;
        }

        const cap = this.getStorageCapacity(game, b);
        const stored = this.getTotalStoredCount(b);

        // Passive Coins (Banco, Casa de comercio, Tesoreria)
        if (def.autoCoins && b.coinsStored < cap) {
          let treasuryMult = 1 + (game.mods.passiveCoinBonus || 0);
          if (b.type === 'banco') {
            treasuryMult += treasuryCount * 0.25;
          }
          const gain = Math.round(def.autoCoins * (1 + (b.level - 1) * 0.5) * treasuryMult);
          b.coinsStored = Math.min(cap, b.coinsStored + gain);
        }

        // Passive XP (Biblioteca)
        if (def.autoXp) {
          game.gainXp(Math.round(def.autoXp * (1 + (b.level - 1) * 0.4)));
        }

        if (stored >= cap) {
          b.isPausedFull = true;
          continue;
        }
        b.isPausedFull = false;

        // Auto Drill extracts biome-specific minerals across all 14 biomes
        if (def.autoDrill) {
          const biome = game.world.getBiomeAtPixel(b.tx * TILE_SIZE + 24, b.ty * TILE_SIZE + 24);
          const tables = {
            pradera: ['piedra', 'carbon', 'cobre', 'hierro', 'malaquita_pradera'],
            desierto: ['arena', 'cobre', 'oro', 'cristales', 'ambar_desierto'],
            bosque_oscuro: ['hierro', 'carbon', 'cristales', 'esencia_oscura', 'cristal_abismal'],
            montanas_heladas: ['hierro', 'oro', 'cristales', 'esmeraldas', 'azurita_glacial'],
            tierras_volcanicas: ['material_volcanico', 'carbon', 'oro', 'diamantes', 'esencia_magma'],
            archipielago_coral: ['piedra', 'coral_roca', 'perla', 'plata', 'platino'],
            cavernas_cristal: ['cristales', 'cuarzo_boreal', 'zafiro', 'titanio', 'celestita'],
            selva_esmeralda: ['piedra', 'madera_ferrea', 'jade', 'esmeraldas', 'mitrilo_bruto'],
            caldera_ceniza: ['carbon', 'escoria_caldera', 'obsidiana_bruta', 'rubi', 'oricalco'],
            dinastia_arena: ['arena_estelar', 'pirita_solar', 'oro', 'agata_roja', 'adamantita'],
            glaciar_profundo: ['hielo_eterno', 'cuarzo_boreal', 'zafiro', 'bismuto_astral', 'titanio'],
            cienaga_putrida: ['resina_toxica', 'polvo_veneno', 'esmeraldas', 'adamantita', 'mitrilo_bruto'],
            necropolis_osea: ['hueso_fosil', 'plata_maldita', 'amatista', 'esencia_oscura', 'oricalco'],
            tierras_malditas: ['plata_maldita', 'marmol_oscuro', 'cristal_carmesi', 'diamantes', 'oricalco']
          };
          const pool = tables[biome] || tables.pradera;
          let idx = Math.floor(Math.random() * pool.length);
          if (b.level >= 2 && Math.random() < 0.35) idx = Math.min(pool.length - 1, idx + 1);
          this.depositToBuilding(game, b, pool[idx], b.level >= 3 ? 2 : 1);
          if (!game.mods.freeFuel) b.fuel = Math.max(0, b.fuel - 0.5);
          continue;
        }

        // Auto Fish (Estanque & Muelle Pesquero) — all 14 biomes + Breeding + Bait Traps (RC2)
        if (def.autoFish || b.type === 'muelle_pesca') {
          const biome = game.world.getBiomeAtPixel(b.tx * TILE_SIZE + 24, b.ty * TILE_SIZE + 24);
          // K1. Fish Pond Breeding: reproduces selected caught species passively!
          if (b.type === 'estanque' && b.breedFish && Abyssea.ITEMS[b.breedFish]) {
            const breedBonus = (b.level >= 3 && Math.random() < 0.35) ? 2 : 1;
            this.depositToBuilding(game, b, b.breedFish, breedBonus);
            continue;
          }
          // K2. Fishing Dock Passive Bait Traps: consumes loaded bait for boosted/exotic catches!
          if (b.type === 'muelle_pesca') {
            if (b.baitSlot && b.baitSlot.id && b.baitSlot.qty > 0) {
              const baitId = b.baitSlot.id;
              b.baitSlot.qty = Math.max(0, b.baitSlot.qty - 1);
              if (b.baitSlot.qty <= 0) b.baitSlot = null;
              const tierBonus = baitId === 'cebo_arcano' ? 0.95 : baitId === 'cebo_volcanico' ? 0.72 : baitId === 'cebo_dorado' ? 0.52 : 0.28;
              const caught = (game.farming && typeof game.farming.rollTargetFish === 'function')
                ? game.farming.rollTargetFish(biome, tierBonus + (b.level - 1) * 0.12, baitId, b.level + 2)
                : { id: 'pez_dorado' };
              this.depositToBuilding(game, b, (caught && caught.id) || 'pez_dorado', b.level >= 3 ? 2 : 1);
              continue;
            }
            if (!def.autoFish) continue;
          }
          const fishByBiome = {
            desierto: ['pez_comun', 'pez_dorado', 'pez_payaso', 'cangrejo_dorado'],
            dinastia_arena: ['pez_dorado_solar', 'cangrejo_dorado', 'carpa_dorada'],
            bosque_oscuro: ['pez_comun', 'pez_abismal', 'bagre', 'anguila_sombras'],
            necropolis_osea: ['pez_abismal', 'anguila_sombras', 'medusa'],
            tierras_malditas: ['pez_abismal', 'anguila_sombras', 'celacanto_ancestral'],
            montanas_heladas: ['pez_comun', 'pez_helado', 'trucha_arcoiris', 'esturion_glacial'],
            glaciar_profundo: ['pez_helado', 'esturion_glacial', 'tiburon_cristal'],
            cavernas_cristal: ['pez_helado', 'medusa', 'tiburon_cristal'],
            tierras_volcanicas: ['pez_dorado', 'pez_lava', 'pez_fenix_magma'],
            caldera_ceniza: ['pez_lava', 'pez_fenix_magma', 'pez_globo'],
            archipielago_coral: ['pez_angel', 'pez_payaso', 'pulpo', 'perla'],
            selva_esmeralda: ['bagre', 'carpa_dorada', 'anguila'],
            cienaga_putrida: ['bagre', 'anguila', 'pez_globo']
          };
          const fishPool = fishByBiome[biome] || ['pez_comun', 'lubina', 'anchoa', 'pez_dorado'];
          this.depositToBuilding(game, b, pick(fishPool), 1);
          continue;
        }

        // Auto Convert from player's inventory if toggled & available (Molino, Telar, Horno)
        if (def.autoConvert && b.autoPull !== false) {
          const canPull = Object.entries(def.autoConvert.in).every(([id, q]) => (game.inventory[id] || 0) >= q);
          if (canPull) {
            Object.entries(def.autoConvert.in).forEach(([id, q]) => game.removeItem(id, q));
            Object.entries(def.autoConvert.out).forEach(([id, q]) => this.depositToBuilding(game, b, id, q));
            if (def.usesFuel && !game.mods.freeFuel) b.fuel = Math.max(0, b.fuel - 0.5);
            continue;
          }
        }

        // Direct auto-production (Aserradero, Huerto, Corral, Granja, Laboratorio, Fundicion, etc.)
        if (def.autoProduce) {
          const entries = Object.entries(def.autoProduce);
          const [itemId, qty] = pick(entries);
          this.depositToBuilding(game, b, itemId, qty + (b.level >= 3 ? 1 : 0));
          if (def.usesFuel && !game.mods.freeFuel) b.fuel = Math.max(0, b.fuel - 0.5);
        }
      }
    }

    depositToBuilding(game, b, itemId, qty) {
      if (!b.storage) b.storage = {};
      const cap = this.getStorageCapacity(game, b);
      const curStored = this.getTotalStoredCount(b);
      const space = Math.max(0, cap - curStored);
      const toStore = Math.min(qty, space);
      if (toStore > 0) {
        b.storage[itemId] = (b.storage[itemId] || 0) + toStore;
      }
      const overflow = qty - toStore;
      if (overflow > 0) {
        const routed = this.routeOverflowToLogistics(game, b, itemId, overflow);
        if (!routed) {
          b.isPausedFull = true;
          return false;
        }
      }
      b.isPausedFull = (this.getTotalStoredCount(b) >= cap);
      return true;
    }

    matchesLogisticFilter(filters, itemId) {
      if (!Array.isArray(filters) || filters.length === 0) return true;
      if (filters.includes(itemId)) return true;
      const it = Abyssea.ITEMS && Abyssea.ITEMS[itemId];
      if (!it) return false;
      for (const f of filters) {
        if (!String(f).startsWith('cat:')) continue;
        const cat = String(f).slice(4);
        if (cat === 'minerales' && (it.category === 'minerales' || it.category === 'gemas' || /^(lingote_|placa_|fragmento_|polvo_|piedra|carbon|cobre|hierro|plata|oro|platino|titanio|adamantita|oricalco|mitrilo|coral_roca|cuarzo_|escoria_|pirita_|hielo_|hueso_|marmol_)/.test(itemId))) return true;
        if (cat === 'peces' && ((Abyssea.AQUARIUM_FISH_PASSIVES && Abyssea.AQUARIUM_FISH_PASSIVES[itemId]) || /^(pez_|anchoa|lubina|bagre|trucha|carpa_|anguila|medusa|pulpo|camaron|cangrejo_|mantarraya_|tiburon_|celacanto_|koi_|leviatan_|raya_|esturion_)/.test(itemId))) return true;
        if (cat === 'semillas' && (it.plantCrop || itemId.startsWith('semilla_'))) return true;
        if (cat === 'cultivos' && (it.category === 'alimentos' || it.category === 'comida' || it.category === 'ingredientes')) return true;
        if (cat === 'botin' && (it.category === 'monstruo' || it.category === 'especiales')) return true;
      }
      return false;
    }

    routeOverflowToLogistics(game, sourceB, itemId, qty) {
      const chests = (game.buildings || []).filter(x => x.type === 'cofre_logistico');
      if (chests.length === 0) return false;
      let remaining = qty;
      for (const ch of chests) {
        if (!ch.storage) ch.storage = {};
        if (Array.isArray(ch.filters) && ch.filters.length > 0 && !this.matchesLogisticFilter(ch.filters, itemId)) {
          continue;
        }
        const chCap = this.getStorageCapacity(game, ch);
        const chCur = this.getTotalStoredCount(ch);
        const chSpace = Math.max(0, chCap - chCur);
        const fit = Math.min(remaining, chSpace);
        if (fit > 0) {
          ch.storage[itemId] = (ch.storage[itemId] || 0) + fit;
          remaining -= fit;
          if (remaining <= 0) return true;
        }
      }
      return remaining < qty;
    }

    routeCollectorItem(game, collector, itemId, qty) {
      if (!itemId || qty <= 0) return true;
      let remaining = qty;
      const cx = (collector.tx + 0.5) * TILE_SIZE;
      const cy = (collector.ty + 0.5) * TILE_SIZE;
      const radius = (Abyssea.BUILDINGS[collector.type] && Abyssea.BUILDINGS[collector.type].collectRadius) || 6;
      const maxDist = radius * TILE_SIZE;

      // 1. Try feeding nearby machines that need this item (fuels, ores)
      for (const b of (game.buildings || [])) {
        if (b === collector) continue;
        const bDef = Abyssea.BUILDINGS[b.type];
        if (!bDef) continue;
        const bx = (b.tx + 0.5) * TILE_SIZE;
        const by = (b.ty + 0.5) * TILE_SIZE;
        if (Abyssea.Utils.dist(cx, cy, bx, by) > maxDist) continue;

        // Fuel consumer that needs fuel (Horno, Forja, etc.)
        if (bDef.usesFuel && (itemId === 'carbon' || itemId === 'madera')) {
          if ((b.fuel || 0) < 20) {
            const addFuel = itemId === 'carbon' ? 5 : 2;
            const takeQty = Math.min(remaining, Math.ceil((25 - (b.fuel || 0)) / addFuel));
            if (takeQty > 0) {
              b.fuel = (b.fuel || 0) + takeQty * addFuel;
              b.noFuel = false;
              remaining -= takeQty;
              if (remaining <= 0) return true;
            }
          }
        }

        // Generator that uses this fuel directly (Gen Vapor, Geotérmico, etc.)
        const genDef = Abyssea.OmegaSystem && Abyssea.OmegaSystem.GENERATORS && Abyssea.OmegaSystem.GENERATORS[b.type];
        if (genDef && Array.isArray(genDef.fuels) && genDef.fuels.some(f => f.id === itemId)) {
          b.storage = b.storage || {};
          const cur = b.storage[itemId] || 0;
          if (cur < 20) {
            const take = Math.min(remaining, 20 - cur);
            b.storage[itemId] = cur + take;
            remaining -= take;
            if (remaining <= 0) return true;
          }
        }

        // Smelting/processing machine accepting raw minerals
        if (bDef.station === 'horno' || bDef.station === 'fundicion' || bDef.station === 'forja') {
          b.storage = b.storage || {};
          const cur = b.storage[itemId] || 0;
          if (cur < 30) {
            const take = Math.min(remaining, 30 - cur);
            b.storage[itemId] = cur + take;
            remaining -= take;
            if (remaining <= 0) return true;
          }
        }
      }

      // 2. Try depositing directly into the island's Nexo Central
      const plotKey = (game.omega && typeof game.omega.plotKeyOf === 'function')
        ? game.omega.plotKeyOf(collector.tx, collector.ty)
        : (Abyssea.OmegaSystem && typeof Abyssea.OmegaSystem.plotKeyOf === 'function' ? Abyssea.OmegaSystem.plotKeyOf(collector.tx, collector.ty) : null);
      if (plotKey && game.omega && game.omega.nexusCanAdd && game.omega.nexusCanAdd(plotKey, { [itemId]: remaining })) {
        game.omega.nexusAdd(plotKey, { [itemId]: remaining });
        if (typeof game.spawnParticles === 'function') {
          game.spawnParticles(cx, cy, '#69f0ae', 3);
        }
        return true;
      }

      // 3. Try routing to logistic chests
      if (this.routeOverflowToLogistics(game, collector, itemId, remaining)) {
        return true;
      }

      // 4. Fallback: deposit into player inventory or collector's own storage
      if (game.canAddItem && game.canAddItem(itemId, remaining)) {
        game.addItem(itemId, remaining);
      } else {
        collector.storage = collector.storage || {};
        collector.storage[itemId] = (collector.storage[itemId] || 0) + remaining;
      }
      return true;
    }

    collectFromBuilding(game, b, collector) {
      if (!b) return false;
      const bDef = Abyssea.BUILDINGS[b.type];
      if (b.isChest || (bDef && bDef.isChest) || b.type === 'cofre_logistico') {
        return false;
      }
      let collectedAny = false;
      b.isPausedFull = false;
      if (b.coinsStored > 0) {
        game.addCoins(b.coinsStored);
        b.coinsStored = 0;
        collectedAny = true;
      }
      if (b.storage) {
        for (const [id, qty] of Object.entries(b.storage)) {
          if (qty > 0) {
            this.routeCollectorItem(game, collector || b, id, qty);
            b.storage[id] = 0;
            collectedAny = true;
          }
        }
      }
      if (collectedAny) {
        Abyssea.Audio.play('pickup');
      }
      return collectedAny;
    }

    runCollector(game, collector, radius) {
      const cx = (collector.tx + 0.5) * TILE_SIZE;
      const cy = (collector.ty + 0.5) * TILE_SIZE;
      const maxDist = radius * TILE_SIZE;

      // Pull dropped world loot directly to machines/Nexo/inventory
      for (let i = game.drops.length - 1; i >= 0; i--) {
        const d = game.drops[i];
        if (Abyssea.Utils.dist(cx, cy, d.x, d.y) <= maxDist) {
          if (d.itemId === '_coin') {
            game.addCoins(d.qty);
          } else {
            this.routeCollectorItem(game, collector, d.itemId, d.qty);
          }
          game.drops.splice(i, 1);
        }
      }

      // Empty nearby machines automatically (never drain player storage chests)
      for (const b of game.buildings) {
        if (b === collector) continue;
        const bDef = Abyssea.BUILDINGS[b.type];
        if (b.isChest || (bDef && bDef.isChest) || b.type === 'cofre_logistico') continue;
        const bx = (b.tx + 0.5) * TILE_SIZE;
        const by = (b.ty + 0.5) * TILE_SIZE;
        if (Abyssea.Utils.dist(cx, cy, bx, by) <= maxDist) {
          this.collectFromBuilding(game, b, collector);
        }
      }
    }

    runPlantation(game, plantBuilding, radius) {
      for (let i = game.world.crops.length - 1; i >= 0; i--) {
        const c = game.world.crops[i];
        if (c.stage >= 3 && Math.abs(c.tx - plantBuilding.tx) <= radius && Math.abs(c.ty - plantBuilding.ty) <= radius) {
          const def = Abyssea.CROPS[c.cropId];
          if (def) {
            game.world.crops.splice(i, 1);
            game.addItem(def.yieldId, def.minQty);
            game.stats.cropsHarvested++;
            // Auto-replant if player has seeds!
            if ((game.inventory[def.seedId] || 0) > 0) {
              game.removeItem(def.seedId, 1);
              game.world.crops.push({ tx: c.tx, ty: c.ty, cropId: c.cropId, progress: 0, stage: 0, watered: true });
            }
          }
        }
      }
    }

    upgradeBuilding(game, b) {
      if (b.level >= 3) return false;
      const nextLvl = b.level + 1;
      const coinCost = nextLvl * 85;
      const gearCost = nextLvl === 2 ? 2 : 4;
      if (game.coins < coinCost || (game.inventory.engrane || 0) < gearCost) {
        game.toast(`Necesitas ${coinCost} monedas y ${gearCost} Engranajes para mejorar a Nv.${nextLvl}`, 'warn');
        Abyssea.Audio.play('error');
        return false;
      }
      game.coins -= coinCost;
      game.removeItem('engrane', gearCost);
      b.level = nextLvl;
      Abyssea.Audio.play('levelup');
      game.toast(`¡${Abyssea.BUILDINGS[b.type].name} mejorado a Nivel ${nextLvl}!`, 'success');
      return true;
    }
  }

  Abyssea.AutomationSystem = AutomationSystem;
})();
