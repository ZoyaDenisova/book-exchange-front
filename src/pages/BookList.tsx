import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { API } from '../config/api-endpoints';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CoverImage from '@/components/CoverImage';
import type { ListingDto, ListingFilterDto } from '@/types/dto';
import StartDialogModal from '@/components/StartDialogModal';

const CONDITIONS = [
  { value: 'NEW', label: 'Новое' },
  { value: 'LIKE_NEW', label: 'Как новое' },
  { value: 'GOOD', label: 'Хорошее' },
  { value: 'FAIR', label: 'Приемлемое' },
  { value: 'POOR', label: 'Плохое' },
];

const PAGE_SIZE = 6;

const BookList: React.FC = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [city, setCity] = useState('');
  const [genreId, setGenreId] = useState('');
  const [condition, setCondition] = useState('');
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState<number | null>(null);

  const [titleOptions, setTitleOptions] = useState<string[]>([]);
  const [authorOptions, setAuthorOptions] = useState<string[]>([]);
  const [cityOptions, setCityOptions] = useState<{ id: number; name: string }[]>([]);
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [listings, setListings] = useState<ListingDto[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    api.get(API.BOOKS.GENRES).then(res => setGenres(res.data));
  }, []);

  useEffect(() => {
    fetchListings();
  }, [page]);

  const fetchListings = async () => {
    const cityObj = cityOptions.find(c => city.toLowerCase().includes(c.name.toLowerCase()));

    const filters: ListingFilterDto = {
      title: title || undefined,
      author: author || undefined,
      genreIds: genreId ? [parseInt(genreId)] : undefined,
      condition: condition !== '' ? (condition as ListingFilterDto['condition']) : undefined,
      cityId: cityObj?.id || undefined,
      isBlocked: false,
    };

    const res = await api.post(`${API.LISTINGS.FILTER}?page=${page}&size=${PAGE_SIZE}`, filters);
    setListings(res.data.content);
    setTotalPages(res.data.totalPages);
  };

  const handleSearch = () => {
    setPage(0);
    fetchListings();
  };

  const fetchCityOptions = async (query: string) => {
    const res = await api.get(API.LISTINGS.SEARCH_CITIES, { params: { query } });
    setCityOptions(res.data);
  };

  const fetchTitleOptions = async (query: string) => {
    const res = await api.get(API.BOOKS.AUTOCOMPLETE_TITLE, { params: { prefix: query } });
    setTitleOptions(res.data);
  };

  const fetchAuthorOptions = async (query: string) => {
    const res = await api.get(API.BOOKS.AUTOCOMPLETE_AUTHOR, { params: { prefix: query } });
    setAuthorOptions(res.data);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6">
      {/* Фильтры */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="space-y-2 relative">
          <Label htmlFor="title">Название книги</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (e.target.value.length >= 1) fetchTitleOptions(e.target.value);
            }}
            onFocus={() => {
              setAuthorOptions([]);
              setCityOptions([]);
            }}
            placeholder="Начните вводить..."
          />
          {titleOptions.length > 0 && (
            <div className="absolute w-full z-10 mt-1 border rounded-md bg-white shadow max-h-40 overflow-y-auto">
              {titleOptions.map((t, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setTitle(t);
                    setTitleOptions([]);
                  }}
                  className="px-4 py-2 hover:bg-accent cursor-pointer"
                >
                  {t}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2 relative">
          <Label htmlFor="author">Автор</Label>
          <Input
            id="author"
            value={author}
            onChange={(e) => {
              setAuthor(e.target.value);
              if (e.target.value.length >= 1) fetchAuthorOptions(e.target.value);
            }}
            onFocus={() => {
              setTitleOptions([]);
              setCityOptions([]);
            }}
            placeholder="Начните вводить..."
          />
          {authorOptions.length > 0 && (
            <div className="absolute w-full z-10 mt-1 border rounded-md bg-white shadow max-h-40 overflow-y-auto">
              {authorOptions.map((a, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setAuthor(a);
                    setAuthorOptions([]);
                  }}
                  className="px-4 py-2 hover:bg-accent cursor-pointer"
                >
                  {a}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2 relative">
          <Label htmlFor="city">Город</Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              if (e.target.value.length >= 1) fetchCityOptions(e.target.value);
            }}
            onFocus={() => {
              setTitleOptions([]);
              setAuthorOptions([]);
            }}
            placeholder="Начните вводить..."
          />
          {cityOptions.length > 0 && (
            <div className="absolute w-full z-10 mt-1 border rounded-md bg-white shadow max-h-40 overflow-y-auto">
              {cityOptions.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setCity(c.name);
                    setCityOptions([]);
                  }}
                  className="px-4 py-2 hover:bg-accent cursor-pointer"
                >
                  {c.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2 relative">
          <Label>Жанр</Label>
          <select
            value={genreId}
            onChange={(e) => setGenreId(e.target.value)}
            className="w-full border rounded-md px-2 py-1"
          >
            <option value="">— Любой жанр —</option>
            {genres.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2 relative">
          <Label>Состояние</Label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full border rounded-md px-2 py-1"
          >
            <option value="">— Любое состояние —</option>
            {CONDITIONS.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <Button onClick={handleSearch}>Поиск</Button>
        </div>
      </div>

      {/* Список карточек */}
      <div className="space-y-4">
        {listings.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Объявления не найдены
          </div>
        ) : (
          listings.map(listing => (
            <Card key={listing.id} className="overflow-hidden py-0">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Link to={`/profile/${listing.owner.id}`}>
                      <img
                        src={listing.owner.avatarUrl || '/default-avatar.jpg'}
                        alt="avatar"
                        className="w-6 h-6 rounded-full hover:opacity-80 transition"
                      />
                    </Link>
                    <Link to={`/profile/${listing.owner.id}`} className="font-medium hover:underline">
                      {listing.owner.name}
                    </Link>
                    <Link to={`/books/${listing.id}`} className="ml-2 hover:underline">
                      добавил объявление <strong>{listing.book.title}</strong> автора <strong>{listing.book.author}</strong>
                    </Link>
                  </div>
                  <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
                </div>
                <hr />
                <div className="flex gap-4">
                  <Link to={`/books/${listing.id}`} className="shrink-0">
                    <CoverImage
                      src={listing.book.imageUrl}
                      className="w-36 h-56 rounded hover:opacity-90 transition"
                    />
                  </Link>
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
                    {user?.id !== listing.owner.id && (
                      <div className="mt-2 flex gap-2">
                        <Button variant="outline" onClick={() => setDialogOpen(listing.id)}>Написать сообщение</Button>
                        <StartDialogModal listingId={listing.id} open={dialogOpen === listing.id} onClose={() => setDialogOpen(null)} />
                        <Button asChild>
                          <Link to={`/books/${listing.id}`}>Предложить обмен</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

export default BookList;
