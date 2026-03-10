// Canvas dimensions (logical, scaled to viewport)
export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 720;

// Physics
export const PUCK_RADIUS = 18;
export const PADDLE_RADIUS = 36;
export const MAX_PUCK_SPEED = 18;
export const MIN_PUCK_SPEED = 2;
export const FRICTION = 0.995;
export const RESTITUTION = 0.85; // bounciness

// Goals
export const GOAL_WIDTH = 140; // horizontal span
export const GOAL_DEPTH = 14;  // how far into the field

// Scoring
export const WINNING_SCORE = 7;

// Trail
export const TRAIL_LENGTH = 12;

// AI speeds per difficulty
export const AI_SPEED = {
  easy: 3.5,
  medium: 6.0,
  hard: 10.0,
} as const;

// AI accuracy (0 = perfect, higher = more error)
export const AI_ERROR = {
  easy: 40,
  medium: 18,
  hard: 4,
} as const;

// AI reaction distance (how close puck must be before AI acts offensively)
export const AI_OFFENSIVE_THRESHOLD = {
  easy: 0.35,   // fraction of canvas height
  medium: 0.5,
  hard: 0.65,
} as const;

// Colors
export const COLORS = {
  background: '#0a0a14',
  table: '#0d1117',
  tableLine: '#1e3a5f',
  centerLine: '#1e3a5f',
  playerPaddle: '#00f5ff',
  aiPaddle: '#ff00ff',
  puck: '#ffffff',
  puckGlow: '#a78bfa',
  goalPlayer: '#00f5ff',
  goalAi: '#ff00ff',
  neonCyan: '#00f5ff',
  neonMagenta: '#ff00ff',
  neonPurple: '#7c3aed',
  scoreText: '#ffffff',
} as const;
