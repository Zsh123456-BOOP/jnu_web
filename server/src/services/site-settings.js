import { Settings } from '../models/index.js';
import { safeJsonParse } from '../utils/json.js';

const FOOTER_KEY = 'site.footer';
const META_KEY = 'site.meta';

export const DEFAULT_FOOTER = {
  contact: {
    address: '123 Research Road, City',
    email: 'lab@example.com'
  },
  links: [
    {
      title: 'Quick Links',
      items: [
        { label: 'Home', url: '/' },
        { label: 'Research', url: '/research' },
        { label: 'Team', url: '/people' }
      ]
    }
  ]
};

export const DEFAULT_SITE_META = {
  site_title: 'JNU Web',
  favicon_url: ''
};

const isPlainObject = (value) =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const mergeDeep = (base, patch) => {
  if (Array.isArray(base)) {
    return Array.isArray(patch) ? patch : base;
  }
  if (!isPlainObject(base)) {
    return patch === undefined ? base : patch;
  }
  const output = { ...base };
  if (!isPlainObject(patch)) {
    return output;
  }
  Object.keys(patch).forEach((key) => {
    output[key] = mergeDeep(base[key], patch[key]);
  });
  return output;
};

const normalizeMetaSettings = (value = {}) => {
  const siteTitle =
    typeof value.site_title === 'string' ? value.site_title : DEFAULT_SITE_META.site_title;
  const faviconUrl =
    typeof value.favicon_url === 'string' ? value.favicon_url : DEFAULT_SITE_META.favicon_url;
  return {
    site_title: siteTitle,
    favicon_url: faviconUrl
  };
};

export async function getSiteSettings() {
  const row = await Settings.findByPk(FOOTER_KEY);
  const stored = row ? safeJsonParse(row.value_json, {}) : {};
  return {
    footer: mergeDeep(DEFAULT_FOOTER, stored)
  };
}

export async function updateSiteSettings(patch = {}) {
  const current = await getSiteSettings();
  const next = mergeDeep(current, patch);
  await Settings.upsert({
    key: FOOTER_KEY,
    value_json: next.footer
  });
  return next;
}

export async function getSiteMetaSettings() {
  const row = await Settings.findByPk(META_KEY);
  const stored = row ? safeJsonParse(row.value_json, {}) : {};
  return normalizeMetaSettings(stored);
}

export async function updateSiteMetaSettings(patch = {}) {
  const current = await getSiteMetaSettings();
  const next = { ...current };
  if (patch.site_title !== undefined) {
    next.site_title = patch.site_title;
  }
  if (patch.favicon_url !== undefined) {
    next.favicon_url = patch.favicon_url;
  }

  await Settings.upsert({
    key: META_KEY,
    value_json: next
  });

  return next;
}
