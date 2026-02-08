import { View, StyleSheet, Text } from 'react-native';
import { Canvas } from '@react-three/fiber';

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
    </>
  );
}

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas} camera={{ position: [0, 5, 10], fov: 50 }}>
        <Scene />
      </Canvas>
      <View style={styles.overlay}>
        <Text style={styles.title}>New Project</Text>
        <Text style={styles.subtitle}>This is a blank 3D canvas. Describe what you want to build.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  canvas: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#808080',
    textAlign: 'center',
  },
});
