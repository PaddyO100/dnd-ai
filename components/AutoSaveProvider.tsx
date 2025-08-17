'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGameStore } from '../lib/state/gameStore';
import { useAutoSave } from '../lib/saves/autoSaveManager';

interface AutoSaveStatusProps {
  show: boolean;
  onClose: () => void;
}

function AutoSaveStatus({ show, onClose }: AutoSaveStatusProps) {
  const { getStatus, isAutoSaveEnabled, autoSaveInterval } = useAutoSave();
  const [status, setStatus] = useState(getStatus());

  useEffect(() => {
    if (show) {
      const interval = setInterval(() => {
        setStatus(getStatus());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [show, getStatus]);

  const formatTime = (ms: number) => {
    if (!ms) return 'Never';
    const seconds = Math.floor((ms - Date.now()) / 1000);
    if (seconds <= 0) return 'Now';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-slate-800 border border-slate-600 rounded-lg p-4 shadow-lg z-50 min-w-[200px]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-white">Auto-Save Status</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-2 text-xs text-gray-300">
        <div className="flex justify-between">
          <span>Enabled:</span>
          <span className={isAutoSaveEnabled ? 'text-green-400' : 'text-red-400'}>
            {isAutoSaveEnabled ? 'Yes' : 'No'}
          </span>
        </div>
        
        {isAutoSaveEnabled && (
          <>
            <div className="flex justify-between">
              <span>Interval:</span>
              <span className="text-white">{autoSaveInterval}m</span>
            </div>
            
            <div className="flex justify-between">
              <span>Last Save:</span>
              <span className="text-white">
                {status.lastSaveTime ? new Date(status.lastSaveTime).toLocaleTimeString() : 'Never'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Next Save:</span>
              <span className="text-blue-400">
                {formatTime(status.nextSaveTime)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface QuickActionButtonsProps {
  onSaveClick: () => void;
  onLoadClick: () => void;
  onAutoSaveStatus: () => void;
}

function QuickActionButtons({ onSaveClick, onLoadClick, onAutoSaveStatus }: QuickActionButtonsProps) {
  return (
    <div className="fixed bottom-4 left-4 flex gap-2 z-40">
      <button
        onClick={onSaveClick}
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
        title="Quick Save"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </button>
      
      <button
        onClick={onLoadClick}
        className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition-colors"
        title="Load Save"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </button>
      
      <button
        onClick={onAutoSaveStatus}
        className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-colors"
        title="Auto-Save Status"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>
  );
}

export function AutoSaveProvider({ children }: { children: React.ReactNode }) {
  const gameState = useGameStore();
  const { isAutoSaveEnabled } = useAutoSave();
  const [showStatus, setShowStatus] = useState(false);
  const [isQuickSaving, setIsQuickSaving] = useState(false);
  const lastHistoryLength = useRef(gameState.history.length);
  const lastAutoSaveCheck = useRef(0);

  // Monitor game state changes for potential auto-save triggers
  useEffect(() => {
    // Only monitor if in game and auto-save is enabled
    if (gameState.step !== 'inGame' || !isAutoSaveEnabled) {
      return;
    }

    const now = Date.now();
    const historyChanged = gameState.history.length !== lastHistoryLength.current;
    const timeSinceLastCheck = now - lastAutoSaveCheck.current;

    // Check if we should trigger auto-save based on activity
    if (historyChanged && timeSinceLastCheck > 30000) { // At least 30 seconds between checks
      lastAutoSaveCheck.current = now;
      
      // Trigger auto-save if significant activity detected
      const recentMessages = gameState.history.slice(-3);
      const hasRecentPlayerAction = recentMessages.some(msg => msg.role === 'player');
      
      if (hasRecentPlayerAction) {
        // Use store getter to avoid stale closure and heavy deps
        useGameStore.getState().triggerAutoSave();
      }
    }

    lastHistoryLength.current = gameState.history.length;
  }, [gameState.history.length, gameState.step, isAutoSaveEnabled, gameState.history]);

  const handleQuickSave = useCallback(async () => {
    const currentGameState = useGameStore.getState();
    if (isQuickSaving || currentGameState.step !== 'inGame') return;
    
    setIsQuickSaving(true);
    try {
      const response = await fetch('/api/saves/quicksave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameState: currentGameState })
      });

      if (response.ok) {
        showNotification('Quick save completed!', 'success');
      } else {
        showNotification('Quick save failed!', 'error');
      }
    } catch (error) {
      console.error('Quick save error:', error);
      showNotification('Quick save failed!', 'error');
    } finally {
      setIsQuickSaving(false);
    }
  }, [isQuickSaving]);

  const handleLoadSave = () => {
    window.location.href = '/saves';
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 
                    type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 
                    'rgba(59, 130, 246, 0.9)';
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${bgColor};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 9999;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(4px);
      animation: slideInFromTop 0.3s ease-out;
    `;
    
    notification.textContent = message;
    
    // Add animation styles if not present
    if (!document.querySelector('#notification-animations')) {
      const style = document.createElement('style');
      style.id = 'notification-animations';
      style.textContent = `
        @keyframes slideInFromTop {
          from {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }
        @keyframes slideOutToTop {
          from {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
          to {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOutToTop 0.3s ease-in';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only activate shortcuts if not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl+S or Cmd+S for quick save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleQuickSave();
      }

      // Ctrl+L or Cmd+L for load saves
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        handleLoadSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleQuickSave]);

  // Show quick action buttons only in game
  const shouldShowQuickActions = gameState.step === 'inGame';

  return (
    <>
      {children}
      
      {shouldShowQuickActions && (
        <QuickActionButtons
          onSaveClick={handleQuickSave}
          onLoadClick={handleLoadSave}
          onAutoSaveStatus={() => setShowStatus(true)}
        />
      )}
      
      <AutoSaveStatus 
        show={showStatus} 
        onClose={() => setShowStatus(false)} 
      />
    </>
  );
}

export default AutoSaveProvider;