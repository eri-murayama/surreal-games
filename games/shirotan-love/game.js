(function () {
  'use strict';

  var LANG = localStorage.getItem('sg-lang') || 'ja';
  var I18N = {
    ja: {
      title: 'しろたんと恋のかけら', subtitle: '～きみと、ほのぼの～',
      startBtn: 'はじめる', shareBtn: '𝕏でシェア', replayBtn: 'もういちど',
      moreGames: '他のゲームも遊ぶ →', backToTop: '← トップに戻る',
      backToStories: '← ストーリー選択へ',
      backToTitle: '← もどる',
      selectStory: 'おはなしを えらんでね',
      disclaimer: '※「しろたん」は株式会社クリエイティブヨーコのキャラクターです。本作は非公式のファン作品（非営利）です。',
      speakerYou: 'わたし', speakerShirotan: 'しろたん', speakerNarrator: '',
      endLove: '💗 ラブエンド', endFriend: '🌸 なかよしエンド', endLonely: '🌙 きみは遠いエンド',
      shareText: 'しろたんとの物語、完結したよ！'
    },
    en: {
      title: 'Shirotan & Hearts', subtitle: '~With you, gently~',
      startBtn: 'Start', shareBtn: 'Share on 𝕏', replayBtn: 'Play again',
      moreGames: 'More games →', backToTop: '← Home',
      backToStories: '← Story select',
      backToTitle: '← Back',
      selectStory: 'Choose a story',
      disclaimer: '※ "Shirotan" is a character of Creative Yoko Co., Ltd. Unofficial fan work.',
      speakerYou: 'You', speakerShirotan: 'Shirotan', speakerNarrator: '',
      endLove: '💗 Love End', endFriend: '🌸 Friends End', endLonely: '🌙 Distant End',
      shareText: 'I finished Shirotan\'s story!'
    }
  };
  function t(k) { return (I18N[LANG] && I18N[LANG][k]) || k; }
  function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (I18N[LANG][k] !== undefined) el.textContent = I18N[LANG][k];
    });
    document.title = t('title') + ' - シュールゲームス';
  }

  // ============ シナリオ ============
  // story: { id, title, desc, icon, scenes: [...], endings: { love, friend, lonely } }
  // scene: { bg, char, lines: [{ who, text, emo, face }], choices: [{ text, love, next }] }
  // face: 行ごとに表情を上書き（未指定はsceneのcharを使う）
  var FACE = {
    arrival: 'assets/shirotan-arrival.png', // 登場・遠目シルエット
    main:    'assets/shirotan-main.png',    // メイン
    smile:   'assets/shirotan-smile.png',   // 嬉しい
    blush:   'assets/shirotan-blush.png',   // 照れ
    calm:    'assets/shirotan-calm.png',    // 和み
    brave:   'assets/shirotan-brave.png',   // 男気
    omurice: 'assets/shirotan-omurice.png', // オムライスを食べてる
    beachy:  'assets/shirotan-beach.png'    // 海で遊ぶ
  };

  // ============ ストーリー一覧 ============
  // 5本のストーリー：出会い編 / おでかけ編 / ごはん編 / おやすみ編 / おうち編
  var STORIES = {
    ja: [
      // ---------- ① 海辺の出会い編 ----------
      {
        id: 'meet',
        title: '海辺の出会い編',
        desc: '夏のおわり、波打ちぎわでしろたんと…。',
        icon: '🌊',
        scenes: [
          {
            bg: 'scene-beach', char: FACE.main,
            lines: [
              { who: 'narrator', text: '夏のおわりかけ、わたしはひとりで海辺を歩いていた。', face: FACE.arrival },
              { who: 'narrator', text: '足元にまるい、しろいものが…。', face: FACE.arrival },
              { who: 'shirotan', text: 'ぷくぅ…。', emo: '❓', face: FACE.main },
              { who: 'you', text: 'えっ、あざらしの赤ちゃん？こんなところに…？', face: FACE.main }
            ],
            choices: [
              { text: '「どうしたの？迷子？」やさしく話しかける', love: 4, next: 1 },
              { text: '…そっとしておこう。遠くから見守る', love: 1, next: 1 },
              { text: '「かわいい〜！！」思わず抱きしめる', love: -1, next: 1 }
            ]
          },
          {
            bg: 'scene-beach', char: FACE.smile,
            lines: [
              { who: 'shirotan', text: 'ぷくっ…ぼく、まいごじゃないよ。きみをまってたんだ。', emo: '💫', face: FACE.smile },
              { who: 'you', text: 'えっ、わたしを…？', face: FACE.main },
              { who: 'shirotan', text: 'うん。きみ、きょう、なんだかしょんぼりしてるでしょ？', emo: '🍀', face: FACE.calm }
            ],
            choices: [
              { text: '「うん、ちょっと疲れちゃって…」素直に話す', love: 5, next: 2 },
              { text: '「どうしてわかるの？」驚いて聞き返す', love: 3, next: 2 },
              { text: '「だいじょうぶだよ」強がる', love: 0, next: 2 }
            ]
          },
          {
            bg: 'scene-sunset', char: FACE.blush,
            lines: [
              { who: 'narrator', text: '気がつくと、空はやさしい夕焼け色になっていた。', face: FACE.calm },
              { who: 'shirotan', text: 'ねえ、いっしょに ゆうやけ、みようよ。', emo: '💗', face: FACE.blush },
              { who: 'shirotan', text: 'まいにちがんばってるきみに、ごほうびの じかん。', emo: '', face: FACE.smile }
            ],
            choices: [
              { text: 'そっと隣にすわって、肩を寄せる', love: 6, next: 3 },
              { text: '「きれいだね」とぽつり', love: 4, next: 3 },
              { text: '写真を撮る', love: 1, next: 3 }
            ]
          },
          {
            bg: 'scene-night', char: FACE.main,
            lines: [
              { who: 'narrator', text: '夜、星が降るような浜辺で、しろたんはぽつりと言った。', face: FACE.calm },
              { who: 'shirotan', text: 'ぼくね、ほんとうはうみのむこうからきたんだ。', emo: '✨', face: FACE.calm },
              { who: 'shirotan', text: 'ねえ、さいごに。きみのきもちを、きかせて。', emo: '💗', face: FACE.blush }
            ],
            choices: [
              { text: '「ずっといっしょにいたい」', love: 10, next: -1 },
              { text: '「また会おうね、きっと」', love: 4, next: -1 },
              { text: '「忘れないで、いてくれるかな」', love: 1, next: -1 }
            ]
          }
        ],
        endings: {
          love: { img: FACE.blush, text: 'しろたんは海のむこうへ帰った。でも毎年、夏のおわりに、きみに会いに戻ってくる。星がふる浜辺で、しろたんはきみの手をじっと見つめて、ぷくっと笑った。' },
          friend: { img: FACE.smile, text: 'しろたんはさよならを告げて旅立った。きみのポケットには、きらきらひかる小さな貝がらがひとつ。「またね」の約束だけが、ずっと胸に残った。' },
          lonely: { img: FACE.arrival, text: 'しろたんは静かに消えていった。夕焼けのにおい、雨の音、あの会話。ぜんぶ、夢だったのかもしれない…でも、なぜかきみは、少しだけ優しくなれた気がした。' }
        }
      },

      // ---------- ② おでかけ編 ----------
      {
        id: 'date',
        title: 'おでかけ編',
        desc: '水族館デート、青い水のなかで…。',
        icon: '🐚',
        scenes: [
          {
            bg: 'scene-station', char: FACE.smile,
            lines: [
              { who: 'narrator', text: '休日の朝。駅の改札前で、しろたんは小さなリュックを背負って待っていた。', face: FACE.arrival },
              { who: 'shirotan', text: 'おそいよ〜。ぼく、もう５ふんもまったよ〜。', emo: '⏰', face: FACE.calm },
              { who: 'you', text: 'ごめんごめん、お弁当つくってたの。', face: FACE.smile },
              { who: 'shirotan', text: 'えっ。ぷくっ。それは…ゆるす。', emo: '💗', face: FACE.smile }
            ],
            choices: [
              { text: '「今日は水族館、楽しみだね」と手をつなぐ', love: 6, next: 1 },
              { text: 'リュックを覗いて「何入ってるの？」', love: 3, next: 1 },
              { text: '「遅れてごめん」もう一回あやまる', love: 2, next: 1 }
            ]
          },
          {
            bg: 'scene-aquarium', char: FACE.main,
            lines: [
              { who: 'narrator', text: '水族館のアザラシコーナー。ガラスのむこうで、白いアザラシたちがすいすい泳いでいる。', face: FACE.calm },
              { who: 'shirotan', text: 'うわぁ…。あれ、ぼくの しんせきかも。', emo: '✨', face: FACE.main },
              { who: 'you', text: '挨拶してきたら？', face: FACE.smile },
              { who: 'shirotan', text: 'えっ、はずかしいよ〜。きみ、いっしょにきて？', emo: '😳', face: FACE.blush }
            ],
            choices: [
              { text: '「もちろん、いっしょに行こう」', love: 6, next: 2 },
              { text: '「がんばれ〜」と背中を押す', love: 3, next: 2 },
              { text: '「ふふ、ひとりで行ってきな」笑う', love: 0, next: 2 }
            ]
          },
          {
            bg: 'scene-aquarium', char: FACE.blush,
            lines: [
              { who: 'narrator', text: '大水槽の前。ぐるぐると魚の群れが、青い光のなかを舞っている。', face: FACE.calm },
              { who: 'shirotan', text: 'きれい…。なんか、ぼくたちもうみのなかにいるみたい。', emo: '🐟', face: FACE.blush },
              { who: 'shirotan', text: 'ねえ、きみと いるじかんって、ずっとつづけばいいのに。', emo: '💗', face: FACE.blush }
            ],
            choices: [
              { text: '「わたしも、そう思ってる」', love: 7, next: 3 },
              { text: '「ふふ、ありがとう」', love: 4, next: 3 },
              { text: '魚を見ながら「いっぱいいるね」', love: 1, next: 3 }
            ]
          },
          {
            bg: 'scene-ferris', char: FACE.smile,
            lines: [
              { who: 'narrator', text: '帰り道、観覧車に乗った。空は夕焼け。しろたんはちょこんと向かいに座っている。', face: FACE.calm },
              { who: 'shirotan', text: 'たかいねぇ〜。ぼく、たかいところはじめて。', emo: '🎡', face: FACE.smile },
              { who: 'shirotan', text: 'ねえ、きょう、いちにちで いちばんすきだったの、なぁに？', emo: '', face: FACE.blush }
            ],
            choices: [
              { text: '「全部。きみといる時間ぜんぶ」', love: 10, next: -1 },
              { text: '「お弁当のおにぎり、おいしかったね」', love: 4, next: -1 },
              { text: '「水族館の魚たち、かわいかった」', love: 2, next: -1 }
            ]
          }
        ],
        endings: {
          love: { img: FACE.blush, text: '観覧車のてっぺんで、しろたんはきみの手をぎゅっと握った。窓の外、夕焼けに染まる街。「また、いっしょにきようね。なんども、なんども。」しろたんの約束は、いつまでも消えなかった。' },
          friend: { img: FACE.smile, text: '帰り道、しろたんはずっと水族館のパンフレットを抱きしめていた。「きょう、たのしかったね。」二人の足音が、夕暮れの駅に響いた。' },
          lonely: { img: FACE.calm, text: 'しろたんはずっと魚を見ていた。きみのほうは、あまり見なかった。でもそれは、きっとしろたんなりの幸せのかたち。' }
        }
      },

      // ---------- ③ ごはん編 ----------
      {
        id: 'meal',
        title: 'ごはん編',
        desc: 'いっしょにパンケーキ、つくろう？',
        icon: '🥞',
        scenes: [
          {
            bg: 'scene-kitchen', char: FACE.smile,
            lines: [
              { who: 'narrator', text: '日曜の朝。エプロン姿のしろたんが、ボウルを抱えてうろうろしている。', face: FACE.calm },
              { who: 'shirotan', text: 'きみ、おはよう。きょうはね、いっしょに パンケーキつくらない？', emo: '🥞', face: FACE.smile },
              { who: 'you', text: 'えっ、しろたん、料理できるの？', face: FACE.main },
              { who: 'shirotan', text: '…えへへ。だから、きみが せんせいで。', emo: '😅', face: FACE.blush }
            ],
            choices: [
              { text: '「もちろん、いっしょにつくろう」エプロンをつける', love: 6, next: 1 },
              { text: '「あぶないから見ててね？」やさしく言う', love: 3, next: 1 },
              { text: '「自分でやってみな」突き放す', love: -1, next: 1 }
            ]
          },
          {
            bg: 'scene-kitchen', char: FACE.calm,
            lines: [
              { who: 'shirotan', text: 'たまごを わるんだよね…えいっ。', emo: '🥚', face: FACE.calm },
              { who: 'narrator', text: 'パコッ。しろたんのちっちゃな手では、たまごの殻がぼろぼろに割れてしまった。', face: FACE.main },
              { who: 'shirotan', text: 'うぅ、からが いっぱい はいっちゃった…。', emo: '😢', face: FACE.main }
            ],
            choices: [
              { text: '「だいじょうぶ、わたしが取るよ」しゃがんで一緒に', love: 6, next: 2 },
              { text: '「ふふっ、可愛いミスだね」笑う', love: 3, next: 2 },
              { text: '「もっと丁寧にね」教える', love: 1, next: 2 }
            ]
          },
          {
            bg: 'scene-kitchen', char: FACE.blush,
            lines: [
              { who: 'narrator', text: 'ふたりで生地をまぜる。フライパンの上で、まあるいパンケーキがふわふわ膨らんでいく。', face: FACE.smile },
              { who: 'shirotan', text: 'ぷくぷく…。ぼくのおなかみたい。', emo: '🥞', face: FACE.smile },
              { who: 'shirotan', text: 'ねえ、ひとつめは どっちが たべる？', emo: '', face: FACE.blush }
            ],
            choices: [
              { text: '「半分こしようよ」フォークをふたつ', love: 7, next: 3 },
              { text: '「しろたん、どうぞ」譲る', love: 5, next: 3 },
              { text: '「おなかぺこぺこ、わたし！」', love: 2, next: 3 }
            ]
          },
          {
            bg: 'scene-cafe', char: FACE.smile,
            lines: [
              { who: 'narrator', text: 'リビングのテーブル。ふわふわのパンケーキに、メープルシロップがゆっくり広がっていく。', face: FACE.calm },
              { who: 'shirotan', text: 'んー…！ あまい〜！しあわせ〜！', emo: '💗', face: FACE.smile },
              { who: 'shirotan', text: 'ぼくね、こういう じかんが、いちばんすきなんだ。きみとの。', emo: '', face: FACE.blush }
            ],
            choices: [
              { text: '「これからも、いっしょにつくろうね」', love: 10, next: -1 },
              { text: '「うん、おいしいね」笑い合う', love: 5, next: -1 },
              { text: '「写真撮らなきゃ」スマホを取り出す', love: 1, next: -1 }
            ]
          }
        ],
        endings: {
          love: { img: FACE.blush, text: 'それから、毎週日曜の朝はふたりのパンケーキタイム。しろたんはだんだんたまごを上手に割れるようになって、きみは毎週ちょっとずつ、しあわせのレシピを覚えていった。' },
          friend: { img: FACE.smile, text: 'パンケーキは、ちょっと焦げたところもあったけれど、ふたりで食べたら、世界でいちばんおいしかった。' },
          lonely: { img: FACE.main, text: 'しろたんは黙々と食べていた。でも、最後の一口を、こっそりきみの皿に乗せていった。…きづかれてないと、おもってるんだろうな。' }
        }
      },

      // ---------- ④ おやすみ編 ----------
      {
        id: 'sleep',
        title: 'おやすみ編',
        desc: '星空のしたで、しろたんと、ねむりにつくまで。',
        icon: '🌙',
        scenes: [
          {
            bg: 'scene-bedroom', char: FACE.calm,
            lines: [
              { who: 'narrator', text: '夜更け。ベッドのうえで、しろたんはくるまったまま天井を見ている。', face: FACE.main },
              { who: 'shirotan', text: 'ねぇ…まだ、ねむくない？', emo: '🌙', face: FACE.calm },
              { who: 'you', text: 'ううん、まだ。しろたんは？', face: FACE.main },
              { who: 'shirotan', text: 'ぼくも、まだ。…ねえ、おはなししよ？', emo: '✨', face: FACE.smile }
            ],
            choices: [
              { text: '「いいよ、なんのおはなし？」隣に寝そべる', love: 6, next: 1 },
              { text: '電気を消して、お月さまを見る', love: 4, next: 1 },
              { text: '「もう寝なきゃダメだよ」ふとんをかける', love: 2, next: 1 }
            ]
          },
          {
            bg: 'scene-bedroom', char: FACE.smile,
            lines: [
              { who: 'shirotan', text: 'ぼくね、ちっちゃいころのおもいで、ひとつだけのこってるんだ。', emo: '🍀', face: FACE.calm },
              { who: 'shirotan', text: 'うみのなかで、あったかいなにかに つつまれて、ねむってた。', emo: '', face: FACE.blush },
              { who: 'shirotan', text: 'ぷくっ…たぶん、ママだったとおもう。', emo: '💗', face: FACE.smile }
            ],
            choices: [
              { text: 'しろたんを、ぎゅっと抱きしめる', love: 8, next: 2 },
              { text: '「やさしいおはなし、ありがとう」', love: 4, next: 2 },
              { text: '「いまは、わたしがいるよ」', love: 6, next: 2 }
            ]
          },
          {
            bg: 'scene-night', char: FACE.calm,
            lines: [
              { who: 'narrator', text: '窓のカーテンを少しあけると、星がぱらぱらこぼれそうな空。', face: FACE.calm },
              { who: 'shirotan', text: 'うわぁ…ほし、いっぱい。', emo: '⭐', face: FACE.smile },
              { who: 'shirotan', text: 'あのね、ねむるまえに ねがいごと、ひとつだけ してもいい？', emo: '', face: FACE.blush }
            ],
            choices: [
              { text: '「うん、ふたりでいっしょに」目を閉じる', love: 7, next: 3 },
              { text: '「どんな願いごと？」やさしく聞く', love: 4, next: 3 },
              { text: '「ふふ、聞かないでおく」', love: 2, next: 3 }
            ]
          },
          {
            bg: 'scene-bedroom', char: FACE.blush,
            lines: [
              { who: 'narrator', text: 'しろたんは、もう半分まぶたが落ちている。声がだんだん小さくなる。', face: FACE.calm },
              { who: 'shirotan', text: 'おやすみ…。あした、おはようするまで…ぼく、ここにいるね…。', emo: '💤', face: FACE.calm },
              { who: 'shirotan', text: '…きみは、どうしたい？', emo: '', face: FACE.blush }
            ],
            choices: [
              { text: '「ずっとそばにいて」と耳元で', love: 10, next: -1 },
              { text: '「おやすみ、いい夢みてね」と頭をなでる', love: 5, next: -1 },
              { text: 'そっとふとんを直してあげる', love: 3, next: -1 }
            ]
          }
        ],
        endings: {
          love: { img: FACE.blush, text: 'しろたんの寝息が、きみの腕のなかでゆっくり落ち着いていく。まどの外、星がいくつか流れた。きみは小さく祈った。「どうか、この夜が、ずっと続きますように」。' },
          friend: { img: FACE.calm, text: 'しろたんは、ぎゅっと枕を抱きしめて眠ってしまった。ふくふくのおなかが、しずかに上下している。「おやすみ、しろたん」。' },
          lonely: { img: FACE.main, text: 'しろたんは、くるりと背を向けて眠った。きみは天井を見つめながら、なぜか、すこしだけ さみしくなった。' }
        }
      },

      // ---------- ⑤ おうち編 ----------
      {
        id: 'home',
        title: 'おうち編',
        desc: '雨の日のおうちで、まったり、ぬくぬく。',
        icon: '☔',
        scenes: [
          {
            bg: 'scene-rain', char: FACE.calm,
            lines: [
              { who: 'narrator', text: '日曜の昼。空はどんよりした雨模様。お出かけのよていは、流れた。', face: FACE.main },
              { who: 'shirotan', text: 'うぅ…おでかけ、できなかったね。', emo: '☔', face: FACE.calm },
              { who: 'you', text: 'うん。しろたん、どうしようか？', face: FACE.main },
              { who: 'shirotan', text: 'んー…ぼく、えほんもってきた。よんでくれない？', emo: '📖', face: FACE.smile }
            ],
            choices: [
              { text: '「もちろん。お膝においで」', love: 6, next: 1 },
              { text: '「ホットチョコ淹れてからね」', love: 4, next: 1 },
              { text: '「自分で読みなよ〜」笑う', love: 0, next: 1 }
            ]
          },
          {
            bg: 'scene-home', char: FACE.smile,
            lines: [
              { who: 'narrator', text: 'マグカップから湯気が立ちのぼる。しろたんは小さな手で、ふぅふぅしている。', face: FACE.calm },
              { who: 'shirotan', text: 'あっつ…！でも、おいしい〜。あまい〜。', emo: '☕', face: FACE.smile },
              { who: 'shirotan', text: 'ねえ、ぼくの くちのまわり、ついてない…？', emo: '😳', face: FACE.blush }
            ],
            choices: [
              { text: 'やさしく拭いてあげる', love: 7, next: 2 },
              { text: '「うん、ついてるよ」と教える', love: 3, next: 2 },
              { text: '「かわいいから、そのまま」笑う', love: 4, next: 2 }
            ]
          },
          {
            bg: 'scene-home', char: FACE.calm,
            lines: [
              { who: 'narrator', text: 'ソファに、ふたりで毛布をかけて、テレビをつける。BGMは、雨の音と、しろたんのねむそうな呼吸。', face: FACE.calm },
              { who: 'shirotan', text: 'ぷくぷく…ぼく、こういう ひがいちばんすき。', emo: '🍀', face: FACE.smile },
              { who: 'shirotan', text: 'おでかけ できなくても、きみがいるなら、それで…。', emo: '💗', face: FACE.blush }
            ],
            choices: [
              { text: '「わたしも、いちばん好き、こういう日」', love: 8, next: 3 },
              { text: '頭をぽんぽん、と撫でる', love: 5, next: 3 },
              { text: '「次は、晴れの日にいこうね」', love: 3, next: 3 }
            ]
          },
          {
            bg: 'scene-home', char: FACE.blush,
            lines: [
              { who: 'narrator', text: '気がつくと、雨がやんでいた。窓の外、灰色の雲のすきまから、薄い光がさしている。', face: FACE.calm },
              { who: 'shirotan', text: '…あめ、やんだね。でも、ぼくは このまま、ここにいたい。', emo: '✨', face: FACE.blush },
              { who: 'shirotan', text: 'きみは、どうする？', emo: '', face: FACE.smile }
            ],
            choices: [
              { text: '「わたしも。もうちょっとだけ、こうしてよ」', love: 10, next: -1 },
              { text: '「お散歩、行ってみる？」誘う', love: 4, next: -1 },
              { text: '「夕飯の買い物、行かなきゃ」', love: 1, next: -1 }
            ]
          }
        ],
        endings: {
          love: { img: FACE.blush, text: 'やんだ雨のかわりに、ふたりの あいだに、あったかい時間がつもっていった。窓ガラスについた水滴が、きらきら光っていた。', },
          friend: { img: FACE.smile, text: 'お散歩には行かなかった。でも、おうちのなかで、ふたりはたくさんのお話をした。雨の日って、わるくない。' },
          lonely: { img: FACE.calm, text: 'しろたんはひとりで毛布にくるまって、テレビを見ていた。きみが帰ってきたとき、しろたんはちょっとだけ、寂しそうな顔をしていた。' }
        }
      },

      // ---------- ⑥ きょだいオムライス編 ----------
      {
        id: 'omurice',
        title: 'きょだいオムライス編',
        desc: 'しろたんがふしぎな おおきなオムライスを…！',
        icon: '🍳',
        scenes: [
          {
            bg: 'scene-kitchen', char: FACE.brave,
            lines: [
              { who: 'narrator', text: 'おひるどき。キッチンから、しろたんの きあいの声が きこえる。', face: FACE.calm },
              { who: 'shirotan', text: 'きょうは、きみのために とっておきの りょうりを つくったよ！', emo: '✨', face: FACE.brave },
              { who: 'you', text: 'えっ、しろたんが？うれしい〜！なにをつくってくれたの？', face: FACE.smile },
              { who: 'shirotan', text: 'ふっふっふ…。とびらをあけて、たまげるがよい。', emo: '💪', face: FACE.brave }
            ],
            choices: [
              { text: 'わくわくしながら扉をあける', love: 5, next: 1 },
              { text: '「いいにおい〜」と鼻をひくひくさせる', love: 3, next: 1 },
              { text: '「だいじょうぶ…？」少しこわごわ', love: 1, next: 1 }
            ]
          },
          {
            bg: 'scene-omurice', char: FACE.omurice,
            lines: [
              { who: 'narrator', text: 'テーブルのうえに、しろたんよりも おおきい オムライスが ででん！と のっていた。', face: FACE.calm },
              { who: 'you', text: 'えええっ！？オムライスがでかい！？しろたんとおなじくらい…！', face: FACE.main },
              { who: 'shirotan', text: 'ぷくぅ〜！あいじょう こめて、まきまきしたら こうなったの。', emo: '🍳', face: FACE.omurice },
              { who: 'shirotan', text: 'いっしょに たべよ？はんぶんこ、しよ？', emo: '💗', face: FACE.omurice }
            ],
            choices: [
              { text: '「もちろん！いただきます！」一緒にかぶりつく', love: 8, next: 2 },
              { text: '「すごい…ありがとう」目をうるませる', love: 6, next: 2 },
              { text: '写真を撮ってから食べる', love: 2, next: 2 }
            ]
          },
          {
            bg: 'scene-omurice', char: FACE.blush,
            lines: [
              { who: 'narrator', text: 'ふたりとも、ほっぺに ケチャップを ちょっとつけて、おなかいっぱい。', face: FACE.calm },
              { who: 'shirotan', text: 'えへへ…。きみが「おいしい」って いってくれるの、ぼく、いちばん うれしい。', emo: '💗', face: FACE.blush },
              { who: 'shirotan', text: 'これからも、まいにち つくってあげたいな。', emo: '', face: FACE.smile }
            ],
            choices: [
              { text: '「じゃあ、毎日いっしょに食べよ」', love: 10, next: -1 },
              { text: '「ありがとう、しろたんのごはん大好き」', love: 6, next: -1 },
              { text: '「次はわたしも手伝うね」', love: 3, next: -1 }
            ]
          }
        ],
        endings: {
          love: { img: FACE.blush, text: 'それからふたりは、毎日のお昼を いっしょに たべるようになった。きょだいオムライスは、ふたりだけの あいことば。' },
          friend: { img: FACE.smile, text: 'しろたんの りょうりは、ちょっとずつ ふつうのサイズに もどっていった。でも、こころは ぎゅっと あったかいまま。' },
          lonely: { img: FACE.calm, text: 'のこったオムライスは、ラップにつつまれて、れいぞうこへ。しろたんは あした、また つくるって きめた。' }
        }
      },

      // ---------- ⑦ なつのうみ編 ----------
      {
        id: 'beach2',
        title: 'なつのうみ編',
        desc: '青い海と白い砂、しろたんと夏のひととき。',
        icon: '🏖️',
        scenes: [
          {
            bg: 'scene-beach-real', char: FACE.beachy,
            lines: [
              { who: 'narrator', text: '夏まっさかり。とおく まで つづく まっしろな すなはまに、しろたんが ぴょこんと たっていた。', face: FACE.calm },
              { who: 'shirotan', text: 'うみだー！うみー！きみ、はやくはやく〜！', emo: '🌊', face: FACE.beachy },
              { who: 'you', text: 'もうしろたん、まちきれないんだから〜', face: FACE.smile }
            ],
            choices: [
              { text: '靴をぬいで、しろたんと一緒にかけだす', love: 6, next: 1 },
              { text: '「日焼け止め塗ってあげる」よびとめる', love: 4, next: 1 },
              { text: '日陰でゆっくりしたい、と提案する', love: 1, next: 1 }
            ]
          },
          {
            bg: 'scene-beach-real', char: FACE.beachy,
            lines: [
              { who: 'narrator', text: 'なみうちぎわで、しろたんが ばしゃばしゃと はねている。', face: FACE.calm },
              { who: 'shirotan', text: 'ぷくっ！うみのみずって、しょっぱいんだね！', emo: '💦', face: FACE.beachy },
              { who: 'shirotan', text: 'ねえ、きみも はいって！てを つないで、いっしょに ジャンプしよ？', emo: '✨', face: FACE.beachy }
            ],
            choices: [
              { text: 'しろたんと手をつないで波にとびこむ', love: 8, next: 2 },
              { text: '「冷たいっ！」と笑いながら追いかける', love: 5, next: 2 },
              { text: 'すなはまから水をかけ合う', love: 4, next: 2 }
            ]
          },
          {
            bg: 'scene-sunset', char: FACE.blush,
            lines: [
              { who: 'narrator', text: 'ひがしずんで、うみが オレンジに そまっていく。', face: FACE.calm },
              { who: 'shirotan', text: 'きょう、すっごく たのしかった。きみと いっしょの なつ、ずっと わすれない。', emo: '💗', face: FACE.blush },
              { who: 'shirotan', text: 'らいねんも、さらいねんも…ずっと いっしょに、うみ こようね？', emo: '', face: FACE.blush }
            ],
            choices: [
              { text: '「うん、毎年いっしょに来ようね」', love: 10, next: -1 },
              { text: '「忘れない夏になったね」', love: 6, next: -1 },
              { text: '「写真、いっぱい撮ろう」', love: 3, next: -1 }
            ]
          }
        ],
        endings: {
          love: { img: FACE.blush, text: 'まいとし、なつのおわりに、ふたりは あの すなはまへ かえってくる。やくそくの ばしょは、ふたりだけの たからもの。' },
          friend: { img: FACE.smile, text: 'たくさん あそんで、たくさん わらった なつ。しろたんと きみの アルバムには、まっしろな すなと、まっさおな うみが いっぱい。' },
          lonely: { img: FACE.calm, text: '波の音だけが残った。ひとり ひろった ちいさな かいがらを、しろたんは そっと ポケットに しまった。' }
        }
      }
    ],
    en: [
      // ---------- ① Beach ----------
      {
        id: 'meet',
        title: 'Beach Encounter',
        desc: 'A late summer meeting by the sea.',
        icon: '🌊',
        scenes: [
          {
            bg: 'scene-beach', char: FACE.main,
            lines: [
              { who: 'narrator', text: 'At the end of summer, I was walking alone on the beach.', face: FACE.arrival },
              { who: 'narrator', text: 'Something small and white lay at my feet...', face: FACE.arrival },
              { who: 'shirotan', text: 'Puku...', emo: '❓', face: FACE.main },
              { who: 'you', text: 'A baby seal? Out here?', face: FACE.main }
            ],
            choices: [
              { text: '"Are you lost?" Speak gently', love: 4, next: 1 },
              { text: 'Watch quietly from afar', love: 1, next: 1 },
              { text: '"So cute!!" Hug instantly', love: -1, next: 1 }
            ]
          },
          {
            bg: 'scene-beach', char: FACE.smile,
            lines: [
              { who: 'shirotan', text: "I'm not lost. I was waiting for you.", emo: '💫', face: FACE.smile },
              { who: 'you', text: 'For... me?', face: FACE.main },
              { who: 'shirotan', text: "You look a little sad today, don't you?", emo: '🍀', face: FACE.calm }
            ],
            choices: [
              { text: '"Yeah, I\'m a bit tired..."', love: 5, next: 2 },
              { text: '"How did you know?"', love: 3, next: 2 },
              { text: '"I\'m fine."', love: 0, next: 2 }
            ]
          },
          {
            bg: 'scene-sunset', char: FACE.blush,
            lines: [
              { who: 'narrator', text: 'The sky turned a gentle sunset color.', face: FACE.calm },
              { who: 'shirotan', text: "Let's watch the sunset together.", emo: '💗', face: FACE.blush },
              { who: 'shirotan', text: "A reward time, for someone who works so hard.", emo: '', face: FACE.smile }
            ],
            choices: [
              { text: 'Sit beside them quietly', love: 6, next: 3 },
              { text: '"It\'s beautiful"', love: 4, next: 3 },
              { text: 'Take a photo', love: 1, next: 3 }
            ]
          },
          {
            bg: 'scene-night', char: FACE.main,
            lines: [
              { who: 'narrator', text: 'On a starry beach at night, Shirotan spoke softly.', face: FACE.calm },
              { who: 'shirotan', text: "I'm actually from across the sea.", emo: '✨', face: FACE.calm },
              { who: 'shirotan', text: "At the end... tell me how you feel.", emo: '💗', face: FACE.blush }
            ],
            choices: [
              { text: '"I want to stay with you forever"', love: 10, next: -1 },
              { text: '"We\'ll meet again, I\'m sure"', love: 4, next: -1 },
              { text: '"Please, don\'t forget me"', love: 1, next: -1 }
            ]
          }
        ],
        endings: {
          love: { img: FACE.blush, text: 'Shirotan went back across the sea — but every summer, they return to meet you. On a starry beach, they look at your hand and smile a tiny "puku".' },
          friend: { img: FACE.smile, text: 'Shirotan said goodbye and left. In your pocket — a tiny shining shell. Only the promise of "see you again" remained.' },
          lonely: { img: FACE.arrival, text: 'Shirotan quietly disappeared. The scent of sunset, the sound of rain, those words... maybe it was all a dream. But somehow, you feel a little kinder now.' }
        }
      },

      // ---------- ② Date ----------
      {
        id: 'date',
        title: 'Aquarium Date',
        desc: 'Date day at the aquarium, in blue light.',
        icon: '🐚',
        scenes: [
          {
            bg: 'scene-station', char: FACE.smile,
            lines: [
              { who: 'narrator', text: 'A holiday morning. Shirotan is waiting at the station with a tiny backpack.', face: FACE.arrival },
              { who: 'shirotan', text: "You're late~ I waited five whole minutes!", emo: '⏰', face: FACE.calm },
              { who: 'you', text: 'Sorry, I was making lunch.', face: FACE.smile },
              { who: 'shirotan', text: 'Oh. Puku. ...That, I forgive.', emo: '💗', face: FACE.smile }
            ],
            choices: [
              { text: '"Aquarium today, can\'t wait!" Hold hands', love: 6, next: 1 },
              { text: 'Peek into the backpack', love: 3, next: 1 },
              { text: '"Sorry again"', love: 2, next: 1 }
            ]
          },
          {
            bg: 'scene-aquarium', char: FACE.main,
            lines: [
              { who: 'narrator', text: 'At the seal section, white seals glide behind glass.', face: FACE.calm },
              { who: 'shirotan', text: 'Whoa... they might be my relatives.', emo: '✨', face: FACE.main },
              { who: 'you', text: 'Go say hi?', face: FACE.smile },
              { who: 'shirotan', text: "It's embarrassing! Come with me?", emo: '😳', face: FACE.blush }
            ],
            choices: [
              { text: '"Of course, together"', love: 6, next: 2 },
              { text: '"Go on, I\'ll cheer you"', love: 3, next: 2 },
              { text: '"Hehe, go alone"', love: 0, next: 2 }
            ]
          },
          {
            bg: 'scene-aquarium', char: FACE.blush,
            lines: [
              { who: 'narrator', text: 'In front of the big tank, schools of fish swirl in blue light.', face: FACE.calm },
              { who: 'shirotan', text: "It's like we're in the sea ourselves.", emo: '🐟', face: FACE.blush },
              { who: 'shirotan', text: 'Time with you... I wish it could go on forever.', emo: '💗', face: FACE.blush }
            ],
            choices: [
              { text: '"Me too"', love: 7, next: 3 },
              { text: '"Hehe, thank you"', love: 4, next: 3 },
              { text: '"Lots of fish, huh"', love: 1, next: 3 }
            ]
          },
          {
            bg: 'scene-ferris', char: FACE.smile,
            lines: [
              { who: 'narrator', text: 'On the way home, the ferris wheel. Shirotan sits across from you, sunset glowing.', face: FACE.calm },
              { who: 'shirotan', text: 'So high~ I\'ve never been this high.', emo: '🎡', face: FACE.smile },
              { who: 'shirotan', text: "What was your favorite thing today?", emo: '', face: FACE.blush }
            ],
            choices: [
              { text: '"Everything. All the time with you"', love: 10, next: -1 },
              { text: '"The lunch onigiri"', love: 4, next: -1 },
              { text: '"The fish were cute"', love: 2, next: -1 }
            ]
          }
        ],
        endings: {
          love: { img: FACE.blush, text: 'At the top of the ferris wheel, Shirotan grabbed your hand. "Let\'s come again, again and again." The promise lingered.' },
          friend: { img: FACE.smile, text: 'On the way home, Shirotan held the aquarium pamphlet close. "Today was fun." Two pairs of footsteps echoed at the dusk station.' },
          lonely: { img: FACE.calm, text: 'Shirotan spent most of the day looking at fish, not at you. But that, perhaps, was their own kind of happiness.' }
        }
      },

      // ---------- ③ Meal ----------
      {
        id: 'meal',
        title: 'Pancake Together',
        desc: 'Sunday morning pancakes — together.',
        icon: '🥞',
        scenes: [
          {
            bg: 'scene-kitchen', char: FACE.smile,
            lines: [
              { who: 'narrator', text: 'Sunday morning. Shirotan, in an apron, fumbles with a bowl.', face: FACE.calm },
              { who: 'shirotan', text: "Morning. Wanna make pancakes together today?", emo: '🥞', face: FACE.smile },
              { who: 'you', text: "Wait — you can cook?", face: FACE.main },
              { who: 'shirotan', text: "Hehe, that\'s why YOU\'re the teacher.", emo: '😅', face: FACE.blush }
            ],
            choices: [
              { text: '"Sure, let\'s do it!" Put on apron', love: 6, next: 1 },
              { text: '"Just watch, it\'s dangerous"', love: 3, next: 1 },
              { text: '"Try it yourself"', love: -1, next: 1 }
            ]
          },
          {
            bg: 'scene-kitchen', char: FACE.calm,
            lines: [
              { who: 'shirotan', text: 'Crack the egg... here goes!', emo: '🥚', face: FACE.calm },
              { who: 'narrator', text: 'CRUNCH. Shirotan\'s tiny paws shattered the shell into pieces.', face: FACE.main },
              { who: 'shirotan', text: 'Uuuh... shell got everywhere...', emo: '😢', face: FACE.main }
            ],
            choices: [
              { text: '"It\'s okay, I\'ll help" Crouch beside', love: 6, next: 2 },
              { text: '"Cute mistake!" Laugh', love: 3, next: 2 },
              { text: '"Try gentler next time"', love: 1, next: 2 }
            ]
          },
          {
            bg: 'scene-kitchen', char: FACE.blush,
            lines: [
              { who: 'narrator', text: 'You stir the batter together. Round pancakes puff up in the pan.', face: FACE.smile },
              { who: 'shirotan', text: 'Puku puku... they look like my belly.', emo: '🥞', face: FACE.smile },
              { who: 'shirotan', text: 'Who eats the first one?', emo: '', face: FACE.blush }
            ],
            choices: [
              { text: '"Let\'s split it" Two forks', love: 7, next: 3 },
              { text: '"You first, Shirotan"', love: 5, next: 3 },
              { text: '"I\'m starving, ME!"', love: 2, next: 3 }
            ]
          },
          {
            bg: 'scene-cafe', char: FACE.smile,
            lines: [
              { who: 'narrator', text: 'Maple syrup spreads slowly over the fluffy stack.', face: FACE.calm },
              { who: 'shirotan', text: 'Mmm! So sweet! So happy!', emo: '💗', face: FACE.smile },
              { who: 'shirotan', text: 'These times with you... they\'re my favorite.', emo: '', face: FACE.blush }
            ],
            choices: [
              { text: '"Let\'s keep doing this, always"', love: 10, next: -1 },
              { text: '"Yeah, delicious!" Smile', love: 5, next: -1 },
              { text: '"Photo time!" Grab phone', love: 1, next: -1 }
            ]
          }
        ],
        endings: {
          love: { img: FACE.blush, text: 'Sunday mornings became your pancake ritual. Shirotan got better at cracking eggs, and you slowly memorized the recipe of happiness, week by week.' },
          friend: { img: FACE.smile, text: 'A few burnt edges, but eaten together — the best in the world.' },
          lonely: { img: FACE.main, text: 'Shirotan ate quietly. But the last bite ended up on your plate, sneaked over. ...You probably didn\'t notice. (They thought.)' }
        }
      },

      // ---------- ④ Sleep ----------
      {
        id: 'sleep',
        title: 'Goodnight Story',
        desc: 'Under starlight, until you fall asleep.',
        icon: '🌙',
        scenes: [
          {
            bg: 'scene-bedroom', char: FACE.calm,
            lines: [
              { who: 'narrator', text: 'Late at night. Shirotan, bundled in blankets, stares at the ceiling.', face: FACE.main },
              { who: 'shirotan', text: 'Hey... not sleepy yet?', emo: '🌙', face: FACE.calm },
              { who: 'you', text: 'Not yet. You?', face: FACE.main },
              { who: 'shirotan', text: 'Me neither. Wanna talk a bit?', emo: '✨', face: FACE.smile }
            ],
            choices: [
              { text: '"Sure, what about?" Lie beside', love: 6, next: 1 },
              { text: 'Turn off the lights, gaze at the moon', love: 4, next: 1 },
              { text: '"You should sleep" Tuck them in', love: 2, next: 1 }
            ]
          },
          {
            bg: 'scene-bedroom', char: FACE.smile,
            lines: [
              { who: 'shirotan', text: 'I have one memory from when I was tiny.', emo: '🍀', face: FACE.calm },
              { who: 'shirotan', text: 'In the sea, wrapped in something warm, sleeping.', emo: '', face: FACE.blush },
              { who: 'shirotan', text: 'Puku... I think it was Mom.', emo: '💗', face: FACE.smile }
            ],
            choices: [
              { text: 'Hug Shirotan tight', love: 8, next: 2 },
              { text: '"Thanks for sharing"', love: 4, next: 2 },
              { text: '"Now I\'m here"', love: 6, next: 2 }
            ]
          },
          {
            bg: 'scene-night', char: FACE.calm,
            lines: [
              { who: 'narrator', text: 'You crack the curtain — stars spill across the sky.', face: FACE.calm },
              { who: 'shirotan', text: 'Wow... so many stars.', emo: '⭐', face: FACE.smile },
              { who: 'shirotan', text: 'Can I make one wish before sleep?', emo: '', face: FACE.blush }
            ],
            choices: [
              { text: '"Yes, together" Close eyes', love: 7, next: 3 },
              { text: '"What kind of wish?"', love: 4, next: 3 },
              { text: '"Hehe, won\'t ask"', love: 2, next: 3 }
            ]
          },
          {
            bg: 'scene-bedroom', char: FACE.blush,
            lines: [
              { who: 'narrator', text: 'Shirotan\'s eyelids droop. Their voice goes thinner and thinner.', face: FACE.calm },
              { who: 'shirotan', text: 'Goodnight... until "good morning"... I\'ll be here...', emo: '💤', face: FACE.calm },
              { who: 'shirotan', text: 'And you... what do you want?', emo: '', face: FACE.blush }
            ],
            choices: [
              { text: '"Stay with me" Whispered', love: 10, next: -1 },
              { text: '"Goodnight, sweet dreams" Pat their head', love: 5, next: -1 },
              { text: 'Quietly fix the blanket', love: 3, next: -1 }
            ]
          }
        ],
        endings: {
          love: { img: FACE.blush, text: 'Shirotan\'s breathing slowed against your arm. Outside, a few stars fell. You whispered: "May this night last forever."' },
          friend: { img: FACE.calm, text: 'Shirotan hugged the pillow and fell asleep. Their fluffy belly rose and fell quietly. "Goodnight, Shirotan."' },
          lonely: { img: FACE.main, text: 'Shirotan turned away and slept. You stared at the ceiling, and felt — somehow, just a little — alone.' }
        }
      },

      // ---------- ⑤ Home ----------
      {
        id: 'home',
        title: 'Rainy Home Day',
        desc: 'Cozy indoor day, just the two of you.',
        icon: '☔',
        scenes: [
          {
            bg: 'scene-rain', char: FACE.calm,
            lines: [
              { who: 'narrator', text: 'Sunday afternoon. Heavy rain. Outdoor plans... cancelled.', face: FACE.main },
              { who: 'shirotan', text: 'Aww... no outing today.', emo: '☔', face: FACE.calm },
              { who: 'you', text: 'Yeah. So, what now?', face: FACE.main },
              { who: 'shirotan', text: 'Hmm... I brought a picture book. Read it to me?', emo: '📖', face: FACE.smile }
            ],
            choices: [
              { text: '"Sure. Hop on my lap"', love: 6, next: 1 },
              { text: '"After I make hot chocolate"', love: 4, next: 1 },
              { text: '"Read it yourself~"', love: 0, next: 1 }
            ]
          },
          {
            bg: 'scene-home', char: FACE.smile,
            lines: [
              { who: 'narrator', text: 'Steam curls up from the mugs. Shirotan blows on theirs with tiny paws.', face: FACE.calm },
              { who: 'shirotan', text: 'Hot...! But yummy~ so sweet~', emo: '☕', face: FACE.smile },
              { who: 'shirotan', text: 'Is there... something on my mouth?', emo: '😳', face: FACE.blush }
            ],
            choices: [
              { text: 'Wipe it gently', love: 7, next: 2 },
              { text: '"Yes, there is"', love: 3, next: 2 },
              { text: '"Cute, leave it" Laugh', love: 4, next: 2 }
            ]
          },
          {
            bg: 'scene-home', char: FACE.calm,
            lines: [
              { who: 'narrator', text: 'On the sofa, two of you under one blanket. The TV hums. The rain hums.', face: FACE.calm },
              { who: 'shirotan', text: 'Puku puku... I love days like this.', emo: '🍀', face: FACE.smile },
              { who: 'shirotan', text: 'Even without going out, if you\'re here... it\'s enough.', emo: '💗', face: FACE.blush }
            ],
            choices: [
              { text: '"Same. My favorite kind of day"', love: 8, next: 3 },
              { text: 'Pat their head softly', love: 5, next: 3 },
              { text: '"Next time, sunny day"', love: 3, next: 3 }
            ]
          },
          {
            bg: 'scene-home', char: FACE.blush,
            lines: [
              { who: 'narrator', text: 'The rain has stopped. Soft light leaks through the gray clouds.', face: FACE.calm },
              { who: 'shirotan', text: 'Rain stopped... but I wanna stay here.', emo: '✨', face: FACE.blush },
              { who: 'shirotan', text: 'And you?', emo: '', face: FACE.smile }
            ],
            choices: [
              { text: '"Me too. Just a bit longer"', love: 10, next: -1 },
              { text: '"Walk together?" Invite', love: 4, next: -1 },
              { text: '"Need to grocery shop"', love: 1, next: -1 }
            ]
          }
        ],
        endings: {
          love: { img: FACE.blush, text: 'In place of rain, warm hours piled up between you. Tiny droplets on the window glass shimmered like jewels.' },
          friend: { img: FACE.smile, text: 'You didn\'t go for a walk. But indoors, the two of you talked about so many things. Rainy days aren\'t bad.' },
          lonely: { img: FACE.calm, text: 'Shirotan stayed bundled in the blanket alone, watching TV. When you came back, their face looked... a little wistful.' }
        }
      },

      // ---------- ⑥ Giant Omurice ----------
      {
        id: 'omurice',
        title: 'Giant Omurice',
        desc: 'Shirotan made you a mysteriously huge omurice...!',
        icon: '🍳',
        scenes: [
          {
            bg: 'scene-kitchen', char: FACE.brave,
            lines: [
              { who: 'narrator', text: 'Lunchtime. A spirited voice rang out from the kitchen.', face: FACE.calm },
              { who: 'shirotan', text: 'I made you a SPECIAL dish today!', emo: '✨', face: FACE.brave },
              { who: 'you', text: 'Really? I can\'t wait — what is it?', face: FACE.smile },
              { who: 'shirotan', text: 'Heh heh... open the door and be amazed.', emo: '💪', face: FACE.brave }
            ],
            choices: [
              { text: 'Open the door, excited', love: 5, next: 1 },
              { text: '"Smells good!" Sniff the air', love: 3, next: 1 },
              { text: '"Are you... okay?" A little wary', love: 1, next: 1 }
            ]
          },
          {
            bg: 'scene-omurice', char: FACE.omurice,
            lines: [
              { who: 'narrator', text: 'On the table sat an omurice bigger than Shirotan themselves.', face: FACE.calm },
              { who: 'you', text: 'Whoa! It\'s as big as you are!', face: FACE.main },
              { who: 'shirotan', text: 'Puku~! I rolled it with all my love and it ended up huge!', emo: '🍳', face: FACE.omurice },
              { who: 'shirotan', text: 'Let\'s share it, okay? Half and half.', emo: '💗', face: FACE.omurice }
            ],
            choices: [
              { text: '"Let\'s dig in!" Eat together', love: 8, next: 2 },
              { text: '"Amazing... thank you" Tear up', love: 6, next: 2 },
              { text: 'Take photos first', love: 2, next: 2 }
            ]
          },
          {
            bg: 'scene-omurice', char: FACE.blush,
            lines: [
              { who: 'narrator', text: 'Both your cheeks dotted with ketchup, bellies full.', face: FACE.calm },
              { who: 'shirotan', text: 'Hearing you say "yummy" makes me the happiest.', emo: '💗', face: FACE.blush },
              { who: 'shirotan', text: 'I want to cook for you every single day.', emo: '', face: FACE.smile }
            ],
            choices: [
              { text: '"Then let\'s eat together every day"', love: 10, next: -1 },
              { text: '"Thanks, I love your cooking"', love: 6, next: -1 },
              { text: '"I\'ll help next time"', love: 3, next: -1 }
            ]
          }
        ],
        endings: {
          love: { img: FACE.blush, text: 'After that, you ate lunch together every day. Giant omurice became your secret password.' },
          friend: { img: FACE.smile, text: 'Shirotan\'s dishes slowly returned to normal size — but the warmth stayed.' },
          lonely: { img: FACE.calm, text: 'The leftovers went into the fridge, wrapped tight. Shirotan vowed to try again tomorrow.' }
        }
      },

      // ---------- ⑦ Summer Beach ----------
      {
        id: 'beach2',
        title: 'Summer Beach',
        desc: 'Blue sea, white sand, a summer afternoon.',
        icon: '🏖️',
        scenes: [
          {
            bg: 'scene-beach-real', char: FACE.beachy,
            lines: [
              { who: 'narrator', text: 'Peak summer. Shirotan stood waiting on the endless white sand.', face: FACE.calm },
              { who: 'shirotan', text: 'The SEA! Come on, hurry hurry!', emo: '🌊', face: FACE.beachy },
              { who: 'you', text: 'Geez, you couldn\'t wait, could you~', face: FACE.smile }
            ],
            choices: [
              { text: 'Kick off shoes and run together', love: 6, next: 1 },
              { text: '"Let me put sunscreen on you"', love: 4, next: 1 },
              { text: 'Suggest resting in the shade first', love: 1, next: 1 }
            ]
          },
          {
            bg: 'scene-beach-real', char: FACE.beachy,
            lines: [
              { who: 'narrator', text: 'Shirotan splashed at the water\'s edge.', face: FACE.calm },
              { who: 'shirotan', text: 'Puku! Seawater is SALTY!', emo: '💦', face: FACE.beachy },
              { who: 'shirotan', text: 'Come in too — let\'s hold hands and jump the waves!', emo: '✨', face: FACE.beachy }
            ],
            choices: [
              { text: 'Hold hands and jump into the waves', love: 8, next: 2 },
              { text: '"It\'s cold!" Chase them laughing', love: 5, next: 2 },
              { text: 'Splash water from the sand', love: 4, next: 2 }
            ]
          },
          {
            bg: 'scene-sunset', char: FACE.blush,
            lines: [
              { who: 'narrator', text: 'The sun sank low, dyeing the sea orange.', face: FACE.calm },
              { who: 'shirotan', text: 'Today was so fun. I\'ll never forget this summer with you.', emo: '💗', face: FACE.blush },
              { who: 'shirotan', text: 'Next year, the year after... let\'s always come to the sea together?', emo: '', face: FACE.blush }
            ],
            choices: [
              { text: '"Yeah, every year together"', love: 10, next: -1 },
              { text: '"It\'s a summer I\'ll never forget"', love: 6, next: -1 },
              { text: '"Let\'s take lots of photos"', love: 3, next: -1 }
            ]
          }
        ],
        endings: {
          love: { img: FACE.blush, text: 'Each summer\'s end, you return to that beach together. Your secret treasure of a promised place.' },
          friend: { img: FACE.smile, text: 'A summer of laughter and play. Your album fills with white sand and bluest sea.' },
          lonely: { img: FACE.calm, text: 'Only the sound of waves remained. Shirotan slipped a small shell into a pocket.' }
        }
      }
    ]
  };

  // ============ 状態 ============
  var state = { storyId: null, sceneIdx: 0, lineIdx: 0, love: 0, showingChoices: false };

  // ============ BGM: 波のささやきと水のアルペジオ（G major、ゆったり寄せては返す波） ============
  var audioCtx = null;
  var bgmNodes = [];
  var muted = localStorage.getItem('sg-muted-shirotan') === '1';

  function getCtx() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    }
    return audioCtx;
  }

  function startBGM() {
    var ctx = getCtx(); if (!ctx || muted) return;
    stopBGM();

    var master = ctx.createGain();
    master.gain.value = 0;
    master.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 1.5);
    master.connect(ctx.destination);
    bgmNodes.push(master);

    // 海の中のような水中フィルタ
    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1900;
    lp.Q.value = 0.5;
    lp.connect(master);
    bgmNodes.push(lp);

    // 波音（ホワイトノイズ風、ゆっくり寄せて返す）
    var noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    var nd = noiseBuf.getChannelData(0);
    for (var i = 0; i < nd.length; i++) nd[i] = (Math.random() * 2 - 1) * 0.6;

    // BPM ゆったり、波のリズム
    var bpm = 60;
    var beat = 60 / bpm;

    // G major の優しい和音進行：G - Em7 - Cmaj7 - D7sus4
    var chordProg = [
      { bass: 98.00,  notes: [196.00, 246.94, 293.66, 392.00] }, // G
      { bass: 82.41,  notes: [164.81, 246.94, 293.66, 392.00] }, // Em7
      { bass: 65.41,  notes: [196.00, 261.63, 329.63, 392.00] }, // Cmaj7
      { bass: 73.42,  notes: [196.00, 220.00, 293.66, 369.99] }  // D7sus4
    ];

    // アルペジオ（水滴がぽたんぽたんと落ちる）
    var arpPatterns = [
      [196.00, 392.00, 587.33, 783.99], // G
      [164.81, 329.63, 493.88, 659.25], // Em
      [261.63, 392.00, 523.25, 783.99], // C
      [220.00, 293.66, 440.00, 587.33]  // D
    ];

    // 水滴（ベル音、優しい高音）
    function playDrop(freq, start, vol) {
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      var t0 = ctx.currentTime + start;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(vol, t0 + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 1.4);
      o.connect(g); g.connect(master);
      o.start(t0); o.stop(t0 + 1.5);
      bgmNodes.push(o, g);
    }

    // パッド（海のたゆたい、長く伸ばす）
    function playPad(freq, start, dur, vol) {
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      // ゆっくりピッチ揺らぎ（波のような）
      var lfo = ctx.createOscillator();
      var lfoGain = ctx.createGain();
      lfo.frequency.value = 0.3;
      lfoGain.gain.value = 1.2;
      lfo.connect(lfoGain); lfoGain.connect(o.frequency);
      var t0 = ctx.currentTime + start;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(vol, t0 + 0.8);
      g.gain.linearRampToValueAtTime(vol * 0.7, t0 + dur * 0.6);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      o.connect(g); g.connect(lp);
      o.start(t0); o.stop(t0 + dur + 0.1);
      lfo.start(t0); lfo.stop(t0 + dur + 0.1);
      bgmNodes.push(o, g, lfo, lfoGain);
    }

    // ベース（海の底から響く低音）
    function playBass(freq, start, dur, vol) {
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      var t0 = ctx.currentTime + start;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(vol, t0 + 0.3);
      g.gain.linearRampToValueAtTime(vol * 0.6, t0 + dur * 0.7);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      o.connect(g); g.connect(lp);
      o.start(t0); o.stop(t0 + dur + 0.05);
      bgmNodes.push(o, g);
    }

    // 波の音（ノイズをローパスでフィルタ、フェードイン・アウト）
    function playWave(start, dur) {
      var src = ctx.createBufferSource();
      src.buffer = noiseBuf;
      src.loop = true;
      var bp = ctx.createBiquadFilter();
      bp.type = 'lowpass';
      bp.frequency.setValueAtTime(400, ctx.currentTime + start);
      bp.frequency.linearRampToValueAtTime(800, ctx.currentTime + start + dur * 0.4);
      bp.frequency.linearRampToValueAtTime(300, ctx.currentTime + start + dur);
      var g = ctx.createGain();
      var t0 = ctx.currentTime + start;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.06, t0 + dur * 0.3);
      g.gain.linearRampToValueAtTime(0.04, t0 + dur * 0.6);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      src.connect(bp); bp.connect(g); g.connect(master);
      src.start(t0); src.stop(t0 + dur + 0.1);
      bgmNodes.push(src, bp, g);
    }

    function schedule(start) {
      // 4小節：各4拍ずつ＝合計16拍
      chordProg.forEach(function (ch, i) {
        var s = start + i * 4 * beat;
        playBass(ch.bass, s, 4 * beat, 0.08);
        ch.notes.forEach(function (f) {
          playPad(f, s, 4 * beat, 0.025);
        });

        // アルペジオ：1小節に4音、水滴のように
        var arp = arpPatterns[i];
        for (var k = 0; k < 4; k++) {
          playDrop(arp[k] * 2, s + k * beat + 0.1, 0.04);
        }
      });

      // 波の音（4小節中、2回大きく寄せて返す）
      playWave(start, 8 * beat);
      playWave(start + 8 * beat, 8 * beat);
    }

    var loopLen = 16 * beat;
    schedule(0);
    var timer = setInterval(function () {
      if (!audioCtx || muted) { clearInterval(timer); return; }
      schedule(0);
    }, loopLen * 1000);
    bgmNodes.push({ type: 'timer', id: timer });
  }

  function stopBGM() {
    bgmNodes.forEach(function (n) {
      try {
        if (n && n.type === 'timer') clearInterval(n.id);
        else if (n && n.stop) n.stop();
        else if (n && n.disconnect) n.disconnect();
      } catch (e) {}
    });
    bgmNodes = [];
  }

  function sfxBeep(freq, dur, type) {
    var ctx = getCtx(); if (!ctx || muted) return;
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.1, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (dur || 0.1));
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + (dur || 0.1) + 0.05);
  }
  function sfxChoice()  { sfxBeep(880, 0.15, 'sine'); }
  function sfxHeart()   { sfxBeep(1046, 0.08, 'sine'); setTimeout(function(){ sfxBeep(1318, 0.12, 'sine'); }, 80); }
  function sfxNext()    { sfxBeep(660, 0.05, 'sine'); }

  // ============ シーン描画 ============
  function getStories() { return STORIES[LANG] || STORIES.ja; }
  function getStory() {
    var list = getStories();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === state.storyId) return list[i];
    }
    return list[0];
  }
  function getScenes() { return getStory().scenes; }

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(function (s) { s.classList.remove('active'); });
    document.getElementById(id).classList.add('active');
  }

  function renderScene() {
    var sc = getScenes()[state.sceneIdx];
    if (!sc) { endGame(); return; }

    document.getElementById('scene-bg').className = 'scene-bg ' + sc.bg;
    document.getElementById('char-img').src = sc.char;
    document.getElementById('scene-num').textContent = (state.sceneIdx + 1) + ' / ' + getScenes().length;

    state.lineIdx = 0;
    state.showingChoices = false;
    document.getElementById('choices').classList.remove('show');
    showLine();
    updateMeter();
  }

  function showLine() {
    var sc = getScenes()[state.sceneIdx];
    var line = sc.lines[state.lineIdx];
    if (!line) { showChoices(); return; }

    var speakerKey = line.who === 'you' ? 'speakerYou'
                   : line.who === 'shirotan' ? 'speakerShirotan'
                   : 'speakerNarrator';
    var speaker = document.getElementById('speaker');
    speaker.textContent = t(speakerKey);
    speaker.style.display = t(speakerKey) ? 'block' : 'none';

    // タイプライター風
    var textEl = document.getElementById('dialog-text');
    textEl.textContent = '';
    var chars = (line.text || '').split('');
    var i = 0;
    clearInterval(textEl._typer);
    document.getElementById('next-hint').classList.add('hidden');
    textEl._typer = setInterval(function () {
      if (i >= chars.length) {
        clearInterval(textEl._typer);
        document.getElementById('next-hint').classList.remove('hidden');
        return;
      }
      textEl.textContent += chars[i++];
    }, 30);
    textEl._done = function () {
      clearInterval(textEl._typer);
      textEl.textContent = line.text;
      document.getElementById('next-hint').classList.remove('hidden');
    };

    // キャラ画像切替（face指定があれば差し替え）
    if (line.face) {
      var charImg = document.getElementById('char-img');
      if (charImg.getAttribute('src') !== line.face) {
        charImg.setAttribute('src', line.face);
      }
    }

    // キャラ表情切替
    var emo = document.getElementById('char-emo');
    emo.classList.remove('show');
    if (line.emo) {
      setTimeout(function () {
        emo.textContent = line.emo;
        emo.classList.add('show');
      }, 100);
    }

    // narrator時はspeaker非表示
    if (line.who === 'narrator') speaker.style.display = 'none';

    sfxNext();
  }

  function advance() {
    if (state.showingChoices) return;

    var textEl = document.getElementById('dialog-text');
    var sc = getScenes()[state.sceneIdx];
    var line = sc.lines[state.lineIdx];

    // タイプライター中ならスキップ
    if (textEl._typer && line && textEl.textContent.length < line.text.length) {
      textEl._done();
      return;
    }

    state.lineIdx++;
    if (state.lineIdx < sc.lines.length) {
      showLine();
    } else {
      showChoices();
    }
  }

  function showChoices() {
    var sc = getScenes()[state.sceneIdx];
    if (!sc.choices || !sc.choices.length) { endGame(); return; }

    state.showingChoices = true;
    document.getElementById('next-hint').classList.add('hidden');
    var box = document.getElementById('choices');
    box.innerHTML = '';
    sc.choices.forEach(function (c) {
      var btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = c.text;
      btn.addEventListener('click', function () {
        pickChoice(c);
      });
      box.appendChild(btn);
    });
    box.classList.add('show');
  }

  function pickChoice(c) {
    state.love += c.love;
    sfxChoice();
    if (c.love > 0) {
      sfxHeart();
      var cs = document.getElementById('char-stage');
      cs.classList.remove('shake');
      flyHearts(c.love);
    } else if (c.love < 0) {
      document.getElementById('char-stage').classList.add('shake');
      setTimeout(function () { document.getElementById('char-stage').classList.remove('shake'); }, 400);
    }
    updateMeter();
    document.getElementById('choices').classList.remove('show');
    state.showingChoices = false;

    if (c.next === -1 || c.next === undefined || c.next >= getScenes().length) {
      setTimeout(endGame, 900);
    } else {
      state.sceneIdx = c.next;
      setTimeout(renderScene, 700);
    }
  }

  function flyHearts(n) {
    var stage = document.getElementById('char-stage');
    for (var i = 0; i < Math.min(n, 6); i++) {
      (function (i) {
        setTimeout(function () {
          var h = document.createElement('div');
          h.textContent = '💗';
          h.style.cssText = 'position:absolute;font-size:22px;left:' + (40 + Math.random() * 180) + 'px;top:' + (100 + Math.random() * 80) + 'px;pointer-events:none;animation:emoPop 0.8s ease-out forwards;';
          stage.appendChild(h);
          setTimeout(function () {
            h.style.transition = 'all 1s';
            h.style.transform = 'translateY(-60px)';
            h.style.opacity = '0';
          }, 100);
          setTimeout(function () { h.remove(); }, 1200);
        }, i * 100);
      })(i);
    }
  }

  function updateMeter() {
    var pct = Math.max(0, Math.min(100, (state.love / 30) * 100));
    document.getElementById('meter-fill').style.width = pct + '%';
    document.getElementById('meter-value').textContent = state.love;
  }

  // ============ エンディング ============
  function endGame() {
    var story = getStory();
    var endings = story.endings || {};
    var title, end;
    if (state.love >= 22) {
      title = t('endLove');
      end = endings.love;
      rainHearts();
    } else if (state.love >= 10) {
      title = t('endFriend');
      end = endings.friend;
    } else {
      title = t('endLonely');
      end = endings.lonely;
    }
    if (!end) end = { img: FACE.main, text: '' };

    document.getElementById('end-title').textContent = title;
    document.getElementById('end-text').textContent = end.text || '';
    document.getElementById('end-char').src = end.img || FACE.main;
    showScreen('end-screen');
  }

  function rainHearts() {
    var bg = document.querySelector('#end-screen .end-bg');
    var rain = document.createElement('div');
    rain.className = 'heart-rain';
    bg.appendChild(rain);
    var icons = ['💗','💖','💕','♡','✨'];
    for (var i = 0; i < 20; i++) {
      (function (i) {
        setTimeout(function () {
          var h = document.createElement('span');
          h.className = 'heart';
          h.textContent = icons[Math.floor(Math.random() * icons.length)];
          h.style.left = (Math.random() * 400) + 'px';
          h.style.animationDelay = (Math.random() * 1) + 's';
          h.style.animationDuration = (2 + Math.random() * 2) + 's';
          rain.appendChild(h);
          setTimeout(function () { h.remove(); }, 4000);
        }, i * 200);
      })(i);
    }
  }

  // ============ ストーリー選択画面 ============
  function renderStorySelect() {
    var grid = document.getElementById('story-grid');
    if (!grid) return;
    grid.innerHTML = '';
    getStories().forEach(function (story) {
      var card = document.createElement('button');
      card.className = 'story-card';
      card.setAttribute('data-story-id', story.id);
      card.innerHTML =
        '<div class="story-icon">' + (story.icon || '💗') + '</div>' +
        '<div class="story-title">' + story.title + '</div>' +
        '<div class="story-desc">' + story.desc + '</div>';
      card.addEventListener('click', function () {
        startStory(story.id);
      });
      grid.appendChild(card);
    });
  }

  function startStory(storyId) {
    state = { storyId: storyId, sceneIdx: 0, lineIdx: 0, love: 0, showingChoices: false };
    showScreen('adv-screen');
    renderScene();
    if (!muted) startBGM();
  }

  // ============ 初期化 ============
  function init() {
    applyI18n();
    renderStorySelect();

    document.getElementById('start-btn').addEventListener('click', function () {
      renderStorySelect();
      showScreen('story-select-screen');
    });

    document.getElementById('replay-btn').addEventListener('click', function () {
      if (!state.storyId) {
        renderStorySelect();
        showScreen('story-select-screen');
        return;
      }
      startStory(state.storyId);
    });

    var pickAnotherBtn = document.getElementById('pick-another-btn');
    if (pickAnotherBtn) {
      pickAnotherBtn.addEventListener('click', function () {
        renderStorySelect();
        showScreen('story-select-screen');
      });
    }

    var backToTitleBtn = document.getElementById('back-to-title-btn');
    if (backToTitleBtn) {
      backToTitleBtn.addEventListener('click', function () {
        showScreen('title-screen');
      });
    }

    document.getElementById('share-btn').addEventListener('click', function () {
      var url = 'https://eri-murayama.github.io/surreal-games/games/shirotan-love/index.html';
      var endTxt = document.getElementById('end-title').textContent;
      var storyTitle = state.storyId ? getStory().title : '';
      var text = t('shareText') + ' [' + storyTitle + '] ' + endTxt + ' #しろたん恋のかけら #シュールゲームス';
      window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url), '_blank', 'noopener');
    });

    // ADV画面タップで進める
    document.getElementById('adv-screen').addEventListener('click', function (e) {
      if (e.target.closest('.choice-btn')) return;
      if (e.target.closest('.mini-btn')) return;
      if (e.target.closest('.love-meter')) return;
      advance();
    });

    // スキップ
    document.getElementById('skip-btn').addEventListener('click', function () {
      var textEl = document.getElementById('dialog-text');
      if (textEl._typer && textEl._done) { textEl._done(); return; }
      advance();
    });

    document.getElementById('lang-btn').addEventListener('click', function () {
      LANG = LANG === 'ja' ? 'en' : 'ja';
      localStorage.setItem('sg-lang', LANG);
      applyI18n();
      renderStorySelect();
    });

    // ミュートボタン（タイトル＆ADV）
    function setupMute(btnId) {
      var btn = document.getElementById(btnId);
      if (!btn) return;
      btn.textContent = muted ? '🔇' : '🔊';
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        muted = !muted;
        localStorage.setItem('sg-muted-shirotan', muted ? '1' : '0');
        document.getElementById('mute-btn').textContent = muted ? '🔇' : '🔊';
        if (document.getElementById('mute2-btn')) document.getElementById('mute2-btn').textContent = muted ? '🔇' : '🔊';
        if (muted) stopBGM(); else startBGM();
      });
    }
    setupMute('mute-btn');
    setupMute('mute2-btn');

    // ADV画面でBGM起動
    var started = false;
    function tryStart() {
      if (started) return;
      started = true;
      if (!muted) startBGM();
    }
    document.addEventListener('click', tryStart, { once: true });
    document.addEventListener('touchstart', tryStart, { once: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
