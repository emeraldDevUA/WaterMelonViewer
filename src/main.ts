import * as THREE from 'three'


import {Viewer} from "./Viewer";
import {getGeometryInfo} from "./MeshData";
import {sceneOptions} from "./SceneOptions";
import {getFile, removeFile} from "./db-calls/index-db"
import {loadMeshFromFile, LoadMeshFromIndexDB} from "./ModelAdapter";


// Used to upload the model as a blob
let modelUrl: string;
let model: THREE.Object3D;

// @ts-ignore
let info: MeshInfo | GroupInfo;

// is used to control file input overlay
let overlay: HTMLElement;

// the viewer itself
const viewer = new Viewer(sceneOptions);


function recenterMesh(mesh: THREE.Object3D): void {
    const box = new THREE.Box3().setFromObject(mesh)
    const center = new THREE.Vector3()
    box.getCenter(center)
    mesh.position.set(-center.x, -center.y, -center.z)
}

function showError(message: string) {
    overlay.style.display = 'grid';
    overlay.style.background = 'rgba(0, 0, 0, 0.5)';
    overlay.style.color = 'rgba(224, 92, 92, 0.6)'; // red tint on error
    overlay.textContent = `⚠ ${message}`;

    // reset back to idle after 3 seconds
    setTimeout(() => {
        overlay.textContent = 'Drop a file to get started';
        overlay.style.background = '';
        overlay.style.color = 'rgba(255, 255, 255, 0.3)';
    }, 2000);
}

function addOverflow() {
    const canvas =  viewer.getRender().domElement;
    const wrapper = document.createElement('div');

    wrapper.style.cssText = 'position: relative; width: 100%; height: 100%; z-index: 0';
    canvas.parentNode.insertBefore(wrapper, canvas);
    wrapper.appendChild(canvas);
    overlay = document.createElement('div');

    overlay.style.cssText = `
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    color: white;
    font-size: 2rem;
    pointer-events: none;
    border: 3px dashed rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    transition: background 0.2s, border-color 0.2s;`;

    overlay.textContent = 'Drop a file to get started';

    wrapper.appendChild(overlay);
    let leaveTimeout = 0;
    canvas.addEventListener('dragover', (e) => {
        e.preventDefault();
        clearTimeout(leaveTimeout);
        overlay.style.background = 'rgba(0, 0, 0, 0.5)';
        overlay.style.borderColor = 'rgba(255, 255, 255, 0.6)';
    });

    canvas.addEventListener('dragleave', () => {
        leaveTimeout = setTimeout(() => {
            overlay.style.background = '';
            overlay.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        }, 50);
    });


    // @ts-ignore
    canvas.addEventListener('drop', async (e) => {
        e.preventDefault();
        const file = e.dataTransfer!.files[0];
        if (!file) return;
        modelUrl = URL.createObjectURL(file);
        console.log(modelUrl)


        try {
            //@ts-ignore
            model = await loadMeshFromFile(modelUrl, file.name, import.meta.url);

            viewer.addMesh(model);
            model.position.set(0, 0, 0);
            model.scale.set(1, 1, 1);
            viewer.setSettings();

            overlay.style.display = 'none';
        } catch (err) {
            URL.revokeObjectURL(modelUrl); // clean up the blob URL on failure
            showError(err instanceof Error ? err.message : 'Failed to load model');
        }

        viewer.addMesh(model);

        model.position.set(0, 0, 0);
        model.scale.set(1, 1, 1);

        viewer.setSettings();
        overlay.style.display = 'none';
    });
}

// @ts-ignore
(async () => {
    console.log("STEP 1: start");

    const data = await getFile();
    console.log("STEP 2: got data", data);

    if (!data) {
        addOverflow();
        return;
    }

    const file = data.file;
    console.log("STEP 3: file ready", file);

    try {
        console.log("STEP 4: loading OBJ");

        const model = await LoadMeshFromIndexDB(file);

        console.log("STEP 5: model loaded", model);

        viewer.addMesh(model);


        model.position.set(0, 0, 0);
        model.scale.set(1, 1, 1);
        console.log("STEP 6: added to viewer");
        viewer.setSettings();

    } catch (err) {
        console.error("OBJ LOAD FAILED:", err);
    }
})();


const menu_button: HTMLElement = document.getElementById("main_menu")!;
const light_menu: HTMLElement = document.getElementById("light_menu")!;
const model_properties: HTMLElement = document.getElementById("model_properties")!;

const clear_btn: HTMLElement = document.getElementById("clear-btn")!;
const recenter_btn: HTMLElement = document.getElementById("recenter-btn")!;

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

const enableRotation = document.getElementById("autoRotate")! as HTMLInputElement;
const autoRotateSpeed = document.getElementById("autoRotateSpeed")! as HTMLInputElement;

const buttons = [
    { btn: document.getElementById('vertices'), panel: document.getElementById('panel-vertices') },
    { btn: document.getElementById('edges'), panel: document.getElementById('panel-edges') },
    { btn: document.getElementById('normals'), panel: document.getElementById('panel-normals') },
];

buttons.forEach(({ btn, panel }) => {
    btn.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const isActive = btn.classList.contains('selected');
        buttons.forEach(({ btn: b, panel: p }) => {
            b.classList.remove('selected');
            p.classList.remove('open');
        });
        if (!isActive) {
            btn.classList.add('selected');
            panel.classList.add('open');
        }
    });
});

background_color.addEventListener("input", (event) => {
    const hex = (event.target as HTMLInputElement).value;
    sceneOptions.renderer.backgroundColor = parseInt(hex.replace("#", ""), 16);
    viewer.setSettings();
});

menu_button.addEventListener("click", () => {

    menu_button.classList.toggle("active");
    main_settings_container.classList.toggle("hidden");

    scene_div.innerHTML = "";

    const { meshNames, lightNames } = viewer.getSceneInfo();

    for (const meshName of meshNames) {
        let div = document.createElement("div");
        div.className = "scene_element";
        div.textContent = meshName;
        scene_div.append(div)
    }

    for (const lightName of lightNames) {
        let div = document.createElement("div");
        div.className = "scene_element";
        div.textContent = lightName;
        scene_div.append(div)
    }
});

clear_btn.addEventListener("click", () => {
    scene_div.innerHTML = "";
    viewer.clearScene();
    removeFile();
    overlay.style.display = 'grid'
})

recenter_btn.addEventListener("click", () => {
    recenterMesh(model)
})

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
    viewer.setSettings();
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
    viewer.setSettings();
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
    viewer.setSettings();
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
    viewer.setSettings();
});

light_config5.addEventListener("click", () => {
    lighting_config_buttons.forEach(callback => {callback.classList.remove("active");});
    light_config5.classList.toggle("active");

    sceneOptions.lighting.DirectionalLight = [
        { color: 0xffffff, intensity: 0.8, position: {x:-30, y:50, z:0}, castShadow: true },
        { color: 0xff0000, intensity: 0.5, position: {x:30,  y:20, z:0}, castShadow: true },
    ]

    viewer.setSettings();
});

light_menu.addEventListener("click", () => {
    light_menu.classList.toggle("active");
    lighting_settings_container.classList.toggle("hidden");
});

// Listen for changes
showGridCheckbox.addEventListener("change", () => {
    sceneOptions.debug.grid.showGrid = showGridCheckbox.checked;
    viewer.setSettings();
});

gridSizeInput.addEventListener("change", () => {
    sceneOptions.debug.grid.gridSize = +gridSizeInput.value
    viewer.updateGrid();
    viewer.setSettings();
});

showAxesCheckbox.addEventListener("change", () => {
    sceneOptions.debug.axes.showAxes = showAxesCheckbox.checked;
    viewer.setSettings();
});

axesSizeInput.addEventListener("change", () => {
    sceneOptions.debug.axes.axisSize = +axesSizeInput.value
    viewer.updateAxes();
    viewer.setSettings();
});


light_gizmo_checkbox.addEventListener("change", () => {
    sceneOptions.lighting.showHelpers = light_gizmo_checkbox.checked;
    viewer.setSettings();
});

shadow_checkbox.addEventListener("change", () => {
});

enableSkyBoxCheckbox.addEventListener("change", () => {
    sceneOptions.renderer.skybox.enabled = enableSkyBoxCheckbox.checked;
    viewer.setSettings();
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

enableRotation.addEventListener("change", () => {
    sceneOptions.camera.autoRotate = enableRotation.checked;
    viewer.setSettings();
})

autoRotateSpeed.addEventListener("change", () => {
    sceneOptions.camera.autoRotateSpeed = +autoRotateSpeed.value
})