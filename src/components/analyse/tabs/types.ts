import type { Dispatch, SetStateAction } from 'react';
import type { RealArtistData, RealSong } from '../../../types';
import type { TrackAVMRecord } from '../../../services/avmEngine';

export interface ScorecardScope {
  avm: TrackAVMRecord | undefined;
  effVocal: number;
  effWriting: number;
  effSong: number;
  effComp: number;
  weights: { wV: number; wW: number; wS: number; wC: number };
  prodBonus: number;
  recalculatedTAV: number;
}

export interface PianoKey { note: string; isBlack: boolean; midi: number; }

export interface VocalsScope {
  avm: TrackAVMRecord | undefined;
  pianoKeys: PianoKey[];
}

export interface PlayerScope {
  currentSong: RealSong | null;
  playingSongId: number | null;
  currentTimeSec: number;
  handlePlaySong: (song: RealSong) => void;
  handleSeekCurve: (second: number) => void;
}

export interface EnergyScope extends PlayerScope {
  avm: TrackAVMRecord | undefined;
}

export interface LyricsScope {
  avm: TrackAVMRecord | undefined;
}

export interface CompositionScope {
  avm: TrackAVMRecord | undefined;
}

export type GrowthPeriod = '7d' | '14d' | '30d' | '90d';

export interface PerformanceScope {
  activeArtist: RealArtistData;
  growthPeriod: GrowthPeriod;
  setGrowthPeriod: Dispatch<SetStateAction<GrowthPeriod>>;
}

export interface AnomalyScope {
  activeArtist: RealArtistData;
}

export interface HumanScorecardScope {
  activeArtist: RealArtistData;
  humanSongwriting: number;
  setHumanSongwriting: Dispatch<SetStateAction<number>>;
  humanVocalIdentity: number;
  setHumanVocalIdentity: Dispatch<SetStateAction<number>>;
  humanMelody: number;
  setHumanMelody: Dispatch<SetStateAction<number>>;
  humanProduction: number;
  setHumanProduction: Dispatch<SetStateAction<number>>;
  humanOriginality: number;
  setHumanOriginality: Dispatch<SetStateAction<number>>;
  humanPerformance: number;
  setHumanPerformance: Dispatch<SetStateAction<number>>;
  humanArtisticDirection: number;
  setHumanArtisticDirection: Dispatch<SetStateAction<number>>;
  humanMarketFit: number;
  setHumanMarketFit: Dispatch<SetStateAction<number>>;
  humanReviewSaved: boolean;
  setHumanReviewSaved: Dispatch<SetStateAction<boolean>>;
  reviewerNotes: string;
  setReviewerNotes: Dispatch<SetStateAction<string>>;
  onUpdateArtistScore: (artistId: string, artisticScore: number, notes: string) => void;
}

export interface OverrideScope {
  avm: TrackAVMRecord | undefined;
  effVocal: number;
  effWriting: number;
  effSong: number;
  effComp: number;
  recalculatedTAV: number;
  overrideSaved: boolean;
  reviewerNotes: string;
  setReviewerNotes: Dispatch<SetStateAction<string>>;
  setOverrideVocal: Dispatch<SetStateAction<number | null>>;
  setOverrideWriting: Dispatch<SetStateAction<number | null>>;
  setOverrideSong: Dispatch<SetStateAction<number | null>>;
  setOverrideComp: Dispatch<SetStateAction<number | null>>;
  handleSaveOverride: () => void;
}

/** Union of every scope field — the object the tab dispatcher passes to each panel. */
export type AnalyseTabProps =
  ScorecardScope & VocalsScope & EnergyScope & LyricsScope & CompositionScope &
  PerformanceScope & AnomalyScope & HumanScorecardScope & OverrideScope;
