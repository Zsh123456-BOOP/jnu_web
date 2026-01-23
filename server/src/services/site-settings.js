import { Settings } from '../models/index.js';
import { safeJsonParse } from '../utils/json.js';

const FOOTER_KEY = 'site.footer';
const META_KEY = 'site.meta';
const HOME_TEXT_KEY = 'site.home_text';

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

export const DEFAULT_HOME_TEXT = {
  badge_text: 'Welcome to the Lab',
  hero_title_prefix: 'Exploring the frontiers of',
  hero_title_highlight: 'Bioinformatics',
  hero_title_suffix: 'and Data Science.',
  hero_subtitle:
    'Browse our latest publications, discover open-source software, and meet the team behind the research.',
  hero_primary_label: 'Our Research',
  hero_secondary_label: 'Read about us',
  hero_image_alt: 'Lab Visual',
  latest_title: 'Latest updates',
  latest_loading: 'Loading latest updates...',
  latest_error: 'Failed to load latest content',
  latest_empty: 'No updates yet.',
  sidebar_title: 'Explore modules',
  card_title_fallback: 'Untitled'
};

const HOME_TEXT_KEYS = Object.keys(DEFAULT_HOME_TEXT);

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

const normalizeHomeTextSettings = (value = {}) => {
  const output = { ...DEFAULT_HOME_TEXT };
  if (!isPlainObject(value)) {
    return output;
  }
  HOME_TEXT_KEYS.forEach((key) => {
    if (typeof value[key] === 'string') {
      output[key] = value[key];
    }
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

export async function getHomeTextSettings() {
  const row = await Settings.findByPk(HOME_TEXT_KEY);
  const stored = row ? safeJsonParse(row.value_json, {}) : {};
  return normalizeHomeTextSettings(stored);
}

export async function updateHomeTextSettings(patch = {}) {
  const current = await getHomeTextSettings();
  const next = { ...current };
  if (isPlainObject(patch)) {
    HOME_TEXT_KEYS.forEach((key) => {
      if (patch[key] !== undefined) {
        next[key] = patch[key];
      }
    });
  }

  await Settings.upsert({
    key: HOME_TEXT_KEY,
    value_json: next
  });

  return next;
}
