import { getFlagUrl } from '@/utils/flags';
import styles from './FlagImage.module.css';

interface FlagImageProps {
  countryId: string;
  alt: string;
  size?: 'compact' | 'default';
}

export function FlagImage({ countryId, alt, size = 'default' }: FlagImageProps) {
  const flagUrl = getFlagUrl(countryId, size === 'compact' ? 480 : 640);

  return (
    <div className={`${styles.wrap} ${styles[size]}`}>
      {flagUrl ? (
        <img src={flagUrl} alt={alt} className={styles.flag} draggable={false} />
      ) : (
        <div className={styles.missing}>Brak flagi</div>
      )}
    </div>
  );
}
