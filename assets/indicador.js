/* ELB · página de un indicador: se arma completa desde sus datos en datos.js (indicador.html?id=...) */
(() => {
  'use strict';
  const { $, $$, svgEl, COL, CMP, MONO, WORD, esc, fmtR, wrOf, sumOf, rStep, usd, usd0, fmtUsd, fmtUsdS, pctS, compact, parseCap, niceStep, accRow,
    chartLabel, isNarrow, showX, prepMonths, statsOf, nameHTML, cmpCard, accesoUrl, catCardHTML, TV_ICO } = ELB;

  function zoneHTML(ind, z) {
    const p = ind.id, g = ind.grafico, [ka, kb] = z.ks, s0 = z.ST[ka], R = ind.ratios[ka];
    const beTxt = String(+(100 / (ka + 1)).toFixed(1)); // breakeven winrate for this TP target: 25 % at 1:3
    const ratioSeg = lbl => (z.two ? `<div class="seg ratio-seg" role="group" aria-labelledby="${lbl}">${z.ks.map((k, i) => `<button type="button" class="${i ? 'b' : 'a'}" data-ratio="${k}" aria-pressed="${k === ka}">1:${k}</button>`).join('')}</div>` : '');
    const reels = (ind.reels || []).length ? `
        <div class="reels">${ind.reels.map(r => `
          <figure class="reel">
            <video src="${esc(r.video)}" poster="${esc(r.portada)}" controls playsinline preload="none"></video>
            <figcaption><h3>${esc(r.titulo)}</h3><p>${esc(r.texto)}</p></figcaption>
          </figure>`).join('')}
        </div>` : '';
    return `
  <div class="ind-zone" id="${p}" data-ind="${p}">
    <header class="zone-hero">
      <div class="wrap zone-hero-in">
        <div class="zone-id">
          <p class="kicker">ELB://indicador/${p}</p>
          <h1 class="zone-title">${nameHTML(ind)}</h1>
          <p class="zone-full">${esc(ind.completo)}</p>${ind.descripcion ? `
          <p class="zone-desc">${esc(ind.descripcion)}</p>` : ''}
          <p class="zone-stats num"><span><b>${fmtR(s0.net)}</b> con TP 1:${ka}</span><span><b>${s0.n}</b> trades</span><span><b>${s0.wr.toFixed(1)} %</b> de acierto</span><span><b>${s0.pos} de ${s0.months}</b> meses en positivo</span></p>
          <p class="zone-links"><a class="btn btn-red" href="${accesoUrl(ind)}">Pedir acceso gratis</a>${ind.tradingview ? `<a class="btn btn-tv" href="${esc(ind.tradingview)}" target="_blank" rel="noopener">${TV_ICO}Ver en TradingView</a>` : ''}</p>
        </div>
        <div class="ticket zone-chart">
          <p class="lbl-like">Gráfico de estos resultados</p>
          <div class="tv-sym"><span class="tv-coins" aria-hidden="true"><i>${esc(g.par.slice(0, 2))}</i><i>${esc(g.par.slice(3, 5))}</i></span><span>${esc(g.nombrePar || g.par)} · ${g.minutos} · ${esc(g.broker)}</span></div>
          <dl class="zone-specs">
            <div><dt>Par</dt><dd>${esc(g.par)}</dd></div>
            <div><dt>Broker</dt><dd>${esc(g.broker)}</dd></div>
            <div><dt>Temporalidad</dt><dd>${g.minutos} min</dd></div>
          </dl>
          <p class="zone-must">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 2 21h20L12 3z"/><path d="M12 10v5M12 18v.5"/></svg>
            <span><b>Obligatorio</b>Estos resultados salen de ${esc(g.par)} de ${esc(g.broker)} en ${g.minutos} minutos. Para obtenerlos usa ese mismo gráfico: con otro par, otro broker u otra temporalidad las señales y los resultados cambian.</span>
          </p>
        </div>
      </div>${(ind.ficha || []).length ? `
      <div class="wrap"><dl class="ficha">${ind.ficha.map(([t, d]) => `<div><dt>${esc(t)}</dt><dd>${esc(d)}</dd></div>`).join('')}</dl></div>` : ''}
    </header>

    <nav class="zone-nav" aria-label="${esc(ind.nombre)}: secciones">
      <div class="wrap zone-nav-in">
        <a class="zn-name" href="#${p}">ELB ${esc(ind.corto || ind.nombre)}</a>
        <a href="#resultados">Resultados</a>${z.two ? `
        <a href="#comparativa">1:${ka} vs 1:${kb}</a>` : ''}
        <a href="#simulador">Simulador</a>
        <a href="#calculadora">Ratio 1:${ka}</a>
        <span class="zn-sym num">${esc(z.sym)}</span>
      </div>
    </nav>

    <section class="sec" id="resultados">
      <div class="wrap">
        <header class="sec-head">
          <p class="kicker">ELB://${p}/backtest</p>
          <h2 class="h2" data-r="resHead">${esc(R.titulo)}</h2>
          <p data-r="resLede">${esc(R.intro)}</p>
        </header>${z.two ? `

        <div class="ratio-bar">
          <span class="lbl-like" id="${p}-ratioLbl">Objetivo del TP</span>
          ${ratioSeg(p + '-ratioLbl')}
          <a class="ratio-link" href="#comparativa">Comparar 1:${ka} contra 1:${kb} →</a>
        </div>` : ''}

        <div class="months" data-r="perSeg" role="group" aria-label="Elegir periodo"></div>
        <p class="per-note" data-r="perNote"></p>

        <div class="res-grid">
          <div class="ticket table-wrap">
            <table class="tv-table" data-r="resTable" aria-label="Tabla de resultados del indicador">
              <thead><tr><th scope="col" data-r="rtHead">Acumulado</th><th scope="col" data-r="rtMonth"></th></tr></thead>
              <tbody>
                <tr><td data-r="rtL0">Trades</td><td class="v white" data-r="rtTrades"></td></tr>
                <tr><td data-r="rtL1">TP</td><td class="v teal" data-r="rtTp"></td></tr>
                <tr><td data-r="rtL2">SL</td><td class="v red" data-r="rtSl"></td></tr>
                <tr><td data-r="rtL3">Winrate</td><td class="v red" data-r="rtWr"></td></tr>
                <tr><td data-r="rtL4">R neto</td><td class="v teal" data-r="rtR"></td></tr>
                <tr><td data-r="rtL5">Beneficio</td><td class="v teal" data-r="rtBen"></td></tr>
              </tbody>
            </table>
            <p class="table-note">Así aparece en el gráfico ${esc(z.sym)}, mes por mes. Beneficio calculado con ${usd0.format(z.risk)} de riesgo por operación.</p>
          </div>

          <div class="ticket curve-wrap">
            <div class="curve-head"><h3 data-r="curveTitle">R acumulado por mes</h3><span class="num curve-total" data-r="curveTotal"></span></div>
            <svg class="curve" data-r="curve" viewBox="0 0 640 260" role="img" aria-label="Curva de R acumulado"></svg>
            <p class="list-cap" data-r="listCap"></p>
            <ol class="trades" data-r="tradeList" aria-label="Resultado de cada trade"></ol>
          </div>
        </div>${reels}
      </div>
    </section>${z.two ? `

    <section class="sec" id="comparativa">
      <div class="wrap">
        <header class="sec-head">
          <p class="kicker">ELB://${p}/1-${ka}-vs-1-${kb}</p>
          <h2 class="h2">1:${ka} contra 1:${kb}</h2>
          <p>El mismo indicador y las mismas ${s0.n} señales ${esc(ind.periodo.largo)}, en ${esc(z.sym)}. Lo único que cambia es dónde va el TP: a ${WORD[ka] || ka} veces el riesgo o a ${WORD[kb] || kb}.</p>
        </header>

        <div class="cmp-cards">${cmpCard(ka, z.ST[ka], 'a', z.risk)}${cmpCard(kb, z.ST[kb], 'b', z.risk)}
        </div>

        <div class="ticket cmp-chart">
          <div class="curve-head">
            <h3>R acumulado mes a mes</h3>
            <div class="cmp-legend"><span class="lg3">1:${ka}</span><span class="lg2">1:${kb}</span></div>
          </div>
          <svg data-r="cmpChart" viewBox="0 0 640 270" role="img" aria-label="Curvas de R acumulado de 1:${ka} y 1:${kb}"></svg>${(ind.comparacion || []).length ? `
          <ul class="cmp-points">${ind.comparacion.map(t => `
            <li>${t}</li>`).join('')}
          </ul>` : ''}
        </div>

        <div class="ticket cmp-table-wrap">
          <table class="acc-table cmp-table" data-r="cmpTable" aria-label="Resultados mes a mes con TP a 1:${ka} y a 1:${kb}">
            <thead>
              <tr><th scope="col" rowspan="2">Mes</th><th scope="colgroup" colspan="3" class="g3">TP a 1:${ka}</th><th scope="colgroup" colspan="3" class="g2">TP a 1:${kb}</th></tr>
              <tr><th scope="col" class="g3">TP</th><th scope="col">SL</th><th scope="col">R</th><th scope="col" class="g2">TP</th><th scope="col">SL</th><th scope="col">R</th></tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
    </section>` : ''}

    <section class="sec" id="simulador">
      <div class="wrap">
        <header class="sec-head">
          <p class="kicker">ELB://${p}/simulador</p>
          <h2 class="h2">Simula tu cuenta</h2>
          <p>Elige un mes o los ${z.nM}, tu capital y cuánto arriesgas por operación. La simulación aplica a tu cuenta los TP y SL reales del backtest de ${esc(ind.nombre)} en ${esc(z.sym)}.</p>
        </header>

        <div class="ticket sim2">
          <form class="sim2-in" data-r="accForm" novalidate>
            <div class="field">
              <label for="${p}-period">Periodo</label>
              <select class="acc-period" id="${p}-period" data-r="accPeriod"></select>
            </div>
            <div class="field">
              <label for="${p}-cap">Capital inicial</label>
              <div class="money-in"><span aria-hidden="true">$</span><input id="${p}-cap" data-r="accCap" type="text" inputmode="decimal" value="1,000" autocomplete="off" spellcheck="false" aria-describedby="${p}-err"></div>
              <div class="quick" data-r="accQuick" role="group" aria-label="Capital rápido">
                <button type="button" data-cap="500">$500</button>
                <button type="button" data-cap="1000" aria-pressed="true">$1,000</button>
                <button type="button" data-cap="5000">$5,000</button>
                <button type="button" data-cap="10000">$10,000</button>
              </div>
              <p class="field-err" id="${p}-err" data-r="accErr" role="alert"></p>
            </div>
            <div class="field">
              <div class="field-top"><label for="${p}-risk">Riesgo por operación</label><output id="${p}-riskOut" for="${p}-risk" class="num" data-r="accRiskOut">1 %</output></div>
              <input id="${p}-risk" data-r="accRisk" type="range" min="0.25" max="5" step="0.25" value="1">
              <p class="field-hint num" data-r="accRiskHint"></p>
            </div>
            <div class="field">${z.two ? `
              <span class="lbl-like" id="${p}-accRatioLbl">Objetivo del TP</span>
              ${ratioSeg(p + '-accRatioLbl')}` : ''}
              <p class="field-hint" data-r="accRatioHint"></p>
            </div>
            <div class="field">
              <span class="lbl-like" id="${p}-modeLbl">Cómo se calcula el riesgo</span>
              <div class="seg" data-r="accMode" role="group" aria-labelledby="${p}-modeLbl">
                <button type="button" data-mode="fixed" aria-pressed="true">Fijo</button>
                <button type="button" data-mode="comp" aria-pressed="false">Compuesto</button>
              </div>
              <p class="field-hint" data-r="accModeHint"></p>
            </div>
          </form>

          <div class="sim2-out" aria-live="polite">
            <div class="acc-top">
              <div class="big-out">
                <span class="lbl" data-r="accEndLbl">Saldo final</span>
                <span class="val num acc-end" data-r="accEnd"></span>
                <span class="sub num" data-r="accGain"></span>
              </div>
            </div>
            <svg class="acc-chart" data-r="accChart" viewBox="0 0 560 210" role="img" aria-label="Evolución del saldo"></svg>
            <div class="acc-detail" data-r="accDetail"></div>
            <p class="calc-note">Simulación con los resultados del backtest en replay en ${esc(z.sym)}. No incluye comisiones, spread ni deslizamiento, y no garantiza resultados futuros.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="sec" id="calculadora">
      <div class="wrap">
        <header class="sec-head">
          <p class="kicker">ELB://${p}/ratio-1-${ka}</p>
          <h2 class="h2">¿Por qué 1:${ka}?</h2>
          <p>Cada TP paga ${WORD[ka] || ka} veces lo que arriesga cada SL. Con eso, acertar más de 1 de cada ${ka + 1} operaciones ya deja el resultado en positivo. Los controles arrancan en el ${Math.round(s0.wr)}&nbsp;% de acierto y las ${s0.n} operaciones reales de ${esc(ind.nombre)}. Muévelos y compruébalo.</p>
        </header>

        <div class="ticket calc">
          <div class="calc-in">
            <div class="field">
              <div class="field-top"><label for="${p}-wr">Winrate</label><output for="${p}-wr" class="num" data-r="wrOut"></output></div>
              <div class="range-wrap">
                <input id="${p}-wr" data-r="wr" type="range" min="10" max="90" step="1" value="${Math.min(90, Math.max(10, Math.round(s0.wr)))}" aria-describedby="${p}-beNote">
                <span class="be-mark" data-r="beMark" aria-hidden="true"><span>Equilibrio ${beTxt} %</span></span>
              </div>
            </div>
            <div class="field">
              <div class="field-top"><label for="${p}-ntr">Operaciones</label><output for="${p}-ntr" class="num" data-r="ntrOut"></output></div>
              <input id="${p}-ntr" data-r="ntr" type="range" min="5" max="100" step="1" value="${Math.min(100, Math.max(5, s0.n))}">
            </div>
            <div class="field">
              <div class="field-top"><label for="${p}-risk">Riesgo por operación</label><output for="${p}-risk" class="num" data-r="riskOut"></output></div>
              <input id="${p}-risk" data-r="risk" type="range" min="10" max="1000" step="10" value="${z.risk}">
            </div>
            <p class="calc-note" id="${p}-beNote">Con ratio 1:${ka} el punto de equilibrio está en ${beTxt}&nbsp;% de acierto: 1 TP (+${ka}R) compensa ${ka} SL (−${ka}R).</p>
          </div>
          <div class="calc-out" aria-live="polite">
            <div class="big-out">
              <span class="lbl">Resultado esperado</span>
              <span class="val num pos" data-r="totR"></span>
              <span class="sub num" data-r="totUsd"></span>
            </div>
            <div class="big-out">
              <span class="lbl">Por operación</span>
              <span class="val num pos" data-r="perR" style="font-size: clamp(28px, 4vw, 40px)"></span>
            </div>
            <div class="wl-bar" aria-hidden="true"><span class="w" data-r="wlW"></span><span class="l" data-r="wlL"></span></div>
            <div class="wl-legend num"><span data-r="wlWin" class="pos"></span><span data-r="wlLoss" class="neg"></span></div>
            <p class="calc-note">Es la matemática del ratio con el winrate que elijas. No es una promesa de resultados: el winrate real cambia de un mes a otro.</p>
          </div>
        </div>
      </div>
    </section>
  </div>`;
  }

  function mountIndicator(ind, host) {
    const p = ind.id, risk = ind.riesgoUsd || 100;
    const ks = Object.keys(ind.ratios).map(Number).sort((a, b) => b - a), DATA = {}, ST = {};
    ks.forEach(k => { DATA[k] = prepMonths(ind.ratios[k].meses); ST[k] = statsOf(DATA[k], k); });
    const z = { ks, ST, two: ks.length > 1, sym: chartLabel(ind.grafico), risk, nM: DATA[ks[0]].length };
    host.insertAdjacentHTML('beforeend', zoneHTML(ind, z));
    const zone = host.lastElementChild, q = r => zone.querySelector(`[data-r="${r}"]`);

    let RATIO = ks[0], MONTHS = DATA[RATIO], ALL, period = 'all';
    const buildAll = () => { ALL = { key: 'all', name: 'Total', short: 'Total', month: ind.periodo.corto, tp: sumOf(MONTHS, 'tp'), sl: sumOf(MONTHS, 'sl'), note: ind.ratios[RATIO].notaTotal || '' }; };
    buildAll();
    const netR = m => m.tp * RATIO - m.sl;

    // month chips (re-rendered when the TP target changes)
    const seg = q('perSeg');
    function renderChips() {
      seg.replaceChildren();
      [ALL, ...MONTHS].forEach(m => {
        const r = netR(m), b = document.createElement('button');
        b.type = 'button'; b.className = 'mchip'; b.dataset.period = m.key;
        b.setAttribute('aria-label', `${m.name}: ${fmtR(r)}, ${wrOf(m).toFixed(1)} % de acierto, ${m.tp} TP y ${m.sl} SL`);
        b.setAttribute('aria-pressed', String(m.key === period));
        b.innerHTML = `<span class="mn">${m.short}</span><span class="mr" style="color: ${r > 0 ? 'var(--tp)' : r < 0 ? 'var(--sl)' : 'var(--muted)'}">${fmtR(r)}</span><span class="ms">${wrOf(m).toFixed(1)} %</span><span class="ms"><b class="tpc">${m.tp} TP</b> · <b class="slc">${m.sl} SL</b></span>`;
        seg.append(b);
      });
    }
    renderChips();

    // cumulative-R line chart; points = [{ label, v }] starting at 0
    function drawLine(points) {
      const svg = q('curve'); svg.replaceChildren();
      const nar = isNarrow(svg), VW = nar ? 340 : 640, VH = nar ? 250 : 260;
      svg.setAttribute('viewBox', `0 0 ${VW} ${VH}`);
      const vals = points.map(pt => pt.v), lo = Math.min(0, ...vals), hi = Math.max(...vals);
      const step = rStep(Math.max(1, hi - lo));
      const vMin = Math.floor(lo / step) * step, vMax = Math.ceil(hi / step) * step + (hi % step === 0 ? step : 0);
      const X0 = nar ? 46 : 64, X1 = VW - (nar ? 20 : 28), Y0 = VH - 50, Y1 = 30, last = points.length - 1;
      const x = i => X0 + (X1 - X0) * i / last, y = v => Y0 - (Y0 - Y1) * (v - vMin) / (vMax - vMin);
      const many = points.length > (nar ? 6 : 9);
      const g = svgEl('g', { 'font-family': MONO, 'font-size': 12, fill: COL.txt });
      for (let v = vMin; v <= vMax; v += step) {
        g.append(svgEl('line', { x1: X0 - 6, x2: VW - 16, y1: y(v), y2: y(v), stroke: v === 0 ? COL.zero : COL.grid, 'stroke-dasharray': v === 0 ? '4 4' : '' }));
        g.append(svgEl('text', { x: X0 - 12, y: y(v) + 4, 'text-anchor': 'end' }, v + 'R'));
      }
      points.forEach((pt, i) => { if (!many || showX(i, last, nar ? 3 : 2)) g.append(svgEl('text', { x: x(i), y: VH - 14, 'text-anchor': i === last ? 'end' : i === 0 && nar ? 'start' : 'middle', 'font-size': many && !nar ? 11 : 12 }, pt.label)); });
      svg.append(g);
      const defs = svgEl('defs', {}), lg = svgEl('linearGradient', { id: p + '-area', x1: 0, y1: 0, x2: 0, y2: 1 });
      lg.append(svgEl('stop', { offset: 0, 'stop-color': COL.tp, 'stop-opacity': 0.35 }), svgEl('stop', { offset: 1, 'stop-color': COL.tp, 'stop-opacity': 0 }));
      defs.append(lg); svg.append(defs);
      let d = `M${x(0)} ${y(0)}`; points.forEach((pt, i) => { if (i) d += ` L${x(i)} ${y(pt.v)}`; }); d += ` L${x(last)} ${y(0)} Z`;
      svg.append(svgEl('path', { d, fill: `url(#${p}-area)` }));
      const lines = svgEl('g', { 'stroke-width': many ? 3 : 4, 'stroke-linecap': 'round' });
      for (let i = 1; i <= last; i++) lines.append(svgEl('line', { x1: x(i - 1), y1: y(points[i - 1].v), x2: x(i), y2: y(points[i].v), stroke: points[i].v >= points[i - 1].v ? COL.tp : COL.sl }));
      svg.append(lines);
      const dots = svgEl('g', { 'stroke-width': 3 });
      points.forEach((pt, i) => {
        const up = i && pt.v >= points[i - 1].v, col = i === 0 ? COL.start : up ? COL.tp : COL.sl;
        dots.append(svgEl('circle', { cx: x(i), cy: y(pt.v), r: i === last ? (nar ? 7 : 8) : many ? (nar ? 4 : 5) : 6, stroke: col, fill: i === last ? col : COL.void }));
      });
      svg.append(dots);
      // on a phone with many points only the final value is labelled; the axis carries the rest
      const labels = svgEl('g', { 'font-family': MONO, 'font-size': many && !nar ? 11 : 13, 'font-weight': 700, 'text-anchor': 'middle' });
      points.forEach((pt, i) => {
        if (!i || (nar && many && i !== last)) return; const up = pt.v >= points[i - 1].v;
        labels.append(svgEl('text', { x: x(i), y: up ? y(pt.v) - 14 : y(pt.v) + 22, fill: up ? COL.tp : COL.sl, 'text-anchor': i === last ? 'end' : 'middle' }, pt.v + 'R'));
      });
      svg.append(labels);
      svg.setAttribute('aria-label', 'Curva de R acumulado: ' + points.map(pt => `${pt.label} ${pt.v}R`).join(', '));
      return points[last].v;
    }

    // months without a recorded trade order: R won by TPs, R lost by SLs, net
    function drawComposition(m) {
      const svg = q('curve'); svg.replaceChildren();
      const nar = isNarrow(svg), VW = nar ? 340 : 640;
      svg.setAttribute('viewBox', `0 0 ${VW} 260`);
      const gain = m.tp * RATIO, loss = m.sl, net = gain - loss, max = Math.max(gain, loss, Math.abs(net), 1);
      // wide: label column on the left; phone: label and detail above a full-width bar
      const X0 = nar ? 4 : 196, W = nar ? VW - 76 : 370, H = nar ? 30 : 34;
      [['Ganado en TP', `${m.tp} × ${RATIO}R`, gain, COL.tp], ['Perdido en SL', `${m.sl} × 1R`, -loss, COL.sl], ['Neto del mes', `${wrOf(m).toFixed(1)} % de acierto`, net, net >= 0 ? COL.tp : COL.sl]]
        .forEach(([label, sub, v, col], i) => {
          const top = nar ? 14 + i * 80 : 34 + i * 74, bar = nar ? top + 24 : top, w = Math.max(3, W * Math.abs(v) / max);
          svg.append(svgEl('text', { x: 4, y: nar ? top + 14 : top + 15, fill: COL.fg, 'font-family': 'Barlow, sans-serif', 'font-size': nar ? 17 : 19, 'font-weight': 700 }, label));
          svg.append(svgEl('text', nar ? { x: VW - 4, y: top + 14, 'text-anchor': 'end', fill: COL.txt, 'font-family': MONO, 'font-size': 12 } : { x: 4, y: top + 36, fill: COL.txt, 'font-family': MONO, 'font-size': 13 }, sub));
          svg.append(svgEl('rect', { x: X0, y: bar, width: W, height: H, fill: COL.track }));
          svg.append(svgEl('rect', { x: X0, y: bar, width: w, height: H, fill: col, 'fill-opacity': i === 2 ? 1 : 0.8 }));
          svg.append(svgEl('text', { x: X0 + w + (nar ? 8 : 10), y: bar + (nar ? 21 : 23), fill: col, 'font-family': MONO, 'font-size': nar ? 15 : 17, 'font-weight': 700 }, (v >= 0 ? '+' : '−') + Math.abs(v) + 'R'));
        });
      svg.setAttribute('aria-label', `${m.month}: ${gain}R ganados en TP, ${loss}R perdidos en SL, neto ${fmtR(net)}`);
      return net;
    }

    function chip(cls, t, r, extra) {
      const li = document.createElement('li'); li.className = cls;
      li.innerHTML = `<span class="t">${t}</span><span class="r">${r}</span>${extra ? `<span class="m">${extra}</span>` : ''}`;
      return li;
    }
    function showPeriod(key) {
      const m = key === 'all' ? ALL : MONTHS.find(o => o.key === key);
      const n = m.tp + m.sl, r = netR(m), suffix = key === 'all' ? '' : ' mes';
      q('rtHead').textContent = key === 'all' ? 'Acumulado' : 'Mes actual'; q('rtMonth').textContent = m.month;
      ['Trades', 'TP', 'SL', 'Winrate', 'R neto', 'Beneficio'].forEach((l, i) => { q('rtL' + i).textContent = l + suffix; });
      q('rtTrades').textContent = n; q('rtTp').textContent = m.tp; q('rtSl').textContent = m.sl;
      const wrEl = q('rtWr'); wrEl.textContent = wrOf(m).toFixed(1) + ' %'; wrEl.className = 'v ' + (wrOf(m) >= 50 ? 'teal' : 'red');
      q('rtR').textContent = r.toFixed(2) + ' R'; q('rtBen').textContent = '$' + (r * risk).toFixed(2) + ' USD';
      q('resTable').setAttribute('aria-label', `Tabla de resultados de ${ind.nombre}, ${m.month}`);
      const list = q('tradeList'), cap = q('listCap'); list.replaceChildren();
      let total;
      if (key === 'all') {
        let acc = 0;
        total = drawLine([{ label: 'Inicio', v: 0 }, ...MONTHS.map(o => ({ label: o.short, v: (acc += netR(o)) }))]);
        q('curveTitle').textContent = 'R acumulado por mes';
        cap.textContent = 'Resultado de cada mes';
        MONTHS.forEach(o => list.append(chip(netR(o) >= 0 ? 'win' : 'loss', o.short.toUpperCase(), fmtR(netR(o)), `${o.tp} TP · ${o.sl} SL`)));
      } else if (m.seq) {
        let acc = 0;
        total = drawLine([{ label: 'Inicio', v: 0 }, ...m.seq.map((t, i) => ({ label: 'T' + (i + 1), v: (acc += t ? RATIO : -1) }))]);
        q('curveTitle').textContent = 'R acumulado por trade';
        cap.textContent = 'Cada trade, en el orden en que ocurrió';
        m.seq.forEach((t, i) => list.append(chip(t ? 'win' : 'loss', 'TRADE ' + (i + 1), t ? `+${RATIO}R` : '−1R')));
      } else {
        total = drawComposition(m);
        q('curveTitle').textContent = 'De dónde sale el resultado';
        cap.textContent = `${m.tp} TP y ${m.sl} SL. Es el resumen del mes: el orden de los trades no quedó registrado.`;
        for (let i = 0; i < m.tp; i++) list.append(chip('win', 'TP', `+${RATIO}R`));
        for (let i = 0; i < m.sl; i++) list.append(chip('loss', 'SL', '−1R'));
      }
      list.setAttribute('aria-label', cap.textContent);
      const tot = q('curveTotal'); tot.textContent = fmtR(total); tot.style.color = total < 0 ? 'var(--sl)' : total === 0 ? 'var(--muted)' : '';
      q('perNote').textContent = m.note;
      const grid = zone.querySelector('.res-grid'); grid.classList.remove('swap'); void grid.offsetWidth; grid.classList.add('swap');
    }
    seg.addEventListener('click', e => {
      const b = e.target.closest('.mchip'); if (!b) return;
      period = b.dataset.period;
      $$('.mchip', seg).forEach(o => o.setAttribute('aria-pressed', String(o === b)));
      showPeriod(period);
    });
    showPeriod('all');

    // TP target (1:3 / 1:2): one switch per indicator, shared by its results and its simulator
    const listeners = [];
    function setRatio(r) {
      if (r === RATIO) return;
      RATIO = r; MONTHS = DATA[r]; buildAll();
      $$('.ratio-seg button', zone).forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.ratio) === r)));
      q('resHead').textContent = ind.ratios[r].titulo; q('resLede').textContent = ind.ratios[r].intro;
      renderChips(); showPeriod(period);
      listeners.forEach(fn => fn());
    }
    $$('.ratio-seg', zone).forEach(g => g.addEventListener('click', e => { const b = e.target.closest('button[data-ratio]'); if (b) setRatio(Number(b.dataset.ratio)); }));

    // the two TP targets side by side: month table and both cumulative curves, from the same data
    if (z.two) (function comparison() {
      const [ka, kb] = ks, A = DATA[ka], B = DATA[kb], ra = m => m.tp * ka - m.sl, rb = m => m.tp * kb - m.sl, cls = v => (v > 0 ? 'pos' : v < 0 ? 'neg' : '');
      const tb = q('cmpTable').tBodies[0];
      A.forEach((a, i) => {
        const b = B[i], x = ra(a), y = rb(b), tr = document.createElement('tr');
        tr.innerHTML = `<td><span class="mfull">${a.name}</span><span class="mshort">${a.short}</span></td><td class="pos g3">${a.tp}</td><td class="neg">${a.sl}</td><td class="${cls(x)}">${fmtR(x)}</td><td class="pos g2">${b.tp}</td><td class="neg">${b.sl}</td><td class="${cls(y)}">${fmtR(y)}</td>`;
        tb.append(tr);
      });
      const sa = ST[ka], sb = ST[kb], tot = document.createElement('tr'); tot.className = 'tot';
      tot.innerHTML = `<td>Total</td><td class="pos g3">${sa.tp}</td><td class="neg">${sa.sl}</td><td class="${cls(sa.net)}">${fmtR(sa.net)}</td><td class="pos g2">${sb.tp}</td><td class="neg">${sb.sl}</td><td class="${cls(sb.net)}">${fmtR(sb.net)}</td>`;
      tb.append(tot);
      drawCmp();
    })();
    function drawCmp() {
      const [ka, kb] = ks, A = DATA[ka], B = DATA[kb], ra = m => m.tp * ka - m.sl, rb = m => m.tp * kb - m.sl;
      const svg = q('cmpChart'); svg.replaceChildren(); let a1 = 0, b1 = 0;
      const nar = isNarrow(svg), VW = nar ? 340 : 640;
      svg.setAttribute('viewBox', `0 0 ${VW} 270`);
      const s1 = [0, ...A.map(m => (a1 += ra(m)))], s2 = [0, ...B.map(m => (b1 += rb(m)))];
      const labels = ['Inicio', ...A.map(m => m.short)];
      const lo = Math.min(0, ...s1, ...s2), hi = Math.max(...s1, ...s2), step = rStep(Math.max(1, hi - lo));
      const vMin = Math.floor(lo / step) * step, vMax = Math.ceil(hi / step) * step + (hi % step === 0 ? step : 0);
      const X0 = nar ? 44 : 64, X1 = VW - (nar ? 52 : 50), Y0 = 220, Y1 = 26, n = s1.length - 1;
      const x = i => X0 + (X1 - X0) * i / n, y = v => Y0 - (Y0 - Y1) * (v - vMin) / (vMax - vMin);
      const g = svgEl('g', { 'font-family': MONO, 'font-size': 12, fill: COL.txt });
      for (let v = vMin; v <= vMax; v += step) {
        g.append(svgEl('line', { x1: X0 - 6, x2: VW - 10, y1: y(v), y2: y(v), stroke: v === 0 ? COL.zero : COL.grid, 'stroke-dasharray': v === 0 ? '4 4' : '' }));
        g.append(svgEl('text', { x: X0 - 12, y: y(v) + 4, 'text-anchor': 'end' }, v + 'R'));
      }
      labels.forEach((l, i) => { if (showX(i, n, nar ? 3 : 2)) g.append(svgEl('text', { x: x(i), y: 250, 'text-anchor': i === 0 ? 'start' : 'middle' }, l)); });
      svg.append(g);
      [[s1, CMP[0]], [s2, CMP[1]]].forEach(([s, col]) => {
        const lines = svgEl('g', { 'stroke-width': nar ? 3 : 3.5, 'stroke-linecap': 'round' });
        for (let i = 1; i <= n; i++) lines.append(svgEl('line', { x1: x(i - 1), y1: y(s[i - 1]), x2: x(i), y2: y(s[i]), stroke: col }));
        svg.append(lines);
        const dots = svgEl('g', { 'stroke-width': 2.5 });
        s.forEach((v, i) => dots.append(svgEl('circle', { cx: x(i), cy: y(v), r: i === n ? 6 : 3.5, stroke: col, fill: i === n ? col : COL.void })));
        svg.append(dots);
      });
      const end = svgEl('g', { 'font-family': MONO, 'font-size': 13, 'font-weight': 700 });
      end.append(svgEl('text', { x: x(n) + (nar ? 8 : 12), y: y(s1[n]) + 4, fill: CMP[0] }, fmtR(s1[n])));
      end.append(svgEl('text', { x: x(n) + (nar ? 8 : 12), y: y(s2[n]) + 4, fill: CMP[1] }, fmtR(s2[n])));
      svg.append(end);
      svg.setAttribute('aria-label', `R acumulado por mes. 1:${ka}: ${s1.slice(1).join(', ')}. 1:${kb}: ${s2.slice(1).join(', ')}.`);
    }

    // account simulator: the real monthly TP/SL applied to the viewer's capital
    const accPeriod = q('accPeriod'), accCap = q('accCap'), accRisk = q('accRisk');
    let accMode = 'fixed';
    [ALL, ...MONTHS].forEach(m => { const o = document.createElement('option'); o.value = m.key; o.textContent = m.key === 'all' ? ind.periodo.todos : m.month; accPeriod.append(o); });
    accPeriod.value = 'all';
    // one month applied to a balance; fixed risk uses the initial capital, compound uses the running balance
    // k = reward multiple of the risk per TP (3 for TP at 1:3)
    function monthResult(m, bal, B0, r, mode, k) {
      if (mode === 'fixed') return bal + B0 * r * (m.tp * k - m.sl);
      return bal * Math.pow(1 + k * r, m.tp) * Math.pow(1 - r, m.sl);
    }
    function drawAccLine(points, B0) {
      const svg = q('accChart'); svg.replaceChildren();
      const nar = isNarrow(svg), VW = nar ? 340 : 560;
      svg.setAttribute('viewBox', `0 0 ${VW} 210`);
      const vals = points.map(pt => pt.v), lo0 = Math.min(B0, ...vals), hi0 = Math.max(B0, ...vals);
      const step = niceStep(Math.max(hi0 - lo0, B0 * 0.02)), lo = Math.floor(lo0 / step) * step, hi = Math.ceil(hi0 / step) * step;
      const X0 = nar ? 56 : 70, X1 = VW - (nar ? 14 : 12), Y0 = 170, Y1 = 22, last = points.length - 1;
      const x = i => X0 + (X1 - X0) * i / Math.max(1, last), y = v => Y0 - (Y0 - Y1) * (v - lo) / Math.max(1e-9, hi - lo);
      const g = svgEl('g', { 'font-family': MONO, 'font-size': nar ? 12 : 11, fill: COL.txt });
      for (let v = lo; v <= hi + step / 2; v += step) {
        g.append(svgEl('line', { x1: X0 - 6, x2: VW - 4, y1: y(v), y2: y(v), stroke: COL.grid }));
        g.append(svgEl('text', { x: X0 - 10, y: y(v) + 4, 'text-anchor': 'end' }, compact(v)));
      }
      g.append(svgEl('line', { x1: X0, x2: VW - 4, y1: y(B0), y2: y(B0), stroke: COL.start, 'stroke-opacity': 0.5, 'stroke-dasharray': '4 4' }));
      const many = points.length > (nar ? 6 : 9);
      points.forEach((pt, i) => { if (!many || showX(i, last, nar ? 3 : 2)) g.append(svgEl('text', { x: x(i), y: 200, 'text-anchor': i === last && last ? 'end' : i === 0 ? 'start' : 'middle' }, pt.label)); });
      svg.append(g);
      let d = `M${x(0)} ${y(points[0].v)}`; points.forEach((pt, i) => { if (i) d += ` L${x(i)} ${y(pt.v)}`; });
      svg.append(svgEl('path', { d: d + ` L${x(last)} ${Y0} L${x(0)} ${Y0} Z`, fill: `url(#${p}-accArea)` }));
      const defs = svgEl('defs', {}), lg = svgEl('linearGradient', { id: p + '-accArea', x1: 0, y1: 0, x2: 0, y2: 1 });
      lg.append(svgEl('stop', { offset: 0, 'stop-color': COL.tp, 'stop-opacity': 0.28 }), svgEl('stop', { offset: 1, 'stop-color': COL.tp, 'stop-opacity': 0 }));
      defs.append(lg); svg.prepend(defs);
      const lines = svgEl('g', { 'stroke-width': 3, 'stroke-linecap': 'round' });
      for (let i = 1; i <= last; i++) lines.append(svgEl('line', { x1: x(i - 1), y1: y(points[i - 1].v), x2: x(i), y2: y(points[i].v), stroke: points[i].v >= points[i - 1].v ? COL.tp : COL.sl }));
      svg.append(lines);
      const dots = svgEl('g', { 'stroke-width': 2.5 });
      points.forEach((pt, i) => { const up = i && pt.v >= points[i - 1].v, col = i === 0 ? COL.start : up ? COL.tp : COL.sl; dots.append(svgEl('circle', { cx: x(i), cy: y(pt.v), r: i === last ? 6 : 4, stroke: col, fill: i === last ? col : COL.void })); });
      svg.append(dots);
      svg.append(svgEl('text', { x: x(last), y: y(points[last].v) - 12, 'text-anchor': 'end', fill: points[last].v >= B0 ? COL.tp : COL.sl, 'font-family': MONO, 'font-size': 13, 'font-weight': 700 }, fmtUsd(points[last].v)));
      svg.setAttribute('aria-label', 'Evolución del saldo: ' + points.map(pt => `${pt.label} ${fmtUsd(pt.v)}`).join(', '));
    }
    function drawAccBars(B0, end) {
      const svg = q('accChart'); svg.replaceChildren();
      const nar = isNarrow(svg), VW = nar ? 340 : 560;
      svg.setAttribute('viewBox', `0 0 ${VW} 210`);
      // wide: label column on the left; phone: label above a full-width bar
      const max = Math.max(B0, end), W = nar ? VW - 104 : 330, X0 = nar ? 4 : 170;
      [['Capital inicial', B0, COL.start], ['Saldo final', end, end >= B0 ? COL.tp : COL.sl]].forEach(([label, v, col], i) => {
        const top = nar ? 22 + i * 92 : 44 + i * 74, bar = nar ? top + 26 : top, w = Math.max(3, W * v / max);
        const tx = nar ? X0 + w + 8 : Math.min(X0 + w + 8, 556);
        svg.append(svgEl('text', { x: 4, y: nar ? top + 16 : top + 22, fill: COL.fg, 'font-family': 'Barlow, sans-serif', 'font-size': nar ? 16 : 18, 'font-weight': 700 }, label));
        svg.append(svgEl('rect', { x: X0, y: bar, width: W, height: 34, fill: COL.track }));
        svg.append(svgEl('rect', { x: X0, y: bar, width: w, height: 34, fill: col, 'fill-opacity': i ? 1 : 0.55 }));
        svg.append(svgEl('text', { x: tx, y: bar + 23, 'text-anchor': !nar && X0 + w + 8 > 470 ? 'end' : 'start', fill: i ? col : COL.fg, 'font-family': MONO, 'font-size': 14, 'font-weight': 700 }, fmtUsd(v)));
      });
      svg.setAttribute('aria-label', `Capital inicial ${fmtUsd(B0)}, saldo final ${fmtUsd(end)}`);
    }
    function runSim() {
      const B0 = parseCap(accCap.value), r = Number(accRisk.value) / 100, err = q('accErr');
      q('accRiskOut').textContent = (Number(accRisk.value) % 1 ? Number(accRisk.value).toFixed(2).replace(/0$/, '') : accRisk.value) + ' %';
      accRisk.style.setProperty('--fill', ((accRisk.value - accRisk.min) / (accRisk.max - accRisk.min) * 100) + '%');
      $$('button', q('accQuick')).forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.cap) === B0)));
      if (!(B0 >= 10 && B0 <= 1e7)) { err.textContent = 'Escribe un capital entre $10 y $10,000,000.'; return; }
      err.textContent = '';
      const riskUsd = B0 * r;
      const key = accPeriod.value, m = key === 'all' ? ALL : MONTHS.find(o => o.key === key);
      const k = RATIO; // each TP pays k times the risk, with that version's real TP/SL counts
      q('accRatioHint').textContent = `Datos reales del backtest con TP a 1:${k}: ${ALL.tp} TP y ${ALL.sl} SL en ${z.nM} meses, en ${z.sym}.`;
      q('accRiskHint').textContent = accMode === 'fixed'
        ? `= ${usd.format(riskUsd)} por operación · cada TP ${fmtUsdS(riskUsd * k)} · cada SL ${fmtUsdS(-riskUsd)}`
        : `= ${accRisk.value} % del saldo en cada operación (la primera arriesga ${usd.format(riskUsd)})`;
      q('accModeHint').textContent = accMode === 'fixed'
        ? 'Fijo: arriesgas siempre el mismo monto, calculado sobre tu capital inicial.'
        : 'Compuesto: el riesgo se recalcula sobre tu saldo en cada operación, así que crece cuando ganas y se reduce cuando pierdes.';
      let end, detail = '';
      if (key === 'all') {
        let bal = B0; const pts = [{ label: 'Inicio', v: B0 }], res = [];
        MONTHS.forEach(o => { const before = bal; bal = monthResult(o, bal, B0, r, accMode, k); res.push({ o, d: bal - before, bal }); pts.push({ label: o.short, v: bal }); });
        end = bal; drawAccLine(pts, B0);
        const bestD = Math.max(...res.map(e => e.d)), worstD = Math.min(...res.map(e => e.d));
        const names = d => res.filter(e => Math.abs(e.d - d) < 0.005).map(e => e.o.name).join(' y ');
        detail = `<div class="acc-table-wrap"><table class="acc-table"><thead><tr><th scope="col">Mes</th><th scope="col">TP</th><th scope="col">SL</th><th scope="col">Resultado</th><th scope="col">Saldo</th></tr></thead><tbody>`
          + res.map(e => `<tr><td><span class="mfull">${e.o.name}</span><span class="mshort">${e.o.short}</span></td><td class="pos">${e.o.tp}</td><td class="neg">${e.o.sl}</td><td class="${e.d >= 0 ? 'pos' : 'neg'}">${fmtUsdS(e.d)}</td><td>${fmtUsd(e.bal)}</td></tr>`).join('')
          + `</tbody></table></div>`
          + `<div class="acc-rows">${accRow('Mejor mes', `${names(bestD)} ${fmtUsdS(bestD)}`, 'pos')}${accRow('Peor mes', `${names(worstD)} ${fmtUsdS(worstD)}`, worstD >= 0 ? 'pos' : 'neg')}</div>`;
      } else {
        end = monthResult(m, B0, B0, r, accMode, k);
        if (m.seq) {
          let bal = B0; const pts = [{ label: 'Inicio', v: B0 }];
          m.seq.forEach((t, i) => { const rk = accMode === 'fixed' ? B0 * r : bal * r; bal += t ? rk * k : -rk; pts.push({ label: 'T' + (i + 1), v: bal }); });
          drawAccLine(pts, B0);
        } else drawAccBars(B0, end);
        if (accMode === 'fixed') {
          detail = `<div class="acc-rows">${accRow(`${m.tp} TP × ${fmtUsdS(riskUsd * k)}`, fmtUsdS(m.tp * riskUsd * k), 'pos')}${accRow(`${m.sl} SL × ${fmtUsdS(-riskUsd)}`, fmtUsdS(-m.sl * riskUsd), 'neg')}${accRow('Resultado del mes', fmtUsdS(end - B0), end >= B0 ? 'pos' : 'neg')}</div>`;
        } else {
          detail = `<div class="acc-rows">${accRow('Operaciones', `${m.tp} TP · ${m.sl} SL`)}${accRow('Riesgo', `${accRisk.value} % del saldo`)}${accRow('Resultado del mes', fmtUsdS(end - B0), end >= B0 ? 'pos' : 'neg')}</div>`
            + (m.seq ? '' : '<p class="field-hint">Con interés compuesto el saldo final no depende del orden de los trades, así que el resultado es exacto aunque el orden no esté registrado.</p>');
        }
      }
      q('accEndLbl').textContent = (key === 'all' ? `Saldo final tras ${z.nM} meses` : `Saldo final de ${m.name.toLowerCase()}`) + ` · TP 1:${k}`;
      const endEl = q('accEnd'); endEl.textContent = fmtUsd(end); endEl.className = 'val num acc-end ' + (end >= B0 ? 'pos' : 'neg');
      q('accGain').textContent = `${fmtUsdS(end - B0)} · ${pctS((end / B0 - 1) * 100)}`;
      q('accDetail').innerHTML = detail;
    }
    q('accForm').addEventListener('submit', e => e.preventDefault());
    accPeriod.addEventListener('change', runSim);
    accRisk.addEventListener('input', runSim);
    accCap.addEventListener('input', runSim);
    accCap.addEventListener('blur', () => { const v = parseCap(accCap.value); if (v >= 10 && v <= 1e7) accCap.value = v.toLocaleString('en-US', { maximumFractionDigits: 2 }); });
    $$('button', q('accQuick')).forEach(b => b.addEventListener('click', () => { accCap.value = Number(b.dataset.cap).toLocaleString('en-US'); runSim(); }));
    $$('button', q('accMode')).forEach(b => b.addEventListener('click', () => { accMode = b.dataset.mode; $$('button', q('accMode')).forEach(o => o.setAttribute('aria-pressed', String(o === b))); runSim(); }));
    listeners.push(runSim);
    runSim();

    // why 1:k: the result for any winrate with this indicator's TP target; it starts at its real numbers
    (function ratioCalc() {
      const k = ks[0], wr = q('wr'), ntr = q('ntr'), rk = q('risk');
      const money = v => (v < 0 ? '−' : '+') + '$' + Math.abs(Math.round(v)).toLocaleString('en-US');
      const fill = el => el.style.setProperty('--fill', ((el.value - el.min) / (el.max - el.min) * 100) + '%');
      function calc() {
        const n = Number(ntr.value), r = Number(rk.value), wins = Math.round(n * wr.value / 100), losses = n - wins;
        // whole TPs and SLs, so the indicator's real winrate and trades give exactly its real R
        const tot = wins * k - losses, per = tot / n;
        q('wrOut').textContent = wr.value + ' %'; q('ntrOut').textContent = n; q('riskOut').textContent = '$' + r.toLocaleString('en-US');
        const totEl = q('totR'), perEl = q('perR');
        totEl.textContent = (tot < 0 ? '−' : '+') + Math.abs(tot).toFixed(1) + 'R';
        perEl.textContent = (per < 0 ? '−' : '+') + Math.abs(per).toFixed(2) + 'R';
        [totEl, perEl].forEach(e => { e.classList.toggle('pos', tot >= 0); e.classList.toggle('neg', tot < 0); });
        q('totUsd').textContent = `≈ ${money(tot * r)} con $${r.toLocaleString('en-US')} por operación`;
        const wPart = wins * k, lPart = losses, sum = wPart + lPart || 1;
        q('wlW').style.width = (wPart / sum * 100) + '%'; q('wlL').style.width = (lPart / sum * 100) + '%';
        q('wlWin').textContent = `${wins} TP · +${wins * k}R`; q('wlLoss').textContent = `${losses} SL · −${losses}R`;
        [wr, ntr, rk].forEach(fill);
      }
      [wr, ntr, rk].forEach(el => el.addEventListener('input', calc));
      const be = 100 / (k + 1); // breakeven mark on the 10–90 slider; the thumb is 22px wide
      q('beMark').style.left = `calc(${(be - 10) / 80 * 100}% + ${11 - (be - 10) / 80 * 22}px)`;
      calc();
    })();

    // phones get their own chart layout: redraw when a resize or a rotation crosses that line
    let wasNarrow = isNarrow(q('curve')), rT = 0;
    addEventListener('resize', () => {
      clearTimeout(rT);
      rT = setTimeout(() => { const nowNarrow = isNarrow(q('curve')); if (nowNarrow === wasNarrow) return; wasNarrow = nowNarrow; showPeriod(period); runSim(); if (z.two) drawCmp(); }, 150);
    });
  }

  /* ---------- this page ---------- */
  const id = new URLSearchParams(location.search).get('id');
  const ind = INDICADORES.find(i => i.id === id);
  const host = $('#indPage');
  if (ind) {
    document.title = `${ind.nombre} · ELB`;
    const d = document.querySelector('meta[name="description"]');
    if (d) d.setAttribute('content', `${ind.nombre}: resultados mes a mes en ${chartLabel(ind.grafico)}, comparación de TP y simulador de cuenta.`);
    $('#crumbName').textContent = ind.nombre;
    mountIndicator(ind, host);
    $$('[data-acceso]').forEach(a => { a.href = accesoUrl(ind); });
    $$('[data-ind-name]').forEach(e => { e.textContent = ind.nombre; });
  } else {
    document.title = 'Indicador no encontrado · ELB';
    $('#crumbName').textContent = 'No encontrado';
    host.innerHTML = `
  <section class="sec ind-404">
    <div class="wrap">
      <header class="sec-head">
        <p class="kicker">ELB://404</p>
        <h1 class="h2">No encontré ese indicador</h1>
        <p>Puede que el enlace esté incompleto o que el indicador haya cambiado de nombre. Abajo están todos los indicadores ELB.</p>
      </header>
    </div>
  </section>`;
  }

  /* ---------- the other indicators, as the same cards as the catalog ---------- */
  const others = INDICADORES.filter(i => i !== ind);
  $('#otrosGrid .soon-card').insertAdjacentHTML('beforebegin', others.map(catCardHTML).join(''));
  $('#otrosHead').textContent = !ind ? 'Indicadores ELB' : others.length ? 'Otros indicadores ELB' : 'Próximos indicadores ELB';

  // the page is built by this script: aim at a linked part (#resultados…) once fonts and images have settled
  addEventListener('load', () => {
    const t = location.hash.length > 1 && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (t) t.scrollIntoView({ behavior: 'instant' });
  });
})();
