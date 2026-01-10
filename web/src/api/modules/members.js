import httpClient from '../httpClient';
import { ENDPOINTS } from '../endpoints';

/**
 * List members.
 * @param {{is_pi?: number}} params
 * @returns {Promise<Array>}
 */
export async function list(params = {}) {
  const res = await httpClient.get(ENDPOINTS.members.list, { params });
  return res.data?.data || [];
}
