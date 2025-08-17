'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTutorialStore, useActiveTutorial, useCurrentStep } from '@/lib/tutorial/tutorialState';

/**
 * TutorialOverlay provides the non-intrusive UI for tutorials
 * Features:
 * - Smooth animations and transitions
 * - Element highlighting with spotlight effect
 * - Adaptive positioning based on target elements
 * - Progress indicators
 * - Optional auto-actions for demonstrations
 */
export default function TutorialOverlay() {
  const activeTutorial = useActiveTutorial();
  const currentStep = useCurrentStep();
  const {
    settings,
    nextStep,
    previousStep,
    skipStep,
    stopTutorial,
    pauseTutorial,
    resumeTutorial
  } = useTutorialStore();

  const [overlayPosition, setOverlayPosition] = useState({ x: 0, y: 0 });
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [highlightRects, setHighlightRects] = useState<DOMRect[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Ensure we only render on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate position of tutorial popup relative to target element(s)
  const calculatePosition = useCallback(() => {
    if (!activeTutorial || !currentStep) return;

    try {
  let primaryRect: DOMRect | null = null;

      // Handle multi-highlight
      if (currentStep.targets && currentStep.action === 'multi_highlight') {
        const rects: DOMRect[] = [];
        currentStep.targets.forEach(selector => {
          const element = document.querySelector(selector);
          if (element) {
            rects.push(element.getBoundingClientRect());
          }
        });
        setHighlightRects(rects);
        if (rects.length > 0) {
          primaryRect = rects[0]; // Use first element for positioning
        }
      } 
      // Handle single target
      else if (currentStep.target) {
        const targetElement = document.querySelector(currentStep.target);
        if (targetElement) {
          primaryRect = targetElement.getBoundingClientRect();
          setHighlightRect(primaryRect);
        }
      }

      // If no target, center the overlay
      if (!primaryRect) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        setOverlayPosition({ 
          x: viewportWidth / 2 - 200, 
          y: viewportHeight / 2 - 150 
        });
        setHighlightRect(null);
        setHighlightRects([]);
        return;
      }

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const overlayWidth = 450; // Increased width for better content display
      const overlayHeight = 250; // Increased height
      const offset = 20;

      let x = 0;
      let y = 0;
      let finalPosition = currentStep.position || 'auto';

      // Auto positioning - find the best spot
      if (finalPosition === 'auto') {
        const spaceTop = primaryRect.top;
        const spaceBottom = viewportHeight - primaryRect.bottom;
        const spaceLeft = primaryRect.left;
        const spaceRight = viewportWidth - primaryRect.right;
        
        if (spaceBottom >= overlayHeight + offset) {
          finalPosition = 'bottom';
        } else if (spaceTop >= overlayHeight + offset) {
          finalPosition = 'top';
        } else if (spaceRight >= overlayWidth + offset) {
          finalPosition = 'right';
        } else if (spaceLeft >= overlayWidth + offset) {
          finalPosition = 'left';
        } else {
          finalPosition = 'center';
        }
      }

      // Position based on determined placement
      switch (finalPosition) {
        case 'top':
          x = primaryRect.left + primaryRect.width / 2 - overlayWidth / 2;
          y = primaryRect.top - overlayHeight - offset;
          
          if (y < 0) {
            y = primaryRect.bottom + offset;
          }
          break;

        case 'bottom':
          x = primaryRect.left + primaryRect.width / 2 - overlayWidth / 2;
          y = primaryRect.bottom + offset;
          
          if (y + overlayHeight > viewportHeight) {
            y = primaryRect.top - overlayHeight - offset;
          }
          break;

        case 'left':
          x = primaryRect.left - overlayWidth - offset;
          y = primaryRect.top + primaryRect.height / 2 - overlayHeight / 2;
          
          if (x < 0) {
            x = primaryRect.right + offset;
          }
          break;

        case 'right':
          x = primaryRect.right + offset;
          y = primaryRect.top + primaryRect.height / 2 - overlayHeight / 2;
          
          if (x + overlayWidth > viewportWidth) {
            x = primaryRect.left - overlayWidth - offset;
          }
          break;

        case 'center':
        default:
          x = viewportWidth / 2 - overlayWidth / 2;
          y = viewportHeight / 2 - overlayHeight / 2;
          break;
      }

      // Ensure popup stays within viewport
      x = Math.max(10, Math.min(x, viewportWidth - overlayWidth - 10));
      y = Math.max(10, Math.min(y, viewportHeight - overlayHeight - 10));

      setOverlayPosition({ x, y });
    } catch (error) {
      console.warn('Error calculating tutorial position:', error);
    }
  }, [currentStep, activeTutorial]);

  // Update position when step changes or window resizes
  useEffect(() => {
    if (!activeTutorial || !currentStep) return;

    calculatePosition();

    const handleResize = () => calculatePosition();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [calculatePosition, activeTutorial, currentStep]);

  // Show/hide animation
  useEffect(() => {
    if (activeTutorial && !activeTutorial.isPaused) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(false);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [activeTutorial]);

  // Auto-advance timer for steps with auto-advance
  useEffect(() => {
    if (!currentStep || !settings.autoAdvance || activeTutorial?.isPaused) return;
    if (currentStep.interactionRequired) return; // Don't auto-advance if interaction required

    const delay = currentStep.nextStepDelay || currentStep.delay || 4000; // Increased default to 4 seconds
    const timer = setTimeout(() => {
      nextStep();
    }, delay);

    return () => clearTimeout(timer);
  }, [currentStep, settings.autoAdvance, activeTutorial, nextStep]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopTutorial('cancelled');
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        previousStep();
      } else if (e.key === ' ') {
        e.preventDefault();
        if (activeTutorial?.isPaused) {
          resumeTutorial();
        } else {
          pauseTutorial();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, activeTutorial, nextStep, previousStep, stopTutorial, pauseTutorial, resumeTutorial]);

  // Perform auto-actions if specified
  useEffect(() => {
    if (!currentStep?.autoAction || !currentStep.action) return;
    if (!currentStep.target && !currentStep.targets) return;

    const timer = setTimeout(() => {
      try {
        const selector = currentStep.target || (currentStep.targets && currentStep.targets[0]);
        if (!selector) return;
        
        const element = document.querySelector(selector) as HTMLElement;
        if (!element) return;

        switch (currentStep.action) {
          case 'click':
            element.click();
            break;
          case 'type':
            if (element instanceof HTMLInputElement && currentStep.demoValue) {
              element.focus();
              element.value = '';
              // Simulate typing animation
              let i = 0;
              const typeTimer = setInterval(() => {
                if (i < currentStep.demoValue!.length) {
                  element.value += currentStep.demoValue![i];
                  i++;
                } else {
                  clearInterval(typeTimer);
                }
              }, 100);
            }
            break;
          case 'scroll':
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            break;
          case 'focus':
            element.focus();
            break;
          case 'hover':
            // Simulate hover by adding a temporary class
            element.classList.add('tutorial-hover');
            setTimeout(() => element.classList.remove('tutorial-hover'), 2000);
            break;
        }
      } catch (error) {
        console.warn('Error performing auto-action:', error);
      }
    }, 1200); // Slightly longer delay for better visibility

    return () => clearTimeout(timer);
  }, [currentStep]);

  if (!mounted || !activeTutorial || !currentStep || !isVisible) {
    return null;
  }

  const progress = Math.round(((activeTutorial.currentStepIndex + 1) / activeTutorial.tutorial.steps.length) * 100);
  const canGoBack = activeTutorial.currentStepIndex > 0;
  const isLastStep = activeTutorial.currentStepIndex === activeTutorial.tutorial.steps.length - 1;

  const overlayContent = (
    <>
      {/* Backdrop with spotlight effect */}
      <div 
        className="fixed inset-0 pointer-events-none z-[9998]"
        style={{
          backgroundColor: `rgba(0, 0, 0, ${settings.overlayOpacity * 0.5})`,
          transition: 'all 0.3s ease-in-out'
        }}
      >
        {/* Single highlight */}
        {highlightRect && currentStep.target && (
          <div
            className="absolute border-4 rounded-lg shadow-2xl transition-all duration-500 ease-in-out"
            style={{
              left: highlightRect.left - 4,
              top: highlightRect.top - 4,
              width: highlightRect.width + 8,
              height: highlightRect.height + 8,
              borderColor: settings.highlightColor,
              boxShadow: `0 0 0 4px rgba(245, 158, 11, 0.2), 0 0 30px rgba(245, 158, 11, 0.4)`,
              animation: 'tutorial-pulse 2s infinite'
            }}
          />
        )}
        
        {/* Multi-highlight */}
        {highlightRects.length > 0 && currentStep.action === 'multi_highlight' && (
          <>
            {highlightRects.map((rect, index) => (
              <div
                key={index}
                className="absolute border-4 rounded-lg shadow-2xl transition-all duration-500 ease-in-out"
                style={{
                  left: rect.left - 4,
                  top: rect.top - 4,
                  width: rect.width + 8,
                  height: rect.height + 8,
                  borderColor: settings.highlightColor,
                  boxShadow: `0 0 0 4px rgba(245, 158, 11, 0.2), 0 0 30px rgba(245, 158, 11, 0.4)`,
                  animation: `tutorial-pulse 2s infinite ${index * 0.2}s`
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Tutorial popup */}
      <div
        ref={overlayRef}
        className={`fixed z-[9999] max-w-md transition-all duration-300 ease-out ${
          isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
        style={{
          left: overlayPosition.x,
          top: overlayPosition.y
        }}
      >
        <div className="bg-white rounded-xl shadow-2xl border-2 border-amber-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-semibold text-sm">{currentStep.title}</h3>
              </div>
              <button
                onClick={() => stopTutorial('cancelled')}
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-amber-100">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <p className="text-gray-700 text-sm leading-relaxed">
                {currentStep.content}
              </p>
              
              {/* Contextual hints */}
              {currentStep.contextualHints && showHints && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-2">
                  <div className="text-xs text-amber-800 font-medium mb-1">Tipps:</div>
                  <ul className="text-xs text-amber-700 space-y-1">
                    {currentStep.contextualHints.map((hint, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">•</span>
                        {hint}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Hints toggle */}
              {currentStep.contextualHints && (
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="text-xs text-amber-600 hover:text-amber-800 flex items-center gap-1 transition-colors"
                >
                  {showHints ? 'Tipps ausblenden' : 'Tipps anzeigen'}
                  <svg className={`w-3 h-3 transition-transform ${showHints ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>

            {/* Progress indicator */}
            {currentStep.showProgress && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-2">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Fortschritt</span>
                  <span>{activeTutorial.currentStepIndex + 1} / {activeTutorial.tutorial.steps.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div 
                    className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Demo indicator */}
            {currentStep.autoAction && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-800">
                  <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium">Automatische Demonstration läuft...</span>
                </div>
              </div>
            )}
            
            {/* Interaction required indicator */}
            {currentStep.interactionRequired && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-orange-800">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium">Interaktion erforderlich</span>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={previousStep}
                  disabled={!canGoBack}
                  className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Zurück
                </button>
                {currentStep.skippable !== false && (
                  <button
                    onClick={skipStep}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Überspringen
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {activeTutorial.currentStepIndex + 1} / {activeTutorial.tutorial.steps.length}
                </span>
                <button
                  onClick={nextStep}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all"
                >
                  {isLastStep ? 'Abschließen' : 'Weiter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes tutorial-pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.02);
          }
        }
        
        .tutorial-hover {
          background-color: rgba(245, 158, 11, 0.1) !important;
          transition: background-color 0.3s ease;
        }
      `}</style>
    </>
  );

  return createPortal(overlayContent, document.body);
}