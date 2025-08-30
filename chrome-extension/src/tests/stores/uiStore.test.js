import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '../../stores/uiStore';

describe('UIStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    
    // Reset to initial state
    useUIStore.setState({
      // Input & Chat UI State
      inputValue: '',
      loading: false,
      
      // Modal States
      referenceModalVisible: false,
      modelSelectionModalVisible: false,
      currentSelection: null,
      selectedModels: [],
      
      // UI Layout States
      isExpanded: false,
      turboMode: false,
      
      // Screenshot States
      isScreenshotMode: false,
      screenshotData: null,
      
      // File Upload States
      currentSessionFiles: []
    });
  });

  describe('Input State Management', () => {
    describe('setInputValue', () => {
      it('should update input value', () => {
        const { setInputValue } = useUIStore.getState();
        
        setInputValue('Hello world');
        
        const state = useUIStore.getState();
        expect(state.inputValue).toBe('Hello world');
      });

      it('should handle empty string', () => {
        const { setInputValue } = useUIStore.getState();
        
        setInputValue('test');
        setInputValue('');
        
        const state = useUIStore.getState();
        expect(state.inputValue).toBe('');
      });

      it('should handle special characters and newlines', () => {
        const { setInputValue } = useUIStore.getState();
        const testValue = 'Line 1\nLine 2\nSpecial chars: !@#$%^&*()';
        
        setInputValue(testValue);
        
        const state = useUIStore.getState();
        expect(state.inputValue).toBe(testValue);
      });
    });

    describe('clearInput', () => {
      it('should reset input value to empty string', () => {
        const { setInputValue, clearInput } = useUIStore.getState();
        
        setInputValue('Some text');
        clearInput();
        
        const state = useUIStore.getState();
        expect(state.inputValue).toBe('');
      });

      it('should work when input is already empty', () => {
        const { clearInput } = useUIStore.getState();
        
        clearInput();
        
        const state = useUIStore.getState();
        expect(state.inputValue).toBe('');
      });
    });

    describe('setLoading', () => {
      it('should update loading state to true', () => {
        const { setLoading } = useUIStore.getState();
        
        setLoading(true);
        
        const state = useUIStore.getState();
        expect(state.loading).toBe(true);
      });

      it('should update loading state to false', () => {
        const { setLoading } = useUIStore.getState();
        
        setLoading(true);
        setLoading(false);
        
        const state = useUIStore.getState();
        expect(state.loading).toBe(false);
      });
    });
  });

  describe('Modal State Management', () => {
    describe('setReferenceModalVisible', () => {
      it('should show reference modal', () => {
        const { setReferenceModalVisible } = useUIStore.getState();
        
        setReferenceModalVisible(true);
        
        const state = useUIStore.getState();
        expect(state.referenceModalVisible).toBe(true);
      });

      it('should hide reference modal', () => {
        const { setReferenceModalVisible } = useUIStore.getState();
        
        setReferenceModalVisible(true);
        setReferenceModalVisible(false);
        
        const state = useUIStore.getState();
        expect(state.referenceModalVisible).toBe(false);
      });
    });

    describe('setModelSelectionModalVisible', () => {
      it('should show model selection modal', () => {
        const { setModelSelectionModalVisible } = useUIStore.getState();
        
        setModelSelectionModalVisible(true);
        
        const state = useUIStore.getState();
        expect(state.modelSelectionModalVisible).toBe(true);
      });

      it('should hide model selection modal', () => {
        const { setModelSelectionModalVisible } = useUIStore.getState();
        
        setModelSelectionModalVisible(true);
        setModelSelectionModalVisible(false);
        
        const state = useUIStore.getState();
        expect(state.modelSelectionModalVisible).toBe(false);
      });
    });

    describe('setCurrentSelection', () => {
      it('should update current selection', () => {
        const { setCurrentSelection } = useUIStore.getState();
        const selection = { text: 'Selected text', url: 'https://example.com' };
        
        setCurrentSelection(selection);
        
        const state = useUIStore.getState();
        expect(state.currentSelection).toEqual(selection);
      });

      it('should handle null selection', () => {
        const { setCurrentSelection } = useUIStore.getState();
        
        setCurrentSelection({ text: 'test' });
        setCurrentSelection(null);
        
        const state = useUIStore.getState();
        expect(state.currentSelection).toBe(null);
      });
    });

    describe('selectedModels array management', () => {
      describe('setSelectedModels', () => {
        it('should set models array', () => {
          const { setSelectedModels } = useUIStore.getState();
          const models = ['gpt-4', 'gemini-2.5-flash'];
          
          setSelectedModels(models);
          
          const state = useUIStore.getState();
          expect(state.selectedModels).toEqual(models);
        });

        it('should replace existing models', () => {
          const { setSelectedModels } = useUIStore.getState();
          
          setSelectedModels(['gpt-4']);
          setSelectedModels(['gemini-2.5-flash', 'claude-3']);
          
          const state = useUIStore.getState();
          expect(state.selectedModels).toEqual(['gemini-2.5-flash', 'claude-3']);
        });
      });

      describe('addSelectedModel', () => {
        it('should add model to array', () => {
          const { addSelectedModel } = useUIStore.getState();
          
          addSelectedModel('gpt-4');
          
          const state = useUIStore.getState();
          expect(state.selectedModels).toContain('gpt-4');
        });

        it('should not add duplicate models', () => {
          const { addSelectedModel } = useUIStore.getState();
          
          addSelectedModel('gpt-4');
          addSelectedModel('gpt-4');
          
          const state = useUIStore.getState();
          expect(state.selectedModels).toEqual(['gpt-4']);
        });

        it('should add multiple different models', () => {
          const { addSelectedModel } = useUIStore.getState();
          
          addSelectedModel('gpt-4');
          addSelectedModel('gemini-2.5-flash');
          addSelectedModel('claude-3');
          
          const state = useUIStore.getState();
          expect(state.selectedModels).toEqual(['gpt-4', 'gemini-2.5-flash', 'claude-3']);
        });
      });

      describe('removeSelectedModel', () => {
        it('should remove model from array', () => {
          const { setSelectedModels, removeSelectedModel } = useUIStore.getState();
          
          setSelectedModels(['gpt-4', 'gemini-2.5-flash']);
          removeSelectedModel('gpt-4');
          
          const state = useUIStore.getState();
          expect(state.selectedModels).toEqual(['gemini-2.5-flash']);
        });

        it('should handle removing non-existent model', () => {
          const { setSelectedModels, removeSelectedModel } = useUIStore.getState();
          
          setSelectedModels(['gpt-4']);
          removeSelectedModel('non-existent');
          
          const state = useUIStore.getState();
          expect(state.selectedModels).toEqual(['gpt-4']);
        });

        it('should handle empty array', () => {
          const { removeSelectedModel } = useUIStore.getState();
          
          removeSelectedModel('gpt-4');
          
          const state = useUIStore.getState();
          expect(state.selectedModels).toEqual([]);
        });
      });

      describe('clearSelectedModels', () => {
        it('should clear all selected models', () => {
          const { setSelectedModels, clearSelectedModels } = useUIStore.getState();
          
          setSelectedModels(['gpt-4', 'gemini-2.5-flash', 'claude-3']);
          clearSelectedModels();
          
          const state = useUIStore.getState();
          expect(state.selectedModels).toEqual([]);
        });

        it('should work when array is already empty', () => {
          const { clearSelectedModels } = useUIStore.getState();
          
          clearSelectedModels();
          
          const state = useUIStore.getState();
          expect(state.selectedModels).toEqual([]);
        });
      });
    });
  });

  describe('Layout State Management', () => {
    describe('setIsExpanded', () => {
      it('should set expanded state to true', () => {
        const { setIsExpanded } = useUIStore.getState();
        
        setIsExpanded(true);
        
        const state = useUIStore.getState();
        expect(state.isExpanded).toBe(true);
      });

      it('should set expanded state to false', () => {
        const { setIsExpanded } = useUIStore.getState();
        
        setIsExpanded(true);
        setIsExpanded(false);
        
        const state = useUIStore.getState();
        expect(state.isExpanded).toBe(false);
      });
    });

    describe('toggleExpanded', () => {
      it('should toggle from false to true', () => {
        const { toggleExpanded } = useUIStore.getState();
        
        toggleExpanded();
        
        const state = useUIStore.getState();
        expect(state.isExpanded).toBe(true);
      });

      it('should toggle from true to false', () => {
        const { setIsExpanded, toggleExpanded } = useUIStore.getState();
        
        setIsExpanded(true);
        toggleExpanded();
        
        const state = useUIStore.getState();
        expect(state.isExpanded).toBe(false);
      });

      it('should toggle multiple times correctly', () => {
        const { toggleExpanded } = useUIStore.getState();
        
        toggleExpanded(); // false -> true
        toggleExpanded(); // true -> false
        toggleExpanded(); // false -> true
        
        const state = useUIStore.getState();
        expect(state.isExpanded).toBe(true);
      });
    });

    describe('setTurboMode', () => {
      it('should enable turbo mode', () => {
        const { setTurboMode } = useUIStore.getState();
        
        setTurboMode(true);
        
        const state = useUIStore.getState();
        expect(state.turboMode).toBe(true);
      });

      it('should disable turbo mode', () => {
        const { setTurboMode } = useUIStore.getState();
        
        setTurboMode(true);
        setTurboMode(false);
        
        const state = useUIStore.getState();
        expect(state.turboMode).toBe(false);
      });
    });
  });

  describe('Screenshot State Management', () => {
    describe('setIsScreenshotMode', () => {
      it('should activate screenshot mode', () => {
        const { setIsScreenshotMode } = useUIStore.getState();
        
        setIsScreenshotMode(true);
        
        const state = useUIStore.getState();
        expect(state.isScreenshotMode).toBe(true);
      });

      it('should deactivate screenshot mode', () => {
        const { setIsScreenshotMode } = useUIStore.getState();
        
        setIsScreenshotMode(true);
        setIsScreenshotMode(false);
        
        const state = useUIStore.getState();
        expect(state.isScreenshotMode).toBe(false);
      });
    });

    describe('setScreenshotData', () => {
      it('should store screenshot data', () => {
        const { setScreenshotData } = useUIStore.getState();
        const screenshotData = {
          type: 'inline',
          data: 'data:image/png;base64,test',
          mimeType: 'image/png',
          name: 'screenshot.png'
        };
        
        setScreenshotData(screenshotData);
        
        const state = useUIStore.getState();
        expect(state.screenshotData).toEqual(screenshotData);
      });

      it('should update existing screenshot data', () => {
        const { setScreenshotData } = useUIStore.getState();
        
        setScreenshotData({ name: 'first.png' });
        setScreenshotData({ name: 'second.png' });
        
        const state = useUIStore.getState();
        expect(state.screenshotData).toEqual({ name: 'second.png' });
      });
    });

    describe('clearScreenshotData', () => {
      it('should remove screenshot data', () => {
        const { setScreenshotData, clearScreenshotData } = useUIStore.getState();
        
        setScreenshotData({ name: 'test.png' });
        clearScreenshotData();
        
        const state = useUIStore.getState();
        expect(state.screenshotData).toBe(null);
      });

      it('should work when screenshot data is already null', () => {
        const { clearScreenshotData } = useUIStore.getState();
        
        clearScreenshotData();
        
        const state = useUIStore.getState();
        expect(state.screenshotData).toBe(null);
      });
    });
  });

  describe('File Management', () => {
    describe('setCurrentSessionFiles', () => {
      it('should set current session files', () => {
        const { setCurrentSessionFiles } = useUIStore.getState();
        const files = [
          { name: 'file1.png', data: 'data1' },
          { name: 'file2.jpg', data: 'data2' }
        ];
        
        setCurrentSessionFiles(files);
        
        const state = useUIStore.getState();
        expect(state.currentSessionFiles).toEqual(files);
      });

      it('should replace existing files', () => {
        const { setCurrentSessionFiles } = useUIStore.getState();
        
        setCurrentSessionFiles([{ name: 'old.png' }]);
        setCurrentSessionFiles([{ name: 'new.png' }]);
        
        const state = useUIStore.getState();
        expect(state.currentSessionFiles).toEqual([{ name: 'new.png' }]);
      });
    });

    describe('clearCurrentSessionFiles', () => {
      it('should clear current session files', () => {
        const { setCurrentSessionFiles, clearCurrentSessionFiles } = useUIStore.getState();
        
        setCurrentSessionFiles([{ name: 'test.png' }]);
        clearCurrentSessionFiles();
        
        const state = useUIStore.getState();
        expect(state.currentSessionFiles).toEqual([]);
      });

      it('should work when files array is already empty', () => {
        const { clearCurrentSessionFiles } = useUIStore.getState();
        
        clearCurrentSessionFiles();
        
        const state = useUIStore.getState();
        expect(state.currentSessionFiles).toEqual([]);
      });
    });
  });

  describe('State Reset Logic', () => {
    describe('resetUIState', () => {
      it('should reset session-specific state', () => {
        const { 
          setInputValue, 
          setLoading, 
          setReferenceModalVisible,
          setModelSelectionModalVisible,
          setCurrentSelection,
          addSelectedModel,
          setIsScreenshotMode,
          setScreenshotData,
          setCurrentSessionFiles,
          resetUIState
        } = useUIStore.getState();
        
        // Set various session-specific state
        setInputValue('test input');
        setLoading(true);
        setReferenceModalVisible(true);
        setModelSelectionModalVisible(true);
        setCurrentSelection({ text: 'test' });
        addSelectedModel('gpt-4');
        setIsScreenshotMode(true);
        setScreenshotData({ name: 'test.png' });
        setCurrentSessionFiles([{ name: 'file.png' }]);
        
        resetUIState();
        
        const state = useUIStore.getState();
        
        // Session-specific state should be reset
        expect(state.inputValue).toBe('');
        expect(state.loading).toBe(false);
        expect(state.referenceModalVisible).toBe(false);
        expect(state.modelSelectionModalVisible).toBe(false);
        expect(state.currentSelection).toBe(null);
        expect(state.selectedModels).toEqual([]);
        expect(state.isScreenshotMode).toBe(false);
        expect(state.screenshotData).toBe(null);
        expect(state.currentSessionFiles).toEqual([]);
      });

      it('should preserve user preferences', () => {
        const { 
          setIsExpanded, 
          setTurboMode, 
          resetUIState 
        } = useUIStore.getState();
        
        // Set user preferences
        setIsExpanded(true);
        setTurboMode(true);
        
        resetUIState();
        
        const state = useUIStore.getState();
        
        // User preferences should be preserved
        expect(state.isExpanded).toBe(true);
        expect(state.turboMode).toBe(true);
      });

      it('should work when state is already reset', () => {
        const { resetUIState } = useUIStore.getState();
        
        resetUIState();
        const firstState = useUIStore.getState();
        
        resetUIState();
        const secondState = useUIStore.getState();
        
        expect(secondState).toEqual(firstState);
      });
    });
  });

  describe('Computed Selectors', () => {
    describe('getUIState', () => {
      it('should return computed UI state object', () => {
        const { getUIState } = useUIStore.getState();
        
        const uiState = getUIState();
        
        expect(uiState).toHaveProperty('inputValue');
        expect(uiState).toHaveProperty('loading');
        expect(uiState).toHaveProperty('isExpanded');
        expect(uiState).toHaveProperty('turboMode');
        expect(uiState).toHaveProperty('hasScreenshot');
        expect(uiState).toHaveProperty('hasFiles');
        expect(uiState).toHaveProperty('hasSelection');
        expect(uiState).toHaveProperty('isAnyModalOpen');
      });

      it('should compute hasScreenshot correctly', () => {
        const { setScreenshotData, getUIState } = useUIStore.getState();
        
        let uiState = getUIState();
        expect(uiState.hasScreenshot).toBe(false);
        
        setScreenshotData({ name: 'test.png' });
        uiState = getUIState();
        expect(uiState.hasScreenshot).toBe(true);
      });

      it('should compute hasFiles correctly', () => {
        const { setCurrentSessionFiles, getUIState } = useUIStore.getState();
        
        let uiState = getUIState();
        expect(uiState.hasFiles).toBe(false);
        
        setCurrentSessionFiles([{ name: 'test.png' }]);
        uiState = getUIState();
        expect(uiState.hasFiles).toBe(true);
      });

      it('should compute hasSelection correctly', () => {
        const { setCurrentSelection, getUIState } = useUIStore.getState();
        
        let uiState = getUIState();
        expect(uiState.hasSelection).toBe(false);
        
        setCurrentSelection({ text: 'selected text' });
        uiState = getUIState();
        expect(uiState.hasSelection).toBe(true);
      });

      it('should compute isAnyModalOpen correctly', () => {
        const { 
          setReferenceModalVisible, 
          setModelSelectionModalVisible, 
          getUIState 
        } = useUIStore.getState();
        
        let uiState = getUIState();
        expect(uiState.isAnyModalOpen).toBe(false);
        
        setReferenceModalVisible(true);
        uiState = getUIState();
        expect(uiState.isAnyModalOpen).toBe(true);
        
        setReferenceModalVisible(false);
        setModelSelectionModalVisible(true);
        uiState = getUIState();
        expect(uiState.isAnyModalOpen).toBe(true);
        
        setModelSelectionModalVisible(false);
        uiState = getUIState();
        expect(uiState.isAnyModalOpen).toBe(false);
      });

      it('should return current state values', () => {
        const { 
          setInputValue, 
          setLoading, 
          setIsExpanded, 
          setTurboMode, 
          getUIState 
        } = useUIStore.getState();
        
        setInputValue('test input');
        setLoading(true);
        setIsExpanded(true);
        setTurboMode(true);
        
        const uiState = getUIState();
        
        expect(uiState.inputValue).toBe('test input');
        expect(uiState.loading).toBe(true);
        expect(uiState.isExpanded).toBe(true);
        expect(uiState.turboMode).toBe(true);
      });
    });
  });

  describe('Complex State Interactions', () => {
    it('should handle multiple state changes correctly', () => {
      const { 
        setInputValue,
        setLoading,
        setIsExpanded,
        addSelectedModel,
        setScreenshotData,
        getUIState
      } = useUIStore.getState();
      
      // Simulate complex user interaction
      setInputValue('Hello AI');
      setLoading(true);
      setIsExpanded(true);
      addSelectedModel('gpt-4');
      addSelectedModel('gemini-2.5-flash');
      setScreenshotData({ name: 'screenshot.png' });
      
      const state = useUIStore.getState();
      const uiState = getUIState();
      
      expect(state.inputValue).toBe('Hello AI');
      expect(state.loading).toBe(true);
      expect(state.isExpanded).toBe(true);
      expect(state.selectedModels).toEqual(['gpt-4', 'gemini-2.5-flash']);
      expect(uiState.hasScreenshot).toBe(true);
      expect(uiState.hasFiles).toBe(false);
    });

    it('should maintain state consistency after reset', () => {
      const { 
        setInputValue,
        setIsExpanded,
        setTurboMode,
        addSelectedModel,
        setScreenshotData,
        resetUIState,
        getUIState
      } = useUIStore.getState();
      
      // Set mixed state
      setInputValue('test');
      setIsExpanded(true);
      setTurboMode(true);
      addSelectedModel('gpt-4');
      setScreenshotData({ name: 'test.png' });
      
      resetUIState();
      
      const state = useUIStore.getState();
      const uiState = getUIState();
      
      // Session state should be reset
      expect(state.inputValue).toBe('');
      expect(state.selectedModels).toEqual([]);
      expect(uiState.hasScreenshot).toBe(false);
      
      // User preferences should be preserved
      expect(state.isExpanded).toBe(true);
      expect(state.turboMode).toBe(true);
    });
  });
});
