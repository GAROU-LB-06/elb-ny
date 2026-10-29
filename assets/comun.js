/* ELB · comportamiento compartido por todas las páginas: menú, reloj de la sesión, cuenta regresiva,
   redes y las piezas con las que se arman las tarjetas y las páginas de los indicadores. */
const ELB = (() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  /* ---------- scroll progress + nav state ---------- */
  const progress = $('#progress'), nav = $('#nav');
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
    nav.classList.toggle('scrolled', scrollY > 8);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- mobile menu ---------- */
  const menuBtn = $('#menuBtn'), menu = $('#mobileMenu');
  const setMenu = open => { menu.hidden = !open; menuBtn.setAttribute('aria-expanded', String(open)); menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú'); };
  menuBtn.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });

  /* ---------- NY session clock ---------- */
  const sessionEl = $('#session'), sessionText = $('#sessionText');
  const fmtDur = mins => { const h = Math.floor(mins / 60), m = mins % 60; return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`; };
  function updateSession() {
    try {
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
      const get = t => parts.find(p => p.type === t).value;
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const wd = days.indexOf(get('weekday')), h = Number(get('hour')) % 24, m = Number(get('minute'));
      const now = h * 60 + m, OPEN = 8 * 60, CLOSE = 17 * 60;
      const weekday = wd >= 1 && wd <= 5;
      const clock = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ET`;
      let txt;
      if (weekday && now >= OPEN && now < CLOSE) {
        sessionEl.classList.add('open');
        txt = `NY abierta|Cierra en ${fmtDur(CLOSE - now)}`;
      } else {
        sessionEl.classList.remove('open');
        let mins;
        if (weekday && now < OPEN) mins = OPEN - now;
        else { let add = 1; while (![1, 2, 3, 4, 5].includes((wd + add) % 7)) add++; mins = add * 1440 - now + OPEN; }
        txt = `NY cerrada|Abre en ${fmtDur(mins)}`;
      }
      const [short, detail] = txt.split('|');
      sessionText.textContent = short;
      sessionEl.title = `Sesión de Nueva York, 08:00 a 17:00 ET. ${detail}. Ahora: ${clock}`;
    } catch (e) { sessionText.textContent = 'Sesión NY 08:00–17:00 ET'; }
  }
  updateSession(); setInterval(updateSession, 30000);

  /* ---------- countdown ---------- */
  const boxes = $$('[data-countdown]');
  function updateCountdown() {
    let ms = FIN_GRATIS - new Date();
    if (ms < 0) ms = 0;
    const s = Math.floor(ms / 1000), v = { d: Math.floor(s / 86400), h: Math.floor(s / 3600) % 24, m: Math.floor(s / 60) % 60, s: s % 60 };
    boxes.forEach(b => $$('[data-u]', b).forEach(n => { const u = n.dataset.u; n.textContent = u === 'd' ? String(v[u]) : String(v[u]).padStart(2, '0'); }));
  }
  updateCountdown(); setInterval(updateCountdown, 1000);

  /* ---------- reels: one plays at a time ---------- */
  // `play` does not bubble, so listen while capturing
  document.addEventListener('play', e => {
    const v = e.target; if (!(v instanceof HTMLVideoElement) || !v.closest('.reels')) return;
    $$('.reels video').forEach(o => { if (o !== v) o.pause(); });
  }, true);

  /* ---------- indicator helpers: formats, stats and shared pieces of markup ---------- */
  // Monthly totals come from each indicator's table. Trade order is only known where the replay was recorded (1 = TP, 0 = SL).
  const SVGNS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs, text) => { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (text != null) e.textContent = text; return e; };
  const COL = { tp: '#22ab94', sl: '#f23645', grid: '#2d1d23', zero: '#42262f', txt: '#75646b', start: '#ab9aa0', void: '#0b0809', track: '#1b1216', fg: '#f4eeef' };
  const CMP = ['#ff4458', '#3a73ff']; // first and second TP target in the comparison
  const MONO = 'JetBrains Mono, monospace';
  const WORD = { 2: 'dos', 3: 'tres', 4: 'cuatro', 5: 'cinco' };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtR = v => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v) + 'R';
  const wrOf = m => (m.tp + m.sl ? m.tp / (m.tp + m.sl) * 100 : 0);
  const sumOf = (ms, k) => ms.reduce((a, m) => a + m[k], 0);
  const rStep = range => (range <= 8 ? 2 : range <= 16 ? 4 : range <= 30 ? 5 : 10);
  const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const fmtUsd = v => (v < 0 ? '−' : '') + usd.format(Math.abs(v));
  const fmtUsdS = v => (v >= 0 ? '+' : '−') + usd.format(Math.abs(v));
  const pctS = v => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(1) + ' %';
  const compact = v => { const a = Math.abs(v); return (v < 0 ? '−' : '') + (a >= 1e6 ? '$' + (a / 1e6).toFixed(2) + 'M' : a >= 1e4 ? '$' + (a / 1e3).toFixed(1) + 'k' : '$' + Math.round(a).toLocaleString('en-US')); };
  const parseCap = s => { const v = parseFloat(String(s).replace(/,/g, '').replace(/[^0-9.]/g, '')); return isFinite(v) ? v : NaN; };
  const niceStep = range => { const raw = range / 4, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p; };
  const accRow = (label, value, cls) => `<div class="acc-row"><span>${label}</span><b class="num ${cls || ''}">${value}</b></div>`;
  const chartLabel = g => `${g.par} · ${g.minutos} · ${g.broker}`;
  // phones: charts switch to a 340-wide drawing so their text stays readable
  const isNarrow = svg => svg.getBoundingClientRect().width < 480;
  // x labels every `every` points, never crowding the last one
  const showX = (i, last, every) => i === last || (i % every === 0 && last - i >= every);

  // config months → chart shape; `short` is the 3-letter label (Ene, Feb…)
  const prepMonths = list => list.map((m, i) => ({ key: 'm' + i, name: m.mes.split(' ')[0], short: m.mes.slice(0, 3), month: m.mes, tp: m.tp, sl: m.sl, seq: m.orden || null, note: m.nota || '' }));
  function statsOf(months, k) {
    const nets = months.map(m => m.tp * k - m.sl), tp = sumOf(months, 'tp'), sl = sumOf(months, 'sl');
    const best = Math.max(...nets), worst = Math.min(...nets), names = v => months.filter((m, i) => nets[i] === v).map(m => m.short).join(' y ');
    return { tp, sl, n: tp + sl, net: tp * k - sl, wr: wrOf({ tp, sl }), months: months.length, pos: nets.filter(v => v > 0).length,
      zero: months.filter((m, i) => nets[i] === 0).map(m => m.short), best, bestNames: names(best), worst, worstNames: names(worst) };
  }
  // "Sterling Edge NY - NZDUSD": the pair goes on its own line, the dash stays for screen readers and copy
  const sufijoHTML = s => { const [main, pair] = s.split(' - '); return `<span class="brand-ny">${esc(main)}${pair ? `<span class="brand-pair"><span class="sr-only"> - </span>${esc(pair)}</span>` : ''}</span>`; };
  // the indicator's name as a heading: its logo when it has one
  const nameHTML = ind => (ind.marca && ind.marca.logo
    ? `<span class="logo"><img src="${esc(ind.marca.logo)}" alt="${esc(ind.nombre.split(' ')[0])}"${ind.marca.ancho ? ` width="${ind.marca.ancho}" height="${ind.marca.alto}"` : ''} decoding="async"></span>${ind.marca.sufijo ? sufijoHTML(ind.marca.sufijo) : ''}`
    : `<span class="zone-word">${esc(ind.nombre)}</span>`);
  const cmpCard = (k, s, slot, risk) => `
          <article class="ticket cmp-card ${slot}" data-ratio="${k}">
            <div class="cmp-top"><span class="cmp-tag">TP a 1:${k}</span><span class="cmp-dot" aria-hidden="true"></span></div>
            <p class="cmp-big num">${fmtR(s.net)}</p>
            <p class="cmp-sub num">${(s.net < 0 ? '−' : '') + usd0.format(Math.abs(s.net * risk))} con ${usd0.format(risk)} de riesgo por trade</p>
            <dl class="cmp-dl">
              <div><dt>TP / SL</dt><dd class="num"><b class="tpc">${s.tp}</b> / <b class="slc">${s.sl}</b></dd></div>
              <div><dt>Winrate</dt><dd class="num">${s.wr.toFixed(1)} %</dd></div>
              <div><dt>Meses en positivo</dt><dd class="num">${s.pos} de ${s.months}${s.zero.length ? ` · ${s.zero.join(', ').toLowerCase()} en 0R` : ''}</dd></div>
              <div><dt>Mejor mes</dt><dd class="num">${s.bestNames} · ${fmtR(s.best)}</dd></div>
              <div><dt>Peor mes</dt><dd class="num${s.worst < 0 ? ' slc' : ''}">${s.worstNames} · ${fmtR(s.worst)}</dd></div>
            </dl>
          </article>`;

  /* ---------- links between the pages ---------- */
  const indUrl = ind => 'indicador.html?id=' + encodeURIComponent(ind.id);
  const accesoUrl = ind => 'index.html?ind=' + encodeURIComponent(ind.id) + '#acceso';
  const TV_ICO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 20h18"/><path d="M4 16l5-5 4 3 7-8"/><path d="M16 6h4v4"/></svg>';
  // headline numbers of an indicator: its highest TP target (1:3 when it has one)
  function resumen(ind) {
    const k = Math.max(...Object.keys(ind.ratios).map(Number));
    return { k, s: statsOf(prepMonths(ind.ratios[k].meses), k) };
  }

  /* ---------- catalog card: the same card on the inicio and under "otros indicadores" ---------- */
  function catCardHTML(ind) {
    if (ind.proximamente) return soonCardHTML(ind);
    const { k, s } = resumen(ind), g = ind.grafico;
    return `
        <article class="ticket cat-card" data-ind="${esc(ind.id)}">
          <div class="cat-top">
            <a class="cat-name" href="${indUrl(ind)}" aria-label="${esc(ind.nombre)}: ver su página">${nameHTML(ind)}</a>${ind.estado ? `
            <span class="badge badge-free">${esc(ind.estado)}</span>` : ''}
          </div>
          <p class="cat-sub">${esc(ind.completo)}</p>${ind.descripcion ? `
          <p class="cat-desc">${esc(ind.descripcion)}</p>` : ''}
          <dl class="cat-kpis num">
            <div><dt>Resultado</dt><dd class="${s.net >= 0 ? 'pos' : 'neg'}">${fmtR(s.net)}</dd></div>
            <div><dt>Trades</dt><dd>${s.n}</dd></div>
            <div><dt>Acierto</dt><dd>${s.wr.toFixed(1)} %</dd></div>
            <div><dt>Meses +</dt><dd>${s.pos}/${s.months}</dd></div>
          </dl>
          <p class="cat-chart"><span class="tv-coins" aria-hidden="true"><i>${esc(g.par.slice(0, 2))}</i><i>${esc(g.par.slice(3, 5))}</i></span><span>${esc(chartLabel(g))}</span><span class="must-tag">obligatorio</span></p>
          <p class="cat-period">Backtest ${esc(ind.periodo.corto)} · TP 1:${k}</p>
          <div class="cat-actions">
            <a class="btn btn-red" href="${indUrl(ind)}">Ver resultados <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>${ind.tradingview ? `
            <a class="btn btn-tv" href="${esc(ind.tradingview)}" target="_blank" rel="noopener">${TV_ICO}TradingView</a>` : ''}
          </div>
        </article>`;
  }

  // still in development: no numbers yet, its markets and a way to hear when it is out
  function soonCardHTML(ind) {
    return `
        <article class="ticket cat-card is-soon" data-ind="${esc(ind.id)}">
          <div class="cat-top">
            <a class="cat-name" href="${indUrl(ind)}" aria-label="${esc(ind.nombre)}: ver su página">${nameHTML(ind)}</a>
            <span class="badge badge-soon">${esc(ind.estado || 'Próximamente')}</span>
          </div>
          <p class="cat-sub">${esc(ind.completo)}</p>${ind.descripcion ? `
          <p class="cat-desc">${esc(ind.descripcion)}</p>` : ''}${(ind.mercados || []).length ? `
          <p class="chips">${ind.mercados.map(m => `<span class="chip">${esc(m)}</span>`).join('')}</p>` : ''}
          <p class="cat-period">Resultados: se publican cuando termine su backtest</p>
          <div class="cat-actions">
            <a class="btn btn-ghost" href="${indUrl(ind)}">Ver detalles</a>
            <a class="btn btn-ghost" href="index.html#redes">Avísame en redes</a>
          </div>
        </article>`;
  }
  // indicators that already have results (access, featured numbers, links)
  const disponibles = () => INDICADORES.filter(i => !i.proximamente);

  /* ---------- socials (Redes section and access DMs, when the page has them) ---------- */
  const ICONS = {
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" stroke="none"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.7 2.7 2.5 4.3 5.5 4.6"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10 9.2l5 2.8-5 2.8z" fill="currentColor" stroke="none"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="5"/><path d="M15.5 7.5H14a2.5 2.5 0 0 0-2.5 2.5v11M9 13h6"/></svg>',
    tradingview: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18"/><path d="M4 16l5-5 4 3 7-8"/><path d="M16 6h4v4"/></svg>',
  };
  const soc = $('#socGrid');
  if (soc) REDES.filter(r => r.url && r.usuario).forEach(r => {
    const el = document.createElement('a');
    el.className = 'ticket soc'; el.href = r.url; el.target = '_blank'; el.rel = 'noopener';
    el.innerHTML = `<span class="soc-ico" aria-hidden="true">${ICONS[r.id] || ''}</span>
      <h3>${r.nombre}</h3>
      <span class="handle">${r.mostrar || '@' + r.usuario.replace(/^@/, '')}</span>
      <p>${r.texto}</p>
      <span class="go">Seguir <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg></span>`;
    soc.appendChild(el);
  });
  const dm = $('#dmLinks');
  if (dm) REDES.filter(r => (r.dm || r.url) && r.id !== 'tradingview' && r.id !== 'youtube').forEach(r => {
    const a = document.createElement('a'); a.className = 'btn btn-ghost btn-sm'; a.href = r.dm || r.url; a.target = '_blank'; a.rel = 'noopener';
    a.innerHTML = `${ICONS[r.id]} Enviar por ${r.nombre}`; dm.appendChild(a);
  });
  if (dm && !dm.children.length) dm.hidden = true;


  return { reduce, $, $$, css, SVGNS, svgEl, COL, CMP, MONO, WORD, esc, fmtR, wrOf, sumOf, rStep, usd, usd0, fmtUsd, fmtUsdS, pctS, compact, parseCap, niceStep, accRow,
    chartLabel, isNarrow, showX, prepMonths, statsOf, sufijoHTML, nameHTML, cmpCard, indUrl, accesoUrl, resumen, catCardHTML, disponibles, ICONS, TV_ICO };
})();
