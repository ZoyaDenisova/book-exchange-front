import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import api from '../services/api';
import type {ListingDto} from "@/types/dto.ts";

const CONDITIONS = [
  { value: 'NEW', label: 'Новое' },
  { value: 'LIKE_NEW', label: 'Как новое' },
  { value: 'GOOD', label: 'Хорошее' },
  { value: 'FAIR', label: 'Приемлемое' },
  { value: 'POOR', label: 'Плохое' },
];

interface EditListingModalProps {
  open: boolean;
  onClose: () => void;
  listingId: number;
  initialCondition: string;
  initialCityName: string;
  onSuccess: (updated: ListingDto) => void;
}

const EditListingModal: React.FC<EditListingModalProps> = ({ open, onClose, listingId, initialCondition, initialCityName, onSuccess }) => {
  const [condition, setCondition] = useState(initialCondition);
  const [cityQuery, setCityQuery] = useState(initialCityName);
  const [cityOptions, setCityOptions] = useState<{ id: number; name: string }[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);

  useEffect(() => {
    setCondition(initialCondition);
    setCityQuery(initialCityName);
    setSelectedCityId(null);
  }, [initialCondition, initialCityName, open]);

  const fetchCityOptions = async (query: string) => {
    if (!query) return;
    try {
      const res = await api.get('/api/listings/search/cities', { params: { query } });
      setCityOptions(res.data);
    } catch {
      setCityOptions([]);
    }
  };

  const handleUpdate = async () => {
    if (!condition || (!selectedCityId && !cityQuery)) {
      alert('Заполните все поля');
      return;
    }

    try {
      const payload = { condition, cityId: selectedCityId };
      await api.patch(`/api/listings/${listingId}`, payload);

      const res = await api.get(`/api/listings/${listingId}`);
      onSuccess(res.data);

      onClose();

    } catch {
      alert('Ошибка при обновлении объявления');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактировать объявление</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Состояние</Label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full border rounded px-2 py-2"
            >
              {CONDITIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Label>Город</Label>
            <Input
              value={cityQuery}
              onChange={(e) => {
                setCityQuery(e.target.value);
                fetchCityOptions(e.target.value);
              }}
              onBlur={() => setTimeout(() => setCityOptions([]), 150)}
            />
            {cityOptions.length > 0 && (
              <div className="absolute z-10 bg-white border rounded shadow w-full max-h-40 overflow-auto">
                {cityOptions.map((city) => (
                  <div
                    key={city.id}
                    className="px-4 py-2 hover:bg-accent cursor-pointer"
                    onClick={() => {
                      setSelectedCityId(city.id);
                      setCityQuery(city.name);
                      setCityOptions([]);
                    }}
                  >
                    {city.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Отменить</Button>
            <Button onClick={handleUpdate}>Изменить</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditListingModal;
