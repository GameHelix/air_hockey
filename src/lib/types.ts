export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameState = 'menu' | 'playing' | 'paused' | 'ended';

export interface Vec2 {
  x: number;
  y: number;
}

export interface Paddle {
  position: Vec2;
  velocity: Vec2;
  radius: number;
}

export interface Puck {
  position: Vec2;
  velocity: Vec2;
  radius: number;
  trail: Vec2[];
}

export interface Score {
  player: number;
  ai: number;
}

export interface GameConfig {
  difficulty: Difficulty;
  soundEnabled: boolean;
  musicEnabled: boolean;
}

export interface GameSnapshot {
  playerPaddle: Paddle;
  aiPaddle: Paddle;
  puck: Puck;
  score: Score;
  gameState: GameState;
  winner: 'player' | 'ai' | null;
}
