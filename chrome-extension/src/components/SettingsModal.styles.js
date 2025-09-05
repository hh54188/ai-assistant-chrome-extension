export const styles = {
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },

    loadingContainer: {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center'
    },

    modal: {
        backgroundColor: 'white',
        borderRadius: '8px',
        width: '85%',
        maxWidth: '400px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    },

    header: {
        padding: '16px 20px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0
    },

    headerTitle: {
        margin: 0,
        fontSize: '16px',
        fontWeight: 500
    },

    closeButton: {
        padding: 0,
        border: 'none'
    },

    content: {
        padding: '20px',
        overflowY: 'auto',
        flex: 1,
        minHeight: 0
    },

    settingContainer: {
        marginBottom: '24px'
    },

    settingHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
    },

    settingLabel: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#262626'
    },

    settingDescription: {
        fontSize: '12px',
        color: '#666',
        lineHeight: '1.4',
        marginTop: '4px'
    },

    apiKeyLabel: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#262626',
        display: 'block',
        marginBottom: '8px'
    },

    apiKeyInput: {
        marginBottom: '4px'
    },

    apiKeyDescription: {
        fontSize: '12px',
        color: '#666',
        lineHeight: '1.4'
    },

    warningContainer: {
        padding: '12px',
        backgroundColor: '#fff7e6',
        border: '1px solid #ffd591',
        borderRadius: '6px',
        marginBottom: '16px'
    },

    warningText: {
        fontSize: '12px',
        color: '#d46b08',
        lineHeight: '1.4'
    },

    footer: {
        padding: '16px 20px',
        borderTop: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0
    },

    footerLeft: {
        display: 'flex',
        alignItems: 'center'
    },

    footerRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    }
};
