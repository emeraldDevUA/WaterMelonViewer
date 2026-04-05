import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";
import {STLLoader} from "three/examples/jsm/loaders/STLLoader";
import {PLYLoader} from "three/examples/jsm/loaders/PLYLoader";
import {ColladaLoader} from "three/examples/jsm/loaders/ColladaLoader";
import {TDSLoader} from "three/examples/jsm/loaders/TDSLoader";
import {AMFLoader} from "three/examples/jsm/loaders/AMFLoader";
import {VRMLLoader} from "three/examples/jsm/loaders/VRMLLoader";
import {VTKLoader} from "three/examples/jsm/loaders/VTKLoader";
import {USDLoader} from "three/examples/jsm/loaders/USDLoader";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

import {
    Mesh,
    MeshStandardMaterial,
    Group,
    BufferGeometry,
    Object3DEventMap
} from "three";
import * as THREE from "three";


const loaderMap = {
    gltf: GLTFLoader,
    glb: GLTFLoader,
    obj: OBJLoader,
    fbx: FBXLoader,
    stl: STLLoader,
    ply: PLYLoader,
    dae: ColladaLoader,
    "3ds": TDSLoader,
    amf: AMFLoader,
    wrl: VRMLLoader,
    vtk: VTKLoader,
    usd: USDLoader
};

function getExtension(filePath: string): string | undefined {
    const cleanPath = filePath.split(/[?#]/)[0];
    const parts = cleanPath.split('.');
    if (parts.length === 1) return undefined;
    return parts.pop()?.toLowerCase();
}

function getLoader(ext: string) {
    const Loader = loaderMap[ext as keyof typeof loaderMap];
    if (!Loader) throw new Error(`Unsupported format: ${ext}`);
    return new Loader();
}


export function loadMeshFromFile(filePath: string, file_name:string): Promise<Mesh | Group> {

    const ext = getExtension(file_name);

    if (!ext) {
        throw new Error("Cannot determine file extension");
    }

    const loader = getLoader(ext);

    // @ts-ignore
    return new Promise((resolve: (arg0: Mesh<BufferGeometry<any, any>,
                        MeshStandardMaterial, Object3DEventMap> | Group<any>) => void,
                        reject: (arg0: any) => void) => {

        loader.load(
            filePath, (result: any) => {

                // GLTF
                if (result.scene) {
                    resolve(result.scene);
                    return;
                }

                // Collada
                if (result.scene) {
                    resolve(result.scene);
                    return;
                }

                // Geometry loaders (STL, PLY, VTK)
                if (result instanceof BufferGeometry) {
                    const mesh = new Mesh(
                        result,
                        new MeshStandardMaterial({
                            color: 0xaaaaaa,
                            side: THREE.FrontSide,

                        })
                    );
                    resolve(mesh);
                    return;
                }

                // OBJ / FBX / 3DS / VRML
                if (result instanceof Group) {
                    resolve(result);
                    return;
                }

                if (result) {
                    resolve(result);
                } else {
                    reject(new Error(`Loader returned empty result for ${file_name}`));
                }
            },

            undefined, (error: any) => reject(error)
        );
    });

}

type SupportedFormat = 'obj' | 'stl' | 'ply' | 'dae';

// @ts-ignore
async function resolveInput(input: File | Blob | ArrayBuffer | string): Promise<{ text: string; buffer: ArrayBuffer; hint?: string }> {
    if (typeof input === 'string') {
        const encoder = new TextEncoder();
        const buffer = encoder.encode(input).buffer;
        return { text: input, buffer };
    } else if (input instanceof ArrayBuffer) {
        const text = new TextDecoder().decode(input);
        return { text, buffer: input };
    } else {
        const hint = input instanceof File ? input.name.split('.').pop()?.toLowerCase() : undefined;
        const buffer = await input.arrayBuffer();
        const text = new TextDecoder().decode(buffer);
        return { text, buffer, hint };
    }
}

function detectFormat(text: string, hint?: string): SupportedFormat {
    // @ts-ignore

    if (hint && ['obj', 'stl', 'ply', 'dae'].includes(hint)) {
        return hint as SupportedFormat;
    }
    // @ts-ignore
    if (text.trimStart().startsWith('<?xml') || text.includes('<COLLADA')) return 'dae';
    // @ts-ignore
    if (text.startsWith('ply')) return 'ply';
    // @ts-ignore
    if (text.startsWith('solid')) return 'stl';
    return 'obj'; // fallback
}
// @ts-ignore
export async function LoadMeshFromIndexDB(input: File | Blob | ArrayBuffer | string): Promise<Scene> {
    const { text, buffer, hint } = await resolveInput(input);
    const format = detectFormat(text, hint);

    switch (format) {
        case 'obj': {
            const loader = new OBJLoader();
            return loader.parse(text);
        }
        case 'stl': {
            const loader = new STLLoader();
            const geometry = loader.parse(buffer);
            const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
            const group = new THREE.Group();
            group.add(mesh);
            return group;
        }
        case 'ply': {
            const loader = new PLYLoader();
            const geometry = loader.parse(buffer);
            const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
            const group = new THREE.Group();
            group.add(mesh);
            return group;
        }
        case 'dae': {
            const loader = new ColladaLoader();
            const result = loader.parse(text, '');
            return result.scene;
        }
    }
}