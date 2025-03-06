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

type Tab = {
  label: string;
  count?: number;
  value: string;
};
