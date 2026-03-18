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