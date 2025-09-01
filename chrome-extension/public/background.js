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
  } else if (request.action === 'copyToClipboard') {
    // Handle clipboard operations in the background script
    // This works because background scripts have full access to Chrome APIs
    try {
      navigator.clipboard.writeText(request.text).then(() => {
        sendResponse({ success: true });
      }).catch((error) => {
        console.error('Clipboard write failed:', error);
        sendResponse({ success: false, error: error.message });
      });
    } catch (error) {
      console.error('Clipboard operation failed:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true; // Keep the message channel open for async response
  }
}); 