import React, { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';
import Foliage from './Foliage';
import Ornaments from './Ornaments';

interface TreeGroupProps {
  treeState: TreeState;
}

const TreeGroup: React.FC<TreeGroupProps> = ({ treeState }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Physics State
  const angularVelocity = useRef(0);
  const lastPointerX = useRef(0);
  const isDragging = useRef(false);
  const friction = 0.95; // Damping factor

  const { gl } = useThree();

  // Handlers for "Swipe to Spin"
  const handlePointerDown = (e: React.PointerEvent) => { // Use React.PointerEvent
    e.stopPropagation();
    // Only capture on the invisible hitbox to avoid interfering with other interactions if needed
    // But here we attach to the group wrapper
    isDragging.current = true;
    lastPointerX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    
    const deltaX = e.clientX - lastPointerX.current;
    lastPointerX.current = e.clientX;

    // Apply torque based on mouse movement speed
    // Sensitivity factor
    angularVelocity.current += deltaX * 0.005;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  useFrame(() => {
    if (!groupRef.current) return;

    // Auto rotate slowly if formed and idle
    if (treeState === TreeState.FORMED && !isDragging.current && Math.abs(angularVelocity.current) < 0.001) {
        angularVelocity.current = 0.001; 
    }

    // Apply velocity
    groupRef.current.rotation.y += angularVelocity.current;

    // Apply friction
    if (!isDragging.current) {
      angularVelocity.current *= friction;
    }
  });

  return (
    <group 
      ref={groupRef}
      onPointerDown={handlePointerDown as any} // Cast to any to satisfy R3F types if strict
      onPointerMove={handlePointerMove as any}
      onPointerUp={handlePointerUp as any}
      onPointerLeave={handlePointerUp as any}
    >
      {/* Invisible Hit Cylinder for easier swiping */}
      <mesh visible={false}>
        <cylinderGeometry args={[6, 6, 14, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <Foliage treeState={treeState} />
      <Ornaments treeState={treeState} />
    </group>
  );
};

export default TreeGroup;