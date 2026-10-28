import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  FileText,
  Sparkles,
  GitMerge,
  ClockAlert,
  Users2,
  BarChart3,
  Bell,
  UserCog,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Share2,
} from 'lucide-react';
import { getComplaints, getNotifications, getCoordinationRecords, getOverlapMatches, subscribeToStore } from '../../lib/storage';
import { useRole } from '../../lib/roleContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { currentRole, currentBureauFilter } = useRole();
  const [pendingOverlapsCount, setPendingOverlapsCount] = useState(0);
  const [breachedSlaCount, setBreachedSlaCount] = useState(0);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
  const [activeCoordsCount, setActiveCoordsCount] = useState(0);

  const refreshBadges = () => {
    const complaints = getComplaints();
    const overlaps = getOverlapMatches();
    const notifs = getNotifications();
    const coords = getCoordinationRecords();

    setPendingOverlapsCount(overlaps.filter(o => o.status === 'PENDING_REVIEW').length);
    setBreachedSlaCount(complaints.filter(c => c.slaStatus === 'SLA_BREACHED' || c.slaStatus === 'ESCALATED').length);
    setUnreadNotifsCount(notifs.filter(n => !n.read).length);
    setActiveCoordsCount(coords.filter(c => c.status !== 'Closed').length);
  };

  useEffect(() => {
    refreshBadges();
    return subscribeToStore(refreshBadges);
  }, []);

  const navItems = [
    {
      to: '/dashboard',
      icon: LayoutDashboard,
      label: 'Overview Dashboard',
      badge: null,
    },
    {
      to: '/institutions',
      icon: Building2,
      label: 'Institution Directory',
      badge: null,
    },
    {
      to: '/complaints',
      icon: FileText,
      label: 'Complaint Registry',
      badge: null,
    },
    {
      to: '/overlap-detection',
      icon: Sparkles,
      label: 'AI Overlap Detection',
      badge: pendingOverlapsCount > 0 ? { count: pendingOverlapsCount, color: 'bg-purple-100 text-purple-700' } : null,
      highlight: true,
    },
    {
      to: '/case-tracking',
      icon: GitMerge,
      label: 'Case Journey & Pipeline',
      badge: null,
    },
    {
      to: '/sla-monitoring',
      icon: ClockAlert,
      label: 'SLA & Escalations',
      badge: breachedSlaCount > 0 ? { count: breachedSlaCount, color: 'bg-rose-100 text-rose-700' } : null,
    },
    {
      to: '/coordination',
      icon: Users2,
      label: 'Bureau Coordination',
      badge: activeCoordsCount > 0 ? { count: activeCoordsCount, color: 'bg-blue-100 text-blue-700' } : null,
    },
    {
      to: '/case-graph',
      icon: Share2,
      label: 'Case Network Graph',
      badge: { count: 'Interactive', color: 'bg-teal-50 text-teal-700 font-medium text-[9px]' },
    },
    {
      to: '/reports',
      icon: BarChart3,
      label: 'Reports & Analytics',
      badge: null,
    },
    {
      to: '/notifications',
      icon: Bell,
      label: 'Notifications',
      badge: unreadNotifsCount > 0 ? { count: unreadNotifsCount, color: 'bg-amber-100 text-amber-700' } : null,
    },
    {
      to: '/users',
      icon: UserCog,
      label: 'User & Role Access',
      badge: null,
    },
    {
      to: '/settings',
      icon: Settings,
      label: 'Settings & Config',
      badge: null,
    },
  ];

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-40 bg-white border-r border-slate-200/90 flex flex-col transition-all duration-300 ease-in-out ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200/80 bg-slate-50/50">
        {!collapsed ? (
          <NavLink to="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-900 text-base tracking-tight truncate flex items-center gap-1.5">
                VERINEX AI
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 border border-blue-200">
                  AICTE
                </span>
              </div>
              <div className="text-[11px] text-slate-500 truncate font-medium">
                Coordination Intelligence
              </div>
            </div>
          </NavLink>
        ) : (
          <NavLink to="/dashboard" className="mx-auto">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </NavLink>
        )}

        <button
          onClick={onToggle}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ${
            collapsed ? 'hidden' : 'block'
          }`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Bureau Filter Quick Pill */}
      {!collapsed && (
        <div className="px-4 py-2.5 bg-blue-50/40 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Scope:</span>
          <span className="font-semibold text-blue-800 bg-white px-2 py-0.5 rounded border border-blue-200 shadow-2xs">
            {currentBureauFilter === 'ALL' ? 'All Bureaus (RB + PGRC)' : `${currentBureauFilter} Bureau Only`}
          </span>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              } ${item.highlight && !collapsed ? 'ring-1 ring-purple-200/80' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive
                      ? 'text-white'
                      : item.highlight
                      ? 'text-purple-600 group-hover:text-purple-700'
                      : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />

                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`px-1.5 py-0.5 text-xs rounded-full font-bold leading-none ${
                          isActive ? 'bg-white/20 text-white' : item.badge.color
                        }`}
                      >
                        {item.badge.count}
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapsed Toggle Button at Bottom */}
      {collapsed && (
        <div className="p-3 border-t border-slate-200">
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            title="Expand sidebar"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Role Footer */}
      {!collapsed && (
        <div className="p-3.5 border-t border-slate-200/90 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
              {currentRole.substring(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-800 truncate">
                Role: {currentRole.replace('_', ' ')}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                Govt. Demo Environment
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
