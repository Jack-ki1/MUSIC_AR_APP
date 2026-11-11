# Breakout Radar — A&R Intelligence Platform

Breakout Radar is an A&R (Artists & Repertoire) intelligence workspace for discovering emerging music artists, analyzing artistic and market signals, and managing scouting recommendations and decisions. The project combines a **React + TypeScript + Vite frontend** with an independently runnable **Python backend** (stdlib HTTP server + SQLite) focused on data fetching, persistence, and analytics support.

This repository is a prototype/MVP-style implementation: many analytical views are modeled or derived from available signals, and several external provider integrations are implemented as adapters, credential-gated fetches, or documented outlines depending on access/licensing constraints.

---

## Table of Contents

1. [Project Goals](#project-goals)
2. [Current Status](#current-status)
3. [Tech Stack](#tech-stack)
4. [Architecture Overview](#architecture-overview)
5. [Frontend Application](#frontend-application)
   - [Workspace Sections](#workspace-sections)
   - [Discovery](#discovery)
   - [Analyze](#analyze)
   - [Recommendations](#recommendations)
   - [Settings & Operations](#settings--operations)
   - [Global Search](#global-search)
6. [Backend Application](#backend-application)
   - [Server & Runtime](#server--runtime)
   - [API Endpoints](#api-endpoints)
   - [Persistence (SQLite)](#persistence-sqlite)
   - [Provider Registry & Data Fetching (73 Sources)](#provider-registry--data-fetching-73-sources)
   - [AVM / Analytics Logic](#avm--analytics-logic)
7. [Data Flow & Integration Behavior](#data-flow--integration-behavior)
8. [Environment Variables & Configuration](#environment-variables--configuration)
9. [Setup & Installation](#setup--installation)
10. [Running the Project](#running-the-project)
11. [Testing, Linting & Build](#testing-linting--build)
12. [UI/Design Constraints](#uidesign-constraints)
13. [Repository Folder Structure & File Reference](#repository-folder-structure--file-reference)
14. [Key Data Models & Concepts](#key-data-models--concepts)
15. [Limitations & Known Notes](#limitations--known-notes)
16. [Troubleshooting](#troubleshooting)
17. [Security & Secrets](#security--secrets)

---

## Project Goals

- **Discover emerging talent early:** surface candidates from configured regions/genres and provider/search sources with an emphasis on pre-breakout/indie signals.
- **Analyze artistic value:** present an Artistic Value Model (AVM) oriented dossier (vocals, writing, song/structure, composition, production signals, and derived rollups).
- **Support A&R decisions:** track recommendations, record decisions/rationale, and maintain workspace context.
- **Unify data sources:** provide a backend provider registry covering 73 sources with implemented adapters, credential-gated fetch paths, and outlined/manual/licensed entries.
- **Run independently:** allow frontend and backend to run as separate processes, with graceful frontend fallback behavior when backend is unavailable.

---

## Current Status

- **Frontend:** functional multi-section workspace (Discovery, Analyze, Recommendations, Settings) with retractable sidebar and global search.
- **Backend:** runnable Python API server with SQLite persistence, discovery/search support, provider fetch/test endpoints, AVM/analytics helpers, and settings/decision/scan storage.
- **Provider coverage:** 73-source catalogue registered; fetch modes vary (`implemented`, `manual_or_licensed`, `outlined`) depending on public access, credentials, or licensing.
- **Testing:** frontend verification script and backend `unittest` suite exist; TypeScript checks available via `npm run lint`.
- **Maturity:** prototype/MVP. Not all metrics are sourced from production-grade licensed pipelines; some values are modeled, heuristic, or demo-derived where live data is unavailable.

---

## Tech Stack

### Frontend
- **React 19** (`react`, `react-dom`)
- **TypeScript**
- **Vite** (dev server/build tooling)
- **Tailwind CSS v4** (`@tailwindcss/vite`, `tailwindcss`)
- **D3.js** (`d3`, `@types/d3`) for charts/visualizations
- **lucide-react** for icons
- **motion** available in dependencies
- **Firebase** client SDK (optional cloud sync paths)
- **Express/types present** in dependencies/devDependencies (project primarily uses Vite dev server and Python backend)

### Backend
- **Python 3** (stdlib-focused; no required third-party packages declared in `backend/requirements.txt`)
- **`http.server` / `urllib` / `json` / `sqlite3`** for API serving, HTTP fetches, and persistence
- **SQLite** database file (default: `backend/breakout_radar.db`)

### Tooling & Scripts
- `npm` scripts for dev/build/lint/test
- `tsx` for running TypeScript verification script
- `python3 -m unittest` for backend tests

---

## Architecture Overview

### High-level components
1. **Frontend SPA (`src/`)**
   - Renders workspace UI and navigation.
   - Calls backend APIs via `src/services/backendApi.ts`.
   - Maintains local state and localStorage persistence for continuity.
   - Can fall back to client-side discovery/seed logic when backend is unavailable.

2. **Backend API (`backend/`)**
   - Serves JSON endpoints for health, artists, discovery, AVM, analytics, decisions, settings, scans, and provider registry/fetch/test/save.
   - Persists core entities in SQLite.
   - Implements provider fetch adapters and returns structured fetch results/statuses.

3. **External/optional integrations**
   - Public/search APIs used in discovery/fetch flows where implemented (e.g. iTunes/Apple Music search, Deezer, MusicBrainz, Wikipedia/Wikidata, Audius, etc., depending on adapter and credentials).
   - Firebase/Firestore optional sync from frontend when configured.

### Runtime topology (development)
- Frontend dev server: `http://localhost:3000` (`vite --port=3000 --host=0.0.0.0`)
- Backend API server: `http://localhost:8000` (`python3 -m backend.server`)
- Vite proxy: `/api` → `http://localhost:8000` (configurable via `VITE_BACKEND_PROXY_TARGET`)

### Resilience/fallback behavior
- App bootstraps by checking backend health, attempting to load artists/settings from backend, optionally merging Firestore data, and falling back to local seed/cleaned data if needed.
- Discovery prefers backend `/api/discovery/search` and falls back to client-side discovery/search when unavailable or empty.
- Settings/provider operations attempt backend save/test/fetch and degrade gracefully (e.g. local save/toast messaging) when backend is offline.

---

## Frontend Application

### Workspace Sections

Navigation is provided by a retractable sidebar with four primary sections:
- **Discovery** — candidate scouting workspace
- **Analyze** — deep artist/track analysis (AVM/dive-in views)
- **Recommendations** — recommendation/decision workflow views
- **Settings** — provider registry, operations, automation, seeds, scoring, workspace preferences

`src/types/index.ts` defines `WorkspaceSection = 'discovery' | 'analyse' | 'recommendations' | 'settings'`.

### Discovery

`src/components/discovery/DiscoverySection.tsx` implements the redesigned discovery workspace:
- **Headline:** `AFRICA TALENT RADAR: BREAKOUT DISCOVERY COMMAND`
- **KPI cards (6):** includes `TRACKED CANDIDATES` plus view/count/coverage/average metrics derived from current candidate set and filters.
- **Controls row:** loop interval toggle (`30m`, `60m`), next scan countdown, pause/resume loop, scan now, and Africa **Region** selector.
- **Region coverage:** North Africa, West Africa, Central Africa, East Africa, Southern Africa with country lists for filtering.
- **Candidate filters:**
  - Country dropdown populated from selected region (default region **East Africa**)
  - Genre dropdown with 40+ options
  - Stage filter removed
  - “High Potential Gems Only” removed
  - Sort options expanded (12 working sort modes including AAV, Discovery Momentum, 30D Velocity, listeners, releases, name)
- **Candidate presentation:** grid/cards and table views, play preview (where preview URL exists), analyze action.
- **Insights/plots (6, 2 per row) after candidate list:**
  - Origin/Region (candidates by country)
  - Genre mix
  - AAV Score leaders
  - Discovery Momentum leaders
  - 30D Velocity leaders
  - SVG Africa map showing artist locations
- **Scan/discovery behavior:** autonomous loop timer (when active), manual scan trigger, backend-first discovery with fallback.

> Note: Command Centre & Seed Runner, Live Scan Telemetry, and Scan History were moved out of Discovery into Settings.

### Analyze

`src/components/analyse/AnalyseSection.tsx` and `src/components/analyse/DiveInSection.tsx` provide analysis views:
- **Artist selection & dossier header:** artist metadata, recommendation tier/stage context, rollup metrics (AAV/median/P75/consistency/trajectory where available).
- **Track-level inspection:** track selection, preview playback controls, AVM tabs (dive-in, pillar scorecard, vocals/pitch, energy/structure, lyrics/writing, composition/stems, performance, anomaly/organic audit, human scorecard/override depending on implementation state).
- **Dive-in visualizations:** `DiveInSection` composes D3-based charts from `visualizations/D3Visualizations.tsx` (time series, platform share, engagement spikes, radar, histograms, scatter/trajectory, etc.) using artist/analytics data and horizon selectors.
- **Analyze access hardening/fixes:** app auto-selects a default artist when navigating to Analyze with no selection; Analyze/DiveIn components include guards and safe fallbacks for missing artist/track/metric data to reduce render failures.

### Recommendations

`src/components/recommendations/RecommendationsSection.tsx` supports recommendation/decision-oriented workflows:
- Displays artist recommendation context and actions.
- Integrates with backend decisions (`fetchDecisionsFromBackend`) and app-level decision recording (`handleRecordDecision` in `App.tsx` persists to backend/firestore best-effort).
- Provides pathways to navigate into Analyze for selected artists.

### Settings & Operations

`src/components/settings/SettingsSection.tsx` is the operational/configuration hub:
- **Providers (73):** searchable/filterable registry table with enable toggles, fetch mode/status labels, access notes, credential inputs (per provider fields), per-provider “Test fetch”, docs links, and backend registry load state.
- **Command Centre & Seed Runner (moved from Discovery):** preset and custom seed/query execution to discover and ingest candidates (backend-first with fallback), with logs/history updates.
- **Live Scan Telemetry (moved from Discovery):** runtime/log view for scan activity and loop status.
- **Scan History (moved from Discovery):** ledger of scan runs/results.
- **Automation:** loop interval and autonomous toggle controls, quota-related inputs.
- **Seeds:** discovery seed management UI.
- **Scoring:** AVM/scoring weight/profile controls.
- **Workspace:** operator/workspace preference fields.
- **Persistence:** saves provider configs/credentials/settings to localStorage and attempts backend save via provider/settings APIs.

### Global Search

`src/components/search/GlobalSearchModal.tsx` provides cross-workspace artist search/navigation:
- Opened from topbar.
- Filters/selects artists and can navigate to relevant sections (e.g. Analyze).

### Layout & Shell

- **Sidebar:** `src/components/layout/Sidebar.tsx` — retractable/collapsible navigation, candidate count badge, palette styling.
- **Topbar:** `src/components/layout/Topbar.tsx` — search trigger and backend connectivity indicator (`Backend Connected` / local mode semantics).
- **App shell/state:** `src/App.tsx` — section routing, bootstrap/sync, artist selection, discovery ingestion, decision recording, toast feedback, sidebar state.

---

## Backend Application

### Server & Runtime

- Entry point: `backend/server.py`
- Run command: `python3 -m backend.server` (or `python3 backend/server.py`)
- Default bind: `0.0.0.0:8000`
- Environment overrides:
  - `HOST` — bind host
  - `PORT` — bind port
  - `BREAKOUT_RADAR_DB` — SQLite database path
- CORS enabled for API usage from frontend/dev environments.
- Root endpoint returns service metadata/status; `/api/health` reports health.

### API Endpoints

Implemented routes in `backend/server.py` (GET/POST as applicable):

- `GET /` — service info
- `GET /api/health` — health check
- `GET /api/artists/seed` — seed artist payload
- `GET /api/artists` — list artists
- `POST /api/artists` — upsert artists (`{ "artists": [...] }`)
- `GET /api/discovery/search?q=&region=&limit=` — discovery/search results (provider/search-backed with normalization)
- `POST /api/avm/track` — compute/return track AVM data
- `POST /api/avm/artist` — compute/return artist AVM/rollup data
- `GET /api/analytics/timeseries?baseMonthly=&horizon=` — analytics timeseries for charts
- `GET /api/decisions` — list decisions
- `POST /api/decisions` — create/save decision
- `GET /api/settings` — fetch settings
- `POST /api/settings` — save settings
- `GET /api/scans` — list scans
- `POST /api/scans` — save scan record
- `GET /api/providers` — provider registry + stored configs/state
- `GET /api/providers/{id}/outline` — provider outline/details
- `GET|POST /api/providers/fetch?provider=&q=&limit=` — execute provider fetch (with optional payload/credentials/context)
- `POST /api/providers/save` — persist provider enablement/config/credentials
- `POST /api/providers/test` — test provider fetch/connectivity behavior

> Exact request/response fields may evolve; consult `backend/server.py`, `backend/providers.py`, and frontend client usage in `src/services/backendApi.ts`.

### Persistence (SQLite)

`backend/store.py` manages SQLite storage and schema initialization. Core persisted entities include:
- **Artists** (upsert/list, JSON payload storage/normalization patterns)
- **Decisions** (A&R decisions/rationale metadata)
- **Scans** (scan history/telemetry records)
- **Settings** (workspace/discovery configuration payloads)
- **Provider configs** (`provider_configs`) for enabled flags and credential/config data per provider

Database path defaults to `backend/breakout_radar.db` and can be overridden with `BREAKOUT_RADAR_DB`.

### Provider Registry & Data Fetching (73 Sources)

- **Catalogue:** `backend/provider_catalogue.json` defines the 73-source provider registry (IDs, names, categories, access/fetch mode metadata, fields, docs/access notes).
- **Runtime/logic:** `backend/providers.py` loads/normalizes providers and implements fetch dispatch and adapters.
- **Fetch modes:**
  - `implemented` — backend adapter can fetch live/public or key/credential-based data for supported providers
  - `manual_or_licensed` — requires operator feeds/exports or commercial/licensed access (outlined handling rather than automated scraping)
  - `outlined` — access/adapter defined, integration pending
- **Examples of implemented/public or key-based adapters (subject to change):** iTunes/Apple Music search, Deezer, MusicBrainz, Wikipedia, Wikidata, Audius, Last.fm, TheAudioDB, Spotify, YouTube, Discogs, and credential-gated handlers such as Knowledge Graph, Jamendo, SoundCloud, Ticketmaster, Musixmatch (availability depends on credentials/API terms).
- **Frontend integration:** Settings Providers tab lists all 73 sources, shows mode/status/access notes, collects credentials, and supports backend `save`/`test`/`fetch` operations.

### AVM / Analytics Logic

`backend/data.py` contains backend-side logic/helpers for:
- Seed artist data and normalization support
- Discovery candidate shaping and filtering behavior (including mainstream/legacy filtering constraints used by project logic)
- AVM-related computations/rollups and track/artist scoring helpers
- Analytics timeseries generation for frontend charts (`/api/analytics/timeseries`)

Frontend also contains AVM/analytics logic and visualizations:
- `src/services/avmEngine.ts` — client-side AVM computations/types integration
- `src/types/analytics.ts` — analytics data contracts
- `src/components/analyse/visualizations/D3Visualizations.tsx` — D3 chart components

---

## Data Flow & Integration Behavior

### Application bootstrap (`src/App.tsx`)
1. Check backend health (`/api/health`).
2. If backend available: load artists (or seed), load settings, and apply backend state.
3. Attempt Firestore merge/load (best effort, optional).
4. Fall back to cleaned local seed data if needed.
5. Persist key state locally (`localStorage`) and sync selected changes to backend/firestore when available.

### Discovery flow
1. User triggers scan (manual/autonomous loop) or runs seed query.
2. Frontend attempts backend discovery endpoint (`/api/discovery/search`).
3. If backend returns candidates, ingest into app state and persist/sync best effort.
4. If backend unavailable/empty, fallback to client-side discovery/search logic (`src/services/realMusicApi.ts`).
5. Scan/history/telemetry updates are reflected in UI (Discovery insights and/or Settings operations tabs).

### Analyze flow
1. User selects artist (from Discovery/Recommendations/Search/Sidebar navigation).
2. App routes to Analyze and ensures an artist is selected when possible.
3. Analyze/DiveIn components render dossier, track details, and visualizations with guards/fallbacks for missing data.
4. Analytics timeseries may be requested from backend with client fallback behavior where implemented.

### Settings/provider flow
1. Settings loads provider registry from backend (`/api/providers`) when available; merges with local catalogue/cache.
2. User edits enablement/credentials and can test/save providers.
3. Frontend calls backend save/test endpoints and stores local copies for resilience.

---

## Environment Variables & Configuration

### Frontend (`.env` / Vite)

Defined/documented in `.env.example`:
- `VITE_API_BASE_URL` — optional explicit backend base URL (leave empty in dev to use Vite `/api` proxy)
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `GEMINI_API_KEY` (optional, documented)
- `APP_URL` (optional, documented)

### Vite dev/proxy (`vite.config.ts`)
- Dev server: port `3000`, host `0.0.0.0`
- Proxy: `/api` → `process.env.VITE_BACKEND_PROXY_TARGET || 'http://localhost:8000'`
- Plugins: React, Tailwind

### Backend runtime
- `HOST` (default `0.0.0.0`)
- `PORT` (default `8000`)
- `BREAKOUT_RADAR_DB` (SQLite path override)

### Firebase
- `src/firebase.ts` reads `VITE_FIREBASE_*` values (with fallbacks/defaults as implemented).
- `firebase-applet-config.json`, `firebase-blueprint.json`, and `firestore.rules` are included in the repository for Firebase-related configuration/rules scaffolding.

---

## Setup & Installation

### Prerequisites
- **Node.js 18+** and **npm**
- **Python 3.10+** (stdlib sufficient for backend)

### Install dependencies
```bash
npm install
```

### Configure environment
```bash
cp .env.example .env
```
Edit `.env` as needed (backend URL override, Firebase vars, optional keys).

### Optional cleanup
```bash
npm run clean
```
Removes build artifacts and backend cache/db artifacts as defined in `package.json`.

---

## Running the Project

### Development (recommended: two terminals)

**Terminal 1 — Backend**
```bash
npm run dev:backend
# or
python3 -m backend.server
```

**Terminal 2 — Frontend**
```bash
npm run dev
# or
npm run dev:frontend
```

### URLs
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Backend health: `http://localhost:8000/api/health`

### Production build / preview
```bash
npm run build
npm run preview
```

> The backend is a separate Python process and must be run independently if you want live backend APIs/provider fetch/persistence behavior.

---

## Testing, Linting & Build

### Available scripts (`package.json`)
- `npm run dev` — start Vite dev server
- `npm run dev:frontend` — start Vite dev server
- `npm run dev:backend` — start Python backend
- `npm run build` — production build
- `npm run preview` — preview built frontend
- `npm run clean` — remove `dist`, backend cache/db artifacts (per script)
- `npm run lint` — TypeScript no-emit checks (`tsc --noEmit`)
- `npm test` — frontend verification script (`tsx src/tests/runVerificationTests.ts`)
- `npm run test:backend` — backend unit tests (`python3 -m unittest discover -s backend/tests -p 'test_*.py' -v`)
- `npm run test:all` — run frontend and backend tests sequentially

### Notes
- Frontend verification focuses on AVM/filter/data-contract checks implemented in `src/tests/runVerificationTests.ts`.
- Backend tests in `backend/tests/test_backend_logic.py` validate backend logic/helpers.
- Some UI behaviors depend on runtime data, browser APIs (audio playback), and external network availability.

---

## UI/Design Constraints

Recent UI work applies a constrained palette and layout behavior in core shell/workspaces:
- **Primary palette colors:** `#FFFFFF`, `#EF5F18`, `#261A66`, `#824C97`
- **Retractable sidebar:** collapsible navigation with compact mode
- **Discovery/Settings refactor:** discovery content simplified per spec and operational tools moved into Settings

> Palette enforcement may not be fully uniform across every legacy visualization/component (especially some deep analysis charts and older styled sections). Validate visually if strict color consistency is required end-to-end.

---

## Repository Folder Structure & File Reference

> Generated as a practical source/reference map for repository files (excluding runtime-heavy directories like `node_modules/` and `.git/`). Some generated artifacts (e.g. `__pycache__`, local `.db`) may exist locally but are not source-of-truth code.

```text
.
├── .aistudio/
│   └── artifacts/
│       └── brain/
│           └── 3334bd27-8aa0-41c6-9860-b19ab887f53e/
│               ├── .tempmediaStorage/
│               │   ├── media_1793864838566_43b6dbb0.jpg   # Artifact image captured in prior session/environment
│               │   └── media_1793872186357_2e79770d.pdf   # Artifact PDF captured in prior session/environment
│               ├── implementation_plan.md                 # Prior implementation planning artifact
│               └── implementation_plan.md.metadata.json    # Metadata for implementation plan artifact
├── .env                                                   # Local environment variables (not committed secrets by convention; may exist locally)
├── .env.example                                           # Example frontend/backend/Firebase env vars
├── .gitignore                                             # Git ignore rules (includes Python artifacts, backend DB, etc.)
├── README.md                                              # Project documentation (this file)
├── backend/
│   ├── README.md                                          # Backend-specific run/API notes
│   ├── __init__.py                                        # Python package marker for backend module
│   ├── breakout_radar.db                                  # Local SQLite database file (runtime/generated; may contain local state)
│   ├── data.py                                            # Seed data, discovery shaping, AVM/rollup helpers, analytics timeseries logic
│   ├── provider_catalogue.json                            # Canonical 73-provider catalogue (metadata, access/fetch modes, fields)
│   ├── providers.py                                       # Provider registry loading and fetch adapter/dispatch implementations
│   ├── requirements.txt                                   # Python dependency notes (stdlib-focused; may be empty/minimal)
│   ├── server.py                                          # HTTP API server, routing, request/response handling, CORS
│   ├── store.py                                           # SQLite schema/persistence for artists, decisions, scans, settings, provider configs
│   └── tests/
│       └── test_backend_logic.py                          # Backend unit tests (unittest)
├── bun.lock                                               # Bun lockfile (present; npm also used in this repo)
├── firebase-applet-config.json                            # Firebase applet/config metadata (project scaffolding)
├── firebase-blueprint.json                                # Firebase blueprint/config artifact
├── firestore.rules                                        # Firestore security rules definition
├── index.html                                             # Vite HTML entry; base fonts/styles mounting point
├── metadata.json                                          # Project metadata descriptor
├── package-lock.json                                      # npm lockfile
├── package.json                                           # Frontend/backend scripts, dependencies, project metadata
├── public/
│   └── assets/
│       └── aistudio/
│           ├── Artistic_Value_Model__AVM__6bbe45a9.pdf   # Reference AVM document asset
│           ├── Breakout_Radar_Artist_Discovery_Dashboard_33042e3d.png # Dashboard/reference image asset
│           ├── Paste_November_05__2026_-_10_15AM_7432a002 # Pasted artifact/text asset
│           ├── Screenshot_2026-11-02_131658_3ef16b7a.png  # Screenshot/reference asset
│           └── index_fc663f7e.html                        # Exported/reference HTML artifact
├── src/
│   ├── App.tsx                                            # Main app shell: routing, bootstrap, sync, state, actions, toasts
│   ├── components/
│   │   ├── analyse/
│   │   │   ├── AnalyseSection.tsx                         # Analyze workspace UI, track selection, AVM tabs/panels, safe guards
│   │   │   ├── DiveInSection.tsx                          # Deep dive dashboard, KPI cards, chart composition, analytics integration
│   │   │   └── visualizations/
│   │   │       └── D3Visualizations.tsx                   # Reusable D3 chart components for Analyze/DiveIn views
│   │   ├── discovery/
│   │   │   └── DiscoverySection.tsx                       # Discovery workspace: headline/KPIs/controls/filters/sorts/cards-table/6 plots + Africa map
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx                                # Retractable navigation sidebar and section switching
│   │   │   └── Topbar.tsx                                 # Top bar with global search trigger and backend status indicator
│   │   ├── recommendations/
│   │   │   └── RecommendationsSection.tsx                # Recommendations/decision UI and artist review actions
│   │   ├── search/
│   │   │   └── GlobalSearchModal.tsx                      # Global artist search modal and navigation hooks
│   │   └── settings/
│   │       └── SettingsSection.tsx                        # Settings/operations: providers, command centre, telemetry, history, automation, seeds, scoring, workspace
│   ├── data/
│   │   └── fullProviderCatalogue.ts                       # Frontend provider catalogue data/fallback (73 providers) for UI
│   ├── firebase.ts                                        # Firebase client initialization/config wiring from env vars
│   ├── index.css                                          # Global styles/theme tokens and base UI styling
│   ├── main.tsx                                           # React entry point; mounts App into DOM
│   ├── services/
│   │   ├── avmEngine.ts                                   # Client-side AVM computation/derivation utilities
│   │   ├── backendApi.ts                                  # Frontend API client for backend endpoints (health, artists, discovery, providers, etc.)
│   │   ├── firestoreSync.ts                               # Optional Firestore sync/load helpers
│   │   └── realMusicApi.ts                                # Client-side discovery/search and data shaping helpers (fallback/live search support)
│   ├── tests/
│   │   └── runVerificationTests.ts                        # Frontend verification checks (AVM/filter/data-contract scenarios)
│   └── types/
│       ├── analytics.ts                                   # Type definitions for analytics/time-series/chart data structures
│       └── index.ts                                       # Shared app/domain types (artists, tracks, decisions, workspace sections, providers, etc.)
├── tsconfig.json                                          # TypeScript compiler configuration
└── vite.config.ts                                         # Vite config (plugins, dev server host/port, /api proxy)
```

### File-by-file highlights (source/config emphasis)

#### Root
- **`package.json`**: defines scripts for frontend/backend dev, linting, testing, build, and dependency manifest.
- **`vite.config.ts`**: configures Vite dev server (`3000`, `0.0.0.0`), React/Tailwind plugins, and `/api` proxy to backend.
- **`tsconfig.json`**: TypeScript project/compiler settings for frontend codebase.
- **`index.html`**: SPA HTML shell and font/setup hooks used by Vite.
- **`.env.example`**: template for backend URL, Firebase config, and optional keys.
- **`.gitignore`**: excludes build outputs, caches, environment files, backend DB/artifacts as configured.
- **`metadata.json`**: repository/app metadata file.
- **`firebase-*` / `firestore.rules`**: Firebase/Firestore configuration and rules artifacts.
- **`bun.lock`, `package-lock.json`**: lockfiles for package managers.

#### `backend/`
- **`server.py`**: standalone API server and route handlers; parses requests, returns JSON, integrates store/data/provider modules.
- **`providers.py`**: provider registry access and fetch execution logic across implemented/manual/licensed/outlined sources.
- **`provider_catalogue.json`**: source-of-truth provider metadata catalogue (73 entries).
- **`store.py`**: SQLite persistence layer and CRUD-like helpers for app entities and provider configs.
- **`data.py`**: domain/data helpers for seed generation, AVM/rollup and analytics computations, discovery normalization.
- **`requirements.txt`**: backend dependency declarations/notes.
- **`README.md`**: backend usage/API quick reference.
- **`tests/test_backend_logic.py`**: unit tests for backend behavior.

#### `src/`
- **`main.tsx`**: bootstraps React app.
- **`App.tsx`**: central state container, section routing, bootstrap/sync pipelines, and cross-component callbacks.
- **`index.css`**: global styling/theme rules.
- **`firebase.ts`**: Firebase initialization using environment configuration.
- **`types/index.ts`, `types/analytics.ts`**: domain and analytics typings/contracts.
- **`data/fullProviderCatalogue.ts`**: frontend-side provider catalogue data used by Settings/UI.
- **`services/backendApi.ts`**: HTTP client wrappers for backend endpoints.
- **`services/realMusicApi.ts`**: client discovery/search utilities and fallbacks.
- **`services/avmEngine.ts`**: AVM computation helpers on frontend.
- **`services/firestoreSync.ts`**: optional cloud sync helpers.
- **`tests/runVerificationTests.ts`**: executable verification checks for frontend logic/data assumptions.
- **`components/layout/*`**: shell/navigation components.
- **`components/discovery/DiscoverySection.tsx`**: discovery UI, filters/sorts/plots/map, scan controls.
- **`components/analyse/*`**: analyze UI, dive-in dashboard, D3 visualization components.
- **`components/recommendations/RecommendationsSection.tsx`**: recommendation and decision workflow UI.
- **`components/settings/SettingsSection.tsx`**: settings, provider management/fetch testing, moved operations tabs.
- **`components/search/GlobalSearchModal.tsx`**: global search overlay/modal.

#### `public/assets/aistudio/`
- Reference/export artifacts (PDF, PNG, HTML, pasted content) retained for context/design/reference; not part of runtime application logic.

#### `.aistudio/artifacts/`
- Environment/session artifacts (plans/media) retained by the workspace/tooling context; not application source code.

---

## Key Data Models & Concepts

Primary shared types live in `src/types/index.ts` and `src/types/analytics.ts` (and mirrored/consumed by backend logic where applicable):

- **`WorkspaceSection`**: app navigation sections (`discovery`, `analyse`, `recommendations`, `settings`)
- **Artist / Track entities (`RealArtistData`, `RealSong`, etc.)**: candidate profile, geography/genre, scores, signals, tracks, and AVM-related fields
- **AVM structures**: pillar/subscore metrics, rollups (e.g. AAV/median/P75/consistency/trajectory), flags/evidence and derived insights
- **Analytics types**: timeseries points, KPI/metric structures, chart-specific datasets used by DiveIn/D3 visualizations
- **Decision records (`ARDecision`)**: A&R decision, rationale/notes, actor/timestamps/follow-up metadata
- **Provider/source records (`ProviderSource`, `ProviderRow` UI extensions)**: provider identity, category/access, fetch mode/status, fields/credentials/config state
- **Discovery configuration**: regions/countries, genres, loop interval/autonomous state, seeds/scan records

---

## Limitations & Known Notes

- **Data authenticity varies by source:** some providers are live-fetchable, others require credentials/licenses/manual exports, and some are outlined only.
- **Modeled/simulated metrics:** parts of AVM and analytics views may use heuristics or derived/demo values when real signals are unavailable.
- **External API variability:** public endpoints may rate-limit, change schemas, or be unavailable; backend/frontend include fallback behavior but results can vary.
- **Audio previews:** playback depends on browser support and availability of valid preview URLs.
- **UI consistency:** strict 4-color palette is applied to core shell and major refactored sections, but some deep visualization/components may retain legacy styling.
- **Local artifacts:** `backend/breakout_radar.db`, `__pycache__`, and `.env` may exist locally; treat them as environment/runtime artifacts.

---

## Troubleshooting

- **Analyze section not opening / blank:**
  - Ensure at least one artist exists (run discovery or load seeds).
  - App attempts to auto-select a default artist when entering Analyze; refresh after backend/frontend restart if state is stale.
  - Check browser console for runtime errors; guards/fallbacks were added to reduce crashes on missing track/metric data.

- **Backend shows disconnected / local mode:**
  - Start backend: `python3 -m backend.server`
  - Verify `http://localhost:8000/api/health`
  - Confirm Vite proxy (`/api`) or set `VITE_API_BASE_URL` appropriately.

- **Discovery returns few/no candidates:**
  - Try different region/genre/seed query.
  - Check provider availability/credentials in Settings → Providers.
  - Backend may fall back or return limited results depending on source responses.

- **Provider test/fetch fails:**
  - Verify required credential fields for the provider.
  - Confirm provider fetch mode (`implemented` vs `manual_or_licensed` vs `outlined`).
  - Check backend logs/response messages in Settings test results.

- **Type/lint issues after edits:**
  - Run `npm run lint` (`tsc --noEmit`) to identify TypeScript errors.

- **Port conflicts:**
  - Change frontend port in Vite command/config or backend `PORT` env var and update proxy/`VITE_API_BASE_URL` as needed.

---

## Security & Secrets

- Do **not** commit secrets (API keys, tokens, credentials) to source control.
- Use `.env` locally (based on `.env.example`) for frontend configuration; provider credentials entered in Settings may be stored locally and/or sent to backend persistence depending on flow—handle with care.
- Review `firestore.rules` and Firebase configuration before deploying any cloud-connected environment.
- Treat downloaded/exported artifacts and local databases as environment data, not code.

---

## Quick Reference

```bash
# Install
npm install
cp .env.example .env

# Run backend
python3 -m backend.server

# Run frontend
npm run dev

# Checks
npm run lint
npm test
npm run test:backend
npm run build
```

**Default endpoints:** Frontend `http://localhost:3000` · Backend `http://localhost:8000` · Health `GET /api/health`
