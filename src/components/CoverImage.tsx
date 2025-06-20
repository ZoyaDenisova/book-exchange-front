import React from 'react';

interface CoverImageProps {
  src?: string;
  alt?: string;
  className?: string;
}

const CoverImage: React.FC<CoverImageProps> = ({ src, alt = 'Обложка книги', className = '' }) => {
  const fallback = '/book-placeholder.jpg';
  return (
    <img
      src={src || fallback}
      alt={alt}
      className={`object-cover rounded ${className}`}
    />
  );
};

export default CoverImage;
