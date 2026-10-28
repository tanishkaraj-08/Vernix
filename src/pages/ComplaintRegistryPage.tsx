import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Download,
  Plus,
  ArrowUpDown,
  Sparkles,
  Layers,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  ClockAlert
} from 'lucide-react';
import { getComplaints, subscribeToStore } from '../lib/storage';
import { Complaint, Bureau, CaseStatus, Priority } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { BureauBadge } from '../components/common/BureauBadge';
import { RegisterComplaintModal } from '../components/complaints/RegisterComplaintModal';
import { exportComplaintsToCSV } from '../lib/exportUtils';
import { useRole } from '../lib/roleContext';

export const ComplaintRegistryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentBureauFilter, canRegisterComplaint } = useRole();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [bureauFilter, setBureauFilter] = useState<string>(currentBureauFilter);
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [overlapOnly, setOverlapOnly] = useState<boolean>(false);

  // Sorting & Pagination
  const [sortField, setSortField] = useState<'submissionDate' | 'id' | 'priority' | 'slaDays'>('submissionDate');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const loadData = () => {
    setComplaints(getComplaints());
  };

  useEffect(() => {
    loadData();
    return subscribeToStore(loadData);
  }, []);

  useEffect(() => {
    if (currentBureauFilter !== 'ALL') {
      setBureauFilter(currentBureauFilter);
    }
  }, [currentBureauFilter]);

  const categories = [
    'ALL',
    'Laboratory & Infrastructure Deficiency',
    'Faculty Qualifications & Shortage',
    'Capitation Fee & Fee Overcharging',
    'Ragging & Student Harassment',
    'Admission Irregularities',
    'Unapproved Course Offering',
    'Examination & Evaluation Malpractice',
    'Delayed Scholarship Disbursement'
  ];

  // Filtering
  const filtered = complaints.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      c.id.toLowerCase().includes(q) ||
      c.subject.toLowerCase().includes(q) ||
      c.institutionName.toLowerCase().includes(q) ||
      c.institutionId.toLowerCase().includes(q) ||
      (c.assignedOfficerName && c.assignedOfficerName.toLowerCase().includes(q));

    const matchesBureau = bureauFilter === 'ALL' || c.bureau === bureauFilter;
    const matchesStatus = statusFilter === 'ALL' || c.currentStatus === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || c.category === categoryFilter;
    const matchesPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;
    const matchesOverlap = !overlapOnly || c.hasPotentialOverlap;

    return matchesSearch && matchesBureau && matchesStatus && matchesCategory && matchesPriority && matchesOverlap;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'submissionDate') {
      comparison = new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime();
    } else if (sortField === 'id') {
      comparison = a.id.localeCompare(b.id);
    } else if (sortField === 'priority') {
      const priorityOrder: Record<Priority, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
    } else if (sortField === 'slaDays') {
      comparison = a.daysOpen - b.daysOpen;
    }
    return sortAsc ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
  const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setBureauFilter('ALL');
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
    setPriorityFilter('ALL');
    setOverlapOnly(false);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              <FileText className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Central Grievance Repository
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            AICTE Complaint Registry
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Consolidated master register of complaints across Approval Bureau (RB) and Public Grievance Redressal Cell (PGRC), enriched with AI overlap markers and SLA tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportComplaintsToCSV(filtered)}
            className="px-3.5 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV ({filtered.length})
          </button>

          {canRegisterComplaint && (
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Register Complaint
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-subtle space-y-3 text-xs">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Complaint ID, institution, keywords, officer..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-8 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Bureau Filter */}
            <select
              value={bureauFilter}
              onChange={(e) => { setBureauFilter(e.target.value); setCurrentPage(1); }}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 text-xs font-medium"
            >
              <option value="ALL">All Bureaus</option>
              <option value="RB">RB (Approval Bureau)</option>
              <option value="PGRC">PGRC (Grievance Cell)</option>
              <option value="VIGILANCE">Vigilance Cell</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 text-xs font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Assigned">Assigned</option>
              <option value="Under Process">Under Process</option>
              <option value="Transferred">Transferred</option>
              <option value="Action Taken">Action Taken</option>
              <option value="Disposed">Disposed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 text-xs font-medium"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 text-xs max-w-[180px] truncate"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>
              ))}
            </select>

            {/* AI Overlap Toggle */}
            <button
              onClick={() => { setOverlapOnly(!overlapOnly); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                overlapOnly
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Overlap Flagged</span>
            </button>

            <button
              onClick={handleResetFilters}
              className="text-xs text-blue-600 hover:underline px-2 py-1 font-medium"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] text-slate-500 uppercase tracking-wider">
                <th
                  onClick={() => handleSort('id')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    <span>Complaint ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold">Institution Name & AICTE ID</th>
                <th className="py-3 px-4 font-semibold">Bureau</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th
                  onClick={() => handleSort('submissionDate')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    <span>Lodged</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold">Officer</th>
                <th className="py-3 px-4 font-semibold">Stage</th>
                <th
                  onClick={() => handleSort('priority')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    <span>Priority</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold">AI Overlap</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 text-xs">
                    No complaints match the specified search and filter criteria.
                  </td>
                </tr>
              ) : (
                paginated.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-900">{c.id}</td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <button
                        onClick={() => navigate(`/institutions/${c.institutionId}`)}
                        className="font-semibold text-slate-900 hover:text-blue-600 text-left truncate block max-w-[200px]"
                        title={c.institutionName}
                      >
                        {c.institutionName}
                      </button>
                      <span className="text-[10px] text-slate-400 font-mono">{c.institutionId}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <BureauBadge bureau={c.bureau} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-[160px] truncate" title={c.category}>
                      {c.category}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {c.submissionDate}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-[140px] truncate" title={c.assignedOfficerName}>
                      {c.assignedOfficerName || <span className="text-slate-400 italic">Unassigned</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={c.currentStatus} />
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="py-3.5 px-4">
                      {c.hasPotentialOverlap ? (
                        <button
                          onClick={() => navigate('/overlap-detection')}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
                          title="Click to view AI overlap matches"
                        >
                          <Sparkles className="w-3 h-3 text-purple-600" />
                          Overlap Flag
                        </button>
                      ) : (
                        <span className="text-slate-300 font-mono text-center block">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate(`/complaints/${c.id}`)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white rounded text-slate-700 font-medium transition-colors shadow-2xs"
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Showing <span className="font-semibold">{Math.min(sorted.length, (currentPage - 1) * itemsPerPage + 1)}</span> to{' '}
            <span className="font-semibold">{Math.min(sorted.length, currentPage * itemsPerPage)}</span> of{' '}
            <span className="font-semibold">{sorted.length}</span> complaints
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded text-xs font-semibold transition-colors ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Register Complaint Modal */}
      <RegisterComplaintModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};

