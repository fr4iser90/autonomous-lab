# Ashen Delve — Visual Design Specification

## 1. Mood
Cold ash-stone catacombs lit by flickering torchlight. Players descend into procedurally-generated dungeon depths, fighting kit-built horrors with limited light. Every corridor is a descent into darkness.

## 2. Palette (Three.js CSS hexes)
| Element | Hex | Usage |
|---|---|---|
| bg | `#0a0a0e` | Background / void |
| floor | `#2a2520` | Floor tiles (ash-stone) |
| wall | `#1a1815` | Wall blocks (darker stone) |
| wallHighlight | `#3a3530` | Wall top-face (torchlit edge) |
| accentEmissive | `#ff9944` | Torch flame, hit flash |
| bloodHit | `#cc3333` | Damage numbers, hit markers |
| uiBg | `#12101a` | HUD / inventory backgrounds |
| uiText | `#e8dcc8` | Primary UI text |
| uiMuted | `#7a7068` | Secondary UI text |
| fog | `#0a0a0e` | Fog color (matches bg) |

## 3. Camera
- **Distance:** 12 units behind player (isometric-ish follow)
- **FOV:** 55 degrees
- **Follow lag:** 0.08 (smooth interpolation, no snap)
- **Clamp:** pitch clamped to -0.3 to 0.6 radians; yaw unclamped
- **Type:** perspective camera, orbit-then-follow (player direction locks camera angle)

## 4. Typography
- **Display:** "Cinzel" (Google Font) — gothic serif for titles, HUD headers
- **Body:** "EB Garamond" (Google Font) — readable serif for inventory, descriptions
- **FORBIDDEN:** Inter, Roboto, Arial, system sans-serif stacks

## 5. Kit Silhouettes

### Hero (Player)
```
     /|\
    /_|_\
     / \
```
Capsule body (cylinder + hemispheres), conical helm, dark cloak (inverted cone). ~1.8 units tall.

### Mob 1 — Ash Goblin (Box-Goblin)
```
   _[]_
  /|+|\
 /_|_|\
    |
```
Box torso with protruding arms (smaller boxes), greenish-brown material. Hunched stance. ~1.2 units tall.

### Mob 2 — Shade (Capsule-Shade)
```
  /~~\
  \  /
   \/
   ||
```
Semi-transparent capsule, trailing wisps (small floating cones). Purple-gray tint. ~1.5 units tall.

### Mob 3 — Ash Stalker (Tall Box)
```
  _[]_
 /|+|\
/_|_|_\
   |
   |
```
Tall rectangular body, elongated arms, red-rimmed eyes (emissive sphere). ~2.0 units tall.

## 6. FORBIDDEN Visual List
- Purple-on-white dashboard UI
- Flat single-color void (black canvas with no geometry)
- Default Inter/Roboto/Arial typography
- Emoji HUD icons
- Identical gray boxes for all mobs (must have distinct silhouettes)
- Cards-as-hero elements in gameplay
- FPS voxel perspective (must be third-person follow camera)

## 7. Asset Policy
- **Procedural Three.js meshes** only (BoxGeometry, CylinderGeometry, ConeGeometry, SphereGeometry, ExtrudeGeometry)
- **InstancedMesh** for props (torches, rubble, pillars, bones)
- **≤2 glTF** total for entire run (hero and/or one boss) — default **0 glTF**
- Materials: MeshStandardMaterial with roughness/metalness for torchlit PBR feel
- Emissive materials for torches, hit flashes, UI highlights
