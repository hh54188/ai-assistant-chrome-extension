import { Button, Input, Switch } from 'antd';
import React, { useState, useEffect } from 'react';
import { notification } from '../utils/notifications';
import useChromeStorage from '../hooks/useChromeStorage';
import { styles } from './SettingsModal.styles';

const SettingsModal = ({
    visible,
    onCancel,
    onConfirm,
}) => {
    // Read current values from storage and get setter functions
    const [storedFrontendOnlyMode, setStoredFrontendOnlyMode, frontendModeLoading] = useChromeStorage('frontendOnlyMode', false);
    const [storedApiKey, setStoredApiKey, apiKeyLoading] = useChromeStorage('geminiApiKey', '');
    const [storedBackendUrl, setStoredBackendUrl, backendUrlLoading] = useChromeStorage('backendUrl', 'http://localhost:3001');

    // Local state for editing (separate from storage)
    const [frontendOnlyMode, setFrontendOnlyMode] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [backendUrl, setBackendUrl] = useState('http://localhost:3001');

    // Initialize local state with stored values when modal opens or values change
    useEffect(() => {
        if (visible && !frontendModeLoading && !apiKeyLoading && !backendUrlLoading) {
            console.log('SettingsModal loading stored values:', {
                frontendOnlyMode: storedFrontendOnlyMode,
                apiKey: storedApiKey ? storedApiKey.substring(0, 10) + '...' : 'empty',
                backendUrl: storedBackendUrl
            });
            setFrontendOnlyMode(storedFrontendOnlyMode);
            setApiKey(storedApiKey);
            setBackendUrl(storedBackendUrl);
        }
    }, [visible, storedFrontendOnlyMode, storedApiKey, storedBackendUrl, frontendModeLoading, apiKeyLoading, backendUrlLoading]);

    const handleSave = async () => {
        try {
            // Save local state values to storage
            await setStoredFrontendOnlyMode(frontendOnlyMode);
            await setStoredApiKey(apiKey);
            await setStoredBackendUrl(backendUrl);
            
            notification.success('Settings saved successfully');
            onConfirm();
        } catch (error) {
            notification.error('Failed to save settings');
            console.error('Error saving settings:', error);
        }
    };

    const handleCancel = () => {
        // Reset local state to stored values (discard unsaved changes)
        setFrontendOnlyMode(storedFrontendOnlyMode);
        setApiKey(storedApiKey);
        setBackendUrl(storedBackendUrl);
        onCancel();
    };

    const handleRestoreDefaults = () => {
        // Reset to default values
        setFrontendOnlyMode(false);
        setApiKey('');
        setBackendUrl('http://localhost:3001');
        notification.info('Settings restored to defaults');
    };

    if (!visible) return null;

    // Show loading state while settings are being loaded
    if (frontendModeLoading || apiKeyLoading || backendUrlLoading) {
        return (
            <div style={styles.overlay}>
                <div style={styles.loadingContainer}>
                    Loading settings...
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
                        <h3 style={styles.headerTitle}>
                            Settings
                        </h3>
                        <Button 
                            type="text" 
                            onClick={handleCancel}
                            style={styles.closeButton}
                        >
                            ✕
                        </Button>
                    </div>

                    {/* Content */}
                    <div style={styles.content}>
                        {/* Frontend Only Mode Setting */}
                        <div style={styles.settingContainer}>
                            <div style={styles.settingHeader}>
                                <label style={styles.settingLabel}>
                                    Direct API Mode
                                </label>
                                <Switch
                                    checked={frontendOnlyMode}
                                    onChange={setFrontendOnlyMode}
                                />
                            </div>
                            <div style={styles.settingDescription}>
                                When enabled, messages are sent directly to Gemini API using your API key. 
                                When disabled, messages go through the backend server first.
                            </div>
                        </div>

                        {/* API Key Input */}
                        <div style={styles.settingContainer}>
                            <label style={styles.apiKeyLabel}>
                                Gemini API Key
                            </label>
                            <Input.Password
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Enter your Gemini API key"
                                style={styles.apiKeyInput}
                            />
                            <div style={styles.apiKeyDescription}>
                                Required when Direct API Mode is enabled. Your API key is stored locally and never sent to our servers.
                            </div>
                        </div>

                        {/* Backend URL Input */}
                        <div style={styles.settingContainer}>
                            <label style={styles.apiKeyLabel}>
                                Backend URL
                            </label>
                            <Input
                                value={backendUrl}
                                onChange={(e) => setBackendUrl(e.target.value)}
                                placeholder="http://localhost:3001"
                                style={styles.apiKeyInput}
                            />
                            <div style={styles.apiKeyDescription}>
                                URL of the backend server. Used when Direct API Mode is disabled.
                            </div>
                        </div>

                        {/* Warning when frontend mode is enabled */}
                        {frontendOnlyMode && (
                            <div style={styles.warningContainer}>
                                <div style={styles.warningText}>
                                    ⚠️ Direct API Mode is enabled. Make sure you have a valid Gemini API key configured.
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div style={styles.footer}>
                        <div style={styles.footerLeft}>
                            <Button onClick={handleRestoreDefaults}>
                                Restore Defaults
                            </Button>
                        </div>
                        <div style={styles.footerRight}>
                            <Button onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button 
                                type="primary" 
                                onClick={handleSave}
                                disabled={frontendOnlyMode && !apiKey.trim()}
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SettingsModal;
