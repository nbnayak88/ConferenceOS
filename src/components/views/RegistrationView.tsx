import React, { useState } from 'react';
import {
  Users,
  QrCode,
  CheckCircle,
  CreditCard,
  Search,
  Filter,
  Plus,
  Download,
  CheckSquare,
  Sparkles,
  Ticket,
  Printer
} from 'lucide-react';
import { useConference } from '../../context/ConferenceContext';
import { Registration } from '../../types';

export const RegistrationView: React.FC = () => {
  const { registrations, checkInAttendee, conference } = useConference();

  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [selectedBadge, setSelectedBadge] = useState<Registration | null>(null);

  const filteredRegistrations = registrations.filter((reg) => {
    if (tierFilter !== 'all' && reg.tier !== tierFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = reg.userName.toLowerCase().includes(q);
      const matchEmail = reg.userEmail.toLowerCase().includes(q);
      const matchAff = reg.userAffiliation.toLowerCase().includes(q);
      const matchBadge = reg.badgeCode.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchAff && !matchBadge) return false;
    }
    return true;
  });

  const checkedInCount = registrations.filter((r) => r.checkedIn).length;
  const totalRevenue = registrations.reduce((acc, r) => acc + (r.paymentStatus === 'Paid' ? r.amountPaid : 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Registration & Access Control
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Attendee Registrations & Badge Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Manage tier allocations, live venue check-ins, contactless badge credentials, and payment receipts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-400">Total Registration Revenue</div>
            <div className="text-xl font-bold text-emerald-400">${totalRevenue.toLocaleString()} USD</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold">Total Registered</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{registrations.length}</div>
          <div className="text-[10px] text-slate-400">Target: 250 delegates</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold">Checked In On-Site</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {checkedInCount} / {registrations.length}
          </div>
          <div className="text-[10px] text-emerald-700 font-medium">
            {Math.round((checkedInCount / Math.max(1, registrations.length)) * 100)}% attendance rate
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold">Author Registrations</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {registrations.filter((r) => r.tier === 'Author (Full)').length}
          </div>
          <div className="text-[10px] text-blue-700 font-medium">Camera-Ready linked</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold">Virtual Passes</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">
            {registrations.filter((r) => r.tier === 'Virtual Attendee').length}
          </div>
          <div className="text-[10px] text-purple-700 font-medium">Live streaming active</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search attendee by name, email, institution, or badge code..."
            className="w-full pl-9 pr-4 py-2 rounded-lg text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 font-medium"
          >
            <option value="all">All Registration Tiers</option>
            <option value="Author (Full)">Author (Full)</option>
            <option value="Standard Delegate">Standard Delegate</option>
            <option value="Student Delegate">Student Delegate</option>
            <option value="Virtual Attendee">Virtual Attendee</option>
            <option value="VIP / Keynote">VIP / Keynote</option>
          </select>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3">Badge Code</th>
              <th className="p-3">Attendee</th>
              <th className="p-3">Tier</th>
              <th className="p-3">Affiliation / Country</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Check-In</th>
              <th className="p-3 text-right">Badge Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {filteredRegistrations.map((reg) => (
              <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-3 whitespace-nowrap">
                  <span className="font-mono font-bold text-slate-900 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                    {reg.badgeCode}
                  </span>
                </td>

                <td className="p-3 whitespace-nowrap">
                  <div className="font-bold text-slate-900">{reg.userName}</div>
                  <div className="text-[10px] text-slate-400">{reg.userEmail}</div>
                </td>

                <td className="p-3 whitespace-nowrap">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      reg.tier.includes('Author')
                        ? 'bg-blue-100 text-blue-800'
                        : reg.tier.includes('VIP')
                        ? 'bg-purple-100 text-purple-800'
                        : reg.tier.includes('Student')
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {reg.tier}
                  </span>
                </td>

                <td className="p-3 max-w-xs truncate">
                  <div>{reg.userAffiliation}</div>
                </td>

                <td className="p-3 whitespace-nowrap">
                  <span className="font-bold text-slate-900">${reg.amountPaid}</span>
                  <span className="ml-1 text-[10px] text-emerald-700 font-medium bg-emerald-50 px-1 py-0.2 rounded">
                    {reg.paymentStatus}
                  </span>
                </td>

                <td className="p-3 whitespace-nowrap">
                  <button
                    onClick={() => checkInAttendee(reg.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      reg.checkedIn
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <CheckCircle className={`w-3.5 h-3.5 ${reg.checkedIn ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{reg.checkedIn ? 'Checked In' : 'Check In'}</span>
                  </button>
                </td>

                <td className="p-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => setSelectedBadge(reg)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all inline-flex"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Badge Preview</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Badge Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Official Delegate Badge
              </span>
              <button
                onClick={() => setSelectedBadge(null)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="p-6 text-center space-y-4">
              <div className="text-xs font-bold text-slate-500">{conference.name}</div>
              <div className="text-lg font-black text-slate-900">{selectedBadge.userName}</div>
              <div className="text-xs text-slate-600 font-medium">{selectedBadge.userAffiliation}</div>

              <div className="py-2">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    selectedBadge.tier.includes('Author')
                      ? 'bg-blue-600 text-white'
                      : selectedBadge.tier.includes('VIP')
                      ? 'bg-purple-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {selectedBadge.tier}
                </span>
              </div>

              {/* QR Code Placeholder Simulation */}
              <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 inline-block mx-auto">
                <QrCode className="w-28 h-28 text-slate-900" />
                <div className="font-mono text-[10px] font-bold text-slate-600 mt-1">
                  {selectedBadge.badgeCode}
                </div>
              </div>

              <div className="text-[10px] text-slate-400">
                Lanyard RFID Access Enabled • All Technical Sessions & Banquets
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Physical Badge</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
