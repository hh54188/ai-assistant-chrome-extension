import { Button, Checkbox } from 'antd';
import React from 'react';

const ModelSelectionModal = ({
    visible,
    onCancel,
    onConfirm,
    selectedModels,
    onModelSelection,
    onAutoEnableTurbo,
}) => {
    if (!visible) return null;

    const allModels = [
        // {
        //     group: 'GPT',
        //     models: [
        //         { label: 'gpt-4.1-nano', value: 'gpt-4.1-nano', description: 'Fastest, most cost-effective GPT-4.1 model' },
        //         { label: 'gpt-4o-mini', value: 'gpt-4o-mini', description: 'Fast, affordable small model for focused tasks' },
        //         { label: 'gpt-4.1-mini', value: 'gpt-4.1-mini', description: 'Balance between intelligence, speed, and cost' },
        //         { label: 'o4-mini', value: 'o4-mini', description: 'Latest small o-series model, optimized for fast reasoning' },
        //     ]
        // },
        {
            group: 'Gemini',
            models: [
                { label: 'gemini-2.5-flash', value: 'gemini-2.5-flash', description: 'Adaptive thinking, cost efficiency' },
                { label: 'gemini-2.5-pro', value: 'gemini-2.5-pro', description: 'Enhanced thinking and reasoning, multimodal understanding' },
                { label: 'gemini-2.0-flash-lite', value: 'gemini-2.0-flash-lite', description: 'Cost efficiency and low latency' },
            ]
        }
    ];

    return (
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
                maxWidth: '350px',
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
                        Select Models for Multi-Generation
                    </h3>
                    <Button 
                        type="text" 
                        onClick={onCancel}
                        style={{ padding: 0, border: 'none' }}
                    >
                        ✕
                    </Button>
                </div>

                {/* Content - Single scrollable area */}
                <div style={{
                    padding: '20px',
                    overflowY: 'auto',
                    flex: 1,
                    minHeight: 0
                }}>
                    {allModels.map((group, groupIndex) => (
                        <div key={groupIndex} style={{ marginBottom: '16px' }}>
                            <h4 style={{ marginTop: 0, marginBottom: '8px', color: '#1890ff', fontWeight: '600', fontSize: '14px' }}>
                                {group.group}
                            </h4>
                            {group.models.map((model, modelIndex) => (
                                <div key={modelIndex} style={{ marginBottom: '6px' }}>
                                    <Checkbox
                                        checked={selectedModels.includes(model.value)}
                                        onChange={(e) => {
                                            onModelSelection(model.value, e.target.checked);
                                            // Auto-enable turbo mode if multiple models are selected
                                            if (e.target.checked && selectedModels.length === 0) {
                                                // This is the first model being selected
                                            } else if (e.target.checked && selectedModels.length === 1) {
                                                // This is the second model being selected, enable turbo mode
                                                onAutoEnableTurbo && onAutoEnableTurbo();
                                            }
                                        }}

                                    >
                                        <div>
                                            <div style={{ fontWeight: '500', fontSize: '13px' }}>{model.label}</div>
                                            <div style={{ fontSize: '11px', color: '#666', marginTop: '1px', lineHeight: '1.3' }}>
                                                {model.description}
                                            </div>
                                        </div>
                                    </Checkbox>
                                </div>
                            ))}
                        </div>
                    ))}
                    {selectedModels.length > 0 && (
                        <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#f6f8fa', borderRadius: '6px' }}>
                            <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
                                Selected Models ({selectedModels.length}):
                            </div>
                            <div style={{ fontSize: '11px', color: '#666', lineHeight: '1.3' }}>
                                {selectedModels.join(', ')}
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
                    <Button onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button 
                        disabled={selectedModels.length === 0}
                        type="primary" 
                        onClick={onConfirm}
                    >
                        Confirm
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ModelSelectionModal; 