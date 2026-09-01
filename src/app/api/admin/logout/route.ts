import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { verifyCsrfToken } from '@/lib/csrf';
import { logAdminAction } from '@/lib/audit';
import { getClientIp } from '@/lib/request-ip';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let csrfToken: unknown;
  try {
    const body = await req.json();
    csrfToken = body?.csrfToken;
  } catch {
    csrfToken = undefined;
  }

  const csrfOk = await verifyCsrfToken(csrfToken);
  if (!csrfOk) {
    return NextResponse.json({ error: 'invalid_csrf' }, { status: 403 });
  }

  const session = await getSession();
  const username = session.admin?.username;
  session.destroy();

  if (username) {
    await logAdminAction(username, 'logout', undefined, await getClientIp());
  }

  return NextResponse.json({ ok: true });
}
