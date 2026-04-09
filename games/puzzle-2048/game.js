(function(){'use strict';

/* ── 定数 ── */
const SIZE = 4;
const ANIM_MS = 120;
const EVO_IMAGES = [
  '',                         // 0: 空
  'images/softcream.png',     // 1: ソフトクリーム
  'images/protagonist.png',   // 2: 主人公
  'images/manmen-no-emi.png', // 3: 満面の笑み
  'images/illust10.png',      // 4: 謎の生物
  'images/atsushi.png',       // 5: 篤
  'images/kaidan-ghost.png',  // 6: おばけ
  'images/illust9.png',       // 7: さくらんぼちゃん
  'images/hakase-mount.png',  // 8: 博士
  'images/yoshinori.png',     // 9: ヨシノリ
  'images/kanikani.png',      // 10: かにかに
  'images/character.png',     // 11: カードキング
];

const EVO_NAMES = [
  '','ソフトクリーム','主人公','満面の笑み','謎の生物','篤','おばけ',
  'さくらんぼちゃん','博士','ヨシノリ','かにかに','カードキング'
];

const MERGE_COMMENTS = [
  '',
  'ソフトクリーム登場！甘い香り...',
  '主人公が現れた！冒険の始まり！',
  '満面の笑みがこぼれる！',
  '謎の生物が目覚めた！',
  '篤「俺は天才だ」',
  'おばけが現れた...！こわ！',
  'さくらんぼちゃん参上！',
  '博士が四つん這いで突進！',
  'ヨシノリ「筋肉は裏切らない」',
  'かにかに降臨！ハサミでチョキチョキ！',
  'カードキング爆誕！！これは...シュール！',
];

const GAMEOVER_COMMENTS = [
  '「進化の道は一つではない...」',
  '「ソフトクリームに始まりソフトクリームに終わる」',
  '「この盤面、芸術作品では？」',
  '「ダーウィンもびっくり」',
  '「次こそカードキングを目指せ」',
  '「かにかにに戻ってやり直したい人生」',
  '「シュールの神は言った：もう一回」',
];

const SCORE_PER_LEVEL = [0,0,4,8,16,32,64,128,256,512,1024,2048];

const BOARD_GLOW = [
  'none',
  '0 0 10px rgba(30,58,95,.4)',
  '0 0 12px rgba(30,95,58,.4)',
  '0 0 14px rgba(95,58,30,.4)',
  '0 0 16px rgba(95,30,95,.5)',
  '0 0 18px rgba(30,95,95,.5)',
  '0 0 20px rgba(95,95,30,.5)',
  '0 0 22px rgba(95,30,58,.5)',
  '0 0 25px rgba(58,30,95,.6)',
  '0 0 30px rgba(30,95,30,.6)',
  '0 0 35px rgba(255,107,107,.5),0 0 60px rgba(255,217,61,.3)',
  '0 0 40px rgba(255,0,255,.5),0 0 80px rgba(0,255,255,.3)',
];

const PARTICLE_COLORS = ['#ffea00','#ff6b6b','#76ff03','#00e5ff','#ff9100','#ff00ff'];

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
  boardContainer:$('board-container'),
  score:         $('hud-score'),
  best:          $('hud-best'),
  maxEvo:        $('hud-max-evo'),
  comment:       $('game-comment'),
  highscoreDisp: $('highscore-display'),
  goStats:       $('gameover-stats'),
  goComment:     $('gameover-comment'),
  titleEmoji:    $('title-emoji'),
  cutinOverlay:  $('cutin-overlay'),
  cutinChar:     $('cutin-char'),
  cutinName:     $('cutin-name'),
};

/* ── ゲーム状態 ── */
let grid, score, bestScore, maxLevel, prevState, moveCount, animating;
const SAVE_KEY = 'surreal_evo_save';
const BEST_KEY = 'surreal_evo_best';

/* ── 共通モジュール ── */
const sg = SurrealGames.init('puzzle-2048');

/* ── サウンドシステム ── */
function getAudio(){
  // game-commonのAudioContextを共有
  if(sg.sound && sg.sound.ctx) return sg.sound.ctx;
  return null;
}
function isMuted(){
  return sg.sound ? !sg.sound.enabled : false;
}
function playTone(freq,dur,type,vol,delay){
  if(isMuted()) return;
  try{
    const ctx=getAudio();
    if(!ctx) return;
    const t=ctx.currentTime+(delay||0);
    const osc=ctx.createOscillator();
    const gain=ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type=type||'sine';
    osc.frequency.value=freq;
    gain.gain.setValueAtTime(vol||0.1,t);
    gain.gain.exponentialRampToValueAtTime(0.001,t+dur);
    osc.start(t);
    osc.stop(t+dur);
  }catch(e){}
}
function sfxMerge(level){
  const f=300+level*50;
  playTone(f,0.12,'sine',0.12);
  playTone(f*1.25,0.12,'sine',0.08,0.05);
}
function sfxCombo(){
  playTone(800,0.08,'triangle',0.1);
  playTone(1000,0.08,'triangle',0.08,0.07);
  playTone(1200,0.12,'triangle',0.06,0.14);
}
function sfxCutIn(){
  playTone(400,0.08,'square',0.06);
  playTone(500,0.08,'square',0.06,0.08);
  playTone(600,0.08,'square',0.06,0.16);
  playTone(800,0.25,'square',0.08,0.24);
}
function sfxGameOver(){
  playTone(400,0.2,'sine',0.1);
  playTone(350,0.2,'sine',0.08,0.18);
  playTone(300,0.3,'sine',0.06,0.36);
  playTone(200,0.5,'sine',0.04,0.54);
}
function sfxSpawn(){
  playTone(600,0.06,'sine',0.04);
}

/* ── BGMシステム（宇宙SFXアンビエント） ── */
let bgmNodes = null;
let bgmPlaying = false;

function startBGM(){
  if(bgmPlaying) return;
  try{
    const ctx = getAudio();
    if(!ctx) return;
    if(ctx.state==='suspended') ctx.resume();
    const master = ctx.createGain();
    master.gain.value = 0.14;
    master.connect(ctx.destination);

    const timers = [];
    const oscs = [];

    // ── 深宇宙ドローン（超低音のうねり）──
    const drone = ctx.createOscillator();
    const droneG = ctx.createGain();
    drone.type = 'sine';
    drone.frequency.value = 40;
    droneG.gain.value = 0.3;
    drone.connect(droneG);
    droneG.connect(master);
    drone.start();
    oscs.push(drone);

    // ドローンのゆっくりした呼吸
    const breathLfo = ctx.createOscillator();
    const breathLfoG = ctx.createGain();
    breathLfo.type = 'sine';
    breathLfo.frequency.value = 0.03;
    breathLfoG.gain.value = 0.12;
    breathLfo.connect(breathLfoG);
    breathLfoG.connect(droneG.gain);
    breathLfo.start();
    oscs.push(breathLfo);

    // ── ワープ音（周期的にヒュィーーンと鳴る）──
    function scheduleWarp(){
      if(!bgmPlaying) return;
      timers.push(setTimeout(()=>{
        if(!bgmPlaying || isMuted()){ scheduleWarp(); return; }
        const t = ctx.currentTime;
        const dur = 1.5 + Math.random()*1.5;

        // 上昇スイープ
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sawtooth';
        const startF = 60 + Math.random()*40;
        o.frequency.setValueAtTime(startF, t);
        o.frequency.exponentialRampToValueAtTime(startF*12, t+dur*0.7);
        o.frequency.exponentialRampToValueAtTime(startF*15, t+dur);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.06, t+dur*0.1);
        g.gain.linearRampToValueAtTime(0.04, t+dur*0.5);
        g.gain.exponentialRampToValueAtTime(0.001, t+dur);

        // ローパスフィルターで柔らかく
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(300, t);
        lp.frequency.exponentialRampToValueAtTime(3000, t+dur*0.7);
        lp.frequency.exponentialRampToValueAtTime(200, t+dur);
        lp.Q.value = 5;

        o.connect(lp);
        lp.connect(g);
        g.connect(master);
        o.start(t);
        o.stop(t+dur+0.1);

        scheduleWarp();
      }, 5000+Math.random()*8000));
    }
    scheduleWarp();

    // ── ピカピカ音（高音のキラキラが連続で鳴る）──
    function scheduleSparkle(){
      if(!bgmPlaying) return;
      timers.push(setTimeout(()=>{
        if(!bgmPlaying || isMuted()){ scheduleSparkle(); return; }
        const t = ctx.currentTime;
        // 3〜6連のキラキラ
        const count = 3 + Math.floor(Math.random()*4);
        for(let i=0;i<count;i++){
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'sine';
          const freq = 1200+Math.random()*2000;
          o.frequency.value = freq;
          const start = t + i*0.12;
          g.gain.setValueAtTime(0, start);
          g.gain.linearRampToValueAtTime(0.05, start+0.02);
          g.gain.exponentialRampToValueAtTime(0.001, start+0.4);
          o.connect(g);
          g.connect(master);
          o.start(start);
          o.stop(start+0.4);
        }
        scheduleSparkle();
      }, 2000+Math.random()*4000));
    }
    scheduleSparkle();

    // ── 宇宙通信音（ピポパポ的なランダムビープ）──
    function scheduleBeep(){
      if(!bgmPlaying) return;
      timers.push(setTimeout(()=>{
        if(!bgmPlaying || isMuted()){ scheduleBeep(); return; }
        const t = ctx.currentTime;
        const count = 2 + Math.floor(Math.random()*3);
        for(let i=0;i<count;i++){
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'square';
          o.frequency.value = 400+Math.random()*800;
          const start = t + i*0.15;
          g.gain.setValueAtTime(0, start);
          g.gain.linearRampToValueAtTime(0.02, start+0.01);
          g.gain.setValueAtTime(0.02, start+0.06);
          g.gain.exponentialRampToValueAtTime(0.001, start+0.12);
          o.connect(g);
          g.connect(master);
          o.start(start);
          o.stop(start+0.12);
        }
        scheduleBeep();
      }, 6000+Math.random()*10000));
    }
    scheduleBeep();

    // ── リバース風シュワー（ホワイトノイズ → フェードイン）──
    function scheduleWhoosh(){
      if(!bgmPlaying) return;
      timers.push(setTimeout(()=>{
        if(!bgmPlaying || isMuted()){ scheduleWhoosh(); return; }
        const t = ctx.currentTime;
        const dur = 1.0+Math.random()*1.0;
        const bufSize = ctx.sampleRate * dur;
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for(let i=0;i<bufSize;i++) data[i] = (Math.random()*2-1)*0.5;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const g = ctx.createGain();
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(800, t);
        bp.frequency.linearRampToValueAtTime(2000, t+dur*0.8);
        bp.Q.value = 1;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.06, t+dur*0.7);
        g.gain.exponentialRampToValueAtTime(0.001, t+dur);
        src.connect(bp);
        bp.connect(g);
        g.connect(master);
        src.start(t);
        scheduleWhoosh();
      }, 8000+Math.random()*12000));
    }
    scheduleWhoosh();

    bgmNodes = { master, oscs, timers };
    bgmPlaying = true;
  }catch(e){}
}

function stopBGM(){
  if(!bgmNodes) return;
  try{
    bgmNodes.oscs.forEach(o=>{ try{o.stop();}catch(e){} });
    bgmNodes.timers.forEach(t=>clearTimeout(t));
    bgmNodes.master.disconnect();
  }catch(e){}
  bgmNodes = null;
  bgmPlaying = false;
}

/* ── セルサイズ計算 ── */
function getCellStep(){
  const w = dom.board.offsetWidth;
  return (w - 16 + 6) / SIZE;
}

/* ── 演出: スコアポップアップ ── */
function showScorePopup(r,c,pts){
  const step = getCellStep();
  const pad = 8;
  const el = document.createElement('div');
  el.className = 'score-popup';
  el.textContent = '+'+pts;
  el.style.left = (pad + c*step + step/2) + 'px';
  el.style.top = (pad + r*step) + 'px';
  dom.board.appendChild(el);
  setTimeout(()=>el.remove(),800);
}

/* ── 演出: パーティクル ── */
function spawnParticles(r,c,count){
  const step = getCellStep();
  const pad = 8;
  const cx = pad + c*step + step/2;
  const cy = pad + r*step + step/2;
  for(let i=0;i<count;i++){
    const el = document.createElement('div');
    el.className = 'particle';
    el.style.left = cx+'px';
    el.style.top = cy+'px';
    el.style.background = PARTICLE_COLORS[Math.floor(Math.random()*PARTICLE_COLORS.length)];
    const angle = Math.random()*Math.PI*2;
    const dist = 30+Math.random()*40;
    el.style.setProperty('--px', Math.cos(angle)*dist+'px');
    el.style.setProperty('--py', Math.sin(angle)*dist+'px');
    dom.board.appendChild(el);
    setTimeout(()=>el.remove(),600);
  }
}

/* ── 演出: コンボ表示 ── */
function showCombo(count){
  const el = document.createElement('div');
  el.className = 'combo-text';
  el.textContent = count+'コンボ！';
  dom.boardContainer.appendChild(el);
  sfxCombo();
  setTimeout(()=>el.remove(),800);
}

/* ── 演出: 画面シェイク ── */
function shakeBoard(){
  dom.board.classList.remove('shake');
  void dom.board.offsetWidth;
  dom.board.classList.add('shake');
  setTimeout(()=>dom.board.classList.remove('shake'),300);
}

/* ── 演出: 盤面グロウ ── */
function updateBoardGlow(){
  dom.board.style.boxShadow = BOARD_GLOW[Math.min(maxLevel,11)] || 'none';
}

/* ── 演出: 進化カットイン ── */
function showCutIn(level){
  const lvClamped = Math.min(level,11);
  dom.cutinChar.innerHTML = '<img src="'+EVO_IMAGES[lvClamped]+'" alt="'+EVO_NAMES[lvClamped]+'">';
  dom.cutinName.textContent = EVO_NAMES[lvClamped]+' 解放！';
  dom.cutinOverlay.classList.remove('hidden');
  // アニメーションリセット
  dom.cutinOverlay.style.animation = 'none';
  void dom.cutinOverlay.offsetWidth;
  dom.cutinOverlay.style.animation = '';
  sfxCutIn();
  setTimeout(()=>{
    dom.cutinOverlay.classList.add('hidden');
  },1400);
}

/* ── 初期化 ── */
function init(){
  bestScore = parseInt(localStorage.getItem(BEST_KEY)) || 0;
  animating = false;
  updateBestDisplay();

  // タイトルのキャラをランダムに
  const titleImages = EVO_IMAGES.filter(x=>x);
  const randomImg = titleImages[Math.floor(Math.random()*titleImages.length)];
  dom.titleEmoji.innerHTML = '<img src="'+randomImg+'" alt="キャラクター" style="width:100%;height:100%;object-fit:contain;">';

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
  stopBGM();
  startBGM();
  animating = false;
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
  updateBoardGlow();
  setComment('');
}

function newGame(){
  grid = Array.from({length:SIZE},()=>Array(SIZE).fill(0));
  score = 0;
  maxLevel = 1;
  moveCount = 0;
  prevState = null;
  animating = false;
  spawnTile();
  spawnTile();
}

/* ── タイル生成 ── */
function spawnTile(){
  const empties = [];
  for(let r=0;r<SIZE;r++)
    for(let c=0;c<SIZE;c++)
      if(grid[r][c]===0) empties.push([r,c]);
  if(empties.length===0) return null;
  const [r,c] = empties[Math.floor(Math.random()*empties.length)];
  grid[r][c] = Math.random()<0.9 ? 1 : 2;
  return {r,c};
}

/* ── 描画 ── */
function render(movements){
  dom.board.innerHTML = '';
  const step = movements ? getCellStep() : 0;

  for(let r=0;r<SIZE;r++){
    for(let c=0;c<SIZE;c++){
      const div = document.createElement('div');
      div.className = 'cell';
      const lv = grid[r][c];
      if(lv>0){
        const lvClamped = Math.min(lv,11);
        div.setAttribute('data-level', lvClamped);
        const img = document.createElement('img');
        img.src = EVO_IMAGES[lvClamped];
        img.alt = EVO_NAMES[lvClamped];
        img.draggable = false;
        div.appendChild(img);

        if(movements){
          const mv = movements.get(r+','+c);
          if(mv){
            const dx = (mv.fc - c) * step;
            const dy = (mv.fr - r) * step;
            if(dx || dy){
              div.style.transform = 'translate('+dx+'px,'+dy+'px)';
              div.style.zIndex = '2';
            }
          }
        }
      }
      dom.board.appendChild(div);
    }
  }

  if(movements){
    dom.board.offsetHeight;
    const cells = dom.board.children;
    for(let i=0;i<cells.length;i++){
      if(cells[i].style.transform){
        cells[i].style.transition = 'transform '+ANIM_MS+'ms ease';
        cells[i].style.transform = '';
      }
    }
  }
}

function evoDisplay(lv){
  const lvClamped = Math.min(lv, 11);
  return '<img src="'+EVO_IMAGES[lvClamped]+'" alt="'+EVO_NAMES[lvClamped]+'" class="evo-icon"> '+EVO_NAMES[lvClamped];
}

function updateHUD(){
  dom.score.textContent = 'スコア: '+score;
  dom.best.textContent = 'ベスト: '+bestScore;
  dom.maxEvo.innerHTML = evoDisplay(maxLevel);
  if(bestScore>0){
    dom.highscoreDisp.textContent = '🏆 ベストスコア: '+bestScore;
  }
}

function setComment(text){
  dom.comment.textContent = text;
}

/* ── 移動ロジック ── */
function move(dir){
  if(animating) return;

  // 状態保存(undo用)
  prevState = {
    grid: grid.map(r=>[...r]),
    score: score,
    maxLevel: maxLevel,
    moveCount: moveCount,
  };

  const prevMaxLevel = maxLevel;
  let moved = false;
  let mergedMax = 0;
  let mergeCount = 0;
  const movements = new Map();
  const mergedCells = [];

  // dirに応じてスライド方向を決定
  const rows = [];
  for(let i=0;i<SIZE;i++){
    const line = [];
    for(let j=0;j<SIZE;j++){
      let r,c;
      if(dir===0){ r=j; c=i; }
      else if(dir===1){ r=i; c=SIZE-1-j; }
      else if(dir===2){ r=SIZE-1-j; c=i; }
      else { r=i; c=j; }
      line.push({r,c,val:grid[r][c]});
    }
    rows.push(line);
  }

  // 各行/列をスライド＆マージ
  const scoreGains = [];
  for(const line of rows){
    const vals = [];
    const srcs = [];
    for(let j=0;j<line.length;j++){
      if(line[j].val>0){
        vals.push(line[j].val);
        srcs.push({r:line[j].r, c:line[j].c});
      }
    }

    const merged = [];
    const mSrcs = [];
    let i=0;
    while(i<vals.length){
      if(i+1<vals.length && vals[i]===vals[i+1]){
        const newVal = vals[i]+1;
        merged.push(newVal);
        mSrcs.push([srcs[i], srcs[i+1]]);
        const pts = SCORE_PER_LEVEL[Math.min(newVal,SCORE_PER_LEVEL.length-1)] || (newVal*100);
        score += pts;
        if(newVal>mergedMax) mergedMax = newVal;
        if(newVal>maxLevel) maxLevel = newVal;
        mergeCount++;
        i+=2;
      } else {
        merged.push(vals[i]);
        mSrcs.push([srcs[i]]);
        i++;
      }
    }
    while(merged.length<SIZE) merged.push(0);

    // グリッド書き戻し
    for(let j=0;j<SIZE;j++){
      const {r,c} = line[j];
      if(grid[r][c]!==merged[j]) moved=true;
      grid[r][c] = merged[j];
    }

    // 移動トラッキング
    for(let j=0;j<merged.length;j++){
      if(merged[j]===0) continue;
      const destR = line[j].r;
      const destC = line[j].c;
      const sources = mSrcs[j];
      let best = sources[0];
      let bestDist = Math.abs(best.r-destR) + Math.abs(best.c-destC);
      for(let k=1;k<sources.length;k++){
        const d = Math.abs(sources[k].r-destR) + Math.abs(sources[k].c-destC);
        if(d>bestDist){ best=sources[k]; bestDist=d; }
      }
      if(bestDist>0){
        movements.set(destR+','+destC, {fr:best.r, fc:best.c});
      }
      if(sources.length>1){
        const pts = SCORE_PER_LEVEL[Math.min(merged[j],SCORE_PER_LEVEL.length-1)] || (merged[j]*100);
        mergedCells.push({r:destR, c:destC, pts:pts});
      }
    }
  }

  if(!moved){
    prevState = null;
    return;
  }

  moveCount++;
  animating = true;

  // コメント表示
  if(mergedMax>0 && mergedMax<MERGE_COMMENTS.length){
    setComment(MERGE_COMMENTS[mergedMax]);
  }

  // 合体音
  if(mergedMax>0) sfxMerge(mergedMax);

  // スライドアニメーション付き描画
  render(movements);

  // アニメーション完了後の演出
  setTimeout(()=>{
    const spawned = spawnTile();
    render();

    // マージ演出: pop + パーティクル + スコアポップアップ
    mergedCells.forEach(({r,c,pts})=>{
      const cell = dom.board.children[r*SIZE+c];
      if(cell) cell.classList.add('pop');
      spawnParticles(r,c, mergedMax>=7 ? 12 : 6);
      showScorePopup(r,c,pts);
    });

    // 画面シェイク（Lv7以上の合体時）
    if(mergedMax>=7) shakeBoard();

    // コンボ表示（2個以上同時合体）
    if(mergeCount>=2) showCombo(mergeCount);

    // 進化カットイン（新レベル到達時）
    if(maxLevel>prevMaxLevel && maxLevel>=3){
      setTimeout(()=>showCutIn(maxLevel), 200);
    }

    // スポーンアニメ
    if(spawned){
      sfxSpawn();
      const cell = dom.board.children[spawned.r*SIZE+spawned.c];
      if(cell){
        cell.classList.add('spawn');
        setTimeout(()=>cell.classList.remove('spawn'),250);
      }
    }

    // ベストスコア更新
    if(score>bestScore){
      bestScore = score;
      localStorage.setItem(BEST_KEY, bestScore);
    }
    updateHUD();
    updateBoardGlow();
    saveCurrent();

    animating = false;

    // ゲームオーバー判定
    if(isGameOver()){
      setTimeout(()=>{
        sfxGameOver();
        showGameOver();
      }, 400);
    }
  }, ANIM_MS);
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
  stopBGM();
  const highestEvoName = EVO_NAMES[Math.min(maxLevel,EVO_NAMES.length-1)];
  const highestEvo = highestEvoName;
  dom.goStats.innerHTML =
    '🏆 スコア: <strong>'+score+'</strong><br>'+
    '🔄 手数: '+moveCount+'<br>'+
    '🧬 最高進化: '+evoDisplay(maxLevel);
  dom.goComment.textContent = GAMEOVER_COMMENTS[Math.floor(Math.random()*GAMEOVER_COMMENTS.length)];

  // シェアボタン
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

  dom.retryBtn.parentNode.insertBefore(shareBtn, dom.retryBtn);

  localStorage.removeItem(SAVE_KEY);
  sg.onGameEnd(score);
  showScreen('gameover');
}

/* ── Undo ── */
function undo(){
  if(!prevState || animating) return;
  grid = prevState.grid;
  score = prevState.score;
  maxLevel = prevState.maxLevel;
  moveCount = prevState.moveCount;
  prevState = null;
  render();
  updateHUD();
  updateBoardGlow();
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
    if(Math.max(abx,aby)<20) return;
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
