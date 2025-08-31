import React from 'react';
import { createStyles } from 'antd-style';

const useDropZoneOverlayStyle = createStyles(({ css }) => {
    return {
        overlay: css`
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(24, 144, 255, 0.08);
            border: 3px dashed #1890ff;
            border-radius: 12px;
            z-index: 999;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            backdrop-filter: blur(1px);
            pointer-events: none;
        `,
        icon: css`
            font-size: 48px;
            margin-bottom: 16px;
            animation: bounce 1s infinite;
            
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% {
                    transform: translateY(0);
                }
                40% {
                    transform: translateY(-10px);
                }
                60% {
                    transform: translateY(-5px);
                }
            }
        `,
        title: css`
            font-size: 20px;
            color: #1890ff;
            font-weight: 600;
            text-align: center;
            margin-bottom: 8px;
        `,
        subtitle: css`
            font-size: 14px;
            color: #1890ff;
            opacity: 0.8;
            text-align: center;
        `
    };
});

const DropZoneOverlay = ({ isVisible }) => {
    const { styles } = useDropZoneOverlayStyle();
    
    if (!isVisible) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.icon}>
                📄
            </div>
            <div className={styles.title}>
                Drop text here to import
            </div>
            <div className={styles.subtitle}>
                Release to open Reference Modal
            </div>
        </div>
    );
};

export default DropZoneOverlay;
