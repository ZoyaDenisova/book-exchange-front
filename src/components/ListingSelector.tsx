import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import api from '../services/api';
import { API } from '../config/api-endpoints';
import CoverImage from './CoverImage';
import type { ListingDto } from '@/types/dto.ts';

const ListingSelector: React.FC<{
  open: boolean;
  onClose: () => void;
  onSelect: (listing: ListingDto) => void;
  userId: number;
}> = ({ open, onClose, onSelect, userId }) => {
  const [listings, setListings] = useState<ListingDto[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      if (!open || !userId) return;

      try {
        const res = await api.get(API.LISTINGS.USER_ALL(userId));
        setListings(res.data.content);
      } catch {
        setListings([]);
      }
    };

    fetchListings();
  }, [open, userId]);

  const selected = listings.find(l => l.id === selectedId);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Выберите объявление</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
          {listings.map(listing => (
            <div
              key={listing.id}
              onClick={() => setSelectedId(listing.id)}
              className={`cursor-pointer border rounded-xl p-2 space-y-1 shadow-sm hover:shadow-md transition ${
                selectedId === listing.id ? 'border-primary ring-2 ring-primary' : ''
              }`}
            >
              <CoverImage src={listing.book?.imageUrl} className="w-full aspect-[2/3]" />
              <div className="font-semibold text-sm">{listing.book?.title || 'Без названия'}</div>
              <div className="text-xs text-muted-foreground">{listing.book?.author || 'Автор неизвестен'}</div>
              <div className="text-xs text-muted-foreground">Город: {listing.city?.name || '—'}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(listing.createdAt).toLocaleDateString()}
              </div>
              {!listing.isOpen && (
                <div className="text-xs text-red-500 font-semibold">Объявление закрыто</div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-4">
          <Button disabled={!selected} onClick={() => selected && onSelect(selected)}>
            Выбрать
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ListingSelector;
