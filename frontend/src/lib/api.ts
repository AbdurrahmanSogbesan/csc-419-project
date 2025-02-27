import axios, { Axios } from "axios";
import { API_BASE_URL } from "./constants";
import { tokenManager } from "./utils";
import { useAuthStore } from "./stores/auth";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000, // 10 seconds
});

api.interceptors.request.use((config) => {
  const accessToken = tokenManager.getToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 Unauthorized errors (expired/invalid token)
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }

    return Promise.reject(error);
  },
);

export const apiGet = <T = unknown>(...args: Parameters<Axios["get"]>) =>
  api.get<T>(...args).then((r) => r.data);
export const apiPost = <T = unknown>(...args: Parameters<Axios["post"]>) =>
  api.post<T>(...args).then((r) => r.data);
export const apiDelete = <T = unknown>(...args: Parameters<Axios["delete"]>) =>
  api.delete<T>(...args).then((r) => r.data);
export const apiPatch = <T = unknown>(...args: Parameters<Axios["patch"]>) =>
  api.patch<T>(...args).then((r) => r.data);
export const apiRequest = <T = unknown>(
  ...args: Parameters<Axios["request"]>
) => api.request<T>(...args).then((r) => r.data);

export default api;
