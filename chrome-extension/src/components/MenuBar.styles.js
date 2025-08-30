import { createStyles } from 'antd-style';

export const useMenuBarStyle = createStyles(({ token, css }) => {
    return {
        menuBar: css`
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            padding: 12px 8px;
            background: linear-gradient(180deg, ${token.colorBgElevated} 0%, ${token.colorBgContainer} 100%);
            border-right: 1px solid ${token.colorBorderSecondary};
            width: 48px;
            height: 100vh;
            box-shadow: 1px 0 2px rgba(0, 0, 0, 0.05);
        `,
        headerButton: css`
            font-size: 16px;
        `,
        conversations: css`
            width: 200px;
            .ant-conversations-list {
                padding-inline-start: 0;
            }
        `,
        menuBarTop: css`
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            margin-top: 30px;
        `,
        menuBarBottom: css`
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            margin-bottom: 12px;
        `,
        menuButton: css`
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border-radius: 8px;
            color: ${token.colorTextSecondary};
            transition: all 0.2s ease;
            margin: 2px 0;
            font-size: 18px;
            
            &:hover {
                background: ${token.colorBgTextHover};
                color: ${token.colorText};
                transform: scale(1.05);
            }
            
            &:active {
                background: ${token.colorBgTextActive};
                transform: scale(0.95);
            }
        `,
    };
}); 