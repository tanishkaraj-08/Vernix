import { Complaint, Institution, CoordinationRecord, Notification, OverlapMatch, CaseStatus, Priority, Bureau } from '../types';
import { INITIAL_INSTITUTIONS } from '../data/institutions';
import { INITIAL_COMPLAINTS } from '../data/complaints';
import { INITIAL_COORDINATION_RECORDS } from '../data/coordinationRecords';
import { INITIAL_NOTIFICATIONS } from '../data/notifications';
import { detectOverlapMatches } from './overlapEngine';

const STORAGE_KEYS = {
  INSTITUTIONS: 'verinex_aicte_institutions_v1',
  COMPLAINTS: 'verinex_aicte_complaints_v1',
  COORDINATIONS: 'verinex_aicte_coordinations_v1',
  NOTIFICATIONS: 'verinex_aicte_notifications_v1',
  SETTINGS: 'verinex_aicte_settings_v1',
  OVERLAP_DECISIONS: 'verinex_aicte_overlap_decisions_v1',
};

export interface SystemSettings {
  defaultSlaDays: number;
  urgentSlaDays: number;
  overlapThreshold: number;
  weightInstitution: number;
  weightCategory: number;
  weightText: number;
  weightBureau: number;
  autoFlagOverlaps: boolean;
  emailAlertsSimulated: boolean;
}

export const DEFAULT_SETTINGS: SystemSettings = {
  defaultSlaDays: 15,
  urgentSlaDays: 7,
  overlapThreshold: 60,
  weightInstitution: 40,
  weightCategory: 20,
  weightText: 30,
  weightBureau: 10,
  autoFlagOverlaps: true,
  emailAlertsSimulated: true,
};

// Listeners for multi-component reactivity
type ChangeListener = () => void;
const listeners = new Set<ChangeListener>();

export function subscribeToStore(listener: ChangeListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyStoreChange() {
  listeners.forEach(fn => fn());
}

export function getInstitutions(): Institution[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INSTITUTIONS);
    if (!raw) {
      saveInstitutions(INITIAL_INSTITUTIONS);
      return INITIAL_INSTITUTIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading institutions from localStorage', e);
    return INITIAL_INSTITUTIONS;
  }
}

export function saveInstitutions(institutions: Institution[]) {
  localStorage.setItem(STORAGE_KEYS.INSTITUTIONS, JSON.stringify(institutions));
  notifyStoreChange();
}

export function getComplaints(): Complaint[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
    if (!raw) {
      saveComplaints(INITIAL_COMPLAINTS);
      return INITIAL_COMPLAINTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading complaints from localStorage', e);
    return INITIAL_COMPLAINTS;
  }
}

export function saveComplaints(complaints: Complaint[]) {
  localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
  // Recalculate institution stats
  syncInstitutionStats(complaints);
  notifyStoreChange();
}

export function getCoordinationRecords(): CoordinationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COORDINATIONS);
    if (!raw) {
      saveCoordinationRecords(INITIAL_COORDINATION_RECORDS);
      return INITIAL_COORDINATION_RECORDS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading coordinations from localStorage', e);
    return INITIAL_COORDINATION_RECORDS;
  }
}

export function saveCoordinationRecords(records: CoordinationRecord[]) {
  localStorage.setItem(STORAGE_KEYS.COORDINATIONS, JSON.stringify(records));
  notifyStoreChange();
}

export function getNotifications(): Notification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) {
      saveNotifications(INITIAL_NOTIFICATIONS);
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading notifications from localStorage', e);
    return INITIAL_NOTIFICATIONS;
  }
}

export function saveNotifications(notifications: Notification[]) {
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  notifyStoreChange();
}

export function getSettings(): SystemSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: SystemSettings) {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  notifyStoreChange();
}

export function getOverlapMatches(): OverlapMatch[] {
  const complaints = getComplaints();
  const settings = getSettings();
  const rawDecisions = localStorage.getItem(STORAGE_KEYS.OVERLAP_DECISIONS);
  const decisionsMap = rawDecisions ? JSON.parse(rawDecisions) : {};

  const matches = detectOverlapMatches(complaints, settings.overlapThreshold);

  // Apply stored decisions if any
  return matches.map(m => {
    if (decisionsMap[m.id]) {
      return {
        ...m,
        status: decisionsMap[m.id].status,
        decisionReason: decisionsMap[m.id].decisionReason,
        decidedByOfficer: decisionsMap[m.id].decidedByOfficer,
        decidedAt: decisionsMap[m.id].decidedAt,
        coordinationRecordId: decisionsMap[m.id].coordinationRecordId,
      };
    }
    return m;
  });
}

export function saveOverlapDecision(
  matchId: string, 
  status: 'CONFIRMED_RELATED' | 'DISMISSED_FALSE_POSITIVE' | 'COORDINATION_CREATED',
  reason: string,
  officer: string,
  coordinationId?: string
) {
  const rawDecisions = localStorage.getItem(STORAGE_KEYS.OVERLAP_DECISIONS);
  const decisionsMap = rawDecisions ? JSON.parse(rawDecisions) : {};
  decisionsMap[matchId] = {
    status,
    decisionReason: reason,
    decidedByOfficer: officer,
    decidedAt: new Date().toISOString(),
    coordinationRecordId: coordinationId,
  };
  localStorage.setItem(STORAGE_KEYS.OVERLAP_DECISIONS, JSON.stringify(decisionsMap));
  notifyStoreChange();
}

// Add Complaint
export function addComplaint(complaintData: Omit<Complaint, 'id' | 'submissionDate' | 'timeline' | 'daysOpen' | 'slaDueDate' | 'slaStatus' | 'hasPotentialOverlap' | 'overlappingComplaintIds'>): Complaint {
  const complaints = getComplaints();
  const settings = getSettings();

  const count = complaints.length + 1;
  const newId = `${complaintData.bureau}-2026-${count + 100}`;
  const now = new Date();
  const submissionDate = now.toISOString().split('T')[0];

  const slaDays = complaintData.priority === 'CRITICAL' ? settings.urgentSlaDays : settings.defaultSlaDays;
  const dueDate = new Date(now.getTime() + slaDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const newComplaint: Complaint = {
    ...complaintData,
    id: newId,
    submissionDate,
    slaDays,
    slaDueDate: dueDate,
    slaStatus: 'WITHIN_SLA',
    daysOpen: 0,
    hasPotentialOverlap: false,
    overlappingComplaintIds: [],
    timeline: [
      {
        id: `TL-${newId}-1`,
        timestamp: now.toISOString(),
        status: 'Submitted',
        bureau: complaintData.bureau,
        officerName: 'Intake Desk',
        officerRole: 'System Dispatcher',
        remarks: 'Complaint registered and queued for initial administrative assessment.',
      }
    ]
  };

  const updatedComplaints = [newComplaint, ...complaints];
  saveComplaints(updatedComplaints);

  // Check if overlaps exist
  const potentialMatches = detectOverlapMatches(updatedComplaints, settings.overlapThreshold);
  const matchedWithThis = potentialMatches.filter(m => m.complaint1Id === newId || m.complaint2Id === newId);

  if (matchedWithThis.length > 0) {
    // Notify
    const notifs = getNotifications();
    const newNotif: Notification = {
      id: `NOTIF-${Date.now()}`,
      title: `Potential Overlap Detected for ${newId}`,
      message: `Case ${newId} matches ${matchedWithThis.length} existing grievance(s) for ${newComplaint.institutionName}.`,
      type: 'OVERLAP',
      level: 'WARNING',
      timestamp: now.toISOString(),
      read: false,
      relatedComplaintId: newId,
      relatedInstitutionId: newComplaint.institutionId,
      actionUrl: '/overlap-detection',
    };
    saveNotifications([newNotif, ...notifs]);
  }

  return newComplaint;
}

// Update Complaint Status
export function updateComplaintStatus(
  complaintId: string, 
  newStatus: CaseStatus, 
  officerName: string, 
  officerRole: string, 
  remarks: string,
  transferredToBureau?: Bureau
): Complaint | null {
  const complaints = getComplaints();
  const target = complaints.find(c => c.id === complaintId);
  if (!target) return null;

  const now = new Date();
  const timelineEntry = {
    id: `TL-${complaintId}-${target.timeline.length + 1}`,
    timestamp: now.toISOString(),
    status: newStatus,
    bureau: transferredToBureau || target.bureau,
    officerName,
    officerRole,
    remarks,
  };

  const updated: Complaint = {
    ...target,
    currentStatus: newStatus,
    bureau: transferredToBureau || target.bureau,
    slaStatus: newStatus === 'Disposed' ? 'WITHIN_SLA' : target.slaStatus,
    timeline: [...target.timeline, timelineEntry],
  };

  const updatedList = complaints.map(c => c.id === complaintId ? updated : c);
  saveComplaints(updatedList);

  // Add notification
  const notifs = getNotifications();
  const newNotif: Notification = {
    id: `NOTIF-${Date.now()}`,
    title: `Status Changed: ${complaintId} → ${newStatus}`,
    message: `Updated by ${officerName} (${officerRole}). Remarks: ${remarks}`,
    type: 'STATUS_CHANGE',
    level: newStatus === 'Disposed' ? 'INFO' : 'WARNING',
    timestamp: now.toISOString(),
    read: false,
    relatedComplaintId: complaintId,
    relatedInstitutionId: target.institutionId,
    actionUrl: `/complaints/${complaintId}`,
  };
  saveNotifications([newNotif, ...notifs]);

  return updated;
}

// Add Remark to Complaint
export function addComplaintRemark(complaintId: string, officerName: string, officerRole: string, remark: string) {
  const complaints = getComplaints();
  const target = complaints.find(c => c.id === complaintId);
  if (!target) return;

  const now = new Date();
  const timelineEntry = {
    id: `TL-${complaintId}-${target.timeline.length + 1}`,
    timestamp: now.toISOString(),
    status: target.currentStatus,
    bureau: target.bureau,
    officerName,
    officerRole,
    remarks: remark,
  };

  const updated: Complaint = {
    ...target,
    timeline: [...target.timeline, timelineEntry],
  };

  saveComplaints(complaints.map(c => c.id === complaintId ? updated : c));
}

// Assign Officer
export function assignComplaintOfficer(complaintId: string, officerId: string, officerName: string) {
  const complaints = getComplaints();
  const target = complaints.find(c => c.id === complaintId);
  if (!target) return;

  const now = new Date();
  const timelineEntry = {
    id: `TL-${complaintId}-${target.timeline.length + 1}`,
    timestamp: now.toISOString(),
    status: target.currentStatus === 'Submitted' ? 'Assigned' : target.currentStatus,
    bureau: target.bureau,
    officerName,
    officerRole: 'Case Scrutiny Officer',
    remarks: `Officer assigned: ${officerName}`,
  };

  const updated: Complaint = {
    ...target,
    assignedOfficerId: officerId,
    assignedOfficerName: officerName,
    currentStatus: target.currentStatus === 'Submitted' ? 'Assigned' : target.currentStatus,
    timeline: [...target.timeline, timelineEntry],
  };

  saveComplaints(complaints.map(c => c.id === complaintId ? updated : c));
}

// Sync Institution aggregates
function syncInstitutionStats(complaints: Complaint[]) {
  const institutions = getInstitutions();
  const updatedInstitutions = institutions.map(inst => {
    const instComplaints = complaints.filter(c => c.institutionId === inst.id);
    const totalComplaints = instComplaints.length;
    const openComplaints = instComplaints.filter(c => ['Submitted', 'Assigned', 'Under Process', 'Transferred'].includes(c.currentStatus)).length;
    const pendingComplaints = instComplaints.filter(c => ['Assigned', 'Under Process'].includes(c.currentStatus)).length;
    const disposedComplaints = instComplaints.filter(c => c.currentStatus === 'Disposed').length;
    const rbComplaintsCount = instComplaints.filter(c => c.bureau === 'RB').length;
    const pgrcComplaintsCount = instComplaints.filter(c => c.bureau === 'PGRC').length;
    const otherComplaintsCount = instComplaints.filter(c => !['RB', 'PGRC'].includes(c.bureau)).length;
    const slaBreachCount = instComplaints.filter(c => c.slaStatus === 'SLA_BREACHED' || c.slaStatus === 'ESCALATED').length;
    const activeOverlapCount = instComplaints.filter(c => c.hasPotentialOverlap && c.currentStatus !== 'Disposed').length;

    let riskRating: 'Low' | 'Moderate' | 'High' | 'Severe' = 'Low';
    if (slaBreachCount >= 2 || totalComplaints >= 5) riskRating = 'Severe';
    else if (activeOverlapCount >= 1 || slaBreachCount >= 1) riskRating = 'High';
    else if (totalComplaints >= 3) riskRating = 'Moderate';

    return {
      ...inst,
      totalComplaints,
      openComplaints,
      pendingComplaints,
      disposedComplaints,
      rbComplaintsCount,
      pgrcComplaintsCount,
      otherComplaintsCount,
      slaBreachCount,
      activeOverlapCount,
      riskRating,
    };
  });

  localStorage.setItem(STORAGE_KEYS.INSTITUTIONS, JSON.stringify(updatedInstitutions));
}

// Reset everything to factory demo data
export function resetFactoryDemoData() {
  localStorage.setItem(STORAGE_KEYS.INSTITUTIONS, JSON.stringify(INITIAL_INSTITUTIONS));
  localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(INITIAL_COMPLAINTS));
  localStorage.setItem(STORAGE_KEYS.COORDINATIONS, JSON.stringify(INITIAL_COORDINATION_RECORDS));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  localStorage.removeItem(STORAGE_KEYS.OVERLAP_DECISIONS);
  notifyStoreChange();
}

