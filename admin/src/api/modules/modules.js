import httpClient from '../httpClient';
import { ENDPOINTS } from '../endpoints';

/**
 * List modules.
 * @param {{page?: number, pageSize?: number}} params
 * @returns {Promise<{items: Array, total: number, page: number, pageSize: number}>}
 */
export async function list(params = {}) {
  const res = await httpClient.get(ENDPOINTS.modules.list, { params });
  return res.data?.data || { items: [], total: 0, page: 1, pageSize: params.pageSize || 20 };
}

/**
 * Fetch a module by id.
 * @param {number|string} id
 * @returns {Promise<object|null>}
 */
export async function get(id) {
  const res = await httpClient.get(ENDPOINTS.modules.byId(id));
  return res.data?.data || null;
}

/**
 * Create a module.
 * @param {object} payload
 * @returns {Promise<object|null>}
 */
export async function create(payload) {
  const res = await httpClient.post(ENDPOINTS.modules.list, payload);
  return res.data?.data || null;
}

/**
 * Update a module.
 * @param {number|string} id
 * @param {object} payload
 * @returns {Promise<object|null>}
 */
export async function update(id, payload) {
  const res = await httpClient.put(ENDPOINTS.modules.byId(id), payload);
  return res.data?.data || null;
}

/**
 * Delete a module.
 * @param {number|string} id
 * @returns {Promise<null>}
 */
export async function remove(id) {
  await httpClient.delete(ENDPOINTS.modules.byId(id));
  return null;
}
