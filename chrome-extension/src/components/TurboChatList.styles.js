import { createStyles } from 'antd-style';

export const useTurboChatListStyles = createStyles(({ token }) => ({
    // Main container
    turboChatList: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
    },

    // Header section
    header: {
        padding: '16px',
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        backgroundColor: token.colorBgContainer,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
    },

    headerContent: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },

    headerTitle: {
        fontSize: '16px',
        fontWeight: token.fontWeightStrong,
        color: token.colorText
    },

    headerSubtitle: {
        fontSize: '14px',
        color: token.colorTextSecondary
    },

    cancelButton: {
        padding: '4px 8px',
        fontSize: '12px'
    },

    // Progress indicator
    progressIndicator: {
        padding: '8px 16px',
        backgroundColor: token.colorSuccessBg,
        borderBottom: `1px solid ${token.colorSuccessBorder}`,
        fontSize: '12px',
        color: token.colorSuccess,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexShrink: 0
    },

    spinner: {
        width: '12px',
        height: '12px',
        border: `2px solid ${token.colorSuccessBorder}`,
        borderTop: `2px solid ${token.colorSuccess}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },

    // Chat lists container
    chatListsContainer: {
        display: 'flex',
        gap: '16px',
        padding: '16px',
        minHeight: '400px',
        height: 'calc(100% - 100px)',
        flex: 1,
        overflow: 'hidden'
    },

    // Individual chat card
    chatCard: {
        minWidth: '300px',
        border: `1px solid ${token.colorBorder}`,
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column'
    },

    cardTitle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '14px'
    },

    cardTitleText: {
        fontWeight: token.fontWeightStrong,
        color: token.colorText
    },

    continueButton: {
        borderRadius: '6px',
        fontSize: '12px',
        height: '28px',
        padding: '0 12px'
    },

    cardBody: {
        padding: '8px',
        minHeight: '300px',
        maxHeight: '600px',
        overflow: 'hidden',
        flex: 1
    },

    cardContent: {
        height: '100%',
        overflow: 'hidden'
    },

    // Loading state
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
        padding: '20px',
        textAlign: 'center',
        backgroundColor: token.colorBgContainer
    },

    loadingSpinner: {
        width: '24px',
        height: '24px',
        border: `2px solid ${token.colorBorder}`,
        borderTop: `2px solid ${token.colorPrimary}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '12px'
    },

    loadingText: {
        fontSize: '12px',
        color: token.colorTextSecondary,
        fontWeight: token.fontWeightMedium
    },

    loadingSubtext: {
        fontSize: '11px',
        color: token.colorTextTertiary,
        marginTop: '4px'
    },

    // Chat content
    chatContent: {
        height: '100%',
        overflow: 'auto'
    },

    // Responsive adjustments
    responsiveContainer: {
        overflowX: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: `${token.colorBorder} ${token.colorBgContainer}`
    },

    // Animations
    '@keyframes spin': {
        '0%': {
            transform: 'rotate(0deg)'
        },
        '100%': {
            transform: 'rotate(360deg)'
        }
    },

    '@keyframes pulse': {
        '0%': {
            opacity: 1
        },
        '50%': {
            opacity: 0.5
        },
        '100%': {
            opacity: 1
        }
    },

    // Custom scrollbar styles
    customScrollbar: {
        '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px'
        },
        '&::-webkit-scrollbar-track': {
            background: token.colorBgContainer,
            borderRadius: '3px'
        },
        '&::-webkit-scrollbar-thumb': {
            background: token.colorBorder,
            borderRadius: '3px'
        },
        '&::-webkit-scrollbar-thumb:hover': {
            background: token.colorTextQuaternary
        }
    }
}));
