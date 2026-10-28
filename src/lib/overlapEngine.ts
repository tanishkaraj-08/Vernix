import { Complaint, OverlapScoreBreakdown, OverlapMatch } from '../types';

// Stop words for token filtering
const STOP_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'of', 'with', 'by', 'from',
  'that', 'this', 'it', 'as', 'are', 'was', 'were', 'be', 'been', 'or', 'their', 'has', 'have',
  'had', 'having', 'do', 'does', 'did', 'about', 'against', 'between', 'into', 'through', 'during',
  'before', 'after', 'above', 'below', 'under', 'again', 'further', 'then', 'once', 'here', 'there',
  'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other',
  'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can',
  'will', 'just', 'should', 'now', 'complaint', 'regarding', 'issue', 'reported', 'grievance', 'matter'
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

// Calculate Jaccard + token overlap similarity
export function calculateTextSimilarity(text1: string, text2: string): number {
  const tokens1 = tokenize(text1);
  const tokens2 = tokenize(text2);

  if (tokens1.length === 0 || tokens2.length === 0) return 0;

  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);

  let intersectionCount = 0;
  for (const token of set1) {
    if (set2.has(token)) {
      intersectionCount++;
    }
  }

  const unionCount = new Set([...tokens1, ...tokens2]).size;
  const jaccard = unionCount > 0 ? intersectionCount / unionCount : 0;

  // Keyword overlap bonus
  const overlapRatio = (2 * intersectionCount) / (tokens1.length + tokens2.length);
  return Math.min(1, Math.max(0, (jaccard * 0.5) + (overlapRatio * 0.5)));
}

// Check category relatedness
function getCategoryMatchScore(cat1: string, cat2: string): { score: number; reason: string } {
  if (cat1 === cat2) {
    return { score: 20, reason: `Identical Category: "${cat1}" (+20%)` };
  }

  // Related category mappings
  const relatedGroups = [
    ['Laboratory & Infrastructure Deficiency', 'Examination & Evaluation Malpractice'],
    ['Faculty Qualifications & Shortage', 'Unapproved Course Offering'],
    ['Capitation Fee & Fee Overcharging', 'Delayed Scholarship Disbursement', 'Admission Irregularities'],
    ['Ragging & Student Harassment', 'Faculty Qualifications & Shortage'],
  ];

  for (const group of relatedGroups) {
    if (group.includes(cat1) && group.includes(cat2)) {
      return { score: 10, reason: `Semantically Related Categories: "${cat1}" and "${cat2}" (+10%)` };
    }
  }

  return { score: 0, reason: `Divergent Categories: "${cat1}" vs "${cat2}" (+0%)` };
}

/**
 * AICTE Overlap Checker Logic (from Slide 3):
 * 1. Institution ID: 40%
 *    Rule: Different institution -> score capped below 40%, so text alone never gives a strong match.
 * 2. Category: 20%
 * 3. Text Similarity: 30%
 * 4. Open status & Different bureaus: 10%
 */
export function computeOverlapScore(c1: Complaint, c2: Complaint): OverlapScoreBreakdown {
  const reasons: string[] = [];

  // 1. Institution Match (40%)
  const sameInstitution = c1.institutionId.trim().toLowerCase() === c2.institutionId.trim().toLowerCase() ||
    c1.institutionName.trim().toLowerCase() === c2.institutionName.trim().toLowerCase();

  let institutionScore = 0;
  if (sameInstitution) {
    institutionScore = 40;
    reasons.push(`Same AICTE Institution ID (${c1.institutionId}) [+40%]`);
  } else {
    reasons.push(`Different Institutions (${c1.institutionName} vs ${c2.institutionName}) [+0%]`);
  }

  // 2. Category Match (20%)
  const catResult = getCategoryMatchScore(c1.category, c2.category);
  const categoryScore = catResult.score;
  reasons.push(catResult.reason);

  // 3. Text Similarity (30%)
  const combinedText1 = `${c1.subject} ${c1.description}`;
  const combinedText2 = `${c2.subject} ${c2.description}`;
  const similarityRatio = calculateTextSimilarity(combinedText1, combinedText2);
  const textScore = Math.round(similarityRatio * 30);
  reasons.push(`Text Semantic Similarity (${Math.round(similarityRatio * 100)}%) [+${textScore}%]`);

  // 4. Open Status & Different Bureaus (10%)
  const openStatuses = ['Submitted', 'Assigned', 'Under Process', 'Transferred', 'Action Taken'];
  const bothOpen = openStatuses.includes(c1.currentStatus) && openStatuses.includes(c2.currentStatus);
  const differentBureaus = c1.bureau !== c2.bureau;

  let bureauScore = 0;
  if (bothOpen && differentBureaus) {
    bureauScore = 10;
    reasons.push(`Cross-Bureau Active Cases: ${c1.bureau} & ${c2.bureau} both active [+10%]`);
  } else if (bothOpen && !differentBureaus) {
    bureauScore = 5;
    reasons.push(`Same Bureau (${c1.bureau}) active cases [+5%]`);
  } else {
    reasons.push(`One or both cases already resolved/disposed (+0%)`);
  }

  let totalScore = institutionScore + categoryScore + textScore + bureauScore;
  let isDifferentInstitutionCapped = false;

  // SAFEGUARD RULE: Different institution -> score capped strictly below 40%
  if (!sameInstitution && totalScore >= 40) {
    totalScore = 38;
    isDifferentInstitutionCapped = true;
    reasons.push(`SAFEGUARD APPLIED: Different institutions capped strictly below 40% (Rule 3.1)`);
  }

  return {
    institutionScore,
    categoryScore,
    textScore,
    bureauScore,
    totalScore: Math.min(100, Math.max(0, totalScore)),
    isDifferentInstitutionCapped,
    explanationPoints: reasons,
  };
}

export function detectOverlapMatches(complaints: Complaint[], threshold = 60): OverlapMatch[] {
  const matches: OverlapMatch[] = [];

  for (let i = 0; i < complaints.length; i++) {
    for (let j = i + 1; j < complaints.length; j++) {
      const c1 = complaints[i];
      const c2 = complaints[j];

      // Exclude if already disposed
      if (c1.currentStatus === 'Disposed' && c2.currentStatus === 'Disposed') continue;

      const breakdown = computeOverlapScore(c1, c2);

      if (breakdown.totalScore >= threshold) {
        let recommendedAction = 'Mark for Cross-Bureau Human Verification';
        if (breakdown.totalScore >= 85) {
          recommendedAction = 'Create Joint Bureau Review Record & Coordinate Verification';
        } else if (breakdown.totalScore >= 70) {
          recommendedAction = 'Flag for Bureau Officer Review & Evidence Verification';
        }

        // Test scenario tag from slide 6
        let testScenario: 'A' | 'B' | 'C' | undefined;
        if (breakdown.totalScore >= 88 && c1.institutionId === c2.institutionId) {
          testScenario = 'A';
        } else if (c1.institutionId === c2.institutionId && breakdown.totalScore < 60) {
          testScenario = 'B';
        } else if (breakdown.isDifferentInstitutionCapped) {
          testScenario = 'C';
        }

        matches.push({
          id: `OVL-${c1.id}-${c2.id}`,
          complaint1Id: c1.id,
          complaint2Id: c2.id,
          complaint1: c1,
          complaint2: c2,
          institutionId: c1.institutionId,
          institutionName: c1.institutionName,
          matchScore: breakdown.totalScore,
          scoreBreakdown: breakdown,
          detectedAt: '2026-10-24T10:30:00Z',
          status: 'PENDING_REVIEW',
          recommendedAction,
          testScenario,
        });
      }
    }
  }

  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

