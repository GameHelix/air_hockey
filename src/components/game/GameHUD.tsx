'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Score, Difficulty } from '@/lib/types';
import { WINNING_SCORE } from '@/lib/constants';

interface GameHUDProps {
  score: Score;
  difficulty: Difficulty;
  onPause: () => void;
  lastGoalScorer: 'player' | 'ai' | null;
}

export function GameHUD({ score, difficulty, onPause, lastGoalScorer }: GameHUDProps) {
  const diffColor = {
    easy: 'text-emerald-400',
    medium: 'text-amber-400',
    hard: 'text-rose-400',
  }[difficulty];

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top bar */}
      <div className="pointer-events-auto flex items-center justify-between px-3 py-2">
        {/* AI score */}
        <ScoreDisplay label="AI" score={score.ai} color="fuchsia" />

        {/* Center info */}
        <div className="flex flex-col items-center gap-1">
          <span className={`text-xs font-bold uppercase tracking-widest ${diffColor}`}>
            {difficulty}
          </span>
          <button
            onClick={onPause}
            className="px-3 py-1 rounded-lg text-xs font-bold text-white/60 border border-white/15 bg-white/5 hover:bg-white/10 hover:text-white transition-all active:scale-95"
          >
            ⏸ PAUSE
          </button>
        </div>

        {/* Player score */}
        <ScoreDisplay label="YOU" score={score.player} color="cyan" />
      </div>

      {/* Goal flash */}
      <AnimatePresence>
        {lastGoalScorer && (
          <motion.div
            key={`goal-${Date.now()}`}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.3 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className={`
              text-4xl font-black tracking-wider px-8 py-3 rounded-2xl
              ${lastGoalScorer === 'player'
                ? 'text-cyan-300 bg-cyan-500/20 border border-cyan-400/50 shadow-[0_0_40px_rgba(0,245,255,0.4)]'
                : 'text-fuchsia-300 bg-fuchsia-500/20 border border-fuchsia-400/50 shadow-[0_0_40px_rgba(255,0,255,0.4)]'}
            `}>
              {lastGoalScorer === 'player' ? 'GOAL! 🎉' : 'AI SCORES! 😤'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ScoreDisplay({
  label,
  score,
  color,
}: {
  label: string;
  score: number;
  color: 'cyan' | 'fuchsia';
}) {
  const colorClass = color === 'cyan' ? 'text-cyan-400' : 'text-fuchsia-400';
  const bgClass = color === 'cyan' ? 'bg-cyan-400/10 border-cyan-400/30' : 'bg-fuchsia-400/10 border-fuchsia-400/30';

  return (
    <div className={`flex flex-col items-center px-4 py-2 rounded-xl border ${bgClass} min-w-[64px]`}>
      <span className="text-white/40 text-xs uppercase tracking-wider">{label}</span>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={score}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-3xl font-black ${colorClass} leading-none`}
        >
          {score}
        </motion.span>
      </AnimatePresence>
      <div className="flex gap-0.5 mt-1">
        {Array.from({ length: WINNING_SCORE }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${i < score ? (color === 'cyan' ? 'bg-cyan-400' : 'bg-fuchsia-400') : 'bg-white/15'}`}
          />
        ))}
      </div>
    </div>
  );
}
