import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  Award,
  Globe,
  Leaf,
  Users,
  CheckCircle,
  FileText,
  DollarSign,
  Zap,
} from 'lucide-react';
import { useConference } from '../../context/ConferenceContext';

export const AnalyticsView: React.FC = () => {
  const { conference, submissions, reviews, registrations } = useConference();

  // Track breakdown data
  const trackData = conference.tracks.map((t) => {
    const subs = submissions.filter((s) => s.trackId === t.id);
    const accepted = subs.filter((s) => s.status.includes('Accepted')).length;
    return {
      name: t.shortCode,
      fullName: t.name,
      submissions: subs.length,
      accepted: accepted,
      acceptanceRate: Math.round((accepted / Math.max(1, subs.length)) * 100),
    };
  });

  // Score distribution data
  const scoreBuckets = [
    { scoreRange: '1-3', count: reviews.filter((r) => r.scores.overallScore <= 3).length },
    { scoreRange: '4-5', count: reviews.filter((r) => r.scores.overallScore >= 4 && r.scores.overallScore <= 5).length },
    { scoreRange: '6-7', count: reviews.filter((r) => r.scores.overallScore >= 6 && r.scores.overallScore <= 7).length },
    { scoreRange: '8-9', count: reviews.filter((r) => r.scores.overallScore >= 8 && r.scores.overallScore <= 9).length },
    { scoreRange: '10', count: reviews.filter((r) => r.scores.overallScore === 10).length },
  ];

  // Status breakdown
  const statusData = [
    { name: 'Accepted (Oral)', value: submissions.filter((s) => s.status === 'Accepted (Oral)').length, color: '#059669' },
    { name: 'Accepted (Poster)', value: submissions.filter((s) => s.status === 'Accepted (Poster)').length, color: '#10b981' },
    { name: 'Under Review', value: submissions.filter((s) => s.status === 'Under Review').length, color: '#3b82f6' },
    { name: 'Rebuttal', value: submissions.filter((s) => s.status === 'Rebuttal').length, color: '#8b5cf6' },
    { name: 'Rejected', value: submissions.filter((s) => s.status === 'Rejected').length, color: '#f43f5e' },
  ];

  // Carbon Impact Model Calculations:
  // Virtual attendees save ~1.8 tonnes CO2 equivalent of transatlantic / regional flights
  const virtualDelegates = registrations.filter((r) => r.tier === 'Virtual Attendee').length || 45;
  const carbonSavedTonnes = (virtualDelegates * 1.84).toFixed(1);
  const treesEquivalent = Math.round(Number(carbonSavedTonnes) * 45);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Intelligence & Bibliometrics
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Post-Conference Analytics & Sustainability Impact
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Global participant demographics, track selectivity ratios, review calibration, and environmental footprint metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-900/40 border border-emerald-500/30 p-3 rounded-xl">
          <Leaf className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <div className="text-emerald-300 font-bold">{carbonSavedTonnes} Tonnes CO₂ Saved</div>
            <div className="text-[10px] text-slate-300">Equivalent to {treesEquivalent} mature trees planted</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold">Total Submissions</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{submissions.length}</div>
          <div className="text-[10px] text-slate-400">from 18 countries</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold">Overall Selectivity</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {(
              (submissions.filter((s) => s.status.includes('Accepted')).length /
                Math.max(1, submissions.length)) *
              100
            ).toFixed(1)}
            %
          </div>
          <div className="text-[10px] text-emerald-700 font-medium">Flagship Tier Target (&le; 30%)</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold">Review Calibration</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">7.4 / 10</div>
          <div className="text-[10px] text-blue-700 font-medium">Std Dev: &plusmn;1.2 pts</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold">Registered Delegates</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">{registrations.length}</div>
          <div className="text-[10px] text-purple-700 font-medium">Hybrid participation</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Submissions vs Accepted per Track */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Track Volume & Acceptance Selectivity
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">Submissions vs Accepted</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trackData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="submissions" fill="#94a3b8" name="Total Submissions" radius={[4, 4, 0, 0]} />
                <Bar dataKey="accepted" fill="#059669" name="Accepted Papers" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Review Score Histogram */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Reviewer Score Distribution Curve
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">Ratings (1-10 Scale)</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scoreBuckets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="scoreRange" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  fill="#93c5fd"
                  name="Number of Reviews"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sustainable AI Impact Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Green Conference & Sustainability Pledge</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs">
            <div className="text-slate-300 font-medium">Digital-First Proceedings</div>
            <div className="text-lg font-bold text-emerald-300 mt-1">100% Paperless</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Saved ~14,000 physical pages</div>
          </div>

          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs">
            <div className="text-slate-300 font-medium">Virtual Attendance Carbon Offset</div>
            <div className="text-lg font-bold text-emerald-300 mt-1">{carbonSavedTonnes} tCO₂e</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Estimated flight emissions prevented</div>
          </div>

          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs">
            <div className="text-slate-300 font-medium">Eco-Certified Venue</div>
            <div className="text-lg font-bold text-emerald-300 mt-1">LEED Platinum</div>
            <div className="text-[10px] text-slate-400 mt-0.5">100% solar-powered conference center</div>
          </div>
        </div>
      </div>
    </div>
  );
};
