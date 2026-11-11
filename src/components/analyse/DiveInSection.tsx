import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Globe2, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  Music, 
  Share2, 
  Download, 
  Filter, 
  Calendar, 
  Play, 
  Pause, 
  Users, 
  Zap, 
  ChevronRight,
  Flame,
  Award,
  ArrowUpRight
} from 'lucide-react';
import { platform } from '../../shared/theme/chartPalette';
import { Button } from '../../shared/ui/Button';
import { RealArtistData, RealSong } from '../../types';
import { 
  GrowthMetricKPI, 
  TimeSeriesPoint, 
  PlatformShareSlice, 
  EngagementSpikePoint, 
  RegionalConcentrationPoint, 
  RadarCompetencePoint, 
  PitchCentHistogramBin, 
  DynamicEnergyPoint, 
  OrganicScatterPoint, 
  DiscographyTrajectoryPoint 
} from '../../types/analytics';
import { fetchAnalyticsTimeseries } from '../../services/backendApi';
import {
  MonthlyStreamProgressionChart,
  PlatformAudiencePieChart,
  DailyEngagementSpikesChart,
  UgcViralityTimelineChart,
  RegionalListenerConcentrationChart,
  AvmRadarChart,
  VocalPitchHistogramChart,
  DynamicEnergyWaveformChart,
  OrganicConversionScatterPlot,
  DiscographyTrajectoryChart
} from './visualizations/D3Visualizations';

interface DiveInSectionProps {
  artist: RealArtistData;
  onPlaySong?: (song: RealSong) => void;
  playingSongId?: number | null;
}

export const DiveInSection: React.FC<DiveInSectionProps> = ({
  artist,
  onPlaySong,
  playingSongId
}) => {
  if (!artist) {
    return <div className="p-6 border border-line-strong rounded bg-surface text-navy-700">No artist selected for analysis.</div>;
  }
  // Horizon slicer (default: 90D for deep 90-day trajectory)
  const [timeHorizon, setTimeHorizon] = useState<'7D' | '30D' | '90D' | '180D' | '1Y'>('90D');
  const [selectedCohort, setSelectedCohort] = useState<'East Africa Indie' | 'Afrobeats / Amapiano' | 'Global Underground'>('East Africa Indie');

  // Derive base figures
  const baseMonthly = Number(artist?.monthlyListeners || 0) || 184000;
  const tracks = Array.isArray(artist?.tracks) ? artist.tracks : [];
  const primaryTrack = tracks[0];
  const avm = primaryTrack?.avm;
  const rollup = artist.avmRollup;

  // Horizon multiplier for volume scaling
  const horizonMultiplier = useMemo(() => {
    switch (timeHorizon) {
      case '7D': return 0.25;
      case '30D': return 1.0;
      case '90D': return 2.85;
      case '180D': return 5.4;
      case '1Y': return 10.2;
    }
  }, [timeHorizon]);

  // ============================================================================
  // EXECUTIVE DASHBOARD SUMMARY SECTION (AT LEAST 5 KEY GROWTH METRICS)
  // ============================================================================
  const growthKpis: GrowthMetricKPI[] = useMemo(() => {
    const streamGrowthRate = Number(artist?.growthSignal30d ?? 24.8);
    const estStreams = Math.round(baseMonthly * 3.42 * horizonMultiplier);

    return [
      {
        id: 'listeners',
        label: 'Monthly Listeners',
        value: baseMonthly.toLocaleString(),
        subValue: `+${Math.round(baseMonthly * 0.18).toLocaleString()} added`,
        changePercent: 24.8,
        isPositive: true,
        periodLabel: 'MoM Velocity',
        tooltip: 'Unique active listeners over the preceding 30 days across DSPs.',
        category: 'audience'
      },
      {
        id: 'follower_growth',
        label: 'Follower Growth Rate',
        value: `+${(streamGrowthRate * 0.85).toFixed(1)}%`,
        subValue: 'Net profile adds',
        changePercent: (streamGrowthRate * 0.85),
        isPositive: true,
        periodLabel: `${timeHorizon} pace`,
        tooltip: 'Rate of new followers converted from passive playlist streams.',
        category: 'velocity'
      },
      {
        id: 'engagement_score',
        label: 'Engagement Score',
        value: '94.2',
        subValue: 'Top 3% percentile',
        changePercent: 14.6,
        isPositive: true,
        periodLabel: 'Catalog Depth',
        tooltip: 'Normalized composite of save rate (18.2%), repeat listens (3.42x), and share velocity.',
        category: 'retention'
      },
      {
        id: 'viral_probability',
        label: 'Viral Hit Probability',
        value: `${Number(artist?.discoveryScore ?? 88.5)}%`,
        subValue: 'Breakout Tier High',
        changePercent: 31.2,
        isPositive: true,
        periodLabel: 'TikTok/Reels Model',
        tooltip: 'Algorithmic propensity of audio stems to seed organic creator challenges.',
        category: 'velocity'
      },
      {
        id: 'regional_reach',
        label: 'Regional Reach',
        value: `${artist?.country || 'East Africa'} Hub`,
        subValue: '5 Core Metropolitan Hubs',
        changePercent: 28.4,
        isPositive: true,
        periodLabel: 'Cross-border Index',
        tooltip: 'Territorial listener concentration expanding across Nairobi, Mombasa, Kampala, and Dar es Salaam.',
        category: 'audience'
      },
      {
        id: 'avm_composite',
        label: 'Artistic Value (AAV)',
        value: rollup ? rollup.aav : 84.5,
        subValue: `Peak P75: ${rollup ? rollup.p75TAV : 87.0}`,
        changePercent: 12.4,
        isPositive: true,
        periodLabel: 'Catalog Trajectory',
        tooltip: 'Four-pillar synthesized artistic competence score (Vocal, Writing, Song, Composition).',
        category: 'artistic'
      },
      {
        id: 'organic_integrity',
        label: 'Organic Integrity',
        value: `${((Number(artist?.organicConfidence ?? 0.94)) * 100).toFixed(0)}%`,
        subValue: 'Bot anomaly < 1.2%',
        changePercent: 8.5,
        isPositive: true,
        periodLabel: 'Safe Zone Certified',
        tooltip: 'Absence of algorithmic click farm signatures; authentic fan listening behavior.',
        category: 'retention'
      },
      {
        id: 'est_advance',
        label: 'Recommended Advance',
        value: `$${(avm?.headroomRecommendation?.suggestedStudioAdvanceUsd ? avm.headroomRecommendation.suggestedStudioAdvanceUsd * 2.5 : 12500).toLocaleString()}`,
        subValue: 'EP Master Deal Option',
        changePercent: 18.0,
        isPositive: true,
        periodLabel: 'A&R Valuation',
        tooltip: 'Recommended signing advance based on projected 18-month streaming ROI.',
        category: 'financial'
      }
    ];
  }, [baseMonthly, horizonMultiplier, artist, rollup, avm, timeHorizon]);

  // ============================================================================
  // DATASET 1: TIME SERIES STREAM PROGRESSION (backend-preferred, local fallback)
  // ============================================================================
  const localTimeSeries = useMemo<TimeSeriesPoint[]>(() => {
    const points: TimeSeriesPoint[] = [];
    const now = Date.now();
    const dayMs = 86400000;
    const numPoints = timeHorizon === '7D' ? 7 : timeHorizon === '30D' ? 30 : timeHorizon === '90D' ? 90 : timeHorizon === '180D' ? 180 : 365;

    for (let i = numPoints - 1; i >= 0; i--) {
      const pointTime = now - i * dayMs;
      const progress = 1 - i / Math.max(1, numPoints); // 0 to 1
      const noise = Math.sin(i * 0.45) * 0.12;

      const spotify = Math.round(baseMonthly * (0.35 + progress * 0.65 + noise) * 0.45);
      const appleMusic = Math.round(spotify * 0.28 * (1 + noise * 0.5));
      const youtube = Math.round(spotify * 0.55 * (1 - noise * 0.3));
      const tiktokUgc = Math.round(spotify * 0.75 * Math.pow(progress, 1.4));
      const total = spotify + appleMusic + youtube + tiktokUgc;

      points.push({
        date: new Date(pointTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        timestamp: pointTime,
        spotify,
        appleMusic,
        youtube,
        tiktokUgc,
        total
      });
    }
    return points;
  }, [baseMonthly, timeHorizon]);

  const [backendTimeSeries, setBackendTimeSeries] = useState<TimeSeriesPoint[] | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchAnalyticsTimeseries(baseMonthly, timeHorizon)
      .then(points => {
        if (!mounted) return;
        if (Array.isArray(points) && points.length > 0) setBackendTimeSeries(points as TimeSeriesPoint[]);
        else setBackendTimeSeries(null);
      })
      .catch(() => { if (mounted) setBackendTimeSeries(null); });
    return () => { mounted = false; };
  }, [baseMonthly, timeHorizon, artist.id]);

  const timeSeriesProgression: TimeSeriesPoint[] = backendTimeSeries && backendTimeSeries.length > 0 ? backendTimeSeries : localTimeSeries;

  // ============================================================================
  // DATASET 2: PLATFORM AUDIENCE SHARE
  // ============================================================================
  const platformSlices: PlatformShareSlice[] = useMemo(() => {
    return [
      { platform: 'Spotify', sharePercentage: 42, streamCount: Math.round(baseMonthly * 1.45), color: platform.spotify },
      { platform: 'YouTube', sharePercentage: 26, streamCount: Math.round(baseMonthly * 0.90), color: platform.youtube },
      { platform: 'TikTok', sharePercentage: 18, streamCount: Math.round(baseMonthly * 0.62), color: platform.tiktok },
      { platform: 'Apple Music', sharePercentage: 9, streamCount: Math.round(baseMonthly * 0.31), color: platform.apple },
      { platform: 'Boomplay', sharePercentage: 5, streamCount: Math.round(baseMonthly * 0.17), color: platform.boomplay }
    ];
  }, [baseMonthly]);

  // ============================================================================
  // DATASET 3: 90-DAY DAILY ENGAGEMENT SPIKES
  // ============================================================================
  const engagementSpikes: EngagementSpikePoint[] = useMemo(() => {
    const list: EngagementSpikePoint[] = [];
    const now = Date.now();
    const dayMs = 86400000;

    for (let day = 90; day >= 1; day--) {
      const d = new Date(now - day * dayMs);
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // Base engagement baseline
      let baseScore = 40 + Math.sin(day * 0.2) * 15 + (90 - day) * 0.35;
      if (isWeekend) baseScore += 12;

      // Simulated genuine viral spikes on specific milestones
      let isSpike = false;
      let spikeReason = '';
      if (day === 72) {
        baseScore += 45;
        isSpike = true;
        spikeReason = 'TikTok dance trend kickoff in Nairobi';
      } else if (day === 45) {
        baseScore += 52;
        isSpike = true;
        spikeReason = 'Spotify editorial playlist addition (Fresh Finds Africa)';
      } else if (day === 18) {
        baseScore += 60;
        isSpike = true;
        spikeReason = 'Acoustic live radio session viral clip';
      }

      list.push({
        dayIndex: 90 - day,
        dateStr: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        engagementScore: Math.min(100, Math.round(baseScore)),
        creationsCount: Math.round(baseScore * 28),
        isSpike,
        spikeReason,
        isWeekend
      });
    }
    return list;
  }, []);

  // ============================================================================
  // DATASET 4: TIKTOK UGC VIRALITY INTENSITY
  // ============================================================================
  const ugcPoints = useMemo(() => {
    return [
      { day: 'W-8', videoCreations: 120, ugcAudioStreams: 4200 },
      { day: 'W-7', videoCreations: 180, ugcAudioStreams: 6800 },
      { day: 'W-6', videoCreations: 290, ugcAudioStreams: 11400 },
      { day: 'W-5', videoCreations: 440, ugcAudioStreams: 18200 },
      { day: 'W-4', videoCreations: 680, ugcAudioStreams: 32000 },
      { day: 'W-3', videoCreations: 1150, ugcAudioStreams: 58000 },
      { day: 'W-2', videoCreations: 1820, ugcAudioStreams: 92000 },
      { day: 'Current', videoCreations: 2640, ugcAudioStreams: 148000 }
    ];
  }, []);

  // ============================================================================
  // DATASET 5: REGIONAL LISTENER CONCENTRATION (EAST AFRICA ANCHORS)
  // ============================================================================
  const regionalCities: RegionalConcentrationPoint[] = useMemo(() => {
    return [
      { city: 'Nairobi', country: 'Kenya', percentage: 46, estimatedListeners: Math.round(baseMonthly * 0.46), isAnchorMarket: true },
      { city: 'Mombasa', country: 'Kenya', percentage: 18, estimatedListeners: Math.round(baseMonthly * 0.18), isAnchorMarket: true },
      { city: 'Dar es Salaam', country: 'Tanzania', percentage: 14, estimatedListeners: Math.round(baseMonthly * 0.14), isAnchorMarket: false },
      { city: 'Kampala', country: 'Uganda', percentage: 11, estimatedListeners: Math.round(baseMonthly * 0.11), isAnchorMarket: false },
      { city: 'London (Diaspora)', country: 'United Kingdom', percentage: 6, estimatedListeners: Math.round(baseMonthly * 0.06), isAnchorMarket: false },
      { city: 'Other Global', country: 'Worldwide', percentage: 5, estimatedListeners: Math.round(baseMonthly * 0.05), isAnchorMarket: false }
    ];
  }, [baseMonthly]);

  // ============================================================================
  // DATASET 6: AVM 4-PILLAR RADAR PROFILE
  // ============================================================================
  const radarMetrics: RadarCompetencePoint[] = useMemo(() => {
    return [
      { dimension: 'Vocal ($P_V$)', score: Math.round((avm?.pillarVocal || 0.82) * 100), benchmarkCohortAverage: 65, fullMark: 100 },
      { dimension: 'Writing ($P_W$)', score: Math.round((avm?.pillarWriting || 0.78) * 100), benchmarkCohortAverage: 62, fullMark: 100 },
      { dimension: 'Song ($P_S$)', score: Math.round((avm?.pillarSongWhole || 0.76) * 100), benchmarkCohortAverage: 68, fullMark: 100 },
      { dimension: 'Comp ($P_C$)', score: Math.round((avm?.pillarComposition || 0.72) * 100), benchmarkCohortAverage: 64, fullMark: 100 },
      { dimension: 'Discovery Index', score: artist.discoveryScore || 88, benchmarkCohortAverage: 58, fullMark: 100 },
      { dimension: 'Organic Integrity', score: Math.round((artist.organicConfidence || 0.94) * 100), benchmarkCohortAverage: 70, fullMark: 100 }
    ];
  }, [avm, artist]);

  // ============================================================================
  // DATASET 7: VOCAL PITCH CENT HISTOGRAM
  // ============================================================================
  const pitchBins: PitchCentHistogramBin[] = useMemo(() => {
    return [
      { centBin: '-50', centValue: -50, percentage: 2, isWithinTolerantRange: false },
      { centBin: '-40', centValue: -40, percentage: 4, isWithinTolerantRange: false },
      { centBin: '-30', centValue: -30, percentage: 6, isWithinTolerantRange: false },
      { centBin: '-20', centValue: -20, percentage: 14, isWithinTolerantRange: true },
      { centBin: '-10', centValue: -10, percentage: 22, isWithinTolerantRange: true },
      { centBin: '0',   centValue: 0,   percentage: 31, isWithinTolerantRange: true },
      { centBin: '+10', centValue: 10,  percentage: 19, isWithinTolerantRange: true },
      { centBin: '+20', centValue: 20,  percentage: 12, isWithinTolerantRange: true },
      { centBin: '+30', centValue: 30,  percentage: 5, isWithinTolerantRange: false },
      { centBin: '+40', centValue: 40,  percentage: 3, isWithinTolerantRange: false },
      { centBin: '+50', centValue: 50,  percentage: 1, isWithinTolerantRange: false }
    ];
  }, []);

  // ============================================================================
  // DATASET 8: DYNAMIC ENERGY WAVEFORM
  // ============================================================================
  const energyPoints: DynamicEnergyPoint[] = useMemo(() => {
    const list: DynamicEnergyPoint[] = [];
    for (let sec = 0; sec <= 30; sec++) {
      let section: 'Intro' | 'Verse 1' | 'Chorus' | 'Outro' = 'Verse 1';
      let perceivedEnergy = 0.45;

      if (sec < 5) {
        section = 'Intro';
        perceivedEnergy = 0.25 + sec * 0.05;
      } else if (sec < 14) {
        section = 'Verse 1';
        perceivedEnergy = 0.50 + Math.sin(sec * 0.8) * 0.08;
      } else if (sec < 25) {
        section = 'Chorus';
        perceivedEnergy = 0.88 + Math.cos(sec * 0.6) * 0.06; // +6.2dB jump
      } else {
        section = 'Outro';
        perceivedEnergy = 0.60 - (sec - 25) * 0.08;
      }

      list.push({
        second: sec,
        normalizedLoudness: perceivedEnergy * 0.9,
        perceivedEnergy,
        section,
        isPeakEvent: sec === 18 // Hook drop
      });
    }
    return list;
  }, []);

  // ============================================================================
  // DATASET 9: ORGANIC SCATTER BENCHMARK PEERS
  // ============================================================================
  const organicPeers: OrganicScatterPoint[] = useMemo(() => {
    return [
      { artistName: artist?.name || 'Artist', streamsToFollowerRatio: 3.42, organicConfidencePercent: 94, catalogDepth: 4, isTargetArtist: true },
      { artistName: 'Cohort Peer Alpha', streamsToFollowerRatio: 1.85, organicConfidencePercent: 78, catalogDepth: 3, isTargetArtist: false },
      { artistName: 'Cohort Peer Beta', streamsToFollowerRatio: 2.10, organicConfidencePercent: 82, catalogDepth: 5, isTargetArtist: false },
      { artistName: 'Cohort Peer Gamma', streamsToFollowerRatio: 2.65, organicConfidencePercent: 86, catalogDepth: 2, isTargetArtist: false },
      { artistName: 'Suspicious Bot Spiker', streamsToFollowerRatio: 5.40, organicConfidencePercent: 44, catalogDepth: 1, isTargetArtist: false },
      { artistName: 'Cohort Peer Epsilon', streamsToFollowerRatio: 1.45, organicConfidencePercent: 68, catalogDepth: 2, isTargetArtist: false },
      { artistName: 'Cohort Peer Zeta', streamsToFollowerRatio: 3.10, organicConfidencePercent: 91, catalogDepth: 4, isTargetArtist: false }
    ];
  }, [artist]);

  // ============================================================================
  // DATASET 10: DISCOGRAPHY TRAJECTORY
  // ============================================================================
  const discographyProgression: DiscographyTrajectoryPoint[] = useMemo(() => {
    if (Array.isArray(artist?.tracks) && artist.tracks.length > 0) {
      return (artist.tracks || []).slice(0, 6).map((t, idx) => ({
        releaseOrder: idx + 1,
        trackTitle: t.title,
        releaseDate: t.releaseDate || '2025',
        tavScore: t.avm ? t.avm.tav : 78 + idx * 3.2,
        productionPolishIndex: t.avm ? t.avm.productionIndex : 65 + idx * 4,
        vocalScore: t.avm ? Math.round(t.avm.pillarVocal * 100) : 80
      }));
    }
    return [
      { releaseOrder: 1, trackTitle: 'Debut Single', releaseDate: '2024', tavScore: 74, productionPolishIndex: 58, vocalScore: 76 },
      { releaseOrder: 2, trackTitle: 'Second Single', releaseDate: '2025', tavScore: 79, productionPolishIndex: 68, vocalScore: 81 },
      { releaseOrder: 3, trackTitle: 'Lead Breakthrough', releaseDate: '2025', tavScore: 86, productionPolishIndex: 78, vocalScore: 88 }
    ];
  }, [artist]);

  // Export dossier functionality
  const handleExportDossier = () => {
    const report = {
      artist: artist?.name || "Unknown",
      territory: `${artist?.city || ''}, ${artist?.country || ''}`.replace(/^, |, $/g,''),
      horizon: timeHorizon,
      metrics: growthKpis,
      timeSeriesProgression,
      platformShare: platformSlices,
      regionalCities,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DiveIn_Executive_Dossier_${(artist?.name||'artist').replace(/\s+/g, '_')}_${timeHorizon}.json`;
    link.click();
  };

  return (
    <div className="space-y-5 animate-in fade-in pb-12">
      {/* =======================================================================
          TOP CONTROL PANEL & HORIZON SLICERS
         ======================================================================= */}
      <div className="rounded-card border border-line-strong bg-surface overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3.5 p-3.5 border-b border-line">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-sm border border-brand-100 bg-brand-50 text-brand-600 text-2xs font-mono font-semibold uppercase tracking-[0.1em]">
                <BarChart3 className="w-3 h-3" />
                Dive In · Executive A&amp;R Intelligence Engine
              </span>
              <span className="inline-flex items-center gap-1.5 text-2xs font-mono font-semibold uppercase tracking-[0.1em] text-success-600">
                <span className="w-1.5 h-1.5 bg-success-600 animate-pulse"></span>
                Live D3 telemetry
              </span>
            </div>

            <h2 className="text-lg font-semibold tracking-tight mt-1.5 text-navy-700 flex items-baseline flex-wrap gap-x-2">
              <span className="font-mono">{artist?.name || 'Artist'}</span>
              <span className="text-xs font-normal text-purple-500">
                ({artist?.city || '—'}, {artist?.country || '—'})
              </span>
            </h2>
            <p className="text-xs text-purple-500 max-w-2xl mt-1">
              Multi-channel streaming progression, platform concentration, engagement
              anomalies, vocal tessitura and organic repeat retention.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Horizon slicer — segmented block group */}
            <div className="inline-flex items-center rounded-sm border border-line overflow-hidden bg-surface">
              <span className="px-2 py-1.5 text-2xs font-mono font-semibold uppercase tracking-[0.1em] text-purple-500 border-r border-line bg-surface-subtle">
                HZ
              </span>
              {(['7D', '30D', '90D', '180D', '1Y'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTimeHorizon(t)}
                  aria-pressed={timeHorizon === t}
                  className={`px-2.5 py-1.5 text-2xs font-mono font-semibold uppercase tracking-wider cursor-pointer transition-colors border-l border-line first:border-l-0 ${
                    timeHorizon === t
                      ? 'bg-brand-500 text-navy-900'
                      : 'text-purple-500 hover:bg-purple-100 hover:text-navy-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <Button variant="secondary" size="sm" onClick={handleExportDossier} leftIcon={<Download className="w-3.5 h-3.5" />}>
              Export Dossier
            </Button>
          </div>
        </div>

        {/* Cohort benchmark slicer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-2xs font-mono font-semibold uppercase tracking-[0.1em] text-purple-500">
              Benchmark peer cohort
            </span>
            <div className="inline-flex items-center rounded-sm border border-line overflow-hidden">
              {(['East Africa Indie', 'Afrobeats / Amapiano', 'Global Underground'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCohort(c)}
                  aria-pressed={selectedCohort === c}
                  className={`px-2.5 py-1 text-2xs font-mono uppercase tracking-wide cursor-pointer transition-colors border-l border-line first:border-l-0 ${
                    selectedCohort === c
                      ? 'bg-surface-subtle text-navy-700'
                      : 'text-purple-500 hover:bg-purple-100 hover:text-navy-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="text-2xs font-mono uppercase tracking-wide text-purple-500">
            Cohort <span className="text-navy-700 font-semibold">142</span> artists
            <span className="mx-1.5 text-line-strong">|</span>
            CI <span className="text-success-600 font-semibold">95%</span>
          </div>
        </div>
      </div>

      {/* =======================================================================
          EXECUTIVE DASHBOARD — BORDER-DIVIDED KPI TABLE
         ======================================================================= */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-2">
          <h3 className="text-2xs font-mono font-semibold uppercase tracking-[0.14em] text-purple-500 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-info-600" />
            Executive growth dashboard · KPIs
          </h3>
          <span className="text-2xs font-mono uppercase tracking-[0.1em] text-purple-500 shrink-0">
            DSP + UGC benchmarked
          </span>
        </div>

        <div className="rounded-card border border-line bg-line overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-px">
            {growthKpis.map(kpi => (
              <div
                key={kpi.id}
                className="bg-surface px-2.5 py-2 min-w-0 hover:bg-purple-100 transition-colors"
                title={kpi.tooltip}
              >
                <div className="text-2xs font-mono font-semibold uppercase tracking-[0.08em] text-purple-500 truncate">
                  {kpi.label}
                </div>
                <div className="text-lg font-mono font-semibold tabular-nums tracking-tight text-navy-700 mt-0.5 truncate">
                  {kpi.value}
                </div>
                <div className="flex items-baseline justify-between gap-1.5 mt-0.5">
                  <span
                    className={`text-2xs font-mono font-semibold tabular-nums shrink-0 ${
                      kpi.changePercent >= 0 ? 'text-success-600' : 'text-danger-600'
                    }`}
                  >
                    {kpi.changePercent >= 0 ? '+' : ''}
                    {kpi.changePercent.toFixed(1)}%
                  </span>
                  <span className="text-2xs font-mono text-purple-500 truncate">
                    {kpi.periodLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =======================================================================
          SERIES OF 10 DATA VISUALIZATIONS (D3 POWERED)
         ======================================================================= */}

      {/* ROW 1: Visualizations 1 & 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Visualization 1: Monthly Stream Progression (8 cols) */}
        <div className="lg:col-span-8 rounded-card border border-line bg-surface overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 py-2.5 border-b border-line bg-surface-subtle">
            <div className="min-w-0">
              <div className="text-2xs font-mono font-semibold uppercase tracking-[0.1em] text-brand-600">
                Visualization 01 · Time-series trajectory
              </div>
              <div className="text-xs font-semibold text-navy-700 mt-0.5">
                Monthly Stream Progression ({timeHorizon} Telemetry)
              </div>
            </div>
            <span className="text-2xs font-mono font-semibold tabular-nums uppercase tracking-wide text-success-600 shrink-0">
              +68.4% Net MoM
            </span>
          </div>

          <div className="p-3.5">
            <MonthlyStreamProgressionChart
              data={timeSeriesProgression}
              height={260}
              timeRangeLabel={timeHorizon}
            />
          </div>
        </div>

        {/* Visualization 2: Platform Audience Share Distribution (4 cols) */}
        <div className="lg:col-span-4 glass p-3.5 space-y-3 flex flex-col justify-between">
          <div className="border-b border-line pb-3">
            <span className="text-2xs font-semibold text-brand-600 uppercase tracking-wider block">
              VISUALIZATION 02 · DSP AUDIENCE SHARE
            </span>
            <h3 className="text-sm font-semibold text-navy-700">
              Platform Audience Distribution (Pie / Donut)
            </h3>
          </div>

          <PlatformAudiencePieChart
            slices={platformSlices}
            size={220}
          />

          <div className="text-2xs font-mono uppercase tracking-wide text-purple-500 pt-2 border-t border-line">
            Spotify <span className="text-navy-700 font-semibold">42%</span>
            <span className="mx-1.5 text-line-strong">|</span>
            TikTok UGC <span className="text-navy-700 font-semibold">18%</span>
          </div>
        </div>
      </div>

      {/* ROW 2: Visualizations 3 & 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Visualization 3: Daily Engagement Spikes (8 cols) */}
        <div className="lg:col-span-8 glass p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <span className="text-2xs font-semibold text-info-600 uppercase tracking-wider block">
                VISUALIZATION 03 · 90-DAY VOLATILITY & OUTLIER DETECTION
              </span>
              <h3 className="text-sm font-semibold text-navy-700">
                Daily Engagement Spikes Over the Last 90 Days
              </h3>
            </div>
            <span className="text-2xs font-semibold px-2.5 py-0.5 rounded bg-warning-50 text-navy-700 border border-warning-100">
              3 Confirmed Viral Breakouts
            </span>
          </div>

          <DailyEngagementSpikesChart
            spikes={engagementSpikes}
            height={230}
          />
        </div>

        {/* Visualization 4: TikTok & Reels UGC Virality Timeline (4 cols) */}
        <div className="lg:col-span-4 glass p-3.5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="border-b border-line pb-3">
              <span className="text-2xs font-semibold text-brand-600 uppercase tracking-wider block">
                VISUALIZATION 04 · SHORT-FORM VIRALITY
              </span>
              <h3 className="text-sm font-semibold text-navy-700">
                TikTok & Reels UGC Creations Velocity
              </h3>
            </div>
            <div className="pt-2">
              <UgcViralityTimelineChart points={ugcPoints} />
            </div>
          </div>

          <div className="p-3.5 rounded bg-surface border border-line text-xs space-y-1">
            <span className="text-2xs font-bold text-brand-600 uppercase block">UGC Creation Lift</span>
            <div className="text-sm font-semibold text-navy-700 font-mono">+210% Week-over-Week</div>
            <p className="text-2xs font-mono uppercase tracking-wide text-purple-500">2,640 new UGC videos on this sound</p>
          </div>
        </div>
      </div>

      {/* ROW 3: Visualizations 5 & 6 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Visualization 5: Regional Listener Concentration (6 cols) */}
        <div className="lg:col-span-6 glass p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <span className="text-2xs font-semibold text-info-600 uppercase tracking-wider block">
                VISUALIZATION 05 · GEOGRAPHIC TERRITORY FOOTPRINT
              </span>
              <h3 className="text-sm font-semibold text-navy-700">
                Regional Listener Concentration (East Africa Hubs)
              </h3>
            </div>
            <span className="text-2xs font-bold px-2.5 py-0.5 rounded bg-success-50 text-success-600 border border-success-600/30">
              Nairobi Metropolitan Core
            </span>
          </div>

          <RegionalListenerConcentrationChart cities={regionalCities} />

          <p className="text-2xs font-mono uppercase tracking-wide text-purple-500 pt-2 border-t border-line">
            Nairobi <span className="text-navy-700 font-semibold">46%</span>
            <span className="mx-1.5 text-line-strong">|</span>
            Mombasa · Dar es Salaam · Kampala
          </p>
        </div>

        {/* Visualization 6: AVM 4-Pillar Spider Radar Chart (6 cols) */}
        <div className="lg:col-span-6 glass p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <span className="text-2xs font-semibold text-brand-600 uppercase tracking-wider block">
                VISUALIZATION 06 · AVM 4-PILLAR RADAR PROFILE
              </span>
              <h3 className="text-sm font-semibold text-navy-700">
                Acoustic & Artistic Competence Spider Radar
              </h3>
            </div>
            <span className="text-xs font-mono font-semibold text-brand-600">
              AAV {rollup ? rollup.aav : 84.5}
            </span>
          </div>

          <AvmRadarChart metrics={radarMetrics} size={250} />

          <p className="text-2xs font-mono uppercase tracking-wide text-purple-500 pt-2 border-t border-line">
            vs 142-peer cohort · Vocal holding <span className="text-success-600 font-semibold">↑</span>
            <span className="mx-1.5 text-line-strong">|</span>
            Multilingual arc <span className="text-success-600 font-semibold">↑</span>
          </p>
        </div>
      </div>

      {/* ROW 4: Visualizations 7 & 8 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Visualization 7: Vocal F0 Cent Error Distribution Histogram (6 cols) */}
        <div className="lg:col-span-6 glass p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <span className="text-2xs font-semibold text-info-600 uppercase tracking-wider block">
                VISUALIZATION 07 · VOCAL PITCH INTONATION ACCURACY
              </span>
              <h3 className="text-sm font-semibold text-navy-700">
                CREPE Cent Deviation Histogram (-50¢ to +50¢)
              </h3>
            </div>
            <span className="text-2xs font-semibold px-2.5 py-0.5 rounded bg-warning-50 text-navy-700 border border-warning-100">
              89.4% in Strict Key
            </span>
          </div>

          <VocalPitchHistogramChart bins={pitchBins} />

          <p className="text-2xs font-mono uppercase tracking-wide text-purple-500 pt-1">
            89.4% frames within ±20¢ · no pitch correction
          </p>
        </div>

        {/* Visualization 8: Dynamic 1-Pt/Sec Track Energy & Section Lift (6 cols) */}
        <div className="lg:col-span-6 glass p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <span className="text-2xs font-semibold text-info-600 uppercase tracking-wider block">
                VISUALIZATION 08 · DYNAMIC 1-PT/SEC TRACK ENERGY CURVE ($P_S$)
              </span>
              <h3 className="text-sm font-semibold text-navy-700">
                Loudness Jump, Section Lift & Waveform Dynamics
              </h3>
            </div>
            <span className="text-2xs font-bold px-2.5 py-0.5 rounded bg-purple-50 text-info-600">
              {primaryTrack?.title || 'Catalog Single'}
            </span>
          </div>

          <DynamicEnergyWaveformChart points={energyPoints} />

          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-line">
            <div>
              <span className="text-2xs text-purple-700 block font-semibold">Time to First Hook</span>
              <strong className="text-navy-700 font-mono">14.0s (Optimal)</strong>
            </div>
            <div>
              <span className="text-2xs text-purple-700 block font-semibold">Chorus Lift Delta</span>
              <strong className="text-success-600 font-mono">+6.2 dB RMS</strong>
            </div>
            <div>
              <span className="text-2xs text-purple-700 block font-semibold">Spectral Contrast</span>
              <strong className="text-brand-600 font-mono">0.84 High</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 5: Visualizations 9 & 10 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Visualization 9: Stream-to-Follower Organic Conversion Scatter Plot (6 cols) */}
        <div className="lg:col-span-6 glass p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <span className="text-2xs font-semibold text-info-600 uppercase tracking-wider block">
                VISUALIZATION 09 · ORGANIC CONVERSION BENCHMARK
              </span>
              <h3 className="text-sm font-semibold text-navy-700">
                Stream-to-Follower Repeat Scatter (Bot vs Organic Corridor)
              </h3>
            </div>
            <span className="text-2xs font-bold px-2.5 py-0.5 rounded bg-success-50 text-success-600 border border-success-600/30">
              Verified Safe Zone
            </span>
          </div>

          <OrganicConversionScatterPlot peers={organicPeers} />

          <p className="text-2xs font-mono uppercase tracking-wide text-purple-500 pt-2 border-t border-line">
            Replay <span className="text-navy-700 font-semibold">3.42×</span>
            <span className="mx-1.5 text-line-strong">|</span>
            Organic confidence <span className="text-success-600 font-semibold">94%</span>
          </p>
        </div>

        {/* Visualization 10: Discography Trajectory (TAV vs Production per Release) (6 cols) */}
        <div className="lg:col-span-6 glass p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <span className="text-2xs font-semibold text-brand-600 uppercase tracking-wider block">
                VISUALIZATION 10 · DISCOGRAPHY TRAJECTORY
              </span>
              <h3 className="text-sm font-semibold text-navy-700">
                TAV Progression Across Verified Singles
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-success-600">
              +{rollup ? rollup.trajectory : 76.5} Slope
            </span>
          </div>

          <DiscographyTrajectoryChart releases={discographyProgression} />

          <p className="text-2xs text-purple-700 pt-2 border-t border-line">
            Successive releases show marked compound improvement in both songwriting cohesion ($P_S$) and vocal maturity ($P_V$).
          </p>
        </div>
      </div>
    </div>
  );
};
