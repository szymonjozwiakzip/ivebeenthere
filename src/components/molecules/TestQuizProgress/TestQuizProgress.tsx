import styles from './TestQuizProgress.module.css';

interface TestQuizProgressProps {
  answered: number;
  total: number;
  correct: number;
}

export function TestQuizProgress({ answered, total, correct }: TestQuizProgressProps) {
  return (
    <div className={styles.progress}>
      <div className={styles.progressItem}>
        <span className={styles.progressLabel}>Odpowiedzi</span>
        <span className={styles.progressValue}>
          {answered} / {total}
        </span>
      </div>
      <div className={styles.progressItem}>
        <span className={styles.progressLabel}>Poprawne</span>
        <span className={`${styles.progressValue} ${styles.correct}`}>{correct}</span>
      </div>
    </div>
  );
}
