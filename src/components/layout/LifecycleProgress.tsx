import React from 'react';
import {
  FileText,
  Users,
  ShieldAlert,
  Edit3,
  MessageSquare,
  Award,
  Calendar,
  CheckCircle,
  BarChart3,
  FolderCheck,
  Compass,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useConference } from '../../context/ConferenceContext';

export interface StageInfo {
  id: string;
  name: string;
  viewTarget: string;
  icon: any;
  status: 'completed' | 'active' | 'upcoming';
  description: string;
}

export const LifecycleProgress: React.FC = () => {
  const { conference, activeView, setActiveView } = useConference();

  const stages: StageInfo[] = [
    {
      id: 'setup',
      name: 'CFP & Setup',
      viewTarget: 'submissions',
      icon: Compass,
      status: 'completed',
      description: 'Tracks & configuration defined',
    },
    {
      id: 'submissions',
      name: 'Submissions',
      viewTarget: 'submissions',
      icon: FileText,
      status: 'completed',
      description: '30 papers received',
    },
    {
      id: 'bidding',
      name: 'Reviewer Bidding',
      viewTarget: 'reviewer-bidding',
      icon: Users,
      status: 'completed',
      description: 'Bids aggregated',
    },
    {
      id: 'coi',
      name: 'Conflict Matrix',
      viewTarget: 'conflicts',
      icon: ShieldAlert,
      status: 'completed',
      description: 'Domain & co-author scans',
    },
    {
      id: 'assignment',
      name: 'Matching Engine',
      viewTarget: 'assignments',
      icon: Sparkles,
      status: 'completed',
      description: 'Explainable AI solver',
    },
    {
      id: 'peer-review',
      name: 'Peer Review',
      viewTarget: 'reviews',
      icon: Edit3,
      status: 'completed',
      description: 'Rubrics & multi-score',
    },
    {
      id: 'discussion',
      name: 'Meta-Review & Discussion',
      viewTarget: 'meta-reviews',
      icon: MessageSquare,
      status: 'active',
      description: 'Variance & consensus active',
    },
    {
      id: 'decisions',
      name: 'Chair Decisions',
      viewTarget: 'chair-center',
      icon: Award,
      status: 'active',
      description: 'Oral/Poster/Revisions',
    },
    {
      id: 'camera-ready',
      name: 'Camera Ready & Copyright',
      viewTarget: 'camera-ready',
      icon: FolderCheck,
      status: 'active',
      description: 'IEEE & verified PDFs',
    },
    {
      id: 'program',
      name: 'Program & Schedule',
      viewTarget: 'schedule',
      icon: Calendar,
      status: 'upcoming',
      description: 'Sessions, rooms & slides',
    },
    {
      id: 'analytics',
      name: 'Analytics & Audit',
      viewTarget: 'analytics',
      icon: BarChart3,
      status: 'upcoming',
      description: 'Acceptance rates & logs',
    },
  ];

  return (
    <div className="bg-white border-b border-slate-200 py-2.5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Active Phase:
          </span>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {conference.currentPhase}
          </span>
        </div>

        {/* Scrollable Stage Steps */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isCurrentView = activeView === stage.viewTarget;

            return (
              <React.Fragment key={stage.id}>
                <button
                  id={`lifecycle-step-${stage.id}`}
                  onClick={() => setActiveView(stage.viewTarget)}
                  title={`${stage.name}: ${stage.description}`}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isCurrentView
                      ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-800'
                      : stage.status === 'active'
                      ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                      : stage.status === 'completed'
                      ? 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                      : 'bg-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{stage.name}</span>
                  {stage.status === 'active' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  )}
                  {stage.status === 'completed' && (
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                  )}
                </button>

                {idx < stages.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
