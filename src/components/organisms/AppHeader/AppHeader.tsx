import { Globe3D } from '@/components/atoms/Globe3D';
import styles from './AppHeader.module.css';

export function AppHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <Globe3D size={72} />
        <div className={styles.titles}>
          <h1 className={styles.title}>I've been there</h1>
          <p className={styles.subtitle}>Twoja osobista mapa podróży</p>
        </div>
      </div>
    </header>
  );
}
