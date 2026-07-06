import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { YearInput } from '@/components/molecules/YearInput';
import { PhotoUpload } from '@/components/molecules/PhotoUpload';
import { CountrySearch } from '@/components/molecules/CountrySearch';
import { UkRegionPicker } from '@/components/molecules/UkRegionPicker';
import { getContinent, UK_REGION_LABELS } from '@/data/countries';
import { CONTINENT_LABELS } from '@/data/constants';
import { useVisitStore } from '@/store/visitStore';
import styles from './CountryPanel.module.css';

interface CountryPanelProps {
  countryNames: Map<string, string>;
}

function formatUkRegions(regions: string[] | undefined): string | null {
  if (!regions || regions.length === 0) return null;
  return regions.map((r) => UK_REGION_LABELS[r as keyof typeof UK_REGION_LABELS] ?? r).join(', ');
}

export function CountryPanel({ countryNames }: CountryPanelProps) {
  const selectedCountryId = useVisitStore((s) => s.selectedCountryId);
  const setSelectedCountry = useVisitStore((s) => s.setSelectedCountry);
  const isVisited = useVisitStore((s) => s.isVisited);
  const selectionDraft = useVisitStore((s) => s.selectionDraft);
  const setSelectionDraft = useVisitStore((s) => s.setSelectionDraft);
  const addVisit = useVisitStore((s) => s.addVisit);
  const removeVisit = useVisitStore((s) => s.removeVisit);
  const setVisitYear = useVisitStore((s) => s.setVisitYear);
  const setVisitPhoto = useVisitStore((s) => s.setVisitPhoto);
  const getVisit = useVisitStore((s) => s.getVisit);

  const countryName = selectedCountryId
    ? countryNames.get(selectedCountryId) ?? selectedCountryId
    : null;
  const visited = selectedCountryId ? isVisited(selectedCountryId) : false;
  const continent = selectedCountryId ? getContinent(selectedCountryId) : null;
  const visit = selectedCountryId ? getVisit(selectedCountryId) : undefined;

  const year = visited ? visit?.year : selectionDraft.year;
  const photo = visited ? visit?.photo : selectionDraft.photo;
  const ukRegions = visited ? visit?.ukRegions : selectionDraft.ukRegions;
  const regionLabel = selectedCountryId === 'GBR' ? formatUkRegions(ukRegions) : null;

  const handleYearChange = (newYear?: number) => {
    if (!selectedCountryId) return;
    if (visited) {
      setVisitYear(selectedCountryId, newYear);
    } else {
      setSelectionDraft({ year: newYear });
    }
  };

  const handlePhotoChange = (newPhoto?: string) => {
    if (!selectedCountryId) return;
    if (visited) {
      setVisitPhoto(selectedCountryId, newPhoto);
    } else {
      setSelectionDraft({ photo: newPhoto });
    }
  };

  const handleUkRegionsChange = (regions: typeof ukRegions) => {
    if (!selectedCountryId || selectedCountryId !== 'GBR') return;
    if (visited) {
      addVisit('GBR', { ukRegions: regions, year, photo });
    } else {
      setSelectionDraft({ ukRegions: regions });
    }
  };

  const handleConfirm = () => {
    if (!selectedCountryId) return;
    addVisit(selectedCountryId, { year, photo, ukRegions });
  };

  return (
    <div className={styles.panel}>
      <CountrySearch countryNames={countryNames} />

      {!selectedCountryId || !countryName ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🗺️</span>
          <h3 className={styles.emptyTitle}>Wybierz kraj</h3>
          <p className={styles.emptyText}>
            Wpisz nazwę powyżej lub kliknij kraj na mapie, uzupełnij szczegóły i oznacz jako
            dodany
          </p>
        </div>
      ) : (
        <>
          <div className={styles.header}>
            <div>
              <h3 className={styles.countryName}>{countryName}</h3>
              {regionLabel && <p className={styles.regionLabel}>{regionLabel}</p>}
              {continent && (
                <Badge variant={visited ? 'success' : 'default'}>
                  {visited ? 'Odwiedzony' : CONTINENT_LABELS[continent]}
                </Badge>
              )}
            </div>
            <button
              type="button"
              className={styles.close}
              onClick={() => setSelectedCountry(null)}
              aria-label="Zamknij"
            >
              ✕
            </button>
          </div>

          <div className={styles.form}>
            {selectedCountryId === 'GBR' && (
              <UkRegionPicker
                value={ukRegions}
                onChange={handleUkRegionsChange}
              />
            )}
            <YearInput value={year} onChange={handleYearChange} />
            <PhotoUpload photo={photo} onPhotoChange={handlePhotoChange} />
          </div>

          <div className={styles.footer}>
            {visited ? (
              <Button variant="danger" fullWidth onClick={() => removeVisit(selectedCountryId)}>
                Usuń z listy
              </Button>
            ) : (
              <Button variant="primary" fullWidth onClick={handleConfirm}>
                Oznacz jako dodane
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
