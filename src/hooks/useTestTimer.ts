import { useState, useEffect, useCallback } from 'react';
import type { TestTimerMode } from '@/types/test';

interface UseTestTimerOptions {
  mode: TestTimerMode;
  durationSeconds: number;
  startedAt: number | null;
  running: boolean;
  onExpire?: () => void;
}

export function useTestTimer({
  mode,
  durationSeconds,
  startedAt,
  running,
  onExpire,
}: UseTestTimerOptions) {
  const [elapsedMs, setElapsedMs] = useState(0);

  const tick = useCallback(() => {
    if (!startedAt) return;
    setElapsedMs(Date.now() - startedAt);
  }, [startedAt]);

  useEffect(() => {
    if (!running || !startedAt) return;
    tick();
    const id = window.setInterval(tick, 200);
    return () => window.clearInterval(id);
  }, [running, startedAt, tick]);

  const remainingMs =
    mode === 'countdown' ? Math.max(0, durationSeconds * 1000 - elapsedMs) : elapsedMs;

  useEffect(() => {
    if (!running || mode !== 'countdown' || !startedAt) return;
    if (remainingMs <= 0) onExpire?.();
  }, [running, mode, startedAt, remainingMs, onExpire]);

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return {
    elapsedMs,
    displayTime: formatTime(mode === 'countdown' ? remainingMs : elapsedMs),
    isExpired: mode === 'countdown' && remainingMs <= 0,
  };
}
