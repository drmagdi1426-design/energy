import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/session';
import { verifyCsrfToken } from '@/lib/csrf';
import { getClientIp } from '@/lib/request-ip';
import { logAdminAction } from '@/lib/audit';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// Manual erasure-request endpoint (PDPL "right to erasure", v1 = admin
// action rather than a self-service respondent flow — see README). Cascade
// deletes the response's quadrant audit, behavioral items, and computed
// score along with it.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

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

  const { id } = await params;

  const existing = await prisma.response.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  await prisma.response.delete({ where: { id } });
  await logAdminAction(session.username, 'delete_response', id, await getClientIp());

  return NextResponse.json({ ok: true });
}
