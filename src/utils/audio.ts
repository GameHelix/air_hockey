'use client';

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  // Resume if suspended (browsers require user gesture)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  gainPeak = 0.3,
  detune = 0,
): void {
  const ctx = getCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  osc.detune.setValueAtTime(detune, ctx.currentTime);

  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(gainPeak, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

/** Puck hits a wall */
export function playWallHit(): void {
  playTone(320, 0.08, 'square', 0.15);
}

/** Puck hits a paddle */
export function playPaddleHit(): void {
  playTone(520, 0.12, 'sawtooth', 0.25);
  playTone(680, 0.10, 'sine', 0.15, 8);
}

/** Goal scored */
export function playGoal(): void {
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.3, 'sine', 0.35), i * 100);
  });
}

/** Game won */
export function playWin(): void {
  const melody = [523, 659, 784, 1047, 1319];
  melody.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.4, 'sine', 0.4), i * 120);
  });
}

/** Game lost */
export function playLose(): void {
  const melody = [523, 440, 392, 330];
  melody.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.4, 'triangle', 0.35), i * 130);
  });
}

/** Resume audio context after user interaction */
export function resumeAudio(): void {
  getCtx();
}
