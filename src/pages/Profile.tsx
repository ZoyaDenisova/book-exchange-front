import EditProfileModal from "@/components/EditProfileModal.tsx";
import {Button} from "@/components/ui/button.tsx";
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Pagination } from '@/components/ui/pagination';
import type { UserDto, ListingDto, BookDto } from '@/types/dto.ts';
import { cn } from '@/lib/utils';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import CoverImage from '@/components/CoverImage.tsx';
import ReviewSection from '@/components/ReviewSection.tsx';
import ComplaintModal from '@/components/ComplaintModal';
import { Pencil } from 'lucide-react';
import EditListingModal from "@/components/EditListingModal";


const PAGE_SIZE = 6;

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { userId: paramUserId } = useParams();
  const userId = paramUserId ? Number(paramUserId) : user?.id;

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as 'listings' | 'wanted' | 'reviews' | null;
  const [activeTab, setActiveTab] = useState<'listings' | 'wanted' | 'reviews'>(tabParam ?? 'listings');

  const [userData, setUserData] = useState<UserDto | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [listings, setListings] = useState<ListingDto[]>([]);
  const [wanted, setWanted] = useState<BookDto[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [complaintOpen, setComplaintOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmCloseId, setConfirmCloseId] = useState<number | null>(null);
  const [editListingId, setEditListingId] = useState<number | null>(null);

  const [confirmRemoveWantedId, setConfirmRemoveWantedId] = useState<number | null>(null);
  const handleRemoveWanted = async () => {
    if (confirmRemoveWantedId === null) return;
    try {
      await api.delete(`/api/catalog/wanted/${confirmRemoveWantedId}`);
      setWanted(prev => prev.filter(b => b.id !== confirmRemoveWantedId));
    } catch {
      alert('Ошибка при удалении из хотелок');
    } finally {
      setConfirmRemoveWantedId(null);
    }
  };

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
        } else if (activeTab === 'wanted') {
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

  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleCloseListing = async () => {
    if (confirmCloseId === null) return;
    try {
      await api.patch(`/api/listings/${confirmCloseId}/close`);
      setListings(prev => prev.map(l => l.id === confirmCloseId ? { ...l, isOpen: false } : l));
    } catch {
      alert('Ошибка при закрытии объявления');
    } finally {
      setConfirmCloseId(null);
    }
  };

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
          <div className="relative group">
          <img
            src={userData.avatarUrl?.trim() || '/default-avatar.jpg'}
            alt="avatar"
            className="w-24 h-24 rounded-full object-cover border"
          />
          {user?.id === userData.id && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
              onClick={() => document.getElementById('avatar-input')?.click()}>
              <span className="text-white text-sm">Заменить</span>
            </div>
          )}
          <input
            id="avatar-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const form = new FormData();
              form.append('file', file);
              const fileUrl = URL.createObjectURL(file);
              try {
                await api.put('/api/auth/avatar', form);
                setUserData({
                  ...userData,
                  avatarUrl: fileUrl
                });
              } catch {
                alert('Ошибка при загрузке');
              }
            }}
          />
        </div>

          <div className="flex-1 space-y-1">
            <div><span className="text-muted-foreground">Имя:</span> {userData.name}</div>
            <div><span className="text-muted-foreground">Город:</span> {userData.city?.name || '—'}</div>
            <div><span className="text-muted-foreground">Рейтинг:</span> {rating?.toFixed(2) || '—'}</div>
          </div>
          {user && user.id !== userData.id && (
            <div>
              <button
                onClick={() => setComplaintOpen(true)}
                className="text-sm text-red-600 border border-red-600 rounded-md px-4 py-1 hover:bg-red-50"
              >
                Пожаловаться
              </button>
            </div>
          )}
          <div className="flex flex-col gap-2">
            {user?.id === userData.id && (
              <Button onClick={() => setEditOpen(true)}>Редактировать</Button>
            )}
            {user?.id === userData.id && userData.avatarUrl && (
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await api.delete('/api/auth/avatar');
                    setUserData({
                      ...userData,
                      avatarUrl: undefined
                    });
                  } catch {
                    alert('Ошибка при удалении');
                  }
                }}
              >
                Удалить аватар
              </Button>
            )}
          </div>

        </CardContent>
      </Card>

      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          const nextTab = val as 'listings' | 'wanted' | 'reviews';
          setActiveTab(nextTab);
          setPage(0);
          setSearchParams({ tab: nextTab });
        }}
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="listings">Я готов предложить</TabsTrigger>
            <TabsTrigger value="wanted">Я хочу</TabsTrigger>
            <TabsTrigger value="reviews">Отзывы</TabsTrigger>
          </TabsList>

          {user?.id === userData.id && (
            <div className="flex gap-2">
              <Button asChild>
                <Link to="/book/add">Добавить объявление</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/wanted/add">Добавить хотелку</Link>
              </Button>
            </div>
          )}
        </div>

        <TabsContent value="listings">
          {loading ? (
            <Skeleton className="w-full h-48" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {listings.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'border rounded-xl overflow-hidden shadow-md transition-opacity relative',
                    !item.isOpen && 'opacity-70'
                  )}
                >
                  {user?.id === item.owner.id && item.isOpen && (
                    <div className="absolute top-2 right-2 z-20 flex gap-1">
                      <button
                        onClick={() => setEditListingId(item.id)}
                        className="bg-white text-gray-700 border border-white rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-gray-100"
                        title="Редактировать"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => setConfirmCloseId(item.id)}
                        className="bg-white text-red-500 border border-white rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-gray-100"
                        title="Закрыть объявление"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  <div className="relative">
                    {!item.isOpen && (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="w-full text-center px-4 py-1 bg-black bg-opacity-60 text-white text-sm font-semibold border-y border-white">
                          Закрыто
                        </div>
                      </div>
                    )}
                    <Link to={`/books/${item.id}`}>
                      <CoverImage
                        src={item.book?.imageUrl}
                        className="w-full aspect-[2/3]"
                      />
                    </Link>
                  </div>

                  <div className="p-4 space-y-1">
                    <Link to={`/books/${item.id}`} className="font-semibold hover:underline block">
                      {item.book?.title}
                    </Link>
                    <div className="text-sm text-muted-foreground">{item.book?.author}</div>
                    <div className="text-sm">{item.city?.name}</div>
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
                <div key={book.id} className="border rounded-xl overflow-hidden shadow-md relative">
                  {user?.id === userData.id && book.id !== undefined && (
                    <button
                      onClick={() => setConfirmRemoveWantedId(book.id)}
                      className="absolute top-2 right-2 z-20 bg-white text-red-500 border border-white rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-gray-100 cursor-pointer"
                      title="Удалить из хотелок"
                    >
                      ×
                    </button>
                  )}
                  <CoverImage
                    src={book.imageUrl}
                    className="w-full aspect-[2/3]"
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

        <TabsContent value="reviews">
          <ReviewSection userId={userId!} />
        </TabsContent>
      </Tabs>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />

      {user && user.id !== userData.id && (
        <ComplaintModal
          open={complaintOpen}
          onClose={() => setComplaintOpen(false)}
          userId={userData.id}
        />
      )}

      {user?.id === userData.id && (
        <EditProfileModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          user={userData}
          onUpdated={(updated) => setUserData(updated)}
        />
      )}

      {confirmCloseId !== null && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl space-y-4 w-full max-w-sm">
            <div className="text-lg font-semibold">Закрыть объявление?</div>
            <div className="text-sm text-muted-foreground">
              После закрытия пользователи не смогут предлагать обмены по этому объявлению.
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setConfirmCloseId(null)}
                className="px-4 py-1 text-sm rounded border hover:bg-gray-100"
              >
                Нет
              </button>
              <button
                onClick={handleCloseListing}
                className="px-4 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700"
              >
                Да
              </button>
            </div>
          </div>
        </div>
      )}
      {confirmRemoveWantedId !== null && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl space-y-4 w-full max-w-sm">
            <div className="text-lg font-semibold">Удалить из хотелок?</div>
            <div className="text-sm text-muted-foreground">
              Книга исчезнет из вашего списка желаемого.
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setConfirmRemoveWantedId(null)}
                className="px-4 py-1 text-sm rounded border hover:bg-gray-100"
              >
                Нет
              </button>
              <button
                onClick={handleRemoveWanted}
                className="px-4 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700"
              >
                Да
              </button>
            </div>
          </div>
        </div>
      )}
      {editListingId !== null && (
        <EditListingModal
          listingId={editListingId}
          open={true}
          onClose={() => setEditListingId(null)}
          initialCondition={listings.find(l => l.id === editListingId)?.condition ?? 'GOOD'}
          initialCityName={listings.find(l => l.id === editListingId)?.city.name ?? ''}
          onSuccess={(updated) => {
            setListings(prev =>
              prev.map(l => l.id === updated.id ? { ...l, ...updated } : l)
            );
            setEditListingId(null);
          }}
        />
      )}

    </div>
  );
};

export default Profile;
