import { FC } from 'react'
import { Link } from 'react-router-dom'
import { getStaticPath } from '../../utils/paths'
import './Header.css'

const Header: FC = () => (
    <header className="header">
        <div className="header-container">
            <Link to="/" className="logo-link">
                <img src={getStaticPath('static/img/main_image.png')} alt="Главная страница" className="logo" />
            </Link>
        </div>
    </header>
)

export default Header