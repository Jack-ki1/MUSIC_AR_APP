export type WorkspaceSection = 'home' | 'discovery' | 'analyse' | 'recommendations' | 'settings';

export type RecommendationTier = 'PURSUE' | 'MEET' | 'WATCH' | 'MORE_EVIDENCE' | 'HOLD';

export type ArtistStage = 'Emerging' | 'Independent' | 'Early Growth';

export type ProviderCategory = 
  | 'Streaming Platforms'
  | 'Video Platforms'
  | 'Music Catalogues'
  | 'Social Media'
  | 'Live Performance'
  | 'Research & Analytics'
  | 'Press & News'
  | 'Independent Music';

export type ProviderStatus = 
  | 'Ready'
  | 'Disabled'
  | 'Connecting'
  | 'Needs Credentials'
  | 'Licensed Access'
  | 'Research Only'
  | 'Approval Required';

export interface ProviderField {
  key: string;
  label: string;
  secret: boolean;
  configured: boolean;
  placeholder?: string;
  type?: string;
}

export interface ProviderSource {
  id: string;
  name: string;
  category: string;
  access?: string;
  status: string;
  enabled: boolean;
  implemented: boolean;
  capability?: string;
  connected?: boolean;
  description: string;
  access_note?: string;
  accessNote?: string;
  docs_url?: string;
  docsUrl?: string;
  iconType?: 'music' | 'database';
  fields?: ProviderField[];
  missing_fields?: string[];
  quotaUsed?: number;
  quotaLimit?: number;
  quotaReset?: string;
}

export type {
  VocalProfile,
  PitchCentDistributionBin,
  EnergyCurvePoint,
  EnergyMetrics,
  LyricLineAnalysis,
  LyricsBreakdown,
  StemsActivity,
  CompositionFacts,
  AVMPillarSubScores,
  TrackAVMRecord,
  ArtistAVMRollup,
} from '../services/avmEngine';

import type { TrackAVMRecord, ArtistAVMRollup } from '../services/avmEngine';

export interface RealSong {
  id: number;
  title: string;
  artistName: string;
  artistId: number;
  collectionName: string;
  previewUrl: string;
  artworkUrl: string;
  releaseDate: string;
  primaryGenreName: string;
  trackViewUrl: string;
  trackPrice?: number;
  avm: TrackAVMRecord;
}

export interface RealArtistData {
  id: string;
  appleArtistId?: number;
  name: string;
  primaryGenre: string;
  genres: string[];
  country: string;
  city: string;
  avatarUrl: string;
  summary: string;
  verified: boolean;
  discoveryScore: number;
  confidenceScore: number;
  artisticScore: number;
  combinedScore: number;
  recommendationTier: RecommendationTier;
  stage: ArtistStage;
  monthlyListeners: number;
  growthSignal7d: number;
  growthSignal30d: number;
  organicConfidence: number;
  firstDiscoveredAt: string;
  lastObservedAt: string;
  appleMusicUrl?: string;
  wikipediaUrl?: string;
  tracks: RealSong[];
  avmRollup: ArtistAVMRollup;
  positiveSignals: string[];
  unresolvedRisks: string[];
  nextBestAction: string;
}

export interface ARDecision {
  id: string;
  artistId: string;
  decision: string;
  decisionMaker: string;
  rationale: string;
  followUpDate: string;
  dealType?: string;
  recommendedAdvanceUsd?: number;
  createdAt: string;
}
