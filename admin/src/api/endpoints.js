const ADMIN_BASE = '/admin';

export const ENDPOINTS = {
  auth: {
    login: `${ADMIN_BASE}/login`,
    logout: `${ADMIN_BASE}/logout`,
    me: `${ADMIN_BASE}/me`
  },
  modules: {
    list: `${ADMIN_BASE}/modules`,
    byId: (id) => `${ADMIN_BASE}/modules/${id}`
  },
  members: {
    list: `${ADMIN_BASE}/members`,
    byId: (id) => `${ADMIN_BASE}/members/${id}`
  },
  contents: {
    list: `${ADMIN_BASE}/contents`,
    byId: (id) => `${ADMIN_BASE}/contents/${id}`
  },
  assets: {
    list: `${ADMIN_BASE}/assets`,
    upload: `${ADMIN_BASE}/assets/upload`,
    byId: (id) => `${ADMIN_BASE}/assets/${id}`
  },
  settings: {
    site: `${ADMIN_BASE}/settings/site`
  }
};
