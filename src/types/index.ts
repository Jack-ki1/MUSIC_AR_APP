export type WorkspaceSection = 'home' | 'auth' | 'discovery' | 'analyse' | 'recommendations' | 'settings';

export type RecommendationTier = 'PURSUE' | 'MEET' | 'WATCH' | 'MORE_EVIDENCE' | 'HOLD';

export type ArtistStage = 'Emerging' | 'Independent' | 'Early Growth';

export type CandidateLifecycleStage = 
  | 'DISCOVERED'
  | 'RESEARCHING'
  | 'LISTENING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'FOLLOW_UP'
  | 'ARCHIVED';

export type DataProvenanceStatus = 
  | 'VERIFIED_DSP' 
  | 'ESTIMATED' 
  | 'UNAVAILABLE' 
  | 'CALIBRATED_BASELINE';

export type TimePeriod = 
  | 'last_7_days' 
  | 'last_28_days' 
  | 'last_90_days' 
  | 'all_time';

export type UserRole = 
  | 'ADMIN'           // Administrator: full rights, manage users, integrations, secrets, audit
  | 'AR_LEAD'         // A&R Lead: manage discovery, evaluate artists, review recommendations, record/manage A&R decisions
  | 'ANALYST'         // Analyst: investigate artists, run analytical workflows, view data & generate reports
  | 'REVIEWER'        // Reviewer: perform human evaluations, add review notes, submit review decisions
  | 'VIEWER'          // Read-only: view authorized records and reports, cannot modify records
  | 'SCOUT'           // Compatible alias for Analyst / Scout
  | 'SENIOR_SCOUT';   // Compatible alias for A&R Lead

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  workspaceId: string;
  avatarUrl?: string;
  isAnonymous?: boolean;
}

export interface WorkspaceTenant {
  id: string;
  name: string;
  territory: string;
  defaultCurrency: string;
  createdAt: string;
}

export interface DiscoveryScanRecord {
  id: string;
  timestamp: string;
  region: string;
  genre?: string;
  query: string;
  candidatesFound?: number;
  candidatesCount?: number;
  providerSource?: string;
  providersUsed?: string[];
  durationMs?: number;
  status?: string;
}

export interface AuditLogEntry {
  id: string;
  workspaceId: string;
  timestamp: string;
  actorUid: string;
  actorEmail: string;
  actorRole: UserRole;
  action: 'SIGNING_DECISION_RECORDED' | 'SCORE_OVERRIDE_SAVED' | 'AUTONOMOUS_SWEEP_TRIGGERED' | 'WORKSPACE_CONFIG_UPDATED' | 'AUDIO_INGESTED_VERIFIED';
  targetEntityId: string;
  targetEntityType: 'artist' | 'decision' | 'settings' | 'audio';
  summary: string;
  details?: Record<string, any>;
  integrityHash: string; // Tamper-evident cryptographic signature hash
}

export interface MetricObservation<T = number> {
  value: T;
  provenance: DataProvenanceStatus;
  source: string;
  observedAt: string;
  timePeriod: TimePeriod;
  confidencePercent?: number;
  sampleCount?: number;
}

export interface ArtistIdentitiesReconciliation {
  isrcMasterSample?: string;
  appleMusicArtistId?: number;
  spotifyArtistUri?: string;
  musicBrainzMbid?: string;
  soundchartsId?: string;
  chartmetricId?: string;
  reconcileConfidencePercent: number; // e.g. 98%
  reconcileStatus: 'RECONCILED' | 'PARTIAL_MATCH' | 'UNRESOLVED';
  reconciledAt: string;
  matchBasis: string[]; // e.g. ["Name Exact Match", "First Track ISRC Verified", "Territory Match Kenya"]
}

export interface RecommendationEvidence {
  id: string;
  claim: string;
  evidenceType: 'acoustic_pitch' | 'growth_velocity' | 'catalog_consistency' | 'collaborations' | 'stream_count' | 'rights_validation';
  metricKey: string;
  observedValue: string | number;
  sourceLabel: string;
  timePeriod: TimePeriod;
  observedAt: string;
  deepLinkTarget?: 'vocal_piano' | 'pitch_histogram' | 'energy_curve' | 'stem_activity' | 'collaborations_list' | 'audio_ingestion';
  confidencePercent: number;
}

export interface AudioIngestionValidation {
  id: string;
  trackTitle: string;
  rightsConfirmed: boolean;
  masterRightsOwner: string;
  publishingSplitConfirmed: boolean;
  fileFormat: 'wav' | 'flac' | 'aiff' | 'mp3' | 'm4a_aac';
  sampleRateHz: number; // e.g. 44100, 48000, 96000
  bitDepth: number; // e.g. 16, 24, 32
  channels: 'Stereo' | 'Mono' | 'Atmos';
  durationSeconds: number;
  fileSizeBytes: number;
  integratedLufs: number; // target: -14 LUFS (+/- 2 LUFS)
  truePeakDb: number; // target: < -1.0 dBTP
  validationStatus: 'PASSED' | 'WARNING_DYNAMIC_RANGE' | 'REJECTED_FORMAT' | 'REJECTED_UNAUTHORIZED';
  validationTimestamp: string;
  validationChecklist: {
    formatValid: boolean;
    sampleRateValid: boolean;
    bitDepthValid: boolean;
    lufsTargetMet: boolean;
    headroomSufficient: boolean;
    chainOfTitleSigned: boolean;
  };
}

export interface HumanScoutAssessment {
  reviewerId: string;
  reviewerEmail: string;
  reviewerName: string;
  reviewerRole: UserRole;
  machineScore: number; // AVM TAV or AAV (0-100)
  humanScore: number; // calibrated human score (0-100)
  deltaPoints: number; // humanScore - machineScore
  divergenceRationale: string;
  assessedAt: string;
  signingRecommendation: RecommendationTier;
  confidenceRating: 'High' | 'Medium' | 'Tentative';
}

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
import type { DecodedAudioAnalysis } from '../services/audioAnalysisService';
export type { DecodedAudioAnalysis };

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
  audioIngestion?: AudioIngestionValidation;
  realAudioAnalysis?: DecodedAudioAnalysis;
  isrc?: string;
}

export interface ArtistCollaboration {
  collaboratorName: string;
  songTitle: string;
  role: 'Featured Artist' | 'Lead Vocalist' | 'Guest Feature' | 'Producer' | 'Co-Writer';
  releaseYear: string | number;
  platformStreamEstimate: number;
  source: string;
  observedAt: string;
}

export interface ArtistDeepFeature {
  vocalType: string;
  lowestNote: string;
  highestNote: string;
  usableSemitones: number;
  pitchAccuracyPercent: number;
  vibratoRateHz: number;
  vibratoDepthCents: number;
  harmonicToNoiseRatioDb: number;
  autotuneProcessingPercent: number;
  intrinsicConfidencePercent: number;
  timbreDescription: string;
  primaryLanguages: string[];
  keyCollaborators: string[];
  signatureStyle: string;
  observedAt?: string;
  sourceModel?: string;
}

export interface RealArtistData {
  id: string;
  workspaceId?: string;
  appleArtistId?: number;
  name: string;
  primaryGenre: string;
  genres: string[];
  country: string;
  city: string;
  avatarUrl: string;
  summary: string;
  biographyFull?: string;
  verified: boolean;
  discoveryScore: number;
  confidenceScore: number;
  artisticScore: number;
  combinedScore: number;
  recommendationTier: RecommendationTier;
  stage: ArtistStage;
  lifecycleStage?: CandidateLifecycleStage;
  
  // Explicitly source-backed & timestamped metrics
  monthlyListeners: number;
  monthlyListenersMetric?: MetricObservation<number>;
  growthSignal7d: number;
  growthSignal7dMetric?: MetricObservation<number>;
  growthSignal30d: number;
  growthSignal30dMetric?: MetricObservation<number>;
  organicConfidence: number;
  organicConfidenceMetric?: MetricObservation<number>;
  
  firstDiscoveredAt: string;
  lastObservedAt: string;
  appleMusicUrl?: string;
  wikipediaUrl?: string;
  tracks: RealSong[];
  collaborations?: ArtistCollaboration[];
  vocalFeatures?: ArtistDeepFeature;
  avmRollup: ArtistAVMRollup;
  positiveSignals: string[];
  unresolvedRisks: string[];
  nextBestAction: string;

  // Production-grade capabilities
  identitiesReconciliation?: ArtistIdentitiesReconciliation;
  evidenceLinks?: RecommendationEvidence[];
  humanAssessment?: HumanScoutAssessment;
  provenance: DataProvenanceStatus;
  dataSourceMode?: 'LIVE_DSP' | 'SANDBOX_VERIFIED';
}

export interface ARDecision {
  id: string;
  workspaceId?: string;
  artistId: string;
  artistName?: string;
  decision: string;
  decisionMaker: string;
  decisionMakerUid?: string;
  decisionMakerRole?: UserRole;
  rationale: string;
  followUpDate: string;
  dealType?: string;
  recommendedAdvanceUsd?: number;
  evidenceReferences?: string[];
  createdAt: string;
  updatedAt?: string;
  immutableHash?: string;
  status?: string;
}

