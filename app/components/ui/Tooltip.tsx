"use client";
import { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onEsc(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, []);

  return (
    <div 
      ref={ref}
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <div 
          role="tooltip"
          className={`absolute z-50 px-2 py-1 rounded text-xs bg-gray-900 text-white shadow-lg whitespace-pre-line ${
            side === 'top' ? 'bottom-full mb-1 left-1/2 -translate-x-1/2' : ''
          } ${side === 'bottom' ? 'top-full mt-1 left-1/2 -translate-x-1/2' : ''}
            ${side === 'left' ? 'right-full mr-1 top-1/2 -translate-y-1/2' : ''}
            ${side === 'right' ? 'left-full ml-1 top-1/2 -translate-y-1/2' : ''}
          `}
        >
          {content}
        </div>
      )}
    </div>
  );
}
