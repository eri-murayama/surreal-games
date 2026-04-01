/* かにかに シナリオ（3日間・各日3選択） */
window.kanikanScenes = {
  // ========== DAY 1: シルバニア赤い屋根のお家を開封 ==========
  intro: { live: true, animation: 'happy', streamTitle: '【初配信】シルバニア赤い屋根のお家を開封！',
    text: 'かにかにが初めてのYouTube配信を始めた！\n\nかにかに「は、はじめまして…かにかにです。\n今日はシルバニアの赤い屋根の大きなお家を開封します！」\n\n視聴者がちらほら入ってきた。\nあなたはマネージャーとして応援しよう！',
    chatFlood: ['初見です！','かわいい！','シルバニア好き！','わくわく','声かわいいね'],
    superchats: [{ name: 'シルバニア好きおじさん', amount: 500, message: '開封楽しみ！' }],
    choices: [
      { label: 'ゆっくり丁寧に開封するようアドバイスする', popularity: 8, subscribers: 6, viewers: 8, chatFlood: ['丁寧！','ASMR感ある','癒される'], next: 'k_d1_s2a' },
      { label: 'テンション高めで一気に開封させる', popularity: 6, subscribers: 4, viewers: 12, chatFlood: ['おおお！','テンション高いw','楽しそう'], next: 'k_d1_s2b' },
      { label: '素手で豪快にビリビリ破かせる', popularity: 10, subscribers: 2, viewers: 20, chatFlood: ['ビリビリwww','豪快すぎw','箱がぁ！'], next: 'k_d1_s2c' }
    ] },

  k_d1_s2a: { text: 'かにかにが丁寧に箱を開けていく。\n\n「見てください…この小さなテーブルセット…かわいい…」\n\nチャットに「かにかにの手もシルバニアサイズで草」と。\n\nかにかに「手のサイズいじるのやめてください！」\n\n…ちょっとイラッとしてる。',
    animation: 'happy', viewerDelta: 10, chatFlood: ['手ちっちゃいw','癒される','かわいい'],
    superchats: [{ name: 'ミニチュア職人', amount: 1000, message: '丁寧な開封に感動' }],
    choices: [
      { label: 'シルバニアのミニ家具を使って「カニのおままごと」をさせる', popularity: 8, subscribers: 5, viewers: 10, chatFlood: ['おままごとw','カニがフライパン持ってるw','かわいい'], next: 'k_d1_s3a' },
      { label: 'ASMRっぽく小声で実況させる', popularity: 6, subscribers: 8, viewers: 5, chatFlood: ['ASMR！','ささやきかわいい','眠くなるw'], next: 'k_d1_s3b' }
    ] },

  k_d1_s2b: { text: 'かにかにがハイテンションで開封！\n\n「うおおお！ちっちゃいフライパン！最高！」\n\n興奮のあまりテーブルにぶつかり人形が吹っ飛んだ。\n\nかにかに「あっ…お父さんウサギが…行方不明…」\n\n視聴者は爆笑。',
    animation: 'shake', viewerDelta: 15, chatFlood: ['テンション高いw','吹っ飛んだwww','大丈夫？'],
    choices: [
      { label: '吹っ飛んだお父さんウサギの救出作戦を実況させる', popularity: 10, subscribers: 4, viewers: 15, chatFlood: ['救出作戦w','ドラマチックw','見つけて！'], next: 'k_d1_s3a' },
      { label: '「お父さんウサギは旅に出ました」とストーリーを作らせる', popularity: 8, subscribers: 6, viewers: 10, chatFlood: ['旅wwww','設定凝ってるw','帰ってくるの？'], next: 'k_d1_s3b' }
    ] },

  k_d1_s2c: { text: 'かにかにが素手で箱をビリビリに！\n\n「開封じゃああ！」\n\n箱が派手に破れ、小さなパーツが飛び散った。\n\nかにかに「あっ…小さい椅子が…3つ行方不明…」\n\n視聴者は爆笑しているが、かにかにの目が死んでいる。',
    animation: 'spin', viewerDelta: 20, chatFlood: ['wwwww','豪快すぎて草','椅子が！','シルバニア虐待w'],
    choices: [
      { label: '椅子の捜索配信に切り替える', popularity: 10, subscribers: 3, viewers: 20, chatFlood: ['捜索配信w','見つけて！','そこにある！'], next: 'k_d1_s3a' },
      { label: '「椅子は犠牲になったのだ…」と名言を言わせる', popularity: 6, subscribers: 8, viewers: 8, chatFlood: ['名言www','哲学的','深いw'], next: 'k_d1_s3b' }
    ] },

  k_d1_s3a: { text: '捜索（？）が一段落して、改めてシルバニアのお家を組み立てることに。\n\nかにかに「えーと、ここにベッドを…ここにテーブルを…\nあっ、ベッドが逆さまだ…」\n\n不器用ながらも一生懸命組み立てるかにかに。\n視聴者が「がんばれ！」「右！右！」とナビゲーション。',
    animation: 'happy', viewerDelta: 10, chatFlood: ['がんばれ','不器用かわいい','逆さまw','右だよ！'],
    choices: [
      { label: 'シルバニアの住人紹介コーナーをさせる', popularity: 8, subscribers: 8, viewers: 8, chatFlood: ['紹介！','お父さんイケメン','赤ちゃんかわいい'], next: 'k_d1_end' },
      { label: '完成したお家でかにかにの自作ドラマを始めさせる', popularity: 10, subscribers: 5, viewers: 15, chatFlood: ['ドラマ！','声優才能ある','面白い！'], next: 'k_d1_end' }
    ] },

  k_d1_s3b: { text: 'かにかにが独自の世界観を展開し始めた。\n\n「実はこのシルバニアの世界には…裏設定があるんです。\nお父さんウサギは元特殊部隊で…\nお母さんウサギは天才科学者で…」\n\nチャット「設定が重すぎるw」「闇が深いw」',
    animation: 'happy', viewerDelta: 12, chatFlood: ['設定重いw','闇が深い','お父さん特殊部隊www','面白い'],
    superchats: [{ name: '設定厨', amount: 500, message: '裏設定もっと聞きたい' }],
    choices: [
      { label: '視聴者に「あなたの裏設定」を募集させる', popularity: 8, subscribers: 6, viewers: 10, chatFlood: ['参加型！','赤ちゃんはスパイ','面白い企画'], next: 'k_d1_end' },
      { label: '「次回に続く…」とドラマチックに終わらせる', popularity: 6, subscribers: 8, viewers: 5, chatFlood: ['続くの！？','次回！','気になる！'], next: 'k_d1_end' }
    ] },

  // --- DAY 1 病み ---
  k_d1_end: { yami: true, animation: 'shake', streamTitle: '（配信終了後…）',
    text: '初日の配信が終わった。まあまあの結果だったが…\n\nかにかにが部屋の隅で膝を抱えている。\n\n「…コメントで『シルバニアの開封なんて誰が見るの？\nもっとゲーム配信とかした方がいいよ』って書かれた…\n私のシルバニア愛、伝わらなかったのかな…\nもうやめた方がいいのかな…」\n\nかにかにが病んでいる！マネージャーとして励まそう！',
    choices: [
      { label: 'カニの着ぐるみを着て「シルバニアにカニ族を提案しよう！」と踊る', popularity: 6, subscribers: 4, next: 'k_cheer1a' },
      { label: 'シルバニアの人形を並べて下手な人形劇で「みんな応援してるよ」と演じる', popularity: 8, subscribers: 3, next: 'k_cheer1b' },
      { label: '巨大なカニ味噌おにぎり（顔サイズ）を作って「元気出る飯だ！」と差し出す', popularity: 5, subscribers: 5, next: 'k_cheer1c' }
    ] },
  k_cheer1a: { animation: 'happy',
    text: 'あなたはカニの着ぐるみを着て横歩きで踊り始めた。\n\n「シルバニアにカニ族を追加する運動を始めよう！\nカニのお父さん！カニのお母さん！カニの赤ちゃん！\nほら、シャカシャカ！チョキチョキ！」\n\nかにかに「…なにしてるんですか…\n…でも…確かにカニ族ほしいかも…ぷっ…ふふ」\n\n少し笑ってくれた！明日も頑張れそうだ。',
    next: 'k_d2_transition' },
  k_cheer1b: { animation: 'happy',
    text: 'シルバニアの人形をかにかにの周りに円形に並べた。\n\n声色を変えながら人形を動かして…\n「かにかにちゃん、大好きだよ」\n「配信楽しかったよ」\n「椅子は…自分の意思で旅に出ただけだよ」\n\nかにかに「…人形劇下手すぎて逆に面白い…\n椅子に意思はない…でもありがとう…」\n\n涙目で笑ってくれた！',
    next: 'k_d2_transition' },
  k_cheer1c: { animation: 'happy',
    text: '巨大なカニ味噌おにぎり（直径30cm）を作って差し出した。\n\nかにかに「でかっ！私の顔くらいある！」\n\n「元気出る飯だ！食べて食べて！」\n\nかにかに「もぐもぐ…おいし…\nでもこれ…カニの味噌って…共食いじゃない…？」\n\n「気にしない気にしない！」\n\nかにかに「…ふふ、バカだなぁ…ありがとう」',
    next: 'k_d2_transition' },

  // ========== DAY 2: シルバニア森のキッチン開封 ==========
  k_d2_transition: { dayTransition: 2, afterTransition: true, live: true, animation: 'happy',
    streamTitle: '【2日目】シルバニア森のキッチンを開封！',
    text: '2日目の配信スタート！\n今日はシルバニアの「森のキッチン」を開封する。\n\nかにかに「昨日来てくれた皆さんありがとう！\n今日はキッチンセットを開封します！\n…今度は丁寧にやりますから！」\n\n昨日のリスナーが戻ってきてくれた！嬉しい。',
    chatFlood: ['おかえり！','待ってたよ！','今日も楽しみ','昨日面白かった！','丁寧にねw'],
    choices: [
      { label: 'シルバニアのキッチンでミニチュア料理を再現させる', popularity: 8, subscribers: 8, viewers: 10, chatFlood: ['料理！','ミニチュア料理','すごい！'], next: 'k_d2_s2a' },
      { label: 'キッチンセットの家具を一つずつ紹介しながら愛を語らせる', popularity: 6, subscribers: 10, viewers: 5, chatFlood: ['家具紹介','こだわりすごい','愛が深い'], next: 'k_d2_s2b' },
      { label: '昨日の「カニ一家」の続きとしてキッチンドラマをさせる', popularity: 10, subscribers: 6, viewers: 15, chatFlood: ['ドラマの続き！','カニ一家！','待ってたw'], next: 'k_d2_s2c' }
    ] },

  k_d2_s2a: { text: 'かにかにがミニチュアキッチンで粘土のオムライスを作り始めた。\n\n「この小さなフライパンで…粘土を薄く伸ばして…\nケチャップは赤い粘土で…」\n\n不器用ながらも真剣な表情。\n完成したオムライスは…なぜか三角形。\n\nかにかに「…オムライスって三角でしたっけ…？」',
    animation: 'happy', viewerDelta: 15, chatFlood: ['三角www','おにぎりじゃんw','がんばった！','不器用かわいい'],
    choices: [
      { label: '「三角オムライスは新ジャンルだ！」とポジティブに持っていく', popularity: 8, subscribers: 6, viewers: 10, chatFlood: ['新ジャンルw','ポジティブ','確かに新しいw'], next: 'k_d2_s3a' },
      { label: '視聴者に他の料理もリクエストさせる', popularity: 6, subscribers: 8, viewers: 8, chatFlood: ['ハンバーグ！','カレー！','カニ鍋はやめてw'], next: 'k_d2_s3b' }
    ] },

  k_d2_s2b: { text: 'かにかにが家具を一つずつ紹介。\n\n「このシンクの蛇口、ちゃんと回るんです！すごくないですか！？\nしかもね、この冷蔵庫…開くんです！中に棚もある！！」\n\n興奮しすぎて早口になっている。\n\nチャット「蛇口の説明に3分かけてて草」',
    animation: 'happy', viewerDelta: 8, chatFlood: ['愛が重いw','蛇口に3分www','こだわりすごい','マニアックw'],
    choices: [
      { label: '視聴者に「お気に入りの家具」を投票させる', popularity: 8, subscribers: 8, viewers: 8, chatFlood: ['投票！','冷蔵庫！','フライパンに1票'], next: 'k_d2_s3a' },
      { label: '家具の「裏設定」を語らせる（このフライパンは伝説の…）', popularity: 10, subscribers: 4, viewers: 12, chatFlood: ['伝説のフライパンw','設定厨きたw','面白い'], next: 'k_d2_s3b' }
    ] },

  k_d2_s2c: { text: 'カニ一家のキッチンドラマがスタート！\n\nかにかに「カニ父『今日の晩ごはんは何がいい？』\nカニ母『あなた、ハサミで料理できるの？』\nカニ父『……で、できるとも！ハサミは万能だぞ！』」\n\n全役を一人でこなすかにかに。\n声の切り替えが忙しすぎて息切れ。',
    animation: 'happy', viewerDelta: 18, chatFlood: ['カニ父www','ハサミで料理w','一人芝居すごい','息切れしてるw'],
    superchats: [{ name: '劇団かにかに', amount: 1000, message: '舞台化希望' }],
    choices: [
      { label: 'カニ父の料理シーンを実際にミニチュアで再現させる', popularity: 10, subscribers: 6, viewers: 12, chatFlood: ['再現！','ハサミでフライパンw','面白い'], next: 'k_d2_s3a' },
      { label: '視聴者にセリフをリクエストさせてアドリブドラマにする', popularity: 8, subscribers: 8, viewers: 10, chatFlood: ['参加型！','「爆発しろ」w','面白いセリフ来たw'], next: 'k_d2_s3b' }
    ] },

  k_d2_s3a: { text: 'ミニチュア料理がどんどん増えていく。\n三角オムライス、四角いハンバーグ、星形のカレー…\n\nかにかに「…全部形がおかしい…\nでも、小さいから全部かわいく見える…かも…？」\n\n視聴者「かわいい！」「味がある」「個展開けるレベル」\n\nスパチャが飛び始めた！',
    animation: 'happy', viewerDelta: 15,
    chatFlood: ['かわいい！','個展w','味があるw','全部欲しい'],
    superchats: [{ name: 'ミニチュア料理家', amount: 3000, message: 'コラボしませんか？' }],
    choices: [
      { label: '「かにかにのミニチュアレストラン」として開店させる', popularity: 10, subscribers: 8, viewers: 10, chatFlood: ['開店！','行きたいw','メニューは？'], next: 'k_d2_end' },
      { label: 'シルバニアの住人にミニチュア料理を出して反応を想像させる', popularity: 8, subscribers: 10, viewers: 8, chatFlood: ['反応気になる','お父さん喜ぶ','かわいい企画'], next: 'k_d2_end' }
    ] },

  k_d2_s3b: { text: '視聴者参加型がヒート！\nリクエストが止まらない。\n\nチャット「カニ父が実は料理の鉄人だった設定にして」\nチャット「フライパンが喋り出す展開希望」\n\nかにかに「フライパン『俺を使ってくれ…！』\n…えっ、フライパンに声つけるの難しい…\nどんな声…？低い…？」\n\n迷走し始めているが、チャットは大盛り上がり。',
    animation: 'happy', viewerDelta: 18,
    chatFlood: ['フライパン喋ったwww','カオスw','最高','低い声www'],
    superchats: [{ name: '脚本家志望', amount: 2000, message: 'この才能を映画に！' }],
    choices: [
      { label: 'フライパン主役のスピンオフドラマに発展させる', popularity: 10, subscribers: 6, viewers: 12, chatFlood: ['スピンオフw','フライパンが主役','斬新すぎるw'], next: 'k_d2_end' },
      { label: '全ての家具に声をつけて「家具オーケストラ」をさせる', popularity: 8, subscribers: 8, viewers: 10, chatFlood: ['オーケストラwww','シュール','天才かも'], next: 'k_d2_end' }
    ] },

  // --- DAY 2 病み ---
  k_d2_end: { yami: true, animation: 'shake', streamTitle: '（配信終了後…）',
    text: '2日目の配信が終わった。登録者も少しずつ増えている。\nしかし…またかにかにが病んでいる。\n\n「…今日、コメントで\n『かにかにより猫チャンネルの方がかわいい』\nって書かれた…\n猫のほうが再生数も多いし…\n猫には…猫には勝てないよ…」\n\n猫と比較されてメンタルが崩壊している！',
    choices: [
      { label: '猫耳をつけて「かにかにも猫になれる！カニ猫だ！」と変装させる', popularity: 8, subscribers: 4, next: 'k_cheer2a' },
      { label: 'パワポで「猫 vs カニ 完全比較表」を作成して「カニが勝つ」とプレゼンする', popularity: 6, subscribers: 6, next: 'k_cheer2b' },
      { label: '段ボールで全長2メートルの巨大カニロボを作って「猫はこれに乗れない！」と自慢する', popularity: 10, subscribers: 3, next: 'k_cheer2c' }
    ] },
  k_cheer2a: { animation: 'happy',
    text: 'かにかにに猫耳をつけた。\n\nかにかに「にゃ…にゃー…\nこれ配信でやったら人気出ますか？」\n\n「カニ耳と猫耳の二刀流で攻めよう！\nカニ耳はハサミを頭に乗せればいいんだよ！」\n\nかにかに「カニ耳ってなに…\n…まあいいか。明日やってみよう…\nにゃー…チョキ…にゃキ…？」\n\n謎の新ジャンル「カニ猫」が誕生した。',
    next: 'k_d3_transition' },
  k_cheer2b: { animation: 'happy',
    text: 'パワポで「猫 vs カニ 完全比較表」を作った。\n\n「猫：水が苦手 → カニ：水中生活可能！\n猫：爪が引っ込む → カニ：ハサミ常時展開！最強！\n猫：9つの命 → カニ：脱皮で無限再生！\n猫：甘えてくる → カニ：ハサミで挟んでくる（愛情表現）」\n\nかにかに「めちゃくちゃすぎる…\nでもなんか自信出てきた…ハサミ最強…」',
    next: 'k_d3_transition' },
  k_cheer2c: { animation: 'happy',
    text: '段ボールで全長2メートルの巨大カニロボを作った。\n\n「見て！猫はこれに乗れない！カニ専用！\n左のハサミは回転するし、\n右のハサミには小さなシルバニアの家がついてる！」\n\nかにかに「…なにこの労力…\n左のハサミ動くんですか？」\n\n「動くよ！」（手動）\n\nかにかに「…ぷっ…バカだなぁ…\nでもありがとう。明日これ配信に出そう！」',
    next: 'k_d3_transition' },

  // ========== DAY 3: 最終日・特別企画 ==========
  k_d3_transition: { dayTransition: 3, afterTransition: true, live: true, animation: 'happy',
    streamTitle: '【最終日】みんなでシルバニアの街を作ろう！',
    text: '最終日！3日目の配信スタート！\n\nかにかに「皆さん3日間ありがとう！\n今日は特別企画です！\n視聴者の皆さんと一緒にシルバニアの街を作ります！\n…あとカニ猫もやります」\n\nリスナーが一気に増えている！初日の3倍！',
    chatFlood: ['最終日！','3日間楽しかった','街づくり！','カニ猫！？w','盛り上がろう！'],
    superchats: [{ name: 'シルバニア公式（？）', amount: 10000, message: 'コラボのご相談を…！' }, { name: 'かにかにファン1号', amount: 5000, message: '3日間最高でした' }],
    choices: [
      { label: '視聴者のアイデアでシルバニアの新キャラ「カニ族」を粘土で作らせる', popularity: 10, subscribers: 10, viewers: 15, chatFlood: ['カニ族！','粘土楽しみ','かわいくしてね'], next: 'k_d3_s2a' },
      { label: 'シルバニアの人形全員でミュージカルをさせる', popularity: 8, subscribers: 12, viewers: 10, chatFlood: ['ミュージカルw','歌って！','すごい企画'], next: 'k_d3_s2b' },
      { label: 'カニロボをシルバニアの街の守護神として登場させる', popularity: 12, subscribers: 8, viewers: 20, chatFlood: ['カニロボ！','昨日のやつ！','守護神www'], next: 'k_d3_s2c' }
    ] },

  k_d3_s2a: { text: '視聴者のアイデアが殺到！\n「カニのお父さんは元漁師」「カニの赤ちゃんは天才」\n\nかにかにが粘土で一生懸命カニ族を作る。\n不器用だけど真剣な表情。\n\nかにかに「できた！…ちょっと怖い顔になっちゃった…\nハサミが4本ある…なんで…？」\n\nチャット「怖かわいいw」「ミュータントカニw」',
    animation: 'happy', viewerDelta: 20, chatFlood: ['怖いw','味がある','ハサミ4本www','かわいい（？）'],
    choices: [
      { label: 'カニ族の家族写真を撮らせてSNSにアップさせる', popularity: 8, subscribers: 8, viewers: 10, chatFlood: ['家族写真w','いい写真','バズりそう'], next: 'k_d3_s3' },
      { label: 'カニ族とウサギ族の交流会を開催させる', popularity: 10, subscribers: 6, viewers: 12, chatFlood: ['交流会！','異文化交流w','シュールすぎる'], next: 'k_d3_s3' }
    ] },

  k_d3_s2b: { text: 'シルバニアミュージカルのリハーサル開始。\n\nかにかにが全役の歌を歌う。音痴だけど全力。\n\n♪「シルバニアの丘に～住む～ウサギたち～\n　隣のカニが～ハサミで～お手伝い～」\n\n自作の歌詞。メロディーは即興。\nチャットは爆笑しながらなぜか感動している。',
    animation: 'happy', viewerDelta: 25,
    chatFlood: ['音痴www','でも泣ける','名曲','紅白出ろw'],
    superchats: [{ name: '音楽プロデューサー', amount: 5000, message: 'CD出しませんか？（半分本気）' }],
    choices: [
      { label: '視聴者にサビのメロディーをリクエストさせる', popularity: 8, subscribers: 10, viewers: 10, chatFlood: ['サビ！','もっと高く！','泣けるやつで'], next: 'k_d3_s3' },
      { label: 'シルバニア人形を使ったダンスシーンを入れさせる', popularity: 10, subscribers: 8, viewers: 12, chatFlood: ['ダンス！','人形が踊ってるw','すごい演出'], next: 'k_d3_s3' }
    ] },

  k_d3_s2c: { text: '段ボールのカニロボがシルバニアの街に登場！\n\nかにかに「シルバニアの平和は、このカニロボが守る！\nカニロボ、出動！！」\n\nハサミ（手動）をガシャンガシャンと動かす。\nしかしカニロボが大きすぎてシルバニアの家を踏みつぶしそう。\n\nかにかに「あっ…お家が…カニロボやめて…」',
    animation: 'spin', viewerDelta: 25,
    chatFlood: ['カニロボでかすぎw','家踏みそうw','守るどころか破壊w','面白すぎる'],
    choices: [
      { label: 'カニロボを小型化（箱1個サイズ）にリニューアルさせる', popularity: 8, subscribers: 8, viewers: 10, chatFlood: ['小型化w','ちっちゃいw','かわいい！'], next: 'k_d3_s3' },
      { label: '「カニロボは優しい巨人」として街の外から見守る設定にさせる', popularity: 10, subscribers: 6, viewers: 15, chatFlood: ['優しい巨人w','感動する設定','鉄人28号的な'], next: 'k_d3_s3' }
    ] },

  k_d3_s3: { text: '最終日の配信がクライマックスに！\n\nシルバニアの街が完成した。\nウサギ族、リス族、そしてカニ族。\nカニロボが遠くから見守っている（設定上）。\n\nかにかに「みんな…見て…\nこの街、皆さんと一緒に作ったんだよ…」\n\n目がウルウルしている。チャットも温かい言葉で溢れる。',
    animation: 'happy', viewerDelta: 20,
    chatFlood: ['泣ける','素敵','最高の街','一緒に作れて嬉しい','かにかにありがとう'],
    superchats: [
      { name: 'シルバニア公式', amount: 30000, message: '本当にコラボしませんか！？' },
      { name: '3日間皆勤賞', amount: 5000, message: '毎日楽しかった！' }
    ],
    choices: [
      { label: 'シルバニアの住人全員で「ありがとう」の合唱をさせる', popularity: 10, subscribers: 10, viewers: 10, chatFlood: ['合唱！','泣いた','最高のエンディング','ありがとう'], next: 'k_ending' },
      { label: 'カニポーズ（チョキ）で全員集合写真を撮らせる', popularity: 8, subscribers: 12, viewers: 8, chatFlood: ['集合写真！','チョキ！','カニカニ～！','保存した'], next: 'k_ending' },
      { label: '感謝のカニダンス（横歩き）を踊って配信を締めくくる', popularity: 12, subscribers: 8, viewers: 15, chatFlood: ['カニダンスwww','横歩きw','最高すぎる','名シーン'], next: 'k_ending' }
    ] },

  k_ending: { animation: 'happy', viewerDelta: 15,
    text: 'かにかに「3日間の配信、本当にありがとうございました！\n\n初日は不安だらけで…病んだりもしたけど…\nマネージャーさんが変なことして笑わせてくれて…\nみんなが温かいコメントくれて…\n\n最高の3日間でした！\nこれからもシルバニアの魅力を伝えていきます！\nカニカニ～！」\n\n手をチョキにしてカニポーズ。最高の笑顔で配信終了。',
    chatFlood: ['おつかれ！','カニカニ～！','3日間最高！','次も絶対見る！','泣いた','ありがとう'] }
};
