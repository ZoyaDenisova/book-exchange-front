import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ImagePicker from './ImagePicker';
import ListingSelector from './ListingSelector';
import CoverImage from './CoverImage';
import api from '../services/api';
import { API } from '../config/api-endpoints';
import type { ListingDto } from '@/types/dto';

interface ComplaintModalProps {
  userId: number; // на кого жалуемся
  open: boolean;
  onClose: () => void;
}

const ComplaintModal: React.FC<ComplaintModalProps> = ({ userId, open, onClose }) => {
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<ListingDto | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!comment.trim()) {
      alert('Комментарий обязателен');
      return;
    }
    if (!selectedListing) {
      alert('Выберите объявление');
      return;
    }

    const form = new FormData();
    form.append(
      'data',
      new Blob(
        [JSON.stringify({ listingId: selectedListing.id, comment })],
        { type: 'application/json' }
      )
    );
    images.forEach(img => form.append('images', img));

    try {
      setLoading(true);
      await api.post(API.REVIEWS.COMPLAINT, form);
      alert('Жалоба отправлена');
      setComment('');
      setImages([]);
      setSelectedListing(null);
      onClose();
    } catch (err) {
      console.error('Ошибка при отправке жалобы:', err);
      alert('Не удалось отправить жалобу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-lg space-y-4">
          <DialogHeader>
            <DialogTitle>Отправить жалобу</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <label className="block font-medium text-sm">Комментарий*</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Опишите проблему..."
            />
          </div>

          <div className="space-y-2">
            <label className="block font-medium text-sm">Объявление*</label>
            {selectedListing ? (
              <div className="flex items-center gap-4">
                <CoverImage
                  src={selectedListing.book.imageUrl}
                  className="w-12 h-16 object-cover rounded"
                />
                <div className="text-sm">
                  <div className="font-medium">{selectedListing.book.title}</div>
                  <div className="text-muted-foreground text-xs">{selectedListing.book.author}</div>
                </div>
                <Button variant="ghost" onClick={() => setSelectedListing(null)}>
                  Сменить
                </Button>
              </div>
            ) : (
              <Button onClick={() => setSelectorOpen(true)}>Выбрать объявление</Button>
            )}
          </div>

          <ImagePicker images={images} setImages={setImages} />

          <div className="text-right">
            <Button onClick={handleSend} disabled={loading}>
              {loading ? 'Отправка...' : 'Отправить жалобу'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ListingSelector
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onSelect={(listing) => {
          setSelectedListing(listing);
          setSelectorOpen(false);
        }}
        userId={userId}
      />
    </>
  );
};

export default ComplaintModal;
