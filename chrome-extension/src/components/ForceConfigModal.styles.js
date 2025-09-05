export const styles = {
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },

    modal: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        width: '90%',
        maxWidth: '480px',
        maxHeight: '85%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #e8e8e8',
        boxSizing: 'border-box',
    },

    loadingContainer: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '40px',
        textAlign: 'center',
        fontSize: '16px',
        color: '#666',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    },

    header: {
        padding: '24px 24px 0 24px',
        textAlign: 'center',
        borderBottom: 'none',
    },

    iconContainer: {
        marginBottom: '16px',
    },

    warningIcon: {
        fontSize: '48px',
        display: 'inline-block',
        animation: 'pulse 2s infinite',
    },

    headerTitle: {
        margin: '0 0 8px 0',
        fontSize: '24px',
        fontWeight: '600',
        color: '#1a1a1a',
        lineHeight: '1.3',
    },

    headerSubtitle: {
        margin: 0,
        fontSize: '16px',
        color: '#666',
        fontWeight: '400',
        lineHeight: '1.4',
    },

    content: {
        padding: '24px',
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        minWidth: 0,
    },

    noticeContainer: {
        backgroundColor: '#fff7e6',
        border: '1px solid #ffd591',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
    },

    noticeText: {
        color: '#d46b08',
        fontSize: '14px',
        lineHeight: '1.5',
        margin: 0,
    },

    optionContainer: {
        border: '2px solid #f0f0f0',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
        transition: 'all 0.2s ease',
        backgroundColor: '#fafafa',
        boxSizing: 'border-box',
        minWidth: 0,
    },

    optionHeader: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '12px',
    },

    optionNumber: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: '#1890ff',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        fontWeight: '600',
        marginRight: '12px',
        flexShrink: 0,
    },

    optionTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#1a1a1a',
        margin: 0,
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
    },

    optionDescription: {
        fontSize: '14px',
        color: '#666',
        lineHeight: '1.5',
        marginBottom: '16px',
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
    },

    apiKeyContainer: {
        display: 'flex',
        gap: '12px',
        alignItems: 'stretch',
        marginBottom: '12px',
        minWidth: 0,
        width: '100%',
    },

    apiKeyInput: {
        flex: 1,
        height: '40px',
        borderRadius: '8px',
        border: '1px solid #d9d9d9',
        fontSize: '14px',
        minWidth: 0,
        boxSizing: 'border-box',
    },

    useApiButton: {
        height: '40px',
        borderRadius: '8px',
        paddingLeft: '16px',
        paddingRight: '16px',
        fontSize: '14px',
        fontWeight: '500',
        flexShrink: 0,
    },

    helpText: {
        fontSize: '13px',
        color: '#666',
        lineHeight: '1.4',
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
    },

    helpLink: {
        color: '#1890ff',
        textDecoration: 'none',
        marginLeft: '4px',
        fontWeight: '500',
    },

    divider: {
        display: 'flex',
        alignItems: 'center',
        margin: '24px 0',
        gap: '16px',
    },

    dividerLine: {
        flex: 1,
        height: '1px',
        backgroundColor: '#e8e8e8',
    },

    dividerText: {
        fontSize: '12px',
        color: '#999',
        fontWeight: '500',
        backgroundColor: '#fff',
        padding: '0 8px',
    },

    backendActions: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '12px',
        minWidth: 0,
        width: '100%',
    },

    guideButton: {
        height: '40px',
        borderRadius: '8px',
        paddingLeft: '16px',
        paddingRight: '16px',
        fontSize: '14px',
        fontWeight: '500',
        border: '1px solid #d9d9d9',
        backgroundColor: '#fff',
        color: '#1a1a1a',
        width: '100%',
    },

    retryButton: {
        height: '40px',
        borderRadius: '8px',
        paddingLeft: '16px',
        paddingRight: '16px',
        fontSize: '14px',
        fontWeight: '500',
        border: '1px solid #1890ff',
        backgroundColor: '#fff',
        color: '#1890ff',
        width: '100%',
    },

    successMessage: {
        color: '#52c41a',
        fontSize: '14px',
        fontWeight: '500',
        padding: '8px 12px',
        backgroundColor: '#f6ffed',
        border: '1px solid #b7eb8f',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
    },

    footer: {
        padding: '16px 24px 24px 24px',
        borderTop: '1px solid #f0f0f0',
        backgroundColor: '#fafafa',
    },

    footerNote: {
        fontSize: '13px',
        color: '#666',
        textAlign: 'center',
        lineHeight: '1.4',
        margin: 0,
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
    },
};

// Add CSS animation for the warning icon pulse
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}
