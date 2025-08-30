// Background service worker for Him
chrome.action.onClicked.addListener((tab) => {
  // Send message to content script to toggle sidebar
  chrome.tabs.sendMessage(tab.id, { action: 'toggleSidebar' });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'injectSidebar') {
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      files: ['content.js']
    });
    sendResponse({ success: true });
  } else if (request.type === 'CAPTURE_VISIBLE_TAB') {
    chrome.tabs.captureVisibleTab(null, { 
      format: 'png', 
      quality: 100 
    }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        sendResponse({ 
          success: false, 
          error: chrome.runtime.lastError.message 
        });
      } else {
        sendResponse({ 
          success: true, 
          dataUrl: dataUrl 
        });
      }
    });
    return true; // Keep the message channel open for async response
  }
}); 