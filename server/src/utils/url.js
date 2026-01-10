export function toAbsoluteUrl(req, urlPath) {
  if (!urlPath) return urlPath;

  const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'http')
    .split(',')[0]
    .trim();
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '')
    .split(',')[0]
    .trim();

  if (!host) return urlPath;
  return `${proto}://${host}${urlPath.startsWith('/') ? '' : '/'}${urlPath}`;
}
