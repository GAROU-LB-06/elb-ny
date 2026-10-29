# ELB · Indicadores para TradingView

Sitio de los indicadores ELB. Publicado con GitHub Pages desde la rama `main`.

## Estructura

| Archivo | Qué es |
|---|---|
| `index.html` | Inicio: portada, catálogo de indicadores, cómo funciona, ratio 1:3, acceso, redes y preguntas frecuentes |
| `indicador.html` | La página de cada indicador (`indicador.html?id=...`): resultados mes a mes, 1:3 contra 1:2, simulador de cuenta y reels |
| `assets/datos.js` | **Los datos:** tus indicadores, tus redes y la fecha del acceso gratis |
| `assets/elb.css` | Estilos compartidos |
| `assets/comun.js` | Menú, reloj de la sesión de Nueva York, cuenta regresiva, redes y las tarjetas del catálogo |
| `assets/inicio.js` | Lo propio del inicio: catálogo, demo de la señal, calculadora y mensaje de acceso |
| `assets/indicador.js` | Arma la página de un indicador a partir de sus datos |
| `assets/movimiento.js` | Animaciones compartidas |
| `media/` | Logo, íconos, imagen para compartir y reels |

## Agregar un indicador

1. Abre `assets/datos.js`.
2. Copia el bloque de `ELB Sterling Edge NY - NZDUSD` dentro de `INDICADORES` y pégalo debajo.
3. Cambia el `id` (sin espacios, por ejemplo `elb-london-gbpusd`) y pon sus datos: nombre, gráfico (par, broker, temporalidad), periodo y los TP y SL de cada mes.
4. Sube el cambio a `main`.

El inicio suma una tarjeta en el catálogo y el indicador tiene su página en `indicador.html?id=<su id>`. No hay que tocar ningún otro archivo.

---

Los resultados mostrados provienen de un backtest en el modo replay de TradingView y no garantizan resultados futuros. Nada en este sitio es consejo financiero.
