export const API = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
    LOGOUT_ALL: '/api/auth/logout-all',
    PROFILE: '/api/auth/me',
    UPDATE_PROFILE: '/api/auth/me',
    CHANGE_PASSWORD: '/api/auth/password',
    AVATAR: '/api/auth/avatar',
    USERS: (id: number) => `/api/auth/users/${id}`,
    ALL_USERS: '/api/auth/users',
    BAN: (id: number) => `/api/auth/ban/${id}`,
    UNBAN: (id: number) => `/api/auth/unban/${id}`,
    ROLE: (id: number) => `/api/auth/role/${id}`,
    SESSIONS: '/api/auth/sessions',
  },

  CATALOG: {
    ADD: '/api/catalog',
    DETAIL: (id: number) => `/api/catalog/${id}`,
    DELETE: (id: number) => `/api/catalog/${id}`,
    PATCH: (id: number) => `/api/catalog/${id}`,
    FILTER: '/api/catalog/filter',
    IMAGE_UPLOAD: (id: number) => `/api/catalog/${id}/image`,
    IMAGE_DELETE: (imageId: number) => `/api/catalog/images/${imageId}`,
    GENRES: '/api/catalog/genres',
    WANTED_ADD: (bookId: number) => `/api/catalog/wanted/${bookId}`,
    WANTED_REMOVE: (bookId: number) => `/api/catalog/wanted/${bookId}`,
    WANTED_LIST: (userId: number) => `/api/catalog/wanted/${userId}`,
    WANTED_COUNT: (bookId: number) => `/api/catalog/wanted/count/${bookId}`,
  },

  LISTINGS: {
    CREATE: '/api/listings',
    DETAIL: (id: number) => `/api/listings/${id}`,
    DELETE: (id: number) => `/api/listings/${id}`,
    PATCH: (id: number) => `/api/listings/${id}`,
    FILTER: '/api/listings/filter',
    BLOCK: (id: number) => `/api/listings/${id}/block`,
    UNBLOCK: (id: number) => `/api/listings/${id}/unblock`,
    CLOSE: (id: number) => `/api/listings/${id}/close`,
    USER_ALL: (userId: number) => `/api/listings/user/${userId}/all`,
    SEARCH_CITIES: '/api/listings/cities/search',
  },

  EXCHANGE: {
    LIST: '/api/exchange',
    PROPOSE: '/api/exchange',
    USER: '/api/exchange',
    APPROVE: (id: number) => `/api/exchange/${id}/approve`,
    REJECT: (id: number) => `/api/exchange/${id}/reject`,
    CONFIRM: (id: number) => `/api/exchange/${id}/confirm`,
  },

  MESSAGING: {
    DIALOGS: '/api/messages/dialogs',
    DIALOG_DETAIL: (id: number) => `/api/messages/dialogs/${id}`,
    MESSAGES: (id: number) => `/api/messages/dialogs/${id}/messages`,
    SEND_MESSAGE: (listingId: number) => `/api/messages/listing/${listingId}/send`,
    PROPOSE_EXCHANGE: (listingId: number, offeredId: number) =>
      `/api/messages/listing/${listingId}/propose-exchange?offeredListingId=${offeredId}`,
  },

  REVIEWS: {
    CREATE: '/api/reviews/create',
    COMPLAINT: '/api/reviews/complaint',
    BY_LISTING: (listingId: number) => `/api/reviews/listing/${listingId}`,
    COMPLAINTS_BY_LISTING: (listingId: number) => `/api/reviews/listing/${listingId}/complaints`,
    USER_REVIEWS: (userId: number) => `/api/reviews/user/${userId}`,
    USER_RATING: (userId: number) => `/api/reviews/user/${userId}/rating`,
    REJECT: (id: number) => `/api/reviews/${id}/reject`,
    APPROVE: (id: number) => `/api/reviews/${id}/approve`,
    COMPLAINT_REVIEWED: (id: number) => `/api/reviews/complaint/${id}/reviewed`,
  },
  // AUTH: {
  //   LOGIN: '/api/users/login',
  //   REGISTER: '/api/users/register',
  //   PROFILE: '/api/users/profile',
  // },
  //
  // BOOKS: {
  //   LIST: '/api/books',
  //   DETAIL: (id: string | number) => `/api/books/${id}`,
  //   USER_BOOKS: '/api/books/user/books',
  //   BY_CATEGORY: (categoryId: string | number) => `/api/books/category/${categoryId}`,
  // },
  //
  // CATEGORIES: {
  //   LIST: '/api/categories',
  //   DETAIL: (id: string | number) => `/api/categories/${id}`,
  // },
  //
  // EXCHANGES: {
  //   LIST: '/api/exchanges',
  //   DETAIL: (id: string | number) => `/api/exchanges/${id}`,
  //   USER_EXCHANGES: '/api/exchanges/user',
  // },
  //
  // REVIEWS: {
  //   LIST: '/api/reviews',
  //   DETAIL: (id: string | number) => `/api/reviews/${id}`,
  //   BOOK_REVIEWS: (bookId: string | number) => `/api/reviews/book/${bookId}`,
  //   USER_REVIEWS: '/api/reviews/user/reviews',
  // },
  //
  // ADMIN: {
  //   DASHBOARD: '/api/admin/dashboard',
  //   BOOKS: {
  //     LIST: '/api/admin/books',
  //     DETAIL: (id: string | number) => `/api/admin/books/${id}`,
  //     UPDATE_STATUS: (id: string | number) => `/api/admin/books/${id}/status`
  //   },
  //   USERS: {
  //     LIST: '/api/admin/users',
  //     DETAIL: (id: string | number) => `/api/admin/users/${id}`,
  //     UPDATE_ROLE: (id: string | number) => `/api/admin/users/${id}/role`,
  //     BLOCK: (id: string | number) => `/api/admin/users/${id}/block`
  //   },
  //   EXCHANGES: {
  //     LIST: '/api/admin/exchanges',
  //     DETAIL: (id: string | number) => `/api/admin/exchanges/${id}`,
  //     RESOLVE: (id: string | number) => `/api/admin/exchanges/${id}/resolve`
  //   },
  //   ANALYTICS: {
  //     EXCHANGE_STATS: '/api/admin/analytics/exchanges',
  //     BOOK_STATS: '/api/admin/analytics/books',
  //     USER_STATS: '/api/admin/analytics/users'
  //   }
  // }
}; 