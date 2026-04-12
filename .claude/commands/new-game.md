新しいゲーム「$ARGUMENTS」を作成してください。

$ARGUMENTS の形式: `ゲームID ゲーム名 "ゲームの説明"` （例: `puzzle-blocks パズルブロックス "ブロックを並べ替えるパズルゲーム"`）

## 必ず行うこと（すべて完了するまで終わらない）

### 1. ゲームフォルダの作成
- `games/$ゲームID/` フォルダを作成
- 以下のファイルを作る:
  - `index.html` — 下のテンプレートに従う
  - `game.js` — ゲームのメインロジック
  - `style.css` — ゲーム固有のスタイル

### 2. index.html テンプレート（必ずこの構造にする）
```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-K8QFB33PX7"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-K8QFB33PX7');
  </script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>【ゲーム名】 - シュールゲームス</title>
  <!-- OGP -->
  <meta property="og:title" content="【ゲーム名】 | シュールゲームス">
  <meta property="og:description" content="【ゲームの説明】">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://eri-murayama.github.io/surreal-games/games/【ゲームID】/index.html">
  <meta property="og:image" content="https://eri-murayama.github.io/surreal-games/assets/images/ogp.png">
  <meta name="twitter:card" content="summary_large_image">
  <!-- スタイル -->
  <link rel="stylesheet" href="../common/game-common.css">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="game-wrapper"></div>
  <a href="../../index.html" class="back-to-top-link" data-i18n="backToTop">← トップに戻る</a>
  <script src="../common/i18n.js"></script>
  <script src="../common/game-common.js"></script>
  <script src="game.js"></script>
  <script>
    SurrealGames.init('【ゲームID】');
  </script>
</body>
</html>
```

### 3. game.js の i18n対応
- `SurrealI18n.init()` でゲーム固有の日本語・英語テキストを定義する
- ゲーム内のすべてのテキストに `SurrealI18n.t('キー')` を使う
- UIテキスト、ゲーム説明、リザルト画面すべて日英対応にする

### 4. 共通UIボタン（自動生成されるもの — 確認だけする）
以下は `SurrealGames.init()` で自動生成される。手動で書かない：
- Xにシェアボタン（.sg-share-btn）
- 音量ボタン（.sg-sound-toggle）
- 言語切り替えボタン（.sg-lang-toggle）
- 「他のゲームも遊ぶ」セクション（.sg-recommend）

### 5. トップページにゲームカードを追加
`index.html`（ルート）のゲーム一覧セクションに、既存のカードと同じ形式で追加する。
フリップカード版（キャラ立ち絵付き）を使う場合はキャラ画像も用意する。

### 6. キャラクター図鑑に追加
`characters.html` にゲームのメインキャラクターを追加する。
※ prototypes.html のゲームは図鑑に含めない。index.html のゲーム一覧にあるもののみ。

### 7. レイアウト要件
- PC・スマホ両方で1画面に収まるようにする（スクロールなしで遊べる）
- モバイルファーストで設計する
