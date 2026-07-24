import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import EnvelopeScene from './components/Envelope/EnvelopeScene.jsx';
import MusicToggle from './audio/MusicToggle.jsx';
import { startMusic } from './audio/music.js';
import './styles/app.css';

// La invitación (GSAP + Lenis) se descarga aparte mientras el sobre está
// cerrado: el primer render sólo necesita la escena 3D.
const Invitation = lazy(() => import('./components/Invitation/Invitation.jsx'));

export default function App() {
  // 'sealed' → 'opening' → 'revealed'
  const [phase, setPhase] = useState('sealed');
  const [stageMounted, setStageMounted] = useState(true);

  // Precarga del chunk de la invitación durante la fase cerrada
  useEffect(() => {
    import('./components/Invitation/Invitation.jsx');
  }, []);

  // Al terminar el cross-fade se desmonta el canvas: three.js sigue
  // renderizando a 60 fps aunque esté invisible, y eso ahoga el scroll.
  useEffect(() => {
    if (phase !== 'revealed') return;
    const t = setTimeout(() => setStageMounted(false), 1400);
    return () => clearTimeout(t);
  }, [phase]);

  const handleOpen = useCallback(() => {
    // startMusic va aquí, dentro del gesto del usuario: los navegadores
    // sólo permiten iniciar audio desde el propio evento del clic.
    startMusic();
    setPhase((p) => (p === 'sealed' ? 'opening' : p));
  }, []);

  // Se llama cuando la animación 3D está por terminar → cross-fade al contenido
  const handleRevealed = useCallback(() => {
    setPhase('revealed');
  }, []);

  return (
    <>
      {stageMounted && (
        <div className={`stage stage--${phase}`}>
          <EnvelopeScene
            phase={phase}
            onOpen={handleOpen}
            onRevealed={handleRevealed}
          />

          {phase === 'sealed' && (
            <button className="open-hint" onClick={handleOpen}>
              <span className="open-hint__seal" aria-hidden />
              <span className="open-hint__text">Toca para abrir</span>
            </button>
          )}
        </div>
      )}

      {phase === 'revealed' && (
        <Suspense fallback={null}>
          <Invitation />
        </Suspense>
      )}

      <MusicToggle />
    </>
  );
}
