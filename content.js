

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'make_blue') {
        document.body.style.backgroundColor = 'lightblue';
        sendResponse({ status: 'done' });
    }
});

const currentUrl = window.location.href;

if (currentUrl.includes("example.com") || currentUrl.includes("https://www.kali.org/get-kali/#kali-platforms")) {
    
    const overlay = document.createElement("div");
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 33, 33, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        pointer-events: no;
    `;
    
    const badge = document.createElement("p");
    badge.textContent = "⏱️ Test overlay - it works!";
    badge.style.cssText = `
        color: #333;
        font-size: 20px;
        font-weight: bold;
    `;
    
    overlay.appendChild(badge);
    document.body.appendChild(overlay);
}

//makes white box where wikibedia article
//Ai made questions avbout set wikibedia article
//wikibedia article is about a topic and the questions are about the topic