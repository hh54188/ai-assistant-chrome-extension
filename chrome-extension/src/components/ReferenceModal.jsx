import React, { useState, useEffect } from 'react';
import { Modal, Segmented, Input, Select, Button, Space } from 'antd';
import { FileTextOutlined, LinkOutlined, GlobalOutlined, EditOutlined } from '@ant-design/icons';

const { Option } = Select;

const ReferenceModal = ({ 
    visible, 
    onCancel, 
    onConfirm, 
    selection,
    loading = false 
}) => {
    const DEFAULT_PROMPT = 'rephrase';
    const [materialType, setMaterialType] = useState('selected-text');
    const [materialContent, setMaterialContent] = useState('');
    const [selectedPrompt, setSelectedPrompt] = useState(DEFAULT_PROMPT);

    // Pre-defined prompts
    const predefinedPrompts = [
        {
            label: 'Rephrase',
            value: 'rephrase',
            prompt: 'Please rephrase the following content in professional and business-like way, I will use it in a business chat:'
        },
        {
            label: 'Summarize',
            value: 'summarize',
            prompt: 'Please summarize the following content in a clear and concise way:'
        },
        {
            label: 'Explain',
            value: 'explain',
            prompt: 'Please explain the following content in like I am a 5th grader with example:'
        },
        {
            label: 'Analyze',
            value: 'analyze',
            prompt: 'Please analyze the following content and provide insights:'
        },
        {
            label: 'Translate',
            value: 'translate',
            prompt: 'Please translate the following content to English:'
        },
        {
            label: 'Custom',
            value: 'custom',
            prompt: ''
        }
    ];
    const [prompt, setPrompt] = useState(predefinedPrompts.find(p => p.value === DEFAULT_PROMPT).prompt);

    // Extract URLs from HTML content
    const extractUrls = (html) => {
        if (!html) return '';
        const urlRegex = /href=["']([^"']+)["']/g;
        const urls = [];
        let match;
        while ((match = urlRegex.exec(html)) !== null) {
            urls.push(match[1]);
        }
        return urls.join('\n');
    };

    // Get page content
    const getPageContent = () => {
        if (!selection) return '';
        return `Page Title: ${selection.title || document.title}
Page URL: ${selection.url || window.location.href}
Page Content: ${document.body.innerText || ''}`;
    };

    // Update material content when selection or material type changes
    useEffect(() => {
        if (!selection) {
            setMaterialContent('');
            return;
        }

        switch (materialType) {
            case 'selected-text':
                setMaterialContent(selection.text || '');
                break;
            case 'links':
                setMaterialContent(extractUrls(selection.html || ''));
                break;
            case 'page':
                setMaterialContent(getPageContent());
                break;
            default:
                setMaterialContent('');
        }
    }, [materialType, selection]);

    // Handle prompt selection
    const handlePromptSelect = (value) => {
        setSelectedPrompt(value);
        const selectedPromptData = predefinedPrompts.find(p => p.value === value);
        if (selectedPromptData && value !== 'custom') {
            setPrompt(selectedPromptData.prompt);
        } else if (value === 'custom') {
            setPrompt('');
        }
    };

    // Handle confirm action
    const handleConfirm = () => {
        if (!materialContent.trim()) {
            return;
        }

        const finalPrompt = prompt.trim() 
            ? `${prompt}\n\n${materialContent}`
            : materialContent;

        onConfirm(finalPrompt);
    };

    const materialOptions = [
        {
            label: (
                <Space>
                    <FileTextOutlined />
                    Selected Text
                </Space>
            ),
            value: 'selected-text'
        },
        {
            label: (
                <Space>
                    <LinkOutlined />
                    Links
                </Space>
            ),
            value: 'links'
        },
        // {
        //     label: (
        //         <Space>
        //             <GlobalOutlined />
        //             Page
        //         </Space>
        //     ),
        //     value: 'page'
        // }
    ];

    if (!visible) return null;

    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '400px',
            maxHeight: '80vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}>
                {/* Header */}
                <div style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 500 }}>
                        Reference Material & Prompt
                    </h3>
                    <Button 
                        type="text" 
                        onClick={onCancel}
                        style={{ padding: 0, border: 'none' }}
                    >
                        ✕
                    </Button>
                </div>

                {/* Content */}
                <div style={{
                    padding: '24px',
                    overflowY: 'auto',
                    flex: 1
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Part 1: Material Selection */}
                        <div>
                            <h4 style={{ marginBottom: '12px' }}>
                                <EditOutlined style={{ marginRight: '8px' }} />
                                Reference Material
                            </h4>
                            <Segmented
                                options={materialOptions}
                                value={materialType}
                                onChange={setMaterialType}
                                style={{ marginBottom: '12px' }}
                            />
                            <Input.TextArea
                                value={materialContent}
                                onChange={(e) => setMaterialContent(e.target.value)}
                                placeholder="No content available for the selected option"
                                style={{ 
                                    height: 120, 
                                    minHeight: 120,
                                    resize: 'vertical'
                                }}
                                readOnly={false}
                            />
                        </div>

                        {/* Part 2: Prompt Input */}
                        <div>
                            <h4 style={{ marginBottom: '12px' }}>
                                <EditOutlined style={{ marginRight: '8px' }} />
                                AI Prompt
                            </h4>
                            <Input.TextArea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Enter your prompt here..."
                                style={{ 
                                    height: 100, 
                                    minHeight: 100,
                                    resize: 'vertical',
                                    marginBottom: '12px'
                                }}
                            />
                            <Select
                                placeholder="Choose a predefined prompt"
                                style={{ width: '100%' }}
                                getPopupContainer={triggerNode => triggerNode.parentNode}
                                value={selectedPrompt}
                                onChange={handlePromptSelect}
                                allowClear
                            >
                                {predefinedPrompts.map(prompt => (
                                    <Option key={prompt.value} value={prompt.value}>
                                        {prompt.label}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 24px',
                    borderTop: '1px solid #f0f0f0',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '8px'
                }}>
                    <Button onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button 
                        type="primary" 
                        onClick={handleConfirm}
                        loading={loading}
                        disabled={!materialContent.trim()}
                    >
                        Send to AI
                    </Button>
                </div>
        </div>
    );
};

export default ReferenceModal; 