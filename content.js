
var modal = document.getElementById("myModal");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'make_blue') {
        document.body.style.backgroundColor = 'lightblue';
        sendResponse({ status: 'done' });
    }
});

const currentUrl = window.location.href;

if (currentUrl.includes("example.com" || "https://www.kali.org/get-kali/#kali-platforms")) {
    const overlay = document.createElement("div");
    const badge = document.createElement("p");
    badge.textContent = `⏱️ uhweguiyrtwq vt2    uhg 2ty o8rvt gu24quyiogr4ucivgqycr4yh8ghc4rgyr 4gy7cqrt34cr4gcr4guytgucqrwgiuyqcgiyrwcf tgiy min read`;
    overlay.appendChild(badge);
    document.body.appendChild(overlay);
}

//makes white box where wikibedia article
//Ai made questions avbout set wikibedia article
//wikibedia article is about a topic and the questions are about the topic