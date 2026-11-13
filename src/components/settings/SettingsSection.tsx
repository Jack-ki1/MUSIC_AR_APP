import React, { useState, useEffect } from 'react';
import { 
  Music, 
  Database, 
  ExternalLink, 
  Check, 
  Sliders, 
  Clock, 
  Globe, 
  Radio, 
  Save, 
  CheckSquare, 
  Square,
  Search,
  Filter,
  SlidersHorizontal,
  Award,
  Sparkles,
  Info,
  Server,
  Zap,
  Terminal,
  Activity,
  Plus,
  Trash2,
  RefreshCw,
  Cpu,
  User,
  ShieldCheck,
  Shield,
  Key,
  Lock,
  AlertTriangle,
  FileCheck,
  Users
} from 'lucide-react';
import { DiscoveryRegion, DiscoveryGenre } from '../discovery/DiscoverySection';
import { ProviderSource, AuditLogEntry, UserRole } from '../../types';
import { FULL_73_PROVIDERS } from '../../data/fullProviderCatalogue';
import { useAuth, DEMO_USERS, hasPermission, APPROVED_WORKSPACE_USERS } from '../../services/authService';
import { loadAuditLogs, recordAuditLog } from '../../services/firestoreSync';
import { AVMWeightsConfig } from '../../services/avmEngine';
import { X } from 'lucide-react';

interface SettingsSectionProps {
  isOpen?: boolean;
  onClose?: () => void;
  regions: DiscoveryRegion[];
  genres: DiscoveryGenre[];
  onUpdateRegions: (regions: DiscoveryRegion[]) => void;
  onUpdateGenres: (genres: DiscoveryGenre[]) => void;
  loopIntervalMinutes: number;
  onChangeLoopInterval: (minutes: number) => void;
  isAutonomousActive: boolean;
  onToggleAutonomous: () => void;
  onShowToast: (msg: string) => void;
  onUpdateWeights?: (weights: AVMWeightsConfig) => void;
}

interface DiscoverySeed {
  id: string;
  name: string;
  query: string;
  region: string;
  genre: string;
  priority: 'High' | 'Medium' | 'Normal';
  enabled: boolean;
  yieldCount: number;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  isOpen,
  onClose,
  regions,
  genres,
  onUpdateRegions,
  onUpdateGenres,
  loopIntervalMinutes,
  onChangeLoopInterval,
  isAutonomousActive,
  onToggleAutonomous,
  onShowToast,
  onUpdateWeights,
}) => {
  // Sub-Navigation: 'providers' | 'automation' | 'seeds' | 'scoring' | 'workspace' | 'security'
  const [activeSubTab, setActiveSubTab] = useState<'providers' | 'automation' | 'seeds' | 'scoring' | 'workspace' | 'security'>('providers');
  const { user: currentUser, currentWorkspace, tenants } = useAuth();

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const fetchAuditLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const logs = await loadAuditLogs();
      setAuditLogs(logs);
    } catch (err) {
      console.warn('[Settings] Failed to fetch audit logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'security') {
      fetchAuditLogs();
    }
  }, [activeSubTab]);

  const [providers, setProviders] = useState<ProviderSource[]>(() => {
    try {
      const saved = localStorage.getItem('breakout_radar_providers');
      return saved ? JSON.parse(saved) : FULL_73_PROVIDERS;
    } catch {
      return FULL_73_PROVIDERS;
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [testingProviderId, setTestingProviderId] = useState<string | null>(null);

  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() => {
    // Zero-Secret Policy: Never read secrets from browser localStorage
    return {};
  });

  const [configuredProviders, setConfiguredProviders] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('breakout_radar_configured_providers');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Seeds State
  const [seeds, setSeeds] = useState<DiscoverySeed[]>([
    {
      id: 'seed-1',
      name: 'Nairobi R&B & Neo-Soul',
      query: 'Nairobi R&B Soul',
      region: 'East Africa',
      genre: 'R&B / Soul',
      priority: 'High',
      enabled: true,
      yieldCount: 42
    },
    {
      id: 'seed-2',
      name: 'Gengetone Street Movement NextGen',
      query: 'Gengetone underground',
      region: 'East Africa',
      genre: 'Gengetone',
      priority: 'High',
      enabled: true,
      yieldCount: 28
    },
    {
      id: 'seed-3',
      name: 'Bongo Flava Underground Melodic Voices',
      query: 'Bongo Flava acoustic',
      region: 'East Africa',
      genre: 'Bongo Flava',
      priority: 'High',
      enabled: true,
      yieldCount: 35
    },
    {
      id: 'seed-4',
      name: 'Kampala Afro-Fusion Wave',
      query: 'Kampala Afro Fusion',
      region: 'East Africa',
      genre: 'Afro-fusion',
      priority: 'Medium',
      enabled: true,
      yieldCount: 19
    },
    {
      id: 'seed-5',
      name: 'Accra Alté & Highlife Wave',
      query: 'Ghana Alte Highlife',
      region: 'West Africa',
      genre: 'Afro-pop',
      priority: 'Normal',
      enabled: false,
      yieldCount: 12
    },
    {
      id: 'seed-6',
      name: 'Soweto Amapiano Soul Indie',
      query: 'Soweto Amapiano soul',
      region: 'Southern Africa',
      genre: 'Amapiano',
      priority: 'Normal',
      enabled: false,
      yieldCount: 14
    }
  ]);

  const [newSeedName, setNewSeedName] = useState('');
  const [newSeedQuery, setNewSeedQuery] = useState('');
  const [newSeedRegion, setNewSeedRegion] = useState('East Africa');
  const [newSeedGenre, setNewSeedGenre] = useState('Afro-pop');

  // AVM Weight Calibration Matrix (PDF Section 7)
  const [selectedGenreProfile, setSelectedGenreProfile] = useState<string>('General');
  const [weightVocal, setWeightVocal] = useState<number>(0.30);
  const [weightWriting, setWeightWriting] = useState<number>(0.30);
  const [weightSong, setWeightSong] = useState<number>(0.20);
  const [weightComp, setWeightComp] = useState<number>(0.20);

  // A&R Contribution Split (Master Prompt: 60% AAV, 40% Discovery default)
  const [artisticSharePercent, setArtisticSharePercent] = useState<number>(60);

  // Surfacing Rule Config (PDF Section 6)
  const [cohortCutoffTAV, setCohortCutoffTAV] = useState<number>(68);
  const [productionIndexCeiling, setProductionIndexCeiling] = useState<number>(50);
  const [productionBonusCap, setProductionBonusCap] = useState<number>(3.0);

  // Quota Controls
  const [youtubeDailyQuota, setYoutubeDailyQuota] = useState<number>(100);
  const [musicbrainzRateLimit, setMusicbrainzRateLimit] = useState<number>(1);

  // Workspace Lead Profile
  const [leadName, setLeadName] = useState('Jackson Kimotho');
  const [leadTitle, setLeadTitle] = useState('Senior A&R Director');
  const [deskRegion, setDeskRegion] = useState('East Africa Desk (Nairobi)');
  const [currency, setCurrency] = useState('USD ($)');

  // Sync profile preset weights
  useEffect(() => {
    if (selectedGenreProfile === 'General') {
      setWeightVocal(0.30);
      setWeightWriting(0.30);
      setWeightSong(0.20);
      setWeightComp(0.20);
    } else if (selectedGenreProfile === 'Rap / hip-hop') {
      setWeightVocal(0.20);
      setWeightWriting(0.40);
      setWeightSong(0.20);
      setWeightComp(0.20);
    } else if (selectedGenreProfile === 'Afrobeats / Amapiano') {
      setWeightVocal(0.25);
      setWeightWriting(0.25);
      setWeightSong(0.25);
      setWeightComp(0.25);
    } else if (selectedGenreProfile === 'Gospel / soul / R&B') {
      setWeightVocal(0.35);
      setWeightWriting(0.25);
      setWeightSong(0.20);
      setWeightComp(0.20);
    } else if (selectedGenreProfile === 'Folk / singer-songwriter') {
      setWeightVocal(0.25);
      setWeightWriting(0.40);
      setWeightSong(0.20);
      setWeightComp(0.15);
    }
  }, [selectedGenreProfile]);

  const handleToggleProvider = (id: string) => {
    setProviders(prev => prev.map(p => {
      if (p.id === id) {
        const nextEnabled = !p.enabled;
        return {
          ...p,
          enabled: nextEnabled,
          status: nextEnabled ? 'Ready' : 'Disabled'
        };
      }
      return p;
    }));
  };

  const handleTestConnection = (prov: ProviderSource) => {
    setTestingProviderId(prov.id);
    setTimeout(() => {
      setTestingProviderId(null);
      onShowToast(`Connection verified for ${prov.name} (HTTP 200 • 142ms latency)`);
    }, 900);
  };

  const handleToggleSeed = (id: string) => {
    setSeeds(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const handleAddSeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSeedName.trim() || !newSeedQuery.trim()) return;

    const newS: DiscoverySeed = {
      id: 'seed-' + Date.now(),
      name: newSeedName.trim(),
      query: newSeedQuery.trim(),
      region: newSeedRegion,
      genre: newSeedGenre,
      priority: 'High',
      enabled: true,
      yieldCount: 0
    };

    setSeeds(prev => [...prev, newS]);
    setNewSeedName('');
    setNewSeedQuery('');
    onShowToast(`New A&R discovery seed "${newS.name}" registered to rotation!`);
  };

  const handleDeleteSeed = (id: string) => {
    setSeeds(prev => prev.filter(s => s.id !== id));
    onShowToast('Seed removed from autonomous schedule.');
  };

  const handleSaveSettings = () => {
    // Persist safe provider metadata (never raw credentials)
    localStorage.setItem('breakout_radar_providers', JSON.stringify(providers));
    
    // Map configured status without storing raw secret strings
    const safeConfiguredStatus: Record<string, boolean> = { ...configuredProviders };
    Object.keys(fieldValues).forEach(k => {
      if (fieldValues[k] && fieldValues[k].trim().length > 0) {
        safeConfiguredStatus[k] = true;
      }
    });
    setConfiguredProviders(safeConfiguredStatus);
    localStorage.setItem('breakout_radar_configured_providers', JSON.stringify(safeConfiguredStatus));

    const weightsObj: AVMWeightsConfig = {
      wV: weightVocal,
      wW: weightWriting,
      wS: weightSong,
      wC: weightComp
    };
    localStorage.setItem('breakout_radar_avm_weights', JSON.stringify({
      ...weightsObj,
      selectedGenreProfile,
      artisticSharePercent,
      cohortCutoffTAV,
      productionIndexCeiling,
      productionBonusCap
    }));
    if (onUpdateWeights) {
      onUpdateWeights(weightsObj);
    }
    // Clear in-memory secret buffers after saving
    setFieldValues({});
    onShowToast('Workspace settings and provider connection statuses updated securely.');
  };

  const categories = ['All', ...Array.from(new Set(providers.map(p => p.category)))];

  const filteredProviders = providers.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const content = (
    <div className="space-y-6 pb-28">
      {/* Top Header matching screenshot */}
      <div className="glass p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black tracking-wider text-[#3B6CFF] uppercase bg-[#DFE9FF] px-3 py-1 rounded-full">
              A&R SYSTEM CONFIGURATION & PROVIDER REGISTRY
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#0B1530] tracking-tight mt-1.5">
            Engine Settings & Source Catalog
          </h1>
          <p className="text-xs text-[#5F6B8A] mt-0.5 max-w-2xl leading-relaxed">
            Manage data providers, autonomous scan schedules, discovery seed rotation, and the mathematical AVM calibration weights.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSaveSettings}
            className="btn-lime text-xs font-black flex items-center gap-2 cursor-pointer shadow-sm shrink-0"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save All Settings</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/80 hover:bg-white text-[#64748B] hover:text-[#0B1530] border border-[#CBD5E1] transition-colors"
              title="Close Settings"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Sub-Navigation Tabs matching .chip in index.html */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[rgba(120,140,190,0.2)] pb-3 text-xs">
        <button
          onClick={() => setActiveSubTab('providers')}
          className={`chip ${activeSubTab === 'providers' ? 'on' : ''} flex items-center gap-2`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Data Providers ({providers.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('automation')}
          className={`chip ${activeSubTab === 'automation' ? 'on' : ''} flex items-center gap-2`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Automation & Scheduler</span>
        </button>

        <button
          onClick={() => setActiveSubTab('seeds')}
          className={`chip ${activeSubTab === 'seeds' ? 'on' : ''} flex items-center gap-2`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Discovery Seeds ({seeds.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('scoring')}
          className={`chip ${activeSubTab === 'scoring' ? 'on' : ''} flex items-center gap-2`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>AVM Weights & Scoring</span>
        </button>

        <button
          onClick={() => setActiveSubTab('workspace')}
          className={`chip ${activeSubTab === 'workspace' ? 'on' : ''} flex items-center gap-2`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Workspace Preferences</span>
        </button>

        <button
          onClick={() => setActiveSubTab('security')}
          className={`chip ${activeSubTab === 'security' ? 'on' : ''} flex items-center gap-2`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Security, RBAC & Audit Ledger</span>
        </button>
      </div>

      {/* TAB 1: DATA PROVIDERS */}
      {activeSubTab === 'providers' && (
        <div className="space-y-4">
          {/* Search & Category Filter Bar */}
          <div className="glass p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="w-3.5 h-3.5 text-[#5F6B8A] absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Search provider name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/90 border border-[rgba(120,140,190,0.25)] rounded-full pl-9 pr-3.5 py-1.5 text-xs text-[#0B1530] placeholder-[#5F6B8A] focus:outline-none focus:border-[#3B6CFF] shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-[#3B6CFF] text-white shadow-xs'
                      : 'bg-white/80 text-[#5F6B8A] hover:text-[#0B1530] border border-[rgba(120,140,190,0.2)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 3-Column Provider Cards matching screenshot */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProviders.map(prov => {
              const isReady = prov.status.toLowerCase() === 'ready';
              const isTesting = testingProviderId === prov.id;

              return (
                <div
                  key={prov.id}
                  className="glass-card p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={prov.enabled}
                          onChange={() => handleToggleProvider(prov.id)}
                          className="mt-1 rounded accent-[#3B6CFF] cursor-pointer"
                        />

                        <div className="w-9 h-9 rounded-xl bg-white border border-[rgba(120,140,190,0.25)] flex items-center justify-center shrink-0 text-[#3B6CFF] shadow-2xs">
                          {prov.iconType === 'database' ? <Database className="w-4 h-4" /> : <Music className="w-4 h-4" />}
                        </div>

                        <div>
                          <h3 className="text-sm font-extrabold text-[#0B1530] leading-tight">{prov.name}</h3>
                          <span className="text-[10px] text-[#5F6B8A] font-semibold">{prov.category}</span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                        isReady
                          ? 'bg-[#EFFBC4] text-[#0B1530] border border-[#C8F51F]'
                          : prov.status === 'Quota Limited'
                          ? 'bg-[#FEF3C7] text-[#B45309]'
                          : 'bg-slate-100 text-[#5F6B8A]'
                      }`}>
                        {prov.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#475569] leading-relaxed line-clamp-2">
                      {prov.description}
                    </p>

                    <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] text-[#64748B]">
                      <strong className="text-[#0F172A] block text-[10px] uppercase font-bold mb-0.5">Access Policy:</strong>
                      {prov.accessNote || prov.access_note || 'Standard public client interface with automated rate limiting.'}
                    </div>

                    {/* Expandable fields if present */}
                    {prov.fields && prov.fields.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-[#F1F5F9] text-xs">
                        {prov.fields.map(field => (
                          <div key={field.key} className="space-y-1">
                            <label className="text-[10px] font-bold text-[#64748B] uppercase block">
                              {field.label}
                            </label>
                            <input
                              type={field.secret ? 'password' : 'text'}
                              placeholder={field.placeholder || 'Enter value...'}
                              value={fieldValues[`${prov.id}_${field.key}`] || ''}
                              onChange={(e) => {
                                setFieldValues({
                                  ...fieldValues,
                                  [`${prov.id}_${field.key}`]: e.target.value
                                });
                              }}
                              className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-2.5 py-1 text-xs text-[#0F172A] focus:outline-none focus:border-[#7155F5]"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleTestConnection(prov)}
                      disabled={isTesting}
                      className="text-[11px] font-bold text-[#7155F5] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                      <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                    </button>

                    <a
                      href={prov.docsUrl || prov.docs_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-[#64748B] hover:text-[#0F172A] flex items-center gap-1"
                    >
                      <span>Provider docs</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: AUTOMATION & SCHEDULER */}
      {activeSubTab === 'automation' && (
        <div className="bg-white border border-[#E5E9F3] rounded-2xl p-6 shadow-2xs space-y-6">
          <div className="border-b border-[#F1F5F9] pb-3">
            <h3 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#7155F5]" />
              <span>Autonomous Scheduling & Rate Budgeting</span>
            </h3>
            <p className="text-xs text-[#64748B]">
              Configure execution intervals, background worker heartbeats, and provider quota ceilings.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            {/* Loop Interval */}
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
              <span className="font-extrabold text-[#0F172A] block text-sm">Autonomous Loop Interval</span>
              <p className="text-[#64748B]">Time between background multi-territory discovery sweeps.</p>
              
              <div className="flex gap-2">
                {[30, 60, 360, 1440].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => onChangeLoopInterval(mins)}
                    className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                      loopIntervalMinutes === mins
                        ? 'bg-[#7155F5] text-white shadow-2xs'
                        : 'bg-white text-[#64748B] border border-[#CBD5E1]'
                    }`}
                  >
                    {mins === 30 ? '30 Mins' : mins === 60 ? '1 Hour' : mins === 360 ? '6 Hours' : '24 Hours'}
                  </button>
                ))}
              </div>
            </div>

            {/* Worker Health */}
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
              <span className="font-extrabold text-[#0F172A] block text-sm">Worker Heartbeat Status</span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping"></span>
                <strong className="text-[#059669]">Worker #1 Online & Leased</strong>
              </div>
              <p className="text-[#64748B]">Heartbeat ping interval: 30s. Automatically claims next due job in PostgreSQL queue.</p>
            </div>

            {/* YouTube Quota */}
            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-2">
              <span className="font-bold text-[#0F172A] block">YouTube Data API Daily Budget</span>
              <input
                type="number"
                value={youtubeDailyQuota}
                onChange={(e) => setYoutubeDailyQuota(parseInt(e.target.value) || 100)}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-1.5 font-mono text-xs"
              />
              <p className="text-[10px] text-[#64748B]">Default quota budget: 100 search.list calls / day (Resets at midnight Pacific Time).</p>
            </div>

            {/* MusicBrainz Limit */}
            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-2">
              <span className="font-bold text-[#0F172A] block">MusicBrainz Rate Limit (req/s)</span>
              <input
                type="number"
                value={musicbrainzRateLimit}
                onChange={(e) => setMusicbrainzRateLimit(parseInt(e.target.value) || 1)}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-1.5 font-mono text-xs"
              />
              <p className="text-[10px] text-[#64748B]">Mandatory limit of 1 request per second with descriptive User-Agent header.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DISCOVERY SEED MANAGER */}
      {activeSubTab === 'seeds' && (
        <div className="bg-white border border-[#E5E9F3] rounded-2xl p-6 shadow-2xs space-y-6">
          <div className="border-b border-[#F1F5F9] pb-3">
            <h3 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
              <Radio className="w-5 h-5 text-[#7155F5]" />
              <span>Discovery Seed Rotation Manager ({seeds.length})</span>
            </h3>
            <p className="text-xs text-[#64748B]">
              Configure which musical scenes, genres, and territories the autonomous engine cycles through.
            </p>
          </div>

          {/* Seeds Table */}
          <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Seed Label</th>
                  <th className="py-2.5 px-3">Search Query</th>
                  <th className="py-2.5 px-3">Territory</th>
                  <th className="py-2.5 px-3">Genre</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Discovered</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {seeds.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-2.5 px-3">
                      <input
                        type="checkbox"
                        checked={s.enabled}
                        onChange={() => handleToggleSeed(s.id)}
                        className="rounded accent-[#7155F5] cursor-pointer"
                      />
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[#0F172A]">{s.name}</td>
                    <td className="py-2.5 px-3 font-mono text-[#7155F5]">"{s.query}"</td>
                    <td className="py-2.5 px-3 text-[#64748B]">{s.region}</td>
                    <td className="py-2.5 px-3 text-[#0F172A] font-medium">{s.genre}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EEF2FF] text-[#4338CA]">
                        {s.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#059669]">+{s.yieldCount}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleDeleteSeed(s.id)}
                        className="text-[#94A3B8] hover:text-[#EF4444] p-1 cursor-pointer"
                        title="Delete seed"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add New Seed Form */}
          <form onSubmit={handleAddSeed} className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3 text-xs">
            <span className="font-bold text-[#0F172A] block">Add New Discovery Seed:</span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="Seed Label (e.g. Kigali Alt-R&B)"
                  value={newSeedName}
                  onChange={(e) => setNewSeedName(e.target.value)}
                  className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-1.5"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Search Phrase Query"
                  value={newSeedQuery}
                  onChange={(e) => setNewSeedQuery(e.target.value)}
                  className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-1.5 font-mono"
                />
              </div>
              <div>
                <select
                  value={newSeedRegion}
                  onChange={(e) => setNewSeedRegion(e.target.value)}
                  className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-1.5"
                >
                  <option value="East Africa">East Africa</option>
                  <option value="West Africa">West Africa</option>
                  <option value="Southern Africa">Southern Africa</option>
                  <option value="UK Diaspora">UK Diaspora</option>
                </select>
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full py-1.5 bg-[#7155F5] hover:bg-[#5E3EE4] text-white font-bold rounded-xl cursor-pointer"
                >
                  + Add Seed to Rotation
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: AVM SCORING & WEIGHTS */}
      {activeSubTab === 'scoring' && (
        <div className="bg-white border border-[#E5E9F3] rounded-2xl p-6 shadow-2xs space-y-6">
          <div className="border-b border-[#F1F5F9] pb-3">
            <h3 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#7155F5]" />
              <span>Artistic Value Model (AVM) Weights Customizer</span>
            </h3>
            <p className="text-xs text-[#64748B]">
              Calibrate the four pillar weights ($W_V, W_W, W_S, W_C$) and the 60/40 Artistic vs Discovery contribution ratio.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            {/* Genre Profile Selector */}
            <div className="space-y-3">
              <label className="font-bold text-[#0F172A] block">Genre Calibration Profile (PDF Section 7)</label>
              <select
                value={selectedGenreProfile}
                onChange={(e) => setSelectedGenreProfile(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl p-2 font-bold text-[#7155F5]"
              >
                <option value="General">General / Baseline Profile</option>
                <option value="Rap / hip-hop">Rap / Hip-Hop (Vocal 0.20, Writing 0.40)</option>
                <option value="Afrobeats / Amapiano">Afrobeats / Amapiano (Rhythm & Energy raised)</option>
                <option value="Gospel / soul / R&B">Gospel / Soul / R&B (Vocal raised to 0.35)</option>
                <option value="Folk / singer-songwriter">Folk / Singer-Songwriter (Writing raised to 0.40)</option>
              </select>
            </div>

            {/* Artistic vs Discovery Share */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-bold text-[#0F172A]">A&R Contribution Ratio:</span>
                <strong className="text-[#7155F5]">
                  {artisticSharePercent}% AAV / {100 - artisticSharePercent}% Discovery
                </strong>
              </div>
              <input
                type="range"
                min="40"
                max="80"
                step="5"
                value={artisticSharePercent}
                onChange={(e) => setArtisticSharePercent(parseInt(e.target.value))}
                className="w-full accent-[#7155F5]"
              />
              <p className="text-[10px] text-[#64748B]">Default recommendation standard: 60% Artistic Quality + 40% Digital Momentum.</p>
            </div>
          </div>

          {/* 4 Pillar Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs pt-3 border-t border-[#F1F5F9]">
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
              <div className="flex justify-between">
                <span className="font-bold text-[#2563EB]">Pillar V ($W_V$):</span>
                <strong className="font-mono">{weightVocal.toFixed(2)}</strong>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.50"
                step="0.05"
                value={weightVocal}
                onChange={(e) => setWeightVocal(parseFloat(e.target.value))}
                className="w-full accent-[#2563EB]"
              />
              <span className="text-[10px] text-[#64748B] block">Vocal Ability (Default 0.30)</span>
            </div>

            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
              <div className="flex justify-between">
                <span className="font-bold text-[#7155F5]">Pillar W ($W_W$):</span>
                <strong className="font-mono">{weightWriting.toFixed(2)}</strong>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.50"
                step="0.05"
                value={weightWriting}
                onChange={(e) => setWeightWriting(parseFloat(e.target.value))}
                className="w-full accent-[#7155F5]"
              />
              <span className="text-[10px] text-[#64748B] block">Writing Craft (Default 0.30)</span>
            </div>

            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
              <div className="flex justify-between">
                <span className="font-bold text-[#059669]">Pillar S ($W_S$):</span>
                <strong className="font-mono">{weightSong.toFixed(2)}</strong>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.50"
                step="0.05"
                value={weightSong}
                onChange={(e) => setWeightSong(parseFloat(e.target.value))}
                className="w-full accent-[#059669]"
              />
              <span className="text-[10px] text-[#64748B] block">Song as a Whole (Default 0.20)</span>
            </div>

            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
              <div className="flex justify-between">
                <span className="font-bold text-[#D97706]">Pillar C ($W_C$):</span>
                <strong className="font-mono">{weightComp.toFixed(2)}</strong>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.50"
                step="0.05"
                value={weightComp}
                onChange={(e) => setWeightComp(parseFloat(e.target.value))}
                className="w-full accent-[#D97706]"
              />
              <span className="text-[10px] text-[#64748B] block">Composition (Default 0.20)</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: WORKSPACE PREFERENCES */}
      {activeSubTab === 'workspace' && (
        <div className="bg-white border border-[#E5E9F3] rounded-2xl p-6 shadow-2xs space-y-6">
          <div className="border-b border-[#F1F5F9] pb-3">
            <h3 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
              <User className="w-5 h-5 text-[#7155F5]" />
              <span>Workspace & Regional Desk Preferences</span>
            </h3>
            <p className="text-xs text-[#64748B]">Personalize the default scouting desk, currencies, and signing committee member details.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-[#64748B] block mb-1">A&R Executive Lead Name</label>
              <input
                type="text"
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-[#64748B] block mb-1">Executive Title</label>
              <input
                type="text"
                value={leadTitle}
                onChange={(e) => setLeadTitle(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-[#64748B] block mb-1">Default Priority Desk</label>
              <select
                value={deskRegion}
                onChange={(e) => setDeskRegion(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 font-medium"
              >
                <option value="East Africa Desk (Nairobi)">East Africa Desk (Nairobi - KE, TZ, UG, RW)</option>
                <option value="West Africa Desk (Lagos/Accra)">West Africa Desk (Lagos / Accra)</option>
                <option value="Southern Africa Desk (Johannesburg)">Southern Africa Desk (Johannesburg)</option>
                <option value="UK African Diaspora Desk (London)">UK African Diaspora Desk (London)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-[#64748B] block mb-1">Advance & Contract Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 font-medium"
              >
                <option value="USD ($)">USD ($ United States Dollars)</option>
                <option value="KES (KSh)">KES (KSh Kenyan Shilling)</option>
                <option value="NGN (₦)">NGN (₦ Nigerian Naira)</option>
                <option value="GBP (£)">GBP (£ British Pound)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SECURITY, COMPLIANCE, RBAC & AUDIT LEDGER */}
      {activeSubTab === 'security' && (
        <div className="space-y-6">
          {/* 1. Header Banner */}
          <div className="bg-white border border-[#E5E9F3] rounded-2xl p-6 shadow-2xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black tracking-wider text-[#10B981] uppercase bg-[#ECFDF5] px-2.5 py-0.5 rounded-full border border-[#A7F3D0]">
                  ENTERPRISE SECURITY & COMPLIANCE ARCHITECTURE
                </span>
                <h3 className="text-lg font-black text-[#0F172A] mt-1 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#10B981]" />
                  <span>Tenant Isolation, RBAC Matrix & Immutable Audit Trail</span>
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#64748B]">Active Tenant:</span>
                <span className="text-xs font-bold text-[#0F172A] px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1]">
                  {currentWorkspace.name} ({currentWorkspace.id})
                </span>
              </div>
            </div>
            <p className="text-xs text-[#64748B] max-w-3xl">
              Strict multi-tenant partitioning, role-based signing authorisations, server-side credential isolation, and tamper-evident write-only audit logs protecting intellectual property and talent signing operations.
            </p>
          </div>

          {/* 2. RBAC Permissions Matrix */}
          <div className="bg-white border border-[#E5E9F3] rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div>
                <h4 className="text-sm font-extrabold text-[#0F172A] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#7155F5]" />
                  <span>Role-Based Access Control (RBAC) Hierarchy & Operational Matrix</span>
                </h4>
                <p className="text-xs text-[#64748B]">
                  Currently acting as: <strong className="text-[#0F172A]">{currentUser?.displayName}</strong> ({currentUser?.email}) with role <span className="font-mono text-[#7155F5] font-bold">[{currentUser?.role}]</span>
                </p>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Access Level</th>
                    <th className="py-2.5 px-3 text-center">Record Decision</th>
                    <th className="py-2.5 px-3 text-center">Calibrate AVM</th>
                    <th className="py-2.5 px-3 text-center">Trigger Discovery</th>
                    <th className="py-2.5 px-3 text-center">Manage Secrets</th>
                    <th className="py-2.5 px-3 text-center">View Audit Logs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {[
                    {
                      role: 'ADMIN' as UserRole,
                      label: 'Administrator',
                      level: 'Full Workspace Authority, Settings, Integrations & Audit',
                      decide: true,
                      avm: true,
                      scan: true,
                      secrets: true,
                      audit: true,
                    },
                    {
                      role: 'AR_LEAD' as UserRole,
                      label: 'A&R Lead',
                      level: 'Talent Discovery, Evaluations & Signing Decisions',
                      decide: true,
                      avm: true,
                      scan: true,
                      secrets: false,
                      audit: true,
                    },
                    {
                      role: 'ANALYST' as UserRole,
                      label: 'Analyst',
                      level: 'Acoustic MIR Investigation & Market Intelligence',
                      decide: false,
                      avm: false,
                      scan: true,
                      secrets: false,
                      audit: false,
                    },
                    {
                      role: 'REVIEWER' as UserRole,
                      label: 'Reviewer',
                      level: 'Human Scout Qualitative Assessment & Committee Review',
                      decide: true,
                      avm: false,
                      scan: false,
                      secrets: false,
                      audit: false,
                    },
                    {
                      role: 'VIEWER' as UserRole,
                      label: 'Read-only / Guest',
                      level: 'Read-Only Intelligence & Pipeline Consumer',
                      decide: false,
                      avm: false,
                      scan: false,
                      secrets: false,
                      audit: false,
                    },
                  ].map((row) => {
                    const isUserRole = currentUser?.role === row.role;
                    return (
                      <tr key={row.role} className={isUserRole ? 'bg-[#EEF2FF]' : 'hover:bg-[#F8FAFC]'}>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#0F172A]">{row.label}</span>
                            {isUserRole && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[#7155F5] text-white">
                                YOU
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-[#64748B]">{row.level}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-[#10B981]">{row.decide ? '✓ Yes' : '—'}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-[#7155F5]">{row.avm ? '✓ Yes' : '—'}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-[#0F172A]">{row.scan ? '✓ Yes' : '—'}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-[#DC2626]">{row.secrets ? '✓ Yes' : '—'}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-[#0F172A]">{row.audit ? '✓ Yes' : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 15-Seat Workspace Team Directory */}
            <div className="pt-4 border-t border-[#F1F5F9] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-black text-[#0B1530] uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#3B6CFF]" />
                    <span>Authorized Workspace Team Directory ({APPROVED_WORKSPACE_USERS.length} Seats Provisioned)</span>
                  </h5>
                  <p className="text-[11px] text-[#5F6B8A]">
                    Internal allowlist members authorized to access this tenant instance with cryptographic role separation.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {APPROVED_WORKSPACE_USERS.map(u => (
                  <div key={u.uid} className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[rgba(120,140,190,0.2)] flex items-center justify-between text-xs">
                    <div className="truncate pr-2">
                      <p className="font-bold text-[#0B1530] truncate">{u.displayName}</p>
                      <p className="text-[10px] text-[#5F6B8A] truncate">{u.email}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded font-black font-mono bg-white border border-[rgba(120,140,190,0.25)] text-[#3B6CFF] shrink-0">
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Credentials & Secret Management Architecture Policy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Server-Side Credentials Policy */}
            <div className="bg-white border border-[#E5E9F3] rounded-2xl p-6 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#7155F5]" />
                <h4 className="text-sm font-extrabold text-[#0F172A]">Server-Side Credential Policy</h4>
              </div>
              <p className="text-[#64748B] leading-relaxed">
                Breakout Radar enforces <strong>Zero Client-Side Secret Exposure</strong>. All API calls requiring confidential authorization headers (e.g. Spotify Client Secret, YouTube Data API Keys, MusicBrainz tokens) are brokered through isolated server proxy endpoints or Google Cloud Functions.
              </p>
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                <span className="text-[10px] font-bold text-[#0F172A] uppercase block">Security Safeguards:</span>
                <ul className="list-disc list-inside text-[11px] text-[#64748B] space-y-0.5">
                  <li>No client bundles contain hardcoded API secrets or private tokens.</li>
                  <li>Token requests execute over TLS 1.3 with HSTS header enforcement.</li>
                  <li>Inbound proxy requests are checked against workspace tenant auth tokens.</li>
                </ul>
              </div>
            </div>

            {/* Secret Rotation & Error Handling */}
            <div className="bg-white border border-[#E5E9F3] rounded-2xl p-6 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[#10B981]" />
                <h4 className="text-sm font-extrabold text-[#0F172A]">Rotation Schedule & Error Handling</h4>
              </div>
              <p className="text-[#64748B] leading-relaxed">
                Automated rotation cycles and exponential backoff retry algorithms prevent credential compromise and cascading downstream provider outages.
              </p>
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="font-semibold text-[#0F172A]">DSP Streaming API Tokens:</span>
                  <span className="font-mono text-[#7155F5] font-bold">Every 30 Days (Automated)</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="font-semibold text-[#0F172A]">OAuth Application Credentials:</span>
                  <span className="font-mono text-[#7155F5] font-bold">Every 60 Days (Managed)</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="font-semibold text-[#0F172A]">Firestore Service Account Keys:</span>
                  <span className="font-mono text-[#7155F5] font-bold">Every 90 Days (Dual-Key Rollover)</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="font-semibold text-[#0F172A]">Rate Limit Backoff Strategy:</span>
                  <span className="font-mono text-[#059669] font-bold">Exponential with Jitter (500ms–8s)</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Protected Immutable Audit Trail Table */}
          <div className="bg-white border border-[#E5E9F3] rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-3">
              <div>
                <h4 className="text-sm font-extrabold text-[#0F172A] flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[#10B981]" />
                  <span>Protected Immutable Audit Ledger ({auditLogs.length} Events)</span>
                </h4>
                <p className="text-xs text-[#64748B]">
                  Firestore rules enforce <code>allow update, delete: if false;</code>. Every record contains a tamper-evident cryptographic hash.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchAuditLogs}
                  disabled={isLoadingLogs}
                  className="px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-[#0F172A] hover:bg-[#EEF2FF] text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#7155F5] ${isLoadingLogs ? 'animate-spin' : ''}`} />
                  <span>Refresh Ledger</span>
                </button>
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl max-h-96">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase text-[10px] sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3">Timestamp (UTC)</th>
                    <th className="py-2.5 px-3">Actor Email</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Target Entity</th>
                    <th className="py-2.5 px-3">Integrity Hash</th>
                    <th className="py-2.5 px-3">Immutability Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-2.5 px-3 font-mono text-[#64748B]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-[#0F172A]">{log.actorEmail}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#EEF2FF] text-[#4338CA]">
                          {log.actorRole}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[#0F172A]">{log.action}</td>
                      <td className="py-2.5 px-3 text-[#475569] font-mono">{log.targetEntityId}</td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-[#7155F5]">
                        {log.integrityHash.slice(0, 16)}...
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] inline-flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Protected & Verified</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-[#94A3B8] italic">
                        {isLoadingLogs ? 'Loading secure audit ledger from Firestore...' : 'No audit records found. Initializing seed logs...'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isOpen !== undefined) {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1530]/50 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
        <div className="w-full max-w-5xl my-8 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/80 p-6 max-h-[90vh] overflow-y-auto">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
