import type { UkRegion } from '@/types';
import { UK_REGION_LABELS } from '@/data/countries';
import styles from './UkRegionPicker.module.css';

const ALL_REGIONS: UkRegion[] = ['ENG', 'SCT', 'WLS', 'NIR'];

interface UkRegionPickerProps {
  value: UkRegion[] | undefined;
  onChange: (regions: UkRegion[] | undefined) => void;
  disabled?: boolean;
}

export function UkRegionPicker({ value, onChange, disabled }: UkRegionPickerProps) {
  const isWholeUk = !value || value.length === 0;

  const toggleRegion = (region: UkRegion) => {
    if (disabled) return;
    const current = new Set(value ?? []);
    if (current.has(region)) {
      current.delete(region);
    } else {
      current.add(region);
    }
    const next = [...current];
    onChange(next.length === 0 ? undefined : next);
  };

  const selectWholeUk = () => {
    if (disabled) return;
    onChange(undefined);
  };

  return (
    <fieldset className={styles.fieldset} disabled={disabled}>
      <legend className={styles.legend}>Które części UK?</legend>
      <p className={styles.hint}>
        Opcjonalnie — zostaw puste, jeśli byłeś w całej Wielkiej Brytanii lub nie chcesz
        rozróżniać.
      </p>
      <div className={styles.options}>
        <button
          type="button"
          className={`${styles.option} ${isWholeUk ? styles.optionActive : ''}`}
          onClick={selectWholeUk}
        >
          Cała Wielka Brytania
        </button>
        {ALL_REGIONS.map((region) => {
          const active = !isWholeUk && value?.includes(region);
          return (
            <button
              key={region}
              type="button"
              className={`${styles.option} ${active ? styles.optionActive : ''}`}
              onClick={() => toggleRegion(region)}
            >
              {UK_REGION_LABELS[region]}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
