import React from 'react';
import { Button, Space, Card } from 'antd';
import { CheckOutlined, ThunderboltFilled } from '@ant-design/icons';
import ChatList from './ChatList';
import { useTurboChatListStyles } from './TurboChatList.styles';

const TurboChatList = ({
    selectedModels,
    onSelectModel,
    onCancelTurboMode,
    loading = false,
    turboSessions = {},
    getMessagesForSession = () => []
}) => {
    const { styles } = useTurboChatListStyles();

    const handleSelectModel = (model) => {
        onSelectModel(model);
    };

    return (
        <div className={styles.turboChatList}>
            {/* Turbo Mode Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <ThunderboltFilled style={{ color: '#1890ff', fontSize: '18px' }} />
                    <span className={styles.headerTitle}>
                        Turbo Mode - Multiple AI Models
                    </span>
                    <span className={styles.headerSubtitle}>
                        ({selectedModels.length} models selected)
                    </span>
                </div>
                <Button 
                    size="small" 
                    onClick={onCancelTurboMode}
                    type="text"
                    className={styles.cancelButton}
                >
                    Cancel Turbo Mode
                </Button>
            </div>

            {/* Progress Indicator */}
            {loading && (
                <div className={styles.progressIndicator}>
                    <div className={styles.spinner} />
                    Generating responses from {selectedModels.length} AI models...
                </div>
            )}

            {/* Multiple Chat Lists */}
            <div 
                className={`${styles.chatListsContainer} ${styles.customScrollbar}`}
                style={{
                    overflowX: 'auto',
                    justifyContent: 'flex-start'
                }}
            >
                {selectedModels.map((model) => (
                                                                    <Card
                            key={model}
                            size="small"
                            className={styles.chatCard}
                            style={{
                                minWidth: '350px',
                                maxWidth: '350px',
                                flex: '1 1 auto'
                            }}
                            title={
                                <div className={styles.cardTitle}>
                                    <span className={styles.cardTitleText}>{model}</span>
                                </div>
                            }
                            extra={
                                <Button
                                    type="primary"
                                    size="small"
                                    icon={<CheckOutlined />}
                                    onClick={() => handleSelectModel(model)}
                                    className={styles.continueButton}
                                >
                                    Continue with this model
                                </Button>
                            }
                            bodyStyle={{
                                padding: '8px',
                                minHeight: '300px',
                                maxHeight: '600px',
                                overflow: 'hidden'
                            }}
                        >
                        <div className={styles.cardContent}>
                            {loading ? (
                                <div className={styles.loadingContainer}>
                                    <div className={styles.loadingSpinner} />
                                    <div className={styles.loadingText}>
                                        {model} is thinking...
                                    </div>
                                    <div className={styles.loadingSubtext}>
                                        Generating response...
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.chatContent}>
                                    <ChatList
                                        messages={getMessagesForSession(turboSessions[model])}
                                        styles={styles}
                                    />
                                </div>
                            )}
                        </div>
                    </Card>
                ))}
            </div>


        </div>
    );
};

export default TurboChatList;
