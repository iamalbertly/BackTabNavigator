// content.js
console.log('Content script loaded');

let isEnabled = true;
let currentMode = 'all';
let enabledDomains = [];

// Function to check if the current domain is enabled
function isDomainEnabled() {
  if (currentMode === 'all') return true;
  if (currentMode === 'off') return false;
  if (currentMode === 'specific') {
    const currentDomain = window.location.hostname;
    return enabledDomains.includes(currentDomain);
  }
  return false;
}

// Function to setup or remove event listeners based on current state
function updateEventListeners() {
  document.querySelectorAll('a').forEach(link => {
    link.removeEventListener('click', handleClick);
    if (isDomainEnabled()) {
      link.addEventListener('click', handleClick);
    }
  });
}

// Listen for mode changes
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateMode') {
    currentMode = request.mode;
    enabledDomains = request.enabledDomains;
    updateEventListeners();
  }
});

// Initial setup
chrome.storage.sync.get(['mode', 'enabledDomains'], (result) => {
  currentMode = result.mode || 'all';
  enabledDomains = result.enabledDomains || [];
  updateEventListeners();
});

// Add mutation observer to handle dynamically added links
const observer = new MutationObserver((mutations) => {
  if (isDomainEnabled()) {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) { // ELEMENT_NODE
          const links = node.matches('a') ? [node] : node.querySelectorAll('a');
          links.forEach(link => {
            link.addEventListener('click', handleClick);
          });
        }
      });
    });
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

function handleClick(event) {
  if (event.button === 0 && !event.ctrlKey && !event.metaKey) {
    if (!event.shiftKey) {
      event.preventDefault();
      const url = new URL(event.target.closest('a').href, window.location.href).href;
      chrome.runtime.sendMessage({
        action: 'openInBackgroundTab',
        url: url
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('BackTab Navigator Error:', chrome.runtime.lastError.message);
        }
      });
    } else {
      // Shift-click, open the link normally
      return true;
    }
  }
}
