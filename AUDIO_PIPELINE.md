# Audio Processing & Signal Ingestion Pipeline

## 1. Technical Ingestion Workflow

```
[ User Master Audio / CDN Stream ]
           │
           ▼
[ Step 1: Legal Chain-of-Title Audit ]
  - Verify 100% Master Ownership
  - Verify Signed Publishing Split Sheets
  - Affirm 0 Unauthorized Samples
           │
           ▼
[ Step 2: Binary Audio Buffer Decoding ]
  - Web Audio API AudioContext.decodeAudioData()
  - Decompress to PCM Float32Array channel data
           │
           ▼
[ Step 3: Real MIR Signal Processing ]
  - RMS Loudness Calculation: 20 * log10(sqrt(sum(s^2)/N))
  - Peak Amplitude & Digital Overs / Clipping Detection
  - Zero-Crossing Rate (ZCR) Analysis
  - Spectral Centroid: Weighted frequency center via short-time window
  - Autocorrelation Pitch Tracking (f0): 80Hz - 1000Hz vocal range
  - Energy Envelope Flux for Tempo (BPM) Approximation
           │
           ▼
[ Step 4: Quantitative AVM v4.2 Scoring ]
  - Compute TAV (0 - 100)
  - Generate 60-point waveform envelope for interactive scrubbing
```

## 2. Ingestion Property Specifications

| Property | Minimum Requirement | Recommended Standard |
|---|---|---|
| Sample Rate | $\ge 44.1\text{ kHz}$ | $48.0\text{ kHz}$ / $96.0\text{ kHz}$ |
| Bit Depth | $\ge 16\text{-bit}$ | $24\text{-bit}$ PCM Studio Master |
| Channels | Stereo (or Dual Mono) | Uncompressed Stereo |
| Integrated Loudness | $-16.0$ to $-12.0\text{ LUFS}$ | $-14.0\text{ LUFS}$ (EBU R128 Streaming Target) |
| True-Peak Ceiling | $< -0.5\text{ dBFS}$ | $\le -1.0\text{ dBFS}$ (Prevents inter-sample clip) |
