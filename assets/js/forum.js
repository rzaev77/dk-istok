/* =====================================================================
   Форум ДК «Исток» — два режима работы:

   • ЖИВОЙ режим — если на хостинге есть серверная часть (api/forum.php):
     темы и ответы хранятся на сервере, видны всем посетителям,
     публикуются после проверки модератором (премодерация).

   • ДЕМО-режим — если сервера нет (например, на GitHub Pages):
     интерфейс полностью рабочий, но данные сохраняются только в браузере
     посетителя. Это витрина того, как форум будет выглядеть.

   Скрипт сам определяет, есть ли сервер, и выбирает режим.
   ===================================================================== */
(function () {
  const root = document.getElementById("forum-root");
  if (!root) return;

  const API = "api/forum.php";
  const STORE = "dk_forum_v1";

  let MODE = "demo";     // 'live' | 'demo'
  let PREMOD = false;    // включена ли премодерация (в живом режиме)
  let firstRender = true;
  let data = { cats: [], topics: [] };

  // --- стартовые данные для ДЕМО-режима (тематические разделы) ---
  const SEED = {
    cats: [
      { id: "afisha",   icon: "megaphone", name: "Афиша и мероприятия", desc: "Обсуждение концертов, спектаклей и праздников" },
      { id: "kruzhki",  icon: "masks",     name: "Кружки и коллективы", desc: "Запись, расписание, вопросы по студиям" },
      { id: "feedback", icon: "chat",      name: "Обратная связь",      desc: "Отзывы, предложения и пожелания Дворцу" },
      { id: "help",     icon: "help",      name: "Вопрос — ответ",      desc: "Билеты, льготы, как добраться и другое" },
    ],
    topics: [
      { id: "t1", cat: "afisha", title: "Какие концерты ждать этой осенью?", author: "Администратор", pinned: true,
        posts: [{ author: "Администратор", date: "2026-05-20T10:00:00", body: "Делитесь, какие мероприятия вы хотели бы увидеть на сцене ДК «Исток». Мы читаем все пожелания и учитываем их при формировании афиши!" }] },
      { id: "t2", cat: "kruzhki", title: "Запись в хореографическую студию «Акварель»", author: "Мария",
        posts: [
          { author: "Мария", date: "2026-05-22T18:30:00", body: "Подскажите, с какого возраста принимают в «Акварель» и нужна ли подготовка?" },
          { author: "Администратор", date: "2026-05-22T19:10:00", body: "Здравствуйте! Принимаем детей от 5,5 лет в платную подготовительную группу, отбора по физическим данным нет — главное желание танцевать. Подробности по тел. 8-915-295-22-71." },
        ] },
      { id: "t3", cat: "feedback", title: "Спасибо за отчётный концерт!", author: "Ольга",
        posts: [{ author: "Ольга", date: "2026-05-25T21:00:00", body: "Были на отчётном концерте — море эмоций! Огромная благодарность всем коллективам и педагогам. Так держать!" }] },
      { id: "t4", cat: "help", title: "Можно ли вернуть билет, если не смогу прийти?", author: "Гость",
        posts: [
          { author: "Гость", date: "2026-05-26T12:00:00", body: "Купил билет онлайн, но не получится прийти. Как вернуть?" },
          { author: "Администратор", date: "2026-05-26T13:20:00", body: "Возврат оформляется в месте приобретения билета. По билетам, купленным на сайте, — через билетного оператора. Подробности — на странице «Возврат и бронирование билетов»." },
        ] },
    ],
  };

  // --- хранилище ДЕМО ---
  function loadDemo() {
    try { const d = JSON.parse(localStorage.getItem(STORE)); if (d && d.cats && d.topics) return d; } catch (e) {}
    return JSON.parse(JSON.stringify(SEED));
  }
  function saveDemo() { try { localStorage.setItem(STORE, JSON.stringify(data)); } catch (e) {} }

  // --- утилиты ---
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const svg = (typeof window.dkSvg === "function") ? window.dkSvg : () => "";
  const qs = () => new URLSearchParams(location.search);
  function fmtDate(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return "";
    const M = ["янв","фев","мар","апр","мая","июн","июл","авг","сен","окт","ноя","дек"];
    const p = n => String(n).padStart(2, "0");
    return `${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear()}, ${p(d.getHours())}:${p(d.getMinutes())}`;
  }
  const initials = name => (name || "?").trim().slice(0, 1).toUpperCase() || "?";
  const topicsOf = cid => data.topics.filter(t => t.cat === cid);
  const lastDate = t => t.posts.length ? t.posts[t.posts.length - 1].date : "";
  function setUrl(params) {
    const u = new URL(location);
    u.search = "";
    Object.entries(params).forEach(([k, v]) => v && u.searchParams.set(k, v));
    history.pushState({}, "", u);
  }

  // honeypot-поле (ловушка для ботов) + место под ошибку
  const HONEY = '<input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">';
  const ERRBOX = '<p class="form-err" style="display:none;color:#a3243f;font-weight:600;margin:0"></p>';

  function noteText() {
    if (MODE === "live") return PREMOD
      ? "Сообщение появится на форуме после проверки модератором — обычно в течение рабочего дня."
      : "Сообщение появится на форуме сразу.";
    return "Демо-режим: сообщение сохранится только в вашем браузере.";
  }
  function catsNote() {
    if (MODE === "live") return PREMOD
      ? "Новые темы и ответы публикуются после проверки модератором — обычно в течение рабочего дня. Будьте вежливы и уважайте друг друга."
      : "Форум открыт для всех. Сообщения, нарушающие правила, удаляются модератором.";
    return "Это демонстрационный форум: темы и ответы сохраняются в вашем браузере. На рабочем хостинге подключается серверная часть — и форум становится общим для всех посетителей.";
  }
  const PENDING_HTML = `<div class="forum-reply"><h3>Спасибо, сообщение отправлено!</h3>
    <p class="forum-note">Оно появится на форуме после проверки модератором — обычно в течение рабочего дня.</p></div>`;

  // --- сетевой слой (живой режим) ---
  function shape(d) {
    return {
      cats: (d.cats || []).map(c => ({ id: c.id, icon: c.icon, name: c.name, desc: c.descr != null ? c.descr : c.desc })),
      topics: (d.topics || []).map(t => ({
        id: String(t.id), cat: t.cat, title: t.title, author: t.author, pinned: !!t.pinned,
        posts: (t.posts || []).map(p => ({ author: p.author, date: p.date, body: p.body })),
      })),
    };
  }
  async function apiAll() {
    const r = await fetch(API + "?action=all", { headers: { "Accept": "application/json" } });
    if (!r.ok) throw new Error("http " + r.status);
    return r.json();
  }
  async function apiPost(params) {
    const r = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(params),
    });
    return r.json();
  }
  async function refresh() {
    if (MODE !== "live") return;
    try { const d = await apiAll(); if (d && d.ok) data = shape(d); } catch (e) {}
  }

  // --- виды ---
  function viewCats() {
    const cats = data.cats.map(c => {
      const ts = topicsOf(c.id);
      const msgs = ts.reduce((s, t) => s + t.posts.length, 0);
      return `<a class="fcat" href="?cat=${c.id}" data-cat="${c.id}">
        <span class="fcat__ic">${svg(c.icon)}</span>
        <span class="fcat__main"><span class="fcat__name">${esc(c.name)}</span><span class="fcat__desc">${esc(c.desc)}</span></span>
        <span class="fcat__stat"><b>${ts.length}</b>тем · ${msgs} сообщ.</span>
      </a>`;
    }).join("");
    root.innerHTML = `<div class="forum-cats">${cats}</div>
      <p class="forum-note">${esc(catsNote())}</p>`;
  }

  function viewTopics(cid) {
    const cat = data.cats.find(c => c.id === cid);
    if (!cat) return viewCats();
    const ts = topicsOf(cid).slice().sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (lastDate(b) > lastDate(a) ? 1 : -1));
    const rows = ts.length ? ts.map(t => `
      <div class="topic" data-topic="${t.id}">
        <div class="topic__main">
          <h3 class="topic__title">${esc(t.title)}${t.pinned ? '<span class="topic__pin">закреплено</span>' : ""}</h3>
          <div class="topic__meta"><span>Автор: <b>${esc(t.author)}</b></span><span>Обновлено: ${fmtDate(lastDate(t))}</span></div>
        </div>
        <div class="topic__count"><b>${t.posts.length}</b>сообщ.</div>
      </div>`).join("") : `<div class="forum-empty">В этом разделе пока нет тем. Создайте первую!</div>`;
    root.innerHTML = `
      <div class="forum-bar">
        <a class="btn btn--ghost btn--sm" href="?"><span data-icon="chevL"></span> Все разделы</a>
        <button class="btn btn--gold btn--sm" id="new-topic">Создать тему</button>
      </div>
      <div class="eyebrow" style="margin-bottom:14px">${esc(cat.name)}</div>
      <div class="topics">${rows}</div>
      <div id="new-topic-form"></div>`;
  }

  function viewTopic(tid) {
    const t = data.topics.find(x => x.id === tid);
    if (!t) return viewCats();
    const posts = t.posts.map((p, i) => `
      <article class="post">
        <div class="post__avatar">${initials(p.author)}</div>
        <div>
          <div class="post__head"><span class="post__author">${esc(p.author)}</span>${i === 0 ? '<span class="post__op">автор темы</span>' : ""}<span class="post__date">${fmtDate(p.date)}</span></div>
          <div class="post__body">${esc(p.body)}</div>
        </div>
      </article>`).join("");
    root.innerHTML = `
      <div class="forum-bar">
        <a class="btn btn--ghost btn--sm" href="?cat=${t.cat}"><span data-icon="chevL"></span> К разделу</a>
      </div>
      <h2 style="margin-bottom:6px">${esc(t.title)}</h2>
      <div class="topic__meta" style="margin-bottom:24px"><span>Автор: <b>${esc(t.author)}</b></span><span>${t.posts.length} сообщ.</span></div>
      <div class="posts">${posts}</div>
      <div class="forum-reply" id="reply-block">
        <h3>Ответить в теме</h3>
        <form class="form" id="reply-form">
          ${HONEY}
          <div><label>Ваше имя</label><input type="text" name="name" required placeholder="Как к вам обращаться" maxlength="60"></div>
          <div><label>Сообщение</label><textarea name="body" required placeholder="Текст сообщения" maxlength="5000"></textarea></div>
          ${ERRBOX}
          <div><button type="submit" class="btn btn--gold">Отправить ответ</button></div>
        </form>
        <p class="forum-note">${esc(noteText())}</p>
      </div>`;
  }

  // --- создание темы ---
  function showNewTopicForm(cid) {
    const wrap = document.getElementById("new-topic-form");
    if (!wrap) return;
    wrap.innerHTML = `
      <div class="forum-reply">
        <h3>Новая тема</h3>
        <form class="form" id="topic-form">
          ${HONEY}
          <div><label>Ваше имя</label><input type="text" name="name" required placeholder="Как к вам обращаться" maxlength="60"></div>
          <div><label>Заголовок темы</label><input type="text" name="title" required placeholder="О чём тема" maxlength="140"></div>
          <div><label>Сообщение</label><textarea name="body" required placeholder="Текст первого сообщения" maxlength="5000"></textarea></div>
          ${ERRBOX}
          <div style="display:flex;gap:10px"><button type="submit" class="btn btn--gold">Создать</button><button type="button" class="btn btn--ghost" id="cancel-topic">Отмена</button></div>
        </form>
        <p class="forum-note">${esc(noteText())}</p>
      </div>`;
    wrap.querySelector("#cancel-topic").addEventListener("click", () => { wrap.innerHTML = ""; });
    wrap.querySelector("#topic-form").addEventListener("submit", e => {
      e.preventDefault();
      MODE === "live" ? submitTopicLive(cid, e.target, wrap) : submitTopicDemo(cid, e.target);
    });
    wrap.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function readForm(f) {
    return {
      name: (f.name.value || "").trim() || "Гость",
      title: f.title ? (f.title.value || "").trim() : "",
      body: (f.body.value || "").trim(),
      website: f.website ? f.website.value : "",
    };
  }
  function showErr(f, msg) {
    const box = f.querySelector(".form-err");
    if (box) { box.textContent = msg; box.style.display = "block"; }
  }
  function lockBtn(f, on) {
    const b = f.querySelector('button[type="submit"]');
    if (b) { b.disabled = on; b.style.opacity = on ? ".6" : ""; }
  }

  // тема — демо
  function submitTopicDemo(cid, f) {
    const v = readForm(f);
    if (!v.title || !v.body) return;
    const id = "u" + Date.now();
    data.topics.push({ id, cat: cid, title: v.title, author: v.name,
      posts: [{ author: v.name, date: new Date().toISOString(), body: v.body }] });
    saveDemo(); setUrl({ topic: id }); render();
  }
  // тема — живой режим
  async function submitTopicLive(cid, f, wrap) {
    const v = readForm(f);
    if (!v.title || !v.body) return;
    lockBtn(f, true);
    try {
      const res = await apiPost({ action: "topic", cat: cid, name: v.name, title: v.title, body: v.body, website: v.website });
      if (!res || !res.ok) { showErr(f, (res && res.error) || "Не удалось отправить. Попробуйте позже."); lockBtn(f, false); return; }
      if (res.pending) {
        if (wrap) { wrap.innerHTML = PENDING_HTML; wrap.scrollIntoView({ behavior: "smooth", block: "center" }); }
      } else {
        await refresh(); setUrl({ topic: res.id }); render();
      }
    } catch (e) {
      showErr(f, "Нет связи с сервером. Попробуйте позже."); lockBtn(f, false);
    }
  }

  // ответ — демо
  function submitReplyDemo(tid, f) {
    const v = readForm(f);
    if (!v.body) return;
    const t = data.topics.find(x => x.id === tid);
    if (!t) return;
    t.posts.push({ author: v.name, date: new Date().toISOString(), body: v.body });
    saveDemo(); render();
    requestAnimationFrame(() => { const ps = root.querySelectorAll(".post"); ps[ps.length - 1] && ps[ps.length - 1].scrollIntoView({ behavior: "smooth", block: "center" }); });
  }
  // ответ — живой режим
  async function submitReplyLive(tid, f) {
    const v = readForm(f);
    if (!v.body) return;
    lockBtn(f, true);
    try {
      const res = await apiPost({ action: "reply", topic_id: tid, name: v.name, body: v.body, website: v.website });
      if (!res || !res.ok) { showErr(f, (res && res.error) || "Не удалось отправить. Попробуйте позже."); lockBtn(f, false); return; }
      if (res.pending) {
        const block = document.getElementById("reply-block");
        if (block) { block.innerHTML = PENDING_HTML; block.scrollIntoView({ behavior: "smooth", block: "center" }); }
      } else {
        await refresh(); render();
        requestAnimationFrame(() => { const ps = root.querySelectorAll(".post"); ps[ps.length - 1] && ps[ps.length - 1].scrollIntoView({ behavior: "smooth", block: "center" }); });
      }
    } catch (e) {
      showErr(f, "Нет связи с сервером. Попробуйте позже."); lockBtn(f, false);
    }
  }

  function bind() {
    const nt = document.getElementById("new-topic");
    if (nt) nt.addEventListener("click", () => showNewTopicForm(qs().get("cat")));
    root.querySelectorAll(".topic[data-topic]").forEach(el =>
      el.addEventListener("click", () => { setUrl({ topic: el.dataset.topic }); render(); }));
    root.querySelectorAll(".fcat[data-cat]").forEach(el =>
      el.addEventListener("click", e => { e.preventDefault(); setUrl({ cat: el.dataset.cat }); render(); }));
    root.querySelectorAll('a[href^="?"]').forEach(el =>
      el.addEventListener("click", e => { e.preventDefault(); const u = new URL(el.href); const p = new URLSearchParams(u.search);
        setUrl({ cat: p.get("cat"), topic: p.get("topic") }); render(); }));
    const rf = document.getElementById("reply-form");
    if (rf) rf.addEventListener("submit", e => {
      e.preventDefault();
      const tid = qs().get("topic");
      MODE === "live" ? submitReplyLive(tid, e.target) : submitReplyDemo(tid, e.target);
    });
  }

  function render() {
    const p = qs();
    if (p.get("topic")) viewTopic(p.get("topic"));
    else if (p.get("cat")) viewTopics(p.get("cat"));
    else viewCats();
    if (typeof window.dkInjectIcons === "function") window.dkInjectIcons(root);
    bind();
    if (!firstRender) window.scrollTo({ top: root.getBoundingClientRect().top + window.scrollY - 120, behavior: "smooth" });
    firstRender = false;
  }

  // --- запуск: определяем, есть ли сервер ---
  async function boot() {
    root.innerHTML = '<p class="forum-note">Загрузка форума…</p>';
    try {
      const ctrl = new AbortController();
      const tm = setTimeout(() => ctrl.abort(), 4500);
      const r = await fetch(API + "?action=all", { signal: ctrl.signal, headers: { "Accept": "application/json" } });
      clearTimeout(tm);
      if (r.ok) {
        const d = await r.json();
        if (d && d.ok && Array.isArray(d.cats) && Array.isArray(d.topics)) {
          MODE = "live"; PREMOD = !!d.moderation; data = shape(d);
          render(); return;
        }
      }
    } catch (e) { /* сервера нет — переходим в демо */ }
    MODE = "demo"; data = loadDemo(); render();
  }

  window.addEventListener("popstate", render);
  boot();
})();
