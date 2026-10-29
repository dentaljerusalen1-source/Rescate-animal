# 🐾 Rescate Animal

Rompecabezas de bloques para celular que se juega en el navegador.

## Cómo se juega
- Te dan **tres piezas**; arrástralas al tablero de **8×8**.
- Al completar una **fila o columna**, se borra.
- Un animalito está atrapado y **el agua sube con cada pieza** que pones. Cada línea que completas **baja el agua**.
- Si el agua llega arriba pierdes una vida. Tienes **5 vidas** por nivel.
- Completa las filas que pide el nivel para **rescatar al animal**: verás un dato curioso y se agrega a tu **Santuario**.
- Con las **monedas** compra sombreros, lentes, trajes y zapatos en la **Tienda** y viste a tus animales.

## Mundos
| Mundo | Animales |
|---|---|
| 🌍 África | León, Elefante, Jirafa, Cebra |
| 🧊 Antártida | Pingüino emperador, Foca de Weddell, Ballena jorobada, Calamar colosal |
| 🌳 Amazonas | Perezoso, Guacamayo, Jaguar, Rana dardo |
| 🎋 China | Panda gigante, Tigre del sur de China, Mono dorado, Carpa dorada |
| 🏔️ Alaska | Oso pardo, Lobo gris, Águila calva, Nutria marina |

## Poner tus propias ilustraciones
Por ahora los dibujos son emojis. Para cambiarlos:
1. Guarda la imagen (PNG con fondo transparente, cuadrada, unos 256×256 px) en `img/animales/` o `img/accesorios/`.
2. Abre `js/datos.js` y escribe la ruta en el campo `img` del animal o accesorio, por ejemplo:
   ```js
   { id: "leon", nombre: "León", emoji: "🦁", img: "img/animales/leon.png", ... }
   ```
Si `img` está vacío se usa el emoji. En `js/datos.js` también puedes cambiar los datos curiosos, los precios y los colores de cada mundo.

## Archivos
- `index.html` — pantallas del juego
- `css/estilos.css` — diseño
- `js/datos.js` — mundos, animales, accesorios y formas de piezas
- `js/juego.js` — lógica del juego

El progreso se guarda en el navegador del jugador. No necesita servidor: funciona directo en GitHub Pages.
