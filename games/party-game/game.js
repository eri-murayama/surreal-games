// ===== 定数 =====
const BATTLE_DURATION = 10;

const PLAYER_DEFS = [
  { id: 1, name: 'プレイヤー1', key: 'f', chara: '🔴', color: '#ff3366' },
  { id: 2, name: 'プレイヤー2', key: 'j', chara: '🔵', color: '#2ab7a9' },
  { id: 3, name: 'プレイヤー3', key: 'v', chara: '🟡', color: '#ffaa00' },
  { id: 4, name: 'プレイヤー4', key: 'n', chara: '🟣', color: '#7c3aed' },
];

const FUNNY_WORDS = [
  'ドンッ', 'バシッ', 'ガンッ', 'ドカッ', 'パーン',
  'ペチッ', 'ボコッ', 'ズガン', 'メキッ', 'バキッ',
];

const COMMENTS_MULTI = [
  '圧倒的な指の暴力！！',
  'キーボードが悲鳴を上げている……',
  '指がちぎれそう！！',
  'すごい連打だ……キーボードメーカーが泣いてる。',
  'もはや格闘技。',
];

const COMMENTS_SOLO = [
  'ひとりで楽しそうだね！！',
  '孤独の連打……だがそれがいい。',
  'ぼっちプレイヤーの本気を見た。',
  '一人パーティー、最高じゃん。',
  'キーボードとの真剣勝負！',
];

// ===== 画面DOM =====
const screens = {
  mode: document.getElementById('mode-screen'),
  localSetup: document.getElementById('local-setup-screen'),
  onlineLobby: document.getElementById('online-lobby-screen'),
  onlineWait: document.getElementById('online-wait-screen'),
  countdown: document.getElementById('countdown-screen'),
  battle: document.getElementById('battle-screen'),
  result: document.getElementById('result-screen'),
};

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.add('hidden'));
  screens[name].classList.remove('hidden');
}

// ===== ゲーム状態 =====
let gameMode = 'local'; // 'local' | 'online'
let playerCount = 0;
let counts = {};
let battleTimer = null;
let timeLeft = 0;
let gameRunning = false;

// ===== オンライン状態 =====
let peer = null;
let isHost = false;
let myPlayerId = 0; // 0-indexed
let connections = []; // ホスト側: 接続リスト
let hostConn = null;  // ゲスト側: ホストへの接続
let onlinePlayers = []; // { id, name, chara, color }

// ===== 共通DOM =====
const countdownNumber = document.getElementById('countdown-number');
const battleTimerEl = document.getElementById('battle-timer');
const playerLanes = document.getElementById('player-lanes');
const resultList = document.getElementById('result-list');
const resultComment = document.getElementById('result-comment');

// ============================================================
//  モード選択
// ============================================================
document.getElementById('mode-local-btn').addEventListener('click', () => {
  gameMode = 'local';
  showScreen('localSetup');
});

document.getElementById('mode-online-btn').addEventListener('click', () => {
  gameMode = 'online';
  showScreen('onlineLobby');
  document.getElementById('host-panel').classList.add('hidden');
  document.getElementById('join-panel').classList.add('hidden');
  document.getElementById('online-status').textContent = '';
});

document.getElementById('local-back-btn').addEventListener('click', () => showScreen('mode'));
document.getElementById('online-back-btn').addEventListener('click', () => {
  cleanupPeer();
  showScreen('mode');
});

// ============================================================
//  ローカル対戦
// ============================================================
document.querySelectorAll('.player-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    playerCount = parseInt(btn.dataset.count);
    startCountdown();
  });
});

document.getElementById('retry-btn').addEventListener('click', () => {
  if (gameMode === 'online') {
    if (isHost) {
      // ホスト：リトライ指令を全員に送信
      broadcast({ type: 'countdown' });
      startCountdown();
    }
    // ゲストのリトライはホストが制御するので何もしない
  } else {
    startCountdown();
  }
});

document.getElementById('back-btn').addEventListener('click', () => {
  cleanupPeer();
  showScreen('mode');
});

// ============================================================
//  カウントダウン → バトル
// ============================================================
function startCountdown() {
  showScreen('countdown');
  let count = 3;
  countdownNumber.textContent = count;

  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      countdownNumber.textContent = count;
    } else {
      countdownNumber.textContent = 'GO!';
      clearInterval(interval);
      setTimeout(() => {
        showScreen('battle');
        startBattle();
      }, 500);
    }
  }, 800);
}

function startBattle() {
  gameRunning = true;
  timeLeft = BATTLE_DURATION;
  counts = {};

  const players = gameMode === 'local'
    ? PLAYER_DEFS.slice(0, playerCount)
    : onlinePlayers;

  // レーン生成
  playerLanes.innerHTML = '';
  players.forEach((p, i) => {
    counts[p.id] = 0;
    const lane = document.createElement('div');
    lane.className = 'player-lane';
    lane.id = `lane-${p.id}`;

    // オンラインで自分のレーンをハイライト
    if (gameMode === 'online' && i === myPlayerId) {
      lane.classList.add('me');
    }

    const keyLabel = gameMode === 'local'
      ? `[${p.key.toUpperCase()}] キー`
      : (i === myPlayerId ? '[スペース] キー' : '');

    lane.innerHTML = `
      <div class="lane-chara">${p.chara}</div>
      <div class="lane-name">${p.name}</div>
      <div class="lane-key">${keyLabel}</div>
      <div class="lane-bar-container">
        <div class="lane-bar lane-bar--p${i + 1}" id="bar-${p.id}"></div>
      </div>
      <div class="lane-count" id="count-${p.id}">0</div>
    `;
    playerLanes.appendChild(lane);
  });

  battleTimerEl.textContent = timeLeft;
  battleTimerEl.classList.remove('urgent');

  // タイマー
  battleTimer = setInterval(() => {
    timeLeft--;
    battleTimerEl.textContent = timeLeft;
    if (timeLeft <= 3) battleTimerEl.classList.add('urgent');
    if (timeLeft <= 0) {
      clearInterval(battleTimer);
      endBattle();
    }
  }, 1000);
}

// ===== キー入力 =====
document.addEventListener('keydown', (e) => {
  if (!gameRunning || e.repeat) return;

  if (gameMode === 'local') {
    handleLocalKey(e);
  } else {
    handleOnlineKey(e);
  }
});

function handleLocalKey(e) {
  const key = e.key.toLowerCase();
  const player = PLAYER_DEFS.find(p => p.key === key);
  if (!player || counts[player.id] === undefined) return;
  e.preventDefault();
  counts[player.id]++;
  updateLane(player, counts[player.id]);
}

function handleOnlineKey(e) {
  if (e.key !== ' ' && e.key !== 'Space') return;
  e.preventDefault();

  const player = onlinePlayers[myPlayerId];
  if (!player) return;
  counts[player.id]++;
  updateLane(player, counts[player.id]);

  // 自分のカウントを送信
  if (isHost) {
    // ホスト：自分のカウントを全員にブロードキャスト
    broadcast({ type: 'tap', playerId: player.id, count: counts[player.id] });
  } else {
    // ゲスト：ホストに送信
    sendToHost({ type: 'tap', playerId: player.id, count: counts[player.id] });
  }
}

function updateLane(player, count) {
  const countEl = document.getElementById(`count-${player.id}`);
  const barEl = document.getElementById(`bar-${player.id}`);
  const laneEl = document.getElementById(`lane-${player.id}`);
  if (!countEl || !barEl || !laneEl) return;

  countEl.textContent = count;
  barEl.style.height = `${Math.min(100, (count / 200) * 100)}%`;

  laneEl.classList.remove('flash');
  void laneEl.offsetWidth;
  laneEl.classList.add('flash');
  setTimeout(() => laneEl.classList.remove('flash'), 100);

  if (count % 10 === 0) {
    const wrapper = document.getElementById('game-wrapper');
    wrapper.classList.remove('screen-shake');
    void wrapper.offsetWidth;
    wrapper.classList.add('screen-shake');
  }

  if (count % 5 === 0) {
    spawnTapEffect(laneEl, player.color);
  }
}

function spawnTapEffect(lane, color) {
  const rect = lane.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'tap-effect';
  el.textContent = FUNNY_WORDS[Math.floor(Math.random() * FUNNY_WORDS.length)];
  el.style.left = `${rect.left + rect.width / 2 - 20}px`;
  el.style.top = `${rect.top - 10}px`;
  el.style.color = color;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 400);
}

// ===== バトル終了 =====
function endBattle() {
  gameRunning = false;

  const players = gameMode === 'local'
    ? PLAYER_DEFS.slice(0, playerCount)
    : onlinePlayers;

  const results = players.map(p => ({ ...p, count: counts[p.id] || 0 }));
  results.sort((a, b) => b.count - a.count);

  showResults(results, players.length);

  // オンラインホスト：結果を全員に送信
  if (gameMode === 'online' && isHost) {
    broadcast({ type: 'results', results });
  }
}

function showResults(results, total) {
  showScreen('result');

  // オンラインゲストはリトライボタンを隠す
  const retryBtn = document.getElementById('retry-btn');
  if (gameMode === 'online' && !isHost) {
    retryBtn.classList.add('hidden');
  } else {
    retryBtn.classList.remove('hidden');
  }

  resultList.innerHTML = '';
  const rankIcons = ['👑', '🥈', '🥉', '4'];

  results.forEach((r, idx) => {
    const row = document.createElement('div');
    row.className = 'result-row' + (idx === 0 ? ' winner' : '');
    row.innerHTML = `
      <div class="result-rank-num">${rankIcons[idx] || idx + 1}</div>
      <div class="result-name">${r.chara} ${r.name}</div>
      <div class="result-score">${r.count}回</div>
    `;
    resultList.appendChild(row);
  });

  const pool = total === 1 ? COMMENTS_SOLO : COMMENTS_MULTI;
  resultComment.textContent = pool[Math.floor(Math.random() * pool.length)];
}

// ============================================================
//  オンライン対戦 - PeerJS
// ============================================================

function generateRoomCode() {
  const chars = 'あいうえおかきくけこさしすせそたちつてとなにぬねの';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function cleanupPeer() {
  if (peer) {
    peer.destroy();
    peer = null;
  }
  connections = [];
  hostConn = null;
  onlinePlayers = [];
  isHost = false;
  gameRunning = false;
  if (battleTimer) clearInterval(battleTimer);
}

// ----- ホスト：部屋作成 -----
document.getElementById('create-room-btn').addEventListener('click', () => {
  const statusEl = document.getElementById('online-status');
  statusEl.textContent = '部屋を作成中……';
  statusEl.className = 'status-text';

  document.getElementById('join-panel').classList.add('hidden');

  const roomCode = generateRoomCode();
  const peerId = 'party-renda-' + roomCode;

  cleanupPeer();
  isHost = true;
  myPlayerId = 0;
  onlinePlayers = [{ ...PLAYER_DEFS[0], name: 'ホスト' }];
  connections = [];

  peer = new Peer(peerId);

  peer.on('open', () => {
    statusEl.textContent = '';
    document.getElementById('host-panel').classList.remove('hidden');
    document.getElementById('room-code').textContent = roomCode;
    updateHostMembers();

    // 2人以上でスタート可能
    checkStartable();
  });

  peer.on('connection', (conn) => {
    if (onlinePlayers.length >= 4) {
      conn.on('open', () => conn.send({ type: 'error', msg: '部屋がいっぱいです' }));
      return;
    }

    const newIdx = onlinePlayers.length;
    const playerDef = { ...PLAYER_DEFS[newIdx], name: `ゲスト${newIdx}` };
    onlinePlayers.push(playerDef);
    connections.push(conn);

    conn.on('open', () => {
      // 参加者に自分のプレイヤーIDと全メンバーを送信
      conn.send({ type: 'welcome', playerId: newIdx, players: onlinePlayers });
      // 既存メンバーにも更新通知
      broadcast({ type: 'members', players: onlinePlayers });
      updateHostMembers();
      checkStartable();
    });

    conn.on('data', (data) => handleHostData(data, conn));
    conn.on('close', () => handleGuestDisconnect(conn));
  });

  peer.on('error', (err) => {
    if (err.type === 'unavailable-id') {
      statusEl.textContent = 'このあいことばは既に使われています。もう一度お試しください。';
      statusEl.className = 'status-text error';
    } else {
      statusEl.textContent = `接続エラー: ${err.type}`;
      statusEl.className = 'status-text error';
    }
  });
});

function updateHostMembers() {
  const container = document.getElementById('host-members');
  container.innerHTML = '';
  onlinePlayers.forEach(p => {
    const tag = document.createElement('div');
    tag.className = 'member-tag';
    tag.innerHTML = `<span class="member-chara">${p.chara}</span> ${p.name}`;
    container.appendChild(tag);
  });
}

function checkStartable() {
  const btn = document.getElementById('online-start-btn');
  if (onlinePlayers.length >= 2) {
    btn.classList.remove('hidden');
  } else {
    btn.classList.add('hidden');
  }
}

function handleGuestDisconnect(conn) {
  const idx = connections.indexOf(conn);
  if (idx === -1) return;
  // 切断されたプレイヤーを削除
  connections.splice(idx, 1);
  onlinePlayers.splice(idx + 1, 1); // +1 because host is 0
  // IDを振り直し
  onlinePlayers.forEach((p, i) => {
    Object.assign(p, PLAYER_DEFS[i]);
    p.name = i === 0 ? 'ホスト' : `ゲスト${i}`;
  });
  broadcast({ type: 'members', players: onlinePlayers });
  updateHostMembers();
  checkStartable();
}

function handleHostData(data, conn) {
  if (data.type === 'tap') {
    // ゲストの連打をブロードキャスト（送信元以外）
    counts[data.playerId] = data.count;
    const player = onlinePlayers.find(p => p.id === data.playerId);
    if (player) updateLane(player, data.count);

    // 他のゲストにも転送
    connections.forEach(c => {
      if (c !== conn) {
        c.send({ type: 'tap', playerId: data.playerId, count: data.count });
      }
    });
  }
}

function broadcast(data) {
  connections.forEach(c => {
    if (c.open) c.send(data);
  });
}

// ホスト：ゲーム開始ボタン
document.getElementById('online-start-btn').addEventListener('click', () => {
  playerCount = onlinePlayers.length;
  broadcast({ type: 'countdown' });
  startCountdown();
});

// ----- ゲスト：部屋参加 -----
document.getElementById('join-room-btn').addEventListener('click', () => {
  document.getElementById('host-panel').classList.add('hidden');
  document.getElementById('join-panel').classList.remove('hidden');
  document.getElementById('join-code-input').value = '';
  document.getElementById('join-status').textContent = '';
  document.getElementById('online-status').textContent = '';
  document.getElementById('join-code-input').focus();
});

document.getElementById('join-submit-btn').addEventListener('click', joinRoom);
document.getElementById('join-code-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') joinRoom();
});

function joinRoom() {
  const code = document.getElementById('join-code-input').value.trim();
  const statusEl = document.getElementById('join-status');

  if (!code) {
    statusEl.textContent = 'あいことばを入力してね！';
    statusEl.className = 'status-text error';
    return;
  }

  statusEl.textContent = '接続中……';
  statusEl.className = 'status-text';

  cleanupPeer();
  isHost = false;
  peer = new Peer();

  peer.on('open', () => {
    const peerId = 'party-renda-' + code;
    hostConn = peer.connect(peerId, { reliable: true });

    hostConn.on('open', () => {
      statusEl.textContent = '接続成功！';
      statusEl.className = 'status-text success';
    });

    hostConn.on('data', (data) => handleGuestData(data));

    hostConn.on('close', () => {
      statusEl.textContent = 'ホストとの接続が切れました';
      statusEl.className = 'status-text error';
    });

    hostConn.on('error', () => {
      statusEl.textContent = '接続に失敗しました';
      statusEl.className = 'status-text error';
    });

    // 接続タイムアウト
    setTimeout(() => {
      if (!hostConn.open) {
        statusEl.textContent = '部屋が見つかりません。あいことばを確認してね。';
        statusEl.className = 'status-text error';
        peer.destroy();
      }
    }, 8000);
  });

  peer.on('error', (err) => {
    statusEl.textContent = `接続エラー: ${err.type}`;
    statusEl.className = 'status-text error';
  });
}

function handleGuestData(data) {
  switch (data.type) {
    case 'welcome':
      myPlayerId = data.playerId;
      onlinePlayers = data.players;
      playerCount = onlinePlayers.length;
      showScreen('onlineWait');
      updateGuestMembers();
      break;

    case 'members':
      onlinePlayers = data.players;
      playerCount = onlinePlayers.length;
      updateGuestMembers();
      break;

    case 'countdown':
      playerCount = onlinePlayers.length;
      startCountdown();
      break;

    case 'tap':
      counts[data.playerId] = data.count;
      const player = onlinePlayers.find(p => p.id === data.playerId);
      if (player) updateLane(player, data.count);
      break;

    case 'results':
      gameRunning = false;
      if (battleTimer) clearInterval(battleTimer);
      showResults(data.results, data.results.length);
      break;

    case 'error':
      document.getElementById('join-status').textContent = data.msg;
      document.getElementById('join-status').className = 'status-text error';
      break;
  }
}

function updateGuestMembers() {
  const container = document.getElementById('guest-members');
  container.innerHTML = '';
  onlinePlayers.forEach((p, i) => {
    const tag = document.createElement('div');
    tag.className = 'member-tag';
    const me = i === myPlayerId ? ' (あなた)' : '';
    tag.innerHTML = `<span class="member-chara">${p.chara}</span> ${p.name}${me}`;
    container.appendChild(tag);
  });
}

function sendToHost(data) {
  if (hostConn && hostConn.open) hostConn.send(data);
}

// コピーボタン
document.getElementById('copy-code-btn').addEventListener('click', () => {
  const code = document.getElementById('room-code').textContent;
  navigator.clipboard.writeText(code).then(() => {
    document.getElementById('copy-code-btn').textContent = 'コピーした！';
    setTimeout(() => {
      document.getElementById('copy-code-btn').textContent = 'コピー';
    }, 1500);
  });
});
