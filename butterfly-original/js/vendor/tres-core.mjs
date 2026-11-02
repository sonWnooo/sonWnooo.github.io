/**
 * name: @tresjs/core
 * version: v4.3.1
 * (c) 2024
 * description: Declarative ThreeJS using Vue Components
 * author: Alvaro Saburido <hola@alvarosaburido.dev> (https://github.com/alvarosabu/)
 */
var Et = Object.defineProperty;
var Tt = (e, t, n) => t in e ? Et(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var he = (e, t, n) => Tt(e, typeof t != "symbol" ? t + "" : t, n);
import { defineComponent as fe, withAsyncContext as nt, reactive as Se, renderSlot as rt, unref as W, ref as I, computed as K, watchEffect as xe, onUnmounted as J, shallowRef as $, watch as ae, readonly as we, provide as le, inject as St, isRef as xt, useSlots as At, getCurrentInstance as He, onMounted as kt, openBlock as Lt, createElementBlock as Rt, normalizeClass as Ot, normalizeStyle as Dt, createRenderer as jt, h as Ue, Fragment as Bt } from "vue";
import * as ot from "three";
import { Scene as st, Vector3 as Ae, MathUtils as it, MeshBasicMaterial as at, DoubleSide as It, TextureLoader as $t, PerspectiveCamera as be, Camera as Ht, Clock as lt, REVISION as Ut, Color as Z, SRGBColorSpace as Ft, ACESFilmicToneMapping as ct, PCFSoftShadowMap as Wt, NoToneMapping as Nt, WebGLRenderer as ge, Vector2 as ve, Raycaster as zt, BufferAttribute as Gt, Object3D as Vt, ArrowHelper as Yt, Line as qt, BufferGeometry as Fe, Float32BufferAttribute as We, LineBasicMaterial as Kt, Mesh as Jt, BackSide as Qt, DirectionalLightHelper as Xt, PointLightHelper as Zt, SpotLightHelper as en, HemisphereLightHelper as tn } from "three";
import { tryOnScopeDispose as nn, toValue as x, unrefElement as rn, useDevicePixelRatio as on, useWindowSize as sn, useElementSize as an, refDebounced as Ne, usePointer as ln, useElementBounding as cn, createEventHook as D, useFps as un, useMemory as fn, useRafFn as ut } from "@vueuse/core";
const dn = "@tresjs/core", pn = "module", mn = "4.3.1", hn = "pnpm@9.1.4", gn = "Declarative ThreeJS using Vue Components", vn = "Alvaro Saburido <hola@alvarosaburido.dev> (https://github.com/alvarosabu/)", yn = "MIT", _n = {
  type: "git",
  url: "git+https://github.com/Tresjs/tres.git"
}, wn = [
  "vue",
  "3d",
  "threejs",
  "three",
  "threejs-vue"
], bn = !1, Mn = {
  ".": {
    types: "./dist/index.d.ts",
    import: "./dist/tres.js",
    require: "./dist/tres.umd.cjs"
  },
  "./components": {
    types: "./dist/src/components/index.d.ts"
  },
  "./composables": {
    types: "./dist/src/composables/index.d.ts"
  },
  "./types": {
    types: "./dist/src/types/index.d.ts"
  },
  "./utils": {
    types: "./dist/src/utils/index.d.ts"
  },
  "./*": "./*"
}, Pn = "./dist/tres.js", Cn = "./dist/tres.js", En = "./dist/index.d.ts", Tn = [
  "*.d.ts",
  "dist"
], Sn = {
  access: "public"
}, xn = {
  dev: "cd playground/vue && npm run dev",
  "dev:nuxt": "cd playground/nuxt && npm run dev",
  build: "vite build",
  test: "vitest",
  "test:ci": "vitest run",
  "test:ui": "vitest --ui --coverage.enabled=true",
  release: "release-it",
  coverage: "vitest run --coverage",
  lint: "eslint .",
  "lint:fix": "eslint . --fix",
  "docs:dev": "vitepress dev docs",
  "docs:build": "vitepress build docs",
  "docs:serve": "vitepress serve docs",
  "docs:preview": "vitepress preview docs",
  "docs:contributors": "esno scripts/update-contributors.ts"
}, An = {
  three: ">=0.133",
  vue: ">=3.4"
}, kn = {
  "@alvarosabu/utils": "^3.2.0",
  "@vue/devtools-api": "^6.6.3",
  "@vueuse/core": "^11.1.0"
}, Ln = {
  "@release-it/conventional-changelog": "^9.0.0",
  "@stackblitz/sdk": "^1.11.0",
  "@tresjs/cientos": "4.0.3",
  "@tresjs/eslint-config": "^1.4.0",
  "@types/three": "^0.169.0",
  "@typescript-eslint/eslint-plugin": "^8.8.1",
  "@typescript-eslint/parser": "^8.8.1",
  "@vitejs/plugin-vue": "^5.1.4",
  "@vitest/coverage-c8": "^0.33.0",
  "@vitest/coverage-v8": "^2.1.2",
  "@vitest/ui": "^2.1.2",
  "@vue/test-utils": "^2.4.6",
  eslint: "^9.12.0",
  "eslint-plugin-vue": "^9.29.0",
  esno: "^4.8.0",
  gsap: "^3.12.5",
  husky: "^9.1.6",
  jsdom: "^25.0.1",
  kolorist: "^1.8.0",
  ohmyfetch: "^0.4.21",
  pathe: "^1.1.2",
  "release-it": "^17.8.2",
  "rollup-plugin-analyzer": "^4.0.0",
  "rollup-plugin-copy": "^3.5.0",
  "rollup-plugin-visualizer": "^5.12.0",
  sponsorkit: "^0.15.5",
  three: "^0.169.0",
  unocss: "^0.63.4",
  unplugin: "^1.14.1",
  "unplugin-vue-components": "^0.27.4",
  vite: "^5.4.8",
  "vite-plugin-banner": "^0.8.0",
  "vite-plugin-dts": "4.2.4",
  "vite-plugin-inspect": "^0.8.7",
  "vite-plugin-require-transform": "^1.0.21",
  "vite-svg-loader": "^5.1.0",
  vitepress: "1.4.0",
  vitest: "^2.1.2",
  vue: "3.5.12",
  "vue-demi": "^0.14.10"
}, Rn = {
  name: dn,
  type: pn,
  version: mn,
  packageManager: hn,
  description: gn,
  author: vn,
  license: yn,
  repository: _n,
  keywords: wn,
  sideEffects: bn,
  exports: Mn,
  main: Pn,
  module: Cn,
  types: En,
  files: Tn,
  publishConfig: Sn,
  scripts: xn,
  peerDependencies: An,
  dependencies: kn,
  devDependencies: Ln
};
function On(e) {
  const t = { nodes: {}, materials: {} };
  return e && e.traverse((n) => {
    n.name && (t.nodes[n.name] = n), n.material && !t.materials[n.material.name] && (t.materials[n.material.name] = n.material);
  }), t;
}
async function Dn(e, t, n, r, s) {
  const { logError: l } = V(), i = new e();
  return s && s(i), n && n(i), await new Promise((a, c) => {
    i.load(
      t,
      (o) => {
        const f = o;
        f.scene && Object.assign(f, On(f.scene)), a(f);
      },
      r,
      (o) => {
        l("[useLoader] - Failed to load resource", o), c(o);
      }
    );
  });
}
const Yr = /* @__PURE__ */ fe({
  __name: "component",
  props: {
    loader: {},
    url: {}
  },
  async setup(e) {
    let t, n;
    const r = e, s = ([t, n] = nt(() => Se(Dn(r.loader, r.url))), t = await t, n(), t);
    return (l, i) => rt(l.$slots, "default", { data: W(s) });
  }
});
class jn extends ot.Mesh {
  constructor(...n) {
    super(...n);
    he(this, "type", "HightlightMesh");
    he(this, "createTime");
    this.createTime = Date.now();
  }
  onBeforeRender() {
    const r = (Date.now() - this.createTime) / 1e3, i = 1 + 0.07 * Math.sin(2.5 * r);
    this.scale.set(i, i, i);
  }
}
function Me(e) {
  return typeof e > "u";
}
function de(e) {
  return Array.isArray(e);
}
function Bn(e) {
  return typeof e == "number";
}
function ft(e) {
  return typeof e == "string";
}
function G(e) {
  return typeof e == "function";
}
function H(e) {
  return e === Object(e) && !de(e) && !G(e);
}
function N(e) {
  return H(e) && "isObject3D" in e && !!e.isObject3D;
}
function ze(e) {
  return H(e) && "isCamera" in e && !!e.isCamera;
}
function In(e) {
  return H(e) && "isBufferGeometry" in e && !!e.isBufferGeometry;
}
function $n(e) {
  return H(e) && "isMaterial" in e && !!e.isMaterial;
}
function Hn(e) {
  return H(e) && "isLight" in e && !!e.isLight;
}
function Un(e) {
  return H(e) && "isFog" in e && !!e.isFog;
}
function Fn(e) {
  return H(e) && "isScene" in e && !!e.isScene;
}
function re(e) {
  return N(e) || In(e) || $n(e) || Un(e);
}
function Wn(e) {
  return H(e) && !!e.isPrimitive;
}
const dt = (e, t) => {
  for (const n of Object.keys(t))
    t[n] instanceof Object && Object.assign(t[n], dt(e[n], t[n]));
  return Object.assign(e || {}, t), e;
}, Nn = "html,body,base,head,link,meta,style,title,address,article,aside,footer,header,hgroup,h1,h2,h3,h4,h5,h6,nav,section,div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,textarea,details,dialog,menu,summary,template,blockquote,iframe,tfoot", zn = /* @__PURE__ */ Yn(Nn);
function Ge(e) {
  return e && e.nodeType === 1;
}
function oe(e) {
  return e.replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
const Gn = /\B([A-Z])/g;
function Vn(e) {
  return e.replace(Gn, "-$1").toLowerCase();
}
function Yn(e, t) {
  const n = /* @__PURE__ */ Object.create(null), r = e.split(",");
  for (let s = 0; s < r.length; s++)
    n[r[s]] = !0;
  return (s) => !!n[s];
}
const Ve = (e, t) => {
  if (!t)
    return;
  const n = Array.isArray(t) ? t : t.match(/([^[.\]])+/g);
  return n == null ? void 0 : n.reduce((r, s) => r && r[s], e);
}, qn = (e, t, n) => {
  const r = Array.isArray(t) ? t : t.match(/([^[.\]])+/g);
  r && r.reduce((s, l, i) => (s[l] === void 0 && (s[l] = {}), i === r.length - 1 && (s[l] = n), s[l]), e);
};
function pt(e, t) {
  if (Ge(e) && Ge(t)) {
    const s = e.attributes, l = t.attributes;
    return s.length !== l.length ? !1 : Array.from(s).every(({ name: i, value: a }) => t.getAttribute(i) === a);
  }
  if (e === t)
    return !0;
  if (e === null || typeof e != "object" || t === null || typeof t != "object")
    return !1;
  const n = Object.keys(e), r = Object.keys(t);
  if (n.length !== r.length)
    return !1;
  for (const s of n)
    if (!r.includes(s) || !pt(e[s], t[s]))
      return !1;
  return !0;
}
function Kn(e, t) {
  if (!Array.isArray(e) || !Array.isArray(t) || e.length !== t.length)
    return !1;
  for (let n = 0; n < e.length; n++)
    if (!pt(e[n], t[n]))
      return !1;
  return !0;
}
const Jn = Array.isArray;
function Qn(e, t, n, r) {
  const s = (c) => {
    if (c.uuid === t)
      return c;
    for (const o of c.children) {
      const f = s(o);
      if (f)
        return f;
    }
  }, l = s(e);
  if (!l) {
    console.warn("Object with UUID not found in the scene.");
    return;
  }
  let i = l;
  for (let c = 0; c < n.length - 1; c++)
    if (i[n[c]] !== void 0)
      i = i[n[c]];
    else {
      console.warn(`Property path is not valid: ${n.join(".")}`);
      return;
    }
  const a = n[n.length - 1];
  i[a] !== void 0 ? i[a] = r : console.warn(`Property path is not valid: ${n.join(".")}`);
}
function Xn(e) {
  const t = new at({
    color: 11003607,
    // Highlight color, e.g., yellow
    transparent: !0,
    opacity: 0.2,
    depthTest: !1,
    // So the highlight is always visible
    side: It
    // To e
  });
  return new jn(e.geometry.clone(), t);
}
function Zn(e) {
  var n;
  let t = e.value;
  return e.value && ((n = e.value) != null && n.isMesh) && (t = e.value.position), Array.isArray(e.value) && (t = new Ae(...t)), t;
}
function er(e) {
  return "map" in e;
}
function Ye(e) {
  er(e) && e.map && e.map.dispose(), e.dispose();
}
function mt(e) {
  var n, r;
  if (e.parent && ((n = e.removeFromParent) == null || n.call(e)), delete e.__tres, [...e.children].forEach((s) => mt(s)), !(e instanceof st)) {
    const s = e;
    e && ((r = e.dispose) == null || r.call(e)), s.geometry && (s.geometry.dispose(), delete s.geometry), Array.isArray(s.material) ? (s.material.forEach((l) => Ye(l)), delete s.material) : s.material && (Ye(s.material), delete s.material);
  }
}
function tr(e, t) {
  let n = 0;
  for (let r = 0; r < e.length; r++)
    t(e[r], r) && (e[n] = e[r], n++);
  return e.length = n, e;
}
function Pe(e, t) {
  let n = e;
  if (t.includes("-")) {
    const r = t.split("-");
    let s = r.shift();
    for (; n && r.length; )
      s in n ? (n = n[s], s = r.shift()) : s = qe(s, r.shift());
    return { target: n, key: qe(s, ...r) };
  } else
    return { target: n, key: t };
}
function qe(...e) {
  return e.map((t, n) => n === 0 ? t : t.charAt(0).toUpperCase() + t.slice(1)).join("");
}
const Ke = /-\d+$/;
function nr(e, t, n) {
  if (ft(n)) {
    if (Ke.test(n)) {
      const l = n.replace(Ke, ""), { target: i, key: a } = Pe(e, l);
      if (!Array.isArray(i[a])) {
        const c = i[a], o = [];
        o.__tresDetach = () => {
          o.every((f) => Me(f)) && (i[a] = c);
        }, i[a] = o;
      }
    }
    const { target: r, key: s } = Pe(e, n);
    t.__tres.previousAttach = r[s], r[s] = Q(t);
  } else
    t.__tres.previousAttach = n(e, t);
}
function rr(e, t, n) {
  var r, s, l;
  if (ft(n)) {
    const { target: i, key: a } = Pe(e, n), c = t.__tres.previousAttach;
    c === void 0 ? delete i[a] : i[a] = c, "__tresDetach" in i && i.__tresDetach();
  } else
    (s = (r = t.__tres) == null ? void 0 : r.previousAttach) == null || s.call(r, e, t);
  (l = t.__tres) == null || delete l.previousAttach;
}
function z(e, t, n) {
  const r = e;
  return r.__tres = {
    type: "unknown",
    eventCount: 0,
    root: n,
    handlers: {},
    memoizedProps: {},
    objects: [],
    parent: null,
    previousAttach: null,
    ...t
  }, r.__tres.attach || (r.isMaterial ? r.__tres.attach = "material" : r.isBufferGeometry ? r.__tres.attach = "geometry" : r.isFog && (r.__tres.attach = "fog")), r;
}
function ht(e) {
  var n;
  const t = (n = e == null ? void 0 : e.__tres) == null ? void 0 : n.root;
  t && t.render && t.render.canBeInvalidated.value && t.invalidate();
}
function or(e, t, n) {
  var s;
  if (!G(e.setPixelRatio))
    return;
  let r = 0;
  if (de(n) && n.length >= 2) {
    const [l, i] = n;
    r = it.clamp(t, l, i);
  } else Bn(n) ? r = n : r = t;
  r !== ((s = e.getPixelRatio) == null ? void 0 : s.call(e)) && e.setPixelRatio(r);
}
function sr(e, t, n, r, s) {
  const l = [...t.__tres.objects], i = Q(t);
  if (e = Q(e), i === e)
    return !0;
  const a = z(e, t.__tres ?? {}, s), c = t.parent ?? t.__tres.parent ?? null, o = { ...t.__tres.memoizedProps };
  delete o.object;
  for (const f of l)
    gt(f, s), vt(f, s);
  i.__tres.objects = [], r.remove(t);
  for (const [f, y] of Object.entries(o))
    r.patchProp(a, f, a[f], y);
  n(e), r.insert(t, c);
  for (const f of l)
    r.insert(f, t);
  return !0;
}
function Q(e) {
  return Wn(e) ? (e.object.__tres = e.__tres, e.object) : e;
}
function gt(e, t) {
  var r, s, l, i;
  const n = ((r = e.__tres) == null ? void 0 : r.parent) || t.scene.value;
  e.__tres && (e.__tres.parent = null), n && n.__tres && "objects" in n.__tres && tr(n.__tres.objects, (a) => a !== e), (s = e.__tres) != null && s.attach ? rr(n, e, e.__tres.attach) : ((i = (l = e.parent) == null ? void 0 : l.remove) == null || i.call(l, Q(e)), e.parent = null);
}
function vt(e, t) {
  var n;
  (n = e.traverse) == null || n.call(e, (r) => {
    var s;
    t.deregisterCamera(r), (s = t.eventManager) == null || s.deregisterPointerMissedObject(r);
  }), t.deregisterCamera(e), ht(e);
}
async function ir(e, t) {
  const n = new $t(t), r = (s) => new Promise((l, i) => {
    n.load(
      s,
      (a) => l(a),
      () => null,
      () => {
        i(new Error("[useTextures] - Failed to load texture"));
      }
    );
  });
  if (Jn(e)) {
    const s = await Promise.all(e.map((l) => r(l)));
    return e.length > 1 ? s : s[0];
  } else {
    const {
      map: s,
      displacementMap: l,
      normalMap: i,
      roughnessMap: a,
      metalnessMap: c,
      aoMap: o,
      alphaMap: f,
      matcap: y
    } = e;
    return {
      map: s ? await r(s) : null,
      displacementMap: l ? await r(l) : null,
      normalMap: i ? await r(i) : null,
      roughnessMap: a ? await r(a) : null,
      metalnessMap: c ? await r(c) : null,
      aoMap: o ? await r(o) : null,
      alphaMap: f ? await r(f) : null,
      matcap: y ? await r(y) : null
    };
  }
}
const qr = /* @__PURE__ */ fe({
  __name: "component",
  props: {
    map: {},
    displacementMap: {},
    normalMap: {},
    roughnessMap: {},
    metalnessMap: {},
    aoMap: {},
    alphaMap: {},
    matcap: {}
  },
  async setup(e) {
    let t, n;
    const r = e, s = ([t, n] = nt(() => Se(ir(r))), t = await t, n(), t);
    return (l, i) => rt(l.$slots, "default", { textures: W(s) });
  }
}), ar = ({ sizes: e }) => {
  const t = I([]), n = K(
    () => t.value[0]
  ), r = (i) => {
    const a = i instanceof Ht ? i : t.value.find((o) => o.uuid === i);
    if (!a)
      return;
    const c = t.value.filter(({ uuid: o }) => o !== a.uuid);
    t.value = [a, ...c];
  }, s = (i, a = !1) => {
    if (ze(i)) {
      const c = i;
      if (t.value.some(({ uuid: o }) => o === c.uuid))
        return;
      a ? r(c) : t.value.push(c);
    }
  }, l = (i) => {
    if (ze(i)) {
      const a = i;
      t.value = t.value.filter(({ uuid: c }) => c !== a.uuid);
    }
  };
  return xe(() => {
    e.aspectRatio.value && t.value.forEach((i) => {
      !i.manual && (i instanceof be || lr(i)) && (i instanceof be ? i.aspect = e.aspectRatio.value : (i.left = e.width.value * -0.5, i.right = e.width.value * 0.5, i.top = e.height.value * 0.5, i.bottom = e.height.value * -0.5), i.updateProjectionMatrix());
    });
  }), J(() => {
    t.value = [];
  }), {
    camera: n,
    cameras: t,
    registerCamera: s,
    deregisterCamera: l,
    setCameraActive: r
  };
};
function lr(e) {
  return e.hasOwnProperty("isOrthographicCamera") && e.isOrthographicCamera;
}
const Kr = !0, pe = "[TresJS ▲ ■ ●] ";
function cr(...e) {
  typeof e[0] == "string" ? e[0] = pe + e[0] : e.unshift(pe), console.error(...e);
}
function ur(...e) {
  typeof e[0] == "string" ? e[0] = pe + e[0] : e.unshift(pe), console.warn(...e);
}
function fr(e, t) {
}
function V() {
  return {
    logError: cr,
    logWarning: ur,
    logMessage: fr
  };
}
const Ce = I({}), Ee = (e) => Object.assign(Ce.value, e);
function ye() {
  const e = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Set();
  let n = 0, r = !1;
  const s = () => {
    const o = Array.from(e.entries()).sort((f, y) => {
      const u = f[1].priority - y[1].priority;
      return u === 0 ? f[1].addI - y[1].addI : u;
    });
    t.clear(), o.forEach((f) => t.add(f[0]));
  }, l = (o) => {
    e.delete(o), t.delete(o);
  };
  return { on: (o, f = 0) => {
    e.set(o, { priority: f, addI: n++ });
    const y = () => l(o);
    return nn(y), r = !0, {
      off: y
    };
  }, off: l, trigger: (...o) => {
    r && (s(), r = !1), t.forEach((f) => f(...o));
  }, dispose: () => {
    e.clear(), t.clear();
  }, get count() {
    return e.size;
  } };
}
function dr() {
  let e = !0, t = !0, n = !1;
  const r = new lt(!1), s = I(r.running), l = I(!1);
  let i;
  const a = it.generateUUID();
  let c = null;
  const o = ye(), f = ye(), y = ye();
  E();
  let u = {};
  function v(M) {
    u = M;
  }
  function h(M, A, p = 0) {
    switch (A) {
      case "before":
        return o.on(M, p);
      case "render":
        return c || (c = M), f.dispose(), f.on(M);
      case "after":
        return y.on(M, p);
    }
  }
  function g() {
    t && (t = !1, E(), b());
  }
  function d() {
    t = !0, E(), cancelAnimationFrame(i);
  }
  function _() {
    n = !1, E();
  }
  function P() {
    n = !0, E();
  }
  function C() {
    l.value = !0;
  }
  function T() {
    l.value = !1;
  }
  function b() {
    if (!e) {
      i = requestAnimationFrame(b);
      return;
    }
    const M = r.getDelta(), A = r.getElapsedTime(), p = {
      camera: W(u.camera),
      scene: W(u.scene),
      renderer: W(u.renderer),
      raycaster: W(u.raycaster),
      controls: W(u.controls),
      invalidate: u.invalidate,
      advance: u.advance
    }, w = { delta: M, elapsed: A, clock: r, ...p };
    s.value && o.trigger(w), l.value || (f.count ? f.trigger(w) : c && c(w)), s.value && y.trigger(w), i = requestAnimationFrame(b);
  }
  function E() {
    const M = !t && !n;
    r.running !== M && (r.running ? r.stop() : r.start()), s.value = r.running;
  }
  return {
    loopId: a,
    register: (M, A, p) => h(M, A, p),
    start: g,
    stop: d,
    pause: P,
    resume: _,
    pauseRender: C,
    resumeRender: T,
    isRenderPaused: l,
    isActive: s,
    setContext: v,
    setReady: (M) => e = M
  };
}
function ke(e) {
  let t = 0;
  return e.traverse((n) => {
    if (n.isMesh && n.geometry && n.type !== "HightlightMesh") {
      const r = n.geometry, s = r.attributes.position.count * 3 * Float32Array.BYTES_PER_ELEMENT, l = r.index ? r.index.count * Uint32Array.BYTES_PER_ELEMENT : 0, i = r.attributes.normal ? r.attributes.normal.count * 3 * Float32Array.BYTES_PER_ELEMENT : 0, a = r.attributes.uv ? r.attributes.uv.count * 2 * Float32Array.BYTES_PER_ELEMENT : 0, c = s + l + i + a;
      t += c;
    }
  }), t;
}
function pr(e) {
  return (e / 1024).toFixed(2);
}
const mr = Number.parseInt(Ut.replace("dev", ""));
function Jr(e) {
  return typeof e == "number" ? [e, e, e] : e instanceof Ae ? [e.x, e.y, e.z] : e;
}
function hr(e) {
  return e instanceof Z ? e : Array.isArray(e) ? new Z(...e) : new Z(e);
}
const se = {
  realistic: {
    shadows: !0,
    physicallyCorrectLights: !0,
    outputColorSpace: Ft,
    toneMapping: ct,
    toneMappingExposure: 3,
    shadowMap: {
      enabled: !0,
      type: Wt
    }
  },
  flat: {
    toneMapping: Nt,
    toneMappingExposure: 1
  }
};
function gr({
  canvas: e,
  options: t,
  contextParts: { sizes: n, render: r, invalidate: s, advance: l }
}) {
  const i = K(() => ({
    alpha: x(t.alpha) ?? !0,
    depth: x(t.depth),
    canvas: rn(e),
    context: x(t.context),
    stencil: x(t.stencil),
    antialias: x(t.antialias) ?? !0,
    precision: x(t.precision),
    powerPreference: x(t.powerPreference),
    premultipliedAlpha: x(t.premultipliedAlpha),
    preserveDrawingBuffer: x(t.preserveDrawingBuffer),
    logarithmicDepthBuffer: x(t.logarithmicDepthBuffer),
    failIfMajorPerformanceCaveat: x(t.failIfMajorPerformanceCaveat)
  })), a = $(new ge(i.value));
  function c() {
    t.renderMode === "on-demand" && s();
  }
  ae(i, () => {
    a.value.dispose(), a.value = new ge(i.value), c();
  }), ae([n.width, n.height], () => {
    a.value.setSize(n.width.value, n.height.value), c();
  }, {
    immediate: !0
  }), ae(() => t.clearColor, c);
  const { pixelRatio: o } = on(), { logError: f } = V(), u = (() => {
    const h = new ge(), g = {
      shadowMap: {
        enabled: h.shadowMap.enabled,
        type: h.shadowMap.type
      },
      toneMapping: h.toneMapping,
      toneMappingExposure: h.toneMappingExposure,
      outputColorSpace: h.outputColorSpace
    };
    return h.dispose(), g;
  })(), v = x(t.renderMode);
  return v === "on-demand" && s(), v === "manual" && setTimeout(() => {
    l();
  }, 100), xe(() => {
    const h = x(t.preset);
    h && (h in se || f(`Renderer Preset must be one of these: ${Object.keys(se).join(", ")}`), dt(a.value, se[h])), or(a.value, o.value, x(t.dpr)), v === "always" && (r.frames.value = Math.max(1, r.frames.value));
    const g = (P, C) => {
      const T = x(P), b = () => {
        if (h)
          return Ve(se[h], C);
      };
      if (T !== void 0)
        return T;
      const E = b();
      return E !== void 0 ? E : Ve(u, C);
    }, d = (P, C) => qn(a.value, C, g(P, C));
    d(t.shadows, "shadowMap.enabled"), d(t.toneMapping ?? ct, "toneMapping"), d(t.shadowMapType, "shadowMap.type"), mr < 150 && d(!t.useLegacyLights, "physicallyCorrectLights"), d(t.outputColorSpace, "outputColorSpace"), d(t.toneMappingExposure, "toneMappingExposure");
    const _ = g(t.clearColor, "clearColor");
    _ && a.value.setClearColor(
      _ ? hr(_) : new Z(0)
      // default clear color is not easily/efficiently retrievable from three
    );
  }), J(() => {
    a.value.dispose(), a.value.forceContextLoss();
  }), {
    renderer: a
  };
}
function vr(e, t, n = 10) {
  const r = x(e) ? sn() : an(K(() => x(t).parentElement)), s = we(Ne(r.width, n)), l = we(Ne(r.height, n)), i = K(() => s.value / l.value);
  return {
    height: l,
    width: s,
    aspectRatio: i
  };
}
const yr = (e, t) => {
  const n = K(() => t.renderer.value.domElement), r = $([]), { x: s, y: l } = ln({ target: n });
  let i = 0;
  const { width: a, height: c, top: o, left: f } = cn(n), y = ({ x: m, y: S }) => {
    if (n.value)
      return {
        x: (m - f.value) / a.value * 2 - 1,
        y: -((S - o.value) / c.value) * 2 + 1
      };
  }, u = ({ x: m, y: S }) => {
    if (t.camera.value)
      return t.raycaster.value.setFromCamera(new ve(m, S), t.camera.value), r.value = t.raycaster.value.intersectObjects(e.value, !0), r.value;
  }, v = (m) => {
    const S = y({
      x: (m == null ? void 0 : m.clientX) ?? s.value,
      y: (m == null ? void 0 : m.clientY) ?? l.value
    });
    return S ? u(S) || [] : [];
  }, h = D(), g = D(), d = D(), _ = D(), P = D(), C = D(), T = D(), b = D();
  function E(m) {
    const S = {};
    for (const U in m)
      typeof U != "function" && (S[U] = m[U]);
    return S;
  }
  const M = (m, S) => {
    var Be, Ie, $e;
    const U = E(S), ne = new Ae(S == null ? void 0 : S.clientX, S == null ? void 0 : S.clientY, 0).unproject((Be = t.camera) == null ? void 0 : Be.value);
    m.trigger({
      ...U,
      intersections: r.value,
      // The unprojectedPoint is wrong, math needs to be fixed
      unprojectedPoint: ne,
      ray: (Ie = t.raycaster) == null ? void 0 : Ie.value.ray,
      camera: ($e = t.camera) == null ? void 0 : $e.value,
      sourceEvent: S,
      delta: i,
      stopPropagating: !1
    });
  };
  let A;
  const p = (m) => {
    v(m), M(d, m), A = m;
  }, w = () => {
    A && p(A);
  };
  let k, L, R;
  const j = (m) => {
    var S;
    k = (S = r.value[0]) == null ? void 0 : S.object, i = 0, L = new ve(
      (m == null ? void 0 : m.clientX) ?? s.value,
      (m == null ? void 0 : m.clientY) ?? l.value
    ), M(P, m);
  };
  let O, Y = !1;
  const Re = (m) => {
    var S, U, ne;
    m instanceof PointerEvent && (r.value.length === 0 && M(C, m), k === ((S = r.value[0]) == null ? void 0 : S.object) && (R = new ve(
      (m == null ? void 0 : m.clientX) ?? s.value,
      (m == null ? void 0 : m.clientY) ?? l.value
    ), i = L == null ? void 0 : L.distanceTo(R), m.button === 0 ? (M(h, m), O === ((U = r.value[0]) == null ? void 0 : U.object) ? Y = !0 : (O = (ne = r.value[0]) == null ? void 0 : ne.object, Y = !1)) : m.button === 2 && M(T, m)), M(_, m));
  }, Oe = (m) => {
    Y && (M(g, m), O = void 0, Y = !1);
  }, De = (m) => M(d, m), je = (m) => M(b, m);
  return n.value.addEventListener("pointerup", Re), n.value.addEventListener("pointerdown", j), n.value.addEventListener("pointermove", p), n.value.addEventListener("pointerleave", De), n.value.addEventListener("dblclick", Oe), n.value.addEventListener("wheel", je), J(() => {
    n != null && n.value && (n.value.removeEventListener("pointerup", Re), n.value.removeEventListener("pointerdown", j), n.value.removeEventListener("pointermove", p), n.value.removeEventListener("pointerleave", De), n.value.removeEventListener("dblclick", Oe), n.value.removeEventListener("wheel", je));
  }), {
    intersects: r,
    onClick: (m) => h.on(m).off,
    onDblClick: (m) => g.on(m).off,
    onContextMenu: (m) => T.on(m).off,
    onPointerMove: (m) => d.on(m).off,
    onPointerUp: (m) => _.on(m).off,
    onPointerDown: (m) => P.on(m).off,
    onPointerMissed: (m) => C.on(m).off,
    onWheel: (m) => b.on(m).off,
    forceUpdate: w
  };
};
function _e(e, t) {
  if (Array.isArray(e))
    for (const n of e)
      n(t);
  typeof e == "function" && e(t);
}
function _r(e, t, n) {
  var A;
  const r = $(), s = $();
  e && (r.value = e), t && (s.value = t);
  const l = (p) => {
    var w;
    return ((w = p.__tres) == null ? void 0 : w.eventCount) > 0;
  }, i = (p) => {
    var w;
    return ((w = p.children) == null ? void 0 : w.some((k) => i(k))) || l(p);
  }, a = $(((A = r.value) == null ? void 0 : A.children).filter(i) || []);
  function c(p, w) {
    const k = [], L = () => w.stopPropagating = !0;
    w.stopPropagation = L;
    for (const R of w == null ? void 0 : w.intersections) {
      if (w.stopPropagating)
        return;
      w = { ...w, ...R };
      const { object: j } = R;
      w.eventObject = j, _e(j[p], w), k.push(j);
      let O = j.parent;
      for (; O !== null && !w.stopPropagating && !k.includes(O); )
        w.eventObject = O, _e(O[p], w), k.push(O), O = O.parent;
      const Y = Vn(p.slice(2));
      n(Y, { intersection: R, event: w });
    }
  }
  const {
    onClick: o,
    onDblClick: f,
    onContextMenu: y,
    onPointerMove: u,
    onPointerDown: v,
    onPointerUp: h,
    onPointerMissed: g,
    onWheel: d,
    forceUpdate: _
  } = yr(a, t);
  h((p) => c("onPointerUp", p)), v((p) => c("onPointerDown", p)), o((p) => c("onClick", p)), f((p) => c("onDoubleClick", p)), y((p) => c("onContextMenu", p)), d((p) => c("onWheel", p));
  let P = [];
  u((p) => {
    const w = p.intersections.map(({ object: L }) => L), k = p.intersections;
    P.forEach(({ object: L }) => {
      w.includes(L) || (p.intersections = P, c("onPointerLeave", p), c("onPointerOut", p));
    }), p.intersections = k, p.intersections.forEach(({ object: L }) => {
      P.includes(L) || (c("onPointerEnter", p), c("onPointerOver", p));
    }), c("onPointerMove", p), P = p.intersections;
  });
  const C = [];
  g((p) => {
    const w = () => p.stopPropagating = !0;
    p.stopPropagation = w, C.forEach((k) => {
      p.stopPropagating || (p.eventObject = k, _e(k.onPointerMissed, p));
    }), n("pointer-missed", { event: p });
  });
  function T(p) {
    re(p) && N(p) && a.value.push(p);
  }
  function b(p) {
    if (re(p) && N(p)) {
      const w = a.value.indexOf(p);
      w > -1 && a.value.splice(w, 1);
    }
  }
  function E(p) {
    re(p) && N(p) && p.onPointerMissed && C.push(p);
  }
  function M(p) {
    if (re(p) && N(p)) {
      const w = C.indexOf(p);
      w > -1 && C.splice(w, 1);
    }
  }
  return t.eventManager = {
    forceUpdate: _,
    registerObject: T,
    deregisterObject: b,
    registerPointerMissedObject: E,
    deregisterPointerMissedObject: M
  }, {
    forceUpdate: _,
    registerObject: T,
    deregisterObject: b,
    registerPointerMissedObject: E,
    deregisterPointerMissedObject: M
  };
}
function wr(e, t, n = 100) {
  n = n <= 0 ? 100 : n;
  const r = D(), s = /* @__PURE__ */ new Set();
  let l = !1, i = !1, a = null;
  function c() {
    a && clearTimeout(a), !i && !l && e() ? (r.trigger(t), s.forEach((u) => u()), s.clear(), l = !0) : !i && !l && (a = setTimeout(c, n));
  }
  function o() {
    i = !0, a && clearTimeout(a);
  }
  c();
  const f = (u, ...v) => {
    u(...v);
  };
  return {
    on: (u) => {
      if (l)
        return f(u, t), { off: () => {
        } };
      {
        const v = r.on(u);
        return s.add(v.off), r.on(u);
      }
    },
    off: r.off,
    trigger: r.trigger,
    cancel: o
  };
}
const ee = /* @__PURE__ */ new WeakMap();
function yt(e) {
  if (e = e || me(), ee.has(e))
    return ee.get(e);
  const t = 100, n = Date.now(), l = wr(() => {
    if (Date.now() - n >= t)
      return !0;
    {
      const i = e.renderer.value, a = (i == null ? void 0 : i.domElement) || { width: 0, height: 0 };
      return !!(i && a.width > 0 && a.height > 0);
    }
  }, e);
  return ee.set(e, l), l;
}
function Qr(e) {
  const t = me();
  if (t)
    return ee.has(t) ? ee.get(t).on(e) : yt(t).on(e);
}
function br({
  scene: e,
  canvas: t,
  windowSize: n,
  rendererOptions: r,
  emit: s
}) {
  const l = $(e), i = vr(n, t), {
    camera: a,
    cameras: c,
    registerCamera: o,
    deregisterCamera: f,
    setCameraActive: y
  } = ar({ sizes: i, scene: e }), u = {
    mode: I(r.renderMode || "always"),
    priority: I(0),
    frames: I(0),
    maxFrames: 60,
    canBeInvalidated: K(() => u.mode.value === "on-demand" && u.frames.value === 0)
  };
  function v(R = 1) {
    r.renderMode === "on-demand" && (u.frames.value = Math.min(u.maxFrames, u.frames.value + R));
  }
  function h() {
    r.renderMode === "manual" && (u.frames.value = 1);
  }
  const { renderer: g } = gr(
    {
      scene: e,
      canvas: t,
      options: r,
      emit: s,
      // TODO: replace contextParts with full ctx at https://github.com/Tresjs/tres/issues/516
      contextParts: { sizes: i, camera: a, render: u, invalidate: v, advance: h }
    }
  ), d = {
    sizes: i,
    scene: l,
    camera: a,
    cameras: we(c),
    renderer: g,
    raycaster: $(new zt()),
    controls: I(null),
    perf: {
      maxFrames: 160,
      fps: {
        value: 0,
        accumulator: []
      },
      memory: {
        currentMem: 0,
        allocatedMem: 0,
        accumulator: []
      }
    },
    render: u,
    advance: h,
    extend: Ee,
    invalidate: v,
    registerCamera: o,
    setCameraActive: y,
    deregisterCamera: f,
    loop: dr()
  };
  le("useTres", d), d.scene.value.__tres = {
    root: d
  }, d.loop.register(() => {
    a.value && u.frames.value > 0 && (g.value.render(e, a.value), s("render", d.renderer.value)), u.priority.value = 0, u.mode.value === "always" ? u.frames.value = 1 : u.frames.value = Math.max(0, u.frames.value - 1);
  }, "render");
  const { on: _, cancel: P } = yt(d);
  d.loop.setReady(!1), d.loop.start(), _(() => {
    s("ready", d), d.loop.setReady(!0), _r(e, d, s);
  }), J(() => {
    P(), d.loop.stop();
  });
  const C = 100, T = un({ every: C }), { isSupported: b, memory: E } = fn({ interval: C }), M = 160;
  let A = performance.now();
  const p = ({ timestamp: R }) => {
    d.scene.value && (d.perf.memory.allocatedMem = ke(d.scene.value)), R - A >= C && (A = R, d.perf.fps.accumulator.push(T.value), d.perf.fps.accumulator.length > M && d.perf.fps.accumulator.shift(), d.perf.fps.value = T.value, b.value && E.value && (d.perf.memory.accumulator.push(E.value.usedJSHeapSize / 1024 / 1024), d.perf.memory.accumulator.length > M && d.perf.memory.accumulator.shift(), d.perf.memory.currentMem = d.perf.memory.accumulator.reduce((j, O) => j + O, 0) / d.perf.memory.accumulator.length));
  };
  let w = 0;
  const k = 1, { pause: L } = ut(({ delta: R }) => {
    window.__TRES__DEVTOOLS__ && (p({ timestamp: performance.now() }), w += R, w >= k && (window.__TRES__DEVTOOLS__.cb(d), w = 0));
  }, { immediate: !0 });
  return J(() => {
    L();
  }), d;
}
function me() {
  const e = St("useTres");
  if (!e)
    throw new Error("useTresContext must be used together with useTresContextProvider");
  return e;
}
const Xr = me;
function Zr() {
  const {
    camera: e,
    scene: t,
    renderer: n,
    loop: r,
    raycaster: s,
    controls: l,
    invalidate: i,
    advance: a
  } = me();
  r.setContext({
    camera: e,
    scene: t,
    renderer: n,
    raycaster: s,
    controls: l,
    invalidate: i,
    advance: a
  });
  function c(y, u = 0) {
    return r.register(y, "before", u);
  }
  function o(y) {
    return r.register(y, "render");
  }
  function f(y, u = 0) {
    return r.register(y, "after", u);
  }
  return {
    pause: r.pause,
    resume: r.resume,
    pauseRender: r.pauseRender,
    resumeRender: r.resumeRender,
    isActive: r.isActive,
    onBeforeRender: c,
    render: o,
    onAfterRender: f
  };
}
const _t = D(), wt = D(), Le = D(), te = new lt();
let ce = 0, ue = 0;
const { pause: Mr, resume: Je, isActive: Pr } = ut(
  () => {
    _t.trigger({ delta: ce, elapsed: ue, clock: te }), wt.trigger({ delta: ce, elapsed: ue, clock: te }), Le.trigger({ delta: ce, elapsed: ue, clock: te });
  },
  { immediate: !1 }
);
Le.on(() => {
  ce = te.getDelta(), ue = te.getElapsedTime();
});
let Qe = !1;
const eo = () => (Qe || (Qe = !0, Je()), {
  onBeforeLoop: _t.on,
  onLoop: wt.on,
  onAfterLoop: Le.on,
  pause: Mr,
  resume: Je,
  isActive: Pr
});
function to() {
  const { logWarning: e } = V();
  function t(l, i, a) {
    let c = null;
    return l.traverse((o) => {
      o[i] === a && (c = o);
    }), c || e(`Child with ${i} '${a}' not found.`), c;
  }
  function n(l, i, a) {
    const c = [];
    return l.traverse((o) => {
      o[i].includes(a) && c.push(o);
    }), c.length || e(`Children with ${i} '${a}' not found.`), c;
  }
  function r(l, i) {
    return t(l, "name", i);
  }
  function s(l, i) {
    return n(l, "name", i);
  }
  return {
    seek: t,
    seekByName: r,
    seekAll: n,
    seekAllByName: s
  };
}
function Cr(e, t = {}, n = {}) {
  let r = e;
  const s = (a) => {
    r = a;
  };
  let l = new Proxy({}, {});
  const i = {
    has(a, c) {
      return c in t || c in r;
    },
    get(a, c, o) {
      return c in t ? t[c](r) : r[c];
    },
    set(a, c, o) {
      return n[c] ? n[c](o, r, l, s) : r[c] = o, !0;
    }
  };
  return l = new Proxy({}, i), l;
}
const { logError: Xe } = V(), Ze = [
  "onClick",
  "onContextMenu",
  "onPointerMove",
  "onPointerEnter",
  "onPointerLeave",
  "onPointerOver",
  "onPointerOut",
  "onDoubleClick",
  "onPointerDown",
  "onPointerUp",
  "onPointerCancel",
  "onPointerMissed",
  "onLostPointerCapture",
  "onWheel"
], Er = (e) => {
  const t = e.scene.value;
  function n(o, f, y, u) {
    if (u || (u = {}), u.args || (u.args = []), o === "template" || zn(o))
      return null;
    let v = o.replace("Tres", ""), h;
    if (o === "primitive") {
      (!H(u.object) || xt(u.object)) && Xe(
        "Tres primitives need an 'object' prop, whose value is an object or shallowRef<object>"
      ), v = u.object.type;
      const g = {};
      h = Cr(
        u.object,
        {
          object: (_) => _,
          isPrimitive: () => !0,
          __tres: () => g
        },
        {
          object: (_, P, C, T) => {
            sr(_, C, T, { patchProp: l, remove: s, insert: r }, e);
          },
          __tres: (_) => {
            Object.assign(g, _);
          }
        }
      );
    } else {
      const g = Ce.value[v];
      g || Xe(
        `${v} is not defined on the THREE namespace. Use extend to add it to the catalog.`
      ), h = new g(...u.args);
    }
    return h ? (h.isCamera && (u != null && u.position || h.position.set(3, 3, 3), u != null && u.lookAt || h.lookAt(0, 0, 0)), h = z(h, {
      ...h.__tres,
      type: v,
      memoizedProps: u,
      eventCount: 0,
      primitive: o === "primitive",
      attach: u.attach
    }, e), h) : null;
  }
  function r(o, f) {
    var v, h, g;
    if (!o)
      return;
    f = f || t;
    const y = o.__tres ? o : z(o, {}, e), u = f.__tres ? f : z(f, {}, e);
    o = Q(y), f = Q(u), o.__tres && ((v = o.__tres) == null ? void 0 : v.eventCount) > 0 && ((h = e.eventManager) == null || h.registerObject(o)), e.registerCamera(o), (g = e.eventManager) == null || g.registerPointerMissedObject(o), y.__tres.attach ? nr(u, y, y.__tres.attach) : N(o) && N(u) && (u.add(o), o.dispatchEvent({ type: "added" })), y.__tres.parent = u, u.__tres.objects && !u.__tres.objects.includes(y) && u.__tres.objects.push(y);
  }
  function s(o, f) {
    var h, g, d, _;
    if (!o)
      return;
    o != null && o.__tres && ((h = o.__tres) == null ? void 0 : h.eventCount) > 0 && ((g = e.eventManager) == null || g.deregisterObject(o)), f = Me(f) ? "default" : f;
    const y = (d = o.__tres) == null ? void 0 : d.dispose;
    Me(y) || (y === null ? f = !1 : f = y);
    const u = (_ = o.__tres) == null ? void 0 : _.primitive, v = f === "default" ? !u : !!f;
    if (o.__tres && "objects" in o.__tres && [...o.__tres.objects].forEach((P) => s(P, f)), v && o.children && [...o.children].forEach((P) => s(P, f)), gt(o, e), vt(o, e), v && !Fn(o)) {
      if (G(f))
        f(o);
      else if (G(o.dispose))
        try {
          o.dispose();
        } catch {
        }
    }
    "__tres" in o && delete o.__tres;
  }
  function l(o, f, y, u) {
    var P, C;
    if (!o)
      return;
    let v = o, h = f;
    if (o.__tres && (o.__tres.memoizedProps[f] = u), f === "attach") {
      const T = ((P = o.__tres) == null ? void 0 : P.parent) || o.parent;
      s(o), z(o, { attach: u }, e), T && r(o, T);
      return;
    }
    if (f === "dispose") {
      o.__tres || (o = z(o, {}, e)), o.__tres.dispose = u;
      return;
    }
    if (N(o) && h === "blocks-pointer-events") {
      u || u === "" ? o[h] = u : delete o[h];
      return;
    }
    Ze.includes(f) && o.__tres && (o.__tres.eventCount += 1);
    let g = oe(h), d = v == null ? void 0 : v[g];
    if (h === "args") {
      const T = o, b = y ?? [], E = u ?? [], M = ((C = o.__tres) == null ? void 0 : C.type) || o.type;
      M && b.length && !Kn(b, E) && (v = Object.assign(
        T,
        new Ce.value[M](...u)
      ));
      return;
    }
    if (v.type === "BufferGeometry") {
      if (h === "args")
        return;
      v.setAttribute(
        oe(h),
        new Gt(...u)
      );
      return;
    }
    if (h.includes("-") && d === void 0) {
      const T = h.split("-");
      d = T.reduce((b, E) => b[oe(E)], v), h = T.pop(), g = h, d != null && d.set || (v = T.reduce((b, E) => b[oe(E)], v));
    }
    let _ = u;
    if (_ === "" && (_ = !0), G(d)) {
      Ze.includes(f) || (de(_) ? o[g](..._) : o[g](_)), g.startsWith("on") && G(_) && (v[g] = _);
      return;
    }
    !(d != null && d.set) && !G(d) ? v[g] = _ : d.constructor === _.constructor && (d != null && d.copy) ? d == null || d.copy(_) : de(_) ? d.set(..._) : !d.isColor && d.setScalar ? d.setScalar(_) : d.set(_), ht(o);
  }
  function i(o) {
    var f;
    return ((f = o == null ? void 0 : o.__tres) == null ? void 0 : f.parent) || null;
  }
  function a(o) {
    const f = z(new Vt(), { type: "Comment" }, e);
    return f.name = o, f;
  }
  function c(o) {
    var v;
    const f = i(o), y = ((v = f == null ? void 0 : f.__tres) == null ? void 0 : v.objects) || [], u = y.indexOf(o);
    return u < 0 || u >= y.length - 1 ? null : y[u + 1];
  }
  return {
    insert: r,
    remove: s,
    createElement: n,
    patchProp: l,
    parentNode: i,
    createText: () => void 0,
    createComment: a,
    setText: () => void 0,
    setElementText: () => void 0,
    nextSibling: c,
    querySelector: () => void 0,
    setScopeId: () => void 0,
    cloneNode: () => void 0,
    insertStaticContent: () => void 0
  };
};
function Tr() {
  return bt().__VUE_DEVTOOLS_GLOBAL_HOOK__;
}
function bt() {
  return typeof navigator < "u" && typeof window < "u" ? window : typeof globalThis < "u" ? globalThis : {};
}
const Sr = typeof Proxy == "function", xr = "devtools-plugin:setup", Ar = "plugin:settings:set";
let q, Te;
function kr() {
  var e;
  return q !== void 0 || (typeof window < "u" && window.performance ? (q = !0, Te = window.performance) : typeof globalThis < "u" && (!((e = globalThis.perf_hooks) === null || e === void 0) && e.performance) ? (q = !0, Te = globalThis.perf_hooks.performance) : q = !1), q;
}
function Lr() {
  return kr() ? Te.now() : Date.now();
}
class Rr {
  constructor(t, n) {
    this.target = null, this.targetQueue = [], this.onQueue = [], this.plugin = t, this.hook = n;
    const r = {};
    if (t.settings)
      for (const i in t.settings) {
        const a = t.settings[i];
        r[i] = a.defaultValue;
      }
    const s = `__vue-devtools-plugin-settings__${t.id}`;
    let l = Object.assign({}, r);
    try {
      const i = localStorage.getItem(s), a = JSON.parse(i);
      Object.assign(l, a);
    } catch {
    }
    this.fallbacks = {
      getSettings() {
        return l;
      },
      setSettings(i) {
        try {
          localStorage.setItem(s, JSON.stringify(i));
        } catch {
        }
        l = i;
      },
      now() {
        return Lr();
      }
    }, n && n.on(Ar, (i, a) => {
      i === this.plugin.id && this.fallbacks.setSettings(a);
    }), this.proxiedOn = new Proxy({}, {
      get: (i, a) => this.target ? this.target.on[a] : (...c) => {
        this.onQueue.push({
          method: a,
          args: c
        });
      }
    }), this.proxiedTarget = new Proxy({}, {
      get: (i, a) => this.target ? this.target[a] : a === "on" ? this.proxiedOn : Object.keys(this.fallbacks).includes(a) ? (...c) => (this.targetQueue.push({
        method: a,
        args: c,
        resolve: () => {
        }
      }), this.fallbacks[a](...c)) : (...c) => new Promise((o) => {
        this.targetQueue.push({
          method: a,
          args: c,
          resolve: o
        });
      })
    });
  }
  async setRealTarget(t) {
    this.target = t;
    for (const n of this.onQueue)
      this.target.on[n.method](...n.args);
    for (const n of this.targetQueue)
      n.resolve(await this.target[n.method](...n.args));
  }
}
function Or(e, t) {
  const n = e, r = bt(), s = Tr(), l = Sr && n.enableEarlyProxy;
  if (s && (r.__VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__ || !l))
    s.emit(xr, e, t);
  else {
    const i = l ? new Rr(n, s) : null;
    (r.__VUE_DEVTOOLS_PLUGINS__ = r.__VUE_DEVTOOLS_PLUGINS__ || []).push({
      pluginDescriptor: n,
      setupFn: t,
      proxy: i
    }), i && t(i.proxiedTarget);
  }
}
function Dr(e, t) {
  const n = `▲ ■ ●${e}`;
  typeof et == "function" ? et(n, t) : console.log(n);
}
function et(e, t) {
  throw new Error(e + t);
}
const Mt = (e) => {
  const t = {
    id: e.uuid,
    label: e.type,
    children: [],
    tags: []
  };
  e.name !== "" && t.tags.push({
    label: e.name,
    textColor: 5750629,
    backgroundColor: 15793395
  });
  const n = ke(e);
  return n > 0 && t.tags.push({
    label: `${pr(n)} KB`,
    textColor: 15707189,
    backgroundColor: 16775644,
    tooltip: "Memory usage"
  }), e.type.includes("Light") && (Hn(e) && t.tags.push({
    label: `${e.intensity}`,
    textColor: 9738662,
    backgroundColor: 16316922,
    tooltip: "Intensity"
  }), t.tags.push({
    label: `#${new Z(e.color).getHexString()}`,
    textColor: 9738662,
    backgroundColor: 16316922,
    tooltip: "Color"
  })), e.type.includes("Camera") && (t.tags.push({
    label: `${e.fov}°`,
    textColor: 9738662,
    backgroundColor: 16316922,
    tooltip: "Field of view"
  }), t.tags.push({
    label: `x: ${Math.round(e.position.x)} y: ${Math.round(e.position.y)} z: ${Math.round(e.position.z)}`,
    textColor: 9738662,
    backgroundColor: 16316922,
    tooltip: "Position"
  })), t;
};
function Pt(e, t, n = "") {
  e.children.forEach((r) => {
    if (r.type === "HightlightMesh" || n && !r.type.includes(n) && !r.name.includes(n))
      return;
    const s = Mt(r);
    t.children.push(s), Pt(r, s, n);
  });
}
const jr = [], X = "tres:inspector", Br = Se({
  sceneGraph: null
});
function Ir(e, t) {
  Or(
    {
      id: "dev.esm.tres",
      label: "TresJS 🪐",
      logo: "https://raw.githubusercontent.com/Tresjs/tres/main/public/favicon.svg",
      packageName: "tresjs",
      homepage: "https://tresjs.org",
      componentStateTypes: jr,
      app: e
    },
    (n) => {
      typeof n.now != "function" && Dr(
        "You seem to be using an outdated version of Vue Devtools. Are you still using the Beta release instead of the stable one? You can find the links at https://devtools.vuejs.org/guide/installation.html."
      ), n.addInspector({
        id: X,
        label: "TresJS 🪐",
        icon: "account_tree",
        treeFilterPlaceholder: "Search instances"
      }), setInterval(() => {
        n.sendInspectorTree(X);
      }, 1e3), setInterval(() => {
        n.notifyComponentUpdate();
      }, 5e3), n.on.getInspectorTree((l) => {
        if (l.inspectorId === X) {
          const i = Mt(t.scene.value);
          Pt(t.scene.value, i, l.filter), Br.sceneGraph = i, l.rootNodes = [i];
        }
      });
      let r = null, s = null;
      n.on.getInspectorState((l) => {
        var i;
        if (l.inspectorId === X) {
          const [a] = t.scene.value.getObjectsByProperty("uuid", l.nodeId);
          if (!a)
            return;
          if (s && r && r.parent && s.remove(r), a.isMesh) {
            const c = Xn(a);
            a.add(c), r = c, s = a;
          }
          l.state = {
            object: Object.entries(a).map(([c, o]) => c === "children" ? { key: c, value: o.filter((f) => f.type !== "HightlightMesh") } : { key: c, value: o, editable: !0 }).filter(({ key: c }) => c !== "parent")
          }, a.isScene && (l.state.info = {
            objects: a.children.length,
            memory: ke(a),
            calls: t.renderer.value.info.render.calls,
            triangles: t.renderer.value.info.render.triangles,
            points: t.renderer.value.info.render.points,
            lines: t.renderer.value.info.render.lines
          }, l.state.programs = ((i = t.renderer.value.info.programs) == null ? void 0 : i.map((c) => ({
            key: c.name,
            value: {
              ...c,
              vertexShader: c.vertexShader,
              attributes: c.getAttributes(),
              uniforms: c.getUniforms()
            }
          }))) || []);
        }
      }), n.on.editInspectorState((l) => {
        l.inspectorId === X && Qn(t.scene.value, l.nodeId, l.path, l.state.value);
      });
    }
  );
}
const $r = ["data-scene", "data-tres"], Hr = /* @__PURE__ */ fe({
  __name: "TresCanvas",
  props: {
    shadows: { type: Boolean, default: void 0 },
    clearColor: {},
    toneMapping: {},
    shadowMapType: {},
    useLegacyLights: { type: Boolean, default: void 0 },
    outputColorSpace: {},
    toneMappingExposure: {},
    renderMode: { default: "always" },
    dpr: {},
    camera: {},
    preset: {},
    windowSize: { type: Boolean, default: void 0 },
    enableProvideBridge: { type: Boolean, default: !0 },
    context: {},
    alpha: { type: Boolean, default: void 0 },
    premultipliedAlpha: { type: Boolean },
    antialias: { type: Boolean, default: void 0 },
    stencil: { type: Boolean, default: void 0 },
    preserveDrawingBuffer: { type: Boolean, default: void 0 },
    powerPreference: {},
    depth: { type: Boolean, default: void 0 },
    failIfMajorPerformanceCaveat: { type: Boolean, default: void 0 },
    precision: {},
    logarithmicDepthBuffer: { type: Boolean, default: void 0 },
    reverseDepthBuffer: { type: Boolean }
  },
  emits: [
    "render",
    "click",
    "double-click",
    "context-menu",
    "pointer-move",
    "pointer-up",
    "pointer-down",
    "pointer-enter",
    "pointer-leave",
    "pointer-over",
    "pointer-out",
    "pointer-missed",
    "wheel",
    "ready"
  ],
  setup(e, { expose: t, emit: n }) {
    const r = e, s = n, l = At(), { logWarning: i } = V(), a = I(), c = $(new st()), o = He();
    Ee(ot);
    const f = (g, d = !1) => fe({
      setup() {
        var T;
        const _ = (T = He()) == null ? void 0 : T.appContext;
        _ && (_.app = o == null ? void 0 : o.appContext.app);
        const P = {};
        function C(b) {
          b && (b.parent && C(b.parent), b.provides && Object.assign(P, b.provides));
        }
        return o != null && o.parent && r.enableProvideBridge && (C(o.parent), Reflect.ownKeys(P).forEach((b) => {
          le(b, P[b]);
        })), le("useTres", g), le("extend", Ee), typeof window < "u" && Ir(_ == null ? void 0 : _.app, g), () => Ue(Bt, null, d ? [] : l.default());
      }
    }), y = (g, d = !1) => {
      const _ = f(g, d), { render: P } = jt(Er(g));
      P(Ue(_), c.value);
    }, u = (g, d = !1) => {
      mt(g.scene.value), d && (g.renderer.value.dispose(), g.renderer.value.renderLists.dispose(), g.renderer.value.forceContextLoss()), c.value.__tres = {
        root: g
      };
    }, v = $(null);
    t({ context: v, dispose: () => u(v.value, !0) });
    const h = () => {
      u(v.value), y(v.value, !0);
    };
    return kt(() => {
      const g = a;
      v.value = br({
        scene: c.value,
        canvas: g,
        windowSize: r.windowSize ?? !1,
        rendererOptions: r,
        emit: s
      });
      const { registerCamera: d, camera: _, cameras: P, deregisterCamera: C } = v.value;
      y(v.value);
      const T = () => {
        const b = new be(
          45,
          window.innerWidth / window.innerHeight,
          0.1,
          1e3
        );
        b.position.set(3, 3, 3), b.lookAt(0, 0, 0), d(b);
        const E = xe(() => {
          P.value.length >= 2 && (b.removeFromParent(), C(b), E == null || E());
        });
      };
      ae(
        () => r.camera,
        (b, E) => {
          b && d(b), E && (E.removeFromParent(), C(E));
        },
        {
          immediate: !0
        }
      ), _.value || (i(
        "No camera found. Creating a default perspective camera. To have full control over a camera, please add one to the scene."
      ), T());
    }), J(h), (g, d) => (Lt(), Rt("canvas", {
      ref_key: "canvas",
      ref: a,
      "data-scene": c.value.uuid,
      class: Ot(g.$attrs.class),
      "data-tres": `tresjs ${W(Rn).version}`,
      style: Dt({
        display: "block",
        width: "100%",
        height: "100%",
        position: g.windowSize ? "fixed" : "relative",
        top: 0,
        left: 0,
        pointerEvents: "auto",
        touchAction: "none",
        ...g.$attrs.style
      })
    }, null, 14, $r));
  }
}), Ur = [
  "TresCanvas",
  "TresLeches",
  "TresScene"
], no = {
  template: {
    compilerOptions: {
      isCustomElement: (e) => e.startsWith("Tres") && !Ur.includes(e) || e === "primitive"
    }
  }
}, { logWarning: Fr } = V();
let B = null;
const ro = {
  updated: (e, t) => {
    var s;
    const n = Zn(t);
    if (!n) {
      Fr(`v-distance-to: problem with binding value: ${t.value}`);
      return;
    }
    B && (B.dispose(), e.parent.remove(B));
    const r = n.clone().sub(e.position);
    r.normalize(), B = new Yt(r, e.position, e.position.distanceTo(n), 16776960), e.parent.add(B), console.table(
      [
        ["Distance:", e.position.distanceTo(n)],
        [`origin: ${e.name || e.type}`, `x:${e.position.x}, y:${e.position.y}, z:${(s = e.position) == null ? void 0 : s.z}`],
        [`Destiny: ${e.name || e.type}`, `x:${n.x}, y:${n.y}, z:${n == null ? void 0 : n.z}`]
      ]
    );
  },
  unmounted: (e) => {
    B == null || B.dispose(), e.parent.remove(B);
  }
};
class Ct extends qt {
  constructor(t, n) {
    const r = [1, 1, 0, -1, 1, 0, -1, -1, 0, 1, -1, 0, 1, 1, 0], s = new Fe();
    s.setAttribute("position", new We(r, 3)), s.computeBoundingSphere();
    const l = new Kt({ fog: !1 });
    super(s, l), this.light = t, this.color = n, this.type = "RectAreaLightHelper";
    const i = [1, 1, 0, -1, 1, 0, -1, -1, 0, 1, 1, 0, -1, -1, 0, 1, -1, 0], a = new Fe();
    a.setAttribute("position", new We(i, 3)), a.computeBoundingSphere(), this.add(new Jt(a, new at({ side: Qt, fog: !1 })));
  }
  updateMatrixWorld() {
    if (this.scale.set(0.5 * this.light.width, 0.5 * this.light.height, 1), this.color !== void 0)
      this.material.color.set(this.color), this.children[0].material.color.set(this.color);
    else {
      this.material.color.copy(this.light.color).multiplyScalar(this.light.intensity);
      const t = this.material.color, n = Math.max(t.r, t.g, t.b);
      n > 1 && t.multiplyScalar(1 / n), this.children[0].material.color.copy(this.material.color);
    }
    this.matrixWorld.extractRotation(this.light.matrixWorld).scale(this.scale).copyPosition(this.light.matrixWorld), this.children[0].matrixWorld.copy(this.matrixWorld);
  }
  dispose() {
    this.geometry.dispose(), this.material.dispose(), this.children[0].geometry.dispose(), this.children[0].material.dispose();
  }
}
const { logWarning: tt } = V();
let ie, F;
const Wr = {
  DirectionalLight: Xt,
  PointLight: Zt,
  SpotLight: en,
  HemisphereLight: tn,
  RectAreaLight: Ct
}, oo = {
  mounted: (e) => {
    if (!e.isLight) {
      tt(`${e.type} is not a light`);
      return;
    }
    ie = Wr[e.type], e.parent.add(new ie(e, 1, e.color.getHex()));
  },
  updated: (e) => {
    F = e.parent.children.find((t) => t instanceof ie), !(F instanceof Ct) && F.update();
  },
  unmounted: (e) => {
    if (!e.isLight) {
      tt(`${e.type} is not a light`);
      return;
    }
    F = e.parent.children.find((t) => t instanceof ie), F && F.dispose && F.dispose(), e.parent.remove(F);
  }
}, so = {
  mounted: (e, t) => {
    if (t.arg) {
      console.log(`v-log:${t.arg}`, e[t.arg]);
      return;
    }
    console.log("v-log", e);
  }
}, io = {
  install(e) {
    e.component("TresCanvas", Hr);
  }
};
export {
  Hr as TresCanvas,
  Yr as UseLoader,
  qr as UseTexture,
  Ce as catalogue,
  dr as createRenderLoop,
  io as default,
  mt as dispose,
  Ee as extend,
  Kr as isProd,
  hr as normalizeColor,
  Jr as normalizeVectorFlexibleParam,
  Qr as onTresReady,
  no as templateCompilerOptions,
  On as trasverseObjects,
  ar as useCamera,
  Dn as useLoader,
  V as useLogger,
  Zr as useLoop,
  yr as useRaycaster,
  eo as useRenderLoop,
  gr as useRenderer,
  to as useSeek,
  ir as useTexture,
  Xr as useTres,
  me as useTresContext,
  br as useTresContextProvider,
  _r as useTresEventManager,
  ro as vDistanceTo,
  oo as vLightHelper,
  so as vLog
};
