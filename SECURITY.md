# Security Architecture & Access Control Specification

## 1. Zero-Trust Principles & Tenant Isolation

Breakout Radar operates under a Zero-Trust security paradigm tailored for internal enterprise A&R teams:
1. **Multi-Tenant Separation**: All data is partitioned under `/workspaces/{workspaceId}`. Firestore security rules prevent cross-tenant queries even if client code is altered.
2. **Zero-Secret Client Policy**: No raw API keys, private OAuth secrets, or administrative database credentials are stored in client JavaScript or browser `localStorage`.
3. **Structured Diagnostics**: In accordance with the Firebase skill, all Firestore errors are captured and re-thrown with structured JSON diagnostics including operation type, target path, and caller identity.

## 2. Role-Based Access Control (RBAC) Matrix

| Capability | Administrator (`ADMIN`) | A&R Lead (`AR_LEAD`) | Analyst (`ANALYST`) | Reviewer (`REVIEWER`) | Read-only (`VIEWER`) |
|---|:---:|:---:|:---:|:---:|:---:|
| Browse Discovery Roster & Audio Streams | YES | YES | YES | YES | YES |
| View D3 Visualizations & Dossiers | YES | YES | YES | YES | YES |
| Trigger Autonomous Scans | YES | YES | YES | NO | NO |
| Execute Web Audio MIR Analysis | YES | YES | YES | NO | NO |
| Validate Audio Master & Ingestion | YES | YES | YES | NO | NO |
| Perform Human Scout Evaluation & Overrides | YES | YES | NO | YES | NO |
| Record Committee Signing Decisions | YES | YES | NO | YES | NO |
| Advance Candidate Pipeline Stages | YES | YES | NO | YES | NO |
| Calibrate AVM Pillar Weights ($w_k$) | YES | YES | NO | NO | NO |
| Manage Workspace Allowlist & Team Seats | YES | NO | NO | NO | NO |
| Manage Integration Connection Status | YES | NO | NO | NO | NO |
| Inspect Protected Cryptographic Audit Ledger | YES | YES | NO | NO | NO |

## 3. Cryptographic Tamper-Evidence

Committee signing decisions and critical administrative mutations generate a 256-bit SHA-256 integrity hash:

$$\text{Hash} = \text{SHA256}(\text{CanonicalPayload})$$

Audit logs are stored in `/workspaces/{workspaceId}/audit_logs/{logId}`. Firestore rules strictly enforce:
```javascript
match /audit_logs/{logId} {
  allow read: if isSignedIn() && isValidId(logId);
  allow create: if isSignedIn() && isValidId(logId) && isValidAuditLog(incoming());
  allow update, delete: if false; // STRICT IMMUTABILITY
}
```
Any database payload alteration outside the application breaks the signature hash, immediately exposing tampering during audit validation.
