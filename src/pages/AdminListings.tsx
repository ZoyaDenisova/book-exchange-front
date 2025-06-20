import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Button } from '@/components/ui/button';
import CoverImage from '@/components/CoverImage';
import { Link } from 'react-router-dom';

interface Listing {
  id: number;
  isBlocked: boolean;
  isOpen: boolean;
  imageUrls: string[];
  condition: string;
  city: { name: string };
  owner: { id: number; name: string };
  book: { title: string; author: string; imageUrl: string };
}

const AdminListings: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [status, setStatus] = useState<'blocked' | 'unblocked'>('unblocked');
  const [searchUser, setSearchUser] = useState('');
  const [searchBook, setSearchBook] = useState('');
  const [searchCity, setSearchCity] = useState('');

  const loadListings = async () => {
    try {
      const res = await api.post('/api/listings/filter?page=0&size=100', {
        title: searchBook || undefined,
        author: undefined,
        cityId: undefined,
        condition: undefined,
        isBlocked: status === 'blocked',
      });
      const raw = res.data.content as Listing[];

      const filtered = raw.filter((l) =>
        l.owner.name.toLowerCase().includes(searchUser.toLowerCase()) &&
        l.city.name.toLowerCase().includes(searchCity.toLowerCase())
      );

      setListings(filtered);
    } catch (err) {
      console.error('Ошибка при загрузке объявлений', err);
    }
  };

  useEffect(() => {
    loadListings();
  }, [status]);

  const handleToggleBlock = async (l: Listing) => {
    try {
      if (l.isBlocked) {
        await api.patch(`/api/listings/${l.id}/unblock`);
      } else {
        await api.patch(`/api/listings/${l.id}/block`);
      }
      loadListings();
    } catch (err) {
      alert('Ошибка при изменении блокировки');
    }
  };

  return (
    <div className="space-y-6">
      {/* фильтры */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as 'blocked' | 'unblocked')}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="unblocked">Незаблокированные</option>
          <option value="blocked">Заблокированные</option>
        </select>
        <input
          placeholder="Имя пользователя"
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />
        <input
          placeholder="Название книги"
          value={searchBook}
          onChange={(e) => setSearchBook(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />
        <input
          placeholder="Город"
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />
        <Button onClick={loadListings}>Применить</Button>
      </div>

      {/* список */}
      <div className="space-y-4">
        {listings.map((l) => (
          <div key={l.id} className="border rounded-xl p-4 space-y-2">
            <div className="flex gap-4 items-start">
              <CoverImage
                src={l.book.imageUrl}
                className="w-20 h-28 object-cover rounded"
              />
              <div className="flex-1 space-y-1">
                <div className="text-lg font-semibold">{l.book.title}</div>
                <div className="text-sm text-muted-foreground">
                  {l.book.author} • {l.condition}
                </div>
                <div className="text-sm">ID: {l.id}</div>
                <div className="text-sm">
                  Город: {l.city.name}
                </div>
                <div className="text-sm">
                  Владелец: <Link to={`/profile/${l.owner.id}`} className="text-blue-600 hover:underline">{l.owner.name}</Link>
                </div>
                <div className="text-sm">
                  Статус:{' '}
                  <span className={`font-semibold ${l.isBlocked ? 'text-red-600' : 'text-green-600'}`}>
                    {l.isBlocked ? 'Заблокировано' : 'Открыто'}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => handleToggleBlock(l)}
                  variant={l.isBlocked ? 'default' : 'destructive'}
                >
                  {l.isBlocked ? 'Разблокировать' : 'Заблокировать'}
                </Button>
                <Link
                  to={`/admin/reviews?listingId=${l.id}`}
                  className="text-sm underline text-blue-600 text-center"
                >
                  Отзывы
                </Link>
                <Link
                  to={`/admin/complaints?listingId=${l.id}`}
                  className="text-sm underline text-blue-600 text-center"
                >
                  Жалобы
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminListings;
