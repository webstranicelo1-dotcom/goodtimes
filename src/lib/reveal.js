import { gsap, ScrollTrigger } from "./scroll.js";

export function initReveal() {
  ScrollTrigger.batch(".reveal", {
    start: "top 88%",
    once: true,
    interval: 0.12,
    batchMax: 8,
    onEnter: (els) =>
      els.forEach((el, i) => gsap.delayedCall(i * 0.085, () => el.classList.add("is-in"))),
  });

  // hero se prikazuje odmah, bez čekanja na skrol
  document
    .querySelectorAll(".hero .reveal")
    .forEach((el, i) => gsap.delayedCall(0.25 + i * 0.11, () => el.classList.add("is-in")));
}

/** Ponovo pokreće reveal za elemente ubačene naknadno (npr. panel menija). */
export function refreshReveal() {
  ScrollTrigger.refresh();
}
