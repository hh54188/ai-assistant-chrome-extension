import {
    CloseOutlined,
    ThunderboltOutlined,
    ThunderboltFilled,
    PlusOutlined,
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
                        // {
                        //     label: <span>GPT</span>,
                        //     title: 'GPT',
                        //     // https://platform.openai.com/docs/models
                        //     options: [
                        //         // GPT-4.1 nano is the fastest, most cost-effective GPT-4.1 model.
                        //         // $0.1 • $0.4
                        //         { label: <span>gpt-4.1-nano</span>, value: 'gpt-4.1-nano' },
                        //         // GPT-4o mini ("o" for "omni") is a fast, affordable small model for focused tasks. 
                        //         // It accepts both text and image inputs, and produces text outputs (including Structured Outputs). 
                        //         // It is ideal for fine-tuning, and model outputs from a larger model like GPT-4o can be distilled to GPT-4o-mini to produce similar results at lower cost and latency. 
                        //         // $0.15 • $0.6
                        //         { label: <span>gpt-4o-mini</span>, value: 'gpt-4o-mini' },
                        //         // GPT-4.1 mini provides a balance between intelligence, speed, and cost that makes it an attractive model for focused tasks.
                        //         // $0.4 • $1.6
                        //         { label: <span>gpt-4.1-mini</span>, value: 'gpt-4.1-mini' },
                        //         // o4-mini is our latest small o-series model. It's optimized for fast, effective reasoning with exceptionally efficient performance in coding and visual tasks.
                        //         // $1.1 • $4.4
                        //         { label: <span>o4-mini</span>, value: 'o4-mini' },
                        //     ],
                        // },
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
            </Space>
        </div>
    );
};

export default ChatHeader; 