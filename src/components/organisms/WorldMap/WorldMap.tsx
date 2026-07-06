import { useMemo, useState, useCallback, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import type { MapViewScope } from '@/data/continentViews';
import { MAP_VIEW_CONFIGS } from '@/data/continentViews';
import {
  isMapFeatureVisited,
  isSelectableMapFeature,
  isUkConstituent,
  mapFeatureToIoc,
  resolveMapFeatureFromProps,
} from '@/data/countries';
import { useVisitStore } from '@/store/visitStore';
import { useMapGeography } from '@/hooks/useMapGeography';
import { ZoomControls } from '@/components/atoms/ZoomControls';
import { belongsToMapView, getCountryMapStyle } from '@/utils/mapStyles';
import type { Visit } from '@/types';
import styles from './WorldMap.module.css';

interface WorldMapProps {
  visits?: Visit[];
  mapView?: MapViewScope;
  interactive?: boolean;
  showPhotos?: boolean;
  showZoomControls?: boolean;
}

interface MapPosition {
  coordinates: [number, number];
  zoom: number;
}

function resolveMapFeatureId(properties: Record<string, string | undefined>): string {
  return resolveMapFeatureFromProps(properties);
}

function filterByMapView(
  features: GeoJSON.Feature[],
  mapView: MapViewScope,
): GeoJSON.Feature[] {
  if (mapView === 'world') return features;
  return features.filter((f) =>
    belongsToMapView(resolveMapFeatureId(f.properties ?? {}), mapView),
  );
}

function getCountryPhoto(
  mapFeatureId: string,
  visits: Visit[],
  selectedMapFeatureId: string | null,
  selectionDraft: { photo?: string },
): string | undefined {
  const ioc = mapFeatureToIoc(mapFeatureId);
  if (!ioc) return undefined;

  const visit = visits.find((v) => v.countryId === ioc);
  if (visit?.photo && isMapFeatureVisited(mapFeatureId, visits)) return visit.photo;

  if (
    mapFeatureId === selectedMapFeatureId &&
    !isMapFeatureVisited(mapFeatureId, visits) &&
    selectionDraft.photo
  ) {
    return selectionDraft.photo;
  }

  return undefined;
}

function isMapFeatureSelected(
  mapFeatureId: string,
  selectedCountryId: string | null,
  selectedMapFeatureId: string | null,
): boolean {
  if (selectedMapFeatureId) return selectedMapFeatureId === mapFeatureId;
  const ioc = mapFeatureToIoc(mapFeatureId);
  if (!ioc || !selectedCountryId) return false;
  return ioc === selectedCountryId && mapFeatureToIoc(mapFeatureId) === selectedCountryId;
}

export function WorldMap({
  visits: visitsProp,
  mapView = 'world',
  interactive = true,
  showPhotos = true,
  showZoomControls = true,
}: WorldMapProps) {
  const storeVisits = useVisitStore((s) => s.visits);
  const setSelectedCountry = useVisitStore((s) => s.setSelectedCountry);
  const selectedCountryId = useVisitStore((s) => s.selectedCountryId);
  const selectedMapFeatureId = useVisitStore((s) => s.selectedMapFeatureId);
  const selectionDraft = useVisitStore((s) => s.selectionDraft);
  const { geography, loading, error } = useMapGeography();

  const visits = visitsProp ?? storeVisits;
  const viewConfig = MAP_VIEW_CONFIGS[mapView];

  const [position, setPosition] = useState<MapPosition>({
    coordinates: viewConfig.center,
    zoom: viewConfig.defaultZoom,
  });

  useEffect(() => {
    setPosition({
      coordinates: viewConfig.center,
      zoom: viewConfig.defaultZoom,
    });
  }, [mapView, viewConfig.center, viewConfig.defaultZoom]);

  useEffect(() => {
    if (mapView === 'world' || !selectedMapFeatureId) return;
    if (!belongsToMapView(selectedMapFeatureId, mapView)) {
      setSelectedCountry(null);
    }
  }, [mapView, selectedMapFeatureId, setSelectedCountry]);

  const visibleFeatures = useMemo(() => {
    if (!geography) return [];
    return filterByMapView(geography.features, mapView);
  }, [geography, mapView]);

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

  if (loading) {
    return <div className={styles.mapContainer}><p className={styles.hint}>Ładowanie mapy…</p></div>;
  }

  if (error || !geography) {
    return <div className={styles.mapContainer}><p className={styles.hint}>{error ?? 'Błąd mapy'}</p></div>;
  }

  return (
    <div className={styles.mapContainer}>
      {mapView !== 'world' && (
        <div className={styles.continentLabel}>{viewConfig.label}</div>
      )}

      {showZoomControls && interactive && (
        <ZoomControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleReset}
        />
      )}

      <ComposableMap
        key={mapView}
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
            {({ geographies }) => (
              <>
                {showPhotos && (
                  <defs>
                    {geographies.map((geo) => {
                      const mapFeatureId = resolveMapFeatureId(geo.properties);
                      const photo = getCountryPhoto(
                        mapFeatureId,
                        visits,
                        selectedMapFeatureId,
                        selectionDraft,
                      );
                      if (!photo) return null;

                      const isPreview =
                        mapFeatureId === selectedMapFeatureId &&
                        !isMapFeatureVisited(mapFeatureId, visits);

                      return (
                        <pattern
                          key={`pattern-${mapFeatureId}`}
                          id={`country-photo-${mapFeatureId}`}
                          patternContentUnits="objectBoundingBox"
                          width="1"
                          height="1"
                        >
                          <image
                            href={photo}
                            x="0"
                            y="0"
                            width="1"
                            height="1"
                            preserveAspectRatio="xMidYMid slice"
                            opacity={isPreview ? 0.75 : 1}
                          />
                        </pattern>
                      );
                    })}
                  </defs>
                )}

                {geographies.map((geo) => {
                  const mapFeatureId = resolveMapFeatureId(geo.properties);
                  const selectable = isSelectableMapFeature(mapFeatureId);
                  const visited = isMapFeatureVisited(mapFeatureId, visits);
                  const isSelected = isMapFeatureSelected(
                    mapFeatureId,
                    selectedCountryId,
                    selectedMapFeatureId,
                  );
                  const photo = showPhotos
                    ? getCountryPhoto(
                        mapFeatureId,
                        visits,
                        selectedMapFeatureId,
                        selectionDraft,
                      )
                    : undefined;
                  const mapStyle = getCountryMapStyle(visited, isSelected);
                  const fill = photo
                    ? `url(#country-photo-${mapFeatureId})`
                    : selectable
                      ? mapStyle.fill
                      : '#d8e2ed';

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fill}
                      stroke={mapStyle.stroke}
                      strokeWidth={photo ? 0.6 : mapStyle.strokeWidth}
                      opacity={selectable ? mapStyle.opacity : 0.45}
                      onClick={() => {
                        if (!interactive || !selectable) return;
                        const ioc = mapFeatureToIoc(mapFeatureId);
                        if (!ioc) return;
                        setSelectedCountry(ioc, {
                          mapFeatureId,
                          ukRegions: isUkConstituent(mapFeatureId)
                            ? [mapFeatureId]
                            : undefined,
                        });
                      }}
                      style={{
                        default: { outline: 'none', transition: 'fill 0.2s, opacity 0.2s' },
                        hover: {
                          fill: photo ? fill : selectable ? mapStyle.hoverFill : fill,
                          outline: 'none',
                          cursor: interactive && selectable ? 'pointer' : 'default',
                          opacity: selectable ? Math.min(mapStyle.opacity + 0.1, 1) : 0.45,
                        },
                        pressed: { outline: 'none' },
                      }}
                    />
                  );
                })}
              </>
            )}
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      <p className={styles.hint}>
        Scroll / pinch aby przybliżyć · Przeciągnij aby przesunąć mapę
      </p>
    </div>
  );
}
