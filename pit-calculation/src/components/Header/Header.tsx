import { FC } from 'react'
import { Link } from 'react-router-dom'
import { getStaticImagePath } from '../../utils/imageUtils'
import './Header.css'

const Header: FC = () => (
    <header className="header">
        <div className="header-container">
            <Link to="/" className="logo-link">
                <img src={getStaticImagePath('main_image.png')} alt="Главная страница" className="logo" />  {/* ← ИСПРАВЛЕНО */}
            </Link>
        </div>
    </header>
)

export default Header