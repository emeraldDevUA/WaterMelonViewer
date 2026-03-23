import * as THREE from 'three'

import {sceneOptions} from "./SceneOptions";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {VertexNormalsHelper} from "three/examples/jsm/helpers/VertexNormalsHelper.js";
import {AxesHelper, GridHelper} from "three";

// import {Group} from "three";

type LightPosition = {
    x: number;
    y: number;
    z: number;
};

type DirectionalLightConfig = {
    color: number;
    intensity: number;
    castShadow: boolean;
    position: LightPosition;
};

type LightingConfig = {
    DirectionalLight?: DirectionalLightConfig | DirectionalLightConfig[];
};

export class Viewer {
    private readonly scene: THREE.Scene
    private readonly camera: THREE.PerspectiveCamera
    private readonly renderer: THREE.WebGLRenderer
    private controls: OrbitControls

    private gridHelper: THREE.GridHelper;
    private axesHelper: THREE.AxesHelper;
    private lighting_configurations: Array<THREE.Object3D> = [];

    private skyBox: THREE.CubeTexture;

    constructor(private options: typeof sceneOptions) {
        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000)
        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        })
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)

        this.init()
        window.addEventListener("resize", this.onWindowResize.bind(this));
    }

    public addMesh(mesh: THREE.Object3D) {
        this.scene.add(mesh)
    }

    public setSettings() {
        const debugContext = this.options.debug;

        this.scene.traverse((object) => {

            if ((object as THREE.Mesh).isMesh) {
                const mesh = object as THREE.Mesh;
                const meshData = mesh.userData;

                if (debugContext.normals.showVertexNormals) {

                    if (!meshData.normalHelper) {

                        const helper = new VertexNormalsHelper(
                            mesh,
                            debugContext.normals.size,
                            0x00ff00
                        );

                        this.scene.add(helper); // correct
                        meshData.normalHelper = helper;
                    }

                } else {
                    if (meshData.normalHelper) {

                        this.scene.remove(meshData.normalHelper);
                        meshData.normalHelper.dispose();
                        meshData.normalHelper = null;
                    }
                }

                // example: enable wireframe
                // @ts-ignore
                (mesh.material as THREE.Material).wireframe = debugContext.wireframe.enabled as boolean;
                if (debugContext.points.enabled) {

                    if (!meshData.pointsHelper) {

                        const material = new THREE.PointsMaterial({
                            color: 0xffffff,
                            size: 0.05
                        });

                        const helper = new THREE.Points(mesh.geometry, material);

                        mesh.add(helper); // attach to mesh
                        meshData.pointsHelper = helper;
                    }

                } else {

                    if (meshData.pointsHelper) {
                        mesh.remove(meshData.pointsHelper);
                        meshData.pointsHelper.material.dispose();
                        meshData.pointsHelper = null;
                    }

                }

            }
        });

        if (debugContext.grid.showGrid == true) {
            if (this.gridHelper == null) {
                this.gridHelper = new THREE.GridHelper(debugContext.grid.gridSize)
            }
            this.scene.add(this.gridHelper)
        } else {
            this.scene.remove(this.gridHelper)
        }

        if (debugContext.axes.showAxes == true) {
            if (this.axesHelper == null) {
                this.axesHelper = new THREE.AxesHelper(debugContext.axes.axisSize)
            }
            this.scene.add(this.axesHelper)
        } else {
            this.scene.remove(this.axesHelper)
        }

        if(this.options.renderer.skybox.enabled) {

            if(this.skyBox == null) {
                const loader = new THREE.CubeTextureLoader();
                this.skyBox = loader.load([
                    'res/SkyBox/pos_x.jpg', 'res/SkyBox/neg_x.jpg', // pos-x, neg-x
                    'res/SkyBox/pos_y.jpg', 'res/SkyBox/neg_y.jpg', // pos-y, neg-y
                    'res/SkyBox/pos_z.jpg', 'res/SkyBox/neg_z.jpg'  // pos-z, neg-z
                ]);
            }
            this.scene.background = this.skyBox;
            console.log(this.skyBox);
        }else {
            this.scene.background = new THREE.Color(this.options.renderer.backgroundColor)
        }

        for (const light of this.lighting_configurations) {
            this.scene.remove(light);
        }
        this.lighting_configurations.length = 0;

        this.parseLighting(this.options.lighting);
        this.lighting_configurations.forEach(configuration => {
            this.scene.add(configuration);
        })

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

    public setFog(fog: THREE.Fog | THREE.FogExp2 | null) {
        this.scene.fog = fog
    }

    private onWindowResize() {

        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }

    public getRender(){
        return this.renderer;
    }

    private parseLighting(lighting: LightingConfig): void {
        const dirLights = lighting.DirectionalLight
            ? Array.isArray(lighting.DirectionalLight)
                ? lighting.DirectionalLight
                : [lighting.DirectionalLight]
            : [];

        for (const config of dirLights) {
            const light = new THREE.DirectionalLight(config.color, config.intensity);
            light.position.set(config.position.x, config.position.y, config.position.z);
            light.castShadow = config.castShadow;
            this.lighting_configurations.push(light);

            if (this.options.lighting.showHelpers){
                const lightHelper = new THREE.DirectionalLightHelper(light, 5)
                this.lighting_configurations.push(lightHelper);
            }
        }
    }

    public updateGrid(){
        this.scene.remove(this.gridHelper)
        this.gridHelper = new GridHelper(this.options.debug.grid.gridSize);
    }

    public updateAxes() {
        this.scene.remove(this.axesHelper)
        this.axesHelper = new AxesHelper(this.options.debug.axes.axisSize);
    }
}