/*
 * Datos del juego: mundos, animales y accesorios.
 *
 * Para usar tus propias ilustraciones, pon la imagen en la carpeta img/
 * y escribe su ruta en el campo "img" del animal o accesorio, por ejemplo:
 *   img: "img/animales/leon.png"
 * Si "img" está vacío se usa el emoji.
 */

const MUNDOS = [
  {
    id: "africa",
    nombre: "África",
    icono: "🌍",
    descripcion: "La sabana se inundó con las lluvias. ¡Ayuda a los animales a ponerse a salvo!",
    tema: { fondo1: "#ffcf7a", fondo2: "#f08a3c", tablero: "#7a4a24", celda: "#9a6436", acento: "#e8630a" },
    colores: ["#ff9f1c", "#ffbf69", "#e76f51", "#f4a261", "#d62828", "#90be6d"],
    animales: [
      { id: "leon", nombre: "León", emoji: "🦁", img: "",
        dato: "El rugido de un león se puede escuchar ¡a 8 kilómetros de distancia!" },
      { id: "elefante", nombre: "Elefante", emoji: "🐘", img: "",
        dato: "La trompa del elefante tiene unos 40.000 músculos. La usa para oler, beber, abrazar ¡y saludar!" },
      { id: "jirafa", nombre: "Jirafa", emoji: "🦒", img: "",
        dato: "La lengua de la jirafa mide casi 50 cm y es de color oscuro, ¡como si fuera bloqueador solar!" },
      { id: "cebra", nombre: "Cebra", emoji: "🦓", img: "",
        dato: "No hay dos cebras con las mismas rayas: son como sus huellas digitales." }
    ]
  },
  {
    id: "antartida",
    nombre: "Antártida",
    icono: "🧊",
    descripcion: "El hielo se está derritiendo y el mar sube. ¡Rápido, al rescate!",
    tema: { fondo1: "#e3f6ff", fondo2: "#7cc4ef", tablero: "#2f6f9f", celda: "#4f8fbf", acento: "#1d6fb8" },
    colores: ["#4cc9f0", "#a0e7ff", "#4361ee", "#7b8cff", "#ffffff", "#b5179e"],
    animales: [
      { id: "pinguino", nombre: "Pingüino emperador", emoji: "🐧", img: "",
        dato: "El papá pingüino emperador cuida el huevo sobre sus patas unos dos meses, ¡sin comer nada!" },
      { id: "foca", nombre: "Foca de Weddell", emoji: "🦭", img: "",
        dato: "Puede aguantar la respiración bajo el agua ¡más de una hora!" },
      { id: "ballena", nombre: "Ballena jorobada", emoji: "🐋", img: "",
        dato: "Los machos cantan canciones que duran hasta 20 minutos y las repiten durante horas." },
      { id: "calamar", nombre: "Calamar colosal", emoji: "🦑", img: "",
        dato: "Tiene los ojos más grandes del reino animal: ¡casi del tamaño de un balón de fútbol!" }
    ]
  },
  {
    id: "amazonas",
    nombre: "Amazonas",
    icono: "🌳",
    descripcion: "El gran río se desbordó en la selva. ¡Los animales necesitan tu ayuda!",
    tema: { fondo1: "#c9f2b5", fondo2: "#3fa34d", tablero: "#1f5e2e", celda: "#2f7a40", acento: "#2b9348" },
    colores: ["#80ed99", "#ffd60a", "#ff5d8f", "#00b4d8", "#f77f00", "#c77dff"],
    animales: [
      { id: "perezoso", nombre: "Perezoso", emoji: "🦥", img: "",
        dato: "Es tan lento que en su pelaje crecen algas verdes, ¡que lo ayudan a esconderse en los árboles!" },
      { id: "guacamayo", nombre: "Guacamayo", emoji: "🦜", img: "",
        dato: "Los guacamayos pueden vivir más de 50 años y suelen tener la misma pareja toda la vida." },
      { id: "jaguar", nombre: "Jaguar", emoji: "🐆", img: "",
        dato: "A diferencia de muchos gatos, al jaguar le encanta el agua: ¡es un gran nadador!" },
      { id: "rana", nombre: "Rana dardo", emoji: "🐸", img: "",
        dato: "Sus colores brillantes son un aviso para otros animales: «¡Cuidado, soy venenosa!»" }
    ]
  },
  {
    id: "china",
    nombre: "China",
    icono: "🎋",
    descripcion: "Las lluvias llenaron el bosque de bambú. ¡Salva a sus habitantes!",
    tema: { fondo1: "#ffe1e1", fondo2: "#e5383b", tablero: "#7a1c1f", celda: "#9b2c2f", acento: "#c1121f" },
    colores: ["#ffd166", "#ef476f", "#06d6a0", "#ff9e00", "#f8f9fa", "#9d4edd"],
    animales: [
      { id: "panda", nombre: "Panda gigante", emoji: "🐼", img: "",
        dato: "Un panda puede pasar hasta 14 horas al día comiendo bambú." },
      { id: "tigre", nombre: "Tigre del sur de China", emoji: "🐅", img: "",
        dato: "Las rayas del tigre no solo están en su pelo: ¡su piel también es rayada!" },
      { id: "mono", nombre: "Mono dorado", emoji: "🐒", img: "",
        dato: "Vive en montañas nevadas y tiene la nariz chata; se cree que así no se le congela." },
      { id: "carpa", nombre: "Carpa dorada", emoji: "🐠", img: "",
        dato: "Una leyenda china cuenta que la carpa que logra saltar la Puerta del Dragón ¡se convierte en dragón!" }
    ]
  },
  {
    id: "alaska",
    nombre: "Alaska",
    icono: "🏔️",
    descripcion: "El deshielo de primavera hizo crecer los ríos. ¡Es hora del último gran rescate!",
    tema: { fondo1: "#dff3ea", fondo2: "#2a6f6a", tablero: "#173f3c", celda: "#245a55", acento: "#1b7f79" },
    colores: ["#52b788", "#ffb703", "#8ecae6", "#fb8500", "#e9edc9", "#e63946"],
    animales: [
      { id: "oso", nombre: "Oso pardo", emoji: "🐻", img: "",
        dato: "Antes del invierno come muchísimo salmón y bayas para dormir varios meses seguidos." },
      { id: "lobo", nombre: "Lobo gris", emoji: "🐺", img: "",
        dato: "Los lobos aúllan para hablar con su manada, ¡y su aullido se oye a más de 10 km!" },
      { id: "aguila", nombre: "Águila calva", emoji: "🦅", img: "",
        dato: "Su nido puede pesar más de una tonelada, porque lo agranda cada año." },
      { id: "nutria", nombre: "Nutria marina", emoji: "🦦", img: "",
        dato: "Las nutrias marinas se toman de las manos al dormir para que la corriente no las separe." }
    ]
  }
];

/* Categorías de accesorios. "lugar" indica dónde se dibuja sobre el animal. */
const CATEGORIAS = [
  { id: "sombrero", nombre: "Sombreros", icono: "🎩" },
  { id: "lentes", nombre: "Lentes", icono: "🕶️" },
  { id: "traje", nombre: "Trajes", icono: "👔" },
  { id: "zapatos", nombre: "Zapatos", icono: "👟" }
];

const ACCESORIOS = [
  { id: "mono-rosa", cat: "sombrero", nombre: "Moño", emoji: "🎀", precio: 25, img: "" },
  { id: "gorra", cat: "sombrero", nombre: "Gorra", emoji: "🧢", precio: 30, img: "" },
  { id: "paja", cat: "sombrero", nombre: "Sombrero de paja", emoji: "👒", precio: 50, img: "" },
  { id: "copa", cat: "sombrero", nombre: "Sombrero de copa", emoji: "🎩", precio: 60, img: "" },
  { id: "birrete", cat: "sombrero", nombre: "Birrete", emoji: "🎓", precio: 80, img: "" },
  { id: "corona", cat: "sombrero", nombre: "Corona", emoji: "👑", precio: 150, img: "" },

  { id: "lentes", cat: "lentes", nombre: "Lentes", emoji: "👓", precio: 40, img: "" },
  { id: "sol", cat: "lentes", nombre: "Lentes de sol", emoji: "🕶️", precio: 60, img: "" },
  { id: "buceo", cat: "lentes", nombre: "Goggles", emoji: "🥽", precio: 70, img: "" },

  { id: "camiseta", cat: "traje", nombre: "Camiseta", emoji: "🎽", precio: 35, img: "" },
  { id: "bufanda", cat: "traje", nombre: "Bufanda", emoji: "🧣", precio: 40, img: "" },
  { id: "corbata", cat: "traje", nombre: "Camisa y corbata", emoji: "👔", precio: 50, img: "" },
  { id: "chaleco", cat: "traje", nombre: "Chaleco de rescate", emoji: "🦺", precio: 60, img: "" },
  { id: "vestido", cat: "traje", nombre: "Vestido", emoji: "👗", precio: 80, img: "" },
  { id: "kimono", cat: "traje", nombre: "Kimono", emoji: "🥋", precio: 100, img: "" },

  { id: "chanclas", cat: "zapatos", nombre: "Chanclas", emoji: "🩴", precio: 30, img: "" },
  { id: "tenis", cat: "zapatos", nombre: "Tenis", emoji: "👟", precio: 40, img: "" },
  { id: "botas", cat: "zapatos", nombre: "Botas", emoji: "🥾", precio: 55, img: "" },
  { id: "tacones", cat: "zapatos", nombre: "Zapatillas", emoji: "👠", precio: 70, img: "" },
  { id: "patines", cat: "zapatos", nombre: "Patines", emoji: "🛼", precio: 90, img: "" }
];

/* Formas de las piezas: "X" = bloque, "." = vacío, "|" = nueva fila. El número es qué tan seguido sale. */
const FORMAS = [
  ["X", 2],
  ["XX", 3], ["X|X", 3],
  ["XXX", 3], ["X|X|X", 3],
  ["XXXX", 2], ["X|X|X|X", 2],
  ["XXXXX", 1], ["X|X|X|X|X", 1],
  ["XX|XX", 3],
  ["XXX|XXX|XXX", 1],
  ["XXX|XXX", 1], ["XX|XX|XX", 1],
  ["X.|XX", 2], [".X|XX", 2], ["XX|X.", 2], ["XX|.X", 2],
  ["X.|X.|XX", 1], ["XX|X.|X.", 1], [".X|.X|XX", 1], ["XX|.X|.X", 1],
  ["XXX|X..", 1], ["XXX|..X", 1], ["X..|XXX", 1], ["..X|XXX", 1],
  ["XXX|.X.", 1], [".X.|XXX", 1], ["X.|XX|X.", 1], [".X|XX|.X", 1],
  ["XX.|.XX", 1], [".XX|XX.", 1], ["X.|XX|.X", 1], [".X|XX|X.", 1]
];
