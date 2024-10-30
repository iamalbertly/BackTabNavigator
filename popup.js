// popup.js
document.addEventListener('DOMContentLoaded', () => {
    const modeSelect = document.getElementById('modeSelect');
    const domainInputSection = document.getElementById('domainInputSection');
    const domainInput = document.getElementById('domainInput');
    const addDomainButton = document.getElementById('addDomain');
    const addCurrentDomainButton = document.getElementById('addCurrentDomain');
    const domainList = document.getElementById('domainList');
  
    function updateDomainList() {
      chrome.storage.sync.get(['enabledDomains'], (result) => {
        const enabledDomains = result.enabledDomains || [];
        domainList.innerHTML = '';
        enabledDomains.forEach((domain) => {
          const li = document.createElement('li');
          li.textContent = domain;
          const removeButton = document.createElement('button');
          removeButton.textContent = 'Remove';
          removeButton.onclick = () => removeDomain(domain);
          li.appendChild(removeButton);
          domainList.appendChild(li);
        });
      });
    }
  
    function addDomain(domain) {
      chrome.storage.sync.get(['enabledDomains'], (result) => {
        const enabledDomains = result.enabledDomains || [];
        if (!enabledDomains.includes(domain)) {
          enabledDomains.push(domain);
          chrome.storage.sync.set({ enabledDomains }, () => {
            updateDomainList();
            chrome.runtime.sendMessage({
              action: 'modeChanged',
              mode: modeSelect.value,
              enabledDomains: enabledDomains
            });
          });
        }
      });
    }
  
    function removeDomain(domain) {
      chrome.storage.sync.get(['enabledDomains'], (result) => {
        const enabledDomains = result.enabledDomains || [];
        const index = enabledDomains.indexOf(domain);
        if (index > -1) {
          enabledDomains.splice(index, 1);
          chrome.storage.sync.set({ enabledDomains }, () => {
            updateDomainList();
            chrome.runtime.sendMessage({
              action: 'modeChanged',
              mode: modeSelect.value,
              enabledDomains: enabledDomains
            });
          });
        }
      });
    }
  
    modeSelect.addEventListener('change', () => {
      const mode = modeSelect.value;
      chrome.storage.sync.set({ mode });
      domainInputSection.style.display = mode === 'specific' ? 'block' : 'none';
  
      chrome.storage.sync.get(['enabledDomains'], (result) => {
        chrome.runtime.sendMessage({
          action: 'modeChanged',
          mode: mode,
          enabledDomains: result.enabledDomains || []
        });
      });
    });
  
    addDomainButton.addEventListener('click', () => {
      const domain = domainInput.value.trim();
      if (domain) {
        addDomain(domain);
        domainInput.value = '';
      }
    });
  
    addCurrentDomainButton.addEventListener('click', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        const currentDomain = getDomain(currentTab.url);
        if (currentDomain) {
          addDomain(currentDomain);
        }
      });
    });
  
    function getDomain(url) {
      try {
        return new URL(url).hostname.replace("www.", "");
      } catch {
        return "";
      }
    }
  
    chrome.storage.sync.get(['mode'], (result) => {
      modeSelect.value = result.mode || 'all';
      domainInputSection.style.display = result.mode === 'specific' ? 'block' : 'none';
    });
  
    updateDomainList();
  });