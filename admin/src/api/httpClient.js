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
      const baseUrl = import.meta.env.BASE_URL || '/';
      const basePath = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      const pathname = window.location.pathname;
      const search = window.location.search || '';
      const appPath = basePath && pathname.startsWith(basePath)
        ? pathname.slice(basePath.length) || '/'
        : pathname || '/';
      if (!appPath.startsWith('/login')) {
        const redirect = encodeURIComponent(`${appPath}${search}`);
        window.location.href = `${basePath}/login?redirect=${redirect}`;
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
