// ────────────────────────────────────────────────────────────
//  CONFIGURACIÓN DEL EVENTO — edita todo desde aquí
// ────────────────────────────────────────────────────────────
export const EVENT = {
  celebrante: 'Cristina Gonzalez',
  edad: 45,
  titulo: '¡ES HOY!',
  subtitulo: 'Un dia para celebrar la vida',

  // Fecha y hora del evento — Domingo 26, 3:00 PM
  // Ajusta año/mes según corresponda (mes es 0-indexado: 6 = Julio)
  fecha: new Date(2026, 6, 26, 15, 0, 0),
  fechaTexto: 'Domingo 26 · 3:00 PM',

  ubicacion: {
    nombre: 'Parques del Castillo',
    direccion:
      'Castillo de Belmonte 376, Parques del Castillo, 45685 San José del Castillo, Jal.',
    lat: 20.5217699,
    lng: -103.2392819,
    embedUrl:
      'https://www.google.com/maps?q=20.5217699,-103.2392819&z=16&output=embed',
    googleMapsUrl: 'https://maps.app.goo.gl/vmYNYRBAdxpq9eSc9',
  },

  // Sección de homenaje — el corazón emotivo de la invitación
  homenaje: {
    eyebrow: '¡ES HOY!',
    cita: 'Una vida llena de amor, risas y momentos inolvidables.',
    mensaje:
      'Hoy celebramos a una mujer extraordinaria. Gracias por ser un ejemplo y el corazón de esta familia. Este día es para ti.',
    // Tres facetas que mantienen el peso visual (tarjetas elegantes)
    facetas: [
      { palabra: 'Amor', detalle: 'El que da sin medida y contagia a todos.' },
      { palabra: 'Risas', detalle: 'Las que llenan cada reunión de alegría.' },
      { palabra: 'Momentos', detalle: 'Los que se vuelven recuerdos para siempre.' },
    ],
  },

  // Música — empieza al abrir el sobre
  musica: {
    // Coloca tu canción en la carpeta `public/` y pon aquí su nombre.
    // Si el archivo no existe, suena un ambiente generado (piano suave).
    src: '/musica.mp3',
    volumen: 0.4, // 0 a 1
  },

  rsvp: {
    // Número en formato internacional SIN + ni espacios (ej. México: 52...)
    whatsapp: '523313560637',
  },
};
