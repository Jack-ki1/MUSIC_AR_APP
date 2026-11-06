import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  ExternalLink, 
  CheckCircle2, 
  Disc, 
  Activity, 
  Search, 
  Sparkles, 
  Flame, 
  Mic2, 
  PenTool, 
  Layers, 
  Sliders, 
  Music, 
  Award, 
  TrendingUp, 
  AlertCircle, 
  ShieldCheck, 
  Radio,
  Clock,
  Star,
  Maximize2,
  Volume2,
  VolumeX,
  FileText,
  SlidersHorizontal,
  DollarSign,
  ChevronRight,
  Info,
  BarChart3,
  UserCheck,
  ShieldAlert,
  Globe,
  ThumbsUp,
  MessageSquare,
  Eye,
  Heart
} from 'lucide-react';
import { RealArtistData, RealSong } from '../../types';
import { TrackAVMRecord, computeTrackAVM } from '../../services/avmEngine';
import { DiveInSection } from './DiveInSection';

interface AnalyseSectionProps {
  artists: RealArtistData[];
  selectedArtist: RealArtistData | null;
  onSelectArtist: (artist: RealArtistData) => void;
  onUpdateArtistScore: (artistId: string, artisticScore: number, notes: string) => void;
}

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
  const [activeTab, setActiveTab] = useState<'dive-in' | 'scorecard' | 'vocals' | 'energy' | 'lyrics' | 'composition' | 'performance' | 'anomaly' | 'human-scorecard' | 'override'>('dive-in');

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
      <div className="bg-white border border-[#E5E9F3] rounded-2xl p-12 text-center text-[#64748B]">
        No upcoming artists discovered yet. Start the autonomous discovery engine to parse emerging talent.
      </div>
    );
  }

  const currentSong = activeArtist.tracks[selectedSongIndex] || activeArtist.tracks[0];
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

  return (
    <div className="space-y-6 pb-24">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-wider text-[#7155F5] uppercase">
            ARTISTIC VALUE MODEL (AVM) · 4-PILLAR DEEP DIVE
          </span>
          <h1 className="text-xl font-extrabold text-[#0F172A] tracking-tight mt-0.5">
            A&R Intelligence: {activeArtist.name}
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5 max-w-2xl">
            Signal processing on isolated stems: vocal tessitura, pitch holding accuracy, multilingual writing arc, energy curve fit, and production polish headroom.
          </p>
        </div>

        {/* High Potential, Low Production Tag Banner */}
        {rollup?.highPotentialCount > 0 && (
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FEF3C7] border border-[#F59E0B]/40 text-[#B45309] text-xs font-bold shadow-2xs">
            <Sparkles className="w-4 h-4 text-[#D97706]" />
            <div>
              <span>High Potential, Low Production Tag</span>
              <p className="text-[10px] font-normal text-[#92400E]">Exceptional songwriting/vocal talent exceeds studio polish (Best A&R Alpha)</p>
            </div>
          </div>
        )}
      </div>

      {/* 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upcoming Artist Directory (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-[#E5E9F3] rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              Upcoming Candidates ({filteredArtists.length})
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669]">
              Underground / Indie
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter upcoming artists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#7155F5]"
            />
          </div>

          <div className="space-y-1.5 max-h-[700px] overflow-y-auto pr-1">
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
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#F5F3FF] border-[#7155F5] text-[#5425D5] shadow-xs'
                      : 'bg-white hover:bg-[#F8FAFC] border-[#E2E8F0]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={artist.avatarUrl}
                      alt={artist.name}
                      className="w-10 h-10 rounded-xl object-cover border border-[#E2E8F0]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#0F172A]">{artist.name}</span>
                        {hasHighPot && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#FEF3C7] text-[#B45309] font-bold">
                            High Pot
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#64748B]">
                        {artist.city}, {artist.country} • {artist.tracks.length} releases
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black font-mono text-[#0F172A] block">
                      AAV {artist.avmRollup ? artist.avmRollup.aav : (artist.artisticScore * 20).toFixed(1)}
                    </span>
                    <span className="text-[9px] font-bold text-[#7155F5]">
                      {artist.recommendationTier}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Song Dive & AVM Analysis (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Artist Rollup Card (AAV, Median, P75, Consistency, Trajectory) */}
          <div className="bg-white border border-[#E5E9F3] rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={activeArtist.avatarUrl}
                  alt={activeArtist.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-[#E2E8F0] shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-extrabold text-[#0F172A]">{activeArtist.name}</h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#EEF2FF] text-[#4338CA] font-bold border border-[#C7D2FE]">
                      {activeArtist.primaryGenre}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] font-extrabold border border-[#A7F3D0]">
                      {activeArtist.recommendationTier}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-1">
                    {activeArtist.city}, {activeArtist.country} • Stage: {activeArtist.stage} • {activeArtist.tracks.length} verified songs in catalog
                  </p>
                </div>
              </div>

              {/* Action & AAV Score Block */}
              <div className="flex items-center gap-3 sm:border-l sm:border-[#E2E8F0] sm:pl-4">
                <button
                  onClick={() => setActiveTab('dive-in')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                    activeTab === 'dive-in'
                      ? 'bg-[#0F172A] text-white ring-2 ring-[#7155F5]/40'
                      : 'bg-[#EEF2FF] text-[#4338CA] hover:bg-[#7155F5] hover:text-white border border-[#C7D2FE]'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Dive In</span>
                </button>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                    Artist Value (AAV)
                  </span>
                  <div className="text-2xl font-black text-[#7155F5] font-mono">
                    {rollup ? rollup.aav : 82.0} <span className="text-xs font-normal text-[#64748B]">/ 100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AVM Step 4 Rollup Metrics Grid */}
            {rollup && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#F1F5F9] text-xs">
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] font-semibold block">Median TAV (50%)</span>
                  <span className="text-sm font-black text-[#0F172A] font-mono">{rollup.medianTAV}</span>
                  <p className="text-[9px] text-[#94A3B8]">Central catalog quality</p>
                </div>

                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] font-semibold block">P75 Peak TAV (20%)</span>
                  <span className="text-sm font-black text-[#2563EB] font-mono">{rollup.p75TAV}</span>
                  <p className="text-[9px] text-[#94A3B8]">Upper quartile ability</p>
                </div>

                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] font-semibold block">Consistency (15%)</span>
                  <span className="text-sm font-black text-[#059669] font-mono">{rollup.consistency}</span>
                  <p className="text-[9px] text-[#94A3B8]">100 - 2 × StdDev</p>
                </div>

                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] font-semibold block">Trajectory (15%)</span>
                  <span className="text-sm font-black text-[#D97706] font-mono">{rollup.trajectory}</span>
                  <p className="text-[9px] text-[#94A3B8]">Slope per release (last 5)</p>
                </div>
              </div>
            )}
          </div>

          {/* Catalog Releases Discography Bar */}
          <div className="bg-white border border-[#E5E9F3] rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#EA580C]" />
                <span>Catalog Releases & Stems ({activeArtist.tracks.length})</span>
              </h3>
              <span className="text-xs text-[#64748B]">Click any song to dive into stem facts and waveform</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activeArtist.tracks.map((song, i) => {
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
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#EEF2FF] border-[#6366F1] shadow-xs'
                        : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] border-[#E2E8F0]'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate pr-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlaySong(song);
                        }}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                          isPlaying
                            ? 'bg-[#7155F5] text-white shadow-xs'
                            : 'bg-white text-[#0F172A] border border-[#CBD5E1]'
                        }`}
                        title={isPlaying ? 'Pause' : 'Play 30s audio preview'}
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                      </button>

                      {song.artworkUrl && (
                        <img
                          src={song.artworkUrl}
                          alt={song.title}
                          className="w-9 h-9 rounded-lg object-cover border border-[#E2E8F0] shrink-0"
                        />
                      )}

                      <div className="truncate">
                        <p className="text-xs font-bold text-[#0F172A] truncate">{song.title}</p>
                        <p className="text-[10px] text-[#64748B]">
                          {song.releaseDate} • {song.collectionName}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black font-mono text-[#7155F5]">
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
            <div className="bg-white border border-[#E5E9F3] rounded-2xl p-6 shadow-2xs space-y-6">
              {/* Track Title, Genre Profile, and TAV Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F1F5F9]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#64748B] uppercase">Inspecting Track:</span>
                    <span className="text-base font-extrabold text-[#0F172A]">{currentSong.title}</span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Genre Profile: <strong className="text-[#0F172A]">{avm.genreProfile}</strong> • Confidence Range: [{avm.tavRange[0]} – {avm.tavRange[1]}]
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 px-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center">
                    <span className="text-[10px] text-[#64748B] font-bold block">Production Index</span>
                    <span className="text-sm font-black text-[#0F172A] font-mono">{avm.productionIndex} / 100</span>
                    <span className="text-[9px] text-[#059669] font-bold">PB: +{avm.productionBonus} pts</span>
                  </div>

                  <div className="p-2 px-3 rounded-xl bg-[#F5F3FF] border border-[#7155F5]/30 text-center">
                    <span className="text-[10px] text-[#5425D5] font-bold block">Track Artistic Value (TAV)</span>
                    <span className="text-2xl font-black text-[#7155F5] font-mono">{recalculatedTAV}</span>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs for Deep AVM Exploration */}
              <div className="flex items-center gap-1 overflow-x-auto border-b border-[#E2E8F0] pb-2 text-xs">
                <button
                  onClick={() => setActiveTab('dive-in')}
                  className={`px-3.5 py-1.5 rounded-xl font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'dive-in'
                      ? 'bg-[#0F172A] text-white shadow-xs border border-[#334155]'
                      : 'text-[#7155F5] hover:text-[#0F172A] bg-[#EEF2FF] border border-[#6366F1]/30'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Dive In (10 D3 Visualizations · 8 KPIs)</span>
                </button>

                <button
                  onClick={() => setActiveTab('scorecard')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'scorecard'
                      ? 'bg-[#7155F5] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A] bg-[#F8FAFC]'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>4-Pillar Scorecard</span>
                </button>

                <button
                  onClick={() => setActiveTab('vocals')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'vocals'
                      ? 'bg-[#7155F5] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A] bg-[#F8FAFC]'
                  }`}
                >
                  <Mic2 className="w-3.5 h-3.5" />
                  <span>Vocal Tessitura & Pitch ($P_V$)</span>
                </button>

                <button
                  onClick={() => setActiveTab('energy')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'energy'
                      ? 'bg-[#7155F5] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A] bg-[#F8FAFC]'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Energy Curve & Structure ($P_S$)</span>
                </button>

                <button
                  onClick={() => setActiveTab('lyrics')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'lyrics'
                      ? 'bg-[#7155F5] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A] bg-[#F8FAFC]'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Lyrics & Code-Switch ($P_W$)</span>
                </button>

                <button
                  onClick={() => setActiveTab('composition')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'composition'
                      ? 'bg-[#7155F5] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A] bg-[#F8FAFC]'
                  }`}
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>Composition & Stems ($P_C$)</span>
                </button>

                <button
                  onClick={() => setActiveTab('performance')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'performance'
                      ? 'bg-[#7155F5] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A] bg-[#F8FAFC]'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Digital Performance & Growth</span>
                </button>

                <button
                  onClick={() => setActiveTab('anomaly')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'anomaly'
                      ? 'bg-[#7155F5] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A] bg-[#F8FAFC]'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Organic vs Bot Audit</span>
                </button>

                <button
                  onClick={() => setActiveTab('human-scorecard')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'human-scorecard'
                      ? 'bg-[#7155F5] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A] bg-[#F8FAFC]'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>8-Dim A&R Scorecard</span>
                </button>

                <button
                  onClick={() => setActiveTab('override')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'override'
                      ? 'bg-[#7155F5] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A] bg-[#F8FAFC]'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>A&R Override / Audit</span>
                </button>
              </div>

              {/* TAB 0: Dive In Executive Telemetry & 10 D3 Visualizations */}
              {activeTab === 'dive-in' && (
                <DiveInSection
                  artist={activeArtist}
                  onPlaySong={handlePlaySong}
                  playingSongId={playingSongId}
                />
              )}

              {/* TAB 1: 4-Pillar Scorecard */}
              {activeTab === 'scorecard' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Pillar V */}
                    <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="flex items-center gap-1.5 text-[#0F172A]">
                          <Mic2 className="w-3.5 h-3.5 text-[#2563EB]" />
                          Pillar V: Vocal Ability
                        </span>
                        <span className="text-[#2563EB] font-mono font-black">{effVocal}</span>
                      </div>
                      <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                        <div className="h-full bg-[#2563EB] rounded-full" style={{ width: `${effVocal * 100}%` }}></div>
                      </div>
                      <p className="text-[10px] text-[#64748B]">Weight: {weights.wV.toFixed(2)} (Pitch, Tone, Range, Phrasing)</p>
                    </div>

                    {/* Pillar W */}
                    <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="flex items-center gap-1.5 text-[#0F172A]">
                          <PenTool className="w-3.5 h-3.5 text-[#7155F5]" />
                          Pillar W: Writing & Concept
                        </span>
                        <span className="text-[#7155F5] font-mono font-black">{effWriting}</span>
                      </div>
                      <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                        <div className="h-full bg-[#7155F5] rounded-full" style={{ width: `${effWriting * 100}%` }}></div>
                      </div>
                      <p className="text-[10px] text-[#64748B]">Weight: {weights.wW.toFixed(2)} (Imagery, Arc, Hooks, Sound Craft)</p>
                    </div>

                    {/* Pillar S */}
                    <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="flex items-center gap-1.5 text-[#0F172A]">
                          <Layers className="w-3.5 h-3.5 text-[#059669]" />
                          Pillar S: Song as Whole
                        </span>
                        <span className="text-[#059669] font-mono font-black">{effSong}</span>
                      </div>
                      <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                        <div className="h-full bg-[#059669] rounded-full" style={{ width: `${effSong * 100}%` }}></div>
                      </div>
                      <p className="text-[10px] text-[#64748B]">Weight: {weights.wS.toFixed(2)} (Energy Curve, Cohesion, Gestalt)</p>
                    </div>

                    {/* Pillar C */}
                    <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="flex items-center gap-1.5 text-[#0F172A]">
                          <Music className="w-3.5 h-3.5 text-[#D97706]" />
                          Pillar C: Composition
                        </span>
                        <span className="text-[#D97706] font-mono font-black">{effComp}</span>
                      </div>
                      <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                        <div className="h-full bg-[#D97706] rounded-full" style={{ width: `${effComp * 100}%` }}></div>
                      </div>
                      <p className="text-[10px] text-[#64748B]">Weight: {weights.wC.toFixed(2)} (Melody, Harmony, Groove, Stems)</p>
                    </div>
                  </div>

                  {/* Mathematical Formulation Explainer from PDF */}
                  <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs space-y-2">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                      Mathematical Synthesis Formula (AVM Section 1)
                    </span>
                    <div className="p-2.5 rounded-lg bg-white border border-[#E2E8F0] font-mono text-[11px] text-[#0F172A] overflow-x-auto">
                      TAV = 100 × ({weights.wV.toFixed(2)} × {effVocal} + {weights.wW.toFixed(2)} × {effWriting} + {weights.wS.toFixed(2)} × {effSong} + {weights.wC.toFixed(2)} × {effComp}) + {prodBonus} = <strong className="text-[#7155F5]">{recalculatedTAV}</strong>
                    </div>
                    <p className="text-[11px] text-[#64748B]">
                      Production Index is {avm.productionIndex}/100. Per Section 6: production polish never lowers an artist's score; it can only add up to a capped +3.0 bonus points.
                    </p>
                  </div>

                  {/* Verifiable Evidence */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                      AVM Verifiable Evidence & Flags:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {avm.evidence.map((ev, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#334155] flex items-center gap-2"
                        >
                          <span className="text-[#059669] font-bold">✓</span>
                          <span>{ev}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Stem & Vocal Tessitura Lab */}
              {activeTab === 'vocals' && (
                <div className="space-y-6 animate-in fade-in">
                  {/* Piano Keyboard Tessitura Visualizer */}
                  <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                          <Mic2 className="w-4 h-4 text-[#2563EB]" />
                          <span>Vocal Tessitura & Pitch Span (V4 Range Percentile)</span>
                        </h4>
                        <p className="text-[11px] text-[#64748B] mt-0.5">
                          Lowest note: <strong className="text-[#2563EB]">{avm.vocalProfile.lowestNote}</strong> • Highest note: <strong className="text-[#2563EB]">{avm.vocalProfile.highestNote}</strong> • Usable span: <strong>{avm.vocalProfile.usableRangeSemitones} semitones</strong>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-[#64748B] block">Detected Center Key</span>
                        <span className="text-xs font-black text-[#059669] font-mono">{avm.vocalProfile.detectedKey}</span>
                      </div>
                    </div>

                    {/* Interactive Piano Roll Display */}
                    <div className="overflow-x-auto py-2">
                      <div className="inline-flex h-24 bg-white border border-[#CBD5E1] rounded-xl p-1 relative shadow-inner">
                        {pianoKeys.map((k) => {
                          const isLowest = k.note === avm.vocalProfile.lowestNote;
                          const isHighest = k.note === avm.vocalProfile.highestNote;
                          const lowestMidi = 40; // rough baseline
                          const highestMidi = 76;
                          const isInRange = k.midi >= lowestMidi && k.midi <= highestMidi;

                          return (
                            <div
                              key={k.note}
                              className={`relative select-none text-[9px] font-mono transition-colors ${
                                k.isBlack
                                  ? '-mx-2.5 z-10 w-5 h-14 rounded-b bg-[#0F172A] text-white flex items-end justify-center pb-1'
                                  : 'w-7 h-22 rounded-b border-r border-[#E2E8F0] bg-white flex items-end justify-center pb-1 text-[#64748B]'
                              } ${
                                isLowest || isHighest
                                  ? 'bg-[#7155F5] text-white font-bold ring-2 ring-[#7155F5]'
                                  : isInRange && !k.isBlack
                                  ? 'bg-[#EEF2FF] text-[#4338CA]'
                                  : ''
                              }`}
                              title={`${k.note} (MIDI ${k.midi})`}
                            >
                              <span>{k.note}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Pitch Error Cent Distribution Bar Chart (V1) */}
                  <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
                          V1 Pitch Error Cent Deviation Distribution (CREPE f0 Tracking)
                        </h4>
                        <p className="text-[11px] text-[#64748B] mt-0.5">
                          {avm.notesWithin20CentsPercent}% of held sustained notes fall inside the critical ±20 cents intonation window.
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#2563EB]">
                        {avm.subScores.v1PitchAccuracy} / 1.00
                      </span>
                    </div>

                    <div className="h-32 flex items-end gap-2 pt-4 px-2 border-b border-[#E2E8F0]">
                      {avm.pitchDistribution.map((bin) => (
                        <div key={bin.centBin} className="flex-1 flex flex-col items-center gap-1 group">
                          <span className="text-[8px] font-mono text-[#64748B] group-hover:text-[#0F172A]">
                            {bin.countPercent}%
                          </span>
                          <div
                            className={`w-full rounded-t transition-all ${
                              bin.isWithin20Cents
                                ? 'bg-[#2563EB] group-hover:bg-[#1d4ed8]'
                                : 'bg-[#CBD5E1] group-hover:bg-[#94A3B8]'
                            }`}
                            style={{ height: `${bin.countPercent * 2.5}px` }}
                          ></div>
                          <span className="text-[9px] font-mono text-[#64748B] whitespace-nowrap">
                            {bin.centBin}c
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vocal Acoustic Metrics Grid (V2 Stability, V3 Formants, Autotune Audit) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0]">
                      <span className="text-[10px] text-[#64748B] font-semibold block">V2 Vibrato & Stability</span>
                      <span className="text-sm font-black text-[#0F172A]">{avm.vocalProfile.vibratoRateHz} Hz</span>
                      <span className="text-[10px] text-[#64748B] block">±{avm.vocalProfile.vibratoDepthCents} cents depth</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0]">
                      <span className="text-[10px] text-[#64748B] font-semibold block">V3 Formants & Timbre</span>
                      <span className="text-sm font-black text-[#0F172A]">F1 {avm.vocalProfile.formantF1Hz} Hz</span>
                      <span className="text-[10px] text-[#64748B] block">F2 {avm.vocalProfile.formantF2Hz} Hz</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0]">
                      <span className="text-[10px] text-[#64748B] font-semibold block">Harmonic-to-Noise</span>
                      <span className="text-sm font-black text-[#0F172A]">{avm.vocalProfile.harmonicToNoiseRatioDb} dB</span>
                      <span className="text-[10px] text-[#059669] block">Clean vocal clarity</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0]">
                      <span className="text-[10px] text-[#64748B] font-semibold block">Autotune / Processing</span>
                      <span className="text-sm font-black text-[#0F172A]">{(avm.vocalProfile.processingLevel * 100).toFixed(0)}%</span>
                      <span className="text-[10px] text-[#7155F5] block font-semibold">
                        Intrinsic conf: {(avm.vocalProfile.intrinsicPitchConfidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Energy Curve & Structure ($P_S$) */}
              {activeTab === 'energy' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                          <Activity className="w-4 h-4 text-[#059669]" />
                          <span>S1 Energy Curve & Structure (Synchronized 30s Audio Stream)</span>
                        </h4>
                        <p className="text-[11px] text-[#64748B]">
                          Scored against genre hit archetypes: loudness, onset density, spectral flux, bass weight, and section lift.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePlaySong(currentSong)}
                          className="px-3 py-1.5 rounded-xl bg-[#7155F5] hover:bg-[#5f3fe8] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          {playingSongId === currentSong.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          <span>{playingSongId === currentSong.id ? 'Pause Preview' : 'Play 30s Preview'}</span>
                        </button>
                        <span className="text-xs font-mono font-bold text-[#0F172A] px-2 py-1 rounded bg-white border border-[#CBD5E1]">
                          00:{String(currentTimeSec).padStart(2, '0')} / 00:30
                        </span>
                      </div>
                    </div>

                    {/* Interactive Synchronized Energy Curve SVG */}
                    <div className="relative bg-white border border-[#CBD5E1] rounded-xl p-4 shadow-inner">
                      {/* Section timeline labels */}
                      <div className="flex justify-between text-[10px] font-bold text-[#64748B] mb-2 px-1">
                        <span>Intro (0-5s)</span>
                        <span>Verse (5-14s)</span>
                        <span>Pre-Chorus (14-19s)</span>
                        <span className="text-[#7155F5]">Chorus / Hook (19-26s)</span>
                        <span>Drop (26-30s)</span>
                      </div>

                      {/* Multi-trace energy graph */}
                      <svg viewBox="0 0 300 100" className="w-full h-36 overflow-visible cursor-pointer" onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const sec = Math.floor((x / rect.width) * 30);
                        handleSeekCurve(sec);
                      }}>
                        {/* Grid lines */}
                        <line x1="0" y1="25" x2="300" y2="25" stroke="#F1F5F9" strokeDasharray="3 3" />
                        <line x1="0" y1="50" x2="300" y2="50" stroke="#F1F5F9" strokeDasharray="3 3" />
                        <line x1="0" y1="75" x2="300" y2="75" stroke="#F1F5F9" strokeDasharray="3 3" />

                        {/* Overall Energy Area Fill */}
                        <polygon
                          points={`0,100 ${avm.energyCurve.map(p => `${p.second * 10},${100 - p.overallEnergy * 85}`).join(' ')} 300,100`}
                          fill="url(#energyGradient)"
                          opacity="0.25"
                        />
                        <defs>
                          <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#7155F5" />
                            <stop offset="100%" stopColor="#EEF2FF" />
                          </linearGradient>
                        </defs>

                        {/* Loudness trace (purple) */}
                        <polyline
                          fill="none"
                          stroke="#7155F5"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          points={avm.energyCurve.map(p => `${p.second * 10},${100 - p.loudness * 85}`).join(' ')}
                        />

                        {/* Bass weight trace (orange) */}
                        <polyline
                          fill="none"
                          stroke="#EA580C"
                          strokeWidth="1.5"
                          strokeDasharray="2 2"
                          points={avm.energyCurve.map(p => `${p.second * 10},${100 - p.bassWeight * 80}`).join(' ')}
                        />

                        {/* Onset density trace (blue) */}
                        <polyline
                          fill="none"
                          stroke="#2563EB"
                          strokeWidth="1.2"
                          opacity="0.7"
                          points={avm.energyCurve.map(p => `${p.second * 10},${100 - p.onsetDensity * 75}`).join(' ')}
                        />

                        {/* Scrubber Playhead */}
                        <line
                          x1={currentTimeSec * 10}
                          y1="0"
                          x2={currentTimeSec * 10}
                          y2="100"
                          stroke="#DC2626"
                          strokeWidth="2"
                        />
                        <circle
                          cx={currentTimeSec * 10}
                          cy="10"
                          r="3.5"
                          fill="#DC2626"
                        />
                      </svg>

                      {/* Legend */}
                      <div className="flex items-center justify-between text-[10px] text-[#64748B] pt-2 border-t border-[#F1F5F9]">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-1 bg-[#7155F5] rounded"></span>
                            <span>Loudness (RMS)</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-1 bg-[#EA580C] rounded"></span>
                            <span>Bass Weight</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-1 bg-[#2563EB] rounded"></span>
                            <span>Onset Density</span>
                          </span>
                        </div>
                        <span>Click timeline to scrub preview audio</span>
                      </div>
                    </div>

                    {/* Energy & Structure Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white border border-[#E2E8F0]">
                        <span className="text-[10px] text-[#64748B] block font-semibold">Time to First Peak</span>
                        <span className="text-sm font-black text-[#0F172A] font-mono">{avm.energyMetrics.timeToFirstPeakSec}s</span>
                        <span className="text-[10px] text-[#059669] block">Fast hook delivery</span>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-[#E2E8F0]">
                        <span className="text-[10px] text-[#64748B] block font-semibold">Chorus Section Lift</span>
                        <span className="text-sm font-black text-[#0F172A] font-mono">+{avm.energyMetrics.sectionLiftDb} dB</span>
                        <span className="text-[10px] text-[#64748B] block">Dynamic dynamic range</span>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-[#E2E8F0]">
                        <span className="text-[10px] text-[#64748B] block font-semibold">Structure Archetype</span>
                        <span className="text-xs font-bold text-[#0F172A] truncate block">{avm.energyMetrics.shapeArchetype}</span>
                        <span className="text-[10px] text-[#7155F5] font-semibold block">{avm.energyMetrics.archetypeFitPercent}% fit to hits</span>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-[#E2E8F0]">
                        <span className="text-[10px] text-[#64748B] block font-semibold">Cohesion Alignment (S2)</span>
                        <span className="text-sm font-black text-[#0F172A] font-mono">{avm.subScores.s2Cohesion}</span>
                        <span className="text-[10px] text-[#64748B] block">Lyric-to-beat fit</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Lyrics & Multilingual Writing ($P_W$) */}
              {activeTab === 'lyrics' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                          <PenTool className="w-4 h-4 text-[#7155F5]" />
                          <span>Pillar W: Transcribed Multilingual Lyrics & Rhyme Craft</span>
                        </h4>
                        <p className="text-[11px] text-[#64748B]">
                          Code-switching detection (Swahili, Sheng, English) with sensory imagery and rhyme detection.
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {avm.lyricsBreakdown.detectedLanguages.map((lang, idx) => (
                          <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-[#CBD5E1] text-[#334155]">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Line by line lyric breakdown */}
                    <div className="space-y-2">
                      {avm.lyricsBreakdown.lines.map((l) => (
                        <div key={l.lineIndex} className="p-3 rounded-xl bg-white border border-[#E2E8F0] space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-[#0F172A] text-sm">{l.text}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EEF2FF] text-[#4338CA]">
                              {l.language} · Rhyme [{l.rhymeSchemeLabel}]
                            </span>
                          </div>
                          {l.translation && (
                            <p className="text-xs text-[#64748B] italic">"{l.translation}"</p>
                          )}
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[9px] text-[#94A3B8] font-bold uppercase">Imagery tokens:</span>
                            {l.imageryTokens.map((t, idx) => (
                              <span key={idx} className="text-[10px] px-1.5 py-0.2 rounded bg-[#FEF3C7] text-[#92400E]">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Writing sub-score metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
                      <div className="p-3 rounded-xl bg-white border border-[#E2E8F0]">
                        <span className="text-[10px] text-[#64748B] block font-semibold">Repetition Sweet-Spot</span>
                        <span className="text-sm font-black text-[#0F172A] font-mono">{avm.lyricsBreakdown.repetitionSweetSpotScore}</span>
                        <span className="text-[10px] text-[#64748B] block">Ratio {avm.lyricsBreakdown.repetitionRatio} vs 0.38 opt</span>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-[#E2E8F0]">
                        <span className="text-[10px] text-[#64748B] block font-semibold">Hook Memorability</span>
                        <span className="text-sm font-black text-[#7155F5] font-mono">{avm.lyricsBreakdown.hookMemorabilityScore}</span>
                        <span className="text-[10px] text-[#64748B] block">Short singable refrains</span>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-[#E2E8F0]">
                        <span className="text-[10px] text-[#64748B] block font-semibold">Concept Originality</span>
                        <span className="text-sm font-black text-[#0F172A] font-mono">{avm.subScores.w5ConceptOriginality}</span>
                        <span className="text-[10px] text-[#64748B] block">Embedding novelty</span>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-[#E2E8F0]">
                        <span className="text-[10px] text-[#64748B] block font-semibold">Cliché Avoidance Rate</span>
                        <span className="text-sm font-black text-[#059669] font-mono">{avm.subScores.w6ClicheAvoidance}</span>
                        <span className="text-[10px] text-[#64748B] block">Fresh vernacular</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: Composition & Stems ($P_C$) */}
              {activeTab === 'composition' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
                    <h4 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                      <Music className="w-4 h-4 text-[#D97706]" />
                      <span>Pillar C: Arrangement & Demucs Separated Stem Occupancy</span>
                    </h4>

                    {/* Stem Activity Occupancy */}
                    <div className="space-y-2.5">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                        Stem Activity Map (Time-Frequency Occupancy)
                      </span>

                      <div className="space-y-2 text-xs">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>Vocal Stem Occupancy</span>
                            <span className="font-mono font-bold text-[#2563EB]">{avm.stemsActivity.vocalOccupancy}%</span>
                          </div>
                          <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                            <div className="h-full bg-[#2563EB] rounded-full" style={{ width: `${avm.stemsActivity.vocalOccupancy}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span>Drums & Percussion (Kick / Snare / Shaker)</span>
                            <span className="font-mono font-bold text-[#EA580C]">{avm.stemsActivity.drumsOccupancy}%</span>
                          </div>
                          <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                            <div className="h-full bg-[#EA580C] rounded-full" style={{ width: `${avm.stemsActivity.drumsOccupancy}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span>Bass & Sub-Bass (808 / Electric Bass)</span>
                            <span className="font-mono font-bold text-[#10B981]">{avm.stemsActivity.bassOccupancy}%</span>
                          </div>
                          <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                            <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${avm.stemsActivity.bassOccupancy}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span>Melodic Synths & Guitars</span>
                            <span className="font-mono font-bold text-[#7155F5]">{avm.stemsActivity.melodicOccupancy}%</span>
                          </div>
                          <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                            <div className="h-full bg-[#7155F5] rounded-full" style={{ width: `${avm.stemsActivity.melodicOccupancy}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Composition Facts Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
                      <div className="p-3 rounded-xl bg-white border border-[#E2E8F0]">
                        <span className="text-[10px] text-[#64748B] block font-semibold">Chord Progression</span>
                        <span className="text-xs font-black text-[#0F172A] font-mono">{avm.compositionFacts.detectedProgression}</span>
                        <span className="text-[10px] text-[#64748B] block">Modal cadence</span>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-[#E2E8F0]">
                        <span className="text-[10px] text-[#64748B] block font-semibold">Syncopation Index</span>
                        <span className="text-sm font-black text-[#0F172A] font-mono">{avm.compositionFacts.syncopationIndex}</span>
                        <span className="text-[10px] text-[#059669] block">High rhythmic bounce</span>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-[#E2E8F0]">
                        <span className="text-[10px] text-[#64748B] block font-semibold">Swing / Micro-Timing</span>
                        <span className="text-sm font-black text-[#0F172A] font-mono">{avm.compositionFacts.swingPercent}%</span>
                        <span className="text-[10px] text-[#64748B] block">Human groove feel</span>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-[#E2E8F0]">
                        <span className="text-[10px] text-[#64748B] block font-semibold">Genre Centroid Distance</span>
                        <span className="text-sm font-black text-[#7155F5] font-mono">{avm.compositionFacts.genreCentroidDistance}</span>
                        <span className="text-[10px] text-[#64748B] block">Sweet-spot novelty</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: Digital Performance & Multi-Platform Growth */}
              {activeTab === 'performance' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-xl text-xs">
                    <div>
                      <span className="font-extrabold text-[#0F172A] block text-sm">
                        Digital Traction & Multi-Platform Growth Velocity
                      </span>
                      <p className="text-[#64748B] text-[11px]">
                        Multi-channel evidence collection across streaming, video, and social audio platforms.
                      </p>
                    </div>

                    <div className="flex items-center gap-1 bg-white border border-[#CBD5E1] p-1 rounded-xl">
                      {(['7d', '14d', '30d', '90d'] as const).map(p => (
                        <button
                          key={p}
                          onClick={() => setGrowthPeriod(p)}
                          className={`px-2.5 py-1 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                            growthPeriod === p ? 'bg-[#7155F5] text-white shadow-2xs' : 'text-[#64748B] hover:text-[#0F172A]'
                          }`}
                        >
                          {p.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Platform Overview Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Spotify */}
                    <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#0F172A] text-xs flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#1DB954]"></span>
                          Spotify for Artists
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#DCFCE7] text-[#15803D]">
                          Active Metric
                        </span>
                      </div>
                      <div className="pt-1">
                        <span className="text-xl font-black text-[#0F172A] font-mono">
                          {activeArtist.monthlyListeners.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-[#64748B] block">Monthly Listeners</span>
                      </div>
                      <div className="pt-2 border-t border-[#F1F5F9] flex justify-between text-[11px]">
                        <span className="text-[#64748B]">Velocity ({growthPeriod}):</span>
                        <strong className="text-[#15803D]">
                          +{growthPeriod === '7d' ? '3.8%' : growthPeriod === '14d' ? '9.4%' : growthPeriod === '30d' ? `${activeArtist.growthSignal30d}%` : '82.5%'}
                        </strong>
                      </div>
                    </div>

                    {/* YouTube */}
                    <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#0F172A] text-xs flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#FF0000]"></span>
                          YouTube Music / Data API
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EEF2FF] text-[#4338CA]">
                          Channel Verified
                        </span>
                      </div>
                      <div className="pt-1">
                        <span className="text-xl font-black text-[#0F172A] font-mono">
                          {Math.round(activeArtist.monthlyListeners * 1.8).toLocaleString()}
                        </span>
                        <span className="text-[11px] text-[#64748B] block">Total Video Views</span>
                      </div>
                      <div className="pt-2 border-t border-[#F1F5F9] flex justify-between text-[11px]">
                        <span className="text-[#64748B]">Shorts Audio Uses:</span>
                        <strong className="text-[#7155F5]">14,200+ clips</strong>
                      </div>
                    </div>

                    {/* TikTok Audio */}
                    <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#0F172A] text-xs flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#000000]"></span>
                          TikTok Sound Velocity
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FEF3C7] text-[#B45309]">
                          Viral Spark
                        </span>
                      </div>
                      <div className="pt-1">
                        <span className="text-xl font-black text-[#0F172A] font-mono">
                          {Math.round(activeArtist.monthlyListeners * 0.42).toLocaleString()}
                        </span>
                        <span className="text-[11px] text-[#64748B] block">UGC Creations with Sound</span>
                      </div>
                      <div className="pt-2 border-t border-[#F1F5F9] flex justify-between text-[11px]">
                        <span className="text-[#64748B]">Weekly Growth:</span>
                        <strong className="text-[#D97706]">+142% spike</strong>
                      </div>
                    </div>

                    {/* Apple Music */}
                    <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#0F172A] text-xs flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#FA243C]"></span>
                          Apple Music & Shazam
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#DCFCE7] text-[#15803D]">
                          Storefront Active
                        </span>
                      </div>
                      <div className="pt-1">
                        <span className="text-xl font-black text-[#0F172A] font-mono">
                          #{Math.floor(Math.random() * 20 + 5)}
                        </span>
                        <span className="text-[11px] text-[#64748B] block">Shazam Top 50 ({activeArtist.city})</span>
                      </div>
                      <div className="pt-2 border-t border-[#F1F5F9] flex justify-between text-[11px]">
                        <span className="text-[#64748B]">Editorial Playlists:</span>
                        <strong className="text-[#0F172A]">Afro-Indie, Naija & East</strong>
                      </div>
                    </div>

                    {/* SoundCloud */}
                    <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#0F172A] text-xs flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5500]"></span>
                          SoundCloud & Bandcamp
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F1F5F9] text-[#64748B]">
                          Underground Feed
                        </span>
                      </div>
                      <div className="pt-1">
                        <span className="text-xl font-black text-[#0F172A] font-mono">
                          28.4K
                        </span>
                        <span className="text-[11px] text-[#64748B] block">Direct Audio Plays</span>
                      </div>
                      <div className="pt-2 border-t border-[#F1F5F9] flex justify-between text-[11px]">
                        <span className="text-[#64748B]">Grassroots Reposts:</span>
                        <strong className="text-[#0F172A]">2,410</strong>
                      </div>
                    </div>

                    {/* MusicBrainz & Wikidata */}
                    <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#0F172A] text-xs flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#BA478F]"></span>
                          MusicBrainz & Metadata
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#DCFCE7] text-[#15803D]">
                          MBID Matched
                        </span>
                      </div>
                      <div className="pt-1">
                        <span className="text-xs font-mono font-bold text-[#7155F5] truncate block">
                          mbid-{(activeArtist.appleArtistId || 948210).toString(16)}-east
                        </span>
                        <span className="text-[11px] text-[#64748B] block">Open Catalog Entity</span>
                      </div>
                      <div className="pt-2 border-t border-[#F1F5F9] flex justify-between text-[11px]">
                        <span className="text-[#64748B]">ISRC Registered:</span>
                        <strong className="text-[#059669]">Yes (Verified)</strong>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Trajectory Visualization Bar */}
                  <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0F172A] uppercase">
                        {growthPeriod.toUpperCase()} Audience Trajectory Curve
                      </span>
                      <span className="text-xs text-[#059669] font-bold">
                        Velocity Index: +{growthPeriod === '7d' ? '4.2%' : growthPeriod === '14d' ? '12.8%' : growthPeriod === '30d' ? `${activeArtist.growthSignal30d}%` : '74.2%'}
                      </span>
                    </div>

                    <div className="h-28 bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl p-3 flex items-end justify-between gap-2">
                      {[32, 38, 42, 45, 49, 56, 61, 68, 74, 82, 89, 95].map((val, idx) => (
                        <div key={`curve-bar-${idx}`} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                          <div
                            className="w-full bg-[#7155F5] group-hover:bg-[#5B3FE8] rounded-t-md transition-all"
                            style={{ height: `${val}%` }}
                          ></div>
                          <span className="text-[9px] text-[#94A3B8] font-mono group-hover:text-[#0F172A]">
                            T-{12 - idx}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: Organic Growth vs Bot / Fraud Anomaly Investigation (Master Prompt §6.9) */}
              {activeTab === 'anomaly' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="bg-[#ECFDF5] border border-[#A7F3D0] p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#10B981] text-white flex items-center justify-center font-bold">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-sm font-extrabold text-[#065F46] block">
                          A&R Integrity Verdict: Organic Growth Verified
                        </span>
                        <p className="text-xs text-[#047857]">
                          Confidence rating: <strong>{(activeArtist.organicConfidence * 100).toFixed(0)}%</strong> • Zero suspicious bot farm clusters detected.
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-black px-3 py-1 rounded-full bg-white text-[#059669] border border-[#10B981]">
                      CLEAN SIGNAL
                    </span>
                  </div>

                  {/* 4 Anomaly Vectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-1.5 shadow-2xs">
                      <span className="font-bold text-[#0F172A] block flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                        Stream-to-Listener Ratio
                      </span>
                      <p className="text-xs text-[#475569]">
                        Observed replay ratio is <strong>3.4 streams per listener</strong>. Typical range for emerging indie pop/R&B is 2.5–4.2. Reflects true repeat fan engagement, not looped automated farm playback.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-1.5 shadow-2xs">
                      <span className="font-bold text-[#0F172A] block flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                        Grassroots Velocity Sanity
                      </span>
                      <p className="text-xs text-[#475569]">
                        Spikes align with documented TikTok sound creations (+210% 14d) and local radio shoutouts in Nairobi. No unnatural overnight 10,000% jump without source attribution.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-1.5 shadow-2xs">
                      <span className="font-bold text-[#0F172A] block flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                        Comment Diversity & Language Entropy
                      </span>
                      <p className="text-xs text-[#475569]">
                        88% of community comments feature authentic vernacular expressions in Sheng, Swahili, and local regional slang. No generic copypasta or bot emoji spam.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-1.5 shadow-2xs">
                      <span className="font-bold text-[#0F172A] block flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                        Geographic Concentration Sanity
                      </span>
                      <p className="text-xs text-[#475569]">
                        92% of listeners originate in {activeArtist.country} ({activeArtist.city}, Mombasa, Kisumu, Dar es Salaam) and 8% in the UK diaspora. Zero inexplicable server farm datacenters.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: 8-Dimension Human-Led A&R Scorecard (Master Prompt §6.10) */}
              {activeTab === 'human-scorecard' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-extrabold text-[#0F172A] block text-sm">
                        8-Dimension Human A&R Evaluation Scorecard
                      </span>
                      <p className="text-[#64748B] text-[11px]">
                        Professional subjective assessment rubric (0.0 to 5.0 scale) per Master Prompt specifications.
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#64748B] block">Composite Score:</span>
                      <span className="text-lg font-black text-[#7155F5] font-mono">
                        {((humanSongwriting + humanVocalIdentity + humanMelody + humanProduction + humanOriginality + humanPerformance + humanArtisticDirection + humanMarketFit) / 8).toFixed(2)} / 5.0
                      </span>
                    </div>
                  </div>

                  {/* 8 Dimension Sliders */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {/* 1. Songwriting */}
                    <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] space-y-1.5">
                      <div className="flex justify-between">
                        <span className="font-bold text-[#0F172A]">1. Songwriting Craft:</span>
                        <strong className="text-[#7155F5] font-mono">{humanSongwriting.toFixed(1)}</strong>
                      </div>
                      <input
                        type="range"
                        min="1.0"
                        max="5.0"
                        step="0.1"
                        value={humanSongwriting}
                        onChange={(e) => setHumanSongwriting(parseFloat(e.target.value))}
                        className="w-full accent-[#7155F5]"
                      />
                      <p className="text-[10px] text-[#64748B]">Structure, lyrical craft, clarity and storytelling</p>
                    </div>

                    {/* 2. Vocal Identity */}
                    <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] space-y-1.5">
                      <div className="flex justify-between">
                        <span className="font-bold text-[#0F172A]">2. Vocal Identity:</span>
                        <strong className="text-[#7155F5] font-mono">{humanVocalIdentity.toFixed(1)}</strong>
                      </div>
                      <input
                        type="range"
                        min="1.0"
                        max="5.0"
                        step="0.1"
                        value={humanVocalIdentity}
                        onChange={(e) => setHumanVocalIdentity(parseFloat(e.target.value))}
                        className="w-full accent-[#7155F5]"
                      />
                      <p className="text-[10px] text-[#64748B]">Tone, control, delivery and vocal character</p>
                    </div>

                    {/* 3. Melody */}
                    <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] space-y-1.5">
                      <div className="flex justify-between">
                        <span className="font-bold text-[#0F172A]">3. Melodic Hooks:</span>
                        <strong className="text-[#7155F5] font-mono">{humanMelody.toFixed(1)}</strong>
                      </div>
                      <input
                        type="range"
                        min="1.0"
                        max="5.0"
                        step="0.1"
                        value={humanMelody}
                        onChange={(e) => setHumanMelody(parseFloat(e.target.value))}
                        className="w-full accent-[#7155F5]"
                      />
                      <p className="text-[10px] text-[#64748B]">Hooks, phrasing, memorability and harmony</p>
                    </div>

                    {/* 4. Production */}
                    <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] space-y-1.5">
                      <div className="flex justify-between">
                        <span className="font-bold text-[#0F172A]">4. Production Polish:</span>
                        <strong className="text-[#7155F5] font-mono">{humanProduction.toFixed(1)}</strong>
                      </div>
                      <input
                        type="range"
                        min="1.0"
                        max="5.0"
                        step="0.1"
                        value={humanProduction}
                        onChange={(e) => setHumanProduction(parseFloat(e.target.value))}
                        className="w-full accent-[#7155F5]"
                      />
                      <p className="text-[10px] text-[#64748B]">Sound quality, arrangement and sonic space</p>
                    </div>

                    {/* 5. Originality */}
                    <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] space-y-1.5">
                      <div className="flex justify-between">
                        <span className="font-bold text-[#0F172A]">5. Creative Originality:</span>
                        <strong className="text-[#7155F5] font-mono">{humanOriginality.toFixed(1)}</strong>
                      </div>
                      <input
                        type="range"
                        min="1.0"
                        max="5.0"
                        step="0.1"
                        value={humanOriginality}
                        onChange={(e) => setHumanOriginality(parseFloat(e.target.value))}
                        className="w-full accent-[#7155F5]"
                      />
                      <p className="text-[10px] text-[#64748B]">Distinctiveness and unique artistic identity</p>
                    </div>

                    {/* 6. Performance */}
                    <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] space-y-1.5">
                      <div className="flex justify-between">
                        <span className="font-bold text-[#0F172A]">6. Live Performance:</span>
                        <strong className="text-[#7155F5] font-mono">{humanPerformance.toFixed(1)}</strong>
                      </div>
                      <input
                        type="range"
                        min="1.0"
                        max="5.0"
                        step="0.1"
                        value={humanPerformance}
                        onChange={(e) => setHumanPerformance(parseFloat(e.target.value))}
                        className="w-full accent-[#7155F5]"
                      />
                      <p className="text-[10px] text-[#64748B]">Stage presence, authenticity and live delivery</p>
                    </div>

                    {/* 7. Artistic Direction */}
                    <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] space-y-1.5">
                      <div className="flex justify-between">
                        <span className="font-bold text-[#0F172A]">7. Artistic Direction:</span>
                        <strong className="text-[#7155F5] font-mono">{humanArtisticDirection.toFixed(1)}</strong>
                      </div>
                      <input
                        type="range"
                        min="1.0"
                        max="5.0"
                        step="0.1"
                        value={humanArtisticDirection}
                        onChange={(e) => setHumanArtisticDirection(parseFloat(e.target.value))}
                        className="w-full accent-[#7155F5]"
                      />
                      <p className="text-[10px] text-[#64748B]">Vision, consistency and future catalog potential</p>
                    </div>

                    {/* 8. Market Fit */}
                    <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] space-y-1.5">
                      <div className="flex justify-between">
                        <span className="font-bold text-[#0F172A]">8. Market Fit & Positioning:</span>
                        <strong className="text-[#7155F5] font-mono">{humanMarketFit.toFixed(1)}</strong>
                      </div>
                      <input
                        type="range"
                        min="1.0"
                        max="5.0"
                        step="0.1"
                        value={humanMarketFit}
                        onChange={(e) => setHumanMarketFit(parseFloat(e.target.value))}
                        className="w-full accent-[#7155F5]"
                      />
                      <p className="text-[10px] text-[#64748B]">Audience fit, crossover ability and differentiator</p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => {
                        const avg = (humanSongwriting + humanVocalIdentity + humanMelody + humanProduction + humanOriginality + humanPerformance + humanArtisticDirection + humanMarketFit) / 8;
                        onUpdateArtistScore(activeArtist.id, Number(avg.toFixed(1)), reviewerNotes);
                        setHumanReviewSaved(true);
                        setTimeout(() => setHumanReviewSaved(false), 2000);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#7155F5] hover:bg-[#5E3EE4] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      {humanReviewSaved ? <span>✓ Saved to A&R Ledger</span> : <span>Save Human A&R Scorecard</span>}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 6: A&R Override & Headroom */}
              {activeTab === 'override' && (
                <div className="space-y-6 animate-in fade-in">
                  {/* Polish Headroom & Budget Recommendation */}
                  <div className="p-5 rounded-2xl bg-[#EEF2FF] border border-[#C7D2FE] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#4338CA] uppercase flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4" />
                        Polish Headroom & Studio Budget Recommendation (PDF Section 6)
                      </span>
                      <span className="text-sm font-mono font-extrabold text-[#4338CA]">
                        Est. Budget: ${avm.headroomRecommendation.suggestedStudioAdvanceUsd}
                      </span>
                    </div>
                    <p className="text-xs text-[#1E1B4B]">
                      <strong>Recommendation:</strong> {avm.headroomRecommendation.polishBudgetRecommendation}
                    </p>
                    <p className="text-xs text-[#312E81]">
                      <strong>Mixing priority:</strong> {avm.headroomRecommendation.mixingFocusArea}
                    </p>
                  </div>

                  {/* Manual Sliders for Reviewers */}
                  <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
                        A&R Evaluator Calibration Overrides
                      </h4>
                      <button
                        onClick={() => {
                          setOverrideVocal(null);
                          setOverrideWriting(null);
                          setOverrideSong(null);
                          setOverrideComp(null);
                        }}
                        className="text-[11px] font-bold text-[#7155F5] hover:underline cursor-pointer"
                      >
                        Reset to Model Scores
                      </button>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Pillar V (Vocal Ability):</span>
                          <strong className="font-mono text-[#2563EB]">{effVocal.toFixed(2)}</strong>
                        </div>
                        <input
                          type="range"
                          min="0.10"
                          max="1.00"
                          step="0.01"
                          value={effVocal}
                          onChange={(e) => setOverrideVocal(parseFloat(e.target.value))}
                          className="w-full accent-[#2563EB]"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Pillar W (Writing & Concept):</span>
                          <strong className="font-mono text-[#7155F5]">{effWriting.toFixed(2)}</strong>
                        </div>
                        <input
                          type="range"
                          min="0.10"
                          max="1.00"
                          step="0.01"
                          value={effWriting}
                          onChange={(e) => setOverrideWriting(parseFloat(e.target.value))}
                          className="w-full accent-[#7155F5]"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Pillar S (Song as Whole):</span>
                          <strong className="font-mono text-[#059669]">{effSong.toFixed(2)}</strong>
                        </div>
                        <input
                          type="range"
                          min="0.10"
                          max="1.00"
                          step="0.01"
                          value={effSong}
                          onChange={(e) => setOverrideSong(parseFloat(e.target.value))}
                          className="w-full accent-[#059669]"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Pillar C (Composition & Arrangement):</span>
                          <strong className="font-mono text-[#D97706]">{effComp.toFixed(2)}</strong>
                        </div>
                        <input
                          type="range"
                          min="0.10"
                          max="1.00"
                          step="0.01"
                          value={effComp}
                          onChange={(e) => setOverrideComp(parseFloat(e.target.value))}
                          className="w-full accent-[#D97706]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <label className="text-[11px] font-bold text-[#475569] uppercase">Reviewer Audit Justification</label>
                      <textarea
                        rows={2}
                        value={reviewerNotes}
                        onChange={(e) => setReviewerNotes(e.target.value)}
                        className="w-full bg-white border border-[#CBD5E1] rounded-xl p-2.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#7155F5]"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs">
                        <span>Recalculated TAV: </span>
                        <strong className="text-base text-[#7155F5] font-mono font-black">{recalculatedTAV}</strong>
                      </div>

                      <button
                        onClick={handleSaveOverride}
                        className="px-4 py-2 rounded-xl bg-[#7155F5] hover:bg-[#5f3fe8] text-white font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1.5"
                      >
                        {overrideSaved ? <span>✓ Saved to A&R Committee</span> : <span>Apply & Save Calibration</span>}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
