import axios, { Axios, AxiosError } from "axios";
import { API_BASE_URL } from "./constants";
import { convertArrayToString, tokenManager } from "./utils";
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
  (res) => {
    if (res.data?.errorMessage || (res.status !== 200 && res.data?.message)) {
      const errorMessage =
        res.data?.errorMessage || convertArrayToString(res.data?.message);
      const error = new Error(errorMessage) as AxiosError;
      error.response = res;
      throw error;
    }
    return res;
  },
  (error) => {
    if (error instanceof AxiosError) {
      const message =
        error.response?.data?.errorMessage ||
        convertArrayToString(error.response?.data?.message) ||
        error.response?.data?.error ||
        error.message;
      error.message = message;

      // Handle authentication errors
      if (error.response?.status === 401) {
        handleAuthError();
      }
    }

    throw error;
  },
);

function handleAuthError() {
  useAuthStore.getState().logout();
}

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
