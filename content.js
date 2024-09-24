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
      link.addEventListener('click', handleClick);
    });
  }
});