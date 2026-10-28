import { Officer, SystemUser } from '../types';

export const INITIAL_OFFICERS: Officer[] = [
  {
    id: 'OFF-RB-01',
    name: 'Sh. Rajesh Verma',
    designation: 'Director (Approval & Regulation Bureau)',
    bureau: 'RB',
    email: 'rajesh.verma@aicte-india.org',
    phone: '+91 11 2958 1020',
    activeCasesCount: 5,
  },
  {
    id: 'OFF-RB-02',
    name: 'Dr. Anita Roy',
    designation: 'Deputy Director (Inspection & Scrutiny)',
    bureau: 'RB',
    email: 'anita.roy@aicte-india.org',
    phone: '+91 11 2958 1045',
    activeCasesCount: 4,
  },
  {
    id: 'OFF-PG-01',
    name: 'Smt. Kavita Sharma',
    designation: 'Joint Director (Public Grievance Redressal Cell)',
    bureau: 'PGRC',
    email: 'kavita.sharma@aicte-india.org',
    phone: '+91 11 2958 1201',
    activeCasesCount: 5,
  },
  {
    id: 'OFF-PG-02',
    name: 'Sh. Amit Saxena',
    designation: 'Assistant Director (Student Grievance Cell)',
    bureau: 'PGRC',
    email: 'amit.saxena@aicte-india.org',
    phone: '+91 11 2958 1222',
    activeCasesCount: 4,
  },
  {
    id: 'OFF-SYS-01',
    name: 'Dr. K. S. Murthy',
    designation: 'Advisor & Central Grievance Ombudsman',
    bureau: 'VIGILANCE',
    email: 'advisor.grievance@aicte-india.org',
    phone: '+91 11 2958 1001',
    activeCasesCount: 2,
  }
];

export const DEMO_USERS: SystemUser[] = [
  {
    id: 'USER-ADMIN',
    name: 'Admin - Central Directorate',
    email: 'admin.directorate@aicte-india.org',
    role: 'ADMIN',
    designation: 'System Administrator (IT & Governance)',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces',
  },
  {
    id: 'USER-RB-HEAD',
    name: 'Sh. Rajesh Verma',
    email: 'rajesh.verma@aicte-india.org',
    role: 'BUREAU_HEAD',
    bureau: 'RB',
    designation: 'Director, Regulation & Approval Bureau',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
  },
  {
    id: 'USER-PGRC-HEAD',
    name: 'Smt. Kavita Sharma',
    email: 'kavita.sharma@aicte-india.org',
    role: 'BUREAU_HEAD',
    bureau: 'PGRC',
    designation: 'Joint Director, Grievance Redressal Cell',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces',
  },
  {
    id: 'USER-OFFICER-01',
    name: 'Dr. Anita Roy',
    email: 'anita.roy@aicte-india.org',
    role: 'CASE_OFFICER',
    bureau: 'RB',
    designation: 'Deputy Director, Scrutiny Officer',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=faces',
  },
  {
    id: 'USER-AUDITOR-01',
    name: 'Prof. S. N. Sen',
    email: 'sn.sen@audit-aicte.gov.in',
    role: 'AUDITOR',
    designation: 'Statutory Compliance Auditor',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
  }
];

