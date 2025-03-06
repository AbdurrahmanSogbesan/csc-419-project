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
