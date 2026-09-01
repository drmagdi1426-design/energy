import { NextRequest, NextResponse } from 'next/server';
import { adminLoginSchema } from '@/lib/validation';
import { verifyCsrfToken } from '@/lib/csrf';
import { verifyAdminCredentials, isLockedOut, recordLoginAttempt } from '@/lib/auth';
import { getClientIp } from '@/lib/request-ip';
import { getSession } from '@/lib/session';
import { logAdminAction } from '@/lib/audit';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const ip = await getClientIp();

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = adminLoginSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'validation' }, { status: 400 });
  }
  const { username, password, csrfToken } = parsed.data;

  const csrfOk = await verifyCsrfToken(csrfToken);
  if (!csrfOk) {
    return NextResponse.json({ error: 'invalid_csrf' }, { status: 403 });
  }

  // Brute-force lockout: checked before touching bcrypt so a locked-out
  // attacker can't keep spending compute trying to time-attack the hash.
  const lockedOut = await isLockedOut(username);
  if (lockedOut) {
    return NextResponse.json({ error: 'locked_out' }, { status: 429 });
  }

  const valid = await verifyAdminCredentials(username, password);
  await recordLoginAttempt(username, ip, valid);

  if (!valid) {
    return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });
  }

  const session = await getSession();
  session.admin = { username, loginAt: Date.now() };
  await session.save();

  await logAdminAction(username, 'login', undefined, ip);

  return NextResponse.json({ ok: true });
}
