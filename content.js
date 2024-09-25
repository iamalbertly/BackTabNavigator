// content.js
console.log('Content script loaded');

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

document.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', handleClick);
});
