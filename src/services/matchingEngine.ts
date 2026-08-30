import { Submission, User, ReviewerBid, ConflictRecord, ScoreMatchBreakdown, ReviewerAssignment } from '../types';

export interface MatchingWeights {
  expertise: number; // default 0.35
  topics: number;    // default 0.25
  keywords: number;  // default 0.15
  bidding: number;   // default 0.10
  workload: number;  // default 0.05
  otherSignals: number; // default 0.10
}

export const defaultWeights: MatchingWeights = {
  expertise: 0.35,
  topics: 0.25,
  keywords: 0.15,
  bidding: 0.10,
  workload: 0.05,
  otherSignals: 0.10,
};

export function calculateMatchScore(
  paper: Submission,
  reviewer: User,
  bid: ReviewerBid | undefined,
  conflicts: ConflictRecord[],
  currentAssignedCount: number,
  weights: MatchingWeights = defaultWeights
): { score: ScoreMatchBreakdown; hasConflict: boolean; conflictReason?: string } {
  // 1. Check for Conflicts of Interest
  const conflict = conflicts.find(
    (c) => c.paperId === paper.id && c.reviewerId === reviewer.id && c.status === 'CONFLICT'
  );

  if (conflict) {
    return {
      score: {
        expertise: 0,
        topics: 0,
        keywords: 0,
        bidding: 0,
        workload: 0,
        otherSignals: 0,
        totalScore: 0,
        reasons: [`Excluded due to Conflict of Interest: ${conflict.reason}`],
      },
      hasConflict: true,
      conflictReason: conflict.reason,
    };
  }

  // Author cannot review their own paper or co-author paper
  const isAuthor = paper.authors.some(
    (a) => a.email.toLowerCase() === reviewer.email.toLowerCase() || a.name.toLowerCase() === reviewer.name.toLowerCase()
  );
  if (isAuthor) {
    return {
      score: {
        expertise: 0,
        topics: 0,
        keywords: 0,
        bidding: 0,
        workload: 0,
        otherSignals: 0,
        totalScore: 0,
        reasons: ['Excluded: Reviewer is an author on this submission'],
      },
      hasConflict: true,
      conflictReason: 'Reviewer is author/co-author on submission',
    };
  }

  const reasons: string[] = [];

  // 2. Expertise Score (0 - 100)
  const reviewerKeywordsLower = (reviewer.expertiseKeywords || []).map((k) => k.toLowerCase());
  const paperText = `${paper.title} ${paper.abstract} ${paper.topics.join(' ')} ${paper.keywords.join(' ')}`.toLowerCase();
  
  let keywordMatches = 0;
  reviewerKeywordsLower.forEach((kw) => {
    if (paperText.includes(kw)) {
      keywordMatches++;
    }
  });

  const rawExpertise = Math.min(100, (keywordMatches / Math.max(1, reviewerKeywordsLower.length)) * 120 + 20);
  if (keywordMatches > 0) {
    reasons.push(`Direct research keyword overlap (${keywordMatches} matches)`);
  }

  // 3. Topic Overlap (0 - 100)
  let topicMatches = 0;
  (paper.topics || []).forEach((t) => {
    if (reviewerKeywordsLower.some((rk) => rk.includes(t.toLowerCase()) || t.toLowerCase().includes(rk))) {
      topicMatches++;
    }
  });
  const rawTopics = Math.min(100, topicMatches * 40 + 30);
  if (topicMatches > 0) {
    reasons.push(`Track topic alignment with reviewer domain`);
  }

  // 4. Keywords Score (0 - 100)
  let specificKeywordMatches = 0;
  (paper.keywords || []).forEach((pk) => {
    if (reviewerKeywordsLower.some((rk) => rk.includes(pk.toLowerCase()) || pk.toLowerCase().includes(rk))) {
      specificKeywordMatches++;
    }
  });
  const rawKeywords = Math.min(100, specificKeywordMatches * 35 + 25);

  // 5. Bidding Score (0 - 100)
  let rawBidding = 50; // Neutral default
  if (bid) {
    switch (bid.bid) {
      case 'Want to Review':
        rawBidding = 100;
        reasons.push('Reviewer explicitly bid "Want to Review"');
        break;
      case 'Can Review':
        rawBidding = 80;
        reasons.push('Reviewer bid "Can Review"');
        break;
      case 'Neutral':
        rawBidding = 50;
        break;
      case 'Cannot Review':
        rawBidding = 10;
        reasons.push('Reviewer indicated low familiarity / "Cannot Review"');
        break;
      case 'Conflict':
        rawBidding = 0;
        break;
    }
  }

  // 6. Workload Capacity (0 - 100)
  const quota = reviewer.maxReviewQuota || 4;
  const loadFraction = currentAssignedCount / quota;
  let rawWorkload = 100;
  if (loadFraction >= 1.0) {
    rawWorkload = 10;
    reasons.push(`Reviewer is at/above quota capacity (${currentAssignedCount}/${quota})`);
  } else if (loadFraction >= 0.75) {
    rawWorkload = 50;
    reasons.push(`Moderate load (${currentAssignedCount}/${quota})`);
  } else {
    rawWorkload = 100;
    reasons.push(`High available review capacity (${currentAssignedCount}/${quota})`);
  }

  // 7. Other Signals (h-index, seniority, past turnaround)
  const hIndex = reviewer.hIndex || 15;
  const rawOther = Math.min(100, Math.max(30, hIndex * 2));

  // Compute Weighted Scores
  const weightedExpertise = Math.round(rawExpertise * weights.expertise);
  const weightedTopics = Math.round(rawTopics * weights.topics);
  const weightedKeywords = Math.round(rawKeywords * weights.keywords);
  const weightedBidding = Math.round(rawBidding * weights.bidding);
  const weightedWorkload = Math.round(rawWorkload * weights.workload);
  const weightedOther = Math.round(rawOther * weights.otherSignals);

  const totalScore = Math.min(
    100,
    weightedExpertise +
      weightedTopics +
      weightedKeywords +
      weightedBidding +
      weightedWorkload +
      weightedOther
  );

  return {
    score: {
      expertise: weightedExpertise,
      topics: weightedTopics,
      keywords: weightedKeywords,
      bidding: weightedBidding,
      workload: weightedWorkload,
      otherSignals: weightedOther,
      totalScore,
      reasons: reasons.slice(0, 4),
    },
    hasConflict: false,
  };
}

export function autoGenerateAssignments(
  submissions: Submission[],
  reviewers: User[],
  bids: ReviewerBid[],
  conflicts: ConflictRecord[],
  currentAssignments: ReviewerAssignment[],
  targetReviewsPerPaper: number = 3,
  weights: MatchingWeights = defaultWeights
): ReviewerAssignment[] {
  const newAssignments: ReviewerAssignment[] = [...currentAssignments];
  const reviewerLoadMap: Record<string, number> = {};

  reviewers.forEach((r) => {
    reviewerLoadMap[r.id] = newAssignments.filter((a) => a.reviewerId === r.id).length;
  });

  submissions.forEach((paper) => {
    const existingForPaper = newAssignments.filter((a) => a.paperId === paper.id);
    const needed = Math.max(0, targetReviewsPerPaper - existingForPaper.length);

    if (needed <= 0) return;

    // Calculate candidate scores for all non-conflicted reviewers not already assigned
    const candidates = reviewers
      .filter((r) => !existingForPaper.some((a) => a.reviewerId === r.id))
      .map((r) => {
        const bid = bids.find((b) => b.paperId === paper.id && b.reviewerId === r.id);
        const match = calculateMatchScore(
          paper,
          r,
          bid,
          conflicts,
          reviewerLoadMap[r.id] || 0,
          weights
        );
        return { reviewer: r, ...match };
      })
      .filter((c) => !c.hasConflict && c.score.totalScore > 20)
      .sort((a, b) => b.score.totalScore - a.score.totalScore);

    // Pick top candidates
    const selected = candidates.slice(0, needed);
    selected.forEach((sel) => {
      const assignmentId = `asgn-auto-${paper.id}-${sel.reviewer.id}-${Date.now()}`;
      newAssignments.push({
        id: assignmentId,
        paperId: paper.id,
        reviewerId: sel.reviewer.id,
        assignmentType: 'AI Recommended',
        status: 'Pending',
        assignedAt: new Date().toISOString(),
        dueAt: '2026-08-01T23:59:59Z',
        matchScore: sel.score,
      });
      reviewerLoadMap[sel.reviewer.id] = (reviewerLoadMap[sel.reviewer.id] || 0) + 1;
    });
  });

  return newAssignments;
}
