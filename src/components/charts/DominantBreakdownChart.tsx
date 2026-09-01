'use client';

import { Bar, BarChart, CartesianGrid, Cell, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { QUADRANTS } from '@/lib/scoring';
import { QUADRANT_CHART_COLORS, TIE_CHART_COLOR } from '@/lib/chart-colors';
import type { DominantCounts } from '@/lib/admin-data';
import type { Dictionary } from '@/lib/i18n/dictionaries';

export function DominantBreakdownChart({ counts, dict }: { counts: DominantCounts; dict: Dictionary }) {
  const data = [
    ...QUADRANTS.map((q) => ({ name: dict.admin.quadrant[q], value: counts[q], fill: QUADRANT_CHART_COLORS[q] })),
    { name: dict.admin.dominantTie, value: counts.TIE, fill: TIE_CHART_COLOR },
  ];

  return (
    <div dir="ltr" className="scroll-container">
      <div style={{ minWidth: 320, height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((d) => (
                <Cell key={d.name} fill={d.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
