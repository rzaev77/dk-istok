/* =====================================================================
   КАЛЕНДАРЬ СОБЫТИЙ ДК «ИСТОК»
   Месячная сетка, построенная из того же window.AFISHA, что и афиша.
   Событие попадает в календарь, если у него заполнено поле start
   (дата в формате ГГГГ-ММ-ДД). События без start показываются ниже,
   в разделе «Регулярные и сезонные».
   ===================================================================== */
(function () {
  var root = document.getElementById("calendar-root");
  if (!root) return;

  var MONTHS = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
  var MONTHS_GEN = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
  var WD = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

  var svg = (typeof window.dkSvg === "function") ? window.dkSvg : function () { return ""; };
  var card = (typeof window.dkAfishaCard === "function") ? window.dkAfishaCard : null;
  function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];}); }

  function pad(n){ return n < 10 ? "0" + n : "" + n; }
  function ymd(d){ return d.getFullYear() + "-" + pad(d.getMonth()+1) + "-" + pad(d.getDate()); }
  function parseStart(s){
    if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
    var p = s.split("-"), y = +p[0], m = +p[1]-1, dd = +p[2];
    var dt = new Date(y, m, dd);
    if (dt.getFullYear()!==y || dt.getMonth()!==m || dt.getDate()!==dd) return null; // отсев 2026-02-31 и т.п.
    return dt;
  }

  var all = (Array.isArray(window.AFISHA) ? window.AFISHA : []).filter(function (e){ return e && typeof e === "object"; });
  var byDay = {};     // "ГГГГ-ММ-ДД" -> [события]
  var undated = [];   // события без корректной даты
  all.forEach(function (e) {
    var dt = parseStart(e.start);
    if (dt) { var k = ymd(dt); (byDay[k] = byDay[k] || []).push(e); }
    else undated.push(e);
  });

  var today = new Date(); today.setHours(0,0,0,0);
  var todayKey = ymd(today);

  function monthHasEvents(y, m){
    return Object.keys(byDay).some(function (k){ var p = k.split("-"); return +p[0]===y && (+p[1]-1)===m; });
  }
  function nearestUpcomingMonth(){
    var keys = Object.keys(byDay).sort();
    for (var i=0;i<keys.length;i++){ var dt = parseStart(keys[i]); if (dt && dt >= today) return { y: dt.getFullYear(), m: dt.getMonth() }; }
    return null;
  }
  // Стартовый месяц: текущий, если в нём есть события; иначе ближайший с событиями; иначе текущий.
  var view;
  if (monthHasEvents(today.getFullYear(), today.getMonth())) view = { y: today.getFullYear(), m: today.getMonth() };
  else { var nu = nearestUpcomingMonth(); view = nu ? { y: nu.y, m: nu.m } : { y: today.getFullYear(), m: today.getMonth() }; }

  var selected = null; // "ГГГГ-ММ-ДД" или null

  function eventsOfMonth(y, m){
    var res = [];
    Object.keys(byDay).forEach(function (k){
      var p = k.split("-");
      if (+p[0]===y && (+p[1]-1)===m) byDay[k].forEach(function (e){ res.push({ day: +p[2], e: e }); });
    });
    res.sort(function (a,b){ return a.day - b.day; });
    return res.map(function (o){ return o.e; });
  }
  function cardsBlock(events){
    if (card) return '<div class="cards">' + events.map(card).join("") + '</div>';
    return events.map(function (e){ return '<p>' + esc(e.title) + '</p>'; }).join("");
  }

  function render(focus){
    var y = view.y, m = view.m;
    var first = new Date(y, m, 1);
    var offset = (first.getDay() + 6) % 7;            // понедельник — первый
    var daysIn = new Date(y, m+1, 0).getDate();

    var cells = "";
    for (var i=0;i<offset;i++) cells += '<div class="cal-cell cal-cell--empty"></div>';
    for (var d=1; d<=daysIn; d++){
      var key = y + "-" + pad(m+1) + "-" + pad(d);
      var has = byDay[key];
      var cls = "cal-cell";
      if (has) cls += " has-ev";
      if (key === todayKey) cls += " is-today";
      if (key === selected) cls += " is-sel";
      var dot = has ? '<span class="cal-dot">' + (has.length > 1 ? has.length : "") + '</span>' : "";
      var cur = (key === todayKey) ? ' aria-current="date"' : "";
      var attr = cur; // «сегодня» помечаем даже без событий
      if (has) {
        var lbl = d + " " + MONTHS_GEN[m] + (key === todayKey ? ", сегодня" : "") + ", событий: " + has.length;
        attr = ' role="button" tabindex="0" aria-label="' + lbl + '" aria-pressed="' + (key === selected ? "true" : "false") + '"' + cur + ' data-day="' + key + '"';
      }
      cells += '<div class="' + cls + '"' + attr + '><span class="cal-num">' + d + '</span>' + dot + '</div>';
    }
    var trail = (7 - ((offset + daysIn) % 7)) % 7;
    for (var t=0;t<trail;t++) cells += '<div class="cal-cell cal-cell--empty"></div>';

    var weekdays = WD.map(function (w, idx){ return '<div class="cal-wd' + (idx>=5 ? " cal-wd--we" : "") + '">' + w + '</div>'; }).join("");

    var listHtml;
    if (selected && byDay[selected]){
      var sp = selected.split("-");
      var title = (+sp[2]) + " " + MONTHS_GEN[+sp[1]-1] + " " + sp[0];
      listHtml = '<div class="cal-list-head"><h2 tabindex="-1">' + title + '</h2>'
        + '<button class="btn btn--ghost btn--sm" id="cal-clear">← Весь месяц</button></div>'
        + cardsBlock(byDay[selected]);
    } else {
      var ev = eventsOfMonth(y, m);
      listHtml = '<div class="cal-list-head"><h2 tabindex="-1">События · ' + MONTHS[m] + ' ' + y + '</h2></div>';
      listHtml += ev.length ? cardsBlock(ev)
        : '<p class="cal-empty">В этом месяце мероприятий нет. Полистайте соседние месяцы кнопками ‹ › или посмотрите раздел ниже.</p>';
    }

    root.innerHTML =
      '<div class="cal">'
      +   '<div class="cal-bar">'
      +     '<button class="cal-nav" id="cal-prev" type="button" aria-label="Предыдущий месяц">' + svg("chevL") + '</button>'
      +     '<div class="cal-title">' + MONTHS[m] + ' <b>' + y + '</b></div>'
      +     '<button class="cal-nav" id="cal-next" type="button" aria-label="Следующий месяц">' + svg("chevR") + '</button>'
      +     '<button class="btn btn--ghost btn--sm cal-today" id="cal-today" type="button">Сегодня</button>'
      +   '</div>'
      +   '<div class="cal-grid cal-wds">' + weekdays + '</div>'
      +   '<div class="cal-grid cal-days">' + cells + '</div>'
      +   '<div class="cal-legend"><span class="cal-lg cal-lg--ev"></span> есть событие &nbsp; <span class="cal-lg cal-lg--today"></span> сегодня</div>'
      + '</div>'
      + '<div class="cal-list" aria-live="polite">' + listHtml + '</div>';

    if (typeof window.dkInjectIcons === "function") window.dkInjectIcons(root);
    bind();
    if (focus) {
      var fEl = (focus === "list") ? root.querySelector(".cal-list-head h2") : document.getElementById(focus);
      if (fEl) fEl.focus();
    }
  }

  function bind(){
    var prev = document.getElementById("cal-prev"),
        next = document.getElementById("cal-next"),
        td   = document.getElementById("cal-today"),
        clr  = document.getElementById("cal-clear");
    if (prev) prev.onclick = function (){ view.m--; if (view.m<0){ view.m=11; view.y--; } selected=null; render("cal-prev"); };
    if (next) next.onclick = function (){ view.m++; if (view.m>11){ view.m=0; view.y++; } selected=null; render("cal-next"); };
    if (td)   td.onclick   = function (){ view = { y: today.getFullYear(), m: today.getMonth() }; selected=null; render("cal-today"); };
    if (clr)  clr.onclick  = function (){ selected=null; render("list"); };

    var pick = function (el){ selected = el.getAttribute("data-day"); render("list"); };
    root.querySelectorAll("[data-day]").forEach(function (c){
      c.addEventListener("click", function (){ pick(c); });
      c.addEventListener("keydown", function (e){ if (e.key==="Enter" || e.key===" "){ e.preventDefault(); pick(c); } });
    });
  }

  render();

  // раздел «без точной даты» под календарём
  var undEl = document.getElementById("calendar-undated");
  if (undEl){
    if (undated.length && card){
      undEl.innerHTML = '<h2 class="cal-und-title">Регулярные и сезонные</h2>'
        + '<p class="muted" style="margin:-4px 0 20px">Мероприятия без фиксированной даты — уточняйте по записи или в кассе.</p>'
        + '<div class="cards">' + undated.map(card).join("") + '</div>';
      if (typeof window.dkInjectIcons === "function") window.dkInjectIcons(undEl);
    } else {
      undEl.style.display = "none";
    }
  }
})();
