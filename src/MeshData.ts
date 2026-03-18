import * as THREE from 'three';

interface MeshInfo {
    vertexCount: number;
    faceCount: number;
    edgeCount: number;
    hasNormals: boolean;
    hasUVs: boolean;
    isIndexed: boolean;
    boundingBox: THREE.Box3;
    boundingSphere: THREE.Sphere;
}

interface GroupInfo {
    totalVertices: number;
    totalFaces: number;
    meshCount: number;
}

function getMeshInfo(mesh: THREE.Mesh): MeshInfo {
    const geo = mesh.geometry;
    const position = geo.attributes.position;
    const index = geo.index;

    const vertexCount = position.count;
    const faceCount = index ? index.count / 3 : position.count / 3;
    const edgeCount = faceCount + vertexCount - 2;

    geo.computeBoundingBox();
    geo.computeBoundingSphere();

    return {
        vertexCount,
        faceCount,
        edgeCount,
        hasNormals: !!geo.attributes.normal,
        hasUVs: !!geo.attributes.uv,
        isIndexed: !!index,
        boundingBox: geo.boundingBox!,
        boundingSphere: geo.boundingSphere!,
    };
}

function getGroupInfo(group: THREE.Group | THREE.Object3D): GroupInfo {
    let totalVertices = 0;
    let totalFaces = 0;
    let meshCount = 0;

    group.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
            const geo = (child as THREE.Mesh).geometry;
            const position = geo.attributes.position;
            const index = geo.index;

            totalVertices += position.count;
            totalFaces += index ? index.count / 3 : position.count / 3;
            meshCount++;
        }
    });

    return { totalVertices, totalFaces, meshCount };
}

function isMesh(object: THREE.Object3D): object is THREE.Mesh {
    return (object as THREE.Mesh).isMesh === true;
}

export function getGeometryInfo(
    object: THREE.Object3D
): MeshInfo | GroupInfo {

    if (isMesh(object)) {
        return getMeshInfo(object);
    }

    return getGroupInfo(object);
}