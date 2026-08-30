import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Copy,
  Check,
  AlertCircle,
  RefreshCw,
  Zap,
  FileCheck,
  Clock,
  Mail,
  ShieldCheck,
  Award
} from 'lucide-react';
import { useConference } from '../../context/ConferenceContext';
import { askConferenceCopilot } from '../../services/geminiService';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  source?: string;
}

export const CopilotDrawer: React.FC = () => {
  const {
    isCopilotOpen,
    setIsCopilotOpen,
    activePersona,
    currentUser,
    submissions,
    reviews,
    conflicts,
    assignments,
    conference,
  } = useConference();

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Hello ${currentUser.name}! I am your **ConferenceOS AI Copilot**. I have indexed the full conference state (${submissions.length} papers, ${reviews.length} reviews, ${conflicts.length} COI records, ${assignments.length} assignments).\n\nHow can I assist you with **${conference.acronym}** today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'gemini-2.5-flash',
    },
  ]);

  const quickPrompts = [
    {
      label: '🚨 Overdue Review Actions',
      prompt: 'Identify all overdue reviews and generate an urgent, polite reminder email for delinquent reviewers.',
    },
    {
      label: '⚖️ Resolve #ICSAI-07 Variance',
      prompt: 'Analyze paper #ICSAI-07 which has scores 9, 3, and 7. Summarize the core disagreement regarding MoE communication overhead and suggest a resolution.',
    },
    {
      label: '📊 Reviewer Load Audit',
      prompt: 'Check for reviewer workload imbalances where reviewers are at or above their max review quota.',
    },
    {
      label: '🎤 Keynote Opening Remarks',
      prompt: 'Draft an inspirational 2-minute opening welcome speech for Conference Chair Dr. Elena Vance at the ICSAI 2026 plenary.',
    },
  ];

  const handleSend = async (promptToSend?: string) => {
    const query = promptToSend || inputPrompt;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!promptToSend) setInputPrompt('');
    setIsLoading(true);

    try {
      const conferenceContext = {
        conferenceName: conference.name,
        acronym: conference.acronym,
        currentPhase: conference.currentPhase,
        totalSubmissions: submissions.length,
        totalReviews: reviews.length,
        overdueCount: 4,
        submissionsSample: submissions.slice(0, 5).map((s) => ({
          code: s.paperCode,
          title: s.title,
          score: s.averageScore,
          status: s.status,
        })),
      };

      const response = await askConferenceCopilot(query, conferenceContext, activePersona);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: response.source,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: `⚠️ Error executing query: ${err.message || 'Server timeout'}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isCopilotOpen) return null;

  return (
    <div
      id="ai-copilot-drawer"
      className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-sm flex items-center gap-1.5">
              <span>ConferenceOS Copilot</span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Gemini 2.5
              </span>
            </div>
            <div className="text-[11px] text-slate-300">
              Assisting as <span className="font-semibold text-white">{activePersona}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsCopilotOpen(false)}
          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Prompts Carousel */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 overflow-x-auto no-scrollbar flex items-center gap-2">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp.prompt)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-emerald-500 text-[11px] font-medium text-slate-700 hover:text-emerald-700 whitespace-nowrap shadow-sm transition-all"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-semibold ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white'
                  : 'bg-emerald-600 text-white shadow-sm'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`group relative max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-none'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

              <div className="mt-2 pt-1 border-t border-slate-200/40 flex items-center justify-between text-[10px] text-slate-400">
                <span>{msg.timestamp}</span>
                {msg.sender === 'ai' && (
                  <button
                    onClick={() => handleCopy(msg.id, msg.text)}
                    className="flex items-center gap-1 hover:text-slate-700 transition-colors"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600 font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-500 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></span>
              <span>Reasoning over conference submissions & reviews...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={`Ask Copilot anything about ${conference.acronym}...`}
            className="w-full pl-3 pr-10 py-2 rounded-xl text-xs bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="absolute right-1.5 p-1.5 rounded-lg bg-emerald-600 text-white disabled:bg-slate-200 disabled:text-slate-400 hover:bg-emerald-700 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <div className="mt-1.5 text-[10px] text-center text-slate-400">
          Powered by Gemini 2.5 Flash • Contextually grounded in live conference data
        </div>
      </div>
    </div>
  );
};
