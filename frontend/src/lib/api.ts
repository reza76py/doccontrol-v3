import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_BASE_URL = `${VITE_API_URL}/api`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401, queue concurrent requests while refreshing
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      isRefreshing = false;
      localStorage.removeItem("access_token");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(`${VITE_API_URL}/token/refresh/`, {
        refresh: refreshToken,
      });
      localStorage.setItem("access_token", data.access);
      api.defaults.headers.common.Authorization = `Bearer ${data.access}`;
      processQueue(null, data.access);
      original.headers.Authorization = `Bearer ${data.access}`;
      return api(original);
    } catch (err) {
      processQueue(err, null);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);


export const authApi = {
  // Login hits /token/ directly — not under the /api prefix
  login: (username: string, password: string) =>
    axios.post<{ access: string; refresh: string }>(`${VITE_API_URL}/token/`, { username, password }),

  register: (username: string, email: string, password: string) =>
    api.post("/auth/register/", { username, email, password }),

  verifyEmail: (uid: string, token: string) =>
    api.get(`/auth/verify-email/${uid}/${token}/`),

  profile: () =>
    api.get<{ id: number; username: string; email: string; name: string; role: string }>(
      "/auth/profile/"
    ),

  updateProfile: (data: { email: string }) =>
    api.put("/auth/profile/", data),

  requestPasswordReset: (email: string) =>
    api.post("/auth/password-reset/", { email }),

  confirmPasswordReset: (
    uid: string,
    token: string,
    new_password: string,
    confirm_password: string
  ) =>
    api.post("/auth/password-reset-confirm/", { uid, token, new_password, confirm_password }),
};
