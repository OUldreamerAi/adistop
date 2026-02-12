

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
        <div style="border-top: 3px solid #a2a9b1; margin-top: 30px; padding-top: 20px;">
            <h2 style="font-family: 'Linux Libertine', Georgia, Times, serif; font-size: 24px; font-weight: normal; margin-bottom: 20px; color: #000; border-bottom: 1px solid #a2a9b1; padding-bottom: 10px;">
                Quiz
            </h2>
        </div>
    `;
    
    questionBlocks.forEach((block, index) => {
        const lines = block.trim().split('\n').filter(l => l.trim());
        const questionText = lines[0].trim();
        const options = lines.filter(l => /^[A-D]\)/.test(l.trim()));
        const correctLine = lines.find(l => l.startsWith('Correct:'));
        const correctAnswer = correctLine ? correctLine.split(':')[1].trim() : 'A';
        
        quizHTML += `
            <div class="quiz-question" data-question="${index}" data-correct="${correctAnswer}" style="margin-bottom: 25px; padding: 15px; background: #f8f9fa; border: 1px solid #a2a9b1; border-radius: 2px;">
                <p style="font-family: sans-serif; font-size: 16px; font-weight: bold; margin-bottom: 12px; color: #202122;">
                    ${index + 1}. ${questionText}
                </p>
                <div class="options">
        `;
        
        options.forEach(option => {
            const letter = option.charAt(0);
            const text = option.substring(2).trim();
            quizHTML += `
                <button class="quiz-option" data-option="${letter}" style="display: block; width: 100%; text-align: left; padding: 10px 15px; margin-bottom: 8px; background: white; border: 1px solid #a2a9b1; border-radius: 2px; font-size: 14px; font-family: sans-serif; color: #202122; cursor: pointer;">
                    <strong>${letter})</strong> ${text}
                </button>
            `;
        });
        
        quizHTML += `
                </div>
                <p class="feedback" style="display: none; margin-top: 10px; padding: 8px 12px; border-radius: 2px; font-family: sans-serif; font-size: 14px;"></p>
            </div>
        `;
    });
    
    quizHTML += `
        <button id="submit-quiz" disabled style="display: block; width: 100%; padding: 12px; background: #36c; color: white; border: none; border-radius: 2px; font-size: 16px; font-family: sans-serif; cursor: not-allowed; margin-top: 15px; opacity: 0.6;">
            Submit answers (0/${questionBlocks.length})
        </button>
    `;
    
    return quizHTML;
}

function attachQuizHandlers(overlay) {
    const selectedAnswers = {};
    let totalQuestions = 0;
    
    document.querySelectorAll('.quiz-question').forEach(() => totalQuestions++);
    
    document.querySelectorAll('.quiz-option').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const questionDiv = this.closest('.quiz-question');
            const questionIndex = questionDiv.getAttribute('data-question');
            const selectedOption = this.getAttribute('data-option');
            
            questionDiv.querySelectorAll('.quiz-option').forEach(opt => {
                opt.style.background = '#f8f9fa';
                opt.style.borderColor = '#e9ecef';
            });
            
            this.style.background = '#eaecf0';
            this.style.borderColor = '#36c';
            
            selectedAnswers[questionIndex] = selectedOption;
            
            const submitBtn = document.getElementById('submit-quiz');
            const answeredCount = Object.keys(selectedAnswers).length;
            submitBtn.textContent = `Submit Answers (${answeredCount}/${totalQuestions})`;
            
            if (answeredCount === totalQuestions) {
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
                submitBtn.style.cursor = 'pointer';
            }
        });
    });
    
    document.getElementById('submit-quiz').addEventListener('click', function(e) {
        e.preventDefault();
        let correctCount = 0;
        
        document.querySelectorAll('.quiz-question').forEach(questionDiv => {
            const questionIndex = questionDiv.getAttribute('data-question');
            const correctAnswer = questionDiv.getAttribute('data-correct');
            const userAnswer = selectedAnswers[questionIndex];
            const feedback = questionDiv.querySelector('.feedback');
            
            if (userAnswer === correctAnswer) {
                correctCount++;
                feedback.textContent = '✓ Correct!';
                feedback.style.backgroundColor = '#d4edda';
                feedback.style.color = '#155724';
                feedback.style.display = 'block';
            } else {
                feedback.textContent = `✗ Incorrect. The correct answer was ${correctAnswer}`;
                feedback.style.backgroundColor = '#f8d7da';
                feedback.style.color = '#721c24';
                feedback.style.display = 'block';
            }
        });
        
        const percentage = (correctCount / totalQuestions) * 100;
        
        if (percentage >= 60) {
            setTimeout(() => {
                overlay.remove();
                alert('Great job! You can now access this site.');
            }, 2000);
        } else {
            this.textContent = `Score: ${correctCount}/${totalQuestions} - Try Again (Need 60%)`;
            setTimeout(() => {
                location.reload();
            }, 3000);
        }
    });
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
    wikiBox.innerHTML = `<p style="font-family: Georgia, serif; font-size: 18px;">Loading Wikipedia article...</p>`;
    
    overlay.appendChild(wikiBox);
    document.body.appendChild(overlay);

    try {
        const summaryUrl = "https://en.wikipedia.org/api/rest_v1/page/random/summary";
        const summaryResponse = await fetch(summaryUrl);
        const summaryData = await summaryResponse.json();
        const title = summaryData.title;
        
        const apiUrl = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&format=json&origin=*`;
        const wikiResponse = await fetch(apiUrl);
        const wikiData = await wikiResponse.json();
        const wikiHTML = wikiData.parse.text['*'];
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = wikiHTML;
        const wikiText = tempDiv.textContent.substring(0, 3000); // First 3000 chars
        
        // Display article
        document.getElementById('wiki-content').innerHTML = `
            <h1 style="all: initial; display: block; font-size: 32px; font-weight: bold; margin-bottom: 20px; color: #000; font-family: Georgia, serif;">
                Read this text about <span style="color: #ff0000; font-weight: bold;">${title}</span> and answer the questions to use this website.
            </h1>
            <div id="wiki-article" style="all: initial; display: block; font-family: Georgia, serif; font-size: 16px; line-height: 1.6; color: #000;">
                ${wikiHTML}
            </div>
            <div id="ai-questions" style="margin-top: 30px; padding: 15px; background: #f8f9fa; border: 1px solid #a2a9b1; border-radius: 2px;">
                <p style="font-family: sans-serif; font-size: 14px; color: #202122; text-align: center;">
                Generating questions...
                </p>
            </div>
        `;
        
        // Style Wikipedia content
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
        
        wikiContent.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
            h.style.fontWeight = 'bold';
            h.style.display = 'block';
        });
        
        wikiContent.querySelectorAll('img').forEach(img => {
            img.style.opacity = '1';
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
        });
        
        wikiContent.querySelectorAll('a').forEach(link => {
            link.style.color = '#0645ad';
            link.style.textDecoration = 'underline';
            let href = link.getAttribute('href');
            if (href && href.startsWith('/wiki/')) {
                link.setAttribute('href', `https://en.wikipedia.org${href}`);
            }
            link.setAttribute('target', '_blank');
        });

        wikiContent.querySelectorAll('span').forEach(span => {
            span.style.color = '#000';
            span.style.fontWeight = "900";
        });


        
const prompt = `Based on this Wikipedia article about "${title}", generate exactly 5 multiple choice questions. Format each question EXACTLY like this:

Q1: [Question text here]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
Correct: [A, B, C, or D]

Q2: [Question text here]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
Correct: [A, B, C, or D]

Q3: [Question text here]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
Correct: [A, B, C, or D]

Q4: [Question text here]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
Correct: [A, B, C, or D]

Q5: [Question text here]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
Correct: [A, B, C, or D]

Article text:
${wikiText}`;

        chrome.runtime.sendMessage(
            { action: "generateQuestions", prompt: prompt },
            (response) => {
                if (response.success) {
                    const questionsText = response.data.choices[0].message.content;
                    const quizHTML = generateQuizUI(questionsText);
                    document.getElementById('ai-questions').innerHTML = quizHTML;
                    attachQuizHandlers(overlay);
                } else {
                    throw new Error(response.error);
                }
            }
        );
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('wiki-content').innerHTML = `<p style="color: red;">Error loading content. Please try again.</p>`;
    }
}

checkIfBanned().then(isBanned => {
    if (isBanned) {
        showWikipediaOverlay();
    }
});