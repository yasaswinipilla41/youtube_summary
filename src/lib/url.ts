/**
 * Resolve the public base URL of the app for redirects.
 *
 * On Vercel the request passes through a proxy, so the raw request origin can
 * point at an internal host. Priority: explicit NEXT_PUBLIC_SITE_URL (when it
 * matches the request host or no headers are available) → x-forwarded-* headers
 * → the request's own origin. This guarantees production redirects never point
 * at localhost.
 */
export function getBaseUrl(request: Request): string {
  const url = new URL(request.url);
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost ?? request.headers.get('host') ?? url.host;
  const proto =
    request.headers.get('x-forwarded-proto') ??
    (host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'https');
  return `${proto}://${host}`;
}
