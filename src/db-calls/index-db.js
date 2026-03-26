const DB_NAME = "fileDB";
const STORE_NAME = "files";

export function openDB() {
    // @ts-ignore
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
export async function getFile() {
    // @ts-ignore
    const db = await openDB();
    // @ts-ignore
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);

        const request = store.get("droppedFile");

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}