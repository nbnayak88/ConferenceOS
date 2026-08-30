import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  FileText,
  Users,
  Tag,
  ShieldCheck,
  Building,
  Mail,
  Globe,
  Sparkles,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  FileCheck,
  ExternalLink,
  HelpCircle,
  Copy,
  Check,
  Info,
  Sliders,
  FolderPlus,
  Download
} from 'lucide-react';
import { useConference } from '../../context/ConferenceContext';
import { AuthorInfo, Submission } from '../../types';

interface SubmissionWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (submission: Submission) => void;
}

export const SubmissionWizardModal: React.FC<SubmissionWizardModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    conference,
    currentUser,
    topics,
    activePersona,
    addSubmission,
    setSelectedPaperId,
    setActiveView,
  } = useConference();

  // Wizard Step State (1 to 5)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedPaper, setSubmittedPaper] = useState<Submission | null>(null);

  // STEP 1: Conference & Topics / Track State
  const [conferenceChoice, setConferenceChoice] = useState<'current' | 'custom'>('current');
  const [customConferenceName, setCustomConferenceName] = useState(conference.name);
  const [customConferenceAcronym, setCustomConferenceAcronym] = useState(conference.acronym || 'CONF-2026');
  
  const [selectedTrackId, setSelectedTrackId] = useState<string>(conference.tracks[0]?.id || 'track-1');
  const [customTrackName, setCustomTrackName] = useState('');
  const [isCustomTrack, setIsCustomTrack] = useState(false);
  
  const [submissionType, setSubmissionType] = useState<string>('Full Research Paper');
  
  // Topics & Keywords
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    'Large Language Models',
    'AI Safety & Alignment',
  ]);
  const [singleTopicInput, setSingleTopicInput] = useState('');
  const [bulkTopicInput, setBulkTopicInput] = useState('');
  const [isBulkTopicOpen, setIsBulkTopicOpen] = useState(false);
  const [topicSearchTerm, setTopicSearchTerm] = useState('');
  const [topicFilterMode, setTopicFilterMode] = useState<'all' | 'track_only' | 'custom_only'>('all');

  // STEP 2: Manuscript Metadata & Abstract
  const [title, setTitle] = useState('');
  const [shortTitle, setShortTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [keywords, setKeywords] = useState<string[]>(['efficiency', 'neural-networks', 'benchmarking']);
  const [singleKeywordInput, setSingleKeywordInput] = useState('');
  const [bulkKeywordInput, setBulkKeywordInput] = useState('');
  const [isBulkKeywordOpen, setIsBulkKeywordOpen] = useState(false);
  const [isStudentBestPaper, setIsStudentBestPaper] = useState(false);
  const [isReproducibilityTrack, setIsReproducibilityTrack] = useState(true);
  const [isAiSuggestedKeywordsLoading, setIsAiSuggestedKeywordsLoading] = useState(false);

  // STEP 3: Authors & Co-Authors
  const [authors, setAuthors] = useState<AuthorInfo[]>([
    {
      id: currentUser.id || 'auth-primary',
      name: currentUser.name || 'Dr. Elena Vance',
      email: currentUser.email || 'elena.vance@oxford.ac.uk',
      affiliation: currentUser.affiliation || 'University of Oxford',
      country: currentUser.country || 'United Kingdom',
      isCorresponding: true,
      order: 1,
      role: 'Lead Author',
      isStudent: false,
      orcid: '0000-0002-1825-0097',
    },
  ]);
  
  // Single Co-Author Form
  const [newAuthorName, setNewAuthorName] = useState('');
  const [newAuthorEmail, setNewAuthorEmail] = useState('');
  const [newAuthorAffiliation, setNewAuthorAffiliation] = useState('');
  const [newAuthorCountry, setNewAuthorCountry] = useState('United States');
  const [newAuthorRole, setNewAuthorRole] = useState('Co-Author');
  const [newAuthorOrcid, setNewAuthorOrcid] = useState('');
  const [newAuthorIsStudent, setNewAuthorIsStudent] = useState(false);
  const [isAddAuthorDrawerOpen, setIsAddAuthorDrawerOpen] = useState(false);

  // Bulk Author Form
  const [bulkAuthorText, setBulkAuthorText] = useState('');
  const [isBulkAuthorOpen, setIsBulkAuthorOpen] = useState(false);
  const [bulkParseError, setBulkParseError] = useState('');

  // STEP 4: Manuscript & Artifact Uploads
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    sizeMb: number;
    pageCount: number;
    url: string;
  } | null>({
    name: 'Manuscript_Draft_Anonymized.pdf',
    sizeMb: 2.8,
    pageCount: 10,
    url: 'https://arxiv.org/pdf/2401.00001.pdf',
  });
  const [codeRepoUrl, setCodeRepoUrl] = useState('https://github.com/anonymous-repo/codebase');
  const [datasetUrl, setDatasetUrl] = useState('https://zenodo.org/record/8000001');
  const [appendixFileName, setAppendixFileName] = useState('');
  const [presentationPreference, setPresentationPreference] = useState<string>('In-Person Oral');

  // STEP 5: Ethical Declarations
  const [isDoubleBlindCompliant, setIsDoubleBlindCompliant] = useState(true);
  const [isOriginalityPledged, setIsOriginalityPledged] = useState(true);
  const [aiUsageDisclosure, setAiUsageDisclosure] = useState<string>(
    'AI used for language polishing and grammar refinement only (no synthetic data or automated reasoning claims).'
  );
  const [isDataAvailabilityAgreed, setIsDataAvailabilityAgreed] = useState(true);

  if (!isOpen) return null;

  // Preset topic templates
  const PRESET_TOPIC_BANKS = [
    {
      category: 'AI & Machine Learning',
      topics: ['Deep Learning', 'Computer Vision', 'NLP & LLMs', 'Reinforcement Learning', 'Graph Neural Networks', 'AI Ethics & Fairness', 'Efficient Inference'],
    },
    {
      category: 'Systems & Security',
      topics: ['Distributed Systems', 'Cloud & Edge Computing', 'Cybersecurity & Cryptography', 'Privacy-Preserving Computation', 'Hardware Acceleration'],
    },
    {
      category: 'Interdisciplinary & Applications',
      topics: ['Bioinformatics & Health AI', 'Autonomous Robotics', 'Human-Computer Interaction', 'Climate Informatics', 'Quantum Computing'],
    },
  ];

  // Helper: word count
  const abstractWordCount = abstract.trim() ? abstract.trim().split(/\s+/).length : 0;

  // Track name resolution
  const activeTrackName = isCustomTrack
    ? customTrackName || 'Custom Track'
    : conference.tracks.find((t) => t.id === selectedTrackId)?.name || 'General Track';

  const effectiveConferenceName = conferenceChoice === 'current' ? conference.name : customConferenceName;

  // --- Step 1 Handlers ---
  const handleAddSingleTopic = (topicToAdd?: string) => {
    const t = (topicToAdd || singleTopicInput).trim();
    if (t && !selectedTopics.includes(t)) {
      setSelectedTopics([...selectedTopics, t]);
      if (!topicToAdd) setSingleTopicInput('');
    }
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    setSelectedTopics(selectedTopics.filter((t) => t !== topicToRemove));
  };

  const handleBulkTopicsImport = () => {
    if (!bulkTopicInput.trim()) return;
    // Split by newline, comma, or semicolon
    const items = bulkTopicInput
      .split(/[\n,;]+/)
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    const merged = Array.from(new Set([...selectedTopics, ...items]));
    setSelectedTopics(merged);
    setBulkTopicInput('');
    setIsBulkTopicOpen(false);
  };

  // --- Step 2 Handlers ---
  const handleAddSingleKeyword = (kwToAdd?: string) => {
    const k = (kwToAdd || singleKeywordInput).trim().toLowerCase();
    if (k && !keywords.includes(k)) {
      setKeywords([...keywords, k]);
      if (!kwToAdd) setSingleKeywordInput('');
    }
  };

  const handleRemoveKeyword = (kwToRemove: string) => {
    setKeywords(keywords.filter((k) => k !== kwToRemove));
  };

  const handleBulkKeywordsImport = () => {
    if (!bulkKeywordInput.trim()) return;
    const items = bulkKeywordInput
      .split(/[\n,;]+/)
      .map((i) => i.trim().toLowerCase())
      .filter((i) => i.length > 0);

    const merged = Array.from(new Set([...keywords, ...items]));
    setKeywords(merged);
    setBulkKeywordInput('');
    setIsBulkKeywordOpen(false);
  };

  const handleAiSuggestKeywords = () => {
    setIsAiSuggestedKeywordsLoading(true);
    setTimeout(() => {
      const suggestions = ['foundation-models', 'parameter-efficient-tuning', 'zero-shot-generalization', 'empirical-rigor'];
      const merged = Array.from(new Set([...keywords, ...suggestions]));
      setKeywords(merged);
      setIsAiSuggestedKeywordsLoading(false);
    }, 600);
  };

  // --- Step 3 Handlers (Authors) ---
  const handleAddSingleAuthor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthorName.trim() || !newAuthorEmail.trim()) return;

    const newAuthor: AuthorInfo = {
      id: `auth-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: newAuthorName.trim(),
      email: newAuthorEmail.trim(),
      affiliation: newAuthorAffiliation.trim() || 'Independent Researcher',
      country: newAuthorCountry,
      isCorresponding: false,
      order: authors.length + 1,
      role: newAuthorRole,
      orcid: newAuthorOrcid.trim() || undefined,
      isStudent: newAuthorIsStudent,
    };

    setAuthors([...authors, newAuthor]);
    setNewAuthorName('');
    setNewAuthorEmail('');
    setNewAuthorAffiliation('');
    setNewAuthorOrcid('');
    setNewAuthorIsStudent(false);
    setIsAddAuthorDrawerOpen(false);
  };

  const handleRemoveAuthor = (id: string) => {
    if (authors.length <= 1) return;
    const updated = authors.filter((a) => a.id !== id).map((a, idx) => ({ ...a, order: idx + 1 }));
    setAuthors(updated);
  };

  const handleSetCorresponding = (id: string) => {
    setAuthors(authors.map((a) => ({ ...a, isCorresponding: a.id === id })));
  };

  const handleMoveAuthor = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === authors.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newAuthors = [...authors];
    const temp = newAuthors[index];
    newAuthors[index] = newAuthors[targetIndex];
    newAuthors[targetIndex] = temp;

    // Recalculate order numbers
    setAuthors(newAuthors.map((a, idx) => ({ ...a, order: idx + 1 })));
  };

  const handleBulkAuthorsImport = () => {
    setBulkParseError('');
    if (!bulkAuthorText.trim()) return;

    try {
      const lines = bulkAuthorText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
      const parsed: AuthorInfo[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Match format 1: Name <email> (Affiliation, Country)
        const matchFormat1 = line.match(/^([^<]+)<([^>]+)>\s*(?:\(([^)]+)\))?/);
        // Match format 2: CSV / comma separated "Name, email, affiliation, country"
        const parts = line.split(',').map((p) => p.trim());

        if (matchFormat1) {
          const name = matchFormat1[1].trim();
          const email = matchFormat1[2].trim();
          const affilStr = matchFormat1[3] ? matchFormat1[3].trim() : 'Academic Institution';
          const affilParts = affilStr.split(',').map((s) => s.trim());
          const affiliation = affilParts[0] || 'University';
          const country = affilParts[1] || 'United States';

          parsed.push({
            id: `auth-bulk-${Date.now()}-${i}`,
            name,
            email,
            affiliation,
            country,
            isCorresponding: false,
            order: authors.length + i + 1,
            role: 'Co-Author',
          });
        } else if (parts.length >= 2) {
          const name = parts[0];
          const email = parts[1];
          const affiliation = parts[2] || 'University Institution';
          const country = parts[3] || 'United States';

          parsed.push({
            id: `auth-bulk-${Date.now()}-${i}`,
            name,
            email,
            affiliation,
            country,
            isCorresponding: false,
            order: authors.length + i + 1,
            role: 'Co-Author',
          });
        } else {
          // Just a name
          parsed.push({
            id: `auth-bulk-${Date.now()}-${i}`,
            name: line,
            email: `${line.toLowerCase().replace(/\s+/g, '.')}@institution.edu`,
            affiliation: 'Research Institute',
            country: 'United States',
            isCorresponding: false,
            order: authors.length + i + 1,
            role: 'Co-Author',
          });
        }
      }

      if (parsed.length === 0) {
        setBulkParseError('Could not parse author lines. Please check the format.');
        return;
      }

      setAuthors([...authors, ...parsed].map((a, idx) => ({ ...a, order: idx + 1 })));
      setBulkAuthorText('');
      setIsBulkAuthorOpen(false);
    } catch (err) {
      setBulkParseError('Error parsing bulk text. Please check format.');
    }
  };

  // --- Step 4 Handlers (Uploads) ---
  const handleSimulateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile({
        name: file.name,
        sizeMb: parseFloat((file.size / (1024 * 1024)).toFixed(2)) || 2.4,
        pageCount: 10,
        url: URL.createObjectURL(file),
      });
    }
  };

  // --- Validation ---
  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (conferenceChoice === 'custom' && !customConferenceName.trim()) return false;
      if (isCustomTrack && !customTrackName.trim()) return false;
      if (selectedTopics.length === 0) return false;
      return true;
    }
    if (step === 2) {
      if (!title.trim()) return false;
      if (!abstract.trim() || abstractWordCount < 20) return false;
      if (keywords.length === 0) return false;
      return true;
    }
    if (step === 3) {
      if (authors.length === 0) return false;
      if (!authors.some((a) => a.isCorresponding)) return false;
      return true;
    }
    if (step === 4) {
      if (!uploadedFile) return false;
      return true;
    }
    if (step === 5) {
      if (!isDoubleBlindCompliant || !isOriginalityPledged) return false;
      return true;
    }
    return true;
  };

  // --- Final Submit Action ---
  const handleFinalSubmit = () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4) || !validateStep(5)) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const primaryAuth = authors.find((a) => a.isCorresponding) || authors[0];
      
      const newSubmissionData = {
        title: title.trim(),
        abstract: abstract.trim(),
        trackId: isCustomTrack ? 'track-custom' : selectedTrackId,
        trackName: activeTrackName,
        topics: selectedTopics,
        keywords: keywords,
        authors: authors,
        primaryContactId: primaryAuth.id,
        manuscriptUrl: uploadedFile?.url || 'https://arxiv.org/pdf/2401.00001.pdf',
        manuscriptFileName: uploadedFile?.name || 'manuscript.pdf',
        fileSizeMb: uploadedFile?.sizeMb || 2.5,
        targetConference: effectiveConferenceName,
        submissionType: submissionType,
        supplementaryLinks: [codeRepoUrl, datasetUrl].filter(Boolean),
        aiDisclosure: aiUsageDisclosure,
        presentationPreference: presentationPreference,
        ethicsCompliance: true,
        pageCount: uploadedFile?.pageCount || 10,
      };

      const created = addSubmission(newSubmissionData);
      setIsSubmitting(false);
      setSubmittedPaper(created);
      if (onSuccess) onSuccess(created);
    }, 1000);
  };

  const handleFinishAndNavigate = () => {
    if (submittedPaper) {
      setSelectedPaperId(submittedPaper.id);
      setActiveView('author-portal');
    }
    onClose();
  };

  const handleDownloadReceipt = () => {
    if (!submittedPaper) return;
    const receiptData = {
      conference: effectiveConferenceName,
      paperCode: submittedPaper.paperCode,
      title: submittedPaper.title,
      track: submittedPaper.trackName,
      topics: submittedPaper.topics,
      authors: submittedPaper.authors.map((a) => `${a.name} (${a.affiliation}, ${a.email})`),
      submissionTimestamp: submittedPaper.submittedAt,
      manuscriptFile: submittedPaper.manuscriptFileName,
      status: 'Officially Received - Ready for Peer Review',
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(receiptData, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `${submittedPaper.paperCode}_Submission_Receipt.json`);
    dlAnchor.click();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-850 to-teal-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Manuscript Submission Wizard
              </span>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs text-slate-300 truncate max-w-xs font-semibold">
                {effectiveConferenceName}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5">
              Submit New Academic Manuscript
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Close Wizard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Modal View after Final Submission */}
        {submittedPaper ? (
          <div className="p-8 text-center space-y-6 overflow-y-auto flex-1 my-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <span className="font-mono text-sm font-bold px-3 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 inline-block">
                Paper ID: {submittedPaper.paperCode}
              </span>
              <h3 className="text-2xl font-black text-slate-900">Manuscript Successfully Submitted!</h3>
              <p className="text-sm text-slate-600">
                Your paper titled <strong className="text-slate-900">"{submittedPaper.title}"</strong> has been logged in the conference ledger and routed to the Program Chairs.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Target Conference:</span>
                <span className="font-bold text-slate-800">{effectiveConferenceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Track & Format:</span>
                <span className="font-bold text-slate-800">{submittedPaper.trackName} ({submissionType})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Primary Contact:</span>
                <span className="font-bold text-slate-800">
                  {submittedPaper.authors.find((a) => a.isCorresponding)?.name || submittedPaper.authors[0]?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  {submittedPaper.status}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleDownloadReceipt}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Submission Receipt</span>
              </button>
              <button
                onClick={handleFinishAndNavigate}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md transition-all"
              >
                <span>Go to Author Console</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Guided Stepper Tabs */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 shrink-0">
              <div className="grid grid-cols-5 gap-2 text-xs">
                {[
                  { step: 1, title: 'Venue & Track', icon: Building },
                  { step: 2, title: 'Metadata & Abstract', icon: FileText },
                  { step: 3, title: 'Authors & Co-Authors', icon: Users },
                  { step: 4, title: 'Uploads & Artifacts', icon: UploadCloud },
                  { step: 5, title: 'Declarations & Review', icon: ShieldCheck },
                ].map((s) => {
                  const isCurrent = currentStep === s.step;
                  const isDone = currentStep > s.step;
                  const Icon = s.icon;

                  return (
                    <button
                      key={s.step}
                      type="button"
                      onClick={() => {
                        // Allow clicking past steps or next if valid
                        if (isDone || s.step === currentStep) setCurrentStep(s.step);
                      }}
                      className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all ${
                        isCurrent
                          ? 'bg-slate-900 text-white shadow-sm font-bold'
                          : isDone
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-semibold'
                          : 'bg-white text-slate-400 border border-slate-200 cursor-not-allowed'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold ${
                          isCurrent
                            ? 'bg-teal-400 text-slate-950'
                            : isDone
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isDone ? <Check className="w-3.5 h-3.5" /> : s.step}
                      </div>
                      <div className="hidden sm:block truncate text-[11px]">
                        {s.title}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step Body Content Canvas */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
              {/* ------------------------------------------------------------- */}
              {/* STEP 1: Conference, Track, Topic & Submission Type Selection */}
              {/* ------------------------------------------------------------- */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  {/* Conference Name Selection & Customization */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-teal-700" />
                        <h3 className="text-sm font-bold text-slate-900">Target Conference Venue</h3>
                      </div>
                      <span className="text-[10px] text-slate-500">General & Multi-Venue Compatible</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label
                        className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                          conferenceChoice === 'current'
                            ? 'bg-white border-teal-600 ring-2 ring-teal-500/20 shadow-xs'
                            : 'bg-slate-100/70 border-slate-200 hover:bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="conferenceChoice"
                          checked={conferenceChoice === 'current'}
                          onChange={() => setConferenceChoice('current')}
                          className="mt-0.5 text-teal-600 focus:ring-teal-500"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{conference.name}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {conference.location} • {conference.year} ({conference.acronym})
                          </div>
                        </div>
                      </label>

                      <label
                        className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                          conferenceChoice === 'custom'
                            ? 'bg-white border-teal-600 ring-2 ring-teal-500/20 shadow-xs'
                            : 'bg-slate-100/70 border-slate-200 hover:bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="conferenceChoice"
                          checked={conferenceChoice === 'custom'}
                          onChange={() => setConferenceChoice('custom')}
                          className="mt-0.5 text-teal-600 focus:ring-teal-500"
                        />
                        <div>
                          <div className="font-bold text-slate-900">Enter Custom Conference Name</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Specify any custom conference, journal, or workshop name manually
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Custom Conference Input */}
                    {conferenceChoice === 'custom' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                        <div className="sm:col-span-2">
                          <label className="font-bold text-slate-700 block mb-1">
                            Conference Full Title *
                          </label>
                          <input
                            type="text"
                            value={customConferenceName}
                            onChange={(e) => setCustomConferenceName(e.target.value)}
                            placeholder="e.g. International Conference on Machine Learning (ICML 2026)"
                            className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none bg-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">
                            Acronym / Short Code
                          </label>
                          <input
                            type="text"
                            value={customConferenceAcronym}
                            onChange={(e) => setCustomConferenceAcronym(e.target.value)}
                            placeholder="e.g. ICML-2026"
                            className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none bg-white font-medium"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Track & Submission Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Track Selection */}
                    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-teal-600" />
                          Conference Track Selection
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsCustomTrack(!isCustomTrack)}
                          className="text-[11px] text-teal-600 hover:text-teal-800 font-semibold underline"
                        >
                          {isCustomTrack ? 'Choose from list' : '+ Type custom track'}
                        </button>
                      </div>

                      {!isCustomTrack ? (
                        <select
                          value={selectedTrackId}
                          onChange={(e) => setSelectedTrackId(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:border-teal-500 focus:outline-none"
                        >
                          {conference.tracks.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name} ({t.shortCode})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={customTrackName}
                          onChange={(e) => setCustomTrackName(e.target.value)}
                          placeholder="e.g. Track 6: Neuromorphic Computing & Edge Hardware"
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:border-teal-500 focus:outline-none"
                        />
                      )}
                      <p className="text-[10px] text-slate-400">
                        Tracks determine Area Chairs and reviewer pool allocation.
                      </p>
                    </div>

                    {/* Submission Type */}
                    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                      <label className="font-bold text-slate-800 flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-teal-600" />
                        Submission Format & Type
                      </label>

                      <select
                        value={submissionType}
                        onChange={(e) => setSubmissionType(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:border-teal-500 focus:outline-none"
                      >
                        <option value="Full Research Paper">Full Research Paper (up to 10 pages + refs)</option>
                        <option value="Short Research Paper">Short Paper / Work-in-Progress (up to 4 pages)</option>
                        <option value="Extended Abstract">Extended Abstract (2 pages)</option>
                        <option value="Demo & Poster Track">Demo & System Artifact (2 pages + video)</option>
                        <option value="Position & Vision Paper">Position & Vision Paper (6 pages)</option>
                        <option value="Artifact & Dataset Track">Reproducible Dataset / Benchmark Track (8 pages)</option>
                      </select>
                      <p className="text-[10px] text-slate-400">
                        Select according to call-for-papers page limit instructions.
                      </p>
                    </div>
                  </div>

                  {/* Topic Classification (Single, Preset & Bulk) */}
                  <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-teal-600" />
                          <h4 className="font-bold text-slate-900">Topic Classification & Taxonomy</h4>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Add topics manually or in bulk to calibrate reviewer bidding and COI matching.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsBulkTopicOpen(!isBulkTopicOpen)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-bold border border-teal-200 transition-all"
                        >
                          <FolderPlus className="w-3.5 h-3.5" />
                          <span>{isBulkTopicOpen ? 'Hide Bulk Importer' : 'Bulk Import Topics'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Bulk Topics Drawer */}
                    {isBulkTopicOpen && (
                      <div className="p-4 bg-teal-950 text-white rounded-xl space-y-3 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-teal-300">Bulk Paste Topic Names</span>
                          <span className="text-[10px] text-slate-400">Comma, semicolon, or newline separated</span>
                        </div>
                        <textarea
                          rows={3}
                          value={bulkTopicInput}
                          onChange={(e) => setBulkTopicInput(e.target.value)}
                          placeholder="Reinforcement Learning, Robotics, Autonomous Vehicles, Edge Acceleration; Cyber-Physical Systems&#10;Quantum Machine Learning"
                          className="w-full p-2.5 rounded-lg bg-slate-900 border border-teal-700/50 text-white text-xs focus:outline-none focus:border-teal-400"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setBulkTopicInput('')}
                            className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-xs text-slate-300"
                          >
                            Clear
                          </button>
                          <button
                            type="button"
                            onClick={handleBulkTopicsImport}
                            className="px-4 py-1 rounded bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs"
                          >
                            Parse & Add All Topics
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Manual Single Topic Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={singleTopicInput}
                        onChange={(e) => setSingleTopicInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSingleTopic();
                          }
                        }}
                        placeholder="Type a custom topic name and press Enter..."
                        className="flex-1 p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSingleTopic()}
                        className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Topic</span>
                      </button>
                    </div>

                    {/* Active Selected Topics Chips */}
                    <div>
                      <span className="font-bold text-slate-700 block mb-2">
                        Selected Topics for Manuscript ({selectedTopics.length}):
                      </span>
                      {selectedTopics.length === 0 ? (
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs">
                          Please select or enter at least one topic.
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {selectedTopics.map((t) => (
                            <span
                              key={t}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-900 font-bold text-xs border border-teal-200"
                            >
                              <span>{t}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveTopic(t)}
                                className="text-teal-700 hover:text-rose-600"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Chair Curated Conference Topics & Presets */}
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            Available Conference Topics ({topics.filter((t) => t.isActive !== false).length}):
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-semibold">
                            Chair Curated
                          </span>
                        </div>

                        {/* Search in topic list */}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={topicSearchTerm}
                            onChange={(e) => setTopicSearchTerm(e.target.value)}
                            placeholder="Filter topics list..."
                            className="text-[11px] px-2.5 py-1 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500 bg-slate-50 focus:bg-white"
                          />
                          {(activePersona === 'chair' || activePersona === 'track_chair' || currentUser.role === 'chair') && (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                setActiveView('topics');
                              }}
                              className="text-[11px] font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 hover:underline"
                              title="Go to Chair Topic Management Panel"
                            >
                              <span>Edit Topics</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Display Topics from Context */}
                      <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                        {/* 1. Track Recommended Topics */}
                        {(() => {
                          const activeTrackObj = conference.tracks.find((t) => t.id === selectedTrackId);
                          const trackTopics = topics.filter(
                            (t) =>
                              t.isActive !== false &&
                              (t.trackId === selectedTrackId || (!isCustomTrack && t.trackId === selectedTrackId)) &&
                              (!topicSearchTerm || t.name.toLowerCase().includes(topicSearchTerm.toLowerCase()) || t.category?.toLowerCase().includes(topicSearchTerm.toLowerCase()))
                          );

                          if (trackTopics.length === 0) return null;

                          return (
                            <div className="space-y-1.5 p-3 rounded-xl bg-teal-50/50 border border-teal-200/80">
                              <div className="flex items-center justify-between text-[10px] font-bold text-teal-900">
                                <span className="flex items-center gap-1.5">
                                  <Sparkles className="w-3 h-3 text-teal-600" />
                                  <span>Recommended for {activeTrackObj?.name || 'Selected Track'}:</span>
                                </span>
                                <span className="text-[9px] text-teal-700 font-semibold">{trackTopics.length} topics</span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {trackTopics.map((topic) => {
                                  const isAdded = selectedTopics.includes(topic.name);
                                  return (
                                    <button
                                      key={topic.id}
                                      type="button"
                                      onClick={() => (isAdded ? handleRemoveTopic(topic.name) : handleAddSingleTopic(topic.name))}
                                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                                        isAdded
                                          ? 'bg-teal-600 text-white shadow-xs font-bold'
                                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-teal-300/80 shadow-2xs'
                                      }`}
                                    >
                                      <span>{isAdded ? `✓ ${topic.name}` : `+ ${topic.name}`}</span>
                                      {topic.isChairCustom && (
                                        <span className={`text-[8px] px-1 py-0.2 rounded font-bold ${isAdded ? 'bg-teal-800 text-teal-100' : 'bg-amber-100 text-amber-800'}`}>
                                          Custom
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}

                        {/* 2. Cross-Track & Other Topics */}
                        {(() => {
                          const otherTopics = topics.filter(
                            (t) =>
                              t.isActive !== false &&
                              t.trackId !== selectedTrackId &&
                              (!topicSearchTerm || t.name.toLowerCase().includes(topicSearchTerm.toLowerCase()) || t.category?.toLowerCase().includes(topicSearchTerm.toLowerCase()))
                          );

                          if (otherTopics.length === 0) return null;

                          return (
                            <div className="space-y-1.5">
                              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Cross-Track & Additional Taxonomy:
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {otherTopics.map((topic) => {
                                  const isAdded = selectedTopics.includes(topic.name);
                                  return (
                                    <button
                                      key={topic.id}
                                      type="button"
                                      onClick={() => (isAdded ? handleRemoveTopic(topic.name) : handleAddSingleTopic(topic.name))}
                                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                                        isAdded
                                          ? 'bg-teal-600 text-white shadow-xs font-bold'
                                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                                      }`}
                                    >
                                      <span>{isAdded ? `✓ ${topic.name}` : `+ ${topic.name}`}</span>
                                      {topic.isChairCustom && (
                                        <span className={`text-[8px] px-1 py-0.2 rounded font-bold ${isAdded ? 'bg-teal-800 text-teal-100' : 'bg-amber-100 text-amber-800'}`}>
                                          Custom
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* STEP 2: Manuscript Metadata, Title, Abstract & Keywords       */}
              {/* ------------------------------------------------------------- */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  {/* Manuscript Title */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-800 text-sm">
                        Manuscript Title *
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {title.length} characters
                      </span>
                    </div>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Scalable Sparse Attention for 100k-Token Context Windows in Edge Neuromorphic Accelerators"
                      className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none font-bold"
                    />
                  </div>

                  {/* Short / Running Title */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                    <label className="font-bold text-slate-700 block">
                      Short / Running Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={shortTitle}
                      onChange={(e) => setShortTitle(e.target.value)}
                      placeholder="e.g. Sparse Attention on Edge Neuromorphic"
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400">Used for running page headers in proceedings.</p>
                  </div>

                  {/* Abstract Textarea with Word Count */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-800 text-sm">
                        Structured Abstract *
                      </label>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                            abstractWordCount >= 150 && abstractWordCount <= 350
                              ? 'bg-emerald-100 text-emerald-800'
                              : abstractWordCount > 350
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {abstractWordCount} Words (Recommended: 150–300 words)
                        </span>
                      </div>
                    </div>
                    <textarea
                      rows={7}
                      required
                      value={abstract}
                      onChange={(e) => setAbstract(e.target.value)}
                      placeholder="State the core research problem, methodology, empirical findings, and primary contributions of your manuscript..."
                      className="w-full p-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none leading-relaxed text-xs"
                    />
                  </div>

                  {/* Keywords & AI Extractor */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-800">
                        Manuscript Keywords ({keywords.length})
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleAiSuggestKeywords}
                          disabled={isAiSuggestedKeywordsLoading}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-[11px] border border-teal-200"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                          <span>{isAiSuggestedKeywordsLoading ? 'Extracting...' : 'AI Keyword Extractor'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsBulkKeywordOpen(!isBulkKeywordOpen)}
                          className="text-[11px] text-teal-700 font-semibold underline"
                        >
                          {isBulkKeywordOpen ? 'Hide Bulk' : 'Bulk Paste Keywords'}
                        </button>
                      </div>
                    </div>

                    {isBulkKeywordOpen && (
                      <div className="p-3 bg-slate-900 text-white rounded-xl space-y-2">
                        <textarea
                          rows={2}
                          value={bulkKeywordInput}
                          onChange={(e) => setBulkKeywordInput(e.target.value)}
                          placeholder="sparsity, transformers, edge-ai, hardware-acceleration, zero-shot"
                          className="w-full p-2 text-xs bg-slate-800 rounded border border-slate-700 text-white focus:outline-none"
                        />
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={handleBulkKeywordsImport}
                            className="px-3 py-1 rounded bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs"
                          >
                            Add Keywords
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={singleKeywordInput}
                        onChange={(e) => setSingleKeywordInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSingleKeyword();
                          }
                        }}
                        placeholder="Add a keyword tag and press Enter..."
                        className="flex-1 p-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSingleKeyword()}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs"
                      >
                        + Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {keywords.map((kw) => (
                        <span
                          key={kw}
                          className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-200 flex items-center gap-1"
                        >
                          <span>#{kw}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveKeyword(kw)}
                            className="text-slate-400 hover:text-rose-600"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Special Awards / Track Flags */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-700 block">Special Recognition & Badges:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isStudentBestPaper}
                          onChange={(e) => setIsStudentBestPaper(e.target.checked)}
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-slate-700 font-medium">
                          Nominate for Best Student Paper Award (Primary author is a full-time student)
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isReproducibilityTrack}
                          onChange={(e) => setIsReproducibilityTrack(e.target.checked)}
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-slate-700 font-medium">
                          Candidate for ACM/IEEE Open Artifact & Reproducibility Badge
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* STEP 3: Authors & Co-Authors Management                       */}
              {/* ------------------------------------------------------------- */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Users className="w-4 h-4 text-teal-600" />
                        Author Roster & Authorship Order ({authors.length})
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Manage authorship sequence, corresponding contact, and conflict-of-interest declarations.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsBulkAuthorOpen(!isBulkAuthorOpen)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-all"
                      >
                        {isBulkAuthorOpen ? 'Hide Bulk Importer' : 'Bulk Import Co-Authors'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddAuthorDrawerOpen(!isAddAuthorDrawerOpen)}
                        className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Co-Author</span>
                      </button>
                    </div>
                  </div>

                  {/* Bulk Author Importer Drawer */}
                  {isBulkAuthorOpen && (
                    <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-teal-300">Bulk Paste Co-Authors</span>
                        <span className="text-[10px] text-slate-400">
                          Format: Name, Email, Institution, Country (one per line)
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        value={bulkAuthorText}
                        onChange={(e) => setBulkAuthorText(e.target.value)}
                        placeholder={`Dr. John Smith, jsmith@stanford.edu, Stanford University, United States\nAlice Wang <alice@oxford.ac.uk> (University of Oxford, United Kingdom)\nMarcus Rivera, m.rivera@ethz.ch, ETH Zurich, Switzerland`}
                        className="w-full p-3 bg-slate-800 rounded-xl border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-teal-400"
                      />
                      {bulkParseError && (
                        <div className="text-rose-400 text-xs flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{bulkParseError}</span>
                        </div>
                      )}
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setBulkAuthorText('')}
                          className="px-3 py-1 rounded-lg bg-white/10 text-slate-300 hover:bg-white/20"
                        >
                          Clear
                        </button>
                        <button
                          type="button"
                          onClick={handleBulkAuthorsImport}
                          className="px-4 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold"
                        >
                          Parse & Append Authors
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Add Author Modal / Form */}
                  {isAddAuthorDrawerOpen && (
                    <form onSubmit={handleAddSingleAuthor} className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-teal-200">
                        <span className="font-bold text-teal-950 text-xs">Add Single Co-Author</span>
                        <button
                          type="button"
                          onClick={() => setIsAddAuthorDrawerOpen(false)}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          &times;
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                          <input
                            type="text"
                            required
                            value={newAuthorName}
                            onChange={(e) => setNewAuthorName(e.target.value)}
                            placeholder="e.g. Prof. Michael Jordan"
                            className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
                          <input
                            type="email"
                            required
                            value={newAuthorEmail}
                            onChange={(e) => setNewAuthorEmail(e.target.value)}
                            placeholder="e.g. jordan@berkeley.edu"
                            className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="font-bold text-slate-700 block mb-1">Affiliation / Institution *</label>
                          <input
                            type="text"
                            required
                            value={newAuthorAffiliation}
                            onChange={(e) => setNewAuthorAffiliation(e.target.value)}
                            placeholder="e.g. UC Berkeley / Lawrence Berkeley Lab"
                            className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Country</label>
                          <input
                            type="text"
                            value={newAuthorCountry}
                            onChange={(e) => setNewAuthorCountry(e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">ORCID iD</label>
                          <input
                            type="text"
                            value={newAuthorOrcid}
                            onChange={(e) => setNewAuthorOrcid(e.target.value)}
                            placeholder="0000-0002-1825-0000"
                            className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Authorship Role</label>
                          <select
                            value={newAuthorRole}
                            onChange={(e) => setNewAuthorRole(e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                          >
                            <option value="Co-Author">Co-Author</option>
                            <option value="Senior Author / PI">Senior Author / PI</option>
                            <option value="Student Researcher">Student Researcher</option>
                            <option value="Industry Collaborator">Industry Collaborator</option>
                          </select>
                        </div>
                        <div className="flex items-center pt-5">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newAuthorIsStudent}
                              onChange={(e) => setNewAuthorIsStudent(e.target.checked)}
                              className="rounded text-teal-600"
                            />
                            <span className="font-semibold text-slate-700">Student Author</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsAddAuthorDrawerOpen(false)}
                          className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold"
                        >
                          Add to Roster
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Author Table / Roster */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="p-3 w-16 text-center">Order</th>
                          <th className="p-3">Author Name & Email</th>
                          <th className="p-3">Affiliation & Country</th>
                          <th className="p-3 text-center">Corresponding</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {authors.map((auth, idx) => (
                          <tr key={auth.id} className="hover:bg-slate-50/80 transition-colors">
                            {/* Order reordering */}
                            <td className="p-3 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1">
                                <span className="font-mono font-bold w-5">{auth.order}</span>
                                <div className="flex flex-col">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => handleMoveAuthor(idx, 'up')}
                                    className="text-slate-400 hover:text-slate-700 disabled:opacity-20"
                                    title="Move Up"
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === authors.length - 1}
                                    onClick={() => handleMoveAuthor(idx, 'down')}
                                    className="text-slate-400 hover:text-slate-700 disabled:opacity-20"
                                    title="Move Down"
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* Author Name */}
                            <td className="p-3">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900">{auth.name}</span>
                                {auth.isStudent && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-bold">
                                    Student
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400">{auth.email}</div>
                              {auth.orcid && (
                                <div className="text-[10px] text-emerald-700 font-mono">
                                  ORCID: {auth.orcid}
                                </div>
                              )}
                            </td>

                            {/* Affiliation */}
                            <td className="p-3">
                              <div className="text-slate-800">{auth.affiliation}</div>
                              <div className="text-[10px] text-slate-400">{auth.country}</div>
                            </td>

                            {/* Corresponding toggle */}
                            <td className="p-3 text-center">
                              <input
                                type="radio"
                                name="correspondingAuthor"
                                checked={auth.isCorresponding}
                                onChange={() => handleSetCorresponding(auth.id)}
                                className="text-teal-600 focus:ring-teal-500"
                                title="Set as primary corresponding author"
                              />
                            </td>

                            {/* Delete */}
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                disabled={authors.length <= 1}
                                onClick={() => handleRemoveAuthor(auth.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-20"
                                title="Remove Author"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-blue-900 text-xs flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Conflict of Interest Note:</strong> Automatic COI algorithms will block any program committee member sharing email domains or co-authorship within the past 36 months from reviewing this manuscript.
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* STEP 4: Manuscript & Artifact Uploads                         */}
              {/* ------------------------------------------------------------- */}
              {currentStep === 4 && (
                <div className="space-y-5">
                  {/* PDF Upload Dropzone */}
                  <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <UploadCloud className="w-4 h-4 text-teal-600" />
                        Main Manuscript PDF (Double-Blind Anonymized) *
                      </label>
                      <span className="text-[10px] text-slate-400">PDF format • Max 25 MB</span>
                    </div>

                    <div className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-teal-50/20 transition-all cursor-pointer relative">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleSimulateFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <FileText className="w-10 h-10 text-teal-600 mx-auto mb-2" />
                      <div className="font-bold text-slate-800 text-xs">
                        Drag and drop your anonymous manuscript PDF here, or <span className="text-teal-600 underline">browse computer</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Must follow IEEE / ACM double-blind guidelines with all author names and grant acknowledgments redacted.
                      </div>
                    </div>

                    {/* Pre-Flight Health Checks */}
                    {uploadedFile && (
                      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span className="font-bold text-emerald-950">{uploadedFile.name}</span>
                          </div>
                          <span className="font-mono text-[11px] text-emerald-800 font-semibold">
                            {uploadedFile.sizeMb} MB • ~{uploadedFile.pageCount} Pages
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-emerald-200/60 text-[11px]">
                          <div className="flex items-center gap-1.5 text-emerald-800">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>PDF/A Font Embedding Valid</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-800">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Double-Blind Check Passed</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-800">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Within 10-Page Limit</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Supplementary Artifacts & Reproducibility Links */}
                  <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-teal-600" />
                      Supplementary Materials & Open Science Artifacts (Optional)
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          Code Repository / Anonymous GitHub URL
                        </label>
                        <input
                          type="url"
                          value={codeRepoUrl}
                          onChange={(e) => setCodeRepoUrl(e.target.value)}
                          placeholder="https://anonymous.4open.science/r/project"
                          className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          Dataset / Benchmark Repository (Zenodo/HuggingFace)
                        </label>
                        <input
                          type="url"
                          value={datasetUrl}
                          onChange={(e) => setDatasetUrl(e.target.value)}
                          placeholder="https://zenodo.org/record/..."
                          className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Presentation Format Preference
                      </label>
                      <select
                        value={presentationPreference}
                        onChange={(e) => setPresentationPreference(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                      >
                        <option value="In-Person Oral">In-Person Oral Presentation (Main Auditorium)</option>
                        <option value="In-Person Poster">In-Person Interactive Poster Session</option>
                        <option value="Virtual Live Stream">Virtual Live Stream (Hybrid Attendance)</option>
                        <option value="Flexible / Either">Flexible / Either Oral or Poster</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* STEP 5: Ethical Declarations, Checklist & Pre-Submit Review  */}
              {/* ------------------------------------------------------------- */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  {/* Academic Pledges & Ethical Declarations */}
                  <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-teal-600" />
                      Academic Ethics & Compliance Pledges
                    </h3>

                    <div className="space-y-3">
                      <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          required
                          checked={isDoubleBlindCompliant}
                          onChange={(e) => setIsDoubleBlindCompliant(e.target.checked)}
                          className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                        />
                        <div>
                          <div className="font-bold text-slate-900">
                            Double-Blind Compliance Pledge *
                          </div>
                          <div className="text-[11px] text-slate-500">
                            I confirm that all identifying author information, institutional affiliations, and grant acknowledgments have been thoroughly removed from the PDF manuscript and headers.
                          </div>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          required
                          checked={isOriginalityPledged}
                          onChange={(e) => setIsOriginalityPledged(e.target.checked)}
                          className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                        />
                        <div>
                          <div className="font-bold text-slate-900">
                            Originality & Dual-Submission Policy *
                          </div>
                          <div className="text-[11px] text-slate-500">
                            This manuscript represents original research and is not currently under review with any other archival conference, journal, or workshop.
                          </div>
                        </div>
                      </label>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <label className="font-bold text-slate-900 block">
                          AI / LLM Transparency & Assistance Disclosure:
                        </label>
                        <select
                          value={aiUsageDisclosure}
                          onChange={(e) => setAiUsageDisclosure(e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs font-medium"
                        >
                          <option value="No AI assistance used in manuscript preparation.">
                            No AI assistance used in manuscript preparation
                          </option>
                          <option value="AI used for language polishing and grammar refinement only (no synthetic data or automated reasoning claims).">
                            AI used for language polishing & grammar only
                          </option>
                          <option value="AI used for exploratory coding / ideation with full transparency disclosed in paper.">
                            AI used for exploratory coding / ideation with full transparency
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Pre-Submission Comprehensive Visual Summary */}
                  <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                          Pre-Flight Verification Summary
                        </span>
                        <h4 className="text-base font-bold text-white">Review Before Final Submission</h4>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
                        {submissionType}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block mb-0.5">Target Venue:</span>
                        <span className="font-bold text-slate-100">{effectiveConferenceName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Track:</span>
                        <span className="font-bold text-slate-100">{activeTrackName}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-400 block mb-0.5">Title:</span>
                        <span className="font-bold text-white">{title || 'Untitled Manuscript'}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-400 block mb-0.5">Authors ({authors.length}):</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {authors.map((a) => (
                            <span
                              key={a.id}
                              className="px-2 py-0.5 rounded bg-white/10 text-slate-200 text-[11px]"
                            >
                              {a.order}. {a.name} ({a.affiliation}){a.isCorresponding ? ' [Contact]' : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Topics:</span>
                        <span className="text-teal-300 font-semibold">{selectedTopics.join(', ')}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Uploaded File:</span>
                        <span className="text-slate-200 font-mono">{uploadedFile?.name || 'None'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Footer Navigation */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 shadow-xs transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Step</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs transition-all"
                >
                  Cancel
                </button>

                {currentStep < 5 ? (
                  <button
                    type="button"
                    disabled={!validateStep(currentStep)}
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <span>Continue</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting || !validateStep(5)}
                    onClick={handleFinalSubmit}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 text-white font-bold text-xs shadow-md transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Submitting to Ledger...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Submit Final Manuscript</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
