/**
 * Team Energy Matrix — scoring module.
 *
 * SINGLE SOURCE OF TRUTH for all scoring logic. This module is imported only
 * by server-side code (API route handlers, admin data loaders). The frontend
 * never recomputes scores — it only does light client-side UX validation
 * (e.g. "does this sum to 100 yet?") that is always re-verified here before
 * anything is written to the database.
 *
 * NOTE ON SOURCE MATERIAL: the build brief referenced a specific two-part
 * instrument (Quadrant Time-Distribution Audit + 8-Item Behavioral
 * Diagnostic) but did not supply the instrument's exact item wording or the
 * exact zone-name-to-quadrant mapping for the 7-10 scoring band. Item
 * wording and the zone-name mapping below were authored to be consistent
 * with the instrument's stated structure and MUST be confirmed against the
 * real Tharwah instrument before this ships. See README "Decisions Log".
 */

export const QUADRANTS = ['SURVIVAL', 'PERFORMANCE', 'BURNOUT', 'RENEWAL'] as const;
export type QuadrantKey = (typeof QUADRANTS)[number];

export const BEHAVIORAL_ITEM_CODES = ['S1', 'S2', 'P1', 'P2', 'B1', 'B2', 'R1', 'R2'] as const;
export type BehavioralItemCodeKey = (typeof BEHAVIORAL_ITEM_CODES)[number];

export const ITEM_TO_QUADRANT: Record<BehavioralItemCodeKey, QuadrantKey> = {
  S1: 'SURVIVAL',
  S2: 'SURVIVAL',
  P1: 'PERFORMANCE',
  P2: 'PERFORMANCE',
  B1: 'BURNOUT',
  B2: 'BURNOUT',
  R1: 'RENEWAL',
  R2: 'RENEWAL',
};

/**
 * Assumed zone-name mapping for a quadrant pair-sum of 7-10 (of a possible
 * 2-10). The brief listed four zone names — "overload, preservation, crisis,
 * optimization" — without stating which belongs to which quadrant. Mapping
 * chosen here:
 *   SURVIVAL    (reactive/defensive under pressure) -> Overload Zone
 *   PERFORMANCE (sustained high focus & output)      -> Optimization Zone
 *   BURNOUT     (depleted, disengaged)                -> Crisis Zone
 *   RENEWAL     (actively recovering)                 -> Preservation Zone
 * Flagged as a decision point in README — confirm or override with Tharwah.
 */
export const ZONE_BY_QUADRANT: Record<QuadrantKey, string> = {
  SURVIVAL: 'Overload Zone',
  PERFORMANCE: 'Optimization Zone',
  BURNOUT: 'Crisis Zone',
  RENEWAL: 'Preservation Zone',
};

export type ScoreBand = 'LOW' | 'MODERATE' | 'HIGH';

export function bandForSum(sum: number): ScoreBand {
  if (sum >= 7) return 'HIGH';
  if (sum >= 5) return 'MODERATE';
  return 'LOW';
}

export interface QuadrantAuditInput {
  survivalPct: number;
  performancePct: number;
  burnoutPct: number;
  renewalPct: number;
}

export interface QuadrantAuditValidationResult {
  valid: boolean;
  total: number;
  errors: string[];
}

/** Server-side re-validation of the Section A percentages. Never trust the client's sum-check. */
export function validateQuadrantAudit(input: QuadrantAuditInput): QuadrantAuditValidationResult {
  const errors: string[] = [];
  const values = [input.survivalPct, input.performancePct, input.burnoutPct, input.renewalPct];

  for (const v of values) {
    if (!Number.isInteger(v) || v < 0 || v > 100) {
      errors.push('Each quadrant percentage must be a whole number between 0 and 100.');
      break;
    }
  }

  const total = values.reduce((sum, v) => sum + (Number.isFinite(v) ? v : 0), 0);
  if (total !== 100) {
    errors.push(`Quadrant percentages must sum to 100 (received ${total}).`);
  }

  return { valid: errors.length === 0, total, errors };
}

export type BehavioralAnswers = Record<BehavioralItemCodeKey, number>;

export interface QuadrantSums {
  SURVIVAL: number;
  PERFORMANCE: number;
  BURNOUT: number;
  RENEWAL: number;
}

export interface BehavioralScoreResult {
  sums: QuadrantSums;
  bands: Record<QuadrantKey, ScoreBand>;
  zones: Record<QuadrantKey, string | null>;
  dominant: QuadrantKey | null;
  isTie: boolean;
  tiedQuadrants: QuadrantKey[];
}

/** Validate raw 1-5 ratings for all 8 items. */
export function validateBehavioralAnswers(answers: Partial<BehavioralAnswers>): string[] {
  const errors: string[] = [];
  for (const code of BEHAVIORAL_ITEM_CODES) {
    const v = answers[code];
    if (v === undefined || v === null) {
      errors.push(`Missing rating for item ${code}.`);
      continue;
    }
    if (!Number.isInteger(v) || v < 1 || v > 5) {
      errors.push(`Item ${code} must be rated 1-5 (received ${String(v)}).`);
    }
  }
  return errors;
}

/** Compute quadrant pair sums, dominant baseline (with explicit tie handling), and risk zones. */
export function computeBehavioralScores(answers: BehavioralAnswers): BehavioralScoreResult {
  const sums: QuadrantSums = {
    SURVIVAL: answers.S1 + answers.S2,
    PERFORMANCE: answers.P1 + answers.P2,
    BURNOUT: answers.B1 + answers.B2,
    RENEWAL: answers.R1 + answers.R2,
  };

  const bands = Object.fromEntries(
    QUADRANTS.map((q) => [q, bandForSum(sums[q])]),
  ) as Record<QuadrantKey, ScoreBand>;

  const zones = Object.fromEntries(
    QUADRANTS.map((q) => [q, bands[q] === 'HIGH' ? ZONE_BY_QUADRANT[q] : null]),
  ) as Record<QuadrantKey, string | null>;

  const maxSum = Math.max(...QUADRANTS.map((q) => sums[q]));
  const topQuadrants = QUADRANTS.filter((q) => sums[q] === maxSum);
  const isTie = topQuadrants.length > 1;

  return {
    sums,
    bands,
    zones,
    dominant: isTie ? null : (topQuadrants[0] ?? null),
    isTie,
    tiedQuadrants: isTie ? topQuadrants : [],
  };
}

export interface QuadrantCoordinates {
  /** Stress axis: negative = calmer/lower-stress, positive = higher-stress. Range roughly -8..8. */
  stress: number;
  /** Energy axis: negative = depleted/low-energy, positive = activated/high-energy. Range roughly -8..8. */
  energy: number;
}

/**
 * Derives a 2x2-plottable (stress, energy) coordinate from the four
 * quadrant sums, for the admin dashboard's quadrant scatter chart:
 *   high energy + low stress  -> Performance
 *   high energy + high stress -> Survival
 *   low energy  + high stress -> Burnout
 *   low energy  + low stress  -> Renewal
 */
export function computeQuadrantCoordinates(sums: QuadrantSums): QuadrantCoordinates {
  return {
    stress: sums.SURVIVAL + sums.BURNOUT - sums.PERFORMANCE - sums.RENEWAL,
    energy: sums.PERFORMANCE + sums.SURVIVAL - sums.BURNOUT - sums.RENEWAL,
  };
}

/** Risk flag: share of a group whose dominant baseline is a given quadrant. */
export function dominantShare(dominants: (QuadrantKey | null)[], quadrant: QuadrantKey): number {
  if (dominants.length === 0) return 0;
  const count = dominants.filter((d) => d === quadrant).length;
  return count / dominants.length;
}

/** Thresholds used to drive dashboard risk flags (playbook-style rules). */
export const RISK_THRESHOLDS = {
  /** Share of team with Survival as dominant baseline that triggers a workload-audit flag. */
  SURVIVAL_DOMINANT_SHARE: 0.3,
  /** Share of team with Burnout as dominant baseline that triggers an urgent flag. */
  BURNOUT_DOMINANT_SHARE: 0.2,
  /** Average time-audit % in Burnout quadrant that triggers a flag. */
  BURNOUT_TIME_AVG_PCT: 25,
} as const;
