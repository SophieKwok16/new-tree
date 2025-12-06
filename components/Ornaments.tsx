import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG, COLORS } from '../constants';
import { TreeState } from '../types';

interface OrnamentsProps {
  treeState: TreeState;
}

const Ornaments: React.FC<OrnamentsProps> = ({ treeState }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = CONFIG.ORNAMENT_COUNT;

  // Store data for each instance
  const instances = useMemo(() => {
    const data = [];
    const tempObj = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      // Chaos Position
      const chaosX = (Math.random() - 0.5) * 25;
      const chaosY = (Math.random() - 0.5) * 25;
      const chaosZ = (Math.random() - 0.5) * 25;

      // Target Position (Tree surface)
      const yNorm = Math.random();
      const y = yNorm * CONFIG.TREE_HEIGHT - (CONFIG.TREE_HEIGHT / 2);
      const hPercent = (y + CONFIG.TREE_HEIGHT/2) / CONFIG.TREE_HEIGHT;
      const coneRadius = (1 - hPercent) * CONFIG.TREE_RADIUS * 0.9; // Slightly inside foliage
      const angle = Math.random() * Math.PI * 2;
      
      const targetX = coneRadius * Math.cos(angle);
      const targetZ = coneRadius * Math.sin(angle);
      // Push slightly out for ornaments
      const finalTargetX = targetX * 1.2; 
      const finalTargetZ = targetZ * 1.2;

      const scale = Math.random() * 0.3 + 0.2;
      const color = Math.random() > 0.6 ? COLORS.GOLD : COLORS.RICH_RED;

      data.push({
        chaos: new THREE.Vector3(chaosX, chaosY, chaosZ),
        target: new THREE.Vector3(finalTargetX, y, finalTargetZ),
        scale: new THREE.Vector3(scale, scale, scale),
        color: new THREE.Color(color),
        rotationSpeed: Math.random() * 0.02,
        phase: Math.random() * Math.PI * 2,
        lerpFactor: Math.random() * 0.05 + 0.02, // Different speeds for physics feel
      });
    }
    return data;
  }, [count]);

  useEffect(() => {
      // Set initial colors
      if (meshRef.current) {
          instances.forEach((data, i) => {
              meshRef.current?.setColorAt(i, data.color);
          });
          meshRef.current.instanceColor!.needsUpdate = true;
      }
  }, [instances]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;
    const isFormed = treeState === TreeState.FORMED;
    const dummy = new THREE.Object3D();

    // Use a temp vector to interpolate
    const currentPos = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);

    for (let i = 0; i < count; i++) {
      const data = instances[i];

      // Calculate where we want to be based on state
      const destination = isFormed ? data.target : data.chaos;

      // NOTE: In a real physics engine we'd use velocity, but for visual flair
      // we store the "current" position in the matrix and lerp towards destination.
      
      // Get current matrix position
      meshRef.current.getMatrixAt(i, dummy.matrix);
      dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);

      // Lerp position
      dummy.position.lerp(destination, isFormed ? 0.03 : 0.01);

      // Add idle float animation
      if (isFormed) {
          dummy.position.y += Math.sin(time + data.phase) * 0.002;
      }

      // Rotate slightly
      dummy.rotation.x = time * data.rotationSpeed;
      dummy.rotation.y = time * data.rotationSpeed + data.phase;
      
      dummy.scale.copy(data.scale);
      
      // Make them face outward from center when formed
      if (isFormed) {
        dummy.lookAt(0, dummy.position.y, 0);
      }

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial 
        roughness={0.2} 
        metalness={0.9} 
        emissive={COLORS.GOLD}
        emissiveIntensity={0.2}
      />
    </instancedMesh>
  );
};

export default Ornaments;