import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { API } from '../config/api-endpoints';
import type { Book } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

type BadgeVariant = 'secondary' | 'outline' | 'default' | 'destructive';

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

const MyBooks: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(API.BOOKS.USER_BOOKS);
        setBooks(response.data);
      } catch {
        setError('Не удалось загрузить ваши книги. Пожалуйста, войдите в систему и попробуйте снова.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyBooks();
  }, []);

  const handleDeleteBook = async (bookId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту книгу?')) {
      try {
        await api.delete(`${API.BOOKS.DETAIL(bookId)}`);
        setBooks(books.filter(book => book.id !== bookId));
      } catch {
        alert('Не удалось удалить книгу. Пожалуйста, попробуйте снова.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <span className="text-muted-foreground text-lg">Загрузка ваших книг...</span>
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
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-3">
          <h2 className="text-2xl font-bold">Мои книги</h2>
          <Button asChild>
            <Link to="/books/add">Добавить новую книгу</Link>
          </Button>
        </div>
        {books.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16">
            <p className="text-muted-foreground">Вы еще не добавили ни одной книги.</p>
            <Button asChild>
              <Link to="/books/add">Добавить первую книгу</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {books.map(book => (
              <Card key={book.id} className="flex flex-col justify-between h-full border shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{book.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 flex-1">
                  <div>
                    <span className="text-muted-foreground">Автор:</span>
                    <span className="ml-2">{book.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Статус:</span>
                    <Badge variant={getBookStatusBadgeVariant(book.status)}>
                      {book.status}
                    </Badge>
                  </div>
                </CardContent>
                <div className="p-4 pt-0 flex gap-2">
                  <Button asChild variant="outline" className="flex-1">
                    <Link to={`/books/${book.id}`}>Просмотр</Link>
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleDeleteBook(book.id)}
                  >
                    Удалить
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBooks;
