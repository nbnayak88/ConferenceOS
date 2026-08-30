import { Submission, User, ConflictRecord, ConflictType, ConflictStatus } from '../types';

export function extractDomain(email: string): string {
  if (!email || !email.includes('@')) return '';
  return email.split('@')[1].toLowerCase().trim();
}

export function detectConflictBetween(
  paper: Submission,
  reviewer: User
): { hasConflict: boolean; status: ConflictStatus; type?: ConflictType; reason?: string } {
  // 1. Direct Author check
  const isAuthor = paper.authors.some(
    (a) =>
      a.email.toLowerCase().trim() === reviewer.email.toLowerCase().trim() ||
      a.name.toLowerCase().trim() === reviewer.name.toLowerCase().trim()
  );

  if (isAuthor) {
    return {
      hasConflict: true,
      status: 'CONFLICT',
      type: 'Same Institution',
      reason: `Reviewer ${reviewer.name} is listed as an author on this submission.`,
    };
  }

  // 2. Institutional email domain match
  const reviewerDomain = extractDomain(reviewer.email);
  const commonGenericDomains = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'icloud.com', 'qq.com', '163.com'];
  
  if (reviewerDomain && !commonGenericDomains.includes(reviewerDomain)) {
    const matchedAuthor = paper.authors.find((a) => {
      const authorDomain = extractDomain(a.email);
      return authorDomain && authorDomain === reviewerDomain;
    });

    if (matchedAuthor) {
      return {
        hasConflict: true,
        status: 'CONFLICT',
        type: 'Same Institution',
        reason: `Institutional domain match (${reviewerDomain}) with co-author ${matchedAuthor.name} (${matchedAuthor.affiliation}).`,
      };
    }
  }

  // 3. Institutional name semantic match
  const reviewerAffil = (reviewer.affiliation || '').toLowerCase().trim();
  if (reviewerAffil.length > 3) {
    const matchedAffilAuthor = paper.authors.find((a) => {
      const authAffil = (a.affiliation || '').toLowerCase().trim();
      if (!authAffil) return false;
      return authAffil.includes(reviewerAffil) || reviewerAffil.includes(authAffil);
    });

    if (matchedAffilAuthor) {
      return {
        hasConflict: true,
        status: 'CONFLICT',
        type: 'Same Institution',
        reason: `Shared organization affiliation: ${reviewer.affiliation} with ${matchedAffilAuthor.name}.`,
      };
    }
  }

  // 4. Check for high probability collaboration window (e.g. shared track/topics)
  return {
    hasConflict: false,
    status: 'NO CONFLICT',
  };
}

export function runGlobalConflictScan(
  submissions: Submission[],
  reviewers: User[],
  existingConflicts: ConflictRecord[]
): ConflictRecord[] {
  const updated: ConflictRecord[] = [...existingConflicts];

  submissions.forEach((paper) => {
    reviewers.forEach((rev) => {
      const exists = updated.find((c) => c.paperId === paper.id && c.reviewerId === rev.id);
      if (exists) return; // Keep manual overrides or existing logs

      const result = detectConflictBetween(paper, rev);
      if (result.hasConflict && result.type && result.reason) {
        updated.push({
          id: `coi-auto-${paper.id}-${rev.id}-${Date.now()}`,
          paperId: paper.id,
          reviewerId: rev.id,
          conflictType: result.type,
          status: result.status,
          reason: result.reason,
          detectedAt: new Date().toISOString(),
          isAutoDetected: true,
        });
      }
    });
  });

  return updated;
}
