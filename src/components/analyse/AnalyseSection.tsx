import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Activity, 
  Search, 
  Sparkles, 
  Flame, 
  Mic2, 
  PenTool, 
  Music, 
  Award, 
  SlidersHorizontal,
  BarChart3,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { series } from '../../shared/theme/chartPalette';
import { Tabs, TabItem } from '../../shared/ui/Tabs';
import { Card } from '../../shared/ui/Card';
import { RealArtistData, RealSong } from '../../types';
import { TrackAVMRecord } from '../../services/avmEngine';
import { DiveInSection } from './DiveInSection';
import { ScorecardTab } from './tabs/ScorecardTab';
import { VocalsTab } from './tabs/VocalsTab';
import { EnergyTab } from './tabs/EnergyTab';
import { LyricsTab } from './tabs/LyricsTab';
import { CompositionTab } from './tabs/CompositionTab';
import { PerformanceTab } from './tabs/PerformanceTab';
import { AnomalyTab } from './tabs/AnomalyTab';
import { HumanScorecardTab } from './tabs/HumanScorecardTab';
import { OverrideTab } from './tabs/OverrideTab';
import type { AnalyseTabProps } from './tabs/types';

interface AnalyseSectionProps {
  artists: RealArtistData[];
  selectedArtist: RealArtistData | null;
  onSelectArtist: (artist: RealArtistData) => void;
  onUpdateArtistScore: (artistId: string, artisticScore: number, notes: string) => void;
}

export type AnalyseTab =
  | 'dive-in'
  | 'scorecard'
  | 'vocals'
  | 'energy'
  | 'lyrics'
  | 'composition'
  | 'performance'
  | 'anomaly'
  | 'human-scorecard'
  | 'override';

const ANALYSE_TABS: TabItem<AnalyseTab>[] = [
  { id: 'dive-in', label: 'Dive In (10 D3 Visualizations \u00b7 8 KPIs)', icon: <BarChart3 className="w-3.5 h-3.5 text-info-600" /> },
  { id: 'scorecard', label: '4-Pillar Scorecard', icon: <Award className="w-3.5 h-3.5" /> },
  { id: 'vocals', label: 'Vocal Tessitura & Pitch ($P_V$)', icon: <Mic2 className="w-3.5 h-3.5" /> },
  { id: 'energy', label: 'Energy Curve & Structure ($P_S$)', icon: <Activity className="w-3.5 h-3.5" /> },
  { id: 'lyrics', label: 'Lyrics & Code-Switch ($P_W$)', icon: <PenTool className="w-3.5 h-3.5" /> },
  { id: 'composition', label: 'Composition & Stems ($P_C$)', icon: <Music className="w-3.5 h-3.5" /> },
  { id: 'performance', label: 'Digital Performance & Growth', icon: <BarChart3 className="w-3.5 h-3.5" /> },
  { id: 'anomaly', label: 'Organic vs Bot Audit', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
  { id: 'human-scorecard', label: '8-Dim A&R Scorecard', icon: <UserCheck className="w-3.5 h-3.5" /> },
  { id: 'override', label: 'A&R Override / Audit', icon: <SlidersHorizontal className="w-3.5 h-3.5" /> }
];

export const AnalyseSection: React.FC<AnalyseSectionProps> = ({
  artists,
  selectedArtist,
  onSelectArtist,
  onUpdateArtistScore,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSongIndex, setSelectedSongIndex] = useState<number>(0);
  const [playingSongId, setPlayingSongId] = useState<number | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<AnalyseTab>('dive-in');

  // Growth period state
  const [growthPeriod, setGrowthPeriod] = useState<'7d' | '14d' | '30d' | '90d'>('30d');

  // Human Scorecard 8 Dimensions (Master Build Prompt §6.10)
  const [humanSongwriting, setHumanSongwriting] = useState<number>(4.2);
  const [humanVocalIdentity, setHumanVocalIdentity] = useState<number>(4.5);
  const [humanMelody, setHumanMelody] = useState<number>(4.0);
  const [humanProduction, setHumanProduction] = useState<number>(3.5);
  const [humanOriginality, setHumanOriginality] = useState<number>(4.6);
  const [humanPerformance, setHumanPerformance] = useState<number>(4.1);
  const [humanArtisticDirection, setHumanArtisticDirection] = useState<number>(4.3);
  const [humanMarketFit, setHumanMarketFit] = useState<number>(4.0);
  const [humanReviewSaved, setHumanReviewSaved] = useState(false);

  // Manual Reviewer Override State
  const [overrideVocal, setOverrideVocal] = useState<number | null>(null);
  const [overrideWriting, setOverrideWriting] = useState<number | null>(null);
  const [overrideSong, setOverrideSong] = useState<number | null>(null);
  const [overrideComp, setOverrideComp] = useState<number | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState<string>('Strong indigenous melodic phrasing with exceptional grassroots potential.');
  const [overrideSaved, setOverrideSaved] = useState(false);

  const activeArtist = selectedArtist || artists[0];

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      if (audioElement) audioElement.pause();
    };
  }, [audioElement]);

  // Audio time update tracking for waveform / energy curve sync
  useEffect(() => {
    if (!audioElement) return;

    const handleTimeUpdate = () => {
      setCurrentTimeSec(Math.floor(audioElement.currentTime));
    };

    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [audioElement]);

  const filteredArtists = artists.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.primaryGenre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePlaySong = (song: RealSong) => {
    if (!song.previewUrl) return;

    if (playingSongId === song.id && audioElement) {
      if (audioElement.paused) {
        audioElement.play();
      } else {
        audioElement.pause();
        setPlayingSongId(null);
      }
      return;
    }

    if (audioElement) {
      audioElement.pause();
    }

    const audio = new Audio(song.previewUrl);
    audio.play();
    audio.onended = () => {
      setPlayingSongId(null);
      setCurrentTimeSec(0);
    };
    setAudioElement(audio);
    setPlayingSongId(song.id);
  };

  const handleSeekCurve = (second: number) => {
    if (audioElement && playingSongId === currentSong?.id) {
      audioElement.currentTime = Math.min(29, Math.max(0, second));
      setCurrentTimeSec(second);
    }
  };

  if (!activeArtist) {
    return (
      <div className="bg-surface border border-line rounded-card p-8 text-center text-purple-500 shadow-card">
        <div className="text-2xl mb-3">🎧</div>
        <h3 className="text-xl font-semibold text-navy-700">No artist selected</h3>
        <p className="mt-2">Choose an artist from Discovery or Recommendations to view AVM deep dive.</p>
      </div>
    );
  }

  const tracks = Array.isArray(activeArtist.tracks) ? activeArtist.tracks : [];
  const safeIndex = tracks.length ? Math.min(Math.max(selectedSongIndex, 0), tracks.length - 1) : 0;
  const currentSong = tracks[safeIndex] || tracks[0];
  const avm: TrackAVMRecord | undefined = currentSong?.avm;
  const rollup = activeArtist.avmRollup;

  // Effective Pillar Scores (with overrides if active)
  const effVocal = overrideVocal !== null ? overrideVocal : (avm?.pillarVocal || 0.72);
  const effWriting = overrideWriting !== null ? overrideWriting : (avm?.pillarWriting || 0.68);
  const effSong = overrideSong !== null ? overrideSong : (avm?.pillarSongWhole || 0.70);
  const effComp = overrideComp !== null ? overrideComp : (avm?.pillarComposition || 0.65);

  const weights = avm?.weightsApplied || { wV: 0.30, wW: 0.30, wS: 0.20, wC: 0.20 };
  const prodBonus = avm?.productionBonus || 0;
  const recalculatedTAV = Number((100 * (weights.wV * effVocal + weights.wW * effWriting + weights.wS * effSong + weights.wC * effComp) + prodBonus).toFixed(1));


  if (!currentSong) {
    return (
      <div className="space-y-5 pb-12 section-enter">
        <Card padding="lg">
          <h1 className="text-xl font-semibold text-navy-700">Analyze</h1>
          <p className="text-sm text-purple-500 mt-2">No track data available for {activeArtist.name}. Run discovery or ingest tracks to analyze.</p>
        </Card>
      </div>
    );
  }

  const handleSaveOverride = () => {
    onUpdateArtistScore(activeArtist.id, Number((recalculatedTAV / 20).toFixed(1)), reviewerNotes);
    setOverrideSaved(true);
    setTimeout(() => setOverrideSaved(false), 2000);
  };

  const pianoKeys = [
    { note: 'C2', isBlack: false, midi: 36 },
    { note: 'C#2', isBlack: true, midi: 37 },
    { note: 'D2', isBlack: false, midi: 38 },
    { note: 'D#2', isBlack: true, midi: 39 },
    { note: 'E2', isBlack: false, midi: 40 },
    { note: 'F2', isBlack: false, midi: 41 },
    { note: 'F#2', isBlack: true, midi: 42 },
    { note: 'G2', isBlack: false, midi: 43 },
    { note: 'G#2', isBlack: true, midi: 44 },
    { note: 'A2', isBlack: false, midi: 45 },
    { note: 'A#2', isBlack: true, midi: 46 },
    { note: 'B2', isBlack: false, midi: 47 },
    { note: 'C3', isBlack: false, midi: 48 },
    { note: 'C#3', isBlack: true, midi: 49 },
    { note: 'D3', isBlack: false, midi: 50 },
    { note: 'D#3', isBlack: true, midi: 51 },
    { note: 'E3', isBlack: false, midi: 52 },
    { note: 'F3', isBlack: false, midi: 53 },
    { note: 'F#3', isBlack: true, midi: 54 },
    { note: 'G3', isBlack: false, midi: 55 },
    { note: 'G#3', isBlack: true, midi: 56 },
    { note: 'A3', isBlack: false, midi: 57 },
    { note: 'A#3', isBlack: true, midi: 58 },
    { note: 'B3', isBlack: false, midi: 59 },
    { note: 'C4', isBlack: false, midi: 60 },
    { note: 'C#4', isBlack: true, midi: 61 },
    { note: 'D4', isBlack: false, midi: 62 },
    { note: 'D#4', isBlack: true, midi: 63 },
    { note: 'E4', isBlack: false, midi: 64 },
    { note: 'F4', isBlack: false, midi: 65 },
    { note: 'F#4', isBlack: true, midi: 66 },
    { note: 'G4', isBlack: false, midi: 67 },
    { note: 'G#4', isBlack: true, midi: 68 },
    { note: 'A4', isBlack: false, midi: 69 },
    { note: 'A#4', isBlack: true, midi: 70 },
    { note: 'B4', isBlack: false, midi: 71 },
    { note: 'C5', isBlack: false, midi: 72 },
    { note: 'C#5', isBlack: true, midi: 73 },
    { note: 'D5', isBlack: false, midi: 74 },
    { note: 'D#5', isBlack: true, midi: 75 },
    { note: 'E5', isBlack: false, midi: 76 },
    { note: 'F5', isBlack: false, midi: 77 },
    { note: 'G5', isBlack: false, midi: 79 },
  ];

  const tabScope: AnalyseTabProps = {
    avm, effVocal, effWriting, effSong, effComp, weights, prodBonus, recalculatedTAV,
    currentSong, playingSongId, currentTimeSec, handlePlaySong, handleSeekCurve,
    activeArtist, pianoKeys, growthPeriod, setGrowthPeriod,
    humanSongwriting, setHumanSongwriting, humanVocalIdentity, setHumanVocalIdentity,
    humanMelody, setHumanMelody, humanProduction, setHumanProduction,
    humanOriginality, setHumanOriginality, humanPerformance, setHumanPerformance,
    humanArtisticDirection, setHumanArtisticDirection, humanMarketFit, setHumanMarketFit,
    humanReviewSaved, setHumanReviewSaved, reviewerNotes, setReviewerNotes, onUpdateArtistScore,
    overrideSaved, setOverrideVocal, setOverrideWriting, setOverrideSong, setOverrideComp,
    handleSaveOverride,
  };

  return (
    <div className="space-y-5 pb-12 section-enter">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block text-2xs font-mono font-semibold tracking-[0.12em] uppercase text-brand-600 bg-brand-500/10 px-2 py-0.5 rounded-sm border border-brand-500/30">
            ARTISTIC VALUE MODEL (AVM) · 4-PILLAR DEEP DIVE
          </span>
          <h1 className="text-xl font-semibold text-navy-700 tracking-tight mt-1.5">
            A&R Intelligence Dossier: {activeArtist.name}
          </h1>
          <p className="text-xs text-purple-500 mt-0.5 max-w-2xl leading-relaxed">
            Signal processing on isolated stems: vocal tessitura, pitch holding accuracy, multilingual writing arc, energy curve fit, and production polish headroom.
          </p>
        </div>

        {/* High Potential, Low Production Tag Banner */}
        {rollup?.highPotentialCount > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-card bg-warning-50 border border-warning-100 text-navy-700 text-xs font-semibold ">
            <Sparkles className="w-4 h-4 text-warning-600" />
            <div>
              <span>High Potential, Low Production Tag</span>
              <p className="text-2xs font-medium text-purple-700">Exceptional songwriting/vocal talent exceeds studio polish (Best A&R Alpha)</p>
            </div>
          </div>
        )}
      </div>

      {/* 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Upcoming Artist Directory (4 cols) */}
        <div className="lg:col-span-4 glass p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-navy-700 uppercase tracking-wider">
              Upcoming Candidates ({filteredArtists.length})
            </h3>
            <span className="text-2xs font-semibold px-2.5 py-0.5 rounded bg-success-50 text-success-600 border border-success-600/30">
              Underground / Indie
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-purple-700 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Filter upcoming artists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface border border-line-strong rounded-sm pl-9 pr-3.5 py-1.5 text-xs text-navy-700 placeholder:text-navy-500 focus:outline-none focus:border-info-600 "
            />
          </div>

          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {filteredArtists.map((artist, aIdx) => {
              const isSelected = artist.id === activeArtist.id;
              const hasHighPot = artist.avmRollup?.highPotentialCount > 0;
              return (
                <div
                  key={`analyse-cand-${artist.id}-${aIdx}`}
                  onClick={() => {
                    onSelectArtist(artist);
                    setSelectedSongIndex(0);
                    setOverrideVocal(null);
                    setOverrideWriting(null);
                    setOverrideSong(null);
                    setOverrideComp(null);
                  }}
                  className={`p-3 rounded border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-surface border-info-600 text-navy-700 shadow-raised ring-2 ring-info-600/30'
                      : 'bg-surface hover:bg-surface border-line'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={artist.avatarUrl}
                      alt={artist.name}
                      className="w-10 h-10 rounded object-cover border border-line-strong "
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-navy-700">{artist.name}</span>
                        {hasHighPot && (
                          <span className="text-2xs px-1.5 py-0.2 rounded bg-warning-50 text-navy-700 font-semibold">
                            High Pot
                          </span>
                        )}
                      </div>
                      <p className="text-2xs text-purple-700">
                        {artist.city}, {artist.country} • {artist.tracks.length} releases
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold font-mono text-navy-700 block">
                      AAV {artist.avmRollup ? artist.avmRollup.aav : (artist.artisticScore * 20).toFixed(1)}
                    </span>
                    <span className={`text-2xs font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${
                      artist.recommendationTier === 'PURSUE'
                        ? 'pill-sign'
                        : artist.recommendationTier === 'MEET'
                        ? 'pill-investigate'
                        : 'pill-monitor'
                    }`}>
                      {artist.recommendationTier}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Song Dive & AVM Analysis (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Artist Rollup Card (AAV, Median, P75, Consistency, Trajectory) */}
          <div className="glass p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={activeArtist.avatarUrl}
                  alt={activeArtist.name}
                  className="w-16 h-16 rounded object-cover border border-line-strong "
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-semibold text-navy-700">{activeArtist.name}</h2>
                    <span className="text-xs px-3 py-0.5 rounded bg-purple-50 text-info-600 font-semibold border border-info-600/30">
                      {activeArtist.primaryGenre}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-sm font-semibold uppercase tracking-wider ${
                      activeArtist.recommendationTier === 'PURSUE'
                        ? 'pill-sign'
                        : activeArtist.recommendationTier === 'MEET'
                        ? 'pill-investigate'
                        : 'pill-monitor'
                    }`}>
                      {activeArtist.recommendationTier}
                    </span>
                  </div>
                  <p className="text-xs text-purple-700 mt-1 font-medium">
                    {activeArtist.city}, {activeArtist.country} • Stage: {activeArtist.stage} • {(activeArtist.tracks||[]).length} verified songs in catalog
                  </p>
                </div>
              </div>

              {/* Action & AAV Score Block */}
              <div className="flex items-center gap-3 sm:border-l sm:border-line sm:pl-4">
                <button
                  onClick={() => setActiveTab('dive-in')}
                  className={`btn-blue text-xs flex items-center gap-1.5 transition-all cursor-pointer  ${
                    activeTab === 'dive-in' ? 'ring-2 ring-brand-500' : ''
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-brand-500" />
                  <span>Dive In</span>
                </button>

                <div className="text-right">
                  <span className="text-2xs font-bold text-purple-700 uppercase tracking-wider block">
                    Artist Value (AAV)
                  </span>
                  <div className="text-2xl font-semibold text-brand-600 font-mono">
                    {rollup ? rollup.aav : 82.0} <span className="text-xs font-normal text-purple-700">/ 100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AVM Step 4 Rollup Metrics Grid */}
            {rollup && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-line text-xs">
                <Card variant="default" padding="none" className="p-3.5">
                  <span className="text-2xs text-purple-700 font-bold block">Median TAV (50%)</span>
                  <span className="text-sm font-semibold text-navy-700 font-mono">{rollup.medianTAV}</span>
                  <p className="text-2xs text-purple-700">Central catalog quality</p>
                </Card>

                <Card variant="default" padding="none" className="p-3.5">
                  <span className="text-2xs text-purple-700 font-bold block">P75 Peak TAV (20%)</span>
                  <span className="text-sm font-semibold text-info-600 font-mono">{rollup.p75TAV}</span>
                  <p className="text-2xs text-purple-700">Upper quartile ability</p>
                </Card>

                <Card variant="default" padding="none" className="p-3.5">
                  <span className="text-2xs text-purple-700 font-bold block">Consistency (15%)</span>
                  <span className="text-sm font-semibold text-success-600 font-mono">{rollup.consistency}</span>
                  <p className="text-2xs text-purple-700">100 - 2 × StdDev</p>
                </Card>

                <Card variant="default" padding="none" className="p-3.5">
                  <span className="text-2xs text-purple-700 font-bold block">Trajectory (15%)</span>
                  <span className="text-sm font-semibold text-warning-600 font-mono">{rollup.trajectory}</span>
                  <p className="text-2xs text-purple-700">Slope per release (last 5)</p>
                </Card>
              </div>
            )}
          </div>

          {/* Catalog Releases Discography Bar */}
          <div className="glass p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-navy-700 uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 text-warning-600" />
                <span>Catalog Releases & Stems ({(activeArtist.tracks||[]).length})</span>
              </h3>
              <span className="text-xs text-purple-700 font-medium">Click any song to dive into stem facts and waveform</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(activeArtist.tracks||[]).map((song, i) => {
                const isSelected = i === selectedSongIndex;
                const isPlaying = playingSongId === song.id;
                return (
                  <div
                    key={`analyse-song-${activeArtist.id}-${song.id}-${i}`}
                    onClick={() => {
                      setSelectedSongIndex(i);
                      setOverrideVocal(null);
                      setOverrideWriting(null);
                      setOverrideSong(null);
                      setOverrideComp(null);
                    }}
                    className={`p-3 rounded border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-surface border-info-600 shadow-raised ring-2 ring-info-600/30'
                        : 'bg-surface hover:bg-surface border-line'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate pr-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlaySong(song);
                        }}
                        className={`w-8 h-8 rounded flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                          isPlaying
                            ? 'bg-info-600 text-navy-900 '
                            : 'bg-surface text-navy-700 border border-line-strong'
                        }`}
                        title={isPlaying ? 'Pause' : 'Play 30s audio preview'}
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                      </button>

                      {song.artworkUrl && (
                        <img
                          src={song.artworkUrl}
                          alt={song.title}
                          className="w-9 h-9 rounded object-cover border border-line-strong shrink-0"
                        />
                      )}

                      <div className="truncate">
                        <p className="text-xs font-semibold text-navy-700 truncate">{song.title}</p>
                        <p className="text-2xs text-purple-700">
                          {song.releaseDate} • {song.collectionName}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-semibold font-mono text-info-600">
                        TAV {song.avm ? song.avm.tav : 80}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deep Track Inspection Section */}
          {currentSong && avm && (
            <div className="glass p-4 space-y-4">
              {/* Track Title, Genre Profile, and TAV Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-purple-700 uppercase">Inspecting Track:</span>
                    <span className="text-base font-semibold text-navy-700">{currentSong.title}</span>
                  </div>
                  <p className="text-xs text-purple-700 mt-0.5">
                    Genre Profile: <strong className="text-navy-700">{avm.genreProfile}</strong> • Confidence Range: [{avm.tavRange[0]} – {avm.tavRange[1]}]
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 px-3.5 rounded bg-surface border border-line text-center ">
                    <span className="text-2xs text-purple-700 font-bold block">Production Index</span>
                    <span className="text-sm font-semibold text-navy-700 font-mono">{avm.productionIndex} / 100</span>
                    <span className="text-2xs text-success-600 font-semibold">PB: +{avm.productionBonus} pts</span>
                  </div>

                  <div className="p-2.5 px-3.5 rounded bg-purple-50 border border-series-1/30 text-center ">
                    <span className="text-2xs text-brand-600 font-semibold block">Track Artistic Value (TAV)</span>
                    <span className="text-2xl font-semibold text-brand-600 font-mono">{recalculatedTAV}</span>
                  </div>
                </div>
              </div>

              {/* Deep AVM exploration tablist */}
              <Tabs<AnalyseTab>
                items={ANALYSE_TABS}
                active={activeTab}
                onChange={setActiveTab}
                ariaLabel="Analyse sub-sections"
                className="overflow-x-auto border-b border-line pb-3"
              />

              {/* TAB 0: Dive In Executive Telemetry & 10 D3 Visualizations */}
              {activeTab === 'dive-in' && (
                <DiveInSection
                  artist={activeArtist}
                  onPlaySong={handlePlaySong}
                  playingSongId={playingSongId}
                />
              )}

              {/* TAB 1: 4-Pillar Scorecard */}
              {activeTab === 'scorecard' && <ScorecardTab {...tabScope} />}

              {/* TAB 2: Stem & Vocal Tessitura Lab */}
              {activeTab === 'vocals' && <VocalsTab {...tabScope} />}

              {/* TAB 3: Energy Curve & Structure ($P_S$) */}
              {activeTab === 'energy' && <EnergyTab {...tabScope} />}

              {/* TAB 4: Lyrics & Multilingual Writing ($P_W$) */}
              {activeTab === 'lyrics' && <LyricsTab {...tabScope} />}

              {/* TAB 5: Composition & Stems ($P_C$) */}
              {activeTab === 'composition' && <CompositionTab {...tabScope} />}

              {/* TAB: Digital Performance & Multi-Platform Growth */}
              {activeTab === 'performance' && <PerformanceTab {...tabScope} />}

              {/* TAB: Organic Growth vs Bot / Fraud Anomaly Investigation (Master Prompt §6.9) */}
              {activeTab === 'anomaly' && <AnomalyTab {...tabScope} />}

              {/* TAB: 8-Dimension Human-Led A&R Scorecard (Master Prompt §6.10) */}
              {activeTab === 'human-scorecard' && <HumanScorecardTab {...tabScope} />}

              {/* TAB 6: A&R Override & Headroom */}
              {activeTab === 'override' && <OverrideTab {...tabScope} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
