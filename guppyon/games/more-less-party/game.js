(() => {
  const utils = window.GeroChoiceQuestUtils;
  const OBJECTS = [
    { emoji: '🎈', label: 'ふうせん' },
    { emoji: '🍪', label: 'くっきー' },
    { emoji: '⭐', label: 'ほし' },
    { emoji: '🧁', label: 'けーき' },
    { emoji: '🧸', label: 'ぬいぐるみ' }
  ];

  createChoiceQuest({
    slug: 'more-less-party',
    title: 'どっちが おおい？',
    subtitle: 'かずを くらべてみよう',
    description: 'おおい・すくないを みくらべる かずあそび。パーティーの ふうせんや おかしを くらべよう。',
    age: 'toddler',
    emoji: '🎈',
    chips: ['3〜5さい', 'かずくらべ', 'ぱっと見わける'],
    theme: {
      pageBg: 'linear-gradient(180deg, #fff2fb, #ffd5ef 42%, #ffe1a8)',
      accent: '#ec5aa6',
      accent2: '#ffd35f',
      soft: 'rgba(236, 90, 166, 0.14)',
      text: '#5a2b47',
      muted: '#7a5d72',
      shadow: '0 22px 42px rgba(119, 56, 96, 0.16)'
    },
    modes: {
      easy: { label: 'やさしい', description: '6もん' },
      hard: { label: 'チャレンジ', description: '8もん' }
    },
    createRounds(modeKey) {
      const total = modeKey === 'easy' ? 6 : 8;
      return utils.range(total).map(() => {
        const object = utils.sample(OBJECTS);
        const ask = Math.random() < 0.5 ? 'more' : 'less';
        const base = modeKey === 'easy' ? 2 + Math.floor(Math.random() * 3) : 3 + Math.floor(Math.random() * 3);
        const diff = modeKey === 'easy' ? 2 + Math.floor(Math.random() * 2) : 1 + Math.floor(Math.random() * 2);
        const pair = utils.shuffle([
          { count: base, label: `${base}こ`, stack: utils.repeat(object.emoji, base) },
          { count: base + diff, label: `${base + diff}こ`, stack: utils.repeat(object.emoji, base + diff) }
        ]);

        return {
          prompt: ask === 'more' ? 'おおい ほうは どっち？' : 'すくない ほうは どっち？',
          note: `${object.label} の かずを くらべよう`,
          badge: ask === 'more' ? 'おおい' : 'すくない',
          scene: {
            art: object.emoji,
            title: `${object.label} を くらべよう`,
            text: 'たくさん あるほうか、すくない ほうかを みつけてね'
          },
          choices: pair.map((choice) => ({ label: choice.label, hint: object.label, stack: choice.stack, count: choice.count })),
          correctIndex: ask === 'more'
            ? pair.findIndex((choice) => choice.count === base + diff)
            : pair.findIndex((choice) => choice.count === base),
          success: 'いいね！ ちゃんと くらべられた',
          failure: ask === 'more' ? 'たくさん あるほうを みよう' : 'すくない ほうを みよう'
        };
      });
    },
    renderChoice(choice, button) {
      button.innerHTML = `
        <span class="choice-stack">${choice.stack}</span>
        <span class="choice-label">${choice.label}</span>
        <span class="choice-hint">${choice.hint}</span>
      `;
    },
    shareText({ outcome, record }) {
      return `${outcome.rank} / ${record.score}てん`;
    }
  });
})();
