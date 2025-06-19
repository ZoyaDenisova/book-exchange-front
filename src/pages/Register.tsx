import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { API } from '../config/api-endpoints';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface City {
  id: number;
  name: string;
  region: string;
  country: string;
}

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [cityOptions, setCityOptions] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCitySearch = async (query: string) => {
    setCitySearch(query);
    try {
      if (query.length < 2) {
        setCityOptions([]);
        return;
      }
      const res = await api.get('/api/listings/cities/search', {
        params: { query }  // 🔧 фикс: был name
      });
      console.log('Список городов:', res.data);
      setCityOptions(res.data);
    } catch {
      setCityOptions([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedCity) {
      setError('Выберите город из списка');
      return;
    }
    try {
      const res = await api.post(API.AUTH.REGISTER, {
        name,
        email,
        password,
        cityId: selectedCity.id
      });
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch {
      setError('Регистрация не удалась. Пожалуйста, попробуйте другой email.');
    }
  };

  // 👇 перенесён сюда, чтобы не нарушать JSX
  console.log("Список городов:", cityOptions);

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
          <form onSubmit={handleSubmit} className="space-y-6 relative">
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input
                id="name"
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
            <div className="space-y-2">
              <Label htmlFor="city">Город</Label>
              <Input
                id="city"
                value={citySearch}
                onChange={(e) => handleCitySearch(e.target.value)}
                placeholder="Начните вводить название..."
                required
              />
              {cityOptions.length > 0 && (
                <div className="absolute w-full z-10 mt-1 border rounded-md bg-white shadow max-h-40 overflow-y-auto">
                  {cityOptions.map((city) => (
                    <div
                      key={city.id}
                      onClick={() => {
                        setSelectedCity(city);
                        setCitySearch(`${city.name}, ${city.region}`);
                        setCityOptions([]);
                      }}
                      className="px-4 py-2 hover:bg-accent cursor-pointer"
                    >
                      {city.name}, {city.region}
                    </div>
                  ))}
                </div>
              )}
              {selectedCity && (
                <div className="text-sm text-muted-foreground">
                  Выбран: {selectedCity.name}, {selectedCity.region}
                </div>
              )}
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
