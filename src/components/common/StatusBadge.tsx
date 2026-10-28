import React from 'react';
import { CaseStatus } from '../../types';

interface StatusBadgeProps {
  status: CaseStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const getStyle = () => {
    switch (status) {
      case 'Submitted':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Assigned':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Under Process':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Transferred':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Action Taken':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Disposed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getDotColor = () => {
    switch (status) {
      case 'Submitted': return 'bg-slate-400';
      case 'Assigned': return 'bg-blue-500';
      case 'Under Process': return 'bg-amber-500';
      case 'Transferred': return 'bg-purple-500';
      case 'Action Taken': return 'bg-teal-500';
      case 'Disposed': return 'bg-emerald-500';
      default: return 'bg-slate-400';
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs font-medium' : 'px-2.5 py-1 text-sm font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${getStyle()} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${getDotColor()}`} />
      <span>{status}</span>
    </span>
  );
};
