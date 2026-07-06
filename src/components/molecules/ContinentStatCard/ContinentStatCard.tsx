import { CONTINENT_COLORS } from '@/data/continentColors';
import { CONTINENT_LABELS } from '@/data/constants';
import type { ContinentStats } from '@/types';
import { ProgressBar } from '@/components/atoms/ProgressBar';
import styles from './ContinentStatCard.module.css';

interface ContinentStatCardProps {
  stats: ContinentStats;
}

export function ContinentStatCard({ stats }: ContinentStatCardProps) {
  const label = CONTINENT_LABELS[stats.continent];
  const color = CONTINENT_COLORS[stats.continent];

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.name}>{label}</span>
        <span className={styles.count}>
          {stats.visited}/{stats.total}
        </span>
      </div>
      <ProgressBar value={stats.percentage} color={color} />
    </div>
  );
}
