import React from 'react';
import CopilotApp from './CopilotApp';
import ComponentHandleStream from './proof-of-concept/ComponentHandleStream';
import StorageDemo from './proof-of-concept/StorageDemo';
import ScreenCaptureTest from './proof-of-concept/ScreenCaptureTest';
import ChatListTroubleshooting from './proof-of-concept/ChatListTroubleshooting';
import { logEnvironment } from './utils/environment';

const App = () => {
  logEnvironment();
  
  return <ChatListTroubleshooting />;
};

export default App;