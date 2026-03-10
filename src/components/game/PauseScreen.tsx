'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface PauseScreenProps {
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
}

export function PauseScreen({ onResume, onRestart, onQuit }: PauseScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-20"
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 20 }}
        transition={{ type: 'spring', damping: 20 }}
        className="bg-white/5 backdrop-blur-xl border border-white/15 rounded-2xl p-8 flex flex-col items-center gap-5 w-64 shadow-2xl"
      >
        <div className="text-center">
          <div className="text-4xl mb-1">⏸</div>
          <h2 className="text-2xl font-black text-white tracking-wider">PAUSED</h2>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <Button variant="primary" onClick={onResume} className="w-full">
            ▶ Resume
          </Button>
          <Button variant="ghost" onClick={onRestart} className="w-full">
            ↺ Restart
          </Button>
          <Button variant="ghost" onClick={onQuit} className="w-full text-white/50">
            ✕ Quit
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
