type User = {
  id: string;
  uuid: string;
  email: string;
  phone: string;
  name: string;
  role: UserRole;
  createdAt: string;
  borrowedBooks?: BorrowedBook[];
  reservations?: Reservation[];
};

type UserRole = "ADMIN" | "MEMBER";

type GetUsersReponse = {
  data: User[];
  pagination: Pagination;
};

type GetUsersParams = {
  page?: number;
  pageSize?: number;
  role?: UserRole;
};
