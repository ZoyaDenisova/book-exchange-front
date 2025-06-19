import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { API } from '../config/api-endpoints';
import type { Exchange, ExchangeWithDetails } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

// Варианты badge строго по shadcn/ui дефолту
type BadgeVariant = 'secondary' | 'outline' | 'default' | 'destructive';

function getStatusBadgeVariant(status: string): BadgeVariant {
  switch (status.toLowerCase()) {
    case 'ожидает':
      return 'secondary';
    case 'принято':
      return 'default';
    case 'отклонено':
      return 'destructive';
    case 'завершено':
      return 'outline';
    case 'отменено':
      return 'secondary';
    default:
      return 'secondary';
  }
}

function getStatusText(status: string) {
  switch (status.toLowerCase()) {
    case 'ожидает': return 'Ожидает ответа';
    case 'принято': return 'Принято';
    case 'отклонено': return 'Отклонено';
    case 'завершено': return 'Обмен завершен';
    case 'отменено': return 'Отменено';
    default: return status;
  }
}

const ExchangeRequests: React.FC = () => {
  const [exchanges, setExchanges] = useState<ExchangeWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get(API.AUTH.PROFILE);
        setUserId(response.data.id);
      } catch {
        setError('Пожалуйста, войдите в систему для просмотра запросов на обмен.');
      }
    };
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchExchangeRequests = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(API.EXCHANGES.USER_EXCHANGES);
        setExchanges(response.data);
      } catch {
        setError('Не удалось загрузить запросы на обмен. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    fetchExchangeRequests();
  }, [userId]);

  const handleUpdateExchange = async (exchangeId: number, newStatus: Exchange['status']) => {
    try {
      await api.put(`${API.EXCHANGES.DETAIL(exchangeId)}`, { status: newStatus });
      setExchanges(exchanges.map(exchange =>
        exchange.id === exchangeId ? { ...exchange, status: newStatus } : exchange
      ));
      // Если статус "отклонено" или "отменено" или "завершено", перезагружаем список через 1 секунду
      if (newStatus === 'отклонено' || newStatus === 'отменено' || newStatus === 'завершено') {
        setTimeout(async () => {
          if (!userId) return;
          try {
            setLoading(true);
            const response = await api.get(API.EXCHANGES.USER_EXCHANGES);
            setExchanges(response.data);
          } finally {
            setLoading(false);
          }
        }, 1000);
      }
    } catch {
      alert('Не удалось обновить статус обмена. Пожалуйста, попробуйте снова.');
    }
  };

  // Разделение запросов на входящие и исходящие
  const incomingRequests = exchanges.filter(exchange => exchange.owner_id === userId);
  const outgoingRequests = exchanges.filter(exchange => exchange.requester_id === userId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <span className="text-muted-foreground text-lg">Загрузка запросов на обмен...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-6">Запросы на обмен книгами</h2>

        {/* Входящие */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Входящие запросы</h3>
          {incomingRequests.length === 0 ? (
            <p className="text-muted-foreground">У вас нет входящих запросов на обмен.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {incomingRequests.map(exchange => (
                <Card key={exchange.id} className="flex flex-col h-full border shadow-md">
                  <CardHeader className="pb-2 flex flex-col gap-2">
                    <CardTitle className="text-base">
                      Книга: {exchange.book_title}
                    </CardTitle>
                    <div>
                      <span className="text-muted-foreground">Автор:</span>
                      <span className="ml-2">{exchange.book_author}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Запрос от:</span>
                      <span className="ml-2">{exchange.requester_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Статус:</span>
                      <Badge variant={getStatusBadgeVariant(exchange.status)}>
                        {getStatusText(exchange.status)}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Запрошено:</span>
                      <span className="ml-2">
                        {new Date(exchange.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex gap-2 flex-wrap">
                    <Button asChild variant="outline" className="mb-2">
                      <Link to={`/books/${exchange.book_id}`}>Просмотр книги</Link>
                    </Button>
                    {exchange.status === 'ожидает' && (
                      <>
                        <Button
                          variant="default"
                          onClick={() => handleUpdateExchange(exchange.id, 'принято')}
                          className="mb-2"
                        >
                          Принять
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleUpdateExchange(exchange.id, 'отклонено')}
                          className="mb-2"
                        >
                          Отклонить
                        </Button>
                      </>
                    )}
                    {exchange.status === 'принято' && (
                      <Button
                        variant="secondary"
                        onClick={() => handleUpdateExchange(exchange.id, 'завершено')}
                        className="mb-2"
                      >
                        Завершить обмен
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Исходящие */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Исходящие запросы</h3>
          {outgoingRequests.length === 0 ? (
            <p className="text-muted-foreground">У вас нет исходящих запросов на обмен.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {outgoingRequests.map(exchange => (
                <Card key={exchange.id} className="flex flex-col h-full border shadow-md">
                  <CardHeader className="pb-2 flex flex-col gap-2">
                    <CardTitle className="text-base">
                      Книга: {exchange.book_title}
                    </CardTitle>
                    <div>
                      <span className="text-muted-foreground">Автор:</span>
                      <span className="ml-2">{exchange.book_author}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Владелец:</span>
                      <span className="ml-2">{exchange.owner_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Статус:</span>
                      <Badge variant={getStatusBadgeVariant(exchange.status)}>
                        {getStatusText(exchange.status)}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Запрошено:</span>
                      <span className="ml-2">
                        {new Date(exchange.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex gap-2 flex-wrap">
                    <Button asChild variant="outline" className="mb-2">
                      <Link to={`/books/${exchange.book_id}`}>Просмотр книги</Link>
                    </Button>
                    {exchange.status === 'ожидает' && (
                      <Button
                        variant="destructive"
                        onClick={() => handleUpdateExchange(exchange.id, 'отменено')}
                        className="mb-2"
                      >
                        Отменить запрос
                      </Button>
                    )}
                    {exchange.status === 'принято' && (
                      <div className="text-green-600 mt-2">
                        Свяжитесь с владельцем для завершения обмена
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExchangeRequests;
