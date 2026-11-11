/**
 * Single source of truth for data-visualisation colours.
 * Charts must import from here instead of hard-coding hex literals.
 *
 * Tuned for the dark A&R terminal: bright categorical series on a near-black
 * canvas, hairline grey grids, mono-friendly label greys.
 */
export const series = {
  1: '#FF6B1F',
  2: '#38BDF8',
  3: '#34D399',
  4: '#A78BFA',
  5: '#FBBF24',
  6: '#F472B6',
  7: '#94A3B8',
  8: '#F87171'
} as const;

/** Aggregate / primary trend line + area fills (brand orange). */
export const primary = series[1];

/** Deep surface used by dark hero / spotlight blocks (mirrors --color-navy-900). */
export const navy900 = '#131316';

/** Neutral chrome for axes, grids, labels. */
export const chart = {
  grid: 'rgba(63, 63, 70, 0.55)',
  gridStrong: 'rgba(82, 82, 91, 0.75)',
  axis: '#52525b',
  axisLabel: '#71717a',
  text: '#FAFAFA',
  textMuted: '#A1A1AA',
  tooltipBg: '#18181B',
  tooltipText: '#FAFAFA',
  surface: '#09090B',
  surfaceSubtle: '#131316',
  /** Tail of a primary-tinted area gradient. */
  primarySoft: '#1F1209',
  line: 'rgba(63, 63, 70, 0.65)',
  cohort: '#71717a',
  playhead: '#F87171',
  /** UGC / virality trend — the one accent outside the categorical ramp. */
  virality: '#F472B6'
} as const;

/**
 * Song-structure bands drawn behind trajectory/energy charts
 * (Intro · Verse · Hook/Chorus · Outro).
 */
export const sectionBands = {
  rest: { fill: '#131316', text: '#71717a' },
  verse: { fill: '#1F1209', text: '#FF9A63' },
  hook: { fill: '#2A1E05', text: '#FCD34D' }
} as const;

/**
 * Platform colours — these are third-party brand identities and are the one
 * place non-brand hex values are allowed to stay. Brightened for the dark base.
 */
export const platform = {
  spotify: '#1DB954',
  youtube: '#FF3B30',
  tiktok: '#25F4EE',
  apple: '#FA243C',
  boomplay: '#38BDF8',
  soundcloud: '#FF5500'
} as const;

/** Ordered palette handed to multi-series charts. */
export const ramp: string[] = [
  series[1],
  series[2],
  series[3],
  series[4],
  series[5],
  series[6],
  series[7],
  series[8]
];

/** Stable colour for an arbitrary key (categorical series, countries, genres). */
export function colorForKey(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return ramp[hash % ramp.length];
}

/**
 * AVM pillar colours — Vocal / Writing / Song / Composition.
 * Kept distinct so pillar comparisons stay readable across every view.
 */
export const pillar = {
  vocal: series[4],
  writing: series[6],
  song: series[3],
  composition: series[5]
} as const;
