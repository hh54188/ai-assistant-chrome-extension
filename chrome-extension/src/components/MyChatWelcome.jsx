import React from 'react';
import { Welcome, Prompts } from '@ant-design/x';
import { createStyles } from 'antd-style';

const MOCK_QUESTIONS = [
    'What has Ant Design X upgraded?',
    'What components are in Ant Design X?',
    'How to quickly install and import components?',
];

const useChatWelcomeStyle = createStyles(({ token, css }) => {
    return {
        chatWelcome: css`
            margin-inline: 16px;
            padding: 12px 16px;
            border-radius: 2px 12px 12px 12px;
            background: ${token.colorBgTextHover};
            margin-bottom: 16px;
        `,
    };
});

const ChatWelcome = () => {
    const { styles } = useChatWelcomeStyle();

    return (
        <>
            <Welcome
                variant="borderless"
                title="👋 Hi, creep"
                description="Don't Panic :)"
                className={styles.chatWelcome}
            />
        </>
    );
};

export default ChatWelcome; 