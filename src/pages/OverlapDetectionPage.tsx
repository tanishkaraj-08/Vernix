import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  RefreshCw,
  Sliders,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  ArrowRight,
  ShieldCheck,
  FileText,
  Layers,
  Scale,
  Download,
  Info,
  Filter
} from 'lucide-react';
import { getOverlapMatches, getComplaints, saveOverlapDecision, subscribeToStore } from '../lib/storage';
import { detectOverlapMatches } from '../lib/overlapEngine';
import { OverlapMatch } from '../types';
import { BureauBadge } from '../components/common/BureauBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { SideBySideComparisonModal } from '../components/overlap/SideBySideComparisonModal';
import { CreateCoordinationModal } from '../components/overlap/CreateCoordinationModal';
import { exportOverlapsToCSV } from '../lib/exportUtils';
import { useRole } from '../lib/roleContext';

export const OverlapDetectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isAuditor } = useRole();

  const [matches, setMatches] = useState<OverlapMatch[]>([]);
  const [scenarioFilter, setScenarioFilter] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<OverlapMatch | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isCoordOpen, setIsCoordOpen] = useState(false);

  const loadData = () => {
    setMatches(getOverlapMatches());
  };

  useEffect(() => {
    loadData();
    return subscribeToStore(loadData);
  }, []);

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      loadData();
      setIsAnalyzing(false);
    }, 600);
  };

  // Filter matches
  const filteredMatches = matches.filter(m => {
    if (scenarioFilter !== 'ALL' && m.testScenario !== scenarioFilter) return false;
    if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
    return true;
  });

  const getScoreBadgeStyle = (score: number) => {
    if (score >= 85) return 'bg-purple-100 text-purple-800 border-purple-300';
    if (score >= 65) return 'bg-blue-100 text-blue-800 border-blue-300';
    return 'bg-amber-100 text-amber-800 border-amber-300';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-100 text-purple-700 border border-purple-200">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
              Core SIH 2026 Innovation
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            AI-Assisted Cross-Bureau Overlap Detection
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Identifies grievances across Regulation Bureau (RB) and Grievance Cell (PGRC) regarding the same institution and issue. Powered by transparent 4-factor explainable scoring with human verification safeguards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => exportOverlapsToCSV(filteredMatches)}
            className="px-3.5 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export Analysis (CSV)
          </button>

          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Running Matching Engine...' : 'Run Overlap Analysis'}</span>
          </button>
        </div>
      </div>

      {/* Slide 3 Mathematical Weighting Formula Card */}
      <div className="bg-gradient-to-r from-purple-50/70 via-indigo-50/50 to-blue-50/70 rounded-2xl border border-purple-200/80 p-5 shadow-subtle">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-purple-200/60">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-purple-700" />
            <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              AICTE Overlap Scoring Engine (Presentation Slide 3 Architecture)
            </span>
          </div>
          <span className="text-[11px] text-purple-700 font-mono font-medium">
            Score = Inst (40%) + Cat (20%) + Text (30%) + Bureau (10%)
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-xs">
          <div className="p-3 bg-white/90 rounded-xl border border-purple-100 shadow-2xs">
            <div className="font-bold text-blue-900">1. Institution ID Match (40%)</div>
            <p className="text-[11px] text-slate-600 mt-1">
              Exact Permanent ID match gives 40 pts. <em>Different institution is hard-capped below 40% (Rule 3.1)</em>.
            </p>
          </div>

          <div className="p-3 bg-white/90 rounded-xl border border-purple-100 shadow-2xs">
            <div className="font-bold text-purple-900">2. Grievance Category (20%)</div>
            <p className="text-[11px] text-slate-600 mt-1">
              Identical statutory grievance category gives 20 pts; related category group gives 10 pts.
            </p>
          </div>

          <div className="p-3 bg-white/90 rounded-xl border border-purple-100 shadow-2xs">
            <div className="font-bold text-indigo-900">3. Text Semantic Match (30%)</div>
            <p className="text-[11px] text-slate-600 mt-1">
              NLP token overlap and domain technical keyword Jaccard similarity scaled to 30 pts.
            </p>
          </div>

          <div className="p-3 bg-white/90 rounded-xl border border-purple-100 shadow-2xs">
            <div className="font-bold text-teal-900">4. Cross-Bureau Open (10%)</div>
            <p className="text-[11px] text-slate-600 mt-1">
              Both cases open in distinct bureaus (e.g., RB vs PGRC) awards full 10 pts for coordination priority.
            </p>
          </div>
        </div>

        <div className="mt-3 pt-2 text-[11px] text-slate-600 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Human-in-the-Loop Guarantee:</strong> The AI system flags potential overlaps for officer verification. Cases are never auto-merged or auto-closed without a signed administrative decision.
          </span>
        </div>
      </div>

      {/* Filter Tabs & Test Scenarios (Slide 6 Scenarios) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] mr-1">
            Test Scenarios (Slide 6):
          </span>

          <button
            onClick={() => setScenarioFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
              scenarioFilter === 'ALL'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            All Candidates ({matches.length})
          </button>

          <button
            onClick={() => setScenarioFilter('A')}
            className={`px-3 py-1.5 rounded-lg border font-semibold transition-colors flex items-center gap-1.5 ${
              scenarioFilter === 'A'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span>Scenario A: Related Lab Overlap (93%)</span>
          </button>

          <button
            onClick={() => setScenarioFilter('B')}
            className={`px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
              scenarioFilter === 'B'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span>Scenario B: Lab vs Water (Low match)</span>
          </button>

          <button
            onClick={() => setScenarioFilter('C')}
            className={`px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
              scenarioFilter === 'C'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span>Scenario C: Diff Institution (Capped &lt;40%)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 text-xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="CONFIRMED_RELATED">Confirmed Related</option>
            <option value="DISMISSED_FALSE_POSITIVE">Dismissed</option>
            <option value="COORDINATION_CREATED">Coordination Created</option>
          </select>
        </div>
      </div>

      {/* Matched Pairs List */}
      <div className="space-y-4">
        {filteredMatches.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
            No overlap match pairs match the selected criteria.
          </div>
        ) : (
          filteredMatches.map((m) => {
            const bd = m.scoreBreakdown;
            const c1 = m.complaint1;
            const c2 = m.complaint2;

            return (
              <div
                key={m.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-5 hover:border-purple-300 transition-all space-y-4"
              >
                {/* Header Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1.5 rounded-xl border text-center font-bold font-sans shadow-2xs ${getScoreBadgeStyle(m.matchScore)}`}>
                      <span className="text-lg">{m.matchScore}%</span>
                      <span className="text-[9px] uppercase tracking-wider block">Match</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/institutions/${m.institutionId}`)}
                          className="font-bold text-slate-900 text-sm hover:text-blue-700 flex items-center gap-1.5"
                        >
                          <Building2 className="w-4 h-4 text-blue-600" />
                          {m.institutionName}
                        </button>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          ID: {m.institutionId}
                        </span>
                        {m.testScenario && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                            Scenario {m.testScenario}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Action: <strong className="text-slate-700">{m.recommendedAction}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold border bg-slate-50 text-slate-700">
                      Status: <strong className="text-slate-900">{m.status.replace('_', ' ')}</strong>
                    </span>
                    <button
                      onClick={() => {
                        setSelectedMatch(m);
                        setIsCompareOpen(true);
                      }}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
                    >
                      View Comparison →
                    </button>
                  </div>
                </div>

                {/* Side by side mini summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Complaint 1 */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-blue-900 text-xs">{c1.id}</span>
                        <BureauBadge bureau={c1.bureau} />
                      </div>
                      <StatusBadge status={c1.currentStatus} />
                    </div>
                    <div className="font-semibold text-slate-800 line-clamp-1">{c1.subject}</div>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{c1.description}</p>
                    <div className="text-[10px] text-slate-400 pt-1">
                      Lodged: {c1.submissionDate} • Officer: {c1.assignedOfficerName || 'Unassigned'}
                    </div>
                  </div>

                  {/* Complaint 2 */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-indigo-900 text-xs">{c2.id}</span>
                        <BureauBadge bureau={c2.bureau} />
                      </div>
                      <StatusBadge status={c2.currentStatus} />
                    </div>
                    <div className="font-semibold text-slate-800 line-clamp-1">{c2.subject}</div>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{c2.description}</p>
                    <div className="text-[10px] text-slate-400 pt-1">
                      Lodged: {c2.submissionDate} • Officer: {c2.assignedOfficerName || 'Unassigned'}
                    </div>
                  </div>
                </div>

                {/* Score Breakdown Pills */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] pt-1">
                  <span className="font-semibold text-slate-500 uppercase text-[10px]">Formula Breakdown:</span>
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                    Inst ID: {bd.institutionScore}/40 pts
                  </span>
                  <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                    Category: {bd.categoryScore}/20 pts
                  </span>
                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                    Text NLP: {bd.textScore}/30 pts
                  </span>
                  <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 font-medium">
                    Cross-Bureau: {bd.bureauScore}/10 pts
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Comparison Modal */}
      <SideBySideComparisonModal
        match={selectedMatch}
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        onOpenCoordinationModal={(match) => {
          setSelectedMatch(match);
          setIsCoordOpen(true);
        }}
        onDecisionMade={loadData}
      />

      {/* Cross-Bureau Coordination Modal */}
      <CreateCoordinationModal
        match={selectedMatch}
        isOpen={isCoordOpen}
        onClose={() => setIsCoordOpen(false)}
        onSuccess={() => navigate('/coordination')}
      />
    </div>
  );
};
