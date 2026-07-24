import { useEffect, useState } from 'react';
import { getMusicState, subscribeMusic, toggleMute } from './music.js';
import './music.css';

export default function MusicToggle() {
  const [music, setMusic] = useState(getMusicState);

  useEffect(() => subscribeMusic(setMusic), []);

  if (!music.started) return null;

  const sonando = !music.muted;

  return (
    <button
      className={`music-toggle ${sonando ? 'is-playing' : 'is-muted'}`}
      onClick={toggleMute}
      aria-label={sonando ? 'Silenciar música' : 'Activar música'}
      title={sonando ? 'Silenciar música' : 'Activar música'}
    >
      <span className="music-toggle__bars" aria-hidden>
        <i />
        <i />
        <i />
        <i />
      </span>
    </button>
  );
}
