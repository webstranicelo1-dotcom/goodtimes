import "./styles/base.css";
import "./styles/components.css";
import "./styles/sections.css";

import { initScroll, gsap, ScrollTrigger } from "./lib/scroll.js";
import { initPreloader } from "./lib/preloader.js";
import { initNav } from "./lib/nav.js";
import { initMenu } from "./lib/menu-ui.js";
import { initGallery } from "./lib/gallery-ui.js";
import { initReservation } from "./lib/reservation.js";
import { initReveal } from "./lib/reveal.js";
import { createExperience } from "./three/experience.js";

const OPEN_FROM = 7;
const OPEN_TO = 24;

function setOpenStatus() {
  const el = document.getElementById("openStatus");
  if (!el) return;

  const hour = new Date().getHours() + new Date().getMinutes() / 60;
  const open = hour >= OPEN_FROM && hour < OPEN_TO;

  el.dataset.open = open ? "1" : "0";
  el.textContent = open ? "Trenutno otvoreno" : "Zatvoreno — otvaramo u 07:00";
}

const preloader = initPreloader();

document.getElementById("year").textContent = new Date().getFullYear();
setOpenStatus();

const lenis = initScroll();
initNav();
initMenu({ onChange: () => ScrollTrigger.refresh() });
initGallery();
initReservation();
initReveal();

// ---------- 3D scena ----------
const canvas = document.getElementById("webgl");
let experience = null;

try {
  experience = createExperience(canvas);
} catch (err) {
  console.warn("WebGL nije dostupan — sajt radi i bez 3D scene.", err);
  canvas.style.display = "none";
}

if (experience) {
  ScrollTrigger.create({
    trigger: document.documentElement,
    start: "top top",
    end: "max",
    onUpdate: (self) => experience.setScroll(self.progress),
  });

  ScrollTrigger.addEventListener("refresh", () => experience.measure());
  experience.measure();

  gsap.ticker.add((_time, deltaMs) => {
    experience.render(Math.min(deltaMs / 1000, 0.05));
  });
}

// ---------- završno merenje ----------
const settle = () => {
  ScrollTrigger.refresh();
  preloader.finish();
};

if (document.readyState === "complete") setTimeout(settle, 350);
else window.addEventListener("load", () => setTimeout(settle, 350));

document.fonts?.ready.then(() => ScrollTrigger.refresh());

if (import.meta.env.DEV) {
  window.__gt = { lenis, experience, ScrollTrigger };
}
