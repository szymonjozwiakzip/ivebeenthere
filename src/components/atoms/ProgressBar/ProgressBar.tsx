import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  value: number;
  label?: string;
  color?: string;
}

export function ProgressBar({ value, label, color = '#3b82f6' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={styles.wrapper}>
      {label && (
        <div className={styles.header}>
          <span className={styles.label}>{label}</span>
          <span className={styles.value}>{clamped}%</span>
        </div>
      )}
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${clamped}%`, background: color }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
