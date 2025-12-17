import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Spinner, Container, Row, Col, Form, Badge, Button } from 'react-bootstrap';
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
  
  // Short polling
  const POLLING_INTERVAL = 7000; // 7 секунд
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isFetchingRef = useRef(false);
  const lastUpdateTimeRef = useRef<number>(Date.now());

  // Состояние для обработки изменений статуса
  const [processingPits, setProcessingPits] = useState<Set<number>>(new Set());

  const { isAuthenticated, token, role,  } = useSelector((state: RootState) => ({
    isAuthenticated: state.user.isAuthenticated,
    token: state.user.token,
    role: state.user.role,
    userId: state.user.userId
  }));

  const isModerator = role === 1;

  // Функции для работы с датами (оставляем без изменений)
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getStartOfWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    return monday.toISOString().split('T')[0];
  };

  const getStartOfMonth = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
  };

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
        break;
      default:
        setStartDate('');
        setEndDate('');
    }
  };

  // Функция для обновления объемов и статусов через polling
  const updatePitsVolumeAndStatus = useCallback(async () => {
    if (isFetchingRef.current || !token || !isModerator) return;
    
    try {
      isFetchingRef.current = true;
      console.log(`[Polling ${new Date().toLocaleTimeString()}] Обновление объемов и статусов...`);
      
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await api(token).pits.pitsList(params);
      const updatedPitsData = response.data as ModelPitsCalculationListItem[];
      
      setPits(prevPits => {
        return prevPits.map(prevPit => {
          const updatedPit = updatedPitsData.find(p => p.id === prevPit.id);
          if (!updatedPit) return prevPit;
          
          return {
            ...prevPit,
            pit_volume: updatedPit.pit_volume,
            status: updatedPit.status,
            calculated_materials_count: updatedPit.calculated_materials_count
          };
        });
      });
      
      setPitsWithDetails(prevDetails => {
        return prevDetails.map(prevDetail => {
          const updatedPit = updatedPitsData.find(p => p.id === prevDetail.id);
          if (!updatedPit) return prevDetail;
          
          return {
            ...prevDetail,
            status: updatedPit.status,
            materials: prevDetail.materials?.map(material => ({
              ...material,
              volume_result: updatedPit.pit_volume || material.volume_result
            })) || []
          };
        });
      });
      
      lastUpdateTimeRef.current = Date.now();
      console.log(`[Polling ${new Date().toLocaleTimeString()}] Обновление завершено`);
      
    } catch (err: any) {
      console.error('Ошибка при обновлении объемов и статусов:', err);
      if (err.response?.status === 401) {
        stopPolling();
      }
    } finally {
      isFetchingRef.current = false;
    }
  }, [token, statusFilter, startDate, endDate, isModerator]);

  // Функция для запуска short polling
  const startPolling = useCallback(() => {
    if (!isModerator) return;
    
    console.log('[Polling] Запуск автоматического обновления...');
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    pollingIntervalRef.current = setInterval(() => {
      console.log(`[Polling] Автоматическое обновление в ${new Date().toLocaleTimeString()}`);
      updatePitsVolumeAndStatus();
    }, POLLING_INTERVAL);
    
    updatePitsVolumeAndStatus();
  }, [isModerator, updatePitsVolumeAndStatus]);

  // Остановка polling
  const stopPolling = useCallback(() => {
    console.log('[Polling] Остановка автоматического обновления...');
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Загрузка заявок при монтировании
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }

    if (token) {
      fetchUserPits();
    }
  }, [isAuthenticated, token, navigate]);

  // Управление polling
  useEffect(() => {
    if (isModerator && token) {
      console.log('[Effect] Запуск автоматического обновления для модератора');
      startPolling();
    } else {
      console.log('[Effect] Остановка автоматического обновления');
      stopPolling();
    }
    
    return () => {
      console.log('[Effect] Очистка при размонтировании');
      stopPolling();
    };
  }, [isModerator, token, startPolling, stopPolling]);

  // Загрузка списка заявок
  const fetchUserPits = async () => {
    if (isFetchingRef.current) return;
    
    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);
      
      console.log('[Fetch] Загрузка заявок...');
      
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await api(token).pits.pitsList(params);
      const pitsData = response.data as ModelPitsCalculationListItem[];
      
      console.log('[Fetch] Заявок получено:', pitsData.length);
      setPits(pitsData);
      
      await fetchPitsDetails(pitsData);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при загрузке заявок');
      
      if (err.response?.status === 401) {
        navigate(ROUTES.LOGIN);
        stopPolling();
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  // Загрузка деталей заявок
  const fetchPitsDetails = async (pitsList: ModelPitsCalculationListItem[]) => {
    setLoadingDetails(true);
    
    try {
      console.log('[Fetch Details] Загрузка деталей...');
      
      const detailsPromises = pitsList.map(async (pit) => {
        try {
          const response = await api(token).pits.pitsDetail(pit.id!);
          return response.data as ModelPitsCalculationWithMaterials;
        } catch (error) {
          return {
            ...pit,
            materials: []
          } as ModelPitsCalculationWithMaterials;
        }
      });
      
      const details = await Promise.all(detailsPromises);
      setPitsWithDetails(details);
      setFilteredPits(details);
      
      console.log('[Fetch Details] Детали загружены');
      
    } catch (err: any) {
      console.error('Ошибка при загрузке деталей заявок:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Ключевая функция: одобрение заявки через API
  const handleApprovePit = async (pitId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Вы уверены, что хотите одобрить эту заявку? Будут запущены асинхронные расчеты.')) {
      return;
    }
    
    if (!token) {
      alert('Ошибка: токен не найден');
      return;
    }
    
    // Добавляем заявку в обработку
    setProcessingPits(prev => new Set(prev).add(pitId));
    
    try {
      console.log('[Approve] Отправка запроса на одобрение заявки:', pitId);
      
      // ИСПРАВЛЕНИЕ: Отправляем объект с полем status
      const statusObject = { status: 'completed' } as any;
      await api(token).pits.completeUpdate(pitId, statusObject);

      
      console.log('[Approve] Заявка успешно одобрена:', pitId);
      
      alert('Заявка одобрена! Асинхронные расчеты запущены.');
      
      // Немедленно обновляем статус локально
      updatePitStatusLocal(pitId, 'completed');
      
    } catch (err: any) {
      console.error('[Approve] Полная ошибка:', err);
      
      // Обработка ошибок в соответствии с бекендом
      if (err.response) {
        switch (err.response.status) {
          case 404:
            alert('Ошибка: заявка не найдена');
            break;
          case 409:
            alert('Ошибка: можно одобрять только заявки со статусом "На рассмотрении"');
            break;
          case 400:
            alert('Ошибка: некорректный статус');
            break;
          case 401:
            alert('Ошибка авторизации. Пожалуйста, войдите снова.');
            navigate(ROUTES.LOGIN);
            break;
          case 500:
            alert('Внутренняя ошибка сервера. Пожалуйста, попробуйте позже.');
            break;
          default:
            alert(err.response.data?.message || `Ошибка ${err.response.status}: Не удалось одобрить заявку`);
        }
      } else {
        alert('Ошибка сети или сервера. Проверьте подключение и попробуйте снова.');
      }
      
      // Перезагружаем данные, чтобы получить актуальный статус
      fetchUserPits();
      
    } finally {
      // Убираем заявку из обработки
      setProcessingPits(prev => {
        const newSet = new Set(prev);
        newSet.delete(pitId);
        return newSet;
      });
    }
  };

  // Ключевая функция: отклонение заявки через API
  const handleRejectPit = async (pitId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Вы уверены, что хотите отклонить эту заявку?')) {
      return;
    }
    
    if (!token) {
      alert('Ошибка: токен не найден');
      return;
    }
    
    // Добавляем заявку в обработку
    setProcessingPits(prev => new Set(prev).add(pitId));
    
    try {
      console.log('[Reject] Отправка запроса на отклонение заявки:', pitId);
      
      // ИСПРАВЛЕНИЕ: Отправляем объект с полем status

      const statusObject = { status: 'rejected' } as any;
      await api(token).pits.completeUpdate(pitId, statusObject);
      
      console.log('[Reject] Заявка успешно отклонена:', pitId);
      
      alert('Заявка отклонена.');
      
      // Немедленно обновляем статус локально
      updatePitStatusLocal(pitId, 'rejected');
      
    } catch (err: any) {
      console.error('[Reject] Ошибка при отклонении заявки:', err);
      
      // Обработка ошибок в соответствии с бекендом
      if (err.response) {
        switch (err.response.status) {
          case 404:
            alert('Ошибка: заявка не найдена');
            break;
          case 409:
            alert('Ошибка: можно отклонять только заявки со статусом "На рассмотрении"');
            break;
          case 400:
            alert('Ошибка: некорректный статус');
            break;
          case 401:
            alert('Ошибка авторизации. Пожалуйста, войдите снова.');
            navigate(ROUTES.LOGIN);
            break;
          case 500:
            alert('Внутренняя ошибка сервера. Пожалуйста, попробуйте позже.');
            break;
          default:
            alert(err.response.data?.message || `Ошибка ${err.response.status}: Не удалось отклонить заявку`);
        }
      } else {
        alert('Ошибка сети или сервера. Проверьте подключение и попробуйте снова.');
      }
      
      // Перезагружаем данные, чтобы получить актуальный статус
      fetchUserPits();
      
    } finally {
      // Убираем заявку из обработки
      setProcessingPits(prev => {
        const newSet = new Set(prev);
        newSet.delete(pitId);
        return newSet;
      });
    }
  };

  // Локальное обновление статуса заявки
  const updatePitStatusLocal = (pitId: number, newStatus: string) => {
    setPits(prev => prev.map(pit => 
      pit.id === pitId ? { ...pit, status: newStatus } : pit
    ));
    
    setPitsWithDetails(prev => prev.map(pit => 
      pit.id === pitId ? { ...pit, status: newStatus } : pit
    ));
    
    setFilteredPits(prev => prev.map(pit => 
      pit.id === pitId ? { ...pit, status: newStatus } : pit
    ));
  };

  // Вспомогательные функции (оставляем без изменений)
  const calculateInitialPitVolume = (pit: ModelPitsCalculationListItem) => {
    const length = pit.pit_length || 0;
    const width = pit.pit_width || 0;
    const depth = pit.pit_depth || 0;
    return (length * width * depth).toFixed(2);
  };

  const displayExcavatedVolume = (pit: ModelPitsCalculationListItem) => {
    return pit.pit_volume ? pit.pit_volume.toFixed(2) : '0.00';
  };

  const getAverageCoefficient = (pitWithDetails: ModelPitsCalculationWithMaterials) => {
    if (!pitWithDetails.materials || pitWithDetails.materials.length === 0) {
      return '0.00';
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
      return '0.00';
    }
    
    return (totalCoefficient / materialsWithCoefficient).toFixed(2);
  };

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

  const getPitFromList = (pitId: number): ModelPitsCalculationListItem | undefined => {
    return pits.find(p => p.id === pitId);
  };

  const handlePitClick = (pitId: number) => {
    navigate(`/pits/${pitId}`);
  };

  // Проверка, обрабатывается ли заявка
  const isPitProcessing = (pitId: number) => {
    return processingPits.has(pitId);
  };

  return (
    <>
      <Header />
      <Container className="user-pits-page">
        <div className="page-header">
          <h1>{isModerator ? 'Заявки на модерацию' : 'Мои заявки'}</h1>
          {isModerator && (
            <div className="polling-indicator">
          
            </div>
          )}
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
            
            
            <div className="pits-list">
              {filteredPits.map((pit) => {
                const pitFromList = getPitFromList(pit.id!);
                const isProcessing = isPitProcessing(pit.id!);
                
                return (
                  <div 
                    key={pit.id}
                    className={`pit-row ${pit.status === 'draft' ? 'draft-row' : ''} ${isProcessing ? 'processing-row' : ''}`}
                    onClick={() => !isProcessing && handlePitClick(pit.id!)}
                  >
                    <div className="pit-row-content">
                      <div className="pit-row-id">
                        <strong>Заявка #{pit.id}</strong>
                        {isProcessing && (
                          <Badge bg="warning" className="ms-2">
                            Обработка...
                          </Badge>
                        )}
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
                          <strong>{pit.pit_length && pit.pit_width && pit.pit_depth 
                            ? calculateInitialPitVolume(pit) 
                            : '0.00'} м³</strong>
                        </div>
                        <div className="volume-info">
                          <span>Объем после выемки:</span>
                          <strong className="excavated-volume">
                            {pitFromList ? displayExcavatedVolume(pitFromList) : '0.00'} м³
                          </strong>
                          {pit.status === 'completed' && (
                            <span className="calculating-badge">
                              
                            </span>
                          )}
                        </div>
                        <div className="volume-info">
                          <span>Коэф. разрыхления:</span>
                          <strong>{getAverageCoefficient(pit)}</strong>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pit-row-actions">
                      {isModerator && pit.status === 'formed' ? (
                        <div className="actions-column">
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePitClick(pit.id!);
                            }}
                            className="mb-2"
                            disabled={isProcessing}
                          >
                            Просмотреть
                          </Button>
                          <Button 
                            variant="success" 
                            size="sm"
                            onClick={(e) => handleApprovePit(pit.id!, e)}
                            className="mb-2"
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <>
                                <Spinner size="sm" animation="border" className="me-2" />
                                Одобрение...
                              </>
                            ) : 'Одобрить'}
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={(e) => handleRejectPit(pit.id!, e)}
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <>
                                <Spinner size="sm" animation="border" className="me-2" />
                                Отклонение...
                              </>
                            ) : 'Отклонить'}
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePitClick(pit.id!);
                          }}
                          disabled={isProcessing}
                        >
                          Просмотреть
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Container>
    </>
  );
};

export default UserPitsPage;