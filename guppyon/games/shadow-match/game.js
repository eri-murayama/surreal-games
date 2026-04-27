(() => {
  const utils = window.GeroChoiceQuestUtils;
  const SHAPES = [
    { emoji: '🍎', label: 'りんご' },
    { emoji: '🐰', label: 'うさぎ' },
    { emoji: '🚗', label: 'くるま' },
    { emoji: '⭐', label: 'ほし' },
    { emoji: '🦆', label: 'あひる' },
    { emoji: '🍰', label: 'けーき' },
    { emoji: '⚽', label: 'ぼーる' }
  ];

  createChoiceQuest({
    slug: 'shadow-match',
    title: 'かげえあわせ',
    subtitle: 'かげと おなじ ものを みつけよう',
    description: 'かげを よくみて、おなじ かたちを えらぶ ひらめきゲーム。ひとめで わかると きもちいい！',
    age: 'toddler',
    emoji: '🌒',
    chips: ['3〜5さい', 'ひらめき', 'よくみる力'],
    theme: {
      pageBg: 'linear-gradient(180deg, #f3edff, #d9d1ff 42%, #bfe0ff)',
      accent: '#7c5ce0',
      accent2: '#ffd96b',
      soft: 'rgba(124, 92, 224, 0.13)',
      text: '#332d63',
      muted: '#59557d',
      shadow: '0 22px 42px rgba(74, 62, 140, 0.18)'
    },
    modes: {
      easy: { label: 'やさしい', description: '6もん' },
      hard: { label: 'チャレンジ', description: '8もん' }
    },
    createRounds(modeKey) {
      const total = modeKey === 'easy' ? 6 : 8;
      const choiceCount = modeKey === 'easy' ? 3 : 4;
      return utils.range(total).map(() => {
        const target = utils.sample(SHAPES);
        const options = utils.shuffle([target, ...utils.pickMany(SHAPES.filter((item) => item.label !== target.label), choiceCount - 1)]);
        return {
          prompt: 'この かげは どれ？',
          note: 'かたちを よくみて えらぼう',
          badge: 'かげ',
          scene: {
            art: target.emoji,
            silhouette: true,
            title: 'おなじ かげを みつけよう',
            text: 'ぴったり おなじ ものを えらんでね'
          },
          choices: options.map((item) => ({ emoji: item.emoji, label: item.label })),
          correctIndex: options.findIndex((item) => item.label === target.label),
          success: 'ぴったり！ かげが おなじ',
          failure: `${target.label} が せいかい！`
        };
      });
    },
    shareText({ outcome, record }) {
      return `${outcome.rank} / ${record.score}てん`;
    }
  });
})();
