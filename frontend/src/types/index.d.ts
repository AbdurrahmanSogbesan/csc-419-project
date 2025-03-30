type Pagination = {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  total?: number;
};

type AuthResponse = {
  access_token: string;
  user: Pick<User, "id" | "uuid" | "email" | "name" | "phone" | "role">;
};

type Tab = {
  label: string;
  count?: number;
  value: string;
};

type LibraryStats = {
  totalBooks: number;
  totalLendedBooks: number;
  currentlyLendedBooks: number;
  availableBooks: number;
  totalUsers: number;
  overdueBooks: number;
};

type MonthData = {
  month: string;
  [key: string]: string | number;
};

type UploadImageResponse = {
  url: string;
  name: string;
  size: number;
};

type FineStatus = "UNPAID" | "PAID";

type Fine = {
  id: string;
  uuid: string;
  user: User;
  userId?: string;
  book?: Book;
  bookId?: string;
  status: FineStatus;
  createdAt: string;
  paidAt?: string;
  amount: number;
};
