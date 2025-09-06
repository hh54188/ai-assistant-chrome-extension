import { Button, Input } from 'antd';
import React, { useState, useEffect } from 'react';
import { notification } from '../utils/notifications';
import useChromeStorage from '../hooks/useChromeStorage';
import { styles } from './ForceConfigModal.styles';

const ForceConfigModal = ({
    visible,
    connectionStatus,
    onRetryConnection,
    onConfigured,
}) => {
    // Read current values from storage and get setter functions
    const [storedApiKey, setStoredApiKey, apiKeyLoading] = useChromeStorage('geminiApiKey', '');
    const [, setStoredFrontendOnlyMode] = useChromeStorage('frontendOnlyMode', false);

    // Local state for editing
    const [apiKey, setApiKey] = useState('');
    const [isRetrying, setIsRetrying] = useState(false);

    // Initialize local state with stored values when modal opens
    useEffect(() => {
        if (visible && !apiKeyLoading) {
            setApiKey(storedApiKey);
        }
    }, [visible, storedApiKey, apiKeyLoading]);

    const handleUseDirectApi = async () => {
        if (!apiKey.trim()) {
            notification.error('Please enter a valid Gemini API key');
            return;
        }

        // Basic API key format validation
        const trimmedKey = apiKey.trim();
        if (!trimmedKey.startsWith('AIza') && !trimmedKey.startsWith('AI')) {
            notification.error('Invalid API key format. Gemini API keys should start with "AIza" or "AI".');
            return;
        }

        try {
            // Save API key and enable frontend-only mode
            await setStoredApiKey(trimmedKey);
            await setStoredFrontendOnlyMode(true);
            
            console.log('Settings saved successfully:', { 
                apiKey: trimmedKey.substring(0, 10) + '...', 
                frontendOnlyMode: true 
            });
            
            notification.success('Direct API mode enabled successfully!');
            onConfigured();
        } catch (error) {
            notification.error('Failed to save configuration');
            console.error('Error saving configuration:', error);
        }
    };

    const handleRetryConnection = async () => {
        setIsRetrying(true);
        try {
            await onRetryConnection();
            // Give a small delay to allow connection status to update
            setTimeout(() => {
                setIsRetrying(false);
                if (connectionStatus) {
                    notification.success('Backend connection established!');
                    onConfigured();
                } else {
                    notification.info('Backend is still not reachable. Please check if it\'s running.');
                }
            }, 1000);
        } catch {
            setIsRetrying(false);
            notification.error('Failed to test connection');
        }
    };

    const handleOpenBackendGuide = () => {
        // Open the backend setup guide in a new tab
        // Using a generic GitHub URL - update this to your actual repository
        const githubUrl = 'https://github.com/ai-assistant-chrome-extension/blob/main/docs/backend/BACKEND_ENVIRONMENT_SETUP.md';
        if (typeof chrome !== 'undefined' && chrome.tabs) {
            chrome.tabs.create({ url: githubUrl });
        } else {
            window.open(githubUrl, '_blank');
        }
    };

    if (!visible) return null;

    // Show loading state while settings are being loaded
    if (apiKeyLoading) {
        return (
            <div style={styles.overlay}>
                <div style={styles.loadingContainer}>
                    Loading configuration...
                </div>
            </div>
        );
    }

    return (
        <>
            <div style={styles.overlay}>
                <div style={styles.modal}>
                    {/* Header */}
                    <div style={styles.header}>
                        <div style={styles.iconContainer}>
                            <div style={styles.warningIcon}>⚠️</div>
                        </div>
                        <h3 style={styles.headerTitle}>
                            Setup Required
                        </h3>
                        <div style={styles.headerSubtitle}>
                            Choose how you'd like to use the AI Assistant
                        </div>
                    </div>

                    {/* Content */}
                    <div style={styles.content}>
                        {/* Backend Not Available Notice */}
                        <div style={styles.noticeContainer}>
                            <div style={styles.noticeText}>
                                The backend server is not available. You have two options to get started:
                            </div>
                        </div>

                        {/* Option 1: Use Direct API */}
                        <div style={styles.optionContainer}>
                            <div style={styles.optionHeader}>
                                <div style={styles.optionNumber}>1</div>
                                <div style={styles.optionTitle}>Use Gemini API Directly</div>
                            </div>
                            <div style={styles.optionDescription}>
                                Enter your Gemini API key to use the extension without a backend server.
                                Your API key is stored locally and never sent to our servers.
                            </div>
                            
                            <div style={styles.apiKeyContainer}>
                                <Input.Password
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="Enter your Gemini API key (AIza...)"
                                    style={styles.apiKeyInput}
                                    onPressEnter={handleUseDirectApi}
                                />
                                <Button 
                                    type="primary" 
                                    onClick={handleUseDirectApi}
                                    disabled={!apiKey.trim()}
                                    style={styles.useApiButton}
                                >
                                    Use Direct API
                                </Button>
                            </div>

                            <div style={styles.helpText}>
                                Don't have an API key? 
                                <a 
                                    href="https://makersuite.google.com/app/apikey" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={styles.helpLink}
                                >
                                    Get one from Google AI Studio
                                </a>
                            </div>
                        </div>

                        {/* Divider */}
                        <div style={styles.divider}>
                            <div style={styles.dividerLine}></div>
                            <div style={styles.dividerText}>OR</div>
                            <div style={styles.dividerLine}></div>
                        </div>

                        {/* Option 2: Setup Backend */}
                        <div style={styles.optionContainer}>
                            <div style={styles.optionHeader}>
                                <div style={styles.optionNumber}>2</div>
                                <div style={styles.optionTitle}>Setup Backend Server</div>
                            </div>
                            <div style={styles.optionDescription}>
                                Run the backend server to access advanced features like file attachments,
                                multiple AI providers, and enhanced functionality.
                            </div>
                            
                            <div style={styles.backendActions}>
                                <Button 
                                    onClick={handleOpenBackendGuide}
                                    style={styles.guideButton}
                                >
                                    📖 View Setup Guide
                                </Button>
                                <Button 
                                    onClick={handleRetryConnection}
                                    loading={isRetrying}
                                    style={styles.retryButton}
                                >
                                    🔄 Test Connection
                                </Button>
                            </div>

                            {connectionStatus && (
                                <div style={styles.successMessage}>
                                    ✅ Backend connection successful!
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={styles.footer}>
                        <div style={styles.footerNote}>
                            💡 You can change these settings later in the Settings menu
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ForceConfigModal;
