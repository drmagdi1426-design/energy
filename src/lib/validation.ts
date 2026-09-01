import { z } from 'zod';
import { BEHAVIORAL_ITEM_CODES } from '@/lib/scoring';

// Shared input-validation schemas. Every field submitted by the respondent
// passes through here server-side before it is ever computed on or stored —
// this is defense-in-depth alongside the client-side UX validation in the
// survey wizard.

export const localeSchema = z.enum(['en', 'ar']);

const pct = z.number().int().min(0).max(100);
const rating = z.number().int().min(1).max(5);

export const quadrantAuditSchema = z.object({
  survivalPct: pct,
  performancePct: pct,
  burnoutPct: pct,
  renewalPct: pct,
});

export const behavioralAnswersSchema = z.object(
  Object.fromEntries(BEHAVIORAL_ITEM_CODES.map((code) => [code, rating])) as Record<
    (typeof BEHAVIORAL_ITEM_CODES)[number],
    typeof rating
  >,
);

// Free-text fields are optional and intentionally short — this is a
// data-minimization control, not just a UI nicety.
const optionalShortText = z
  .string()
  .trim()
  .max(120)
  .optional()
  .transform((v) => (v ? v : undefined));

export const submitResponseSchema = z.object({
  locale: localeSchema,
  csrfToken: z.string().min(16),
  consentAccepted: z.literal(true),
  team: optionalShortText,
  department: optionalShortText,
  cycleLabel: optionalShortText,
  quadrantAudit: quadrantAuditSchema,
  behavioralAnswers: behavioralAnswersSchema,
});

export type SubmitResponseInput = z.infer<typeof submitResponseSchema>;

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1).max(80),
  password: z.string().min(1).max(200),
  csrfToken: z.string().min(16),
});

export const dashboardFilterSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  team: z.string().optional(),
  department: z.string().optional(),
  cycleLabel: z.string().optional(),
});

export type DashboardFilterInput = z.infer<typeof dashboardFilterSchema>;
