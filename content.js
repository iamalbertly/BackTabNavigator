// content.js
console.log('Content script loaded');

function handleClick(event) {
  if (event.button === 0 && !event.ctrlKey && !event.metaKey) {
    if (!event.shiftKey) {
      event.preventDefault();
      const url = event.target.href;
      if (isDownloadableMedia(url)) {
        chrome.runtime.sendMessage({
          action: 'downloadFile',
          url: url
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('BackTab Navigator Error:', chrome.runtime.lastError.message);
          }
        });
      } else {
        chrome.runtime.sendMessage({
          action: 'openInBackgroundTab',
          url: url
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('BackTab Navigator Error:', chrome.runtime.lastError.message);
          }
        });
      }
    } else {
      // Shift-click, open the link normally
      return true;
    }
  }
}

function isDownloadableMedia(url) {
  const downloadableExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.mp3', '.wav', '.flac'];
  return downloadableExtensions.some(ext => url.toLowerCase().endsWith(ext));
}

document.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', handleClick);
});
