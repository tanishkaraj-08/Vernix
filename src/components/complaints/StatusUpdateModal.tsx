import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Complaint, CaseStatus, Bureau } from '../../types';
import { updateComplaintStatus } from '../../lib/storage';
import { useRole } from '../../lib/roleContext';
import { INITIAL_OFFICERS } from '../../data/officers';
import { AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';

interface StatusUpdateModalProps {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  complaint,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser, isAuditor } = useRole();

  if (!complaint) return null;

  const [newStatus, setNewStatus] = useState<CaseStatus>(complaint.currentStatus);
  const [remarks, setRemarks] = useState('');
  const [selectedOfficer, setSelectedOfficer] = useState(complaint.assignedOfficerName || INITIAL_OFFICERS[0].name);
  const [transferredBureau, setTransferredBureau] = useState<Bureau>(complaint.bureau === 'RB' ? 'PGRC' : 'RB');
  const [error, setError] = useState('');

  const statusOptions: CaseStatus[] = [
    'Submitted',
    'Assigned',
    'Under Process',
    'Transferred',
    'Action Taken',
    'Disposed'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isAuditor) {
      setError('Read-Only Auditor role does not have authorization to modify case records.');
      return;
    }

    if (!remarks.trim() || remarks.trim().length < 8) {
      setError('A mandatory official remark is required (minimum 8 characters) to record in the audit trail.');
      return;
    }

    if (newStatus === complaint.currentStatus && !transferredBureau) {
      setError('Please select a new status or change assigned parameters.');
      return;
    }

    updateComplaintStatus(
      complaint.id,
      newStatus,
      currentUser.name || selectedOfficer,
      currentUser.designation || 'Case Scrutiny Officer',
      remarks.trim(),
      newStatus === 'Transferred' ? transferredBureau : undefined
    );

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Case Status — ${complaint.id}`}
      subtitle={`Institution: ${complaint.institutionName}`}
      maxWidth="lg"
    >
      {isAuditor ? (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            Audit Mode Active
          </div>
          <p>
            Your current role is set to <strong>Read-Only Auditor</strong>. In accordance with AICTE compliance protocol, auditors are restricted from mutating case status or remarks.
          </p>
          <p className="text-[11px] text-amber-700">
            Switch your role to <em>Bureau Head</em> or <em>Case Officer</em> in the top-right role selector to perform this action.
          </p>
          <div className="pt-2 text-right">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[11px] text-slate-500">Current Status:</div>
            <div className="text-sm font-bold text-slate-800">{complaint.currentStatus} ({complaint.bureau})</div>
            <div className="text-[11px] text-slate-500 truncate">{complaint.subject}</div>
          </div>

          {/* New Status Select */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">
              New Case Stage <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {statusOptions.map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setNewStatus(st)}
                  className={`p-2 rounded-lg border text-left font-medium transition-colors ${
                    newStatus === st
                      ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold ring-1 ring-blue-500'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* If Transferred */}
          {newStatus === 'Transferred' && (
            <div className="space-y-1.5 p-3 rounded-lg bg-purple-50/60 border border-purple-200">
              <label className="font-semibold text-purple-900">
                Transfer To Bureau / Cell <span className="text-rose-500">*</span>
              </label>
              <select
                value={transferredBureau}
                onChange={(e) => setTransferredBureau(e.target.value as Bureau)}
                className="w-full px-3 py-2 border border-purple-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-purple-200"
              >
                <option value="RB">RB (Approval & Regulation Bureau)</option>
                <option value="PGRC">PGRC (Public Grievance Redressal Cell)</option>
                <option value="VIGILANCE">VIGILANCE (Chief Vigilance Cell)</option>
              </select>
              <div className="text-[10px] text-purple-700">
                Cross-bureau transfer retains complete prior audit history and notifies receiving bureau desk.
              </div>
            </div>
          )}

          {/* Officer Assignment */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Responsible Officer</label>
            <select
              value={selectedOfficer}
              onChange={(e) => setSelectedOfficer(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800"
            >
              {INITIAL_OFFICERS.map((off) => (
                <option key={off.id} value={off.name}>
                  {off.name} — {off.designation}
                </option>
              ))}
            </select>
          </div>

          {/* Mandatory Remarks */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">
              Official Justification / Internal Remarks <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="State the factual ground or evidentiary rationale for this status transition (required by AICTE procedural audit)..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-blue-100"
            />
            <div className="text-[10px] text-slate-400">
              *Mandatory requirement: Status changes without recorded administrative reasons are blocked.
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm"
            >
              Commit Transition & Record Audit
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

