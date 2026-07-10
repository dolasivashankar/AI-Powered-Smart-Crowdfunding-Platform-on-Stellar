import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { classNames } from '@/utils/format';

interface CardProps extends HTMLMotionProps<"div"> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, hoverEffect = true, children, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hoverEffect ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={classNames(
        'bg-card-gradient backdrop-blur-md rounded-2xl border border-glass-border p-6 shadow-xl',
        hoverEffect && 'hover:border-stellar-500/30 transition-colors duration-300',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
