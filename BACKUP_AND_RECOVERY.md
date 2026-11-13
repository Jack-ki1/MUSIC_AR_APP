# Backup, Disaster Recovery & Data Integrity Protocol

## 1. Single Authoritative Source of Truth
Breakout Radar utilizes Google Cloud Firestore (`ai-studio-3334bd27-8aa0-41c6-9860-b19ab887f53e`) as the single authoritative production database.
- Conflicting simultaneous writes across multiple uncoordinated databases have been eliminated.
- Local browser cache operates strictly as an offline read-through and optimistic cache synchronized via Firestore `onSnapshot`.

## 2. Automated Backup Strategy

### 2.1 Daily Scheduled Cloud Firestore Exports
Using Google Cloud Storage:
```bash
gcloud firestore export gs://breakout-radar-backups-3334bd27/daily-$(date +%Y%m%d) \
  --project=ai-studio-3334bd27-8aa0-41c6-9860-b19ab887f53e
```
- Retention: 30 days of daily incremental snapshots, 12 months of monthly archives.
- Storage Class: Nearline storage with GCS Object Lifecycle rules.

### 2.2 Point-in-Time Restoration Procedure
To restore a corrupted tenant partition:
```bash
gcloud firestore import gs://breakout-radar-backups-3334bd27/daily-20261110/ \
  --project=ai-studio-3334bd27-8aa0-41c6-9860-b19ab887f53e \
  --collection-ids=artists,decisions
```

## 3. Cryptographic Tamper-Evidence Verification
Audit records retain SHA-256 integrity hashes (`integrityHash`). If database integrity is ever questioned:
1. Re-calculate SHA-256 hash across canonical payload: `generateIntegrityHash(record)`.
2. Compare with stored `integrityHash`.
3. Any mismatch flags unauthorized manual database mutation.
