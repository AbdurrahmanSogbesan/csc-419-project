import Cookies from "js-cookie";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TokenManagerConfig {
  accessTokenKey: string;
  cookieOptions?: Cookies.CookieAttributes;
}

const TOKEN_CONFIG: TokenManagerConfig = {
  accessTokenKey: "access_token",
  cookieOptions: {
    secure: import.meta.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: 1, // 1 day
  },
};

export const tokenManager = {
  clearToken: (): void => {
    Cookies.remove(TOKEN_CONFIG.accessTokenKey, TOKEN_CONFIG.cookieOptions);
  },

  setToken: (token: string): void => {
    if (!token) {
      throw new Error("Invalid token provided");
    }
    Cookies.set(TOKEN_CONFIG.accessTokenKey, token, TOKEN_CONFIG.cookieOptions);
  },

  getToken: () => Cookies.get(TOKEN_CONFIG.accessTokenKey),
};
