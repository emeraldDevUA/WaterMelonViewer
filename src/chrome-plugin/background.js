// chrome.runtime.onMessage.addListener(async (message) => {
//     if (message.action === "toggleBackgroundColor") {
//         const [tab] = await chrome.tabs.query({
//             active: true,
//             lastFocusedWindow: true,
//         });
//
//         await chrome.scripting.executeScript({
//             target: { tabId: tab.id },
//             func: () => {
//                 if (document.body.style.backgroundColor !== "yellow") {
//                     document.body.style.backgroundColor = "yellow";
//                 } else {
//                     document.body.style.backgroundColor = "";
//                 }
//             },
//         });
//     }
// });

// background.js

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
//
//     if (msg.type === 'open_viewer') {
//         chrome.storage.session.set({
//             pendingModel: { filename: msg.filename, buffer: msg.buffer }
//         }, () => {
//             chrome.sidePanel.open({ tabId: sender.tab.id });
//         });
//         return true;
//     }
//
//     if (msg.type === 'viewer_ready') {
//         chrome.storage.session.get('pendingModel', ({ pendingModel }) => {
//             if (pendingModel) {
//                 chrome.storage.session.remove('pendingModel');
//                 sendResponse({ type: 'load_model', ...pendingModel });
//             } else {
//                 sendResponse(null);
//             }
//         });
//         return true; // keep channel open for async sendResponse
//     }
//
// });