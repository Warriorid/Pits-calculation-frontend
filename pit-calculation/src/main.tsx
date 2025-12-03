import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import { HomePage } from './pages/HomePages/HomePage'
import MaterialsPage from './pages/MaterialsPage/MaterialsPage'
import MaterialDetailPage from './pages/MaterialDetailPage/MaterialDetailPage'
import LoginPage from './pages/LoginPage/LoginPage'
import PitsPage from './pages/PitsPage/PitsPage'
import UserPitsPage from './pages/UserPitsPage/UserPitsPage'
import ProfilePage from './pages/ProfilePage/ProfilePage' 
import 'bootstrap/dist/css/bootstrap.min.css'

function AppWrapper() {
  return (
    <Provider store={store}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/materials" element={<MaterialsPage />} />
          <Route path="/materials/:id" element={<MaterialDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/pits" element={<PitsPage />} />
          <Route path="/pits/:pit_id" element={<PitsPage />} />
          <Route path="/my-pits" element={<UserPitsPage />} /> {/* Добавляем новый маршрут */}
          <Route path="/profile" element={<ProfilePage />} /> {/* Добавляем маршрут профиля */}
          <Route path="*" element={<div>Страница не найдена</div>} />
        </Routes>
      </HashRouter>
    </Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>,
)