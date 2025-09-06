import { useEffect, useState, useCallback } from 'react';
import { getBackendUrl } from '../services/chatService';

const useConnectionStatus = () => {
    const [connectionStatus, setConnectionStatus] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const testConnection = useCallback(async () => {
        setIsLoading(true);
        try {
            const backendUrl = await getBackendUrl();
            
            // Create timeout controller for better browser compatibility
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(`${backendUrl}/health`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                signal: controller.signal,
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                setConnectionStatus(true);
                return true;
            } else {
                setConnectionStatus(false);
                return false;
            }
        } catch (error) {
            console.error('Failed to test connection:', error);
            setConnectionStatus(false);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        testConnection();
    }, [testConnection]);

    const retryConnection = useCallback(async () => {
        return await testConnection();
    }, [testConnection]);

    return {
        connectionStatus,
        isLoading,
        retryConnection,
    };
};

export default useConnectionStatus; 