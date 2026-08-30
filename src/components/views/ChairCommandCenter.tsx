import React, { useState } from 'react';
import {
  Award,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileText,
  Users,
  Sparkles,
  ArrowRight,
  Filter,
  CheckSquare,
  Square,
  Send,
  BarChart2,
  Layers,
  ChevronRight,
  Zap,
  Mail,
  Tag
} from 'lucide-react';
import { useConference } from '../../context/ConferenceContext';
import { DecisionType } from '../../types';

export const ChairCommandCenter: React.FC = () => {
  const {
    conference,
    submissions,
    reviews,
    metaReviews,
    assignments,
    setSelectedPaperId,
    makeDecision,
    makeBulkDecisions,
    setActiveView,
    logAudit,
  } = useConference();

  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [selectedScoreFilter, setSelectedScoreFilter] = useState<string>('all');
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>([]);
  const [bulkDecisionType, setBulkDecisionType] = useState<DecisionType>('Accept (Oral)');
  const [bulkRemarks, setBulkRemarks] = useState('');
  const [isReminderSent, setIsReminderSent] = useState(false);

  // High-variance detection: find papers with score span >= 4
  const highVariancePapers = submissions.filter((paper) => {
    const paperRevs = reviews.filter((r) => r.paperId === paper.id);
    if (paperRevs.length < 2) return false;
    const scores = paperRevs.map((r) => r.scores.overallScore);
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    return max - min >= 4;
  });

  // Calculate KPIs
  const totalSubs = submissions.length;
  const acceptedSubs = submissions.filter((s) => s.status.includes('Accepted')).length;
  const acceptanceRate = ((acceptedSubs / Math.max(1, totalSubs)) * 100).toFixed(1);
  const totalReviewsNeeded = totalSubs * 3;
  const reviewsDone = reviews.filter((r) => !r.isDraft).length;
  const reviewCompletionRate = ((reviewsDone / Math.max(1, totalReviewsNeeded)) * 100).toFixed(1);
  const cameraReadyVerified = submissions.filter((s) => s.cameraReady?.status === 'Verified').length;

  // Filtered submissions for decision table
  const filteredSubmissions = submissions.filter((paper) => {
    if (selectedTrack !== 'all' && paper.trackId !== selectedTrack) return false;
    if (selectedScoreFilter === 'top' && (!paper.averageScore || paper.averageScore < 8.0)) return false;
    if (selectedScoreFilter === 'borderline' && (!paper.averageScore || paper.averageScore < 6.0 || paper.averageScore >= 8.0)) return false;
    if (selectedScoreFilter === 'low' && (!paper.averageScore || paper.averageScore >= 6.0)) return false;
    return true;
  });

  const toggleSelectPaper = (id: string) => {
    setSelectedPaperIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedPaperIds.length === filteredSubmissions.length) {
      setSelectedPaperIds([]);
    } else {
      setSelectedPaperIds(filteredSubmissions.map((p) => p.id));
    }
  };

  const handleApplyBulkDecisions = () => {
    if (selectedPaperIds.length === 0) return;
    const decisionsList = selectedPaperIds.map((id) => ({
      paperId: id,
      decision: bulkDecisionType,
      remarks: bulkRemarks || `Batch Chair Decision: ${bulkDecisionType}`,
    }));
    makeBulkDecisions(decisionsList);
    setSelectedPaperIds([]);
    setBulkRemarks('');
  };

  const handleSendReminderBatch = () => {
    setIsReminderSent(true);
    logAudit('EMAIL_BROADCAST_SENT', 'Review', 'batch-reminder', 'Sent automated urgent reminder email to 4 reviewers with overdue assignments.');
    setTimeout(() => setIsReminderSent(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Chair Command Center
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-emerald-400 font-semibold">{conference.name}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Program & Decision Executive Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Real-time pipeline analytics, review consensus monitor, automated conflict checks, and bulk decision workflows.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveView('topics')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm border border-white/10 transition-all"
            title="Manage custom topics and scientific taxonomy"
          >
            <Tag className="w-4 h-4 text-teal-400" />
            <span>Topics & Taxonomy</span>
          </button>
          <button
            onClick={() => setActiveView('assignments')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm border border-white/10 transition-all"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Matching Engine</span>
          </button>
          <button
            onClick={() => setActiveView('schedule')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-900/40 transition-all"
          >
            <Layers className="w-4 h-4" />
            <span>Program Builder</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500">Submissions</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{totalSubs}</div>
          <div className="mt-1 text-[10px] text-slate-400">across 5 tracks</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500">Acceptance Rate</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">{acceptanceRate}%</div>
          <div className="mt-1 text-[10px] text-emerald-700 font-medium">{acceptedSubs} Accepted</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500">Reviews Done</div>
          <div className="mt-1 text-2xl font-bold text-blue-600">{reviewsDone} / 90</div>
          <div className="mt-1 text-[10px] text-blue-700 font-medium">{reviewCompletionRate}% complete</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500">Overdue Reviews</div>
          <div className="mt-1 text-2xl font-bold text-rose-600">4</div>
          <div className="mt-1 text-[10px] text-rose-700 font-medium">&gt;48h past deadline</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500">High Variance</div>
          <div className="mt-1 text-2xl font-bold text-purple-600">{highVariancePapers.length}</div>
          <div className="mt-1 text-[10px] text-purple-700 font-medium">Needs Chair Discussion</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500">Camera-Ready</div>
          <div className="mt-1 text-2xl font-bold text-teal-600">{cameraReadyVerified}</div>
          <div className="mt-1 text-[10px] text-teal-700 font-medium">Verified IEEE/ACM</div>
        </div>
      </div>

      {/* Urgent Attention Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Discrepant Reviews & High Variance Panel */}
        <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-950 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-purple-600" />
              <span>Score Variance & Committee Disagreement</span>
            </div>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-200 text-purple-900">
              Spread &ge; 4.0
            </span>
          </div>

          <p className="text-xs text-purple-900 leading-relaxed">
            The following submissions have polar opposite reviewer recommendations requiring Meta-Reviewer synthesis and Chair arbitration before decision notification.
          </p>

          <div className="space-y-2">
            {highVariancePapers.map((paper) => {
              const paperRevs = reviews.filter((r) => r.paperId === paper.id);
              return (
                <div
                  key={paper.id}
                  className="p-3 bg-white rounded-xl border border-purple-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-purple-900">{paper.paperCode}</span>
                      <span className="font-semibold text-slate-900 truncate max-w-xs">{paper.title}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span>Scores:</span>
                      {paperRevs.map((r, idx) => (
                        <span
                          key={idx}
                          className={`font-bold px-1.5 py-0.2 rounded ${
                            r.scores.overallScore >= 8
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.scores.overallScore <= 4
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {r.scores.overallScore}
                        </span>
                      ))}
                      <span>• Track: {paper.trackName.split('&')[0]}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        setSelectedPaperId(paper.id);
                        setActiveView('meta-reviews');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-all"
                    >
                      Open Discussion
                    </button>
                    <button
                      onClick={() => setSelectedPaperId(paper.id)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Overdue Review Expediter */}
        <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Overdue Review Expediter</span>
            </div>
            <button
              onClick={handleSendReminderBatch}
              disabled={isReminderSent}
              className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-700 hover:bg-amber-800 text-white shadow-sm transition-all"
            >
              <Mail className="w-3 h-3" />
              <span>{isReminderSent ? 'Sent Reminders!' : 'Send 2nd Reminder Batch'}</span>
            </button>
          </div>

          <p className="text-xs text-amber-900 leading-relaxed">
            4 peer reviews have exceeded the submission deadline by 48+ hours. Automated notifications can be triggered directly with escalation to Track Chairs.
          </p>

          <div className="space-y-2">
            {[
              { code: '#ICSAI-04', reviewer: 'Dr. Sophie Lin (NUS)', daysLate: 3, track: 'Applied AI' },
              { code: '#ICSAI-09', reviewer: 'Dr. David O\'Connor (TCD)', daysLate: 4, track: 'AI Ethics' },
              { code: '#ICSAI-12', reviewer: 'Dr. Karen Wilson (Cambridge)', daysLate: 2, track: 'Core ML' },
              { code: '#ICSAI-18', reviewer: 'Dr. Liam Gallagher (Melbourne)', daysLate: 3, track: 'Green HW' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-white rounded-xl border border-amber-200 text-xs flex items-center justify-between shadow-xs"
              >
                <div>
                  <div className="font-semibold text-slate-900">
                    <span className="font-mono text-amber-900 font-bold mr-1.5">{item.code}</span>
                    {item.reviewer}
                  </div>
                  <div className="text-[10px] text-slate-500">Track: {item.track}</div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                  {item.daysLate}d Overdue
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bulk Decision & Program Allocation Toolbar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Program Decision Workbench</h2>
            <p className="text-xs text-slate-500">
              Filter by track, score threshold, and execute single or bulk decisions.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Track Filter */}
            <select
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
              className="text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 font-medium"
            >
              <option value="all">All Tracks (5)</option>
              {conference.tracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            {/* Score Filter */}
            <select
              value={selectedScoreFilter}
              onChange={(e) => setSelectedScoreFilter(e.target.value)}
              className="text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 font-medium"
            >
              <option value="all">All Scores</option>
              <option value="top">Top Ranked (&ge; 8.0)</option>
              <option value="borderline">Borderline (6.0 - 7.9)</option>
              <option value="low">Low Score (&lt; 6.0)</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Controls */}
        {selectedPaperIds.length > 0 && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
              <CheckSquare className="w-4 h-4 text-amber-700" />
              <span>{selectedPaperIds.length} submissions selected for bulk action</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              <select
                value={bulkDecisionType}
                onChange={(e) => setBulkDecisionType(e.target.value as DecisionType)}
                className="text-xs p-1.5 rounded-lg border border-slate-300 bg-white font-medium"
              >
                <option value="Accept (Oral)">Accept (Oral)</option>
                <option value="Accept (Poster)">Accept (Poster)</option>
                <option value="Accept with Minor Revision">Accept with Minor Revision</option>
                <option value="Reject">Reject</option>
              </select>

              <input
                type="text"
                value={bulkRemarks}
                onChange={(e) => setBulkRemarks(e.target.value)}
                placeholder="Optional batch remarks..."
                className="text-xs p-1.5 rounded-lg border border-slate-300 bg-white max-w-xs"
              />

              <button
                onClick={handleApplyBulkDecisions}
                className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-sm transition-all"
              >
                Apply Decisions ({selectedPaperIds.length})
              </button>
            </div>
          </div>
        )}

        {/* Submissions Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3 w-10">
                  <button onClick={toggleSelectAll} className="p-1 text-slate-500 hover:text-slate-900">
                    {selectedPaperIds.length === filteredSubmissions.length && filteredSubmissions.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="p-3">Paper</th>
                <th className="p-3">Track</th>
                <th className="p-3">Reviews</th>
                <th className="p-3">Avg Score</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredSubmissions.map((paper) => {
                const isSelected = selectedPaperIds.includes(paper.id);
                return (
                  <tr
                    key={paper.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelected ? 'bg-emerald-50/40' : ''
                    }`}
                  >
                    <td className="p-3">
                      <button
                        onClick={() => toggleSelectPaper(paper.id)}
                        className="p-1 text-slate-500 hover:text-slate-900"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="p-3 max-w-sm">
                      <div
                        onClick={() => setSelectedPaperId(paper.id)}
                        className="font-semibold text-slate-900 hover:text-emerald-600 cursor-pointer line-clamp-1"
                      >
                        <span className="font-mono text-emerald-800 font-bold mr-1.5">{paper.paperCode}</span>
                        {paper.title}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {paper.authors.map((a) => a.name).join(', ')}
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {paper.trackName.split('&')[0]}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="text-xs font-semibold">
                        {paper.reviewCount} / {paper.requiredReviews}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {paper.averageScore ? (
                        <span
                          className={`font-bold px-2 py-0.5 rounded ${
                            paper.averageScore >= 8.0
                              ? 'bg-emerald-100 text-emerald-800'
                              : paper.averageScore >= 6.0
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {paper.averageScore}/10
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Pending</span>
                      )}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
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
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedPaperId(paper.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
