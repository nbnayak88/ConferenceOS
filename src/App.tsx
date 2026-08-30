import React from 'react';
import { ConferenceProvider, useConference } from './context/ConferenceContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { LifecycleProgress } from './components/layout/LifecycleProgress';
import { CopilotDrawer } from './components/ai/CopilotDrawer';
import { PaperDetailModal } from './components/common/PaperDetailModal';

// Views
import { ChairCommandCenter } from './components/views/ChairCommandCenter';
import { SubmissionsView } from './components/views/SubmissionsView';
import { AssignmentEngineView } from './components/views/AssignmentEngineView';
import { ConflictMatrixView } from './components/views/ConflictMatrixView';
import { ReviewerWorkspaceView } from './components/views/ReviewerWorkspaceView';
import { MetaReviewView } from './components/views/MetaReviewView';
import { AuthorPortalView } from './components/views/AuthorPortalView';
import { ProgramScheduleView } from './components/views/ProgramScheduleView';
import { RegistrationView } from './components/views/RegistrationView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { AuditLogsView } from './components/views/AuditLogsView';
import { TopicManagementView } from './components/views/TopicManagementView';

const MainLayout: React.FC = () => {
  const { activeView } = useConference();

  const renderActiveView = () => {
    switch (activeView) {
      case 'chair-dashboard':
      case 'command-center':
        return <ChairCommandCenter />;
      case 'submissions':
        return <SubmissionsView />;
      case 'topics':
        return <TopicManagementView />;
      case 'assignments':
        return <AssignmentEngineView />;
      case 'conflicts':
        return <ConflictMatrixView />;
      case 'reviewer-workspace':
        return <ReviewerWorkspaceView />;
      case 'meta-reviews':
        return <MetaReviewView />;
      case 'author-portal':
        return <AuthorPortalView />;
      case 'schedule':
        return <ProgramScheduleView />;
      case 'registration':
        return <RegistrationView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'audit-logs':
        return <AuditLogsView />;
      default:
        return <ChairCommandCenter />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header />

      {/* Conference Lifecycle Progress Ribbon */}
      <LifecycleProgress />

      {/* Main App Body */}
      <div className="flex-1 flex overflow-hidden max-w-[1600px] w-full mx-auto">
        {/* Adaptive Sidebar */}
        <Sidebar />

        {/* Dynamic View Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-125px)]">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Paper Inspector Modal */}
      <PaperDetailModal />

      {/* AI Copilot Drawer */}
      <CopilotDrawer />
    </div>
  );
};

export default function App() {
  return (
    <ConferenceProvider>
      <MainLayout />
    </ConferenceProvider>
  );
}
