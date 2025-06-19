import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { API } from '../config/api-endpoints';
import type { Book, User, Exchange } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

// Варианты badge строго по shadcn/ui дефолту
type BadgeVariant = 'secondary' | 'outline' | 'default' | 'destructive';

// Маппинг статусов книги -> variant
function getBookStatusBadgeVariant(status: string): BadgeVariant {
  switch (status.toLowerCase()) {
    case 'доступно':
      return 'default';
    case 'зарезервировано':
      return 'secondary';
    case 'обменено':
      return 'outline';
    default:
      return 'secondary';
  }
}

// Маппинг статусов обмена -> variant
function getExchangeBadgeVariant(status: string | null): BadgeVariant {
  switch (status) {
    case 'ожидает':
    case 'отменено':
      return 'secondary';
    case 'принято':
      return 'default';
    case 'отклонено':
      return 'destructive';
    case 'завершено':
      return 'outline';
    default:
      return 'secondary';
  }
}

// Русский текст для exchange status
const exchangeStatusText: Record<string, string> = {
  'ожидает': 'Ожидает ответа',
  'принято': 'Принято',
  'отклонено': 'Отклонено',
  'завершено': 'Обмен завершен',
  'отменено': 'Отменено',
};

interface BookWithOwner extends Book {
  owner?: User;
}

const BookDetail: React.FC = () => {
  const { id } = useParams();
  const [book, setBook] = useState<BookWithOwner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exchangeStatus, setExchangeStatus] = useState<string | null>(null);
  const [exchangeId, setExchangeId] = useState<number | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  // Получаем ID текущего пользователя
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get(API.AUTH.PROFILE);
        setUserId(response.data.id);
      } catch {}
    };

    fetchUserProfile();
  }, []);

  // Получаем детали книги
  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(API.BOOKS.DETAIL(id!));
        setBook(response.data);
      } catch {
        setError('Не удалось загрузить информацию о книге. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBookDetails();
    }
  }, [id]);

  // Проверяем существующие запросы на обмен
  useEffect(() => {
    const checkExchangeStatus = async () => {
      if (!book || !userId) return;

      try {
        const response = await api.get(`${API.EXCHANGES.USER_EXCHANGES}`);
        const bookExchanges = response.data.filter((exchange: Exchange) =>
          exchange.book_id === book.id && exchange.requester_id === userId
        );

        if (bookExchanges.length > 0) {
          setExchangeStatus(bookExchanges[0].status);
          setExchangeId(bookExchanges[0].id);
        }
      } catch {}
    };

    checkExchangeStatus();
  }, [book, userId]);

  const handleDeleteBook = async (bookId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту книгу?')) return;

    try {
      await api.delete(API.BOOKS.DETAIL(bookId));
      window.location.href = '/books';
    } catch {
      alert('Не удалось удалить книгу. Попробуйте позже.');
    }
  };

  const handleExchangeRequest = async () => {
    if (!book || !userId) return;

    try {
      setIsRequesting(true);
      const response = await api.post(API.EXCHANGES.LIST, {
        book_id: book.id,
      });

      setExchangeStatus('ожидает');
      setExchangeId(response.data.id);
    } catch {
      alert('Не удалось запросить обмен. Пожалуйста, попробуйте снова.');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleCancelExchange = async () => {
    if (!exchangeId) return;

    try {
      setIsRequesting(true);
      await api.put(`${API.EXCHANGES.DETAIL(exchangeId)}`, { status: 'отменено' });
      setExchangeStatus('отменено');
      if (book) {
        setBook({
          ...book,
          status: 'Доступно',
        });
      }
      setTimeout(() => {
        setExchangeStatus(null);
        setExchangeId(null);
      }, 2000);
    } catch {
      alert('Не удалось отменить запрос. Пожалуйста, попробуйте снова.');
    } finally {
      setIsRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <span className="text-muted-foreground text-lg">Загрузка информации о книге...</span>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error || 'Книга не найдена'}</AlertDescription>
        </Alert>
        <Button asChild variant="outline">
          <Link to="/books">Вернуться к списку книг</Link>
        </Button>
      </div>
    );
  }

  const isOwnBook = userId === book.owner_id;

  return (
    <div className="flex justify-center py-8 px-4">
      <Card className="w-full max-w-2xl shadow-lg border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">{book.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <div>
              <span className="text-muted-foreground">Автор:</span>
              <span className="ml-2 font-medium">{book.author}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Описание:</span>
              <span className="ml-2">{book.description}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Статус:</span>
              <Badge variant={getBookStatusBadgeVariant(book.status)}>
                {book.status}
              </Badge>
            </div>
            {book.owner && (
              <div>
                <span className="text-muted-foreground">Владелец:</span>
                <span className="ml-2">{book.owner.name}</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <Button asChild variant="outline">
              <Link to="/books">Вернуться к списку книг</Link>
            </Button>
            {!isOwnBook && book.status === 'Доступно' && !exchangeStatus && (
              <Button
                onClick={handleExchangeRequest}
                disabled={isRequesting}
                className="min-w-[160px]"
              >
                {isRequesting ? 'Отправка запроса...' : 'Запросить обмен'}
              </Button>
            )}

            {exchangeStatus && (
              <div className="flex flex-col gap-2 self-center">
                <Badge variant={getExchangeBadgeVariant(exchangeStatus)}>
                  Статус обмена: {exchangeStatusText[exchangeStatus] || exchangeStatus}
                </Badge>
                {exchangeStatus === 'ожидает' && (
                  <Button
                    variant="destructive"
                    onClick={handleCancelExchange}
                    disabled={isRequesting}
                    className="min-w-[160px]"
                  >
                    {isRequesting ? 'Отмена...' : 'Отменить запрос'}
                  </Button>
                )}
                {exchangeStatus === 'принято' && (
                  <span className="text-green-600">Свяжитесь с владельцем для завершения обмена</span>
                )}
              </div>
            )}

            {isOwnBook && (
              <>
                <Button asChild variant="default">
                  <Link to={`/books/edit/${book.id}`}>Редактировать книгу</Link>
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteBook(book.id)}
                >
                  Удалить
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookDetail;
