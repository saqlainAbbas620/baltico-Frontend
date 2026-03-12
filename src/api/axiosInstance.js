import axios from "axios";

// ── Base instance ─────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: "https://baltico-backend.vercel.app/api",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // send HttpOnly refresh cookie automatically
});

// ── Token helpers ─────────────────────────────────────────────────────────────
export const getToken   = ()  => localStorage.getItem("baltico_token");
export const setToken   = (t) => localStorage.setItem("baltico_token", t);
export const clearToken = ()  => localStorage.removeItem("baltico_token");

// ── Refresh queue — prevent multiple simultaneous refresh requests ─────────────
let isRefreshing = false;
let refreshQueue = []; // [{resolve, reject}]

function processQueue(error, token = null) {
  refreshQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  refreshQueue = [];
}

// ── Request interceptor — attach access token ─────────────────────────────────
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor — auto-refresh on 401 ───────────────────────────────
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const original = error.config;

    if (
      error.response?.status !== 401 ||
      original._retry ||
      original.url?.includes("/auth/refresh") ||
      original.url?.includes("/auth/login") ||
      original.url?.includes("/auth/register")
    ) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        })
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || "/api"}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const newToken = res.data?.data?.token;
      if (!newToken) throw new Error("No token in refresh response");

      setToken(newToken);
      processQueue(null, newToken);

      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearToken();
      window.dispatchEvent(new CustomEvent("baltico:session-expired"));
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
