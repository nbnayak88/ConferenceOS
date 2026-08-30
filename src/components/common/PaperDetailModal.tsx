import React, { useState } from 'react';
import {
  X,
  FileText,
  Users,
  Award,
  Star,
  CheckCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  Download,
  ExternalLink,
  MessageSquare,
  Send,
  ShieldAlert,
  Edit,
  FolderCheck,
  CheckCircle2,
  FileCheck2
} from 'lucide-react';
import { useConference } from '../../context/ConferenceContext';
import { analyzePaperWithAI } from '../../services/geminiService';
import { DecisionType } from '../../types';

export const PaperDetailModal: React.FC = () => {
  const {
    selectedPaperId,
    setSelectedPaperId,
    submissions,
    reviews,
    metaReviews,
    conflicts,
    discussions,
    activePersona,
    currentUser,
    postDiscussionMessage,
    submitRebuttal,
    makeDecision,
    submitCameraReady,
    signCopyright,
  } = useConference();

  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'discussion' | 'rebuttal' | 'cameraready' | 'ai-analysis'>('overview');
  const [newDiscussionMsg, setNewDiscussionMsg] = useState('');
  const [isConfidentialToComm, setIsConfidentialToComm] = useState(true);
  const [rebuttalInput, setRebuttalInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);

  // Decision state
  const [decisionType, setDecisionType] = useState<DecisionType>('Accept (Oral)');
  const [decisionRemarks, setDecisionRemarks] = useState('');

  if (!selectedPaperId) return null;

  const paper = submissions.find((s) => s.id === selectedPaperId);
  if (!paper) return null;

  const isChair =
    activePersona === 'Conference Chair' ||
    activePersona === 'Co-Chair' ||
    activePersona === 'Conference Administrator' ||
    activePersona === 'Track Chair';
  const isAuthor =
    activePersona === 'Author' ||
    paper.authors.some(
      (a) => a.email.toLowerCase() === currentUser.email.toLowerCase() || a.id === currentUser.id
    );

  const paperReviews = reviews.filter((r) => r.paperId === paper.id);
  const paperMeta = metaReviews.find((m) => m.paperId === paper.id);
  const paperConflicts = conflicts.filter((c) => c.paperId === paper.id);
  const paperDiscussions = discussions.filter((d) => d.paperId === paper.id);

  const handleRunAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await analyzePaperWithAI({
        title: paper.title,
        abstract: paper.abstract,
        trackName: paper.trackName,
        topics: paper.topics,
      });
      setAiAnalysisResult(res);
      setActiveTab('ai-analysis');
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePostDiscussion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscussionMsg.trim()) return;
    postDiscussionMessage(paper.id, newDiscussionMsg, isConfidentialToComm);
    setNewDiscussionMsg('');
  };

  const handleRebuttalSubmit = () => {
    if (!rebuttalInput.trim()) return;
    submitRebuttal(paper.id, rebuttalInput);
    setRebuttalInput('');
  };

  const handleMakeDecision = () => {
    makeDecision(paper.id, decisionType, decisionRemarks || `Standard decision: ${decisionType}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                {paper.paperCode}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                {paper.trackName}
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded ${
                  paper.status.includes('Accepted')
                    ? 'bg-emerald-100 text-emerald-800'
                    : paper.status === 'Rebuttal'
                    ? 'bg-purple-100 text-purple-800'
                    : paper.status === 'Rejected'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {paper.status}
              </span>
              {paper.averageScore && (
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-blue-600 text-blue-600" />
                  Avg Score: {paper.averageScore}/10
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {paper.title}
            </h2>
          </div>

          <button
            onClick={() => setSelectedPaperId(null)}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="px-5 border-b border-slate-200 bg-white flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 py-2">
            {[
              { id: 'overview', label: 'Overview & Abstract', icon: FileText },
              { id: 'reviews', label: `Reviews (${paperReviews.length})`, icon: Star },
              { id: 'discussion', label: `Discussions (${paperDiscussions.length})`, icon: MessageSquare },
              { id: 'rebuttal', label: 'Rebuttal', icon: Edit },
              { id: 'cameraready', label: 'Camera Ready & Copyright', icon: FolderCheck },
              { id: 'ai-analysis', label: 'AI Deep Analysis', icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleRunAIAnalysis}
            disabled={isAnalyzing}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>{isAnalyzing ? 'Analyzing...' : 'AI Analyze Paper'}</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {/* Tab 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Authors Roster */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                  <span>Author Roster</span>
                  {!isChair && !isAuthor && (
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-normal">
                      Double-Blind View Active for Reviewers
                    </span>
                  )}
                </div>
                {isChair || isAuthor ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {paper.authors.map((auth) => (
                      <div key={auth.id} className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs">
                        <div className="font-semibold text-slate-900 flex items-center gap-1">
                          <span>{auth.name}</span>
                          {auth.isCorresponding && (
                            <span className="text-[9px] px-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              Primary
                            </span>
                          )}
                        </div>
                        <div className="text-slate-500 text-[11px] truncate">{auth.affiliation}</div>
                        <div className="text-slate-400 text-[10px] truncate">{auth.email}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic">
                    Authors anonymized for double-blind peer review compliance.
                  </div>
                )}
              </div>

              {/* Abstract */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Abstract</h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                  {paper.abstract}
                </p>
              </div>

              {/* Topics & Keywords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Topics</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {paper.topics.map((topic, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Author Keywords</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {paper.keywords.map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* PDF Manuscript Actions */}
              <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-white">{paper.manuscriptFileName}</div>
                    <div className="text-[11px] text-slate-400">
                      Size: {paper.fileSizeMb} MB • Submitted: {new Date(paper.submittedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={paper.manuscriptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </a>
                </div>
              </div>

              {/* Chair Decision Panel */}
              {isChair && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-amber-900 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-700" />
                      Chair Decision Control
                    </span>
                    {paper.decision && (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        Decided: {paper.decision.decision}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">Decision</label>
                      <select
                        value={decisionType}
                        onChange={(e) => setDecisionType(e.target.value as DecisionType)}
                        className="w-full text-xs font-medium p-2 rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="Accept (Oral)">Accept (Oral Presentation)</option>
                        <option value="Accept (Poster)">Accept (Poster Presentation)</option>
                        <option value="Accept with Minor Revision">Accept with Minor Revision</option>
                        <option value="Reject">Reject</option>
                        <option value="Desk Reject">Desk Reject</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">Chair Remarks</label>
                      <input
                        type="text"
                        value={decisionRemarks}
                        onChange={(e) => setDecisionRemarks(e.target.value)}
                        placeholder="e.g., Unanimous reviewer consensus, outstanding empirical contributions."
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleMakeDecision}
                      className="px-4 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-sm transition-all"
                    >
                      Finalize & Notify Authors
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {paperMeta && (
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-purple-700" />
                      Meta-Review Recommendation: {paperMeta.recommendation} (Confidence: {paperMeta.confidence}/5)
                    </span>
                    <span className="text-[11px] text-purple-700 font-medium">By {paperMeta.metaReviewerName}</span>
                  </div>
                  <p className="text-xs text-purple-950 leading-relaxed mb-2 font-medium">
                    {paperMeta.summaryOfReviews}
                  </p>
                  <div className="text-xs text-purple-900">
                    <span className="font-bold">Justification: </span>
                    {paperMeta.justification}
                  </div>
                </div>
              )}

              {paperReviews.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-xl">
                  No peer reviews submitted yet for this paper.
                </div>
              ) : (
                paperReviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{rev.reviewerAlias}</span>
                        {isChair && (
                          <span className="text-[11px] text-slate-500">
                            ({rev.reviewerName}, {rev.reviewerAffiliation})
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">
                          {new Date(rev.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          Score: {rev.scores.overallScore}/10
                        </span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                          Confidence: {rev.scores.confidence}/5
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-white p-2.5 rounded-lg border border-slate-200">
                      <div>
                        <span className="text-slate-400">Tech Quality: </span>
                        <span className="font-semibold text-slate-700">{rev.scores.technicalQuality}/5</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Novelty: </span>
                        <span className="font-semibold text-slate-700">{rev.scores.novelty}/5</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Empirical: </span>
                        <span className="font-semibold text-slate-700">{rev.scores.empiricalEvaluation}/5</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Clarity: </span>
                        <span className="font-semibold text-slate-700">{rev.scores.clarity}/5</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-bold text-emerald-800 block mb-0.5">Strengths:</span>
                        <p className="text-slate-700">{rev.strengths}</p>
                      </div>
                      <div>
                        <span className="font-bold text-rose-800 block mb-0.5">Weaknesses:</span>
                        <p className="text-slate-700">{rev.weaknesses}</p>
                      </div>
                      {rev.questionsToAuthors && (
                        <div>
                          <span className="font-bold text-blue-800 block mb-0.5">Questions to Authors:</span>
                          <p className="text-slate-700">{rev.questionsToAuthors}</p>
                        </div>
                      )}
                      {isChair && rev.confidentialToChair && (
                        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                          <span className="font-bold block text-[11px]">Confidential Note to Chair:</span>
                          <p className="text-[11px]">{rev.confidentialToChair}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: DISCUSSIONS */}
          {activeTab === 'discussion' && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span>Active reviewer and committee confidential discussion thread.</span>
                <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                  Double-Blind Protected
                </span>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto">
                {paperDiscussions.length === 0 ? (
                  <div className="text-center p-6 text-xs text-slate-400 border border-dashed rounded-xl">
                    No discussion messages yet. Start the thread below.
                  </div>
                ) : (
                  paperDiscussions.map((msg) => (
                    <div key={msg.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                          <span>{msg.authorAlias || msg.authorName}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                            {msg.roleBadge}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{msg.message}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handlePostDiscussion} className="space-y-2">
                <textarea
                  rows={3}
                  value={newDiscussionMsg}
                  onChange={(e) => setNewDiscussionMsg(e.target.value)}
                  placeholder="Post a message to the review committee..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none"
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isConfidentialToComm}
                      onChange={(e) => setIsConfidentialToComm(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Confidential to Committee (Hidden from Authors)</span>
                  </label>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 4: REBUTTAL */}
          {activeTab === 'rebuttal' && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 text-xs text-purple-900">
                <span className="font-bold">Author Rebuttal Phase: </span>
                Authors can directly answer reviewer questions and clarify empirical results within a 1,000-word limit.
              </div>

              {paper.hasRebuttal ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Rebuttal Submitted
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {paper.rebuttalSubmittedAt && new Date(paper.rebuttalSubmittedAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                    {paper.rebuttalText}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    rows={6}
                    value={rebuttalInput}
                    onChange={(e) => setRebuttalInput(e.target.value)}
                    placeholder="Enter author rebuttal addressing specific reviewer queries (e.g. baseline comparisons, wall-clock timing data, ablations)..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleRebuttalSubmit}
                      disabled={!rebuttalInput.trim()}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white text-xs font-bold shadow-sm transition-all"
                    >
                      Submit Rebuttal
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 5: CAMERA READY & COPYRIGHT */}
          {activeTab === 'cameraready' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Camera Ready Box */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <FileCheck2 className="w-4 h-4 text-emerald-600" />
                      Camera-Ready Manuscript
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800">
                      {paper.cameraReady?.status || 'Pending'}
                    </span>
                  </div>

                  {paper.cameraReady ? (
                    <div className="text-xs text-slate-600 space-y-1">
                      <div>
                        <span className="font-medium">Uploaded: </span>
                        {new Date(paper.cameraReady.submittedAt).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Page Count: </span>
                        {paper.cameraReady.pageCount} pages (Verified)
                      </div>
                      {paper.cameraReady.verificationNotes && (
                        <div className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200">
                          {paper.cameraReady.verificationNotes}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => submitCameraReady(paper.id, 'https://camera-ready.icsai.org/final.pdf', 10)}
                      className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all"
                    >
                      Upload Camera-Ready PDF
                    </button>
                  )}
                </div>

                {/* Copyright Transfer Box */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-cyan-600" />
                      IEEE/ACM Copyright Form
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-cyan-100 text-cyan-800">
                      {paper.copyright?.signed ? 'Signed & Recorded' : 'Unsigned'}
                    </span>
                  </div>

                  {paper.copyright?.signed ? (
                    <div className="text-xs text-slate-600 space-y-1">
                      <div>
                        <span className="font-medium">Signed By: </span>
                        {paper.copyright.signedByName}
                      </div>
                      <div>
                        <span className="font-medium">License: </span>
                        {paper.copyright.licenseType}
                      </div>
                      <div className="text-[11px] text-cyan-700 bg-cyan-50 p-2 rounded border border-cyan-200">
                        Legally binding electronic signature verified on {new Date(paper.copyright.signedAt).toLocaleDateString()}.
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => signCopyright(paper.id, currentUser.name, 'IEEE/ACM Standard Transfer')}
                      className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold transition-all"
                    >
                      Sign Electronic Copyright Form
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: AI DEEP ANALYSIS */}
          {activeTab === 'ai-analysis' && (
            <div className="space-y-4">
              {aiAnalysisResult || paper.aiSummary ? (
                (() => {
                  const data = aiAnalysisResult || paper.aiSummary;
                  return (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950 to-slate-900 text-white space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4" />
                            Gemini 2.5 Paper Synthesis & Rubric Audit
                          </span>
                          <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                            Relevance Fit: {data.relevanceScore}%
                          </span>
                        </div>
                        <div className="text-xs text-slate-300">
                          <span className="font-semibold text-white">Core Research Question: </span>
                          {data.researchQuestion}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                          <span className="text-xs font-bold text-emerald-800 block">Key Contributions</span>
                          <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                            {data.keyContributions?.map((item: string, idx: number) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                          <span className="text-xs font-bold text-blue-800 block">Methodology & Experiments</span>
                          <p className="text-xs text-slate-700 leading-relaxed">{data.methodology}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                          <span className="text-xs font-bold text-emerald-900 block">Identified Strengths</span>
                          <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                            {data.strengths?.map((item: string, idx: number) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 space-y-2">
                          <span className="text-xs font-bold text-rose-900 block">Potential Weaknesses / Blindspots</span>
                          <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                            {data.potentialWeaknesses?.map((item: string, idx: number) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-2">
                        <span className="text-xs font-bold text-blue-900 block">
                          Suggested Questions for Reviewers to Pose
                        </span>
                        <ul className="text-xs text-blue-950 space-y-1.5 list-disc list-inside">
                          {data.suggestedReviewerQuestions?.map((item: string, idx: number) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="p-8 text-center space-y-3">
                  <Sparkles className="w-8 h-8 text-emerald-600 mx-auto animate-pulse" />
                  <div className="text-xs text-slate-600">Run AI deep analysis to extract structured synthesis.</div>
                  <button
                    onClick={handleRunAIAnalysis}
                    disabled={isAnalyzing}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                  >
                    {isAnalyzing ? 'Analyzing with Gemini...' : 'Run Analysis Now'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
