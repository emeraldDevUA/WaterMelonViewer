chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "toggleBackgroundColor") {
        if (document.body.style.backgroundColor !== "yellow") {
            document.body.style.backgroundColor = "yellow";
        } else {
            document.body.style.backgroundColor = "";
        }
    }
});

window.addEventListener('dragover', (e) => {

    console.log("WE ARE HERE")

    e.preventDefault();
    e.stopImmediatePropagation();
}, true);
window.addEventListener('drop', (e) => {
    const file = e.dataTransfer?.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    const supported = ['obj', 'glb', 'gltf', 'fbx', 'stl'];
    if (!supported.includes(ext)) return;

    e.preventDefault();
    e.stopImmediatePropagation ();

    const reader = new FileReader();
    reader.onload = () => {
        chrome.runtime.sendMessage({
            type: 'open_viewer',
            filename: file.name,
            buffer: reader.result
        });
    };
    reader.readAsArrayBuffer(file);
}, true);

