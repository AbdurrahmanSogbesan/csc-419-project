type User = {
  id: string;
  uuid: string;
  email: string;
  phone: string;
  name: string;
  role: UserRole;
  restrictedUntil: string | null;
  isRestricted: boolean;
  createdAt: string;
  borrowedBooks?: BorrowedBook[];
  reservations?: Reservation[];
  notifications?: UserNotification[];
};

type UserRole = "ADMIN" | "MEMBER";

type GetUsersReponse = {
  data: User[];
  pagination: Pagination;
};

type GetNotificationsParams = {
  page?: number;
  pageSize?: number;
  includeRead?: boolean;
  includeRelations?: boolean;
};

type GetNotificationsResponse = {
  data: UserNotification[];
  pagination: Pagination;
};

type GetUsersParams = {
  page?: number;
  pageSize?: number;
  role?: UserRole;
  search?: string;
};

type NotificationType =
  | "RESERVATION_AVAILABLE"
  | "BOOK_DUE_SOON"
  | "BOOK_OVERDUE"
  | "FINE_ISSUED"
  | "FINE_PAYMENT_REMINDER"
  | "SYSTEM_ANNOUNCEMENT"
  | "BOOK_PICKED_UP"
  | "BOOK_RESERVED"
  | "BOOK_RETURNED"
  | "FINE_PAID"
  | "ACCOUNT_RESTRICTED"
  | "ACCOUNT_UNRESTRICTED";

type UserNotification = {
  id: number;
  uuid: string;
  userId?: number;
  user?: User;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
  bookId?: number;
  book?: Book;
  reservationId?: number;
  reservation?: Reservation;
};
