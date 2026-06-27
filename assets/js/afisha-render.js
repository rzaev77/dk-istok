/* Рендер афиши из window.AFISHA в любой контейнер с атрибутом data-afisha.
   data-limit="8" — показать максимум N событий (для главной). */
(function () {
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }
  function cardHTML(e) {
    const metaText = [e.date, e.place].filter(Boolean).join(" · ");
    const icon = e.date ? "calendar" : "pin";
    const badge = e.cancelled
      ? '<span class="card__badge card__badge--off">Отменено</span>'
      : (e.badge ? `<span class="card__badge">${esc(e.badge)}</span>` : "");
    const age = e.age ? `<span class="card__age">${esc(e.age)}</span>` : "";
    const btnCls = (!e.cancelled && e.btnStyle === "wine") ? "btn btn--wine btn--sm" : "btn btn--ghost btn--sm";
    const ext = /^https?:/i.test(e.btnUrl || "") ? ' target="_blank" rel="noopener"' : "";
    const price = e.cancelled ? "" : `<span class="card__price">${esc(e.price)}</span>`;
    const meta = metaText ? `<div class="card__meta"><span data-icon="${icon}"></span> ${esc(metaText)}</div>` : "";
    return `<article class="card${e.cancelled ? " card--cancelled" : ""}">
      <div class="card__poster" style="background-image:url('assets/img/${esc(e.img)}')">${badge}${age}</div>
      <div class="card__body">
        ${meta}
        <h3 class="card__title">${esc(e.title)}</h3>
        <p class="card__desc">${esc(e.desc)}</p>
        <div class="card__foot">${price}<a class="${btnCls}" href="${esc(e.btnUrl || "#")}"${ext}>${esc(e.btnText || "Подробнее")}</a></div>
      </div>
    </article>`;
  }
  function render() {
    const list = Array.isArray(window.AFISHA) ? window.AFISHA : null;
    document.querySelectorAll("[data-afisha]").forEach(c => {
      if (!list) return; // нет данных — оставляем запасную вёрстку как есть
      const lim = parseInt(c.getAttribute("data-limit") || "0", 10);
      const items = lim > 0 ? list.slice(0, lim) : list;
      c.innerHTML = items.length ? items.map(cardHTML).join("") : '<p class="muted">Афиша скоро обновится.</p>';
      if (typeof window.dkInjectIcons === "function") window.dkInjectIcons(c);
    });
  }
  // экспорт для редактора афиши (живой предпросмотр тем же кодом)
  window.dkAfishaCard = cardHTML;
  window.dkAfishaRender = render;

  if (document.readyState !== "loading") render();
  else document.addEventListener("DOMContentLoaded", render);
})();
