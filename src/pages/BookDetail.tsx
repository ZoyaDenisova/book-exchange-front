import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { API } from '../config/api-endpoints';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ListingDto } from '@/types/dto';
import {cn} from "@/lib/utils.ts";

const CONDITIONS = [
  { value: 'NEW', label: 'Новое' },
  { value: 'LIKE_NEW', label: 'Как новое' },
  { value: 'GOOD', label: 'Хорошее' },
  { value: 'FAIR', label: 'Приемлемое' },
  { value: 'POOR', label: 'Плохое' }
];

const BookDetail: React.FC = () => {
  const { id } = useParams();
  const [listing, setListing] = useState<ListingDto | null>(null);
  const [related, setRelated] = useState<ListingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        const main = await api.get(API.LISTINGS.DETAIL(Number(id)));
        setListing(main.data);

        const res = await api.post(`${API.LISTINGS.FILTER}?page=0&size=20`, {
          title: main.data.bookTitle,
          author: main.data.bookAuthor,
        });
        setRelated(res.data.content.filter((l: ListingDto) => l.id !== main.data.id));
      } catch {
        setError('Не удалось загрузить данные.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Загрузка...</div>;
  }

  if (error || !listing) {
    return <div className="text-center py-8 text-red-500">{error || 'Объявление не найдено'}</div>;
  }

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString();

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Основная карточка */}
      <Card className="overflow-hidden py-0">
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Link to={`/profile/${listing.ownerId}`}>
                <img
                  src={listing.ownerAvatar || '/default-avatar.jpg'}
                  alt="avatar"
                  className="w-6 h-6 rounded-full hover:opacity-80 transition"
                />
              </Link>
              <Link to={`/profile/${listing.ownerId}`} className="font-medium hover:underline">
                {listing.ownerName}
              </Link>
              <span className="ml-2">
                добавил объявление <strong>{listing.bookTitle}</strong> автора <strong>{listing.bookAuthor}</strong>
              </span>
            </div>
            <span>{formatDate(listing.createdAt)}</span>
          </div>
          <hr />
          <div className="flex gap-4">
            <div className="relative shrink-0">
              {!listing.isOpen && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="w-full text-center px-4 py-1 bg-black bg-opacity-60 text-white text-sm font-semibold border-y border-white">
                    Закрыто
                  </div>
                </div>
              )}
              <img
                src={listing.imageUrls?.[0] || '/book-placeholder.png'}
                alt="Обложка"
                className={cn(
                  "w-36 h-56 object-cover rounded hover:opacity-90 transition",
                  !listing.isOpen && "opacity-70"
                )}
              />
            </div>

            <div className="flex flex-col justify-between">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Город: {listing.cityName}</div>
                <div className="text-sm">
                  Состояние: {CONDITIONS.find(c => c.value === listing.condition)?.label}
                </div>
                {listing.bookDescription && (
                  <div className="text-sm text-muted-foreground">{listing.bookDescription}</div>
                )}
              </div>

              {listing.isOpen && (
                <div className="mt-2 flex gap-2">
                  <Button variant="outline" asChild>
                    <Link to={`/dialogs?listingId=${listing.id}`}>Написать сообщение</Link>
                  </Button>
                  <Button asChild>
                    <Link to={`/books/${listing.id}`}>Предложить обмен</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Блок с похожими */}
      {related.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Эта книга встречается у других пользователей</h2>
          <div className="space-y-4">
            {related.map((item) => (
              <Card key={item.id} className="py-0">
                <CardContent className="p-4 relative">
                  <div className="absolute top-4 right-4 text-xs text-muted-foreground">
                    {formatDate(item.createdAt)}
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="flex flex-col items-center w-16 shrink-0">
                      <Link to={`/profile/${item.ownerId}`}>
                        <img
                          src={item.ownerAvatar || '/default-avatar.jpg'}
                          alt="avatar"
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      </Link>
                      <Link
                        to={`/profile/${item.ownerId}`}
                        className="mt-1 text-xs font-medium text-center hover:underline"
                      >
                        {item.ownerName}
                      </Link>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="text-sm">
                        Состояние:{' '}
                        <strong>
                          {CONDITIONS.find(c => c.value === item.condition)?.label || 'Неизвестно'}
                        </strong>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>г. {item.cityName}</span>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/dialogs?listingId=${item.id}`}>Написать сообщение</Link>
                        </Button>
                        <Button size="sm" asChild>
                          <Link to={`/books/${item.id}`}>Подробнее...</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetail;
