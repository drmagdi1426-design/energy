// Estimated completion time is computed from the actual item count rather
// than hard-coded, per the build spec ("target 4-6 minutes; display it,
// don't just guess"). The per-field second estimates below were calibrated
// so the total lands in that band — adjust here if the questionnaire
// changes shape, and the landing page picks it up automatically.

export const SECTION_A_FIELD_COUNT = 4; // four quadrant percentages
export const SECTION_B_ITEM_COUNT = 8; // eight behavioral items
export const TOTAL_REQUIRED_ITEM_COUNT = SECTION_A_FIELD_COUNT + SECTION_B_ITEM_COUNT;

const SECONDS_PER_SECTION_A_FIELD = 30; // reading the descriptor + adjusting a value that must balance to 100
const SECONDS_PER_SECTION_B_ITEM = 12; // reading a statement + a single 1-5 click
const SECTION_OVERHEAD_SECONDS = 20; // reading each section's instructions, per section

export function estimatedCompletionSeconds(): number {
  return (
    SECTION_OVERHEAD_SECONDS * 2 +
    SECTION_A_FIELD_COUNT * SECONDS_PER_SECTION_A_FIELD +
    SECTION_B_ITEM_COUNT * SECONDS_PER_SECTION_B_ITEM
  );
}

export function estimatedCompletionMinutes(): number {
  return Math.max(1, Math.round(estimatedCompletionSeconds() / 60));
}
