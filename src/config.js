// ────────────────────────────────────────────────────────────
//  CONFIGURACIÓN DEL EVENTO — edita todo desde aquí
// ────────────────────────────────────────────────────────────
export const EVENT = {
  celebrante: 'Cristina Venegas',
  edad: 45,
  titulo: 'Cuarenta y Cinco',
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
    eyebrow: 'Cuarenta y Cinco',
    cita: 'Una vida entera de esfuerzo, fortaleza y amor sin medida.',
    mensaje:
      'Hoy celebramos a una mujer admirable: su dedicación, su ejemplo y el cariño que reparte a todos los que la rodean. Gracias por tanto.',
    // Tres facetas que la definen (mantienen el peso visual de la sección)
    facetas: [
      { palabra: 'Fortaleza', detalle: 'La que la mantiene firme ante cualquier reto.' },
      { palabra: 'Esfuerzo', detalle: 'El trabajo constante que inspira a quienes la rodean.' },
      { palabra: 'Amor', detalle: 'El que entrega sin medida a su familia y amistades.' },
    ],
  },

  rsvp: {
    // Número en formato internacional SIN + ni espacios (ej. México: 52...)
    whatsapp: '523313560637',
  },
};
