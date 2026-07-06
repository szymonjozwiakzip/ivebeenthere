import { useMemo } from 'react';
import { Badge } from '@/components/atoms/Badge';
import { QuizPromptDisplay } from '@/components/atoms/QuizPromptDisplay';
import { TestQuizProgress } from '@/components/molecules/TestQuizProgress';
import { useTestStore } from '@/store/testStore';
import { getCapitalName } from '@/utils/capitals';
import styles from './CapitalMapQuizPanel.module.css';

interface CapitalMapQuizPanelProps {
  lastFeedback: { correct: boolean; clickedName: string; targetName: string } | null;
}

export function CapitalMapQuizPanel({ lastFeedback }: CapitalMapQuizPanelProps) {
  const currentQuestionId = useTestStore((s) => s.currentQuestionId);
  const answers = useTestStore((s) => s.answers);
  const questionQueue = useTestStore((s) => s.questionQueue);

  const capitalName = currentQuestionId ? getCapitalName(currentQuestionId) : null;
  const questionIndex = currentQuestionId ? answers.length + 1 : answers.length;
  const correctCount = useMemo(
    () => answers.filter((a) => a.isCorrect).length,
    [answers],
  );

  if (!currentQuestionId || !capitalName) {
    return (
      <div className={styles.panel}>
        <p className={styles.done}>Test zakończony!</p>
        <TestQuizProgress
          answered={answers.length}
          total={questionQueue.length}
          correct={correctCount}
        />
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.prompt}>Kliknij kraj tej stolicy na mapie</h3>
        <Badge variant="default">
          {`${questionIndex} / ${questionQueue.length}`}
        </Badge>
      </div>

      <QuizPromptDisplay label={capitalName} size="compact" />

      {lastFeedback && (
        <div
          className={`${styles.feedback} ${lastFeedback.correct ? styles.feedbackCorrect : styles.feedbackWrong}`}
        >
          <Badge variant={lastFeedback.correct ? 'success' : 'default'}>
            {lastFeedback.correct ? 'Poprawnie' : 'Błędnie'}
          </Badge>
          {!lastFeedback.correct && (
            <p className={styles.feedbackText}>
              Kliknąłeś: <strong>{lastFeedback.clickedName}</strong>
              <br />
              Poprawnie: <strong>{lastFeedback.targetName}</strong>
            </p>
          )}
        </div>
      )}

      <TestQuizProgress
        answered={answers.length}
        total={questionQueue.length}
        correct={correctCount}
      />
    </div>
  );
}
