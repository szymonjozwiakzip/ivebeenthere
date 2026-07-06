import styles from './TestTimer.module.css';

interface TestTimerProps {
  time: string;
  mode: 'count-up' | 'countdown';
}

export function TestTimer({ time, mode }: TestTimerProps) {
  return (
    <div className={styles.timer} aria-live="polite">
      <span className={styles.label}>{mode === 'countdown' ? 'Pozostało' : 'Czas'}</span>
      <span className={styles.value}>{time}</span>
    </div>
  );
}
