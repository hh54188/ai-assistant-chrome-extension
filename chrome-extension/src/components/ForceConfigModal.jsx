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
    const [storedBackendUrl, setStoredBackendUrl, backendUrlLoading] = useChromeStorage('backendUrl', 'http://localhost:3001');

    // Local state for editing
    const [backendUrl, setBackendUrl] = useState('http://localhost:3001');
    const [isRetrying, setIsRetrying] = useState(false);

    // Initialize local state with stored values when modal opens
    useEffect(() => {
        if (visible && !backendUrlLoading) {
            setBackendUrl(storedBackendUrl);
        }
    }, [visible, storedBackendUrl, backendUrlLoading]);

    const handleSaveAndTestConnection = async () => {
        setIsRetrying(true);
        try {
            // Always save the backend URL first
            await setStoredBackendUrl(backendUrl);
            
            // Then test the connection
            await onRetryConnection();
            
            // Give a small delay to allow connection status to update
            setTimeout(() => {
                setIsRetrying(false);
                if (connectionStatus) {
                    notification.success('Backend URL saved and connection established!');
                    onConfigured();
                } else {
                    notification.info('Backend URL saved, but server is still not reachable. Please check if it\'s running.');
                }
            }, 1000);
        } catch (error) {
            setIsRetrying(false);
            notification.error('Failed to save URL or test connection');
            console.error('Error saving URL or testing connection:', error);
        }
    };


    const handleOpenBackendGuide = () => {
        // Open the backend setup guide in a new tab
        // Using a generic GitHub URL - update this to your actual repository
        const githubUrl = 'https://github.com/hh54188/ai-assistant-chrome-extension/blob/master/docs/backend/BACKEND_ENVIRONMENT_SETUP.md';
        if (typeof chrome !== 'undefined' && chrome.tabs) {
            chrome.tabs.create({ url: githubUrl });
        } else {
            // Create a temporary link element and click it
            const link = document.createElement('a');
            link.href = githubUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    if (!visible) return null;

    // Show loading state while settings are being loaded
    if (backendUrlLoading) {
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
                            Configure the backend server to get started
                        </div>
                    </div>

                    {/* Content */}
                    <div style={styles.content}>
                        {/* Backend Not Available Notice */}
                        <div style={styles.noticeContainer}>
                            <div style={styles.noticeText}>
                                The backend server is not available. Enter the backend URL below to connect.
                            </div>
                        </div>

                        {/* Setup Backend */}
                        <div style={styles.optionContainer}>
                            <div style={styles.optionHeader}>
                                <div style={styles.optionNumber}>1</div>
                                <div style={styles.optionTitle}>Setup Backend Server</div>
                            </div>
                            <div style={styles.optionDescription}>
                                Run the backend server to access advanced features like file attachments,
                                multiple AI providers, and enhanced functionality.
                            </div>
                            
                            {/* Backend URL Input */}
                            <div style={styles.backendUrlContainer}>
                                <label style={styles.backendUrlLabel}>
                                    Backend URL
                                </label>
                                <div style={styles.backendUrlInputContainer}>
                                    <Input
                                        value={backendUrl}
                                        onChange={(e) => setBackendUrl(e.target.value)}
                                        placeholder="http://localhost:3001"
                                        style={styles.backendUrlInput}
                                        onPressEnter={handleSaveAndTestConnection}
                                    />
                                </div>
                                <div style={styles.backendUrlDescription}>
                                    URL of the backend server. Click "Save & Test Connection" to save and verify the connection.
                                </div>
                            </div>
                            
                            <div style={styles.backendActions}>
                                <Button 
                                    onClick={handleOpenBackendGuide}
                                    style={styles.guideButton}
                                >
                                    📖 View Setup Guide
                                </Button>
                                <Button 
                                    onClick={handleSaveAndTestConnection}
                                    loading={isRetrying}
                                    style={styles.retryButton}
                                >
                                    💾 Save & Test Connection
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
