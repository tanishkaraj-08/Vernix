import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { OverlapMatch } from '../../types';
import { saveOverlapDecision } from '../../lib/storage';
import { useRole } from '../../lib/roleContext';
import { BureauBadge } from '../common/BureauBadge';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  Building2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Users2
} from 'lucide-react';

interface SideBySideComparisonModalProps {
  match: OverlapMatch | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenCoordinationModal?: (match: OverlapMatch) => void;
  onDecisionMade?: () => void;
}

export const SideBySideComparisonModal: React.FC<SideBySideComparisonModalProps> = ({
  match,
  isOpen,
  onClose,
  onOpenCoordinationModal,
  onDecisionMade,
}) => {
  const { currentUser, isAuditor } = useRole();

  if (!match) return null;

  const [dismissReason, setDismissReason] = useState('');
  const [showDismissInput, setShowDismissInput] = useState(false);
  const [error, setError] = useState('');

  const c1 = match.complaint1;
  const c2 = match.complaint2;
  const bd = match.scoreBreakdown;

  const handleConfirm = () => {
    if (isAuditor) {
      setError('Auditor role cannot modify overlap decisions.');
      return;
    }

    saveOverlapDecision(
      match.id,
      'CONFIRMED_RELATED',
      'Confirmed by case officer: underlying grievance concerns common laboratory equipment shortfall across bureaus.',
      currentUser.name
    );

    if (onDecisionMade) onDecisionMade();
    onClose();
  };

  const handleDismiss = () => {
    if (isAuditor) {
      setError('Auditor role cannot modify overlap decisions.');
      return;
    }

    if (!dismissReason.trim() || dismissReason.trim().length < 8) {
      setError('A mandatory reason is required to dismiss an AI overlap alert (to ensure administrative accountability).');
      return;
    }

    saveOverlapDecision(
      match.id,
      'DISMISSED_FALSE_POSITIVE',
      dismissReason.trim(),
      currentUser.name
    );

    if (onDecisionMade) onDecisionMade();
    onClose();
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-purple-700 bg-purple-50 border-purple-200';
    if (score >= 65) return 'text-blue-700 bg-blue-50 border-blue-200';
    return 'text-amber-700 bg-amber-50 border-amber-200';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Explainable AI Overlap Review & Decision Hub"
      subtitle={`Institution: ${match.institutionName} • AICTE ID: ${match.institutionId}`}
      maxWidth="5xl"
    >
      <div className="space-y-5 text-xs">
        {/* Banner with Match Score & Scenario */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center font-bold font-sans shadow-sm ${getScoreColor(match.matchScore)}`}>
              <span className="text-xl leading-none">{match.matchScore}%</span>
              <span className="text-[9px] uppercase tracking-wider mt-0.5">Overlap</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Cross-Bureau Overlap Candidate
                </span>
                {match.testScenario && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                    Test Scenario {match.testScenario}
                  </span>
                )}
              </div>
              <p className="text-slate-600 text-xs mt-0.5">
                Recommendation: <strong className="text-slate-800">{match.recommendedAction}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-white text-slate-700 shadow-2xs">
              Status: <span className="font-bold">{match.status.replace('_', ' ')}</span>
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Explainable Scoring Breakdown Cards (4 Pillars from Slide 3) */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>Explainable Scoring Formula (Slide 3 Model)</span>
            <span className="text-[11px] text-slate-500 font-normal">
              Score = Inst (40%) + Cat (20%) + Text (30%) + Bureau (10%)
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-500 uppercase">1. Institution Match</div>
              <div className="text-lg font-bold text-blue-700 mt-1">{bd.institutionScore} / 40 pts</div>
              <div className="text-[11px] text-slate-600 mt-1">
                {bd.institutionScore === 40 ? 'Matched ID' : 'Different (Capped <40%)'}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-500 uppercase">2. Category Match</div>
              <div className="text-lg font-bold text-purple-700 mt-1">{bd.categoryScore} / 20 pts</div>
              <div className="text-[11px] text-slate-600 mt-1 truncate" title={c1.category}>
                {c1.category === c2.category ? 'Identical' : 'Semantically Related'}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-500 uppercase">3. Text Similarity</div>
              <div className="text-lg font-bold text-indigo-700 mt-1">{bd.textScore} / 30 pts</div>
              <div className="text-[11px] text-slate-600 mt-1">
                {Math.round((bd.textScore / 30) * 100)}% keyword overlap
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-500 uppercase">4. Cross-Bureau Open</div>
              <div className="text-lg font-bold text-teal-700 mt-1">{bd.bureauScore} / 10 pts</div>
              <div className="text-[11px] text-slate-600 mt-1">
                {c1.bureau} vs {c2.bureau}
              </div>
            </div>
          </div>

          {/* Plain language explainability bullet points */}
          <div className="mt-3.5 pt-3 border-t border-slate-200/80 space-y-1">
            <div className="text-[11px] font-semibold text-slate-700">Audit Justification Notes:</div>
            <ul className="list-disc pl-5 space-y-0.5 text-slate-600 text-[11px]">
              {bd.explanationPoints.map((pt, idx) => (
                <li key={idx}>{pt}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Side-by-Side Dual Case View */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Complaint 1 */}
          <div className="p-4 rounded-xl bg-white border-2 border-blue-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-blue-900 font-mono">{c1.id}</span>
                <BureauBadge bureau={c1.bureau} />
              </div>
              <StatusBadge status={c1.currentStatus} />
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Grievance Category</div>
              <div className="font-semibold text-slate-800 text-xs">{c1.category}</div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Subject</div>
              <div className="font-bold text-slate-900 text-xs mt-0.5">{c1.subject}</div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Description Content</div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs leading-relaxed max-h-36 overflow-y-auto">
                {c1.description}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-slate-400">Complainant:</span> <strong className="text-slate-700">{c1.complainantType}</strong>
              </div>
              <div>
                <span className="text-slate-400">Lodged:</span> <span className="font-mono text-slate-700">{c1.submissionDate}</span>
              </div>
              <div>
                <span className="text-slate-400">Assigned Officer:</span> <span className="text-slate-700">{c1.assignedOfficerName || 'Unassigned'}</span>
              </div>
              <div>
                <span className="text-slate-400">Priority:</span> <PriorityBadge priority={c1.priority} />
              </div>
            </div>
          </div>

          {/* Complaint 2 */}
          <div className="p-4 rounded-xl bg-white border-2 border-indigo-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-indigo-900 font-mono">{c2.id}</span>
                <BureauBadge bureau={c2.bureau} />
              </div>
              <StatusBadge status={c2.currentStatus} />
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Grievance Category</div>
              <div className="font-semibold text-slate-800 text-xs">{c2.category}</div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Subject</div>
              <div className="font-bold text-slate-900 text-xs mt-0.5">{c2.subject}</div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Description Content</div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs leading-relaxed max-h-36 overflow-y-auto">
                {c2.description}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-slate-400">Complainant:</span> <strong className="text-slate-700">{c2.complainantType}</strong>
              </div>
              <div>
                <span className="text-slate-400">Lodged:</span> <span className="font-mono text-slate-700">{c2.submissionDate}</span>
              </div>
              <div>
                <span className="text-slate-400">Assigned Officer:</span> <span className="text-slate-700">{c2.assignedOfficerName || 'Unassigned'}</span>
              </div>
              <div>
                <span className="text-slate-400">Priority:</span> <PriorityBadge priority={c2.priority} />
              </div>
            </div>
          </div>
        </div>

        {/* Dismiss Input when selected */}
        {showDismissInput && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
            <label className="font-bold text-rose-900 text-xs">
              Mandatory Dismissal Justification Reason:
            </label>
            <input
              type="text"
              placeholder="e.g., Complaints concern distinct academic blocks/cadres verified on physical roster..."
              value={dismissReason}
              onChange={(e) => setDismissReason(e.target.value)}
              className="w-full px-3 py-2 border border-rose-300 rounded-lg bg-white text-slate-800 text-xs"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDismissInput(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="px-4 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 text-xs font-semibold"
              >
                Confirm Dismissal
              </button>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Human-in-the-loop: Changes recorded under <strong>{currentUser.name}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close
            </button>

            {!showDismissInput && match.status !== 'DISMISSED_FALSE_POSITIVE' && (
              <button
                type="button"
                onClick={() => setShowDismissInput(true)}
                className="px-3 py-2 border border-rose-200 text-rose-700 rounded-lg hover:bg-rose-50 transition-colors font-medium flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                Dismiss as False Positive
              </button>
            )}

            {match.status !== 'CONFIRMED_RELATED' && match.status !== 'COORDINATION_CREATED' && (
              <button
                type="button"
                onClick={handleConfirm}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm Related Cases
              </button>
            )}

            {onOpenCoordinationModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCoordinationModal(match);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Users2 className="w-4 h-4" />
                Create Cross-Bureau Coordination Record
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

