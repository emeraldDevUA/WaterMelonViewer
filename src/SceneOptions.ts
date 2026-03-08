export const sceneOptions = {
    renderer: {
        exposure: 1.2,
        toneMapping: true,
        backgroundColor: 0x000000,
    },
    lighting: {
        ambientIntensity: 0.5,
        directionalIntensity: 1,
    },
    camera: {
        autoRotate: false,
        autoRotateSpeed: 1,

    },
    debug: {
        grid: {
            showGrid: false,
            gridSize: 30,
            gridDivisions: 30,
            gridColor1: 0x444444,
            gridColor2: 0x888888
        },
        axes: {
            showAxes: true,
            axisSize: 50,
            axisThickness: 2
        },
        wireframe: {
            enabled: false,
            color: 0xffffff
        },
        points: {
            enabled: false,
            size: 1,
            color: 0xff0000
        },
        normals: {
            showVertexNormals: true,
            showFaceNormals: false,
            size: 1
        },
        performance: {
            showStats: true
        }
    }
}