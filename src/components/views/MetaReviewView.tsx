import React, { useState } from 'react';
import {
  MessageSquare,
  Award,
  Sparkles,
  AlertTriangle,
  Send,
  Save,
  CheckCircle,
  FileText,
  Users,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useConference } from '../../context/ConferenceContext';
import { synthesizeMetaReviewWithAI } from '../../services/geminiService';
import { MetaReviewRecommendation } from '../../types';

export const MetaReviewView: React.FC = () => {
  const {
    submissions,
    reviews,
    metaReviews,
    discussions,
    currentUser,
    activePersona,
    submitMetaReview,
    postDiscussionMessage,
    setSelectedPaperId,
    selectedPaperId,
  } = useConference();

  const [selectedPaperIdForMeta, setSelectedPaperIdForMeta] = useState<string>(
    selectedPaperId || 'sub-07' // Default to high-variance paper #ICSAI-07
  );

  // Meta review form state
  const [recommendation, setRecommendation] = useState<MetaReviewRecommendation>('Borderline');
  const [confidence, setConfidence] = useState<number>(4);
  const [summaryOfReviews, setSummaryOfReviews] = useState('');
  const [synthesisOfStrengths, setSynthesisOfStrengths] = useState('');
  const [synthesisOfWeaknesses, setSynthesisOfWeaknesses] = useState('');
  const [justification, setJustification] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [newDiscussionMsg, setNewDiscussionMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const currentPaper =
    submissions.find((s) => s.id === selectedPaperIdForMeta) || submissions[0];
  const paperReviews = reviews.filter((r) => r.paperId === currentPaper?.id);
  const paperDiscussions = discussions.filter((d) => d.paperId === currentPaper?.id);
  const existingMeta = metaReviews.find((m) => m.paperId === currentPaper?.id);

  // Load existing meta-review if present
  React.useEffect(() => {
    if (existingMeta) {
      setRecommendation(existingMeta.recommendation);
      setConfidence(existingMeta.confidence);
      setSummaryOfReviews(existingMeta.summaryOfReviews);
      setSynthesisOfStrengths(existingMeta.synthesisOfStrengths);
      setSynthesisOfWeaknesses(existingMeta.synthesisOfWeaknesses);
      setJustification(existingMeta.justification);
    } else {
      setRecommendation('Borderline');
      setConfidence(4);
      setSummaryOfReviews('Reviewers have divergent viewpoints regarding distributed communication overhead vs algorithmic sparsity.');
      setSynthesisOfStrengths('Clean mathematical loss formulation; high theoretical speedup potential.');
      setSynthesisOfWeaknesses('Empirical multi-node GPU cluster validation requested in rebuttal.');
      setJustification('Awaiting author rebuttal clarification on 8x H100 benchmarks before final Oral/Poster determination.');
    }
  }, [selectedPaperIdForMeta, existingMeta]);

  const handleRunAISynthesis = async () => {
    setIsSynthesizing(true);
    try {
      const res = await synthesizeMetaReviewWithAI(
        currentPaper.title,
        paperReviews,
        'High variance (9 vs 3)'
      );
      setSummaryOfReviews(res.executiveSummary);
      setSynthesisOfStrengths(res.consensusStrengths.join('\n'));
      setSynthesisOfWeaknesses(res.disagreementPoints.join('\n'));
      setJustification(res.chairBriefingNotes);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleSubmitMeta = (isSubmitted: boolean) => {
    if (!currentPaper) return;
    submitMetaReview({
      paperId: currentPaper.id,
      metaReviewerId: currentUser.id,
      metaReviewerName: currentUser.name,
      recommendation,
      confidence,
      summaryOfReviews,
      synthesisOfStrengths,
      synthesisOfWeaknesses,
      justification,
      isSubmitted,
    });
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const handlePostDiscussion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscussionMsg.trim() || !currentPaper) return;
    postDiscussionMessage(currentPaper.id, newDiscussionMsg, true);
    setNewDiscussionMsg('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Meta-Review & Discussion Room
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Senior Meta-Review & Committee Arbitration
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Synthesize peer review consensus, arbitrate polarized scores, and formulate official recommendation verdicts.
          </p>
        </div>

        <button
          onClick={handleRunAISynthesis}
          disabled={isSynthesizing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 text-white font-bold text-xs shadow-lg transition-all shrink-0"
        >
          <Sparkles className={`w-4 h-4 ${isSynthesizing ? 'animate-spin' : ''}`} />
          <span>{isSynthesizing ? 'Synthesizing with Gemini...' : 'AI Meta-Review Synthesizer'}</span>
        </button>
      </div>

      {isSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Meta-review recommendation successfully saved & notified to General Chairs!</span>
        </div>
      )}

      {/* Main Grid: Papers Selector vs Meta Review Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Submissions requiring Meta Reviews */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Submissions Roster
            </h3>
            <span className="text-xs font-semibold text-purple-700">30 Submissions</span>
          </div>

          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {submissions.map((paper) => {
              const isSelected = paper.id === currentPaper?.id;
              const hasMeta = metaReviews.some((m) => m.paperId === paper.id);
              const paperRevs = reviews.filter((r) => r.paperId === paper.id);
              const scores = paperRevs.map((r) => r.scores.overallScore);
              const hasHighVariance = scores.length >= 2 && Math.max(...scores) - Math.min(...scores) >= 4;

              return (
                <div
                  key={paper.id}
                  onClick={() => setSelectedPaperIdForMeta(paper.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50/70 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono font-bold text-[11px]">{paper.paperCode}</span>
                    <div className="flex items-center gap-1">
                      {hasHighVariance && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-300">
                          Spread &ge;4
                        </span>
                      )}
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                          hasMeta ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {hasMeta ? 'Meta Ready' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  <div className="font-semibold line-clamp-1">{paper.title}</div>
                  <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                    <span>Scores: {scores.join(', ') || 'None'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Meta Review Editor & Committee Discussion */}
        <div className="lg:col-span-2 space-y-6">
          {/* Paper Context & Scores Overview */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                    {currentPaper.paperCode}
                  </span>
                  <span className="text-xs font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded">
                    {currentPaper.trackName}
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 mt-1.5">
                  {currentPaper.title}
                </h2>
              </div>

              <button
                onClick={() => setSelectedPaperId(currentPaper.id)}
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 whitespace-nowrap"
              >
                Full Manuscript Modal &rarr;
              </button>
            </div>

            {/* Individual Reviewer Scores Bar */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Peer Reviewer Breakdown ({paperReviews.length} Reviews)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {paperReviews.map((rev) => (
                  <div key={rev.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{rev.reviewerAlias}</span>
                      <span className="font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {rev.scores.overallScore}/10
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">Confidence: {rev.scores.confidence}/5</div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 italic">"{rev.strengths}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Meta Review Recommendation Form */}
            <div className="space-y-4 pt-3 border-t border-slate-100 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Meta-Review Recommendation *
                  </label>
                  <select
                    value={recommendation}
                    onChange={(e) => setRecommendation(e.target.value as MetaReviewRecommendation)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold"
                  >
                    <option value="Strong Accept">Strong Accept (Flagship Oral)</option>
                    <option value="Accept">Accept (Poster / Standard Oral)</option>
                    <option value="Borderline">Borderline (Needs Discussion)</option>
                    <option value="Reject">Reject</option>
                    <option value="Strong Reject">Strong Reject</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Meta-Reviewer Confidence *
                  </label>
                  <select
                    value={confidence}
                    onChange={(e) => setConfidence(parseInt(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value={5}>5 - High certainty / Field expert</option>
                    <option value={4}>4 - High confidence</option>
                    <option value={3}>3 - Medium confidence</option>
                    <option value={2}>2 - Low confidence</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Executive Summary of Reviewers' Findings *
                </label>
                <textarea
                  rows={3}
                  value={summaryOfReviews}
                  onChange={(e) => setSummaryOfReviews(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-emerald-800 block mb-1">Synthesis of Strengths</label>
                  <textarea
                    rows={3}
                    value={synthesisOfStrengths}
                    onChange={(e) => setSynthesisOfStrengths(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-rose-800 block mb-1">Synthesis of Weaknesses</label>
                  <textarea
                    rows={3}
                    value={synthesisOfWeaknesses}
                    onChange={(e) => setSynthesisOfWeaknesses(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-purple-900 block mb-1">
                  Justification & Chair Briefing Note *
                </label>
                <textarea
                  rows={2}
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  className="w-full p-3 rounded-xl border border-purple-200 bg-purple-50/40 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => handleSubmitMeta(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Save Draft
                </button>
                <button
                  onClick={() => handleSubmitMeta(true)}
                  className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-sm transition-all"
                >
                  Submit Official Meta-Review
                </button>
              </div>
            </div>
          </div>

          {/* Committee Discussion Room */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Committee Discussion Thread ({paperDiscussions.length} messages)
                </h3>
              </div>
              <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                Confidential to Reviewers & Chairs
              </span>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {paperDiscussions.map((msg) => (
                <div key={msg.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <span>{msg.authorAlias || msg.authorName}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-normal">
                        {msg.roleBadge}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{msg.message}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handlePostDiscussion} className="flex items-center gap-2">
              <input
                type="text"
                value={newDiscussionMsg}
                onChange={(e) => setNewDiscussionMsg(e.target.value)}
                placeholder="Join the committee discussion regarding reviewer variance..."
                className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
