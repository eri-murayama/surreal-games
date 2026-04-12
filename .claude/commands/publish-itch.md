ゲーム「$ARGUMENTS」をitch.io投稿用に準備してください。

$ARGUMENTS の形式: `ゲームID` （例: `puzzle-blocks`）

## 必ず行うこと

### 1. itch.io用フォルダの作成
- `itch/$ARGUMENTS/` フォルダを作成
- `games/$ARGUMENTS/` から以下をコピーして**itch.io向けに調整**する:
  - `index.html`
  - `game.js`
  - `style.css`
  - 必要な画像ファイル

### 2. itch.io版の調整（重要）
itch.io版は自サイトとは独立して動く必要がある。以下を修正する：
- `../common/game-common.css` → インラインまたはファイル内に埋め込み
- `../common/game-common.js` → 必要な機能だけ抽出して埋め込み
- `../common/i18n.js` → 不要（itch.ioは英語のみ）
- Google Analyticsタグ → 削除
- OGPタグ → 削除
- 「トップに戻る」リンク → 削除
- 日本語切り替えボタン → 削除
- **すべてのテキストを英語にする**
- 外部ファイル参照 → すべてフォルダ内で完結させる

### 3. itch-io-description.md の作成
`itch/$ARGUMENTS/itch-io-description.md` を作成する。内容：
- ゲームタイトル（英語）
- ゲーム説明（英語）
- 操作方法（英語）
- タグ候補（英語）
- itch.ioページに掲載する紹介文

### 4. ZIPファイルの作成
- `itch/$ARGUMENTS/` フォルダ（itch-io-description.mdを除く）をZIP化して `itch/$ARGUMENTS.zip` を作成

### 5. 確認事項
- itch.io版が単独で動作するか確認
- 画像パスがすべて相対パスで正しいか確認
- 日本語テキストが残っていないか確認
- `itch/` 内のファイルで外部参照（../common/ など）が残っていないか確認

### 注意
- `games/` フォルダ側は一切変更しない
- itch.ioは英語のみなので日本語対応は不要
