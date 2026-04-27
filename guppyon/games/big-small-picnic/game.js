(() => {
  const utils = window.GeroChoiceQuestUtils;
  const ITEMS = [
    { emoji: '🍎', label: 'りんご' },
    { emoji: '🍓', label: 'いちご' },
    { emoji: '🧸', label: 'くまさん' },
    { emoji: '🚗', label: 'くるま' },
    { emoji: '⚽', label: 'ぼーる' },
    { emoji: '🦆', label: 'あひる' }
  ];

  createChoiceQuest({
    slug: 'big-small-picnic',
    title: 'おおきい？ ちいさい？',
    subtitle: 'サイズを みて えらぼう',
    description: 'おなじ ものを みくらべて、おおきいか ちいさいかを タッチ。サイズ感を たのしく あそべます。',
    age: 'toddler',
    emoji: '🧺',
    chips: ['3〜5さい', 'サイズあそび', 'くだものピクニック'],
    theme: {
      pageBg: 'linear-gradient(180deg, #fff8e8, #ffe0b2 42%, #ffd1a6)',
      accent: '#ff9f43',
      accent2: '#ffe07a',
      soft: 'rgba(255, 159, 67, 0.14)',
      text: '#5f3e21',
      muted: '#7a5d43',
      shadow: '0 22px 42px rgba(142, 94, 33, 0.16)'
    },
    modes: {
      easy: { label: 'やさしい', description: '6もん' },
      hard: { label: 'よくみる', description: '8もん' }
    },
    createRounds(modeKey) {
      const total = modeKey === 'easy' ? 6 : 8;
      return utils.range(total).map(() => {
        const item = utils.sample(ITEMS);
        const ask = Math.random() < 0.5 ? 'big' : 'small';
        const sizes = modeKey === 'easy'
          ? [
              { size: '1.7rem', hint: 'ちいさい' },
              { size: '3rem', hint: 'おおきい' }
            ]
          : [
              { size: '1.4rem', hint: 'ちいさい' },
              { size: '2.1rem', hint: 'まんなか' },
              { size: '3.1rem', hint: 'おおきい' }
            ];
        const correctIndex = ask === 'big' ? sizes.length - 1 : 0;

        return {
          prompt: ask === 'big' ? 'おおきいのは どれ？' : 'ちいさいのは どれ？',
          note: `${item.label} を よくみて えらぼう`,
          badge: ask === 'big' ? 'おおきい' : 'ちいさい',
          scene: {
            art: item.emoji,
            title: `${item.label} の サイズを みよう`,
            text: 'おなじ ものでも おおきさが ちがうよ'
          },
          choices: sizes.map((entry) => ({
            emoji: item.emoji,
            label: entry.hint,
            hint: item.label,
            size: entry.size
          })),
          correctIndex,
          success: ask === 'big' ? 'そう！ いちばん おおきいね' : 'そう！ いちばん ちいさいね',
          failure: ask === 'big' ? 'いちばん おおきい ものを みつけよう' : 'いちばん ちいさい ものを みつけよう'
        };
      });
    },
    renderChoice(choice, button) {
      button.innerHTML = `
        <span class="choice-emoji" style="font-size:${choice.size}">${choice.emoji}</span>
        <span class="choice-label">${choice.label}</span>
        <span class="choice-hint">${choice.hint}</span>
      `;
    },
    shareText({ outcome, record }) {
      return `${outcome.rank} / ${record.score}てん`;
    }
  });
})();
