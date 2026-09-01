/** Minimal, dependency-free CSV builder with RFC 4180-style quoting. */
export function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]!);

  const escapeCell = (value: unknown): string => {
    const s = value === null || value === undefined ? '' : String(value);
    if (/["\n,]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => escapeCell(row[h])).join(',')),
  ];
  return lines.join('\n');
}
