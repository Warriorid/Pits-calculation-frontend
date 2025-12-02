import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Form, Button, Container, Card, Alert, Spinner } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginUserAsync, registerUserAsync } from '../../store/slices/userSlice';
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import { ROUTES } from '../../Routers';
import './LoginPage.css';

const LoginPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [registerData, setRegisterData] = useState({ 
        username: '', 
        password: ''
    });
    
    const error = useAppSelector((state) => state.user.error);
    const [localLoading, setLocalLoading] = useState(false);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

    const validateForm = (isLogin: boolean) => {
        const errors: { [key: string]: string } = {};
        
        if (isLogin) {
            if (!loginData.username.trim()) {
                errors.loginUsername = 'Введите имя пользователя';
            }
            if (!loginData.password) {
                errors.loginPassword = 'Введите пароль';
            }
        } else {
            if (!registerData.username.trim()) {
                errors.registerUsername = 'Введите имя пользователя';
            } else if (registerData.username.length < 3) {
                errors.registerUsername = 'Имя пользователя должно быть не менее 3 символов';
            }
            
            if (!registerData.password) {
                errors.registerPassword = 'Введите пароль';
            }
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleLoginChange = (e: ChangeEvent<HTMLInputElement>) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
        if (formErrors.loginUsername || formErrors.loginPassword) {
            setFormErrors({});
        }
    };

    const handleRegisterChange = (e: ChangeEvent<HTMLInputElement>) => {
        setRegisterData({ ...registerData, [e.target.name]: e.target.value });
        const fieldName = e.target.name;
        if (formErrors[fieldName]) {
            const newErrors = { ...formErrors };
            delete newErrors[fieldName];
            setFormErrors(newErrors);
        }
    };

    const handleLoginSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validateForm(true)) return;
        
        setLocalLoading(true);
        try {
            const result = await dispatch(loginUserAsync(loginData));
            if (loginUserAsync.fulfilled.match(result)) {
                navigate(ROUTES.HOME);
            }
        } finally {
            setLocalLoading(false);
        }
    };

    const handleRegisterSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validateForm(false)) return;
        
        const userData = {
            username: registerData.username,
            password: registerData.password,
            role: 0
        };
        
        setLocalLoading(true);
        try {
            const result = await dispatch(registerUserAsync(userData));
            if (registerUserAsync.fulfilled.match(result)) {
                alert('Регистрация успешна! Теперь войдите в систему.');
                setActiveTab('login');
                setLoginData({ ...loginData, username: registerData.username });
                setRegisterData({ username: '', password: '' });
            }
        } finally {
            setLocalLoading(false);
        }
    };

    return (
        <>
            <Header />
            <Container className="login-container">
                <Card className="login-card">
                    {/* Вкладки ВНЕ Card.Body, чтобы они были отдельно */}
                    <div className="card-tabs">
                        <button 
                            className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                            onClick={() => setActiveTab('login')}
                            type="button"
                        >
                            Вход
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                            onClick={() => setActiveTab('register')}
                            type="button"
                        >
                            Регистрация
                        </button>
                    </div>
                    
                    <Card.Body className="card-form-body">
                        {/* Форма входа */}
                        {activeTab === 'login' && (
                            <Form onSubmit={handleLoginSubmit} className="login-form">
                                <Form.Group className="mb-3">
                                    <Form.Label>Имя пользователя</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="username"
                                        placeholder="Введите имя пользователя"
                                        value={loginData.username}
                                        onChange={handleLoginChange}
                                        isInvalid={!!formErrors.loginUsername}
                                        disabled={localLoading}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.loginUsername}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Пароль</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        placeholder="Введите пароль"
                                        value={loginData.password}
                                        onChange={handleLoginChange}
                                        isInvalid={!!formErrors.loginPassword}
                                        disabled={localLoading}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.loginPassword}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                {error && activeTab === 'login' && (
                                    <Alert variant="danger" className="mb-3">
                                        {error}
                                    </Alert>
                                )}

                                <Button 
                                    variant="primary" 
                                    type="submit" 
                                    className="w-100"
                                    disabled={localLoading}
                                >
                                    {localLoading ? (
                                        <>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                                className="me-2"
                                            />
                                            Вход...
                                        </>
                                    ) : (
                                        'Войти'
                                    )}
                                </Button>
                            </Form>
                        )}

                        {/* Форма регистрации */}
                        {activeTab === 'register' && (
                            <Form onSubmit={handleRegisterSubmit} className="register-form">
                                <Form.Group className="mb-3">
                                    <Form.Label>Имя пользователя</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="username"
                                        placeholder="Введите имя пользователя"
                                        value={registerData.username}
                                        onChange={handleRegisterChange}
                                        isInvalid={!!formErrors.registerUsername}
                                        disabled={localLoading}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.registerUsername}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Пароль</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        placeholder="Введите пароль"
                                        value={registerData.password}
                                        onChange={handleRegisterChange}
                                        isInvalid={!!formErrors.registerPassword}
                                        disabled={localLoading}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.registerPassword}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                {error && activeTab === 'register' && (
                                    <Alert variant="danger" className="mb-3">
                                        {error}
                                    </Alert>
                                )}

                                <Button 
                                    variant="success" 
                                    type="submit" 
                                    className="w-100"
                                    disabled={localLoading}
                                >
                                    {localLoading ? (
                                        <>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                                className="me-2"
                                            />
                                            Регистрация...
                                        </>
                                    ) : (
                                        'Зарегистрироваться'
                                    )}
                                </Button>
                            </Form>
                        )}
                    </Card.Body>
                </Card>
            </Container>
        </>
    );
};

export default LoginPage;