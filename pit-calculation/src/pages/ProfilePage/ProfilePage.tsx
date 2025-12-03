import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Container, Row, Col } from 'react-bootstrap';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { api } from '../../api/initApi'; 
import { ROUTES } from '../../Routers';
import { ModelUpdateProfileRequest } from '../../api/Api'; 
import Header from '../../components/Header/Header';
import { updateUsername } from '../../store/slices/userSlice';
import './ProfilePage.css';

interface UserProfile {
  id: number;
  username: string;
  role: number;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, token, userId } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch(); // Добавляем dispatch
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    fetchProfile();
  }, [isAuthenticated, token, userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      if (userId) {
        const response = await api(token).users.usersDetail(userId);
        const userData = response.data as any;
        setProfile({
          id: userData.id,
          username: userData.username,
          role: userData.role
        });
        setFormData({
          username: userData.username || '',
          password: ''
        });
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.id) return;

    try {
      setUpdating(true);
      
      // Для изменения логина нужно указать текущий пароль!
      // Если поле пароля пустое и имя пользователя не изменилось - не отправляем запрос
      if (formData.username === profile.username && !formData.password) {
        console.log('Нет изменений для сохранения');
        setUpdating(false);
        return;
      }
      
      // Если меняем только имя пользователя, но не указали пароль - используем любой существующий
      if (formData.password === '') {
        console.warn('Для изменения имени пользователя требуется указать пароль');
        setUpdating(false);
        return;
      }
      
      const updateData: ModelUpdateProfileRequest = {
        username: formData.username,
        password: formData.password
      };

      await api(token).users.usersUpdate(profile.id, updateData);
      
      // Обновляем профиль только если имя изменилось
      if (formData.username !== profile.username) {
        setProfile(prev => prev ? { ...prev, username: formData.username } : null);
        // Обновляем имя пользователя в Redux store для Header
        dispatch(updateUsername(formData.username));
      }
      
      // Очищаем поле пароля после успешного обновления
      setFormData(prev => ({ ...prev, password: '' }));
      
    } catch (err: any) {
      console.error('Error updating profile:', err);
      // Если ошибка связана с паролем, покажем это пользователю
      if (err.response?.data?.message?.toLowerCase().includes('пароль')) {
        alert('Текущий пароль неверен. Для изменения имени пользователя введите текущий пароль.');
      } else if (err.response?.data?.message) {
        alert(err.response.data.message);
      }
    } finally {
      setUpdating(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <>
        <Header />
        <Container className="profile-page">
          <div className="text-center py-5">
            <p>Загрузка профиля...</p>
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container className="profile-page">
        <Row className="justify-content-center">
          <Col lg={6}>
            <div className="page-header mb-4">
              <h1>Личный кабинет</h1>
            </div>

            <div className="profile-info mb-4">
              <div className="info-item">
                <span className="label">Логин:</span>
                <span className="value">{profile?.username}</span>
              </div>
            </div>

            <div className="mb-4">
              <h5 className="mb-3">Изменить данные</h5>
              <Form onSubmit={handleUpdate}>
                <Form.Group className="mb-3">
                  <Form.Label>Новое имя пользователя</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Введите новое имя"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Пароль</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Введите текущий пароль для изменения имени или новый пароль для смены"
                    required
                  />
                  <Form.Text className="text-muted">
                    Для изменения имени пользователя введите текущий пароль. Для смены пароля введите новый пароль.
                  </Form.Text>
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={updating || (!formData.password && formData.username === profile?.username)}
                  className="w-100 mb-3"
                >
                  {updating ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ProfilePage;