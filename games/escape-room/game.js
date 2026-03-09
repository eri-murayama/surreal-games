// ===== ゲーム状態 =====
const state = {
  inventory: [],
  selectedItem: null,
  memoPickedUp: false,
  flashlightPickedUp: false,
  dustPickedUp: false,
  bentoPickedUp: false,
  safeWrongCount: 0,
  safeBroken: false,
  memoRead: false,
  paintingDestroyed: false,
  doorUnlocked: false,
  cleared: false,
  hiddenRevealed: false,
  windowPeeked: false,
  startTime: Date.now(),
  checkedItems: {
    door: false,
    painting: false,
    window: false,
    clock: false,
    safe: false,
    memo: false,
    flashlight: false,
  },
};

// ===== DOM要素 =====
const dialogText = document.getElementById('dialog-text');
const dialogName = document.getElementById('dialog-name');
const door = document.getElementById('door');
const room = document.getElementById('room');
const table = document.getElementById('table');
const windowEl = document.getElementById('window');
const painting = document.getElementById('painting');
const clock = document.getElementById('clock');
const safe = document.getElementById('safe');
const safeDisplay = document.getElementById('safe-display');
const memoOnFloor = document.getElementById('memo-on-floor');
const flashlightOnFloor = document.getElementById('flashlight-on-floor');
const dustOnFloor = document.getElementById('dust-on-floor');
const bentoOnFloor = document.getElementById('bento-on-floor');
const hiddenMessage = document.getElementById('hidden-message');
const memoModal = document.getElementById('memo-modal');
const windowModal = document.getElementById('window-modal');
const paintingModal = document.getElementById('painting-modal');
const windowSpeech = document.getElementById('window-speech');
const safeModal = document.getElementById('safe-modal');
const itemInspectModal = document.getElementById('item-inspect-modal');

// ===== 窓の外からのセリフ =====
const windowLines = [
  'ヴぅおおおお',
  'ぎょごおおお',
  '出て行っていただけますか～',
  '私の家なんですが～',
  '聞いてますか～',
];
let windowLineIndex = 0;
let windowSpeechTimer = null;

function startWindowSpeech() {
  if (windowSpeechTimer) return;
  showWindowLine();
  windowSpeechTimer = setInterval(showWindowLine, 5000);
}

function showWindowLine() {
  if (state.cleared) {
    clearInterval(windowSpeechTimer);
    windowSpeech.classList.remove('visible');
    return;
  }
  windowSpeech.textContent = windowLines[windowLineIndex % windowLines.length];
  windowSpeech.classList.remove('visible');
  void windowSpeech.offsetHeight;
  windowSpeech.classList.add('visible');
  windowLineIndex++;
}

setTimeout(startWindowSpeech, 5000);

// ===== セリフ表示 =====
let currentInterval = null;

function showDialog(text, speaker = '主人公') {
  if (currentInterval) clearInterval(currentInterval);
  dialogName.textContent = speaker;
  dialogText.innerHTML = '';

  let i = 0;
  const chars = text.split('');

  currentInterval = setInterval(() => {
    if (i < chars.length) {
      if (chars[i] === '<') {
        let tag = '';
        while (i < chars.length && chars[i] !== '>') {
          tag += chars[i];
          i++;
        }
        tag += chars[i] || '';
        i++;
        dialogText.innerHTML += tag;
      } else {
        dialogText.innerHTML += chars[i];
        i++;
      }
    } else {
      clearInterval(currentInterval);
      currentInterval = null;
    }
  }, 35);
}

// ===== 全アイテムチェック＆ドア解錠判定 =====
function checkItem(key) {
  state.checkedItems[key] = true;
  checkAllItems();
}

function checkAllItems() {
  const all = Object.values(state.checkedItems);
  if (all.every(v => v) && !state.doorUnlocked) {
    state.doorUnlocked = true;
    door.classList.add('door-unlocked');
  }
}

// ===== アイテム管理 =====
function addItem(itemId, icon, name) {
  if (state.inventory.find(item => item.id === itemId)) return;
  state.inventory.push({ id: itemId, icon, name });
  renderInventory();
}

function removeItem(itemId) {
  state.inventory = state.inventory.filter(i => i.id !== itemId);
  if (state.selectedItem === itemId) state.selectedItem = null;
  renderInventory();
}

function renderInventory() {
  const slots = document.querySelectorAll('.item-slot');
  const selectedName = document.getElementById('selected-item-name');

  slots.forEach((slot, index) => {
    const item = state.inventory[index];
    if (item) {
      slot.textContent = item.icon;
      slot.classList.add('has-item');
      slot.title = item.name;
      slot.classList.toggle('selected', state.selectedItem === item.id);
    } else {
      slot.textContent = '';
      slot.classList.remove('has-item', 'selected');
      slot.title = '';
    }
  });

  const selected = state.inventory.find(item => item.id === state.selectedItem);
  selectedName.textContent = selected ? `[ ${selected.name} ]` : '';
}

// ===== アイテム調査モーダル =====
function showItemInspect(icon, name) {
  document.getElementById('item-inspect-icon').textContent = icon;
  document.getElementById('item-inspect-name').textContent = name;
  itemInspectModal.classList.remove('hidden');
}

document.getElementById('item-inspect-close-btn').addEventListener('click', () => {
  itemInspectModal.classList.add('hidden');
});

// ===== アイテムスロットのクリック =====
document.querySelectorAll('.item-slot').forEach(slot => {
  slot.addEventListener('click', () => {
    const index = parseInt(slot.dataset.slot);
    const item = state.inventory[index];
    if (!item) return;

    if (state.selectedItem === item.id) {
      state.selectedItem = null;
      showDialog(`${item.name}をしまった〜。`);
    } else {
      state.selectedItem = item.id;

      if (item.id === 'memo') {
        memoModal.classList.remove('hidden');
        showDialog('どれどれ、メモを読んでみよ〜……');
        renderInventory();
        return;
      } else if (item.id === 'flashlight') {
        showItemInspect('\u{1F526}', '懐中電灯');
        showDialog('懐中電灯スイッチオン！あられもないところを照らしちゃおう！');
      } else if (item.id === 'dust') {
        showItemInspect('\u{1F4A8}', 'ほこり');
        showDialog('彼女のほこり……じっくり味わおう。');
        renderInventory();
        return;
      } else if (item.id === 'bento') {
        showItemInspect('\u{1F371}', 'お弁当');
        showDialog('れろれろ…お弁当箱を舐めて彼女の塩味を感じて…。');
        renderInventory();
        return;
      } else if (item.id === 'bento-empty') {
        showItemInspect('\u{1F4E6}', '空のお弁当箱');
        showDialog('空っぽのお弁当箱。ごちそうさまでした〜。');
      } else if (item.id === 'cash') {
        showItemInspect('\u{1F4B0}', '現金');
        showDialog('おっかね〜おっかね〜♪ いっぱいある〜♪');
      }
    }
    renderInventory();
  });
});

// アイテム調査モーダル閉じた時の消費処理
document.getElementById('item-inspect-close-btn').addEventListener('click', () => {
  if (state.selectedItem === 'dust') {
    removeItem('dust');
    showDialog('もぐもぐ……、芳醇なダニの香りと混ざった髪の毛の不快感…、<br>うーん美味美味。');
  } else if (state.selectedItem === 'bento') {
    // お弁当を空のお弁当箱に変える
    const bentoItem = state.inventory.find(i => i.id === 'bento');
    if (bentoItem) {
      bentoItem.id = 'bento-empty';
      bentoItem.icon = '\u{1F4E6}';
      bentoItem.name = '空のお弁当箱';
      state.selectedItem = null;
      renderInventory();
      showDialog('れろれろ…お弁当箱を舐めて彼女の塩味を感じて…。<br>残ったおかずはポケットに詰めておこう。');
    }
  } else if (state.selectedItem === 'cash') {
    removeItem('cash');
    showDialog('ポケットにしまっちゃお♪<br>えへへ、これはぼくのもの〜♪');
  }
});

// ===== 床のメモ =====
memoOnFloor.addEventListener('click', (e) => {
  e.stopPropagation();
  if (state.memoPickedUp) return;

  state.memoPickedUp = true;
  memoOnFloor.classList.add('hidden');
  addItem('memo', '\u{1F4C4}', 'ナゾのメモ');
  showDialog('あっ、なんか紙が落ちてる！ なになに……？<br>アイテムからチェックしてみよっと！');
  checkItem('memo');
});

// ===== 懐中電灯 =====
flashlightOnFloor.addEventListener('click', (e) => {
  e.stopPropagation();
  if (state.flashlightPickedUp) return;

  state.flashlightPickedUp = true;
  flashlightOnFloor.classList.add('hidden');
  addItem('flashlight', '\u{1F526}', '懐中電灯');
  showDialog('懐中電灯だ！この部屋の子はとってもえっちな子なんだね♪');
  checkItem('flashlight');
});

// ===== ほこり =====
dustOnFloor.addEventListener('click', (e) => {
  e.stopPropagation();
  if (state.dustPickedUp) return;

  state.dustPickedUp = true;
  dustOnFloor.classList.add('hidden');
  addItem('dust', '\u{1F4A8}', 'ほこり');
  showDialog('あっ、ほこりだ。この部屋の子はだらしない子なんだなあ。うふふ。');
});

// ===== お弁当 =====
bentoOnFloor.addEventListener('click', (e) => {
  e.stopPropagation();
  if (state.bentoPickedUp) return;

  state.bentoPickedUp = true;
  bentoOnFloor.classList.add('hidden');
  addItem('bento', '\u{1F371}', 'お弁当');
  showDialog('おっ、お弁当だ！あとでゆっくり味わおう。');
});

// ===== 絵画 =====
painting.addEventListener('click', (e) => {
  e.stopPropagation();
  checkItem('painting');
  if (state.paintingDestroyed) {
    showDialog('もう絵はびりびりだ。まあいっか♪');
    return;
  }
  paintingModal.classList.remove('hidden');
  showDialog('壁に絵が飾ってある〜。近くで見てみよっと！');
});

document.getElementById('painting-close-btn').addEventListener('click', () => {
  paintingModal.classList.add('hidden');
  if (!state.paintingDestroyed) {
    state.paintingDestroyed = true;
    showDialog('このセンスは僕と付き合ったらちゃんと矯正してあげなきゃ。<br>ビリビリ〜！');
    painting.classList.add('painting-destroyed');
  }
});

// ===== 時計 =====
clock.addEventListener('click', (e) => {
  e.stopPropagation();
  checkItem('clock');
  showDialog('壁に時計がかかっている。3時だ。<br>僕、3って数字見るとどきどきするんだよね、お尻に見えて。');
});

// ===== 壁（懐中電灯で隠しメッセージ） =====
room.addEventListener('click', (e) => {
  if (e.target === room || e.target.id === 'wall-back' || e.target.id === 'floor') {
    if (state.selectedItem === 'flashlight' && !state.hiddenRevealed) {
      state.hiddenRevealed = true;
      hiddenMessage.classList.add('revealed');
      showDialog('わっ！ 壁に何か文字が浮かんできた！！<br>「うんち」って書いてある。うふふ、アブノーマルもいけるくち？');
    } else if (state.hiddenRevealed) {
      showDialog('「うんち」……うふふ。趣味が合いそうだね。');
    } else {
      showDialog('ピンクっぽいかわいいお部屋だな〜。<br>なんかいい匂いもする。誰かの生活の香り……。');
    }
  }
});

// ===== 窓 =====
windowEl.addEventListener('click', (e) => {
  e.stopPropagation();
  checkItem('window');
  state.windowPeeked = true;
  const frame = document.getElementById('window-peek-frame');
  frame.style.animation = 'none';
  frame.offsetHeight;
  frame.style.animation = '';
  windowModal.classList.remove('hidden');
  showDialog('窓の外を覗いてみよう……！ そ〜っと……');
});

document.getElementById('window-close-btn').addEventListener('click', () => {
  windowModal.classList.add('hidden');
  showDialog('外にかわいらしい女の子がいる。<br>おっひょ～～げきまぶ～～！');
});

// ===== テーブル（調べられない） =====

// ===== 金庫 =====
let safeCode = '';

safe.addEventListener('click', (e) => {
  e.stopPropagation();
  checkItem('safe');
  if (state.safeBroken) {
    showDialog('もう壊れた金庫だ。やりすぎたかな〜。<br>……まあいっか！');
    return;
  }
  safeModal.classList.remove('hidden');
  showDialog('金庫だ！ 番号を入れてみよ〜！');
});

// 金庫テンキー入力
document.querySelectorAll('.numpad-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const num = btn.dataset.num;
    const digits = document.querySelectorAll('.code-digit');
    const safeResult = document.getElementById('safe-result');

    if (num === 'clear') {
      safeCode = '';
      digits.forEach(d => d.textContent = '_');
      safeResult.textContent = '';
    } else if (num === 'enter') {
      if (safeCode.length < 3) return;
      // 正解なし、必ず失敗する
      state.safeWrongCount++;
      safeResult.textContent = 'ブッブー！ ハズレ～！';
      safeResult.style.color = '#ff6080';
      safeCode = '';
      digits.forEach(d => d.textContent = '_');

      if (state.safeWrongCount >= 3) {
        document.getElementById('safe-smash-btn').classList.remove('hidden');
        showDialog('舐めてんな');
      } else {
        const wrongLines = [
          'は？だる……。一応もう一回やってみるか',
          'もういいだろおい…まじでだるいわ…。次開けよおい。',
        ];
        showDialog(wrongLines[state.safeWrongCount - 1]);
      }
    } else {
      if (safeCode.length >= 3) return;
      safeCode += num;
      digits[safeCode.length - 1].textContent = num;
    }
  });
});

// 金庫を叩いて壊す
document.getElementById('safe-smash-btn').addEventListener('click', () => {
  state.safeBroken = true;
  safeModal.classList.add('hidden');
  safe.classList.add('safe-broken');
  addItem('cash', '\u{1F4B0}', '現金');
  showDialog('うぇーい、金庫をぶっ壊して現金ゲット！僕を舐めるなよ。');
});

document.getElementById('safe-close-btn').addEventListener('click', () => {
  safeModal.classList.add('hidden');
});

// ===== メモモーダル =====
document.getElementById('memo-close-btn').addEventListener('click', () => {
  memoModal.classList.add('hidden');
  if (!state.memoRead) {
    state.memoRead = true;
    showDialog('ふーん、なにこれ。興味ないや。びりびりに破ろう。');
    removeItem('memo');
  } else {
    showDialog('もう破いちゃったんだった。');
  }
});

// ===== 扉 =====
door.addEventListener('click', (e) => {
  e.stopPropagation();
  checkItem('door');
  if (state.cleared) return;

  if (state.doorUnlocked) {
    door.classList.add('door-open');
    showDialog('アッ、引き戸かと思ってたけど押し戸だった！');

    setTimeout(() => {
      gameClear();
    }, 2500);
    return;
  }

  showDialog('がちゃがちゃ……ダメだ、なんでか開かない。<br>仕方がないから部屋の中を全部舐めまわすように物色しよう……！不可抗力だ！');
});

// ===== ゲームクリア =====
function gameClear() {
  state.cleared = true;

  const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
  const min = Math.floor(elapsed / 60);
  const sec = elapsed % 60;
  const timeStr = `${min}分${sec}秒`;

  let rank, rankComment;
  if (elapsed <= 60) {
    rank = '👑 変態プロフェッショナル';
    rankComment = '手慣れすぎている。常習犯の疑いあり。';
  } else if (elapsed <= 120) {
    rank = '🦹 侵入のエキスパート';
    rankComment = 'この速さ……プロの犯行だ。';
  } else if (elapsed <= 180) {
    rank = '🔍 物色マニア';
    rankComment = 'まあまあの手際。次はもっと早くできるはず。';
  } else if (elapsed <= 300) {
    rank = '🐌 のんびり不法侵入';
    rankComment = 'ゆっくり堪能しすぎ。通報されるよ。';
  } else {
    rank = '😴 居座り犯';
    rankComment = 'もはや住んでる。';
  }

  const overlay = document.createElement('div');
  overlay.id = 'clear-overlay';
  overlay.innerHTML = `
    <div class="clear-title">脱出成功！</div>
    <div class="clear-time">クリアタイム: ${timeStr}</div>
    <div class="clear-rank">${rank}</div>
    <div class="clear-rank-comment">${rankComment}</div>
  `;
  document.body.appendChild(overlay);

  createConfetti();
  createParticles();
}

function createConfetti() {
  const colors = [
    '#ff6b8a', '#ff8c42', '#ffd166', '#06d6a0',
    '#118ab2', '#a855f7', '#ec4899', '#f97316',
    '#84cc16', '#06b6d4', '#8b5cf6', '#f43f5e'
  ];

  for (let i = 0; i < 120; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';

    const color = colors[Math.floor(Math.random() * colors.length)];
    const shapes = ['square', 'circle', 'triangle'];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 2;
    const duration = 2.5 + Math.random() * 2;
    const size = 6 + Math.random() * 12;

    confetti.style.left = `${left}%`;
    confetti.style.top = '-20px';
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;
    confetti.style.animationDelay = `${delay}s`;
    confetti.style.animationDuration = `${duration}s`;

    if (shape === 'circle') {
      confetti.style.borderRadius = '50%';
      confetti.style.background = color;
    } else if (shape === 'triangle') {
      confetti.style.width = '0';
      confetti.style.height = '0';
      confetti.style.borderLeft = `${size / 2}px solid transparent`;
      confetti.style.borderRight = `${size / 2}px solid transparent`;
      confetti.style.borderBottom = `${size}px solid ${color}`;
      confetti.style.background = 'transparent';
    } else {
      confetti.style.background = color;
      confetti.style.borderRadius = '2px';
    }

    document.body.appendChild(confetti);
  }
}

function createParticles() {
  const colors = ['#fff0f5', '#ffe4e8', '#ffd0e0', '#fff8dc', '#f0fff0'];

  for (let i = 0; i < 40; i++) {
    const particle = document.createElement('div');
    particle.className = 'light-particle';

    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = 20 + Math.random() * 60;
    const top = 30 + Math.random() * 40;
    const delay = 0.5 + Math.random() * 2;
    const size = 4 + Math.random() * 8;

    particle.style.left = `${left}%`;
    particle.style.top = `${top}%`;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.background = `radial-gradient(circle, ${color}, transparent)`;
    particle.style.animationDelay = `${delay}s`;
    particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;

    document.body.appendChild(particle);
  }
}
