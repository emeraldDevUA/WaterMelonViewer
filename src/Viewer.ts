import * as THREE from 'three'

import {sceneOptions} from "./SceneOptions";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import { VertexNormalsHelper } from "three/examples/jsm/helpers/VertexNormalsHelper.js";
// import {Group} from "three";

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

    public addMesh (mesh: THREE.Object3D) {
        this.scene.add(mesh)
    }

    public setSettings(){
        this.scene.traverse((object) => {
            if ((object as THREE.Mesh).isMesh) {
                const mesh = object as THREE.Mesh;



                if (this.options.debug.normals.showVertexNormals) {

                    if (!mesh.userData.normalHelper) {

                        const helper = new VertexNormalsHelper(
                            mesh,
                            this.options.debug.normals.size,
                            0x00ff00
                        );

                        this.scene.add(helper);
                        mesh.userData.normalHelper = helper;
                    }
                }
                    // example: enable wireframe
                // @ts-ignore
                (mesh.material as THREE.Material).wireframe = this.options.debug.wireframe.enabled as boolean;
                if (this.options.debug.points.enabled) {

                    const material = new THREE.PointsMaterial({
                        color: 0xffffff,
                        size: 0.05
                    })

                    const pointHelper = new THREE.Points(mesh.geometry, material)

                    pointHelper.position.copy(mesh.position)
                    pointHelper.rotation.copy(mesh.rotation)
                    pointHelper.scale.copy(mesh.scale)

                    this.scene.add(pointHelper)
                }

            }
        });

        if(this.options.debug.grid.showGrid == true){
             const gridHelper = new THREE.GridHelper(this.options.debug.grid.gridSize)
             this.scene.add(gridHelper)
        }

        if(this.options.debug.axes.showAxes == true){
            const axesHelper = new THREE.AxesHelper(this.options.debug.axes.axisSize)
            this.scene.add(axesHelper)
        }

    }

    private init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight );
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

    public setFog(fog: THREE.Fog | THREE.FogExp2 | null) {
        this.scene.fog = fog
    }
}