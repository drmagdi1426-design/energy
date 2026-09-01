import { cookies } from 'next/headers';
import { timingSafeEqual } from 'crypto';
import { CSRF_COOKIE_NAME } from '@/lib/csrf-cookie-name';

export { CSRF_COOKIE_NAME };

// Double-submit-cookie CSRF protection for all state-changing requests
// (questionnaire submission, admin login, admin export/delete actions).
// The token itself is issued by middleware.ts on every response (Next.js
// only allows *setting* cookies from middleware or a Route
// Handler/Server Action, never while rendering a Server Component) — this
// module only reads it back for embedding in forms, and verifies it on
// submission. A non-HttpOnly cookie carries the value so client JS/forms
// can read and echo it back; an attacker forging a cross-site request
// cannot read the cookie, so cannot produce a matching token.

/** Read the CSRF token that middleware has already set for this request. */
export async function getCsrfToken(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_COOKIE_NAME)?.value ?? '';
}

export async function verifyCsrfToken(submittedToken: unknown): Promise<boolean> {
  if (typeof submittedToken !== 'string' || submittedToken.length === 0) return false;
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  if (!cookieToken) return false;

  const a = Buffer.from(cookieToken);
  const b = Buffer.from(submittedToken);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
