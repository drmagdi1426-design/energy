import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { submitResponseSchema } from '@/lib/validation';
import { verifyCsrfToken } from '@/lib/csrf';
import { checkAndRecordSubmissionRateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/request-ip';
import {
  validateQuadrantAudit,
  validateBehavioralAnswers,
  computeBehavioralScores,
  type BehavioralAnswers,
} from '@/lib/scoring';

export const runtime = 'nodejs';

// Public questionnaire submission endpoint.
//
// Order of operations matters here: CSRF check and rate limiting happen
// before any expensive work, then structural validation (zod), then the
// scoring module's own business-rule validation (percentages sum to 100,
// ratings in range) — the same module that later computes the stored
// scores. Nothing about scoring is duplicated in the frontend; the client
// only does UX-level "is this ready to submit" checks.
export async function POST(req: NextRequest) {
  const ip = await getClientIp();

  const allowed = await checkAndRecordSubmissionRateLimit(ip);
  if (!allowed) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = submitResponseSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'validation', issues: parsed.error.issues }, { status: 400 });
  }
  const input = parsed.data;

  const csrfOk = await verifyCsrfToken(input.csrfToken);
  if (!csrfOk) {
    return NextResponse.json({ error: 'invalid_csrf' }, { status: 403 });
  }

  const auditCheck = validateQuadrantAudit(input.quadrantAudit);
  if (!auditCheck.valid) {
    return NextResponse.json({ error: 'validation', issues: auditCheck.errors }, { status: 400 });
  }

  const behavioralErrors = validateBehavioralAnswers(input.behavioralAnswers);
  if (behavioralErrors.length > 0) {
    return NextResponse.json({ error: 'validation', issues: behavioralErrors }, { status: 400 });
  }

  const scored = computeBehavioralScores(input.behavioralAnswers as BehavioralAnswers);

  await prisma.response.create({
    data: {
      locale: input.locale === 'ar' ? 'AR' : 'EN',
      team: input.team,
      department: input.department,
      cycleLabel: input.cycleLabel,
      consentAcceptedAt: new Date(),
      quadrantAudit: {
        create: {
          survivalPct: input.quadrantAudit.survivalPct,
          performancePct: input.quadrantAudit.performancePct,
          burnoutPct: input.quadrantAudit.burnoutPct,
          renewalPct: input.quadrantAudit.renewalPct,
        },
      },
      behavioralItems: {
        create: (Object.keys(input.behavioralAnswers) as (keyof typeof input.behavioralAnswers)[]).map(
          (code) => ({
            itemCode: code,
            rawScore: input.behavioralAnswers[code],
          }),
        ),
      },
      computedScore: {
        create: {
          survivalSum: scored.sums.SURVIVAL,
          performanceSum: scored.sums.PERFORMANCE,
          burnoutSum: scored.sums.BURNOUT,
          renewalSum: scored.sums.RENEWAL,
          dominant: scored.dominant,
          isTie: scored.isTie,
          tiedQuadrants: scored.tiedQuadrants,
          survivalZone: scored.zones.SURVIVAL,
          performanceZone: scored.zones.PERFORMANCE,
          burnoutZone: scored.zones.BURNOUT,
          renewalZone: scored.zones.RENEWAL,
        },
      },
    },
  });

  // No scores are ever returned to the respondent — results are admin-only.
  return NextResponse.json({ ok: true }, { status: 201 });
}
