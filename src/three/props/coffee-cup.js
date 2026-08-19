import * as THREE from "three";
import { cremaTexture, ceramicRoughness, softCircleTexture, v2 } from "../utils.js";

const CUP_PROFILE = [
  v2(0.001, 0.0),
  v2(0.3, 0.0),
  v2(0.325, 0.02),
  v2(0.34, 0.06),
  v2(0.4, 0.24),
  v2(0.48, 0.46),
  v2(0.525, 0.63),
  v2(0.55, 0.665),
  v2(0.53, 0.675),
  v2(0.5, 0.63),
  v2(0.44, 0.44),
  v2(0.36, 0.22),
  v2(0.3, 0.08),
  v2(0.001, 0.055),
];

const SAUCER_PROFILE = [
  v2(0.001, 0.0),
  v2(0.3, 0.0),
  v2(0.58, 0.012),
  v2(0.74, 0.045),
  v2(0.82, 0.075),
  v2(0.845, 0.088),
  v2(0.83, 0.072),
  v2(0.75, 0.032),
  v2(0.34, 0.012),
  v2(0.001, 0.012),
];

const STEAM_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  attribute float aSeed;
  attribute float aScale;
  varying float vAlpha;

  void main() {
    float life = fract(uTime * (0.05 + aSeed * 0.045) + aSeed);
    float rise = life * 1.15;

    vec3 p = position;
    p.x += sin(uTime * 0.5 + aSeed * 31.0 + rise * 3.0) * (0.03 + rise * 0.1);
    p.z += cos(uTime * 0.44 + aSeed * 21.0 + rise * 2.6) * (0.03 + rise * 0.08);
    p.xz *= 1.0 + rise * 0.35;
    p.y += rise;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    float fadeIn = smoothstep(0.0, 0.2, life);
    float fadeOut = 1.0 - smoothstep(0.25, 1.0, life);
    vAlpha = fadeIn * fadeOut;

    gl_PointSize = uSize * aScale * (1.0 + rise * 2.6) * uPixelRatio / max(-mv.z, 0.001);
  }
`;

const STEAM_FRAG = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uOpacity;
  varying float vAlpha;

  void main() {
    float a = texture2D(uTex, gl_PointCoord).a;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vec3(1.0, 0.94, 0.86), a * vAlpha * uOpacity);
  }
`;

export function createCoffeeCup({ envMap, quality }) {
  const group = new THREE.Group();
  const pivot = new THREE.Group();
  group.add(pivot);

  const roughMap = ceramicRoughness();

  const ceramic = new THREE.MeshPhysicalMaterial({
    color: 0x120e0b,
    roughness: 0.42,
    roughnessMap: roughMap,
    metalness: 0.04,
    clearcoat: 0.85,
    clearcoatRoughness: 0.22,
    envMap,
    envMapIntensity: 1.0,
    side: THREE.DoubleSide,
  });

  const gold = new THREE.MeshPhysicalMaterial({
    color: 0xc9974c,
    metalness: 1,
    roughness: 0.24,
    envMap,
    envMapIntensity: 1.5,
  });

  const seg = quality === "low" ? 48 : 96;

  const cup = new THREE.Mesh(new THREE.LatheGeometry(CUP_PROFILE, seg), ceramic);
  cup.castShadow = true;
  pivot.add(cup);

  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.539, 0.011, 8, seg), gold);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.669;
  pivot.add(rim);

  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.155, 0.043, 14, 44, Math.PI * 1.36),
    ceramic
  );
  handle.position.set(0.47, 0.4, 0);
  handle.rotation.z = -2.12;
  pivot.add(handle);

  const coffee = new THREE.Mesh(
    new THREE.CircleGeometry(0.478, seg),
    new THREE.MeshPhysicalMaterial({
      map: cremaTexture(),
      roughness: 0.18,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      envMap,
      envMapIntensity: 1.15,
    })
  );
  coffee.rotation.x = -Math.PI / 2;
  coffee.position.y = 0.53;
  pivot.add(coffee);

  const saucer = new THREE.Mesh(new THREE.LatheGeometry(SAUCER_PROFILE, seg), ceramic);
  saucer.position.y = -0.014;
  pivot.add(saucer);

  const saucerRing = new THREE.Mesh(new THREE.TorusGeometry(0.788, 0.005, 6, seg), gold);
  saucerRing.rotation.x = Math.PI / 2;
  saucerRing.position.y = 0.062;
  pivot.add(saucerRing);

  // ---- para ----
  const count = quality === "low" ? 240 : 620;
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const scales = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * 0.3;
    positions[i * 3] = Math.cos(a) * r;
    positions[i * 3 + 1] = 0.56;
    positions[i * 3 + 2] = Math.sin(a) * r;
    seeds[i] = Math.random();
    scales[i] = 0.5 + Math.random() * 1.1;
  }

  const steamGeo = new THREE.BufferGeometry();
  steamGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  steamGeo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  steamGeo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));

  const steamMat = new THREE.ShaderMaterial({
    vertexShader: STEAM_VERT,
    fragmentShader: STEAM_FRAG,
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: 62 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uOpacity: { value: 0.05 },
      uTex: { value: softCircleTexture(128, 2.1) },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const steam = new THREE.Points(steamGeo, steamMat);
  steam.frustumCulled = false;
  pivot.add(steam);

  return {
    group,
    update(time, { scroll, focus }) {
      steamMat.uniforms.uTime.value = time;
      steamMat.uniforms.uOpacity.value = 0.008 + focus * 0.03;
      pivot.rotation.y = -0.35 + scroll * 2.6;
      pivot.position.y = Math.sin(time * 0.5) * 0.014;
    },
    setPixelRatio(pr) {
      steamMat.uniforms.uPixelRatio.value = pr;
    },
  };
}
