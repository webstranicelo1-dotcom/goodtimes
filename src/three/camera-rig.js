import * as THREE from "three";
import { clamp, damp, smoothstep, invLerp } from "./utils.js";

/**
 * Stanice kamere — po jedna za svaku sekciju sa data-scene atributom.
 * Redosled u objektu ne igra rolu; pozicija na skrolu se čita iz DOM-a.
 */
const STATIONS = {
  hero: { pos: [-0.62, 0.86, 3.15], target: [-1.08, 0.3, 0], fov: 42 },
  about: { pos: [1.45, 1.2, 2.6], target: [1.98, 0.26, 0], fov: 44 },
  menu: { pos: [-1.35, -4.15, 4.3], target: [-1.95, -5.9, 0], fov: 46 },
  quote: { pos: [0, -3.75, 4.9], target: [0, -5.1, 0], fov: 44 },
  gallery: { pos: [0.8, -8.4, 5.6], target: [0.3, -9.4, 0], fov: 48 },
  reserve: { pos: [-0.9, -10.9, 2.7], target: [-1.55, -11.4, 0], fov: 43 },
  contact: { pos: [1.7, -11.35, 5.9], target: [0.5, -11.6, 0], fov: 48 },
};

/**
 * Na uskim ekranima prop ide u centar, malo dalje od kamere i niže u kadru —
 * gornju polovinu ekrana zauzima tekst.
 */
function forNarrow(station) {
  const [px, py, pz] = station.pos;
  const [tx, ty, tz] = station.target;
  const dx = px - tx;
  return {
    pos: [px - dx * 0.85, py + 0.12, pz * 1.25],
    target: [tx + dx * 0.85, ty + 0.4, tz],
    fov: Math.min(station.fov + 12, 62),
  };
}

export function createCameraRig(camera) {
  const posTarget = new THREE.Vector3();
  const lookTarget = new THREE.Vector3();
  const posCurrent = new THREE.Vector3();
  const lookCurrent = new THREE.Vector3();

  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  let keys = [];
  let progress = 0;
  let narrow = false;
  const weights = Object.create(null);

  function resolve(name) {
    const s = STATIONS[name] || STATIONS.hero;
    return narrow ? forNarrow(s) : s;
  }

  /** Mapira sekcije iz dokumenta na t vrednosti globalnog skrola. */
  function measure() {
    narrow = window.innerWidth < 900;

    const sections = [...document.querySelectorAll("[data-scene]")];
    const limit = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const vh = window.innerHeight;

    keys = sections.map((el, i) => {
      const rect = el.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const center = top + rect.height / 2 - vh / 2;
      return {
        name: el.dataset.scene,
        t: i === 0 ? 0 : clamp(center / limit),
        station: resolve(el.dataset.scene),
      };
    });

    keys.sort((a, b) => a.t - b.t);

    // rep: kamera nastavlja da se odmiče kroz podnožje
    const last = keys[keys.length - 1];
    if (last && last.t < 0.999) {
      keys.push({
        name: last.name,
        t: 1,
        station: {
          pos: [last.station.pos[0], last.station.pos[1] - 1.1, last.station.pos[2] + 1.6],
          target: [last.station.target[0], last.station.target[1] - 1.1, last.station.target[2]],
          fov: last.station.fov,
        },
      });
    }

    apply(1);
  }

  /** Interpolira između dve najbliže stanice. */
  function apply(snapAmount = 0) {
    if (!keys.length) return;

    let i = 0;
    while (i < keys.length - 2 && progress > keys[i + 1].t) i++;

    const a = keys[i];
    const b = keys[Math.min(i + 1, keys.length - 1)];
    const mix = a === b ? 0 : smoothstep(invLerp(a.t, b.t, progress));

    for (const k in weights) weights[k] = 0;
    weights[a.name] = Math.max(weights[a.name] || 0, 1 - mix);
    weights[b.name] = Math.max(weights[b.name] || 0, mix);

    posTarget.set(
      THREE.MathUtils.lerp(a.station.pos[0], b.station.pos[0], mix),
      THREE.MathUtils.lerp(a.station.pos[1], b.station.pos[1], mix),
      THREE.MathUtils.lerp(a.station.pos[2], b.station.pos[2], mix)
    );
    lookTarget.set(
      THREE.MathUtils.lerp(a.station.target[0], b.station.target[0], mix),
      THREE.MathUtils.lerp(a.station.target[1], b.station.target[1], mix),
      THREE.MathUtils.lerp(a.station.target[2], b.station.target[2], mix)
    );
    camera.fov = THREE.MathUtils.lerp(a.station.fov, b.station.fov, mix);
    camera.updateProjectionMatrix();

    if (snapAmount) {
      posCurrent.copy(posTarget);
      lookCurrent.copy(lookTarget);
    }
  }

  return {
    weights,
    measure,

    setProgress(p) {
      progress = clamp(p);
      apply();
    },

    setPointer(x, y) {
      pointer.x = x;
      pointer.y = y;
    },

    update(dt, { parallax = 1 } = {}) {
      pointer.sx = damp(pointer.sx, pointer.x, 0.86, dt);
      pointer.sy = damp(pointer.sy, pointer.y, 0.86, dt);

      posCurrent.x = damp(posCurrent.x, posTarget.x, 0.7, dt);
      posCurrent.y = damp(posCurrent.y, posTarget.y, 0.7, dt);
      posCurrent.z = damp(posCurrent.z, posTarget.z, 0.7, dt);

      lookCurrent.x = damp(lookCurrent.x, lookTarget.x, 0.72, dt);
      lookCurrent.y = damp(lookCurrent.y, lookTarget.y, 0.72, dt);
      lookCurrent.z = damp(lookCurrent.z, lookTarget.z, 0.72, dt);

      camera.position.set(
        posCurrent.x + pointer.sx * 0.22 * parallax,
        posCurrent.y + pointer.sy * 0.16 * parallax,
        posCurrent.z
      );
      camera.lookAt(
        lookCurrent.x - pointer.sx * 0.06 * parallax,
        lookCurrent.y - pointer.sy * 0.04 * parallax,
        lookCurrent.z
      );
    },
  };
}
