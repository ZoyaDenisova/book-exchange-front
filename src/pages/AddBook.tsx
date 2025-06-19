import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { API } from '../config/api-endpoints';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Category {
  id: number;
  name: string;
}

const AddBook: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchCategories = async () => {
      try {
        const response = await api.get(API.CATEGORIES.LIST);
        setCategories(response.data);
        if (response.data.length > 0) {
          setCategoryId(response.data[0].id);
        }
      } catch (err) {
        console.error('Не удалось загрузить категории:', err);
        setError('Не удалось загрузить категории. Пожалуйста, попробуйте позже.');
      }
    };

    fetchCategories();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (success) {
      timer = setTimeout(() => {
        navigate('/books');
      }, 2000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [success, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      await api.post(API.BOOKS.LIST, {
        title,
        author,
        description,
        category_id: categoryId,
      });

      setSuccess('Книга успешно добавлена!');

      setTitle('');
      setAuthor('');
      setDescription('');

    } catch (err) {
      console.error('Не удалось добавить книгу:', err);
      setError('Не удалось добавить книгу. Пожалуйста, попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center py-8 px-4">
      <Card className="w-full max-w-lg shadow-lg border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Добавить новую книгу</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert variant="default" className="mb-4">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Название</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Автор</Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Категория</Label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                required
                disabled={loading}
                className="block w-full border rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Добавление...' : 'Добавить книгу'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddBook;
