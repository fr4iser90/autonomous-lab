// Renderer: Three.js scene management for VoxelCraft
// Creates the WebGL canvas, camera, lighting, and procedural texture atlas

import * as THREE from 'three'
import { TextureAtlas } from './TextureAtlas'

export class Renderer {
  private renderer: THREE.WebGLRenderer
  public scene: THREE.Scene
  public camera: THREE.PerspectiveCamera
  private canvas: HTMLCanvasElement
  private readonly atlas: TextureAtlas
  private ambientLight: THREE.AmbientLight
  private sunLight: THREE.DirectionalLight

  constructor(canvas: HTMLCanvasElement, seed: number = 42) {
    this.canvas = canvas

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(canvas.width, canvas.height)
    this.renderer.setClearColor(0x87CEEB) // Sky blue

    this.scene = new THREE.Scene()
    this.scene.fog = new THREE.Fog(0x87CEEB, 60, 100)

    this.camera = new THREE.PerspectiveCamera(70, canvas.width / canvas.height, 0.1, 200)
    this.camera.position.set(0, 60, 0)
    this.camera.lookAt(0, 0, 0)

    // Ambient light
    this.ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    this.scene.add(this.ambientLight)

    // Directional light (sun)
    this.sunLight = new THREE.DirectionalLight(0xffffff, 0.8)
    this.sunLight.position.set(50, 100, 50)
    this.scene.add(this.sunLight)

    // Create procedural texture atlas
    this.atlas = new TextureAtlas(seed)
  }

  /** Get the procedural texture atlas */
  get textureAtlas(): TextureAtlas {
    return this.atlas
  }

  get canvasElement(): HTMLCanvasElement {
    return this.canvas
  }

  setSize(width: number, height: number): void {
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  render(): void {
    this.renderer.render(this.scene, this.camera)
  }

  /** Update sky color, fog, and lighting based on time of day */
  updateLighting(skyColor: [number, number, number], ambientBrightness: number): void {
    const hex = (skyColor[0] << 16) | (skyColor[1] << 8) | skyColor[2]
    this.renderer.setClearColor(hex)
    this.scene.fog = new THREE.Fog(hex, 60, 100)
    this.ambientLight.intensity = 0.3 + ambientBrightness * 0.7
  }

  resize(canvas: HTMLCanvasElement): void {
    const rect = canvas.getBoundingClientRect()
    this.setSize(Math.floor(rect.width), Math.floor(rect.height))
  }

  dispose(): void {
    this.atlas.dispose()
    this.renderer.dispose()
  }
}
