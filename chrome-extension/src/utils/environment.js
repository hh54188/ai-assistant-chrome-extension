// Environment detection and configuration utility

/**
 * Check if we're running in Chrome extension environment
 */
export const isChromeExtension = () => {
  return typeof chrome !== 'undefined' && 
         !!chrome.storage && 
         !!chrome.runtime && 
         !!chrome.runtime.id;
};

/**
 * Check if we're in development mode
 */
export const isDevelopment = () => {
  return import.meta.env?.MODE === 'development';
};

/**
 * Check if we're in production mode
 */
export const isProduction = () => {
  return import.meta.env?.MODE === 'production';
};

/**
 * Get the current environment mode
 */
export const getEnvironment = () => {
  return import.meta.env?.MODE || 'development';
};

/**
 * Get environment-specific configuration
 */
export const getConfig = () => {
  const env = getEnvironment();
  console.log(import.meta.env);
  
  return {
    // App configuration
    appName: import.meta.env.VITE_APP_NAME || 'Him',
    appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
    
    // API configuration
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    defaultModel: import.meta.env.VITE_DEFAULT_MODEL || 'gemini-2.5-flash',
    
    // Development settings
    debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
    
    // Environment flags
    isDev: isDevelopment(),
    isProd: isProduction(),
    isExtension: isChromeExtension(),
    
    // Storage configuration
    storagePrefix: isDevelopment() && !isChromeExtension() ? 'dev_' : '',
  };
};

/**
 * Log environment information (useful for debugging)
 */
export const logEnvironment = () => {
  const config = getConfig();
  
  console.log('🌍 Environment Configuration:', {
    mode: getEnvironment(),
    isDevelopment: config.isDev,
    isProduction: config.isProd,
    isChromeExtension: config.isExtension,
    appName: config.appName,
    apiBaseUrl: config.apiBaseUrl,
    storagePrefix: config.storagePrefix,
    debugMode: config.debugMode,
  });
};

export default {
  isChromeExtension,
  isDevelopment,
  isProduction,
  getEnvironment,
  getConfig,
  logEnvironment,
}; 