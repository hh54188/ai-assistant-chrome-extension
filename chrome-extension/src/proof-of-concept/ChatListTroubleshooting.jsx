import React, { useState, useEffect } from 'react';
import ChatList from "../components/ChatListTest";
import { useCopilotStyle } from '../CopilotSidebar.styles';

const ChatListTroubleshooting = () => {
    const { styles } = useCopilotStyle();
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // Static user message
        const userMessage = {
            message: { role: 'user', content: 'Can you explain how streaming works in web applications?' },
            status: 'done'
        };

        // Full assistant response that we'll stream
        const fullResponse = `Streaming in web applications is a technique where data is sent from server to client in small chunks rather than waiting for the entire response to be ready. This provides several benefits:

**Real-time User Experience**: Users see content appearing progressively, making the application feel more responsive and engaging.

**Memory Efficiency**: Large responses don't need to be fully loaded into memory before transmission begins.

**Better Performance**: Users can start seeing and interacting with content as soon as the first chunks arrive.

**Common Use Cases**:
- **Chat Applications**: Messages appear word by word as they're generated
- **Live Data Feeds**: Stock prices, sports scores, news updates
- **File Downloads**: Progress bars and partial content access
- **Video Streaming**: Progressive loading of video content
\`\`\`

The key is to handle the stream progressively and update the UI incrementally, creating a smooth user experience.`;

        let currentIndex = 0;
        const words = fullResponse.split(' ');
        
        const interval = setInterval(() => {
            if (currentIndex < words.length) {
                // Add 1-3 words per update to simulate realistic streaming
                const wordsToAdd = Math.min(Math.floor(Math.random() * 3) + 1, words.length - currentIndex);
                const newContent = words.slice(0, currentIndex + wordsToAdd).join(' ');
                
                const streamingMessage = {
                    message: { role: 'assistant', content: newContent },
                    status: currentIndex + wordsToAdd >= words.length ? 'done' : 'loading'
                };

                setMessages([userMessage, streamingMessage]);
                currentIndex += wordsToAdd;
            } else {
                // Reset to start over
                currentIndex = 0;
            }
        }, 100); // Update every 500ms

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, []);

    return (
        <ChatList messages={messages} styles={styles} />
    );
};

export default ChatListTroubleshooting;