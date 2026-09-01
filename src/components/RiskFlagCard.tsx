import type { RiskFlag } from '@/lib/admin-data';
import type { Dictionary } from '@/lib/i18n/dictionaries';

export function RiskFlagList({ flags, dict }: { flags: RiskFlag[]; dict: Dictionary }) {
  if (flags.length === 0) {
    return <p className="text-sm text-gray-mid">{dict.admin.noRiskFlags}</p>;
  }

  return (
    <ul className="space-y-2">
      {flags.map((flag) => (
        <li
          key={flag.key}
          className="brand-card brand-card--amber flex items-start gap-2 py-3"
          style={flag.level === 'critical' ? { borderInlineStartColor: '#B3261E' } : undefined}
        >
          <span aria-hidden="true" className="mt-0.5 text-amber">
            ⚠
          </span>
          <span className="text-sm text-navy">{flag.message}</span>
        </li>
      ))}
    </ul>
  );
}
