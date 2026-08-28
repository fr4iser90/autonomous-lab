/**
 * GameRenderer — owns the WebGL scene, lights, fog, and camera.
 * M2: Three.js bootstrap with fog, hemisphere + torch lights, ground plane.
 */
import * as THREE from 'three'

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

  // Config
  private readonly config: RendererConfig

  constructor(config: RendererConfig) {
    this.config = config
    this.scene = new THREE.Scene()

    // Fog — cold ash atmosphere
    this.scene.fog = new THREE.Fog(config.fogColor, 8, 25)

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
    this.renderer.toneMappingExposure = 0.8

    // Hemisphere light (ambient fill)
    this.hemiLight = new THREE.HemisphereLight(0x446688, 0x222233, 0.4)
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
    const light = new THREE.PointLight(new THREE.Color(this.config.torchEmissive), 1.5, 15, 2)
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
    const light = new THREE.PointLight(new THREE.Color(this.config.torchEmissive), 1.2, 12, 2)
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

  /** Animate torch flicker */
  updateTorchFlicker(time: number): void {
    for (let i = 0; i < this.torchLights.length; i++) {
      const light = this.torchLights[i]
      const flicker = 0.85 + 0.15 * Math.sin(time * 3 + i * 1.7) * Math.cos(time * 7 + i * 2.3)
      light.intensity = 1.2 * flicker
    }
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
