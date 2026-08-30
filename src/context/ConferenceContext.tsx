import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  ConferenceEdition,
  User,
  PersonaType,
  Submission,
  Review,
  MetaReview,
  ReviewerBid,
  ReviewerAssignment,
  ConflictRecord,
  DiscussionMessage,
  Session,
  Presentation,
  Attendee,
  Sponsor,
  NotificationItem,
  AuditLogItem,
  DecisionType,
  SubmissionStatus,
  ScoreMatchBreakdown,
  Topic,
} from '../types';
import {
  initialConference,
  initialTopics,
  mockUsers,
  mockSubmissions,
  mockReviews,
  mockMetaReviews,
  mockConflicts,
  mockBids,
  mockAssignments,
  mockDiscussions,
  mockSessions,
  mockPresentations,
  mockAttendees,
  mockSponsors,
  mockNotifications,
  mockAuditLogs,
} from '../data/mockData';

interface ConferenceContextType {
  conference: ConferenceEdition;
  setConference: (conf: ConferenceEdition) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  activePersona: PersonaType;
  setActivePersona: (persona: PersonaType) => void;
  availableUsers: User[];
  
  // Data entities
  submissions: Submission[];
  topics: Topic[];
  setTopics: (topics: Topic[]) => void;
  reviews: Review[];
  metaReviews: MetaReview[];
  conflicts: ConflictRecord[];
  bids: ReviewerBid[];
  assignments: ReviewerAssignment[];
  discussions: DiscussionMessage[];
  sessions: Session[];
  presentations: Presentation[];
  attendees: Attendee[];
  sponsors: Sponsor[];
  notifications: NotificationItem[];
  auditLogs: AuditLogItem[];

  // Mutations
  addTopic: (topic: Omit<Topic, 'id'>) => Topic;
  updateTopic: (topicId: string, updates: Partial<Topic>) => void;
  deleteTopic: (topicId: string) => void;
  toggleTopicStatus: (topicId: string) => void;
  bulkAddTopics: (trackId: string, topicNames: string[], category?: string) => Topic[];
  bulkDeleteTopics: (topicIds: string[]) => void;
  resetToDefaultTopics: () => void;
  addSubmission: (newPaper: Omit<Submission, 'id' | 'paperCode' | 'submittedAt' | 'updatedAt' | 'status'>) => Submission;
  updateSubmission: (paperId: string, updates: Partial<Submission>) => void;
  submitRebuttal: (paperId: string, text: string) => void;
  submitCameraReady: (paperId: string, fileUrl: string, pageCount: number) => void;
  signCopyright: (paperId: string, signerName: string, licenseType: any) => void;
  submitReview: (review: Omit<Review, 'id' | 'submittedAt'>) => void;
  submitMetaReview: (metaReview: Omit<MetaReview, 'id' | 'submittedAt'>) => void;
  makeDecision: (paperId: string, decision: DecisionType, remarks: string) => void;
  makeBulkDecisions: (decisions: { paperId: string; decision: DecisionType; remarks: string }[]) => void;
  setReviewerBid: (paperId: string, reviewerId: string, bid: any, rationale?: string) => void;
  assignReviewer: (paperId: string, reviewerId: string, matchScore?: ScoreMatchBreakdown, type?: 'Manual' | 'AI Recommended' | 'Auto-Assigned') => void;
  removeAssignment: (assignmentId: string) => void;
  addConflict: (paperId: string, reviewerId: string, type: any, reason: string, status?: any) => void;
  resolveConflict: (conflictId: string, newStatus: any) => void;
  postDiscussionMessage: (paperId: string, message: string, isConfidentialToCommittee: boolean) => void;
  addSession: (session: Omit<Session, 'id'>) => void;
  updateSession: (sessionId: string, updates: Partial<Session>) => void;
  deleteSession: (sessionId: string) => void;
  assignPaperToSession: (paperId: string, sessionId: string) => void;
  uploadPresentationSlides: (presentationId: string, slidesUrl: string) => void;
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;
  logAudit: (action: string, entityType: any, entityId: string, details?: string, oldValue?: string, newValue?: string) => void;
  
  // UI State
  selectedPaperId: string | null;
  setSelectedPaperId: (id: string | null) => void;
  isCopilotOpen: boolean;
  setIsCopilotOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

const ConferenceContext = createContext<ConferenceContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'conferenceos_state_';

export const ConferenceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load state from localStorage or initialize from mockData
  const [conference, setConference] = useState<ConferenceEdition>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}conf`);
    return saved ? JSON.parse(saved) : initialConference;
  });

  const [availableUsers] = useState<User[]>(mockUsers);
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}user`);
    return saved ? JSON.parse(saved) : mockUsers[0]; // Default Dr. Elena Vance (Chair)
  });

  const [activePersona, setActivePersona] = useState<PersonaType>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}persona`);
    return (saved as PersonaType) || 'Conference Chair';
  });

  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}subs`);
    return saved ? JSON.parse(saved) : mockSubmissions;
  });

  const [topics, setTopics] = useState<Topic[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}topics`);
    return saved ? JSON.parse(saved) : initialTopics;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}revs`);
    return saved ? JSON.parse(saved) : mockReviews;
  });

  const [metaReviews, setMetaReviews] = useState<MetaReview[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}metas`);
    return saved ? JSON.parse(saved) : mockMetaReviews;
  });

  const [conflicts, setConflicts] = useState<ConflictRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}coi`);
    return saved ? JSON.parse(saved) : mockConflicts;
  });

  const [bids, setBids] = useState<ReviewerBid[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}bids`);
    return saved ? JSON.parse(saved) : mockBids;
  });

  const [assignments, setAssignments] = useState<ReviewerAssignment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}asgn`);
    return saved ? JSON.parse(saved) : mockAssignments;
  });

  const [discussions, setDiscussions] = useState<DiscussionMessage[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}disc`);
    return saved ? JSON.parse(saved) : mockDiscussions;
  });

  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}sess`);
    return saved ? JSON.parse(saved) : mockSessions;
  });

  const [presentations, setPresentations] = useState<Presentation[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}pres`);
    return saved ? JSON.parse(saved) : mockPresentations;
  });

  const [attendees, setAttendees] = useState<Attendee[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}att`);
    return saved ? JSON.parse(saved) : mockAttendees;
  });

  const [sponsors] = useState<Sponsor[]>(mockSponsors);

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}notif`);
    return saved ? JSON.parse(saved) : mockNotifications;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}audit`);
    return saved ? JSON.parse(saved) : mockAuditLogs;
  });

  // UI state
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeView, setActiveView] = useState<string>('dashboard');

  // Persistence to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}conf`, JSON.stringify(conference));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}user`, JSON.stringify(currentUser));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}persona`, activePersona);
      localStorage.setItem(`${STORAGE_KEY_PREFIX}subs`, JSON.stringify(submissions));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}topics`, JSON.stringify(topics));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}revs`, JSON.stringify(reviews));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}metas`, JSON.stringify(metaReviews));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}coi`, JSON.stringify(conflicts));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}bids`, JSON.stringify(bids));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}asgn`, JSON.stringify(assignments));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}disc`, JSON.stringify(discussions));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}sess`, JSON.stringify(sessions));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}pres`, JSON.stringify(presentations));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}att`, JSON.stringify(attendees));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}notif`, JSON.stringify(notifications));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}audit`, JSON.stringify(auditLogs));
    } catch (e) {
      console.warn('Storage quota or serialization warning', e);
    }
  }, [
    conference,
    currentUser,
    activePersona,
    submissions,
    topics,
    reviews,
    metaReviews,
    conflicts,
    bids,
    assignments,
    discussions,
    sessions,
    presentations,
    attendees,
    notifications,
    auditLogs,
  ]);

  // Centralized Audit Logger
  const logAudit = (
    action: string,
    entityType: AuditLogItem['entityType'] | 'Topic' | any,
    entityId: string,
    details?: string,
    oldValue?: string,
    newValue?: string
  ) => {
    const newLog: AuditLogItem = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      actorName: currentUser.name,
      actorEmail: currentUser.email,
      actorPersona: activePersona,
      action,
      entityType,
      entityId,
      oldValue,
      newValue,
      details,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Add Notification helper
  const addNotification = (
    userId: string,
    title: string,
    message: string,
    type: NotificationItem['type'] = 'system',
    actionUrl?: string,
    actionLabel?: string
  ) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId,
      title,
      message,
      type,
      isRead: false,
      timestamp: new Date().toISOString(),
      actionUrl,
      actionLabel,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // --- TOPIC ACTIONS ---
  const addTopic = (newTopicData: Omit<Topic, 'id'>): Topic => {
    const newTopic: Topic = {
      ...newTopicData,
      id: `topic-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      isActive: newTopicData.isActive !== undefined ? newTopicData.isActive : true,
      isChairCustom: newTopicData.isChairCustom !== undefined ? newTopicData.isChairCustom : true,
      createdAt: new Date().toISOString(),
      submissionCount: 0,
    };

    setTopics((prev) => [newTopic, ...prev]);
    logAudit('TOPIC_CREATED', 'State', newTopic.id, `Created topic "${newTopic.name}" for track ${newTopic.trackId}`);
    addNotification(
      currentUser.id,
      'Topic Created',
      `Custom topic "${newTopic.name}" has been registered and is now active for manuscript submissions.`,
      'system'
    );
    return newTopic;
  };

  const updateTopic = (topicId: string, updates: Partial<Topic>) => {
    setTopics((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
    );
    logAudit('TOPIC_UPDATED', 'State', topicId, `Updated topic properties for ${topicId}`);
  };

  const deleteTopic = (topicId: string) => {
    const target = topics.find((t) => t.id === topicId);
    setTopics((prev) => prev.filter((t) => t.id !== topicId));
    logAudit('TOPIC_DELETED', 'State', topicId, `Deleted topic "${target?.name || topicId}"`);
  };

  const toggleTopicStatus = (topicId: string) => {
    setTopics((prev) =>
      prev.map((t) => {
        if (t.id === topicId) {
          const nextActive = !t.isActive;
          logAudit('TOPIC_STATUS_TOGGLED', 'State', topicId, `Toggled topic "${t.name}" active status to ${nextActive}`);
          return { ...t, isActive: nextActive, updatedAt: new Date().toISOString() };
        }
        return t;
      })
    );
  };

  const bulkAddTopics = (trackId: string, topicNames: string[], category?: string): Topic[] => {
    const created: Topic[] = [];
    const newItems = topicNames
      .map((name) => name.trim())
      .filter((name) => name.length > 0)
      .map((name, idx) => {
        const item: Topic = {
          id: `topic-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 4)}`,
          trackId,
          name,
          category: category || 'General Track Topics',
          description: `Custom topic in ${category || 'academic classification'}.`,
          keywords: [name.toLowerCase().replace(/\s+/g, '-')],
          isActive: true,
          isChairCustom: true,
          createdAt: new Date().toISOString(),
          submissionCount: 0,
        };
        created.push(item);
        return item;
      });

    if (newItems.length > 0) {
      setTopics((prev) => [...newItems, ...prev]);
      logAudit('TOPICS_BULK_IMPORTED', 'State', 'batch', `Bulk created ${newItems.length} topics for track ${trackId}`);
      addNotification(
        currentUser.id,
        'Bulk Topics Added',
        `Successfully imported ${newItems.length} custom topics into the submission taxonomy.`,
        'system'
      );
    }
    return created;
  };

  const bulkDeleteTopics = (topicIds: string[]) => {
    setTopics((prev) => prev.filter((t) => !topicIds.includes(t.id)));
    logAudit('TOPICS_BULK_DELETED', 'State', 'batch', `Bulk deleted ${topicIds.length} topics`);
  };

  const resetToDefaultTopics = () => {
    setTopics(initialTopics);
    logAudit('TOPICS_RESET_DEFAULT', 'State', 'batch', 'Reset conference topics taxonomy to standard presets.');
    addNotification(
      currentUser.id,
      'Taxonomy Reset',
      'Conference topics restored to standard initial taxonomy.',
      'system'
    );
  };

  // --- SUBMISSIONS ACTIONS ---
  const addSubmission = (
    newPaperData: Omit<Submission, 'id' | 'paperCode' | 'submittedAt' | 'updatedAt' | 'status'>
  ): Submission => {
    const count = submissions.length + 1;
    const code = `#ICSAI-${count < 10 ? '0' + count : count}`;
    const newSub: Submission = {
      ...newPaperData,
      id: `sub-${Date.now()}`,
      paperCode: code,
      status: 'Submitted',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reviewCount: 0,
      requiredReviews: 3,
    };

    setSubmissions((prev) => [newSub, ...prev]);
    logAudit('SUBMISSION_CREATED', 'Submission', newSub.id, `Created paper ${code}: "${newSub.title}"`);
    addNotification(
      currentUser.id,
      'Submission Received',
      `Paper ${code} has been successfully submitted to ${newSub.trackName}.`,
      'submission'
    );
    return newSub;
  };

  const updateSubmission = (paperId: string, updates: Partial<Submission>) => {
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id === paperId) {
          const updated = { ...sub, ...updates, updatedAt: new Date().toISOString() };
          logAudit(
            'SUBMISSION_UPDATED',
            'Submission',
            paperId,
            `Updated fields: ${Object.keys(updates).join(', ')}`,
            sub.status,
            updated.status
          );
          return updated;
        }
        return sub;
      })
    );
  };

  const submitRebuttal = (paperId: string, text: string) => {
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id === paperId) {
          return {
            ...sub,
            hasRebuttal: true,
            rebuttalText: text,
            rebuttalSubmittedAt: new Date().toISOString(),
            status: 'Rebuttal',
            updatedAt: new Date().toISOString(),
          };
        }
        return sub;
      })
    );
    logAudit('REBUTTAL_SUBMITTED', 'Submission', paperId, 'Author submitted rebuttal response to reviewer comments.');
    addNotification('user-chair-1', 'Author Rebuttal Submitted', `Rebuttal submitted for paper ${paperId}.`, 'review');
  };

  const submitCameraReady = (paperId: string, fileUrl: string, pageCount: number) => {
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id === paperId) {
          return {
            ...sub,
            status: 'Camera Ready',
            cameraReady: {
              status: 'Submitted',
              submittedAt: new Date().toISOString(),
              finalPdfUrl: fileUrl,
              pageCount,
              verificationNotes: 'Pending editor verification.',
            },
            updatedAt: new Date().toISOString(),
          };
        }
        return sub;
      })
    );
    logAudit('CAMERA_READY_UPLOADED', 'Submission', paperId, `Final manuscript uploaded (${pageCount} pages).`);
  };

  const signCopyright = (paperId: string, signerName: string, licenseType: any) => {
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id === paperId) {
          return {
            ...sub,
            copyright: {
              signed: true,
              signedByName: signerName,
              signedAt: new Date().toISOString(),
              licenseType,
              agreedToTerms: true,
            },
            updatedAt: new Date().toISOString(),
          };
        }
        return sub;
      })
    );
    logAudit('COPYRIGHT_SIGNED', 'Submission', paperId, `Signed ${licenseType} by ${signerName}`);
  };

  // --- REVIEW ACTIONS ---
  const submitReview = (reviewData: Omit<Review, 'id' | 'submittedAt'>) => {
    const existingIdx = reviews.findIndex(
      (r) => r.paperId === reviewData.paperId && r.reviewerId === reviewData.reviewerId
    );

    const newRev: Review = {
      ...reviewData,
      id: existingIdx >= 0 ? reviews[existingIdx].id : `rev-${Date.now()}`,
      submittedAt: new Date().toISOString(),
    };

    let updatedReviews: Review[];
    if (existingIdx >= 0) {
      updatedReviews = reviews.map((r, i) => (i === existingIdx ? newRev : r));
    } else {
      updatedReviews = [newRev, ...reviews];
    }
    setReviews(updatedReviews);

    // Update assignment status to Completed
    setAssignments((prev) =>
      prev.map((a) =>
        a.paperId === reviewData.paperId && a.reviewerId === reviewData.reviewerId
          ? { ...a, status: 'Completed' }
          : a
      )
    );

    // Recalculate average score & review count on submission
    const paperRevs = updatedReviews.filter((r) => r.paperId === reviewData.paperId && !r.isDraft);
    const avgScore =
      paperRevs.length > 0
        ? Number(
            (
              paperRevs.reduce((sum, r) => sum + r.scores.overallScore, 0) / paperRevs.length
            ).toFixed(1)
          )
        : undefined;

    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === reviewData.paperId
          ? {
              ...sub,
              reviewCount: paperRevs.length,
              averageScore: avgScore,
              updatedAt: new Date().toISOString(),
            }
          : sub
      )
    );

    logAudit(
      'REVIEW_SUBMITTED',
      'Review',
      newRev.id,
      `Submitted review for paper ${reviewData.paperId}. Score: ${reviewData.scores.overallScore}/10`
    );
  };

  const submitMetaReview = (metaReviewData: Omit<MetaReview, 'id' | 'submittedAt'>) => {
    const existingIdx = metaReviews.findIndex((m) => m.paperId === metaReviewData.paperId);
    const newMeta: MetaReview = {
      ...metaReviewData,
      id: existingIdx >= 0 ? metaReviews[existingIdx].id : `meta-${Date.now()}`,
      submittedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      setMetaReviews((prev) => prev.map((m, i) => (i === existingIdx ? newMeta : m)));
    } else {
      setMetaReviews((prev) => [newMeta, ...prev]);
    }

    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === metaReviewData.paperId
          ? { ...sub, metaReviewId: newMeta.id, status: 'Decision Pending', updatedAt: new Date().toISOString() }
          : sub
      )
    );

    logAudit(
      'META_REVIEW_SUBMITTED',
      'Review',
      newMeta.id,
      `Meta-review verdict: ${metaReviewData.recommendation} for paper ${metaReviewData.paperId}`
    );
  };

  // --- CHAIR DECISION ACTIONS ---
  const makeDecision = (paperId: string, decision: DecisionType, remarks: string) => {
    const targetStatus: SubmissionStatus =
      decision === 'Accept (Oral)'
        ? 'Accepted (Oral)'
        : decision === 'Accept (Poster)'
        ? 'Accepted (Poster)'
        : decision === 'Accept with Minor Revision'
        ? 'Revision Required'
        : decision === 'Desk Reject'
        ? 'Desk Rejected'
        : decision === 'Reject'
        ? 'Rejected'
        : 'Decision Pending';

    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id === paperId) {
          return {
            ...sub,
            status: targetStatus,
            decision: {
              paperId,
              decision,
              decidedBy: currentUser.name,
              decidedAt: new Date().toISOString(),
              notificationSent: true,
              chairRemarks: remarks,
              acceptanceLetterSubject: `[ICSAI 2026] Decision Notification: ${sub.paperCode}`,
              acceptanceLetterBody: `Dear Authors,\n\nYour submission ${sub.paperCode} has received a final decision of ${decision}.\n\nRemarks: ${remarks}`,
            },
            updatedAt: new Date().toISOString(),
          };
        }
        return sub;
      })
    );

    logAudit('DECISION_FINALIZED', 'Decision', paperId, `Decision: ${decision}. Remarks: ${remarks}`);
    addNotification('all', `Decision Issued: ${decision}`, `Decision finalized for paper ${paperId}.`, 'decision');
  };

  const makeBulkDecisions = (decisionsList: { paperId: string; decision: DecisionType; remarks: string }[]) => {
    decisionsList.forEach((d) => {
      makeDecision(d.paperId, d.decision, d.remarks);
    });
  };

  // --- BIDDING & ASSIGNMENTS ---
  const setReviewerBid = (paperId: string, reviewerId: string, bid: any, rationale?: string) => {
    const existing = bids.findIndex((b) => b.paperId === paperId && b.reviewerId === reviewerId);
    const newBid: ReviewerBid = {
      id: existing >= 0 ? bids[existing].id : `bid-${Date.now()}`,
      paperId,
      reviewerId,
      bid,
      rationale,
    };

    if (existing >= 0) {
      setBids((prev) => prev.map((b, i) => (i === existing ? newBid : b)));
    } else {
      setBids((prev) => [newBid, ...prev]);
    }
  };

  const assignReviewer = (
    paperId: string,
    reviewerId: string,
    matchScore?: ScoreMatchBreakdown,
    type: 'Manual' | 'AI Recommended' | 'Auto-Assigned' = 'Manual'
  ) => {
    const exists = assignments.some((a) => a.paperId === paperId && a.reviewerId === reviewerId);
    if (exists) return;

    const newAsgn: ReviewerAssignment = {
      id: `asgn-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      paperId,
      reviewerId,
      assignmentType: type,
      status: 'Pending',
      assignedAt: new Date().toISOString(),
      dueAt: conference.reviewDeadline + 'T23:59:59Z',
      matchScore: matchScore || {
        expertise: 30,
        topics: 25,
        keywords: 15,
        bidding: 10,
        workload: 5,
        otherSignals: 5,
        totalScore: 90,
        reasons: ['Manual chair assignment'],
      },
    };

    setAssignments((prev) => [newAsgn, ...prev]);
    logAudit('REVIEWER_ASSIGNED', 'Assignment', newAsgn.id, `Assigned ${reviewerId} to paper ${paperId} (${type})`);
    addNotification(reviewerId, 'New Review Assignment', `You have been assigned to review paper ${paperId}.`, 'review');
  };

  const removeAssignment = (assignmentId: string) => {
    const asgn = assignments.find((a) => a.id === assignmentId);
    if (asgn) {
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
      logAudit('ASSIGNMENT_REMOVED', 'Assignment', assignmentId, `Removed assignment for paper ${asgn.paperId}`);
    }
  };

  // --- CONFLICT OF INTEREST ---
  const addConflict = (paperId: string, reviewerId: string, type: any, reason: string, status: any = 'CONFLICT') => {
    const newCOI: ConflictRecord = {
      id: `coi-${Date.now()}`,
      paperId,
      reviewerId,
      conflictType: type,
      status,
      reason,
      detectedAt: new Date().toISOString(),
      isAutoDetected: false,
    };
    setConflicts((prev) => [newCOI, ...prev]);
    logAudit('CONFLICT_DECLARED', 'Conflict', newCOI.id, `${type}: ${reason}`);
  };

  const resolveConflict = (conflictId: string, newStatus: any) => {
    setConflicts((prev) =>
      prev.map((c) => (c.id === conflictId ? { ...c, status: newStatus, resolvedByChair: currentUser.name } : c))
    );
    logAudit('CONFLICT_RESOLVED', 'Conflict', conflictId, `Status updated to ${newStatus} by ${currentUser.name}`);
  };

  // --- DISCUSSIONS ---
  const postDiscussionMessage = (paperId: string, message: string, isConfidentialToCommittee: boolean) => {
    const newMsg: DiscussionMessage = {
      id: `disc-${Date.now()}`,
      paperId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorPersona: activePersona,
      roleBadge: activePersona,
      isConfidentialToCommittee,
      message,
      timestamp: new Date().toISOString(),
    };
    setDiscussions((prev) => [...prev, newMsg]);
    logAudit('DISCUSSION_MESSAGE_POSTED', 'Submission', paperId, `Posted discussion message (${activePersona})`);
  };

  // --- SESSIONS & PROGRAM BUILDER ---
  const addSession = (sessionData: Omit<Session, 'id'>) => {
    const newSess: Session = {
      ...sessionData,
      id: `sess-${Date.now()}`,
    };
    setSessions((prev) => [...prev, newSess]);
    logAudit('SESSION_CREATED', 'Session', newSess.id, `Created session "${newSess.title}" in ${newSess.roomName}`);
  };

  const updateSession = (sessionId: string, updates: Partial<Session>) => {
    setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, ...updates } : s)));
    logAudit('SESSION_UPDATED', 'Session', sessionId, `Updated session fields: ${Object.keys(updates).join(', ')}`);
  };

  const deleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    logAudit('SESSION_DELETED', 'Session', sessionId, 'Deleted session from schedule');
  };

  const assignPaperToSession = (paperId: string, sessionId: string) => {
    // Remove from other sessions
    setSessions((prev) =>
      prev.map((s) => ({
        ...s,
        paperIds: s.id === sessionId ? Array.from(new Set([...s.paperIds, paperId])) : s.paperIds.filter((p) => p !== paperId),
      }))
    );
    setSubmissions((prev) =>
      prev.map((sub) => (sub.id === paperId ? { ...sub, scheduledSessionId: sessionId } : sub))
    );
    logAudit('PAPER_SCHEDULED', 'Session', sessionId, `Scheduled paper ${paperId} into session ${sessionId}`);
  };

  const uploadPresentationSlides = (presentationId: string, slidesUrl: string) => {
    setPresentations((prev) =>
      prev.map((p) =>
        p.id === presentationId
          ? {
              ...p,
              slidesUrl,
              slidesUploadedAt: new Date().toISOString(),
              status: 'Verified',
            }
          : p
      )
    );
    logAudit('PRESENTATION_SLIDES_UPLOADED', 'Session', presentationId, 'Speaker uploaded presentation slides.');
  };

  const markNotificationRead = (notifId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <ConferenceContext.Provider
      value={{
        conference,
        setConference,
        currentUser,
        setCurrentUser,
        activePersona,
        setActivePersona,
        availableUsers,
        submissions,
        topics,
        setTopics,
        reviews,
        metaReviews,
        conflicts,
        bids,
        assignments,
        discussions,
        sessions,
        presentations,
        attendees,
        sponsors,
        notifications,
        auditLogs,
        addTopic,
        updateTopic,
        deleteTopic,
        toggleTopicStatus,
        bulkAddTopics,
        bulkDeleteTopics,
        resetToDefaultTopics,
        addSubmission,
        updateSubmission,
        submitRebuttal,
        submitCameraReady,
        signCopyright,
        submitReview,
        submitMetaReview,
        makeDecision,
        makeBulkDecisions,
        setReviewerBid,
        assignReviewer,
        removeAssignment,
        addConflict,
        resolveConflict,
        postDiscussionMessage,
        addSession,
        updateSession,
        deleteSession,
        assignPaperToSession,
        uploadPresentationSlides,
        markNotificationRead,
        markAllNotificationsRead,
        logAudit,
        selectedPaperId,
        setSelectedPaperId,
        isCopilotOpen,
        setIsCopilotOpen,
        searchQuery,
        setSearchQuery,
        activeView,
        setActiveView,
      }}
    >
      {children}
    </ConferenceContext.Provider>
  );
};

export const useConference = () => {
  const context = useContext(ConferenceContext);
  if (!context) {
    throw new Error('useConference must be used within a ConferenceProvider');
  }
  return context;
};
