# Changelog: Breakout Radar Transformation

All notable changes to the Breakout Radar platform are documented in this file.

## [4.2.1-PROD] - 2026-11-11

### Security & Access Control
- **5 RBAC Roles Implemented**: Added formal definitions for `Administrator`, `A&R Lead`, `Analyst`, `Reviewer`, and `Read-only` with granular permission gating.
- **15-Seat Workspace Allowlist**: Added pre-configured approved internal users directory.
- **Zero-Secret Policy**: Eliminated storing third-party API credentials in browser `localStorage`. Only connection state and configuration flags are stored client-side.
- **Immutable Audit Trail**: Enforced append-only rule on Firestore `/audit_logs` with SHA-256 tamper-evident integrity hashes.

### Audio & Music Information Retrieval (MIR)
- **Web Audio API Signal Extraction**: Built browser-side PCM float buffer decoder (`audioAnalysisService.ts`) computing real RMS loudness (dBFS), peak dynamics, dynamic range, clipping sample counts, zero-crossing rate (ZCR), spectral centroid (Hz), and autocorrelation pitch ($f_0$).
- **Waveform Peak Downsampling**: Computed authentic 60-point amplitude peak envelopes directly from decoded audio for interactive 30s playback scrubbing.
- **Master Audio Ingestion Verification**: Enforced 24-bit/48kHz WAV audio property validation, LUFS mastering headroom targets, and legal chain-of-title affirmations.

### A&R Candidate Lifecycle & UI/UX
- **Candidate Lifecycle Pipeline**: Implemented 6-stage candidate workflow (`DISCOVERED` -> `RESEARCHING` -> `LISTENING` -> `UNDER_REVIEW` -> `APPROVED` -> `FOLLOW_UP`) with Kanban board interface.
- **Executive Dashboard**: Built top-level workspace overview displaying real candidate counts, stage distributions, recent discoveries, and provider health.
- **De-Vibecoding & Institutional Surface**: Removed oversaturated glowing blur blobs and replaced with crisp architectural `#F8FAFC` surfaces, structured cards, and high-contrast slate typography.

### Quality Assurance & Documentation
- **Automated Verification Harness**: Expanded test suite to 35 test cases covering provenance, AVM determinism, 5 RBAC roles, candidate lifecycle transitions, and MIR mathematical computations (`35 PASSED, 0 FAILED`).
- **Complete Documentation Suite**: Added `SYSTEM_ARCHITECTURE.md`, `DATABASE_SCHEMA.md`, `API_DOCUMENTATION.md`, `SECURITY.md`, `THREAT_MODEL.md`, `DATA_PROVENANCE.md`, `AVM_METHODOLOGY.md`, `AUDIO_PIPELINE.md`, `DEPLOYMENT.md`, `BACKUP_AND_RECOVERY.md`, `TESTING.md`, and `CHANGELOG.md`.
