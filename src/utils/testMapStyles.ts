export type TestCountryStatus = 'pending' | 'correct' | 'incorrect' | 'selected';

const COLORS = {
  pending: '#dde4ee',
  pendingHover: '#c8d3e3',
  correct: '#16a34a',
  correctHover: '#15803d',
  incorrect: '#dc2626',
  incorrectHover: '#b91c1c',
  selected: '#2563eb',
  selectedHover: '#1d4ed8',
  stroke: '#b8c5d6',
  strokeActive: '#1d4ed8',
};

export function getTestCountryStyle(status: TestCountryStatus) {
  switch (status) {
    case 'correct':
      return { fill: COLORS.correct, hover: COLORS.correctHover, stroke: COLORS.stroke, strokeWidth: 0.5 };
    case 'incorrect':
      return { fill: COLORS.incorrect, hover: COLORS.incorrectHover, stroke: COLORS.stroke, strokeWidth: 0.5 };
    case 'selected':
      return { fill: COLORS.selected, hover: COLORS.selectedHover, stroke: COLORS.strokeActive, strokeWidth: 1.2 };
    default:
      return { fill: COLORS.pending, hover: COLORS.pendingHover, stroke: COLORS.stroke, strokeWidth: 0.4 };
  }
}
