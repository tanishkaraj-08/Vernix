import { Complaint, Institution, OverlapMatch } from '../types';

export function exportComplaintsToCSV(complaints: Complaint[], filename = 'AICTE_Complaints_Export.csv') {
  const headers = [
    'Complaint ID',
    'AICTE Permanent ID',
    'Institution Name',
    'Bureau',
    'Category',
    'Subject',
    'Complainant Type',
    'Submission Date',
    'Assigned Officer',
    'Current Status',
    'Priority',
    'SLA Due Date',
    'SLA Status',
    'Potential Overlap Flag'
  ];

  const rows = complaints.map(c => [
    `"${c.id}"`,
    `"${c.institutionId}"`,
    `"${c.institutionName.replace(/"/g, '""')}"`,
    `"${c.bureau}"`,
    `"${c.category}"`,
    `"${c.subject.replace(/"/g, '""')}"`,
    `"${c.complainantType}"`,
    `"${c.submissionDate}"`,
    `"${c.assignedOfficerName || 'Unassigned'}"`,
    `"${c.currentStatus}"`,
    `"${c.priority}"`,
    `"${c.slaDueDate}"`,
    `"${c.slaStatus}"`,
    `"${c.hasPotentialOverlap ? 'YES' : 'NO'}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportInstitutionsToCSV(institutions: Institution[], filename = 'AICTE_Institutions_Export.csv') {
  const headers = [
    'AICTE Permanent ID',
    'Institution Name',
    'Type',
    'State',
    'Region',
    'Approval Status',
    'Total Complaints',
    'Open Complaints',
    'Disposed Complaints',
    'RB Count',
    'PGRC Count',
    'SLA Breaches',
    'Active Overlaps',
    'Risk Rating'
  ];

  const rows = institutions.map(i => [
    `"${i.id}"`,
    `"${i.name.replace(/"/g, '""')}"`,
    `"${i.type}"`,
    `"${i.state}"`,
    `"${i.region}"`,
    `"${i.approvalStatus}"`,
    i.totalComplaints,
    i.openComplaints,
    i.disposedComplaints,
    i.rbComplaintsCount,
    i.pgrcComplaintsCount,
    i.slaBreachCount,
    i.activeOverlapCount,
    `"${i.riskRating}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportOverlapsToCSV(matches: OverlapMatch[], filename = 'AICTE_Overlap_Analysis_Report.csv') {
  const headers = [
    'Overlap ID',
    'Institution ID',
    'Institution Name',
    'Complaint 1 ID',
    'Complaint 1 Bureau',
    'Complaint 2 ID',
    'Complaint 2 Bureau',
    'Match Score (%)',
    'Status',
    'Institution Score (40)',
    'Category Score (20)',
    'Text Similarity (30)',
    'Cross-Bureau Active (10)',
    'Recommended Action'
  ];

  const rows = matches.map(m => [
    `"${m.id}"`,
    `"${m.institutionId}"`,
    `"${m.institutionName.replace(/"/g, '""')}"`,
    `"${m.complaint1Id}"`,
    `"${m.complaint1.bureau}"`,
    `"${m.complaint2Id}"`,
    `"${m.complaint2.bureau}"`,
    m.matchScore,
    `"${m.status}"`,
    m.scoreBreakdown.institutionScore,
    m.scoreBreakdown.categoryScore,
    m.scoreBreakdown.textScore,
    m.scoreBreakdown.bureauScore,
    `"${m.recommendedAction.replace(/"/g, '""')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
