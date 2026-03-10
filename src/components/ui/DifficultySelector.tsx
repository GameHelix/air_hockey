'use client';

import { Difficulty } from '@/lib/types';

interface DifficultySelectorProps {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
}

const options: { value: Difficulty; label: string; desc: string; color: string }[] = [
  { value: 'easy', label: 'Easy', desc: 'Slow AI', color: 'from-emerald-500 to-green-400' },
  { value: 'medium', label: 'Medium', desc: 'Balanced', color: 'from-amber-500 to-yellow-400' },
  { value: 'hard', label: 'Hard', desc: 'Fast & fierce', color: 'from-rose-500 to-pink-500' },
];

export function DifficultySelector({ value, onChange }: DifficultySelectorProps) {
  return (
    <div className="flex gap-3 justify-center">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`
              relative px-5 py-3 rounded-xl border font-bold text-sm transition-all duration-200 uppercase tracking-wider
              ${active
                ? `bg-gradient-to-b ${opt.color} text-black border-transparent shadow-lg scale-105`
                : 'bg-white/5 border-white/20 text-white/60 hover:bg-white/10 hover:text-white hover:scale-105'}
            `}
          >
            <span className="block text-base">{opt.label}</span>
            <span className={`block text-xs font-normal mt-0.5 ${active ? 'text-black/70' : 'text-white/40'}`}>
              {opt.desc}
            </span>
          </button>
        );
      })}
    </div>
  );
}
