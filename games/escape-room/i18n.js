// ===== 多言語対応 =====
const LANG = {
  ja: {
    title: 'かわいい部屋からの脱出',
    items: 'アイテム',
    protagonist: '主人公',
    close: 'とじる',

    // 初期セリフ
    opening: '……ん？ここは…？ あてもなく歩いていたら知らない部屋に入っちゃった。<br>さあて、どうしようかな♪',

    // 窓の外セリフ
    windowLines: [
      'ヴぅおおおお',
      'ぎょごおおお',
      '出て行っていただけますか～',
      '私の家なんですが～',
      '聞いてますか～',
    ],

    // 画像内テキスト（日本語版はそのまま画像を表示）
    paintingRiddle: '',
    memoRiddle: '',

    // オブジェクト tooltip
    tipDoor: '扉',
    tipPainting: '壁に絵が飾ってある',
    tipWindow: '窓',
    tipClock: '壁掛け時計',
    tipSafe: '金庫',
    tipMemo: '何か落ちている...',
    tipFlashlight: '何か光っている...',
    tipDust: '何か積もっている...',
    tipBento: '何かいい匂いがする...',

    // メモ拾い
    memoPick: 'あっ、なんか紙が落ちてる！ なになに……？<br>アイテムからチェックしてみよっと！',
    memoItemName: 'ナゾのメモ',
    memoRead: 'どれどれ、メモを読んでみよ〜……',
    memoClose: 'ふーん、なにこれ。興味ないや。びりびりに破ろう。',
    memoAlready: 'もう破いちゃったんだった。',

    // 懐中電灯
    flashlightPick: '懐中電灯だ！どうしてこんなところに？何かのプレイで使ったのかな…',
    flashlightItemName: '懐中電灯',
    flashlightUse: '懐中電灯スイッチオン！あられもないところを照らしちゃおう！',

    // ほこり
    dustPick: 'あっ、ほこりだ。この部屋の子はだらしないんだなあ。うふふ。',
    dustItemName: 'ほこり',
    dustUse: '彼女のほこり……じっくり味わおう。',
    dustConsume: 'もぐもぐ……、芳醇なダニの香りと混ざった髪の毛の不快感…、<br>うーん美味美味。',

    // お弁当
    bentoPick: 'おっ、お弁当だ！あとでゆっくり味わおう。',
    bentoItemName: 'お弁当',
    bentoUse: 'れろれろ…お弁当箱を舐めて彼女の塩味を感じて…。',
    bentoConsume: 'れろれろ…お弁当箱を舐めて彼女の塩味を感じて…。<br>残ったおかずはポケットに詰めておこう。',
    bentoEmptyName: '空のお弁当箱',
    bentoEmptyUse: '空っぽのお弁当箱。ごちそうさまでした〜。',

    // 現金
    cashItemName: '現金',
    cashUse: 'おっかね〜おっかね〜♪ いっぱいある〜♪',
    cashConsume: 'ポケットにしまっちゃお♪<br>えへへ、これはぼくのもの〜♪',

    // アイテム操作
    itemPutAway: (name) => `${name}をしまった〜。`,

    // 絵画
    paintingClick: '壁に絵が飾ってある〜。近くで見てみよっと！',
    paintingDestroy: 'つまらない絵だ。貧乏ゆすりが止まらないや。破っておこう。<br>ビリビリ〜！',
    paintingAlready: 'もう絵はびりびりだ。まあいっか♪',

    // 時計
    clockClick: '壁に時計がかかっている。3時だ。<br>僕、3って数字見るとどきどきするんだよね、お尻に見えて。',

    // 壁（隠しメッセージ）
    wallFlashlight: 'わっ！ 壁に何か文字が浮かんできた！！<br>「うんち」って書いてある。うふふ、アブノーマルもいけるくち？',
    wallRevealed: '「うんち」……うふふ。趣味が合いそうだね。',
    wallDefault: '女の子っぽいかわいいお部屋だな～。<br>なんかいい匂いもする。誰かの生活の香り……。',
    hiddenWord: 'うんち',

    // 窓モーダル
    windowPeek: '窓の外を覗いてみよう……！ そ〜っと……',
    windowPeekText: '窓の外を覗いている……',
    windowClose: '外にかわいらしい女の子がいる。<br>おっひょ～～げきまぶ～～！',

    // 金庫
    safeClick: '金庫だ！ 番号を入れてみよ〜！',
    safeBrokenClick: 'もう壊れた金庫だ。やりすぎたかな〜。<br>……まあいっか！',
    safeTitle: '🔒 金庫の暗証番号',
    safeWrong: 'ブッブー！ ハズレ～！',
    safeWrongLines: [
      'は？だる……。一応もう一回やってみるか',
      'もういいだろおい…まじでだるいわ…。次開けよおい。',
    ],
    safeAngry: '舐めてんな',
    safeSmash: 'もういい、叩いて壊す',
    safeSmashed: 'うぇーい、金庫をぶっ壊して現金ゲット！僕を舐めるなよ。',

    // ドア
    doorLocked: 'がちゃがちゃ……ダメだ、なんでか開かない。<br>仕方がないから部屋の中を全部舐めまわすように物色しよう……！不可抗力だ！',
    doorOpen: 'アッ、引き戸かと思ってたけど押し戸だった！',

    // クリア
    clearTitle: '脱出成功！',
    clearTime: (m, s) => `クリアタイム: ${m}分${s}秒`,
    clearBackLink: 'トップに戻る',
    ranks: [
      { max: 60,  icon: '👑', name: '変態プロフェッショナル', comment: '手慣れすぎている。常習犯の疑いあり。' },
      { max: 120, icon: '🦹', name: '侵入のエキスパート', comment: 'この速さ……プロの犯行だ。' },
      { max: 180, icon: '🔍', name: '物色マニア', comment: 'まあまあの手際。次はもっと早くできるはず。' },
      { max: 300, icon: '🐌', name: 'のんびり不法侵入', comment: 'ゆっくり堪能しすぎ。通報されるよ。' },
      { max: Infinity, icon: '😴', name: '居座り犯', comment: 'もはや住んでる。' },
    ],

    // 戻るリンク
    backToTop: '← トップに戻る',
  },

  en: {
    title: 'Escape from a Cute Room',
    items: 'Items',
    protagonist: 'Protagonist',
    close: 'Close',

    opening: '...Huh? Where am I...? I was just wandering around and ended up in a stranger\'s room.<br>Well then, what should I do~?',

    windowLines: [
      'GROOOAAARR',
      'GYAAAAAAH',
      'Could you please leave~?',
      'This is MY house, you know~',
      'Are you even listening~?',
    ],

    // 画像内テキスト（英語版は画像下に翻訳パネル表示）
    paintingRiddle: '<div class="riddle-translation"><div class="riddle-q">Riddle: What kind of cat can\'t you eat?</div><div class="riddle-flavor">"I love hot yoga!" 🐕</div><div class="riddle-a">A. Dog</div></div>',
    memoRiddle: '<div class="riddle-translation"><div class="riddle-q">Riddle: What\'s the worst thing to get stuck in your teeth?</div><div class="riddle-flavor">"I love hot dogs!" 🐕</div><div class="riddle-a">A. Dog</div></div>',

    tipDoor: 'Door',
    tipPainting: 'A painting on the wall',
    tipWindow: 'Window',
    tipClock: 'Wall clock',
    tipSafe: 'Safe',
    tipMemo: 'Something on the floor...',
    tipFlashlight: 'Something shiny...',
    tipDust: 'Something dusty...',
    tipBento: 'Something smells good...',

    memoPick: 'Oh, there\'s a piece of paper on the floor! Let me see...<br>I\'ll check it from the Items!',
    memoItemName: 'Mysterious Memo',
    memoRead: 'Let me read this memo~...',
    memoClose: 'Hmm, boring. I don\'t care. Let me tear it up. Riiip~!',
    memoAlready: 'Oh right, I already tore it up.',

    flashlightPick: 'A flashlight! Why is this here? Maybe it was used for... some kind of play?',
    flashlightItemName: 'Flashlight',
    flashlightUse: 'Flashlight ON! Let me illuminate some naughty places~!',

    dustPick: 'Oh, dust! The girl who lives here must be a slob. Hehe.',
    dustItemName: 'Dust',
    dustUse: 'Her dust... Let me savor it slowly.',
    dustConsume: 'Nom nom... the rich aroma of dust mites mixed with strands of hair...<br>Mmm, delicious~',

    bentoPick: 'Oh, a bento box! I\'ll enjoy this later.',
    bentoItemName: 'Bento Box',
    bentoUse: 'Slurrrp... licking the bento box to taste her salt...',
    bentoConsume: 'Slurrrp... licking the bento box to taste her salt...<br>I\'ll stuff the leftovers in my pockets.',
    bentoEmptyName: 'Empty Bento Box',
    bentoEmptyUse: 'An empty bento box. That was delicious~',

    cashItemName: 'Cash',
    cashUse: 'Money~ money~! There\'s so much~!',
    cashConsume: 'Into my pocket it goes~<br>Hehehe, this is mine now~',

    itemPutAway: (name) => `Put away the ${name}~`,

    paintingClick: 'There\'s a painting on the wall~ Let me take a closer look!',
    paintingDestroy: 'What a boring painting. I can\'t stop fidgeting. Let me rip it up.<br>Riiip~!',
    paintingAlready: 'The painting is already torn to shreds. Oh well~',

    clockClick: 'There\'s a clock on the wall. It\'s 3 o\'clock.<br>The number 3 always makes my heart race... it looks like a butt.',

    wallFlashlight: 'Whoa! Some text appeared on the wall!!<br>It says "poop." Hehe, so she\'s into the kinky stuff?',
    wallRevealed: '"Poop"... Hehe. Seems like we\'d get along.',
    wallDefault: 'Such a cute, girly room~<br>It smells nice too. The scent of someone\'s daily life...',
    hiddenWord: 'poop',

    windowPeek: 'Let me peek outside the window...! Nice and quiet...',
    windowPeekText: 'Peeking outside the window...',
    windowClose: 'There\'s a cute girl outside.<br>Oh my~ she\'s gorgeous~!',

    safeClick: 'A safe! Let me try entering a code~!',
    safeBrokenClick: 'The safe is already broken. Maybe I went too far~<br>...Oh well!',
    safeTitle: '🔒 Safe Combination',
    safeWrong: 'BZZT! Wrong~!',
    safeWrongLines: [
      'Huh? So annoying... Let me try once more.',
      'Come on, seriously... This is so tedious... Just open already.',
    ],
    safeAngry: 'Don\'t mess with me.',
    safeSmash: 'Forget it, I\'ll smash it open',
    safeSmashed: 'Yeah! Smashed the safe and got the cash! Don\'t underestimate me.',

    doorLocked: 'Rattle rattle... No good, it won\'t open.<br>Guess I\'ll have to thoroughly ransack the room...! It\'s not my fault!',
    doorOpen: 'Oh! I thought it was a sliding door, but it\'s a push door!',

    clearTitle: 'Escape Complete!',
    clearTime: (m, s) => `Clear Time: ${m}m ${s}s`,
    clearBackLink: 'Back to Top',
    ranks: [
      { max: 60,  icon: '👑', name: 'Perverted Professional', comment: 'Way too experienced. Suspected repeat offender.' },
      { max: 120, icon: '🦹', name: 'Infiltration Expert', comment: 'This speed... the work of a pro.' },
      { max: 180, icon: '🔍', name: 'Ransacking Maniac', comment: 'Decent work. You can do it faster next time.' },
      { max: 300, icon: '🐌', name: 'Leisurely Trespasser', comment: 'Took too long enjoying yourself. You\'ll get reported.' },
      { max: Infinity, icon: '😴', name: 'Squatter', comment: 'At this point, you live here.' },
    ],

    backToTop: '← Back to Top',
  },
};

// デフォルト言語
let currentLang = (navigator.language || '').startsWith('ja') ? 'ja' : 'en';

function t(key, ...args) {
  const val = LANG[currentLang][key];
  if (typeof val === 'function') return val(...args);
  return val;
}

function setLang(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;

  // タイトル更新
  document.title = lang === 'ja' ? '脱出ゲーム - かわいい部屋からの脱出' : 'Escape Game - Escape from a Cute Room';
  const titleEl = document.querySelector('.game-title');
  if (titleEl) titleEl.textContent = t('title');

  // アイテムラベル
  const label = document.getElementById('item-box-label');
  if (label) label.textContent = t('items');

  // ダイアログ名
  const dname = document.getElementById('dialog-name');
  if (dname) dname.textContent = t('protagonist');

  // tooltip更新
  const tips = {
    door: 'tipDoor', painting: 'tipPainting', window: 'tipWindow',
    clock: 'tipClock', safe: 'tipSafe',
    'memo-on-floor': 'tipMemo', 'flashlight-on-floor': 'tipFlashlight',
    'dust-on-floor': 'tipDust', 'bento-on-floor': 'tipBento',
  };
  for (const [id, key] of Object.entries(tips)) {
    const el = document.getElementById(id);
    if (el) el.title = t(key);
  }

  // モーダルボタン
  document.getElementById('safe-close-btn').textContent = t('close');
  document.getElementById('memo-close-btn').textContent = t('close');
  document.getElementById('painting-close-btn').textContent = t('close');
  document.getElementById('window-close-btn').textContent = t('close');
  document.getElementById('item-inspect-close-btn').textContent = t('close');
  document.getElementById('safe-smash-btn').textContent = t('safeSmash');
  document.getElementById('safe-modal-title').textContent = t('safeTitle');
  document.getElementById('window-peek-text').textContent = t('windowPeekText');

  // 隠しメッセージ
  const hm = document.querySelector('#hidden-message span');
  if (hm) hm.textContent = t('hiddenWord');

  // 開始セリフを更新
  const dialogTextEl = document.getElementById('dialog-text');
  if (dialogTextEl) {
    dialogTextEl.innerHTML = t('opening');
  }

  // 絵画・メモの英語テキストオーバーレイ
  const paintingEnOverlay = document.getElementById('painting-en-overlay');
  if (paintingEnOverlay) {
    if (lang === 'en') {
      paintingEnOverlay.style.display = 'block';
      paintingEnOverlay.innerHTML = t('paintingRiddle');
    } else {
      paintingEnOverlay.style.display = 'none';
    }
  }

  const memoEnOverlay = document.getElementById('memo-en-overlay');
  if (memoEnOverlay) {
    if (lang === 'en') {
      memoEnOverlay.style.display = 'block';
      memoEnOverlay.innerHTML = t('memoRiddle');
    } else {
      memoEnOverlay.style.display = 'none';
    }
  }

  // 戻るリンク
  const backLink = document.querySelector('.back-to-top-link');
  if (backLink) backLink.textContent = t('backToTop');

  // 言語ボタンのアクティブ状態
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}
