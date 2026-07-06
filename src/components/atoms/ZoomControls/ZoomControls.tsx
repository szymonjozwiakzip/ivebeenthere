import styles from './ZoomControls.module.css';

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function ZoomControls({ onZoomIn, onZoomOut, onReset }: ZoomControlsProps) {
  return (
    <div className={styles.controls}>
      <button type="button" className={styles.btn} onClick={onZoomIn} aria-label="Przybliż">
        +
      </button>
      <button type="button" className={styles.btn} onClick={onZoomOut} aria-label="Oddal">
        −
      </button>
      <button type="button" className={styles.btn} onClick={onReset} aria-label="Resetuj widok">
        ⟲
      </button>
    </div>
  );
}
