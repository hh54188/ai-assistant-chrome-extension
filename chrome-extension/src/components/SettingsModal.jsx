import { Button, Input } from 'antd';
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
    const [storedBackendUrl, setStoredBackendUrl, backendUrlLoading] = useChromeStorage('backendUrl', 'http://localhost:3001');

    // Local state for editing (separate from storage)
    const [backendUrl, setBackendUrl] = useState('http://localhost:3001');
    const [isValidating, setIsValidating] = useState(false);

    // Initialize local state with stored values when modal opens or values change
    useEffect(() => {
        if (visible && !backendUrlLoading) {
            setBackendUrl(storedBackendUrl);
        }
    }, [visible, storedBackendUrl, backendUrlLoading]);

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
    const isValidBackendUrl = (url) => {
        const trimmedUrl = url?.trim();
        return trimmedUrl && trimmedUrl.length > 0;
    };

    // Check if current configuration is valid for saving
    const isConfigValid = () => isValidBackendUrl(backendUrl);

    const handleSave = async () => {
        setIsValidating(true);
        
        try {
            if (!isValidBackendUrl(backendUrl)) {
                notification.error('Backend URL is required.');
                return;
            }

            const isValid = await validateBackendUrl(backendUrl);
            if (!isValid) {
                notification.error('Backend is not reachable. Please check the URL.');
                return;
            }
            
            await setStoredBackendUrl(backendUrl);
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
        setBackendUrl(storedBackendUrl);
        onCancel();
    };

    const handleRestoreDefaults = () => {
        setBackendUrl('http://localhost:3001');
        notification.info('Settings restored to defaults');
    };

    if (!visible) return null;

    // Show loading state while settings are being loaded
    if (backendUrlLoading) {
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
                        <div style={styles.settingContainer}>
                            <label htmlFor="backend-url-input" style={styles.apiKeyLabel}>
                                Backend URL *
                            </label>
                            <Input
                                id="backend-url-input"
                                value={backendUrl}
                                onChange={(e) => setBackendUrl(e.target.value)}
                                placeholder="http://localhost:3001"
                                style={{
                                    ...styles.apiKeyInput,
                                    borderColor: !isValidBackendUrl(backendUrl) ? '#ff4d4f' : undefined
                                }}
                            />
                            <div style={styles.apiKeyDescription}>
                                URL of the backend server.
                            </div>
                            {!isValidBackendUrl(backendUrl) && (
                                <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                                    Please enter a valid backend URL
                                </div>
                            )}
                        </div>

                        <div style={styles.warningContainer}>
                            <div style={styles.warningText}>
                                🖥️ Messages will be processed through your backend server.
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
