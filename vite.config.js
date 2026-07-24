import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    // Separa las librerías pesadas para que el navegador las cachee aparte
    // y descargue en paralelo en lugar de un solo archivo gigante.
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber'],
          scroll: ['gsap', 'gsap/ScrollTrigger', 'lenis'],
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
});
