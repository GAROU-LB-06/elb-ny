/* ELB · inicio: portada, catálogo de indicadores, demo y acceso */
(() => {
  'use strict';
  const { reduce, $, $$, css, fmtR, resumen, catCardHTML } = ELB;

  /* ---------- links from before the site had one page per indicator ---------- */
  // #resultados, #comparativa, #simulador, #calculadora, #elb-ny…, #elb-nzdusd…, #<id>… → indicador.html?id=…
  (function legacyLinks() {
    const h = decodeURIComponent(location.hash.slice(1)), first = INDICADORES[0];
    if (!h || !first) return;
    const part = s => (['resultados', 'comparativa', 'simulador', 'calculadora'].includes(s) ? s : '');
    let id = '', sec = '';
    if (part(h)) { id = first.id; sec = h; }
    else {
      const m = h.match(/^elb-(?:ny|nzdusd)(?:-(\w+))?$/);
      if (m) { id = first.id; sec = part(m[1] || ''); }
      else { const ind = INDICADORES.find(i => h === i.id || h.startsWith(i.id + '-')); if (ind) { id = ind.id; sec = part(h.slice(ind.id.length + 1)); } }
    }
    if (id) location.replace('indicador.html?id=' + encodeURIComponent(id) + (sec ? '#' + sec : ''));
  })();

  /* ---------- catalog: one card per indicator; the page itself never grows with them ---------- */
  $('#catGrid .soon-card').insertAdjacentHTML('beforebegin', INDICADORES.map(catCardHTML).join(''));
  const destacado = INDICADORES[0];
  if (destacado) { const { s } = resumen(destacado); $('#heroChip').lastChild.textContent = `${s.months} meses: ${fmtR(s.net)}`; }

  /* ---------- hero: sound toggle + 3D tilt ---------- */
  const heroVideo = $('#heroVideo'), soundBtn = $('#soundBtn');
  function setHeroSound(on) {
    heroVideo.muted = !on;
    if (on) { heroVideo.currentTime = 0; heroVideo.play().catch(() => {}); }
    soundBtn.setAttribute('aria-pressed', String(on));
    $('#soundLabel').textContent = on ? 'Silenciar' : 'Activar sonido';
    $('#soundWave').setAttribute('d', on ? 'M16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12' : 'M17 9l4 6M21 9l-4 6');
  }
  soundBtn.addEventListener('click', () => setHeroSound(heroVideo.muted));
  const giant = $('#giant'), phone = $('#phone'), hero = $('#inicio');
  if (!reduce && matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      giant.style.setProperty('--ry', (-14 + x * 16).toFixed(2) + 'deg'); giant.style.setProperty('--rx', (6 - y * 10).toFixed(2) + 'deg');
      phone.style.setProperty('--pry', (-10 + x * 14).toFixed(2) + 'deg'); phone.style.setProperty('--prx', (4 - y * 8).toFixed(2) + 'deg');
    });
    hero.addEventListener('pointerleave', () => { ['--ry', '--rx'].forEach(p => giant.style.removeProperty(p)); ['--pry', '--prx'].forEach(p => phone.style.removeProperty(p)); });
  }

  /* ---------- deterministic RNG ---------- */
  const rng = seed => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  /* ---------- background candles (hero) ---------- */
  const bg = $('#bgCandles'), bctx = bg.getContext('2d');
  const R = rng(42); const bars = []; let p = 100;
  for (let i = 0; i < 600; i++) { const o = p, c = o + (R() - 0.48) * 1.6 + Math.sin(i / 23) * 0.35; const h = Math.max(o, c) + R() * 0.9, l = Math.min(o, c) - R() * 0.9; bars.push({ o, c, h, l }); p = c; }
  let bgOff = 0, bgVisible = true, bgLast = 0;
  function drawBg(ts) {
    const dpr = Math.min(devicePixelRatio || 1, 2), w = bg.clientWidth, h = bg.clientHeight;
    if (bg.width !== Math.round(w * dpr) || bg.height !== Math.round(h * dpr)) { bg.width = Math.round(w * dpr); bg.height = Math.round(h * dpr); }
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0); bctx.clearRect(0, 0, w, h);
    const cw = 14, n = Math.ceil(w / cw) + 2, start = Math.floor(bgOff) % (bars.length - n - 1), frac = bgOff % 1;
    const view = bars.slice(start, start + n);
    let lo = Infinity, hi = -Infinity; view.forEach(b => { lo = Math.min(lo, b.l); hi = Math.max(hi, b.h); });
    const pad = (hi - lo) * 0.25, y = v => h * 0.1 + (1 - (v - lo + pad) / (hi - lo + pad * 2)) * h * 0.8;
    bctx.strokeStyle = 'rgba(255,255,255,0.035)'; bctx.lineWidth = 1;
    for (let gx = 0; gx < w; gx += 70) { bctx.beginPath(); bctx.moveTo(gx + 0.5, 0); bctx.lineTo(gx + 0.5, h); bctx.stroke(); }
    for (let gy = 0; gy < h; gy += 70) { bctx.beginPath(); bctx.moveTo(0, gy + 0.5); bctx.lineTo(w, gy + 0.5); bctx.stroke(); }
    view.forEach((b, i) => {
      const x = (i - frac) * cw, up = b.c >= b.o, col = up ? 'rgba(34,171,148,0.55)' : 'rgba(229,22,46,0.6)';
      bctx.strokeStyle = col; bctx.fillStyle = col;
      bctx.beginPath(); bctx.moveTo(x + cw / 2, y(b.h)); bctx.lineTo(x + cw / 2, y(b.l)); bctx.stroke();
      const top = y(Math.max(b.o, b.c)), bot = y(Math.min(b.o, b.c)); bctx.fillRect(x + 3, top, cw - 6, Math.max(1.5, bot - top));
    });
    if (!reduce && bgVisible) { const dt = bgLast ? Math.min(64, ts - bgLast) : 16; bgLast = ts; bgOff += dt / 600; requestAnimationFrame(drawBg); } else bgLast = 0;
  }
  new IntersectionObserver(es => { const v = es[0].isIntersecting; if (v && !bgVisible) { bgVisible = true; requestAnimationFrame(drawBg); } bgVisible = v; }).observe(bg);
  requestAnimationFrame(drawBg);
  addEventListener('resize', () => { if (reduce) requestAnimationFrame(drawBg); });

  /* ---------- signal simulator ---------- */
  const simCanvas = $('#simCanvas'), sctx = simCanvas.getContext('2d');
  function buildScenario(kind) {
    const r = rng(kind === 'tp' ? 1002 : 1007), N = 62, SIG = 30, pts = [];
    const pre = [[0, 101.0], [8, 101.25], [16, 100.7], [23, 100.95], [29, 100.08]];
    const post = kind === 'tp'
      ? [[30, 100.05], [34, 100.35], [38, 100.2], [43, 100.75], [48, 101.0], [52, 101.45], [55, 101.95], [58, 101.75], [61, 101.9]]
      : [[30, 100.05], [33, 99.85], [36, 99.7], [39, 99.38], [42, 99.25], [47, 99.5], [52, 99.35], [56, 99.55], [61, 99.45]];
    const ctrl = pre.concat(post);
    const at = i => { for (let k = 1; k < ctrl.length; k++) if (i <= ctrl[k][0]) { const [x0, y0] = ctrl[k - 1], [x1, y1] = ctrl[k]; const u = (i - x0) / (x1 - x0 || 1), e = u * u * (3 - 2 * u); return y0 + (y1 - y0) * e; } return ctrl[ctrl.length - 1][1]; };
    let prev = 101.0;
    for (let i = 0; i < N; i++) {
      const o = prev, c = at(i) + (i === SIG ? 0 : (r() - 0.5) * 0.12);
      let h = Math.max(o, c) + r() * 0.1, l = Math.min(o, c) - r() * 0.1;
      pts.push({ o, c, h, l }); prev = c;
    }
    const entry = pts[SIG].c, risk = 0.6, sl = entry - risk, tp = entry + risk * 3;
    let hit = -1;
    for (let i = SIG + 1; i < N; i++) {
      const b = pts[i];
      if (kind === 'tp') { b.l = Math.max(b.l, sl + 0.12); if (b.h >= tp) { hit = i; break; } }
      else { b.h = Math.min(b.h, tp - 0.5); if (b.l <= sl) { hit = i; break; } }
    }
    if (hit < 0) hit = N - 1;
    return { kind, pts, N, SIG, entry, sl, tp, hit };
  }
  const scenarios = { tp: buildScenario('tp'), sl: buildScenario('sl') };
  let sim = { kind: 'tp', prog: scenarios.tp.N, playing: false };

  function drawSim() {
    const S = scenarios[sim.kind], dpr = Math.min(devicePixelRatio || 1, 2);
    const w = simCanvas.clientWidth, h = simCanvas.clientHeight;
    if (simCanvas.width !== Math.round(w * dpr) || simCanvas.height !== Math.round(h * dpr)) { simCanvas.width = Math.round(w * dpr); simCanvas.height = Math.round(h * dpr); }
    const g = sctx; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
    const axisW = 64, padT = 22, padB = 22, plotW = w - axisW - 10, plotH = h - padT - padB;
    let lo = Infinity, hi = -Infinity; S.pts.forEach(b => { lo = Math.min(lo, b.l); hi = Math.max(hi, b.h); });
    lo = Math.min(lo, S.sl) - 0.15; hi = Math.max(hi, S.tp) + 0.15;
    const y = v => padT + (1 - (v - lo) / (hi - lo)) * plotH, cw = plotW / S.N, x = i => 8 + i * cw;
    const C = { grid: 'rgba(255,255,255,0.05)', txt: css('--dim'), up: css('--tp'), dn: css('--sl'), entry: css('--entry'), tp: css('--tp'), sl: css('--sl'), fg: css('--fg') };
    g.font = '600 11px "JetBrains Mono", monospace'; g.textBaseline = 'middle';
    for (let v = Math.ceil(lo * 2) / 2; v <= hi; v += 0.5) {
      g.strokeStyle = C.grid; g.beginPath(); g.moveTo(0, Math.round(y(v)) + 0.5); g.lineTo(w - axisW, Math.round(y(v)) + 0.5); g.stroke();
      g.fillStyle = C.txt; g.textAlign = 'left'; g.fillText(v.toFixed(2), w - axisW + 8, y(v));
    }
    const shown = Math.min(S.N, sim.prog), full = Math.floor(shown), part = shown - full;
    const lineP = Math.max(0, Math.min(1, (shown - (S.SIG + 1)) * 0.8));
    if (lineP > 0) {
      const x0 = x(S.SIG) + cw / 2, xEndFull = x(S.N) - 2, xe = x0 + (xEndFull - x0) * lineP;
      const closed = shown > S.hit + 1, xz = closed ? Math.min(xe, x(S.hit) + cw) : xe;
      g.globalAlpha = 0.16; g.fillStyle = C.tp; g.fillRect(x0, y(S.tp), xz - x0, y(S.entry) - y(S.tp));
      g.fillStyle = C.sl; g.fillRect(x0, y(S.entry), xz - x0, y(S.sl) - y(S.entry)); g.globalAlpha = 1;
      [[S.tp, C.tp, 'TP 1:3'], [S.entry, C.entry, 'ENTRADA'], [S.sl, C.sl, 'SL']].forEach(([v, col, lab]) => {
        g.save(); g.strokeStyle = col; g.lineWidth = 2; g.setLineDash([7, 5]); g.shadowColor = col; g.shadowBlur = 10;
        g.beginPath(); g.moveTo(x0, y(v)); g.lineTo(xe, y(v)); g.stroke(); g.restore();
        if (lineP > 0.6) {
          const lx = w - axisW + 2;
          g.fillStyle = col; g.fillRect(lx, y(v) - 10, axisW - 4, 20);
          g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = '700 10px "JetBrains Mono", monospace'; g.fillText(lab, lx + (axisW - 4) / 2, y(v) + 0.5);
          g.font = '600 11px "JetBrains Mono", monospace';
        }
      });
    }
    for (let i = 0; i < Math.min(S.N, full + (part > 0 ? 1 : 0)); i++) {
      const b = S.pts[i]; let c = b.c, hh = b.h, ll = b.l;
      if (i === full && part > 0) { c = b.o + (b.c - b.o) * part; hh = Math.max(b.o, c) + (b.h - Math.max(b.o, b.c)) * part; ll = Math.min(b.o, c) - (Math.min(b.o, b.c) - b.l) * part; }
      const up = c >= b.o, col = up ? C.up : C.dn, cx = x(i) + cw / 2;
      g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(cx, y(hh)); g.lineTo(cx, y(ll)); g.stroke();
      const top = y(Math.max(b.o, c)), bot = y(Math.min(b.o, c)); g.fillRect(x(i) + cw * 0.18, top, cw * 0.64, Math.max(1.5, bot - top));
    }
    if (shown >= S.SIG + 1) {
      const cx = x(S.SIG) + cw / 2, cy = y(S.pts[S.SIG].c);
      g.save(); g.strokeStyle = css('--red-hot'); g.lineWidth = 2; g.shadowColor = css('--red'); g.shadowBlur = 14;
      g.beginPath(); g.arc(cx, cy, 13, 0, Math.PI * 2); g.stroke(); g.restore();
      g.fillStyle = C.fg; g.textAlign = 'center'; g.font = '700 11px "JetBrains Mono", monospace'; g.fillText('SEÑAL', cx, cy + 26);
    }
    if (shown > S.hit + 1) {
      const win = S.kind === 'tp', txt = win ? 'TP alcanzado  +3R' : 'SL tocado  −1R', col = win ? C.tp : C.sl;
      g.font = '700 15px "JetBrains Mono", monospace'; const tw = g.measureText(txt).width + 28;
      const bx = 14, by = 14; g.fillStyle = 'rgba(11,8,9,0.85)'; g.fillRect(bx, by, tw, 36);
      g.strokeStyle = col; g.lineWidth = 2; g.strokeRect(bx + 1, by + 1, tw - 2, 34);
      g.fillStyle = col; g.textAlign = 'left'; g.fillText(txt, bx + 14, by + 18.5);
      const hx = x(S.hit) + cw / 2, hy = y(win ? S.tp : S.sl);
      g.save(); g.fillStyle = col; g.shadowColor = col; g.shadowBlur = 16; g.beginPath(); g.arc(hx, hy, 6, 0, Math.PI * 2); g.fill(); g.restore();
    }
  }
  function playSim() {
    if (reduce) { sim.prog = scenarios[sim.kind].N; drawSim(); return; }
    sim.prog = 0; sim.playing = true; let last = 0;
    const S = scenarios[sim.kind];
    const step = ts => {
      if (!sim.playing) return;
      const dt = last ? Math.min(50, ts - last) : 16; last = ts;
      const slow = sim.prog > S.SIG - 1 && sim.prog < S.SIG + 3 ? 0.35 : 1;
      sim.prog += dt / 1000 * 11 * slow;
      drawSim();
      if (sim.prog < S.N) requestAnimationFrame(step); else { sim.playing = false; sim.prog = S.N; drawSim(); }
    };
    requestAnimationFrame(step);
  }
  $$('#simSeg button').forEach(b => b.addEventListener('click', () => {
    $$('#simSeg button').forEach(o => o.setAttribute('aria-pressed', String(o === b)));
    sim.kind = b.dataset.kind; sim.playing = false; playSim();
  }));
  $('#simPlay').addEventListener('click', () => { sim.playing = false; playSim(); });
  addEventListener('resize', () => drawSim());
  document.fonts && document.fonts.ready.then(drawSim);
  drawSim();
  new IntersectionObserver((es, ob) => { if (es[0].isIntersecting) { ob.disconnect(); playSim(); } }, { threshold: 0.5 }).observe(simCanvas);

  /* ---------- access: pick the indicator, the message and the TradingView view follow it ---------- */
  const accInd = $('#accInd'), tvUser = $('#tvUser'), preview = $('#msgPreview'), status = $('#copyStatus'), accTv = $('#accTv');
  INDICADORES.forEach(i => { const o = document.createElement('option'); o.value = i.id; o.textContent = i.nombre; accInd.append(o); });
  const pedido = new URLSearchParams(location.search).get('ind');
  if (pedido && INDICADORES.some(i => i.id === pedido)) accInd.value = pedido;
  const chosen = () => INDICADORES.find(i => i.id === accInd.value) || INDICADORES[0];
  const buildMsg = () => `Hola, quiero acceso gratis a ${chosen().nombre}. Mi usuario de TradingView es: ${tvUser.value.trim() || '________'}`;
  function syncChoice() {
    const i = chosen();
    preview.textContent = buildMsg();
    $$('[data-ind-name]').forEach(e => { e.textContent = i.nombre; });
    $('.tvdlg').setAttribute('aria-label', `Vista del menú de indicadores de TradingView con ${i.nombre} seleccionado`);
    if (i.tradingview) accTv.href = i.tradingview;
    accTv.closest('p').style.display = i.tradingview ? '' : 'none';
  }
  accInd.addEventListener('change', () => { syncChoice(); status.textContent = ''; });
  tvUser.addEventListener('input', () => { preview.textContent = buildMsg(); status.textContent = ''; });
  syncChoice();
  $('#copyMsg').addEventListener('click', () => {
    const text = buildMsg();
    const fallback = () => { const range = document.createRange(); range.selectNodeContents(preview); const s = getSelection(); s.removeAllRanges(); s.addRange(range); status.textContent = 'Mensaje seleccionado: cópialo con Ctrl+C o mantén pulsado.'; };
    if (!tvUser.value.trim()) { status.style.color = css('--red-hot'); status.textContent = 'Escribe tu usuario de TradingView primero.'; tvUser.focus(); return; }
    status.style.color = '';
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => { status.textContent = 'Copiado. Pégalo en mi DM.'; }, fallback);
    else fallback();
  });

  /* ---------- TradingView search replay ---------- */
  const typed = $('#tvTyped'), row = $('#tvRow');
  let tvTimer = null;
  $('#tvReplay').addEventListener('click', () => {
    clearTimeout(tvTimer);
    const q = 'ELB'; let i = 0;
    typed.textContent = ''; row.classList.add('pending'); row.classList.remove('idle');
    if (reduce) { typed.textContent = q; row.classList.remove('pending'); return; }
    const tick = () => {
      if (i < q.length) { typed.textContent = q.slice(0, ++i); tvTimer = setTimeout(tick, 110); }
      else { tvTimer = setTimeout(() => { row.classList.remove('pending'); row.classList.add('idle'); tvTimer = setTimeout(() => row.classList.remove('idle'), 500); }, 250); }
    };
    tvTimer = setTimeout(tick, 250);
  });
})();
