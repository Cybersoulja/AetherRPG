import React, { useState, useRef } from 'react';
import { useOracle } from '../../lib/stores/useOracle';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { OracleResult } from '../../lib/oracleEngine';

// --- Tier colour helpers ---

const TIER_COLORS: Record<number, string> = {
  0: 'text-red-400',
  1: 'text-orange-400',
  2: 'text-yellow-400',
  3: 'text-green-400',
  4: 'text-blue-400',
  5: 'text-purple-400',
};

const TIER_BG: Record<number, string> = {
  0: 'bg-red-950/40 border-red-800',
  1: 'bg-orange-950/40 border-orange-800',
  2: 'bg-yellow-950/40 border-yellow-800',
  3: 'bg-green-950/40 border-green-800',
  4: 'bg-blue-950/40 border-blue-800',
  5: 'bg-purple-950/40 border-purple-800',
};

const TIER_LABELS: Record<number, string> = {
  0: 'Bust — Failure',
  1: 'Pair — Partial',
  2: 'Two Pair — Mixed',
  3: 'Three of a Kind — Success',
  4: 'Full House / Four — Strong',
  5: 'Five / Four of a Kind — Legendary',
};

// --- Die face component ---

function DieFace({ value, rolling }: { value: number; rolling: boolean }) {
  const dots = Array.from({ length: value });

  const dotPositions: Record<number, string[]> = {
    1: ['center'],
    2: ['top-right', 'bottom-left'],
    3: ['top-right', 'center', 'bottom-left'],
    4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
    6: ['top-left', 'top-right', 'mid-left', 'mid-right', 'bottom-left', 'bottom-right'],
  };

  const posClass: Record<string, string> = {
    'top-left': 'top-1 left-1',
    'top-right': 'top-1 right-1',
    'mid-left': 'top-1/2 left-1 -translate-y-1/2',
    'mid-right': 'top-1/2 right-1 -translate-y-1/2',
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'bottom-left': 'bottom-1 left-1',
    'bottom-right': 'bottom-1 right-1',
  };

  return (
    <div
      className={`relative w-10 h-10 bg-gray-700 border-2 border-gray-500 rounded-md ${
        rolling ? 'animate-spin' : ''
      }`}
    >
      {(dotPositions[value] || []).map((pos, i) => (
        <span
          key={i}
          className={`absolute w-2 h-2 rounded-full bg-white ${posClass[pos]}`}
        />
      ))}
    </div>
  );
}

// --- Oracle Result Card ---

function ResultCard({ result }: { result: OracleResult }) {
  const tierColor = TIER_COLORS[result.diceResult.tier];
  const tierBg = TIER_BG[result.diceResult.tier];
  const tierLabel = TIER_LABELS[result.diceResult.tier];
  const time = result.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`border rounded-lg p-4 ${tierBg}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className={`font-bold text-sm uppercase tracking-wide ${tierColor}`}>
          {tierLabel}
        </span>
        <span className="text-gray-500 text-xs">{time}</span>
      </div>

      {/* Situation */}
      <p className="text-gray-300 text-sm italic mb-3">"{result.situation}"</p>

      {/* Dice */}
      <div className="flex gap-2 mb-3">
        {result.diceResult.dice.map((val, i) => (
          <DieFace key={i} value={val} rolling={false} />
        ))}
        <div className="flex flex-col justify-center ml-2">
          <span className={`text-sm font-semibold ${tierColor}`}>{result.diceResult.hand}</span>
          <span className="text-gray-400 text-xs">Tier {result.diceResult.tier}</span>
        </div>
      </div>

      {/* Narrative */}
      <p className="text-gray-100 text-sm leading-relaxed">{result.narrative}</p>
    </div>
  );
}

// --- Main Oracle Panel ---

export const OraclePanel: React.FC = () => {
  const { isRolling, lastResult, history, consultOracle, clearHistory } = useOracle();
  const [situation, setSituation] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleConsult = async () => {
    const trimmed = situation.trim();
    if (!trimmed || isRolling) return;
    await consultOracle(trimmed);
    setSituation('');
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleConsult();
    }
  };

  const pastResults = history.slice(lastResult ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">🎲</span>
            <div>
              <h2 className="text-lg font-bold text-purple-300">Story Decision Oracle</h2>
              <p className="text-gray-400 text-xs">
                Describe a situation. The Oracle rolls five dice and reveals your fate.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4 space-y-3">
          <label className="text-sm text-gray-300 font-medium block">
            What is your character attempting?
          </label>
          <Textarea
            ref={textareaRef}
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Example: "I search the ruins for a hidden terminal" or "I try to persuade the guard to let me pass"'
            className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 resize-none h-24 focus:border-purple-500"
            disabled={isRolling}
          />
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-xs">Ctrl+Enter to roll</span>
            <Button
              onClick={handleConsult}
              disabled={!situation.trim() || isRolling}
              className="bg-purple-700 hover:bg-purple-600 text-white font-semibold px-6"
            >
              {isRolling ? 'Rolling…' : 'Consult Oracle'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rolling animation */}
      {isRolling && (
        <Card className="bg-gray-800 border-purple-700">
          <CardContent className="p-4">
            <p className="text-purple-300 text-sm mb-3 text-center font-medium">
              The Oracle considers your fate…
            </p>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((i) => (
                <DieFace key={i} value={Math.ceil(Math.random() * 6)} rolling={true} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Latest result */}
      {!isRolling && lastResult && (
        <div>
          <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-2">Latest Reading</h3>
          <ResultCard result={lastResult} />
        </div>
      )}

      {/* Tier reference */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <h4 className="text-xs text-gray-500 uppercase tracking-widest mb-3">Tier Reference</h4>
          <div className="space-y-1">
            {Object.entries(TIER_LABELS).map(([tier, label]) => (
              <div key={tier} className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-sm text-xs flex items-center justify-center font-bold ${TIER_COLORS[Number(tier)]}`}>
                  {tier}
                </span>
                <span className="text-gray-400 text-xs">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* History */}
      {pastResults.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setShowHistory((v) => !v)}
              className="text-xs text-gray-400 hover:text-gray-200 uppercase tracking-widest"
            >
              {showHistory ? '▾' : '▸'} History ({pastResults.length})
            </button>
            <button
              onClick={clearHistory}
              className="text-xs text-gray-600 hover:text-red-400"
            >
              Clear
            </button>
          </div>
          {showHistory && (
            <div className="space-y-3">
              {pastResults.map((result, i) => (
                <ResultCard key={i} result={result} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
