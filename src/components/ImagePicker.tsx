// components/ImagePicker.tsx
import React from 'react';
import { X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ImagePickerProps {
  images: File[];
  setImages: (files: File[]) => void;
  maxCount?: number;
}

const ImagePicker: React.FC<ImagePickerProps> = ({ images, setImages, maxCount = 3 }) => {
  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, maxCount - images.length);
    setImages([...images, ...files]);
  };

  const removeImage = (index: number) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
  };

  return (
    <div className="space-y-2">
      <Label>Изображения (до {maxCount})</Label>
      <Input type="file" multiple accept="image/*" onChange={handleFiles} />
      <div className="flex gap-2 mt-2">
        {images.map((file, idx) => (
          <div key={idx} className="relative w-16 h-16">
            <img
              src={URL.createObjectURL(file)}
              alt="preview"
              className="object-cover w-16 h-16 rounded border"
            />
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute top-[-8px] right-[-8px] bg-white border rounded-full p-[2px] shadow"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImagePicker;
