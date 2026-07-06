import type { TestMode } from '@/types/test';

export function usesQuestionQueue(mode: TestMode): boolean {
  return (
    mode === 'flags' ||
    mode === 'flag-map' ||
    mode === 'capitals' ||
    mode === 'capital-map'
  );
}

export function isMapClickQuizMode(mode: TestMode): boolean {
  return mode === 'flag-map' || mode === 'capital-map';
}

export function getTestModeLabel(mode: TestMode): string {
  switch (mode) {
    case 'flags':
      return 'Flagi';
    case 'flag-map':
      return 'Flagi + mapa';
    case 'capitals':
      return 'Stolice';
    case 'capital-map':
      return 'Stolice + mapa';
    default:
      return 'Mapa';
  }
}
