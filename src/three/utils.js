import * as THREE from "three";

export const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export const lerp = (a, b, t) => a + (b - a) * t;

export const invLerp = (a, b, v) => (b === a ? 0 : (v - a) / (b - a));

export const smoothstep = (t) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};

/** Frame-rate nezavisan lerp. */
export const damp = (current, target, smoothing, dt) =>
  lerp(current, target, 1 - Math.pow(smoothing, dt * 60));

/** Meka kružna tekstura za čestice i bokeh. */
export function softCircleTexture(size = 128, falloff = 2.4) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    g.addColorStop(t, `rgba(255,255,255,${Math.pow(1 - t, falloff).toFixed(4)})`);
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Površina espresa: tamna kafa sa svetlijim prstenom kreme. */
export function cremaTexture(size = 512) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const r = size / 2;

  ctx.fillStyle = "#2a170c";
  ctx.fillRect(0, 0, size, size);

  const g = ctx.createRadialGradient(r * 0.82, r * 0.78, r * 0.1, r, r, r);
  g.addColorStop(0, "#6b4220");
  g.addColorStop(0.55, "#43230f");
  g.addColorStop(0.86, "#2d1709");
  g.addColorStop(1, "#1a0d05");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = "rgba(196,142,74,0.5)";
  for (let i = 0; i < 26; i++) {
    ctx.beginPath();
    ctx.lineWidth = Math.random() * 3 + 0.6;
    const rad = r * (0.62 + Math.random() * 0.33);
    const a0 = Math.random() * Math.PI * 2;
    ctx.arc(r, r, rad, a0, a0 + Math.random() * 1.6 + 0.4);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Mocarela i pečene fleke na testu. */
export function pizzaTopTexture(size = 1024) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const r = size / 2;

  ctx.clearRect(0, 0, size, size);

  ctx.save();
  ctx.beginPath();
  ctx.arc(r, r, r * 0.93, 0, Math.PI * 2);
  ctx.clip();

  const sauce = ctx.createRadialGradient(r, r, r * 0.1, r, r, r * 0.93);
  sauce.addColorStop(0, "#8a2a15");
  sauce.addColorStop(0.7, "#74200e");
  sauce.addColorStop(1, "#5b1809");
  ctx.fillStyle = sauce;
  ctx.fillRect(0, 0, size, size);

  // razlivena kora sira ispod grudvi mocarele
  for (let i = 0; i < 16; i++) {
    const a = Math.random() * Math.PI * 2;
    const d = Math.random() * r * 0.8;
    const x = r + Math.cos(a) * d;
    const y = r + Math.sin(a) * d;
    const rad = size * (0.05 + Math.random() * 0.07);
    const blob = ctx.createRadialGradient(x, y, 0, x, y, rad);
    blob.addColorStop(0, "rgba(246,236,206,0.85)");
    blob.addColorStop(0.6, "rgba(232,214,172,0.5)");
    blob.addColorStop(1, "rgba(214,188,138,0)");
    ctx.fillStyle = blob;
    ctx.beginPath();
    ctx.ellipse(x, y, rad, rad * (0.68 + Math.random() * 0.4), a, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 20; i++) {
    const a = Math.random() * Math.PI * 2;
    const d = r * (0.3 + Math.random() * 0.6);
    const x = r + Math.cos(a) * d;
    const y = r + Math.sin(a) * d;
    ctx.fillStyle = `rgba(58,26,10,${0.12 + Math.random() * 0.2})`;
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.02, size * 0.014, a, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Pečena kora: mrlje od vatre i neravnine testa. */
export function crustTexture(size = 512) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");

  ctx.fillStyle = "#d3a266";
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 220; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = size * (0.01 + Math.random() * 0.055);
    const dark = Math.random() < 0.45;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    if (dark) {
      g.addColorStop(0, "rgba(52,26,10,0.72)");
      g.addColorStop(1, "rgba(52,26,10,0)");
    } else {
      g.addColorStop(0, "rgba(240,203,140,0.5)");
      g.addColorStop(1, "rgba(240,203,140,0)");
    }
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // krupnije zagorele fleke, kao iz peći na drva
  for (let i = 0; i < 16; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = size * (0.03 + Math.random() * 0.045);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(24,10,4,0.9)");
    g.addColorStop(0.6, "rgba(38,17,6,0.55)");
    g.addColorStop(1, "rgba(38,17,6,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.6 + Math.random() * 0.6), Math.random() * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Tamna keramika sa blagom hrapavošću. */
export function ceramicRoughness(size = 512) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#7a7a7a";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 5000; i++) {
    const v = 90 + Math.random() * 90;
    ctx.fillStyle = `rgba(${v},${v},${v},0.35)`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

export const v2 = (x, y) => new THREE.Vector2(x, y);
