import React from 'react';

export type PillTone =
  | 'sign'
  | 'meet'
  | 'watch'
  | 'evidence'
  | 'hold'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

interface PillProps {
  tone?: PillTone;
  children: React.ReactNode;
  className?: string;
  /** Solid fill instead of tinted — for high-emphasis badges. */
  solid?: boolean;
}

const tones: Record<PillTone, string> = {
  sign: 'bg-brand-50 text-brand-600 border-brand-100',
  meet: 'bg-purple-100 text-purple-700 border-line-strong',
  watch: 'bg-purple-100 text-navy-700 border-line-strong',
  evidence: 'bg-info-50 text-info-600 border-info-100',
  hold: 'bg-surface-subtle text-purple-500 border-line',
  neutral: 'bg-purple-50 text-purple-700 border-line',
  success: 'bg-success-50 text-success-700 border-success-100',
  warning: 'bg-warning-50 text-warning-700 border-warning-100',
  danger: 'bg-danger-50 text-danger-600 border-danger-100',
  info: 'bg-info-50 text-info-600 border-info-100'
};

const solids: Record<PillTone, string> = {
  sign: 'bg-brand-500 text-navy-900 border-brand-500',
  meet: 'bg-purple-500 text-navy-900 border-purple-500',
  watch: 'bg-navy-700 text-navy-900 border-navy-700',
  evidence: 'bg-info-600 text-navy-900 border-info-600',
  hold: 'bg-purple-200 text-navy-900 border-purple-200',
  neutral: 'bg-purple-500 text-navy-900 border-purple-500',
  success: 'bg-success-600 text-navy-900 border-success-600',
  warning: 'bg-warning-600 text-navy-900 border-warning-600',
  danger: 'bg-danger-600 text-navy-900 border-danger-600',
  info: 'bg-info-600 text-navy-900 border-info-600'
};

/** Tier / status tag — squared, mono, uppercase. One component for all `.pill-*`. */
export const Pill: React.FC<PillProps> = ({
  tone = 'neutral',
  solid = false,
  className,
  children
}) => (
  <span
    className={[
      'inline-flex items-center gap-1 rounded-sm border font-mono font-semibold text-2xs ' +
      'uppercase tracking-[0.06em] px-1.5 py-0.5 whitespace-nowrap',
      solid ? solids[tone] : tones[tone],
      className ?? ''
    ].join(' ').trim()}
  >
    {children}
  </span>
);

export default Pill;
