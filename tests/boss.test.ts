/**
 * Boss entity unit tests
 * P7-3: Boss phases, special attacks, fireballs, ground slams.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import * as THREE from 'three'
import { Boss } from '../src/entities/Boss'
import type { GameRenderer } from '../src/render/GameRenderer'
import type { MobType } from '../src/entities/MobKit'

// Minimal GameRenderer mock — Boss only needs `scene` and `camera` from it
class MockRenderer {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  constructor() {
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(70, 1, 0.1, 1000)
  }
}

let mock: MockRenderer

function makeBoss(): Boss {
  const boss = new Boss(mock as unknown as GameRenderer)
  boss.buildMesh(mock as unknown as GameRenderer, 'stalker' as MobType)
  return boss
}

beforeEach(() => {
  mock = new MockRenderer()
})

// ─── Basic instantiation ────────────────────────────────────────────

describe('Boss', () => {
  it('creates a boss with default stats', () => {
    const boss = makeBoss()
    expect(boss.state.alive).toBe(true)
    expect(boss.state.stats.hp).toBe(60)
    expect(boss.state.stats.maxHp).toBe(60)
    expect(boss.state.stats.damage).toBe(8)
    expect(boss.state.isBoss).toBe(true)
    expect(boss.state.scrapReward).toBe(100)
  })

  it('creates a boss with custom stats', () => {
    const boss = new Boss(mock as unknown as GameRenderer, {
      hp: 100,
      maxHp: 100,
      damage: 12,
      speed: 0.5,
      aggroRange: 15,
      chaseSpeed: 2.5,
      attackCooldown: 1.0,
    })
    boss.buildMesh(mock as unknown as GameRenderer, 'stalker' as MobType)
    expect(boss.state.stats.hp).toBe(100)
    expect(boss.state.stats.maxHp).toBe(100)
    expect(boss.state.stats.damage).toBe(12)
    expect(boss.state.isBoss).toBe(true)
  })

  it('hpPercent returns correct ratio for full HP', () => {
    const boss = makeBoss()
    expect(boss.hpPercent()).toBeCloseTo(1.0, 4)
  })

  it('hpPercent returns correct ratio for damaged HP', () => {
    const boss = makeBoss()
    boss.state.stats.hp = 30
    expect(boss.hpPercent()).toBeCloseTo(0.5, 4)
  })

  it('hpPercent returns correct ratio for near-dead HP', () => {
    const boss = makeBoss()
    boss.state.stats.hp = 6
    expect(boss.hpPercent()).toBeCloseTo(0.1, 4)
  })

  it('initial phase is "normal"', () => {
    const boss = makeBoss()
    expect(boss.phase).toBe('normal')
  })

  it('starts as not warning', () => {
    const boss = makeBoss()
    expect(boss.isWarning).toBe(false)
    expect(boss.warningType).toBe('')
  })
})

// ─── Phase transitions ──────────────────────────────────────────────

describe('Boss phases', () => {
  it('enters enrage at 50% HP (exactly 0.5)', () => {
    const boss = makeBoss()
    boss.state.stats.hp = 30 // 30/60 = 0.5
    boss.checkPhases()
    expect(boss.phase).toBe('enrage')
  })

  it('stays normal when HP is above 50%', () => {
    const boss = makeBoss()
    boss.state.stats.hp = 31
    boss.checkPhases()
    expect(boss.phase).toBe('normal')
  })

  it('stays normal at 75% HP', () => {
    const boss = makeBoss()
    boss.state.stats.hp = 45
    boss.checkPhases()
    expect(boss.phase).toBe('normal')
  })

  it('transitions normal → enrage → desperate through HP drops', () => {
    const boss = makeBoss()
    expect(boss.phase).toBe('normal')

    boss.state.stats.hp = 30 // 50%
    boss.checkPhases()
    expect(boss.phase).toBe('enrage')

    boss.state.stats.hp = 15 // 25%
    boss.checkPhases()
    expect(boss.phase).toBe('desperate')
  })

  it('enters enrage phase changes crown color and stats', () => {
    const boss = makeBoss()
    boss.state.stats.hp = 30
    boss.checkPhases()

    expect(boss.phase).toBe('enrage')
    expect(boss.state.stats.aggroRange).toBe(15) // was 12
    expect(boss.state.stats.chaseSpeed).toBeCloseTo(2.6, 4) // was 2.0
  })

  it('enters desperate phase doubles damage and starts summoning', () => {
    const boss = makeBoss()
    // Must go through enrage first
    boss.state.stats.hp = 30
    boss.checkPhases()
    expect(boss.phase).toBe('enrage')

    boss.state.stats.hp = 15 // 25%
    boss.checkPhases()
    expect(boss.phase).toBe('desperate')
    expect(boss.state.stats.damage).toBe(16) // double from 8
    expect(boss.summonTimer).toBe(0) // reset for summoning
  })

  it('enrage phase reduces fireball cooldown', () => {
    const boss = makeBoss()
    expect(boss['fireballCooldown']).toBe(3.0)

    boss.state.stats.hp = 30
    boss.checkPhases()
    expect(boss['fireballCooldown']).toBe(2.0)
  })

  it('enrage phase reduces slam cooldown', () => {
    const boss = makeBoss()
    expect(boss['slamCooldown']).toBe(5.0)

    boss.state.stats.hp = 30
    boss.checkPhases()
    expect(boss['slamCooldown']).toBeCloseTo(3.5, 4)
  })

  it('desperate phase sets crown emissive intensity to 1.5', () => {
    const boss = makeBoss()
    boss.state.stats.hp = 30
    boss.checkPhases() // enrage first
    expect(boss.phase).toBe('enrage')

    boss.state.stats.hp = 15 // 25%
    boss.checkPhases() // now desperate
    const mat = boss.crownMesh.material as THREE.MeshStandardMaterial
    expect(mat.emissiveIntensity).toBeCloseTo(1.5, 1)
  })

  it('enrage phase sets crown emissive intensity to 1.0', () => {
    const boss = makeBoss()
    boss.state.stats.hp = 30
    boss.checkPhases()

    const mat = boss.crownMesh.material as THREE.MeshStandardMaterial
    expect(mat.emissiveIntensity).toBeCloseTo(1.0, 1)
  })

  it('crown color changes: gold → red → dark red', () => {
    const boss = makeBoss()
    let mat = boss.crownMesh.material as THREE.MeshStandardMaterial
    expect(mat.color.getHex()).toBe(0xff9944) // initial gold

    boss.state.stats.hp = 30
    boss.checkPhases() // enrage
    mat = boss.crownMesh.material as THREE.MeshStandardMaterial
    expect(mat.color.getHex()).toBe(0xcc0000) // red

    boss.state.stats.hp = 15
    boss.checkPhases() // desperate
    mat = boss.crownMesh.material as THREE.MeshStandardMaterial
    expect(mat.color.getHex()).toBe(0x880000) // dark red
  })

  it('bossAttack checks phases periodically', () => {
    const boss = makeBoss()
    boss.state.stats.hp = 30 // 50% — should trigger enrage
    for (let i = 0; i < 5; i++) {
      boss.bossAttack(0.1, 5, 5, 0)
    }
    expect(boss.phase).toBe('enrage')
  })

  it('cannot reach desperate without going through enrage first', () => {
    const boss = makeBoss()
    // Set HP directly to 25% — but checkPhases can only transition
    // from current phase, so from normal it checks normal→enrage
    // which requires hp <= 0.5 && hp > 0.25 — 0.25 is NOT > 0.25
    boss.state.stats.hp = 15
    boss.checkPhases()
    expect(boss.phase).toBe('normal') // stays normal (boundary condition)
  })
})

// ─── Fireball attacks ───────────────────────────────────────────────

describe('Boss fireball attacks', () => {
  it('castFireball creates a projectile in the scene', () => {
    const boss = makeBoss()
    boss.castFireball(5, 5)
    expect(boss.fireballs.length).toBe(1)
    expect(boss.fireballs[0].mesh).toBeTruthy()
    expect(mock.scene.children.length).toBeGreaterThan(0)
  })

  it('fireball damage scales with phase (normal = 5)', () => {
    const boss = makeBoss()
    boss.castFireball(5, 5)
    expect(boss.fireballs[0].damage).toBe(5)
  })

  it('fireball damage scales with phase (enrage = 6)', () => {
    const boss = makeBoss()
    boss.state.stats.hp = 30
    boss.checkPhases()
    boss.castFireball(5, 5)
    expect(boss.fireballs[0].damage).toBe(6)
  })

  it('fireball damage scales with phase (desperate = 8)', () => {
    const boss = makeBoss()
    boss.state.stats.hp = 30
    boss.checkPhases() // enrage
    boss.state.stats.hp = 15
    boss.checkPhases() // desperate
    boss.castFireball(5, 5)
    expect(boss.fireballs[0].damage).toBe(8)
  })

  it('fireball velocity points toward target', () => {
    const boss = makeBoss()
    boss.position.set(0, 0, 0)
    boss.castFireball(3, 4)
    const fb = boss.fireballs[0]
    // Velocity should be normalized toward (3, 4) with speed 5
    const expectedLen = Math.sqrt(3 * 3 + 4 * 4)
    expect(fb.velocity.x).toBeCloseTo((3 / expectedLen) * 5, 2)
    expect(fb.velocity.z).toBeCloseTo((4 / expectedLen) * 5, 2)
  })

  it('fireball mesh is positioned at boss location + height 2.0', () => {
    const boss = makeBoss()
    boss.position.set(1, 0, 2)
    boss.castFireball(5, 6)
    expect(boss.fireballs[0].mesh.position.x).toBeCloseTo(1, 2)
    expect(boss.fireballs[0].mesh.position.y).toBeCloseTo(2.0, 2)
    expect(boss.fireballs[0].mesh.position.z).toBeCloseTo(2, 2)
  })

  it('fireball life is 4.0 seconds', () => {
    const boss = makeBoss()
    boss.castFireball(5, 5)
    expect(boss.fireballs[0].life).toBe(4.0)
  })

  it('castFireball does nothing when player is at same position', () => {
    const boss = makeBoss()
    boss.position.set(0, 0, 0)
    boss.castFireball(0, 0)
    expect(boss.fireballs.length).toBe(0)
  })
})

// ─── Ground slam attacks ────────────────────────────────────────────

describe('Boss ground slam', () => {
  it('castGroundSlam creates a slam zone in the scene', () => {
    const boss = makeBoss()
    boss.castGroundSlam()
    expect(boss.slamZones.length).toBe(1)
    expect(boss.slamZones[0].mesh).toBeTruthy()
    expect(mock.scene.children.length).toBeGreaterThan(0)
  })

  it('slam damage scales with phase (normal = 6)', () => {
    const boss = makeBoss()
    boss.castGroundSlam()
    expect(boss.slamZones[0].damage).toBe(6)
  })

  it('slam damage scales with phase (enrage = 8)', () => {
    const boss = makeBoss()
    boss.state.stats.hp = 30
    boss.checkPhases()
    boss.castGroundSlam()
    expect(boss.slamZones[0].damage).toBe(8)
  })

  it('slam damage scales with phase (desperate = 10)', () => {
    const boss = makeBoss()
    boss.state.stats.hp = 30
    boss.checkPhases() // enrage
    boss.state.stats.hp = 15
    boss.checkPhases() // desperate
    boss.castGroundSlam()
    expect(boss.slamZones[0].damage).toBe(10)
  })

  it('slam zone has radius of 3.0', () => {
    const boss = makeBoss()
    boss.castGroundSlam()
    expect(boss.slamZones[0].radius).toBe(3.0)
  })

  it('slam zone has maxLife of 1.0', () => {
    const boss = makeBoss()
    boss.castGroundSlam()
    expect(boss.slamZones[0].maxLife).toBe(1.0)
  })

  it('castGroundSlam raises boss body visual elements', () => {
    const boss = makeBoss()

    boss.castGroundSlam()

    expect(boss.bodyMesh.position.y).toBeCloseTo(1.2, 2)
    expect(boss.headMesh.position.y).toBeCloseTo(2.4, 2)
    expect(boss.crownMesh.position.y).toBeCloseTo(2.8, 2)
  })

  it('slam ring is positioned at boss feet', () => {
    const boss = makeBoss()
    boss.position.set(1, 0, 2)
    boss.castGroundSlam()
    expect(boss.slamZones[0].mesh.position.x).toBeCloseTo(1, 2)
    expect(boss.slamZones[0].mesh.position.z).toBeCloseTo(2, 2)
    expect(boss.slamZones[0].mesh.position.y).toBeCloseTo(0.02, 2)
  })
})

// ─── Minion summoning ───────────────────────────────────────────────

describe('Boss minion summoning', () => {
  it('sets summon warning when timer is ready in desperate mode', () => {
    const boss = makeBoss()
    boss.state.stats.hp = 30
    boss.checkPhases() // enrage
    boss.state.stats.hp = 15
    boss.checkPhases() // desperate
    boss.summonTimer = boss.summonCooldown // ready
    boss.bossAttack(0.1, 0, 0, 0)
    expect(boss.isWarning).toBe(true)
    expect(boss.warningType).toBe('summon')
  })

  it('does not summon when not in desperate mode', () => {
    const boss = makeBoss()
    expect(boss.phase).toBe('normal')
    boss.summonTimer = boss.summonCooldown
    boss.bossAttack(0.1, 0, 0, 0)
    expect(boss.isWarning).toBe(false)
  })

  it('does not summon when summon timer is not ready', () => {
    const boss = makeBoss()
    boss.state.stats.hp = 15
    boss.checkPhases() // desperate
    boss.summonTimer = 0 // not ready yet
    boss.bossAttack(0.1, 0, 0, 0)
    expect(boss.spawnEffects.length).toBe(0)
    expect(boss.isWarning).toBe(false)
  })

  it('summonTimer advances during bossAttack in desperate mode', () => {
    const boss = makeBoss()
    boss.state.stats.hp = 30
    boss.checkPhases() // enrage
    boss.state.stats.hp = 15
    boss.checkPhases() // desperate
    boss.summonTimer = 0
    boss.bossAttack(0.3, 0, 0, 0)
    expect(boss.summonTimer).toBeCloseTo(0.3, 4)
  })

  it('summonTimer does not advance in normal mode', () => {
    const boss = makeBoss()
    boss.summonTimer = 0
    boss.bossAttack(0.3, 0, 0, 0)
    expect(boss.summonTimer).toBe(0)
  })
})

// ─── Boss movement and attack behavior ──────────────────────────────

describe('Boss attack behavior', () => {
  it('moves toward player when in aggro range', () => {
    const boss = makeBoss()
    boss.position.set(0, 0, 0)
    boss.bossAttack(1.0, 5, 5, 0) // player at (5, 5)
    expect(boss.position.x).toBeGreaterThan(0) // moved right
    expect(boss.position.z).toBeGreaterThan(0) // moved forward
  })

  it('does not move when too close to player (within 1.5)', () => {
    const boss = makeBoss()
    boss.position.set(0, 0, 0)
    boss.bossAttack(1.0, 1.0, 0, 0) // player within 1.5 units
    expect(boss.position.x).toBe(0) // no movement
  })

  it('does not move when out of aggro range', () => {
    const boss = makeBoss()
    boss.position.set(0, 0, 0)
    boss.bossAttack(1.0, 20, 20, 0) // player far away (range = 12)
    expect(boss.position.x).toBe(0) // no movement
  })

  it('does not move when player is at exact same position', () => {
    const boss = makeBoss()
    boss.position.set(0, 0, 0)
    boss.bossAttack(1.0, 0, 0, 0)
    expect(boss.position.x).toBe(0)
  })

  it('advances fireball timer toward cooldown', () => {
    const boss = makeBoss()
    const initialTimer = boss['fireballTimer']
    boss.bossAttack(0.5, 5, 5, 0)
    // Timer should be 0.5 (below 3.0s cooldown, no reset)
    expect(boss['fireballTimer']).toBeCloseTo(initialTimer + 0.5, 4)
  })

  it('advances slam timer toward cooldown', () => {
    const boss = makeBoss()
    const initialTimer = boss['slamTimer']
    boss.bossAttack(0.5, 5, 5, 0)
    // Timer should be 0.5 (below 5.0s cooldown, no reset)
    expect(boss['slamTimer']).toBeCloseTo(initialTimer + 0.5, 4)
  })

  it('phaseTimer increments and resets at 0.5s threshold', () => {
    const boss = makeBoss()
    boss.bossAttack(0.25, 5, 5, 0)
    expect(boss['phaseTimer']).toBeCloseTo(0.25, 4)

    boss.bossAttack(0.3, 5, 5, 0)
    // 0.25 + 0.3 = 0.55 >= 0.5 → resets to 0
    expect(boss['phaseTimer']).toBe(0)
  })

  it('sets fireball warning when fireball timer is near cooldown', () => {
    const boss = makeBoss()
    boss['fireballTimer'] = boss['fireballCooldown'] - 0.1
    boss.bossAttack(0.1, 5, 5, 0)
    expect(boss.isWarning).toBe(true)
    expect(boss.warningType).toBe('fireball')
  })

  it('sets slam warning when slam timer is near cooldown', () => {
    const boss = makeBoss()
    boss['slamTimer'] = boss['slamCooldown'] - 0.1
    boss.bossAttack(0.1, 5, 5, 0)
    expect(boss.isWarning).toBe(true)
    expect(boss.warningType).toBe('slam')
  })
})

// ─── Boss cleanup ───────────────────────────────────────────────────

describe('Boss cleanup', () => {
  it('cleanup removes fireball meshes from scene', () => {
    const boss = makeBoss()
    boss.castFireball(5, 5)
    boss.castFireball(5, 5)
    expect(mock.scene.children.length).toBeGreaterThan(0)

    boss.cleanup()
    expect(boss.fireballs.length).toBe(0)
  })

  it('cleanup removes slam zone meshes from scene', () => {
    const boss = makeBoss()
    boss.castGroundSlam()
    const childCountBefore = mock.scene.children.length
    expect(childCountBefore).toBeGreaterThan(0)

    boss.cleanup()
    expect(boss.slamZones.length).toBe(0)
  })

  it('fireball projectile is removed after life expires', () => {
    const boss = makeBoss()
    boss.castFireball(5, 5)
    expect(boss.fireballs.length).toBe(1)

    // Simulate 4+ seconds passing (fireball life = 4.0)
    boss.bossAttack(4.1, 5, 5, 0)
    expect(boss.fireballs.length).toBe(0)
  })

  it('slam zone is removed after life expires', () => {
    const boss = makeBoss()
    boss.castGroundSlam()
    expect(boss.slamZones.length).toBe(1)

    // Simulate 1+ seconds passing (slam maxLife = 1.0)
    boss.bossAttack(1.1, 5, 5, 0)
    expect(boss.slamZones.length).toBe(0)
  })
})

// ─── Warning system ─────────────────────────────────────────────────

describe('Boss warning system', () => {
  it('sets fireball warning when timer is within 0.5s of cooldown', () => {
    const boss = makeBoss()
    boss.fireballTimer = boss['fireballCooldown'] - 0.1
    boss.bossAttack(0.1, 5, 5, 0)
    expect(boss.isWarning).toBe(true)
    expect(boss.warningType).toBe('fireball')
  })

  it('sets slam warning when timer is within 0.5s of cooldown', () => {
    const boss = makeBoss()
    boss.slamTimer = boss['slamCooldown'] - 0.1
    boss.bossAttack(0.1, 5, 5, 0)
    expect(boss.isWarning).toBe(true)
    expect(boss.warningType).toBe('slam')
  })

  it('raises body during slam warning', () => {
    const boss = makeBoss()
    const bodyYBefore = boss.bodyMesh.position.y

    boss.slamTimer = boss['slamCooldown'] - 0.1
    boss.bossAttack(0.1, 5, 5, 0)

    // Body should be lifted during warning
    expect(boss.bodyMesh.position.y).toBeGreaterThan(bodyYBefore)
  })

  it('clears warning after warningTimer expires', () => {
    const boss = makeBoss()
    boss.isWarning = true
    boss.warningType = 'fireball'
    boss.warningTimer = 0.5

    boss.bossAttack(0.6, 5, 5, 0)
    expect(boss.isWarning).toBe(false)
    expect(boss.warningType).toBe('')
  })

  it('does not set warning when timers are far from cooldown', () => {
    const boss = makeBoss()
    boss.fireballTimer = 0.0
    boss.slamTimer = 0.0
    boss.bossAttack(0.1, 5, 5, 0)
    expect(boss.isWarning).toBe(false)
  })

  it('warningTimer decreases each bossAttack call', () => {
    const boss = makeBoss()
    boss.isWarning = true
    boss.warningType = 'slam'
    boss.warningTimer = 2.0

    boss.bossAttack(0.5, 5, 5, 0)
    expect(boss.warningTimer).toBeCloseTo(1.5, 4)

    boss.bossAttack(0.3, 5, 5, 0)
    expect(boss.warningTimer).toBeCloseTo(1.2, 4)
  })
})

// ─── Crown glow ─────────────────────────────────────────────────────

describe('Boss crown glow', () => {
  it('crown glow pulses normally during idle', () => {
    const boss = makeBoss()
    boss.walkTime = 0

    boss.bossAttack(0.1, 5, 5, 0)

    const mat = boss.crownMesh.material as THREE.MeshStandardMaterial
    // Normal glow: 0.5 + sin(0 * 3) * 0.3 = 0.5
    expect(mat.emissiveIntensity).toBeCloseTo(0.5, 1)
  })

  it('bossAttack glow formula always uses warning-based pulse, not phase intensity', () => {
    const boss = makeBoss()
    boss.walkTime = 0
    boss.state.stats.hp = 30
    boss.checkPhases() // enrage (sets emissiveIntensity = 1.0)

    boss.bossAttack(0.1, 5, 5, 0) // but bossAttack overwrites with formula

    const mat = boss.crownMesh.material as THREE.MeshStandardMaterial
    // bossAttack uses: isWarning ? ... : 0.5 + sin(walkTime*3)*0.3 = 0.5
    expect(mat.emissiveIntensity).toBeCloseTo(0.5, 1)
  })

  it('desperate glow formula overwrites phase-set intensity', () => {
    const boss = makeBoss()
    boss.walkTime = 0
    boss.state.stats.hp = 30
    boss.checkPhases() // enrage
    boss.state.stats.hp = 15
    boss.checkPhases() // desperate (sets emissiveIntensity = 1.5)

    boss.bossAttack(0.1, 5, 5, 0) // bossAttack overwrites

    const mat = boss.crownMesh.material as THREE.MeshStandardMaterial
    // bossAttack formula: 0.5 + sin(0 * 3) * 0.3 = 0.5
    expect(mat.emissiveIntensity).toBeCloseTo(0.5, 1)
  })

  it('walkTime does not increment during bossAttack (uses MobKit.update for that)', () => {
    const boss = makeBoss()
    boss.walkTime = 0
    boss.bossAttack(0.5, 5, 5, 0)
    expect(boss.walkTime).toBe(0) // bossAttack doesn't call super.update
  })

  it('crown glow uses walkTime for pulsing even when walkTime is static', () => {
    const boss = makeBoss()
    boss.walkTime = 0
    boss.bossAttack(0.1, 5, 5, 0)

    const mat = boss.crownMesh.material as THREE.MeshStandardMaterial
    // sin(0) = 0, so normal glow = 0.5 + 0 = 0.5
    expect(mat.emissiveIntensity).toBeCloseTo(0.5, 1)
  })

  it('enterPhase sets emissiveIntensity on phase transition (before bossAttack overwrites)', () => {
    const boss = makeBoss()
    let mat = boss.crownMesh.material as THREE.MeshStandardMaterial
    // Normal phase default
    expect(mat.emissiveIntensity).toBeCloseTo(0.5, 1) // from buildMesh or initial

    boss.state.stats.hp = 30
    boss.checkPhases() // enrage — enterPhase sets 1.0
    mat = boss.crownMesh.material as THREE.MeshStandardMaterial
    expect(mat.emissiveIntensity).toBeCloseTo(1.0, 1)

    boss.state.stats.hp = 15
    boss.checkPhases() // desperate — enterPhase sets 1.5
    mat = boss.crownMesh.material as THREE.MeshStandardMaterial
    expect(mat.emissiveIntensity).toBeCloseTo(1.5, 1)
  })
})

// ─── Mesh integrity ─────────────────────────────────────────────────

describe('Boss mesh build', () => {
  it('buildMesh creates all expected body parts', () => {
    const boss = makeBoss()
    expect(boss.bodyMesh).toBeTruthy()
    expect(boss.headMesh).toBeTruthy()
    expect(boss.crownMesh).toBeTruthy()
    expect(boss.cloakMesh).toBeTruthy()
    expect(boss.leftEyeMesh).toBeTruthy()
  })

  it('body mesh has correct rest position', () => {
    const boss = makeBoss()
    expect(boss.bodyMesh.position.y).toBeCloseTo(0.9, 2)
  })

  it('head mesh has correct rest position', () => {
    const boss = makeBoss()
    expect(boss.headMesh.position.y).toBeCloseTo(2.1, 2)
  })

  it('crown mesh has correct rest position', () => {
    const boss = makeBoss()
    expect(boss.crownMesh.position.y).toBeCloseTo(2.5, 2)
  })

  it('cloak mesh has correct rest position', () => {
    const boss = makeBoss()
    expect(boss.cloakMesh.position.y).toBeCloseTo(0.4, 2)
  })

  it('left eye mesh has correct position', () => {
    const boss = makeBoss()
    expect(boss.leftEyeMesh.position.x).toBeCloseTo(-0.1, 2)
    expect(boss.leftEyeMesh.position.y).toBeCloseTo(2.15, 2)
    expect(boss.leftEyeMesh.position.z).toBeCloseTo(0.25, 2)
  })

  it('body mesh is added to main boss mesh', () => {
    const boss = makeBoss()
    expect(boss.bodyMesh.parent).toBe(boss.mesh)
  })

  it('head mesh is added to main boss mesh', () => {
    const boss = makeBoss()
    expect(boss.headMesh.parent).toBe(boss.mesh)
  })
})

// ─── Edge cases ─────────────────────────────────────────────────────

describe('Boss edge cases', () => {
  it('bossAttack does nothing when boss is dead', () => {
    const boss = makeBoss()
    boss.state.alive = false
    boss.position.set(0, 0, 0)
    boss.bossAttack(1.0, 5, 5, 0)
    expect(boss.position.x).toBe(0)
    expect(boss.fireballs.length).toBe(0)
  })

  it('multiple fireballs can be active simultaneously', () => {
    const boss = makeBoss()
    boss.castFireball(3, 4)
    boss.castFireball(5, 0)
    boss.castFireball(0, 5)
    expect(boss.fireballs.length).toBe(3)
  })

  it('multiple slam zones can be active simultaneously', () => {
    const boss = makeBoss()
    boss.castGroundSlam()
    boss.castGroundSlam()
    expect(boss.slamZones.length).toBe(2)
  })

  it('hpPercent handles zero HP', () => {
    const boss = makeBoss()
    boss.state.stats.hp = 0
    expect(boss.hpPercent()).toBe(0)
  })

  it('hpPercent handles HP exceeding max (theoretical)', () => {
    const boss = makeBoss()
    boss.state.stats.hp = 120
    expect(boss.hpPercent()).toBeCloseTo(2.0, 4)
  })
})
