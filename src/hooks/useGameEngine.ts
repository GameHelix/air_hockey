'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { GameState, GameConfig, Score, Puck, Paddle } from '@/lib/types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  WINNING_SCORE,
  TRAIL_LENGTH,
  COLORS,
  GOAL_WIDTH,
  GOAL_DEPTH,
} from '@/lib/constants';
import {
  resetPuck,
  initialPlayerPaddle,
  initialAIPaddle,
  bouncePuckOffWalls,
  resolvePaddlePuckCollision,
  constrainPaddleToHalf,
  applyFriction,
  updatePuckTrail,
  checkGoal,
  GOAL_LEFT,
  GOAL_RIGHT,
  dist,
} from '@/lib/physics';
import { computeAIMove } from './useAI';
import { useSound } from './useSound';

interface UseGameEngineProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  config: GameConfig;
  gameState: GameState;
  onGoal: (scorer: 'player' | 'ai') => void;
  onGameEnd: (winner: 'player' | 'ai') => void;
}

export function useGameEngine({
  canvasRef,
  config,
  gameState,
  onGoal,
  onGameEnd,
}: UseGameEngineProps) {
  // Game objects stored in refs to avoid re-render overhead
  const puckRef = useRef<Puck>(resetPuck(true));
  const playerPaddleRef = useRef<Paddle>(initialPlayerPaddle());
  const aiPaddleRef = useRef<Paddle>(initialAIPaddle());
  const scoreRef = useRef<Score>({ player: 0, ai: 0 });
  const lastTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const gameStateRef = useRef<GameState>(gameState);
  const scoringCooldownRef = useRef<number>(0); // frames to wait after a goal

  // Mouse / touch target for player paddle
  const targetPosRef = useRef({ x: CANVAS_WIDTH / 2, y: (CANVAS_HEIGHT * 3) / 4 });

  // Sound
  const sound = useSound(config.soundEnabled);

  // Keep gameState in ref for use inside rAF callback
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  // ─── Input handling ────────────────────────────────────────────────────────

  const getCanvasPos = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    },
    [canvasRef],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const pos = getCanvasPos(e.clientX, e.clientY);
      if (pos) targetPosRef.current = pos;
    },
    [getCanvasPos],
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const pos = getCanvasPos(touch.clientX, touch.clientY);
      if (pos) targetPosRef.current = pos;
    },
    [getCanvasPos],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchstart', handleTouchMove, { passive: false });
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchstart', handleTouchMove);
    };
  }, [canvasRef, handleMouseMove, handleTouchMove]);

  // ─── Rendering ────────────────────────────────────────────────────────────

  const render = useCallback((ctx: CanvasRenderingContext2D) => {
    const puck = puckRef.current;
    const playerPaddle = playerPaddleRef.current;
    const aiPaddle = aiPaddleRef.current;

    // Background
    ctx.fillStyle = COLORS.table;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw table border glow
    ctx.save();
    ctx.strokeStyle = COLORS.neonCyan;
    ctx.lineWidth = 3;
    ctx.shadowColor = COLORS.neonCyan;
    ctx.shadowBlur = 12;
    ctx.strokeRect(2, 2, CANVAS_WIDTH - 4, CANVAS_HEIGHT - 4);
    ctx.restore();

    // Center line
    ctx.save();
    ctx.strokeStyle = COLORS.centerLine;
    ctx.lineWidth = 2;
    ctx.setLineDash([16, 10]);
    ctx.shadowColor = COLORS.neonPurple;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT / 2);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT / 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Center circle
    ctx.save();
    ctx.strokeStyle = COLORS.centerLine;
    ctx.lineWidth = 2;
    ctx.shadowColor = COLORS.neonPurple;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 60, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Goals
    drawGoal(ctx, true);  // AI goal (top)
    drawGoal(ctx, false); // Player goal (bottom)

    // Puck trail
    puck.trail.forEach((pos, i) => {
      const alpha = (1 - i / TRAIL_LENGTH) * 0.4;
      const radius = puck.radius * (1 - i / TRAIL_LENGTH) * 0.7;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = COLORS.puckGlow;
      ctx.shadowColor = COLORS.puckGlow;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Puck
    ctx.save();
    ctx.shadowColor = COLORS.puckGlow;
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#e0e0ff';
    ctx.beginPath();
    ctx.arc(puck.position.x, puck.position.y, puck.radius, 0, Math.PI * 2);
    ctx.fill();
    // Inner highlight
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.arc(puck.position.x - 4, puck.position.y - 4, puck.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // AI paddle
    drawPaddle(ctx, aiPaddle, COLORS.aiPaddle, COLORS.neonMagenta);

    // Player paddle
    drawPaddle(ctx, playerPaddle, COLORS.playerPaddle, COLORS.neonCyan);

  }, []);

  function drawGoal(ctx: CanvasRenderingContext2D, isAI: boolean) {
    const y = isAI ? 0 : CANVAS_HEIGHT - GOAL_DEPTH;
    const color = isAI ? COLORS.goalAi : COLORS.goalPlayer;

    ctx.save();
    ctx.fillStyle = color + '22';
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.shadowColor = color;
    ctx.shadowBlur = 16;
    ctx.fillRect(GOAL_LEFT, y, GOAL_WIDTH, GOAL_DEPTH);
    ctx.strokeRect(GOAL_LEFT, y, GOAL_WIDTH, GOAL_DEPTH);
    ctx.restore();
  }

  function drawPaddle(
    ctx: CanvasRenderingContext2D,
    paddle: Paddle,
    fillColor: string,
    glowColor: string,
  ) {
    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 24;

    // Outer glow ring
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(paddle.position.x, paddle.position.y, paddle.radius + 4, 0, Math.PI * 2);
    ctx.stroke();

    // Main body
    const grad = ctx.createRadialGradient(
      paddle.position.x - paddle.radius * 0.3,
      paddle.position.y - paddle.radius * 0.3,
      0,
      paddle.position.x,
      paddle.position.y,
      paddle.radius,
    );
    grad.addColorStop(0, fillColor + 'dd');
    grad.addColorStop(1, fillColor + '55');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(paddle.position.x, paddle.position.y, paddle.radius, 0, Math.PI * 2);
    ctx.fill();

    // Center dot
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.arc(paddle.position.x, paddle.position.y, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ─── Game loop ────────────────────────────────────────────────────────────

  const tick = useCallback(
    (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (gameStateRef.current !== 'playing') {
        render(ctx);
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const deltaTime = Math.min((time - lastTimeRef.current) / 16.67, 3); // cap at 3x
      lastTimeRef.current = time;

      // Scoring cooldown (after a goal, freeze briefly)
      if (scoringCooldownRef.current > 0) {
        scoringCooldownRef.current -= 1;
        render(ctx);
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // ── Move player paddle toward mouse/touch ──
      const target = targetPosRef.current;
      const pp = playerPaddleRef.current;
      const pdx = target.x - pp.position.x;
      const pdy = target.y - pp.position.y;
      const maxPlayerSpeed = 18;
      const newPx = pp.position.x + clampAbs(pdx, maxPlayerSpeed * deltaTime);
      const newPy = pp.position.y + clampAbs(pdy, maxPlayerSpeed * deltaTime);
      const newVelocity = {
        x: clampAbs(pdx, maxPlayerSpeed * deltaTime),
        y: clampAbs(pdy, maxPlayerSpeed * deltaTime),
      };
      playerPaddleRef.current = constrainPaddleToHalf(
        { ...pp, position: { x: newPx, y: newPy }, velocity: newVelocity },
        true,
      );

      // ── AI move ──
      aiPaddleRef.current = constrainPaddleToHalf(
        computeAIMove(aiPaddleRef.current, puckRef.current, config.difficulty, deltaTime),
        false,
      );

      // ── Physics ──
      let puck = puckRef.current;
      puck = { ...puck, velocity: applyFriction(puck.velocity) };
      puck = { ...puck, position: { x: puck.position.x + puck.velocity.x * deltaTime, y: puck.position.y + puck.velocity.y * deltaTime } };
      puck = updatePuckTrail(puck);

      // Paddle collisions
      const prevVelPlayer = { ...puck.velocity };
      puck = resolvePaddlePuckCollision(playerPaddleRef.current, puck);
      if (puck.velocity.x !== prevVelPlayer.x || puck.velocity.y !== prevVelPlayer.y) {
        sound.playPaddleHit();
      }

      const prevVelAI = { ...puck.velocity };
      puck = resolvePaddlePuckCollision(aiPaddleRef.current, puck);
      if (puck.velocity.x !== prevVelAI.x || puck.velocity.y !== prevVelAI.y) {
        sound.playPaddleHit();
      }

      // Wall bounces (track if hit)
      const prevVel = { ...puck.velocity };
      puck = bouncePuckOffWalls(puck);
      if (
        Math.sign(puck.velocity.x) !== Math.sign(prevVel.x) ||
        Math.sign(puck.velocity.y) !== Math.sign(prevVel.y)
      ) {
        sound.playWallHit();
      }

      puckRef.current = puck;

      // ── Goal detection ──
      const goal = checkGoal(puck);
      if (goal) {
        sound.playGoal();
        scoreRef.current = {
          player: goal === 'player' ? scoreRef.current.player + 1 : scoreRef.current.player,
          ai: goal === 'ai' ? scoreRef.current.ai + 1 : scoreRef.current.ai,
        };

        const score = scoreRef.current;
        onGoal(goal);

        if (score.player >= WINNING_SCORE) {
          sound.playWin();
          onGameEnd('player');
        } else if (score.ai >= WINNING_SCORE) {
          sound.playLose();
          onGameEnd('ai');
        } else {
          // Reset puck toward scoring team
          puckRef.current = resetPuck(goal === 'ai');
          scoringCooldownRef.current = 90; // ~1.5 seconds at 60fps
        }
      }

      render(ctx);
      rafRef.current = requestAnimationFrame(tick);
    },
    [config.difficulty, onGoal, onGameEnd, render, sound],
  );

  // Start / stop loop
  useEffect(() => {
    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  // Reset game objects
  const resetGame = useCallback(() => {
    puckRef.current = resetPuck(true);
    playerPaddleRef.current = initialPlayerPaddle();
    aiPaddleRef.current = initialAIPaddle();
    scoreRef.current = { player: 0, ai: 0 };
    scoringCooldownRef.current = 0;
    targetPosRef.current = { x: CANVAS_WIDTH / 2, y: (CANVAS_HEIGHT * 3) / 4 };
  }, []);

  return { resetGame, scoreRef };
}

function clampAbs(val: number, max: number): number {
  return Math.max(-max, Math.min(max, val));
}
