// content-script.js
console.log('Content script loaded');

function handleClick(event) {
  if (event.button === 0 && !event.ctrlKey && !event.metaKey) {
    if (!event.shiftKey) {
      event.preventDefault();
      chrome.runtime.sendMessage({
        action: 'openInBackgroundTab',
        url: event.target.href
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

document.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', handleClick);
});