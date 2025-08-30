import { useState, useEffect } from 'react';
import { isChromeExtension, isDevelopment, getConfig } from '../utils/environment';

// Storage types
const STORAGE_TYPES = {
    LOCAL: 'local',      // Data persists until extension is uninstalled
    SYNC: 'sync',        // Data syncs across user's devices (limited to 100KB)
    SESSION: 'session'   // Data persists until browser session ends
};

// Get storage key with prefix for development
const getStorageKey = (key, storageType) => {
    const config = getConfig();
    if (config.isDev && !config.isExtension) {
        return `${config.storagePrefix}${storageType}_${key}`;
    }
    return key;
};

// LocalStorage wrapper for development
const localStorageWrapper = {
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : undefined;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return undefined;
        }
    },
    
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error writing to localStorage:', error);
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    },
    
    clear: () => {
        try {
            // Only clear keys that start with our prefix
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('dev_')) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }
};

const useChromeStorage = (key, defaultValue, storageType = STORAGE_TYPES.LOCAL) => {
    const [value, setValue] = useState(defaultValue);
    const [loading, setLoading] = useState(true);

    // Get value from storage
    const getValue = async () => {
        try {
            if (isChromeExtension()) {
                // Chrome extension mode
                const result = await chrome.storage[storageType].get([key]);
                return result[key] !== undefined ? result[key] : defaultValue;
            } else {
                // Development mode - use localStorage
                const storageKey = getStorageKey(key, storageType);
                const storedValue = localStorageWrapper.get(storageKey);
                return storedValue !== undefined ? storedValue : defaultValue;
            }
        } catch (error) {
            console.error('Error reading from storage:', error);
            return defaultValue;
        }
    };

    // Set value in storage
    const setStorageValue = async (newValue) => {
        try {
            if (isChromeExtension()) {
                // Chrome extension mode
                await chrome.storage[storageType].set({ [key]: newValue });
            } else {
                // Development mode - use localStorage
                const storageKey = getStorageKey(key, storageType);
                localStorageWrapper.set(storageKey, newValue);
            }
            setValue(newValue);
        } catch (error) {
            console.error('Error writing to storage:', error);
        }
    };

    // Initialize value from storage
    useEffect(() => {
        const initValue = async () => {
            const storedValue = await getValue();
            setValue(storedValue);
            setLoading(false);
        };
        initValue();
    }, [key, storageType]);

    // Listen for storage changes
    useEffect(() => {
        if (isChromeExtension()) {
            // Chrome extension mode - listen to chrome.storage changes
            const handleStorageChange = (changes, areaName) => {
                if (areaName === storageType && changes[key]) {
                    setValue(changes[key].newValue);
                }
            };

            chrome.storage.onChanged.addListener(handleStorageChange);
            return () => chrome.storage.onChanged.removeListener(handleStorageChange);
        } else {
            // Development mode - listen to localStorage changes
            const handleStorageChange = (e) => {
                if (e.key === getStorageKey(key, storageType)) {
                    const newValue = e.newValue ? JSON.parse(e.newValue) : undefined;
                    setValue(newValue !== undefined ? newValue : defaultValue);
                }
            };

            window.addEventListener('storage', handleStorageChange);
            return () => window.removeEventListener('storage', handleStorageChange);
        }
    }, [key, storageType, defaultValue]);

    return [value, setStorageValue, loading];
};

// Utility functions for bulk operations
export const chromeStorage = {
    // Get multiple values
    getMultiple: async (keys, storageType = STORAGE_TYPES.LOCAL) => {
        try {
            if (isChromeExtension()) {
                // Chrome extension mode
                return await chrome.storage[storageType].get(keys);
            } else {
                // Development mode - use localStorage
                const result = {};
                keys.forEach(key => {
                    const storageKey = getStorageKey(key, storageType);
                    const value = localStorageWrapper.get(storageKey);
                    if (value !== undefined) {
                        result[key] = value;
                    }
                });
                return result;
            }
        } catch (error) {
            console.error('Error reading multiple values from storage:', error);
            return {};
        }
    },

    // Set multiple values
    setMultiple: async (data, storageType = STORAGE_TYPES.LOCAL) => {
        try {
            if (isChromeExtension()) {
                // Chrome extension mode
                await chrome.storage[storageType].set(data);
            } else {
                // Development mode - use localStorage
                Object.entries(data).forEach(([key, value]) => {
                    const storageKey = getStorageKey(key, storageType);
                    localStorageWrapper.set(storageKey, value);
                });
            }
        } catch (error) {
            console.error('Error writing multiple values to storage:', error);
        }
    },

    // Remove specific keys
    remove: async (keys, storageType = STORAGE_TYPES.LOCAL) => {
        try {
            if (isChromeExtension()) {
                // Chrome extension mode
                await chrome.storage[storageType].remove(keys);
            } else {
                // Development mode - use localStorage
                keys.forEach(key => {
                    const storageKey = getStorageKey(key, storageType);
                    localStorageWrapper.remove(storageKey);
                });
            }
        } catch (error) {
            console.error('Error removing values from storage:', error);
        }
    },

    // Clear all data
    clear: async (storageType = STORAGE_TYPES.LOCAL) => {
        try {
            if (isChromeExtension()) {
                // Chrome extension mode
                await chrome.storage[storageType].clear();
            } else {
                // Development mode - use localStorage
                localStorageWrapper.clear();
            }
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
    }
};

export { STORAGE_TYPES };
export default useChromeStorage; 