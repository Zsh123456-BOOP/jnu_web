import httpClient from '../httpClient';
import { ENDPOINTS } from '../endpoints';

/**
 * List contents.
 * @param {{moduleId?: number, moduleSlug?: string, status?: string, year?: number, keyword?: string, page?: number, pageSize?: number}} params
 * @returns {Promise<{items: Array, total: number, page: number, pageSize: number}>}
 */
export async function list(params = {}) {
  const res = await httpClient.get(ENDPOINTS.contents.list, { params });
  return res.data?.data || { items: [], total: 0, page: 1, pageSize: params.pageSize || 20 };
}

/**
 * Fetch content by id.
 * @param {number|string} id
 * @returns {Promise<object|null>}
 */
export async function get(id) {
  const res = await httpClient.get(ENDPOINTS.contents.byId(id));
  return res.data?.data || null;
}

/**
 * Create content.
 * @param {object} payload
 * @returns {Promise<object|null>}
 */
export async function create(payload) {
  const res = await httpClient.post(ENDPOINTS.contents.list, payload);
  return res.data?.data || null;
}

/**
 * Update content.
 * @param {number|string} id
 * @param {object} payload
 * @returns {Promise<object|null>}
 */
export async function update(id, payload) {
  const res = await httpClient.put(ENDPOINTS.contents.byId(id), payload);
  return res.data?.data || null;
}

/**
 * Delete content.
 * @param {number|string} id
 * @returns {Promise<null>}
 */
export async function remove(id) {
  await httpClient.delete(ENDPOINTS.contents.byId(id));
  return null;
}
