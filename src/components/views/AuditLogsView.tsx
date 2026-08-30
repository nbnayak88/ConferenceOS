import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Clock,
  User,
  CheckCircle2,
  FileText,
  Lock,
  Layers
} from 'lucide-react';
import { useConference } from '../../context/ConferenceContext';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useConference();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filteredLogs = auditLogs.filter((log) => {
    if (actionFilter !== 'all' && !log.action.includes(actionFilter)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchActor = log.actorName.toLowerCase().includes(q);
      const matchAction = log.action.toLowerCase().includes(q);
      const matchDetails = log.details.toLowerCase().includes(q);
      const matchEntity = log.entityType.toLowerCase().includes(q);
      if (!matchActor && !matchAction && !matchDetails && !matchEntity) return false;
    }
    return true;
  });

  const handleExportAuditCSV = () => {
    const headers = ['Timestamp', 'Actor', 'Role', 'Action', 'Entity Type', 'Entity ID', 'Details'];
    const rows = filteredLogs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.actorName}"`,
      `"${l.actorRole}"`,
      `"${l.action}"`,
      `"${l.entityType}"`,
      `"${l.entityId}"`,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ConferenceOS_Audit_Ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Immutable Compliance Ledger
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            System Audit Trail & Governance Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Tamper-evident audit log tracking every decision, reviewer assignment, conflict override, and author communication.
          </p>
        </div>

        <button
          onClick={handleExportAuditCSV}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm border border-white/10 transition-all shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail by actor, action type, entity ID, or description..."
            className="w-full pl-9 pr-4 py-2 rounded-lg text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 font-medium"
          >
            <option value="all">All Actions</option>
            <option value="DECISION">Decisions</option>
            <option value="ASSIGNMENT">Assignments</option>
            <option value="CONFLICT">Conflict Operations</option>
            <option value="REVIEW">Reviews</option>
            <option value="SUBMISSION">Submissions</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3">Timestamp</th>
              <th className="p-3">Actor / Role</th>
              <th className="p-3">Action</th>
              <th className="p-3">Entity</th>
              <th className="p-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700 font-mono text-[11px]">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-3 whitespace-nowrap text-slate-400 font-sans text-xs">
                  {new Date(log.timestamp).toLocaleString()}
                </td>

                <td className="p-3 whitespace-nowrap font-sans">
                  <div className="font-bold text-slate-900">{log.actorName}</div>
                  <div className="text-[10px] text-slate-400">{log.actorRole}</div>
                </td>

                <td className="p-3 whitespace-nowrap">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.action.includes('DECISION')
                        ? 'bg-amber-100 text-amber-800'
                        : log.action.includes('ASSIGN')
                        ? 'bg-blue-100 text-blue-800'
                        : log.action.includes('CONFLICT')
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {log.action}
                  </span>
                </td>

                <td className="p-3 whitespace-nowrap text-slate-600">
                  <span className="font-bold text-slate-800">{log.entityType}</span>:{' '}
                  <span className="text-slate-500">{log.entityId}</span>
                </td>

                <td className="p-3 font-sans text-xs text-slate-700 max-w-md">
                  {log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
