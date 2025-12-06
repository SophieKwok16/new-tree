import * as THREE from 'three';

export const COLORS = {
  EMERALD: '#004225',
  DEEP_GREEN: '#013220',
  GOLD: '#FFD700',
  CHAMPAGNE: '#F7E7CE',
  RICH_RED: '#800020',
  WHITE_GOLD: '#F5F5F5',
};

export const CONFIG = {
  FOLIAGE_COUNT: 12000,
  ORNAMENT_COUNT: 150,
  DUST_COUNT: 500,
  TREE_HEIGHT: 14,
  TREE_RADIUS: 5.5,
  CAMERA_POS: [0, 4, 20] as [number, number, number],
};

// Shader for the foliage transition
export const FOLIAGE_VERTEX_SHADER = `
  uniform float uTime;
  uniform float uProgress;
  uniform float uSway;
  
  attribute vec3 targetPosition;
  attribute float size;
  attribute float speed;
  
  varying vec2 vUv;
  varying float vProgress;

  // Simple noise function
  float hash(float n) { return fract(sin(n) * 43758.5453123); }

  void main() {
    vUv = uv;
    vProgress = uProgress;

    // Cubic bezier easing for smoother transition
    float t = uProgress;
    float eased = t * t * (3.0 - 2.0 * t);

    vec3 currentPos = mix(position, targetPosition, eased);

    // Add some "breathing" or sway when formed
    if (uProgress > 0.8) {
        float wind = sin(uTime * speed + currentPos.y * 0.5) * 0.1 * uSway;
        currentPos.x += wind;
        currentPos.z += wind;
    }

    // Add chaotic swirl when in chaos mode
    if (uProgress < 0.2) {
       float angle = uTime * speed * 0.2;
       float x = currentPos.x * cos(angle) - currentPos.z * sin(angle);
       float z = currentPos.x * sin(angle) + currentPos.z * cos(angle);
       currentPos.x = x;
       currentPos.z = z;
    }

    vec4 mvPosition = modelViewMatrix * vec4(currentPos, 1.0);
    
    // Size attenuation
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const FOLIAGE_FRAGMENT_SHADER = `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vProgress;

  void main() {
    // Circular particle
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;

    // Gradient center
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 1.5);

    vec3 color = mix(uColorA, uColorB, vProgress);
    
    // Add a gold shine center
    if (r < 0.1) {
        color = vec3(1.0, 0.9, 0.6); // Sparkle
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;