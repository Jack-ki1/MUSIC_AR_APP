import React from 'react';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
  /** Renders as a solid segmented block group instead of bordered chips. */
  variant?: 'chip' | 'segment';
  className?: string;
  ariaLabel?: string;
}

/**
 * Shared tablist. Both variants resolve to a solid contrast block for the
 * active item — never a floating pill, never a gradient.
 */
export function Tabs<T extends string>({
  items,
  active,
  onChange,
  variant = 'chip',
  className,
  ariaLabel
}: TabsProps<T>) {
  const chip =
    'chip inline-flex items-center gap-1.5 transition-colors cursor-pointer';
  const segment =
    'px-2.5 py-1 text-2xs font-mono font-semibold uppercase tracking-[0.08em] cursor-pointer transition-colors';

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={
        variant === 'segment'
          ? [
              'inline-flex flex-wrap items-center rounded-card border border-line bg-surface overflow-hidden',
              className ?? ''
            ].join(' ').trim()
          : ['flex flex-wrap items-center gap-1.5', className ?? ''].join(' ').trim()
      }
    >
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.id)}
            className={
              variant === 'segment'
                ? [
                    segment,
                    isActive
                      ? 'bg-brand-500 text-navy-900'
                      : 'text-purple-500 hover:text-navy-700 hover:bg-purple-100'
                  ].join(' ')
                : [chip, isActive ? 'on' : ''].join(' ').trim()
            }
          >
            {item.icon}
            {item.label}
            {item.badge !== undefined && (
              <span
                className={[
                  'text-2xs font-mono px-1 rounded-sm',
                  isActive
                    ? 'bg-navy-900/30 text-navy-900'
                    : 'bg-purple-100 text-purple-700'
                ].join(' ')}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
