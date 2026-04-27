(() => {
  const utils = window.GeroChoiceQuestUtils;
  const FRIENDS = [
    { emoji: '🐶', label: 'いぬ' },
    { emoji: '🐱', label: 'ねこ' },
    { emoji: '🐰', label: 'うさぎ' },
    { emoji: '🐼', label: 'ぱんだ' },
    { emoji: '🐸', label: 'かえる' },
    { emoji: '🐧', label: 'ぺんぎん' },
    { emoji: '🦁', label: 'らいおん' },
    { emoji: '🐻', label: 'くま' }
  ];

  createChoiceQuest({
    slug: 'same-friends',
    title: 'おなじはどれ？',
    subtitle: 'おなじ なかまを みつけよう',
    description: 'おなじ どうぶつを みつけるだけ。ちいさい子でも すぐ できる やさしい タッチあそびです。',
    age: 'baby',
    emoji: '🐣',
    chips: ['1〜2さい', 'タッチだけ', 'にっこり発見'],
    theme: {
      pageBg: 'linear-gradient(180deg, #fff7dc, #ffd9a8 42%, #ffc6d4)',
      accent: '#ff8a65',
      accent2: '#ffd56d',
      soft: 'rgba(255, 138, 101, 0.14)',
      text: '#5c3a2f',
      muted: '#7b5b50',
      shadow: '0 22px 42px rgba(133, 73, 48, 0.18)'
    },
    modes: {
      easy: { label: 'やさしい', description: '6もん' },
      hard: { label: 'わくわく', description: '8もん' }
    },
    createRounds(modeKey) {
      const total = modeKey === 'easy' ? 6 : 8;
      const choiceCount = modeKey === 'easy' ? 3 : 4;
      return utils.range(total).map(() => {
        const target = utils.sample(FRIENDS);
        const options = utils.shuffle([target, ...utils.pickMany(FRIENDS.filter((item) => item.label !== target.label), choiceCount - 1)]);
        return {
          prompt: 'おなじ どうぶつは どれ？',
          note: `${target.label} を えらんでね`,
          badge: modeKey === 'easy' ? 'やさしい' : 'わくわく',
          scene: {
            art: target.emoji,
            title: `${target.label} を さがそう`,
            text: 'おなじ なかまを タッチしてね'
          },
          choices: options.map((item) => ({ emoji: item.emoji, label: item.label })),
          correctIndex: options.findIndex((item) => item.label === target.label),
          success: 'ぴったり！ おなじだったね',
          failure: `${target.label} が せいかい！`
        };
      });
    },
    shareText({ outcome, record }) {
      return `${outcome.rank} / ${record.score}てん`;
    }
  });
})();
