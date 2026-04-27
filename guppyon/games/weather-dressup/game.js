(() => {
  const utils = window.GeroChoiceQuestUtils;
  const OUTFITS = [
    { emoji: '🧢👕', label: 'ぼうしと はんそで' },
    { emoji: '☂️🧥', label: 'かさと あまぐ' },
    { emoji: '🧣🧤', label: 'まふらーと てぶくろ' },
    { emoji: '👒🩴', label: 'ぼうしと すなばぐつ' },
    { emoji: '🧥👟', label: 'うわぎと くつ' }
  ];

  const SCENES = [
    { weather: '☀️', label: 'はれ', good: OUTFITS[0], text: 'おひさま ぴかぴか！' },
    { weather: '🌧️', label: 'あめ', good: OUTFITS[1], text: 'みずたまりに きをつけて' },
    { weather: '❄️', label: 'ゆき', good: OUTFITS[2], text: 'あったか ふくで でかけよう' },
    { weather: '🌤️', label: 'くもり', good: OUTFITS[4], text: 'すこし ひんやり するかも' }
  ];

  createChoiceQuest({
    slug: 'weather-dressup',
    title: 'おてんきコーデ',
    subtitle: 'おてんきに あう ふくを えらぼう',
    description: 'はれ、あめ、ゆき。おてんきに あわせて ふくを えらぶ ごっこあそびです。',
    age: 'toddler',
    emoji: '☀️',
    chips: ['3〜5さい', 'きせつあそび', 'おしたくごっこ'],
    theme: {
      pageBg: 'linear-gradient(180deg, #eefbff, #d2f0ff 42%, #fff1c8)',
      accent: '#4fc3f7',
      accent2: '#ffd86d',
      soft: 'rgba(79, 195, 247, 0.14)',
      text: '#1e4e67',
      muted: '#537385',
      shadow: '0 22px 42px rgba(50, 105, 131, 0.18)'
    },
    modes: {
      easy: { label: 'やさしい', description: '6もん' },
      hard: { label: 'チャレンジ', description: '8もん' }
    },
    createRounds(modeKey) {
      const total = modeKey === 'easy' ? 6 : 8;
      const choiceCount = modeKey === 'easy' ? 3 : 4;
      return utils.range(total).map(() => {
        const scene = utils.sample(SCENES);
        const options = utils.shuffle([scene.good, ...utils.pickMany(OUTFITS.filter((item) => item.label !== scene.good.label), choiceCount - 1)]);
        return {
          prompt: `${scene.label}の ひは どれを きる？`,
          note: 'おてんきに あう ふくを えらぼう',
          badge: scene.label,
          scene: {
            art: scene.weather,
            title: `${scene.label} の ひだよ`,
            text: scene.text,
            row: ['🧒', scene.weather]
          },
          choices: options.map((item) => ({ emoji: item.emoji, label: item.label })),
          correctIndex: options.findIndex((item) => item.label === scene.good.label),
          success: 'いいね！ その コーデで ばっちり',
          failure: `${scene.good.label} が ぴったり！`
        };
      });
    },
    renderChoice(choice, button) {
      button.innerHTML = `
        <span class="choice-emoji">${choice.emoji}</span>
        <span class="choice-label">${choice.label}</span>
      `;
    },
    shareText({ outcome, record }) {
      return `${outcome.rank} / ${record.score}てん`;
    }
  });
})();
