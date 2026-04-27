(function() {
  'use strict';

  const utils = {
    shuffle(list) {
      const copy = list.slice();
      for (let index = copy.length - 1; index > 0; index -= 1) {
        const swap = Math.floor(Math.random() * (index + 1));
        [copy[index], copy[swap]] = [copy[swap], copy[index]];
      }
      return copy;
    },
    sample(list) {
      return list[Math.floor(Math.random() * list.length)];
    },
    pickMany(list, count) {
      return utils.shuffle(list).slice(0, count);
    },
    range(count) {
      return Array.from({ length: count }, (_, index) => index);
    },
    repeat(symbol, count) {
      return Array.from({ length: count }, () => symbol).join(' ');
    },
    clamp(value, min, max) {
      return Math.min(max, Math.max(min, value));
    }
  };

  window.GeroChoiceQuestUtils = utils;
  window.createChoiceQuest = function createChoiceQuest(config) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => init(config), { once: true });
    } else {
      init(config);
    }
  };

  function init(config) {
    const root = document.getElementById(config.rootId || 'gameRoot') || document.body;
    const modes = config.modes || {
      easy: { label: 'やさしい', description: '6もん' },
      hard: { label: 'わくわく', description: '8もん' }
    };
    const modeKeys = Object.keys(modes);
    const state = {
      mode: modeKeys[0],
      rounds: [],
      roundIndex: 0,
      score: 0,
      streak: 0,
      bestStreak: 0,
      correct: 0,
      locked: false,
      bgmStarted: false
    };

    applyTheme(config.theme || {});
    document.body.classList.add('choice-quest-body');
    root.innerHTML = template(config, modes, modeKeys);
    root.firstElementChild?.setAttribute('data-age-category', config.age || 'kid');

    const els = {
      start: document.getElementById('startScreen'),
      game: document.getElementById('gameScreen'),
      result: document.getElementById('resultScreen'),
      round: document.getElementById('questRound'),
      score: document.getElementById('questScore'),
      streak: document.getElementById('questStreak'),
      best: document.getElementById('questBest'),
      prompt: document.getElementById('questPrompt'),
      promptNote: document.getElementById('questPromptNote'),
      badge: document.getElementById('questBadge'),
      scene: document.getElementById('questScene'),
      choices: document.getElementById('questChoices'),
      feedback: document.getElementById('questFeedback'),
      startBest: document.getElementById('startBestSummary'),
      resultEmoji: document.getElementById('resultEmoji'),
      resultTitle: document.getElementById('resultTitle'),
      resultMessage: document.getElementById('resultMessage'),
      resultRank: document.getElementById('resultRank'),
      resultBanner: document.getElementById('resultBanner'),
      resultScore: document.getElementById('resultScore'),
      resultAccuracy: document.getElementById('resultAccuracy'),
      resultStreak: document.getElementById('resultStreak'),
      resultMode: document.getElementById('resultMode'),
      resultBest: document.getElementById('resultBestText'),
      resultStars: Array.from(document.querySelectorAll('#resultStars span')),
      retry: document.getElementById('retryBtn'),
      sound: document.getElementById('soundToggle')
    };

    document.querySelectorAll('[data-mode]').forEach((button) => {
      button.addEventListener('click', () => start(button.dataset.mode));
    });

    els.retry.addEventListener('click', () => start(state.mode));
    els.sound.addEventListener('click', toggleSound);
    document.addEventListener('pointerdown', warmupAudio, { once: true });

    syncSound();
    updateStartBest();
    updateHud();

    function warmupAudio() {
      if (!window.geroAudio) return;
      window.geroAudio.init();
      window.geroAudio.resume();
    }

    function toggleSound() {
      if (!window.geroAudio) return;
      window.geroAudio.init();
      const isOn = window.geroAudio.toggleMute();
      els.sound.textContent = isOn ? '🔊' : '🔇';
      els.sound.setAttribute('aria-pressed', String(!isOn));
    }

    function syncSound() {
      if (!window.geroAudio) return;
      window.geroAudio.init();
      const muted = !!window.geroAudio.isMuted;
      els.sound.textContent = muted ? '🔇' : '🔊';
      els.sound.setAttribute('aria-pressed', String(!muted));
    }

    function storageKey(modeKey) {
      return `gero-choice-quest-${config.slug}-${modeKey}`;
    }

    function loadBest(modeKey) {
      try {
        return JSON.parse(localStorage.getItem(storageKey(modeKey)) || 'null');
      } catch (error) {
        return null;
      }
    }

    function saveBest(modeKey, record) {
      try {
        localStorage.setItem(storageKey(modeKey), JSON.stringify(record));
      } catch (error) {}
    }

    function compareRecord(next, current) {
      if (typeof config.compareRecords === 'function') {
        return config.compareRecords(next, current);
      }
      if (!current) return true;
      if (next.score !== current.score) return next.score > current.score;
      if (next.accuracy !== current.accuracy) return next.accuracy > current.accuracy;
      return next.bestStreak > current.bestStreak;
    }

    function formatBest(record) {
      if (typeof config.formatBest === 'function') {
        return config.formatBest(record);
      }
      return `${record.score}てん / ${record.accuracy}% / れんぞく ${record.bestStreak}`;
    }

    function updateStartBest() {
      const summary = modeKeys.map((modeKey) => {
        const record = loadBest(modeKey);
        return record ? `${modes[modeKey].label}: ${formatBest(record)}` : `${modes[modeKey].label}: まだ`;
      }).join(' / ');
      els.startBest.textContent = summary;
    }

    function show(screenName) {
      els.start.classList.toggle('active', screenName === 'start');
      els.game.classList.toggle('active', screenName === 'game');
      els.result.classList.toggle('active', screenName === 'result');
    }

    function start(modeKey) {
      state.mode = modeKey;
      state.rounds = config.createRounds(modeKey, utils);
      state.roundIndex = 0;
      state.score = 0;
      state.streak = 0;
      state.bestStreak = 0;
      state.correct = 0;
      state.locked = false;
      els.feedback.textContent = 'えらんで みよう';
      els.feedback.className = 'quest-feedback';
      show('game');
      updateHud();

      if (window.geroAudio) {
        window.geroAudio.init();
        window.geroAudio.resume();
        if (!state.bgmStarted) {
          window.geroAudio.startBGM(config.bgm?.tempo || 110, config.bgm?.key || 'C');
          state.bgmStarted = true;
        }
      }

      renderRound();
    }

    function updateHud() {
      const total = state.rounds.length || 0;
      els.round.textContent = total ? `${Math.min(state.roundIndex + 1, total)} / ${total}` : '0 / 0';
      els.score.textContent = state.score;
      els.streak.textContent = `${state.streak} れんぞく`;
      const best = loadBest(state.mode);
      els.best.textContent = best ? formatBest(best) : 'まだ';
    }

    function renderRound() {
      if (state.roundIndex >= state.rounds.length) {
        finish();
        return;
      }

      const round = state.rounds[state.roundIndex];
      state.locked = false;
      els.prompt.textContent = round.prompt;
      els.promptNote.textContent = round.note || 'よくみて えらんでね';
      els.badge.textContent = round.badge || modes[state.mode].label;
      renderScene(round);
      renderChoices(round);
      updateHud();
    }

    function renderScene(round) {
      els.scene.innerHTML = '';
      if (typeof config.renderScene === 'function') {
        config.renderScene(round, els.scene, utils);
        return;
      }

      const wrap = document.createElement('div');
      wrap.className = 'quest-scene-inner';

      const art = document.createElement('div');
      art.className = 'quest-scene-art';
      art.textContent = round.scene?.art || config.emoji || '🐸';
      if (round.scene?.silhouette) art.classList.add('silhouette');
      wrap.appendChild(art);

      if (round.scene?.title) {
        const title = document.createElement('div');
        title.className = 'quest-scene-title';
        title.textContent = round.scene.title;
        wrap.appendChild(title);
      }

      if (round.scene?.text) {
        const text = document.createElement('div');
        text.className = 'quest-scene-text';
        text.textContent = round.scene.text;
        wrap.appendChild(text);
      }

      if (Array.isArray(round.scene?.row) && round.scene.row.length > 0) {
        const row = document.createElement('div');
        row.className = 'quest-token-row';
        round.scene.row.forEach((token) => {
          const item = document.createElement('div');
          item.className = 'quest-token';
          item.textContent = token;
          row.appendChild(item);
        });
        wrap.appendChild(row);
      }

      els.scene.appendChild(wrap);
    }

    function renderChoices(round) {
      els.choices.innerHTML = '';
      round.choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `quest-choice ${choice.className || ''}`.trim();
        button.addEventListener('click', () => answer(round, index));

        if (typeof config.renderChoice === 'function') {
          config.renderChoice(choice, button, utils);
        } else {
          button.innerHTML = [
            choice.emoji ? `<span class="choice-emoji">${choice.emoji}</span>` : '',
            `<span class="choice-label">${choice.label}</span>`,
            choice.hint ? `<span class="choice-hint">${choice.hint}</span>` : ''
          ].join('');
        }

        els.choices.appendChild(button);
      });
    }

    function answer(round, index) {
      if (state.locked) return;
      state.locked = true;

      const buttons = Array.from(els.choices.querySelectorAll('.quest-choice'));
      buttons.forEach((button, buttonIndex) => {
        button.disabled = true;
        if (buttonIndex === round.correctIndex) button.classList.add('correct');
      });

      const isCorrect = index === round.correctIndex;
      if (isCorrect) {
        state.correct += 1;
        state.streak += 1;
        state.bestStreak = Math.max(state.bestStreak, state.streak);
        state.score += 10 + state.streak * 2;
        els.feedback.textContent = round.success || 'せいかい！';
        els.feedback.className = 'quest-feedback good';
        if (window.geroAudio) {
          window.geroAudio.playCorrect();
          if (state.streak >= 3) window.geroAudio.playStar();
        }
      } else {
        state.streak = 0;
        state.score = Math.max(0, state.score - 2);
        buttons[index]?.classList.add('wrong');
        els.feedback.textContent = round.failure || 'おしい！';
        els.feedback.className = 'quest-feedback bad';
        if (window.geroAudio) window.geroAudio.playWrong();
      }

      updateHud();

      setTimeout(() => {
        state.roundIndex += 1;
        renderRound();
      }, 820);
    }

    function finish() {
      const total = state.rounds.length || 1;
      const accuracy = Math.round((state.correct / total) * 100);
      const outcome = typeof config.evaluateResult === 'function'
        ? config.evaluateResult({ state, total, accuracy, modeKey: state.mode, modes })
        : defaultOutcome({ accuracy });

      const record = typeof config.makeRecord === 'function'
        ? config.makeRecord({ state, total, accuracy, outcome, modeKey: state.mode })
        : {
            score: state.score,
            accuracy,
            bestStreak: state.bestStreak,
            correct: state.correct,
            total
          };

      const currentBest = loadBest(state.mode);
      const isNewBest = compareRecord(record, currentBest);
      if (isNewBest) saveBest(state.mode, record);

      updateStartBest();
      els.resultEmoji.textContent = outcome.emoji;
      els.resultTitle.textContent = outcome.title;
      els.resultMessage.textContent = outcome.message;
      els.resultRank.textContent = outcome.rank;
      els.resultBanner.textContent = isNewBest ? 'NEW BEST! ベストきろくを こうしん！' : (outcome.banner || 'つぎは もっと のばせるよ');
      els.resultScore.textContent = `${record.score} てん`;
      els.resultAccuracy.textContent = `${accuracy}%`;
      els.resultStreak.textContent = `${state.bestStreak} れんぞく`;
      els.resultMode.textContent = modes[state.mode].label;
      els.resultBest.textContent = formatBest(loadBest(state.mode) || record);
      els.resultStars.forEach((star, index) => star.classList.toggle('on', index < outcome.stars));

      show('result');

      if (window.geroAudio) window.geroAudio.playCelebration();
      if (window.geroShare) {
        const resultText = typeof config.shareText === 'function'
          ? config.shareText({ state, record, outcome, modeKey: state.mode, total, accuracy })
          : `${outcome.rank} / ${record.score}てん`;
        window.geroShare('#resultScreen', {
          gameTitle: config.title,
          resultText,
          age: config.age || 'kid'
        });
      }
    }
  }

  function applyTheme(theme) {
    const rootStyle = document.documentElement.style;
    if (theme.pageBg) rootStyle.setProperty('--quest-page-bg', theme.pageBg);
    if (theme.panelBg) rootStyle.setProperty('--quest-panel-bg', theme.panelBg);
    if (theme.shellBg) rootStyle.setProperty('--quest-shell-bg', theme.shellBg);
    if (theme.cardBg) rootStyle.setProperty('--quest-card-bg', theme.cardBg);
    if (theme.accent) rootStyle.setProperty('--quest-accent', theme.accent);
    if (theme.accent2) rootStyle.setProperty('--quest-accent-2', theme.accent2);
    if (theme.soft) rootStyle.setProperty('--quest-soft', theme.soft);
    if (theme.text) rootStyle.setProperty('--quest-text', theme.text);
    if (theme.muted) rootStyle.setProperty('--quest-muted', theme.muted);
    if (theme.shadow) rootStyle.setProperty('--quest-shadow', theme.shadow);
  }

  function template(config, modes, modeKeys) {
    const modeButtons = modeKeys.map((modeKey, index) => `
      <button class="quest-mode ${index === 0 ? 'easy' : 'hard'}" type="button" data-mode="${modeKey}">
        <strong>${modes[modeKey].label}</strong>
        <span>${modes[modeKey].description || ''}</span>
      </button>
    `).join('');

    const chips = (config.chips || []).map((chip) => `<span class="quest-chip">${chip}</span>`).join('');

    return `
      <div class="quest-shell">
        <header class="quest-top">
          <a class="quest-back" href="../../index.html" aria-label="げろげーろ学園にもどる">←</a>
          <div class="quest-heading">
            <strong>${config.title}</strong>
            <span>${config.subtitle || ''}</span>
          </div>
          <button class="quest-sound" id="soundToggle" type="button" aria-label="おとのオンオフ">🔊</button>
        </header>

        <div class="quest-hud">
          <div class="quest-pill">ラウンド<strong id="questRound">0 / 0</strong></div>
          <div class="quest-pill">スコア<strong id="questScore">0</strong></div>
          <div class="quest-pill accent">れんぞく<strong id="questStreak">0 れんぞく</strong></div>
          <div class="quest-pill">ベスト<strong id="questBest">まだ</strong></div>
        </div>

        <section class="quest-screen active" id="startScreen">
          <div class="quest-panel">
            <div class="quest-start-grid">
              <div>
                <div class="quest-hero">${config.emoji || '🐸'}</div>
                <h1 class="quest-start-title">${config.title}</h1>
                <p class="quest-start-copy">${config.description || ''}</p>
                <div class="quest-chip-row">${chips}</div>
              </div>
              <div>
                <div class="quest-mode-stack">${modeButtons}</div>
                <div class="quest-best">
                  <strong>ベストきろく</strong>
                  <div id="startBestSummary">まだ</div>
                </div>
                <div class="quest-guide">
                  <strong>あそびかた</strong>
                  <div>1. もんだいを よくみる</div>
                  <div>2. こたえを タッチ</div>
                  <div>3. できた！ を どんどん ふやそう</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="quest-screen" id="gameScreen">
          <div class="quest-panel">
            <div class="quest-status">
              <div class="quest-prompt">
                <strong id="questPrompt">えらんで みよう</strong>
                <span id="questPromptNote">よくみて えらんでね</span>
              </div>
              <div class="quest-badge" id="questBadge">やさしい</div>
            </div>
            <div class="quest-scene" id="questScene"></div>
            <div class="quest-choice-grid" id="questChoices"></div>
            <div class="quest-feedback" id="questFeedback">えらんで みよう</div>
          </div>
        </section>

        <section class="quest-screen" id="resultScreen">
          <div class="quest-panel quest-result">
            <div class="quest-result-emoji" id="resultEmoji">${config.emoji || '🐸'}</div>
            <h2 id="resultTitle">たのしかったね！</h2>
            <p id="resultMessage"></p>
            <div class="quest-rank" id="resultRank">RANK A</div>
            <div class="quest-stars" id="resultStars"><span>⭐</span><span>⭐</span><span>⭐</span></div>
            <div class="quest-banner" id="resultBanner">ベストに ちょうせんしよう</div>
            <div class="quest-stats">
              <div class="quest-stat">スコア<strong id="resultScore">0 てん</strong></div>
              <div class="quest-stat">せいかい<strong id="resultAccuracy">0%</strong></div>
              <div class="quest-stat">れんぞく<strong id="resultStreak">0 れんぞく</strong></div>
              <div class="quest-stat">モード<strong id="resultMode">やさしい</strong></div>
            </div>
            <div class="quest-best" style="margin-bottom:16px">
              <strong>このモードの ベスト</strong>
              <div id="resultBestText">まだ</div>
            </div>
            <div class="quest-result-actions">
              <button class="quest-result-btn" type="button" id="retryBtn">もういちど</button>
              <a class="quest-result-btn alt" href="../../index.html">ほかのゲームへ</a>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  function defaultOutcome({ accuracy }) {
    if (accuracy >= 95) {
      return {
        emoji: '🏆',
        title: 'ばっちり クリア！',
        message: 'すごい！ こたえる はやさも せいかくさも ばっちりです。',
        rank: 'RANK S',
        stars: 3,
        banner: 'パーフェクトに ちょうせん！'
      };
    }

    if (accuracy >= 80) {
      return {
        emoji: '🌟',
        title: 'とっても じょうず！',
        message: 'あと すこしで パーフェクト。もういちどで もっと のびるよ。',
        rank: 'RANK A',
        stars: 2,
        banner: 'ベストを ぬりかえよう'
      };
    }

    return {
      emoji: '🐸',
      title: 'たのしく できたね！',
      message: 'つぎは もっと こたえを みつけられるよ。ゆっくり ちょうせんしよう。',
      rank: 'RANK B',
      stars: 1,
      banner: 'つぎのチャレンジも たのしもう'
    };
  }
})();
