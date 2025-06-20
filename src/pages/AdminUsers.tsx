import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {Link, useNavigate} from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface User {
  id: number;
  name: string;
  avatarUrl?: string;
  city?: { name: string };
  role: string;
  isBanned: boolean;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchName, setSearchName] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [hasComplaintsOnly, setHasComplaintsOnly] = useState(false);

  const [complaintUserIds, setComplaintUserIds] = useState<Set<number>>(new Set());

  const [ratings, setRatings] = useState<Record<number, number>>({});

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get('/api/reviews/complaints', {
          params: { reviewed: false, page: 0, size: 100 },
        });
        const ids = res.data.content.map((c: any) => c.toUser?.id).filter(Boolean);
        setComplaintUserIds(new Set(ids));
      } catch {
        console.warn('Не удалось загрузить жалобы');
      }
    };
    fetchComplaints();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/api/auth/users');
        setUsers(res.data);

        const ratingMap: Record<number, number> = {};
        await Promise.all(
          res.data.map(async (u: any) => {
            try {
              const r = await api.get(`/api/reviews/user/${u.id}/rating`);
              ratingMap[u.id] = r.data;
            } catch {
              ratingMap[u.id] = 0;
            }
          })
        );
        setRatings(ratingMap);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleBanToggle = async (user: User) => {
    try {
      if (user.isBanned) {
        await api.post(`/api/auth/unban/${user.id}`);
      } else {
        await api.post(`/api/auth/ban/${user.id}`);
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isBanned: !user.isBanned } : u))
      );
    } catch {
      alert('Ошибка при обновлении блокировки');
    }
  };

  const handleChangeRole = async (user: User) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await api.patch(`/api/auth/role/${user.id}`, {
        role: newRole.toUpperCase(),
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
      );
    } catch {
      alert('Ошибка при смене роли');
    }
  };

  if (loading) {
    return <div className="p-6 text-muted-foreground">Загрузка...</div>;
  }

  const filteredUsers = users.filter(user => {
    const nameMatch = user.name.toLowerCase().includes(searchName.toLowerCase());
    const cityMatch = user.city?.name?.toLowerCase().includes(searchCity.toLowerCase()) ?? false;
    const roleMatch = roleFilter === 'all' || user.role.toLowerCase() === roleFilter;
    const complaintMatch = !hasComplaintsOnly || complaintUserIds.has(user.id);
    return nameMatch && cityMatch && roleMatch && complaintMatch;
  });


  return (
    <div className="space-y-4">
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Поиск по имени"
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Поиск по городу"
            value={searchCity}
            onChange={e => setSearchCity(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value as 'all' | 'user' | 'admin')}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="all">Все роли</option>
            <option value="user">USER</option>
            <option value="admin">ADMIN</option>
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={hasComplaintsOnly}
              onChange={e => setHasComplaintsOnly(e.target.checked)}
            />
            Только с жалобами
          </label>
        </div>
      </div>

      {filteredUsers.map((user) => (
        <Card key={user.id} className="p-4 flex items-start gap-4 justify-between">
          <div className="flex items-center gap-4">
            <img
              src={user.avatarUrl || '/default-avatar.jpg'}
              alt="avatar"
              className="w-14 h-14 rounded-full object-cover border"
            />
            <div>
              <div className="font-semibold text-base">{user.name} г. {user.city?.name || '—'}</div>
              <div className="text-sm text-muted-foreground">ID: {user.id}</div>
              <div className="text-sm text-muted-foreground">
                Рейтинг: {ratings[user.id]?.toFixed(2) ?? '—'}
              </div>

            </div>
          </div>
          <div className="flex gap-2 flex-wrap justify-between w-full">
            <div className="flex items-center gap-2">
              {complaintUserIds.has(user.id) ? (
                <Link
                  to={`/admin/complaints?toUser=${encodeURIComponent(user.name)}`}
                  className="px-4 py-1 rounded-full text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition"
                >
                  Есть жалобы
                </Link>
              ) : (
                <div className="px-4 py-1 rounded-full text-sm font-semibold bg-sky-500 text-white">
                  Жалоб нет
                </div>
              )}
            <Button
              variant="outline"
              onClick={() => navigate(`/profile/${user.id}`)}
            >
              Посмотреть профиль
            </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
              variant={user.isBanned ? 'default' : 'destructive'}
              onClick={() => handleBanToggle(user)}
            >
              {user.isBanned ? 'Разблокировать' : 'Заблокировать'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleChangeRole(user)}
            >
              {user.role.toLowerCase() === 'admin' ? 'Сделать USER' : 'Сделать ADMIN'}
            </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AdminUsers;
