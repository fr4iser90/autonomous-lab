/**
 * GameRenderer — owns the WebGL scene, lights, fog, and camera.
 * M2: Three.js bootstrap with fog, hemisphere + torch lights, ground plane.
 */
import * as THREE from 'three'
import { torchIntensity, TORCH_BASE_INTENSITY, ambientIntensity } from '../utils/lighting.js'

export interface RendererConfig {
  canvas: HTMLCanvasElement
  width: number
  height: number
  // Palette
  bgColor: string
  fogColor: string
  floorColor: string
  wallColor: string
  wallHighlightColor: string
  torchEmissive: string
}

export class GameRenderer {
  readonly scene: THREE.Scene
  readonly camera: THREE.PerspectiveCamera
  readonly renderer: THREE.WebGLRenderer
  private readonly clock = new THREE.Clock()

  // Lights
  readonly hemiLight: THREE.HemisphereLight
  readonly torchLights: THREE.PointLight[] = []

  // Objects
  readonly ground: THREE.Mesh
  readonly wallGroup = new THREE.Group()

  // Instanced meshes (performance optimization — replaces individual tile meshes)
  floorMesh: THREE.InstancedMesh | null = null
  wallMesh: THREE.InstancedMesh | null = null
  wallHighlightMesh: THREE.InstancedMesh | null = null

  // Public color accessors (for InstancedMesh creation)
  get wallColor(): string { return this.config.wallColor }
  get wallHighlightColor(): string { return this.config.wallHighlightColor }

  // Config
  private readonly config: RendererConfig

  constructor(config: RendererConfig) {
    this.config = config
    this.scene = new THREE.Scene()

    // Fog — cold ash atmosphere (expanded for better visibility)
    this.scene.fog = new THREE.Fog(config.fogColor, 20, 50)

    // Background
    this.scene.background = new THREE.Color(config.bgColor)

    // Camera
    this.camera = new THREE.PerspectiveCamera(55, config.width / config.height, 0.1, 100)
    this.camera.position.set(0, 8, 12)
    this.camera.lookAt(0, 0, 0)

    // WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas: config.canvas, antialias: true })
    this.renderer.setSize(config.width, config.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Shadow maps require depth textures — may be unavailable in headless CI
    const gl = config.canvas.getContext('webgl2') as WebGL2RenderingContext | null
    const hasDepth = gl ? !!gl.getExtension('WEBGL_depth_texture') : false
    this.renderer.shadowMap.enabled = hasDepth
    if (hasDepth) this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.2

    // Hemisphere light (ambient fill)
    this.hemiLight = new THREE.HemisphereLight(0x668899, 0x333344, 1.1)
    this.scene.add(this.hemiLight)

    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(60, 60)
    const groundMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.floorColor),
      roughness: 0.95,
      metalness: 0.05,
    })
    this.ground = new THREE.Mesh(groundGeo, groundMat)
    this.ground.rotation.x = -Math.PI / 2
    this.ground.receiveShadow = true
    this.scene.add(this.ground)

    // Wall group (will be populated by DungeonPCG)
    this.scene.add(this.wallGroup)

    // Torch point lights (stub — will be placed by PCG)
    this.addTorchLight(-5, 2.5, -5)
    this.addTorchLight(5, 2.5, 3)
    this.addTorchLight(0, 2.5, 8)
  }

  private addTorchLight(x: number, y: number, z: number): THREE.PointLight {
    const light = new THREE.PointLight(new THREE.Color(this.config.torchEmissive), 2.0, 20, 2)
    light.position.set(x, y, z)
    light.castShadow = false // Performance: shadows on point lights are expensive
    this.scene.add(light)
    this.torchLights.push(light)
    return light
  }

  /** Add a torch visual (emissive cylinder + point light) */
  addTorchVisual(x: number, z: number): { mesh: THREE.Mesh; light: THREE.PointLight } {
    // Torch pole
    const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6)
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x4a3520, roughness: 0.9 })
    const pole = new THREE.Mesh(poleGeo, poleMat)
    pole.position.set(x, 0.3, z)
    pole.castShadow = true

    // Torch flame (emissive)
    const flameGeo = new THREE.SphereGeometry(0.1, 6, 6)
    const flameMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.config.torchEmissive),
      emissive: new THREE.Color(this.config.torchEmissive),
      emissiveIntensity: 2.0,
    })
    const flame = new THREE.Mesh(flameGeo, flameMat)
    flame.position.set(x, 0.65, z)

    // Torch light
    const light = new THREE.PointLight(new THREE.Color(this.config.torchEmissive), 1.8, 18, 2)
    light.position.set(x, 0.7, z)

    const group = new THREE.Group()
    group.add(pole)
    group.add(flame)
    group.add(light)
    this.scene.add(group)

    this.torchLights.push(light)

    return { mesh: flame, light }
  }

  /** Add a wall block */
  addWallBlock(x: number, z: number, height: number = 2): THREE.Mesh {
    const wallGeo = new THREE.BoxGeometry(1, height, 1)
    const wallMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.config.wallColor),
      roughness: 0.95,
      metalness: 0.0,
    })
    const wall = new THREE.Mesh(wallGeo, wallMat)
    wall.position.set(x, height / 2, z)
    wall.castShadow = true
    wall.receiveShadow = true
    this.wallGroup.add(wall)
    return wall
  }

  /** Add a wall highlight (top edge — torchlit look) */
  addWallHighlight(x: number, z: number, height: number = 2): THREE.Mesh {
    const highlightGeo = new THREE.BoxGeometry(1.02, 0.05, 1.02)
    const highlightMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.config.wallHighlightColor),
      roughness: 0.7,
      metalness: 0.1,
    })
    const highlight = new THREE.Mesh(highlightGeo, highlightMat)
    highlight.position.set(x, height + 0.025, z)
    this.wallGroup.add(highlight)
    return highlight
  }

  /** Animate torch flicker — organic multi-frequency with draft bursts */
  updateTorchFlicker(time: number): void {
    for (let i = 0; i < this.torchLights.length; i++) {
      this.torchLights[i].intensity = TORCH_BASE_INTENSITY * torchIntensity(time, i)
    }
  }

  /** Set ambient hemisphere light intensity based on floor depth */
  setAmbientIntensity(floor: number): void {
    this.hemiLight.intensity = ambientIntensity(floor)
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  render(): void {
    this.renderer.render(this.scene, this.camera)
  }

  /** Get elapsed time from start */
  getElapsedTime(): number {
    return this.clock.getElapsedTime()
  }

  /** Clear all scene objects except ground, wallGroup, and lights (for floor transitions) */
  clearScene(): void {
    const lightIds = new Set(this.torchLights.map(l => l.uuid))
    const toRemove: THREE.Object3D[] = []
    this.scene.traverse((obj) => {
      if (obj !== this.ground && obj !== this.wallGroup && !lightIds.has(obj.uuid)) {
        toRemove.push(obj)
      }
    })
    toRemove.forEach(obj => this.scene.remove(obj))
    // Dispose geometries and materials
    toRemove.forEach(obj => {
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose()
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.dispose()
          }
        }
      })
    })
    // Dispose InstancedMesh objects
    for (const prop of [this.floorMesh, this.wallMesh, this.wallHighlightMesh]) {
      if (prop) {
        prop.geometry.dispose()
        ;(prop.material as THREE.Material).dispose()
        this.scene.remove(prop)
      }
    }
    this.floorMesh = null
    this.wallMesh = null
    this.wallHighlightMesh = null
  }

  /** Cleanup */
  dispose(): void {
    this.renderer.dispose()
    this.wallGroup.traverse((obj: THREE.Object3D) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose()
        if (obj.material instanceof THREE.MeshStandardMaterial) {
          // Single material
          obj.material.dispose()
        }
      }
    })
  }
}
