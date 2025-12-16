
import React, { useMemo, useRef, useLayoutEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Image } from '@react-three/drei';
import * as THREE from 'three';
import { AppState } from '../types';
import { MEMORY_LANE, SCATTER_RADIUS } from '../constants';

// Robust Error Boundary to catch texture loading errors without crashing the app
class ImageErrorBoundary extends React.Component<{ children: React.ReactNode, fallback?: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <mesh>
          <planeGeometry args={[4, 3]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      );
    }
    return this.props.children;
  }
}

// Fallback component when image fails or loads
const ImageFallback = () => (
  <mesh>
    <planeGeometry args={[4, 3]} />
    <meshStandardMaterial color="#1e293b" />
  </mesh>
);

interface ScatteredPicturesProps {
  appState: AppState;
  currentSlideIndex?: number;
}

const ScatteredPictures: React.FC<ScatteredPicturesProps> = ({ appState, currentSlideIndex = -1 }) => {
  const groupRef = useRef<THREE.Group>(null);
  const itemsRef = useRef<(THREE.Group | null)[]>([]);

  // Generate Deterministic Positions (Fibonacci Sphere)
  const images = useMemo(() => {
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden Angle

    return MEMORY_LANE.map((memory, i) => {
      const y = 1 - (i / (MEMORY_LANE.length - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const r = SCATTER_RADIUS * 0.8; // Base radius

      const x = Math.cos(theta) * radiusAtY * r;
      const z = Math.sin(theta) * radiusAtY * r;
      const yPos = y * r;

      const position = new THREE.Vector3(x, yPos, z);
      
      // Calculate rotation to face OUTWARDS from center
      const dummyObj = new THREE.Object3D();
      dummyObj.position.copy(position);
      dummyObj.lookAt(0, 0, 0); // Look at center
      dummyObj.rotateY(Math.PI); // Flip to face outward

      return {
        ...memory,
        initialPosition: position,
        initialRotation: dummyObj.rotation.clone(),
      };
    });
  }, []);

  // Initialize positions ONE TIME
  useLayoutEffect(() => {
    images.forEach((img, i) => {
      const el = itemsRef.current[i];
      if (el) {
        el.position.copy(img.initialPosition);
        el.rotation.copy(img.initialRotation);
        el.scale.setScalar(1); 
      }
    });
  }, [images]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // 1. Group Rotation Logic
    if (appState === 'SEQUENCE' && currentSlideIndex !== -1 && currentSlideIndex < images.length) {
      const targetImage = images[currentSlideIndex];
      if (targetImage) {
        const targetImgLocalPos = targetImage.initialPosition.clone().normalize();
        const cameraDir = state.camera.position.clone().normalize();

        const time = state.clock.elapsedTime;
        const driftX = Math.sin(time * 0.4) * 0.12; 
        const driftY = Math.cos(time * 0.3) * 0.08;
        
        const driftOffset = new THREE.Vector3(driftX, driftY, 0);
        driftOffset.applyQuaternion(state.camera.quaternion);
        
        const targetWorldVec = cameraDir.add(driftOffset).normalize();
        const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(targetImgLocalPos, targetWorldVec);
        
        groupRef.current.quaternion.slerp(targetQuaternion, 5 * delta);
      }
    } else if (appState === 'SCATTERED') {
       groupRef.current.rotation.y += delta * 0.05;
    }

    // 2. Individual Image Animation
    images.forEach((img, i) => {
        const itemGroup = itemsRef.current[i];
        if (!itemGroup) return;

        const isActive = (appState === 'SEQUENCE' && i === currentSlideIndex);
        
        const targetScale = isActive ? 1.5 : 1.0;
        const activeRadiusMultiplier = isActive ? 1.4 : 1.0; 
        
        const targetPos = img.initialPosition.clone().multiplyScalar(activeRadiusMultiplier);

        itemGroup.position.lerp(targetPos, 8 * delta);
        
        const currentScale = itemGroup.scale.x; 
        const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 8 * delta);
        itemGroup.scale.setScalar(newScale);
    });
  });

  const visible = appState === 'SCATTERED' || appState === 'SEQUENCE';

  return (
    <group ref={groupRef}>
      {images.map((img, i) => (
        <group 
            key={img.id} 
            ref={(el) => { if (el) itemsRef.current[i] = el; }}
        >
          {/* 
            CRITICAL FIX: 
            Wrapping Image in Suspense AND ErrorBoundary prevents the entire app 
            from crashing if a texture is missing (404) or fails to load.
          */}
          <ImageErrorBoundary fallback={<ImageFallback />}>
            <Suspense fallback={<ImageFallback />}>
              <Image 
                  url={img.img}
                  scale={[4, 3]}
                  transparent
                  opacity={visible ? (appState === 'SEQUENCE' && i !== currentSlideIndex ? 0.3 : 0.9) : 0} 
                  color={visible ? "#ffffff" : "#000000"} 
                  toneMapped={false}
                  // @ts-ignore
                  crossOrigin="anonymous"
              />
            </Suspense>
          </ImageErrorBoundary>

            {/* Frame */}
            <mesh position={[0, 0, -0.05]}>
                <boxGeometry args={[4.2, 3.2, 0.05]} />
                <meshStandardMaterial 
                    color="#FDE047" 
                    metalness={0.9} 
                    roughness={0.1} 
                    transparent 
                    opacity={visible ? (appState === 'SEQUENCE' && i !== currentSlideIndex ? 0.3 : 1) : 0} 
                />
            </mesh>
        </group>
      ))}
    </group>
  );
};

export default ScatteredPictures;
