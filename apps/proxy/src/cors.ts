/**
 * True if a browser origin may call the proxy. ALLOWED_ORIGINS is a comma-separated list.
 * A "*" stands for one run of letters, digits and hyphens, so
 * "https://*-app.example.workers.dev" also allows that Worker's preview URLs.
 */
export function isAllowedOrigin(origin: string, allowedOrigins: string): boolean {
  return allowedOrigins
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
    .some((allowed) => {
      const pattern = allowed
        .split('*')
        .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('[a-z0-9-]+');
      return new RegExp(`^${pattern}$`).test(origin);
    });
}
