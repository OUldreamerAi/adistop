

const currentUrl = window.location.href;

if (currentUrl.includes("example.com") || currentUrl.includes("https://www.kali.org/get-kali/#kali-platforms")) {
    
    // Create overlay
    const overlay = document.createElement("div");
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgb(0, 0, 0);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        pointer-events: auto;
        opacity: 1;
        
    `;
    
    // Create white box for Wikipedia content
    const wikiBox = document.createElement("div");
    wikiBox.id = "wiki-content";
    wikiBox.style.cssText = `
        background-color: rgb(255, 255, 255);
        padding: 30px;
        border-radius: 10px;
        width: 120vh;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.7 );
        opacity: 1;
        z-index: 10000; 
    `;
    wikiBox.innerHTML = `<p>Loading Wikipedia article...</p>`;
    
    overlay.appendChild(wikiBox);
    document.body.appendChild(overlay);
    
    const summaryUrl = "https://en.wikipedia.org/api/rest_v1/page/random/summary";

    fetch(summaryUrl)
    .then(response => response.json())
    .then(data => {
        const title = data.title;
        // Fetch full parsed content
        const apiUrl = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&format=json&origin=*`;
        return fetch(apiUrl);
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('wiki-content').innerHTML = `
            <h1>Read this text about <span style="color: #ff0000"> ${data.parse.title} </span> and answer the questions to use this website.</h1>
            ${data.parse.text['*']}
        `;
    })
    .catch(e => {
        document.getElementById('wiki-content').innerText = "Failed to load Wikipedia article.";
    });
}