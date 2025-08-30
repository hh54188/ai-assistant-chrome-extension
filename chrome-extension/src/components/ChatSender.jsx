import {
    AppstoreAddOutlined,
    CloudUploadOutlined,
    OpenAIFilled,
    PaperClipOutlined,
    ProductOutlined,
    ScheduleOutlined,
    EditOutlined,
    RestOutlined
} from '@ant-design/icons';
import {
    Attachments,
    Sender,
    Suggestion,
} from '@ant-design/x';
import { Button, Spin } from 'antd';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useUIStore, useChatStore } from '../stores';

const MOCK_SUGGESTIONS = [
    { label: 'Write a report', value: 'report' },
    { label: 'Draw a picture', value: 'draw' },
    {
        label: 'Check some knowledge',
        value: 'knowledge',
        icon: <OpenAIFilled />,
        children: [
            { label: 'About React', value: 'react' },
            { label: 'About Ant Design', value: 'antd' },
        ],
    },
];

const ChatSender = ({
    styles,
    handleUserSubmit,
    allowAttachments = false,
    disabled = false,
}) => {
    // Get state and actions from Zustand stores
    const {
        inputValue,
        setInputValue,
        loading,
        setLoading,
        screenshotData,
        clearScreenshotData,
        attachmentsOpen,
        setAttachmentsOpen
    } = useUIStore();
    
    const {
        currentSessionId,
        getSessionAbortController,
        setSessionFiles
    } = useChatStore();
    
    // Get abort controller for current session
    const abortController = { current: getSessionAbortController(currentSessionId) };
    const attachmentsRef = useRef(null);
    const [files, setFiles] = useState([]);
    const [prevLoading, setPrevLoading] = useState(false);

    // Handle files change
    const handleFilesChange = useCallback((files) => {
        setSessionFiles(currentSessionId, files);
    }, [currentSessionId, setSessionFiles]);

    // Clear attachments when AI response is complete
    useEffect(() => {
        // If loading changed from true to false, clear attachments
        if (prevLoading && !loading) {
            setFiles([]);
            setAttachmentsOpen(false);
            handleFilesChange([]);
            // Clear screenshot data after submission
            if (screenshotData) {
                clearScreenshotData();
            }
        }
        setPrevLoading(loading);
    }, [loading, prevLoading, screenshotData, clearScreenshotData, handleFilesChange]);

    // Handle screenshot data
    useEffect(() => {
        if (screenshotData) {
            // Convert screenshot data to Ant Design Upload format
            const screenshotFile = {
                uid: `screenshot-${Date.now()}`,
                name: screenshotData.name,
                status: 'done',
                url: screenshotData.data,
                type: screenshotData.mimeType,
                thumbUrl: screenshotData.data,
                originFileObj: null,
                // Add custom properties for our use
                isScreenshot: true,
                screenshotData: screenshotData
            };
            
            setFiles([screenshotFile]);
            // Also automatically open the attachments panel to show the screenshot
            setAttachmentsOpen(true);
        }
    }, [screenshotData]);

    // Notify store when files change
    useEffect(() => {
        if (files.length > 0) {
            // Convert files to the format expected by store
            const convertedFiles = files.map(file => {
                if (file.isScreenshot && file.screenshotData) {
                    return file.screenshotData;
                }
                // For regular files, they should already be in the correct format
                return file;
            });
            handleFilesChange(convertedFiles);
        } else {
            handleFilesChange([]);
        }
    }, [files, handleFilesChange]);

    // Clear local files when attachments panel is closed (e.g., when switching sessions)
    useEffect(() => {
        if (!attachmentsOpen) {
            setFiles([]);
        }
    }, [attachmentsOpen]);

    // Convert file to base64
    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // const base64String = reader.result.split(',')[1]; // Remove data:image/jpeg;base64, prefix
                const base64String = reader.result;
                resolve({
                    type: 'inline',
                    data: base64String,
                    mimeType: file.type,
                    name: file.name
                });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const onPasteFile = async (_, files) => {
        // Prevent file upload during loading
        if (loading) return;
        
        for (const file of files) {
            attachmentsRef.current?.upload(file);
        }
        setAttachmentsOpen(true);
    };

    const sendHeader = (
        <Sender.Header
            title="Upload File"
            styles={{ content: { padding: 0 } }}
            open={attachmentsOpen}
            onOpenChange={setAttachmentsOpen}
            forceRender
        >
            <Attachments
                disabled={loading}
                ref={attachmentsRef}
                beforeUpload={(file) => {
                    // Prevent upload during loading
                    if (loading) {
                        return false;
                    }
                    // Only allow image files
                    const isImage = file.type.startsWith('image/');
                    if (!isImage) {
                        return false;
                    }
                    // Only allow one file
                    if (files.length >= 1) {
                        return false;
                    }
                    return false; // Let onChange handle the upload
                }}
                items={files}
                onChange={async ({ fileList }) => {
                    // Only keep the first image file
                    const imageFiles = fileList.filter(file => file.type.startsWith('image/'));
                    setFiles(imageFiles.slice(0, 1));
                    
                    // Convert to base64 and notify store
                    if (imageFiles.length > 0) {
                        try {
                            const file = imageFiles[0];
                            let base64File;
                            
                            // Check if this is a screenshot file
                            if (file.isScreenshot && file.screenshotData) {
                                // Use the original screenshot data
                                base64File = file.screenshotData;
                            } else {
                                // Convert regular file to base64
                                base64File = await convertFileToBase64(file.originFileObj || file);
                            }
                            
                            handleFilesChange([base64File]);
                        } catch (error) {
                            console.error('Error converting file to base64:', error);
                            handleFilesChange([]);
                        }
                    } else {
                        handleFilesChange([]);
                    }
                }}
                placeholder={(type) =>
                    type === 'drop'
                        ? { title: 'Drop image here' }
                        : {
                            icon: <CloudUploadOutlined />,
                            title: 'Upload image',
                            description: 'Click or drag an image file to upload (max 1 image)',
                        }
                }
            />
        </Sender.Header>
    );

    const AttachmentsButton = () => {
        return (
            <Button
                icon={<PaperClipOutlined style={{ fontSize: 18 }} />}
                onClick={() => setAttachmentsOpen(!attachmentsOpen)}
            />
        );
    };

    return (
        <div className={styles.chatSend}>
            {/* <div className={styles.sendAction}>
                <Button
                    icon={<EditOutlined />}
                    onClick={() => handleRewrite()}
                >
                    Rewrite
                </Button>
                <Button
                    icon={<RestOutlined />}
                    onClick={() => handleUserSubmit('What component assets are available in Ant Design X?')}
                >
                    Summarize
                </Button>
                <Button icon={<AppstoreAddOutlined />}>More</Button>
            </div> */}

            <Suggestion items={MOCK_SUGGESTIONS} onSelect={(itemVal) => setInputValue(`[${itemVal}]:`)}>
                {({ onTrigger, onKeyDown }) => (
                    <Sender
                        loading={loading}
                        value={inputValue}
                        onChange={(v) => {
                            onTrigger(v === '/');
                            setInputValue(v);
                        }}
                        onSubmit={() => {
                            handleUserSubmit(inputValue);
                        }}
                        onCancel={() => {
                            if (abortController?.current) {
                                abortController.current.abort();
                            }
                            setLoading(false);
                        }}
                        allowSpeech
                        placeholder={disabled ? "Select a model to continue..." : "Ask or input / use skills"}
                        onKeyDown={onKeyDown}
                        header={sendHeader}
                        disabled={disabled}
                        prefix={
                            allowAttachments ?
                            <Button
                                type="text"
                                icon={<PaperClipOutlined style={{ fontSize: 18 }} />}
                                onClick={() => setAttachmentsOpen(!attachmentsOpen)}
                                disabled={loading || disabled}
                                style={{ opacity: (loading || disabled) ? 0.5 : 1 }}
                            />
                            : null
                        }
                        onPasteFile={allowAttachments ? onPasteFile : null}
                        actions={(_, info) => {
                            const { SendButton, LoadingButton, SpeechButton } = info.components;
                            return (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    {/* <SpeechButton className={styles.speechButton} /> */}
                                    {loading ? <LoadingButton type="default" /> : <SendButton type="primary" disabled={disabled} />}
                                </div>
                            );
                        }}
                    />
                )}
            </Suggestion>
        </div>
    );
};

export default ChatSender; 