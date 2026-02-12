
import { OpenRouter } from "@openrouter/sdk";

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


function generateQuizUI(questionsText) {
    const questionBlocks = questionsText.split(/Q\d+:/).filter(q => q.trim());
    
    let quizHTML = `
        <h2 style="all: initial; display: block; font-size: 28px; font-weight: bold; margin-bottom: 25px; color: #fff; font-family: Georgia, serif; text-align: center;">
            Answer These Questions to Continue
        </h2>
    `;
    
    questionBlocks.forEach((block, index) => {
        const lines = block.trim().split('\n').filter(l => l.trim());
        const questionText = lines[0].trim();
        const options = lines.filter(l => /^[A-D]\)/.test(l.trim()));
        const correctLine = lines.find(l => l.startsWith('Correct:'));
        const correctAnswer = correctLine ? correctLine.split(':')[1].trim() : 'A';
        
        quizHTML += `
            <div class="quiz-question" data-question="${index}" data-correct="${correctAnswer}" style="all: initial; display: block; background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                <p style="all: initial; display: block; font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #333; font-family: Georgia, serif;">
                    ${index + 1}. ${questionText}
                </p>
                <div class="options" style="all: initial; display: block;">
        `;
        
        options.forEach(option => {
            const letter = option.charAt(0);
            const text = option.substring(2).trim();
            quizHTML += `
                <button class="quiz-option" data-option="${letter}" style="all: initial; display: block; width: 100%; text-align: left; padding: 15px 20px; margin-bottom: 10px; background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; font-size: 16px; font-family: Georgia, serif; color: #333; cursor: pointer; transition: all 0.3s ease;">
                    <span style="all: initial; display: inline; font-weight: bold; margin-right: 10px; color: #667eea;">${letter})</span> ${text}
                </button>
            `;
        });
        
        quizHTML += `
            </div>
                <p class="feedback" style="all: initial; display: none; margin-top: 10px; padding: 10px; border-radius: 5px; font-family: Georgia, serif; font-size: 14px;"></p>
            </div>
        `;
    });
    
    quizHTML += `
        <button id="submit-quiz" style="all: initial; display: block; width: 100%; padding: 18px; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; border: none; border-radius: 10px; font-size: 20px; font-weight: bold; font-family: Georgia, serif; cursor: pointer; margin-top: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.2); opacity: 0.5;">
            ✓ Submit Answers (0/${questionBlocks.length})
        </button>
    `;
    
    return quizHTML;
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

    const client = new OpenRouter({
        apiKey: "sk-hc-v1-84642dca3ba74c4e8e92aaada87d84ff83447ce3f33a495b97da9dfe0e4f5d82",
        serverURL: "https://ai.hackclub.com/proxy/v1",
    });

    const airesponse = await client.chat.send({
        model: "qwen/qwen3-32b",
        messages: [
    { role: "user", content: "Tell me a joke." },
    ],
    stream: false,
    });
    
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
            <h1 style="all: initial; display: block; font-size: 32px; font-weight: bold; margin-bottom: 20px; color: #000; font-family: Georgia, serif;">
                Read this text about <span style="color: #ff0000; font-weight: bold;"> ${title} </span> and answer the questions to use this website.
        </h1>
        <div id="wiki-article" style="all: initial; display: block; font-family: Georgia, serif; font-size: 16px; line-height: 1.6; color: #000;">
            ${fullData.parse.text['*']}
        </div>
        <div id="ai-questions" style="all: initial; display: block; margin-top: 40px; padding: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
            <h2 style="all: initial; display: block; font-size: 28px; font-weight: bold; margin-bottom: 20px; color: #fff; font-family: Georgia, serif; text-align: center;">
                Answer These Questions to use this webite
            </h2>
            <p style="all: initial; display: block; font-size: 18px; margin-bottom: 10px; color: #fff; font-family: Georgia, serif; text-align: center;">
                Generating questions...
            </p>
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