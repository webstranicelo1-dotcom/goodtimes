const unsplash = (id, w) =>
  `https://images.unsplash.com/photo-${id}?q=80&w=${w}&auto=format&fit=crop`;

export const GALLERY = [
  { id: "1513104890138-7c749659a591", label: "Iz peći", span: "big", alt: "Napolitana pica sa bosiljkom" },
  { id: "1517248135467-4c7edcad34c4", label: "Naš prostor", span: "wide", alt: "Unutrašnjost kafića" },
  { id: "1470337458703-46ad1756a187", label: "Jutro", span: "", alt: "Latte sa crtežom u peni" },
  { id: "1574071318508-1cdbab80d002", label: "Zrno", span: "", alt: "Pržena zrna kafe" },
  { id: "1536935338788-846bb9981813", label: "Bar", span: "tall", alt: "Kokteli na baru" },
  { id: "1568901346375-23c9450c58cd", label: "Burger", span: "", alt: "Burger sa pomfritom" },
  { id: "1572116469696-31de0f17cc34", label: "Paste", span: "", alt: "Tanjir paste" },
  { id: "1554118811-1e0d58224f24", label: "Za druženje", span: "wide", alt: "Stolovi i fotelje u kafiću" },
  { id: "1551024506-0bccd828d307", label: "Slatko", span: "", alt: "Desert sa voćem" },
  { id: "1546069901-ba9599a7e63c", label: "Lagano", span: "", alt: "Zdrava salata u posudi" },
  { id: "1514933651103-005eec06c04b", label: "Večeri", span: "wide", alt: "Bar u večernjim satima" },
  { id: "1504674900247-0877df9cc836", label: "Glavno jelo", span: "", alt: "Tanjir sa glavnim jelom" },
];

export const galleryThumb = (item) => unsplash(item.id, 900);
export const galleryFull = (item) => unsplash(item.id, 1800);
