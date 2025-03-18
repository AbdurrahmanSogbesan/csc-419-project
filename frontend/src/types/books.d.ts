type Book = {
  id: string;
  ISBN: string;
  title: string;
  author: string;
  category: string;
  copiesAvailable: number;
  copiesBorrowed: number;
  publishedYear: number;
  createdAt: string;
  imageUrl?: string;
  borrowCount: number;
  savedBooks?: SavedBook[];
  pages?: number;
  language?: string;
  description?: string;
  reservations?: Reservation[];
};

type SavedBook = {
  id: string;
  uuid: string;
  userId?: string;
  user?: User;
  bookId?: string;
  book?: Book;
  createdAt: string;
};

type GetBooksQueryParams = {
  search?: string;
  title?: string;
  author?: string;
  category?: string;
  ISBN?: string;
  publishedYear?: number;
  publishedYearStart?: number;
  publishedYearEnd?: number;
  availabilityStatus?: "available" | "unavailable";
  popularBooks?: boolean;
};

type GetReservedBooksQueryParams = GetBooksQueryParams & {
  bookId?: number;
  status?: ReservationStatus;
  startDate?: string;
  endDate?: string;
  notified?: string;
  reservationId?: number;
  page?: number;
  pageSize?: number;
  scope?: "user" | "all";
};

type BorrowedBook = {
  id: string;
  uuid: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  userId?: string;
  user?: User;
  bookId?: string;
  book?: Book;
};

type ReservationStatus =
  | "RESERVED"
  | "BORROWED"
  | "RETURNED"
  | "OVERDUE"
  | "CANCELLED";

type Reservation = {
  id: string;
  uuid: string;
  userId?: string;
  user?: User;
  bookId?: string;
  book?: Book;
  reservationDate: string;
  reservedUntil: string | null;
  status: ReservationStatus;
  notified: boolean;
  borrowedBook?: BorrowedBook;
};
