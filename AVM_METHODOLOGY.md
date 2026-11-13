# Artistic Value Model (AVM v4.2) Mathematical Methodology

## 1. Mathematical Formulation

The Artistic Value Model evaluates an artist's intrinsic musicality independently of immediate commercial hype.

### 1.1 Track Artistic Value (TAV)
For a single release $i$:

$$\text{TAV}_i = \min\left(100.0, \; 100 \cdot \sum_{k \in \{V, W, S, C\}} w_k \cdot P_k + B_{\text{prod}}\right)$$

Where:
- $P_V \in [0, 1]$: Vocal Quality & Biometric Range ($w_V = 0.30$)
- $P_W \in [0, 1]$: Writing, Narrative & Lyric Craft ($w_W = 0.30$)
- $P_S \in [0, 1]$: Song Structure & Dynamic Balance ($w_S = 0.20$)
- $P_C \in [0, 1]$: Compositional Richness & Harmonic Vocabulary ($w_C = 0.20$)
- $B_{\text{prod}} \in [0, 3.0]$: Production quality bonus

Subject to the normalization constraint:
$$\sum w_k = 1.00$$

### 1.2 Artist Aggregate Value (AAV) Multi-Release Rollup
For an artist's catalog of releases $T = \{t_1, t_2, \dots, t_N\}$:

$$\text{AAV} = 0.50 \cdot \overline{\text{TAV}} + 0.35 \cdot \text{TAV}_{\max} + 0.15 \cdot \text{TAV}_{\text{top20}}$$

Where $\overline{\text{TAV}}$ is catalog average, $\text{TAV}_{\max}$ is peak achievement, and $\text{TAV}_{\text{top20}}$ is the average of the top 20th percentile releases.

### 1.3 Dual Assessment & Divergence Tracking
The system tracks the divergence between machine acoustic findings ($S_M$) and human A&R qualitative scout reviews ($S_H$):

$$\Delta_{A\&R} = S_H - S_M$$

- $\Delta > +10$: Strong live charisma or cultural grassroots movement exceeding studio recording quality.
- $\Delta < -10$: Over-engineered studio recording that may struggle in live concert execution.

## 2. Insufficient Evidence Protocol
If an ingested audio recording has $<5$ seconds of audio, lacks vocal tracks when scoring Pillar V, or lacks publishing clearances, AVM score generation is suspended:
- Status: `INSUFFICIENT_EVIDENCE`
- Numeric Score: `0.0` (or `UNAVAILABLE`)
- Rationale: Fully documented in diagnostic output
