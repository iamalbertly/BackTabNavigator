// background.js
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ enabledUrls: [] });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.storage.sync.get(['enabledUrls'], (result) => {
      const enabledUrls = result.enabledUrls || [];
      if (enabledUrls.some(url => tab.url.includes(url))) {
        chrome.tabs.sendMessage(tabId, { action: 'enableBackTabNavigator' });
      }
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openInBackgroundTab') {
    chrome.tabs.create({ url: request.url, active: false });
  }
});