# Good Times Loznica — Caffe & Pizzeria

Sajt za Caffe & Pizzeriu Good Times (Pašićeva 2, Loznica). Vizuelno prati referencu iz
`portfolio-restaurant.png` — tamna paleta sa zlatnim akcentima i serifnim naslovima — a preko
toga ide WebGL scena kojom upravlja skrol: kamera putuje kroz mračnu prostoriju od šoljice
espresa, preko pice iz peći, do čaše na baru.

## Pokretanje

```bash
npm install
npm run dev      # http://localhost:5300
npm run build    # produkcijski build u dist/
npm run preview  # pregled builda
```

Potreban je Node 18+.

## Kako je sastavljeno

```
index.html                  sav sadržaj i struktura sekcija
src/main.js                 povezuje module i pokreta render loop
src/styles/                 base (tokeni, tipografija), components, sections
src/data/menu.js            kategorije, artikli i cene
src/data/gallery.js         slike galerije
src/lib/                    skrol, navigacija, meni, galerija, rezervacije, reveal
src/three/experience.js     renderer, svetla, post-processing
src/three/camera-rig.js     stanice kamere po sekcijama
src/three/props/            šoljica, pica, čaša, bokeh, prašina
```

### Scena kojom upravlja skrol

Svaka sekcija u `index.html` nosi `data-scene` atribut. `camera-rig.js` iz DOM-a izmeri gde se ta
sekcija nalazi na skrolu i tu postavi „stanicu" kamere (pozicija, tačka gledanja, fov). Kamera se
zatim glatko interpolira između stanica, uz dodatni parallax na pomeraj miša. Ako dodaš novu
sekciju, dodaj joj `data-scene="ime"` i upiši `ime` u `STATIONS` objekat.

Modeli su generisani u kodu (`LatheGeometry`, `TorusGeometry`, canvas teksture) — nema eksternih
`.glb` fajlova, pa se ništa ne učitava preko mreže osim fontova i fotografija.

### Kvalitet po uređaju

`detectQuality()` u `experience.js` gleda broj jezgara, širinu ekrana i tip pokazivača, pa spušta
broj čestica, isključuje bloom i zamenjuje `transmission` staklo jeftinijom varijantom na slabijim
uređajima. Uz `prefers-reduced-motion` scena se zamrzava, a smooth skrol se gasi.

## Šta treba proveriti pre objave

Nekoliko podataka je popunjeno na osnovu javno dostupnih izvora i treba ih potvrditi sa objektom:

- **Meni i cene** (`src/data/menu.js`) — artikli i cene su radna verzija.
- **Telefoni** — `015 / 892-415` i `015 / 893-008` su nađeni na PlanPlus i Top Local Places.
- **Radno vreme** — 07:00–24:00 svakog dana, dostava do 22:30.
- **Fotografije** — trenutno idu sa Unsplasha (`src/data/gallery.js`). Zameniti pravim
  fotografijama objekta: ubaci ih u `public/gallery/` i promeni `galleryThumb`/`galleryFull`.
- **Recenzija** u citat sekciji je preuzeta sa PlanPlus profila.

## Forma za rezervacije

Forma nema bekend. Nakon validacije sastavi tekst upita i ponudi tri koraka: poziv telefonom,
Instagram DM (`ig.me/m/goodtimesloznica`) i kopiranje teksta. Kada se odluči kanal (email servis,
Google Sheets, sopstveni endpoint), dovoljno je u `src/lib/reservation.js` u `submit` handleru
poslati `message` na taj endpoint.

## Hosting

`npm run build` daje statički `dist/` koji radi na bilo kom hostingu (Netlify, Vercel, Cloudflare
Pages, običan shared hosting). `base: "./"` u `vite.config.js` znači da radi i iz podfoldera.
