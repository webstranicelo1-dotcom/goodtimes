import { scrollToEl } from "./scroll.js";

const PHONE = "015 / 892-415";

const pad = (n) => String(n).padStart(2, "0");

/** 1 osoba, 2–4 osobe, 5+ osoba. */
const peopleLabel = (value) => {
  if (value === "13+") return "više od 12 osoba";
  const n = Number(value);
  if (n === 1) return "1 osoba";
  return `${n} ${n < 5 ? "osobe" : "osoba"}`;
};

function fillOptions(form) {
  const timeSelect = form.elements.vreme;
  for (let h = 7; h <= 23; h++) {
    for (const m of [0, 30]) {
      const value = `${pad(h)}:${pad(m)}`;
      timeSelect.insertAdjacentHTML("beforeend", `<option value="${value}">${value}</option>`);
    }
  }

  const people = form.elements.osobe;
  for (let i = 1; i <= 12; i++) {
    people.insertAdjacentHTML("beforeend", `<option value="${i}">${peopleLabel(String(i))}</option>`);
  }
  people.insertAdjacentHTML("beforeend", `<option value="13+">Više od 12 — proslava</option>`);

  const date = form.elements.datum;
  const today = new Date();
  const iso = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  date.min = iso;
  date.value = iso;
}

const RULES = {
  ime: (v) => (v.trim().length >= 2 ? "" : "Unesite ime i prezime."),
  telefon: (v) =>
    (v.replace(/\D/g, "").length >= 6 ? "" : "Unesite broj na koji možemo da vas pozovemo."),
  datum: (v) => {
    if (!v) return "Izaberite datum.";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(v) < today ? "Datum je u prošlosti." : "";
  },
  vreme: (v) => (v ? "" : "Izaberite vreme."),
  osobe: (v) => (v ? "" : "Izaberite broj osoba."),
};

function validateField(input) {
  const rule = RULES[input.name];
  if (!rule) return true;

  const message = rule(input.value);
  const field = input.closest(".field");
  field.classList.toggle("has-error", Boolean(message));
  field.querySelector(".field__err").textContent = message;
  return !message;
}

function buildMessage(data) {
  const [y, m, d] = data.datum.split("-");
  const people = peopleLabel(data.osobe);

  const lines = [
    `Rezervacija — Good Times`,
    `Ime: ${data.ime}`,
    `Telefon: ${data.telefon}`,
    `Kada: ${d}.${m}.${y}. u ${data.vreme}`,
    `Broj osoba: ${people}`,
  ];
  if (data.povod?.trim()) lines.push(`Povod: ${data.povod.trim()}`);
  if (data.napomena?.trim()) lines.push(`Napomena: ${data.napomena.trim()}`);

  return lines.join("\n");
}

export function initReservation() {
  const form = document.getElementById("reserveForm");
  const done = document.getElementById("reserveDone");
  const summary = document.getElementById("reserveSummary");
  const copyBtn = document.getElementById("reserveCopy");
  const again = document.getElementById("reserveAgain");
  if (!form) return;

  fillOptions(form);

  form.querySelectorAll("input, select, textarea").forEach((input) => {
    input.addEventListener("blur", () => validateField(input));
    input.addEventListener("input", () => {
      if (input.closest(".field").classList.contains("has-error")) validateField(input);
    });
  });

  let message = "";

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const inputs = [...form.querySelectorAll("input, select, textarea")];
    const valid = inputs.map(validateField).every(Boolean);

    if (!valid) {
      form.querySelector(".has-error input, .has-error select")?.focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    message = buildMessage(data);

    const [y, m, d] = data.datum.split("-");
    summary.textContent = `${data.ime}, ${d}.${m}.${y}. u ${data.vreme} — ${peopleLabel(data.osobe)}. Pošaljite nam upit na Instagram ili nas pozovite na ${PHONE} da potvrdimo sto.`;

    form.hidden = true;
    done.hidden = false;
    scrollToEl(done.closest(".reserve__card"));
  });

  copyBtn?.addEventListener("click", async () => {
    const label = copyBtn.textContent;
    try {
      await navigator.clipboard.writeText(message);
      copyBtn.textContent = "Kopirano";
    } catch {
      copyBtn.textContent = "Kopiranje nije dozvoljeno";
    }
    setTimeout(() => (copyBtn.textContent = label), 2200);
  });

  again?.addEventListener("click", () => {
    done.hidden = true;
    form.hidden = false;
    form.elements.ime.focus();
  });
}
