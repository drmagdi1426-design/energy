import Link from 'next/link';
import { getAdminLocale } from '@/lib/admin-locale';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { requireAdminSession } from '@/lib/session';
import { getClientIp } from '@/lib/request-ip';
import { logAdminAction } from '@/lib/audit';
import { prisma } from '@/lib/prisma';
import {
  parseFilters,
  getFilteredResponses,
  getDistinctTeamsAndDepartments,
  computeDashboardAggregate,
} from '@/lib/admin-data';
import { FilterBar } from '@/components/FilterBar';
import { RiskFlagList } from '@/components/RiskFlagCard';
import { QuadrantDistributionChart } from '@/components/charts/QuadrantDistributionChart';
import { DominantBreakdownChart } from '@/components/charts/DominantBreakdownChart';
import { TrendChart } from '@/components/charts/TrendChart';
import { QuadrantScatterChart } from '@/components/charts/QuadrantScatterChart';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAdminSession();
  if (!session) return null; // layout already redirects; defensive guard for type-narrowing

  const sp = await searchParams;
  const locale = await getAdminLocale();
  const dict = getDictionary(locale);
  const filters = parseFilters(sp);

  const [responses, { teams, departments }] = await Promise.all([
    getFilteredResponses(filters),
    getDistinctTeamsAndDepartments(),
  ]);
  const aggregate = computeDashboardAggregate(responses);

  const auditLog = await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 10 });

  await logAdminAction(session.username, 'view_dashboard', JSON.stringify(filters), await getClientIp());

  const exportHref = `/api/admin/export/csv?${new URLSearchParams(
    Object.entries(buildFilterParams(filters)),
  ).toString()}`;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-navy">{dict.admin.dashboardTitle}</h1>
        <a href={exportHref} className="btn-secondary text-sm">
          {dict.admin.exportCsv}
        </a>
      </div>

      <FilterBar action="/admin/dashboard" filters={filters} teams={teams} departments={departments} dict={dict} />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="brand-card brand-card--mint">
          <p className="text-sm text-gray-dark">{dict.admin.totalResponses}</p>
          <p className="mt-1 text-3xl font-bold text-navy">{aggregate.totalResponses}</p>
        </div>
      </div>

      <div className="mb-6 brand-card">
        <h2 className="mb-3 text-lg font-bold text-navy">{dict.admin.riskFlagsTitle}</h2>
        <RiskFlagList flags={aggregate.riskFlags} dict={dict} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="brand-card">
          <h2 className="mb-3 text-lg font-bold text-navy">{dict.admin.avgDistributionTitle}</h2>
          <QuadrantDistributionChart avgAudit={aggregate.avgAudit} dict={dict} />
        </div>
        <div className="brand-card">
          <h2 className="mb-3 text-lg font-bold text-navy">{dict.admin.dominantBreakdownTitle}</h2>
          <DominantBreakdownChart counts={aggregate.dominantCounts} dict={dict} />
        </div>
        <div className="brand-card">
          <h2 className="mb-3 text-lg font-bold text-navy">{dict.admin.trendTitle}</h2>
          {aggregate.trend.length >= 2 ? (
            <TrendChart trend={aggregate.trend} dict={dict} />
          ) : (
            <p className="text-sm text-gray-mid">
              {dict.admin.trendTitle}: {aggregate.trend.length === 0 ? 0 : 1} cycle(s) recorded so far.
            </p>
          )}
        </div>
        <div className="brand-card">
          <h2 className="mb-3 text-lg font-bold text-navy">2×2 {dict.admin.dashboardTitle}</h2>
          <QuadrantScatterChart scatter={aggregate.scatter} dict={dict} />
        </div>
      </div>

      <div className="mt-6 brand-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-navy">{dict.admin.auditLogTitle}</h2>
          <Link href="/admin/responses" className="text-sm text-academy-blue hover:underline">
            {dict.admin.navResponses}
          </Link>
        </div>
        <div className="scroll-container">
          <table className="w-full min-w-[480px] text-start text-sm">
            <thead>
              <tr className="border-b border-gray-mid/20 text-gray-mid">
                <th className="py-1 text-start font-medium">{dict.admin.columnDate}</th>
                <th className="py-1 text-start font-medium">Admin</th>
                <th className="py-1 text-start font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {auditLog.map((entry) => (
                <tr key={entry.id} className="border-b border-gray-mid/10">
                  <td className="py-1.5">{entry.createdAt.toLocaleString(locale)}</td>
                  <td className="py-1.5">{entry.adminUsername}</td>
                  <td className="py-1.5">{entry.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function buildFilterParams(filters: ReturnType<typeof parseFilters>): Record<string, string> {
  const out: Record<string, string> = {};
  if (filters.from) out.from = filters.from;
  if (filters.to) out.to = filters.to;
  if (filters.team) out.team = filters.team;
  if (filters.department) out.department = filters.department;
  if (filters.cycleLabel) out.cycleLabel = filters.cycleLabel;
  return out;
}
