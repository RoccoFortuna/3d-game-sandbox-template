import { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

/**
 * Load and auto-normalize a 3D model to target size.
 * Models from external sources come in arbitrary scales — this hook
 * scales them to a consistent size and centers them at the origin.
 *
 * @param url - Path to GLB/GLTF file
 * @param targetSize - Desired size of the largest dimension in world units (default: 1)
 * @returns GLTF object with the scene scaled and centered
 */
export function useNormalizedModel(url: string, targetSize: number = 1) {
  const gltf = useLoader(GLTFLoader, url);

  const normalizedScene = useMemo(() => {
    const scene = gltf.scene.clone();

    // Measure the model's bounding box before scaling
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Scale so the largest dimension equals targetSize
    const maxDimension = Math.max(size.x, size.y, size.z);
    if (maxDimension === 0) return scene;
    const scale = targetSize / maxDimension;
    scene.scale.setScalar(scale);

    // Center at origin: offset by the scaled center position
    scene.position.set(
      -center.x * scale,
      -center.y * scale,
      -center.z * scale
    );

    return scene;
  }, [gltf, targetSize]);

  return { ...gltf, scene: normalizedScene };
}
