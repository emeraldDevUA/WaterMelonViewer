chrome.runtime.onMessage.addListener(async (message) => {
    if (message.action === "toggleBackgroundColor") {
        const [tab] = await chrome.tabs.query({
            active: true,
            lastFocusedWindow: true,
        });

        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                if (document.body.style.backgroundColor !== "yellow") {
                    document.body.style.backgroundColor = "yellow";
                } else {
                    document.body.style.backgroundColor = "";
                }
            },
        });
    }
});

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type !== 'open_viewer') return;

    chrome.tabs.create({ url: chrome.runtime.getURL('viewer.html') }, (tab) => {
        // wait for viewer to load, then send the file
        chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
            if (tabId !== tab.id || info.status !== 'complete') return;
            chrome.tabs.onUpdated.removeListener(listener);

            chrome.tabs.sendMessage(tab.id, {
                type: 'load_model',
                filename: msg.filename,
                buffer: msg.buffer
            });
        });
    });
});