// components/ImageViewerModal.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageViewerModalProps {
  images: string[];
  open: boolean;
  onClose: () => void;
  initialIndex?: number;
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ images, open, onClose, initialIndex = 0 }) => {
  const [current, setCurrent] = useState(initialIndex);

  const goPrev = () => setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const goNext = () => setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-4 flex flex-col items-center">
        <button onClick={onClose} className="absolute top-4 right-4">
          <X size={20} />
        </button>
        {images.length > 0 && (
          <div className="relative w-full max-w-2xl">
            <img
              src={images[current]}
              alt={`image-${current}`}
              className="w-full h-auto max-h-[80vh] object-contain rounded"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={goPrev}
                  className="absolute top-1/2 left-0 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full"
                >
                  <ChevronLeft />
                </button>
                <button
                  onClick={goNext}
                  className="absolute top-1/2 right-0 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full"
                >
                  <ChevronRight />
                </button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewerModal;
