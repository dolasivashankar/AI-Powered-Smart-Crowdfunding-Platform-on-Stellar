import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { classNames } from '@/utils/format';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  form?: string;
  id?: string;
  'aria-label'?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, onClick, type = 'button', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-button-gradient hover:shadow-glow text-white shadow-lg border border-stellar-400/20',
      secondary: 'bg-glass hover:bg-glass-hover text-slate-200 border border-glass-border',
      danger: 'bg-danger-gradient hover:shadow-glow-purple text-white shadow-lg border border-aurora-pink/20',
      ghost: 'bg-transparent hover:bg-white/5 text-slate-300',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3.5 text-base',
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        disabled={disabled || isLoading}
        className={classNames(baseStyles, variants[variant], sizes[size], className)}
        onClick={onClick as unknown as React.MouseEventHandler<HTMLButtonElement>}
        type={type}
        {...(props as object)}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
