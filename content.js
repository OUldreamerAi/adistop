chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'make_blue') {
        document.body.style.backgroundColor = 'lightblue';
        sendResponse({ status: 'done' });
    }
});