import { headers } from 'next/headers';

/** Best-effort client IP from standard proxy headers. Used only for rate
 * limiting / lockout counters and the admin audit trail — never stored
 * alongside a response's answers. */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwardedFor = h.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0]!.trim();
  const realIp = h.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}
