'use client';

import { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface FantasyCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'mystical' | 'runic';
  glowing?: boolean;
  animated?: boolean;
  particle?: boolean;
}

export default function FantasyCard({ 
  children, 
  variant = 'default', 
  glowing = false, 
  animated = false,
  particle = false,
  className,
  ...props 
}: FantasyCardProps) {
  return (
    <div
      className={cn(
        // Base styles
        'relative bg-gradient-card backdrop-blur-lg border-2 border-primary-300 rounded-fantasy-xl transition-all duration-300',
        'shadow-fantasy hover:shadow-fantasy-hover',
        
        // Variants
        variant === 'default' && 'bg-gradient-card border-primary-300',
        variant === 'elevated' && 'bg-gradient-hero border-primary-400 shadow-fantasy-hover',
        variant === 'mystical' && 'bg-gradient-panel border-mystical-400 shadow-mystical',
        variant === 'runic' && 'border-secondary-400 rune-card',
        
        // Effects
        glowing && 'glow shadow-glow',
        animated && 'hover:scale-105 hover:-translate-y-2',
        particle && 'particle-container',
        
        className
      )}
      {...props}
    >
      {/* Magical border effect */}
      <div className="absolute inset-0 rounded-fantasy-xl">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-400 to-transparent opacity-60" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-400 to-transparent opacity-60" />
      </div>
      
      {/* Mystical corner decorations */}
      {variant === 'mystical' && (
        <>
          <div className="absolute top-2 right-2 w-4 h-4 text-mystical-400 opacity-60">
            ✦
          </div>
          <div className="absolute bottom-2 left-2 w-4 h-4 text-mystical-400 opacity-60">
            ✦
          </div>
        </>
      )}
      
      {/* Runic symbols */}
      {variant === 'runic' && (
        <div className="absolute top-4 right-4 text-xl text-secondary-400 opacity-50 transition-all duration-300 hover:opacity-100 hover:text-accent-500 hover:rotate-180">
          ⟐
        </div>
      )}
      
      {children}
    </div>
  );
}