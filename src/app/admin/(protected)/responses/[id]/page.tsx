import { notFound } from 'next/navigation';
import { getAdminLocale } from '@/lib/admin-locale';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { requireAdminSession } from '@/lib/session';
import { getClientIp } from '@/lib/request-ip';
import { logAdminAction } from '@/lib/audit';
import { getCsrfToken } from '@/lib/csrf';
import { prisma } from '@/lib/prisma';
import { BEHAVIORAL_ITEM_CODES, ITEM_TO_QUADRANT } from '@/lib/scoring';
import { DeleteResponseButton } from '@/components/DeleteResponseButton';

export const dynamic = 'force-dynamic';

export default async function ResponseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdminSession();
  if (!session) return null;

  const { id } = await params;
  const locale = await getAdminLocale();
  const dict = getDictionary(locale);

  const response = await prisma.response.findUnique({
    where: { id },
    include: { quadrantAudit: true, computedScore: true, behavioralItems: true },
  });
  if (!response) notFound();

  await logAdminAction(session.username, 'view_response', id, await getClientIp());
  const csrfToken = await getCsrfToken();

  const itemByCode = Object.fromEntries(response.behavioralItems.map((i) => [i.itemCode, i.rawScore]));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">{dict.admin.detailTitle}</h1>
        <DeleteResponseButton dict={dict} csrfToken={csrfToken} responseId={response.id} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="brand-card">
          <h2 className="mb-3 text-lg font-bold text-navy">{dict.admin.submissionInfoTitle}</h2>
          <dl className="space-y-2 text-sm">
            <Row label={dict.admin.columnDate} value={response.submittedAt.toLocaleString(locale)} />
            <Row label={dict.admin.columnTeam} value={response.team ?? '—'} />
            <Row label={dict.admin.columnDepartment} value={response.department ?? '—'} />
            <Row label={dict.admin.columnCycle} value={response.cycleLabel ?? '—'} />
            <Row label={dict.admin.localeLabel} value={response.locale} />
            {response.anonymizedAt && <Row label={dict.admin.anonymized} value="✓" />}
          </dl>
        </section>

        <section className="brand-card">
          <h2 className="mb-3 text-lg font-bold text-navy">{dict.sectionA.title}</h2>
          {response.quadrantAudit && (
            <dl className="space-y-2 text-sm">
              <Row label={dict.sectionA.quadrant.SURVIVAL.label} value={`${response.quadrantAudit.survivalPct}%`} />
              <Row
                label={dict.sectionA.quadrant.PERFORMANCE.label}
                value={`${response.quadrantAudit.performancePct}%`}
              />
              <Row label={dict.sectionA.quadrant.BURNOUT.label} value={`${response.quadrantAudit.burnoutPct}%`} />
              <Row label={dict.sectionA.quadrant.RENEWAL.label} value={`${response.quadrantAudit.renewalPct}%`} />
            </dl>
          )}
        </section>

        <section className="brand-card lg:col-span-2">
          <h2 className="mb-3 text-lg font-bold text-navy">{dict.sectionB.title}</h2>
          <div className="scroll-container">
            <table className="w-full min-w-[480px] text-start text-sm">
              <thead>
                <tr className="border-b border-gray-mid/20 text-gray-mid">
                  <th className="py-1 text-start font-medium">{dict.admin.itemColumn}</th>
                  <th className="py-1 text-start font-medium">{dict.admin.quadrantColumn}</th>
                  <th className="py-1 text-start font-medium">{dict.admin.ratingColumn}</th>
                </tr>
              </thead>
              <tbody>
                {BEHAVIORAL_ITEM_CODES.map((code) => (
                  <tr key={code} className="border-b border-gray-mid/10">
                    <td className="py-1.5">{dict.sectionB.items[code]}</td>
                    <td className="py-1.5">{dict.admin.quadrant[ITEM_TO_QUADRANT[code]]}</td>
                    <td className="py-1.5 font-semibold">{itemByCode[code] ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="brand-card lg:col-span-2">
          <h2 className="mb-3 text-lg font-bold text-navy">{dict.admin.computedScoresTitle}</h2>
          {response.computedScore && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <ScoreCell
                label={dict.admin.quadrant.SURVIVAL}
                sum={response.computedScore.survivalSum}
                zone={response.computedScore.survivalZone}
              />
              <ScoreCell
                label={dict.admin.quadrant.PERFORMANCE}
                sum={response.computedScore.performanceSum}
                zone={response.computedScore.performanceZone}
              />
              <ScoreCell
                label={dict.admin.quadrant.BURNOUT}
                sum={response.computedScore.burnoutSum}
                zone={response.computedScore.burnoutZone}
              />
              <ScoreCell
                label={dict.admin.quadrant.RENEWAL}
                sum={response.computedScore.renewalSum}
                zone={response.computedScore.renewalZone}
              />
            </div>
          )}
          <p className="mt-4 text-sm">
            <span className="field-label">{dict.admin.columnDominant}: </span>
            {response.computedScore?.isTie
              ? `${dict.admin.dominantTie} (${response.computedScore.tiedQuadrants
                  .map((q) => dict.admin.quadrant[q])
                  .join(', ')})`
              : response.computedScore?.dominant
                ? dict.admin.quadrant[response.computedScore.dominant]
                : '—'}
          </p>
        </section>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-gray-mid/10 pb-1">
      <dt className="text-gray-mid">{label}</dt>
      <dd className="font-medium text-navy">{value}</dd>
    </div>
  );
}

function ScoreCell({ label, sum, zone }: { label: string; sum: number; zone: string | null }) {
  return (
    <div className="rounded-lg bg-page-gray p-3 text-center">
      <p className="text-xs text-gray-mid">{label}</p>
      <p className="text-2xl font-bold text-navy">{sum}</p>
      {zone && <p className="mt-1 text-xs font-medium text-amber">{zone}</p>}
    </div>
  );
}
