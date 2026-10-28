import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  ClockAlert,
  Sparkles,
  Info,
  Check,
  Trash2,
  ExternalLink,
  Layers
} from 'lucide-react';
import { getNotifications, saveNotifications, subscribeToStore } from '../lib/storage';
import { Notification } from '../types';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filterLevel, setFilterLevel] = useState<string>('ALL');

  const loadData = () => {
    setNotifications(getNotifications());
  };

  useEffect(() => {
    loadData();
    return subscribeToStore(loadData);
  }, []);

  const handleMarkAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    saveNotifications(updated);
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const handleClearAll = () => {
    saveNotifications([]);
  };

  const filtered = notifications.filter(n => {
    if (filterLevel !== 'ALL' && n.level !== filterLevel) return false;
    return true;
  });

  const getIcon = (type: Notification['type'], level: Notification['level']) => {
    if (type === 'OVERLAP') return <Sparkles className="w-5 h-5 text-purple-600" />;
    if (type === 'SLA') return <ClockAlert className="w-5 h-5 text-red-600" />;
    if (level === 'CRITICAL') return <AlertTriangle className="w-5 h-5 text-red-600" />;
    return <Info className="w-5 h-5 text-blue-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              <Bell className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Alerts & Communications
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Notification & Escalation Center
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Real-time administrative feed alerting officers to AI-detected cross-bureau overlaps, statutory SLA deadlines, and joint coordination tasks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Check className="w-3.5 h-3.5 text-slate-500" />
            Mark All as Read
          </button>
          <button
            onClick={handleClearAll}
            className="px-3 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-semibold rounded-lg transition-colors"
          >
            Clear History
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={() => setFilterLevel('ALL')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            filterLevel === 'ALL' ? 'bg-blue-600 text-white shadow-2xs' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          All Alerts ({notifications.length})
        </button>
        <button
          onClick={() => setFilterLevel('CRITICAL')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            filterLevel === 'CRITICAL' ? 'bg-red-600 text-white shadow-2xs' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Critical Only ({notifications.filter(n => n.level === 'CRITICAL').length})
        </button>
        <button
          onClick={() => setFilterLevel('WARNING')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            filterLevel === 'WARNING' ? 'bg-amber-600 text-white shadow-2xs' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Warnings ({notifications.filter(n => n.level === 'WARNING').length})
        </button>
      </div>

      {/* Notifications Feed */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
            No notifications in this category.
          </div>
        ) : (
          filtered.map(n => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs transition-colors ${
                !n.read
                  ? 'bg-blue-50/40 border-blue-200 shadow-2xs'
                  : 'bg-white border-slate-200/90'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs shrink-0 mt-0.5">
                  {getIcon(n.type, n.level)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{n.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      n.level === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                      n.level === 'WARNING' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {n.level}
                    </span>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                    )}
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">
                    {new Date(n.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {!n.read && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    className="px-2.5 py-1 text-slate-600 hover:text-slate-900 font-medium"
                  >
                    Mark read
                  </button>
                )}
                {n.actionUrl && (
                  <button
                    onClick={() => {
                      handleMarkAsRead(n.id);
                      navigate(n.actionUrl!);
                    }}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-2xs flex items-center gap-1"
                  >
                    Take Action →
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
