// popup.js
document.addEventListener('DOMContentLoaded', () => {
  const modeSelect = document.getElementById('modeSelect');
  const urlInputSection = document.getElementById('urlInputSection');
  const urlInput = document.getElementById('urlInput');
  const addUrlButton = document.getElementById('addUrl');
  const urlList = document.getElementById('urlList');

  function updateUrlList() {
    chrome.storage.sync.get(['enabledUrls'], (result) => {
      const enabledUrls = result.enabledUrls || [];
      urlList.innerHTML = '';
      enabledUrls.forEach((url) => {
        const li = document.createElement('li');
        li.textContent = url;
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.onclick = () => removeUrl(url);
        li.appendChild(removeButton);
        urlList.appendChild(li);
      });
    });
  }

  function addUrl(url) {
    chrome.storage.sync.get(['enabledUrls'], (result) => {
      const enabledUrls = result.enabledUrls || [];
      if (!enabledUrls.includes(url)) {
        enabledUrls.push(url);
        chrome.storage.sync.set({ enabledUrls }, updateUrlList);
      }
    });
  }

  function removeUrl(url) {
    chrome.storage.sync.get(['enabledUrls'], (result) => {
      const enabledUrls = result.enabledUrls || [];
      const index = enabledUrls.indexOf(url);
      if (index > -1) {
        enabledUrls.splice(index, 1);
        chrome.storage.sync.set({ enabledUrls }, updateUrlList);
      }
    });
  }

  modeSelect.addEventListener('change', () => {
    const mode = modeSelect.value;
    chrome.storage.sync.set({ mode });
    urlInputSection.style.display = mode === 'specific' ? 'block' : 'none';
  });

  addUrlButton.addEventListener('click', () => {
    const url = urlInput.value.trim();
    if (url) {
      addUrl(url);
      urlInput.value = '';
    }
  });

  chrome.storage.sync.get(['mode'], (result) => {
    modeSelect.value = result.mode || 'off';
    urlInputSection.style.display = result.mode === 'specific' ? 'block' : 'none';
  });

  updateUrlList();
});