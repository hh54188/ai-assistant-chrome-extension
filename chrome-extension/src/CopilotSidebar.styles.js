import { createStyles } from 'antd-style';

export const useCopilotStyle = createStyles(({ token, css }) => {
    return {
        copilotChat: css`
      display: flex;
      flex-direction: column;
      background: ${token.colorBgContainer};
      color: ${token.colorText};
      position: fixed;
      top: 0;
      right: 0;
      height: 100vh;
      z-index: 9999;
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
      transition: width 0.3s ease;
      overflow: hidden;
    `,
        sidebarLayout: css`
      display: flex;
      height: 100vh;
      width: 100%;
    `,
        mainContent: css`
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    `,
        chatList: css`
      overflow: auto;
      padding-block: 16px;
      flex: 1;
    `,

        loadingMessage: css`
      background-image: linear-gradient(90deg, #ff6b23 0%, #af3cb8 31%, #53b6ff 89%);
      background-size: 100% 2px;
      background-repeat: no-repeat;
      background-position: bottom;
    `,
        chatSend: css`
      padding: 12px;
    `,
        sendAction: css`
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      gap: 8px;
    `,
        speechButton: css`
      font-size: 18px;
      color: ${token.colorText} !important;
    `,
    };
}); 