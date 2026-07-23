import { Canvas } from '@react-three/fiber';
import Envelope from './Envelope.jsx';

export default function EnvelopeScene({ phase, onOpen, onRevealed }) {
  return (
    <Canvas
      className="envelope-canvas"
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0.1, 5], fov: 38, near: 0.1, far: 100 }}
    >
      {/* Iluminación cálida y elegante (sin HDRIs externos, 100% offline) */}
      <ambientLight intensity={0.55} color="#dfe8f5" />
      <directionalLight
        position={[3, 5, 4]}
        intensity={2.1}
        color="#fff4dd"
      />
      <directionalLight
        position={[-4, 2, 2]}
        intensity={0.6}
        color="#9fd8be"
      />
      {/* Destello dorado que resbala sobre el sobre */}
      <pointLight position={[0, -1, 3]} intensity={6} color="#c8a24a" distance={9} />

      <Envelope phase={phase} onOpen={onOpen} onRevealed={onRevealed} />
    </Canvas>
  );
}
