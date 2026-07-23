import { useEffect, useLayoutEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EVENT } from '../../config.js';
import Countdown from './Countdown.jsx';
import Rsvp from './Rsvp.jsx';
import './invitation.css';

gsap.registerPlugin(ScrollTrigger);

export default function Invitation() {
  const rootRef = useRef();

  // ── Smooth scroll (Lenis) sincronizado con ScrollTrigger ──
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  // ── Microinteracciones de scroll narrativo ──
  useLayoutEffect(() => {
    const ctx = gsap.context((self) => {
      // Reveal genérico de cada elemento [data-reveal]
      self.selector('[data-reveal]').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 42, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 82%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      // Parallax sutil en fondos marinos
      self.selector('[data-parallax]').forEach((el) => {
        gsap.to(el, {
          yPercent: 18,
          ease: 'none',
          scrollTrigger: {
            trigger: el.parentElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });

      // Escalado suave del héroe al hacer scroll
      gsap.to('.hero__inner', {
        scale: 0.94,
        autoAlpha: 0.35,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, rootRef);

    // Refresca posiciones tras montar
    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => ctx.revert();
  }, []);

  const homenaje = EVENT.homenaje;

  return (
    <main className="invite" ref={rootRef}>
      {/* ── PORTADA / HÉROE ── */}
      <section className="hero section">
        <div className="hero__bg" data-parallax aria-hidden />
        <div className="hero__inner">
          <p className="eyebrow" data-reveal>
            Estás invitado
          </p>
          <h1 className="hero__title display" data-reveal>
            {EVENT.titulo}
          </h1>
          <div className="divider" data-reveal />
          <p className="hero__lead" data-reveal>
            {EVENT.subtitulo}. Acompáñanos a celebrar los{' '}
            <em>{EVENT.edad} años</em> de {EVENT.celebrante} con una tarde inolvidable.
          </p>
          <p className="hero__date eyebrow" data-reveal>
            {EVENT.fechaTexto}
          </p>
        </div>
        <div className="scroll-cue" data-reveal>
          <span>Desliza</span>
          <span className="scroll-cue__line" />
        </div>
      </section>

      {/* ── CONTADOR REGRESIVO ── */}
      <section className="section countdown-section">
        <p className="eyebrow" data-reveal>
          La cuenta regresiva
        </p>
        <h2 className="section__title display" data-reveal>
          Falta poco para brindar
        </h2>
        <Countdown target={EVENT.fecha} />
      </section>

      {/* ── DÓNDE Y CUÁNDO ── */}
      <section className="section where-section">
        <div className="where__bg" data-parallax aria-hidden />
        <div className="where__content">
          <p className="eyebrow" data-reveal>
            Dónde & Cuándo
          </p>
          <h2 className="section__title display" data-reveal>
            {EVENT.ubicacion.nombre}
          </h2>
          <p className="where__addr" data-reveal>
            {EVENT.ubicacion.direccion}
          </p>
          <p className="where__addr where__addr--date" data-reveal>
            {EVENT.fechaTexto}
          </p>

          <div className="map-frame" data-reveal>
            <iframe
              title="Mapa del evento"
              src={EVENT.ubicacion.embedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="btn-row" data-reveal>
            <a
              className="btn btn--gold"
              href={EVENT.ubicacion.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
            >
              Abrir en Google Maps
            </a>
            <a className="btn btn--ghost" href={calendarUrl(EVENT)}>
              Añadir al Calendario
            </a>
          </div>
        </div>
      </section>

      {/* ── HOMENAJE ── */}
      <section className="section tribute-section">
        <div className="tribute__bg" data-parallax aria-hidden />
        <div className="tribute__head">
          <p className="eyebrow" data-reveal>
            {homenaje.eyebrow}
          </p>
          <blockquote className="tribute__quote display" data-reveal>
            <span className="tribute__mark" aria-hidden>
              “
            </span>
            {homenaje.cita}
          </blockquote>
          <div className="divider" data-reveal />
          <p className="tribute__msg" data-reveal>
            {homenaje.mensaje}
          </p>
        </div>
        <ul className="tribute__grid">
          {homenaje.facetas.map((f) => (
            <li className="facet" data-reveal key={f.palabra}>
              <span className="facet__mark" aria-hidden>
                ✦
              </span>
              <h3 className="facet__word">{f.palabra}</h3>
              <p className="facet__detail">{f.detalle}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── RSVP ── */}
      <Rsvp />

      <footer className="foot">
        <span className="foot__seal" aria-hidden />
        <p>{EVENT.celebrante} · {EVENT.edad} Aniversario</p>
      </footer>
    </main>
  );
}

// Genera un enlace de Google Calendar
function calendarUrl(ev) {
  const start = ev.fecha;
  const end = new Date(start.getTime() + 4 * 60 * 60 * 1000); // 4 h
  const fmt = (d) =>
    d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${ev.edad} Aniversario · ${ev.celebrante}`,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: `${ev.subtitulo}. ¡Te esperamos para celebrar juntos!`,
    location: `${ev.ubicacion.nombre} — ${ev.ubicacion.direccion}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
