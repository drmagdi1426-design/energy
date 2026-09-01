/**
 * Fills "{token}" placeholders in a dictionary string. Dictionary entries
 * are kept as plain strings (never functions) so the whole Dictionary
 * object stays serializable across the Server/Client Component boundary.
 */
export function fillTemplate(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)),
    template,
  );
}
