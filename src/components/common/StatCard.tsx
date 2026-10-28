import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'blue' | 'amber' | 'emerald' | 'purple' | 'red' | 'indigo' | 'slate';
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  onClick?: () => void;
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'blue',
  trend,
  onClick,
  badge,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'blue':
        return {
          iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
          borderAccent: 'hover:border-blue-300',
          glow: 'group-hover:text-blue-600',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
          borderAccent: 'hover:border-amber-300',
          glow: 'group-hover:text-amber-600',
        };
      case 'emerald':
        return {
          iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
          borderAccent: 'hover:border-emerald-300',
          glow: 'group-hover:text-emerald-600',
        };
      case 'purple':
        return {
          iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
          borderAccent: 'hover:border-purple-300',
          glow: 'group-hover:text-purple-600',
        };
      case 'red':
        return {
          iconBg: 'bg-red-50 text-red-600 border-red-100',
          borderAccent: 'hover:border-red-300',
          glow: 'group-hover:text-red-600',
        };
      case 'indigo':
        return {
          iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
          borderAccent: 'hover:border-indigo-300',
          glow: 'group-hover:text-indigo-600',
        };
      default:
        return {
          iconBg: 'bg-slate-100 text-slate-700 border-slate-200',
          borderAccent: 'hover:border-slate-300',
          glow: 'group-hover:text-slate-800',
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white rounded-xl border border-slate-200/80 p-5 shadow-subtle hover:shadow-card transition-all duration-200 ${
        onClick ? 'cursor-pointer' : ''
      } ${vStyles.borderAccent}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {title}
            </span>
            {badge && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-600">
                {badge}
              </span>
            )}
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 font-sans">
            {value}
          </div>
        </div>
        <div className={`p-2.5 rounded-lg border ${vStyles.iconBg} transition-colors`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>{subtitle}</span>
          {trend && (
            <span
              className={`font-medium ${
                trend.isNeutral
                  ? 'text-slate-500'
                  : trend.isPositive
                  ? 'text-emerald-600'
                  : 'text-amber-600'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

