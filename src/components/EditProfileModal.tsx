import {API} from "@/config/api-endpoints.ts";
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import api from '@/services/api';
import type { UserDto } from '@/types/dto';

interface Props {
  open: boolean;
  onClose: () => void;
  user: UserDto;
  onUpdated: (u: UserDto) => void;
}

const EditProfileModal: React.FC<Props> = ({ open, onClose, user, onUpdated }) => {
  const [name, setName] = useState(user.name);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [cityQuery, setCityQuery] = useState(user.city.name);
  const [cityOptions, setCityOptions] = useState<{ id: number; name: string }[]>([]);
  const [cityId, setCityId] = useState<number>(user.city.id);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.patch(`/api/auth/me`, { name, cityId });
      onUpdated({
        ...user,
        name,
        city: {
          ...user.city,
          id: cityId,
          name: cityQuery,
        },
      });
      onClose();
    } catch {
      alert('Ошибка при сохранении');
    } finally {
      setLoading(false);
    }
  };

  const fetchCityOptions = async (query: string) => {
    if (!query) return;
    const res = await api.get(API.LISTINGS.SEARCH_CITIES, { params: { query } });
    setCityOptions(res.data);
  };

  const handleChangePassword = async () => {
    if (!password || !newPassword) return alert('Заполни оба поля!');
    setLoading(true);
    try {
      await api.patch('/api/auth/password', { oldPassword: password, newPassword });
      alert('Пароль обновлён');
      setPassword('');
      setNewPassword('');
    } catch {
      alert('Ошибка при смене пароля');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Редактирование профиля</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Имя</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1">
          <Label className="block mb-2">Город*</Label>
          <Input
            value={cityQuery}
            onChange={(e) => {
              setCityQuery(e.target.value);
              fetchCityOptions(e.target.value);
            }}
            onBlur={() => setTimeout(() => setCityOptions([]), 150)}
          />
          {cityOptions.length > 0 && (
            <div className="absolute w-full z-10 mt-1 border rounded-md bg-white shadow max-h-40 overflow-y-auto">
              {cityOptions.map((city) => (
                <div
                  key={city.id}
                  onClick={() => {
                    setCityId(city.id);
                    setCityQuery(city.name);
                    setCityOptions([]);
                  }}
                  className="px-4 py-2 hover:bg-accent cursor-pointer"
                >
                  {city.name}
                </div>
              ))}
            </div>
          )}
        </div>

          <Button onClick={handleSave} disabled={loading}>Сохранить</Button>

          <hr className="my-4" />

          <div className="space-y-1">
            <Label>Старый пароль</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Новый пароль</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>

          <Button variant="secondary" onClick={handleChangePassword} disabled={loading}>
            Сменить пароль
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
