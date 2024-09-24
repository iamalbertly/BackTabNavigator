// background.js
console.log('Background script loaded');

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ 
    enabledDomains: [],
    mode: 'all', // 'all', 'specific', or 'off'
    usage: { all: 0, specific: 0 }
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    console.log(`Tab updated: ${tab.url}`);
    try {
      applyMode(tabId, tab);
    } catch (error) {
      console.error('Error in applyMode:', error);
    }
  }
});

function applyMode(tabId, tab) {
  // Check if the tab URL is an internal Chrome URL
  if (tab.url.startsWith('chrome://')) {
    return;
  }

  chrome.storage.sync.get(['mode', 'enabledDomains'], (result) => {
    try {
      const { mode, enabledDomains } = result;
      const domain = getDomain(tab.url);
      console.log(`Applying mode: ${mode} for domain: ${domain}`);
      if (mode === 'all' || (mode === 'specific' && enabledDomains.includes(domain))) {
        try {
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
        } catch (executeScriptError) {
          console.error('Error in chrome.scripting.executeScript:', executeScriptError);
          console.log('TabId:', tabId);
          console.log('Tab URL:', tab.url);
        }
      } else {
        try {
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
          }, (response) => {
            if (chrome.runtime.lastError) {
              console.error('BackTab Navigator Error:', chrome.runtime.lastError.message);
            } else {
              console.log('BackTab Navigator disabled');
            }
          });
        } catch (executeScriptError) {
          console.error('Error in chrome.scripting.executeScript:', executeScriptError);
          console.log('TabId:', tabId);
          console.log('Tab URL:', tab.url);
        }
      }
    } catch (error) {
      console.error('Error in applyMode:', error);
    }
  });
}
function getDomain(url) {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname.includes('.') || parsedUrl.hostname.includes(':')) {
      return parsedUrl.hostname;
    } else {
      return url;
    }
  } catch (error) {
    console.error('Error in getDomain:', error);
    console.log('URL:', url);
    return '';
  }
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && 'mode' in changes) {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        try {
          applyMode(tab.id, tab);
        } catch (error) {
          console.error('Error in applyMode:', error);
        }
      });
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
          try {
            const { mode, usage } = result;
            if (mode === 'all' || mode === 'specific') {
              usage[mode]++;
              chrome.storage.sync.set({ usage });
            }
          } catch (error) {
            console.error('Error updating usage:', error);
          }
        });
        sendResponse({ success: true });
      });
    });
    return true; // Indicate that we'll be sending a response asynchronously
  } else if (request.action === 'logError') {
    console.error('BackTab Navigator Error:', request.error);
  }
});