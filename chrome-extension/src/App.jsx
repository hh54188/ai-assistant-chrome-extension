import React from 'react';
import CopilotApp from './CopilotApp';
import ComponentHandleStream from './proof-of-concept/ComponentHandleStream';
import StorageDemo from './proof-of-concept/StorageDemo';
import ScreenCaptureTest from './proof-of-concept/ScreenCaptureTest';
import { logEnvironment } from './utils/environment';

const App = () => {
  logEnvironment();
  
  return <CopilotApp />;
};

export default App;