/**
 * Custom hooks for optimized store subscriptions
 * 
 * These hooks provide selective subscriptions for better performance
 * and cleaner component code.
 */

import { useUIStore, useChatStore } from './index';

// ==================== UI Store Selective Hooks ====================

/**
 * Hook for input-related UI state
 */
export const useInputState = () => {
    return useUIStore(state => ({
        inputValue: state.inputValue,
        setInputValue: state.setInputValue,
        clearInput: state.clearInput,
        loading: state.loading,
        setLoading: state.setLoading
    }));
};

/**
 * Hook for modal-related UI state
 */
export const useModalState = () => {
    return useUIStore(state => ({
        referenceModalVisible: state.referenceModalVisible,
        setReferenceModalVisible: state.setReferenceModalVisible,
        modelSelectionModalVisible: state.modelSelectionModalVisible,
        setModelSelectionModalVisible: state.setModelSelectionModalVisible,
        currentSelection: state.currentSelection,
        setCurrentSelection: state.setCurrentSelection
    }));
};

/**
 * Hook for layout-related UI state
 */
export const useLayoutState = () => {
    return useUIStore(state => ({
        isExpanded: state.isExpanded,
        setIsExpanded: state.setIsExpanded,
        turboMode: state.turboMode,
        setTurboMode: state.setTurboMode
    }));
};

/**
 * Hook for screenshot-related UI state
 */
export const useScreenshotState = () => {
    return useUIStore(state => ({
        isScreenshotMode: state.isScreenshotMode,
        setIsScreenshotMode: state.setIsScreenshotMode,
        screenshotData: state.screenshotData,
        setScreenshotData: state.setScreenshotData,
        clearScreenshotData: state.clearScreenshotData
    }));
};

/**
 * Hook for model selection state
 */
export const useModelSelectionState = () => {
    return useUIStore(state => ({
        selectedModels: state.selectedModels,
        setSelectedModels: state.setSelectedModels,
        addSelectedModel: state.addSelectedModel,
        removeSelectedModel: state.removeSelectedModel,
        clearSelectedModels: state.clearSelectedModels
    }));
};

// ==================== Chat Store Selective Hooks ====================

/**
 * Hook for current session information
 */
export const useCurrentSession = () => {
    return useChatStore(state => ({
        currentSessionId: state.currentSessionId,
        selectedProvider: state.selectedProvider,
        currentSession: state.getCurrentSession(),
        messages: state.getCurrentMessages(),
        setCurrentSession: state.setCurrentSession,
        setSelectedProvider: state.setSelectedProvider
    }));
};

/**
 * Hook for session management actions
 */
export const useSessionActions = () => {
    return useChatStore(state => ({
        createSession: state.createSession,
        deleteSession: state.deleteSession,
        updateSessionLabel: state.updateSessionLabel,
        setCurrentSession: state.setCurrentSession
    }));
};

/**
 * Hook for message management
 */
export const useMessageActions = () => {
    return useChatStore(state => ({
        addMessage: state.addMessage,
        updateLastMessage: state.updateLastMessage,
        appendToLastMessage: state.appendToLastMessage,
        updateLastMessageStatus: state.updateLastMessageStatus
    }));
};

/**
 * Hook for session loading and file management
 */
export const useSessionState = () => {
    return useChatStore(state => ({
        setSessionLoading: state.setSessionLoading,
        getSessionLoading: state.getSessionLoading,
        setSessionFiles: state.setSessionFiles,
        getSessionFiles: state.getSessionFiles,
        clearSessionFiles: state.clearSessionFiles,
        setSessionAbortController: state.setSessionAbortController,
        getSessionAbortController: state.getSessionAbortController
    }));
};

/**
 * Hook for session list (read-only)
 */
export const useSessionList = () => {
    return useChatStore(state => state.getSessionList());
};

// ==================== Combined Hooks ====================

/**
 * Hook that combines UI reset with session switching
 */
export const useSessionSwitcher = () => {
    const resetUIState = useUIStore(state => state.resetUIState);
    const setCurrentSession = useChatStore(state => state.setCurrentSession);
    
    return (sessionId) => {
        resetUIState();
        setCurrentSession(sessionId);
    };
};

/**
 * Hook for creating new sessions with UI reset
 */
export const useSessionCreator = () => {
    const resetUIState = useUIStore(state => state.resetUIState);
    const { createSession, deleteSession, getCurrentMessages } = useChatStore();
    
    return (provider, deleteEmptySession = true) => {
        const messages = getCurrentMessages();
        const currentSessionId = useChatStore.getState().currentSessionId;
        
        // Delete empty session if needed
        if (deleteEmptySession && messages.length === 0 && currentSessionId) {
            deleteSession(currentSessionId);
        }
        
        // Reset UI state for new session
        resetUIState();
        
        // Create new session
        createSession(provider);
    };
};

/**
 * Hook for UI state that should be displayed in components
 */
export const useUIDisplayState = () => {
    return useUIStore(state => ({
        inputValue: state.inputValue,
        loading: state.loading,
        isExpanded: state.isExpanded,
        turboMode: state.turboMode,
        hasScreenshot: !!state.screenshotData,
        isAnyModalOpen: state.referenceModalVisible || state.modelSelectionModalVisible,
        selectedModelsCount: state.selectedModels.length
    }));
};