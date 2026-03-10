'use client';

import { motion } from 'framer-motion';
import { Score } from '@/lib/types';
import { Button } from '@/components/ui/Button';

interface EndScreenProps {
  winner: 'player' | 'ai';
  score: Score;
  onPlayAgain: () => void;
  onQuit: () => void;
}

export function EndScreen({ winner, score, onPlayAgain, onQuit }: EndScreenProps) {
  const isWin = winner === 'player';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-20"
    >
      {/* Background particles effect via CSS */}
      {isWin && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: i % 2 === 0 ? '#00f5ff' : '#ff00ff',
              }}
              animate={{
                y: [0, -200 - Math.random() * 200],
                opacity: [1, 0],
                scale: [1, 0.5],
              }}
              transition={{
                duration: 1.5 + Math.random(),
                delay: Math.random() * 0.5,
                repeat: Infinity,
                repeatDelay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ scale: 0.7, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 18, stiffness: 200 }}
        className="relative flex flex-col items-center gap-6 w-72"
      >
        {/* Result panel */}
        <div
          className={`
            w-full rounded-2xl border p-6 text-center backdrop-blur-xl shadow-2xl
            ${isWin
              ? 'bg-cyan-500/10 border-cyan-400/40 shadow-[0_0_60px_rgba(0,245,255,0.2)]'
              : 'bg-fuchsia-500/10 border-fuchsia-400/40 shadow-[0_0_60px_rgba(255,0,255,0.2)]'}
          `}
        >
          <motion.div
            animate={{ rotate: isWin ? [0, -10, 10, -10, 0] : [0, 5, -5, 5, 0] }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-5xl mb-3"
          >
            {isWin ? '🏆' : '😤'}
          </motion.div>

          <h2
            className={`text-3xl font-black mb-1 ${isWin ? 'text-cyan-300' : 'text-fuchsia-300'}`}
          >
            {isWin ? 'YOU WIN!' : 'AI WINS!'}
          </h2>
          <p className="text-white/50 text-sm mb-4">
            {isWin ? 'Excellent play!' : 'Better luck next time!'}
          </p>

          {/* Score breakdown */}
          <div className="flex items-center justify-center gap-4 py-3 border-t border-white/10">
            <div className="text-center">
              <p className="text-xs text-cyan-400/60 uppercase tracking-wider">You</p>
              <p className="text-3xl font-black text-cyan-400">{score.player}</p>
            </div>
            <p className="text-white/20 text-xl font-light">—</p>
            <div className="text-center">
              <p className="text-xs text-fuchsia-400/60 uppercase tracking-wider">AI</p>
              <p className="text-3xl font-black text-fuchsia-400">{score.ai}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full">
          <Button size="lg" onClick={onPlayAgain} className="w-full">
            Play Again
          </Button>
          <Button variant="ghost" onClick={onQuit} className="w-full">
            Main Menu
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
