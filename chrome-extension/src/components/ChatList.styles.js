import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ token }) => ({
  chatList: {
    height: '100%',
    overflow: 'auto',
  },
  // Global styles for p tags inside ant-bubble-content
  bubbleContentParagraphs: {
    '& .ant-bubble-content p': {
      marginTop: token.marginMD,
      marginBottom: token.marginMD,
    },
    '& .ant-bubble-content p:first-child': {
      marginTop: 0,
    },
    '& .ant-bubble-content p:last-child': {
      marginBottom: 0,
    },
  },
}));
