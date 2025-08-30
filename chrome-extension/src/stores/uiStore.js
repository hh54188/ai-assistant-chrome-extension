import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

/**
 * UI Store - Manages temporary UI state that resets when switching sessions
 * 
 * This store contains:
 * - User input state
 * - Current UI selections and modals
 * - Loading states
 * - Screenshot and file upload state
 * - Temporary UI flags
 */
export const useUIStore = create(
    immer((set, get) => ({
        // ==================== Input & Chat UI State ====================
        inputValue: '',
        loading: false,
        
        // ==================== Modal States ====================
        referenceModalVisible: false,
        modelSelectionModalVisible: false,
        settingsModalVisible: false,
        currentSelection: null,
        selectedModels: [],
        
        // ==================== UI Layout States ====================
        isExpanded: false,
        turboMode: false,
        turboModeExpanded: false, // Separate state for turbo mode expansion
        turboSessions: {}, // Track turbo mode sessions for each model
        
        // ==================== Screenshot States ====================
        isScreenshotMode: false,
        screenshotData: null,
        
        // ==================== File Upload States ====================
        // Files are stored per session in chatStore, but UI state for current session is here
        currentSessionFiles: [],
        attachmentsOpen: false, // Add attachment panel open state
        
        // ==================== Actions ====================
        
        // Input actions
        setInputValue: (value) => set((state) => {
            state.inputValue = value;
        }),
        
        clearInput: () => set((state) => {
            state.inputValue = '';
        }),
        
        // Loading actions
        setLoading: (loading) => set((state) => {
            state.loading = loading;
        }),
        
        // Modal actions
        setReferenceModalVisible: (visible) => set((state) => {
            state.referenceModalVisible = visible;
        }),
        
        setModelSelectionModalVisible: (visible) => set((state) => {
            state.modelSelectionModalVisible = visible;
        }),
        
        setSettingsModalVisible: (visible) => set((state) => {
            state.settingsModalVisible = visible;
        }),
        
        setCurrentSelection: (selection) => set((state) => {
            state.currentSelection = selection;
        }),
        
        setSelectedModels: (models) => set((state) => {
            state.selectedModels = models;
        }),
        
        addSelectedModel: (model) => set((state) => {
            if (!state.selectedModels.includes(model)) {
                state.selectedModels.push(model);
            }
        }),
        
        removeSelectedModel: (model) => set((state) => {
            state.selectedModels = state.selectedModels.filter(m => m !== model);
        }),
        
        clearSelectedModels: () => set((state) => {
            state.selectedModels = [];
        }),
        
        // Layout actions
        setIsExpanded: (expanded) => set((state) => {
            state.isExpanded = expanded;
        }),
        
        toggleExpanded: () => set((state) => {
            state.isExpanded = !state.isExpanded;
        }),
        
        setTurboMode: (enabled) => set((state) => {
            state.turboMode = enabled;
        }),
        
        setTurboModeExpanded: (expanded) => set((state) => {
            state.turboModeExpanded = expanded;
        }),
        
        setTurboSessions: (sessions) => set((state) => {
            state.turboSessions = sessions;
        }),
        
        clearTurboSessions: () => set((state) => {
            state.turboSessions = {};
        }),
        
        // Screenshot actions
        setIsScreenshotMode: (active) => set((state) => {
            state.isScreenshotMode = active;
        }),
        
        setScreenshotData: (data) => set((state) => {
            state.screenshotData = data;
        }),
        
        clearScreenshotData: () => set((state) => {
            state.screenshotData = null;
        }),
        
        // File actions for current session
        setCurrentSessionFiles: (files) => set((state) => {
            state.currentSessionFiles = files;
        }),
        
        clearCurrentSessionFiles: () => set((state) => {
            state.currentSessionFiles = [];
        }),
        
        setAttachmentsOpen: (open) => set((state) => {
            state.attachmentsOpen = open;
        }),
        
        // Reset actions - called when switching sessions
        resetUIState: () => set((state) => {
            // Keep layout preferences but reset session-specific UI state
            state.inputValue = '';
            state.loading = false;
            state.referenceModalVisible = false;
            state.modelSelectionModalVisible = false;
            state.currentSelection = null;
            state.selectedModels = [];
            state.isScreenshotMode = false;
            state.screenshotData = null;
            state.currentSessionFiles = [];
            state.attachmentsOpen = false; // Clear attachment panel state
            // Note: We keep isExpanded and turboMode as they are user preferences
            // Reset turbo mode expansion when switching sessions
            state.turboModeExpanded = false;
            // Clear turbo sessions when switching sessions
            state.turboSessions = {};
        }),
        
        // Computed values (selectors)
        getUIState: () => {
            const state = get();
            return {
                inputValue: state.inputValue,
                loading: state.loading,
                isExpanded: state.isExpanded,
                turboMode: state.turboMode,
                turboModeExpanded: state.turboModeExpanded,
                turboSessions: state.turboSessions,
                hasScreenshot: !!state.screenshotData,
                hasFiles: state.currentSessionFiles.length > 0,
                hasSelection: !!state.currentSelection,
                isAnyModalOpen: state.referenceModalVisible || state.modelSelectionModalVisible,
            };
        }
    }))
);
