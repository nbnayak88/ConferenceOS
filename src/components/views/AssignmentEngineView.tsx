import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  Users,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  FileText,
  Plus,
  Trash2,
  Info,
  Layers,
  ArrowRight,
  TrendingUp,
  Percent
} from 'lucide-react';
import { useConference } from '../../context/ConferenceContext';
import {
  calculateMatchScore,
  autoGenerateAssignments,
  MatchingWeights,
  defaultWeights,
} from '../../services/matchingEngine';
import { User, Submission } from '../../types';

export const AssignmentEngineView: React.FC = () => {
  const {
    submissions,
    availableUsers,
    bids,
    conflicts,
    assignments,
    assignReviewer,
    removeAssignment,
    setSelectedPaperId,
    logAudit,
  } = useConference();

  const [weights, setWeights] = useState<MatchingWeights>(defaultWeights);
  const [selectedPaperIdForManual, setSelectedPaperIdForManual] = useState<string>(submissions[0]?.id || '');
  const [isAutoSolving, setIsAutoSolving] = useState(false);
  const [solverSuccessMsg, setSolverSuccessMsg] = useState<string | null>(null);
  const [inspectedMatchData, setInspectedMatchData] = useState<{
    paper: Submission;
    reviewer: User;
    match: any;
  } | null>(null);

  const reviewers = availableUsers.filter((u) => u.assignedPersonas.includes('Reviewer'));

  const currentPaper = submissions.find((s) => s.id === selectedPaperIdForManual) || submissions[0];
  const paperAssignments = assignments.filter((a) => a.paperId === currentPaper?.id);

  // Auto-Solve Assignment Handler
  const handleRunAutoSolver = () => {
    setIsAutoSolving(true);
    setTimeout(() => {
      const generated = autoGenerateAssignments(
        submissions,
        reviewers,
        bids,
        conflicts,
        assignments,
        3,
        weights
      );

      // Apply newly generated
      const newlyAdded = generated.filter((g) => !assignments.some((a) => a.id === g.id));
      newlyAdded.forEach((na) => {
        assignReviewer(na.paperId, na.reviewerId, na.matchScore, na.assignmentType);
      });

      setIsAutoSolving(false);
      setSolverSuccessMsg(`Successfully solved optimal assignments! Added ${newlyAdded.length} new reviewer allocations.`);
      logAudit(
        'AI_REVIEWER_MATCH_EXECUTED',
        'Assignment',
        'solver-engine',
        `Executed multi-factor solver. Added ${newlyAdded.length} review assignments.`
      );
      setTimeout(() => setSolverSuccessMsg(null), 5000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Explainable AI Matching Engine
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Reviewer Assignment & Conflict Resolution Solver
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Multi-factor constraint optimizer: balances semantic domain expertise, author bids, reviewer quotas, and zero-tolerance COI filtering.
          </p>
        </div>

        <button
          id="run-ai-assignment-solver-btn"
          onClick={handleRunAutoSolver}
          disabled={isAutoSolving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/50 transition-all shrink-0"
        >
          <Sparkles className={`w-4 h-4 ${isAutoSolving ? 'animate-spin' : ''}`} />
          <span>{isAutoSolving ? 'Computing Optimal Bipartite Match...' : '1-Click Auto-Assign Solver'}</span>
        </button>
      </div>

      {solverSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{solverSuccessMsg}</span>
        </div>
      )}

      {/* Configurable Multi-Factor Weights Sliders */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-bold text-slate-900">Explainable Optimization Weights</h2>
          </div>
          <button
            onClick={() => setWeights(defaultWeights)}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Reset Defaults
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Domain Expertise</span>
              <span className="text-emerald-700 font-bold">{Math.round(weights.expertise * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.6"
              step="0.05"
              value={weights.expertise}
              onChange={(e) => setWeights({ ...weights, expertise: parseFloat(e.target.value) })}
              className="w-full accent-emerald-600"
            />
            <div className="text-[10px] text-slate-400 mt-1">Research keywords & semantic fit</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Track Topics</span>
              <span className="text-emerald-700 font-bold">{Math.round(weights.topics * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.5"
              step="0.05"
              value={weights.topics}
              onChange={(e) => setWeights({ ...weights, topics: parseFloat(e.target.value) })}
              className="w-full accent-emerald-600"
            />
            <div className="text-[10px] text-slate-400 mt-1">Subject taxonomy alignment</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Paper Keywords</span>
              <span className="text-emerald-700 font-bold">{Math.round(weights.keywords * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.4"
              step="0.05"
              value={weights.keywords}
              onChange={(e) => setWeights({ ...weights, keywords: parseFloat(e.target.value) })}
              className="w-full accent-emerald-600"
            />
            <div className="text-[10px] text-slate-400 mt-1">Direct token similarity</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Reviewer Bids</span>
              <span className="text-emerald-700 font-bold">{Math.round(weights.bidding * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.4"
              step="0.05"
              value={weights.bidding}
              onChange={(e) => setWeights({ ...weights, bidding: parseFloat(e.target.value) })}
              className="w-full accent-emerald-600"
            />
            <div className="text-[10px] text-slate-400 mt-1">Want to Review preferences</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Workload Capacity</span>
              <span className="text-emerald-700 font-bold">{Math.round(weights.workload * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.3"
              step="0.02"
              value={weights.workload}
              onChange={(e) => setWeights({ ...weights, workload: parseFloat(e.target.value) })}
              className="w-full accent-emerald-600"
            />
            <div className="text-[10px] text-slate-400 mt-1">Fair distribution / quota load</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Seniority Signals</span>
              <span className="text-emerald-700 font-bold">{Math.round(weights.otherSignals * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.3"
              step="0.05"
              value={weights.otherSignals}
              onChange={(e) => setWeights({ ...weights, otherSignals: parseFloat(e.target.value) })}
              className="w-full accent-emerald-600"
            />
            <div className="text-[10px] text-slate-400 mt-1">h-index & past reliability</div>
          </div>
        </div>
      </div>

      {/* Interactive Paper Matching Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Submissions Selector */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Submission</h3>
            <span className="text-xs font-semibold text-emerald-700">{submissions.length} Papers</span>
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {submissions.map((paper) => {
              const assignedCount = assignments.filter((a) => a.paperId === paper.id).length;
              const isSelected = paper.id === currentPaper?.id;

              return (
                <div
                  key={paper.id}
                  onClick={() => setSelectedPaperIdForManual(paper.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50/70 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono font-bold text-[11px]">{paper.paperCode}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        assignedCount >= 3
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {assignedCount}/3 Assigned
                    </span>
                  </div>
                  <div className="font-semibold line-clamp-1">{paper.title}</div>
                  <div className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                    {paper.trackName.split('&')[0]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Ranked Candidates for Current Paper */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                  {currentPaper.paperCode}
                </span>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  {currentPaper.trackName}
                </span>
              </div>
              <h2 className="text-sm font-bold text-slate-900 mt-1">{currentPaper.title}</h2>
            </div>

            <button
              onClick={() => setSelectedPaperId(currentPaper.id)}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 whitespace-nowrap"
            >
              View Full Paper &rarr;
            </button>
          </div>

          {/* Currently Assigned Reviewers */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
              <span>Assigned Reviewers ({paperAssignments.length} / 3)</span>
              {paperAssignments.length >= 3 && (
                <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                  Quota Filled
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {paperAssignments.map((asgn) => {
                const rev = reviewers.find((r) => r.id === asgn.reviewerId);
                return (
                  <div
                    key={asgn.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 truncate">{rev?.name || asgn.reviewerId}</span>
                        <button
                          onClick={() => removeAssignment(asgn.id)}
                          className="text-slate-400 hover:text-rose-600 p-0.5"
                          title="Remove assignment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{rev?.affiliation}</div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                      <span className="font-bold text-emerald-700">Fit: {asgn.matchScore?.totalScore || 90}%</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                        {asgn.assignmentType}
                      </span>
                    </div>
                  </div>
                );
              })}

              {Array.from({ length: Math.max(0, 3 - paperAssignments.length) }).map((_, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-300 text-xs flex items-center justify-center text-slate-400 italic"
                >
                  Slot {paperAssignments.length + idx + 1} Open
                </div>
              ))}
            </div>
          </div>

          {/* Ranked Candidate Reviewers List */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Ranked Candidate Reviewers (Sorted by Match Fit)
            </h3>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {reviewers
                .map((rev) => {
                  const bid = bids.find((b) => b.paperId === currentPaper.id && b.reviewerId === rev.id);
                  const currentAssignedCount = assignments.filter((a) => a.reviewerId === rev.id).length;
                  const match = calculateMatchScore(
                    currentPaper,
                    rev,
                    bid,
                    conflicts,
                    currentAssignedCount,
                    weights
                  );
                  const isAssigned = paperAssignments.some((a) => a.reviewerId === rev.id);
                  return { reviewer: rev, bid, currentAssignedCount, match, isAssigned };
                })
                .sort((a, b) => b.match.score.totalScore - a.match.score.totalScore)
                .map(({ reviewer, bid, currentAssignedCount, match, isAssigned }) => (
                  <div
                    key={reviewer.id}
                    className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      match.hasConflict
                        ? 'bg-rose-50/40 border-rose-200'
                        : isAssigned
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{reviewer.name}</span>
                        <span className="text-[10px] text-slate-500">({reviewer.affiliation})</span>
                        {match.hasConflict && (
                          <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                            COI Conflict
                          </span>
                        )}
                        {bid && (
                          <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[10px] font-semibold">
                            Bid: {bid.bid}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
                        <span>
                          Quota: <strong>{currentAssignedCount}</strong> / {reviewer.maxReviewQuota || 4}
                        </span>
                        <span>•</span>
                        <span>h-index: {reviewer.hIndex}</span>
                        <span>•</span>
                        <span className="truncate max-w-xs">
                          Expertise: {(reviewer.expertiseKeywords || []).slice(0, 3).join(', ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {!match.hasConflict ? (
                        <div
                          onClick={() => setInspectedMatchData({ paper: currentPaper, reviewer, match })}
                          className="cursor-pointer text-right group"
                          title="Click to view explainable score breakdown"
                        >
                          <div className="font-bold text-sm text-emerald-700 flex items-center gap-1">
                            <span>{match.score.totalScore}% Fit</span>
                            <Info className="w-3 h-3 text-slate-400 group-hover:text-emerald-600" />
                          </div>
                          <div className="text-[10px] text-slate-400">Explainable Score</div>
                        </div>
                      ) : (
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-rose-600">Disqualified</span>
                        </div>
                      )}

                      {isAssigned ? (
                        <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
                          Assigned
                        </span>
                      ) : (
                        <button
                          disabled={match.hasConflict}
                          onClick={() => assignReviewer(currentPaper.id, reviewer.id, match.score, 'Manual')}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white text-xs font-bold transition-all"
                        >
                          Assign
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Explainable Match Score Modal Popup */}
      {inspectedMatchData && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Explainable Match Score Breakdown</h3>
                <p className="text-xs text-slate-500">
                  {inspectedMatchData.reviewer.name} &rarr; {inspectedMatchData.paper.paperCode}
                </p>
              </div>
              <button
                onClick={() => setInspectedMatchData(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                &times;
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-900 text-sm">Overall Match Score</div>
                  <div className="text-[11px] text-emerald-700">Calculated via multi-factor weighted sum</div>
                </div>
                <div className="text-2xl font-black text-emerald-700">
                  {inspectedMatchData.match.score.totalScore}%
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Sub-Factor Contributions
                </span>
                <div className="space-y-1.5">
                  {[
                    { label: 'Domain Expertise', pts: inspectedMatchData.match.score.expertise, max: Math.round(weights.expertise * 100) },
                    { label: 'Track Topic Overlap', pts: inspectedMatchData.match.score.topics, max: Math.round(weights.topics * 100) },
                    { label: 'Keyword Matching', pts: inspectedMatchData.match.score.keywords, max: Math.round(weights.keywords * 100) },
                    { label: 'Reviewer Bids', pts: inspectedMatchData.match.score.bidding, max: Math.round(weights.bidding * 100) },
                    { label: 'Workload & Quota Available', pts: inspectedMatchData.match.score.workload, max: Math.round(weights.workload * 100) },
                    { label: 'Seniority & Track Record', pts: inspectedMatchData.match.score.otherSignals, max: Math.round(weights.otherSignals * 100) },
                  ].map((factor, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <span className="font-medium text-slate-700">{factor.label}</span>
                      <span className="font-bold text-slate-900">
                        {factor.pts} / {factor.max} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-1">
                  Justification Reasons
                </span>
                <ul className="space-y-1 text-slate-600 list-disc list-inside">
                  {inspectedMatchData.match.score.reasons.map((r: string, idx: number) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
