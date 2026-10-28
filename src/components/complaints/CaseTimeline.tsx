import React from 'react';
import { Complaint, CaseStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { BureauBadge } from '../common/BureauBadge';
import {
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  User,
  MessageSquareQuote
} from 'lucide-react';

interface CaseTimelineProps {
  complaint: Complaint;
  onOpenStatusModal?: () => void;
  onOpenAddRemarkModal?: () => void;
}

const STAGES: CaseStatus[] = [
  'Submitted',
  'Assigned',
  'Under Process',
  'Transferred',
  'Action Taken',
  'Disposed'
];

export const CaseTimeline: React.FC<CaseTimelineProps> = ({
  complaint,
  onOpenStatusModal,
  onOpenAddRemarkModal,
}) => {
  const currentStageIndex = STAGES.indexOf(complaint.currentStatus);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-subtle p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base">Case Journey & Accountability Trail</h3>
            <StatusBadge status={complaint.currentStatus} size="md" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Full statutory audit history showing officer actions, bureau handoffs, and verification remarks
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onOpenAddRemarkModal && (
            <button
              onClick={onOpenAddRemarkModal}
              className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <MessageSquareQuote className="w-3.5 h-3.5 text-slate-500" />
              Add Internal Remark
            </button>
          )}

          {onOpenStatusModal && (
            <button
              onClick={onOpenStatusModal}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              Update Case Stage
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Stage Progression Bar */}
      <div className="py-2 overflow-x-auto">
        <div className="min-w-[640px] flex items-center justify-between relative">
          {/* Background connecting line */}
          <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-slate-200 z-0" />

          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const isUpcoming = idx > currentStageIndex;

            return (
              <div key={stage} className="relative z-10 flex flex-col items-center group">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-50'
                      : isCurrent
                      ? 'bg-blue-600 text-white shadow-md ring-4 ring-blue-100 animate-pulse'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isCurrent ? (
                    <span>{idx + 1}</span>
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <div className="mt-2 text-center">
                  <div
                    className={`text-xs font-semibold ${
                      isCurrent
                        ? 'text-blue-700'
                        : isCompleted
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {stage}
                  </div>
                  {isCurrent && (
                    <div className="text-[10px] text-blue-600 font-medium">Active Stage</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timestamped Audit Timeline Feed */}
      <div className="space-y-4 pt-2">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Timestamped Activity & Remarks History
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {complaint.timeline.map((entry, index) => (
            <div key={entry.id} className="relative group">
              {/* Dot */}
              <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-blue-600 shadow-xs" />

              <div className="bg-slate-50/70 hover:bg-slate-50 rounded-xl p-4 border border-slate-200/80 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={entry.status} />
                    <BureauBadge bureau={entry.bureau} />
                    <span className="font-semibold text-slate-800 text-xs flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {entry.officerName}
                    </span>
                    <span className="text-[11px] text-slate-400">({entry.officerRole})</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(entry.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-2 text-xs text-slate-700 leading-relaxed">
                  {entry.remarks}
                </div>

                {entry.actionTaken && (
                  <div className="mt-2 p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                    <strong>Action Recorded:</strong> {entry.actionTaken}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
