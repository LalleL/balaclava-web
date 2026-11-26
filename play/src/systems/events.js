(function () {
  'use strict';

  const Abyssea = (window.Abyssea = window.Abyssea || {});
  const { PLOT_TILES, TILE_SIZE } = Abyssea.CONST;
  const { pick, randInt } = Abyssea.Utils;

  const DAILY_EVENTS = {
    lluvia_fertil: {
      id: 'lluvia_fertil',
      name: 'Lluvia Fértil',
      desc: 'Lluvia tibia y nutritiva que riega y acelera los cultivos.',
      duration: 110,
      color: '#4fc3f7'
    },
    tormenta_electrica: {
      id: 'tormenta_electrica',
      name: 'Tormenta Eléctrica',
      desc: 'Rayos y descargas voltaicas sobrecargan el archipiélago.',
      duration: 90,
      color: '#ffd54f'
    },
    lluvia_meteoritos: {
      id: 'lluvia_meteoritos',
      name: 'Lluvia de Meteoritos',
      desc: 'Cuerpos celestes caen en las islas exteriores.',
      duration: 100,
      color: '#ff7043'
    },
    esencia_arcana: {
      id: 'esencia_arcana',
      name: 'Oleada de Esencia Arcana',
      desc: 'La magia ambiental se condensa y potencia la caída de esencias oscuras.',
      duration: 110,
      color: '#ce93d8'
    },
    viento_favorable: {
      id: 'viento_favorable',
      name: 'Viento Favorable',
      desc: 'Brizas vivas aumentan notablemente la velocidad de movimiento del héroe.',
      duration: 120,
      color: '#81c784'
    },
    niebla_espesa: {
      id: 'niebla_espesa',
      name: 'Niebla Espesa',
      desc: 'Densa bruma sobre el mar que atrae criaturas nocturnas.',
      duration: 110,
      color: '#90a4ae'
    },
    abundancia_mineral: {
      id: 'abundancia_mineral',
      name: 'Abundancia Mineral',
      desc: 'Erupciones telúricas aceleran la regeneración de vetas y rocas.',
      duration: 120,
      color: '#ffd54f'
    },
    anomalia_temporal: {
      id: 'anomalia_temporal',
      name: 'Anomalía Temporal',
      desc: 'Distorsión del tiempo: hornos, aserraderos y telares operan al doble de velocidad.',
      duration: 110,
      color: '#ba68c8'
    }
  };

  class EventsSystem {
    constructor() {
      this.dailyChallenges = this.generateDailyChallenges();
      this.dailySchedule = null;
      this.activeEvent = null;
    }

    generateDailyChallenges() {
      const en = Abyssea.I18n && Abyssea.I18n.getLanguage() === 'en' && Abyssea.I18N_DATA_EN && Abyssea.I18N_DATA_EN.dailyChallenges;
      const base = [
        { id: 'dc_gather', title: 'Desafío de Recolector', desc: 'Recolecta 40 recursos de cualquier tipo', target: 40, type: 'gather', progress: 0, rewardCoins: 90, rewardXp: 80, claimed: false },
        { id: 'dc_craft',  title: 'Desafío de Artesano',   desc: 'Fabrica 8 objetos en tus estaciones',     target: 8,  type: 'craft',  progress: 0, rewardCoins: 110, rewardXp: 95, claimed: false },
        { id: 'dc_combat', title: 'Desafío de Cazador',    desc: 'Derrota 6 enemigos en el mundo',          target: 6,  type: 'kill',   progress: 0, rewardCoins: 130, rewardXp: 110, claimed: false }
      ];
      if (!en) return base;
      return base.map(ch => (en[ch.id] ? { ...ch, title: en[ch.id].title, desc: en[ch.id].desc } : ch));
    }

    recordAction(type, amount = 1) {
      for (const ch of this.dailyChallenges) {
        if (!ch.claimed && ch.type === type) {
          ch.progress = Math.min(ch.target, ch.progress + amount);
        }
      }
    }

    claimChallenge(game, id) {
      const ch = this.dailyChallenges.find(c => c.id === id);
      if (!ch || ch.claimed || ch.progress < ch.target) return false;
      ch.claimed = true;
      game.addCoins(ch.rewardCoins);
      game.gainXp(ch.rewardXp);
      Abyssea.Audio.play('levelup');
      game.toast(Abyssea.I18n ? Abyssea.I18n.t('toast.challengeDone', { coins: ch.rewardCoins, xp: ch.rewardXp }) : `¡Desafío completado! +${ch.rewardCoins} monedas y +${ch.rewardXp} Experiencia`, 'success');
      return true;
    }

    claimContract(game, id) {
      const c = (Abyssea.GUILD_CONTRACTS || []).find(x => x.id === id);
      if (!c) return false;
      if (!game.claimedContracts) game.claimedContracts = [];
      if (game.claimedContracts.includes(id)) return false;
      const cur = c.progress(game);
      if (cur < c.target) return false;
      game.claimedContracts.push(id);
      if (c.reward.coins) game.addCoins(c.reward.coins);
      if (c.reward.xp) game.gainXp(c.reward.xp);
      if (c.reward.items) {
        for (const [iid, qty] of Object.entries(c.reward.items)) {
          if (qty > 0 && Abyssea.ITEMS[iid]) game.addItem(iid, qty);
        }
      }
      Abyssea.Audio.play('levelup');
      game.toast(Abyssea.I18n ? Abyssea.I18n.t('toast.contractDone', { title: c.title, coins: c.reward.coins, xp: c.reward.xp }) : `¡Contrato "${c.title}" completado! +${c.reward.coins} oro y +${c.reward.xp} Experiencia`, 'success');
      game.uiDirty = true;
      return true;
    }

    getReadyContractsCount(game) {
      const claimed = game.claimedContracts || [];
      return (Abyssea.GUILD_CONTRACTS || []).filter(c => !claimed.includes(c.id) && c.progress(game) >= c.target).length;
    }

    update(dt, game) {
      this.checkProgress(game);

      if (game.activeDungeon) return;

      const curDay = Math.floor(game.dayCount || 1);
      const curTime = (game.dayTime % 1 + 1) % 1;

      // 1 random scheduled event per in-game day + fresh daily challenges on day rollover
      if (!this.dailySchedule || this.dailySchedule.day !== curDay) {
        const hadPrevDay = Boolean(this.dailySchedule && this.dailySchedule.day !== curDay);
        const eventKeys = Object.keys(DAILY_EVENTS);
        const eventRateBonus = Math.min(0.15, (game.mods && game.mods.eventRate) || 0);
        this.dailySchedule = {
          day: curDay,
          triggerTime: Math.max(0.10, 0.18 + Math.random() * 0.62 - eventRateBonus),
          eventId: pick(eventKeys),
          triggered: false
        };
        if (hadPrevDay) {
          this.dailyChallenges = this.generateDailyChallenges();
        }
      }

      if (!this.dailySchedule.triggered && curTime >= this.dailySchedule.triggerTime) {
        this.dailySchedule.triggered = true;
        // RC2: Interactive Events rotation (independent probability bands — no raid skew on non-weather biomes)
        const rollInteractive = Math.random();
        let fired = false;
        if (rollInteractive < 0.22) {
          fired = typeof game.triggerBiomeWeatherEvent === 'function' && Boolean(game.triggerBiomeWeatherEvent());
        } else if (rollInteractive < 0.44 && (game.unlockedPlots || []).length >= 2) {
          fired = typeof game.startBiomeRaid === 'function' && Boolean(game.startBiomeRaid());
        } else if (rollInteractive < 0.62 && (game.unlockedPlots || []).length >= 2) {
          fired = typeof game.spawnGhostMerchantShip === 'function' && Boolean(game.spawnGhostMerchantShip());
        }
        if (!fired) {
          this.startDailyEvent(game, this.dailySchedule.eventId);
        }
      }

      if (this.activeEvent) {
        this.activeEvent.timeLeft = Math.max(0, this.activeEvent.timeLeft - dt);
        this.applyDailyEventTick(game, dt);
        if (this.activeEvent.timeLeft <= 0) {
          const endedName = this.activeEvent.name;
          this.activeEvent = null;
          game.recomputeModifiers();
          const isEn = Abyssea.I18n && Abyssea.I18n.getLanguage && Abyssea.I18n.getLanguage() === 'en';
          game.toast(isEn ? `The event "${endedName}" has ended.` : `El evento "${endedName}" ha concluido.`, 'info');
        }
      }
    }

    startDailyEvent(game, eventId) {
      const def = DAILY_EVENTS[eventId] || DAILY_EVENTS.lluvia_fertil;
      const isEn = Abyssea.I18n && Abyssea.I18n.getLanguage && Abyssea.I18n.getLanguage() === 'en';
      const enEv = isEn && Abyssea.I18N_DATA_EN && Abyssea.I18N_DATA_EN.dailyEvents && Abyssea.I18N_DATA_EN.dailyEvents[def.id];
      const evName = (enEv && enEv.name) || def.name;
      const evDesc = (enEv && enEv.desc) || def.desc;
      this.activeEvent = {
        id: def.id,
        name: evName,
        desc: evDesc,
        timeLeft: def.duration,
        duration: def.duration,
        color: def.color
      };
      game.recomputeModifiers();
      Abyssea.Audio.play('portal');
      game.toast(isEn ? `Daily Event: ${evName}! ${evDesc}` : `¡Evento Diario: ${evName}! ${evDesc}`, 'warn');

      if (def.id === 'lluvia_meteoritos' && game.unlockedPlots && game.unlockedPlots.length >= 1) {
        let spawned = 0;
        for (let attempt = 0; attempt < 28 && spawned < 2; attempt++) {
          const plot = pick(game.unlockedPlots);
          const biome = game.world.plotBiomes[plot[1]][plot[0]];
          const tx = plot[0] * PLOT_TILES + randInt(2, PLOT_TILES - 3);
          const ty = plot[1] * PLOT_TILES + randInt(2, PLOT_TILES - 3);
          if (game.world.tiles[ty] && game.world.tiles[ty][tx] === 1 && !game.world.getNodeAtTile(tx, ty) && !game.getBuildingAtTile(tx, ty)) {
            game.world.spawnNodeAtTile(tx, ty, 'meteor', biome);
            game.spawnParticles((tx + 0.5) * TILE_SIZE, (ty + 0.5) * TILE_SIZE, '#ff8a65', 18);
            spawned++;
          }
        }
        if (spawned > 0) game.shake(0.35, 6);
      }
    }

    applyDailyEventTick(game, dt) {
      if (!this.activeEvent) return;
      const id = this.activeEvent.id;

      if (id === 'lluvia_fertil') {
        // Accelerate crop watering and proportional growth
        for (const c of game.world.crops) {
          c.watered = true;
          const cDef = Abyssea.CROPS && Abyssea.CROPS[c.cropId];
          const growT = (cDef && cDef.growTime) || 55;
          c.progress = Math.min(1.0, c.progress + (dt * 1.15) / growT);
          c.stage = c.progress >= 1 ? 3 : c.progress >= 0.65 ? 2 : c.progress >= 0.3 ? 1 : 0;
        }
      } else if (id === 'tormenta_electrica') {
        this._strikeTimer = (this._strikeTimer || 0) + dt;
        if (this._strikeTimer >= 8.5) {
          this._strikeTimer = 0;
          const alive = (game.combat && game.combat.enemies || []).filter(e => e && !e._dead && e.hp > 0);
          if (alive.length > 0) {
            const target = pick(alive);
            const stormDmg = Math.max(45, Math.round((target.maxHp || 180) * 0.22));
            game.spawnFx('pvfx_lightning_strike', target.x, target.y - 18, 0, 0.34, 1.35, 0.92, { blend: 'lighter' });
            game.combat.damageEnemy(game, target, stormDmg, null, false, false, { nonPlayer: true, noKnockback: true });
          }
        }
      } else if (id === 'abundancia_mineral') {
        game.world.spawnTimer = (game.world.spawnTimer || 0) + dt * 0.8;
      } else if (id === 'esencia_arcana') {
        // Arcane surge: restores player energy passively and empowers arcane essence drops (handled in combat.onEnemyKilled)
        if (game.player) {
          game.player.energy = Math.min(game.player.maxEnergy || 100, (game.player.energy || 0) + dt * 4.5);
        }
        this._arcaneFxTimer = (this._arcaneFxTimer || 0) + dt;
        if (this._arcaneFxTimer >= 1.4 && game.player && game.spawnParticles) {
          this._arcaneFxTimer = 0;
          game.spawnParticles(game.player.x + randInt(-90, 90), game.player.y + randInt(-60, 60), '#ce93d8', 3);
        }
      } else if (id === 'niebla_espesa') {
        // Dense mist: spawns nocturnal creatures periodically even by day & drifting fog motes
        this._fogSpawnTimer = (this._fogSpawnTimer || 0) + dt;
        if (this._fogSpawnTimer >= 16 && game.combat && game.combat.enemies.length < 18) {
          this._fogSpawnTimer = 0;
          game.combat.spawnWorldEnemy(game, pick(['ghost', 'spider', 'vampire_bat']));
        }
        this._fogFxTimer = (this._fogFxTimer || 0) + dt;
        if (this._fogFxTimer >= 0.9 && game.player && game.spawnParticles) {
          this._fogFxTimer = 0;
          game.spawnParticles(game.player.x + randInt(-140, 140), game.player.y + randInt(-90, 90), '#b0bec5', 2);
        }
      }
    }

    triggerRandomEvent(game) {
      if (game.activeDungeon || game.unlockedPlots.length === 0) return;
      const keys = Object.keys(DAILY_EVENTS);
      this.startDailyEvent(game, pick(keys));
    }

    checkProgress(game) {
      // Story progression
      const chap = Abyssea.STORY_CHAPTERS[game.storyIndex];
      if (chap && chap.check(game)) {
        game.storyIndex++;
        game.addCoins(chap.reward.coins);
        game.gainXp(chap.reward.xp);
        for (const [id, q] of Object.entries(chap.reward.items)) {
          game.addItem(id, q);
        }
        Abyssea.Audio.play('levelup');
        game.toast(Abyssea.I18n ? Abyssea.I18n.t('toast.chapterDone', { title: chap.title }) : `¡Capítulo completado: ${chap.title}!`, 'success');
      }

      // Achievements
      for (const ach of Abyssea.ACHIEVEMENTS) {
        if (!game.unlockedAchievements.includes(ach.id) && ach.check(game)) {
          game.unlockedAchievements.push(ach.id);
          game.addCoins(ach.coins);
          Abyssea.Audio.play('chest');
          game.toast(Abyssea.I18n ? Abyssea.I18n.t('toast.achievementDone', { name: ach.name, coins: ach.coins }) : `¡Logro desbloqueado: ${ach.name}! (+${ach.coins} monedas)`, 'success');
        }
      }
    }

    getNextObjectiveHint(game) {
      const chap = Abyssea.STORY_CHAPTERS[game.storyIndex];
      if (chap) return chap.objective;
      const total = Abyssea.CONST.GRID_PLOTS * Abyssea.CONST.GRID_PLOTS;
      if (game.unlockedPlots.length < total) return Abyssea.I18n ? Abyssea.I18n.t('quests.nextPlotHint') : 'Explora y compra las parcelas restantes en el Mapa (M) para dominar el archipiélago.';
      return Abyssea.I18n ? Abyssea.I18n.t('quests.storyComplete') : '¡Modo Infinito Dorado! Amplía tu imperio automatizado y completa la Enciclopedia al 100%.';
    }
  }

  Abyssea.EventsSystem = EventsSystem;
})();
