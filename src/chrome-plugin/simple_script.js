document.getElementById("openViewer").addEventListener("click", () => {
    chrome.tabs.create({
        url: "index.html"
    });
});


