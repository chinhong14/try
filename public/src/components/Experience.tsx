import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import PolygonalTree from './PolygonalTree';
import ScatteredPictures from './ScatteredPictures';
import { AppState } from '../types';

interface ExperienceProps {
  appState: AppState;
  onTreeFormed: () => void;
  currentSlideIndex?: number;
}

const Experience: React.FC<ExperienceProps> = ({ appState, onTreeFormed, currentSlideIndex = -1 }) => {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 2, 42], fov: 45 }} // Increased Z for buffer, slight Y offset
      gl={{ antialias: false }}
    >
      <color attach="background" args={['#020617']} />
      
      {/* Lighting for Warmth and Energy */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#F59E0B" />
      <pointLight position={[-10, -10, -10]} intensity={1.5} color="#10B981" />
      <spotLight 
        position={[0, 20, 0]} 
        angle={0.5} 
        penumbra={1} 
        intensity={2} 
        color="#FFD700" 
        castShadow 
      />

      {/* Environmental Reflections for Metallic Look */}
      <Environment preset="city" />

      {/* Suspense Wrapper to handle Async Image Loading */}
      <Suspense fallback={null}>
        {/* The Main Subject */}
        <PolygonalTree appState={appState} onTreeFormed={onTreeFormed} />

        {/* The Floating Memories */}
        <ScatteredPictures appState={appState} currentSlideIndex={currentSlideIndex} />
      </Suspense>

      {/* Ambient Sparkles for Magic */}
      <Sparkles 
        count={200} 
        scale={40} 
        size={4} 
        speed={0.4} 
        opacity={0.5} 
        color="#FACC15" 
      />

      {/* Post Processing for Glow/Cinematic Look */}
      <EffectComposer enableNormalPass={false}>
        <Bloom 
            luminanceThreshold={1} 
            mipmapBlur 
            intensity={1.5} 
            radius={0.6}
        />
        <Bloom 
            luminanceThreshold={0.6} 
            mipmapBlur 
            intensity={0.5} 
            radius={0.4}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>

      {/* Camera Controls - restricted for cinematic feel */}
      <OrbitControls 
        enablePan={false} 
        enableZoom={false}
        minPolarAngle={Math.PI / 3} 
        maxPolarAngle={Math.PI / 1.5}
        autoRotate={appState === 'TICKET' || appState === 'FORMING' || appState === 'ITINERARY'}
        autoRotateSpeed={0.5}
        enabled={appState !== 'SEQUENCE'} // Disable user controls during sequence for cinematic direction
      />
    </Canvas>
  );
};

export default Experience;