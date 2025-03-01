type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "user";
};

type AuthResponse = {
  access_token: string;
  user: User;
};
