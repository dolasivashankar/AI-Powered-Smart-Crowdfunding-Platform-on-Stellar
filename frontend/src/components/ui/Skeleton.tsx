import React from 'react';
import { classNames } from '@/utils/format';

interface SkeletonProps {
  variant?: 'card' | 'text' | 'circle' | 'table-row';
  rows?: number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ variant = 'text', rows = 1, className }) => {
  const baseStyles = 'bg-slate-800/40 rounded-lg animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent bg-[length:1000px_100%]';

  if (variant === 'card') {
    return (
      <div className={classNames('bg-card-gradient border border-glass-border p-6 rounded-2xl flex flex-col gap-4', className)}>
        <div className={classNames('h-48 w-full', baseStyles)} />
        <div className={classNames('h-6 w-3/4', baseStyles)} />
        <div className={classNames('h-4 w-full', baseStyles)} />
        <div className="flex gap-2">
          <div className={classNames('h-8 w-20', baseStyles)} />
          <div className={classNames('h-8 w-20', baseStyles)} />
        </div>
      </div>
    );
  }

  if (variant === 'circle') {
    return <div className={classNames('rounded-full', baseStyles, className)} />;
  }

  if (variant === 'table-row') {
    return (
      <div className={classNames('flex items-center gap-4 py-4 border-b border-glass-border', className)}>
        <div className={classNames('h-6 w-1/4', baseStyles)} />
        <div className={classNames('h-6 w-1/2', baseStyles)} />
        <div className={classNames('h-6 w-12', baseStyles)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={classNames(
            'h-4 w-full',
            baseStyles,
            i === rows - 1 && rows > 1 && 'w-2/3',
            className
          )}
        />
      ))}
    </div>
  );
};

export default Skeleton;
