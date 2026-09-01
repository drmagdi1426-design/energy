import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { DashboardFilters } from '@/lib/admin-data';

export function FilterBar({
  action,
  filters,
  teams,
  departments,
  dict,
}: {
  action: string;
  filters: DashboardFilters;
  teams: string[];
  departments: string[];
  dict: Dictionary;
}) {
  return (
    <form method="get" action={action} className="brand-card mb-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div>
          <label htmlFor="from" className="field-label text-xs">
            {dict.admin.filterFrom}
          </label>
          <input
            id="from"
            name="from"
            type="date"
            defaultValue={filters.from}
            className="mt-1 w-full rounded-md border border-gray-mid/40 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label htmlFor="to" className="field-label text-xs">
            {dict.admin.filterTo}
          </label>
          <input
            id="to"
            name="to"
            type="date"
            defaultValue={filters.to}
            className="mt-1 w-full rounded-md border border-gray-mid/40 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label htmlFor="team" className="field-label text-xs">
            {dict.admin.filterTeam}
          </label>
          <select
            id="team"
            name="team"
            defaultValue={filters.team ?? ''}
            className="mt-1 w-full rounded-md border border-gray-mid/40 px-2 py-1.5 text-sm"
          >
            <option value="">—</option>
            {teams.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="department" className="field-label text-xs">
            {dict.admin.filterDepartment}
          </label>
          <select
            id="department"
            name="department"
            defaultValue={filters.department ?? ''}
            className="mt-1 w-full rounded-md border border-gray-mid/40 px-2 py-1.5 text-sm"
          >
            <option value="">—</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="cycleLabel" className="field-label text-xs">
            {dict.admin.filterCycle}
          </label>
          <input
            id="cycleLabel"
            name="cycleLabel"
            type="text"
            defaultValue={filters.cycleLabel}
            className="mt-1 w-full rounded-md border border-gray-mid/40 px-2 py-1.5 text-sm"
          />
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <button type="submit" className="btn-primary text-sm">
          {dict.admin.filterApply}
        </button>
        <a href={action} className="btn-secondary text-sm">
          {dict.admin.filterClear}
        </a>
      </div>
    </form>
  );
}
