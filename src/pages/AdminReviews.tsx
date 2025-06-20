import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { API } from '@/config/api-endpoints';
import { Button } from '@/components/ui/button';
import ImageViewerModal from '@/components/ImageViewerModal';
import CoverImage from '@/components/CoverImage';
import {Link, useSearchParams} from 'react-router-dom';

type ModerationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface Review {
  id: number;
  comment: string;
  rating: number;
  imageUrls: string[];
  toUser: { id: number; name: string };
  listing: { id: number; book: { title: string; author: string; imageUrl: string } };
}

const AdminReviews: React.FC = () => {
  const [status, setStatus] = useState<ModerationStatus>('PENDING');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
const [userRatings, setUserRatings] = useState<Record<number, number>>({});
const [searchParams] = useSearchParams();
const initialListingId = searchParams.get('listingId') || '';
const [listingId, setListingId] = useState(initialListingId);

  const loadReviews = async () => {
    try {
      const res = await api.get('/api/reviews/moderation', {
        params: {
          status,
          page: 0,
          size: 1000,
        },
      });
      let result = res.data.content as Review[];
      if (listingId.trim()) {
        result = result.filter(r => r.listing?.id?.toString() === listingId.trim());
      }
      setReviews(result);

      const uniqueUserIds = [...new Set(result.map(r => r.toUser.id))];
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

    } catch (err) {
      console.error('Ошибка при загрузке отзывов', err);
    }

  };

  useEffect(() => {
    loadReviews();
  }, [status]);


  return (
    <div className="space-y-6">
      {/* фильтры */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ModerationStatus)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="PENDING">Ожидают</option>
          <option value="APPROVED">Одобренные</option>
          <option value="REJECTED">Отклонённые</option>
        </select>
        <input
          placeholder="ID объявления"
          value={listingId}
          onChange={(e) => setListingId(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />
        <Button onClick={loadReviews}>Применить</Button>
      </div>

      {/* список отзывов */}
      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="border rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-start gap-4">
              {/* инфо по объявлению */}
              <Link to={`/books/${r.listing.id}`} className="flex gap-4 hover:opacity-80 transition">
                <CoverImage
                  src={r.listing.book.imageUrl}
                  className="w-16 h-24 object-cover rounded"
                />
                <div>
                  <div className="font-semibold">{r.listing.book.title}</div>
                  <div className="text-sm text-muted-foreground">{r.listing.book.author}</div>
                  <div className="text-xs text-muted-foreground">Объявление #{r.listing.id}</div>
                </div>
              </Link>

              {/* пользователь */}
              <Link
                to={`/profile/${r.toUser.id}`}
                className="text-sm text-right text-blue-600 hover:underline"
              >
                👤 {r.toUser.name}
                <div className="text-xs text-muted-foreground">
                  ⭐ {userRatings[r.toUser.id]?.toFixed(2) ?? '–'}
                </div>
                ID: {r.toUser.id}
              </Link>

            </div>

            <div className="text-sm">
              <div className="font-medium">Комментарий:</div>
              <div>{r.comment}</div>
              <div className="mt-1 text-muted-foreground">Оценка: <strong>{r.rating}</strong></div>
            </div>

            {r.imageUrls.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {r.imageUrls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    className="w-20 h-20 object-cover rounded cursor-pointer"
                    onClick={() => {
                      setViewerImages(r.imageUrls);
                      setViewerIndex(i);
                      setViewerOpen(true);
                    }}
                  />
                ))}
              </div>
            )}

            {/* кнопки */}
            {status === 'PENDING' && (
              <div className="flex gap-4 mt-3">
                <Button
                  onClick={async () => {
                    await api.patch(`/api/reviews/${r.id}/approve`);
                    loadReviews();
                  }}
                >
                  Одобрить
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    await api.patch(`/api/reviews/${r.id}/reject`);
                    loadReviews();
                  }}
                >
                  Отклонить
                </Button>
              </div>
            )}
            {status === 'REJECTED' && (
  <div className="mt-3">
    <Button
      variant="destructive"
      onClick={async () => {
        try {
            await api.delete(`/api/reviews/${r.id}`);
            loadReviews();
          } catch {
            alert('Ошибка при удалении отзыва');
          }
      }}
    >
      Удалить
    </Button>
  </div>
)}
          </div>
        ))}
      </div>

      {/* просмотр изображений */}
      <ImageViewerModal
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        images={viewerImages}
        initialIndex={viewerIndex}
      />
    </div>
  );
};

export default AdminReviews;
