(() => {
  const utils = window.GeroChoiceQuestUtils;
  const WORDS = [
    { emoji: '🍎', word: 'APPLE', answer: 'A' },
    { emoji: '🐻', word: 'BEAR', answer: 'B' },
    { emoji: '🐱', word: 'CAT', answer: 'C' },
    { emoji: '🐶', word: 'DOG', answer: 'D' },
    { emoji: '🐘', word: 'ELEPHANT', answer: 'E' },
    { emoji: '🐸', word: 'FROG', answer: 'F' },
    { emoji: '🦁', word: 'LION', answer: 'L' },
    { emoji: '🌙', word: 'MOON', answer: 'M' }
  ];

  createChoiceQuest({
    slug: 'first-letter-safari',
    title: 'さいしょの えいご',
    subtitle: 'はじめの もじを えらぼう',
    description: 'APPLE の さいしょは A。えいたんごの はじめの 1もじを えらぶ えいごクイズです。',
    age: 'kid',
    emoji: '🦁',
    chips: ['6さい〜', 'えいご', 'アルファベット'],
    theme: {
      pageBg: 'linear-gradient(180deg, #eefcf3, #dcf5e2 42%, #fff0c8)',
      accent: '#3bb97e',
      accent2: '#ffd86d',
      soft: 'rgba(59, 185, 126, 0.14)',
      text: '#21523d',
      muted: '#5d7b6c',
      shadow: '0 22px 42px rgba(53, 106, 78, 0.18)'
    },
    modes: {
      easy: { label: 'やさしい', description: '7もん' },
      hard: { label: 'チャレンジ', description: '9もん' }
    },
    createRounds(modeKey) {
      const total = modeKey === 'easy' ? 7 : 9;
      const choiceCount = modeKey === 'easy' ? 3 : 4;
      const letters = Array.from(new Set(WORDS.map((item) => item.answer)));

      return utils.range(total).map(() => {
        const word = utils.sample(WORDS);
        const options = utils.shuffle([word.answer, ...utils.pickMany(letters.filter((letter) => letter !== word.answer), choiceCount - 1)]);
        return {
          prompt: `${word.word} の さいしょは？`,
          note: 'はじめの 1もじを えらぼう',
          badge: 'ABC',
          scene: {
            art: word.emoji,
            title: word.word,
            text: 'いちばん さいしょに くる もじを タッチ！'
          },
          choices: options.map((letter) => ({ label: letter, hint: `${letter} ではじまる` })),
          correctIndex: options.indexOf(word.answer),
          success: 'そう！ はじめの もじが わかった',
          failure: `${word.answer} が せいかい！`
        };
      });
    },
    shareText({ outcome, record }) {
      return `${outcome.rank} / ${record.score}てん`;
    }
  });
})();
