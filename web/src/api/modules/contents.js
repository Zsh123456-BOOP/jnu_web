import httpClient from '../httpClient';
import { ENDPOINTS } from '../endpoints';

/**
 * List contents.
 * @param {{moduleSlug?: string, year?: number|string, keyword?: string, page?: number, pageSize?: number}} params
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
export async function getById(id) {
  const res = await httpClient.get(ENDPOINTS.contents.byId(id));
  return res.data?.data || null;
}

/**
 * Fetch page content by module/page slug.
 * @param {string} moduleSlug
 * @param {string} pageSlug
 * @returns {Promise<object|null>}
 */
export async function getBySlug(moduleSlug, pageSlug) {
  const res = await httpClient.get(ENDPOINTS.contents.pageBySlug(moduleSlug, pageSlug));
  return res.data?.data || null;
}
