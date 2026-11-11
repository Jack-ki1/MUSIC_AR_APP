import React from 'react';

const control =
  'w-full bg-surface border border-line-strong rounded-tile px-2.5 py-1.5 text-xs text-navy-700 ' +
  'placeholder:text-navy-500 outline-none transition-colors ' +
  'focus:border-brand-500 focus:ring-1 focus:ring-brand-500';

interface FieldProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/** Label + control wrapper with a single focus treatment. */
export const Field: React.FC<FieldProps> = ({ label, hint, children, className }) => (
  <label className={['block space-y-1', className ?? ''].join(' ').trim()}>
    {label && (
      <span className="block text-2xs font-mono font-semibold uppercase tracking-[0.1em] text-purple-500">
        {label}
      </span>
    )}
    {children}
    {hint && <span className="block text-2xs text-purple-500">{hint}</span>}
  </label>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
  className,
  ...props
}) => <input className={[control, className ?? ''].join(' ').trim()} {...props} />;

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({
  className,
  children,
  ...props
}) => (
  <select className={[control, className ?? ''].join(' ').trim()} {...props}>
    {children}
  </select>
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({
  className,
  ...props
}) => <textarea className={[control, className ?? ''].join(' ').trim()} {...props} />;

export default Field;
