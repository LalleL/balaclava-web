(function () {
  'use strict';

  const Abyssea = (window.Abyssea = window.Abyssea || {});
  const { TILE_SIZE } = Abyssea.CONST || { TILE_SIZE: 48 };

  const STYLE_META = {
    original: { id: 'original', label: 'Original', desc: 'Pixel-Art clásico actual' },
    style_a:  { id: 'style_a',  label: 'Opción A: Cult Cartoon', desc: 'Trazos negros gruesos y colores cel-shaded' },
    style_b:  { id: 'style_b',  label: 'Opción B: Isaac Pintado', desc: 'Sombreado orgánico estilo Flash moderno' },
    style_c:  { id: 'style_c',  label: 'Opción C: Forager HD', desc: 'Vector chibi brillante y súper limpio' }
  };

  const WORLD_KEYS = [
    'ground', 'tree', 'bush', 'rock', 'iron_vein',
    'chest', 'workbench', 'furnace', 'anvil',
    'slime', 'goblin', 'wolf', 'skeleton'
  ];
  const ITEM_KEYS = ['wood', 'stone', 'berries', 'coin', 'coal', 'iron_ore', 'iron_ingot', 'apple'];

  const pilotState = {
    activeStyle: (typeof localStorage !== 'undefined' && localStorage.getItem('abyssea_pilot_style')) || 'original',
    packs: {},
    praderaSheets: {},
    itemCanvasCache: {},
    originalPraderaSheet: null,
    barVisible: true
  };
  if (!STYLE_META[pilotState.activeStyle]) pilotState.activeStyle = 'original';
  Abyssea.PilotStyle = pilotState;

  function preloadPilotAssets() {
    if (typeof Image === 'undefined') return;
    const ROOT = window.ABYSSEA_ROOT_BASE || '';
    for (const sKey of ['style_a', 'style_b', 'style_c']) {
      pilotState.packs[sKey] = {};
      for (const k of WORLD_KEYS.concat(ITEM_KEYS)) {
        const img = new Image();
        img.src = `${ROOT}assets/pilot_styles/${sKey}/${k}.png?v=1.4.0f`;
        pilotState.packs[sKey][k] = img;
      }
    }
  }
  preloadPilotAssets();

  function buildPraderaSheetForStyle(sKey) {
    if (typeof document === 'undefined') return null;
    if (pilotState.praderaSheets[sKey]) return pilotState.praderaSheets[sKey];
    const gImg = pilotState.packs[sKey] && pilotState.packs[sKey].ground;
    if (!gImg || !gImg.complete || gImg.naturalWidth <= 0) return null;

    const c = document.createElement('canvas');
    c.width = 192;
    c.height = 192;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    // Tile seamlessly inside 192x192 auto-tile sheet
    ctx.drawImage(gImg, 0, 0, 192, 192);

    // Subtle organic rim on outer edge quadrants so islands keep clean rounded borders
    const edgeRim = sKey === 'style_a' ? '#0f3818' : (sKey === 'style_b' ? '#1f2814' : '#2e7d32');
    ctx.strokeStyle = edgeRim;
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 188, 188);

    pilotState.praderaSheets[sKey] = c;
    return c;
  }

  function applyBiomeGroundForStyle(sKey) {
    const assets = Abyssea.Assets;
    if (!assets || !assets.biomeTiles) return;
    if (!pilotState.originalPraderaSheet && assets.biomeTiles.pradera) {
      pilotState.originalPraderaSheet = assets.biomeTiles.pradera;
    }
    if (sKey === 'original') {
      if (pilotState.originalPraderaSheet) assets.biomeTiles.pradera = pilotState.originalPraderaSheet;
    } else {
      const sheet = buildPraderaSheetForStyle(sKey);
      if (sheet) assets.biomeTiles.pradera = sheet;
    }
    if (Abyssea.game) {
      Abyssea.game._biomeInnerPatterns = {};
    }
  }

  function getSpriteForStyle(sKey, spriteName) {
    if (!sKey || sKey === 'original') return null;
    const pack = pilotState.packs[sKey];
    const img = pack && pack[spriteName];
    if (img && img.complete && img.naturalWidth > 0) return img;
    return null;
  }

  function isEnemyMatched(e) {
    if (!e || e.isBoss) return null;
    const t = String(e.type || '').toLowerCase();
    if (t === 'slime' || t === 'golden_slime') return 'slime';
    if (t === 'goblin' || t === 'goblin_tnt' || t.includes('goblin')) return 'goblin';
    if (t === 'wolf' || t === 'shadow_wolf' || t.includes('lobo')) return 'wolf';
    if (t === 'skeleton' || t.includes('esqueleto')) return 'skeleton';
    return null;
  }

  function mapItemKey(idOrIcon) {
    const k = String(idOrIcon || '').toLowerCase();
    const map = {
      madera: 'wood', wood: 'wood', wood_log: 'wood',
      piedra: 'stone', stone: 'stone',
      bayas: 'berries', berries: 'berries',
      _coin: 'coin', coin: 'coin', coin_gold: 'coin',
      carbon: 'coal', coal: 'coal',
      hierro: 'iron_ore', iron_ore: 'iron_ore',
      lingote_hierro: 'iron_ingot', iron_ingot: 'iron_ingot',
      manzana: 'apple', apple: 'apple'
    };
    return map[k] || null;
  }

  function hookPilotRenderer() {
    const GameEngine = Abyssea.GameEngine;
    const AssetsClass = Abyssea.Assets && Abyssea.Assets.constructor;
    if (!GameEngine || !AssetsClass) {
      setTimeout(hookPilotRenderer, 60);
      return;
    }
    if (GameEngine.prototype._v14PilotHooked) return;
    GameEngine.prototype._v14PilotHooked = true;

    // 1. Pradera ground auto-refresh once ground.png finishes loading
    for (const sKey of ['style_a', 'style_b', 'style_c']) {
      const gImg = pilotState.packs[sKey].ground;
      if (gImg) {
        gImg.addEventListener('load', () => {
          if (pilotState.activeStyle === sKey) applyBiomeGroundForStyle(sKey);
        });
      }
    }

    // 2. Smooth item icons cache override (keeps GUI frames & layout 100% unchanged)
    const origGetItemIconCanvas = Abyssea.Assets.getItemIconCanvas.bind(Abyssea.Assets);
    Abyssea.Assets.getItemIconCanvas = function (iconType) {
      const sKey = pilotState.activeStyle;
      if (sKey && sKey !== 'original') {
        const mapped = mapItemKey(iconType);
        const img = mapped ? getSpriteForStyle(sKey, mapped) : null;
        if (img) {
          const cacheKey = `${sKey}_${mapped}`;
          if (pilotState.itemCanvasCache[cacheKey]) return pilotState.itemCanvasCache[cacheKey];
          const c = document.createElement('canvas');
          c.width = 64;
          c.height = 64;
          const ctx = c.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, 64, 64);
          pilotState.itemCanvasCache[cacheKey] = c;
          return c;
        }
      }
      return origGetItemIconCanvas(iconType);
    };

    // 3. Smooth world ground tile rendering when pilot style active (preserve all args: ctx, vw, vh!)
    const origRenderWorld = GameEngine.prototype.renderWorld;
    if (origRenderWorld) {
      GameEngine.prototype.renderWorld = function (ctx, vw, vh) {
        if (pilotState.activeStyle !== 'original') {
          applyBiomeGroundForStyle(pilotState.activeStyle);
          const prevSmooth = ctx.imageSmoothingEnabled;
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          const r = origRenderWorld.call(this, ctx, vw, vh);
          ctx.imageSmoothingEnabled = prevSmooth;
          return r;
        }
        return origRenderWorld.call(this, ctx, vw, vh);
      };
    }

    // 4. Nodes (Tree, Bush, Rock, Iron Ore Vein)
    const origDrawNode = GameEngine.prototype.drawNode;
    if (origDrawNode) {
      GameEngine.prototype.drawNode = function (ctx, n) {
        const sKey = pilotState.activeStyle;
        if (sKey !== 'original' && n) {
          let pKey = null;
          if (n.kind === 'tree' || n.kind === 'giant_tree') pKey = 'tree';
          else if (n.kind === 'bush' || n.kind === 'herb_patch' || n.kind === 'wild_crop_patch') pKey = 'bush';
          else if (n.kind === 'rock') pKey = 'rock';
          else if (n.kind === 'iron_vein' || n.kind === 'coal_vein' || n.kind === 'copper_vein' || n.kind === 'tin_vein') pKey = 'iron_vein';

          const pImg = pKey ? getSpriteForStyle(sKey, pKey) : null;
          if (pImg) {
            const jx = n.hitAnim > 0 ? Math.sin(n.hitAnim * 25) * 4 : 0;
            ctx.save();
            ctx.translate(n.x + jx, n.y);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            if (pKey === 'tree') {
              const scale = n.kind === 'giant_tree' ? 1.38 : 1.05;
              const swayX = Math.sin((this.time || 0) * 1.6 + (n.id || 0) * 0.9) * 1.8;
              ctx.fillStyle = 'rgba(0,0,0,0.22)';
              ctx.beginPath();
              ctx.ellipse(0, 18 * scale, 28 * scale, 9 * scale, 0, 0, Math.PI * 2);
              ctx.fill();
              const dw = Math.round(108 * scale);
              const dh = Math.round(112 * scale);
              ctx.drawImage(pImg, Math.round(-dw / 2 + swayX), Math.round(22 * scale - dh), dw, dh);
            } else if (pKey === 'bush') {
              ctx.fillStyle = 'rgba(0,0,0,0.22)';
              ctx.beginPath(); ctx.ellipse(0, 10, 20, 6, 0, 0, Math.PI * 2); ctx.fill();
              ctx.drawImage(pImg, -27, -42, 54, 54);
            } else {
              ctx.fillStyle = 'rgba(0,0,0,0.28)';
              ctx.beginPath(); ctx.ellipse(0, 12, 21, 7, 0, 0, Math.PI * 2); ctx.fill();
              ctx.drawImage(pImg, -27, -40, 54, 54);
            }
            ctx.restore();
            return;
          }
        }
        return origDrawNode.call(this, ctx, n);
      };
    }

    // 5. Buildings (Chest, Workbench, Furnace, Anvil Forge)
    const origDrawBuilding = GameEngine.prototype.drawBuilding;
    if (origDrawBuilding) {
      GameEngine.prototype.drawBuilding = function (ctx, b, def) {
        const sKey = pilotState.activeStyle;
        if (sKey !== 'original' && b && def) {
          let bKey = null;
          if (def.isChest || b.isChest || String(b.type || '').startsWith('cofre')) bKey = 'chest';
          else if (b.type === 'horno' || b.type === 'fundicion') bKey = 'furnace';
          else if (b.type === 'forja' || b.type === 'yunque_runico' || b.type === 'mesa_reforja') bKey = 'anvil';
          else if (b.type === 'mesa_artesania' || b.type === 'taller' || b.type === 'alquimia') bKey = 'workbench';

          const bImg = bKey ? getSpriteForStyle(sKey, bKey) : null;
          if (bImg) {
            const px = b.tx * TILE_SIZE;
            const py = b.ty * TILE_SIZE;
            const w = def.size * TILE_SIZE;
            const h = def.size * TILE_SIZE;
            const cx = px + w / 2;
            ctx.save();
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.fillStyle = 'rgba(0,0,0,0.32)';
            ctx.beginPath();
            ctx.ellipse(cx, py + h - 2, Math.round(w * 0.56), Math.round(h * 0.17), 0, 0, Math.PI * 2);
            ctx.fill();
            const dw = Math.round(w * 1.32);
            const dh = Math.round(dw);
            ctx.drawImage(bImg, cx - dw / 2, py + h - dh + 6, dw, dh);
            ctx.restore();
            return;
          }
        }
        return origDrawBuilding.call(this, ctx, b, def);
      };
    }

    // 6. Enemies (Slime, Goblin, Wolf, Skeleton) preserving squash & stretch, telegraphs & HP bar
    const origDrawEnemy = GameEngine.prototype.drawEnemy;
    if (origDrawEnemy) {
      GameEngine.prototype.drawEnemy = function (ctx, e) {
        const sKey = pilotState.activeStyle;
        const eKey = sKey !== 'original' ? isEnemyMatched(e) : null;
        const eImg = eKey ? getSpriteForStyle(sKey, eKey) : null;
        if (eImg) {
          const idSeed = (e.id || 1) * 0.71;
          const isMoving = Math.abs(e.vx || 0) > 4 || Math.abs(e.vy || 0) > 4;
          let squashX = 1, squashY = 1, hopY = 0, walkTilt = 0;

          if (e.state === 'windup') {
            squashX = 1.24; squashY = 0.80;
          } else if (e.state === 'dash') {
            squashX = 1.30; squashY = 0.84;
          } else if (e.state === 'leap') {
            const lp = e.leapProg || 0;
            const arc = Math.sin(lp * Math.PI);
            hopY = -arc * 26;
            squashX = 0.86 + (1 - arc) * 0.25;
            squashY = 1.22 - (1 - arc) * 0.4;
          } else if (isMoving) {
            const cycle = Math.sin((this.time || 0) * 9.0 + idSeed);
            squashX = 1 + cycle * 0.06;
            squashY = 1 - cycle * 0.06;
            walkTilt = cycle * 0.06;
          } else {
            const breathe = Math.sin((this.time || 0) * 3.6 + idSeed);
            squashX = 1 + breathe * 0.04;
            squashY = 1 - breathe * 0.04;
          }

          ctx.save();
          ctx.translate(e.x, e.y);
          ctx.fillStyle = 'rgba(0,0,0,0.30)';
          ctx.beginPath();
          ctx.ellipse(0, 12, 18, 6, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.save();
          ctx.translate(0, 12 + hopY);
          if (walkTilt) ctx.rotate(walkTilt);
          ctx.scale((e.facing < 0 ? -1 : 1) * squashX, squashY);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          const size = eKey === 'slime' ? 46 : (eKey === 'wolf' ? 58 : 54);
          if (e.hitFlash > 0 && typeof this.drawFlashSprite === 'function') {
            this.drawFlashSprite(ctx, eImg, 0, 0, eImg.width, eImg.height, -size / 2, -size + 4, size, size);
          } else {
            ctx.drawImage(eImg, -size / 2, -size + 4, size, size);
          }
          ctx.restore();

          // Standard HP bar above enemy
          if (e.hp < e.maxHp) {
            const bw = 34, bh = 5;
            const pct = Math.max(0, Math.min(1, e.hp / Math.max(1, e.maxHp)));
            ctx.fillStyle = 'rgba(0,0,0,0.72)';
            ctx.fillRect(-bw / 2 - 1, -size - 4, bw + 2, bh + 2);
            ctx.fillStyle = '#e53935';
            ctx.fillRect(-bw / 2, -size - 3, Math.round(bw * pct), bh);
          }
          ctx.restore();
          return;
        }
        return origDrawEnemy.call(this, ctx, e);
      };
    }

    // 7. Compact top-right Style Comparison Switcher (F9 toggles bar visibility)
    function spawnStyleDemoScene() {
      const g = Abyssea.game;
      if (!g || !g.started) {
        if (Abyssea.UI && typeof Abyssea.UI.showToast === 'function') {
          Abyssea.UI.showToast('Inicia o carga una partida primero para ver la escena piloto.', 'warn');
        }
        return;
      }
      const ptx = Math.floor(g.player.x / TILE_SIZE);
      const pty = Math.floor(g.player.y / TILE_SIZE);
      const demoBlds = [
        { type: 'cofre_madera', dx: -3, dy: -2 },
        { type: 'mesa_artesania', dx: -1, dy: -2 },
        { type: 'horno', dx: 1, dy: -2 },
        { type: 'forja', dx: 3, dy: -2 }
      ];
      for (const db of demoBlds) {
        const tx = ptx + db.dx;
        const ty = pty + db.dy;
        if (!g.buildings.some(b => b.tx === tx && b.ty === ty)) {
          g.buildings.push({ id: Date.now() + Math.random(), type: db.type, tx, ty, x: tx * TILE_SIZE, y: ty * TILE_SIZE });
        }
      }
      if (g.combat && Array.isArray(g.combat.enemies)) {
        const defs = (Abyssea.ENEMY_DEFS || {});
        const offsets = [
          ['slime', -145, 42],
          ['goblin', -120, -32],
          ['wolf', 120, -32],
          ['skeleton', 145, 42]
        ];
        for (const [eType, ox, oy] of offsets) {
          if (!g.combat.enemies.some(en => en.type === eType && Math.hypot(en.x - g.player.x, en.y - g.player.y) < 260)) {
            const def = defs[eType] || { name: eType, hp: 28, dmg: 5, speed: 48, color: '#66bb6a' };
            g.combat.enemies.push({
              id: (g.combat.nextId = (g.combat.nextId || 100) + 1),
              type: eType,
              name: def.name || eType,
              biome: 'pradera',
              level: 1,
              xpMult: 1,
              earlyZoneMob: true,
              nocturnal: false,
              x: g.player.x + ox,
              y: g.player.y + oy,
              vx: 0, vy: 0, animVx: 0, animVy: 0,
              hp: def.hp || 28,
              maxHp: def.hp || 28,
              dmg: 0,
              speed: 14,
              color: def.color || '#66bb6a',
              radius: 20, hitW: 44, hitH: 50, bodyOffY: 17,
              hitFlash: 0, atkCd: 999999, patrolTimer: 2, facing: ox < 0 ? 1 : -1
            });
          }
        }
      }
      if (g.world && Array.isArray(g.world.nodes)) {
        const hasIron = g.world.nodes.some(n => n.kind === 'iron_vein' && Math.hypot(n.x - g.player.x, n.y - g.player.y) < 340);
        if (!hasIron) {
          g.world.nodes.push({
            id: Date.now() + 99,
            kind: 'iron_vein',
            biome: 'pradera',
            tx: ptx + 3,
            ty: pty + 1,
            x: (ptx + 3.5) * TILE_SIZE,
            y: (pty + 1.5) * TILE_SIZE,
            hp: 40, maxHp: 40, hitAnim: 0, variant: 0
          });
        }
      }
      const drops = ['madera', 'piedra', 'bayas', 'carbon', 'hierro', 'lingote_hierro', 'manzana'];
      drops.forEach((dId, i) => {
        if (typeof g.spawnDrop === 'function') {
          g.spawnDrop(g.player.x - 105 + i * 35, g.player.y + 82, dId, 1);
        }
      });
      if (g.toast) g.toast('Escena de prueba lista alrededor tuyo. Cambia entre A, B y C arriba.', 'success');
    }

    function createPilotBar() {
      if (typeof document === 'undefined' || document.getElementById('v14-style-pilot-bar')) return;
      const bar = document.createElement('div');
      bar.id = 'v14-style-pilot-bar';
      bar.style.cssText = [
        'position:fixed', 'top:10px', 'left:50%', 'transform:translateX(-50%)',
        'z-index:9500', 'display:flex', 'align-items:center', 'gap:5px', 'flex-wrap:wrap',
        'background:rgba(10,14,22,0.88)', 'border:2px solid #ffd54f', 'border-radius:8px',
        'padding:5px 9px', 'font-family:AbysseaPixel,monospace', 'box-shadow:0 4px 16px rgba(0,0,0,0.65)'
      ].join(';');

      const title = document.createElement('span');
      title.textContent = 'Estilo Piloto [F9]:';
      title.style.cssText = 'color:#ffd54f;font-size:12px;font-weight:bold;margin-right:3px;';
      bar.appendChild(title);

      const btns = {};
      const refreshButtons = () => {
        for (const [k, btn] of Object.entries(btns)) {
          const active = pilotState.activeStyle === k;
          btn.style.background = active ? '#ffb300' : '#1b2436';
          btn.style.color = active ? '#111111' : '#e2e8f0';
          btn.style.borderColor = active ? '#fff8e1' : '#475569';
          btn.style.fontWeight = active ? 'bold' : 'normal';
        }
      };

      for (const meta of Object.values(STYLE_META)) {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = meta.label;
        b.style.cssText = 'padding:4px 8px;border:1px solid #475569;border-radius:4px;cursor:pointer;font-family:inherit;font-size:12px;';
        b.onclick = () => {
          pilotState.activeStyle = meta.id;
          if (typeof localStorage !== 'undefined') localStorage.setItem('abyssea_pilot_style', meta.id);
          if (Abyssea.Assets && Abyssea.Assets.iconCache && Abyssea.Assets.iconCache.clear) {
            Abyssea.Assets.iconCache.clear();
          }
          applyBiomeGroundForStyle(meta.id);
          refreshButtons();
          if (Abyssea.UI && typeof Abyssea.UI.updateHUD === 'function') Abyssea.UI.updateHUD(true);
          if (Abyssea.game && Abyssea.game.toast) Abyssea.game.toast(`${meta.label}: ${meta.desc}`, 'info');
        };
        btns[meta.id] = b;
        bar.appendChild(b);
      }

      const demoBtn = document.createElement('button');
      demoBtn.type = 'button';
      demoBtn.textContent = 'Ver Demo Aquí';
      demoBtn.title = 'Coloca estructuras, enemigos e ítems cerca de tu personaje para comparar los 3 estilos';
      demoBtn.style.cssText = 'padding:4px 8px;border:1px solid #00e676;background:#0d3b26;color:#b9f6ca;border-radius:4px;cursor:pointer;font-family:inherit;font-size:12px;margin-left:4px;';
      demoBtn.onclick = spawnStyleDemoScene;
      bar.appendChild(demoBtn);

      refreshButtons();
      document.body.appendChild(bar);

      window.addEventListener('keydown', (ev) => {
        if (ev.code === 'F9') {
          pilotState.barVisible = !pilotState.barVisible;
          bar.style.display = pilotState.barVisible ? 'flex' : 'none';
        }
      });
    }

    if (typeof document !== 'undefined') {
      if (document.body) createPilotBar();
      else document.addEventListener('DOMContentLoaded', createPilotBar);
    }
  }

  hookPilotRenderer();
})();
