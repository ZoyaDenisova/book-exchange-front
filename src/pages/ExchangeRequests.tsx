import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import CoverImage from '@/components/CoverImage';
import { Link } from 'react-router-dom';

type Status = 'PENDING' | 'APPROVED' | 'REJECTED';

interface Listing {
  id: number;
  book: { title: string; author: string; imageUrl: string };
  condition: string;
}

interface User {
  id: number;
  name: string;
  avatarUrl: string
}

interface ExchangeDto {
  id: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  completedAt?: string;
  sender: User;
  receiver: User;
  offeredListing: Listing;
  selectedListing: Listing;
  senderConfirmedCompletion: boolean;
  receiverConfirmedCompletion: boolean;
}


const ExchangeRequests: React.FC = () => {
  const [status, setStatus] = useState<Status>('PENDING');
  const [userFilter, setUserFilter] = useState('');
  const [bookFilter, setBookFilter] = useState('');
  const [requests, setRequests] = useState<ExchangeDto[]>([]);
  const [ratings, setRatings] = useState<Record<number, number>>({});

  const loadRequests = async () => {
    try {
      const res = await api.get('/api/exchange', {
        params: { status, page: 0, size: 1000 },
      });
      let items = res.data.content as ExchangeDto[];

      if (userFilter.trim()) {
        items = items.filter(r =>
          r.sender.name.toLowerCase().includes(userFilter.trim().toLowerCase())
        );
      }
      if (bookFilter.trim()) {
        items = items.filter(r =>
          r.selectedListing.book.title.toLowerCase().includes(bookFilter.trim().toLowerCase()) ||
          r.offeredListing.book.title.toLowerCase().includes(bookFilter.trim().toLowerCase())
        );
      }

      setRequests(items);

      const uids = [...new Set(items.map(r => r.sender.id))];
      const ratingMap: Record<number, number> = {};

      await Promise.all(uids.map(async uid => {
        try {
          const res = await api.get(`/api/reviews/user/${uid}/rating`);
          ratingMap[uid] = res.data;
        } catch {
          ratingMap[uid] = 0;
        }
      }));

      setRatings(ratingMap);
    } catch (err) {
      console.error('Ошибка при загрузке запросов обмена', err);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [status]);

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6">
      {/* фильтры */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Status)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="PENDING">Ожидают</option>
          <option value="APPROVED">Одобренные</option>
          <option value="REJECTED">Отклонённые</option>
        </select>
        <input
          placeholder="Пользователь"
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />
        <input
          placeholder="Книга"
          value={bookFilter}
          onChange={(e) => setBookFilter(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />
        <Button onClick={loadRequests}>Применить</Button>
      </div>

      {/* список */}
      <div className="space-y-4">
        {requests.map(r => (
          <div key={r.id} className="border rounded-xl p-4 space-y-2">
            <div className="flex gap-4">
              {/* offered */}
              <div className="flex-1">
                <div className="text-sm font-medium mb-1 text-muted-foreground">Предлагается</div>
                <div className="flex gap-3">
                  <CoverImage
                    src={r.offeredListing.book.imageUrl}
                    className="w-16 h-24 object-cover rounded"
                  />
                  <div>
                    <div className="font-semibold">{r.offeredListing.book.title}</div>
                    <div className="text-sm text-muted-foreground">{r.offeredListing.book.author}</div>
                    <div className="text-xs">ID: {r.offeredListing.id}</div>
                  </div>
                </div>
              </div>

              {/* за что предлагают */}
              <div className="flex-1">
                <div className="text-sm font-medium mb-1 text-muted-foreground">За</div>
                <div className="flex gap-3">
                  <CoverImage
                    src={r.selectedListing.book.imageUrl}
                    className="w-16 h-24 object-cover rounded"
                  />
                  <div>
                    <div className="font-semibold">{r.selectedListing.book.title}</div>
                    <div className="text-sm text-muted-foreground">{r.selectedListing.book.author}</div>
                    <div className="text-xs">ID: {r.selectedListing.id}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* кто предлагает */}
            <div className="text-sm mt-2">
              <span className="text-muted-foreground">От пользователя: </span>
              <Link to={`/profile/${r.sender.id}`} className="flex gap-2 items-center">
                <img
                  src={r.sender.avatarUrl || '/default-avatar.jpg'}
                  alt="avatar"
                  className="w-6 h-6 rounded-full hover:opacity-80 transition"
                />{r.sender.name}
              </Link>
              <span className="text-muted-foreground">Рейтинг {ratings[r.sender.id]?.toFixed(2) ?? '—'}</span>
            </div>

            <div className="text-xs text-muted-foreground">Создано: {new Date(r.createdAt).toLocaleString()}</div>

            <div className="flex gap-3 mt-3">
            {status === 'PENDING' && (
              <Button
                onClick={async () => {
                  await api.patch(`/api/exchange/${r.id}/approve`);
                  loadRequests();
                }}
              >
                Принять
              </Button>
            )}
            {status === 'PENDING' && (
              <Button
                variant="destructive"
                onClick={async () => {
                  await api.patch(`/api/exchange/${r.id}/reject`);
                  loadRequests();
                }}
              >
                Отклонить
              </Button>
            )}
          </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default ExchangeRequests;
