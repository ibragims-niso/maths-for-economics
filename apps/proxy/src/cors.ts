/**
 * True if a browser origin may call the proxy. ALLOWED_ORIGINS is a comma-separated list;
 * an entry like "https://*.example.pages.dev" also allows preview subdomains.
 */
export function isAllowedOrigin(origin: string, allowedOrigins: string): boolean {
  return allowedOrigins
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
    .some((allowed) => {
      const wildcard = /^(https?:\/\/)\*\.(.+)$/.exec(allowed);
      if (!wildcard) return origin === allowed;
      const [, scheme, domain] = wildcard;
      return origin.startsWith(scheme ?? '') && origin.endsWith(`.${domain}`);
    });
}
