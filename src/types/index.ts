export type Bureau = 'RB' | 'PGRC' | 'VIGILANCE' | 'SKILL_DEV';

export type CaseStatus = 
  | 'Submitted' 
  | 'Assigned' 
  | 'Under Process' 
  | 'Transferred' 
  | 'Action Taken' 
  | 'Disposed';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SlaStatus = 'WITHIN_SLA' | 'APPROACHING_DEADLINE' | 'SLA_BREACHED' | 'ESCALATED';

export type UserRole = 'ADMIN' | 'BUREAU_HEAD' | 'CASE_OFFICER' | 'AUDITOR';

export type OverlapDecision = 'PENDING_REVIEW' | 'CONFIRMED_RELATED' | 'DISMISSED_FALSE_POSITIVE' | 'COORDINATION_CREATED';

export interface TimelineEntry {
  id: string;
  timestamp: string;
  status: CaseStatus;
  bureau: Bureau;
  officerName: string;
  officerRole: string;
  remarks: string;
  actionTaken?: string;
  supportingDocument?: string;
}

export interface Complaint {
  id: string; // e.g., 'RB-2026-101'
  institutionId: string; // e.g., '1-10928371'
  institutionName: string;
  bureau: Bureau;
  category: 
    | 'Laboratory & Infrastructure Deficiency'
    | 'Faculty Qualifications & Shortage'
    | 'Capitation Fee & Fee Overcharging'
    | 'Ragging & Student Harassment'
    | 'Admission Irregularities'
    | 'Unapproved Course Offering'
    | 'Examination & Evaluation Malpractice'
    | 'Delayed Scholarship Disbursement';
  subject: string;
  description: string;
  complainantType: 'Student' | 'Faculty' | 'Parent' | 'Anonymous Whistleblower' | 'Institutional Staff';
  submissionDate: string; // ISO date '2026-10-10'
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  currentStatus: CaseStatus;
  priority: Priority;
  slaDays: number;
  slaDueDate: string; // ISO date
  slaStatus: SlaStatus;
  daysOpen: number;
  timeline: TimelineEntry[];
  hasPotentialOverlap: boolean;
  overlappingComplaintIds: string[];
  coordinationId?: string;
  // Smart Add-on fields from slide 2
  aiSummary?: string;
  missingInfoDetected?: string[];
  delayRiskScore?: number; // 0-100%
  recommendedPriority?: Priority;
  attachments?: { name: string; size: string; date: string }[];
}

export interface Institution {
  id: string; // AICTE Permanent ID (e.g., '1-438912901')
  name: string;
  shortName: string;
  code: string;
  type: 'University Department' | 'Government Engineering College' | 'Private Unaided' | 'Autonomous Institute' | 'Polytechnic';
  address: string;
  city: string;
  district: string;
  state: string;
  region: 'Northern' | 'Southern' | 'Western' | 'Eastern' | 'Central' | 'North-Western' | 'South-Western';
  pinCode: string;
  contactEmail: string;
  contactPhone: string;
  principalName: string;
  approvalStatus: 'Approved (2026-27)' | 'Conditional Approval' | 'Under Show-Cause Notice';
  totalComplaints: number;
  openComplaints: number;
  pendingComplaints: number;
  disposedComplaints: number;
  rbComplaintsCount: number;
  pgrcComplaintsCount: number;
  otherComplaintsCount: number;
  slaBreachCount: number;
  activeOverlapCount: number;
  riskRating: 'Low' | 'Moderate' | 'High' | 'Severe';
}

export interface OverlapScoreBreakdown {
  institutionScore: number; // Max 40
  categoryScore: number;    // Max 20
  textScore: number;        // Max 30
  bureauScore: number;      // Max 10
  totalScore: number;       // 0 - 100
  isDifferentInstitutionCapped: boolean;
  explanationPoints: string[];
}

export interface OverlapMatch {
  id: string; // e.g. 'OVL-2026-01'
  complaint1Id: string;
  complaint2Id: string;
  complaint1: Complaint;
  complaint2: Complaint;
  institutionId: string;
  institutionName: string;
  matchScore: number; // 0-100%
  scoreBreakdown: OverlapScoreBreakdown;
  detectedAt: string;
  status: OverlapDecision;
  decisionReason?: string;
  decidedByOfficer?: string;
  decidedAt?: string;
  coordinationRecordId?: string;
  recommendedAction: string;
  testScenario?: 'A' | 'B' | 'C'; // Slide 6 scenario label
}

export interface CoordinationRecord {
  id: string; // e.g. 'COORD-2026-801'
  overlapId: string;
  title: string;
  institutionId: string;
  institutionName: string;
  leadBureau: Bureau;
  collaboratingBureau: Bureau;
  complaintIds: string[];
  leadOfficer: string;
  collaboratingOfficer: string;
  status: 'Initiated' | 'Joint Inspection Scheduled' | 'Evidence Shared' | 'Harmonized Response Drafted' | 'Closed';
  createdAt: string;
  updatedAt: string;
  meetingDate?: string;
  actionItems: { id: string; text: string; completed: boolean; assignedTo: string }[];
  remarks: { id: string; officer: string; bureau: Bureau; timestamp: string; message: string }[];
  resolutionOutcome?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'OVERLAP' | 'SLA' | 'STATUS_CHANGE' | 'COORDINATION' | 'SYSTEM';
  level: 'INFO' | 'WARNING' | 'CRITICAL';
  timestamp: string;
  read: boolean;
  relatedComplaintId?: string;
  relatedInstitutionId?: string;
  actionUrl?: string;
}

export interface Officer {
  id: string;
  name: string;
  designation: string;
  bureau: Bureau;
  email: string;
  phone: string;
  activeCasesCount: number;
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  bureau?: Bureau;
  designation: string;
  avatarUrl?: string;
}

