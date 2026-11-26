(function () {
  'use strict';

  const Abyssea = (window.Abyssea = window.Abyssea || {});
  const { pick, randInt } = Abyssea.Utils;

  // Dynamic rotating Market (5 Buy + 5 Sell rotating every 15 minutes), balanced prices & plots.
  class EconomySystem {
    constructor() {
      this.marketStock = [];
      this.sellContracts = [];
      this.refreshTimer = 0;
      this.refreshInterval = 900; // rotates every 15 minutes (900 seconds)
      this.maxManualRefreshes = 3;
      this.manualRefreshesUsed = 0;
      this.refreshStock(1);
    }

    getRemainingRefreshes() {
      return Math.max(0, (this.maxManualRefreshes || 3) - (this.manualRefreshesUsed || 0));
    }

    manualRefreshStock(game) {
      if (this.getRemainingRefreshes() <= 0) {
        const secs = Math.max(0, Math.ceil(this.refreshTimer || 0));
        const mm = String(Math.floor(secs / 60)).padStart(2, '0');
        const ss = String(secs % 60).padStart(2, '0');
        const msg = Abyssea.I18n
          ? Abyssea.I18n.t('market.refreshLimitToast', { mm, ss })
          : `Solo puedes renovar 3 veces por ciclo. Reinicio en ${mm}:${ss}.`;
        if (game && typeof game.toast === 'function') game.toast(msg, 'warn');
        if (Abyssea.Audio) Abyssea.Audio.play('error');
        return false;
      }
      if (!game || (game.coins || 0) < 15) {
        if (game && typeof game.toast === 'function') {
          game.toast(Abyssea.I18n ? Abyssea.I18n.t('market.needCoinsRefresh') : 'Necesitas 15 monedas para renovar.', 'warn');
        }
        return false;
      }
      game.coins -= 15;
      this.manualRefreshesUsed = (this.manualRefreshesUsed || 0) + 1;
      this.refreshStock((game.player && game.player.level) || 1, { resetCycle: false });
      if (Abyssea.Audio) Abyssea.Audio.play('coin');
      return true;
    }

    refreshStock(playerLevel = 1, opts = {}) {
      const resetCycle = opts.resetCycle !== false;
      const seedsPool = ['semillas', 'semillas_zanahoria', 'semillas_calabaza', 'semillas_tomate', 'semillas_papa', 'semillas_fresa', 'cebo_gusano'];
      const matPool = ['madera', 'piedra', 'carbon', 'hierro', 'cobre', 'arena', 'arcilla', 'cuero', 'tablon', 'ladrillo', 'vidrio', 'tela'];
      const rarePool = ['oro', 'lingote_hierro', 'lingote_bronce', 'engrane', 'pocion_vida', 'pocion_velocidad', 'llave_mazmorra', 'fertilizante'];
      const epicPool = ['cristales', 'plata', 'platino', 'esmeraldas', 'diamantes', 'cristales_magicos', 'cebo_dorado'];
      const sellPool = ['madera', 'piedra', 'carbon', 'hierro', 'cobre', 'bayas', 'trigo', 'zanahoria', 'tomate', 'lana', 'carne', 'pez_comun', 'tablon', 'lingote_cobre', 'lingote_hierro', 'pan', 'huesos', 'cuero', 'harina'];

      const pickUnique = (pool, existing) => {
        const avail = pool.filter(id => Abyssea.ITEMS[id] && !existing.some(e => e.itemId === id));
        return avail.length ? pick(avail) : null;
      };

      const buyList = [];
      const addBuy = (id, multMin, multMax, sMin, sMax, maxCap = null) => {
        if (!id || buyList.length >= 5) return;
        const it = Abyssea.ITEMS[id];
        if (!it) return;
        const mult = multMin + Math.random() * (multMax - multMin);
        const baseBuy = Number(it.buyValue) || (Number(it.sellValue) ? Number(it.sellValue) * 2.2 : 12);
        let price = Math.max(3, Math.round(baseBuy * mult));
        if (maxCap) price = Math.min(maxCap, price);
        buyList.push({
          itemId: id,
          price,
          stock: randInt(sMin, sMax),
          discount: mult < 0.94 ? Math.round((1 - mult) * 100) : 0
        });
      };

      // Strictly max 5 balanced Buy offers per 15m cycle
      addBuy(pickUnique(seedsPool, buyList), 0.90, 1.10, 4, 8, 45);
      addBuy(pickUnique(matPool, buyList), 0.90, 1.08, 6, 12, 36);
      addBuy(pickUnique(matPool, buyList), 0.90, 1.08, 5, 10, 42);
      addBuy(pickUnique(rarePool, buyList), 0.88, 1.08, 2, 4, 140);
      addBuy(pickUnique(playerLevel >= 4 ? epicPool : rarePool, buyList), 0.86, 1.06, 1, 3, 240);

      // Strictly max 5 balanced Sell demand contracts per 15m cycle
      const sellList = [];
      for (let i = 0; i < 14 && sellList.length < 5; i++) {
        const id = pickUnique(sellPool, sellList);
        if (!id) continue;
        const it = Abyssea.ITEMS[id];
        const bonusMult = 1.15 + Math.random() * 0.25;
        const baseSell = Number(it.sellValue) || Number(it.sellPrice) || 5;
        const unitPrice = Math.max(2, Math.round(baseSell * bonusMult));
        sellList.push({
          itemId: id,
          price: unitPrice,
          demand: randInt(8, 20),
          bonusPct: Math.round((bonusMult - 1) * 100)
        });
      }

      this.marketStock = buyList.slice(0, 5);
      this.sellContracts = sellList.slice(0, 5);
      if (resetCycle) {
        this.refreshTimer = this.refreshInterval;
        this.manualRefreshesUsed = 0;
      }
    }

    sellMarketContract(game, idx, qty = 1) {
      const c = this.sellContracts && this.sellContracts[idx];
      if (!c || c.demand <= 0) return false;
      const item = Abyssea.ITEMS[c.itemId];
      if (!item) return false;
      const owned = game.inventory[c.itemId] || 0;
      const count = Math.min(owned, c.demand, qty);
      if (count <= 0) return false;
      const mult = this.getSellMultiplier(game, c.itemId);
      const unit = Math.max(1, Math.round(c.price * mult));
      const total = unit * count;
      game.removeItem(c.itemId, count);
      c.demand -= count;
      game.addCoins(total);
      Abyssea.Audio.play('coin');
      game.toast(`Vendido ${count}x ${item.name} por +${total} monedas`, 'success');
      return true;
    }

    update(dt, game) {
      this.refreshTimer -= dt;
      if (this.refreshTimer <= 0) {
        this.refreshStock(game.player.level);
        if (game.buildings.some(b => b.type === 'mercado')) {
          game.toast('El inventario del Mercado ha rotado con nuevas ofertas.', 'info');
        }
      }
    }

    getSellMultiplier(game, itemId = null) {
      let mult = 1.0 + (game.mods.sellBonus || 0);
      const treasuries = (game.buildings || []).filter(b => b.type === 'tesoreria').length;
      mult += Math.min(0.90, treasuries * 0.15);
      // Puesto de Feria Urbana (sellAura: +6% comercio, capped at +30%)
      const marketStalls = (game.buildings || []).filter(b => b.type === 'puesto_mercado');
      if (marketStalls.length > 0) {
        const stallDef = Abyssea.BUILDINGS && Abyssea.BUILDINGS.puesto_mercado;
        const perStall = (stallDef && stallDef.sellAura) || 0.06;
        mult += Math.min(0.30, marketStalls.length * perStall);
      }
      // RC2: Daily Dynamic Market Demand surge!
      if (itemId && game && typeof game.getDailyMarketDemand === 'function') {
        const dem = game.getDailyMarketDemand();
        const it = Abyssea.ITEMS && Abyssea.ITEMS[itemId];
        if (dem && typeof dem.matches === 'function' && dem.matches(itemId, it)) {
          mult *= (dem.mult || 1.45);
        }
      }
      return Math.min(3.0, mult);
    }

    getBuyPrice(game, basePrice, itemId = null) {
      let disc = game.mods.marketDiscount || 0;
      const marketStalls = (game.buildings || []).filter(b => b.type === 'puesto_mercado').length;
      if (marketStalls > 0) {
        const stallDef = Abyssea.BUILDINGS && Abyssea.BUILDINGS.puesto_mercado;
        const perStall = (stallDef && stallDef.sellAura) || 0.06;
        disc += Math.min(0.24, marketStalls * perStall);
      }
      disc = Math.min(0.55, Math.max(0, disc));
      let finalPrice = Math.max(1, Math.round(basePrice * (1 - disc)));
      // Prevent buy->sell infinite gold arbitrage floor
      if (itemId && Abyssea.ITEMS && Abyssea.ITEMS[itemId]) {
        const it = Abyssea.ITEMS[itemId];
        const baseSell = Number(it.sellValue) || Number(it.sellPrice) || 5;
        const effectiveSell = Math.round(baseSell * this.getSellMultiplier(game, itemId));
        finalPrice = Math.max(finalPrice, Math.ceil(effectiveSell * 1.15) + 1);
      }
      return finalPrice;
    }

    sellItem(game, itemId, qty = 1) {
      const item = Abyssea.ITEMS[itemId];
      if (!item) return false;
      const owned = game.inventory[itemId] || 0;
      const count = Math.min(owned, qty);
      if (count <= 0) return false;

      const baseVal = Number(item.sellValue) || Number(item.sellPrice) || 5;
      const unitPrice = Math.max(1, Math.round(baseVal * this.getSellMultiplier(game, itemId)));
      const total = unitPrice * count;
      game.removeItem(itemId, count);
      game.addCoins(total);
      Abyssea.Audio.play('coin');
      game.toast(`Vendido ${count}x ${item.name} por +${total} monedas`, 'success');
      return true;
    }

    buyMarketItem(game, idx, qty = 1) {
      const offer = this.marketStock[idx];
      if (!offer || offer.stock <= 0) return false;
      const count = Math.min(qty, offer.stock);
      const unitCost = this.getBuyPrice(game, offer.price, offer.itemId);
      const total = unitCost * count;
      if (game.coins < total) {
        game.toast(`Necesitas ${total} monedas.`, 'warn');
        Abyssea.Audio.play('error');
        return false;
      }
      game.coins -= total;
      offer.stock -= count;
      game.addItem(offer.itemId, count);
      Abyssea.Audio.play('coin');
      return true;
    }

    getPlotPrice(game, gx, gy) {
      const biome = game.world && game.world.plotBiomes && game.world.plotBiomes[gy] ? game.world.plotBiomes[gy][gx] : null;
      const ring = (game.world && typeof game.world.getPlotRing === 'function') ? game.world.getPlotRing(gx, gy) : null;
      const base = Abyssea.getPlotBasePrice(gx, gy, biome, ring);
      const ownedCount = Array.isArray(game.unlockedPlots) ? Math.max(1, game.unlockedPlots.length) : 1;
      const progMult = ownedCount <= 1 ? 1 : (1 + Math.min(0.75, (ownedCount - 1) * 0.004));
      const disc = game.mods.landDiscount || 0;
      return Math.max(10, Math.round(base * progMult * (1 - disc)));
    }

    _ensureBiomeCache(game) {
      const uLen = Array.isArray(game && game.unlockedPlots) ? game.unlockedPlots.length : 0;
      const dLen = Array.isArray(game && game.clearedDungeons) ? game.clearedDungeons.length : 0;
      const seed = (game && game.world && game.world.worldSeed) || 0;
      const key = `${seed}|${uLen}|${dLen}`;
      if (this._biomeCacheKey !== key) {
        this._biomeCacheKey = key;
        this._biomeOrderCache = null;
        this._biomeProgCache = new Map();
        this._biomeLockByBiomeCache = new Map();
      }
    }

    invalidateBiomeCache() {
      this._biomeCacheKey = null;
      this._biomeOrderCache = null;
      if (this._biomeProgCache) this._biomeProgCache.clear();
      if (this._biomeLockByBiomeCache) this._biomeLockByBiomeCache.clear();
    }

    getBiomeProgressionOrder(game) {
      this._ensureBiomeCache(game);
      if (this._biomeOrderCache) return this._biomeOrderCache;
      const canonical = (Abyssea.CONST && Abyssea.CONST.BIOME_ORDER)
        ? [...Abyssea.CONST.BIOME_ORDER]
        : ['pradera', 'desierto', 'montanas_heladas', 'bosque_oscuro', 'tierras_volcanicas'];
      if (!game || !game.world || !Array.isArray(game.world.plotBiomes)) return canonical;
      const gridN = game.world.plotBiomes.length || 19;
      const presentSet = new Set();
      for (let gy = 0; gy < gridN; gy++) {
        for (let gx = 0; gx < gridN; gx++) {
          const b = game.world.plotBiomes[gy] && game.world.plotBiomes[gy][gx];
          if (b) presentSet.add(b);
        }
      }
      if (!presentSet.size) return canonical;
      const present = Array.from(presentSet);
      present.sort((a, b) => {
        const ia = canonical.indexOf(a);
        const ib = canonical.indexOf(b);
        return (ia >= 0 ? ia : 999) - (ib >= 0 ? ib : 999);
      });
      this._biomeOrderCache = present;
      return present;
    }

    getBiomeDungeons(game, biomeId) {
      const gates = Abyssea.DUNGEON_GATES || {};
      const defs = Abyssea.DUNGEON_DEFS || {};
      const list = [];
      const gatePlots = game && game.world && game.world.dungeonGatePlots;
      const plotBiomes = game && game.world && game.world.plotBiomes;
      if (gatePlots && plotBiomes) {
        for (const [dungId, coords] of Object.entries(gatePlots)) {
          if (!coords) continue;
          const b = plotBiomes[coords[1]] && plotBiomes[coords[1]][coords[0]];
          if (b === biomeId) {
            const g = gates[dungId] || defs[dungId] || { id: dungId, name: dungId };
            list.push({ id: dungId, name: g.name || dungId });
          }
        }
      } else {
        for (const [dungId, g] of Object.entries(gates)) {
          if (g && g.biome === biomeId) {
            list.push({ id: dungId, name: g.name || dungId });
          }
        }
      }
      return list;
    }

    getBiomeDungeonProgress(game, biomeId) {
      const list = this.getBiomeDungeons(game, biomeId);
      const cleared = Array.isArray(game && game.clearedDungeons) ? game.clearedDungeons : [];
      const done = list.filter(d => cleared.includes(d.id)).length;
      return {
        done,
        total: list.length,
        complete: list.length === 0 || done >= list.length,
        missingNames: list.filter(d => !cleared.includes(d.id)).map(d => d.name)
      };
    }

    getBiomeUnlockProgress(game, biomeId) {
      this._ensureBiomeCache(game);
      if (this._biomeProgCache.has(biomeId)) return this._biomeProgCache.get(biomeId);
      const biomesObj = (Abyssea.CONST && Abyssea.CONST.BIOMES) || {};
      const biomeName = (biomesObj[biomeId] && biomesObj[biomeId].name) || biomeId;
      const dungProg = this.getBiomeDungeonProgress(game, biomeId);
      if (!game || !game.world || !Array.isArray(game.world.plotBiomes)) {
        return {
          biomeId,
          biomeName,
          unlocked: 0,
          total: 0,
          islandsComplete: true,
          dungeonsDone: dungProg.done,
          dungeonsTotal: dungProg.total,
          dungeonsComplete: dungProg.complete,
          complete: dungProg.complete
        };
      }
      const gridN = game.world.plotBiomes.length || 19;
      let unlocked = 0;
      let total = 0;
      for (let gy = 0; gy < gridN; gy++) {
        for (let gx = 0; gx < gridN; gx++) {
          const b = game.world.plotBiomes[gy] && game.world.plotBiomes[gy][gx];
          if (b === biomeId) {
            total++;
            if (game.world.isPlotUnlocked(gx, gy)) unlocked++;
          }
        }
      }
      const islandsComplete = total === 0 || unlocked >= total;
      const dungeonsComplete = dungProg.complete;
      const res = {
        biomeId,
        biomeName,
        unlocked,
        total,
        islandsComplete,
        dungeonsDone: dungProg.done,
        dungeonsTotal: dungProg.total,
        dungeonsComplete,
        complete: islandsComplete && dungeonsComplete
      };
      this._biomeProgCache.set(biomeId, res);
      return res;
    }

    getBiomeLockStatus(game, gx, gy) {
      if (!game || !game.world || !Array.isArray(game.world.plotBiomes)) {
        return {
          lockedByBiome: false, blockingBiomeId: null, blockingBiomeName: null,
          unlocked: 0, total: 0, remaining: 0,
          dungeonsDone: 0, dungeonsTotal: 0, dungeonsRemaining: 0,
          missingIslands: false, missingDungeons: false
        };
      }
      const targetBiome = game.world.plotBiomes[gy] && game.world.plotBiomes[gy][gx];
      if (!targetBiome) {
        return {
          lockedByBiome: false, blockingBiomeId: null, blockingBiomeName: null,
          unlocked: 0, total: 0, remaining: 0,
          dungeonsDone: 0, dungeonsTotal: 0, dungeonsRemaining: 0,
          missingIslands: false, missingDungeons: false
        };
      }
      this._ensureBiomeCache(game);
      if (this._biomeLockByBiomeCache.has(targetBiome)) {
        return this._biomeLockByBiomeCache.get(targetBiome);
      }
      const order = this.getBiomeProgressionOrder(game);
      const targetIdx = order.indexOf(targetBiome);
      const targetProg = this.getBiomeUnlockProgress(game, targetBiome);
      if (targetIdx > 0) {
        for (let i = 0; i < targetIdx; i++) {
          const prevBiome = order[i];
          const prog = this.getBiomeUnlockProgress(game, prevBiome);
          if (!prog.complete) {
            const lockedRes = {
              lockedByBiome: true,
              targetBiomeId: targetBiome,
              blockingBiomeId: prevBiome,
              blockingBiomeName: prog.biomeName,
              unlocked: prog.unlocked,
              total: prog.total,
              remaining: Math.max(0, prog.total - prog.unlocked),
              dungeonsDone: prog.dungeonsDone,
              dungeonsTotal: prog.dungeonsTotal,
              dungeonsRemaining: Math.max(0, prog.dungeonsTotal - prog.dungeonsDone),
              missingIslands: !prog.islandsComplete,
              missingDungeons: !prog.dungeonsComplete
            };
            this._biomeLockByBiomeCache.set(targetBiome, lockedRes);
            return lockedRes;
          }
        }
      }
      const openRes = {
        lockedByBiome: false,
        targetBiomeId: targetBiome,
        blockingBiomeId: null,
        blockingBiomeName: null,
        unlocked: targetProg.unlocked,
        total: targetProg.total,
        remaining: Math.max(0, targetProg.total - targetProg.unlocked),
        dungeonsDone: targetProg.dungeonsDone,
        dungeonsTotal: targetProg.dungeonsTotal,
        dungeonsRemaining: Math.max(0, targetProg.dungeonsTotal - targetProg.dungeonsDone),
        missingIslands: !targetProg.islandsComplete,
        missingDungeons: !targetProg.dungeonsComplete
      };
      this._biomeLockByBiomeCache.set(targetBiome, openRes);
      return openRes;
    }

    isPlotAdjacentlyReachable(game, gx, gy) {
      if (!game || !game.world || typeof game.world.isPlotUnlocked !== 'function') return false;
      if (game.world.isPlotUnlocked(gx, gy)) return false;

      const hasUnlockedNeighbor = (px, py) => {
        return game.world.isPlotUnlocked(px - 1, py) ||
               game.world.isPlotUnlocked(px + 1, py) ||
               game.world.isPlotUnlocked(px, py - 1) ||
               game.world.isPlotUnlocked(px, py + 1);
      };

      if (hasUnlockedNeighbor(gx, gy)) return true;
      // Fallback anti-softlock: if this plot belongs to the currently active biome and no locked plot of this biome has an unlocked neighbor yet
      const lockStatus = this.getBiomeLockStatus(game, gx, gy);
      if (lockStatus.lockedByBiome) return false;
      const targetBiome = game.world.plotBiomes[gy] && game.world.plotBiomes[gy][gx];
      const gridN = game.world.plotBiomes.length || 19;
      for (let py = 0; py < gridN; py++) {
        for (let px = 0; px < gridN; px++) {
          if (game.world.plotBiomes[py][px] !== targetBiome) continue;
          if (game.world.isPlotUnlocked(px, py)) continue;
          if (hasUnlockedNeighbor(px, py)) return false;
        }
      }
      return true;
    }

    buyPlot(game, gx, gy) {
      if (game.world.isPlotUnlocked(gx, gy)) return false;
      const isEn = Abyssea.I18n && Abyssea.I18n.getLanguage && Abyssea.I18n.getLanguage() === 'en';
      const T = (k, v) => (Abyssea.I18n ? Abyssea.I18n.t(k, v) : k);
      const biomeLock = this.getBiomeLockStatus(game, gx, gy);
      if (biomeLock.lockedByBiome) {
        const targetBiomeId = game.world.plotBiomes[gy][gx];
        const targetBiomeName = (Abyssea.CONST.BIOMES[targetBiomeId] && Abyssea.CONST.BIOMES[targetBiomeId].name) || targetBiomeId;
        const msg = isEn
          ? `Complete ${biomeLock.blockingBiomeName} (Islands ${biomeLock.unlocked}/${biomeLock.total} · Dungeons ${biomeLock.dungeonsDone}/${biomeLock.dungeonsTotal}) before unlocking ${targetBiomeName}.`
          : `Completa ${biomeLock.blockingBiomeName} (Islas ${biomeLock.unlocked}/${biomeLock.total} · Mazmorras ${biomeLock.dungeonsDone}/${biomeLock.dungeonsTotal}) antes de desbloquear ${targetBiomeName}.`;
        if (game.toast) game.toast(msg, 'warn');
        if (game.addFloatingText && game.player) {
          game.addFloatingText(game.player.x, game.player.y - 28, `${biomeLock.blockingBiomeName}: ${biomeLock.unlocked}/${biomeLock.total} · ${biomeLock.dungeonsDone}/${biomeLock.dungeonsTotal}`, '#ff8a80');
        }
        if (Abyssea.Audio) Abyssea.Audio.play('error');
        return false;
      }
      if (!this.isPlotAdjacentlyReachable(game, gx, gy)) {
        const msg = isEn ? 'You must unlock an adjacent plot first.' : 'Debes desbloquear una parcela adyacente primero.';
        if (game.toast) game.toast(msg, 'warn');
        if (Abyssea.Audio) Abyssea.Audio.play('error');
        return false;
      }
      const price = this.getPlotPrice(game, gx, gy);
      if (game.coins < price) {
        game.toast(T('toast.needCoinsForPlot', { price }), 'warn');
        if (game.addFloatingText && game.player) {
          game.addFloatingText(game.player.x, game.player.y - 28, T('toast.notEnoughCoins'), '#ff5252');
        }
        Abyssea.Audio.play('error');
        return false;
      }
      game.coins -= price;
      game.world.unlockPlot(gx, gy, false);
      game.unlockedPlots.push([gx, gy]);
      this.invalidateBiomeCache();
      if (!Array.isArray(game.plotUnlockAnims)) game.plotUnlockAnims = [];
      game.plotUnlockAnims.push({ gx, gy, t: 0, dur: 0.48 });
      const plotPx = (Abyssea.CONST.PLOT_TILES || 12) * (Abyssea.CONST.TILE_SIZE || 48);
      const pcx = gx * plotPx + plotPx * 0.5;
      const pcy = gy * plotPx + plotPx * 0.5;
      game.spawnParticles(pcx, pcy, '#80deea', 26);
      game.spawnParticles(pcx, pcy, '#ffd54f', 16);
      game.gainXp(25);
      Abyssea.Audio.play('levelup');
      const curBiomeId = game.world.plotBiomes[gy][gx];
      const biomeName = (Abyssea.CONST.BIOMES[curBiomeId] && Abyssea.CONST.BIOMES[curBiomeId].name) || curBiomeId;
      const afterProg = this.getBiomeUnlockProgress(game, curBiomeId);
      const order = this.getBiomeProgressionOrder(game);
      const nextBiomeId = order[order.indexOf(curBiomeId) + 1];
      const nextBiomeName = nextBiomeId && Abyssea.CONST.BIOMES[nextBiomeId] ? Abyssea.CONST.BIOMES[nextBiomeId].name : null;
      if (afterProg.complete && nextBiomeName) {
        game.toast(
          isEn
            ? `${biomeName} completed (${afterProg.unlocked}/${afterProg.total} islands · ${afterProg.dungeonsDone}/${afterProg.dungeonsTotal} dungeons)! ${nextBiomeName} is now unlocked!`
            : `¡${biomeName} completado (${afterProg.unlocked}/${afterProg.total} islas · ${afterProg.dungeonsDone}/${afterProg.dungeonsTotal} mazmorras)! ¡Ya puedes desbloquear islas de ${nextBiomeName}!`,
          'success'
        );
      } else if (afterProg.islandsComplete && !afterProg.dungeonsComplete && nextBiomeName) {
        game.toast(
          isEn
            ? `All ${biomeName} islands unlocked (${afterProg.unlocked}/${afterProg.total})! Clear all biome dungeons (${afterProg.dungeonsDone}/${afterProg.dungeonsTotal}) to unlock ${nextBiomeName}.`
            : `¡Todas las islas de ${biomeName} compradas (${afterProg.unlocked}/${afterProg.total})! Completa todas sus mazmorras (${afterProg.dungeonsDone}/${afterProg.dungeonsTotal}) para desbloquear ${nextBiomeName}.`,
          'info'
        );
      } else {
        game.toast(
          isEn
            ? `Plot unlocked in ${biomeName} (${afterProg.unlocked}/${afterProg.total} islands)!`
            : `¡Nueva parcela desbloqueada en ${biomeName} (${afterProg.unlocked}/${afterProg.total} islas)!`,
          'success'
        );
      }
      return true;
    }
  }

  Abyssea.EconomySystem = EconomySystem;
})();
