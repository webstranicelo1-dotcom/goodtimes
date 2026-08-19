import { MENU } from "../data/menu.js";

const price = (v) => `${v.toLocaleString("sr-RS")} din`;

function itemMarkup(item, index) {
  return `
    <li class="mi" style="animation-delay:${index * 45}ms">
      <div class="mi__top">
        <h4 class="mi__name">${item.name}${
          item.tag ? `<span class="mi__tag">${item.tag}</span>` : ""
        }</h4>
        <span class="mi__dots" aria-hidden="true"></span>
        <span class="mi__price">${price(item.price)}</span>
      </div>
      <p class="mi__desc">${item.desc}</p>
    </li>`;
}

export function initMenu({ onChange } = {}) {
  const tabsEl = document.getElementById("menuTabs");
  const panelsEl = document.getElementById("menuPanels");
  if (!tabsEl || !panelsEl) return;

  tabsEl.innerHTML = MENU.map(
    (cat, i) => `
      <button class="tab${i === 0 ? " is-active" : ""}"
              role="tab"
              id="tab-${cat.id}"
              aria-selected="${i === 0}"
              aria-controls="panel-${cat.id}">${cat.label}</button>`
  ).join("");

  panelsEl.innerHTML = MENU.map(
    (cat, i) => `
      <div class="menu__panel${i === 0 ? " is-active" : ""}"
           role="tabpanel"
           id="panel-${cat.id}"
           aria-labelledby="tab-${cat.id}">
        ${cat.note ? `<p class="section-head__lead" style="text-align:center;margin:0 auto 2.4rem;max-width:44rem">${cat.note}</p>` : ""}
        <ul class="menu__list">${cat.items.map(itemMarkup).join("")}</ul>
      </div>`
  ).join("");

  const tabs = [...tabsEl.querySelectorAll(".tab")];
  const panels = [...panelsEl.querySelectorAll(".menu__panel")];

  const activate = (i) => {
    tabs.forEach((t, j) => {
      t.classList.toggle("is-active", i === j);
      t.setAttribute("aria-selected", String(i === j));
    });
    panels.forEach((p, j) => p.classList.toggle("is-active", i === j));

    // restart CSS animacije za stavke u novom panelu
    panels[i].querySelectorAll(".mi").forEach((el) => {
      el.style.animation = "none";
      void el.offsetHeight;
      el.style.animation = "";
    });

    onChange?.();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => activate(i));
    tab.addEventListener("keydown", (e) => {
      const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      const next = (i + dir + tabs.length) % tabs.length;
      tabs[next].focus();
      activate(next);
    });
  });
}
