// ============================================================
//  シュールの塔 — 終わりなきローグライク v2.0
//  戦略的プレイで高階層を目指せる本格ローグライク
// ============================================================

(() => {
  'use strict';

  const sg = SurrealGames.init('tower');

  // ===== 定数 =====
  const TILE = 32;
  const MAP_W = 15;
  const MAP_H = 15;
  const CANVAS_W = MAP_W * TILE;
  const CANVAS_H = MAP_H * TILE;
  const SAVE_KEY = 'tower_save_v2';
  const BEST_KEY = 'tower_best_floor_v2';
  const GACHA_COST = 10;
  const BOSS_INTERVAL = 5;  // ボスは5階ごと
  const SHOP_INTERVAL = 3;  // ショップは3階ごと

  const T = { WALL: 0, FLOOR: 1, STAIR: 2, TRAP: 3, SHOP: 4, REST: 5, TREASURE: 6 };

  const $ = id => document.getElementById(id);
  const canvas = $('game-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;

  const titleScreen = $('title-screen');
  const gameScreen = $('game-screen');
  const levelupScreen = $('levelup-screen');
  const gachaScreen = $('gacha-screen');
  const gameoverScreen = $('gameover-screen');

  // ===== パーティクルシステム =====
  const particles = [];
  function spawnParticle(x, y, text, color, size = 16, life = 40, vy = -1.5, vx = 0) {
    particles.push({ x, y, text, color, size, life, maxLife: life, vy, vx, alpha: 1 });
  }
  function spawnDamageNumber(tileX, tileY, dmg, color = '#ff6b6b') {
    const px = tileX * TILE + TILE / 2 + (Math.random() - 0.5) * 10;
    const py = tileY * TILE;
    spawnParticle(px, py, `-${dmg}`, color, 14, 35, -1.8);
  }
  function spawnHealNumber(tileX, tileY, val) {
    const px = tileX * TILE + TILE / 2;
    const py = tileY * TILE;
    spawnParticle(px, py, `+${val}`, '#66bb6a', 14, 35, -1.8);
  }
  function spawnExplosion(tileX, tileY) {
    const cx = tileX * TILE + TILE / 2;
    const cy = tileY * TILE + TILE / 2;
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      spawnParticle(cx, cy, '*', '#ffa726', 12, 20, Math.sin(angle) * 2, Math.cos(angle) * 2);
    }
  }
  function spawnLevelUpEffect(tileX, tileY) {
    const cx = tileX * TILE + TILE / 2;
    const cy = tileY * TILE + TILE / 2;
    const stars = ['*', '+', '.'];
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 / 12) * i;
      spawnParticle(cx, cy, stars[i % 3], '#ffd700', 10 + Math.random() * 6, 30 + Math.random() * 20, Math.sin(angle) * 2.5, Math.cos(angle) * 2.5);
    }
  }
  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.y += p.vy;
      p.x += (p.vx || 0);
      p.life--;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) particles.splice(i, 1);
    }
  }
  function drawParticles() {
    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.font = `bold ${p.size}px 'DotGothic16', monospace`;
      ctx.fillStyle = p.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.text, p.x, p.y);
      ctx.restore();
    }
  }

  // ===== 画面シェイク =====
  let shakeIntensity = 0;
  let shakeDuration = 0;
  function screenShake(intensity = 4, duration = 8) {
    shakeIntensity = intensity;
    shakeDuration = duration;
  }

  // ===== フラッシュエフェクト =====
  let flashColor = null;
  let flashAlpha = 0;
  function screenFlash(color = '#fff', alpha = 0.3) {
    flashColor = color;
    flashAlpha = alpha;
  }

  // ===== 敵データ =====
  const ENEMY_TYPES = [
    // 序盤 (1-5F)
    { emoji: '👁️', name: 'さまよう目玉', hp: 8, atk: 3, def: 0, exp: 2, coins: 2, behavior: 'wander' },
    { emoji: '🪑', name: 'いかりのイス', hp: 12, atk: 4, def: 1, exp: 3, coins: 3, behavior: 'chase' },
    { emoji: '🍙', name: 'にげるおにぎり', hp: 6, atk: 2, def: 0, exp: 4, coins: 5, behavior: 'flee' },
    { emoji: '🧦', name: 'かたっぽ靴下', hp: 10, atk: 3, def: 1, exp: 2, coins: 2, behavior: 'wander' },
    { emoji: '🧸', name: 'くまのなきごえ', hp: 14, atk: 5, def: 1, exp: 3, coins: 3, behavior: 'patrol' },
    // 中盤 (6-15F)
    { emoji: '🎩', name: 'しゃべるシルクハット', hp: 20, atk: 7, def: 2, exp: 6, coins: 5, behavior: 'chase' },
    { emoji: '🍣', name: 'さかなのうらみ寿司', hp: 16, atk: 8, def: 1, exp: 5, coins: 4, behavior: 'chase' },
    { emoji: '🪞', name: 'うつしみの鏡', hp: 18, atk: 6, def: 4, exp: 7, coins: 6, behavior: 'mirror' },
    { emoji: '📺', name: 'ざんねんテレビ', hp: 25, atk: 6, def: 3, exp: 6, coins: 5, behavior: 'wander' },
    { emoji: '🌂', name: 'おいかけ傘', hp: 14, atk: 9, def: 1, exp: 5, coins: 4, behavior: 'chase' },
    { emoji: '🎪', name: 'おどるテント', hp: 22, atk: 7, def: 3, exp: 7, coins: 6, behavior: 'ambush' },
    { emoji: '🧲', name: 'すいよせ磁石', hp: 18, atk: 8, def: 2, exp: 6, coins: 5, behavior: 'pull' },
    // 後半 (16-30F)
    { emoji: '🗿', name: 'なぞのモアイ', hp: 40, atk: 10, def: 6, exp: 10, coins: 8, behavior: 'wander' },
    { emoji: '🎭', name: 'にめんのかお', hp: 30, atk: 14, def: 3, exp: 12, coins: 9, behavior: 'chase' },
    { emoji: '🛸', name: 'まよいUFO', hp: 28, atk: 12, def: 2, exp: 11, coins: 8, behavior: 'teleport' },
    { emoji: '🦑', name: 'てつがくイカ', hp: 35, atk: 11, def: 5, exp: 13, coins: 10, behavior: 'chase' },
    { emoji: '🏠', name: 'あるく一軒家', hp: 50, atk: 8, def: 8, exp: 15, coins: 12, behavior: 'chase' },
    { emoji: '🎰', name: 'ギャンブル機', hp: 30, atk: 15, def: 2, exp: 12, coins: 15, behavior: 'wander' },
    // 深層 (31F+)
    { emoji: '🌋', name: 'ふんかくん', hp: 60, atk: 16, def: 5, exp: 18, coins: 14, behavior: 'chase' },
    { emoji: '🧬', name: 'じこふくせい体', hp: 40, atk: 13, def: 4, exp: 15, coins: 12, behavior: 'split' },
    { emoji: '⚡', name: 'イナズマさん', hp: 35, atk: 20, def: 1, exp: 16, coins: 13, behavior: 'teleport' },
    { emoji: '🕳️', name: 'ブラックホール', hp: 55, atk: 14, def: 7, exp: 20, coins: 16, behavior: 'pull' },
    { emoji: '🤖', name: 'こわれロボ', hp: 70, atk: 12, def: 10, exp: 22, coins: 18, behavior: 'chase' },
    // 超深層 (51F+)
    { emoji: '💀', name: 'しにがみ', hp: 80, atk: 25, def: 8, exp: 30, coins: 25, behavior: 'chase' },
    { emoji: '🐉', name: 'シュールドラゴン', hp: 100, atk: 22, def: 12, exp: 35, coins: 30, behavior: 'chase' },
    { emoji: '🌀', name: 'むげんのうずまき', hp: 60, atk: 28, def: 6, exp: 25, coins: 20, behavior: 'teleport' },
  ];

  // ===== ボスデータ =====
  const BOSS_TYPES = [
    { emoji: '👑', name: 'シュール大王', hp: 80, atk: 12, def: 5, exp: 30, coins: 25, behavior: 'boss', special: 'summon', desc: '配下を呼ぶ' },
    { emoji: '🎪', name: 'サーカス団長', hp: 70, atk: 15, def: 4, exp: 28, coins: 22, behavior: 'boss', special: 'teleport_attack', desc: '瞬間移動攻撃' },
    { emoji: '🏰', name: 'うごく城', hp: 120, atk: 10, def: 10, exp: 40, coins: 35, behavior: 'boss', special: 'shield', desc: '定期的にバリアを張る' },
    { emoji: '🌪️', name: 'カオストルネード', hp: 60, atk: 20, def: 2, exp: 35, coins: 30, behavior: 'boss', special: 'aoe', desc: '範囲攻撃' },
    { emoji: '🎭', name: '千の仮面', hp: 90, atk: 16, def: 6, exp: 45, coins: 40, behavior: 'boss', special: 'clone', desc: '分身を生む' },
    { emoji: '⏰', name: 'じかんどろぼう', hp: 75, atk: 18, def: 5, exp: 38, coins: 32, behavior: 'boss', special: 'timestop', desc: 'ターンを奪う' },
    { emoji: '🌑', name: 'やみのたいよう', hp: 100, atk: 22, def: 8, exp: 50, coins: 45, behavior: 'boss', special: 'darkness', desc: '視界を奪う' },
    { emoji: '🧪', name: 'マッドケミスト', hp: 85, atk: 14, def: 4, exp: 42, coins: 38, behavior: 'boss', special: 'poison_field', desc: '毒の床を生成' },
    { emoji: '🎵', name: 'きょうきのメロディ', hp: 70, atk: 16, def: 3, exp: 36, coins: 28, behavior: 'boss', special: 'confuse', desc: '操作を混乱させる' },
    { emoji: '🗻', name: 'シュール山', hp: 200, atk: 25, def: 15, exp: 80, coins: 60, behavior: 'boss', special: 'quake', desc: '地震で全体攻撃' },
  ];

  // ===== 装備データ =====
  const WEAPONS = [
    { emoji: '🗡️', name: '錆びたナイフ', atk: 2, desc: '攻撃+2', tier: 0 },
    { emoji: '⚔️', name: '鉄の剣', atk: 4, desc: '攻撃+4', tier: 1 },
    { emoji: '🔪', name: 'するどい刃', atk: 6, crit: 10, desc: '攻撃+6, 会心+10%', tier: 2 },
    { emoji: '🪓', name: 'バトルアックス', atk: 9, desc: '攻撃+9', tier: 3 },
    { emoji: '🔱', name: 'トライデント', atk: 8, pierce: 3, desc: '攻撃+8, 貫通+3', tier: 3 },
    { emoji: '⭐', name: '星屑の剣', atk: 12, crit: 15, desc: '攻撃+12, 会心+15%', tier: 4 },
    { emoji: '🌙', name: '月光の太刀', atk: 10, lifesteal: 15, desc: '攻撃+10, 吸血15%', tier: 4 },
    { emoji: '☄️', name: '隕石のハンマー', atk: 16, desc: '攻撃+16', tier: 5 },
    { emoji: '🌈', name: '虹の聖剣', atk: 14, crit: 20, lifesteal: 10, desc: '攻撃+14, 会心+20%, 吸血10%', tier: 6 },
  ];

  const ARMORS = [
    { emoji: '🧥', name: 'ぼろぼろの服', def: 1, desc: '防御+1', tier: 0 },
    { emoji: '🛡️', name: '木の盾', def: 3, desc: '防御+3', tier: 1 },
    { emoji: '🦺', name: '鎖帷子', def: 5, desc: '防御+5', tier: 2 },
    { emoji: '🔰', name: '騎士の鎧', def: 7, evade: 5, desc: '防御+7, 回避+5%', tier: 3 },
    { emoji: '💎', name: 'ダイヤの鎧', def: 10, desc: '防御+10', tier: 4 },
    { emoji: '🌀', name: '風のマント', def: 6, evade: 20, desc: '防御+6, 回避+20%', tier: 4 },
    { emoji: '🔥', name: '炎の鎧', def: 9, thorns: 5, desc: '防御+9, 反射5ダメージ', tier: 5 },
    { emoji: '👼', name: '天使の羽衣', def: 12, regen: 2, desc: '防御+12, 毎ターンHP+2', tier: 6 },
  ];

  const ACCESSORIES = [
    { emoji: '💍', name: '赤い指輪', atk: 2, desc: '攻撃+2', tier: 1 },
    { emoji: '📿', name: '守りのペンダント', def: 2, desc: '防御+2', tier: 1 },
    { emoji: '🧿', name: '邪眼のお守り', evade: 10, desc: '回避+10%', tier: 2 },
    { emoji: '⏳', name: '時の砂時計', double: true, desc: '5%の確率で2回行動', tier: 3 },
    { emoji: '🍀', name: '四つ葉のブローチ', crit: 15, coinBonus: 20, desc: '会心+15%, コイン+20%', tier: 3 },
    { emoji: '❤️‍🔥', name: '生命の炎', maxHpBonus: 20, regen: 1, desc: '最大HP+20, 毎ターンHP+1', tier: 4 },
    { emoji: '👁️', name: '千里眼', viewBonus: 2, desc: '視界+2', tier: 4 },
    { emoji: '🌟', name: '星のティアラ', atk: 5, def: 5, crit: 10, desc: '全ステ+5, 会心+10%', tier: 5 },
  ];

  // ===== アイテムデータ =====
  const ITEM_TYPES = [
    { emoji: '🍎', name: 'ふしぎリンゴ', effect: 'heal', value: 15, desc: 'HP+15', weight: 10 },
    { emoji: '🍖', name: 'でかい肉', effect: 'heal', value: 30, desc: 'HP+30', weight: 6 },
    { emoji: '💎', name: 'ふしぎな宝石', effect: 'exp', value: 10, desc: '経験値+10', weight: 4 },
    { emoji: '🍀', name: '四つ葉のクローバー', effect: 'fullheal', value: 0, desc: 'HP全回復', weight: 2 },
    { emoji: '💣', name: 'ばくだん', effect: 'bomb', value: 20, desc: '周囲に20ダメージ', weight: 3 },
    { emoji: '👟', name: 'はやい靴', effect: 'double', value: 3, desc: '3ターン2回行動', weight: 2 },
    { emoji: '🔮', name: '予知の水晶', effect: 'reveal', value: 0, desc: 'フロア全表示', weight: 3 },
    { emoji: '📜', name: 'テレポートの巻物', effect: 'teleport', value: 0, desc: '階段にワープ', weight: 2 },
    { emoji: '🧪', name: '毒消し草', effect: 'cure', value: 0, desc: '状態異常回復', weight: 4 },
    { emoji: '🛡️', name: 'バリアの石', effect: 'barrier', value: 3, desc: '3ターン被ダメ半減', weight: 2 },
    { emoji: '🪙', name: 'コイン袋', effect: 'coins', value: 8, desc: 'コイン+8', weight: 5 },
    { emoji: '💰', name: '金の箱', effect: 'coins', value: 20, desc: 'コイン+20', weight: 2 },
  ];

  // ===== ショップアイテム =====
  function generateShopItems(floor) {
    const items = [];
    const tier = Math.min(Math.floor(floor / 8), 6);

    // 回復
    items.push({ emoji: '🍖', name: 'でかい肉', effect: 'heal', value: 30 + floor * 2, desc: `HP+${30 + floor * 2}`, price: 8 + Math.floor(floor / 3) });
    items.push({ emoji: '🍀', name: '全回復薬', effect: 'fullheal', value: 0, desc: 'HP全回復', price: 15 + floor });

    // 装備（フロアに見合ったティア）
    const availWeapons = WEAPONS.filter(w => w.tier <= tier + 1 && w.tier >= tier - 1);
    const availArmors = ARMORS.filter(a => a.tier <= tier + 1 && a.tier >= tier - 1);
    if (availWeapons.length) {
      const w = availWeapons[rng(availWeapons.length)];
      items.push({ ...w, type: 'weapon', price: 15 + w.tier * 12 });
    }
    if (availArmors.length) {
      const a = availArmors[rng(availArmors.length)];
      items.push({ ...a, type: 'armor', price: 15 + a.tier * 12 });
    }

    // アクセサリ
    const availAcc = ACCESSORIES.filter(a => a.tier <= tier + 1);
    if (availAcc.length && rng(3) === 0) {
      const acc = availAcc[rng(availAcc.length)];
      items.push({ ...acc, type: 'accessory', price: 20 + acc.tier * 15 });
    }

    // 消耗品
    if (rng(2) === 0) {
      items.push({ emoji: '💣', name: 'ばくだん', effect: 'bomb', value: 20 + floor * 2, desc: `周囲に${20 + floor * 2}ダメージ`, price: 10 + Math.floor(floor / 2) });
    }
    items.push({ emoji: '📜', name: 'テレポートの巻物', effect: 'teleport', value: 0, desc: '階段にワープ', price: 12 });

    return items;
  }

  // ===== ガチャデータ =====
  const GACHA_ITEMS = [
    { emoji: '🍎', name: 'ふしぎリンゴ', rarity: 'common', rarityName: 'コモン', effect: 'heal', value: 15, desc: 'HP+15', weight: 20 },
    { emoji: '🍖', name: 'でかい肉', rarity: 'common', rarityName: 'コモン', effect: 'heal', value: 30, desc: 'HP+30', weight: 15 },
    { emoji: '🪙', name: 'コインの袋', rarity: 'common', rarityName: 'コモン', effect: 'coins', value: 8, desc: 'コイン+8', weight: 15 },
    { emoji: '💣', name: 'ばくだん', rarity: 'common', rarityName: 'コモン', effect: 'bomb', value: 20, desc: '周囲に20ダメージ', weight: 10 },
    { emoji: '⚔️', name: '鋭い剣', rarity: 'rare', rarityName: 'レア', effect: 'atk', value: 3, desc: '攻撃力+3', weight: 8 },
    { emoji: '🛡️', name: '堅い盾', rarity: 'rare', rarityName: 'レア', effect: 'def', value: 3, desc: '防御力+3', weight: 8 },
    { emoji: '🌟', name: '生命の星', rarity: 'rare', rarityName: 'レア', effect: 'maxhp', value: 15, desc: '最大HP+15', weight: 5 },
    { emoji: '🔮', name: '予知の水晶', rarity: 'rare', rarityName: 'レア', effect: 'reveal', value: 0, desc: 'フロア全表示', weight: 4 },
    { emoji: '🗡️', name: '伝説の剣', rarity: 'sr', rarityName: 'SR', effect: 'atk', value: 6, desc: '攻撃力+6', weight: 4 },
    { emoji: '🩹', name: '再生のお守り', rarity: 'sr', rarityName: 'SR', effect: 'regen', value: 1, desc: '毎ターンHP+1回復', weight: 3 },
    { emoji: '🍀', name: '幸運のクローバー', rarity: 'sr', rarityName: 'SR', effect: 'fullheal', value: 0, desc: 'HP全回復+攻撃力+2', weight: 3 },
    { emoji: '👟', name: '韋駄天シューズ', rarity: 'sr', rarityName: 'SR', effect: 'double', value: 5, desc: '5ターン2回行動', weight: 2 },
    { emoji: '👼', name: '天使の翼', rarity: 'ssr', rarityName: 'SSR', effect: 'angel', value: 0, desc: 'HP全回復+全ステ+5', weight: 1.5 },
    { emoji: '💀', name: '死神のカマ', rarity: 'ssr', rarityName: 'SSR', effect: 'reaper', value: 0, desc: 'フロアの敵を全滅', weight: 1 },
    { emoji: '🌈', name: '虹のかけら', rarity: 'ssr', rarityName: 'SSR', effect: 'rainbow', value: 0, desc: 'ランダム全ステ+2~8', weight: 0.5 },
  ];

  // ===== レベルアップ選択肢 =====
  const LEVELUP_CHOICES = [
    { name: '❤️ HP強化', desc: '最大HP+10, HP全回復', apply: p => { p.maxHp += 10; p.hp = p.maxHp; } },
    { name: '⚔️ 攻撃強化', desc: '攻撃力+3', apply: p => { p.baseAtk += 3; } },
    { name: '🛡️ 防御強化', desc: '防御力+2', apply: p => { p.baseDef += 2; } },
    { name: '💨 回避の心得', desc: '回避率+8%', apply: p => { p.baseEvade += 8; } },
    { name: '🔥 会心の力', desc: '会心率+10%', apply: p => { p.baseCrit += 10; } },
    { name: '🩹 再生の力', desc: '毎ターンHP+2回復', apply: p => { p.baseRegen += 2; } },
    { name: '💰 商人の目', desc: 'コイン獲得+25%', apply: p => { p.coinBonus += 25; } },
    { name: '📦 荷物持ち', desc: 'バッグ+1枠', apply: p => { p.bagSize = Math.min(8, (p.bagSize || 3) + 1); } },
    { name: '🗡️ 貫通の力', desc: '防御無視+2', apply: p => { p.basePierce = (p.basePierce || 0) + 2; } },
    { name: '❤️‍🔥 吸血の力', desc: '与ダメージの10%回復', apply: p => { p.baseLifesteal = (p.baseLifesteal || 0) + 10; } },
  ];

  // ===== ミニイベントデータ =====
  const EVENTS = [
    {
      emoji: '🧙‍♂️', title: 'さすらいの魔法使い',
      desc: '「ふむ...何かひとつ願いを叶えてやろう」',
      choices: [
        { text: 'HPを回復して', apply: (p) => { p.hp = p.maxHp; return 'HP全回復！'; } },
        { text: '強くして', apply: (p) => { p.baseAtk += 2; p.baseDef += 2; return '攻撃+2, 防御+2！'; } },
        { text: 'お金をくれ', apply: (p) => { p.coins += 20; return 'コイン+20！'; } },
      ]
    },
    {
      emoji: '🪙', title: 'ふしぎな泉',
      desc: 'コインを投げ入れますか？（5コイン）',
      choices: [
        { text: '投げ入れる', cost: 5, apply: (p) => {
          const r = rng(100);
          if (r < 20) { p.baseAtk += 5; return '泉が輝いた！攻撃+5！'; }
          if (r < 40) { p.baseDef += 5; return '泉が輝いた！防御+5！'; }
          if (r < 60) { p.maxHp += 20; p.hp += 20; return '泉が輝いた！最大HP+20！'; }
          if (r < 80) { p.coins += 30; return '大量のコインが湧き出た！コイン+30！'; }
          return 'なにも起こらなかった...';
        }},
        { text: 'やめておく', apply: () => '賢明な判断かもしれない...' },
      ]
    },
    {
      emoji: '📦', title: 'ミミック！',
      desc: '宝箱が動き出した！',
      choices: [
        { text: '戦う', apply: (p) => {
          const dmg = 5 + rng(10);
          p.hp = Math.max(1, p.hp - dmg);
          p.coins += 15;
          p.baseAtk += 1;
          return `${dmg}ダメージを受けたが、コイン+15, 攻撃+1！`;
        }},
        { text: '逃げる', apply: (p) => {
          const dmg = 3 + rng(5);
          p.hp = Math.max(1, p.hp - dmg);
          return `逃げる途中に${dmg}ダメージ！`;
        }},
      ]
    },
    {
      emoji: '🔮', title: '占い師の部屋',
      desc: '「あなたの運命を占いましょう...」',
      choices: [
        { text: '占ってもらう', apply: (p) => {
          const outcomes = [
            () => { p.baseCrit += 15; return '「大吉！」会心率+15%！'; },
            () => { p.baseEvade += 12; return '「吉！」回避率+12%！'; },
            () => { p.baseRegen += 2; return '「中吉！」リジェネ+2！'; },
            () => { p.maxHp += 15; p.hp += 15; return '「小吉！」最大HP+15！'; },
            () => { return '「凶...」なにも起こらなかった'; },
          ];
          return outcomes[rng(outcomes.length)]();
        }},
        { text: 'やめておく', apply: () => '運命は自分で切り開く' },
      ]
    },
    {
      emoji: '🍳', title: 'シュールシェフ',
      desc: '「おい、腹減ってんだろ？食え」',
      choices: [
        { text: 'いただきます', apply: (p) => {
          p.hp = Math.min(p.maxHp, p.hp + Math.floor(p.maxHp * 0.5));
          p.baseAtk += 1;
          return 'シュール定食を食べた！HP50%回復、攻撃+1！';
        }},
      ]
    },
    {
      emoji: '⚗️', title: 'あやしい錬金術師',
      desc: '「HPと引き換えに力をやろう」',
      choices: [
        { text: '取引する', apply: (p) => {
          const cost = Math.floor(p.maxHp * 0.2);
          p.maxHp -= cost;
          p.hp = Math.min(p.hp, p.maxHp);
          p.baseAtk += 5;
          p.baseCrit += 10;
          return `最大HP-${cost}...だが攻撃+5, 会心+10%！`;
        }},
        { text: 'やめておく', apply: () => '健康が一番' },
      ]
    },
  ];

  // ===== 墓碑銘 =====
  const EPITAPHS = [
    'その冒険者は、イスに座ろうとした。',
    '最期の言葉は「もう一階だけ...」だった。',
    '靴下の片方は、ついに見つからなかった。',
    'シュールな世界に飲み込まれた。',
    'おにぎりに追いかけられるとは思わなかった。',
    '塔は今日も、新たな挑戦者を待っている。',
    '寿司のうらみは深かった。',
    'テレビのつまらなさに耐えられなかった。',
    'モアイは静かにほほえんでいた。',
    'こうして物語は、ふりだしに戻る。',
    'シュール山は微動だにしなかった。',
    '回復アイテムはバッグの中で腐っていた。',
    '「ガチャを引けばよかった...」',
    'その選択は、間違いだったのかもしれない。',
  ];

  // ===== トラップデータ =====
  const TRAP_TYPES = [
    { name: '毒の罠', effect: 'poison', desc: '毒状態になった！（5ターン、毎ターンHP-3）' },
    { name: 'ダメージの罠', effect: 'damage', desc: 'トゲが飛び出した！' },
    { name: '暗闇の罠', effect: 'blind', desc: '視界が狭くなった！（8ターン）' },
    { name: 'ワープの罠', effect: 'warp', desc: '別の場所に飛ばされた！' },
    { name: '混乱の罠', effect: 'confuse', desc: '方向感覚がおかしい！（6ターン）' },
    { name: '鈍足の罠', effect: 'slow', desc: '体が重い！（8ターン、敵が2回行動）' },
  ];

  // ===== ゲーム状態 =====
  let game = null;
  let inputLocked = false;
  let reviveUsed = false;
  let popupTimer = null;
  let animFrame = null;
  let lastRenderTime = 0;
  let tileAnimPhase = 0;

  // ===== ユーティリティ =====
  function rng(max) { return Math.floor(Math.random() * max); }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function weightedRandom(items, weightKey = 'weight') {
    const total = items.reduce((s, i) => s + i[weightKey], 0);
    let r = Math.random() * total;
    for (const item of items) { r -= item[weightKey]; if (r <= 0) return item; }
    return items[items.length - 1];
  }
  function dist(a, b) { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); }

  // ===== 実効ステータス計算 =====
  function getEffectiveStats(p) {
    let atk = p.baseAtk;
    let def = p.baseDef;
    let evade = p.baseEvade;
    let crit = p.baseCrit;
    let regen = p.baseRegen;
    let pierce = p.basePierce || 0;
    let lifesteal = p.baseLifesteal || 0;
    let thorns = 0;
    let viewBonus = 0;
    let coinBonus = p.coinBonus || 0;
    let maxHpBonus = 0;

    if (p.weapon) { atk += p.weapon.atk || 0; crit += p.weapon.crit || 0; pierce += p.weapon.pierce || 0; lifesteal += p.weapon.lifesteal || 0; }
    if (p.armor) { def += p.armor.def || 0; evade += p.armor.evade || 0; regen += p.armor.regen || 0; thorns += p.armor.thorns || 0; }
    if (p.accessory) {
      atk += p.accessory.atk || 0; def += p.accessory.def || 0;
      evade += p.accessory.evade || 0; crit += p.accessory.crit || 0;
      regen += p.accessory.regen || 0; viewBonus += p.accessory.viewBonus || 0;
      coinBonus += p.accessory.coinBonus || 0; maxHpBonus += p.accessory.maxHpBonus || 0;
    }

    return { atk, def, evade, crit, regen, pierce, lifesteal, thorns, viewBonus, coinBonus, maxHpBonus };
  }

  // ===== HUDフラッシュ＆ポップアップ =====
  function flashHUD(elementId) {
    const el = $(elementId);
    if (!el) return;
    el.classList.remove('hud-flash');
    void el.offsetWidth;
    el.classList.add('hud-flash');
    setTimeout(() => el.classList.remove('hud-flash'), 500);
  }
  function showPopup(text) {
    const el = $('hud-popup');
    el.textContent = text;
    if (popupTimer) clearTimeout(popupTimer);
    popupTimer = setTimeout(() => { el.textContent = ''; }, 1800);
  }

  // ===== マップ生成 =====
  function generateMap(floor) {
    const map = Array.from({ length: MAP_H }, () => Array(MAP_W).fill(T.WALL));
    const rooms = [];
    const isBossFloor = floor % BOSS_INTERVAL === 0;
    const numRooms = isBossFloor ? 2 : 4 + Math.min(Math.floor(floor / 3), 5);

    for (let i = 0; i < numRooms * 4; i++) {
      if (rooms.length >= numRooms) break;
      const w = isBossFloor ? 6 + rng(3) : 3 + rng(4);
      const h = isBossFloor ? 6 + rng(3) : 3 + rng(4);
      const x = 1 + rng(MAP_W - w - 2);
      const y = 1 + rng(MAP_H - h - 2);

      let overlap = false;
      for (const r of rooms) {
        if (x <= r.x + r.w + 1 && x + w >= r.x - 1 && y <= r.y + r.h + 1 && y + h >= r.y - 1) {
          overlap = true; break;
        }
      }
      if (overlap) continue;
      rooms.push({ x, y, w, h });
      for (let ry = y; ry < y + h; ry++)
        for (let rx = x; rx < x + w; rx++) map[ry][rx] = T.FLOOR;
    }

    if (rooms.length < 2) {
      rooms.length = 0;
      const cx = Math.floor(MAP_W / 2), cy = Math.floor(MAP_H / 2);
      for (let y = 2; y < MAP_H - 2; y++) map[y][cx] = T.FLOOR;
      for (let x = 2; x < MAP_W - 2; x++) map[cy][x] = T.FLOOR;
      for (let y = cy - 3; y <= cy + 3; y++)
        for (let x = cx - 3; x <= cx + 3; x++) map[y][x] = T.FLOOR;
      rooms.push({ x: cx - 3, y: cy - 3, w: 7, h: 7 });
      rooms.push({ x: 2, y: cy - 1, w: 3, h: 3 });
    }

    // 通路接続
    for (let i = 0; i < rooms.length - 1; i++) {
      const a = rooms[i], b = rooms[i + 1];
      let cx = Math.floor(a.x + a.w / 2), cy = Math.floor(a.y + a.h / 2);
      const tx = Math.floor(b.x + b.w / 2), ty = Math.floor(b.y + b.h / 2);
      while (cx !== tx) { cx += cx < tx ? 1 : -1; map[cy][cx] = T.FLOOR; }
      while (cy !== ty) { cy += cy < ty ? 1 : -1; map[cy][cx] = T.FLOOR; }
    }

    // 階段
    const stairRoom = rooms[rooms.length - 1];
    const sx = stairRoom.x + Math.floor(stairRoom.w / 2);
    const sy = stairRoom.y + Math.floor(stairRoom.h / 2);
    map[sy][sx] = T.STAIR;

    // トラップ配置（ボス階はなし）
    if (!isBossFloor && floor > 2) {
      const numTraps = Math.min(2 + Math.floor(floor / 5), 8);
      for (let i = 0; i < numTraps; i++) {
        const room = rooms[rng(rooms.length)];
        const tx = room.x + rng(room.w);
        const ty = room.y + rng(room.h);
        if (map[ty][tx] === T.FLOOR) map[ty][tx] = T.TRAP;
      }
    }

    // ショップタイル
    if (!isBossFloor && floor % SHOP_INTERVAL === 0 && rooms.length > 2) {
      const shopRoom = rooms[1];
      const shx = shopRoom.x + Math.floor(shopRoom.w / 2);
      const shy = shopRoom.y + Math.floor(shopRoom.h / 2);
      if (map[shy][shx] === T.FLOOR) map[shy][shx] = T.SHOP;
    }

    // 休憩タイル（低確率）
    if (!isBossFloor && rng(4) === 0 && rooms.length > 2) {
      const restRoom = rooms[Math.min(2, rooms.length - 1)];
      const rx = restRoom.x + Math.floor(restRoom.w / 2);
      const ry = restRoom.y + Math.floor(restRoom.h / 2);
      if (map[ry][rx] === T.FLOOR) map[ry][rx] = T.REST;
    }

    // 宝部屋（低確率）
    if (!isBossFloor && rng(5) === 0 && rooms.length > 2) {
      const tRoom = rooms[rng(rooms.length)];
      const tx = tRoom.x + Math.floor(tRoom.w / 2);
      const ty = tRoom.y + Math.floor(tRoom.h / 2);
      if (map[ty][tx] === T.FLOOR) map[ty][tx] = T.TREASURE;
    }

    return { map, rooms, stairPos: { x: sx, y: sy } };
  }

  // ===== 敵の選出 =====
  function pickEnemyType(floor) {
    let pool;
    if (floor <= 5) pool = ENEMY_TYPES.slice(0, 5);
    else if (floor <= 15) pool = ENEMY_TYPES.slice(2, 12);
    else if (floor <= 30) pool = ENEMY_TYPES.slice(5, 18);
    else if (floor <= 50) pool = ENEMY_TYPES.slice(10, 23);
    else pool = ENEMY_TYPES.slice(15);
    const base = { ...pool[rng(pool.length)] };

    // スケーリング: 緩やかにだが着実に強くなる
    const scale = 1 + (floor - 1) * 0.08;
    base.hp = Math.floor(base.hp * scale);
    base.atk = Math.floor(base.atk * (1 + (floor - 1) * 0.06));
    base.def = Math.floor(base.def * (1 + (floor - 1) * 0.05));
    base.exp = Math.floor(base.exp * (1 + (floor - 1) * 0.04));
    base.coins = Math.floor(base.coins * (1 + (floor - 1) * 0.06));

    // エリートモンスター（5%確率）
    if (rng(100) < 5 && floor > 5) {
      base.name = '★' + base.name;
      base.hp = Math.floor(base.hp * 2);
      base.atk = Math.floor(base.atk * 1.5);
      base.def = Math.floor(base.def * 1.5);
      base.exp = Math.floor(base.exp * 3);
      base.coins = Math.floor(base.coins * 3);
      base.isElite = true;
    }

    return base;
  }

  function pickBoss(floor) {
    const bossIndex = Math.floor(floor / BOSS_INTERVAL) - 1;
    const base = { ...BOSS_TYPES[bossIndex % BOSS_TYPES.length] };
    const scale = 1 + Math.floor(floor / 10) * 0.3;
    base.hp = Math.floor(base.hp * scale);
    base.atk = Math.floor(base.atk * scale);
    base.def = Math.floor(base.def * scale);
    base.exp = Math.floor(base.exp * scale);
    base.coins = Math.floor(base.coins * scale);
    base.isBoss = true;
    return base;
  }

  // ===== セーブ/ロード =====
  function saveGame() {
    if (!game || game.state === 'dead') return;
    const data = {
      player: { ...game.player, weapon: game.player.weapon ? { ...game.player.weapon } : null, armor: game.player.armor ? { ...game.player.armor } : null, accessory: game.player.accessory ? { ...game.player.accessory } : null, bag: game.player.bag ? [...game.player.bag] : [] },
      floor: game.floor, map: game.map,
      enemies: game.enemies.map(e => ({ ...e })),
      items: game.items.map(i => ({ ...i })),
      explored: game.explored, turnCount: game.turnCount,
      statusEffects: game.statusEffects ? { ...game.statusEffects } : {},
      reviveUsed,
    };
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch (e) { }
  }

  function loadGame() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data || !data.player || !data.map) return false;
      game = {
        player: data.player, floor: data.floor, map: data.map,
        enemies: data.enemies || [], items: data.items || [],
        explored: data.explored, turnCount: data.turnCount || 0,
        statusEffects: data.statusEffects || {}, logs: [], state: 'play',
      };
      reviveUsed = data.reviveUsed || false;
      $('game-log').innerHTML = '';
      showScreen('game');
      addLog(`${game.floor}Fからの続き...`, 'floor');
      render();
      startAnimLoop();
      return true;
    } catch (e) { return false; }
  }

  function deleteSave() { localStorage.removeItem(SAVE_KEY); updateTitleButtons(); }
  function hasSave() { return !!localStorage.getItem(SAVE_KEY); }
  function updateTitleButtons() {
    const btn = $('continue-btn');
    if (hasSave()) btn.classList.remove('hidden'); else btn.classList.add('hidden');
  }

  // ===== ゲーム初期化 =====
  function initGame() {
    sg.onGameStart();
    deleteSave();

    game = {
      player: {
        x: 0, y: 0,
        hp: 35, maxHp: 35,
        baseAtk: 5, baseDef: 2,
        baseEvade: 0, baseCrit: 5,
        baseRegen: 0, basePierce: 0, baseLifesteal: 0,
        exp: 0, level: 1, nextExp: 10,
        coins: 0, coinBonus: 0,
        weapon: null, armor: null, accessory: null,
        bag: [], bagSize: 3,
        kills: 0, itemsUsed: 0, bossKills: 0,
        doubleTurns: 0, barrierTurns: 0,
      },
      floor: 1,
      map: null, enemies: [], items: [],
      explored: null, turnCount: 0, logs: [],
      statusEffects: { poison: 0, blind: 0, confuse: 0, slow: 0 },
      state: 'play',
      bossDefeated: false,
      eventTriggered: false,
    };

    reviveUsed = false;
    $('game-log').innerHTML = '';
    generateFloor();
    showScreen('game');
    addLog('シュールの塔に足を踏み入れた...', 'floor');
    render();
    startAnimLoop();
  }

  function generateFloor() {
    const { map, rooms } = generateMap(game.floor);
    game.map = map;
    game.enemies = [];
    game.items = [];
    game.explored = Array.from({ length: MAP_H }, () => Array(MAP_W).fill(false));
    game.bossDefeated = false;
    game.eventTriggered = false;

    const startRoom = rooms[0];
    game.player.x = startRoom.x + Math.floor(startRoom.w / 2);
    game.player.y = startRoom.y + Math.floor(startRoom.h / 2);

    const isBossFloor = game.floor % BOSS_INTERVAL === 0;

    if (isBossFloor) {
      // ボス階: ボス1体のみ
      const boss = pickBoss(game.floor);
      const bossRoom = rooms[rooms.length - 1];
      boss.x = bossRoom.x + Math.floor(bossRoom.w / 2);
      boss.y = bossRoom.y + Math.floor(bossRoom.h / 2);
      boss.maxHp = boss.hp;
      boss.stunned = false;
      game.enemies.push(boss);
      addLog(`⚠️ ボス階！ ${boss.emoji} ${boss.name}が待ち構えている！`, 'special');
    } else {
      // 通常階: 敵配置
      const numEnemies = Math.min(3 + Math.floor(game.floor * 0.6), 9);
      for (let i = 0; i < numEnemies; i++) {
        const type = pickEnemyType(game.floor);
        let ex, ey, tries = 0;
        do {
          const room = rooms[rng(rooms.length)];
          ex = room.x + rng(room.w); ey = room.y + rng(room.h); tries++;
        } while (tries < 50 && (map[ey][ex] !== T.FLOOR || (ex === game.player.x && ey === game.player.y) || game.enemies.some(e => e.x === ex && e.y === ey)));
        if (tries < 50) game.enemies.push({ ...type, x: ex, y: ey, maxHp: type.hp, stunned: false });
      }
    }

    // アイテム配置
    const numItems = isBossFloor ? 0 : 1 + rng(3);
    for (let i = 0; i < numItems; i++) {
      const type = weightedRandom(ITEM_TYPES);
      let ix, iy, tries = 0;
      do {
        const room = rooms[rng(rooms.length)];
        ix = room.x + rng(room.w); iy = room.y + rng(room.h); tries++;
      } while (tries < 50 && (map[iy][ix] !== T.FLOOR || (ix === game.player.x && iy === game.player.y) || game.items.some(it => it.x === ix && it.y === iy)));
      if (tries < 50) game.items.push({ ...type, x: ix, y: iy });
    }

    updateExplored();
  }

  // ===== 視界 =====
  function updateExplored() {
    const p = game.player;
    const stats = getEffectiveStats(p);
    const blindPenalty = (game.statusEffects.blind > 0) ? 2 : 0;
    const radius = Math.max(2, 4 + stats.viewBonus - blindPenalty);
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = p.x + dx, ny = p.y + dy;
        if (nx >= 0 && nx < MAP_W && ny >= 0 && ny < MAP_H && dx * dx + dy * dy <= radius * radius)
          game.explored[ny][nx] = true;
      }
    }
  }

  // ===== ログ =====
  function addLog(text, cls = '') {
    game.logs.push({ text, cls });
    if (game.logs.length > 60) game.logs.shift();
    const el = $('game-log');
    const span = document.createElement('div');
    if (cls) span.className = 'log-' + cls;
    span.textContent = text;
    el.appendChild(span);
    el.scrollTop = el.scrollHeight;
  }

  // ===== アイテム効果 =====
  function applyItemEffect(effect, value) {
    const p = game.player;
    switch (effect) {
      case 'heal': p.hp = Math.min(p.maxHp, p.hp + value); flashHUD('hud-hp'); showPopup(`HP +${value}`); spawnHealNumber(p.x, p.y, value); break;
      case 'fullheal': p.hp = p.maxHp; flashHUD('hud-hp'); showPopup('HP全回復！'); spawnHealNumber(p.x, p.y, '全'); break;
      case 'atk': p.baseAtk += value; flashHUD('hud-atk'); showPopup(`攻撃力 +${value}`); break;
      case 'def': p.baseDef += value; flashHUD('hud-def'); showPopup(`防御力 +${value}`); break;
      case 'exp': p.exp += value; flashHUD('hud-exp'); showPopup(`経験値 +${value}`); checkLevelUp(); break;
      case 'maxhp': p.maxHp += value; p.hp += value; flashHUD('hud-hp'); showPopup(`最大HP +${value}`); break;
      case 'bomb': {
        let bombed = 0;
        spawnExplosion(p.x, p.y);
        screenShake(6, 12);
        screenFlash('#ffa726', 0.3);
        game.enemies = game.enemies.filter(e => {
          if (dist(e, p) <= 3) {
            e.hp -= value;
            spawnDamageNumber(e.x, e.y, value, '#ffa726');
            if (e.hp <= 0) { grantKillRewards(e); bombed++; return false; }
          }
          return true;
        });
        if (bombed) { addLog(`爆発で${bombed}体倒した！`, 'special'); checkLevelUp(); }
        showPopup('ドカーン！'); break;
      }
      case 'double': p.doubleTurns += value; showPopup(`${value}ターン2回行動！`); break;
      case 'reveal':
        for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) game.explored[y][x] = true;
        showPopup('マップ全開放！'); screenFlash('#b388ff', 0.2); break;
      case 'coins': {
        const bonus = Math.floor(value * (1 + (p.coinBonus || 0) / 100));
        p.coins += bonus; flashHUD('hud-coin'); showPopup(`コイン +${bonus}`); break;
      }
      case 'regen': p.baseRegen += value; showPopup(`リジェネ +${value}`); break;
      case 'angel':
        p.hp = p.maxHp; p.baseAtk += 5; p.baseDef += 5; p.maxHp += 5;
        flashHUD('hud-hp'); flashHUD('hud-atk'); flashHUD('hud-def');
        showPopup('天使の祝福！'); screenFlash('#ffd700', 0.4); spawnLevelUpEffect(p.x, p.y); break;
      case 'reaper':
        game.enemies.forEach(e => { grantKillRewards(e); });
        game.enemies = []; flashHUD('hud-coin');
        showPopup('死神一掃！'); screenShake(8, 15); screenFlash('#ff6b6b', 0.3);
        checkLevelUp(); break;
      case 'rainbow': {
        const v = 2 + rng(7);
        p.baseAtk += v; p.baseDef += v; p.maxHp += v; p.hp = Math.min(p.maxHp, p.hp + v);
        flashHUD('hud-atk'); flashHUD('hud-def'); flashHUD('hud-hp');
        showPopup(`虹のパワー！全ステ+${v}`); screenFlash('#ffd700', 0.3); spawnLevelUpEffect(p.x, p.y); break;
      }
      case 'teleport': {
        // 階段にワープ
        for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) {
          if (game.map[y][x] === T.STAIR) { p.x = x; p.y = y; updateExplored(); }
        }
        showPopup('階段にワープ！'); screenFlash('#b388ff', 0.2); break;
      }
      case 'cure':
        game.statusEffects = { poison: 0, blind: 0, confuse: 0, slow: 0 };
        showPopup('状態異常回復！'); break;
      case 'barrier':
        p.barrierTurns += value;
        showPopup(`${value}ターン被ダメ半減！`); screenFlash('#42a5f5', 0.2); break;
    }
    updateHUD();
  }

  function grantKillRewards(enemy) {
    const p = game.player;
    const stats = getEffectiveStats(p);
    p.exp += enemy.exp;
    const coinDrop = Math.floor((enemy.coins || 0) * (1 + stats.coinBonus / 100));
    p.coins += coinDrop;
    p.kills++;
    if (enemy.isBoss) p.bossKills++;
  }

  // ===== 戦闘 =====
  function attackEnemy(attacker, defender) {
    const p = game.player;
    const stats = getEffectiveStats(p);

    if (attacker === p) {
      let baseDmg = Math.max(1, stats.atk - Math.max(0, defender.def - stats.pierce) + rng(3) - 1);
      const isCrit = rng(100) < stats.crit;
      if (isCrit) {
        baseDmg = Math.floor(baseDmg * 2);
        addLog('★会心の一撃！', 'special');
        screenFlash('#ffd700', 0.2);
      }
      defender.hp -= baseDmg;
      spawnDamageNumber(defender.x, defender.y, baseDmg, isCrit ? '#ffd700' : '#ff6b6b');
      addLog(`${defender.name}に${baseDmg}ダメージ！`, 'damage');

      // 吸血
      if (stats.lifesteal > 0) {
        const heal = Math.max(1, Math.floor(baseDmg * stats.lifesteal / 100));
        p.hp = Math.min(p.maxHp, p.hp + heal);
        spawnHealNumber(p.x, p.y, heal);
      }

      if (defender.hp <= 0) {
        const coinDrop = Math.floor((defender.coins || 0) * (1 + stats.coinBonus / 100));
        addLog(`${defender.name}を倒した！(+${defender.exp}exp, +${coinDrop}コイン)`, 'item');
        grantKillRewards(defender);
        flashHUD('hud-exp'); flashHUD('hud-coin');
        game.enemies = game.enemies.filter(e => e !== defender);
        spawnExplosion(defender.x, defender.y);

        if (defender.isBoss) {
          game.bossDefeated = true;
          addLog('★★★ ボス撃破！ ★★★', 'special');
          screenShake(10, 20);
          screenFlash('#ffd700', 0.5);
          // ボスドロップ
          dropBossReward();
        }
        if (defender.isElite) {
          addLog('★ エリート撃破！ボーナス報酬！', 'special');
          screenFlash('#b388ff', 0.3);
        }
        checkLevelUp();
      }
    } else {
      // 敵の攻撃
      if (rng(100) < stats.evade) {
        addLog(`${attacker.name}の攻撃をかわした！`, 'special');
        spawnParticle(p.x * TILE + TILE / 2, p.y * TILE, 'MISS', '#66bb6a', 14, 30, -2);
        return;
      }
      let dmg = Math.max(1, attacker.atk - stats.def + rng(3) - 1);
      if (p.barrierTurns > 0) dmg = Math.max(1, Math.floor(dmg * 0.5));
      addLog(`${attacker.name}から${dmg}ダメージ！`, 'damage');
      p.hp -= dmg;
      flashHUD('hud-hp');
      spawnDamageNumber(p.x, p.y, dmg);
      screenShake(3, 6);

      // 反射ダメージ
      if (stats.thorns > 0) {
        attacker.hp -= stats.thorns;
        spawnDamageNumber(attacker.x, attacker.y, stats.thorns, '#ffa726');
        if (attacker.hp <= 0) {
          addLog(`反射ダメージで${attacker.name}を倒した！`, 'special');
          grantKillRewards(attacker);
          game.enemies = game.enemies.filter(e => e !== attacker);
          spawnExplosion(attacker.x, attacker.y);
          checkLevelUp();
        }
      }

      if (p.hp <= 0) { p.hp = 0; gameOver(); }
    }
  }

  // ===== ボスドロップ =====
  function dropBossReward() {
    const p = game.player;
    const tier = Math.min(Math.floor(game.floor / 8), 6);

    // 確定で装備ドロップ
    const r = rng(3);
    if (r === 0) {
      const pool = WEAPONS.filter(w => w.tier >= tier && w.tier <= tier + 1);
      if (pool.length) {
        const w = pool[rng(pool.length)];
        addLog(`${w.emoji} ${w.name}を手に入れた！`, 'special');
        if (!p.weapon || w.atk > p.weapon.atk) {
          p.weapon = { ...w };
          showPopup(`武器装備: ${w.name}`);
        } else {
          p.coins += 15 + tier * 5;
          addLog('既に良い武器があるのでコインに変換した', 'coin');
        }
      }
    } else if (r === 1) {
      const pool = ARMORS.filter(a => a.tier >= tier && a.tier <= tier + 1);
      if (pool.length) {
        const a = pool[rng(pool.length)];
        addLog(`${a.emoji} ${a.name}を手に入れた！`, 'special');
        if (!p.armor || a.def > p.armor.def) {
          p.armor = { ...a };
          showPopup(`防具装備: ${a.name}`);
        } else {
          p.coins += 15 + tier * 5;
          addLog('既に良い防具があるのでコインに変換した', 'coin');
        }
      }
    } else {
      const pool = ACCESSORIES.filter(a => a.tier >= tier - 1 && a.tier <= tier + 1);
      if (pool.length) {
        const acc = pool[rng(pool.length)];
        addLog(`${acc.emoji} ${acc.name}を手に入れた！`, 'special');
        p.accessory = { ...acc };
        showPopup(`アクセサリ装備: ${acc.name}`);
      }
    }
  }

  // ===== レベルアップ =====
  function checkLevelUp() {
    const p = game.player;
    while (p.exp >= p.nextExp) {
      p.exp -= p.nextExp;
      p.level++;
      p.nextExp = Math.floor(p.nextExp * 1.35);
      showLevelUp();
      return;
    }
  }

  function showLevelUp() {
    game.state = 'levelup';
    levelupScreen.classList.remove('hidden');
    spawnLevelUpEffect(game.player.x, game.player.y);
    screenFlash('#ffd700', 0.3);

    const choicesEl = $('levelup-choices');
    choicesEl.innerHTML = '';
    const shuffled = [...LEVELUP_CHOICES].sort(() => Math.random() - 0.5);
    const picks = shuffled.slice(0, 3);

    for (const choice of picks) {
      const btn = document.createElement('button');
      btn.className = 'levelup-btn';
      btn.innerHTML = `<div class="choice-name">${choice.name}</div><div class="choice-desc">${choice.desc}</div>`;
      btn.addEventListener('click', () => {
        choice.apply(game.player);
        levelupScreen.classList.add('hidden');
        game.state = 'play';
        updateHUD(); render();
        checkLevelUp();
      });
      choicesEl.appendChild(btn);
    }
  }

  // ===== ショップ =====
  function openShop() {
    game.state = 'shop';
    const shopScreen = $('shop-screen');
    shopScreen.classList.remove('hidden');
    $('shop-coins').textContent = `🪙 ${game.player.coins}`;

    const itemsEl = $('shop-items');
    itemsEl.innerHTML = '';
    const shopItems = generateShopItems(game.floor);

    for (const item of shopItems) {
      const btn = document.createElement('button');
      btn.className = 'shop-item-btn';
      const canBuy = game.player.coins >= item.price;
      btn.disabled = !canBuy;
      btn.innerHTML = `<span class="shop-item-emoji">${item.emoji}</span><span class="shop-item-info"><span class="shop-item-name">${item.name}</span><span class="shop-item-desc">${item.desc}</span></span><span class="shop-item-price ${canBuy ? '' : 'shop-item-expensive'}">🪙${item.price}</span>`;
      btn.addEventListener('click', () => {
        if (game.player.coins < item.price) return;
        game.player.coins -= item.price;

        if (item.type === 'weapon') {
          game.player.weapon = { emoji: item.emoji, name: item.name, atk: item.atk, crit: item.crit || 0, pierce: item.pierce || 0, lifesteal: item.lifesteal || 0 };
          addLog(`${item.emoji} ${item.name}を装備した！`, 'item');
          showPopup(`武器装備: ${item.name}`);
        } else if (item.type === 'armor') {
          game.player.armor = { emoji: item.emoji, name: item.name, def: item.def, evade: item.evade || 0, regen: item.regen || 0, thorns: item.thorns || 0 };
          addLog(`${item.emoji} ${item.name}を装備した！`, 'item');
          showPopup(`防具装備: ${item.name}`);
        } else if (item.type === 'accessory') {
          game.player.accessory = { emoji: item.emoji, name: item.name, atk: item.atk || 0, def: item.def || 0, evade: item.evade || 0, crit: item.crit || 0, regen: item.regen || 0, viewBonus: item.viewBonus || 0, coinBonus: item.coinBonus || 0, maxHpBonus: item.maxHpBonus || 0, double: item.double || false };
          addLog(`${item.emoji} ${item.name}を装備した！`, 'item');
          showPopup(`アクセサリ装備: ${item.name}`);
        } else {
          applyItemEffect(item.effect, item.value);
          addLog(`${item.emoji} ${item.name}を購入した！`, 'item');
        }

        btn.disabled = true;
        btn.style.opacity = '0.4';
        $('shop-coins').textContent = `🪙 ${game.player.coins}`;
        updateHUD();

        // 残りのアイテムの購入可否を更新
        itemsEl.querySelectorAll('.shop-item-btn:not([disabled])').forEach(b => {
          const priceText = b.querySelector('.shop-item-price').textContent;
          const price = parseInt(priceText.replace('🪙', ''));
          if (game.player.coins < price) b.disabled = true;
        });
      });
      itemsEl.appendChild(btn);
    }
  }

  function closeShop() {
    $('shop-screen').classList.add('hidden');
    game.state = 'play';
    updateHUD(); render();
  }

  // ===== イベント =====
  function openEvent(event) {
    game.state = 'event';
    game.eventTriggered = true;
    const eventScreen = $('event-screen');
    eventScreen.classList.remove('hidden');
    $('event-emoji').textContent = event.emoji;
    $('event-title').textContent = event.title;
    $('event-desc').textContent = event.desc;

    const choicesEl = $('event-choices');
    choicesEl.innerHTML = '';
    for (const choice of event.choices) {
      const btn = document.createElement('button');
      btn.className = 'event-choice-btn';
      const costText = choice.cost ? ` (${choice.cost}コイン)` : '';
      btn.textContent = choice.text + costText;
      if (choice.cost && game.player.coins < choice.cost) btn.disabled = true;
      btn.addEventListener('click', () => {
        if (choice.cost) game.player.coins -= choice.cost;
        const result = choice.apply(game.player);
        addLog(`${event.emoji} ${result}`, 'special');
        showPopup(result);
        eventScreen.classList.add('hidden');
        game.state = 'play';
        updateHUD(); render();
      });
      choicesEl.appendChild(btn);
    }
  }

  // ===== 装備画面 =====
  function openEquipment() {
    game.state = 'equip';
    const equipScreen = $('equip-screen');
    equipScreen.classList.remove('hidden');
    updateEquipDisplay();
  }

  function updateEquipDisplay() {
    const p = game.player;
    const stats = getEffectiveStats(p);
    $('equip-weapon').innerHTML = p.weapon ? `${p.weapon.emoji} ${p.weapon.name}` : '-- なし --';
    $('equip-armor').innerHTML = p.armor ? `${p.armor.emoji} ${p.armor.name}` : '-- なし --';
    $('equip-accessory').innerHTML = p.accessory ? `${p.accessory.emoji} ${p.accessory.name}` : '-- なし --';
    $('equip-stats').innerHTML = `攻撃: ${stats.atk} / 防御: ${stats.def} / 会心: ${stats.crit}% / 回避: ${stats.evade}%`;
  }

  function closeEquipment() {
    $('equip-screen').classList.add('hidden');
    game.state = 'play';
  }

  // ===== バッグ =====
  function openBag() {
    if (!game.player.bag || game.player.bag.length === 0) {
      addLog('バッグは空です', 'item');
      return;
    }
    game.state = 'bag';
    const bagScreen = $('bag-screen');
    bagScreen.classList.remove('hidden');
    updateBagDisplay();
  }

  function updateBagDisplay() {
    const p = game.player;
    const bagItemsEl = $('bag-items');
    bagItemsEl.innerHTML = '';
    $('bag-count').textContent = `${p.bag.length}/${p.bagSize || 3}`;

    for (let i = 0; i < p.bag.length; i++) {
      const item = p.bag[i];
      const btn = document.createElement('button');
      btn.className = 'bag-item-btn';
      btn.innerHTML = `<span class="bag-item-emoji">${item.emoji}</span><span class="bag-item-name">${item.name}</span><span class="bag-item-desc">${item.desc}</span>`;
      btn.addEventListener('click', () => {
        applyItemEffect(item.effect, item.value);
        addLog(`${item.emoji} ${item.name}を使った！ ${item.desc}`, 'item');
        p.bag.splice(i, 1);
        p.itemsUsed++;
        if (p.bag.length === 0) closeBag();
        else updateBagDisplay();
      });
      bagItemsEl.appendChild(btn);
    }
  }

  function closeBag() {
    $('bag-screen').classList.add('hidden');
    game.state = 'play';
    updateHUD(); render();
  }

  // ===== ガチャ =====
  function openGacha() {
    game.state = 'gacha';
    gachaScreen.classList.remove('hidden');
    $('gacha-result').classList.add('hidden');
    $('gacha-coins').textContent = `🪙 ${game.player.coins}`;
    updateGachaButton();
  }
  function closeGacha() { gachaScreen.classList.add('hidden'); game.state = 'play'; updateHUD(); render(); }
  function updateGachaButton() { $('gacha-pull-btn').disabled = game.player.coins < GACHA_COST; }

  function pullGacha() {
    if (game.player.coins < GACHA_COST) return;
    game.player.coins -= GACHA_COST;
    $('gacha-coins').textContent = `🪙 ${game.player.coins}`;

    const machine = $('gacha-machine');
    const capsule = $('gacha-capsule');
    const resultEl = $('gacha-result');
    resultEl.classList.add('hidden');
    machine.classList.add('spinning');
    capsule.textContent = '❓';

    setTimeout(() => {
      machine.classList.remove('spinning');
      const item = weightedRandom(GACHA_ITEMS);
      capsule.textContent = item.emoji;
      resultEl.classList.remove('hidden');
      $('gacha-result-rarity').textContent = `★ ${item.rarityName} ★`;
      $('gacha-result-rarity').className = `rarity-${item.rarity}`;
      $('gacha-result-emoji').textContent = item.emoji;
      $('gacha-result-name').textContent = item.name;
      $('gacha-result-desc').textContent = item.desc;
      applyItemEffect(item.effect, item.value);
      addLog(`ガチャ: ${item.rarityName} ${item.emoji} ${item.name}！`, item.rarity === 'ssr' ? 'special' : 'item');
      if (item.rarity === 'ssr') { screenFlash('#ff80ab', 0.4); screenShake(5, 10); }
      else if (item.rarity === 'sr') screenFlash('#ffd700', 0.2);
      updateGachaButton();
    }, 700);
  }

  // ===== トラップ処理 =====
  function triggerTrap() {
    const trap = TRAP_TYPES[rng(TRAP_TYPES.length)];
    addLog(`⚠️ ${trap.name}！ ${trap.desc}`, 'damage');
    screenShake(3, 5);

    switch (trap.effect) {
      case 'poison':
        game.statusEffects.poison = Math.max(game.statusEffects.poison, 5);
        break;
      case 'damage': {
        const dmg = 5 + Math.floor(game.floor * 0.8);
        game.player.hp = Math.max(1, game.player.hp - dmg);
        spawnDamageNumber(game.player.x, game.player.y, dmg, '#ff6b6b');
        flashHUD('hud-hp');
        break;
      }
      case 'blind':
        game.statusEffects.blind = Math.max(game.statusEffects.blind, 8);
        break;
      case 'warp': {
        // ランダムワープ
        let wx, wy, tries = 0;
        do { wx = rng(MAP_W); wy = rng(MAP_H); tries++; }
        while (tries < 100 && (game.map[wy][wx] === T.WALL || game.enemies.some(e => e.x === wx && e.y === wy)));
        if (tries < 100) { game.player.x = wx; game.player.y = wy; updateExplored(); }
        screenFlash('#b388ff', 0.3);
        break;
      }
      case 'confuse':
        game.statusEffects.confuse = Math.max(game.statusEffects.confuse, 6);
        break;
      case 'slow':
        game.statusEffects.slow = Math.max(game.statusEffects.slow, 8);
        break;
    }

    // トラップタイルを通常の床に変更
    game.map[game.player.y][game.player.x] = T.FLOOR;
    updateHUD();
  }

  // ===== ボス特殊行動 =====
  function bossSpecialAction(boss) {
    const p = game.player;
    switch (boss.special) {
      case 'summon':
        if (game.enemies.length < 6 && rng(3) === 0) {
          const minion = pickEnemyType(game.floor - 2);
          let mx, my, tries = 0;
          do { mx = boss.x + rng(5) - 2; my = boss.y + rng(5) - 2; tries++; }
          while (tries < 20 && (mx < 0 || mx >= MAP_W || my < 0 || my >= MAP_H || game.map[my][mx] === T.WALL || game.enemies.some(e => e.x === mx && e.y === my) || (mx === p.x && my === p.y)));
          if (tries < 20) {
            game.enemies.push({ ...minion, x: mx, y: my, maxHp: minion.hp, stunned: false });
            addLog(`${boss.name}が配下を呼んだ！`, 'special');
          }
        }
        break;
      case 'shield':
        if (rng(4) === 0 && !boss.shieldActive) {
          boss.shieldActive = true;
          boss.shieldTurns = 3;
          boss.originalDef = boss.def;
          boss.def += 15;
          addLog(`${boss.name}がバリアを張った！`, 'special');
        }
        if (boss.shieldActive) {
          boss.shieldTurns--;
          if (boss.shieldTurns <= 0) {
            boss.def = boss.originalDef;
            boss.shieldActive = false;
            addLog(`${boss.name}のバリアが消えた！`, 'floor');
          }
        }
        break;
      case 'aoe':
        if (rng(3) === 0 && dist(boss, p) <= 4) {
          const dmg = Math.floor(boss.atk * 0.6);
          p.hp -= dmg;
          spawnDamageNumber(p.x, p.y, dmg, '#ffa726');
          screenShake(5, 8);
          addLog(`${boss.name}の範囲攻撃！${dmg}ダメージ！`, 'damage');
          flashHUD('hud-hp');
          if (p.hp <= 0) { p.hp = 0; gameOver(); }
        }
        break;
      case 'clone':
        if (game.enemies.filter(e => e.isClone).length < 2 && rng(4) === 0) {
          const clone = { ...boss, hp: Math.floor(boss.maxHp * 0.3), maxHp: Math.floor(boss.maxHp * 0.3), atk: Math.floor(boss.atk * 0.5), isClone: true, special: null, exp: 5, coins: 5 };
          let cx, cy, tries = 0;
          do { cx = boss.x + rng(5) - 2; cy = boss.y + rng(5) - 2; tries++; }
          while (tries < 20 && (cx < 0 || cx >= MAP_W || cy < 0 || cy >= MAP_H || game.map[cy][cx] === T.WALL || game.enemies.some(e => e.x === cx && e.y === cy) || (cx === p.x && cy === p.y)));
          if (tries < 20) {
            game.enemies.push({ ...clone, x: cx, y: cy, stunned: false });
            addLog(`${boss.name}が分身を生んだ！`, 'special');
          }
        }
        break;
      case 'timestop':
        if (rng(5) === 0) {
          addLog(`${boss.name}が時を止めた！`, 'special');
          screenFlash('#9c7cff', 0.4);
          // ボスがもう1ターン行動
          const bdist = dist(boss, p);
          if (bdist <= 1) attackEnemy(boss, p);
        }
        break;
      case 'darkness':
        if (rng(4) === 0) {
          game.statusEffects.blind = Math.max(game.statusEffects.blind, 5);
          addLog(`${boss.name}が闇を放った！視界が狭まる！`, 'special');
          screenFlash('#000', 0.5);
        }
        break;
      case 'poison_field':
        if (rng(3) === 0) {
          game.statusEffects.poison = Math.max(game.statusEffects.poison, 4);
          addLog(`${boss.name}が毒の霧を放った！`, 'special');
          screenFlash('#66bb6a', 0.3);
        }
        break;
      case 'confuse':
        if (rng(4) === 0) {
          game.statusEffects.confuse = Math.max(game.statusEffects.confuse, 4);
          addLog(`${boss.name}のメロディ！方向感覚がおかしい！`, 'special');
        }
        break;
      case 'quake':
        if (rng(3) === 0) {
          const dmg = Math.floor(boss.atk * 0.8);
          p.hp -= dmg;
          spawnDamageNumber(p.x, p.y, dmg, '#ffa726');
          screenShake(10, 15);
          addLog(`${boss.name}の地震！${dmg}ダメージ！`, 'damage');
          flashHUD('hud-hp');
          if (p.hp <= 0) { p.hp = 0; gameOver(); }
        }
        break;
      case 'teleport_attack':
        if (rng(3) === 0 && dist(boss, p) > 2) {
          // プレイヤーの隣にワープ
          const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
          for (const [dx, dy] of dirs) {
            const nx = p.x + dx, ny = p.y + dy;
            if (nx >= 0 && nx < MAP_W && ny >= 0 && ny < MAP_H && game.map[ny][nx] !== T.WALL && !game.enemies.some(e => e.x === nx && e.y === ny)) {
              boss.x = nx; boss.y = ny;
              addLog(`${boss.name}が瞬間移動した！`, 'special');
              screenFlash('#b388ff', 0.2);
              break;
            }
          }
        }
        break;
    }
  }

  // ===== プレイヤー行動 =====
  function movePlayer(dx, dy) {
    if (game.state !== 'play' || inputLocked) return;

    // 混乱状態：25%の確率でランダム方向に
    if (game.statusEffects.confuse > 0 && rng(100) < 25) {
      const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
      [dx, dy] = dirs[rng(4)];
      addLog('混乱して別の方向に進んだ！', 'damage');
    }

    const p = game.player;
    const nx = p.x + dx, ny = p.y + dy;
    if (nx < 0 || nx >= MAP_W || ny < 0 || ny >= MAP_H) return;
    if (game.map[ny][nx] === T.WALL) return;

    const enemy = game.enemies.find(e => e.x === nx && e.y === ny);
    if (enemy) { attackEnemy(p, enemy); endPlayerTurn(); return; }

    p.x = nx; p.y = ny;
    updateExplored();

    // アイテム拾い
    const itemIdx = game.items.findIndex(it => it.x === nx && it.y === ny);
    if (itemIdx >= 0) {
      const item = game.items[itemIdx];
      const bag = p.bag || [];
      const bagSize = p.bagSize || 3;
      // 即座に使えるものはすぐ使う、それ以外はバッグへ
      const instantUse = ['heal', 'fullheal', 'exp', 'coins', 'reveal', 'cure'];
      if (instantUse.includes(item.effect)) {
        addLog(`${item.emoji} ${item.name}を拾った！ ${item.desc}`, 'item');
        p.itemsUsed++;
        applyItemEffect(item.effect, item.value);
      } else if (bag.length < bagSize) {
        p.bag.push({ emoji: item.emoji, name: item.name, effect: item.effect, value: item.value, desc: item.desc });
        addLog(`${item.emoji} ${item.name}をバッグに入れた！`, 'item');
        showPopup(`バッグ: ${item.name}`);
      } else {
        addLog(`${item.emoji} ${item.name}を拾った！ ${item.desc}`, 'item');
        p.itemsUsed++;
        applyItemEffect(item.effect, item.value);
      }
      game.items.splice(itemIdx, 1);
    }

    // 特殊タイル処理
    const tile = game.map[ny][nx];
    if (tile === T.STAIR) {
      game.floor++;
      addLog(`${game.floor}Fに到達！`, 'floor');
      flashHUD('hud-floor');
      screenFlash('#b388ff', 0.2);
      generateFloor();
      saveGame();
      render();
      return;
    }
    if (tile === T.TRAP) { triggerTrap(); }
    if (tile === T.SHOP) { openShop(); return; }
    if (tile === T.REST) {
      const healAmt = Math.floor(game.player.maxHp * 0.4);
      game.player.hp = Math.min(game.player.maxHp, game.player.hp + healAmt);
      addLog(`休憩ポイントでHP${healAmt}回復！`, 'heal');
      spawnHealNumber(p.x, p.y, healAmt);
      flashHUD('hud-hp');
      game.map[ny][nx] = T.FLOOR; // 一度きり
    }
    if (tile === T.TREASURE) {
      // 宝箱
      const r = rng(100);
      if (r < 30) {
        const coinAmt = 15 + rng(20) + game.floor * 2;
        game.player.coins += coinAmt;
        addLog(`💰 宝箱からコイン${coinAmt}枚！`, 'coin');
        showPopup(`コイン +${coinAmt}！`);
        flashHUD('hud-coin');
      } else if (r < 60) {
        const tier = Math.min(Math.floor(game.floor / 8), 6);
        const pool = WEAPONS.filter(w => w.tier >= tier - 1 && w.tier <= tier + 1);
        if (pool.length) {
          const w = pool[rng(pool.length)];
          game.player.weapon = { ...w };
          addLog(`${w.emoji} 宝箱から${w.name}！`, 'special');
          showPopup(`武器: ${w.name}`);
        }
      } else {
        const tier = Math.min(Math.floor(game.floor / 8), 6);
        const pool = ARMORS.filter(a => a.tier >= tier - 1 && a.tier <= tier + 1);
        if (pool.length) {
          const a = pool[rng(pool.length)];
          game.player.armor = { ...a };
          addLog(`${a.emoji} 宝箱から${a.name}！`, 'special');
          showPopup(`防具: ${a.name}`);
        }
      }
      game.map[ny][nx] = T.FLOOR;
      screenFlash('#ffd700', 0.3);
    }

    // ミニイベント（低確率、階移動直後は発生しない）
    if (!game.eventTriggered && rng(100) < 4 && game.floor > 3) {
      const event = EVENTS[rng(EVENTS.length)];
      openEvent(event);
      return;
    }

    endPlayerTurn();
  }

  function waitTurn() {
    if (game.state !== 'play' || inputLocked) return;
    endPlayerTurn();
  }

  // ===== 敵の行動 =====
  function enemyTurn() {
    const p = game.player;
    const enemies = [...game.enemies]; // コピーして反復

    for (const e of enemies) {
      if (!game.enemies.includes(e)) continue; // 既に死亡
      if (e.stunned) { e.stunned = false; continue; }

      // ボス特殊行動
      if (e.isBoss && e.special) bossSpecialAction(e);
      if (game.state !== 'play') return;

      const d = dist(e, p);
      let dx = 0, dy = 0;

      switch (e.behavior) {
        case 'chase': case 'boss':
          if (d <= 8) { dx = Math.sign(p.x - e.x); dy = Math.sign(p.y - e.y); if (rng(2) === 0) dy = 0; else dx = 0; }
          else { const dirs = [[0,1],[0,-1],[1,0],[-1,0]]; [dx, dy] = dirs[rng(4)]; }
          break;
        case 'flee':
          if (d <= 5) { dx = Math.sign(e.x - p.x); dy = Math.sign(e.y - p.y); if (rng(2) === 0) dy = 0; else dx = 0; }
          else { const dirs = [[0,1],[0,-1],[1,0],[-1,0]]; [dx, dy] = dirs[rng(4)]; }
          break;
        case 'mirror':
          dx = Math.sign(p.x - e.x); dy = Math.sign(p.y - e.y);
          if (d <= 1) { dx = -dx; dy = -dy; }
          if (rng(2) === 0) dy = 0; else dx = 0;
          break;
        case 'teleport':
          if (d <= 2 && rng(3) === 0) {
            let tx, ty, tries = 0;
            do { tx = e.x + rng(7) - 3; ty = e.y + rng(7) - 3; tries++; }
            while (tries < 20 && (tx < 0 || tx >= MAP_W || ty < 0 || ty >= MAP_H || game.map[ty][tx] === T.WALL || game.enemies.some(o => o !== e && o.x === tx && o.y === ty) || (tx === p.x && ty === p.y)));
            if (tries < 20) { e.x = tx; e.y = ty; continue; }
          }
          dx = Math.sign(p.x - e.x); dy = Math.sign(p.y - e.y);
          if (rng(2) === 0) dy = 0; else dx = 0;
          break;
        case 'patrol': {
          if (!e.patrolDir) e.patrolDir = rng(4);
          if (rng(5) === 0) e.patrolDir = rng(4);
          const dirs = [[0,-1],[0,1],[-1,0],[1,0]];
          [dx, dy] = dirs[e.patrolDir];
          if (d <= 4) { dx = Math.sign(p.x - e.x); dy = Math.sign(p.y - e.y); if (rng(2) === 0) dy = 0; else dx = 0; }
          break;
        }
        case 'ambush':
          if (d <= 2) { dx = Math.sign(p.x - e.x); dy = Math.sign(p.y - e.y); if (rng(2) === 0) dy = 0; else dx = 0; }
          // 遠い時は動かない（待ち伏せ）
          break;
        case 'pull':
          if (d <= 6 && d > 1 && rng(4) === 0) {
            // プレイヤーを引き寄せる
            const pullDx = Math.sign(e.x - p.x);
            const pullDy = Math.sign(e.y - p.y);
            const pullX = p.x + pullDx, pullY = p.y + pullDy;
            if (pullX >= 0 && pullX < MAP_W && pullY >= 0 && pullY < MAP_H && game.map[pullY][pullX] !== T.WALL && !game.enemies.some(o => o.x === pullX && o.y === pullY)) {
              p.x = pullX; p.y = pullY;
              addLog(`${e.name}に引き寄せられた！`, 'damage');
              screenShake(2, 4);
            }
          }
          dx = Math.sign(p.x - e.x); dy = Math.sign(p.y - e.y);
          if (rng(2) === 0) dy = 0; else dx = 0;
          break;
        case 'split':
          // 被ダメ時に分裂（HPが半分以下で一度だけ）
          if (!e.hasSplit && e.hp <= e.maxHp * 0.5 && game.enemies.length < 10) {
            e.hasSplit = true;
            const clone = { ...e, hp: Math.floor(e.hp * 0.6), maxHp: Math.floor(e.maxHp * 0.6), exp: Math.floor(e.exp * 0.5), coins: Math.floor(e.coins * 0.5), hasSplit: true };
            let cx, cy, tries = 0;
            do { cx = e.x + rng(3) - 1; cy = e.y + rng(3) - 1; tries++; }
            while (tries < 10 && (cx < 0 || cx >= MAP_W || cy < 0 || cy >= MAP_H || game.map[cy][cx] === T.WALL || game.enemies.some(o => o.x === cx && o.y === cy) || (cx === p.x && cy === p.y)));
            if (tries < 10) {
              game.enemies.push({ ...clone, x: cx, y: cy, stunned: false });
              addLog(`${e.name}が分裂した！`, 'special');
            }
          }
          dx = Math.sign(p.x - e.x); dy = Math.sign(p.y - e.y);
          if (rng(2) === 0) dy = 0; else dx = 0;
          break;
        case 'wander': default: {
          const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
          [dx, dy] = dirs[rng(4)];
          if (d <= 3) { dx = Math.sign(p.x - e.x); dy = Math.sign(p.y - e.y); if (rng(2) === 0) dy = 0; else dx = 0; }
          break;
        }
      }

      const nx = e.x + dx, ny = e.y + dy;
      if (nx === p.x && ny === p.y) {
        attackEnemy(e, p);
        if (game.state !== 'play') return;
        continue;
      }
      if (nx >= 0 && nx < MAP_W && ny >= 0 && ny < MAP_H && game.map[ny][nx] !== T.WALL && !game.enemies.some(o => o !== e && o.x === nx && o.y === ny))
        { e.x = nx; e.y = ny; }
    }
  }

  function endPlayerTurn() {
    game.turnCount++;
    const p = game.player;
    const stats = getEffectiveStats(p);

    // リジェネ
    if (stats.regen > 0 && p.hp < p.maxHp) {
      const healAmt = stats.regen;
      p.hp = Math.min(p.maxHp, p.hp + healAmt);
    }

    // 毒ダメージ
    if (game.statusEffects.poison > 0) {
      const poisonDmg = 3;
      p.hp = Math.max(1, p.hp - poisonDmg);
      game.statusEffects.poison--;
      spawnDamageNumber(p.x, p.y, poisonDmg, '#66bb6a');
      if (game.statusEffects.poison === 0) addLog('毒が消えた', 'heal');
    }

    // 状態異常カウントダウン
    if (game.statusEffects.blind > 0) game.statusEffects.blind--;
    if (game.statusEffects.confuse > 0) game.statusEffects.confuse--;
    if (game.statusEffects.slow > 0) game.statusEffects.slow--;
    if (p.barrierTurns > 0) p.barrierTurns--;

    // 2回行動
    if (p.doubleTurns > 0) {
      p.doubleTurns--;
      render(); return;
    }

    // 鈍足時は敵が2回行動
    enemyTurn();
    if (game.state !== 'play') return;
    if (game.statusEffects.slow > 0) {
      enemyTurn();
      if (game.state !== 'play') return;
    }

    render();
  }

  // ===== ゲームオーバー =====
  function gameOver() {
    game.state = 'dead';
    deleteSave();
    sg.onGameEnd(game.floor);

    const best = Number(localStorage.getItem(BEST_KEY) || 0);
    const isNew = game.floor > best;
    if (isNew) localStorage.setItem(BEST_KEY, game.floor);

    const stats = $('gameover-stats');
    stats.innerHTML = `
      到達階: <span style="color:#b388ff;font-size:28px">${game.floor}F</span><br>
      レベル: ${game.player.level}<br>
      撃破数: ${game.player.kills}体<br>
      ボス撃破: ${game.player.bossKills}体<br>
      ターン数: ${game.turnCount}<br>
      ${isNew ? '<span class="sg-new-record">★ 新記録！ ★</span>' : `最高記録: ${best}F`}
    `;

    $('gameover-epitaph').textContent = EPITAPHS[rng(EPITAPHS.length)];

    const reviveSection = $('revive-section');
    if (reviveUsed) reviveSection.classList.add('used'); else reviveSection.classList.remove('used');

    // シェアボタン表示
    const shareBtn = $('share-btn');
    if (shareBtn) {
      shareBtn.classList.remove('hidden');
      shareBtn.onclick = () => {
        const txt = `🗼 シュールの塔 ${game.floor}F到達！\nLv${game.player.level} / 撃破${game.player.kills}体\n${isNew ? '★新記録★' : ''}\n#シュールゲームス`;
        const url = window.location.href;
        window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(txt + '\n' + url), '_blank');
      };
    }

    showScreen('gameover');
    if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
  }

  // ===== 復活 =====
  function revivePlayer() {
    if (reviveUsed || !game) return;
    reviveUsed = true;
    window.open('https://x.com/tadanosyuhuda', '_blank', 'noopener');

    const p = game.player;
    p.hp = Math.floor(p.maxHp * 0.5);
    game.state = 'play';
    game.statusEffects = { poison: 0, blind: 0, confuse: 0, slow: 0 };

    for (const e of game.enemies) {
      if (dist(e, p) <= 2) {
        e.stunned = true;
        const pushX = Math.sign(e.x - p.x) * 3;
        const pushY = Math.sign(e.y - p.y) * 3;
        const nx = clamp(e.x + pushX, 1, MAP_W - 2);
        const ny = clamp(e.y + pushY, 1, MAP_H - 2);
        if (game.map[ny][nx] !== T.WALL) { e.x = nx; e.y = ny; }
      }
    }

    showScreen('game');
    addLog('フォローの力で復活した！', 'special');
    screenFlash('#ffd700', 0.4);
    render();
    startAnimLoop();
  }

  // ===== 描画 =====
  function render() {
    if (!game) return;
    updateHUD();

    // シェイク
    let sx = 0, sy = 0;
    if (shakeDuration > 0) {
      sx = (Math.random() - 0.5) * shakeIntensity * 2;
      sy = (Math.random() - 0.5) * shakeIntensity * 2;
      shakeDuration--;
      if (shakeDuration === 0) shakeIntensity = 0;
    }

    ctx.save();
    ctx.translate(sx, sy);

    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(-10, -10, CANVAS_W + 20, CANVAS_H + 20);

    const p = game.player;
    const stats = getEffectiveStats(p);
    const blindPenalty = (game.statusEffects.blind > 0) ? 2 : 0;
    const viewDist = Math.max(2, 5 + stats.viewBonus - blindPenalty);

    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const d = Math.abs(x - p.x) + Math.abs(y - p.y);
        const inView = d <= viewDist * 1.5;
        const explored = game.explored[y][x];
        if (!explored) continue;

        const px = x * TILE, py = y * TILE;
        const alpha = inView ? 1.0 : 0.3;
        const tile = game.map[y][x];

        switch (tile) {
          case T.WALL:
            ctx.fillStyle = `rgba(35, 28, 55, ${alpha})`;
            ctx.fillRect(px, py, TILE, TILE);
            // 壁のディテール
            ctx.fillStyle = `rgba(55, 42, 82, ${alpha * 0.6})`;
            ctx.fillRect(px + 1, py + 1, TILE - 2, 1);
            ctx.fillRect(px + 1, py + 1, 1, TILE - 2);
            ctx.fillStyle = `rgba(20, 15, 35, ${alpha * 0.6})`;
            ctx.fillRect(px + 1, py + TILE - 2, TILE - 2, 1);
            ctx.fillRect(px + TILE - 2, py + 1, 1, TILE - 2);
            break;
          case T.FLOOR:
            ctx.fillStyle = `rgba(22, 19, 38, ${alpha})`;
            ctx.fillRect(px, py, TILE, TILE);
            // 床タイルのグリッド
            ctx.strokeStyle = `rgba(40, 34, 60, ${alpha * 0.4})`;
            ctx.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
            break;
          case T.STAIR:
            ctx.fillStyle = `rgba(22, 19, 38, ${alpha})`;
            ctx.fillRect(px, py, TILE, TILE);
            // 階段の輝き
            if (inView) {
              const glow = 0.15 + Math.sin(tileAnimPhase * 0.05) * 0.1;
              ctx.fillStyle = `rgba(179, 136, 255, ${glow})`;
              ctx.fillRect(px + 2, py + 2, TILE - 4, TILE - 4);
            }
            ctx.font = `${TILE - 4}px serif`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.globalAlpha = alpha;
            ctx.fillText('🔼', px + TILE / 2, py + TILE / 2);
            ctx.globalAlpha = 1;
            break;
          case T.TRAP:
            ctx.fillStyle = `rgba(22, 19, 38, ${alpha})`;
            ctx.fillRect(px, py, TILE, TILE);
            // トラップは見えにくい
            if (inView && explored) {
              ctx.fillStyle = `rgba(255, 100, 100, ${alpha * 0.15})`;
              ctx.fillRect(px + 4, py + 4, TILE - 8, TILE - 8);
            }
            break;
          case T.SHOP:
            ctx.fillStyle = `rgba(22, 19, 38, ${alpha})`;
            ctx.fillRect(px, py, TILE, TILE);
            if (inView || explored) {
              const glow = 0.15 + Math.sin(tileAnimPhase * 0.04) * 0.1;
              ctx.fillStyle = `rgba(255, 171, 64, ${glow})`;
              ctx.fillRect(px + 2, py + 2, TILE - 4, TILE - 4);
              ctx.font = `${TILE - 6}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
              ctx.globalAlpha = alpha;
              ctx.fillText('🏪', px + TILE / 2, py + TILE / 2);
              ctx.globalAlpha = 1;
            }
            break;
          case T.REST:
            ctx.fillStyle = `rgba(22, 19, 38, ${alpha})`;
            ctx.fillRect(px, py, TILE, TILE);
            if (inView || explored) {
              const glow = 0.15 + Math.sin(tileAnimPhase * 0.03) * 0.1;
              ctx.fillStyle = `rgba(102, 187, 106, ${glow})`;
              ctx.fillRect(px + 2, py + 2, TILE - 4, TILE - 4);
              ctx.font = `${TILE - 6}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
              ctx.globalAlpha = alpha;
              ctx.fillText('🏕️', px + TILE / 2, py + TILE / 2);
              ctx.globalAlpha = 1;
            }
            break;
          case T.TREASURE:
            ctx.fillStyle = `rgba(22, 19, 38, ${alpha})`;
            ctx.fillRect(px, py, TILE, TILE);
            if (inView || explored) {
              const glow = 0.2 + Math.sin(tileAnimPhase * 0.06) * 0.15;
              ctx.fillStyle = `rgba(255, 215, 0, ${glow})`;
              ctx.fillRect(px + 2, py + 2, TILE - 4, TILE - 4);
              ctx.font = `${TILE - 6}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
              ctx.globalAlpha = alpha;
              ctx.fillText('📦', px + TILE / 2, py + TILE / 2);
              ctx.globalAlpha = 1;
            }
            break;
        }
      }
    }

    // アイテム描画
    for (const item of game.items) {
      if (!game.explored[item.y][item.x]) continue;
      const d = Math.abs(item.x - p.x) + Math.abs(item.y - p.y);
      const alpha = d <= viewDist * 1.5 ? 1.0 : 0.5;
      const bounce = Math.sin(tileAnimPhase * 0.08 + item.x * 0.5) * 2;
      ctx.font = `${TILE - 6}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.globalAlpha = alpha;
      ctx.fillText(item.emoji, item.x * TILE + TILE / 2, item.y * TILE + TILE / 2 + bounce);
      ctx.globalAlpha = 1;
    }

    // 敵描画
    for (const e of game.enemies) {
      const d = Math.abs(e.x - p.x) + Math.abs(e.y - p.y);
      if (d > viewDist * 1.5) continue;

      const ex = e.x * TILE, ey = e.y * TILE;

      // エリート/ボス: 背景光
      if (e.isBoss) {
        const glow = 0.15 + Math.sin(tileAnimPhase * 0.06) * 0.1;
        ctx.fillStyle = `rgba(255, 80, 80, ${glow})`;
        ctx.beginPath(); ctx.arc(ex + TILE / 2, ey + TILE / 2, TILE * 0.6, 0, Math.PI * 2); ctx.fill();
      } else if (e.isElite) {
        const glow = 0.12 + Math.sin(tileAnimPhase * 0.05) * 0.08;
        ctx.fillStyle = `rgba(179, 136, 255, ${glow})`;
        ctx.beginPath(); ctx.arc(ex + TILE / 2, ey + TILE / 2, TILE * 0.5, 0, Math.PI * 2); ctx.fill();
      }

      ctx.font = `${TILE - 4}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(e.emoji, ex + TILE / 2, ey + TILE / 2);

      // HPバー
      const barW = TILE - 4, barH = 3, bx = ex + 2, by = ey;
      ctx.fillStyle = '#222'; ctx.fillRect(bx, by, barW, barH);
      const ratio = e.hp / e.maxHp;
      ctx.fillStyle = e.isBoss ? '#ff4444' : (ratio > 0.5 ? '#66bb6a' : ratio > 0.25 ? '#ffa726' : '#ff6b6b');
      ctx.fillRect(bx, by, barW * ratio, barH);

      // ボス: 名前表示
      if (e.isBoss && d <= 6) {
        ctx.font = '10px "DotGothic16", monospace';
        ctx.fillStyle = '#ff8888';
        ctx.textAlign = 'center';
        ctx.fillText(e.name, ex + TILE / 2, ey - 4);
      }
    }

    // プレイヤー描画
    const playerX = p.x * TILE, playerY = p.y * TILE;

    // バリアエフェクト
    if (p.barrierTurns > 0) {
      const glow = 0.2 + Math.sin(tileAnimPhase * 0.1) * 0.1;
      ctx.fillStyle = `rgba(66, 165, 245, ${glow})`;
      ctx.beginPath(); ctx.arc(playerX + TILE / 2, playerY + TILE / 2, TILE * 0.7, 0, Math.PI * 2); ctx.fill();
    }

    // 毒エフェクト
    if (game.statusEffects.poison > 0) {
      const glow = 0.15 + Math.sin(tileAnimPhase * 0.1) * 0.1;
      ctx.fillStyle = `rgba(100, 200, 100, ${glow})`;
      ctx.beginPath(); ctx.arc(playerX + TILE / 2, playerY + TILE / 2, TILE * 0.6, 0, Math.PI * 2); ctx.fill();
    }

    ctx.font = `${TILE - 2}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('🧙', playerX + TILE / 2, playerY + TILE / 2);

    // プレイヤーHPバー
    const phpW = TILE - 4, phpH = 3, phpX = playerX + 2, phpY = playerY;
    ctx.fillStyle = '#222'; ctx.fillRect(phpX, phpY, phpW, phpH);
    const hpRatio = p.hp / p.maxHp;
    ctx.fillStyle = hpRatio > 0.5 ? '#66bb6a' : hpRatio > 0.25 ? '#ffa726' : '#ff6b6b';
    ctx.fillRect(phpX, phpY, phpW * hpRatio, phpH);

    // パーティクル
    drawParticles();

    ctx.restore();

    // フラッシュオーバーレイ
    if (flashAlpha > 0) {
      ctx.fillStyle = flashColor || '#fff';
      ctx.globalAlpha = flashAlpha;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.globalAlpha = 1;
      flashAlpha -= 0.02;
      if (flashAlpha < 0) flashAlpha = 0;
    }

    // ミニマップ（右上）
    drawMinimap();
  }

  function drawMinimap() {
    if (!game || !game.explored) return;
    const mmSize = 3; // ミニマップ1マスのサイズ
    const mmX = CANVAS_W - MAP_W * mmSize - 4;
    const mmY = 4;
    const p = game.player;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(mmX - 2, mmY - 2, MAP_W * mmSize + 4, MAP_H * mmSize + 4);

    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        if (!game.explored[y][x]) continue;
        const mx = mmX + x * mmSize, my = mmY + y * mmSize;
        const tile = game.map[y][x];
        if (tile === T.WALL) ctx.fillStyle = '#2a2040';
        else if (tile === T.STAIR) ctx.fillStyle = '#b388ff';
        else if (tile === T.SHOP) ctx.fillStyle = '#ffab40';
        else if (tile === T.REST) ctx.fillStyle = '#66bb6a';
        else if (tile === T.TREASURE) ctx.fillStyle = '#ffd700';
        else if (tile === T.TRAP) ctx.fillStyle = '#1a1430';
        else ctx.fillStyle = '#1a1430';
        ctx.fillRect(mx, my, mmSize, mmSize);
      }
    }

    // 敵表示
    for (const e of game.enemies) {
      if (!game.explored[e.y][e.x]) continue;
      ctx.fillStyle = e.isBoss ? '#ff4444' : (e.isElite ? '#b388ff' : '#ff6b6b');
      ctx.fillRect(mmX + e.x * mmSize, mmY + e.y * mmSize, mmSize, mmSize);
    }

    // プレイヤー
    ctx.fillStyle = '#fff';
    ctx.fillRect(mmX + p.x * mmSize, mmY + p.y * mmSize, mmSize, mmSize);
  }

  function updateHUD() {
    if (!game) return;
    const p = game.player;
    const stats = getEffectiveStats(p);
    $('hud-floor').textContent = `🗼 ${game.floor}F`;
    $('hud-hp').textContent = `❤️ ${p.hp}/${p.maxHp}`;
    $('hud-atk').textContent = `⚔️ ${stats.atk}`;
    $('hud-def').textContent = `🛡️ ${stats.def}`;
    $('hud-exp').textContent = `✨ Lv${p.level}`;
    $('hud-coin').textContent = `🪙 ${p.coins}`;

    // 状態異常アイコン表示
    const statusEl = $('hud-status');
    if (statusEl) {
      const icons = [];
      if (game.statusEffects.poison > 0) icons.push(`🤢${game.statusEffects.poison}`);
      if (game.statusEffects.blind > 0) icons.push(`😶‍🌫️${game.statusEffects.blind}`);
      if (game.statusEffects.confuse > 0) icons.push(`😵${game.statusEffects.confuse}`);
      if (game.statusEffects.slow > 0) icons.push(`🐌${game.statusEffects.slow}`);
      if (p.barrierTurns > 0) icons.push(`🛡️${p.barrierTurns}`);
      if (p.doubleTurns > 0) icons.push(`⚡${p.doubleTurns}`);
      statusEl.textContent = icons.join(' ');
    }

    // 装備表示
    const equipEl = $('hud-equip');
    if (equipEl) {
      const parts = [];
      if (p.weapon) parts.push(p.weapon.emoji);
      if (p.armor) parts.push(p.armor.emoji);
      if (p.accessory) parts.push(p.accessory.emoji);
      equipEl.textContent = parts.join('') || '--';
    }
  }

  // ===== 画面切り替え =====
  function showScreen(name) {
    titleScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    gameoverScreen.classList.add('hidden');
    switch (name) {
      case 'title': titleScreen.classList.remove('hidden'); break;
      case 'game': gameScreen.classList.remove('hidden'); break;
      case 'gameover': gameoverScreen.classList.remove('hidden'); break;
    }
  }

  // ===== アニメーションループ =====
  function startAnimLoop() {
    if (animFrame) return;
    function loop(time) {
      if (!game || game.state === 'dead') { animFrame = null; return; }
      tileAnimPhase++;
      updateParticles();
      if (particles.length > 0 || shakeDuration > 0 || flashAlpha > 0) render();
      animFrame = requestAnimationFrame(loop);
    }
    animFrame = requestAnimationFrame(loop);
  }

  // ===== 入力処理 =====
  document.addEventListener('keydown', e => {
    if (!game) return;
    if (game.state === 'play') {
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': e.preventDefault(); movePlayer(0, -1); break;
        case 'ArrowDown': case 's': case 'S': e.preventDefault(); movePlayer(0, 1); break;
        case 'ArrowLeft': case 'a': case 'A': e.preventDefault(); movePlayer(-1, 0); break;
        case 'ArrowRight': case 'd': case 'D': e.preventDefault(); movePlayer(1, 0); break;
        case ' ': case '.': e.preventDefault(); waitTurn(); break;
        case 'g': case 'G': e.preventDefault(); tryOpenGacha(); break;
        case 'e': case 'E': e.preventDefault(); openEquipment(); break;
        case 'b': case 'B': e.preventDefault(); openBag(); break;
      }
    } else if (game.state === 'equip') {
      if (e.key === 'Escape' || e.key === 'e' || e.key === 'E') closeEquipment();
    } else if (game.state === 'bag') {
      if (e.key === 'Escape' || e.key === 'b' || e.key === 'B') closeBag();
    } else if (game.state === 'shop') {
      if (e.key === 'Escape') closeShop();
    }
  });

  function tryOpenGacha() {
    if (!game || game.state !== 'play') return;
    if (game.player.coins < GACHA_COST) { addLog('コインが足りない...（10コイン必要）', 'coin'); return; }
    openGacha();
  }

  // モバイルコントロール
  document.querySelectorAll('.ctrl-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      if (!game || game.state !== 'play') return;
      switch (btn.dataset.dir) {
        case 'up': movePlayer(0, -1); break;
        case 'down': movePlayer(0, 1); break;
        case 'left': movePlayer(-1, 0); break;
        case 'right': movePlayer(1, 0); break;
        case 'wait': waitTurn(); break;
      }
    });
  });

  // スワイプ操作
  let touchStart = null;
  canvas.addEventListener('touchstart', e => { touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }; });
  canvas.addEventListener('touchend', e => {
    if (!touchStart || !game || game.state !== 'play') return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.x, dy = t.clientY - touchStart.y;
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) waitTurn();
    else if (Math.abs(dx) > Math.abs(dy)) movePlayer(dx > 0 ? 1 : -1, 0);
    else movePlayer(0, dy > 0 ? 1 : -1);
    touchStart = null;
  });

  // ===== ボタン =====
  $('start-btn').addEventListener('click', initGame);
  $('continue-btn').addEventListener('click', () => { if (!loadGame()) initGame(); });
  $('retry-btn').addEventListener('click', initGame);
  $('revive-btn').addEventListener('click', revivePlayer);
  $('gacha-pull-btn').addEventListener('click', pullGacha);
  $('gacha-close-btn').addEventListener('click', closeGacha);
  $('shop-close-btn').addEventListener('click', closeShop);
  $('equip-close-btn').addEventListener('click', closeEquipment);
  $('bag-close-btn').addEventListener('click', closeBag);

  // HUDにボタン追加
  const hudBtns = document.createElement('div');
  hudBtns.id = 'hud-buttons';
  hudBtns.innerHTML = `
    <button id="hud-gacha-btn" title="ガチャ [G]">🎰</button>
    <button id="hud-equip-btn" title="装備 [E]">⚔️</button>
    <button id="hud-bag-btn" title="バッグ [B]">🎒</button>
  `;
  $('game-hud').appendChild(hudBtns);
  $('hud-gacha-btn').addEventListener('click', tryOpenGacha);
  $('hud-equip-btn').addEventListener('click', () => { if (game && game.state === 'play') openEquipment(); });
  $('hud-bag-btn').addEventListener('click', () => { if (game && game.state === 'play') openBag(); });

  // ===== ハイスコア表示 =====
  function showHighScore() {
    const best = Number(localStorage.getItem(BEST_KEY) || 0);
    const el = $('highscore-display');
    if (best > 0) el.innerHTML = `<span class="sg-highscore-badge">${best}F</span>`;
    else el.textContent = '';
  }

  // ===== 初期化 =====
  showHighScore();
  updateTitleButtons();

})();
