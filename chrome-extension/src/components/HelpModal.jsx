import { Button } from 'antd';
import React from 'react';
import { styles } from './HelpModal.styles';

const HelpModal = ({
    visible,
    onCancel,
}) => {
    const handleCancel = () => {
        onCancel();
    };


    if (!visible) return null;

    return (
        <>
            <div style={styles.overlay}>
                <div style={styles.modal}>
                    {/* Header */}
                    <div style={styles.header}>
                        <h3 style={styles.headerTitle}>
                            About AI Assistant
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
                        {/* Open Source Announcement */}
                        <div style={styles.settingContainer}>
                            <div style={styles.settingHeader}>
                                <h4 style={{ margin: 0, fontSize: '16px', color: '#1890ff' }}>
                                    🎉 Open Source & Free
                                </h4>
                            </div>
                            <div style={styles.settingDescription}>
                                This AI Assistant Chrome Extension is completely open source and free to use! 
                                Built with passion to provide powerful AI capabilities without subscription fees.
                            </div>
                        </div>

                        {/* GitHub Repository */}
                        <div style={styles.settingContainer}>
                            <div style={styles.settingHeader}>
                                <label style={styles.settingLabel}>
                                    📂 Source Code
                                </label>
                                <a 
                                    href="https://github.com/liguangyi08/ai-assistant-chrome-extension" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{ textDecoration: 'none' }}
                                >
                                    <Button 
                                        type="primary" 
                                        size="small"
                                    >
                                        View on GitHub
                                    </Button>
                                </a>
                            </div>
                            <div style={styles.settingDescription}>
                                Check out the source code, contribute, or report issues on our GitHub repository.
                            </div>
                            <div style={styles.codeBlock}>
                                <a 
                                    href="https://github.com/hh54188/ai-assistant-chrome-extension" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={styles.link}
                                >
                                    https://github.com/hh54188/ai-assistant-chrome-extension
                                </a>
                            </div>
                        </div>

                        {/* Author Contact */}
                        <div style={styles.settingContainer}>
                            <div style={styles.settingHeader}>
                                <label style={styles.settingLabel}>
                                    👨‍💻 Author
                                </label>
                                <a 
                                    href="mailto:liguangyi08@gmail.com" 
                                    style={{ textDecoration: 'none' }}
                                >
                                    <Button 
                                        type="default" 
                                        size="small"
                                    >
                                        Send Email
                                    </Button>
                                </a>
                            </div>
                            <div style={styles.settingDescription}>
                                Have questions, suggestions, or want to collaborate? Feel free to reach out!
                            </div>
                            <div style={styles.codeBlock}>
                                <a 
                                    href="mailto:liguangyi08@gmail.com" 
                                    style={styles.link}
                                >
                                    liguangyi08@gmail.com
                                </a>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div style={styles.settingContainer}>
                            <div style={styles.settingDescription}>
                                <strong>💡 Built with Cursor:</strong> 99% of this code was written by Cursor AI, 
                                demonstrating the power of AI-assisted development!
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={styles.footer}>
                        <div style={styles.footerLeft}>
                            <span style={{ fontSize: '12px', color: '#666' }}>
                                Version 1.0.0 • MIT License
                            </span>
                        </div>
                        <div style={styles.footerRight}>
                            <Button type="primary" onClick={handleCancel}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HelpModal;
