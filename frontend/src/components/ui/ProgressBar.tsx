import React from 'react';
import { motion } from 'framer-motion';
import { classNames } from '@/utils/format';

interface ProgressBarProps {
  progress: number; // 0 - 100
  color?: 'stellar' | 'emerald' | 'amber' | 'red';
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = 'stellar',
  showLabel = true,
  className,
}) => {
  const normalizedProgress = Math.min(100, Math.max(0, progress));

  const colors = {
    stellar: 'bg-button-gradient shadow-[0_0_12px_rgba(91,110,243,0.3)]',
    emerald: 'bg-success-gradient shadow-[0_0_12px_rgba(16,185,129,0.3)]',
    amber: 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)]',
    red: 'bg-danger-gradient shadow-[0_0_12px_rgba(239,68,68,0.3)]',
  };

  return (
    <div className={classNames('w-full', className)}>
      <div className="flex items-center justify-between mb-1.5 text-xs text-slate-400">
        <span>Progress</span>
        {showLabel && <span className="font-semibold text-slate-200">{normalizedProgress}%</span>}
      </div>
      <div className="w-full h-2.5 rounded-full bg-slate-900/60 overflow-hidden border border-glass-border">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${normalizedProgress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={classNames('h-full rounded-full transition-all duration-300', colors[color])}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
