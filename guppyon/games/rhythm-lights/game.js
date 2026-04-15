(() => {
  const MODES = {
    easy: { label: 'やさしい', delay: 650 },
    hard: { label: 'チャレンジ', delay: 520 }
  };
  const TONES = [523.25, 659.25, 783.99, 987.77];
  const state = { mode: 'easy', stage: 0, clears: 0, hits: 0, sequence: [], index: 0, accepting: false, best: null, bgm: false };
  const screens = {
    start: document.getElementById('startScreen'),
    game: document.getElementById('gameScreen'),
    result: document.getElementById('resultScreen')
  };
  const pads = [...document.querySelectorAll('.pad')];
  const els = {
    stage: document.getElementById('stageText'),
    clear: document.getElementById('clearText'),
    hit: document.getElementById('hitText'),
    bestStage: document.getElementById('bestStageText'),
    bestSummary: document.getElementById('bestSummary'),
    statusTitle: document.getElementById('statusTitle'),
    statusText: document.getElementById('statusText'),
    statusChip: document.getElementById('statusChip'),
    hint: document.getElementById('sequenceHint'),
    modeHint: document.getElementById('modeHint'),
    retry: document.getElementById('retryBtn'),
    sound: document.getElementById('soundToggle')
  };

  document.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener('click', () => start(button.dataset.mode)));
  pads.forEach((button) => button.addEventListener('click', () => press(Number(button.dataset.pad))));
  els.retry.addEventListener('click', () => start(state.mode));
  els.sound.addEventListener('click', toggleSound);
  document.addEventListener('pointerdown', warmup, { once: true });
  syncSound();
  updateBest('easy');
  updateHud();

  function warmup() {
    if (!window.geroAudio) return;
    geroAudio.init();
    geroAudio.resume();
  }

  function toggleSound() {
    if (!window.geroAudio) return;
    geroAudio.init();
    const on = geroAudio.toggleMute();
    els.sound.textContent = on ? '🔊' : '🔇';
    els.sound.setAttribute('aria-pressed', String(!on));
  }

  function syncSound() {
    if (!window.geroAudio) return;
    geroAudio.init();
    els.sound.textContent = geroAudio.isMuted ? '🔇' : '🔊';
    els.sound.setAttribute('aria-pressed', String(!geroAudio.isMuted));
  }

  function key(mode) {
    return 'gero-rhythm-lights-' + mode;
  }

  function load(mode) {
    try { return JSON.parse(localStorage.getItem(key(mode)) || 'null'); } catch { return null; }
  }

  function save(mode, record) {
    try { localStorage.setItem(key(mode), JSON.stringify(record)); } catch {}
  }

  function better(next, current) {
    if (!current) return true;
    if (next.stage !== current.stage) return next.stage > current.stage;
    if (next.clears !== current.clears) return next.clears > current.clears;
    return next.hits > current.hits;
  }

  function updateBest(mode) {
    const best = load(mode);
    els.bestSummary.textContent = best
      ? `${MODES[mode].label}：ステージ ${best.stage} / せいこう ${best.clears} / ヒット ${best.hits}`
      : `${MODES[mode].label}モードは まだ これから！`;
  }

  function show(name) {
    Object.entries(screens).forEach(([keyName, node]) => node.classList.toggle('active', keyName === name));
  }

  function start(mode) {
    state.mode = mode;
    state.stage = 0;
    state.clears = 0;
    state.hits = 0;
    state.sequence = [];
    state.index = 0;
    state.accepting = false;
    state.best = load(mode);
    updateBest(mode);
    updateHud();
    els.modeHint.textContent = `${MODES[mode].label} リズム`;
    show('game');
    if (window.geroAudio) {
      geroAudio.init();
      geroAudio.resume();
      if (!state.bgm) {
        geroAudio.startBGM(120, 'G');
        state.bgm = true;
      }
    }
    nextStage();
  }

  function nextStage() {
    state.stage += 1;
    state.index = 0;
    state.accepting = false;
    state.sequence.push(Math.floor(Math.random() * pads.length));
    setStatus(`ステージ ${state.stage}`, 'ひかった じゅんばんを よく みておぼえよう。', 'みて おぼえる');
    els.hint.textContent = 'じゅんばんを みよう';
    lock(true);
    updateHud();
    playSequence();
  }

  function playSequence() {
    const step = Math.max(260, MODES[state.mode].delay - state.stage * 12);
    state.sequence.forEach((padIndex, index) => {
      setTimeout(() => flash(padIndex), step * index);
    });
    setTimeout(() => {
      state.accepting = true;
      lock(false);
      setStatus('おなじ じゅんばんで タッチ！', 'まちがえずに ぜんぶ たどれたら つぎの ステージへ。', 'タッチ できるよ');
      els.hint.textContent = `${state.index + 1} / ${state.sequence.length}`;
    }, step * state.sequence.length + 90);
  }

  function press(padIndex) {
    if (!state.accepting) return;
    flash(padIndex);
    if (padIndex !== state.sequence[state.index]) {
      state.accepting = false;
      lock(true);
      setStatus('おしい！', 'もういちど チャレンジすると もっと のびるよ。', 'ミス');
      if (window.geroAudio) geroAudio.playWrong();
      return setTimeout(() => finish(false), 520);
    }
    state.index += 1;
    state.hits += 1;
    els.hint.textContent = `${state.index} / ${state.sequence.length}`;
    updateHud();
    if (state.index >= state.sequence.length) {
      state.accepting = false;
      state.clears += 1;
      lock(true);
      setStatus('ステージ クリア！', 'リズムを しっかり おぼえたね。つぎは もうひとつ ふえるよ。', 'CLEAR!');
      if (window.geroAudio) {
        geroAudio.playCorrect();
        geroAudio.playStar();
      }
      updateHud();
      if (state.stage >= 12) {
        setTimeout(() => finish(true), 700);
      } else {
        setTimeout(nextStage, 760);
      }
    }
  }

  function flash(padIndex) {
    const pad = pads[padIndex];
    if (!pad) return;
    pad.classList.add('active');
    if (window.geroAudio) geroAudio.playTone(TONES[padIndex], 0.22, 'sine', 0.22);
    setTimeout(() => pad.classList.remove('active'), 260);
  }

  function finish(won) {
    const record = { stage: state.stage, clears: state.clears, hits: state.hits };
    const freshBest = better(record, state.best);
    if (freshBest) {
      state.best = record;
      save(state.mode, record);
    }
    let rank = 'C';
    let title = 'リズム たんけんちゅう';
    let emoji = '🎵';
    let message = 'おぼえて タッチできたぶんだけ、しっかり ちからが ついているよ。';
    if (state.stage >= 10 || won) {
      rank = 'S'; title = 'ぴかぴか マスター！'; emoji = '🏆';
      message = 'ながい じゅんばんも バッチリ！ きおくと リズムの コンビが さいこうです。';
    } else if (state.stage >= 7) {
      rank = 'A'; title = 'きらめき プレイヤー'; emoji = '🌟';
      message = 'かなり いいところまで きたね。つぎは もっと ながい リズムに ちょうせん！';
    } else if (state.stage >= 4) {
      rank = 'B'; title = 'リズム じょうず'; emoji = '✨';
      message = 'ステージを かさねるごとに おぼえる ちからが のびているよ。';
    }
    text('resultEmoji', emoji);
    text('resultTitle', title);
    text('resultMessage', message);
    text('rankChip', `RANK ${rank}`);
    text('resultStage', state.stage);
    text('resultClear', state.clears);
    text('resultHits', state.hits);
    text('resultMode', MODES[state.mode].label);
    text('resultBanner', freshBest ? 'NEW BEST! さいこうステージを こうしん！' : 'あと 1ステージで もっと うえの ランクが みえてくる！');
    text('resultBestText', state.best ? `ステージ ${state.best.stage} / せいこう ${state.best.clears} / ヒット ${state.best.hits}` : 'はじめての きろく！');
    show('result');
    if (window.geroAudio) geroAudio.playCelebration();
    if (window.geroShare) {
      geroShare('#resultScreen', { gameTitle: 'ぴかぴかリズム', resultText: `RANK ${rank} / ステージ ${state.stage}`, age: 'kid' });
    }
  }

  function setStatus(title, body, chip) {
    els.statusTitle.textContent = title;
    els.statusText.textContent = body;
    els.statusChip.textContent = chip;
  }

  function lock(locked) {
    pads.forEach((pad) => {
      pad.disabled = locked;
      pad.classList.toggle('locked', locked);
    });
  }

  function updateHud() {
    els.stage.textContent = state.stage;
    els.clear.textContent = state.clears;
    els.hit.textContent = state.hits;
    const best = state.best || load(state.mode);
    els.bestStage.textContent = best ? best.stage : 0;
  }

  function text(id, value) {
    document.getElementById(id).textContent = value;
  }
})();
