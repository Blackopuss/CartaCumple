// ────────────────────────────────────────────────────────────
//  MÚSICA · se activa con el clic que abre el sobre
//  1) Intenta reproducir el MP3 configurado en EVENT.musica.src
//  2) Si no existe (o el navegador no puede decodificarlo), cae en un
//     ambiente de piano/arpa generado con Web Audio API — 0 archivos.
// ────────────────────────────────────────────────────────────
import { EVENT } from '../config.js';

let audioEl = null;
let ctx = null;
let ambient = null; // { stop() }
let fadeRaf = 0;

const state = { started: false, muted: false, mode: null }; // mode: 'mp3' | 'ambiente'
const listeners = new Set();

export function subscribeMusic(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
export function getMusicState() {
  return { ...state };
}
function emit() {
  listeners.forEach((fn) => fn(getMusicState()));
}

// ── Arranque (debe llamarse DENTRO del gesto del usuario) ──
export function startMusic() {
  if (state.started) return;
  state.started = true;

  const { src, volumen } = EVENT.musica;

  // El AudioContext se crea aquí, dentro del gesto, para que el respaldo
  // ambiental pueda sonar aunque el fallo del MP3 llegue más tarde.
  ensureContext();

  if (src) {
    audioEl = new Audio(src);
    audioEl.loop = true;
    audioEl.preload = 'auto';
    audioEl.volume = 0;
    audioEl.addEventListener('error', fallbackToAmbient, { once: true });

    const played = audioEl.play();
    if (played && typeof played.then === 'function') {
      played
        .then(() => {
          state.mode = 'mp3';
          fadeElementTo(volumen, 4000);
          emit();
        })
        .catch(fallbackToAmbient);
    } else {
      state.mode = 'mp3';
      fadeElementTo(volumen, 4000);
    }
  } else {
    fallbackToAmbient();
  }

  emit();
}

export function toggleMute() {
  if (!state.started) return;
  state.muted = !state.muted;

  if (state.mode === 'mp3' && audioEl) {
    if (state.muted) {
      fadeElementTo(0, 600, () => audioEl.pause());
    } else {
      audioEl.play().catch(() => {});
      fadeElementTo(EVENT.musica.volumen, 900);
    }
  } else if (ambient) {
    ambient.setVolume(state.muted ? 0 : EVENT.musica.volumen * 0.5);
  }

  emit();
}

// ── Internos ──
function ensureContext() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function fallbackToAmbient() {
  if (state.mode === 'ambiente') return;
  if (audioEl) {
    audioEl.pause();
    audioEl = null;
  }
  if (!ensureContext()) return;
  state.mode = 'ambiente';
  ambient = createAmbient(ctx, EVENT.musica.volumen * 0.5);
  emit();
}

function fadeElementTo(target, ms, onDone) {
  if (!audioEl) return;
  cancelAnimationFrame(fadeRaf);
  const from = audioEl.volume;
  const t0 = performance.now();

  const step = (t) => {
    const k = Math.min(1, (t - t0) / ms);
    if (!audioEl) return;
    audioEl.volume = Math.max(0, Math.min(1, from + (target - from) * k));
    if (k < 1) fadeRaf = requestAnimationFrame(step);
    else onDone?.();
  };
  fadeRaf = requestAnimationFrame(step);
}

// ── Ambiente generado: acordes maj7 en arpegio lento sobre un pad grave ──
function createAmbient(ac, volume) {
  const master = ac.createGain();
  master.gain.value = 0;
  master.connect(ac.destination);
  master.gain.linearRampToValueAtTime(volume, ac.currentTime + 5);

  // Espacio (delay con realimentación amortiguada) → sensación de sala
  const delay = ac.createDelay(2);
  delay.delayTime.value = 0.44;
  const feedback = ac.createGain();
  feedback.gain.value = 0.36;
  const damp = ac.createBiquadFilter();
  damp.type = 'lowpass';
  damp.frequency.value = 1700;
  delay.connect(damp);
  damp.connect(feedback);
  feedback.connect(delay);
  const wet = ac.createGain();
  wet.gain.value = 0.45;
  delay.connect(wet);
  wet.connect(master);

  const bus = ac.createGain();
  bus.connect(master);
  bus.connect(delay);

  // Cmaj7 · Am7 · Fmaj7 · G6 — cálido y sin tensión
  const PROG = [
    [261.63, 329.63, 392.0, 493.88],
    [220.0, 261.63, 329.63, 392.0],
    [174.61, 261.63, 329.63, 440.0],
    [196.0, 246.94, 293.66, 392.0],
  ];
  const CHORD_S = 8;
  const nodes = new Set();
  let i = 0;
  let timer = 0;

  const voice = (freq, at, dur, gain, type = 'sine') => {
    const osc = ac.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = (Math.random() - 0.5) * 6;

    const env = ac.createGain();
    env.gain.setValueAtTime(0.0001, at);
    env.gain.exponentialRampToValueAtTime(gain, at + 1.1);
    env.gain.exponentialRampToValueAtTime(0.0001, at + dur);

    osc.connect(env);
    env.connect(bus);
    osc.start(at);
    osc.stop(at + dur + 0.1);
    nodes.add(osc);
    osc.onended = () => nodes.delete(osc);
  };

  const playChord = () => {
    const chord = PROG[i % PROG.length];
    i += 1;
    const at = ac.currentTime + 0.05;

    voice(chord[0] / 2, at, CHORD_S, 0.09, 'triangle'); // pad grave
    chord.forEach((f, n) => voice(f, at + n * 0.55, CHORD_S - n * 0.4, 0.06));
    // Brillo: la fundamental una octava arriba, retrasada
    voice(chord[0] * 2, at + 2.4, 5, 0.025);
  };

  playChord();
  timer = setInterval(playChord, CHORD_S * 1000);

  return {
    setVolume(v) {
      master.gain.cancelScheduledValues(ac.currentTime);
      master.gain.setValueAtTime(master.gain.value, ac.currentTime);
      master.gain.linearRampToValueAtTime(v, ac.currentTime + 0.8);
    },
    stop() {
      clearInterval(timer);
      nodes.forEach((o) => {
        try {
          o.stop();
        } catch {
          /* ya detenido */
        }
      });
      nodes.clear();
    },
  };
}
