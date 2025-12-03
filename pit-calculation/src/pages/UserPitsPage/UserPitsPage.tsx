import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Spinner, Container } from 'react-bootstrap';
import { useAppSelector } from '../../store/hooks';
import { api } from '../../api/initApi'; 
import { ROUTES } from '../../Routers';
import { ModelPitsCalculationListItem } from '../../api/Api';
import Header from '../../components/Header/Header';
import './UserPitsPage.css';

const UserPitsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAppSelector((state) => state.user);
  const [pits, setPits] = useState<ModelPitsCalculationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  
  const isFetchingRef = useRef(false);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    if (isFetchingRef.current || hasFetchedRef.current) {
      return;
    }

    if (token) {
      fetchUserPits();
    }
  }, [isAuthenticated, token, navigate]);

  const fetchUserPits = async () => {
    if (isFetchingRef.current) return;
    
    try {
      isFetchingRef.current = true;
      hasFetchedRef.current = false;
      setLoading(true);
      setError(null);
      
      
      const response = await api(token).pits.pitsList({});
      const pitsData = response.data as ModelPitsCalculationListItem[];
      
      setPits(pitsData);
      hasFetchedRef.current = true;
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при загрузке заявок');
      
      if (err.response?.status === 401) {
        navigate(ROUTES.LOGIN);
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'Черновик';
      case 'formed':
        return 'На рассмотрении';
      case 'completed':
        return 'Завершена';
      case 'rejected':
        return 'Отклонена';
      default:
        return status;
    }
  };

  return (
    <>
      <Header />
      <Container className="user-pits-page">
        <div className="page-header">
          <h1>Мои заявки</h1>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
            <p className="mt-3">Загрузка заявок...</p>
          </div>
        ) : pits.length === 0 ? (
          <div className="text-center py-5">
            <p>Нет заявок</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID заявки</th>
                  <th>Статус</th>
                  <th>Количество материалов</th>
                </tr>
              </thead>
              <tbody>
                {pits.map((pit) => (
                  <tr key={pit.id}>
                    <td>#{pit.id}</td>
                    <td>{getStatusText(pit.status || '')}</td>
                    <td>{pit.calculated_materials_count || 0}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Container>
    </>
  );
};

export default UserPitsPage;