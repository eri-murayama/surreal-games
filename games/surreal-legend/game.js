(function () {
  'use strict';

  if (window.SurrealGames && window.SurrealGames.initShareAndFollow) {
    try { window.SurrealGames.initShareAndFollow('surreal-legend'); } catch (e) {}
  }

  var canvas = document.getElementById('game-canvas');
  var ctx = canvas.getContext('2d');
  var W = canvas.width, H = canvas.height;
  var TILE = 40;
  var COLS = W / TILE; // 9
  var ROWS = H / TILE; // 12

  // タイル: 0=草, 1=木, 2=岩, 3=扉(鍵で開く), 4=穴(通れない)
  function makeStage(num) {
    // 各ステージのレイアウト（手書き）
    var maps = [
      [
        '111111111',
        '1.......1',
        '1.2...2.1',
        '1.......1',
        '1...4...1',
        '1...4...1',
        '1.......1',
        '1.2...2.1',
        '1.......1',
        '1.......1',
        '1.......3',
        '111111111'
      ],
      [
        '111111111',
        '1.......1',
        '1.22.22.1',
        '1.......1',
        '1.4.4.4.1',
        '1.......1',
        '1.4.4.4.1',
        '1.......1',
        '1.22.22.1',
        '1.......1',
        '1.......3',
        '111111111'
      ],
      [
        '111111111',
        '1...2...1',
        '1.2...2.1',
        '1.......1',
        '14.....41',
        '1.......1',
        '1.......1',
        '14.....41',
        '1.......1',
        '1.2...2.1',
        '1...2...3',
        '111111111'
      ]
    ];
    var raw = maps[num - 1] || maps[0];
    var grid = [];
    for (var r = 0; r < ROWS; r++) {
      var row = [];
      for (var c = 0; c < COLS; c++) {
        var ch = raw[r] ? raw[r][c] : '.';
        var v = 0;
        if (ch === '1') v = 1;
        else if (ch === '2') v = 2;
        else if (ch === '3') v = 3;
        else if (ch === '4') v = 4;
        row.push(v);
      }
      grid.push(row);
    }
    // 敵配置
    var enemies = [];
    var enemyCount = num === 3 ? 5 : num === 2 ? 4 : 3;
    for (var i = 0; i < enemyCount; i++) {
      var ex, ey, tries = 0;
      do {
        ex = 1 + Math.floor(Math.random() * (COLS - 2));
        ey = 3 + Math.floor(Math.random() * (ROWS - 6));
        tries++;
      } while (grid[ey][ex] !== 0 && tries < 50);
      enemies.push({
        x: ex * TILE + 4, y: ey * TILE + 4,
        hp: num === 3 ? 2 : 1,
        dx: 0, dy: 0,
        moveTimer: 0,
        hurt: 0,
        boss: num === 3 && i === 0
      });
    }
    if (num === 3) enemies[0].hp = 4; // ボス
    // 鍵
    var key = null;
    do {
      var kx = 1 + Math.floor(Math.random() * (COLS - 2));
      var ky = 3 + Math.floor(Math.random() * (ROWS - 6));
      if (grid[ky][kx] === 0) key = { x: kx * TILE + 12, y: ky * TILE + 12 };
    } while (!key);
    return { grid: grid, enemies: enemies, key: key, hasKey: false };
  }

  var state = {
    stage: 1,
    maxStage: 3,
    player: null,
    map: null,
    hp: 3,
    maxHp: 3,
    invuln: 0,
    attackTimer: 0,
    attackDir: { x: 0, y: -1 },
    keys: {},
    running: false,
    dpadDir: null
  };

  function resetPlayer() {
    state.player = { x: TILE + 4, y: TILE + 4, dir: { x: 0, y: 1 } };
  }

  function loadStage(n) {
    state.stage = n;
    state.map = makeStage(n);
    resetPlayer();
    updateHud();
  }

  function updateHud() {
    var hearts = '';
    for (var i = 0; i < state.maxHp; i++) hearts += i < state.hp ? '❤️' : '🖤';
    document.getElementById('hearts').textContent = hearts;
    document.getElementById('stage-info').textContent = 'ステージ ' + state.stage + ' / ' + state.maxStage;
    document.getElementById('key-info').textContent = state.map && state.map.hasKey ? '🗝️ 1' : '🗝️ 0';
  }

  // 衝突判定: 矩形 vs マップ
  function isBlocked(x, y, w, h) {
    var pts = [
      [x, y], [x + w - 1, y],
      [x, y + h - 1], [x + w - 1, y + h - 1]
    ];
    for (var i = 0; i < pts.length; i++) {
      var c = Math.floor(pts[i][0] / TILE);
      var r = Math.floor(pts[i][1] / TILE);
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return true;
      var t = state.map.grid[r][c];
      if (t === 1 || t === 2 || t === 4) return true;
      if (t === 3 && !state.map.hasKey) return true;
    }
    return false;
  }

  function tileAt(x, y) {
    var c = Math.floor(x / TILE);
    var r = Math.floor(y / TILE);
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return -1;
    return state.map.grid[r][c];
  }

  function step() {
    if (!state.running) return;
    var p = state.player;
    var speed = 2.2;
    var dx = 0, dy = 0;
    if (state.keys['ArrowUp'] || state.dpadDir === 'up') dy -= 1;
    if (state.keys['ArrowDown'] || state.dpadDir === 'down') dy += 1;
    if (state.keys['ArrowLeft'] || state.dpadDir === 'left') dx -= 1;
    if (state.keys['ArrowRight'] || state.dpadDir === 'right') dx += 1;
    if (dx || dy) {
      var len = Math.hypot(dx, dy);
      dx /= len; dy /= len;
      p.dir = { x: dx, y: dy };
      var nx = p.x + dx * speed;
      var ny = p.y + dy * speed;
      if (!isBlocked(nx, p.y, 32, 32)) p.x = nx;
      if (!isBlocked(p.x, ny, 32, 32)) p.y = ny;
    }

    // 鍵を取る
    if (state.map.key) {
      var kdx = (p.x + 16) - state.map.key.x;
      var kdy = (p.y + 16) - state.map.key.y;
      if (Math.hypot(kdx, kdy) < 24) {
        state.map.hasKey = true;
        state.map.key = null;
        updateHud();
      }
    }

    // 扉でクリア
    var pt = tileAt(p.x + 16, p.y + 16);
    if (pt === 3 && state.map.hasKey) {
      if (state.stage < state.maxStage) {
        loadStage(state.stage + 1);
      } else {
        endGame(true);
      }
      return;
    }

    // 敵移動・接触
    if (state.invuln > 0) state.invuln--;
    for (var i = 0; i < state.map.enemies.length; i++) {
      var e = state.map.enemies[i];
      if (e.hurt > 0) e.hurt--;
      e.moveTimer--;
      if (e.moveTimer <= 0) {
        var dirs = [[1,0],[-1,0],[0,1],[0,-1],[0,0]];
        var d = dirs[Math.floor(Math.random() * dirs.length)];
        e.dx = d[0]; e.dy = d[1];
        e.moveTimer = 30 + Math.floor(Math.random() * 40);
      }
      var espd = e.boss ? 1.4 : 1.0;
      var ex2 = e.x + e.dx * espd;
      var ey2 = e.y + e.dy * espd;
      if (!isBlocked(ex2, e.y, 30, 30)) e.x = ex2; else e.dx = -e.dx;
      if (!isBlocked(e.x, ey2, 30, 30)) e.y = ey2; else e.dy = -e.dy;
      // 接触
      if (state.invuln === 0) {
        var ddx = (p.x + 16) - (e.x + 15);
        var ddy = (p.y + 16) - (e.y + 15);
        if (Math.abs(ddx) < 24 && Math.abs(ddy) < 24) {
          state.hp--;
          state.invuln = 60;
          // ノックバック
          var kn = 16;
          var nl = Math.hypot(ddx, ddy) || 1;
          var pnx = p.x + (ddx / nl) * kn;
          var pny = p.y + (ddy / nl) * kn;
          if (!isBlocked(pnx, p.y, 32, 32)) p.x = pnx;
          if (!isBlocked(p.x, pny, 32, 32)) p.y = pny;
          updateHud();
          if (state.hp <= 0) { endGame(false); return; }
        }
      }
    }

    // 攻撃判定
    if (state.attackTimer > 0) {
      state.attackTimer--;
      var swordX = p.x + 16 + state.attackDir.x * 28 - 14;
      var swordY = p.y + 16 + state.attackDir.y * 28 - 14;
      for (var j = state.map.enemies.length - 1; j >= 0; j--) {
        var en = state.map.enemies[j];
        if (en.hurt > 0) continue;
        if (Math.abs((swordX + 14) - (en.x + 15)) < 22 &&
            Math.abs((swordY + 14) - (en.y + 15)) < 22) {
          en.hp--;
          en.hurt = 18;
          if (en.hp <= 0) state.map.enemies.splice(j, 1);
        }
      }
    }
  }

  function attack() {
    if (!state.running) return;
    if (state.attackTimer > 0) return;
    state.attackTimer = 14;
    state.attackDir = { x: state.player.dir.x, y: state.player.dir.y };
    if (!state.attackDir.x && !state.attackDir.y) state.attackDir = { x: 0, y: 1 };
  }

  function draw() {
    ctx.fillStyle = '#4a8c2a';
    ctx.fillRect(0, 0, W, H);
    if (!state.map) return;

    // タイル
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var t = state.map.grid[r][c];
        var x = c * TILE, y = r * TILE;
        if (t === 1) {
          // 木
          ctx.fillStyle = '#2d5016';
          ctx.fillRect(x, y, TILE, TILE);
          ctx.fillStyle = '#5a8a3a';
          ctx.beginPath();
          ctx.arc(x + TILE/2, y + TILE/2, TILE/2 - 4, 0, Math.PI * 2);
          ctx.fill();
        } else if (t === 2) {
          // 岩
          ctx.fillStyle = '#888';
          ctx.beginPath();
          ctx.arc(x + TILE/2, y + TILE/2, TILE/2 - 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#aaa';
          ctx.beginPath();
          ctx.arc(x + TILE/2 - 4, y + TILE/2 - 4, 4, 0, Math.PI * 2);
          ctx.fill();
        } else if (t === 3) {
          // 扉
          ctx.fillStyle = state.map.hasKey ? '#ffd166' : '#6b3a1a';
          ctx.fillRect(x + 4, y + 4, TILE - 8, TILE - 8);
          ctx.fillStyle = '#000';
          ctx.font = '24px serif';
          ctx.textAlign = 'center';
          ctx.fillText(state.map.hasKey ? '🚪' : '🔒', x + TILE/2, y + TILE/2 + 8);
        } else if (t === 4) {
          // 穴
          ctx.fillStyle = '#1a1a1a';
          ctx.fillRect(x + 2, y + 2, TILE - 4, TILE - 4);
        } else {
          // 草地装飾
          if ((r + c) % 3 === 0) {
            ctx.fillStyle = '#3d7820';
            ctx.fillRect(x + 6, y + 30, 4, 4);
            ctx.fillRect(x + 24, y + 12, 4, 4);
          }
        }
      }
    }

    // 鍵
    if (state.map.key) {
      ctx.font = '24px serif';
      ctx.textAlign = 'center';
      ctx.fillText('🗝️', state.map.key.x, state.map.key.y + 8);
    }

    // 敵
    for (var i = 0; i < state.map.enemies.length; i++) {
      var e = state.map.enemies[i];
      if (e.hurt > 0 && (e.hurt % 6) < 3) continue;
      ctx.font = e.boss ? '36px serif' : '28px serif';
      ctx.textAlign = 'center';
      ctx.fillText(e.boss ? '👹' : '👾', e.x + 15, e.y + 26);
    }

    // プレイヤー
    var p = state.player;
    if (state.invuln === 0 || (state.invuln % 6) < 3) {
      ctx.font = '28px serif';
      ctx.textAlign = 'center';
      ctx.fillText('💩', p.x + 16, p.y + 26);
    }

    // 剣エフェクト
    if (state.attackTimer > 0) {
      var sx = p.x + 16 + state.attackDir.x * 28;
      var sy = p.y + 16 + state.attackDir.y * 28;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(Math.atan2(state.attackDir.y, state.attackDir.x) + Math.PI / 4);
      ctx.fillStyle = '#fff';
      ctx.fillRect(-3, -16, 6, 24);
      ctx.fillStyle = '#ffd166';
      ctx.fillRect(-8, 8, 16, 4);
      ctx.restore();
    }
  }

  function loop() {
    step();
    draw();
    requestAnimationFrame(loop);
  }

  function startGame() {
    state.hp = state.maxHp;
    state.invuln = 0;
    loadStage(1);
    state.running = true;
    document.getElementById('title-overlay').classList.remove('show');
    document.getElementById('end-overlay').classList.remove('show');
  }

  function endGame(win) {
    state.running = false;
    var ov = document.getElementById('end-overlay');
    document.getElementById('end-title').textContent = win ? '🎉 魔王撃破！' : '💀 ぜんめつ…';
    document.getElementById('end-text').textContent = win
      ? 'うんこ勇者は世界を救った！'
      : 'ステージ ' + state.stage + ' でやられてしまった…';
    ov.classList.add('show');
  }

  // 入力
  window.addEventListener('keydown', function (e) {
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].indexOf(e.key) >= 0) e.preventDefault();
    state.keys[e.key] = true;
    if (e.key === ' ') attack();
  });
  window.addEventListener('keyup', function (e) {
    state.keys[e.key] = false;
  });

  // D-pad
  var dpadButtons = document.querySelectorAll('.dpad button');
  dpadButtons.forEach(function (btn) {
    var dir = btn.getAttribute('data-dir');
    var press = function (e) { e.preventDefault(); state.dpadDir = dir; };
    var release = function (e) { e.preventDefault(); if (state.dpadDir === dir) state.dpadDir = null; };
    btn.addEventListener('touchstart', press, { passive: false });
    btn.addEventListener('touchend', release);
    btn.addEventListener('touchcancel', release);
    btn.addEventListener('mousedown', press);
    btn.addEventListener('mouseup', release);
    btn.addEventListener('mouseleave', release);
  });

  document.getElementById('attack-btn').addEventListener('click', attack);
  document.getElementById('attack-btn').addEventListener('touchstart', function (e) {
    e.preventDefault(); attack();
  }, { passive: false });

  document.getElementById('start-btn').addEventListener('click', startGame);
  document.getElementById('restart-btn').addEventListener('click', startGame);
  document.getElementById('share-btn').addEventListener('click', function () {
    var text = encodeURIComponent('うんこ勇者でシュール伝説を冒険したよ！ #シュールゲームス @tadanosyuhuda');
    var url = encodeURIComponent('https://eri-murayama.github.io/surreal-games/games/surreal-legend/');
    window.open('https://twitter.com/intent/tweet?text=' + text + '&url=' + url, '_blank');
  });

  document.getElementById('title-overlay').classList.add('show');
  loop();
})();
