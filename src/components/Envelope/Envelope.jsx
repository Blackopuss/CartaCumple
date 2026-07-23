import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

// Paleta traducida a THREE.Color (Esmeralda & Oro)
const NAVY = '#164636';
const NAVY_DARK = '#0f2c22';
const CREAM = '#f4ead7';
const GOLD = '#c8a24a';

const W = 3.0; // ancho del sobre
const H = 2.0; // alto del sobre

// Distancia de cámara necesaria para encuadrar un objeto de tamaño
// (targetW × targetH) dado el FOV vertical y el aspect ratio actual.
// Toma el máximo entre el ajuste vertical y el horizontal → nunca se recorta.
function fitDistance(targetW, targetH, fovDeg, aspect, margin) {
  const fovV = (fovDeg * Math.PI) / 180;
  const dV = (targetH * margin) / (2 * Math.tan(fovV / 2));
  const fovH = 2 * Math.atan(Math.tan(fovV / 2) * aspect);
  const dH = (targetW * margin) / (2 * Math.tan(fovH / 2));
  return Math.max(dV, dH);
}

export default function Envelope({ phase, onOpen, onRevealed }) {
  const { camera, size } = useThree();
  const aspect = size.width / size.height;

  const groupRef = useRef();
  const flapRef = useRef();
  const cardRef = useRef();
  const sealRef = useRef();
  const lookTarget = useRef(new THREE.Vector3(0, 0, 0));
  const hasAnimated = useRef(false);
  const idle = useRef(0);

  // ── Geometría de la solapa triangular (con bisel para acabado premium) ──
  const flapGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-W / 2, 0);
    shape.lineTo(W / 2, 0);
    shape.lineTo(0, -H * 0.62);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.02,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.015,
      bevelSegments: 2,
    });
    geo.translate(0, 0, -0.01);
    return geo;
  }, []);

  // ── Geometría del bolsillo frontal (pentágono: oculta la tarjeta) ──
  const pocketGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-W / 2, -H / 2);
    shape.lineTo(W / 2, -H / 2);
    shape.lineTo(W / 2, H * 0.28);
    shape.lineTo(0, -H * 0.02);
    shape.lineTo(-W / 2, H * 0.28);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }, []);

  const materials = useMemo(
    () => ({
      body: new THREE.MeshStandardMaterial({
        color: NAVY_DARK,
        roughness: 0.72,
        metalness: 0.05,
      }),
      pocket: new THREE.MeshStandardMaterial({
        color: NAVY,
        roughness: 0.65,
        metalness: 0.08,
      }),
      flap: new THREE.MeshStandardMaterial({
        color: NAVY,
        roughness: 0.6,
        metalness: 0.1,
        side: THREE.DoubleSide,
      }),
      card: new THREE.MeshStandardMaterial({
        color: CREAM,
        roughness: 0.85,
        metalness: 0.0,
      }),
      gold: new THREE.MeshStandardMaterial({
        color: GOLD,
        roughness: 0.35,
        metalness: 0.85,
      }),
    }),
    []
  );

  // ── Encuadre responsivo en reposo (se recalcula al redimensionar) ──
  useEffect(() => {
    if (phase !== 'sealed') return;
    // Margen amplio: deja aire alrededor del sobre en cualquier pantalla.
    camera.position.set(0, 0.1, fitDistance(W, H, camera.fov, aspect, 1.35));
    camera.updateProjectionMatrix();
  }, [phase, aspect, camera]);

  // ── Disparar la animación de apertura ──
  useEffect(() => {
    if (phase !== 'opening' || hasAnimated.current) return;
    hasAnimated.current = true;

    // Distancia final del dolly-in: encuadra la tarjeta emergida (más ancha
    // que el sobre por la escala) con un margen ajustado para el clímax.
    const openZ = fitDistance(W * 1.02, H, camera.fov, aspect, 1.12);

    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
    });

    // 1. La cámara hace un dolly-in cinematográfico
    tl.to(
      camera.position,
      { x: 0, y: 0.55, z: openZ, duration: 1.8, ease: 'power2.inOut' },
      0
    );
    tl.to(lookTarget.current, { y: 0.35, duration: 1.8 }, 0);

    // 2. El sello dorado se desvanece al romperse
    tl.to(sealRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.5, ease: 'back.in(2)' }, 0.2);

    // 3. La solapa se abre hacia atrás
    tl.to(
      flapRef.current.rotation,
      { x: -2.55, duration: 1.15, ease: 'power2.inOut' },
      0.55
    );

    // 4. La tarjeta emerge del sobre y se acerca a cámara
    tl.to(
      cardRef.current.position,
      { y: 1.55, z: 0.75, duration: 1.5, ease: 'power3.out' },
      1.35
    );
    tl.to(
      cardRef.current.rotation,
      { x: -0.04, duration: 1.5, ease: 'power3.out' },
      1.35
    );
    tl.to(
      cardRef.current.scale,
      { x: 1.12, y: 1.12, z: 1.12, duration: 1.5, ease: 'power3.out' },
      1.35
    );

    // 5. Handoff al contenido HTML antes de terminar (cross-fade suave)
    tl.call(() => onRevealed?.(), null, '>-0.4');

    return () => tl.kill();
  }, [phase, camera, onRevealed]);

  // Animación idle (flotación sutil) + orientación de cámara
  useFrame((_, delta) => {
    idle.current += delta;
    if (groupRef.current && phase === 'sealed') {
      groupRef.current.rotation.y = Math.sin(idle.current * 0.5) * 0.12;
      groupRef.current.rotation.x = Math.sin(idle.current * 0.4) * 0.04;
      groupRef.current.position.y = Math.sin(idle.current * 0.8) * 0.04;
    }
    camera.lookAt(lookTarget.current);
  });

  const handlePointerDown = (e) => {
    e.stopPropagation();
    if (phase === 'sealed') onOpen?.();
  };

  return (
    <group
      ref={groupRef}
      onPointerDown={handlePointerDown}
      onPointerOver={() => (document.body.style.cursor = phase === 'sealed' ? 'pointer' : 'default')}
      onPointerOut={() => (document.body.style.cursor = 'default')}
    >
      {/* Panel trasero / interior del sobre */}
      <mesh material={materials.body} position={[0, 0, -0.02]}>
        <planeGeometry args={[W, H]} />
      </mesh>

      {/* Tarjeta que emerge (detrás del bolsillo) */}
      <mesh ref={cardRef} material={materials.card} position={[0, -0.15, -0.01]}>
        <planeGeometry args={[W * 0.86, H * 0.86]} />
        {/* Marco dorado de la tarjeta */}
        <lineSegments>
          <edgesGeometry
            args={[new THREE.PlaneGeometry(W * 0.86 - 0.12, H * 0.86 - 0.12)]}
          />
          <lineBasicMaterial color={GOLD} />
        </lineSegments>
      </mesh>

      {/* Bolsillo frontal (oculta la tarjeta cuando está cerrado) */}
      <mesh geometry={pocketGeometry} material={materials.pocket} position={[0, 0, 0.04]} />

      {/* Costura dorada del bolsillo */}
      <mesh position={[0, H * 0.28, 0.041]}>
        <boxGeometry args={[W, 0.012, 0.001]} />
        <meshStandardMaterial color={GOLD} metalness={0.8} roughness={0.35} />
      </mesh>

      {/* Solapa superior (pivota en el borde superior) */}
      <group ref={flapRef} position={[0, H / 2, 0.05]}>
        <mesh geometry={flapGeometry} material={materials.flap} />
        {/* Borde dorado de la solapa */}
        <lineSegments position={[0, 0, 0.025]}>
          <edgesGeometry args={[flapGeometry]} />
          <lineBasicMaterial color={GOLD} transparent opacity={0.5} />
        </lineSegments>
      </group>

      {/* Sello de cera dorado */}
      <group ref={sealRef} position={[0, -0.12, 0.075]}>
        <mesh material={materials.gold} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.04, 48]} />
        </mesh>
        <mesh position={[0, 0.021, 0]}>
          <torusGeometry args={[0.15, 0.012, 16, 48]} />
          <meshStandardMaterial color={NAVY_DARK} metalness={0.3} roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}
