import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { OverlapMatch, CoordinationRecord, Bureau } from '../../types';
import { saveCoordinationRecords, getCoordinationRecords, saveOverlapDecision } from '../../lib/storage';
import { useRole } from '../../lib/roleContext';
import { INITIAL_OFFICERS } from '../../data/officers';
import { Users2, CheckSquare, Plus, AlertCircle } from 'lucide-react';

interface CreateCoordinationModalProps {
  match: OverlapMatch | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (coordId: string) => void;
}

export const CreateCoordinationModal: React.FC<CreateCoordinationModalProps> = ({
  match,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser, isAuditor } = useRole();

  if (!match) return null;

  const [title, setTitle] = useState(`Joint Coordination: ${match.complaint1.category} at ${match.institutionName}`);
  const [leadBureau, setLeadBureau] = useState<Bureau>(match.complaint1.bureau);
  const [collaboratingBureau, setCollaboratingBureau] = useState<Bureau>(match.complaint2.bureau);
  const [leadOfficer, setLeadOfficer] = useState(INITIAL_OFFICERS.find(o => o.bureau === match.complaint1.bureau)?.name || INITIAL_OFFICERS[0].name);
  const [collaboratingOfficer, setCollaboratingOfficer] = useState(INITIAL_OFFICERS.find(o => o.bureau === match.complaint2.bureau)?.name || INITIAL_OFFICERS[2].name);
  const [actionItem1, setActionItem1] = useState('Cross-reference submitted grievance records with AICTE institutional compliance dossier');
  const [actionItem2, setActionItem2] = useState('Convene joint online coordination hearing with regional directorate');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isAuditor) {
      setError('Auditor role cannot create coordination records.');
      return;
    }

    if (!title.trim()) {
      setError('Please provide a descriptive title for this coordination effort.');
      return;
    }

    const newCoordId = `COORD-2026-${Math.floor(800 + Math.random() * 199)}`;
    const now = new Date().toISOString();

    const newRecord: CoordinationRecord = {
      id: newCoordId,
      overlapId: match.id,
      title: title.trim(),
      institutionId: match.institutionId,
      institutionName: match.institutionName,
      leadBureau,
      collaboratingBureau,
      complaintIds: [match.complaint1Id, match.complaint2Id],
      leadOfficer,
      collaboratingOfficer,
      status: 'Initiated',
      createdAt: now,
      updatedAt: now,
      actionItems: [
        { id: 'ACT-1', text: actionItem1, completed: false, assignedTo: leadOfficer },
        { id: 'ACT-2', text: actionItem2, completed: false, assignedTo: collaboratingOfficer }
      ],
      remarks: [
        {
          id: `REM-${Date.now()}`,
          officer: currentUser.name,
          bureau: leadBureau,
          timestamp: now,
          message: `Coordination initiated from AI Overlap Alert (${match.matchScore}% match) to harmonize response between ${leadBureau} and ${collaboratingBureau}.`
        }
      ],
      resolutionOutcome: 'Active joint review established.'
    };

    const existing = getCoordinationRecords();
    saveCoordinationRecords([newRecord, ...existing]);

    // Update match status
    saveOverlapDecision(
      match.id,
      'COORDINATION_CREATED',
      `Coordination record ${newCoordId} initiated for joint bureau management.`,
      currentUser.name,
      newCoordId
    );

    if (onSuccess) onSuccess(newCoordId);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Cross-Bureau Coordination Workspace"
      subtitle={`Connecting Cases: ${match.complaint1Id} (${match.complaint1.bureau}) & ${match.complaint2Id} (${match.complaint2.bureau})`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="font-semibold text-slate-700">Coordination Title / Inquest Scope</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="space-y-1.5">
            <label className="font-semibold text-blue-900">Lead Bureau</label>
            <select
              value={leadBureau}
              onChange={(e) => setLeadBureau(e.target.value as Bureau)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800"
            >
              <option value="RB">RB (Regulation & Approval Bureau)</option>
              <option value="PGRC">PGRC (Public Grievance Redressal Cell)</option>
            </select>
            <div className="mt-1">
              <label className="text-[11px] text-slate-500 font-medium">Lead Officer</label>
              <select
                value={leadOfficer}
                onChange={(e) => setLeadOfficer(e.target.value)}
                className="w-full mt-0.5 px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800"
              >
                {INITIAL_OFFICERS.map(o => (
                  <option key={o.id} value={o.name}>{o.name} ({o.bureau})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-indigo-900">Collaborating Bureau</label>
            <select
              value={collaboratingBureau}
              onChange={(e) => setCollaboratingBureau(e.target.value as Bureau)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800"
            >
              <option value="PGRC">PGRC (Public Grievance Redressal Cell)</option>
              <option value="RB">RB (Regulation & Approval Bureau)</option>
            </select>
            <div className="mt-1">
              <label className="text-[11px] text-slate-500 font-medium">Collaborating Officer</label>
              <select
                value={collaboratingOfficer}
                onChange={(e) => setCollaboratingOfficer(e.target.value)}
                className="w-full mt-0.5 px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800"
              >
                {INITIAL_OFFICERS.map(o => (
                  <option key={o.id} value={o.name}>{o.name} ({o.bureau})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Action Items Initial Setup */}
        <div className="space-y-2">
          <label className="font-semibold text-slate-700 flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4 text-blue-600" />
            Initial Joint Action Items
          </label>
          <div className="space-y-2">
            <input
              type="text"
              value={actionItem1}
              onChange={(e) => setActionItem1(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800"
              placeholder="Action item 1"
            />
            <input
              type="text"
              value={actionItem2}
              onChange={(e) => setActionItem2(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800"
              placeholder="Action item 2"
            />
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
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
          >
            <Users2 className="w-4 h-4" />
            Establish Joint Bureau Case
          </button>
        </div>
      </form>
    </Modal>
  );
};
