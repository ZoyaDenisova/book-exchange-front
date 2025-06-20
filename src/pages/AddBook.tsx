import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { API } from '../config/api-endpoints';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

const CONDITIONS = [
  { value: 'NEW', label: 'Новое' },
  { value: 'LIKE_NEW', label: 'Как новое' },
  { value: 'GOOD', label: 'Хорошее' },
  { value: 'FAIR', label: 'Приемлемое' },
  { value: 'POOR', label: 'Плохое' },
];

const AGE_CATEGORIES = [
  { value: 'UNIVERSAL', label: 'Для всех' },
  { value: 'CHILDREN', label: '0–12' },
  { value: 'TEEN', label: '12–17' },
  { value: 'ADULT', label: '18+' },
];

const AddBook: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [titleOptions, setTitleOptions] = useState<string[]>([]);
  const [authorOptions, setAuthorOptions] = useState<string[]>([]);
  const [focusedField, setFocusedField] = useState<'title' | 'author' | 'city' | ''>('');

  const [cityQuery, setCityQuery] = useState('');
  const [cityOptions, setCityOptions] = useState<{ id: number; name: string }[]>([]);
  const [cityId, setCityId] = useState<number | null>(null);
  const [condition, setCondition] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string>('');
  const [images, setImages] = useState<File[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useAuth();

  const [customTitle, setCustomTitle] = useState('');
  const [customAuthor, setCustomAuthor] = useState('');
  const [customYear, setCustomYear] = useState<number | ''>('');
  const [customDescription, setCustomDescription] = useState('');
  const [customAge, setCustomAge] = useState('UNIVERSAL');
  const [customCover, setCustomCover] = useState<File | null>(null);

  const [customErrors, setCustomErrors] = useState<null | {
    title?: boolean;
    author?: boolean;
    year?: boolean;
    description?: boolean;
    age?: boolean;
  }>(null);

  const handleAddImages = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);

    if (images.length + newFiles.length > 3) {
      alert('Можно прикрепить не больше трёх изображений');
      return;
    }

    setImages(prev => [...prev, ...newFiles]);
  };


  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };


  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }
    api.get(API.BOOKS.GENRES)
      .then((res) => setGenres(res.data))
      .catch(err => console.error('Не удалось загрузить жанры', err));
  }, [isAuthenticated, navigate]);

  const fetchCityOptions = async (query: string) => {
    if (!query) return;
    const res = await api.get(API.LISTINGS.SEARCH_CITIES, { params: { query } });
    setCityOptions(res.data);
  };

  const fetchTitleOptions = async (prefix: string) => {
    if (!prefix) return;
    const res = await api.get(API.BOOKS.AUTOCOMPLETE_TITLE, { params: { prefix } });
    setTitleOptions(res.data);
  };

  const fetchAuthorOptions = async (prefix: string) => {
    if (!prefix) return;
    const res = await api.get(API.BOOKS.AUTOCOMPLETE_AUTHOR, { params: { prefix } });
    setAuthorOptions(res.data);
  };

  const handleAddCustomBook = async () => {
    const trimmedTitle = customTitle.trim();
    const trimmedAuthor = customAuthor.trim();
    const trimmedDescription = customDescription.trim();
    const yearValid = Number(customYear) > 0;
    const hasAge = !!customAge;

    const errors = {
      title: !trimmedTitle,
      author: !trimmedAuthor,
      year: !yearValid,
      description: !trimmedDescription,
      age: !hasAge,
    };

    const hasErrors = Object.values(errors).some(Boolean);

    if (hasErrors) {
      setCustomErrors(errors);
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    setCustomErrors(null); // всё валидно — сбрасываем

    const data = new FormData();
    data.append(
      'data',
      new Blob(
        [JSON.stringify({
          title: trimmedTitle,
          author: trimmedAuthor,
          year: customYear,
          description: trimmedDescription,
          genreIds: selectedGenres ? [parseInt(selectedGenres)] : [],
          ageCategory: customAge,
        })],
        { type: 'application/json' }
      )
    );
    if (customCover) {
      data.append('file', customCover);
    }

    try {
      const res = await api.post(API.BOOKS.CREATE, data);
      setTitle(res.data.title);
      setAuthor(res.data.author);
      setModalOpen(false);
    } catch (err) {
      console.error('Ошибка при добавлении книги:', err);
    }
  };



  const handleCreateListing = async () => {
    if (!title || !author || !condition || !cityId) {
      alert('Заполните все поля');
      return;
    }

    try {
      const res = await api.post(`${API.BOOKS.SEARCH}?page=0&size=1`, { title, author });
      const book = res.data.content[0];
      if (!book) {
        alert('Книга не найдена. Добавьте вручную.');
        return;
      }

      const form = new FormData();
      form.append(
        'data',
        new Blob(
          [JSON.stringify({ bookId: book.id, condition, cityId })],
          { type: 'application/json' }
        )
      );
      images.slice(0, 3).forEach(img => form.append('images', img));

      await api.post(API.LISTINGS.CREATE, form);
      alert('Объявление успешно создано');

      setTimeout(() => {
        navigate(`/profile/${user?.id}`);
      }, 2000);
    } catch (e) {
      console.error('Ошибка при создании объявления:', e);
      alert('Ошибка при создании объявления');
    }
  };


  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-center mb-2">Добавить объявление</h1>
      <hr className="mb-6" />
      <div className="space-y-4">
        <div className="relative">
          <Label className="block mb-2">Название*</Label>
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              fetchTitleOptions(e.target.value);
            }}
            onFocus={() => setFocusedField('title')}
            onBlur={() => setTimeout(() => setFocusedField(''), 150)}
          />
          {focusedField === 'title' && titleOptions.length > 0 && (
            <div className="absolute w-full z-10 mt-1 border rounded-md bg-white shadow max-h-40 overflow-y-auto">
              {titleOptions.map((t, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setTitle(t);
                    setTitleOptions([]);
                  }}
                  className="px-4 py-2 hover:bg-accent cursor-pointer"
                >{t}</div>
              ))}
            </div>
          )}
        </div>
        <div className="relative">
          <Label className="block mb-2">Автор*</Label>
          <Input
            value={author}
            onChange={(e) => {
              setAuthor(e.target.value);
              fetchAuthorOptions(e.target.value);
            }}
            onFocus={() => setFocusedField('author')}
            onBlur={() => setTimeout(() => setFocusedField(''), 150)}
          />
          {focusedField === 'author' && authorOptions.length > 0 && (
            <div className="absolute w-full z-10 mt-1 border rounded-md bg-white shadow max-h-40 overflow-y-auto">
              {authorOptions.map((a, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setAuthor(a);
                    setAuthorOptions([]);
                  }}
                  className="px-4 py-2 hover:bg-accent cursor-pointer"
                >{a}</div>
              ))}
            </div>
          )}
        </div>
        <div className="relative">
          <Label className="block mb-2">Город*</Label>
          <Input
            value={cityQuery}
            onChange={(e) => {
              setCityQuery(e.target.value);
              fetchCityOptions(e.target.value);
            }}
            onFocus={() => setFocusedField('city')}
            onBlur={() => setTimeout(() => setCityOptions([]), 150)}
          />
          {cityOptions.length > 0 && (
            <div className="absolute w-full z-10 mt-1 border rounded-md bg-white shadow max-h-40 overflow-y-auto">
              {cityOptions.map((city) => (
                <div
                  key={city.id}
                  onClick={() => {
                    setCityId(city.id);
                    setCityQuery(city.name);
                    setCityOptions([]);
                  }}
                  className="px-4 py-2 hover:bg-accent cursor-pointer"
                >
                  {city.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label className="block mb-2">Состояние*</Label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full border rounded-md px-2 py-2"
          >
            <option value="">Выберите состояние</option>
            {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <Label className="block mb-2">Жанр</Label>
          <select
            value={selectedGenres}
            onChange={(e) => setSelectedGenres(e.target.value)}
            className="w-full border rounded-md px-2 py-2"
          >
            <option value="">Выберите жанр</option>
            {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <div>
          <Label className="block mb-2">Прикрепить фото</Label>
          <Input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleAddImages(e.target.files)}
          />
          <div className="mt-2 flex gap-2 flex-wrap">
            {images.map((file, index) => (
              <div key={index} className="relative w-20 h-20">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`preview-${index}`}
                  className="w-full h-full object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-[-6px] right-[-6px] bg-white border border-gray-300 rounded-full p-1 hover:bg-red-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">(не больше трех)</p>
        </div>

        <div className="flex flex-row gap-4 w-full">
          <Button className="flex-1" onClick={handleCreateListing}>Выложить</Button>
          <Button className="flex-1" type="button" variant="outline" onClick={() => setModalOpen(true)}>
            Моей книги нет в списке
          </Button>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Укажите полную информацию о книге</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="block mb-2">Название*</Label>
              <Input
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className={customErrors?.title ? 'border-red-500' : ''}
              />
            </div>
            <div>
              <Label className="block mb-2">Автор*</Label>
              <Input
                value={customAuthor}
                onChange={(e) => setCustomAuthor(e.target.value)}
                className={customErrors?.author ? 'border-red-500' : ''}
              />
            </div>
            <div>
              <Label className="block mb-2">Год*</Label>
              <Input
                type="number"
                value={customYear}
                onChange={(e) => setCustomYear(Number(e.target.value))}
                className={customErrors?.year ? 'border-red-500' : ''}
              />
            </div>
            <div>
              <Label className="block mb-2">Описание*</Label>
              <Textarea
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                className={customErrors?.description ? 'border-red-500' : ''}
              />
            </div>
            <div>
              <Label className="block mb-2">Возрастная категория*</Label>
              <select
                value={customAge}
                onChange={(e) => setCustomAge(e.target.value)}
                className={`w-full border rounded-md px-2 py-2 ${customErrors?.age ? 'border-red-500' : ''}`}
              >
                {AGE_CATEGORIES.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
            <div>

          <Label className="block mb-2">Обложка (опционально)</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setCustomCover(e.target.files?.[0] || null)}
              />
              {customCover && (
                <div className="mt-2 relative w-24 h-32">
                  <img
                    src={URL.createObjectURL(customCover)}
                    alt="preview"
                    className="w-full h-full object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => setCustomCover(null)}
                    className="absolute top-[-6px] right-[-6px] bg-white border border-gray-300 rounded-full p-1 hover:bg-red-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex justify-center">
              <Button onClick={handleAddCustomBook}>Добавить</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddBook;