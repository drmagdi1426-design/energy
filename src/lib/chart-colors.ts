import type { QuadrantKey } from '@/lib/scoring';

// Chart series colors, derived from the Tharwah palette. Academy Blue and
// Amber are used as specified (accents, not page-dominant). Burnout and
// Renewal need two more visually distinct series colors that aren't in the
// core palette — a muted danger red (already used for form errors) and a
// teal derived from the Mint tone — used ONLY as chart marks, never as a
// dominant UI color.
export const QUADRANT_CHART_COLORS: Record<QuadrantKey, string> = {
  PERFORMANCE: '#3C7DCB', // Academy Blue
  SURVIVAL: '#E8A33D', // Amber
  BURNOUT: '#B3261E', // danger red
  RENEWAL: '#3FA8B5', // Mint-derived teal
};

export const TIE_CHART_COLOR = '#797979'; // Gray
