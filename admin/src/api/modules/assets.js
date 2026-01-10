import httpClient from '../httpClient';
import { ENDPOINTS } from '../endpoints';

/**
 * List assets.
 * @param {{page?: number, pageSize?: number}} params
 * @returns {Promise<{items: Array, total: number, page: number, pageSize: number}>}
 */
export async function list(params = {}) {
  const res = await httpClient.get(ENDPOINTS.assets.list, { params });
  return res.data?.data || { items: [], total: 0, page: 1, pageSize: params.pageSize || 10 };
}

/**
 * Upload a file asset.
 * @param {FormData} formData
 * @returns {Promise<object|null>}
 */
export async function upload(formData) {
  const res = await httpClient.post(ENDPOINTS.assets.upload, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data?.data || null;
}

/**
 * Delete an asset.
 * @param {number|string} id
 * @param {{removeFile?: string|number|boolean}} params
 * @returns {Promise<null>}
 */
export async function remove(id, params = {}) {
  await httpClient.delete(ENDPOINTS.assets.byId(id), { params });
  return null;
}
