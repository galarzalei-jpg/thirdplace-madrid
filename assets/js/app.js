/* ThirdPlace Madrid — shared front-end logic.
   No backend: accounts, bookings, cart and orders live in localStorage (demo only). */

/* ===================== Storage ===================== */
const store = {
  get(k, d) { try { const v = localStorage.getItem("tp_" + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem("tp_" + k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem("tp_" + k); } catch (e) {} }
};

/* ===================== Language ===================== */
const LANG = store.get("lang", (navigator.language || "en").startsWith("es") ? "es" : "en");
document.documentElement.lang = LANG;
function t(key, en) {
  if (LANG === "es" && window.TP_ES && TP_ES[key] !== undefined) return TP_ES[key];
  return en !== undefined ? en : key;
}
const L = (o) => (o && typeof o === "object" ? (o[LANG] || o.en) : o);
function applyI18n(root = document) {
  if (LANG !== "es" || !window.TP_ES) return;
  root.querySelectorAll("[data-i18n]").forEach(el => {
    const v = TP_ES[el.dataset.i18n]; if (v !== undefined) el.innerHTML = v;
  });
  root.querySelectorAll("[data-i18n-ph]").forEach(el => {
    const v = TP_ES[el.dataset.i18nPh]; if (v !== undefined) el.placeholder = v;
  });
  const tk = document.body.dataset.title;
  if (tk && TP_ES[tk]) document.title = TP_ES[tk] + " · ThirdPlace Madrid";
}
function setLang(l) { store.set("lang", l); location.reload(); }

/* ===================== Formatting ===================== */
const euro = (n) => "€" + (Math.round(n * 100) / 100).toFixed(n % 1 ? 2 : 0);
const fmtDate = (iso, opts = { weekday: "short", day: "numeric", month: "short" }) =>
  new Date(iso + "T12:00:00").toLocaleDateString(LANG === "es" ? "es-ES" : "en-GB", opts);
const todayISO = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const monthKey = (iso) => iso.slice(0, 7);
const uid = () => Math.random().toString(36).slice(2, 9);
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ===================== Brand data ===================== */
const TIERS = {
  social: {
    name: "Social", price: 40, guestFree: 0, freeHours: 0, weekend: false, roomDiscount: 0,
    who: { en: "For meeting people and having a regular spot.", es: "Para conocer gente y tener tu sitio de siempre." },
    features: {
      en: ["Daily access, subject to availability", "Shared games, consoles and lounge", "Discounts on food and drink", "Member events and tournaments"],
      es: ["Acceso diario según disponibilidad", "Juegos, consolas y lounge compartidos", "Descuentos en comida y bebida", "Eventos y torneos para socios"]
    }
  },
  plus: {
    name: "Plus", price: 75, guestFree: 2, freeHours: 0, weekend: true, roomDiscount: 0,
    who: { en: "For the organiser who wants the weekend sorted.", es: "Para quien organiza y quiere el finde resuelto." },
    features: {
      en: ["Everything in Social", "Reserve tables and spots on weekends", "Priority booking of private rooms", "Guest privileges (2 free guests / month)"],
      es: ["Todo lo de Social", "Reserva de mesas y sitios el fin de semana", "Prioridad al reservar salas privadas", "Invitados (2 gratis al mes)"]
    }
  },
  elite: {
    name: "Elite", price: 150, guestFree: 4, freeHours: 4, weekend: true, roomDiscount: 0.2,
    who: { en: "For the host. Rooms included, everything taken care of.", es: "Para el anfitrión. Salas incluidas, todo resuelto." },
    features: {
      en: ["Everything in Plus", "4 hours of private room per month", "Amenities on every visit (welcome drink, food & drink credit, premium consoles & VR)", "20% off extra room hours", "4 guest passes per month", "Exclusive events and early access"],
      es: ["Todo lo de Plus", "4 horas de sala privada al mes", "Extras en cada visita (copa de bienvenida, crédito en comida y bebida, consolas premium y VR)", "20% de descuento en horas extra de sala", "4 pases de invitado al mes", "Eventos exclusivos y acceso anticipado"]
    }
  }
};
const GUEST_PASS = 15;

const ROOMS = {
  small: { name: { en: "Small room", es: "Sala pequeña" }, cap: 6, rate: 35, units: 4, img: "assets/img/rooms.jpg",
    alt: { en: "Small private room in Madrid with sofas and a big screen showing football", es: "Sala privada pequeña en Madrid con sofás y pantalla grande con fútbol" },
    desc: { en: "Up to 6 people. Big screen, consoles, karaoke, deep sofas and room service.", es: "Hasta 6 personas. Pantalla grande, consolas, karaoke, sofás y servicio a sala." } },
  large: { name: { en: "Large room", es: "Sala grande" }, cap: 12, rate: 55, units: 2, img: "assets/img/lounge.jpg",
    alt: { en: "Large private space for groups of up to 12, with bar and pool table", es: "Espacio privado grande para grupos de hasta 12, con barra y billar" },
    desc: { en: "Up to 12 people. Same set-up, built for big groups, birthdays and match nights.", es: "Hasta 12 personas. Mismo equipo, pensada para grupos grandes, cumpleaños y partidos." } }
};
const OPEN_SLOTS = ["12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00"];

const MENU = {
  food: [
    { n: { en: "ThirdPlace burger", es: "Burger ThirdPlace" }, d: { en: "Beef, cheddar, caramelised onion, fries", es: "Ternera, cheddar, cebolla caramelizada, patatas" }, p: 11 },
    { n: { en: "Pizza margherita", es: "Pizza margarita" }, d: { en: "Wood-fired, to share", es: "Al horno, para compartir" }, p: 12 },
    { n: { en: "Loaded nachos", es: "Nachos completos" }, d: { en: "Cheese, guacamole, jalapeños", es: "Queso, guacamole, jalapeños" }, p: 8 },
    { n: { en: "Sharing platter", es: "Tabla para compartir" }, d: { en: "Iberian ham, cheeses, croquetas", es: "Ibérico, quesos, croquetas" }, p: 18 },
    { n: { en: "Truffle fries", es: "Patatas trufadas" }, d: { en: "Parmesan and truffle mayo", es: "Parmesano y mayonesa de trufa" }, p: 6 }
  ],
  drinks: [
    { n: { en: "Signature cocktails", es: "Cócteles de autor" }, d: { en: "The Third, Amber Old Fashioned, Madrid Mule", es: "The Third, Amber Old Fashioned, Madrid Mule" }, p: 9 },
    { n: { en: "Craft beer", es: "Cerveza artesana" }, d: { en: "Local Madrid breweries", es: "Cerveceras de Madrid" }, p: 4 },
    { n: { en: "Wine by the glass", es: "Copa de vino" }, d: { en: "Ribera, Rueda, Rioja", es: "Ribera, Rueda, Rioja" }, p: 4.5 },
    { n: { en: "Mocktails", es: "Cócteles sin alcohol" }, d: { en: "Because good nights don't need alcohol", es: "Porque las buenas noches no necesitan alcohol" }, p: 6 },
    { n: { en: "Soft drinks & coffee", es: "Refrescos y café" }, d: { en: "", es: "" }, p: 3 }
  ]
};

const PRODUCTS = [
  { id: "hoodie", name: { en: "Classic 3 hoodie", es: "Sudadera Classic 3" }, price: 55, sizes: ["S","M","L","XL"],
    desc: { en: "Heavyweight black cotton, gold 3 on the chest.", es: "Algodón negro grueso, 3 dorado en el pecho." } },
  { id: "cap", name: { en: "Night cap", es: "Gorra Night" }, price: 25, sizes: null,
    desc: { en: "Black six-panel cap, embroidered symbol.", es: "Gorra negra de seis paneles, símbolo bordado." } },
  { id: "bottle", name: { en: "Brass bottle", es: "Botella Brass" }, price: 22, sizes: null,
    desc: { en: "Matte black steel bottle, 750 ml.", es: "Botella de acero negro mate, 750 ml." } },
  { id: "gift", name: { en: "Gift a month", es: "Regala un mes" }, price: 40, sizes: null,
    desc: { en: "One month of Social membership for a friend.", es: "Un mes de membresía Social para un amigo." } }
];
const ART = {
  hoodie: '<svg viewBox="0 0 100 100" fill="none" stroke="#C9A66B" stroke-width="1.4"><path d="M35 18c3 6 9 9 15 9s12-3 15-9l14 7 12 22-11 6-6-10v45H26V43l-6 10-11-6 12-22z" fill="#0E0C0B"/><path d="M40 18c2 9 6 14 10 14s8-5 10-14"/><text x="50" y="62" text-anchor="middle" fill="#E9A54B" stroke="none" font-family="Jost" font-weight="300" font-size="20">3</text></svg>',
  cap: '<svg viewBox="0 0 100 100" fill="none" stroke="#C9A66B" stroke-width="1.4"><path d="M18 62c0-22 14-36 32-36s32 14 32 36z" fill="#0E0C0B"/><path d="M14 62h72c6 0 8 6 2 8-12 4-60 4-74 0-5-2-6-8 0-8z" fill="#0E0C0B"/><circle cx="50" cy="26" r="2"/><text x="50" y="54" text-anchor="middle" fill="#E9A54B" stroke="none" font-family="Jost" font-weight="300" font-size="18">3</text></svg>',
  bottle: '<svg viewBox="0 0 100 100" fill="none" stroke="#C9A66B" stroke-width="1.4"><rect x="42" y="8" width="16" height="10" rx="2" fill="#0E0C0B"/><path d="M40 18h20v8c6 3 8 7 8 12v48c0 4-3 6-6 6H38c-3 0-6-2-6-6V38c0-5 2-9 8-12z" fill="#0E0C0B"/><text x="50" y="66" text-anchor="middle" fill="#E9A54B" stroke="none" font-family="Jost" font-weight="300" font-size="20">3</text></svg>',
  gift: '<svg viewBox="0 0 100 100" fill="none" stroke="#C9A66B" stroke-width="1.4"><rect x="12" y="28" width="76" height="48" rx="6" fill="#0E0C0B"/><text x="24" y="60" fill="#E9A54B" stroke="none" font-family="Jost" font-weight="300" font-size="22">3</text><text x="40" y="52" fill="#F3EADB" stroke="none" font-family="Jost" font-size="6" letter-spacing="1.5">THIRDPLACE</text><text x="40" y="60" fill="#C9A66B" stroke="none" font-family="Jost" font-size="4" letter-spacing="2">GIFT · 1 MONTH</text></svg>'
};

/* Events: generated relative to today so the calendar always looks current */
function getEvents() {
  const base = new Date(); base.setHours(12, 0, 0, 0);
  const add = (days) => { const d = new Date(base); d.setDate(d.getDate() + days); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
  // next weekday helper: wd 0=Sun..6=Sat
  const next = (wd, weeks = 0) => { const diff = (wd - base.getDay() + 7) % 7 || 7; return add(diff + weeks * 7); };
  return [
    { id: "e1", type: "tournament", date: next(4), time: "20:00", spots: 32, title: { en: "EA Sports FC tournament", es: "Torneo EA Sports FC" }, desc: { en: "1v1 knockout on the big screens. Loser of each match pays the nachos.", es: "Eliminatoria 1v1 en las pantallas grandes. Quien pierde paga los nachos." }, gaming: true },
    { id: "e2", type: "match", date: next(3), time: "21:00", spots: 80, title: { en: "Champions League night", es: "Noche de Champions" }, desc: { en: "Every match on every screen, sharing platters and a full lounge.", es: "Todos los partidos en todas las pantallas, tablas para compartir y lounge lleno." } },
    { id: "e3", type: "themed", date: next(2), time: "19:30", spots: 40, title: { en: "Newcomers' night", es: "Noche de recién llegados" }, desc: { en: "New in Madrid? Come solo. Hosted board games and an easy way to meet people.", es: "¿Nuevo en Madrid? Ven solo. Juegos de mesa con anfitrión y una forma fácil de conocer gente." } },
    { id: "e4", type: "themed", date: next(5), time: "22:00", spots: 60, title: { en: "Karaoke Friday: 2000s hits", es: "Viernes de karaoke: éxitos de los 2000" }, desc: { en: "All private rooms switch to karaoke mode. Book one or join the open stage.", es: "Todas las salas privadas en modo karaoke. Reserva una o súbete al escenario abierto." } },
    { id: "e5", type: "tournament", date: next(6, 1), time: "18:00", spots: 24, title: { en: "Mario Kart Grand Prix", es: "Gran Premio de Mario Kart" }, desc: { en: "Four cups, one champion. Retro consoles and prizes from the bar.", es: "Cuatro copas, un campeón. Consolas retro y premios de la barra." }, gaming: true },
    { id: "e6", type: "food", date: next(4, 1), time: "20:30", spots: 20, elite: true, title: { en: "Elite tasting dinner", es: "Cena degustación Elite" }, desc: { en: "Chef's sharing menu with wine pairing. Elite members only.", es: "Menú para compartir del chef con maridaje. Solo socios Elite." } },
    { id: "e7", type: "themed", date: next(0, 1), time: "18:00", spots: 50, title: { en: "Sunday movie night", es: "Cine de domingo" }, desc: { en: "Blankets, popcorn and a cult classic on the big screen.", es: "Mantas, palomitas y un clásico de culto en la pantalla grande." } },
    { id: "e8", type: "tournament", date: next(2, 1), time: "20:00", spots: 16, title: { en: "Ping-pong ladder", es: "Liguilla de ping-pong" }, desc: { en: "Monthly ladder. Climb the board, earn bragging rights.", es: "Liguilla mensual. Sube en la tabla y presume." } },
    { id: "e9", type: "match", date: next(6, 2), time: "21:00", spots: 80, title: { en: "El Clásico on the big screen", es: "El Clásico en pantalla grande" }, desc: { en: "Both sides welcome. Matchday menu and reserved spots for Plus & Elite.", es: "Todos los colores bienvenidos. Menú de partido y sitios reservados para Plus y Elite." } },
    { id: "e10", type: "themed", date: next(5, 2), time: "21:00", spots: 70, title: { en: "Board game marathon", es: "Maratón de juegos de mesa" }, desc: { en: "Over 200 games on the shelf and game masters to teach you.", es: "Más de 200 juegos en la estantería y monitores que te enseñan." } },
    { id: "e11", type: "food", date: next(3, 2), time: "20:00", spots: 30, title: { en: "Pizza & pub quiz", es: "Pizza y pub quiz" }, desc: { en: "Teams of up to six. Winners drink free for the night.", es: "Equipos de hasta seis. Los ganadores beben gratis esa noche." } },
    { id: "e12", type: "tournament", date: next(1, 3), time: "20:00", spots: 32, title: { en: "VR night", es: "Noche de VR" }, desc: { en: "Try every headset and compete in rhythm and racing games.", es: "Prueba todas las gafas y compite en juegos de ritmo y carreras." }, gaming: true }
  ].sort((a, b) => a.date.localeCompare(b.date));
}
const EVENT_TYPES = {
  tournament: { en: "Tournaments", es: "Torneos" },
  match: { en: "Match nights", es: "Partidos" },
  themed: { en: "Themed nights", es: "Noches temáticas" },
  food: { en: "Food experiences", es: "Experiencias gastronómicas" }
};

/* ===================== Accounts (demo) ===================== */
function seedUsers() {
  const users = store.get("users", null);
  if (users) return;
  store.set("users", [
    { id: "u_social", name: "Lucía Martín", email: "social@thirdplace.test", password: "thirdplace", tier: "social", since: "2026-09-01", phone: "" },
    { id: "u_plus", name: "Carlos Ruiz", email: "plus@thirdplace.test", password: "thirdplace", tier: "plus", since: "2026-06-15", phone: "" },
    { id: "u_elite", name: "Javier Ortega", email: "elite@thirdplace.test", password: "thirdplace", tier: "elite", since: "2026-03-02", phone: "" }
  ]);
}
seedUsers();
const Auth = {
  users: () => store.get("users", []),
  current() { const id = store.get("session", null); return id ? this.users().find(u => u.id === id) || null : null; },
  login(email, pw) {
    const u = this.users().find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === pw);
    if (u) store.set("session", u.id);
    return u || null;
  },
  logout() { store.del("session"); },
  register(data) {
    const users = this.users();
    if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) return { error: "exists" };
    const u = { id: "u_" + uid(), since: todayISO(), ...data };
    users.push(u); store.set("users", users); store.set("session", u.id);
    return { user: u };
  },
  update(patch) {
    const users = this.users(); const me = this.current(); if (!me) return;
    const i = users.findIndex(u => u.id === me.id); users[i] = { ...users[i], ...patch }; store.set("users", users);
    return users[i];
  },
  remove() {
    const me = this.current(); if (!me) return;
    store.set("users", this.users().filter(u => u.id !== me.id));
    store.set("bookings", store.get("bookings", []).filter(b => b.user !== me.id));
    this.logout();
  }
};

/* ===================== Cart ===================== */
const Cart = {
  items: () => store.get("cart", []),
  save(items) { store.set("cart", items); updateCartCount(); },
  add(id, size) {
    const items = this.items(); const key = id + (size ? "-" + size : "");
    const f = items.find(i => i.key === key);
    if (f) f.qty++; else items.push({ key, id, size: size || null, qty: 1 });
    this.save(items);
  },
  setQty(key, q) { let items = this.items(); const f = items.find(i => i.key === key); if (!f) return; f.qty = q; if (q <= 0) items = items.filter(i => i.key !== key); this.save(items); },
  count() { return this.items().reduce((s, i) => s + i.qty, 0); },
  total() { return this.items().reduce((s, i) => s + PRODUCTS.find(p => p.id === i.id).price * i.qty, 0); },
  clear() { this.save([]); }
};
function updateCartCount() {
  const el = document.querySelector(".cart-count"); if (!el) return;
  const n = Cart.count(); el.textContent = n; el.classList.toggle("show", n > 0);
}

/* ===================== UI helpers ===================== */
function toast(msg, type) {
  let el = document.querySelector(".toast");
  if (!el) { el = document.createElement("div"); el.className = "toast"; document.body.appendChild(el); }
  el.textContent = msg; el.className = "toast" + (type === "error" ? " error" : "");
  requestAnimationFrame(() => el.classList.add("show"));
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("show"), 3200);
}
function modal(html) {
  let bg = document.querySelector(".modal-bg");
  if (!bg) {
    bg = document.createElement("div"); bg.className = "modal-bg";
    bg.addEventListener("click", e => { if (e.target === bg || e.target.closest(".modal-close")) bg.classList.remove("open"); });
    document.body.appendChild(bg);
  }
  bg.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><button class="modal-close" aria-label="Close">×</button>${html}</div>`;
  bg.classList.add("open");
  return bg;
}
function closeModal() { const bg = document.querySelector(".modal-bg"); if (bg) bg.classList.remove("open"); }
function membersOnlyModal(what) {
  modal(`<span class="logo-3">3</span>
    <h3>${t("mo_title", "Members only")}</h3>
    <p>${what || t("mo_text", "Booking is for members. Join in two minutes, or log in if you already have an account.")}</p>
    <div class="btn-row"><a class="btn btn-primary" href="join.html">${t("join_now", "Join now")}</a><a class="btn btn-ghost" href="login.html?next=${encodeURIComponent(location.pathname.split("/").pop() + location.search)}">${t("log_in", "Log in")}</a></div>`);
}

/* Simple form validation: fields with data-rule */
function validate(form) {
  let ok = true;
  form.querySelectorAll("[data-rule]").forEach(inp => {
    const field = inp.closest(".field"); const v = inp.value.trim(); let good = true;
    inp.dataset.rule.split(" ").forEach(r => {
      if (r === "req" && !v) good = false;
      if (r === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) good = false;
      if (r === "min6" && v.length < 6) good = false;
      if (r === "phone" && v && !/^[+\d][\d\s]{7,}$/.test(v)) good = false;
      if (r === "card" && !luhn(v.replace(/\s/g, ""))) good = false;
      if (r === "exp" && !validExp(v)) good = false;
      if (r === "cvc" && !/^\d{3,4}$/.test(v)) good = false;
      if (r === "adult" && v) { const a = (Date.now() - new Date(v)) / 31557600000; if (a < 18) good = false; }
      if (r === "future" && v && v < todayISO()) good = false;
      if (r === "check" && !inp.checked) good = false;
    });
    if (field) field.classList.toggle("invalid", !good);
    if (!good) ok = false;
  });
  if (!ok) { const f = form.querySelector(".invalid input, .invalid select, .invalid textarea"); if (f) f.focus(); }
  return ok;
}
function luhn(n) {
  if (!/^\d{13,19}$/.test(n)) return false;
  let s = 0, alt = false;
  for (let i = n.length - 1; i >= 0; i--) { let d = +n[i]; if (alt) { d *= 2; if (d > 9) d -= 9; } s += d; alt = !alt; }
  return s % 10 === 0;
}
function validExp(v) {
  const m = v.match(/^(\d{2})\s*\/\s*(\d{2})$/); if (!m) return false;
  const mo = +m[1], yr = 2000 + +m[2]; if (mo < 1 || mo > 12) return false;
  const now = new Date(); return yr > now.getFullYear() || (yr === now.getFullYear() && mo >= now.getMonth() + 1);
}
function cardFormatting(root) {
  root.querySelectorAll("[data-rule~=card]").forEach(i => i.addEventListener("input", () => {
    i.value = i.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  }));
  root.querySelectorAll("[data-rule~=exp]").forEach(i => i.addEventListener("input", e => {
    let v = i.value.replace(/\D/g, "").slice(0, 4); if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2); i.value = v;
  }));
}
function paymentFields() {
  return `<div class="notice">${t("pay_demo", "Demo checkout for a school project: no real payment is made. Use the test card 4242 4242 4242 4242, any future date and any CVC.")}</div>
    <div class="field"><label>${t("card_name", "Name on card")}</label><input data-rule="req" autocomplete="off"><div class="err">${t("err_req", "Required")}</div></div>
    <div class="field"><label>${t("card_num", "Card number")}</label><input data-rule="card" inputmode="numeric" placeholder="4242 4242 4242 4242" autocomplete="off"><div class="err">${t("err_card", "Enter a valid card number")}</div></div>
    <div class="form-row">
      <div class="field"><label>${t("card_exp", "Expiry (MM/YY)")}</label><input data-rule="exp" inputmode="numeric" placeholder="12/28" autocomplete="off"><div class="err">${t("err_exp", "Invalid date")}</div></div>
      <div class="field"><label>CVC</label><input data-rule="cvc" inputmode="numeric" placeholder="123" autocomplete="off"><div class="err">${t("err_cvc", "3 or 4 digits")}</div></div>
    </div>`;
}

/* ===================== Layout: header & footer ===================== */
const NAV = [
  ["club.html", "nav_club", "The Club"],
  ["rooms.html", "nav_rooms", "Private Rooms"],
  ["memberships.html", "nav_members", "Memberships"],
  ["events.html", "nav_events", "Events"],
  ["merch.html", "nav_merch", "Merch"],
  ["about.html", "nav_about", "About & Contact"]
];
const ICONS = {
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 7h14l-1.5 12h-11z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
  tt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.5 3 2.5 5 5.5 5"/></svg>',
  li: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/></svg>',
  wa: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>'
};
const WHATSAPP = "https://wa.me/34600000000?text=" + encodeURIComponent("Hi ThirdPlace!");
const LOGO = `<a href="index.html" class="logo" aria-label="ThirdPlace Madrid home"><span class="logo-3">3</span><span class="logo-word"><b>THIRDPLACE</b><small>MADRID</small></span></a>`;

function renderLayout() {
  const page = location.pathname.split("/").pop() || "index.html";
  const me = Auth.current();
  const links = NAV.map(([h, k, en]) => `<a href="${h}" class="${page === h ? "active" : ""}">${t(k, en)}</a>`).join("");
  const header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML = `<div class="container nav">
      ${LOGO}
      <nav class="nav-links" aria-label="Main">${links}</nav>
      <div class="nav-actions">
        <div class="lang-switch" role="group" aria-label="Language">
          <button class="${LANG === "es" ? "on" : ""}" data-lang="es">ES</button><button class="${LANG === "en" ? "on" : ""}" data-lang="en">EN</button>
        </div>
        <a class="icon-btn" href="cart.html" aria-label="${t("cart", "Cart")}">${ICONS.cart}<span class="cart-count"></span></a>
        ${me
          ? `<a class="icon-btn" href="account.html" aria-label="${t("my_account", "My account")}" title="${esc(me.name)}">${ICONS.user}</a>`
          : `<a class="login-link" href="login.html">${t("log_in", "Log in")}</a>`}
        ${me ? "" : `<a class="btn btn-primary btn-sm btn-join" href="join.html">${t("join_now", "Join now")}</a>`}
        <button class="icon-btn burger" aria-label="Menu" aria-expanded="false">${ICONS.menu}</button>
      </div>
    </div>`;
  const mob = document.createElement("div");
  mob.className = "mobile-menu";
  mob.innerHTML = `<div class="lang-switch" style="align-self:flex-start;margin-bottom:12px"><button class="${LANG === "es" ? "on" : ""}" data-lang="es">ES</button><button class="${LANG === "en" ? "on" : ""}" data-lang="en">EN</button></div>` +
    NAV.map(([h, k, en]) => `<a href="${h}">${t(k, en)}</a>`).join("") +
    (me ? `<a href="account.html">${t("my_account", "My account")}</a>` : `<a href="login.html">${t("log_in", "Log in")}</a><a class="btn btn-primary" href="join.html">${t("join_now", "Join now")}</a>`);
  document.body.prepend(mob);
  document.body.prepend(header);
  document.querySelectorAll("[data-lang]").forEach(b => b.addEventListener("click", () => setLang(b.dataset.lang)));
  const burger = header.querySelector(".burger");
  burger.addEventListener("click", () => { const o = mob.classList.toggle("open"); burger.setAttribute("aria-expanded", o); document.body.style.overflow = o ? "hidden" : ""; });

  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `<div class="container">
    <div class="footer-grid">
      <div>${LOGO}<p class="mt-2 small">${t("f_about", "More than a club. Your second living room. A members' club for young Madrid: lounge, bar, games and private rooms under one roof.")}</p>
        <div class="socials"><a href="#" aria-label="Instagram">${ICONS.ig}</a><a href="#" aria-label="TikTok">${ICONS.tt}</a><a href="#" aria-label="LinkedIn">${ICONS.li}</a></div></div>
      <div><h4>${t("f_explore", "Explore")}</h4><ul>${NAV.map(([h, k, en]) => `<li><a href="${h}">${t(k, en)}</a></li>`).join("")}</ul></div>
      <div><h4>${t("f_visit", "Visit")}</h4><ul>
        <li>Calle de Fernando VI, 3<br>28004 Madrid</li>
        <li>${t("hours_wk", "Mon–Thu 17:00–01:00")}</li><li>${t("hours_fs", "Fri–Sat 16:00–03:00")}</li><li>${t("hours_su", "Sun 12:00–00:00")}</li></ul></div>
      <div><h4>${t("f_list", "The waiting list")}</h4><p class="small">${t("f_list_txt", "Limited memberships. Get early access to openings and events.")}</p>
        <form class="newsletter" novalidate><input type="email" placeholder="${t("your_email", "Your email")}" aria-label="Email" required><button class="btn btn-primary btn-sm">${t("join", "Join")}</button></form></div>
    </div>
    <div class="footer-bottom"><span>© ${new Date().getFullYear()} ThirdPlace Madrid · #ThirdPlaceMadrid</span><span>${t("f_school", "School project: demo website, no real bookings or payments.")}</span></div>
  </div>`;
  document.body.appendChild(footer);
  footer.querySelector(".newsletter").addEventListener("submit", e => {
    e.preventDefault(); const i = e.target.querySelector("input");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.value.trim())) { toast(t("err_email", "Enter a valid email"), "error"); return; }
    const list = store.get("waitlist", []); if (!list.includes(i.value.trim())) list.push(i.value.trim()); store.set("waitlist", list);
    i.value = ""; toast(t("wl_ok", "You're on the list. See you soon."));
  });

  const wa = document.createElement("a");
  wa.className = "whatsapp-fab"; wa.href = WHATSAPP; wa.target = "_blank"; wa.rel = "noopener"; wa.setAttribute("aria-label", "WhatsApp");
  wa.innerHTML = ICONS.wa; document.body.appendChild(wa);
  updateCartCount();
}

/* Scroll reveal */
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("in")); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 });
  els.forEach(e => io.observe(e));
}

/* Shared renderers */
function tierCards(opts = {}) {
  const me = Auth.current();
  return Object.entries(TIERS).map(([k, tr]) => `
    <div class="tier ${k === "plus" ? "featured" : ""} reveal">
      ${k === "plus" ? `<span class="badge">${t("most_popular", "Most popular")}</span>` : ""}
      <h3>${tr.name}</h3>
      <div class="price">€${tr.price}<small> / ${t("month", "month")}</small></div>
      <p class="who">${L(tr.who)}</p>
      <ul>${L(tr.features).map(f => `<li>${f}</li>`).join("")}</ul>
      ${me && me.tier === k
        ? `<a class="btn btn-ghost btn-block" href="account.html">${t("your_plan", "Your current plan")}</a>`
        : `<a class="btn ${k === "plus" ? "btn-primary" : "btn-ghost"} btn-block" href="join.html?tier=${k}">${me ? t("switch_to", "Switch to") + " " + tr.name : t("join", "Join") + " " + tr.name}</a>`}
    </div>`).join("");
}
function menuList(items) {
  return `<ul class="menu-list">${items.map(i => `<li><span>${L(i.n)}${L(i.d) ? `<em>${L(i.d)}</em>` : ""}</span><span class="p">${euro(i.p)}</span></li>`).join("")}</ul>`;
}

/* Boot */
document.addEventListener("DOMContentLoaded", () => {
  renderLayout();
  applyI18n();
  if (typeof window.pageInit === "function") window.pageInit();
  applyI18n(document.querySelector("main") || document);
  initReveal();
});
