'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface FantasyInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  mystical?: boolean;
  glowing?: boolean;
}

const FantasyInput = forwardRef<HTMLInputElement, FantasyInputProps>(
  ({ 
    label,
    error,
    mystical = false,
    glowing = false,
    className,
    ...props 
  }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-primary-800 font-body">
            {label}
          </label>
        )}
        
        <div className="relative">
          <input
            ref={ref}
            className={cn(
              // Base styles
              'w-full px-4 py-3 border-2 rounded-fantasy-md font-elegant text-primary-900',
              'bg-white/90 backdrop-blur-sm transition-all duration-300',
              'placeholder:text-primary-500 placeholder:italic',
              'focus:outline-none focus:ring-4 focus:ring-primary-300',
              
              // States
              !error && 'border-primary-200 hover:border-primary-300 focus:border-primary-500',
              error && 'border-red-400 hover:border-red-500 focus:border-red-600 focus:ring-red-300',
              mystical && 'border-mystical-300 focus:border-mystical-500 focus:ring-mystical-300 shadow-mystical',
              glowing && 'shadow-glow',
              
              className
            )}
            {...props}
          />
          
          {/* Mystical glow effect */}
          {mystical && (
            <div className="absolute inset-0 rounded-fantasy-md bg-mystical-glow opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
          )}
        </div>
        
        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

FantasyInput.displayName = 'FantasyInput';

export default FantasyInput;