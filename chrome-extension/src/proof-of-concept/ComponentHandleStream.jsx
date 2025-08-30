import React, { useState } from 'react';
import { Button } from 'antd';

const BACKEND_URL = 'http://localhost:3001';

const ComponentHandleStream = () => {
    const [streamedText, setStreamedText] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);

    const handleTriggerStream = () => {
        console.log('Trigger Stream');
        setStreamedText('');
        setIsStreaming(true);

        fetch(`${BACKEND_URL}/api/chat/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream',
            },
            body: JSON.stringify({
                message: '测试测试',
                provider: 'openai',
                conversationHistory: []
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const stream = response.body;
                const reader = stream.getReader();
                
                let buffer = '';
                
                const readChunk = () => {
                    reader.read()
                        .then(({ value, done }) => {
                            if (done) {
                                console.log('Stream finished');
                                setIsStreaming(false);
                                return;
                            }
                            
                            const chunkString = new TextDecoder().decode(value);
                            buffer += chunkString;
                            
                            const lines = buffer.split('\n');
                            
                            buffer = lines.pop() || '';
                            
                            lines.forEach(line => {
                                if (line.startsWith('data: ')) {
                                    try {
                                        const jsonData = JSON.parse(line.slice(6));
                                        
                                        if (jsonData.content) {
                                            setStreamedText(prev => prev + jsonData.content);
                                        }
                                        
                                        if (jsonData.done) {
                                            console.log('Stream completed');
                                            setIsStreaming(false);
                                        }
                                        
                                        if (jsonData.error) {
                                            console.error('Stream error:', jsonData.error);
                                            setIsStreaming(false);
                                        }
                                    } catch (parseError) {
                                        console.error('Error parsing JSON:', parseError, 'Line:', line);
                                    }
                                }
                            });
                            
                            readChunk();
                        })
                        .catch(error => {
                            console.error('Error reading stream:', error);
                            setIsStreaming(false);
                        });
                };
                
                readChunk();
            })
            .catch(error => {
                console.error('Fetch error:', error);
                setIsStreaming(false);
            });
    };

    return (
        <div style={{ padding: '20px' }}>
            <Button 
                onClick={handleTriggerStream} 
                type="primary" 
                loading={isStreaming}
                disabled={isStreaming}
            >
                {isStreaming ? 'Streaming...' : 'Trigger Stream'}
            </Button>
            
            {streamedText && (
                <div style={{ 
                    marginTop: '20px', 
                    padding: '15px', 
                    border: '1px solid #d9d9d9', 
                    borderRadius: '6px',
                    backgroundColor: '#fafafa',
                    minHeight: '100px'
                }}>
                    <h4>Streamed Response:</h4>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{streamedText}</p>
                </div>
            )}
        </div>
    );
};

export default ComponentHandleStream; 