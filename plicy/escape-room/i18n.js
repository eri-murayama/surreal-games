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
    clearPlayAgain: 'もう一度プレイ',
    ranks: [
      { max: 60,  icon: '👑', name: '変態プロフェッショナル', comment: '手慣れすぎている。常習犯の疑いあり。' },
      { max: 120, icon: '🦹', name: '侵入のエキスパート', comment: 'この速さ……プロの犯行だ。' },
      { max: 180, icon: '🔍', name: '物色マニア', comment: 'まあまあの手際。次はもっと早くできるはず。' },
      { max: 300, icon: '🐌', name: 'のんびり不法侵入', comment: 'ゆっくり堪能しすぎ。通報されるよ。' },
      { max: Infinity, icon: '😴', name: '居座り犯', comment: 'もはや住んでる。' },
    ],
  },

};

// 常に日本語
let currentLang = 'ja';

function t(key, ...args) {
  const val = LANG.ja[key];
  if (typeof val === 'function') return val(...args);
  return val;
}

function setLang() {
  // plicy版は日本語固定のため何もしない
}
