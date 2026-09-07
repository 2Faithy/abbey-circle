import axios from "axios";

const BASE_URL = "http://localhost:4000";

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send the httpOnly refresh cookie
});

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isRefreshCall = originalRequest.url?.includes("/auth/refresh");

if (error.response?.status === 401 && !originalRequest._retry && !isRefreshCall) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue this request until the in-flight refresh finishes
        return new Promise((resolve) => {
          refreshQueue.push(() => resolve(api(originalRequest)));
        });
      }

      isRefreshing = true;
      try {
        const res = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        setAccessToken(res.data.accessToken);
        refreshQueue.forEach((cb) => cb());
        refreshQueue = [];
        return api(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);