import axios from 'axios';

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  withCredentials: true,
  timeout: 15000
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status !== undefined && error && !error.status) {
      error.status = status;
    }
    if (status === 401 && typeof window !== 'undefined') {
      const currentPath = `${window.location.pathname}${window.location.search}`;
      if (!currentPath.startsWith('/login')) {
        const redirect = encodeURIComponent(currentPath);
        window.location.href = `/login?redirect=${redirect}`;
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error, fallback = 'Request failed') {
  if (!error) {
    return fallback;
  }
  const responseMessage = error.response?.data?.error?.message;
  if (responseMessage) {
    return responseMessage;
  }
  return error.message || fallback;
}

export default httpClient;
