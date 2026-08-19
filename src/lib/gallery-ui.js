import { GALLERY, galleryThumb, galleryFull } from "../data/gallery.js";

export function initGallery({ onReady } = {}) {
  const grid = document.getElementById("galleryGrid");
  if (!grid) return;

  grid.innerHTML = GALLERY.map(
    (item, i) => `
      <figure class="gtile${item.span ? ` gtile--${item.span}` : ""} reveal" data-index="${i}" tabindex="0" role="button" aria-label="Uvećaj: ${item.alt}">
        <img src="${galleryThumb(item)}" alt="${item.alt}" loading="lazy" decoding="async" />
        <figcaption class="gtile__label">${item.label}</figcaption>
      </figure>`
  ).join("");

  const box = document.getElementById("lightbox");
  const img = document.getElementById("lightboxImg");
  const btnClose = document.getElementById("lightboxClose");
  const btnPrev = document.getElementById("lightboxPrev");
  const btnNext = document.getElementById("lightboxNext");

  let current = 0;
  let lastFocused = null;

  const show = (i) => {
    current = (i + GALLERY.length) % GALLERY.length;
    const item = GALLERY[current];
    img.src = galleryFull(item);
    img.alt = item.alt;
  };

  const open = (i) => {
    lastFocused = document.activeElement;
    show(i);
    box.hidden = false;
    document.body.classList.add("is-locked");
    requestAnimationFrame(() => box.classList.add("is-open"));
    btnClose.focus();
  };

  const close = () => {
    box.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    setTimeout(() => {
      box.hidden = true;
      img.src = "";
    }, 380);
    lastFocused?.focus();
  };

  grid.addEventListener("click", (e) => {
    const tile = e.target.closest(".gtile");
    if (tile) open(Number(tile.dataset.index));
  });

  grid.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const tile = e.target.closest(".gtile");
    if (!tile) return;
    e.preventDefault();
    open(Number(tile.dataset.index));
  });

  btnClose.addEventListener("click", close);
  btnPrev.addEventListener("click", () => show(current - 1));
  btnNext.addEventListener("click", () => show(current + 1));
  box.addEventListener("click", (e) => {
    if (e.target === box) close();
  });

  document.addEventListener("keydown", (e) => {
    if (box.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });

  onReady?.();
}
