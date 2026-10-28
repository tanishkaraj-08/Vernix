import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClockAlert,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Filter,
  Download,
  Building2,
  Calendar,
  Flame,
  BellRing
} from 'lucide-react';
import { getComplaints, updateComplaintStatus, saveNotifications, getNotifications, subscribeToStore } from '../lib/storage';
import { Complaint, SlaStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { BureauBadge } from '../components/common/BureauBadge';
import { StatCard } from '../components/common/StatCard';
import { useRole } from '../lib/roleContext';

export const SlaMonitoringPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentBureauFilter, currentUser } = useRole();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedBucket, setSelectedBucket] = useState<'ALL' | SlaStatus>('ALL');

  const loadData = () => {
    setComplaints(getComplaints());
  };

  useEffect(() => {
    loadData();
    return subscribeToStore(loadData);
  }, []);

  const filtered = complaints.filter(c => {
    if (currentBureauFilter !== 'ALL' && c.bureau !== currentBureauFilter) return false;
    if (selectedBucket !== 'ALL' && c.slaStatus !== selectedBucket) return false;
    return true;
  });

  const withinSlaCount = complaints.filter(c => c.slaStatus === 'WITHIN_SLA').length;
  const approachingCount = complaints.filter(c => c.slaStatus === 'APPROACHING_DEADLINE').length;
  const breachedCount = complaints.filter(c => c.slaStatus === 'SLA_BREACHED').length;
  const escalatedCount = complaints.filter(c => c.slaStatus === 'ESCALATED').length;

  const handleEscalateCase = (complaint: Complaint) => {
    updateComplaintStatus(
      complaint.id,
      'Under Process',
      currentUser.name,
      'Bureau Escalation Officer',
      `Formally escalated to Bureau Head & Regional Council due to SLA deadline threshold breach (${complaint.daysOpen} days open).`
    );

    // Add high priority alert
    const notifs = getNotifications();
    saveNotifications([
      {
        id: `NOTIF-${Date.now()}`,
        title: `CRITICAL ESCALATION: ${complaint.id}`,
        message: `${complaint.id} (${complaint.institutionName}) formally escalated to Bureau Directorate. Immediate compliance report required.`,
        type: 'SLA',
        level: 'CRITICAL',
        timestamp: new Date().toISOString(),
        read: false,
        relatedComplaintId: complaint.id,
        relatedInstitutionId: complaint.institutionId,
        actionUrl: `/complaints/${complaint.id}`
      },
      ...notifs
    ]);

    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200">
              <ClockAlert className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Statutory Turnaround Tracking
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            SLA Compliance & Escalation Console
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Monitors resolution due dates based on configured AICTE standard (15-20 days) and urgent (7 days) turnaround guidelines. Alerts officials prior to statutory breaches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
            Standard SLA: 15-20 Days • Urgent: 7 Days
          </span>
        </div>
      </div>

      {/* KPI Cards for SLA Buckets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Within SLA"
          value={withinSlaCount}
          subtitle="On schedule for resolution"
          icon={CheckCircle2}
          variant="emerald"
          onClick={() => setSelectedBucket('WITHIN_SLA')}
          badge="Healthy"
        />
        <StatCard
          title="Approaching Deadline"
          value={approachingCount}
          subtitle="Within 3 days of limit"
          icon={ClockAlert}
          variant="amber"
          onClick={() => setSelectedBucket('APPROACHING_DEADLINE')}
          badge="Action Due"
        />
        <StatCard
          title="SLA Breached"
          value={breachedCount}
          subtitle="Past statutory due date"
          icon={AlertTriangle}
          variant="red"
          onClick={() => setSelectedBucket('SLA_BREACHED')}
          badge="Overdue"
        />
        <StatCard
          title="Escalated to Council"
          value={escalatedCount}
          subtitle="Direct executive oversight"
          icon={Flame}
          variant="purple"
          onClick={() => setSelectedBucket('ESCALATED')}
          badge="Escalated"
        />
      </div>

      {/* Overdue & Breached Alert Strip */}
      {breachedCount > 0 && (
        <div className="p-4 rounded-xl bg-red-50/80 border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-600 text-white shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-red-950 text-sm">
                {breachedCount} Complaint(s) Exceeded Configured AICTE SLA
              </div>
              <p className="text-red-800 mt-0.5">
                Cases concerning cadre ratio violations, fire safety, or hostel water quality require immediate bureau escalation to avoid administrative lapses.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedBucket('SLA_BREACHED')}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shrink-0 transition-colors"
          >
            Filter Breached Cases
          </button>
        </div>
      )}

      {/* SLA Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              SLA Monitoring Registry ({filtered.length} Cases)
            </h3>
            <p className="text-xs text-slate-500">
              Showing cases filtered by SLA status: <strong>{selectedBucket}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedBucket}
              onChange={(e) => setSelectedBucket(e.target.value as any)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
            >
              <option value="ALL">All SLA Categories</option>
              <option value="SLA_BREACHED">SLA Breached Only</option>
              <option value="APPROACHING_DEADLINE">Approaching Deadline</option>
              <option value="ESCALATED">Escalated Cases</option>
              <option value="WITHIN_SLA">Within SLA</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Complaint ID</th>
                <th className="py-3 px-4 font-semibold">Institution Name</th>
                <th className="py-3 px-4 font-semibold">Bureau</th>
                <th className="py-3 px-4 font-semibold">Days Open</th>
                <th className="py-3 px-4 font-semibold">SLA Limit</th>
                <th className="py-3 px-4 font-semibold">Due Date</th>
                <th className="py-3 px-4 font-semibold">Compliance State</th>
                <th className="py-3 px-4 font-semibold">Assigned Officer</th>
                <th className="py-3 px-4 font-semibold text-right">Escalation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(c => {
                const isOverdue = c.slaStatus === 'SLA_BREACHED' || c.slaStatus === 'ESCALATED';

                return (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-900">{c.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 max-w-xs truncate">
                      {c.institutionName}
                    </td>
                    <td className="py-3.5 px-4">
                      <BureauBadge bureau={c.bureau} />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {c.daysOpen} days
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {c.slaDays} days
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {c.slaDueDate}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.slaStatus === 'SLA_BREACHED' ? 'bg-red-50 text-red-700 border border-red-200' :
                        c.slaStatus === 'APPROACHING_DEADLINE' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        c.slaStatus === 'ESCALATED' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {c.slaStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {c.assignedOfficerName || <span className="text-slate-400 italic">Unassigned</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isOverdue && c.slaStatus !== 'ESCALATED' && (
                          <button
                            onClick={() => handleEscalateCase(c)}
                            className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition-colors text-[11px]"
                          >
                            Escalate Now
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/complaints/${c.id}`)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white rounded text-slate-700 font-medium transition-colors"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

