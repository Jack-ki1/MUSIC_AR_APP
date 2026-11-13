import React, { useState, useMemo } from 'react';
import { 
  Columns, 
  Search, 
  Filter, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  UserCheck, 
  Play, 
  Eye, 
  Sparkles,
  ExternalLink,
  PlusCircle,
  FileText,
  DollarSign,
  ChevronRight
} from 'lucide-react';
import { RealArtistData, CandidateLifecycleStage, UserRole, AuthUser } from '../../types';
import { hasPermission } from '../../services/authService';

interface PipelineSectionProps {
  artists: RealArtistData[];
  onSelectArtist: (artist: RealArtistData) => void;
  onUpdateArtistStage: (artistId: string, stage: CandidateLifecycleStage) => void;
  currentUser: AuthUser;
}

const LIFECYCLE_STAGES: { stage: CandidateLifecycleStage; label: string; description: string; color: string; bg: string }[] = [
  { stage: 'DISCOVERED', label: '1. Discovered', description: 'Autonomous signal detected', color: 'text-[#3B6CFF]', bg: 'bg-[#DFE9FF]' },
  { stage: 'RESEARCHING', label: '2. Researching', description: 'Data & DSP identity lookup', color: 'text-[#7C5CFF]', bg: 'bg-[#EDE7FF]' },
  { stage: 'LISTENING', label: '3. Listening', description: 'Audio & stem review', color: 'text-[#0B1530]', bg: 'bg-[#F1F5F9]' },
  { stage: 'UNDER_REVIEW', label: '4. Under Review', description: 'A&R Committee evaluation', color: 'text-[#FF8A3D]', bg: 'bg-[#FFF0E6]' },
  { stage: 'APPROVED', label: '5. Approved', description: 'Pursue signing deal', color: 'text-[#12B76A]', bg: 'bg-[#E6F9F0]' },
  { stage: 'FOLLOW_UP', label: '6. Follow-up', description: 'Active contract discussions', color: 'text-[#008080]', bg: 'bg-[#E0F2F1]' },
];

export const PipelineSection: React.FC<PipelineSectionProps> = ({
  artists,
  onSelectArtist,
  onUpdateArtistStage,
  currentUser
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedTerritory, setSelectedTerritory] = useState<string>('All');
  const [movingArtistId, setMovingArtistId] = useState<string | null>(null);

  const canManagePipeline = hasPermission(currentUser.role, 'RECORD_DECISION');

  // Ensure every artist has an assigned lifecycleStage fallback
  const normalizedArtists = useMemo(() => {
    return artists.map(art => {
      let stage: CandidateLifecycleStage = art.lifecycleStage || 'DISCOVERED';
      if (!art.lifecycleStage) {
        if (art.recommendationTier === 'PURSUE') stage = 'APPROVED';
        else if (art.recommendationTier === 'MEET') stage = 'UNDER_REVIEW';
        else if (art.recommendationTier === 'WATCH') stage = 'LISTENING';
        else stage = 'DISCOVERED';
      }
      return { ...art, lifecycleStage: stage };
    });
  }, [artists]);

  const genres = useMemo(() => {
    const set = new Set<string>();
    artists.forEach(a => a.primaryGenre && set.add(a.primaryGenre));
    return ['All', ...Array.from(set)];
  }, [artists]);

  const territories = useMemo(() => {
    const set = new Set<string>();
    artists.forEach(a => a.country && set.add(a.country));
    return ['All', ...Array.from(set)];
  }, [artists]);

  const filteredArtists = useMemo(() => {
    return normalizedArtists.filter(art => {
      const matchSearch = !searchQuery || 
        art.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.city?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchGenre = selectedGenre === 'All' || art.primaryGenre === selectedGenre;
      const matchTerritory = selectedTerritory === 'All' || art.country === selectedTerritory;
      return matchSearch && matchGenre && matchTerritory;
    });
  }, [normalizedArtists, searchQuery, selectedGenre, selectedTerritory]);

  const handleAdvanceStage = (artist: RealArtistData, currentStage: CandidateLifecycleStage) => {
    const currentIndex = LIFECYCLE_STAGES.findIndex(s => s.stage === currentStage);
    if (currentIndex < LIFECYCLE_STAGES.length - 1) {
      const nextStage = LIFECYCLE_STAGES[currentIndex + 1].stage;
      onUpdateArtistStage(artist.id, nextStage);
    }
  };

  const handleRegressStage = (artist: RealArtistData, currentStage: CandidateLifecycleStage) => {
    const currentIndex = LIFECYCLE_STAGES.findIndex(s => s.stage === currentStage);
    if (currentIndex > 0) {
      const prevStage = LIFECYCLE_STAGES[currentIndex - 1].stage;
      onUpdateArtistStage(artist.id, prevStage);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="glass p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Columns className="w-5 h-5 text-[#3B6CFF]" />
              <h2 className="text-xl font-black text-[#0B1530] tracking-tight">
                A&R Candidate Lifecycle Pipeline
              </h2>
            </div>
            <p className="text-xs text-[#5F6B8A] mt-1">
              Operational candidate workflow tracking talent from autonomous discovery through acoustic audition, committee review, and deal follow-up.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-white border border-[rgba(120,140,190,0.25)] font-bold text-[#0B1530]">
              Total In Pipeline: <strong>{filteredArtists.length}</strong>
            </span>
          </div>
        </div>

        {/* Filters Rail */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[rgba(120,140,190,0.15)]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#5F6B8A] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search artist or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[rgba(120,140,190,0.25)] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#0B1530] placeholder-[#5F6B8A] focus:outline-none focus:border-[#3B6CFF]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#5F6B8A]">Genre:</span>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="flex-1 bg-white border border-[rgba(120,140,190,0.25)] rounded-xl px-2.5 py-1.5 text-xs text-[#0B1530] focus:outline-none focus:border-[#3B6CFF]"
            >
              {genres.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#5F6B8A]">Territory:</span>
            <select
              value={selectedTerritory}
              onChange={(e) => setSelectedTerritory(e.target.value)}
              className="flex-1 bg-white border border-[rgba(120,140,190,0.25)] rounded-xl px-2.5 py-1.5 text-xs text-[#0B1530] focus:outline-none focus:border-[#3B6CFF]"
            >
              {territories.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Board Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
        {LIFECYCLE_STAGES.map((col) => {
          const colArtists = filteredArtists.filter(a => a.lifecycleStage === col.stage);

          return (
            <div 
              key={col.stage}
              className="bg-white/70 border border-[rgba(120,140,190,0.2)] rounded-2xl p-3 space-y-3 min-h-[460px] flex flex-col shadow-xs"
            >
              {/* Column Header */}
              <div className="pb-2 border-b border-[rgba(120,140,190,0.15)] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-black uppercase tracking-wider ${col.color}`}>
                      {col.label}
                    </span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white text-[#0B1530] border border-[rgba(120,140,190,0.2)]">
                      {colArtists.length}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#5F6B8A] mt-0.5">{col.description}</p>
                </div>
              </div>

              {/* Cards Container */}
              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[640px] pr-0.5">
                {colArtists.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-center p-3 text-[11px] text-[#5F6B8A] border-2 border-dashed border-[rgba(120,140,190,0.2)] rounded-xl">
                    <span>No artists in this stage</span>
                  </div>
                ) : (
                  colArtists.map((artist) => {
                    return (
                      <div
                        key={artist.id}
                        className="p-3 bg-white rounded-xl border border-[rgba(120,140,190,0.2)] hover:border-[#3B6CFF] shadow-2xs hover:shadow-xs transition-all space-y-2.5 group"
                      >
                        {/* Header Row */}
                        <div className="flex items-center gap-2.5">
                          <img
                            src={artist.avatarUrl}
                            alt={artist.name}
                            className="w-9 h-9 rounded-full object-cover border border-[rgba(120,140,190,0.2)] shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-black text-[#0B1530] truncate group-hover:text-[#3B6CFF] transition-colors">
                              {artist.name}
                            </h4>
                            <p className="text-[10px] text-[#5F6B8A] truncate">
                              {artist.primaryGenre} • {artist.city || artist.country}
                            </p>
                          </div>
                        </div>

                        {/* Metrics Bar */}
                        <div className="grid grid-cols-2 gap-1.5 py-1.5 px-2 rounded-lg bg-[#F8FAFC] text-[10px]">
                          <div>
                            <span className="text-[#5F6B8A] block">AVM Score</span>
                            <span className="font-black text-[#3B6CFF] font-mono">
                              {artist.avmRollup ? `AAV ${artist.avmRollup.aav}` : `${(artist.artisticScore * 20).toFixed(0)}`}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#5F6B8A] block">Listeners</span>
                            <span className="font-bold text-[#0B1530] font-mono">
                              {artist.monthlyListeners ? artist.monthlyListeners.toLocaleString() : 'Pending'}
                            </span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between pt-1 text-[11px]">
                          <button
                            onClick={() => onSelectArtist(artist)}
                            className="text-[#3B6CFF] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Dossier</span>
                          </button>

                          {canManagePipeline && (
                            <div className="flex items-center gap-1">
                              {col.stage !== 'DISCOVERED' && (
                                <button
                                  onClick={() => handleRegressStage(artist, col.stage)}
                                  className="w-5 h-5 rounded flex items-center justify-center bg-[#F1F5F9] text-[#5F6B8A] hover:text-[#0B1530] text-[10px] font-bold cursor-pointer"
                                  title="Move to previous stage"
                                >
                                  ←
                                </button>
                              )}
                              {col.stage !== 'FOLLOW_UP' && (
                                <button
                                  onClick={() => handleAdvanceStage(artist, col.stage)}
                                  className="w-5 h-5 rounded flex items-center justify-center bg-[#DFE9FF] text-[#3B6CFF] hover:bg-[#3B6CFF] hover:text-white text-[10px] font-bold cursor-pointer transition-colors"
                                  title="Advance to next stage"
                                >
                                  →
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
