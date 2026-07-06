import { useRef } from 'react';
import { Button } from '@/components/atoms/Button';
import { readFileAsDataUrl } from '@/utils/export';
import styles from './PhotoUpload.module.css';

interface PhotoUploadProps {
  photo?: string;
  onPhotoChange: (photo?: string) => void;
  label?: string;
}

export function PhotoUpload({ photo, onPhotoChange, label = 'Zdjęcie z podróży' }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const dataUrl = await readFileAsDataUrl(file);
    onPhotoChange(dataUrl);
    e.target.value = '';
  };

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>{label}</span>
      {photo ? (
        <div className={styles.preview}>
          <img src={photo} alt="Podgląd zdjęcia" className={styles.image} />
          <div className={styles.actions}>
            <Button variant="secondary" onClick={() => inputRef.current?.click()}>
              Zmień
            </Button>
            <Button variant="danger" onClick={() => onPhotoChange(undefined)}>
              Usuń
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={styles.dropzone}
          onClick={() => inputRef.current?.click()}
        >
          <span className={styles.dropzoneIcon}>📷</span>
          <span className={styles.dropzoneText}>Wybierz zdjęcie z komputera</span>
          <span className={styles.dropzoneHint}>PNG, JPG do 5 MB</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className={styles.hidden}
        onChange={handleFileChange}
      />
    </div>
  );
}
