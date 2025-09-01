/**
 * Custom notification system for Chrome extension
 * Replaces Ant Design message notifications with reliable toast notifications
 */

let notificationId = 0;

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of notification: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
export const showNotification = (message, type = 'success', duration = 3000) => {
    console.log(`🎯 showNotification called: ${type} - ${message}`);
    
    const colors = {
        success: '#52c41a',
        error: '#ff4d4f',
        warning: '#faad14',
        info: '#1677ff'
    };
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    const backgroundColor = colors[type] || colors.success;
    const icon = icons[type] || icons.success;
    const fullMessage = `${icon} ${message}`;
    
    // Create unique ID for this notification
    const currentId = ++notificationId;
    
    // Create toast element
    const toast = document.createElement('div');
    toast.id = `notification-${currentId}`;
    toast.textContent = fullMessage;
    toast.style.cssText = `
        position: fixed !important;
        top: ${20 + (currentId - 1) * 60}px !important;
        right: 20px !important;
        background: ${backgroundColor} !important;
        color: white !important;
        padding: 12px 16px !important;
        border-radius: 6px !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        z-index: 999999 !important;
        font-size: 14px !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        max-width: 300px !important;
        word-wrap: break-word !important;
        transition: all 0.3s ease !important;
        pointer-events: auto !important;
        opacity: 0 !important;
        transform: translateX(100%) !important;
        cursor: pointer !important;
    `;
    
    // Add click to dismiss
    toast.addEventListener('click', () => {
        dismissNotification(toast);
    });
    
    document.body.appendChild(toast);
    console.log(`🎯 Toast element added to DOM:`, toast);
    
    // Animate in
    setTimeout(() => {
        console.log(`🎯 Animating toast in (ID: ${currentId})`);
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
    }, 10);
    
    // Auto-dismiss after duration
    setTimeout(() => {
        dismissNotification(toast);
    }, duration);
    
    return currentId;
};

/**
 * Dismiss a notification
 * @param {HTMLElement} toast - The toast element to dismiss
 */
const dismissNotification = (toast) => {
    if (!toast || !toast.parentNode) return;
    
    console.log(`🎯 Dismissing notification:`, toast.id);
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    
    setTimeout(() => {
        if (toast.parentNode) {
            document.body.removeChild(toast);
        }
    }, 300);
};

/**
 * Convenience methods for different notification types
 */
export const notification = {
    success: (message, duration) => showNotification(message, 'success', duration),
    error: (message, duration) => showNotification(message, 'error', duration),
    warning: (message, duration) => showNotification(message, 'warning', duration),
    info: (message, duration) => showNotification(message, 'info', duration),
    
    // Ant Design compatible API
    open: ({ type, content, duration }) => showNotification(content, type, duration)
};

export default notification;
