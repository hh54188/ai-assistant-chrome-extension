import { createStyles } from 'antd-style';

export const useChatHeaderStyle = createStyles(({ token, css }) => {
    return {
        chatHeader: css`
      height: 52px;
      box-sizing: border-box;
      border-bottom: 1px solid ${token.colorBorder};
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10px 0 16px;
    `,
        headerTitle: css`
        margin-left: 0px;
      font-weight: 600;
      font-size: 15px;
    `,
        headerButton: css`
      font-size: 18px;
    `,
        conversations: css`
      width: 300px;
      .ant-conversations-list {
        padding-inline-start: 0;
      }
    `,
    };
}); 