# Database Schema & Entity Relationships

## 1. Authoritative Data Store Architecture

Breakout Radar uses Google Cloud Firestore as its single authoritative production database (`ai-studio-3334bd27-8aa0-41c6-9860-b19ab887f53e`).
Data is strictly partitioned under multi-tenant workspace roots: `/workspaces/{workspaceId}/...`.

```
/workspaces/{workspaceId}
    ├── /artists/{artistId}
    │       └── tracks: [RealSong]
    │       └── evidenceLinks: [RecommendationEvidence]
    │       └── identitiesReconciliation: ArtistIdentitiesReconciliation
    ├── /decisions/{decisionId}
    ├── /audit_logs/{logId}  (Immutable: allow update, delete: if false)
    └── /settings/{settingId}
```

## 2. Entity Definitions

### 2.1 Workspace (`/workspaces/{workspaceId}`)
| Field | Type | Constraint | Description |
|---|---|---|---|
| `id` | string | `size() <= 128` | Unique workspace identifier (e.g. `ws-east-africa-hq`) |
| `name` | string | `size() <= 200` | Human-readable division title |
| `territory` | string | `size() <= 100` | Target operational jurisdiction |
| `defaultCurrency`| string | `size() == 3` | ISO currency code (e.g. `USD`) |
| `createdAt` | string | ISO-8601 | Workspace provisioning timestamp |

### 2.2 Artist (`/workspaces/{workspaceId}/artists/{artistId}`)
| Field | Type | Constraint | Description |
|---|---|---|---|
| `id` | string | `size() <= 128` | Unique canonical artist UUID |
| `name` | string | `size() <= 200` | Canonical artist title |
| `primaryGenre` | string | Enum | Main musical style |
| `country` | string | ISO-3166 | Primary country of origin |
| `city` | string | Optional | Discovered municipal scene |
| `monthlyListeners` | number | `>= 0` | Verified DSP audience count (Must be $<100\text{k}$) |
| `monthlyListenersMetric` | object | Provenance | Source-backed evidence with observation timestamp |
| `growthSignal30d` | number | `float` | 30-day velocity rate |
| `discoveryScore` | number | `0 - 100` | Autonomous signal confidence score |
| `artisticScore` | number | `0.0 - 5.0` | Human A&R scout calibrated rating |
| `combinedScore` | number | `0 - 100` | Weighted aggregate index (60% AAV, 40% Discovery) |
| `recommendationTier` | string | Enum | `PURSUE` \| `MEET` \| `WATCH` \| `HOLD` |
| `lifecycleStage` | string | Enum | `DISCOVERED` \| `RESEARCHING` \| `LISTENING` \| `UNDER_REVIEW` \| `APPROVED` \| `FOLLOW_UP` |
| `avmRollup` | object | AAV Record | Multi-release catalog score and top 20% peak indicators |
| `tracks` | array | `size() <= 100` | Catalog releases with audio preview URLs & TAV |

### 2.3 Decision (`/workspaces/{workspaceId}/decisions/{decisionId}`)
| Field | Type | Constraint | Description |
|---|---|---|---|
| `id` | string | `size() <= 128` | Unique decision identifier |
| `artistId` | string | Foreign Key | Linked artist record |
| `decision` | string | Enum | `PURSUE` \| `MEET` \| `WATCH` |
| `decisionMaker` | string | Required | Authenticated scout name & title |
| `decisionMakerUid` | string | Required | UID of author |
| `rationale` | string | Required | A&R signing justification |
| `dealType` | string | Optional | Deal structure (e.g. `EP 360`, `Distribution Only`) |
| `recommendedAdvanceUsd` | number | `>= 0` | Modeled financial advance proposal |
| `followUpDate` | string | ISO-8601 | Scheduled milestone target |
| `createdAt` | string | ISO-8601 | Immutable submission timestamp |
| `immutableHash` | string | SHA-256 | Cryptographic tamper-evident digest |

### 2.4 Audit Log (`/workspaces/{workspaceId}/audit_logs/{logId}`)
| Field | Type | Constraint | Description |
|---|---|---|---|
| `id` | string | `size() <= 128` | Unique log entry ID |
| `workspaceId` | string | Foreign Key | Tenant boundary |
| `timestamp` | string | `request.time` | Server-validated event timestamp |
| `actorUid` | string | `request.auth.uid`| Identity of modifying actor |
| `actorEmail` | string | Required | Verified email address |
| `actorRole` | string | Enum | `ADMIN` \| `AR_LEAD` \| `ANALYST` \| `REVIEWER` \| `VIEWER` |
| `action` | string | `size() <= 100` | System action identifier |
| `targetEntityId` | string | Required | Modified artist or decision ID |
| `integrityHash` | string | 64-char hex | SHA-256 cryptographic proof |
