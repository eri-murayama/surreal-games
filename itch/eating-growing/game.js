// ===== GAME CONFIG =====
const STAGES = [
    {
        id: 1,
        title: 'STAGE 1：家族の食卓',
        description: '妻と子供がつくってくれた愛情たっぷりの料理。\n楽しみにしている家族の笑顔を見ても…\nひろとの食欲はとまらない！',
        rivals: [
            { name: '妻', emoji: '👩', sadEmoji: '😢', angryEmoji: '😭', hand: '🤚' },
            { name: '息子', emoji: '👦', sadEmoji: '😢', angryEmoji: '😭', hand: '✋' },
            { name: '娘', emoji: '👧', sadEmoji: '😢', angryEmoji: '😭', hand: '🤚' },
        ],
        foods: [
            { emoji: '🍚', name: 'ごはん', kcal: 500 },
            { emoji: '🍖', name: '唐揚げ', kcal: 600 },
            { emoji: '🍳', name: '卵焼き', kcal: 350 },
            { emoji: '🍜', name: '味噌汁', kcal: 200 },
            { emoji: '🥟', name: '餃子', kcal: 550 },
            { emoji: '🐟', name: '焼き魚', kcal: 400 },
            { emoji: '🥘', name: '肉じゃが', kcal: 700 },
            { emoji: '🍚', name: 'おかわり', kcal: 500 },
            { emoji: '🥒', name: '漬物', kcal: 80 },
            { emoji: '🍖', name: '唐揚げ②', kcal: 600 },
            { emoji: '🍙', name: 'おにぎり', kcal: 400 },
            { emoji: '🍛', name: 'カレーライス', kcal: 750 },
            { emoji: '🍤', name: 'エビフライ', kcal: 650 },
            { emoji: '🍢', name: 'おでん', kcal: 300 },
            { emoji: '🥢', name: '納豆', kcal: 150 },
            { emoji: '🍲', name: '豚汁', kcal: 450 },
        ],
        timeLimit: 30,
        // Hand difficulty: gentle start
        rivalInterval: 3000,
        reachDuration: 2.5,
        initialHandDelay: 2000,
        initialHandCount: 1,
        maxSimultaneousHands: 1,
        handsRampUp: false,
        resultTitle: '家族崩壊ディナー',
        reactions: [
            { threshold: 80, text: '妻「…………」\n息子「パパ、ぼくのからあげ…」\n娘「うえぇぇぇん！！」\n\n食卓に涙が溢れた。' },
            { threshold: 50, text: '妻「少しは残してよ…」\n息子「パパずるい！」\n\nちょっと気まずい食卓になった。' },
            { threshold: 0, text: '妻「あら、今日は控えめね」\n\n家族の平和は守られた…が、ひろとの胃は満たされない。' },
        ],
    },
    {
        id: 2,
        title: 'STAGE 2：友達と鍋パーティー',
        description: '友達の家で鍋パーティー！\nみんなで囲む豪華な食材が山盛り…\nひろとの目が光る！！',
        rivals: [
            { name: 'たけし', emoji: '🧑', sadEmoji: '😠', angryEmoji: '🤬', hand: '✋' },
            { name: 'ゆうこ', emoji: '👱‍♀️', sadEmoji: '😤', angryEmoji: '🤬', hand: '🤚' },
            { name: 'けんた', emoji: '👨‍🦱', sadEmoji: '😡', angryEmoji: '🤬', hand: '✋' },
        ],
        foods: [
            { emoji: '🫕', name: '鍋（白菜）', kcal: 500 },
            { emoji: '🥩', name: '牛肉', kcal: 800 },
            { emoji: '🍄', name: 'しいたけ', kcal: 200 },
            { emoji: '🥬', name: '白菜', kcal: 150 },
            { emoji: '🍜', name: 'うどん', kcal: 600 },
            { emoji: '🥕', name: '人参', kcal: 150 },
            { emoji: '🧅', name: '長ねぎ', kcal: 100 },
            { emoji: '🥟', name: '水餃子', kcal: 550 },
            { emoji: '🫕', name: '鍋（豆腐）', kcal: 300 },
            { emoji: '🍚', name: '雑炊', kcal: 700 },
            { emoji: '🍺', name: 'ビール', kcal: 400 },
            { emoji: '🥩', name: '豚バラ', kcal: 750 },
            { emoji: '🦐', name: 'エビ', kcal: 500 },
            { emoji: '🌽', name: 'とうもろこし', kcal: 350 },
            { emoji: '🍢', name: 'つくね', kcal: 450 },
            { emoji: '🍙', name: '〆おにぎり', kcal: 400 },
            { emoji: '🥚', name: '卵', kcal: 300 },
            { emoji: '🍲', name: 'キムチ鍋', kcal: 650 },
            { emoji: '🫘', name: '豆腐', kcal: 200 },
            { emoji: '🍖', name: '手羽元', kcal: 600 },
        ],
        timeLimit: 30,
        // Hand difficulty: moderate
        rivalInterval: 2000,
        reachDuration: 2.0,
        initialHandDelay: 1000,
        initialHandCount: 1,
        maxSimultaneousHands: 2,
        handsRampUp: true,
        resultTitle: '友情破壊鍋パーティー',
        reactions: [
            { threshold: 80, text: 'たけし「お前マジふざけんなよ！！」\nゆうこ「もう二度と誘わない」\nけんた「…帰れ」\n\n友達をすべて失った。' },
            { threshold: 50, text: 'たけし「食いすぎだろ…」\nゆうこ「次から呼ばないよ？」\n\n空気が凍りついた。' },
            { threshold: 0, text: 'たけし「お、今日は普通じゃん」\n\n奇跡的に友情は保たれた。' },
        ],
    },
    {
        id: 3,
        title: 'STAGE 3：職場の飲み会',
        description: '今日は部署の歓迎会。\n部長が奮発して高級料理を注文…\nひろとのラストバトルが始まる！！',
        rivals: [
            { name: '部長', emoji: '👨‍💼', sadEmoji: '😡', angryEmoji: '🤬', hand: '🖐️' },
            { name: '先輩', emoji: '👩‍💼', sadEmoji: '😤', angryEmoji: '😠', hand: '✋' },
            { name: '同僚', emoji: '🧑‍💼', sadEmoji: '😰', angryEmoji: '😨', hand: '🤚' },
            { name: '新人', emoji: '👶', sadEmoji: '😢', angryEmoji: '😭', hand: '✋' },
        ],
        foods: [
            { emoji: '🍺', name: 'ビール', kcal: 500 },
            { emoji: '🍣', name: '寿司盛り', kcal: 700 },
            { emoji: '🍶', name: '日本酒', kcal: 400 },
            { emoji: '🍤', name: '天ぷら盛り', kcal: 700 },
            { emoji: '🦀', name: 'カニ', kcal: 550 },
            { emoji: '🍣', name: '大トロ', kcal: 900 },
            { emoji: '🥩', name: '和牛たたき', kcal: 1500 },
            { emoji: '🍺', name: 'ビール②', kcal: 500 },
            { emoji: '🐟', name: '刺身盛り', kcal: 800 },
            { emoji: '🍶', name: '大吟醸', kcal: 450 },
            { emoji: '🦑', name: 'イカの姿造り', kcal: 600 },
            { emoji: '🍣', name: 'うに軍艦', kcal: 800 },
            { emoji: '🍢', name: '焼き鳥盛り', kcal: 700 },
            { emoji: '🥃', name: '芋焼酎', kcal: 600 },
            { emoji: '🍲', name: 'すき焼き', kcal: 1100 },
            { emoji: '🍱', name: '松花堂弁当', kcal: 1400 },
            { emoji: '🍺', name: 'ビール③', kcal: 500 },
            { emoji: '🐙', name: 'たこ刺し', kcal: 500 },
            { emoji: '🍙', name: '焼きおにぎり', kcal: 450 },
            { emoji: '🥢', name: '茶碗蒸し', kcal: 350 },
            { emoji: '🦐', name: 'エビの塩焼き', kcal: 550 },
            { emoji: '🫕', name: 'もつ鍋', kcal: 1000 },
            { emoji: '🍡', name: 'みたらし団子', kcal: 400 },
            { emoji: '🍵', name: '抹茶アイス', kcal: 500 },
        ],
        timeLimit: 35,
        // Hand difficulty: hard
        rivalInterval: 1200,
        reachDuration: 1.4,
        initialHandDelay: 500,
        initialHandCount: 2,
        maxSimultaneousHands: 3,
        handsRampUp: true,
        resultTitle: '社会的死の宴',
        reactions: [
            { threshold: 80, text: '部長「……お前、明日から来なくていいぞ」\n先輩「私の寿司…私の寿司ぃぃ！」\n新人「こ、こわいです…」\n\n翌日、異動辞令が届いた。' },
            { threshold: 50, text: '部長「食うのはいいが…限度があるだろ」\n先輩「ちょっと引くわ」\n\n査定に響きそうな空気。' },
            { threshold: 0, text: '部長「お、遠慮してるな。もっと食え」\n\n上司の評価は上がった…が、胃は不満。' },
        ],
    },
];

// Stage 4 is special (bonus) - defined separately
const STAGE4 = {
    id: 4,
    title: 'STAGE 4：おばあちゃんのおにぎり',
    timeLimit: 15,
};

const HIROTO_COMMENTS = {
    start: ['うまそう…全部食ってやる', 'いただきまーす！！', '腹が…減った…！！'],
    eating: ['もぐもぐ…', 'うっま！！', 'はむはむ…', '止まらん！', 'もう一個！', 'これも俺の！', 'ンまーーい！', 'はぁ…幸せ…', 'まだまだ食える！', '最高かよ…！'],
    combo: ['連続で食うぜ！', 'コンボ！！', '食べるの止められない！', 'フードファイター！', '怒涛の連食！！'],
    slap: ['触んな！俺のだ！', 'ぺしっ！！', 'こっち来んな！', 'どけぇ！！', 'この料理は渡さん！', '俺の獲物だ！'],
    rivalAte: ['あっ！取られた！', 'くそっ！先を越された！', 'しまった！！', 'ぐぬぬ…！'],
    timeWarning: ['やべぇ時間ない！', '急げ急げ！', '全部食い尽くせ！', 'ラストスパート！！'],
    onigiri: ['おばあちゃん…！', 'うまい…うますぎる…！', 'もう一個…！', '涙が出てきた…', 'これだよこれ…！', '愛の味だ…！', 'おかわり！！', '幸せだなぁ…'],
};

const HIROTO_BODIES = [
    { maxWeight: 75, emoji: '🧔', label: 'ふつう' },
    { maxWeight: 90, emoji: '😀', label: 'ぽっちゃり' },
    { maxWeight: 110, emoji: '😆', label: 'でっぷり' },
    { maxWeight: 130, emoji: '🤤', label: 'メガ級' },
    { maxWeight: 150, emoji: '😵', label: 'ギガ級' },
    { maxWeight: 175, emoji: '🫠', label: 'テラ級' },
    { maxWeight: 200, emoji: '💀', label: '人間超越' },
    { maxWeight: Infinity, emoji: '🌍', label: '惑星級' },
];

const RANKS = [
    { minKcal: 40000, title: '🌍 惑星級フードモンスター 🌍', subtitle: 'もはや人間ではない…' },
    { minKcal: 30000, title: '🏆 伝説の大食い王 🏆', subtitle: '人間の限界を超えた…' },
    { minKcal: 20000, title: '👑 食い尽くしマスター', subtitle: '周囲に人がいなくなった' },
    { minKcal: 12000, title: '🔥 フードファイター', subtitle: 'かなりの被害を出した' },
    { minKcal: 6000, title: '🍖 大食い見習い', subtitle: 'もっと食べられたはず' },
    { minKcal: 0, title: '🥬 小食のひろと', subtitle: 'ひろとらしくない…' },
];

// ===== CUTSCENE after Stage 3 =====
const STAGE3_CUTSCENE = [
    { speaker: 'ひろと', text: '家族から嫌われ、友人とは疎遠になり、\n会社でも浮いている…。\n俺は何か間違っていたのか？', speakerColor: '#c25830' },
    { speaker: '？？？', text: 'おまち', speakerColor: '#6b5e4f' },
    { speaker: 'ひろと', text: 'その声は…！', speakerColor: '#c25830' },
    { speaker: 'おばあちゃん', text: 'ひろとの大好きなおにぎり、\nたくさん握ってやるから\n満足するまでお食べ', speakerColor: '#4a7a6a' },
    { speaker: 'ひろと', text: 'お、おばあちゃん！！！！', speakerColor: '#c25830' },
];

// ===== GAME STATE =====
let state = {
    currentStage: 0,
    totalKcal: 0,
    weight: 65.0,
    stageKcal: 0,
    stageFoodsEaten: 0,
    handsSlapped: 0,
    combo: 0,
    lastEatTime: 0,
    timer: null,
    timeLeft: 0,
    rivalTimer: null,
    activeHands: [],
    gameActive: false,
    cutsceneStep: 0,
    onigiriCount: 0,
    bonusActive: false,
};

// ===== SCREEN MANAGEMENT =====
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// ===== CHARACTER INTRO SEQUENCE =====
const INTRO_SEQUENCE = [
    {
        text: 'うえーい！ふううう！イエスイエス！\nひろとだぜ！\n記憶に残せよ、この名前をな！',
        btn: '次へ',
        action: 'next',
    },
    {
        text: '俺はいわゆる食い尽くし系男。\n今日もテーブルに並ぶ全てを\n食べつくすぜ',
        btn: 'いくぜ！',
        action: 'tutorial',
    },
];

function startGame() {
    state.currentStage = 0;
    state.totalKcal = 0;
    state.weight = 65.0;
    state.onigiriCount = 0;
    showCharIntro(0);
}
function resetGame() { showScreen('title-screen'); }

function showCharIntro(step) {
    if (step >= INTRO_SEQUENCE.length) {
        showTutorial();
        return;
    }
    const intro = INTRO_SEQUENCE[step];
    const img = document.getElementById('char-intro-img');
    img.src = 'hiroto.png';
    img.style.display = '';
    img.style.animation = 'none';
    void img.offsetWidth;
    img.style.animation = 'charIntroAppear 0.6s cubic-bezier(0.17, 0.67, 0.35, 1.3)';

    const bubble = document.getElementById('char-intro-bubble');
    bubble.textContent = intro.text;
    bubble.style.animation = 'none';
    void bubble.offsetWidth;
    bubble.style.animation = 'bubblePop 0.4s ease 0.3s both';

    const btn = document.getElementById('char-intro-btn');
    btn.textContent = intro.btn;
    btn.onclick = () => {
        if (intro.action === 'tutorial') {
            showTutorial();
        } else {
            showCharIntro(step + 1);
        }
    };
    showScreen('char-intro');
}

function showTutorial() {
    const bubble = document.getElementById('char-intro-bubble');
    const img = document.getElementById('char-intro-img');
    img.style.display = 'none';

    bubble.innerHTML = `
        <div class="tutorial-icon">🍖 vs ✋</div>
        <div class="tutorial-text">他の人に食べられる前に<br>食材を食べつくせ！</div>
        <div class="tutorial-rules">
            <div class="tutorial-rule">
                <span class="tutorial-rule-icon">🍖</span>
                <span class="tutorial-rule-text"><strong>食べ物をタップ</strong>して食べろ！<br>カロリーを稼いで太れ！</span>
            </div>
            <div class="tutorial-rule">
                <span class="tutorial-rule-icon">✋</span>
                <span class="tutorial-rule-text"><strong>伸びてくる手をタップ</strong>して叩け！<br>食べ物を守れ！</span>
            </div>
        </div>
        <div class="tutorial-text" style="font-size:24px;">食べて食べて食べまくれ！</div>
    `;
    bubble.style.animation = 'none';
    void bubble.offsetWidth;
    bubble.style.animation = 'bubblePop 0.4s ease 0.1s both';

    const btn = document.getElementById('char-intro-btn');
    btn.textContent = 'ゲームスタート！';
    btn.onclick = () => {
        img.style.display = '';
        showStageIntro();
    };
    showScreen('char-intro');
}

function showStageIntro() {
    const stage = STAGES[state.currentStage];
    document.getElementById('stage-title').textContent = stage.title;
    document.getElementById('stage-description').textContent = stage.description;
    document.getElementById('stage-characters').innerHTML =
        '🧔 vs ' + stage.rivals.map(r => r.emoji).join(' ');
    showScreen('stage-intro');
}

// ===== START STAGE =====
function startStage() {
    const stage = STAGES[state.currentStage];
    state.stageKcal = 0;
    state.stageFoodsEaten = 0;
    state.handsSlapped = 0;
    state.combo = 0;
    state.lastEatTime = 0;
    state.timeLeft = stage.timeLimit;
    state.activeHands = [];
    state.gameActive = true;

    document.getElementById('stage-label').textContent = `STAGE ${stage.id}`;
    updateHUD();
    updateHirotoBody();
    showComment(randomFrom(HIROTO_COMMENTS.start));

    applyTableTheme(state.currentStage);
    renderRivalSeats(stage);
    renderFood(stage);
    showScreen('game-screen');
    startTimer(stage);

    // Initial hands after delay
    setTimeout(() => {
        if (!state.gameActive) return;
        for (let i = 0; i < stage.initialHandCount; i++) {
            setTimeout(() => spawnRandomHand(stage), i * 300);
        }
    }, stage.initialHandDelay);

    startRivalReaching(stage);
}

function renderRivalSeats(stage) {
    const container = document.getElementById('rival-seats');
    container.innerHTML = '';
    container.style.display = '';
    stage.rivals.forEach((rival, i) => {
        const div = document.createElement('div');
        div.className = 'rival-seat';
        div.id = `rival-${i}`;
        div.innerHTML = `<span class="rival-emoji">${rival.emoji}</span><span class="rival-name">${rival.name}</span>`;
        container.appendChild(div);
    });
}

function renderFood(stage) {
    const container = document.getElementById('food-container');
    container.innerHTML = '';
    if (stage.foods.length > 16) {
        container.style.gridTemplateColumns = 'repeat(5, 1fr)';
    } else {
        container.style.gridTemplateColumns = 'repeat(4, 1fr)';
    }
    stage.foods.forEach((food, index) => {
        const div = document.createElement('div');
        div.className = 'food-item';
        div.id = `food-${index}`;
        div.dataset.index = index;
        div.innerHTML = `${food.emoji}<span class="kcal-label">${food.kcal}</span>`;
        div.addEventListener('click', (e) => {
            e.stopPropagation();
            eatFood(index, food, div);
        });
        div.style.animationDelay = `${index * 0.03}s`;
        container.appendChild(div);
    });
}

// ===== EAT FOOD =====
function eatFood(index, food, element) {
    if (!state.gameActive || element.classList.contains('eaten') || element.classList.contains('rival-eaten')) return;

    element.classList.add('eaten');
    state.stageKcal += food.kcal;
    state.totalKcal += food.kcal;
    state.stageFoodsEaten++;
    state.weight += food.kcal / 350;

    // Combo
    const now = Date.now();
    if (now - state.lastEatTime < 1500) {
        state.combo++;
        if (state.combo >= 3) {
            showCombo(state.combo);
            const bonus = state.combo * 30;
            state.stageKcal += bonus;
            state.totalKcal += bonus;
        }
        if (state.combo === 3) showComment(randomFrom(HIROTO_COMMENTS.combo));
    } else {
        state.combo = 1;
    }
    state.lastEatTime = now;

    // Screen shake
    const screen = document.getElementById('game-screen');
    screen.classList.remove('screen-shake');
    void screen.offsetWidth;
    screen.classList.add('screen-shake');

    // Weight milestone flash
    if (Math.floor(state.weight / 10) > Math.floor((state.weight - food.kcal / 350) / 10)) {
        spawnWeightFlash();
    }

    spawnEatEffect(element, food);
    if (!state.bonusActive) {
        showComment(randomFrom(HIROTO_COMMENTS.eating));
    } else {
        showComment(randomFrom(HIROTO_COMMENTS.onigiri));
    }
    updateHUD();
    updateHirotoBody();
    checkAllEaten();
}

// ===== RIVAL REACHING =====
function spawnRandomHand(stage) {
    if (!state.gameActive) return;
    const availableFoods = document.querySelectorAll('.food-item:not(.eaten):not(.rival-eaten):not(.hand-targeting)');
    if (availableFoods.length === 0) return;

    const rivalIndex = Math.floor(Math.random() * stage.rivals.length);
    const rival = stage.rivals[rivalIndex];
    const targetFood = availableFoods[Math.floor(Math.random() * availableFoods.length)];
    const foodIndex = parseInt(targetFood.dataset.index);
    targetFood.classList.add('hand-targeting');
    spawnReachingHand(rival, rivalIndex, targetFood, foodIndex, stage);
}

function startRivalReaching(stage) {
    if (state.rivalTimer) clearInterval(state.rivalTimer);

    state.rivalTimer = setInterval(() => {
        if (!state.gameActive) return;

        const availableFoods = document.querySelectorAll('.food-item:not(.eaten):not(.rival-eaten):not(.hand-targeting)');
        if (availableFoods.length === 0) return;

        // Calculate hands to spawn based on stage config
        let handsToSpawn = stage.maxSimultaneousHands;

        if (stage.handsRampUp) {
            const elapsed = (stage.timeLimit - state.timeLeft);
            const progression = elapsed / stage.timeLimit;
            handsToSpawn = 1;
            if (progression > 0.25) handsToSpawn = Math.min(2, stage.maxSimultaneousHands + 1);
            if (progression > 0.5) handsToSpawn = Math.min(3, stage.maxSimultaneousHands + 2);
            if (progression > 0.75) handsToSpawn = Math.min(4, stage.maxSimultaneousHands + 2);
        }

        handsToSpawn = Math.min(handsToSpawn, availableFoods.length);

        const usedFoods = new Set();
        for (let i = 0; i < handsToSpawn; i++) {
            const remaining = Array.from(availableFoods).filter(f => !usedFoods.has(f));
            if (remaining.length === 0) break;

            const rivalIndex = Math.floor(Math.random() * stage.rivals.length);
            const rival = stage.rivals[rivalIndex];
            const targetFood = remaining[Math.floor(Math.random() * remaining.length)];
            usedFoods.add(targetFood);
            const foodIndex = parseInt(targetFood.dataset.index);
            targetFood.classList.add('hand-targeting');
            setTimeout(() => {
                if (state.gameActive) spawnReachingHand(rival, rivalIndex, targetFood, foodIndex, stage);
            }, i * 150);
        }
    }, stage.rivalInterval);
}

function spawnReachingHand(rival, rivalIndex, targetFood, foodIndex, stage) {
    const table = document.getElementById('table-surface');
    const tableRect = table.getBoundingClientRect();
    const foodRect = targetFood.getBoundingClientRect();

    const foodCenterX = foodRect.left + foodRect.width / 2 - tableRect.left;
    const foodCenterY = foodRect.top + foodRect.height / 2 - tableRect.top;

    const hand = document.createElement('div');
    hand.className = 'reaching-hand';
    hand.textContent = rival.hand;
    hand.dataset.rivalIndex = rivalIndex;
    hand.dataset.foodIndex = foodIndex;

    const directions = ['from-top', 'from-left', 'from-right', 'from-bottom'];
    const dir = directions[Math.floor(Math.random() * directions.length)];
    hand.classList.add(dir);

    const duration = stage.reachDuration;
    hand.style.setProperty('--reach-duration', duration + 's');

    if (dir === 'from-top') {
        hand.style.left = foodCenterX - 18 + 'px';
        hand.style.setProperty('--reach-y', (foodCenterY - 10) + 'px');
    } else if (dir === 'from-left') {
        hand.style.top = foodCenterY - 18 + 'px';
        hand.style.setProperty('--reach-x', (foodCenterX - 10) + 'px');
        hand.style.setProperty('--reach-y', '0px');
    } else if (dir === 'from-right') {
        hand.style.top = foodCenterY - 18 + 'px';
        hand.style.setProperty('--reach-x', (-1 * (tableRect.width - foodCenterX) + 10) + 'px');
        hand.style.setProperty('--reach-y', '0px');
    } else {
        hand.style.left = foodCenterX - 18 + 'px';
        hand.style.setProperty('--reach-y', (-1 * (tableRect.height - foodCenterY) + 10) + 'px');
    }

    hand.addEventListener('click', (e) => {
        e.stopPropagation();
        slapHand(hand, targetFood, rivalIndex, stage);
    });

    table.appendChild(hand);
    state.activeHands.push(hand);

    const grabTimeout = setTimeout(() => {
        if (!hand.parentNode || hand.classList.contains('slapped')) return;
        if (!state.gameActive) return;

        hand.classList.add('grabbed');
        targetFood.classList.remove('hand-targeting');
        targetFood.classList.add('rival-eaten');
        state.stageFoodsEaten++;

        showComment(randomFrom(HIROTO_COMMENTS.rivalAte));

        const rivalEl = document.getElementById(`rival-${rivalIndex}`);
        if (rivalEl) {
            rivalEl.querySelector('.rival-emoji').textContent = '😋';
            setTimeout(() => {
                if (rivalEl) rivalEl.querySelector('.rival-emoji').textContent = stage.rivals[rivalIndex].emoji;
            }, 800);
        }

        setTimeout(() => { if (hand.parentNode) hand.remove(); }, 400);
        checkAllEaten();
    }, duration * 1000);

    hand.dataset.grabTimeout = grabTimeout;
}

function slapHand(hand, targetFood, rivalIndex, stage) {
    if (hand.classList.contains('slapped') || hand.classList.contains('grabbed')) return;

    clearTimeout(parseInt(hand.dataset.grabTimeout));
    hand.classList.add('slapped');
    targetFood.classList.remove('hand-targeting');
    state.handsSlapped++;

    const table = document.getElementById('table-surface');
    const handRect = hand.getBoundingClientRect();
    const tableRect = table.getBoundingClientRect();

    const slap = document.createElement('div');
    slap.className = 'slap-effect';
    slap.textContent = '👋💥';
    slap.style.left = (handRect.left - tableRect.left) + 'px';
    slap.style.top = (handRect.top - tableRect.top) + 'px';
    table.appendChild(slap);
    setTimeout(() => slap.remove(), 450);

    const rivalEl = document.getElementById(`rival-${rivalIndex}`);
    if (rivalEl) {
        rivalEl.querySelector('.rival-emoji').textContent = '😣';
        rivalEl.querySelector('.rival-emoji').style.transform = 'scale(0.8)';
        setTimeout(() => {
            if (rivalEl) {
                rivalEl.querySelector('.rival-emoji').textContent = stage.rivals[rivalIndex].emoji;
                rivalEl.querySelector('.rival-emoji').style.transform = '';
            }
        }, 600);
    }

    showComment(randomFrom(HIROTO_COMMENTS.slap));
    setTimeout(() => { if (hand.parentNode) hand.remove(); }, 350);
}

// ===== EFFECTS =====
function spawnEatEffect(element, food) {
    const container = document.getElementById('eat-effect');
    const rect = element.getBoundingClientRect();

    const particleCount = food.kcal >= 800 ? 5 : food.kcal >= 500 ? 4 : 3;
    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.className = 'eat-particle';
        p.textContent = food.emoji;
        p.style.left = rect.left + rect.width / 2 + 'px';
        p.style.top = rect.top + 'px';
        p.style.setProperty('--dx', (Math.random() - 0.5) * 120 + 'px');
        p.style.setProperty('--dy', (-30 - Math.random() * 80) + 'px');
        p.style.setProperty('--rot', (Math.random() * 360) + 'deg');
        container.appendChild(p);
        setTimeout(() => p.remove(), 700);
    }

    const popup = document.createElement('div');
    popup.className = 'kcal-popup';
    if (food.kcal >= 1000) popup.classList.add('mega');
    else if (food.kcal >= 700) popup.classList.add('large');
    else if (food.kcal >= 400) popup.classList.add('medium');
    else popup.classList.add('small');
    popup.textContent = `+${food.kcal} kcal`;
    popup.style.left = rect.left + rect.width / 2 - 30 + 'px';
    popup.style.top = rect.top - 10 + 'px';
    container.appendChild(popup);
    setTimeout(() => popup.remove(), 1000);
}

function showCombo(count) {
    const existing = document.querySelector('.combo-display');
    if (existing) existing.remove();
    const div = document.createElement('div');
    div.className = 'combo-display';
    if (count >= 6) div.classList.add('mega-combo');
    div.textContent = count >= 6 ? `🔥 ${count} COMBO! 🔥` : `${count} COMBO!`;
    document.getElementById('game-screen').appendChild(div);
    setTimeout(() => div.remove(), 600);
}

function spawnWeightFlash() {
    const flash = document.createElement('div');
    flash.className = 'weight-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 300);
}

// ===== TIMER =====
function startTimer(stage) {
    if (state.timer) clearInterval(state.timer);
    const startTime = Date.now();
    const duration = stage.timeLimit * 1000;

    state.timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, duration - elapsed);
        state.timeLeft = remaining / 1000;

        const fill = document.getElementById('timer-fill');
        fill.style.width = (remaining / duration * 100) + '%';

        if (remaining < 6000) {
            fill.classList.add('warning');
            if (remaining > 5800 && remaining < 6000) {
                showComment(randomFrom(HIROTO_COMMENTS.timeWarning));
            }
        } else {
            fill.classList.remove('warning');
        }

        if (remaining <= 0) {
            if (state.bonusActive) {
                endBonusStage();
            } else {
                endStage();
            }
        }
    }, 100);
}

function checkAllEaten() {
    const remaining = document.querySelectorAll('.food-item:not(.eaten):not(.rival-eaten)');
    if (remaining.length === 0) {
        setTimeout(() => {
            if (state.bonusActive) {
                // In bonus, respawn onigiri
                spawnBonusOnigiri();
            } else {
                endStage();
            }
        }, 300);
    }
}

function updateHUD() {
    document.getElementById('score-display').textContent = state.totalKcal.toLocaleString() + ' kcal';
    document.getElementById('weight-display').textContent = state.weight.toFixed(1) + ' kg';
}

function updateHirotoBody() {
    const body = HIROTO_BODIES.find(b => state.weight < b.maxWeight) || HIROTO_BODIES[HIROTO_BODIES.length - 1];
    const el = document.getElementById('hiroto-body');
    el.textContent = body.emoji;
    const scale = 1 + (state.weight - 65) / 80;
    el.style.transform = `scale(${Math.min(scale, 2.2)})`;
}

function showComment(text) {
    const el = document.getElementById('hiroto-comment');
    el.textContent = text;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = 'commentPop 0.2s ease';
}

// ===== END STAGE =====
function endStage() {
    state.gameActive = false;
    if (state.timer) clearInterval(state.timer);
    if (state.rivalTimer) clearInterval(state.rivalTimer);

    state.activeHands.forEach(h => {
        if (h.dataset.grabTimeout) clearTimeout(parseInt(h.dataset.grabTimeout));
        if (h.parentNode) h.remove();
    });
    state.activeHands = [];

    const stage = STAGES[state.currentStage];
    const hirotoAte = document.querySelectorAll('.food-item.eaten').length;
    const totalFoods = stage.foods.length;
    const eatPercent = Math.round(hirotoAte / totalFoods * 100);
    const reaction = stage.reactions.find(r => eatPercent >= r.threshold) || stage.reactions[stage.reactions.length - 1];

    stage.rivals.forEach((rival, i) => {
        const el = document.getElementById(`rival-${i}`);
        if (!el) return;
        if (eatPercent >= 80) {
            el.classList.add(stage.id === 1 ? 'crying' : 'angry');
            el.querySelector('.rival-emoji').textContent = rival.angryEmoji;
        } else if (eatPercent >= 50) {
            el.querySelector('.rival-emoji').textContent = rival.sadEmoji;
        }
    });

    setTimeout(() => showStageResult(stage, hirotoAte, totalFoods, eatPercent, reaction), 1000);
}

function showStageResult(stage, hirotoAte, totalFoods, eatPercent, reaction) {
    document.getElementById('result-title').textContent = stage.resultTitle;

    const body = HIROTO_BODIES.find(b => state.weight < b.maxWeight) || HIROTO_BODIES[HIROTO_BODIES.length - 1];
    document.getElementById('result-hiroto').textContent = body.emoji;

    document.getElementById('result-stats').innerHTML = `
        食べた量: ${hirotoAte} / ${totalFoods} 品 (${eatPercent}%)<br>
        摂取カロリー: ${state.stageKcal.toLocaleString()} kcal<br>
        叩いた手: ${state.handsSlapped} 回<br>
        現在の体重: ${state.weight.toFixed(1)} kg (${body.label})
    `;

    document.getElementById('result-reaction').innerHTML = reaction.text.replace(/\n/g, '<br>');

    const nextBtn = document.getElementById('next-stage-btn');
    if (state.currentStage < STAGES.length - 1) {
        nextBtn.textContent = '次のステージへ';
        nextBtn.onclick = () => { state.currentStage++; showStageIntro(); };
    } else {
        // After Stage 3 → cutscene
        nextBtn.textContent = '次へ';
        nextBtn.onclick = () => { state.cutsceneStep = 0; showCutscene(); };
    }

    showScreen('stage-result');
}

// ===== CUTSCENE (After Stage 3) =====
function showCutscene() {
    const step = state.cutsceneStep;
    if (step >= STAGE3_CUTSCENE.length) {
        // This branch is handled by the kakutei animation in the button click
        return;
    }

    const scene = STAGE3_CUTSCENE[step];
    const img = document.getElementById('char-intro-img');
    img.src = 'hiroto.png';
    img.style.display = '';
    img.style.animation = 'none';
    void img.offsetWidth;

    // Darken hiroto for sad scenes
    if (step <= 0) {
        img.style.filter = 'grayscale(0.5) brightness(0.7)';
        img.style.animation = '';
    } else if (step >= 3) {
        img.style.filter = '';
        img.style.animation = 'charIntroAppear 0.6s cubic-bezier(0.17, 0.67, 0.35, 1.3)';
    } else {
        img.style.filter = '';
        img.style.animation = '';
    }

    const bubble = document.getElementById('char-intro-bubble');
    bubble.innerHTML = `<span style="color:${scene.speakerColor};font-weight:bold;font-family:'Zen Kurenaido',sans-serif;">${scene.speaker}</span><br>${scene.text}`;
    bubble.style.animation = 'none';
    void bubble.offsetWidth;
    bubble.style.animation = 'bubblePop 0.3s ease 0.1s both';

    const btn = document.getElementById('char-intro-btn');
    btn.textContent = step < STAGE3_CUTSCENE.length - 1 ? '…' : 'おばあちゃん…！';
    btn.onclick = () => {
        state.cutsceneStep++;
        if (state.cutsceneStep >= STAGE3_CUTSCENE.length) {
            // Play kakutei animation before bonus stage
            playKakuteiAnimation(() => {
                showBonusIntro();
            });
            return;
        }
        showCutscene();
    };

    showScreen('char-intro');
}

// ===== BONUS STAGE (Stage 4) =====
function showBonusIntro() {
    const img = document.getElementById('char-intro-img');
    img.src = 'hiroto.png';
    img.style.display = 'none';
    img.style.filter = '';

    const bubble = document.getElementById('char-intro-bubble');
    bubble.innerHTML = `
        <div class="tutorial-icon">🍙🍙🍙</div>
        <div class="tutorial-text">STAGE 4：おばあちゃんのおにぎり</div>
        <div style="font-size:14px;line-height:1.8;margin:12px 0;color:#6b5e4f;">
            おばあちゃんが握ってくれるおにぎりを<br>
            ひたすら連打して食べまくれ！<br>
            <strong style="color:var(--accent-blue, #6a8fa0);">邪魔する手はない。ただ連打して食べるだけ。</strong><br>
            <span style="color:var(--accent-warm, #c25830);">制限時間15秒のボーナスステージ！</span>
        </div>
    `;
    bubble.style.animation = 'none';
    void bubble.offsetWidth;
    bubble.style.animation = 'bubblePop 0.4s ease 0.1s both';

    const btn = document.getElementById('char-intro-btn');
    btn.textContent = 'いただきます！！';
    btn.onclick = () => {
        img.style.display = '';
        startBonusStage();
    };

    showScreen('char-intro');
}

function startBonusStage() {
    state.stageKcal = 0;
    state.combo = 0;
    state.lastEatTime = 0;
    state.onigiriCount = 0;
    state.bonusActive = true;
    state.gameActive = true;
    state.timeLeft = STAGE4.timeLimit;

    document.getElementById('stage-label').textContent = 'STAGE 4 BONUS';
    updateHUD();
    updateHirotoBody();
    showComment('おばあちゃんのおにぎり…！');

    // Hide rival seats
    document.getElementById('rival-seats').style.display = 'none';
    document.getElementById('rival-seats').innerHTML = '';

    // Apply grandma table theme
    applyTableTheme(3);

    // Start onigiri rain effect
    startOnigiriRain();

    spawnBonusOnigiri();
    showScreen('game-screen');
    startTimer(STAGE4);
}

function spawnBonusOnigiri() {
    if (!state.gameActive || !state.bonusActive) return;

    const container = document.getElementById('food-container');
    container.innerHTML = '';
    container.style.gridTemplateColumns = '1fr';

    const food = { emoji: '🍙', name: 'おばあちゃんのおにぎり', kcal: 500 };

    const div = document.createElement('div');
    div.className = 'food-item bonus-onigiri';
    div.id = 'food-0';
    div.dataset.index = '0';
    div.innerHTML = `${food.emoji}`;
    div.addEventListener('click', (e) => {
        e.stopPropagation();
        state.onigiriCount++;
        // Add kcal without removing the onigiri
        state.stageKcal += food.kcal;
        state.totalKcal += food.kcal;
        state.weight += food.kcal / 350;

        // Combo
        const now = Date.now();
        if (now - state.lastEatTime < 1500) {
            state.combo++;
            if (state.combo >= 3) {
                showCombo(state.combo);
                const bonus = state.combo * 30;
                state.stageKcal += bonus;
                state.totalKcal += bonus;
            }
        } else {
            state.combo = 1;
        }
        state.lastEatTime = now;

        // Visual feedback: bounce
        div.style.animation = 'none';
        void div.offsetWidth;
        div.style.animation = 'onigiriBounce 0.2s ease';

        // Screen shake
        const screen = document.getElementById('game-screen');
        screen.classList.remove('screen-shake');
        void screen.offsetWidth;
        screen.classList.add('screen-shake');

        spawnEatEffect(div, food);
        showComment(randomFrom(HIROTO_COMMENTS.onigiri));
        updateHUD();
        updateHirotoBody();
    });
    container.appendChild(div);
}

function endBonusStage() {
    state.gameActive = false;
    state.bonusActive = false;
    if (state.timer) clearInterval(state.timer);

    // Stop onigiri rain and reset table
    stopOnigiriRain();
    const table = document.getElementById('table-surface');
    STAGE_TABLE_THEMES.forEach(t => table.classList.remove(t));

    setTimeout(() => showFinalResult(), 500);
}

// ===== FINAL =====
function showFinalResult() {
    const body = HIROTO_BODIES.find(b => state.weight < b.maxWeight) || HIROTO_BODIES[HIROTO_BODIES.length - 1];
    const rank = RANKS.find(r => state.totalKcal >= r.minKcal) || RANKS[RANKS.length - 1];
    const weightGain = (state.weight - 65).toFixed(1);

    const finalImg = document.getElementById('final-hiroto-img');
    const finalEmoji = document.getElementById('final-hiroto');
    if (state.totalKcal >= 12000) {
        finalImg.classList.add('show');
        finalEmoji.style.display = 'none';
    } else {
        finalImg.classList.remove('show');
        finalEmoji.style.display = '';
        finalEmoji.textContent = body.emoji;
    }

    document.getElementById('final-stats').innerHTML = `
        総摂取カロリー: <strong>${state.totalKcal.toLocaleString()} kcal</strong><br>
        最終体重: <strong>${state.weight.toFixed(1)} kg</strong> (+${weightGain} kg)<br>
        おにぎり: <strong>${state.onigiriCount} 個</strong> 🍙<br>
        体型: <strong>${body.label}</strong>
    `;
    document.getElementById('final-rank').innerHTML = `${rank.title}<br><span style="font-size:16px;color:var(--ink-light, #6b5e4f)">${rank.subtitle}</span>`;

    showScreen('final-result');
}

function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// ===== KAKUTEI (PACHINKO CONFIRMATION) ANIMATION =====
function playKakuteiAnimation(callback) {
    const overlay = document.getElementById('kakutei-overlay');
    const shojiTop = overlay.querySelector('.shoji-panel.top');
    const shojiBottom = overlay.querySelector('.shoji-panel.bottom');
    const rainbow = overlay.querySelector('.kakutei-rainbow');
    const grandma = overlay.querySelector('.kakutei-grandma');
    const text = overlay.querySelector('.kakutei-text');
    const raysContainer = document.getElementById('kakutei-rays');

    // Generate light rays
    raysContainer.innerHTML = '';
    for (let i = 0; i < 16; i++) {
        const ray = document.createElement('div');
        ray.className = 'kakutei-ray';
        ray.style.transform = `rotate(${i * 22.5}deg)`;
        ray.style.opacity = 0.3 + Math.random() * 0.4;
        raysContainer.appendChild(ray);
    }

    // Reset states
    shojiTop.classList.remove('open');
    shojiBottom.classList.remove('open');
    rainbow.classList.remove('show');
    grandma.classList.remove('show');
    text.classList.remove('show');
    raysContainer.classList.remove('show');

    overlay.classList.add('active');

    // Step 1: Shoji doors close (already closed), flash
    setTimeout(() => {
        const flash = document.createElement('div');
        flash.className = 'kakutei-flash';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 300);
    }, 400);

    // Step 2: Shoji doors slide open
    setTimeout(() => {
        shojiTop.classList.add('open');
        shojiBottom.classList.add('open');
    }, 800);

    // Step 3: Rainbow glow appears
    setTimeout(() => {
        rainbow.classList.add('show');
        raysContainer.classList.add('show');
    }, 1200);

    // Step 4: Grandma appears
    setTimeout(() => {
        grandma.classList.add('show');
    }, 1600);

    // Step 5: Flash + 確定 text
    setTimeout(() => {
        const flash2 = document.createElement('div');
        flash2.className = 'kakutei-flash';
        document.body.appendChild(flash2);
        setTimeout(() => flash2.remove(), 300);
        text.classList.add('show');
    }, 2200);

    // Step 6: Hold, then clean up
    setTimeout(() => {
        overlay.classList.remove('active');
        rainbow.classList.remove('show');
        grandma.classList.remove('show');
        text.classList.remove('show');
        raysContainer.classList.remove('show');
        if (callback) callback();
    }, 3800);
}

// ===== ONIGIRI RAIN EFFECT (during bonus stage) =====
let onigiriRainTimer = null;
function startOnigiriRain() {
    if (onigiriRainTimer) clearInterval(onigiriRainTimer);
    onigiriRainTimer = setInterval(() => {
        const onigiri = document.createElement('div');
        onigiri.className = 'onigiri-rain';
        onigiri.textContent = '🍙';
        onigiri.style.left = Math.random() * 100 + 'vw';
        onigiri.style.top = '-50px';
        onigiri.style.animationDuration = (2 + Math.random() * 2) + 's';
        document.body.appendChild(onigiri);
        setTimeout(() => onigiri.remove(), 4000);
    }, 400);
}
function stopOnigiriRain() {
    if (onigiriRainTimer) {
        clearInterval(onigiriRainTimer);
        onigiriRainTimer = null;
    }
}

// ===== TABLE THEME PER STAGE =====
const STAGE_TABLE_THEMES = ['stage-home', 'stage-party', 'stage-work', 'stage-grandma'];

function applyTableTheme(stageIndex) {
    const table = document.getElementById('table-surface');
    // Remove all stage themes
    STAGE_TABLE_THEMES.forEach(t => table.classList.remove(t));
    if (stageIndex >= 0 && stageIndex < STAGE_TABLE_THEMES.length) {
        table.classList.add(STAGE_TABLE_THEMES[stageIndex]);
    }
}
