import { useMemo, useState, useCallback, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import {
  isSelectableMapFeature,
  mapFeatureToIoc,
  resolveMapFeatureFromProps,
} from '@/data/countries';
import { ZoomControls } from '@/components/atoms/ZoomControls';
import { useTestStore } from '@/store/testStore';
import { useMapGeography } from '@/hooks/useMapGeography';
import { getMapConfigForScope, isFeatureInTestScope } from '@/utils/testScope';
import { getTestCountryStyle } from '@/utils/testMapStyles';
import type { TestConfig } from '@/types/test';
import type { TestCountryStatus } from '@/utils/testMapStyles';
import styles from './TestMap.module.css';

function resolveMapFeatureId(properties: Record<string, string | undefined>): string {
  return resolveMapFeatureFromProps(properties);
}

interface TestMapProps {
  scope: TestConfig['scope'];
  flagMapMode?: boolean;
  onFlagMapClick?: (ioc: string) => void;
  pendingClickId?: string | null;
}

export function TestMap({
  scope,
  flagMapMode = false,
  onFlagMapClick,
  pendingClickId = null,
}: TestMapProps) {
  const selectedCountryId = useTestStore((s) => s.selectedCountryId);
  const selectCountry = useTestStore((s) => s.selectCountry);
  const getAnswerForCountry = useTestStore((s) => s.getAnswerForCountry);
  const isCountryAnswered = useTestStore((s) => s.isCountryAnswered);
  const { geography, loading, error } = useMapGeography();

  const viewConfig = getMapConfigForScope(scope);
  const scopeKey = scope === 'world' ? 'world' : scope.join(',');

  const [position, setPosition] = useState({
    coordinates: viewConfig.center,
    zoom: viewConfig.defaultZoom,
  });

  useEffect(() => {
    setPosition({
      coordinates: viewConfig.center,
      zoom: viewConfig.defaultZoom,
    });
  }, [scopeKey, viewConfig.center, viewConfig.defaultZoom]);

  const visibleFeatures = useMemo(() => {
    if (!geography) return [];
    return geography.features.filter((f) => {
      const mapFeatureId = resolveMapFeatureId(f.properties ?? {});
      return isFeatureInTestScope(mapFeatureId, scope);
    });
  }, [geography, scope]);

  const getStatus = useCallback(
    (mapFeatureId: string): TestCountryStatus => {
      const ioc = mapFeatureToIoc(mapFeatureId);
      if (!ioc) return 'pending';
      if (!flagMapMode && ioc === selectedCountryId) return 'selected';
      if (flagMapMode && pendingClickId === ioc) return 'selected';
      const answer = getAnswerForCountry(ioc);
      if (answer?.isCorrect) return 'correct';
      if (answer) return 'incorrect';
      return 'pending';
    },
    [selectedCountryId, pendingClickId, flagMapMode, getAnswerForCountry],
  );

  const handleZoomIn = useCallback(() => {
    setPosition((p) => ({ ...p, zoom: Math.min(p.zoom * 1.4, 12) }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setPosition((p) => ({ ...p, zoom: Math.max(p.zoom / 1.4, 0.6) }));
  }, []);

  const handleReset = useCallback(() => {
    setPosition({
      coordinates: viewConfig.center,
      zoom: viewConfig.defaultZoom,
    });
  }, [viewConfig.center, viewConfig.defaultZoom]);

  const scopeLabel = useMemo(() => {
    if (scope === 'world') return 'Świat';
    if (scope.length === 1) return viewConfig.label;
    return `${scope.length} kontynenty`;
  }, [scope, viewConfig.label]);

  if (loading) {
    return <div className={styles.mapContainer}><p className={styles.legend}>Ładowanie mapy…</p></div>;
  }

  if (error || !geography) {
    return <div className={styles.mapContainer}><p className={styles.legend}>{error ?? 'Błąd mapy'}</p></div>;
  }

  return (
    <div className={styles.mapContainer}>
      <div className={styles.scopeLabel}>{scopeLabel}</div>

      <ZoomControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
      />

      <ComposableMap
        key={scopeKey}
        projection={viewConfig.projection}
        projectionConfig={{
          scale: viewConfig.scale,
          center: viewConfig.center,
        }}
        className={styles.map}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={setPosition}
          minZoom={0.6}
          maxZoom={12}
        >
          <Geographies geography={{ type: 'FeatureCollection', features: visibleFeatures }}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const mapFeatureId = resolveMapFeatureId(geo.properties ?? {});
                const ioc = mapFeatureToIoc(mapFeatureId);
                if (!ioc || !isSelectableMapFeature(mapFeatureId)) return null;
                const status = getStatus(mapFeatureId);
                const style = getTestCountryStyle(status);
                const answered = isCountryAnswered(ioc);
                const canClick = flagMapMode
                  ? !answered && !pendingClickId
                  : !answered || ioc === selectedCountryId;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={style.fill}
                    stroke={style.stroke}
                    strokeWidth={style.strokeWidth}
                    onClick={() => {
                      if (flagMapMode) {
                        if (!canClick || !onFlagMapClick) return;
                        onFlagMapClick(ioc);
                        return;
                      }
                      if (answered && ioc !== selectedCountryId) return;
                      selectCountry(ioc);
                    }}
                    style={{
                      default: { outline: 'none', transition: 'fill 0.2s' },
                      hover: {
                        fill: style.hover,
                        outline: 'none',
                        cursor: canClick ? 'pointer' : 'default',
                      },
                      pressed: { outline: 'none' },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      <div className={styles.legend}>
        <span className={styles.legendItem}><i className={styles.dotPending} /> do zgadnięcia</span>
        <span className={styles.legendItem}><i className={styles.dotCorrect} /> poprawnie</span>
        <span className={styles.legendItem}><i className={styles.dotIncorrect} /> błędnie</span>
      </div>
    </div>
  );
}
