import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import { HomePage } from './pages/HomePages/HomePage'
import MaterialsPage from './pages/MaterialsPage/MaterialsPage'
import MaterialDetailPage from './pages/MaterialDetailPage/MaterialDetailPage'
import 'bootstrap/dist/css/bootstrap.min.css'
import { registerSW } from 'virtual:pwa-register'

import { isTauri } from './networkConfig';

function App() {
  useEffect(() => {
    const checkTauri = async () => {
      if (isTauri) {
        console.log('✅ Tauri environment detected');
        
        try {
          console.log('Tauri app is running');
          
          // Проверка подключения к бэкенду
          const API_BASE_URL = `http://192.168.1.70:8080/api`;
          console.log('🔗 Backend URL:', API_BASE_URL);
          
          const response = await fetch(`${API_BASE_URL}/materials`);
          const data = await response.json();
          console.log('✅ Backend connection successful! Materials count:', data.length);
          console.log('📦 Materials:', data.map((m: any) => m.title));
        } catch (error) {
          console.log('❌ Backend connection failed:', error);
        }
      } else {
        console.log('🌐 Browser environment');
      }
    };

    checkTauri();
  }, []);

  return (
    <Provider store={store}>
      <HashRouter>
        {/* NetworkStatus удален отсюда */}
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

if ("serviceWorker" in navigator) {
  registerSW()
}