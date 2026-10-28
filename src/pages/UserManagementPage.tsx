import React from 'react';
import {
  UserCog,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Building,
  Mail,
  Phone,
  Check,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { useRole } from '../lib/roleContext';
import { DEMO_USERS, INITIAL_OFFICERS } from '../data/officers';
import { UserRole } from '../types';

export const UserManagementPage: React.FC = () => {
  const { currentUser, currentRole, setRole } = useRole();

  const permissionsMatrix = [
    {
      feature: 'View Overview Dashboard & Analytics',
      admin: true,
      bureauHead: true,
      caseOfficer: true,
      auditor: true,
    },
    {
      feature: 'Inspect Institution & Complaint Records',
      admin: true,
      bureauHead: true,
      caseOfficer: true,
      auditor: true,
    },
    {
      feature: 'Run AI Overlap Detection Engine',
      admin: true,
      bureauHead: true,
      caseOfficer: true,
      auditor: true,
    },
    {
      feature: 'Update Case Stage & Record Remarks',
      admin: true,
      bureauHead: true,
      caseOfficer: true,
      auditor: false,
    },
    {
      feature: 'Confirm / Dismiss AI Overlap Matches',
      admin: true,
      bureauHead: true,
      caseOfficer: false,
      auditor: false,
    },
    {
      feature: 'Create Cross-Bureau Coordination Workspaces',
      admin: true,
      bureauHead: true,
      caseOfficer: true,
      auditor: false,
    },
    {
      feature: 'Manage SLA Thresholds & Overlap Weights',
      admin: true,
      bureauHead: false,
      caseOfficer: false,
      auditor: false,
    },
    {
      feature: 'Reset Demo Database to Factory Seeds',
      admin: true,
      bureauHead: false,
      caseOfficer: false,
      auditor: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              <UserCog className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Governance & Security Framework
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Role-Based Access Control & User Registry
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Multi-tiered role permissions ensuring separation of duties between System Administrators, Bureau Directors, Scrutiny Officers, and Statutory Compliance Auditors.
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs max-w-xs">
          <strong>Demo Sandbox Notice:</strong> Role switching simulates administrative personas for SIH live evaluation without requiring external SSO credentials.
        </div>
      </div>

      {/* Active Role Selector Cards */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
          Active Persona Selector (Click to switch identity)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {DEMO_USERS.map((user) => {
            const isSelected = user.role === currentRole;

            return (
              <div
                key={user.id}
                onClick={() => setRole(user.role)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-500/30 shadow-subtle'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                    {user.role.substring(0, 2)}
                  </div>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded-full border border-blue-200 shadow-2xs">
                      <Check className="w-3 h-3 text-blue-600" /> Active
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <div className="font-bold text-slate-900 text-xs">
                    {user.role.replace('_', ' ')}
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium">{user.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{user.designation}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Role Permissions & Statutory Access Matrix</h3>
            <p className="text-xs text-slate-500">Fine-grained capability distribution across government tiers</p>
          </div>
          <span className="text-xs text-slate-400">Current Role: <strong className="text-blue-700">{currentRole}</strong></span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] text-slate-500 uppercase">
                <th className="py-3 px-4 font-semibold">Functional Capability</th>
                <th className="py-3 px-4 font-semibold text-center">System Admin</th>
                <th className="py-3 px-4 font-semibold text-center">Bureau Head</th>
                <th className="py-3 px-4 font-semibold text-center">Case Officer</th>
                <th className="py-3 px-4 font-semibold text-center">Auditor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissionsMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-medium text-slate-800">{item.feature}</td>
                  <td className="py-3 px-4 text-center">
                    {item.admin ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.bureauHead ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.caseOfficer ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.auditor ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AICTE Officer Roster */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-5 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Designated Bureau Officers Directory</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
          {INITIAL_OFFICERS.map((officer) => (
            <div key={officer.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 flex items-start justify-between">
              <div className="space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span>{officer.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                    {officer.bureau}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 font-medium">{officer.designation}</div>
                <div className="text-[11px] text-slate-500 font-mono">{officer.email} • {officer.phone}</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 shrink-0">
                {officer.activeCasesCount} active cases
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
