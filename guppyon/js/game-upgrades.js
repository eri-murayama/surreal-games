(() => {
  'use strict';

  const slugMatch = window.location.pathname.match(/games\/([^/]+)\//);
  if (!slugMatch) return;

  const slug = slugMatch[1];
  const toastRoot = ensureToastRoot();
  injectStyles();

  const sandboxConfigs = {
    'pop-bubbles': {
      storageKey: 'gero-upgrade-pop-bubbles',
      title: 'バブルミッション',
      label: 'POP',
      selector: '.bubble',
      eventName: 'pointerdown',
      top: 72,
      mission: 'にじバブルを 3こ みつけよう',
      onHit(target, state, panel) {
        if (target.classList.contains('rainbow')) {
          state.special = (state.special || 0) + 1;
          panel.note.textContent = `にじ ${state.special} / 3`;
          if (state.special % 3 === 0) {
            showToast('にじバブルだ！ キラキラごほうび！', 'warm');
          }
        }
      },
      formatNote(state) {
        return `にじ ${state.special || 0} / 3`;
      },
      milestoneText(count) {
        return `${count}こ ポン！ すごい！`;
      }
    },
    'animal-sounds': {
      storageKey: 'gero-upgrade-animal-sounds',
      title: 'どうぶつサファリ',
      label: 'みつけた',
      selector: '.animal-btn',
      eventName: 'click',
      top: 92,
      mission: 'おなじ どうぶつを さがしてみよう',
      setup(panel) {
        panel.note.textContent = 'さがして: いぬ';
        return { target: 'いぬ', clears: 0 };
      },
      onHit(target, state, panel) {
        const name = target.getAttribute('aria-label') || '';
        if (name === state.target) {
          state.clears += 1;
          showToast(`みつけた！ ${name}`, 'warm');
          const all = Array.from(document.querySelectorAll('.animal-btn')).map((btn) => btn.getAttribute('aria-label')).filter(Boolean);
          if (all.length > 0) {
            const next = all[Math.floor(Math.random() * all.length)];
            state.target = next === state.target && all.length > 1
              ? all[(all.indexOf(next) + 1) % all.length]
              : next;
            panel.note.textContent = `さがして: ${state.target}`;
          }
        }
      },
      formatNote(state) {
        return `クリア ${state.clears || 0} / 8`;
      },
      milestone: 8,
      milestoneText() {
        return 'どうぶつパレード できあがり！';
      }
    },
    'color-touch': {
      storageKey: 'gero-upgrade-color-touch',
      title: 'いろリズム',
      label: 'タッチ',
      selector: '#gameCanvas',
      eventName: 'pointerdown',
      top: 72,
      mission: 'はやく 15タッチで はなび！',
      onHit(target, state, panel, event) {
        const now = Date.now();
        state.combo = now - (state.lastTouchAt || 0) < 700 ? (state.combo || 0) + 1 : 1;
        state.lastTouchAt = now;
        state.bestCombo = Math.max(state.bestCombo || 0, state.combo);
        panel.note.textContent = `コンボ x${state.combo}`;
      },
      formatBest(record) {
        return `ベスト ${record.best || 0} / コンボ ${record.bestCombo || 0}`;
      },
      saveExtra(record, state) {
        record.bestCombo = Math.max(record.bestCombo || 0, state.bestCombo || 0);
      },
      milestone: 15,
      milestoneText(count) {
        return `${count}タッチで キラキラ満開！`;
      }
    },
    'peekaboo': {
      storageKey: 'gero-upgrade-peekaboo',
      title: 'ばあ！ ミッション',
      label: 'ばあ！',
      selector: '.hiding-spot',
      eventName: 'touchstart',
      top: 72,
      mission: '6かいで みんなばあ！',
      onHit(target, state, panel) {
        const next = 6 - (state.count % 6 || 6);
        panel.note.textContent = `あと ${next} で おいわい`;
      },
      formatNote(state) {
        const next = 6 - (state.count % 6 || 6);
        return `あと ${next} で おいわい`;
      },
      milestone: 6,
      milestoneText() {
        return 'みんな ばあ！ パレードだよ！';
      }
    },
    'music-maker': {
      storageKey: 'gero-upgrade-music-maker',
      title: 'おとラボ',
      label: 'おと',
      selector: '.piano-key, .drum-pad, .forest-element',
      eventName: 'pointerdown',
      top: 112,
      mission: 'おてほんを まねして あそぼう',
      setup(panel) {
        installMusicPresets(panel);
        return {};
      },
      milestone: 20,
      milestoneText(count) {
        return `${count}おと かなでたよ！`;
      }
    }
  };

  const resultConfigs = {
    'english-words': {
      storageKey: 'gero-upgrade-english-words',
      mission: '8もんいじょう せいかいで ことばマスター！',
      startHost: '#startScreen',
      resultScreen: '#endScreen',
      resultHost: '#endScreen .end-card',
      readResult() {
        const fraction = parseFraction(textOf('#endScore'));
        const stars = (textOf('#endStars').match(/⭐/g) || []).length;
        return { score: fraction.value, total: fraction.total, stars };
      },
      compare(a, b) {
        if (!b) return true;
        if (a.score !== b.score) return a.score > b.score;
        return a.stars > b.stars;
      },
      bestSummary(record) {
        return `ベスト ${record.score}/${record.total} ⭐${record.stars}`;
      },
      badges(record) {
        const chips = [];
        if (record.score === record.total) chips.push('🌈 パーフェクト');
        if (record.stars >= 3) chips.push('⭐ スター3');
        if (record.score >= 8) chips.push('📚 ことばじょうず');
        return chips;
      }
    },
    'hiragana-touch': {
      storageKey: 'gero-upgrade-hiragana-touch',
      mission: 'いっぱつせいかいを 10こ ねらおう！',
      startHost: '#startScreen .start-screen',
      resultScreen: '#endScreen',
      resultHost: '#endScreen .end-screen',
      readResult() {
        const fraction = parseFraction(textOf('#statCorrect'));
        return {
          score: fraction.value,
          total: fraction.total,
          perfect: parseNumber(textOf('#statPerfect')),
          wrong: parseNumber(textOf('#statWrong'))
        };
      },
      compare(a, b) {
        if (!b) return true;
        if (a.score !== b.score) return a.score > b.score;
        if (a.perfect !== b.perfect) return a.perfect > b.perfect;
        return a.wrong < b.wrong;
      },
      bestSummary(record) {
        return `ベスト ${record.score}/${record.total} 🎯${record.perfect}`;
      },
      badges(record) {
        const chips = [];
        if (record.wrong === 0) chips.push('💮 ノーミス');
        if (record.perfect >= 10) chips.push('🎯 いっぱつ名人');
        if (record.score >= 12) chips.push('🌸 ひらがな上手');
        return chips;
      }
    },
    'kanji-quiz': {
      storageKey: 'gero-upgrade-kanji-quiz',
      mission: 'Sランクを めざして ぜんもん せいかい！',
      startHost: '#titleScreen',
      resultScreen: '#resultScreen',
      resultHost: '#resultScreen',
      readResult() {
        const fraction = parseFraction(textOf('#resultScore'));
        return {
          score: fraction.value,
          total: fraction.total,
          rank: textOf('#resultRank')
        };
      },
      compare(a, b) {
        if (!b) return true;
        if (rankValue(a.rank) !== rankValue(b.rank)) return rankValue(a.rank) > rankValue(b.rank);
        return a.score > b.score;
      },
      bestSummary(record) {
        return `ベスト ${record.rank} / ${record.score}/${record.total}`;
      },
      badges(record) {
        const chips = [];
        if (record.rank === 'S') chips.push('🏆 Sランク');
        if (record.score === record.total) chips.push('📘 全問正解');
        if (record.score >= 8) chips.push('🖍 漢字つよい');
        return chips;
      }
    },
    'prefecture-master': {
      storageKey: 'gero-upgrade-prefecture-master',
      mission: '8もんいじょう せいかいで ちりマスター！',
      startHost: '#screen-start',
      resultScreen: '#screen-result',
      resultHost: '#screen-result .result-card',
      readResult() {
        return {
          score: parseNumber(textOf('#result-score-num')),
          total: 10,
          rank: textOf('#result-rank')
        };
      },
      compare(a, b) {
        if (!b) return true;
        if (a.score !== b.score) return a.score > b.score;
        return rankValue(a.rank) > rankValue(b.rank);
      },
      bestSummary(record) {
        return `ベスト ${record.score}/${record.total} ${record.rank}`;
      },
      badges(record) {
        const chips = [];
        if (record.score === record.total) chips.push('🗾 全国制覇');
        if (record.score >= 8) chips.push('🏔 地理つよい');
        if (record.rank) chips.push(`✨ ${record.rank}`);
        return chips;
      }
    },
    'shape-puzzle': {
      storageKey: 'gero-upgrade-shape-puzzle',
      mission: '100てん いじょうで かたち名人！',
      startHost: '#startScreen .start-screen',
      resultScreen: '#resultScreen',
      resultHost: '#resultScreen .result-screen',
      readResult() {
        return {
          score: parseNumber(textOf('#resultScore')),
          detail: textOf('#resultDetail')
        };
      },
      compare(a, b) {
        if (!b) return true;
        return a.score > b.score;
      },
      bestSummary(record) {
        return `ベスト ${record.score}てん`;
      },
      badges(record) {
        const chips = [];
        if (record.score >= 120) chips.push('🔷 かたちマスター');
        if (record.score >= 90) chips.push('🎨 つくるの上手');
        return chips;
      }
    },
    'kanji-reading': {
      storageKey: 'gero-upgrade-kanji-reading',
      mission: '10もんいじょう せいかいで かんじ博士！',
      startHost: '#title-screen',
      resultScreen: '#result-screen',
      resultHost: '#result-screen',
      readResult() {
        const fraction = parseFraction(textOf('#result-score-num'));
        return {
          score: fraction.value,
          total: fraction.total,
          rank: textOf('#result-rank')
        };
      },
      compare(a, b) {
        if (!b) return true;
        if (a.score !== b.score) return a.score > b.score;
        return rankValue(a.rank) > rankValue(b.rank);
      },
      bestSummary(record) {
        return `ベスト ${record.score}/${record.total} ${record.rank}`;
      },
      badges(record) {
        const chips = [];
        if (record.score >= 13) chips.push('🎓 博士クラス');
        if (record.score >= 10) chips.push('📖 難読つよい');
        if (record.rank) chips.push(`✨ ${record.rank}`);
        return chips;
      }
    }
  };

  if (sandboxConfigs[slug]) {
    setupSandboxUpgrade(sandboxConfigs[slug]);
  }

  if (resultConfigs[slug]) {
    setupResultUpgrade(resultConfigs[slug]);
  }

  function setupSandboxUpgrade(config) {
    const record = loadRecord(config.storageKey);
    const panel = createFloatingPanel(config.title, config.top || 72);
    const state = {
      count: 0,
      best: record.best || 0,
      special: record.special || 0,
      bestCombo: record.bestCombo || 0
    };

    if (typeof config.setup === 'function') {
      Object.assign(state, config.setup(panel) || {});
    }

    updateSandboxPanel(panel, config, state);

    const handler = (event) => {
      const target = event.target && event.target.closest(config.selector);
      if (!target) return;
      state.count += 1;
      state.best = Math.max(state.best, state.count);
      if (typeof config.onHit === 'function') {
        config.onHit(target, state, panel, event);
      }
      const payload = { best: state.best, special: state.special || 0, bestCombo: state.bestCombo || 0 };
      if (typeof config.saveExtra === 'function') {
        config.saveExtra(payload, state);
      }
      saveRecord(config.storageKey, payload);
      updateSandboxPanel(panel, config, state);
      if (config.milestone && state.count % config.milestone === 0) {
        showToast(config.milestoneText ? config.milestoneText(state.count) : `${state.count}クリア！`, 'warm');
      }
    };

    document.addEventListener(config.eventName || 'click', handler, { passive: false });
  }

  function setupResultUpgrade(config) {
    const best = loadRecord(config.storageKey);
    const startHost = document.querySelector(config.startHost);
    const resultScreen = document.querySelector(config.resultScreen);
    const resultHost = document.querySelector(config.resultHost);
    if (!startHost || !resultScreen || !resultHost) return;

    const startStack = document.createElement('div');
    startStack.className = 'gero-upgrade-stack';
    startStack.innerHTML = `
      <div class="gero-upgrade-card">
        <div class="gero-upgrade-card-label">MISSION</div>
        <div class="gero-upgrade-card-value">${config.mission}</div>
      </div>
      <div class="gero-upgrade-card">
        <div class="gero-upgrade-card-label">BEST</div>
        <div class="gero-upgrade-card-value" data-best-summary>${best.best ? config.bestSummary(best.best) : 'まだないよ'}</div>
      </div>
    `;
    startHost.appendChild(startStack);

    const resultExtras = document.createElement('div');
    resultExtras.className = 'gero-upgrade-result';
    resultExtras.innerHTML = `
      <div class="gero-upgrade-banner" data-result-banner>ちょうせんして ベストをめざそう！</div>
      <div class="gero-upgrade-badges" data-result-badges></div>
    `;
    const buttons = resultHost.querySelector('.result-buttons, .result-btns, .end-buttons');
    if (buttons) {
      resultHost.insertBefore(resultExtras, buttons);
    } else {
      resultHost.appendChild(resultExtras);
    }

    observeVisible(resultScreen, () => {
      const candidate = config.readResult();
      const current = loadRecord(config.storageKey).best;
      const isNewBest = config.compare(candidate, current);
      if (isNewBest) {
        saveRecord(config.storageKey, { best: candidate });
      }
      const saved = loadRecord(config.storageKey).best || candidate;
      startStack.querySelector('[data-best-summary]').textContent = config.bestSummary(saved);
      resultExtras.querySelector('[data-result-banner]').textContent = isNewBest
        ? 'NEW BEST! さいこうきろく こうしん'
        : `ベスト ${config.bestSummary(saved)}`;
      const badges = config.badges(candidate);
      const badgesEl = resultExtras.querySelector('[data-result-badges]');
      badgesEl.innerHTML = '';
      badges.forEach((label) => {
        const chip = document.createElement('span');
        chip.className = 'gero-upgrade-chip';
        chip.textContent = label;
        badgesEl.appendChild(chip);
      });
    });
  }

  function updateSandboxPanel(panel, config, state) {
    panel.value.textContent = `${config.label} ${state.count}`;
    panel.best.textContent = config.formatBest
      ? config.formatBest({ best: state.best, bestCombo: state.bestCombo })
      : `ベスト ${state.best}`;
    panel.note.textContent = config.formatNote ? config.formatNote(state) : config.mission;
  }

  function createFloatingPanel(title, top) {
    const panel = document.createElement('div');
    panel.className = 'gero-upgrade-floating';
    panel.style.top = `max(${top}px, calc(env(safe-area-inset-top) + 12px))`;
    panel.innerHTML = `
      <div class="gero-upgrade-floating-title">${title}</div>
      <div class="gero-upgrade-floating-value"></div>
      <div class="gero-upgrade-floating-best"></div>
      <div class="gero-upgrade-floating-note"></div>
    `;
    document.body.appendChild(panel);
    return {
      root: panel,
      value: panel.querySelector('.gero-upgrade-floating-value'),
      best: panel.querySelector('.gero-upgrade-floating-best'),
      note: panel.querySelector('.gero-upgrade-floating-note')
    };
  }

  function installMusicPresets(panel) {
    const selector = document.querySelector('.mode-selector');
    if (!selector || selector.querySelector('[data-gero-presets]')) return;

    const wrap = document.createElement('div');
    wrap.className = 'gero-upgrade-presets';
    wrap.setAttribute('data-gero-presets', 'true');
    wrap.innerHTML = `
      <button type="button" class="gero-upgrade-mini-btn" data-seq="piano">おてほん: ドレミ</button>
      <button type="button" class="gero-upgrade-mini-btn" data-seq="drum">おてほん: たいこ</button>
      <button type="button" class="gero-upgrade-mini-btn" data-seq="forest">おてほん: もり</button>
    `;
    selector.insertAdjacentElement('afterend', wrap);

    const sequences = {
      piano: ['.piano-key:nth-child(1)', '.piano-key:nth-child(2)', '.piano-key:nth-child(3)', '.piano-key:nth-child(5)', '.piano-key:nth-child(8)'],
      drum: ['.drum-pad.red', '.drum-pad.blue', '.drum-pad.yellow', '.drum-pad.green', '.drum-pad.red'],
      forest: ['.forest-element[data-sound="bird"]', '.forest-element[data-sound="flower"]', '.forest-element[data-sound="frog"]', '.forest-element[data-sound="water"]']
    };

    wrap.querySelectorAll('.gero-upgrade-mini-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sequence = sequences[btn.dataset.seq] || [];
        sequence.forEach((selectorText, index) => {
          window.setTimeout(() => {
            const target = document.querySelector(selectorText);
            if (!target) return;
            target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: index + 1 }));
            window.setTimeout(() => {
              target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: index + 1 }));
            }, 80);
          }, index * 260);
        });
        showToast('おてほんスタート！', 'soft');
      });
    });
  }

  function observeVisible(target, callback) {
    let lastVisible = isVisible(target);
    if (lastVisible) callback();
    const observer = new MutationObserver(() => {
      const nowVisible = isVisible(target);
      if (nowVisible && !lastVisible) callback();
      lastVisible = nowVisible;
    });
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'style', 'hidden'] });
  }

  function isVisible(el) {
    if (!el) return false;
    if (el.classList.contains('hidden')) return false;
    if (el.getAttribute('hidden') !== null) return false;
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  }

  function parseFraction(text) {
    const match = String(text || '').match(/(\d+)\s*\/\s*(\d+)/);
    return {
      value: match ? Number(match[1]) : 0,
      total: match ? Number(match[2]) : 0
    };
  }

  function parseNumber(text) {
    const match = String(text || '').match(/-?\d+/);
    return match ? Number(match[0]) : 0;
  }

  function textOf(selector) {
    const el = document.querySelector(selector);
    return el ? el.textContent.trim() : '';
  }

  function rankValue(rank) {
    if (/S|博士|金/.test(rank)) return 4;
    if (/A|銀/.test(rank)) return 3;
    if (/B|銅/.test(rank)) return 2;
    return 1;
  }

  function loadRecord(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || '{}');
    } catch (error) {
      return {};
    }
  }

  function saveRecord(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // Ignore storage failures.
    }
  }

  function ensureToastRoot() {
    const root = document.createElement('div');
    root.className = 'gero-upgrade-toast-root';
    document.body.appendChild(root);
    return root;
  }

  function showToast(text, tone) {
    const toast = document.createElement('div');
    toast.className = `gero-upgrade-toast ${tone === 'soft' ? 'soft' : ''}`;
    toast.textContent = text;
    toastRoot.appendChild(toast);
    window.setTimeout(() => toast.remove(), 1800);
  }

  function injectStyles() {
    if (document.getElementById('gero-upgrade-styles')) return;
    const link = document.createElement('link');
    link.id = 'gero-upgrade-styles';
    link.rel = 'stylesheet';
    link.href = '../../css/game-upgrades.css';
    document.head.appendChild(link);
  }
})();
