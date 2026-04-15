/* ============================================
   ヤンデレ学園 ～どこにいても、あなたのそばに～
   学園恋愛シミュレーション（ストーカー付き）
   ============================================ */

(function () {
  'use strict';

  // ===== キャラクター定義 =====
  var CHARS = {
    airi:   { name: '桃園あいり', emoji: '👩‍🦰', color: 'pink', trait: 'ストーカー' },
    midori: { name: '青葉みどり', emoji: '👩‍🦳', color: 'green', trait: '運動部エース' },
    reina:  { name: '白雪れいな', emoji: '👩‍🦱', color: 'blue', trait: '図書委員' },
    hikari: { name: '金城ひかり', emoji: '👱‍♀️', color: 'yellow', trait: 'クラスのアイドル' }
  };

  // ===== 場所定義 =====
  var LOCATIONS = [
    { id: 'gym',     emoji: '🏀', name: '体育館',   hint: 'みどりがいるかも', charId: 'midori' },
    { id: 'library', emoji: '📚', name: '図書室',   hint: 'れいながいるかも', charId: 'reina' },
    { id: 'roof',    emoji: '☀️', name: '屋上',     hint: 'ひかりがいるかも', charId: 'hikari' },
    { id: 'garden',  emoji: '🌸', name: '中庭',     hint: '誰かいるかも…',   charId: 'airi' }
  ];

  // ===== 日数ごとのシナリオ =====
  // 各日・各場所で、最初にヒロインと会話 → あいりが割り込み → 選択肢
  var SCENARIOS = {
    1: {
      dayTitle: '月曜日',
      daySub: '新学期が始まった',
      gym: {
        intro: [
          { speaker: 'narrator', text: '体育館に来た。バスケの練習中のようだ。' },
          { speaker: 'midori', text: 'あ、来てくれたんだ！一緒にバスケしない？' },
        ],
        interrupt: [
          { speaker: 'narrator', text: 'ドアの影から誰かがこちらを見ている…' },
          { speaker: 'airi', text: 'あっ！偶然だね～！私もバスケしたくて来たの！', burst: true },
          { speaker: 'midori', text: 'え…？あなた帰宅部だよね…？' },
          { speaker: 'airi', text: 'みどりちゃんは練習に戻った方がいいよ？先輩に怒られちゃうよ？' },
          { speaker: 'narrator', text: 'みどりは気まずそうに去っていった…' },
        ],
        choices: [
          { text: 'あいりも一緒にバスケする？', affection: 15 },
          { text: 'みどりと話してたんだけど…', affection: -5 },
          { text: '（黙ってその場を去る）', affection: 0 },
        ],
        choiceResponses: [
          [{ speaker: 'airi', text: 'わーい！二人っきりでバスケだね💕 ずっとこうしてたいな…' }],
          [{ speaker: 'airi', text: '…そう。みどりちゃんと。ふーん。…まあいいけど。' }],
          [{ speaker: 'airi', text: 'あ、待って！ …行っちゃった。でも大丈夫、次の場所も知ってるから。' }],
        ]
      },
      library: {
        intro: [
          { speaker: 'narrator', text: '図書室は静かで落ち着く。' },
          { speaker: 'reina', text: 'あ…来てくれたの。この本、おすすめなんだけど…' },
        ],
        interrupt: [
          { speaker: 'narrator', text: '本棚の隙間から視線を感じる。' },
          { speaker: 'airi', text: 'わ～！奇遇だね！私もこの本探してたの！', burst: true },
          { speaker: 'reina', text: 'え、これ中世ヨーロッパの拷問史だけど…' },
          { speaker: 'airi', text: 'れいなちゃん、そろそろ返却期限の本あるんじゃない？受付行った方がいいよ？' },
          { speaker: 'narrator', text: 'れいなは不思議そうな顔で去っていった…' },
        ],
        choices: [
          { text: 'あいりは読書好きなの？', affection: 10 },
          { text: 'れいなと話してたんだけど', affection: -5 },
          { text: '（本で顔を隠す）', affection: 0 },
        ],
        choiceResponses: [
          [{ speaker: 'airi', text: 'うん！…っていうか、キミの読む本は全部読んでるよ？ 趣味が合うよね！' }],
          [{ speaker: 'airi', text: 'れいなちゃんね…。彼女、暗い本ばっかり読んでるよ？ 私の方がもっと楽しいよ？' }],
          [{ speaker: 'airi', text: 'あはは、かわいい。隠れても見つけちゃうけどね。' }],
        ]
      },
      roof: {
        intro: [
          { speaker: 'narrator', text: '屋上は風が気持ちいい。' },
          { speaker: 'hikari', text: 'やっほー！お弁当一緒に食べよ！' },
        ],
        interrupt: [
          { speaker: 'narrator', text: '階段の方から足音が近づいてくる。' },
          { speaker: 'airi', text: 'あれ～？こんなところで何してるの？お弁当？私も持ってきたよ！', burst: true },
          { speaker: 'hikari', text: '…え、なんで知って…' },
          { speaker: 'airi', text: 'ひかりちゃん、教室で友達が呼んでたよ？急いだ方がいいかも？' },
          { speaker: 'narrator', text: 'ひかりは走って教室に戻っていった…' },
        ],
        choices: [
          { text: 'あいりの弁当、おいしそうだね', affection: 15 },
          { text: 'ひかりを呼んでた人って誰？', affection: -10 },
          { text: '（お弁当を黙々と食べる）', affection: 5 },
        ],
        choiceResponses: [
          [{ speaker: 'airi', text: 'えへへ、キミの好きなもの全部入れたの！…あ、好きなもの？もちろん知ってるよ？' }],
          [{ speaker: 'airi', text: '…さあ？ 誰だったかな。まあ、二人の時間の方が大切でしょ？' }],
          [{ speaker: 'airi', text: '…もぐもぐ。同じお弁当食べてるね。同じお米、同じ卵焼き。奇遇だね💕' }],
        ]
      },
      garden: {
        intro: [
          { speaker: 'narrator', text: '中庭の桜が綺麗に咲いている。' },
          { speaker: 'narrator', text: '誰もいないと思ったのに…' },
        ],
        interrupt: [
          { speaker: 'airi', text: '見つけた💕', burst: true },
          { speaker: 'airi', text: 'ここに来ると思ってたよ。だって、朝キミの机に置いてあった本のしおりが桜の柄だったから。' },
          { speaker: 'narrator', text: '（なぜそんなことまで知っているのか…）' },
        ],
        choices: [
          { text: '桜、きれいだね', affection: 20 },
          { text: 'なんで僕の持ち物を知ってるの…？', affection: -5 },
          { text: '一人になりたかったんだけど', affection: -10 },
        ],
        choiceResponses: [
          [{ speaker: 'airi', text: 'うん…キミと見る桜は特別。この瞬間を永遠にしたいな…' }],
          [{ speaker: 'airi', text: 'え？ だって好きな人のことは何でも知りたいじゃない。普通でしょ？' }],
          [{ speaker: 'airi', text: '一人？ 一人って何？ 私がいるのに一人なわけないじゃん。あはは。' }],
        ]
      }
    },
    2: {
      dayTitle: '火曜日',
      daySub: '今日もあの子の気配がする…',
      gym: {
        intro: [
          { speaker: 'narrator', text: '体育館にみどりがいる。' },
          { speaker: 'midori', text: 'あ、昨日はごめんね。今日こそ一緒に…' },
        ],
        interrupt: [
          { speaker: 'airi', text: 'おっはよー！今日も来ちゃった！体育館ってなんか青春だよね！', burst: true },
          { speaker: 'midori', text: 'また…？ ねぇ、なんか毎回タイミング良すぎない…？' },
          { speaker: 'airi', text: 'タイミング？ 愛のタイミングだよ💕 みどりちゃんは鈍感だなぁ。' },
          { speaker: 'narrator', text: 'みどりはため息をついて練習に戻った。' },
        ],
        choices: [
          { text: 'あいり、今日もかわいいね', affection: 15 },
          { text: '偶然にしては多すぎない？', affection: -5 },
          { text: '（苦笑い）', affection: 5 },
        ],
        choiceResponses: [
          [{ speaker: 'airi', text: 'きゃっ！ そういうこと言われると…もっと好きになっちゃうよ？ いいの？' }],
          [{ speaker: 'airi', text: '偶然だよ？ …偶然を必然にしてるだけ。それって努力って言わない？' }],
          [{ speaker: 'airi', text: 'その笑顔、写真に撮っていい？ …あ、もう撮ってた。えへへ。' }],
        ]
      },
      library: {
        intro: [
          { speaker: 'narrator', text: '図書室に来た。' },
          { speaker: 'reina', text: '昨日の続き話せる？ あの本のラストがね…' },
        ],
        interrupt: [
          { speaker: 'narrator', text: '本棚が不自然に揺れた。' },
          { speaker: 'airi', text: 'あ！こんにちは！この棚の裏で本探してただけだよ！', burst: true },
          { speaker: 'reina', text: '…その棚、壁際で裏なんてないけど。' },
          { speaker: 'airi', text: 'れいなちゃん、先生が職員室で呼んでたよ？ 成績のことかな？' },
          { speaker: 'narrator', text: 'れいなは慌てて走り去った。（本当に呼ばれていたかは謎）' },
        ],
        choices: [
          { text: 'あいりと本の話がしたいな', affection: 15 },
          { text: '先生、本当にれいなを呼んでたの？', affection: -10 },
          { text: '（何も言わない）', affection: 0 },
        ],
        choiceResponses: [
          [{ speaker: 'airi', text: '嬉しい！ キミが先週読んでた小説の感想、聞かせて？ …背表紙見えたから知ってるの。' }],
          [{ speaker: 'airi', text: '…呼んでたよ？ きっと。たぶん。…ねぇ、れいなちゃんのことそんなに心配？' }],
          [{ speaker: 'airi', text: '静かな時間も好きだよ。キミの隣にいられるだけで幸せだから。' }],
        ]
      },
      roof: {
        intro: [
          { speaker: 'narrator', text: '屋上の扉を開ける。' },
          { speaker: 'hikari', text: '今日は先に来てたよ！ …って、あれ？' },
        ],
        interrupt: [
          { speaker: 'airi', text: '私も先に来てたよ💕 30分くらい前から。', burst: true },
          { speaker: 'hikari', text: 'さ、30分…？' },
          { speaker: 'airi', text: 'ひかりちゃん、SNSに屋上の写真あげてたでしょ？ 位置情報ONだったよ？ 気をつけてね。' },
          { speaker: 'narrator', text: 'ひかりは青ざめた顔で去っていった。' },
        ],
        choices: [
          { text: '30分も待っててくれたの？ ありがとう', affection: 20 },
          { text: 'ひかりのSNS見てるの…？', affection: -10 },
          { text: '風が気持ちいいね', affection: 5 },
        ],
        choiceResponses: [
          [{ speaker: 'airi', text: '30分なんて短いよ。キミのためなら何時間でも待てる。何年でも。' }],
          [{ speaker: 'airi', text: 'みんなのを見てるよ？ キミの周りにいる子のは特に。…情報収集って大事でしょ？' }],
          [{ speaker: 'airi', text: 'うん。キミの髪が風になびくの見てると、なんか…たまらない。' }],
        ]
      },
      garden: {
        intro: [
          { speaker: 'narrator', text: '中庭に来た。今日は誰もいなさそう…' },
        ],
        interrupt: [
          { speaker: 'airi', text: '今日もここに来てくれると思ってた。昨日と同じ時間に。', burst: true },
          { speaker: 'narrator', text: '（昨日の行動時間まで把握されている…）' },
        ],
        choices: [
          { text: 'あいりって記憶力いいね', affection: 10 },
          { text: 'ちょっと怖いんだけど…', affection: -5 },
          { text: '（もう慣れてきた）', affection: 10 },
        ],
        choiceResponses: [
          [{ speaker: 'airi', text: 'キミのことだけはね。他の教科は全然覚えられないのに。あはは。' }],
          [{ speaker: 'airi', text: '怖い…？ 怖くないよ。だって愛だもん。愛は怖くないでしょ？' }],
          [{ speaker: 'airi', text: '…慣れてくれた？ やった。これが日常になるのが夢だったの。' }],
        ]
      }
    },
    3: {
      dayTitle: '水曜日',
      daySub: '彼女の行動がエスカレートしてきた',
      gym: {
        intro: [
          { speaker: 'narrator', text: '体育館の前まで来た。' },
          { speaker: 'midori', text: 'ねぇ、あの子って何者…？ 今朝ロッカーの前にいたんだけど…' },
        ],
        interrupt: [
          { speaker: 'airi', text: 'みーつけた！ 今日のロッカーの暗証番号、変えた方がいいよ？誕生日はバレやすいから。', burst: true },
          { speaker: 'midori', text: 'っ！！ なんで私の暗証番号…！？ もう無理！', },
          { speaker: 'narrator', text: 'みどりは走り去った。ロッカーの暗証番号を変えるために。' },
        ],
        choices: [
          { text: 'あいりは心配性だね', affection: 10 },
          { text: 'ロッカーの番号知ってるの怖すぎ', affection: -10 },
          { text: '（もはやツッコミが追いつかない）', affection: 5 },
        ],
        choiceResponses: [
          [{ speaker: 'airi', text: '心配性…？ うん、キミのことが心配なの。キミの周りにいる子のセキュリティもね💕' }],
          [{ speaker: 'airi', text: '怖い？ 優しさだよ？ 防犯意識を高めてあげてるの。感謝してほしいくらい。' }],
          [{ speaker: 'airi', text: 'ツッコミ待ちじゃないんだけどな。まあいいや、二人きりになれたし。' }],
        ]
      },
      library: {
        intro: [
          { speaker: 'narrator', text: '図書室に入ると、れいなが青い顔をしている。' },
          { speaker: 'reina', text: 'ね、ねぇ…私の読書記録、誰かに見られてる気がするの…' },
        ],
        interrupt: [
          { speaker: 'airi', text: 'やっほー！ れいなちゃん、「人間失格」読んでるんだ？暗いね～！', burst: true },
          { speaker: 'reina', text: 'え…これ今日借りたばかりなのに…' },
          { speaker: 'airi', text: '図書室の貸出システム、セキュリティ甘いよね～。あ、独り言だよ。' },
          { speaker: 'narrator', text: 'れいなは本を抱えて逃げるように去った。' },
        ],
        choices: [
          { text: 'あいりはITに詳しいんだね', affection: 5 },
          { text: 'れいなの貸出記録を見たの…？', affection: -10 },
          { text: '（そっと距離を取る）', affection: -5 },
        ],
        choiceResponses: [
          [{ speaker: 'airi', text: 'うん、キミのSNSアカウント全部見つけるくらいには詳しいよ。鍵アカも。えへへ。' }],
          [{ speaker: 'airi', text: 'キミの周りの子が何考えてるか知りたかっただけだよ。敵を知れば百戦なんとかって言うでしょ。' }],
          [{ speaker: 'airi', text: '…あっ、離れないで。離れると寂しくて…何するかわかんなくなっちゃう。あはは冗談だよ。' }],
        ]
      },
      roof: {
        intro: [
          { speaker: 'narrator', text: '屋上に行こうとしたら、ひかりが階段で待っていた。' },
          { speaker: 'hikari', text: 'あのね、聞いてほしいことが…あの子のことなんだけど…' },
        ],
        interrupt: [
          { speaker: 'airi', text: '内緒話？ 私も混ぜて？', burst: true },
          { speaker: 'hikari', text: 'きゃっ！ い、いつからいたの！？' },
          { speaker: 'airi', text: 'ん～？ ひかりちゃんが階段に来た時から、かな。上の踊り場にいたの。' },
          { speaker: 'hikari', text: 'も、もういい！ 私帰る！' },
          { speaker: 'narrator', text: 'ひかりは涙目で走り去った。' },
        ],
        choices: [
          { text: 'あいり、みんな怖がってるよ', affection: -10 },
          { text: 'あいりは行動力あるね', affection: 10 },
          { text: '（ひかりが心配だ…）', affection: -5 },
        ],
        choiceResponses: [
          [{ speaker: 'airi', text: '怖がる？ なんで？ 私、キミ以外に興味ないのに。あの子たちが近づくから悪いんだよ？' }],
          [{ speaker: 'airi', text: '好きな人のためなら何だってできるよ。それが愛でしょ？' }],
          [{ speaker: 'airi', text: '…今、ひかりちゃんのこと考えた？ …目を見ればわかるよ。表情筋の動き0.3秒で読めるから。' }],
        ]
      },
      garden: {
        intro: [
          { speaker: 'narrator', text: '中庭に着いた瞬間、あいりが花壇の前にいた。' },
        ],
        interrupt: [
          { speaker: 'airi', text: 'おかえり💕 …あ、間違えた。こんにちは、だよね。まだ。', burst: true },
          { speaker: 'narrator', text: '（「おかえり」という言葉に背筋が凍る）' },
        ],
        choices: [
          { text: 'ただいま', affection: 25 },
          { text: '…「まだ」ってなに？', affection: -5 },
          { text: '花が綺麗だね（話をそらす）', affection: 5 },
        ],
        choiceResponses: [
          [{ speaker: 'airi', text: '…！ 今、すっごく嬉しい。心臓止まりそう。いつかこれが当たり前になるんだね…' }],
          [{ speaker: 'airi', text: '「まだ」は「まだ」だよ。今はね。でもいつか「おかえり」が自然になる日が来るから。' }],
          [{ speaker: 'airi', text: 'うん綺麗。でもキミの方が綺麗。…この花、キミの通学路に咲いてるのと同じ品種なんだよ。植えたの。' }],
        ]
      }
    },
    4: {
      dayTitle: '木曜日',
      daySub: 'もう逃げ場はない…のか？',
      gym: {
        intro: [
          { speaker: 'narrator', text: '体育館…みどりがいない。' },
          { speaker: 'narrator', text: '張り紙がある。「部活動見学者が多いため、当面の間関係者以外立入禁止」' },
        ],
        interrupt: [
          { speaker: 'airi', text: 'あ、みどりちゃん今日休みだよ。…知らなかった？ 私は知ってたけど。', burst: true },
          { speaker: 'narrator', text: '（なぜ知っている…）' },
        ],
        choices: [
          { text: 'あいりは何でも知ってるね', affection: 10 },
          { text: 'みどりに何かしたの…？', affection: -15 },
          { text: '二人で散歩でもする？', affection: 20 },
        ],
        choiceResponses: [
          [{ speaker: 'airi', text: 'キミに関することなら何でもね。みどりちゃんが風邪ひいたのは偶然だよ？ ほんとだよ？' }],
          [{ speaker: 'airi', text: '何もしてないよ！ ただ昨日の練習後に窓開けっぱなしだっただけ…。あ、これは関係ないか。' }],
          [{ speaker: 'airi', text: '…！！ 散歩！？ デート！？ やった！！ 行こ行こ！ どこでも！ 一生！！' }],
        ]
      },
      library: {
        intro: [
          { speaker: 'narrator', text: '図書室が閉まっている。張り紙。「システムメンテナンスのため休室」' },
        ],
        interrupt: [
          { speaker: 'airi', text: 'あ、図書室今日閉まってるんだ。残念だね～。', burst: true },
          { speaker: 'airi', text: 'でもね、れいなちゃんが好きそうな本、私が持ってるよ？ ……って、キミに貸すんだけどね。' },
          { speaker: 'narrator', text: '（図書室のシステムトラブル…まさか）' },
        ],
        choices: [
          { text: 'あいりが本を貸してくれるの？ 嬉しい', affection: 15 },
          { text: 'システムメンテナンスって…', affection: -5 },
          { text: '（深く考えないようにする）', affection: 5 },
        ],
        choiceResponses: [
          [{ speaker: 'airi', text: 'えへへ。キミの本棚と同じラインナップ揃えてあるから、何でも言ってね。' }],
          [{ speaker: 'airi', text: 'IT詳しいって褒めてくれたじゃん。…あ、これは無関係だからね？ 完全に偶然。' }],
          [{ speaker: 'airi', text: '考えなくていいよ。私がキミのこと全部考えてあげるから。頭の中、私で埋めてあげる。' }],
        ]
      },
      roof: {
        intro: [
          { speaker: 'narrator', text: '屋上に着いた。ひかりがいるが様子がおかしい。' },
          { speaker: 'hikari', text: '…SNSのアカウント、誰かに乗っ取られたかも。パスワード変えたのに…' },
        ],
        interrupt: [
          { speaker: 'airi', text: 'えー大変！ セキュリティ気をつけないとね！', burst: true },
          { speaker: 'hikari', text: '…もう関わらないで。お願いだから。' },
          { speaker: 'narrator', text: 'ひかりは携帯を握りしめて去っていった。' },
        ],
        choices: [
          { text: 'あいり、やりすぎだよ', affection: -10 },
          { text: 'あいりとLINE交換しようか', affection: 20 },
          { text: '（何も言えない）', affection: 0 },
        ],
        choiceResponses: [
          [{ speaker: 'airi', text: 'やりすぎ…？ 私何もしてないよ？ ひかりちゃんのパスワードが弱かっただけじゃない？' }],
          [{ speaker: 'airi', text: 'LINE！？ いいの！？ …あ、実はもうキミの連絡先知ってるんだけど。でも公式に交換したい！！' }],
          [{ speaker: 'airi', text: '何も言わなくていいよ。キミの心拍数で気持ちはわかるから。…ドキドキしてるでしょ？' }],
        ]
      },
      garden: {
        intro: [
          { speaker: 'narrator', text: '中庭のベンチにプレゼントが置いてある。手紙つき。' },
        ],
        interrupt: [
          { speaker: 'airi', text: '…開けて？', burst: true },
          { speaker: 'narrator', text: '手紙にはこう書いてあった。「毎日キミを見てると、キミの好きなものがわかるの。これ、欲しかったでしょ？」' },
          { speaker: 'narrator', text: '中身は…確かに昨日ネットで見ていたものだった。' },
        ],
        choices: [
          { text: 'ありがとう…嬉しいよ', affection: 20 },
          { text: '僕のネット履歴見てるの…？', affection: -10 },
          { text: '（受け取って黙る）', affection: 10 },
        ],
        choiceResponses: [
          [{ speaker: 'airi', text: '喜んでくれた…！ よかった…！ 次はキミの部屋に直接届けるね…あ、冗談だよ。たぶん。' }],
          [{ speaker: 'airi', text: '同じWi-Fiに繋がってるとね、ちょっとだけ見えちゃうことがあるの。ごめんね。でもやめないけど。' }],
          [{ speaker: 'airi', text: '…受け取ってくれた。それだけで十分。明日も用意するね。明後日も。ずっと。' }],
        ]
      }
    },
    5: {
      dayTitle: '金曜日',
      daySub: '最後の一日。すべてが決まる。',
      gym: {
        intro: [
          { speaker: 'narrator', text: '体育館…誰もいない。' },
        ],
        interrupt: [
          { speaker: 'airi', text: '誰もいないね。…私がいるけど。', burst: true },
          { speaker: 'airi', text: 'みんなね、今週で学んだみたい。キミの近くにいると私が来るって。' },
          { speaker: 'airi', text: 'だから最終日は…二人きり。最初からこうなる運命だったんだよ。' },
        ],
        choices: [
          { text: '運命…かもね', affection: 25 },
          { text: 'みんなを怖がらせたことは反省してほしい', affection: -5 },
          { text: '（もう抵抗しない）', affection: 10 },
        ],
        choiceResponses: [
          [{ speaker: 'airi', text: '…っ！ キミの口から「運命」って聞けるなんて…生きてて良かった…' }],
          [{ speaker: 'airi', text: '反省？ …うん、ちょっとやりすぎたかも。でもキミを独り占めするためなら、また同じことするよ。' }],
          [{ speaker: 'airi', text: '…抵抗しないの？ …ふふ。受け入れてくれるんだね。ずっと待ってた。' }],
        ]
      },
      library: {
        intro: [
          { speaker: 'narrator', text: '図書室。今日は開いているが、人の気配がない。' },
        ],
        interrupt: [
          { speaker: 'airi', text: 'しーっ。図書室は静かにしないとね。', burst: true },
          { speaker: 'airi', text: 'れいなちゃん、今日は別の図書館に行ってるよ。この学校の図書室に来ると私に会うって気づいたんだって。' },
          { speaker: 'airi', text: '…賢いよね。でも遅かったけど。' },
        ],
        choices: [
          { text: '二人で読書しよう', affection: 20 },
          { text: 'あいりには友達いないの…？', affection: -10 },
          { text: '（もう一周回って面白くなってきた）', affection: 15 },
        ],
        choiceResponses: [
          [{ speaker: 'airi', text: 'わーい！ 隣に座っていい？ …肩が触れる距離がいいな。' }],
          [{ speaker: 'airi', text: '友達？ いらないよ。キミがいれば世界は完成するの。他に何がいるの？' }],
          [{ speaker: 'airi', text: '…面白い？ あはは！ キミって本当に独特。好き。大好き。' }],
        ]
      },
      roof: {
        intro: [
          { speaker: 'narrator', text: '屋上。風が強い。誰もいない…はずがない。' },
        ],
        interrupt: [
          { speaker: 'airi', text: '最終日の屋上。ドラマみたいだね。', burst: true },
          { speaker: 'airi', text: 'ひかりちゃんはもう屋上に来ないってさ。高所恐怖症になったんだって。' },
          { speaker: 'narrator', text: '（原因は高所ではなく…）' },
        ],
        choices: [
          { text: '夕日がきれいだね…一緒に見よう', affection: 25 },
          { text: 'ひかりに謝ってあげて', affection: -5 },
          { text: '（風の音を聞く）', affection: 5 },
        ],
        choiceResponses: [
          [{ speaker: 'airi', text: 'きれい…。でも夕日よりキミの横顔の方がずっときれい。…写真撮っていい？ 128枚目だけど。' }],
          [{ speaker: 'airi', text: '謝る…？ キミがそう言うなら…考える。キミの言うことだけは聞くから。' }],
          [{ speaker: 'airi', text: '…キミの呼吸の音の方が好き。寝てる時の、すーすーって音。 …あ、これは言わない方がよかったかな。' }],
        ]
      },
      garden: {
        intro: [
          { speaker: 'narrator', text: '中庭。桜吹雪が舞っている。' },
          { speaker: 'narrator', text: 'もう最終日。ここに来れば確実にあの子がいる。' },
        ],
        interrupt: [
          { speaker: 'airi', text: 'ここに来てくれるって信じてた。…ううん、知ってた。', burst: true },
          { speaker: 'airi', text: '最終日にここを選んでくれたの、嬉しい。一番最初に会った場所だから。' },
          { speaker: 'airi', text: '…ねぇ、来週もこうやって会える？ 来月も、来年も…ずっと。' },
        ],
        choices: [
          { text: '…ずっと一緒にいよう', affection: 30 },
          { text: 'それはちょっと…', affection: -10 },
          { text: '（桜を見上げる）', affection: 5 },
        ],
        choiceResponses: [
          [{ speaker: 'airi', text: '…約束だよ？ 破ったら…ふふ。破れないようにするから大丈夫💕' }],
          [{ speaker: 'airi', text: '「ちょっと」…ね。完全な拒否じゃないでしょ？ その隙間に、私は入り込むよ。' }],
          [{ speaker: 'airi', text: '桜、きれいだよね。来年も再来年も、キミとここで見たいな。…見るけどね。キミがどう思おうと。' }],
        ]
      }
    }
  };

  // ===== エンディング定義 =====
  var ENDINGS = [
    {
      id: 'pure-love',
      minAffection: 80,
      icon: '💕',
      title: '純愛エンド ～運命の赤い糸～',
      desc: 'あいりの一途な想いに、いつしか心を奪われていた。\n\n「最初は怖かった。でも…こんなに誰かに想われることなんてないって気づいたんだ。」\n\nあいりは泣きながら笑った。\n「ずっと待ってた…キミがこっちを向いてくれる日を。」\n\n二人は手を繋いで帰路についた。\n\n※あいりの監視は続いています。ただし本人は「愛」と呼んでいます。'
    },
    {
      id: 'codependence',
      minAffection: 50,
      icon: '🔗',
      title: '共依存エンド ～離れられない二人～',
      desc: '気づけば、あいりのいない日常が想像できなくなっていた。\n\n「あいり、今日はどこにいるの…？」\n「え？ キミが私を探してくれるの？ 嬉しい…！」\n\nもはやどちらがストーカーかわからない。\nお互いなしでは生きていけない、歪だけど確かな関係が始まった。\n\n※共依存は健全な関係ではありません。でも二人は幸せそうです。'
    },
    {
      id: 'give-up',
      minAffection: 25,
      icon: '😶',
      title: '諦観エンド ～もう抗わない～',
      desc: '抵抗するのをやめた。逃げても無駄だと悟ったから。\n\n「ねぇ、最近キミ、私から逃げなくなったよね？」\n「…うん。」\n「それって…受け入れてくれたってこと？」\n「…そうかもね。」\n\nあいりは花が咲くように笑った。\n諦めと受容の境界線は、案外曖昧なものだった。\n\n※これを「幸せ」と呼んでいいのかは読者の判断に委ねます。'
    },
    {
      id: 'captured',
      minAffection: -999,
      icon: '🔒',
      title: '監禁エンド ～逃がさない～',
      desc: '最後まで拒否し続けた。でもそれは逆効果だった。\n\n「嫌い？ 嫌いなの？ …嫌いでもいいよ。\nだって逃がさないから。」\n\nある日、目が覚めると知らない部屋にいた。\n窓のない、桜の香りがする部屋。\n\n「おはよう💕 今日からここがキミのおうちだよ。\nずっと一緒。永遠に。」\n\n※Bad Endとは言ってない。あいりにとってはTrue Endです。'
    }
  ];

  // ===== ゲーム状態 =====
  var state = {
    day: 1,
    affection: 30,
    maxAffection: 100,
    visitedToday: false
  };

  // ===== DOM参照 =====
  var screens = {
    title: document.getElementById('title-screen'),
    dayIntro: document.getElementById('day-intro'),
    location: document.getElementById('location-screen'),
    dialogue: document.getElementById('dialogue-screen'),
    ending: document.getElementById('ending-screen')
  };
  var affectionBar = document.getElementById('affection-bar');
  var affectionFill = document.getElementById('affection-fill');
  var dayBadge = document.getElementById('day-badge');
  var glitchOverlay = document.getElementById('glitch-overlay');

  // ===== 画面切り替え =====
  function showScreen(id) {
    Object.keys(screens).forEach(function (k) {
      screens[k].classList.remove('active');
    });
    screens[id].classList.add('active');
  }

  // ===== 好感度更新 =====
  function updateAffection(delta) {
    state.affection = Math.max(0, Math.min(state.maxAffection, state.affection + delta));
    affectionFill.style.width = state.affection + '%';
  }

  function showUI(visible) {
    if (visible) {
      affectionBar.classList.add('visible');
      dayBadge.classList.add('visible');
    } else {
      affectionBar.classList.remove('visible');
      dayBadge.classList.remove('visible');
    }
  }

  // ===== 桜パーティクル =====
  function spawnSakura() {
    var container = document.getElementById('sakura-container');
    for (var i = 0; i < 12; i++) {
      var petal = document.createElement('span');
      petal.className = 'sakura';
      petal.textContent = '🌸';
      petal.style.left = Math.random() * 100 + '%';
      petal.style.animationDuration = (4 + Math.random() * 6) + 's';
      petal.style.animationDelay = (Math.random() * 8) + 's';
      petal.style.fontSize = (0.8 + Math.random() * 0.8) + 'rem';
      container.appendChild(petal);
    }
  }
  spawnSakura();

  // ===== グリッチエフェクト =====
  function playGlitch() {
    glitchOverlay.classList.add('active');
    setTimeout(function () {
      glitchOverlay.classList.remove('active');
    }, 350);
  }

  // ===== 効果音（Web Audio API） =====
  var audioCtx = null;
  function ensureAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  function playSfx(type) {
    try {
      var ctx = ensureAudio();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'stalker') {
        osc.type = 'sawtooth';
        osc.frequency.value = 200;
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'choice') {
        osc.type = 'triangle';
        osc.frequency.value = 523;
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'ending') {
        osc.type = 'sine';
        osc.frequency.value = 440;
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
        osc.start();
        osc.stop(ctx.currentTime + 1);
      }
    } catch (e) { /* silent */ }
  }

  // ===== ゲーム開始 =====
  document.getElementById('btn-start').addEventListener('click', function () {
    state.day = 1;
    state.affection = 30;
    updateAffection(0);
    sg.onGameStart();
    startDay();
  });

  // ===== 日の開始 =====
  function startDay() {
    var scenario = SCENARIOS[state.day];
    dayBadge.textContent = scenario.dayTitle + ' (Day ' + state.day + '/5)';

    document.getElementById('day-intro-text').textContent = scenario.dayTitle;
    document.getElementById('day-intro-sub').textContent = scenario.daySub;

    showScreen('dayIntro');
    showUI(false);

    setTimeout(function () {
      showUI(true);
      showLocationSelect();
    }, 1800);
  }

  // ===== 場所選択表示 =====
  function showLocationSelect() {
    var scenario = SCENARIOS[state.day];
    document.getElementById('location-header').textContent = scenario.dayTitle + ' ― どこに行く？';

    var grid = document.getElementById('location-grid');
    grid.innerHTML = '';

    LOCATIONS.forEach(function (loc) {
      var btn = document.createElement('button');
      btn.className = 'location-btn';
      btn.innerHTML = '<span class="location-emoji">' + loc.emoji + '</span>' +
        '<span>' + loc.name + '</span>' +
        '<span class="location-hint">' + loc.hint + '</span>';
      btn.addEventListener('click', function () {
        playSfx('click');
        startDialogue(loc.id);
      });
      grid.appendChild(btn);
    });

    showScreen('location');
  }

  // ===== 会話シーン =====
  var dialogueQueue = [];
  var currentChoices = null;
  var currentChoiceResponses = null;
  var dialogueCallback = null;

  function startDialogue(locationId) {
    var scenario = SCENARIOS[state.day];
    var scene = scenario[locationId];
    var loc = LOCATIONS.find(function (l) { return l.id === locationId; });

    document.getElementById('scene-location').textContent = loc.emoji + ' ' + loc.name;

    // 場所に応じた背景色
    var bgColors = {
      gym: 'linear-gradient(180deg, #e8d0b0 0%, #f5e6d0 30%, #fff5eb 100%)',
      library: 'linear-gradient(180deg, #d0d8e8 0%, #e6ecf5 30%, #f0f4ff 100%)',
      roof: 'linear-gradient(180deg, #87CEEB 0%, #b0d8f5 30%, #e6f0ff 100%)',
      garden: 'linear-gradient(180deg, #d5e8d0 0%, #e6f5e0 30%, #fce4ec 100%)'
    };
    screens.dialogue.style.background = bgColors[locationId] || '';

    // キャラクター表示エリアをリセット
    var charArea = document.getElementById('character-area');
    charArea.innerHTML = '';

    // 会話キュー構築
    dialogueQueue = [];
    currentChoices = null;
    currentChoiceResponses = null;

    // イントロ会話
    if (scene.intro) {
      scene.intro.forEach(function (line) {
        dialogueQueue.push(line);
      });
    }

    // ストーカー割り込み
    if (scene.interrupt) {
      scene.interrupt.forEach(function (line) {
        dialogueQueue.push(line);
      });
    }

    // 選択肢
    currentChoices = scene.choices;
    currentChoiceResponses = scene.choiceResponses;

    showScreen('dialogue');
    advanceDialogue();
  }

  function advanceDialogue() {
    if (dialogueQueue.length === 0) {
      // 選択肢を表示
      if (currentChoices) {
        showChoices();
      }
      return;
    }

    var line = dialogueQueue.shift();
    var nameEl = document.getElementById('dialogue-name');
    var textEl = document.getElementById('dialogue-text');
    var advanceEl = document.getElementById('dialogue-advance');
    var choicesEl = document.getElementById('choices-container');

    choicesEl.classList.add('hidden');
    advanceEl.classList.remove('hidden');

    // バーストエフェクト（ストーカー登場）
    if (line.burst) {
      playGlitch();
      playSfx('stalker');
      showCharacter('airi', 'stalker-burst');
    }

    // キャラ表示の管理
    if (line.speaker && line.speaker !== 'narrator') {
      highlightCharacter(line.speaker);
    }

    // 名前表示
    if (line.speaker === 'narrator') {
      nameEl.className = 'dialogue-name narrator';
      nameEl.textContent = '';
    } else {
      var ch = CHARS[line.speaker];
      nameEl.className = 'dialogue-name ' + ch.color;
      nameEl.textContent = ch.emoji + ' ' + ch.name;
    }

    // テキスト表示（タイプライター風）
    textEl.textContent = '';
    typeText(textEl, line.text, 0);
  }

  function typeText(el, text, index) {
    if (index < text.length) {
      el.textContent += text.charAt(index);
      typeTextTimer = setTimeout(function () {
        typeText(el, text, index + 1);
      }, 30);
    }
  }
  var typeTextTimer = null;

  // タップ/クリックで会話進行
  document.getElementById('dialogue-screen').addEventListener('click', function (e) {
    // 選択肢ボタンのクリックは除外
    if (e.target.classList.contains('choice-btn')) return;

    var textEl = document.getElementById('dialogue-text');
    // タイプ中なら即時表示
    if (typeTextTimer) {
      clearTimeout(typeTextTimer);
      typeTextTimer = null;
      // 現在のキューからテキストを復元（既に shift されてるので現在表示中のテキストを使う）
      return;
    }

    if (dialogueQueue.length > 0 || currentChoices) {
      advanceDialogue();
    } else if (dialogueCallback) {
      var cb = dialogueCallback;
      dialogueCallback = null;
      cb();
    }
  });

  // ===== キャラクター表示 =====
  function showCharacter(charId, animClass) {
    var charArea = document.getElementById('character-area');
    var ch = CHARS[charId];
    var existing = charArea.querySelector('[data-char="' + charId + '"]');

    if (!existing) {
      var sprite = document.createElement('div');
      sprite.className = 'character-sprite center';
      if (animClass) sprite.classList.add(animClass);
      sprite.dataset.char = charId;
      sprite.textContent = ch.emoji;
      charArea.appendChild(sprite);

      // 複数キャラがいる場合は位置調整
      repositionCharacters();
    }
  }

  function highlightCharacter(charId) {
    var charArea = document.getElementById('character-area');
    var ch = CHARS[charId];

    // まだ表示されていなければ追加
    if (!charArea.querySelector('[data-char="' + charId + '"]')) {
      var anim = charId === 'airi' ? 'stalker-burst' : 'enter-left';
      showCharacter(charId, anim);
    }
  }

  function repositionCharacters() {
    var charArea = document.getElementById('character-area');
    var sprites = charArea.querySelectorAll('.character-sprite');

    if (sprites.length === 1) {
      sprites[0].style.left = '50%';
      sprites[0].style.right = '';
      sprites[0].style.transform = 'translateX(-50%)';
    } else if (sprites.length >= 2) {
      sprites[0].style.left = '15%';
      sprites[0].style.right = '';
      sprites[0].style.transform = '';
      sprites[1].style.left = '';
      sprites[1].style.right = '15%';
      sprites[1].style.transform = '';
    }
  }

  // ===== 選択肢表示 =====
  function showChoices() {
    var choicesEl = document.getElementById('choices-container');
    var advanceEl = document.getElementById('dialogue-advance');
    advanceEl.classList.add('hidden');
    choicesEl.classList.remove('hidden');
    choicesEl.innerHTML = '';

    currentChoices.forEach(function (choice, i) {
      var btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = choice.text;
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        playSfx('choice');
        selectChoice(i);
      });
      choicesEl.appendChild(btn);
    });
  }

  function selectChoice(index) {
    var choice = currentChoices[index];
    var responses = currentChoiceResponses[index];

    // 好感度更新
    updateAffection(choice.affection);

    // 選択肢を非表示
    document.getElementById('choices-container').classList.add('hidden');
    document.getElementById('dialogue-advance').classList.remove('hidden');

    // 返答をキューに入れる
    currentChoices = null;
    currentChoiceResponses = null;
    dialogueQueue = responses.slice();

    // 返答後の処理
    dialogueCallback = function () {
      // 次の日へ or エンディング
      if (state.day >= 5) {
        showEnding();
      } else {
        state.day++;
        startDay();
      }
    };

    advanceDialogue();
  }

  // ===== エンディング =====
  function showEnding() {
    showUI(false);
    playSfx('ending');

    var ending = null;
    for (var i = 0; i < ENDINGS.length; i++) {
      if (state.affection >= ENDINGS[i].minAffection) {
        ending = ENDINGS[i];
        break;
      }
    }

    document.getElementById('ending-icon').textContent = ending.icon;
    document.getElementById('ending-title').textContent = ending.title;
    document.getElementById('ending-desc').textContent = ending.desc;

    // ハート表示
    var hearts = '';
    var fullHearts = Math.floor(state.affection / 20);
    for (var h = 0; h < 5; h++) {
      hearts += h < fullHearts ? '❤️' : '🖤';
    }
    document.getElementById('ending-hearts').textContent = hearts;

    // シェアボタン
    var shareText = '【ヤンデレ学園】\n' + ending.title + ' ' + ending.icon + '\n好感度: ' + hearts + '\n\n逃げられない学園ラブを体験しよう！\n#シュールゲームス #ヤンデレ学園';
    var shareUrl = window.location.href;
    document.getElementById('share-btn').href = 'https://x.com/intent/tweet?text=' + encodeURIComponent(shareText) + '&url=' + encodeURIComponent(shareUrl);

    sg.onGameEnd(state.affection, { endingId: ending.id, endingTitle: ending.title });

    showScreen('ending');
  }

  // ===== リトライ =====
  document.getElementById('btn-retry').addEventListener('click', function () {
    showScreen('title');
  });

  // ===== SurrealGames初期化 =====
  var sg = SurrealGames.init('yandere-gakuen');

})();
