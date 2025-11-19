// Tauri v2 detection
export const isTauri = typeof window !== 'undefined' && 
  (window as any).__TAURI__ !== undefined;

export const LOCAL_NETWORK_IP = '192.168.1.70';

export const API_BASE_URL = isTauri 
  ? `http://${LOCAL_NETWORK_IP}:8080/api`
  : '/api';

export const DEV_PROXY_URL = `http://${LOCAL_NETWORK_IP}:8080`;