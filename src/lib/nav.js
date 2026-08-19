import { ScrollTrigger } from "./scroll.js";

export function initNav() {
  const header = document.getElementById("header");
  const nav = document.getElementById("nav");
  const burger = document.getElementById("burger");
  const links = [...nav.querySelectorAll(".nav__link")];

  // ---- lepljivi header ----
  ScrollTrigger.create({
    start: 60,
    end: "max",
    toggleClass: { targets: header, className: "is-stuck" },
  });

  // ---- mobilni meni ----
  const setOpen = (open) => {
    nav.classList.toggle("is-open", open);
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Zatvori meni" : "Otvori meni");
    document.body.classList.toggle("is-locked", open);
  };

  burger.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
  document.addEventListener("gt:navigate", () => setOpen(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  // ---- aktivna sekcija ----
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;

      const id = `#${visible.target.id}`;
      links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === id));
    },
    { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.2, 0.5, 1] }
  );

  sections.forEach((s) => observer.observe(s));
}
