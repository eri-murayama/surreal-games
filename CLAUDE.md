常に日本語で応答すること。

## 編集ルール
- `plicy/` ディレクトリは絶対に編集しない（plicy投稿用の別管理）
- `itch/` ディレクトリは絶対に編集しない（itch.io投稿用の別管理）
- `node_modules/` は編集しない
- 編集対象は主に `games/`、`css/`、`js/`、`assets/`、およびルート直下のHTMLファイル

## レイアウト・UI
- ゲームはPC・スマホどちらでも1画面に収まるようにする（スクロールなしで遊べる状態）
- モバイルファーストで考える（スマホで快適→PCでも快適）

## 全ゲーム共通の必須UI要素
- Xにシェアボタン
- ホームに戻るボタン
- 「他のゲームも遊ぶ」ボタン
- 英語切り替えボタン（i18n対応）
- 音量ボタン（ミュート/解除）

## コード品質
- 各ゲームの共通CSSは `games/common/game-common.css` を使う
- Google Analytics（G-K8QFB33PX7）のタグは全ページに含める
- OGPタグ（og:title, og:description, og:image, twitter:card, twitter:site）は全ページに含める
  - `twitter:site` は `@tadanosyuhuda`
  - `og:image` は絶対URL（`https://eri-murayama.github.io/surreal-games/...`）にする
  - `canonical` URL も全ページに付ける
- 新規ゲームの言語切り替え（i18n）は `games/common/i18n.js` の `SurrealI18n.createLangToggle()` を使って共通化する（独自実装はしない）
- 新規ゲームは `games/common/game-common.js` を必ず読み込む（音量ボタン・他ゲーム導線・作者フォロー導線が自動で挿入される）
  - `SurrealGames.init('gameId')` を呼ばない軽量ゲームでは、代わりに `SurrealGames.initShareAndFollow('gameId')` を呼ぶことで、Xシェアボタン＋クリア画面の応援セクション（X/YouTube/note）だけ追加できる
  - 新規ゲームは `GAME_CATALOG` にも追加すること（タイトルや絵文字が結果画面の表示に使われる）
  - シェア文には `#シュールゲームス @tadanosyuhuda` を含める（フォロー導線になる）

## the-machine-comedy の vocals.mp3
- エンディングの歌は `assets/vocals.mp3`。本サイト版（GitHub Pages）では再生される
- plicy/itch.io 版では .mp3 が配信されないため鳴らないが、`game.js` 側で try/catch されておりゲームは進行可能

## コミット
- コミットメッセージは日本語で書く
