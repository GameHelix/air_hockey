'use client';

import { useCallback, useRef } from 'react';
import * as audio from '@/utils/audio';

export function useSound(enabled: boolean) {
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const play = useCallback((fn: () => void) => {
    if (enabledRef.current) fn();
  }, []);

  return {
    playWallHit: () => play(audio.playWallHit),
    playPaddleHit: () => play(audio.playPaddleHit),
    playGoal: () => play(audio.playGoal),
    playWin: () => play(audio.playWin),
    playLose: () => play(audio.playLose),
    resumeAudio: audio.resumeAudio,
  };
}
