// content.js
function handleClick(event) {
  if (event.button === 0 && !event.ctrlKey && !event.metaKey) {
    event.preventDefault();
    chrome.runtime.sendMessage({
      action: 'openInBackgroundTab',
      url: event.target.href
    });
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'enableBackTabNavigator') {
    document.querySelectorAll('a').forEach(link => {
      link.removeEventListener('click', handleClick); // Remove existing listener to avoid duplicates
      link.addEventListener('click', handleClick);
    });
  }
});

// Error logging
window.addEventListener('error', function(event) {
  chrome.runtime.sendMessage({
    action: 'logError',
    error: {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error ? event.error.stack : null
    }
  });
});