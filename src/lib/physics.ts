import { Vec2, Paddle, Puck } from './types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PUCK_RADIUS,
  PADDLE_RADIUS,
  MAX_PUCK_SPEED,
  FRICTION,
  RESTITUTION,
  GOAL_WIDTH,
  GOAL_DEPTH,
  TRAIL_LENGTH,
} from './constants';

/** Clamp a value between min and max */
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/** Distance between two points */
export function dist(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Normalize a vector, returns zero-vector if length is 0 */
export function normalize(v: Vec2): Vec2 {
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

/** Magnitude of a vector */
export function magnitude(v: Vec2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

/** Cap puck speed to MAX_PUCK_SPEED */
export function capSpeed(vel: Vec2, maxSpeed = MAX_PUCK_SPEED): Vec2 {
  const mag = magnitude(vel);
  if (mag > maxSpeed) {
    const scale = maxSpeed / mag;
    return { x: vel.x * scale, y: vel.y * scale };
  }
  return vel;
}

/** Goal x-range (centered horizontally) */
export const GOAL_LEFT = (CANVAS_WIDTH - GOAL_WIDTH) / 2;
export const GOAL_RIGHT = (CANVAS_WIDTH + GOAL_WIDTH) / 2;

/** Check if a goal was scored. Returns 'player' if AI goal scored (top), 'ai' if player goal (bottom), null otherwise */
export function checkGoal(puck: Puck): 'player' | 'ai' | null {
  const cx = puck.position.x;
  const cy = puck.position.y;
  const r = puck.radius;

  // AI goal (top of canvas) — player scores
  if (cy - r <= 0 && cx > GOAL_LEFT && cx < GOAL_RIGHT) {
    return 'player';
  }
  // Player goal (bottom of canvas) — AI scores
  if (cy + r >= CANVAS_HEIGHT && cx > GOAL_LEFT && cx < GOAL_RIGHT) {
    return 'ai';
  }
  return null;
}

/** Apply friction each frame */
export function applyFriction(vel: Vec2): Vec2 {
  return { x: vel.x * FRICTION, y: vel.y * FRICTION };
}

/** Bounce puck off walls, returns updated puck */
export function bouncePuckOffWalls(puck: Puck): Puck {
  let { x, y } = puck.position;
  let { x: vx, y: vy } = puck.velocity;
  const r = puck.radius;

  // Left wall
  if (x - r < 0) {
    x = r;
    vx = Math.abs(vx) * RESTITUTION;
  }
  // Right wall
  if (x + r > CANVAS_WIDTH) {
    x = CANVAS_WIDTH - r;
    vx = -Math.abs(vx) * RESTITUTION;
  }

  // Top wall — but only outside goal mouth
  if (y - r < 0) {
    const inGoal = x > GOAL_LEFT && x < GOAL_RIGHT;
    if (!inGoal) {
      y = r;
      vy = Math.abs(vy) * RESTITUTION;
    }
  }
  // Bottom wall — but only outside goal mouth
  if (y + r > CANVAS_HEIGHT) {
    const inGoal = x > GOAL_LEFT && x < GOAL_RIGHT;
    if (!inGoal) {
      y = CANVAS_HEIGHT - r;
      vy = -Math.abs(vy) * RESTITUTION;
    }
  }

  return {
    ...puck,
    position: { x, y },
    velocity: { x: vx, y: vy },
  };
}

/** Circle-circle collision resolution between paddle and puck */
export function resolvePaddlePuckCollision(paddle: Paddle, puck: Puck): Puck {
  const d = dist(paddle.position, puck.position);
  const minDist = paddle.radius + puck.radius;

  if (d >= minDist) return puck; // no collision

  // Collision normal from paddle center to puck center
  const nx = d === 0 ? 0 : (puck.position.x - paddle.position.x) / d;
  const ny = d === 0 ? 1 : (puck.position.y - paddle.position.y) / d;

  // Separate the puck so it's not overlapping
  const overlap = minDist - d;
  const newX = puck.position.x + nx * overlap;
  const newY = puck.position.y + ny * overlap;

  // Relative velocity
  const rvx = puck.velocity.x - paddle.velocity.x;
  const rvy = puck.velocity.y - paddle.velocity.y;

  // Velocity along the normal
  const vn = rvx * nx + rvy * ny;

  // Only resolve if puck is moving toward paddle (vn < 0)
  if (vn >= 0) {
    return { ...puck, position: { x: newX, y: newY } };
  }

  // Impulse magnitude
  const impulse = -(1 + RESTITUTION) * vn;

  // Transfer paddle velocity boost + impulse
  let newVx = puck.velocity.x + impulse * nx + paddle.velocity.x * 0.5;
  let newVy = puck.velocity.y + impulse * ny + paddle.velocity.y * 0.5;

  const newVel = capSpeed({ x: newVx, y: newVy });

  // Update trail
  const trail = [{ x: puck.position.x, y: puck.position.y }, ...puck.trail].slice(0, TRAIL_LENGTH);

  return {
    ...puck,
    position: { x: newX, y: newY },
    velocity: newVel,
    trail,
  };
}

/** Constrain a paddle to its half of the field */
export function constrainPaddleToHalf(
  paddle: Paddle,
  isPlayer: boolean
): Paddle {
  const r = paddle.radius;
  let { x, y } = paddle.position;

  x = clamp(x, r, CANVAS_WIDTH - r);

  if (isPlayer) {
    // Player lives in the bottom half
    y = clamp(y, CANVAS_HEIGHT / 2 + r, CANVAS_HEIGHT - r);
  } else {
    // AI lives in the top half
    y = clamp(y, r, CANVAS_HEIGHT / 2 - r);
  }

  return { ...paddle, position: { x, y } };
}

/** Update trail for puck each frame */
export function updatePuckTrail(puck: Puck): Puck {
  const trail = [{ x: puck.position.x, y: puck.position.y }, ...puck.trail].slice(0, TRAIL_LENGTH);
  return { ...puck, trail };
}

/** Reset puck to center with a random velocity toward the losing player */
export function resetPuck(towardsPlayer: boolean): Puck {
  const angle = towardsPlayer
    ? (Math.PI / 4) + Math.random() * (Math.PI / 2)   // downward
    : -(Math.PI / 4) - Math.random() * (Math.PI / 2); // upward

  const speed = 5;
  return {
    position: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 },
    velocity: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
    radius: PUCK_RADIUS,
    trail: [],
  };
}

/** Initial paddle positions */
export function initialPlayerPaddle(): Paddle {
  return {
    position: { x: CANVAS_WIDTH / 2, y: (CANVAS_HEIGHT * 3) / 4 },
    velocity: { x: 0, y: 0 },
    radius: PADDLE_RADIUS,
  };
}

export function initialAIPaddle(): Paddle {
  return {
    position: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 4 },
    velocity: { x: 0, y: 0 },
    radius: PADDLE_RADIUS,
  };
}
