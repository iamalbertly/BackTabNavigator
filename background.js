// background.js
console.log('Background script loaded');

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    enabledDomains: [],
    mode: 'all', // 'all', 'specific', or 'off'
    usage: { all: 0, specific: 0 }
  });
});

chrome.action.onClicked.addListener((tab) => {
  console.log(`Action clicked: ${tab.url}`);
  applyMode(tab.id, tab);
});

function applyMode(tabId, tab) {
  // Check if the tab URL is an internal Chrome URL
  if (tab.url.startsWith('chrome://')) {
    return;
  }

  chrome.storage.sync.get(['mode', 'enabledDomains'], (result) => {
    const { mode, enabledDomains } = result;
    const domain = getDomain(tab.url);
    console.log(`Applying mode: ${mode} for domain: ${domain}`);
    if (mode === 'all' || (mode === 'specific' && enabledDomains.includes(domain))) {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('BackTab Navigator Error:', chrome.runtime.lastError.message);
        } else {
          console.log('BackTab Navigator enabled');
        }
      });
    }
  });
}

function getDomain(url) {
  try {
    const parsedUrl = new URL(url);
    // Handle IP addresses and port numbers
    if (parsedUrl.hostname.match(/^\d{1,3}(\.\d{1,3}){3}$/)) {
      return `${parsedUrl.hostname}:${parsedUrl.port}`;
    }
    return parsedUrl.hostname;
  } catch (error) {
    console.error('Error in getDomain:', error);
    return '';
  }
}

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
        sendResponse({ success: true });
      });
    });
    return true; // Indicate that we'll be sending a response asynchronously
  } else if (request.action === 'logError') {
    console.error('BackTab Navigator Error:', request.error);
  } else if (request.action === 'downloadFile') {
    downloadFile(request.url);
    sendResponse({ success: true });
  }
});

function downloadFile(url) {
  chrome.downloads.download({
    url: url,
    conflictAction: 'uniquify',
    saveAs: true
  }, (downloadId) => {
    if (chrome.runtime.lastError) {
      console.error('Download Error:', chrome.runtime.lastError.message);
    } else {
      console.log('Download started with ID:', downloadId);
    }
  });
}