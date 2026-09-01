import Link from 'next/link';
import { getAdminLocale } from '@/lib/admin-locale';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { requireAdminSession } from '@/lib/session';
import { getClientIp } from '@/lib/request-ip';
import { logAdminAction } from '@/lib/audit';
import { parseFilters, getFilteredResponses, getDistinctTeamsAndDepartments } from '@/lib/admin-data';
import { FilterBar } from '@/components/FilterBar';

export const dynamic = 'force-dynamic';

export default async function AdminResponsesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAdminSession();
  if (!session) return null;

  const sp = await searchParams;
  const locale = await getAdminLocale();
  const dict = getDictionary(locale);
  const filters = parseFilters(sp);

  const [responses, { teams, departments }] = await Promise.all([
    getFilteredResponses(filters),
    getDistinctTeamsAndDepartments(),
  ]);

  await logAdminAction(session.username, 'view_responses', JSON.stringify(filters), await getClientIp());

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-navy">{dict.admin.responsesTitle}</h1>

      <FilterBar action="/admin/responses" filters={filters} teams={teams} departments={departments} dict={dict} />

      <div className="brand-card scroll-container">
        <table className="w-full min-w-[720px] text-start text-sm">
          <thead>
            <tr className="border-b border-gray-mid/20 text-gray-mid">
              <th className="py-2 text-start font-medium">{dict.admin.columnDate}</th>
              <th className="py-2 text-start font-medium">{dict.admin.columnTeam}</th>
              <th className="py-2 text-start font-medium">{dict.admin.columnDepartment}</th>
              <th className="py-2 text-start font-medium">{dict.admin.columnCycle}</th>
              <th className="py-2 text-start font-medium">{dict.admin.columnDominant}</th>
              <th className="py-2 text-start font-medium">{dict.admin.columnAudit}</th>
              <th className="py-2 text-start font-medium" />
            </tr>
          </thead>
          <tbody>
            {responses.map((r) => (
              <tr key={r.id} className="border-b border-gray-mid/10">
                <td className="py-2 whitespace-nowrap">{r.submittedAt.toLocaleDateString(locale)}</td>
                <td className="py-2">{r.team ?? '—'}</td>
                <td className="py-2">{r.department ?? '—'}</td>
                <td className="py-2">{r.cycleLabel ?? '—'}</td>
                <td className="py-2">
                  {r.computedScore
                    ? r.computedScore.isTie || !r.computedScore.dominant
                      ? dict.admin.dominantTie
                      : dict.admin.quadrant[r.computedScore.dominant]
                    : '—'}
                </td>
                <td className="py-2 bidi-isolate whitespace-nowrap">
                  {r.quadrantAudit
                    ? `${r.quadrantAudit.survivalPct}/${r.quadrantAudit.performancePct}/${r.quadrantAudit.burnoutPct}/${r.quadrantAudit.renewalPct}`
                    : '—'}
                </td>
                <td className="py-2 text-end">
                  <Link href={`/admin/responses/${r.id}`} className="text-academy-blue hover:underline">
                    {dict.admin.viewDetail}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {responses.length === 0 && <p className="py-4 text-center text-sm text-gray-mid">—</p>}
      </div>
    </div>
  );
}
