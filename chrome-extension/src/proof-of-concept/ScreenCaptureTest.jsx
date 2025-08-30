import React, { useState } from 'react';
import { Button, message } from 'antd';
import { CameraOutlined } from '@ant-design/icons';
import ScreenCapture from '../components/ScreenCapture';
import './ScreenCaptureTest.css';

const ScreenCaptureTest = () => {
    const [isScreenshotMode, setIsScreenshotMode] = useState(false);
    const [screenshotData, setScreenshotData] = useState(null);

    const handleScreenshotCapture = () => {
        setIsScreenshotMode(true);
    };

    const handleScreenshotComplete = (capturedData) => {
        setScreenshotData(capturedData);
        setIsScreenshotMode(false);
        message.success('Screenshot captured successfully!');
    };

    const handleScreenshotCancel = () => {
        setIsScreenshotMode(false);
        message.info('Screenshot cancelled');
    };

    const clearScreenshot = () => {
        setScreenshotData(null);
    };

    return (
        <div className="screen-capture-test">
            {/* Fixed position screenshot button */}
            <div className="screenshot-button-container">
                <Button
                    type="primary"
                    icon={<CameraOutlined />}
                    onClick={handleScreenshotCapture}
                    disabled={isScreenshotMode}
                    className="screenshot-button"
                >
                    Take Screenshot
                </Button>
            </div>

            {/* Screenshot mode overlay */}
            <ScreenCapture
                isActive={isScreenshotMode}
                onCapture={handleScreenshotComplete}
                onCancel={handleScreenshotCancel}
            />
            {/* Long content for testing */}
            <div className="test-content">
                <h1>Screenshot Test Page</h1>
                <p>This is a test page to demonstrate the screenshot functionality.</p>

                <section className="content-section">
                    <h2>Section 1: Introduction</h2>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                </section>

                <section className="content-section">
                    <h2>Section 2: Features</h2>
                    <p>The screenshot feature allows users to:</p>
                    <ul>
                        <li>Click the screenshot button to enter capture mode</li>
                        <li>Drag to select any area on the page</li>
                        <li>Capture the selected area as an image</li>
                        <li>Use the captured image as an attachment</li>
                    </ul>
                </section>

                <section className="content-section">
                    <h2>Section 3: Technical Details</h2>
                    <p>This implementation uses:</p>
                    <ul>
                        <li>html2canvas for page capture</li>
                        <li>Canvas API for image cropping</li>
                        <li>React hooks for state management</li>
                        <li>CSS for overlay styling</li>
                    </ul>
                </section>

                <section className="content-section">
                    <h2>Section 4: Usage Instructions</h2>
                    <p>To take a screenshot:</p>
                    <ol>
                        <li>Click the "Take Screenshot" button</li>
                        <li>Drag your mouse to select the area you want to capture</li>
                        <li>Release the mouse button to capture</li>
                        <li>Press ESC to cancel at any time</li>
                    </ol>
                </section>

                <section className="content-section">
                    <h2>Section 5: More Content</h2>
                    <p>This section contains additional content to make the page longer and test scrolling behavior during screenshot capture.</p>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                </section>

                <section className="content-section">
                    <h2>Section 6: Even More Content</h2>
                    <p>Adding more content to ensure the page is long enough to test scrolling behavior.</p>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                </section>

                <section className="content-section">
                    <h2>Section 7: Final Section</h2>
                    <p>This is the final section of the test page. The page should be long enough to demonstrate scrolling behavior and screenshot capture functionality.</p>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                </section>
            </div>

            {/* Display captured screenshot */}
            {screenshotData && (
                <div className="screenshot-preview">
                    <h3>Captured Screenshot:</h3>
                    <img
                        src={screenshotData.data}
                        alt="Captured screenshot"
                        style={{ maxWidth: '100%', border: '1px solid #ddd' }}
                    />
                    <div className="screenshot-actions">
                        <Button onClick={clearScreenshot}>Clear Screenshot</Button>
                        <Button
                            type="primary"
                            onClick={() => {
                                const link = document.createElement('a');
                                link.href = screenshotData.data;
                                link.download = screenshotData.name;
                                link.click();
                            }}
                        >
                            Download
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScreenCaptureTest;
