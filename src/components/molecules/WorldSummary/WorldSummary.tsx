import { Badge } from '@/components/atoms/Badge';
import styles from './WorldSummary.module.css';

interface WorldSummaryProps {
  visited: number;
  total: number;
  percentage: number;
}

export function WorldSummary({ visited, total, percentage }: WorldSummaryProps) {
  return (
    <div className={styles.summary}>
      <div className={styles.ring}>
        <svg viewBox="0 0 80 80" className={styles.svg}>
          <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="6" />
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 2.136} 213.6`}
            transform="rotate(-90 40 40)"
          />
        </svg>
        <span className={styles.percent}>{percentage}%</span>
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>Świat</h3>
        <p className={styles.detail}>
          Odwiedziłeś <strong>{visited}</strong> z <strong>{total}</strong> krajów
        </p>
        <Badge variant="accent">{`${visited} krajów`}</Badge>
      </div>
    </div>
  );
}
