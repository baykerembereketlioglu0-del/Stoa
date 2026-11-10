// GÖK SUMO — a two-player 3D arena brawler. Everything (textures, sky, clouds, sound) is generated in code.
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

const $ = id => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k;
const rand = (a = 1, b) => b === undefined ? Math.random() * a : a + Math.random() * (b - a);
const TAU = Math.PI * 2, WIN = 5;
const COARSE = matchMedia('(pointer:coarse)').matches;

// ------------------------------------------------------------------ renderer
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas: $('gl'), antialias: false, powerPreference: 'high-performance' }); }
catch (e) { $('err').style.display = 'grid'; throw e; }
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.92;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
let W = innerWidth, H = innerHeight, PR = Math.min(devicePixelRatio || 1, COARSE ? 1.75 : 2);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 900);

// ------------------------------------------------------------------ sky (own shader) -> background + reflections
const NOISE = `
float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float a=.5, s=0.; for(int i=0;i<5;i++){ s+=a*vnoise(p); p=p*2.03+vec2(17.1,3.7); a*=.5; } return s; }`;
const SUN = new THREE.Vector3(-0.42, 0.36, -0.83).normalize();
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, uniforms: { uSun: { value: SUN } },
  vertexShader: `varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `varying vec3 vDir; uniform vec3 uSun; ${NOISE}
  void main(){
    vec3 d = normalize(vDir); float h = d.y, sd = max(dot(d, uSun), 0.);
    vec3 zen = vec3(.06,.16,.44), mid = vec3(.46,.40,.60), hor = vec3(1.55,.72,.30);
    float t = pow(clamp(h,0.,1.), .5);
    vec3 col = mix(hor, mid, smoothstep(0.,.42,t)); col = mix(col, zen, smoothstep(.3,1.,t));
    col += vec3(1.3,.5,.14)*pow(sd,3.)*(1.-t)*1.1;          // warm side of the sky
    col += vec3(1.,.62,.3)*pow(sd,48.)*2.4;                 // halo
    col += vec3(1.,.86,.62)*smoothstep(.9990,.9997,sd)*42.; // sun disc
    vec2 uv = d.xz/(abs(d.y)+.22);                          // high cirrus
    float c = fbm(uv*1.3+vec2(3.1,1.7)); c = smoothstep(.48,.86,c)*smoothstep(.03,.32,h);
    vec3 cc = mix(vec3(.80,.40,.36), vec3(1.7,1.05,.7), pow(sd,1.5));
    col = mix(col, cc, c*.75);
    if(h<0.) col = mix(hor*.9, vec3(.34,.26,.36), smoothstep(0.,-.45,h));
    gl_FragColor = vec4(col,1.);
  }`,
});
{
  const envScene = new THREE.Scene(); envScene.add(new THREE.Mesh(new THREE.SphereGeometry(50, 48, 24), skyMat));
  const cubeRT = new THREE.WebGLCubeRenderTarget(COARSE ? 512 : 1024, { type: THREE.HalfFloatType });
  new THREE.CubeCamera(0.1, 200, cubeRT).update(renderer, envScene);
  scene.background = cubeRT.texture;
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromCubemap(cubeRT.texture).texture; pm.dispose();
}
scene.fog = new THREE.Fog(0xc98a5e, 60, 260);

// lights
const sun = new THREE.DirectionalLight(0xffc890, 5.2); sun.position.copy(SUN).multiplyScalar(60); sun.castShadow = true;
sun.shadow.mapSize.set(COARSE ? 1024 : 2048, COARSE ? 1024 : 2048);
Object.assign(sun.shadow.camera, { left: -13, right: 13, top: 13, bottom: -13, near: 10, far: 120 }); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
scene.add(sun, sun.target, new THREE.HemisphereLight(0xb4c8ff, 0x7a4a34, 0.3));

// cloud sea
const cloudMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, uniforms: { uT: { value: 0 }, uSun: { value: SUN } },
  vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
  fragmentShader: `varying vec3 vW; uniform float uT; uniform vec3 uSun; ${NOISE}
  float dens(vec2 p){ float n = fbm(p + vec2(uT*.012,0.)); return n*.62 + fbm(p*2.6 - vec2(0.,uT*.02) + n)*.38; }
  void main(){
    vec2 p = vW.xz*.022; float d = dens(p), d2 = dens(p + uSun.xz*.06);
    float cover = smoothstep(.30,.62,d);
    float lit = clamp(.62 + (d - d2)*8., 0., 1.);                      // side facing the sun is brighter
    vec3 col = mix(vec3(.40,.27,.38), vec3(1.7,1.02,.66), lit) * (.5 + .7*d);
    float dist = length(vW.xz - cameraPosition.xz), fog = smoothstep(70., 420., dist);
    col = mix(col, vec3(1.35,.66,.30), fog);
    gl_FragColor = vec4(col, mix(cover*.96, 1., fog));
  }`,
});
const clouds = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), cloudMat); clouds.rotation.x = -Math.PI / 2; clouds.position.y = -12; scene.add(clouds);

// ------------------------------------------------------------------ procedural textures
function canvasTex(w, h, draw, srgb = true) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
const marbleTex = canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = '#f4efe8'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 26; i++) { const x = rand(w), y = rand(h), r = rand(60, 200), gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${rand(190, 225) | 0},${rand(180, 212) | 0},${rand(176, 208) | 0},.16)`); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
  for (let v = 0; v < 7; v++) { // veins: a few long diagonal bundles of soft strokes
    let x = rand(w), y = rand(h), a = 0.7 + rand(-0.5, 0.5); x -= Math.cos(a) * 300; y -= Math.sin(a) * 300; const pts = [[x, y]];
    for (let k = 0; k < 44; k++) { a += rand(-0.22, 0.22); x += Math.cos(a) * 16; y += Math.sin(a) * 16; pts.push([x, y]); }
    for (let s = 0; s < 9; s++) { g.beginPath(); pts.forEach(([px, py], k) => { const jx = px + rand(-2.5, 2.5) * s, jy = py + rand(-2.5, 2.5) * s; k ? g.lineTo(jx, jy) : g.moveTo(jx, jy); }); g.strokeStyle = `rgba(${96 + s * 10},${92 + s * 9},${100 + s * 8},${0.20 - s * 0.02})`; g.lineWidth = s === 0 ? (v % 3 === 0 ? 2.2 : 1.2) : 3 + s * 1.6; g.stroke(); }
  }
  for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(190,150,80,${rand(.15, .5)})`; g.fillRect(rand(w), rand(h), rand(1, 2.4), rand(1, 2.4)); }
});
marbleTex.wrapS = marbleTex.wrapT = THREE.MirroredRepeatWrapping; marbleTex.repeat.set(0.55, 0.55); marbleTex.offset.set(0.2, 0.2);
const stoneTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#3a322d'; g.fillRect(0, 0, w, h); for (let i = 0; i < 2600; i++) { const v = rand(30, 90) | 0; g.fillStyle = `rgba(${v + 10},${v},${v - 6},.5)`; g.fillRect(rand(w), rand(h), rand(1, 4), rand(1, 4)); } });
function ballTextures() {
  const map = canvasTex(1024, 512, (g, w, h) => {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#5a5a5a'; g.fillRect(0, h * 0.5 - 30, w, 6); g.fillRect(0, h * 0.5 + 24, w, 6);
    g.strokeStyle = '#6a6a6a'; g.lineWidth = 4; for (let i = 0; i < 8; i++) { const x = (i + 0.5) / 8 * w; g.beginPath(); g.moveTo(x, h * 0.12); g.lineTo(x, h * 0.5 - 30); g.moveTo(x, h * 0.5 + 30); g.lineTo(x, h * 0.88); g.stroke(); }
    g.fillStyle = '#777'; g.fillRect(0, h * 0.12 - 3, w, 5); g.fillRect(0, h * 0.88 - 2, w, 5);
  });
  const emis = canvasTex(1024, 512, (g, w, h) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.fillRect(0, h * 0.5 - 14, w, 28);
    for (let i = 0; i < 8; i++) { const x = (i + 0.5) / 8 * w; g.beginPath(); g.arc(x, h * 0.26, 13, 0, TAU); g.arc(x, h * 0.74, 13, 0, TAU); g.fill(); }
  });
  return { map, emis };
}

// ------------------------------------------------------------------ arena: hex tiles
const R = 1.2, RINGS = 4, SQ3 = Math.sqrt(3), TILE_H = 0.7;
const tiles = [], tileMap = new Map();
for (let q = -RINGS; q <= RINGS; q++) for (let r = Math.max(-RINGS, -q - RINGS); r <= Math.min(RINGS, -q + RINGS); r++) {
  const ring = (Math.abs(q) + Math.abs(r) + Math.abs(q + r)) / 2, tint = rand(0.86, 1);
  const t = { i: tiles.length, q, r, ring, x: R * SQ3 * (q + r / 2), z: R * 1.5 * r, st: 0, y: 0, vy: 0, rx: 0, rz: 0, vrx: 0, vrz: 0, w: 0, rise: 0, rot: (Math.random() * 6 | 0) * Math.PI / 3, col: new THREE.Color(tint, tint * rand(0.97, 1), tint * rand(0.93, 1)) };
  tiles.push(t); tileMap.set(q + ',' + r, t);
}
const tileGeo = new THREE.CylinderGeometry(R * 0.965, R * 0.9, TILE_H, 6).toNonIndexed(); tileGeo.computeVertexNormals();
const tileMesh = new THREE.InstancedMesh(tileGeo, [
  new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.85, metalness: 0.05 }),
  new THREE.MeshStandardMaterial({ map: marbleTex, roughness: 0.2, metalness: 0.0, envMapIntensity: 1.15 }),
  new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.9 }),
], tiles.length);
tileMesh.castShadow = tileMesh.receiveShadow = true; tileMesh.frustumCulled = false; scene.add(tileMesh);
const dummy = new THREE.Object3D(), tmpC = new THREE.Color(), HOT = new THREE.Color(2.6, 0.55, 0.16);
function tileAt(x, z) { // axial rounding
  const rf = z / (1.5 * R), qf = x / (SQ3 * R) - rf / 2; let cx = qf, cz = rf, cy = -cx - cz, rx = Math.round(cx), ry = Math.round(cy), rz = Math.round(cz);
  const dx = Math.abs(rx - cx), dy = Math.abs(ry - cy), dz = Math.abs(rz - cz); if (dx > dy && dx > dz) rx = -ry - rz; else if (dy <= dz) rz = -rx - ry;
  return tileMap.get(rx + ',' + rz);
}
const solid = t => t && (t.st === 0 || t.st === 1);
const supportedAt = (x, z) => solid(tileAt(x, z));
let wave = { x: 0, z: 0, t: -9, amp: 0 };
const bump = (x, z, amp) => { wave = { x, z, t: now, amp }; };
function waveY(x, z) { const k = now - wave.t; if (k > 1.6) return 0; const d = Math.hypot(x - wave.x, z - wave.z) - k * 14; return -wave.amp * Math.exp(-d * d * 0.5) * (1 - k / 1.6); }
let centroid = { x: 0, z: 0 };
function updateCentroid() { let x = 0, z = 0, n = 0; for (const t of tiles) if (t.st === 0) { x += t.x; z += t.z; n++; } centroid = n ? { x: x / n, z: z / n } : { x: 0, z: 0 }; }

// decor: golden halo rings and drifting rocks
const goldMat = new THREE.MeshStandardMaterial({ color: 0xffc56a, metalness: 1, roughness: 0.28 });
const halo = new THREE.Mesh(new THREE.TorusGeometry(13.6, 0.11, 12, 160), goldMat); halo.rotation.x = Math.PI / 2; halo.position.y = -3.2; halo.castShadow = true; scene.add(halo);
const halo2 = new THREE.Mesh(new THREE.TorusGeometry(17.5, 0.07, 8, 160), goldMat); scene.add(halo2);
const rocks = [];
{
  const g = new THREE.IcosahedronGeometry(1, 3), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), n = 1 + 0.22 * Math.sin(x * 3.1 + y * 1.7) * Math.cos(z * 2.7 + x) + 0.12 * Math.sin(y * 7 + z * 5); p.setXYZ(i, x * n, (y > 0 ? y * 0.45 : y * 1.5) * n, z * n); }
  g.computeVertexNormals();
  const m = new THREE.MeshStandardMaterial({ map: stoneTex, color: 0xb9a28e, roughness: 0.95, flatShading: true });
  [[-62, -4, -70, 13], [58, 2, -96, 20], [96, -6, -20, 12], [-104, -2, 14, 16], [10, 8, -150, 28], [-40, -8, 84, 10], [70, -5, 76, 11]].forEach(([x, y, z, s]) => { const r = new THREE.Mesh(g, m); r.position.set(x, y, z); r.scale.setScalar(s); r.rotation.y = rand(TAU); r.userData.y = y; scene.add(r); rocks.push(r); });
}

// ------------------------------------------------------------------ players
const P_COL = [new THREE.Color(0xffb93d), new THREE.Color(0x4aa0ff)], P_GLOW = [[3.2, 1.7, 0.35], [0.45, 1.5, 3.4]], NAMES = ['ALTIN', 'KOBALT'];
const ballGeo = new THREE.SphereGeometry(1, 48, 32), bt = ballTextures();
const balls = [0, 1].map(i => {
  const mat = new THREE.MeshPhysicalMaterial({ color: P_COL[i], metalness: 1, roughness: 0.16, map: bt.map, emissive: new THREE.Color(...P_GLOW[i]), emissiveMap: bt.emis, emissiveIntensity: 1.1, clearcoat: 0.5, clearcoatRoughness: 0.15, envMapIntensity: 1.25 });
  const mesh = new THREE.Mesh(ballGeo, mat); mesh.castShadow = true; scene.add(mesh);
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.25, 1.5, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(...P_GLOW[i]), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; scene.add(ring);
  return { i, pos: new THREE.Vector3(), vel: new THREE.Vector3(), r: 0.72, mass: 1, mesh, ring, dashCd: 0, dashT: 0, titan: 0, rocket: 0, falling: false, out: false, outT: 0, ix: 0, iz: 0, wantDash: false, ai: { x: 0, z: 0 }, landed: true };
});

// power-ups
const PU = [
  { id: 'titan', label: 'DEV', col: [2.4, 0.5, 3.2] }, { id: 'rocket', label: 'ROKET', col: [0.4, 3.0, 1.2] }, { id: 'blast', label: 'ŞOK', col: [3.4, 1.0, 0.2] },
].map(p => ({ ...p, mat: new THREE.MeshStandardMaterial({ color: new THREE.Color(...p.col).multiplyScalar(0.25), emissive: new THREE.Color(...p.col), emissiveIntensity: 1.3, metalness: 0.4, roughness: 0.2 }) }));
const puGeo = new THREE.OctahedronGeometry(0.42, 0), puRingGeo = new THREE.RingGeometry(0.62, 0.72, 40);
let pups = [], nextPu = 0;
function spawnPu() {
  const free = tiles.filter(t => t.st === 0 && !pups.some(p => p.tile === t) && balls.every(b => Math.hypot(b.pos.x - t.x, b.pos.z - t.z) > 2));
  if (!free.length) return; const tile = free[Math.random() * free.length | 0], type = PU[Math.random() * PU.length | 0];
  const mesh = new THREE.Mesh(puGeo, type.mat); mesh.castShadow = true;
  const ring = new THREE.Mesh(puRingGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color(...type.col), transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false })); ring.rotation.x = -Math.PI / 2;
  scene.add(mesh, ring); pups.push({ type, tile, mesh, ring, t: 0 }); ringFx(tile.x, 0.05, tile.z, type.col, 2.2, 0.5);
}
function removePu(p) { scene.remove(p.mesh, p.ring); p.ring.material.dispose(); pups = pups.filter(q => q !== p); }

// ------------------------------------------------------------------ particles + shock rings
const MAXP = 1400, pPos = new Float32Array(MAXP * 3), pCol = new Float32Array(MAXP * 3), pSize = new Float32Array(MAXP);
const pVel = new Float32Array(MAXP * 3), pLife = new Float32Array(MAXP), pMax = new Float32Array(MAXP), pBase = new Float32Array(MAXP * 4), pGrav = new Float32Array(MAXP); let pHead = 0;
const pGeo = new THREE.BufferGeometry(); pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3)); pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3)); pGeo.setAttribute('size', new THREE.BufferAttribute(pSize, 1));
const points = new THREE.Points(pGeo, new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uS: { value: 1 } },
  vertexShader: `attribute float size; attribute vec3 color; varying vec3 vC; uniform float uS; void main(){ vC = color; vec4 mv = modelViewMatrix*vec4(position,1.); gl_PointSize = size*uS/max(-mv.z,.1); gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `varying vec3 vC; void main(){ float d = length(gl_PointCoord-.5); float a = smoothstep(.5,.05,d); gl_FragColor = vec4(vC*a, 1.); }`,
})); points.frustumCulled = false; scene.add(points);
function emit(x, y, z, n, o) {
  for (let k = 0; k < n; k++) {
    const i = pHead; pHead = (pHead + 1) % MAXP; const a = rand(TAU), el = rand(o.elMin ?? -0.2, o.elMax ?? 1), sp = rand(o.sMin ?? 1, o.sMax ?? 6), ce = Math.cos(el * Math.PI / 2);
    pPos[i * 3] = x + rand(-1, 1) * (o.jit ?? 0.1); pPos[i * 3 + 1] = y + rand(-1, 1) * (o.jit ?? 0.1); pPos[i * 3 + 2] = z + rand(-1, 1) * (o.jit ?? 0.1);
    pVel[i * 3] = Math.cos(a) * ce * sp + (o.vx ?? 0); pVel[i * 3 + 1] = Math.sin(el * Math.PI / 2) * sp + (o.vy ?? 0); pVel[i * 3 + 2] = Math.sin(a) * ce * sp + (o.vz ?? 0);
    pLife[i] = pMax[i] = rand(o.lMin ?? 0.3, o.lMax ?? 0.9); pGrav[i] = o.grav ?? 9; const br = rand(0.6, 1.2);
    pBase[i * 4] = o.col[0] * br; pBase[i * 4 + 1] = o.col[1] * br; pBase[i * 4 + 2] = o.col[2] * br; pBase[i * 4 + 3] = rand(o.zMin ?? 0.08, o.zMax ?? 0.22);
  }
}
function updateParticles(dt) {
  for (let i = 0; i < MAXP; i++) {
    if (pLife[i] <= 0) { if (pSize[i] !== 0) { pSize[i] = 0; } continue; }
    pLife[i] -= dt; const k = Math.max(0, pLife[i] / pMax[i]);
    pVel[i * 3 + 1] -= pGrav[i] * dt; const dr = Math.exp(-1.6 * dt); pVel[i * 3] *= dr; pVel[i * 3 + 2] *= dr;
    pPos[i * 3] += pVel[i * 3] * dt; pPos[i * 3 + 1] += pVel[i * 3 + 1] * dt; pPos[i * 3 + 2] += pVel[i * 3 + 2] * dt;
    pCol[i * 3] = pBase[i * 4] * k; pCol[i * 3 + 1] = pBase[i * 4 + 1] * k; pCol[i * 3 + 2] = pBase[i * 4 + 2] * k; pSize[i] = pBase[i * 4 + 3] * (0.4 + 0.6 * k);
  }
  pGeo.attributes.position.needsUpdate = pGeo.attributes.color.needsUpdate = pGeo.attributes.size.needsUpdate = true;
}
const ringGeo = new THREE.RingGeometry(0.955, 1, 72), rings = [...Array(10)].map(() => { const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; m.visible = false; scene.add(m); return { m, t: 0, d: 1, s: 1 }; });
let ringI = 0;
function ringFx(x, y, z, col, scale, dur) { const r = rings[ringI++ % rings.length]; r.m.position.set(x, y, z); r.m.material.color.setRGB(col[0], col[1], col[2]); r.t = 0; r.d = dur; r.s = scale; r.m.visible = true; }

// ------------------------------------------------------------------ post
const rt = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: COARSE ? 2 : 4 });
const composer = new EffectComposer(renderer, rt); composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.5, 0.6, 0.92); composer.addPass(bloom); composer.addPass(new OutputPass());
function resize() {
  W = innerWidth; H = innerHeight; renderer.setPixelRatio(PR); renderer.setSize(W, H, false); composer.setPixelRatio(PR); composer.setSize(W, H);
  camera.aspect = W / H; camera.updateProjectionMatrix(); points.material.uniforms.uS.value = H * PR * 1.1; layoutSplit();
}
addEventListener('resize', resize);
const landscape = () => W >= H;

// ------------------------------------------------------------------ audio (all synthesized)
let ac = null, master, noiseBuf, muted = false, musicOn = false, nextBeat = 0, beatN = 0;
try { muted = localStorage.getItem('goksumo-mute') === '1'; } catch (e) {}
function audioInit() {
  if (ac) { ac.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; ac = new AC();
  const comp = ac.createDynamicsCompressor(); master = ac.createGain(); master.gain.value = muted ? 0 : 0.9; master.connect(comp); comp.connect(ac.destination);
  noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  nextBeat = ac.currentTime + 0.1;
}
function tone(f0, f1, dur, vol, type = 'sine', when = 0) { if (!ac) return; const t = ac.currentTime + when, o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02); }
function noise(dur, vol, f0, f1, q = 1, type = 'bandpass', when = 0) { if (!ac) return; const t = ac.currentTime + when, s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = noiseBuf; s.loop = true; fl.type = type; fl.Q.value = q; fl.frequency.setValueAtTime(f0, t); fl.frequency.exponentialRampToValueAtTime(f1, t + dur); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(fl); fl.connect(g); g.connect(master); s.start(t, Math.random()); s.stop(t + dur + 0.02); }
const sfx = {
  hit(k) { const v = clamp(k, 0.08, 1); tone(150, 42, 0.22, 0.7 * v); noise(0.09, 0.5 * v, 2600, 900, 0.8); tone(880 + rand(200), 760, 0.3, 0.12 * v, 'triangle'); tone(1390 + rand(300), 1250, 0.22, 0.08 * v, 'triangle'); },
  dash() { noise(0.28, 0.32, 500, 3200, 1.2); },
  warn() { tone(520, 500, 0.05, 0.05, 'square'); },
  fall() { noise(0.5, 0.22, 260, 70, 0.7, 'lowpass'); },
  power() { [660, 880, 1320].forEach((f, i) => tone(f, f, 0.14, 0.14, 'triangle', i * 0.07)); },
  blast() { tone(120, 28, 0.7, 0.9); noise(0.5, 0.6, 1800, 200, 0.6, 'lowpass'); },
  ko() { tone(90, 26, 1.0, 0.9); noise(0.8, 0.5, 900, 120, 0.6, 'lowpass'); tone(520, 70, 0.7, 0.16, 'sawtooth'); },
  beep(hi) { tone(hi ? 990 : 660, hi ? 990 : 660, hi ? 0.32 : 0.12, 0.16, 'square'); },
  land() { tone(110, 40, 0.25, 0.5); noise(0.12, 0.2, 800, 300, 0.7); },
  win() { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, f, 0.22, 0.16, 'triangle', i * 0.13)); },
};
function music() { // light pulse: bass + hat, scheduled a little ahead
  if (!ac || !musicOn) return; const step = 60 / 104 / 2;
  while (nextBeat < ac.currentTime + 0.15) {
    const w = nextBeat - ac.currentTime, n = beatN % 16, bass = [55, 55, 82.4, 55, 65.4, 65.4, 98, 65.4, 49, 49, 73.4, 49, 61.7, 61.7, 92.5, 73.4][n];
    if (n % 2 === 0) tone(bass, bass * 0.98, 0.26, 0.2, 'triangle', w); else noise(0.04, 0.05, 7000, 6000, 2, 'highpass', w);
    if (n % 8 === 4) noise(0.12, 0.09, 1800, 900, 0.8, 'bandpass', w);
    if (n % 4 === 0) tone(bass * 4, bass * 4, 0.5, 0.035, 'sine', w);
    nextBeat += step; beatN++;
  }
}

// ------------------------------------------------------------------ game state
let mode = 'demo', state = 'count', botLv = 1, scores = [0, 0], round = 0, stT = 0, roundT = 0, now = 0, timeScale = 1, slowT = 0, hitStop = 0, trauma = 0;
let fallOrder = [], fallIdx = 0, nextFall = 0, pendingEnd = -1, countStep = -1, lastWinner = -1;
const isBot = i => mode === 'demo' || (mode === 'bot' && i === 1);
function banner(txt, sub, hold) { const b = $('banner'); b.innerHTML = txt + (sub ? `<small>${sub}</small>` : ''); b.className = ''; void b.offsetWidth; b.className = hold ? 'hold' : 'show'; }
function flash(a) { const f = $('flash'); f.style.transition = 'none'; f.style.opacity = a; requestAnimationFrame(() => { f.style.transition = 'opacity .5s'; f.style.opacity = 0; }); }
function hud() {
  $('s1').textContent = scores[0]; $('s2').textContent = scores[1];
  [0, 1].forEach(i => { $('pp' + (i + 1)).innerHTML = [...Array(WIN)].map((_, k) => `<i class="${k < scores[i] ? 'on' : ''}"></i>`).join(''); });
}
function fxLabel() { balls.forEach((b, i) => { $('fx' + (i + 1)).textContent = b.titan > 0 ? 'DEV ' + Math.ceil(b.titan) : b.rocket > 0 ? 'ROKET ' + Math.ceil(b.rocket) : ''; }); }
function layoutSplit() { const s = $('split'); if (landscape()) Object.assign(s.style, { left: '50%', top: '18%', width: '1px', height: '64%' }); else Object.assign(s.style, { left: '18%', top: '50%', width: '64%', height: '1px' }); }
function startRound() {
  round++; state = 'count'; stT = 0; countStep = -1; roundT = 0; pendingEnd = -1; fallIdx = 0; nextFall = 6; timeScale = 1; slowT = 0;
  pups.slice().forEach(removePu); nextPu = 4;
  for (const t of tiles) { t.st = 4; t.y = -14; t.vy = 0; t.rx = t.rz = 0; t.w = 0; t.rise = t.ring * 0.07 + rand(0.12); }
  fallOrder = tiles.filter(t => t.ring > 0).sort((a, b) => (b.ring + rand(1.3)) - (a.ring + rand(1.3)));
  const ls = landscape();
  balls.forEach((b, i) => { const s = i ? 1 : -1; b.pos.set(ls ? s * 3.6 : 0, 9, ls ? 0 : -s * 3.6); b.vel.set(0, 0, 0); b.r = 0.72; b.mass = 1; b.titan = b.rocket = 0; b.dashCd = 0.5; b.dashT = 0; b.falling = b.out = false; b.landed = false; b.ix = b.iz = 0; b.wantDash = false; b.mesh.quaternion.identity(); b.mesh.visible = true; });
  if (mode !== 'demo') { hud(); fxLabel(); }
}
function startMatch(m) {
  mode = m; scores = [0, 0]; round = 0; lastWinner = -1; audioInit(); musicOn = true;
  $('menu').classList.add('hide'); $('end').classList.add('hide'); $('score').style.opacity = 1; $('btnMenu').style.display = 'grid';
  $('n2').textContent = m === 'bot' ? 'BOT' : 'KOBALT'; $('dashBtn').style.display = m === 'bot' && COARSE ? 'block' : 'none';
  const h = $('hint'), s = $('split');
  if (m === '2p') { h.textContent = landscape() ? 'Sol yarı ALTIN · Sağ yarı KOBALT · sürükle: yön, dokun: atıl' : 'Alt yarı ALTIN · Üst yarı KOBALT · sürükle: yön, dokun: atıl'; s.style.opacity = 1; }
  else h.textContent = COARSE ? 'Sürükle: yön · ATIL düğmesi ya da kısa dokunuş: fırla' : 'WASD: yön · Boşluk: atıl';
  h.style.opacity = 1; setTimeout(() => { h.style.opacity = 0; s.style.opacity = 0; }, 5200);
  try { document.documentElement.requestFullscreen?.()?.catch?.(() => {}); } catch (e) {}
  startRound();
}
function toMenu() { mode = 'demo'; musicOn = false; $('menu').classList.remove('hide'); $('end').classList.add('hide'); $('score').style.opacity = 0; $('btnMenu').style.display = 'none'; $('dashBtn').style.display = 'none'; $('banner').className = ''; startRound(); }
function endRound(w) {
  state = 'ko'; stT = 0; lastWinner = w; slowT = 0.9; timeScale = 0.22;
  if (mode === 'demo') return;
  if (w >= 0) { scores[w]++; banner('KO!', NAMES_NOW()[w] + ' raundu aldı'); } else banner('BERABERE');
  hud(); flash(0.5); sfx.ko();
}
const NAMES_NOW = () => mode === 'bot' ? ['ALTIN', 'BOT'] : NAMES;
function endMatch(w) {
  state = 'end'; musicOn = false; sfx.win(); $('endTitle').textContent = NAMES_NOW()[w] + ' KAZANDI'; $('endTitle').style.color = w ? 'var(--cobalt)' : 'var(--gold)';
  $('endSub').textContent = `Skor ${scores[0]} – ${scores[1]} · ${round} raund`; $('end').classList.remove('hide'); $('banner').className = '';
}

// ------------------------------------------------------------------ input
const touches = new Map(), joy = [null, null], keys = {};
const playerAt = (x, y) => mode !== '2p' ? 0 : landscape() ? (x < W / 2 ? 0 : 1) : (y > H / 2 ? 0 : 1);
const JR = 56;
function joyUi(p) { const el = $('joy' + p), j = joy[p]; if (!j) { el.classList.remove('on'); return; } el.classList.add('on'); el.style.left = j.sx + 'px'; el.style.top = j.sy + 'px'; const dx = clamp(j.x - j.sx, -JR, JR), dy = clamp(j.y - j.sy, -JR, JR); el.firstElementChild.style.transform = `translate(${dx}px,${dy}px)`; }
const tl = $('touch');
tl.addEventListener('pointerdown', e => {
  if (mode === 'demo' || state === 'end') return; audioInit(); const p = playerAt(e.clientX, e.clientY);
  if (joy[p]) { balls[p].wantDash = true; touches.set(e.pointerId, { p, dashOnly: true }); return; }
  const j = { p, sx: e.clientX, sy: e.clientY, x: e.clientX, y: e.clientY, t: performance.now(), moved: 0 }; joy[p] = j; touches.set(e.pointerId, j); joyUi(p);
  try { tl.setPointerCapture(e.pointerId); } catch (err) {}
});
tl.addEventListener('pointermove', e => { const j = touches.get(e.pointerId); if (!j || j.dashOnly) return; j.x = e.clientX; j.y = e.clientY; j.moved = Math.max(j.moved, Math.hypot(j.x - j.sx, j.y - j.sy)); const dx = j.x - j.sx, dy = j.y - j.sy, d = Math.hypot(dx, dy); if (d > JR * 1.6) { j.sx += dx / d * (d - JR * 1.6); j.sy += dy / d * (d - JR * 1.6); } joyUi(j.p); });
function pUp(e) { const j = touches.get(e.pointerId); if (!j) return; touches.delete(e.pointerId); if (j.dashOnly) return; if (performance.now() - j.t < 230 && j.moved < 14) balls[j.p].wantDash = true; joy[j.p] = null; joyUi(j.p); }
tl.addEventListener('pointerup', pUp); tl.addEventListener('pointercancel', pUp);
addEventListener('keydown', e => { keys[e.code] = true; if (e.code === 'Space') { balls[0].wantDash = true; e.preventDefault(); } if (e.code === 'Enter' || e.code === 'ShiftRight') balls[1].wantDash = true; });
addEventListener('keyup', e => { keys[e.code] = false; });
$('dashBtn').addEventListener('pointerdown', e => { e.preventDefault(); balls[0].wantDash = true; });
function readInput(b) {
  let x = 0, z = 0; const j = joy[b.i];
  if (j) { x = (j.x - j.sx) / JR; z = (j.y - j.sy) / JR; }
  const k = b.i === 0 ? ['KeyA', 'KeyD', 'KeyW', 'KeyS'] : ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
  if (mode === 'bot' && b.i === 0) { if (keys.ArrowLeft) x -= 1; if (keys.ArrowRight) x += 1; if (keys.ArrowUp) z -= 1; if (keys.ArrowDown) z += 1; }
  if (keys[k[0]]) x -= 1; if (keys[k[1]]) x += 1; if (keys[k[2]]) z -= 1; if (keys[k[3]]) z += 1;
  const m = Math.hypot(x, z); if (m > 1) { x /= m; z /= m; } b.ix = x; b.iz = z;
}

// ------------------------------------------------------------------ bot
function botThink(b, o, dt) {
  const skill = mode === 'demo' ? 0.8 : [0.4, 0.72, 1][botLv], look = 0.26 + 0.14 * skill;
  const danger = !supportedAt(b.pos.x + b.vel.x * look, b.pos.z + b.vel.z * look) || !supportedAt(b.pos.x + b.vel.x * look * 2, b.pos.z + b.vel.z * look * 2) || !supportedAt(b.pos.x, b.pos.z);
  let tx, tz; const dO = Math.hypot(o.pos.x - b.pos.x, o.pos.z - b.pos.z);
  let px = o.pos.x - centroid.x, pz = o.pos.z - centroid.z, pl = Math.hypot(px, pz); if (pl < 0.4) { px = o.pos.x - b.pos.x; pz = o.pos.z - b.pos.z; pl = Math.hypot(px, pz) || 1; } px /= pl; pz /= pl;
  const pu = pups.length && pups.reduce((a, p) => Math.hypot(p.tile.x - b.pos.x, p.tile.z - b.pos.z) < Math.hypot(a.tile.x - b.pos.x, a.tile.z - b.pos.z) ? p : a);
  if (danger && Math.random() < 0.5 + skill) { tx = centroid.x; tz = centroid.z; }
  else if (o.falling || o.out) { tx = centroid.x; tz = centroid.z; }
  else if (pu && Math.hypot(pu.tile.x - b.pos.x, pu.tile.z - b.pos.z) < dO * (0.5 + 0.7 * skill)) { tx = pu.tile.x; tz = pu.tile.z; }
  else {
    const inner = (b.pos.x - o.pos.x) * px + (b.pos.z - o.pos.z) * pz < -0.25;
    if (inner || dO > 4.5) { tx = o.pos.x + px * 0.6; tz = o.pos.z + pz * 0.6; } else { tx = o.pos.x - px * (o.r + b.r + 0.5); tz = o.pos.z - pz * (o.r + b.r + 0.5); }
  }
  let dx = tx - b.pos.x, dz = tz - b.pos.z, dl = Math.hypot(dx, dz) || 1; dx /= dl; dz /= dl;
  if (!danger && !supportedAt(b.pos.x + dx * 1.3, b.pos.z + dz * 1.3)) { const cx = centroid.x - b.pos.x, cz = centroid.z - b.pos.z, cl = Math.hypot(cx, cz) || 1; dx = dx * 0.3 + cx / cl * 0.7; dz = dz * 0.3 + cz / cl * 0.7; }
  if (skill < 0.6) { dx += Math.sin(now * 2.3 + b.i) * 0.35; dz += Math.cos(now * 1.9) * 0.35; }
  const rate = Math.min(1, dt * (3 + 9 * skill)); b.ai.x += (dx - b.ai.x) * rate; b.ai.z += (dz - b.ai.z) * rate; b.ix = b.ai.x; b.iz = b.ai.z;
  if (b.dashCd <= 0 && !b.falling) {
    const ox = (o.pos.x - b.pos.x) / (dO || 1), oz = (o.pos.z - b.pos.z) / (dO || 1);
    if (!o.falling && dO < 3.6 && dO > 1.0 && ox * px + oz * pz > 0.35 && b.ai.x * ox + b.ai.z * oz > 0.75 && supportedAt(b.pos.x + ox * 1.6, b.pos.z + oz * 1.6) && Math.random() < dt * (1.2 + 5 * skill)) b.wantDash = true;
    else if (danger && skill > 0.65 && Math.random() < dt * 6) b.wantDash = true;
  }
}

// ------------------------------------------------------------------ simulation
const tmpV = new THREE.Vector3(), tmpQ = new THREE.Quaternion(), tmpA = new THREE.Vector3();
function applyPu(b, p) {
  const o = balls[1 - b.i]; sfx.power(); emit(p.tile.x, 0.9, p.tile.z, 36, { col: p.type.col, sMin: 2, sMax: 7, lMax: 0.8, zMax: 0.3 }); ringFx(p.tile.x, 0.06, p.tile.z, p.type.col, 4, 0.5);
  if (p.type.id === 'titan') { b.titan = 7; }
  else if (p.type.id === 'rocket') { b.rocket = 6; b.dashCd = 0; }
  else {
    sfx.blast(); trauma = Math.min(1, trauma + 0.8); bump(b.pos.x, b.pos.z, 0.3); ringFx(b.pos.x, 0.08, b.pos.z, p.type.col, 13, 0.7); ringFx(b.pos.x, 0.08, b.pos.z, [3, 2.4, 1.6], 8, 0.5); flash(0.25);
    if (!o.falling) { const dx = o.pos.x - b.pos.x, dz = o.pos.z - b.pos.z, d = Math.hypot(dx, dz) || 1, s = 17 / (1 + d * 0.3) / o.mass; o.vel.x += dx / d * s; o.vel.z += dz / d * s; }
    emit(b.pos.x, 0.4, b.pos.z, 90, { col: p.type.col, sMin: 5, sMax: 15, elMin: 0, elMax: 0.5, lMax: 0.9, zMax: 0.34 });
  }
  if (mode !== 'demo') banner(p.type.label + '!', NAMES_NOW()[b.i]);
  removePu(p);
}
function step(dt) {
  // tiles: rising, scheduled falls
  for (const t of tiles) {
    if (t.st === 4) { const k = clamp((stT - t.rise) / 0.7, 0, 1), e = 1 - Math.pow(1 - k, 3); t.y = -14 * (1 - e); if (k >= 1) { t.st = 0; t.y = 0; } }
    else if (t.st === 1) { t.w -= dt; if (t.w <= 0) { t.st = 2; t.vy = 0; t.vrx = rand(-2, 2); t.vrz = rand(-2, 2); sfx.fall(); emit(t.x, 0, t.z, 14, { col: [2.2, 0.9, 0.35], sMin: 1, sMax: 4, lMax: 0.7 }); pups.filter(p => p.tile === t).forEach(removePu); updateCentroid(); } }
    else if (t.st === 2) { t.vy -= 26 * dt; t.y += t.vy * dt; t.rx += t.vrx * dt; t.rz += t.vrz * dt; if (t.y < -30) t.st = 3; }
  }
  if (state === 'play') {
    roundT += dt;
    if (roundT > nextFall && fallIdx < fallOrder.length) { const t = fallOrder[fallIdx++]; if (t.st === 0) { t.st = 1; t.w = 1.5; sfx.warn(); } nextFall += Math.max(0.3, 1.1 - fallIdx * 0.017); }
    if (roundT > nextPu) { if (pups.length < 2) spawnPu(); nextPu = roundT + rand(5, 8); }
  }
  // players
  for (const b of balls) {
    const o = balls[1 - b.i];
    if (!b.landed) { // drop-in during the countdown
      const k = clamp((stT - 0.75 - b.i * 0.12) / 0.4, 0, 1); b.pos.y = b.r + 8.4 * (1 - k) * (1 - k);
      if (k >= 1) { b.landed = true; b.pos.y = b.r; ringFx(b.pos.x, 0.05, b.pos.z, P_GLOW[b.i], 4.5, 0.5); bump(b.pos.x, b.pos.z, 0.16); emit(b.pos.x, 0.1, b.pos.z, 24, { col: P_GLOW[b.i], sMin: 2, sMax: 6, elMin: 0, elMax: 0.4 }); trauma = Math.min(1, trauma + 0.3); if (mode !== 'demo') sfx.land(); }
      continue;
    }
    if (state === 'play') { if (isBot(b.i)) botThink(b, o, dt); else readInput(b); } else { b.ix = b.iz = 0; b.wantDash = false; }
    // power-up timers
    if (b.titan > 0) b.titan -= dt; if (b.rocket > 0) b.rocket -= dt;
    const tr = b.titan > 0 ? 1.08 : 0.72; b.r += (tr - b.r) * Math.min(1, dt * 8); b.mass = b.titan > 0 ? 2.6 : 1;
    b.dashCd -= dt; b.dashT -= dt;
    if (!b.falling) {
      const acc = (b.rocket > 0 ? 32 : 21) * (b.titan > 0 ? 0.85 : 1); b.vel.x += b.ix * acc * dt; b.vel.z += b.iz * acc * dt;
      if (b.wantDash && b.dashCd <= 0) {
        let dx = b.ix, dz = b.iz, m = Math.hypot(dx, dz); if (m < 0.2) { dx = b.vel.x; dz = b.vel.z; m = Math.hypot(dx, dz); } if (m < 0.2) { dx = o.pos.x - b.pos.x; dz = o.pos.z - b.pos.z; m = Math.hypot(dx, dz) || 1; }
        b.vel.x += dx / m * 12.5; b.vel.z += dz / m * 12.5; b.dashCd = b.rocket > 0 ? 0.7 : 1.7; b.dashT = 0.4; if (mode !== 'demo') sfx.dash(); ringFx(b.pos.x, 0.05, b.pos.z, P_GLOW[b.i], 3, 0.35);
      }
      const dr = Math.exp(-1.9 * dt); b.vel.x *= dr; b.vel.z *= dr;
    }
    b.wantDash = false;
    b.pos.x += b.vel.x * dt; b.pos.z += b.vel.z * dt;
    const sup = supportedAt(b.pos.x, b.pos.z);
    if (!b.falling && !sup) { b.falling = true; b.vel.y = 0; }
    if (b.falling) {
      b.vel.y -= 30 * dt; b.pos.y += b.vel.y * dt;
      if (sup && b.pos.y > b.r - 0.3 && b.vel.y <= 0) { b.falling = false; b.pos.y = b.r; b.vel.y = 0; }   // caught the edge
      if (!b.out && b.pos.y < -2.2) { b.out = true; b.outT = now; if (state === 'play' && pendingEnd < 0) pendingEnd = now + 0.4; }
      if (b.pos.y < -11.5 && b.mesh.visible) { b.mesh.visible = false; emit(b.pos.x, -11, b.pos.z, 70, { col: [2.2, 1.5, 1.1], sMin: 2, sMax: 9, elMin: 0.2, elMax: 1, lMax: 1.4, zMax: 0.5, grav: 3 }); ringFx(b.pos.x, -11.4, b.pos.z, [2.4, 1.4, 0.9], 9, 0.9); }
    } else b.pos.y = b.r + waveY(b.pos.x, b.pos.z);
    // rolling
    const sp = Math.hypot(b.vel.x, b.vel.z); if (sp > 0.01) { tmpA.set(b.vel.z, 0, -b.vel.x).normalize(); tmpQ.setFromAxisAngle(tmpA, sp * dt / b.r); b.mesh.quaternion.premultiply(tmpQ); }
    if ((b.dashT > 0 || sp > 9) && b.mesh.visible) emit(b.pos.x, b.pos.y - b.r * 0.4, b.pos.z, b.dashT > 0 ? 3 : 1, { col: P_GLOW[b.i], sMin: 0.2, sMax: 1.4, lMin: 0.25, lMax: 0.6, grav: -1, jit: b.r * 0.5, zMin: 0.1, zMax: 0.26 });
    // power-up pickup
    if (!b.falling) for (const p of pups.slice()) if (Math.hypot(p.tile.x - b.pos.x, p.tile.z - b.pos.z) < b.r + 0.55) applyPu(b, p);
  }
  // ball vs ball
  const [a, b] = balls; if (a.landed && b.landed && a.mesh.visible && b.mesh.visible) {
    tmpV.subVectors(b.pos, a.pos); const d = tmpV.length(), minD = a.r + b.r;
    if (d < minD && d > 1e-4) {
      tmpV.divideScalar(d); const rel = (a.vel.x - b.vel.x) * tmpV.x + (a.vel.z - b.vel.z) * tmpV.z, ov = minD - d, im = 1 / (a.mass + b.mass);
      a.pos.x -= tmpV.x * ov * b.mass * im; a.pos.z -= tmpV.z * ov * b.mass * im; b.pos.x += tmpV.x * ov * a.mass * im; b.pos.z += tmpV.z * ov * a.mass * im;
      if (rel > 0) {
        const j = 1.92 * rel / (1 / a.mass + 1 / b.mass), ka = a.dashT > 0 ? 1.55 : 1.15, kb = b.dashT > 0 ? 1.55 : 1.15;
        a.vel.x -= j / a.mass * tmpV.x * (a.dashT > 0 ? 0.55 : 1) * kb; a.vel.z -= j / a.mass * tmpV.z * (a.dashT > 0 ? 0.55 : 1) * kb;
        b.vel.x += j / b.mass * tmpV.x * (b.dashT > 0 ? 0.55 : 1) * ka; b.vel.z += j / b.mass * tmpV.z * (b.dashT > 0 ? 0.55 : 1) * ka;
        const k = clamp(rel / 14, 0, 1), cx = a.pos.x + tmpV.x * a.r, cy = Math.max(a.pos.y, 0.3), cz = a.pos.z + tmpV.z * a.r;
        emit(cx, cy, cz, 10 + k * 60 | 0, { col: [3.2, 2.2, 1.2], sMin: 2, sMax: 6 + 12 * k, elMin: -0.1, elMax: 0.9, lMax: 0.5 + 0.5 * k, zMax: 0.2 + 0.14 * k });
        trauma = Math.min(1, trauma + 0.15 + 0.6 * k); if (k > 0.3) { ringFx(cx, 0.06, cz, [3, 2.2, 1.4], 3 + 6 * k, 0.4); bump(cx, cz, 0.08 + 0.18 * k); hitStop = 0.03 + 0.05 * k; }
        if (mode !== 'demo') sfx.hit(0.25 + 0.75 * k);
      }
    }
  }
  // round end
  if (state === 'play' && pendingEnd > 0 && now >= pendingEnd) { const oa = balls[0].out || balls[0].falling && balls[0].pos.y < 0, ob = balls[1].out || balls[1].falling && balls[1].pos.y < 0; endRound(oa && ob ? -1 : oa ? 1 : 0); }
}
function flow(dt) {
  stT += dt;
  if (state === 'count') {
    const steps = mode === 'demo' ? [[1.3, null]] : [[0.1, 'RAUND ' + round], [1.25, 'HAZIR'], [2.0, 'BAŞLA!']];
    for (let i = countStep + 1; i < steps.length; i++) if (stT >= steps[i][0]) { countStep = i; if (steps[i][1]) { banner(steps[i][1], i === 0 && round === 1 ? 'ilk ' + WIN + ' raundu alan kazanır' : ''); sfx.beep(i === steps.length - 1); } if (i === steps.length - 1) { state = 'play'; stT = 0; updateCentroid(); } }
  } else if (state === 'ko') {
    if (stT > (mode === 'demo' ? 1.6 : 2.4)) { if (mode !== 'demo' && lastWinner >= 0 && scores[lastWinner] >= WIN) endMatch(lastWinner); else startRound(); }
  } else if (state === 'end') { if (Math.random() < dt * 14) emit(rand(-8, 8), rand(5, 9), rand(-6, 6), 6, { col: P_GLOW[lastWinner], sMin: 1, sMax: 4, lMin: 0.8, lMax: 1.8, grav: 4, zMax: 0.3 }); }
}

// ------------------------------------------------------------------ view
let viewShift = 1; const camPos = new THREE.Vector3(0, 14, 16), camTgt = new THREE.Vector3(), wantPos = new THREE.Vector3(), wantTgt = new THREE.Vector3();
function updateView(dt) {
  const [a, b] = balls, ax = a.out ? b.pos.x : a.pos.x, az = a.out ? b.pos.z : a.pos.z, bx = b.out ? a.pos.x : b.pos.x, bz = b.out ? a.pos.z : b.pos.z;
  const vf = THREE.MathUtils.degToRad(camera.fov), hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect), f = Math.min(vf, hf);
  if (mode === 'demo' || state === 'end') {
    const an = now * 0.11, d = (landscape() ? 24 : 34); wantTgt.set(0, 0.5, 0); wantPos.set(Math.sin(an) * d, landscape() ? 9 : 13, Math.cos(an) * d);
  } else {
    const spread = Math.hypot(ax - bx, az - bz), fit = clamp(spread / 2 + 4.4, landscape() ? 7.3 : 8.8, 10.5), tilt = THREE.MathUtils.degToRad(landscape() ? 54 : 68), dist = fit / Math.tan(f / 2);
    wantTgt.set((ax + bx) / 2 * 0.35, 0, (az + bz) / 2 * 0.35 + (landscape() ? 1.1 : 0.4)); wantPos.set(wantTgt.x, Math.sin(tilt) * dist, wantTgt.z + Math.cos(tilt) * dist);
  }
  const k = 1 - Math.exp(-dt * (mode === 'demo' ? 1.2 : 3.2)); camPos.lerp(wantPos, k); camTgt.lerp(wantTgt, k);
  // while a card is open, slide the picture so the arena sits beside (landscape) or above (portrait) it
  const menuOpen = mode === 'demo' || state === 'end', wantShift = menuOpen ? 1 : 0; viewShift += (wantShift - viewShift) * Math.min(1, dt * 4);
  if (viewShift > 0.003) { if (landscape()) camera.setViewOffset(W, H, -W * 0.23 * viewShift, 0, W, H); else camera.setViewOffset(W, H, 0, H * 0.2 * viewShift, W, H); } else if (camera.view) camera.clearViewOffset();
  trauma = Math.max(0, trauma - dt * 1.8); const sh = trauma * trauma * 0.55;
  camera.position.set(camPos.x + Math.sin(now * 61) * sh, camPos.y + Math.sin(now * 53 + 2) * sh, camPos.z + Math.cos(now * 47) * sh); camera.lookAt(camTgt);
  // tiles -> instances
  for (const t of tiles) {
    const warn = t.st === 1, sx = warn ? Math.sin(now * 70 + t.i) * 0.035 : 0;
    dummy.position.set(t.x + sx, t.y - TILE_H / 2 + (t.st < 2 ? waveY(t.x, t.z) : 0), t.z - sx); dummy.rotation.set(t.rx, t.rot, t.rz); dummy.scale.setScalar(t.st === 3 ? 0.0001 : 1); dummy.updateMatrix(); tileMesh.setMatrixAt(t.i, dummy.matrix);
    if (warn) tmpC.copy(t.col).lerp(HOT, 0.45 + 0.4 * Math.sin(now * 16 + t.i)); else tmpC.copy(t.col); tileMesh.setColorAt(t.i, tmpC);
  }
  tileMesh.instanceMatrix.needsUpdate = true; tileMesh.instanceColor.needsUpdate = true;
  for (const b of balls) {
    b.mesh.position.copy(b.pos); b.mesh.scale.setScalar(b.r); b.mesh.material.emissiveIntensity = 0.9 + (b.dashT > 0 ? 2.2 : 0) + (b.rocket > 0 ? 0.8 : 0) + 0.25 * Math.sin(now * 5 + b.i * 2);
    b.ring.visible = b.landed && !b.falling; b.ring.position.set(b.pos.x, 0.03 + waveY(b.pos.x, b.pos.z), b.pos.z); b.ring.scale.setScalar(b.r); b.ring.material.opacity = b.dashCd <= 0 ? 0.55 + 0.25 * Math.sin(now * 8) : 0.12; b.ring.rotation.z = now * 1.5;
  }
  if (mode === 'bot') $('dashBtn').classList.toggle('cool', balls[0].dashCd > 0);
  for (const p of pups) { p.t += dt; p.mesh.position.set(p.tile.x, 0.95 + Math.sin(p.t * 3) * 0.14 + waveY(p.tile.x, p.tile.z), p.tile.z); p.mesh.rotation.set(p.t * 0.8, p.t * 2.2, 0); const s = Math.min(1, p.t * 3); p.mesh.scale.setScalar(s); p.ring.position.set(p.tile.x, 0.04, p.tile.z); p.ring.scale.setScalar(1 + 0.15 * Math.sin(p.t * 5)); }
  for (const r of rings) if (r.m.visible) { r.t += dt; const k2 = r.t / r.d; if (k2 >= 1) { r.m.visible = false; continue; } const e = 1 - Math.pow(1 - k2, 3); r.m.scale.setScalar(0.3 + r.s * e); r.m.material.opacity = (1 - k2) * (1 - k2) * 0.55; }
  halo.rotation.z = now * 0.05; halo2.rotation.set(Math.PI / 2 + Math.sin(now * 0.2) * 0.25, now * 0.07, 0); halo2.position.y = -5;
  rocks.forEach((r, i) => { r.position.y = r.userData.y + Math.sin(now * 0.3 + i * 2) * 0.8; r.rotation.y += dt * 0.02; });
  cloudMat.uniforms.uT.value = now;
}

// ------------------------------------------------------------------ loop (+ adaptive quality)
let last = performance.now(), fAcc = 0, fN = 0, qStep = 0, paused = false;
function frame(tm) {
  requestAnimationFrame(frame); if (paused) { last = tm; return; }
  const real = Math.min(0.05, (tm - last) / 1000); last = tm;
  if (slowT > 0) { slowT -= real; if (slowT <= 0) timeScale = 1; }
  let dt = real * timeScale; if (hitStop > 0) { hitStop -= real; dt *= 0.05; }
  now += dt; flow(dt);
  const sub = dt > 0.02 ? 2 : 1; for (let i = 0; i < sub; i++) step(dt / sub);
  updateParticles(dt); updateView(real); music();
  if (mode !== 'demo' && (fN & 15) === 0) fxLabel();
  composer.render();
  fAcc += real; fN++;
  if (fN % 90 === 0) { const avg = fAcc / 90; fAcc = 0; if (avg > 0.027 && now > 3) { qStep++; if (PR > 1.05) { PR = Math.max(1, PR - 0.25); resize(); } else if (bloom.enabled && qStep > 4) { bloom.enabled = false; } else if (renderer.shadowMap.enabled && qStep > 6) { sun.castShadow = false; } } }
}
document.addEventListener('visibilitychange', () => { paused = document.hidden; if (ac) paused ? ac.suspend() : ac.resume(); });

// ------------------------------------------------------------------ ui wiring
$('play2').onclick = () => startMatch('2p'); $('play1').onclick = () => startMatch('bot');
$('again').onclick = () => startMatch(mode); $('toMenu').onclick = toMenu; $('btnMenu').onclick = toMenu;
document.querySelectorAll('.chip').forEach(c => c.onclick = () => { botLv = +c.dataset.lv; document.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', x === c)); });
const muteBtn = $('btnMute'); const paintMute = () => { muteBtn.textContent = muted ? '×' : '♪'; muteBtn.style.opacity = muted ? 0.6 : 1; }; paintMute();
muteBtn.onclick = () => { muted = !muted; audioInit(); if (master) master.gain.value = muted ? 0 : 0.9; try { localStorage.setItem('goksumo-mute', muted ? '1' : '0'); } catch (e) {} paintMute(); };
addEventListener('contextmenu', e => e.preventDefault());

resize(); hud(); startRound(); stT = 3; // menu opens on a live demo match already under way
for (const t of tiles) { t.st = 0; t.y = 0; } balls.forEach(b => { b.landed = true; b.pos.y = b.r; }); state = 'play'; stT = 0; updateCentroid();
requestAnimationFrame(frame);
window.__game = { balls, tiles, get state() { return state; }, get mode() { return mode; }, get scores() { return scores; }, startMatch };
