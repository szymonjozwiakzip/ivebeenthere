import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { CONTINENT_LABELS } from '@/data/constants';
import { getSelectableContinents } from '@/utils/testScope';
import { buildTestCountryPool } from '@/utils/testScope';
import { getListCountryIds } from '@/utils/countryList';
import { getCapitalCountryIds } from '@/utils/capitals';
import { usesQuestionQueue } from '@/utils/testModes';
import type { Continent } from '@/types';
import type { TestConfig, TestMode, TestTimerMode } from '@/types/test';
import styles from './TestSetup.module.css';

interface TestSetupProps {
  onStart: (config: TestConfig) => void;
}

const DURATION_OPTIONS = [
  { label: 'Bez limitu (w górę)', mode: 'count-up' as TestTimerMode, seconds: 0 },
  { label: '1 minuta', mode: 'countdown' as TestTimerMode, seconds: 60 },
  { label: '3 minuty', mode: 'countdown' as TestTimerMode, seconds: 180 },
  { label: '5 minut', mode: 'countdown' as TestTimerMode, seconds: 300 },
  { label: '10 minut', mode: 'countdown' as TestTimerMode, seconds: 600 },
];

const MODES: { id: TestMode; label: string }[] = [
  { id: 'map', label: 'Mapa' },
  { id: 'flags', label: 'Flagi' },
  { id: 'flag-map', label: 'Flagi + mapa' },
  { id: 'capitals', label: 'Stolice' },
  { id: 'capital-map', label: 'Stolice + mapa' },
];

function getPoolIds(mode: TestMode): string[] {
  return mode === 'capitals' || mode === 'capital-map'
    ? getCapitalCountryIds()
    : getListCountryIds();
}

function getModeDescription(mode: TestMode): string {
  switch (mode) {
    case 'map':
      return 'Wybierz zakres i czas, potem podpisuj kraje na mapie.';
    case 'flags':
      return 'Wybierz zakres, czas i liczbę flag — rozpoznawaj kraje po chorągiewkach.';
    case 'flag-map':
      return 'Zobacz flagę i kliknij właściwy kraj na mapie.';
    case 'capitals':
      return 'Wybierz zakres, czas i liczbę pytań — podawaj stolice wyświetlanych krajów.';
    case 'capital-map':
      return 'Zobacz stolicę i kliknij właściwy kraj na mapie.';
    default:
      return '';
  }
}

export function TestSetup({ onStart }: TestSetupProps) {
  const [mode, setMode] = useState<TestMode>('map');
  const [world, setWorld] = useState(true);
  const [continents, setContinents] = useState<Continent[]>([]);
  const [timerIndex, setTimerIndex] = useState(0);
  const [questionCount, setQuestionCount] = useState(20);

  const scope = world ? 'world' : continents;
  const poolSize = useMemo(
    () => buildTestCountryPool(scope, getPoolIds(mode)).length,
    [world, continents, mode],
  );

  useEffect(() => {
    setQuestionCount((prev) => Math.min(Math.max(1, prev), poolSize || 1));
  }, [poolSize]);

  const toggleContinent = (c: Continent) => {
    setWorld(false);
    setContinents((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  };

  const handleWorldToggle = () => {
    setWorld(true);
    setContinents([]);
  };

  const usesQueue = usesQuestionQueue(mode);

  const handleStart = () => {
    const timer = DURATION_OPTIONS[timerIndex];
    if (scope !== 'world' && scope.length === 0) return;

    onStart({
      mode,
      scope,
      timerMode: timer.mode,
      durationSeconds: timer.seconds,
      questionCount: usesQueue ? Math.min(questionCount, poolSize) : 0,
    });
  };

  const canStart = (world || continents.length > 0) && poolSize > 0;
  const useFullPool = usesQueue && questionCount >= poolSize;

  return (
    <div className={styles.setup}>
      <h2 className={styles.heading}>Konfiguracja testu</h2>
      <p className={styles.description}>{getModeDescription(mode)}</p>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Tryb</legend>
        <div className={styles.modeTabs}>
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`${styles.modeTab} ${mode === m.id ? styles.modeTabActive : ''}`}
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Zakres ({poolSize} krajów)</legend>
        <label className={styles.checkLabel}>
          <input type="checkbox" checked={world} onChange={handleWorldToggle} />
          Cały świat
        </label>
        <div className={styles.continentGrid}>
          {getSelectableContinents().map((c) => (
            <label key={c} className={styles.checkLabel}>
              <input
                type="checkbox"
                checked={!world && continents.includes(c)}
                onChange={() => toggleContinent(c)}
              />
              {CONTINENT_LABELS[c]}
            </label>
          ))}
        </div>
      </fieldset>

      {usesQueue && (
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Liczba pytań</legend>
          <p className={styles.fieldHint}>
            Dostępne w zakresie: {poolSize}. Losujemy bez powtórzeń.
          </p>
          <div className={styles.countRow}>
            <input
              type="range"
              className={styles.range}
              min={1}
              max={poolSize}
              value={Math.min(questionCount, poolSize)}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
            />
            <Input
              label="Pytań w teście"
              type="number"
              min={1}
              max={poolSize}
              value={String(Math.min(questionCount, poolSize))}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (!Number.isNaN(n)) {
                  setQuestionCount(Math.min(Math.max(1, n), poolSize));
                }
              }}
            />
          </div>
          <label className={styles.checkLabel}>
            <input
              type="checkbox"
              checked={useFullPool}
              onChange={() => setQuestionCount(useFullPool ? Math.min(20, poolSize) : poolSize)}
            />
            Wszystkie z zakresu ({poolSize})
          </label>
        </fieldset>
      )}

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Czas</legend>
        <div className={styles.timerOptions}>
          {DURATION_OPTIONS.map((opt, i) => (
            <label key={opt.label} className={styles.radioLabel}>
              <input
                type="radio"
                name="timer"
                checked={timerIndex === i}
                onChange={() => setTimerIndex(i)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      <Button variant="primary" fullWidth onClick={handleStart} disabled={!canStart}>
        Rozpocznij test
      </Button>
    </div>
  );
}
