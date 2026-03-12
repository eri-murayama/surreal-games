// ========================================
// 黄金ドライバー ～博士のせなかでGO！～
// ========================================

(function () {
  'use strict';

  // --- 定数 ---
  const CANVAS_W = 400;
  const CANVAS_H = 500;
  const ROAD_W = 240;
  const LANE_COUNT = 3;
  const LANE_W = ROAD_W / LANE_COUNT;
  const ROAD_LEFT = (CANVAS_W - ROAD_W) / 2;
  const LAPS = 3;
  const LAP_LENGTH = 1500; // 1ラップのスクロール距離
  const SCROLL_SCALE = 2.5; // 画面スクロール倍率

  // スロットの選択肢
  const SLOT_ITEMS = {
    body: [
      { emoji: '🏎️', name: 'スポーツカー', stat: 'speed', value: 2 },
      { emoji: '🚗', name: 'セダン', stat: 'speed', value: 1 },
      { emoji: '🛻', name: 'トラック', stat: 'speed', value: 0 },
      { emoji: '🚜', name: 'トラクター', stat: 'speed', value: -1 },
      { emoji: '🛒', name: 'ショッピングカート', stat: 'speed', value: -2 },
    ],
    engine: [
      { emoji: '🔥', name: 'ターボエンジン', stat: 'accel', value: 2 },
      { emoji: '⚡', name: '電気モーター', stat: 'accel', value: 1 },
      { emoji: '💨', name: 'ガスエンジン', stat: 'accel', value: 0 },
      { emoji: '🐹', name: 'ハムスター動力', stat: 'accel', value: -1 },
      { emoji: '🧠', name: '念力エンジン', stat: 'accel', value: -2 },
    ],
    tire: [
      { emoji: '⭕', name: 'レーシングタイヤ', stat: 'handling', value: 2 },
      { emoji: '🟤', name: 'ノーマルタイヤ', stat: 'handling', value: 1 },
      { emoji: '🍩', name: 'ドーナツ', stat: 'handling', value: 0 },
      { emoji: '🍊', name: 'みかん', stat: 'handling', value: -1 },
      { emoji: '👞', name: '博士のくつ', stat: 'handling', value: -2 },
    ],
  };

  // アイテム
  const RACE_ITEMS = [
    { name: 'バナナ', emoji: '🍌', effect: 'banana' },
    { name: 'ダッシュ', emoji: '🚀', effect: 'boost' },
    { name: 'おにぎり', emoji: '🍙', effect: 'shield' },
  ];

  // ライバル名
  const RIVAL_NAMES = ['ガンテツ', 'ヒロシ', 'マサオ'];
  const RIVAL_COLORS = ['#cc3333', '#3333cc', '#33cc33'];

  // --- 状態 ---
  let phase = 'title'; // title, slot, race, result
  let slotStep = 0; // 0=body, 1=engine, 2=tire
  let slotSpinning = false;
  let selectedParts = { body: null, engine: null, tire: null };

  let playerStats = { speed: 5, accel: 5, handling: 5 };

  // レース状態
  let raceState = null;

  // --- DOM ---
  const titleScreen = document.getElementById('title-screen');
  const slotScreen = document.getElementById('slot-screen');
  const raceScreen = document.getElementById('race-screen');
  const resultScreen = document.getElementById('result-screen');

  const startBtn = document.getElementById('start-btn');
  const slotBtn = document.getElementById('slot-btn');
  const raceBtn = document.getElementById('race-btn');
  const retryBtn = document.getElementById('retry-btn');

  const hakaseSpeech = document.getElementById('hakase-speech');
  const slotResult = document.getElementById('slot-result');
  const canvas = document.getElementById('race-canvas');
  const ctx = canvas.getContext('2d');

  const hudPosition = document.getElementById('hud-position');
  const hudLap = document.getElementById('hud-lap');
  const hudItem = document.getElementById('hud-item');
  const raceMessage = document.getElementById('race-message');

  // --- 画面切り替え ---
  function showScreen(name) {
    [titleScreen, slotScreen, raceScreen, resultScreen].forEach(s => s.classList.add('hidden'));
    phase = name;
    switch (name) {
      case 'title': titleScreen.classList.remove('hidden'); break;
      case 'slot': slotScreen.classList.remove('hidden'); break;
      case 'race': raceScreen.classList.remove('hidden'); break;
      case 'result': resultScreen.classList.remove('hidden'); break;
    }
  }

  // --- スロット ---
  function initSlots() {
    slotStep = 0;
    slotSpinning = false;
    selectedParts = { body: null, engine: null, tire: null };
    slotBtn.textContent = 'まわす！';
    slotBtn.disabled = false;
    raceBtn.classList.add('hidden');
    slotResult.classList.add('hidden');
    hakaseSpeech.textContent = '「パーツをスロットで決めるぞい！」';

    const reelKeys = ['body', 'engine', 'tire'];
    const reelEls = [
      document.querySelector('#reel1 .slot-strip'),
      document.querySelector('#reel2 .slot-strip'),
      document.querySelector('#reel3 .slot-strip'),
    ];

    reelEls.forEach((el, i) => {
      el.innerHTML = '';
      // 複数回繰り返してスクロール感を出す
      const items = SLOT_ITEMS[reelKeys[i]];
      for (let r = 0; r < 6; r++) {
        items.forEach(item => {
          const div = document.createElement('div');
          div.className = 'slot-item';
          div.textContent = item.emoji;
          el.appendChild(div);
        });
      }
      el.style.top = '0px';
    });
  }

  // 全リールを同時に回し始める
  let reelIntervals = [null, null, null];

  function spinAllReels() {
    const reelKeys = ['body', 'engine', 'tire'];
    const reelEls = document.querySelectorAll('.slot-strip');

    reelKeys.forEach((key, i) => {
      const reelEl = reelEls[i];
      const items = SLOT_ITEMS[key];
      const itemH = reelEl.parentElement.offsetHeight;

      reelIntervals[i] = setInterval(() => {
        const currentTop = parseFloat(reelEl.style.top) || 0;
        reelEl.style.top = (currentTop - itemH) + 'px';
        const maxScroll = items.length * itemH * 3;
        if (Math.abs(parseFloat(reelEl.style.top)) > maxScroll) {
          reelEl.style.top = '0px';
        }
      }, 50 + i * 15); // 微妙にずらして見た目を良く
    });

    slotSpinning = true;
    slotBtn.textContent = 'ストップ！';
    slotBtn.disabled = false;
    hakaseSpeech.textContent = '「クリックかスペースで止めるぞい！」';
  }

  function stopNextSlot() {
    if (!slotSpinning || slotStep >= 3) return;

    const reelKeys = ['body', 'engine', 'tire'];
    const key = reelKeys[slotStep];
    const reelEl = document.querySelectorAll('.slot-strip')[slotStep];
    const items = SLOT_ITEMS[key];
    const itemH = reelEl.parentElement.offsetHeight;

    // このリールを止める
    clearInterval(reelIntervals[slotStep]);
    reelIntervals[slotStep] = null;

    const finalIdx = Math.floor(Math.random() * items.length);
    reelEl.style.top = -(finalIdx * itemH) + 'px';
    selectedParts[key] = items[finalIdx];

    slotStep++;
    if (slotStep < 3) {
      const labels = ['エンジン', 'タイヤ'];
      hakaseSpeech.textContent = `「次は${labels[slotStep - 1]}を止めるぞい！」`;
    } else {
      slotSpinning = false;
      onAllSlotsComplete();
    }
  }

  function onAllSlotsComplete() {
    slotBtn.classList.add('hidden');

    // ステータス計算
    playerStats.speed = 5 + selectedParts.body.value;
    playerStats.accel = 5 + selectedParts.engine.value;
    playerStats.handling = 5 + selectedParts.tire.value;

    // オチ: できあがるのは車じゃなくて四つん這いの博士
    hakaseSpeech.textContent = '「完成じゃ！……あれ？」';

    setTimeout(() => {
      hakaseSpeech.textContent = '';
      slotResult.classList.remove('hidden');
      slotResult.innerHTML =
        `<div style="font-size:2rem;margin-bottom:8px;">🧓💦</div>` +
        `<strong>できあがったのは…四つん這いの博士！</strong><br><br>` +
        `ボディ: ${selectedParts.body.emoji} ${selectedParts.body.name}<br>` +
        `エンジン: ${selectedParts.engine.emoji} ${selectedParts.engine.name}<br>` +
        `タイヤ: ${selectedParts.tire.emoji} ${selectedParts.tire.name}<br><br>` +
        `<small>博士「わ、ワシがマシンなのかい！？」</small><br>` +
        `<small>少年「いくぜ博士！しっかりつかまれ…いや走れ！」</small>`;

      raceBtn.classList.remove('hidden');
    }, 500);
  }

  // --- レース ---
  function startRace() {
    showScreen('race');

    const baseSpeed = 2.5 + playerStats.speed * 0.3;

    raceState = {
      player: {
        x: ROAD_LEFT + LANE_W * 1 + LANE_W / 2,
        lane: 1,
        speed: baseSpeed,
        maxSpeed: baseSpeed + 2,
        distance: 0,
        lap: 1,
        item: null,
        shielded: false,
        shieldTimer: 0,
        boostTimer: 0,
        spinTimer: 0,
        steerSpeed: 2.5 + playerStats.handling * 0.3,
      },
      rivals: RIVAL_NAMES.map((name, i) => ({
        name,
        color: RIVAL_COLORS[i],
        x: ROAD_LEFT + LANE_W * i + LANE_W / 2,
        lane: i,
        speed: 2.8 + Math.random() * 1.5,
        distance: 0,
        lap: 1,
        spinTimer: 0,
        changeLaneTimer: 60 + Math.random() * 120,
      })),
      obstacles: [],
      bananas: [],
      itemBoxes: [],
      scrollY: 0,
      countdown: 120, // 2秒
      finished: false,
      finishOrder: [],
      startTime: 0,
      elapsed: 0,
    };

    // 障害物・アイテムボックス生成
    generateTrackObjects();

    raceMessage.classList.remove('hidden');
    raceMessage.textContent = '3';
    raceLoop();
  }

  function generateTrackObjects() {
    const totalDist = LAPS * LAP_LENGTH;

    // 障害物（岩） - 間隔を広くし、全レーン塞がないようにする
    for (let d = 300; d < totalDist; d += 250 + Math.random() * 300) {
      const lane = Math.floor(Math.random() * LANE_COUNT);
      raceState.obstacles.push({
        x: ROAD_LEFT + LANE_W * lane + LANE_W / 2,
        dist: d,
        type: 'rock',
        hit: false,
      });
    }

    // アイテムボックス - 間隔を狭くして取りやすく
    for (let d = 150; d < totalDist; d += 200 + Math.random() * 150) {
      const lane = Math.floor(Math.random() * LANE_COUNT);
      raceState.itemBoxes.push({
        x: ROAD_LEFT + LANE_W * lane + LANE_W / 2,
        dist: d,
        active: true,
      });
    }
  }

  // --- 入力 ---
  const keys = {};
  const GAME_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'a', 'd', 'z']);
  document.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (GAME_KEYS.has(e.key)) e.preventDefault();
    // スロット中はスペース/Enterで停止
    if (phase === 'slot' && (e.key === ' ' || e.key === 'Enter')) stopNextSlot();
  });
  document.addEventListener('keyup', e => { keys[e.key] = false; });

  // キャンバスクリック/タッチでレース操作
  canvas.addEventListener('mousedown', e => {
    if (phase !== 'race') return;
    const rect = canvas.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width;
    if (cx < 0.33) keys['ArrowLeft'] = true;
    else if (cx > 0.66) keys['ArrowRight'] = true;
    else { keys[' '] = true; }
  });
  canvas.addEventListener('mouseup', () => {
    keys['ArrowLeft'] = false;
    keys['ArrowRight'] = false;
    keys[' '] = false;
  });
  canvas.addEventListener('mouseleave', () => {
    keys['ArrowLeft'] = false;
    keys['ArrowRight'] = false;
    keys[' '] = false;
  });
  canvas.addEventListener('touchstart', e => {
    if (phase !== 'race') return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const cx = (e.touches[0].clientX - rect.left) / rect.width;
    if (cx < 0.33) keys['ArrowLeft'] = true;
    else if (cx > 0.66) keys['ArrowRight'] = true;
    else { keys[' '] = true; }
  }, { passive: false });
  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    keys['ArrowLeft'] = false;
    keys['ArrowRight'] = false;
    keys[' '] = false;
  }, { passive: false });

  // --- レースループ ---
  let rafId = null;

  function raceLoop() {
    if (phase !== 'race') return;

    const rs = raceState;

    // カウントダウン
    if (rs.countdown > 0) {
      rs.countdown--;
      const sec = Math.ceil(rs.countdown / 60);
      if (sec > 0) {
        raceMessage.textContent = sec;
      } else {
        raceMessage.textContent = 'GO!';
        if (rs.countdown <= 0) {
          rs.startTime = performance.now();
          setTimeout(() => raceMessage.classList.add('hidden'), 500);
        }
      }
      drawRace();
      rafId = requestAnimationFrame(raceLoop);
      return;
    }

    rs.elapsed = performance.now() - rs.startTime;

    // --- プレイヤー操作 ---
    const p = rs.player;

    if (p.spinTimer > 0) {
      p.spinTimer--;
    } else {
      // 左右移動
      if (keys['ArrowLeft'] || keys['a']) {
        p.x -= p.steerSpeed;
      }
      if (keys['ArrowRight'] || keys['d']) {
        p.x += p.steerSpeed;
      }

      // 道路の範囲制限
      p.x = Math.max(ROAD_LEFT + 15, Math.min(ROAD_LEFT + ROAD_W - 15, p.x));

      // アイテム使用
      if ((keys[' '] || keys['z']) && p.item) {
        useItem(p);
        keys[' '] = false;
        keys['z'] = false;
      }
    }

    // ブースト
    let currentSpeed = p.speed;
    if (p.boostTimer > 0) {
      currentSpeed = p.maxSpeed + 3;
      p.boostTimer--;
    }

    p.distance += currentSpeed;

    // シールド
    if (p.shieldTimer > 0) p.shieldTimer--;
    else p.shielded = false;

    // ラップ管理
    const newLap = Math.floor(p.distance / LAP_LENGTH) + 1;
    if (newLap > p.lap && p.lap < LAPS) {
      p.lap = Math.min(newLap, LAPS);
    }
    if (p.distance >= LAPS * LAP_LENGTH && !rs.finished) {
      if (!rs.finishOrder.includes('player')) rs.finishOrder.push('player');
      if (rs.finishOrder.length >= 4 || rs.finishOrder.includes('player')) {
        endRace();
        return;
      }
    }

    // --- ライバルAI ---
    rs.rivals.forEach((r, i) => {
      if (r.spinTimer > 0) { r.spinTimer--; return; }

      r.distance += r.speed + Math.sin(rs.elapsed / 1000 + i) * 0.5;

      // たまに車線変更
      r.changeLaneTimer--;
      if (r.changeLaneTimer <= 0) {
        r.lane = Math.floor(Math.random() * LANE_COUNT);
        r.changeLaneTimer = 90 + Math.random() * 120;
      }

      const targetX = ROAD_LEFT + LANE_W * r.lane + LANE_W / 2;
      r.x += (targetX - r.x) * 0.05;

      // ゴール判定
      if (r.distance >= LAPS * LAP_LENGTH && !rs.finishOrder.includes(r.name)) {
        rs.finishOrder.push(r.name);
      }

      // ラップ
      r.lap = Math.min(Math.floor(r.distance / LAP_LENGTH) + 1, LAPS);
    });

    // --- 当たり判定 ---
    const viewDist = p.distance;

    // 障害物（hitフラグで同じ岩に連続ヒットしない）
    rs.obstacles.forEach(ob => {
      if (ob.hit) return;
      const relY = ob.dist - viewDist;
      if (Math.abs(relY) < 15 && Math.abs(ob.x - p.x) < 22) {
        ob.hit = true;
        if (!p.shielded) {
          p.spinTimer = 25;
        }
      }
    });

    // バナナ
    rs.bananas = rs.bananas.filter(b => {
      // ライバルとの当たり判定
      for (const r of rs.rivals) {
        const relY = b.dist - r.distance;
        if (Math.abs(relY) < 20 && Math.abs(b.x - r.x) < 22) {
          r.spinTimer = 30;
          return false;
        }
      }
      return true;
    });

    // アイテムボックス（判定を広めに）
    rs.itemBoxes.forEach(box => {
      if (!box.active) return;
      const relY = box.dist - viewDist;
      if (Math.abs(relY) < 30 && Math.abs(box.x - p.x) < 30 && !p.item) {
        p.item = RACE_ITEMS[Math.floor(Math.random() * RACE_ITEMS.length)];
        box.active = false;
      }
    });

    // --- HUD更新 ---
    const allRacers = [
      { name: 'player', dist: p.distance },
      ...rs.rivals.map(r => ({ name: r.name, dist: r.distance })),
    ].sort((a, b) => b.dist - a.dist);

    const position = allRacers.findIndex(r => r.name === 'player') + 1;
    const posLabels = ['1st', '2nd', '3rd', '4th'];
    hudPosition.textContent = '順位: ' + posLabels[position - 1];
    hudLap.textContent = `LAP: ${Math.min(p.lap, LAPS)}/${LAPS}`;
    hudItem.textContent = p.item ? p.item.emoji + ' ' + p.item.name : '';

    drawRace();
    rafId = requestAnimationFrame(raceLoop);
  }

  function useItem(p) {
    const item = p.item;
    p.item = null;
    switch (item.effect) {
      case 'banana':
        raceState.bananas.push({ x: p.x, dist: p.distance - 50 });
        break;
      case 'boost':
        p.boostTimer = 60;
        break;
      case 'shield':
        p.shielded = true;
        p.shieldTimer = 180;
        break;
    }
  }

  // --- 描画 ---
  function drawRace() {
    const rs = raceState;
    const p = rs.player;
    const viewDist = p.distance;

    // 背景
    ctx.fillStyle = '#7cac5c';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // 道路
    ctx.fillStyle = '#888';
    ctx.fillRect(ROAD_LEFT, 0, ROAD_W, CANVAS_H);

    // 道路端線
    ctx.fillStyle = '#fff';
    ctx.fillRect(ROAD_LEFT - 3, 0, 6, CANVAS_H);
    ctx.fillRect(ROAD_LEFT + ROAD_W - 3, 0, 6, CANVAS_H);

    // 車線（破線）
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 20]);
    const dashOffset = (viewDist * SCROLL_SCALE) % 40;
    for (let lane = 1; lane < LANE_COUNT; lane++) {
      const lx = ROAD_LEFT + LANE_W * lane;
      ctx.beginPath();
      ctx.moveTo(lx, -dashOffset);
      ctx.lineTo(lx, CANVAS_H);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // 道路脇の木
    const treeSpacing = 120;
    for (let i = 0; i < 10; i++) {
      const treeY = ((i * treeSpacing - (viewDist * SCROLL_SCALE) % treeSpacing) + CANVAS_H) % (CANVAS_H + treeSpacing) - 40;
      drawTree(ROAD_LEFT - 35, treeY);
      drawTree(ROAD_LEFT + ROAD_W + 15, treeY);
    }

    // 障害物
    rs.obstacles.forEach(ob => {
      const relY = ob.dist - viewDist;
      const screenY = CANVAS_H - 80 - relY * SCROLL_SCALE;
      if (screenY > -30 && screenY < CANVAS_H + 30) {
        drawRock(ob.x, screenY);
      }
    });

    // アイテムボックス
    rs.itemBoxes.forEach(box => {
      if (!box.active) return;
      const relY = box.dist - viewDist;
      const screenY = CANVAS_H - 80 - relY * SCROLL_SCALE;
      if (screenY > -30 && screenY < CANVAS_H + 30) {
        drawItemBox(box.x, screenY);
      }
    });

    // バナナ
    rs.bananas.forEach(b => {
      const relY = b.dist - viewDist;
      const screenY = CANVAS_H - 80 - relY * SCROLL_SCALE;
      if (screenY > -30 && screenY < CANVAS_H + 30) {
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🍌', b.x, screenY);
      }
    });

    // ライバル
    rs.rivals.forEach(r => {
      const relY = r.distance - viewDist;
      const screenY = CANVAS_H - 80 - relY * SCROLL_SCALE;
      if (screenY > -60 && screenY < CANVAS_H + 60) {
        drawRivalHakase(r.x, screenY, r.color, r.name, r.spinTimer > 0);
      }
    });

    // プレイヤー（博士に乗った少年）
    drawPlayerHakase(p.x, CANVAS_H - 80, p);
  }

  function drawTree(x, y) {
    // 幹
    ctx.fillStyle = '#8B6914';
    ctx.fillRect(x - 4, y + 10, 8, 15);
    // 葉
    ctx.fillStyle = '#2d6b1e';
    ctx.beginPath();
    ctx.arc(x, y + 5, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a8a2a';
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawRock(x, y) {
    ctx.fillStyle = '#666';
    ctx.beginPath();
    ctx.ellipse(x, y, 14, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.ellipse(x - 2, y - 2, 10, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawItemBox(x, y) {
    const bobble = Math.sin(performance.now() / 200) * 3;
    ctx.fillStyle = '#ffd700';
    ctx.strokeStyle = '#cc6600';
    ctx.lineWidth = 2;
    ctx.fillRect(x - 12, y - 12 + bobble, 24, 24);
    ctx.strokeRect(x - 12, y - 12 + bobble, 24, 24);
    ctx.fillStyle = '#cc6600';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('?', x, y + 5 + bobble);
  }

  function drawPlayerHakase(x, y, p) {
    const wobble = Math.sin(performance.now() / 100) * 2;
    const spin = p.spinTimer > 0;

    ctx.save();
    ctx.translate(x, y);
    if (spin) ctx.rotate(Math.sin(performance.now() / 50) * 0.5);

    // 博士（四つん這い）
    // 体
    ctx.fillStyle = '#e8d5b0';
    ctx.fillRect(-18, 5 + wobble, 36, 14);
    // 白衣
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(-20, 3 + wobble, 40, 16);
    // 頭
    ctx.fillStyle = '#e8d5b0';
    ctx.beginPath();
    ctx.arc(22, 6 + wobble, 10, 0, Math.PI * 2);
    ctx.fill();
    // メガネ
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(24, 5 + wobble, 4, 0, Math.PI * 2);
    ctx.stroke();
    // ヒゲ
    ctx.fillStyle = '#999';
    ctx.fillRect(26, 9 + wobble, 6, 3);
    // 手足（四つん這い）
    ctx.fillStyle = '#e8d5b0';
    ctx.fillRect(-22, 17 + wobble, 6, 10);
    ctx.fillRect(-8, 17 + wobble, 6, 10);
    ctx.fillRect(10, 17 + wobble, 6, 10);
    ctx.fillRect(22, 17 + wobble, 6, 10);

    // 少年（博士の上に乗っている）
    // 体（タンクトップ）
    ctx.fillStyle = '#ff6633';
    ctx.fillRect(-8, -18 + wobble, 16, 16);
    // 腕
    ctx.fillStyle = '#ffcc88';
    ctx.fillRect(-14, -14 + wobble, 6, 12);
    ctx.fillRect(8, -14 + wobble, 6, 12);
    // 顔
    ctx.fillStyle = '#ffcc88';
    ctx.beginPath();
    ctx.arc(0, -26 + wobble, 10, 0, Math.PI * 2);
    ctx.fill();
    // 帽子（つばが後ろ）
    ctx.fillStyle = '#cc3333';
    ctx.beginPath();
    ctx.arc(0, -31 + wobble, 11, Math.PI, 0);
    ctx.fill();
    // つば（後ろ向き）
    ctx.fillStyle = '#aa2222';
    ctx.fillRect(-14, -31 + wobble, 8, 4);
    // 絆創膏
    ctx.fillStyle = '#f5deb3';
    ctx.save();
    ctx.translate(3, -25 + wobble);
    ctx.rotate(0.3);
    ctx.fillRect(-4, -1.5, 8, 3);
    ctx.restore();
    // 目（熱血）
    ctx.fillStyle = '#000';
    ctx.fillRect(-4, -28 + wobble, 3, 3);
    ctx.fillRect(2, -28 + wobble, 3, 3);
    // 口（にやり）
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -22 + wobble, 4, 0.1, Math.PI - 0.1);
    ctx.stroke();

    // シールドエフェクト
    if (p.shielded) {
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, 30, 35, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // ブーストエフェクト
    if (p.boostTimer > 0) {
      ctx.fillStyle = '#ff4400';
      for (let i = 0; i < 3; i++) {
        const fx = -6 + i * 6 + Math.random() * 4;
        const fy = 28 + Math.random() * 10;
        ctx.beginPath();
        ctx.arc(fx, fy, 3 + Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  function drawRivalHakase(x, y, color, name, spinning) {
    const wobble = Math.sin(performance.now() / 120) * 2;

    ctx.save();
    ctx.translate(x, y);
    if (spinning) ctx.rotate(Math.sin(performance.now() / 50) * 0.5);

    // 博士（四つん這い） - 少し小さめ
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(-15, 3 + wobble, 30, 12);
    ctx.fillStyle = '#e8d5b0';
    ctx.beginPath();
    ctx.arc(18, 5 + wobble, 8, 0, Math.PI * 2);
    ctx.fill();

    // ライダー
    ctx.fillStyle = color;
    ctx.fillRect(-6, -12 + wobble, 12, 12);
    ctx.fillStyle = '#ffcc88';
    ctx.beginPath();
    ctx.arc(0, -18 + wobble, 7, 0, Math.PI * 2);
    ctx.fill();

    // 手足
    ctx.fillStyle = '#e8d5b0';
    ctx.fillRect(-18, 13 + wobble, 5, 8);
    ctx.fillRect(-6, 13 + wobble, 5, 8);
    ctx.fillRect(8, 13 + wobble, 5, 8);
    ctx.fillRect(18, 13 + wobble, 5, 8);

    // 名前
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name, 0, -28 + wobble);

    ctx.restore();
  }

  // --- レース終了 ---
  function endRace() {
    raceState.finished = true;
    if (rafId) cancelAnimationFrame(rafId);

    const pos = raceState.finishOrder.indexOf('player');
    const position = pos === -1 ? 4 : pos + 1;
    const elapsed = raceState.elapsed;
    const sec = (elapsed / 1000).toFixed(2);

    const resultTitle = document.getElementById('result-title');
    const resultComment = document.getElementById('result-comment');
    const resultTime = document.getElementById('result-time');

    const posLabels = ['1位', '2位', '3位', '4位'];
    const comments = [
      '「俺は黄金の金色ドライバーになりゃ！」\n…なった！博士もヘトヘトだ！',
      '惜しい！博士「ワシの膝がもう少し若ければ…」',
      '少年「くっ…次は負けねえぞ！」\n博士「ワシも次はやめたいんじゃが」',
      '博士がゴール前で寝てしまった！\n博士「す、すまんのう…」',
    ];

    resultTitle.textContent = `結果: ${posLabels[position - 1]}！`;
    resultTitle.style.color = position === 1 ? '#ffd700' : '#cc6600';
    resultComment.textContent = comments[position - 1];
    resultTime.textContent = `タイム: ${sec}秒`;

    showScreen('result');
  }

  // --- イベント ---
  startBtn.addEventListener('click', () => {
    showScreen('slot');
    initSlots();
    spinAllReels();
  });

  slotBtn.addEventListener('click', stopNextSlot);

  raceBtn.addEventListener('click', startRace);

  retryBtn.addEventListener('click', () => {
    showScreen('title');
    slotBtn.classList.remove('hidden');
    slotBtn.textContent = 'まわす！';
  });

  // --- 初期化 ---
  showScreen('title');

})();
