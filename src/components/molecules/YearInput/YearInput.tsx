import { Input } from '@/components/atoms/Input';
import styles from './YearInput.module.css';

interface YearInputProps {
  value?: number;
  onChange: (year?: number) => void;
}

const currentYear = new Date().getFullYear();

export function YearInput({ value, onChange }: YearInputProps) {
  return (
    <div className={styles.wrapper}>
      <Input
        label="Rok wizyty (opcjonalnie)"
        type="number"
        min={1900}
        max={currentYear}
        placeholder={`np. ${currentYear}`}
        value={value ?? ''}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val ? parseInt(val, 10) : undefined);
        }}
      />
    </div>
  );
}
