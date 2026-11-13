# API Documentation: External Integrations & Client Contracts

## 1. Upstream External Music Provider Gateway

Breakout Radar interfaces with verified music platforms without exposing confidential server credentials in client-side bundles.

### 1.1 Apple Music / iTunes Public Search Gateway
- **Endpoint**: `https://itunes.apple.com/search`
- **Method**: `GET`
- **Parameters**:
  - `term`: URL-encoded artist or release query (e.g. `Kinoti`, `Xenia Manasseh`).
  - `entity`: `song`
  - `limit`: `25`
- **Response Transformation**:
  Maps raw track entities into strongly typed `RealSong` objects containing:
  - `id`: iTunes Track ID
  - `title`: Canonical track title
  - `previewUrl`: High-resolution 256kbps AAC audio preview CDN URL (`mzaf_*.plus.aac.p.m4a`)
  - `artworkUrl`: 600x600 album artwork asset
  - `releaseDate`: Formatted ISO date string
  - `avm`: Deterministic AVM calculation executed upon ingestion

### 1.2 MusicBrainz Graph Identifier Reconciler
- **Endpoint**: `https://musicbrainz.org/ws/2/artist/`
- **Method**: `GET`
- **Headers**:
  - `User-Agent`: `BreakoutRadar/4.2.1 (contact@breakoutradar.internal)`
- **Payload**:
  Retrieves canonical MBID, disambiguation tags, country of origin, and associated Release Groups to verify legal entity disambiguation.

## 2. Client-Side Service Contracts

### 2.1 Web Audio MIR Extraction (`audioAnalysisService.ts`)
```typescript
interface DecodedAudioAnalysis {
  durationSeconds: number;
  sampleRate: number;
  numberOfChannels: number;
  rmsLoudnessDb: number;
  peakDb: number;
  dynamicRangeDb: number;
  hasClipping: boolean;
  clippingSampleCount: number;
  zeroCrossingRate: number;
  spectralCentroidHz: number;
  estimatedPitchF0Hz: number | null;
  pitchCentsDeviation: number | null;
  intonationStabilityPercent: number;
  estimatedBpm: number;
  waveformPeaks: number[];
  analysisEngineVersion: string;
  isRealAudioDecoded: boolean;
  confidenceScore: number;
}
```

### 2.2 AVM Formulation Engine (`avmEngine.ts`)
```typescript
function computeTrackAVM(
  song: RealSong,
  manualScores?: Partial<AVMPillarSubScores>,
  customWeights?: AVMWeightsConfig,
  options?: { genreProfile?: string; requireValidEvidence?: boolean }
): TrackAVMRecord;
```

### 2.3 Master Audio Ingestion Validation (`audioIngestionService.ts`)
```typescript
function validateAudioFileProperties(
  params: AudioIngestionParams
): AudioIngestionValidation;
```
Enforces technical audio constraints:
- Sample rate: $\ge 44,100\text{ Hz}$
- Bit depth: $\ge 16\text{-bit}$ (24-bit studio master preferred)
- Integrated Loudness: Target $-14.0\text{ LUFS} \pm 2\text{ LUFS}$
- True-Peak Ceiling: $\le -1.0\text{ dBFS}$
- Chain of Title: Affirmation of 100% master ownership and publishing split sheets
