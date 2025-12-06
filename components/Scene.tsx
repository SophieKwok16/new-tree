import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { CONFIG } from '../constants';
import { TreeState } from '../types';
import TreeGroup from './TreeGroup';
import GoldDust from './GoldDust';

interface SceneProps {
  treeState: TreeState;
}

const Scene: React.FC<SceneProps> = ({ treeState }) => {
  return (
    <Canvas
      camera={{ position: CONFIG.CAMERA_POS, fov: 45 }}
      dpr={[1, 2]} // Optimize pixel ratio
      gl={{ antialias: false, toneMapping: 1, toneMappingExposure: 1.5 }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#fff" />
      <pointLight position={[-10, 5, 10]} intensity={0.5} color="#FFD700" />
      
      {/* Environment */}
      <Suspense fallback={null}>
        <Environment preset="lobby" blur={0.6} background={false} />
      </Suspense>

      {/* Content */}
      <group position={[0, -2, 0]}>
        <TreeGroup treeState={treeState} />
      </group>
      
      <GoldDust />

      {/* Post Processing - Cinematic Glow */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.8} 
          mipmapBlur 
          intensity={1.2} 
          radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.5} />
      </EffectComposer>
      
      {/* Optional: Add orbit controls but limit them so swipe-to-spin works primarily */}
      {/* We disable rotation on orbit controls to let our custom physics handle Y rotation, 
          but allow zoom and tilt */}
      <OrbitControls 
        enablePan={false} 
        enableRotate={true}
        enableZoom={true}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.8}
        minDistance={10}
        maxDistance={35}
      />
    </Canvas>
  );
};

export default Scene;