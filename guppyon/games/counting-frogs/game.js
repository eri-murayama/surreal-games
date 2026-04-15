(() => {
  const MODES = {
    easy: { label: 'のんびり', min: 1, max: 5, rounds: 8, choices: 3, hint: '1〜5までの かずだよ。' },
    hard: { label: 'チャレンジ', min: 3, max: 9, rounds: 10, choices: 4, hint: '3〜9まで すばやく かぞえよう。' }
  };

  const state = { mode: 'easy', round: 0, score: 0, combo: 0, bestCombo: 0, correct: 0, answer: 0, locked: false, best: null, bgm: false };
  const screens = {
    start: document.getElementById('startScreen'),
    game: document.getElementById('gameScreen'),
    result: document.getElementById('resultScreen')
  };
  const els = {
    pond: document.getElementById('pond'),
    choices: document.getElementById('choices'),
    feedback: document.getElementById('feedback'),
    bonus: document.getElementById('bonusBadge'),
    round: document.getElementById('roundText'),
    score: document.getElementById('scoreText'),
    combo: document.getElementById('comboText'),
    prompt: document.getElementById('promptText'),
    sub: document.getElementById('subPromptText'),
    bestSummary: document.getElementById('bestSummary'),
    retry: document.getElementById('retryBtn'),
    sound: document.getElementById('soundToggle')
  };

  document.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener('click', () => start(button.dataset.mode)));
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
    return 'gero-counting-frogs-' + mode;
  }

  function load(mode) {
    try { return JSON.parse(localStorage.getItem(key(mode)) || 'null'); } catch { return null; }
  }

  function save(mode, record) {
    try { localStorage.setItem(key(mode), JSON.stringify(record)); } catch {}
  }

  function better(next, current) {
    if (!current) return true;
    if (next.score !== current.score) return next.score > current.score;
    if (next.accuracy !== current.accuracy) return next.accuracy > current.accuracy;
    return next.bestCombo > current.bestCombo;
  }

  function updateBest(mode) {
    const best = load(mode);
    els.bestSummary.textContent = best
      ? `${MODES[mode].label}：${best.score}てん / ${best.accuracy}% / れんぞく ${best.bestCombo}ぴょん`
      : `${MODES[mode].label}モードは まだ これから！`;
  }

  function show(name) {
    Object.entries(screens).forEach(([keyName, node]) => node.classList.toggle('active', keyName === name));
  }

  function start(mode) {
    state.mode = mode;
    state.round = 0;
    state.score = 0;
    state.combo = 0;
    state.bestCombo = 0;
    state.correct = 0;
    state.locked = false;
    state.best = load(mode);
    updateBest(mode);
    updateHud();
    els.feedback.textContent = 'しっかり みて、かぞえてみよう。';
    els.feedback.className = 'feedback';
    show('game');
    if (window.geroAudio) {
      geroAudio.init();
      geroAudio.resume();
      if (!state.bgm) {
        geroAudio.startBGM(108, 'F');
        state.bgm = true;
      }
    }
    next();
  }

  function next() {
    const cfg = MODES[state.mode];
    if (state.round >= cfg.rounds) return finish();
    state.round += 1;
    state.locked = false;
    state.answer = rnd(cfg.min, cfg.max);
    els.prompt.textContent = `${state.round}もんめ！ いくつ いるかな？`;
    els.sub.textContent = cfg.hint;
    els.bonus.textContent = `きらきら +${state.combo * 3}`;
    drawPond(state.answer);
    drawChoices(cfg);
    updateHud();
  }

  function drawPond(count) {
    els.pond.innerHTML = '';
    positions(count).forEach((pos, index) => {
      const leaf = node('div', 'leaf');
      leaf.style.left = `${pos.x}%`;
      leaf.style.top = `${pos.y}%`;
      leaf.style.transform = `translate(-50%,-50%) rotate(${rnd(-16, 16)}deg)`;
      els.pond.appendChild(leaf);
      const frog = node('div', 'frog', '🐸');
      frog.style.left = `${pos.x}%`;
      frog.style.top = `${pos.y - 4}%`;
      frog.style.animationDelay = `${index * 0.08}s`;
      els.pond.appendChild(frog);
    });
    for (let i = 0; i < Math.max(2, Math.min(6, count - 1)); i += 1) {
      const spark = node('div', 'spark', i % 2 ? '🪲' : '✨');
      spark.style.left = `${rnd(8, 92)}%`;
      spark.style.top = `${rnd(14, 88)}%`;
      els.pond.appendChild(spark);
    }
  }

  function positions(count) {
    const list = [];
    let tries = 0;
    while (list.length < count && tries < 180) {
      tries += 1;
      const nextPos = { x: rnd(14, 86), y: rnd(24, 82) };
      if (list.every((pos) => Math.hypot(pos.x - nextPos.x, pos.y - nextPos.y) > 18)) list.push(nextPos);
    }
    while (list.length < count) {
      const i = list.length;
      list.push({ x: 24 + (i % 3) * 24, y: 34 + Math.floor(i / 3) * 20 });
    }
    return list;
  }

  function drawChoices(cfg) {
    const set = new Set([state.answer]);
    while (set.size < cfg.choices) {
      set.add(clamp(state.answer + rnd(-2, 2), cfg.min, cfg.max));
      if (set.size < cfg.choices) set.add(rnd(cfg.min, cfg.max));
    }
    const values = shuffle([...set]).slice(0, cfg.choices);
    els.choices.innerHTML = '';
    values.forEach((value) => {
      const button = node('button', 'choice', value);
      button.type = 'button';
      button.addEventListener('click', () => answer(value, button));
      els.choices.appendChild(button);
    });
  }

  function answer(value, button) {
    if (state.locked) return;
    state.locked = true;
    const buttons = [...els.choices.querySelectorAll('.choice')];
    buttons.forEach((item) => {
      item.disabled = true;
      if (Number(item.textContent) === state.answer) item.classList.add('correct');
    });
    if (value === state.answer) {
      state.correct += 1;
      state.combo += 1;
      state.bestCombo = Math.max(state.bestCombo, state.combo);
      state.score += 10 + state.combo * 3;
      button.classList.add('correct');
      els.feedback.textContent = `せいかい！ ${state.combo}れんぞく ぴょん！`;
      els.feedback.className = 'feedback good';
      els.bonus.textContent = `きらきら +${state.combo * 3}`;
      if (window.geroAudio) {
        geroAudio.playCorrect();
        if (state.combo >= 3) geroAudio.playStar();
      }
    } else {
      state.combo = 0;
      state.score = Math.max(0, state.score - 4);
      button.classList.add('wrong');
      els.feedback.textContent = `おしい！ こたえは ${state.answer} だったよ。`;
      els.feedback.className = 'feedback bad';
      els.bonus.textContent = 'きらきら +0';
      if (window.geroAudio) geroAudio.playWrong();
    }
    updateHud();
    setTimeout(next, 900);
  }

  function finish() {
    const cfg = MODES[state.mode];
    const accuracy = Math.round((state.correct / cfg.rounds) * 100);
    const record = { score: state.score, accuracy, bestCombo: state.bestCombo };
    const freshBest = better(record, state.best);
    if (freshBest) {
      state.best = record;
      save(state.mode, record);
    }
    let stars = 1;
    let title = 'ぴょんぴょん たんけんたい';
    let emoji = '🐸';
    let message = 'よく みて かぞえられたね。つぎは もっと ながい れんぞくを ねらってみよう！';
    if (accuracy >= 95 && state.bestCombo >= 4) {
      stars = 3; title = 'ぴょんぴょん めいじん！'; emoji = '🏆';
      message = 'かぞえるのが とっても じょうず！ きらきらボーナスも ばっちり つかいこなせたよ。';
    } else if (accuracy >= 75) {
      stars = 2; title = 'いけの かぞえやさん'; emoji = '🌟';
      message = 'せいかいを どんどん つみあげたね。もういちど あそぶと ベストも ねらえそう！';
    }
    text('resultEmoji', emoji);
    text('resultTitle', title);
    text('resultMessage', message);
    text('resultScore', `${state.score} てん`);
    text('resultAccuracy', `${accuracy}%`);
    text('resultCombo', `${state.bestCombo} ぴょん`);
    text('resultMode', cfg.label);
    text('resultBanner', freshBest ? 'NEW BEST! ベストきろくを こうしん！' : `つぎは ${cfg.rounds - state.correct}もんぶん のびしろ あり！`);
    text('resultBestText', state.best ? `${state.best.score}てん / ${state.best.accuracy}% / れんぞく ${state.best.bestCombo}ぴょん` : 'はじめての きろく！');
    [...document.getElementById('starRow').children].forEach((star, index) => star.classList.toggle('on', index < stars));
    show('result');
    if (window.geroAudio) geroAudio.playCelebration();
    if (window.geroShare) {
      geroShare('#resultScreen', { gameTitle: 'かぞえてぴょん！', resultText: `${title} ${state.score}てん`, age: 'toddler' });
    }
  }

  function updateHud() {
    const cfg = MODES[state.mode];
    els.round.textContent = `${state.round} / ${cfg.rounds}`;
    els.score.textContent = state.score;
    els.combo.textContent = `${state.combo} ぴょん`;
  }

  function node(tag, className, textValue) {
    const el = document.createElement(tag);
    el.className = className;
    if (textValue !== undefined) el.textContent = textValue;
    return el;
  }

  function text(id, value) {
    document.getElementById(id).textContent = value;
  }

  function rnd(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function shuffle(list) {
    for (let i = list.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }
})();
