import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users2,
  CheckSquare,
  Square,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  Plus,
  Send,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { getCoordinationRecords, saveCoordinationRecords, getOverlapMatches, subscribeToStore } from '../lib/storage';
import { CoordinationRecord, OverlapMatch } from '../types';
import { BureauBadge } from '../components/common/BureauBadge';
import { useRole } from '../lib/roleContext';

export const BureauCoordinationPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isAuditor } = useRole();

  const [records, setRecords] = useState<CoordinationRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<CoordinationRecord | null>(null);
  const [newRemarkText, setNewRemarkText] = useState('');
  const [newActionText, setNewActionText] = useState('');

  const loadData = () => {
    const list = getCoordinationRecords();
    setRecords(list);
    if (!selectedRecord && list.length > 0) {
      setSelectedRecord(list[0]);
    } else if (selectedRecord) {
      const updated = list.find(r => r.id === selectedRecord.id);
      if (updated) setSelectedRecord(updated);
    }
  };

  useEffect(() => {
    loadData();
    return subscribeToStore(loadData);
  }, []);

  // Toggle Action item completed
  const handleToggleAction = (actionId: string) => {
    if (!selectedRecord || isAuditor) return;

    const updatedActions = selectedRecord.actionItems.map(item =>
      item.id === actionId ? { ...item, completed: !item.completed } : item
    );

    const updatedRecord: CoordinationRecord = {
      ...selectedRecord,
      actionItems: updatedActions,
      updatedAt: new Date().toISOString(),
    };

    const updatedList = records.map(r => r.id === selectedRecord.id ? updatedRecord : r);
    saveCoordinationRecords(updatedList);
    setSelectedRecord(updatedRecord);
  };

  // Add Action Item
  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord || !newActionText.trim() || isAuditor) return;

    const newItem = {
      id: `ACT-${Date.now()}`,
      text: newActionText.trim(),
      completed: false,
      assignedTo: currentUser.name,
    };

    const updatedRecord: CoordinationRecord = {
      ...selectedRecord,
      actionItems: [...selectedRecord.actionItems, newItem],
      updatedAt: new Date().toISOString(),
    };

    const updatedList = records.map(r => r.id === selectedRecord.id ? updatedRecord : r);
    saveCoordinationRecords(updatedList);
    setSelectedRecord(updatedRecord);
    setNewActionText('');
  };

  // Add Joint Remark
  const handleAddRemark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord || !newRemarkText.trim() || isAuditor) return;

    const newRemark = {
      id: `REM-${Date.now()}`,
      officer: currentUser.name,
      bureau: currentUser.bureau || selectedRecord.leadBureau,
      timestamp: new Date().toISOString(),
      message: newRemarkText.trim(),
    };

    const updatedRecord: CoordinationRecord = {
      ...selectedRecord,
      remarks: [...selectedRecord.remarks, newRemark],
      updatedAt: new Date().toISOString(),
    };

    const updatedList = records.map(r => r.id === selectedRecord.id ? updatedRecord : r);
    saveCoordinationRecords(updatedList);
    setSelectedRecord(updatedRecord);
    setNewRemarkText('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              <Users2 className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cross-Bureau Joint Inquest Workspace
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Bureau Coordination Workspace
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Collaborative inquiry desk harmonizing actions between Regulation Bureau (RB) and Public Grievance Redressal Cell (PGRC). Eliminates contradictory directives and pooled evidentiary review.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/overlap-detection')}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Find New Overlaps
          </button>
        </div>
      </div>

      {/* Main Coordination Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Coordination Records List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Active Joint Coordinations ({records.length})
          </div>

          <div className="space-y-2.5">
            {records.map(record => {
              const isSelected = selectedRecord?.id === record.id;
              const completedCount = record.actionItems.filter(a => a.completed).length;

              return (
                <div
                  key={record.id}
                  onClick={() => setSelectedRecord(record)}
                  className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/50 border-blue-500 ring-1 ring-blue-500 shadow-sm'
                      : 'bg-white border-slate-200/90 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-blue-900">{record.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {record.status}
                    </span>
                  </div>

                  <div className="font-bold text-slate-800 text-xs line-clamp-1">{record.title}</div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">{record.institutionName}</div>

                  <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-200/60 text-[10px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <BureauBadge bureau={record.leadBureau} />
                      <span>↔</span>
                      <BureauBadge bureau={record.collaboratingBureau} />
                    </div>
                    <span>{completedCount}/{record.actionItems.length} actions done</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Coordination Workspace Details (8 cols) */}
        <div className="lg:col-span-8">
          {selectedRecord ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-6 space-y-6 text-xs">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-extrabold text-blue-900">{selectedRecord.id}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      {selectedRecord.status}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-1">
                    {selectedRecord.title}
                  </h2>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Institution: <strong className="text-slate-800">{selectedRecord.institutionName}</strong> ({selectedRecord.institutionId})
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-right text-[11px] min-w-[200px]">
                  <div>Lead Bureau: <strong className="text-blue-900">{selectedRecord.leadBureau}</strong> ({selectedRecord.leadOfficer})</div>
                  <div>Partner Bureau: <strong className="text-indigo-900">{selectedRecord.collaboratingBureau}</strong> ({selectedRecord.collaboratingOfficer})</div>
                </div>
              </div>

              {/* Connected Grievance Badges */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-slate-700 text-xs">Linked Case Records:</span>
                <div className="flex items-center gap-2">
                  {selectedRecord.complaintIds.map(cid => (
                    <button
                      key={cid}
                      onClick={() => navigate(`/complaints/${cid}`)}
                      className="px-2.5 py-1 rounded bg-white border border-slate-300 font-mono font-bold text-blue-700 hover:bg-blue-50 transition-colors shadow-2xs"
                    >
                      {cid} →
                    </button>
                  ))}
                </div>
              </div>

              {/* Joint Action Items Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                    Joint Action Items Checklist ({selectedRecord.actionItems.filter(a => a.completed).length}/{selectedRecord.actionItems.length})
                  </h3>
                  <span className="text-[11px] text-slate-400">Click item to toggle completion status</span>
                </div>

                <div className="space-y-2">
                  {selectedRecord.actionItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleAction(item.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                        item.completed
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className={`text-xs ${item.completed ? 'line-through text-slate-400' : 'font-medium'}`}>
                          {item.text}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded">
                        {item.assignedTo}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Add Action Item Input */}
                {!isAuditor && (
                  <form onSubmit={handleAddAction} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add new collaborative action item..."
                      value={newActionText}
                      onChange={(e) => setNewActionText(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-2xs"
                    >
                      Add Action
                    </button>
                  </form>
                )}
              </div>

              {/* Discussion Remarks Feed */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  Inter-Bureau Discussion & Evidence Log
                </h3>

                <div className="space-y-2.5 max-h-56 overflow-y-auto">
                  {selectedRecord.remarks.map(rem => (
                    <div key={rem.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2">
                          <BureauBadge bureau={rem.bureau} />
                          <strong className="text-slate-800">{rem.officer}</strong>
                        </div>
                        <span className="text-slate-400 font-mono text-[10px]">
                          {new Date(rem.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-700 text-xs leading-relaxed pt-0.5">
                        {rem.message}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Add Remark Input */}
                {!isAuditor && (
                  <form onSubmit={handleAddRemark} className="flex gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Post coordination note, inspection findings, or agreed protocol..."
                      value={newRemarkText}
                      onChange={(e) => setNewRemarkText(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs shadow-2xs flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Post
                    </button>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              Select a coordination record from the left column to view joint proceedings.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
