'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { GameState, GameConfig, Score } from '@/lib/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/lib/constants';
import { useGameEngine } from '@/hooks/useGameEngine';
import { GameHUD } from './GameHUD';
import { PauseScreen } from './PauseScreen';
import { EndScreen } from './EndScreen';

interface GameCanvasProps {
  config: GameConfig;
  gameState: GameState;
  score: Score;
  winner: 'player' | 'ai' | null;
  onGoal: (scorer: 'player' | 'ai') => void;
  onGameEnd: (winner: 'player' | 'ai') => void;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
  lastGoalScorer: 'player' | 'ai' | null;
}

export function GameCanvas({
  config,
  gameState,
  score,
  winner,
  onGoal,
  onGameEnd,
  onPause,
  onResume,
  onRestart,
  onQuit,
  lastGoalScorer,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });

  const { resetGame } = useGameEngine({
    canvasRef,
    config,
    gameState,
    onGoal,
    onGameEnd,
  });

  // Scale canvas to fit container while keeping aspect ratio
  useEffect(() => {
    function updateSize() {
      const container = containerRef.current;
      if (!container) return;
      const { clientWidth, clientHeight } = container;
      const aspect = CANVAS_WIDTH / CANVAS_HEIGHT;
      let w = clientWidth;
      let h = clientWidth / aspect;
      if (h > clientHeight) {
        h = clientHeight;
        w = h * aspect;
      }
      setCanvasSize({ width: Math.floor(w), height: Math.floor(h) });
    }
    updateSize();
    const ro = new ResizeObserver(updateSize);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const handleRestart = useCallback(() => {
    resetGame();
    onRestart();
  }, [resetGame, onRestart]);

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
      {/* Canvas wrapper — sized to computed dimensions */}
      <div
        className="relative"
        style={{ width: canvasSize.width, height: canvasSize.height }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{ width: canvasSize.width, height: canvasSize.height }}
          className="block rounded-xl touch-none"
        />

        {/* HUD overlay (always visible during play) */}
        {(gameState === 'playing' || gameState === 'paused') && (
          <GameHUD
            score={score}
            difficulty={config.difficulty}
            onPause={onPause}
            lastGoalScorer={lastGoalScorer}
          />
        )}

        {/* Overlays */}
        <AnimatePresence>
          {gameState === 'paused' && (
            <PauseScreen
              onResume={onResume}
              onRestart={handleRestart}
              onQuit={onQuit}
            />
          )}
          {gameState === 'ended' && winner && (
            <EndScreen
              winner={winner}
              score={score}
              onPlayAgain={handleRestart}
              onQuit={onQuit}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
