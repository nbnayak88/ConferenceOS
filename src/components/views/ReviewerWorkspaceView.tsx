import React, { useState } from 'react';
import {
  Edit3,
  Star,
  CheckCircle,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Minus,
  ShieldAlert,
  Save,
  Send,
  FileText,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { useConference } from '../../context/ConferenceContext';
import { ReviewerBidType, Review } from '../../types';

export const ReviewerWorkspaceView: React.FC = () => {
  const {
    currentUser,
    submissions,
    bids,
    assignments,
    reviews,
    setReviewerBid,
    submitReview,
    setSelectedPaperId,
    conference,
  } = useConference();

  const [activeTab, setActiveTab] = useState<'assigned' | 'bidding'>('assigned');
  const [selectedReviewPaperId, setSelectedReviewPaperId] = useState<string | null>(null);

  // Review Form State
  const [overallScore, setOverallScore] = useState<number>(8);
  const [confidence, setConfidence] = useState<number>(4);
  const [techQuality, setTechQuality] = useState<number>(4);
  const [novelty, setNovelty] = useState<number>(4);
  const [empirical, setEmpirical] = useState<number>(4);
  const [clarity, setClarity] = useState<number>(4);
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [detailedComments, setDetailedComments] = useState('');
  const [questionsToAuthors, setQuestionsToAuthors] = useState('');
  const [confidentialToChair, setConfidentialToChair] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Get papers assigned to currentUser
  const myAssignments = assignments.filter((a) => a.reviewerId === currentUser.id);

  // If a paper is selected for reviewing, load existing review if any
  const handleOpenReviewForm = (paperId: string) => {
    setSelectedReviewPaperId(paperId);
    const existing = reviews.find((r) => r.paperId === paperId && r.reviewerId === currentUser.id);
    if (existing) {
      setOverallScore(existing.scores.overallScore);
      setConfidence(existing.scores.confidence);
      setTechQuality(existing.scores.technicalQuality);
      setNovelty(existing.scores.novelty);
      setEmpirical(existing.scores.empiricalEvaluation);
      setClarity(existing.scores.clarity);
      setStrengths(existing.strengths);
      setWeaknesses(existing.weaknesses);
      setDetailedComments(existing.detailedComments || '');
      setQuestionsToAuthors(existing.questionsToAuthors || '');
      setConfidentialToChair(existing.confidentialToChair || '');
    } else {
      // Default template
      setOverallScore(8);
      setConfidence(4);
      setTechQuality(4);
      setNovelty(4);
      setEmpirical(4);
      setClarity(4);
      setStrengths('1. Clear environmental motivation with rigorous baseline comparison.\n2. Strong reproducibility on standard benchmark suite.');
      setWeaknesses('1. Ablation on multi-node clusters could be expanded in the final version.');
      setDetailedComments('This paper makes a solid empirical contribution to sustainable AI.');
      setQuestionsToAuthors('Have you measured the latency overhead during peak burst traffic?');
      setConfidentialToChair('Solid work, recommend accept.');
    }
  };

  const handleSaveReview = (isDraft: boolean) => {
    if (!selectedReviewPaperId) return;

    submitReview({
      paperId: selectedReviewPaperId,
      reviewerId: currentUser.id,
      reviewerAlias: `Reviewer ${myAssignments.findIndex((a) => a.paperId === selectedReviewPaperId) + 1 || 1}`,
      reviewerName: currentUser.name,
      reviewerAffiliation: currentUser.affiliation,
      scores: {
        overallScore,
        confidence,
        technicalQuality: techQuality,
        novelty,
        empiricalEvaluation: empirical,
        clarity,
      },
      strengths,
      weaknesses,
      detailedComments,
      questionsToAuthors,
      confidentialToChair,
      isDraft,
    });

    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setSelectedReviewPaperId(null);
    }, 2000);
  };

  const activePaper = submissions.find((s) => s.id === selectedReviewPaperId);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Reviewer Workspace
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-slate-300">
              Reviewer: <strong className="text-white">{currentUser.name}</strong> ({currentUser.affiliation})
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Peer Review & Bidding Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Conduct multi-criteria rubric assessments, declare paper preferences, and draft confidential chair recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
          <button
            onClick={() => {
              setActiveTab('assigned');
              setSelectedReviewPaperId(null);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'assigned'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            My Assigned Reviews ({myAssignments.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('bidding');
              setSelectedReviewPaperId(null);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'bidding'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Paper Bidding Console
          </button>
        </div>
      </div>

      {/* Tab 1: MY ASSIGNED REVIEWS */}
      {activeTab === 'assigned' && !selectedReviewPaperId && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Your Assigned Manuscripts</h2>
            <span className="text-xs text-slate-500">
              Review Deadline: <strong>{conference.reviewDeadline}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myAssignments.length === 0 ? (
              <div className="col-span-2 p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-2">
                <Edit3 className="w-8 h-8 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700">No review assignments currently</h3>
                <p className="text-xs text-slate-400">
                  Switch persona or check the Bidding Console to indicate your research preferences.
                </p>
              </div>
            ) : (
              myAssignments.map((asgn) => {
                const paper = submissions.find((s) => s.id === asgn.paperId);
                const existingReview = reviews.find(
                  (r) => r.paperId === asgn.paperId && r.reviewerId === currentUser.id
                );
                const isCompleted = existingReview && !existingReview.isDraft;

                if (!paper) return null;

                return (
                  <div
                    key={asgn.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                          {paper.paperCode}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isCompleted ? 'Review Submitted' : 'Pending Evaluation'}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 leading-snug">{paper.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2">{paper.abstract}</p>

                      <div className="text-[11px] text-slate-400 font-medium">
                        Track: {paper.trackName}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => setSelectedPaperId(paper.id)}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                      >
                        Inspect Paper &rarr;
                      </button>

                      <button
                        onClick={() => handleOpenReviewForm(paper.id)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
                      >
                        {isCompleted ? 'Edit Review Form' : 'Fill Review Form'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 1b: ACTIVE REVIEW FORM MODAL / VIEW */}
      {selectedReviewPaperId && activePaper && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-6 animate-in fade-in">
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                  {activePaper.paperCode}
                </span>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  {activePaper.trackName}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1.5">
                {activePaper.title}
              </h2>
            </div>

            <button
              onClick={() => setSelectedReviewPaperId(null)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              &larr; Back to List
            </button>
          </div>

          {submitSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Review successfully submitted to committee!</span>
            </div>
          )}

          {/* Structured Rubric Sliders */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Multi-Dimensional Rubric Ratings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Technical Quality</span>
                  <span className="font-bold text-blue-700">{techQuality} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={techQuality}
                  onChange={(e) => setTechQuality(parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="text-[10px] text-slate-400 mt-1">Mathematical & experimental soundness</div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Novelty & Originality</span>
                  <span className="font-bold text-blue-700">{novelty} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={novelty}
                  onChange={(e) => setNovelty(parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="text-[10px] text-slate-400 mt-1">New concepts & paradigm advances</div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Empirical Rigor</span>
                  <span className="font-bold text-blue-700">{empirical} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={empirical}
                  onChange={(e) => setEmpirical(parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="text-[10px] text-slate-400 mt-1">Benchmarks & physical telemetry</div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Clarity & Organization</span>
                  <span className="font-bold text-blue-700">{clarity} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={clarity}
                  onChange={(e) => setClarity(parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="text-[10px] text-slate-400 mt-1">Writing flow & diagram legibility</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex justify-between text-xs font-bold text-blue-900 mb-1">
                  <span>Overall Recommendation Score (1-10)</span>
                  <span className="text-base font-black text-blue-700">{overallScore} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={overallScore}
                  onChange={(e) => setOverallScore(parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="text-[10px] text-blue-700 mt-1">
                  {overallScore >= 9 ? 'Top 5% Flagship Oral' : overallScore >= 7 ? 'Strong Accept' : overallScore >= 5 ? 'Borderline' : 'Reject'}
                </div>
              </div>

              <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
                <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>Reviewer Confidence (1-5)</span>
                  <span className="font-black text-slate-900">{confidence} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={confidence}
                  onChange={(e) => setConfidence(parseInt(e.target.value))}
                  className="w-full accent-slate-700"
                />
                <div className="text-[10px] text-slate-500 mt-1">
                  {confidence === 5 ? 'Domain expert with high certainty' : confidence >= 3 ? 'Knowledgeable in field' : 'General reader'}
                </div>
              </div>
            </div>
          </div>

          {/* Text Fields */}
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-emerald-800 block mb-1">Paper Strengths (Visible to Authors) *</label>
              <textarea
                rows={3}
                required
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                placeholder="Highlight novel formulations, strong empirical validation, reproducible artifacts..."
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-rose-800 block mb-1">Paper Weaknesses & Limitations (Visible to Authors) *</label>
              <textarea
                rows={3}
                required
                value={weaknesses}
                onChange={(e) => setWeaknesses(e.target.value)}
                placeholder="Detail unaddressed edge cases, missing baselines, unclear mathematical steps..."
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-blue-800 block mb-1">Questions to Authors for Rebuttal</label>
              <textarea
                rows={2}
                value={questionsToAuthors}
                onChange={(e) => setQuestionsToAuthors(e.target.value)}
                placeholder="Specific queries for authors to address during the rebuttal phase..."
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-amber-900 block mb-1">
                Confidential Remarks to Program Chairs (Hidden from Authors)
              </label>
              <textarea
                rows={2}
                value={confidentialToChair}
                onChange={(e) => setConfidentialToChair(e.target.value)}
                placeholder="Share candid thoughts on presentation suitability, Best Paper nomination, or ethical flags..."
                className="w-full p-3 rounded-xl border border-amber-200 bg-amber-50/50 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              onClick={() => handleSaveReview(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedReviewPaperId(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveReview(false)}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Final Review</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: PAPER BIDDING CONSOLE */}
      {activeTab === 'bidding' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900">Reviewer Bidding Console: </span>
              Indicate your familiarity and willingness to review conference submissions. Your bids directly guide our AI Matching Engine.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {submissions.map((paper) => {
              const currentBid = bids.find((b) => b.paperId === paper.id && b.reviewerId === currentUser.id)?.bid;

              return (
                <div
                  key={paper.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                        {paper.paperCode}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {paper.trackName.split('&')[0]}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{paper.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{paper.abstract}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1 flex-wrap">
                    <span className="text-[11px] font-semibold text-slate-500">Your Bid:</span>
                    <div className="flex items-center gap-1">
                      {[
                        { type: 'Want to Review' as ReviewerBidType, label: 'Want', color: 'hover:bg-emerald-50 hover:text-emerald-700' },
                        { type: 'Can Review' as ReviewerBidType, label: 'Can', color: 'hover:bg-blue-50 hover:text-blue-700' },
                        { type: 'Neutral' as ReviewerBidType, label: 'Neutral', color: 'hover:bg-slate-100 text-slate-600' },
                        { type: 'Cannot Review' as ReviewerBidType, label: 'Cannot', color: 'hover:bg-amber-50 hover:text-amber-700' },
                        { type: 'Conflict' as ReviewerBidType, label: 'Conflict', color: 'hover:bg-rose-50 hover:text-rose-700' },
                      ].map((b) => {
                        const isSelected = currentBid === b.type;
                        return (
                          <button
                            key={b.type}
                            onClick={() => setReviewerBid(paper.id, currentUser.id, b.type)}
                            className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                              isSelected
                                ? 'bg-slate-900 text-white shadow-xs'
                                : `bg-slate-50 text-slate-700 ${b.color} border border-slate-200`
                            }`}
                          >
                            {b.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
