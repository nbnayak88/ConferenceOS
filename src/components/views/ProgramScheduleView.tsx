import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Layers,
  FileText,
  User,
  Download,
  Share2,
  Trash2,
  ChevronRight,
  UploadCloud,
  CheckCircle
} from 'lucide-react';
import { useConference } from '../../context/ConferenceContext';
import { Session, Presentation } from '../../types';

export const ProgramScheduleView: React.FC = () => {
  const {
    conference,
    sessions,
    submissions,
    addSession,
    addPresentationToSession,
    setSelectedPaperId,
  } = useConference();

  const [selectedDay, setSelectedDay] = useState<string>('2026-10-14');
  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false);

  // New Session Form State
  const [newTitle, setNewTitle] = useState('');
  const [newTrackId, setNewTrackId] = useState(conference.tracks[0]?.id || 'track-1');
  const [newRoom, setNewRoom] = useState('Turing Auditorium A');
  const [newDate, setNewDate] = useState('2026-10-14');
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('10:30');
  const [newChairName, setNewChairName] = useState('Prof. Alan Kay (UCLA)');
  const [newSessionType, setNewSessionType] = useState<'Oral' | 'Poster' | 'Keynote' | 'Workshop' | 'Panel'>('Oral');

  const filteredSessions = sessions.filter((s) => s.date === selectedDay);

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addSession({
      title: newTitle,
      trackId: newTrackId,
      sessionType: newSessionType,
      room: newRoom,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      sessionChairName: newChairName,
      presentations: [],
    });

    setNewTitle('');
    setIsAddSessionModalOpen(false);
  };

  const handleExportScheduleJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sessions, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `ICSAI_2026_Official_Program_Schedule.json`);
    dlAnchorElem.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Program & Schedule Builder
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-emerald-400 font-semibold">{conference.location}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Conference Program & Presentation Grid
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Build multi-track session timelines, allocate oral presentations and poster boards, and coordinate slide decks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportScheduleJSON}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm border border-white/10 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Schedule</span>
          </button>
          <button
            onClick={() => setIsAddSessionModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Session</span>
          </button>
        </div>
      </div>

      {/* Date Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto no-scrollbar">
        {[
          { date: '2026-10-14', label: 'Day 1: Oct 14', sub: 'Keynotes & Oral Track A' },
          { date: '2026-10-15', label: 'Day 2: Oct 15', sub: 'Technical Sessions & Posters' },
          { date: '2026-10-16', label: 'Day 3: Oct 16', sub: 'Industry Panels & Awards' },
        ].map((d) => (
          <button
            key={d.date}
            onClick={() => setSelectedDay(d.date)}
            className={`px-4 py-2.5 rounded-xl text-left transition-all shrink-0 ${
              selectedDay === d.date
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <div className="text-xs font-bold">{d.label}</div>
            <div className={`text-[10px] ${selectedDay === d.date ? 'text-slate-300' : 'text-slate-400'}`}>
              {d.sub}
            </div>
          </button>
        ))}
      </div>

      {/* Sessions Timeline Cards */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-2">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No sessions scheduled for this day</h3>
            <p className="text-xs text-slate-400">Click "Add Session" above to create rooms and time slots.</p>
          </div>
        ) : (
          filteredSessions.map((sess) => (
            <div
              key={sess.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                      {sess.startTime} - {sess.endTime}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {sess.sessionType}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {sess.room}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-1.5">{sess.title}</h2>
                </div>

                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Session Chair: <strong className="text-slate-800">{sess.sessionChairName}</strong></span>
                </div>
              </div>

              {/* Presentations in this session */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Presentations Roster ({sess.presentations.length})
                </span>

                {sess.presentations.map((pres, idx) => (
                  <div
                    key={pres.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="font-mono text-emerald-800 font-bold mt-0.5">
                        {pres.startTime}
                      </span>
                      <div>
                        <div
                          onClick={() => setSelectedPaperId(pres.paperId)}
                          className="font-bold text-slate-900 hover:text-emerald-600 cursor-pointer line-clamp-1"
                        >
                          {pres.title}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Speaker: {pres.speakerName} • {pres.durationMinutes} mins
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                        Slides: {pres.slideUploadStatus}
                      </span>
                      <button
                        onClick={() => setSelectedPaperId(pres.paperId)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200"
                      >
                        Inspect Paper
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Session Modal */}
      {isAddSessionModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Create New Session</h3>
              <button
                onClick={() => setIsAddSessionModalOpen(false)}
                className="text-slate-400 hover:text-slate-800"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Session Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Oral Session 3: Quantum Machine Learning & Neuromorphic Hardware"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Session Type</label>
                  <select
                    value={newSessionType}
                    onChange={(e) => setNewSessionType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Oral">Oral Presentation</option>
                    <option value="Poster">Poster Session</option>
                    <option value="Keynote">Keynote Address</option>
                    <option value="Panel">Industry Panel</option>
                    <option value="Workshop">Hands-on Workshop</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Room / Hall</label>
                  <input
                    type="text"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">End Time</label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Session Chair Name</label>
                <input
                  type="text"
                  value={newChairName}
                  onChange={(e) => setNewChairName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddSessionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
                >
                  Create Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
