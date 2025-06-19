export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  status: string;
  owner_id: number;
  category_id: number;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Exchange {
  id: number;
  book_id: number;
  requester_id: number;
  owner_id: number;
  status: 'ожидает' | 'принято' | 'отклонено' | 'завершено' | 'отменено';
  created_at: string;
  book_title: string;
  book_author: string;
  requester_name: string;
  owner_name: string;
}

export interface Review {
  id: number;
  book_id: number;
  user_id: number;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  book?: Book;
  user?: User;
}

export interface BookWithOwner extends Book {
  owner?: User;
}

export interface ExchangeWithDetails extends Exchange {
  book: Book;
  requester: User;
  owner: User;
} 