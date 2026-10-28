import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  ArrowLeft,
  MapPin,
  Mail,
  Phone,
  User,
  ShieldCheck,
  Sparkles,
  ClockAlert,
  FileText,
  Layers,
  Share2,
  Plus,
  ExternalLink,
  Download,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { getInstitutions, getComplaints, getOverlapMatches, subscribeToStore } from '../lib/storage';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { BureauBadge } from '../components/common/BureauBadge';
import { StatCard } from '../components/common/StatCard';
import { CaseRelationshipGraph } from '../components/network/CaseRelationshipGraph';
import { SideBySideComparisonModal } from '../components/overlap/SideBySideComparisonModal';
import { CreateCoordinationModal } from '../components/overlap/CreateCoordinationModal';
import { RegisterComplaintModal } from '../components/complaints/RegisterComplaintModal';
import { exportComplaintsToCSV } from '../lib/exportUtils';
import { Complaint, OverlapMatch, Institution } from '../types';

export const InstitutionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [institution, setInstitution] = useState<Institution | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [overlaps, setOverlaps] = useState<OverlapMatch[]>([]);
  const [activeTab, setActiveTab] = useState<'complaints' | 'overlaps' | 'graph' | 'compliance'>('complaints');
  const [selectedOverlap, setSelectedOverlap] = useState<OverlapMatch | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isCoordModalOpen, setIsCoordModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const loadData = () => {
    const insts = getInstitutions();
    const currentInst = insts.find(i => i.id === id);
    setInstitution(currentInst || null);

    const allComplaints = getComplaints();
    setComplaints(allComplaints.filter(c => c.institutionId === id));

    const allOverlaps = getOverlapMatches();
    setOverlaps(allOverlaps.filter(o => o.institutionId === id));
  };

  useEffect(() => {
    loadData();
    return subscribeToStore(loadData);
  }, [id]);

  if (!institution) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">Institution Not Found</h3>
        <p className="text-xs text-slate-500">
          The requested AICTE Permanent ID "{id}" could not be located in the local database.
        </p>
        <button
          onClick={() => navigate('/institutions')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/institutions')}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Institutions Directory</span>
        </button>
      </div>

      {/* Main Institution Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {institution.name}
                </h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200 font-mono">
                  {institution.id}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {institution.approvalStatus}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {institution.address}, {institution.city}, {institution.state} - {institution.pinCode}
                </span>
                <span>•</span>
                <span>{institution.type}</span>
                <span>•</span>
                <span className="font-semibold text-blue-700">{institution.region} Regional Office</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start">
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Register Complaint
            </button>
            <button
              onClick={() => exportComplaintsToCSV(complaints, `${institution.code}_Complaints_Dossier.csv`)}
              className="px-3.5 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              title="Download dossier"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export Dossier
            </button>
          </div>
        </div>

        {/* Contact Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            <span>Principal: <strong className="text-slate-800">{institution.principalName}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-400" />
            <span>Email: <span className="font-mono text-slate-800">{institution.contactEmail}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-slate-400" />
            <span>Phone: <span className="font-mono text-slate-800">{institution.contactPhone}</span></span>
          </div>
        </div>
      </div>

      {/* KPI Metrics Row for this institution */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="Total Complaints"
          value={complaints.length}
          subtitle="All bureaus"
          icon={FileText}
          variant="blue"
        />
        <StatCard
          title="Open Cases"
          value={complaints.filter(c => c.currentStatus !== 'Disposed').length}
          subtitle="Under inquiry"
          icon={ClockAlert}
          variant="amber"
        />
        <StatCard
          title="RB Bureau"
          value={complaints.filter(c => c.bureau === 'RB').length}
          subtitle="Approval & Reg"
          icon={Layers}
          variant="blue"
        />
        <StatCard
          title="PGRC Cell"
          value={complaints.filter(c => c.bureau === 'PGRC').length}
          subtitle="Student & Staff"
          icon={User}
          variant="indigo"
        />
        <StatCard
          title="SLA Breached"
          value={complaints.filter(c => c.slaStatus === 'SLA_BREACHED' || c.slaStatus === 'ESCALATED').length}
          subtitle="Overdue action"
          icon={ClockAlert}
          variant="red"
        />
        <StatCard
          title="Active Overlaps"
          value={overlaps.filter(o => o.status === 'PENDING_REVIEW').length}
          subtitle="AI flagged"
          icon={Sparkles}
          variant="purple"
        />
      </div>

      {/* Cross-Bureau Overlap Alert Callout (if active) */}
      {overlaps.filter(o => o.status === 'PENDING_REVIEW').length > 0 && (
        <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-600 text-white shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-purple-950 text-sm">
                Cross-Bureau Overlap Detected for {institution.name}
              </div>
              <p className="text-purple-800 mt-0.5">
                Multiple grievances filed under Approval Bureau (RB) and Grievance Redressal (PGRC) exhibit high text and category concordance.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedOverlap(overlaps[0]);
              setIsCompareModalOpen(true);
            }}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shrink-0 transition-colors"
          >
            Review Overlap Match →
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 flex items-center gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('complaints')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'complaints'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Unified Complaint Registry ({complaints.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('overlaps')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'overlaps'
              ? 'border-purple-600 text-purple-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Overlap Intelligence ({overlaps.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('graph')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'graph'
              ? 'border-teal-600 text-teal-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Case Relationship Graph</span>
        </button>
      </div>

      {/* Tab 1: Complaints Table */}
      {activeTab === 'complaints' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Complaint ID</th>
                  <th className="py-3 px-4 font-semibold">Bureau</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Subject / Headline</th>
                  <th className="py-3 px-4 font-semibold">Submission Date</th>
                  <th className="py-3 px-4 font-semibold">Current Stage</th>
                  <th className="py-3 px-4 font-semibold">Priority</th>
                  <th className="py-3 px-4 font-semibold">SLA Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      No complaints registered for this institution.
                    </td>
                  </tr>
                ) : (
                  complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-900">{c.id}</td>
                      <td className="py-3 px-4">
                        <BureauBadge bureau={c.bureau} />
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-xs truncate" title={c.category}>
                        {c.category}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 max-w-sm truncate" title={c.subject}>
                        {c.subject}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{c.submissionDate}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={c.currentStatus} />
                      </td>
                      <td className="py-3 px-4">
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.slaStatus === 'SLA_BREACHED' ? 'bg-red-50 text-red-700 border border-red-200' :
                          c.slaStatus === 'APPROACHING_DEADLINE' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          c.slaStatus === 'ESCALATED' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {c.slaStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => navigate(`/complaints/${c.id}`)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white rounded text-slate-700 font-medium transition-colors"
                        >
                          Details →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Overlap Matches */}
      {activeTab === 'overlaps' && (
        <div className="space-y-4">
          {overlaps.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
              No cross-bureau overlap candidates currently flagged for this institution.
            </div>
          ) : (
            overlaps.map(o => (
              <div
                key={o.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex flex-col items-center justify-center font-bold">
                    <span className="text-base">{o.matchScore}%</span>
                    <span className="text-[8px] uppercase">Match</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 font-mono text-sm">{o.complaint1Id}</span>
                      <span className="text-slate-400">↔</span>
                      <span className="font-bold text-slate-800 font-mono text-sm">{o.complaint2Id}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                        {o.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1">
                      {o.recommendedAction}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedOverlap(o);
                      setIsCompareModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Compare Side-by-Side
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Graph */}
      {activeTab === 'graph' && (
        <CaseRelationshipGraph selectedInstitutionId={institution.id} />
      )}

      {/* Modals */}
      <SideBySideComparisonModal
        match={selectedOverlap}
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        onOpenCoordinationModal={(match) => {
          setSelectedOverlap(match);
          setIsCoordModalOpen(true);
        }}
        onDecisionMade={loadData}
      />

      <CreateCoordinationModal
        match={selectedOverlap}
        isOpen={isCoordModalOpen}
        onClose={() => setIsCoordModalOpen(false)}
        onSuccess={() => navigate('/coordination')}
      />

      <RegisterComplaintModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={loadData}
        preselectedInstitutionId={institution.id}
      />
    </div>
  );
};
