import React from 'react';
import { LucideIcon } from 'lucide-react';

interface QuickStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  colorScheme?: 'purple' | 'emerald' | 'amber' | 'blue' | 'rose';
  trend?: string;
}

export const QuickStatsCard: React.FC<QuickStatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme = 'purple',
  trend
}) => {
  const schemeStyles = {
    purple: {
      bg: 'bg-purple-50 text-brand-700',
      border: 'border-purple-100 hover:border-brand-300',
      glow: 'from-brand-500/10 to-indigo-500/10'
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-700',
      border: 'border-emerald-100 hover:border-emerald-300',
      glow: 'from-emerald-500/10 to-teal-500/10'
    },
    amber: {
      bg: 'bg-amber-50 text-amber-700',
      border: 'border-amber-100 hover:border-amber-300',
      glow: 'from-amber-500/10 to-orange-500/10'
    },
    blue: {
      bg: 'bg-blue-50 text-blue-700',
      border: 'border-blue-100 hover:border-blue-300',
      glow: 'from-blue-500/10 to-sky-500/10'
    },
    rose: {
      bg: 'bg-rose-50 text-rose-700',
      border: 'border-rose-100 hover:border-rose-300',
      glow: 'from-rose-500/10 to-pink-500/10'
    }
  }[colorScheme];

  return (
    <div className={`relative bg-white rounded-3xl p-6 border ${schemeStyles.border} shadow-soft hover:shadow-luxury transition-all duration-300 overflow-hidden group`}>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${schemeStyles.glow} rounded-bl-full pointer-events-none transition-transform group-hover:scale-110 duration-500`} />
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 font-serif">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          {trend && (
            <span className="inline-block mt-2 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              {trend}
            </span>
          )}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${schemeStyles.bg} shadow-xs group-hover:scale-105 transition-transform`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

