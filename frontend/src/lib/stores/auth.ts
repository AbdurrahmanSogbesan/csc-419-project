import { create } from "zustand";
import { persist } from "zustand/middleware";
import { tokenManager } from "../utils";

interface AuthState {
  user: AuthResponse["user"] | null;
  isAuthenticated: boolean;
  setUser: (user: AuthResponse["user"]) => void;
  login: (data: AuthResponse) => void;
  logout: () => void;
  checkAuth: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: true }),

      login: (data) => {
        const { access_token, user } = data;

        if (!access_token || !user) {
          throw new Error("Invalid data");
        }

        try {
          tokenManager.setToken(access_token);
          set({ isAuthenticated: true, user });
        } catch (error) {
          console.error("Failed to set tokens:", error);
          get().logout();
        }
      },

      logout: () => {
        tokenManager.clearToken();
        set({ user: null, isAuthenticated: false });
      },

      checkAuth: () => {
        const accessToken = tokenManager.getToken();
        if (!accessToken) {
          get().logout();
          return false;
        }
        return true;
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
