import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { API } from '../config/api-endpoints';
import type { Book } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

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

interface Category {
  id: number;
  name: string;
}

const BookList: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number>(0); // 0 — «все»
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Параллельно грузим книги и категории
    Promise.all([
      api.get(API.BOOKS.LIST),
      api.get(API.CATEGORIES.LIST),
    ])
      .then(([booksRes, catsRes]) => {
        setBooks(booksRes.data);
        setCategories(catsRes.data);
      })
      .catch(() => {
        setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
      })
      .finally(() => setLoading(false));
  }, []);

  // Фильтрация книг сразу по статусу и категории
  const filteredBooks = books
    .filter(book => book.status !== 'Зарезервировано')
    .filter(book =>
      selectedCategory === 0
        ? true
        : book.category_id === selectedCategory
    );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <span className="text-muted-foreground text-lg">Загрузка списка книг...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Повторить попытку
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-4xl space-y-6">
        <h2 className="text-2xl font-bold">Доступные книги</h2>

        {/* Фильтр по категории */}
        <div className="flex items-center gap-4">
          <Label htmlFor="categoryFilter">Категория:</Label>
          <select
            id="categoryFilter"
            value={selectedCategory}
            onChange={e => setSelectedCategory(Number(e.target.value))}
            className="block w-60 border rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value={0}>— Все категории —</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {filteredBooks.length === 0 ? (
          <p className="text-muted-foreground text-center">Нет доступных книг.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredBooks.map(book => (
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
                <div className="p-4 pt-0 flex">
                  <Button
                    className="w-full"
                    variant="default"
                    onClick={() => navigate(`/books/${book.id}`)}
                  >
                    Подробнее
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

export default BookList;
