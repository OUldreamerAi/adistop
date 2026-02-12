chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "generateQuestions") {
        // Get API key from storage
        chrome.storage.local.get(['apiKey'], (data) => {
            const apiKey = data.apiKey;
            
            if (!apiKey) {
                sendResponse({ success: false, error: 'Please set your API key in the extension popup' });
                return;
            }
            
            fetch("https://ai.hackclub.com/proxy/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "qwen/qwen3-32b",
                    messages: [{
                        role: "user",
                        content: request.prompt
                    }]
                })
            })
            .then(res => res.json())
            .then(data => sendResponse({ success: true, data: data }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        });
        
        return true;
    }
});