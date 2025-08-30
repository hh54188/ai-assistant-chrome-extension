// Content script for Him
let sidebarContainer = null;
let isSidebarOpen = false;
let isExpanded = false;
let isTurboModeExpanded = false;
let selectedModelsCount = 0;

// Screen capture variables
let isScreenshotMode = false;
let isMouseDown = false;
let startPos = { x: 0, y: 0 };
let currentPos = { x: 0, y: 0 };
let overlayElement = null;
let selectionRectangle = null;

// Store screenshot data in content script to avoid cross-origin issues
let currentScreenshotData = null;

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleSidebar') {
    toggleSidebar();
  }
  sendResponse({ success: true });
});

function toggleSidebar() {
  if (!sidebarContainer) {
    createSidebar();
  }
  
  isSidebarOpen = !isSidebarOpen;
  
  if (isSidebarOpen) {
    updateSidebarPosition();
    sidebarContainer.style.display = 'block';
  } else {
    sidebarContainer.style.right = `-${getSidebarWidth()}px`;
    setTimeout(() => {
      if (!isSidebarOpen) {
        sidebarContainer.style.display = 'none';
      }
    }, 300);
  }
}

function getSidebarWidth() {
  if (isTurboModeExpanded && selectedModelsCount > 0) {
    // Dynamic width based on number of selected models for turbo mode
    return Math.max(450, Math.min(1200, 300 + (selectedModelsCount * 350)));
  }
  return isExpanded ? 1024 : 450;
}

function updateSidebarPosition() {
  const width = getSidebarWidth();
  sidebarContainer.style.width = `${width}px`;
  sidebarContainer.style.right = '0';
}

function createSidebar() {
  // Create container for the sidebar
  sidebarContainer = document.createElement('div');
  sidebarContainer.id = 'ai-copilot-sidebar-container';
  sidebarContainer.style.cssText = `
    position: fixed;
    top: 0;
    right: -450px;
    width: 450px;
    height: 100vh;
    z-index: 999999;
    background: white;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
    transition: right 0.3s ease, width 0.3s ease;
    display: none;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  // Create iframe to load the React app
  const iframe = document.createElement('iframe');
  iframe.src = chrome.runtime.getURL('sidebar.html');
  iframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
    background: white;
  `;

  // Create close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '×';
  closeButton.style.cssText = `
    position: absolute;
    top: 10px;
    left: 17px;
    width: 30px;
    height: 30px;
    border: none;
    background: #f0f0f0;
    border-radius: 50%;
    cursor: pointer;
    font-size: 18px;
    z-index: 1000000;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  closeButton.onclick = () => {
    isSidebarOpen = false;
    sidebarContainer.style.right = `-${getSidebarWidth()}px`;
    setTimeout(() => {
      sidebarContainer.style.display = 'none';
    }, 300);
  };

  sidebarContainer.appendChild(closeButton);
  sidebarContainer.appendChild(iframe);
  document.body.appendChild(sidebarContainer);
}

// Add keyboard shortcut (Ctrl+Shift+A or Cmd+Shift+A)
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
    e.preventDefault();
    toggleSidebar();
  }
});

// Function to get user selection
function getUserSelection() {
  const selection = window.getSelection();
  if (selection && selection.toString().trim()) {
    // Get the selected text
    const selectedText = selection.toString().trim();
    
    // Get the HTML of the selected element(s)
    let selectedHTML = '';
    
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      
      // If the selection is within a single element
      if (container.nodeType === Node.ELEMENT_NODE) {
        selectedHTML = container.outerHTML;
      } else {
        // If the selection spans multiple elements, get the parent element
        const selectedElement = container.parentElement;
        selectedHTML = selectedElement.outerHTML;
      }
    }
    
    return {
      text: selectedText,
      html: selectedHTML,
      url: window.location.href,
      title: document.title
    };
  }
  return null;
}

// Listen for messages from the sidebar iframe
window.addEventListener('message', (event) => {
  // Verify the message is from our sidebar - use safer origin checking
  try {
    // Check if the origin is from our extension
    if (event.origin && event.origin.startsWith('chrome-extension://')) {
      console.log("================MESSAGE FROM SIDEBAR=================")
      console.log(event);
      if (event.data.type === 'GET_SELECTION') {
        const selection = getUserSelection();
        console.log("================SELECTION IN CONTENT SCRIPT=================")
        console.log(selection);
        event.source.postMessage({
          type: 'SELECTION_DATA',
          data: selection
        }, '*');
      } else if (event.data.type === 'TOGGLE_EXPAND') {
        isExpanded = event.data.expanded;
        if (isSidebarOpen) {
          updateSidebarPosition();
        }
      } else if (event.data.type === 'TOGGLE_TURBO_EXPAND') {
        isTurboModeExpanded = event.data.expanded;
        selectedModelsCount = event.data.selectedModelsCount || 0;
        if (isSidebarOpen) {
          updateSidebarPosition();
        }
      } else if (event.data.type === 'START_SCREENSHOT') {
        startScreenshotMode();
      } else if (event.data.type === 'STOP_SCREENSHOT') {
        stopScreenshotMode();
      } else if (event.data.type === 'GET_SCREENSHOT_DATA') {
        // Send screenshot data to sidebar
        if (currentScreenshotData) {
          event.source.postMessage({
            type: 'SCREENSHOT_DATA_AVAILABLE',
            data: currentScreenshotData
          }, '*');
        } else {
          event.source.postMessage({
            type: 'SCREENSHOT_DATA_NOT_AVAILABLE'
          }, '*');
        }
      } else if (event.data.type === 'CLEAR_SCREENSHOT_DATA') {
        // Clear screenshot data after it's been used
        currentScreenshotData = null;
        event.source.postMessage({
          type: 'SCREENSHOT_DATA_CLEARED'
        }, '*');
      }
    }
  } catch {
    // If we can't access the origin due to cross-origin restrictions,
    // we can still verify the message by checking if it's from our iframe
    // by looking at the source window or using a different approach
    console.log("Cross-origin message received, checking alternative verification");
    
    // Alternative verification: check if the message has our expected structure
    if (event.data && event.data.type === 'GET_SELECTION') {
      // Additional safety check: verify this is likely from our extension
      // by checking if the source is available and not null
      if (event.source && event.source !== window) {
        const selection = getUserSelection();
        console.log("================SELECTION IN CONTENT SCRIPT=================")
        console.log(selection);
        event.source.postMessage({
          type: 'SELECTION_DATA',
          data: selection
        }, '*');
      }
    } else if (event.data && event.data.type === 'TOGGLE_EXPAND') {
      isExpanded = event.data.expanded;
      if (isSidebarOpen) {
        updateSidebarPosition();
      }
    } else if (event.data && event.data.type === 'TOGGLE_TURBO_EXPAND') {
      isTurboModeExpanded = event.data.expanded;
      selectedModelsCount = event.data.selectedModelsCount || 0;
      if (isSidebarOpen) {
        updateSidebarPosition();
      }
    } else if (event.data && event.data.type === 'START_SCREENSHOT') {
      startScreenshotMode();
    } else if (event.data && event.data.type === 'STOP_SCREENSHOT') {
      stopScreenshotMode();
    } else if (event.data && event.data.type === 'GET_SCREENSHOT_DATA') {
      // Send screenshot data to sidebar
      if (currentScreenshotData) {
        event.source.postMessage({
          type: 'SCREENSHOT_DATA_AVAILABLE',
          data: currentScreenshotData
        }, '*');
      } else {
        event.source.postMessage({
          type: 'SCREENSHOT_DATA_NOT_AVAILABLE'
        }, '*');
      }
    } else if (event.data && event.data.type === 'CLEAR_SCREENSHOT_DATA') {
      // Clear screenshot data after it's been used
      currentScreenshotData = null;
      event.source.postMessage({
        type: 'SCREENSHOT_DATA_CLEARED'
      }, '*');
    }
  }
});

// Screen capture functions
function startScreenshotMode() {
  console.log('Starting screenshot mode');
  isScreenshotMode = true;
  createScreenshotOverlay();
  document.body.style.overflow = 'hidden';
}

function stopScreenshotMode() {
  console.log('Stopping screenshot mode');
  isScreenshotMode = false;
  removeScreenshotOverlay();
  document.body.style.overflow = '';
}

function createScreenshotOverlay() {
  // Remove existing overlay if any
  removeScreenshotOverlay();
  
  // Create overlay container
  overlayElement = document.createElement('div');
  overlayElement.id = 'screenshot-overlay';
  overlayElement.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.1);
    z-index: 999998;
    cursor: crosshair;
    user-select: none;
  `;
  
  // Create selection rectangle
  selectionRectangle = document.createElement('div');
  selectionRectangle.id = 'screenshot-selection';
  selectionRectangle.style.cssText = `
    position: absolute;
    border: 2px solid #007bff;
    background: rgba(0, 123, 255, 0.1);
    display: none;
    pointer-events: none;
  `;
  
  // Create instructions
  const instructions = document.createElement('div');
  instructions.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    z-index: 999999;
  `;
  instructions.textContent = 'Drag to select area • Press ESC to cancel';
  
  overlayElement.appendChild(selectionRectangle);
  overlayElement.appendChild(instructions);
  document.body.appendChild(overlayElement);
  
  // Add event listeners
  overlayElement.addEventListener('mousedown', handleMouseDown);
  overlayElement.addEventListener('mousemove', handleMouseMove);
  overlayElement.addEventListener('mouseup', handleMouseUp);
  
  // Add keyboard listener for ESC
  document.addEventListener('keydown', handleKeyDown);
}

function removeScreenshotOverlay() {
  if (overlayElement) {
    overlayElement.remove();
    overlayElement = null;
    selectionRectangle = null;
  }
  document.removeEventListener('keydown', handleKeyDown);
}

function handleMouseDown(e) {
  if (!isScreenshotMode) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  const rect = overlayElement.getBoundingClientRect();
  startPos = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
  currentPos = { ...startPos };
  isMouseDown = true;
  
  console.log('Mouse down:', startPos);
}

function handleMouseMove(e) {
  if (!isScreenshotMode || !isMouseDown) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  const rect = overlayElement.getBoundingClientRect();
  currentPos = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
  
  updateSelectionRectangle();
}

function handleMouseUp(e) {
  if (!isScreenshotMode || !isMouseDown) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  isMouseDown = false;
  
  // Calculate selection area
  const left = Math.min(startPos.x, currentPos.x);
  const top = Math.min(startPos.y, currentPos.y);
  const width = Math.abs(currentPos.x - startPos.x);
  const height = Math.abs(currentPos.y - startPos.y);
  
  console.log('Mouse up - selection:', { left, top, width, height });
  
  // Only capture if there's a meaningful selection
  if (width > 10 && height > 10) {
    captureScreenshot(left, top, width, height);
  }
  
  // Hide selection rectangle
  if (selectionRectangle) {
    selectionRectangle.style.display = 'none';
  }
}

function updateSelectionRectangle() {
  if (!selectionRectangle) return;
  
  const left = Math.min(startPos.x, currentPos.x);
  const top = Math.min(startPos.y, currentPos.y);
  const width = Math.abs(currentPos.x - startPos.x);
  const height = Math.abs(currentPos.y - startPos.y);
  
  if (width > 0 && height > 0) {
    selectionRectangle.style.left = `${left}px`;
    selectionRectangle.style.top = `${top}px`;
    selectionRectangle.style.width = `${width}px`;
    selectionRectangle.style.height = `${height}px`;
    selectionRectangle.style.display = 'block';
  }
}

function handleKeyDown(e) {
  if (e.key === 'Escape' && isScreenshotMode) {
    stopScreenshotMode();
    // Notify sidebar that screenshot was cancelled
    if (sidebarContainer && sidebarContainer.querySelector('iframe')) {
      const iframe = sidebarContainer.querySelector('iframe');
      iframe.contentWindow.postMessage({
        type: 'SCREENSHOT_CANCELLED'
      }, '*');
    }
  }
}

async function captureScreenshot(left, top, width, height) {
  try {
    console.log('Capturing screenshot with Chrome API...');
    
    // Use Chrome's native captureVisibleTab API
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        type: 'CAPTURE_VISIBLE_TAB'
      }, (response) => {
        if (response && response.success) {
          resolve(response);
        } else {
          reject(new Error(response?.error || 'Failed to capture screenshot'));
        }
      });
    });
    
    const fullScreenshotDataUrl = response.dataUrl;
    
    // Create a new canvas for the cropped area
    const croppedCanvas = document.createElement('canvas');
    const ctx = croppedCanvas.getContext('2d');
    
    croppedCanvas.width = width;
    croppedCanvas.height = height;
    
    // Create an image from the full screenshot
    const img = new Image();
    
    await new Promise((resolve, reject) => {
      img.onload = () => {
        // Calculate the source coordinates (no need to consider scroll position 
        // since captureVisibleTab captures what's currently visible)
        const sourceX = left;
        const sourceY = top;
        
        // Draw the cropped area
        ctx.drawImage(
          img, 
          sourceX, sourceY, width, height, 
          0, 0, width, height
        );
        
        resolve();
      };
      img.onerror = reject;
      img.src = fullScreenshotDataUrl;
    });
    
    // Convert to base64
    const base64Data = croppedCanvas.toDataURL('image/png');
    
    console.log('Screenshot captured successfully with Chrome API');
    
    // Store screenshot data in content script to avoid cross-origin issues
    currentScreenshotData = {
      type: 'inline',
      data: base64Data,
      mimeType: 'image/png',
      name: `screenshot-${Date.now()}.png`
    };
    
    // Send notification to sidebar that screenshot is ready
    if (sidebarContainer && sidebarContainer.querySelector('iframe')) {
      const iframe = sidebarContainer.querySelector('iframe');
      iframe.contentWindow.postMessage({
        type: 'SCREENSHOT_READY',
        message: 'Screenshot captured successfully! Click to view.'
      }, '*');
    }
    
    // Stop screenshot mode
    stopScreenshotMode();
    
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    // Notify sidebar of error
    if (sidebarContainer && sidebarContainer.querySelector('iframe')) {
      const iframe = sidebarContainer.querySelector('iframe');
      iframe.contentWindow.postMessage({
        type: 'SCREENSHOT_ERROR',
        error: error.message
      }, '*');
    }
  }
}

 