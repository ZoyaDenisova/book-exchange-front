import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { API } from '../config/api-endpoints';
import type { Book } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EditBook: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [form, setForm] = useState<Partial<Book>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const response = await api.get(API.BOOKS.DETAIL(id!));
                setForm(response.data);
            } catch {
                setError('Не удалось загрузить книгу');
            } finally {
                setLoading(false);
            }
        };

        fetchBook();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put(API.BOOKS.DETAIL(id!), form);
            navigate(`/books/${id}`);
        } catch {
            alert('Ошибка при обновлении книги');
        }
    };

    if (loading) {
        return (
          <div className="flex items-center justify-center min-h-[200px]">
              <span className="text-muted-foreground text-lg">Загрузка...</span>
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
      <div className="flex justify-center py-8 px-4">
          <Card className="w-full max-w-lg shadow-lg border rounded-2xl">
              <CardHeader>
                  <CardTitle className="text-2xl">Редактировать книгу</CardTitle>
              </CardHeader>
              <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                          <Label htmlFor="title">Название</Label>
                          <Input
                            id="title"
                            name="title"
                            value={form.title || ''}
                            onChange={handleChange}
                            required
                            autoFocus
                          />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="author">Автор</Label>
                          <Input
                            id="author"
                            name="author"
                            value={form.author || ''}
                            onChange={handleChange}
                            required
                          />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="description">Описание</Label>
                          <Textarea
                            id="description"
                            name="description"
                            value={form.description || ''}
                            onChange={handleChange}
                            rows={4}
                          />
                      </div>
                      <Button type="submit" className="w-full">
                          Сохранить
                      </Button>
                  </form>
              </CardContent>
          </Card>
      </div>
    );
};

export default EditBook;
