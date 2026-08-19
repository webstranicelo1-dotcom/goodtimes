import * as THREE from "three";

/** Zamućeni krug sa blago svetlijim obodom — kao raspršena sveća u objektivu. */
function bokehTexture(size = 256) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const r = size / 2;
  const g = ctx.createRadialGradient(r, r, 0, r, r, r);
  g.addColorStop(0.0, "rgba(255,255,255,0.55)");
  g.addColorStop(0.45, "rgba(255,255,255,0.5)");
  g.addColorStop(0.7, "rgba(255,255,255,0.62)");
  g.addColorStop(0.86, "rgba(255,255,255,0.22)");
  g.addColorStop(1.0, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const VERT = /* glsl */ `
  uniform float uTime;
  attribute vec3 aOffset;
  attribute float aScale;
  attribute float aSeed;
  attribute vec3 aColor;
  varying vec2 vUv;
  varying vec3 vColor;
  varying float vTwinkle;

  void main() {
    vec3 world = aOffset;
    world.x += sin(uTime * 0.13 + aSeed * 17.0) * 0.42;
    world.y += cos(uTime * 0.105 + aSeed * 23.0) * 0.32;

    vec4 mv = modelViewMatrix * vec4(world, 1.0);
    mv.xy += position.xy * aScale;
    gl_Position = projectionMatrix * mv;

    vUv = uv;
    vColor = aColor;
    vTwinkle = 0.55 + 0.45 * sin(uTime * (0.5 + aSeed * 0.8) + aSeed * 41.0);
  }
`;

const FRAG = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec3 vColor;
  varying float vTwinkle;

  void main() {
    float a = texture2D(uTex, vUv).a;
    if (a < 0.004) discard;
    gl_FragColor = vec4(vColor * (0.75 + vTwinkle * 0.6), a * uOpacity * vTwinkle);
  }
`;

const PALETTE = [0xffb45a, 0xff8a3c, 0xffd9a0, 0xc9974c, 0xffe6c2, 0xe8622a];

export function createBokeh({ quality, spanY }) {
  const count = quality === "low" ? 90 : quality === "mid" ? 150 : 210;

  const plane = new THREE.PlaneGeometry(1, 1);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = plane.index;
  geo.setAttribute("position", plane.attributes.position);
  geo.setAttribute("uv", plane.attributes.uv);
  geo.instanceCount = count;

  const offsets = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const seeds = new Float32Array(count);
  const colors = new Float32Array(count * 3);
  const col = new THREE.Color();

  for (let i = 0; i < count; i++) {
    // sve iza propova — bliski krugovi bi prekrili tekst
    offsets[i * 3] = (Math.random() - 0.5) * 26;
    offsets[i * 3 + 1] = spanY.max - Math.random() * (spanY.max - spanY.min);
    offsets[i * 3 + 2] = -5 - Math.random() * 12;

    scales[i] = 0.16 + Math.pow(Math.random(), 1.6) * 0.62;
    seeds[i] = Math.random();

    col.setHex(PALETTE[(Math.random() * PALETTE.length) | 0]);
    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }

  geo.setAttribute("aOffset", new THREE.InstancedBufferAttribute(offsets, 3));
  geo.setAttribute("aScale", new THREE.InstancedBufferAttribute(scales, 1));
  geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 1));
  geo.setAttribute("aColor", new THREE.InstancedBufferAttribute(colors, 3));

  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0.34 },
      uTex: { value: bokehTexture() },
    },
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = -1;

  return {
    group: mesh,
    update(time) {
      mat.uniforms.uTime.value = time;
    },
    setOpacity(v) {
      mat.uniforms.uOpacity.value = v;
    },
  };
}
