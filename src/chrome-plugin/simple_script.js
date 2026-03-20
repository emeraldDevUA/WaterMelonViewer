document.getElementById("openViewer").addEventListener("click", () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html') }); // ✅
});


