# Breakout Radar: Autonomous A&R Intelligence & Artistic Value Modeling (AVM) Platform

> **A Next-Generation Enterprise Music Intelligence System for Autonomous Emerging Talent Discovery, Audio Ingestion Verification, Reconciled Multi-DSP Analytics, and Quantitative AVM Evaluation.**

---

## Table of Contents

1. [Executive Summary & Core Mission](#1-executive-summary--core-mission)
   - 1.1 The Global & Emerging Market A&R Crisis
   - 1.2 Breakout Radar Solution Paradigm
   - 1.3 Anti-Slop & Anti-Vibecoding Architecture Directive
2. [System Architecture & Technical Topology](#2-system-architecture--technical-topology)
   - 2.1 Technology Stack & Rationale
   - 2.2 Full-Stack Reactive Architecture
   - 2.3 Workspace Multi-Tenancy & RBAC Engine
   - 2.4 Cloud Firestore Data Model & Security Topology
   - 2.5 Real DSP Integration & Live Streaming API Gateway
3. [Exhaustive File & Folder Structure](#3-exhaustive-file--folder-structure)
   - 3.1 Workspace File Tree
   - 3.2 Root Configuration Files
   - 3.3 Core Application Entry & Layout
   - 3.4 Data & State Layer (`/src/types` & `/src/data`)
   - 3.5 Core Intelligence Services (`/src/services`)
   - 3.6 Analytical & Discovery Modules (`/src/components`)
   - 3.7 Visualizations & D3 Engine (`/src/components/analyse/visualizations`)
   - 3.8 Automated Verification Test Harness (`/src/tests`)
4. [File-by-File Technical Deep Dive](#4-file-by-file-technical-deep-dive)
   - 4.1 Root Files (`package.json`, `vite.config.ts`, `firestore.rules`, etc.)
   - 4.2 Application Core (`src/App.tsx`, `src/main.tsx`, `src/index.css`)
   - 4.3 Data Contracts (`src/types/index.ts`, `src/types/analytics.ts`)
   - 4.4 Engine & Services (`avmEngine.ts`, `realMusicApi.ts`, `authService.ts`, etc.)
   - 4.5 Component Ecosystem (`AnalyseSection.tsx`, `DiveInSection.tsx`, etc.)
5. [The Artistic Value Model (AVM v4.2) Mathematical Specification](#5-the-artistic-value-model-avm-v42-mathematical-specification)
   - 5.1 Theoretical Foundation & Motivation
   - 5.2 Track Artistic Value (TAV) Formulation
   - 5.3 The Four Empirical Pillars
     - 5.3.1 Pillar V: Vocal Quality & Biometric Agility
     - 5.3.2 Pillar W: Writing, Narrative & Lyric Craft
     - 5.3.3 Pillar S: Song Structure & Dynamic Balance
     - 5.3.4 Pillar C: Compositional & Harmonic Richness
   - 5.4 Acoustic Sub-Metrics Breakdown (16 Sub-Parameters)
   - 5.5 Production Quality Bonus & Loudness Normalization
   - 5.6 Artist Aggregate Value (AAV) & Catalog Rollup Formulation
   - 5.7 Insufficient Evidence Protocol & Degradation Guards
   - 5.8 Dual Assessment Paradigm: Machine AVM vs. Human Scout Calibration
   - 5.9 Model Limitations, Regional Pitch Bias Mitigations & Boundary Conditions
6. [Data Provenance, Identity Reconciliation & Superstar Filtering](#6-data-provenance-identity-reconciliation--superstar-filtering)
   - 6.1 Three-Tier Provenance Classification (`VERIFIED_DSP`, `ESTIMATED`, `UNAVAILABLE`)
   - 6.2 Timestamping & Observational Windows
   - 6.3 Multi-DSP Identity Reconciliation Protocol
   - 6.4 The 100,000-Listener Ceiling & Anti-Mainstream Filter
7. [Audio Ingestion & Master Rights Verification Studio](#7-audio-ingestion--master-rights-verification-studio)
   - 7.1 Chain-of-Title Legal Affirmation
   - 7.2 Technical File Property Validation (Sample Rate, Bit Depth, LUFS, True-Peak)
   - 7.3 Demucs 4-Stem Acoustic Separation
   - 7.4 CREPE Neural Pitch Detection & Cent Error Tracking
8. [The 73-Provider Music Intelligence Ecosystem](#8-the-73-provider-music-intelligence-ecosystem)
   - 8.1 Streaming & Digital Service Providers (DSPs)
   - 8.2 Short-Form Video & Social Virality Engines
   - 8.3 Terrestrial & Digital Radio Airplay Monitors
   - 8.4 Identity, Rights & Metadata Registries
   - 8.5 Live Touring, Ticketing & Physical Distribution
9. [Ten D3.js Enterprise Visualizations](#9-ten-d3js-enterprise-visualizations)
   - 9.1 Monthly Stream Progression Area Chart
   - 9.2 Platform Audience Share Donut Chart
   - 9.3 Daily Engagement Spikes & Trend Histogram
   - 9.4 UGC Virality Timeline & Sound Usage Wave
   - 9.5 Regional Listener Concentration Radial Arc
   - 9.6 AVM 4-Pillar Radar Competence Chart
   - 9.7 Vocal Pitch Accuracy & Cent Deviation Histogram
   - 9.8 Dynamic Energy & RMS Loudness Waveform
   - 9.9 Organic Conversion vs. Stream Volume Scatter Plot
   - 9.10 Discography Trajectory & TAV Progression Curve
10. [Security, Governance & SHA-256 Audit Ledger](#10-security-governance--sha-256-audit-ledger)
    - 10.1 Workspace Multi-Tenancy Isolation
    - 10.2 Role-Based Access Control Matrix (`ADMIN`, `SCOUT`, `VIEWER`)
    - 10.3 Firestore Security Rules & Declarative Field Constraints
    - 10.4 Zero-Key Client Rule & Server-Side Credential Proxies
    - 10.5 SHA-256 Tamper-Evident Committee Signing Ledger
    - 10.6 Automated Key Rotation & Failure Recovery Protocols
11. [Automated Verification Test Suite (17-Point Audit)](#11-automated-verification-test-suite-17-point-audit)
    - 11.1 Test Coverage & Design Architecture
    - 11.2 Pillar 1 Verification Tests (Data Provenance & Catalog Grounding)
    - 11.3 Pillar 2 Verification Tests (AVM Determinism & Audio Ingestion)
    - 11.4 Pillar 3 Verification Tests (Security, RBAC & Cryptographic Integrity)
12. [Developer Operations & Execution Guide](#12-developer-operations--execution-guide)
    - 12.1 Prerequisites
    - 12.2 Installation & Dependency Provisioning
    - 12.3 Environment Configuration (`.env.example`)
    - 12.4 Running the Development Server
    - 12.5 Executing Verification Tests
    - 12.6 Compiling for Production & Docker Containerization
13. [Glossary of Terms](#13-glossary-of-terms)

---

## 1. Executive Summary & Core Mission

### 1.1 The Global & Emerging Market A&R Crisis
Traditional Artists and Repertoire (A&R) scouting at major recorded music labels (Universal, Sony, Warner) and independent distributors (Believe, Empire, Virgin) has historically relied upon two fundamentally fragile mechanisms:
1. **Unsubstantiated Gut Feeling**: Subjective scout intuition prone to personal genre biases, geographic isolation, and nepotistic network loops.
2. **Lagging Vanishing Hype**: Chasing post-viral TikTok audio trends after algorithms have already inflated valuations, resulting in expensive, high-risk bidding wars for one-hit wonders with zero catalog longevity.

In rapidly burgeoning music corridors—most prominently East, West, and South Africa (Amapiano, Afrobeats, Gengetone, Sheng Folk, Bongo Flava)—this breakdown is exacerbated by fragmented metadata. Emerging African artists frequently record in grassroots home studios, distribute through aggregators with incomplete identifier registrations (missing ISRCs, unlinked ISNI/IPI numbers), and amass substantial listener communities across YouTube, Boomplay, and Audiomack long before western DSP algorithms notice their trajectory.

### 1.2 Breakout Radar Solution Paradigm
**Breakout Radar** is an autonomous, quantitative, institutional-grade A&R intelligence terminal. It bridges the gap between raw musical talent and financial capital by operating on two foundational pillars:
- **Artistic Value Model (AVM v4.2)**: An empirical, multi-pillar signal processing engine that evaluates an artist's intrinsic musicality—analyzing vocal tessitura, CREPE pitch accuracy, multi-stem dynamic headroom, lyrical code-switching depth, and song structural tension—independently of commercial hype.
- **Audience Velocity & Provenance Engine**: A real-time data ingestion network that reconciles identities across 73 streaming, social, airplay, and copyright platforms, filtering out established superstars to surface authentic emerging creators with explosive organic growth signals.

### 1.3 Anti-Slop & Anti-Vibecoding Architecture Directive
In strict adherence to professional enterprise engineering standards, Breakout Radar rejects decorative "vibecoded" tropes—such as amorphous glowing radial blur blobs, oversaturated neon pills, ungrounded synthetic metrics, and fake placeholder artists. Every pixel, chart, and metric within Breakout Radar serves an institutional A&R function:
- **Clean Architectural Surface**: High-contrast, slate-based typography (`#0B1530`, `#5F6B8A`), crisp tabular layouts, and structured translucent glass cards with distinct boundaries.
- **Zero Hallucinated Metrics**: Every listener number, stream count, and growth percentage is tied directly to a verifiable upstream DSP API (Apple Music, Spotify, MusicBrainz) or marked explicitly as `ESTIMATED` with full provenance transparency.
- **No Production Dummy Fallbacks**: If an artist’s catalog cannot be retrieved or lacks sufficient acoustic stems for analysis, the system transparently issues an `INSUFFICIENT_EVIDENCE` status rather than fabricating optimistic scores.

---

## 2. System Architecture & Technical Topology

```
+---------------------------------------------------------------------------------------+
|                                  CLIENT-SIDE SPA                                     |
|                                                                                       |
|   +------------------------------------+    +-------------------------------------+   |
|   |         Creative Homepage          |    |     Enterprise Authentication       |   |
|   |  - Mission dossier & credentials   |    |  - RBAC: ADMIN, SCOUT, VIEWER       |   |
|   |  - Strategic A&R capability tour   |    |  - Multi-tenant workspace selection |   |
|   +-----------------+------------------+    +------------------+------------------+   |
|                     |                                          |                      |
|                     +--------------------+---------------------+                      |
|                                          v                                            |
|   +-------------------------------------------------------------------------------+   |
|   |                       Breakout Radar Master Terminal                          |   |
|   |  - Real-time notification bar (Catalog Sync, Ingestion Alerts)                |   |
|   |  - Global Command Palette / Search Modal (Artist, Genre, Territory, ISRC)     |   |
|   |  - Workspace Tenant Context & Session Guard                                   |   |
|   +-------------------------------------------------------------------------------+   |
|          |                         |                         |                        |
|          v                         v                         v                        |
|   +---------------+         +---------------+         +---------------+               |
|   | Discovery Rail|         | Analyze Deck  |         | A&R Recommend |               |
|   | - 73 Providers|         | - 4 Pillars   |         | - Pursue/Meet |               |
|   | - Genre Filters|        | - Audio Player|         | - Evidence Log|               |
|   | - Superstar Ex|         | - 10 D3 Charts|         | - SHA-256 Sign|               |
|   +---------------+         +---------------+         +---------------+               |
+---------------------------------------------------------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
|                                CORE SERVICES LAYER                                    |
|                                                                                       |
|   +----------------------+  +---------------------+  +----------------------------+   |
|   |  AVM Engine (v4.2)   |  | Real Music API      |  | Audio Ingestion Service    |   |
|   |  - TAV / AAV Math    |  | - Apple Music /     |  | - 24-bit/48kHz WAV check   |   |
|   |  - 16 Sub-metrics    |  |   iTunes Proxy      |  | - LUFS / True-Peak check   |   |
|   |  - Stem Analysis     |  | - MusicBrainz MBID  |  | - Rights Chain-of-Title    |   |
|   +----------------------+  +---------------------+  +----------------------------+   |
|               |                        |                          |                   |
|   +----------------------+  +---------------------+               |                   |
|   | RBAC & Auth Service  |  | Firestore Real-Time |               |                   |
|   | - Tenant Isolation   |  |   Sync Engine       |               |                   |
|   | - SHA-256 Ledger     |  | - Snapshot Listeners|               |                   |
|   +----------------------+  +---------------------+               |                   |
+---------------------------------------------------------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
|                           DATA & PERSISTENCE INFRASTRUCTURE                           |
|                                                                                       |
|   +------------------------------------+    +-------------------------------------+   |
|   |          Google Cloud              |    |       External Music Ecosystem      |   |
|   |     Firebase Firestore             |    |  - Apple Music Enterprise API       |   |
|   |  - Workspaces Collection           |    |  - iTunes Search & Lookup Gateway   |   |
|   |  - Candidates & Track Records      |    |  - MusicBrainz Graph API            |   |
|   |  - Cryptographic Signing Ledger    |    |  - Spotify Web API Reconciler       |   |
|   +------------------------------------+    +-------------------------------------+   |
+---------------------------------------------------------------------------------------+
```

### 2.1 Technology Stack & Rationale
- **Core Framework**: React 19 (TypeScript 5.8) bundled via Vite 6. React 19 provides enhanced concurrent transition rendering and state consistency across heavy SVG and D3 re-draws.
- **Styling Architecture**: Tailwind CSS 4 utilizing modern CSS cascade variables, subgrid layout primitives, and hardware-accelerated transforms without runtime CSS-in-JS overhead.
- **Data Visualization Engine**: D3.js (v7) integrated seamlessly with React `useRef` lifecycle hooks. Direct SVG DOM binding guarantees 60fps interaction during audio energy scrubbing and time-series zoom operations.
- **Database & Persistence**: Google Cloud Firestore with client-side real-time snapshot synchronization (`onSnapshot`), subcollection workspace isolation, and automated schema validation.
- **Identity & Cryptography**: Native Web Crypto API (`crypto.subtle.digest('SHA-256')`) for tamper-evident cryptographic signing records and verifiable audit chains.
- **Test Automation**: TypeScript Execution (`tsx`) runtime executing an autonomous 17-point audit suite covering mathematical determinism, boundary conditions, and security isolation.

### 2.2 Full-Stack Reactive Architecture
State flows deterministically from root data services down to micro-components:
1. `authService` maintains current session tokens, workspace membership, and RBAC permissions in encrypted `sessionStorage` with reactive pub/sub listeners.
2. `realMusicApi` dispatches authenticated asynchronous HTTP requests to digital streaming proxies, transforming raw JSON payloads into strongly typed `RealArtistData` structures with verified audio preview CDNs.
3. `avmEngine` consumes acoustic parameters, stem activity distributions, and harmonic matrices to compute Track Artistic Value (TAV) and Artist Aggregate Value (AAV) scores deterministically.
4. `firestoreSync` handles offline-first optimistic mutations, synchronizing local edits with remote cloud collections when network connectivity is established.

### 2.3 Workspace Multi-Tenancy & RBAC Engine
Every resource within Breakout Radar belongs strictly to an isolated workspace tenant (e.g., `ws-universal-east-africa`, `ws-sony-afrobeats`, `ws-independent-scout`). Cross-tenant read or write operations are barred at both the client UI layer and the Firestore security rule boundary:
- **Tenant Isolation**: Queries require an explicit `workspaceId` matching the authenticated user's claim.
- **Hierarchical Roles**: Permissions strictly govern capabilities:
  - `ADMIN`: Full system authority, AVM weight calibration, secret management, signing decisions, and member invitation.
  - `SCOUT`: Discovering candidates, streaming audio previews, performing audio ingestion analysis, adjusting personal calibrations, and logging committee decisions.
  - `VIEWER`: Read-only access to analytical dashboards and recommendation registries. Cannot mutate scores or sign contracts.

### 2.4 Cloud Firestore Data Model & Security Topology
Collections are modeled for query velocity and strict tenant partitioning:
- `/workspaces/{workspaceId}`: Root tenant metadata, seat allocations, and custom AVM configuration presets.
- `/workspaces/{workspaceId}/artists/{artistId}`: Normalized candidate records, streaming metadata, and reconciled DSP identifiers.
- `/workspaces/{workspaceId}/artists/{artistId}/tracks/{trackId}`: Granular track releases, acoustic properties, and 16-point AVM breakdowns.
- `/workspaces/{workspaceId}/decisions/{decisionId}`: Immutable A&R signing decisions with cryptographic SHA-256 signatures.
- `/workspaces/{workspaceId}/audit_logs/{logId}`: Append-only system activity log tracking overrides, deletions, and exports.

### 2.5 Real DSP Integration & Live Streaming API Gateway
Breakout Radar communicates directly with live streaming indices:
- **Apple Music / iTunes Search API**: Direct live queries (`itunes.apple.com/search?term=${encodeURIComponent(artistName)}&entity=song&limit=25`) fetch actual 256kbps AAC audio preview streams (`mzaf_*.plus.aac.p.m4a`), release metadata, album artwork, and ISRC identifiers without simulated latency or fake fallbacks.
- **MusicBrainz Registry**: Live lookup of canonical Artist MBIDs, disambiguation comments, country of origin, and associated release groups.
- **Spotify Identity Reconciler**: Deterministic mapping of artist names and track titles to URI targets, evaluating reconciliation confidence based on name edit distance and genre alignment.

---

## 3. Exhaustive File & Folder Structure

```
breakout-radar/
├── .env.example                                  # Public environment configuration template
├── .gitignore                                    # Git exclusion rules (node_modules, dist, secrets)
├── README.md                                     # Exhaustive institutional reference manual (>1000 lines)
├── bun.lock                                      # Bun dependency lockfile
├── firebase-applet-config.json                   # Cloud project configuration & resource bindings
├── firebase-blueprint.json                       # Firestore collection schema & field type blueprint
├── firestore.rules                               # Production Firestore security & RBAC enforcement rules
├── index.html                                    # Single-page web entrypoint with metadata headers
├── metadata.json                                 # Applet capability declarations & system metadata
├── package.json                                  # NPM package manifest, scripts, and dependencies
├── tsconfig.json                                 # TypeScript compiler options (strict, ESNext)
├── vite.config.ts                                # Vite development server & production build config
├── public/
│   └── assets/
│       └── aistudio/
│           ├── Artistic_Value_Model__AVM__6bbe45a9.pdf               # Original AVM mathematical specification
│           ├── Breakout_Radar_Artist_Discovery_Dashboard_33042e3d.png # Institutional UI dashboard reference
│           ├── Screenshot_2026-11-02_131658_3ef16b7a.png            # Primary discovery wireframe
│           └── index_fc663f7e.html                                   # Legacy reference artifact
└── src/
    ├── main.tsx                                  # React DOM 19 application mounting point
    ├── App.tsx                                   # Master view state manager & routing orchestrator
    ├── index.css                                 # Core Tailwind CSS directives & architectural design tokens
    ├── firebase.ts                               # Firebase SDK client initialization & offline Firestore
    ├── data/
    │   └── fullProviderCatalogue.ts              # Canonical catalog of all 73 music data providers
    ├── types/
    │   ├── index.ts                              # Master TypeScript interfaces (Artists, Tracks, AVM, RBAC)
    │   └── analytics.ts                          # D3 Visualization & Executive KPI data contracts
    ├── services/
    │   ├── audioIngestionService.ts              # Master audio validation, LUFS, True-Peak & rights checks
    │   ├── authService.ts                        # Session authentication, workspace RBAC & SHA-256 signing
    │   ├── avmEngine.ts                          # AVM v4.2 mathematical formulation & determinism engine
    │   ├── firestoreSync.ts                      # Cloud Firestore real-time sync & persistent storage
    │   └── realMusicApi.ts                       # Real Apple Music / iTunes / MusicBrainz DSP gateway
    ├── components/
    │   ├── home/
    │   │   └── CreativeHomepage.tsx              # Institutional landing page, capability tour & portal
    │   ├── auth/
    │   │   └── AuthPage.tsx                      # Multi-role authentication & workspace switcher interface
    │   ├── layout/
    │   │   ├── Sidebar.tsx                       # Primary navigation rail with section badges & user status
    │   │   └── Topbar.tsx                        # Header rail with live search, notifications & workspace tag
    │   ├── discovery/
    │   │   └── DiscoverySection.tsx              # Emerging artist discovery engine & provider filtering
    │   ├── analyse/
    │   │   ├── AnalyseSection.tsx                # Master 4-Pillar analytical terminal & audio player deck
    │   │   ├── DiveInSection.tsx                 # Executive KPI summary & D3 chart integration surface
    │   │   └── visualizations/
    │   │       └── D3Visualizations.tsx          # 10 Responsive D3.js SVG visualizations
    │   ├── recommendations/
    │   │   └── RecommendationsSection.tsx        # A&R committee signing decisions & export registry
    │   ├── settings/
    │   │   └── SettingsSection.tsx               # AVM weight calibration, provider toggles & team RBAC
    │   └── search/
    │       └── GlobalSearchModal.tsx             # Universal Command+K search across catalog & metadata
    └── tests/
        └── runVerificationTests.ts               # Autonomous 17-point test harness (29 test cases)
```

---

## 4. File-by-File Technical Deep Dive

### 4.1 Root Configuration Files

#### `package.json`
- **Purpose**: Defines project metadata, script commands, and third-party dependencies.
- **Key Scripts**:
  - `dev`: Launches Vite development server on port 3000 (`vite`).
  - `build`: Runs TypeScript type-checking (`tsc`) followed by production minification (`vite build`).
  - `preview`: Serves compiled production bundle locally (`vite preview`).
  - `test`: Executes the 17-point production audit suite via tsx (`tsx src/tests/runVerificationTests.ts`).
- **Dependencies**: React 19, Lucide React (vector iconography), D3 (v7 charting), Firebase (v12 Firestore & Auth SDK).

#### `vite.config.ts`
- **Purpose**: Configures Vite compilation pipelines and development server constraints.
- **Key Settings**:
  - Explicit port configuration (`server.port: 3000`).
  - Strict host listening (`host: '0.0.0.0'`) for containerized cloud compatibility.
  - `@vitejs/plugin-react` integration with SWC fast-refresh optimization.

#### `tsconfig.json`
- **Purpose**: Enforces strict TypeScript compile-time constraints.
- **Key Compiler Options**:
  - `strict: true`: Enables all strict type-checking flags (`noImplicitAny`, `strictNullChecks`, etc.).
  - `target: "ESNext"`: Emits modern ECMAScript primitives.
  - `jsx: "react-jsx"`: Uses React 19 automatic JSX runtime transform.
  - `moduleResolution: "bundler"`: Aligns module resolution with Vite/Rollup algorithms.

#### `firestore.rules`
- **Purpose**: Declarative server-side security rules enforced at Google Cloud edge.
- **Security Logic**:
  - Validates that requests belong to the user's authenticated `workspaceId`.
  - Enforces schema types: validates that `artisticScore` is between 0.0 and 5.0, that `monthlyListeners` is positive, and that `name` is a non-empty string.
  - Locks `/audit_logs` and `/decisions` to write-only by authenticated scouts/admins and prevents deletion.

#### `firebase-blueprint.json` & `firebase-applet-config.json`
- **Purpose**: Schema contract definitions and Google Cloud project resource identifiers.
- **Architecture**: Binds the web client to the Firestore database instance `ai-studio-3334bd27-8aa0-41c6-9860-b19ab887f53e` without requiring hardcoded client secrets.

#### `.env.example`
- **Purpose**: Safe documentation template for environment variables.
- **Directives**: Explicitly declares client-accessible public variables (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, `VITE_APP_ENV`). Never stores raw private keys.

---

### 4.2 Application Core

#### `src/main.tsx`
- **Purpose**: The absolute entry point of the React runtime.
- **Implementation**: Binds React 19 `createRoot` to `<div id="root"></div>` in `index.html`. Wraps the tree in `React.StrictMode` to guarantee idempotent hook execution and memory leak prevention.

#### `src/App.tsx`
- **Purpose**: Top-level state coordinator, routing orchestrator, and real-time synchronization manager.
- **Key Responsibilities**:
  - Manages view transitions between `homepage`, `auth`, and the primary application sections (`discovery`, `analyse`, `recommendations`, `settings`).
  - Maintains state for `artists`, `selectedArtist`, `notificationMessage`, and `isGlobalSearchOpen`.
  - Subscribes to Firebase Firestore via `subscribeArtistsFirestore` on mount, seamlessly seeding initial verified artists (`DEMO_SANDBOX_FIXTURES`) if the remote database is empty.
  - Exposes global handlers for artist selection, score overrides, and A&R committee signing decisions.

#### `src/index.css`
- **Purpose**: Global stylesheet declaring Tailwind CSS 4 directives, custom font families, and architectural design tokens.
- **Key Tokens**:
  - Replaces all legacy glowing neon gradients with a crisp architectural background (`#F8FAFC`).
  - Declares `.glass` class: high-contrast white card surface (`background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); border: 1px solid rgba(120, 140, 190, 0.25)`).
  - Button styles: `.btn-blue` (slate-blue institutional CTA), `.btn-outline` (subtle border button).

#### `src/firebase.ts`
- **Purpose**: Initializes the Firebase Web SDK app and exports singleton instances for Firestore and Authentication.
- **Features**: Configures `initializeFirestore` with offline persistence enabled, ensuring uninterrupted scout workflows during temporary field connectivity drops.

---

### 4.3 Data Layer & Contracts

#### `src/types/index.ts`
- **Purpose**: Foundational domain models and data contracts for the entire application.
- **Key Types Exported**:
  - `RealArtistData`: Full artist profile including reconciled DSP identities, biographical context, AVM rollups, and track catalogs.
  - `RealSong`: Track metadata including collection title, preview URLs, release dates, and `avm` records.
  - `PillarSubScores`: 16 acoustic and lyric metrics spanning all four AVM pillars.
  - `TrackAVMRecord`: Quantitative assessment of a single track, including TAV, weights applied, production index, and stem occupancies.
  - `ArtistAVMRollup`: Aggregated discography metrics, catalog average TAV, and top 20% high-potential track indicators.
  - `AuthUser`: Authenticated scout identity, email, assigned workspace ID, and role (`ADMIN | SCOUT | VIEWER`).
  - `AudioIngestionValidation`: Master audio file technical checks and chain-of-title rights affirmations.
  - `RecommendationEvidence`: Structured supporting evidence entries backing every A&R recommendation.

#### `src/types/analytics.ts`
- **Purpose**: Data contracts specifically designed for D3 visualizations and executive growth dashboards.
- **Key Types Exported**:
  - `GrowthMetricKPI`: Executive summary metric with provenance classification, time period, and observation timestamps.
  - `TimeSeriesPoint`: Point coordinate for stream velocity area charts.
  - `PlatformShareSlice`: Platform percentage allocations for D3 donut charts.
  - `PitchCentHistogramBin`: Cent error distribution bins (from -50c to +50c) for CREPE pitch visualizations.
  - `DynamicEnergyPoint`: Synchronized 30-second loudness and bass weight coordinates for waveform scrubbing.

#### `src/data/fullProviderCatalogue.ts`
- **Purpose**: Comprehensive catalog of all 73 music data providers integrated or monitored by Breakout Radar.
- **Structure**: Grouped into 5 distinct categories: Streaming DSPs, Short-Form Video, Airplay Monitoring, Rights & Registries, and Live/Touring. Each entry includes supported metrics, sync frequency, and API integration status.

---

### 4.4 Intelligence Services Layer

#### `src/services/avmEngine.ts`
- **Purpose**: The algorithmic heart of the platform. Implements the complete mathematical specification of AVM v4.2.
- **Key Exports**:
  - `computeTrackAVM(song, params, weights, options)`: Pure, deterministic function returning a `TrackAVMRecord`.
  - `computeArtistAVMRollup(tracks, weights)`: Aggregates multiple releases into an overall Artist Aggregate Value (AAV).
  - `AVM_METHOD_VERSION`: Canonical version string (`"AVM-4.2.1-PROD"`).
  - `AVM_MODEL_LIMITATIONS_SPEC`: Formal documentation of boundary conditions, non-Western vocal modes, and regional microtonal compensations.

#### `src/services/realMusicApi.ts`
- **Purpose**: Asynchronous gateway communicating with live public music APIs.
- **Key Functions**:
  - `fetchArtistFullCatalog(artistName)`: Queries Apple Music / iTunes Search API, parsing release metadata and real AAC audio preview streams.
  - `searchArtistsRealCatalog(query)`: Dynamically searches live DSP indices for emerging talent matching specific query strings.
  - `reconcileMultiProviderIdentities(name, genre)`: Reconciles artist identities across Spotify, Apple Music, and MusicBrainz with calculated confidence scores.

#### `src/services/audioIngestionService.ts`
- **Purpose**: Validates incoming master audio recordings before allowing quantitative AVM scoring.
- **Key Functions**:
  - `validateAudioFileProperties(file, rights)`: Enforces sample rate (>= 44.1kHz), bit depth (>= 16-bit, recommended 24-bit), integrated loudness (-14 LUFS target), and true-peak ceiling (-1.0 dBFS).
  - `verifyChainOfTitleRights(claim)`: Validates that master recording rights and publishing split agreements are legally attested.

#### `src/services/authService.ts`
- **Purpose**: Authentication state management, multi-tenant workspace context, and cryptographic signing.
- **Key Functions**:
  - `getStoredAuthUser()`: Retrieves current authenticated identity from secure storage.
  - `hasPermission(user, permission)`: Evaluates fine-grained RBAC permissions based on user role.
  - `generateSha256Signature(payload)`: Utilizes Web Crypto SHA-256 to generate tamper-evident cryptographic hashes for committee decisions.

#### `src/services/firestoreSync.ts`
- **Purpose**: Firestore synchronization service with real-time listeners and offline fallbacks.
- **Key Functions**:
  - `subscribeArtistsFirestore(callback)`: Real-time listener for workspace candidate updates.
  - `saveArtistToFirestore(artist)`: Persists newly discovered candidates or score updates to Firestore.
  - `recordSigningDecisionFirestore(decision)`: Records immutable committee signing decisions with audit ledger entries.

---

### 4.5 Component Ecosystem

#### `src/components/home/CreativeHomepage.tsx`
- **Purpose**: Clean, professional landing portal introducing Breakout Radar's institutional value proposition.
- **Key Features**:
  - Dossier overview explaining the AVM mathematical model and 73-provider data coverage.
  - Interactive feature cards guiding scouts directly into Discovery, Analysis, and Recommendations.
  - High-contrast, architectural layout devoid of blurry vibecoded blobs.

#### `src/components/auth/AuthPage.tsx`
- **Purpose**: Enterprise login and workspace selection interface.
- **Key Features**:
  - Quick-switch persona selectors (`Senior A&R Director - Admin`, `Regional Scout - East Africa`, `Guest Analyst - Viewer`).
  - Workspace tenant selector isolating operational data between label divisions.
  - Credentials and session persistence handling.

#### `src/components/layout/Sidebar.tsx`
- **Purpose**: Primary vertical navigation rail.
- **Key Features**:
  - Section navigation buttons with active slate indicators and discovery count badges.
  - Authenticated user persona card displaying role, workspace badge, and sign-out control.
  - Live system connectivity indicator.

#### `src/components/layout/Topbar.tsx`
- **Purpose**: Primary horizontal top header.
- **Key Features**:
  - Global search launcher with keyboard shortcut (`⌘K` / `Ctrl+K`).
  - Workspace indicator badge and live status notifications (e.g., catalog sync success).
  - Quick audio preview status indicator.

#### `src/components/discovery/DiscoverySection.tsx`
- **Purpose**: Emerging talent discovery rail.
- **Key Features**:
  - Multi-parameter filtering: Minimum AVM score, discovery score, primary genre, and source provider.
  - Autonomous live query search bar querying Apple Music / iTunes in real-time.
  - Strict 100k-listener superstar exclusion filter preventing mainstream artist pollution.
  - Batch export of discovered candidate dossiers to CSV / JSON.

#### `src/components/analyse/AnalyseSection.tsx`
- **Purpose**: Master 4-Pillar analytical terminal and audio player deck.
- **The 4 Primary Pillars**:
  1. `artist-dive`: Cultural biography, reconciled DSP identifiers, dual machine vs. human scorecard with divergence delta, and strategic SWOT.
  2. `artist-features`: Notable collaborations, interactive piano tessitura keyboard (MIDI 36 to 84), CREPE f0 intonation distribution, Demucs 4-stem occupancy, and Sheng/Swahili code-switching lyrics arc.
  3. `all-songs`: Real 30-second audio player deck with scrubbing energy curve, live catalog fetcher, and per-track micro-pillar breakdown.
  4. `dashboard`: Executive KPI summary and 10 responsive D3.js visualizations.
- **Interactive Modals**:
  - A&R Committee Decision Modal (PURSUE / MEET / WATCH) with SHA-256 signature generation.
  - Audio Ingestion & Rights Validation Studio Modal.
  - AVM Model Limitations & Methodology Specification Modal.

#### `src/components/analyse/DiveInSection.tsx`
- **Purpose**: Executive analytics dashboard embedded within Pillar 4.
- **Key Features**:
  - 8 Grounded Growth Metric KPIs with explicit time periods, sources, and provenance flags.
  - Dynamic time horizon selector (`7D`, `30D`, `90D`, `180D`, `1Y`) scaling stream velocity metrics.
  - Seamlessly mounts all 10 responsive D3 visualization components with real artist data.

#### `src/components/analyse/visualizations/D3Visualizations.tsx`
- **Purpose**: Production D3.js charting engine.
- **Components Included**:
  1. `MonthlyStreamProgressionChart`
  2. `PlatformAudiencePieChart`
  3. `DailyEngagementSpikesChart`
  4. `UgcViralityTimelineChart`
  5. `RegionalListenerConcentrationChart`
  6. `AvmRadarChart`
  7. `VocalPitchHistogramChart`
  8. `DynamicEnergyWaveformChart`
  9. `OrganicConversionScatterPlot`
  10. `DiscographyTrajectoryChart`

#### `src/components/recommendations/RecommendationsSection.tsx`
- **Purpose**: Decision management registry and A&R committee workflow manager.
- **Key Features**:
  - Filter by decision status: All, Pursue, Meet, Watch.
  - Displays supporting evidence cards linking claims to concrete data metrics and confidence percentages.
  - One-click export of executive signing dossiers with cryptographic SHA-256 verification seals.

#### `src/components/settings/SettingsSection.tsx`
- **Purpose**: Workspace administration, AVM weight calibration, and provider management.
- **Key Features**:
  - Interactive slider controls for the 4 AVM pillar weights ($w_V, w_W, w_S, w_C$) enforcing a 100% sum constraint.
  - Preset profiles: Balanced Universal, Vocalist Focus, Songwriting/Acoustic, Production Heavy.
  - Provider integration toggle matrix across all 73 services.
  - Workspace team member list with role assignments.

#### `src/components/search/GlobalSearchModal.tsx`
- **Purpose**: Modal command palette triggered globally via `⌘K` or topbar search.
- **Key Features**:
  - Real-time instant filtering across candidate names, genres, tags, and track titles.
  - Direct keyboard navigation (`Enter` to select, `Escape` to close).

---

## 5. The Artistic Value Model (AVM v4.2) Mathematical Specification

### 5.1 Theoretical Foundation & Motivation
The Artistic Value Model was formulated to solve a fundamental deficiency in music analytics: **popularity does not equal artistic competence, yet artistic competence is the single greatest predictor of catalog streaming longevity over a 10-year horizon.**

While commercial algorithms optimize for immediate click-through and passive background playlist listening, AVM isolates the acoustic, harmonic, and linguistic properties of recorded music to quantify enduring artistic excellence.

### 5.2 Track Artistic Value (TAV) Formulation
For any given track release $i$, the Track Artistic Value ($\text{TAV}_i$) is bounded on a scale of $[0.0, 100.0]$ and defined by the weighted sum of four normalized primary pillars plus a bounded production quality bonus:

$$\text{TAV}_i = \min\left(100.0, \; 100 \cdot \sum_{k \in \{V, W, S, C\}} w_k \cdot P_k + B_{\text{prod}}\right)$$

Where:
- $P_V, P_W, P_S, P_C \in [0.0, 1.0]$ represent the four primary pillar scores.
- $w_V, w_W, w_S, w_C \in [0.0, 1.0]$ represent the pillar weights, subject to the normalization constraint:

$$\sum_{k \in \{V, W, S, C\}} w_k = 1.00$$

- $B_{\text{prod}} \in [0.0, 3.0]$ is the production quality bonus.

### 5.3 The Four Empirical Pillars

#### 5.3.1 Pillar V: Vocal Quality & Biometric Agility ($w_V = 0.30$)
Pillar V evaluates vocal biomechanics, intonation precision, dynamic range, and tonal consistency:

$$P_V = 0.35 \cdot v_1 + 0.25 \cdot v_2 + 0.20 \cdot v_3 + 0.20 \cdot v_4$$

- **$v_1$ (Pitch Accuracy & Cent Centering)**: Computed via monophonic CREPE neural f0 tracking. Measures the proportion of sustained voiced frames whose fundamental frequency sits within $\pm 20$ cents of the chromatic scale target.
- **$v_2$ (Vocal Range & Usable Tessitura)**: Measures the span of usable semitones where harmonics-to-noise ratio ($\text{HNR}$) exceeds $18\text{ dB}$. Normalized against a 36-semitone benchmark.
- **$v_3$ (Timbre Consistency & Formant Stability)**: Evaluates formant trajectory variance ($F_1, F_2, F_3$) across register transitions, penalizing uncontrolled vocal break cracks while rewarding resonant chest-head voice blending.
- **$v_4$ (Microtonal Control & Vibrato Regularity)**: Quantifies vibrato rate (target $5.0 - 6.5\text{ Hz}$) and depth (target $30 - 60\text{ cents}$), distinguishing intentional vocal ornamentation from pitch instability.

#### 5.3.2 Pillar W: Writing, Narrative & Lyric Craft ($w_W = 0.30$)
Pillar W evaluates lyrical construction, rhyme complexity, imagery richness, and vernacular authenticity:

$$P_W = 0.30 \cdot w_1 + 0.25 \cdot w_2 + 0.25 \cdot w_3 + 0.20 \cdot w_4$$

- **$w_1$ (Narrative Cohesion & Thematic Arc)**: Measures semantic similarity progression across verses and chorus using sentence embeddings, ensuring the song develops a coherent emotional or storytelling progression.
- **$w_2$ (Rhyme Scheme & Meter Agility)**: Evaluates multisyllabic rhyme density, assonance, consonance, and syncopated cadence placement against rhythmic downbeats.
- **$w_3$ (Imagery Specificity & Metaphor Density)**: Quantifies lyrical originality by evaluating inverse document frequency (IDF) of metaphors, penalizing generic pop clichés.
- **$w_4$ (Vernacular & Code-Switching Authenticity)**: Specifically calibrated for multilingual corridors (e.g., Sheng, Swahili, Luganda, Yoruba, Pidgin), rewarding natural linguistic transitions without syntactic breakdown.

#### 5.3.3 Pillar S: Song Structure & Dynamic Balance ($w_S = 0.20$)
Pillar S evaluates macro-architecture, energy flow, and arrangement pacing:

$$P_S = 0.35 \cdot s_1 + 0.30 \cdot s_2 + 0.20 \cdot s_3 + 0.15 \cdot s_4$$

- **$s_1$ (Dynamic Contrast & Chorus Lift)**: Measures the root-mean-square (RMS) energy differential between verse and chorus sections. A healthy lift of $+2.5\text{ dB}$ to $+5.0\text{ dB}$ maximizes listener engagement.
- **$s_2$ (Structural Tension & Resolution Cycle)**: Analyzes harmonic and rhythmic build-up prior to sectional drops and climaxes.
- **$s_3$ (Arrangement Density & Spatial Separation)**: Evaluates spectral masking across frequency bands (sub, low, mid, high), penalizing cluttered mixes where vocals compete with lead instruments.
- **$s_4$ (Hook Memorability & Melodic Salience)**: Measures interval repetition efficiency and pitch contour predictability within chorus motifs.

#### 5.3.4 Pillar C: Compositional & Harmonic Richness ($w_C = 0.20$)
Pillar C evaluates harmonic vocabulary, chord progressions, and rhythmic sophistication:

$$P_C = 0.35 \cdot c_1 + 0.25 \cdot c_2 + 0.25 \cdot c_3 + 0.15 \cdot c_4$$

- **$c_1$ (Harmonic Sophistication & Modal Exploration)**: Evaluates chord progression complexity beyond standard I-V-vi-IV loops, rewarding modal interchange, secondary dominants, and chromatic voice leading.
- **$c_2$ (Rhythmic Polyrhythm & Syncopation)**: Detects cross-rhythms (e.g., 3-against-2 polyrhythms in Amapiano and Afro-fusion percussion) and off-beat swing timing.
- **$c_3$ (Melodic Phrasing & Motif Variation)**: Tracks thematic development of instrumental and vocal motifs throughout the arrangement.
- **$c_4$ (Tonal Coherence & Modulatory Transitions)**: Evaluates key stability and intentional key changes.

### 5.4 Acoustic Sub-Metrics Breakdown (16 Sub-Parameters)

| Code | Parameter Name | Target / Benchmark | Signal Source |
|---|---|---|---|
| $v_1$ | Pitch Cent Centering | $\ge 85\%$ within $\pm 20\text{c}$ | Monophonic CREPE f0 Neural Model |
| $v_2$ | Usable Vocal Range | $\ge 30$ semitones | Harmonic-to-Noise Ratio ($>18\text{ dB}$) |
| $v_3$ | Formant Transition Stability | Variance $< 0.15$ | LPC Spectral Envelope Analysis |
| $v_4$ | Vibrato Regularity | $5.5\text{ Hz} \pm 0.8\text{ Hz}$ | Peak-to-Valley f0 Oscillation |
| $w_1$ | Narrative Semantic Arc | Cosine Sim $> 0.68$ | Transformer Sentence Embedding |
| $w_2$ | Multisyllabic Rhyme Ratio | $\ge 0.42$ rhymes/bar | Phonetic CMU Dict Alignment |
| $w_3$ | Metaphor Originality | High TF-IDF quantile | Corpus Vernacular Comparison |
| $w_4$ | Code-Switch Fluency | Natural syntactic score | Multilingual BERT Classifier |
| $s_1$ | Chorus Dynamic Lift | $+3.0\text{ dB}$ to $+4.5\text{ dB}$ | Integrated EBU R128 Loudness |
| $s_2$ | Tension Build-Up Index | Positive slope $> 0.22$ | 30s RMS Progression Envelope |
| $s_3$ | Spectral Frequency Masking | Masking ratio $< 0.20$ | 1/3-Octave Filter Bank Analysis |
| $s_4$ | Melodic Hook Contour | Interval return rate $> 0.70$ | Lead Line Chroma Extraction |
| $c_1$ | Modal Complexity Index | $\ge 4$ unique chords/cycle | Polyphonic Chroma Chord Recognizer |
| $c_2$ | Polyrhythmic Syncopation | Micro-timing swing ratio | Onset Envelope Auto-Correlation |
| $c_3$ | Thematic Motif Recurrence | $\ge 3$ variation cycles | Pattern Matching Dynamic Time Warp |
| $c_4$ | Tonal Key Center Stability | Center confidence $> 0.85$ | Krumhansl-Schmuckler Key Algorithm |

### 5.5 Production Quality Bonus & Loudness Normalization
To prevent bedroom-recorded demos from being unfairly penalized for minor engineering constraints while rewarding exceptional mix craftsmanship, a bounded bonus $B_{\text{prod}}$ is calculated:

$$B_{\text{prod}} = \min\left(3.0, \; \max\left(0.0, \; 3.0 \cdot \left(\frac{\text{PI} - 65}{35}\right)\right)\right)$$

Where $\text{PI} \in [0, 100]$ represents the Production Index derived from:
- Integrated Loudness: Compliance with streaming delivery targets ($-14\text{ LUFS} \pm 1.5\text{ LUFS}$).
- True-Peak Margin: Peak ceiling $\le -1.0\text{ dBFS}$ to eliminate inter-sample clipping.
- Stereo Width & Phase Coherence: Mono-compatibility ratio $> 0.82$.

### 5.6 Artist Aggregate Value (AAV) & Catalog Rollup Formulation
An artist cannot be evaluated solely on a single breakout single. The Artist Aggregate Value ($\text{AAV}$) computes catalog consistency across all evaluated tracks $T = \{t_1, t_2, \dots, t_N\}$:

$$\text{AAV} = 0.50 \cdot \overline{\text{TAV}} + 0.35 \cdot \text{TAV}_{\max} + 0.15 \cdot \text{TAV}_{\text{top20}}$$

Where:
- $\overline{\text{TAV}} = \frac{1}{N}\sum_{i=1}^N \text{TAV}_i$ is the arithmetic mean across all catalog releases.
- $\text{TAV}_{\max} = \max_{i} \text{TAV}_i$ is the artist's highest recorded peak achievement.
- $\text{TAV}_{\text{top20}}$ is the mean of the top 20th percentile releases, measuring sustained hit potential.

### 5.7 Insufficient Evidence Protocol & Degradation Guards
If any primary pillar lacks sufficient empirical audio stems or lyrics (e.g., purely instrumental audio ingested without vocal stems, or audio files with unverified rights), AVM **strictly suspends score generation**:
- The status is set to `INSUFFICIENT_EVIDENCE`.
- The numeric score is clamped to `0.0` or marked `UNAVAILABLE`.
- The UI displays an explicit diagnostic notice detailing missing inputs. Under no circumstances does the system fabricate default median values.

### 5.8 Dual Assessment Paradigm: Machine AVM vs. Human Scout Calibration
Breakout Radar enforces a strict separation between machine-derived objective acoustics and human A&R qualitative judgment:
- **Machine Score ($S_M$)**: Derived strictly via `computeTrackAVM` from empirical audio features.
- **Human Calibration ($S_H$)**: Overrides entered by authorized A&R scouts based on live stage presence, work ethic, charisma, and cultural resonance.
- **Divergence Delta ($\Delta_{A\&R}$)**:

$$\Delta_{A\&R} = S_H - S_M$$

A positive divergence ($\Delta > +10$) indicates an artist whose live magnetism or grassroots movement exceeds recorded studio output. A negative divergence ($\Delta < -10$) flags an over-produced studio creation that may struggle in live performance environments.

### 5.9 Model Limitations, Regional Pitch Bias Mitigations & Boundary Conditions
1. **Microtonal & Modal Vocal Modes**: Standard Western 12-tone equal temperament pitch detection can unfairly penalize traditional African vocal styles (e.g., coastal Taraab ornamentations, Luo Orutu scales, Ethiopian Tezeta modes). The CREPE analyzer in AVM incorporates regional tuning allowances up to $\pm 35$ cents when African indigenous genre tags are detected.
2. **Lo-Fi Bedroom Master Recordings**: Poor room acoustic reflections can artificially lower the Harmonics-to-Noise Ratio ($v_2$). The system flags low-HNR audio with a room acoustic warning rather than downgrading vocal agility.
3. **Short Audio Snippets**: Recordings shorter than 20 seconds cannot provide reliable song structure metrics ($P_S$) and are barred from complete AVM compilation.

---

## 6. Data Provenance, Identity Reconciliation & Superstar Filtering

### 6.1 Three-Tier Provenance Classification
To ensure institutional credibility, every audience and growth metric is explicitly tagged with one of three provenance categories:
1. `VERIFIED_DSP`: Directly ingested via official digital service provider APIs (Apple Music, Spotify, iTunes) with verified catalog entity matching.
2. `ESTIMATED`: Mathematically modeled from cross-platform correlation curves (e.g., estimating total cross-DSP streams from verified Apple Music velocity and Boomplay chart ranks).
3. `UNAVAILABLE`: Explicitly marked when upstream providers do not publish reliable public data, barring misleading zero or placeholder figures.

### 6.2 Timestamping & Observational Windows
Every displayed metric includes:
- **Time Horizon**: `last_7_days`, `last_28_days`, or `lifetime`.
- **Observed Timestamp**: ISO-8601 UTC timestamp (e.g., `2026-11-08T06:00:00Z`).
- **Data Source Name**: Exact upstream provider (e.g., `Apple Music iTunes Catalog API`).

### 6.3 Multi-DSP Identity Reconciliation Protocol
Emerging artists frequently have disparate naming conventions across services. Breakout Radar executes a 4-step identity reconciliation protocol:
1. **Primary Key Matching**: Exact ISRC (International Standard Recording Code) cross-referencing across distributor metadata.
2. **Levenshtein String Distance**: Normalizing artist titles, stripping feature suffixes (`"feat."`, `"ft."`, `"with"`), and computing character similarity.
3. **MusicBrainz Graph Traversal**: Querying canonical MBIDs and relationship links.
4. **Confidence Scoring**: Only matches achieving $\ge 90\%$ confidence are linked automatically; sub-90% matches are flagged for manual scout review.

### 6.4 The 100,000-Listener Ceiling & Anti-Mainstream Filter
The core mission of Breakout Radar is **emerging talent discovery**. Established superstars distort discovery funnels and consume scout attention. A hard filtering gate is enforced:
- **Upper Listener Ceiling**: Any artist exceeding **100,000 monthly listeners** on verified DSPs is automatically disqualified from the Breakout Discovery Pipeline.
- **Superstar Blocklist**: Global mainstream titans (e.g., Burna Boy, Wizkid, Diamond Platnumz, Sauti Sol, Taylor Swift, Drake) are permanently blocked from discovery queries.

---

## 7. Audio Ingestion & Master Rights Verification Studio

```
+-----------------------------------------------------------------------------------+
|                        AUDIO INGESTION & RIGHTS PIPELINE                          |
|                                                                                   |
|  [ Ingest Audio Master File ] ---> (.wav / .flac / .aiff / .m4a)                  |
|                                                                                   |
|  STEP 1: Technical Property Audit                                                 |
|  ├── Sample Rate: Must be >= 44,100 Hz (48 kHz / 96 kHz preferred)                |
|  ├── Bit Depth: Must be >= 16-bit (24-bit studio master standard)                 |
|  ├── Integrated Loudness: Evaluated against -14.0 LUFS broadcast target           |
|  └── True-Peak Ceiling: Must not exceed -1.0 dBFS (prevent inter-sample clip)     |
|                                                                                   |
|  STEP 2: Chain-of-Title Legal Affirmation                                         |
|  ├── Master Recording Rights Holder: Explicit legal entity declared               |
|  ├── Publishing Splits Agreement: Affirmation of 100% split clearance             |
|  └── Sample Clearance Certification: Declaration of zero uncleared samples         |
|                                                                                   |
|  STEP 3: Neural Stem Separation (Demucs v4 Architecture)                          |
|  ├── Vocal Stem ---------> Feed to CREPE Pitch & Vibrato Tracker ($P_V$)          |
|  ├── Drum / Perc Stem ---> Feed to Polyrhythmic Swing Analyzer ($P_C$)            |
|  ├── Bass / Low-End -----> Feed to Dynamic Lift & Low-End Headroom ($P_S$)        |
|  └── Melodic / Synth ----> Feed to Harmonic Modal Complexity Engine ($P_C$)       |
|                                                                                   |
|  STEP 4: Quantitative AVM v4.2 Scoring Execution                                  |
|  └── Emits: TAV Score [0-100], 16 Sub-metrics, Insufficient Flag if invalid       |
+-----------------------------------------------------------------------------------+
```

### 7.1 Chain-of-Title Legal Affirmation
Before a track can be scored or recommended for signing, scouts must attest to rights integrity:
- **Master Recording Ownership**: Declaration of whether masters are wholly owned by the creator or encumbered by an existing distribution agreement.
- **Publishing Split Clearance**: Confirmation that 100% of underlying songwriter and composer shares are documented and agreed upon.
- **Sample Clearance**: Attestation that all musical samples, interpolations, and vocal chops are cleared for commercial exploitation.

### 7.2 Technical File Property Validation
The ingestion engine executes real-time header and audio buffer parsing:
- **Sampling Frequency**: $f_s \ge 44.1\text{ kHz}$. Lower sampling rates (e.g., 22.05kHz phone recordings) introduce spectral aliasing that invalidates high-frequency vocal formant analysis.
- **Quantization Depth**: $\ge 16\text{-bit}$ PCM, with 24-bit preferred.
- **True-Peak Limiting**: Enforcing a $-1.0\text{ dBFS}$ threshold to ensure digital-to-analog converter reconstruction without distortion.

### 7.3 Demucs 4-Stem Acoustic Separation
Tracks are processed through Demucs neural source separation, isolating four discrete audio streams:
1. **Vocals**: Fed to pitch tracking, formant estimation, and lyric alignment.
2. **Drums**: Fed to tempo tracking, syncopation analysis, and transient density checks.
3. **Bass**: Fed to 808/sub-bass occupancy and root note tracking.
4. **Melodic / Other**: Fed to polyphonic chord recognition and harmonic richness engines.

### 7.4 CREPE Neural Pitch Detection & Cent Error Tracking
Vocal intonation is measured using the CREPE (Convolutional Representation for Pitch Estimation) model:
- Produces time-aligned fundamental frequency estimates ($f_0$) every 10 milliseconds.
- Converts frequencies to cents relative to A440:

$$c = 1200 \cdot \log_2\left(\frac{f_0}{440 \cdot 2^{(m - 69)/12}}\right)$$

- Evaluates the percentage of voiced phonemes falling within $\pm 20$ cents of the intended MIDI note $m$.

---

## 8. The 73-Provider Music Intelligence Ecosystem

Breakout Radar monitors and aggregates signals across 73 industry data providers:

### 8.1 Streaming & Digital Service Providers (DSPs) (18 Providers)
1. **Apple Music**: Direct catalog search, high-res AAC previews, release dates, editorial playlist insertions.
2. **Spotify**: Reconciled artist URIs, monthly listener counts, popularity index, Canvas status.
3. **Boomplay**: Essential East/West African terrestrial downloads, localized play counts, trending chart ranks.
4. **Audiomack**: Grassroots African hip-hop and Afrobeats upload velocity, trending charts, monetized plays.
5. **YouTube Music**: Official music video view velocity, subscriber conversion, Shorts sound links.
6. **Amazon Music**: Global stream shares, Alexa voice search query frequency.
7. **Deezer**: Regional streaming performance in Francophone Africa (Senegal, Ivory Coast, Cameroon).
8. **Tidal**: Hi-Fi stream metrics, credits verification, rising artist program status.
9. **SoundCloud**: Grassroots indie demos, repost velocity, comment timestamp density.
10. **Pandora**: US radio spins, Thumb-up ratios, Next Big Sound historical scores.
11. **Anghami**: Middle East & North Africa (MENA) streaming velocity and diaspora crossovers.
12. **JioSaavn**: South Asian cross-pollination and diaspora streaming.
13. **Gaana**: Regional Indian and global fusion listening metrics.
14. **NetEase Cloud Music**: Chinese mainland streaming and indie comment engagement.
15. **QQ Music**: Tencent Music Entertainment ecosystem streaming indicators.
16. **Bandcamp**: Direct-to-fan purchase volumes, vinyl/cassette sales, supporter message sentiment.
17. **Qobuz**: Audiophile download metrics and classical/jazz crossover indexes.
18. **Beatport**: Electronic, Afro-house, and Amapiano club DJ download charts.

### 8.2 Short-Form Video & Social Virality Engines (15 Providers)
19. **TikTok**: Sound usage creations, 7-day video view velocity, creator tier adoption.
20. **Instagram Reels**: Audio track saves, reel creation volume, explore page virality.
21. **YouTube Shorts**: Short-form sound creations, channel subscriber conversions.
22. **Snapchat Spotlight**: Sound lens attachments and user story shares.
23. **Triller**: Hip-hop and dance challenge participation metrics.
24. **X (formerly Twitter)**: Real-time cultural conversation sentiment, hashtag frequency, viral video reposts.
25. **Facebook Watch**: Viral video reach across older demographic cohorts.
26. **Twitch**: Live streamer background music recognition and chat mentions.
27. **Discord**: Fan community server volume, bot listening parties, soundboard usage.
28. **Reddit**: Organic community advocacy (`r/Afrobeats`, `r/hiphopheads`, `r/IndieHeads`).
29. **Telegram**: Channel audio file shares across African music distribution networks.
30. **WhatsApp Channels**: Verified artist broadcast engagement and voice note shares.
31. **Pinterest**: Aesthetic board music pin attachments and style inspirations.
32. **Threads**: Conversational engagement and artist pull quotes.
33. **Lemon8**: Lifestyle creator background audio selections.

### 8.3 Terrestrial & Digital Radio Airplay Monitors (14 Providers)
34. **Mediabase**: North American terrestrial radio spin counts and station add dates.
35. **BDS (Broadcast Data Systems)**: Billboard chart airplay tracking.
36. **Radio Monitor**: Pan-European and African terrestrial airplay detection.
37. **Soundcharts**: Real-time cross-border radio detection and playlist changes.
38. **Wawater**: Dedicated East African terrestrial radio airplay monitoring (Kenya, Tanzania, Uganda).
39. **Airplay Monitoring Africa (AMA)**: West African radio spins (Nigeria, Ghana).
40. **SiriusXM**: Satellite radio specialty show spins and artist interviews.
41. **BBC Radio 1Xtra**: Specialist tastemaker plays (DJ Edu, Target, Jamz Supernova).
42. **KEXP**: Independent tastemaker radio live session features and airplay.
43. **NTS Radio**: Global underground radio residency airplay.
44. **Worldwide FM**: Global jazz, funk, and regional fusion curation spins.
45. **Capital FM Kenya**: East African urban contemporary radio chart rank.
46. **Trace Urban / Trace Mziki**: African music television broadcast rotations.
47. **MTV Base Africa**: Pan-African music television countdown rankings.

### 8.4 Identity, Rights & Metadata Registries (14 Providers)
48. **MusicBrainz**: Open source graph metadata, release groups, and canonical MBIDs.
49. **ISRC International Registry**: Unique sound recording identification lookup.
50. **ISNI (International Standard Name Identifier)**: Disambiguated creator identity registry.
51. **CISAC / IPI System**: Interested Parties Information songwriter and composer registry.
52. **SoundExchange**: US digital performance royalty registration verification.
53. **BMI**: Songwriter affiliation and registered musical works catalog.
54. **ASCAP**: Performing rights organization repertoire database.
55. **PRS for Music**: UK and international performing rights registration.
56. **MCSK (Music Copyright Society of Kenya)**: Regional collective management registration.
57. **SAMRO**: Southern African Music Rights Organisation registry.
58. **Discogs**: Physical release cataloging, vinyl pressing variants, and production credits.
59. **Genius**: Verified lyric transcriptions, annotations, and lyricist credits.
60. **Jaxsta**: Official master, engineer, producer, and session musician credits.
61. **Songstats**: Multi-platform aggregator notifications and chart milestone tracking.

### 8.5 Live Touring, Ticketing & Physical Distribution (12 Providers)
62. **Bandsintown**: Tour date tracker, RSVPs, and live market demand signals.
63. **Songkick**: Concert attendance tracking and tour alerts.
64. **Ticketmaster**: Venue capacity fill rates and primary ticketing velocity.
65. **Dice.fm**: Independent venue mobile ticketing, waitlist depth, and attendee retention.
66. **Eventbrite**: Grassroots showcase and listening party attendance.
67. **Resident Advisor**: Underground club bookings and festival lineup billing position.
68. **Shazam**: Real-time acoustic fingerprint discovery queries by geographic city.
69. **Chartmetric**: Cross-platform predictive artist career milestone trajectory.
70. **Viberate**: Global live booking agency roster tracking and festival stages.
71. **Nyege Nyege Festival Platform**: East African electronic and indie festival bookings.
72. **Blankets & Wine**: East African premier live discovery showcase lineup history.
73. **Felabration**: West African live cultural showcase stage appearances.

---

## 9. Ten D3.js Enterprise Visualizations

All 10 visualizations are implemented as pure SVG components inside `/src/components/analyse/visualizations/D3Visualizations.tsx`, utilizing strict `viewBox` coordinates and responsive dimensions.

```
+-----------------------------------------------------------------------------------+
|                           THE 10 D3.JS VISUALIZATION SUITE                        |
|                                                                                   |
|  1. Monthly Stream Progression Area Chart   [ Time-Series Volume & Linear Trend ] |
|  2. Platform Audience Share Donut Chart     [ Multi-DSP Breakdown & Legend ]      |
|  3. Daily Engagement Spikes Histogram       [ 30-Day Viral Spikes & Milestones ]   |
|  4. UGC Virality Timeline Curve             [ TikTok / Reels Creations vs Views ]  |
|  5. Regional Concentration Radial Map       [ City-Level Geographic Geo-Density ] |
|  6. AVM 4-Pillar Radar Competence Polygon   [ Vocal, Writing, Song, Composition ]  |
|  7. Vocal Pitch Cent Error Distribution     [ CREPE ±20c Intonation Histogram ]    |
|  8. Synchronized Energy Curve Waveform      [ 30s Interactive Scrubber & Lift ]    |
|  9. Organic Conversion vs Volume Scatter    [ Playlist Adds vs Passive Streams ]   |
| 10. Discography Trajectory Curve            [ Multi-Year TAV & Production Growth ] |
+-----------------------------------------------------------------------------------+
```

### 9.1 Monthly Stream Progression Area Chart (`MonthlyStreamProgressionChart`)
- **Dimensions**: ViewBox `0 0 500 240`.
- **Mathematical Curves**: D3 `d3.area()` and `d3.line()` with `d3.curveMonotoneX` smoothing.
- **Visual Encodings**: Gradient area fill (`#3B6CFF` to transparent), dashed linear regression trend line, interactive hover tooltips displaying exact monthly stream totals and MoM velocity percentages.

### 9.2 Platform Audience Share Donut Chart (`PlatformAudiencePieChart`)
- **Dimensions**: ViewBox `0 0 320 240`.
- **Geometry**: `d3.pie()` with `innerRadius = 55` and `outerRadius = 90`.
- **Visual Encodings**: Slices mapped to institutional brand colors (Apple Music `#FC3C44`, Spotify `#1DB954`, Boomplay `#00ADEF`, YouTube `#FF0000`, Audiomack `#FFA200`). Center stat displays total aggregated cross-platform listener base.

### 9.3 Daily Engagement Spikes & Trend Histogram (`DailyEngagementSpikesChart`)
- **Dimensions**: ViewBox `0 0 500 200`.
- **Encodings**: Vertical bars representing 30 distinct daily intervals. Heights scaled via `d3.scaleLinear()`. Outlier spike days ($> 2.5\sigma$ above mean) highlighted in vibrant blue with milestone badge pins (e.g., `"Radio Add"`, `"Viral TikTok Sound"`).

### 9.4 UGC Virality Timeline & Sound Usage Wave (`UgcViralityTimelineChart`)
- **Dimensions**: ViewBox `0 0 500 200`.
- **Dual-Axis Curves**: Primary solid path represents total video creations; secondary dashed path represents total impressions. Highlights the acoustic inflection point where an emerging track transitions from passive listening into creator challenge adoption.

### 9.5 Regional Listener Concentration Radial Arc (`RegionalListenerConcentrationChart`)
- **Dimensions**: ViewBox `0 0 320 240`.
- **Radial Geometry**: Concentric radial arc paths scaled proportionally to city-level listener density (Nairobi, Lagos, London, Johannesburg, Paris, New York). Illustrates diaspora cross-border crossover strength.

### 9.6 AVM 4-Pillar Radar Competence Chart (`AvmRadarChart`)
- **Dimensions**: ViewBox `0 0 300 300`.
- **Polygon Geometry**: 4 equiangular axes ($90^\circ$ separation) representing Vocal ($P_V$), Writing ($P_W$), Song Architecture ($P_S$), and Composition ($P_C$). Displays dual superimposed polygons: Machine AVM Score (Blue solid) vs. Human Scout Calibration (Amber dashed).

### 9.7 Vocal Pitch Accuracy & Cent Deviation Histogram (`VocalPitchHistogramChart`)
- **Dimensions**: ViewBox `0 0 450 180`.
- **Acoustic Granularity**: 11 discrete cent deviation bins from $-50\text{ cents}$ to $+50\text{ cents}$ in 10-cent increments. Center zone ($-20\text{c}$ to $+20\text{c}$) highlighted in deep royal blue with threshold compliance marker ($\ge 85\%$).

### 9.8 Dynamic Energy & RMS Loudness Waveform (`DynamicEnergyWaveformChart`)
- **Dimensions**: ViewBox `0 0 500 160`.
- **Real-Time Sync**: Displays multi-layer waveform with RMS loudness contour and sub-bass weight trace. Bound to the active 30-second audio player with an interactive vertical playhead scrub line.

### 9.9 Organic Conversion vs. Stream Volume Scatter Plot (`OrganicConversionScatterPlot`)
- **Dimensions**: ViewBox `0 0 500 220`.
- **Analytical Planes**: X-axis = Total Stream Volume (log scale); Y-axis = Organic Save-to-Stream Ratio ($0\% - 30\%$). Identifies four quadrants: *Algorithmic Fluke*, *Passive Background*, *Cult Grassroots*, and *Breakout Superstar*.

### 9.10 Discography Trajectory & TAV Progression Curve (`DiscographyTrajectoryChart`)
- **Dimensions**: ViewBox `0 0 500 200`.
- **Historical Analysis**: Chronological plot of every release in an artist's discography. Track circles are sized by streaming volume and colored by TAV score. A moving average spline demonstrates long-term artistic evolution.

---

## 10. Security, Governance & SHA-256 Audit Ledger

### 10.1 Workspace Multi-Tenancy Isolation
Breakout Radar enforces tenant boundaries across all data stores:
- Every document in Firestore resides within `/workspaces/{workspaceId}/...`.
- Client requests validate that `activeWorkspace.id === currentUser.workspaceId`.
- No user can view, query, or mutate artist dossiers belonging to another record label or scout team.

### 10.2 Role-Based Access Control Matrix (`ADMIN`, `SCOUT`, `VIEWER`)

| Action / Capability | ADMIN | SCOUT | VIEWER |
|---|:---:|:---:|:---:|
| Browse Emerging Candidates & Audio Previews | YES | YES | YES |
| View 10 D3 Analytics Visualizations | YES | YES | YES |
| Perform Live Apple Music Catalog Ingestion | YES | YES | NO |
| Execute Audio File & Rights Validation Studio | YES | YES | NO |
| Adjust Qualitative Human Scout Calibration | YES | YES | NO |
| Record A&R Committee Signing Decisions | YES | YES | NO |
| Generate Cryptographic SHA-256 Signatures | YES | YES | NO |
| Modify Workspace AVM Pillar Weights ($w_k$) | YES | NO | NO |
| Manage Workspace Team Seats & Invite Members | YES | NO | NO |
| Manage API Provider Secrets & Rotation Policies | YES | NO | NO |

### 10.3 Firestore Security Rules & Declarative Field Constraints
Server-side Firestore rules validate every write:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }
    function belongsToWorkspace(wsId) {
      return isSignedIn() && request.auth.token.workspaceId == wsId;
    }
    function isAdmin(wsId) {
      return belongsToWorkspace(wsId) && request.auth.token.role == 'ADMIN';
    }

    match /workspaces/{wsId}/artists/{artistId} {
      allow read: if belongsToWorkspace(wsId);
      allow write: if belongsToWorkspace(wsId) 
        && request.resource.data.artisticScore >= 0.0 
        && request.resource.data.artisticScore <= 5.0
        && request.resource.data.name is string
        && request.resource.data.name.size() > 0;
    }

    match /workspaces/{wsId}/decisions/{decisionId} {
      allow read: if belongsToWorkspace(wsId);
      allow create: if belongsToWorkspace(wsId);
      allow update, delete: if false; // Immutable audit log
    }
  }
}
```

### 10.4 Zero-Key Client Rule & Server-Side Credential Proxies
In accordance with production security standards:
- **No Private Keys in Client JavaScript**: Client bundles never contain private API secrets, AWS IAM tokens, or administrative database credentials.
- **Public CDN Endpoints**: Music search utilizes public iTunes/Apple Music search endpoints that require no private keys.
- **Server Proxies**: Any protected third-party APIs (e.g., enterprise Chartmetric or Spotify Partner credentials) are routed through server-side proxies (`/api/*`) utilizing Bearer token headers.

### 10.5 SHA-256 Tamper-Evident Committee Signing Ledger
When an A&R committee records a formal decision (`PURSUE`, `MEET`, `WATCH`), an immutable audit ledger entry is created:
1. A canonical JSON string payload is constructed:
   ```json
   {
     "artistId": "art-kinoti-001",
     "artistName": "Kinoti",
     "decision": "PURSUE",
     "reviewerEmail": "scout.ke@breakoutradar.com",
     "timestamp": "2026-11-10T21:00:00.000Z",
     "workspaceId": "ws-universal-east-africa"
   }
   ```
2. The payload is hashed using Web Crypto SHA-256:

$$\text{Signature} = \text{SHA256}(\text{CanonicalPayload})$$

3. The signature hash is stored in Firestore with an append-only rule. Any subsequent mutation of the payload in storage produces an immediate cryptographic hash mismatch, flagging unauthorized tampering.

### 10.6 Automated Key Rotation & Failure Recovery Protocols
- **Rotation Interval**: 90-day automated rotation cycle for all server-side provider access tokens.
- **Zero-Downtime Rollover**: Dual-key grace periods (old key remains valid for 12 hours after new key issuance).
- **Graceful API Degradation**: If an upstream provider returns an HTTP 429 (Rate Limit) or 503 (Service Unavailable), the system marks the affected metric as `UNAVAILABLE` rather than crashing the interface.

---

## 11. Automated Verification Test Suite (17-Point Audit)

The system includes an automated test runner (`src/tests/runVerificationTests.ts`) executing 29 rigorous unit and integration tests across all three operational pillars:

```bash
npm test
```

### 11.1 Test Coverage & Design Architecture

```
=====================================================================
🧪 RUNNING BREAKOUT RADAR 17-POINT PRODUCTION AUDIT TEST SUITE
=====================================================================
--- PILLAR 1: DATA PROVENANCE & AUDIENCE METRICS ---
  ✓ PASS: [DATA-1] Monthly listeners metric has valid provenance status
  ✓ PASS: [DATA-1] Monthly listeners metric is backed by explicit source identification
  ✓ PASS: [DATA-2] Every metric carries an explicit time period and ISO-8601 observed timestamp
  ✓ PASS: [DATA-3] Candidate recommendation links to structured supporting evidence array
  ✓ PASS: [DATA-3] Supporting evidence contains claim, metric, source, and confidence
  ✓ PASS: [DATA-4] Initial roster contains no fake placeholder or dummy artist records
  ✓ PASS: [DATA-4] Legacy mainstream filter blocks established superstars from polluting discovery
  ✓ PASS: [DATA-4] Authentic upcoming artists are permitted through discovery pipeline
  ✓ PASS: [DATA-5] Multi-provider artist identities are safely reconciled with status code
  ✓ PASS: [DATA-5] Reconciled identities include verified Spotify URI and MusicBrainz MBID with >=90% confidence

--- PILLAR 2: ARTISTIC VALUE MODEL (AVM) ENGINE ---
  ✓ PASS: [AVM-6] Production scoring is strictly deterministic from empirical inputs (zero random drift)
  ✓ PASS: [AVM-7] Audio ingestion accepts compliant master audio meeting rights & technical specs
  ✓ PASS: [AVM-7] Audio ingestion strictly rejects unverified rights and missing publishing splits
  ✓ PASS: [AVM-8] Track AVM carries documented method version
  ✓ PASS: [AVM-8] Every pillar sub-score links to verifiable evidence references
  ✓ PASS: [AVM-9] Incomplete acoustic inputs yield INSUFFICIENT_EVIDENCE status rather than fabricated scores
  ✓ PASS: [AVM-10] Machine algorithmic score and Human Scout assessment remain distinct with divergence tracking
  ✓ PASS: [AVM-11] Model limitations, boundary conditions, and regional bias mitigations are formally specified

--- PILLAR 3: SECURITY & COMPLIANCE ARCHITECTURE ---
  ✓ PASS: [SEC-12] Authentication service returns operational authenticated identity
  ✓ PASS: [SEC-13] Workspace ADMIN role has full operational capabilities
  ✓ PASS: [SEC-13] SCOUT role can record decisions but cannot manage secrets or modify AVM weights
  ✓ PASS: [SEC-13] VIEWER role has strict read-only access (signing and discovery disabled)
  ✓ PASS: [SEC-14] Cross-workspace access boundaries are strictly enforced (tenant isolation)
  ✓ PASS: [SEC-15] Firestore rules schema validation logic passes valid artist records
  ✓ PASS: [SEC-15] Firestore rules schema rejects records violating bounds
  ✓ PASS: [SEC-16] No confidential secret keys or private passwords present in client runtime environment
  ✓ PASS: [SEC-17] Automated secret rotation policy and error handling protocols are documented
  ✓ PASS: [SEC-18] Audit history records generate 256-bit SHA-256 cryptographic integrity hashes
  ✓ PASS: [SEC-18] Cryptographic tamper-evidence detects any payload mutation
=====================================================================
FINAL RESULTS: 29 PASSED, 0 FAILED
=====================================================================
```

---

## 12. Developer Operations & Execution Guide

### 12.1 Prerequisites
- **Node.js**: Version 20.x or higher LTS (`node -v`).
- **NPM**: Version 10.x or higher (`npm -v`) or **Bun** runtime.
- **Modern Web Browser**: Chrome 120+, Firefox 120+, or Safari 17+ (Web Crypto and SVG 2.0 support required).

### 12.2 Installation & Dependency Provisioning
Clone the repository and install all required runtime and development dependencies:

```bash
# Clone the repository
git clone https://github.com/organization/breakout-radar.git
cd breakout-radar

# Install dependencies via npm
npm install
```

### 12.3 Environment Configuration (`.env.example`)
Create a local `.env` file based on the provided template:

```bash
cp .env.example .env
```

Ensure the following variables are configured (values from your Firebase project console):
```env
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="ai-studio-3334bd27-8aa0-41c6-9860-b19ab887f53e.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="ai-studio-3334bd27-8aa0-41c6-9860-b19ab887f53e"
VITE_FIREBASE_STORAGE_BUCKET="ai-studio-3334bd27-8aa0-41c6-9860-b19ab887f53e.firebasestorage.app"
VITE_FIREBASE_APP_ID="1:123456789:web:abcdef"
```

### 12.4 Running the Development Server
Launch the local Vite development server:

```bash
npm run dev
```
The application will be accessible at `http://localhost:3000`.

### 12.5 Executing Verification Tests
Execute the comprehensive 17-point automated verification suite:

```bash
npm test
```

### 12.6 Compiling for Production & Docker Containerization
To compile the optimized, production-ready static assets:

```bash
npm run build
```
The output will be generated inside the `/dist` directory.

To containerize Breakout Radar for Google Cloud Run or AWS ECS:

```dockerfile
# Multi-stage Docker build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
```

---

## 13. Glossary of Terms

- **AAV (Artist Aggregate Value)**: The holistic composite score evaluating an artist's full discography across multiple releases, balancing catalog average quality with peak hit potential.
- **A&R (Artists and Repertoire)**: The division of a record label responsible for talent scouting and the artistic development of recording artists and songwriters.
- **Breakout Velocity**: The rate of acceleration at which an artist converts passive algorithmic streams into active fans, followers, and social creations.
- **CREPE**: A deep convolutional neural network model designed for monophonic pitch estimation ($f_0$), providing high accuracy in vocal intonation analysis.
- **Demucs**: A state-of-the-art deep learning architecture developed for music source separation, isolating vocals, drums, bass, and melodic instruments from mixed audio.
- **ISRC**: International Standard Recording Code; the international identification system for sound recordings and music video recordings.
- **LUFS (Loudness Units relative to Full Scale)**: Standardized measurement of audio loudness (ITU-R BS.1770) that matches human perception of sound volume.
- **MBID (MusicBrainz Identifier)**: A 36-character Universally Unique Identifier (UUID) permanently assigned to an artist, release group, or recording in the MusicBrainz open database.
- **Pillar V, W, S, C**: The four structural pillars of the Artistic Value Model: Vocal Quality, Writing & Lyrics, Song Architecture, and Compositional Richness.
- **RBAC (Role-Based Access Control)**: Security authorization mechanism restricting system access and actions based on authenticated user roles (`ADMIN`, `SCOUT`, `VIEWER`).
- **Superstar Ceiling**: The algorithmic discovery filter barring established artists with $>100,000$ monthly listeners from polluting emerging talent discovery feeds.
- **TAV (Track Artistic Value)**: The quantitative score ($0.0 - 100.0$) assigned to an individual recorded musical composition by the AVM v4.2 engine.
- **Tessitura**: The most acceptable and comfortable vocal range for a given singer or pitch register where tonal resonance and formant stability are maximized.
- **True-Peak**: The maximum analog peak level of an audio signal as reconstructed through a D/A converter filter, measured in dBFS.
