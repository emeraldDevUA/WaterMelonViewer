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


export function loadMesh(filePath: string): Promise<Mesh | Group> {

    const ext = getExtension(filePath);

    if (!ext) {
        throw new Error("Cannot determine file extension");
    }

    const loader = getLoader(ext);

    // @ts-ignore
    return new Promise((resolve: (arg0: Mesh<BufferGeometry<any, any>,
                        MeshStandardMaterial, Object3DEventMap> | Group<any>) => void,
                        reject: (arg0: any) => void) => {

        loader.load(
            filePath,

            (result: any) => {

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
                        new MeshStandardMaterial({ color: 0xaaaaaa })
                    );
                    resolve(mesh);
                    return;
                }

                // OBJ / FBX / 3DS / VRML
                if (result instanceof Group) {
                    resolve(result);
                    return;
                }

                resolve(result);

            },

            undefined,

            (error: any) => reject(error)

        );

    });

}