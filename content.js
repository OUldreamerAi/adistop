
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
        all: initial;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2147483647;
        pointer-events: auto;
        opacity: 1;
    `;
    

    const wikiBox = document.createElement("div");
    wikiBox.id = "wiki-content";
    wikiBox.style.cssText = `
        all: initial;
        background-color: rgb(255, 255, 255);
        padding: 30px;
        border-radius: 10px;
        width: 120vh;
        max-height: 90vh;
        overflow-y: auto;
        z-index: 2147483647;
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
            <div style="all: initial; display: block; font-family: Georgia, serif; font-size: 16px; line-height: 1.6; color: #000;">
                ${data.parse.text['*']}
            </div>
        `;
        
        const wikiContent = document.getElementById('wiki-content');
        

    wikiContent.querySelectorAll('*').forEach(element => {
        element.style.opacity = '1';
        element.style.filter = 'none';
        element.style.fontFamily = 'Georgia, serif';
        element.style.lineHeight = '1.6';
        element.style.color = '#000';
        element.style.backgroundColor = 'transparent';
    });
    

    wikiContent.querySelectorAll('p').forEach(p => {
        p.style.fontSize = '16px';
        p.style.marginBottom = '1em';
        p.style.display = 'block';
    });
    
 
    wikiContent.querySelectorAll('h1').forEach(h => {
        h.style.fontSize = '32px';
        h.style.fontWeight = 'bold';
        h.style.marginTop = '1em';
        h.style.marginBottom = '0.5em';
        h.style.display = 'block';
    });
    
    wikiContent.querySelectorAll('h2').forEach(h => {
        h.style.fontSize = '28px';
        h.style.fontWeight = 'bold';
        h.style.marginTop = '1em';
        h.style.marginBottom = '0.5em';
        h.style.display = 'block';
    });
    
    wikiContent.querySelectorAll('h3').forEach(h => {
        h.style.fontSize = '24px';
        h.style.fontWeight = 'bold';
        h.style.marginTop = '0.8em';
        h.style.marginBottom = '0.4em';
        h.style.display = 'block';
    });
    
    wikiContent.querySelectorAll('h4').forEach(h => {
        h.style.fontSize = '20px';
        h.style.fontWeight = 'bold';
        h.style.marginTop = '0.8em';
        h.style.marginBottom = '0.4em';
        h.style.display = 'block';
    });
    
    wikiContent.querySelectorAll('h5, h6').forEach(h => {
        h.style.fontSize = '18px';
        h.style.fontWeight = 'bold';
        h.style.marginTop = '0.8em';
        h.style.marginBottom = '0.4em';
        h.style.display = 'block';
    });
    

    wikiContent.querySelectorAll('img').forEach(img => {
        img.style.opacity = '1';
        img.style.filter = 'none';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.display = 'block';
        if (img.getAttribute('data-src')) {
            img.src = img.getAttribute('data-src');
        }
    });
    

wikiContent.querySelectorAll('a').forEach(link => {
    link.style.color = '#0645ad';
    link.style.opacity = '1';
    link.style.textDecoration = 'underline';
    link.style.fontSize = '16px';
    
    let href = link.getAttribute('href');
    if (href && href.startsWith('/wiki/')) {
        link.setAttribute('href', `https://en.wikipedia.org${href}`);
    } else if (href && href.startsWith('#')) {
        link.removeAttribute('href');
        link.style.cursor = 'default';
        link.style.textDecoration = 'none';
        link.style.color = '#000';
    }
    
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
});
    

    wikiContent.querySelectorAll('ul, ol').forEach(list => {
        list.style.marginLeft = '2em';
        list.style.marginBottom = '1em';
        list.style.display = 'block';
        list.style.fontSize = '16px';
    });
    
    wikiContent.querySelectorAll('li').forEach(li => {
        li.style.display = 'list-item';
        li.style.marginBottom = '0.5em';
        li.style.fontSize = '16px';
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