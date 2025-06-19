import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { API } from '../config/api-endpoints';
import type { User } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<{ name: string; email: string }>({ name: '', email: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(API.AUTH.PROFILE);
        setUser(response.data);
        setForm({ name: response.data.name, email: response.data.email });
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Не удалось загрузить профиль. Пожалуйста, войдите заново.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.put(API.AUTH.PROFILE, form);
      setUser(response.data);
      setEditMode(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Ошибка при обновлении профиля');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <span className="text-muted-foreground text-lg">Загрузка профиля...</span>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>{error || 'Пользователь не найден. Пожалуйста, войдите заново.'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-8 px-4">
      <Card className="w-full max-w-md shadow-lg border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Профиль</CardTitle>
        </CardHeader>
        <CardContent>
          {editMode ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Имя</Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  type="email"
                />
              </div>
              <div className="flex gap-4 justify-end pt-4">
                <Button type="submit" className="w-28">Сохранить</Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-28"
                  onClick={() => setEditMode(false)}
                >
                  Отмена
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <span className="text-muted-foreground">Имя:</span>
                <span className="ml-2 font-medium">{user.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <span className="ml-2 font-medium">{user.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Роль:</span>
                <span className="ml-2 font-medium">{user.role}</span>
              </div>
              <Button className="mt-6 w-full" onClick={() => setEditMode(true)}>
                Редактировать
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
