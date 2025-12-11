import { View, StyleSheet, Text } from 'react-native';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { useRef } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

function RotatingBeaver() {
  const meshRef = useRef<THREE.Group>(null);
  const gltf = useLoader(GLTFLoader, require('../public/models/beaver.glb'));

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <primitive
      ref={meshRef}
      object={gltf.scene}
      scale={2}
      position={[0, -1, 0]}
    />
  );
}

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.canvasContainer}>
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <RotatingBeaver />
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
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
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
