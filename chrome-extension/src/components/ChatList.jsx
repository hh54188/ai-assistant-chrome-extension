import {
    CopyOutlined,
    DislikeOutlined,
    LikeOutlined,
    ReloadOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Space, Spin, Button } from 'antd';
import { Bubble } from '@ant-design/x';
import React from 'react';
import ChatWelcome from './ChatWelcome';
import MyChatWelcome from './MyChatWelcome';
import markdownit from 'markdown-it';
import { useStyles } from './ChatList.styles';
import { notification } from '../utils/notifications';
const md = markdownit({ html: true, breaks: true, linkify: true });

const renderMarkdown = (content) => {
    return (
        <div dangerouslySetInnerHTML={{ __html: md.render(content) }} />
    );
};



const AGENT_PLACEHOLDER = '内容生成中，请稍等...';
const LoadingMessage = () => {
    return (
        <div>
            <Spin size="small" />
            {AGENT_PLACEHOLDER}
        </div>
    );
};

const ChatList = ({
    messages,
    styles,
}) => {
    const { styles: componentStyles } = useStyles();

    const handleCopy = async (messageContent) => {
        if (messageContent) {
            try {
                // First try the Chrome extension background script approach
                if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
                    const response = await chrome.runtime.sendMessage({
                        action: 'copyToClipboard',
                        text: messageContent
                    });
                    
                    if (response && response.success) {
                        notification.success('Message copied to clipboard');
                    } else {
                        throw new Error(response?.error || 'Background script copy failed');
                    }
                } else {
                    // Fallback for regular web pages
                    await navigator.clipboard.writeText(messageContent);
                    notification.success('Message copied to clipboard');
                }
            } catch (error) {
                // Final fallback using document.execCommand (deprecated but still works)
                try {
                    const textArea = document.createElement('textarea');
                    textArea.value = messageContent;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-999999px';
                    textArea.style.top = '-999999px';
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    notification.success('Message copied to clipboard');
                } catch (fallbackError) {
                    console.error('Copy failed:', error, fallbackError);
                    notification.error('Failed to copy, please try again');
                }
            }
        }
    };

    return (
        <div className={`${styles.chatList} ${componentStyles.bubbleContentParagraphs}`}>
            {messages?.length ? (
                <Bubble.List
                    style={{ height: '100%', paddingInline: 16 }}
                    items={messages?.map((i) => {
                        return {
                            ...i.message,
                            loading: i.status === 'loading',
                            typing: i.status === 'loading' ? { step: 5, interval: 20, suffix: <>💗</> } : false,
                        };
                    })}
                    roles={{
                        assistant: {
                            placement: 'start',
                            messageRender: renderMarkdown,
                            avatar: { icon: <UserOutlined />, style: { background: '#fde3cf' } },
                            styles: {
                                footer: {
                                    marginTop: 4,
                                },
                                content: {
                                    paddingTop: 12,
                                    paddingBottom: 12,
                                }
                            },
                            footer: (item) => {
                                return (
                                    <div style={{ display: 'flex' }}>
                                        {/* <Button type="text" size="small" icon={<ReloadOutlined />} /> */}
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<CopyOutlined />}
                                            onClick={() => handleCopy(item)}
                                        />
                                        {/* <Button type="text" size="small" icon={<LikeOutlined />} /> */}
                                        {/* <Button type="text" size="small" icon={<DislikeOutlined />} /> */}
                                    </div>
                                );
                            }
                        },
                        user: { 
                            avatar: { icon: <UserOutlined />, style: { background: '#87d068' } },
                            placement: 'end',
                            messageRender: renderMarkdown,
                            styles: {
                                footer: {
                                    marginTop: 4,
                                },
                                content: {
                                    paddingTop: 12,
                                    paddingBottom: 12,
                                }
                            },
                        },
                    }}
                />
            ) : (
                <MyChatWelcome />
            )}
        </div>
    );
};

export default ChatList; 