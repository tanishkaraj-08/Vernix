import React from 'react';
import { Bureau } from '../../types';

export const BureauBadge: React.FC<{ bureau: Bureau; showFullName?: boolean }> = ({ bureau, showFullName = false }) => {
  const getInfo = () => {
    switch (bureau) {
      case 'RB':
        return {
          short: 'RB',
          full: 'Regulation Bureau (Approval)',
          style: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      case 'PGRC':
        return {
          short: 'PGRC',
          full: 'Public Grievance Redressal Cell',
          style: 'bg-indigo-50 text-indigo-700 border-indigo-200'
        };
      case 'VIGILANCE':
        return {
          short: 'VIGILANCE',
          full: 'Chief Vigilance Cell',
          style: 'bg-purple-50 text-purple-700 border-purple-200'
        };
      default:
        return {
          short: bureau,
          full: bureau,
          style: 'bg-slate-100 text-slate-700 border-slate-200'
        };
    }
  };

  const info = getInfo();

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold tracking-wide border ${info.style}`} title={info.full}>
      {showFullName ? info.full : info.short}
    </span>
  );
};

