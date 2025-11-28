import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import { HomePage } from './pages/HomePages/HomePage'
import MaterialsPage from './pages/MaterialsPage/MaterialsPage'
import MaterialDetailPage from './pages/MaterialDetailPage/MaterialDetailPage'
import 'bootstrap/dist/css/bootstrap.min.css'
import { isTauri, API_BASE_URL } from './networkConfig';

function App() {
  useEffect(() => {
    const checkTauri = async () => {
      if (isTauri) {
        console.log('Tauri environment detected');
      } else {
        console.log('Browser environment');
      }

      try {
        console.log('Testing backend connection...');
        
        // Всегда используем полный URL
        const testUrl = `${API_BASE_URL}/materials`;
        console.log('Testing URL:', testUrl);
        
        const response = await fetch(testUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Backend connection successful! Materials count:', data.length);
      } catch (error) {
        console.log('Backend connection failed:', error);
        console.log('Using mock data instead');
      }
    };

    checkTauri();
  }, []);

  return (
    <Provider store={store}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/materials" element={<MaterialsPage />} />
          <Route path="/materials/:id" element={<MaterialDetailPage />} />
          <Route path="*" element={<div>Страница не найдена</div>} />
        </Routes>
      </HashRouter>
    </Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)