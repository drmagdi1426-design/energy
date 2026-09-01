'use client';

import {
  CartesianGrid,
  ReferenceLine,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts';
import { QUADRANT_CHART_COLORS, TIE_CHART_COLOR } from '@/lib/chart-colors';
import type { DashboardAggregate } from '@/lib/admin-data';
import type { Dictionary } from '@/lib/i18n/dictionaries';

/**
 * 2x2 quadrant scatter: each point is one response, plotted on derived
 * stress (x) / energy (y) axes — see scoring.ts computeQuadrantCoordinates.
 * Quadrant corners: top-left = Survival, top-right = Performance,
 * bottom-left = Burnout, bottom-right = Renewal.
 */
export function QuadrantScatterChart({
  scatter,
  dict,
}: {
  scatter: DashboardAggregate['scatter'];
  dict: Dictionary;
}) {
  return (
    <div dir="ltr" className="scroll-container">
      <div style={{ minWidth: 340, height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
            <XAxis
              type="number"
              dataKey="stress"
              domain={[-8, 8]}
              tick={{ fontSize: 11 }}
              label={{ value: 'Stress →', position: 'insideBottomRight', fontSize: 11 }}
            />
            <YAxis
              type="number"
              dataKey="energy"
              domain={[-8, 8]}
              tick={{ fontSize: 11 }}
              label={{ value: 'Energy →', angle: -90, position: 'insideTopLeft', fontSize: 11 }}
            />
            <ReferenceLine x={0} stroke="#c9c9c9" />
            <ReferenceLine y={0} stroke="#c9c9c9" />
            <Tooltip
              formatter={(value, name) => [value, name]}
              labelFormatter={() => ''}
            />
            <Scatter
              data={scatter}
              fill="#3C7DCB"
              shape={(props: { cx?: number; cy?: number; payload?: { dominant: keyof typeof QUADRANT_CHART_COLORS | 'TIE' } }) => {
                const { cx = 0, cy = 0, payload } = props;
                const color = payload && payload.dominant !== 'TIE' ? QUADRANT_CHART_COLORS[payload.dominant] : TIE_CHART_COLOR;
                return <circle cx={cx} cy={cy} r={5} fill={color} fillOpacity={0.75} />;
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-mid">
        {(['SURVIVAL', 'PERFORMANCE', 'BURNOUT', 'RENEWAL'] as const).map((q) => (
          <span key={q} className="flex items-center gap-1">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: QUADRANT_CHART_COLORS[q] }}
            />
            {dict.admin.quadrant[q]}
          </span>
        ))}
      </div>
    </div>
  );
}
