export function initPreloader() {
  const el = document.getElementById("preloader");
  const fill = document.getElementById("preloaderFill");
  if (!el) return { finish() {} };

  let progress = 0;
  let done = false;

  const tick = () => {
    if (done) return;
    progress = Math.min(progress + Math.random() * 13 + 5, 92);
    fill.style.width = `${progress}%`;
    setTimeout(tick, 110);
  };
  tick();

  return {
    finish() {
      if (done) return;
      done = true;
      fill.style.width = "100%";
      setTimeout(() => {
        el.classList.add("is-done");
        setTimeout(() => el.remove(), 950);
      }, 300);
    },
  };
}
