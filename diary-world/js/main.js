import * as THREE from 'three';
import { createApp, defineComponent, ref, onMounted } from 'vue';
import TresJS, { TresCanvas, useRenderLoop, useTres } from '@tresjs/core';

/* ============================================================
   Wayfinder 秋日落叶 —— TresJS 渲染层
   手绘简笔画 + 复古水粉色块 + 轻 3D 插画：
   全场景哑光平滑 Lambert（无切面无 PBR）、暖橙主光 + 冷蓝补光、
   蓝灰阴影；圆润手绘感小狗；五裂枫叶多变体；
   被卷起的枫叶带柔和暖金光晕（Sprite 池，落地即灭）。
   尾流交互逻辑与三层枫叶空间层级完整保留。
   ============================================================ */

const CONFIG = {
  leaves: {
    count: 5000,          // 地面枫叶数量（面板 1000~8000 可调）
    capacity: 8000,       // 实例容量上限
    clumps: 30,           // 叶簇数量（自然疏密）
    fieldRadius: 16.5,
    sizeMin: 0.2,
    sizeMax: 0.44,
  },
  ambient: {
    far: 300,             // 远景叶（小、慢、氛围）
    near: 14,             // 近景叶（大、掠过镜头）
  },
  interaction: {          /* —— 蝴蝶 → 枫叶：局部尾流 + 单片独立物理 —— */
    bodyLen: 0.42,        // 身体核心区半长
    bodyWidth: 0.42,      // 身体核心区半宽
    wakeLen: 2.4,         // 身后尾流长度
    wakeWidth: 1.25,      // 尾流半宽
    hSpeed: 3.0,          // 水平弹速基准
    vyHigh: 4.2,          // 高抛垂直初速基准
    vyHop: 1.9,           // 小弹垂直初速基准
    pHigh: 0.18,          // 高抛概率（少数）
    pHop: 0.44,           // 小弹概率（多数会离地）
    cooldown: 0.4,        // 同片叶子被踢最小间隔
  },
  recovery: {
    springXZ: 2.4,        // 水平回锚点弹簧
    gravity: 10.0,        // 空中重力
    airDrag: 0.35,        // 空中水平阻力
    damping: 2.2,         // 速度阻尼
    agitDecay: 0.5,       // 扰动度衰减
  },
  wind: 0.45,             // 全局风力（面板可调）
  character: {
    speed: 5.5,           // 最大飞行速度（面板可调）
    accel: 6.0,           // 加速度（飞行更轻盈）
    moveRadius: 11.0,
    scale: 0.9,           // 整体缩放（面板可调）
    idleWanderAfter: 8,   // 鼠标静止后自动游飞（悬停时不游走）
    start: [7.6, 3.4],
  },
};

const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => v < a ? a : (v > b ? b : v);
const TAU = Math.PI * 2;
function angleLerp(a, b, t) {
  const d = ((b - a + Math.PI * 3) % TAU) - Math.PI;
  return a + d * t;
}

/* ---------------- 统一手绘材质：哑光平滑 Lambert（柔和明暗，无切面） ---------------- */
function matte(color) {
  return new THREE.MeshLambertMaterial({ color });
}

/* ---------------- 地面贴图（暖米棕 · 色斑明暗） ---------------- */
function makeGroundTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 1024;
  const g = c.getContext('2d');
  g.fillStyle = '#d5cbb8';
  g.fillRect(0, 0, 1024, 1024);
  const blotch = (x, y, r, col) => {
    const rg = g.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, col);
    rg.addColorStop(1, col.replace(/[\d.]+\)$/, '0)'));
    g.fillStyle = rg;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  };
  for (let i = 0; i < 14; i++) {
    blotch(rand(0, 1024), rand(0, 1024), rand(150, 340),
      Math.random() < 0.55 ? 'rgba(219,192,150,0.20)' : 'rgba(167,158,140,0.16)');
  }
  for (let i = 0; i < 8; i++) {
    blotch(rand(0, 1024), rand(0, 1024), rand(90, 200), 'rgba(236,224,199,0.20)');
  }
  const rg = g.createRadialGradient(512, 470, 60, 512, 470, 560);
  rg.addColorStop(0, 'rgba(238,229,210,0.85)');
  rg.addColorStop(0.6, 'rgba(211,200,177,0.30)');
  rg.addColorStop(1, 'rgba(160,148,124,0.50)');
  g.fillStyle = rg;
  g.fillRect(0, 0, 1024, 1024);
  g.save();
  g.translate(280, -100);
  g.rotate(0.5);
  const lg = g.createLinearGradient(0, 0, 0, 900);
  lg.addColorStop(0, 'rgba(255,251,240,0.18)');
  lg.addColorStop(1, 'rgba(255,251,240,0)');
  g.fillStyle = lg;
  g.fillRect(-200, 0, 340, 1200);
  g.restore();
  const px = 1024 / 60;
  g.lineCap = 'round';
  [[0, 0, 3.2], [0.6, -0.4, 5.6], [-0.8, 0.7, 8.2]].forEach(([ox, oz, r], i) => {
    g.strokeStyle = i === 1 ? 'rgba(255,248,232,0.06)' : 'rgba(255,248,232,0.04)';
    g.lineWidth = rand(7, 14);
    g.beginPath();
    g.arc(512 + ox * px, 512 + oz * px, r * px, rand(0, TAU), rand(0, TAU) + rand(2.2, 5.2));
    g.stroke();
  });
  for (let i = 0; i < 34; i++) {
    const x = rand(0, 1024), y = rand(0, 1024), a = rand(-0.6, -0.1), L2 = rand(60, 230);
    g.strokeStyle = Math.random() < 0.6 ? 'rgba(255,250,238,0.07)' : 'rgba(118,102,80,0.05)';
    g.lineWidth = rand(4, 13);
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + Math.cos(a) * L2 * 0.5, y + Math.sin(a) * L2 * 0.5, x + Math.cos(a) * L2, y + Math.sin(a) * L2);
    g.stroke();
  }
  for (let i = 0; i < 5200; i++) {
    const v = Math.random();
    g.fillStyle = v < 0.5 ? 'rgba(255,250,240,0.05)' : 'rgba(96,84,64,0.05)';
    g.fillRect(rand(0, 1024), rand(0, 1024), rand(0.8, 2), rand(0.8, 2));
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/* ---------------- 环境构建（进同一 three 场景，哑光平滑） ---------------- */
const barkMat = matte(0x7a5c36);
const rockMat = new THREE.MeshLambertMaterial({ map: makeRockTexture() });
const rockMat2 = matte(0xaab4c8);
const tuftMat = matte(0x5c6c9c);

// 手绘水粉岩石贴图：蓝灰底 + 大块明暗 + 斑点颗粒 + 笔触横带
function makeRockTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#9aa6c0';
  g.fillRect(0, 0, 512, 512);
  const blotch = (x, y, r, col) => {
    const rg = g.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, col);
    rg.addColorStop(1, col.replace(/[\d.]+\)$/, '0)'));
    g.fillStyle = rg;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  };
  for (let i = 0; i < 10; i++) {
    blotch(rand(0, 512), rand(0, 512), rand(60, 170),
      Math.random() < 0.5 ? 'rgba(190,200,222,0.40)' : 'rgba(108,118,146,0.38)');
  }
  for (let i = 0; i < 5; i++) {
    blotch(rand(0, 512), rand(0, 512), rand(40, 90), 'rgba(168,178,170,0.30)');
  }
  // 斑点颗粒
  for (let i = 0; i < 90; i++) {
    g.fillStyle = Math.random() < 0.5 ? 'rgba(56,64,88,0.30)' : 'rgba(226,232,244,0.30)';
    g.beginPath();
    g.arc(rand(0, 512), rand(0, 512), rand(1, 3.2), 0, TAU);
    g.fill();
  }
  // 手绘笔触横带
  g.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    g.strokeStyle = i % 2 ? 'rgba(120,130,156,0.30)' : 'rgba(208,216,234,0.25)';
    g.lineWidth = rand(6, 16);
    g.beginPath();
    const y = rand(40, 470), x0 = rand(0, 300);
    g.moveTo(x0, y);
    g.quadraticCurveTo(x0 + 120, y + rand(-24, 24), x0 + rand(160, 320), y + rand(-16, 16));
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// 顶点位移的圆润岩石（球体 + 平滑噪声起伏，非切割感）
function makeRockGeometry(s) {
  const geo = new THREE.SphereGeometry(1, 28, 20);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  const p1 = rand(0, 10), p2 = rand(0, 10), p3 = rand(0, 10);
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    const n = 0.16 * Math.sin(v.x * 2.4 + p1)
            + 0.12 * Math.sin(v.y * 3.1 + p2)
            + 0.10 * Math.sin(v.z * 2.8 + p3)
            + 0.05 * Math.sin(v.x * 5.2 + v.z * 4.1 + p1);
    v.multiplyScalar(1 + n);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  geo.scale(s, s * 0.78, s * 0.88);
  return geo;
}

function buildEnvironment(parent) {
  // The original simulation stays at y=0; only its ground becomes a diary.
  const cover=new THREE.Mesh(new THREE.BoxGeometry(53.2,.18,38),matte(0x368ac6));
  cover.position.y=-.27;cover.receiveShadow=true;parent.add(cover);
  const pageSides=new THREE.Mesh(new THREE.BoxGeometry(52.5,.26,37.125),matte(0xe9dfcb));
  pageSides.position.y=-.13;parent.add(pageSides);
  const paper=new THREE.MeshLambertMaterial({color:0xfffaed});
  for(const x of [-13.125,13.125]){
    const page=new THREE.Mesh(new THREE.PlaneGeometry(26.25,37.125),paper);
    page.rotation.x=-Math.PI/2;page.position.set(x,.002,0);page.receiveShadow=true;parent.add(page);
  }
  const seam=new THREE.Mesh(new THREE.PlaneGeometry(.10,37.125),matte(0xc6b59c));
  seam.rotation.x=-Math.PI/2;seam.position.y=.004;parent.add(seam);
  const desk=new THREE.Mesh(new THREE.BoxGeometry(160,.4,120),matte(0x99704f));
  desk.position.y=-.7;desk.receiveShadow=true;parent.add(desk);

  function growBranch(p, len, rad, depth) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rad * 0.55, rad, len, 7), barkMat);
    mesh.position.y = len / 2;
    mesh.castShadow = true;
    const pivot = new THREE.Group();
    pivot.rotation.z = rand(-0.14, 0.14);
    pivot.add(mesh);
    p.add(pivot);
    if (depth > 0) {
      const kids = 2 + (Math.random() < 0.55 ? 1 : 0);
      for (let k = 0; k < kids; k++) {
        const anchor = new THREE.Group();
        anchor.position.y = len * rand(0.55, 0.98);
        anchor.rotation.y = rand(0, TAU);
        anchor.rotation.z = rand(0.5, 1.0);
        pivot.add(anchor);
        growBranch(anchor, len * rand(0.55, 0.7), rad * 0.5, depth - 1);
      }
    }
  }
  const tree = new THREE.Group();
  growBranch(tree, 2.1, 0.17, 4);
  tree.position.set(-0.1, 0, -1.2);
  parent.add(tree);

  function rockCluster(x, z, s) {
    const g = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const r = new THREE.Mesh(makeRockGeometry(s * rand(0.5, 1)), i % 2 ? rockMat : rockMat2);
      r.position.set(rand(-s, s) * 0.7, s * rand(0.15, 0.3), rand(-s, s) * 0.5);
      r.scale.set(1, rand(0.7, 0.95), rand(0.8, 1.1));
      r.rotation.set(rand(0, 0.5), rand(0, TAU), rand(0, 0.5));
      r.castShadow = true;
      g.add(r);
    }
    for (let i = 0; i < 12; i++) {
      const blade = new THREE.Mesh(new THREE.ConeGeometry(0.045, rand(0.16, 0.34), 6), tuftMat);
      const a = rand(0, TAU), rr = rand(0.2, 0.85) * s;
      blade.position.set(Math.cos(a) * rr, 0.08, Math.sin(a) * rr * 0.7);
      blade.rotation.set(rand(-0.35, 0.35), 0, rand(-0.35, 0.35));
      g.add(blade);
    }
    g.position.set(x, 0, z);
    parent.add(g);
  }
  rockCluster(-2.6, 0.9, 0.85);
  rockCluster(1.9, -2.3, 0.7);

  // 地上枯枝
  const br = new THREE.Group();
  const ba = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.055, 1.15, 7), barkMat);
  ba.rotation.z = Math.PI / 2 - 0.06;
  ba.position.y = 0.05;
  ba.castShadow = true;
  const bb = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.032, 0.55, 7), barkMat);
  bb.position.set(0.3, 0.1, 0.12);
  bb.rotation.set(0.5, 0.4, Math.PI / 2 - 0.9);
  br.add(ba, bb);
  br.position.set(1.6, 0, 0.5);
  br.rotation.y = 0.25;
  parent.add(br);

  // 蘑菇与白石子
  const stemMat = matte(0x93a46e);
  const capMat = matte(0xfbfbf7);
  const pebbleMat = matte(0xf2f3ef);
  [[-0.3, 0.7], [0.5, 1.1], [-1.1, 1.6], [1.3, -0.6], [0.2, -1.9], [-1.8, -0.4], [2.5, 0.8]].forEach(([x, z]) => {
    const g = new THREE.Group();
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.02, 0.2, 6), stemMat);
    stem.position.y = 0.1;
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), capMat);
    cap.position.y = 0.21;
    cap.scale.y = 0.8;
    g.add(stem, cap);
    g.position.set(x, 0, z);
    parent.add(g);
  });
  [[-1.5, 1.9], [2.0, 1.6], [-2.8, -1.2], [1.0, 2.3]].forEach(([x, z]) => {
    const p = new THREE.Mesh(new THREE.SphereGeometry(rand(0.06, 0.1), 10, 8), pebbleMat);
    p.position.set(x, 0.03, z);
    p.scale.y = 0.55;
    parent.add(p);
  });
}

/* ---------------- 枫叶几何（三种手绘变体）与材质 ---------------- */
function makeMapleGeometry(notch, spread, skew) {
  const s = new THREE.Shape();
  const o = (v) => v * spread;          // 外缘缩放
  const n = (v) => v * notch;           // 缺口深度
  const k = skew * 0.06;                // 轻微不对称
  s.moveTo(0, -0.5);
  s.quadraticCurveTo(0.16 * spread, -0.44, o(0.30) + k, -0.30);
  s.lineTo(o(0.34) + k, -0.18);
  s.quadraticCurveTo(0.20, n(-0.16), n(0.15), -0.13);
  s.quadraticCurveTo(o(0.34), -0.06, o(0.46) + k, 0.04);
  s.lineTo(n(0.17), 0.10);
  s.quadraticCurveTo(o(0.30), 0.20, o(0.28) + k, n(0.38));
  s.lineTo(0.09, 0.20);
  s.quadraticCurveTo(0.10, 0.36, k, 0.50);
  s.quadraticCurveTo(-0.08, 0.36, -0.06, 0.20);
  s.lineTo(-o(0.26) - k, 0.40);
  s.quadraticCurveTo(-o(0.30), 0.22, -n(0.16), 0.10);
  s.lineTo(-o(0.45) - k, 0.05);
  s.quadraticCurveTo(-o(0.34), -0.05, -n(0.14), -0.13);
  s.lineTo(-o(0.32) - k, -0.17);
  s.quadraticCurveTo(-o(0.19), -0.15, -o(0.30) - k, -0.30);
  s.quadraticCurveTo(-0.16 * spread, -0.44, 0, -0.5);
  const geo = new THREE.ShapeGeometry(s, 5);
  geo.rotateX(-Math.PI / 2);
  return geo;
}
const leafGeo = makeMapleGeometry(1.0, 1.0, 0);      // 地面场用
const ambGeo = makeMapleGeometry(0.9, 1.05, 1);      // 空中层用

// 落叶材质：哑光双面；被卷起（vGlow>0）时背面透出柔和金光
const leafMat = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide });
leafMat.onBeforeCompile = (shader) => {
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nattribute float aGlow;\nvarying float vGlow;')
    .replace('#include <begin_vertex>', '#include <begin_vertex>\nvGlow = aGlow;');
  const target = 'vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;';
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', '#include <common>\nvarying float vGlow;')
    .replace(target, target + '\noutgoingLight += vec3(1.0, 0.80, 0.38) * (0.6 * vGlow) * (gl_FrontFacing ? 0.0 : 1.0);');
};
const ambMat = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide });

// 秋日枫叶配色（金 / 橙 / 红棕）
const LEAF_COLORS = [
  [0xf0a51e, 0.26],
  [0xe8821c, 0.18],
  [0xf6c433, 0.14],
  [0xd95f1e, 0.16],
  [0xc94a24, 0.10],
  [0xa93b1e, 0.06],
  [0xf2d16b, 0.06],
  [0xb8622a, 0.04],
];
function pickLeafColor(out) {
  let r = Math.random(), acc = 0, c = LEAF_COLORS[0][0];
  for (const [hex, w] of LEAF_COLORS) { acc += w; if (r <= acc) { c = hex; break; } }
  const v = rand(0.9, 1.06);
  out.r = ((c >> 16 & 255) / 255) * v;
  out.g = ((c >> 8 & 255) / 255) * v;
  out.b = ((c & 255) / 255) * v;
}

/* ---------------- 暖金光晕贴图 + Sprite 池（被卷起叶子的柔光） ---------------- */
const haloTex = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const rg = g.createRadialGradient(64, 64, 4, 64, 64, 62);
  rg.addColorStop(0, 'rgba(255,205,120,0.75)');
  rg.addColorStop(0.45, 'rgba(255,180,95,0.32)');
  rg.addColorStop(1, 'rgba(255,165,75,0)');
  g.fillStyle = rg;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
})();
const HALO_POOL = 56;
const haloPool = [];
for (let i = 0; i < HALO_POOL; i++) {
  const m = new THREE.SpriteMaterial({
    map: haloTex, color: 0xffc372, transparent: true, opacity: 0,
    blending: THREE.NormalBlending, depthWrite: false,
  });
  const sp = new THREE.Sprite(m);
  sp.visible = false;
  sp.renderOrder = 6;
  haloPool.push(sp);
}

/* ---------------- 地面落叶场（尾流交互，三种叶形变体） ---------------- */
const L = CONFIG.leaves, I = CONFIG.interaction, RC = CONFIG.recovery;
const N = L.capacity;
const LEAF_V = 3;
const homeX = new Float32Array(N), homeZ = new Float32Array(N), homeY = new Float32Array(N);
const posX = new Float32Array(N), posY = new Float32Array(N), posZ = new Float32Array(N);
const velX = new Float32Array(N), velY = new Float32Array(N), velZ = new Float32Array(N);
const yaw = new Float32Array(N), yawV = new Float32Array(N);
const roll = new Float32Array(N), rollV = new Float32Array(N);
const glow = new Float32Array(N);
const kickCd = new Float32Array(N);
const kickH = new Float32Array(N), kickV = new Float32Array(N);
const tAx = new Float32Array(N), tAz = new Float32Array(N);
const agit = new Float32Array(N), phase = new Float32Array(N), fFreq = new Float32Array(N);
const size = new Float32Array(N), sx = new Float32Array(N), sz = new Float32Array(N);
const spinSign = new Float32Array(N);
const variantOf = new Uint8Array(N), slotOf = new Uint16Array(N);
const baseCol = new Float32Array(N * 3);

// 三种叶形变体各一个 InstancedMesh（形状/缺口/不对称不同）
const leafVariants = [makeMapleGeometry(1.0, 1.0, 0), makeMapleGeometry(1.22, 0.9, 0.5), makeMapleGeometry(0.78, 1.12, -0.5)];
const perVariantCap = Math.ceil(N / LEAF_V) + 1;
const leafMeshes = leafVariants.map((geo) => {
  const m = new THREE.InstancedMesh(geo, leafMat, perVariantCap);
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  m.frustumCulled = false;
  return m;
});
const glowAttrs = leafVariants.map((geo, v) => {
  const a = new THREE.InstancedBufferAttribute(new Float32Array(perVariantCap), 1);
  a.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('aGlow', a);
  return a;
});
window.__leafMeshes = leafMeshes; // 调试

function seedLeaves() {
  const col = new THREE.Color();
  const count = L.count;
  const clumps = [];
  for (let c = 0; c < L.clumps; c++) {
    const a = rand(0, TAU);
    const rr = c < 5 ? Math.sqrt(Math.random()) * 3.5 : Math.sqrt(Math.random()) * (L.fieldRadius - 1.5);
    clumps.push({ x: Math.cos(a) * rr, z: Math.sin(a) * rr, r: rand(1.0, 3.0) });
  }
  const vCount = [0, 0, 0];
  for (let i = 0; i < count; i++) {
    const vv = i % LEAF_V;
    variantOf[i] = vv;
    slotOf[i] = vCount[vv]++;
    let hx, hz;
    if (Math.random() < 0.62) {
      const c = clumps[(Math.random() * clumps.length) | 0];
      const a = rand(0, TAU), rr = Math.sqrt(Math.random()) * c.r;
      hx = c.x + Math.cos(a) * rr;
      hz = c.z + Math.sin(a) * rr;
    } else {
      const a = rand(0, TAU), rr = Math.sqrt(Math.random()) * L.fieldRadius;
      hx = Math.cos(a) * rr;
      hz = Math.sin(a) * rr;
    }
    const d = Math.hypot(hx, hz);
    if (d > L.fieldRadius) { hx *= L.fieldRadius / d; hz *= L.fieldRadius / d; }
    homeX[i] = hx; homeZ[i] = hz;
    homeY[i] = rand(0.02, 0.06);
    posX[i] = homeX[i]; posY[i] = homeY[i]; posZ[i] = homeZ[i];
    yaw[i] = rand(0, TAU);
    spinSign[i] = Math.random() < 0.5 ? -1 : 1;
    rollV[i] = rand(3.5, 9.5) * spinSign[i];
    kickCd[i] = rand(0, 0.5);
    kickH[i] = rand(0.5, 1.5);
    kickV[i] = rand(0.4, 1.7);
    const ax = rand(-1, 1), az = rand(-1, 1); const il = Math.hypot(ax, az) || 1;
    tAx[i] = ax / il; tAz[i] = az / il;
    phase[i] = rand(0, TAU);
    fFreq[i] = rand(5, 9);
    size[i] = rand(L.sizeMin, L.sizeMax);
    sx[i] = size[i] * rand(0.88, 1.15);   // 每叶轻微形变
    sz[i] = size[i] * rand(0.85, 1.12);
    pickLeafColor(col);
    leafMeshes[vv].setColorAt(slotOf[i], col);
    baseCol[i * 3] = col.r; baseCol[i * 3 + 1] = col.g; baseCol[i * 3 + 2] = col.b;
  }
  leafMeshes.forEach((m, v) => {
    m.count = vCount[v];
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });
  glowAttrs.forEach(a => { a.needsUpdate = true; });
}

/* ---------------- 空中枫叶三层（远/近） ---------------- */
function windAt(t) { return (Math.sin(t * 0.3) * 0.35 + Math.sin(t * 0.13 + 1.7) * 0.2) * CONFIG.wind * 2; }

const FAR = CONFIG.ambient.far;
const farState = [];
const farMesh = new THREE.InstancedMesh(ambGeo, ambMat, FAR);
farMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
farMesh.frustumCulled = false;
{
  const col = new THREE.Color();
  for (let i = 0; i < FAR; i++) {
    const a = rand(0, TAU), r = rand(4, 24);
    farState.push({
      x: Math.cos(a) * r, z: Math.sin(a) * r, y: rand(0.3, 7),
      fall: rand(0.25, 0.55), ph: rand(0, TAU),
      rs: rand(0.6, 1.6) * (Math.random() < 0.5 ? -1 : 1),
      sc: rand(0.45, 0.7), roll: rand(0, TAU), phase: 'fall', restT: 0, bounced: false,
    });
    pickLeafColor(col);
    col.lerp(new THREE.Color(1, 1, 1), 0.3);
    farMesh.setColorAt(i, col);
  }
}

const NEAR = CONFIG.ambient.near;
const nearState = [];
const nearMesh = new THREE.InstancedMesh(ambGeo, ambMat, NEAR);
nearMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
nearMesh.frustumCulled = false;
{
  const col = new THREE.Color();
  for (let i = 0; i < NEAR; i++) {
    nearState.push({
      x: 0, z: 0, y: -10, fall: rand(0.4, 0.65), ph: rand(0, TAU),
      rs: rand(1.2, 2.6) * (Math.random() < 0.5 ? -1 : 1), sc: rand(1.6, 2.6),
      roll: rand(0, TAU), phase: 'wait', restT: rand(0, 3), drift: rand(0.5, 1.2),
    });
    pickLeafColor(col);
    col.lerp(new THREE.Color(1, 1, 1), 0.15);
    nearMesh.setColorAt(i, col);
  }
}

function respawnFar(f) {
  const a = rand(0, TAU), r = rand(3, 24);
  f.x = Math.cos(a) * r; f.z = Math.sin(a) * r;
  f.y = rand(3, 7);
  f.phase = 'fall'; f.bounced = false;
}
function respawnNear(n, camX, camZ, fx, fz) {
  const side = Math.random() < 0.5 ? -1 : 1;
  n.x = camX + fx * rand(1.5, 3.5) - fz * side * rand(1.6, 3.2);
  n.z = camZ + fz * rand(1.5, 3.5) + fx * side * rand(1.6, 3.2);
  n.y = rand(1.6, 4.2);
  n.phase = 'fall';
}

function updateAmbientLayers(dt, t, camX, camZ) {
  const wind = windAt(t);
  for (let i = 0; i < FAR; i++) {
    const f = farState[i];
    if (f.phase === 'fall') {
      f.y -= f.fall * dt;
      f.x += (wind * 0.7 + Math.sin(t * 0.8 + f.ph) * 0.25) * dt;
      f.roll += f.rs * dt;
      if (f.y <= 0.05) {
        if (!f.bounced) { f.bounced = true; f.y = 0.05; f.phase = 'bounce'; }
        else { f.y = 0.04; f.phase = 'rest'; f.restT = rand(7, 16); }
      }
    } else if (f.phase === 'bounce') {
      f.y += f.fall * 1.05 * dt;
      if (f.y >= 0.05 + f.fall * 0.1) f.phase = 'fall2';
    } else if (f.phase === 'fall2') {
      f.y -= f.fall * 0.5 * dt;
      if (f.y <= 0.04) { f.y = 0.04; f.phase = 'rest'; f.restT = rand(7, 16); }
    } else {
      f.restT -= dt;
      if (f.restT <= 0) respawnFar(f);
    }
    _e.set(
      f.roll * 0.7 + (f.phase === 'fall' ? Math.sin(t + f.ph) * 0.3 : 0),
      f.ph + f.roll * 0.2,
      f.roll * 0.5
    );
    _q.setFromEuler(_e);
    _p.set(f.x, f.y, f.z);
    _s.setScalar(f.sc);
    _m.compose(_p, _q, _s);
    farMesh.setMatrixAt(i, _m);
  }
  farMesh.instanceMatrix.needsUpdate = true;

  for (let i = 0; i < NEAR; i++) {
    const n = nearState[i];
    if (n.phase === 'wait') {
      n.restT -= dt;
      if (n.restT <= 0) respawnNear(n, camX, camZ, Math.sin(charState.heading), Math.cos(charState.heading));
    } else if (n.phase === 'fall') {
      n.y -= n.fall * dt;
      n.x += (wind * 1.4 + Math.sin(t * 1.1 + n.ph) * 0.5) * n.drift * dt;
      n.z += Math.cos(t * 0.7 + n.ph) * 0.3 * n.drift * dt;
      n.roll += n.rs * dt;
      if (n.y <= 0.08) { n.y = 0.08; n.phase = 'rest'; n.restT = rand(1.5, 3); }
      const dx = n.x - camX, dz = n.z - camZ;
      if (dx * dx + dz * dz > 90) { n.phase = 'wait'; n.restT = rand(0.5, 2); }
    } else {
      n.restT -= dt;
      if (n.restT <= 0) { n.phase = 'wait'; n.restT = rand(0.5, 2); }
    }
    _e.set(n.roll, n.ph, n.roll * 0.6);
    _q.setFromEuler(_e);
    _p.set(n.x, n.y, n.z);
    _s.setScalar(n.sc);
    _m.compose(_p, _q, _s);
    nearMesh.setMatrixAt(i, _m);
  }
  nearMesh.instanceMatrix.needsUpdate = true;
}

/* ---------------- 蝴蝶（手绘插画风 · 橙红 · 跟随鼠标飞行） ---------------- */
const flyBodyMat = matte(0x6b3220);     // 深棕红身体
const flyAntMat = matte(0x4a2a18);
let charGroup = null, charInner = null;
const fly = {};

// 右翼手绘贴图：水粉橙红渐变 + 翅脉 + 深色外缘 + 浅色斑点
function makeWingTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const rg = g.createRadialGradient(36, 64, 10, 128, 128, 195);
  rg.addColorStop(0, '#f6b04a');
  rg.addColorStop(0.45, '#ee7d30');
  rg.addColorStop(0.78, '#d94f2a');
  rg.addColorStop(1, '#a83a22');
  g.fillStyle = rg;
  g.fillRect(0, 0, 256, 256);
  // 水粉色块（少量明暗斑）
  g.globalAlpha = 0.35;
  g.fillStyle = '#f8c96a';
  [[52, 64, 34], [138, 84, 26]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); });
  g.fillStyle = '#c14020';
  [[178, 148, 40], [70, 160, 30]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); });
  g.globalAlpha = 1;
  // 翅脉（自根部扇出的深红细线）
  g.strokeStyle = 'rgba(150,45,25,0.75)';
  g.lineCap = 'round';
  [[14, 58, 210, 16], [16, 62, 200, 118], [18, 66, 152, 208], [20, 70, 56, 232]].forEach(([x0, y0, x1, y1]) => {
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(x0, y0);
    g.quadraticCurveTo((x0 + x1) / 2 + 22, (y0 + y1) / 2, x1, y1);
    g.stroke();
  });
  // 外缘深色带
  g.strokeStyle = 'rgba(118,30,18,0.85)';
  g.lineWidth = 12;
  g.beginPath();
  g.moveTo(96, 10);
  g.bezierCurveTo(200, 20, 246, 100, 190, 210);
  g.stroke();
  // 浅色斑点
  g.fillStyle = 'rgba(250,230,190,0.9)';
  [[196, 58, 8], [206, 128, 6]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
const wingTex = makeWingTexture();
const wingMat = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide, map: wingTex });

// 右翼轮廓（前翼 + 后翼一体，根部在原点）
function makeWingGeometry() {
  const s = new THREE.Shape();
  s.moveTo(0, 0.02);
  s.bezierCurveTo(0.25, 0.44, 0.72, 0.55, 1.0, 0.28);
  s.bezierCurveTo(1.16, 0.14, 1.04, -0.08, 0.72, -0.12);
  s.bezierCurveTo(0.9, -0.32, 0.78, -0.6, 0.45, -0.66);
  s.bezierCurveTo(0.2, -0.7, 0.06, -0.45, 0.02, -0.2);
  s.lineTo(0, 0.02);
  const geo = new THREE.ShapeGeometry(s, 12);
  geo.computeBoundingBox();
  const bb = geo.boundingBox;
  const uv = geo.attributes.uv;
  const w = bb.max.x - bb.min.x, h = bb.max.y - bb.min.y;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, (uv.getX(i) - bb.min.x) / w, (uv.getY(i) - bb.min.y) / h);
  }
  geo.rotateX(-Math.PI / 2);   // 放平到 XZ 面（俯视可见翅面）
  return geo;
}

function buildButterfly(parent) {
  const M = (geo, mat) => { const m = new THREE.Mesh(geo, mat); m.castShadow = true; return m; };
  charGroup = new THREE.Group();
  charInner = new THREE.Group();
  charGroup.add(charInner);
  parent.add(charGroup);

  // 身体（头 + 胸腹，深棕红）
  const body = M(new THREE.CapsuleGeometry(0.05, 0.3, 4, 10), flyBodyMat);
  body.rotation.x = Math.PI / 2;
  charInner.add(body);
  const head = M(new THREE.SphereGeometry(0.065, 12, 10), flyBodyMat);
  head.position.set(0, 0, 0.2);
  charInner.add(head);

  // 触角（两根小弧 + 端球）
  const mkAnt = (side) => {
    const g = new THREE.Group();
    g.position.set(0.025 * side, 0.05, 0.2);
    const a = M(new THREE.CylinderGeometry(0.004, 0.007, 0.2, 4), flyAntMat);
    a.position.set(0.035 * side, 0.07, 0);
    a.rotation.z = -0.55 * side;
    const tip = M(new THREE.SphereGeometry(0.013, 6, 6), flyAntMat);
    tip.position.set(0.06 * side, 0.14, 0);
    g.add(a, tip);
    return g;
  };
  const antL = mkAnt(1), antR = mkAnt(-1);
  charInner.add(antL, antR);

  // 翅膀（右翼几何 + 镜像左翼，pivot 在翼根）
  const wingGeo = makeWingGeometry();
  const mkWing = (side) => {
    const g = new THREE.Group();
    g.position.set(0.03 * side, 0.05, 0.02);
    const w = M(wingGeo, wingMat);
    w.scale.x = side;
    g.add(w);
    return g;
  };
  const wingL = mkWing(1), wingR = mkWing(-1);
  charInner.add(wingL, wingR);

  Object.assign(fly, {
    root: charInner, wingL, wingR, antL, antR,
    phase: rand(0, TAU), pitchSm: 0,
  });
  charGroup.scale.setScalar(CONFIG.character.scale);
  charGroup.position.set(CONFIG.character.start[0], 1.25, CONFIG.character.start[1]);
  charGroup.rotation.y = 0;
}

/* ---------------- 输入 ---------------- */
const keys = {};
window.addEventListener('keydown', e => { keys[e.code] = true; });
window.addEventListener('keyup', e => { keys[e.code] = false; });
const mouseN = { x: 0, y: 0 };
window.addEventListener('pointermove', e => {
  mouseN.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouseN.y = (e.clientY / window.innerHeight) * 2 - 1;
});

let camera = null;
const raycaster = new THREE.Raycaster();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const ndc = new THREE.Vector2();
const hitPoint = new THREE.Vector3();
let hasMouse = false;
let lastMouseMoveAt = performance.now();
window.addEventListener('pointermove', e => {
  mouseN.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouseN.y = (e.clientY / window.innerHeight) * 2 - 1;
  hasMouse = true;
  lastMouseMoveAt = performance.now();
});

/* ---------------- 角色状态与飞行（跟随鼠标） ---------------- */
const FLY_Y = 1.25;                     // 悬停/飞行高度
const flyPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -FLY_Y);
const charState = {
  vx: 0, vz: 0, speed: 0, speedNorm: 0,
  heading: 0, prevHeading: 0,
  wanderTimer: 0, wanderTarget: null,
  roll: 0, prevHeadingS: 0,
  antLag: 0, pitchSm: 0,
};

function updateCharacter(dt, t) {
  const C = CONFIG.character;
  // 键盘微调（可选，WASD 沿屏幕方向）
  let ix = 0, iz = 0;
  if (keys.KeyW || keys.ArrowUp) iz -= 1;
  if (keys.KeyS || keys.ArrowDown) iz += 1;
  if (keys.KeyA || keys.ArrowLeft) ix -= 1;
  if (keys.KeyD || keys.ArrowRight) ix += 1;

  // 目标：鼠标在飞行高度平面上的交点；长时间无鼠标则自动游飞
  let tx = null, tz = null;
  const idleFor = (performance.now() - lastMouseMoveAt) / 1000;
  if (hasMouse && camera && idleFor < C.idleWanderAfter) {
    ndc.set(mouseN.x, -mouseN.y);
    raycaster.setFromCamera(ndc, camera);
    if (raycaster.ray.intersectPlane(flyPlane, hitPoint)) {
      tx = hitPoint.x; tz = hitPoint.z;
      const r = Math.hypot(tx, tz);
      if (r > C.moveRadius) { tx *= C.moveRadius / r; tz *= C.moveRadius / r; }
    }
  } else {
    // 自动游飞（展示；悬停时不打断）
    charState.wanderTimer -= dt;
    if (charState.wanderTimer <= 0) {
      charState.wanderTimer = rand(2.5, 4.5);
      const a = rand(0, TAU), r = Math.sqrt(Math.random()) * 7;
      charState.wanderTarget = { x: Math.cos(a) * r, z: Math.sin(a) * r };
    }
    if (charState.wanderTarget) { tx = charState.wanderTarget.x; tz = charState.wanderTarget.z; }
  }

  let dvx = 0, dvz = 0;
  if (ix || iz) {
    const inv = 1 / Math.hypot(ix, iz);
    dvx = ix * inv * C.speed; dvz = iz * inv * C.speed;
  } else if (tx !== null) {
    const dx = tx - charGroup.position.x;
    const dz = tz - charGroup.position.z;
    const d = Math.hypot(dx, dz);
    if (d > 0.12) {
      const arrive = clamp(d / 1.0, 0, 1);   // 停止缓出
      dvx = dx / d * C.speed * arrive;
      dvz = dz / d * C.speed * arrive;
    }
  }

  const k = 1 - Math.exp(-C.accel * dt);
  charState.vx += (dvx - charState.vx) * k;
  charState.vz += (dvz - charState.vz) * k;
  charGroup.position.x += charState.vx * dt;
  charGroup.position.z += charState.vz * dt;
  const pr = Math.hypot(charGroup.position.x, charGroup.position.z);
  if (pr > C.moveRadius) {
    const s = C.moveRadius / pr;
    charGroup.position.x *= s;
    charGroup.position.z *= s;
  }
  // 飞行高度缓趋
  charGroup.position.y += (FLY_Y - charGroup.position.y) * (1 - Math.exp(-2 * dt));

  charState.speed = Math.hypot(charState.vx, charState.vz);
  charState.speedNorm = clamp(charState.speed / C.speed, 0, 1);
  if (charState.speed > 0.35) {
    charState.heading = angleLerp(charState.heading, Math.atan2(charState.vx, charState.vz), 1 - Math.exp(-9 * dt));
  }
  charGroup.rotation.y = charState.heading;

  let dH = charState.heading - charState.prevHeading;
  dH = ((dH + Math.PI * 3) % TAU) - Math.PI;
  charState.prevHeading = charState.heading;
  charState.roll += (clamp(-dH / Math.max(dt, 1e-4) * 0.10, -0.3, 0.3) - charState.roll) * (1 - Math.exp(-6 * dt));
}

/* ---------------- 蝴蝶动画（振翅 / 悬停 / 转向倾斜 / 触角滞后） ---------------- */
function updateButterfly(dt, t) {
  const sN = charState.speedNorm;

  // 振翅：悬停慢拍小幅，飞行快拍大幅（左右翼反向 → 同步上下）
  fly.phase += dt * (3.4 + 8.5 * sN);
  const f = Math.sin(fly.phase);
  const flapAmp = 0.5 + 0.4 * sN;
  fly.wingR.rotation.z = 0.12 + f * flapAmp;
  fly.wingL.rotation.z = -0.12 - f * flapAmp;

  // 身体：两次振翅一个轻微起伏 + 悬停呼吸
  charInner.position.y = Math.sin(fly.phase * 2 + 0.6) * 0.05 * (0.35 + 0.65 * sN)
    + Math.sin(t * 1.7) * 0.03;
  // 转向倾斜（bank）+ 前倾
  charInner.rotation.z = -charState.roll * 0.9;
  charInner.rotation.x = -0.06 * sN;

  // 触角滞后轻摆
  charState.antLag += (-charState.roll * 0.6 - charState.antLag) * (1 - Math.exp(-3 * dt));
  fly.antL.rotation.z = 0.5 + charState.antLag + Math.sin(t * 2.1) * 0.06;
  fly.antR.rotation.z = -0.5 - charState.antLag + Math.sin(t * 2.3) * 0.06;
}

/* ---------------- 落叶力场更新 ---------------- */
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler();
const _p = new THREE.Vector3(), _s = new THREE.Vector3(), _c = new THREE.Color();
let agitationSum = 0, agitCount = 0;

function updateLeaves(dt, t) {
  const cx = charGroup.position.x, cz = charGroup.position.z;
  const W = I;
  const sN = charState.speedNorm;
  const moving = sN > 0.06;
  const fx = Math.sin(charState.heading), fz = Math.cos(charState.heading);
  const rx = fz, rz = -fx;
  const sf = 0.25 + 0.75 * sN;
  const dampMul = Math.exp(-RC.damping * dt);
  const agitDecay = Math.exp(-RC.agitDecay * dt);
  const airD = Math.exp(-RC.airDrag * dt);
  const rollDamp = Math.exp(-7 * dt);
  const glowDamp = Math.exp(-1.6 * dt);
  agitationSum = 0;
  agitCount = 0;

  for (let i = 0; i < L.count; i++) {
    kickCd[i] -= dt;
    const dx = posX[i] - cx, dz = posZ[i] - cz;
    const u = dx * fx + dz * fz;
    const v = dx * rx + dz * rz;
    let zoneI = 0, frontPush = 0;
    if (moving) {
      if (Math.abs(u) < W.bodyLen && Math.abs(v) < W.bodyWidth) {
        zoneI = 1;
      } else if (u < W.bodyLen * 0.4 && u > -W.wakeLen && Math.abs(v) < W.wakeWidth) {
        const tail = 1 + u / W.wakeLen;
        zoneI = (0.4 + 0.6 * tail) * (1 - 0.35 * Math.abs(v) / W.wakeWidth);
      } else if (u >= W.bodyLen * 0.4 && u < W.bodyLen + 0.9 && Math.abs(v) < W.wakeWidth * 0.85) {
        frontPush = 1 - (u - W.bodyLen * 0.4) / (W.bodyLen * 0.6 + 0.9);
        zoneI = 0.2 + 0.3 * frontPush;
      }
    }

    if (zoneI > 0.08 && kickCd[i] <= 0) {
      kickCd[i] = W.cooldown + rand(0, 0.35);
      const r = Math.random();
      const jx = rand(-0.55, 0.55), jz = rand(-0.55, 0.55);
      const hv = W.hSpeed * sf * zoneI * kickH[i];
      const lat = frontPush > 0 ? (v >= 0 ? 1 : -1) * frontPush * 1.2 : 0;
      const pHigh = W.pHigh * zoneI * sf;
      const pHop = W.pHop * zoneI * sf;
      if (r < pHigh) {
        velY[i] = Math.min(5.0, W.vyHigh * (0.55 + 0.45 * kickV[i]) * (0.55 + 0.45 * sN));
        velX[i] += (fx + jx) * hv * 1.4;
        velZ[i] += (fz + jz) * hv * 1.4;
        rollV[i] = rand(6, 14) * spinSign[i];
        agit[i] = 1;
        glow[i] = 1;
      } else if (r < pHop) {
        velY[i] = Math.min(2.7, W.vyHop * (0.6 + 0.55 * kickV[i]) * (0.6 + 0.4 * sN));
        velX[i] += (fx + jx) * hv * 0.8;
        velZ[i] += (fz + jz) * hv * 0.8;
        rollV[i] = rand(4.5, 9.5) * spinSign[i];
        agit[i] = Math.max(agit[i], 0.7);
        glow[i] = 0.8;
      } else {
        velX[i] += (fx * 0.5 + jx * 0.6 + rx * lat) * hv * 0.75;
        velZ[i] += (fz * 0.5 + jz * 0.6 + rz * lat) * hv * 0.75;
        agit[i] = Math.max(agit[i], 0.35);
      }
    }

    velX[i] += (homeX[i] - posX[i]) * RC.springXZ * dt;
    velZ[i] += (homeZ[i] - posZ[i]) * RC.springXZ * dt;
    velX[i] *= dampMul; velZ[i] *= dampMul;

    const airborne = posY[i] > homeY[i] + 0.02 || velY[i] > 0.5;
    if (airborne) {
      velY[i] -= RC.gravity * dt;
      velY[i] *= dampMul;
      velX[i] *= airD; velZ[i] *= airD;
      roll[i] += rollV[i] * dt;
      glow[i] *= glowDamp;
    } else {
      roll[i] *= rollDamp;
      rollV[i] *= rollDamp;
      glow[i] = 0;
    }
    posX[i] += velX[i] * dt;
    posY[i] += velY[i] * dt;
    posZ[i] += velZ[i] * dt;
    if (posY[i] < homeY[i]) { posY[i] = homeY[i]; velY[i] = 0; }

    agit[i] *= agitDecay;
    agitationSum += agit[i];
    if (agit[i] > 0.05) agitCount++;
    yaw[i] += yawV[i] * dt;

    const a = agit[i];
    const flutter = a * (0.3 + 0.7 * Math.sin(t * fFreq[i] + phase[i]));
    _e.set(flutter * 0.7 + roll[i] * tAx[i], yaw[i], flutter * 0.5 + roll[i] * tAz[i]);
    _q.setFromEuler(_e);
    _p.set(posX[i], posY[i], posZ[i]);
    const scx = sx[i] * (1 + a * 0.12);
    const scz = sz[i] * (1 + a * 0.12);
    _s.set(scx, size[i] * (1 + a * 0.12), scz);
    _m.compose(_p, _q, _s);
    const vv = variantOf[i], ss = slotOf[i];
    const mesh = leafMeshes[vv];
    mesh.setMatrixAt(ss, _m);
    // 颜色 = 每叶基础秋色 + 扰动时的轻微暖金提亮（保持水粉色块）
    const j = i * 3;
    const mixv = Math.min(1, a * 0.9) * 0.22;
    _c.setRGB(
      baseCol[j] + (1.0 - baseCol[j]) * mixv,
      baseCol[j + 1] + (0.94 - baseCol[j + 1]) * mixv,
      baseCol[j + 2] + (0.60 - baseCol[j + 2]) * mixv
    );
    mesh.setColorAt(ss, _c);
    glowAttrs[vv].array[ss] = glow[i];
  }
  leafMeshes.forEach((m, v) => {
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    glowAttrs[v].needsUpdate = true;
  });
}

/* ---------------- 暖金光晕分配（被卷起且空中的枫叶） ---------------- */
function updateHalos(t) {
  let hi = 0;
  for (let i = 0; i < L.count && hi < HALO_POOL; i++) {
    if (glow[i] > 0.4 && posY[i] > homeY[i] + 0.05) {
      const sp = haloPool[hi++];
      sp.visible = true;
      sp.position.set(posX[i], posY[i] + 0.02, posZ[i]);
      const s = size[i] * (3.6 + 0.5 * Math.sin(t * 5 + phase[i])) * (0.55 + 0.45 * glow[i]);
      sp.scale.set(s, s * 0.85, 1);
      sp.material.opacity = 0.55 * glow[i];
    }
  }
  for (let k = hi; k < HALO_POOL; k++) haloPool[k].visible = false;
}

/* ---------------- 调参面板 ---------------- */
(function buildTunePanel() {
  const T = CONFIG.character, Lc = CONFIG.leaves;
  const items = [
    { sec: '蝴蝶' },
    { label: '体型缩放', min: 0.5, max: 1.4, step: 0.01, get: () => T.scale, set: v => { T.scale = v; charGroup.scale.setScalar(v); } },
    { label: '飞行速度', min: 1, max: 8, step: 0.1, get: () => T.speed, set: v => T.speed = v },
    { sec: '卷起物理' },
    { label: '重力', min: 4, max: 18, step: 0.5, get: () => RC.gravity, set: v => RC.gravity = v },
    { label: '高抛初速', min: 2, max: 6, step: 0.1, get: () => I.vyHigh, set: v => I.vyHigh = v },
    { label: '小弹初速', min: 0.6, max: 3.2, step: 0.05, get: () => I.vyHop, set: v => I.vyHop = v },
    { label: '水平弹速', min: 1, max: 5, step: 0.1, get: () => I.hSpeed, set: v => I.hSpeed = v },
    { sec: '尾流范围' },
    { label: '尾流长度', min: 1, max: 4, step: 0.1, get: () => I.wakeLen, set: v => I.wakeLen = v },
    { label: '尾流宽度', min: 0.5, max: 2, step: 0.05, get: () => I.wakeWidth, set: v => I.wakeWidth = v },
    { sec: '扰动概率' },
    { label: '高抛概率', min: 0, max: 0.35, step: 0.01, get: () => I.pHigh, set: v => I.pHigh = v },
    { label: '小弹概率', min: 0, max: 0.6, step: 0.01, get: () => I.pHop, set: v => I.pHop = v },
    { label: '风力', min: 0, max: 1.5, step: 0.05, get: () => CONFIG.wind, set: v => CONFIG.wind = v },
    { sec: '落叶量' },
    { label: '叶子数量', min: 1000, max: 8000, step: 250, get: () => Lc.count, set: v => { Lc.count = Math.round(v); seedLeaves(); }, fmt: v => Math.round(v) + ' 片' },
  ];

  const panel = document.createElement('div');
  panel.style.cssText = `position:fixed;top:14px;right:14px;width:228px;z-index:10;
    font:12px/1.5 "Segoe UI","Microsoft YaHei",sans-serif;color:#4a4238;
    background:rgba(255,252,244,.85);border:1px solid rgba(120,100,70,.18);
    border-radius:12px;padding:10px 12px 12px;backdrop-filter:blur(4px);
    box-shadow:0 4px 18px rgba(80,60,30,.10);user-select:none;`;
  const head = document.createElement('div');
  head.style.cssText = 'display:flex;justify-content:space-between;align-items:center;cursor:pointer;';
  head.innerHTML = '<b style="letter-spacing:.08em">🍁 落叶调参</b><span id="tuneToggle" style="color:#a08650;font-size:11px">收起</span>';
  const body = document.createElement('div');
  body.style.cssText = 'margin-top:6px;';
  panel.appendChild(head); panel.appendChild(body);
  document.body.appendChild(panel);

  let collapsed = true;body.style.display='none';panel.querySelector('#tuneToggle').textContent='展开';
  head.addEventListener('click', () => {
    collapsed = !collapsed;
    body.style.display = collapsed ? 'none' : 'block';
    panel.querySelector('#tuneToggle').textContent = collapsed ? '展开' : '收起';
  });

  const flight = document.createElement('div');
  flight.style.cssText = 'color:#a08650;font-size:11px;margin:2px 0 6px;';
  const updateFlight = () => {
    const hMax = (I.vyHigh * I.vyHigh) / (2 * RC.gravity);
    const tAir = (2 * I.vyHigh) / RC.gravity;
    flight.textContent = `高抛：最高 ≈ ${hMax.toFixed(2)} · 滞空 ≈ ${tAir.toFixed(2)}s`;
  };

  for (const it of items) {
    if (it.sec) {
      const h = document.createElement('div');
      h.style.cssText = 'font-weight:700;color:#6b5a3e;margin:8px 0 3px;letter-spacing:.06em;';
      h.textContent = it.sec;
      body.appendChild(h);
      continue;
    }
    const row = document.createElement('div');
    row.style.cssText = 'margin-bottom:6px;';
    const val = document.createElement('span');
    val.style.cssText = 'float:right;color:#8a6f3e;font-variant-numeric:tabular-nums;';
    const fmt = v => (it.fmt ? it.fmt(v) : (+v).toFixed(it.step < 0.1 ? 2 : 1));
    const inp = document.createElement('input');
    inp.type = 'range';
    inp.min = it.min; inp.max = it.max; inp.step = it.step;
    inp.value = it.get();
    inp.style.cssText = 'width:100%;margin:2px 0 0;accent-color:#d98c3f;cursor:pointer;';
    const sync = () => { val.textContent = fmt(inp.value); };
    inp.addEventListener('input', () => { it.set(+inp.value); sync(); updateFlight(); });
    const label = document.createElement('label');
    label.style.cssText = 'display:block;';
    label.textContent = it.label;
    label.appendChild(val);
    row.appendChild(label); row.appendChild(inp);
    body.appendChild(row);
    sync();
  }
  body.appendChild(flight);
  updateFlight();
})();

/* ---------------- 调试钩子 ---------------- */
window.__test = {
  // 模拟鼠标移动到屏幕坐标（蝴蝶会跟随）
  mouseTo(clientX, clientY) {
    window.dispatchEvent(new PointerEvent('pointermove', { clientX, clientY }));
  },
  moveToWorld(x, z) {
    // 把世界坐标换算成飞行平面上的屏幕坐标（简化：直接投影）
    if (!camera) return;
    const v = new THREE.Vector3(x, FLY_Y, z).project(camera);
    const cx = (v.x * 0.5 + 0.5) * window.innerWidth;
    const cy = (-v.y * 0.5 + 0.5) * window.innerHeight;
    window.dispatchEvent(new PointerEvent('pointermove', { clientX: Math.round(cx), clientY: Math.round(cy) }));
  },
  charPos: () => ({ x: charGroup.position.x, z: charGroup.position.z }),
  charSpeed: () => charState.speed,
  agitation: () => ({ avg: agitationSum / L.count, count: agitCount }),
  ready: () => !!camera && !!charGroup,
  step(seconds, fps = 60) {
    const n = Math.max(1, Math.round(seconds * fps));
    for (let f = 0; f < n; f++) tick(1 / fps);
    if (window.__renderFrame) window.__renderFrame();
    return true;
  },
  shot() {
    if (window.__renderFrame) window.__renderFrame();
    const cv = document.querySelector('#app canvas');
    const c = document.createElement('canvas');
    c.width = 1280;
    c.height = Math.round(cv.height / cv.width * 1280);
    c.getContext('2d').drawImage(cv, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.85);
  },
};

/* ---------------- 主循环 tick ---------------- */
let bookZoom=3.2;
window.addEventListener('wheel',e=>{if(e.target.closest('#tune'))return;e.preventDefault();bookZoom=clamp(bookZoom*Math.exp(e.deltaY*.001),.7,5);},{passive:false});
const bookFit=()=>Math.max(1,1.4/(window.innerWidth/window.innerHeight));
let reportClock=0;
let simTime = 0;
function tick(dt) {
  simTime += dt;
  if (!charGroup) return;
  // 画布尺寸守卫（后台/0尺寸标签页下 TresJS 尺寸追踪会失效）
  if (renderer && (renderer.domElement.width !== window.innerWidth * renderer.getPixelRatio()
    || renderer.domElement.height !== window.innerHeight * renderer.getPixelRatio())) {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  updateCharacter(dt, simTime);
  updateButterfly(dt, simTime);
  updateLeaves(dt, simTime);
  updateHalos(simTime);
  updateAmbientLayers(dt, simTime, camera.position.x, camera.position.z);
  // 相机轻移（视差）：随鼠标位置轻微偏移，保持构图
  camera.position.x += (mouseN.x * 0.5 - camera.position.x) * (1 - Math.exp(-1.5 * dt));
  camera.position.y += (13.8*bookZoom*bookFit() - mouseN.y * 0.3 - camera.position.y) * (1 - Math.exp(-1.5 * dt));
  camera.position.z += (9.4*bookZoom*bookFit()-camera.position.z)*(1-Math.exp(-1.5*dt));
  camera.lookAt(0, 0.4, -0.6);
  const fogDistance=camera.position.length();scene.fog.near=fogDistance+12;scene.fog.far=fogDistance+46;
  reportClock+=dt;if(reportClock>.2){reportClock=0;document.body.dataset.world=JSON.stringify({ready:true,ground:'diary-pages',x:charGroup.position.x,z:charGroup.position.z,speed:charState.speed,agitated:agitCount,leaves:L.count,halos:haloPool.filter(s=>s.visible).length});}
}

/* ---------------- TresJS 渲染层 ---------------- */
let renderer = null, scene = null;
const SceneInside = defineComponent({
  setup() {
    onMounted(() => {
      const three = useTres();
      window.__ctx = three;
      camera = three.camera && three.camera.value !== undefined ? three.camera.value : three.camera;
      renderer = three.renderer && three.renderer.value !== undefined ? three.renderer.value : three.renderer;
      scene = three.scene && three.scene.value !== undefined ? three.scene.value : three.scene;
      window.__renderFrame = () => renderer.render(scene, camera);

      // 光照：暖橙主光 + 冷蓝补光（阴影经冷色半球呈蓝灰，不用纯黑）
      scene.add(new THREE.HemisphereLight('#e8f0fa', '#b0b8c8', 1.25));
      const sun = new THREE.DirectionalLight('#ffd2a0', 1.05);
      sun.position.set(6, 11, 5);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      sun.shadow.camera.left = -16; sun.shadow.camera.right = 16;
      sun.shadow.camera.top = 16; sun.shadow.camera.bottom = -16;
      sun.shadow.camera.near = 2; sun.shadow.camera.far = 40;
      sun.shadow.bias = -0.0006;
      scene.add(sun);
      const fill = new THREE.DirectionalLight('#a8c4e6', 0.3);
      fill.position.set(-6, 6, -4);
      scene.add(fill);
      scene.fog = new THREE.Fog('#d8cebb', 100, 180);

      buildEnvironment(scene);
      buildButterfly(scene);
      leafMeshes.forEach(m => scene.add(m));
      scene.add(farMesh, nearMesh);
      haloPool.forEach(sp => scene.add(sp));
      seedLeaves();
      parent.postMessage({type:'DIARY_WORLD_READY'},location.origin);

      camera.position.set(0,13.8*bookZoom*bookFit(),9.4*bookZoom*bookFit());
      camera.lookAt(0, 0.4, -0.6);

      const { onLoop } = useRenderLoop();
      onLoop(({ delta }) => {
        tick(Math.min(delta, 1 / 24));
      });
    });
    return {};
  },
  template: '<div style="display:none"></div>',
});

const App = defineComponent({
  components: { SceneInside },
  template: `
    <TresCanvas shadows :camera-position="[0, 13.8, 9.4]" :camera-fov="38">
      <SceneInside />
    </TresCanvas>
  `,
});

createApp(App).use(TresJS).mount('#app');
