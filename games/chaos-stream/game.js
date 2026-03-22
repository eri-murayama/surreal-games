/* ========================================
   カオス配信シミュレーター - game.js
   ======================================== */

(() => {
  'use strict';

  const sg = SurrealGames.init('chaos-stream');

  // ---------- 状態 ----------
  let chaos = 0;
  let likability = 0;
  let viewers = 12;
  let currentScene = null;
  let chatTimer = null;

  // ---------- DOM ----------
  const $ = id => document.getElementById(id);
  const titleScreen  = $('title-screen');
  const gameScreen   = $('game-screen');
  const resultScreen = $('result-screen');
  const startBtn     = $('start-btn');
  const retryBtn     = $('retry-btn');
  const narrationText    = $('narration-text');
  const characterEmoji   = $('character-emoji');
  const choicesArea      = $('choices-area');
  const chatMessages     = $('chat-messages');
  const chaosBar         = $('chaos-bar');
  const likabilityBar    = $('likability-bar');
  const chaosValue       = $('chaos-value');
  const likabilityValue  = $('likability-value');
  const viewerCountEl    = $('viewer-count');
  const streamContent    = $('stream-content');

  // ---------- チャットシステム ----------
  const chatNames = [
    'たこやき侍', 'ねこまんま', '深夜のポテチ', 'わさび大臣',
    '布団から出たくない', 'お茶漬け仙人', '永遠の5歳児', 'バグった時計',
    '迷子のGPS', '筋肉痛予報士', 'おにぎり探偵', '月曜日の天敵',
    '逆走するカタツムリ', '充電切れの勇者', '味噌汁の妖精', 'Wi-Fi難民',
    '二度寝のプロ', '消しゴム収集家', '鼻毛ソムリエ', '無限ループ太郎'
  ];

  const idleChatPool = [
    '初見です！', 'こんばんは～', 'わくわく', '待ってました！',
    'きたきたきた', '初配信おめ！', '頑張って～', 'ここが伝説の始まりか…',
    '鼻毛見えてますよ', '画質いいね', 'マイク大丈夫？', 'BGM良き'
  ];

  function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function addChat(text, isSpecial) {
    const div = document.createElement('div');
    const colorClass = 'color-' + Math.floor(Math.random() * 6);
    div.className = 'chat-msg ' + colorClass;
    const name = randomFrom(chatNames);
    div.innerHTML = '<span class="chat-name">' + name + '</span>' + text;
    if (isSpecial) div.style.color = '#ffff00';
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    // 古いメッセージ削除
    while (chatMessages.children.length > 60) {
      chatMessages.removeChild(chatMessages.firstChild);
    }
  }

  function startIdleChat() {
    stopIdleChat();
    chatTimer = setInterval(() => {
      if (Math.random() < 0.6) {
        addChat(randomFrom(idleChatPool));
      }
    }, 1800);
  }

  function stopIdleChat() {
    if (chatTimer) { clearInterval(chatTimer); chatTimer = null; }
  }

  function floodChat(messages, delay) {
    delay = delay || 400;
    messages.forEach((msg, i) => {
      setTimeout(() => addChat(msg, i === 0), delay * i);
    });
  }

  // ---------- ステータス ----------
  function updateStats() {
    const c = Math.max(0, Math.min(100, chaos));
    const l = Math.max(0, Math.min(100, likability));
    chaosBar.style.width = c + '%';
    likabilityBar.style.width = l + '%';
    chaosValue.textContent = c;
    likabilityValue.textContent = l;
    viewerCountEl.textContent = '👁 ' + viewers + '人';
  }

  function addChaos(n) { chaos += n; updateStats(); }
  function addLikability(n) { likability += n; updateStats(); }
  function addViewers(n) { viewers = Math.max(0, viewers + n); updateStats(); }

  // ---------- 演出 ----------
  function setEmoji(emoji, animation) {
    characterEmoji.textContent = emoji;
    if (animation) {
      characterEmoji.classList.remove('shake', 'spin');
      void characterEmoji.offsetWidth;
      characterEmoji.classList.add(animation);
    }
  }

  function glitchScreen() {
    streamContent.classList.remove('glitch-effect');
    void streamContent.offsetWidth;
    streamContent.classList.add('glitch-effect');
  }

  // ---------- シーンシステム ----------
  function showScene(sceneId) {
    currentScene = scenes[sceneId];
    if (!currentScene) { showResult(); return; }

    // ナレーション
    narrationText.textContent = '';
    choicesArea.innerHTML = '';

    // エフェクト
    if (currentScene.emoji) setEmoji(currentScene.emoji, currentScene.animation);
    if (currentScene.glitch) glitchScreen();
    if (currentScene.viewerDelta) addViewers(currentScene.viewerDelta);
    if (currentScene.chatFlood) floodChat(currentScene.chatFlood);

    // テキストをタイプライター風に表示
    typeText(currentScene.text, () => {
      // 選択肢表示
      if (currentScene.choices) {
        currentScene.choices.forEach(choice => {
          const btn = document.createElement('button');
          btn.className = 'choice-btn';
          btn.textContent = choice.label;
          btn.addEventListener('click', () => {
            if (choice.chaos)      addChaos(choice.chaos);
            if (choice.likability) addLikability(choice.likability);
            if (choice.viewers)    addViewers(choice.viewers);
            if (choice.chatFlood)  floodChat(choice.chatFlood);
            showScene(choice.next);
          });
          choicesArea.appendChild(btn);
        });
      } else {
        // 自動進行
        setTimeout(() => showScene(currentScene.next), 2000);
      }
    });
  }

  let typeTimer = null;
  function typeText(text, callback) {
    if (typeTimer) clearInterval(typeTimer);
    let i = 0;
    narrationText.textContent = '';
    typeTimer = setInterval(() => {
      if (i < text.length) {
        narrationText.textContent += text[i];
        i++;
      } else {
        clearInterval(typeTimer);
        typeTimer = null;
        if (callback) callback();
      }
    }, 30);
  }

  // ---------- シナリオ定義 ----------
  const scenes = {

    // ---- シーン1: 初配信スタート ----
    intro: {
      text: '配信ソフトの「開始」ボタンを押した。\n画面に映る自分の姿。鼻毛が堂々とはみ出している。\n視聴者がちらほら入ってきた。\n\nさあ、最初の一言は…？',
      emoji: '😊',
      animation: null,
      chatFlood: ['初見です！', 'こんばんはー！', '新人さん？', 'お、始まった', '鼻毛ァ！'],
      choices: [
        {
          label: '「は、はじめまして！緊張してます！」（正統派あいさつ）',
          chaos: 0, likability: 15, viewers: 5,
          chatFlood: ['かわいい', 'がんばれ！', '緊張伝わるw', '初々しい'],
          next: 'scene2_normal'
        },
        {
          label: '「どうも、鼻毛から生まれた鼻毛太郎です」（自虐ネタ）',
          chaos: 15, likability: 10, viewers: 10,
          chatFlood: ['wwwww', '鼻毛太郎w', '草', 'センスあるw', '名前ｗ'],
          next: 'scene2_funny'
        },
        {
          label: '無言で30秒間カメラを見つめる',
          chaos: 25, likability: 5, viewers: 15,
          chatFlood: ['？？？', '…えっ', 'フリーズした？', 'これが芸風か', 'シュールすぎるw'],
          next: 'scene2_silent'
        }
      ]
    },

    // ---- シーン2 分岐A: 正統派ルート ----
    scene2_normal: {
      text: '自己紹介をしていると、突然画面が真っ暗になった。\n\n…と思ったら、猫がPCの電源ケーブルを引っこ抜いていた。\n配信は途切れていないが、猫の顔だけがカメラに映っている。\nしかもその猫にも鼻毛が生えている。\n\nチャットが騒がしくなってきた。',
      emoji: '🐱',
      animation: 'shake',
      glitch: true,
      viewerDelta: 20,
      chatFlood: ['猫！！！', 'ぬこおおお', '猫にも鼻毛www', '神猫', 'かわいい', '配信乗っ取られてて草'],
      choices: [
        {
          label: '猫を抱き上げて「うちの猫です、すみません」と謝る',
          chaos: 5, likability: 20, viewers: 10,
          chatFlood: ['かわいい', '猫もっと映して', '癒し配信', '許した'],
          next: 'scene3_cat'
        },
        {
          label: '猫と本気でにらめっこを始める',
          chaos: 20, likability: 15, viewers: 25,
          chatFlood: ['え？ｗ', 'にらめっこwww', '猫が勝ちそう', '何が始まった'],
          next: 'scene3_staredown'
        }
      ]
    },

    // ---- シーン2 分岐B: 自虐ルート ----
    scene2_funny: {
      text: 'チャットが盛り上がっている。調子に乗って鼻毛の話を続けていたら、\nうっかり配信ソフトの設定画面を開いてしまった。\n\n視聴者全員に本名がバレた。\n\n…本名が「鼻毛田 鼻毛太郎」だった。',
      emoji: '😱',
      animation: 'shake',
      glitch: true,
      viewerDelta: 30,
      chatFlood: ['本名ｗｗｗ', '鼻毛田wwwww', '運命じゃん', 'ガチの鼻毛太郎で草', '嘘だろ…', '伝説始まった'],
      choices: [
        {
          label: '「こ、これはフェイクです！設定です！」と慌てて否定する',
          chaos: 10, likability: 10, viewers: 5,
          chatFlood: ['無理あるw', '動揺してるw', '嘘つくなw', 'バレバレ'],
          next: 'scene3_panic'
        },
        {
          label: '「はい、ガチです。よろしくお願いします、鼻毛田家の長男です」と堂々と認める',
          chaos: 20, likability: 25, viewers: 40,
          chatFlood: ['覚悟決まってるw', '漢だ…', '鼻毛田家の長男w', '好きになった', 'つよい'],
          next: 'scene3_proud'
        }
      ]
    },

    // ---- シーン2 分岐C: 無言ルート ----
    scene2_silent: {
      text: '30秒の沈黙。視聴者は困惑している。\n\nしかしあなたは気づいた。\nマイクがミュートだった。\n実は30秒間ずっとめちゃくちゃ喋っていた。\n自己紹介も特技披露も全部ミュートの向こう側で行われていた。\n\n鼻毛だけが風に揺れている。',
      emoji: '🔇',
      animation: 'spin',
      glitch: true,
      viewerDelta: 15,
      chatFlood: ['ミュートですよ！', 'マイクマイク！', '聞こえないw', '口パクで草', '鼻毛は見えてる'],
      choices: [
        {
          label: 'ミュート解除して「全部聞こえてなかったんかい！」とツッコむ',
          chaos: 10, likability: 20, viewers: 10,
          chatFlood: ['やっと聞こえたw', 'ツッコミ上手い', '声いいね', 'もう好き'],
          next: 'scene3_unmute'
        },
        {
          label: 'ミュートのまま身振り手振りだけで配信を続ける',
          chaos: 30, likability: 10, viewers: 30,
          chatFlood: ['wwwww', '無声映画かよ', 'ジェスチャーゲームw', 'シュールすぎ', '逆に面白い'],
          next: 'scene3_mime'
        }
      ]
    },

    // ---- シーン3 各種 ----
    scene3_cat: {
      text: '猫を膝に乗せて配信を再開した。\nしかし猫がキーボードの上を歩き、勝手にブラウザが開いた。\n\n表示されたのは「鼻毛 伸びすぎ 対処法」の検索履歴。\n\nしかもそれは猫の検索履歴だった。\n猫のブラウザアカウントだった。',
      emoji: '🐱',
      animation: 'shake',
      glitch: true,
      viewerDelta: 50,
      chatFlood: ['猫も鼻毛に悩んでるw', '検索履歴www', '猫のアカウント？？', 'この配信面白すぎる'],
      choices: [
        {
          label: '猫の鼻毛ケアについて真剣に語り始める',
          chaos: 25, likability: 15, viewers: 30,
          chatFlood: ['専門家かよw', 'ためになる', '猫の鼻毛講座', 'ニッチすぎるw'],
          next: 'scene4_lecture'
        },
        {
          label: '猫と一緒に鼻毛を比べ合う',
          chaos: 30, likability: 20, viewers: 45,
          chatFlood: ['比較wwww', 'どっちが長いw', '神コンテンツ', 'なにを見せられてるんだ'],
          next: 'scene4_compare'
        }
      ]
    },

    scene3_staredown: {
      text: 'にらめっこ3分経過。猫が先に目をそらした。\n\nあなたの勝利だ。\n\nしかし猫が負けた腹いせにキーボードを蹴り、\nあなたのPCがブルースクリーンになった。\n画面に映る鼻毛のASCIIアートだけが残された。',
      emoji: '💀',
      animation: 'spin',
      glitch: true,
      viewerDelta: 60,
      chatFlood: ['ブルスクwww', '猫の逆襲', '鼻毛AAｗ', 'パソコンが…', 'これはレジェンド'],
      next: 'scene4_bluescreen'
    },

    scene3_panic: {
      text: '慌てて設定画面を閉じようとしたが、\n間違えてエフェクト設定を全部ONにしてしまった。\n\n顔に犬の耳が付き、背景が宇宙になり、\n声がヘリウムボイスになり、\n画面に大量の鼻毛エフェクトが降り注いでいる。\n\nもう何もかもがカオスだ。',
      emoji: '🐶',
      animation: 'spin',
      glitch: true,
      viewerDelta: 40,
      chatFlood: ['何が起きてるw', 'エフェクト祭り', '鼻毛エフェクトあるのかよ', 'カオスすぎて草'],
      choices: [
        {
          label: 'このまま「これが僕の本来の姿です」と開き直る',
          chaos: 20, likability: 20, viewers: 30,
          chatFlood: ['つよいw', '適応力高すぎ', '鼻毛の化身', '好き'],
          next: 'scene4_embrace'
        },
        {
          label: 'PCを再起動する（配信が5分間途切れる）',
          chaos: 5, likability: -5, viewers: -20,
          chatFlood: ['あ、落ちた', '再起動か', '戻ってこーい', '待機'],
          next: 'scene4_reboot'
        }
      ]
    },

    scene3_proud: {
      text: '堂々と鼻毛田を名乗ったあなたに、\nチャットは大盛り上がり。\n\nすると突然、スーパーチャットが飛んできた。\n\n「鼻毛田家の次男です。兄さん、配信してたんですか？」\n\n…え？',
      emoji: '😲',
      animation: 'shake',
      viewerDelta: 80,
      chatFlood: ['次男！？', 'ファミリーw', '鼻毛田家の闇', 'まさかの身バレ', 'ドラマが始まった'],
      choices: [
        {
          label: '「次男…？お前、生きてたのか…！」と即興で兄弟ドラマを始める',
          chaos: 25, likability: 25, viewers: 50,
          chatFlood: ['演技うまいw', '即興ドラマ', '泣ける（嘘）', '鼻毛田家サーガ'],
          next: 'scene4_drama'
        },
        {
          label: '「すみません、鼻毛田家は一人っ子です。偽物です」と冷静に否定する',
          chaos: 15, likability: 15, viewers: 20,
          chatFlood: ['冷たいw', '次男否定された', 'バッサリ', '一人っ子設定ｗ'],
          next: 'scene4_deny'
        }
      ]
    },

    scene3_unmute: {
      text: 'ミュート解除した瞬間、視聴者が急増し始めた。\nどうやらSNSで「ミュート配信者」としてバズっていたらしい。\n\n「#鼻毛ミュート」がトレンド入り。\n\nあなたの鼻毛は今やインターネットの公共物である。',
      emoji: '📈',
      animation: 'spin',
      viewerDelta: 100,
      chatFlood: ['トレンド入りｗ', 'Twitterから来ました', 'バズってますよw', '鼻毛ミュートwww', '歴史的瞬間'],
      choices: [
        {
          label: 'せっかくなので鼻毛をアップで映す',
          chaos: 30, likability: 15, viewers: 60,
          chatFlood: ['アップやめてw', '鼻毛HD', '画質良すぎて草', '見たくなかった'],
          next: 'scene4_closeup'
        },
        {
          label: '記念に歌を歌い始める（音痴）',
          chaos: 20, likability: 20, viewers: 40,
          chatFlood: ['歌うなw', '音程ｗｗ', '耳が…', 'なぜか感動する', '鼻毛が揺れてる'],
          next: 'scene4_sing'
        }
      ]
    },

    scene3_mime: {
      text: 'ジェスチャーだけの配信が予想外にウケている。\n\n視聴者が「次は〇〇やって！」とリクエストを出し始めた。\nリクエスト：「鼻毛が伸びる様子を体で表現して」\n\nあなたは全身を使って鼻毛の成長を表現し始めた。\n体をくねらせ、天に向かって手を伸ばす。\n美しい。これはもはやアートだ。',
      emoji: '🎭',
      animation: 'spin',
      viewerDelta: 70,
      chatFlood: ['アートだ…', '前衛的すぎるw', '現代アート', '才能の無駄遣い', '鼻毛ダンスw'],
      choices: [
        {
          label: 'さらに「鼻毛抜きの痛み」も体で表現する',
          chaos: 30, likability: 20, viewers: 50,
          chatFlood: ['痛そうwww', '表現力の鬼', '演技派', '笑いが止まらない'],
          next: 'scene4_art'
        },
        {
          label: 'ここでおもむろにミュートを解除し「ちゃんと聞こえてましたよ」と言う',
          chaos: 25, likability: 25, viewers: 40,
          chatFlood: ['聞こえてたの！？', 'やられたw', 'どんでん返しw', '策士すぎる'],
          next: 'scene4_reveal'
        }
      ]
    },

    // ---- シーン4 各種（クライマックスへの橋渡し） ----
    scene4_lecture: {
      text: '猫の鼻毛ケア講座が思いのほか盛り上がり、\n視聴者から「ためになる」「もっと教えて」の声が。\n\nあなたは気づいた。\nこれがあなたの天職かもしれない。\n鼻毛系Vtuberという未開拓のジャンルを…\n\nその時、突然画面にノイズが走った。',
      emoji: '📚',
      viewerDelta: 20,
      chatFlood: ['鼻毛系Vtuberw', 'ジャンル開拓者', '天職w'],
      next: 'scene5_climax'
    },

    scene4_compare: {
      text: '猫と鼻毛を比べた結果、猫の方が長かった。\n\n負けた悔しさで涙を流すあなた。\nしかしその涙が鼻毛に伝い、\n鼻毛が涙でキラキラ光っている。\n\n「美しい…」とチャットが静まり返った。\n\nその時、突然画面にノイズが走った。',
      emoji: '✨',
      animation: 'spin',
      viewerDelta: 30,
      chatFlood: ['鼻毛が光ってる…', '神秘的', '泣くなw', '美しい（困惑）'],
      next: 'scene5_climax'
    },

    scene4_bluescreen: {
      text: 'ブルースクリーンから奇跡の復帰。\nしかしPCが何かに目覚めたのか、\n配信ソフトが勝手に鼻毛の3Dモデルを生成し始めた。\n\n画面いっぱいに回転する巨大な鼻毛。\nこれはもはや配信ではない。鼻毛のプロモーションビデオだ。\n\nその時、さらに異変が起きた。',
      emoji: '🌀',
      animation: 'spin',
      glitch: true,
      viewerDelta: 40,
      chatFlood: ['3D鼻毛www', 'テクノロジーの敗北', 'PVかよ', 'AIが暴走してる'],
      next: 'scene5_climax'
    },

    scene4_embrace: {
      text: '犬耳・宇宙背景・ヘリウムボイス・鼻毛エフェクトの\nフル装備で配信を続行。\n\n「これが僕の本当の姿です」と宣言したところ、\nなぜかチャットが感動し始めた。\n\n「ありのままの鼻毛を受け入れる姿勢に涙が出た」\n\nその時、さらなる異変が…',
      emoji: '🐶',
      viewerDelta: 30,
      chatFlood: ['感動した', 'ありのままの鼻毛', '泣いた（嘘）', '深い…'],
      next: 'scene5_climax'
    },

    scene4_reboot: {
      text: '5分後、配信に戻ってきた。\n視聴者は半分に減っていた。\n\nしかし残っていた視聴者たちは本物のファンだ。\n「おかえり」「待ってたよ」というコメントが温かい。\n\n再スタートしようとしたその時、\n画面にノイズが走り始めた…',
      emoji: '🔄',
      viewerDelta: -30,
      chatFlood: ['おかえり！', '待ってたよ', '減ったけどコアファンが残った', '再出発だ'],
      next: 'scene5_climax'
    },

    scene4_drama: {
      text: '「次男」との即興兄弟ドラマが白熱。\n\n「兄さん…鼻毛田家の家訓を忘れたんですか？」\n「家訓…『鼻毛を制する者、世界を制す』…！」\n\n完全にアドリブなのにチャットは号泣（笑い泣き）。\nスーパーチャットが止まらない。\n\nしかしドラマのクライマックスで、画面が乱れ始めた…',
      emoji: '🎭',
      animation: 'shake',
      viewerDelta: 60,
      chatFlood: ['家訓wwww', '名言出たw', '泣いてるwww', '鼻毛田家の家訓w', 'スパチャ！'],
      next: 'scene5_climax'
    },

    scene4_deny: {
      text: '次男を否定したが、今度は「三男です」「母です」「飼い犬です」と\n鼻毛田家を名乗るコメントが殺到。\n\nあなたの配信は「鼻毛田家 家族会議」と化した。\n鼻毛田飼い犬が「ワンワン（鼻毛）」と投稿している。\n犬語の鼻毛。哲学的だ。\n\nその時、画面に異変が…',
      emoji: '👨‍👩‍👧‍👦',
      viewerDelta: 40,
      chatFlood: ['家族増殖w', '飼い犬までw', '家族会議', '鼻毛田家デカすぎ'],
      next: 'scene5_climax'
    },

    scene4_closeup: {
      text: '鼻毛のアップ映像が配信に映し出された。\n視聴者は阿鼻叫喚。\n\nしかし一人の視聴者が叫んだ。\n「待って…鼻毛の先端に小さな顔が見える…」\n\nよく見ると、鼻毛の先端に微小な鼻毛の妖精がいた。\n妖精にも鼻毛が生えている。フラクタル鼻毛だ。\n\nその時、画面が大きく乱れた…',
      emoji: '🧚',
      animation: 'spin',
      glitch: true,
      viewerDelta: 50,
      chatFlood: ['妖精！？', 'フラクタル鼻毛www', '鼻毛の中の鼻毛', 'SFじゃん', '宇宙を感じる'],
      next: 'scene5_climax'
    },

    scene4_sing: {
      text: '歌い始めたが、音程がことごとく外れている。\nしかも選曲が「鼻毛抜きのうた」（自作）。\n\n♪ ぬ〜けば痛い〜 残せば長い〜\n♪ 鼻毛は〜 人生〜そのもの〜\n\nなぜか泣いている視聴者が多数。\n感動なのか爆笑なのかは不明。\n\nその時、ノイズが走った…',
      emoji: '🎤',
      animation: 'shake',
      viewerDelta: 45,
      chatFlood: ['名曲wwww', '泣いた', '音痴なのに泣けるw', '鼻毛ソング', '紅白出ろ'],
      next: 'scene5_climax'
    },

    scene4_art: {
      text: '「鼻毛抜きの痛み」の身体表現が完成した。\n\n体を大きくのけぞらせ、無声の絶叫。\nそしてゆっくりと崩れ落ちる。\n\n視聴者「これはもはやコンテンポラリーダンスだ」\n\nあなたは鼻毛界のピナ・バウシュとなった。\n\nその時、画面が歪み始めた…',
      emoji: '💃',
      animation: 'spin',
      viewerDelta: 55,
      chatFlood: ['芸術だ…', 'ピナ・バウシュw', '鼻毛ダンス完成', '前衛的すぎて理解が追いつかない'],
      next: 'scene5_climax'
    },

    scene4_reveal: {
      text: 'ミュートを解除した瞬間、\n「全部聞こえてました。皆さんのリクエスト、\n　鼻毛の成長を体で表現して…最高でしたよ」\n\nチャットは「やられた！」の嵐。\n計画通りだったのだ（嘘。本当に聞こえてなかった）。\n\nしかしその直後、画面にノイズが…',
      emoji: '😏',
      viewerDelta: 45,
      chatFlood: ['策士ｗ', '全部計算ずくか！？', '天才かよ', '嘘だけど上手い'],
      next: 'scene5_climax'
    },

    // ---- シーン5: クライマックス ----
    scene5_climax: {
      text: '突然、配信画面が激しくグリッチし始めた。\n\n画面の中から巨大な鼻毛が生えてきている。\n比喩ではない。本当に画面から鼻毛が突き出している。\n\nどうやら配信ソフトが感情を持ち、\n「鼻毛」という概念に目覚めたらしい。\n\n配信ソフト「我は…鼻毛…すべての鼻毛の始祖…」\n\nどうする！？',
      emoji: '👾',
      animation: 'spin',
      glitch: true,
      viewerDelta: 100,
      chatFlood: ['！？！？', 'なにが起きてるw', '鼻毛の始祖wwww', 'ホラーかよ', '配信ソフトが意思を持ったw', '伝説の配信', '腹痛いwww'],
      choices: [
        {
          label: '「鼻毛の始祖よ、私はあなたの器です！力を！」と叫ぶ',
          chaos: 30, likability: 20, viewers: 80,
          chatFlood: ['中二病wwww', '鼻毛に選ばれし者', '器ｗ', '神回確定', 'やばすぎるw'],
          next: 'scene6_embrace_chaos'
        },
        {
          label: '冷静にタスクマネージャーを開いて配信ソフトを強制終了する',
          chaos: -10, likability: 10, viewers: -30,
          chatFlood: ['現実的w', 'タスマネ最強', 'ロマンがないw', '正しい判断だけどw'],
          next: 'scene6_rational'
        },
        {
          label: '自分の鼻毛を一本抜いて画面に捧げる',
          chaos: 25, likability: 25, viewers: 60,
          chatFlood: ['捧げたwww', '供物かよ', '痛そう', '神聖な儀式', '鼻毛の儀'],
          next: 'scene6_offering'
        }
      ]
    },

    // ---- シーン6: 収束 ----
    scene6_embrace_chaos: {
      text: '「力を！」と叫んだ瞬間、画面が真っ白に輝いた。\n\nあなたの鼻毛が光り始め、部屋全体が鼻毛色（？）に包まれる。\n\n配信ソフトの鼻毛の始祖「お前こそ…真の鼻毛の継承者…」\n\nあなたは鼻毛の力を継承した。\n何の力かは不明だが、とにかく継承した。\n\nチャットは歴史的瞬間を目撃していた。',
      emoji: '⚡',
      animation: 'spin',
      glitch: true,
      viewerDelta: 120,
      chatFlood: ['伝説すぎるwwww', '鼻毛の継承者', '何を見せられてるんだ', '今日ここにいられてよかった', '歴史の証人'],
      next: 'scene7_ending'
    },

    scene6_rational: {
      text: 'タスクマネージャーでサクッと強制終了。\n\n配信ソフト「ま、待ってくれ…我はまだ鼻毛の話を…」\n\nプロセス終了。鼻毛の始祖は消え去った。\n\n配信を再起動すると、全て元通り。\n…あまりにも現実的な対応に、チャットは少し寂しそうだ。\n\n「もうちょっと付き合ってあげてもよかったのでは」',
      emoji: '🖥️',
      viewerDelta: -20,
      chatFlood: ['ロマンがないw', 'IT担当かよ', '鼻毛の始祖かわいそうw', '効率的ではある'],
      next: 'scene7_ending'
    },

    scene6_offering: {
      text: '鼻毛を一本抜き、画面に捧げた。\n\n「痛ッ…！」\n\nその瞬間、配信ソフトの鼻毛の始祖が涙を流した。\n\n始祖「人間が…鼻毛を自ら捧げてくれるとは…\n　　　数千年ぶりだ…美しい…」\n\n始祖は感動のあまり画面の中に帰っていった。\n平和が戻った。鼻毛一本で世界は救われた。',
      emoji: '🙏',
      animation: 'shake',
      viewerDelta: 80,
      chatFlood: ['鼻毛一本で世界救ったw', '感動のシーンなはずなのにw', '数千年ぶりw', '平和になった', '鼻毛の力'],
      next: 'scene7_ending'
    },

    // ---- シーン7: エンディング ----
    scene7_ending: {
      text: '嵐のような初配信が終わろうとしている。\n\nチャット欄はまだ興奮冷めやらぬ様子。\n「#鼻毛配信」がトレンド1位になっている。\n\nさあ、最後の挨拶だ。\nこの配信をどう締めくくる？',
      emoji: '😊',
      viewerDelta: 20,
      chatFlood: ['最高だったw', 'またやって！', '伝説の配信だった', 'トレンド1位wwww', '次回も見る！'],
      choices: [
        {
          label: '「皆さん、今日は本当にありがとう。鼻毛に愛を込めて…おやすみ！」',
          chaos: 0, likability: 15, viewers: 10,
          chatFlood: ['おつかれ！', '最高だった！', '鼻毛に愛をw', 'おやすみー！', '次回楽しみ'],
          next: 'end'
        },
        {
          label: '「では最後に、全員で鼻毛を抜きましょう。せーの…」',
          chaos: 20, likability: 10, viewers: 30,
          chatFlood: ['やらんわw', 'せーの！（抜かない）', '痛いw', '狂気のエンディング', '最後まで鼻毛w'],
          next: 'end'
        },
        {
          label: '何も言わずに鼻毛だけをアップで映してフェードアウト',
          chaos: 15, likability: 15, viewers: 20,
          chatFlood: ['芸術的エンド', 'ラストカットが鼻毛w', '映画みたい', 'エンドロール流れそう', '完'],
          next: 'end'
        }
      ]
    }
  };

  // ---------- リザルト ----------
  function showResult() {
    stopIdleChat();
    switchScreen(resultScreen);

    const c = Math.max(0, Math.min(100, chaos));
    const l = Math.max(0, Math.min(100, likability));

    $('final-chaos').textContent = c;
    $('final-likability').textContent = l;
    $('final-viewers').textContent = viewers + '人';

    let rank, emoji, desc;
    const highChaos = c >= 50;
    const highLike  = l >= 50;

    if (highChaos && highLike) {
      rank  = '伝説の神配信者';
      emoji = '👑';
      desc  = 'カオスと愛嬌を兼ね備えた伝説の配信者が誕生した。\n鼻毛界のスーパースターとして歴史に名を刻んだ。\nファンネーム：鼻毛民';
    } else if (highChaos && !highLike) {
      rank  = '炎上系配信者';
      emoji = '🔥';
      desc  = 'カオスは最高潮だが、好感度がいまいち。\n「あの鼻毛の人」として語り継がれるが、\nファンというより野次馬が多い。';
    } else if (!highChaos && highLike) {
      rank  = '優等生配信者';
      emoji = '🌸';
      desc  = '好感度は高いが、もう少しカオスが欲しかった。\n安定感はあるが、伝説にはなれなかった。\n鼻毛のポテンシャルを活かしきれていない。';
    } else {
      rank  = '空気配信者';
      emoji = '💨';
      desc  = 'カオスも好感度も低め。\n配信は静かに終わり、誰の記憶にも残らなかった。\n鼻毛だけが虚しく揺れている。';
    }

    const totalScore = c + l;
    const { isNewHigh } = sg.onGameEnd(totalScore, { chaos: c, likability: l, viewers });

    $('result-emoji').textContent = emoji;
    $('result-rank').textContent = rank;
    $('result-rank').style.color =
      highChaos && highLike ? '#ffdd00' :
      highChaos ? '#ff4444' :
      highLike  ? '#44ff88' : '#888888';
    $('result-description').textContent = desc;

    // NEW RECORDバッジ
    const oldRecord = document.querySelector('.sg-new-record');
    if (oldRecord) oldRecord.remove();
    if (isNewHigh) {
      const newRecordEl = document.createElement('div');
      newRecordEl.className = 'sg-new-record';
      newRecordEl.textContent = '\uD83C\uDF89 NEW RECORD!';
      const resultCard = $('result-card');
      resultCard.parentNode.insertBefore(newRecordEl, resultCard);
    }

    // シェアボタン（X/Twitter）
    const existingShareBtn = document.getElementById('share-btn');
    if (existingShareBtn) existingShareBtn.remove();

    const shareBtn = document.createElement('button');
    shareBtn.id = 'share-btn';
    shareBtn.className = 'cyber-btn';
    shareBtn.textContent = '𝕏 結果をシェア';
    shareBtn.style.cssText = 'margin-top:12px;display:block;margin-left:auto;margin-right:auto;background:rgba(29,161,242,0.1);border-color:#1da1f2;color:#1da1f2;';
    shareBtn.addEventListener('mouseenter', function() {
      shareBtn.style.background = '#1da1f2';
      shareBtn.style.color = '#0a0a12';
    });
    shareBtn.addEventListener('mouseleave', function() {
      shareBtn.style.background = 'rgba(29,161,242,0.1)';
      shareBtn.style.color = '#1da1f2';
    });
    shareBtn.addEventListener('click', function() {
      const gameURL = window.location.href;
      const text = '\u{1F4E1} カオス配信シミュレーター\n結果: ' + emoji + ' ' + rank + '\n\n#シュールゲームス\n' + gameURL;
      const tweetURL = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text);
      window.open(tweetURL, '_blank');
    });

    const retryBtnEl = $('retry-btn');
    retryBtnEl.parentNode.insertBefore(shareBtn, retryBtnEl);
  }

  // ---------- 画面遷移 ----------
  function switchScreen(target) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    target.classList.add('active');
  }

  function startGame() {
    chaos = 0;
    likability = 0;
    viewers = 12;
    updateStats();
    chatMessages.innerHTML = '';
    sg.onGameStart();
    switchScreen(gameScreen);
    startIdleChat();
    showScene('intro');
  }

  // ---------- ハイスコア表示 ----------
  (function updateHighScoreDisplay() {
    const highScore = sg.getHighScore();
    const el = document.getElementById('sg-high-score-display');
    if (highScore && el) {
      el.textContent = '\uD83C\uDFC6 HIGH SCORE: ' + highScore;
      el.style.display = 'block';
    }
  })();

  // ---------- イベント ----------
  startBtn.addEventListener('click', startGame);
  retryBtn.addEventListener('click', startGame);
})();
