import {
    CloseOutlined,
    ThunderboltOutlined,
    ThunderboltFilled,
    PlusOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Button, Space, Select } from 'antd';
import React from 'react';
import { useChatHeaderStyle } from './ChatHeader.styles';

const ChatHeader = ({
    selectedProvider,
    setSelectedProvider,
    onOpenModelSelection,
    turboMode,
    handleCancelTurboMode,
    turboModeExpanded,
    handleNewSession
}) => {
    const { styles } = useChatHeaderStyle();

    return (
        <div className={styles.chatHeader}>
            <div className={styles.headerTitle}>
                ✨ Him
                {turboMode && turboModeExpanded && (
                    <span style={{
                        marginLeft: '8px',
                        fontSize: '12px',
                        backgroundColor: '#1890ff',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontWeight: '500'
                    }}>
                        🚀 Turbo Mode
                    </span>
                )}
            </div>
            <Space size={8}>
                <Select
                    disabled={turboMode}
                    value={selectedProvider}
                    onChange={setSelectedProvider}
                    style={{ width: 160 }}
                    size="small"
                    getPopupContainer={(triggerNode) => triggerNode.parentNode}
                    options={[
                        {
                            label: <span>Gemini</span>,
                            title: 'Gemini',
                            // https://ai.google.dev/gemini-api/docs/models
                            options: [
                                // Adaptive thinking, cost efficiency
                                { label: <span>gemini-2.5-flash</span>, value: 'gemini-2.5-flash' },
                                // Enhanced thinking and reasoning, multimodal understanding, advanced coding, and more
                                { label: <span>gemini-2.5-pro</span>, value: 'gemini-2.5-pro' },
                                // Cost efficiency and low latency
                                { label: <span>gemini-2.0-flash-lite</span>, value: 'gemini-2.0-flash-lite' },
                            ],
                        },
                    ]}
                />
                {!turboMode ? <Button
                    type="text"
                    icon={<ThunderboltOutlined />}
                    onClick={onOpenModelSelection}
                    className={styles.headerButton}
                /> : <Button
                    type="text"
                    icon={<ThunderboltFilled />}
                    onClick={handleCancelTurboMode}
                    className={styles.headerButton}
                />}
                <Button
                    type="text"
                    icon={<PlusOutlined />}
                    onClick={handleNewSession}
                    className={styles.headerButton}
                />
                <Button
                    type="text"
                    icon={<UserOutlined />}
                    onClick={null}
                    className={styles.headerButton}
                />
            </Space>
        </div>
    );
};

export default ChatHeader; 