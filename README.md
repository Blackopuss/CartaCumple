# Invitación · 45 Aniversario

Invitación web interactiva y responsiva con un sobre 3D animado, scroll narrativo
y confirmación por WhatsApp.

## Stack

- **Vite + React** — base rápida y ligera
- **Three.js + React Three Fiber + drei** — escena 3D del sobre
- **GSAP + ScrollTrigger** — animación de apertura y microinteracciones de scroll
- **Lenis** — smooth scrolling

## Desarrollo local

```bash
npm install
npm run dev
```

Abre http://localhost:5173

## Build de producción

```bash
npm run build      # genera /dist
npm run preview    # previsualiza el build
```

## Personalización

Todo el contenido del evento (fecha, ubicación, homenaje, WhatsApp, etc.)
se edita desde un solo archivo:

```
src/config.js
```

La paleta de colores está centralizada en:

```
src/styles/global.css   (variables :root)
```

## Despliegue en Netlify

El repositorio incluye `netlify.toml` con la configuración lista:

- **Build command:** `npm run build`
- **Publish directory:** `dist`

Basta con conectar el repositorio en Netlify y desplegar.
