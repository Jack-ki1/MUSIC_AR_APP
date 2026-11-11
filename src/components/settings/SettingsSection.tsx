import React, { useEffect, useMemo, useState } from 'react';
import { Database, ExternalLink, Save, Search, Clock, Radio, Award, User, RefreshCw, Trash2, Play, Compass, Terminal, History, Send, Zap } from 'lucide-react';
import { DiscoveryRegion, DiscoveryGenre } from '../discovery/DiscoverySection';
import { ProviderSource, RealArtistData } from '../../types';
import { FULL_73_PROVIDERS } from '../../data/fullProviderCatalogue';
import { fetchProvidersFromBackend, saveProviderConfigToBackend, testProviderFetch, discoverArtistsViaBackend } from '../../services/backendApi';
import { searchRealSongsAndArtists } from '../../services/realMusicApi';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { Tabs, TabItem } from '../../shared/ui/Tabs';
import { SectionHeader } from '../../shared/ui/SectionHeader';
import { Pill } from '../../shared/ui/Pill';

interface SettingsSectionProps {
  regions: DiscoveryRegion[];
  genres: DiscoveryGenre[];
  onUpdateRegions: (regions: DiscoveryRegion[]) => void;
  onUpdateGenres: (genres: DiscoveryGenre[]) => void;
  loopIntervalMinutes: number;
  onChangeLoopInterval: (minutes: number) => void;
  isAutonomousActive: boolean;
  onToggleAutonomous: () => void;
  onShowToast: (msg: string) => void;
  realArtists?: RealArtistData[];
  onAddDiscoveredArtists?: (newArtists: RealArtistData[]) => void;
}

interface DiscoverySeed { id: string; name: string; query: string; region: string; genre: string; priority: 'High' | 'Medium' | 'Normal'; enabled: boolean; yieldCount: number; }
type ProviderRow = ProviderSource & { fetchMode?: string; runtimeStatus?: string; backendStored?: boolean; access?: string; access_note?: string; accessNote?: string; docsUrl?: string; docs_url?: string };
interface ScanHistoryEntry { id: string; timestamp: string; query: string; region: string; candidatesCount: number; durationMs: number; status: string; }

const statusLabel = (p: ProviderRow) => {
  if (p.fetchMode === 'implemented') return 'Implemented fetch';
  if (p.fetchMode === 'manual_or_licensed') return 'Manual/licensed';
  if (p.fetchMode === 'outlined') return 'Outlined';
  return p.runtimeStatus || p.status || 'Unknown';
};
const inputCls =
  'border border-line-strong rounded-tile px-2.5 py-1.5 bg-surface text-navy-700 text-xs ' +
  'outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500';

type SettingsTab =
  | 'providers' | 'command-centre' | 'telemetry' | 'history'
  | 'automation' | 'seeds' | 'scoring' | 'workspace';

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  regions, genres, onUpdateRegions, onUpdateGenres, loopIntervalMinutes, onChangeLoopInterval, isAutonomousActive, onToggleAutonomous, onShowToast, onAddDiscoveredArtists,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SettingsTab>('providers');

  const [providers, setProviders] = useState<ProviderRow[]>(() => {
    try { const saved = localStorage.getItem('breakout_radar_providers'); return saved ? JSON.parse(saved) : (FULL_73_PROVIDERS as any); } catch { return FULL_73_PROVIDERS as any; }
  });
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() => {
    try { const saved = localStorage.getItem('breakout_radar_provider_credentials'); return saved ? JSON.parse(saved) : {}; } catch { return {}; }
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [testingProviderId, setTestingProviderId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { status: string; message: string; count?: number }>>({});
  const [backendProvidersLoaded, setBackendProvidersLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetchProvidersFromBackend().then(({ providers: remote, stored }) => {
      if (!mounted) return;
      if (Array.isArray(remote) && remote.length) {
        setProviders(prev => {
          const localById = new Map((prev || []).map(p => [p.id, p]));
          const merged = remote.map((rp: any) => {
            const lp: any = localById.get(rp.id) || {};
            const st = stored?.[rp.id];
            return { ...lp, ...rp, enabled: st ? !!st.enabled : (lp.enabled ?? rp.enabled ?? false), status: rp.runtimeStatus || lp.status || rp.status, backendStored: !!st } as ProviderRow;
          });
          prev.forEach(p => { if (!merged.find(m => m.id === p.id)) merged.push(p as any); });
          localStorage.setItem('breakout_radar_providers', JSON.stringify(merged));
          return merged;
        });
        if (stored) {
          setFieldValues(prev => {
            const next = { ...prev };
            Object.entries(stored).forEach(([pid, cfg]: any) => {
              Object.entries(cfg?.credentials || {}).forEach(([k, v]) => { if (v != null && v !== '') next[`${pid}_${k}`] = String(v); });
            });
            localStorage.setItem('breakout_radar_provider_credentials', JSON.stringify(next));
            return next;
          });
        }
        setBackendProvidersLoaded(true);
      }
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  // Seeds / scoring / workspace state (kept)
  const [seeds, setSeeds] = useState<DiscoverySeed[]>([
    { id: 'seed-1', name: 'Nairobi R&B & Neo-Soul', query: 'Nairobi R&B Soul', region: 'East Africa', genre: 'R&B / Soul', priority: 'High', enabled: true, yieldCount: 42 },
    { id: 'seed-2', name: 'Gengetone Street NextGen', query: 'Gengetone underground', region: 'East Africa', genre: 'Gengetone', priority: 'High', enabled: true, yieldCount: 28 },
    { id: 'seed-3', name: 'Bongo Flava Underground', query: 'Bongo Flava acoustic', region: 'East Africa', genre: 'Bongo Flava', priority: 'High', enabled: true, yieldCount: 35 },
  ]);
  const [newSeedName, setNewSeedName] = useState(''); const [newSeedQuery, setNewSeedQuery] = useState(''); const [newSeedRegion, setNewSeedRegion] = useState('East Africa'); const [newSeedGenre, setNewSeedGenre] = useState('Afro-pop');
  const [selectedGenreProfile, setSelectedGenreProfile] = useState<string>('General');
  const [weightVocal, setWeightVocal] = useState(0.30); const [weightWriting, setWeightWriting] = useState(0.30); const [weightSong, setWeightSong] = useState(0.20); const [weightComp, setWeightComp] = useState(0.20);
  const [artisticSharePercent, setArtisticSharePercent] = useState(60);
  const [youtubeDailyQuota, setYoutubeDailyQuota] = useState(100); const [musicbrainzRateLimit, setMusicbrainzRateLimit] = useState(1);
  const [leadName, setLeadName] = useState('A&R Lead'); const [leadTitle, setLeadTitle] = useState('Senior A&R Director'); const [deskRegion, setDeskRegion] = useState('East Africa Desk'); const [currency, setCurrency] = useState('USD ($)');

  // Moved from Discovery: command centre, telemetry, history
  const [seedQuery, setSeedQuery] = useState(''); const [selectedSeedRegion, setSelectedSeedRegion] = useState('East Africa'); const [selectedSeedGenre, setSelectedSeedGenre] = useState('Afro-pop');
  const [isCustomRunning, setIsCustomRunning] = useState(false);
  const [scanLogs, setScanLogs] = useState<string[]>(['Autonomous background worker initialized and standing by.', 'Territory anchored to East Africa Desk.', 'Catalog headroom safeguard active.']);
  const [scanHistory, setScanHistory] = useState<ScanHistoryEntry[]>([
    { id: 'scan-101', timestamp: 'Today, 10:14 AM', query: 'Nairobi R&B & Neo-Soul Underground', region: 'East Africa', candidatesCount: 3, durationMs: 1420, status: 'Completed' },
    { id: 'scan-100', timestamp: 'Today, 09:44 AM', query: 'Gengetone Street Movement NextGen', region: 'East Africa', candidatesCount: 2, durationMs: 1190, status: 'Completed' },
  ]);

  useEffect(() => {
    const map: Record<string,[number,number,number,number]> = { 'General':[0.30,0.30,0.20,0.20], 'Rap / hip-hop':[0.20,0.40,0.20,0.20], 'Afrobeats / Amapiano':[0.25,0.25,0.25,0.25], 'Gospel / soul / R&B':[0.35,0.25,0.20,0.20], 'Folk / singer-songwriter':[0.25,0.40,0.20,0.15] };
    const v = map[selectedGenreProfile]; if (v) { setWeightVocal(v[0]); setWeightWriting(v[1]); setWeightSong(v[2]); setWeightComp(v[3]); }
  }, [selectedGenreProfile]);

  const collectCredentials = (prov: ProviderRow) => {
    const creds: Record<string,string> = {};
    (prov.fields || []).forEach(f => { const v = fieldValues[`${prov.id}_${f.key}`]; if (v) creds[f.key] = v; });
    return creds;
  };
  const handleToggleProvider = (id: string) => setProviders(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  const handleTestConnection = async (prov: ProviderRow) => {
    setTestingProviderId(prov.id);
    try {
      const res = await testProviderFetch(prov.id, 'emerging Nairobi R&B', collectCredentials(prov));
      const r = res?.result || res;
      setTestResults(prev => ({ ...prev, [prov.id]: { status: r?.status || 'ok', message: r?.message || 'Fetch executed.', count: r?.count ?? (r?.items?.length || 0) } }));
      onShowToast(`${prov.name}: ${r?.status || 'ok'}${r?.count != null ? ` (${r.count} items)` : ''}`);
    } catch (e: any) {
      setTestResults(prev => ({ ...prev, [prov.id]: { status: 'error', message: e?.message || 'Request failed.' } }));
      onShowToast(`${prov.name}: test failed`);
    } finally { setTestingProviderId(null); }
  };
  const handleSaveSettings = async () => {
    localStorage.setItem('breakout_radar_providers', JSON.stringify(providers));
    localStorage.setItem('breakout_radar_provider_credentials', JSON.stringify(fieldValues));
    localStorage.setItem('breakout_radar_avm_weights', JSON.stringify({ selectedGenreProfile, weightVocal, weightWriting, weightSong, weightComp, artisticSharePercent, youtubeDailyQuota, musicbrainzRateLimit, leadName, leadTitle, deskRegion, currency }));
    const payload = providers.map(p => ({ id: p.id, enabled: !!p.enabled, credentials: collectCredentials(p) }));
    try { await saveProviderConfigToBackend({ providers: payload }); onShowToast(`Saved ${providers.length} provider configs.`); }
    catch { onShowToast('Saved locally (backend unavailable).'); }
  };

  const categories = ['All', ...Array.from(new Set(providers.map(p => p.category || 'Other')))];
  const filteredProviders = providers.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term || p.name.toLowerCase().includes(term) || (p.description||'').toLowerCase().includes(term) || p.id.toLowerCase().includes(term);
    const matchesCategory = selectedCategory === 'All' || (p.category || 'Other') === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  const fetchModeCounts = useMemo(() => {
    const c: any = { implemented: 0, manual_or_licensed: 0, outlined: 0, enabled: 0 };
    providers.forEach(p => { c[p.fetchMode || 'outlined'] = (c[p.fetchMode || 'outlined'] || 0) + 1; if (p.enabled) c.enabled++; });
    return c;
  }, [providers]);

  const handleAddSeed = (e: React.FormEvent) => {
    e.preventDefault(); if (!newSeedName.trim() || !newSeedQuery.trim()) return;
    setSeeds(prev => [...prev, { id: 'seed-' + Date.now(), name: newSeedName.trim(), query: newSeedQuery.trim(), region: newSeedRegion, genre: newSeedGenre, priority: 'High', enabled: true, yieldCount: 0 }]);
    setNewSeedName(''); setNewSeedQuery(''); onShowToast('Seed added.');
  };

  const handleRunCustomSeed = async () => {
    const q = seedQuery.trim(); if (!q || isCustomRunning) return;
    setIsCustomRunning(true); const start = Date.now();
    setScanLogs(prev => [...prev.slice(-30), `[${new Date().toLocaleTimeString()}] Seed: "${q}" (${selectedSeedRegion})`]);
    try {
      let added = 0;
      try {
        const backend = await discoverArtistsViaBackend(q, selectedSeedRegion, 12);
        if (backend?.artists?.length) { onAddDiscoveredArtists?.(backend.artists); added = backend.artists.length; }
      } catch {}
      if (!added) {
        const liveSongs = await searchRealSongsAndArtists(q, 12);
        if (liveSongs.length > 0) {
          const candidate: RealArtistData = {
            id: 'cand-' + Date.now(), name: liveSongs[0].artistName, primaryGenre: selectedSeedGenre, genres: [selectedSeedGenre], country: 'Kenya', city: 'Nairobi', avatarUrl: liveSongs[0].artworkUrl || '',
            summary: `Surfaced via seed "${q}".`, verified: true, discoveryScore: 85, confidenceScore: 0.85, artisticScore: 4.2, combinedScore: 85, recommendationTier: 'WATCH', stage: 'Emerging',
            monthlyListeners: 100000, growthSignal7d: 10, growthSignal30d: 30, organicConfidence: 0.9, firstDiscoveredAt: new Date().toISOString().split('T')[0], lastObservedAt: 'Just now', tracks: liveSongs,
            avmRollup: { aav: 84, medianTAV: 84, p75TAV: 86, consistency: 80, trajectory: 70, trackCount: liveSongs.length, highPotentialCount: 0 },
            positiveSignals: ['Seed match'], unresolvedRisks: ['Needs validation'], nextBestAction: 'Analyze stems'
          };
          onAddDiscoveredArtists?.([candidate]); added = 1;
        }
      }
      setScanLogs(prev => [...prev.slice(-30), `[${new Date().toLocaleTimeString()}] Result: ${added} candidate(s).`]);
      setScanHistory(prev => [{ id: 'scan-'+Date.now(), timestamp: new Date().toLocaleString(), query: q, region: selectedSeedRegion, candidatesCount: added, durationMs: Date.now()-start, status: added ? 'Completed' : 'Filtered' }, ...prev.slice(0,19)]);
      if (added) onShowToast(`Seed run added ${added} candidate(s).`);
    } finally { setIsCustomRunning(false); }
  };

  const PRESET_SEEDS = [
    { title: 'Nairobi R&B & Neo-Soul', query: 'Nairobi R&B Soul', region: 'East Africa', genre: 'R&B / Soul' },
    { title: 'Gengetone Street NextGen', query: 'Gengetone underground', region: 'East Africa', genre: 'Gengetone' },
    { title: 'Bongo Flava Underground', query: 'Bongo Flava acoustic', region: 'East Africa', genre: 'Bongo Flava' },
    { title: 'Kampala Afro-Fusion Wave', query: 'Kampala Afro Fusion', region: 'East Africa', genre: 'Afro-fusion' },
  ];

  return (
    <div className="space-y-4 pb-16 section-enter">
      <Card padding="lg" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SectionHeader
          eyebrow="Configuration"
          title="Settings & Operations"
          description="Provider registry (73 sources), command centre, telemetry, scan history, automation, seeds, scoring, workspace."
        />
        <Button className="shrink-0" onClick={handleSaveSettings} leftIcon={<Save className="w-3.5 h-3.5" />}>
          Save settings
        </Button>
      </Card>

      <Tabs<SettingsTab>
        ariaLabel="Settings sections"
        className="border-b border-line pb-2"
        items={[
          { id: 'providers', label: `Providers (${providers.length})`, icon: <Database className="w-3.5 h-3.5" /> },
          { id: 'command-centre', label: 'Command Centre & Seed Runner', icon: <Compass className="w-3.5 h-3.5" /> },
          { id: 'telemetry', label: 'Live Scan Telemetry', icon: <Terminal className="w-3.5 h-3.5" /> },
          { id: 'history', label: `Scan History (${scanHistory.length})`, icon: <History className="w-3.5 h-3.5" /> },
          { id: 'automation', label: 'Automation', icon: <Clock className="w-3.5 h-3.5" /> },
          { id: 'seeds', label: `Seeds (${seeds.length})`, icon: <Radio className="w-3.5 h-3.5" /> },
          { id: 'scoring', label: 'Scoring', icon: <Award className="w-3.5 h-3.5" /> },
          { id: 'workspace', label: 'Workspace', icon: <User className="w-3.5 h-3.5" /> }
        ]}
        active={activeSubTab}
        onChange={setActiveSubTab}
      />

      {activeSubTab === 'command-centre' && (
        <div className="space-y-4">
          <Card padding="md">
            <h3 className="text-sm font-semibold text-navy-700 flex items-center gap-2"><Compass className="w-4 h-4 text-brand-500" />Targeted A&R Query Command Centre</h3>
            <p className="text-xs text-purple-500 mt-1">Run targeted discovery sweeps and ingest candidates into the workspace.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-3">
              {PRESET_SEEDS.map((p, i) => (
                <button key={i} onClick={()=>{setSeedQuery(p.query); setSelectedSeedRegion(p.region); setSelectedSeedGenre(p.genre);}} className="text-left p-3 rounded border border-line-strong hover:bg-purple-500/10">
                  <div className="text-xs font-semibold text-navy-700">{p.title}</div>
                  <div className="text-2xs text-purple-500">{p.region} • {p.genre}</div>
                </button>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label className="sm:col-span-2 flex flex-col gap-1 text-xs"><span className="text-purple-500 font-semibold uppercase text-2xs">Search Phrase / Seed</span><input value={seedQuery} onChange={e=>setSeedQuery(e.target.value)} className={inputCls} placeholder="e.g. emerging Nairobi R&B" /></label>
              <label className="flex flex-col gap-1 text-xs"><span className="text-purple-500 font-semibold uppercase text-2xs">Region</span><select value={selectedSeedRegion} onChange={e=>setSelectedSeedRegion(e.target.value)} className={inputCls}><option>East Africa</option><option>West Africa</option><option>Central Africa</option><option>Southern Africa</option><option>North Africa</option></select></label>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-2xs text-purple-500">Runs backend discovery with client fallback.</span>
              <Button onClick={handleRunCustomSeed} disabled={isCustomRunning || !seedQuery.trim()} isLoading={isCustomRunning} leftIcon={<Send className="w-3.5 h-3.5" />}>{isCustomRunning?'Executing...':'Execute Targeted Run'}</Button>
            </div>
          </Card>
        </div>
      )}

      {activeSubTab === 'telemetry' && (
        <Card padding="md" className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-navy-700 flex items-center gap-2"><Terminal className="w-4 h-4 text-brand-500" />Live Scan Telemetry</h3>
            <span className="text-2xs font-semibold text-navy-700">Loop {loopIntervalMinutes}m • {isAutonomousActive ? 'Active' : 'Paused'}</span>
          </div>
          <Card variant="subtle" padding="sm" className="font-mono text-2xs space-y-1 max-h-80 overflow-y-auto">
            {scanLogs.map((l,i)=>(<div key={i} className="text-navy-700"><span className="text-brand-500">&gt;</span> {l}</div>))}
          </Card>
        </Card>
      )}

      {activeSubTab === 'history' && (
        <Card padding="md" className="overflow-hidden">
          <h3 className="text-sm font-semibold text-navy-700 flex items-center gap-2 mb-3"><History className="w-4 h-4 text-brand-500" />Scan History</h3>
          <div className="overflow-x-auto border border-line rounded">
            <table className="w-full text-xs text-left">
              <thead className="text-2xs uppercase text-purple-500 border-b border-line"><tr><th className="py-2 px-3">Run ID</th><th className="py-2 px-3">Timestamp</th><th className="py-2 px-3">Query</th><th className="py-2 px-3">Region</th><th className="py-2 px-3">Yield</th><th className="py-2 px-3">Duration</th><th className="py-2 px-3 text-right">Status</th></tr></thead>
              <tbody>
                {scanHistory.map(s => (
                  <tr key={s.id} className="border-b border-line text-navy-700">
                    <td className="py-2 px-3 font-mono">{s.id}</td><td className="py-2 px-3">{s.timestamp}</td><td className="py-2 px-3 font-medium">{s.query}</td><td className="py-2 px-3">{s.region}</td><td className="py-2 px-3">+{s.candidatesCount}</td><td className="py-2 px-3 font-mono">{s.durationMs}ms</td><td className="py-2 px-3 text-right">{s.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeSubTab === 'providers' && (
        <div className="space-y-3">
          <Card padding="md">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="relative"><Search className="w-3.5 h-3.5 text-purple-500 absolute left-2 top-2" /><input type="text" placeholder="Filter providers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`${inputCls} pl-7 w-64`} /></div>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className={inputCls}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select>
              </div>
              <div className="flex items-center gap-3 font-mono text-2xs text-navy-700">
                <span>enabled: <strong>{fetchModeCounts.enabled}</strong>/{providers.length}</span>
                <span>implemented: {fetchModeCounts.implemented || 0}</span>
                <span>manual/licensed: {fetchModeCounts.manual_or_licensed || 0}</span>
                <span>outlined: {fetchModeCounts.outlined || 0}</span>
                <span className="px-1.5 py-0.5 rounded border border-line-strong">{backendProvidersLoaded ? 'backend registry loaded' : 'local catalogue'}</span>
              </div>
            </div>
          </Card>
          <Card padding="none" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b border-line"><tr><th className="text-left px-3 py-2 w-10">On</th><th className="text-left px-3 py-2">Provider</th><th className="text-left px-3 py-2">Category / Access</th><th className="text-left px-3 py-2">Fetch mode</th><th className="text-left px-3 py-2">Credentials</th><th className="text-left px-3 py-2">Last test</th><th className="text-right px-3 py-2">Actions</th></tr></thead>
                <tbody>
                  {filteredProviders.map(prov => {
                    const isTesting = testingProviderId === prov.id; const tr = testResults[prov.id];
                    return (
                      <tr key={prov.id} className="border-b border-line align-top">
                        <td className="px-3 py-2"><input type="checkbox" checked={!!prov.enabled} onChange={() => handleToggleProvider(prov.id)} /></td>
                        <td className="px-3 py-2 min-w-[220px]"><div className="font-medium text-navy-700">{prov.name}</div><div className="font-mono text-2xs text-purple-500">{prov.id}</div><div className="text-2xs text-purple-500 mt-0.5">{prov.description}</div></td>
                        <td className="px-3 py-2 text-navy-700"><div>{prov.category}</div><div className="text-2xs text-purple-500 mt-0.5">access: <span className="font-mono">{(prov as any).access || '—'}</span></div></td>
                        <td className="px-3 py-2"><Pill tone="neutral">{statusLabel(prov)}</Pill><div className="text-2xs text-purple-500 mt-1 max-w-[260px]">{(prov as any).access_note || (prov as any).accessNote || '—'}</div></td>
                        <td className="px-3 py-2 min-w-[180px]">{(prov.fields && prov.fields.length > 0) ? (<div className="space-y-1">{prov.fields.map(f => (<input key={f.key} type={f.secret ? 'password' : 'text'} placeholder={f.label} value={fieldValues[`${prov.id}_${f.key}`] || ''} onChange={(e) => setFieldValues(v => ({ ...v, [`${prov.id}_${f.key}`]: e.target.value }))} className={`${inputCls} w-full`} />))}</div>) : <span className="text-2xs text-purple-500">No credentials</span>}</td>
                        <td className="px-3 py-2 min-w-[180px]">{tr ? (<div className="text-2xs text-navy-700"><div className="font-mono font-medium">{tr.status}{tr.count != null ? ` · ${tr.count} items` : ''}</div><div className="text-purple-500 mt-0.5">{tr.message}</div></div>) : <span className="text-2xs text-purple-500">Not tested</span>}</td>
                        <td className="px-3 py-2 text-right"><div className="flex flex-col items-end gap-1"><Button size="xs" variant="secondary" onClick={() => handleTestConnection(prov)} disabled={isTesting} leftIcon={isTesting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}>{isTesting ? 'Running' : 'Test fetch'}</Button><a href={(prov as any).docsUrl || (prov as any).docs_url || '#'} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-2xs text-navy-700"><span>Docs</span><ExternalLink className="w-3 h-3" /></a></div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeSubTab === 'automation' && (
        <Card padding="md">
          <h3 className="text-sm font-semibold text-navy-700">Automation & rate budgeting</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mt-3">
            <Card variant="subtle" padding="sm" className="space-y-2">
              <div className="font-medium text-navy-700">Scan interval</div>
              <div className="flex gap-1.5 flex-wrap">{[30,60,360,1440].map(m => (<button key={m} onClick={() => onChangeLoopInterval(m)} className={`px-2.5 py-1.5 rounded border text-xs font-medium ${loopIntervalMinutes===m ? 'bg-brand-500 text-navy-900 border-brand-500':'bg-surface text-navy-700 border-line-strong'}`}>{m===30?'30m':m===60?'1h':m===360?'6h':'24h'}</button>))}</div>
              <div className="flex items-center justify-between pt-1"><span className="text-navy-700">Autonomous loop</span><Button size="xs" variant={isAutonomousActive ? 'primary' : 'secondary'} onClick={onToggleAutonomous}>{isAutonomousActive?'ON':'OFF'}</Button></div>
            </Card>
            <Card variant="subtle" padding="sm" className="space-y-2">
              <div className="font-medium text-navy-700">Provider quotas</div>
              <label className="block text-navy-700">YouTube daily search budget <input type="number" value={youtubeDailyQuota} onChange={e=>setYoutubeDailyQuota(parseInt(e.target.value)||100)} className={`${inputCls} ml-2 w-24`} /></label>
              <label className="block text-navy-700">MusicBrainz req/s <input type="number" value={musicbrainzRateLimit} onChange={e=>setMusicbrainzRateLimit(parseInt(e.target.value)||1)} className={`${inputCls} ml-2 w-20`} /></label>
            </Card>
          </div>
        </Card>
      )}

      {activeSubTab === 'seeds' && (
        <Card padding="md" className="space-y-3">
          <h3 className="text-sm font-semibold text-navy-700">Discovery seeds ({seeds.length})</h3>
          <div className="border border-line rounded overflow-x-auto">
            <table className="w-full text-xs"><thead className="border-b border-line"><tr><th className="text-left px-3 py-2 w-10">On</th><th className="text-left px-3 py-2">Name</th><th className="text-left px-3 py-2">Query</th><th className="text-left px-3 py-2">Region</th><th className="text-left px-3 py-2">Genre</th><th className="text-left px-3 py-2">Yield</th><th className="px-3 py-2"></th></tr></thead>
              <tbody>{seeds.map(s => (<tr key={s.id} className="border-b border-line"><td className="px-3 py-1.5"><input type="checkbox" checked={s.enabled} onChange={()=>setSeeds(prev=>prev.map(x=>x.id===s.id?{...x,enabled:!x.enabled}:x))} /></td><td className="px-3 py-1.5 font-medium text-navy-700">{s.name}</td><td className="px-3 py-1.5 font-mono text-navy-700">{s.query}</td><td className="px-3 py-1.5 text-navy-700">{s.region}</td><td className="px-3 py-1.5 text-navy-700">{s.genre}</td><td className="px-3 py-1.5 font-mono text-navy-700">{s.yieldCount}</td><td className="px-3 py-1.5 text-right"><button onClick={()=>setSeeds(prev=>prev.filter(x=>x.id!==s.id))} className="text-purple-500 hover:text-brand-500"><Trash2 className="w-3.5 h-3.5" /></button></td></tr>))}</tbody>
            </table>
          </div>
          <form onSubmit={handleAddSeed} className="flex flex-wrap items-end gap-2 text-xs border border-line-strong rounded p-3">
            <label className="flex flex-col gap-1"><span className="text-purple-500">Name</span><input value={newSeedName} onChange={e=>setNewSeedName(e.target.value)} className={`${inputCls} w-48`} /></label>
            <label className="flex flex-col gap-1"><span className="text-purple-500">Query</span><input value={newSeedQuery} onChange={e=>setNewSeedQuery(e.target.value)} className={`${inputCls} w-48 font-mono`} /></label>
            <label className="flex flex-col gap-1"><span className="text-purple-500">Region</span><select value={newSeedRegion} onChange={e=>setNewSeedRegion(e.target.value)} className={inputCls}><option>East Africa</option><option>West Africa</option><option>Southern Africa</option><option>Central Africa</option><option>North Africa</option></select></label>
            <label className="flex flex-col gap-1"><span className="text-purple-500">Genre</span><input value={newSeedGenre} onChange={e=>setNewSeedGenre(e.target.value)} className={`${inputCls} w-40`} /></label>
            <Button type="submit" variant="secondary" size="sm">Add seed</Button>
          </form>
        </Card>
      )}

      {activeSubTab === 'scoring' && (
        <Card padding="md" className="space-y-4">
          <h3 className="text-sm font-semibold text-navy-700">AVM weights & scoring</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <Card variant="subtle" padding="sm" className="space-y-2">
              <label className="font-medium text-navy-700 block">Genre profile</label>
              <select value={selectedGenreProfile} onChange={e=>setSelectedGenreProfile(e.target.value)} className={`${inputCls} w-full`}><option>General</option><option>Rap / hip-hop</option><option>Afrobeats / Amapiano</option><option>Gospel / soul / R&B</option><option>Folk / singer-songwriter</option></select>
              <label className="block text-navy-700">Artistic/Discovery split <span className="font-mono">{artisticSharePercent}/{100-artisticSharePercent}</span></label>
              <input type="range" min={40} max={80} step={5} value={artisticSharePercent} onChange={e=>setArtisticSharePercent(parseInt(e.target.value))} className="w-full" />
            </Card>
            <Card variant="subtle" padding="sm" className="grid grid-cols-2 gap-3">
              {([['Vocal',weightVocal,setWeightVocal],['Writing',weightWriting,setWeightWriting],['Song',weightSong,setWeightSong],['Composition',weightComp,setWeightComp]] as any[]).map(([label,val,set])=>(
                <label key={label} className="block"><span className="text-navy-700">{label} <span className="font-mono">{val.toFixed(2)}</span></span><input type="range" min={0.1} max={0.5} step={0.05} value={val} onChange={e=>set(parseFloat(e.target.value))} className="w-full" /></label>
              ))}
            </Card>
          </div>
        </Card>
      )}

      {activeSubTab === 'workspace' && (
        <Card padding="md" className="space-y-4">
          <h3 className="text-sm font-semibold text-navy-700">Workspace preferences</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label className="flex flex-col gap-1"><span className="text-purple-500">Lead name</span><input value={leadName} onChange={e=>setLeadName(e.target.value)} className={inputCls} /></label>
            <label className="flex flex-col gap-1"><span className="text-purple-500">Title</span><input value={leadTitle} onChange={e=>setLeadTitle(e.target.value)} className={inputCls} /></label>
            <label className="flex flex-col gap-1"><span className="text-purple-500">Desk</span><select value={deskRegion} onChange={e=>setDeskRegion(e.target.value)} className={inputCls}><option>East Africa Desk</option><option>West Africa Desk</option><option>Southern Africa Desk</option><option>Central Africa Desk</option><option>North Africa Desk</option></select></label>
            <label className="flex flex-col gap-1"><span className="text-purple-500">Currency</span><select value={currency} onChange={e=>setCurrency(e.target.value)} className={inputCls}><option>USD ($)</option><option>KES (KSh)</option><option>NGN (₦)</option><option>ZAR (R)</option><option>GBP (£)</option></select></label>
          </div>
        </Card>
      )}
    </div>
  );
};
