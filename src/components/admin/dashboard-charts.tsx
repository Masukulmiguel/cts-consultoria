'use client';

import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export type SeriesPoint = { label: string; value: number };

const AXIS = { stroke: '#6b7d99', fontSize: 11 };
const TOOLTIP_STYLE = {
  backgroundColor: '#0d1729',
  border: '1px solid #1c2c49',
  borderRadius: 10,
  fontSize: 12,
  color: '#e8eef9',
};

export function VisitsAreaChart({ data }: { data: SeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <defs>
          <linearGradient id="visitsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2e7be8" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#2e7be8" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          cursor={{ stroke: '#2e7be8', strokeDasharray: '4 4' }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#2e7be8"
          strokeWidth={2.5}
          fill="url(#visitsFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export type DonutSlice = { name: string; value: number; color: string };

export function TrafficDonut({ data, centerLabel }: { data: DonutSlice[]; centerLabel: string }) {
  const total = data.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <div className="flex h-full items-center gap-4">
      <div className="relative h-40 w-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="95%"
              paddingAngle={2}
              stroke="none"
            >
              {data.map((slice) => (
                <Cell key={slice.name} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-white">{total.toLocaleString('pt-PT')}</span>
          <span className="text-[10px] uppercase tracking-wide text-[#8494b0]">{centerLabel}</span>
        </div>
      </div>

      <ul className="min-w-0 flex-1 space-y-2.5">
        {data.map((slice) => (
          <li key={slice.name} className="flex items-center gap-2.5 text-xs">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: slice.color }}
            />
            <span className="min-w-0 flex-1 truncate text-[#a8b6cf]">{slice.name}</span>
            <span className="font-semibold text-white">
              {((slice.value / total) * 100).toFixed(1).replace('.', ',')}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
