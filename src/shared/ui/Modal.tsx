import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Max width of the panel. */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
  children: React.ReactNode;
  /** Disable closing on backdrop click / Escape (e.g. destructive flows). */
  dismissable?: boolean;
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl'
};

/** One modal shell — single backdrop colour, one close affordance. */
export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  subtitle,
  size = 'md',
  footer,
  children,
  dismissable = true
}) => {
  useEffect(() => {
    if (!open || !dismissable) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, dismissable, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={dismissable ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={[
          'relative w-full bg-surface border border-line rounded-card shadow-overlay',
          'max-h-[85vh] flex flex-col section-enter',
          sizes[size]
        ].join(' ')}
      >
        {(title || dismissable) && (
          <div className="flex items-start justify-between gap-4 px-4 py-3 border-b border-line">
            <div className="min-w-0">
              {title && (
                <h2 className="text-xs font-mono font-semibold uppercase tracking-[0.08em] text-navy-700">{title}</h2>
              )}
              {subtitle && (
                <p className="text-xs text-purple-500 mt-0.5">{subtitle}</p>
              )}
            </div>
            {dismissable && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="shrink-0 p-1 rounded-tile text-purple-500 hover:text-navy-700 hover:bg-purple-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
        <div className="px-4 py-3 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div className="px-4 py-3 border-t border-line flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
