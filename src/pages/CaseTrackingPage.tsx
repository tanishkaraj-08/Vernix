import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GitMerge,
  Kanban,
  List,
  Sparkles,
  ClockAlert,
  ArrowRight,
  Building2,
  Calendar,
  User,
  Filter
} from 'lucide-react';
import { getComplaints, updateComplaintStatus, subscribeToStore } from '../lib/storage';
import { Complaint, CaseStatus } from '../types';
import { BureauBadge } from '../components/common/BureauBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { StatusUpdateModal } from '../components/complaints/StatusUpdateModal';
import { useRole } from '../lib/roleContext';

const PIPELINE_STAGES: CaseStatus[] = [
  'Submitted',
  'Assigned',
  'Under Process',
  'Transferred',
  'Action Taken',
  'Disposed'
];

export const CaseTrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentBureauFilter, isAuditor } = useRole();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const loadData = () => {
    setComplaints(getComplaints());
  };

  useEffect(() => {
    loadData();
    return subscribeToStore(loadData);
  }, []);

  const filteredComplaints = complaints.filter(c => {
    if (currentBureauFilter !== 'ALL' && c.bureau !== currentBureauFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              <GitMerge className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Statutory Lifecycle
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Case Journey & Stage Pipeline
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Visual tracking across all six procedural stages: Submitted → Assigned → Under Process → Transferred → Action Taken → Disposed.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setViewMode('board')}
            className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === 'board' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            Stage Pipeline Board
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === 'list' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            List Sequence
          </button>
        </div>
      </div>

      {/* Board Pipeline View */}
      {viewMode === 'board' ? (
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[1200px] grid grid-cols-6 gap-3.5">
            {PIPELINE_STAGES.map((stage, idx) => {
              const stageComplaints = filteredComplaints.filter(c => c.currentStatus === stage);

              return (
                <div
                  key={stage}
                  className="bg-slate-50/80 rounded-2xl border border-slate-200/90 flex flex-col max-h-[720px]"
                >
                  {/* Column Header */}
                  <div className="p-3.5 border-b border-slate-200/80 flex items-center justify-between bg-white rounded-t-2xl">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-xs text-slate-900">{stage}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 font-mono">
                      {stageComplaints.length}
                    </span>
                  </div>

                  {/* Cards Area */}
                  <div className="p-2.5 space-y-2.5 overflow-y-auto flex-1">
                    {stageComplaints.length === 0 ? (
                      <div className="p-4 text-center text-slate-400 text-xs italic">
                        No cases currently in {stage}
                      </div>
                    ) : (
                      stageComplaints.map(c => (
                        <div
                          key={c.id}
                          className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-2xs hover:shadow-subtle hover:border-blue-300 transition-all space-y-2 text-xs group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold font-mono text-blue-900">{c.id}</span>
                            <BureauBadge bureau={c.bureau} />
                          </div>

                          <div
                            onClick={() => navigate(`/institutions/${c.institutionId}`)}
                            className="font-bold text-slate-800 hover:text-blue-600 cursor-pointer text-[11px] truncate"
                            title={c.institutionName}
                          >
                            {c.institutionName}
                          </div>

                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                            {c.subject}
                          </p>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                            <PriorityBadge priority={c.priority} />
                            {c.hasPotentialOverlap && (
                              <span className="flex items-center gap-0.5 text-purple-700 font-bold">
                                <Sparkles className="w-3 h-3 text-purple-600" /> Overlap
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                            <span>Lodged: {c.submissionDate}</span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setSelectedComplaint(c);
                                  setIsStatusModalOpen(true);
                                }}
                                className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-semibold transition-colors"
                              >
                                Advance
                              </button>
                              <button
                                onClick={() => navigate(`/complaints/${c.id}`)}
                                className="px-1.5 py-0.5 text-slate-500 hover:text-slate-800"
                                title="Inspect"
                              >
                                View →
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Sequence List View */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-5 space-y-4">
          {PIPELINE_STAGES.map((stage) => {
            const stageComplaints = filteredComplaints.filter(c => c.currentStatus === stage);

            return (
              <div key={stage} className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={stage} />
                    <span className="font-bold text-slate-800 text-xs">{stage} Stage</span>
                  </div>
                  <span className="text-xs text-slate-500 font-semibold">{stageComplaints.length} cases</span>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {stageComplaints.length === 0 ? (
                    <div className="p-3 text-slate-400 italic">No cases in this stage.</div>
                  ) : (
                    stageComplaints.map(c => (
                      <div key={c.id} className="p-3 hover:bg-slate-50 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="font-mono font-bold text-blue-900">{c.id}</span>
                          <BureauBadge bureau={c.bureau} />
                          <div className="truncate">
                            <span className="font-semibold text-slate-800">{c.institutionName}</span>
                            <span className="text-slate-400 mx-1.5">•</span>
                            <span className="text-slate-600">{c.subject}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <PriorityBadge priority={c.priority} />
                          <button
                            onClick={() => {
                              setSelectedComplaint(c);
                              setIsStatusModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded font-medium transition-colors"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => navigate(`/complaints/${c.id}`)}
                            className="px-2.5 py-1 border border-slate-200 hover:bg-slate-100 rounded text-slate-700"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Status Update Modal */}
      <StatusUpdateModal
        complaint={selectedComplaint}
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};

