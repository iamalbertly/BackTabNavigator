// background.js
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ 
    enabledUrls: [],
    mode: 'off', // 'off', 'all', or 'specific'
    usage: { all: 0, specific: 0 }
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    applyMode(tab);
  }
});

function applyMode(tab) {
  chrome.storage.sync.get(['mode', 'enabledUrls'], (result) => {
    const { mode, enabledUrls } = result;
    if (mode === 'all' || (mode === 'specific' && enabledUrls.some(url => tab.url.includes(url)))) {
      chrome.tabs.sendMessage(tab.id, { action: 'enableBackTabNavigator' });
    } else {
      chrome.tabs.sendMessage(tab.id, { action: 'disableBackTabNavigator' });
    }
  });
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.mode) {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(applyMode);
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openInBackgroundTab') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      chrome.tabs.create({ url: request.url, active: false, index: currentTab.index + 1 }, (newTab) => {
        // Update usage statistics
        chrome.storage.sync.get(['mode', 'usage'], (result) => {
          const { mode, usage } = result;
          if (mode === 'all' || mode === 'specific') {
            usage[mode]++;
            chrome.storage.sync.set({ usage });
          }
        });
      });
    });
  } else if (request.action === 'logError') {
    console.error('BackTab Navigator Error:', request.error);
  }
});