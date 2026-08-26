// Renderer: Three.js scene management for VoxelCraft
// Creates the WebGL canvas, camera, and basic lighting

import * as THREE from 'three'

export class Renderer {
  private renderer: THREE.WebGLRenderer
  public scene: THREE.Scene
  public camera: THREE.PerspectiveCamera
  private canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement) {
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
    const ambient = new THREE.AmbientLight(0x404040, 0.6)
    this.scene.add(ambient)

    // Directional light (sun)
    const sun = new THREE.DirectionalLight(0xffffff, 0.8)
    sun.position.set(50, 100, 50)
    this.scene.add(sun)
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

  resize(canvas: HTMLCanvasElement): void {
    const rect = canvas.getBoundingClientRect()
    this.setSize(Math.floor(rect.width), Math.floor(rect.height))
  }

  dispose(): void {
    this.renderer.dispose()
  }
}
