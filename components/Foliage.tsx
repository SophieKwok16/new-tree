import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG, COLORS, FOLIAGE_VERTEX_SHADER, FOLIAGE_FRAGMENT_SHADER } from '../constants';
import { TreeState } from '../types';

interface FoliageProps {
  treeState: TreeState;
}

const Foliage: React.FC<FoliageProps> = ({ treeState }) => {
  const meshRef = useRef<THREE.Points>(null);
  const shaderRef = useRef<THREE.ShaderMaterial>(null);

  // Generate data once
  const { positions, targets, sizes, speeds } = useMemo(() => {
    const pos = new Float32Array(CONFIG.FOLIAGE_COUNT * 3);
    const tar = new Float32Array(CONFIG.FOLIAGE_COUNT * 3);
    const sz = new Float32Array(CONFIG.FOLIAGE_COUNT);
    const sp = new Float32Array(CONFIG.FOLIAGE_COUNT);

    for (let i = 0; i < CONFIG.FOLIAGE_COUNT; i++) {
      // Chaos: Random sphere distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = Math.pow(Math.random(), 1 / 3) * 15; // Spread out chaos
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      // Target: Cone shape (Christmas Tree)
      // y goes from 0 to HEIGHT
      const yNorm = Math.random(); 
      // Bias slightly towards bottom for fuller look
      const y = yNorm * CONFIG.TREE_HEIGHT - (CONFIG.TREE_HEIGHT / 2); 
      
      // Radius decreases as we go up. 
      // yNorm is 0 at bottom (if we map it right). 
      // Let's remap y to 0..1 for radius calc
      const hPercent = (y + CONFIG.TREE_HEIGHT/2) / CONFIG.TREE_HEIGHT;
      const coneRadius = (1 - hPercent) * CONFIG.TREE_RADIUS;
      
      // Random point inside the cone slice volume
      const angle = Math.random() * Math.PI * 2;
      const rad = Math.sqrt(Math.random()) * coneRadius; // Uniform disk distribution

      tar[i * 3] = rad * Math.cos(angle);
      tar[i * 3 + 1] = y;
      tar[i * 3 + 2] = rad * Math.sin(angle);

      sz[i] = Math.random() * 0.3 + 0.1;
      sp[i] = Math.random() * 1.0 + 0.5;
    }

    return { positions: pos, targets: tar, sizes: sz, speeds: sp };
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uSway: { value: 1.0 },
    uColorA: { value: new THREE.Color(COLORS.GOLD) }, // Chaos color
    uColorB: { value: new THREE.Color(COLORS.EMERALD) }, // Formed color
  }), []);

  // Animate transition
  useFrame((state, delta) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value += delta;
      
      const targetProgress = treeState === TreeState.FORMED ? 1.0 : 0.0;
      // Lerp current progress
      shaderRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
        shaderRef.current.uniforms.uProgress.value,
        targetProgress,
        delta * 2.0 // Transition speed
      );
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-targetPosition"
          count={targets.length / 3}
          array={targets}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
        <bufferAttribute
            attach="attributes-speed"
            count={speeds.length}
            array={speeds}
            itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderRef}
        vertexShader={FOLIAGE_VERTEX_SHADER}
        fragmentShader={FOLIAGE_FRAGMENT_SHADER}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
      />
    </points>
  );
};

export default Foliage;