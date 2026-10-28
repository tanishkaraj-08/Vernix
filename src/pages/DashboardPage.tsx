import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  ClockAlert,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  GitMerge,
  Layers,
  ArrowRight,
  Filter,
  Calendar,
  Building2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Inbox,
  Clock,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { BureauBadge } from '../components/common/BureauBadge';
import { SideBySideComparisonModal } from '../components/overlap/SideBySideComparisonModal';
import { CreateCoordinationModal } from '../components/overlap/CreateCoordinationModal';
import { RegisterComplaintModal } from '../components/complaints/RegisterComplaintModal';
import { getComplaints, getInstitutions, getOverlapMatches, getCoordinationRecords, subscribeToStore } from '../lib/storage';
import { useRole } from '../lib/roleContext';
import { Complaint, OverlapMatch, Bureau } from '../types';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentBureauFilter, setBureauFilter } = useRole();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [overlaps, setOverlaps] = useState<OverlapMatch[]>([]);
  const [dateRangeFilter, setDateRangeFilter] = useState<'30D' | '14D' | 'ALL'>('30D');
  const [selectedOverlapMatch, setSelectedOverlapMatch] = useState<OverlapMatch | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isCoordModalOpen, setIsCoordModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const loadAll = () => {
    setComplaints(getComplaints());
    setInstitutions(getInstitutions());
    setOverlaps(getOverlapMatches());
  };

  useEffect(() => {
    loadAll();
    return subscribeToStore(loadAll);
  }, []);

  // Filter complaints based on currentBureauFilter
  const filteredComplaints = complaints.filter(c => {
    if (currentBureauFilter !== 'ALL' && c.bureau !== currentBureauFilter) return false;
    return true;
  });

  // Calculate KPIs
  const totalComplaints = filteredComplaints.length;
  const pendingCases = filteredComplaints.filter(c => ['Submitted', 'Assigned', 'Under Process'].includes(c.currentStatus)).length;
  const underProcess = filteredComplaints.filter(c => c.currentStatus === 'Under Process').length;
  const transferredCases = filteredComplaints.filter(c => c.currentStatus === 'Transferred').length;
  const disposedCases = filteredComplaints.filter(c => c.currentStatus === 'Disposed').length;
  const slaBreachedCases = filteredComplaints.filter(c => c.slaStatus === 'SLA_BREACHED' || c.slaStatus === 'ESCALATED').length;
  const potentialOverlaps = overlaps.filter(o => o.status === 'PENDING_REVIEW').length;

  // Status Distribution Data for Donut Chart
  const statusData = [
    { name: 'Submitted', value: filteredComplaints.filter(c => c.currentStatus === 'Submitted').length, color: '#94a3b8' },
    { name: 'Assigned', value: filteredComplaints.filter(c => c.currentStatus === 'Assigned').length, color: '#3b82f6' },
    { name: 'Under Process', value: filteredComplaints.filter(c => c.currentStatus === 'Under Process').length, color: '#f59e0b' },
    { name: 'Transferred', value: filteredComplaints.filter(c => c.currentStatus === 'Transferred').length, color: '#a855f7' },
    { name: 'Action Taken', value: filteredComplaints.filter(c => c.currentStatus === 'Action Taken').length, color: '#0d9488' },
    { name: 'Disposed', value: filteredComplaints.filter(c => c.currentStatus === 'Disposed').length, color: '#10b981' },
  ].filter(d => d.value > 0);

  // Monthly Intake Trends
  const trendData = [
    { month: 'May 2026', received: 4, resolved: 3 },
    { month: 'Jun 2026', received: 6, resolved: 5 },
    { month: 'Jul 2026', received: 9, resolved: 7 },
    { month: 'Aug 2026', received: 11, resolved: 8 },
    { month: 'Sep 2026', received: 15, resolved: 12 },
    { month: 'Oct 2026', received: 18, resolved: 9 },
  ];

  // Bureau Workload Bar Chart Data
  const bureauData = [
    { name: 'Approval Bureau (RB)', active: complaints.filter(c => c.bureau === 'RB' && c.currentStatus !== 'Disposed').length, disposed: complaints.filter(c => c.bureau === 'RB' && c.currentStatus === 'Disposed').length },
    { name: 'Grievance Cell (PGRC)', active: complaints.filter(c => c.bureau === 'PGRC' && c.currentStatus !== 'Disposed').length, disposed: complaints.filter(c => c.bureau === 'PGRC' && c.currentStatus === 'Disposed').length },
    { name: 'Vigilance / Other', active: complaints.filter(c => !['RB', 'PGRC'].includes(c.bureau) && c.currentStatus !== 'Disposed').length, disposed: complaints.filter(c => !['RB', 'PGRC'].includes(c.bureau) && c.currentStatus === 'Disposed').length },
  ];

  // Ageing Buckets Data
  const ageingData = [
    { range: '0-7 Days', count: filteredComplaints.filter(c => c.daysOpen <= 7 && c.currentStatus !== 'Disposed').length, fill: '#3b82f6' },
    { range: '8-15 Days', count: filteredComplaints.filter(c => c.daysOpen > 7 && c.daysOpen <= 15 && c.currentStatus !== 'Disposed').length, fill: '#10b981' },
    { range: '16-30 Days', count: filteredComplaints.filter(c => c.daysOpen > 15 && c.daysOpen <= 30 && c.currentStatus !== 'Disposed').length, fill: '#f59e0b' },
    { range: '30+ Days', count: filteredComplaints.filter(c => c.daysOpen > 30 && c.currentStatus !== 'Disposed').length, fill: '#ef4444' },
  ];

  const handleOpenComparison = (match: OverlapMatch) => {
    setSelectedOverlapMatch(match);
    setIsCompareModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Executive Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
              National Intelligence Portal
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">SIH 2026 Reference Implementation</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            AICTE Case Coordination Intelligence System
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Unified complaint intelligence, cross-bureau coordination, and accountable grievance resolution across Regulation Bureau (RB) and Public Grievance Redressal Cell (PGRC).
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium border border-slate-200">
            <button
              onClick={() => setDateRangeFilter('14D')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                dateRangeFilter === '14D' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 14D
            </button>
            <button
              onClick={() => setDateRangeFilter('30D')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                dateRangeFilter === '30D' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 30D
            </button>
            <button
              onClick={() => setDateRangeFilter('ALL')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                dateRangeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Time
            </button>
          </div>

          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <span>+</span> Register Demo Complaint
          </button>
        </div>
      </div>

      {/* KPI Cards Row (7 Key Metrics from Requirement 5) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <StatCard
          title="Total Cases"
          value={totalComplaints}
          subtitle="Indexed cases"
          icon={FileText}
          variant="blue"
          onClick={() => navigate('/complaints')}
        />
        <StatCard
          title="Pending"
          value={pendingCases}
          subtitle="Awaiting action"
          icon={Inbox}
          variant="amber"
          onClick={() => navigate('/complaints?status=Pending')}
        />
        <StatCard
          title="Under Process"
          value={underProcess}
          subtitle="Inquiry ongoing"
          icon={Clock}
          variant="indigo"
          onClick={() => navigate('/complaints?status=Under%20Process')}
        />
        <StatCard
          title="Transferred"
          value={transferredCases}
          subtitle="Cross-bureau"
          icon={GitMerge}
          variant="purple"
          onClick={() => navigate('/complaints?status=Transferred')}
        />
        <StatCard
          title="Disposed"
          value={disposedCases}
          subtitle="Resolution verified"
          icon={CheckCircle2}
          variant="emerald"
          onClick={() => navigate('/complaints?status=Disposed')}
        />
        <StatCard
          title="SLA Breached"
          value={slaBreachedCases}
          subtitle="Exceeded deadline"
          icon={ClockAlert}
          variant="red"
          badge="Urgent"
          onClick={() => navigate('/sla-monitoring')}
        />
        <StatCard
          title="AI Overlaps"
          value={potentialOverlaps}
          subtitle="Require coordination"
          icon={Sparkles}
          variant="purple"
          badge="AI Flag"
          onClick={() => navigate('/overlap-detection')}
        />
      </div>

      {/* Prominent Callout Banner: "Potential Overlapping Cases — Coordination Required" */}
      {potentialOverlaps > 0 && (
        <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200/90 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-md shadow-purple-600/20 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Potential Overlapping Cases — Coordination Required
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-300">
                    {potentialOverlaps} Active Alert(s)
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Complaints filed under different AICTE bureaus concerning identical institutions (e.g., <strong>DITS Bengaluru</strong> & <strong>Apex Pune</strong>) share high semantic overlap. Human review is required to avoid duplicated inspections and conflicting orders.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {overlaps[0] && (
                <button
                  onClick={() => handleOpenComparison(overlaps[0])}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Review Top Match ({overlaps[0].matchScore}%)
                </button>
              )}
              <button
                onClick={() => navigate('/overlap-detection')}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-purple-200 text-purple-900 text-xs font-semibold rounded-lg transition-colors"
              >
                View All Matches →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visualizations Grid: Donut + Monthly Intake + Bureau Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart: Complaint Status Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Complaint Status Distribution</h3>
              <p className="text-[11px] text-slate-500">Live breakdown across stages</p>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-500">
              {filteredComplaints.length} Total
            </span>
          </div>

          <div className="h-60 w-full mt-2 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} cases`, name]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-slate-900">{totalComplaints}</span>
              <span className="text-[10px] text-slate-400 font-medium">CASES</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px]">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 truncate">{item.name}</span>
                <span className="font-bold text-slate-800 ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Line / Area Chart: Monthly Intake Trends */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle flex flex-col lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Complaint Intake vs Disposals Trend</h3>
              <p className="text-[11px] text-slate-500">6-Month historical intake and case closure trajectory</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-blue-700 font-medium">
                <span className="w-3 h-3 rounded bg-blue-500" /> Received
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <span className="w-3 h-3 rounded bg-emerald-500" /> Disposed
              </span>
            </div>
          </div>

          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="received" name="Received" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorReceived)" />
                <Area type="monotone" dataKey="resolved" name="Disposed" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Bureau-wise Workload Bar Chart + Case Ageing Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bureau-wise Workload */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Bureau-Wise Active vs Disposed Workload</h3>
              <p className="text-[11px] text-slate-500">Distribution between Approval Bureau (RB) and PGRC</p>
            </div>
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              Cross-Bureau
            </span>
          </div>

          <div className="h-60 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bureauData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="active" name="Active / Pending" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="disposed" name="Disposed / Closed" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Case Ageing Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Active Case Ageing Profile</h3>
              <p className="text-[11px] text-slate-500">Time elapsed since complaint intake date</p>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Standard SLA: 15-20 Days</span>
          </div>

          <div className="h-60 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Cases in Bucket" radius={[4, 4, 0, 0]}>
                  {ageingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Complaint Activity Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Recent Complaint Activity & Inflow</h3>
            <p className="text-xs text-slate-500">Latest grievances indexed into the coordination system</p>
          </div>
          <button
            onClick={() => navigate('/complaints')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Open Full Registry →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Complaint ID</th>
                <th className="py-3 px-4 font-semibold">Institution Name & AICTE ID</th>
                <th className="py-3 px-4 font-semibold">Bureau</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Current Stage</th>
                <th className="py-3 px-4 font-semibold">Priority</th>
                <th className="py-3 px-4 font-semibold">AI Overlap</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredComplaints.slice(0, 6).map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-blue-900">{c.id}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => navigate(`/institutions/${c.institutionId}`)}
                      className="font-medium text-slate-800 hover:text-blue-600 text-left"
                    >
                      {c.institutionName}
                    </button>
                    <div className="text-[10px] text-slate-400 font-mono">{c.institutionId}</div>
                  </td>
                  <td className="py-3 px-4">
                    <BureauBadge bureau={c.bureau} />
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={c.category}>
                    {c.category}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={c.currentStatus} />
                  </td>
                  <td className="py-3 px-4">
                    <PriorityBadge priority={c.priority} />
                  </td>
                  <td className="py-3 px-4">
                    {c.hasPotentialOverlap ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        <Sparkles className="w-3 h-3 text-purple-600" />
                        Flagged
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => navigate(`/complaints/${c.id}`)}
                      className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side-by-side comparison modal */}
      <SideBySideComparisonModal
        match={selectedOverlapMatch}
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        onOpenCoordinationModal={(match) => {
          setSelectedOverlapMatch(match);
          setIsCoordModalOpen(true);
        }}
        onDecisionMade={loadAll}
      />

      {/* Cross-bureau coordination creation modal */}
      <CreateCoordinationModal
        match={selectedOverlapMatch}
        isOpen={isCoordModalOpen}
        onClose={() => setIsCoordModalOpen(false)}
        onSuccess={(coordId) => {
          navigate('/coordination');
        }}
      />

      {/* Register Complaint Modal */}
      <RegisterComplaintModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={loadAll}
      />
    </div>
  );
};

