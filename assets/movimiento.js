/* ELB · capa de movimiento compartida: solo observa y decora lo que las páginas ya pintaron */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const io = (cb, opts) => ('IntersectionObserver' in window ? new IntersectionObserver(cb, opts) : null);

  /* ---------- scrollspy: active section in both menus + sliding indicator ---------- */
  const links = $$('.nav-links a[href^="#"]'), mlinks = $$('#mobileMenu a[href^="#"]'), ind = $('#navInd');
  const ids = links.map(a => a.getAttribute('href').slice(1));
  function setActive(id) {
    [...links, ...mlinks].forEach(a => { if (id && a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    if (!ind) return;
    const a = links.find(l => l.getAttribute('href') === '#' + id);
    if (a && a.offsetParent) { ind.style.width = a.offsetWidth + 'px'; ind.style.transform = `translateX(${a.offsetLeft}px)`; ind.classList.add('on'); }
    else ind.classList.remove('on');
  }
  let current;
  function spy() {
    const y = innerHeight * 0.35; let found = null;
    for (const id of ids) { const s = document.getElementById(id); if (s) { const r = s.getBoundingClientRect(); if (r.top <= y && r.bottom > y) { found = id; break; } } }
    if (found !== current) { current = found; setActive(found); }
  }
  let spyRaf = 0;
  addEventListener('scroll', () => { if (!spyRaf) spyRaf = requestAnimationFrame(() => { spyRaf = 0; spy(); }); }, { passive: true });
  addEventListener('resize', () => { current = undefined; spy(); });
  spy();

  /* ---------- back to top ---------- */
  const toTop = $('#toTop');
  if (toTop) toTop.addEventListener('click', () => {
    scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    setTimeout(() => { const b = $('.nav .brand'); if (b) b.focus({ preventScroll: true }); }, reduce ? 0 : 700);
  });

  /* ---------- decoding kickers, scan sweep on headings, panel lines ---------- */
  const GL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/:_<>#$%&';
  function decode(el) {
    if (reduce || el.dataset.decoded) return; el.dataset.decoded = '1';
    const final = el.textContent, start = performance.now(), dur = 650;
    const step = now => {
      const p = Math.min(1, (now - start) / dur), lock = Math.floor(p * final.length);
      let s = '';
      for (let i = 0; i < final.length; i++) s += i < lock || final[i] === ' ' ? final[i] : GL[(i * 7 + Math.floor(now / 45)) % GL.length];
      el.textContent = p < 1 ? s : final;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const seenObs = io(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target; el.classList.add('seen'); seenObs.unobserve(el);
    if (el.matches('.sec-head, .zone-id')) { const k = $('.kicker', el); if (k) decode(k); }
  }), { threshold: 0.25 });
  if (seenObs) $$('.sec-head, .ticket, .zone-id').forEach(el => seenObs.observe(el));

  /* ---------- count-up for figures (the final value stays in the HTML; nothing is hidden) ---------- */
  function countUp(el, dur = 900) {
    if (reduce || el.dataset.counted) return; el.dataset.counted = '1';
    const src = el.textContent, m = src.match(/[−-]?\d[\d,]*(\.\d+)?/); if (!m) return;
    const numStr = m[0], neg = /^[−-]/.test(numStr), clean = numStr.replace(/[−,-]/g, ''), v1 = parseFloat(clean);
    if (!v1) return;
    const dec = (clean.split('.')[1] || '').length, comma = numStr.includes(','), minus = numStr[0] === '−' ? '−' : '-';
    const pre = src.slice(0, m.index), post = src.slice(m.index + numStr.length), t0 = performance.now();
    let written = src;
    const step = now => {
      if (el.textContent !== written) return; // the page updated this figure meanwhile: its value wins
      const p = Math.min(1, (now - t0) / dur), v = v1 * (1 - Math.pow(1 - p, 3));
      let s = v.toFixed(dec);
      if (comma) { const [i, d] = s.split('.'); s = Number(i).toLocaleString('en-US') + (d ? '.' + d : ''); }
      written = p < 1 ? pre + (neg ? minus : '') + s + post : src;
      el.textContent = written;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const countObs = io(es => es.forEach(e => { if (e.isIntersecting) { countObs.unobserve(e.target); $$('[data-count]', e.target).forEach(el => countUp(el)); } }), { threshold: 0.4 });
  $$('.tv-table td.v, .mchip .mr, .curve-total, .cat-kpis dd').forEach(el => el.setAttribute('data-count', ''));
  if (countObs) $$('.res-grid, .months, .cat-grid').forEach(el => countObs.observe(el));

  /* ---------- the simulator balance rolls to its new value ---------- */
  if (!reduce) $$('.acc-end').forEach(accEnd => {
    const num = t => (t.includes('−') ? -1 : 1) * (parseFloat(t.replace(/[^0-9.]/g, '')) || 0);
    // `shown` = value currently on screen, `target` = last value written by the simulator.
    // Our own intermediate writes are recognised by text and ignored, so the roll always lands on the simulator's value.
    let shown = num(accEnd.textContent), target = accEnd.textContent, ours = null, raf = 0;
    const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    new MutationObserver(() => {
      const txt = accEnd.textContent;
      if (txt === ours) return;
      target = txt; const to = num(txt), from = shown;
      cancelAnimationFrame(raf);
      if (Math.abs(to - from) < 0.005) { shown = to; return; }
      const t0 = performance.now(), dur = 380;
      const step = now => {
        const p = Math.min(1, (now - t0) / dur);
        if (p < 1) {
          shown = from + (to - from) * (1 - Math.pow(1 - p, 3));
          ours = (shown < 0 ? '−' : '') + usd.format(Math.abs(shown));
          accEnd.textContent = ours;
          raf = requestAnimationFrame(step);
        } else { shown = to; ours = target; accEnd.textContent = target; }
      };
      raf = requestAnimationFrame(step);
    }).observe(accEnd, { childList: true, characterData: true, subtree: true });
  });

  /* ---------- chart lines draw in, segment by segment ---------- */
  function animateLines(svg) {
    if (reduce) return;
    const segs = $$('g[stroke-width] > line', svg).filter(l => /#22ab94|#f23645|#ff4458|#3a73ff/i.test(l.getAttribute('stroke') || ''));
    segs.forEach((l, i) => {
      l.setAttribute('pathLength', '1'); l.style.strokeDasharray = '1';
      l.classList.remove('draw-seg'); void l.getBoundingClientRect();
      l.style.animationDelay = (i * 0.05) + 's'; l.classList.add('draw-seg');
    });
    const dots = $$('g[stroke-width] > circle, g[font-weight] > text', svg);
    dots.forEach(n => n.animate && n.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, delay: 120 + segs.length * 50, fill: 'backwards' }));
  }
  $$('svg.curve, svg.acc-chart, .cmp-chart svg').forEach(svg => {
    let pending = false;
    new MutationObserver(() => { if (pending) return; pending = true; requestAnimationFrame(() => { pending = false; if (svg.dataset.inview) animateLines(svg); }); }).observe(svg, { childList: true });
    const o = io(es => es.forEach(e => { if (e.isIntersecting) { svg.dataset.inview = '1'; animateLines(svg); o.unobserve(svg); } }), { threshold: 0.3 });
    if (o) o.observe(svg); else svg.dataset.inview = '1';
  });

  /* ---------- each indicator's own bar marks the part being read ---------- */
  $$('.zone-nav').forEach(zn => {
    const box = $('.zone-nav-in', zn), zl = $$('a[href^="#"]:not(.zn-name)', zn), zid = zl.map(a => a.getAttribute('href').slice(1));
    let cur, raf = 0;
    const zspy = () => {
      raf = 0; const y = innerHeight * 0.35; let f = null;
      for (const id of zid) { const s = document.getElementById(id); if (s) { const r = s.getBoundingClientRect(); if (r.top <= y && r.bottom > y) { f = id; break; } } }
      if (f === cur) return; cur = f;
      zl.forEach(a => {
        if (a.getAttribute('href') !== '#' + f) { a.removeAttribute('aria-current'); return; }
        a.setAttribute('aria-current', 'true');
        // on narrow screens the bar scrolls sideways: bring the active link into it
        const br = box.getBoundingClientRect(), ar = a.getBoundingClientRect();
        if (ar.left < br.left || ar.right > br.right) box.scrollBy({ left: ar.left - br.left - 24, behavior: reduce ? 'auto' : 'smooth' });
      });
    };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(zspy); }, { passive: true });
    zspy();
  });

  /* ---------- FAQ opens and closes smoothly ---------- */
  $$('.faq details').forEach(d => {
    const sum = $('summary', d); let anim = null;
    sum.addEventListener('click', ev => {
      if (reduce || !d.animate) return;
      ev.preventDefault();
      if (anim) anim.cancel();
      const start = d.offsetHeight;
      if (d.open) {
        const end = sum.offsetHeight + 2;
        anim = d.animate([{ height: start + 'px' }, { height: end + 'px' }], { duration: 260, easing: 'cubic-bezier(.65,0,.35,1)' });
        anim.onfinish = () => { d.open = false; anim = null; };
      } else {
        d.open = true; const end = d.offsetHeight;
        anim = d.animate([{ height: start + 'px' }, { height: end + 'px' }], { duration: 320, easing: 'cubic-bezier(.16,1,.3,1)' });
        anim.onfinish = () => { anim = null; };
      }
    });
  });

  /* ---------- copy button confirms ---------- */
  const copyBtn = $('#copyMsg'), copyStatus = $('#copyStatus');
  if (copyBtn && copyStatus) {
    const label = copyBtn.textContent; let t = 0;
    new MutationObserver(() => {
      if (!/^Copiado/.test(copyStatus.textContent)) return;
      clearTimeout(t); copyBtn.classList.add('ok'); copyBtn.textContent = '✓ Copiado';
      t = setTimeout(() => { copyBtn.classList.remove('ok'); copyBtn.textContent = label; }, 1800);
    }).observe(copyStatus, { childList: true, characterData: true, subtree: true });
  }

  /* ---------- TradingView-style crosshair over the hero chart (decorative scale) ---------- */
  const hero = $('#inicio'), cc = $('#crossCanvas');
  if (hero && cc && matchMedia('(pointer: fine)').matches) {
    const g = cc.getContext('2d'); let mx = -1, my = -1, raf = 0;
    const resize = () => { const dpr = Math.min(devicePixelRatio || 1, 2); cc.width = Math.round(cc.clientWidth * dpr); cc.height = Math.round(cc.clientHeight * dpr); g.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const draw = () => {
      raf = 0; const w = cc.clientWidth, h = cc.clientHeight; g.clearRect(0, 0, w, h);
      if (mx < 0) return;
      g.save(); g.setLineDash([4, 5]); g.strokeStyle = 'rgba(244,238,239,0.3)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(0, Math.round(my) + 0.5); g.lineTo(w, Math.round(my) + 0.5); g.moveTo(Math.round(mx) + 0.5, 0); g.lineTo(Math.round(mx) + 0.5, h); g.stroke(); g.restore();
      const price = (0.6050 - (my / h) * 0.0100).toFixed(5);
      g.font = '700 12px "JetBrains Mono", monospace'; g.textBaseline = 'middle';
      const pw = g.measureText(price).width + 16;
      g.fillStyle = '#e5162e'; g.fillRect(w - pw, my - 11, pw, 22); g.fillStyle = '#fff'; g.fillText(price, w - pw + 8, my + 0.5);
      const mins = 8 * 60 + Math.round((mx / w) * 9 * 60), tl = `NY ${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
      const tw = g.measureText(tl).width + 16, tx = Math.min(Math.max(mx - tw / 2, 0), w - tw);
      g.fillStyle = 'rgba(42,46,57,0.95)'; g.fillRect(tx, h - 26, tw, 22); g.fillStyle = '#d1d4dc'; g.fillText(tl, tx + 8, h - 15);
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(draw); };
    hero.addEventListener('pointermove', e => { const r = cc.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; queue(); });
    hero.addEventListener('pointerleave', () => { mx = my = -1; queue(); });
    addEventListener('resize', () => { resize(); queue(); }); resize();
  }
})();
