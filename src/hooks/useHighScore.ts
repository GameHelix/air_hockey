'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'air-hockey-highscore';

export function useHighScore() {
  const [highScore, setHighScoreState] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setHighScoreState(parseInt(stored, 10));
  }, []);

  function setHighScore(score: number) {
    const current = parseInt(localStorage.getItem(STORAGE_KEY) ?? '0', 10);
    if (score > current) {
      localStorage.setItem(STORAGE_KEY, String(score));
      setHighScoreState(score);
    }
  }

  return { highScore, setHighScore };
}
