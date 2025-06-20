import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Button } from '@/components/ui/button';
import ImageViewerModal from '@/components/ImageViewerModal';
import CoverImage from '@/components/CoverImage';
import {Link, useSearchParams} from 'react-router-dom';

interface Complaint {
  id: number;
  comment: string;
  createdAt: string;
  isReviewed: boolean;
  imageUrls: string[];
  listing: {
    id: number;
    book: { title: string; author: string; imageUrl: string };
  };
  fromUser: { id: number; name: string };
  toUser: { id: number; name: string };
}

const AdminComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [reviewed, setReviewed] = useState(false);
  const [userRatings, setUserRatings] = useState<Record<number, number>>({});
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
const [searchParams] = useSearchParams();
const initialListingId = searchParams.get('listingId') || '';
const [listingId, setListingId] = useState(initialListingId);
const [userBans, setUserBans] = useState<Record<number, boolean>>({});
const [listingBans, setListingBans] = useState<Record<number, boolean>>({});

  const loadComplaints = async () => {
    try {
      const res = await api.get('/api/reviews/complaints', {
        params: { reviewed, page: 0, size: 100 },
      });

      let result = res.data.content as Complaint[];
      if (listingId.trim()) {
        result = result.filter((r) => r.listing?.id?.toString() === listingId.trim());
      }
      setComplaints(result);

      // собрать всех юзеров и загрузить рейтинги
      const allUsers = result.flatMap(r => [r.fromUser.id, r.toUser.id]);
      const uniqueUserIds = [...new Set(allUsers)];
      const ratings: Record<number, number> = {};

      await Promise.all(
        uniqueUserIds.map(async (userId) => {
          try {
            const res = await api.get(`/api/reviews/user/${userId}/rating`);
            ratings[userId] = res.data;
          } catch {
            ratings[userId] = 0;
          }
        })
      );
      setUserRatings(ratings);

      const userStatus: Record<number, boolean> = {};
const listingStatus: Record<number, boolean> = {};

await Promise.all(
  complaints.map(async (c) => {
    try {
      const userRes = await api.get(`/api/auth/users/${c.toUser.id}`);
      userStatus[c.toUser.id] = userRes.data.isBanned;
    } catch {
      userStatus[c.toUser.id] = false;
    }

    try {
      const listingRes = await api.get(`/api/listings/${c.listing.id}`);
      listingStatus[c.listing.id] = listingRes.data.isBlocked;
    } catch {
      listingStatus[c.listing.id] = false;
    }
  })
);

setUserBans(userStatus);
setListingBans(listingStatus);
    } catch (err) {
      console.error('Ошибка при загрузке жалоб', err);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [reviewed]);

  return (
    <div className="space-y-6">
      {/* фильтры */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          value={reviewed ? 'true' : 'false'}
          onChange={(e) => setReviewed(e.target.value === 'true')}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="false">Непросмотренные</option>
          <option value="true">Просмотренные</option>
        </select>
        <input
          placeholder="ID объявления"
          value={listingId}
          onChange={(e) => setListingId(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />
        <Button onClick={loadComplaints}>Применить</Button>
      </div>

      {/* список жалоб */}
      <div className="space-y-4">
        {complaints.map((c) => (
          <div key={c.id} className="border rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-start gap-4">
              {/* инфо по объявлению */}
              <Link to={`/books/${c.listing.id}`} className="flex gap-4 hover:opacity-80 transition">
                <CoverImage
                  src={c.listing.book.imageUrl}
                  className="w-16 h-24 object-cover rounded"
                />
                <div>
                  <div className="font-semibold">{c.listing.book.title}</div>
                  <div className="text-sm text-muted-foreground">{c.listing.book.author}</div>
                  <div className="text-xs text-muted-foreground">Объявление #{c.listing.id}</div>
                </div>
              </Link>

              {/* статус */}
              <div className={`px-3 py-1 text-sm rounded-full font-medium text-white ${c.isReviewed ? 'bg-green-600' : 'bg-red-600'}`}>
                {c.isReviewed ? 'Просмотрено' : 'Непросмотрено'}
              </div>
            </div>

            <div className="text-sm">
              <div className="font-medium">Комментарий:</div>
              <div>{c.comment}</div>
              <div className="mt-1 text-muted-foreground text-xs">
                Дата: {new Date(c.createdAt).toLocaleString()}
              </div>
            </div>

            {c.imageUrls.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {c.imageUrls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    className="w-20 h-20 object-cover rounded cursor-pointer"
                    onClick={() => {
                      setViewerImages(c.imageUrls);
                      setViewerIndex(i);
                      setViewerOpen(true);
                    }}
                  />
                ))}
              </div>
            )}

            {/* отправитель и получатель */}
            <div className="text-sm flex flex-col gap-1 mt-2">
              <Link
                to={`/profile/${c.fromUser.id}`}
                className="text-blue-600 hover:underline"
              >
                От: {c.fromUser.name} (⭐ {userRatings[c.fromUser.id]?.toFixed(2) ?? '–'})
              </Link>
              <Link
                to={`/profile/${c.toUser.id}`}
                className="text-blue-600 hover:underline"
              >
                На: {c.toUser.name} (⭐ {userRatings[c.toUser.id]?.toFixed(2) ?? '–'})
              </Link>
            </div>

            {!c.isReviewed && (
              <div className="mt-3 flex gap-2">
                <Button
                  onClick={async () => {
                    await api.patch(`/api/reviews/complaint/${c.id}/reviewed`);
                    loadComplaints();
                  }}
                >
                  Пометить как просмотренное
                </Button>
                <Button
  variant={userBans[c.toUser.id] ? 'default' : 'destructive'}
  onClick={async () => {
    const banned = userBans[c.toUser.id];
    try {
        await api.post(`/api/auth/${banned ? 'unban' : 'ban'}/${c.toUser.id}`);
        loadComplaints();
      } catch {
        alert('Ошибка при обновлении блокировки пользователя');
      }
  }}
>
  {userBans[c.toUser.id] ? 'Разблокировать' : 'Заблокировать'}
</Button>
               <Button
  variant={listingBans[c.listing.id] ? 'default' : 'destructive'}
  onClick={async () => {
    const banned = listingBans[c.listing.id];
    try {
        await api.patch(`/api/listings/${c.listing.id}/${banned ? 'unblock' : 'block'}`);
        loadComplaints();
      } catch {
        alert('Ошибка при обновлении блокировки объявления');
      }
  }}
>
  {listingBans[c.listing.id] ? 'Разблокировать объявление' : 'Заблокировать объявление'}
</Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <ImageViewerModal
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        images={viewerImages}
        initialIndex={viewerIndex}
      />
    </div>
  );
};

export default AdminComplaints;
