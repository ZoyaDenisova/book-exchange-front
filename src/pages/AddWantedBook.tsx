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

const AGE_CATEGORIES = [
  { value: 'UNIVERSAL', label: 'Для всех' },
  { value: 'CHILDREN', label: '0–12' },
  { value: 'TEEN', label: '12–17' },
  { value: 'ADULT', label: '18+' },
];

const AddWantedBook: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [titleOptions, setTitleOptions] = useState<string[]>([]);
  const [authorOptions, setAuthorOptions] = useState<string[]>([]);
  const [focusedField, setFocusedField] = useState<'title' | 'author' | ''>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customAuthor, setCustomAuthor] = useState('');
  const [customYear, setCustomYear] = useState<number | ''>('');
  const [customDescription, setCustomDescription] = useState('');
  const [customAge, setCustomAge] = useState('UNIVERSAL');
  const [customCover, setCustomCover] = useState<File | null>(null);
  const [customErrors, setCustomErrors] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }
  }, [isAuthenticated, navigate]);

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

    setCustomErrors(null);

    const data = new FormData();
    data.append(
      'data',
      new Blob(
        [JSON.stringify({
          title: trimmedTitle,
          author: trimmedAuthor,
          year: customYear,
          description: trimmedDescription,
          genreIds: [],
          ageCategory: customAge,
        })],
        { type: 'application/json' }
      )
    );
    if (customCover) data.append('file', customCover);

    try {
      const res = await api.post(API.BOOKS.CREATE, data);
      setTitle(res.data.title);
      setAuthor(res.data.author);
      setModalOpen(false);
    } catch (err) {
      console.error('Ошибка при добавлении книги:', err);
    }
  };

  const handleAddWanted = async () => {
    if (!title || !author) {
      alert('Укажите название и автора');
      return;
    }

    try {
      const res = await api.post(`${API.BOOKS.SEARCH}?page=0&size=1`, { title, author });
      const book = res.data.content[0];
      if (!book) {
        alert('Книга не найдена. Добавьте вручную.');
        return;
      }
      // @ts-ignore
      await await api.post(API.CATALOG.WANTED_ADD(book.id));
      alert('Книга успешно добавлена в хотелки');
      navigate(`/profile/${user?.id}?tab=wanted`);
    } catch (e) {
      console.error('Ошибка при добавлении в хотелки:', e);
      alert('Ошибка при добавлении в хотелки');
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-center mb-2">Добавить в хотелки</h1>
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
                <div key={i} onClick={() => { setTitle(t); setTitleOptions([]); }} className="px-4 py-2 hover:bg-accent cursor-pointer">
                  {t}
                </div>
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
                <div key={i} onClick={() => { setAuthor(a); setAuthorOptions([]); }} className="px-4 py-2 hover:bg-accent cursor-pointer">
                  {a}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-row gap-4 w-full">
          <Button className="flex-1" onClick={handleAddWanted}>Добавить</Button>
          <Button className="flex-1" variant="outline" onClick={() => setModalOpen(true)}>
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
              <Input value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} className={customErrors?.title ? 'border-red-500' : ''} />
            </div>
            <div>
              <Label className="block mb-2">Автор*</Label>
              <Input value={customAuthor} onChange={(e) => setCustomAuthor(e.target.value)} className={customErrors?.author ? 'border-red-500' : ''} />
            </div>
            <div>
              <Label className="block mb-2">Год*</Label>
              <Input type="number" value={customYear} onChange={(e) => setCustomYear(Number(e.target.value))} className={customErrors?.year ? 'border-red-500' : ''} />
            </div>
            <div>
              <Label className="block mb-2">Описание*</Label>
              <Textarea value={customDescription} onChange={(e) => setCustomDescription(e.target.value)} className={customErrors?.description ? 'border-red-500' : ''} />
            </div>
            <div>
              <Label className="block mb-2">Возрастная категория*</Label>
              <select value={customAge} onChange={(e) => setCustomAge(e.target.value)} className={`w-full border rounded-md px-2 py-2 ${customErrors?.age ? 'border-red-500' : ''}`}>
                {AGE_CATEGORIES.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="block mb-2">Обложка (опционально)</Label>
              <Input type="file" accept="image/*" onChange={(e) => setCustomCover(e.target.files?.[0] || null)} />
              {customCover && (
                <div className="mt-2 relative w-24 h-32">
                  <img src={URL.createObjectURL(customCover)} alt="preview" className="w-full h-full object-cover rounded" />
                  <button type="button" onClick={() => setCustomCover(null)} className="absolute top-[-6px] right-[-6px] bg-white border border-gray-300 rounded-full p-1 hover:bg-red-100">
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

export default AddWantedBook;
