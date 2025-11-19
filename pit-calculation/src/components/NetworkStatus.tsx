import React, { useEffect, useState } from 'react';
import { API_BASE_URL, LOCAL_NETWORK_IP } from '../networkConfig';

export const NetworkStatus: React.FC = () => {
    const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

    useEffect(() => {
        const checkServer = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/materials`);
                if (response.ok) {
                    setServerStatus('online');
                } else {
                    setServerStatus('offline');
                }
            } catch (error) {
                setServerStatus('offline');
            }
        };

        checkServer();
        const interval = setInterval(checkServer, 30000);
        
        return () => clearInterval(interval);
    }, []);

    const statusColors = {
        checking: 'orange',
        online: 'green',
        offline: 'red'
    };

    const statusText = {
        checking: '⏳ Проверка...',
        online: 'Онлайн',
        offline: 'Оффлайн'
    };

    return (
        <div style={{
            position: 'fixed',
            top: 10,
            right: 10,
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '14px',
            backgroundColor: statusColors[serverStatus],
            color: 'white',
            zIndex: 1000,
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}>
            <div>Сервер: {statusText[serverStatus]}</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>IP: {LOCAL_NETWORK_IP}</div>
        </div>
    );
};