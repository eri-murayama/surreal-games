(function(){'use strict';

/* ── 定数 ── */
const SIZE = 5;
const EVOLUTION = [
  '',        // 0: 空
  '🫧',     // 1: 泡
  '🥚',     // 2: 卵
  '🐣',     // 3: ひよこ
  '🐸',     // 4: カエル
  '🐙',     // 5: タコ
  '👽',     // 6: 宇宙人
  '🤖',     // 7: ロボット
  '🦄',     // 8: ユニコーン
  '🐉',     // 9: ドラゴン
  '👑',     // 10: 王冠
  '🌟',     // 11: 星
  '🌌',     // 12: 銀河
];

const EVO_NAMES = [
  '','泡','卵','ひよこ','カエル','タコ',
  '宇宙人','ロボット','ユニコーン','ドラゴン','王冠','星','銀河'
];

const MERGE_COMMENTS = [
  '',
  '泡がぷくぷく...',
  '卵が割れそう！',
  'ぴよぴよ！進化の予感！',
  'ケロケロ！両生類を超えろ！',
  'タコの足は8本、可能性は無限大',
  '宇宙人「やぁ、地球人」',
  'ロボ起動！ガシャンガシャン！',
  'ユニコーンが虹を残した！',
  'ドラゴンの咆哮が響く！',
  '王冠が輝く...真の王者！',
  '星が生まれた...宇宙の始まり',
  '銀河誕生！！これは...シュール！',
];

const GAMEOVER_COMMENTS = [
  '「進化の道は一つではない...」',
  '「泡に始まり泡に終わる、それもまたシュール」',
  '「この盤面、芸術作品では？」',
  '「ダーウィンもびっくり」',
  '「次こそ銀河を目指せ」',
  '「カエルに戻ってやり直したい人生」',
  '「シュールの神は言った：もう一回」',
];

const SCORE_PER_LEVEL = [0,0,4,8,16,32,64,128,256,512,1024,2048,4096];

/* ── DOM ── */
const $=id=>document.getElementById(id);

const dom = {
  titleScreen:   $('title-screen'),
  gameScreen:    $('game-screen'),
  gameoverScreen:$('gameover-screen'),
  startBtn:      $('start-btn'),
  continueBtn:   $('continue-btn'),
  retryBtn:      $('retry-btn'),
  undoBtn:       $('undo-btn'),
  restartBtn:    $('restart-btn'),
  board:         $('board'),
  score:         $('hud-score'),
  best:          $('hud-best'),
  maxEvo:        $('hud-max-evo'),
  comment:       $('game-comment'),
  highscoreDisp: $('highscore-display'),
  goStats:       $('gameover-stats'),
  goComment:     $('gameover-comment'),
  titleEmoji:    $('title-emoji'),
};

/* ── ゲーム状態 ── */
let grid, score, bestScore, maxLevel, prevState, moveCount;
const SAVE_KEY = 'surreal_evo_save';
const BEST_KEY = 'surreal_evo_best';

/* ── 共通モジュール ── */
const sg = SurrealGames.init('puzzle-2048');

/* ── 初期化 ── */
function init(){
  bestScore = parseInt(localStorage.getItem(BEST_KEY)) || 0;
  updateBestDisplay();

  // タイトルの絵文字をランダムに
  const titleEmojis = ['🫧','🥚','🐣','🐸','🐙','👽','🤖','🦄','🐉'];
  dom.titleEmoji.textContent = titleEmojis[Math.floor(Math.random()*titleEmojis.length)];

  // セーブデータチェック
  const save = loadSave();
  if(save){
    dom.continueBtn.classList.remove('hidden');
  }

  // イベント
  dom.startBtn.addEventListener('click',()=>startGame(false));
  dom.continueBtn.addEventListener('click',()=>startGame(true));
  dom.retryBtn.addEventListener('click',()=>startGame(false));
  dom.undoBtn.addEventListener('click',undo);
  dom.restartBtn.addEventListener('click',()=>{
    if(confirm('本当にやり直しますか？')) startGame(false);
  });

  // キーボード
  document.addEventListener('keydown',handleKey);

  // スワイプ
  setupSwipe();
}

function showScreen(name){
  dom.titleScreen.classList.add('hidden');
  dom.gameScreen.classList.add('hidden');
  dom.gameoverScreen.classList.add('hidden');
  if(name==='title') dom.titleScreen.classList.remove('hidden');
  else if(name==='game') dom.gameScreen.classList.remove('hidden');
  else if(name==='gameover') dom.gameoverScreen.classList.remove('hidden');
}

/* ── ゲーム開始 ── */
function startGame(cont){
  sg.onGameStart();
  if(cont){
    const save = loadSave();
    if(save){
      grid = save.grid;
      score = save.score;
      maxLevel = save.maxLevel || 1;
      moveCount = save.moveCount || 0;
      prevState = null;
    } else {
      newGame();
    }
  } else {
    newGame();
  }
  showScreen('game');
  render();
  updateHUD();
  setComment('');
}

function newGame(){
  grid = Array.from({length:SIZE},()=>Array(SIZE).fill(0));
  score = 0;
  maxLevel = 1;
  moveCount = 0;
  prevState = null;
  spawnTile();
  spawnTile();
}

/* ── タイル生成 ── */
function spawnTile(){
  const empties = [];
  for(let r=0;r<SIZE;r++)
    for(let c=0;c<SIZE;c++)
      if(grid[r][c]===0) empties.push([r,c]);
  if(empties.length===0) return false;
  const [r,c] = empties[Math.floor(Math.random()*empties.length)];
  // 90% レベル1, 10% レベル2
  grid[r][c] = Math.random()<0.9 ? 1 : 2;
  // spawn アニメーション用にマーク
  requestAnimationFrame(()=>{
    const cell = dom.board.children[r*SIZE+c];
    if(cell){
      cell.classList.add('spawn');
      setTimeout(()=>cell.classList.remove('spawn'),250);
    }
  });
  return true;
}

/* ── 描画 ── */
function render(){
  dom.board.innerHTML = '';
  for(let r=0;r<SIZE;r++){
    for(let c=0;c<SIZE;c++){
      const div = document.createElement('div');
      div.className = 'cell';
      const lv = grid[r][c];
      if(lv>0){
        div.textContent = EVOLUTION[Math.min(lv,EVOLUTION.length-1)];
        div.setAttribute('data-level', Math.min(lv,12));
      }
      dom.board.appendChild(div);
    }
  }
}

function updateHUD(){
  dom.score.textContent = 'スコア: '+score;
  dom.best.textContent = 'ベスト: '+bestScore;
  dom.maxEvo.textContent = EVOLUTION[Math.min(maxLevel,EVOLUTION.length-1)] +' '+ EVO_NAMES[Math.min(maxLevel,EVO_NAMES.length-1)];
  if(bestScore>0){
    dom.highscoreDisp.textContent = '🏆 ベストスコア: '+bestScore;
  }
}

function setComment(text){
  dom.comment.textContent = text;
}

/* ── 移動ロジック ── */
function move(dir){
  // 状態保存(undo用)
  prevState = {
    grid: grid.map(r=>[...r]),
    score: score,
    maxLevel: maxLevel,
    moveCount: moveCount,
  };

  let moved = false;
  let mergedMax = 0;

  // dirに応じてスライド方向を決定
  // 0:上 1:右 2:下 3:左
  const rows = [];
  for(let i=0;i<SIZE;i++){
    const line = [];
    for(let j=0;j<SIZE;j++){
      let r,c;
      if(dir===0){ r=j; c=i; }       // 上: 列ごとに上から
      else if(dir===1){ r=i; c=SIZE-1-j; } // 右: 行ごとに右から
      else if(dir===2){ r=SIZE-1-j; c=i; } // 下: 列ごとに下から
      else { r=i; c=j; }              // 左: 行ごとに左から
      line.push({r,c,val:grid[r][c]});
    }
    rows.push(line);
  }

  // 各行/列をスライド＆マージ
  for(const line of rows){
    // 値だけ抽出(0除去)
    const vals = line.map(x=>x.val).filter(v=>v>0);
    // マージ
    const merged = [];
    let i=0;
    while(i<vals.length){
      if(i+1<vals.length && vals[i]===vals[i+1]){
        const newVal = vals[i]+1;
        merged.push(newVal);
        score += SCORE_PER_LEVEL[Math.min(newVal,SCORE_PER_LEVEL.length-1)] || (newVal*100);
        if(newVal>mergedMax) mergedMax = newVal;
        if(newVal>maxLevel) maxLevel = newVal;
        i+=2;
      } else {
        merged.push(vals[i]);
        i++;
      }
    }
    // 0で埋める
    while(merged.length<SIZE) merged.push(0);
    // 書き戻し
    for(let j=0;j<SIZE;j++){
      const {r,c} = line[j];
      if(grid[r][c]!==merged[j]) moved=true;
      grid[r][c] = merged[j];
    }
  }

  if(!moved){
    prevState = null;
    return;
  }

  moveCount++;

  // コメント表示
  if(mergedMax>0 && mergedMax<MERGE_COMMENTS.length){
    setComment(MERGE_COMMENTS[mergedMax]);
  }

  // マージアニメーション
  render();
  if(mergedMax>0){
    // マージされたセルにpopアニメ
    for(let r=0;r<SIZE;r++){
      for(let c=0;c<SIZE;c++){
        if(grid[r][c]===mergedMax){
          const cell = dom.board.children[r*SIZE+c];
          if(cell) cell.classList.add('pop');
        }
      }
    }
  }

  // 新タイル生成
  spawnTile();
  render(); // spawnを反映するため再描画

  // ベストスコア更新
  if(score>bestScore){
    bestScore = score;
    localStorage.setItem(BEST_KEY, bestScore);
  }
  updateHUD();

  // セーブ
  saveCurrent();

  // ゲームオーバー判定
  if(isGameOver()){
    setTimeout(showGameOver, 400);
  }
}

function isGameOver(){
  for(let r=0;r<SIZE;r++)
    for(let c=0;c<SIZE;c++){
      if(grid[r][c]===0) return false;
      if(c+1<SIZE && grid[r][c]===grid[r][c+1]) return false;
      if(r+1<SIZE && grid[r][c]===grid[r+1][c]) return false;
    }
  return true;
}

function showGameOver(){
  const highestEvo = EVOLUTION[Math.min(maxLevel,EVOLUTION.length-1)]+' '+EVO_NAMES[Math.min(maxLevel,EVO_NAMES.length-1)];
  dom.goStats.innerHTML =
    '🏆 スコア: <strong>'+score+'</strong><br>'+
    '🔄 手数: '+moveCount+'<br>'+
    '🧬 最高進化: '+highestEvo;
  dom.goComment.textContent = GAMEOVER_COMMENTS[Math.floor(Math.random()*GAMEOVER_COMMENTS.length)];

  // シェアボタン（既存があれば削除して再生成）
  const existing = document.getElementById('share-btn');
  if(existing) existing.remove();

  const shareBtn = document.createElement('button');
  shareBtn.id = 'share-btn';
  shareBtn.textContent = '𝕏 結果をシェア';
  shareBtn.style.cssText =
    'display:block;width:80%;max-width:280px;margin:8px auto;'+
    'padding:14px 0;border:none;border-radius:12px;'+
    'font-family:inherit;font-size:1.1rem;font-weight:700;'+
    'cursor:pointer;transition:transform .15s,box-shadow .15s;'+
    'background:linear-gradient(135deg,#1da1f2,#0d8bd9);color:#fff;';
  shareBtn.addEventListener('mouseenter',function(){
    this.style.transform='scale(1.04)';
    this.style.boxShadow='0 0 20px rgba(29,161,242,.4)';
  });
  shareBtn.addEventListener('mouseleave',function(){
    this.style.transform='';
    this.style.boxShadow='';
  });
  shareBtn.addEventListener('click',function(){
    const gameURL = window.location.href;
    const text = '\u{1F9EC} シュール進化論\n'+
      'スコア: '+score+'点\n'+
      '最高進化: '+highestEvo+'\n'+
      '手数: '+moveCount+'\n\n'+
      '#シュールゲームス\n'+gameURL;
    const url = 'https://twitter.com/intent/tweet?text='+encodeURIComponent(text);
    window.open(url,'_blank','noopener');
  });

  // retryボタンの前に挿入
  dom.retryBtn.parentNode.insertBefore(shareBtn, dom.retryBtn);

  localStorage.removeItem(SAVE_KEY);
  sg.onGameEnd(score);
  showScreen('gameover');
}

/* ── Undo ── */
function undo(){
  if(!prevState) return;
  grid = prevState.grid;
  score = prevState.score;
  maxLevel = prevState.maxLevel;
  moveCount = prevState.moveCount;
  prevState = null;
  render();
  updateHUD();
  setComment('一手戻した！');
  saveCurrent();
}

/* ── セーブ/ロード ── */
function saveCurrent(){
  localStorage.setItem(SAVE_KEY, JSON.stringify({
    grid, score, maxLevel, moveCount
  }));
}
function loadSave(){
  try{
    const d = JSON.parse(localStorage.getItem(SAVE_KEY));
    if(d && d.grid && d.grid.length===SIZE) return d;
  }catch(e){}
  return null;
}
function updateBestDisplay(){
  if(bestScore>0){
    dom.highscoreDisp.textContent = '🏆 ベストスコア: '+bestScore;
  }
}

/* ── 入力: キーボード ── */
function handleKey(e){
  if(dom.gameScreen.classList.contains('hidden')) return;
  const map = {
    ArrowUp:0, ArrowRight:1, ArrowDown:2, ArrowLeft:3,
    w:0, d:1, s:2, a:3,
    W:0, D:1, S:2, A:3,
  };
  if(map[e.key]!==undefined){
    e.preventDefault();
    move(map[e.key]);
  }
}

/* ── 入力: スワイプ ── */
function setupSwipe(){
  let sx,sy;
  const container = dom.board;

  container.addEventListener('pointerdown',e=>{
    sx=e.clientX; sy=e.clientY;
    container.setPointerCapture(e.pointerId);
  });

  container.addEventListener('pointerup',e=>{
    if(dom.gameScreen.classList.contains('hidden')) return;
    const dx=e.clientX-sx, dy=e.clientY-sy;
    const abx=Math.abs(dx), aby=Math.abs(dy);
    if(Math.max(abx,aby)<20) return; // タップ無視
    if(abx>aby){
      move(dx>0?1:3);
    } else {
      move(dy>0?2:0);
    }
  });
}

/* ── 起動 ── */
init();

})();
