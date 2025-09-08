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
    const [isValidating, setIsValidating] = useState(false);

    // Initialize local state with stored values when modal opens or values change
    useEffect(() => {
        if (visible && !frontendModeLoading && !apiKeyLoading && !backendUrlLoading) {
            console.log('SettingsModal initializing with stored values:', {
                frontendOnlyMode: storedFrontendOnlyMode,
                apiKey: storedApiKey ? storedApiKey.substring(0, 10) + '...' : 'empty',
                backendUrl: storedBackendUrl,
                loadingStates: { frontendModeLoading, apiKeyLoading, backendUrlLoading }
            });
            setFrontendOnlyMode(storedFrontendOnlyMode);
            setApiKey(storedApiKey);
            setBackendUrl(storedBackendUrl);
        }
    }, [visible, storedFrontendOnlyMode, storedApiKey, storedBackendUrl, frontendModeLoading, apiKeyLoading, backendUrlLoading]);

    // Backend validation function
    const validateBackendUrl = async (url) => {
        try {
            // Create timeout controller for better browser compatibility
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(`${url}/health`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                signal: controller.signal,
            });
            
            clearTimeout(timeoutId);
            return response.ok;
        } catch (error) {
            console.error('Backend validation failed:', error);
            return false;
        }
    };

    // Validation helper functions
    const isValidApiKey = (key) => {
        const trimmedKey = key?.trim();
        return trimmedKey && (trimmedKey.startsWith('AIza') || trimmedKey.startsWith('AI'));
    };

    const isValidBackendUrl = (url) => {
        const trimmedUrl = url?.trim();
        return trimmedUrl && trimmedUrl.length > 0;
    };

    // Check if current configuration is valid for saving
    const isConfigValid = () => {
        if (frontendOnlyMode) {
            // Direct mode: API key must be valid
            return isValidApiKey(apiKey);
        } else {
            // Backend mode: backend URL must be filled
            return isValidBackendUrl(backendUrl);
        }
    };

    const handleSave = async () => {
        setIsValidating(true);
        
        console.log('SettingsModal handleSave - Starting save process:', {
            frontendOnlyMode,
            backendUrl,
            apiKeyPresent: !!apiKey
        });
        
        try {
            // Validate configuration based on mode
            if (frontendOnlyMode) {
                // Direct mode: validate API key
                console.log('Validating direct mode - checking API key');
                if (!isValidApiKey(apiKey)) {
                    console.log('API key validation failed');
                    notification.error('Invalid API key format. Gemini API keys should start with "AIza" or "AI".');
                    return;
                }
                console.log('API key validation passed');
            } else {
                // Backend mode: validate backend URL
                console.log('Validating backend mode - checking backend URL');
                if (!isValidBackendUrl(backendUrl)) {
                    console.log('Backend URL validation failed - empty URL');
                    notification.error('Backend URL is required when Direct API Mode is disabled.');
                    return;
                }

                // Test backend connectivity
                console.log('Testing backend connectivity for URL:', backendUrl);
                const isValid = await validateBackendUrl(backendUrl);
                console.log('Backend connectivity test result:', isValid);
                
                if (!isValid) {
                    console.log('Backend connectivity test failed');
                    notification.error('Backend is not reachable. Please check the URL or switch to Direct API Mode.');
                    return;
                }
                console.log('Backend connectivity test passed');
            }
            
            // Save configuration
            console.log('Saving configuration to storage:', {
                frontendOnlyMode,
                backendUrl,
                apiKeyLength: apiKey?.length || 0
            });
            
            await setStoredFrontendOnlyMode(frontendOnlyMode);
            console.log('Saved frontendOnlyMode:', frontendOnlyMode);
            
            await setStoredBackendUrl(backendUrl);
            console.log('Saved backendUrl:', backendUrl);
            
            if (frontendOnlyMode) {
                await setStoredApiKey(apiKey.trim());
                console.log('Saved API key (direct mode)');
            } else {
                // In backend mode, we can still save the API key if provided
                await setStoredApiKey(apiKey);
                console.log('Saved API key (backend mode)');
            }
            
            console.log('All settings saved successfully');
            notification.success('Settings saved successfully');
            onConfirm();
        } catch (error) {
            console.error('Error saving settings:', error);
            notification.error('Failed to save settings');
        } finally {
            setIsValidating(false);
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

                        {/* API Key Input - Only show when Direct Mode is enabled */}
                        {frontendOnlyMode && (
                            <div style={styles.settingContainer}>
                                <label style={styles.apiKeyLabel}>
                                    Gemini API Key *
                                </label>
                                <Input.Password
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="Enter your Gemini API key"
                                    style={{
                                        ...styles.apiKeyInput,
                                        borderColor: frontendOnlyMode && !isValidApiKey(apiKey) ? '#ff4d4f' : undefined
                                    }}
                                />
                                <div style={styles.apiKeyDescription}>
                                    Required for Direct API Mode. Your API key is stored locally and never sent to our servers.
                                </div>
                                {frontendOnlyMode && !isValidApiKey(apiKey) && (
                                    <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                                        Please enter a valid Gemini API key (starts with "AIza" or "AI")
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Backend URL Input - Only show when Direct Mode is disabled */}
                        {!frontendOnlyMode && (
                            <div style={styles.settingContainer}>
                                <label style={styles.apiKeyLabel}>
                                    Backend URL *
                                </label>
                                <Input
                                    value={backendUrl}
                                    onChange={(e) => setBackendUrl(e.target.value)}
                                    placeholder="http://localhost:3001"
                                    style={{
                                        ...styles.apiKeyInput,
                                        borderColor: !frontendOnlyMode && !isValidBackendUrl(backendUrl) ? '#ff4d4f' : undefined
                                    }}
                                />
                                <div style={styles.apiKeyDescription}>
                                    URL of the backend server. Required when Direct API Mode is disabled.
                                </div>
                                {!frontendOnlyMode && !isValidBackendUrl(backendUrl) && (
                                    <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                                        Please enter a valid backend URL
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Mode-specific information */}
                        <div style={styles.warningContainer}>
                            <div style={styles.warningText}>
                                {frontendOnlyMode 
                                    ? "🔑 Direct API Mode: Messages will be sent directly to Gemini using your API key."
                                    : "🖥️ Backend Mode: Messages will be processed through your backend server."
                                }
                            </div>
                        </div>
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
                                loading={isValidating}
                                disabled={!isConfigValid()}
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
