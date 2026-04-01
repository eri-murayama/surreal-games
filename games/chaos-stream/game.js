/* ========================================
   カオス配信シミュレーター - game.js
   推しの配信者を育てて人気者にしよう！
   3日間の配信を乗り越えろ！
   エンジン部分。シナリオは外部ファイルから読み込み。
   ======================================== */

(function() {
  'use strict';

  var sg = SurrealGames.init('chaos-stream');

  // ---------- 状態 ----------
  var popularity = 0, subscribers = 0, viewers = 0;
  var selectedChar = null, currentScene = null, chatTimer = null, day = 1;

  // ---------- キャラクター定義 ----------
  var CHARACTERS = {
    kanikani: { name: 'かにかに', img: 'kanikani.png', genre: 'シルバニアファミリー開封', startViewers: 8, startPopularity: 5, startSubscribers: 2 },
    sakuranbo: { name: 'さくらんぼちゃん', img: 'sakuranbo.jpg', genre: 'コスメ・美容', startViewers: 15, startPopularity: 3, startSubscribers: 2 },
    softcream: { name: 'ソフトクリーム', img: 'softcream.png', genre: 'マルチ商法', startViewers: 5, startPopularity: 0, startSubscribers: 1 }
  };

  // ---------- DOM ----------
  var $ = function(id) { return document.getElementById(id); };
  var titleScreen = $('title-screen'), selectScreen = $('select-screen'), gameScreen = $('game-screen'), resultScreen = $('result-screen');
  var startBtn = $('start-btn'), retryBtn = $('retry-btn');
  var narrationText = $('narration-text'), characterImg = $('character-img'), choicesArea = $('choices-area'), chatMessages = $('chat-messages');
  var popularityBar = $('popularity-bar'), subscribersBar = $('subscribers-bar'), popularityValue = $('popularity-value'), subscribersValue = $('subscribers-value');
  var viewerCountEl = $('viewer-count'), streamContent = $('stream-content'), streamTitleEl = $('stream-title');
  var dayBadge = $('day-badge'), liveBadge = $('live-badge'), streamLayout = document.querySelector('.stream-layout');

  // ---------- チャットシステム ----------
  var chatNamesNormal = ['たこやき侍','ねこまんま','深夜のポテチ','わさび大臣','布団から出たくない','お茶漬け仙人','永遠の5歳児','バグった時計','迷子のGPS','筋肉痛予報士','おにぎり探偵','月曜日の天敵','逆走するカタツムリ','充電切れの勇者','味噌汁の妖精','Wi-Fi難民','二度寝のプロ','消しゴム収集家','無限ループ太郎','もやし会計士'];
  var chatNamesAnti = ['正義マン','通報済み','真実を見る目','被害者の会','草生やすな','目覚めた一般人','拡散希望','アンチではない'];
  var idleChatPools = {
    kanikani: ['初見です！','こんばんは～','シルバニア！','わくわく','かわいい！','癒される～','BGM良き'],
    sakuranbo: ['初見です！','きれい～','コスメ好き！','メイク上手い','買いたい！','参考になる','肌きれい'],
    softcream: ['…','は？','またマルチか','通報した','うさんくさい','低評価押した','BANされろ','やめとけ']
  };
  var antiComments = ['通報しました','詐欺じゃん','マルチ乙','洗脳されてる','消費者庁案件','低評価','嘘つき','目を覚ませ','BANしろ','金返せ','恥ずかしくないの？','犯罪者'];

  function randomFrom(a) { return a[Math.floor(Math.random() * a.length)]; }
  function addChat(text, isSpecial, isAnti) {
    var d = document.createElement('div');
    d.className = 'chat-msg color-' + Math.floor(Math.random() * 6) + (isAnti ? ' anti' : '');
    d.innerHTML = '<span class="chat-name">' + randomFrom(isAnti ? chatNamesAnti : chatNamesNormal) + '</span>' + text;
    if (isSpecial) d.style.color = '#ffff00';
    chatMessages.appendChild(d); chatMessages.scrollTop = chatMessages.scrollHeight;
    while (chatMessages.children.length > 60) chatMessages.removeChild(chatMessages.firstChild);
  }
  function startIdleChat() {
    stopIdleChat();
    chatTimer = setInterval(function() {
      if (Math.random() < 0.6) {
        if (selectedChar === 'softcream' && Math.random() < 0.7) addChat(randomFrom(antiComments), false, true);
        else addChat(randomFrom(idleChatPools[selectedChar] || idleChatPools.kanikani));
      }
    }, 1500);
  }
  function stopIdleChat() { if (chatTimer) { clearInterval(chatTimer); chatTimer = null; } }
  function floodChat(msgs, delay) {
    delay = delay || 400;
    msgs.forEach(function(m, i) { setTimeout(function() { var a = m.startsWith('【ア】'); addChat(a ? m.slice(3) : m, i === 0, a); }, delay * i); });
  }

  // ---------- 投げ銭 ----------
  function showSuperchat(name, amount, message) {
    var el = document.createElement('div'); el.className = 'superchat-popup';
    var c = amount >= 10000 ? '#ff0000' : amount >= 5000 ? '#ff6600' : amount >= 1000 ? '#ffaa00' : '#00bcd4';
    el.innerHTML = '<div class="superchat-header" style="background:'+c+'"><span class="superchat-name">'+name+'</span><span class="superchat-amount">\u00a5'+amount.toLocaleString()+'</span></div><div class="superchat-body">'+message+'</div>';
    streamContent.appendChild(el);
    var cd = document.createElement('div'); cd.className = 'chat-msg superchat-chat';
    cd.innerHTML = '<span class="chat-name" style="color:'+c+'">\ud83d\udcb0 '+name+'</span>\u00a5'+amount.toLocaleString()+' '+message;
    chatMessages.appendChild(cd); chatMessages.scrollTop = chatMessages.scrollHeight;
    setTimeout(function() { el.classList.add('superchat-fade-out'); setTimeout(function() { el.remove(); }, 500); }, 3000);
  }

  // ---------- ステータス ----------
  function updateStats() {
    var p = Math.max(0, Math.min(100, popularity)), s = Math.max(0, Math.min(100, subscribers));
    popularityBar.style.width = p + '%'; subscribersBar.style.width = s + '%';
    popularityValue.textContent = p; subscribersValue.textContent = (s * 100).toLocaleString();
    viewerCountEl.textContent = '\ud83d\udc41 ' + viewers + '\u4eba';
  }
  function addPopularity(n) { popularity += n; updateStats(); }
  function addSubscribers(n) { subscribers += n; updateStats(); }
  function addViewers(n) { viewers = Math.max(0, viewers + n); updateStats(); }

  // ---------- 演出 ----------
  function animateChar(a) { if (a) { characterImg.classList.remove('shake','spin','happy'); void characterImg.offsetWidth; characterImg.classList.add(a); } }
  function glitchScreen() { streamContent.classList.remove('glitch-effect'); void streamContent.offsetWidth; streamContent.classList.add('glitch-effect'); }

  // ---------- Day / モード切替 ----------
  function setLiveMode() { liveBadge.textContent = '\u25cf LIVE'; liveBadge.classList.remove('off-air'); streamLayout.classList.remove('yami-mode'); }
  function setYamiMode() { liveBadge.textContent = '\u25cf OFF AIR'; liveBadge.classList.add('off-air'); streamLayout.classList.add('yami-mode'); stopIdleChat(); }
  function showDayTransition(n, cb) { day = n; dayBadge.textContent = 'DAY ' + n; var o = document.createElement('div'); o.className = 'day-transition'; o.innerHTML = '<h2>DAY ' + n + '</h2>'; document.body.appendChild(o); setTimeout(function() { o.remove(); if (cb) cb(); }, 2200); }

  // ---------- シーンシステム ----------
  function getScenes() {
    if (selectedChar === 'kanikani')  return window.kanikanScenes;
    if (selectedChar === 'sakuranbo') return window.sakuranboScenes;
    if (selectedChar === 'softcream') return window.softcreamScenes;
    return window.kanikanScenes;
  }

  function showScene(sceneId) {
    var allScenes = getScenes(); currentScene = allScenes[sceneId];
    if (!currentScene) { showResult(); return; }
    narrationText.textContent = ''; choicesArea.innerHTML = '';
    if (currentScene.yami) setYamiMode(); else if (currentScene.live) setLiveMode();
    if (currentScene.animation) animateChar(currentScene.animation);
    if (currentScene.glitch) glitchScreen();
    if (currentScene.viewerDelta) addViewers(currentScene.viewerDelta);
    if (currentScene.chatFlood) floodChat(currentScene.chatFlood);
    if (currentScene.streamTitle) streamTitleEl.textContent = currentScene.streamTitle;
    if (currentScene.superchats) currentScene.superchats.forEach(function(sc, i) { setTimeout(function() { showSuperchat(sc.name, sc.amount, sc.message); }, 800 + i * 1200); });
    if (currentScene.dayTransition) { showDayTransition(currentScene.dayTransition, function() { if (currentScene.afterTransition) { setLiveMode(); startIdleChat(); } proceedScene(); }); return; }
    proceedScene();
  }

  function proceedScene() {
    typeText(currentScene.text, function() {
      if (currentScene.choices) {
        currentScene.choices.forEach(function(ch) {
          var btn = document.createElement('button');
          btn.className = 'choice-btn' + (ch.danger ? ' danger' : '');
          btn.textContent = ch.label;
          btn.addEventListener('click', function() {
            if (ch.popularity)  addPopularity(ch.popularity);
            if (ch.subscribers) addSubscribers(ch.subscribers);
            if (ch.viewers)     addViewers(ch.viewers);
            if (ch.chatFlood)   floodChat(ch.chatFlood);
            if (ch.superchats) ch.superchats.forEach(function(sc, i) { setTimeout(function() { showSuperchat(sc.name, sc.amount, sc.message); }, 300 + i * 1200); });
            showScene(ch.next);
          });
          choicesArea.appendChild(btn);
        });
      } else if (currentScene.next) { setTimeout(function() { showScene(currentScene.next); }, 2000); }
      else { showResult(); }
    });
  }

  var typeTimer = null;
  function typeText(text, cb) {
    if (typeTimer) clearInterval(typeTimer);
    var i = 0; narrationText.textContent = '';
    typeTimer = setInterval(function() { if (i < text.length) { narrationText.textContent += text[i]; i++; } else { clearInterval(typeTimer); typeTimer = null; if (cb) cb(); } }, 25);
  }

  // ---------- リザルト ----------
  function showResult() {
    stopIdleChat(); switchScreen(resultScreen);
    var p = Math.max(0, Math.min(100, popularity)), s = Math.max(0, Math.min(100, subscribers));
    $('final-popularity').textContent = p;
    $('final-subscribers').textContent = (s * 100).toLocaleString();
    $('final-viewers').textContent = viewers + '\u4eba';
    var cd = CHARACTERS[selectedChar], rank, emoji, desc, hp = p >= 50, hs = s >= 30;
    if (selectedChar === 'softcream') {
      if (s >= 80) { rank = '\u4f1d\u8aac\u306e\u66f4\u751fYouTuber'; emoji = '\ud83d\udc51'; desc = cd.name + '\u306f3\u65e5\u9593\u306e\u6fc0\u52d5\u3092\u7d4c\u3066\u767b\u9332\u8005100\u4e07\u4eba\u3092\u9054\u6210\uff01\n\u30a2\u30f3\u30c1\u3059\u3089\u30d5\u30a1\u30f3\u306b\u5909\u3048\u305f\u4f1d\u8aac\u306e\u914d\u4fe1\u8005\u3002'; }
      else if (hp && hs) { rank = '\u66f4\u751f\u306e\u661f'; emoji = '\u2b50'; desc = cd.name + '\u306f3\u65e5\u9593\u3067\u30de\u30eb\u30c1\u3092\u5352\u696d\u3057\u305f\uff01'; }
      else if (hp) { rank = '\u53cd\u7701\u4e2d\u914d\u4fe1\u8005'; emoji = '\ud83d\ude22'; desc = cd.name + '\u306f\u5c11\u3057\u305a\u3064\u5909\u308f\u308a\u59cb\u3081\u3066\u3044\u308b\u3002'; }
      else if (hs) { rank = '\u708e\u4e0a\u914d\u4fe1\u8005'; emoji = '\ud83d\udd25'; desc = cd.name + '\u306f\u708e\u4e0a\u3057\u305f\u3002\u30a2\u30f3\u30c1\u3070\u304b\u308a\u3002'; }
      else { rank = '\u8ff7\u8d70\u914d\u4fe1\u8005'; emoji = '\ud83d\udca8'; desc = cd.name + '\u306f\u307e\u3060\u30de\u30eb\u30c1\u306e\u6cbc\u304b\u3089\u629c\u3051\u51fa\u305b\u3066\u3044\u306a\u3044\u2026\u3002'; }
    } else {
      if (hp && hs) { rank = '\u5927\u4eba\u6c17\u914d\u4fe1\u8005'; emoji = '\ud83d\udc51'; desc = cd.name + '\u306f3\u65e5\u9593\u3067\u8d85\u4eba\u6c17\u914d\u4fe1\u8005\u306b\uff01\n\u30d5\u30a1\u30f3\u30af\u30e9\u30d6\u307e\u3067\u3067\u304d\u305f\uff01'; }
      else if (hp) { rank = '\u611b\u3055\u308c\u914d\u4fe1\u8005'; emoji = '\ud83d\udc96'; desc = cd.name + '\u306f\u8996\u8074\u8005\u306b\u611b\u3055\u308c\u3066\u3044\u308b\u3002'; }
      else if (hs) { rank = '\u8a71\u984c\u306e\u914d\u4fe1\u8005'; emoji = '\ud83d\udcc8'; desc = cd.name + '\u306f\u6ce8\u76ee\u3092\u96c6\u3081\u3066\u3044\u308b\uff01'; }
      else { rank = '\u65b0\u4eba\u914d\u4fe1\u8005'; emoji = '\ud83c\udf31'; desc = cd.name + '\u306f\u307e\u3060\u307e\u3060\u3053\u308c\u304b\u3089\uff01'; }
    }
    var res = sg.onGameEnd(p + s, { popularity: p, subscribers: s, viewers: viewers, character: selectedChar });
    $('result-emoji').textContent = emoji; $('result-rank').textContent = rank;
    $('result-rank').style.color = (selectedChar === 'softcream' && s >= 80) ? '#ff00ff' : hp && hs ? '#ffdd00' : hp ? '#44ff88' : hs ? '#ff8844' : '#888';
    $('result-description').textContent = desc;
    var or = document.querySelector('.sg-new-record'); if (or) or.remove();
    if (res.isNewHigh) { var nr = document.createElement('div'); nr.className = 'sg-new-record'; nr.textContent = '\ud83c\udf89 NEW RECORD!'; $('result-card').parentNode.insertBefore(nr, $('result-card')); }
    var ob = document.getElementById('share-btn'); if (ob) ob.remove();
    var sb = document.createElement('button'); sb.id = 'share-btn'; sb.className = 'cyber-btn'; sb.textContent = '\ud835\udd4f \u7d50\u679c\u3092\u30b7\u30a7\u30a2';
    sb.style.cssText = 'margin-top:12px;display:block;margin-left:auto;margin-right:auto;background:rgba(29,161,242,0.1);border-color:#1da1f2;color:#1da1f2;';
    sb.onmouseenter = function() { sb.style.background = '#1da1f2'; sb.style.color = '#0a0a12'; };
    sb.onmouseleave = function() { sb.style.background = 'rgba(29,161,242,0.1)'; sb.style.color = '#1da1f2'; };
    sb.onclick = function() { window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent('\ud83d\udcf9 \u30ab\u30aa\u30b9\u914d\u4fe1\u30b7\u30df\u30e5\u30ec\u30fc\u30bf\u30fc\n' + cd.name + '\u30923\u65e5\u9593\u5fdc\u63f4: ' + emoji + ' ' + rank + '\n#\u30b7\u30e5\u30fc\u30eb\u30b2\u30fc\u30e0\u30b9\n' + location.href), '_blank'); };
    retryBtn.parentNode.insertBefore(sb, retryBtn);
  }

  // ---------- 画面遷移 ----------
  function switchScreen(t) { document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); }); t.classList.add('active'); }
  function startGame(charId) {
    selectedChar = charId; day = 1; var c = CHARACTERS[charId];
    popularity = c.startPopularity; subscribers = c.startSubscribers; viewers = c.startViewers;
    characterImg.src = c.img; characterImg.alt = c.name; dayBadge.textContent = 'DAY 1';
    setLiveMode(); updateStats(); chatMessages.innerHTML = '';
    sg.onGameStart(); switchScreen(gameScreen); startIdleChat(); showScene('intro');
  }
  (function() { var h = sg.getHighScore(), e = $('sg-high-score-display'); if (h && e) { e.textContent = '\ud83c\udfc6 HIGH SCORE: ' + h; e.style.display = 'block'; } })();
  startBtn.addEventListener('click', function() { switchScreen(selectScreen); });
  retryBtn.addEventListener('click', function() { switchScreen(selectScreen); });
  document.querySelectorAll('.char-card').forEach(function(c) { c.addEventListener('click', function() { startGame(c.getAttribute('data-char')); }); });
})();
