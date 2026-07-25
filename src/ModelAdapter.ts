// @ts-ignore
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";
// @ts-ignore
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";
// @ts-ignore
import {STLLoader} from "three/examples/jsm/loaders/STLLoader";
// @ts-ignore
import {PLYLoader} from "three/examples/jsm/loaders/PLYLoader";
// @ts-ignore
import {ColladaLoader} from "three/examples/jsm/loaders/ColladaLoader";
// @ts-ignore
import {TDSLoader} from "three/examples/jsm/loaders/TDSLoader";
// @ts-ignore
import {AMFLoader} from "three/examples/jsm/loaders/AMFLoader";
// @ts-ignore
import {VRMLLoader} from "three/examples/jsm/loaders/VRMLLoader";
// @ts-ignore
import {VTKLoader} from "three/examples/jsm/loaders/VTKLoader";
// @ts-ignore
import {USDLoader} from "three/examples/jsm/loaders/USDLoader";
// @ts-ignore
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
// @ts-ignore
import {ThreeMFLoader} from "three/examples/jsm/loaders/3MFLoader";

import * as THREE from "three";
import {BufferGeometry, Group, Mesh, MeshStandardMaterial, Scene} from "three";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FileExtension = keyof typeof LOADER_MAP;

type SupportedInlineFormat = "obj" | "stl" | "ply" | "dae" | "glb" | "3mf";

type ResolvedInput = {
    text: string;
    buffer: ArrayBuffer;
    hint?: string;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LOADER_MAP = {
    gltf: GLTFLoader,
    glb: GLTFLoader,
    obj: OBJLoader,
    fbx: FBXLoader,
    stl: STLLoader,
    ply: PLYLoader,
    dae: ColladaLoader,
    amf: AMFLoader,
    wrl: VRMLLoader,
    vtk: VTKLoader,
    usd: USDLoader,

    "3ds": TDSLoader,
    "3mf": ThreeMFLoader,
} as const;

const DEFAULT_MATERIAL = new MeshStandardMaterial({
    color: 0xaaaaaa,
    side: THREE.FrontSide,
});

const INLINE_FORMATS = new Set<string>(["obj", "stl", "ply", "dae", "glb", "3mf"]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getExtension(filePath: string): string | undefined {
    const cleanPath = filePath.split(/[?#]/)[0];
    const parts = cleanPath.split(".");
    return parts.length > 1 ? parts.pop()?.toLowerCase() : undefined;
}

function geometryToGroup(geometry: BufferGeometry): Group {
    const mesh = new Mesh(geometry, DEFAULT_MATERIAL.clone());
    const group = new Group();
    group.add(mesh);
    return group;
}

// ---------------------------------------------------------------------------
// loadMeshFromFile — loads a remote/local URL via the appropriate Three.js loader
// ---------------------------------------------------------------------------

export function loadMeshFromFile(filePath: string, fileName: string): Promise<Mesh | Group> {
    const ext = getExtension(fileName);
    if (!ext) throw new Error(`Cannot determine file extension for: "${fileName}"`);

    const LoaderClass = LOADER_MAP[ext as FileExtension];
    if (!LoaderClass) throw new Error(`Unsupported format: ".${ext}"`);

    const loader = new LoaderClass();

    return new Promise<Mesh | Group>((resolve, reject) => {
        (loader as any).load(
            filePath,
            (result: any) => resolve(normalizeLoaderResult(result, fileName)),
            undefined,
            reject,
        );
    });
}

function normalizeLoaderResult(result: any, fileName: string): Mesh | Group {
    if (result?.scene instanceof Object) return result.scene;   // GLTF / Collada
    if (result instanceof BufferGeometry) return geometryToGroup(result);  // STL, PLY, VTK
    if (result instanceof Group || result instanceof Mesh) return result;  // OBJ, FBX, 3DS, VRML
    if (result) return result;
    throw new Error(`Loader returned empty result for "${fileName}"`);
}

// ---------------------------------------------------------------------------
// loadMeshFromIndexDB — parses in-memory data (File, Blob, ArrayBuffer, string)
// ---------------------------------------------------------------------------

async function resolveInput(input: File | Blob | ArrayBuffer | string): Promise<ResolvedInput> {
    if (typeof input === "string") {
        const buffer = new TextEncoder().encode(input).buffer;
        return {text: input, buffer};
    }

    if (input instanceof ArrayBuffer) {
        return {text: new TextDecoder().decode(input), buffer: input};
    }

    const hint = input instanceof File ? getExtension(input.name) : undefined;
    const buffer = await input.arrayBuffer();
    return {text: new TextDecoder().decode(buffer), buffer, hint};
}

function detectInlineFormat(text: string, hint?: string): SupportedInlineFormat {
    if (hint && INLINE_FORMATS.has(hint)) return hint as SupportedInlineFormat;
    if (text.trimStart().startsWith("<?xml") || text.includes("<COLLADA")) return "dae";
    if (text.startsWith("ply")) return "ply";
    if (text.startsWith("solid")) return "stl";
    if (text.startsWith("glb")) return "glb";
    return "obj";
}

export async function loadMeshFromIndexDB(
    input: File | Blob | ArrayBuffer | string,
): Promise<Scene | Group> {
    const {text, buffer, hint} = await resolveInput(input);
    const format = detectInlineFormat(text, hint);

    switch (format) {
        case "obj": {
            return new OBJLoader().parse(text);
        }
        case "stl": {
            return geometryToGroup(new STLLoader().parse(buffer));
        }
        case "ply": {
            return geometryToGroup(new PLYLoader().parse(buffer));
        }
        case "dae": {
            return new ColladaLoader().parse(text, "").scene;
        }
        case "glb": {
            const result = await new Promise<any>((resolve, reject) =>
                new GLTFLoader().parse(buffer, "", resolve, reject),
            );
            return result.scene;
        }
        case "3mf": {
            return new ThreeMFLoader().parse(buffer);
        }
        default: {
            throw new Error(`Unhandled format: "${format}"`);
        }
    }
}