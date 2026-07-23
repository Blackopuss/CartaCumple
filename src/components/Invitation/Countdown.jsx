import { useState, useEffect } from 'react';

function diff(target) {
  const total = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(total / 86400000);
  const hours = Math.floor((total % 86400000) / 3600000);
  const mins = Math.floor((total % 3600000) / 60000);
  const secs = Math.floor((total % 60000) / 1000);
  return { days, hours, mins, secs, done: total === 0 };
}

export default function Countdown({ target }) {
  const [t, setT] = useState(() => diff(target));

  useEffect(() => {
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const units = [
    { v: t.days, l: 'Días' },
    { v: t.hours, l: 'Horas' },
    { v: t.mins, l: 'Min' },
    { v: t.secs, l: 'Seg' },
  ];

  if (t.done) {
    return (
      <p className="countdown__done display" data-reveal>
        ¡Hoy es el gran día!
      </p>
    );
  }

  return (
    <div className="countdown" data-reveal>
      {units.map((u, i) => (
        <div className="cd-unit" key={u.l}>
          <span className="cd-unit__num display">
            {String(u.v).padStart(2, '0')}
          </span>
          <span className="cd-unit__label">{u.l}</span>
          {i < units.length - 1 && <span className="cd-unit__sep" aria-hidden />}
        </div>
      ))}
    </div>
  );
}
