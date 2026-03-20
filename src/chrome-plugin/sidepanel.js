const MIME = {
    obj:  'text/plain',
    glb:  'model/gltf-binary',
    gltf: 'model/gltf+json',
    fbx:  'application/octet-stream',
    stl:  'application/octet-stream',
};


const DB_NAME = "fileDB";
const STORE_NAME = "files";

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id" });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveFile(file) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);

        const data = {
            id: "droppedFile", // same key = overwrite
            name: file.name,
            type: file.type,
            file: file
        };

        store.put(data); // ✅ overwrite happens here

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
    });
}

document.addEventListener('DOMContentLoaded', () => {

    const overlay = document.getElementById('drop-overlay');

    let dragCounter = 0;

    window.addEventListener('dragenter', (e) => {
        e.preventDefault();
        dragCounter++;

        overlay?.classList.add('active');
    });

    window.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dragCounter--;

        if (dragCounter <= 0) {
            overlay?.classList.remove('active');
            dragCounter = 0;
        }
    });

    window.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    window.addEventListener('drop', async (e) => {
        e.preventDefault();

        dragCounter = 0;
        overlay?.classList.remove('active');

        const file = e.dataTransfer?.files[0];
        if (!file) return;

        const ext = file.name.split('.').pop().toLowerCase();
        if (!Object.keys(MIME).includes(ext)) return;

        await saveFile(file);

        console.log("File saved to IndexedDB");

        chrome.tabs.create({
            url: chrome.runtime.getURL('index.html')
        });
    });

    document.getElementById('openViewer').addEventListener('click', async (e) => {

        const db = await openDB();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, "readwrite");
            const store = tx.objectStore(STORE_NAME);

            store.delete("droppedFile");

            chrome.tabs.create({
                url: chrome.runtime.getURL('index.html')
            });

            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
            tx.onabort = () => reject(tx.error);
        });
    })

});
