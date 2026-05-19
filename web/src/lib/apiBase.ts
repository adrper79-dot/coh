/**
 * Module-load-time API base URL.
 *
 * Factory hard constraint: never expose `.workers.dev` URLs to end users —
 * every user-facing worker endpoint must have a branded custom domain. The
 * previous fallback pattern (`VITE_API_URL ?? 'https://cypher-of-healing-api.workers.dev'`)
 * silently shipped the infra URL to production if the build env var was
 * missing. We now fail loud at module-load time instead.
 *
 * Build-time enforcement is also done in `vite.config.ts`, but this in-file
 * guard catches dev-server and runtime drift.
 */
const rawApiUrl = import.meta.env.VITE_API_URL;

if (typeof rawApiUrl !== 'string' || rawApiUrl.length === 0) {
  throw new Error(
    'VITE_API_URL is not set. Refusing to fall back to *.workers.dev. ' +
      'Set VITE_API_URL in your environment (e.g. https://api.cypherofhealing.com/api) ' +
      'before building or running the frontend.',
  );
}

if (/\.workers\.dev/i.test(rawApiUrl)) {
  throw new Error(
    'VITE_API_URL points at *.workers.dev. ' +
      'Every user-facing worker endpoint must use a branded custom domain ' +
      '(e.g. https://api.cypherofhealing.com/api). See CLAUDE.md hard constraints.',
  );
}

export const API_BASE_URL: string = rawApiUrl;
