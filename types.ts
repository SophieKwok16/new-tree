export enum TreeState {
  CHAOS = 'CHAOS',
  FORMED = 'FORMED'
}

export interface DualPosition {
  chaos: [number, number, number];
  target: [number, number, number];
}

export type OrnamentType = 'GIFT' | 'BALL' | 'LIGHT';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      pointLight: any;
      group: any;
      mesh: any;
      points: any;
      instancedMesh: any;
      bufferGeometry: any;
      sphereGeometry: any;
      cylinderGeometry: any;
      bufferAttribute: any;
      meshBasicMaterial: any;
      meshStandardMaterial: any;
      pointsMaterial: any;
      shaderMaterial: any;
    }
  }
}