(function () {
  'use strict';

  const Abyssea = (window.Abyssea = window.Abyssea || {});
  const SAVE_PREFIX = 'abyssea_save_slot_';
  // Keep in sync with UI_SCALES in ui.js (0.75 = 75%, 1 = 100%, 1.25 = 125%, 1.5 = 150%)
  const UI_SCALE_PRESETS = [0.75, 1, 1.25, 1.5];

  class SaveSystem {
    getSlotKey(slot = 1) {
      return SAVE_PREFIX + slot;
    }

    hasSave(slot = 1) {
      try {
        return !!localStorage.getItem(this.getSlotKey(slot));
      } catch {
        return false;
      }
    }

    deleteSlot(slot = 1) {
      try {
        localStorage.removeItem(this.getSlotKey(slot));
        return true;
      } catch {
        return false;
      }
    }

    getSlotSummary(slot = 1) {
      try {
        const raw = localStorage.getItem(this.getSlotKey(slot));
        if (!raw) return null;
        const data = JSON.parse(raw);
        return {
          slot,
          savedAt: data.savedAt || '',
          savedAtTs: Number(data.savedAtTs) || 0,
          savedSeq: Number(data.savedSeq) || 0,
          level: data.player ? data.player.level : 1,
          coins: data.coins || 0,
          plots: data.unlockedPlots ? data.unlockedPlots.length : 1,
          dungeons: data.clearedDungeons ? data.clearedDungeons.length : 0
        };
      } catch {
        return null;
      }
    }

    serialize(game) {
      SaveSystem._saveCounter = (SaveSystem._saveCounter || 0) + 1;
      // Never persist dungeon-space coordinates: they are meaningless in the overworld.
      // While inside a dungeon we store the overworld gate position instead, so a
      // mid-run reload (autosave / pause save) never drops the hero on a blocked or
      // water tile with no way out.
      const dungeon = game.activeDungeon || null;
      const aquarium = game.activeAquarium || null;
      const playerSnapshot = { ...game.player };
      if (dungeon || aquarium) {
        const rp = (dungeon ? dungeon.returnPos : aquarium.returnPos) || {};
        if (Number.isFinite(rp.x) && Number.isFinite(rp.y)) {
          playerSnapshot.x = rp.x;
          playerSnapshot.y = rp.y;
        }
        playerSnapshot.dashTimer = 0;
        playerSnapshot.invuln = 0;
      }
      const gridN = Abyssea.CONST.GRID_PLOTS || 19;
      const centerPlot = Abyssea.CONST.CENTER_PLOT !== undefined ? Abyssea.CONST.CENTER_PLOT : 9;
      return {
        version: 3,
        gridPlots: gridN,
        centerPlot: centerPlot,
        savedAt: new Date().toLocaleString('es-ES'),
        savedAtTs: Date.now(),
        savedSeq: SaveSystem._saveCounter,
        inDungeon: !!dungeon,
        dungeonId: dungeon ? dungeon.id : null,
        player: playerSnapshot,
        coins: game.coins,
        dayTime: game.dayTime,
        dayCount: game.dayCount,
        dayDuration: game.dayDuration || 660,
        inventory: { ...game.inventory },
        backpackTier: game.backpackTier || 0,
        hotbar: [...game.hotbar],
        activeSlot: game.activeSlot,
        toolTiers: { ...game.toolTiers },
        toolRarities: { ...(game.toolRarities || {}) },
        weaponRarities: { ...(game.weaponRarities || {}) },
        aquariumExhibits: Array.isArray(game.aquariumExhibits) ? [...game.aquariumExhibits] : [],
        claimedLegacyTiers: { ...(game.claimedLegacyTiers || {}) },
        activeLegacyTitle: game.activeLegacyTitle || null,
        masteredPotions: { ...(game.masteredPotions || {}) },
        // Beta 2.0.0 RC2 persistence
        unlockedPets: Array.isArray(game.unlockedPets) ? [...game.unlockedPets] : [],
        activePet: game.activePet || null,
        trophyExhibits: Array.isArray(game.trophyExhibits) ? [...game.trophyExhibits] : [],
        claimedWeeklyChallenges: Array.isArray(game.claimedWeeklyChallenges) ? [...game.claimedWeeklyChallenges] : [],
        seenV2Hints: { ...(game.seenV2Hints || {}) },
        hanaCosmetic: game.hanaCosmetic || 'none',
        unlockedCosmetics: Array.isArray(game.unlockedCosmetics) ? [...game.unlockedCosmetics] : [],
        preserveRarityMode: !!game.preserveRarityMode,
        armorTiers: { ...(game.armorTiers || {}) },
        equipped: { ...game.equipped },
        toolEnchants: JSON.parse(JSON.stringify(game.toolEnchants || {})),
        armorEnchants: JSON.parse(JSON.stringify(game.armorEnchants || {})),
        permanentRelics: [...(game.permanentRelics || [])],
        unlockedSpells: [...(game.unlockedSpells || ['misil_arcano'])],
        spellSlots: [...(game.spellSlots || ['misil_arcano', null, null, null])],
        spellLevels: { ...(game.spellLevels || {}) },
        spellCooldowns: Object.fromEntries(
          Object.entries(game.spellCooldowns || {})
            .filter(([, rem]) => typeof rem === 'number' && rem > 0.05)
            .map(([sid, rem]) => [sid, Number(rem.toFixed(2))])
        ),
        unlockedPlots: game.unlockedPlots.map(p => [...p]),
        unlockedSkills: [...game.unlockedSkills],
        storyIndex: game.storyIndex,
        npcQuestProgress: { ...game.npcQuestProgress },
        claimedContracts: [...(game.claimedContracts || [])],
        clearedDungeons: [...game.clearedDungeons],
        corruptedClearedDungeons: [...(game.corruptedClearedDungeons || [])],
        dailySchedule: (game.events && game.events.dailySchedule) ? { ...game.events.dailySchedule } : null,
        activeEvent: (game.events && game.events.activeEvent) ? { ...game.events.activeEvent } : null,
        dungeonIntroSeen: !!game.dungeonIntroSeen,
        unlockedAchievements: [...game.unlockedAchievements],
        encyclopedia: {
          items: [...game.encyclopedia.items],
          enemies: [...game.encyclopedia.enemies],
          buildings: [...game.encyclopedia.buildings],
          relics: [...(game.encyclopedia.relics || [])],
          enchants: [...(game.encyclopedia.enchants || [])],
          altars: [...(game.encyclopedia.altars || [])]
        },
        stats: Abyssea.Utils.deepClone(game.stats),
        nextBuildingId: Number(game.nextBuildingId) || 1,
        activeBuffs: game.activeBuffs ? JSON.parse(JSON.stringify(game.activeBuffs)) : {},
        v2Persist: game.v2Runtime ? {
          villagerContractDay: Number(game.v2Runtime.villagerContractDay) || 0,
          _lastPulseDay: Number(game.v2Runtime._lastPulseDay) || 0,
          weeklyResetWeek: Number(game.v2Runtime.weeklyResetWeek) || 0
        } : null,
        buildings: game.buildings.map(b => ({
          id: b.id, type: b.type, tx: b.tx, ty: b.ty, level: b.level,
          timer: b.timer, fuel: b.fuel, coinsStored: b.coinsStored,
          storage: { ...b.storage }, autoRefuel: b.autoRefuel, autoPull: b.autoPull,
          isChest: b.isChest ? true : undefined,
          queue: b.queue ? [...b.queue] : [],
          filters: (b.type === 'cofre_logistico' && Array.isArray(b.filters)) ? [...b.filters] : undefined,
          baitSlot: b.baitSlot ? { ...b.baitSlot } : undefined,
          breedFish: b.breedFish || undefined,
          omega: b.omega ? JSON.parse(JSON.stringify(b.omega)) : undefined
        })),
        omega: game.omega ? game.omega.serialize() : null,
        worldSeed: game.world.worldSeed,
        plotBiomes: game.world.plotBiomes ? game.world.plotBiomes.map(r => [...r]) : null,
        plotElevation: game.world.plotElevation ? game.world.plotElevation.map(r => [...r]) : null,
        dungeonGatePlots: game.world.dungeonGatePlots ? { ...game.world.dungeonGatePlots } : null,
        altarPlots: game.world.altarPlots ? { ...game.world.altarPlots } : null,
        easterEggPlots: game.world.easterEggPlots ? { ...game.world.easterEggPlots } : null,
        secretChestPlots: game.world.secretChestPlots ? { ...game.world.secretChestPlots } : null,
        skeletonKingPlot: game.world.skeletonKingPlot ? [...game.world.skeletonKingPlot] : null,
        npcPlots: game.world.npcPlots ? { ...game.world.npcPlots } : null,
        npcOffsets: game.world.npcOffsets ? { ...game.world.npcOffsets } : null,
        terraformedTiles: Array.isArray(game.world.terraformedTiles) ? game.world.terraformedTiles.map(p => [...p]) : [],
        fertilizedTiles: (game.world && game.world.fertilizedTiles) ? JSON.parse(JSON.stringify(game.world.fertilizedTiles)) : {},
        worldTilesOverrides: this.extractModifiedTiles(game.world),
        nodes: game.world.nodes.map(n => ({ ...n })),
        crops: game.world.crops.map(c => ({ ...c })),
        sheep: game.world.sheep.map(s => ({ ...s })),
        dailyChallenges: game.events.dailyChallenges.map(c => ({ ...c })),
        craftQueue: Array.isArray(game.craftQueue) ? game.craftQueue.map(q => ({ ...q })) : [],
        craftReady: Array.isArray(game.craftReady) ? game.craftReady.map(r => ({ ...r })) : [],
        drops: Array.isArray((game.activeDungeon && Array.isArray(game._savedOverworldDrops)) ? game._savedOverworldDrops : game.drops)
          ? ((game.activeDungeon && Array.isArray(game._savedOverworldDrops)) ? game._savedOverworldDrops : game.drops).slice(0, 3000).map(d => ({
              x: Math.round(d.x),
              y: Math.round(d.y),
              itemId: d.itemId,
              qty: d.qty
            }))
          : [],
        inventoryOverflowMigrated: !!game.inventoryOverflowMigrated,
        market: game.economy ? {
          stock: (game.economy.marketStock || []).slice(0, 5),
          sellContracts: (game.economy.sellContracts || []).slice(0, 5),
          refreshTimer: game.economy.refreshTimer || 900,
          manualRefreshesUsed: game.economy.manualRefreshesUsed || 0
        } : null,
        tutorial: (game.tutorialSys || game.tutorial) ? {
          step: (game.tutorialSys || game.tutorial).step || 0,
          done: !!(game.tutorialSys || game.tutorial).done,
          skipped: !!(game.tutorialSys || game.tutorial).skipped,
          rewardClaimed: !!(game.tutorialSys || game.tutorial).rewardClaimed
        } : null,
        settings: { ...(game.settings || {}) }
      };
    }

    extractModifiedTiles(world) {
      const mods = [];
      for (let y = 0; y < world.tiles.length; y++) {
        for (let x = 0; x < world.tiles[y].length; x++) {
          const v = world.tiles[y][x];
          if (v === 2 || v === 3) {
            mods.push([x, y, v]);
          }
        }
      }
      return mods;
    }

    save(game, slot = 1, silent = true) {
      try {
        const data = this.serialize(game);
        localStorage.setItem(this.getSlotKey(slot), JSON.stringify(data));
        localStorage.setItem('abyssea_last_slot', String(slot));
        if (!silent) {
          Abyssea.Audio.play('craft');
          const tr = (Abyssea.I18n && Abyssea.I18n.t) ? Abyssea.I18n.t : null;
          game.toast(tr ? tr('hud.saveToast', { slot }) : `Game saved to Slot ${slot}.`, 'success');
        }
        return true;
      } catch (err) {
        if (!silent) {
          const tr = (Abyssea.I18n && Abyssea.I18n.t) ? Abyssea.I18n.t : null;
          game.toast(tr ? tr('toast.saveError') : 'Failed to save to local storage.', 'warn');
        }
        return false;
      }
    }

    load(game, slot = 1) {
      try {
        const raw = localStorage.getItem(this.getSlotKey(slot));
        if (!raw) return false;
        const data = JSON.parse(raw);
        const migratedOrRescued = this.applySaveData(game, data);
        game.currentSlot = slot;
        localStorage.setItem('abyssea_last_slot', String(slot));
        if (migratedOrRescued) {
          // Immediately persist the rescued/migrated v3 layout so future loads never re-migrate
          this.save(game, slot, true);
        }
        const tr = (Abyssea.I18n && Abyssea.I18n.t) ? Abyssea.I18n.t : null;
        game.toast(tr ? tr('toast.saveLoaded', { slot }) : `Game loaded (Slot ${slot}).`, 'success');
        if (Abyssea.actualizarDiscord) Abyssea.actualizarDiscord(true);
        return true;
      } catch (err) {
        if (typeof console !== 'undefined' && console.warn) {
          console.warn('[SaveSystem] Failed to load slot ' + slot, err);
        }
        return false;
      }
    }

    _shiftOmegaPlotMap(obj, dxPlots, dyPlots, gridN, mergeFn) {
      if (!obj || typeof obj !== 'object') return obj;
      const out = {};
      for (const [k, val] of Object.entries(obj)) {
        const m = /^(-?\d+),(-?\d+)$/.exec(k);
        if (!m) {
          out[k] = val;
          continue;
        }
        const ngx = Number(m[1]) + dxPlots;
        const ngy = Number(m[2]) + dyPlots;
        if (ngx < 0 || ngy < 0 || ngx >= gridN || ngy >= gridN) continue;
        const nk = `${ngx},${ngy}`;
        out[nk] = (out[nk] !== undefined && typeof mergeFn === 'function')
          ? mergeFn(out[nk], val)
          : val;
      }
      return out;
    }

    _mergeOmegaNexus(a, b) {
      if (!a) return b;
      if (!b) return a;
      const mergedItems = { ...(a.items || {}) };
      for (const [id, q] of Object.entries(b.items || {})) {
        if (q > 0) mergedItems[id] = (mergedItems[id] || 0) + q;
      }
      return {
        ...a,
        items: mergedItems,
        energy: (Number(a.energy) || 0) + (Number(b.energy) || 0),
        level: Math.max(Number(a.level) || 1, Number(b.level) || 1),
        stat: a.stat || b.stat || { in: {}, out: {}, lastProd: 0, lastCons: 0, lastDeficit: 0 }
      };
    }

    _shiftSaveCoords(data, dxPlots, dyPlots, plotTiles, tileSize, gridN, opts = null) {
      if (!data || (dxPlots === 0 && dyPlots === 0)) return;
      const dtX = dxPlots * plotTiles;
      const dtY = dyPlots * plotTiles;
      const dpxX = dtX * tileSize;
      const dpxY = dtY * tileSize;
      const filterLandmarks = Boolean(opts && opts.filterLandmarks);
      const shiftPlayer = !opts || opts.shiftPlayer !== false;
      const shiftPlots = !opts || opts.shiftPlots !== false;
      const shiftNodes = !opts || opts.shiftNodes !== false;
      const shiftSheep = !opts || opts.shiftSheep !== false;

      if (shiftPlayer && data.player) {
        if (Number.isFinite(data.player.x)) data.player.x += dpxX;
        if (Number.isFinite(data.player.y)) data.player.y += dpxY;
      }
      if (shiftPlots && Array.isArray(data.unlockedPlots)) {
        const seen = new Set();
        const shifted = [];
        for (const entry of data.unlockedPlots) {
          if (!Array.isArray(entry) || entry.length < 2) continue;
          const nx = Number(entry[0]) + dxPlots;
          const ny = Number(entry[1]) + dyPlots;
          if (!Number.isFinite(nx) || !Number.isFinite(ny) || nx < 0 || ny < 0 || nx >= gridN || ny >= gridN) continue;
          const key = `${nx},${ny}`;
          if (seen.has(key)) continue;
          seen.add(key);
          shifted.push([nx, ny]);
        }
        data.unlockedPlots = shifted;
      }
      if (Array.isArray(data.terraformedTiles)) {
        data.terraformedTiles = data.terraformedTiles
          .filter(p => Array.isArray(p) && p.length >= 2)
          .map(([tx, ty]) => [tx + dtX, ty + dtY])
          .filter(([tx, ty]) => tx >= 0 && ty >= 0 && tx < gridN * plotTiles && ty < gridN * plotTiles);
      }
      if (Array.isArray(data.worldTilesOverrides)) {
        data.worldTilesOverrides = data.worldTilesOverrides
          .filter(p => Array.isArray(p) && p.length >= 3)
          .map(([tx, ty, v]) => [tx + dtX, ty + dtY, v])
          .filter(([tx, ty]) => tx >= 0 && ty >= 0 && tx < gridN * plotTiles && ty < gridN * plotTiles);
      }
      if (shiftNodes && Array.isArray(data.nodes)) {
        const landmarkKinds = new Set(['dungeon_gate', 'altar_shrine', 'easter_egg', 'secret_chest', 'puzzle_pillar', 'skeleton_king_shrine', 'bone_totem']);
        data.nodes = data.nodes
          .filter(n => n && (!filterLandmarks || !landmarkKinds.has(n.kind)))
          .map(n => ({
            ...n,
            tx: (Number(n.tx) || 0) + dtX,
            ty: (Number(n.ty) || 0) + dtY,
            x: Number.isFinite(n.x) ? n.x + dpxX : ((Number(n.tx) || 0) + dtX + 0.5) * tileSize,
            y: Number.isFinite(n.y) ? n.y + dpxY : ((Number(n.ty) || 0) + dtY + 0.5) * tileSize
          }))
          .filter(n => n.tx >= 0 && n.ty >= 0 && n.tx < gridN * plotTiles && n.ty < gridN * plotTiles);
      }
      if (Array.isArray(data.crops)) {
        data.crops = data.crops
          .filter(c => c && Number.isFinite(c.tx) && Number.isFinite(c.ty))
          .map(c => ({ ...c, tx: c.tx + dtX, ty: c.ty + dtY }))
          .filter(c => c.tx >= 0 && c.ty >= 0 && c.tx < gridN * plotTiles && c.ty < gridN * plotTiles);
      }
      if (shiftSheep && Array.isArray(data.sheep)) {
        data.sheep = data.sheep
          .filter(s => s)
          .map(s => ({ ...s, x: (Number(s.x) || 0) + dpxX, y: (Number(s.y) || 0) + dpxY }));
      }
      if (Array.isArray(data.buildings)) {
        data.buildings = data.buildings
          .filter(b => b)
          .map(b => ({
            ...b,
            tx: Number.isFinite(b.tx) ? b.tx + dtX : b.tx,
            ty: Number.isFinite(b.ty) ? b.ty + dtY : b.ty,
            x: Number.isFinite(b.x) ? b.x + dpxX : b.x,
            y: Number.isFinite(b.y) ? b.y + dpxY : b.y
          }));
      }
      if (Array.isArray(data.drops)) {
        data.drops = data.drops
          .filter(d => d)
          .map(d => ({ ...d, x: (Number(d.x) || 0) + dpxX, y: (Number(d.y) || 0) + dpxY }));
      }
      if (data.omega && typeof data.omega === 'object') {
        if (data.omega.nexus && typeof data.omega.nexus === 'object') {
          data.omega.nexus = this._shiftOmegaPlotMap(
            data.omega.nexus,
            dxPlots,
            dyPlots,
            gridN,
            (a, b) => this._mergeOmegaNexus(a, b)
          );
        }
        if (data.omega.ascension && typeof data.omega.ascension === 'object') {
          data.omega.ascension = this._shiftOmegaPlotMap(
            data.omega.ascension,
            dxPlots,
            dyPlots,
            gridN,
            (a, b) => Math.max(Number(a) || 0, Number(b) || 0)
          );
        }
      }
    }

    _getPrimaryBasePlot(buildings, crops, plotTiles) {
      const counts = new Map();
      const bump = (tx, ty, weight) => {
        if (!Number.isFinite(tx) || !Number.isFinite(ty)) return;
        const gx = Math.floor(tx / plotTiles);
        const gy = Math.floor(ty / plotTiles);
        const k = `${gx},${gy}`;
        counts.set(k, (counts.get(k) || 0) + weight);
      };
      for (const b of (buildings || [])) if (b) bump(b.tx, b.ty, 3);
      for (const c of (crops || [])) if (c) bump(c.tx, c.ty, 1);
      let bestKey = null, bestScore = -1;
      for (const [k, sc] of counts.entries()) {
        if (sc > bestScore) { bestScore = sc; bestKey = k; }
      }
      if (!bestKey) return null;
      const [gx, gy] = bestKey.split(',').map(Number);
      return [gx, gy];
    }

    applySaveData(game, rawData) {
      let data = rawData ? JSON.parse(JSON.stringify(rawData)) : {};
      const gridN = Abyssea.CONST.GRID_PLOTS || 19;
      const centerPlot = Abyssea.CONST.CENTER_PLOT !== undefined ? Abyssea.CONST.CENTER_PLOT : 9;
      const plotTiles = Abyssea.CONST.PLOT_TILES || 12;
      const tileSize = Abyssea.CONST.TILE_SIZE || 48;
      const saveVer = Number(data.version) || 1;
      const savedGridPlots = Number.isFinite(data.gridPlots) && data.gridPlots > 0
        ? data.gridPlots
        : ((Array.isArray(data.plotBiomes) && data.plotBiomes.length > 0) ? data.plotBiomes.length : null);
      const isAlreadyV3Current = saveVer >= 3 && savedGridPlots === gridN && data.centerPlot === centerPlot;

      // 1. Legacy smaller-grid migration (v1 / 10x10 or any gridN < current 19x19)
      const isSmallerGrid = savedGridPlots !== null && savedGridPlots < gridN;
      const isLegacyV1 = !isAlreadyV3Current && (saveVer < 2 || isSmallerGrid);
      let didMigrateOrRescue = false;

      if (isLegacyV1) {
        const oldGrid = isSmallerGrid ? savedGridPlots : 10;
        const oldCenter = Number.isFinite(data.centerPlot)
          ? data.centerPlot
          : (oldGrid === 10 ? 4 : Math.floor((oldGrid - 1) / 2));
        // Safety guard: if save already has 19x19 plotBiomes and coordinates already live around centerPlot, do not double-shift
        const hasCenterPlot = Array.isArray(data.unlockedPlots) && data.unlockedPlots.some(p => Array.isArray(p) && p[0] === centerPlot && p[1] === centerPlot);
        const primaryPlot = this._getPrimaryBasePlot(data.buildings, data.crops, plotTiles);
        const alreadyCentered = savedGridPlots === gridN && hasCenterPlot && (!primaryPlot || (Math.abs(primaryPlot[0] - centerPlot) <= 2 && Math.abs(primaryPlot[1] - centerPlot) <= 2));
        if (!alreadyCentered) {
          const pShift = centerPlot - oldCenter;
          if (pShift !== 0) {
            this._shiftSaveCoords(data, pShift, pShift, plotTiles, tileSize, gridN, { filterLandmarks: true });
            data._migratedFromV1 = true;
            didMigrateOrRescue = true;
          }
        }
      }

      // 2. Post-1.3.3 Corner-Stranded Save Rescue:
      // Handles players who previously upgraded to v1.3.x and had their base/crops/drops stranded on a locked
      // corner plot (e.g. (4,4) unshifted or (14,14) double-shifted) or inside a disconnected corner island cluster.
      if (!data._migratedFromV1) {
        const unlockedList = Array.isArray(data.unlockedPlots)
          ? data.unlockedPlots.filter(p => Array.isArray(p) && p.length >= 2 && p[0] >= 0 && p[0] < gridN && p[1] >= 0 && p[1] < gridN)
          : [];
        const unlockedSet = new Set(unlockedList.map(([gx, gy]) => `${gx},${gy}`));
        const bList = Array.isArray(data.buildings) ? data.buildings.filter(b => b && Number.isFinite(b.tx) && Number.isFinite(b.ty)) : [];
        const cList = Array.isArray(data.crops) ? data.crops.filter(c => c && Number.isFinite(c.tx) && Number.isFinite(c.ty)) : [];
        const centerKey = `${centerPlot},${centerPlot}`;
        const centerHasBuildings = bList.some(b => Math.floor(b.tx / plotTiles) === centerPlot && Math.floor(b.ty / plotTiles) === centerPlot);
        const centerHasCrops = cList.some(c => Math.floor(c.tx / plotTiles) === centerPlot && Math.floor(c.ty / plotTiles) === centerPlot);

        // Case 2A: Player buildings/crops sit on LOCKED plots while center (9,9) has no buildings/crops
        const lockedBuildings = bList.filter(b => !unlockedSet.has(`${Math.floor(b.tx / plotTiles)},${Math.floor(b.ty / plotTiles)}`));
        const lockedCrops = cList.filter(c => !unlockedSet.has(`${Math.floor(c.tx / plotTiles)},${Math.floor(c.ty / plotTiles)}`));
        const totalOwned = bList.length + cList.length;
        const lockedOwned = lockedBuildings.length + lockedCrops.length;

        if (totalOwned > 0 && lockedOwned > 0 && !centerHasBuildings && !centerHasCrops && (lockedOwned / totalOwned) >= 0.75) {
          const anchor = this._getPrimaryBasePlot(lockedBuildings.length ? lockedBuildings : bList, lockedCrops.length ? lockedCrops : cList, plotTiles);
          if (anchor) {
            const dxPlots = centerPlot - anchor[0];
            const dyPlots = centerPlot - anchor[1];
            const allFit = bList.every(b => {
              const ngx = Math.floor(b.tx / plotTiles) + dxPlots;
              const ngy = Math.floor(b.ty / plotTiles) + dyPlots;
              return ngx >= 0 && ngy >= 0 && ngx < gridN && ngy < gridN;
            }) && cList.every(c => {
              const ngx = Math.floor(c.tx / plotTiles) + dxPlots;
              const ngy = Math.floor(c.ty / plotTiles) + dyPlots;
              return ngx >= 0 && ngy >= 0 && ngx < gridN && ngy < gridN;
            });
            if ((dxPlots !== 0 || dyPlots !== 0) && allFit) {
              // Check if player was also sitting near the stranded base
              const pGx = data.player && Number.isFinite(data.player.x) ? Math.floor(data.player.x / (plotTiles * tileSize)) : centerPlot;
              const pGy = data.player && Number.isFinite(data.player.y) ? Math.floor(data.player.y / (plotTiles * tileSize)) : centerPlot;
              const playerNearStranded = Math.hypot(pGx - anchor[0], pGy - anchor[1]) <= 3;
              // Shift buildings/crops/terraformed/overrides/drops/omega (keep unlocked plots centered; unlock any plots that receive buildings below)
              this._shiftSaveCoords(data, dxPlots, dyPlots, plotTiles, tileSize, gridN, {
                filterLandmarks: false,
                shiftPlayer: playerNearStranded,
                shiftPlots: false,
                shiftNodes: false,
                shiftSheep: false
              });
              data._cornerRescued = true;
              didMigrateOrRescue = true;
            }
          }
        } else if (totalOwned > 0 && !centerHasBuildings && !centerHasCrops && unlockedSet.has(centerKey)) {
          // Case 2B: Disconnected corner cluster — unlockedPlots contains an isolated empty [9,9] auto-injected by v1.3.x
          // while ALL player buildings & crops live in a far corner cluster (e.g. around (4,4)) disconnected from (9,9)
          const centerHasAdjUnlocked =
            unlockedSet.has(`${centerPlot + 1},${centerPlot}`) ||
            unlockedSet.has(`${centerPlot - 1},${centerPlot}`) ||
            unlockedSet.has(`${centerPlot},${centerPlot + 1}`) ||
            unlockedSet.has(`${centerPlot},${centerPlot - 1}`);
          if (!centerHasAdjUnlocked) {
            const anchor = this._getPrimaryBasePlot(bList, cList, plotTiles);
            if (anchor && (Math.abs(anchor[0] - centerPlot) >= 3 || Math.abs(anchor[1] - centerPlot) >= 3)) {
              const dxPlots = centerPlot - anchor[0];
              const dyPlots = centerPlot - anchor[1];
              const nonCenterPlots = unlockedList.filter(([gx, gy]) => !(gx === centerPlot && gy === centerPlot));
              const allPlotsFit = nonCenterPlots.length > 0 && nonCenterPlots.every(([gx, gy]) =>
                gx + dxPlots >= 0 && gx + dxPlots < gridN && gy + dyPlots >= 0 && gy + dyPlots < gridN
              );
              if (allPlotsFit) {
                data.unlockedPlots = nonCenterPlots;
                this._shiftSaveCoords(data, dxPlots, dyPlots, plotTiles, tileSize, gridN, { filterLandmarks: true });
                data._migratedFromV1 = true;
                data._cornerRescued = true;
                didMigrateOrRescue = true;
              }
            }
          }
        }
      }

      // 3. Rescue orphaned Omega Nexus / Ascension keys left at old (gx-5, gy-5) corner after an earlier 1.3.x migration
      if (data.omega && typeof data.omega === 'object' && Array.isArray(data.buildings)) {
        const nexusBuildings = data.buildings.filter(b => b && b.type === 'nexo_central' && Number.isFinite(b.tx) && Number.isFinite(b.ty));
        const nexusPlotSet = new Set(nexusBuildings.map(b => `${Math.floor(b.tx / plotTiles)},${Math.floor(b.ty / plotTiles)}`));
        if (data.omega.nexus && typeof data.omega.nexus === 'object') {
          for (const [k, v] of Object.entries({ ...data.omega.nexus })) {
            if (nexusPlotSet.has(k)) continue;
            const hasContent = (v && v.items && Object.keys(v.items).length > 0) || (v && Number(v.energy) > 0);
            if (!hasContent) continue;
            const m = /^(-?\d+),(-?\d+)$/.exec(k);
            if (!m) continue;
            const shiftedKey = `${Number(m[1]) + (centerPlot - 4)},${Number(m[2]) + (centerPlot - 4)}`;
            if (nexusPlotSet.has(shiftedKey)) {
              data.omega.nexus[shiftedKey] = this._mergeOmegaNexus(data.omega.nexus[shiftedKey], v);
              delete data.omega.nexus[k];
              didMigrateOrRescue = true;
            }
          }
        }
        if (data.omega.ascension && typeof data.omega.ascension === 'object') {
          const unlockedSetNow = new Set((data.unlockedPlots || []).filter(p => Array.isArray(p)).map(([gx, gy]) => `${gx},${gy}`));
          for (const [k, rank] of Object.entries({ ...data.omega.ascension })) {
            if (!(rank > 0) || unlockedSetNow.has(k)) continue;
            const m = /^(-?\d+),(-?\d+)$/.exec(k);
            if (!m) continue;
            const shiftedKey = `${Number(m[1]) + (centerPlot - 4)},${Number(m[2]) + (centerPlot - 4)}`;
            if (unlockedSetNow.has(shiftedKey)) {
              data.omega.ascension[shiftedKey] = Math.max(Number(data.omega.ascension[shiftedKey]) || 0, Number(rank) || 0);
              delete data.omega.ascension[k];
              didMigrateOrRescue = true;
            }
          }
        }
      }

      // Remap legacy pre-Abyssea item IDs seamlessly so no endgame relic or armor is ever lost
      const legacyItemMap = {
        ['nucleo_' + 'balaclava']: 'nucleo_abyssea',
        ['casco_' + 'balaclava']: 'casco_abyssea'
      };
      const remapBag = (bag) => {
        if (!bag || typeof bag !== 'object') return;
        for (const [oldId, newId] of Object.entries(legacyItemMap)) {
          if (bag[oldId] !== undefined) {
            bag[newId] = (Number(bag[newId]) || 0) + (Number(bag[oldId]) || 0);
            delete bag[oldId];
          }
        }
      };
      remapBag(data.inventory);
      if (data.equipped && typeof data.equipped === 'object') {
        for (const slot of Object.keys(data.equipped)) {
          if (legacyItemMap[data.equipped[slot]]) data.equipped[slot] = legacyItemMap[data.equipped[slot]];
        }
      }
      if (data.armorTiers && typeof data.armorTiers === 'object') {
        for (const slot of Object.keys(data.armorTiers)) {
          if (legacyItemMap[data.armorTiers[slot]]) data.armorTiers[slot] = legacyItemMap[data.armorTiers[slot]];
        }
      }
      if (Array.isArray(data.hotbar)) {
        for (const slot of data.hotbar) {
          if (slot && slot.id && legacyItemMap[slot.id]) slot.id = legacyItemMap[slot.id];
        }
      }
      if (Array.isArray(data.buildings)) {
        for (const b of data.buildings) {
          if (b && b.storage) remapBag(b.storage);
        }
      }
      if (Array.isArray(data.drops)) {
        for (const d of data.drops) {
          if (d && d.itemId && legacyItemMap[d.itemId]) d.itemId = legacyItemMap[d.itemId];
        }
      }
      if (data.omega && data.omega.nexus && typeof data.omega.nexus === 'object') {
        for (const nx of Object.values(data.omega.nexus)) {
          if (nx && nx.items) remapBag(nx.items);
        }
      }
      if (data.encyclopedia && Array.isArray(data.encyclopedia.items)) {
        data.encyclopedia.items = data.encyclopedia.items.map(id => legacyItemMap[id] || id);
      }

      game.world.initNewWorld(data.worldSeed || null);
      if (Array.isArray(data.plotBiomes) && data.plotBiomes.length === gridN && !data._migratedFromV1) game.world.plotBiomes = data.plotBiomes;
      if (Array.isArray(data.plotElevation) && data.plotElevation.length === gridN && !data._migratedFromV1) game.world.plotElevation = data.plotElevation;
      if (data.dungeonGatePlots && !data._migratedFromV1) game.world.dungeonGatePlots = data.dungeonGatePlots;
      if (data.altarPlots && !data._migratedFromV1) game.world.altarPlots = data.altarPlots;
      if (data.easterEggPlots && !data._migratedFromV1) game.world.easterEggPlots = data.easterEggPlots;
      if (data.secretChestPlots && !data._migratedFromV1) game.world.secretChestPlots = data.secretChestPlots;
      if (Array.isArray(data.skeletonKingPlot) && !data._migratedFromV1) game.world.skeletonKingPlot = [...data.skeletonKingPlot];
      if (data.npcPlots && !data._migratedFromV1) game.world.npcPlots = data.npcPlots;
      if (data.npcOffsets && !data._migratedFromV1) game.world.npcOffsets = data.npcOffsets;
      game.world.terraformedTiles = Array.isArray(data.terraformedTiles) ? data.terraformedTiles.map(p => [...p]) : [];
      game.unlockedPlots = [];
      const unlockedSeen = new Set();
      const addUnlockedPlot = (gx, gy) => {
        if (!Number.isFinite(gx) || !Number.isFinite(gy) || gx < 0 || gx >= gridN || gy < 0 || gy >= gridN) return;
        const k = `${gx},${gy}`;
        if (unlockedSeen.has(k)) return;
        unlockedSeen.add(k);
        game.world.plotUnlocked[gy][gx] = true;
        game.unlockedPlots.push([gx, gy]);
      };
      if (Array.isArray(data.unlockedPlots)) {
        for (const entry of data.unlockedPlots) {
          if (Array.isArray(entry) && entry.length >= 2) addUnlockedPlot(Number(entry[0]), Number(entry[1]));
        }
      }
      addUnlockedPlot(centerPlot, centerPlot);
      // Guarantee NO player building or crop is EVER left stranded on a locked plot
      if (Array.isArray(data.buildings)) {
        for (const b of data.buildings) {
          if (!b || !Number.isFinite(b.tx) || !Number.isFinite(b.ty)) continue;
          const bgx = Math.floor(b.tx / plotTiles);
          const bgy = Math.floor(b.ty / plotTiles);
          if (!unlockedSeen.has(`${bgx},${bgy}`)) {
            addUnlockedPlot(bgx, bgy);
            didMigrateOrRescue = true;
          }
        }
      }
      if (Array.isArray(data.crops)) {
        for (const c of data.crops) {
          if (!c || !Number.isFinite(c.tx) || !Number.isFinite(c.ty)) continue;
          const cgx = Math.floor(c.tx / plotTiles);
          const cgy = Math.floor(c.ty / plotTiles);
          if (!unlockedSeen.has(`${cgx},${cgy}`)) {
            addUnlockedPlot(cgx, cgy);
            didMigrateOrRescue = true;
          }
        }
      }
      game.world._unlockVersion = (game.world._unlockVersion || 0) + 1;
      game.world._visualBiomeGrid = null;
      game.world._nodeIndexLen = -1;
      if (Array.isArray(data.worldTilesOverrides)) {
        for (const [x, y, v] of data.worldTilesOverrides) {
          if (game.world.tiles[y]) game.world.tiles[y][x] = v;
        }
      }
      if (Array.isArray(game.world.terraformedTiles)) {
        for (const [x, y] of game.world.terraformedTiles) {
          if (game.world.tiles[y]) game.world.tiles[y][x] = 1;
        }
      }
      if (typeof game.world.stitchUnlockedBorders === 'function') {
        game.world.stitchUnlockedBorders();
      }
      if (typeof game.world.ensureNpcLandPads === 'function') {
        game.world.ensureNpcLandPads();
      }
      if (Array.isArray(data.nodes)) game.world.nodes = data.nodes;
      if (data._migratedFromV1) {
        for (const [ugx, ugy] of game.unlockedPlots) {
          const bId = game.world.plotBiomes?.[ugy]?.[ugx] || 'pradera';
          const ox = ugx * plotTiles, oy = ugy * plotTiles;
          const gate = game.world.getDungeonGateForPlot ? game.world.getDungeonGateForPlot(ugx, ugy) : null;
          if (gate && !game.world.nodes.some(n => n.kind === 'dungeon_gate' && n.dungeonId === gate.id)) {
            game.world.tiles[oy + 5][ox + 5] = 1;
            game.world.spawnSpecialNode(ox + 5, oy + 5, 'dungeon_gate', bId, { dungeonId: gate.id, name: gate.name, recLevel: gate.recLevel });
          }
          const aId = game.world.altarPlots && game.world.altarPlots[`${ugx},${ugy}`];
          if (aId && Abyssea.ALTAR_DEFS?.[aId] && !game.world.nodes.some(n => n.kind === 'altar_shrine' && Math.floor(n.tx / plotTiles) === ugx && Math.floor(n.ty / plotTiles) === ugy)) {
            game.world.tiles[oy + 6][ox + 6] = 1;
            game.world.spawnSpecialNode(ox + 6, oy + 6, 'altar_shrine', bId, { altarId: aId, name: Abyssea.ALTAR_DEFS[aId].name, cooldownLeft: 0 });
          }
          const eeId = game.world.easterEggPlots && game.world.easterEggPlots[`${ugx},${ugy}`];
          if (eeId && Abyssea.EASTER_EGG_DEFS?.[eeId] && !game.world.nodes.some(n => n.kind === 'easter_egg' && n.eeId === eeId)) {
            game.world.tiles[oy + 6][ox + 5] = 1;
            game.world.spawnSpecialNode(ox + 6, oy + 5, 'easter_egg', bId, { eeId, name: Abyssea.EASTER_EGG_DEFS[eeId].name, claimed: false });
          }
        }
      }
      if (typeof game.world.normalizeMineralNodeHardness === 'function') {
        game.world.normalizeMineralNodeHardness();
      }
      if (typeof game.world.ensureStructureCenteringAndLandPads === 'function') {
        game.world.ensureStructureCenteringAndLandPads();
      }
      if (Array.isArray(data.crops)) game.world.crops = data.crops;
      if (Array.isArray(data.sheep)) game.world.sheep = data.sheep;
      game.world.fertilizedTiles = (data.fertilizedTiles && typeof data.fertilizedTiles === 'object')
        ? JSON.parse(JSON.stringify(data.fertilizedTiles))
        : {};

      // Clear transient runtime combat/FX/event entities so Slot A never bleeds into Slot B
      if (game.combat) {
        game.combat.enemies = [];
        game.combat.worldHazards = [];
      }
      game.projectiles = [];
      game.enemyProjectiles = [];
      game.thrownBombs = [];
      game.laserBeams = [];
      game.hotHeals = [];
      game.particles = [];
      game.floatingTexts = [];
      game.shockwaves = [];
      game.worldWhirlpools = [];
      game.activeBuffs = (data.activeBuffs && typeof data.activeBuffs === 'object')
        ? JSON.parse(JSON.stringify(data.activeBuffs))
        : {};
      if (game.farming) game.farming.fishing = null;
      if (game.v2Runtime) {
        const vp = data.v2Persist || {};
        game.v2Runtime.ghostShip = null;
        game.v2Runtime.raid = null;
        game.v2Runtime.abyssPulseBoss = null;
        game.v2Runtime.seaBoss = null;
        game.v2Runtime.fireTrails = [];
        game.v2Runtime.relocating = null;
        game.v2Runtime.relocatorActive = false;
        game.v2Runtime.villagerContractDay = Number(vp.villagerContractDay) || 0;
        game.v2Runtime._lastPulseDay = Number(vp._lastPulseDay) || 0;
        game.v2Runtime.weeklyResetWeek = Number(vp.weeklyResetWeek) || 0;
      }

      game.player = { ...game.makeInitialPlayer(), ...data.player, skinId: 'hana' };
      if ((game.player.deadTimer || 0) > 0 || (game.player.hp || 0) <= 0) {
        game.player.deadTimer = 0;
        game.player.hp = Math.max(1, game.player.maxHp || 100);
        game.player.energy = Math.max(1, game.player.maxEnergy || 100);
      }
      game.coins = data.coins || 0;
      game.dayTime = typeof data.dayTime === 'number' ? data.dayTime : 0.035;
      game.dayCount = data.dayCount || 1;
      game.dayDuration = (Number.isFinite(data.dayDuration) && data.dayDuration >= 60) ? data.dayDuration : 660;
      game.inventory = data.inventory || {};
      game.backpackTier = Math.max(0, Number(data.backpackTier) || 0);
      const defaultToolTiers = { pico: 'basica', hacha: 'basica', espada: null, pala: null, cana: null, guadana: null, azada: null, arco: null };
      game.toolTiers = { ...defaultToolTiers, ...(data.toolTiers || {}) };
      game.toolRarities = { ...(data.toolRarities || {}) };
      game.weaponRarities = { ...(data.weaponRarities || {}) };
      game.aquariumExhibits = Array.isArray(data.aquariumExhibits) ? [...data.aquariumExhibits] : new Array(12).fill(null);
      while (game.aquariumExhibits.length < 12) game.aquariumExhibits.push(null);
      game.claimedLegacyTiers = { ...(data.claimedLegacyTiers || {}) };
      game.activeLegacyTitle = data.activeLegacyTitle || null;
      game.masteredPotions = { ...(data.masteredPotions || {}) };
      game.activeAquarium = null;
      if (game.player) {
        game.player.bowLoaded = ((game.inventory && game.inventory.flecha) || 0) > 0;
        game.player.bowReloadTimer = 0;
        game.player.bowNeedsAutoReload = false;
      }
      if (game.toolTiers.azada === undefined) game.toolTiers.azada = null;
      if (Array.isArray(data.hotbar)) {
        game.hotbar = data.hotbar.slice(0, 9).map(s => {
          if (s && s.kind === 'tool' && !game.toolTiers[s.id]) return null;
          return s;
        });
      }
      while (game.hotbar.length < 9) game.hotbar.push(null);
      if (game.hotbar.length > 9) game.hotbar.length = 9;
      game.activeSlot = Math.max(0, Math.min(8, data.activeSlot || 0));
      const defaultEquipped = { helm: null, armor: null, legs: null, boots: null, shield: null, ring: null, amulet: null, relic: null, relic2: null, relic3: null };
      game.equipped = { ...defaultEquipped, ...(data.equipped || {}) };
      game.armorTiers = { helm: null, armor: null, legs: null, shield: null, boots: null, ...(data.armorTiers || {}) };
      if (typeof game.syncArmorTiersFromGear === 'function') game.syncArmorTiersFromGear();
      game.toolEnchants = data.toolEnchants || {};
      game.armorEnchants = data.armorEnchants || {};
      game.permanentRelics = Array.isArray(data.permanentRelics) ? [...data.permanentRelics] : [];
      game.unlockedSpells = Array.isArray(data.unlockedSpells) && data.unlockedSpells.length
        ? [...new Set(data.unlockedSpells)]
        : ['misil_arcano'];
      game.spellSlots = Array.isArray(data.spellSlots)
        ? data.spellSlots.slice(0, 4)
        : ['misil_arcano', null, null, null];
      while (game.spellSlots.length < 4) game.spellSlots.push(null);
      game.spellLevels = (data.spellLevels && typeof data.spellLevels === 'object') ? { ...data.spellLevels } : {};
      game.spellCooldowns = {};
      if (data.spellCooldowns && typeof data.spellCooldowns === 'object') {
        Object.entries(data.spellCooldowns).forEach(([sid, rem]) => {
          if (typeof rem === 'number' && rem > 0.05) {
            game.spellCooldowns[sid] = rem;
          }
        });
      }
      game.unlockedSkills = data.unlockedSkills || [];
      game.storyIndex = data.storyIndex || 0;
      game.npcQuestProgress = data.npcQuestProgress || {};
      game.claimedContracts = Array.isArray(data.claimedContracts) ? [...data.claimedContracts] : [];
      // Beta 2.0.0 RC2 restore
      game.unlockedPets = Array.isArray(data.unlockedPets) ? [...data.unlockedPets] : [];
      game.activePet = data.activePet || null;
      game.trophyExhibits = Array.isArray(data.trophyExhibits) ? [...data.trophyExhibits] : [];
      game.claimedWeeklyChallenges = Array.isArray(data.claimedWeeklyChallenges) ? [...data.claimedWeeklyChallenges] : [];
      game.seenV2Hints = (data.seenV2Hints && typeof data.seenV2Hints === 'object') ? { ...data.seenV2Hints } : {};
      game.hanaCosmetic = data.hanaCosmetic || 'none';
      game.unlockedCosmetics = Array.isArray(data.unlockedCosmetics) ? [...data.unlockedCosmetics] : [];
      game.preserveRarityMode = !!data.preserveRarityMode;
      game.clearedDungeons = data.clearedDungeons || [];
      game.corruptedClearedDungeons = Array.isArray(data.corruptedClearedDungeons) ? [...data.corruptedClearedDungeons] : [];
      if (game.events) {
        game.events.dailySchedule = data.dailySchedule ? { ...data.dailySchedule } : null;
        game.events.activeEvent = data.activeEvent ? { ...data.activeEvent } : null;
      }
      game.dungeonIntroSeen = !!data.dungeonIntroSeen;
      game.unlockedAchievements = data.unlockedAchievements || [];
      game.encyclopedia.items = new Set((data.encyclopedia && data.encyclopedia.items) || []);
      game.encyclopedia.enemies = new Set((data.encyclopedia && data.encyclopedia.enemies) || []);
      game.encyclopedia.buildings = new Set((data.encyclopedia && data.encyclopedia.buildings) || []);
      game.encyclopedia.relics = new Set((data.encyclopedia && data.encyclopedia.relics) || game.permanentRelics || []);
      game.encyclopedia.enchants = new Set((data.encyclopedia && data.encyclopedia.enchants) || []);
      game.encyclopedia.altars = new Set((data.encyclopedia && data.encyclopedia.altars) || []);
      if (typeof game.syncEncyclopedia === 'function') game.syncEncyclopedia();
      game.stats = data.stats ? { ...game.makeInitialStats(), ...data.stats } : game.makeInitialStats();
      let maxBuildingId = 0;
      game.buildings = (data.buildings || []).map(b => {
        const bDef = Abyssea.BUILDINGS && Abyssea.BUILDINGS[b.type];
        const bid = Number(b.id) || (++maxBuildingId);
        if (bid > maxBuildingId) maxBuildingId = bid;
        const entry = {
          ...b,
          id: bid,
          storage: b.storage || {},
          queue: b.queue || [],
          isChest: Boolean(b.isChest || (bDef && bDef.isChest)),
          omega: b.omega ? JSON.parse(JSON.stringify(b.omega)) : undefined
        };
        if (b.type === 'cofre_logistico') {
          entry.filters = Array.isArray(b.filters) ? [...b.filters] : [];
        } else {
          delete entry.filters;
        }
        return entry;
      });
      game.nextBuildingId = Math.max(Number(data.nextBuildingId) || 1, maxBuildingId + 1);
      game._pipeGridCache = null;
      if (game.economy && typeof game.economy.invalidateBiomeCache === 'function') {
        game.economy.invalidateBiomeCache();
      }
      if (game.omega && typeof game.omega.load === 'function') {
        game.omega.load(data.omega || null, game, true);
        if (game.omega.report && Object.keys(game.omega.report.gained || {}).length > 0 && typeof game.toast === 'function') {
          const mins = Math.max(1, Math.round(game.omega.report.elapsed / 60));
          const summary = game.omega.fmtMap(game.omega.report.gained);
          game.toast(`Producción offline Omega (${mins} min): ${summary}`, 'success');
        }
      }
      // Guarantee solid walkable land under every building's FULL footprint (1x1 or 2x2),
      // remove overlapping natural resource nodes, and ensure crops sit on tilled soil.
      const buildingFootprintSet = new Set();
      for (const b of game.buildings) {
        if (!b || !Number.isFinite(b.tx) || !Number.isFinite(b.ty)) continue;
        const bDef = Abyssea.BUILDINGS && Abyssea.BUILDINGS[b.type];
        const sz = Math.max(1, (bDef && bDef.size) || 1);
        const wantsWater = bDef && bDef.placeOn === 'water';
        for (let dy = 0; dy < sz; dy++) {
          for (let dx = 0; dx < sz; dx++) {
            const bx = b.tx + dx;
            const by = b.ty + dy;
            buildingFootprintSet.add(`${bx},${by}`);
            if (!wantsWater && game.world.tiles[by] && (game.world.tiles[by][bx] === 0 || game.world.tiles[by][bx] === 4)) {
              game.world.tiles[by][bx] = 1;
            }
          }
        }
      }
      if (buildingFootprintSet.size > 0 && Array.isArray(game.world.nodes)) {
        const landmarkKinds = new Set(['dungeon_gate', 'altar_shrine', 'easter_egg', 'secret_chest', 'puzzle_pillar', 'skeleton_king_shrine', 'bone_totem']);
        game.world.nodes = game.world.nodes.filter(n => {
          if (!n) return false;
          if (!buildingFootprintSet.has(`${n.tx},${n.ty}`)) return true;
          if (landmarkKinds.has(n.kind)) {
            // Relocate landmark onto an unoccupied tile on the same plot rather than burying a player building
            const gx = Math.floor(n.tx / plotTiles);
            const gy = Math.floor(n.ty / plotTiles);
            const ox = gx * plotTiles, oy = gy * plotTiles;
            for (let ly = 2; ly <= plotTiles - 3; ly++) {
              for (let lx = 2; lx <= plotTiles - 3; lx++) {
                const tx = ox + lx, ty = oy + ly;
                if (!buildingFootprintSet.has(`${tx},${ty}`) && game.world.tiles[ty] && game.world.tiles[ty][tx] !== undefined) {
                  game.world.tiles[ty][tx] = 1;
                  n.tx = tx;
                  n.ty = ty;
                  n.x = (tx + 0.5) * tileSize;
                  n.y = (ty + 0.5) * tileSize;
                  return true;
                }
              }
            }
            return true;
          }
          return false;
        });
        game.world._nodeIndexLen = -1;
      }
      if (Array.isArray(game.world.crops)) {
        for (const c of game.world.crops) {
          if (c && Number.isFinite(c.tx) && Number.isFinite(c.ty) && game.world.tiles[c.ty] && game.world.tiles[c.ty][c.tx] !== undefined) {
            if (game.world.tiles[c.ty][c.tx] === 0 || game.world.tiles[c.ty][c.tx] === 4 || game.world.tiles[c.ty][c.tx] === 1) {
              game.world.tiles[c.ty][c.tx] = 2;
            }
          }
        }
      }
      if (typeof game.world.pruneStrayLandTiles === 'function') {
        game.world.pruneStrayLandTiles(game.buildings, game.world.crops);
      }
      // Safety net for old/aborted saves: if the stored position is not standable in the
      // overworld (e.g. it was captured while inside a dungeon), snap to the nearest safe
      // tile so the hero can never load stuck on water, void or a building. This also
      // rescues legacy saves written by builds that persisted dungeon-space coordinates.
      if (typeof game.findSafeOverworldSpawn === 'function') {
        const safe = game.findSafeOverworldSpawn(game.player.x, game.player.y);
        game.player.x = safe.x;
        game.player.y = safe.y;
        game.player.dashTimer = 0;
      }
      // The save was written mid-dungeon: the run cannot be resumed, so tell the player
      // they were pulled back to the surface (instead of silently teleporting them).
      if (data.inDungeon && typeof game.toast === 'function') {
        const msg = (Abyssea.I18n && typeof Abyssea.I18n.t === 'function')
          ? Abyssea.I18n.t('toast.dungeonRescued')
          : 'Fuiste devuelto sano y salvo a la superficie.';
        game.toast(msg, 'warn');
      }
      if (Array.isArray(data.dailyChallenges)) game.events.dailyChallenges = data.dailyChallenges;
      game.craftQueue = Array.isArray(data.craftQueue) ? data.craftQueue.map(q => ({ ...q })) : [];
      game.craftReady = Array.isArray(data.craftReady) ? data.craftReady.map(r => ({ ...r })) : [];
      let persistedLang = null;
      let persistedScale = null;
      try {
        persistedLang = localStorage.getItem('abyssea_lang');
        persistedScale = localStorage.getItem('abyssea_ui_scale');
      } catch (e) {}
      game.settings = {
        screenShake: true,
        waterAnim: true,
        waterStyle: 'clasico',
        waterSpeed: 'normal',
        treeSway: true,
        particles: true,
        floatingText: true,
        showHitbox: true,
        lang: (persistedLang === 'en' || persistedLang === 'es') ? persistedLang : 'en',
        uiScale: UI_SCALE_PRESETS.includes(Number(persistedScale)) ? Number(persistedScale) : 1,
        ...(data.settings || {})
      };
      if (persistedLang === 'en' || persistedLang === 'es') game.settings.lang = persistedLang;
      if (UI_SCALE_PRESETS.includes(Number(persistedScale))) game.settings.uiScale = Number(persistedScale);
      if (Abyssea.I18n && Abyssea.I18n.getLanguage() !== game.settings.lang) {
        Abyssea.I18n.setLanguage(game.settings.lang, { persist: false });
      }
      if (Abyssea.UI && typeof Abyssea.UI.applyUiScale === 'function') {
        Abyssea.UI.applyUiScale(game.settings.uiScale, { persist: false });
      }
      if (data.market && game.economy) {
        if (Array.isArray(data.market.stock) && data.market.stock.length) game.economy.marketStock = data.market.stock.slice(0, 5);
        if (Array.isArray(data.market.sellContracts) && data.market.sellContracts.length) game.economy.sellContracts = data.market.sellContracts.slice(0, 5);
        if (Number.isFinite(data.market.refreshTimer)) game.economy.refreshTimer = data.market.refreshTimer;
        game.economy.manualRefreshesUsed = Number.isFinite(data.market.manualRefreshesUsed)
          ? Math.max(0, Math.min(game.economy.maxManualRefreshes || 3, data.market.manualRefreshesUsed))
          : 0;
      }
      // Restaurar progreso del tutorial exclusivo de esta partida
      if (game.tutorialSys || game.tutorial) {
        const tut = game.tutorialSys || game.tutorial;
        if (data.tutorial) {
          tut.step = Math.max(0, Number(data.tutorial.step) || 0);
          tut.done = !!data.tutorial.done;
          tut.skipped = !!data.tutorial.skipped;
          tut.rewardClaimed = Boolean(data.tutorial.rewardClaimed || data.tutorial.done);
        } else {
          tut.step = 0;
          tut.done = false;
          tut.skipped = false;
          tut.rewardClaimed = false;
        }
        tut.stepState = {};
        tut.minimized = false;
      }
      // Las preferencias globales de Audio SIEMPRE se respetan y no se sobreescriben por la partida
      if (Abyssea.Audio && typeof Abyssea.Audio.loadPrefs === 'function') {
        Abyssea.Audio.loadPrefs();
      }
      game.activeDungeon = null;
      if (typeof game.resetAmbientParticles === 'function') game.resetAmbientParticles();
      game.recomputeModifiers();
      if (game.player && typeof game.getNextXpForLevel === 'function') {
        game.player.nextXp = game.getNextXpForLevel(game.player.level || 1);
      }
      game.drops = Array.isArray(data.drops)
        ? data.drops.filter(d => d && d.itemId && d.qty > 0).map(d => ({
            x: Number(d.x) || game.player.x,
            y: Number(d.y) || game.player.y,
            itemId: d.itemId,
            qty: Number(d.qty) || 1,
            life: 1.0,
            vx: 0,
            vy: 0
          }))
        : [];
      game.inventoryOverflowMigrated = !!data.inventoryOverflowMigrated;
      if (typeof game.migrateLegacyInventoryOverflow === 'function') {
        game.migrateLegacyInventoryOverflow(!data.inventoryOverflowMigrated);
      }
      if (data._cornerRescued && typeof game.toast === 'function') {
        const isEn = Abyssea.I18n && Abyssea.I18n.getLanguage && Abyssea.I18n.getLanguage() === 'en';
        game.toast(
          isEn
            ? 'Legacy base recovered and re-centered onto your unlocked islands.'
            : 'Tu base y construcciones fueron recuperadas y centradas en tus islas desbloqueadas.',
          'success'
        );
      }
      return didMigrateOrRescue;
    }

    exportJSON(game) {
      const data = JSON.stringify(this.serialize(game), null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `abyssea_save_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      game.toast(Abyssea.I18n ? Abyssea.I18n.t('toast.saveExported') : 'Archivo de partida exportado.', 'success');
    }

    importJSON(game, jsonStr) {
      try {
        const data = JSON.parse(jsonStr);
        if (!data || typeof data !== 'object' || !data.player || typeof data.player !== 'object') throw new Error('invalid');
        this.applySaveData(game, data);
        this.save(game, game.currentSlot || 1, true);
        if (Abyssea.actualizarDiscord) Abyssea.actualizarDiscord(true);
        game.toast(Abyssea.I18n ? Abyssea.I18n.t('toast.saveImported') : 'Partida importada correctamente.', 'success');
        return true;
      } catch {
        game.toast(Abyssea.I18n ? Abyssea.I18n.t('toast.invalidSaveFile') : 'Archivo de guardado inválido.', 'warn');
        return false;
      }
    }
  }

  Abyssea.SaveSystem = SaveSystem;
})();
