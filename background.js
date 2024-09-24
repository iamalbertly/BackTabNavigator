// background.js
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ 
    enabledUrls: [],
    mode: 'off', // 'off', 'all', or 'specific'
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.storage.sync.get(['mode', 'enabledUrls'], (result) => {
      const { mode, enabledUrls } = result;
      if (mode === 'all' || (mode === 'specific' && enabledUrls.some(url => tab.url.includes(url)))) {
        chrome.tabs.sendMessage(tabId, { action: 'enableBackTabNavigator' });
      }
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openInBackgroundTab') {
    chrome.tabs.create({ url: request.url, active: false });
  } else if (request.action === 'logError') {
    console.error('BackTab Navigator Error:', request.error);
    // You could also implement more sophisticated error logging here
  }
});