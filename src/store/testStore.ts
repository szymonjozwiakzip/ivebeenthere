import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TestAnswer, TestConfig, TestPhase } from '@/types/test';
import { isMapClickQuizMode, usesQuestionQueue } from '@/utils/testModes';
import { shuffleArray } from '@/utils/shuffle';

const TEST_STORAGE_KEY = 'ivebeenthere-test-session';

interface TestState {
  phase: TestPhase;
  config: TestConfig | null;
  countryPool: string[];
  questionQueue: string[];
  currentQuestionId: string | null;
  answers: TestAnswer[];
  selectedCountryId: string | null;
  startedAt: number | null;
  endedAt: number | null;
  startTest: (config: TestConfig, countryPool: string[]) => void;
  endTest: () => void;
  resetTest: () => void;
  backToSetup: () => void;
  selectCountry: (id: string | null) => void;
  submitAnswer: (answer: TestAnswer) => void;
  submitFlagMapClick: (
    clickedCountryId: string,
    clickedName: string,
    correctName: string,
    elapsedMs: number,
  ) => void;
  getAnswerForCountry: (countryId: string) => TestAnswer | undefined;
  isCountryAnswered: (countryId: string) => boolean;
}

const initialState = {
  phase: 'setup' as TestPhase,
  config: null,
  countryPool: [] as string[],
  questionQueue: [] as string[],
  currentQuestionId: null as string | null,
  answers: [] as TestAnswer[],
  selectedCountryId: null as string | null,
  startedAt: null as number | null,
  endedAt: null as number | null,
};

function buildQuestionQueue(pool: string[], questionCount: number): string[] {
  const shuffled = shuffleArray(pool);
  if (!questionCount || questionCount >= pool.length) return shuffled;
  return shuffled.slice(0, questionCount);
}

function advanceQueue(
  state: TestState,
  answers: TestAnswer[],
): Partial<TestState> {
  const nextId = state.questionQueue.find(
    (id) => !answers.some((a) => a.countryId === id),
  );
  if (!nextId) {
    return {
      answers,
      currentQuestionId: null,
      selectedCountryId: null,
      phase: 'summary',
      endedAt: Date.now(),
    };
  }
  return {
    answers,
    currentQuestionId: nextId,
    selectedCountryId: state.config?.mode === 'flags' ? nextId : null,
  };
}

export const useTestStore = create<TestState>()(
  persist(
    (set, get) => ({
      ...initialState,

      startTest: (config, countryPool) => {
        const questionQueue = usesQuestionQueue(config.mode)
          ? buildQuestionQueue(countryPool, config.questionCount)
          : countryPool;
        const firstQuestion = questionQueue[0] ?? null;

        set({
          phase: 'running',
          config,
          countryPool,
          questionQueue,
          answers: [],
          currentQuestionId: usesQuestionQueue(config.mode) ? firstQuestion : null,
          selectedCountryId: config.mode === 'flags' ? firstQuestion : null,
          startedAt: Date.now(),
          endedAt: null,
        });
      },

      endTest: () =>
        set({
          phase: 'summary',
          selectedCountryId: null,
          currentQuestionId: null,
          endedAt: Date.now(),
        }),

      resetTest: () => set({ ...initialState }),

      backToSetup: () => set({ ...initialState, phase: 'setup' }),

      selectCountry: (id) => set({ selectedCountryId: id }),

      submitAnswer: (answer) =>
        set((state) => {
          const withoutDuplicate = state.answers.filter(
            (a) => a.countryId !== answer.countryId,
          );
          const answers = [...withoutDuplicate, answer];

          if (state.config?.mode === 'flags' || state.config?.mode === 'capitals') {
            return advanceQueue(state, answers);
          }

          return { answers, selectedCountryId: null };
        }),

      submitFlagMapClick: (clickedCountryId, clickedName, correctName, elapsedMs) =>
        set((state) => {
          const target = state.currentQuestionId;
          if (!target || !isMapClickQuizMode(state.config?.mode ?? 'map')) return state;

          const answer: TestAnswer = {
            countryId: target,
            userAnswer: clickedName,
            correctName,
            isCorrect: clickedCountryId === target,
            answeredAtMs: elapsedMs,
          };

          const withoutDuplicate = state.answers.filter(
            (a) => a.countryId !== answer.countryId,
          );
          const answers = [...withoutDuplicate, answer];
          return advanceQueue(state, answers);
        }),

      getAnswerForCountry: (countryId) =>
        get().answers.find((a) => a.countryId === countryId),

      isCountryAnswered: (countryId) =>
        get().answers.some((a) => a.countryId === countryId),
    }),
    {
      name: TEST_STORAGE_KEY,
      version: 3,
      migrate: (persisted, version) => {
        const state = persisted as TestState & {
          config?: TestConfig & { mode?: TestConfig['mode']; questionCount?: number };
        };
        if (version < 2) {
          if (state.config && state.config.mode === undefined) {
            state.config = { ...state.config, mode: 'map', questionCount: 0 };
          }
          if (!state.questionQueue) {
            state.questionQueue = state.countryPool ?? [];
          }
        }
        if (version < 3) {
          if (state.currentQuestionId === undefined) {
            const mode = state.config?.mode;
            state.currentQuestionId =
              mode === 'flags' ? (state.selectedCountryId ?? null) : null;
          }
        }
        return state;
      },
    },
  ),
);
