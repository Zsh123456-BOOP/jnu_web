import httpClient from '../httpClient';
import { ENDPOINTS } from '../endpoints';

/**
 * List members.
 * @param {{page?: number, pageSize?: number, is_pi?: number}} params
 * @returns {Promise<{items: Array, total: number, page: number, pageSize: number}>}
 */
export async function list(params = {}) {
  const res = await httpClient.get(ENDPOINTS.members.list, { params });
  return res.data?.data || { items: [], total: 0, page: 1, pageSize: params.pageSize || 20 };
}

/**
 * Create a member.
 * @param {object} payload
 * @returns {Promise<object|null>}
 */
export async function create(payload) {
  const res = await httpClient.post(ENDPOINTS.members.list, payload);
  return res.data?.data || null;
}

/**
 * Update a member.
 * @param {number|string} id
 * @param {object} payload
 * @returns {Promise<object|null>}
 */
export async function update(id, payload) {
  const res = await httpClient.put(ENDPOINTS.members.byId(id), payload);
  return res.data?.data || null;
}

/**
 * Delete a member.
 * @param {number|string} id
 * @returns {Promise<null>}
 */
export async function remove(id) {
  await httpClient.delete(ENDPOINTS.members.byId(id));
  return null;
}

export async function getPiInfo(id) {
  const res = await httpClient.get(ENDPOINTS.members.piInfo(id));
  return res.data || null;
}

export async function updatePiInfo(id, payload) {
  const res = await httpClient.put(ENDPOINTS.members.piInfo(id), payload);
  return res.data?.data || null;
}
