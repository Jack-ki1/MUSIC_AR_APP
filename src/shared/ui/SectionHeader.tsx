import React from 'react';

interface SectionHeaderProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Right-aligned action buttons. */
  actions?: React.ReactNode;
  /** Rendered above the title (banner-style alerts). */
  banner?: React.ReactNode;
  className?: string;
}

/** One header for every page — tracked mono eyebrow, compact title. */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  description,
  actions,
  banner,
  className
}) => (
  <div className={['space-y-2', className ?? ''].join(' ').trim()}>
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2.5">
      <div className="min-w-0">
        {eyebrow && (
          <div className="text-2xs font-mono font-semibold uppercase tracking-[0.14em] text-brand-600 flex items-center gap-1.5 mb-1">
            {eyebrow}
          </div>
        )}
        <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-navy-700">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-purple-500 mt-1 max-w-3xl">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">{actions}</div>
      )}
    </div>
    {banner}
  </div>
);

export default SectionHeader;
