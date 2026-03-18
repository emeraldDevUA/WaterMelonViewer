export const sceneOptions = {
    renderer: {
        exposure: 1.2,
        toneMapping: true,
        backgroundColor: 0x000000,
    },
    lighting: {
        showHelpers: false,
        DirectionalLight: [
            { color: 0xffffff, intensity: 0.8, position: {x:-30, y:50, z:0}, castShadow: true },
            { color: 0xff0000, intensity: 0.5, position: {x:30,  y:20, z:0}, castShadow: false },
        ],
        PointLight: [

        ]
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
            showAxes: false,
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
            showVertexNormals: false,
            showFaceNormals: false,
            size: 1
        },
        performance: {
            showStats: true
        }
    }
}