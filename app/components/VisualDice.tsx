'use client';

import React, { useState, useEffect } from 'react';
import { audioManager } from '@/lib/audio/audioManager';

interface VisualDiceProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VisualDice({ isOpen, onClose }: VisualDiceProps) {
  const [dice, setDice] = useState<Array<{ id: string; value: number; rolling: boolean }>>([]);
  const [formula, setFormula] = useState('2d6');
  const [result, setResult] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  function parseFormula(formula: string): { count: number; sides: number; modifier: number } {
    const match = formula.match(/(\d+)d(\d+)(?:\s*([+-]\s*\d+))?/);
    if (!match) return { count: 2, sides: 6, modifier: 0 };
    
    const count = parseInt(match[1]) || 2;
    const sides = parseInt(match[2]) || 6;
    const modifier = match[3] ? parseInt(match[3].replace(/\s/g, '')) : 0;
    
    return { count, sides, modifier };
  }

  async function rollDice() {
    if (isRolling) return;
    
    setIsRolling(true);
    setResult(null);
    
    const { count, sides, modifier } = parseFormula(formula);
    
    // Play dice roll sound at the start
    audioManager.playUISound('dice');
    
    // Create dice
    const newDice = Array.from({ length: count }, (_, i) => ({
      id: `dice-${i}-${Date.now()}`,
      value: Math.floor(Math.random() * sides) + 1,
      rolling: true,
    }));
    
    setDice(newDice);
    
    // Simulate rolling animation
    const rollDuration = 1200;
    setTimeout(() => {
      const finalDice = newDice.map(die => ({
        ...die,
        value: Math.floor(Math.random() * sides) + 1,
        rolling: false,
      }));
      
      setDice(finalDice);
      
      const total = finalDice.reduce((sum, d) => sum + d.value, 0) + modifier;
      setResult(total);
      setIsRolling(false);
      
      // Play dice landing sound when dice stop
      setTimeout(() => {
        audioManager.playUISound('dice_land');
      }, 200);
    }, rollDuration);
  }

  function renderDie(die: { id: string; value: number; rolling: boolean }, sides: number) {
    const size = 80;
    
    // Create dot pattern based on die value
    const getDotPositions = (value: number, sides: number) => {
      if (sides === 6) {
        switch (value) {
          case 1:
            return [[50, 50]];
          case 2:
            return [[25, 25], [75, 75]];
          case 3:
            return [[25, 25], [50, 50], [75, 75]];
          case 4:
            return [[25, 25], [25, 75], [75, 25], [75, 75]];
          case 5:
            return [[25, 25], [25, 75], [50, 50], [75, 25], [75, 75]];
          case 6:
            return [[25, 25], [25, 50], [25, 75], [75, 25], [75, 50], [75, 75]];
          default:
            return [[50, 50]];
        }
      }
      // For other dice types, just show the number
      return [];
    };
    
    const positions = getDotPositions(die.value, sides);
    
    return (
      <div
        key={die.id}
        className={`relative rounded-lg bg-white border-2 border-amber-400 shadow-lg flex items-center justify-center text-2xl font-bold ${
          die.rolling ? 'animate-bounce' : ''
        }`}
        style={{
          width: size,
          height: size,
          transform: die.rolling ? `rotate(${Math.random() * 360}deg)` : 'none',
          transition: die.rolling ? 'none' : 'transform 0.5s ease-out',
        }}
      >
        {sides === 6 ? (
          <div className="absolute inset-0 p-2">
            {positions.map(([x, y], i) => (
              <div
                key={i}
                className="absolute w-3 h-3 bg-amber-700 rounded-full"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ))}
          </div>
        ) : (
          <span className="text-amber-800">{die.value}</span>
        )}
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="fantasy-title text-2xl">Visueller Würfel</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-amber-200 hover:bg-amber-300 flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formula Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-amber-800 mb-2">
            Würfelformel
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              className="input flex-1"
              placeholder="z.B. 2d6+3, 1d20, 3d8"
            />
            <button
              onClick={rollDice}
              disabled={isRolling}
              className="btn px-6 flex items-center gap-2"
            >
              {isRolling ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Würfelt...
                </>
              ) : (
                'Würfeln'
              )}
            </button>
          </div>
        </div>

        {/* Dice Display */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-4 justify-center min-h-[120px] items-center">
            {dice.length > 0 ? (
              dice.map(die => renderDie(die, parseFormula(formula).sides))
            ) : (
              <div className="text-amber-600 text-center">
                <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <p>Klicke auf &quot;Würfeln&quot; um zu starten</p>
              </div>
            )}
          </div>
        </div>

        {/* Result */}
        {result !== null && (
          <div className="text-center p-4 bg-gradient-to-r from-amber-200 to-orange-200 rounded-lg">
            <div className="text-sm text-amber-700 mb-1">Ergebnis</div>
            <div className="text-4xl font-bold text-amber-900">{result}</div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-4 gap-2">
          <button
            onClick={() => setFormula('1d20')}
            className="btn-secondary text-xs"
          >
            d20
          </button>
          <button
            onClick={() => setFormula('2d6')}
            className="btn-secondary text-xs"
          >
            2d6
          </button>
          <button
            onClick={() => setFormula('3d8')}
            className="btn-secondary text-xs"
          >
            3d8
          </button>
          <button
            onClick={() => setFormula('1d100')}
            className="btn-secondary text-xs"
          >
            d100
          </button>
        </div>
      </div>
    </div>
  );
}