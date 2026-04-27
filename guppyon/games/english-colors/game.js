(() => {
  const utils = window.GeroChoiceQuestUtils;
  const COLORS = [
    { word: 'RED', jp: 'あか', swatch: '#ff6b6b', ink: '#ffffff' },
    { word: 'BLUE', jp: 'あお', swatch: '#5b8dff', ink: '#ffffff' },
    { word: 'YELLOW', jp: 'きいろ', swatch: '#ffd93d', ink: '#5a4600' },
    { word: 'GREEN', jp: 'みどり', swatch: '#40c57a', ink: '#ffffff' },
    { word: 'PINK', jp: 'ぴんく', swatch: '#ff8ac7', ink: '#5c2346' },
    { word: 'ORANGE', jp: 'おれんじ', swatch: '#ff9b3f', ink: '#603400' }
  ];

  createChoiceQuest({
    slug: 'english-colors',
    title: 'カラータッチABC',
    subtitle: 'いろの えいごを えらぼう',
    description: 'RED、BLUE、YELLOW。いろの えいごを みて、ぴったりの いろを タッチする カラーゲームです。',
    age: 'kid',
    emoji: '🎨',
    chips: ['6さい〜', 'えいご', 'いろでおぼえる'],
    theme: {
      pageBg: 'linear-gradient(180deg, #eef5ff, #dfebff 42%, #ffe8f8)',
      accent: '#5b8dff',
      accent2: '#ffd86d',
      soft: 'rgba(91, 141, 255, 0.13)',
      text: '#274378',
      muted: '#5d6f95',
      shadow: '0 22px 42px rgba(66, 92, 148, 0.18)'
    },
    modes: {
      easy: { label: 'やさしい', description: '7もん' },
      hard: { label: 'チャレンジ', description: '9もん' }
    },
    createRounds(modeKey) {
      const total = modeKey === 'easy' ? 7 : 9;
      const choiceCount = modeKey === 'easy' ? 3 : 4;
      return utils.range(total).map(() => {
        const target = utils.sample(COLORS);
        const options = utils.shuffle([target, ...utils.pickMany(COLORS.filter((item) => item.word !== target.word), choiceCount - 1)]);
        return {
          prompt: `${target.word} を えらぼう`,
          note: `${target.jp} の いろは どれかな？`,
          badge: 'ABC',
          scene: {
            art: '🎨',
            title: target.word,
            text: `${target.jp} の いろを タッチしてね`
          },
          choices: options.map((item) => ({
            label: item.word,
            hint: item.jp,
            swatch: item.swatch,
            ink: item.ink
          })),
          correctIndex: options.findIndex((item) => item.word === target.word),
          success: 'Great! その いろで あってる',
          failure: `${target.word} が せいかい！`
        };
      });
    },
    renderChoice(choice, button) {
      button.style.background = choice.swatch;
      button.style.color = choice.ink;
      button.innerHTML = `
        <span class="quest-swatch" style="background:${choice.swatch}"></span>
        <span class="choice-label">${choice.label}</span>
        <span class="choice-hint">${choice.hint}</span>
      `;
    },
    shareText({ outcome, record }) {
      return `${outcome.rank} / ${record.score}てん`;
    }
  });
})();
