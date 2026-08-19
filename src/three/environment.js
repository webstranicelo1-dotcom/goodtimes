import * as THREE from "three";

/**
 * Ručno crtan equirect env map: mrkla soba sa toplim izvorima svetla.
 * Daje zlatne refleksije bez učitavanja HDRI fajla.
 */
export function createEnvironment(renderer) {
  const w = 1024;
  const h = 512;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");

  const base = ctx.createLinearGradient(0, 0, 0, h);
  base.addColorStop(0, "#100c09");
  base.addColorStop(0.42, "#1a130c");
  base.addColorStop(0.62, "#0b0806");
  base.addColorStop(1, "#050403");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);

  const lights = [
    { x: 0.18, y: 0.34, r: 0.3, c: "255,182,96", a: 0.95 },
    { x: 0.52, y: 0.22, r: 0.22, c: "255,206,140", a: 0.7 },
    { x: 0.79, y: 0.4, r: 0.26, c: "236,150,70", a: 0.8 },
    { x: 0.36, y: 0.52, r: 0.16, c: "255,160,70", a: 0.45 },
    { x: 0.94, y: 0.28, r: 0.14, c: "255,224,178", a: 0.5 },
    { x: 0.06, y: 0.6, r: 0.18, c: "196,120,52", a: 0.35 },
  ];

  for (const l of lights) {
    const g = ctx.createRadialGradient(l.x * w, l.y * h, 0, l.x * w, l.y * h, l.r * w);
    g.addColorStop(0, `rgba(${l.c},${l.a})`);
    g.addColorStop(0.4, `rgba(${l.c},${l.a * 0.32})`);
    g.addColorStop(1, `rgba(${l.c},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  // slabo hladno svetlo odozgo, da zlato ne ispadne jednolično
  const top = ctx.createRadialGradient(w * 0.66, 0, 0, w * 0.66, 0, w * 0.4);
  top.addColorStop(0, "rgba(150,170,200,0.22)");
  top.addColorStop(1, "rgba(150,170,200,0)");
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, w, h);

  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMap = pmrem.fromEquirectangular(tex).texture;

  pmrem.dispose();
  tex.dispose();

  return envMap;
}
