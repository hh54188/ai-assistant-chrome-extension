import { useState, useEffect } from 'react';

const usePageSelection = () => {
  const [selection, setSelection] = useState(null);

  // Function to clarify text by removing empty lines and trimming whitespace
  const clearText = (text) => {
    if (!text) return text;
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n')
      .trim();
  };

  // Function to get user selection (same logic as content script)
  const getUserSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      // Get the selected text
      const selectedText = selection.toString().trim();
      
      // Get the HTML of the selected element(s)
      let selectedHTML = '';
      let selectedElement = null;
      
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        
        // If the selection is within a single element
        if (container.nodeType === Node.ELEMENT_NODE) {
          selectedElement = container;
          selectedHTML = container.outerHTML;
        } else {
          // If the selection spans multiple elements, get the parent element
          selectedElement = container.parentElement;
          selectedHTML = selectedElement.outerHTML;
        }
      }
      
      return {
        text: clearText(selectedText),
        html: selectedHTML,
        element: selectedElement,
        url: window.location.href,
        title: document.title
      };
    }
    return null;
  };

  const getCurrentSelection = () => {
    return new Promise((resolve) => {
      // Check if we're running as a Chrome extension (iframe scenario)
      if (window.parent && window.parent !== window) {
        // Chrome extension mode - use message passing
        const handleSelectionResponse = (event) => {
          if (event.data.type === 'SELECTION_DATA' && event.data.data) {
            console.log("================ selectionData in chrome extension mode ==================")
            console.log(event.data.data);
            // Clarify the text in the received selection data
            const clarifiedData = {
              ...event.data.data,
              text: clearText(event.data.data.text)
            };
            setSelection(clarifiedData);
            window.removeEventListener('message', handleSelectionResponse);
            resolve(clarifiedData);
          }
        };

        // Add the listener
        window.addEventListener('message', handleSelectionResponse);

        // Send message to content script to get current selection
        window.parent.postMessage({
          type: 'GET_SELECTION'
        }, '*');

        // Set a timeout in case the content script doesn't respond
        setTimeout(() => {
          window.removeEventListener('message', handleSelectionResponse);
          resolve(null);
        }, 500);
      } else {
        // Standalone app mode - get selection directly
        const selectionData = getUserSelection();
        console.log("================ selectionData in standalone app mode ==================")
        console.log(selectionData);
        if (selectionData) {
          setSelection(selectionData);
          resolve(selectionData);
        } else {
          resolve(null);
        }
      }
    });
  };

  useEffect(() => {
    // Listen for selection data from content script (for automatic updates in extension mode)
    const handleMessage = (event) => {
      if (event.data.type === 'SELECTION_DATA' && event.data.data) {
        // Clarify the text in the received selection data
        const clarifiedData = {
          ...event.data.data,
          text: clearText(event.data.data.text)
        };
        setSelection(clarifiedData);
      }
    };

    // Only add message listener if we're in extension mode
    if (window.parent && window.parent !== window) {
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, []);

  return { selection, getCurrentSelection };
};

export default usePageSelection; 