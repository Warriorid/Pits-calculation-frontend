// components/Header/Header.tsx
import { FC } from 'react'
import { Link } from 'react-router-dom'
import './Header.css'

const Header: FC = () => (
    <header className="header">
        <div className="header-container">
            <Link to="/" className="logo-link">
                <img src="/static/img/main_image.png" alt="Главная страница" className="logo" />
            </Link>
        </div>
    </header>
)

export default Header