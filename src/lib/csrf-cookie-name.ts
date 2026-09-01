// Split into its own module (no Node-only imports) so middleware.ts — which
// runs on the Edge runtime — can reference the cookie name without pulling
// in Node's `crypto` module from lib/csrf.ts's timingSafeEqual usage.
export const CSRF_COOKIE_NAME = 'tharwah_csrf';
