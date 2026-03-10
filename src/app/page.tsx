'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { GameState, GameConfig, Score } from '@/lib/types';
import { MainMenu } from '@/components/ui/MainMenu';
import { GameCanvas } from '@/components/game/GameCanvas';
import { useHighScore } from '@/hooks/useHighScore';
import { resumeAudio } from '@/utils/audio';

const DEFAULT_CONFIG: GameConfig = {
  difficulty: 'medium',
  soundEnabled: true,
  musicEnabled: false,
};

export default function Home() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);
  const [score, setScore] = useState<Score>({ player: 0, ai: 0 });
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null);
  const [lastGoalScorer, setLastGoalScorer] = useState<'player' | 'ai' | null>(null);
  const goalFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { highScore, setHighScore } = useHighScore();

  // Keyboard: Space = pause/resume
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        setGameState((s) => {
          if (s === 'playing') return 'paused';
          if (s === 'paused') return 'playing';
          return s;
        });
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handlePlay = useCallback(() => {
    resumeAudio();
    setScore({ player: 0, ai: 0 });
    setWinner(null);
    setLastGoalScorer(null);
    setGameState('playing');
  }, []);

  const handleGoal = useCallback((scorer: 'player' | 'ai') => {
    setScore((prev) => ({
      player: scorer === 'player' ? prev.player + 1 : prev.player,
      ai: scorer === 'ai' ? prev.ai + 1 : prev.ai,
    }));
    setLastGoalScorer(scorer);
    if (goalFlashTimerRef.current) clearTimeout(goalFlashTimerRef.current);
    goalFlashTimerRef.current = setTimeout(() => setLastGoalScorer(null), 1500);
  }, []);

  const handleGameEnd = useCallback(
    (w: 'player' | 'ai') => {
      setWinner(w);
      setGameState('ended');
      if (w === 'player') {
        setHighScore(score.player);
      }
    },
    [score.player, setHighScore],
  );

  const handleRestart = useCallback(() => {
    setScore({ player: 0, ai: 0 });
    setWinner(null);
    setLastGoalScorer(null);
    setGameState('playing');
  }, []);

  const handleQuit = useCallback(() => {
    setGameState('menu');
    setScore({ player: 0, ai: 0 });
    setWinner(null);
  }, []);

  const updateConfig = useCallback((partial: Partial<GameConfig>) => {
    setConfig((c) => ({ ...c, ...partial }));
  }, []);

  return (
    <main
      className="h-full w-full flex flex-col"
      style={{ background: 'radial-gradient(ellipse at center, #0f0f20 0%, #0a0a14 100%)' }}
    >
      {/* Subtle grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <AnimatePresence mode="wait">
        {gameState === 'menu' && (
          <MainMenu
            key="menu"
            config={config}
            onConfigChange={updateConfig}
            onPlay={handlePlay}
            highScore={highScore}
          />
        )}

        {(gameState === 'playing' || gameState === 'paused' || gameState === 'ended') && (
          <div key="game" className="flex-1 flex flex-col min-h-0 p-2 sm:p-4">
            <GameCanvas
              config={config}
              gameState={gameState}
              score={score}
              winner={winner}
              onGoal={handleGoal}
              onGameEnd={handleGameEnd}
              onPause={() => setGameState('paused')}
              onResume={() => setGameState('playing')}
              onRestart={handleRestart}
              onQuit={handleQuit}
              lastGoalScorer={lastGoalScorer}
            />
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
