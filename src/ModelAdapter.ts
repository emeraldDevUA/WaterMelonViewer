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




function getExtension(filePath: string): string | undefined {
    const cleanPath = filePath.split(/[?#]/)[0]; // remove ?query or #hash
    const parts = cleanPath.split('.');
    if (parts.length === 1) return undefined;

    return parts.pop()?.toLowerCase();
}