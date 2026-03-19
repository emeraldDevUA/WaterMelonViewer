chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type !== 'load_model') return;

    const blob = new Blob([msg.buffer]);
    const url = URL.createObjectURL(blob) + '#' + msg.filename;

    // fire a plain custom event that your viewer can listen to
    window.dispatchEvent(new CustomEvent('model-dropped', { detail: { url } }));
});