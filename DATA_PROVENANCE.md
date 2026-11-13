# Data Provenance & Observational Integrity

## 1. Provenance Classification Framework

Every metric displayed across Breakout Radar is assigned one of four formal provenance states:

| Status | Code | Criteria | Example Metric |
|---|---|---|---|
| **Verified DSP** | `VERIFIED_DSP` | Ingested directly from official DSP APIs via exact catalog identifier matching. | Apple Music iTunes Monthly Listeners, Release Date, Track ISRC |
| **Model Estimated** | `ESTIMATED` | Formulated using mathematically validated correlation curves across multiple proxies. | Cross-platform reach estimate, UGC TikTok challenge propensity |
| **Unavailable** | `UNAVAILABLE` | Explicitly marked when upstream providers publish no reliable public data. | Missing radio spin count in unmonitored markets |
| **Calibrated Baseline** | `CALIBRATED_BASELINE` | Benchmark regional data points calibrated from industry historical standards. | Genre-specific dynamic headroom benchmarks |

## 2. Observational Temporal Discipline

Every `MetricObservation<T>` structure guarantees:
- **`observedAt`**: ISO-8601 UTC timestamp of retrieval (e.g. `2026-11-10T21:00:00Z`).
- **`timePeriod`**: Explicit observational window: `last_7_days`, `last_28_days`, `last_90_days`, or `all_time`.
- **`source`**: Literal name of the upstream data provider (e.g. `Apple Music iTunes Catalog API`, `MusicBrainz Open Graph API`).
- **`confidencePercent`**: Calculated match certainty (0 - 100%).

## 3. Anti-Hallucination Directives

1. **No Synthetic Streaming Inflation**: No random number generator feeds streaming figures, follower counts, or growth velocities.
2. **Missing Evidence Transparency**: When an artist has no catalog releases or unverified rights, the interface explicitly renders an `Awaiting Provider Sync` or `Insufficient Evidence` diagnostic banner.
3. **Superstar Ceiling**: Discoveries are strictly restricted to emerging artists with $\le 100,000$ monthly listeners.
