import {createBlueLeafGame} from './blue-leaf-game.js';
import * as THREE from 'three';
import { referenceMaple } from './reference-maple-geometry.js';
function authoredGeometry(data) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(data.positions, 3));
  geometry.setIndex(data.indices);
  geometry.computeVertexNormals();
  return geometry;
}
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
    count: 5250,          // 地面枫叶数量（已确认固定值）
    capacity: 8000,       // 实例容量上限
    clumps: 30,           // 叶簇数量（自然疏密）
    fieldRadius: 6.2,     // 岛内落叶场半径（岛缘再留奶油边）
    sizeMin: 0.18,
    sizeMax: 0.4,
  },
  ambient: {
    far: 38,              // 稀疏飘叶，保留树木轮廓
    near: 6,              // 少量近景叶
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
    gravity: 7.5,        // 空中重力
    airDrag: 0.35,        // 空中水平阻力
    damping: 2.2,         // 速度阻尼
    agitDecay: 0.5,       // 扰动度衰减
  },
  wind: 0.70,             // 全局风力（已锁定）
  glow: { brightness: 1.4, color: '#ffb01f', radius: 2.4 },
  character: {
    speed: 7.0,           // 最大飞行速度（已锁定）
    accel: 6.0,           // 加速度（飞行更轻盈）
    moveRadius: 5.4,      // 活动半径（岛内）
    scale: 0.74,          // 整体缩放（已锁定）
    idleWanderAfter: 8,   // 鼠标静止后自动游飞（悬停时不游走）
    start: [3.8, 1.8],
  },
};

// Approved flight preset (2026-10-30). Browser preferences cannot override it.
function freezePreset(value){for(const child of Object.values(value))if(child&&typeof child==='object')freezePreset(child);return Object.freeze(value);}
freezePreset(CONFIG);
document.documentElement.dataset.butterflyPreset=JSON.stringify(CONFIG);
document.documentElement.dataset.butterflyLocked='true';
const glowUniforms = {
  uLeafGlowColor: { value: new THREE.Color(CONFIG.glow.color) },
  uLeafGlowBrightness: { value: CONFIG.glow.brightness },
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

/* ---------------- 浮岛顶面贴图（奶油纸底 · 水粉色斑 · 颗粒） ---------------- */
function makeIslandTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 1024;
  const g = c.getContext('2d');
  const blotch = (x, y, r, col) => {
    const rg = g.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, col);
    rg.addColorStop(1, col.replace(/[\d.]+\)$/, '0)'));
    g.fillStyle = rg;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  };
  g.fillStyle = '#f2e8d2';
  g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 12; i++) {
    blotch(rand(0, 1024), rand(0, 1024), rand(120, 300),
      Math.random() < 0.5 ? 'rgba(240,222,184,0.28)' : 'rgba(228,226,212,0.26)');
  }
  for (let i = 0; i < 7; i++) {
    blotch(rand(0, 1024), rand(0, 1024), rand(80, 170), 'rgba(248,240,222,0.30)');
  }
  // 中心略亮、岛缘略暗的水粉晕染
  const rg = g.createRadialGradient(512, 512, 80, 512, 512, 560);
  rg.addColorStop(0, 'rgba(249,242,226,0.55)');
  rg.addColorStop(0.65, 'rgba(240,230,206,0.20)');
  rg.addColorStop(1, 'rgba(206,190,156,0.38)');
  g.fillStyle = rg;
  g.fillRect(0, 0, 1024, 1024);
  // 多尺度土壤色块、沉积斑与短刷痕，避免大面积纯色底。
  for (let i = 0; i < 220; i++) {
    const x = rand(0, 1024), y = rand(0, 1024), r = rand(8, 65);
    g.fillStyle = ['rgba(146,102,67,.12)', 'rgba(183,145,97,.18)',
      'rgba(109,122,136,.10)', 'rgba(255,241,206,.24)'][i % 4];
    g.beginPath();
    for (let j = 0; j < 7; j++) {
      const a = j / 7 * TAU, rr = r * rand(.65, 1.25);
      const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr * .6;
      if (!j) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.closePath(); g.fill();
  }
  g.lineCap = 'round';
  for (let i = 0; i < 1800; i++) {
    const x = rand(0, 1024), y = rand(0, 1024);
    g.strokeStyle = i % 2 ? 'rgba(109,88,63,.10)' : 'rgba(255,248,223,.25)';
    g.lineWidth = rand(.5, 2.5); g.beginPath();g.moveTo(x,y);
    g.lineTo(x + rand(2, 13), y + rand(-2, 2));g.stroke();
  }
  for (let i = 0; i < 4200; i++) {
    const v = Math.random();
    g.fillStyle = v < 0.5 ? 'rgba(255,252,244,0.06)' : 'rgba(150,132,100,0.05)';
    g.fillRect(rand(0, 1024), rand(0, 1024), rand(0.8, 2), rand(0.8, 2));
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function makeSoilRelief() {
  const c = document.createElement('canvas');c.width = c.height = 512;
  const g = c.getContext('2d');g.fillStyle = '#888';g.fillRect(0,0,512,512);
  for (let i=0;i<1600;i++) {
    const x=rand(0,512),y=rand(0,512),r=rand(1,12);
    const v=Math.round(rand(65,190));
    const gradient=g.createRadialGradient(x,y,0,x,y,r);
    gradient.addColorStop(0,`rgba(${v},${v},${v},.7)`);
    gradient.addColorStop(1,`rgba(${v},${v},${v},0)`);
    g.fillStyle=gradient;g.fillRect(x-r,y-r,r*2,r*2);
  }
  return new THREE.CanvasTexture(c);
}

/* ---------------- 环境构建（进同一 three 场景，哑光平滑） ---------------- */
const barkMat = new THREE.MeshLambertMaterial({ color: 0x593015, flatShading: true });
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

/* ---------------- 不规则浮岛轮廓（地面 / 落叶场 / 氛围层共用同一形状） ---------------- */
const ISLAND = {
  R: 7,
  radiusAt(th) {
    const radii = referenceMaple.radii;
    const f = (((th % TAU) + TAU) % TAU) / TAU * radii.length;
    const i = Math.floor(f), t = f - i;
    return radii[i] * (1 - t) + radii[(i + 1) % radii.length] * t;
  },
};
const islandRadiusAt = (x, z) => ISLAND.radiusAt(Math.atan2(z, x));
const insideIsland = (x, z, margin = 0) => Math.hypot(x, z) <= islandRadiusAt(x, z) - margin;

function normalizeUVs(geo) {
  geo.computeBoundingBox();
  const bb = geo.boundingBox;
  const uv = geo.attributes.uv;
  const w = bb.max.x - bb.min.x, h = bb.max.y - bb.min.y;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, (uv.getX(i) - bb.min.x) / w, (uv.getY(i) - bb.min.y) / h);
  }
}

/* ---------------- 参考图主树：细干微弯 + 枝条上扬舒展 + 枝头挂枫叶 ---------------- */
function buildTree(parent) {
  const treeGroup = new THREE.Group();

  treeGroup.name = 'TREE_MAPLE_001';
  const trunk = new THREE.Mesh(authoredGeometry(referenceMaple.tree), barkMat);
  trunk.castShadow = true;
  treeGroup.add(trunk);
  const xf = [];
  const _o = new THREE.Object3D();
  for (const leaf of referenceMaple.attachments) {
    _o.position.fromArray(leaf.position);
    _o.rotation.set(...leaf.rotation);
    _o.scale.setScalar(leaf.scale);
    _o.updateMatrix();
    xf.push(_o.matrix.clone());
  }
  const col = new THREE.Color();
  const white = new THREE.Color(1, 1, 1);
  const treeLeaves = new THREE.InstancedMesh(ambGeo, ambMat, xf.length);
  xf.forEach((m4, i) => {
    treeLeaves.setMatrixAt(i, m4);
    pickLeafColor(col);
    col.lerp(white, 0.06);
    treeLeaves.setColorAt(i, col);
  });
  treeLeaves.castShadow = true;
  treeGroup.add(treeLeaves);

  treeGroup.position.set(-0.3, 0, -1.2);
  parent.add(treeGroup);
  return treeGroup;
}

function buildEnvironment(parent) {
  // —— 不规则浮岛：顶面贴图 + 薄侧沿，四周为黑色虚空 ——
  const SEG = referenceMaple.radii.length;
  const pts2 = [];
  for (let i = 0; i < SEG; i++) {
    const th = (i / SEG) * TAU;
    const r = ISLAND.radiusAt(th);
    pts2.push(new THREE.Vector2(Math.cos(th) * r, -Math.sin(th) * r));  // shape Y 取反 → 旋转后落回世界 XZ
  }
  const islandShape = new THREE.Shape(pts2);
  const topGeo = new THREE.ShapeGeometry(islandShape);
  normalizeUVs(topGeo);
  const top = new THREE.Mesh(topGeo, new THREE.MeshStandardMaterial({
    map: makeIslandTexture(), bumpMap: makeSoilRelief(), bumpScale: .065,
    roughness: .94, metalness: 0,
  }));
  top.name = 'GROUND_MAPLE_001';
  top.rotation.x = -Math.PI / 2;
  top.receiveShadow = true;
  parent.add(top);

  const sideGeo = new THREE.ExtrudeGeometry(islandShape, { depth: 0.15, bevelEnabled: false });
  const side = new THREE.Mesh(sideGeo, new THREE.MeshLambertMaterial({ color: 0xcdbd9c }));
  side.rotation.x = -Math.PI / 2;   // 挤出方向转为竖直
  side.position.y = -0.18;          // 顶盖藏进顶面之下 3cm，只露侧沿
  parent.add(side);

  const treeGroup = buildTree(parent);

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
  rockCluster(-2.0, 0.4, 0.78);
  rockCluster(1.8, -0.7, 0.52);

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
  br.position.set(1.4, 0, 0.4);
  br.rotation.y = 0.25;
  parent.add(br);

  return treeGroup;
}

/* ---------------- 枫叶几何（三种手绘变体）与材质 ---------------- */
function makeMapleGeometry(notch, spread, skew) {
  const geo = authoredGeometry(referenceMaple.leaf);
  const positions = geo.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i), z = positions.getZ(i);
    positions.setXYZ(i, x * spread + skew * .035 * z,
      .018 * Math.abs(x) * (1 - Math.min(1, Math.abs(z) * 1.5)), z * notch);
  }
  geo.computeVertexNormals();
  return geo;
}
const leafGeo = makeMapleGeometry(1.0, 1.0, 0);      // 地面场用
const ambGeo = makeMapleGeometry(0.9, 1.05, 1);      // 空中层用

// 落叶材质：哑光双面；被卷起（vGlow>0）时背面透出柔和金光
const leafMat = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide });
leafMat.onBeforeCompile = (shader) => {
  Object.assign(shader.uniforms, glowUniforms);
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nattribute float aGlow;\nvarying float vGlow;')
    .replace('#include <begin_vertex>', '#include <begin_vertex>\nvGlow = aGlow;');
  const target = 'vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;';
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', '#include <common>\nvarying float vGlow;\nuniform vec3 uLeafGlowColor;\nuniform float uLeafGlowBrightness;')
    .replace(target, target + '\noutgoingLight += uLeafGlowColor * uLeafGlowBrightness * vGlow * (gl_FrontFacing ? 0.75 : 1.0);');
};
const ambMat = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide });

// 秋日枫叶配色（金 / 橙 / 红棕）
const LEAF_COLORS = [
  [0xf0a51e, 0.24],
  [0xe8821c, 0.20],
  [0xf6c433, 0.10],
  [0xd95f1e, 0.18],
  [0xc94a24, 0.12],
  [0xa93b1e, 0.07],
  [0xf2d16b, 0.05],
  [0xb8622a, 0.04],
];
function pickLeafColor(out) {
  let r = Math.random(), acc = 0, c = LEAF_COLORS[0][0];
  for (const [hex, w] of LEAF_COLORS) { acc += w; if (r <= acc) { c = hex; break; } }
  const v = rand(0.9, 1.06);
  out.setHex(c).multiplyScalar(v);
}

/* ---------------- 暖金光晕贴图 + Sprite 池（被卷起叶子的柔光） ---------------- */
const haloTex = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const rg = g.createRadialGradient(64, 64, 4, 64, 64, 62);
  rg.addColorStop(0, 'rgba(255,255,255,0.9)');
  rg.addColorStop(0.20, 'rgba(255,255,255,0.48)');
  rg.addColorStop(0.55, 'rgba(255,255,255,0.12)');
  rg.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = rg;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
})();
const HALO_POOL = 96;
const haloPool = [];
for (let i = 0; i < HALO_POOL; i++) {
  const m = new THREE.SpriteMaterial({
    map: haloTex, color: 0xffc372, transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
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
    const rr = c < 5 ? Math.sqrt(Math.random()) * 3.5 : Math.sqrt(Math.random()) * (L.fieldRadius - 3);
    let cx2 = Math.cos(a) * rr, cz2 = Math.sin(a) * rr;
    const dEdge = islandRadiusAt(cx2, cz2) - 1.2;   // 簇心收进岛内
    const dd = Math.hypot(cx2, cz2);
    if (dd > dEdge) { cx2 *= dEdge / dd; cz2 *= dEdge / dd; }
    clumps.push({ x: cx2, z: cz2, r: rand(1.0, 3.0) });
  }
  const vCount = [0, 0, 0];
  for (let i = 0; i < count; i++) {
    const vv = i % LEAF_V;
    variantOf[i] = vv;
    slotOf[i] = vCount[vv]++;
    let hx, hz;
    if (Math.random() < 0.06) {
      // 少量叶散落在岛缘之外（参考图黑边上的散叶）
      const a = rand(0, TAU);
      const re = ISLAND.radiusAt(a) + rand(0.15, 1.0);
      hx = Math.cos(a) * re;
      hz = Math.sin(a) * re;
    } else {
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
      const Rm = islandRadiusAt(hx, hz) - rand(0.35, 0.85);   // 贴岛缘留出奶油边
      const d = Math.hypot(hx, hz);
      if (d > Rm) { hx *= Rm / d; hz *= Rm / d; }
    }
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
    const a = rand(0, TAU), r = rand(1.5, 9.5);
    farState.push({
      x: Math.cos(a) * r, z: Math.sin(a) * r, y: rand(0.3, 7),
      fall: rand(0.25, 0.55), ph: rand(0, TAU),
      rs: rand(0.6, 1.6) * (Math.random() < 0.5 ? -1 : 1),
      sc: rand(0.45, 0.7), roll: rand(0, TAU), phase: 'fall', restT: 0, bounced: false,
    });
    pickLeafColor(col);
    col.lerp(new THREE.Color(1, 1, 1), 0.04);
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
  const a = rand(0, TAU), r = rand(1.5, 9.5);
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
      if (f.y < -6) {
        respawnFar(f);   // 飘出岛缘：坠入虚空后重生
      } else if (f.y <= 0.05 && insideIsland(f.x, f.z, 0.05)) {
        if (!f.bounced) { f.bounced = true; f.y = 0.05; f.phase = 'bounce'; }
        else { f.y = 0.04; f.phase = 'rest'; f.restT = rand(7, 16); }
      }
    } else if (f.phase === 'bounce') {
      f.y += f.fall * 1.05 * dt;
      if (f.y >= 0.05 + f.fall * 0.1) f.phase = 'fall2';
    } else if (f.phase === 'fall2') {
      f.y -= f.fall * 0.5 * dt;
      if (f.y < -6) respawnFar(f);
      else if (f.y <= 0.04 && insideIsland(f.x, f.z, 0.05)) { f.y = 0.04; f.phase = 'rest'; f.restT = rand(7, 16); }
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
      if (n.y < -6) { n.phase = 'wait'; n.restT = rand(0.5, 2); }
      else if (n.y <= 0.08 && insideIsland(n.x, n.z, 0.05)) { n.y = 0.08; n.phase = 'rest'; n.restT = rand(1.5, 3); }
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

function updateCharacter(dt,t){
  const C=CONFIG.character;
  const ix=Number(keys.KeyD||keys.ArrowRight)-Number(keys.KeyA||keys.ArrowLeft);
  const iz=Number(keys.KeyS||keys.ArrowDown)-Number(keys.KeyW||keys.ArrowUp);
  if(ix||iz)hasMouse=true;
  let tx=null,tz=null;
  if(hasMouse&&camera){
    camera.updateMatrixWorld(true);ndc.set(clamp(mouseN.x,-1,1),-clamp(mouseN.y,-1,1));raycaster.setFromCamera(ndc,camera);
    if(raycaster.ray.intersectPlane(flyPlane,hitPoint)){tx=hitPoint.x;tz=hitPoint.z;}
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
    if (CONFIG.glow.brightness > 0 && glow[i] > 0.2 && posY[i] > homeY[i] + 0.05) {
      const sp = haloPool[hi++];
      sp.visible = true;
      sp.position.set(posX[i], posY[i] + 0.02, posZ[i]);
      const s = size[i] * (CONFIG.glow.radius + 0.5 * Math.sin(t * 5 + phase[i])) * (0.55 + 0.45 * glow[i]);
      sp.scale.set(s, s * 0.85, 1);
      sp.material.color.copy(glowUniforms.uLeafGlowColor.value);
      sp.material.opacity = Math.min(1, .32 * CONFIG.glow.brightness) * glow[i];
    }
  }
  for (let k = hi; k < HALO_POOL; k++) haloPool[k].visible = false;
}

/* Flight preset is fixed; no tuning controls are created. */

/* ---------------- 调试钩子 ---------------- */
window.__test = {
  glowSettings: () => ({ ...CONFIG.glow }),
  glowState: () => ({ airborne: Array.from(glow.subarray(0, L.count)).filter(v => v > 0).length,
    halos: haloPool.filter(s => s.visible).length, uniformBrightness: glowUniforms.uLeafGlowBrightness.value,
    uniformColor: '#' + glowUniforms.uLeafGlowColor.value.getHexString() }),
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
function fitFlightCamera(){
  const factor=Math.max(1,.95/(window.innerWidth/window.innerHeight));
  camera.position.set(0,.5+12*factor,-.5+16.5*factor);camera.lookAt(0,.5,-.5);camera.updateMatrixWorld(true);
}
let simTime = 0;
function tick(dt) {
  if(blueLeafGame?.paused)return;
  simTime += dt;
  if (!charGroup) return;
  // 画布尺寸守卫（后台/0尺寸标签页下 TresJS 尺寸追踪会失效）
  if (renderer && (renderer.domElement.width !== window.innerWidth * renderer.getPixelRatio()
    || renderer.domElement.height !== window.innerHeight * renderer.getPixelRatio())) {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();fitFlightCamera();
  }
  updateCharacter(dt, simTime);
  updateButterfly(dt, simTime);
  if (treeSwayGroup) {
    treeSwayGroup.rotation.z = Math.sin(simTime * 0.55) * 0.006 + Math.sin(simTime * 0.23 + 1.3) * 0.004;
  }
  updateLeaves(dt, simTime);
  updateHalos(simTime);
  updateAmbientLayers(dt, simTime, camera.position.x, camera.position.z);
  blueLeafGame?.update(dt,hasMouse);
}

/* ---------------- TresJS 渲染层 ---------------- */
let renderer = null, scene = null, treeSwayGroup = null,blueLeafGame=null;
const SceneInside = defineComponent({
  setup() {
    onMounted(() => {
      const three = useTres();
      window.__ctx = three;
      camera = three.camera && three.camera.value !== undefined ? three.camera.value : three.camera;
      renderer = three.renderer && three.renderer.value !== undefined ? three.renderer.value : three.renderer;
      scene = three.scene && three.scene.value !== undefined ? three.scene.value : three.scene;
      window.__renderFrame = () => renderer.render(scene, camera);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.12;

      // 光照：暖橙主光 + 冷蓝补光（阴影经冷色半球呈蓝灰，不用纯黑）
      scene.add(new THREE.HemisphereLight('#e8f0fa', '#727e98', 0.62));
      const sun = new THREE.DirectionalLight('#ffe1ae', 2.8);
      sun.position.set(-5, 8, -3);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      sun.shadow.camera.left = -16; sun.shadow.camera.right = 16;
      sun.shadow.camera.top = 16; sun.shadow.camera.bottom = -16;
      sun.shadow.camera.near = 2; sun.shadow.camera.far = 40;
      sun.shadow.bias = -0.0006;
      sun.shadow.normalBias = .025;
      sun.shadow.radius = 3;
      scene.add(sun);
      const fill = new THREE.DirectionalLight('#a8c4e6', 0.4);
      fill.position.set(6, 4, 4);
      scene.add(fill);
      const rim = new THREE.DirectionalLight('#ffc77e', 1.1);
      rim.position.set(2, 5, -7);
      scene.add(rim);
      // 浮岛悬浮于黑色虚空（参考图）；局部场景无雾
      scene.background = new THREE.Color('#060606');

      treeSwayGroup = buildEnvironment(scene);
      buildButterfly(scene);
      leafMeshes.forEach(m => scene.add(m));
      scene.add(farMesh, nearMesh);
      haloPool.forEach(sp => scene.add(sp));
      seedLeaves();

  camera.position.set(0, 12.5, 16);
  camera.lookAt(0, 0.5, -0.5);fitFlightCamera();
      blueLeafGame=createBlueLeafGame({THREE,scene,camera,leafGeometry:leafGeo,getButterfly:()=>charGroup,onReset(){hasMouse=false;charState.vx=charState.vz=charState.speed=charState.speedNorm=0;charGroup.position.set(CONFIG.character.start[0],FLY_Y,CONFIG.character.start[1]);for(const key of Object.keys(keys))keys[key]=false;const screen=charGroup.position.clone().project(camera);mouseN.x=screen.x;mouseN.y=-screen.y;}});
      const { onLoop } = useRenderLoop();
      onLoop(({ delta }) => {
        tick(Math.min(delta, 1 / 24));
      });
      // Reveal the embedded game only after its first complete scene is ready.
      requestAnimationFrame(() => requestAnimationFrame(() => {
        renderer.render(scene, camera);
        if (window.parent !== window) window.parent.postMessage({type:'ONE_SECOND_BLUE_LEAF_READY'}, location.origin);
      }));
    });
    return {};
  },
  template: '<div style="display:none"></div>',
});

const App = defineComponent({
  components: { SceneInside },
  template: `
    <TresCanvas shadows :camera-position="[0, 12.5, 16]" :camera-fov="38">
      <SceneInside />
    </TresCanvas>
  `,
});

createApp(App).use(TresJS).mount('#app');
