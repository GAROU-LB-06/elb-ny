/* ==========================================================================
   ELB · datos del sitio
   Este es el único archivo que hay que tocar para agregar un indicador o cambiar tus redes.
   ========================================================================== */

/* ======== Configuración: tus redes ========
   Escribe tu usuario y el enlace de cada red. Si una queda vacía, no se muestra en la página. */
// mostrar: lo que se lee en la tarjeta si no es @usuario
const REDES = [
  { id: 'instagram', nombre: 'Instagram', usuario: 'the_enough_l', url: 'https://www.instagram.com/the_enough_l/', dm: 'https://ig.me/m/the_enough_l', texto: 'Reels de backtests y las señales de la sesión.' },
  { id: 'tiktok', nombre: 'TikTok', usuario: 'elli.7hg', url: 'https://www.tiktok.com/@elli.7hg', dm: '', texto: 'Los mismos reels, primero que en ningún lado.' },
  { id: 'youtube', nombre: 'YouTube', usuario: '', url: '', dm: '', texto: 'Shorts y explicaciones más largas de los indicadores.' },
  { id: 'facebook', nombre: 'Facebook', usuario: 'sam.sepiol.torres', mostrar: 'Dxy XM', url: 'https://www.facebook.com/sam.sepiol.torres/', dm: 'https://m.me/sam.sepiol.torres', texto: 'Reels, avisos y novedades de los indicadores ELB.' },
  { id: 'tradingview', nombre: 'TradingView', usuario: 'negantwd308', url: 'https://es.tradingview.com/u/negantwd308/', dm: '', texto: 'Mi perfil, donde publico los indicadores ELB.' },
];

// fin del acceso gratis (año, mes - 1, día)
const FIN_GRATIS = new Date(2026, 11, 31, 23, 59, 59);

/* ======== Tus indicadores ========
   Cada indicador de esta lista tiene una tarjeta en el catálogo del inicio y su propia página
   (indicador.html?id=...) con resultados, comparación de TP y simulador de cuenta.
   Para agregar uno nuevo copia el bloque de ELB Sterling Edge NY - NZDUSD, cámbiale el id (sin espacios) y pon sus datos.
   - descripcion, estado y ficha: lo que se lee en la tarjeta y en la cabecera de su página.
   - grafico: el gráfico exacto donde se obtuvieron los resultados. Se muestra como obligatorio.
   - ratios: los TP y SL de cada mes con cada objetivo de TP (3 = TP a 1:3, 2 = TP a 1:2).
     Con un solo ratio su página no muestra la comparación.
   - orden: el orden de los trades del mes si quedó grabado (1 = TP, 0 = SL); si no, null. */
const INDICADORES = [
  {
    id: 'elb-sterling-edge',
    nombre: 'ELB Sterling Edge NY - NZDUSD', // como se llama en TradingView
    corto: 'Sterling Edge',         // nombre corto, para la barra de su página
    tradingview: 'https://es.tradingview.com/script/VqOqF6mX/',
    marca: { logo: 'media/elb-logo.png', ancho: 494, alto: 720, sufijo: 'Sterling Edge NY - NZDUSD' },
    completo: 'Indicador para TradingView · por ahora solo para NZDUSD',
    descripcion: 'Cuando se forma la señal, traza tres líneas en tu gráfico: la entrada, el stop loss y el take profit a tres veces el riesgo. En la esquina lleva la cuenta del mes: trades, TP, SL, winrate, R neto y beneficio.',
    estado: 'Gratis hasta el 31/12',
    ficha: [
      ['Mercado', 'NZDUSD (por ahora)'],
      ['Sesión', 'Nueva York'],
      ['Gestión', 'SL y TP 1:3 trazados en cada señal'],
      ['Panel', 'Resultados del mes en vivo'],
      ['Acceso', 'TradingView, solo por invitación'],
    ],
    grafico: { par: 'NZDUSD', nombrePar: 'Dólar neozelandés/Dólar estadounidense', broker: 'OANDA', minutos: 7 },
    periodo: { corto: 'Ene – Oct 2026', largo: 'de enero a octubre de 2026', todos: 'Los 10 meses (ene – oct)' },
    riesgoUsd: 100,
    ratios: {
      3: {
        titulo: '10 meses: 90 trades, +50R',
        intro: 'Backtest en el replay de TradingView en NZDUSD de OANDA a 7 minutos, de enero a octubre de 2026. Ganó 35 y perdió 55: acertó el 38.9 % y aun así sumó +50R, porque cada TP paga tres veces lo que cuesta un SL. Ocho de diez meses cerraron en positivo; marzo (−3R) y mayo (−5R) fueron los negativos.',
        notaTotal: 'Ocho de diez meses cerraron en positivo. El winrate total es 38.9 %: se pierden 6 de cada 10 operaciones y la cuenta igual crece +50R.',
        meses: [
          { mes: 'Enero 2026', tp: 2, sl: 4, orden: null, nota: 'Enero: 2 TP y 4 SL, 33.3 % de acierto, y aun así +2R.' },
          { mes: 'Febrero 2026', tp: 6, sl: 6, orden: null, nota: 'Febrero: mitad y mitad, 6 TP y 6 SL. Con 50 % de acierto y ratio 1:3 el mes cerró en +12R.' },
          { mes: 'Marzo 2026', tp: 2, sl: 9, orden: null, nota: 'Marzo cerró en −3R: 2 TP en 11 operaciones (18.2 % de acierto). Aun en un mes así la pérdida queda acotada.' },
          { mes: 'Abril 2026', tp: 6, sl: 7, orden: null, nota: 'Abril: 6 TP y 7 SL, 46.2 % de acierto y +11R.' },
          { mes: 'Mayo 2026', tp: 1, sl: 8, orden: null, nota: 'Mayo fue el peor mes: 1 TP en 9 operaciones (11 % de acierto) y −5R. Así se ve un mes malo con ratio 1:3: la pérdida queda acotada.' },
          { mes: 'Junio 2026', tp: 3, sl: 4, orden: null, nota: 'Junio: ganó 3 de 7 operaciones (42.9 %) y aun así cerró en +5R.' },
          { mes: 'Julio 2026', tp: 3, sl: 7, orden: null, nota: 'Julio fue el mes más difícil: 7 SL en 10 operaciones, 30 % de acierto. Con ratio 1:3 terminó en +2R.' },
          { mes: 'Agosto 2026', tp: 4, sl: 5, orden: null, nota: 'Agosto: más SL que TP (5 contra 4) y +7R al cierre.' },
          { mes: 'Septiembre 2026', tp: 5, sl: 3, orden: [0, 1, 0, 1, 1, 1, 1, 0], nota: 'Septiembre arrancó con SL, TP, SL (33 % de acierto) y luego llegaron 4 TP seguidos: +12R. Replay en NZDUSD de 7 minutos.' },
          { mes: 'Octubre 2026', tp: 3, sl: 2, orden: [1, 1, 0, 0, 1], nota: 'Octubre, primeros días: dos TP, dos SL y un TP final para +7R. Replay en NZDUSD de 7 minutos.' },
        ],
      },
      2: {
        titulo: 'Con TP a 1:2: 90 trades, +39R',
        intro: 'Las mismas señales en NZDUSD de OANDA a 7 minutos, de enero a octubre de 2026, con el TP a dos veces el riesgo. Ganó 43 y perdió 47: acertó el 47.8 % y sumó +39R. Ocho meses cerraron en positivo, enero quedó en 0R y marzo (−5R) fue el único negativo.',
        notaTotal: 'Con TP a 1:2: 43 TP y 47 SL, 47.8 % de acierto y +39R. Solo marzo cerró en negativo; enero quedó en 0R.',
        meses: [
          { mes: 'Enero 2026', tp: 2, sl: 4, orden: null, nota: 'Enero con TP a 1:2: 2 TP y 4 SL, 33.3 % de acierto. Cerró en 0R: lo ganado cubrió justo lo perdido.' },
          { mes: 'Febrero 2026', tp: 7, sl: 5, orden: null, nota: 'Febrero con 1:2: 7 TP y 5 SL (58.3 % de acierto) y +9R.' },
          { mes: 'Marzo 2026', tp: 2, sl: 9, orden: null, nota: 'Marzo fue el único mes negativo con 1:2: 2 TP en 11 operaciones y −5R.' },
          { mes: 'Abril 2026', tp: 6, sl: 7, orden: null, nota: 'Abril con 1:2: 6 TP y 7 SL, 46.2 % de acierto y +5R.' },
          { mes: 'Mayo 2026', tp: 4, sl: 5, orden: null, nota: 'Mayo con 1:2: 4 TP y 5 SL y +3R. Con 1:3 había cerrado en −5R: 3 operaciones llegaron a 2R pero no a 3R.' },
          { mes: 'Junio 2026', tp: 4, sl: 3, orden: null, nota: 'Junio con 1:2: 4 TP y 3 SL (57.1 % de acierto) y +5R.' },
          { mes: 'Julio 2026', tp: 4, sl: 6, orden: null, nota: 'Julio con 1:2: 4 TP y 6 SL, 40 % de acierto y +2R.' },
          { mes: 'Agosto 2026', tp: 6, sl: 3, orden: null, nota: 'Agosto con 1:2: 6 TP y 3 SL (66.7 % de acierto) y +9R, su mejor mes junto con febrero.' },
          { mes: 'Septiembre 2026', tp: 5, sl: 3, orden: null, nota: 'Septiembre con 1:2: 5 TP y 3 SL y +7R. Replay en NZDUSD de 7 minutos.' },
          { mes: 'Octubre 2026', tp: 3, sl: 2, orden: null, nota: 'Octubre con 1:2: 3 TP y 2 SL y +4R. Replay en NZDUSD de 7 minutos.' },
        ],
      },
    },
    // conclusiones de la comparación (admiten <b>)
    comparacion: [
      '<b>Con 1:2 se cierran más TP:</b> 43 contra 35 (47.8 % de acierto contra 38.9 %).',
      '<b>Con 1:3 el total es mayor:</b> +50R contra +39R, porque cada TP paga 3R en lugar de 2R.',
      '<b>Con 1:2 hubo un solo mes negativo</b> (marzo, −5R); con 1:3 fueron dos (marzo −3R y mayo −5R).',
    ],
    reels: [
      { video: 'media/reel-septiembre.mp4', portada: 'media/reel-septiembre.jpg', titulo: 'Septiembre: tranquilisimamente', texto: 'De 33 % de acierto a 4 TP seguidos y +$1,200.' },
      { video: 'media/reel-historia.mp4', portada: 'media/reel-historia.jpg', titulo: 'Perdí 2 de 5 y gané +$700', texto: 'Los 5 trades de octubre, uno por uno, con la tabla actualizándose.' },
      { video: 'media/reel-tp-o-sl.mp4', portada: 'media/reel-tp-o-sl.jpg', titulo: '¿TP o SL?', texto: 'Sale la señal, cuenta atrás y el resultado.' },
      { video: 'media/reel-lineas.mp4', portada: 'media/reel-lineas.jpg', titulo: 'Deja de dibujar líneas', texto: 'Entrada, SL y TP 1:3 aparecen solos al formarse la señal.' },
    ],
  },
];
