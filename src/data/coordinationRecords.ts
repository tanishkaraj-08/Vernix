import { CoordinationRecord } from '../types';

export const INITIAL_COORDINATION_RECORDS: CoordinationRecord[] = [
  {
    id: 'COORD-2026-801',
    overlapId: 'OVL-RB-2026-101-PGRC-2026-201',
    title: 'Joint Verification: Lab & DSP Equipment Shortage at DITS Bengaluru',
    institutionId: '1-109283711',
    institutionName: 'Demo Institute of Technology & Science',
    leadBureau: 'RB',
    collaboratingBureau: 'PGRC',
    complaintIds: ['RB-2026-101', 'PGRC-2026-201'],
    leadOfficer: 'Sh. Rajesh Verma (Director, RB)',
    collaboratingOfficer: 'Smt. Kavita Sharma (Joint Director, PGRC)',
    status: 'Joint Inspection Scheduled',
    createdAt: '2026-10-21T14:30:00Z',
    updatedAt: '2026-10-26T16:00:00Z',
    meetingDate: '2026-11-03T11:00:00Z',
    actionItems: [
      { id: 'ACT-1', text: 'Obtain consolidated equipment inventory from DITS Bengaluru', completed: true, assignedTo: 'RB Scrutiny Cell' },
      { id: 'ACT-2', text: 'Schedule surprise joint physical inspection with Southern Regional Office', completed: true, assignedTo: 'Joint Team' },
      { id: 'ACT-3', text: 'Verify student batch logs for semester 5 & 7 VLSI lab experiments', completed: false, assignedTo: 'PGRC Inspection Officer' },
      { id: 'ACT-4', text: 'Issue harmonized single directive avoiding conflicting bureau notices', completed: false, assignedTo: 'Lead Officer' }
    ],
    remarks: [
      {
        id: 'REM-1',
        officer: 'Sh. Rajesh Verma',
        bureau: 'RB',
        timestamp: '2026-10-21T15:00:00Z',
        message: 'Coordination record created after high confidence overlap (93%) detected between faculty petition and student complaint. Agreed to pool evidence.'
      },
      {
        id: 'REM-2',
        officer: 'Smt. Kavita Sharma',
        bureau: 'PGRC',
        timestamp: '2026-10-24T10:15:00Z',
        message: 'Student statements gathered by PGRC will be appended to the RB statutory show-cause notice to prevent duplicative hearings.'
      }
    ],
    resolutionOutcome: 'Joint physical inspection scheduled for 3rd Nov 2026. Standstill order on individual bureau notices.'
  },
  {
    id: 'COORD-2026-802',
    overlapId: 'OVL-RB-2026-102-PGRC-2026-2026',
    title: 'Cross-Bureau Inquest: Biometric Cadre Ratio & Ghost Faculty at Apex Pune',
    institutionId: '1-209481722',
    institutionName: 'Apex Engineering College & Polytechnic',
    leadBureau: 'RB',
    collaboratingBureau: 'PGRC',
    complaintIds: ['RB-2026-102', 'PGRC-2026-202'],
    leadOfficer: 'Sh. Rajesh Verma (Director, RB)',
    collaboratingOfficer: 'Smt. Kavita Sharma (Joint Director, PGRC)',
    status: 'Evidence Shared',
    createdAt: '2026-10-18T11:00:00Z',
    updatedAt: '2026-10-25T14:00:00Z',
    actionItems: [
      { id: 'ACT-201', text: 'Cross-reference AICTE mandatory disclosure faculty with university approved teacher list', completed: true, assignedTo: 'Dr. Anita Roy' },
      { id: 'ACT-202', text: 'Subpoena IT returns and bank credit statements for 14 contested faculty members', completed: false, assignedTo: 'Vigilance & RB Cell' },
      { id: 'ACT-203', text: 'Conduct confidential online deposition of student class representatives', completed: true, assignedTo: 'PGRC Officer' }
    ],
    remarks: [
      {
        id: 'REM-201',
        officer: 'Smt. Kavita Sharma',
        bureau: 'PGRC',
        timestamp: '2026-10-18T12:00:00Z',
        message: 'Confirmed overlap: students complained of absent professors while whistleblower disclosed ghost payroll entries.'
      }
    ]
  }
];

