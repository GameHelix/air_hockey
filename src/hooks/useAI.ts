'use client';

import { Difficulty, Paddle, Puck, Vec2 } from '@/lib/types';
import { AI_SPEED, AI_ERROR, AI_OFFENSIVE_THRESHOLD, CANVAS_WIDTH, CANVAS_HEIGHT, PADDLE_RADIUS } from '@/lib/constants';
import { clamp } from '@/lib/physics';

/**
 * Computes the new AI paddle position each frame.
 * Returns the updated paddle.
 */
export function computeAIMove(
  aiPaddle: Paddle,
  puck: Puck,
  difficulty: Difficulty,
  deltaTime: number,
): Paddle {
  const speed = AI_SPEED[difficulty];
  const error = AI_ERROR[difficulty];
  const offensiveThreshold = AI_OFFENSIVE_THRESHOLD[difficulty] * CANVAS_HEIGHT;

  // Home position (defensive)
  const homeY = CANVAS_HEIGHT / 4;
  const homeX = CANVAS_WIDTH / 2;

  // Is the puck in the AI's offensive zone?
  const puckInAIHalf = puck.position.y < CANVAS_HEIGHT / 2;
  const puckMovingTowardAI = puck.velocity.y < 0;

  let targetX: number;
  let targetY: number;

  if (puckInAIHalf && (puckMovingTowardAI || puck.position.y < offensiveThreshold)) {
    // Offensive: chase the puck with some error
    const randomError = (Math.random() - 0.5) * error;
    targetX = puck.position.x + randomError;
    targetY = puck.position.y - PADDLE_RADIUS * 0.5;
  } else {
    // Defensive: move toward center-home position, track puck X loosely
    const trackFactor = difficulty === 'easy' ? 0.3 : difficulty === 'medium' ? 0.6 : 0.85;
    targetX = homeX + (puck.position.x - homeX) * trackFactor;
    targetY = homeY;
  }

  // Constrain target to AI half
  targetX = clamp(targetX, PADDLE_RADIUS, CANVAS_WIDTH - PADDLE_RADIUS);
  targetY = clamp(targetY, PADDLE_RADIUS, CANVAS_HEIGHT / 2 - PADDLE_RADIUS);

  // Move toward target
  const dx = targetX - aiPaddle.position.x;
  const dy = targetY - aiPaddle.position.y;
  const d = Math.sqrt(dx * dx + dy * dy);

  if (d < 1) {
    return { ...aiPaddle, velocity: { x: 0, y: 0 } };
  }

  const frameSpeed = speed * deltaTime;
  const move = Math.min(d, frameSpeed);
  const vx = (dx / d) * move;
  const vy = (dy / d) * move;

  const newPos: Vec2 = {
    x: aiPaddle.position.x + vx,
    y: aiPaddle.position.y + vy,
  };

  return {
    ...aiPaddle,
    position: newPos,
    velocity: { x: vx, y: vy },
  };
}
