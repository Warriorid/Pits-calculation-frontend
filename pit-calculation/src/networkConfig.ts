export const isTauri = typeof window !== 'undefined' && 
  (window as any).__TAURI__ !== undefined;

export const API_BASE_URL = isTauri 
  ? 'http://localhost:8080/api' 
  : '/api';

export const getApiUrl = (path: string) => {
  return `${API_BASE_URL}${path}`;
};