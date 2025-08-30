import React, { useState, useEffect, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import './ScreenCapture.css';

const ScreenCapture = ({ 
    isActive, 
    onCapture, 
    onCancel,
    children 
}) => {
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
    const overlayRef = useRef(null);

    // Prevent scrolling when screenshot mode is active
    useEffect(() => {
        if (isActive) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isActive]);

    const handleMouseDown = useCallback((e) => {
        if (!isActive) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const rect = overlayRef.current?.getBoundingClientRect();
        if (rect) {
            setStartPos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
            setCurrentPos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
            setIsMouseDown(true);
        }
    }, [isActive]);

    const handleMouseMove = useCallback((e) => {
        if (!isActive || !isMouseDown) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const rect = overlayRef.current?.getBoundingClientRect();
        if (rect) {
            setCurrentPos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    }, [isActive, isMouseDown]);

    const handleMouseUp = useCallback(async (e) => {
        if (!isActive || !isMouseDown) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        setIsMouseDown(false);
        
        // Calculate selection area
        const left = Math.min(startPos.x, currentPos.x);
        const top = Math.min(startPos.y, currentPos.y);
        const width = Math.abs(currentPos.x - startPos.x);
        const height = Math.abs(currentPos.y - startPos.y);
        
        // Only capture if there's a meaningful selection
        if (width > 10 && height > 10) {
            try {
                await captureScreenshot(left, top, width, height);
            } catch (error) {
                console.error('Screenshot capture failed:', error);
            }
        }
    }, [isActive, isMouseDown, startPos, currentPos]);

    const captureScreenshot = async (left, top, width, height) => {
        try {
            // Capture the entire page, not just the sidebar
            const canvas = await html2canvas(document.documentElement, {
                useCORS: true,
                allowTaint: true,
                scrollX: window.scrollX,
                scrollY: window.scrollY,
                width: document.documentElement.scrollWidth,
                height: document.documentElement.scrollHeight,
                scale: 1,
                backgroundColor: null
            });

            // Create a new canvas for the cropped area
            const croppedCanvas = document.createElement('canvas');
            const ctx = croppedCanvas.getContext('2d');
            
            croppedCanvas.width = width;
            croppedCanvas.height = height;

            // Calculate the source coordinates considering scroll position
            const sourceX = left + window.scrollX;
            const sourceY = top + window.scrollY;

            // Draw the cropped area
            ctx.drawImage(
                canvas, 
                sourceX, sourceY, width, height, 
                0, 0, width, height
            );

            // Convert to base64
            const base64Data = croppedCanvas.toDataURL('image/png');
            
            // Call the onCapture callback with the image data
            onCapture({
                type: 'inline',
                data: base64Data,
                mimeType: 'image/png',
                name: `screenshot-${Date.now()}.png`
            });
        } catch (error) {
            console.error('Error capturing screenshot:', error);
        }
    };

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape' && isActive) {
            onCancel();
        }
    }, [isActive, onCancel]);

    useEffect(() => {
        if (isActive) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isActive, handleKeyDown]);

    if (!isActive) {
        return children;
    }

    // Calculate selection rectangle
    const left = Math.min(startPos.x, currentPos.x);
    const top = Math.min(startPos.y, currentPos.y);
    const width = Math.abs(currentPos.x - startPos.x);
    const height = Math.abs(currentPos.y - startPos.y);

    return (
        <div className="screen-capture-overlay">
            <div
                ref={overlayRef}
                className={`screen-capture-overlay ${isMouseDown ? 'selecting' : ''}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            >
                {/* Selection rectangle */}
                {isMouseDown && width > 0 && height > 0 && (
                    <div
                        className="selection-rectangle"
                        style={{
                            left: `${left}px`,
                            top: `${top}px`,
                            width: `${width}px`,
                            height: `${height}px`
                        }}
                    />
                )}
                
                {/* Instructions */}
                <div className="capture-instructions">
                    <p>Drag to select area • Press ESC to cancel</p>
                </div>
            </div>
        </div>
    );
};

export default ScreenCapture;
