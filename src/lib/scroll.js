import Lenis from "lenis";
import "lenis/dist/lenis.css";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let instance = null;

/** Doskrola do elementa uz isti offset kao i navigacija. */
export function scrollToEl(el, extraOffset = -24) {
  if (!el) return;
  const headerH =
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 90;
  instance?.scrollTo(el, { offset: -headerH + extraOffset, duration: prefersReduced ? 0 : 1 });
}

export function initScroll() {
  const lenis = new Lenis({
    lerp: prefersReduced ? 1 : 0.085,
    wheelMultiplier: 1,
    touchMultiplier: 1.6,
    smoothWheel: !prefersReduced,
    autoRaf: false,
  });

  instance = lenis;
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  const headerOffset = () =>
    -(parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 90);

  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const id = link.getAttribute("href");
    if (!id || id === "#") return;

    const el = document.querySelector(id);
    if (!el) return;

    e.preventDefault();
    lenis.scrollTo(el, { offset: headerOffset(), duration: prefersReduced ? 0 : 1.35 });
    document.dispatchEvent(new CustomEvent("gt:navigate"));
  });

  return lenis;
}

export { gsap, ScrollTrigger };
