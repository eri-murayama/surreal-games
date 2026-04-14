/* 不器用なおじさん / Awkward Uncle - 3D */

// ===== Error display helper =====
function showFatalError(msg) {
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;top:10px;left:10px;right:10px;z-index:9999;' +
    'background:#7f1d1d;color:#fff;padding:12px;border-radius:8px;font-size:12px;' +
    'font-family:monospace;white-space:pre-wrap;max-height:60vh;overflow:auto;';
  box.textContent = msg;
  document.body.appendChild(box);
  console.error(msg);
}

if (typeof THREE === 'undefined') {
  showFatalError('Three.js が読み込めませんでした。\nネット接続か CDN を確認してください。');
  throw new Error('THREE is undefined');
}

// Global error handler to show JS errors on screen
window.addEventListener('error', function (ev) {
  showFatalError('JS Error:\n' + (ev.error ? ev.error.stack || ev.error.message : ev.message));
});

// ===== i18n =====
SurrealI18n.init({
  ja: {
    title: '不器用な<br>おじさん',
    subtitle: '右手に大砲、左手にフック',
    startBtn: '⚔ バトル開始 ⚔',
    howTitle: 'あそびかた',
    how1: '押したいボタンをクリック／タップ',
    how2: 'ただし道具を間違えると押せない！',
    tapNext: 'タップして次へ',
    realityCheck: '…え？',
    stageLabel: 'ステージ',
    taskLabel: '課題',
    toolHook: 'フック',
    toolCannon: '大砲',
    allClearTitle: '全ステージ<br>クリア！',
    allClearMsg: '家事を制した<br>最強の戦士…',
    retry: 'もう一度',
    backToTitle: 'タイトルへ',
    backToTop: '← トップに戻る',
    intro1: '…どいつが相手だ！？',
    intro2: '俺の大砲とフックで粉砕してやる！',
    intro3: '……お前か。',
    hitRight: '成功！',
    hitWrong: '間違い！',
    wrongTool: '押せない！',
    stageClear: 'クリア！',
    s1_name: '洗濯機',
    s1_task: 'スタート(緑)を押せ',
    s2_name: '電子レンジ',
    s2_task: '真ん中のGOを押せ',
    s3_name: '炊飯器',
    s3_task: '炊飯ボタンを押せ',
    s4_name: 'トースター',
    s4_task: 'レバーを押し下げろ(硬い)',
    s5_name: '電気ケトル',
    s5_task: '電源スイッチを入れろ(硬い)',
  },
  en: {
    title: 'Awkward<br>Uncle',
    subtitle: 'Cannon on right, hook on left',
    startBtn: '⚔ Start Battle ⚔',
    howTitle: 'How to Play',
    how1: 'Click / tap the button you want to press',
    how2: 'Use the right tool, or it won\'t press!',
    tapNext: 'Tap to continue',
    realityCheck: '...huh?',
    stageLabel: 'Stage',
    taskLabel: 'Task',
    toolHook: 'Hook',
    toolCannon: 'Cannon',
    allClearTitle: 'ALL STAGES<br>CLEARED!',
    allClearMsg: 'The mightiest warrior<br>who tamed housework...',
    retry: 'Retry',
    backToTitle: 'Back to Title',
    backToTop: '← Back to Top',
    intro1: '...WHO\'S MY OPPONENT!?',
    intro2: 'My cannon and hook will CRUSH them!',
    intro3: '......it\'s you.',
    hitRight: 'GOT IT!',
    hitWrong: 'WRONG ONE!',
    wrongTool: 'WRONG TOOL!',
    stageClear: 'CLEAR!',
    s1_name: 'Washing Machine',
    s1_task: 'Press Start (green)',
    s2_name: 'Microwave',
    s2_task: 'Press the center GO',
    s3_name: 'Rice Cooker',
    s3_task: 'Press the Cook button',
    s4_name: 'Toaster',
    s4_task: 'Push down the lever (stiff)',
    s5_name: 'Electric Kettle',
    s5_task: 'Flip the power switch (stiff)',
  },
});

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = SurrealI18n.t(key);
    if (val) el.innerHTML = val;
  });
  document.getElementById('lang-ja').classList.toggle('active', SurrealI18n.currentLang === 'ja');
  document.getElementById('lang-en').classList.toggle('active', SurrealI18n.currentLang === 'en');
  updateTaskLabel();
}
document.getElementById('lang-ja').addEventListener('click', () => { SurrealI18n.setLang('ja'); applyI18n(); });
document.getElementById('lang-en').addEventListener('click', () => { SurrealI18n.setLang('en'); applyI18n(); });

// ===== Scene management =====
const screens = {
  title:  document.getElementById('title-screen'),
  intro:  document.getElementById('intro-screen'),
  reveal: document.getElementById('reveal-screen'),
  game:   document.getElementById('game-screen'),
  clear:  document.getElementById('clear-screen'),
};
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

document.getElementById('start-btn').addEventListener('click', () => {
  showScreen('intro');
  introIdx = 0; showIntroLine();
});

const introLines = ['intro1','intro2','intro3'];
let introIdx = 0;
function showIntroLine() {
  document.getElementById('intro-text').innerHTML = SurrealI18n.t(introLines[introIdx]);
}
document.getElementById('intro-screen').addEventListener('click', () => {
  introIdx++;
  if (introIdx >= introLines.length) {
    document.getElementById('opponent-machine').textContent = '🧺';
    document.getElementById('opponent-name').textContent = SurrealI18n.t('s1_name');
    showScreen('reveal');
    setTimeout(() => { showScreen('game'); loadStage(0); }, 2500);
  } else {
    showIntroLine();
  }
});

// ===== Three.js setup =====
const canvas = document.getElementById('game-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a0a2e);
scene.fog = new THREE.Fog(0x1a0a2e, 10, 22);

const CANVAS_W = 340, CANVAS_H = 480;
const camera = new THREE.PerspectiveCamera(62, CANVAS_W / CANVAS_H, 0.1, 100);

// Camera dynamics
const camBasePos = new THREE.Vector3(0.5, 3.2, 7.5);
const camLookAt  = new THREE.Vector3(2.4, 1.3, 0);
let cameraZoom = 0;         // 0..1 lerped
let cameraZoomTarget = 0;   // 0 = idle, 1 = aiming (closer)
let cameraShake = 0;        // decays each frame

camera.position.copy(camBasePos);
camera.lookAt(camLookAt);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(CANVAS_W, CANVAS_H, false);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.45));
const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
keyLight.position.set(4, 8, 5);
scene.add(keyLight);
const rimLight = new THREE.DirectionalLight(0xff8c00, 0.35);
rimLight.position.set(-4, 3, -3);
scene.add(rimLight);

// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 40),
  new THREE.MeshStandardMaterial({ color: 0x2a1340, roughness: 0.9 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Back wall (decoration)
const backWall = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 15),
  new THREE.MeshStandardMaterial({ color: 0x1a0a2e, roughness: 1.0 })
);
backWall.position.set(0, 5, -6);
scene.add(backWall);

// ===== Uncle =====
const uncle = new THREE.Group();
uncle.position.set(0, 0, 0);
scene.add(uncle);

// Body
uncle.add(mesh(new THREE.BoxGeometry(0.85, 1.4, 0.5),
              { color: 0x4a2f1a, roughness: 0.8 },
              { y: 0.85 }));
// Head
uncle.add(mesh(new THREE.SphereGeometry(0.3, 24, 16),
              { color: 0xffb347, roughness: 0.6 },
              { y: 1.85 }));
// Eyes
uncle.add(mesh(new THREE.SphereGeometry(0.035, 8, 8),
              { color: 0x000000 },
              { x: -0.09, y: 1.88, z: 0.28 }));
uncle.add(mesh(new THREE.SphereGeometry(0.035, 8, 8),
              { color: 0x000000 },
              { x: 0.09,  y: 1.88, z: 0.28 }));
// Mustache
uncle.add(mesh(new THREE.BoxGeometry(0.26, 0.05, 0.02),
              { color: 0x1a0f08 },
              { y: 1.78, z: 0.29 }));
// Feet
uncle.add(mesh(new THREE.BoxGeometry(0.32, 0.1, 0.42),
              { color: 0x222222 },
              { x: -0.22, y: 0.05, z: 0.08 }));
uncle.add(mesh(new THREE.BoxGeometry(0.32, 0.1, 0.42),
              { color: 0x222222 },
              { x: 0.22,  y: 0.05, z: 0.08 }));

// Shoulders: offsets from uncle.position (updated each frame in updateBodyRig)
const leftShoulderOffset  = new THREE.Vector3(-0.45, 1.35, 0.15);
const rightShoulderOffset = new THREE.Vector3( 0.45, 1.35, 0.15);
const leftShoulder  = new THREE.Vector3();
const rightShoulder = new THREE.Vector3();

// Arm rest offsets from uncle.position
const hookRestOffset   = new THREE.Vector3(-0.95, 1.3, 0.45);
const cannonRestOffset = new THREE.Vector3( 0.95, 1.3, 0.45);

// Hook arm meshes
const hookArmMesh = mesh(new THREE.CylinderGeometry(0.07, 0.07, 1, 14),
                          { color: 0xffb347, roughness: 0.6 });
scene.add(hookArmMesh);
const hookTipMesh = new THREE.Group();
const hookHook = mesh(new THREE.TorusGeometry(0.11, 0.03, 10, 18, Math.PI * 1.4),
                       { color: 0xd4d4d8, metalness: 0.6, roughness: 0.3 });
hookHook.rotation.x = Math.PI / 2;
hookTipMesh.add(hookHook);
scene.add(hookTipMesh);

// Cannon arm meshes
const cannonArmMesh = mesh(new THREE.CylinderGeometry(0.13, 0.13, 1, 18),
                            { color: 0x4b5563, metalness: 0.6, roughness: 0.4 });
scene.add(cannonArmMesh);
const cannonBallMesh = mesh(new THREE.SphereGeometry(0.18, 20, 16),
                             { color: 0x1f2937, metalness: 0.8, roughness: 0.25 });
scene.add(cannonBallMesh);

// Cannon fuse (small yellow dot)
const cannonFuse = mesh(new THREE.SphereGeometry(0.04, 8, 8),
                         { color: 0xfacc15, emissive: 0xfacc15, emissiveIntensity: 0.6 });
scene.add(cannonFuse);

function mesh(geometry, matOpts, pos) {
  const m = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial(matOpts));
  if (pos) {
    if (pos.x !== undefined) m.position.x = pos.x;
    if (pos.y !== undefined) m.position.y = pos.y;
    if (pos.z !== undefined) m.position.z = pos.z;
  }
  return m;
}

// ===== Arm state =====
const armState = {
  hook: {
    rest:    new THREE.Vector3(),
    current: new THREE.Vector3(),
    target:  new THREE.Vector3(),
  },
  cannon: {
    rest:    new THREE.Vector3(),
    current: new THREE.Vector3(),
    target:  new THREE.Vector3(),
  },
};

// Initialize arm positions from uncle's starting position
leftShoulder.copy(uncle.position).add(leftShoulderOffset);
rightShoulder.copy(uncle.position).add(rightShoulderOffset);
armState.hook.rest.copy(uncle.position).add(hookRestOffset);
armState.cannon.rest.copy(uncle.position).add(cannonRestOffset);
armState.hook.current.copy(armState.hook.rest);
armState.hook.target.copy(armState.hook.rest);
armState.cannon.current.copy(armState.cannon.rest);
armState.cannon.target.copy(armState.cannon.rest);

// ===== Body rig update (shoulders + arm rest positions follow uncle) =====
function updateBodyRig() {
  leftShoulder.copy(uncle.position).add(leftShoulderOffset);
  rightShoulder.copy(uncle.position).add(rightShoulderOffset);
  armState.hook.rest.copy(uncle.position).add(hookRestOffset);
  armState.cannon.rest.copy(uncle.position).add(cannonRestOffset);
  // If idle (not aiming, not locked on button), arm target follows rest
  if (!aiming && !ignoreInput) {
    armState.hook.target.copy(armState.hook.rest);
    armState.cannon.target.copy(armState.cannon.rest);
  }
}

const _tmp = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _upY = new THREE.Vector3(0, 1, 0);
function orientCylinder(armMesh, shoulder, tip) {
  _dir.subVectors(tip, shoulder);
  const len = _dir.length();
  _tmp.copy(shoulder).lerp(tip, 0.5);
  armMesh.position.copy(_tmp);
  armMesh.scale.y = Math.max(len, 0.01);
  const q = new THREE.Quaternion().setFromUnitVectors(_upY, _dir.clone().normalize());
  armMesh.quaternion.copy(q);
}

function updateArms() {
  armState.hook.current.lerp(armState.hook.target, 0.18);
  armState.cannon.current.lerp(armState.cannon.target, 0.18);
  // Hook
  orientCylinder(hookArmMesh, leftShoulder, armState.hook.current);
  hookTipMesh.position.copy(armState.hook.current);
  // Cannon
  orientCylinder(cannonArmMesh, rightShoulder, armState.cannon.current);
  cannonBallMesh.position.copy(armState.cannon.current);
  cannonFuse.position.copy(armState.cannon.current);
  cannonFuse.position.y += 0.18;
}

// ===== Tools =====
let currentTool = 'hook';
const hookBtn = document.getElementById('tool-hook');
const cannonBtn = document.getElementById('tool-cannon');
hookBtn.addEventListener('click', () => setTool('hook'));
cannonBtn.addEventListener('click', () => setTool('cannon'));
function setTool(t) {
  currentTool = t;
  hookBtn.classList.toggle('active', t === 'hook');
  cannonBtn.classList.toggle('active', t === 'cannon');
}

// ===== Stages =====
const machineGroup = new THREE.Group();
scene.add(machineGroup);

const STAGES = [
  { nameKey: 's1_name', taskKey: 's1_task', build: buildWashingMachine, suggestedTool: 'hook' },
  { nameKey: 's2_name', taskKey: 's2_task', build: buildMicrowave,      suggestedTool: 'hook' },
  { nameKey: 's3_name', taskKey: 's3_task', build: buildRiceCooker,     suggestedTool: 'hook' },
  { nameKey: 's4_name', taskKey: 's4_task', build: buildToaster,        suggestedTool: 'cannon' },
  { nameKey: 's5_name', taskKey: 's5_task', build: buildKettle,         suggestedTool: 'cannon' },
];

let stageIdx = 0;
let currentStage = null;
let ignoreInput = false;

function clearMachine() {
  while (machineGroup.children.length > 0) {
    const c = machineGroup.children[0];
    machineGroup.remove(c);
    c.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    });
  }
}

function loadStage(i) {
  stageIdx = i;
  currentStage = STAGES[i];
  clearMachine();
  currentStage.build(machineGroup);
  document.getElementById('stage-num').textContent = (i+1) + '/' + STAGES.length;
  updateTaskLabel();
  ignoreInput = false;
  if (currentStage.suggestedTool) setTool(currentStage.suggestedTool);
}

function updateTaskLabel() {
  if (!currentStage) return;
  const el = document.getElementById('task');
  if (el) el.textContent = SurrealI18n.t(currentStage.taskKey);
}

// ----- Machine builders -----
function addButton(group, x, y, z, color, r, zoneData) {
  const btn = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r, 0.08, 16),
    new THREE.MeshStandardMaterial({ color, roughness: 0.5 })
  );
  btn.rotation.x = Math.PI / 2;
  btn.position.set(x, y, z);
  btn.userData.zone = zoneData;
  group.add(btn);
  return btn;
}

function buildWashingMachine(g) {
  const base = new THREE.Group();
  base.position.set(2.7, 0, 0);
  // Body
  base.add(mesh(new THREE.BoxGeometry(1.8, 2.2, 1),
                { color: 0xe5e7eb, roughness: 0.6 },
                { y: 1.1 }));
  // Control panel (darker strip near top front)
  base.add(mesh(new THREE.BoxGeometry(1.65, 0.35, 0.05),
                { color: 0x64748b, roughness: 0.5 },
                { y: 1.95, z: 0.525 }));
  // Door
  const door = mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.08, 28),
                    { color: 0x111827, metalness: 0.6, roughness: 0.2 },
                    { y: 0.95, z: 0.525 });
  door.rotation.x = Math.PI / 2;
  base.add(door);
  // Door ring
  const ring = mesh(new THREE.TorusGeometry(0.55, 0.06, 10, 32),
                    { color: 0x6b7280, metalness: 0.5 },
                    { y: 0.95, z: 0.56 });
  base.add(ring);
  // Buttons (on control panel)
  addButton(base, -0.5, 1.95, 0.555, 0xf87171, 0.1,
            { id: 'r', correct: false });
  addButton(base,  0.0, 1.95, 0.555, 0x4ade80, 0.1,
            { id: 'g', correct: true, tools: ['hook'] });
  addButton(base,  0.5, 1.95, 0.555, 0xfacc15, 0.1,
            { id: 'y', correct: false });
  g.add(base);
}

function buildMicrowave(g) {
  const base = new THREE.Group();
  base.position.set(2.7, 0, 0);
  // Body
  base.add(mesh(new THREE.BoxGeometry(2.2, 1.5, 1.1),
                { color: 0xe5e7eb, roughness: 0.6 },
                { y: 0.85 }));
  // Dark window (left)
  base.add(mesh(new THREE.BoxGeometry(1.2, 1.2, 0.02),
                { color: 0x0f172a, roughness: 0.3, metalness: 0.4 },
                { x: -0.4, y: 0.85, z: 0.56 }));
  // Window frame
  base.add(mesh(new THREE.BoxGeometry(1.24, 1.24, 0.03),
                { color: 0x64748b },
                { x: -0.4, y: 0.85, z: 0.555 }));
  // Control panel
  base.add(mesh(new THREE.BoxGeometry(0.75, 1.2, 0.03),
                { color: 0x475569 },
                { x: 0.65, y: 0.85, z: 0.555 }));
  // 3x3 number pad + center GO (target)
  const startX = 0.45;
  const startY = 1.3;
  const spacingX = 0.22;
  const spacingY = 0.22;
  let idx = 0;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const isCenter = (r === 1 && c === 1);
      const color = isCenter ? 0x4ade80 : 0xcbd5e1;
      const x = startX + c * spacingX;
      const y = startY - r * spacingY;
      addButton(base, x, y, 0.58, color, 0.085,
                isCenter
                  ? { id: 'go', correct: true, tools: ['hook'] }
                  : { id: 'n'+idx, correct: false });
      idx++;
    }
  }
  g.add(base);
}

function buildRiceCooker(g) {
  const base = new THREE.Group();
  base.position.set(2.7, 0, 0);
  // Body (cylinder)
  base.add(mesh(new THREE.CylinderGeometry(0.85, 0.95, 1.4, 24),
                { color: 0xf3f4f6, roughness: 0.5 },
                { y: 0.7 }));
  // Top lid (shorter cylinder)
  base.add(mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.25, 24),
                { color: 0xd1d5db, roughness: 0.6 },
                { y: 1.55 }));
  // Handle
  const handle = mesh(new THREE.TorusGeometry(0.25, 0.04, 10, 20),
                      { color: 0x6b7280, metalness: 0.5 },
                      { y: 1.75 });
  handle.rotation.x = Math.PI / 2;
  base.add(handle);
  // Steam
  base.add(mesh(new THREE.SphereGeometry(0.1, 12, 10),
                { color: 0xffffff, transparent: true, opacity: 0.6 },
                { y: 2, z: 0 }));
  // Target + decoy buttons on front slope
  const z = 0.88;
  const y = 0.95;
  // 4 decoy nubs around target
  addButton(base, -0.3,  y + 0.25, z, 0x94a3b8, 0.07, { id: 'n1', correct: false });
  addButton(base,  0.3,  y + 0.25, z, 0x94a3b8, 0.07, { id: 'n2', correct: false });
  addButton(base, -0.3,  y - 0.15, z, 0x94a3b8, 0.07, { id: 'n3', correct: false });
  addButton(base,  0.3,  y - 0.15, z, 0x94a3b8, 0.07, { id: 'n4', correct: false });
  // Target (green)
  addButton(base,  0.0,  y + 0.05, z, 0x4ade80, 0.1,
            { id: 't', correct: true, tools: ['hook'] });
  g.add(base);
}

function buildToaster(g) {
  const base = new THREE.Group();
  base.position.set(2.7, 0, 0);
  // Body
  base.add(mesh(new THREE.BoxGeometry(1.8, 1.2, 1),
                { color: 0xd1d5db, roughness: 0.5, metalness: 0.3 },
                { y: 0.7 }));
  // Slot on top
  base.add(mesh(new THREE.BoxGeometry(1.3, 0.08, 0.3),
                { color: 0x0f172a },
                { y: 1.31, z: 0 }));
  // Bread peek
  base.add(mesh(new THREE.BoxGeometry(1.1, 0.15, 0.22),
                { color: 0xfbbf24 },
                { y: 1.28, z: 0 }));
  // Front knob (decoy)
  const knob = mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.1, 18),
                    { color: 0x9ca3af, metalness: 0.5 },
                    { x: -0.6, y: 0.55, z: 0.51 });
  knob.rotation.x = Math.PI / 2;
  knob.userData.zone = { id: 'knob', correct: false };
  base.add(knob);
  // Side lever (target, stiff = cannon)
  const lever = mesh(new THREE.BoxGeometry(0.12, 0.5, 0.25),
                     { color: 0xfacc15, roughness: 0.4 },
                     { x: 0.92, y: 0.75, z: 0 });
  lever.userData.zone = { id: 'lever', correct: true, tools: ['cannon'] };
  base.add(lever);
  // Lever cap
  base.add(mesh(new THREE.SphereGeometry(0.1, 16, 12),
                { color: 0xef4444, metalness: 0.3 },
                { x: 0.92, y: 1.0, z: 0 }));
  // The cap is also part of the lever - add zone
  g.add(base);
}

function buildKettle(g) {
  const base = new THREE.Group();
  base.position.set(2.7, 0, 0);
  // Body (tapered cylinder)
  base.add(mesh(new THREE.CylinderGeometry(0.6, 0.8, 1.4, 24),
                { color: 0xe5e7eb, roughness: 0.4, metalness: 0.5 },
                { y: 0.7 }));
  // Lid
  const lid = mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.1, 24),
                   { color: 0xd1d5db },
                   { y: 1.45 });
  lid.userData.zone = { id: 'lid', correct: false };
  base.add(lid);
  // Lid knob
  base.add(mesh(new THREE.SphereGeometry(0.08, 16, 12),
                { color: 0x6b7280 },
                { y: 1.55 }));
  // Spout (cone)
  const spout = mesh(new THREE.ConeGeometry(0.15, 0.5, 16),
                     { color: 0xe5e7eb, metalness: 0.5 },
                     { x: -0.75, y: 1.1, z: 0 });
  spout.rotation.z = Math.PI / 3.5;
  spout.userData.zone = { id: 'spout', correct: false };
  base.add(spout);
  // Handle (torus arc)
  const handle = mesh(new THREE.TorusGeometry(0.3, 0.05, 10, 24, Math.PI),
                      { color: 0x4b5563 });
  handle.position.set(0.85, 0.9, 0);
  handle.rotation.z = -Math.PI / 2;
  base.add(handle);
  // Switch base (pedestal under kettle)
  base.add(mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.15, 24),
                { color: 0x9ca3af, metalness: 0.4 },
                { y: -0.05 }));
  // Power switch (small cube on pedestal front) - target (cannon)
  const sw = mesh(new THREE.BoxGeometry(0.2, 0.12, 0.12),
                   { color: 0x4ade80, emissive: 0x1a4a1a, emissiveIntensity: 0.5 },
                   { x: 0.0, y: 0.0, z: 0.82 });
  sw.userData.zone = { id: 'sw', correct: true, tools: ['cannon'] };
  base.add(sw);
  g.add(base);
}

// ===== Walking & Camera orbit state =====
const keys = {};
const moveFlags = { up: false, down: false, left: false, right: false };
const camFlags  = { ccw: false, cw: false };
let cameraAngle = 0; // orbit angle around uncle (radians)

window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  keys[k] = true;
  if (['w','a','s','d','q','e','arrowup','arrowdown','arrowleft','arrowright',' '].includes(k)) {
    e.preventDefault();
  }
});
window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

// Bind walk + cam on-screen buttons (press-and-hold style)
function bindHoldButton(btn, onDown, onUp) {
  const s = (e) => { e.preventDefault(); btn.classList.add('held'); onDown(); };
  const u = (e) => { e.preventDefault(); btn.classList.remove('held'); onUp(); };
  btn.addEventListener('mousedown',  s);
  btn.addEventListener('mouseup',    u);
  btn.addEventListener('mouseleave', u);
  btn.addEventListener('touchstart', s, { passive: false });
  btn.addEventListener('touchend',   u, { passive: false });
  btn.addEventListener('touchcancel',u, { passive: false });
}
document.querySelectorAll('.walk-btn').forEach(btn => {
  const dir = btn.dataset.dir;
  bindHoldButton(btn, () => { moveFlags[dir] = true; }, () => { moveFlags[dir] = false; });
});
document.querySelectorAll('.cam-btn').forEach(btn => {
  const dir = btn.dataset.dir;
  bindHoldButton(btn, () => { camFlags[dir] = true; }, () => { camFlags[dir] = false; });
});

// ===== Movement update (call each frame) =====
const MOVE_SPEED = 0.05;
function updateMovement() {
  // Get input axes
  let ix = 0, iz = 0;
  if (moveFlags.up    || keys['w'] || keys['arrowup'])    iz += 1;
  if (moveFlags.down  || keys['s'] || keys['arrowdown'])  iz -= 1;
  if (moveFlags.right || keys['d'] || keys['arrowright']) ix += 1;
  if (moveFlags.left  || keys['a'] || keys['arrowleft'])  ix -= 1;
  if (ix === 0 && iz === 0) return;
  const len = Math.sqrt(ix*ix + iz*iz);
  ix /= len; iz /= len;
  // Camera-relative forward/right (camera is at sin/cos of cameraAngle around uncle)
  const sinA = Math.sin(cameraAngle);
  const cosA = Math.cos(cameraAngle);
  // Forward (into the scene, away from camera) = -sinA, -cosA (xz)
  // Right (camera right) = cosA, -sinA
  const fwdX = -sinA, fwdZ = -cosA;
  const rgtX =  cosA, rgtZ = -sinA;
  const mx = fwdX * iz + rgtX * ix;
  const mz = fwdZ * iz + rgtZ * ix;
  uncle.position.x += mx * MOVE_SPEED;
  uncle.position.z += mz * MOVE_SPEED;
  // Face direction
  uncle.rotation.y = Math.atan2(mx, mz);
}

// ===== Input: drag-to-aim =====
const raycaster = new THREE.Raycaster();
const ndcVec = new THREE.Vector2();
const aimTarget = new THREE.Vector3();
let aiming = false;
let hoveredButton = null;

function getNDC(evt) {
  const rect = canvas.getBoundingClientRect();
  const cx = evt.touches && evt.touches[0] ? evt.touches[0].clientX : evt.clientX;
  const cy = evt.touches && evt.touches[0] ? evt.touches[0].clientY : evt.clientY;
  return {
    x: ((cx - rect.left) / rect.width) * 2 - 1,
    y: -((cy - rect.top) / rect.height) * 2 + 1,
  };
}

function updateAimFromEvent(evt) {
  const ndc = getNDC(evt);
  ndcVec.set(ndc.x, ndc.y);
  raycaster.setFromCamera(ndcVec, camera);
  const hits = raycaster.intersectObjects(machineGroup.children, true);
  if (hits.length > 0) {
    aimTarget.copy(hits[0].point);
    // Track hovered button (if any)
    let obj = hits[0].object;
    while (obj && !obj.userData.zone) obj = obj.parent;
    hoveredButton = (obj && obj.userData && obj.userData.zone) ? obj : null;
  } else {
    // Project onto fallback plane at z = 0.6
    hoveredButton = null;
    const ro = raycaster.ray.origin;
    const rd = raycaster.ray.direction;
    const planeZ = 0.6;
    if (Math.abs(rd.z) > 0.001) {
      const t = (planeZ - ro.z) / rd.z;
      if (t > 0) aimTarget.set(ro.x + rd.x * t, ro.y + rd.y * t, planeZ);
    }
  }
  // Push arm target toward aim point
  armState[currentTool].target.copy(aimTarget);
}

function onPointerDown(evt) {
  if (ignoreInput) return;
  evt.preventDefault();
  aiming = true;
  cameraZoomTarget = 1;
  updateAimFromEvent(evt);
}
function onPointerMove(evt) {
  if (!aiming) return;
  evt.preventDefault();
  updateAimFromEvent(evt);
}
function onPointerUp() {
  if (!aiming) return;
  aiming = false;
  cameraZoomTarget = 0;
  // If we're hovering over a button, lock and press
  if (hoveredButton) {
    lockPress(hoveredButton);
  } else {
    // Retract to rest
    armState[currentTool].target.copy(armState[currentTool].rest);
  }
}

canvas.addEventListener('mousedown',  onPointerDown);
window.addEventListener('mousemove',  onPointerMove);
window.addEventListener('mouseup',    onPointerUp);
canvas.addEventListener('touchstart', onPointerDown, { passive: false });
window.addEventListener('touchmove',  onPointerMove, { passive: false });
window.addEventListener('touchend',   onPointerUp);

// ===== Press lock & resolution =====
function lockPress(buttonMesh) {
  const zone = buttonMesh.userData.zone;
  const tool = currentTool;
  const worldPos = new THREE.Vector3();
  buttonMesh.getWorldPosition(worldPos);
  worldPos.z += 0.12;
  armState[tool].target.copy(worldPos);
  ignoreInput = true;

  setTimeout(() => {
    resolvePress(zone);
    setTimeout(() => {
      armState[tool].target.copy(armState[tool].rest);
    }, 400);
  }, 350);
}

function resolvePress(zone) {
  if (!zone.correct) {
    showHitText('hitWrong');
    cameraShake = 0.22;
    ignoreInput = false;
    return;
  }
  if (zone.tools && !zone.tools.includes(currentTool)) {
    showHitText('wrongTool');
    cameraShake = 0.15;
    ignoreInput = false;
    return;
  }
  showHitText('stageClear');
  cameraShake = 0.1;
  setTimeout(() => {
    if (stageIdx >= STAGES.length - 1) {
      showScreen('clear');
    } else {
      loadStage(stageIdx + 1);
    }
  }, 1400);
}

function showHitText(key) {
  const el = document.getElementById('hit-text');
  el.innerHTML = SurrealI18n.t(key);
  el.classList.remove('show');
  void el.offsetWidth;
  el.classList.add('show');
}

// ===== Camera update =====
const CAM_ORBIT_SPEED = 0.028;
const CAM_RADIUS = 7.5;
const CAM_HEIGHT = 3.2;
function updateCamera() {
  // Orbit input (keyboard + on-screen buttons)
  if (camFlags.ccw || keys['q']) cameraAngle -= CAM_ORBIT_SPEED;
  if (camFlags.cw  || keys['e']) cameraAngle += CAM_ORBIT_SPEED;

  // Smooth sway
  const t = performance.now() * 0.0004;
  const swayX = Math.sin(t) * 0.18;
  const swayY = Math.sin(t * 1.3) * 0.12;

  // Zoom in when aiming (shrink orbit radius)
  cameraZoom += (cameraZoomTarget - cameraZoom) * 0.08;
  const radius = CAM_RADIUS - cameraZoom * 1.8;

  // Shake (decays)
  const sx = (Math.random() - 0.5) * cameraShake;
  const sy = (Math.random() - 0.5) * cameraShake;
  cameraShake *= 0.85;

  // Orbit around uncle
  const focusX = uncle.position.x;
  const focusY = 1.3;
  const focusZ = uncle.position.z;
  camera.position.set(
    focusX + Math.sin(cameraAngle) * radius + swayX + sx,
    CAM_HEIGHT + swayY + sy,
    focusZ + Math.cos(cameraAngle) * radius
  );
  // Look-at leans slightly toward aim when aiming
  const lx = focusX + (aiming ? (aimTarget.x - focusX) * 0.2 : 0);
  const ly = focusY + (aiming ? (aimTarget.y - focusY) * 0.2 : 0);
  const lz = focusZ + (aiming ? (aimTarget.z - focusZ) * 0.2 : 0);
  camera.lookAt(lx, ly, lz);
}

// ===== Render loop =====
function loop() {
  updateMovement();
  updateBodyRig();
  updateArms();
  updateCamera();
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// Initial arm position
updateArms();

// ===== Clear screen buttons =====
document.getElementById('retry-btn').addEventListener('click', () => {
  showScreen('game');
  loadStage(0);
});
document.getElementById('title-btn').addEventListener('click', () => {
  showScreen('title');
});
