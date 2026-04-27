(() => {
  const utils = window.GeroChoiceQuestUtils;
  const PATTERNS = [
    ['🍎', '🍌'],
    ['⭐', '🌙', '⭐'],
    ['🔺', '🔵'],
    ['🐸', '🪷', '🐸'],
    ['🍓', '🍰'],
    ['🚂', '🚃', '🚂']
  ];

  createChoiceQuest({
    slug: 'pattern-train',
    title: 'つぎは なにかな？',
    subtitle: 'ならびの つづきを あてよう',
    description: 'れっしゃみたいに ならんだ しるしを みて、つぎに くる ものを えらぶ パターンゲームです。',
    age: 'kid',
    emoji: '🚂',
    chips: ['6さい〜', 'ひらめき', 'ならびをよむ'],
    theme: {
      pageBg: 'linear-gradient(180deg, #eefcf7, #d2f8ea 42%, #d6ebff)',
      accent: '#34b39a',
      accent2: '#ffd86d',
      soft: 'rgba(52, 179, 154, 0.13)',
      text: '#1d4f49',
      muted: '#55746f',
      shadow: '0 22px 42px rgba(42, 102, 93, 0.18)'
    },
    modes: {
      easy: { label: 'やさしい', description: '7もん' },
      hard: { label: 'チャレンジ', description: '9もん' }
    },
    createRounds(modeKey) {
      const total = modeKey === 'easy' ? 7 : 9;
      const choiceCount = modeKey === 'easy' ? 3 : 4;
      const tokenPool = Array.from(new Set(PATTERNS.flat()));

      return utils.range(total).map(() => {
        const base = utils.sample(PATTERNS);
        const shownLength = modeKey === 'easy' ? 4 : 5;
        const row = utils.range(shownLength).map((index) => base[index % base.length]);
        const answer = base[shownLength % base.length];
        const options = utils.shuffle([answer, ...utils.pickMany(tokenPool.filter((token) => token !== answer), choiceCount - 1)]);

        return {
          prompt: 'つぎは なにかな？',
          note: 'ならびかたを よくみて えらぼう',
          badge: 'パターン',
          scene: {
            art: '🚂',
            title: 'れっしゃの つづきは？',
            text: 'おなじ リズムで つづいているよ',
            row: [...row, '❓']
          },
          choices: options.map((token) => ({ emoji: token, label: token })),
          correctIndex: options.indexOf(answer),
          success: 'そう！ リズムが つづいているね',
          failure: `${answer} が つぎに くるよ`
        };
      });
    },
    renderChoice(choice, button) {
      button.innerHTML = `<span class="choice-emoji">${choice.emoji}</span>`;
    },
    shareText({ outcome, record }) {
      return `${outcome.rank} / ${record.score}てん`;
    }
  });
})();
