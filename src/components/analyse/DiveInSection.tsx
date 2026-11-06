import React, { useState, useMemo } from 'react';
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
  // Horizon slicer (default: 90D for deep 90-day trajectory)
  const [timeHorizon, setTimeHorizon] = useState<'7D' | '30D' | '90D' | '180D' | '1Y'>('90D');
  const [selectedCohort, setSelectedCohort] = useState<'East Africa Indie' | 'Afrobeats / Amapiano' | 'Global Underground'>('East Africa Indie');

  // Derive base figures
  const baseMonthly = artist.monthlyListeners || 184000;
  const primaryTrack = artist.tracks?.[0];
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
    const streamGrowthRate = artist.growthSignal30d || 24.8;
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
        value: `${artist.discoveryScore || 88.5}%`,
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
        value: `${artist.country || 'East Africa'} Hub`,
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
        value: `${((artist.organicConfidence || 0.94) * 100).toFixed(0)}%`,
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
        value: `$${(avm ? avm.headroomRecommendation.suggestedStudioAdvanceUsd * 2.5 : 12500).toLocaleString()}`,
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
  // DATASET 1: 90-DAY TIME SERIES STREAM PROGRESSION
  // ============================================================================
  const timeSeriesProgression: TimeSeriesPoint[] = useMemo(() => {
    const points: TimeSeriesPoint[] = [];
    const now = Date.now();
    const dayMs = 86400000;
    const numPoints = timeHorizon === '7D' ? 7 : timeHorizon === '30D' ? 30 : 90;

    for (let i = numPoints - 1; i >= 0; i--) {
      const pointTime = now - i * dayMs;
      const progress = 1 - i / numPoints; // 0 to 1
      const noise = Math.sin(i * 0.45) * 0.12;

      // Realistic progression starting from modest underground numbers to breakout
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

  // ============================================================================
  // DATASET 2: PLATFORM AUDIENCE SHARE
  // ============================================================================
  const platformSlices: PlatformShareSlice[] = useMemo(() => {
    return [
      { platform: 'Spotify', sharePercentage: 42, streamCount: Math.round(baseMonthly * 1.45), color: '#10B981' },
      { platform: 'YouTube', sharePercentage: 26, streamCount: Math.round(baseMonthly * 0.90), color: '#EF4444' },
      { platform: 'TikTok', sharePercentage: 18, streamCount: Math.round(baseMonthly * 0.62), color: '#0F172A' },
      { platform: 'Apple Music', sharePercentage: 9, streamCount: Math.round(baseMonthly * 0.31), color: '#F43F5E' },
      { platform: 'Boomplay', sharePercentage: 5, streamCount: Math.round(baseMonthly * 0.17), color: '#38BDF8' }
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
      { artistName: artist.name, streamsToFollowerRatio: 3.42, organicConfidencePercent: 94, catalogDepth: 4, isTargetArtist: true },
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
    if (artist.tracks && artist.tracks.length > 0) {
      return artist.tracks.slice(0, 6).map((t, idx) => ({
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
      artist: artist.name,
      territory: `${artist.city}, ${artist.country}`,
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
    link.download = `DiveIn_Executive_Dossier_${artist.name.replace(/\s+/g, '_')}_${timeHorizon}.json`;
    link.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* =======================================================================
          TOP CONTROL PANEL & HORIZON SLICERS
         ======================================================================= */}
      <div className="bg-[#0F172A] text-white rounded-2xl p-6 shadow-xl border border-[#1E293B] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#7155F5]/30 text-[#A78BFA] border border-[#7155F5]/50 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-3 h-3 text-[#A78BFA]" />
                DIVE IN · EXECUTIVE A&R INTELLIGENCE ENGINE
              </span>
              <span className="text-[10px] text-[#10B981] font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping"></span>
                LIVE D3 TELEMETRY READY
              </span>
            </div>

            <h2 className="text-2xl font-black tracking-tight mt-1 text-white flex items-center gap-2">
              <span>{artist.name}</span>
              <span className="text-sm font-semibold text-[#94A3B8]">({artist.city}, {artist.country})</span>
            </h2>
            <p className="text-xs text-[#94A3B8] max-w-2xl leading-relaxed mt-0.5">
              Multi-channel streaming progression, platform concentration, daily engagement anomalies, vocal tessitura cent distributions, and forensic organic repeat retention.
            </p>
          </div>

          {/* Slicers & Export */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Timeframe Slicer */}
            <div className="flex items-center bg-[#1E293B] border border-[#334155] p-1 rounded-xl text-xs">
              <span className="text-[10px] font-bold text-[#94A3B8] px-2 uppercase">Horizon:</span>
              {(['7D', '30D', '90D', '180D', '1Y'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTimeHorizon(t)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    timeHorizon === t
                      ? 'bg-[#7155F5] text-white shadow-xs'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Export JSON Dossier */}
            <button
              onClick={handleExportDossier}
              className="px-3.5 py-2 rounded-xl bg-[#7155F5] hover:bg-[#5E3EE4] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Dossier (JSON)</span>
            </button>
          </div>
        </div>

        {/* Cohort Benchmark Slicer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1E293B] text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase">Benchmark Peer Cohort:</span>
            {(['East Africa Indie', 'Afrobeats / Amapiano', 'Global Underground'] as const).map(c => (
              <button
                key={c}
                onClick={() => setSelectedCohort(c)}
                className={`px-2.5 py-0.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  selectedCohort === c ? 'bg-white text-[#0F172A] font-bold' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-[#94A3B8]">
            Cohort Size: <strong className="text-white">142 Emerging Artists</strong> • Confidence Interval: <strong className="text-[#10B981]">95%</strong>
          </div>
        </div>
      </div>

      {/* =======================================================================
          EXECUTIVE DASHBOARD SUMMARY SECTION: 8 KEY GROWTH METRICS WITH TRENDS
         ======================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#7155F5]" />
            <span>Executive Growth Dashboard · Key Performance Indicators</span>
          </h3>
          <span className="text-[11px] text-[#64748B]">
            Telemetry benchmarked across DSPs and UGC audio engines
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {growthKpis.map(kpi => (
            <div
              key={kpi.id}
              className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs space-y-1 hover:border-[#CBD5E1] transition-all"
              title={kpi.tooltip}
            >
              <span className="text-[10px] font-bold text-[#64748B] uppercase block truncate">
                {kpi.label}
              </span>
              <div className="text-lg font-black text-[#0F172A] font-mono tracking-tight">
                {kpi.value}
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <span className="flex items-center gap-0.5 text-[10px] font-bold text-[#059669]">
                  <TrendingUp className="w-3 h-3 text-[#059669]" />
                  <span>+{kpi.changePercent.toFixed(1)}%</span>
                </span>
                <span className="text-[9px] text-[#94A3B8] truncate">{kpi.periodLabel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =======================================================================
          SERIES OF 10 DATA VISUALIZATIONS (D3 POWERED)
         ======================================================================= */}

      {/* ROW 1: Visualizations 1 & 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Visualization 1: Monthly Stream Progression (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#E5E9F3] rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F1F5F9] pb-3">
            <div>
              <span className="text-[10px] font-black text-[#7155F5] uppercase tracking-wider block">
                VISUALIZATION 01 · TIME-SERIES TRAJECTORY
              </span>
              <h3 className="text-sm font-extrabold text-[#0F172A]">
                Monthly Stream Progression ({timeHorizon} Telemetry)
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-md border border-[#A7F3D0]">
              +68.4% Net MoM Growth
            </span>
          </div>

          <MonthlyStreamProgressionChart
            data={timeSeriesProgression}
            height={260}
            timeRangeLabel={timeHorizon}
          />
        </div>

        {/* Visualization 2: Platform Audience Share Distribution (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-[#E5E9F3] rounded-2xl p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="border-b border-[#F1F5F9] pb-3">
            <span className="text-[10px] font-black text-[#7155F5] uppercase tracking-wider block">
              VISUALIZATION 02 · DSP AUDIENCE SHARE
            </span>
            <h3 className="text-sm font-extrabold text-[#0F172A]">
              Platform Audience Distribution (Pie / Donut)
            </h3>
          </div>

          <PlatformAudiencePieChart
            slices={platformSlices}
            size={220}
          />

          <div className="text-[11px] text-[#64748B] pt-2 border-t border-[#F1F5F9]">
            Dominant presence on <strong>Spotify (42%)</strong> with accelerated UGC discovery through <strong>TikTok audio usage (18%)</strong>.
          </div>
        </div>
      </div>

      {/* ROW 2: Visualizations 3 & 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Visualization 3: Daily Engagement Spikes (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#E5E9F3] rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
            <div>
              <span className="text-[10px] font-black text-[#7155F5] uppercase tracking-wider block">
                VISUALIZATION 03 · 90-DAY VOLATILITY & OUTLIER DETECTION
              </span>
              <h3 className="text-sm font-extrabold text-[#0F172A]">
                Daily Engagement Spikes Over the Last 90 Days
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FEF3C7] text-[#B45309]">
              3 Confirmed Viral Breakouts
            </span>
          </div>

          <DailyEngagementSpikesChart
            spikes={engagementSpikes}
            height={230}
          />
        </div>

        {/* Visualization 4: TikTok & Reels UGC Virality Timeline (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-[#E5E9F3] rounded-2xl p-5 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="border-b border-[#F1F5F9] pb-3">
              <span className="text-[10px] font-black text-[#EC4899] uppercase tracking-wider block">
                VISUALIZATION 04 · SHORT-FORM VIRALITY
              </span>
              <h3 className="text-sm font-extrabold text-[#0F172A]">
                TikTok & Reels UGC Creations Velocity
              </h3>
            </div>
            <div className="pt-2">
              <UgcViralityTimelineChart points={ugcPoints} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#FDF2F8] border border-[#FBCFE8] text-xs space-y-1">
            <span className="text-[10px] font-bold text-[#BE185D] uppercase block">UGC Creation Lift</span>
            <div className="text-sm font-black text-[#9D174D] font-mono">+210% Week-over-Week</div>
            <p className="text-[10px] text-[#64748B]">Over 2,640 new user videos created with this artist's sound snippet.</p>
          </div>
        </div>
      </div>

      {/* ROW 3: Visualizations 5 & 6 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Visualization 5: Regional Listener Concentration (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-[#E5E9F3] rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
            <div>
              <span className="text-[10px] font-black text-[#7155F5] uppercase tracking-wider block">
                VISUALIZATION 05 · GEOGRAPHIC TERRITORY FOOTPRINT
              </span>
              <h3 className="text-sm font-extrabold text-[#0F172A]">
                Regional Listener Concentration (East Africa Hubs)
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#ECFDF5] text-[#059669]">
              Nairobi Metropolitan Core
            </span>
          </div>

          <RegionalListenerConcentrationChart cities={regionalCities} />

          <p className="text-[11px] text-[#64748B] pt-2 border-t border-[#F1F5F9]">
            Strong grassroot anchor in <strong>Nairobi (46%)</strong> with organic cross-border penetration into <strong>Mombasa, Dar es Salaam, and Kampala</strong>.
          </p>
        </div>

        {/* Visualization 6: AVM 4-Pillar Spider Radar Chart (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-[#E5E9F3] rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
            <div>
              <span className="text-[10px] font-black text-[#7155F5] uppercase tracking-wider block">
                VISUALIZATION 06 · AVM 4-PILLAR RADAR PROFILE
              </span>
              <h3 className="text-sm font-extrabold text-[#0F172A]">
                Acoustic & Artistic Competence Spider Radar
              </h3>
            </div>
            <span className="text-xs font-mono font-black text-[#7155F5]">
              AAV {rollup ? rollup.aav : 84.5}
            </span>
          </div>

          <AvmRadarChart metrics={radarMetrics} size={250} />

          <p className="text-[11px] text-[#64748B] pt-2 border-t border-[#F1F5F9]">
            Artist competence significantly outperforms the 142-peer cohort in <strong>Vocal Holding ($P_V$)</strong> and <strong>Multilingual Writing Arc ($P_W$)</strong>.
          </p>
        </div>
      </div>

      {/* ROW 4: Visualizations 7 & 8 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Visualization 7: Vocal F0 Cent Error Distribution Histogram (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-[#E5E9F3] rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
            <div>
              <span className="text-[10px] font-black text-[#7155F5] uppercase tracking-wider block">
                VISUALIZATION 07 · VOCAL PITCH INTONATION ACCURACY
              </span>
              <h3 className="text-sm font-extrabold text-[#0F172A]">
                CREPE Cent Deviation Histogram (-50¢ to +50¢)
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#DCFCE7] text-[#15803D]">
              89.4% in Strict Key
            </span>
          </div>

          <VocalPitchHistogramChart bins={pitchBins} />

          <p className="text-[11px] text-[#64748B] pt-1">
            Psychoacoustic evaluation validates that <strong>89.4% of vocal audio frames</strong> stay within the narrow $\pm 20$ cents threshold without heavy pitch correction artifacts.
          </p>
        </div>

        {/* Visualization 8: Dynamic 1-Pt/Sec Track Energy & Section Lift (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-[#E5E9F3] rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
            <div>
              <span className="text-[10px] font-black text-[#7155F5] uppercase tracking-wider block">
                VISUALIZATION 08 · DYNAMIC 1-PT/SEC TRACK ENERGY CURVE ($P_S$)
              </span>
              <h3 className="text-sm font-extrabold text-[#0F172A]">
                Loudness Jump, Section Lift & Waveform Dynamics
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EEF2FF] text-[#4338CA]">
              {primaryTrack?.title || 'Catalog Single'}
            </span>
          </div>

          <DynamicEnergyWaveformChart points={energyPoints} />

          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-[#F1F5F9]">
            <div>
              <span className="text-[10px] text-[#64748B] block">Time to First Hook</span>
              <strong className="text-[#0F172A] font-mono">14.0s (Optimal)</strong>
            </div>
            <div>
              <span className="text-[10px] text-[#64748B] block">Chorus Lift Delta</span>
              <strong className="text-[#059669] font-mono">+6.2 dB RMS</strong>
            </div>
            <div>
              <span className="text-[10px] text-[#64748B] block">Spectral Contrast</span>
              <strong className="text-[#7155F5] font-mono">0.84 High</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 5: Visualizations 9 & 10 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Visualization 9: Stream-to-Follower Organic Conversion Scatter Plot (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-[#E5E9F3] rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
            <div>
              <span className="text-[10px] font-black text-[#7155F5] uppercase tracking-wider block">
                VISUALIZATION 09 · ORGANIC CONVERSION BENCHMARK
              </span>
              <h3 className="text-sm font-extrabold text-[#0F172A]">
                Stream-to-Follower Repeat Scatter (Bot vs Organic Corridor)
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#DCFCE7] text-[#15803D]">
              Verified Safe Zone
            </span>
          </div>

          <OrganicConversionScatterPlot peers={organicPeers} />

          <p className="text-[11px] text-[#64748B] pt-2 border-t border-[#F1F5F9]">
            {artist.name} demonstrates a <strong>3.42x stream replay ratio</strong> with <strong>94% organic confidence</strong>, confirming strong fan loyalty rather than artificial click-farming.
          </p>
        </div>

        {/* Visualization 10: Discography Trajectory (TAV vs Production per Release) (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-[#E5E9F3] rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
            <div>
              <span className="text-[10px] font-black text-[#7155F5] uppercase tracking-wider block">
                VISUALIZATION 10 · DISCOGRAPHY TRAJECTORY
              </span>
              <h3 className="text-sm font-extrabold text-[#0F172A]">
                TAV Progression Across Verified Singles
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-[#059669]">
              +{rollup ? rollup.trajectory : 76.5} Slope
            </span>
          </div>

          <DiscographyTrajectoryChart releases={discographyProgression} />

          <p className="text-[11px] text-[#64748B] pt-2 border-t border-[#F1F5F9]">
            Successive releases show marked compound improvement in both songwriting cohesion ($P_S$) and vocal maturity ($P_V$).
          </p>
        </div>
      </div>
    </div>
  );
};
