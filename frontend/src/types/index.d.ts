type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "MEMBER";
};

type AuthResponse = {
  access_token: string;
  user: User;
};

type Book = {
  image: string;
  title: string;
  author: string;
  id?: number;
  userId?: number;
};

type Tab = {
  label: string;
  count?: number;
  value: string;
};
