import {
    UserOutlined,
} from '@ant-design/icons';
import { Bubble } from '@ant-design/x';
import React, {  } from 'react';
import markdownit from 'markdown-it';
import { useStyles } from './ChatList.styles';
const md = markdownit({ html: true, breaks: true, linkify: true });

const renderMarkdown = (content) => {
    return (
        <div dangerouslySetInnerHTML={{ __html: md.render(content) }} />
    );
};


const ChatList = ({
    messages,
    styles,
}) => {
    const { styles: componentStyles } = useStyles();
    const loadingMessage = messages.find(message => message.status === 'loading');
    console.log(loadingMessage?.message?.content);

    return (
        <div className={`${styles.chatList} ${componentStyles.bubbleContentParagraphs}`}>
            <Bubble.List
                style={{ height: '100%', paddingInline: 16 }}
                items={messages?.map((i) => {
                    return {
                        ...i.message,
                        // loading: i.status === 'loading',
                        // typing: i.status === 'loading' ? { step: 5, interval: 20, suffix: <>💗</> } : false,
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
        </div>
    );
};

export default ChatList; 