import styles from './AppFooter.module.css';

export function AppFooter() {
  return (
    <footer className={styles.footer}>
      <p className={styles.tagline}>I've been there — Twoje podróże, Twoja mapa.</p>
      <p className={styles.copyright}>© 2026 I've been there. Wszelkie prawa zastrzeżone.</p>
    </footer>
  );
}
