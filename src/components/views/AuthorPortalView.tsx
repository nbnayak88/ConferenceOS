import React, { useState } from 'react';
import {
  FileText,
  Edit,
  CheckCircle,
  Clock,
  Download,
  ShieldCheck,
  Send,
  Sparkles,
  AlertCircle,
  FileCheck2,
  ExternalLink,
  ChevronRight,
  Plus,
  UploadCloud
} from 'lucide-react';
import { useConference } from '../../context/ConferenceContext';
import { SubmissionWizardModal } from '../common/SubmissionWizardModal';

export const AuthorPortalView: React.FC = () => {
  const {
    currentUser,
    submissions,
    reviews,
    submitRebuttal,
    submitCameraReady,
    signCopyright,
    setSelectedPaperId,
    conference,
  } = useConference();

  // Find papers where currentUser is an author or primary contact
  const myPapers = submissions.filter(
    (s) =>
      s.primaryContactId === currentUser.id ||
      s.authors.some(
        (a) =>
          a.id === currentUser.id ||
          a.email.toLowerCase() === currentUser.email.toLowerCase()
      )
  );

  const [selectedPaperId, setLocalSelectedPaperId] = useState<string>(myPapers[0]?.id || submissions[0]?.id);
  const [rebuttalInput, setRebuttalInput] = useState('');
  const [isCopyrightModalOpen, setIsCopyrightModalOpen] = useState(false);
  const [isSubmissionWizardOpen, setIsSubmissionWizardOpen] = useState(false);
  const [signatureName, setSignatureName] = useState(currentUser.name);
  const [licenseType, setLicenseType] = useState('IEEE / ACM Standard Open Access');

  const currentPaper = submissions.find((s) => s.id === selectedPaperId) || myPapers[0] || submissions[0];
  const paperReviews = reviews.filter((r) => r.paperId === currentPaper?.id && !r.isDraft);

  const handleRebuttalSubmit = () => {
    if (!rebuttalInput.trim() || !currentPaper) return;
    submitRebuttal(currentPaper.id, rebuttalInput);
    setRebuttalInput('');
  };

  const handleCameraReadyUpload = () => {
    if (!currentPaper) return;
    submitCameraReady(currentPaper.id, 'https://camera-ready.icsai2026.org/camera_ready.pdf', 10);
  };

  const handleSignCopyright = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPaper || !signatureName.trim()) return;
    signCopyright(currentPaper.id, signatureName, licenseType);
    setIsCopyrightModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-950 via-slate-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Author Portal
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-teal-400 font-semibold">{currentUser.name} ({currentUser.affiliation})</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Manuscript Status & Rebuttal Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Track peer review lifecycle, submit structured rebuttals to reviewers, verify Camera-Ready formatting, and execute IEEE/ACM copyright transfer.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSubmissionWizardOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Submit New Manuscript</span>
          </button>
          <button
            onClick={() => setSelectedPaperId(currentPaper.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md transition-all shrink-0"
          >
            <FileText className="w-4 h-4" />
            <span>View Manuscript PDF</span>
          </button>
        </div>
      </div>

      {/* Grid: Author's Manuscripts vs Selected Manuscript Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: My Manuscripts */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Your Submissions ({myPapers.length > 0 ? myPapers.length : 'Viewing All'})
            </h3>
            <button
              onClick={() => setIsSubmissionWizardOpen(true)}
              className="text-[11px] font-bold text-teal-600 hover:text-teal-800 flex items-center gap-0.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>

          <button
            onClick={() => setIsSubmissionWizardOpen(true)}
            className="w-full p-3 rounded-xl border-2 border-dashed border-teal-300 bg-teal-50/50 hover:bg-teal-100/60 text-teal-900 flex items-center justify-center gap-2 font-bold text-xs transition-all shadow-xs"
          >
            <UploadCloud className="w-4 h-4 text-teal-600" />
            <span>Launch Submission Wizard</span>
          </button>

          <div className="space-y-2">
            {(myPapers.length > 0 ? myPapers : submissions.slice(0, 6)).map((paper) => {
              const isSelected = paper.id === currentPaper?.id;
              return (
                <div
                  key={paper.id}
                  onClick={() => setLocalSelectedPaperId(paper.id)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50/70 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono font-bold text-[11px]">{paper.paperCode}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        paper.status.includes('Accepted')
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : paper.status === 'Rebuttal'
                          ? 'bg-purple-500/20 text-purple-300'
                          : paper.status === 'Rejected'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {paper.status}
                    </span>
                  </div>
                  <div className="font-semibold line-clamp-1">{paper.title}</div>
                  <div className={`text-[10px] truncate mt-1 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                    Track: {paper.trackName.split('&')[0]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Paper Console */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
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
                <h2 className="text-base font-bold text-slate-900 mt-1.5">{currentPaper.title}</h2>
              </div>

              <div className="text-right">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                    currentPaper.status.includes('Accepted')
                      ? 'bg-emerald-100 text-emerald-800'
                      : currentPaper.status === 'Rebuttal'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {currentPaper.status}
                </span>
              </div>
            </div>

            {/* Decision Status if decided */}
            {currentPaper.decision && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Official Decision: {currentPaper.decision.decision}
                  </span>
                  <span className="text-[10px] text-emerald-700">
                    Notified on {new Date(currentPaper.decision.decidedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-emerald-800">{currentPaper.decision.remarks}</p>
              </div>
            )}

            {/* Double-Blind Peer Review Feedback */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Peer Reviewer Feedback ({paperReviews.length} Reviews Received)
              </h3>

              <div className="space-y-3">
                {paperReviews.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 border border-dashed rounded-xl">
                    Reviews are currently undergoing committee compilation and will be released upon rebuttal window opening.
                  </div>
                ) : (
                  paperReviews.map((rev) => (
                    <div key={rev.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{rev.reviewerAlias}</span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          Double-Blind Masked
                        </span>
                      </div>

                      <div>
                        <span className="font-bold text-emerald-800 block mb-0.5">Strengths:</span>
                        <p className="text-slate-700 leading-relaxed">{rev.strengths}</p>
                      </div>

                      <div>
                        <span className="font-bold text-rose-800 block mb-0.5">Weaknesses:</span>
                        <p className="text-slate-700 leading-relaxed">{rev.weaknesses}</p>
                      </div>

                      {rev.questionsToAuthors && (
                        <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200">
                          <span className="font-bold text-blue-900 block mb-0.5">
                            Specific Question for Rebuttal:
                          </span>
                          <p className="text-blue-950">{rev.questionsToAuthors}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Rebuttal Submission Block */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                  <Edit className="w-4 h-4 text-purple-600" />
                  Author Rebuttal Response (1,000 words max)
                </span>
                {currentPaper.hasRebuttal && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                    Rebuttal Recorded
                  </span>
                )}
              </div>

              {currentPaper.hasRebuttal ? (
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-950 whitespace-pre-wrap leading-relaxed">
                  {currentPaper.rebuttalText}
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    rows={5}
                    value={rebuttalInput}
                    onChange={(e) => setRebuttalInput(e.target.value)}
                    placeholder="Address the specific questions raised by Reviewer 1, 2, and 3 regarding baselines, wall-clock timing, or ablation clarity..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:outline-none"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleRebuttalSubmit}
                      disabled={!rebuttalInput.trim()}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 text-white text-xs font-bold shadow-sm transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Official Rebuttal</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Camera-Ready & Copyright Action Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-emerald-600" />
                    Camera-Ready PDF
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800">
                    {currentPaper.cameraReady?.status || 'Pending'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Submit final publication-ready PDF with unblinded author affiliations and acknowledgments.
                </p>
                <button
                  onClick={handleCameraReadyUpload}
                  className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                >
                  {currentPaper.cameraReady ? 'Re-upload Camera-Ready' : 'Upload Final PDF'}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-600" />
                    IEEE/ACM Copyright
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-cyan-100 text-cyan-800">
                    {currentPaper.copyright?.signed ? 'Signed' : 'Unsigned'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Complete legally binding electronic copyright assignment for proceedings publication.
                </p>
                <button
                  onClick={() => setIsCopyrightModalOpen(true)}
                  className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold shadow-xs"
                >
                  {currentPaper.copyright?.signed ? 'View Signed Form' : 'Sign Electronic Transfer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Signing Modal */}
      {isCopyrightModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">IEEE/ACM Electronic Copyright Transfer</h3>
              <button
                onClick={() => setIsCopyrightModalOpen(false)}
                className="text-slate-400 hover:text-slate-800"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSignCopyright} className="p-5 space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 leading-relaxed text-[11px]">
                By entering your full legal name below, you certify on behalf of all co-authors that this manuscript represents original research and transfer publication rights to the ICSAI 2026 Proceedings.
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Paper Code & Title</label>
                <div className="p-2 bg-slate-100 rounded-lg text-slate-800 font-semibold">
                  {currentPaper.paperCode}: {currentPaper.title}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">License Type</label>
                <select
                  value={licenseType}
                  onChange={(e) => setLicenseType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="IEEE / ACM Standard Open Access (CC-BY 4.0)">
                    Open Access (CC-BY 4.0)
                  </option>
                  <option value="Standard IEEE Copyright Transfer Agreement">
                    Standard Publisher Copyright Transfer
                  </option>
                  <option value="US Government Employee Exemption">US Government Employee Exemption</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Electronic Signature (Full Name) *
                </label>
                <input
                  type="text"
                  required
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  placeholder="e.g. Dr. Elena Vance"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-serif text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCopyrightModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold shadow-sm"
                >
                  Submit Digital Signature
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Multi-Step Submission Wizard Modal */}
      <SubmissionWizardModal
        isOpen={isSubmissionWizardOpen}
        onClose={() => setIsSubmissionWizardOpen(false)}
        onSuccess={(newSub) => {
          setLocalSelectedPaperId(newSub.id);
        }}
      />
    </div>
  );
};
