/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LucideIcon } from 'lucide-react';
import { cn, formatNumber } from '../lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'indigo' | 'emerald' | 'amber' | 'violet' | 'slate';
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-600',
  indigo: 'bg-indigo-50 text-indigo-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  violet: 'bg-violet-50 text-violet-600',
  slate: 'bg-slate-50 text-slate-600',
};

export default function KPICard({ title, value, icon: Icon, color }: KPICardProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</p>
          <h3 className="mt-2 text-2xl font-black text-gray-900">
            {typeof value === 'number' ? formatNumber(value) : value}
          </h3>
        </div>
        <div className={cn("rounded-xl p-2.5", colorMap[color])}>
          <Icon size={20} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1.5 grayscale opacity-50">
        <div className="h-1 w-12 rounded-full bg-current opacity-20" />
        <span className="text-[10px] font-medium">Real-time sync</span>
      </div>
    </div>
  );
}
