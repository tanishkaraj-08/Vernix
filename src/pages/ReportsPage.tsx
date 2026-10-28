import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Filter,
  Building2,
  Layers,
  Calendar,
  CheckCircle2,
  ClockAlert,
  Sparkles,
  MapPin,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { getComplaints, getInstitutions, getOverlapMatches, subscribeToStore } from '../lib/storage';
import { exportComplaintsToCSV, exportInstitutionsToCSV, exportOverlapsToCSV } from '../lib/exportUtils';
import { Complaint, Institution, OverlapMatch, Bureau } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const ReportsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [overlaps, setOverlaps] = useState<OverlapMatch[]>([]);

  const [selectedReportType, setSelectedReportType] = useState<
    'BUREAU' | 'REGION' | 'CATEGORY' | 'SLA' | 'OVERLAP'
  >('BUREAU');

  const [bureauFilter, setBureauFilter] = useState<string>('ALL');
  const [regionFilter, setRegionFilter] = useState<string>('ALL');

  const loadData = () => {
    setComplaints(getComplaints());
    setInstitutions(getInstitutions());
    setOverlaps(getOverlapMatches());
  };

  useEffect(() => {
    loadData();
    return subscribeToStore(loadData);
  }, []);

  const filteredComplaints = complaints.filter(c => {
    if (bureauFilter !== 'ALL' && c.bureau !== bureauFilter) return false;
    return true;
  });

  // Category breakdown data
  const categoryMap = new Map<string, number>();
  filteredComplaints.forEach(c => {
    categoryMap.set(c.category, (categoryMap.get(c.category) || 0) + 1);
  });
  const categoryData = Array.from(categoryMap.entries()).map(([name, count]) => ({
    name: name.replace(' & ', '/'),
    count
  }));

  // Region breakdown data
  const regionMap = new Map<string, { total: number; open: number; disposed: number }>();
  institutions.forEach(i => {
    const prev = regionMap.get(i.region) || { total: 0, open: 0, disposed: 0 };
    regionMap.set(i.region, {
      total: prev.total + i.totalComplaints,
      open: prev.open + i.openComplaints,
      disposed: prev.disposed + i.disposedComplaints,
    });
  });
  const regionData = Array.from(regionMap.entries()).map(([region, stat]) => ({
    region,
    ...stat
  }));

  // Bureau breakdown data
  const bureauData = [
    {
      bureau: 'Regulation Bureau (RB)',
      total: complaints.filter(c => c.bureau === 'RB').length,
      open: complaints.filter(c => c.bureau === 'RB' && c.currentStatus !== 'Disposed').length,
      disposed: complaints.filter(c => c.bureau === 'RB' && c.currentStatus === 'Disposed').length,
      breached: complaints.filter(c => c.bureau === 'RB' && (c.slaStatus === 'SLA_BREACHED' || c.slaStatus === 'ESCALATED')).length,
    },
    {
      bureau: 'Grievance Cell (PGRC)',
      total: complaints.filter(c => c.bureau === 'PGRC').length,
      open: complaints.filter(c => c.bureau === 'PGRC' && c.currentStatus !== 'Disposed').length,
      disposed: complaints.filter(c => c.bureau === 'PGRC' && c.currentStatus === 'Disposed').length,
      breached: complaints.filter(c => c.bureau === 'PGRC' && (c.slaStatus === 'SLA_BREACHED' || c.slaStatus === 'ESCALATED')).length,
    }
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              <BarChart3 className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Governance Analytics & Exports
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Reports & Statutory Analytics
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Generate printable and downloadable analytical reports covering cross-bureau case volumes, regional distributions, SLA compliance indices, and AI overlap metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            Print Report
          </button>

          <button
            onClick={() => exportComplaintsToCSV(filteredComplaints, 'AICTE_Executive_Grievance_Report.csv')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export Filtered CSV
          </button>
        </div>
      </div>

      {/* Report Module Selector Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-subtle flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedReportType('BUREAU')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              selectedReportType === 'BUREAU'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Bureau-Wise Breakdown
          </button>
          <button
            onClick={() => setSelectedReportType('REGION')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              selectedReportType === 'REGION'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Regional Distribution
          </button>
          <button
            onClick={() => setSelectedReportType('CATEGORY')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              selectedReportType === 'CATEGORY'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Category Classification
          </button>
          <button
            onClick={() => setSelectedReportType('SLA')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              selectedReportType === 'SLA'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            SLA Compliance Report
          </button>
          <button
            onClick={() => setSelectedReportType('OVERLAP')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              selectedReportType === 'OVERLAP'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Overlap Intelligence Report
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Bureau:</span>
          <select
            value={bureauFilter}
            onChange={(e) => setBureauFilter(e.target.value)}
            className="px-2.5 py-1 border border-slate-300 rounded-lg bg-white text-slate-800 text-xs"
          >
            <option value="ALL">All Bureaus Combined</option>
            <option value="RB">RB Bureau Only</option>
            <option value="PGRC">PGRC Cell Only</option>
          </select>
        </div>
      </div>

      {/* Render Selected Report View */}
      {selectedReportType === 'BUREAU' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle">
            <h3 className="font-bold text-slate-900 text-sm mb-1">
              Cross-Bureau Workload, Resolution & Breach Statistics
            </h3>
            <p className="text-xs text-slate-500 mb-4">Comparison of Approval Bureau (RB) versus Public Grievance Redressal Cell (PGRC)</p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bureauData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="bureau" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="total" name="Total Intake" fill="#64748b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="open" name="Active / Open" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="disposed" name="Disposed" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="breached" name="SLA Breached" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden">
            <div className="p-4 border-b border-slate-100 font-bold text-slate-800 text-xs">
              Bureau Comparative Performance Table
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 uppercase">
                <tr>
                  <th className="py-3 px-4 font-semibold">Bureau / Domain</th>
                  <th className="py-3 px-4 font-semibold text-center">Total Inflow</th>
                  <th className="py-3 px-4 font-semibold text-center">Active Cases</th>
                  <th className="py-3 px-4 font-semibold text-center">Disposed Cases</th>
                  <th className="py-3 px-4 font-semibold text-center">SLA Breaches</th>
                  <th className="py-3 px-4 font-semibold text-right">Disposal Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bureauData.map(b => {
                  const rate = b.total > 0 ? Math.round((b.disposed / b.total) * 100) : 0;
                  return (
                    <tr key={b.bureau} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-800">{b.bureau}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">{b.total}</td>
                      <td className="py-3 px-4 text-center font-mono text-blue-700">{b.open}</td>
                      <td className="py-3 px-4 text-center font-mono text-emerald-700">{b.disposed}</td>
                      <td className="py-3 px-4 text-center font-mono text-red-600 font-bold">{b.breached}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">{rate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedReportType === 'REGION' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">
            AICTE Regional Distribution of Grievances
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="region" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="total" name="Total Complaints" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="open" name="Open Complaints" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedReportType === 'CATEGORY' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">
            Grievances Classified by Statutory Category
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Case Count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedReportType === 'SLA' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm">
            Statutory SLA Breach & Turnaround Audit Log
          </h3>
          <p className="text-slate-500">
            Exportable audit log listing all cases that have exceeded configured AICTE resolution deadlines.
          </p>
          <button
            onClick={() => exportComplaintsToCSV(complaints.filter(c => c.slaStatus === 'SLA_BREACHED' || c.slaStatus === 'ESCALATED'), 'AICTE_SLA_Breach_Audit.csv')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            Download SLA Overdue Records (CSV)
          </button>
        </div>
      )}

      {selectedReportType === 'OVERLAP' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm">
            AI Cross-Bureau Overlap Analysis Summary Dossier
          </h3>
          <p className="text-slate-500">
            Total Overlaps Detected: <strong>{overlaps.length}</strong> • Pending Human Verification: <strong>{overlaps.filter(o => o.status === 'PENDING_REVIEW').length}</strong>
          </p>
          <button
            onClick={() => exportOverlapsToCSV(overlaps, 'AICTE_AI_Overlap_Comprehensive_Dossier.csv')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            Download Overlap Match Report (CSV)
          </button>
        </div>
      )}
    </div>
  );
};

