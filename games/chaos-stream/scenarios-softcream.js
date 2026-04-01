/* ソフトクリーム シナリオ（3日間・各日3選択・激ムズ・全選択肢おかしい） */
window.softcreamScenes = {
  // ========== DAY 1: サプリで月収100万円 ==========
  intro: { live: true, animation: 'shake', streamTitle: '【衝撃】このサプリで月収100万円！？',
    text: 'ソフトクリームがYouTube配信を始めた。\n\nソフトクリーム「皆さん！今日は人生を変える\nサプリメントを紹介します！\nこれを飲めば月収100万円も夢じゃない！」\n\n…開始3秒でアンチコメントが殺到している。',
    chatFlood: ['【ア】通報した','【ア】詐欺師','【ア】BANしろ','【ア】マルチ乙','ん？','【ア】消えろ'],
    choices: [
      { label: '「このサプリで第三の目が開きました」と言わせる', popularity: -3, subscribers: 1, viewers: 15, chatFlood: ['【ア】第三の目www','おもしろ','【ア】スピ詐欺'], next: 'sc_d1_s2a' },
      { label: 'サプリを砕いてチャーハンに混ぜるクッキング配信にする', popularity: 3, subscribers: 2, viewers: 18, chatFlood: ['チャーハンwww','【ア】それ食うの','斬新すぎるw'], next: 'sc_d1_s2b' },
      { label: 'サプリの箱300個でジェンガタワーを建設する', popularity: 4, subscribers: 2, viewers: 12, chatFlood: ['ジェンガwww','在庫300箱www','面白いw'], next: 'sc_d1_s2c' }
    ] },

  sc_d1_s2a: { text: 'ソフトクリーム「このサプリで第三の目が開いて…\n未来が見えます！明日の天気は…曇りのち晴れ！」\n\nアンチ「それ天気予報で言ってたやつ」\nアンチ「第三の目で天気予報見るなw」\n\n一部の視聴者がウケている。',
    animation: 'spin', glitch: true, viewerDelta: 10,
    chatFlood: ['【ア】天気予報www','ちょっと面白いw','第三の目w','【ア】サプリ関係ない'],
    choices: [
      { label: '第三の目で視聴者の今日の晩ごはんを占わせる', popularity: -1, subscribers: 2, viewers: 12, chatFlood: ['占いwww','当たるの？w','カレー！','【ア】占い師になれ'], next: 'sc_d1_s3a' },
      { label: '第三の目でアンチの正体を暴くと宣言させる', popularity: -5, subscribers: 1, viewers: 20, chatFlood: ['【ア】暴くなw','煽ってるwww','【ア】こっち見るな'], next: 'sc_d1_s3b' }
    ] },

  sc_d1_s2b: { text: 'サプリを砕いてチャーハンに混ぜた。\n不気味な緑色のスーパーチャーハン完成。\n\nソフトクリーム「もぐもぐ……\n…………まずい。すごくまずい。」\n\n正直すぎるリアクション。涙目になっている。',
    animation: 'shake', viewerDelta: 15,
    chatFlood: ['正直www','まずいんかいw','嘘つけないのw','【ア】ちょっとかわいい'],
    choices: [
      { label: '「まずさを点数化するコーナー」を始めさせる（10段階でマイナス3）', popularity: 3, subscribers: 2, viewers: 10, chatFlood: ['マイナス3www','点数化w','正直すぎるw'], next: 'sc_d1_s3a' },
      { label: '視聴者にサプリ料理のレシピを募集させる', popularity: 1, subscribers: 3, viewers: 8, chatFlood: ['レシピ…','カレーに入れてw','味噌汁は？','【ア】食うなw'], next: 'sc_d1_s3b' }
    ] },

  sc_d1_s2c: { text: 'サプリの箱300個でジェンガタワー建設中。\n\nソフトクリーム「高さ2メートルまで積めたら…\n月収100万円分の在庫が視覚化されます…」\n\n在庫の量に視聴者がドン引き。\n…そして盛大に崩壊。サプリが部屋中に散乱。\n\nソフトクリーム「……在庫の雪崩です……」',
    animation: 'spin', viewerDelta: 18,
    chatFlood: ['崩壊www','在庫の雪崩www','300箱って…','【ア】在庫抱えすぎ'],
    choices: [
      { label: '「在庫アート」としてサプリの箱でピラミッドを作らせる', popularity: 3, subscribers: 2, viewers: 10, chatFlood: ['ピラミッドw','在庫アートw','エジプトかよ'], next: 'sc_d1_s3a' },
      { label: 'サプリの箱をドミノにして倒させる', popularity: 5, subscribers: 1, viewers: 15, chatFlood: ['ドミノ！','おおお','きれいに倒れたw','面白い'], next: 'sc_d1_s3b' }
    ] },

  sc_d1_s3a: { text: 'おかしな方向に脱線した配信が、なぜかじわじわ面白くなってきた。\n\nアンチ「マルチは最悪だけど…こいつ面白いな…」\nアンチ「認めたくないけどちょっと笑ったわ…」\n\nソフトクリームは気づいていないが、\n「面白いマルチ配信者」という謎のポジションが確立されつつある。',
    animation: 'happy', viewerDelta: 10,
    chatFlood: ['面白いw','【ア】認めたくないが…','じわるw','なんだこの配信w'],
    choices: [
      { label: '調子に乗って「マルチあるある」を語らせる', popularity: -2, subscribers: 3, viewers: 12, chatFlood: ['あるあるw','【ア】あるあるやめろw','面白いw'], next: 'sc_d1_end' },
      { label: 'サプリを使った謎の体操「サプリ体操」を考案させる', popularity: 5, subscribers: 2, viewers: 10, chatFlood: ['サプリ体操www','なにそれw','やりたいw','健康的w'], next: 'sc_d1_end' }
    ] },

  sc_d1_s3b: { text: 'さらにカオスが加速する配信。\n\nチャットが2つの勢力に割れている。\nアンチ勢「通報しろ」\nエンタメ勢「面白いからもっとやれw」\n\nソフトクリーム「えーと…皆さん仲良くしてください…\n…あ、またサプリ落とした…」\n\nサプリを拾いながらオドオドするソフトクリーム。\nなぜかそのドジっぷりに癒される視聴者が増えている。',
    animation: 'shake', viewerDelta: 12,
    chatFlood: ['ドジっ子','【ア】なんか憎めない…','拾ってるのかわいいw','カオスwww'],
    superchats: [{ name: '匿名', amount: 500, message: 'マルチはダメだけど応援してる' }],
    choices: [
      { label: '「最後にサプリの正しい飲み方」を真面目に説明させる（用法用量を守って）', popularity: 3, subscribers: 3, viewers: 5, chatFlood: ['真面目w','用法用量w','急にまともw'], next: 'sc_d1_end' },
      { label: 'サプリの箱でお城を作りながら「ここに住みたい」と夢を語らせる', popularity: 2, subscribers: 2, viewers: 8, chatFlood: ['お城www','住むなw','夢がサプリ城w'], next: 'sc_d1_end' }
    ] },

  // --- DAY 1 病み ---
  sc_d1_end: { yami: true, animation: 'shake', streamTitle: '（配信終了後…）',
    text: '初日の配信が終わった。\n\nソフトクリームがサプリの箱に囲まれて座り込んでいる。\n\n「…友達から『配信やめろ、恥ずかしい』ってLINE来た…\n家族にも『マルチなんかやめなさい』って言われた…\n上の人からは『もっと売れ』って…\n誰も…私の味方がいない…」\n\nソフトクリームが病んでいる！どうする！？',
    choices: [
      { label: 'サプリの箱300個で秘密基地を作って「ここが新しい家だ！誰も入れない！」と宣言する', popularity: 4, subscribers: 2, next: 'sc_cheer1a' },
      { label: '友達のLINEに「お詫びにサプリ10箱送りましょう！」と提案する', popularity: -3, subscribers: 1, next: 'sc_cheer1b' },
      { label: 'サプリの山の前で「これがあなたの努力の結晶だ！」と謎に壮大なスピーチをする', popularity: 3, subscribers: 2, next: 'sc_cheer1c' }
    ] },
  sc_cheer1a: { animation: 'happy',
    text: 'サプリの箱300個で秘密基地を建設！\n\n「見て！壁も天井もサプリ！完璧な要塞！\n友達も家族も上の人もここには入れない！安全！」\n\nソフトクリーム「…基地の中、サプリの匂いがすごい…\n換気が必要…でも…なんか楽しい…\n子供の頃、段ボールで家作ったの思い出した…ふふ」\n\n少し元気になった。基地は翌日崩壊した。',
    next: 'sc_d2_transition' },
  sc_cheer1b: { animation: 'shake',
    text: '「友達にサプリ10箱送りましょう！」\n\nソフトクリーム「それやったらもっと嫌われる！！\n…あなた、本当にマネージャー？\n大丈夫？頭にサプリ詰まってない？」\n\nツッコミのキレが良くなっている。\nキレのあるツッコミが出るということは、\n少しだけ元気が戻っている証拠だ。\n\nソフトクリーム「…はぁ…明日も頑張るか…」',
    next: 'sc_d2_transition' },
  sc_cheer1c: { animation: 'happy',
    text: 'サプリの山（300箱）の前で感動的なスピーチを始めた。\n\n「このサプリの一つ一つが…あなたの努力の結晶だ…\n300箱分の汗と涙が…ここに…（感動的なBGM想像）」\n\nソフトクリーム「いや在庫300箱は全然良くないんだけど…\n…でも、こんなバカなことして\n励まそうとしてくれるの…ちょっと嬉しい…」',
    next: 'sc_d2_transition' },

  // ========== DAY 2: 美容液を紹介…？ ==========
  sc_d2_transition: { dayTransition: 2, afterTransition: true, live: true, animation: 'shake',
    streamTitle: '【2日目】新商品の美容液を…紹介？',
    text: '2日目の配信スタート！\n懲りずにマルチ配信を続けるソフトクリーム。\n\nソフトクリーム「皆さん！今日は新商品の\n美容液を紹介します！…たぶん！\n…たぶんって言っちゃった…」\n\nアンチが待ち構えている。でも昨日の「面白い勢」も来た。',
    chatFlood: ['【ア】まだやるのか','【ア】懲りないな','昨日の人だ','面白かったから来たw','【ア】学習しろ'],
    choices: [
      { label: '美容液を頭からかぶって「全身美容！これで全身ツルツル！」と叫ばせる', popularity: -2, subscribers: 2, viewers: 20, chatFlood: ['かぶったwww','【ア】もったいない','体張ってるw','全身美容www'], next: 'sc_d2_s2a' },
      { label: '美容液でスライムを作って遊ばせる', popularity: 4, subscribers: 3, viewers: 12, chatFlood: ['スライムwww','楽しそう','【ア】商品を遊ぶな','実験だw'], next: 'sc_d2_s2b' },
      { label: 'アンチのコメントを全部「褒め言葉」に変換して読み上げさせる', popularity: 2, subscribers: 3, viewers: 15, chatFlood: ['変換www','【ア】褒めてない','ポジティブすぎw','面白いw'], next: 'sc_d2_s2c' }
    ] },

  sc_d2_s2a: { text: 'ソフトクリームが美容液を頭からかぶった！\n\n「全身美容！…ぬるぬるして気持ち悪い…\n…でも肌はツルツルになるはず…たぶん…\n…ぬるぬるで携帯が持てない…」\n\nアンチすら「体張りすぎだろ」と心配し始めた。',
    animation: 'spin', glitch: true, viewerDelta: 18,
    chatFlood: ['体張りすぎw','ぬるぬるw','【ア】…大丈夫か','携帯持てないのwww'],
    superchats: [{ name: '体張り芸人ファン', amount: 1000, message: '根性すごい' }],
    choices: [
      { label: 'ぬるぬるの手で美容液の成分を読み上げさせる（携帯が滑って3回落とす）', popularity: 3, subscribers: 3, viewers: 12, chatFlood: ['滑るwww','3回目www','読めてないw'], next: 'sc_d2_s3a' },
      { label: '「ぬるぬるチャレンジ」としてペットボトルを開ける挑戦をさせる', popularity: 5, subscribers: 2, viewers: 15, chatFlood: ['チャレンジw','開けられるの？','ぬるぬるで無理w'], next: 'sc_d2_s3b' }
    ] },

  sc_d2_s2b: { text: '美容液でスライムを作るソフトクリーム。\n\n「おお、本当にスライムになった！\nこの美容液、肌じゃなくてスライムには最適…！\n…あれ、これ商品の否定になってる…？」\n\n自分で商品をダメ出ししていることに気づいた。\n\nアンチ「自分でダメ出ししてて草」\n視聴者「正直すぎて逆に信頼できるw」',
    animation: 'happy', viewerDelta: 12,
    chatFlood: ['自分で否定w','正直すぎるw','信頼できるw','スライムかわいいw'],
    choices: [
      { label: 'スライムに名前をつけて「スラちゃん」として配信のマスコットにさせる', popularity: 5, subscribers: 4, viewers: 8, chatFlood: ['スラちゃんw','マスコットw','かわいいw'], next: 'sc_d2_s3a' },
      { label: 'スライムの触り心地をASMRっぽくレビューさせる', popularity: 3, subscribers: 3, viewers: 10, chatFlood: ['ASMRw','ぷにぷにw','癒される…？'], next: 'sc_d2_s3b' }
    ] },

  sc_d2_s2c: { text: 'アンチのコメントをポジティブ変換！\n\n「詐欺師」→「才能のある商売人！」\n「BANされろ」→「もっと目立て！つまり応援！」\n「目を覚ませ」→「覚醒しろ！パワーアップ！」\n\nアンチ「いや違うが？？？全然違うが？」\n\n強引すぎるが、メンタルの強さに感心する人が出てきた。',
    animation: 'happy', viewerDelta: 15,
    chatFlood: ['変換が強引www','メンタルお化け','【ア】違うが？？','ファンになりそうw'],
    choices: [
      { label: 'アンチの「通報しました」を「応援のスパチャありがとう！」に変換させる', popularity: -3, subscribers: 2, viewers: 15, chatFlood: ['スパチャじゃないwww','【ア】通報だよ','メンタル最強'], next: 'sc_d2_s3a' },
      { label: '「ポジティブ変換辞典」を作り始めさせる', popularity: 4, subscribers: 4, viewers: 10, chatFlood: ['辞典www','出版してw','面白い企画'], next: 'sc_d2_s3b' }
    ] },

  sc_d2_s3a: { text: '配信2日目、ソフトクリームのキャラが確立されてきた。\n\n「正直すぎるマルチ配信者」「メンタルお化け」「ドジっ子」\n\nアンチ「マルチはクソだけどこいつは面白い」という\n複雑な評価が定着しつつある。\n\nソフトクリーム「なんか…褒められてるのかな…\n…褒められてないよね…でも見てくれてるよね…？」',
    animation: 'happy', viewerDelta: 10,
    chatFlood: ['面白い','【ア】マルチはクソだが','キャラが立ってるw','応援したい'],
    superchats: [{ name: '匿名ファン', amount: 2000, message: 'マルチやめたらガチで応援する' }],
    choices: [
      { label: '「明日は大事なお知らせがあります」と意味深に予告させる', popularity: 5, subscribers: 5, viewers: 8, chatFlood: ['大事なお知らせ…？','辞めるの？','気になる！'], next: 'sc_d2_end' },
      { label: '「皆さんのおかげで今日も楽しかった！」と素直に感謝させる', popularity: 8, subscribers: 3, viewers: 5, chatFlood: ['いい子','素直','応援してるよ'], next: 'sc_d2_end' }
    ] },

  sc_d2_s3b: { text: 'おかしな企画がじわじわウケて、「エンタメ勢」が増殖中。\n\nまとめサイトに小さく取り上げられた。\n「マルチ配信者、スライムを作ったり体操を考案したり迷走中」\n\nソフトクリーム「まとめサイトに載った…！\n…でもタイトルが『迷走中』って…迷走してるのかな…してるか…」',
    animation: 'shake', viewerDelta: 15,
    chatFlood: ['まとめ載ったw','迷走中www','でも面白い','バズってるw'],
    choices: [
      { label: '「迷走こそが私の道！」と開き直らせる', popularity: 3, subscribers: 4, viewers: 10, chatFlood: ['開き直ったw','名言風w','迷走道www'], next: 'sc_d2_end' },
      { label: '「明日こそ真面目に配信します…たぶん」と予告させる', popularity: 5, subscribers: 5, viewers: 5, chatFlood: ['たぶんwww','期待','明日も面白いやつ頼む'], next: 'sc_d2_end' }
    ] },

  // --- DAY 2 病み ---
  sc_d2_end: { yami: true, animation: 'shake', streamTitle: '（配信終了後…）',
    text: '2日目の配信が終わった。ファンも少しずつ増えてきたのに…\n\nソフトクリームがまた病んでいる。\n\n「…上の人から電話がかかってきて…\n『もっと売れ』『お前のせいで売上落ちた』\n『ふざけた配信してないで真面目にやれ』って…\n私、何のために配信してるんだろう…\nサプリのため？上の人のため？…自分のためじゃない…」',
    choices: [
      { label: '上の人の物真似を全力でやって「こんなやつの言うこと気にするな！」と笑わせる', popularity: 6, subscribers: 4, next: 'sc_cheer2a' },
      { label: 'サプリの在庫を窓から投げ捨てる真似をして「自由になれ！」と叫ぶ（実際には投げない）', popularity: 8, subscribers: 2, next: 'sc_cheer2b' },
      { label: '「上の人を超えよう」と段ボールで高さ1mの台を作って物理的に上に立たせる', popularity: 4, subscribers: 3, next: 'sc_cheer2c' }
    ] },
  sc_cheer2a: { animation: 'happy',
    text: '上の人（おばさん）の物真似を全力で披露。\n\n「あら～もっと売りなさいよ～\n友達の友達の友達に売るのよ～\nサプリはね～人生を変えるのよ～（鼻声で）」\n\nソフトクリーム「…似てる…すごく似てる…\nでも笑っちゃダメ…笑っちゃ…ぶふっ…\nあはははは！おばさんってあんな感じだよね！\n…もう、あの人の言いなりにはならない…かも」',
    next: 'sc_d3_transition' },
  sc_cheer2b: { animation: 'happy',
    text: 'サプリを窓に向かって投げる真似をしながら叫んだ。\n\n「自由だー！！（投げてない）\nマルチなんかー！（投げてない）\nさよならー！！（投げてない）\n上の人もー！（投げてない）」\n\nソフトクリーム「…全部真似じゃん…\n本当に投げたら近所迷惑だもんね…\n…でもなんかスッキリした。\n明日は…自分のための配信をしたい…」',
    next: 'sc_d3_transition' },
  sc_cheer2c: { animation: 'happy',
    text: '段ボールで高さ1メートルの台を作った。\n\n「ここに立て！上の人より高い位置に！\n物理的に上に立てば、もう『上の人』じゃない！\nソフトクリームが一番上だ！」\n\nソフトクリーム「…物理で解決しようとしてる…\n（台に登って）…確かに見下ろす景色は気持ちいい…\n…ぷっ…バカだなぁ…でもありがとう」',
    next: 'sc_d3_transition' },

  // ========== DAY 3: 最終日・大事なお知らせ ==========
  sc_d3_transition: { dayTransition: 3, afterTransition: true, live: true, animation: 'shake',
    streamTitle: '【最終日】大事なお知らせがあります',
    text: '最終日。3日目の配信。\nソフトクリームの目が、今までと違う。\n\nソフトクリーム「…皆さん。今日は大事な話があります」\n\nチャットが静まった。アンチも黙っている。\n何かが起きる予感がする。',
    chatFlood: ['大事な話…？','やめるの？','どうした','静かに聞こう','気になる'],
    choices: [
      { label: '「今日でマルチ辞めます」と正面から宣言させて謝罪配信をする', popularity: 8, subscribers: 6, viewers: 10, chatFlood: ['おお！','やめるの！','偉い！'], next: 'sc_d3_s2a' },
      { label: '「全員の名前を第三の目で読み上げます」とアンチを煽らせる', popularity: -5, subscribers: 2, viewers: 30, chatFlood: ['【ア】やめろw','第三の目www','【ア】また始まった'], next: 'sc_d3_s2b' },
      { label: '「上の人を生配信に呼んで辞表を叩きつけます」と宣言させる', popularity: 4, subscribers: 4, viewers: 25, chatFlood: ['生辞表！？','リアリティショーw','見届ける！','すごい企画'], next: 'sc_d3_s2c' }
    ] },

  sc_d3_s2a: { text: 'ソフトクリーム「皆さん、ごめんなさい。\n3日間、マルチの商品を売ろうとして…\nたくさんの人に嫌な思いをさせました。\n…今日で、マルチを辞めます」\n\n涙を流しながらの謝罪。\nアンチたちが初めて静かに聞いている。',
    animation: 'shake', viewerDelta: 20,
    chatFlood: ['頑張れ','偉い','応援する','泣くな','よく言った'],
    superchats: [{ name: '元アンチの正義マン', amount: 5000, message: '謝れるのは強い。応援する。' }],
    choices: [
      { label: '「これからは料理配信にします！」と新しい道を宣言させる', popularity: 10, subscribers: 8, viewers: 10, chatFlood: ['料理配信！','応援する！','楽しみ！','カレー作って！'], next: 'sc_d3_s3_reform' },
      { label: '「何をやるかはまだ決めてないけど…マルチじゃないことだけは確か」と正直に言わせる', popularity: 8, subscribers: 10, viewers: 5, chatFlood: ['正直でいいね','一緒に探そう','応援するよ'], next: 'sc_d3_s3_reform' }
    ] },

  // ★ 第三の目ルート → 大物YouTuber → 100万人！
  sc_d3_s2b: { text: 'ソフトクリーム「第三の目、最終形態…！\n正義マンさん、あなたの本名は…田中…太郎…？」\n\nアンチ「違うが？全然違うが？」\n\n「じゃあ佐藤…花子…？」\n\nアンチ「全然違うわ」\n\n全然当たらない。しかしこのやり取りが面白すぎて\nまとめサイトに大きく載ってしまった。\n「マルチ配信者、第三の目でアンチの名前を当てようとして全外し」',
    animation: 'spin', glitch: true, viewerDelta: 80,
    chatFlood: ['全外しwww','まとめ載ったw','【ア】田中太郎じゃないw','バズってるw','視聴者増えすぎw'],
    superchats: [{ name: 'まとめサイト管理人', amount: 5000, message: 'PVありがとうw' }],
    choices: [
      { label: '大物YouTuber「ヒカキン風さん」にコラボを持ちかける', popularity: 8, subscribers: 15, viewers: 150, chatFlood: ['コラボ！？','大物と！？','歴史が動く','やばいwww'], next: 'sc_d3_s3_collab' },
      { label: 'バズりに乗じてサプリの宣伝をさらに強化する', popularity: -15, subscribers: -5, viewers: 30, chatFlood: ['【ア】ここで宣伝かよ','【ア】最悪','ダメだこりゃ'], danger: true, next: 'sc_ending_worst' },
      { label: '「第三の目で見えました…私はマルチを辞めるべきです」と悟らせる', popularity: 12, subscribers: 8, viewers: 20, chatFlood: ['悟ったw','第三の目の正しい使い方w','応援する'], next: 'sc_d3_s3_reform' }
    ] },

  sc_d3_s2c: { text: '上の人をZoomで生配信に呼び出した！\n\n上の人「あら～ソフトクリームちゃん～元気？」\n\nソフトクリーム「おばさん。大事な話があります」\n\n上の人「あら、何かしら？新商品のこと？」\n\n視聴者がザワザワしている。緊張感が漂う。',
    animation: 'shake', viewerDelta: 30,
    chatFlood: ['おばさんきた','緊張する','リアリティショーw','見守る'],
    choices: [
      { label: '「辞めます」とはっきり言わせる', popularity: 10, subscribers: 8, viewers: 10, chatFlood: ['言った！','かっこいい！','拍手！'], next: 'sc_d3_s3_quit' },
      { label: '「おばさん、実は私…配信が楽しいんです。サプリじゃなくて」と本音を言わせる', popularity: 8, subscribers: 6, viewers: 15, chatFlood: ['本音！','泣ける','いい話','おばさんどう出る？'], next: 'sc_d3_s3_honest' }
    ] },

  // --- DAY 3 クライマックス ---
  sc_d3_s3_reform: { text: 'ソフトクリームの「マルチ卒業宣言」に、\nチャットが温かいコメントで溢れた。\n\n「応援する」「待ってたよ」「よく決心した」\n\nアンチだった正義マンが初めて温かいコメントを残した。\n「…お前、いいやつだったんだな」\n\nソフトクリームの目から涙がこぼれた。',
    animation: 'happy', viewerDelta: 20,
    chatFlood: ['応援する','泣ける','いいやつ','正義マンが…','おめでとう'],
    superchats: [{ name: '正義マン（元アンチ）', amount: 5000, message: '今日からファンだ' }],
    choices: [
      { label: '感謝の言葉を一人ずつチャットに返させる', popularity: 10, subscribers: 10, viewers: 5, chatFlood: ['優しい','ありがとう','泣いた'], next: 'sc_ending_reform' },
      { label: '「マルチ卒業記念に…サプリでチャーハン最後に作ります！」と笑いで締めさせる', popularity: 8, subscribers: 8, viewers: 10, chatFlood: ['チャーハンwww','最後のサプリ飯w','まずいやつw','最高の締め'], next: 'sc_ending_reform' }
    ] },

  sc_d3_s3_collab: { text: 'ソフトクリームが震えながらヒカキン風さんにDMを送った。\n\n…なんと、返事が来た。\n\nヒカキン風さん「面白すぎるから行くわw\n今から配信に凸していい？」\n\nソフトクリーム「ええええ！？」\n\n大物YouTuberが凸してくる！！',
    animation: 'spin', glitch: true, viewerDelta: 400,
    chatFlood: ['凸くるぞ！','まじかよ！','ヒカキン風さん！','歴史的瞬間','鳥肌'],
    superchats: [{ name: 'ヒカキン風', amount: 50000, message: '面白い配信者発見！凸する！' }, { name: '古参アンチ', amount: 10000, message: '…負けた。認めるわ。' }],
    choices: [
      { label: 'ヒカキン風さんとのトークで自然にマルチ卒業の流れを作る', popularity: 10, subscribers: 10, viewers: 100, chatFlood: ['いいトーク！','優しい','神展開'], next: 'sc_d3_s3_collab_live' },
      { label: '「ヒカキン風さんもサプリ飲みませんか？」と営業する', popularity: -30, subscribers: -20, viewers: -300, chatFlood: ['【ア】ここで営業！？','【ア】空気読めなすぎ','終わったw'], danger: true, next: 'sc_ending_worst' }
    ] },

  sc_d3_s3_collab_live: { text: 'ヒカキン風さんが配信に登場！\n\nヒカキン風「ソフトクリームさん、サプリの話は\nアレだけどキャラが面白すぎるんだよなw\n第三の目で名前当てようとして全外しは天才だったw」\n\nソフトクリーム「ありがとうございます…\nでも私、マルチしか取り柄がなくて…」\n\nヒカキン風「いや、マルチじゃなくてトーク力がすごい！」\n\n登録者が爆発的に増加している！',
    animation: 'happy', viewerDelta: 800,
    chatFlood: ['神展開！','登録者爆増！','泣ける','100万人いくぞ！','ヒカキン風さん優しい'],
    superchats: [
      { name: 'ソフトクリームのお母さん', amount: 30000, message: 'お母さんも見てるよ。頑張って。' },
      { name: '正義マン（元アンチ）', amount: 10000, message: 'ファンになった。悔しい。' }
    ],
    choices: [
      { label: '「マルチ辞めます！みんなと楽しい配信がしたい！」と宣言させる', popularity: 50, subscribers: 50, viewers: 500,
        chatFlood: ['やったー！！','マルチ卒業！','100万人突破！','伝説','おめでとう！'],
        superchats: [{ name: 'ヒカキン風', amount: 100000, message: 'マルチ卒業おめ！これからも応援する！' }],
        next: 'sc_ending_legend' },
      { label: '「ヒカキン風さん、実はサプリの在庫が300箱あるんです…一緒に処分してくれませんか？」', popularity: 15, subscribers: 15, viewers: 100,
        chatFlood: ['在庫処分www','300箱www','ヒカキン風さん笑ってるw','いい話'],
        next: 'sc_ending_legend' }
    ] },

  sc_d3_s3_quit: { text: 'ソフトクリーム「おばさん。今日で辞めます。\n生配信で宣言します。もうサプリは売りません」\n\n上の人「え…ちょ…生配信で…？」\n\nソフトクリーム「はい。みんなの前で。さようなら」\n\n電話を切った。\nチャットが拍手の絵文字で埋まった。',
    animation: 'happy', viewerDelta: 30,
    chatFlood: ['かっこいい！','拍手！','よく言った！','泣いた','男前！'],
    superchats: [{ name: '元アンチ全員', amount: 10000, message: '認める。あんたはすごい。' }],
    next: 'sc_ending_reform' },

  sc_d3_s3_honest: { text: 'ソフトクリーム「おばさん、実は…\n私、配信自体は楽しいんです。\nみんなとおしゃべりするのが好きで…\nでもサプリの話をすると嫌われて…\n…だから、サプリはもう辞めます」\n\n上の人「…そう。寂しいけど…\n…あんた、楽しそうに配信してたもんね。\n…頑張りなさい」\n\n意外にも、上の人は優しかった。',
    animation: 'happy', viewerDelta: 25,
    chatFlood: ['おばさん優しい…','泣ける','いい話','応援する','良かったね'],
    superchats: [{ name: '上の人（おばさん）', amount: 5000, message: '応援してるわよ。サプリの在庫は引き取るから。' }],
    next: 'sc_ending_reform' },

  // ===== エンディング =====
  sc_ending_legend: { animation: 'happy', viewerDelta: 200,
    text: '【祝】登録者100万人突破！！！\n\nソフトクリーム「うそ…100万人…？\nマルチやってた時は登録者5人だったのに…」\n\nヒカキン風さん「マルチやめた瞬間が\nソフトクリームの人生の始まりだったんだよ」\n\nアンチだった正義マンが泣いている。\nソフトクリームも泣いている。全員泣いている。\n3日間の激動の配信が、伝説になった。',
    chatFlood: ['100万人！！','おめでとう！','伝説の配信','泣いた','正義マンも泣いてるw','歴史的瞬間'],
    superchats: [
      { name: 'ヒカキン風', amount: 100000, message: '100万人おめでとう！一緒に配信しよう！' },
      { name: '上の人（おばさん）', amount: 10000, message: 'おめでとう。在庫は全部処分したわ。' }
    ] },

  sc_ending_reform: { animation: 'happy', viewerDelta: 15,
    text: 'ソフトクリーム「3日間、ありがとうございました。\n\nマルチの話ばかりでごめんなさい。\nサプリをチャーハンにしたり…\n第三の目とか言い出したり…\n美容液かぶったり…迷走しまくりでした。\n\nでも、マネージャーさんのおかげで笑えたし…\nみんなのコメントに救われました。\n\nこれからは自分らしい配信を探します！\nマルチじゃないことだけは確か！」',
    chatFlood: ['おつかれ！','応援してる！','マルチ卒業おめ！','次の配信楽しみ','頑張れ！','ありがとう'],
    superchats: [{ name: '元アンチ', amount: 1000, message: '応援に切り替えるわ' }] },

  sc_ending_worst: { animation: 'shake', viewerDelta: -500,
    text: 'ヒカキン風さんが無言で配信を去った。\n\nソフトクリーム「あれ…行っちゃった…？\nサプリ、いらなかったですか…？」\n\n視聴者が一斉に去っていく。\n3日間の努力が水の泡に。\n\n…ソフトクリームは今日もサプリの在庫に囲まれている。\n（マネージャー失格！もう一回やり直そう！）',
    chatFlood: ['【ア】さようなら','【ア】自業自得','…','【ア】もう知らん','おつかれ…'] }
};
