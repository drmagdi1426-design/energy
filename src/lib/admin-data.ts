import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  QUADRANTS,
  dominantShare,
  RISK_THRESHOLDS,
  computeQuadrantCoordinates,
  type QuadrantKey,
} from '@/lib/scoring';

export interface DashboardFilters {
  from?: string;
  to?: string;
  team?: string;
  department?: string;
  cycleLabel?: string;
}

export function parseFilters(searchParams: Record<string, string | string[] | undefined>): DashboardFilters {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
  return {
    from: one(searchParams.from),
    to: one(searchParams.to),
    team: one(searchParams.team),
    department: one(searchParams.department),
    cycleLabel: one(searchParams.cycleLabel),
  };
}

export function buildWhere(filters: DashboardFilters): Prisma.ResponseWhereInput {
  const where: Prisma.ResponseWhereInput = {};
  if (filters.from || filters.to) {
    where.submittedAt = {
      ...(filters.from ? { gte: new Date(filters.from) } : {}),
      ...(filters.to ? { lte: new Date(`${filters.to}T23:59:59.999Z`) } : {}),
    };
  }
  if (filters.team) where.team = { equals: filters.team, mode: 'insensitive' };
  if (filters.department) where.department = { equals: filters.department, mode: 'insensitive' };
  if (filters.cycleLabel) where.cycleLabel = { equals: filters.cycleLabel, mode: 'insensitive' };
  return where;
}

const RESPONSE_INCLUDE = {
  quadrantAudit: true,
  computedScore: true,
  behavioralItems: true,
} satisfies Prisma.ResponseInclude;

export type ResponseWithData = Prisma.ResponseGetPayload<{ include: typeof RESPONSE_INCLUDE }>;

export async function getFilteredResponses(filters: DashboardFilters): Promise<ResponseWithData[]> {
  return prisma.response.findMany({
    where: buildWhere(filters),
    include: RESPONSE_INCLUDE,
    orderBy: { submittedAt: 'desc' },
  });
}

export async function getDistinctTeamsAndDepartments(): Promise<{ teams: string[]; departments: string[] }> {
  const rows = await prisma.response.findMany({
    where: { OR: [{ team: { not: null } }, { department: { not: null } }] },
    select: { team: true, department: true },
    distinct: ['team', 'department'],
    take: 500,
  });
  const teams = Array.from(new Set(rows.map((r) => r.team).filter((v): v is string => !!v))).sort();
  const departments = Array.from(
    new Set(rows.map((r) => r.department).filter((v): v is string => !!v)),
  ).sort();
  return { teams, departments };
}

export interface AverageAudit {
  survivalPct: number;
  performancePct: number;
  burnoutPct: number;
  renewalPct: number;
}

export interface DominantCounts extends Record<QuadrantKey, number> {
  TIE: number;
}

export interface RiskFlag {
  level: 'warning' | 'critical';
  key: string;
  message: string;
}

export interface CycleTrendPoint {
  label: string;
  count: number;
  avgAudit: AverageAudit;
  dominantShare: Record<QuadrantKey, number>;
}

export interface DashboardAggregate {
  totalResponses: number;
  avgAudit: AverageAudit;
  dominantCounts: DominantCounts;
  riskFlags: RiskFlag[];
  trend: CycleTrendPoint[];
  scatter: { id: string; dominant: QuadrantKey | 'TIE'; stress: number; energy: number }[];
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

function computeAverageAudit(responses: ResponseWithData[]): AverageAudit {
  return {
    survivalPct: average(responses.map((r) => r.quadrantAudit?.survivalPct ?? 0)),
    performancePct: average(responses.map((r) => r.quadrantAudit?.performancePct ?? 0)),
    burnoutPct: average(responses.map((r) => r.quadrantAudit?.burnoutPct ?? 0)),
    renewalPct: average(responses.map((r) => r.quadrantAudit?.renewalPct ?? 0)),
  };
}

function computeDominantCounts(responses: ResponseWithData[]): DominantCounts {
  const counts: DominantCounts = { SURVIVAL: 0, PERFORMANCE: 0, BURNOUT: 0, RENEWAL: 0, TIE: 0 };
  for (const r of responses) {
    if (!r.computedScore) continue;
    if (r.computedScore.isTie || !r.computedScore.dominant) counts.TIE += 1;
    else counts[r.computedScore.dominant] += 1;
  }
  return counts;
}

function computeRiskFlags(responses: ResponseWithData[], trend: CycleTrendPoint[]): RiskFlag[] {
  const flags: RiskFlag[] = [];
  const dominants = responses.map((r) =>
    r.computedScore && !r.computedScore.isTie ? r.computedScore.dominant : null,
  );

  const survivalShare = dominantShare(dominants, 'SURVIVAL');
  if (survivalShare > RISK_THRESHOLDS.SURVIVAL_DOMINANT_SHARE) {
    flags.push({
      level: 'warning',
      key: 'survival_share',
      message: `${Math.round(survivalShare * 100)}% of respondents have Survival as their dominant baseline (threshold: ${Math.round(RISK_THRESHOLDS.SURVIVAL_DOMINANT_SHARE * 100)}%).`,
    });
  }

  const burnoutShare = dominantShare(dominants, 'BURNOUT');
  if (burnoutShare > RISK_THRESHOLDS.BURNOUT_DOMINANT_SHARE) {
    flags.push({
      level: 'critical',
      key: 'burnout_share',
      message: `${Math.round(burnoutShare * 100)}% of respondents have Burnout as their dominant baseline (threshold: ${Math.round(RISK_THRESHOLDS.BURNOUT_DOMINANT_SHARE * 100)}%).`,
    });
  }

  const avgAudit = computeAverageAudit(responses);
  if (avgAudit.burnoutPct > RISK_THRESHOLDS.BURNOUT_TIME_AVG_PCT) {
    flags.push({
      level: 'critical',
      key: 'burnout_time_avg',
      message: `Average time allocated to Burnout is ${avgAudit.burnoutPct}% (threshold: ${RISK_THRESHOLDS.BURNOUT_TIME_AVG_PCT}%).`,
    });
  }

  // Two-consecutive-cycles Survival flag, per the playbook rule referenced in the build spec.
  if (trend.length >= 2) {
    const lastTwo = trend.slice(-2);
    const bothExceed = lastTwo.every(
      (c) => c.dominantShare.SURVIVAL > RISK_THRESHOLDS.SURVIVAL_DOMINANT_SHARE,
    );
    if (bothExceed) {
      flags.push({
        level: 'critical',
        key: 'survival_two_cycles',
        message: `Survival dominance exceeded ${Math.round(RISK_THRESHOLDS.SURVIVAL_DOMINANT_SHARE * 100)}% in the last two consecutive cycles (${lastTwo.map((c) => c.label).join(', ')}) — recommend a workload audit.`,
      });
    }
  }

  return flags;
}

function computeTrend(responses: ResponseWithData[]): CycleTrendPoint[] {
  const withCycle = responses.filter((r) => r.cycleLabel);
  const groups = new Map<string, ResponseWithData[]>();

  if (withCycle.length > 0) {
    for (const r of withCycle) {
      const key = r.cycleLabel!;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(r);
    }
  } else {
    // Fallback grouping by submission month when no cycle labels were collected.
    for (const r of responses) {
      const key = r.submittedAt.toISOString().slice(0, 7); // YYYY-MM
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(r);
    }
  }

  const labels = Array.from(groups.keys()).sort();
  return labels.map((label) => {
    const rows = groups.get(label)!;
    const dominants = rows.map((r) => (r.computedScore && !r.computedScore.isTie ? r.computedScore.dominant : null));
    const shareByQuadrant = Object.fromEntries(
      QUADRANTS.map((q) => [q, dominantShare(dominants, q)]),
    ) as Record<QuadrantKey, number>;
    return {
      label,
      count: rows.length,
      avgAudit: computeAverageAudit(rows),
      dominantShare: shareByQuadrant,
    };
  });
}

function computeScatter(responses: ResponseWithData[]): DashboardAggregate['scatter'] {
  return responses
    .filter((r) => r.computedScore)
    .map((r) => {
      const cs = r.computedScore!;
      const coords = computeQuadrantCoordinates({
        SURVIVAL: cs.survivalSum,
        PERFORMANCE: cs.performanceSum,
        BURNOUT: cs.burnoutSum,
        RENEWAL: cs.renewalSum,
      });
      return {
        id: r.id,
        dominant: cs.isTie || !cs.dominant ? ('TIE' as const) : cs.dominant,
        stress: coords.stress,
        energy: coords.energy,
      };
    });
}

export function computeDashboardAggregate(responses: ResponseWithData[]): DashboardAggregate {
  const trend = computeTrend(responses);
  return {
    totalResponses: responses.length,
    avgAudit: computeAverageAudit(responses),
    dominantCounts: computeDominantCounts(responses),
    riskFlags: computeRiskFlags(responses, trend),
    trend,
    scatter: computeScatter(responses),
  };
}
