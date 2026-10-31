'use client';

import {
  Briefcase,
  Eye,
  FileText,
  GraduationCap,
  type LucideIcon,
  Mail,
  UserCheck,
  Users,
} from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

export const KPI_ICONS = {
  eye: Eye,
  users: Users,
  userCheck: UserCheck,
  mail: Mail,
  fileText: FileText,
  graduationCap: GraduationCap,
  briefcase: Briefcase,
} satisfies Record<string, LucideIcon>;

export type KpiIconKey = keyof typeof KPI_ICONS;

export type KpiCardProps = {
  label: string;
  value: string;
  delta: string;
  deltaUp?: boolean;
  caption: string;
  icon: KpiIconKey;
  color: string;
  spark: { label: string; value: number }[];
};

export function KpiCard({
  label,
  value,
  delta,
  deltaUp = true,
  caption,
  icon,
  color,
  spark,
}: KpiCardProps) {
  const Icon = KPI_ICONS[icon];

  return (
    <article className="admin-surface relative overflow-hidden p-4">
      <div className="flex items-start justify-between gap-3">
        <span
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}22`, color }}
        >
          <Icon size={19} />
        </span>
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
          style={{
            backgroundColor: deltaUp ? 'rgba(22,163,106,0.14)' : 'rgba(226,145,43,0.14)',
            color: deltaUp ? '#3ddc97' : '#f0b357',
          }}
        >
          {deltaUp ? '▲' : '▼'} {delta}
        </span>
      </div>

      <p className="mt-3 text-[13px] font-medium text-[#8494b0]">{label}</p>
      <p className="mt-0.5 text-2xl font-bold tracking-tight text-white">{value}</p>
      <p className="mt-0.5 text-[11px] text-[#6b7d99]">{caption}</p>

      <div className="mt-2 h-10 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={spark} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.45} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#grad-${color.replace('#', '')})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
