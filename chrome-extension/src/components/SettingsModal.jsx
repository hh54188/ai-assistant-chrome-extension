import { Button, Input, Switch } from 'antd';
import React, { useState, useEffect } from 'react';
import { notification } from '../utils/notifications';

const SettingsModal = ({
    visible,
    onCancel,
    onConfirm,
}) => {
    const [frontendOnlyMode, setFrontendOnlyMode] = useState(false);
    const [apiKey, setApiKey] = useState('');

    // Load settings from localStorage on component mount
    useEffect(() => {
        if (visible) {
            const savedFrontendMode = localStorage.getItem('frontendOnlyMode') === 'true';
            const savedApiKey = localStorage.getItem('geminiApiKey') || '';
            setFrontendOnlyMode(savedFrontendMode);
            setApiKey(savedApiKey);
        }
    }, [visible]);

    const handleSave = () => {
        try {
            // Save settings to localStorage
            localStorage.setItem('frontendOnlyMode', frontendOnlyMode.toString());
            localStorage.setItem('geminiApiKey', apiKey);
            
            notification.success('Settings saved successfully');
            onConfirm();
        } catch (error) {
            notification.error('Failed to save settings');
            console.error('Error saving settings:', error);
        }
    };

    const handleCancel = () => {
        // Reset to saved values
        const savedFrontendMode = localStorage.getItem('frontendOnlyMode') === 'true';
        const savedApiKey = localStorage.getItem('geminiApiKey') || '';
        setFrontendOnlyMode(savedFrontendMode);
        setApiKey(savedApiKey);
        onCancel();
    };

    if (!visible) return null;

    return (
        <>
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
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    width: '85%',
                    maxWidth: '400px',
                    maxHeight: '80vh',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid #f0f0f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexShrink: 0
                    }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 500 }}>
                            Settings
                        </h3>
                        <Button 
                            type="text" 
                            onClick={handleCancel}
                            style={{ padding: 0, border: 'none' }}
                        >
                            ✕
                        </Button>
                    </div>

                    {/* Content */}
                    <div style={{
                        padding: '20px',
                        overflowY: 'auto',
                        flex: 1,
                        minHeight: 0
                    }}>
                        {/* Frontend Only Mode Setting */}
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '8px'
                            }}>
                                <label style={{ 
                                    fontSize: '14px', 
                                    fontWeight: '500',
                                    color: '#262626'
                                }}>
                                    Direct API Mode
                                </label>
                                <Switch
                                    checked={frontendOnlyMode}
                                    onChange={setFrontendOnlyMode}
                                />
                            </div>
                            <div style={{ 
                                fontSize: '12px', 
                                color: '#666', 
                                lineHeight: '1.4',
                                marginTop: '4px'
                            }}>
                                When enabled, messages are sent directly to Gemini API using your API key. 
                                When disabled, messages go through the backend server first.
                            </div>
                        </div>

                        {/* API Key Input */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ 
                                fontSize: '14px', 
                                fontWeight: '500',
                                color: '#262626',
                                display: 'block',
                                marginBottom: '8px'
                            }}>
                                Gemini API Key
                            </label>
                            <Input.Password
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Enter your Gemini API key"
                                style={{ marginBottom: '4px' }}
                            />
                            <div style={{ 
                                fontSize: '12px', 
                                color: '#666', 
                                lineHeight: '1.4'
                            }}>
                                Required when Direct API Mode is enabled. Your API key is stored locally and never sent to our servers.
                            </div>
                        </div>

                        {/* Warning when frontend mode is enabled */}
                        {frontendOnlyMode && (
                            <div style={{ 
                                padding: '12px', 
                                backgroundColor: '#fff7e6', 
                                border: '1px solid #ffd591',
                                borderRadius: '6px',
                                marginBottom: '16px'
                            }}>
                                <div style={{ 
                                    fontSize: '12px', 
                                    color: '#d46b08',
                                    lineHeight: '1.4'
                                }}>
                                    ⚠️ Direct API Mode is enabled. Make sure you have a valid Gemini API key configured.
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{
                        padding: '16px 20px',
                        borderTop: '1px solid #f0f0f0',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '8px',
                        flexShrink: 0
                    }}>
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
        </>
    );
};

export default SettingsModal;
