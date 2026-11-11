import React, { useState, useEffect } from 'react';
import { 
  Sparkles,
  CheckCircle2,
  UserCheck,
  Scale,
  FileText,
  Copy,
  Play,
  Pause,
  Download,
  Kanban,
  Table as TableIcon,
  CheckSquare
} from 'lucide-react';
import { RealArtistData, ARDecision, RealSong } from '../../types';
import { fetchDecisionsFromBackend } from '../../services/backendApi';
import { Button } from '../../shared/ui/Button';
import { Card } from '../../shared/ui/Card';
import { Modal } from '../../shared/ui/Modal';
import { Pill, PillTone } from '../../shared/ui/Pill';
import { SectionHeader } from '../../shared/ui/SectionHeader';
import { Tabs } from '../../shared/ui/Tabs';
import { Field, Input, Select, Textarea } from '../../shared/ui/Field';

interface RecommendationsSectionProps {
  artists: RealArtistData[];
  onSelectArtist: (artist: RealArtistData) => void;
  onRecordDecision: (artistId: string, decision: string, notes: string) => void;
}

type SubTab = 'matrix' | 'pipeline-board' | 'decisions' | 'comparison' | 'next-actions';

/** Recommendation tier → shared pill tone. */
const tierTone = (tier?: string): PillTone => {
  switch (tier) {
    case 'PURSUE': return 'sign';
    case 'MEET': return 'meet';
    case 'WATCH': return 'watch';
    case 'MORE_EVIDENCE': return 'evidence';
    case 'HOLD': return 'hold';
    default: return 'neutral';
  }
};

export const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  artists,
  onSelectArtist,
  onRecordDecision,
}) => {
  // Sub-Navigation: 'matrix' | 'pipeline-board' | 'decisions' | 'comparison' | 'next-actions'
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('matrix');

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

  useEffect(() => {
    let mounted = true;
    fetchDecisionsFromBackend().then((remote) => {
      if (!mounted || !Array.isArray(remote) || remote.length === 0) return;
      setDecisionHistory(prev => {
        const map = new Map<string, ARDecision>();
        [...remote, ...prev].forEach(d => { if (d?.id) map.set(d.id, d); });
        const merged = Array.from(map.values()).sort((a,b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        localStorage.setItem('breakout_radar_decisions', JSON.stringify(merged));
        return merged;
      });
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

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
- Polish Headroom: ${avm?.headroomRecommendation?.polishBudgetRecommendation ?? 'N/A'}
- Recommended Studio Advance: $${avm?.headroomRecommendation?.suggestedStudioAdvanceUsd ?? 'N/A'}

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
    <div className="space-y-5 pb-12 section-enter">
      {/* 1. Header Banner */}
      <Card>
        <SectionHeader
          eyebrow={
            <span className="bg-purple-50 px-3 py-1 rounded-tile">
              A&R Decision Support &amp; Pipeline
            </span>
          }
          title="Turn Evidence into A&R Signing Decisions"
          description="Prioritise emerging artists using explainable acoustic signals, four-pillar AVM profiles, and documented contractual decision history."
          actions={
            <>
              {comparisonIds.length > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Scale className="w-3.5 h-3.5 text-info-600" />}
                  onClick={() => setActiveSubTab('comparison')}
                >
                  Compare ({comparisonIds.length})
                </Button>
              )}

              <Button
                variant="secondary"
                size="sm"
                leftIcon={<FileText className="w-3.5 h-3.5 text-info-600" />}
                onClick={() => {
                  if (sortedArtists.length > 0) {
                    setTargetArtist(sortedArtists[0]);
                    setShowExportModal(true);
                  }
                }}
              >
                Executive Dossier
              </Button>

              <Button
                size="sm"
                leftIcon={<Download className="w-3.5 h-3.5" />}
                onClick={handleExportDecisionsCsv}
              >
                Export CSV
              </Button>
            </>
          }
        />
      </Card>

      {/* 2. Top Metric KPI Pipeline Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        {([
          { tier: 'PURSUE', label: 'PURSUE', count: pursueCount, desc: 'High-conviction signings', bar: 'bg-brand-500', text: 'text-brand-600' },
          { tier: 'MEET', label: 'MEET', count: meetCount, desc: 'Showcase / Introduction', bar: 'bg-purple-500', text: 'text-purple-700' },
          { tier: 'WATCH', label: 'WATCH', count: watchCount, desc: 'Monitor trajectory', bar: 'bg-info-600', text: 'text-info-600' },
          { tier: 'MORE_EVIDENCE', label: 'EVIDENCE', count: moreEvidenceCount, desc: 'Need stems / audio', bar: 'bg-navy-500', text: 'text-purple-700' },
          { tier: 'HIGH_POTENTIAL', label: 'HIGH POTENTIAL', count: highPotentialCount, desc: 'Low Production Gems', bar: 'bg-brand-400', text: 'text-warning-700', sparkles: true },
          { tier: 'ALL', label: 'ALL ROSTER', count: artists.length, desc: 'View complete pipeline', bar: 'bg-purple-500', text: 'text-navy-700' }
        ]).map((t) => {
          const isActive = selectedTier === t.tier;
          return (
            <button
              key={t.tier}
              onClick={() => { setSelectedTier(t.tier); setActiveSubTab('matrix'); }}
              className={[
                'p-4 rounded-card border text-left transition-all cursor-pointer relative overflow-hidden',
                'hover:border-line-strong',
                isActive
                  ? 'bg-surface border-brand-500 shadow-raised ring-2 ring-brand-500/30'
                  : 'bg-surface border-line'
              ].join(' ')}
            >
              <span className={`w-1 h-6 ${t.bar} rounded-r absolute left-0 top-4`} />
              <span className={`text-2xs font-semibold ${t.text} uppercase tracking-wider block flex items-center gap-1`}>
                {t.sparkles && <Sparkles className="w-3 h-3 text-warning-600" />}
                {t.label}
              </span>
              <div className="text-xl font-semibold tabular-nums text-navy-700 mt-0.5 font-mono">{t.count}</div>
              <p className="text-2xs text-purple-700">{t.desc}</p>
            </button>
          );
        })}
      </div>

      {/* 3. Sub-Navigation */}
      <Tabs<SubTab>
        ariaLabel="Recommendation views"
        active={activeSubTab}
        onChange={setActiveSubTab}
        className="border-b border-line pb-3"
        items={[
          { id: 'matrix', label: `Ranked Priority Matrix (${filteredArtists.length})`, icon: <TableIcon className="w-3.5 h-3.5" /> },
          { id: 'pipeline-board', label: 'A&R Kanban Board', icon: <Kanban className="w-3.5 h-3.5" /> },
          { id: 'decisions', label: `Committee Decision Ledger (${decisionHistory.length})`, icon: <UserCheck className="w-3.5 h-3.5" /> },
          { id: 'comparison', label: `Comparative Benchmark (${comparisonIds.length})`, icon: <Scale className="w-3.5 h-3.5" /> },
          { id: 'next-actions', label: 'Next-Best-Action Queue', icon: <CheckSquare className="w-3.5 h-3.5" /> }
        ]}
      />

      {/* 4. TAB 1: RANKED PRIORITY MATRIX */}
      {activeSubTab === 'matrix' && (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface border-b border-line text-purple-700 font-bold uppercase tracking-wider text-2xs">
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
              <tbody className="divide-y divide-line">
                {filteredArtists.map((artist, idx) => {
                  const primarySong = artist.tracks[0];
                  const isPlaying = playingSongId === primarySong?.id;
                  const isCompared = comparisonIds.includes(artist.id);

                  return (
                    <tr key={`rec-art-${artist.id}-${idx}`} className="hover:bg-surface-subtle transition-colors">
                      {/* Compare checkbox & Rank */}
                      <td className="py-3.5 px-3">
                        <input
                          type="checkbox"
                          checked={isCompared}
                          onChange={() => toggleCompareArtist(artist.id)}
                          className="rounded accent-info-600 cursor-pointer"
                          title="Select to compare up to 3 candidates"
                        />
                      </td>

                      {/* Artist Details */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-sm text-purple-700 w-5">
                            #{idx + 1}
                          </span>

                          {primarySong && (
                            <button
                              onClick={() => handlePlaySong(primarySong)}
                              className={`w-7 h-7 rounded flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                                isPlaying ? 'bg-info-600 text-navy-900' : 'bg-surface text-purple-700 hover:text-navy-700 border border-line-strong'
                              }`}
                              title={isPlaying ? 'Pause' : 'Play 30s preview'}
                            >
                              {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
                            </button>
                          )}

                          <img
                            src={artist.avatarUrl}
                            alt={artist.name}
                            className="w-10 h-10 rounded object-cover border border-line-strong "
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-navy-700 text-sm">{artist.name}</span>
                              {artist.verified && <CheckCircle2 className="w-3.5 h-3.5 text-info-600 fill-current" />}
                            </div>
                            <span className="text-2xs text-purple-700 block font-medium">
                              {artist.stage} • {artist.primaryGenre}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-navy-700">{artist.city}, {artist.country}</span>
                        <span className="text-2xs text-purple-700 block">
                          {(artist.monthlyListeners / 1000).toFixed(0)}k listeners
                        </span>
                      </td>

                      {/* AAV */}
                      <td className="py-3.5 px-3 font-mono font-semibold text-brand-600">
                        {artist.avmRollup ? artist.avmRollup.aav : (artist.artisticScore * 20).toFixed(1)}
                      </td>

                      {/* Discovery */}
                      <td className="py-3.5 px-3 font-mono font-bold text-navy-700">
                        {artist.discoveryScore.toFixed(1)}
                      </td>

                      {/* Combined Score */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-base text-navy-700">
                            {artist.combinedScore.toFixed(1)}
                          </span>
                          <span className="text-2xs font-semibold text-success-600">
                            +{artist.growthSignal30d}%
                          </span>
                        </div>
                      </td>

                      {/* Tier & High Potential */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-1">
                          <Pill tone={tierTone(artist.recommendationTier)} className="uppercase tracking-wider">
                            {artist.recommendationTier}
                          </Pill>

                          {artist.avmRollup?.highPotentialCount > 0 && (
                            <Pill tone="warning" className="block w-fit">
                              High Potential (Low Prod)
                            </Pill>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onSelectArtist(artist)}
                            title="Inspect in Analyse section"
                          >
                            Analyse
                          </Button>

                          <Button size="sm" onClick={() => handleOpenDecision(artist)}>
                            Sign Decision
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 5. TAB 2: A&R KANBAN BOARD */}
      {activeSubTab === 'pipeline-board' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(['PURSUE', 'MEET', 'WATCH', 'MORE_EVIDENCE'] as const).map((tier) => {
            const tierArtists = sortedArtists.filter(a => a.recommendationTier === tier);
            return (
              <Card key={tier} variant="subtle" padding="sm" className="space-y-3">
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${
                    tier === 'PURSUE' ? 'text-success-600' : tier === 'MEET' ? 'text-brand-700' : tier === 'WATCH' ? 'text-warning-700' : 'text-purple-500'
                  }`}>
                    {tier} ({tierArtists.length})
                  </span>
                  <span className="text-2xs text-purple-300 font-bold">A&R Stage</span>
                </div>

                <div className="space-y-2.5">
                  {tierArtists.map((art) => (
                    <Card key={`kanban-${art.id}`} padding="sm" className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <img src={art.avatarUrl} alt={art.name} className="w-9 h-9 rounded-sm object-cover border border-line" />
                        <div className="truncate">
                          <strong className="text-xs text-navy-700 truncate block">{art.name}</strong>
                          <span className="text-2xs text-purple-500">{art.city}, {art.country}</span>
                        </div>
                      </div>

                      <div className="flex justify-between text-2xs pt-1 border-t border-line">
                        <span className="text-purple-500">Combined Score:</span>
                        <strong className="text-brand-600 font-mono">{art.combinedScore.toFixed(1)}</strong>
                      </div>

                      <div className="flex gap-1.5 pt-1">
                        <Button variant="secondary" size="xs" className="flex-1" onClick={() => onSelectArtist(art)}>
                          Analyse
                        </Button>
                        <Button size="xs" className="flex-1" onClick={() => handleOpenDecision(art)}>
                          Sign Deal
                        </Button>
                      </div>
                    </Card>
                  ))}

                  {tierArtists.length === 0 && (
                    <div className="p-6 text-center text-xs text-purple-300 italic">
                      No artists currently in {tier} stage.
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 6. TAB 3: OFFICIAL COMMITTEE DECISION LEDGER */}
      {activeSubTab === 'decisions' && (
        <Card padding="none" className="overflow-hidden">
          <div className="p-4 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-navy-700 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-success-600" />
                <span>A&R Committee Official Decision Ledger ({decisionHistory.length})</span>
              </h3>
              <p className="text-xs text-purple-500">Permanent auditable records of all contractual commitments, deals, and advance offers.</p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportDecisionsCsv}
              leftIcon={<Download className="w-3.5 h-3.5 text-brand-600" />}
            >
              Download Ledger CSV
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle border-b border-line text-purple-500 font-bold uppercase text-2xs">
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
              <tbody className="divide-y divide-line">
                {decisionHistory.map((dec, decIdx) => {
                  const art = artists.find(a => a.id === dec.artistId);
                  return (
                    <tr key={`ledger-${dec.id}-${decIdx}`} className="hover:bg-surface-subtle">
                      <td className="py-3 px-4 font-mono text-purple-500">{dec.id}</td>
                      <td className="py-3 px-3 font-bold text-navy-700">{art?.name || 'Artist Candidate'}</td>
                      <td className="py-3 px-3 font-semibold text-success-600">{dec.decision}</td>
                      <td className="py-3 px-3 text-brand-700 font-medium">{dec.dealType || 'EP Dev'}</td>
                      <td className="py-3 px-3 font-mono font-bold text-navy-700">${dec.recommendedAdvanceUsd || 3000}</td>
                      <td className="py-3 px-3 text-purple-500">{dec.decisionMaker}</td>
                      <td className="py-3 px-3 text-purple-500 font-mono">{dec.followUpDate}</td>
                      <td className="py-3 px-4 text-purple-700 max-w-xs truncate" title={dec.rationale}>"{dec.rationale}"</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 7. TAB 4: SIDE-BY-SIDE MATRIX COMPARISON */}
      {activeSubTab === 'comparison' && (
        <Card padding="md" className="space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h3 className="text-base font-semibold text-navy-700 flex items-center gap-2">
                <Scale className="w-5 h-5 text-brand-600" />
                <span>Side-by-Side Multi-Candidate Benchmark ({compareArtistsList.length} of 3 selected)</span>
              </h3>
              <p className="text-xs text-purple-500">
                Direct comparative benchmarking of AVM vocal features, songwriting metrics, and streaming momentum.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {compareArtistsList.map((art, cIdx) => {
              const trk = art.tracks[0];
              const av = trk?.avm;
              return (
                <div key={`comp-tab-${art.id}-${cIdx}`} className="p-4 rounded bg-surface-subtle border border-line space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <img src={art.avatarUrl} alt={art.name} className="w-12 h-12 rounded object-cover border" />
                      <div>
                        <h4 className="text-sm font-semibold text-navy-700">{art.name}</h4>
                        <span className="text-2xs text-purple-500">{art.city}, {art.country} • {art.primaryGenre}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-line">
                        <span className="text-purple-500">Combined A&R Score:</span>
                        <strong className="text-brand-600 font-mono text-sm">{art.combinedScore.toFixed(1)}</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-line">
                        <span className="text-purple-500">Artist AAV (Catalog):</span>
                        <strong className="text-navy-700 font-mono">{art.avmRollup ? art.avmRollup.aav : 82.0}</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-line">
                        <span className="text-purple-500">Vocal Ability ($P_V$):</span>
                        <strong className="text-series-4 font-mono">{av?.pillarVocal || 0.75}</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-line">
                        <span className="text-purple-500">Writing Craft ($P_W$):</span>
                        <strong className="text-brand-600 font-mono">{av?.pillarWriting || 0.70}</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-line">
                        <span className="text-purple-500">Tessitura / Range:</span>
                        <strong className="text-navy-700 font-mono">{av?.vocalProfile.lowestNote}–{av?.vocalProfile.highestNote} ({av?.vocalProfile.usableRangeSemitones}st)</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-line">
                        <span className="text-purple-500">Production Index:</span>
                        <strong className="text-success-600 font-mono">{av?.productionIndex}/100</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-line">
                        <span className="text-purple-500">30-Day Velocity:</span>
                        <strong className="text-success-600 font-mono">+{art.growthSignal30d}%</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-line">
                        <span className="text-purple-500">Recommendation Tier:</span>
                        <span className="font-bold text-success-600 uppercase">{art.recommendationTier}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      className="w-full"
                      onClick={() => handleOpenDecision(art)}
                    >
                      Sign Deal for {art.name}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 8. TAB 5: NEXT-BEST-ACTION INTELLIGENCE QUEUE */}
      {activeSubTab === 'next-actions' && (
        <div className="space-y-4">
          <Card padding="md" className="space-y-3">
            <div>
              <h3 className="text-base font-semibold text-navy-700 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-brand-600" />
                <span>Next-Best-Action A&R Intelligence Engine</span>
              </h3>
              <p className="text-xs text-purple-500">
                Automated context-driven recommendations based on missing evidence, detected spikes, or release trajectories.
              </p>
            </div>

            <div className="space-y-3">
              {sortedArtists.map((art, idx) => (
                <div key={`nba-${art.id}`} className="p-4 rounded bg-surface-subtle border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img src={art.avatarUrl} alt={art.name} className="w-10 h-10 rounded object-cover border" />
                    <div>
                      <strong className="text-navy-700 text-sm block">{art.name} ({art.city}, {art.country})</strong>
                      <span className="text-xs text-brand-600 font-semibold">{art.nextBestAction}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="secondary" size="sm" onClick={() => onSelectArtist(art)}>
                      View Stems
                    </Button>
                    <Button size="sm" onClick={() => handleOpenDecision(art)}>
                      Execute Action
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Decision Signing Modal */}
      <Modal
        open={showDecisionModal && !!targetArtist}
        onClose={() => setShowDecisionModal(false)}
        size="md"
        title={
          <span className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-success-600" />
            A&R Committee Deal Commitment
          </span>
        }
        subtitle={
          <>
            Execute auditable contract recommendation for <strong>{targetArtist?.name}</strong>
          </>
        }
      >
        <form onSubmit={handleCommitDecision} className="space-y-4 text-xs">
          <Field label="Official Decision Action">
            <Select value={decisionAction} onChange={(e) => setDecisionAction(e.target.value)}>
              <option value="PURSUE: Sign Master Distribution & EP Development">PURSUE: Sign Master Distribution &amp; EP Development</option>
              <option value="MEET: Schedule Studio Showcase in Nairobi">MEET: Schedule Studio Showcase in Nairobi</option>
              <option value="WATCH: Add to 60-Day Priority Watchlist">WATCH: Add to 60-Day Priority Watchlist</option>
              <option value="EVIDENCE: Request Multi-Track Stems & Live Footage">EVIDENCE: Request Multi-Track Stems &amp; Live Footage</option>
              <option value="HOLD: Defer Committee Evaluation">HOLD: Defer Committee Evaluation</option>
            </Select>
          </Field>

          <Field label="Proposed Deal Framework">
            <Select value={dealType} onChange={(e) => setDealType(e.target.value)}>
              <option value="EP Development & Master Distribution">EP Development &amp; Master Distribution</option>
              <option value="Singles Option Deal (3 Singles)">Singles Option Deal (3 Singles)</option>
              <option value="Global 360 Partnership Deal">Global 360 Partnership Deal</option>
              <option value="Direct Publishing & Sync Admin">Direct Publishing &amp; Sync Admin</option>
            </Select>
          </Field>

          <Field label="Committee Rationale & Observations">
            <Textarea
              rows={3}
              value={decisionNotes}
              onChange={(e) => setDecisionNotes(e.target.value)}
              placeholder="Enter specific contractual reasons, acoustic metrics, or marketing strategy..."
            />
          </Field>

          <div className="flex items-center justify-between pt-2">
            <span className="text-2xs text-purple-500">Audited by {reviewerName}</span>
            <Button type="submit" variant="danger" size="sm">
              {decisionCommitted ? '✓ Recorded to Ledger' : 'Commit Committee Decision'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Dossier Export Modal */}
      <Modal
        open={showExportModal && !!targetArtist}
        onClose={() => setShowExportModal(false)}
        size="lg"
        title={
          <span className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-series-4" />
            A&R Executive Candidate Dossier
          </span>
        }
        subtitle="Printable briefing for Senior Label Directors & Executive Committee"
        footer={
          <>
            <span className="text-xs text-purple-500 mr-auto">Ready for committee circulation</span>
            <Button
              size="sm"
              onClick={() => targetArtist && handleCopyBrief(targetArtist)}
              leftIcon={<Copy className="w-3.5 h-3.5" />}
            >
              {copiedBrief ? '✓ Copied to Clipboard' : 'Copy Executive Brief'}
            </Button>
          </>
        }
      >
        <pre className="p-4 rounded-card bg-surface-subtle border border-line text-xs font-mono text-navy-700 overflow-x-auto whitespace-pre-wrap max-h-96">
          {targetArtist ? generateBriefText(targetArtist) : ''}
        </pre>
      </Modal>
    </div>
  );
};
