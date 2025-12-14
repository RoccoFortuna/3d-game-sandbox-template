---
name: loading-3d-assets
description: Load and auto-normalize downloaded 3D models (GLB/GLTF) to correct scale. CRITICAL: Always use useNormalizedModel hook for downloaded assets to avoid scale issues.
dependencies:
  - 3d-game-defaults
---

# Loading 3D Assets with Auto-Normalization

**CRITICAL**: Downloaded 3D models have arbitrary scales. NEVER load them directly with `useLoader` - ALWAYS use the `useNormalizedModel` hook to auto-scale to the correct size.

## When to Use This Skill

Use this skill when:
- Loading models downloaded via `getPolyPizzaAsset`
- Adding any external 3D model to the scene
- Model appears too large, too small, or invisible after loading

## The Problem

```typescript
// ❌ WRONG - Model will be random size (often invisible or giant)
const gltf = useLoader(GLTFLoader, require('../assets/models/character.glb'));
return <primitive object={gltf.scene} scale={1} />;
```

**Why this fails:**
- Model might be exported in centimeters (giant in your scene)
- Model might be exported in kilometers (invisible in your scene)
- You have NO way to know the scale until you see it
- Guessing scale values wastes time

## The Solution: useNormalizedModel Hook

```typescript
// ✅ CORRECT - Model auto-scales to target size
const gltf = useNormalizedModel(
  require('../assets/models/character.glb'),
  1.8  // Target: 1.8 units tall (human height)
)
return <primitive object={gltf.scene} />;
```

**How it works:**
1. Loads the model
2. Calculates its bounding box
3. Finds largest dimension (width, height, depth)
4. Scales to fit your target size
5. Centers the model

No guessing, no trial-and-error, no "make it 10x bigger" back-and-forth.

## Hook Implementation

**The `useNormalizedModel` hook is defined in the `3d-game-defaults` skill.**

To get the implementation:
```typescript
fetchSkill({ skillName: "3d-game-defaults", mcpUrl })
```

The hook is located in the **"Auto-Normalizing 3D Models"** section of that skill.

## Target Size Guidelines

Choose target size based on what the object represents (1 unit ≈ 1 meter):

| Object Type | Target Size | Example |
|-------------|-------------|---------|
| Character (human) | 1.8 | `useNormalizedModel(path, 1.8)` |
| Character (small) | 1.0 | Child, small creature |
| Vehicle (car) | 3.0 | Car width ~3 meters |
| Vehicle (large) | 5.0 | Truck, bus |
| Prop (small) | 0.3 | Coin, apple, ball |
| Prop (medium) | 0.5 | Chair, box, bottle |
| Prop (large) | 1.5 | Desk, barrel, crate |
| Tree | 5.0 | Average tree height |
| Building | 10.0 | Small building |
| Collectible | 0.3 | Things to pick up |

See the `3d-game-defaults` skill for comprehensive target size guidelines.

## Complete Workflow

When the agent downloads a 3D asset:

1. ✅ Call `getPolyPizzaAsset({ query: "...", filename: "...", mcpUrl })`
2. ✅ Note the returned `filePath`
3. ✅ Fetch `3d-game-defaults` skill to get `useNormalizedModel` hook implementation
4. ✅ Add the hook to your code
5. ✅ Load with `useNormalizedModel(require(filePath), targetSize)`
6. ✅ Choose appropriate `targetSize` based on object type
7. ✅ Render with `<primitive object={gltf.scene} />`

**NO manual scale adjustments needed!**

## Complete Examples

### Example 1: Character

```typescript
import { useNormalizedModel } from './hooks/useNormalizedModel';

function Player() {
  // Agent called: getPolyPizzaAsset({ query: "character", filename: "player", mcpUrl })
  // Returns: { filePath: "assets/models/player.glb" }

  const gltf = useNormalizedModel(
    require('../assets/models/player.glb'),
    1.8  // 1.8 units tall (human)
  );

  return <primitive object={gltf.scene} position={[0, 0, 0]} />;
}
```

### Example 2: Collectible

```typescript
function Coin() {
  // Agent called: getPolyPizzaAsset({ query: "coin", filename: "coin", mcpUrl })

  const gltf = useNormalizedModel(
    require('../assets/models/coin.glb'),
    0.3  // 0.3 units (small collectible)
  );

  return <primitive object={gltf.scene} position={[5, 0.5, 0]} />;
}
```

### Example 3: Environment Object

```typescript
function Tree() {
  // Agent called: getPolyPizzaAsset({ query: "low poly tree", filename: "tree", mcpUrl })

  const gltf = useNormalizedModel(
    require('../assets/models/tree.glb'),
    5.0  // 5 units tall
  );

  return <primitive object={gltf.scene} position={[-10, 0, 0]} />;
}
```

### Example 4: Complete Scene

```typescript
export default function Game() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />

      <Player />
      <Coin />
      <Tree />
    </Canvas>
  );
}
```

## Common Mistakes

### Mistake 1: Using Scale Prop

```typescript
// ❌ WRONG - Defeats the purpose of normalization
const gltf = useNormalizedModel(path, 1.8);
return <primitive object={gltf.scene} scale={2} />;  // Don't do this!

// ✅ CORRECT - Let useNormalizedModel handle scale
const gltf = useNormalizedModel(path, 1.8);
return <primitive object={gltf.scene} />;
```

### Mistake 2: Not Using Clone for Multiple Instances

```typescript
// ❌ WRONG - All instances share same transform
const gltf = useNormalizedModel(path, 1.0);
return (
  <>
    <primitive object={gltf.scene} position={[0, 0, 0]} />
    <primitive object={gltf.scene} position={[5, 0, 0]} />  // Won't work!
  </>
);

// ✅ CORRECT - Clone for each instance
const gltf = useNormalizedModel(path, 1.0);
return (
  <>
    <primitive object={gltf.scene.clone()} position={[0, 0, 0]} />
    <primitive object={gltf.scene.clone()} position={[5, 0, 0]} />
  </>
);
```

### Mistake 3: Using Direct Loader

```typescript
// ❌ WRONG - No normalization, random scale
const gltf = useLoader(GLTFLoader, require('../assets/models/tree.glb'));
return <primitive object={gltf.scene} />;

// ✅ CORRECT - Always normalize downloaded assets
const gltf = useNormalizedModel(require('../assets/models/tree.glb'), 5.0);
return <primitive object={gltf.scene} />;
```

## Debugging

If the model still looks wrong:

```typescript
// Add logging to see what's happening
const gltf = useNormalizedModel(path, targetSize);

useEffect(() => {
  if (gltf.scene) {
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const size = box.getSize(new THREE.Vector3());
    console.log('Model dimensions:', size);
    console.log('Model scale:', gltf.scene.scale);
  }
}, [gltf]);
```

## Related Skills

- **3d-game-defaults**: Contains useNormalizedModel hook implementation and comprehensive default values
- **sourcing-3d-assets**: How to find and download 3D models
- **creating-platformer-mechanics**: Game mechanics that use these assets

## Key Takeaway

> **ALWAYS use `useNormalizedModel` for downloaded 3D assets. Never guess scale values. Let the bounding box calculation handle it automatically.**
