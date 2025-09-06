import { notification } from './utils/notifications';
import React, { useEffect, useCallback } from 'react';
import ChatHeader from './components/ChatHeader';
import ChatList from './components/ChatList';
import ChatSender from './components/ChatSender';
import MenuBar from './components/MenuBar';
import ReferenceModal from './components/ReferenceModal';
import ModelSelectionModal from './components/ModelSelectionModal';
import SettingsModal from './components/SettingsModal';
import ForceConfigModal from './components/ForceConfigModal';
import TurboChatList from './components/TurboChatList';
import DropZoneOverlay from './components/DropZoneOverlay';
import useConnectionStatus from './hooks/useConnectionStatus';
import useChromeStorage from './hooks/useChromeStorage';
// ScreenCapture is now handled by content script

import chatService from './services/chatService';
import { useCopilotStyle } from './CopilotSidebar.styles';
import usePageSelection from './hooks/usePageSelection';
import { useUIStore, useChatStore } from './stores';

const CopilotSidebar = ({ isOpen, onClose }) => {
    const { styles } = useCopilotStyle();
    
    // ==================== Zustand Store Hooks ====================
    
    // UI Store - temporary state
    const {
        clearInput,
        loading,
        setLoading,
        referenceModalVisible,
        setReferenceModalVisible,
        modelSelectionModalVisible,
        setModelSelectionModalVisible,
        settingsModalVisible,
        setSettingsModalVisible,
        forceConfigModalVisible,
        setForceConfigModalVisible,
        currentSelection,
        setCurrentSelection,
        selectedModels,
        addSelectedModel,
        removeSelectedModel,
        clearSelectedModels,
        isExpanded,
        setIsExpanded,
        turboMode,
        setTurboMode,
        turboModeExpanded,
        setTurboModeExpanded,
        turboSessions,
        setTurboSessions,
        clearTurboSessions,
        setIsScreenshotMode,
        setScreenshotData,
        clearScreenshotData,
        isDragOver,
        setIsDragOver,
        resetUIState
    } = useUIStore();
    
    // Chat Store - persistent state
    const {
        currentSessionId,
        selectedProvider,
        setCurrentSession,
        createSession,
        deleteSession,
        updateSessionLabel,
        addMessage,
        updateLastMessage,
        appendToLastMessage,
        updateLastMessageStatus,
        setSessionLoading,
        getSessionLoading,
        getSessionFiles,
        clearSessionFiles,
        setSessionAbortController,
        getSessionAbortController,
        getCurrentSession,
        getCurrentMessages,
        getSessionList,
        getSessionById,
        addSession
    } = useChatStore();
    
    // Chrome storage hooks
    const [frontendOnlyMode, setFrontendOnlyMode] = useChromeStorage('frontendOnlyMode', false);
    const [geminiApiKey] = useChromeStorage('geminiApiKey', '');
    
    // Connection status hook
    const { connectionStatus, isLoading: connectionLoading, retryConnection } = useConnectionStatus();
    
    // Computed values from stores
    const sessionList = getSessionList();
    const messages = getCurrentMessages();
    const currentSession = getCurrentSession();


    // No need for Ant Design message API anymore - using custom notifications
    const { getCurrentSelection } = usePageSelection();

    // ==================== Helper Functions ====================
    
    // Get or create abort controller for session
    const getOrCreateAbortController = (sessionId) => {
        let controller = getSessionAbortController(sessionId);
        if (!controller) {
            controller = new AbortController();
            setSessionAbortController(sessionId, controller);
        }
        return controller;
    };

    // ==================== Event Handlers ====================

    const handleTurboSubmit = async (val) => {
        if (!val.trim()) return;

        // Set turbo mode expanded to show multiple chat lists
        setTurboModeExpanded(true);
        
        // Clear input
        clearInput();
        
        // Show loading state
        setLoading(true);
        
        // Create separate sessions for each model to avoid ID conflicts
        const turboSessions = {};
        
        // Create sessions and add user message to each
        selectedModels.forEach((model) => {
            const sessionId = `turbo-${model}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            turboSessions[model] = sessionId;
            
            // Create a new session for this model without switching to it
            addSession(sessionId, model);
            
            // Add user message to this session
            const userMessage = { content: val, role: 'user' };
            addMessage(sessionId, userMessage, 'done');
        });
        
        // Store turbo sessions in UI store for later use
        setTurboSessions(turboSessions);
        
        // Now send actual requests to each model
        const promises = selectedModels.map(async (model) => {
            const sessionId = turboSessions[model];
            
            try {
                // Prepare conversation history for this session
                const conversationHistory = [{ role: 'user', content: val }];
                
                // Add assistant message placeholder for streaming
                const assistantMessage = { content: '', role: 'assistant' };
                addMessage(sessionId, assistantMessage, 'loading');
                
                // Get or create abort controller for this session
                const abortController = getOrCreateAbortController(sessionId);
                
                // Use chatService for streaming
                await chatService.streamChat(val, model, conversationHistory, sessionId, {
                    onChunk: (content) => {
                        // Append content to the last message in the session
                        appendToLastMessage(sessionId, content);
                    },
                    onComplete: () => {
                        // Mark last message as complete
                        updateLastMessageStatus(sessionId, 'done');
                        setSessionLoading(sessionId, false);
                    },
                    onError: (errorMessage) => {
                        // Update last message with error content
                        updateLastMessage(sessionId, errorMessage);
                        updateLastMessageStatus(sessionId, 'done');
                        setSessionLoading(sessionId, false);
                    },
                    onLoadingChange: (isLoading) => {
                        setSessionLoading(sessionId, isLoading);
                    },
                    abortController: abortController,
                    files: [] // No files in turbo mode for now
                });
            } catch (error) {
                console.error(`Error in turbo mode for ${model}:`, error);
                // Update last message with error content
                updateLastMessage(sessionId, `Error: ${error.message}`);
                updateLastMessageStatus(sessionId, 'done');
                setSessionLoading(sessionId, false);
            }
        });
        
        // Wait for all requests to complete
        try {
            await Promise.all(promises);
        } catch (error) {
            console.error('Error in turbo mode:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleUserSubmit = async (val) => {
        if (turboMode) {
            handleTurboSubmit(val);
            return;
        }

        if (!val.trim()) return;

        const userMessage = { content: val, role: 'user' };
        
        // Add user message to current session
        addMessage(currentSessionId, userMessage, 'done');
        
        // Clear input and set loading
        clearInput();
        setSessionLoading(currentSessionId, true);
        setLoading(true);

        // Update session title if it's a new session
        if (currentSession?.label === 'New session') {
            updateSessionLabel(currentSessionId, val.slice(0, 20));
        }

        // Prepare conversation history for the backend
        const conversationHistory = messages.map(msg => ({
            role: msg.message.role,
            content: msg.message.content
        }));

        // Add assistant message placeholder for streaming
        const assistantMessage = { content: '', role: 'assistant' };
        addMessage(currentSessionId, assistantMessage, 'loading');

        // Create new AbortController for this session
        const abortController = getOrCreateAbortController(currentSessionId);
        const currentSessionFiles = getSessionFiles(currentSessionId);

        // Capture the session ID when the request starts
        const requestSessionId = currentSessionId;
        
        // Check if we should use direct Gemini API or backend
        const useDirectApi = frontendOnlyMode && selectedProvider.includes('gemini');
        
        if (useDirectApi) {
            // Use direct Gemini API
            await chatService.streamChatDirectGemini(val, conversationHistory, {
                onChunk: (content) => {
                    // Append content to the last message in the session
                    appendToLastMessage(requestSessionId, content);
                },
                onComplete: () => {
                    // Mark last message as complete
                    updateLastMessageStatus(requestSessionId, 'done');
                    setSessionLoading(requestSessionId, false);
                    setLoading(false);
                    clearSessionFiles(requestSessionId); // Clear files for this session
                    // Clear screenshot data after AI response completes to prevent loops
                    if (requestSessionId === currentSessionId) {
                        clearScreenshotData();
                    }
                },
                onError: (errorMessage) => {
                    // Update last message with error content
                    updateLastMessage(requestSessionId, errorMessage);
                    updateLastMessageStatus(requestSessionId, 'done');
                    setSessionLoading(requestSessionId, false);
                    setLoading(false);
                    // Clear screenshot data on error to prevent loops
                    if (requestSessionId === currentSessionId) {
                        clearScreenshotData();
                    }
                    if (errorMessage !== 'Request was cancelled') {
                        notification.error(errorMessage);
                    }
                },
                onLoadingChange: (isLoading) => {
                    setSessionLoading(requestSessionId, isLoading);
                    setLoading(isLoading);
                },
                abortController: abortController
            }, frontendOnlyMode);
        } else {
            // Use chatService for streaming with files
            await chatService.streamChat(val, selectedProvider, conversationHistory, requestSessionId, {
            onChunk: (content) => {
                // Append content to the last message in the session
                appendToLastMessage(requestSessionId, content);
            },
            onComplete: () => {
                // Mark last message as complete
                updateLastMessageStatus(requestSessionId, 'done');
                setSessionLoading(requestSessionId, false);
                setLoading(false);
                clearSessionFiles(requestSessionId); // Clear files for this session
                // Clear screenshot data after AI response completes to prevent loops
                if (requestSessionId === currentSessionId) {
                    clearScreenshotData();
                }
            },
            onError: (errorMessage) => {
                // Update last message with error content
                updateLastMessage(requestSessionId, errorMessage);
                updateLastMessageStatus(requestSessionId, 'done');
                setSessionLoading(requestSessionId, false);
                setLoading(false);
                // Clear screenshot data on error to prevent loops
                if (requestSessionId === currentSessionId) {
                    clearScreenshotData();
                }
                if (errorMessage !== 'Request was cancelled') {
                    notification.error(errorMessage);
                }
            },
            onLoadingChange: (isLoading) => {
                setSessionLoading(requestSessionId, isLoading);
                setLoading(isLoading);
            },
            abortController: abortController,
            files: currentSessionFiles
        });
        }
    };

    // ==================== Screenshot Handlers ====================
    
    // Screenshot handling
    const handleScreenshotCapture = () => {
        setIsScreenshotMode(true);
        // Send message to content script to start screenshot mode
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: 'START_SCREENSHOT'
            }, '*');
        }
    };

    const handleScreenshotComplete = useCallback((screenshotDataParam) => {
        setScreenshotData(screenshotDataParam);
        setIsScreenshotMode(false);
    }, [setScreenshotData, setIsScreenshotMode]);

    const handleScreenshotCancel = useCallback(() => {
        setIsScreenshotMode(false);
        // Send message to content script to stop screenshot mode
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: 'STOP_SCREENSHOT'
            }, '*');
        }
    }, [setIsScreenshotMode]);

    // Function to request screenshot data from content script
    const requestScreenshotData = () => {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: 'GET_SCREENSHOT_DATA'
            }, '*');
        }
    };

    // Listen for messages from content script
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data && event.data.type === 'SCREENSHOT_READY') {
                // Screenshot is ready, request the data
                requestScreenshotData();
            } else if (event.data && event.data.type === 'SCREENSHOT_DATA_AVAILABLE') {
                // Screenshot data received, set it in state
                handleScreenshotComplete(event.data.data);
            } else if (event.data && event.data.type === 'SCREENSHOT_DATA_NOT_AVAILABLE') {
                console.log('No screenshot data available');
                setIsScreenshotMode(false);
            } else if (event.data && event.data.type === 'SCREENSHOT_DATA_CLEARED') {
                console.log('Screenshot data cleared');
            } else if (event.data && event.data.type === 'SCREENSHOT_CANCELLED') {
                handleScreenshotCancel();
            } else if (event.data && event.data.type === 'SCREENSHOT_ERROR') {
                console.error('Screenshot error:', event.data.error);
                setIsScreenshotMode(false);
            } else if (event.data && event.data.type === 'DRAG_START') {
                // Text drag started from content script
                console.log('🎯 REACT: Drag started with text:', event.data.text);
                setIsDragOver(true);
            } else if (event.data && event.data.type === 'DRAG_END') {
                // Text drag ended
                console.log('🏁 REACT: Drag ended');
                setIsDragOver(false);
            } else if (event.data && event.data.type === 'TEXT_DROPPED') {
                // Text was dropped on the sidebar
                console.log('✅ REACT: Text dropped:', event.data.text);
                console.log('✅ REACT: Event data:', event.data);
                setIsDragOver(false);
                
                if (event.data.text && event.data.text.trim()) {
                    // Create a selection object with just the text (pure text as requested)
                    const selection = {
                        text: event.data.text.trim(),
                        html: '', // Empty as requested - only keep pure text
                        url: window.location.href,
                        title: document.title
                    };
                    
                    console.log("================ dropped selection from content script ==================");
                    console.log(selection);
                    console.log("🎯 REACT: Setting currentSelection and opening modal");
                    setCurrentSelection(selection);
                    setReferenceModalVisible(true);
                    console.log("🎯 REACT: Modal should be opening now");
                } else {
                    console.log("❌ REACT: No valid text in dropped data");
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [handleScreenshotCancel, handleScreenshotComplete, setIsScreenshotMode, setIsDragOver, setCurrentSelection, setReferenceModalVisible]);

    const handleCreateNewSession = () => {
        handleNewSession();
    }

    const handleNewSession = (provider) => {
        const needToDeleteOldSession = messages.length === 0;
        
        // Delete empty session if needed
        if (needToDeleteOldSession && currentSessionId) {
            deleteSession(currentSessionId);
        }
        
        // Reset UI state for new session
        resetUIState();
        
        // Create new session with specified provider
        createSession(provider);
    };

    const handleSessionChange = (sessionId) => {
        // Reset UI state for new session
        resetUIState();
        
        // Switch to new session
        setCurrentSession(sessionId);
    };

    // ==================== Menu Bar Handlers ====================

    const handleToggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    // Send message to content script when expanded state changes
    useEffect(() => {
        // Check if we're running in a Chrome extension iframe
        if (window.parent && window.parent !== window) {
            try {
                window.parent.postMessage({
                    type: 'TOGGLE_EXPAND',
                    expanded: isExpanded
                }, '*');
            } catch {
                console.log('Not running in extension context, skipping message');
            }
        }
    }, [isExpanded]);

    // Send message to content script when turbo mode expansion changes
    useEffect(() => {
        // Check if we're running in a Chrome extension iframe
        if (window.parent && window.parent !== window) {
            try {
                window.parent.postMessage({
                    type: 'TOGGLE_TURBO_EXPAND',
                    expanded: turboModeExpanded,
                    selectedModelsCount: selectedModels.length
                }, '*');
            } catch {
                console.log('Not running in extension context, skipping message');
            }
        }
    }, [turboModeExpanded, selectedModels.length]);



    const handleProviderChange = (val) => {
        handleNewSession(val);
    };



    const handleImportSelection = async () => {
        const selection = await getCurrentSelection();
        console.log("================ selection in sidebar ==================")
        console.log(selection);
        setCurrentSelection(selection);
        setReferenceModalVisible(true);
    };

    // ==================== Drag and Drop Handlers ====================
    // Note: Drag and drop is now handled by the content script and communicated via messages

    const handleReferenceModalCancel = () => {
        setReferenceModalVisible(false);
        setCurrentSelection(null);
    };

    const handleReferenceModalConfirm = (finalPrompt) => {
        setReferenceModalVisible(false);
        setCurrentSelection(null);
        handleUserSubmit(finalPrompt);
    };

    // Model selection modal handlers
    const handleOpenModelSelection = () => {
        setModelSelectionModalVisible(true);
    };

    const handleModelSelectionCancel = () => {
        setModelSelectionModalVisible(false);
        clearSelectedModels();
    };

    const handleModelSelectionConfirm = () => {
        setModelSelectionModalVisible(false);
    };

    // Settings modal handlers
    const handleOpenSettings = () => {
        setSettingsModalVisible(true);
    };

    const handleSettingsCancel = () => {
        setSettingsModalVisible(false);
    };

    const handleSettingsConfirm = () => {
        setSettingsModalVisible(false);
    };

    const handleCancelTurboMode = () => {
        setTurboMode(false);
        setTurboModeExpanded(false);
        clearSelectedModels();
        clearTurboSessions();
    }

    const handleSelectModelFromTurbo = (selectedModel) => {
        // Get the turbo session for the selected model
        const turboSessionId = turboSessions[selectedModel];
        
        if (turboSessionId) {
            // Switch to the turbo session for this model
            setCurrentSession(turboSessionId);
            
            // Update the session label to indicate it was a turbo session
            const sessionMessages = getSessionById(turboSessionId)?.messages || [];
            if (sessionMessages.length > 0) {
                const lastUserMessage = sessionMessages.findLast(msg => msg.message.role === 'user');
                const sessionLabel = lastUserMessage ? 
                    `Turbo: ${lastUserMessage.message.content.slice(0, 30)}...` : 
                    'Turbo Mode Session';
                
                updateSessionLabel(turboSessionId, sessionLabel);
            }
        } else {
            // Fallback: create a new session with the selected model
            createSession(selectedModel);
        }
        
        // Exit turbo mode
        setTurboMode(false);
        setTurboModeExpanded(false);
        clearSelectedModels();
        clearTurboSessions();
        
        // Show success message
        notification.success(`Continuing conversation with ${selectedModel}`);
    }

    const handleModelSelection = (modelValue, checked) => {
        if (checked) {
            addSelectedModel(modelValue);
        } else {
            removeSelectedModel(modelValue);
        }
    };



    // Update loading state based on current session
    useEffect(() => {
        const currentSessionLoading = getSessionLoading(currentSessionId);
        setLoading(currentSessionLoading);
    }, [currentSessionId, getSessionLoading, setLoading]);
    
    // Update turbo mode based on selected models
    useEffect(() => {
        setTurboMode(selectedModels.length > 1);
    }, [selectedModels, setTurboMode]);

    // Reset turbo mode expansion when turbo mode is disabled
    useEffect(() => {
        if (!turboMode && turboModeExpanded) {
            setTurboModeExpanded(false);
        }
    }, [turboMode, turboModeExpanded, setTurboModeExpanded]);

    // Force config modal logic - show when backend is not available and no API key
    useEffect(() => {
        // Don't show if connection is still loading
        if (connectionLoading) return;
        
        const hasApiKey = geminiApiKey && geminiApiKey.trim().length > 0;
        
        // If backend is connected, hide modal and ensure frontend-only mode is disabled
        if (connectionStatus) {
            setForceConfigModalVisible(false);
            return;
        }
        
        // If backend is offline but user has API key, automatically enable direct API mode
        if (!connectionStatus && hasApiKey) {
            setForceConfigModalVisible(false);
            
            // Auto-enable direct API mode if not already enabled
            if (!frontendOnlyMode) {
                console.log('Auto-enabling direct API mode - backend offline but API key available');
                // Enable frontend-only mode automatically
                const enableDirectMode = async () => {
                    try {
                        await setFrontendOnlyMode(true);
                        notification.info('Direct API mode enabled automatically - backend is offline');
                    } catch (error) {
                        console.error('Failed to auto-enable direct API mode:', error);
                    }
                };
                enableDirectMode();
            }
            return;
        }
        
        // Show force config modal only if backend is not available and no API key
        if (!connectionStatus && !hasApiKey) {
            setForceConfigModalVisible(true);
        }
    }, [connectionStatus, connectionLoading, geminiApiKey, frontendOnlyMode, setForceConfigModalVisible, setFrontendOnlyMode]);


    return (
        <div 
            className={styles.copilotChat} 
            style={{ 
                width: isOpen ? (
                    turboMode && turboModeExpanded ? (50 + (selectedModels.length * 35) + (selectedModels.length * 350)) : 
                    isExpanded ? 1024 : 450
                ) : 0
            }}
        >
            {/* Drop Zone Indicator */}
            <DropZoneOverlay isVisible={isDragOver} />
            <div className={styles.sidebarLayout}>
                <MenuBar
                    onOpenSettings={handleOpenSettings}
                    sessionList={sessionList}
                    curSession={currentSessionId}
                    handleSessionChange={handleSessionChange}
                    handleImportSelection={handleImportSelection}
                    isExpanded={isExpanded}
                    onToggleExpand={handleToggleExpand}
                    onScreenshotCapture={handleScreenshotCapture}
                    isDirectApiMode={frontendOnlyMode}
                    connectionStatus={connectionStatus}
                />
                <div className={styles.mainContent}>
                    <ChatHeader
                        selectedProvider={selectedProvider}
                        setSelectedProvider={handleProviderChange}
                        handleNewSession={handleCreateNewSession}
                        sessionList={sessionList}
                        curSession={currentSessionId}
                        handleSessionChange={handleSessionChange}
                        onClose={onClose}
                        onOpenModelSelection={handleOpenModelSelection}
                        handleCancelTurboMode={handleCancelTurboMode}
                        turboMode={turboMode}
                        turboModeExpanded={turboModeExpanded}
                    />
                    {turboMode && turboModeExpanded ? (
                        <TurboChatList
                            selectedModels={selectedModels}
                            onSelectModel={handleSelectModelFromTurbo}
                            onCancelTurboMode={handleCancelTurboMode}
                            loading={loading}
                            turboSessions={turboSessions}
                            getMessagesForSession={(sessionId) => {
                                const session = getSessionById(sessionId);
                                return session ? session.messages : [];
                            }}

                        />
                    ) : (
                        <ChatList
                            messages={messages}
                            styles={styles}

                        />
                    )}
                    {turboMode && turboModeExpanded ? null : <ChatSender
                        allowAttachments={!frontendOnlyMode && connectionStatus}
                        styles={styles}
                        handleUserSubmit={handleUserSubmit}
                        disabled={turboMode && turboModeExpanded}
                    />}
                </div>
            </div>
            
            {/* Screenshot capture overlay - removed since it's now handled by content script */}
            {/* <ScreenCapture
                isActive={isScreenshotMode}
                onCapture={handleScreenshotComplete}
                onCancel={handleScreenshotCancel}
            /> */}
            
            {isOpen && referenceModalVisible && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.45)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <ReferenceModal
                        visible={referenceModalVisible}
                        onCancel={handleReferenceModalCancel}
                        onConfirm={handleReferenceModalConfirm}
                        selection={currentSelection}
                        loading={loading}
                    />
                </div>
            )}
            {isOpen && (
                <ModelSelectionModal
                    visible={modelSelectionModalVisible}
                    onCancel={handleModelSelectionCancel}
                    onConfirm={handleModelSelectionConfirm}
                    selectedModels={selectedModels}
                    onModelSelection={handleModelSelection}
                    onAutoEnableTurbo={() => setTurboMode(true)}
                />
            )}
            {isOpen && (
                <SettingsModal
                    visible={settingsModalVisible}
                    onCancel={handleSettingsCancel}
                    onConfirm={handleSettingsConfirm}
                />
            )}
            {isOpen && (
                <ForceConfigModal
                    visible={forceConfigModalVisible}
                    connectionStatus={connectionStatus}
                    onRetryConnection={retryConnection}
                    onConfigured={() => setForceConfigModalVisible(false)}
                />
            )}
            
            {/* CSS Animation for bounce effect */}
            <style>
                {`
                    @keyframes bounce {
                        0%, 20%, 50%, 80%, 100% {
                            transform: translateY(0);
                        }
                        40% {
                            transform: translateY(-10px);
                        }
                        60% {
                            transform: translateY(-5px);
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default CopilotSidebar; 