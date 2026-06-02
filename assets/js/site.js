/* =====================================================================
   Дворец культуры «ИСТОК» — ядро сайта
   Меню, шапка и подвал определены здесь один раз и вставляются на каждую
   страницу — так ни одна вкладка не теряется. Здесь же набор SVG-иконок.
   ===================================================================== */

/* ---------- Набор линейных SVG-иконок (один стиль, обводка currentColor) --- */
const ICONS = {
  ticket:   '<path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h13A2.5 2.5 0 0 1 21 8.5v1a2 2 0 0 0 0 5v1a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 15.5v-1a2 2 0 0 0 0-5z"/><path d="M14.5 6v12" stroke-dasharray="1.5 2.5"/>',
  edit:     '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  card:     '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3 10h18"/><path d="M7 15h4"/>',
  pin:      '<path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.6"/>',
  doc:      '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/>',
  back:     '<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
  award:    '<circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.5 7 21l5-2.6L17 21l-1.5-7.5"/>',
  news:     '<path d="M4 5h13v14H6a2 2 0 0 1-2-2z"/><path d="M17 8h3v9a2 2 0 0 1-2 2"/><path d="M7 9h7M7 13h7M7 16h4"/>',
  partners: '<path d="M12 21a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17z"/><path d="m8.5 12 2.2 2.2L15.5 9.5"/>',
  phone:    '<path d="M5 4h3l1.8 4.5-2 1.4a12 12 0 0 0 5.3 5.3l1.4-2L19 19v1a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  shield:   '<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z"/><path d="m9.5 12 1.8 1.8L15 10"/>',
  download: '<path d="M12 3v12"/><path d="m7.5 11 4.5 4.5L16.5 11"/><path d="M5 20h14"/>',
  mail:     '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/>',
  clock:    '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  calendar: '<rect x="4" y="5" width="16" height="16" rx="2.5"/><path d="M4 9h16M9 3v4M15 3v4"/>',
  vk:       '<path d="M4 7c.6 5.8 3.8 9.5 8.7 9.5h.5v-3.3c1.6.2 2.8 1.4 3.3 3.3H19c-.5-2.1-1.7-3.3-2.8-3.8 1.1-.6 2.4-1.9 2.7-3.7h-2.2c-.4 1.5-1.5 2.7-2.5 2.9V7h-2.3v5.3c-1.4-.4-3-1.9-3.1-5.3z"/>',
  ext:      '<path d="M14 5h5v5"/><path d="M19 5 9.5 14.5"/><path d="M18 13v5a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 5 18V8a1.5 1.5 0 0 1 1.5-1.5H11"/>',
  caret:    '<path d="m4 7 4 4 4-4" stroke-width="1.8"/>',
  arrowR:   '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  chevL:    '<path d="m14 6-6 6 6 6"/>',
  chevR:    '<path d="m10 6 6 6-6 6"/>',
  star:     '<path d="M12 3.5 14.6 9l6 .8-4.4 4.2 1.1 6L12 17.2 6.7 20l1.1-6L3.4 9.8l6-.8z"/>',
  masks:    '<path d="M4 5h7v6a3.5 3.5 0 0 1-7 0z"/><path d="M7 9h.01M9 9h.01M6.5 12s.7 1 1.5 1 1.5-1 1.5-1"/><path d="M13 8h7v5a3.5 3.5 0 0 1-7 0z"/>',
};

function svg(name) {
  const body = ICONS[name];
  if (!body) return "";
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;
}
function icon(name, cls = "ico") { return `<span class="${cls}">${svg(name)}</span>`; }

/* --- Полная структура навигации (1:1 с оригиналом fdkistok.ru) --- */
const NAV = [
  { label: "Главная", href: "index.html", children: [
      { label: "Афиша мероприятий", href: "afisha.html" },
      { label: "Выездные и уличные мероприятия", href: "vyezdnye.html" },
  ]},
  { label: "Творческий лагерь «ЗВЕЗДА»", href: "zvezda.html" },
  { label: "Наши коллективы", href: "kollektivy.html", children: [
      { label: "Каталог кружков и студий", href: "kollektivy.html" },
      { label: "Правила приёма", href: "pravila-priema.html" },
      { label: "Электронная запись", href: "https://dk.mosreg.ru/dk/istok/workshops" },
  ]},
  { label: "Фоторепортаж", href: "fotoreportazh.html" },
  { label: "Участие в конкурсах и фестивалях", href: "konkursy.html" },
  { label: "Большой зал", href: "bolshoj-zal.html" },
  { label: "Малый зал", href: "malyj-zal.html" },
  { label: "Контакты", href: "kontakty.html", children: [
      { label: "О Нас", href: "o-nas.html", children: [
          { label: "История", href: "istoriya.html" },
          { label: "Награды", href: "nagrady.html" },
          { label: "Пресса о нас", href: "http://ia-fryaz.mosoblonline.ru/" },
          { label: "Спонсорам", href: "sponsoram.html" },
      ]},
      { label: "Обратная связь", href: "obratnaya-svyaz.html" },
  ]},
  { label: "Форум", href: "https://fdkistok.ru/forums/forum/forum/", children: [
      { label: "Опросы", href: "https://fdkistok.ru/forums/forum/oprosy/" },
      { label: "Форум fryazino.net", href: "http://fryazino.net/forum/forum15/topic370/" },
  ]},
  { label: "Платные услуги", href: "platnye-uslugi.html" },
  { label: "Документы", href: "dokumenty.html", children: [
      { label: "Документы для зачисления в клубные формирования", href: "dokumenty-zachislenie.html" },
      { label: "Правила приёма в кружки", href: "pravila-priema.html" },
      { label: "Противодействие коррупции", href: "korrupcia.html" },
  ]},
];

const TOPLINKS = [
  { label: "Министерство культуры", href: "http://mk.mosreg.ru/" },
  { label: "Наукоград Фрязино", href: "http://www.fryazino.org/" },
  { label: "Семья Победы", href: "http://www.ote4estvo.ru/semya-pobedy/" },
  { label: "Электронная запись", href: "https://dk.mosreg.ru/dk/istok/workshops" },
];

const CONTACTS = {
  org: "МУ «Дворец культуры «Исток» г. Фрязино»",
  address: "Московская область, г. Фрязино, ул. Комсомольская, д. 17",
  phone: "8 (496) 255-48-22",
  boxOfficePhones: ["8-916-978-62-36", "8 (496) 255-48-23"],
  boxOfficeHours: "с 11:00 до 19:00 (перерыв 13:00–14:00). Выходные: вс, пн.",
  workHours: "Ежедневно, без обеда, с 8:00 до 22:00",
  email: "fdkistok@yandex.ru",
};

/* --- Утилиты --- */
const isExternal = (href) => /^https?:\/\//i.test(href);
const currentPage = () => {
  const p = location.pathname.split("/").pop();
  return p === "" ? "index.html" : p;
};

function markActive(item) {
  const cur = currentPage();
  if (!isExternal(item.href) && item.href === cur) return "active";
  if (item.children && item.children.some(c => deepActive(c, cur))) return "active-parent";
  return "";
}
function deepActive(item, cur) {
  if (!isExternal(item.href) && item.href === cur) return true;
  return item.children ? item.children.some(c => deepActive(c, cur)) : false;
}

function buildMenu(items) {
  return `<ul>${items.map(it => {
    const ext = isExternal(it.href);
    const cls = markActive(it);
    const hasKids = it.children && it.children.length;
    return `<li class="${cls}${hasKids ? " has-children" : ""}">
      <a href="${it.href}"${ext ? ' target="_blank" rel="noopener"' : ""}>
        <span>${it.label}</span>${ext ? `<span class="ext">${svg("ext")}</span>` : ""}${hasKids ? `<span class="caret">${svg("caret")}</span>` : ""}
      </a>
      ${hasKids ? buildMenu(it.children) : ""}
    </li>`;
  }).join("")}</ul>`;
}

/* --- Шапка --- */
function renderHeader() {
  const top = TOPLINKS.map(l =>
    `<a href="${l.href}" target="_blank" rel="noopener">${l.label}</a>`).join("");

  return `
  <div class="topbar">
    <div class="topbar__inner">
      <div class="topbar__links">${top}</div>
      <div class="topbar__phone">${icon("ticket")} Билетная касса: <a href="tel:+74962554823">${CONTACTS.boxOfficePhones[1]}</a></div>
    </div>
  </div>
  <header class="site-header">
    <div class="site-header__inner">
      <a class="brand" href="index.html">
        <span class="brand__mark">ДК</span>
        <span class="brand__text">
          <span class="brand__name">«ИСТОК»</span>
          <span class="brand__sub">Дворец культуры · Фрязино</span>
        </span>
      </a>
      <button class="burger" id="burger" aria-label="Меню" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>
  <div class="navbar">
    <nav class="mainnav" id="mainnav">${buildMenu(NAV)}</nav>
  </div>
  <div class="nav-backdrop" id="nav-backdrop" aria-hidden="true"></div>`;
}

/* --- Подвал --- */
function renderFooter() {
  const cols = NAV.slice(0, 8).map(it =>
    `<a href="${it.href}"${isExternal(it.href) ? ' target="_blank" rel="noopener"' : ""}>${it.label}</a>`
  ).join("");

  return `
  <footer class="site-footer">
    <div class="container site-footer__grid">
      <div class="foot-col">
        <div class="foot-brand">«ИСТОК»</div>
        <p>${CONTACTS.address}</p>
        <p>Тел.: <a href="tel:+74962554822">${CONTACTS.phone}</a></p>
        <p>E-mail: <a href="mailto:${CONTACTS.email}">${CONTACTS.email}</a></p>
        <p class="muted">${CONTACTS.workHours}</p>
      </div>
      <div class="foot-col">
        <div class="foot-title">Разделы</div>
        <nav class="foot-nav">${cols}</nav>
      </div>
      <div class="foot-col">
        <div class="foot-title">Билетная касса</div>
        <p>${CONTACTS.boxOfficePhones.join(" · ")}</p>
        <p class="muted">${CONTACTS.boxOfficeHours}</p>
        <div class="foot-social">
          <a class="btn btn--ghost btn--sm" href="http://vk.com/dkistok" target="_blank" rel="noopener">${icon("vk")} Мы ВКонтакте</a>
        </div>
      </div>
    </div>
    <div class="site-footer__bottom">
      <div class="container">© <span id="year"></span> ${CONTACTS.org}. Все права защищены.</div>
    </div>
  </footer>`;
}

/* --- Подстановка иконок в статический HTML по data-icon --- */
function injectIcons() {
  document.querySelectorAll("[data-icon]").forEach(el => {
    const name = el.getAttribute("data-icon");
    if (ICONS[name]) el.innerHTML = svg(name);
    el.classList.add("ico");
  });
}

/* --- Появление блоков при скролле --- */
function initReveal() {
  const els = document.querySelectorAll("[data-reveal]");
  if (!els.length) return;
  if (!("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("is-in")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  els.forEach(e => io.observe(e));
}

/* --- Общая инициализация --- */
function mountChrome() {
  const h = document.getElementById("site-header-root");
  const f = document.getElementById("site-footer-root");
  if (h) h.innerHTML = renderHeader();
  if (f) f.innerHTML = renderFooter();

  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  const burger = document.getElementById("burger");
  const nav = document.getElementById("mainnav");
  const backdrop = document.getElementById("nav-backdrop");
  if (burger && nav) {
    const setMenu = (open) => {
      nav.classList.toggle("open", open);
      burger.classList.toggle("active", open);
      if (backdrop) backdrop.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    };
    burger.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
    backdrop && backdrop.addEventListener("click", () => setMenu(false));
    // тап по обычной ссылке (без подменю) — закрыть меню
    nav.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => {
        if (!a.parentElement.classList.contains("has-children")) setMenu(false);
      });
    });
    // тап по пункту с подменю на мобильных раскрывает его
    nav.querySelectorAll(".has-children > a").forEach(a => {
      a.addEventListener("click", (e) => {
        if (window.innerWidth <= 960) {
          const li = a.parentElement;
          if (!li.classList.contains("expanded")) { e.preventDefault(); li.classList.add("expanded"); }
        }
      });
    });
  }
}

/* --- Слайдер афиш --- */
function initSlider() {
  const slider = document.querySelector("[data-slider]");
  if (!slider) return;
  const slides = Array.from(slider.querySelectorAll(".slide"));
  if (slides.length < 2) return;
  const dotsWrap = slider.querySelector(".slider__dots");
  let idx = 0, timer = null, paused = false;

  slides.forEach((_, i) => {
    const d = document.createElement("button");
    d.className = "dot" + (i === 0 ? " active" : "");
    d.setAttribute("aria-label", "Слайд " + (i + 1));
    d.addEventListener("click", () => go(i));
    dotsWrap && dotsWrap.appendChild(d);
  });
  const dots = dotsWrap ? Array.from(dotsWrap.children) : [];

  function go(n) {
    // защита: используем реально активный слайд (на случай рассинхрона после возврата из кэша)
    const cur = slides.findIndex(s => s.classList.contains("active"));
    if (cur >= 0) idx = cur;
    slides[idx].classList.remove("active");
    dots[idx] && dots[idx].classList.remove("active");
    idx = (n + slides.length) % slides.length;
    slides[idx].classList.add("active");
    dots[idx] && dots[idx].classList.add("active");
    play();
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function play() { stop(); if (!paused && !document.hidden) timer = setInterval(() => go(idx + 1), 6500); }

  const prev = slider.querySelector(".slider__prev");
  const next = slider.querySelector(".slider__next");
  prev && prev.addEventListener("click", () => go(idx - 1));
  next && next.addEventListener("click", () => go(idx + 1));
  slider.addEventListener("mouseenter", () => { paused = true; stop(); });
  slider.addEventListener("mouseleave", () => { paused = false; play(); });

  // надёжное возобновление: возврат из bfcache, переключение вкладок, фокус окна
  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); else play(); });
  window.addEventListener("pageshow", () => { paused = false; play(); });
  window.addEventListener("pagehide", stop);
  window.addEventListener("focus", () => { if (!paused) play(); });

  play();
}

document.addEventListener("DOMContentLoaded", () => {
  mountChrome();
  injectIcons();
  initSlider();
  initReveal();
});
