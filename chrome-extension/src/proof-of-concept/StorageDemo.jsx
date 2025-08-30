import React from 'react';
import { Button, Input, Select, Switch, Card, Space, Typography, message } from 'antd';
import useChromeStorage, { chromeStorage, STORAGE_TYPES } from '../hooks/useChromeStorage';

const { Title, Text } = Typography;

const StorageDemo = () => {
  // Test different storage types
  const [localValue, setLocalValue] = useChromeStorage('demoLocal', 'local storage value', STORAGE_TYPES.LOCAL);
  const [syncValue, setSyncValue] = useChromeStorage('demoSync', 'sync storage value', STORAGE_TYPES.SYNC);
  const [sessionValue, setSessionValue] = useChromeStorage('demoSession', 'session storage value', STORAGE_TYPES.SESSION);
  const [theme, setTheme] = useChromeStorage('theme', 'light', STORAGE_TYPES.SYNC);
  const [autoSave, setAutoSave] = useChromeStorage('autoSave', true, STORAGE_TYPES.LOCAL);

  const handleBulkSave = async () => {
    const data = {
      userPreferences: {
        theme: 'dark',
        fontSize: 16,
        language: 'en'
      },
      recentSearches: ['AI', 'Chrome Extension', 'React'],
      lastUsed: new Date().toISOString()
    };
    
    await chromeStorage.setMultiple(data, STORAGE_TYPES.LOCAL);
    message.success('Bulk data saved successfully!');
  };

  const handleBulkLoad = async () => {
    const keys = ['userPreferences', 'recentSearches', 'lastUsed'];
    const data = await chromeStorage.getMultiple(keys, STORAGE_TYPES.LOCAL);
    console.log('Loaded bulk data:', data);
    message.info('Bulk data loaded! Check console for details.');
  };

  const handleClearAll = async () => {
    await chromeStorage.clear(STORAGE_TYPES.LOCAL);
    message.success('All local storage cleared!');
  };

  return (
    <div style={{ padding: 20, maxWidth: 800 }}>
      <Title level={2}>Storage Demo</Title>
      <Text type="secondary">
        This demo shows how storage works in both development and extension modes.
        {typeof chrome !== 'undefined' && chrome.storage ? 
          ' Currently running in Chrome Extension mode.' : 
          ' Currently running in Development mode (using localStorage).'
        }
      </Text>

      <Space direction="vertical" size="large" style={{ width: '100%', marginTop: 20 }}>
        
        {/* Local Storage Demo */}
        <Card title="Local Storage (Persists until extension uninstalled)" size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input 
              placeholder="Enter local storage value"
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
            />
            <Text>Current value: {localValue}</Text>
          </Space>
        </Card>

        {/* Sync Storage Demo */}
        <Card title="Sync Storage (Syncs across devices)" size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input 
              placeholder="Enter sync storage value"
              value={syncValue}
              onChange={(e) => setSyncValue(e.target.value)}
            />
            <Text>Current value: {syncValue}</Text>
          </Space>
        </Card>

        {/* Session Storage Demo */}
        <Card title="Session Storage (Persists until browser session ends)" size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input 
              placeholder="Enter session storage value"
              value={sessionValue}
              onChange={(e) => setSessionValue(e.target.value)}
            />
            <Text>Current value: {sessionValue}</Text>
          </Space>
        </Card>

        {/* User Preferences Demo */}
        <Card title="User Preferences" size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Select 
              value={theme} 
              onChange={setTheme}
              style={{ width: 120 }}
            >
              <Select.Option value="light">Light Theme</Select.Option>
              <Select.Option value="dark">Dark Theme</Select.Option>
            </Select>
            
            <div>
              <Switch checked={autoSave} onChange={setAutoSave} />
              <Text style={{ marginLeft: 8 }}>Auto Save</Text>
            </div>
            
            <Text>Current theme: {theme}</Text>
            <Text>Auto save: {autoSave ? 'Enabled' : 'Disabled'}</Text>
          </Space>
        </Card>

        {/* Bulk Operations Demo */}
        <Card title="Bulk Operations" size="small">
          <Space>
            <Button onClick={handleBulkSave} type="primary">
              Save Bulk Data
            </Button>
            <Button onClick={handleBulkLoad}>
              Load Bulk Data
            </Button>
            <Button onClick={handleClearAll} danger>
              Clear All Local Storage
            </Button>
          </Space>
        </Card>

        {/* Storage Info */}
        <Card title="Storage Information" size="small">
          <Space direction="vertical">
            <Text>Environment: {typeof chrome !== 'undefined' && chrome.storage ? 'Chrome Extension' : 'Development'}</Text>
            <Text>Storage Type: {typeof chrome !== 'undefined' && chrome.storage ? 'chrome.storage' : 'localStorage'}</Text>
            <Text>Storage Keys (Development):</Text>
            {typeof chrome === 'undefined' && (
              <div style={{ fontSize: '12px', fontFamily: 'monospace', background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
                {Object.keys(localStorage)
                  .filter(key => key.startsWith('dev_'))
                  .map(key => <div key={key}>{key}</div>)
                }
              </div>
            )}
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default StorageDemo; 