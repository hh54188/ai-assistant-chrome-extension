import React, { useState } from 'react';
import { Button } from 'antd';
import CopilotSidebar from './CopilotSidebar';

const CopilotApp = () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div style={{ padding: '20px' }}>
            <Button
                type="primary"
                onClick={() => setIsOpen(!isOpen)}
                style={{ marginBottom: '20px' }}
            >
                {isOpen ? 'Close' : 'Open'} AI Copilot
            </Button>
            <div>
                <h2>Welcome to the AI Copilot!</h2>
                <p>
                    This tool is designed to assist you with a variety of tasks, including:
                </p>
                <ul>
                    <li>Writing reports</li>
                    <li>Drawing diagrams</li>
                    <li>Checking knowledge about different topics</li>
                </ul>
                <div>
                    <a href="https://www.google.com" target="_blank" rel="noopener noreferrer">
                        This is the 1st example of a link.
                    </a>
                </div>
                <div>
                    <a href="https://www.example.com" target="_blank" rel="noopener noreferrer">
                        This is the 2nd example of a link.
                    </a>
                </div>
                <p>
                    <strong>How to use:</strong>
                </p>
                <ol>
                    <li>Use the <b>chat sidebar</b> to interact with the AI.</li>
                    <li>Upload files or try out the available suggestions.</li>
                    <li>You can start a <em>new session</em> at any time, and your conversation history will be saved for your convenience.</li>
                    <li>If you need to rewrite any text in a professional and business-like manner, simply use the <b>"Rewrite"</b> button.</li>
                </ol>
                <blockquote>
                    Enjoy exploring the features and let the AI Copilot help streamline your workflow!
                </blockquote>
            </div>

            <CopilotSidebar
                isOpen={isOpen}
            />
        </div>
    );
};

export default CopilotApp; 