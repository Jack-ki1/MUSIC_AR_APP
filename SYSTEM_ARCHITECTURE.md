# System Architecture: Breakout Radar

## 1. Architectural Philosophy & Topological Overview

Breakout Radar is an autonomous, quantitative Artist & Repertoire (A&R) intelligence terminal designed to identify, evaluate, and track emerging musical talent across emerging corridors (with primary focus on Sub-Saharan Africa).

The system rejects superficial "vibecoding" tropes and unverified data generation. Every metric is explicitly classified by provenance, backed by digital streaming providers (Apple Music, Spotify, MusicBrainz) or identified as `ESTIMATED`, and processed through an empirical signal processing pipeline.

```
+---------------------------------------------------------------------------------------+
|                                    CLIENT APPLICATION                                |
|                                                                                       |
|   +-------------------+  +-------------------+  +-------------------+  +-----------+  |
|   |    Dashboard      |  |     Discovery     |  | Artist Intel (MIR)|  |  Pipeline |  |
|   | - Tracked talent  |  | - 100k cap filter |  | - 4 AVM Pillars   |  | - Kanban  |  |
|   | - Provider health |  | - Live DSP search |  | - Web Audio MIR   |  | - 6 stages|  |
|   +-------------------+  +-------------------+  +-------------------+  +-----------+  |
|             |                      |                      |                  |        |
|             +----------------------+----------------------+------------------+        |
|                                            |                                          |
|                                            v                                          |
|   +-------------------------------------------------------------------------------+   |
|   |                            CORE SERVICES LAYER                                |   |
|   |                                                                               |   |
|   |  - avmEngine: Deterministic TAV & AAV formulation with insufficient guard     |   |
|   |  - audioAnalysisService: Client Web Audio API (RMS, Peak, ZCR, Autocorr f0)   |   |
|   |  - audioIngestionService: Master validation (24-bit/48kHz WAV, LUFS headroom) |   |
|   |  - realMusicApi: Apple Music / iTunes live search, MusicBrainz reconciliation |   |
|   |  - authService: 5-role RBAC, 15-user allowlist, zero localStorage secrets     |   |
|   |  - firestoreSync: Offline-first real-time synchronization & SHA-256 ledger    |   |
|   +-------------------------------------------------------------------------------+   |
|                                            |                                          |
+--------------------------------------------+------------------------------------------+
                                             |
                                             v
+---------------------------------------------------------------------------------------+
|                           PERSISTENCE & SECURITY BOUNDARY                             |
|                                                                                       |
|   +-------------------------------------------------------------------------------+   |
|   |  Google Cloud Firestore (ai-studio-3334bd27-8aa0-41c6-9860-b19ab887f53e)       |   |
|   |  - /workspaces/{wsId}/artists: Scoped artist entities & acoustic metrics      |   |
|   |  - /workspaces/{wsId}/decisions: Committee signing recommendations            |   |
|   |  - /workspaces/{wsId}/audit_logs: Append-only immutable SHA-256 event ledger   |   |
|   |  - /workspaces/{wsId}/settings: AVM weights & discovery seed rotations        |   |
|   |  Security Rules: Master Gate, isValidId, isValidArtist, allow update: false   |   |
|   +-------------------------------------------------------------------------------+   |
+---------------------------------------------------------------------------------------+
```

## 2. Component Taxonomy

### 2.1 Presentation Tier
- `ExecutiveDashboard`: High-level operational view displaying real candidate counts, pipeline stage distributions, recent discoveries, and provider network status.
- `DiscoverySection`: Multi-dimensional filtering across 73 music data sources, enforcing the 100,000 monthly listener emerging ceiling.
- `AnalyseSection`: Deep 4-pillar artistic assessment, dual Machine vs. Human evaluation with divergence delta, and Web Audio MIR signal processing.
- `PipelineSection`: Kanban lifecycle management tracking candidates across 6 stages (`DISCOVERED` through `FOLLOW_UP`).
- `RecommendationsSection`: Decision registry linking signing recommendations to structured supporting evidence and SHA-256 signatures.
- `SettingsSection`: Workspace administration, 15-seat allowlist directory, provider connectivity management, and AVM calibration sliders.

### 2.2 Analytical & MIR Processing Tier
- `audioAnalysisService`: Browser-side Web Audio API PCM float decoding (`AudioBuffer`), computing genuine RMS loudness (dBFS), peak dynamics, digital clipping count, zero-crossing rate (ZCR), spectral centroid (Hz), autocorrelation pitch tracking ($f_0$), and tempo approximation (BPM).
- `avmEngine`: Formulates Track Artistic Value ($\text{TAV}$) and Artist Aggregate Value ($\text{AAV}$) with explicit evidence references, versioning (`AVM-4.2.1-PROD`), and `INSUFFICIENT_EVIDENCE` fallback state.

### 2.3 Identity & Security Tier
- `authService`: Enforces 5 distinct roles (`Administrator`, `A&R Lead`, `Analyst`, `Reviewer`, `Read-only`) with granular permission gates. Zero raw secrets in browser storage.
- `firestoreSync`: Implements structured JSON diagnostics via `handleFirestoreError`, SHA-256 tamper-evident integrity digests, and offline persistence.
