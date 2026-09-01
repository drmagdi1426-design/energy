'use client';

import { Bar, BarChart, CartesianGrid, Cell, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { QUADRANTS } from '@/lib/scoring';
import { QUADRANT_CHART_COLORS } from '@/lib/chart-colors';
import type { AverageAudit } from '@/lib/admin-data';
import type { Dictionary } from '@/lib/i18n/dictionaries';

export function QuadrantDistributionChart({ avgAudit, dict }: { avgAudit: AverageAudit; dict: Dictionary }) {
  const fieldByQuadrant = {
    SURVIVAL: 'survivalPct',
    PERFORMANCE: 'performancePct',
    BURNOUT: 'burnoutPct',
    RENEWAL: 'renewalPct',
  } as const;

  const data = QUADRANTS.map((q) => ({
    name: dict.admin.quadrant[q],
    value: avgAudit[fieldByQuadrant[q]],
    fill: QUADRANT_CHART_COLORS[q],
  }));

  return (
    <div dir="ltr" className="scroll-container">
      <div style={{ minWidth: 320, height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis unit="%" tick={{ fontSize: 12 }} domain={[0, 100]} />
            <Tooltip formatter={(v) => [`${v}%`, '']} />
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
