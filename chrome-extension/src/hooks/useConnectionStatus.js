import { useEffect, useState } from 'react';

const BACKEND_URL = 'http://localhost:3001';

const useConnectionStatus = () => {
    const [connectionStatus, setConnectionStatus] = useState(false);

    useEffect(() => {
        const testConnections = async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/health`);
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