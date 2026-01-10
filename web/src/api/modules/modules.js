import httpClient from '../httpClient';
import { ENDPOINTS } from '../endpoints';

/**
 * List modules.
 * @param {{nav?: string}} params
 * @returns {Promise<Array>}
 */
export async function list(params = {}) {
  const res = await httpClient.get(ENDPOINTS.modules.list, { params });
  return res.data?.data || [];
}

/**
 * Fetch module by slug.
 * @param {string} slug
 * @returns {Promise<object|null>}
 */
export async function getBySlug(slug) {
  const res = await httpClient.get(ENDPOINTS.modules.bySlug(slug));
  return res.data?.data || null;
}
