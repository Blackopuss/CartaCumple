import { useState, useCallback } from 'react';
import EnvelopeScene from './components/Envelope/EnvelopeScene.jsx';
import Invitation from './components/Invitation/Invitation.jsx';
import './styles/app.css';

export default function App() {
  // 'sealed' → 'opening' → 'revealed'
  const [phase, setPhase] = useState('sealed');

  const handleOpen = useCallback(() => {
    setPhase((p) => (p === 'sealed' ? 'opening' : p));
  }, []);

  // Se llama cuando la animación 3D está por terminar → cross-fade al contenido
  const handleRevealed = useCallback(() => {
    setPhase('revealed');
  }, []);

  return (
    <>
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

      {phase === 'revealed' && <Invitation />}
    </>
  );
}
