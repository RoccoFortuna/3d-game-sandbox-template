---
name: creating-platformer-mechanics
description: Implement 3D platformer game mechanics using React Native and @react-three/fiber. Covers player movement, jumping, gravity, collision detection, and platform interactions. Provides working code examples for building platformer games.
dependencies:
  - skeletal-animations
  - generating-3d-assets
  - 3d-game-defaults
---

# Creating Platformer Mechanics

This skill provides patterns and code examples for implementing 3D platformer game mechanics with React Native and @react-three/fiber.

## When to Use This Skill

Use this skill when:
- User requests a platformer game
- Need to implement jumping and gravity
- Adding collision detection
- Creating floating platforms
- Building player movement systems

## Core Platformer Mechanics

### 1. Player Character with Physics

A player character needs position, velocity, and physics.

```typescript
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Player({ position = [0, 2, 0], onPositionChange }) {
  const mesh = useRef<THREE.Mesh>(null);
  const [velocity, setVelocity] = useState({ x: 0, y: 0, z: 0 });
  const [isGrounded, setIsGrounded] = useState(false);

  useFrame((state, delta) => {
    if (!mesh.current) return;

    // Apply gravity
    let newVelocity = { ...velocity };
    if (!isGrounded) {
      newVelocity.y -= 0.05; // Gravity constant
    }

    // Update position
    mesh.current.position.x += newVelocity.x * delta * 60;
    mesh.current.position.y += newVelocity.y * delta * 60;
    mesh.current.position.z += newVelocity.z * delta * 60;

    // Ground collision (y = 0.5 is player radius)
    if (mesh.current.position.y <= 0.5) {
      mesh.current.position.y = 0.5;
      newVelocity.y = 0;
      setIsGrounded(true);
    } else {
      setIsGrounded(false);
    }

    // Apply friction when grounded
    if (isGrounded) {
      newVelocity.x *= 0.8;
      newVelocity.z *= 0.8;
    } else {
      // Air resistance
      newVelocity.x *= 0.98;
      newVelocity.z *= 0.98;
    }

    setVelocity(newVelocity);

    // Notify parent of position changes
    if (onPositionChange) {
      onPositionChange({
        x: mesh.current.position.x,
        y: mesh.current.position.y,
        z: mesh.current.position.z,
      });
    }
  });

  return (
    <mesh ref={mesh} position={position} castShadow>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="#4287f5" />
    </mesh>
  );
}
```

**Key concepts:**
- `velocity` state tracks movement in x, y, z
- `isGrounded` determines if player can jump
- Gravity applied every frame when not grounded
- Friction slows horizontal movement when grounded
- `onPositionChange` callback for camera following

### 2. Jump Mechanics

Jumping adds upward velocity when grounded.

```typescript
function Player({ position, onPositionChange }) {
  const mesh = useRef<THREE.Mesh>(null);
  const [velocity, setVelocity] = useState({ x: 0, y: 0, z: 0 });
  const [isGrounded, setIsGrounded] = useState(false);

  // Jump function (call from parent via ref or callback)
  const jump = () => {
    if (isGrounded) {
      setVelocity(v => ({ ...v, y: 0.3 })); // Jump strength
    }
  };

  // Double jump variant
  const [jumpsRemaining, setJumpsRemaining] = useState(2);

  const doubleJump = () => {
    if (jumpsRemaining > 0) {
      setVelocity(v => ({ ...v, y: 0.3 }));
      setJumpsRemaining(j => j - 1);
    }
  };

  useFrame((state, delta) => {
    // ... physics code ...

    // Reset jumps when grounded
    if (isGrounded && jumpsRemaining < 2) {
      setJumpsRemaining(2);
    }
  });

  // Expose jump function via useImperativeHandle or parent callback
  return <mesh ref={mesh} position={position}>...</mesh>;
}
```

**Jump variations:**
- **Single jump**: Only when `isGrounded === true`
- **Double jump**: Track `jumpsRemaining` counter
- **Variable height**: Hold button longer = higher jump (track jump duration)
- **Coyote time**: Allow jump for 0.1s after leaving platform

### 3. Movement Controls

Horizontal movement updates velocity based on input.

```typescript
function Player({ position, controls, onPositionChange }) {
  const mesh = useRef<THREE.Mesh>(null);
  const [velocity, setVelocity] = useState({ x: 0, y: 0, z: 0 });

  useFrame((state, delta) => {
    if (!mesh.current) return;

    let newVelocity = { ...velocity };

    // Apply movement from controls
    const moveSpeed = 0.15;

    if (controls.forward) {
      newVelocity.z -= moveSpeed;
    }
    if (controls.back) {
      newVelocity.z += moveSpeed;
    }
    if (controls.left) {
      newVelocity.x -= moveSpeed;
    }
    if (controls.right) {
      newVelocity.x += moveSpeed;
    }

    // Jump
    if (controls.jump && isGrounded) {
      newVelocity.y = 0.3;
    }

    // Max speed limit
    const maxSpeed = 0.5;
    const horizontalSpeed = Math.sqrt(newVelocity.x ** 2 + newVelocity.z ** 2);
    if (horizontalSpeed > maxSpeed) {
      const scale = maxSpeed / horizontalSpeed;
      newVelocity.x *= scale;
      newVelocity.z *= scale;
    }

    // ... rest of physics code ...
  });

  return <mesh ref={mesh}>...</mesh>;
}
```

**Controls object format:**
```typescript
interface Controls {
  forward: boolean;  // W key
  back: boolean;     // S key
  left: boolean;     // A key
  right: boolean;    // D key
  jump: boolean;     // Spacebar
}
```

#### Keyboard Controls (WASD + Spacebar)

**Standard keyboard bindings** for desktop/web platformers:

- **W** - Move forward (decreases Z)
- **A** - Move left (decreases X)
- **S** - Move backward (increases Z)
- **D** - Move right (increases X)
- **Spacebar** - Jump

**Implementation with keyboard events:**

```typescript
import { useEffect, useState } from 'react';

function useKeyboardControls() {
  const [controls, setControls] = useState({
    forward: false,
    back: false,
    left: false,
    right: false,
    jump: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
          setControls(c => ({ ...c, forward: true }));
          break;
        case 'KeyA':
          setControls(c => ({ ...c, left: true }));
          break;
        case 'KeyS':
          setControls(c => ({ ...c, back: true }));
          break;
        case 'KeyD':
          setControls(c => ({ ...c, right: true }));
          break;
        case 'Space':
          e.preventDefault(); // Prevent page scroll
          setControls(c => ({ ...c, jump: true }));
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
          setControls(c => ({ ...c, forward: false }));
          break;
        case 'KeyA':
          setControls(c => ({ ...c, left: false }));
          break;
        case 'KeyS':
          setControls(c => ({ ...c, back: false }));
          break;
        case 'KeyD':
          setControls(c => ({ ...c, right: false }));
          break;
        case 'Space':
          setControls(c => ({ ...c, jump: false }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return controls;
}

// Usage in game component
function PlatformerGame() {
  const controls = useKeyboardControls();

  return (
    <Canvas>
      <Player position={[0, 2, 0]} controls={controls} platforms={platforms} />
      {/* ... rest of scene ... */}
    </Canvas>
  );
}
```

**Note:** For React Native mobile apps, use touch controls (see `implementing-3d-controls` skill). For web/desktop builds, **always implement WASD + Spacebar** as the standard control scheme.

### 4. Platform Collision Detection

Simple box collision between player (sphere) and platforms (boxes).

```typescript
// Platform component
function Platform({ position, size = [3, 0.5, 3], color = "#42f545" }) {
  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// Collision detection function
function checkPlatformCollision(
  playerPos: THREE.Vector3,
  playerRadius: number,
  platformPos: [number, number, number],
  platformSize: [number, number, number]
): boolean {
  // AABB (Axis-Aligned Bounding Box) collision
  const [px, py, pz] = platformPos;
  const [sx, sy, sz] = platformSize;

  // Platform bounds
  const minX = px - sx / 2;
  const maxX = px + sx / 2;
  const minY = py - sy / 2;
  const maxY = py + sy / 2;
  const minZ = pz - sz / 2;
  const maxZ = pz + sz / 2;

  // Check if player is above platform and within horizontal bounds
  const horizontalInside =
    playerPos.x + playerRadius > minX &&
    playerPos.x - playerRadius < maxX &&
    playerPos.z + playerRadius > minZ &&
    playerPos.z - playerRadius < maxZ;

  const verticalCollision =
    playerPos.y - playerRadius <= maxY &&
    playerPos.y - playerRadius >= minY;

  return horizontalInside && verticalCollision;
}

// Usage in Player component
function Player({ position, platforms }) {
  const mesh = useRef<THREE.Mesh>(null);
  const [velocity, setVelocity] = useState({ x: 0, y: 0, z: 0 });

  useFrame(() => {
    if (!mesh.current) return;

    // ... movement code ...

    // Check all platform collisions
    let onPlatform = false;

    for (const platform of platforms) {
      if (checkPlatformCollision(
        mesh.current.position,
        0.5,
        platform.position,
        platform.size
      )) {
        // Snap to top of platform
        mesh.current.position.y = platform.position[1] + platform.size[1] / 2 + 0.5;
        newVelocity.y = 0;
        onPlatform = true;
        break;
      }
    }

    setIsGrounded(onPlatform);
  });

  return <mesh ref={mesh}>...</mesh>;
}
```

**Collision improvements:**
- Check platforms from highest to lowest
- Add side collisions (walls)
- Implement moving platforms
- Add one-way platforms (can jump through from below)

### 5. Complete Platformer Example

```typescript
import { Canvas, useFrame } from '@react-three/fiber';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useState, useRef } from 'react';

function Player({ position, platforms, controls }) {
  const mesh = useRef(null);
  const [velocity, setVelocity] = useState({ x: 0, y: 0, z: 0 });
  const [isGrounded, setIsGrounded] = useState(false);

  useFrame((state, delta) => {
    if (!mesh.current) return;

    let newVelocity = { ...velocity };

    // Apply controls
    const moveSpeed = 0.15;
    if (controls.forward) newVelocity.z -= moveSpeed;
    if (controls.back) newVelocity.z += moveSpeed;
    if (controls.left) newVelocity.x -= moveSpeed;
    if (controls.right) newVelocity.x += moveSpeed;
    if (controls.jump && isGrounded) newVelocity.y = 0.3;

    // Apply gravity
    if (!isGrounded) {
      newVelocity.y -= 0.05;
    }

    // Update position
    mesh.current.position.x += newVelocity.x * delta * 60;
    mesh.current.position.y += newVelocity.y * delta * 60;
    mesh.current.position.z += newVelocity.z * delta * 60;

    // Ground collision
    if (mesh.current.position.y <= 0.5) {
      mesh.current.position.y = 0.5;
      newVelocity.y = 0;
      setIsGrounded(true);
    } else {
      setIsGrounded(false);
    }

    // Platform collisions
    for (const platform of platforms) {
      const collision = checkPlatformCollision(
        mesh.current.position,
        0.5,
        platform.position,
        platform.size
      );

      if (collision && newVelocity.y <= 0) {
        mesh.current.position.y = platform.position[1] + platform.size[1] / 2 + 0.5;
        newVelocity.y = 0;
        setIsGrounded(true);
        break;
      }
    }

    // Friction
    if (isGrounded) {
      newVelocity.x *= 0.8;
      newVelocity.z *= 0.8;
    } else {
      newVelocity.x *= 0.98;
      newVelocity.z *= 0.98;
    }

    setVelocity(newVelocity);
  });

  return (
    <mesh ref={mesh} position={position}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="#4287f5" />
    </mesh>
  );
}

function Platform({ position, size, color }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export default function PlatformerGame() {
  const [controls, setControls] = useState({
    forward: false,
    back: false,
    left: false,
    right: false,
    jump: false,
  });

  const platforms = [
    { position: [0, 0, 0], size: [20, 1, 20] },
    { position: [5, 3, 0], size: [3, 0.5, 3] },
    { position: [-5, 5, 2], size: [3, 0.5, 3] },
    { position: [0, 8, 5], size: [3, 0.5, 3] },
  ];

  return (
    <View style={styles.container}>
      <Canvas>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} />

        <Player position={[0, 2, 0]} platforms={platforms} controls={controls} />

        {platforms.map((platform, i) => (
          <Platform key={i} {...platform} color="#2ecc71" />
        ))}
      </Canvas>

      {/* Controls UI - see implementing-3d-controls skill */}
      <View style={styles.controls}>
        <TouchableOpacity
          onPressIn={() => setControls(c => ({ ...c, jump: true }))}
          onPressOut={() => setControls(c => ({ ...c, jump: false }))}
          style={styles.button}
        >
          <Text>JUMP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  controls: { position: 'absolute', bottom: 20, right: 20 },
  button: { padding: 20, backgroundColor: '#4287f5', borderRadius: 10 },
});
```

## Advanced Patterns

### Moving Platforms

```typescript
function MovingPlatform({ startPos, endPos, speed = 0.02 }) {
  const mesh = useRef(null);
  const [direction, setDirection] = useState(1);

  useFrame(() => {
    if (!mesh.current) return;

    // Move platform
    mesh.current.position.x += direction * speed;

    // Reverse direction at endpoints
    if (
      (direction > 0 && mesh.current.position.x >= endPos[0]) ||
      (direction < 0 && mesh.current.position.x <= startPos[0])
    ) {
      setDirection(d => -d);
    }
  });

  return (
    <mesh ref={mesh} position={startPos}>
      <boxGeometry args={[3, 0.5, 3]} />
      <meshStandardMaterial color="#e74c3c" />
    </mesh>
  );
}
```

### Wall Sliding

```typescript
// Check if player is against a wall
function checkWallCollision(playerPos, velocity, platforms) {
  const wallThreshold = 0.1;

  for (const platform of platforms) {
    // Check if moving into platform from the side
    // (implementation depends on collision system)
  }

  return false;
}

// In Player component
useFrame(() => {
  // ... other code ...

  // Slow fall when sliding on wall
  if (checkWallCollision(mesh.current.position, velocity, platforms)) {
    newVelocity.y = Math.max(newVelocity.y, -0.1); // Limit fall speed

    // Allow wall jump
    if (controls.jump) {
      newVelocity.y = 0.3;
      newVelocity.x = 0.2; // Push away from wall
    }
  }
});
```

## Best Practices

1. **Use delta time**: Multiply velocity by `delta * 60` for frame-rate independence
2. **Separate concerns**: Physics, rendering, and input should be distinct
3. **Test collision edge cases**: Corners, fast movement, multiple collisions
4. **Add visual feedback**: Player rotation, squash/stretch on landing
5. **Tune constants**: Gravity, jump strength, move speed - adjust by playtesting

## Common Pitfalls

❌ **Don't use @react-three/drei** - It's web-only and breaks on React Native
❌ **Don't forget friction** - Players will slide forever
❌ **Don't check collisions after moving** - Check before or use rollback
❌ **Don't use fixed timestep in useFrame** - Use delta parameter

## Related Skills

- **implementing-3d-controls**: For touch/keyboard input
- **designing-game-cameras**: For following the player
- **building-3d-environments**: For creating level layouts

## Resources

See `resources/` for:
- Complete platformer examples
- Physics system implementations
- Collision detection utilities
