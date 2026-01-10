const API_BASE = import.meta.env.VITE_API_BASE || '/api';

function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    search.append(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

async function parseJsonResponse(response) {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.headers || {})
    }
  });

  const payload = await parseJsonResponse(response);

  if (!response.ok) {
    const message = payload?.error?.message || response.statusText || 'Request failed';
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export async function getModules() {
  const payload = await request('/modules');
  return payload?.data || [];
}

export async function getModuleBySlug(slug) {
  const payload = await request(`/modules/${encodeURIComponent(slug)}`);
  return payload?.data || null;
}

export async function getContents(params = {}) {
  const query = buildQuery(params);
  const payload = await request(`/contents${query}`);
  return payload?.data || { items: [], total: 0, page: 1, pageSize: 20 };
}

export async function getContentById(id) {
  const payload = await request(`/contents/${id}`);
  return payload?.data || null;
}

export async function getContentBySlug(moduleSlug, pageSlug) {
  const payload = await request(
    `/pages/${encodeURIComponent(moduleSlug)}/${encodeURIComponent(pageSlug)}`
  );
  return payload?.data || null;
}

export async function getSettingsSite() {
  const payload = await request('/settings/site');
  return payload?.data || null;
}

export async function getMembers(params = {}) {
  const query = buildQuery(params);
  const payload = await request(`/members${query}`);
  return payload?.data || [];
}
