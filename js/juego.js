/* Rescate Animal — lógica del juego */
(() => {
  "use strict";

  const N = 8;                 // tamaño del tablero
  const VIDAS = 5;
  const BAJA_POR_LINEA = 1.25; // filas de agua que baja cada línea completada
  const AGUA_INICIAL = 1;
  const AGUA_TRAS_VIDA = 3;
  const CLAVE = "rescate-animal-v1";

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  const ACC_POR_ID = Object.fromEntries(ACCESORIOS.map((a) => [a.id, a]));
  const ANIMAL_POR_ID = {};
  MUNDOS.forEach((m, w) => m.animales.forEach((a, i) => (ANIMAL_POR_ID[a.id] = { ...a, w, i, mundo: m })));
  const MANIQUI = { id: "_maniqui", nombre: "Osito de prueba", emoji: "🧸", img: "" };

  const FORMAS_LISTAS = FORMAS.map(([txt, peso]) => {
    const filas = txt.split("|");
    const celdas = [];
    filas.forEach((f, r) => [...f].forEach((ch, c) => ch === "X" && celdas.push([r, c])));
    return { celdas, h: filas.length, w: Math.max(...filas.map((f) => f.length)), peso };
  });
  const PESO_TOTAL = FORMAS_LISTAS.reduce((s, f) => s + f.peso, 0);

  /* ---------- Guardado ---------- */
  const PREDETERMINADO = { monedas: 0, progreso: {}, rescatados: [], comprados: [], atuendos: {}, sonido: true, tutorial: false, probador: null };
  let estado = cargar();

  function cargar() {
    try {
      const datos = JSON.parse(localStorage.getItem(CLAVE));
      if (datos && typeof datos === "object") return { ...structuredClone(PREDETERMINADO), ...datos };
    } catch (e) { /* sin guardado disponible */ }
    return structuredClone(PREDETERMINADO);
  }
  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) { /* ignorar */ }
  }

  /* ---------- Sonido ---------- */
  let audio = null;
  function tono(f, t0, dur, tipo = "sine", vol = 0.12) {
    const o = audio.createOscillator();
    const g = audio.createGain();
    o.type = tipo;
    o.frequency.value = f;
    const t = audio.currentTime + t0;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(audio.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
  function sonido(tipo, extra = 1) {
    if (!estado.sonido) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === "suspended") audio.resume();
      switch (tipo) {
        case "tomar": tono(520, 0, 0.08, "triangle", 0.07); break;
        case "poner": tono(330, 0, 0.1, "triangle"); tono(440, 0.05, 0.1, "triangle", 0.08); break;
        case "linea": [523, 659, 784, 1047].slice(0, 2 + Math.min(extra, 2)).forEach((f, k) => tono(f, k * 0.07, 0.18, "sine", 0.14)); break;
        case "vida": [392, 330, 262].forEach((f, k) => tono(f, k * 0.12, 0.2, "sawtooth", 0.06)); break;
        case "ganar": [523, 659, 784, 1047, 784, 1047].forEach((f, k) => tono(f, k * 0.11, 0.25, "triangle", 0.13)); break;
        case "comprar": tono(880, 0, 0.1, "sine"); tono(1320, 0.08, 0.15, "sine"); break;
        case "error": tono(180, 0, 0.18, "square", 0.05); break;
      }
    } catch (e) { /* sin audio */ }
  }
  function vibrar(p) { try { navigator.vibrate && navigator.vibrate(p); } catch (e) { /* nada */ } }

  /* ---------- Utilidades ---------- */
  const clave = (w, i) => `${w}-${i}`;
  const estaRescatado = (id) => estado.rescatados.includes(id);
  const mundoDesbloqueado = (w) => w === 0 || !!estado.progreso[clave(w - 1, MUNDOS[w - 1].animales.length - 1)];
  const nivelDesbloqueado = (w, i) => mundoDesbloqueado(w) && (i === 0 || !!estado.progreso[clave(w, i - 1)]);
  const estrellasTxt = (n) => "⭐".repeat(n) + "☆".repeat(3 - n);

  function visual(obj) {
    return obj.img ? `<img src="${obj.img}" alt="${obj.nombre}" draggable="false">` : obj.emoji;
  }

  /* Dibuja un animal con su ropa. */
  function figura(animal, atuendo = {}, clases = "") {
    const capas = CATEGORIAS.map((cat) => {
      const acc = ACC_POR_ID[atuendo[cat.id]];
      if (!acc) return "";
      const v = visual(acc);
      if (cat.id === "zapatos") return `<span class="acc acc-zapatos"><span>${v}</span><span>${v}</span></span>`;
      return `<span class="acc acc-${cat.id}">${v}</span>`;
    }).join("");
    return `<div class="figura ${clases}"><span class="figura-cuerpo">${visual(animal)}</span>${capas}</div>`;
  }

  function actualizarMonedas() {
    $$(".monedas-valor").forEach((el) => (el.textContent = estado.monedas));
  }

  function aplicarTema(el, mundo) {
    const t = mundo.tema;
    el.style.setProperty("--fondo1", t.fondo1);
    el.style.setProperty("--fondo2", t.fondo2);
    el.style.setProperty("--tablero", t.tablero);
    el.style.setProperty("--celda", t.celda);
    el.style.setProperty("--acento", t.acento);
  }

  /* ---------- Navegación ---------- */
  let mundoActual = 0;
  function ir(nombre) {
    $$(".pantalla").forEach((p) => p.classList.remove("activa"));
    $(`#pantalla-${nombre}`).classList.add("activa");
    if (nombre === "mundos") dibujarMundos();
    if (nombre === "niveles") dibujarNiveles();
    if (nombre === "santuario") dibujarSantuario();
    if (nombre === "tienda") dibujarTienda();
    actualizarMonedas();
    window.scrollTo(0, 0);
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-ir]");
    if (b) { cerrarModal(); ir(b.dataset.ir); }
  });

  /* ---------- Modal ---------- */
  function abrirModal(html, clase = "") {
    const caja = $("#modal-caja");
    caja.className = "modal " + clase;
    caja.innerHTML = html;
    $("#modal").classList.add("visible");
  }
  function cerrarModal() { $("#modal").classList.remove("visible"); }
  $("#modal").addEventListener("click", (e) => {
    if (e.target.id === "modal" && !$("#modal-caja").classList.contains("fijo")) cerrarModal();
  });

  /* ---------- Inicio ---------- */
  function dibujarBotonSonido() { $(".btn-sonido").textContent = estado.sonido ? "🔊" : "🔇"; }
  $(".btn-sonido").addEventListener("click", () => {
    estado.sonido = !estado.sonido;
    guardar();
    dibujarBotonSonido();
    sonido("poner");
  });

  function comoJugar(alCerrar) {
    abrirModal(`
      <h3>¿Cómo se juega?</h3>
      <ol class="pasos">
        <li><span>🧩</span> Arrastra las piezas de abajo al tablero.</li>
        <li><span>✨</span> Llena una fila o columna completa para borrarla.</li>
        <li><span>💧</span> El agua sube con cada pieza que pones. ¡Cada línea que borras la hace bajar!</li>
        <li><span>❤️</span> Si el agua llega arriba, pierdes una vida. Tienes 5.</li>
        <li><span>🐾</span> Completa las filas que pide el nivel para rescatar al animal.</li>
        <li><span>🪙</span> Gana monedas y compra ropa para vestir a tus animales en el Santuario.</li>
      </ol>
      <button class="btn btn-principal" id="btn-entendido">¡Entendido!</button>`);
    $("#btn-entendido").onclick = () => { cerrarModal(); alCerrar && alCerrar(); };
  }
  $("#btn-como-jugar").addEventListener("click", () => comoJugar());

  /* ---------- Mundos ---------- */
  function dibujarMundos() {
    $("#lista-mundos").innerHTML = MUNDOS.map((m, w) => {
      const abierto = mundoDesbloqueado(w);
      const hechos = m.animales.filter((a) => estaRescatado(a.id)).length;
      const t = m.tema;
      return `
        <button class="tarjeta-mundo ${abierto ? "" : "bloqueado"}" data-mundo="${w}"
          style="--fondo1:${t.fondo1};--fondo2:${t.fondo2};--acento:${t.acento}">
          <div class="mundo-icono">${m.icono}</div>
          <div class="mundo-info">
            <div class="mundo-nombre">${m.nombre}</div>
            <div class="mundo-animales">${m.animales.map((a) => `<span class="${estaRescatado(a.id) ? "" : "silueta"}">${visual(a)}</span>`).join("")}</div>
            <div class="mundo-progreso">${abierto ? `${hechos} / ${m.animales.length} rescatados` : `🔒 Termina ${MUNDOS[w - 1].nombre} para abrir`}</div>
          </div>
        </button>`;
    }).join("");
  }
  $("#lista-mundos").addEventListener("click", (e) => {
    const t = e.target.closest(".tarjeta-mundo");
    if (!t) return;
    const w = +t.dataset.mundo;
    if (!mundoDesbloqueado(w)) { sonido("error"); t.classList.add("sacudir"); setTimeout(() => t.classList.remove("sacudir"), 400); return; }
    mundoActual = w;
    ir("niveles");
  });

  /* ---------- Niveles ---------- */
  function dibujarNiveles() {
    const m = MUNDOS[mundoActual];
    aplicarTema($("#pantalla-niveles"), m);
    $("#titulo-mundo").textContent = `${m.icono} ${m.nombre}`;
    $("#descripcion-mundo").textContent = m.descripcion;
    $("#lista-niveles").innerHTML = m.animales.map((a, i) => {
      const abierto = nivelDesbloqueado(mundoActual, i);
      const est = estado.progreso[clave(mundoActual, i)] || 0;
      return `
        <button class="tarjeta-nivel ${abierto ? "" : "bloqueado"}" data-nivel="${i}">
          <div class="nivel-num">Nivel ${i + 1}</div>
          ${figura(a, estado.atuendos[a.id], estaRescatado(a.id) ? "" : "silueta")}
          <div class="nivel-nombre">${estaRescatado(a.id) ? a.nombre : "¿Quién será?"}</div>
          <div class="nivel-estrellas">${abierto ? estrellasTxt(est) : "🔒"}</div>
        </button>`;
    }).join("");
  }
  $("#lista-niveles").addEventListener("click", (e) => {
    const t = e.target.closest(".tarjeta-nivel");
    if (!t) return;
    const i = +t.dataset.nivel;
    if (!nivelDesbloqueado(mundoActual, i)) { sonido("error"); return; }
    iniciarNivel(mundoActual, i);
  });

  /* ---------- Juego ---------- */
  const tableroEl = $("#tablero");
  const bandejaEl = $("#bandeja");
  const celdasEl = [];
  for (let k = 0; k < N * N; k++) {
    const d = document.createElement("div");
    d.className = "celda";
    tableroEl.appendChild(d);
    celdasEl.push(d);
  }

  let g = null;

  function configNivel(w, i) {
    const n = w * 4 + i; // 0..19
    return { meta: 6 + Math.round(n * 0.55), ritmo: +(0.22 + n * 0.011).toFixed(3) };
  }

  function iniciarNivel(w, i) {
    const mundo = MUNDOS[w];
    const animal = mundo.animales[i];
    const cfg = configNivel(w, i);
    g = {
      w, i, mundo, animal,
      tablero: Array(N * N).fill(null),
      piezas: [null, null, null],
      filas: 0, meta: cfg.meta, ritmo: cfg.ritmo,
      agua: AGUA_INICIAL, vidas: VIDAS, perdidas: 0,
      monedasFilas: 0, ocupado: false, terminado: false
    };
    aplicarTema($("#pantalla-juego"), mundo);
    $("#juego-titulo").textContent = `${mundo.icono} ${mundo.nombre} · Nivel ${i + 1}`;
    $("#meta-total").textContent = g.meta;
    $("#jaula").classList.remove("libre");
    $("#jaula-animal").innerHTML = figura(animal, estado.atuendos[animal.id]);
    repartir();
    ir("juego");
    dibujarJuego();
    if (!estado.tutorial) {
      estado.tutorial = true;
      guardar();
      setTimeout(() => comoJugar(), 300);
    }
  }

  function crearPieza() {
    let r = Math.random() * PESO_TOTAL;
    let forma = FORMAS_LISTAS[0];
    for (const f of FORMAS_LISTAS) { r -= f.peso; if (r <= 0) { forma = f; break; } }
    const colores = g.mundo.colores;
    return { ...forma, color: colores[Math.floor(Math.random() * colores.length)] };
  }

  function cabe(p, r, c, tablero = g.tablero) {
    if (r < 0 || c < 0 || r + p.h > N || c + p.w > N) return false;
    return p.celdas.every(([dr, dc]) => !tablero[(r + dr) * N + c + dc]);
  }
  function tieneLugar(p) {
    for (let r = 0; r <= N - p.h; r++) for (let c = 0; c <= N - p.w; c++) if (cabe(p, r, c)) return true;
    return false;
  }
  const algunaJugada = () => g.piezas.some((p) => p && tieneLugar(p));

  function repartir() {
    // Intentamos que al menos una pieza quepa para no frustrar al jugador.
    let piezas;
    for (let intento = 0; intento < 30; intento++) {
      piezas = [crearPieza(), crearPieza(), crearPieza()];
      if (piezas.some(tieneLugar)) break;
    }
    g.piezas = piezas;
  }

  function lineasCompletas(tablero) {
    const filas = [], cols = [];
    for (let r = 0; r < N; r++) {
      let llena = true;
      for (let c = 0; c < N; c++) if (!tablero[r * N + c]) { llena = false; break; }
      if (llena) filas.push(r);
    }
    for (let c = 0; c < N; c++) {
      let llena = true;
      for (let r = 0; r < N; r++) if (!tablero[r * N + c]) { llena = false; break; }
      if (llena) cols.push(c);
    }
    const celdas = new Set();
    filas.forEach((r) => { for (let c = 0; c < N; c++) celdas.add(r * N + c); });
    cols.forEach((c) => { for (let r = 0; r < N; r++) celdas.add(r * N + c); });
    return { total: filas.length + cols.length, celdas };
  }

  function piezaHTML(p) {
    let html = `<div class="pieza" style="grid-template-columns:repeat(${p.w},var(--tam));grid-template-rows:repeat(${p.h},var(--tam))">`;
    const set = new Set(p.celdas.map(([r, c]) => r * 10 + c));
    for (let r = 0; r < p.h; r++)
      for (let c = 0; c < p.w; c++)
        html += set.has(r * 10 + c) ? `<div class="bloque" style="--c:${p.color}"></div>` : `<div></div>`;
    return html + "</div>";
  }

  function dibujarTablero(nuevas = []) {
    g.tablero.forEach((color, k) => {
      const el = celdasEl[k];
      el.className = "celda" + (color ? " llena" : "");
      el.style.setProperty("--c", color || "transparent");
    });
    nuevas.forEach((k) => celdasEl[k].classList.add("aparece"));
  }

  function dibujarJuego(nuevas) {
    dibujarTablero(nuevas);
    const nivel = Math.min(g.agua, N);
    const agua = $("#agua");
    agua.style.height = (nivel / N) * 100 + "%";
    agua.classList.toggle("peligro", nivel >= N - 2);
    $("#vidas").innerHTML = "❤️".repeat(g.vidas) + `<span class="vida-perdida">${"🤍".repeat(VIDAS - g.vidas)}</span>`;
    $("#meta-filas").textContent = Math.min(g.filas, g.meta);
    $("#meta-relleno").style.width = Math.min(100, (g.filas / g.meta) * 100) + "%";
    const globo = $("#globo");
    const miedo = nivel >= N - 3;
    globo.classList.toggle("visible", miedo && !g.terminado);
    if (miedo) globo.textContent = nivel >= N - 1.5 ? "¡Me mojo! 😱" : "¡Ayuda! 💦";
    $("#jaula").classList.toggle("asustado", miedo && !g.terminado);
    const restantes = Math.max(0, Math.ceil((N - g.agua) / g.ritmo));
    $("#agua-texto").textContent = `💧 El agua llega arriba en ${restantes} pieza${restantes === 1 ? "" : "s"}`;
    $$(".ranura").forEach((r, k) => {
      const p = g.piezas[k];
      r.classList.remove("levantada");
      r.innerHTML = p ? piezaHTML(p) : "";
      r.classList.toggle("sin-lugar", !!p && !tieneLugar(p));
    });
  }

  function aviso(texto, clase = "") {
    const el = $("#aviso");
    el.className = "aviso";
    void el.offsetWidth;
    el.textContent = texto;
    el.className = "aviso mostrar " + clase;
  }

  /* --- Arrastrar piezas --- */
  let arrastre = null;

  bandejaEl.addEventListener("pointerdown", (e) => {
    const ranura = e.target.closest(".ranura");
    if (!ranura || !g || g.ocupado || g.terminado || arrastre) return;
    const i = +ranura.dataset.i;
    const p = g.piezas[i];
    if (!p) return;
    e.preventDefault();
    const tam = tableroEl.getBoundingClientRect().width / N;
    const el = document.createElement("div");
    el.className = "flotante";
    el.style.setProperty("--tam", tam + "px");
    el.innerHTML = piezaHTML(p);
    document.body.appendChild(el);
    const tactil = e.pointerType !== "mouse";
    arrastre = {
      i, p, el, tam, ranura, id: e.pointerId, pos: null,
      // En pantalla táctil la pieza se dibuja arriba del dedo para poder verla.
      dy: tactil ? p.h * tam + tam * 1.1 : (p.h * tam) / 2
    };
    ranura.classList.add("levantada");
    sonido("tomar");
    moverArrastre(e);
  });

  window.addEventListener("pointermove", (e) => {
    if (arrastre && e.pointerId === arrastre.id) { e.preventDefault(); moverArrastre(e); }
  }, { passive: false });
  window.addEventListener("pointerup", (e) => { if (arrastre && e.pointerId === arrastre.id) soltar(); });
  window.addEventListener("pointercancel", (e) => { if (arrastre && e.pointerId === arrastre.id) soltar(true); });
  document.addEventListener("touchmove", (e) => { if (arrastre) e.preventDefault(); }, { passive: false });

  function moverArrastre(e) {
    const { p, el, tam } = arrastre;
    const x = e.clientX - (p.w * tam) / 2;
    const y = e.clientY - arrastre.dy;
    el.style.left = x + "px";
    el.style.top = y + "px";
    const rect = tableroEl.getBoundingClientRect();
    const c = Math.round((x - rect.left) / tam);
    const r = Math.round((y - rect.top) / tam);
    const pos = cabe(p, r, c) ? { r, c } : null;
    const igual = pos && arrastre.pos && pos.r === arrastre.pos.r && pos.c === arrastre.pos.c;
    if (!igual) { arrastre.pos = pos; dibujarSombra(); }
  }

  function limpiarSombra() {
    celdasEl.forEach((el) => {
      el.classList.remove("sombra", "por-borrar");
      if (!el.classList.contains("llena")) el.style.setProperty("--c", "transparent");
    });
  }

  function dibujarSombra() {
    limpiarSombra();
    const { p, pos } = arrastre;
    if (!pos) return;
    const temp = g.tablero.slice();
    p.celdas.forEach(([dr, dc]) => {
      const k = (pos.r + dr) * N + pos.c + dc;
      temp[k] = p.color;
      celdasEl[k].classList.add("sombra");
      celdasEl[k].style.setProperty("--c", p.color);
    });
    lineasCompletas(temp).celdas.forEach((k) => celdasEl[k].classList.add("por-borrar"));
  }

  function soltar(cancelado = false) {
    const { i, pos, el } = arrastre;
    el.remove();
    arrastre = null;
    limpiarSombra();
    if (!cancelado && pos) colocar(i, pos.r, pos.c);
    else $$(".ranura")[i].classList.remove("levantada");
  }

  function colocar(i, r, c) {
    const p = g.piezas[i];
    const nuevas = p.celdas.map(([dr, dc]) => (r + dr) * N + c + dc);
    nuevas.forEach((k) => (g.tablero[k] = p.color));
    g.piezas[i] = null;
    sonido("poner");
    vibrar(8);

    const { total, celdas } = lineasCompletas(g.tablero);
    dibujarJuego(nuevas);
    if (!total) return despuesDeTurno();

    g.ocupado = true;
    celdas.forEach((k) => celdasEl[k].classList.add("borrando"));
    sonido("linea", total);
    vibrar(total > 1 ? [20, 30, 20] : 25);
    setTimeout(() => {
      celdas.forEach((k) => (g.tablero[k] = null));
      g.filas += total;
      g.monedasFilas += total;
      g.agua = Math.max(0, g.agua - total * BAJA_POR_LINEA - (total - 1) * 0.5);
      if (total > 1) aviso(`¡Combo x${total}! 💦⬇️`, "combo");
      else aviso("¡El agua baja! 💦⬇️");
      g.ocupado = false;
      despuesDeTurno(true);
    }, 330);
  }

  function despuesDeTurno(huboLineas = false) {
    if (g.filas >= g.meta) { dibujarJuego(); return ganar(); }

    g.agua += g.ritmo;
    if (g.agua >= N) {
      if (!quitarVida("¡El agua llegó arriba!")) return;
      g.agua = AGUA_TRAS_VIDA;
    }
    if (g.piezas.every((p) => !p)) repartir();
    if (!algunaJugada()) {
      if (!quitarVida("¡No hay espacio!")) return;
      g.tablero.fill(null);
      repartir();
    }
    dibujarJuego();
  }

  /* Devuelve true si todavía quedan vidas. */
  function quitarVida(motivo) {
    g.vidas--;
    g.perdidas++;
    sonido("vida");
    vibrar([60, 40, 60]);
    const marco = $(".tablero-marco");
    marco.classList.remove("sacudir");
    void marco.offsetWidth;
    marco.classList.add("sacudir");
    if (g.vidas <= 0) {
      g.terminado = true;
      g.agua = N;
      dibujarJuego();
      setTimeout(derrota, 700);
      return false;
    }
    aviso(`${motivo}  −1 ❤️`, "malo");
    return true;
  }

  function ganar() {
    g.terminado = true;
    const { w, i, animal } = g;
    const k = clave(w, i);
    const estrellas = g.perdidas === 0 ? 3 : g.perdidas <= 2 ? 2 : 1;
    const primeraVez = !estado.progreso[k];
    const premio = (primeraVez ? 20 + estrellas * 10 : 5 + estrellas * 3) + g.monedasFilas;
    estado.monedas += premio;
    estado.progreso[k] = Math.max(estado.progreso[k] || 0, estrellas);
    const nuevo = !estaRescatado(animal.id);
    if (nuevo) estado.rescatados.push(animal.id);
    guardar();
    actualizarMonedas();

    g.agua = 0;
    dibujarJuego();
    $("#jaula").classList.add("libre");
    sonido("ganar");
    vibrar([30, 50, 30, 50, 80]);
    confeti();

    const hayOtro = i + 1 < MUNDOS[w].animales.length || w + 1 < MUNDOS.length;
    setTimeout(() => {
      abrirModal(`
        <div class="rescate-titulo">¡Rescataste ${articulo(animal)}!</div>
        ${figura(animal, estado.atuendos[animal.id], "grande salta")}
        <div class="rescate-nombre">${animal.nombre}</div>
        <div class="rescate-estrellas">${estrellasTxt(estrellas)}</div>
        <div class="dato"><b>💡 ¿Sabías que…?</b><p>${animal.dato}</p></div>
        <div class="premio">+${premio} 🪙 ${nuevo ? "· ¡Nuevo en tu Santuario! 🏡" : ""}</div>
        <div class="botones-modal">
          ${hayOtro ? `<button class="btn btn-principal" id="btn-siguiente">Siguiente nivel ▶</button>` : ""}
          <div class="fila-botones">
            <button class="btn btn-secundario" data-ir="santuario">🏡 Santuario</button>
            <button class="btn btn-secundario" id="btn-mapa">🗺️ Mapa</button>
          </div>
        </div>`, "fijo rescate");
      const sig = $("#btn-siguiente");
      if (sig) sig.onclick = () => {
        cerrarModal();
        if (i + 1 < MUNDOS[w].animales.length) iniciarNivel(w, i + 1);
        else { mundoActual = w + 1; ir("niveles"); }
      };
      $("#btn-mapa").onclick = () => { cerrarModal(); mundoActual = w; ir("niveles"); };
    }, 1100);
  }

  function articulo(a) {
    const n = a.nombre[0].toLowerCase() + a.nombre.slice(1);
    const femenino = /^(jirafa|cebra|foca|ballena|rana|carpa|nutria|águila)/.test(n);
    // "águila" usa "el" aunque sea femenino.
    if (n.startsWith("águila")) return "al " + n;
    return (femenino ? "a la " : "al ") + n;
  }

  function derrota() {
    estado.monedas += g.monedasFilas;
    guardar();
    actualizarMonedas();
    abrirModal(`
      <div class="rescate-titulo">¡Oh, no! 💦</div>
      ${figura(g.animal, estado.atuendos[g.animal.id], "grande triste")}
      <p>El agua subió demasiado. ¡${g.animal.nombre} todavía te necesita!</p>
      ${g.monedasFilas ? `<div class="premio">+${g.monedasFilas} 🪙 por tus filas</div>` : ""}
      <div class="botones-modal">
        <button class="btn btn-principal" id="btn-reintentar">↻ Intentar otra vez</button>
        <button class="btn btn-secundario" id="btn-mapa">🗺️ Mapa</button>
      </div>`, "fijo");
    $("#btn-reintentar").onclick = () => { cerrarModal(); iniciarNivel(g.w, g.i); };
    $("#btn-mapa").onclick = () => { cerrarModal(); mundoActual = g.w; ir("niveles"); };
  }

  $("#btn-salir-juego").addEventListener("click", () => {
    if (!g || g.terminado) { ir("niveles"); return; }
    abrirModal(`
      <h3>¿Salir del nivel?</h3>
      <p>${g.animal.nombre} seguirá esperando tu ayuda.</p>
      <div class="botones-modal">
        <button class="btn btn-principal" id="btn-seguir">Seguir jugando</button>
        <button class="btn btn-secundario" id="btn-si-salir">Salir</button>
      </div>`);
    $("#btn-seguir").onclick = cerrarModal;
    $("#btn-si-salir").onclick = () => { cerrarModal(); mundoActual = g.w; g = null; ir("niveles"); };
  });

  function confeti() {
    const caja = $("#confeti");
    const cosas = ["🎉", "⭐", "💖", "✨", "🎊", "🐾"];
    let html = "";
    for (let k = 0; k < 36; k++) {
      const izq = Math.random() * 100;
      const ret = Math.random() * 0.6;
      const dur = 1.6 + Math.random() * 1.2;
      html += `<span style="left:${izq}%;animation-delay:${ret}s;animation-duration:${dur}s">${cosas[k % cosas.length]}</span>`;
    }
    caja.innerHTML = html;
    setTimeout(() => (caja.innerHTML = ""), 3200);
  }

  /* ---------- Santuario ---------- */
  function dibujarSantuario() {
    const total = Object.keys(ANIMAL_POR_ID).length;
    $("#santuario-cuenta").textContent = `Has rescatado ${estado.rescatados.length} de ${total} animales. Toca uno para verlo y vestirlo.`;
    $("#santuario").innerHTML = MUNDOS.map((m) => `
      <div class="santuario-mundo" style="--fondo1:${m.tema.fondo1};--fondo2:${m.tema.fondo2}">
        <h3>${m.icono} ${m.nombre}</h3>
        <div class="santuario-grid">
          ${m.animales.map((a) => {
            const si = estaRescatado(a.id);
            return `<button class="habitante ${si ? "" : "falta"}" data-animal="${a.id}">
              ${figura(a, si ? estado.atuendos[a.id] : {}, si ? "" : "silueta")}
              <span>${si ? a.nombre : "???"}</span>
            </button>`;
          }).join("")}
        </div>
      </div>`).join("");
  }
  $("#santuario").addEventListener("click", (e) => {
    const b = e.target.closest(".habitante");
    if (!b) return;
    if (!estaRescatado(b.dataset.animal)) {
      const a = ANIMAL_POR_ID[b.dataset.animal];
      abrirModal(`<h3>❓ Animal misterioso</h3><p>Rescátalo en ${a.mundo.icono} ${a.mundo.nombre} para conocerlo.</p>
        <button class="btn btn-principal" id="btn-ok">Ok</button>`);
      $("#btn-ok").onclick = cerrarModal;
      return;
    }
    fichaAnimal(b.dataset.animal);
  });

  function fichaAnimal(id) {
    const a = ANIMAL_POR_ID[id];
    const atuendo = estado.atuendos[id] || {};
    const tieneAlgo = estado.comprados.length > 0;
    const vestidor = tieneAlgo ? CATEGORIAS.map((cat) => {
      const mios = ACCESORIOS.filter((x) => x.cat === cat.id && estado.comprados.includes(x.id));
      if (!mios.length) return "";
      return `<div class="vestidor-fila">
        <div class="vestidor-cat">${cat.icono} ${cat.nombre}</div>
        <div class="vestidor-opciones">
          <button class="opcion ${!atuendo[cat.id] ? "elegida" : ""}" data-cat="${cat.id}" data-acc="">✖️</button>
          ${mios.map((x) => `<button class="opcion ${atuendo[cat.id] === x.id ? "elegida" : ""}" data-cat="${cat.id}" data-acc="${x.id}" aria-label="${x.nombre}">${visual(x)}</button>`).join("")}
        </div>
      </div>`;
    }).join("") : `<p class="nota">Aún no tienes accesorios. ¡Cómpralos en la Tienda con tus monedas!</p>
      <button class="btn btn-secundario" id="btn-a-tienda">🛍️ Ir a la Tienda</button>`;

    abrirModal(`
      ${figura(a, atuendo, "grande")}
      <div class="rescate-nombre">${a.nombre}</div>
      <div class="ficha-mundo">${a.mundo.icono} ${a.mundo.nombre}</div>
      <div class="dato"><b>💡 ¿Sabías que…?</b><p>${a.dato}</p></div>
      <div class="vestidor">${vestidor}</div>
      <button class="btn btn-principal" id="btn-cerrar-ficha">Listo</button>`, "ficha");

    $("#btn-cerrar-ficha").onclick = () => { cerrarModal(); dibujarSantuario(); };
    const tienda = $("#btn-a-tienda");
    if (tienda) tienda.onclick = () => { estado.probador = id; guardar(); cerrarModal(); ir("tienda"); };
    $$("#modal-caja .opcion").forEach((b) => (b.onclick = () => {
      const nuevo = { ...(estado.atuendos[id] || {}) };
      if (b.dataset.acc) nuevo[b.dataset.cat] = b.dataset.acc;
      else delete nuevo[b.dataset.cat];
      estado.atuendos[id] = nuevo;
      guardar();
      sonido("poner");
      fichaAnimal(id);
    }));
  }

  /* ---------- Tienda ---------- */
  let categoriaTienda = CATEGORIAS[0].id;
  let vistaPrevia = {}; // accesorios que se están probando sin comprar

  function animalProbador() {
    if (estado.probador && estaRescatado(estado.probador)) return ANIMAL_POR_ID[estado.probador];
    if (estado.rescatados.length) return ANIMAL_POR_ID[estado.rescatados[0]];
    return MANIQUI;
  }

  function dibujarProbador() {
    const a = animalProbador();
    const atuendo = { ...(estado.atuendos[a.id] || {}), ...vistaPrevia };
    $("#probador-figura").innerHTML = figura(a, atuendo, "mediana");
    $("#probador-nombre").textContent = a === MANIQUI ? "Rescata animales para vestirlos. ¡Mientras, prueba con el osito!" : `Probando en: ${a.nombre}`;
    $("#probador-elegir").innerHTML = estado.rescatados.map((id) => {
      const x = ANIMAL_POR_ID[id];
      return `<button class="mini-animal ${x.id === a.id ? "elegido" : ""}" data-animal="${x.id}">${visual(x)}</button>`;
    }).join("");
  }

  function dibujarTienda() {
    $("#pestanas").innerHTML = CATEGORIAS.map((c) =>
      `<button class="pestana ${c.id === categoriaTienda ? "activa" : ""}" data-cat="${c.id}">${c.icono}<span>${c.nombre}</span></button>`).join("");
    const a = animalProbador();
    const atuendo = estado.atuendos[a.id] || {};
    $("#articulos").innerHTML = ACCESORIOS.filter((x) => x.cat === categoriaTienda).map((x) => {
      const mio = estado.comprados.includes(x.id);
      const puesto = atuendo[x.cat] === x.id;
      const probando = vistaPrevia[x.cat] === x.id;
      let boton;
      if (!mio) boton = `<button class="btn-comprar ${estado.monedas < x.precio ? "caro" : ""}" data-comprar="${x.id}">🪙 ${x.precio}</button>`;
      else if (a === MANIQUI) boton = `<span class="ya-tuyo">✓ Tuyo</span>`;
      else boton = `<button class="btn-poner ${puesto ? "puesto" : ""}" data-poner="${x.id}">${puesto ? "Quitar" : "Poner"}</button>`;
      return `<div class="articulo ${probando ? "probando" : ""} ${mio ? "mio" : ""}" data-probar="${x.id}">
        <div class="articulo-icono">${visual(x)}</div>
        <div class="articulo-nombre">${x.nombre}</div>
        ${boton}
      </div>`;
    }).join("");
    dibujarProbador();
  }

  $("#pestanas").addEventListener("click", (e) => {
    const b = e.target.closest(".pestana");
    if (!b) return;
    categoriaTienda = b.dataset.cat;
    dibujarTienda();
  });
  $("#probador-elegir").addEventListener("click", (e) => {
    const b = e.target.closest(".mini-animal");
    if (!b) return;
    estado.probador = b.dataset.animal;
    vistaPrevia = {};
    guardar();
    dibujarTienda();
  });
  $("#articulos").addEventListener("click", (e) => {
    const comprar = e.target.closest("[data-comprar]");
    const poner = e.target.closest("[data-poner]");
    const tarjeta = e.target.closest("[data-probar]");
    const a = animalProbador();
    if (comprar) {
      const x = ACC_POR_ID[comprar.dataset.comprar];
      if (estado.monedas < x.precio) {
        sonido("error");
        vibrar(40);
        comprar.classList.add("sacudir");
        setTimeout(() => comprar.classList.remove("sacudir"), 400);
        mensajeRapido(`Te faltan ${x.precio - estado.monedas} 🪙. ¡Juega más niveles!`);
        return;
      }
      estado.monedas -= x.precio;
      estado.comprados.push(x.id);
      if (a !== MANIQUI) estado.atuendos[a.id] = { ...(estado.atuendos[a.id] || {}), [x.cat]: x.id };
      delete vistaPrevia[x.cat];
      guardar();
      sonido("comprar");
      vibrar(20);
      actualizarMonedas();
      mensajeRapido(`¡Compraste ${x.nombre}! ${a !== MANIQUI ? `Se lo pusiste a ${a.nombre}.` : ""}`);
      dibujarTienda();
      return;
    }
    if (poner) {
      const x = ACC_POR_ID[poner.dataset.poner];
      const nuevo = { ...(estado.atuendos[a.id] || {}) };
      if (nuevo[x.cat] === x.id) delete nuevo[x.cat]; else nuevo[x.cat] = x.id;
      estado.atuendos[a.id] = nuevo;
      delete vistaPrevia[x.cat];
      guardar();
      sonido("poner");
      dibujarTienda();
      return;
    }
    if (tarjeta) {
      const x = ACC_POR_ID[tarjeta.dataset.probar];
      if (vistaPrevia[x.cat] === x.id) delete vistaPrevia[x.cat]; else vistaPrevia[x.cat] = x.id;
      sonido("tomar");
      dibujarTienda();
    }
  });

  let temporizadorMensaje = null;
  function mensajeRapido(texto) {
    let el = $(".mensaje-rapido");
    if (!el) {
      el = document.createElement("div");
      el.className = "mensaje-rapido";
      document.body.appendChild(el);
    }
    el.textContent = texto;
    el.classList.add("visible");
    clearTimeout(temporizadorMensaje);
    temporizadorMensaje = setTimeout(() => el.classList.remove("visible"), 2200);
  }

  /* ---------- Arranque ---------- */
  dibujarBotonSonido();
  actualizarMonedas();
  document.addEventListener("contextmenu", (e) => e.preventDefault());
})();
