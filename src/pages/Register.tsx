import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { API } from '../config/api-endpoints';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const res = await api.post(API.AUTH.REGISTER, { name, email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (error) {
      setError('Регистрация не удалась. Пожалуйста, попробуйте другой email.');
    }
  };

  return (
    <div className="flex justify-center py-12 px-4">
      <Card className="w-full max-w-md shadow-lg border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Регистрация</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full mt-4">
              Зарегистрироваться
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{' '}
            <Link
              to="/login"
              className="underline hover:text-primary font-medium transition-colors"
            >
              Войти
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
