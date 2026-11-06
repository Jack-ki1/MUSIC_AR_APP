/**
 * Strongly-typed Analytics & Telemetry Interfaces for Breakout Radar "Dive In" Engine
 * Enforces strict data models for 90-day time-series, platform distributions, and growth KPIs.
 */

export interface TimeSeriesPoint {
  date: string;
  timestamp: number;
  spotify: number;
  appleMusic: number;
  youtube: number;
  tiktokUgc: number;
  total: number;
}

export interface PlatformShareSlice {
  platform: 'Spotify' | 'YouTube' | 'TikTok' | 'Apple Music' | 'SoundCloud' | 'Boomplay';
  sharePercentage: number;
  streamCount: number;
  color: string;
}

export interface EngagementSpikePoint {
  dayIndex: number;
  dateStr: string;
  engagementScore: number;
  creationsCount: number;
  isSpike: boolean;
  spikeReason?: string;
  isWeekend: boolean;
}

export interface GrowthMetricKPI {
  id: string;
  label: string;
  value: string | number;
  subValue?: string;
  changePercent: number;
  isPositive: boolean;
  periodLabel: string;
  tooltip: string;
  category: 'audience' | 'velocity' | 'retention' | 'financial' | 'artistic';
}

export interface RegionalConcentrationPoint {
  city: string;
  country: string;
  percentage: number;
  estimatedListeners: number;
  isAnchorMarket: boolean;
}

export interface RadarCompetencePoint {
  dimension: string;
  score: number; // 0-100
  benchmarkCohortAverage: number;
  fullMark: number;
}

export interface PitchCentHistogramBin {
  centBin: string; // e.g. "-50", "-20", "0", "+20"
  centValue: number;
  percentage: number;
  isWithinTolerantRange: boolean; // within +/- 20 cents
}

export interface DynamicEnergyPoint {
  second: number;
  normalizedLoudness: number; // 0-1
  perceivedEnergy: number; // 0-1
  section: 'Intro' | 'Verse 1' | 'Pre-Chorus' | 'Chorus' | 'Bridge' | 'Outro';
  isPeakEvent: boolean;
}

export interface OrganicScatterPoint {
  artistName: string;
  streamsToFollowerRatio: number;
  organicConfidencePercent: number;
  catalogDepth: number;
  isTargetArtist: boolean;
}

export interface DiscographyTrajectoryPoint {
  releaseOrder: number;
  trackTitle: string;
  releaseDate: string;
  tavScore: number;
  productionPolishIndex: number;
  vocalScore: number;
}
