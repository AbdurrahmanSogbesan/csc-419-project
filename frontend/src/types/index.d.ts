type Pagination = {
  currentPage: number;
  pageSize: number;
  totalPages: number;
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
