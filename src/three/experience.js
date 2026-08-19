import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

import { createEnvironment } from "./environment.js";
import { createCameraRig } from "./camera-rig.js";
import { createCoffeeCup } from "./props/coffee-cup.js";
import { createPizza } from "./props/pizza.js";
import { createGlass } from "./props/glass.js";
import { createBokeh } from "./props/bokeh.js";
import { createDust } from "./props/dust.js";
import { clamp } from "./utils.js";

const SPAN_Y = { min: -18, max: 4 };

function detectQuality() {
  const cores = navigator.hardwareConcurrency || 4;
  const narrow = window.innerWidth < 900;
  const coarse = window.matchMedia("(pointer: coarse)").matches;

  if (narrow || coarse || cores <= 4) return "low";
  if (cores <= 8) return "mid";
  return "high";
}

export function createExperience(canvas) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const quality = detectQuality();
  const maxDpr = quality === "low" ? 1.5 : 2;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: quality !== "low",
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x070605, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDpr));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x070605, 0.052);

  const camera = new THREE.PerspectiveCamera(
    42,
    window.innerWidth / window.innerHeight,
    0.1,
    120
  );
  scene.add(camera);

  const envMap = createEnvironment(renderer);
  scene.environment = envMap;

  // ---------- svetla ----------
  scene.add(new THREE.AmbientLight(0x30231a, 0.35));

  const key = new THREE.DirectionalLight(0xffd9a8, 1.45);
  key.position.set(2.6, 4.2, 3.1);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xff8b3a, 0.85);
  rim.position.set(-3.4, 1.4, -2.6);
  scene.add(rim);

  const cool = new THREE.DirectionalLight(0x89a7cf, 0.3);
  cool.position.set(-1.2, 3.4, -4);
  scene.add(cool);

  // sveća uz kameru — putuje kroz celu scenu i treperi
  const candle = new THREE.PointLight(0xffab5e, 6.5, 9, 2);
  candle.position.set(0.85, 0.55, 0.9);
  camera.add(candle);

  // ---------- propovi ----------
  const props = [];
  const register = (prop, position) => {
    if (position) prop.group.position.set(...position);
    scene.add(prop.group);
    props.push(prop);
    return prop;
  };

  const cup = register(createCoffeeCup({ envMap, quality }), [0, 0, 0]);
  const pizza = register(createPizza({ envMap, quality }), [0, -6, 0]);
  const glass = register(createGlass({ envMap, quality }), [0, -12, 0]);
  const bokeh = register(createBokeh({ quality, spanY: SPAN_Y }));
  const dust = register(createDust({ quality, spanY: SPAN_Y }));

  // ---------- rig + post ----------
  const rig = createCameraRig(camera);

  const useBloom = quality !== "low";
  let composer = null;
  let bloom = null;

  if (useBloom) {
    composer = new EffectComposer(renderer);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, maxDpr));
    composer.setSize(window.innerWidth, window.innerHeight);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.3,
      0.62,
      0.9
    );
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  }

  let scroll = 0;
  let elapsed = 0;
  let visible = true;
  let started = false;

  document.addEventListener("visibilitychange", () => {
    visible = !document.hidden;
  });

  if (!reduced) {
    window.addEventListener(
      "pointermove",
      (e) => {
        rig.setPointer(
          (e.clientX / window.innerWidth) * 2 - 1,
          -((e.clientY / window.innerHeight) * 2 - 1)
        );
      },
      { passive: true }
    );
  }

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio, maxDpr);

    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    if (composer) {
      composer.setPixelRatio(dpr);
      composer.setSize(w, h);
    }

    cup.setPixelRatio?.(dpr);
    dust.setPixelRatio?.(dpr);
    rig.measure();
  }

  window.addEventListener("resize", resize);

  return {
    quality,

    measure: () => rig.measure(),

    setScroll(p) {
      scroll = clamp(p);
      rig.setProgress(scroll);
      started = true;
    },

    render(dt) {
      if (!visible) return;

      elapsed += reduced ? 0 : dt;
      rig.update(dt, { parallax: reduced ? 0 : 1 });

      const w = rig.weights;
      const focus = (w.hero || 0) + (w.about || 0) * 0.55;

      cup.update(elapsed, { scroll, focus });
      pizza.update(elapsed, { scroll });
      glass.update(elapsed, { scroll });
      bokeh.update(elapsed);
      dust.update(elapsed);

      bokeh.setOpacity(0.3 + (w.hero || 0) * 0.14 + (w.quote || 0) * 0.16);
      candle.intensity = 6.2 + Math.sin(elapsed * 2.7) * 0.8 + Math.sin(elapsed * 6.3) * 0.4;

      if (bloom) bloom.strength = 0.28 + (w.quote || 0) * 0.2 + (w.hero || 0) * 0.06;

      if (composer) composer.render(dt);
      else renderer.render(scene, camera);

      return started;
    },
  };
}
