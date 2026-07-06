import { useMemo } from 'react';
import { Badge } from '@/components/atoms/Badge';
import { FlagImage } from '@/components/atoms/FlagImage';
import { TestQuizProgress } from '@/components/molecules/TestQuizProgress';
import { useTestStore } from '@/store/testStore';
import styles from './FlagMapQuizPanel.module.css';

interface FlagMapQuizPanelProps {
  lastFeedback: { correct: boolean; clickedName: string; targetName: string } | null;
}

export function FlagMapQuizPanel({ lastFeedback }: FlagMapQuizPanelProps) {
  const currentQuestionId = useTestStore((s) => s.currentQuestionId);
  const answers = useTestStore((s) => s.answers);
  const questionQueue = useTestStore((s) => s.questionQueue);

  const questionIndex = currentQuestionId ? answers.length + 1 : answers.length;
  const correctCount = useMemo(
    () => answers.filter((a) => a.isCorrect).length,
    [answers],
  );

  if (!currentQuestionId) {
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
        <h3 className={styles.prompt}>Kliknij ten kraj na mapie</h3>
        <Badge variant="default">
          {`${questionIndex} / ${questionQueue.length}`}
        </Badge>
      </div>

      <FlagImage
        countryId={currentQuestionId}
        alt="Flaga kraju do rozpoznania"
      />

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
