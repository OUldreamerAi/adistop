
document.getElementById("changeColorBtn").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(tab.id, { action: "make_blue" }, (response) => {
    console.log("The page said:", response.status);

    async function getCurrentTabUrl() {
        let queryOptions = { active: true, currentWindow: true };
        et [tab] = await chrome.tabs.query(queryOptions);
        return tab?.url; // Palauttaa sivun koko URL-osoitteen
    }



  });
});