import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/session';
import { getClientIp } from '@/lib/request-ip';
import { logAdminAction } from '@/lib/audit';
import { parseFilters, getFilteredResponses } from '@/lib/admin-data';
import { BEHAVIORAL_ITEM_CODES } from '@/lib/scoring';
import { toCsv } from '@/lib/csv';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
  const filters = parseFilters(searchParams);
  const responses = await getFilteredResponses(filters);

  const rows = responses.map((r) => {
    const itemByCode = Object.fromEntries(r.behavioralItems.map((i) => [i.itemCode, i.rawScore]));
    return {
      id: r.id,
      submittedAt: r.submittedAt.toISOString(),
      locale: r.locale,
      team: r.team ?? '',
      department: r.department ?? '',
      cycleLabel: r.cycleLabel ?? '',
      anonymized: Boolean(r.anonymizedAt),
      survivalPct: r.quadrantAudit?.survivalPct ?? '',
      performancePct: r.quadrantAudit?.performancePct ?? '',
      burnoutPct: r.quadrantAudit?.burnoutPct ?? '',
      renewalPct: r.quadrantAudit?.renewalPct ?? '',
      ...Object.fromEntries(BEHAVIORAL_ITEM_CODES.map((code) => [code, itemByCode[code] ?? ''])),
      survivalSum: r.computedScore?.survivalSum ?? '',
      performanceSum: r.computedScore?.performanceSum ?? '',
      burnoutSum: r.computedScore?.burnoutSum ?? '',
      renewalSum: r.computedScore?.renewalSum ?? '',
      dominant: r.computedScore?.isTie ? 'TIE' : (r.computedScore?.dominant ?? ''),
      tiedQuadrants: r.computedScore?.tiedQuadrants.join('|') ?? '',
      survivalZone: r.computedScore?.survivalZone ?? '',
      performanceZone: r.computedScore?.performanceZone ?? '',
      burnoutZone: r.computedScore?.burnoutZone ?? '',
      renewalZone: r.computedScore?.renewalZone ?? '',
    };
  });

  const csv = toCsv(rows);

  await logAdminAction(session.username, 'export_csv', JSON.stringify(filters), await getClientIp());

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="tharwah-energy-matrix-responses-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
