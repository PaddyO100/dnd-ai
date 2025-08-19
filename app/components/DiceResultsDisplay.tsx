'use client';

import { useState } from 'react';

interface DiceResult {
  formula: string;
  rolls: number[];
  modifier: number;
  total: number;
  description?: string;
}

interface DiceResultsDisplayProps {
  results: DiceResult[];
  onShowVisualDice?: () => void;
}

export default function DiceResultsDisplay({ results, onShowVisualDice }: DiceResultsDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (!results || results.length === 0) return null;

  const getDiceTypeDescription = (formula: string): string => {
    const descriptions: Record<string, string> = {
      'd20': 'W20 - Standard-Attributswurf, kritische Entscheidungen',
      'd12': 'W12 - Schwerer Schaden, große Waffen',
      'd10': 'W10 - Mittlerer Schaden, Prozentuale Checks',
      'd8': 'W8 - Leichter bis mittlerer Schaden',
      'd6': 'W6 - Standard-Schadenswürfel, allgemeine Checks',
      'd4': 'W4 - Minimaler Schaden, kleine Waffen'
    };

    // Extract basic die type from formula
    const match = formula.match(/d(\d+)/);
    if (match) {
      const dieType = `d${match[1]}`;
      return descriptions[dieType] || `${dieType} - Würfel mit ${match[1]} Seiten`;
    }
    return 'Spezieller Würfelwurf';
  };

  const formatRolls = (rolls: number[], modifier: number): string => {
    const rollsText = rolls.join(' + ');
    if (modifier !== 0) {
      const modText = modifier > 0 ? ` + ${modifier}` : ` ${modifier}`;
      return `[${rollsText}]${modText}`;
    }
    return `[${rollsText}]`;
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4 my-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-amber-500 rounded flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <h3 className="font-medium text-amber-900 dark:text-amber-100">Würfelwurf Ergebnis</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs px-2 py-1 bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded hover:bg-amber-300 dark:hover:bg-amber-700 transition-colors"
            title="Details anzeigen/ausblenden"
          >
            {showDetails ? 'Weniger' : 'Details'}
          </button>
          
          {onShowVisualDice && (
            <button
              onClick={onShowVisualDice}
              className="text-xs px-2 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors flex items-center gap-1"
              title="3D Würfel Simulation"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
              </svg>
              3D
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {results.map((result, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                {result.formula}
              </span>
              
              {showDetails && (
                <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                  <span className="font-mono">{formatRolls(result.rolls, result.modifier)}</span>
                  <span>=</span>
                </div>
              )}
              
              <div className="text-lg font-bold text-amber-900 dark:text-amber-100">
                {result.total}
              </div>
              
              {result.description && (
                <span className="text-sm text-amber-700 dark:text-amber-300">
                  ({result.description})
                </span>
              )}
            </div>

            {showDetails && (
              <div className="text-xs text-amber-600 dark:text-amber-400 max-w-xs text-right">
                {getDiceTypeDescription(result.formula)}
              </div>
            )}
          </div>
        ))}
      </div>

      {showDetails && (
        <div className="mt-4 pt-3 border-t border-amber-200 dark:border-amber-700">
          <div className="text-xs text-amber-600 dark:text-amber-400 space-y-1">
            <p><strong>Würfel-Legende:</strong></p>
            <div className="grid grid-cols-2 gap-2">
              <span>• d4, d6, d8, d10 = Schadenswürfel</span>
              <span>• d12 = Schwere Waffen</span>
              <span>• d20 = Fähigkeits- & Angriffswürfe</span>
              <span>• d100 = Prozentuale Checks</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
