export interface UserPayload {
  sub: string;
  userId: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: {
    id: bigint;
    email: string;
    name: string;
    phone?: string;
    role: string;
  };
  access_token: string;
}
