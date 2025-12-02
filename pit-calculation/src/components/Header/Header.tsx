// components/Header/Header.tsx
import { FC } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from 'react-bootstrap'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { logoutUserAsync } from '../../store/slices/userSlice'
import { getStaticImagePath } from '../../utils/imageUtils'
import { ROUTES } from '../../Routers'
import './Header.css'

const Header: FC = () => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { isAuthenticated, username } = useAppSelector((state) => state.user)

    console.log('isAuthenticated:', isAuthenticated)
    console.log('username:', username)

    const handleLogout = async () => {
        await dispatch(logoutUserAsync())
        navigate(ROUTES.HOME)
    }

    const getUserInitial = () => {
        if (username && username.length > 0) {
            return username[0].toUpperCase()
        }
        return " "
        
    }

    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="logo-link">
                    <img src={getStaticImagePath('main_image.png')} alt="Главная страница" className="logo" />
                </Link>
                
                <div className="header-actions">
                    {isAuthenticated ? (
                        <div className="user-menu">
                            <div className="user-avatar">
                                {getUserInitial()}
                            </div>
                            <span className="username">{username}</span>
                            <Button 
                                variant="outline-danger" 
                                size="sm" 
                                onClick={handleLogout}
                                className="logout-btn"
                            >
                                Выйти
                            </Button>
                        </div>
                    ) : (
                        <Link to={ROUTES.LOGIN}>
                            <Button variant="outline-primary" className="login-btn">
                                Войти
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
            
            <nav className="bottom-menu">
                <div className="menu-container">
                    <Link to={ROUTES.HOME} className="menu-item">
                        Главная
                    </Link>
                    <Link to={ROUTES.MATERIALS} className="menu-item">
                        Материалы
                    </Link>
                </div>
            </nav>
        </header>
    )
}

export default Header