export type PersonaType =
  | 'Conference Chair'
  | 'Co-Chair'
  | 'Track Chair'
  | 'Author'
  | 'Reviewer'
  | 'Meta Reviewer'
  | 'Senior Meta Reviewer'
  | 'Proceedings Editor'
  | 'Speaker'
  | 'Attendee'
  | 'Sponsor'
  | 'Volunteer'
  | 'Conference Administrator';

export type SubmissionStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Author Feedback'
  | 'Rebuttal'
  | 'Decision Pending'
  | 'Accepted'
  | 'Accepted (Oral)'
  | 'Accepted (Poster)'
  | 'Revision Required'
  | 'Rejected'
  | 'Desk Rejected'
  | 'Camera Ready'
  | 'Copyright Signed'
  | 'Proceedings Ready'
  | 'Published'
  | 'Scheduled';

export type DecisionType =
  | 'Accept (Oral)'
  | 'Accept (Poster)'
  | 'Accept with Minor Revision'
  | 'Reject'
  | 'Desk Reject'
  | 'Pending';

export type ConflictType =
  | 'Same Institution'
  | 'Recent Co-author (36mo)'
  | 'Advisor / Advisee'
  | 'Self Declared'
  | 'Personal / Financial'
  | 'Chair Discretion';

export type ConflictStatus = 'CONFLICT' | 'NO CONFLICT' | 'REQUIRES REVIEW';

export type BidType =
  | 'Want to Review'
  | 'Can Review'
  | 'Neutral'
  | 'Cannot Review'
  | 'Conflict';

export type ReviewerBidType = BidType;

export type MetaReviewRecommendation =
  | 'Strong Accept'
  | 'Accept'
  | 'Weak Accept'
  | 'Borderline'
  | 'Weak Reject'
  | 'Reject';

export type Author = AuthorInfo;

export interface User {
  id: string;
  name: string;
  email: string;
  affiliation: string;
  country: string;
  avatar?: string;
  hIndex?: number;
  orcid?: string;
  assignedPersonas: PersonaType[];
  expertiseKeywords: string[];
  maxReviewQuota: number;
}

export interface Track {
  id: string;
  name: string;
  shortCode: string;
  description: string;
  chairIds: string[];
  color: string;
  submissionCount?: number;
}

export interface Topic {
  id: string;
  trackId: string;
  name: string;
  category?: string;
  description?: string;
  keywords?: string[];
  isActive?: boolean;
  isChairCustom?: boolean;
  submissionCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthorInfo {
  id: string;
  name: string;
  email: string;
  affiliation: string;
  country: string;
  isCorresponding: boolean;
  order: number;
  orcid?: string;
  role?: string;
  isStudent?: boolean;
}

export interface ScoreSet {
  overallScore: number; // 1 to 10
  confidence: number;   // 1 to 5
  technicalQuality: number; // 1 to 5
  novelty: number;      // 1 to 5
  empiricalEvaluation: number; // 1 to 5
  clarity: number;      // 1 to 5
}

export interface Review {
  id: string;
  paperId: string;
  reviewerId: string;
  reviewerAlias: string; // e.g. "Reviewer 1" (anonymized to authors)
  reviewerName: string;  // visible only to Chairs / Meta-reviewers
  reviewerAffiliation: string;
  scores: ScoreSet;
  strengths: string;
  weaknesses: string;
  detailedComments: string;
  confidentialToChair: string;
  questionsToAuthors: string;
  isDraft: boolean;
  submittedAt: string;
}

export interface ReviewerBid {
  id: string;
  reviewerId: string;
  paperId: string;
  bid: BidType;
  rationale?: string;
}

export interface ScoreMatchBreakdown {
  expertise: number; // e.g., 35% weight
  topics: number;    // e.g., 25% weight
  keywords: number;  // e.g., 15% weight
  bidding: number;   // e.g., 10% weight
  workload: number;  // e.g., 5% weight
  otherSignals: number; // e.g., 10% weight
  totalScore: number; // 0 to 100
  reasons: string[];
}

export interface ReviewerAssignment {
  id: string;
  paperId: string;
  reviewerId: string;
  assignmentType: 'Manual' | 'AI Recommended' | 'Auto-Assigned';
  status: 'Pending' | 'Accepted' | 'Completed' | 'Declined';
  assignedAt: string;
  matchScore: ScoreMatchBreakdown;
  dueAt: string;
}

export interface ConflictRecord {
  id: string;
  paperId: string;
  reviewerId: string;
  conflictType: ConflictType;
  status: ConflictStatus;
  reason: string;
  detectedAt: string;
  resolvedByChair?: string;
  isAutoDetected: boolean;
}

export interface DiscussionMessage {
  id: string;
  paperId: string;
  authorId: string;
  authorName: string;
  authorPersona: PersonaType;
  authorAlias?: string; // e.g. "Reviewer 2" if anonymous
  roleBadge: string;
  isConfidentialToCommittee: boolean;
  message: string;
  timestamp: string;
}

export interface MetaReview {
  id: string;
  paperId: string;
  metaReviewerId: string;
  metaReviewerName: string;
  recommendation: 'Strong Accept' | 'Accept' | 'Weak Accept' | 'Borderline' | 'Weak Reject' | 'Reject';
  confidence: number;
  summaryOfReviews: string;
  synthesisOfStrengths: string;
  synthesisOfWeaknesses: string;
  justification: string;
  isSubmitted: boolean;
  submittedAt: string;
  aiAssistedSynthesis?: string;
}

export interface DecisionRecord {
  paperId: string;
  decision: DecisionType;
  decidedBy: string;
  decidedAt: string;
  notificationSent: boolean;
  chairRemarks: string;
  acceptanceLetterSubject?: string;
  acceptanceLetterBody?: string;
}

export interface CameraReadyInfo {
  submittedAt?: string;
  finalPdfUrl?: string;
  sourceZipUrl?: string;
  pageCount?: number;
  status: 'Not Submitted' | 'Submitted' | 'Verified' | 'Needs Correction' | 'Approved';
  verificationNotes?: string;
}

export interface CopyrightRecord {
  signed: boolean;
  signedByName?: string;
  signedAt?: string;
  licenseType: 'IEEE/ACM Standard Transfer' | 'CC-BY 4.0 Open Access' | 'Crown Copyright';
  agreedToTerms: boolean;
}

export interface Submission {
  id: string;
  paperCode: string; // e.g. #ICSAI-01
  title: string;
  abstract: string;
  trackId: string;
  trackName: string;
  topics: string[];
  keywords: string[];
  authors: AuthorInfo[];
  primaryContactId: string;
  manuscriptUrl: string;
  manuscriptFileName: string;
  fileSizeMb: number;
  status: SubmissionStatus;
  submittedAt: string;
  updatedAt: string;
  averageScore?: number;
  reviewCount?: number;
  requiredReviews?: number;
  hasRebuttal?: boolean;
  rebuttalText?: string;
  rebuttalSubmittedAt?: string;
  revisionNotes?: string;
  metaReviewId?: string;
  decision?: DecisionRecord;
  cameraReady?: CameraReadyInfo;
  copyright?: CopyrightRecord;
  scheduledSessionId?: string;
  withdrawn?: boolean;
  targetConference?: string;
  submissionType?: string;
  supplementaryLinks?: string[];
  aiDisclosure?: string;
  presentationPreference?: string;
  ethicsCompliance?: boolean;
  pageCount?: number;
  aiSummary?: {
    researchQuestion: string;
    methodology: string;
    keyContributions: string[];
    strengths: string[];
    potentialWeaknesses: string[];
    suggestedReviewerQuestions: string[];
    relevanceScore: number;
  };
}

export interface Session {
  id: string;
  title: string;
  trackId: string;
  trackName: string;
  type: 'Keynote' | 'Oral Session' | 'Poster Session' | 'Panel' | 'Workshop';
  roomName: string;
  roomCapacity: number;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. 09:00 AM
  endTime: string;   // e.g. 10:30 AM
  chairName: string;
  paperIds: string[];
  description?: string;
}

export interface Presentation {
  id: string;
  paperId: string;
  sessionId: string;
  speakerId: string;
  speakerName: string;
  speakerAffiliation: string;
  title: string;
  timeSlot: string;
  durationMinutes: number;
  slidesUrl?: string;
  slidesUploadedAt?: string;
  status: 'Scheduled' | 'Slides Uploaded' | 'Verified' | 'Presented';
}

export interface Attendee {
  id: string;
  userId: string;
  name: string;
  email: string;
  affiliation: string;
  tier: 'Early Bird Academic' | 'Regular Industry' | 'Student' | 'Keynote Speaker' | 'Complimentary';
  registeredAt: string;
  checkedIn: boolean;
  badgeCode: string;
  bookmarkedSessionIds: string[];
}

export interface Registration {
  id: string;
  userId?: string;
  userName: string;
  userEmail: string;
  userAffiliation: string;
  tier: string;
  badgeCode: string;
  amountPaid: number;
  paymentStatus: string;
  checkedIn: boolean;
  registeredAt: string;
}

export interface Sponsor {
  id: string;
  name: string;
  tier: 'Platinum' | 'Gold' | 'Silver' | 'Academic Partner';
  logoUrl: string;
  website: string;
  boothLocation: string;
  contactPerson: string;
  contactEmail: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'submission' | 'review' | 'decision' | 'session' | 'system' | 'coi';
  isRead: boolean;
  timestamp: string;
  actionUrl?: string;
  actionLabel?: string;
}

export interface AuditLogItem {
  id: string;
  actorName: string;
  actorEmail: string;
  actorPersona: PersonaType;
  action: string;
  entityType: 'Submission' | 'Review' | 'Decision' | 'Assignment' | 'Session' | 'Conflict' | 'State' | 'User';
  entityId: string;
  oldValue?: string;
  newValue?: string;
  details?: string;
  timestamp: string;
}

export interface ConferenceEdition {
  id: string;
  name: string;
  acronym: string;
  year: number;
  organization: string;
  location: string;
  startDate: string;
  endDate: string;
  submissionDeadline: string;
  reviewDeadline: string;
  rebuttalDeadline: string;
  decisionDeadline: string;
  cameraReadyDeadline: string;
  currentPhase: 'Call for Papers' | 'Review Period' | 'Rebuttal & Discussion' | 'Decision Phase' | 'Camera Ready & Program' | 'Live Conference' | 'Post-Conference Archive';
  tracks: Track[];
}

export interface EmailTemplate {
  id: string;
  name: string;
  eventTrigger: string;
  subject: string;
  body: string;
  variables: string[];
}
