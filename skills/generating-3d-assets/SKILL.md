---
name: generating-3d-assets
description: Guide for using AI-powered 3D asset generation with Tripo3D and loading assets from Poly Pizza. Includes when to use each method, best practices, and example workflows.
---

# Generating and Loading 3D Assets

This skill covers two methods for acquiring 3D models for your game:
1. **getPolyPizzaAsset** - Fast downloads from free asset library (~5 seconds)
2. **generateTripo3DAsset** - AI-generated custom assets from text prompts (30-120 seconds)

## When to Use Each Method

### Use getPolyPizzaAsset When:
- You need common game assets (characters, vehicles, props, environments)
- Speed is important (immediate download)
- The asset doesn't need to be unique
- Generic terms work well: "tree", "car", "sword", "character"

### Use generateTripo3DAsset When:
- Poly Pizza doesn't have what you need
- You need a very specific or unique asset
- Customization is important
- You can wait 30-120 seconds for generation
- You need something with specific style/attributes

## Tool: getPolyPizzaAsset

Downloads free 3D models from [Poly Pizza](https://poly.pizza/) - a library of low-poly game-ready assets.

```typescript
// Example: Download a tree model
getPolyPizzaAsset({
  query: "tree",
  filename: "oak_tree",
  mcpUrl: "..." // Dev server MCP URL
})
```

**Returns:**
```typescript
{
  success: true,
  filePath: "assets/models/oak_tree.glb",
  filename: "oak_tree.glb",
  modelName: "Low Poly Tree",
  author: "creator_username",
  sourceUrl: "https://poly.pizza/m/...",
  glbUrl: "https://static.poly.pizza/...",
  message: "Successfully downloaded..."
}
```

**Search Tips:**
- Use simple, generic terms: "car", "tree", "sword"
- Add "low poly" if results are too complex: "low poly character"
- Try broader terms if specific search fails: "vehicle" instead of "sports car"
- Common categories: character, animal, vehicle, building, weapon, tree, plant, furniture

## Tool: generateTripo3DAsset

Generates custom 3D models using [Tripo3D](https://www.tripo3d.ai/) AI service.

**Requirements:**
- `TRIPO_API_KEY` must be set in Convex environment variables
- Takes 30-120 seconds to generate
- Suitable for creating unique, custom assets

```typescript
// Example: Generate a custom weapon
generateTripo3DAsset({
  prompt: "a medieval iron sword with ornate handle",
  filename: "custom_sword",
  mcpUrl: "..." // Dev server MCP URL
})
```

**Returns:**
```typescript
{
  success: true,
  filePath: "assets/models/custom_sword.glb",
  filename: "custom_sword.glb",
  taskId: "task_abc123",
  prompt: "a medieval iron sword with ornate handle",
  message: "Successfully generated 3D asset..."
}
```

**Prompt Tips:**
- Be descriptive but concise: "low poly cartoon spaceship with blue markings"
- Specify style: "cartoon", "low poly", "realistic", "stylized"
- Include key attributes: colors, materials, details
- Avoid overly complex prompts (keep under 50 words)

**Error Handling:**
```typescript
// If API key missing
{
  success: false,
  error: "TRIPO_API_KEY not configured",
  message: "Tripo3D API key not found..."
}

// If generation times out (>2 minutes)
{
  success: false,
  error: "Generation timeout",
  message: "Tripo3D generation timed out... Try again or use getPolyPizzaAsset instead."
}
```

## Recommended Workflow

### Step 1: Try Poly Pizza First
```typescript
// Quick search for existing assets
const result = await getPolyPizzaAsset({
  query: "spaceship",
  filename: "player_ship",
  mcpUrl
});

if (result.success) {
  // Asset downloaded, proceed to load it
}
```

### Step 2: Fall Back to Generation if Needed
```typescript
// If Poly Pizza doesn't have what you need
const result = await generateTripo3DAsset({
  prompt: "low poly cartoon spaceship with blue energy trail",
  filename: "player_ship",
  mcpUrl
});

// This will take 30-120 seconds
if (result.success) {
  // Custom asset generated and downloaded
}
```

### Step 3: Load and Normalize the Asset
```typescript
// Both tools save to assets/models/
// Always use useNormalizedModel to auto-scale
import { useNormalizedModel } from './hooks/useNormalizedModel';

function PlayerShip() {
  const gltf = useNormalizedModel(
    require('../assets/models/player_ship.glb'),
    2.5  // Target size in units
  );

  return <primitive object={gltf.scene} />;
}
```

## Complete Example: Dynamic Asset Loading

```typescript
// User requests: "Add a futuristic hover bike"

// Step 1: Try Poly Pizza
let assetPath;
const polyPizzaResult = await getPolyPizzaAsset({
  query: "hover bike",
  filename: "hover_bike",
  mcpUrl
});

if (polyPizzaResult.success) {
  assetPath = polyPizzaResult.filePath;
  console.log("Found existing hover bike asset");
} else {
  // Step 2: Generate custom asset
  console.log("No existing hover bike, generating custom one...");
  const tripoResult = await generateTripo3DAsset({
    prompt: "futuristic hover bike with glowing blue accents",
    filename: "hover_bike",
    mcpUrl
  });

  if (tripoResult.success) {
    assetPath = tripoResult.filePath;
    console.log("Custom hover bike generated");
  } else {
    throw new Error("Failed to acquire hover bike asset");
  }
}

// Step 3: Create component using the asset
// Write to app/components/HoverBike.tsx:
import { useNormalizedModel } from '../hooks/useNormalizedModel';

function HoverBike({ position }) {
  const gltf = useNormalizedModel(
    require('../assets/models/hover_bike.glb'),
    3.0  // 3 units long (vehicle size)
  );

  return (
    <group position={position}>
      <primitive object={gltf.scene} />
    </group>
  );
}
```

## Common Asset Requests and Strategies

| Request | Strategy | Example |
|---------|----------|---------|
| "Add a tree" | Use Poly Pizza | `getPolyPizzaAsset({ query: "tree", filename: "tree" })` |
| "Add a glowing magic sword" | Generate custom | `generateTripo3DAsset({ prompt: "glowing blue magic sword", filename: "magic_sword" })` |
| "Add a car" | Try Poly Pizza first | `getPolyPizzaAsset({ query: "car", filename: "car" })` |
| "Add a steampunk airship" | Generate custom | `generateTripo3DAsset({ prompt: "steampunk airship with propellers", filename: "airship" })` |

## Best Practices

### 1. Always Normalize Models
```typescript
// ❌ Don't use raw GLB (unknown scale)
const gltf = useLoader(GLTFLoader, require('../assets/models/model.glb'));

// ✅ Always normalize to target size
const gltf = useNormalizedModel(
  require('../assets/models/model.glb'),
  targetSize
);
```

### 2. Use Consistent File Paths
Both tools save to `assets/models/` directory:
```
assets/
  models/
    player.glb
    enemy.glb
    sword.glb
```

### 3. Handle Long Generation Times
```typescript
// Inform user that generation is in progress
console.log("Generating custom asset, this may take up to 2 minutes...");

const result = await generateTripo3DAsset({
  prompt: "...",
  filename: "...",
  mcpUrl
});

if (result.success) {
  console.log(`Asset ready: ${result.filePath}`);
}
```

### 4. Provide Fallbacks
```typescript
// If generation fails, suggest alternatives
try {
  const result = await generateTripo3DAsset({...});
  if (!result.success) {
    // Suggest using Poly Pizza or simplifying the prompt
    console.log("Generation failed. Try searching Poly Pizza or simplify your prompt.");
  }
} catch (error) {
  console.error("Asset generation error:", error);
}
```

## Troubleshooting

### Poly Pizza Returns No Results
- Try broader search terms: "vehicle" instead of "Ferrari"
- Add "low poly" to search
- Try synonyms: "character" vs "person", "gun" vs "weapon"

### Tripo3D Generation Fails
- Check TRIPO_API_KEY is set correctly
- Simplify the prompt (remove overly specific details)
- Try different wording or style descriptors
- Wait and retry if service is overloaded

### Model Appears Too Large/Small
- Always use `useNormalizedModel` with appropriate target size
- Reference 3d-game-defaults skill for standard sizes:
  - Player: 1.8 units
  - Vehicle: 2-4 units
  - Props: 0.3-1.0 units
  - Environment: 5-20 units

### Model Clips Through Ground
- Add Y-offset equal to collision radius (see 3d-game-defaults skill)
```typescript
<primitive
  object={gltf.scene}
  position={[0, 0.5, 0]}  // Lift by collision radius
/>
```

## Integration with Other Skills

This skill works best when combined with:
- **3d-game-defaults** - Provides target sizes for normalization
- **loading-3d-assets** - Detailed guide on using useNormalizedModel hook
- **player-movement** - Adding collision/interaction to loaded assets

## API Key Setup

To use `generateTripo3DAsset`:

1. Get API key from [Tripo3D](https://www.tripo3d.ai/)
2. Set in Convex:
   ```bash
   npx convex env set TRIPO_API_KEY your_key_here
   ```
3. Verify in environment:
   ```typescript
   const apiKey = process.env.TRIPO_API_KEY;
   if (!apiKey) {
     console.error("TRIPO_API_KEY not set");
   }
   ```

Without the API key, only `getPolyPizzaAsset` will work (which is fine for most use cases).
