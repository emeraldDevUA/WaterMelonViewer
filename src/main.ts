import * as THREE from 'three'
// import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
// import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js'
import {Viewer} from "./Viewer";
import {sceneOptions} from "./SceneOptions";
import {loadMesh, loadOBJ} from "./ModelAdapter";
import {getGeometryInfo} from "./MeshData";


///////////////// directional light /////////////////
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
// scene.add(directionalLight)
directionalLight.position.set(-30, 50, 0)
directionalLight.castShadow = true
directionalLight.shadow.camera.bottom = -30

///////////////// dr-light helper /////////////////
//scene.add(dLightHelper)

///////////////// dr-light shadow helper /////////////////
// const dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
// scene.add(dLightShadowHelper)


///////////////// spotlight /////////////////
// const spotLight = new THREE.SpotLight('#ffffff')
// scene.add(spotLight)
// spotLight.position.set(-100, 100, 0)
// spotLight.castShadow = true
// spotLight.angle = 0.2

///////////////// sLight helper /////////////////
// const sLightHelper = new THREE.SpotLightHelper(spotLight)
// scene.add(sLightHelper)


///////////////// fog /////////////////
// scene.fog = new THREE.Fog('#ffffff', 0, 200)
// scene.fog = new THREE.FogExp2('#ffffff', 0.01)


///////////////// texture loaders /////////////////
// const textureLoader = new THREE.TextureLoader()
// scene.background = textureLoader.load(img03)

// const cubeTextureLoader = new THREE.CubeTextureLoader()
// scene.background = cubeTextureLoader.load([img, img, img, img, img, img])

///////////////// renderer color settings /////////////////
// renderer.outputEncoding = THREE.sRGBEncoding
// renderer.toneMapping = THREE.ACESFilmicToneMapping
// renderer.toneMappingExposure = 1.5

///////////////// import 3d models /////////////////
let modelUrl: string;
let model: THREE.Object3D;
const viewer = new Viewer(sceneOptions);

const renderer = viewer.getRender();
const canvas = renderer.domElement; // ← this is the canvas

// viewer.setFog(new THREE.FogExp2('#ffffff', 0.01));
viewer.setSettings();


canvas.addEventListener('dragover', (e) => {
    e.preventDefault();
});


const MIME: Record<string, string> = {
    obj:  'text/plain',
    glb:  'model/gltf-binary',
    gltf: 'model/gltf+json',
    fbx:  'application/octet-stream',
    stl:  'application/octet-stream',
};
const DB_NAME = "fileDB";
const STORE_NAME = "files";

function openDB() {
    // @ts-ignore
    return new Promise((resolve:any, reject:any) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id" });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}
async function getFile() {
    // @ts-ignore
    const db = await openDB();
    // @ts-ignore
    return new Promise((resolve: any, reject: any) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);

        const request = store.get("droppedFile");

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// @ts-ignore
(async () => {
    console.log("STEP 1: start");

    const data = await getFile();
    console.log("STEP 2: got data", data);

    if (!data) return;

    const file = data.file;
    console.log("STEP 3: file ready", file);

    try {
        console.log("STEP 4: loading OBJ");

        const model = await loadOBJ(file);

        console.log("STEP 5: model loaded", model);

        model.scale.set(1, 1, 1);

        viewer.addMesh(model);

        console.log("STEP 6: added to viewer");
    } catch (err) {
        console.error("OBJ LOAD FAILED:", err);
    }
})();

// @ts-ignore
canvas.addEventListener('drop', async (e) => {
    e.preventDefault();
    const file = e.dataTransfer!.files[0];
    if (!file) return;
    modelUrl = URL.createObjectURL(file);
    console.log(modelUrl)
    //@ts-ignore
    model = await loadMesh(modelUrl, file.name, import.meta.url);
    viewer.addMesh(model);
    model.scale.set(1, 1, 1);
});



///////////////// gui /////////////////
// const gui = new dat.GUI();
// const options = {
//     color : 0x00ff00,
// }
// gui.addColor(options, 'color').onChange((e) => {
//     options.color = e.target.value;
// })
//
// gui.add(options, 'color').onChange((e) => {
//     options.color = e.target.value;
// })


///////////////// get mouse pos /////////////////
// const mousePosition = new THREE.Vector2()
// window.addEventListener('mousemove', (e) => {
//     mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1
//     mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1
// })



// const clock = new THREE.Clock()

// const animate = (time) => {
//     renderer.render(scene, camera)
// }
//
// renderer.setAnimationLoop(animate)
//
// window.addEventListener('resize', () => {
//     camera.aspect = window.innerWidth / window.innerHeight
//     camera.updateProjectionMatrix()
//     renderer.setSize(window.innerWidth, window.innerHeight)
// })


// @ts-ignore
let info: MeshInfo | GroupInfo;

const menu_button: HTMLElement = document.getElementById("main_menu")!;
const light_menu: HTMLElement = document.getElementById("light_menu")!;
const model_properties: HTMLElement = document.getElementById("model_properties")!;

const apply_setting_button: HTMLElement = document.getElementById("save")!;

const main_settings_container: HTMLElement = document.getElementById("settings_container")!;
const lighting_settings_container: HTMLElement = document.getElementById("lighting_container")!;
const model_properties_container: HTMLElement = document.getElementById("model_properties_container")!;

const vertex_button: HTMLElement = document.getElementById("vertices")!;
const edges_button: HTMLElement = document.getElementById("edges")!;
const normals_button: HTMLElement = document.getElementById("normals")!;

const light_config1: HTMLElement = document.getElementById("lighting_config1")!;
const light_config2: HTMLElement = document.getElementById("lighting_config2")!;
const light_config3: HTMLElement = document.getElementById("lighting_config3")!;
const light_config4: HTMLElement = document.getElementById("lighting_config4")!;
const light_config5: HTMLElement = document.getElementById("lighting_config5")!;
const lighting_config_buttons: HTMLElement[] = [light_config1, light_config2, light_config3, light_config4, light_config5];

const shadow_checkbox = document.getElementById("shadowsEnabled")! as HTMLInputElement;
const light_gizmo_checkbox = document.getElementById("showLightGizmo")! as HTMLInputElement;

const background_color: HTMLElement = document.getElementById("backgroundColor")!;

const showGridCheckbox = document.getElementById("showGrid")! as HTMLInputElement;
const gridSizeInput = document.getElementById("grid_size")!  as HTMLInputElement;
const showAxesCheckbox = document.getElementById("showAxes")! as HTMLInputElement;
const axesSizeInput = document.getElementById("axes_size")!  as HTMLInputElement;

const enableSkyBoxCheckbox = document.getElementById("enableSkyBox")! as HTMLInputElement;

const scene_div = document.getElementById("scene_elements")!;

background_color.addEventListener("input", (event) => {
    const hex = (event.target as HTMLInputElement).value;
    sceneOptions.renderer.backgroundColor = parseInt(hex.replace("#", ""), 16);
    viewer.setSettings();
});

menu_button.addEventListener("click", () => {
    menu_button.classList.toggle("active");
    main_settings_container.classList.toggle("hidden");

    const { meshNames, lightNames }= viewer.getSceneInfo();
    for (const meshName of meshNames) {
        let div = document.createElement("div");
        div.className = "scene_element";
        div.textContent = meshName;
        scene_div.append(div)
    }
    // @ts-ignore
    for (const lightName of lightNames) {
        let div = document.createElement("div");
        div.className = "scene_element";
        div.textContent = lightName;
        scene_div.append(div)
    }


});

const ui = {
    vertices: document.getElementById("vert_count")!,
    faces: document.getElementById("face_count")!,
    normals: document.getElementById("has_normals")!
};

model_properties.addEventListener("click", () => {
    model_properties_container.classList.toggle("hidden");
    function setProperties(vertexCount: number, faceCount: number, hasNormals: boolean) {
        ui.vertices.textContent = String(vertexCount);
        ui.faces.textContent = String(faceCount);
        ui.normals.textContent = String(hasNormals);
    }

    if ((model as THREE.Mesh).isMesh) {
        info = getGeometryInfo(model as THREE.Mesh);
        const { vertexCount, faceCount, hasNormals, boundingBox } = info;
        setProperties(vertexCount, faceCount, hasNormals);

    } else {
        info = getGeometryInfo(model as THREE.Group);
        const { totalVertices, totalFaces, meshCount } = info;
        setProperties(totalVertices, totalFaces, false);
    }
});


light_config1.addEventListener("click", () => {
    lighting_config_buttons.forEach(callback => {callback.classList.remove("active");});
    light_config1.classList.toggle("active");

    //Overcast / soft daylight
    //Flat, shadowless scene — overcast sky, indoor ambient, or neutral studio lighting.
    sceneOptions.lighting.DirectionalLight = [
        { color: 0xe8f0ff, intensity: 1.0, position: { x: 0,   y: 80, z: 20 }, castShadow: false },
        { color: 0xfff4e0, intensity: 0.4, position: { x: 0,   y: -20, z: 0 }, castShadow: false },
    ]
    viewer.setSettings(); // update your scene helpers
});

light_config2.addEventListener("click", () => {
    lighting_config_buttons.forEach(callback => {callback.classList.remove("active");});
    light_config2.classList.toggle("active");

    //Golden hour / sunset
    // Low, warm key light from one side with a deep blue-violet fill from the opposite horizon.
    sceneOptions.lighting.DirectionalLight = [
        { color: 0xff8c30, intensity: 1.2, position: { x: 60,  y: 10, z: -20 }, castShadow: true },
        { color: 0x3a3a7a, intensity: 0.35, position: { x: -60, y: 15, z:  20 }, castShadow: false },
    ]
    viewer.setSettings(); // update your scene helpers
});

light_config3.addEventListener("click", () => {
    lighting_config_buttons.forEach(callback => {callback.classList.remove("active");});
    light_config3.classList.toggle("active");

    //Night / moonlit
    // Dim, desaturated blue-white key with minimal fill — deep shadows, cool atmosphere.
    sceneOptions.lighting.DirectionalLight = [
        { color: 0xc8d8f8, intensity: 0.3, position: { x: -20, y: 60, z: 30 }, castShadow: true },
        { color: 0x101030, intensity: 0.1, position: { x:  20, y: -10, z: -10 }, castShadow: false },
    ]
    viewer.setSettings(); // update your scene helpers
});

light_config4.addEventListener("click", () => {
    lighting_config_buttons.forEach(callback => {callback.classList.remove("active");});
    light_config4.classList.toggle("active");

    //Three-point studio
    // Classic photography / product-shot rig: bright key, softer fill opposite, and a rim from behind to separate subject from background.
    sceneOptions.lighting.DirectionalLight = [
        { color: 0xffffff, intensity: 1.0, position: { x: -40, y: 50, z:  30 }, castShadow: true  },
        { color: 0xd0e8ff, intensity: 0.4, position: { x:  40, y: 30, z:  30 }, castShadow: false },
        { color: 0xffe8d0, intensity: 0.6, position: { x:   0, y: 20, z: -60 }, castShadow: false },
    ]
    viewer.setSettings(); // update your scene helpers
});

light_config5.addEventListener("click", () => {
    lighting_config_buttons.forEach(callback => {callback.classList.remove("active");});
    light_config5.classList.toggle("active");

    sceneOptions.lighting.DirectionalLight = [
        { color: 0xffffff, intensity: 0.8, position: {x:-30, y:50, z:0}, castShadow: true },
        { color: 0xff0000, intensity: 0.5, position: {x:30,  y:20, z:0}, castShadow: true },
    ]

    viewer.setSettings(); // update your scene helpers
});

light_menu.addEventListener("click", () => {
    light_menu.classList.toggle("active");
    lighting_settings_container.classList.toggle("hidden");
});

// Listen for changes
showGridCheckbox.addEventListener("change", () => {
    sceneOptions.debug.grid.showGrid = showGridCheckbox.checked;
    viewer.setSettings(); // update your scene helpers
});

gridSizeInput.addEventListener("change", () => {
    sceneOptions.debug.grid.gridSize = +gridSizeInput.value
    viewer.updateGrid();
    viewer.setSettings(); // update your scene helpers
});

showAxesCheckbox.addEventListener("change", () => {
    sceneOptions.debug.axes.showAxes = showAxesCheckbox.checked;
    viewer.setSettings(); // update your scene helpers
});

axesSizeInput.addEventListener("change", () => {
    sceneOptions.debug.axes.axisSize = +axesSizeInput.value
    viewer.updateAxes();
    viewer.setSettings(); // update your scene helpers
});

// apply_setting_button.addEventListener("click", () => {
//     viewer.setSettings();
// });

light_gizmo_checkbox.addEventListener("change", () => {
    sceneOptions.lighting.showHelpers = light_gizmo_checkbox.checked;
    viewer.setSettings(); // update your scene helpers
});

shadow_checkbox.addEventListener("change", () => {
});

enableSkyBoxCheckbox.addEventListener("change", () => {
    sceneOptions.renderer.skybox.enabled = enableSkyBoxCheckbox.checked;
    viewer.setSettings(); // update your scene helpers
});


vertex_button.addEventListener("click", () => {
    vertex_button.classList.toggle("active");
    sceneOptions.debug.points.enabled = !sceneOptions.debug.points.enabled;
    viewer.setSettings();
});

edges_button.addEventListener("click", () => {
    edges_button.classList.toggle("active");
    sceneOptions.debug.wireframe.enabled = !sceneOptions.debug.wireframe.enabled;
    viewer.setSettings();
});

normals_button.addEventListener("click", () => {
    normals_button.classList.toggle("active");
    sceneOptions.debug.normals.showVertexNormals = !sceneOptions.debug.normals.showVertexNormals;
    viewer.setSettings();
});