import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import CopilotSidebar from './CopilotSidebar';
import './index.css';

// Create a wrapper component for the sidebar
const SidebarApp = () => {
  const [isOpen] = React.useState(true);

  return (
    <ConfigProvider>
      <CopilotSidebar
        isOpen={isOpen}
      />
    </ConfigProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SidebarApp />
  </React.StrictMode>
); 