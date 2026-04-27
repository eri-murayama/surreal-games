(() => {
  const utils = window.GeroChoiceQuestUtils;

  createChoiceQuest({
    slug: 'clock-touch',
    title: 'とけいタッチ',
    subtitle: 'とけいを みて なんじか こたえよう',
    description: 'ながい はりと みじかい はりを よくみて、いまの じかんを えらぶ とけいゲームです。',
    age: 'kid',
    emoji: '🕒',
    chips: ['6さい〜', 'じかんあそび', 'とけいをよむ'],
    theme: {
      pageBg: 'linear-gradient(180deg, #eef5ff, #d9e7ff 42%, #cdefff)',
      accent: '#4e8ef7',
      accent2: '#ffd86b',
      soft: 'rgba(78, 142, 247, 0.13)',
      text: '#1f3d73',
      muted: '#546b93',
      shadow: '0 22px 42px rgba(54, 93, 162, 0.18)'
    },
    modes: {
      easy: { label: 'やさしい', description: '7もん / ちょうどの じかん' },
      hard: { label: 'チャレンジ', description: '9もん / はんぶんの じかん' }
    },
    createRounds(modeKey) {
      const total = modeKey === 'easy' ? 7 : 9;
      const choiceCount = modeKey === 'easy' ? 3 : 4;
      return utils.range(total).map(() => {
        const hour = 1 + Math.floor(Math.random() * 12);
        const minute = modeKey === 'easy' ? 0 : (Math.random() < 0.5 ? 0 : 30);
        const correct = formatTime(hour, minute);
        const pool = new Set([correct]);

        while (pool.size < choiceCount) {
          const nextHour = 1 + Math.floor(Math.random() * 12);
          const nextMinute = modeKey === 'easy' ? 0 : (Math.random() < 0.5 ? 0 : 30);
          pool.add(formatTime(nextHour, nextMinute));
        }

        const options = utils.shuffle([...pool]);
        return {
          prompt: 'とけいは なんじ？',
          note: 'ながい はりと みじかい はりを みてね',
          badge: modeKey === 'easy' ? 'ちょうど' : 'はんぶん',
          scene: { hour, minute },
          choices: options.map((label) => ({ label })),
          correctIndex: options.indexOf(correct),
          success: 'ぴったり！ じかんが よめた',
          failure: `${correct} が せいかい！`
        };
      });
    },
    renderScene(round, sceneEl) {
      const hourAngle = (round.scene.hour % 12) * 30 + round.scene.minute * 0.5;
      const minuteAngle = round.scene.minute * 6;
      sceneEl.innerHTML = `
        <div class="quest-scene-inner">
          <div class="quest-clock-face">
            <div class="quest-clock-mark" style="--angle:0deg;">12</div>
            <div class="quest-clock-mark" style="--angle:90deg;">3</div>
            <div class="quest-clock-mark" style="--angle:180deg;">6</div>
            <div class="quest-clock-mark" style="--angle:270deg;">9</div>
            <div class="quest-clock-hand hour" style="transform:rotate(${hourAngle}deg);"></div>
            <div class="quest-clock-hand minute" style="transform:rotate(${minuteAngle}deg);"></div>
            <div class="quest-clock-center"></div>
          </div>
          <div class="quest-scene-title">いま なんじかな？</div>
          <div class="quest-scene-text">ちいさい はりは じ、ながい はりは ふん だよ</div>
        </div>
      `;
    },
    shareText({ outcome, record }) {
      return `${outcome.rank} / ${record.score}てん`;
    }
  });

  function formatTime(hour, minute) {
    return minute === 0 ? `${hour}じ` : `${hour}じ30ぷん`;
  }
})();
