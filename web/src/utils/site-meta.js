export const DEFAULT_SITE_TITLE = 'JNU Web';

export function applySiteTitle(title) {
  const nextTitle = typeof title === 'string' ? title.trim() : '';
  document.title = nextTitle || DEFAULT_SITE_TITLE;
}

export function applyFavicon(url) {
  const href = typeof url === 'string' ? url.trim() : '';
  if (!href) {
    return;
  }

  const head = document.head || document.getElementsByTagName('head')[0];
  if (!head) {
    return;
  }

  let link =
    document.querySelector("link[rel='icon']") ||
    document.querySelector("link[rel='shortcut icon']");

  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    head.appendChild(link);
  } else if (link.rel !== 'icon') {
    link.rel = 'icon';
  }

  link.href = href;
}

export function applySiteMeta(settings = {}) {
  applySiteTitle(settings.site_title);
  applyFavicon(settings.favicon_url);
}
