
async function checkIfBanned() {
    const currentUrl = window.location.href;
    
    const data = await chrome.storage.local.get(['bannedSites', 'unbannedSites']);
    const bannedSites = data.bannedSites || [];
    const unbannedSites = data.unbannedSites || {};

    let isBanned = false;
    let matchedSite = null;
    
    for (const site of bannedSites) {
        if (currentUrl.includes(site)) {
            matchedSite = site;
            
            if (unbannedSites[site]) {
                const unbanTime = unbannedSites[site];
                
                if (Date.now() >= unbanTime) {
                    const updatedBanned = bannedSites.filter(s => s !== site);
                    delete unbannedSites[site];
                    
                    await chrome.storage.local.set({ 
                        bannedSites: updatedBanned,
                        unbannedSites: unbannedSites
                    });
                    
                    console.log(`${site} has been unbanned!`);
                    return false; 
                }
            }
            
            isBanned = true;
            break;
        }
    }
    
    return isBanned;
}

async function showWikipediaOverlay() {
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
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.7);
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
        const apiUrl = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&format=json&origin=*`;
        return fetch(apiUrl);
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('wiki-content').innerHTML = `
            <h1>Read this text about <span style="color: #ff0000"> ${data.parse.title} </span> and answer the questions to use this website.</h1>
            ${data.parse.text['*']}
        `;
        
        const wikiContent = document.getElementById('wiki-content');
        
        wikiContent.querySelectorAll('img').forEach(img => {
            img.style.opacity = '1';
            img.style.filter = 'none';

            if (img.getAttribute('data-src')) {
                img.src = img.getAttribute('data-src');
            }
        });
        

        wikiContent.querySelectorAll('*').forEach(element => {
            element.style.opacity = '1';
        });
        
        wikiContent.querySelectorAll('a').forEach(link => {
            link.style.color = '#050d33ff';
            link.style.opacity = '1';
            link.href = "#";
        });
    })
    .catch(e => {
        document.getElementById('wiki-content').innerText = "Failed to load Wikipedia article.";
    });
}

checkIfBanned().then(isBanned => {
    if (isBanned) {
        showWikipediaOverlay();
    }
});