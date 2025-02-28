export interface UserPayload {
  sub: string;
  userId: string;
  name: string;
  email: string;
}

export interface LoginResponse {
  access_token: string;
}
