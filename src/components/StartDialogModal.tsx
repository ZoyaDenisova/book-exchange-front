import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import ImagePicker from '@/components/ImagePicker';
import api from '../services/api';
import { API } from '../config/api-endpoints';

interface Props {
  listingId: number;
  open: boolean;
  onClose: () => void;
}

const StartDialogModal: React.FC<Props> = ({ listingId, open, onClose }) => {
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim() && images.length === 0) return;

    setLoading(true);
    try {
      const form = new FormData();
      form.append('content', message);
      images.forEach(file => form.append('images', file));

      await api.post(API.MESSAGES.SEND(listingId), form);

      const res = await api.get(API.MESSAGES.USER_DIALOGS);
      const dialog = res.data.find((d: any) => d.listingId === listingId);

      if (dialog?.dialogId) {
        window.location.href = `/dialogs?dialogId=${dialog.dialogId}`;
      } else {
        alert('Диалог создан, но не найден. Обновите страницу.');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка при отправке');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Написать сообщение</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Введите сообщение..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
          <ImagePicker images={images} setImages={setImages} />
          <div className="text-right">
            <Button onClick={handleSend} disabled={loading}>
              {loading ? 'Отправка...' : 'Отправить'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StartDialogModal;
