document.getElementById("toggleColor").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "toggleBackgroundColor" });
});


document.getElementById("openViewer").addEventListener("click", () => {
    chrome.tabs.create({
        url: "index.html"
    });
});
