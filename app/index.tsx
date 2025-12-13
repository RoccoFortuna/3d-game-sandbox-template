import { View, StyleSheet, Text } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { useNormalizedModel } from './hooks/useNormalizedModel';

function RotatingController() {
  const groupRef = useRef<THREE.Group>(null);
  const gltf = useNormalizedModel(require('../public/models/controller.glb'), 4.5);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Variable speed with smooth ease-in-out: slow when facing us, fast when rotated away
      const phaseShift = - Math.PI / 3; // Shift timing: start slower later, stay slow longer
      const normalizedCos = (1 - Math.cos(groupRef.current.rotation.y + phaseShift)) / 2;
      // Apply smoothstep for smoother easing
      const eased = normalizedCos * normalizedCos * (3 - 2 * normalizedCos);
      const speed = 0.3 + eased * 10; // ranges from 0.15 (slow) to 1.5 (fast)
      groupRef.current.rotation.y += delta * speed;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -5]}>
      <primitive
        object={gltf.scene}
        rotation={[Math.PI / 6, 0, Math.PI / 4]}
      />
    </group>
  );
}

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.canvasContainer}>
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <RotatingController />
        </Canvas>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>🎮 Your 3D Game Project</Text>
        <Text style={styles.subtitle}>
          This is your empty project, ready to be transformed into an amazing 3D game!
        </Text>
        <Text style={styles.instructions}>
          Describe the 3D game you want to build and watch it come to life.
        </Text>
        <View style={styles.examples}>
          <Text style={styles.examplesTitle}>Ideas to get started:</Text>
          <Text style={styles.example}>• "Create a 3D platformer where I play as a cube jumping on floating islands"</Text>
          <Text style={styles.example}>• "Build a simple racing game with a car on a track"</Text>
          <Text style={styles.example}>• "Make a first-person maze explorer"</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  canvasContainer: {
    width: 300,
    height: 300,
    marginBottom: 32,
  },
  content: {
    maxWidth: 600,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#a0a0a0',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 26,
  },
  instructions: {
    fontSize: 16,
    color: '#808080',
    marginBottom: 32,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  examples: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    width: '100%',
  },
  examplesTitle: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 12,
  },
  example: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 8,
    lineHeight: 20,
  },
});
