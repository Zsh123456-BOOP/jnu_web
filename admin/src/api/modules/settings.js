import httpClient from '../httpClient';
import { ENDPOINTS } from '../endpoints';

/**
 * Fetch site settings.
 * @returns {Promise<{key: string, value: object}|null>}
 */
export async function getSite() {
  const res = await httpClient.get(ENDPOINTS.settings.site);
  return res.data?.data || null;
}

/**
 * Update site settings.
 * @param {object} payload
 * @returns {Promise<{key: string, value: object}|null>}
 */
export async function updateSite(payload) {
  const res = await httpClient.put(ENDPOINTS.settings.site, payload);
  return res.data?.data || null;
}
