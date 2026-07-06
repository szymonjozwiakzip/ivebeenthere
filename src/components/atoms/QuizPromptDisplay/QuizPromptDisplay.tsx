import styles from './QuizPromptDisplay.module.css';

interface QuizPromptDisplayProps {
  label: string;
  size?: 'default' | 'compact';
}

export function QuizPromptDisplay({ label, size = 'default' }: QuizPromptDisplayProps) {
  return (
    <div className={`${styles.wrap} ${styles[size]}`}>
      <p className={styles.label}>{label}</p>
    </div>
  );
}
