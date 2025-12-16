import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PARTICLE_COUNT, TREE_HEIGHT, TREE_RADIUS, SCATTER_RADIUS, PALETTE } from '../constants';
import { AppState } from '../types';

interface PolygonalTreeProps {
  appState: AppState;
  onTreeFormed: () => void;
}

const PolygonalTree: React.FC<PolygonalTreeProps> = ({ appState, onTreeFormed }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const starRef = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Animation progress (0 = scattered, 1 = tree)
  const [morphFactor, setMorphFactor] = useState(0);

  // Generate particle data
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // 1. Calculate Tree Position (Cone Spiral)
      // Normalized height (0 at bottom, 1 at top)
      const yNorm = i / PARTICLE_COUNT;
      const y = (yNorm * TREE_HEIGHT) - (TREE_HEIGHT / 2); // Center Y
      
      // Radius decreases as we go up
      const r = TREE_RADIUS * (1 - yNorm);
      
      // Golden angle spiral
      const theta = i * 2.4; 
      const x = r * Math.cos(theta);
      const z = r * Math.sin(theta);

      // Add some jitter to tree position for organic look
      const jitter = 0.3;
      const treePos = new THREE.Vector3(
        x + (Math.random() - 0.5) * jitter, 
        y, 
        z + (Math.random() - 0.5) * jitter
      );

      // 2. Calculate Scatter Position (Random Sphere)
      const u = Math.random();
      const v = Math.random();
      const thetaScatter = 2 * Math.PI * u;
      const phiScatter = Math.acos(2 * v - 1);
      const rScatter = SCATTER_RADIUS * Math.cbrt(Math.random()); // Even distribution in sphere
      
      const scatterPos = new THREE.Vector3(
        rScatter * Math.sin(phiScatter) * Math.cos(thetaScatter),
        rScatter * Math.sin(phiScatter) * Math.sin(thetaScatter),
        rScatter * Math.cos(phiScatter)
      );

      // 3. Attributes
      const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      const scale = 0.2 + Math.random() * 0.4;
      
      temp.push({
        treePos,
        scatterPos,
        color,
        scale,
        rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0)
      });
    }
    return temp;
  }, []);

  useEffect(() => {
    // Set initial colors
    if (meshRef.current) {
      // Explicitly create instanceColor attribute if it doesn't exist.
      // R3F/Three sometimes requires this manual step for InstancedMesh if material doesn't trigger it.
      if (!meshRef.current.instanceColor) {
         meshRef.current.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(PARTICLE_COUNT * 3), 3);
      }

      particles.forEach((p, i) => {
        // Safe check before calling methods on the ref
        if (meshRef.current) {
            meshRef.current.setColorAt(i, p.color);
            // Initialize matrix to avoid zero-scale issues at start
            dummy.position.copy(p.scatterPos);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
      });
      
      if (meshRef.current.instanceColor) {
        meshRef.current.instanceColor.needsUpdate = true;
      }
      if (meshRef.current.instanceMatrix) {
        meshRef.current.instanceMatrix.needsUpdate = true;
      }
    }
  }, [particles, dummy]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Handle Animation Logic
    let targetFactor = 0;
    if (appState === 'FORMING' || appState === 'INPUT' || appState === 'TICKET' || appState === 'ITINERARY' || appState === 'REGISTER') {
      targetFactor = 1;
    }

    // Smoothly interpolate morphFactor
    const speed = 2.5; 
    const newFactor = THREE.MathUtils.lerp(morphFactor, targetFactor, delta * speed);
    setMorphFactor(newFactor);

    // Trigger callback when nearly formed
    if (appState === 'FORMING' && newFactor > 0.95) {
        onTreeFormed();
    }

    // Update particles
    particles.forEach((particle, i) => {
      // Lerp position
      const currentPos = new THREE.Vector3().lerpVectors(
        particle.scatterPos, 
        particle.treePos, 
        newFactor
      );

      // Add floating animation
      const time = state.clock.elapsedTime;
      const floatScale = (1 - newFactor) * 2 + 0.2; 
      currentPos.y += Math.sin(time * 2 + i) * 0.1 * floatScale;
      currentPos.x += Math.cos(time * 1.5 + i) * 0.1 * floatScale;

      // Rotate particles continuously
      dummy.position.copy(currentPos);
      dummy.rotation.copy(particle.rotation);
      dummy.rotation.x += delta * 0.5;
      dummy.rotation.y += delta * 0.5;
      
      dummy.scale.setScalar(particle.scale);
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;

    // Star Animation
    if (starRef.current) {
        // Move star to top
        const treeTopY = TREE_HEIGHT / 2 + 0.5;
        // Interpolate star position from high up to tree top
        const startStarY = SCATTER_RADIUS;
        
        starRef.current.position.y = THREE.MathUtils.lerp(startStarY, treeTopY, newFactor);
        starRef.current.rotation.y += delta;
        
        // Scale star up when formed
        const starScale = THREE.MathUtils.lerp(0, 1.5, newFactor);
        starRef.current.scale.setScalar(starScale);
        starRef.current.visible = newFactor > 0.1;
    }
  });

  return (
    <group>
      {/* The Particles */}
      {/* Passing undefined allows R3F to use the children geometry/material defaults properly */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
            roughness={0.2} 
            metalness={0.8} 
            emissive="#000"
            flatShading={true}
        />
      </instancedMesh>

      {/* The Star Topper */}
      <group ref={starRef} position={[0, TREE_HEIGHT / 2 + 1, 0]}>
         <mesh>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial 
                color="#FFD700" 
                emissive="#FFD700" 
                emissiveIntensity={2} 
                toneMapped={false}
            />
         </mesh>
         <pointLight color="#FFD700" intensity={20} distance={10} decay={2} />
      </group>
    </group>
  );
};

export default PolygonalTree;