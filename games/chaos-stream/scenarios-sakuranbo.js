/* さくらんぼちゃん シナリオ（3日間・各日3選択） */
window.sakuranboScenes = {
  // ========== DAY 1: 春の新作コスメレビュー ==========
  intro: { live: true, animation: 'happy', streamTitle: '【初配信】春の新作コスメ全部試す！',
    text: 'さくらんぼちゃんが美容系YouTube配信を始めた！\n\nさくらんぼちゃん「こんばんは～！さくらんぼです♪\n今日は春の新作コスメ、全部試していくよ～！\nテーブルの上にコスメがいっぱい！」\n\nコメント欄が少しずつ賑わい始めた。',
    chatFlood: ['こんばんは！','コスメ楽しみ','さくらんぼちゃん可愛い','新作気になる'],
    superchats: [{ name: 'コスメ大好きOL', amount: 500, message: 'レビュー待ってました！' }],
    choices: [
      { label: 'スキンケアから丁寧に紹介させる', popularity: 8, subscribers: 8, viewers: 8, chatFlood: ['スキンケア大事','肌きれい！','参考になる'], next: 's_d1_s2a' },
      { label: 'いきなりリップ10本を一気塗りさせる', popularity: 6, subscribers: 4, viewers: 15, chatFlood: ['リップ！','10本!?','どれが1位？'], next: 's_d1_s2b' },
      { label: '100均コスメ vs デパコス対決をさせる', popularity: 10, subscribers: 3, viewers: 18, chatFlood: ['対決！','100均侮れない','企画力ある！'], next: 's_d1_s2c' }
    ] },

  s_d1_s2a: { text: 'さくらんぼちゃんがスキンケアを丁寧に紹介。\n\n「この美容液、ビタミンC誘導体が入ってて…\nテクスチャーはさらっとしてるけど保湿力が…」\n\nしかし途中で化粧水のボトルが滑って顔にぶっかけてしまった。\n\nさくらんぼちゃん「ひゃっ…！びしょびしょ…」',
    animation: 'shake', viewerDelta: 10, chatFlood: ['ぶっかけたwww','大丈夫？','リアルなレビューw'],
    choices: [
      { label: '「これがパッティング！全顔一気に保湿！」とポジティブに持っていく', popularity: 10, subscribers: 5, viewers: 10, chatFlood: ['パッティングw','ポジティブw','好感度高い'], next: 's_d1_s3a' },
      { label: '「化粧水SPLASH使い」として新技を提唱させる', popularity: 8, subscribers: 8, viewers: 8, chatFlood: ['SPLASH使いw','新技www','流行りそう'], next: 's_d1_s3b' }
    ] },

  s_d1_s2b: { text: 'リップ10本を次々と塗り比べ！\n\nコーラルピンク…ローズベージュ…ベリーレッド…\n塗りすぎて唇がカラフルなグラデーションに。\n\nさくらんぼちゃん「あれ…唇が虹色に…\n…これはこれでアート…？」\n\nチャット「オンブレリップの最終形態w」',
    animation: 'happy', viewerDelta: 12, chatFlood: ['塗りすぎw','虹色リップw','アートw','全部かわいい'],
    choices: [
      { label: '「偶然の虹色リップ」として新トレンドを宣言させる', popularity: 10, subscribers: 6, viewers: 12, chatFlood: ['新トレンドw','天才','マネしたい'], next: 's_d1_s3a' },
      { label: '視聴者投票で1本だけ選ばせる', popularity: 6, subscribers: 10, viewers: 8, chatFlood: ['投票！','コーラルピンク！','ローズに1票'], next: 's_d1_s3b' }
    ] },

  s_d1_s2c: { text: '100均 vs デパコス対決！左半分と右半分で比較メイク！\n\n途中で左右がわからなくなった。\n\nさくらんぼちゃん「えっと…こっちが100均で…\nいや…こっちがデパコスで…\n…どっちがどっちだっけ…？」\n\n視聴者も完全に混乱。',
    animation: 'shake', viewerDelta: 15, chatFlood: ['どっちがどっちw','混乱してるw','わからんw'],
    choices: [
      { label: '「区別つかない＝100均すごい！」と結論づけさせる', popularity: 10, subscribers: 5, viewers: 12, chatFlood: ['説得力あるw','確かにw','100均の勝ちw'], next: 's_d1_s3a' },
      { label: '視聴者クイズにして「どっちでしょう？」と正解発表させる', popularity: 8, subscribers: 8, viewers: 10, chatFlood: ['クイズ！','左かな？','右！？'], next: 's_d1_s3b' }
    ] },

  s_d1_s3a: { text: 'ハプニングをうまく乗り越えたさくらんぼちゃん。\nチャットの雰囲気が温かくなっている。\n\n「えへへ…失敗ばっかりだけど、楽しい…！\n次はアイシャドウいくね！」\n\nアイシャドウを塗ろうとしたら…パレットが落ちて粉が飛散。\n\nさくらんぼちゃん「あああ！ラメが！ラメが舞ってる！」\nチャット「キラキラ配信w」',
    animation: 'shake', viewerDelta: 10, chatFlood: ['ラメ飛散www','キラキラ','ドジっ子','大丈夫？w'],
    superchats: [{ name: 'ラメ好き', amount: 1000, message: 'キラキラしてて逆にきれい！' }],
    choices: [
      { label: '「ラメの雪が降ってます♪」とロマンチックに演出させる', popularity: 8, subscribers: 6, viewers: 8, chatFlood: ['ロマンチックw','ポジティブ','さすが'], next: 's_d1_end' },
      { label: 'ラメまみれの顔で「これが最新トレンドです」と言い切らせる', popularity: 10, subscribers: 4, viewers: 12, chatFlood: ['最新トレンドwww','ラメの化身','面白すぎる'], next: 's_d1_end' }
    ] },

  s_d1_s3b: { text: '視聴者参加型が盛り上がっている。\n\nさくらんぼちゃん「みんなのコメント嬉しい…！\n次は何を試す？」\n\nチャット「マスカラ！」「チーク！」「全部混ぜて」\n\nさくらんぼちゃん「全部混ぜて…？\n…やってみようか…？」\n\n全コスメを混ぜた謎の色が完成。紫色。',
    animation: 'happy', viewerDelta: 12, chatFlood: ['混ぜたwww','紫色w','アートだ','面白い'],
    choices: [
      { label: '紫の色を「さくらんぼカラー」と名付けて売り出す企画をさせる', popularity: 10, subscribers: 6, viewers: 10, chatFlood: ['さくらんぼカラーw','商品化希望','天才'], next: 's_d1_end' },
      { label: '紫メイクで「ハロウィン先取り」コーナーにさせる', popularity: 8, subscribers: 8, viewers: 8, chatFlood: ['ハロウィンw','春なのにw','似合ってるw'], next: 's_d1_end' }
    ] },

  // --- DAY 1 病み ---
  s_d1_end: { yami: true, animation: 'shake', streamTitle: '（配信終了後…）',
    text: '初日の配信が終わった。\n\nしかしさくらんぼちゃんが枕を抱えて座り込んでいる。\n\n「…コメントで\n『大手美容YouTuberと比べたら素人感すごい\nもっと勉強してから配信した方がいいよ』\nって書かれた…\n私のメイク、下手なのかな…\nもうやめた方がいいのかな…」\n\nさくらんぼちゃんが病んでいる！',
    choices: [
      { label: '自分の顔にメイクでピカチュウを描いて「素人の方が楽しい！ピカー！」と叫ぶ', popularity: 8, subscribers: 4, next: 's_cheer1a' },
      { label: 'リップ100本を段ボール3箱分持ってきて「練習し放題！」と山積みにする', popularity: 5, subscribers: 6, next: 's_cheer1b' },
      { label: 'さくらんぼちゃんに自分のメイクを頼んで「天才じゃん！」と鏡を見せる', popularity: 10, subscribers: 3, next: 's_cheer1c' }
    ] },
  s_cheer1a: { animation: 'happy',
    text: 'あなたは黄色いフェイスペイントで自分の顔にピカチュウを描いた。\n\n「ほら！プロじゃなくても楽しければOK！\nメイクは自由だ！ピカー！」\n\nさくらんぼちゃん「…ひどい出来…\nほっぺの丸が左右で大きさ全然違う…\n目が怖い…でも…ぷっ…ふふ…\n…確かに、楽しいのが一番だよね」',
    next: 's_d2_transition' },
  s_cheer1b: { animation: 'happy',
    text: 'リップ100本を段ボール3箱分ドサッと持ってきた。\n\n「これだけあれば練習し放題！毎日1本使っても3ヶ月！」\n\nさくらんぼちゃん「100本！？ どこで…いくらかかったの…\n…ていうか全部ピンク系じゃない？」\n\n「ピンクが一番かわいいから！」\n\nさくらんぼちゃん「…バカだなぁ…でもありがとう。\n明日は頑張る」',
    next: 's_d2_transition' },
  s_cheer1c: { animation: 'happy',
    text: 'あなたはさくらんぼちゃんに自分のメイクを頼んだ。\n\n15分後、鏡を見ると…\n\n「…めちゃくちゃ上手いじゃん！！\n肌のトーンアップすごいし、アイラインきれいだし！\nプロ級じゃん！天才！」\n\nさくらんぼちゃん「…本当に？\n…うん、確かに上手にできた…かも…\nもうちょっとだけ頑張ってみようかな…」',
    next: 's_d2_transition' },

  // ========== DAY 2: メイクで変身チャレンジ ==========
  s_d2_transition: { dayTransition: 2, afterTransition: true, live: true, animation: 'happy',
    streamTitle: '【2日目】メイクで変身チャレンジ！リクエスト募集',
    text: '2日目の配信スタート！\n今日は「メイクで変身チャレンジ」企画！\n\nさくらんぼちゃん「昨日はありがとうございました！\n今日はリクエストに応えて変身メイクします！\n…失敗しても笑ってね」\n\nリスナーが増えている！昨日の1.5倍！',
    chatFlood: ['おかえり！','変身楽しみ！','ギャルメイクして！','韓国メイク！','かわいいー'],
    choices: [
      { label: '視聴者投票でメイクのテーマを決めさせる', popularity: 8, subscribers: 8, viewers: 12, chatFlood: ['投票！','参加型楽しい','ギャルに1票'], next: 's_d2_s2a' },
      { label: '半顔メイク（左右別テーマ）に挑戦させる', popularity: 10, subscribers: 6, viewers: 15, chatFlood: ['半顔！','すごい企画','見てみたい'], next: 's_d2_s2b' },
      { label: '目隠しメイクチャレンジをさせる', popularity: 12, subscribers: 4, viewers: 18, chatFlood: ['目隠し！？','できるの？w','怖いw'], next: 's_d2_s2c' }
    ] },

  s_d2_s2a: { text: '投票の結果「ギャルメイク」に決定！\n\nさくらんぼちゃん「ギャル…やったことない…\nつけまつげって…こう…？」\n\nつけまつげが額に貼りついた。\n\nさくらんぼちゃん「…額にまつげ生えた…」\nチャット「額まつげwww」',
    animation: 'shake', viewerDelta: 18, chatFlood: ['額にwww','新しいw','がんばれw'],
    superchats: [{ name: 'ギャル先輩', amount: 2000, message: '額じゃないw 教えてあげる！' }],
    choices: [
      { label: 'ギャル先輩のアドバイスをチャットから拾って再挑戦させる', popularity: 8, subscribers: 8, viewers: 10, chatFlood: ['いいね！','先輩優しい','上手くなってる'], next: 's_d2_s3a' },
      { label: '「額まつげ」を新ジャンルとして堂々と配信させる', popularity: 10, subscribers: 5, viewers: 15, chatFlood: ['新ジャンルwww','堂々としてるw','メンタル強い'], next: 's_d2_s3b' }
    ] },

  s_d2_s2b: { text: '左半分は「韓国アイドル風」、右半分は「昭和レトロ風」に挑戦！\n\n完成後…片方は今風でかわいい。\nもう片方は完全におばあちゃん。\n\nさくらんぼちゃん「正面から見ると…脳がバグる…\nどっちの顔が本物…？」',
    animation: 'happy', viewerDelta: 20, chatFlood: ['脳がバグるwww','左かわいい','右おばあちゃんw'],
    superchats: [{ name: 'メイクアップアーティスト', amount: 5000, message: 'この技術力はガチ。プロ級です' }],
    choices: [
      { label: '「時空を超えたメイク」としてSNSにアップさせる', popularity: 10, subscribers: 6, viewers: 12, chatFlood: ['時空超えたw','バズりそう','写真映えする'], next: 's_d2_s3a' },
      { label: '視聴者に「どっちが好き？」投票させる', popularity: 8, subscribers: 10, viewers: 8, chatFlood: ['投票！','韓国風！','昭和もいい！'], next: 's_d2_s3b' }
    ] },

  s_d2_s2c: { text: '目隠しメイクチャレンジ！\n\nさくらんぼちゃんがアイマスクをつけてメイク開始。\n\n「えーと…これがファンデーション…だよね…？\n…なんか匂いが違う…」\n\nリップをファンデーションだと思って顔全体に塗っていた。\n顔が真っ赤に。\n\nさくらんぼちゃん「（アイマスクを外して）…赤鬼…」',
    animation: 'spin', viewerDelta: 22, chatFlood: ['赤鬼wwww','リップで全塗りw','目隠し怖すぎw','面白すぎる'],
    choices: [
      { label: '赤鬼メイクを活かして「節分メイク」に方向転換させる', popularity: 10, subscribers: 6, viewers: 15, chatFlood: ['節分w','春なのにw','季節感ゼロw','面白い'], next: 's_d2_s3a' },
      { label: 'もう一回目隠しでリベンジさせる', popularity: 8, subscribers: 8, viewers: 10, chatFlood: ['リベンジ！','今度は匂いで判断w','がんばれ'], next: 's_d2_s3b' }
    ] },

  s_d2_s3a: { text: '変身チャレンジがSNSでプチバズり中！\n\n「#さくらんぼ変身」のハッシュタグが拡散され始めた。\n\nさくらんぼちゃん「え、バズってる…？\n嘘でしょ…私の失敗メイクが…？」\n\n失敗こそがエンタメになることに気づき始めている。',
    animation: 'happy', viewerDelta: 15,
    chatFlood: ['バズってる！','失敗が面白いw','才能だよ','Twitterで見た！'],
    superchats: [{ name: '化粧品メーカー公式', amount: 5000, message: 'うちの商品使ってくれませんか？' }],
    choices: [
      { label: '最後にリクエスト「一番得意なメイク」で締めさせる', popularity: 8, subscribers: 10, viewers: 8, chatFlood: ['得意なやつ見たい！','本気のさくらんぼちゃん','楽しみ'], next: 's_d2_end' },
      { label: '「失敗メイクランキング」を発表させて笑って終わる', popularity: 10, subscribers: 6, viewers: 12, chatFlood: ['ランキングw','1位は額まつげw','面白い'], next: 's_d2_end' }
    ] },

  s_d2_s3b: { text: 'リベンジや新ジャンル提唱で盛り上がった配信。\n\nチャットの雰囲気がとても良い。\n「失敗しても楽しそうなのが好き」\n「さくらんぼちゃんの配信は元気出る」\n\nさくらんぼちゃん「みんな優しい…泣きそう…\nでもメイク崩れるから泣かない！」\n\nチャット「泣くなw」「メイク崩れるw」',
    animation: 'happy', viewerDelta: 12,
    chatFlood: ['泣くなw','メイク崩れるw','優しい世界','いい配信'],
    choices: [
      { label: 'お礼に視聴者の似顔絵をメイクで描かせる', popularity: 8, subscribers: 8, viewers: 10, chatFlood: ['似顔絵！','描いて！','楽しそう'], next: 's_d2_end' },
      { label: '明日の予告をドラマチックにさせる', popularity: 6, subscribers: 10, viewers: 5, chatFlood: ['予告！','楽しみ！','明日も見る！'], next: 's_d2_end' }
    ] },

  // --- DAY 2 病み ---
  s_d2_end: { yami: true, animation: 'shake', streamTitle: '（配信終了後…）',
    text: '2日目が終わった。盛り上がったのに…\n\nさくらんぼちゃんがまた病んでいる。\n\n「…レビューで紹介したコスメ、成分に問題があったらしくて…\nSNSで『あんな商品紹介するなんて無責任』\n『信用できない』って叩かれてる…\n私のせいで買っちゃった人がいたらどうしよう…」\n\n責任を感じて落ち込んでいる。',
    choices: [
      { label: '炎上コスメの容器でアート作品を作って「失敗もアートになる！」と展示する', popularity: 8, subscribers: 4, next: 's_cheer2a' },
      { label: 'コスメメーカーに直接電話して「一緒に謝ります！」と宣言する（繋がらない）', popularity: 6, subscribers: 8, next: 's_cheer2b' },
      { label: '全コスメを並べて「成分チェック勉強会」をその場で開く（3つ目で挫折する）', popularity: 10, subscribers: 6, next: 's_cheer2c' }
    ] },
  s_cheer2a: { animation: 'happy',
    text: '炎上コスメの容器でアート作品を作った。\nリップの容器を花に見立て、ファンデのケースを鉢に…\n\n「見て！失敗コスメアート！題名は『再生』！」\n\nさくらんぼちゃん「…センスゼロだけど気持ちは伝わった…\n失敗しても次があるよね…\n明日はちゃんと成分調べてからレビューする！」',
    next: 's_d3_transition' },
  s_cheer2b: { animation: 'happy',
    text: 'コスメメーカーに電話した（フリ）。\n\n「もしもし！さくらんぼちゃんのマネージャーです！\n一緒に謝りたいんですけど…\n…あ、繋がらないや。じゃあ一人で。\nみなさーん！ごめんなさーい！」（窓に向かって叫んだ）\n\nさくらんぼちゃん「…謝る相手が違う…窓に向かってるし…\nでも一緒に責任取ろうとしてくれて嬉しい」',
    next: 's_d3_transition' },
  s_cheer2c: { animation: 'happy',
    text: '全コスメを並べて即席成分勉強会を開催。\n\n「パラベン！これは防腐剤！\nヒアルロン酸！これは保湿！\nトコフェロール…これは…えーと…読めない！」\n\nさくらんぼちゃん「…3つ目で挫折してる…\nでも一緒に勉強してくれるの嬉しい…\n明日はちゃんと調べてからレビューする。約束する！」\n\n目に光が戻った。',
    next: 's_d3_transition' },

  // ========== DAY 3: 最終日・理想のメイク特集 ==========
  s_d3_transition: { dayTransition: 3, afterTransition: true, live: true, animation: 'happy',
    streamTitle: '【最終日】みんなで作る理想のメイク＆成分解説！',
    text: '最終日！3日目の配信スタート！\n\nさくらんぼちゃん「最終日です！\n今日は『視聴者さんと一緒に作る理想のメイク』特集！\n…成分もちゃんと調べてきました！ノート3ページ分！」\n\nノートをカメラに見せるさくらんぼちゃん。\n成長した姿に、視聴者が一気に集まっている！',
    chatFlood: ['最終日！','成長した！','ノート3ページ！偉い','応援してる！'],
    superchats: [{ name: '化粧品メーカー公式', amount: 10000, message: 'アンバサダー契約のご相談を…' }, { name: '初日からのファン', amount: 5000, message: '3日間の成長に感動してます' }],
    choices: [
      { label: '3日間の「失敗メイク→成功メイク」ビフォーアフター企画をさせる', popularity: 10, subscribers: 10, viewers: 15, chatFlood: ['ビフォーアフター！','成長記録','感動する'], next: 's_d3_s2a' },
      { label: '視聴者のメイクの悩みにガチ回答するQ&Aコーナーをさせる', popularity: 8, subscribers: 14, viewers: 10, chatFlood: ['Q&A！','毛穴が…','ためになる'], next: 's_d3_s2b' },
      { label: 'すっぴんを公開して「素肌の大切さ」を語らせる', popularity: 14, subscribers: 8, viewers: 18, chatFlood: ['すっぴん！','勇気ある！','感動した'], next: 's_d3_s2c' }
    ] },

  s_d3_s2a: { text: '3日間の失敗メイクを振り返り！\n\n「1日目：化粧水ぶっかけ → ラメ飛散\n2日目：つけまつげ額に貼付 → 赤鬼化\nそして今日…！」\n\n今日は完璧なメイクを披露するさくらんぼちゃん。\n手つきが確実に上手くなっている。\n\nさくらんぼちゃん「失敗があったから今がある！」',
    animation: 'happy', viewerDelta: 20, chatFlood: ['成長！','感動した','振り返り面白いw','上手くなってる！'],
    choices: [
      { label: '「失敗ベスト3」を発表して笑い飛ばさせる', popularity: 10, subscribers: 6, viewers: 12, chatFlood: ['ベスト3www','1位は赤鬼','笑い飛ばすの大事'], next: 's_d3_s3' },
      { label: '「成長のビフォーアフター」写真を撮ってSNSにアップさせる', popularity: 8, subscribers: 10, viewers: 8, chatFlood: ['ビフォーアフター！','バズりそう','感動'], next: 's_d3_s3' }
    ] },

  s_d3_s2b: { text: '視聴者のメイク悩みにガチ回答！\n\nさくらんぼちゃん「毛穴が気になる方は…\n下地の前にこの氷マッサージが効きます！\n実は私も3日前まで同じ悩みでした」\n\n等身大のアドバイスに視聴者が感心。\n「プロの解説より分かりやすい」という声も。',
    animation: 'happy', viewerDelta: 15, chatFlood: ['分かりやすい！','プロよりいい','神対応','メモした'],
    superchats: [{ name: '皮膚科医', amount: 10000, message: '正しい知識で素晴らしいです' }],
    choices: [
      { label: '視聴者の悩みをもう1つ受け付けてガチ回答させる', popularity: 8, subscribers: 10, viewers: 8, chatFlood: ['もう1つ！','乾燥肌が…','ありがたい'], next: 's_d3_s3' },
      { label: 'Q&Aで出た内容をまとめて「さくらんぼメモ」として配布させる', popularity: 10, subscribers: 8, viewers: 10, chatFlood: ['メモほしい！','まとめ最高','保存した'], next: 's_d3_s3' }
    ] },

  s_d3_s2c: { text: 'さくらんぼちゃんがすっぴんを公開！\n\nメイクを落とす手が震えている。\n\n「これが…素の私です…ちょっと恥ずかしいけど…\n…そばかすもあるし、目の下のクマもあるけど…\nこれが私なんです」\n\nチャットが一斉に「かわいい！」で埋まった。',
    animation: 'happy', viewerDelta: 22, chatFlood: ['かわいい！','勇気ある','素肌もきれい','そばかすかわいい','泣いた'],
    superchats: [{ name: 'ファン代表', amount: 10000, message: 'どっちのさくらんぼちゃんも大好きです' }],
    choices: [
      { label: 'すっぴんから「理想のメイク」を実演して完成させる', popularity: 10, subscribers: 10, viewers: 12, chatFlood: ['変身！','メイクの力！','すごい！','どっちも素敵'], next: 's_d3_s3' },
      { label: '「すっぴんを愛そう」というメッセージで締めくくらせる', popularity: 12, subscribers: 8, viewers: 10, chatFlood: ['いいメッセージ','泣ける','自分を好きでいよう'], next: 's_d3_s3' }
    ] },

  s_d3_s3: { text: '最終配信がクライマックスに！\n\nさくらんぼちゃん「3日間で…失敗ばっかりだったけど…\nみんなが笑ってくれたり、応援してくれたり…\n私、メイクが好きでよかった…」\n\n涙ぐんでいるが、今度は嬉し涙。\n\nチャットが温かい言葉で溢れている。\nスパチャの嵐！',
    animation: 'happy', viewerDelta: 20,
    chatFlood: ['泣ける','最高の配信','応援してよかった','さくらんぼちゃん大好き'],
    superchats: [
      { name: '美容雑誌編集部', amount: 30000, message: '特集記事にしたいです！' },
      { name: '3日間皆勤賞', amount: 5000, message: '毎日笑わせてもらいました' }
    ],
    choices: [
      { label: '投げキッスで「またね♪」と最高の笑顔で締めさせる', popularity: 10, subscribers: 10, viewers: 8, chatFlood: ['投げキッス！','またね！','最高！','大好き'], next: 's_ending' },
      { label: '「3日間のマネージャーさんにも感謝！」とあなたに向けて手を振らせる', popularity: 8, subscribers: 12, viewers: 8, chatFlood: ['マネージャーGJ！','いいチーム','泣ける','ありがとう'], next: 's_ending' },
      { label: '最後に「失敗は最高のメイク」と名言を残させる', popularity: 12, subscribers: 8, viewers: 12, chatFlood: ['名言！','メモした','Tシャツにしたいw','感動'], next: 's_ending' }
    ] },

  s_ending: { animation: 'happy', viewerDelta: 10,
    text: 'さくらんぼちゃん「3日間、本当にありがとう！\n\n失敗ばっかりで…化粧水ぶっかけて…\nつけまつげ額に貼って…赤鬼になって…\nでも、みんなが笑ってくれて、支えてくれて…\n\nこれからも正直に、楽しくコスメを紹介していきます♪\nまたね！バイバイ～！」\n\n投げキッスで配信終了。最高の笑顔。',
    chatFlood: ['おつかれ！','バイバイ～','3日間最高！','次も絶対見る！','ありがとう','登録した！'] }
};
