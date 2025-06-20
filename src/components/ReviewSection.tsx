import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { API } from '../config/api-endpoints';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Pagination } from '@/components/ui/pagination';
import { Link, useSearchParams } from 'react-router-dom';
import ListingSelector from './ListingSelector';
import CoverImage from './CoverImage';
import ImagePicker from './ImagePicker';
import ImageViewerModal from './ImageViewerModal';
import type { ReviewDto, ListingDto } from '@/types/dto.ts';

const ReviewSection: React.FC<{ userId: number }> = ({ userId }) => {
  const [searchParams] = useSearchParams();
  const prefilledListingId = Number(searchParams.get('listingId'));

  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [images, setImages] = useState<File[]>([]);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<ListingDto | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);

  const loadReviews = async () => {
    try {
      const res = await api.get(`/api/reviews/user/${userId}`, {
        params: { page, size: 6 },
      });
      setReviews(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Ошибка при загрузке отзывов:', err);
      setReviews([]);
      setTotalPages(1);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [userId, page]);

  useEffect(() => {
    if (prefilledListingId) {
      api.get(`/api/listings/${prefilledListingId}`)
        .then(res => setSelectedListing(res.data))
        .catch(err => {
          console.warn('Не удалось загрузить объявление по listingId из URL', err);
        });
    }
  }, [prefilledListingId]);

  const handleAddReview = async () => {
    const usedListingId = prefilledListingId || selectedListing?.id;
    if (!usedListingId) {
      alert('Выберите объявление');
      return;
    }

    const form = new FormData();
    form.append(
      'data',
      new Blob(
        [JSON.stringify({ listingId: usedListingId, rating, comment })],
        { type: 'application/json' }
      )
    );
    images.forEach(img => form.append('images', img));

    try {
      await api.post(API.REVIEWS.CREATE, form);
      setComment('');
      setImages([]);
      if (!prefilledListingId) setSelectedListing(null);
      loadReviews();
    } catch (err) {
      console.error('Ошибка при отправке отзыва:', err);
      alert('Не удалось отправить отзыв');
    }
  };

  return (
    <div className="space-y-6">
      {/* форма */}
      <div className="border p-4 rounded-xl space-y-4 shadow-sm">
        <h3 className="text-lg font-semibold">Оставить отзыв</h3>

        <div className="space-y-2">
          <Label>Объявление</Label>
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
              {!prefilledListingId && (
                <Button variant="ghost" onClick={() => setSelectedListing(null)}>
                  Сменить
                </Button>
              )}
            </div>
          ) : (
            !prefilledListingId && (
              <Button onClick={() => setSelectorOpen(true)}>Выбрать объявление пользователя</Button>
            )
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Label>Комментарий</Label>
            <Textarea value={comment} onChange={e => setComment(e.target.value)} rows={4} />
          </div>
          <div className="w-full md:w-32">
            <Label>Оценка</Label>
            <select
              value={rating}
              onChange={e => setRating(+e.target.value)}
              className="w-full border rounded-md px-2 py-2"
            >
              {[5, 4, 3, 2, 1].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        <ImagePicker images={images} setImages={setImages} />

        <Button onClick={handleAddReview}>Оставить отзыв</Button>
      </div>

      {/* список отзывов */}
      <div className="space-y-4">
        {reviews.map(r => (
          <div key={r.id} className="border p-4 rounded-xl flex gap-4">
            <div className="w-16 text-center">
              <Link to={`/profile/${r.fromUser?.id}`}>
                <img
                  src={r.fromUser?.avatarUrl || '/default-avatar.jpg'}
                  alt="avatar"
                  className="w-12 h-12 rounded-full mx-auto hover:opacity-80 transition"
                />
                <div className="text-xs mt-1 hover:underline">{r.fromUser?.name}</div>
              </Link>
            </div>
            <div className="flex-1 space-y-1">
              <div className="text-sm text-muted-foreground">
                {r.createdAt && new Date(r.createdAt).toLocaleDateString()}
              </div>
              <div>{r.comment}</div>
              <div className="text-sm">Оценка: <strong>{r.rating}</strong></div>
              {Array.isArray(r.imageUrls) && r.imageUrls.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {r.imageUrls.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`review-image-${i}`}
                      className="w-20 h-20 object-cover rounded cursor-pointer"
                      onClick={() => {
                        setViewerImages(r.imageUrls);
                        setViewerIndex(i);
                        setViewerOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="w-24 shrink-0 text-center">
              <Link to={`/books/${r.listing?.id}`}>
                <CoverImage
                  src={r.listing?.book?.imageUrl}
                  className="w-20 h-28 object-cover rounded mx-auto hover:opacity-90 transition"
                />
              </Link>
              <Link
                to={`/books/${r.listing?.id}`}
                className="text-xs text-muted-foreground block mt-1 hover:underline"
              >
                {r.listing?.book?.title}, {r.listing?.book?.author}
              </Link>
            </div>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />

      <ListingSelector
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onSelect={(listing) => {
          setSelectedListing(listing);
          setSelectorOpen(false);
        }}
        userId={userId}
      />

      <ImageViewerModal
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        images={viewerImages}
        initialIndex={viewerIndex}
      />
    </div>
  );
};

export default ReviewSection;
