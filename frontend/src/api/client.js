import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const client = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

function getAccessToken() {
  return localStorage.getItem("kikapu_access_token");
}

function getRefreshToken() {
  return localStorage.getItem("kikapu_refresh_token");
}

export function setTokens({ access_token, refresh_token }) {
  if (access_token) localStorage.setItem("kikapu_access_token", access_token);
  if (refresh_token) localStorage.setItem("kikapu_refresh_token", refresh_token);
}

export function clearTokens() {
  localStorage.removeItem("kikapu_access_token");
  localStorage.removeItem("kikapu_refresh_token");
}

client.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise = null;

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const isAuthRoute = config?.url?.includes("/auth/login") || config?.url?.includes("/auth/refresh");

    if (response?.status === 401 && !config._retry && !isAuthRoute && getRefreshToken()) {
      config._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(
              `${API_URL}/auth/refresh`,
              {},
              { headers: { Authorization: `Bearer ${getRefreshToken()}` } }
            )
            .finally(() => {
              refreshPromise = null;
            });
        }
        const { data } = await refreshPromise;
        setTokens({ access_token: data.access_token });
        config.headers.Authorization = `Bearer ${data.access_token}`;
        return client(config);
      } catch (refreshError) {
        clearTokens();
        window.dispatchEvent(new Event("kikapu:logout"));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default client;
