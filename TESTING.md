# Testing Strategy & Automated Quality Assurance

## 1. Test Harness Overview

Breakout Radar contains an automated 35-test verification harness (`src/tests/runVerificationTests.ts`) executing via `tsx`:

```bash
npm test
```

## 2. Test Suites Covered

### 2.1 Pillar 1: Data Provenance & Catalog Grounding
- `[DATA-1]`: Monthly listeners metric has valid provenance (`VERIFIED_DSP`, `ESTIMATED`, `UNAVAILABLE`).
- `[DATA-1]`: Monthly listeners metric is backed by explicit source identification.
- `[DATA-2]`: Every metric carries an explicit time period and ISO-8601 observed timestamp.
- `[DATA-3]`: Candidate recommendations link to structured supporting evidence.
- `[DATA-3]`: Supporting evidence records claim, metric, source, and confidence.
- `[DATA-4]`: Initial roster contains no fake placeholder or dummy artist records.
- `[DATA-4]`: Mainstream filter blocks established superstars ($>100\text{k}$ listeners) from polluting discovery.
- `[DATA-4]`: Authentic upcoming artists are permitted through discovery pipeline.
- `[DATA-5]`: Multi-provider artist identities are safely reconciled with status code.
- `[DATA-5]`: Reconciled identities include verified Spotify URI and MusicBrainz MBID with $\ge 90\%$ confidence.

### 2.2 Pillar 2: Artistic Value Model (AVM) Engine
- `[AVM-6]`: Production scoring is strictly deterministic from empirical inputs (zero random drift).
- `[AVM-7]`: Audio ingestion accepts compliant master audio meeting rights & technical specs.
- `[AVM-7]`: Audio ingestion strictly rejects unverified rights and missing publishing splits.
- `[AVM-8]`: Track AVM carries documented method version (`AVM-4.2.1-PROD`).
- `[AVM-8]`: Every pillar sub-score links to verifiable evidence references.
- `[AVM-9]`: Incomplete acoustic inputs yield `INSUFFICIENT_EVIDENCE` status rather than fabricated scores.
- `[AVM-10]`: Machine algorithmic score and Human Scout assessment remain distinct with divergence tracking.
- `[AVM-11]`: Model limitations, boundary conditions, and regional bias mitigations are formally specified.

### 2.3 Pillar 3: Security & Operational Architecture
- `[SEC-12]`: Authentication service returns operational authenticated identity.
- `[SEC-13]`: Workspace ADMIN role has full operational capabilities.
- `[SEC-13]`: AR_LEAD role can manage discovery and sign decisions but cannot manage secrets.
- `[SEC-13]`: ANALYST role can run acoustic analysis and ingest audio but cannot record signing decisions.
- `[SEC-13]`: REVIEWER role can perform human evaluations and override scores within permissions.
- `[SEC-13]`: SCOUT role can record decisions but cannot manage secrets or modify AVM weights.
- `[SEC-13]`: VIEWER role has strict read-only access (signing and discovery disabled).
- `[PIPE-1]`: Candidate lifecycle stages progress deterministically from discovery to follow-up.
- `[MIR-1]`: RMS loudness computation accurately calculates dBFS for calibrated sine signals.
- `[MIR-2]`: Zero-crossing rate accurately tracks signal frequency periods.
- `[SEC-14]`: Cross-workspace access boundaries are strictly enforced (tenant isolation).
- `[SEC-15]`: Firestore rules schema validation logic passes valid artist records.
- `[SEC-15]`: Firestore rules schema rejects records violating bounds.
- `[SEC-16]`: No confidential secret keys or private passwords present in client runtime environment.
- `[SEC-17]`: Automated secret rotation policy and error handling protocols are documented.
- `[SEC-18]`: Audit history records generate 256-bit SHA-256 cryptographic integrity hashes.
- `[SEC-18]`: Cryptographic tamper-evidence detects any payload mutation.
