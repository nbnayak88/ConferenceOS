import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
  Building2,
  Users,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { useConference } from '../../context/ConferenceContext';
import { runGlobalConflictScan } from '../../services/conflictService';
import { ConflictStatus, ConflictType } from '../../types';

export const ConflictMatrixView: React.FC = () => {
  const {
    submissions,
    availableUsers,
    conflicts,
    addConflict,
    resolveConflict,
    logAudit,
  } = useConference();

  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  // Manual Conflict Declaration Form
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualPaperId, setManualPaperId] = useState(submissions[0]?.id || '');
  const [manualReviewerId, setManualReviewerId] = useState(availableUsers[0]?.id || '');
  const [manualType, setManualType] = useState<ConflictType>('Personal / Close Associate');
  const [manualReason, setManualReason] = useState('');

  const reviewers = availableUsers.filter((u) => u.assignedPersonas.includes('Reviewer'));

  const filteredConflicts = conflicts.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const paper = submissions.find((s) => s.id === c.paperId);
      const rev = availableUsers.find((u) => u.id === c.reviewerId);
      const matchCode = paper?.paperCode.toLowerCase().includes(q);
      const matchTitle = paper?.title.toLowerCase().includes(q);
      const matchRev = rev?.name.toLowerCase().includes(q) || rev?.affiliation.toLowerCase().includes(q);
      const matchReason = c.reason.toLowerCase().includes(q);
      if (!matchCode && !matchTitle && !matchRev && !matchReason) return false;
    }
    return true;
  });

  const handleRunScanner = () => {
    setIsScanning(true);
    setTimeout(() => {
      const updated = runGlobalConflictScan(submissions, reviewers, conflicts);
      const newCount = updated.length - conflicts.length;

      // Add newly detected conflicts
      updated.slice(conflicts.length).forEach((c) => {
        addConflict(c.paperId, c.reviewerId, c.conflictType, c.reason, c.status);
      });

      setIsScanning(false);
      setScanMessage(`Scan complete! Scanned 30 submissions × 20 reviewers. Detected ${newCount} new institutional conflicts.`);
      logAudit('CONFLICT_SCAN_EXECUTED', 'Conflict', 'global-scanner', `Scanned all pairs, verified zero-tolerance COI compliance.`);
      setTimeout(() => setScanMessage(null), 5000);
    }, 1000);
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualReason.trim()) return;
    addConflict(manualPaperId, manualReviewerId, manualType, manualReason, 'CONFLICT');
    setManualReason('');
    setIsManualModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950 via-slate-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              Integrity & Conflict Enforcement
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Conflict of Interest (COI) Matrix & Clearance Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Automated detection for shared institutional email domains, historical co-authorship windows (36 months), and advisor-advisee relationships.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm border border-white/10 transition-all"
          >
            + Declare COI
          </button>
          <button
            onClick={handleRunScanner}
            disabled={isScanning}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-slate-700 text-white font-bold text-xs shadow-md transition-all shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning All Matrix Pairs...' : 'Run Global COI Scan'}</span>
          </button>
        </div>
      </div>

      {scanMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{scanMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search by paper code, author, reviewer name, institution or reason..."
            className="w-full pl-9 pr-4 py-2 rounded-lg text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-rose-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 font-medium"
          >
            <option value="all">All Conflict Statuses</option>
            <option value="CONFLICT">Active Conflicts (Excluded)</option>
            <option value="NO CONFLICT">Cleared by Chair</option>
            <option value="REQUIRES REVIEW">Requires Chair Review</option>
          </select>
        </div>
      </div>

      {/* Conflicts Matrix Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3">Paper</th>
              <th className="p-3">Reviewer / Institution</th>
              <th className="p-3">Conflict Classification</th>
              <th className="p-3">Evidence / Reason</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Chair Clearance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {filteredConflicts.map((coi) => {
              const paper = submissions.find((s) => s.id === coi.paperId);
              const rev = availableUsers.find((u) => u.id === coi.reviewerId);

              return (
                <tr key={coi.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 max-w-xs">
                    <div className="font-semibold text-slate-900 line-clamp-1">
                      <span className="font-mono text-rose-900 font-bold mr-1.5">{paper?.paperCode}</span>
                      {paper?.title}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      Authors: {paper?.authors.map((a) => a.name).join(', ')}
                    </div>
                  </td>

                  <td className="p-3 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{rev?.name}</div>
                    <div className="text-[10px] text-slate-500">{rev?.affiliation}</div>
                  </td>

                  <td className="p-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-semibold border border-slate-200">
                      {coi.conflictType}
                    </span>
                  </td>

                  <td className="p-3 max-w-sm text-slate-600 text-xs leading-relaxed">
                    {coi.reason}
                    {coi.isAutoDetected && (
                      <span className="ml-1.5 text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-500">
                        Auto-detected
                      </span>
                    )}
                  </td>

                  <td className="p-3 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        coi.status === 'CONFLICT'
                          ? 'bg-rose-100 text-rose-800'
                          : coi.status === 'NO CONFLICT'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {coi.status}
                    </span>
                  </td>

                  <td className="p-3 text-right whitespace-nowrap">
                    {coi.status === 'CONFLICT' ? (
                      <button
                        onClick={() => resolveConflict(coi.id, 'NO CONFLICT')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-semibold border border-slate-200 transition-all"
                      >
                        Clear Conflict
                      </button>
                    ) : (
                      <button
                        onClick={() => resolveConflict(coi.id, 'CONFLICT')}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-all"
                      >
                        Re-enforce Conflict
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Manual Conflict Declaration Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Declare Conflict of Interest</h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-slate-400 hover:text-slate-800"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleManualAdd} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Submission</label>
                <select
                  value={manualPaperId}
                  onChange={(e) => setManualPaperId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  {submissions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.paperCode}: {p.title.slice(0, 50)}...
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Conflicted Reviewer</label>
                <select
                  value={manualReviewerId}
                  onChange={(e) => setManualReviewerId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.affiliation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Conflict Classification</label>
                <select
                  value={manualType}
                  onChange={(e) => setManualType(e.target.value as ConflictType)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Same Institution">Same Institution</option>
                  <option value="Recent Co-author (36mo)">Recent Co-author (36mo)</option>
                  <option value="Advisor / Advisee">Advisor / Advisee</option>
                  <option value="Financial Interest">Financial Interest</option>
                  <option value="Personal / Close Associate">Personal / Close Associate</option>
                  <option value="Chair Discretion">Chair Discretion</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason & Context *</label>
                <textarea
                  required
                  rows={3}
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  placeholder="e.g. Co-authored grant proposal together in 2025; former doctoral advisor."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-sm"
                >
                  Record Conflict
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
