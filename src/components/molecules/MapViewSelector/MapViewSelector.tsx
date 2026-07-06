import type { MapViewScope } from '@/data/continentViews';
import { MAP_VIEW_CONFIGS, MAP_VIEW_ORDER } from '@/data/continentViews';
import styles from './MapViewSelector.module.css';

interface MapViewSelectorProps {
  value: MapViewScope;
  onChange: (scope: MapViewScope) => void;
}

export function MapViewSelector({ value, onChange }: MapViewSelectorProps) {
  return (
    <div className={styles.wrapper} role="group" aria-label="Widok mapy">
      {MAP_VIEW_ORDER.map((scope) => (
        <button
          key={scope}
          type="button"
          className={`${styles.btn} ${value === scope ? styles.active : ''}`}
          onClick={() => onChange(scope)}
        >
          {MAP_VIEW_CONFIGS[scope].label}
        </button>
      ))}
    </div>
  );
}
