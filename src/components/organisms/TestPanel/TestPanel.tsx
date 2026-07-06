import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { TestTimer } from '@/components/atoms/TestTimer';
import { TestSetup } from '@/components/molecules/TestSetup';
import { TestQuizPanel } from '@/components/molecules/TestQuizPanel';
import { FlagTestQuiz } from '@/components/molecules/FlagTestQuiz';
import { FlagMapQuizPanel } from '@/components/molecules/FlagMapQuizPanel';
import { CapitalTestQuiz } from '@/components/molecules/CapitalTestQuiz';
import { CapitalMapQuizPanel } from '@/components/molecules/CapitalMapQuizPanel';
import { TestSummary } from '@/components/molecules/TestSummary';
import { TestMap } from '@/components/organisms/TestMap';
import { useTestStore } from '@/store/testStore';
import { useTestTimer } from '@/hooks/useTestTimer';
import { buildTestCountryPool } from '@/utils/testScope';
import { getListCountryIds } from '@/utils/countryList';
import { getCapitalCountryIds } from '@/utils/capitals';
import { isMapClickQuizMode } from '@/utils/testModes';
import type { TestConfig } from '@/types/test';
import styles from './TestPanel.module.css';

interface TestPanelProps {
  countryNames: Map<string, string>;
}

interface ClickFeedback {
  correct: boolean;
  clickedName: string;
  targetName: string;
}

function buildPoolForConfig(config: TestConfig): string[] {
  const ids =
    config.mode === 'capitals' || config.mode === 'capital-map'
      ? getCapitalCountryIds()
      : getListCountryIds();
  return buildTestCountryPool(config.scope, ids);
}

export function TestPanel({ countryNames }: TestPanelProps) {
  const phase = useTestStore((s) => s.phase);
  const config = useTestStore((s) => s.config);
  const startedAt = useTestStore((s) => s.startedAt);
  const currentQuestionId = useTestStore((s) => s.currentQuestionId);
  const startTest = useTestStore((s) => s.startTest);
  const endTest = useTestStore((s) => s.endTest);
  const resetTest = useTestStore((s) => s.resetTest);
  const backToSetup = useTestStore((s) => s.backToSetup);
  const submitFlagMapClick = useTestStore((s) => s.submitFlagMapClick);

  const [lastFeedback, setLastFeedback] = useState<ClickFeedback | null>(null);
  const [pendingClickId, setPendingClickId] = useState<string | null>(null);

  const handleExpire = useCallback(() => {
    if (useTestStore.getState().phase === 'running') {
      endTest();
    }
  }, [endTest]);

  const { displayTime, elapsedMs } = useTestTimer({
    mode: config?.timerMode ?? 'count-up',
    durationSeconds: config?.durationSeconds ?? 0,
    startedAt,
    running: phase === 'running',
    onExpire: handleExpire,
  });

  useEffect(() => {
    setLastFeedback(null);
    setPendingClickId(null);
  }, [currentQuestionId]);

  const handleStart = (testConfig: TestConfig) => {
    const pool = buildPoolForConfig(testConfig);
    if (pool.length === 0) return;
    startTest(testConfig, pool);
  };

  const handleMapQuizClick = useCallback(
    (clickedId: string) => {
      const target = useTestStore.getState().currentQuestionId;
      if (!target || pendingClickId) return;

      const targetName = countryNames.get(target) ?? target;
      const clickedName = countryNames.get(clickedId) ?? clickedId;
      const correct = clickedId === target;

      setPendingClickId(clickedId);
      setLastFeedback({ correct, clickedName, targetName });

      window.setTimeout(() => {
        submitFlagMapClick(clickedId, clickedName, targetName, elapsedMs);
        setPendingClickId(null);
        setLastFeedback(null);
      }, 900);
    },
    [countryNames, elapsedMs, pendingClickId, submitFlagMapClick],
  );

  const handleNewTest = () => resetTest();

  if (phase === 'setup') {
    return <TestSetup onStart={handleStart} />;
  }

  if (phase === 'summary') {
    return <TestSummary onNewTest={handleNewTest} />;
  }

  if (!config) return null;

  const mapQuizMode = isMapClickQuizMode(config.mode);

  return (
    <div className={styles.layout}>
      <div className={styles.toolbar}>
        <TestTimer time={displayTime} mode={config.timerMode} />
        <div className={styles.toolbarActions}>
          <Button variant="secondary" onClick={backToSetup}>
            Wróć do konfiguracji
          </Button>
          <Button variant="secondary" onClick={endTest}>
            Zakończ test
          </Button>
        </div>
      </div>

      {config.mode === 'flags' && (
        <div className={styles.flagArea}>
          <FlagTestQuiz countryNames={countryNames} elapsedMs={elapsedMs} />
        </div>
      )}

      {config.mode === 'capitals' && (
        <div className={styles.flagArea}>
          <CapitalTestQuiz countryNames={countryNames} elapsedMs={elapsedMs} />
        </div>
      )}

      {mapQuizMode && (
        <div className={styles.content}>
          <div className={styles.mapArea}>
            <TestMap
              scope={config.scope}
              flagMapMode
              pendingClickId={pendingClickId}
              onFlagMapClick={handleMapQuizClick}
            />
          </div>
          <aside className={styles.sidebar}>
            {config.mode === 'flag-map' ? (
              <FlagMapQuizPanel lastFeedback={lastFeedback} />
            ) : (
              <CapitalMapQuizPanel lastFeedback={lastFeedback} />
            )}
          </aside>
        </div>
      )}

      {config.mode === 'map' && (
        <div className={styles.content}>
          <div className={styles.mapArea}>
            <TestMap scope={config.scope} />
          </div>
          <aside className={styles.sidebar}>
            <TestQuizPanel countryNames={countryNames} elapsedMs={elapsedMs} />
          </aside>
        </div>
      )}
    </div>
  );
}
