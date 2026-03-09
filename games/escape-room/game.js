// ===== ゲーム状態 =====
const state = {
  inventory: [],
  selectedItem: null,
  memoPickedUp: false,
  flashlightPickedUp: false,
  safeOpened: false,
  keyObtained: false,
  doorUnlocked: false,
  cleared: false,
  hiddenRevealed: false,
  safeCode: [],
  startTime: Date.now(),
  // 全アイテムチェック用
  checkedItems: {
    door: false,
    painting: false,
    window: false,
    clock: false,
    table: false,
    safe: false,
    memo: false,
    flashlight: false,
  },
};

// 正解コード: 星=5, 時計=3, 5+3=8 → 538
const SAFE_ANSWER = '538';

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
const hiddenMessage = document.getElementById('hidden-message');
const safeModal = document.getElementById('safe-modal');
const memoModal = document.getElementById('memo-modal');
const windowModal = document.getElementById('window-modal');

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
    showDialog('あれっ……なんかカチッて音がした！<br>扉の鍵が開いたかも！？');
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
  state.inventory = state.inventory.filter(item => item.id !== itemId);
  state.selectedItem = null;
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

// アイテムスロットのクリック
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
        return;
      } else if (item.id === 'flashlight') {
        showDialog('懐中電灯スイッチオン！ えへへ、探検みた〜い！');
      } else if (item.id === 'key') {
        showDialog('おっ、鍵だ鍵だ！ どっかに合うかな〜？');
      }
    }
    renderInventory();
  });
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
  showDialog('おおっ、懐中電灯じゃん！ ラッキ〜！<br>暗いとこ照らせるかも！');
  checkItem('flashlight');
});

// ===== 絵画 =====
painting.addEventListener('click', (e) => {
  e.stopPropagation();
  checkItem('painting');
  if (state.selectedItem === 'flashlight') {
    showDialog('懐中電灯でピカーッ！ うわっ、なんかシュールな絵だ……！<br>なぞなぞ？ ねこはねこでも……いぬ！？');
  } else {
    showDialog('壁に絵が飾ってある〜。なんか変な絵だなあ……<br>暗くてよく見えないや。');
  }
});

// ===== 時計 =====
clock.addEventListener('click', (e) => {
  e.stopPropagation();
  checkItem('clock');
  if (state.selectedItem === 'flashlight') {
    showDialog('時計を照らしてみた！ えっと……<br>短い針が 3 で、長い針が 12 ……3時だ！ おやつの時間！');
  } else {
    showDialog('壁に時計がかかってるけど止まってるな〜。<br>暗くて何時かわかんないや。');
  }
});

// ===== 壁（懐中電灯で隠しメッセージ） =====
room.addEventListener('click', (e) => {
  if (e.target === room || e.target.id === 'wall-back' || e.target.id === 'floor') {
    if (state.selectedItem === 'flashlight' && !state.hiddenRevealed) {
      state.hiddenRevealed = true;
      hiddenMessage.classList.add('revealed');
      showDialog('わっ！ 壁に何か文字が浮かんできた！！<br>なんか暗号っぽい……！ ドキドキするね！');
    } else if (state.hiddenRevealed) {
      showDialog('壁の文字……「①星 ②時計 ③星+時計」……？<br>うーん、あたまがこんがらがるよ〜。');
    } else {
      showDialog('ピンクっぽいかわいいお部屋だけど……<br>出られないのはちょっと困るな〜。');
    }
  }
});

// ===== 窓 =====
windowEl.addEventListener('click', (e) => {
  e.stopPropagation();
  checkItem('window');
  windowModal.classList.remove('hidden');
  showDialog('窓の外を覗いてみよう……！');
});

document.getElementById('window-close-btn').addEventListener('click', () => {
  windowModal.classList.add('hidden');
  showDialog('うわ〜、なんか不思議な景色だった……<br>ここ、どこなんだろ？');
});

// ===== テーブル =====
table.addEventListener('click', (e) => {
  e.stopPropagation();
  checkItem('table');
  showDialog('テーブルだ！ その上に何か箱っぽいのがある……<br>金庫かな？ 気になる〜！');
});

// ===== 金庫 =====
safe.addEventListener('click', (e) => {
  e.stopPropagation();
  checkItem('safe');
  if (state.safeOpened) {
    showDialog('金庫はもうカラッポだよ〜。');
    return;
  }
  showDialog('金庫だ！ 3ケタの番号を入れるっぽい……。');
  safeModal.classList.remove('hidden');
  state.safeCode = [];
  updateSafeDisplay();
  document.getElementById('safe-result').textContent = '';
});

// 金庫テンキー
document.querySelectorAll('.numpad-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const num = btn.dataset.num;
    if (num === 'clear') {
      state.safeCode = [];
      document.getElementById('safe-result').textContent = '';
    } else if (num === 'enter') {
      checkSafeCode();
    } else {
      if (state.safeCode.length < 3) {
        state.safeCode.push(num);
      }
    }
    updateSafeDisplay();
  });
});

function updateSafeDisplay() {
  document.querySelectorAll('.code-digit').forEach((digit, i) => {
    digit.textContent = state.safeCode[i] || '_';
  });
}

function checkSafeCode() {
  const result = document.getElementById('safe-result');
  const code = state.safeCode.join('');

  if (code.length < 3) {
    result.textContent = '3ケタ入れてね！';
    result.classList.remove('success');
    return;
  }

  if (code === SAFE_ANSWER) {
    result.textContent = 'カチッ！ 開いた〜！！';
    result.classList.add('success');
    state.safeOpened = true;
    state.keyObtained = true;
    safe.classList.add('safe-open');
    safeDisplay.textContent = SAFE_ANSWER;

    setTimeout(() => {
      safeModal.classList.add('hidden');
      addItem('key', '\u{1F511}', '古びた鍵');
      showDialog('やった〜！ 金庫が開いたよ！<br>中に鍵が入ってた！');
    }, 1200);
  } else {
    result.textContent = 'ブッブー！ ハズレ〜！';
    result.classList.remove('success');
    state.safeCode = [];
    setTimeout(updateSafeDisplay, 300);
  }
}

document.getElementById('safe-close-btn').addEventListener('click', () => {
  safeModal.classList.add('hidden');
});

// ===== メモモーダル =====
document.getElementById('memo-close-btn').addEventListener('click', () => {
  memoModal.classList.add('hidden');
  showDialog('なんだこのメモ……シュールすぎる！<br>歯に挟まったら嫌なもの……いぬ！？');
});

// ===== 扉 =====
door.addEventListener('click', (e) => {
  e.stopPropagation();
  checkItem('door');
  if (state.cleared) return;

  if (state.doorUnlocked) {
    // ドアを開ける
    door.classList.add('door-open');
    showDialog('アッ、引き戸かと思ってたけど押し戸だった！');

    setTimeout(() => {
      gameClear();
    }, 2500);
    return;
  }

  if (state.selectedItem === 'key') {
    showDialog('鍵を差してみたけど……合わないみたい？<br>なんか他に方法がありそう。');
  } else if (state.selectedItem === 'flashlight') {
    showDialog('扉を照らしてみた！ 鍵穴がバッチリ見えるね。<br>でも鍵では開かないのかも……？');
  } else if (state.selectedItem === 'memo') {
    showDialog('扉にメモをかざしてみたけど何も起きない！<br>そりゃそうだよね〜あはは。');
  } else {
    showDialog('がちゃがちゃ……ダメだ、鍵かかってる〜。<br>部屋の中を全部調べたら何かわかるかも……！');
  }
});

// ===== ゲームクリア =====
function gameClear() {
  state.cleared = true;

  const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
  const min = Math.floor(elapsed / 60);
  const sec = elapsed % 60;
  const timeStr = `${min}分${sec}秒`;

  const overlay = document.createElement('div');
  overlay.id = 'clear-overlay';
  overlay.innerHTML = `
    <div class="clear-title">脱出成功！</div>
    <div class="clear-sub">おめでとう！</div>
    <div class="clear-time">クリアタイム: ${timeStr}</div>
  `;
  document.body.appendChild(overlay);

  createConfetti();
  createParticles();

  showDialog('やった〜〜〜！！ 出られた〜！！<br>押し戸って気づくの遅すぎたかな……あはは！', '主人公');
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
