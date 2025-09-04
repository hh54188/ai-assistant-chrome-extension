import {
    SettingOutlined,
    HistoryOutlined,
    FolderOutlined,
    InboxOutlined,
    ExportOutlined,
    ImportOutlined,
    DeleteOutlined,
    InfoCircleOutlined,
    KeyOutlined,
    UserOutlined,
    BookOutlined,
    ToolOutlined,
    CheckOutlined,
    CommentOutlined,
    ArrowRightOutlined,
    ExpandAltOutlined,
    ExpandOutlined,
    CompressOutlined,
    LoadingOutlined,
    CameraOutlined
} from '@ant-design/icons';
import { Conversations } from '@ant-design/x';
import { Button, Tooltip, Popover } from 'antd';
import React from 'react';
import { useMenuBarStyle } from './MenuBar.styles';

const MenuBar = ({ 
    onOpenSettings,
    sessionList,
    curSession,
    handleSessionChange,
    handleImportSelection,
    isExpanded,
    onToggleExpand,
    onScreenshotCapture,
    isDirectApiMode = false,
    connectionStatus = false
}) => {
    const { styles } = useMenuBarStyle();

    return (
        <div className={styles.menuBar}>
            <div className={styles.menuBarTop}>
                <Popover
                    placement="right"
                    styles={{ body: { padding: 0, maxHeight: 600 } }}
                    getPopupContainer={(triggerNode) => triggerNode.parentNode}
                    content={
                        <Conversations
                            items={sessionList?.map((i) => {
                                const isActive = i.key === curSession;
                                const isLoading = i.loading || false;
                                
                                let label = i.label;
                                if (isActive) {
                                    label = <><CheckOutlined style={{ marginRight: 4 }} />{i.label}</>;
                                } else if (isLoading) {
                                    label = <><LoadingOutlined style={{ marginRight: 4, color: '#1890ff' }} />{i.label} <span style={{ fontSize: '10px', color: '#1890ff' }}>(streaming)</span></>;
                                }
                                
                                return { ...i, label };
                            })}
                            activeKey={curSession}
                            groupable
                            onActiveChange={handleSessionChange}
                            styles={{ item: { padding: '0 8px' } }}
                            className={styles.conversations}
                        />
                    }
                >
                    <Button type="text" icon={<CommentOutlined />} className={styles.headerButton} />
                </Popover> 
                <Tooltip 
                    getPopupContainer={(triggerNode) => triggerNode.parentNode} 
                    title="Reference"
                    placement="right"
                >
                    <Button
                        type="text"
                        icon={<ArrowRightOutlined />}
                        className={styles.menuButton}
                        onClick={handleImportSelection}
                    />
                </Tooltip>
                <Tooltip 
                    getPopupContainer={(triggerNode) => triggerNode.parentNode} 
                    title="Take Screenshot"
                    placement="right"
                >
                    <Button
                        type="text"
                        icon={<CameraOutlined />}
                        className={styles.menuButton}
                        onClick={onScreenshotCapture}
                        disabled={isDirectApiMode || !connectionStatus}
                    />
                </Tooltip>
                {/* <Tooltip title="User Profile">
                    <Button
                        type="text"
                        icon={<UserOutlined />}
                        className={styles.menuButton}
                    />
                </Tooltip> */}
            </div>
            
            <div className={styles.menuBarBottom}>
                {/* <Tooltip title="Export Conversations">
                    <Button
                        type="text"
                        icon={<ExportOutlined />}
                        onClick={handleExport}
                        className={styles.menuButton}
                    />
                </Tooltip>
                <Tooltip title="Import Conversations">
                    <Button
                        type="text"
                        icon={<ImportOutlined />}
                        onClick={handleImport}
                        className={styles.menuButton}
                    />
                </Tooltip>
                <Tooltip title="Conversation History">
                    <Button
                        type="text"
                        icon={<HistoryOutlined />}
                        className={styles.menuButton}
                    />
                </Tooltip>
                <Tooltip title="Tools & Extensions">
                    <Button
                        type="text"
                        icon={<ToolOutlined />}
                        className={styles.menuButton}
                    />
                </Tooltip>
                <Tooltip title="Documentation">
                    <Button
                        type="text"
                        icon={<BookOutlined />}
                        onClick={onOpenHelp}
                        className={styles.menuButton}
                    />
                </Tooltip> */}
                <Tooltip 
                    getPopupContainer={(triggerNode) => triggerNode.parentNode} 
                    title={isExpanded ? "Collapse" : "Expand"}
                    placement="right"
                >
                    <Button
                        type="text"
                        icon={isExpanded ? <CompressOutlined /> : <ExpandOutlined />}
                        onClick={onToggleExpand}
                        className={styles.menuButton}
                    />
                </Tooltip>
                <Tooltip 
                    getPopupContainer={(triggerNode) => triggerNode.parentNode} 
                    title={`Settings${isDirectApiMode ? ' (Direct API Mode Enabled)' : ''}`}
                    placement="right"
                >
                    <Button
                        type="text"
                        icon={
                            <div style={{ position: 'relative' }}>
                                <SettingOutlined />
                                {isDirectApiMode && (
                                    <div style={{
                                        position: 'absolute',
                                        top: -2,
                                        right: -2,
                                        width: 8,
                                        height: 8,
                                        backgroundColor: '#52c41a',
                                        borderRadius: '50%',
                                        border: '1px solid white'
                                    }} />
                                )}
                            </div>
                        }
                        onClick={onOpenSettings}
                        className={styles.menuButton}
                    />
                </Tooltip>
            </div>
        </div>
    );
};

export default MenuBar; 