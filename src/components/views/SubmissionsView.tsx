import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  ExternalLink,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Tag,
  Users,
  Layers,
  ChevronDown,
  X,
  UploadCloud,
  FileCheck
} from 'lucide-react';
import { useConference } from '../../context/ConferenceContext';
import { SubmissionStatus, Author } from '../../types';
import { SubmissionWizardModal } from '../common/SubmissionWizardModal';

export const SubmissionsView: React.FC = () => {
  const {
    conference,
    submissions,
    setSelectedPaperId,
    searchQuery,
    setSearchQuery,
    currentUser,
    activePersona,
  } = useConference();

  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const filteredSubmissions = submissions.filter((paper) => {
    if (selectedTrack !== 'all' && paper.trackId !== selectedTrack) return false;
    if (selectedStatus !== 'all' && paper.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = paper.title.toLowerCase().includes(q);
      const matchCode = paper.paperCode.toLowerCase().includes(q);
      const matchAbstract = paper.abstract.toLowerCase().includes(q);
      const matchAuthor = paper.authors.some(
        (a) => a.name.toLowerCase().includes(q) || a.affiliation.toLowerCase().includes(q)
      );
      const matchTopic = paper.topics.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchCode && !matchAbstract && !matchAuthor && !matchTopic) {
        return false;
      }
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['Paper Code', 'Title', 'Track', 'Authors', 'Status', 'Avg Score', 'Review Count'];
    const rows = filteredSubmissions.map((s) => [
      `"${s.paperCode}"`,
      `"${s.title.replace(/"/g, '""')}"`,
      `"${s.trackName}"`,
      `"${s.authors.map((a) => a.name).join('; ')}"`,
      `"${s.status}"`,
      s.averageScore || 'N/A',
      `${s.reviewCount}/${s.requiredReviews}`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ICSAI_2026_Submissions_Roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Submissions & Papers Repository
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse and manage all {submissions.length} manuscripts registered for {conference.acronym}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            id="submit-manuscript-btn"
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-900/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Manuscript</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, keywords, authors, affiliations..."
              className="w-full pl-9 pr-4 py-2 rounded-lg text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Track Filter */}
          <select
            value={selectedTrack}
            onChange={(e) => setSelectedTrack(e.target.value)}
            className="text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 font-medium"
          >
            <option value="all">All Tracks ({conference.tracks.length})</option>
            {conference.tracks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 font-medium"
          >
            <option value="all">All Lifecycle Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Rebuttal">Rebuttal Active</option>
            <option value="Accepted (Oral)">Accepted (Oral)</option>
            <option value="Accepted (Poster)">Accepted (Poster)</option>
            <option value="Revision Required">Revision Required</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Submissions Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubmissions.map((paper) => (
          <div
            key={paper.id}
            onClick={() => setSelectedPaperId(paper.id)}
            className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                  {paper.paperCode}
                </span>
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
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-snug">
                  {paper.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {paper.abstract}
                </p>
              </div>

              <div className="flex flex-wrap gap-1">
                {paper.keywords.slice(0, 3).map((kw, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5 text-[11px] truncate max-w-[160px]">
                <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{paper.authors[0]?.name} et al.</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {paper.averageScore && (
                  <span className="font-bold text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-blue-600 text-blue-600" />
                    {paper.averageScore}
                  </span>
                )}
                <span className="text-[10px] text-slate-400 font-medium">
                  {paper.reviewCount}/{paper.requiredReviews} revs
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSubmissions.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No submissions found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search keywords.</p>
        </div>
      )}

      {/* Guided Multi-Step Submission Wizard Modal */}
      <SubmissionWizardModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={(created) => {
          setSelectedPaperId(created.id);
        }}
      />
    </div>
  );
};
