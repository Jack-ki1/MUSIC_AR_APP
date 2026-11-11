import React from 'react';

interface KPIProps {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  /** Small up/down percentage shown bottom-right. */
  delta?: number;
  icon?: React.ReactNode;
  /** Renders on a dark (navy) surface. */
  dark?: boolean;
  className?: string;
}

/**
 * Metric cell: tracked-out mono label, large tabular mono value, compact
 * delta with no background pill.
 */
export const KPI: React.FC<KPIProps> = ({
  label,
  value,
  sub,
  delta,
  icon,
  dark = false,
  className
}) => (
  <div
    className={[
      'rounded-card border p-2.5 min-w-0',
      dark
        ? 'bg-navy-900 border-line-strong text-navy-700'
        : 'bg-surface border-line text-navy-700',
      className ?? ''
    ].join(' ').trim()}
  >
    <div className="flex items-center gap-1.5">
      {icon && (
        <span className={dark ? 'text-brand-400' : 'text-brand-500'}>{icon}</span>
      )}
      <div
        className={[
          'text-2xs font-mono font-semibold uppercase tracking-[0.1em] truncate',
          dark ? 'text-purple-500' : 'text-purple-500'
        ].join(' ')}
      >
        {label}
      </div>
    </div>
    <div
      className={[
        'text-lg font-mono font-semibold tabular-nums mt-0.5 truncate leading-tight',
        dark ? 'text-navy-700' : 'text-navy-700'
      ].join(' ')}
    >
      {value}
    </div>
    <div className="flex items-baseline justify-between gap-2 mt-0.5">
      {sub !== undefined && (
        <div className="text-2xs text-purple-500 truncate">{sub}</div>
      )}
      {delta !== undefined && (
        <div
          className={[
            'text-2xs font-mono font-semibold tabular-nums shrink-0',
            delta >= 0 ? 'text-success-600' : 'text-danger-600'
          ].join(' ')}
        >
          {delta >= 0 ? '+' : ''}
          {delta.toFixed(1)}%
        </div>
      )}
    </div>
  </div>
);

export default KPI;
