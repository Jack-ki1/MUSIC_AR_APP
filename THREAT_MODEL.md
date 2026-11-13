# Threat Model & Risk Mitigations

## 1. Identified Threat Vectors

### T1: Client-Side Credential Exfiltration
- **Risk**: Malicious extensions or unauthorized users reading third-party API credentials from browser `localStorage` or memory.
- **Mitigation**: Eliminated storing raw secrets in `localStorage`. Client only stores boolean connection status (`configured: true`). Protected API calls are proxied through server-side endpoints with TLS 1.3 and HSTS headers.

### T2: Cross-Tenant Data Leakage
- **Risk**: A user authorized for Tenant A (`ws-east-africa-hq`) queries or mutates records belonging to Tenant B (`ws-sony-music-africa`).
- **Mitigation**: Database queries enforce workspace scoping. Firestore security rules validate that document path variables match the caller's verified workspace claim.

### T3: Committee Decision Tampering
- **Risk**: An actor attempts to alter signed deal terms or reviewer scores after initial approval.
- **Mitigation**: Append-only audit logs with server-side immutability (`allow update, delete: if false`). Cryptographic SHA-256 hashes generated across canonical payloads detect any field tampering.

### T4: Emerging Discovery Saturation by Superstars
- **Risk**: Mainstream global superstars (Burna Boy, Wizkid, Drake) polluting emerging talent discovery and distorting algorithm velocity metrics.
- **Mitigation**: Automated 100,000 monthly listener threshold and legacy mainstream blacklist filter blocking established artists from entering the discovery pipeline.

### T5: Hallucinated / Fabricated Model Findings
- **Risk**: Misleading scouts with fabricated audio features or invented growth metrics.
- **Mitigation**: Every metric carries a provenance flag (`VERIFIED_DSP`, `ESTIMATED`, `UNAVAILABLE`). If audio stems are missing, AVM explicitly outputs `INSUFFICIENT_EVIDENCE` rather than optimistic estimates. Real Web Audio API decoding is executed directly on PCM audio buffers.
