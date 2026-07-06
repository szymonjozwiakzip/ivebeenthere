import styles from './RotatingGlobe.module.css';

export function RotatingGlobe() {
  return (
    <div className={styles.globeWrapper} aria-hidden="true">
      <svg className={styles.globe} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="28" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" />
        <ellipse cx="32" cy="32" rx="28" ry="10" stroke="#2563eb" strokeWidth="0.8" fill="none" />
        <ellipse cx="32" cy="32" rx="28" ry="18" stroke="#2563eb" strokeWidth="0.6" fill="none" />
        <ellipse cx="32" cy="32" rx="28" ry="26" stroke="#2563eb" strokeWidth="0.5" fill="none" opacity="0.5" />
        <line x1="4" y1="32" x2="60" y2="32" stroke="#2563eb" strokeWidth="0.8" />
        <path d="M32 4 Q44 18 32 32 Q20 46 32 60" stroke="#2563eb" strokeWidth="0.7" fill="none" />
        <path d="M32 4 Q20 18 32 32 Q44 46 32 60" stroke="#2563eb" strokeWidth="0.7" fill="none" />
        <path d="M32 4 Q38 20 32 32 Q26 44 32 60" stroke="#2563eb" strokeWidth="0.4" fill="none" opacity="0.6" />
        <path d="M32 4 Q26 20 32 32 Q38 44 32 60" stroke="#2563eb" strokeWidth="0.4" fill="none" opacity="0.6" />
      </svg>
      <div className={styles.shadow} />
    </div>
  );
}
