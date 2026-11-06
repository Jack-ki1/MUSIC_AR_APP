import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  UserCheck, 
  Calendar, 
  Check, 
  X,
  ExternalLink,
  Music,
  Scale,
  DollarSign,
  FileText,
  Copy,
  Sliders,
  Play,
  Pause,
  AlertCircle,
  Download,
  Kanban,
  Table as TableIcon,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckSquare,
  HelpCircle,
  FolderDown,
  Layers
} from 'lucide-react';
import { RealArtistData, ARDecision, RealSong } from '../../types';

interface RecommendationsSectionProps {
  artists: RealArtistData[];
  onSelectArtist: (artist: RealArtistData) => void;
  onRecordDecision: (artistId: string, decision: string, notes: string) => void;
}

export const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  artists,
  onSelectArtist,
  onRecordDecision,
}) => {
  // Sub-Navigation: 'matrix' | 'pipeline-board' | 'decisions' | 'comparison' | 'next-actions'
  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'pipeline-board' | 'decisions' | 'comparison' | 'next-actions'>('matrix');

  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [targetArtist, setTargetArtist] = useState<RealArtistData | null>(null);
  const [decisionAction, setDecisionAction] = useState('PURSUE: Schedule Introductory Showcase');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [dealType, setDealType] = useState('EP Development & Master Distribution');
  const [reviewerName, setReviewerName] = useState('Jackson Kimotho (Senior A&R Director)');
  const [decisionCommitted, setDecisionCommitted] = useState(false);

  // Comparison State (up to 3 artists)
  const [comparisonIds, setComparisonIds] = useState<string[]>(() => {
    return artists.slice(0, 2).map(a => a.id);
  });
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Export Executive Brief State
  const [showExportModal, setShowExportModal] = useState(false);
  const [copiedBrief, setCopiedBrief] = useState(false);

  // Audio preview playback for recommendations
  const [playingSongId, setPlayingSongId] = useState<number | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Decision History
  const [decisionHistory, setDecisionHistory] = useState<ARDecision[]>(() => {
    try {
      const saved = localStorage.getItem('breakout_radar_decisions');
      if (saved) return JSON.parse(saved);
      // Seed initial high-quality decision ledger
      return [
        {
          id: 'dec-170921001',
          artistId: artists[0]?.id || 'cand-1',
          decision: 'PURSUE: Sign Master Distribution & EP Development',
          decisionMaker: 'Jackson Kimotho (Senior A&R Director)',
          rationale: 'Exceptional vocal range and authentic Sheng code-switching. Rapid TikTok organic audio spark in Nairobi.',
          followUpDate: '2026-11-20',
          dealType: 'EP Development & Master Distribution',
          recommendedAdvanceUsd: 4500,
          createdAt: new Date().toISOString()
        },
        {
          id: 'dec-170921002',
          artistId: artists[1]?.id || 'cand-2',
          decision: 'MEET: Schedule Studio Showcase in Nairobi',
          decisionMaker: 'Jackson Kimotho (Senior A&R Director)',
          rationale: 'High potential, low production tag verified. Acoustic songwriting strength exceeds current mixing polish.',
          followUpDate: '2026-11-25',
          dealType: 'Singles Option Deal',
          recommendedAdvanceUsd: 2500,
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ];
    } catch {
      return [];
    }
  });

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

    if (audioElement) audioElement.pause();

    const audio = new Audio(song.previewUrl);
    audio.play();
    audio.onended = () => setPlayingSongId(null);
    setAudioElement(audio);
    setPlayingSongId(song.id);
  };

  // Sort by combined score descending
  const sortedArtists = [...artists].sort((a, b) => b.combinedScore - a.combinedScore);

  const filteredArtists = sortedArtists.filter(a => {
    if (selectedTier === 'ALL') return true;
    if (selectedTier === 'HIGH_POTENTIAL') {
      return a.avmRollup?.highPotentialCount > 0;
    }
    return a.recommendationTier === selectedTier;
  });

  const pursueCount = artists.filter(a => a.recommendationTier === 'PURSUE').length;
  const meetCount = artists.filter(a => a.recommendationTier === 'MEET').length;
  const watchCount = artists.filter(a => a.recommendationTier === 'WATCH').length;
  const moreEvidenceCount = artists.filter(a => a.recommendationTier === 'MORE_EVIDENCE').length;
  const highPotentialCount = artists.filter(a => a.avmRollup?.highPotentialCount > 0).length;

  const handleOpenDecision = (artist: RealArtistData) => {
    setTargetArtist(artist);
    setDecisionNotes(`Strong musical identity and active catalog verification. High candidate conviction for A&R pursuit.`);
    setShowDecisionModal(true);
  };

  const handleCommitDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetArtist) return;

    const newDecision: ARDecision = {
      id: 'dec-' + Date.now(),
      artistId: targetArtist.id,
      decision: decisionAction,
      decisionMaker: reviewerName,
      rationale: decisionNotes,
      followUpDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      dealType,
      recommendedAdvanceUsd: targetArtist.tracks[0]?.avm?.headroomRecommendation?.suggestedStudioAdvanceUsd || 3000,
      createdAt: new Date().toISOString()
    };

    const nextHistory = [newDecision, ...decisionHistory];
    setDecisionHistory(nextHistory);
    localStorage.setItem('breakout_radar_decisions', JSON.stringify(nextHistory));

    onRecordDecision(targetArtist.id, decisionAction, decisionNotes);
    setDecisionCommitted(true);
    setTimeout(() => {
      setDecisionCommitted(false);
      setShowDecisionModal(false);
    }, 1200);
  };

  const toggleCompareArtist = (artistId: string) => {
    if (comparisonIds.includes(artistId)) {
      setComparisonIds(comparisonIds.filter(id => id !== artistId));
    } else {
      if (comparisonIds.length >= 3) {
        setComparisonIds([...comparisonIds.slice(1), artistId]);
      } else {
        setComparisonIds([...comparisonIds, artistId]);
      }
    }
  };

  const compareArtistsList = artists.filter(a => comparisonIds.includes(a.id));

  // Export CSV
  const handleExportDecisionsCsv = () => {
    const headers = ['Decision ID', 'Artist ID', 'Decision Action', 'Deal Type', 'Advance ($ USD)', 'Decision Maker', 'Follow Up Date', 'Rationale'];
    const rows = decisionHistory.map(d => [
      d.id,
      d.artistId,
      `"${d.decision.replace(/"/g, '""')}"`,
      `"${(d.dealType || 'EP Dev').replace(/"/g, '""')}"`,
      d.recommendedAdvanceUsd || 3000,
      `"${d.decisionMaker.replace(/"/g, '""')}"`,
      d.followUpDate,
      `"${d.rationale.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `breakout_radar_ar_decisions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateBriefText = (artist: RealArtistData) => {
    const track = artist.tracks[0];
    const avm = track?.avm;
    return `BREAKOUT RADAR — A&R EXECUTIVE CANDIDATE DOSSIER
======================================================
Candidate: ${artist.name} (${artist.city}, ${artist.country})
Stage: ${artist.stage} | Primary Genre: ${artist.primaryGenre}
Recommendation Tier: ${artist.recommendationTier}
Combined Score: ${artist.combinedScore.toFixed(1)} / 100
Artist Artistic Value (AAV): ${artist.avmRollup ? artist.avmRollup.aav : 82.0} / 100
Catalog Releases Evaluated: ${artist.tracks.length}

ARTISTIC VALUE MODEL (AVM) ACOUSTIC FINDINGS:
- Voiced Tessitura: ${avm?.vocalProfile.lowestNote} to ${avm?.vocalProfile.highestNote} (${avm?.vocalProfile.usableRangeSemitones} semitones)
- Detected Key: ${avm?.vocalProfile.detectedKey}
- Intrinsic Pitch Confidence: ${avm ? (avm.vocalProfile.intrinsicPitchConfidence * 100).toFixed(0) : '88'}%
- Pitch intonation: ${avm?.notesWithin20CentsPercent}% within ±20 cents threshold
- Production Polish Index: ${avm?.productionIndex}/100 (Bonus: +${avm?.productionBonus} pts)
- Polish Headroom: ${avm?.headroomRecommendation.polishBudgetRecommendation}
- Recommended Studio Advance: $${avm?.headroomRecommendation.suggestedStudioAdvanceUsd}

STREAMING VELOCITY & FOOTPRINT:
- Estimated Monthly Listeners: ${artist.monthlyListeners.toLocaleString()}
- 7-Day Velocity: +${artist.growthSignal7d}% | 30-Day Growth: +${artist.growthSignal30d}%
- Corroborated Organic Confidence: ${artist.organicConfidence}%

NEXT BEST A&R ACTION:
${artist.nextBestAction}
======================================================
Prepared by: ${reviewerName} | Date: ${new Date().toLocaleDateString()}`;
  };

  const handleCopyBrief = (artist: RealArtistData) => {
    const text = generateBriefText(artist);
    navigator.clipboard.writeText(text);
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 2000);
  };

  return (
    <div className="space-y-6 pb-28">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5E9F3] rounded-2xl p-6 shadow-2xs">
        <div>
          <span className="text-[11px] font-extrabold tracking-wider text-[#7155F5] uppercase bg-[#EEF2FF] px-2.5 py-0.5 rounded-full border border-[#6366F1]/20">
            A&R DECISION SUPPORT & PIPELINE
          </span>
          <h1 className="text-2xl font-black text-[#0F172A] tracking-tight mt-1">
            Turn Evidence into A&R Signing Decisions
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5 max-w-2xl leading-relaxed">
            Prioritise emerging artists using explainable acoustic signals, four-pillar AVM profiles, and documented contractual decision history.
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {comparisonIds.length > 0 && (
            <button
              onClick={() => setActiveSubTab('comparison')}
              className="px-3.5 py-2 rounded-xl bg-[#EEF2FF] border border-[#6366F1]/30 text-[#4338CA] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs hover:bg-[#E0E7FF]"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Compare ({comparisonIds.length})</span>
            </button>
          )}

          <button
            onClick={() => {
              if (sortedArtists.length > 0) {
                setTargetArtist(sortedArtists[0]);
                setShowExportModal(true);
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#CBD5E1] text-[#0F172A] hover:bg-[#F8FAFC] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Executive Dossier</span>
          </button>

          <button
            onClick={handleExportDecisionsCsv}
            className="px-3.5 py-2 rounded-xl bg-[#7155F5] hover:bg-[#5E3EE4] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric KPI Filter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <button
          onClick={() => { setSelectedTier('PURSUE'); setActiveSubTab('matrix'); }}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            selectedTier === 'PURSUE'
              ? 'bg-[#ECFDF5] border-[#10B981] shadow-xs'
              : 'bg-white border-[#E2E8F0] hover:border-[#10B981]/50'
          }`}
        >
          <span className="text-[10px] font-black text-[#059669] uppercase tracking-wider block">PURSUE</span>
          <div className="text-xl font-black text-[#0F172A] mt-0.5 font-mono">{pursueCount}</div>
          <p className="text-[9px] text-[#64748B]">High-conviction signings</p>
        </button>

        <button
          onClick={() => { setSelectedTier('MEET'); setActiveSubTab('matrix'); }}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            selectedTier === 'MEET'
              ? 'bg-[#EEF2FF] border-[#6366F1] shadow-xs'
              : 'bg-white border-[#E2E8F0] hover:border-[#6366F1]/50'
          }`}
        >
          <span className="text-[10px] font-black text-[#4338CA] uppercase tracking-wider block">MEET</span>
          <div className="text-xl font-black text-[#0F172A] mt-0.5 font-mono">{meetCount}</div>
          <p className="text-[9px] text-[#64748B]">Showcase / Introduction</p>
        </button>

        <button
          onClick={() => { setSelectedTier('WATCH'); setActiveSubTab('matrix'); }}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            selectedTier === 'WATCH'
              ? 'bg-[#FFFBEB] border-[#F59E0B] shadow-xs'
              : 'bg-white border-[#E2E8F0] hover:border-[#F59E0B]/50'
          }`}
        >
          <span className="text-[10px] font-black text-[#B45309] uppercase tracking-wider block">WATCH</span>
          <div className="text-xl font-black text-[#0F172A] mt-0.5 font-mono">{watchCount}</div>
          <p className="text-[9px] text-[#64748B]">Monitor trajectory</p>
        </button>

        <button
          onClick={() => { setSelectedTier('MORE_EVIDENCE'); setActiveSubTab('matrix'); }}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            selectedTier === 'MORE_EVIDENCE'
              ? 'bg-[#F8FAFC] border-[#64748B] shadow-xs'
              : 'bg-white border-[#E2E8F0] hover:border-[#64748B]/50'
          }`}
        >
          <span className="text-[10px] font-black text-[#475569] uppercase tracking-wider block">EVIDENCE</span>
          <div className="text-xl font-black text-[#0F172A] mt-0.5 font-mono">{moreEvidenceCount}</div>
          <p className="text-[9px] text-[#64748B]">Need stems / audio</p>
        </button>

        <button
          onClick={() => { setSelectedTier('HIGH_POTENTIAL'); setActiveSubTab('matrix'); }}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            selectedTier === 'HIGH_POTENTIAL'
              ? 'bg-[#FEF3C7] border-[#D97706] shadow-xs'
              : 'bg-white border-[#E2E8F0] hover:border-[#D97706]/50'
          }`}
        >
          <span className="text-[10px] font-black text-[#B45309] uppercase tracking-wider block flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#D97706]" />
            HIGH POTENTIAL
          </span>
          <div className="text-xl font-black text-[#D97706] mt-0.5 font-mono">{highPotentialCount}</div>
          <p className="text-[9px] text-[#92400E]">Low Production Gems</p>
        </button>

        <button
          onClick={() => { setSelectedTier('ALL'); setActiveSubTab('matrix'); }}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            selectedTier === 'ALL'
              ? 'bg-[#F1F5F9] border-[#0F172A] shadow-xs'
              : 'bg-white border-[#E2E8F0]'
          }`}
        >
          <span className="text-[10px] font-black text-[#0F172A] uppercase tracking-wider block">ALL ROSTER</span>
          <div className="text-xl font-black text-[#0F172A] mt-0.5 font-mono">{artists.length}</div>
          <p className="text-[9px] text-[#64748B]">View complete pipeline</p>
        </button>
      </div>

      {/* 3. Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2 text-xs">
        <button
          onClick={() => setActiveSubTab('matrix')}
          className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'matrix'
              ? 'bg-[#7155F5] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A] bg-white border border-[#E2E8F0]'
          }`}
        >
          <TableIcon className="w-3.5 h-3.5" />
          <span>Ranked Priority Matrix ({filteredArtists.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('pipeline-board')}
          className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'pipeline-board'
              ? 'bg-[#7155F5] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A] bg-white border border-[#E2E8F0]'
          }`}
        >
          <Kanban className="w-3.5 h-3.5" />
          <span>A&R Kanban Board</span>
        </button>

        <button
          onClick={() => setActiveSubTab('decisions')}
          className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'decisions'
              ? 'bg-[#7155F5] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A] bg-white border border-[#E2E8F0]'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Committee Decision Ledger ({decisionHistory.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('comparison')}
          className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'comparison'
              ? 'bg-[#7155F5] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A] bg-white border border-[#E2E8F0]'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Comparative Benchmark ({comparisonIds.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('next-actions')}
          className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'next-actions'
              ? 'bg-[#7155F5] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A] bg-white border border-[#E2E8F0]'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Next-Best-Action Queue</span>
        </button>
      </div>

      {/* 4. TAB 1: RANKED PRIORITY MATRIX */}
      {activeSubTab === 'matrix' && (
        <div className="bg-white border border-[#E5E9F3] rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3 w-8">#</th>
                  <th className="py-3 px-3">Artist Candidate</th>
                  <th className="py-3 px-3">Territory</th>
                  <th className="py-3 px-3">AAV (60%)</th>
                  <th className="py-3 px-3">Discovery (40%)</th>
                  <th className="py-3 px-3">Combined Score</th>
                  <th className="py-3 px-3">Tier & AVM Flags</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredArtists.map((artist, idx) => {
                  const primarySong = artist.tracks[0];
                  const isPlaying = playingSongId === primarySong?.id;
                  const isCompared = comparisonIds.includes(artist.id);

                  return (
                    <tr key={`rec-art-${artist.id}-${idx}`} className="hover:bg-[#F8FAFC] transition-colors">
                      {/* Compare checkbox & Rank */}
                      <td className="py-3.5 px-3">
                        <input
                          type="checkbox"
                          checked={isCompared}
                          onChange={() => toggleCompareArtist(artist.id)}
                          className="rounded accent-[#7155F5] cursor-pointer"
                          title="Select to compare up to 3 candidates"
                        />
                      </td>

                      {/* Artist Details */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-sm text-[#94A3B8] w-5">
                            #{idx + 1}
                          </span>

                          {primarySong && (
                            <button
                              onClick={() => handlePlaySong(primarySong)}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                                isPlaying ? 'bg-[#7155F5] text-white' : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]'
                              }`}
                              title={isPlaying ? 'Pause' : 'Play 30s preview'}
                            >
                              {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
                            </button>
                          )}

                          <img
                            src={artist.avatarUrl}
                            alt={artist.name}
                            className="w-10 h-10 rounded-xl object-cover border border-[#E2E8F0]"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[#0F172A] text-sm">{artist.name}</span>
                              {artist.verified && <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB] fill-current" />}
                            </div>
                            <span className="text-[10px] text-[#64748B] block">
                              {artist.stage} • {artist.primaryGenre}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-3">
                        <span className="font-medium text-[#0F172A]">{artist.city}, {artist.country}</span>
                        <span className="text-[10px] text-[#64748B] block">
                          {(artist.monthlyListeners / 1000).toFixed(0)}k listeners
                        </span>
                      </td>

                      {/* AAV */}
                      <td className="py-3.5 px-3 font-mono font-bold text-[#7155F5]">
                        {artist.avmRollup ? artist.avmRollup.aav : (artist.artisticScore * 20).toFixed(1)}
                      </td>

                      {/* Discovery */}
                      <td className="py-3.5 px-3 font-mono font-bold text-[#0F172A]">
                        {artist.discoveryScore.toFixed(1)}
                      </td>

                      {/* Combined Score */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-base text-[#0F172A]">
                            {artist.combinedScore.toFixed(1)}
                          </span>
                          <span className="text-[10px] font-bold text-[#059669]">
                            +{artist.growthSignal30d}%
                          </span>
                        </div>
                      </td>

                      {/* Tier & High Potential */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-1">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider inline-block ${
                            artist.recommendationTier === 'PURSUE'
                              ? 'bg-[#ECFDF5] text-[#059669] border border-[#10B981]/30'
                              : artist.recommendationTier === 'MEET'
                              ? 'bg-[#EEF2FF] text-[#4338CA] border border-[#6366F1]/30'
                              : 'bg-[#FFFBEB] text-[#B45309] border border-[#F59E0B]/30'
                          }`}>
                            {artist.recommendationTier}
                          </span>

                          {artist.avmRollup?.highPotentialCount > 0 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#FEF3C7] text-[#92400E] block w-fit">
                              High Potential (Low Prod)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectArtist(artist)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#F1F5F9] hover:bg-[#EEF2FF] text-[#475569] hover:text-[#4338CA] font-bold transition-all cursor-pointer"
                            title="Inspect in Analyse section"
                          >
                            Analyse
                          </button>

                          <button
                            onClick={() => handleOpenDecision(artist)}
                            className="px-3 py-1.5 rounded-lg bg-[#7155F5] hover:bg-[#5E3EE4] text-white font-bold transition-all cursor-pointer shadow-2xs"
                          >
                            Sign Decision
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TAB 2: A&R KANBAN BOARD */}
      {activeSubTab === 'pipeline-board' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(['PURSUE', 'MEET', 'WATCH', 'MORE_EVIDENCE'] as const).map((tier) => {
            const tierArtists = sortedArtists.filter(a => a.recommendationTier === tier);
            return (
              <div key={tier} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                  <span className={`text-xs font-black uppercase tracking-wider ${
                    tier === 'PURSUE' ? 'text-[#059669]' : tier === 'MEET' ? 'text-[#4338CA]' : tier === 'WATCH' ? 'text-[#B45309]' : 'text-[#64748B]'
                  }`}>
                    {tier} ({tierArtists.length})
                  </span>
                  <span className="text-[10px] text-[#94A3B8] font-bold">A&R Stage</span>
                </div>

                <div className="space-y-2.5">
                  {tierArtists.map((art) => (
                    <div key={`kanban-${art.id}`} className="p-3 bg-white border border-[#E2E8F0] rounded-xl shadow-2xs space-y-2">
                      <div className="flex items-center gap-2.5">
                        <img src={art.avatarUrl} alt={art.name} className="w-9 h-9 rounded-lg object-cover border" />
                        <div className="truncate">
                          <strong className="text-xs text-[#0F172A] truncate block">{art.name}</strong>
                          <span className="text-[10px] text-[#64748B]">{art.city}, {art.country}</span>
                        </div>
                      </div>

                      <div className="flex justify-between text-[11px] pt-1 border-t border-[#F1F5F9]">
                        <span className="text-[#64748B]">Combined Score:</span>
                        <strong className="text-[#7155F5] font-mono">{art.combinedScore.toFixed(1)}</strong>
                      </div>

                      <div className="flex gap-1.5 pt-1">
                        <button
                          onClick={() => onSelectArtist(art)}
                          className="flex-1 py-1 rounded-lg bg-[#F1F5F9] hover:bg-[#EEF2FF] text-[10px] font-bold text-[#475569] text-center cursor-pointer"
                        >
                          Analyse
                        </button>
                        <button
                          onClick={() => handleOpenDecision(art)}
                          className="flex-1 py-1 rounded-lg bg-[#7155F5] hover:bg-[#5E3EE4] text-[10px] font-bold text-white text-center cursor-pointer"
                        >
                          Sign Deal
                        </button>
                      </div>
                    </div>
                  ))}

                  {tierArtists.length === 0 && (
                    <div className="p-6 text-center text-xs text-[#94A3B8] italic">
                      No artists currently in {tier} stage.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. TAB 3: OFFICIAL COMMITTEE DECISION LEDGER */}
      {activeSubTab === 'decisions' && (
        <div className="bg-white border border-[#E5E9F3] rounded-2xl overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#059669]" />
                <span>A&R Committee Official Decision Ledger ({decisionHistory.length})</span>
              </h3>
              <p className="text-xs text-[#64748B]">Permanent auditable records of all contractual commitments, deals, and advance offers.</p>
            </div>

            <button
              onClick={handleExportDecisionsCsv}
              className="px-3.5 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-[#0F172A] hover:bg-[#EEF2FF] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#7155F5]" />
              <span>Download Ledger CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Record ID</th>
                  <th className="py-3 px-3">Artist Candidate</th>
                  <th className="py-3 px-3">Action Signed</th>
                  <th className="py-3 px-3">Deal Structure</th>
                  <th className="py-3 px-3">Advance Offer ($ USD)</th>
                  <th className="py-3 px-3">Signee</th>
                  <th className="py-3 px-3">Follow-Up</th>
                  <th className="py-3 px-4">Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {decisionHistory.map((dec, decIdx) => {
                  const art = artists.find(a => a.id === dec.artistId);
                  return (
                    <tr key={`ledger-${dec.id}-${decIdx}`} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 px-4 font-mono text-[#64748B]">{dec.id}</td>
                      <td className="py-3 px-3 font-bold text-[#0F172A]">{art?.name || 'Artist Candidate'}</td>
                      <td className="py-3 px-3 font-semibold text-[#059669]">{dec.decision}</td>
                      <td className="py-3 px-3 text-[#4338CA] font-medium">{dec.dealType || 'EP Dev'}</td>
                      <td className="py-3 px-3 font-mono font-bold text-[#0F172A]">${dec.recommendedAdvanceUsd || 3000}</td>
                      <td className="py-3 px-3 text-[#64748B]">{dec.decisionMaker}</td>
                      <td className="py-3 px-3 text-[#64748B] font-mono">{dec.followUpDate}</td>
                      <td className="py-3 px-4 text-[#475569] max-w-xs truncate" title={dec.rationale}>"{dec.rationale}"</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. TAB 4: SIDE-BY-SIDE MATRIX COMPARISON */}
      {activeSubTab === 'comparison' && (
        <div className="bg-white border border-[#E5E9F3] rounded-2xl p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
            <div>
              <h3 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#7155F5]" />
                <span>Side-by-Side Multi-Candidate Benchmark ({compareArtistsList.length} of 3 selected)</span>
              </h3>
              <p className="text-xs text-[#64748B]">
                Direct comparative benchmarking of AVM vocal features, songwriting metrics, and streaming momentum.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {compareArtistsList.map((art, cIdx) => {
              const trk = art.tracks[0];
              const av = trk?.avm;
              return (
                <div key={`comp-tab-${art.id}-${cIdx}`} className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <img src={art.avatarUrl} alt={art.name} className="w-12 h-12 rounded-xl object-cover border" />
                      <div>
                        <h4 className="text-sm font-extrabold text-[#0F172A]">{art.name}</h4>
                        <span className="text-[10px] text-[#64748B]">{art.city}, {art.country} • {art.primaryGenre}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                        <span className="text-[#64748B]">Combined A&R Score:</span>
                        <strong className="text-[#7155F5] font-mono text-sm">{art.combinedScore.toFixed(1)}</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                        <span className="text-[#64748B]">Artist AAV (Catalog):</span>
                        <strong className="text-[#0F172A] font-mono">{art.avmRollup ? art.avmRollup.aav : 82.0}</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                        <span className="text-[#64748B]">Vocal Ability ($P_V$):</span>
                        <strong className="text-[#2563EB] font-mono">{av?.pillarVocal || 0.75}</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                        <span className="text-[#64748B]">Writing Craft ($P_W$):</span>
                        <strong className="text-[#7155F5] font-mono">{av?.pillarWriting || 0.70}</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                        <span className="text-[#64748B]">Tessitura / Range:</span>
                        <strong className="text-[#0F172A] font-mono">{av?.vocalProfile.lowestNote}–{av?.vocalProfile.highestNote} ({av?.vocalProfile.usableRangeSemitones}st)</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                        <span className="text-[#64748B]">Production Index:</span>
                        <strong className="text-[#059669] font-mono">{av?.productionIndex}/100</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                        <span className="text-[#64748B]">30-Day Velocity:</span>
                        <strong className="text-[#059669] font-mono">+{art.growthSignal30d}%</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                        <span className="text-[#64748B]">Recommendation Tier:</span>
                        <span className="font-bold text-[#059669] uppercase">{art.recommendationTier}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => handleOpenDecision(art)}
                      className="w-full py-2 rounded-xl bg-[#7155F5] text-white font-bold text-xs cursor-pointer hover:bg-[#5E3EE4]"
                    >
                      Sign Deal for {art.name}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 8. TAB 5: NEXT-BEST-ACTION INTELLIGENCE QUEUE */}
      {activeSubTab === 'next-actions' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E5E9F3] rounded-2xl p-6 shadow-2xs space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-[#7155F5]" />
                <span>Next-Best-Action A&R Intelligence Engine</span>
              </h3>
              <p className="text-xs text-[#64748B]">
                Automated context-driven recommendations based on missing evidence, detected spikes, or release trajectories.
              </p>
            </div>

            <div className="space-y-3">
              {sortedArtists.map((art, idx) => (
                <div key={`nba-${art.id}`} className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img src={art.avatarUrl} alt={art.name} className="w-10 h-10 rounded-xl object-cover border" />
                    <div>
                      <strong className="text-[#0F172A] text-sm block">{art.name} ({art.city}, {art.country})</strong>
                      <span className="text-xs text-[#7155F5] font-semibold">{art.nextBestAction}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onSelectArtist(art)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-[#0F172A] font-bold hover:bg-[#F1F5F9] cursor-pointer"
                    >
                      View Stems
                    </button>
                    <button
                      onClick={() => handleOpenDecision(art)}
                      className="px-3 py-1.5 rounded-lg bg-[#7155F5] text-white font-bold hover:bg-[#5E3EE4] cursor-pointer"
                    >
                      Execute Action
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Decision Signing Modal */}
      {showDecisionModal && targetArtist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#059669]" />
                  <span>A&R Committee Deal Commitment</span>
                </h3>
                <p className="text-xs text-[#64748B]">Execute auditable contract recommendation for <strong>{targetArtist.name}</strong></p>
              </div>
              <button onClick={() => setShowDecisionModal(false)} className="text-[#64748B] hover:text-[#0F172A]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCommitDecision} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold text-[#64748B] uppercase block mb-1">Official Decision Action</label>
                <select
                  value={decisionAction}
                  onChange={(e) => setDecisionAction(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl p-2.5 text-xs text-[#0F172A] focus:outline-none"
                >
                  <option value="PURSUE: Sign Master Distribution & EP Development">PURSUE: Sign Master Distribution & EP Development</option>
                  <option value="MEET: Schedule Studio Showcase in Nairobi">MEET: Schedule Studio Showcase in Nairobi</option>
                  <option value="WATCH: Add to 60-Day Priority Watchlist">WATCH: Add to 60-Day Priority Watchlist</option>
                  <option value="EVIDENCE: Request Multi-Track Stems & Live Footage">EVIDENCE: Request Multi-Track Stems & Live Footage</option>
                  <option value="HOLD: Defer Committee Evaluation">HOLD: Defer Committee Evaluation</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#64748B] uppercase block mb-1">Proposed Deal Framework</label>
                <select
                  value={dealType}
                  onChange={(e) => setDealType(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl p-2.5 text-xs text-[#0F172A] focus:outline-none"
                >
                  <option value="EP Development & Master Distribution">EP Development & Master Distribution</option>
                  <option value="Singles Option Deal (3 Singles)">Singles Option Deal (3 Singles)</option>
                  <option value="Global 360 Partnership Deal">Global 360 Partnership Deal</option>
                  <option value="Direct Publishing & Sync Admin">Direct Publishing & Sync Admin</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#64748B] uppercase block mb-1">Committee Rationale & Observations</label>
                <textarea
                  rows={3}
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl p-2.5 text-xs text-[#0F172A] focus:outline-none"
                  placeholder="Enter specific contractual reasons, acoustic metrics, or marketing strategy..."
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-[#64748B]">Audited by {reviewerName}</span>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  {decisionCommitted ? '✓ Recorded to Ledger' : 'Commit Committee Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dossier Export Modal */}
      {showExportModal && targetArtist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#2563EB]" />
                  <span>A&R Executive Candidate Dossier</span>
                </h3>
                <p className="text-xs text-[#64748B]">Printable briefing for Senior Label Directors & Executive Committee</p>
              </div>
              <button onClick={() => setShowExportModal(false)} className="text-[#64748B] hover:text-[#0F172A]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-mono text-[#0F172A] overflow-x-auto whitespace-pre-wrap max-h-96">
              {generateBriefText(targetArtist)}
            </pre>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#64748B]">Ready for committee circulation</span>
              <button
                onClick={() => handleCopyBrief(targetArtist)}
                className="px-4 py-2 rounded-xl bg-[#7155F5] hover:bg-[#5E3EE4] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedBrief ? '✓ Copied to Clipboard' : 'Copy Executive Brief'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
