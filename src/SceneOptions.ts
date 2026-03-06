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
        },
        axes: {
            showAxes: true,
            axisSize: 50,
        },
        wireframe: true,
        displayPoints: false,
    }
}