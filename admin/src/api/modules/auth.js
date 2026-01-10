import httpClient from '../httpClient';
import { ENDPOINTS } from '../endpoints';

/**
 * Login and return admin profile.
 * @param {{username: string, password: string}} payload
 * @returns {Promise<object|null>}
 */
export async function login(payload) {
  const res = await httpClient.post(ENDPOINTS.auth.login, payload);
  return res.data?.data || null;
}

/**
 * Fetch current admin profile.
 * @returns {Promise<object|null>}
 */
export async function me() {
  const res = await httpClient.get(ENDPOINTS.auth.me);
  return res.data?.data || null;
}

/**
 * Logout.
 * @returns {Promise<null>}
 */
export async function logout() {
  await httpClient.post(ENDPOINTS.auth.logout);
  return null;
}
