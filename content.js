
var modal = document.getElementById("myModal");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'make_blue') {
        document.body.style.backgroundColor = 'lightblue';
        sendResponse({ status: 'done' });
    }
});

const currentUrl = window.location.href;

if (currentUrl.includes("youtube.com")) {
    modal.style.display = "block";
}

//makes white box where wikibedia article
//Ai made questions avbout set wikibedia article
//wikibedia