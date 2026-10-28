import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Building,
  UserCheck,
  ChevronDown,
  Calendar,
  Layers,
  X,
  ExternalLink,
  Shield,
  FileText,
  Building2,
  Check,
} from 'lucide-react';
import { useRole } from '../../lib/roleContext';
import { DEMO_USERS } from '../../data/officers';
import { getNotifications, saveNotifications, getComplaints, getInstitutions, subscribeToStore } from '../../lib/storage';
import { Notification, Bureau, UserRole } from '../../types';

interface TopbarProps {
  onMobileMenuToggle?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMobileMenuToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, currentRole, setRole, currentBureauFilter, setBureauFilter } = useRole();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showBureauDropdown, setShowBureauDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const searchRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const bureauRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const refreshNotifs = () => {
    setNotifications(getNotifications());
  };

  useEffect(() => {
    refreshNotifs();
    return subscribeToStore(refreshNotifs);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setShowRoleDropdown(false);
      }
      if (bureauRef.current && !bureauRef.current.contains(e.target as Node)) {
        setShowBureauDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute Search Results
  const complaints = getComplaints();
  const institutions = getInstitutions();

  const searchResults = searchQuery.trim().length > 1 ? {
    complaints: complaints.filter(c => 
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.institutionName.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 4),
    institutions: institutions.filter(i =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.city.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 3)
  } : null;

  // Breadcrumbs
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbMap: Record<string, string> = {
    dashboard: 'Dashboard',
    institutions: 'Institutions',
    complaints: 'Complaint Registry',
    'overlap-detection': 'AI Overlap Detection',
    'case-tracking': 'Case Journey',
    'sla-monitoring': 'SLA & Escalations',
    coordination: 'Bureau Coordination',
    'case-graph': 'Case Network Graph',
    reports: 'Reports & Analytics',
    notifications: 'Notifications',
    users: 'Role Management',
    settings: 'Settings',
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const currentDateFormatted = 'Wed, 28 Oct 2026';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200/90 h-16 px-4 md:px-6 flex items-center justify-between gap-4">
      {/* Left: Breadcrumbs & Page title */}
      <div className="flex items-center gap-3 min-w-0">
        <nav className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
          <Link to="/dashboard" className="hover:text-blue-600 transition-colors">
            AICTE
          </Link>
          {pathParts.map((part, index) => {
            const isLast = index === pathParts.length - 1;
            const label = breadcrumbMap[part] || part;
            return (
              <React.Fragment key={part}>
                <span className="text-slate-300">/</span>
                {isLast ? (
                  <span className="text-slate-900 font-semibold truncate max-w-[200px]">{label}</span>
                ) : (
                  <Link to={`/${part}`} className="hover:text-blue-600 transition-colors">
                    {label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-md relative" ref={searchRef}>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search complaint ID, institution, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
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

        {/* Global Search Results Dropdown */}
        {isSearchFocused && searchResults && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-premium p-3 z-50 text-xs">
            {searchResults.complaints.length === 0 && searchResults.institutions.length === 0 ? (
              <div className="py-4 text-center text-slate-400">
                No matching complaints or institutions found.
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.institutions.length > 0 && (
                  <div>
                    <div className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] mb-1.5 px-2">
                      Institutions
                    </div>
                    {searchResults.institutions.map(inst => (
                      <button
                        key={inst.id}
                        onClick={() => {
                          navigate(`/institutions/${inst.id}`);
                          setIsSearchFocused(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-blue-50/60 flex items-center justify-between group transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          <div>
                            <div className="font-semibold text-slate-800 group-hover:text-blue-700">{inst.name}</div>
                            <div className="text-[11px] text-slate-400">{inst.id} • {inst.city}, {inst.state}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {inst.totalComplaints} cases
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.complaints.length > 0 && (
                  <div>
                    <div className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] mb-1.5 px-2">
                      Complaints
                    </div>
                    {searchResults.complaints.map(c => (
                      <button
                        key={c.id}
                        onClick={() => {
                          navigate(`/complaints/${c.id}`);
                          setIsSearchFocused(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-blue-50/60 flex items-center justify-between group transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-500" />
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-800 group-hover:text-blue-700 flex items-center gap-1.5">
                              <span>{c.id}</span>
                              <span className="text-[10px] px-1 py-0.2 rounded bg-slate-100 text-slate-600">
                                {c.bureau}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 truncate max-w-xs">{c.subject}</div>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{c.currentStatus}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls: Bureau Scope, Date, Notifications, Role Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Bureau Context Selector */}
        <div className="relative" ref={bureauRef}>
          <button
            onClick={() => setShowBureauDropdown(!showBureauDropdown)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
            title="Filter by Bureau domain"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline">Bureau:</span>
            <span className="text-blue-700 font-bold">
              {currentBureauFilter === 'ALL' ? 'All Bureaus' : currentBureauFilter}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>

          {showBureauDropdown && (
            <div className="absolute right-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-premium p-1.5 z-50 text-xs">
              <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Bureau Scope
              </div>
              <button
                onClick={() => { setBureauFilter('ALL'); setShowBureauDropdown(false); }}
                className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between ${
                  currentBureauFilter === 'ALL' ? 'bg-blue-50 text-blue-800 font-bold' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span>All Bureaus (RB + PGRC)</span>
                {currentBureauFilter === 'ALL' && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </button>
              <button
                onClick={() => { setBureauFilter('RB'); setShowBureauDropdown(false); }}
                className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between ${
                  currentBureauFilter === 'RB' ? 'bg-blue-50 text-blue-800 font-bold' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <div className="font-semibold">RB (Approval Bureau)</div>
                  <div className="text-[10px] text-slate-400">Regulation, APH, Infrastructure</div>
                </div>
                {currentBureauFilter === 'RB' && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </button>
              <button
                onClick={() => { setBureauFilter('PGRC'); setShowBureauDropdown(false); }}
                className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between ${
                  currentBureauFilter === 'PGRC' ? 'bg-blue-50 text-blue-800 font-bold' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <div className="font-semibold">PGRC (Grievance Cell)</div>
                  <div className="text-[10px] text-slate-400">Student & Faculty Petitions</div>
                </div>
                {currentBureauFilter === 'PGRC' && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </button>
            </div>
          )}
        </div>

        {/* Date Display */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200/80 rounded-lg">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentDateFormatted}</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="Notifications & SLA alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-1.5 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-premium p-3 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="font-bold text-slate-800 text-sm">Notifications & Alerts</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-blue-600 hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {notifications.slice(0, 5).map(n => (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (n.actionUrl) navigate(n.actionUrl);
                      setShowNotifDropdown(false);
                    }}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      !n.read ? 'bg-blue-50/40 border-blue-100 hover:bg-blue-50/70' : 'bg-white border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-semibold text-slate-800">{n.title}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        n.level === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                        n.level === 'WARNING' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {n.level}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{n.message}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2 mt-2 border-t border-slate-100 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifDropdown(false)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  View All Notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Demo Role Switcher */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <div className="w-6 h-6 rounded-md bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              {currentUser.role.substring(0, 1)}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {currentUser.role.replace('_', ' ')}
              </div>
              <div className="text-[10px] text-slate-400 leading-tight">
                Demo Role Switcher
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-1.5 w-72 bg-white border border-slate-200 rounded-xl shadow-premium p-2 z-50 text-xs">
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5 mb-1.5">
                Switch Demo User Role
              </div>
              {DEMO_USERS.map(user => (
                <button
                  key={user.id}
                  onClick={() => {
                    setRole(user.role);
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg flex items-center justify-between mb-1 ${
                    user.role === currentRole ? 'bg-blue-50 text-blue-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-semibold flex items-center gap-1.5">
                      {user.role.replace('_', ' ')}
                      {user.bureau && (
                        <span className="px-1.5 py-0.2 text-[10px] rounded bg-slate-100 text-slate-600 font-mono">
                          {user.bureau}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500">{user.designation}</div>
                  </div>
                  {user.role === currentRole && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                </button>
              ))}
              <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 px-2 text-center">
                *Demo simulation: Role changes active permissions immediately.
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
