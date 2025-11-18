import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import { HomePage } from './pages/HomePages/HomePage'
import MaterialsPage from './pages/MaterialsPage/MaterialsPage'
import MaterialDetailPage from './pages/MaterialDetailPage/MaterialDetailPage'
import 'bootstrap/dist/css/bootstrap.min.css'
import { registerSW } from 'virtual:pwa-register'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
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
  </React.StrictMode>,
)

if ("serviceWorker" in navigator) {
  registerSW()
}