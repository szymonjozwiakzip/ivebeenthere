import { useState, useEffect } from 'react';
import { feature } from 'topojson-client';
import type { Topology } from 'topojson-specification';
import { MAP_URL } from '@/data/constants';
import {
  HIDDEN_MAP_COUNTRY_NAMES,
  UK_CONSTITUENT_SOURCES,
  type MapFeatureCollection,
} from '@/data/mapConfig';
import { COUNTRY_NAME_TO_ISO } from '@/data/countryNames';

function enrichProperties(
  properties: Record<string, string | undefined>,
): Record<string, string | undefined> {
  const name = properties.name ?? properties.NAME ?? '';
  const existingIso = properties.ISO_A3 ?? properties.iso_a3;
  const isoFromName =
    name && name in COUNTRY_NAME_TO_ISO ? COUNTRY_NAME_TO_ISO[name] : undefined;
  const iso =
    existingIso && existingIso !== '-99' ? existingIso : isoFromName;

  return {
    ...properties,
    ...(name ? { name } : {}),
    ...(iso ? { ISO_A3: iso } : {}),
  };
}

let cachedGeography: MapFeatureCollection | null = null;
let cachePromise: Promise<MapFeatureCollection> | null = null;

/** Wyczyść cache po zmianie logiki mapowania (dev/hot reload) */
export function clearMapGeographyCache(): void {
  cachedGeography = null;
  cachePromise = null;
}

async function loadUkConstituent(
  source: (typeof UK_CONSTITUENT_SOURCES)[number],
): Promise<GeoJSON.Feature<GeoJSON.Geometry, Record<string, string | undefined>>> {
  const response = await fetch(source.url);
  const topology = (await response.json()) as Topology;
  const objectKey = Object.keys(topology.objects)[0];
  const result = feature(
    topology,
    topology.objects[objectKey] as Parameters<typeof feature>[1],
  );

  const geometry =
    result.type === 'Feature'
      ? result.geometry
      : result.type === 'FeatureCollection'
        ? result.features[0]?.geometry
        : null;

  if (!geometry) {
    throw new Error(`Missing geometry for ${source.name}`);
  }

  return {
    type: 'Feature',
    properties: { name: source.name, ISO_A3: source.id },
    geometry,
  };
}

export async function loadMapFeatureCollection(): Promise<MapFeatureCollection> {
  if (cachedGeography) return cachedGeography;
  if (cachePromise) return cachePromise;

  cachePromise = (async () => {
    const worldResponse = await fetch(MAP_URL);
    const worldTopology = (await worldResponse.json()) as Topology;
    const worldCollection = feature(
      worldTopology,
      worldTopology.objects.countries as Parameters<typeof feature>[1],
    );

    if (worldCollection.type !== 'FeatureCollection') {
      throw new Error('Expected world countries FeatureCollection');
    }

    const features = worldCollection.features
      .filter((f) => {
        const name = f.properties?.name ?? f.properties?.NAME ?? '';
        return !HIDDEN_MAP_COUNTRY_NAMES.has(String(name));
      })
      .map((f) => ({
        ...f,
        properties: enrichProperties(f.properties as Record<string, string | undefined>),
      }));

    const ukFeatures = await Promise.all(
      UK_CONSTITUENT_SOURCES.map((source) => loadUkConstituent(source)),
    );

    const merged: MapFeatureCollection = {
      type: 'FeatureCollection',
      features: [...features, ...ukFeatures],
    };

    cachedGeography = merged;
    return merged;
  })();

  return cachePromise;
}

export function useMapGeography() {
  const [geography, setGeography] = useState<MapFeatureCollection | null>(cachedGeography);
  const [loading, setLoading] = useState(!cachedGeography);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedGeography) {
      setGeography(cachedGeography);
      setLoading(false);
      return;
    }

    loadMapFeatureCollection()
      .then((data) => {
        setGeography(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Nie udało się załadować mapy');
        setLoading(false);
      });
  }, []);

  return { geography, loading, error };
}
