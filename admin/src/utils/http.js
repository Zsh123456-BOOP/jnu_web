import axios from 'axios';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  withCredentials: true,
  timeout: 15000
});

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

export default http;
