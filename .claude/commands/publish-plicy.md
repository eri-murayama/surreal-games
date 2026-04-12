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

### 4. 確認事項
- plicy版が単独で動作するか確認
- 画像パスがすべて相対パスで正しいか確認
- `plicy/` 内のファイルで外部参照（../common/ など）が残っていないか確認

### 注意
- `games/` フォルダ側は一切変更しない
- plicyは日本語のみなので英語対応は不要
