type User = {
  id: string;
  uuid: string;
  email: string;
  phone: string;
  name: string;
  role: UserRole;
  createdAt: string;
  borrowedBooks?: BorrowedBook[];
};

type UserRole = "ADMIN" | "MEMBER";

type GetUsersReponse = {
  users: User[];
  total: number;
  pagination: Pagination;
};

type GetUsersParams = {
  page?: number;
  limit?: number;
  role?: UserRole;
};
