export const isTauri = typeof window !== 'undefined' && 
  (window as any).__TAURI__ !== undefined;


  export const API_BASE_URL = isTauri 
  ? 'http://localhost:8080/api' 
  : '/api';

export const getApiUrl = (path: string) => {
  return `${API_BASE_URL}${path}`;
};

export const checkServerAvailability = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/materials`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.error('Server not available:', error);
    return false;
  }
};