(() => {
  const utils = window.GeroChoiceQuestUtils;
  const PAIRS = [
    { left: 'あつい', right: 'さむい', emoji: '🔥' },
    { left: 'おおきい', right: 'ちいさい', emoji: '🦖' },
    { left: 'はやい', right: 'おそい', emoji: '🏃' },
    { left: 'あかるい', right: 'くらい', emoji: '💡' },
    { left: 'うえ', right: 'した', emoji: '⬆️' },
    { left: 'みぎ', right: 'ひだり', emoji: '➡️' },
    { left: 'ながい', right: 'みじかい', emoji: '📏' },
    { left: 'わらう', right: 'なく', emoji: '🙂' }
  ];

  createChoiceQuest({
    slug: 'opposites-quiz',
    title: 'はんたいことば',
    subtitle: 'ことばの はんたいを みつけよう',
    description: 'ことばを よくみて、はんたいの いみを もつ ことばを えらぶ こくごクイズです。',
    age: 'kid',
    emoji: '↔️',
    chips: ['6さい〜', 'こくご', 'ことばあそび'],
    theme: {
      pageBg: 'linear-gradient(180deg, #fff0ee, #ffd7d1 42%, #ffe7b8)',
      accent: '#ef6c63',
      accent2: '#ffd86d',
      soft: 'rgba(239, 108, 99, 0.12)',
      text: '#6a2f2a',
      muted: '#85605d',
      shadow: '0 22px 42px rgba(128, 71, 64, 0.18)'
    },
    modes: {
      easy: { label: 'やさしい', description: '7もん' },
      hard: { label: 'チャレンジ', description: '9もん' }
    },
    createRounds(modeKey) {
      const total = modeKey === 'easy' ? 7 : 9;
      const choiceCount = modeKey === 'easy' ? 3 : 4;
      return utils.range(total).map(() => {
        const pair = utils.sample(PAIRS);
        const decoys = utils.pickMany(PAIRS.filter((item) => item.right !== pair.right), choiceCount - 1).map((item) => item.right);
        const options = utils.shuffle([pair.right, ...decoys]);
        return {
          prompt: `「${pair.left}」の はんたいは？`,
          note: 'ぴったりの ことばを えらぼう',
          badge: 'こくご',
          scene: {
            art: pair.emoji,
            title: pair.left,
            text: 'はんたいの いみを もつ ことばは どれかな？'
          },
          choices: options.map((label) => ({ label })),
          correctIndex: options.indexOf(pair.right),
          success: 'いいね！ はんたいことばが わかった',
          failure: `${pair.right} が せいかい！`
        };
      });
    },
    shareText({ outcome, record }) {
      return `${outcome.rank} / ${record.score}てん`;
    }
  });
})();
