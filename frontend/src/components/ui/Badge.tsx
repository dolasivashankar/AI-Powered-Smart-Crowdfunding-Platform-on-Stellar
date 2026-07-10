import React from 'react';
import { classNames } from '@/utils/format';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, className }) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border';

  const variants = {
    success: 'bg-aurora-emerald/10 text-aurora-emerald border-aurora-emerald/20 shadow-[0_0_8px_rgba(16,185,129,0.15)]',
    warning: 'bg-aurora-amber/10 text-aurora-amber border-aurora-amber/20 shadow-[0_0_8px_rgba(245,158,11,0.15)]',
    error: 'bg-aurora-pink/10 text-aurora-pink border-aurora-pink/20 shadow-[0_0_8px_rgba(236,72,153,0.15)]',
    info: 'bg-stellar-500/10 text-stellar-300 border-stellar-500/20 shadow-[0_0_8px_rgba(91,110,243,0.15)]',
    default: 'bg-white/5 text-slate-400 border-white/10',
  };

  return (
    <span className={classNames(baseStyles, variants[variant], className)}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current animate-pulse-slow" />
      {children}
    </span>
  );
};

export default Badge;
