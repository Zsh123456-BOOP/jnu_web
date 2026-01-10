import { Settings } from '../models/index.js';
import { safeJsonParse } from '../utils/json.js';

const FOOTER_KEY = 'site.footer';

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
