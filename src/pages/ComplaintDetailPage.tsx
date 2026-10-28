import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Download,
  Share2,
  MessageSquareQuote,
  CheckCircle2,
  Paperclip,
  ExternalLink,
  Info,
  ClockAlert
} from 'lucide-react';
import { getComplaints, updateComplaintStatus, addComplaintRemark, assignComplaintOfficer, subscribeToStore } from '../lib/storage';
import { INITIAL_OFFICERS } from '../data/officers';
import { Complaint, CaseStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { BureauBadge } from '../components/common/BureauBadge';
import { CaseTimeline } from '../components/complaints/CaseTimeline';
import { StatusUpdateModal } from '../components/complaints/StatusUpdateModal';
import { useRole } from '../lib/roleContext';

export const ComplaintDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, isAuditor } = useRole();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [newRemarkText, setNewRemarkText] = useState('');
  const [remarkError, setRemarkError] = useState('');

  const loadData = () => {
    const list = getComplaints();
    const target = list.find(c => c.id === id);
    setComplaint(target || null);
  };

  useEffect(() => {
    loadData();
    return subscribeToStore(loadData);
  }, [id]);

  if (!complaint) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">Complaint Record Not Found</h3>
        <p className="text-xs text-slate-500">
          The complaint ID "{id}" does not exist in the active registry.
        </p>
        <button
          onClick={() => navigate('/complaints')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
        >
          Return to Registry
        </button>
      </div>
    );
  }

  const handleAddRemarkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRemarkError('');

    if (isAuditor) {
      setRemarkError('Auditor role cannot add remarks.');
      return;
    }

    if (!newRemarkText.trim() || newRemarkText.trim().length < 6) {
      setRemarkError('Please enter a descriptive remark (minimum 6 characters).');
      return;
    }

    addComplaintRemark(
      complaint.id,
      currentUser.name,
      currentUser.designation || 'Case Review Officer',
      newRemarkText.trim()
    );

    setNewRemarkText('');
    setIsRemarkModalOpen(false);
    loadData();
  };

  // Calculate days remaining or overdue
  const dueDate = new Date(complaint.slaDueDate);
  const today = new Date('2026-10-28T00:00:00Z');
  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Previous View</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsStatusModalOpen(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            Update Case Status
          </button>
        </div>
      </div>

      {/* Case Overview Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xl font-extrabold text-blue-900">{complaint.id}</span>
              <BureauBadge bureau={complaint.bureau} showFullName />
              <StatusBadge status={complaint.currentStatus} size="md" />
              <PriorityBadge priority={complaint.priority} />
            </div>
            <h1 className="text-lg md:text-xl font-bold text-slate-900 mt-2 leading-snug">
              {complaint.subject}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
              <button
                onClick={() => navigate(`/institutions/${complaint.institutionId}`)}
                className="flex items-center gap-1.5 font-semibold text-blue-700 hover:underline"
              >
                <Building2 className="w-4 h-4 text-slate-400" />
                {complaint.institutionName} ({complaint.institutionId})
              </button>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Lodged: {complaint.submissionDate}
              </span>
              <span>•</span>
              <span>Complainant: <strong className="text-slate-700">{complaint.complainantType}</strong></span>
            </div>
          </div>

          {/* SLA Counter Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-right min-w-[180px]">
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Resolution SLA</div>
            <div className="text-sm font-bold text-slate-800 mt-0.5">
              Due Date: <span className="font-mono text-blue-700">{complaint.slaDueDate}</span>
            </div>
            <div className="mt-1">
              {diffDays < 0 ? (
                <span className="text-red-600 font-bold flex items-center justify-end gap-1">
                  <ClockAlert className="w-3.5 h-3.5" />
                  Overdue by {Math.abs(diffDays)} day(s)
                </span>
              ) : (
                <span className="text-emerald-700 font-semibold">
                  {diffDays} day(s) remaining
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Grievance Text */}
        <div className="pt-3 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Full Grievance Statement
          </div>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
            {complaint.description}
          </p>
        </div>
      </div>

      {/* Smart Add-ons Panel (Slide 2 & 6: AI Summary, Missing Info, Delay-Risk, Overlap link) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* AI Case Summary */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50/40 border border-purple-200/80 shadow-2xs space-y-2">
          <div className="flex items-center gap-1.5 text-purple-900 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-purple-600" />
            AI Executive Case Summary
          </div>
          <p className="text-xs text-purple-950 leading-relaxed">
            {complaint.aiSummary || 'Automated synthesis summarizing primary non-compliance grounds.'}
          </p>
          <div className="text-[10px] text-purple-600 font-medium pt-1">
            *AI generated preview for rapid administrative comprehension.
          </div>
        </div>

        {/* Missing-Info Detector */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 shadow-2xs space-y-2">
          <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Missing-Info & Evidence Checklist
          </div>
          <ul className="text-xs text-amber-950 space-y-1 list-disc pl-4">
            {complaint.missingInfoDetected && complaint.missingInfoDetected.length > 0 ? (
              complaint.missingInfoDetected.map((info, idx) => (
                <li key={idx}>{info}</li>
              ))
            ) : (
              <li>All statutory intake disclosures verified.</li>
            )}
          </ul>
        </div>

        {/* Delay Risk & Priority Recommendation */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 shadow-2xs space-y-2">
          <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs uppercase tracking-wider">
            <ClockAlert className="w-4 h-4 text-blue-600" />
            Delay-Risk & Priority Advisor
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">Calculated Delay Risk:</span>
            <span className="font-bold text-slate-900 font-mono text-sm">{complaint.delayRiskScore || 45}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                (complaint.delayRiskScore || 45) > 75 ? 'bg-rose-500' :
                (complaint.delayRiskScore || 45) > 50 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${complaint.delayRiskScore || 45}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-600 pt-1">
            Recommended Handling: <strong>{complaint.recommendedPriority || complaint.priority} Priority</strong>
          </div>
        </div>
      </div>

      {/* Case Timeline and History */}
      <CaseTimeline
        complaint={complaint}
        onOpenStatusModal={() => setIsStatusModalOpen(true)}
        onOpenAddRemarkModal={() => setIsRemarkModalOpen(true)}
      />

      {/* Attachments and Supporting Records */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-subtle space-y-3">
        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
          <Paperclip className="w-4 h-4 text-slate-400" />
          Supporting Evidentiary Attachments ({complaint.attachments?.length || 0})
        </h3>
        {complaint.attachments && complaint.attachments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {complaint.attachments.map((att, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-800">{att.name}</div>
                  <div className="text-[11px] text-slate-400">{att.size} • Attached {att.date}</div>
                </div>
                <button
                  onClick={() => alert(`Simulated document download for: ${att.name}`)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                  title="Download attachment"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-400 italic">No files attached to this complaint.</div>
        )}
      </div>

      {/* Status Update Modal */}
      <StatusUpdateModal
        complaint={complaint}
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onSuccess={loadData}
      />

      {/* Add Internal Remark Modal */}
      {isRemarkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">Add Internal Case Remark</h3>
            <p className="text-slate-500 text-xs">
              This note will be recorded into the official timestamped audit history under <strong>{currentUser.name}</strong>.
            </p>

            {remarkError && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
                {remarkError}
              </div>
            )}

            <textarea
              rows={4}
              placeholder="Enter official investigation notes, verification observations, or communications with institution..."
              value={newRemarkText}
              onChange={(e) => setNewRemarkText(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRemarkModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddRemarkSubmit}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
              >
                Record Remark
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
