import { useEffect, useState } from 'react';
import { getBackendUrl } from '../services/chatService';

const useConnectionStatus = () => {
    const [connectionStatus, setConnectionStatus] = useState(false);

    useEffect(() => {
        const testConnections = async () => {
            try {
                const backendUrl = await getBackendUrl();
                const response = await fetch(`${backendUrl}/health`);
                if (response.ok) {
                    setConnectionStatus(true);
                }
            } catch (error) {
                console.error('Failed to test connections:', error);
                setConnectionStatus(false);
            }
        };

        testConnections();
    }, []);

    return connectionStatus;
};

export default useConnectionStatus; 