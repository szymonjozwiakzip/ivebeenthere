import type { Continent } from '@/types';

export type TestPhase = 'setup' | 'running' | 'summary';
export type TestTimerMode = 'count-up' | 'countdown';
export type TestMode = 'map' | 'flags' | 'flag-map' | 'capitals' | 'capital-map';

export interface TestConfig {
  mode: TestMode;
  scope: 'world' | Continent[];
  timerMode: TestTimerMode;
  durationSeconds: number;
  /** Ile pytań wylosować z puli (0 = cała pula) */
  questionCount: number;
}

export interface TestAnswer {
  countryId: string;
  userAnswer: string;
  correctName: string;
  isCorrect: boolean;
  answeredAtMs: number;
}

export interface TestSession {
  phase: TestPhase;
  config: TestConfig | null;
  countryPool: string[];
  answers: TestAnswer[];
  selectedCountryId: string | null;
  startedAt: number | null;
  endedAt: number | null;
}
