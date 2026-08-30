import React, { useState, useMemo } from 'react';
import {
  Tag,
  Plus,
  Search,
  Filter,
  Sliders,
  CheckCircle2,
  XCircle,
  FolderPlus,
  Download,
  Upload,
  RefreshCw,
  Edit2,
  Trash2,
  Copy,
  Layers,
  Sparkles,
  ExternalLink,
  Info,
  Check,
  X,
  AlertTriangle,
  ArrowUpDown,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Eye,
  FileText
} from 'lucide-react';
import { useConference } from '../../context/ConferenceContext';
import { Topic, Track } from '../../types';
import { SubmissionWizardModal } from '../common/SubmissionWizardModal';

export const TopicManagementView: React.FC = () => {
  const {
    conference,
    topics,
    addTopic,
    updateTopic,
    deleteTopic,
    toggleTopicStatus,
    bulkAddTopics,
    bulkDeleteTopics,
    resetToDefaultTopics,
    submissions,
    activePersona,
    currentUser,
    logAudit,
    setActiveView,
  } = useConference();

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrackFilter, setSelectedTrackFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<'all' | 'custom' | 'default'>('all');
  const [viewLayout, setViewLayout] = useState<'tracks' | 'categories' | 'table'>('tracks');

  // Modals and Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isPresetsDrawerOpen, setIsPresetsDrawerOpen] = useState(false);
  const [isTestWizardOpen, setIsTestWizardOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [copyNotification, setCopyNotification] = useState<string | null>(null);

  // Form State for Single Topic Modal (Add / Edit)
  const [formName, setFormName] = useState('');
  const [formTrackId, setFormTrackId] = useState<string>(conference.tracks[0]?.id || 'track-1');
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formKeywords, setFormKeywords] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  // Bulk Import Form State
  const [bulkTrackId, setBulkTrackId] = useState<string>(conference.tracks[0]?.id || 'track-1');
  const [bulkCategory, setBulkCategory] = useState('Custom Topic Collection');
  const [bulkText, setBulkText] = useState('');

  // Quick In-line Add Track ID
  const [quickAddTrackId, setQuickAddTrackId] = useState<string | null>(null);
  const [quickAddName, setQuickAddName] = useState('');

  // All distinct categories
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    topics.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set).sort();
  }, [topics]);

  // Compute live submission reference count for each topic
  const topicUsageMap = useMemo(() => {
    const map = new Map<string, number>();
    submissions.forEach((sub) => {
      sub.topics?.forEach((tName) => {
        const normalized = tName.toLowerCase().trim();
        map.set(normalized, (map.get(normalized) || 0) + 1);
      });
    });
    return map;
  }, [submissions]);

  // Filtered Topics list
  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = t.name.toLowerCase().includes(query);
        const matchesDesc = t.description?.toLowerCase().includes(query);
        const matchesCategory = t.category?.toLowerCase().includes(query);
        const matchesKeywords = t.keywords?.some((k) => k.toLowerCase().includes(query));
        if (!matchesName && !matchesDesc && !matchesCategory && !matchesKeywords) return false;
      }

      // Track filter
      if (selectedTrackFilter !== 'all') {
        if (selectedTrackFilter === 'general') {
          if (t.trackId !== 'general') return false;
        } else {
          if (t.trackId !== selectedTrackFilter) return false;
        }
      }

      // Category filter
      if (selectedCategoryFilter !== 'all' && t.category !== selectedCategoryFilter) {
        return false;
      }

      // Status filter
      if (selectedStatusFilter === 'active' && t.isActive === false) return false;
      if (selectedStatusFilter === 'inactive' && t.isActive !== false) return false;

      // Source filter
      if (selectedSourceFilter === 'custom' && !t.isChairCustom) return false;
      if (selectedSourceFilter === 'default' && t.isChairCustom) return false;

      return true;
    });
  }, [
    topics,
    searchQuery,
    selectedTrackFilter,
    selectedCategoryFilter,
    selectedStatusFilter,
    selectedSourceFilter,
  ]);

  // Statistics
  const totalTopicsCount = topics.length;
  const activeTopicsCount = topics.filter((t) => t.isActive !== false).length;
  const customTopicsCount = topics.filter((t) => t.isChairCustom).length;
  const tracksCoveredCount = new Set(topics.map((t) => t.trackId)).size;
  const totalPapersWithTopics = submissions.filter((s) => (s.topics?.length || 0) > 0).length;

  // Open Add Modal
  const handleOpenAddModal = (defaultTrackId?: string) => {
    setEditingTopic(null);
    setFormName('');
    setFormTrackId(defaultTrackId || conference.tracks[0]?.id || 'track-1');
    setFormCategory(allCategories[0] || 'Machine Learning');
    setFormDescription('');
    setFormKeywords('');
    setFormIsActive(true);
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (topic: Topic) => {
    setEditingTopic(topic);
    setFormName(topic.name);
    setFormTrackId(topic.trackId);
    setFormCategory(topic.category || '');
    setFormDescription(topic.description || '');
    setFormKeywords(topic.keywords ? topic.keywords.join(', ') : '');
    setFormIsActive(topic.isActive !== false);
    setIsAddModalOpen(true);
  };

  // Save Topic (Create or Update)
  const handleSaveTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const keywordsArray = formKeywords
      .split(/[,;]+/)
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (editingTopic) {
      updateTopic(editingTopic.id, {
        name: formName.trim(),
        trackId: formTrackId,
        category: formCategory.trim() || 'General Track Topics',
        description: formDescription.trim(),
        keywords: keywordsArray,
        isActive: formIsActive,
      });
    } else {
      addTopic({
        name: formName.trim(),
        trackId: formTrackId,
        category: formCategory.trim() || 'General Track Topics',
        description: formDescription.trim(),
        keywords: keywordsArray,
        isActive: formIsActive,
        isChairCustom: true,
      });
    }

    setIsAddModalOpen(false);
    setEditingTopic(null);
  };

  // Quick In-line Add inside Track
  const handleQuickAddSubmit = (trackId: string) => {
    if (!quickAddName.trim()) return;
    addTopic({
      name: quickAddName.trim(),
      trackId,
      category: 'General Track Topics',
      description: 'Custom topic added via quick add.',
      keywords: [quickAddName.toLowerCase().replace(/\s+/g, '-')],
      isActive: true,
      isChairCustom: true,
    });
    setQuickAddName('');
    setQuickAddTrackId(null);
  };

  // Bulk Import Handler
  const handleBulkImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;

    const names = bulkText
      .split(/[\n,;]+/)
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    bulkAddTopics(bulkTrackId, names, bulkCategory.trim() || 'Imported Topics');
    setBulkText('');
    setIsBulkImportOpen(false);
  };

  // Delete Handler
  const handleDelete = (id: string) => {
    deleteTopic(id);
    setDeleteConfirmId(null);
  };

  // Bulk Select Toggle
  const toggleSelectTopic = (id: string) => {
    setSelectedTopicIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTopicIds.length === filteredTopics.length) {
      setSelectedTopicIds([]);
    } else {
      setSelectedTopicIds(filteredTopics.map((t) => t.id));
    }
  };

  const handleBulkDeleteSelected = () => {
    if (selectedTopicIds.length === 0) return;
    bulkDeleteTopics(selectedTopicIds);
    setSelectedTopicIds([]);
  };

  const handleBulkToggleActive = (activate: boolean) => {
    selectedTopicIds.forEach((id) => {
      const topic = topics.find((t) => t.id === id);
      if (topic && topic.isActive !== activate) {
        toggleTopicStatus(id);
      }
    });
    setSelectedTopicIds([]);
  };

  // Export Topics to CSV or JSON
  const handleExport = (format: 'json' | 'csv') => {
    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(topics, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `${conference.acronym || 'conference'}_topics_taxonomy.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      const headers = ['Topic ID', 'Topic Name', 'Track ID', 'Category', 'Active in Wizard', 'Is Custom', 'Keywords', 'Description'];
      const rows = topics.map((t) => [
        t.id,
        `"${t.name.replace(/"/g, '""')}"`,
        t.trackId,
        `"${(t.category || '').replace(/"/g, '""')}"`,
        t.isActive !== false ? 'Yes' : 'No',
        t.isChairCustom ? 'Yes' : 'No',
        `"${(t.keywords || []).join('; ')}"`,
        `"${(t.description || '').replace(/"/g, '""')}"`,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${conference.acronym || 'conference'}_topics_taxonomy.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }

    setCopyNotification(`Taxonomy exported as ${format.toUpperCase()}`);
    setTimeout(() => setCopyNotification(null), 3000);
  };

  // Standard Presets Bank
  const STANDARD_PRESETS = [
    {
      title: 'ACM Computing Classification System (CCS) AI & Systems',
      description: 'Standard academic classification for machine learning, artificial intelligence, security, and computing systems.',
      trackId: 'track-1',
      category: 'ACM CCS AI Classification',
      topics: [
        'Supervised Learning by Classification',
        'Unsupervised Learning and Cluster Analysis',
        'Kernel Methods and Support Vector Machines',
        'Sequential Decision Making and MDPs',
        'Deep Reinforcement Learning in Continuous Control',
        'Parallel and Distributed Learning Algorithms',
        'Probabilistic Graphical Models',
        'Adversarial Machine Learning & Robustness',
      ],
    },
    {
      title: 'NeurIPS & ICML Modern AI & Foundation Models',
      description: 'Cutting-edge topics covering LLMs, multimodal vision-language models, parameter-efficient fine-tuning, and alignment.',
      trackId: 'track-1',
      category: 'Foundation Models & LLMs',
      topics: [
        'Large Language Model Pretraining and Scaling Laws',
        'Reinforcement Learning from Human Feedback (RLHF) & DPO',
        'Retrieval-Augmented Generation (RAG) & Vector Stores',
        'Multimodal Vision-Language-Action Models',
        'Chain-of-Thought Reasoning & Tool Use in LLMs',
        'Mechanistic Interpretability & Circuit Analysis',
        'Direct Alignment and Red-Teaming Safety Frameworks',
      ],
    },
    {
      title: 'Green Computing & Energy-Aware Systems (IEEE GreenCom)',
      description: 'Topics dedicated to energy harvesting, carbon accounting, low-power neuromorphic hardware, and sustainable datacenter scheduling.',
      trackId: 'track-2',
      category: 'Sustainable Hardware & Edge Systems',
      topics: [
        'Dynamic Voltage and Frequency Scaling (DVFS) for AI Workloads',
        'Carbon-Aware Microservice Orchestration in Kubernetes',
        'In-Memory Computing with Resistive RAM (RRAM)',
        'Heterogeneous Accelerator Scheduling (CPU/GPU/NPU)',
        'Thermal Profiling and Heat Reuse in Green Datacenters',
        'Sub-mW Embedded Neural Processing Units (NPU)',
      ],
    },
    {
      title: 'Climate Change AI (CCAI) & Earth Observation',
      description: 'Applied machine learning for climate change mitigation, adaptation, renewable energy forecasting, and remote sensing.',
      trackId: 'track-4',
      category: 'Climate & Earth Systems',
      topics: [
        'Photovoltaic & Wind Generation Nowcasting',
        'Carbon Capture & Sequestration Flow Modeling',
        'SAR & Optical Satellite Fusion for Forest Degradation',
        'Urban Heat Island Simulation and Building Energy Efficiency',
        'Wildfire Spread Prediction with Neural Cellular Automata',
        'Climate Extremes Downscaling with Physics-Informed ML',
      ],
    },
  ];

  const handleApplyPreset = (preset: typeof STANDARD_PRESETS[0]) => {
    bulkAddTopics(preset.trackId, preset.topics, preset.category);
    setCopyNotification(`Imported ${preset.topics.length} topics from "${preset.title}"`);
    setTimeout(() => setCopyNotification(null), 3500);
    setIsPresetsDrawerOpen(false);
  };

  // Helper track lookups
  const getTrackObj = (trackId: string): Track | undefined => {
    return conference.tracks.find((t) => t.id === trackId);
  };

  const getTrackColorClass = (trackId: string) => {
    if (trackId === 'general') return 'bg-slate-100 text-slate-800 border-slate-300';
    const tr = getTrackObj(trackId);
    if (!tr) return 'bg-slate-100 text-slate-800 border-slate-300';
    switch (tr.color) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'teal':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'indigo':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'blue':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'cyan':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {copyNotification && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white rounded-xl shadow-2xl border border-teal-500/50 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
          <span className="text-xs font-semibold">{copyNotification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Chair Administration Panel
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-300 font-semibold">{conference.name}</span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-teal-400 font-mono">Taxonomy Registry</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Tag className="w-6 h-6 text-teal-400" />
            <span>Conference Topics & Scientific Taxonomy Manager</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Define, customize, and curate conference topic classifications. Topics managed here immediately populate the 
            <strong> Submission Wizard</strong> for authors, drive reviewer expertise matching, and structure committee review assignments.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsTestWizardOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm border border-white/10 transition-all shadow-xs"
            title="Launch the Submission Wizard in test mode to see how topics appear to authors"
          >
            <Eye className="w-4 h-4 text-teal-300" />
            <span>Preview in Wizard</span>
          </button>

          <button
            onClick={() => setIsPresetsDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Taxonomy Presets</span>
          </button>

          <button
            onClick={() => setIsBulkImportOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all shadow-xs"
          >
            <FolderPlus className="w-4 h-4 text-teal-400" />
            <span>Bulk Import</span>
          </button>

          <button
            onClick={() => handleOpenAddModal()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 text-xs font-bold shadow-md shadow-teal-900/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Custom Topic</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span>Total Topics</span>
            <Tag className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-1.5 text-2xl font-black text-slate-900">{totalTopicsCount}</div>
          <div className="mt-1 text-[10px] text-slate-500">Across {conference.tracks.length} tracks</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span>Active in Wizard</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="mt-1.5 text-2xl font-black text-emerald-600">{activeTopicsCount}</div>
          <div className="mt-1 text-[10px] text-emerald-700 font-medium">Available for authors to pick</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span>Chair Custom</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="mt-1.5 text-2xl font-black text-amber-600">{customTopicsCount}</div>
          <div className="mt-1 text-[10px] text-amber-700 font-medium">User-defined taxonomy</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span>Tracks Covered</span>
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="mt-1.5 text-2xl font-black text-indigo-600">
            {tracksCoveredCount} / {conference.tracks.length}
          </div>
          <div className="mt-1 text-[10px] text-indigo-700 font-medium">Full curriculum coverage</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span>Paper References</span>
            <FileText className="w-3.5 h-3.5 text-teal-500" />
          </div>
          <div className="mt-1.5 text-2xl font-black text-teal-600">{totalPapersWithTopics}</div>
          <div className="mt-1 text-[10px] text-teal-700 font-medium">Submissions categorized</div>
        </div>
      </div>

      {/* Main Filter & Action Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics by name, keywords, track, or description..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 bg-slate-50 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Layout Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-auto shrink-0 text-xs">
            <button
              onClick={() => setViewLayout('tracks')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                viewLayout === 'tracks' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              By Track
            </button>
            <button
              onClick={() => setViewLayout('categories')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                viewLayout === 'categories' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              By Category
            </button>
            <button
              onClick={() => setViewLayout('table')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                viewLayout === 'table' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Table View
            </button>
          </div>

          {/* Export & Reset Menu */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
              title="Export as CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            <button
              onClick={() => handleExport('json')}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
              title="Export full taxonomy as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Reset all topics to default initial taxonomy? Any custom topics will be replaced with defaults.')) {
                  resetToDefaultTopics();
                }
              }}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all"
              title="Restore standard conference default topics"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Secondary Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">Filters:</span>
          </div>

          {/* Track Filter */}
          <select
            value={selectedTrackFilter}
            onChange={(e) => setSelectedTrackFilter(e.target.value)}
            className="p-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Tracks ({topics.length})</option>
            {conference.tracks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({topics.filter((x) => x.trackId === t.id).length})
              </option>
            ))}
            <option value="general">General / Cross-Track ({topics.filter((x) => x.trackId === 'general').length})</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="p-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Categories ({allCategories.length})</option>
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat} ({topics.filter((x) => x.category === cat).length})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
            className="p-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active in Wizard ({activeTopicsCount})</option>
            <option value="inactive">Disabled / Draft ({totalTopicsCount - activeTopicsCount})</option>
          </select>

          {/* Source Filter */}
          <select
            value={selectedSourceFilter}
            onChange={(e) => setSelectedSourceFilter(e.target.value as any)}
            className="p-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Sources</option>
            <option value="custom">Chair Custom Only ({customTopicsCount})</option>
            <option value="default">Default Presets ({totalTopicsCount - customTopicsCount})</option>
          </select>

          {(searchQuery || selectedTrackFilter !== 'all' || selectedCategoryFilter !== 'all' || selectedStatusFilter !== 'all' || selectedSourceFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTrackFilter('all');
                setSelectedCategoryFilter('all');
                setSelectedStatusFilter('all');
                setSelectedSourceFilter('all');
              }}
              className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 underline ml-2"
            >
              Reset Filters
            </button>
          )}

          <div className="ml-auto text-[11px] text-slate-400 font-medium">
            Showing <strong className="text-slate-800">{filteredTopics.length}</strong> of {topics.length} topics
          </div>
        </div>

        {/* Bulk Selection Action Bar (when items checked) */}
        {selectedTopicIds.length > 0 && (
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-teal-900 font-semibold">
              <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold">
                {selectedTopicIds.length}
              </span>
              <span>Topics selected</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkToggleActive(true)}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 text-emerald-700 border border-emerald-300 font-bold rounded-lg shadow-xs"
              >
                Enable in Wizard
              </button>
              <button
                onClick={() => handleBulkToggleActive(false)}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold rounded-lg shadow-xs"
              >
                Disable in Wizard
              </button>
              <button
                onClick={handleBulkDeleteSelected}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-xs"
              >
                Delete Selected ({selectedTopicIds.length})
              </button>
              <button
                onClick={() => setSelectedTopicIds([])}
                className="text-slate-500 hover:text-slate-800 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Topics Content Views */}
      {filteredTopics.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Tag className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base">No topics matched your search or filters</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try modifying your search query or clear the active track/category filters to view available taxonomy items.
            </p>
          </div>
          <div className="flex justify-center gap-2 pt-2">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTrackFilter('all');
                setSelectedCategoryFilter('all');
                setSelectedStatusFilter('all');
                setSelectedSourceFilter('all');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
            >
              Clear Filters
            </button>
            <button
              onClick={() => handleOpenAddModal()}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              + Create New Topic
            </button>
          </div>
        </div>
      ) : viewLayout === 'tracks' ? (
        /* ========================================================================= */
        /* LAYOUT 1: Grouped by Conference Track                                     */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Loop over tracks + General */}
          {[
            ...conference.tracks,
            {
              id: 'general',
              name: 'Cross-Track & General Scientific Methodologies',
              shortCode: 'CROSS-TRACK',
              description: 'Methodologies, reproducibility benchmarks, open-science protocols, and interdisciplinary investigations.',
              color: 'slate',
              chairIds: [],
            },
          ].map((track) => {
            const trackTopics = filteredTopics.filter((t) => t.trackId === track.id);
            if (trackTopics.length === 0 && selectedTrackFilter !== 'all' && selectedTrackFilter !== track.id) {
              return null;
            }

            const isAddingHere = quickAddTrackId === track.id;

            return (
              <div
                key={track.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-0"
              >
                {/* Track Card Header */}
                <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getTrackColorClass(track.id)}`}>
                        {track.shortCode}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">{track.name}</h3>
                      <span className="text-[11px] text-slate-400 font-semibold">
                        ({trackTopics.length} topic{trackTopics.length !== 1 ? 's' : ''})
                      </span>
                    </div>
                    {track.description && (
                      <p className="text-xs text-slate-500 line-clamp-1">{track.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        if (isAddingHere) {
                          setQuickAddTrackId(null);
                        } else {
                          setQuickAddTrackId(track.id);
                          setQuickAddName('');
                        }
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 shadow-2xs transition-all"
                    >
                      <Plus className="w-3.5 h-3.5 text-teal-600" />
                      <span>{isAddingHere ? 'Cancel' : 'Quick Add'}</span>
                    </button>
                    <button
                      onClick={() => handleOpenAddModal(track.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-all"
                    >
                      <span>Add Detailed Topic</span>
                    </button>
                  </div>
                </div>

                {/* Quick Add In-line Row */}
                {isAddingHere && (
                  <div className="p-4 bg-teal-50/60 border-b border-teal-200 flex flex-col sm:flex-row gap-2 animate-in fade-in duration-150">
                    <input
                      type="text"
                      autoFocus
                      value={quickAddName}
                      onChange={(e) => setQuickAddName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleQuickAddSubmit(track.id);
                        if (e.key === 'Escape') setQuickAddTrackId(null);
                      }}
                      placeholder={`Enter topic name for ${track.name} and press Enter...`}
                      className="flex-1 p-2 text-xs rounded-xl border border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickAddSubmit(track.id)}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs"
                      >
                        Save Topic
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickAddTrackId(null)}
                        className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs rounded-xl border border-slate-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Topics Grid for this Track */}
                <div className="p-4 sm:p-5">
                  {trackTopics.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-xl">
                      No topics configured for this track yet. Click "Quick Add" or "Add Detailed Topic" above to populate.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {trackTopics.map((topic) => {
                        const usageCount = topicUsageMap.get(topic.name.toLowerCase().trim()) || 0;
                        const isSelected = selectedTopicIds.includes(topic.id);

                        return (
                          <div
                            key={topic.id}
                            className={`p-3.5 rounded-xl border transition-all relative flex flex-col justify-between ${
                              topic.isActive === false
                                ? 'bg-slate-50/70 border-slate-200 opacity-60'
                                : isSelected
                                ? 'bg-teal-50/40 border-teal-400 ring-1 ring-teal-400 shadow-xs'
                                : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs'
                            }`}
                          >
                            <div className="space-y-2">
                              {/* Top Bar: Checkbox & Badges */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleSelectTopic(topic.id)}
                                    className="rounded text-teal-600 focus:ring-teal-500"
                                  />
                                  {topic.isChairCustom && (
                                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                                      Chair Custom
                                    </span>
                                  )}
                                  {topic.category && (
                                    <span className="text-[10px] text-slate-500 font-medium truncate max-w-[140px]">
                                      {topic.category}
                                    </span>
                                  )}
                                </div>

                                {/* Active Switch */}
                                <button
                                  onClick={() => toggleTopicStatus(topic.id)}
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                                    topic.isActive !== false
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                      : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                                  }`}
                                  title={topic.isActive !== false ? 'Topic is active in Submission Wizard' : 'Topic is disabled / hidden'}
                                >
                                  {topic.isActive !== false ? 'Active' : 'Disabled'}
                                </button>
                              </div>

                              {/* Topic Name */}
                              <h4 className="font-bold text-slate-900 text-xs leading-snug">
                                {topic.name}
                              </h4>

                              {/* Description */}
                              {topic.description && (
                                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                  {topic.description}
                                </p>
                              )}

                              {/* Keywords Chips */}
                              {topic.keywords && topic.keywords.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-1">
                                  {topic.keywords.slice(0, 3).map((kw) => (
                                    <span
                                      key={kw}
                                      className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-medium"
                                    >
                                      #{kw}
                                    </span>
                                  ))}
                                  {topic.keywords.length > 3 && (
                                    <span className="text-[9px] text-slate-400">
                                      +{topic.keywords.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Card Footer: Usage Count & Action Buttons */}
                            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-[10px]">
                              <span className="text-slate-500 font-medium">
                                {usageCount > 0 ? (
                                  <span className="text-teal-700 font-bold bg-teal-50 px-1.5 py-0.5 rounded">
                                    {usageCount} paper{usageCount !== 1 ? 's' : ''}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">0 papers</span>
                                )}
                              </span>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleOpenEditModal(topic)}
                                  className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                                  title="Edit topic details"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(topic.id)}
                                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                  title="Delete topic"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : viewLayout === 'categories' ? (
        /* ========================================================================= */
        /* LAYOUT 2: Grouped by Category / Scientific Subdomain                      */
        /* ========================================================================= */
        <div className="space-y-6">
          {allCategories.map((category) => {
            const catTopics = filteredTopics.filter((t) => t.category === category);
            if (catTopics.length === 0) return null;

            return (
              <div
                key={category}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-0"
              >
                <div className="p-4 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                    <h3 className="font-bold text-slate-900 text-sm">{category}</h3>
                    <span className="text-[11px] text-slate-400 font-semibold">
                      ({catTopics.length} topic{catTopics.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {catTopics.map((topic) => {
                      const trackObj = getTrackObj(topic.trackId);
                      const usageCount = topicUsageMap.get(topic.name.toLowerCase().trim()) || 0;

                      return (
                        <div
                          key={topic.id}
                          className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-col justify-between space-y-3"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${getTrackColorClass(topic.trackId)}`}>
                                {trackObj?.shortCode || 'GENERAL'}
                              </span>
                              <button
                                onClick={() => toggleTopicStatus(topic.id)}
                                className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                  topic.isActive !== false
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                                }`}
                              >
                                {topic.isActive !== false ? 'Active' : 'Disabled'}
                              </button>
                            </div>
                            <h4 className="font-bold text-slate-900 text-xs">{topic.name}</h4>
                            {topic.description && (
                              <p className="text-[11px] text-slate-500 line-clamp-2">{topic.description}</p>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
                            <span className="text-slate-400">{usageCount} submissions</span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleOpenEditModal(topic)}
                                className="p-1 text-slate-400 hover:text-slate-800"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(topic.id)}
                                className="p-1 text-slate-400 hover:text-rose-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ========================================================================= */
        /* LAYOUT 3: Dense Flat Table View                                           */
        /* ========================================================================= */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="p-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedTopicIds.length === filteredTopics.length && filteredTopics.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded text-teal-600"
                    />
                  </th>
                  <th className="p-3.5">Topic Name</th>
                  <th className="p-3.5">Assigned Track</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Keywords</th>
                  <th className="p-3.5 text-center">Wizard Status</th>
                  <th className="p-3.5 text-center">Papers</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTopics.map((topic) => {
                  const trackObj = getTrackObj(topic.trackId);
                  const usageCount = topicUsageMap.get(topic.name.toLowerCase().trim()) || 0;
                  const isSelected = selectedTopicIds.includes(topic.id);

                  return (
                    <tr
                      key={topic.id}
                      className={`hover:bg-slate-50/80 transition-all ${
                        isSelected ? 'bg-teal-50/30' : ''
                      } ${topic.isActive === false ? 'opacity-60' : ''}`}
                    >
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectTopic(topic.id)}
                          className="rounded text-teal-600"
                        />
                      </td>

                      <td className="p-3.5 font-bold text-slate-900 max-w-xs">
                        <div className="flex items-center gap-1.5">
                          <span>{topic.name}</span>
                          {topic.isChairCustom && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 shrink-0">
                              Custom
                            </span>
                          )}
                        </div>
                        {topic.description && (
                          <div className="text-[10px] text-slate-400 font-normal truncate mt-0.5">
                            {topic.description}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block ${getTrackColorClass(topic.trackId)}`}>
                          {trackObj?.shortCode || 'CROSS-TRACK'}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-600 font-medium">
                        {topic.category || 'General'}
                      </td>

                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {(topic.keywords || []).slice(0, 2).map((k) => (
                            <span key={k} className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                              #{k}
                            </span>
                          ))}
                          {(topic.keywords || []).length > 2 && (
                            <span className="text-[9px] text-slate-400">+{(topic.keywords || []).length - 2}</span>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => toggleTopicStatus(topic.id)}
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                            topic.isActive !== false
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {topic.isActive !== false ? 'Active' : 'Disabled'}
                        </button>
                      </td>

                      <td className="p-3.5 text-center font-bold text-slate-700">
                        {usageCount > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                            {usageCount}
                          </span>
                        ) : (
                          <span className="text-slate-300">0</span>
                        )}
                      </td>

                      <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEditModal(topic)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(topic.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: Add / Edit Topic Modal                                           */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {editingTopic ? 'Edit Topic Definition' : 'Define New Conference Topic'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Immediately syncs with the Author Submission Wizard
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTopic} className="p-6 space-y-4">
              {/* Topic Name */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Topic Title / Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Sparse Attention & KV-Cache Compression for Edge LLMs"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none font-medium"
                />
              </div>

              {/* Track & Category Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Conference Track *
                  </label>
                  <select
                    value={formTrackId}
                    onChange={(e) => setFormTrackId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:border-teal-500 focus:outline-none"
                  >
                    {conference.tracks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.shortCode})
                      </option>
                    ))}
                    <option value="general">Cross-Track / General</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Scientific Category / Domain
                  </label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g., Architecture Optimization"
                    list="category-suggestions"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none"
                  />
                  <datalist id="category-suggestions">
                    {allCategories.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Scope & Topic Description
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Provide scope guidelines, methodology boundaries, or key problem formulations to assist authors and reviewers..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none"
                />
              </div>

              {/* Recommended Keywords */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Recommended Keywords (Comma separated)
                </label>
                <input
                  type="text"
                  value={formKeywords}
                  onChange={(e) => setFormKeywords(e.target.value)}
                  placeholder="e.g. kv-cache, linear-attention, sub-quadratic, token-compression"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none"
                />
              </div>

              {/* Active Toggle */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 text-xs">Active in Submission Wizard</div>
                  <div className="text-[11px] text-slate-500">
                    When active, authors can immediately pick this topic during manuscript upload
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs"
                >
                  {editingTopic ? 'Save Changes' : 'Register Custom Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Bulk Import Drawer / Modal                                       */}
      {/* ========================================================================= */}
      {isBulkImportOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                  <FolderPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Bulk Topic Importer</h3>
                  <p className="text-[11px] text-slate-500">
                    Paste raw topic titles separated by commas, semicolons, or line breaks
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBulkImportOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBulkImportSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Track *</label>
                  <select
                    value={bulkTrackId}
                    onChange={(e) => setBulkTrackId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                  >
                    {conference.tracks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.shortCode})
                      </option>
                    ))}
                    <option value="general">Cross-Track / General</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category Label</label>
                  <input
                    type="text"
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    placeholder="e.g. Advanced AI Methods"
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-700">Paste Topic Titles *</label>
                  <span className="text-[10px] text-slate-400">
                    {bulkText.split(/[\n,;]+/).filter((x) => x.trim().length > 0).length} topics detected
                  </span>
                </div>
                <textarea
                  rows={6}
                  required
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder="Low-Rank Parameter Efficient Fine-Tuning&#10;Direct Preference Optimization & Alignment&#10;Mechanistic Circuit Discovery; Hardware-Aware Quantization"
                  className="w-full p-3 font-mono text-xs rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-[11px] text-teal-900 leading-relaxed">
                All parsed topics will be registered as <strong>Active</strong> in the specified track and immediately made available in the <strong>Submission Wizard</strong>.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBulkImportOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!bulkText.trim()}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold shadow-xs"
                >
                  Import All Topics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER / MODAL 3: Academic Taxonomy Presets Bank                          */}
      {/* ========================================================================= */}
      {isPresetsDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Academic Taxonomy Preset Banks</h3>
                  <p className="text-[11px] text-slate-500">
                    One-click import curated standard taxonomies from ACM, IEEE, NeurIPS, and CCAI
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPresetsDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {STANDARD_PRESETS.map((preset, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{preset.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{preset.description}</p>
                    </div>
                    <button
                      onClick={() => handleApplyPreset(preset)}
                      className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold shrink-0 shadow-xs"
                    >
                      + Import ({preset.topics.length})
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {preset.topics.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded-md font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsPresetsDrawerOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: Delete Confirmation Modal                                        */}
      {/* ========================================================================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">Delete Topic Classification?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete this topic? It will no longer be available in the Submission Wizard for new submissions.
              </p>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submission Wizard Live Test Modal */}
      <SubmissionWizardModal
        isOpen={isTestWizardOpen}
        onClose={() => setIsTestWizardOpen(false)}
      />
    </div>
  );
};
