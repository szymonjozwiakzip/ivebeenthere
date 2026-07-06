import { useState } from 'react';
import { AppHeader } from '@/components/organisms/AppHeader';
import { WorldMap } from '@/components/organisms/WorldMap';
import { CountryPanel } from '@/components/organisms/CountryPanel';
import { StatsPanel } from '@/components/organisms/StatsPanel';
import { ExportPanel } from '@/components/organisms/ExportPanel';
import { TestPanel } from '@/components/organisms/TestPanel';
import { CountryListPanel } from '@/components/organisms/CountryListPanel';
import { MapViewSelector } from '@/components/molecules/MapViewSelector';
import { AppFooter } from '@/components/molecules/AppFooter';
import { useCountryNames } from '@/hooks/useCountryNames';
import { useVisitStore } from '@/store/visitStore';
import { iocToMapIso } from '@/data/countries';
import type { MapViewScope } from '@/data/continentViews';
import styles from './App.module.css';

type Tab = 'map' | 'countries' | 'stats' | 'export' | 'test';

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>('map');
  const [mapView, setMapView] = useState<MapViewScope>('world');
  const countryNames = useCountryNames();
  const setSelectedCountry = useVisitStore((s) => s.setSelectedCountry);

  const handleCountryFromList = (countryId: string) => {
    setSelectedCountry(countryId, {
      mapFeatureId:
        countryId === 'GBR' ? undefined : iocToMapIso(countryId) ?? countryId,
    });
    setActiveTab('map');
  };

  return (
    <div className={styles.app}>
      <div className={styles.container}>
        <AppHeader />

        <nav className={styles.tabs} aria-label="Nawigacja">
          {([
            ['map', 'Mapa'],
            ['countries', 'Kraje'],
            ['stats', 'Statystyki'],
            ['export', 'Eksport'],
            ['test', 'Testy'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`${styles.tab} ${activeTab === id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>

        <main className={styles.main}>
          {activeTab === 'map' && (
            <div className={styles.mapLayout}>
              <div className={styles.mapArea}>
                <MapViewSelector value={mapView} onChange={setMapView} />
                <WorldMap mapView={mapView} />
              </div>
              <aside className={styles.sidebar}>
                <CountryPanel countryNames={countryNames} />
              </aside>
            </div>
          )}

          {activeTab === 'countries' && (
            <CountryListPanel
              countryNames={countryNames}
              onSelectCountry={handleCountryFromList}
            />
          )}

          {activeTab === 'stats' && <StatsPanel />}
          {activeTab === 'export' && <ExportPanel />}
          {activeTab === 'test' && <TestPanel countryNames={countryNames} />}
        </main>

        <AppFooter />
      </div>
    </div>
  );
}
