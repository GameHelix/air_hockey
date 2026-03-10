'use client';

import { motion } from 'framer-motion';
import { Difficulty, GameConfig } from '@/lib/types';
import { Button } from './Button';
import { DifficultySelector } from './DifficultySelector';

interface MainMenuProps {
  config: GameConfig;
  onConfigChange: (c: Partial<GameConfig>) => void;
  onPlay: () => void;
  highScore: number;
}

export function MainMenu({ config, onConfigChange, onPlay, highScore }: MainMenuProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center min-h-screen px-4 text-center"
    >
      {/* Title */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        {/* Puck icon */}
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-white/30 to-white/10 border-4 border-cyan-400 shadow-[0_0_40px_rgba(0,245,255,0.6)] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-white/80 shadow-inner" />
        </div>
        <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 mb-2">
          AIR HOCKEY
        </h1>
        <p className="text-white/40 text-sm tracking-widest uppercase">Neon Arena</p>
      </motion.div>

      {/* Glass panel */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6 shadow-2xl"
      >
        {/* High score */}
        {highScore > 0 && (
          <div className="mb-5 py-2 px-4 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-300 text-sm">
            🏆 Best: {highScore} wins
          </div>
        )}

        {/* Difficulty */}
        <div className="mb-5">
          <p className="text-white/50 text-xs uppercase tracking-widest mb-3">Difficulty</p>
          <DifficultySelector
            value={config.difficulty}
            onChange={(d: Difficulty) => onConfigChange({ difficulty: d })}
          />
        </div>

        {/* Sound toggles */}
        <div className="flex gap-3 justify-center">
          <ToggleButton
            label="SFX"
            active={config.soundEnabled}
            onClick={() => onConfigChange({ soundEnabled: !config.soundEnabled })}
          />
          <ToggleButton
            label="Music"
            active={config.musicEnabled}
            onClick={() => onConfigChange({ musicEnabled: !config.musicEnabled })}
          />
        </div>
      </motion.div>

      {/* Play button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Button size="lg" onClick={onPlay} className="w-48">
          PLAY
        </Button>
      </motion.div>

      {/* Controls hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-white/25 text-xs"
      >
        Mouse / Touch to move • Space to pause
      </motion.p>
    </motion.div>
  );
}

function ToggleButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all
        ${active
          ? 'bg-violet-500/20 border-violet-400/50 text-violet-300'
          : 'bg-white/5 border-white/10 text-white/30'}
      `}
    >
      <span
        className={`w-3 h-3 rounded-full transition-colors ${active ? 'bg-violet-400' : 'bg-white/20'}`}
      />
      {label}
    </button>
  );
}
