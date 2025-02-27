import Cookies from "js-cookie";

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
    // todo: Consider adding 'expires' based on your JWT expiration
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
