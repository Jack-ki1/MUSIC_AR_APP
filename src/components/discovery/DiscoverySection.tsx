import React, { useEffect, useMemo, useState } from 'react';
import { Play, Pause, RotateCw, ArrowRight, Clock, LayoutGrid, List, Search } from 'lucide-react';
import { chart, series } from '../../shared/theme/chartPalette';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { Tabs } from '../../shared/ui/Tabs';
import { KPI } from '../../shared/ui/KPI';
import { Pill, PillTone } from '../../shared/ui/Pill';
import { SectionHeader } from '../../shared/ui/SectionHeader';
import { Field, Select } from '../../shared/ui/Field';
import { DataTable } from '../../shared/ui/DataTable';
import { RealArtistData, RealSong } from '../../types';
import { runRealAutonomousDiscovery } from '../../services/realMusicApi';
import { discoverArtistsViaBackend } from '../../services/backendApi';

export interface DiscoveryRegion {
  id: string;
  name: string;
  countries: string[];
  enabled: boolean;
  isDefault?: boolean;
}

export interface DiscoveryGenre {
  id: string;
  name: string;
  enabled: boolean;
}

interface DiscoverySectionProps {
  realArtists: RealArtistData[];
  onAddDiscoveredArtists: (newArtists: RealArtistData[]) => void;
  onSelectArtist: (artist: RealArtistData) => void;
  regions: DiscoveryRegion[];
  genres: DiscoveryGenre[];
  onUpdateRegions: (regions: DiscoveryRegion[]) => void;
  onUpdateGenres: (genres: DiscoveryGenre[]) => void;
  loopIntervalMinutes: number;
  onChangeLoopInterval: (minutes: number) => void;
  isAutonomousActive: boolean;
  onToggleAutonomous: () => void;
}

const AFRICA_REGIONS: Record<string, string[]> = {
  'North Africa': ['Algeria', 'Egypt', 'Libya', 'Morocco', 'Sudan', 'Tunisia'],
  'West Africa': ['Benin', 'Burkina Faso', 'Cape Verde', "Côte d'Ivoire", 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau', 'Liberia', 'Mali', 'Mauritania', 'Niger', 'Nigeria', 'Senegal', 'Sierra Leone', 'Togo'],
  'Central Africa': ['Angola', 'Cameroon', 'Central African Republic', 'Chad', 'Congo', 'DR Congo', 'Equatorial Guinea', 'Gabon', 'São Tomé and Príncipe'],
  'East Africa': ['Burundi', 'Comoros', 'Djibouti', 'Eritrea', 'Ethiopia', 'Kenya', 'Madagascar', 'Malawi', 'Mauritius', 'Mozambique', 'Rwanda', 'Seychelles', 'Somalia', 'South Sudan', 'Tanzania', 'Uganda', 'Zambia', 'Zimbabwe'],
  'Southern Africa': ['Botswana', 'Eswatini', 'Lesotho', 'Namibia', 'South Africa'],
};

const GENRE_OPTIONS = [
  'Afro-pop','Afrobeats','Amapiano','Afro-fusion','Afro-soul','Afro-R&B','Afro-house','Afro-trap','Afro-drill',
  'Bongo Flava','Gengetone','Benga','Kapuka','Gqom','Kwaito','Highlife','Hiplife','Jùjú','Fuji','Soukous',
  'Rumba','Makossa','Coupé-Décalé','Zouk','Kizomba','Semba','Kuduro','Mbalax','Ethio-jazz','Taarab',
  'Singeli','Gospel','Choir / Worship','R&B / Soul','Neo-soul','Hip Hop','Rap','Drill','Dancehall','Reggae',
  'Alternative','Indie Pop','Electronic','House','Folk / Acoustic'
];

const AFRICA_MAP_COORDS: Record<string, {x:number;y:number}> = {
  'Kenya': {x:62,y:56}, 'Tanzania': {x:60,y:62}, 'Uganda': {x:58,y:54}, 'Rwanda': {x:57,y:58}, 'Burundi': {x:57,y:60},
  'Ethiopia': {x:62,y:50}, 'Somalia': {x:68,y:52}, 'South Sudan': {x:56,y:50}, 'Nigeria': {x:38,y:46}, 'Ghana': {x:34,y:48},
  'Senegal': {x:22,y:44}, "Côte d'Ivoire": {x:32,y:50}, 'Cameroon': {x:44,y:52}, 'DR Congo': {x:52,y:60}, 'South Africa': {x:54,y:78},
  'Egypt': {x:54,y:34}, 'Morocco': {x:28,y:30}, 'Algeria': {x:36,y:32}, 'Tunisia': {x:40,y:28}, 'Angola': {x:48,y:66},
  'Mozambique': {x:60,y:70}, 'Zambia': {x:54,y:66}, 'Zimbabwe': {x:56,y:70}, 'Madagascar': {x:66,y:72}, 'Sudan': {x:54,y:42}
};

function BarCard({ title, items }: { title: string; items: { label: string; value: number }[] }) {
  const max = Math.max(1, ...items.map(i => i.value));
  return (
    <Card padding="sm">
      <div className="text-xs font-semibold text-navy-700 mb-2">{title}</div>
      <div className="space-y-1.5">
        {items.slice(0,6).map((it) => (
          <div key={it.label} className="text-2xs">
            <div className="flex justify-between text-navy-700"><span className="truncate pr-2">{it.label}</span><span className="font-mono">{it.value}</span></div>
            <div className="h-1.5 bg-purple-500/20 rounded mt-0.5"><div className="h-1.5 bg-brand-500 rounded" style={{width:`${(it.value/max)*100}%`}} /></div>
          </div>
        ))}
        {items.length === 0 && <div className="text-2xs text-purple-500">No data</div>}
      </div>
    </Card>
  );
}

const tierTone = (tier?: string): PillTone =>
  tier === 'PURSUE' ? 'sign'
    : tier === 'MEET' ? 'meet'
    : tier === 'WATCH' ? 'watch'
    : tier === 'EVIDENCE' ? 'evidence'
    : 'hold';

export const DiscoverySection: React.FC<DiscoverySectionProps> = ({
  realArtists,
  onAddDiscoveredArtists,
  onSelectArtist,
  loopIntervalMinutes,
  onChangeLoopInterval,
  isAutonomousActive,
  onToggleAutonomous,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isScanning, setIsScanning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(loopIntervalMinutes * 60);
  const [playingSongId, setPlayingSongId] = useState<number | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const [selectedRegion, setSelectedRegion] = useState<string>('East Africa');
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('aav_desc');

  useEffect(() => { setSecondsRemaining(loopIntervalMinutes * 60); }, [loopIntervalMinutes]);
  useEffect(() => () => { audioElement?.pause(); }, [audioElement]);
  useEffect(() => {
    if (!isAutonomousActive) return;
    const t = setInterval(() => setSecondsRemaining(prev => prev <= 1 ? (triggerScan(), loopIntervalMinutes * 60) : prev - 1), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutonomousActive, loopIntervalMinutes, selectedRegion]);

  useEffect(() => { setSelectedCountry('All'); }, [selectedRegion]);

  const countriesInRegion = useMemo(() => ['All', ...(AFRICA_REGIONS[selectedRegion] || [])], [selectedRegion]);
  const trackedCandidates = realArtists.length;

  const processedArtists = useMemo(() => {
    let list = [...realArtists];
    if (selectedCountry !== 'All') list = list.filter(a => a.country === selectedCountry);
    else list = list.filter(a => (AFRICA_REGIONS[selectedRegion] || []).includes(a.country) || selectedRegion === 'East Africa' && !a.country);
    if (selectedGenre !== 'All') list = list.filter(a => (a.primaryGenre || '').toLowerCase() === selectedGenre.toLowerCase() || (a.genres || []).some(g => g.toLowerCase() === selectedGenre.toLowerCase()));
    const num = (v: any) => Number(v || 0);
    const sorters: Record<string,(a:RealArtistData,b:RealArtistData)=>number> = {
      aav_desc: (a,b)=>num(b.avmRollup?.aav ?? b.artisticScore*20)-num(a.avmRollup?.aav ?? a.artisticScore*20),
      aav_asc: (a,b)=>num(a.avmRollup?.aav ?? a.artisticScore*20)-num(b.avmRollup?.aav ?? b.artisticScore*20),
      discovery_desc: (a,b)=>num(b.discoveryScore)-num(a.discoveryScore),
      discovery_asc: (a,b)=>num(a.discoveryScore)-num(b.discoveryScore),
      velocity_desc: (a,b)=>num(b.growthSignal30d)-num(a.growthSignal30d),
      velocity_asc: (a,b)=>num(a.growthSignal30d)-num(b.growthSignal30d),
      listeners_desc: (a,b)=>num(b.monthlyListeners)-num(a.monthlyListeners),
      listeners_asc: (a,b)=>num(a.monthlyListeners)-num(b.monthlyListeners),
      releases_desc: (a,b)=>num(b.tracks?.length)-num(a.tracks?.length),
      releases_asc: (a,b)=>num(a.tracks?.length)-num(b.tracks?.length),
      name_asc: (a,b)=>a.name.localeCompare(b.name),
      name_desc: (a,b)=>b.name.localeCompare(a.name),
    };
    list.sort(sorters[sortBy] || sorters.aav_desc);
    return list;
  }, [realArtists, selectedCountry, selectedRegion, selectedGenre, sortBy]);

  const handlePlayPreview = (song: RealSong) => {
    if (!song?.previewUrl) return;
    if (playingSongId === song.id && audioElement) {
      if (audioElement.paused) audioElement.play(); else { audioElement.pause(); setPlayingSongId(null); }
      return;
    }
    audioElement?.pause();
    const audio = new Audio(song.previewUrl);
    audio.play();
    audio.onended = () => setPlayingSongId(null);
    setAudioElement(audio);
    setPlayingSongId(song.id);
  };

  const triggerScan = async () => {
    if (isScanning) return;
    setIsScanning(true);
    try {
      const genreName = selectedGenre !== 'All' ? selectedGenre : 'Afro-pop';
      const query = `emerging ${genreName} ${selectedRegion}`;
      try {
        const backend = await discoverArtistsViaBackend(query, selectedRegion, 12);
        if (backend?.artists?.length) { onAddDiscoveredArtists(backend.artists); return; }
      } catch {}
      const results = await runRealAutonomousDiscovery(
        [{id:'r', name:selectedRegion, countries:AFRICA_REGIONS[selectedRegion]||[], enabled:true}],
        [{id:'g', name:genreName, enabled:true}]
      );
      if (results.length) onAddDiscoveredArtists(results);
    } finally {
      setIsScanning(false);
    }
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;

  const avgAav = processedArtists.length ? (processedArtists.reduce((s,a)=>s + (a.avmRollup?.aav ?? a.artisticScore*20),0)/processedArtists.length) : 0;
  const avgDiscovery = processedArtists.length ? (processedArtists.reduce((s,a)=>s + (a.discoveryScore||0),0)/processedArtists.length) : 0;
  const avgVelocity = processedArtists.length ? (processedArtists.reduce((s,a)=>s + (a.growthSignal30d||0),0)/processedArtists.length) : 0;
  const countryCount = new Set(processedArtists.map(a=>a.country)).size;
  const genreCount = new Set(processedArtists.map(a=>a.primaryGenre)).size;

  const kpis = [
    { label: 'TRACKED CANDIDATES', value: String(trackedCandidates) },
    { label: 'VISIBLE IN VIEW', value: String(processedArtists.length) },
    { label: 'COUNTRIES COVERED', value: String(countryCount) },
    { label: 'GENRES REPRESENTED', value: String(genreCount) },
    { label: 'AVG AAV SCORE', value: avgAav.toFixed(1) },
    { label: 'AVG 30D VELOCITY', value: `${avgVelocity.toFixed(1)}%` },
  ];

  const byCountry = Object.entries(processedArtists.reduce((acc:any,a)=>{acc[a.country]=(acc[a.country]||0)+1;return acc;},{})).map(([label,value])=>({label,value:Number(value)})).sort((a,b)=>b.value-a.value);
  const byGenre = Object.entries(processedArtists.reduce((acc:any,a)=>{const k=a.primaryGenre||'Unknown';acc[k]=(acc[k]||0)+1;return acc;},{})).map(([label,value])=>({label,value:Number(value)})).sort((a,b)=>b.value-a.value);
  const byAav = [...processedArtists].sort((a,b)=>(b.avmRollup?.aav ?? b.artisticScore*20)-(a.avmRollup?.aav ?? a.artisticScore*20)).slice(0,6).map(a=>({label:a.name,value:Number((a.avmRollup?.aav ?? a.artisticScore*20).toFixed(1))}));
  const byDiscovery = [...processedArtists].sort((a,b)=>(b.discoveryScore||0)-(a.discoveryScore||0)).slice(0,6).map(a=>({label:a.name,value:Number((a.discoveryScore||0).toFixed(1))}));
  const byVelocity = [...processedArtists].sort((a,b)=>(b.growthSignal30d||0)-(a.growthSignal30d||0)).slice(0,6).map(a=>({label:a.name,value:Number((a.growthSignal30d||0).toFixed(1))}));

  const mapPoints = processedArtists.map(a=>{
    const c = AFRICA_MAP_COORDS[a.country] || {x: 20 + (a.name.length*7)%60, y: 25 + (a.name.length*11)%50};
    return { ...c, name: a.name, country: a.country };
  });

  return (
    <div className="space-y-5 pb-20 section-enter">
      <Card padding="lg" className="space-y-4">
        <SectionHeader title="AFRICA TALENT RADAR: BREAKOUT DISCOVERY COMMAND" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {kpis.map(k => (
            <KPI key={k.label} label={k.label} value={k.value} />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-line">
          <div className="flex items-center gap-2">
            <span className="text-2xs font-semibold text-purple-500 px-2 uppercase">Loop</span>
            <Tabs
              variant="segment"
              ariaLabel="Discovery loop interval"
              items={[
                { id: '30', label: '30m' },
                { id: '60', label: '60m' }
              ]}
              active={String(loopIntervalMinutes)}
              onChange={(id) => onChangeLoopInterval(Number(id))}
            />
          </div>
          <div className="flex items-center gap-2 border border-line-strong rounded-tile px-3 py-1.5 text-xs">
            <Clock className="w-3.5 h-3.5 text-brand-500" />
            <span className="text-purple-500 font-semibold uppercase text-2xs">Next Scan</span>
            <span className="font-mono font-semibold text-navy-700">{isAutonomousActive ? timeFormatted : 'Paused'}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={onToggleAutonomous}>
            {isAutonomousActive ? 'Pause Loop' : 'Resume Loop'}
          </Button>
          <Button size="sm" onClick={triggerScan} isLoading={isScanning} leftIcon={<RotateCw className="w-3.5 h-3.5" />}>
            Scan Now
          </Button>
          <Field label="Region" className="ml-auto w-auto">
            <Select value={selectedRegion} onChange={e=>setSelectedRegion(e.target.value)} className="w-auto">
              {Object.keys(AFRICA_REGIONS).map(r => <option key={r} value={r}>{r}</option>)}
            </Select>
          </Field>
        </div>
      </Card>

      <Card padding="md" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-semibold text-navy-700 uppercase">Discovered Candidates ({processedArtists.length})</div>
          <Tabs
            variant="segment"
            ariaLabel="Candidate view mode"
            items={[
              { id: 'grid', label: 'Cards', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
              { id: 'table', label: 'Table', icon: <List className="w-3.5 h-3.5" /> }
            ]}
            active={viewMode}
            onChange={(id) => setViewMode(id as 'grid' | 'table')}
          />
        </div>
        <div className="flex flex-wrap items-end gap-2.5 text-xs">
          <Field label="Country">
            <Select value={selectedCountry} onChange={e=>setSelectedCountry(e.target.value)} className="w-auto">{countriesInRegion.map(c=> <option key={c} value={c}>{c}</option>)}</Select>
          </Field>
          <Field label="Genre">
            <Select value={selectedGenre} onChange={e=>setSelectedGenre(e.target.value)} className="w-auto max-w-[220px]"><option value="All">All</option>{GENRE_OPTIONS.map(g=> <option key={g} value={g}>{g}</option>)}</Select>
          </Field>
          <Field label="Sort By" className="ml-auto">
            <Select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="w-auto">
              <option value="aav_desc">AAV Score (High → Low)</option>
              <option value="aav_asc">AAV Score (Low → High)</option>
              <option value="discovery_desc">Discovery Momentum (High → Low)</option>
              <option value="discovery_asc">Discovery Momentum (Low → High)</option>
              <option value="velocity_desc">30D Velocity (High → Low)</option>
              <option value="velocity_asc">30D Velocity (Low → High)</option>
              <option value="listeners_desc">Monthly Listeners (High → Low)</option>
              <option value="listeners_asc">Monthly Listeners (Low → High)</option>
              <option value="releases_desc">Release Count (High → Low)</option>
              <option value="releases_asc">Release Count (Low → High)</option>
              <option value="name_asc">Name (A → Z)</option>
              <option value="name_desc">Name (Z → A)</option>
            </Select>
          </Field>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {processedArtists.map((artist, idx) => {
              const trk = artist.tracks?.[0];
              const playing = trk && playingSongId === trk.id;
              return (
                <Card key={`${artist.id}-${idx}`} padding="md" className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={artist.avatarUrl} alt={artist.name} className="w-11 h-11 rounded object-cover border border-line-strong" />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-navy-700 truncate">{artist.name}</div>
                        <div className="text-2xs text-purple-500 truncate">{artist.city}, {artist.country} • {artist.primaryGenre}</div>
                      </div>
                    </div>
                    <Pill tone={tierTone(artist.recommendationTier)} solid>{artist.recommendationTier || 'WATCH'}</Pill>
                  </div>
                  <div className="flex items-center justify-between text-2xs text-navy-700">
                    <span>AAV <strong className="font-mono">{(artist.avmRollup?.aav ?? artist.artisticScore*20).toFixed(1)}</strong></span>
                    <span>Discovery <strong className="font-mono">{(artist.discoveryScore||0).toFixed(1)}</strong></span>
                    <span>30D <strong className="font-mono">+{(artist.growthSignal30d||0)}%</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    {trk && (
                      <Button size="xs" variant="secondary" className="w-7 h-7" title="Preview" onClick={()=>handlePlayPreview(trk)}>
                        {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                      </Button>
                    )}
                    <Button size="sm" className="ml-auto" onClick={()=>onSelectArtist(artist)} rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Analyze
                    </Button>
                  </div>
                </Card>
              );
            })}
            {processedArtists.length === 0 && <div className="col-span-full text-sm text-purple-500 py-8 text-center border border-dashed border-line-strong rounded">No candidates match the selected filters.</div>}
          </div>
        ) : (
          <Card padding="none">
            <DataTable
              rows={processedArtists}
              rowKey={(a, i) => `${a.id}-t-${i}`}
              emptyState="No candidates match the selected filters."
              columns={[
                { key: 'name', header: 'Candidate', render: a => <span className="font-semibold">{a.name}</span> },
                { key: 'origin', header: 'Origin / Region', render: a => <>{a.city}, {a.country}</> },
                { key: 'genre', header: 'Genre', render: a => a.primaryGenre },
                { key: 'aav', header: 'AAV Score', render: a => <span className="font-mono">{(a.avmRollup?.aav ?? a.artisticScore*20).toFixed(1)}</span> },
                { key: 'discovery', header: 'Discovery Momentum', render: a => <span className="font-mono">{(a.discoveryScore||0).toFixed(1)}</span> },
                { key: 'velocity', header: '30D Velocity', render: a => <span className="font-mono">+{a.growthSignal30d||0}%</span> },
                {
                  key: 'action',
                  header: 'Action',
                  align: 'right',
                  render: a => <Button size="xs" onClick={()=>onSelectArtist(a)}>Analyze</Button>
                }
              ]}
            />
          </Card>
        )}
      </Card>

      <div className="space-y-3">
        <div className="text-sm font-semibold text-navy-700 uppercase">Candidate Insights</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <BarCard title="Origin / Region (Candidates by Country)" items={byCountry} />
          <BarCard title="Genre Mix" items={byGenre} />
          <BarCard title="AAV Score Leaders" items={byAav} />
          <BarCard title="Discovery Momentum Leaders" items={byDiscovery} />
          <BarCard title="30D Velocity Leaders" items={byVelocity} />
          <Card padding="sm">
            <div className="text-xs font-semibold text-navy-700 mb-2">Africa Map: Artist Locations</div>
            <svg viewBox="0 0 100 100" className="w-full h-56 border border-line rounded bg-surface">
              <path d="M30,20 L45,15 L58,20 L66,30 L70,42 L68,55 L62,70 L55,82 L48,85 L40,78 L34,68 L28,58 L24,45 L26,32 Z" fill={chart.surface} stroke={chart.axis} strokeWidth="1.2" />
              {mapPoints.map((p,i)=>(
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="2.2" fill={series[2]} stroke={chart.text} strokeWidth="0.4" />
                </g>
              ))}
            </svg>
            <div className="mt-2 text-2xs text-navy-700 max-h-16 overflow-auto">
              {mapPoints.slice(0,8).map((p,i)=>(<div key={i} className="truncate"><span className="text-brand-500">●</span> {p.name} — {p.country}</div>))}
              {mapPoints.length===0 && <div className="text-purple-500">No mapped locations in current view.</div>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
