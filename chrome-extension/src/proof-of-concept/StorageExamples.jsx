import React from 'react';
import { Button, Input, Select, Switch, message } from 'antd';
import useChromeStorage, { chromeStorage, STORAGE_TYPES } from '../hooks/useChromeStorage';

// Example 1: User Preferences
const UserPreferences = () => {
  // Store user preferences (theme, language, etc.)
  const [theme, setTheme] = useChromeStorage('theme', 'light');
  const [language, setLanguage] = useChromeStorage('language', 'en');
  const [autoSave, setAutoSave] = useChromeStorage('autoSave', true);

  return (
    <div>
      <h3>User Preferences</h3>
      <Select value={theme} onChange={setTheme} style={{ width: 120, marginRight: 8 }}>
        <Select.Option value="light">Light</Select.Option>
        <Select.Option value="dark">Dark</Select.Option>
      </Select>
      
      <Select value={language} onChange={setLanguage} style={{ width: 120, marginRight: 8 }}>
        <Select.Option value="en">English</Select.Option>
        <Select.Option value="es">Spanish</Select.Option>
      </Select>
      
      <Switch checked={autoSave} onChange={setAutoSave} />
      <span style={{ marginLeft: 8 }}>Auto Save</span>
    </div>
  );
};

// Example 2: Chat History
const ChatHistory = () => {
  // Store chat sessions (using LOCAL storage for larger data)
  const [chatSessions, setChatSessions] = useChromeStorage('chatSessions', [], STORAGE_TYPES.LOCAL);
  const [currentSessionId, setCurrentSessionId] = useChromeStorage('currentSessionId', null);

  const saveChatMessage = async (message) => {
    const newSessions = [...chatSessions];
    const sessionIndex = newSessions.findIndex(s => s.id === currentSessionId);
    
    if (sessionIndex >= 0) {
      newSessions[sessionIndex].messages.push(message);
    } else {
      newSessions.push({
        id: currentSessionId,
        messages: [message],
        createdAt: new Date().toISOString()
      });
    }
    
    await setChatSessions(newSessions);
  };

  const clearAllChats = async () => {
    await chromeStorage.clear(STORAGE_TYPES.LOCAL);
    message.success('All chat history cleared');
  };

  return (
    <div>
      <h3>Chat History</h3>
      <p>Total sessions: {chatSessions.length}</p>
      <Button onClick={clearAllChats}>Clear All Chats</Button>
    </div>
  );
};

// Example 3: API Configuration
const APIConfig = () => {
  // Store API keys and settings (using SYNC for cross-device access)
  const [apiKey, setApiKey] = useChromeStorage('apiKey', '', STORAGE_TYPES.SYNC);
  const [apiEndpoint, setApiEndpoint] = useChromeStorage('apiEndpoint', 'https://api.example.com', STORAGE_TYPES.SYNC);
  const [modelPreference, setModelPreference] = useChromeStorage('modelPreference', 'gpt-4', STORAGE_TYPES.SYNC);

  return (
    <div>
      <h3>API Configuration</h3>
      <Input.Password 
        placeholder="API Key" 
        value={apiKey} 
        onChange={(e) => setApiKey(e.target.value)}
        style={{ marginBottom: 8 }}
      />
      <Input 
        placeholder="API Endpoint" 
        value={apiEndpoint} 
        onChange={(e) => setApiEndpoint(e.target.value)}
        style={{ marginBottom: 8 }}
      />
      <Select 
        value={modelPreference} 
        onChange={setModelPreference}
        style={{ width: '100%' }}
      >
        <Select.Option value="gpt-4">GPT-4</Select.Option>
        <Select.Option value="gpt-3.5-turbo">GPT-3.5 Turbo</Select.Option>
        <Select.Option value="claude">Claude</Select.Option>
      </Select>
    </div>
  );
};

// Example 4: Bulk Operations
const BulkOperations = () => {
  const handleBulkSave = async () => {
    const data = {
      userSettings: {
        theme: 'dark',
        fontSize: 14,
        notifications: true
      },
      recentSearches: ['AI', 'Chrome Extension', 'React'],
      lastUsed: new Date().toISOString()
    };
    
    await chromeStorage.setMultiple(data, STORAGE_TYPES.LOCAL);
    message.success('Settings saved in bulk');
  };

  const handleBulkLoad = async () => {
    const keys = ['userSettings', 'recentSearches', 'lastUsed'];
    const data = await chromeStorage.getMultiple(keys, STORAGE_TYPES.LOCAL);
    console.log('Loaded data:', data);
    message.info('Data loaded from storage');
  };

  return (
    <div>
      <h3>Bulk Operations</h3>
      <Button onClick={handleBulkSave} style={{ marginRight: 8 }}>
        Save All Settings
      </Button>
      <Button onClick={handleBulkLoad}>
        Load All Settings
      </Button>
    </div>
  );
};

// Main component combining all examples
const StorageExamples = () => {
  return (
    <div style={{ padding: 16 }}>
      <h2>Chrome Storage Examples</h2>
      <UserPreferences />
      <hr style={{ margin: '16px 0' }} />
      <ChatHistory />
      <hr style={{ margin: '16px 0' }} />
      <APIConfig />
      <hr style={{ margin: '16px 0' }} />
      <BulkOperations />
    </div>
  );
};

export default StorageExamples; 