ゲーム「$ARGUMENTS」のキャラクターを図鑑とトップページに追加してください。

$ARGUMENTS の形式: `ゲームID` （例: `puzzle-blocks`）

## 必ず行うこと

### 1. トップページ（index.html）のゲームカードをフリップカード版に更新
- まだフリップカードになっていない場合、キャラ立ち絵付きのフリップカードに変更する
- フリップカード構造:
```html
<article class="game-card game-card--flip fade-in">
  <div class="game-card__image card-flip-zone">
    <div class="card-flip-inner">
      <div class="card-flip-front placeholder-art">
        <img src="assets/images/【キャラ画像】.png" class="card-chara">
      </div>
      <div class="card-flip-back">
        <img src="assets/images/【キャラ画像】.png" class="card-flip-back__img">
        <div class="card-flip-back__speech">【キャラのセリフ】</div>
      </div>
    </div>
  </div>
  <!-- 既存のbody部分はそのまま -->
</article>
```

### 2. キャラクター図鑑（characters.html）に追加
- 既存のキャラカードと同じ形式で `.chara-card` を追加する
- キャラクター画像、名前、説明、登場ゲーム名を含める

### 3. キャラクター画像
- キャラクター画像が `assets/images/` になければ作成が必要なことをユーザーに伝える

### ルール
- prototypes.html にしかないゲームのキャラは図鑑に追加しない
- index.html のゲーム一覧に載っているゲームのキャラのみ追加する
