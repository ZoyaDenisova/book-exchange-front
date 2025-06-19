export const API = {

  AUTH: {
    LOGIN: '/api/users/login',
    REGISTER: '/api/users/register',
    PROFILE: '/api/users/profile',
  },
  
  BOOKS: {
    LIST: '/api/books',
    DETAIL: (id: string | number) => `/api/books/${id}`,
    USER_BOOKS: '/api/books/user/books',
    BY_CATEGORY: (categoryId: string | number) => `/api/books/category/${categoryId}`,
  },

  CATEGORIES: {
    LIST: '/api/categories',
    DETAIL: (id: string | number) => `/api/categories/${id}`,
  },
  
  EXCHANGES: {
    LIST: '/api/exchanges',
    DETAIL: (id: string | number) => `/api/exchanges/${id}`,
    USER_EXCHANGES: '/api/exchanges/user',
  },
  
  REVIEWS: {
    LIST: '/api/reviews',
    DETAIL: (id: string | number) => `/api/reviews/${id}`,
    BOOK_REVIEWS: (bookId: string | number) => `/api/reviews/book/${bookId}`,
    USER_REVIEWS: '/api/reviews/user/reviews',
  },
  
  ADMIN: {
    DASHBOARD: '/api/admin/dashboard',
    BOOKS: {
      LIST: '/api/admin/books',
      DETAIL: (id: string | number) => `/api/admin/books/${id}`,
      UPDATE_STATUS: (id: string | number) => `/api/admin/books/${id}/status`
    },
    USERS: {
      LIST: '/api/admin/users',
      DETAIL: (id: string | number) => `/api/admin/users/${id}`,
      UPDATE_ROLE: (id: string | number) => `/api/admin/users/${id}/role`,
      BLOCK: (id: string | number) => `/api/admin/users/${id}/block`
    },
    EXCHANGES: {
      LIST: '/api/admin/exchanges',
      DETAIL: (id: string | number) => `/api/admin/exchanges/${id}`,
      RESOLVE: (id: string | number) => `/api/admin/exchanges/${id}/resolve`
    },
    ANALYTICS: {
      EXCHANGE_STATS: '/api/admin/analytics/exchanges',
      BOOK_STATS: '/api/admin/analytics/books',
      USER_STATS: '/api/admin/analytics/users'
    }
  }
}; 