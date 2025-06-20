export interface SortObject {
  sorted?: boolean;
  unsorted?: boolean;
  empty?: boolean;
}

export interface PageableObject {
  paged?: boolean;
  pageSize?: number;
  pageNumber?: number;
  unpaged?: boolean;
  offset?: number;
  sort?: SortObject;
}

export interface CreateReviewDto {
  listingId?: number;
  rating?: number;
  comment?: string;
}

export interface CreateComplaintDto {
  listingId?: number;
  comment?: string;
}

export interface CreateListingDto {
  bookId?: number;
  condition?: string;
  cityId?: number;
}

export interface ListingDto {
  id: number;
  book: {
    id: number;
    title: string;
    author: string;
    description?: string;
    imageUrl?: string;
  };
  city: {
    id: number;
    name: string;
  };
  owner: {
    id: number;
    name: string;
    avatarUrl?: string;
  };
  condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';
  imageUrls: string[];
  isOpen: boolean;
  isBlocked: boolean;
  createdAt: string;
}

export interface ListingFilterDto {
  title?: string;
  author?: string;
  genreIds?: number[];
  condition?: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';
  cityId?: number;
  isBlocked?: boolean;
}

export interface PageListingDto {
  totalElements?: number;
  totalPages?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  pageable?: PageableObject;
  size?: number;
  content?: ListingDto[];
  number?: number;
  sort?: SortObject;
  empty?: boolean;
}

export interface ExchangeCreateDto {
  offeredListingId?: number;
  selectedListingId?: number;
}

export interface ExchangeDto {
  id: number;
  sender: UserDto;
  receiver: UserDto;
  offeredListing: ListingDto;
  selectedListing: ListingDto;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED'; // зависит от enum на бэке
  senderConfirmedCompletion: boolean;
  receiverConfirmedCompletion: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface CreateBookDto {
  title?: string;
  author?: string;
  year?: number;
  description?: string;
  genreIds?: number[];
  ageCategory?: string;
}

export interface BookDto {
  id?: number;
  title?: string;
  author?: string;
  year?: number;
  description?: string;
  genres?: string[];
  ageCategory?: string;
  imageUrl?: string;
  moderationStatus?: string;
  createdById?: number;
  createdAt?: string;
}

export interface BookFilterDto {
  title?: string;
  author?: string;
  ageCategories?: string[];
  genreIds?: number[];
}

export interface PageBookDto {
  totalElements?: number;
  totalPages?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  pageable?: PageableObject;
  size?: number;
  content?: BookDto[];
  number?: number;
  sort?: SortObject;
  empty?: boolean;
}

export interface RegisterDto {
  name?: string;
  email?: string;
  password?: string;
  cityId?: number;
}

export interface TokenPairDto {
  accessToken?: string;
  refreshToken?: string;
  accessExpires?: string;
  refreshExpires?: string;
}

export interface LoginDto {
  email?: string;
  password?: string;
}

export interface UpdateListingDto {
  condition?: string;
  cityId?: number;
}

export interface UpdateBookDto {
  title?: string;
  author?: string;
  year?: number;
  description?: string;
  genreIds?: number[];
  ageCategory?: string;
}

export interface ChangeRoleDto {
  role?: string;
}

export interface ChangePasswordDto {
  oldPassword?: string;
  newPassword?: string;
}

export interface UpdateUserDto {
  name?: string;
  avatarUrl?: string;
  cityId?: number;
}

export interface ReviewDto {
  id: number;
  listing: ListingDto;
  fromUser: UserDto;
  toUser: UserDto;
  rating: number;
  comment: string;
  moderationStatus: string;
  imageUrls: string[];
  createdAt: string;
}


export interface ComplaintDto {
  id?: number;
  listingId?: number;
  fromUserId?: number;
  toUserId?: number;
  comment?: string;
  isReviewed?: boolean;
  imageUrls?: string[];
  createdAt?: string;
}

export interface DialogDto {
  dialogId?: number;
  listingId?: number;
  bookTitle?: string;
  bookAuthor?: string;
  bookImageUrl?: string;
  bookCondition?: string;
  listingOwnerId?: number;
  listingOwnerName?: string;
  listingOwnerAvatar?: string;
  lastMessageContent?: string;
  lastMessageAuthor?: string;
  lastMessageTime?: string;
}

export interface MessageDto {
  messageId: number;
  authorId: number;
  authorName: string;
  content: string;
  imageUrls: string[];
  exchange?: ExchangeDto;
  isExchangeProposal: boolean;
  createdAt: string;
}

export interface CityDto {
  id: number;
  name: string;
  region: string;
  country: string;
}

export interface PageExchangeDto {
  totalElements?: number;
  totalPages?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  pageable?: PageableObject;
  size?: number;
  content?: ExchangeDto[];
  number?: number;
  sort?: SortObject;
  empty?: boolean;
}

export interface GenreDto {
  id?: number;
  name?: string;
}

export interface UserDto {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  isBanned: boolean;
  city: CityDto;
}

export interface SessionDto {
  id?: number;
  refreshToken?: string;
  createdAt?: string;
  expiresAt?: string;
}