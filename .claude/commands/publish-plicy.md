ゲーム「$ARGUMENTS」をplicy投稿用に準備してください。

$ARGUMENTS の形式: `ゲームID` （例: `puzzle-blocks`）

## 必ず行うこと

### 1. plicy用フォルダの作成
- `plicy/$ARGUMENTS/` フォルダを作成
- `games/$ARGUMENTS/` から以下をコピーして**plicy向けに調整**する:
  - `index.html`
  - `game.js`
  - `style.css`
  - 必要な画像ファイル

### 2. plicy版の調整（重要）
plicy版は自サイトとは独立して動く必要がある。以下を修正する：
- `../common/game-common.css` → インラインまたはファイル内に埋め込み
- `../common/game-common.js` → 必要な機能だけ抽出して埋め込み
- `../common/i18n.js` → 不要（plicyは日本語のみ）
- Google Analyticsタグ → 削除
- OGPタグ → 削除
- 「トップに戻る」リンク → 削除
- 英語切り替えボタン → 削除
- 外部ファイル参照 → すべてフォルダ内で完結させる

### 3. ZIPファイルの作成
- `plicy/$ARGUMENTS/` フォルダをZIP化して `plicy/$ARGUMENTS.zip` を作成

### 4. サムネ・背景画像の作成
plicy投稿にはサムネ画像と背景画像が必要。ゲームの世界観に合った画像を作る。

- **保存先**: `plicy/assets/` フォルダ
- **ファイル名**: `<ゲーム日本語名>サムネ.png` と `<ゲーム日本語名>背景.png`
- **サイズ**: サムネ 640x480 / 背景 2000x2000
- **作り方**:
  1. `tools/plicy-thumbnails/make-<ゲームID>-images.html` を作成（既存の `make-minesweeper-images.html` を参考に、Canvas APIで描画するHTMLを書く）
  2. `tools/plicy-thumbnails/render-<ゲームID>.mjs` を作成（既存の `render-minesweeper.mjs` を参考に、puppeteerでHTMLを開いてCanvasをPNG化して `plicy/assets/` に保存するスクリプト）
  3. `node tools/plicy-thumbnails/render-<ゲームID>.mjs` を実行して画像を生成
- **テイスト**: ゲームの雰囲気に合わせる。事前にユーザーにどんな雰囲気にしたいか確認する（例: かわいい/かっこいい/こわい/のほほん 等）
- **生成後**: Read ツールで画像を確認し、意図通りか必ずチェックする

### 5. 確認事項
- plicy版が単独で動作するか確認
- 画像パスがすべて相対パスで正しいか確認
- `plicy/` 内のファイルで外部参照（../common/ など）が残っていないか確認
- サムネ・背景画像が `plicy/assets/` に保存されているか確認

### 注意
- `games/` フォルダ側は一切変更しない
- plicyは日本語のみなので英語対応は不要
