import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { API } from '../config/api-endpoints';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '../context/AuthContext';
import type { ListingDto } from '@/types/dto';
import { cn } from '@/lib/utils';
import CoverImage from '@/components/CoverImage';
import StartDialogModal from '@/components/StartDialogModal';

const CONDITIONS = [
  { value: 'NEW', label: 'Новое' },
  { value: 'LIKE_NEW', label: 'Как новое' },
  { value: 'GOOD', label: 'Хорошее' },
  { value: 'FAIR', label: 'Приемлемое' },
  { value: 'POOR', label: 'Плохое' },
];

const BookDetail: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [listing, setListing] = useState<ListingDto | null>(null);
  const [related, setRelated] = useState<ListingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogModalOpenId, setDialogModalOpenId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        const main = await api.get(API.LISTINGS.DETAIL(Number(id)));
        setListing(main.data);

        const res = await api.post(`${API.LISTINGS.FILTER}?page=0&size=20`, {
          title: main.data.book.title,
          author: main.data.book.author,
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

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString();

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Загрузка...</div>;
  }

  if (error || !listing) {
    return <div className="text-center py-8 text-red-500">{error || 'Объявление не найдено'}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      <Card className="overflow-hidden py-0">
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <img
                src={listing.owner.avatarUrl || '/default-avatar.jpg'}
                alt="avatar"
                className="w-6 h-6 rounded-full hover:opacity-80 transition"
              />
              <span className="font-medium">{listing.owner.name}</span>
              <span className="ml-2">
                добавил объявление <strong>{listing.book.title}</strong> автора{' '}
                <strong>{listing.book.author}</strong>
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
              <CoverImage
                src={listing.book.imageUrl}
                className={cn(
                  'w-36 h-56 rounded hover:opacity-90 transition',
                  !listing.isOpen && 'opacity-70'
                )}
              />
            </div>
            <div className="flex flex-col justify-between">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Город: {listing.city.name}</div>
                <div className="text-sm">
                  Состояние: {CONDITIONS.find(c => c.value === listing.condition)?.label}
                </div>
                {listing.book.description && (
                  <div className="text-sm text-muted-foreground">{listing.book.description}</div>
                )}
              </div>
              {listing.isOpen && user?.id !== listing.owner.id && (
                <div className="mt-2 flex gap-2">
                  <Button variant="outline" onClick={() => setDialogModalOpenId(listing.id)}>
                    Написать сообщение
                  </Button>
                  <Button asChild>
                    <a href={`/books/${listing.id}`}>Предложить обмен</a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

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
                      <img
                        src={item.owner.avatarUrl || '/default-avatar.jpg'}
                        alt="avatar"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <span className="mt-1 text-xs font-medium text-center">{item.owner.name}</span>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="text-sm">
                        Состояние:{' '}
                        <strong>
                          {CONDITIONS.find(c => c.value === item.condition)?.label || 'Неизвестно'}
                        </strong>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>г. {item.city.name}</span>
                        {user?.id !== item.owner.id && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => setDialogModalOpenId(item.id)}>
                              Написать сообщение
                            </Button>
                            <Button size="sm" asChild>
                              <a href={`/books/${item.id}`}>Подробнее...</a>
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* StartDialogModal – переиспользуется для любого объявления */}
      {dialogModalOpenId !== null && (
        <StartDialogModal
          listingId={dialogModalOpenId}
          open={true}
          onClose={() => setDialogModalOpenId(null)}
        />
      )}
    </div>
  );
};

export default BookDetail;
