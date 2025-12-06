import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS, CONFIG } from '../constants';

const GoldDust: React.FC = () => {
  const meshRef = useRef<THREE.Points>(null);
  
  // Create particles
  const particles = useMemo(() => {
    const pos = new Float32Array(CONFIG.DUST_COUNT * 3);
    const vel = new Float32Array(CONFIG.DUST_COUNT * 3); // Velocity
    
    for(let i=0; i<CONFIG.DUST_COUNT; i++) {
        pos[i*3] = (Math.random() - 0.5) * 30;
        pos[i*3+1] = (Math.random() - 0.5) * 30;
        pos[i*3+2] = (Math.random() - 0.5) * 30;

        vel[i*3] = 0;
        vel[i*3+1] = 0;
        vel[i*3+2] = 0;
    }
    return { pos, vel };
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;

    const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
    const { pointer, viewport, camera } = state;

    // Project mouse 2D to 3D roughly
    // We create a vector at z=0 (or variable Z based on particle depth? Simple is best)
    const vector = new THREE.Vector3(pointer.x, pointer.y, 0.5); // 0.5 is halfway between near/far in NDC
    vector.unproject(camera);
    
    // Direction from camera to unprojected point
    const dir = vector.sub(camera.position).normalize();
    const distanceToCenter = -camera.position.z / dir.z; // Distance to Z=0 plane
    const targetPos = camera.position.clone().add(dir.multiplyScalar(distanceToCenter));

    // Update particles
    for (let i = 0; i < CONFIG.DUST_COUNT; i++) {
        const px = positions[i*3];
        const py = positions[i*3+1];
        const pz = positions[i*3+2];

        // Attraction to mouse
        const dx = targetPos.x - px;
        const dy = targetPos.y - py;
        const dz = targetPos.z - pz;
        
        const distSq = dx*dx + dy*dy + dz*dz;
        const force = Math.min(20.0 / (distSq + 0.1), 0.5); // Cap force

        // Apply force to velocity
        particles.vel[i*3] += dx * force * 0.01;
        particles.vel[i*3+1] += dy * force * 0.01;
        particles.vel[i*3+2] += dz * force * 0.01;

        // Apply turbulence/noise
        particles.vel[i*3] += (Math.random() - 0.5) * 0.02;
        particles.vel[i*3+1] += (Math.random() - 0.5) * 0.02;
        particles.vel[i*3+2] += (Math.random() - 0.5) * 0.02;

        // Drag/Friction
        particles.vel[i*3] *= 0.96;
        particles.vel[i*3+1] *= 0.96;
        particles.vel[i*3+2] *= 0.96;

        // Update Position
        positions[i*3] += particles.vel[i*3];
        positions[i*3+1] += particles.vel[i*3+1];
        positions[i*3+2] += particles.vel[i*3+2];
    }
    
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute 
            attach="attributes-position" 
            count={CONFIG.DUST_COUNT} 
            array={particles.pos} 
            itemSize={3} 
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.15} 
        color={COLORS.GOLD} 
        transparent 
        opacity={0.8} 
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export default GoldDust;