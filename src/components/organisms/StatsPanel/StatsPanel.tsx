import { useMemo } from 'react';
import { ContinentStatCard } from '@/components/molecules/ContinentStatCard';
import { WorldSummary } from '@/components/molecules/WorldSummary';
import { useVisitStore } from '@/store/visitStore';
import { computeContinentStats, getVisitedIds, getWorldStats } from '@/utils/stats';
import styles from './StatsPanel.module.css';

export function StatsPanel() {
  const visits = useVisitStore((s) => s.visits);

  const visitedIds = useMemo(() => getVisitedIds(visits), [visits]);
  const continentStats = useMemo(() => computeContinentStats(visitedIds), [visitedIds]);
  const worldStats = useMemo(() => getWorldStats(visitedIds), [visitedIds]);

  return (
    <section className={styles.panel} aria-label="Statystyki podróży">
      <h2 className={styles.heading}>Statystyki</h2>
      <WorldSummary
        visited={worldStats.visited}
        total={worldStats.total}
        percentage={worldStats.percentage}
      />
      <div className={styles.continents}>
        <h3 className={styles.subheading}>Per kontynent</h3>
        <div className={styles.grid}>
          {continentStats
            .filter((s) => s.continent !== 'antarctica')
            .map((stats) => (
              <ContinentStatCard key={stats.continent} stats={stats} />
            ))}
        </div>
      </div>
    </section>
  );
}
