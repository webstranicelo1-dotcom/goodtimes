import * as THREE from "three";
import { softCircleTexture } from "../utils.js";

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSize;
  attribute float aSeed;
  attribute float aScale;
  varying float vTwinkle;

  void main() {
    vec3 p = position;
    p.y += sin(uTime * 0.09 + aSeed * 12.0) * 0.9;
    p.x += cos(uTime * 0.07 + aSeed * 19.0) * 0.7;
    p.z += sin(uTime * 0.055 + aSeed * 27.0) * 0.5;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    vTwinkle = pow(0.5 + 0.5 * sin(uTime * 1.6 + aSeed * 63.0), 2.0);
    gl_PointSize = uSize * aScale * uPixelRatio / max(-mv.z, 0.05);
  }
`;

const FRAG = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uOpacity;
  varying float vTwinkle;

  void main() {
    float a = texture2D(uTex, gl_PointCoord).a;
    if (a < 0.02) discard;
    vec3 c = mix(vec3(0.78, 0.55, 0.26), vec3(1.0, 0.92, 0.78), vTwinkle);
    gl_FragColor = vec4(c, a * uOpacity * (0.25 + vTwinkle * 0.9));
  }
`;

export function createDust({ quality, spanY }) {
  const count = quality === "low" ? 700 : quality === "mid" ? 1600 : 2600;

  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const scales = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 26;
    positions[i * 3 + 1] = spanY.max + 2 - Math.random() * (spanY.max - spanY.min + 5);
    positions[i * 3 + 2] = -1 - Math.random() * 15;
    seeds[i] = Math.random();
    scales[i] = 0.35 + Math.random() * 1.1;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  geo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));

  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: 9 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uOpacity: { value: 0.3 },
      uTex: { value: softCircleTexture(64, 1.8) },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;

  return {
    group: points,
    update(time) {
      mat.uniforms.uTime.value = time;
    },
    setPixelRatio(pr) {
      mat.uniforms.uPixelRatio.value = pr;
    },
  };
}
