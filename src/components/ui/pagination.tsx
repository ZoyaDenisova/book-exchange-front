import React from 'react';
import { Button } from './button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const renderPages = () => {
    const pages = [];

    const start = Math.max(0, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 3);

    for (let i = start; i < end; i++) {
      pages.push(
        <Button
          key={i}
          size="sm"
          variant={i === currentPage ? 'default' : 'outline'}
          onClick={() => onPageChange(i)}
          className="mx-1"
        >
          {i + 1}
        </Button>
      );
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center mt-6 gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={currentPage === 0}
        onClick={() => onPageChange(currentPage - 1)}
      >
        ←
      </Button>

      {renderPages()}

      <Button
        size="sm"
        variant="outline"
        disabled={currentPage >= totalPages - 1}
        onClick={() => onPageChange(currentPage + 1)}
      >
        →
      </Button>
    </div>
  );
};
