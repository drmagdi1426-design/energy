'use client';

import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { QUADRANTS } from '@/lib/scoring';
import { QUADRANT_CHART_COLORS } from '@/lib/chart-colors';
import type { CycleTrendPoint } from '@/lib/admin-data';
import type { Dictionary } from '@/lib/i18n/dictionaries';

export function TrendChart({ trend, dict }: { trend: CycleTrendPoint[]; dict: Dictionary }) {
  const data = trend.map((point) => ({
    label: point.label,
    SURVIVAL: point.avgAudit.survivalPct,
    PERFORMANCE: point.avgAudit.performancePct,
    BURNOUT: point.avgAudit.burnoutPct,
    RENEWAL: point.avgAudit.renewalPct,
  }));

  return (
    <div dir="ltr" className="scroll-container">
      <div style={{ minWidth: 420, height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => [`${v}%`, '']} />
            <Legend
              formatter={(value: string) => dict.admin.quadrant[value as keyof typeof dict.admin.quadrant]}
            />
            {QUADRANTS.map((q) => (
              <Line
                key={q}
                type="monotone"
                dataKey={q}
                name={q}
                stroke={QUADRANT_CHART_COLORS[q]}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
