import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  ShieldAlert,
  Edit3,
  MessageSquare,
  Award,
  Calendar,
  Users,
  BarChart3,
  History,
  FolderCheck,
  Compass,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Mail,
  Zap,
  Tag
} from 'lucide-react';
import { useConference } from '../../context/ConferenceContext';

export const Sidebar: React.FC = () => {
  const {
    activePersona,
    activeView,
    setActiveView,
    submissions,
    reviews,
    conflicts,
    notifications,
    assignments,
    currentUser
  } = useConference();

  const isChair =
    activePersona === 'Conference Chair' ||
    activePersona === 'Co-Chair' ||
    activePersona === 'Conference Administrator';
  const isTrackChair = activePersona === 'Track Chair';
  const isMetaReviewer =
    activePersona === 'Senior Meta Reviewer' || activePersona === 'Meta Reviewer';
  const isReviewer = activePersona === 'Reviewer';
  const isAuthor = activePersona === 'Author';

  // Metrics
  const mySubmissionsCount = submissions.filter((s) =>
    s.authors.some(
      (a) => a.email.toLowerCase() === currentUser.email.toLowerCase() || a.id === currentUser.id
    )
  ).length;

  const myAssignedReviewsCount = assignments.filter(
    (a) => a.reviewerId === currentUser.id && a.status !== 'Completed'
  ).length;

  const overdueCount = 4;
  const activeDiscussionsCount = 1;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Executive Overview',
      icon: LayoutDashboard,
      roles: ['all'],
      badge: null,
    },
    {
      id: 'chair-center',
      label: 'Chair Command Center',
      icon: Award,
      roles: ['Conference Chair', 'Co-Chair', 'Conference Administrator', 'Track Chair'],
      badge: 'Decisions',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'submissions',
      label: 'Papers & Submissions',
      icon: FileText,
      roles: ['all'],
      badge: submissions.length.toString(),
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'topics',
      label: 'Topics & Taxonomy',
      icon: Tag,
      roles: ['Conference Chair', 'Co-Chair', 'Track Chair', 'Conference Administrator', 'all'],
      badge: 'Chair Admin',
      badgeColor: 'bg-teal-100 text-teal-800',
    },
    {
      id: 'assignments',
      label: 'Reviewer Matching Engine',
      icon: Sparkles,
      roles: ['Conference Chair', 'Co-Chair', 'Track Chair', 'Conference Administrator'],
      badge: 'AI Solver',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'conflicts',
      label: 'Conflict Matrix (COI)',
      icon: ShieldAlert,
      roles: ['Conference Chair', 'Co-Chair', 'Track Chair', 'Conference Administrator'],
      badge: conflicts.filter((c) => c.status === 'CONFLICT').length.toString(),
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
      id: 'reviewer-workspace',
      label: 'Reviewer Workspace',
      icon: Edit3,
      roles: ['Reviewer', 'Conference Chair', 'Track Chair', 'Senior Meta Reviewer', 'Meta Reviewer'],
      badge: myAssignedReviewsCount > 0 ? `${myAssignedReviewsCount} Pending` : 'Ready',
      badgeColor: myAssignedReviewsCount > 0 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700',
    },
    {
      id: 'meta-reviews',
      label: 'Meta-Reviews & Discussions',
      icon: MessageSquare,
      roles: [
        'Conference Chair',
        'Co-Chair',
        'Senior Meta Reviewer',
        'Meta Reviewer',
        'Track Chair',
        'Reviewer',
      ],
      badge: 'Active (Spread 9v3)',
      badgeColor: 'bg-purple-100 text-purple-800',
    },
    {
      id: 'author-portal',
      label: 'Author Portal & Rebuttal',
      icon: FolderCheck,
      roles: ['Author', 'Conference Chair', 'Track Chair', 'Reviewer'],
      badge: mySubmissionsCount > 0 ? `${mySubmissionsCount} Papers` : null,
      badgeColor: 'bg-teal-100 text-teal-800',
    },
    {
      id: 'camera-ready',
      label: 'Camera-Ready & Copyright',
      icon: CheckCircle2,
      roles: ['all'],
      badge: 'Open',
      badgeColor: 'bg-cyan-100 text-cyan-800',
    },
    {
      id: 'schedule',
      label: 'Program & Schedule',
      icon: Calendar,
      roles: ['all'],
      badge: '5 Sessions',
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'registration',
      label: 'Registrations & Badges',
      icon: Users,
      roles: ['all'],
      badge: null,
    },
    {
      id: 'analytics',
      label: 'Analytics & Insights',
      icon: BarChart3,
      roles: ['all'],
      badge: null,
    },
    {
      id: 'audit-logs',
      label: 'Immutable Audit Trail',
      icon: History,
      roles: ['Conference Chair', 'Co-Chair', 'Conference Administrator'],
      badge: null,
    },
  ];

  const visibleNav = navItems.filter(
    (item) => item.roles.includes('all') || item.roles.includes(activePersona)
  );

  return (
    <aside className="w-64 shrink-0 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        {/* Active Workspace Persona info */}
        <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Current Persona</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <div className="mt-1 font-semibold text-sm text-white truncate">{activePersona}</div>
          <div className="mt-0.5 text-[11px] text-slate-400 truncate">{currentUser.name}</div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                      isActive ? 'bg-emerald-700 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Quick Status */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="text-[11px] text-slate-400 font-medium mb-2 flex items-center justify-between">
          <span>Review Completion</span>
          <span className="text-emerald-400 font-bold">82.5%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div className="bg-emerald-500 h-1.5 rounded-full w-[82.5%] transition-all duration-500"></div>
        </div>
        <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            66/80 Reviews
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <AlertTriangle className="w-3 h-3" />
            4 Overdue
          </span>
        </div>
      </div>
    </aside>
  );
};
