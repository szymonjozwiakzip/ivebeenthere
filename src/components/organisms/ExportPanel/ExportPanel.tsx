import { useRef, useState, useMemo } from 'react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { WorldMap } from '@/components/organisms/WorldMap';
import { CONTINENT_LABELS, CONTINENT_ORDER } from '@/data/constants';
import { useVisitStore } from '@/store/visitStore';
import type { ExportScope, ExportYearFilter } from '@/types';
import {
  filterVisitsByScope,
  filterVisitsByYear,
  getVisitYears,
  getVisitedIds,
  getWorldStats,
  computeContinentStats,
} from '@/utils/stats';
import { exportAsPng, exportAsPdf } from '@/utils/export';
import styles from './ExportPanel.module.css';

export function ExportPanel() {
  const visits = useVisitStore((s) => s.visits);
  const exportRef = useRef<HTMLDivElement>(null);
  const [scope, setScope] = useState<ExportScope>('world');
  const [yearFilter, setYearFilter] = useState<ExportYearFilter>('all');
  const [title, setTitle] = useState("I've been there");
  const [subtitle, setSubtitle] = useState('Moja mapa podróży');
  const [exporting, setExporting] = useState(false);

  const years = useMemo(() => getVisitYears(visits), [visits]);

  const filteredVisits = useMemo(() => {
    let result = filterVisitsByYear(visits, yearFilter);
    result = filterVisitsByScope(result, scope);
    return result;
  }, [visits, yearFilter, scope]);

  const stats = useMemo(() => {
    const ids = getVisitedIds(filteredVisits);
    if (scope === 'world') return getWorldStats(ids);
    const continentStat = computeContinentStats(ids).find((s) => s.continent === scope);
    return continentStat
      ? { visited: continentStat.visited, total: continentStat.total, percentage: continentStat.percentage }
      : getWorldStats(ids);
  }, [filteredVisits, scope]);

  const scopeLabel =
    scope === 'world' ? 'Świat' : CONTINENT_LABELS[scope];
  const yearLabel = yearFilter === 'all' ? 'All time' : String(yearFilter);

  const handleExport = async (format: 'png' | 'pdf') => {
    if (!exportRef.current) return;
    setExporting(true);
    try {
      const filename = `ive-been-there-${scope}-${yearLabel}`.toLowerCase().replace(/\s+/g, '-');
      if (format === 'png') {
        await exportAsPng(exportRef.current, filename);
      } else {
        await exportAsPdf(exportRef.current, filename);
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <section className={styles.panel} aria-label="Eksport mapy">
      <h2 className={styles.heading}>Eksport</h2>
      <p className={styles.description}>
        Wygeneruj obraz lub PDF swojej mapy podróży z wybranym zakresem i okresem.
      </p>

      <div className={styles.controls}>
        <Select
          label="Zakres"
          value={scope}
          onChange={(e) => setScope(e.target.value as ExportScope)}
        >
          <option value="world">Świat</option>
          {CONTINENT_ORDER.filter((c) => c !== 'antarctica').map((c) => (
            <option key={c} value={c}>
              {CONTINENT_LABELS[c]}
            </option>
          ))}
        </Select>

        <Select
          label="Rok"
          value={String(yearFilter)}
          onChange={(e) => {
            const val = e.target.value;
            setYearFilter(val === 'all' ? 'all' : parseInt(val, 10));
          }}
        >
          <option value="all">All time</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>

        <Input
          label="Tytuł"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="I've been there"
        />

        <Input
          label="Podtytuł"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Moja mapa podróży"
        />
      </div>

      <div className={styles.exportPreview} ref={exportRef}>
        <div className={styles.exportHeader}>
          <h3 className={styles.exportTitle}>{title || "I've been there"}</h3>
          {subtitle && <p className={styles.exportSubtitle}>{subtitle}</p>}
          <div className={styles.exportMeta}>
            <span>{scopeLabel}</span>
            <span>•</span>
            <span>{yearLabel}</span>
            <span>•</span>
            <span>
              {stats.visited}/{stats.total} krajów ({stats.percentage}%)
            </span>
          </div>
        </div>
        <WorldMap
          visits={filteredVisits}
          mapView={scope === 'world' ? 'world' : scope}
          interactive={false}
          showPhotos
          showZoomControls={false}
        />
      </div>

      <div className={styles.exportActions}>
        <Button
          variant="primary"
          onClick={() => handleExport('png')}
          disabled={exporting || filteredVisits.length === 0}
        >
          {exporting ? 'Eksportuję…' : 'Eksportuj PNG'}
        </Button>
        <Button
          variant="secondary"
          onClick={() => handleExport('pdf')}
          disabled={exporting || filteredVisits.length === 0}
        >
          Eksportuj PDF
        </Button>
      </div>
    </section>
  );
}
