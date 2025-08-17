'use client';

import { ReactNode, ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface FantasyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'mystical' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glowing?: boolean;
  enchanted?: boolean;
  loading?: boolean;
}

const FantasyButton = forwardRef<HTMLButtonElement, FantasyButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    glowing = false,
    enchanted = false,
    loading = false,
    className,
    disabled,
    ...props 
  }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Base styles
          'relative inline-flex items-center justify-center font-heading font-semibold',
          'border-2 rounded-fantasy-md transition-all duration-300 transform',
          'overflow-hidden focus:outline-none focus:ring-4 focus:ring-primary-300',
          'active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
          
          // Sizes
          size === 'sm' && 'px-3 py-2 text-xs',
          size === 'md' && 'px-4 py-2.5 text-sm',
          size === 'lg' && 'px-6 py-3 text-base',
          size === 'xl' && 'px-8 py-4 text-lg',
          
          // Variants
          variant === 'primary' && 'bg-gradient-button border-primary-600 text-white shadow-fantasy-button hover:shadow-fantasy-hover hover:-translate-y-1',
          variant === 'secondary' && 'bg-primary-100 border-primary-300 text-primary-800 hover:bg-primary-200 hover:border-primary-400',
          variant === 'mystical' && 'bg-gradient-to-r from-mystical-600 to-mystical-700 border-mystical-600 text-white shadow-mystical hover:from-mystical-700 hover:to-mystical-800',
          variant === 'danger' && 'bg-gradient-to-r from-red-600 to-red-700 border-red-600 text-white hover:from-red-700 hover:to-red-800',
          variant === 'ghost' && 'bg-transparent border-transparent text-primary-700 hover:bg-primary-50 hover:text-primary-800',
          
          // Effects
          glowing && 'shadow-glow animate-glow',
          enchanted && 'enchanted-text',
          
          className
        )}
        {...props}
      >
        {/* Shine effect */}
        <div className="absolute inset-0 -top-px overflow-hidden rounded-fantasy-md">
          <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-500 hover:left-[100%]" />
        </div>
        
        {/* Loading spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="mystical-loader w-5 h-5" />
          </div>
        )}
        
        {/* Content */}
        <span className={cn('relative z-10 flex items-center gap-2', loading && 'opacity-0')}>
          {children}
        </span>
        
        {/* Magical particles for mystical variant */}
        {variant === 'mystical' && (
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="absolute top-1 left-2 w-1 h-1 bg-mystical-300 rounded-full animate-ping" />
            <div className="absolute bottom-2 right-3 w-1 h-1 bg-mystical-300 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
          </div>
        )}
      </button>
    );
  }
);

FantasyButton.displayName = 'FantasyButton';

export default FantasyButton;