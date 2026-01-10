export const ENDPOINTS = {
  modules: {
    list: '/modules',
    bySlug: (slug) => `/modules/${encodeURIComponent(slug)}`
  },
  contents: {
    list: '/contents',
    byId: (id) => `/contents/${id}`,
    pageBySlug: (moduleSlug, pageSlug) =>
      `/pages/${encodeURIComponent(moduleSlug)}/${encodeURIComponent(pageSlug)}`
  },
  settings: {
    site: '/settings/site',
    publicSiteSettings: '/public/site-settings'
  },
  members: {
    list: '/members'
  }
};
