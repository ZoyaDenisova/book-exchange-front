import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Pagination } from '@/components/ui/pagination';
import type { UserDto } from '@/types/dto.ts';
import { cn } from '@/lib/utils';
import { useParams, Link } from 'react-router-dom';

interface Listing {
  id: number;
  bookTitle: string;
  bookAuthor: string;
  cityName: string;
  createdAt: string;
  imageUrls: string[];
  isOpen: boolean;
}

interface Book {
  id: number;
  title: string;
  author: string;
  imageUrl?: string;
}

const PAGE_SIZE = 6;

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { userId: paramUserId } = useParams();
  const userId = paramUserId ? Number(paramUserId) : user?.id;

  const [userData, setUserData] = useState<UserDto | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'listings' | 'wanted'>('listings');
  const [listings, setListings] = useState<Listing[]>([]);
  const [wanted, setWanted] = useState<Book[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [userRes, ratingRes] = await Promise.all([
          api.get(`/api/auth/users/${userId}`),
          api.get(`/api/reviews/user/${userId}/rating`),
        ]);
        setUserData(userRes.data);
        setRating(ratingRes.data);
      } catch {
        // ошибка опущена
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const fetchTabData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'listings') {
          const res = await api.get(`/api/listings/user/${userId}/all`, {
            params: { page, size: PAGE_SIZE },
          });
          setListings(res.data.content);
          setTotalPages(res.data.totalPages);
        } else {
          const res = await api.get(`/api/catalog/wanted/${userId}`, {
            params: { page, size: PAGE_SIZE },
          });
          setWanted(res.data.content);
          setTotalPages(res.data.totalPages);
        }
      } catch {
        // ошибка опущена
      } finally {
        setLoading(false);
      }
    };

    fetchTabData();
  }, [activeTab, page, userId]);

  if (!userData) {
    return (
      <div className="flex justify-center py-8">
        <Skeleton className="w-full max-w-xl h-64" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Профиль пользователя</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-6">
          <img
            src={userData.avatarUrl?.trim() ? userData.avatarUrl : '/default-avatar.jpg'}
            alt="Аватар"
            className="w-24 h-24 rounded-full object-cover"
          />
          <div className="space-y-1">
            <div><span className="text-muted-foreground">Имя:</span> {userData.name}</div>
            <div><span className="text-muted-foreground">Город:</span> {userData.city?.name || '—'}</div>
            <div><span className="text-muted-foreground">Рейтинг:</span> {rating?.toFixed(2) || '—'}</div>
          </div>
        </CardContent>
      </Card>

      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          if (val === 'listings' || val === 'wanted') {
            setActiveTab(val);
            setPage(0);
          }
        }}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="listings">Я готов предложить</TabsTrigger>
          <TabsTrigger value="wanted">Я хочу</TabsTrigger>
        </TabsList>

        <TabsContent value="listings">
          {loading ? (
            <Skeleton className="w-full h-48" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {listings.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'border rounded-xl overflow-hidden shadow-md transition-opacity',
                    !item.isOpen && 'opacity-70'
                  )}
                >
                  <div className="relative">
                    {!item.isOpen && (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="w-full text-center px-4 py-1 bg-black bg-opacity-60 text-white text-sm font-semibold border-y border-white">
                          Закрыто
                        </div>
                      </div>
                    )}
                    <Link to={`/books/${item.id}`}>
                      <img
                        src={item.imageUrls?.[0] || '/book-placeholder.png'}
                        alt="Обложка"
                        className="w-full aspect-[2/3] object-cover"
                      />
                    </Link>
                  </div>

                  <div className="p-4 space-y-1">
                    <Link to={`/books/${item.id}`} className="font-semibold hover:underline block">
                      {item.bookTitle}
                    </Link>
                    <div className="text-sm text-muted-foreground">{item.bookAuthor}</div>
                    <div className="text-sm">{item.cityName}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="wanted">
          {loading ? (
            <Skeleton className="w-full h-48" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {wanted.map((book) => (
                <div key={book.id} className="border rounded-xl overflow-hidden shadow-md">
                  <img
                    src={book.imageUrl || '/book-placeholder.png'}
                    alt="Обложка"
                    className="w-full aspect-[2/3] object-cover"
                  />
                  <div className="p-4 space-y-1">
                    <div className="font-semibold">{book.title}</div>
                    <div className="text-sm text-muted-foreground">{book.author}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
};

export default Profile;
