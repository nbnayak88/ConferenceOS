import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  Search,
  Bell,
  CheckCircle2,
  ChevronDown,
  UserCheck,
  Building2,
  Shield,
  Layers,
  ArrowRight,
  Sliders,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { useConference } from '../../context/ConferenceContext';
import { PersonaType } from '../../types';

export const Header: React.FC = () => {
  const {
    conference,
    currentUser,
    setCurrentUser,
    activePersona,
    setActivePersona,
    availableUsers,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    isCopilotOpen,
    setIsCopilotOpen,
    searchQuery,
    setSearchQuery,
    setActiveView,
    setSelectedPaperId
  } = useConference();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const personaColorMap: Record<PersonaType, { bg: string; text: string; border: string }> = {
    'Conference Chair': { bg: 'bg-amber-50 text-amber-800', text: 'text-amber-700', border: 'border-amber-200' },
    'Co-Chair': { bg: 'bg-orange-50 text-orange-800', text: 'text-orange-700', border: 'border-orange-200' },
    'Track Chair': { bg: 'bg-emerald-50 text-emerald-800', text: 'text-emerald-700', border: 'border-emerald-200' },
    'Senior Meta Reviewer': { bg: 'bg-purple-50 text-purple-800', text: 'text-purple-700', border: 'border-purple-200' },
    'Meta Reviewer': { bg: 'bg-indigo-50 text-indigo-800', text: 'text-indigo-700', border: 'border-indigo-200' },
    'Reviewer': { bg: 'bg-blue-50 text-blue-800', text: 'text-blue-700', border: 'border-blue-200' },
    'Author': { bg: 'bg-teal-50 text-teal-800', text: 'text-teal-700', border: 'border-teal-200' },
    'Speaker': { bg: 'bg-rose-50 text-rose-800', text: 'text-rose-700', border: 'border-rose-200' },
    'Attendee': { bg: 'bg-slate-50 text-slate-800', text: 'text-slate-700', border: 'border-slate-200' },
    'Sponsor': { bg: 'bg-yellow-50 text-yellow-800', text: 'text-yellow-700', border: 'border-yellow-200' },
    'Volunteer': { bg: 'bg-green-50 text-green-800', text: 'text-green-700', border: 'border-green-200' },
    'Proceedings Editor': { bg: 'bg-cyan-50 text-cyan-800', text: 'text-cyan-700', border: 'border-cyan-200' },
    'Conference Administrator': { bg: 'bg-red-50 text-red-800', text: 'text-red-700', border: 'border-red-200' },
  };

  const currentPersonaStyle = personaColorMap[activePersona] || {
    bg: 'bg-slate-50 text-slate-800',
    text: 'text-slate-700',
    border: 'border-slate-200',
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Conference Switcher */}
        <div className="flex items-center gap-4 min-w-0">
          <div
            id="brand-logo"
            onClick={() => setActiveView('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-sm ring-1 ring-emerald-500/20 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-900 tracking-tight">ConferenceOS</span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  AI-Native
                </span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold text-slate-900">{conference.acronym}</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-600 truncate max-w-[140px]">{conference.location.split(',')[0]}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
          </div>
        </div>

        {/* Center: Global Search */}
        <div className="flex-1 max-w-md hidden lg:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search papers, authors, reviewers, topics, sessions..."
              className="w-full pl-9 pr-4 py-1.5 rounded-lg text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right: Persona Switcher, AI Copilot & User Menu */}
        <div className="flex items-center gap-2.5">
          {/* Persona Switcher Dropdown */}
          <div className="relative">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-500 hidden xl:inline">Persona:</span>
              <select
                id="persona-switcher-select"
                value={activePersona}
                onChange={(e) => setActivePersona(e.target.value as PersonaType)}
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm transition-all ${currentPersonaStyle.bg} ${currentPersonaStyle.border}`}
              >
                {currentUser.assignedPersonas.map((persona) => (
                  <option key={persona} value={persona}>
                    {persona}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* AI Copilot Toggle Button */}
          <button
            id="ai-copilot-toggle-btn"
            onClick={() => setIsCopilotOpen(!isCopilotOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isCopilotOpen
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-500/20'
                : 'bg-emerald-50/80 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isCopilotOpen ? 'text-white' : 'text-emerald-600 animate-pulse'}`} />
            <span className="hidden sm:inline">AI Copilot</span>
          </button>

          {/* Notifications Popover */}
          <div className="relative">
            <button
              id="notifications-toggle-btn"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div
                id="notifications-popover-menu"
                className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900">Notifications & Alerts</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-semibold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">No notifications</div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationRead(notif.id);
                          if (notif.actionUrl?.includes('discussions')) {
                            setActiveView('meta-reviews');
                            setSelectedPaperId('sub-07');
                          } else if (notif.actionUrl?.includes('reviews')) {
                            setActiveView('reviews');
                          } else if (notif.actionUrl?.includes('camera-ready')) {
                            setActiveView('camera-ready');
                          }
                          setIsNotifOpen(false);
                        }}
                        className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-left ${
                          !notif.isRead ? 'bg-emerald-50/30' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-900">{notif.title}</span>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                        {notif.actionLabel && (
                          <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                            <span>{notif.actionLabel}</span>
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Switcher */}
          <div className="relative">
            <button
              id="user-profile-menu-btn"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 border border-slate-200 transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white text-xs font-semibold flex items-center justify-center">
                {currentUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[110px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-500 truncate max-w-[110px]">{currentUser.affiliation}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isUserMenuOpen && (
              <div
                id="user-switch-popover"
                className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="px-4 py-2 border-b border-slate-100">
                  <div className="text-xs font-semibold text-slate-900">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-500">{currentUser.email}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {currentUser.affiliation} ({currentUser.country}) • h-index: {currentUser.hIndex}
                  </div>
                </div>

                <div className="px-3 py-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Switch Test Persona User
                  </span>
                  <div className="mt-1.5 space-y-1 max-h-56 overflow-y-auto">
                    {availableUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          setCurrentUser(user);
                          setActivePersona(user.assignedPersonas[0]);
                          setIsUserMenuOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          user.id === currentUser.id
                            ? 'bg-emerald-50 text-emerald-900 font-semibold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="truncate font-medium">{user.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">{user.assignedPersonas.join(', ')}</div>
                        </div>
                        {user.id === currentUser.id && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
