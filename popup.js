
document.getElementById("changeColorBtn").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(tab.id, { action: "make_blue" }, (response) => {
    console.log("The page said:", response.status);

  });
});

// Function to check the active tab
function checkActiveTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url) {
      console.log("Current URL: ", tabs[0].url);
      // You can send this data to a local variable,
      // storage, or an external server here.
    }
  });
}

