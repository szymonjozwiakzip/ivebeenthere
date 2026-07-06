import { useState, useEffect } from 'react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Badge } from '@/components/atoms/Badge';
import { FlagImage } from '@/components/atoms/FlagImage';
import { TestQuizProgress } from '@/components/molecules/TestQuizProgress';
import { useTestStore } from '@/store/testStore';
import { checkCountryAnswer } from '@/utils/testAnswer';
import type { TestAnswer } from '@/types/test';
import styles from './FlagTestQuiz.module.css';

interface FlagTestQuizProps {
  countryNames: Map<string, string>;
  elapsedMs: number;
}

export function FlagTestQuiz({ countryNames, elapsedMs }: FlagTestQuizProps) {
  const currentQuestionId = useTestStore((s) => s.currentQuestionId);
  const submitAnswer = useTestStore((s) => s.submitAnswer);
  const answers = useTestStore((s) => s.answers);
  const questionQueue = useTestStore((s) => s.questionQueue);

  const [input, setInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<TestAnswer | null>(null);

  const countryName = currentQuestionId
    ? countryNames.get(currentQuestionId) ?? currentQuestionId
    : null;
  const questionIndex = currentQuestionId
    ? answers.length + (showResult ? 0 : 1)
    : answers.length;

  useEffect(() => {
    setInput('');
    setShowResult(false);
    setLastResult(null);
  }, [currentQuestionId]);

  const handleSubmit = () => {
    if (!currentQuestionId || !countryName || showResult) return;
    const correct = checkCountryAnswer(input, currentQuestionId, countryNames);
    const answer: TestAnswer = {
      countryId: currentQuestionId,
      userAnswer: input.trim(),
      correctName: countryName,
      isCorrect: correct,
      answeredAtMs: elapsedMs,
    };
    setLastResult(answer);
    setShowResult(true);
  };

  const handleNext = () => {
    if (!lastResult) return;
    submitAnswer(lastResult);
    setShowResult(false);
    setLastResult(null);
    setInput('');
  };

  const correctCount = answers.filter((a) => a.isCorrect).length;

  if (!currentQuestionId || !countryName) {
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
        <h3 className={styles.prompt}>Jak nazywa się ten kraj?</h3>
        <Badge variant="default">
          {`${questionIndex} / ${questionQueue.length}`}
        </Badge>
      </div>

      <FlagImage
        countryId={currentQuestionId}
        alt="Flaga kraju do rozpoznania"
      />

      {showResult && lastResult ? (
        <div className={styles.result}>
          <Badge variant={lastResult.isCorrect ? 'success' : 'default'}>
            {lastResult.isCorrect ? 'Poprawnie' : 'Błędnie'}
          </Badge>
          <p className={styles.answerName}>{countryName}</p>
          {!lastResult.isCorrect && (
            <p className={styles.wrongAnswer}>
              Twoja odpowiedź: <strong>{lastResult.userAnswer || '—'}</strong>
            </p>
          )}
          <Button variant="primary" fullWidth onClick={handleNext}>
            {answers.length + 1 >= questionQueue.length ? 'Zobacz wyniki' : 'Następna flaga'}
          </Button>
        </div>
      ) : (
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <Input
            label="Nazwa kraju"
            placeholder="np. Polska, Germany…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoComplete="off"
            autoFocus
          />
          <Button type="submit" variant="primary" fullWidth disabled={!input.trim()}>
            Zatwierdź odpowiedź
          </Button>
        </form>
      )}

      <TestQuizProgress
        answered={answers.length}
        total={questionQueue.length}
        correct={correctCount}
      />
    </div>
  );
}
