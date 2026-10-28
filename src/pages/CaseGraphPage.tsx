import React from 'react';
import { CaseRelationshipGraph } from '../components/network/CaseRelationshipGraph';
import { Share2, Info } from 'lucide-react';

export const CaseGraphPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
              <Share2 className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Network Topology Analysis
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Cross-Bureau Grievance Relationship Network
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Interactive visual network model from Slide 3 representing institutional anchors, parallel case branches across RB and PGRC, and AI-predicted overlap bridges.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Click any node to inspect details or jump to file dossier</span>
        </div>
      </div>

      {/* Main Interactive Graph */}
      <CaseRelationshipGraph />
    </div>
  );
};
