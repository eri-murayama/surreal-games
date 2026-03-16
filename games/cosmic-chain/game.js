/* ============================================
   COSMIC CHAIN - コズミック・チェイン ～星々の連鎖反応～
   A chain-reaction game with spectacular particle effects
   ============================================ */

(function () {
  'use strict';

  // ---- Canvas Setup ----
  const bgCanvas = document.getElementById('bg-canvas');
  const bgCtx = bgCanvas.getContext('2d');
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');

  let W, H;

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    bgCanvas.width = canvas.width = W;
    bgCanvas.height = canvas.height = H;
  }
  resize();
  window.addEventListener('resize', resize);

  // ---- Audio Context (Web Audio API for SFX) ----
  let audioCtx = null;
  function ensureAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  function playTone(freq, duration, type, volume, detune) {
    try {
      const ctx = ensureAudio();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.value = freq;
      if (detune) osc.detune.value = detune;
      gain.gain.setValueAtTime(volume || 0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) { /* silent fail */ }
  }

  function playExplosion(pitch) {
    const base = 200 + pitch * 80;
    playTone(base, 0.3, 'sine', 0.12);
    playTone(base * 1.5, 0.2, 'triangle', 0.08);
    setTimeout(() => playTone(base * 0.5, 0.4, 'sine', 0.06), 50);
  }

  function playChain(chainNum) {
    const base = 300 + chainNum * 60;
    playTone(base, 0.15, 'sine', 0.15);
    setTimeout(() => playTone(base * 1.25, 0.15, 'sine', 0.12), 60);
    setTimeout(() => playTone(base * 1.5, 0.2, 'triangle', 0.10), 120);
  }

  function playLevelClear() {
    [0, 100, 200, 300, 400].forEach((d, i) => {
      setTimeout(() => playTone(400 + i * 100, 0.3, 'sine', 0.12), d);
    });
  }

  function playGameOver() {
    [0, 150, 300].forEach((d, i) => {
      setTimeout(() => playTone(400 - i * 80, 0.4, 'sine', 0.1), d);
    });
  }

  function playClick() {
    playTone(600, 0.08, 'sine', 0.1);
    playTone(800, 0.06, 'triangle', 0.06);
  }

  // ---- Color Palettes ----
  const PALETTES = [
    // Level theme colors [orb, explosion glow, particle]
    { orb: ['#a78bfa', '#818cf8', '#c084fc'], glow: '#7c3aed', name: 'ネビュラ' },
    { orb: ['#60a5fa', '#38bdf8', '#22d3ee'], glow: '#3b82f6', name: 'アクア' },
    { orb: ['#f472b6', '#fb7185', '#f9a8d4'], glow: '#ec4899', name: 'サクラ' },
    { orb: ['#34d399', '#4ade80', '#a7f3d0'], glow: '#10b981', name: 'エメラルド' },
    { orb: ['#fbbf24', '#f59e0b', '#fde68a'], glow: '#f59e0b', name: 'ソーラー' },
    { orb: ['#f87171', '#fb923c', '#fca5a5'], glow: '#ef4444', name: 'フレア' },
    { orb: ['#c084fc', '#e879f9', '#f0abfc'], glow: '#a855f7', name: 'コスモ' },
    { orb: ['#2dd4bf', '#5eead4', '#99f6e4'], glow: '#14b8a6', name: 'オーシャン' },
    { orb: ['#fb923c', '#fbbf24', '#fed7aa'], glow: '#f97316', name: 'サンセット' },
    { orb: ['#a78bfa', '#f472b6', '#60a5fa'], glow: '#8b5cf6', name: 'レインボー' },
  ];

  // ---- Game State ----
  const STATE = {
    TITLE: 'title',
    PLAYING: 'playing',
    LEVEL_INTRO: 'level_intro',
    CHAIN_RUNNING: 'chain_running',
    LEVEL_CLEAR: 'level_clear',
    GAME_OVER: 'game_over',
  };

  let state = STATE.TITLE;
  let score = 0;
  let level = 1;
  let clicksLeft = 0;
  let currentChain = 0;
  let maxChain = 0;
  let bestScore = parseInt(localStorage.getItem('cosmicChainBest') || '0', 10);
  let levelScore = 0;
  let totalOrbsExploded = 0;

  // ---- Game Objects ----
  let orbs = [];
  let explosions = [];
  let particles = [];
  let bgStars = [];
  let shockwaves = [];
  let floatingTexts = [];

  // ---- Level Config ----
  function getLevelConfig(lvl) {
    const baseOrbs = 20 + Math.floor(lvl * 5);
    const orbCount = Math.min(baseOrbs, 100);
    // Always at least 3 clicks, more at higher levels
    const clicks = Math.min(6, 3 + Math.floor((lvl - 1) / 3));
    // Gentle target: ~40% of orbs at first, scaling slowly
    const target = Math.max(5, Math.floor(orbCount * (0.3 + lvl * 0.015)));
    const orbSpeed = 0.15 + lvl * 0.03;
    const orbMinSize = Math.max(16, 24 - lvl * 0.3);
    const orbMaxSize = Math.max(26, 38 - lvl * 0.3);
    // Huge explosion radius relative to screen - makes chain reactions happen!
    const screenMin = Math.min(W, H);
    const explosionRadius = Math.max(screenMin * 0.1, screenMin * 0.18 - lvl * 2);
    const palette = PALETTES[(lvl - 1) % PALETTES.length];
    // Number of clusters for orb placement
    const clusters = Math.min(6, 2 + Math.floor(lvl / 2));

    return { orbCount, clicks, target, orbSpeed, orbMinSize, orbMaxSize, explosionRadius, palette, clusters };
  }

  // ---- Background Stars ----
  function initBgStars() {
    bgStars = [];
    for (let i = 0; i < 200; i++) {
      bgStars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        size: Math.random() * 1.8 + 0.2,
        alpha: Math.random() * 0.6 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }
  }
  initBgStars();

  function drawBackground(time) {
    // Deep space gradient
    const grad = bgCtx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7);
    grad.addColorStop(0, '#0a0520');
    grad.addColorStop(0.5, '#050210');
    grad.addColorStop(1, '#000005');
    bgCtx.fillStyle = grad;
    bgCtx.fillRect(0, 0, W, H);

    // Nebula glow (subtle)
    if (state === STATE.PLAYING || state === STATE.CHAIN_RUNNING) {
      const config = getLevelConfig(level);
      const nebGrad = bgCtx.createRadialGradient(W * 0.3, H * 0.4, 0, W * 0.3, H * 0.4, W * 0.5);
      nebGrad.addColorStop(0, config.palette.glow + '12');
      nebGrad.addColorStop(1, 'transparent');
      bgCtx.fillStyle = nebGrad;
      bgCtx.fillRect(0, 0, W, H);
    }

    // Stars
    bgStars.forEach(s => {
      const a = s.alpha + Math.sin(time * s.twinkleSpeed + s.twinklePhase) * 0.25;
      bgCtx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, a)})`;
      bgCtx.beginPath();
      bgCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      bgCtx.fill();
    });
  }

  // ---- Orb Class ----
  class Orb {
    constructor(x, y, radius, color, speed) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.baseRadius = radius;
      this.color = color;
      this.vx = (Math.random() - 0.5) * speed;
      this.vy = (Math.random() - 0.5) * speed;
      this.alive = true;
      this.exploding = false;
      this.explodeTimer = 0;
      this.explodeDelay = 0;
      this.phase = Math.random() * Math.PI * 2;
      this.pulseSpeed = 0.02 + Math.random() * 0.02;
      this.glowIntensity = 0.4 + Math.random() * 0.3;
      this.trail = [];
    }

    update() {
      if (this.exploding) {
        this.explodeTimer++;
        if (this.explodeTimer >= this.explodeDelay) {
          this.alive = false;
          return true; // exploded
        }
        this.radius = this.baseRadius * (1 + (this.explodeTimer / this.explodeDelay) * 0.5);
        return false;
      }

      this.x += this.vx;
      this.y += this.vy;

      // Bounce off walls
      if (this.x - this.baseRadius < 0) { this.x = this.baseRadius; this.vx *= -1; }
      if (this.x + this.baseRadius > W) { this.x = W - this.baseRadius; this.vx *= -1; }
      if (this.y - this.baseRadius < 0) { this.y = this.baseRadius; this.vy *= -1; }
      if (this.y + this.baseRadius > H) { this.y = H - this.baseRadius; this.vy *= -1; }

      // Trail
      this.trail.push({ x: this.x, y: this.y, alpha: 0.3 });
      if (this.trail.length > 6) this.trail.shift();
      this.trail.forEach(t => t.alpha *= 0.85);

      this.phase += this.pulseSpeed;
      return false;
    }

    draw(ctx, time) {
      // Trail
      this.trail.forEach(t => {
        if (t.alpha < 0.02) return;
        ctx.globalAlpha = t.alpha * 0.3;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(t.x, t.y, this.baseRadius * 0.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      const pulse = 1 + Math.sin(this.phase) * 0.08;
      const r = this.radius * pulse;

      // Outer glow
      const glowGrad = ctx.createRadialGradient(this.x, this.y, r * 0.3, this.x, this.y, r * 2.5);
      glowGrad.addColorStop(0, this.color + '40');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Main orb
      const orbGrad = ctx.createRadialGradient(
        this.x - r * 0.3, this.y - r * 0.3, r * 0.1,
        this.x, this.y, r
      );
      orbGrad.addColorStop(0, '#fff');
      orbGrad.addColorStop(0.3, this.color);
      orbGrad.addColorStop(1, this.color + '80');
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
      ctx.fill();

      // Highlight
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath();
      ctx.arc(this.x - r * 0.25, this.y - r * 0.25, r * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Exploding warning pulse
      if (this.exploding) {
        const progress = this.explodeTimer / this.explodeDelay;
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + progress * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, r * (1 + progress * 0.5), 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    startExplode(delay) {
      this.exploding = true;
      this.explodeDelay = delay;
      this.explodeTimer = 0;
    }
  }

  // ---- Explosion Class ----
  class Explosion {
    constructor(x, y, radius, color) {
      this.x = x;
      this.y = y;
      this.maxRadius = radius;
      this.radius = 0;
      this.color = color;
      this.alpha = 1;
      this.alive = true;
      this.expandSpeed = radius / 15;
      this.hasTriggered = false;
    }

    update() {
      if (this.radius < this.maxRadius) {
        this.radius += this.expandSpeed;
      } else {
        if (!this.hasTriggered) this.hasTriggered = true;
        this.alpha -= 0.04;
        if (this.alpha <= 0) {
          this.alive = false;
        }
      }
    }

    draw(ctx) {
      if (!this.alive) return;

      // Outer ring
      ctx.globalAlpha = this.alpha * 0.6;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner fill
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
      grad.addColorStop(0, this.color + Math.floor(this.alpha * 60).toString(16).padStart(2, '0'));
      grad.addColorStop(0.5, this.color + Math.floor(this.alpha * 25).toString(16).padStart(2, '0'));
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 1;
    }

    containsOrb(orb) {
      const dx = this.x - orb.x;
      const dy = this.y - orb.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist < this.radius + orb.radius;
    }
  }

  // ---- Shockwave Class ----
  class Shockwave {
    constructor(x, y, maxRadius, color) {
      this.x = x;
      this.y = y;
      this.radius = 0;
      this.maxRadius = maxRadius;
      this.color = color;
      this.alpha = 0.8;
      this.alive = true;
    }

    update() {
      this.radius += (this.maxRadius - this.radius) * 0.08 + 2;
      this.alpha *= 0.95;
      if (this.alpha < 0.01) this.alive = false;
    }

    draw(ctx) {
      ctx.globalAlpha = this.alpha;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = Math.max(1, 4 * this.alpha);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  // ---- Particle Class ----
  class Particle {
    constructor(x, y, color, opts) {
      this.x = x;
      this.y = y;
      const angle = opts.angle !== undefined ? opts.angle : Math.random() * Math.PI * 2;
      const speed = opts.speed || (2 + Math.random() * 4);
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.color = color;
      this.size = opts.size || (1.5 + Math.random() * 3);
      this.life = opts.life || (30 + Math.random() * 40);
      this.maxLife = this.life;
      this.gravity = opts.gravity || 0;
      this.friction = opts.friction || 0.98;
      this.alive = true;
      this.type = opts.type || 'circle'; // circle, spark, star
    }

    update() {
      this.vx *= this.friction;
      this.vy *= this.friction;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.life--;
      if (this.life <= 0) this.alive = false;
    }

    draw(ctx) {
      const alpha = Math.max(0, this.life / this.maxLife);
      const size = this.size * (0.5 + alpha * 0.5);

      ctx.globalAlpha = alpha;

      if (this.type === 'spark') {
        // Line particle (motion trail)
        const len = Math.sqrt(this.vx * this.vx + this.vy * this.vy) * 3;
        const angle = Math.atan2(this.vy, this.vx);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = size * 0.5;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - Math.cos(angle) * len, this.y - Math.sin(angle) * len);
        ctx.stroke();
      } else if (this.type === 'star') {
        // Star-shaped particle
        ctx.fillStyle = this.color;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
          const r = i % 2 === 0 ? size : size * 0.4;
          if (i === 0) ctx.moveTo(this.x + Math.cos(a) * r, this.y + Math.sin(a) * r);
          else ctx.lineTo(this.x + Math.cos(a) * r, this.y + Math.sin(a) * r);
        }
        ctx.fill();
      } else {
        // Circle glow
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, size * 2);
        grad.addColorStop(0, this.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, size * 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }

  // ---- Floating Text ----
  class FloatingText {
    constructor(x, y, text, color, size) {
      this.x = x;
      this.y = y;
      this.text = text;
      this.color = color;
      this.size = size || 20;
      this.life = 60;
      this.maxLife = 60;
      this.alive = true;
      this.vy = -1.5;
    }

    update() {
      this.y += this.vy;
      this.vy *= 0.97;
      this.life--;
      if (this.life <= 0) this.alive = false;
    }

    draw(ctx) {
      const alpha = Math.max(0, this.life / this.maxLife);
      const scale = 1 + (1 - alpha) * 0.3;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = this.color;
      ctx.font = `900 ${this.size * scale}px 'Orbitron', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Glow
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 15;
      ctx.fillText(this.text, this.x, this.y);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
  }

  // ---- Spawn Explosion Particles ----
  function spawnExplosionParticles(x, y, color, count) {
    const colors = [color, '#fff', lightenColor(color, 40)];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const type = Math.random() < 0.4 ? 'spark' : (Math.random() < 0.3 ? 'star' : 'circle');
      particles.push(new Particle(x, y, colors[Math.floor(Math.random() * colors.length)], {
        angle,
        speed: 2 + Math.random() * 6,
        size: 1 + Math.random() * 3.5,
        life: 25 + Math.random() * 45,
        gravity: 0.02,
        friction: 0.97,
        type,
      }));
    }
  }

  // ---- Color Helpers ----
  function lightenColor(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + amount);
    const g = Math.min(255, ((num >> 8) & 0xFF) + amount);
    const b = Math.min(255, (num & 0xFF) + amount);
    return `rgb(${r},${g},${b})`;
  }

  function randomColor(palette) {
    return palette[Math.floor(Math.random() * palette.length)];
  }

  // ---- Screen Shake ----
  function screenShake(intensity) {
    const wrapper = document.getElementById('game-wrapper');
    wrapper.classList.remove('shake-light', 'shake-medium', 'shake-heavy');
    void wrapper.offsetWidth; // reflow
    if (intensity === 'light') wrapper.classList.add('shake-light');
    else if (intensity === 'medium') wrapper.classList.add('shake-medium');
    else wrapper.classList.add('shake-heavy');
    setTimeout(() => wrapper.classList.remove('shake-light', 'shake-medium', 'shake-heavy'), 500);
  }

  // ---- Flash Effect ----
  function flashScreen(color) {
    const div = document.createElement('div');
    div.className = 'flash-overlay';
    div.style.background = color || 'rgba(255,255,255,0.3)';
    document.getElementById('game-wrapper').appendChild(div);
    setTimeout(() => div.remove(), 500);
  }

  // ---- Show / Hide UI ----
  function show(id) { document.getElementById(id).classList.remove('hidden'); }
  function hide(id) { document.getElementById(id).classList.add('hidden'); }
  function setText(id, val) { document.getElementById(id).textContent = val; }

  // ---- Level Setup ----
  function setupLevel() {
    const config = getLevelConfig(level);
    orbs = [];
    explosions = [];
    particles = [];
    shockwaves = [];
    floatingTexts = [];
    currentChain = 0;
    clicksLeft = config.clicks;
    levelScore = 0;
    totalOrbsExploded = 0;

    // Create orbs in clusters so chain reactions actually happen
    const clusterCount = config.clusters;
    const clusterCenters = [];
    const padding = 80;
    for (let c = 0; c < clusterCount; c++) {
      clusterCenters.push({
        x: padding + Math.random() * (W - padding * 2),
        y: padding + Math.random() * (H - padding * 2),
      });
    }

    for (let i = 0; i < config.orbCount; i++) {
      const r = config.orbMinSize + Math.random() * (config.orbMaxSize - config.orbMinSize);
      // Pick a random cluster center and scatter around it
      const cluster = clusterCenters[Math.floor(Math.random() * clusterCount)];
      const spread = config.explosionRadius * 1.8; // spread within reachable range
      let x = cluster.x + (Math.random() - 0.5) * spread * 2;
      let y = cluster.y + (Math.random() - 0.5) * spread * 2;
      // Clamp to screen
      x = Math.max(r + 10, Math.min(W - r - 10, x));
      y = Math.max(r + 10, Math.min(H - r - 10, y));
      const color = randomColor(config.palette.orb);
      orbs.push(new Orb(x, y, r, color, config.orbSpeed));
    }

    // Update HUD
    setText('level-num', level);
    setText('score-value', score);
    setText('clicks-value', clicksLeft);
    setText('orbs-count', orbs.length);
    setText('target-value', config.target);
    hide('chain-display');
  }

  // ---- Start Level Intro ----
  function startLevelIntro() {
    state = STATE.LEVEL_INTRO;
    setupLevel();

    const config = getLevelConfig(level);
    setText('level-intro-num', level);
    setText('level-intro-name', config.palette.name);
    show('level-intro');
    show('hud');

    setTimeout(() => {
      hide('level-intro');
      state = STATE.PLAYING;
    }, 2000);
  }

  // ---- Handle Click / Tap ----
  function handleGameClick(mx, my) {
    if ((state === STATE.PLAYING || state === STATE.CHAIN_RUNNING) && clicksLeft > 0) {
      clicksLeft--;
      setText('clicks-value', clicksLeft);
      triggerExplosion(mx, my);
      playClick();
      // Stay in PLAYING while clicks remain so player can keep clicking
      if (clicksLeft > 0) {
        state = STATE.PLAYING;
      } else {
        state = STATE.CHAIN_RUNNING;
      }
    }
  }

  // ---- Trigger Explosion ----
  function triggerExplosion(x, y) {
    const config = getLevelConfig(level);
    // Player-triggered explosion is 30% bigger than base to kick off chains
    const playerRadius = config.explosionRadius * 1.3;
    const explosion = new Explosion(x, y, playerRadius, config.palette.glow);
    explosions.push(explosion);
    shockwaves.push(new Shockwave(x, y, playerRadius * 2.5, '#fff'));
    spawnExplosionParticles(x, y, config.palette.glow, 30);
    screenShake('medium');
    flashScreen(config.palette.glow + '25');
  }

  // ---- Explode Orb ----
  function explodeOrb(orb) {
    const config = getLevelConfig(level);
    orb.alive = false;
    totalOrbsExploded++;
    currentChain++;

    if (currentChain > maxChain) maxChain = currentChain;

    // Chain explosions are SAME size or bigger - this is what makes chains feel amazing
    const chainRadiusMultiplier = 1.0 + Math.min(currentChain * 0.02, 0.4); // grows with chain!
    const explosion = new Explosion(orb.x, orb.y, config.explosionRadius * chainRadiusMultiplier, orb.color);
    explosions.push(explosion);
    shockwaves.push(new Shockwave(orb.x, orb.y, config.explosionRadius * 2.5, orb.color));

    // Particles
    const particleCount = 15 + Math.min(currentChain * 3, 30);
    spawnExplosionParticles(orb.x, orb.y, orb.color, particleCount);

    // Score
    const chainBonus = currentChain * currentChain * 10;
    score += chainBonus;
    levelScore += chainBonus;
    setText('score-value', score);

    // Floating score text
    floatingTexts.push(new FloatingText(orb.x, orb.y - 20, `+${chainBonus}`, orb.color, 14 + Math.min(currentChain, 10)));

    // Chain display
    setText('chain-count', currentChain);
    show('chain-display');

    // Update remaining count
    const alive = orbs.filter(o => o.alive && !o.exploding).length;
    setText('orbs-count', alive);

    // Sound
    playExplosion(Math.min(currentChain, 10) / 10);
    if (currentChain > 2) playChain(Math.min(currentChain, 15));

    // Screen effects based on chain
    if (currentChain >= 20) {
      screenShake('heavy');
      flashScreen(orb.color + '30');
    } else if (currentChain >= 10) {
      screenShake('medium');
      flashScreen(orb.color + '18');
    } else if (currentChain >= 5) {
      screenShake('light');
    }

    // Combo popup
    showComboPopup(currentChain, orb.x, orb.y);
  }

  // ---- Combo Popup ----
  const COMBO_LABELS = [
    { min: 3, text: 'NICE!', color: '#60a5fa' },
    { min: 5, text: 'GREAT!', color: '#34d399' },
    { min: 8, text: 'EXCELLENT!', color: '#fbbf24' },
    { min: 12, text: 'AMAZING!', color: '#f472b6' },
    { min: 16, text: 'INCREDIBLE!', color: '#f87171' },
    { min: 20, text: 'LEGENDARY!', color: '#a78bfa' },
    { min: 30, text: 'COSMIC!!', color: '#fff' },
  ];

  function showComboPopup(chain, x, y) {
    let label = null;
    for (let i = COMBO_LABELS.length - 1; i >= 0; i--) {
      if (chain >= COMBO_LABELS[i].min) {
        label = COMBO_LABELS[i];
        break;
      }
    }
    if (!label) return;

    const popup = document.getElementById('combo-popup');
    const text = document.getElementById('combo-text');
    text.textContent = label.text;
    text.style.color = label.color;

    popup.style.left = Math.max(20, Math.min(W - 200, x - 100)) + 'px';
    popup.style.top = Math.max(60, Math.min(H - 100, y - 50)) + 'px';

    popup.classList.remove('hidden');
    popup.style.animation = 'none';
    void popup.offsetWidth;
    popup.style.animation = '';

    clearTimeout(popup._hideTimer);
    popup._hideTimer = setTimeout(() => popup.classList.add('hidden'), 1200);
  }

  // ---- Check Level Complete / Game Over ----
  let endCheckScheduled = false;

  function checkLevelEnd() {
    // Any active explosions or exploding orbs still going?
    const activeExplosions = explosions.filter(e => e.alive && e.radius < e.maxRadius);
    const explodingOrbs = orbs.filter(o => o.exploding);
    if (activeExplosions.length > 0 || explodingOrbs.length > 0) return;

    if (endCheckScheduled) return;

    const config = getLevelConfig(level);

    if (totalOrbsExploded >= config.target) {
      endCheckScheduled = true;
      setTimeout(() => { showLevelClear(); endCheckScheduled = false; }, 600);
    } else if (clicksLeft <= 0) {
      endCheckScheduled = true;
      setTimeout(() => { showGameOver(); endCheckScheduled = false; }, 600);
    }
  }

  // ---- Level Clear Screen ----
  function showLevelClear() {
    state = STATE.LEVEL_CLEAR;
    playLevelClear();

    const config = getLevelConfig(level);
    const bonus = Math.max(0, (totalOrbsExploded - config.target)) * 50;
    score += bonus;

    setText('clear-chain', currentChain);
    setText('clear-score', levelScore);
    setText('clear-bonus', bonus > 0 ? `+${bonus}` : '+0');

    // Rank
    const ratio = totalOrbsExploded / config.orbCount;
    let rank;
    if (ratio >= 0.95) rank = '✦✦✦';
    else if (ratio >= 0.75) rank = '✦✦';
    else if (ratio >= 0.5) rank = '✦';
    else rank = '-';
    document.getElementById('clear-rank').textContent = rank;

    show('level-clear');
    hide('chain-display');
  }

  // ---- Game Over Screen ----
  function showGameOver() {
    state = STATE.GAME_OVER;
    playGameOver();

    setText('final-score', score);
    setText('final-level', level);
    setText('final-chain', maxChain);

    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem('cosmicChainBest', bestScore.toString());
      show('new-record');
    } else {
      hide('new-record');
    }

    show('game-over');
    hide('chain-display');
  }

  // ---- Main Game Loop ----
  let lastTime = 0;

  function gameLoop(time) {
    requestAnimationFrame(gameLoop);

    const dt = Math.min(32, time - lastTime);
    lastTime = time;

    // Background
    drawBackground(time);

    // Clear game canvas
    ctx.clearRect(0, 0, W, H);

    if (state === STATE.TITLE) return;

    // Update & draw orbs
    orbs.forEach(orb => {
      if (!orb.alive) return;
      const exploded = orb.update();
      if (exploded) {
        explodeOrb(orb);
      }
    });

    orbs.forEach(orb => {
      if (!orb.alive) return;
      orb.draw(ctx, time);
    });

    // Update & check explosions against orbs
    explosions.forEach(exp => {
      if (!exp.alive) return;
      exp.update();

      // Check for orb collisions
      orbs.forEach(orb => {
        if (!orb.alive || orb.exploding) return;
        if (exp.containsOrb(orb)) {
          orb.startExplode(8 + Math.random() * 8);
        }
      });
    });

    // Draw explosions
    explosions.forEach(exp => {
      if (exp.alive) exp.draw(ctx);
    });

    // Update & draw shockwaves
    shockwaves.forEach(sw => {
      if (sw.alive) { sw.update(); sw.draw(ctx); }
    });

    // Update & draw particles
    particles.forEach(p => {
      if (p.alive) { p.update(); p.draw(ctx); }
    });

    // Update & draw floating texts
    floatingTexts.forEach(ft => {
      if (ft.alive) { ft.update(); ft.draw(ctx); }
    });

    // Cleanup dead objects
    orbs = orbs.filter(o => o.alive || o.exploding);
    explosions = explosions.filter(e => e.alive);
    shockwaves = shockwaves.filter(s => s.alive);
    particles = particles.filter(p => p.alive);
    floatingTexts = floatingTexts.filter(f => f.alive);

    // Check level end - also during PLAYING in case target already met
    if (state === STATE.CHAIN_RUNNING || state === STATE.PLAYING) {
      // During PLAYING, only check for early level clear (target met)
      if (state === STATE.PLAYING) {
        const config = getLevelConfig(level);
        if (totalOrbsExploded >= config.target) {
          const activeExplosions = explosions.filter(e => e.alive && e.radius < e.maxRadius);
          const explodingOrbs = orbs.filter(o => o.exploding);
          if (activeExplosions.length === 0 && explodingOrbs.length === 0) {
            checkLevelEnd();
          }
        }
      } else {
        checkLevelEnd();
      }
    }
  }

  // ---- Input Handling ----
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    handleGameClick(mx, my);
  });

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const mx = touch.clientX - rect.left;
    const my = touch.clientY - rect.top;
    handleGameClick(mx, my);
  }, { passive: false });

  // ---- UI Buttons ----
  document.getElementById('start-btn').addEventListener('click', () => {
    ensureAudio();
    playClick();
    hide('title-screen');
    score = 0;
    level = 1;
    maxChain = 0;
    startLevelIntro();
  });

  document.getElementById('next-level-btn').addEventListener('click', () => {
    playClick();
    hide('level-clear');
    level++;
    startLevelIntro();
  });

  document.getElementById('retry-btn').addEventListener('click', () => {
    playClick();
    hide('game-over');
    score = 0;
    level = 1;
    maxChain = 0;
    startLevelIntro();
  });

  document.getElementById('home-btn').addEventListener('click', () => {
    playClick();
    hide('game-over');
    hide('hud');
    state = STATE.TITLE;
    orbs = [];
    explosions = [];
    particles = [];
    shockwaves = [];
    floatingTexts = [];
    show('title-screen');
  });

  // ---- Init ----
  if (bestScore > 0) {
    show('best-score-display');
    setText('best-score-value', bestScore);
  }

  requestAnimationFrame(gameLoop);

})();
