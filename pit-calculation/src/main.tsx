import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePages/HomePage'
import MaterialsPage from './pages/MaterialsPage/MaterialsPage'
import MaterialDetailPage from './pages/MaterialDetailPage/MaterialDetailPage'
import 'bootstrap/dist/css/bootstrap.min.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/materials" element={<MaterialsPage />} />
        <Route path="/materials/:id" element={<MaterialDetailPage />} />
        <Route path="*" element={<div>Страница не найдена</div>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)