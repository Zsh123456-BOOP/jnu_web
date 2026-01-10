import httpClient from '../httpClient';
import { ENDPOINTS } from '../endpoints';

/**
 * Fetch site settings.
 * @returns {Promise<object|null>}
 */
export async function getSite() {
  const res = await httpClient.get(ENDPOINTS.settings.site);
  return res.data?.data || null;
}
