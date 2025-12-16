import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Spinner, Container, Row, Col, Form, Badge } from 'react-bootstrap';
import { api } from '../../api/initApi'; 
import { ROUTES } from '../../Routers';
import { ModelPitsCalculationListItem, ModelPitsCalculationWithMaterials } from '../../api/Api';
import Header from '../../components/Header/Header';
import { RootState } from '../../store';
import './UserPitsPage.css';

const UserPitsPage: React.FC = () => {
  const navigate = useNavigate();
  const [pits, setPits] = useState<ModelPitsCalculationListItem[]>([]);
  const [pitsWithDetails, setPitsWithDetails] = useState<ModelPitsCalculationWithMaterials[]>([]);
  const [filteredPits, setFilteredPits] = useState<ModelPitsCalculationWithMaterials[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Фильтры
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('today');
  
  const isFetchingRef = useRef(false);

  const { isAuthenticated, token } = useSelector((state: RootState) => ({
    isAuthenticated: state.user.isAuthenticated,
    token: state.user.token
  }));

  // Функция для получения сегодняшней даты в формате YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Функция для получения начала недели (понедельник)
  const getStartOfWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 - воскресенье, 1 - понедельник...
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    return monday.toISOString().split('T')[0];
  };

  // Функция для получения начала месяца
  const getStartOfMonth = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
  };

  // Обработчик быстрого выбора диапазона дат
  const handleDateRangeChange = (range: string) => {
    setSelectedDateRange(range);
    const today = getTodayDate();
    
    switch (range) {
      case 'today':
        setStartDate(today);
        setEndDate(today);
        break;
      case 'week':
        setStartDate(getStartOfWeek());
        setEndDate(today);
        break;
      case 'month':
        setStartDate(getStartOfMonth());
        setEndDate(today);
        break;
      case 'all':
        setStartDate('');
        setEndDate('');
        break;
      case 'custom':
        // Оставляем текущие даты для ручного выбора
        break;
      default:
        setStartDate('');
        setEndDate('');
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }

    if (token) {
      fetchUserPits();
    }
  }, [isAuthenticated, token, navigate]);

  // Загрузка списка заявок
  const fetchUserPits = async () => {
    if (isFetchingRef.current) return;
    
    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);
      
      // Формируем параметры запроса
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await api(token).pits.pitsList(params);
      const pitsData = response.data as ModelPitsCalculationListItem[];
      
      setPits(pitsData);
      
      // Загружаем детали для каждой заявки
      await fetchPitsDetails(pitsData);
      
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

  // Загрузка деталей заявок с материалами
  const fetchPitsDetails = async (pitsList: ModelPitsCalculationListItem[]) => {
    setLoadingDetails(true);
    
    try {
      const detailsPromises = pitsList.map(async (pit) => {
        try {
          const response = await api(token).pits.pitsDetail(pit.id!);
          return response.data as ModelPitsCalculationWithMaterials;
        } catch (error) {
          // Если не удалось загрузить детали, возвращаем основную информацию
          return {
            ...pit,
            materials: []
          } as ModelPitsCalculationWithMaterials;
        }
      });
      
      const details = await Promise.all(detailsPromises);
      setPitsWithDetails(details);
      setFilteredPits(details);
      
    } catch (err: any) {
      console.error('Ошибка при загрузке деталей заявок:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Функция для расчета общего объема котлована
  const calculateTotalPitVolume = (pit: ModelPitsCalculationListItem) => {
    const length = pit.pit_length || 0;
    const width = pit.pit_width || 0;
    const depth = pit.pit_depth || 0;
    return (length * width * depth).toFixed(2);
  };

  // Функция для расчета суммарного объема после выемки из всех материалов
  const calculateTotalExcavatedVolume = (pitWithDetails: ModelPitsCalculationWithMaterials) => {
    if (!pitWithDetails.materials || pitWithDetails.materials.length === 0) {
      return '0.00';
    }
    
    let totalVolume = 0;
    let totalCoefficient = 0;
    let materialsWithData = 0;
    
    pitWithDetails.materials.forEach(material => {
      const volumeResult = material.volume_result || 0;
      const coefficient = material.coefficient || 1;
      
      if (volumeResult > 0) {
        totalVolume += volumeResult;
        totalCoefficient += coefficient;
        materialsWithData++;
      }
    });
    
    // Если нет материалов с данными, возвращаем 0
    if (materialsWithData === 0) {
      return '0.00';
    }
    
    // Вычисляем средний коэффициент и итоговый объем
    const averageCoefficient = totalCoefficient / materialsWithData;
    const totalExcavatedVolume = totalVolume * averageCoefficient;
    
    return totalExcavatedVolume.toFixed(2);
  };

  // Функция для получения среднего коэффициента разрыхления
  const getAverageCoefficient = (pitWithDetails: ModelPitsCalculationWithMaterials) => {
    if (!pitWithDetails.materials || pitWithDetails.materials.length === 0) {
      return '1.20'; // Значение по умолчанию
    }
    
    let totalCoefficient = 0;
    let materialsWithCoefficient = 0;
    
    pitWithDetails.materials.forEach(material => {
      const coefficient = material.coefficient;
      if (coefficient && coefficient > 0) {
        totalCoefficient += coefficient;
        materialsWithCoefficient++;
      }
    });
    
    if (materialsWithCoefficient === 0) {
      return '1.20';
    }
    
    return (totalCoefficient / materialsWithCoefficient).toFixed(2);
  };

  // Функция для применения фильтров
  const applyFilters = () => {
    let result = [...pitsWithDetails];
    
    if (statusFilter) {
      result = result.filter(pit => pit.status?.toLowerCase() === statusFilter.toLowerCase());
    }
    
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      result = result.filter(pit => {
        const pitDate = new Date(pit.created_at || '');
        pitDate.setHours(0, 0, 0, 0);
        return pitDate >= start;
      });
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter(pit => {
        const pitDate = new Date(pit.created_at || '');
        return pitDate <= end;
      });
    }
    
    setFilteredPits(result);
  };

  // Функция для сброса фильтров
  const handleResetFilters = () => {
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setSelectedDateRange('all');
    setFilteredPits(pitsWithDetails);
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return <Badge bg="secondary">Черновик</Badge>;
      case 'formed':
        return <Badge bg="warning" text="dark">На рассмотрении</Badge>;
      case 'completed':
        return <Badge bg="success">Завершена</Badge>;
      case 'rejected':
        return <Badge bg="danger">Отклонена</Badge>;
      default:
        return <Badge bg="secondary">Неизвестно</Badge>;
    }
  };

  // Функция для форматирования даты в российский формат
  const formatRussianDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Не указано';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePitClick = (pitId: number) => {
    navigate(`/pits/${pitId}`);
  };

  return (
    <>
      <Header />
      <Container className="user-pits-page">
        <div className="page-header">
          <h1>Мои заявки</h1>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Фильтры */}
        <div className="filters-card mb-4">
          <div className="filters-header">
            <h5>Фильтры заявок</h5>
            <div>
              <button 
                className="btn btn-sm btn-outline-secondary me-2"
                onClick={handleResetFilters}
              >
                Сбросить фильтры
              </button>
              <button 
                className="btn btn-sm btn-primary"
                onClick={applyFilters}
              >
                Применить фильтры
              </button>
            </div>
          </div>
          
          <Row className="g-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Статус</Form.Label>
                <Form.Select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Все статусы</option>
                  <option value="draft">Черновик</option>
                  <option value="formed">На рассмотрении</option>
                  <option value="completed">Завершена</option>
                  <option value="rejected">Отклонена</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group>
                <Form.Label>Быстрый выбор дат</Form.Label>
                <Form.Select 
                  value={selectedDateRange}
                  onChange={(e) => handleDateRangeChange(e.target.value)}
                >
                  <option value="all">За все время</option>
                  <option value="today">Сегодня</option>
                  <option value="week">За неделю</option>
                  <option value="month">За месяц</option>
                  <option value="custom">Выбрать даты</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group>
                <Form.Label>Начальная дата</Form.Label>
                <Form.Control 
                  type="date" 
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setSelectedDateRange('custom');
                  }}
                />
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group>
                <Form.Label>Конечная дата</Form.Label>
                <Form.Control 
                  type="date" 
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setSelectedDateRange('custom');
                  }}
                />
              </Form.Group>
            </Col>
          </Row>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
            <p className="mt-3">Загрузка заявок...</p>
          </div>
        ) : loadingDetails ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
            <p className="mt-3">Загрузка деталей заявок...</p>
          </div>
        ) : filteredPits.length === 0 ? (
          <div className="text-center py-5 empty-state">
            <h5>Нет заявок</h5>
            <p className="text-muted">Пока у вас нет заявок, соответствующих выбранным фильтрам</p>
          </div>
        ) : (
          <>
            <div className="pits-summary mb-3">
              <p>Найдено заявок: <strong>{filteredPits.length}</strong></p>
            </div>
            
            <div className="pits-list">
              {filteredPits.map((pit) => (
                <div 
                  key={pit.id}
                  className={`pit-row ${pit.status === 'draft' ? 'draft-row' : ''}`}
                  onClick={() => handlePitClick(pit.id!)}
                >
                  <div className="pit-row-content">
                    <div className="pit-row-id">
                      <strong>Заявка #{pit.id}</strong>
                    </div>
                    
                    <div className="pit-row-status">
                      {getStatusBadge(pit.status || '')}
                    </div>
                    
                    <div className="pit-row-dates">
                      <div className="date-info">
                        <span className="date-label">Создана:</span>
                        <span className="date-value">
                          {formatRussianDate(pit.created_at)}
                        </span>
                      </div>
                      
                      {pit.formed_at && (
                        <div className="date-info">
                          <span className="date-label">Сформирована:</span>
                          <span className="date-value">
                            {formatRussianDate(pit.formed_at)}
                          </span>
                        </div>
                      )}
                      
                      {pit.completed_at && (
                        <div className="date-info">
                          <span className="date-label">Завершена:</span>
                          <span className="date-value">
                            {formatRussianDate(pit.completed_at)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="pit-row-volumes">
                      <div className="volume-info">
                        <span>Объем котлована:</span>
                        <strong>{calculateTotalPitVolume(pit)} м³</strong>
                      </div>
                      <div className="volume-info">
                        <span>Объем после выемки:</span>
                        <strong className="excavated-volume">
                          {calculateTotalExcavatedVolume(pit)} м³
                        </strong>
                      </div>
                      <div className="volume-info">
                        <span>Ср. коэф. разрыхления:</span>
                        <strong>{getAverageCoefficient(pit)}</strong>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pit-row-actions">
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePitClick(pit.id!);
                      }}
                    >
                      Просмотреть
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Container>
    </>
  );
};

export default UserPitsPage;