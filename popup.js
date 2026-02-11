
document.addEventListener('DOMContentLoaded', async () => {
    const data = await chrome.storage.local.get(['bannedSites', 'unbannedSites']);
    console.log('Current banned sites:', data.bannedSites || []);
});


document.getElementById('activateForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const url = document.getElementById('fname').value.trim();
    if (!url) return;
    
    const data = await chrome.storage.local.get(['bannedSites']);
    const bannedSites = data.bannedSites || [];
    
    if (!bannedSites.includes(url)) {
        bannedSites.push(url);
        await chrome.storage.local.set({ bannedSites });
        alert(`${url} is now blocked!`);
    } else {
        alert(`${url} is already blocked.`);
    }
    
    document.getElementById('fname').value = '';
});

document.getElementById('deactivateForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const url = document.getElementById('lname').value.trim();
    if (!url) return;
    
    const data = await chrome.storage.local.get(['bannedSites', 'unbannedSites']);
    const bannedSites = data.bannedSites || [];
    const unbannedSites = data.unbannedSites || {};
    
    if (bannedSites.includes(url)) {
        const unbanTime = Date.now() + (60 * 60 * 1000); 
        unbannedSites[url] = unbanTime;
        
        await chrome.storage.local.set({ unbannedSites });
        
        const unbanDate = new Date(unbanTime);
        alert(`${url} will be unblocked at ${unbanDate.toLocaleTimeString()}`);
    } else {
        alert(`${url} is not currently blocked.`);
    }
    
    document.getElementById('lname').value = '';
});

