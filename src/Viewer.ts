import * as THREE from 'three'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {sceneOptions} from "./SceneOptions";
import {Group} from "three";

export class Viewer {
    private readonly scene: THREE.Scene
    private readonly camera: THREE.PerspectiveCamera
    private renderer: THREE.WebGLRenderer
    private controls: OrbitControls

    constructor(private options: typeof sceneOptions) {
        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000)
        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        })
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)

        this.init()
    }
    public addMesh (mesh: THREE.Mesh) {
        this.scene.add(mesh)
    }

    public addMesh_(mesh: Group) {
        this.scene.add(mesh)
    }

    public setSettings(){
        this.scene.traverse((object) => {
            if ((object as THREE.Mesh).isMesh) {
                const mesh = object as THREE.Mesh;

                // example: enable wireframe
                // @ts-ignore
                (mesh.material as THREE.Material).wireframe = true;
            }
        });
    }

    private init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.camera.position.set(5, 5, 5)
        this.controls.update()

        this.scene.background = new THREE.Color(this.options.renderer.backgroundColor)
        document.getElementById('app')?.appendChild(this.renderer.domElement)
        this.renderer.setAnimationLoop(this.animate)
    }
    private animate = (time: number) => {
        this.renderer.render(this.scene, this.camera)
    }
}